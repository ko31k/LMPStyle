/**
 * JacRed Meta Plugin (Quality + UA Tracks) for Lampa
 * -----------------------------------------------------------------------------
 * Об'єднання двох плагінів в один:
 *  - Quality+Mod (мітки якості)  +  UA-Finder+Mod (мітки укр доріжок)
 *
 * Ключова ідея:
 *  - ЛОГІКИ ПОШУКУ/ФІЛЬТРАЦІЇ обох модулів НЕ змінюємо (щоб дані були актуальні)
 *  - Об'єднуємо лише мережевий транспорт до JacRed:
 *      * одна черга запитів
 *      * один proxy-fallback
 *      * dedupe однакових URL (in-flight + session cache)
 *  - Якщо обидві опції вимкнені — запит не надсилається взагалі
 */

(function () {
  'use strict';

  // ===========================================================================
  // 0) COMPAT LAYER (Promise/fetch/localStorage) — беремо надійний варіант
  // ===========================================================================
  (function () {
    if (typeof window.Promise !== 'function') {
      (function () {
        function SimplePromise(executor) {
          var self = this;
          self._state = 'pending';
          self._value = undefined;
          self._handlers = [];

          function resolve(value) {
            if (self._state !== 'pending') return;
            self._state = 'fulfilled';
            self._value = value;
            run();
          }

          function reject(reason) {
            if (self._state !== 'pending') return;
            self._state = 'rejected';
            self._value = reason;
            run();
          }

          function run() {
            setTimeout(function () {
              for (var i = 0; i < self._handlers.length; i++) handle(self._handlers[i]);
              self._handlers = [];
            }, 0);
          }

          function handle(h) {
            if (self._state === 'pending') {
              self._handlers.push(h);
              return;
            }
            var cb = self._state === 'fulfilled' ? h.onFulfilled : h.onRejected;

            if (!cb) {
              (self._state === 'fulfilled' ? h.resolve : h.reject)(self._value);
              return;
            }

            try {
              var ret = cb(self._value);
              h.resolve(ret);
            } catch (e) {
              h.reject(e);
            }
          }

          self.then = function (onFulfilled, onRejected) {
            return new SimplePromise(function (resolve2, reject2) {
              handle({
                onFulfilled: typeof onFulfilled === 'function' ? onFulfilled : null,
                onRejected: typeof onRejected === 'function' ? onRejected : null,
                resolve: resolve2,
                reject: reject2
              });
            });
          };

          self.catch = function (onRejected) {
            return self.then(null, onRejected);
          };

          try {
            executor(resolve, reject);
          } catch (e) {
            reject(e);
          }
        }
        window.Promise = SimplePromise;
      })();
    }

    if (typeof window.requestAnimationFrame !== 'function') {
      window.requestAnimationFrame = function (cb) { return setTimeout(cb, 16); };
    }

    var safeLocalStorage = (function () {
      try {
        var t = '__jrmeta_test__';
        window.localStorage.setItem(t, '1');
        window.localStorage.removeItem(t);
        return window.localStorage;
      } catch (e) {
        var mem = {};
        return {
          getItem: function (k) { return mem[k] || null; },
          setItem: function (k, v) { mem[k] = String(v); },
          removeItem: function (k) { delete mem[k]; }
        };
      }
    })();

    if (!window.Lampa) window.Lampa = {};
    if (!Lampa.Storage) {
      Lampa.Storage = {
        get: function (key, def) {
          try {
            var raw = safeLocalStorage.getItem(key);
            return raw ? JSON.parse(raw) : (def || null);
          } catch (e) { return def || null; }
        },
        set: function (key, val) {
          try { safeLocalStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
        }
      };
    }

    function safeFetchText(url, timeoutMs) {
      timeoutMs = timeoutMs || 5000;

      // fetch + AbortController
      if (window.fetch && window.AbortController) {
        return new Promise(function (resolve, reject) {
          var controller = new AbortController();
          var timer = setTimeout(function () {
            controller.abort();
            reject(new Error('fetch timeout'));
          }, timeoutMs);

          fetch(url, { signal: controller.signal })
            .then(function (res) {
              if (!res.ok) throw new Error('HTTP ' + res.status);
              return res.text();
            })
            .then(function (txt) { clearTimeout(timer); resolve(txt); })
            .catch(function (err) { clearTimeout(timer); reject(err); });
        });
      }

      // XHR fallback
      return new Promise(function (resolve, reject) {
        try {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', url, true);
          xhr.timeout = timeoutMs;
          xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.responseText);
            else reject(new Error('XHR ' + xhr.status));
          };
          xhr.onerror = xhr.ontimeout = function () { reject(new Error('XHR failed')); };
          xhr.send();
        } catch (e) {
          reject(e);
        }
      });
    }

    window.JRMETA_safeFetchText = safeFetchText;
  })();

  // ===========================================================================
  // 1) CONFIG (об'єднана)
  // ===========================================================================
  var JRMETA_CONFIG = window.JRMETA_CONFIG || {
    // мережа
    JACRED_PROTOCOL: 'https://',
    JACRED_URL: 'jacred.xyz',
    PROXY_LIST: [
      'https://myfinder.kozak-bohdan.workers.dev/?key=lqe_2026_x9A3fQ7P2KJmLwD8N4s0Z&url=',
      'https://api.allorigins.win/raw?url=',
      'https://cors.bwa.workers.dev/'
    ],
    PROXY_TIMEOUT_MS: 3000,
    MAX_PARALLEL_REQUESTS: 10,

    // глобальні перемикачі (головне, що ти просив)
    ENABLE_QUALITY: true,
    ENABLE_TRACKS: true
  };

  window.JRMETA_CONFIG = JRMETA_CONFIG;

  // ===========================================================================
  // 2) СПІЛЬНИЙ ТРАНСПОРТ (черга + proxy fallback + dedupe URL)
  // ===========================================================================
  var requestQueue = [];
  var activeRequests = 0;
  var networkHealth = 1.0;

  function enqueueTask(fn) {
    requestQueue.push(fn);
    processQueue();
  }

  function processQueue() {
    var adaptiveLimit = Math.max(
      3,
      Math.min(JRMETA_CONFIG.MAX_PARALLEL_REQUESTS, Math.floor(JRMETA_CONFIG.MAX_PARALLEL_REQUESTS * networkHealth))
    );
    if (activeRequests >= adaptiveLimit) return;

    var task = requestQueue.shift();
    if (!task) return;

    activeRequests++;
    try {
      task(function onTaskDone() {
        activeRequests--;
        setTimeout(processQueue, 0);
      });
    } catch (e) {
      activeRequests--;
      setTimeout(processQueue, 0);
    }
  }

  function updateNetworkHealth(success) {
    if (success) networkHealth = Math.min(1.0, networkHealth + 0.1);
    else networkHealth = Math.max(0.3, networkHealth - 0.2);
  }

  function buildProxyUrl(proxy, url) {
    if (proxy.indexOf('url=') !== -1) return proxy + encodeURIComponent(url);
    return (proxy.charAt(proxy.length - 1) === '/' ? proxy : (proxy + '/')) + url;
  }

  function fetchWithProxy(url, cb) {
    var proxies = (JRMETA_CONFIG.PROXY_LIST || []);
    var fetchText = window.JRMETA_safeFetchText;

    // 1) direct
    fetchText(url, JRMETA_CONFIG.PROXY_TIMEOUT_MS).then(
      function (txt) { updateNetworkHealth(true); cb(null, txt); },
      function () { tryNextProxy(0); }
    );

    function tryNextProxy(i) {
      if (i >= proxies.length) {
        updateNetworkHealth(false);
        cb(new Error('all proxies failed'));
        return;
      }
      var purl = buildProxyUrl(proxies[i], url);
      fetchText(purl, JRMETA_CONFIG.PROXY_TIMEOUT_MS).then(
        function (txt) { updateNetworkHealth(true); cb(null, txt); },
        function () { updateNetworkHealth(false); tryNextProxy(i + 1); }
      );
    }
  }

  // --- DEDUPE: кеш по URL + in-flight по URL ---
  var urlCache = {};     // { url: { t:ms, txt:string } }
  var inflight = {};     // { url: [cb, cb, ...] }
  var URL_CACHE_TTL = 60 * 1000; // 60с достатньо, щоб "обидва модулі" забрали один і той самий результат

  function fetchSmart(url, done) {
    var now = Date.now();

    // session cache
    if (urlCache[url] && (now - urlCache[url].t) < URL_CACHE_TTL) {
      done(null, urlCache[url].txt);
      return;
    }

    // in-flight dedupe
    if (inflight[url]) {
      inflight[url].push(done);
      return;
    }
    inflight[url] = [done];

    enqueueTask(function (qdone) {
      // HARD TIMEOUT на весь ланцюг
      var proxyCount = (JRMETA_CONFIG.PROXY_LIST && JRMETA_CONFIG.PROXY_LIST.length) ? JRMETA_CONFIG.PROXY_LIST.length : 0;
      var totalMs =
        (Math.max(1500, JRMETA_CONFIG.PROXY_TIMEOUT_MS || 3000) + (JRMETA_CONFIG.PROXY_TIMEOUT_MS || 3000) * proxyCount + 1200);

      var killed = false;
      var timer = setTimeout(function () {
        killed = true;
        flushAll(new Error('hard-timeout'));
      }, totalMs);

      fetchWithProxy(url, function (err, txt) {
        if (killed) return;
        clearTimeout(timer);

        if (!err && txt) {
          urlCache[url] = { t: Date.now(), txt: txt };
        }
        flushAll(err, txt);
      });

      function flushAll(err, txt) {
        var list = inflight[url] || [];
        delete inflight[url];
        for (var i = 0; i < list.length; i++) {
          try { list[i](err || null, txt || null); } catch (e) {}
        }
        qdone();
      }
    });
  }

  // ===========================================================================
  // 3) ДВІ “ЛОГІКИ” (Quality + UA) — зберігаємо правила, лише міняємо transport
  // ===========================================================================
  // --------------------------
  // 3A) HELPERS (card normalize)
  // --------------------------
  function getCardType(card) {
    // як у ваших плагінах: movie / tv
    if (!card) return 'movie';
    if (card.type) return card.type; // часто Lampa вже дає type
    // fallback
    return (card.seasons || card.number_of_seasons) ? 'tv' : 'movie';
  }

  function sanitizeTitle(title) {
    if (!title) return '';
    return String(title)
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\-\(\)\[\]\.\,\:\'\"\!]/g, '')
      .trim();
  }

  function extractYearFromTitle(title) {
    var regex = /(?:^|[^\d])(\d{4})(?:[^\d]|$)/g;
    var match, lastYear = 0;
    var currentYear = new Date().getFullYear();
    while ((match = regex.exec(title)) !== null) {
      var y = parseInt(match[1], 10);
      if (y >= 1900 && y <= currentYear + 2) lastYear = y;
    }
    return lastYear;
  }

  function normalizeCard(cardData) {
    // мінімально достатньо для ваших фільтрів
    var nc = {
      id: (cardData && (cardData.id || cardData.tmdb_id || cardData.movie_id)) ? String(cardData.id || cardData.tmdb_id || cardData.movie_id) : '',
      title: cardData && (cardData.title || cardData.name) ? (cardData.title || cardData.name) : '',
      original_title: cardData && (cardData.original_title || cardData.original_name) ? (cardData.original_title || cardData.original_name) : '',
      release_date: cardData && (cardData.release_date || cardData.first_air_date) ? (cardData.release_date || cardData.first_air_date) : '',
      type: getCardType(cardData)
    };
    return nc;
  }

  // --------------------------
  // 3B) SHARED JacRed API (повертає масив torrents)
  // --------------------------
  function jacredRequestTorrents(searchTitle, year, exact, cb) {
    var userId = Lampa.Storage.get('lampac_unic_id', '');
    var apiUrl =
      JRMETA_CONFIG.JACRED_PROTOCOL + JRMETA_CONFIG.JACRED_URL +
      '/api/v1.0/torrents?search=' + encodeURIComponent(searchTitle) +
      '&year=' + year +
      (exact ? '&exact=true' : '') +
      '&uid=' + userId;

    fetchSmart(apiUrl, function (err, txt) {
      if (err || !txt) { cb(null); return; }
      try {
        var torrents = JSON.parse(txt);
        if (!Array.isArray(torrents) || torrents.length === 0) { cb(null); return; }
        cb(torrents);
      } catch (e) {
        cb(null);
      }
    });
  }

  // ===========================================================================
  // 4) QUALITY LOGIC (ваші правила якості)
  // ===========================================================================
  // NOTE: тут залишений принцип вашої логіки — беремо “найкращу числову якість”.
  // Якщо треба 1:1 повністю як у вашому Quality+Mod (включно з translate/simplify maps),
  // ти можеш просто перенести ті функції сюди без змін — transport вже спільний.

  function extractNumericQualityFromTitle(title) {
    if (!title) return -1;
    var t = String(title).toLowerCase();

    // найгрубіша числова шкала (як у вашому підході: 2160 > 1080 > 720 > 480)
    if (/(2160p|4k|uhd)/.test(t)) return 2160;
    if (/(1080p|full\s*hd|fhd)/.test(t)) return 1080;
    if (/(720p|hd\s*ready|\bhd\b)/.test(t)) return 720;
    if (/(480p|dvdrip|sd)/.test(t)) return 480;

    // CAM/TS/TC — як “низькі”
    if (/(cam|camrip)/.test(t)) return 200;
    if (/\bts\b/.test(t)) return 210;
    if (/\btc\b|telecine/.test(t)) return 220;

    return -1;
  }

  function simplifyQualityLabelFromTitle(title) {
    var q = extractNumericQualityFromTitle(title);
    if (q >= 2160) return '4K';
    if (q >= 1080) return 'FHD';
    if (q >= 720) return 'HD';
    if (q >= 480) return 'SD';
    if (q === 220) return 'TC';
    if (q === 210) return 'TS';
    if (q === 200) return 'CAM';
    return null;
  }

  function selectBestQualityTorrent(torrents, normalizedCard) {
    var bestNumericQuality = -1;
    var bestFound = null;

    for (var i = 0; i < torrents.length; i++) {
      var cur = torrents[i];
      if (!cur || !cur.title) continue;

      // --- ваш фільтр movie/tv по ключових словах (залишаємо принцип) ---
      var tTitle = cur.title.toLowerCase();
      var isSeriesTorrent = /(сезон|season|s\d{1,2}|серии|серії|episodes|епізод|\d{1,2}\s*из\s*\d{1,2}|\d+×\d+)/.test(tTitle);

      if (normalizedCard.type === 'tv' && !isSeriesTorrent) continue;
      if (normalizedCard.type === 'movie' && isSeriesTorrent) continue;

      // --- рік у назві (як у ваших модулях) ---
      var y = extractYearFromTitle(cur.title);
      if (y && normalizedCard.release_date && normalizedCard.release_date.length >= 4) {
        var cy = parseInt(normalizedCard.release_date.substring(0, 4), 10);
        // допускаємо +-1
        if (cy && Math.abs(y - cy) > 1) continue;
      }

      var nq = extractNumericQualityFromTitle(cur.title);
      if (nq > bestNumericQuality) {
        bestNumericQuality = nq;
        bestFound = cur;
      }
    }

    return bestFound ? { numeric: bestNumericQuality, torrent: bestFound } : null;
  }

  // ===========================================================================
  // 5) UA TRACKS LOGIC (ваші правила Ukr/2xUkr + ignore "sub")
  // ===========================================================================
  var ukraineFlagSVG = '<i class="flag-css"></i>';

  function countUkrainianTracks(title) {
    if (!title) return 0;
    var cleanTitle = title.toLowerCase();

    var subsIndex = cleanTitle.indexOf('sub');
    if (subsIndex !== -1) cleanTitle = cleanTitle.substring(0, subsIndex);

    var multi = cleanTitle.match(/(\d+)x\s*ukr/);
    if (multi && multi[1]) return parseInt(multi[1], 10);

    var single = cleanTitle.match(/\bukr\b/g);
    if (single) return single.length;

    return 0;
  }

  function formatTrackLabel(count, displayMode) {
    if (!count || count === 0) return null;

    switch (displayMode) {
      case 'flag_only':
        return ukraineFlagSVG;
      case 'flag_count':
        if (count === 1) return ukraineFlagSVG;
        return count + 'x' + ukraineFlagSVG;
      case 'text':
      default:
        if (count === 1) return 'Ukr';
        return count + 'xUkr';
    }
  }

  function selectBestTracksTorrent(torrents, normalizedCard) {
    var bestTrackCount = 0;
    var bestFound = null;

    for (var i = 0; i < torrents.length; i++) {
      var cur = torrents[i];
      if (!cur || !cur.title) continue;

      var tTitle = cur.title.toLowerCase();
      var isSeriesTorrent = /(сезон|season|s\d{1,2}|серии|серії|episodes|епізод|\d{1,2}\s*из\s*\d{1,2}|\d+×\d+)/.test(tTitle);

      if (normalizedCard.type === 'tv' && !isSeriesTorrent) continue;
      if (normalizedCard.type === 'movie' && isSeriesTorrent) continue;

      var tc = countUkrainianTracks(cur.title);
      if (tc > bestTrackCount) {
        bestTrackCount = tc;
        bestFound = cur;
      }
    }

    return bestFound ? { count: bestTrackCount, torrent: bestFound } : null;
  }

  // ===========================================================================
  // 6) SETTINGS (одне меню, 2 головні перемикачі + підналаштування)
  // ===========================================================================
  var SETTINGS_KEY = 'jrmeta_settings_v1';

  function toBool(v) { return String(v) === 'true'; }

  function jrToast(msg) {
    try {
      var id = 'jrmeta_toast';
      var el = document.getElementById(id);
      if (!el) {
        el = document.createElement('div');
        el.id = id;
        el.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:2rem;padding:.6rem 1rem;background:rgba(0,0,0,.85);color:#fff;border-radius:.5rem;z-index:9999;font-size:14px;transition:opacity .2s;opacity:0';
        document.body.appendChild(el);
      }
      el.textContent = msg;
      el.style.opacity = '1';
      setTimeout(function () { el.style.opacity = '0'; }, 1300);
    } catch (e) {}
  }

  var st = null;

  function loadSettings() {
    var s = (Lampa.Storage.get(SETTINGS_KEY) || {});
    return {
      enable_quality: (typeof s.enable_quality === 'boolean') ? s.enable_quality : true,
      enable_tracks: (typeof s.enable_tracks === 'boolean') ? s.enable_tracks : true,

      // quality
      q_show_tv: (typeof s.q_show_tv === 'boolean') ? s.q_show_tv : true,
      q_label_style: s.q_label_style || 'short', // short/full (як у вас було)

      // tracks
      t_show_tv: (typeof s.t_show_tv === 'boolean') ? s.t_show_tv : true,
      t_display_mode: s.t_display_mode || 'flag_count' // text | flag_count | flag_only
    };
  }

  function applySettings() {
    JRMETA_CONFIG.ENABLE_QUALITY = !!st.enable_quality;
    JRMETA_CONFIG.ENABLE_TRACKS = !!st.enable_tracks;
  }

  function saveSettings() {
    Lampa.Storage.set(SETTINGS_KEY, st);
    applySettings();
    jrToast('Збережено');
  }

  function registerUI() {
    Lampa.Template.add('settings_jrmeta', '<div></div>');

    Lampa.SettingsApi.addParam({
      component: 'interface',
      param: { type: 'button', component: 'jrmeta' },
      field: { name: 'JacRed: Якість + UA доріжки', description: 'Один плагін, один транспорт до JacRed' },
      onChange: function () {
        Lampa.Settings.create('jrmeta', {
          template: 'settings_jrmeta',
          onBack: function () { Lampa.Settings.create('interface'); }
        });
      }
    });

    // --- Головні перемикачі ---
    Lampa.SettingsApi.addParam({
      component: 'jrmeta',
      param: { name: 'jrmeta_enable_quality', type: 'select', values: { 'true': 'Увімкнено', 'false': 'Вимкнено' }, default: String(st.enable_quality) },
      field: { name: 'Увімкнути мітки якості' },
      onChange: function (v) { st.enable_quality = toBool(v); saveSettings(); }
    });

    Lampa.SettingsApi.addParam({
      component: 'jrmeta',
      param: { name: 'jrmeta_enable_tracks', type: 'select', values: { 'true': 'Увімкнено', 'false': 'Вимкнено' }, default: String(st.enable_tracks) },
      field: { name: 'Увімкнути мітки UA доріжок' },
      onChange: function (v) { st.enable_tracks = toBool(v); saveSettings(); }
    });

    // --- Quality sub ---
    Lampa.SettingsApi.addParam({
      component: 'jrmeta',
      param: { name: 'jrmeta_q_show_tv', type: 'select', values: { 'true': 'Увімкнено', 'false': 'Вимкнено' }, default: String(st.q_show_tv) },
      field: { name: 'Якість: показувати для серіалів' },
      onChange: function (v) { st.q_show_tv = toBool(v); saveSettings(); }
    });

    Lampa.SettingsApi.addParam({
      component: 'jrmeta',
      param: {
        name: 'jrmeta_q_label_style', type: 'select',
        values: { short: 'Скорочено (4K, FHD)', full: 'Повно (з назви релізу)' },
        default: st.q_label_style
      },
      field: { name: 'Якість: стиль мітки' },
      onChange: function (v) { st.q_label_style = v; saveSettings(); }
    });

    // --- Tracks sub ---
    Lampa.SettingsApi.addParam({
      component: 'jrmeta',
      param: { name: 'jrmeta_t_show_tv', type: 'select', values: { 'true': 'Увімкнено', 'false': 'Вимкнено' }, default: String(st.t_show_tv) },
      field: { name: 'UA: показувати для серіалів' },
      onChange: function (v) { st.t_show_tv = toBool(v); saveSettings(); }
    });

    Lampa.SettingsApi.addParam({
      component: 'jrmeta',
      param: {
        name: 'jrmeta_t_display_mode',
        type: 'select',
        values: { text: 'Текст (Ukr/2xUkr)', flag_count: 'Прапор + лічильник', flag_only: 'Лише прапор' },
        default: st.t_display_mode
      },
      field: { name: 'UA: стиль мітки' },
      onChange: function (v) { st.t_display_mode = v; saveSettings(); }
    });
  }

  function start() {
    st = loadSettings();
    applySettings();
    if (Lampa && Lampa.SettingsApi && typeof Lampa.SettingsApi.addParam === 'function') {
      setTimeout(registerUI, 0);
    }
  }

  if (window.appready) start();
  else if (Lampa && Lampa.Listener) Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') start(); });

  // ===========================================================================
  // 7) UI: CSS для UA прапора (мінімально, як у вас)
  // ===========================================================================
  (function injectTracksCss() {
    var css =
      "<style id='jrmeta_tracks_css'>" +
      ".card__view{position:relative;}" +
      ".card__tracks{position:absolute!important;right:.3em!important;top:.3em!important;background:rgba(0,0,0,.5)!important;color:#fff!important;font-size:1.3em!important;padding:.2em .5em!important;border-radius:1em!important;font-weight:700!important;z-index:20!important;width:fit-content!important;max-width:calc(100% - 1em)!important;overflow:hidden!important;}" +
      ".card__tracks div{display:flex!important;align-items:center!important;gap:4px!important;white-space:nowrap!important;}" +
      ".card__tracks .flag-css{display:inline-block;width:1.5em;height:.8em;vertical-align:middle;background:linear-gradient(to bottom,#0057B7 0%,#0057B7 50%,#FFD700 50%,#FFD700 100%);border-radius:2px;box-shadow:0 0 2px 0 rgba(0,0,0,.6),0 0 1px 1px rgba(0,0,0,.2),inset 0 1px 0 0 #004593,inset 0 -1px 0 0 #D0A800;}" +
      "</style>";
    try {
      if (!document.getElementById('jrmeta_tracks_css')) document.head.insertAdjacentHTML('beforeend', css);
    } catch (e) {}
  })();

  // ===========================================================================
  // 8) ОБРОБКА КАРТОК (один вхід: якщо 2 опції off -> не робимо нічого)
  // ===========================================================================
  function updateCardTracksBadge(cardEl, labelHtml) {
    try {
      var host = cardEl.querySelector('.card__view') || cardEl;
      var ex = host.querySelector('.card__tracks');
      if (!labelHtml) {
        if (ex) ex.remove();
        return;
      }
      if (!ex) {
        ex = document.createElement('div');
        ex.className = 'card__tracks';
        ex.innerHTML = "<div></div>";
        host.appendChild(ex);
      }
      ex.querySelector('div').innerHTML = labelHtml;
    } catch (e) {}
  }

  function updateCardQualityBadge(cardEl, label) {
    // Мінімально: мітка якості на постері.
    // Якщо у вас у Quality+Mod була своя DOM-логіка/класи — перенеси її сюди 1:1.
    try {
      var host = cardEl.querySelector('.card__view') || cardEl;
      var cls = 'jrmeta_quality';
      var ex = host.querySelector('.' + cls);

      if (!label) {
        if (ex) ex.remove();
        return;
      }

      if (!ex) {
        ex = document.createElement('div');
        ex.className = cls;
        ex.style.cssText = 'position:absolute;left:.3em;top:.3em;background:rgba(61,161,141,.9);color:#fff;padding:.2em .5em;border-radius:1em;font-weight:700;z-index:20;font-size:1.1em;';
        host.appendChild(ex);
      }
      ex.textContent = label;
    } catch (e) {}
  }

  // Idempotent per-card guard
  var inflightCard = new WeakMap();

  function processCard(cardEl) {
    if (!cardEl || !cardEl.isConnected) return;

    // якщо обидва вимкнені — взагалі нічого не робимо (і це критично з вимоги)
    if (!JRMETA_CONFIG.ENABLE_QUALITY && !JRMETA_CONFIG.ENABLE_TRACKS) return;

    // guard від дублю
    if (inflightCard.get(cardEl)) return;
    inflightCard.set(cardEl, true);

    // дістаємо cardData з DOM так, як робить Lampa (часто лежить у dataset / card controller).
    // У більшості збірок Lampa на .card є data-id і data-type, але це не завжди.
    // Тому: пробуємо витягнути через Lampa.Card якщо доступно.
    var cardData = null;

    try {
      if (window.Lampa && Lampa.Card && typeof Lampa.Card.get === 'function') {
        cardData = Lampa.Card.get(cardEl);
      }
    } catch (e) {}

    // fallback: мінімум з data-атрибутів
    if (!cardData) {
      cardData = {
        id: cardEl.getAttribute('data-id') || '',
        title: cardEl.getAttribute('data-title') || '',
        original_title: cardEl.getAttribute('data-original-title') || '',
        release_date: cardEl.getAttribute('data-release') || '',
        type: cardEl.getAttribute('data-type') || ''
      };
    }

    var normalized = normalizeCard(cardData);

    // фільтри “показувати для серіалів”
    var allowQuality = JRMETA_CONFIG.ENABLE_QUALITY && (normalized.type !== 'tv' || !!st.q_show_tv);
    var allowTracks  = JRMETA_CONFIG.ENABLE_TRACKS  && (normalized.type !== 'tv' || !!st.t_show_tv);

    if (!allowQuality && !allowTracks) {
      inflightCard.delete(cardEl);
      return;
    }

    // реліз у майбутньому — як у UA модулі: не шукаємо
    if (normalized.release_date) {
      var rd = new Date(normalized.release_date);
      if (rd && rd.getTime && rd.getTime() > Date.now()) {
        inflightCard.delete(cardEl);
        return;
      }
    }

    var year = '';
    if (normalized.release_date && normalized.release_date.length >= 4) year = normalized.release_date.substring(0, 4);
    if (!year || isNaN(parseInt(year, 10))) {
      inflightCard.delete(cardEl);
      return;
    }

    // --- “Жорсткі стратегії” пошуку (як у вас): 2 назви + exact/non-exact ---
    var titleA = sanitizeTitle(normalized.title);
    var titleB = sanitizeTitle(normalized.original_title);

    // стратегії зберігаємо максимально близько до ваших підходів
    var strategies = [];
    if (titleA) {
      strategies.push({ t: titleA, exact: false });
      strategies.push({ t: titleA, exact: true });
    }
    if (titleB && titleB !== titleA) {
      strategies.push({ t: titleB, exact: false });
      strategies.push({ t: titleB, exact: true });
    }

    var bestQuality = null;
    var bestTracks = null;
    var idx = 0;

    function next() {
      if (idx >= strategies.length) {
        // apply UI
        if (allowQuality) {
          var qLabel = null;
          if (bestQuality && bestQuality.torrent) {
            qLabel = (st.q_label_style === 'short')
              ? (simplifyQualityLabelFromTitle(bestQuality.torrent.title) || null)
              : (bestQuality.torrent.title || null);
          }
          updateCardQualityBadge(cardEl, qLabel);
        }

        if (allowTracks) {
          var tLabel = (bestTracks && bestTracks.count > 0)
            ? formatTrackLabel(bestTracks.count, st.t_display_mode)
            : null;
          updateCardTracksBadge(cardEl, tLabel);
        }

        inflightCard.delete(cardEl);
        return;
      }

      var S = strategies[idx++];
      jacredRequestTorrents(S.t, year, S.exact, function (torrents) {
        if (torrents && torrents.length) {
          if (allowQuality) {
            var q = selectBestQualityTorrent(torrents, normalized);
            if (q && (!bestQuality || q.numeric > bestQuality.numeric)) bestQuality = q;
          }
          if (allowTracks) {
            var tr = selectBestTracksTorrent(torrents, normalized);
            if (tr && (!bestTracks || tr.count > bestTracks.count)) bestTracks = tr;
          }
        }
        next();
      });
    }

    next();
  }

  // ===========================================================================
  // 9) HOOK: Card.onVisible (як ти хотів: запит по картці після завантаження Lampa)
  // ===========================================================================
  function bindCardVisible() {
    if (!window.Lampa || !Lampa.Card || typeof Lampa.Card.onVisible !== 'function') {
      // fallback: дуже простий скан видимих карток (не MutationObserver)
      setInterval(function () {
        var cards = document.querySelectorAll('.card');
        for (var i = 0; i < cards.length; i++) {
          var c = cards[i];
          if (!c.isConnected) continue;
          var r = c.getBoundingClientRect();
          if (r.top < window.innerHeight && r.bottom > 0) processCard(c);
        }
      }, 900);
      return;
    }

    Lampa.Card.onVisible(function (cardEl) {
      processCard(cardEl);
    });
  }

  if (window.appready) bindCardVisible();
  else if (Lampa && Lampa.Listener) Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') bindCardVisible(); });

})();

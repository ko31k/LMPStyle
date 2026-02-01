/**
 * JacRed Search Combo (Quality+Mod + UA-Finder+Mod)
 * -----------------------------------------------------------------------------
 * - Один плагін: Якість релізу + Мітки українських доріжок
 * - Одне меню налаштувань
 * - Один мережевий транспорт (черга + проксі + hard-timeout)
 * - Dedupe однакових URL (in-flight + TTL), щоб не було 2-х однакових запитів
 *
 * ВАЖЛИВО:
 * - "Жорсткі" логіки пошуку/фільтрації з обох плагінів збережені.
 * - Якщо обидва перемикачі "Пошук" вимкнені — запитів не буде.
 */

(function () {
  'use strict';

  // =============================================================================
  // 0) POLYFILLS / SAFE HELPERS (як у твоїх плагінах)
  // =============================================================================

  // String.prototype.startsWith polyfill (для старих WebView)
  if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
      position = position || 0;
      return this.indexOf(searchString, position) === position;
    };
  }

  // localStorage shim / safe wrapper
  (function () {
    var ok = true;
    try {
      var t = '__jr_combo_test__';
      window.localStorage.setItem(t, '1');
      window.localStorage.removeItem(t);
    } catch (e) {
      ok = false;
    }
    if (!ok) {
      var mem = {};
      window.localStorage = {
        getItem: function (k) { return mem[k] || null; },
        setItem: function (k, v) { mem[k] = String(v); },
        removeItem: function (k) { delete mem[k]; }
      };
    }
  })();

  // Safe JSON parse
  function safeJsonParse(str, def) {
    try { return JSON.parse(str); } catch (e) { return def; }
  }

  // Lampa.Storage fallback
  if (!window.Lampa) window.Lampa = {};
  if (!Lampa.Storage) {
    Lampa.Storage = {
      get: function (key, def) {
        var raw = null;
        try { raw = window.localStorage.getItem(key); } catch (e) {}
        return raw ? safeJsonParse(raw, def) : (def || null);
      },
      set: function (key, val) {
        try { window.localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
      }
    };
  }

  // fetch/XHR compatible text fetch (як у Quality)
  function JR_safeFetchText(url, timeoutMs) {
    timeoutMs = timeoutMs || 5000;

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

  // =============================================================================
  // 1) ORIGINAL CONFIGS (збережені як були)
  // =============================================================================

  // -------------------- Quality config (LQE) --------------------
  var LQE_CONFIG = window.LQE_CONFIG || {
    CACHE_VERSION: 3,
    LOGGING_GENERAL: true,
    LOGGING_QUALITY: false,
    LOGGING_CARDLIST: true,
    CACHE_VALID_TIME_MS: 48 * 60 * 60 * 1000,
    CACHE_REFRESH_THRESHOLD_MS: 36 * 60 * 60 * 1000,
    CACHE_KEY: 'lampa_quality_cache',

    JACRED_PROTOCOL: 'https://',
    JACRED_URL: 'jacred.xyz',
    JACRED_API_KEY: '',

    PROXY_LIST: [
      'https://myfinder.kozak-bohdan.workers.dev/?key={KEY}&url=',
      'https://api.allorigins.win/raw?url=',
      'https://cors.bwa.workers.dev/'
    ],
    WORKER_KEY: 'lqe_2026_x9A3fQ7P2KJmLwD8N4s0Z',
    PROXY_TIMEOUT_MS: 3000,

    SHOW_QUALITY_FOR_TV_SERIES: false,
    SHOW_FULL_CARD_LABEL: true,

    MAX_PARALLEL_REQUESTS: 10,

    USE_SIMPLE_QUALITY_LABELS: true,

    FULL_CARD_LABEL_BORDER_COLOR: '#FFFFFF',
    FULL_CARD_LABEL_TEXT_COLOR: '#FFFFFF',
    FULL_CARD_LABEL_FONT_WEIGHT: 'normal',
    FULL_CARD_LABEL_FONT_SIZE: '1.2em',
    FULL_CARD_LABEL_FONT_STYLE: 'normal',

    LIST_CARD_LABEL_BORDER_COLOR: '#3DA18D',
    LIST_CARD_LABEL_BACKGROUND_COLOR: 'rgba(61, 161, 141, 0.9)',
    LIST_CARD_LABEL_BACKGROUND_TRANSPARENT: false,
    LIST_CARD_LABEL_TEXT_COLOR: '#FFFFFF',

    // Ручні оверрайди (як було у Quality+Mod — залишаємо, якщо ти їх маєш у window.LQE_CONFIG)
    MANUAL_OVERRIDES: (window.LQE_CONFIG && window.LQE_CONFIG.MANUAL_OVERRIDES) ? window.LQE_CONFIG.MANUAL_OVERRIDES : {}
  };

  // Replace {KEY} placeholder
  (function () {
    var list = LQE_CONFIG.PROXY_LIST || [];
    for (var i = 0; i < list.length; i++) {
      if (typeof list[i] === 'string' && list[i].indexOf('{KEY}') !== -1) {
        list[i] = list[i].replace('{KEY}', LQE_CONFIG.WORKER_KEY || '');
      }
    }
    LQE_CONFIG.PROXY_LIST = list;
  })();

  window.LQE_CONFIG = LQE_CONFIG;

  // -------------------- UA Tracks config (LTF) --------------------
  var ukraineFlagSVG = '<i class="flag-css"></i>';

  var LTF_CONFIG = window.LTF_CONFIG || {
    BADGE_STYLE: 'flag_count',    // 'text' | 'flag_count' | 'flag_only'
    SHOW_FOR_TV: true,

    CACHE_VERSION: 4,
    CACHE_KEY: 'lampa_ukr_tracks_cache',
    CACHE_VALID_TIME_MS: 48 * 60 * 60 * 1000,
    CACHE_REFRESH_THRESHOLD_MS: 24 * 60 * 60 * 1000,

    LOGGING_GENERAL: true,
    LOGGING_TRACKS: false,
    LOGGING_CARDLIST: true,

    JACRED_PROTOCOL: 'https://',
    JACRED_URL: 'jacred.xyz',
    PROXY_LIST: [
      'https://myfinder.kozak-bohdan.workers.dev/?key=lqe_2026_x9A3fQ7P2KJmLwD8N4s0Z&url=',
      'https://api.allorigins.win/raw?url=',
      'https://cors.bwa.workers.dev/'
    ],
    PROXY_TIMEOUT_MS: 3000,
    MAX_PARALLEL_REQUESTS: 10,

    // Ручні оверрайди (UA-Finder+Mod)
    MANUAL_OVERRIDES: (window.LTF_CONFIG && window.LTF_CONFIG.MANUAL_OVERRIDES) ? window.LTF_CONFIG.MANUAL_OVERRIDES : {}
  };

  // для сумісності з оригінальним кодом UA (в ньому є SHOW_TRACKS_FOR_TV_SERIES)
  LTF_CONFIG.SHOW_TRACKS_FOR_TV_SERIES = !!LTF_CONFIG.SHOW_FOR_TV;

  window.LTF_CONFIG = LTF_CONFIG;

  // =============================================================================
  // 2) UNIFIED "ENABLE SEARCH" SETTINGS (нове: керує тим, чи взагалі робити запити)
  // =============================================================================

  var COMBO_SETTINGS_KEY = 'jr_combo_settings_v1';

  function loadComboSettings() {
    var s = Lampa.Storage.get(COMBO_SETTINGS_KEY, null) || {};
    return {
      enable_quality_search: (typeof s.enable_quality_search === 'boolean') ? s.enable_quality_search : true,
      enable_tracks_search: (typeof s.enable_tracks_search === 'boolean') ? s.enable_tracks_search : true,

      // Quality settings (як було)
      q_show_tv: (typeof s.q_show_tv === 'boolean') ? s.q_show_tv : !!LQE_CONFIG.SHOW_QUALITY_FOR_TV_SERIES,
      q_show_full_card: (typeof s.q_show_full_card === 'boolean') ? s.q_show_full_card : !!LQE_CONFIG.SHOW_FULL_CARD_LABEL,
      q_label_style: s.q_label_style || (LQE_CONFIG.USE_SIMPLE_QUALITY_LABELS ? 'short' : 'full'),

      // Tracks settings (як було)
      t_badge_style: s.t_badge_style || (LTF_CONFIG.BADGE_STYLE || 'flag_count'),
      t_show_tv: (typeof s.t_show_tv === 'boolean') ? s.t_show_tv : !!LTF_CONFIG.SHOW_FOR_TV
    };
  }

  function saveComboSettings(st) {
    Lampa.Storage.set(COMBO_SETTINGS_KEY, st);
  }

  // apply to underlying configs + also clear UI if disabled
  function applyComboSettings(st) {
    // Quality
    LQE_CONFIG.SHOW_QUALITY_FOR_TV_SERIES = !!st.q_show_tv;
    LQE_CONFIG.SHOW_FULL_CARD_LABEL = !!st.q_show_full_card;
    LQE_CONFIG.USE_SIMPLE_QUALITY_LABELS = (st.q_label_style === 'short');

    // Tracks
    LTF_CONFIG.BADGE_STYLE = st.t_badge_style;
    LTF_CONFIG.SHOW_FOR_TV = !!st.t_show_tv;
    LTF_CONFIG.SHOW_TRACKS_FOR_TV_SERIES = !!st.t_show_tv;

    // master enable flags live only in combo state, used by hooks
    window.__JR_COMBO_ENABLE_QUALITY_SEARCH__ = !!st.enable_quality_search;
    window.__JR_COMBO_ENABLE_TRACKS_SEARCH__ = !!st.enable_tracks_search;
  }

  // =============================================================================
  // 3) UNIFIED NETWORK TRANSPORT (queue + proxy fallback + hard-timeout + dedupe)
  // =============================================================================

  var JR_NET = (function () {
    var queue = [];
    var active = 0;
    var networkHealth = 1.0;

    // Dedupe (in-flight + TTL)
    var inflight = {}; // url -> [cb...]
    var urlCache = {}; // url -> { t, txt }
    var URL_TTL = 60 * 1000; // 60s enough to avoid double-requests between two modules

    function updateNetworkHealth(success) {
      if (success) networkHealth = Math.min(1.0, networkHealth + 0.1);
      else networkHealth = Math.max(0.3, networkHealth - 0.2);
    }

    function enqueue(task) {
      queue.push(task);
      process();
    }

    function process() {
      // adaptive parallelism (беремо максимальний з двох конфігів)
      var maxPar = Math.max(LQE_CONFIG.MAX_PARALLEL_REQUESTS || 10, LTF_CONFIG.MAX_PARALLEL_REQUESTS || 10);
      var limit = Math.max(3, Math.min(maxPar, Math.floor(maxPar * networkHealth)));

      if (active >= limit) return;
      var task = queue.shift();
      if (!task) return;

      active++;
      try {
        task(function done() {
          active--;
          setTimeout(process, 0);
        });
      } catch (e) {
        active--;
        setTimeout(process, 0);
      }
    }

    function buildProxyUrl(proxy, url) {
      if (proxy.indexOf('url=') !== -1) return proxy + encodeURIComponent(url);
      return (proxy.charAt(proxy.length - 1) === '/' ? proxy : (proxy + '/')) + url;
    }

    function fetchWithProxy(url, proxyList, timeoutMs, cb) {
      var proxies = proxyList || [];
      var tms = timeoutMs || 3000;

      // try direct
      JR_safeFetchText(url, tms).then(
        function (txt) { updateNetworkHealth(true); cb(null, txt); },
        function () { tryProxy(0); }
      );

      function tryProxy(i) {
        if (i >= proxies.length) {
          updateNetworkHealth(false);
          cb(new Error('all proxies failed'));
          return;
        }
        var purl = buildProxyUrl(proxies[i], url);
        JR_safeFetchText(purl, tms).then(
          function (txt) { updateNetworkHealth(true); cb(null, txt); },
          function () { updateNetworkHealth(false); tryProxy(i + 1); }
        );
      }
    }

    /**
     * fetchSmart(url, cardId, callback)
     * - єдиний транспорт для обох модулів
     * - dedupe по URL
     */
    function fetchSmart(url, cardId, callback) {
      var now = Date.now();

      // TTL cache
      if (urlCache[url] && (now - urlCache[url].t) < URL_TTL) {
        callback(null, urlCache[url].txt);
        return;
      }

      // in-flight dedupe
      if (inflight[url]) {
        inflight[url].push(callback);
        return;
      }
      inflight[url] = [callback];

      enqueue(function (qdone) {
        // HARD TIMEOUT на весь ланцюг (беремо найгірший сценарій)
        var proxyCount = Math.max(
          (LQE_CONFIG.PROXY_LIST && LQE_CONFIG.PROXY_LIST.length) ? LQE_CONFIG.PROXY_LIST.length : 0,
          (LTF_CONFIG.PROXY_LIST && LTF_CONFIG.PROXY_LIST.length) ? LTF_CONFIG.PROXY_LIST.length : 0
        );
        var baseTimeout = Math.max(LQE_CONFIG.PROXY_TIMEOUT_MS || 3000, LTF_CONFIG.PROXY_TIMEOUT_MS || 3000);
        var hardMs = baseTimeout + baseTimeout * proxyCount + 1200;

        var killed = false;
        var timer = setTimeout(function () {
          killed = true;
          flush(new Error('hard-timeout'), null);
        }, hardMs);

        // проксі-лист: беремо об’єднаний (щоб не втрачати варіанти)
        var mergedProxies = [];
        if (Array.isArray(LQE_CONFIG.PROXY_LIST)) mergedProxies = mergedProxies.concat(LQE_CONFIG.PROXY_LIST);
        if (Array.isArray(LTF_CONFIG.PROXY_LIST)) mergedProxies = mergedProxies.concat(LTF_CONFIG.PROXY_LIST);

        // унікалізуємо
        var uniq = {};
        var finalProxies = [];
        for (var i = 0; i < mergedProxies.length; i++) {
          var p = mergedProxies[i];
          if (typeof p !== 'string') continue;
          if (!uniq[p]) { uniq[p] = 1; finalProxies.push(p); }
        }

        fetchWithProxy(url, finalProxies, baseTimeout, function (err, txt) {
          if (killed) return;
          clearTimeout(timer);

          if (!err && txt) {
            urlCache[url] = { t: Date.now(), txt: txt };
          }
          flush(err, txt);
        });

        function flush(err, txt) {
          var list = inflight[url] || [];
          delete inflight[url];

          for (var i = 0; i < list.length; i++) {
            try { list[i](err || null, txt || null); } catch (e) {}
          }
          qdone();
        }
      });
    }

    return {
      fetchSmart: fetchSmart
    };
  })();

  // =============================================================================
  // 4) QUALITY MODULE (оригінальна логіка Quality+Mod, з підміною fetchSmart)
  // =============================================================================
  // Для стислості: тут я зберіг оригінальні функції/алгоритми, але замінив їхній fetchSmart на JR_NET.fetchSmart
  // і прибрав їхню реєстрацію меню/хуків — це робиться нижче в COMBO HOOK.

  // -------------------- Quality: helpers / cache --------------------
  function lqeToast(msg) {
    try {
      var id = 'lqe_toast';
      var el = document.getElementById(id);
      if (!el) {
        el = document.createElement('div');
        el.id = id;
        el.style.cssText =
          'position:fixed;left:50%;transform:translateX(-50%);bottom:2rem;padding:.6rem 1rem;background:rgba(0,0,0,.85);color:#fff;border-radius:.5rem;z-index:9999;font-size:14px;transition:opacity .2s;opacity:0';
        document.body.appendChild(el);
      }
      el.textContent = msg;
      el.style.opacity = '1';
      setTimeout(function () { el.style.opacity = '0'; }, 1300);
    } catch (e) {}
  }

  function getQualityCacheObject() {
    var key = LQE_CONFIG.CACHE_KEY || 'lampa_quality_cache';
    var obj = Lampa.Storage.get(key, null);
    if (!obj || typeof obj !== 'object') obj = {};
    if (obj.__v !== LQE_CONFIG.CACHE_VERSION) {
      obj = { __v: LQE_CONFIG.CACHE_VERSION };
      Lampa.Storage.set(key, obj);
    }
    return obj;
  }

  function setQualityCacheObject(obj) {
    var key = LQE_CONFIG.CACHE_KEY || 'lampa_quality_cache';
    Lampa.Storage.set(key, obj);
  }

  function getQualityCache(cacheKey) {
    var obj = getQualityCacheObject();
    var item = obj[cacheKey];
    if (!item) return null;

    var now = Date.now();
    if (item.t && (now - item.t) > (LQE_CONFIG.CACHE_VALID_TIME_MS || 0)) return null;
    return item;
  }

  function setQualityCache(cacheKey, data) {
    var obj = getQualityCacheObject();
    obj[cacheKey] = data;
    setQualityCacheObject(obj);
  }

  function shouldRefreshQualityCache(item) {
    if (!item || !item.t) return false;
    var now = Date.now();
    return (now - item.t) > (LQE_CONFIG.CACHE_REFRESH_THRESHOLD_MS || 0);
  }

  // -------------------- Quality: title/year helpers (як у твоєму файлі) --------------------
  function normalizeText(text) {
    if (!text) return '';
    return String(text).toLowerCase().replace(/\s+/g, ' ').trim();
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

  // -------------------- Quality: quality parsing (як було) --------------------
  function extractNumericQualityFromTitle(title) {
    if (!title) return -1;
    var t = String(title).toLowerCase();
    if (/(2160p|4k|uhd)/.test(t)) return 2160;
    if (/(1080p|full\s*hd|fhd)/.test(t)) return 1080;
    if (/(720p|hd\s*ready|\bhd\b)/.test(t)) return 720;
    if (/(480p|dvdrip|sd)/.test(t)) return 480;
    if (/(cam|camrip)/.test(t)) return 200;
    if (/\bts\b/.test(t)) return 210;
    if (/\btc\b|telecine/.test(t)) return 220;
    return -1;
  }

  function simplifyQualityLabel(title) {
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

  // -------------------- Quality: API request (як було, але transport спільний) --------------------
  function lqeRequestTorrents(searchTitle, year, exact, cardId, cb) {
    var userId = Lampa.Storage.get('lampac_unic_id', '');
    var apiUrl =
      LQE_CONFIG.JACRED_PROTOCOL + LQE_CONFIG.JACRED_URL +
      '/api/v1.0/torrents?search=' + encodeURIComponent(searchTitle) +
      '&year=' + year +
      (exact ? '&exact=true' : '') +
      '&uid=' + userId;

    JR_NET.fetchSmart(apiUrl, cardId || '', function (err, txt) {
      if (err || !txt) { cb(null); return; }
      var torrents = safeJsonParse(txt, null);
      if (!Array.isArray(torrents) || !torrents.length) { cb(null); return; }
      cb(torrents);
    });
  }

  // -------------------- Quality: selection logic (як було по суті) --------------------
  function isSeriesTorrent(title) {
    var t = String(title || '').toLowerCase();
    return /(сезон|season|s\d{1,2}|серии|серії|episodes|епізод|\d{1,2}\s*из\s*\d{1,2}|\d+×\d+)/.test(t);
  }

  function selectBestQualityTorrent(torrents, cardType, cardYear) {
    var bestNumeric = -1;
    var best = null;

    for (var i = 0; i < torrents.length; i++) {
      var cur = torrents[i];
      if (!cur || !cur.title) continue;

      var ser = isSeriesTorrent(cur.title);
      if (cardType === 'tv' && !ser) continue;
      if (cardType === 'movie' && ser) continue;

      var y = extractYearFromTitle(cur.title);
      if (y && cardYear && Math.abs(y - cardYear) > 1) continue;

      var nq = extractNumericQualityFromTitle(cur.title);
      if (nq > bestNumeric) {
        bestNumeric = nq;
        best = cur;
      }
    }

    if (!best) return null;
    return { numeric: bestNumeric, torrent: best };
  }

  // -------------------- Quality: UI (лист + full) --------------------
  function ensureQualityCssInjected() {
    if (document.getElementById('lqe_quality_css')) return;
    var style = document.createElement('style');
    style.id = 'lqe_quality_css';
    style.textContent =
      ".card__quality_label{position:absolute;left:.3em;top:.3em;border:2px solid " + (LQE_CONFIG.LIST_CARD_LABEL_BORDER_COLOR || '#3DA18D') + ";background:" + (LQE_CONFIG.LIST_CARD_LABEL_BACKGROUND_COLOR || 'rgba(61,161,141,.9)') + ";color:" + (LQE_CONFIG.LIST_CARD_LABEL_TEXT_COLOR || '#fff') + ";border-radius:1em;padding:.2em .55em;font-weight:700;z-index:20;font-size:1.1em;max-width:calc(100% - 1em);overflow:hidden;white-space:nowrap;text-overflow:ellipsis;}" +
      ".full__quality_label{display:inline-block;margin-top:.5em;border:2px solid " + (LQE_CONFIG.FULL_CARD_LABEL_BORDER_COLOR || '#fff') + ";color:" + (LQE_CONFIG.FULL_CARD_LABEL_TEXT_COLOR || '#fff') + ";border-radius:1em;padding:.25em .6em;font-weight:" + (LQE_CONFIG.FULL_CARD_LABEL_FONT_WEIGHT || 'normal') + ";font-size:" + (LQE_CONFIG.FULL_CARD_LABEL_FONT_SIZE || '1.2em') + ";font-style:" + (LQE_CONFIG.FULL_CARD_LABEL_FONT_STYLE || 'normal') + ";}";
    document.head.appendChild(style);
  }

  function updateCardListQualityElement(cardView, label) {
    ensureQualityCssInjected();
    var ex = cardView.querySelector('.card__quality_label');

    if (!label) {
      if (ex) ex.remove();
      return;
    }

    if (!ex) {
      ex = document.createElement('div');
      ex.className = 'card__quality_label';
      cardView.appendChild(ex);
    }
    ex.textContent = label;
  }

  function updateFullCardQualityElement(renderEl, label) {
    if (!LQE_CONFIG.SHOW_FULL_CARD_LABEL) return;
    ensureQualityCssInjected();

    // як у Quality+Mod: вставляємо у header/опис (без агресивних змін DOM)
    var place = renderEl && renderEl.querySelector ? renderEl.querySelector('.full-start__title') : null;
    if (!place) return;

    var ex = renderEl.querySelector('.full__quality_label');
    if (!label) {
      if (ex) ex.remove();
      return;
    }

    if (!ex) {
      ex = document.createElement('div');
      ex.className = 'full__quality_label';
      place.parentNode.insertBefore(ex, place.nextSibling);
    }
    ex.textContent = label;
  }

  // Quality main per-list-card
  function updateCardListQuality(cardEl) {
    if (!cardEl || !cardEl.querySelector) return;

    var view = cardEl.querySelector('.card__view');
    var data = cardEl.card_data;
    if (!view || !data) return;

    var type = (data.media_type || data.type || (data.name || data.original_name ? 'tv' : 'movie'));
    if (type === 'tv' && !LQE_CONFIG.SHOW_QUALITY_FOR_TV_SERIES) {
      updateCardListQualityElement(view, null);
      return;
    }

    var cardId = data.id || '';
    // manual override priority
    var manual = LQE_CONFIG.MANUAL_OVERRIDES && LQE_CONFIG.MANUAL_OVERRIDES[cardId];
    if (manual && manual.label) {
      updateCardListQualityElement(view, manual.label);
      return;
    }

    var year = 0;
    var date = data.release_date || data.first_air_date || '';
    if (date && date.length >= 4) year = parseInt(date.slice(0, 4), 10) || 0;
    if (!year) {
      updateCardListQualityElement(view, null);
      return;
    }

    var cacheKey = LQE_CONFIG.CACHE_VERSION + '_' + type + '_' + cardId;
    var cached = getQualityCache(cacheKey);

    // show cached immediately
    if (cached && cached.label) updateCardListQualityElement(view, cached.label);
    else updateCardListQualityElement(view, null);

    // background refresh if stale
    if (cached && !shouldRefreshQualityCache(cached)) return;

    // If search disabled -> don't request
    if (!window.__JR_COMBO_ENABLE_QUALITY_SEARCH__) return;

    // build search strategies (як у твоєму плагіні)
    var title = data.title || data.name || '';
    var otitle = data.original_title || data.original_name || '';
    title = String(title).trim();
    otitle = String(otitle).trim();

    var strategies = [];
    if (title) { strategies.push({ t: title, exact: false }); strategies.push({ t: title, exact: true }); }
    if (otitle && otitle !== title) { strategies.push({ t: otitle, exact: false }); strategies.push({ t: otitle, exact: true }); }

    var idx = 0;
    var best = null;

    function next() {
      if (idx >= strategies.length) {
        var label = null;
        if (best && best.torrent) {
          label = LQE_CONFIG.USE_SIMPLE_QUALITY_LABELS ? (simplifyQualityLabel(best.torrent.title) || null) : (best.torrent.title || null);
        }
        setQualityCache(cacheKey, { t: Date.now(), label: label || '' });
        updateCardListQualityElement(view, label);
        return;
      }

      var S = strategies[idx++];
      lqeRequestTorrents(S.t, year, S.exact, cardId, function (torrents) {
        if (torrents && torrents.length) {
          var cand = selectBestQualityTorrent(torrents, type, year);
          if (cand && (!best || cand.numeric > best.numeric)) best = cand;
        }
        next();
      });
    }

    next();
  }

  // Quality full-card (тригериться подією full complite)
  function processFullCardQuality(movie, renderEl) {
    if (!movie || !renderEl) return;
    if (!LQE_CONFIG.SHOW_FULL_CARD_LABEL) return;

    // If search disabled -> don't request
    if (!window.__JR_COMBO_ENABLE_QUALITY_SEARCH__) return;

    var type = (movie.type || (movie.name || movie.original_name ? 'tv' : 'movie'));
    if (type === 'tv' && !LQE_CONFIG.SHOW_QUALITY_FOR_TV_SERIES) {
      updateFullCardQualityElement(renderEl, null);
      return;
    }

    var cardId = movie.id || '';
    var date = movie.release_date || movie.first_air_date || '';
    var year = (date && date.length >= 4) ? (parseInt(date.slice(0, 4), 10) || 0) : 0;
    if (!year) {
      updateFullCardQualityElement(renderEl, null);
      return;
    }

    // manual override
    var manual = LQE_CONFIG.MANUAL_OVERRIDES && LQE_CONFIG.MANUAL_OVERRIDES[cardId];
    if (manual && manual.label) {
      updateFullCardQualityElement(renderEl, manual.label);
      return;
    }

    var cacheKey = LQE_CONFIG.CACHE_VERSION + '_' + type + '_' + cardId + '_full';
    var cached = getQualityCache(cacheKey);

    if (cached && cached.label) updateFullCardQualityElement(renderEl, cached.label);
    else updateFullCardQualityElement(renderEl, null);

    if (cached && !shouldRefreshQualityCache(cached)) return;

    var title = movie.title || movie.name || '';
    var otitle = movie.original_title || movie.original_name || '';
    title = String(title).trim();
    otitle = String(otitle).trim();

    var strategies = [];
    if (title) { strategies.push({ t: title, exact: false }); strategies.push({ t: title, exact: true }); }
    if (otitle && otitle !== title) { strategies.push({ t: otitle, exact: false }); strategies.push({ t: otitle, exact: true }); }

    var idx = 0;
    var best = null;

    function next() {
      if (idx >= strategies.length) {
        var label = null;
        if (best && best.torrent) {
          label = LQE_CONFIG.USE_SIMPLE_QUALITY_LABELS ? (simplifyQualityLabel(best.torrent.title) || null) : (best.torrent.title || null);
        }
        setQualityCache(cacheKey, { t: Date.now(), label: label || '' });
        updateFullCardQualityElement(renderEl, label);
        return;
      }

      var S = strategies[idx++];
      lqeRequestTorrents(S.t, year, S.exact, cardId, function (torrents) {
        if (torrents && torrents.length) {
          var cand = selectBestQualityTorrent(torrents, type, year);
          if (cand && (!best || cand.numeric > best.numeric)) best = cand;
        }
        next();
      });
    }

    next();
  }

  function lqeClearCache() {
    try {
      var key = (LQE_CONFIG && LQE_CONFIG.CACHE_KEY) ? LQE_CONFIG.CACHE_KEY : 'lampa_quality_cache';
      Lampa.Storage.set(key, {});
      lqeToast('Кеш якості очищено');
    } catch (e) {}
  }

  // =============================================================================
  // 5) UA TRACKS MODULE (оригінальна логіка UA-Finder+Mod, але transport спільний)
  // =============================================================================

  // Inject CSS for UA badge (як було)
  (function injectTracksCss() {
    if (document.getElementById('ltf_tracks_css')) return;
    var css =
      "<style id='ltf_tracks_css'>" +
      ".card__tracks{position:absolute!important;right:.3em!important;top:.3em!important;background:rgba(0,0,0,.5)!important;color:#fff!important;font-size:1.3em!important;padding:.2em .5em!important;border-radius:1em!important;font-weight:700!important;z-index:20!important;width:fit-content!important;max-width:calc(100% - 1em)!important;overflow:hidden!important;}" +
      ".card__tracks div{display:flex!important;align-items:center!important;gap:4px!important;white-space:nowrap!important;}" +
      ".card__tracks.positioned-below-rating{top:2.2em!important;}" +
      ".card__tracks .flag-css{display:inline-block;width:1.5em;height:.8em;vertical-align:middle;background:linear-gradient(to bottom,#0057B7 0%,#0057B7 50%,#FFD700 50%,#FFD700 100%);border-radius:2px;box-shadow:0 0 2px 0 rgba(0,0,0,.6),0 0 1px 1px rgba(0,0,0,.2),inset 0 1px 0 0 #004593,inset 0 -1px 0 0 #D0A800;}" +
      "</style>";
    try { document.head.insertAdjacentHTML('beforeend', css); } catch (e) {}
  })();

  // Tracks cache
  function getTracksCacheObject() {
    var key = LTF_CONFIG.CACHE_KEY || 'lampa_ukr_tracks_cache';
    var obj = Lampa.Storage.get(key, null);
    if (!obj || typeof obj !== 'object') obj = {};
    if (obj.__v !== LTF_CONFIG.CACHE_VERSION) {
      obj = { __v: LTF_CONFIG.CACHE_VERSION };
      Lampa.Storage.set(key, obj);
    }
    return obj;
  }

  function setTracksCacheObject(obj) {
    var key = LTF_CONFIG.CACHE_KEY || 'lampa_ukr_tracks_cache';
    Lampa.Storage.set(key, obj);
  }

  function getTracksCache(cacheKey) {
    var obj = getTracksCacheObject();
    var item = obj[cacheKey];
    if (!item) return null;
    var now = Date.now();
    if (item.t && (now - item.t) > (LTF_CONFIG.CACHE_VALID_TIME_MS || 0)) return null;
    return item;
  }

  function setTracksCache(cacheKey, data) {
    var obj = getTracksCacheObject();
    obj[cacheKey] = data;
    setTracksCacheObject(obj);
  }

  function shouldRefreshTracksCache(item) {
    if (!item || !item.t) return false;
    var now = Date.now();
    return (now - item.t) > (LTF_CONFIG.CACHE_REFRESH_THRESHOLD_MS || 0);
  }

  // Tracks parsing (як у UA-Finder+Mod)
  function countUkrainianTracks(title) {
    if (!title) return 0;
    var cleanTitle = String(title).toLowerCase();

    var subsIndex = cleanTitle.indexOf('sub');
    if (subsIndex !== -1) cleanTitle = cleanTitle.substring(0, subsIndex);

    var multi = cleanTitle.match(/(\d+)x\s*ukr/);
    if (multi && multi[1]) return parseInt(multi[1], 10);

    var single = cleanTitle.match(/\bukr\b/g);
    if (single) return single.length;

    return 0;
  }

  function formatTrackLabel(trackCount) {
    if (!trackCount || trackCount <= 0) return null;

    if (LTF_CONFIG.BADGE_STYLE === 'flag_only') return ukraineFlagSVG;
    if (LTF_CONFIG.BADGE_STYLE === 'flag_count') return (trackCount === 1 ? ukraineFlagSVG : (trackCount + 'x' + ukraineFlagSVG));
    // text
    return (trackCount === 1 ? 'Ukr' : (trackCount + 'xUkr'));
  }

  function selectBestTracksTorrent(torrents, cardType) {
    var bestCount = 0;
    for (var i = 0; i < torrents.length; i++) {
      var cur = torrents[i];
      if (!cur || !cur.title) continue;

      var ser = isSeriesTorrent(cur.title);
      if (cardType === 'tv' && !ser) continue;
      if (cardType === 'movie' && ser) continue;

      var c = countUkrainianTracks(cur.title);
      if (c > bestCount) bestCount = c;
    }
    return bestCount;
  }

  function ltfRequestTorrents(searchTitle, year, exact, cardId, cb) {
    var userId = Lampa.Storage.get('lampac_unic_id', '');
    var apiUrl =
      LTF_CONFIG.JACRED_PROTOCOL + LTF_CONFIG.JACRED_URL +
      '/api/v1.0/torrents?search=' + encodeURIComponent(searchTitle) +
      '&year=' + year +
      (exact ? '&exact=true' : '') +
      '&uid=' + userId;

    JR_NET.fetchSmart(apiUrl, cardId || '', function (err, txt) {
      if (err || !txt) { cb(null); return; }
      var torrents = safeJsonParse(txt, null);
      if (!Array.isArray(torrents) || !torrents.length) { cb(null); return; }
      cb(torrents);
    });
  }

  function updateCardListTracksElement(cardView, trackCount) {
    var displayLabel = formatTrackLabel(trackCount);
    var wrapper = cardView.querySelector('.card__tracks');

    function ensurePositionClass(el) {
      var parentCard = cardView.closest('.card');
      if (!parentCard) return;
      var vote = parentCard.querySelector('.card__vote');
      if (!vote) { el.classList.remove('positioned-below-rating'); return; }
      var topStyle = getComputedStyle(vote).top;
      if (topStyle !== 'auto' && parseInt(topStyle) < 100) el.classList.add('positioned-below-rating');
      else el.classList.remove('positioned-below-rating');
    }

    if (!displayLabel) {
      if (wrapper) wrapper.remove();
      return;
    }

    if (wrapper) {
      var inner = wrapper.firstElementChild;
      if (!inner) {
        inner = document.createElement('div');
        wrapper.appendChild(inner);
      }
      if (inner.innerHTML === displayLabel) {
        ensurePositionClass(wrapper);
        return;
      }
      inner.innerHTML = displayLabel;
      ensurePositionClass(wrapper);
      return;
    }

    wrapper = document.createElement('div');
    wrapper.className = 'card__tracks';
    var div = document.createElement('div');
    div.innerHTML = displayLabel;
    wrapper.appendChild(div);
    cardView.appendChild(wrapper);
    ensurePositionClass(wrapper);
  }

  function clearTracksCacheUI() {
    try {
      var key = LTF_CONFIG.CACHE_KEY || 'lampa_ukr_tracks_cache';
      Lampa.Storage.set(key, {});
      lqeToast('Кеш доріжок очищено');
    } catch (e) {}
  }

  function processListCardTracks(cardEl) {
    if (!cardEl || !cardEl.querySelector) return;

    var view = cardEl.querySelector('.card__view');
    var data = cardEl.card_data;
    if (!view || !data) return;

    // якщо серіали вимкнено — прибираємо бейдж
    var type = (data.media_type || data.type || (data.name || data.original_name ? 'tv' : 'movie'));
    if (type === 'tv' && !LTF_CONFIG.SHOW_TRACKS_FOR_TV_SERIES) {
      var ex = view.querySelector('.card__tracks');
      if (ex) ex.remove();
      return;
    }

    var id = data.id || '';

    // manual override
    var manual = LTF_CONFIG.MANUAL_OVERRIDES && LTF_CONFIG.MANUAL_OVERRIDES[id];
    if (manual) {
      updateCardListTracksElement(view, manual.track_count || 0);
      return;
    }

    var cacheKey = LTF_CONFIG.CACHE_VERSION + '_' + type + '_' + id;
    var cached = getTracksCache(cacheKey);

    var count = cached ? (cached.track_count || 0) : 0;
    updateCardListTracksElement(view, count);

    if (cached && !shouldRefreshTracksCache(cached)) return;

    // If search disabled -> don't request
    if (!window.__JR_COMBO_ENABLE_TRACKS_SEARCH__) return;

    // year filter: UA plugin ignores future releases
    var date = data.release_date || data.first_air_date || '';
    if (!date || date.length < 4) return;
    var year = parseInt(date.slice(0, 4), 10) || 0;
    if (!year) return;
    var rd = new Date(date);
    if (rd && rd.getTime && rd.getTime() > Date.now()) return;

    // strategies (як у UA-Finder)
    var title = data.title || data.name || '';
    var otitle = data.original_title || data.original_name || '';
    title = String(title).trim();
    otitle = String(otitle).trim();

    var strategies = [];
    if (title) { strategies.push({ t: title, exact: false }); strategies.push({ t: title, exact: true }); }
    if (otitle && otitle !== title) { strategies.push({ t: otitle, exact: false }); strategies.push({ t: otitle, exact: true }); }

    var idx = 0;
    var best = 0;

    function next() {
      if (idx >= strategies.length) {
        setTracksCache(cacheKey, { t: Date.now(), track_count: best });
        updateCardListTracksElement(view, best);
        return;
      }

      var S = strategies[idx++];
      ltfRequestTorrents(S.t, year, S.exact, id, function (torrents) {
        if (torrents && torrents.length) {
          var c = selectBestTracksTorrent(torrents, type);
          if (c > best) best = c;
        }
        next();
      });
    }

    next();
  }

  // =============================================================================
  // 6) UNIFIED MENU (одне меню, але всі пункти з обох плагінів)
  // =============================================================================

  function registerComboUI(st) {
    // Порожній шаблон
    Lampa.Template.add('settings_jr_combo', '<div></div>');

    // Кнопка в “Інтерфейс”
    Lampa.SettingsApi.addParam({
      component: 'interface',
      param: { type: 'button', component: 'jr_combo' },
      field: { name: 'JacRed: Пошук (Якість + UA)', description: 'Один плагін, один транспорт, окремі перемикачі пошуку' },
      onChange: function () {
        Lampa.Settings.create('jr_combo', {
          template: 'settings_jr_combo',
          onBack: function () { Lampa.Settings.create('interface'); }
        });
      }
    });

    // --- MASTER: enable search toggles ---
    Lampa.SettingsApi.addParam({
      component: 'jr_combo',
      param: { name: 'jr_combo_enable_quality_search', type: 'select', values: { 'true': 'Увімкнено', 'false': 'Вимкнено' }, default: String(st.enable_quality_search) },
      field: { name: 'Пошук якості (запити до JacRed)' },
      onChange: function (v) {
        st.enable_quality_search = (String(v) === 'true');
        saveComboSettings(st);
        applyComboSettings(st);
      }
    });

    Lampa.SettingsApi.addParam({
      component: 'jr_combo',
      param: { name: 'jr_combo_enable_tracks_search', type: 'select', values: { 'true': 'Увімкнено', 'false': 'Вимкнено' }, default: String(st.enable_tracks_search) },
      field: { name: 'Пошук UA доріжок (запити до JacRed)' },
      onChange: function (v) {
        st.enable_tracks_search = (String(v) === 'true');
        saveComboSettings(st);
        applyComboSettings(st);
      }
    });

    // --- QUALITY SETTINGS (як було) ---
    Lampa.SettingsApi.addParam({
      component: 'jr_combo',
      param: { name: 'jr_combo_q_show_tv', type: 'select', values: { 'true': 'Увімкнено', 'false': 'Вимкнено' }, default: String(st.q_show_tv) },
      field: { name: 'Якість: показувати для серіалів' },
      onChange: function (v) {
        st.q_show_tv = (String(v) === 'true');
        saveComboSettings(st);
        applyComboSettings(st);
      }
    });

    Lampa.SettingsApi.addParam({
      component: 'jr_combo',
      param: { name: 'jr_combo_q_show_full_card', type: 'select', values: { 'true': 'Увімкнено', 'false': 'Вимкнено' }, default: String(st.q_show_full_card) },
      field: { name: 'Якість: показувати у повній картці' },
      onChange: function (v) {
        st.q_show_full_card = (String(v) === 'true');
        saveComboSettings(st);
        applyComboSettings(st);
      }
    });

    Lampa.SettingsApi.addParam({
      component: 'jr_combo',
      param: { name: 'jr_combo_q_label_style', type: 'select', values: { short: 'Скорочено (4K/FHD)', full: 'Повно (з назви релізу)' }, default: st.q_label_style },
      field: { name: 'Якість: стиль мітки' },
      onChange: function (v) {
        st.q_label_style = v;
        saveComboSettings(st);
        applyComboSettings(st);
      }
    });

    Lampa.SettingsApi.addParam({
      component: 'jr_combo',
      param: { type: 'button', component: 'jr_combo_clear_quality_cache' },
      field: { name: 'Якість: очистити кеш' },
      onChange: function () { lqeClearCache(); }
    });

    // --- TRACKS SETTINGS (як було) ---
    Lampa.SettingsApi.addParam({
      component: 'jr_combo',
      param: {
        name: 'jr_combo_t_badge_style', type: 'select',
        values: { text: 'Текст (“Ukr”, “2xUkr”)', flag_count: 'Прапорець + лічильник', flag_only: 'Лише прапорець' },
        default: st.t_badge_style
      },
      field: { name: 'UA: стиль мітки' },
      onChange: function (v) {
        st.t_badge_style = v;
        saveComboSettings(st);
        applyComboSettings(st);
      }
    });

    Lampa.SettingsApi.addParam({
      component: 'jr_combo',
      param: { name: 'jr_combo_t_show_tv', type: 'select', values: { 'true': 'Увімкнено', 'false': 'Вимкнено' }, default: String(st.t_show_tv) },
      field: { name: 'UA: показувати для серіалів' },
      onChange: function (v) {
        st.t_show_tv = (String(v) === 'true');
        saveComboSettings(st);
        applyComboSettings(st);
      }
    });

    Lampa.SettingsApi.addParam({
      component: 'jr_combo',
      param: { type: 'button', component: 'jr_combo_clear_tracks_cache' },
      field: { name: 'UA: очистити кеш' },
      onChange: function () { clearTracksCacheUI(); }
    });
  }

  // =============================================================================
  // 7) COMBO HOOK: єдиний onVisible + full card listener (без конфліктів)
  // =============================================================================

  function initCombo() {
    // settings
    var st = loadComboSettings();
    applyComboSettings(st);

    // UI register (одне меню)
    if (Lampa && Lampa.SettingsApi && typeof Lampa.SettingsApi.addParam === 'function') {
      setTimeout(function () { registerComboUI(st); }, 0);
    }

    // hook card lifecycle
    var card = Lampa.Maker && Lampa.Maker.map ? Lampa.Maker.map('Card') : null;
    if (!card || !card.Card) {
      if (LQE_CONFIG.LOGGING_GENERAL || LTF_CONFIG.LOGGING_GENERAL) console.log('JR-COMBO: Card module недоступний, не ініціалізовано');
      return;
    }

    // Avoid double init
    if (window.__JR_COMBO_INIT__) return;
    window.__JR_COMBO_INIT__ = true;

    var originalOnVisible = card.Card.onVisible;

    card.Card.onVisible = function () {
      var self = this;
      if (typeof originalOnVisible === 'function') originalOnVisible.apply(self, arguments);

      // Якщо обидва "Пошуки" вимкнені — НЕ робимо запитів.
      // Але: UI може показувати кешовані значення — це нормально (як було).
      // Якщо хочеш при вимкненні ще й прибирати бейджі — скажи, додам.
      if (window.__JR_COMBO_ENABLE_QUALITY_SEARCH__ || true) {
        // Quality показує кеш навіть без мережі, запит робить лише якщо enable=true (перевірка всередині)
        updateCardListQuality(self);
      }

      if (window.__JR_COMBO_ENABLE_TRACKS_SEARCH__ || true) {
        // Tracks показує кеш навіть без мережі, запит робить лише якщо enable=true (перевірка всередині)
        processListCardTracks(self);
      }
    };

    // full card for quality
    Lampa.Listener.follow('full', function (event) {
      if (event.type === 'complite') {
        var renderElement = event.object && event.object.activity && event.object.activity.render ? event.object.activity.render() : null;
        if (event.data && event.data.movie) {
          processFullCardQuality(event.data.movie, renderElement);
        }
      }
    });

    if (LQE_CONFIG.LOGGING_GENERAL || LTF_CONFIG.LOGGING_GENERAL) console.log('JR-COMBO: init OK');
  }

  if (window.appready) initCombo();
  else if (Lampa && Lampa.Listener) Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') initCombo(); });

})();

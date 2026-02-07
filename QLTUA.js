//Оригінальний плагін https://github.com/FoxStudio24/lampa/blob/main/Quality/Quality.js
//SVG Quality Badges (Full card only) + settings + cache
//Працює при увімкненому парсері

(function () {
  'use strict';

  // =====================================================================
  // CONFIG
  // =====================================================================

  // RAW github icons folder
  var pluginPath = 'https://raw.githubusercontent.com/ko31k/LMP/main/wwwroot/img/';

  // ✅ пробіли в назвах — %20
  var svgIcons = {
    '4K': pluginPath + '4K.svg',
    '2K': pluginPath + '2K.svg',
    'FULL HD': pluginPath + 'FULL%20HD.svg',
    'HD': pluginPath + 'HD.svg',
    'HDR': pluginPath + 'HDR.svg',
    'Dolby Vision': pluginPath + 'DolbyV.png',
    '7.1': pluginPath + '7.1.svg',
    '5.1': pluginPath + '5.1.svg',
    '4.0': pluginPath + '4.0.svg',
    '2.0': pluginPath + '2.0.svg',
    'DUB': pluginPath + 'DUB.svg',
    'UKR': pluginPath + 'UA.png'
  };

  // Settings key (bump if you want to reset users)
  var SETTINGS_KEY = 'svgq_user_settings_v4';

  // SVGQ cache (щоб не парсити щоразу при повторному вході в картку)
  var CACHE_KEY = 'svgq_parser_cache_v1';
  var CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h (можеш змінити)

  // Default settings
  var st = {
    placement: 'rate',        // "rate" | "under_rate" | "after_details"
    force_new_line: false     // ✅ переносити мітки на новий рядок (актуально лише для "rate")
  };

  // in-memory cache mirror
  var memCache = null;

  // =====================================================================
  // SAFE STORAGE
  // =====================================================================

  function lsGet(key, def) {
    try {
      var v = Lampa.Storage.get(key, def);
      return (typeof v === 'undefined') ? def : v;
    } catch (e) { return def; }
  }
  function lsSet(key, val) {
    try { Lampa.Storage.set(key, val); } catch (e) {}
  }

  // =====================================================================
  // SETTINGS: load/save/apply
  // =====================================================================

  function loadSettings() {
    var s = lsGet(SETTINGS_KEY, {}) || {};

    st.placement = (s.placement === 'rate' || s.placement === 'under_rate' || s.placement === 'after_details')
      ? s.placement
      : 'rate';

    st.force_new_line = (typeof s.force_new_line === 'boolean') ? s.force_new_line : false;
  }

  function saveSettings() {
    lsSet(SETTINGS_KEY, st);
    toast('Збережено');
  }

  function toast(msg) {
    try {
      if (Lampa && typeof Lampa.Noty === 'function') { Lampa.Noty(msg); return; }
      if (Lampa && Lampa.Noty && Lampa.Noty.show) { Lampa.Noty.show(msg); return; }
    } catch (e) {}

    var id = 'svgq_toast';
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement('div');
      el.id = id;
      el.style.cssText =
        'position:fixed;left:50%;transform:translateX(-50%);bottom:2rem;' +
        'padding:.6rem 1rem;background:rgba(0,0,0,.85);color:#fff;border-radius:.5rem;' +
        'z-index:9999;font-size:14px;transition:opacity .2s;opacity:0';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = '1';
    setTimeout(function () { el.style.opacity = '0'; }, 1200);
  }

  // =====================================================================
  // SVGQ CACHE
  // =====================================================================

  function getCacheObj() {
    if (memCache) return memCache;
    memCache = lsGet(CACHE_KEY, {}) || {};
    return memCache;
  }

  function makeCacheKey(movie) {
    // Ключ: tmdb_id + year + title (щоб мінімізувати колізії)
    var id = movie && movie.id ? String(movie.id) : '';
    var year = '';
    var rd = movie && (movie.release_date || movie.first_air_date);
    if (rd && String(rd).length >= 4) year = String(rd).slice(0, 4);
    var t = (movie.title || movie.name || movie.original_title || movie.original_name || '').toString().toLowerCase();
    return id + '|' + year + '|' + t;
  }

  function cacheGet(movie) {
    var key = makeCacheKey(movie);
    var c = getCacheObj();
    var it = c[key];
    if (!it || !it.t || typeof it.v === 'undefined') return null;
    if (Date.now() - it.t > CACHE_TTL_MS) return null;
    return it.v;
  }

  function cacheSet(movie, value) {
    var key = makeCacheKey(movie);
    var c = getCacheObj();
    c[key] = { t: Date.now(), v: value };
    memCache = c;
    lsSet(CACHE_KEY, c);
  }

  function cacheClear() {
    memCache = {};
    lsSet(CACHE_KEY, {});
    toast('Кеш очищено');
  }

  // =====================================================================
  // getBest() – підсилено
  // =====================================================================

  function hasUkrAudioMarkers(tl) {
    if (!tl) return false;

    var strong =
      /(?:^|[\s\[\(\{\/\|,._-])(?:2x\s*)?ukr(?:$|[\s\]\)\}\/\|,._-])/i.test(tl) ||
      /(?:^|[\s\[\(\{\/\|,._-])ua(?:$|[\s\]\)\}\/\|,._-])/i.test(tl) ||
      /(?:^|[\s\[\(\{\/\|,._-])укр(?:$|[\s\]\)\}\/\|,._-])/i.test(tl) ||
      /україн|украин|ukrain/i.test(tl);

    var dubUkr =
      /(?:dub|dubbing|дубл|дубляж)[^\n]{0,18}(?:ukr|ua|укр)/i.test(tl) ||
      /(?:ukr|ua|укр)[^\n]{0,18}(?:dub|dubbing|дубл|дубляж)/i.test(tl);

    return !!(strong || dubUkr);
  }

  function hasDub(tl) {
    if (!tl) return false;
    return /(?:^|[\s\[\(\{\/\|,._-])dub(?:$|[\s\]\)\}\/\|,._-])|дубл|дубляж/i.test(tl);
  }

  function detectAudioFromTitle(tl) {
    if (!tl) return null;
    if (/\b7[\.\s]?1\b|\b8ch\b|\b8\s*ch\b/i.test(tl)) return '7.1';
    if (/\b5[\.\s]?1\b|\b6ch\b|\b6\s*ch\b/i.test(tl)) return '5.1';
    if (/\b4[\.\s]?0\b|\b4ch\b|\b4\s*ch\b/i.test(tl)) return '4.0';
    if (/\b2[\.\s]?0\b|\b2ch\b|\b2\s*ch\b/i.test(tl)) return '2.0';
    return null;
  }

  function getBest(results) {
    var best = { resolution: null, hdr: false, dolbyVision: false, audio: null, dub: false, ukr: false };
    var resOrder = ['HD', 'FULL HD', '2K', '4K'];
    var audioOrder = ['2.0', '4.0', '5.1', '7.1'];

    var limit = Math.min(results.length, 25);
    for (var i = 0; i < limit; i++) {
      var item = results[i];
      var title = (item.Title || item.title || '').toString();
      var tl = title.toLowerCase();

      if (!best.ukr && hasUkrAudioMarkers(tl)) best.ukr = true;
      if (!best.dub && hasDub(tl)) best.dub = true;

      var foundRes = null;
      if (tl.indexOf('4k') >= 0 || tl.indexOf('2160') >= 0 || tl.indexOf('uhd') >= 0) foundRes = '4K';
      else if (tl.indexOf('2k') >= 0 || tl.indexOf('1440') >= 0) foundRes = '2K';
      else if (tl.indexOf('1080') >= 0 || tl.indexOf('fhd') >= 0 || tl.indexOf('full hd') >= 0) foundRes = 'FULL HD';
      else if (tl.indexOf('720') >= 0 || /\bhd\b/.test(tl)) foundRes = 'HD';

      if (foundRes && (!best.resolution || resOrder.indexOf(foundRes) > resOrder.indexOf(best.resolution))) {
        best.resolution = foundRes;
      }

      if (tl.indexOf('vision') >= 0 || tl.indexOf('dolby vision') >= 0 || tl.indexOf('dovi') >= 0) best.dolbyVision = true;
      if (tl.indexOf('hdr') >= 0) best.hdr = true;

      if (item.ffprobe && Array.isArray(item.ffprobe)) {
        for (var k = 0; k < item.ffprobe.length; k++) {
          var stream = item.ffprobe[k];

          if (stream && stream.codec_type === 'video') {
            var h = parseInt(stream.height || 0, 10);
            var w = parseInt(stream.width || 0, 10);
            var res = null;

            if (h >= 2160 || w >= 3840) res = '4K';
            else if (h >= 1440 || w >= 2560) res = '2K';
            else if (h >= 1080 || w >= 1920) res = 'FULL HD';
            else if (h >= 720 || w >= 1280) res = 'HD';

            if (res && (!best.resolution || resOrder.indexOf(res) > resOrder.indexOf(best.resolution))) best.resolution = res;

            try {
              if (stream.side_data_list && JSON.stringify(stream.side_data_list).indexOf('Vision') >= 0) best.dolbyVision = true;
              if (stream.color_transfer === 'smpte2084' || stream.color_transfer === 'arib-std-b67') best.hdr = true;
            } catch (e) {}
          }

          if (stream && stream.codec_type === 'audio') {
            var ch = parseInt(stream.channels || 0, 10);
            if (ch) {
              var aud = (ch >= 8) ? '7.1' : (ch >= 6) ? '5.1' : (ch >= 4) ? '4.0' : '2.0';
              if (!best.audio || audioOrder.indexOf(aud) > audioOrder.indexOf(best.audio)) best.audio = aud;
            }
          }
        }
      } else {
        if (!best.audio) {
          var a = detectAudioFromTitle(tl);
          if (a) best.audio = a;
        }
      }
    }

    if (best.dolbyVision) best.hdr = true;
    return best;
  }

  // =====================================================================
  // Rendering
  // =====================================================================

function createBadgeImg(type, index) {
  var iconPath = svgIcons[type];
  if (!iconPath) return '';
  var delay = (index * 0.08) + 's';

  var cls = 'quality-badge'; // <-- ОБОВ’ЯЗКОВО

  return (
    '<div class="' + cls + '" style="animation-delay:' + delay + '">' +
      '<img src="' + iconPath + '" draggable="false" oncontextmenu="return false;">' +
    '</div>'
  );
}


  function buildBadgesHtml(best) {
    var badges = [];
    if (best.ukr) badges.push(createBadgeImg('UKR', badges.length));
    if (best.resolution) badges.push(createBadgeImg(best.resolution, badges.length));
    if (best.hdr) badges.push(createBadgeImg('HDR', badges.length));
    if (best.dolbyVision) badges.push(createBadgeImg('Dolby Vision', badges.length));
    if (best.audio) badges.push(createBadgeImg(best.audio, badges.length));
    if (best.dub) badges.push(createBadgeImg('DUB', badges.length));
    return badges.join('');
  }

  function ensureContainer(renderRoot) {
    // ✅ чистимо старі (жодних дублікатів)
    $('.quality-badges-container, .quality-badges-under-rate, .quality-badges-after-details', renderRoot).remove();

    var rateLine = $('.full-start-new__rate-line, .full-start__rate-line', renderRoot).first();
    var details = $('.full-start-new__details, .full-start__details', renderRoot).first();

    if (st.placement === 'rate') {
      if (!rateLine.length) return null;

      // ⚙️ якщо треба перенос на новий рядок всередині rate-line
      // (це залишаємо як опцію, але вона НЕ рівнозначна "під рядком рейтингів")
      var cls = 'quality-badges-container' + (st.force_new_line ? ' svgq-force-new-row' : '');
      var el = $('<div class="' + cls + '"></div>');
      rateLine.append(el);
      return el;
    }

    if (st.placement === 'under_rate') {
      // ✅ Завжди окремим рядком ПІД rate-line (не залежить від заповнення рейтингу)
      if (!rateLine.length) return null;

      var elU = $('<div class="quality-badges-under-rate"></div>');
      rateLine.after(elU);
      return elU;
    }

    if (st.placement === 'after_details') {
      // ✅ Як було: після додаткової інформації (details)
      if (!details.length) return null;

      var elA = $('<div class="quality-badges-after-details"></div>');
      details.after(elA);
      return elA;
    }

    return null;
  }

  function applyBadgesToFullCard(movie, renderRoot) {
    if (!movie || !renderRoot) return;

    // parser must be enabled
    if (!Lampa || !Lampa.Storage || !Lampa.Storage.field || !Lampa.Storage.field('parser_use')) return;

    var container = ensureContainer(renderRoot);
    if (!container) return;

    // 1) cache fast path
    var cached = cacheGet(movie);
    if (cached && typeof cached === 'string') {
      container.html(cached);
      return;
    }

    container.html('');

    Lampa.Parser.get(
      { search: movie.title || movie.name, movie: movie, page: 1 },
      function (response) {
        if (!response || !response.Results) return;

        var best = getBest(response.Results);
        var html = buildBadgesHtml(best);

        // cache even empty (but as empty string) — to avoid repeated calls
        cacheSet(movie, html || '');

        container.html(html);
      }
    );
  }

  // =====================================================================
  // Styles (UPDATED FULL BLOCK)
  // =====================================================================

  var style = '<style id="svgq_styles">\
    /* Завжди ховаємо текстову мітку Quality+Mod (LQE) у full card */\
    .full-start__status.lqe-quality{ display:none !important; }\
    \
    /* ===================================================== */\
    /* 1) В рядку рейтингів (rate-line) */\
    /* ===================================================== */\
    .quality-badges-container{\
      display:inline-flex;\
      flex-wrap:wrap;\
      align-items:center;\
      column-gap:0.32em;   /* GAP X між бейджами */\
      row-gap:0.24em;      /* GAP Y при переносі */\
      margin:0.20em 0 0 0.48em; /* відступ у rate-line */\
      min-height:1.2em;\
      pointer-events:none;\
      vertical-align:middle;\
      max-width:100%;\
    }\
    \
    /* Опція: переносити мітки на новий рядок всередині rate-line */\
    .quality-badges-container.svgq-force-new-row{\
      flex-basis:100%;\
      width:100%;\
      display:flex;\
      margin-left:0;\
      margin-top:0.28em;\
    }\
    \
    /* ===================================================== */\
    /* 2) Під рядком рейтингів (НОВИЙ окремий рядок) */\
    /* ===================================================== */\
    .quality-badges-under-rate{\
      display:flex;\
      flex-wrap:wrap;\
      align-items:center;\
      column-gap:0.32em;\
      row-gap:0.24em;\
      margin:0.26em 0 0.52em 0; /* ↑ від рейтингів / ↓ до details */\
      min-height:1.2em;\
      pointer-events:none;\
      max-width:100%;\
    }\
    \
    /* ===================================================== */\
    /* 3) Після додаткової інформації (details) */\
    /* ===================================================== */\
    .quality-badges-after-details{\
      display:flex;\
      flex-wrap:wrap;\
      align-items:center;\
      column-gap:0.32em;\
      row-gap:0.24em;\
      margin:0.18em 0 0.92em 0; /* нижній відступ після details */\
      min-height:1.2em;\
      pointer-events:none;\
      max-width:100%;\
    }\
    \
    /* ===================================================== */\
    /* 4) Badge shell — БЕЗ рамок, БЕЗ фону */\
    /* ===================================================== */\
    .quality-badge{\
      height:1.6em;        /* РОЗМІР міток (підкручуй тут) */\
      display:inline-flex;\
      align-items:center;\
      justify-content:center;\
      padding:0;\
      background:none;\
      box-shadow:none;\
      border:none;\
      border-radius:0;\
      box-sizing:border-box;\
      opacity:0;\
      transform:translateY(8px);\
      animation:qb_in 0.38s ease forwards;\
    }\
    @keyframes qb_in{ to{ opacity:1; transform:translateY(0);} }\
    \
    /* SVG icons rendering */\
    .quality-badge img{\
      height:100%;\
      width:auto;\
      display:block;\
      filter:drop-shadow(0 1px 2px rgba(0,0,0,0.85));\
    }\
    \
    \
    /* Mobile */\
    @media (max-width:768px){\
      .quality-badges-container{\
        column-gap:0.26em;\
        row-gap:0.18em;\
        min-height:1em;\
        margin-left:0.38em;\
        margin-top:0.18em;\
      }\
      .quality-badges-container.svgq-force-new-row{\
        margin-top:0.24em;\
      }\
      .quality-badges-under-rate{\
        column-gap:0.26em;\
        row-gap:0.18em;\
        min-height:1em;\
        margin:0.22em 0 0.46em 0;\
      }\
      .quality-badges-after-details{\
        column-gap:0.26em;\
        row-gap:0.18em;\
        min-height:1em;\
        margin:0.34em 0 0.78em 0;\
      }\
      .quality-badge{\
        height:1.6em; /* розмір на мобі (підкручуй тут) */\
      }\
    }\
  </style>';

  function injectStyleOnce() {
    if (document.getElementById('svgq_styles')) return;
    $('body').append(style);
  }

  // =====================================================================
  // Settings UI (no duplicates) + Clear cache
  // =====================================================================

  function registerSettingsUIOnce() {
    if (window.__svgq_settings_registered) return;
    window.__svgq_settings_registered = true;

    Lampa.Template.add('settings_svgq', '<div></div>');

    // Головний пункт в Interface
    Lampa.SettingsApi.addParam({
      component: 'interface',
      param: { type: 'button', component: 'svgq' },
      field: {
        name: 'Мітки якості в повній картці',
        description: 'SVG бейджі якості у full card (працює з парсером)'
      },
      onChange: function () {
        Lampa.Settings.create('svgq', {
          template: 'settings_svgq',
          onBack: function () { Lampa.Settings.create('interface'); }
        });
      }
    });

    // Розміщення міток
    Lampa.SettingsApi.addParam({
      component: 'svgq',
      param: {
        name: 'svgq_placement',
        type: 'select',
        values: {
          rate: 'Показувати в рядку рейтингів',
          under_rate: 'Показувати під рядком рейтингів',
          after_details: 'Показувати після додаткової інформації'
        },
        default: st.placement
      },
      field: { name: 'Розміщення міток' },
      onChange: function (v) { st.placement = String(v); saveSettings(); }
    });

    // Переносити мітки на новий рядок (актуально для "в рядку рейтингів")
    Lampa.SettingsApi.addParam({
      component: 'svgq',
      param: {
        name: 'svgq_force_new_line',
        type: 'select',
        values: { 'false': 'Ні', 'true': 'Так' },
        default: String(!!st.force_new_line)
      },
      field: { name: 'Переносити мітки на новий рядок в рядку рейтингів' },
      onChange: function (v) { st.force_new_line = (String(v) === 'true'); saveSettings(); }
    });

    // Очистити кеш (ми його реально використовуємо)
    Lampa.SettingsApi.addParam({
      component: 'svgq',
      param: { type: 'button', component: 'svgq_clear_cache' },
      field: { name: 'Очистити кеш' },
      onChange: function () { cacheClear(); }
    });
  }

  function startSettings() {
    loadSettings();
    if (Lampa && Lampa.SettingsApi && typeof Lampa.SettingsApi.addParam === 'function') {
      // важливо: реєстрацію робимо один раз
      setTimeout(registerSettingsUIOnce, 0);
    }
  }

  // =====================================================================
  // Full-card hook only
  // =====================================================================

  Lampa.Listener.follow('full', function (e) {
    if (e.type !== 'complite') return;

    try {
      injectStyleOnce();

      if (!window.__svgq_settings_inited) {
        window.__svgq_settings_inited = true;

        if (window.appready) startSettings();
        else if (Lampa && Lampa.Listener) {
          Lampa.Listener.follow('app', function (ev) {
            if (ev.type === 'ready') startSettings();
          });
        }
      }

      // stable root
      var root = $(e.object.activity.render());
      applyBadgesToFullCard(e.data.movie, root);
    } catch (err) {
      console.error('[SVGQ] error:', err);
    }
  });

  console.log('[SVGQ] loaded');

})();

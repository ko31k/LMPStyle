// SVG Badges - Full Card only + UKR audio detection + placement menu + hides LQE label when enabled
(function () {
  'use strict';

  // ---------------------------
  // CONFIG
  // ---------------------------
  var RAW_BASE = 'https://raw.githubusercontent.com/ko31k/LMP/main/wwwroot/img/';

  // Cache
  var CACHE_KEY = 'lmp_svg_badges_cache_v1';
  var CACHE_TTL_MS = 48 * 60 * 60 * 1000; // 48h
  var memCache = {};

  // Settings
  var SETTINGS_KEY = 'lmp_svg_badges_settings_v1';
  var settings = loadSettings();

  // Prevent duplicated settings params
  var svgq_params_added = false;

  // Icons
  var svgIcons = {
    '4K': RAW_BASE + '4K.svg',
    '2K': RAW_BASE + '2K.svg',
    'FULL HD': RAW_BASE + 'FULL HD.svg',
    'HD': RAW_BASE + 'HD.svg',
    'HDR': RAW_BASE + 'HDR.svg',
    'Dolby Vision': RAW_BASE + 'Dolby Vision.svg',
    '7.1': RAW_BASE + '7.1.svg',
    '5.1': RAW_BASE + '5.1.svg',
    '4.0': RAW_BASE + '4.0.svg',
    '2.0': RAW_BASE + '2.0.svg',
    'DUB': RAW_BASE + 'DUB.svg',
    'UKR': RAW_BASE + 'UKR.svg'
  };

  // ---------------------------
  // SETTINGS
  // ---------------------------
  function loadSettings() {
    var s = {};
    try { s = (Lampa.Storage && Lampa.Storage.get) ? (Lampa.Storage.get(SETTINGS_KEY) || {}) : {}; } catch (e) { s = {}; }
    if (!s.placement) s.placement = 'rate_line'; // rate_line | after_details | off
    if (typeof s.hide_lqe !== 'boolean') s.hide_lqe = true;
    return s;
  }

  function saveSettings() {
    try { if (Lampa.Storage && Lampa.Storage.set) Lampa.Storage.set(SETTINGS_KEY, settings); } catch (e) {}
    applyLqeHideClass();
  }

  function applyLqeHideClass() {
    var on = !!settings.hide_lqe && settings.placement !== 'off';
    if (document && document.body) document.body.classList.toggle('svgq-hide-lqe', on);
  }

  // ---------------------------
  // UKR AUDIO DETECTION (UA-Finder style)
  // ---------------------------
  function cutBeforeSubs(s) {
    s = (s || '').toLowerCase();
    var m = s.match(/(?:\bsub(?:s|titles?)?\b|subtitle(?:s)?\b|суб(?:титр(?:и|ы)?)?\b)/i);
    if (!m) return s;
    return s.slice(0, m.index);
  }

  function hasUkrAudioTag(title) {
    var t = cutBeforeSubs(title);

    if (t.indexOf('ukr') === -1 && t.indexOf('укр') === -1 && !/\bua\b/.test(t)) return false;

    // audio context words
    var audioCtx = /(?:\baudio\b|\bdub(?:bing)?\b|\bvoice\b|\bvo\b|\bmvo\b|\blvo\b|\bdvo\b|\bavo\b|озвуч|озвучк|дубл|голос|доріжк|дорожк)/i;

    // strong patterns
    if (/(?:\b\d+x\s*ukr\b|\bukr\s*[\+\/]\s*(?:eng|en|rus|ru)\b|\bukr\b.*(?:dub|audio|voice|vo|mvo|lvo|dvo|avo)|(?:укр)\s*(?:озвуч|озвучк|дубл|голос|доріжк|дорожк))/i.test(t)) {
      return true;
    }

    if ((/\bukr\b/.test(t) || /укр/.test(t)) && audioCtx.test(t)) return true;
    if (/\bua\b/.test(t) && audioCtx.test(t)) return true;

    return false;
  }

  // ---------------------------
  // BEST PICK (enhanced)
  // ---------------------------
  function getBest(results) {
    var best = {
      resolution: null,
      hdr: false,
      dolbyVision: false,
      audio: null,
      dub: false,
      ukr: false
    };

    var resOrder = ['HD', 'FULL HD', '2K', '4K'];
    var audioOrder = ['2.0', '4.0', '5.1', '7.1'];

    var limit = Math.min(results.length, 25);

    for (var i = 0; i < limit; i++) {
      var item = results[i] || {};
      var titleRaw = (item.Title || item.title || '') + '';
      var title = titleRaw.toLowerCase();

      if (!best.ukr && hasUkrAudioTag(titleRaw)) best.ukr = true;

      // Resolution from title
      var foundRes = null;
      if (title.indexOf('2160') >= 0 || title.indexOf('4k') >= 0 || title.indexOf('uhd') >= 0) foundRes = '4K';
      else if (title.indexOf('1440') >= 0 || title.indexOf('2k') >= 0) foundRes = '2K';
      else if (title.indexOf('1080') >= 0 || title.indexOf('fhd') >= 0 || title.indexOf('full hd') >= 0) foundRes = 'FULL HD';
      else if (title.indexOf('720') >= 0 || /\bhd\b/.test(title)) foundRes = 'HD';

      if (foundRes && (!best.resolution || resOrder.indexOf(foundRes) > resOrder.indexOf(best.resolution))) {
        best.resolution = foundRes;
      }

      // HDR/DV from title
      if (title.indexOf('vision') >= 0 || title.indexOf('dolby vision') >= 0 || title.indexOf('dovi') >= 0) best.dolbyVision = true;
      if (title.indexOf('hdr') >= 0 || title.indexOf('hdr10') >= 0 || title.indexOf('hdr10+') >= 0) best.hdr = true;

      // DUB from title
      if (title.indexOf('dub') >= 0 || title.indexOf('дубл') >= 0 || title.indexOf('дубляж') >= 0) best.dub = true;

      // ffprobe enhancements
      if (item.ffprobe && Array.isArray(item.ffprobe)) {
        for (var k = 0; k < item.ffprobe.length; k++) {
          var stream = item.ffprobe[k];
          if (!stream) continue;

          if (stream.codec_type === 'video') {
            var h = parseInt(stream.height || 0, 10);
            var w = parseInt(stream.width || 0, 10);
            var res = null;

            if (h >= 2160 || w >= 3840) res = '4K';
            else if (h >= 1440 || w >= 2560) res = '2K';
            else if (h >= 1080 || w >= 1920) res = 'FULL HD';
            else if (h >= 720 || w >= 1280) res = 'HD';

            if (res && (!best.resolution || resOrder.indexOf(res) > resOrder.indexOf(best.resolution))) {
              best.resolution = res;
            }

            try {
              if (stream.side_data_list && JSON.stringify(stream.side_data_list).indexOf('Vision') >= 0) best.dolbyVision = true;
            } catch (e) {}

            if (stream.color_transfer === 'smpte2084' || stream.color_transfer === 'arib-std-b67') best.hdr = true;
          }

          if (stream.codec_type === 'audio' && stream.channels) {
            var ch = parseInt(stream.channels, 10);
            var aud = (ch >= 8) ? '7.1' : (ch >= 6) ? '5.1' : (ch >= 4) ? '4.0' : '2.0';
            if (!best.audio || audioOrder.indexOf(aud) > audioOrder.indexOf(best.audio)) best.audio = aud;
          }
        }
      }
    }

    if (best.dolbyVision) best.hdr = true;
    return best;
  }

  // ---------------------------
  // UI BUILD
  // ---------------------------
  function createBadgeImg(type, index) {
    var iconPath = svgIcons[type];
    if (!iconPath) return '';
    var delay = (index * 0.08) + 's';
    return (
      '<div class="quality-badge" style="animation-delay:' + delay + '">' +
        '<img src="' + iconPath + '" draggable="false" oncontextmenu="return false;">' +
      '</div>'
    );
  }

  function buildBadges(best) {
    var badges = [];
    if (best.ukr) badges.push(createBadgeImg('UKR', badges.length));
    if (best.resolution) badges.push(createBadgeImg(best.resolution, badges.length));
    if (best.hdr) badges.push(createBadgeImg('HDR', badges.length));
    if (best.dolbyVision) badges.push(createBadgeImg('Dolby Vision', badges.length));
    if (best.audio) badges.push(createBadgeImg(best.audio, badges.length));
    if (best.dub) badges.push(createBadgeImg('DUB', badges.length));
    return badges.join('');
  }

  function ensureContainers(renderRoot) {
    var $root = $(renderRoot);
    if (!$root.length) return;

    $root.find('.quality-badges-container, .quality-badges-after-details').remove();

    var $rateLine = $root.find('.full-start-new__rate-line, .full-start__rate-line').first();
    if ($rateLine.length) {
      $rateLine.append('<div class="quality-badges-container"></div>');
    }

    var $details = $root.find('.full-start-new__details, .full-start__details').first();
    if ($details.length) {
      $details.after('<div class="quality-badges-after-details"></div>');
    }
  }

  function renderBadges(renderRoot, best) {
    var $root = $(renderRoot);
    if (!$root.length) return;

    ensureContainers(renderRoot);

    $root.find('.quality-badges-container').empty();
    $root.find('.quality-badges-after-details').empty();

    var html = buildBadges(best);
    if (!html) return;

    if (settings.placement === 'rate_line') {
      $root.find('.quality-badges-container').html(html);
    } else if (settings.placement === 'after_details') {
      $root.find('.quality-badges-after-details').html(html);
    }
  }

  // ---------------------------
  // CACHE
  // ---------------------------
  function readStorageCache() {
    var cache = {};
    try { cache = (Lampa.Storage && Lampa.Storage.get) ? (Lampa.Storage.get(CACHE_KEY) || {}) : {}; } catch (e) { cache = {}; }
    return cache || {};
  }

  function writeStorageCache(cache) {
    try { if (Lampa.Storage && Lampa.Storage.set) Lampa.Storage.set(CACHE_KEY, cache); } catch (e) {}
  }

  function cacheGet(key) {
    var now = Date.now();
    if (memCache[key] && (now - memCache[key].ts) < CACHE_TTL_MS) return memCache[key].data;

    var st = readStorageCache();
    var item = st[key];
    if (item && item.ts && (now - item.ts) < CACHE_TTL_MS && item.data) {
      memCache[key] = item;
      return item.data;
    }
    return null;
  }

  function cacheSet(key, data) {
    var payload = { ts: Date.now(), data: data };
    memCache[key] = payload;

    var st = readStorageCache();
    st[key] = payload;
    writeStorageCache(st);
  }

  function makeCacheKey(movie) {
    var id = (movie && (movie.id || movie.tmdb_id)) ? String(movie.id || movie.tmdb_id) : '';
    var y = '';
    var d = movie && (movie.release_date || movie.first_air_date) ? String(movie.release_date || movie.first_air_date) : '';
    if (d && d.length >= 4) y = d.slice(0, 4);
    var t = (movie && (movie.title || movie.name)) ? String(movie.title || movie.name) : '';
    return 'v1|' + id + '|' + y + '|' + t.toLowerCase();
  }

  // ---------------------------
  // FULL CARD HOOK
  // ---------------------------
  Lampa.Listener.follow('full', function (e) {
    if (e.type !== 'complite') return;

    applyLqeHideClass();

    var renderRoot = e.object && e.object.activity && e.object.activity.render ? e.object.activity.render() : null;
    if (!renderRoot) return;

    if (settings.placement === 'off') {
      $(renderRoot).find('.quality-badges-container, .quality-badges-after-details').remove();
      return;
    }

    var movie = e.data && e.data.movie ? e.data.movie : null;
    if (!movie) return;

    if (!Lampa.Storage || !Lampa.Storage.field || !Lampa.Storage.field('parser_use')) return;

    ensureContainers(renderRoot);

    var ckey = makeCacheKey(movie);
    var cached = cacheGet(ckey);
    if (cached) {
      renderBadges(renderRoot, cached);
      return;
    }

    Lampa.Parser.get({ search: movie.title || movie.name, movie: movie, page: 1 }, function (response) {
      if (!response || !response.Results || !response.Results.length) return;

      var best = getBest(response.Results);

      if (best && (best.ukr || best.resolution || best.hdr || best.dolbyVision || best.audio || best.dub)) {
        cacheSet(ckey, best);
      }

      renderBadges(renderRoot, best);
    });
  });

  // ---------------------------
  // SETTINGS UI (NO DUPES)
  // ---------------------------
  (function registerSettings() {
    function toast(msg) {
      try {
        if (Lampa && typeof Lampa.Noty === 'function') { Lampa.Noty(msg); return; }
        if (Lampa && Lampa.Noty && Lampa.Noty.show) { Lampa.Noty.show(msg); return; }
      } catch (e) {}
    }

    function openSettings() {
      // Just open the page; params are registered once
      Lampa.Settings.create('svgq', {
        title: 'SVG Якість',
        onBack: function () { Lampa.Settings.create('interface'); }
      });
    }

    function registerParamsOnce() {
      if (svgq_params_added) return;
      svgq_params_added = true;

      // Placement
      Lampa.SettingsApi.addParam({
        component: 'svgq',
        param: {
          name: 'svgq_place',
          type: 'select',
          values: {
            rate_line: 'Показувати в рядку рейтингів',
            after_details: 'Показувати після details',
            off: 'Вимкнено'
          },
          default: settings.placement
        },
        field: { name: 'Якість в картці', description: 'Де показувати SVG-іконки якості у повній картці' },
        onChange: function (v) {
          settings.placement = String(v || 'rate_line');
          saveSettings();
          toast('Збережено');
        }
      });

      // Hide LQE label
      Lampa.SettingsApi.addParam({
        component: 'svgq',
        param: {
          name: 'svgq_hide_lqe',
          type: 'select',
          values: { 'true': 'Так', 'false': 'Ні' },
          default: String(!!settings.hide_lqe)
        },
        field: { name: 'Приховати текстову мітку (Quality+Mod) у Full Card', description: 'Ховає .lqe-quality, якщо SVG увімкнений' },
        onChange: function (v) {
          settings.hide_lqe = (String(v) === 'true');
          saveSettings();
          toast('Збережено');
        }
      });

      // Clear cache button
      Lampa.SettingsApi.addParam({
        component: 'svgq',
        param: { type: 'button', component: 'svgq_clear_cache' },
        field: { name: 'Очистити кеш SVG' },
        onChange: function () {
          try {
            memCache = {};
            writeStorageCache({});
            toast('Кеш очищено');
          } catch (e) {}
        }
      });
    }

    function init() {
      if (!Lampa || !Lampa.SettingsApi || !Lampa.Template) return;

      // Register settings page params once (fix empty + duplicates)
      setTimeout(registerParamsOnce, 0);

      // Button entry in Interface settings
      Lampa.Template.add('settings_svgq', '<div></div>');
      Lampa.SettingsApi.addParam({
        component: 'interface',
        param: { type: 'button', component: 'svgq' },
        field: { name: 'SVG Якість', description: 'SVG-іконки якості (Full Card)' },
        onChange: openSettings
      });

      applyLqeHideClass();
    }

    if (window.appready) init();
    else if (Lampa && Lampa.Listener) Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') init(); });
  })();

  // ---------------------------
  // STYLES
  // ---------------------------
  var style = '<style id="svgq_styles">\
    body.svgq-hide-lqe .full-start__status.lqe-quality{ display:none !important; }\
    \
    /* Rate-line placement: allow wrapping without overlaps */\
    .quality-badges-container{\
      display:inline-flex;\
      flex-wrap:wrap;\
      align-items:center;\
      column-gap:0.30em;\
      row-gap:0.22em;\
      margin:0.18em 0 0 0.45em;\
      min-height:1.2em;\
      pointer-events:none;\
      vertical-align:middle;\
      max-width:100%;\
    }\
    \
    /* After-details placement + bottom spacing */\
    .quality-badges-after-details{\
      display:flex;\
      flex-wrap:wrap;\
      align-items:center;\
      column-gap:0.30em;\
      row-gap:0.22em;\
      margin:0.35em 0 0.45em 0;\
      min-height:1.2em;\
      pointer-events:none;\
      max-width:100%;\
    }\
    \
    /* Badge with universal frame (for ALL icons) */\
    .quality-badge{\
      height:1.2em;\
      opacity:0;\
      transform:translateY(8px);\
      animation:qb_in 0.4s ease forwards;\
      display:inline-flex;\
      align-items:center;\
      justify-content:center;\
      padding:0.10em 0.14em;\
      border:1px solid rgba(255,255,255,0.35);\
      border-radius:0.26em;\
      background:rgba(0,0,0,0.10);\
      box-sizing:border-box;\
    }\
    @keyframes qb_in{ to{ opacity:1; transform:translateY(0);} }\
    .quality-badge img{ height:100%; width:auto; display:block; }\
    .quality-badge img{ filter: drop-shadow(0 1px 2px #000); }\
    \
    @media (max-width:768px){\
      .quality-badges-container{ column-gap:0.26em; row-gap:0.18em; min-height:1em; margin-left:0.35em; margin-top:0.16em; }\
      .quality-badges-after-details{ column-gap:0.26em; row-gap:0.18em; min-height:1em; margin-bottom:0.40em; }\
      .quality-badge{ height:1em; padding:0.09em 0.13em; }\
    }\
  </style>';

  $('body').append(style);

  applyLqeHideClass();

  console.log('[SVG Quality] Updated: settings no-dupes, universal frames, spacing tweaks.');
})();

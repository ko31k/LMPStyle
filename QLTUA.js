//Оригінальний плагін https://github.com/FoxStudio24/lampa/blob/main/Quality/Quality.js
//SVG Quality Badges (Full card only) + settings
//Працює при увімкненому парсері

(function () {
  'use strict';

  // =====================================================================
  // CONFIG
  // =====================================================================

  // RAW github icons folder (твій шлях)
  // ⚠️ Тут саме /img/
  var pluginPath = 'https://raw.githubusercontent.com/ko31k/LMP/main/wwwroot/img/';

  // ✅ ВАЖЛИВО: пробіли в назвах — через %20 (FULL%20HD.svg, Dolby%20Vision.svg)
  var svgIcons = {
    '4K': pluginPath + '4K.svg',
    '2K': pluginPath + '2K.svg',
    'FULL HD': pluginPath + 'FULL%20HD.svg',
    'HD': pluginPath + 'HD.svg',
    'HDR': pluginPath + 'HDR.svg',
    'Dolby Vision': pluginPath + 'Dolby%20Vision.svg',
    '7.1': pluginPath + '7.1.svg',
    '5.1': pluginPath + '5.1.svg',
    '4.0': pluginPath + '4.0.svg',
    '2.0': pluginPath + '2.0.svg',
    'DUB': pluginPath + 'DUB.svg',
    'UKR': pluginPath + 'UKR.svg'
  };

  // Settings key
  var SETTINGS_KEY = 'svgq_user_settings_v2';

  // Default settings
  var st = {
    // "rate" | "after_details" | "off"
    placement: 'rate',

    // Hide old LQE full-card text label when SVG is ON
    hide_lqe: true,

    // Якщо rate-line “забитий” — переносимо SVG на новий рядок (flex-basis:100%)
    force_new_line: false
  };

  // =====================================================================
  // SETTINGS: load/save/apply
  // =====================================================================

  function loadSettings() {
    var s = {};
    try { s = Lampa.Storage.get(SETTINGS_KEY, {}) || {}; } catch (e) { s = {}; }

    st.placement = (s.placement === 'after_details' || s.placement === 'off' || s.placement === 'rate')
      ? s.placement
      : 'rate';

    st.hide_lqe = (typeof s.hide_lqe === 'boolean') ? s.hide_lqe : true;
    st.force_new_line = (typeof s.force_new_line === 'boolean') ? s.force_new_line : false;
  }

  function saveSettings() {
    try { Lampa.Storage.set(SETTINGS_KEY, st); } catch (e) {}
    applySettings();
    toast('Збережено');
  }

  function applySettings() {
    // Ховаємо LQE-мінтку (текст) коли включено hide_lqe
    if (document && document.body) {
      document.body.classList.toggle('svgq-hide-lqe', !!st.hide_lqe);
    }
  }

  function toast(msg) {
    try {
      if (Lampa && typeof Lampa.Noty === 'function') { Lampa.Noty(msg); return; }
      if (Lampa && Lampa.Noty && Lampa.Noty.show) { Lampa.Noty.show(msg); return; }
    } catch (e) {}
    // fallback toast
    var id = 'svgq_toast';
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement('div');
      el.id = id;
      el.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:2rem;padding:.6rem 1rem;background:rgba(0,0,0,.85);color:#fff;border-radius:.5rem;z-index:9999;font-size:14px;transition:opacity .2s;opacity:0';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = '1';
    setTimeout(function () { el.style.opacity = '0'; }, 1200);
  }

  // =====================================================================
  // getBest() – основа твоя, але підсилено:
  //  - кращий детект UKR
  //  - DUB
  //  - audio channels fallback по title (якщо ffprobe нема)
  //  - пріоритети (DV => HDR)
  // =====================================================================

  function hasUkrAudioMarkers(titleLower) {
    if (!titleLower) return false;

    // ✅ Сильні маркери
    // - ukr / ua як ОКРЕМІ токени, або "2xukr", "ukr+eng", "ukr dub", тощо
    // - укр як окремий токен
    // - українська/украинский/ukrainian
    var strong =
      /(?:^|[\s\[\(\{\/\|,._-])(?:2x\s*)?ukr(?:$|[\s\]\)\}\/\|,._-])/i.test(titleLower) ||
      /(?:^|[\s\[\(\{\/\|,._-])ua(?:$|[\s\]\)\}\/\|,._-])/i.test(titleLower) ||
      /(?:^|[\s\[\(\{\/\|,._-])укр(?:$|[\s\]\)\}\/\|,._-])/i.test(titleLower) ||
      /україн|украин|ukrain/i.test(titleLower);

    // ✅ Додатково: “dub ukr”, “ukr dubbing”, “укр дубляж”
    var dubUkr =
      /(?:dub|dubbing|дубл|дубляж)[^\n]{0,16}(?:ukr|ua|укр)/i.test(titleLower) ||
      /(?:ukr|ua|укр)[^\n]{0,16}(?:dub|dubbing|дубл|дубляж)/i.test(titleLower);

    return !!(strong || dubUkr);
  }

  function hasDub(titleLower) {
    if (!titleLower) return false;
    return /(?:^|[\s\[\(\{\/\|,._-])dub(?:$|[\s\]\)\}\/\|,._-])|дубл|дубляж/i.test(titleLower);
  }

  function detectAudioFromTitle(titleLower) {
    if (!titleLower) return null;

    // ⚠️ тільки як fallback (коли ffprobe нема)
    // типові маркери: 7.1, 5.1, 2.0, 6ch, 8ch
    if (/\b7[\.\s]?1\b|\b8ch\b|\b8\s*ch\b|\b7\s*1\b/i.test(titleLower)) return '7.1';
    if (/\b5[\.\s]?1\b|\b6ch\b|\b6\s*ch\b|\b5\s*1\b/i.test(titleLower)) return '5.1';
    if (/\b4[\.\s]?0\b|\b4ch\b|\b4\s*ch\b|\b4\s*0\b/i.test(titleLower)) return '4.0';
    if (/\b2[\.\s]?0\b|\b2ch\b|\b2\s*ch\b|\b2\s*0\b/i.test(titleLower)) return '2.0';
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

      // UKR
      if (!best.ukr && hasUkrAudioMarkers(tl)) best.ukr = true;

      // DUB
      if (!best.dub && hasDub(tl)) best.dub = true;

      // Resolution from title
      var foundRes = null;
      if (tl.indexOf('4k') >= 0 || tl.indexOf('2160') >= 0 || tl.indexOf('uhd') >= 0) foundRes = '4K';
      else if (tl.indexOf('2k') >= 0 || tl.indexOf('1440') >= 0) foundRes = '2K';
      else if (tl.indexOf('1080') >= 0 || tl.indexOf('fhd') >= 0 || tl.indexOf('full hd') >= 0) foundRes = 'FULL HD';
      else if (tl.indexOf('720') >= 0 || /\bhd\b/.test(tl)) foundRes = 'HD';

      if (foundRes && (!best.resolution || resOrder.indexOf(foundRes) > resOrder.indexOf(best.resolution))) {
        best.resolution = foundRes;
      }

      // HDR / DV from title
      if (tl.indexOf('vision') >= 0 || tl.indexOf('dolby vision') >= 0 || tl.indexOf('dovi') >= 0) best.dolbyVision = true;
      if (tl.indexOf('hdr') >= 0) best.hdr = true;

      // ffprobe (пріоритет)
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

            if (res && (!best.resolution || resOrder.indexOf(res) > resOrder.indexOf(best.resolution))) {
              best.resolution = res;
            }

            try {
              // DV hint
              if (stream.side_data_list && JSON.stringify(stream.side_data_list).indexOf('Vision') >= 0) best.dolbyVision = true;
              // HDR hint
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
        // audio fallback by title (тільки якщо ffprobe нема)
        if (!best.audio) {
          var a = detectAudioFromTitle(tl);
          if (a) best.audio = a;
        }
      }
    }

    // DV implies HDR
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
    return (
      '<div class="quality-badge" style="animation-delay:' + delay + '">' +
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
    // чистимо старі контейнери (щоб не було дублікатів при повторному відкритті)
    $('.quality-badges-container, .quality-badges-after-details', renderRoot).remove();

    if (st.placement === 'off') return null;

    if (st.placement === 'rate') {
      // контейнер всередині rate-line
      var rateLine = $('.full-start-new__rate-line, .full-start__rate-line', renderRoot).first();
      if (!rateLine.length) return null;

      // ✅ якщо треба гарантовано новий рядок — робимо flex-item на 100%
      // (rate-line у Lampa — flex, тому це працює)
      var cls = 'quality-badges-container' + (st.force_new_line ? ' svgq-breakline' : '');
      var el = $('<div class="' + cls + '"></div>');
      rateLine.append(el);
      return el;
    }

    if (st.placement === 'after_details') {
      // після details (як ти і хотів)
      var details = $('.full-start-new__details, .full-start__details', renderRoot).first();
      if (!details.length) return null;

      var el2 = $('<div class="quality-badges-after-details"></div>');
      details.after(el2);
      return el2;
    }

    return null;
  }

  function applyBadgesToFullCard(movie, renderRoot) {
    if (!movie || !renderRoot) return;

    // якщо парсер не включений — нічого не робимо (як і домовлялись)
    if (!Lampa || !Lampa.Storage || !Lampa.Storage.field || !Lampa.Storage.field('parser_use')) return;

    var container = ensureContainer(renderRoot);
    if (!container) return;

    // тимчасово можна показувати порожньо, поки йде пошук
    container.html('');

    Lampa.Parser.get(
      { search: movie.title || movie.name, movie: movie, page: 1 },
      function (response) {
        if (!response || !response.Results) return;

        var best = getBest(response.Results);
        var html = buildBadgesHtml(best);
        container.html(html);
      }
    );
  }

  // =====================================================================
  // Styles (UPDATED FULL BLOCK)
  // =====================================================================

  // ⚙️ ТУТ КОРИГУЄШ РОЗМІР ІКОНОК ПІД СВОЮ “текстову мітку”:
  // - --svgq-badge-h = висота бейджа (зараз ~як fullcard label 1.72em)
  // - --svgq-pad-y/x = внутрішні відступи рамки
  // - --svgq-gap-x/y = відступи між бейджами
  // - --svgq-after-mb = нижній відступ для after_details
  var style = '<style id="svgq_styles">\
    /* Hide old LQE text label when SVG quality is enabled */\
    body.svgq-hide-lqe .full-start__status.lqe-quality{ display:none !important; }\
    \
    :root{\
      /* ===== SIZE TUNING (edit here) ===== */\
      --svgq-badge-h: 1.72em;     /* ⬅️ висота бейджів (як твоя текстова мітка в fullcard) */\
      --svgq-pad-y: 0.11em;       /* ⬅️ вертикальний padding рамки */\
      --svgq-pad-x: 0.16em;       /* ⬅️ горизонтальний padding рамки */\
      --svgq-gap-x: 0.32em;       /* ⬅️ відступ між бейджами по X */\
      --svgq-gap-y: 0.24em;       /* ⬅️ відступ між бейджами по Y при переносі */\
      --svgq-rate-ml: 0.48em;     /* ⬅️ відступ зліва в rate-line */\
      --svgq-rate-mt: 0.20em;     /* ⬅️ відступ зверху в rate-line */\
      --svgq-after-mt: 0.38em;    /* ⬅️ відступ зверху після details */\
      --svgq-after-mb: 0.68em;    /* ⬅️ ВАЖЛИВО: більший відступ знизу after_details */\
      --svgq-radius: 0.32em;      /* ⬅️ заокруглення “як у SVG” */\
    }\
    \
    /* ===================================================== */\
    /* Rate-line placement (inline, wraps, no overlaps) */\
    /* ===================================================== */\
    .quality-badges-container{\
      display:inline-flex;\
      flex-wrap:wrap;\
      align-items:center;\
      column-gap:var(--svgq-gap-x);\
      row-gap:var(--svgq-gap-y);\
      margin:var(--svgq-rate-mt) 0 0 var(--svgq-rate-ml);\
      min-height:var(--svgq-badge-h);\
      pointer-events:none;\
      vertical-align:middle;\
      max-width:100%;\
    }\
    \
    /* ✅ якщо включено “гарантовано новий рядок” */\
    .quality-badges-container.svgq-breakline{\
      display:flex;\
      flex-basis:100%;\
      width:100%;\
      margin-left:0 !important;\
    }\
    \
    /* ===================================================== */\
    /* After-details placement (separate row + bottom space) */\
    /* ===================================================== */\
    .quality-badges-after-details{\
      display:flex;\
      flex-wrap:wrap;\
      align-items:center;\
      column-gap:var(--svgq-gap-x);\
      row-gap:var(--svgq-gap-y);\
      margin:var(--svgq-after-mt) 0 var(--svgq-after-mb) 0;\
      min-height:var(--svgq-badge-h);\
      pointer-events:none;\
      max-width:100%;\
    }\
    \
    /* ===================================================== */\
    /* Universal badge shell – thin white frame like in SVG */\
    /* ===================================================== */\
    .quality-badge{\
      height:var(--svgq-badge-h);\
      display:inline-flex;\
      align-items:center;\
      justify-content:center;\
      padding:var(--svgq-pad-y) var(--svgq-pad-x);\
      box-sizing:border-box;\
      border-radius:var(--svgq-radius);\
      background:rgba(0,0,0,0.10);\
      position:relative;\
      opacity:0;\
      transform:translateY(8px);\
      animation:qb_in 0.38s ease forwards;\
    }\
    \
    /* тонка біла рамка + легкий inner highlight (як “намальовано в SVG”) */\
    .quality-badge:before{\
      content:"";\
      position:absolute;\
      inset:0;\
      border-radius:inherit;\
      border:1px solid rgba(255,255,255,0.70);\
      box-shadow:\
        inset 0 0 0 1px rgba(255,255,255,0.08),\
        0 1px 2px rgba(0,0,0,0.35);\
      pointer-events:none;\
    }\
    \
    @keyframes qb_in{ to{ opacity:1; transform:translateY(0);} }\
    \
    /* ===================================================== */\
    /* Icon rendering */\
    /* ===================================================== */\
    .quality-badge img{\
      height:100%;\
      width:auto;\
      display:block;\
      filter:drop-shadow(0 1px 2px rgba(0,0,0,0.85));\
    }\
    \
    /* Dolby Vision – optical size fix (бо SVG трохи “більший”) */\
    .quality-badge img[src*="Dolby"],\
    .quality-badge img[src*="dolby"]{\
      transform:scale(0.88);\
      transform-origin:center center;\
    }\
    \
    /* ===================================================== */\
    /* Mobile adjustments */\
    /* ===================================================== */\
    @media (max-width:768px){\
      :root{\
        --svgq-badge-h: 1.45em;   /* ⬅️ мобільна висота */\
        --svgq-pad-y: 0.09em;\
        --svgq-pad-x: 0.13em;\
        --svgq-gap-x: 0.26em;\
        --svgq-gap-y: 0.18em;\
        --svgq-rate-ml: 0.38em;\
        --svgq-rate-mt: 0.18em;\
        --svgq-after-mb: 0.62em;\
      }\
      .quality-badge img[src*="Dolby"],\
      .quality-badge img[src*="dolby"]{\
        transform:scale(0.86);\
      }\
    }\
  </style>';

  function injectStyleOnce() {
    if (document.getElementById('svgq_styles')) return;
    $('body').append(style);
  }

  // =====================================================================
  // Settings UI (fix: no empty, no duplicates)
  // =====================================================================

  function registerSettingsUIOnce() {
    if (window.__svgq_settings_registered) return;
    window.__svgq_settings_registered = true;

    // button in Interface
    Lampa.Template.add('settings_svgq', '<div></div>');

    Lampa.SettingsApi.addParam({
      component: 'interface',
      param: { type: 'button', component: 'svgq' },
      field: {
        name: 'SVG якість',
        description: 'SVG бейджі якості у повній картці (працює з парсером)'
      },
      onChange: function () {
        Lampa.Settings.create('svgq', {
          template: 'settings_svgq',
          onBack: function () { Lampa.Settings.create('interface'); }
        });
      }
    });

    // placement select
    Lampa.SettingsApi.addParam({
      component: 'svgq',
      param: {
        name: 'svgq_placement',
        type: 'select',
        values: {
          rate: 'Показувати в рядку рейтингів (rate-line)',
          after_details: 'Показувати після details (як було)',
          off: 'Вимкнено'
        },
        default: st.placement
      },
      field: { name: 'Якість в картці' },
      onChange: function (v) { st.placement = String(v); saveSettings(); }
    });

    // hide LQE label toggle
    Lampa.SettingsApi.addParam({
      component: 'svgq',
      param: {
        name: 'svgq_hide_lqe',
        type: 'select',
        values: { 'true': 'Так', 'false': 'Ні' },
        default: String(!!st.hide_lqe)
      },
      field: { name: 'Приховувати текстову мітку Quality+Mod (LQE) у full card' },
      onChange: function (v) { st.hide_lqe = (String(v) === 'true'); saveSettings(); }
    });

    // force new line in rate-line
    Lampa.SettingsApi.addParam({
      component: 'svgq',
      param: {
        name: 'svgq_force_new_line',
        type: 'select',
        values: { 'false': 'Ні', 'true': 'Так' },
        default: String(!!st.force_new_line)
      },
      field: { name: 'Коли rate-line забитий — переносити SVG бейджі на новий рядок' },
      onChange: function (v) { st.force_new_line = (String(v) === 'true'); saveSettings(); }
    });
  }

  function startSettings() {
    loadSettings();
    applySettings();

    if (Lampa && Lampa.SettingsApi && typeof Lampa.SettingsApi.addParam === 'function') {
      // ✅ важливо: реєструємо після готовності, і ОДИН раз
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

      // settings init on first run
      if (!window.__svgq_settings_inited) {
        window.__svgq_settings_inited = true;

        // запускаємо settings реєстрацію після app ready
        if (window.appready) startSettings();
        else if (Lampa && Lampa.Listener) {
          Lampa.Listener.follow('app', function (ev) {
            if (ev.type === 'ready') startSettings();
          });
        }
      }

      // apply badges
      var detailsRender = $('.full-start-new__details').closest('.full-start-new');
      if (!detailsRender.length) detailsRender = $('.full-start__details').closest('.full-start');

      var root = detailsRender.length ? detailsRender : $(e.object.activity.render());

      applyBadgesToFullCard(e.data.movie, root);
    } catch (err) {
      console.error('[SVGQ] error:', err);
    }
  });

  console.log('[SVGQ] loaded');

})();

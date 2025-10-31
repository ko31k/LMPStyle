
/*
 * Plugin: Interface 1to1 (Info panel + Colored rating + Themes)
 * Author: ChatGPT (clean reimplementation)
 * Description: Full, non-obfuscated implementation of three features extracted from Interface+:
 *   1) New info panel (colored & rephrased)
 *   2) Colored rating (votes)
 *   3) Themes: Emerald V1, Emerald V2, Aurora
 *
 * Goal: behavior-equivalent (1:1) for the requested parts, menu kept same-style but contains only these items.
 */
(function () {
  'use strict';

  // ---------- I18N ----------
  Lampa.Lang.add({
    interface_1to1_plugin_name: { uk: 'Інтерфейс (1:1)', ru: 'Интерфейс (1:1)', en: 'Interface (1:1)' },

    interface_1to1_info_panel: { uk: 'Нова інфо-панель', ru: 'Новая инфо-панель', en: 'New info panel' },
    interface_1to1_info_panel_desc: { uk: 'Кольорова та перефразована інформаційна панель', ru: 'Цветная и перефразированная инфо-панель', en: 'Colored, rephrased info panel' },

    interface_1to1_colored_ratings: { uk: 'Кольоровий рейтинг', ru: 'Цветной рейтинг', en: 'Colored rating' },
    interface_1to1_colored_ratings_desc: { uk: 'Увімкнути кольорове виділення рейтингу', ru: 'Включить цветовое выделение рейтинга', en: 'Enable colorized rating' },

    interface_1to1_theme_select: { uk: 'Тема інтерфейсу', ru: 'Тема интерфейса', en: 'Interface theme' },
    interface_1to1_theme_select_desc: { uk: 'Оберіть тему оформлення', ru: 'Выберите тему оформления', en: 'Choose interface theme' },
    interface_1to1_theme_default: { uk: 'За замовчуванням', ru: 'По умолчанию', en: 'Default' },
    interface_1to1_theme_emerald_v1: { uk: 'Emerald V1', ru: 'Emerald V1', en: 'Emerald V1' },
    interface_1to1_theme_emerald_v2: { uk: 'Emerald V2', ru: 'Emerald V2', en: 'Emerald V2' },
    interface_1to1_theme_aurora: { uk: 'Aurora', ru: 'Aurora', en: 'Aurora' }
  });

  // ---------- SETTINGS (persist) ----------
  var settings = {
    info_panel: Lampa.Storage.get('interface_1to1_info_panel', true),
    colored_ratings: Lampa.Storage.get('interface_1to1_colored_ratings', true),
    theme: Lampa.Storage.get('interface_1to1_theme', 'default'),
  };

  // ---------- THEME ENGINE (Emerald V1 / V2 / Aurora) ----------
  function applyTheme(theme) {
    var old = document.querySelector('#interface_1to1_theme');
    if (old) old.remove();

    // disable any external theme <link id="theme-style-*">
    document.querySelectorAll('[id^="theme-style-"]').forEach(function (el) { el.disabled = true; });

    if (!theme || theme === 'default') return;

    // allow external <link id="theme-style-emerald_v1"> overrides
    var external = document.querySelector('#theme-style-' + theme);
    if (external) { external.disabled = false; return; }

    var style = document.createElement('style');
    style.id = 'interface_1to1_theme';

    var css = {
      emerald_v1: `
        :root {
          --il-bg:#0b0f0c; --il-panel:#0f1712; --il-text:#e8fff4; --il-muted:#99b5a7;
          --il-accent:#2ecc71; --il-accent-2:#27ae60; --il-card:#111a14;
        }
        body { background: var(--il-bg) !important; color: var(--il-text) !important; }
        .menu__item, .settings-folder, .settings-param, .selector { background: transparent; }
        .menu__item.focus, .menu__item.traverse, .settings-folder.focus, .settings-param.focus,
        .selector.focus, .selector.hover {
          background: linear-gradient(90deg, var(--il-accent-2), var(--il-accent));
          color:#fff !important; text-shadow:none;
        }
        .items-line__title, .full-start__title, .full-start-new__title,
        .settings-param__name, .settings-folder__name { color: var(--il-text) !important; }
        .background--gradient::before { background: radial-gradient(800px 400px at 80% -10%, rgba(46,204,113,.15), transparent); }
        .full-start__button, .button { border-radius:12px; }
        .card__view, .full-start-new__details span, .ilite-pill { border-radius:6px; }
      `,
      emerald_v2: `
        :root {
          --il-bg:#0a0f0d; --il-panel:rgba(20,30,24,.66); --il-text:#e9fff4; --il-muted:#9bdabf;
          --il-accent:#3ee98f; --il-accent-2:#19c37d;
        }
        body { background: linear-gradient(135deg, #06130d 0%, #0a1813 100%) !important; color: var(--il-text) !important; }
        .menu__item, .settings-param, .settings-folder { backdrop-filter: blur(8px); background: var(--il-panel); border-radius:12px; }
        .menu__item.focus, .menu__item.traverse, .settings-folder.focus, .settings-param.focus,
        .selector.focus, .selector.hover {
          background: linear-gradient(135deg, var(--il-accent-2), var(--il-accent));
          color:#06130d !important; text-shadow:none;
        }
        .full-start__button, .button { border-radius:16px; }
        .items-line__title { color: var(--il-text) !important; }
      `,
      aurora: `
        :root { --il-text:#ffffff; }
        body { background: linear-gradient(135deg, #0d0221 0%, #150734 50%, #1f0c47 100%) !important; color: var(--il-text) !important; }
        .menu__item.focus, .menu__item.traverse, .settings-folder.focus, .settings-param.focus,
        .selector.focus, .selector.hover { background: linear-gradient(90deg,#1CB5E0,#000851); color:#fff !important; }
        .full-start__button, .button { border-radius:14px; }
        .items-line__title { 
          background: linear-gradient(90deg,#FFDEE9,#B5FFFC); -webkit-background-clip:text; background-clip:text; color:transparent;
          animation: il-gradient-text 8s ease infinite; background-size:200% 200%;
        }
        @keyframes il-gradient-text { 0%{background-position:0 50%} 50%{background-position:100% 50%} 100%{background-position:0 50%} }
      `
    };

    style.textContent = css[theme] || '';
    document.head.appendChild(style);
  }

  // ---------- COLORED RATING (1:1 thresholds) ----------
  function colorByVote(v) {
    if (isNaN(v)) return '';
    if (v >= 0 && v <= 3) return 'red';
    if (v > 3 && v < 6) return 'orange';
    if (v >= 6 && v < 8) return 'cornflowerblue';
    if (v >= 8 && v <= 10) return 'lawngreen';
    return '';
  }
  function updateVoteColors() {
    if (!settings.colored_ratings) return;
    var nodes = document.querySelectorAll([
      '.card__vote', '.full-start__rate', '.full-start-new__rate',
      '.info__rate', '.card__imdb-rate', '.card__kinopoisk-rate'
    ].join(','));
    nodes.forEach(function (el) {
      var t = (el.textContent||'').trim().replace(',', '.');
      var v = parseFloat(t);
      var color = colorByVote(v);
      if (color) el.style.color = color;
    });
  }
  function setupVoteColorsObserver() {
    if (!settings.colored_ratings) return;
    setTimeout(updateVoteColors, 180);
    var obs = new MutationObserver(function(){ setTimeout(updateVoteColors, 60); });
    obs.observe(document.body, { childList: true, subtree: true });
    Lampa.Listener.follow('full', function (e) { if (e.type === 'complite') setTimeout(updateVoteColors, 120); });
  }

  // ---------- NEW INFO PANEL (exact-like: pluralization, duration calc, chips, 3 rows) ----------
  // Declension helper (UA/RU)
  function plural(number, one, two, five) {
    var n = Math.abs(number) % 100;
    if (n >= 5 && n <= 20) return five;
    n = n % 10;
    if (n === 1) return one;
    if (n >= 2 && n <= 4) return two;
    return five;
  }

  // Average episode runtime with outlier filtering (<=200 min)
  function calculateAverageEpisodeDuration(movie) {
    if (!movie || typeof movie !== 'object') return 0;
    var total = 0, count = 0;

    if (movie.episode_run_time && Array.isArray(movie.episode_run_time) && movie.episode_run_time.length > 0) {
      var filtered = movie.episode_run_time.filter(function (d) { return d > 0 && d <= 200; });
      filtered.forEach(function (d) { total += d; count++; });
    } else if (movie.seasons && Array.isArray(movie.seasons)) {
      movie.seasons.forEach(function (season) {
        if (season && Array.isArray(season.episodes)) {
          season.episodes.forEach(function (ep) {
            if (ep && ep.runtime && ep.runtime > 0 && ep.runtime <= 200) { total += ep.runtime; count++; }
          });
        }
      });
    }

    if ((!total || !count) && movie.last_episode_to_air && movie.last_episode_to_air.runtime > 0 && movie.last_episode_to_air.runtime <= 200) {
      return movie.last_episode_to_air.runtime;
    }
    return count ? Math.round(total / count) : 0;
  }

  function formatDurationMinutes(mins) {
    if (!mins || mins <= 0) return '';
    var h = Math.floor(mins / 60);
    var m = mins % 60;
    if (h > 0 && m > 0) return h + ' ' + plural(h, 'година', 'години', 'годин') + ' ' + m + ' ' + plural(m, 'хвилина', 'хвилини', 'хвилин');
    if (h > 0) return h + ' ' + plural(h, 'година', 'години', 'годин');
    return m + ' ' + plural(m, 'хвилина', 'хвилини', 'хвилин');
  }

  function buildInfoPanelOnce(container) {
    if (!settings.info_panel) return;
    if (!container || container.dataset.i101Built === '1') return;
    container.dataset.i101Built = '1';

    var tmp = document.createElement('div');
    tmp.innerHTML = container.innerHTML;

    // Remove default 'Next' textual markers like "Наступна:" or "Залишилось днів:" if present
    Array.prototype.slice.call(tmp.querySelectorAll('span')).forEach(function (sp) {
      var t = (sp.textContent || '').trim();
      if (/Наступна:|Залишилось днів:/.test(t)) sp.remove();
    });

    var colors = {
      seasons: { bg: 'rgba(52,152,219,.95)', text: '#fff' },
      episodes: { bg: 'rgba(46,204,113,.95)', text: '#fff' },
      duration: { bg: 'rgba(155,89,182,.95)', text: '#fff' },
      next: { bg: 'rgba(243,156,18,.92)', text: '#000' },
      age: { bg: 'rgba(52,73,94,.9)', text: '#fff' }
    };

    var genreColors = {
      'Бойовик':'#e74c3c','Боевик':'#e74c3c','Пригоди':'#27ae60','Приключения':'#27ae60',
      'Мультфільм':'#9b59b6','Мультфильм':'#9b59b6','Комедія':'#f1c40f','Комедия':'#f1c40f',
      'Кримінал':'#c0392b','Криминал':'#c0392b','Документальний':'#16a085','Документальный':'#16a085',
      'Драма':'#8e44ad','Сімейний':'#2ecc71','Семейный':'#2ecc71','Фентезі':'#9b59b6','Фэнтези':'#9b59b6',
      'Фантастика':'#2980b9','Історія':'#d35400','История':'#d35400','Жахи':'#c0392b','Ужасы':'#c0392b',
      'Музика':'#3498db','Музыка':'#3498db','Детектив':'#34495e','Таємниця':'#7f8c8d','Мелодрама':'#e91e63',
      'Романтика':'#e91e63','Науковий':'#7f8c8d','ТВ фільм':'#2980b9','ТВ фильм':'#2980b9','Трилер':'#c0392b','Триллер':'#c0392b',
      'Війна':'#95a5a6','Война':'#95a5a6','Вестерн':'#8e44ad','Дитячий':'#2ecc71','Новини':'#3498db'
    };

    function pill(text, bg, fg) {
      var s = document.createElement('span');
      s.className = 'ilite-pill';
      s.textContent = text;
      s.style.cssText = 'display:inline-block;margin:0 0.4em 0.3em 0;padding:0.25em 0.6em;border-radius:0.35em;font-size:1em;line-height:1.2em;background:'+bg+';color:'+fg+';white-space:nowrap;';
      return s;
    }

    var row1 = document.createElement('div'); row1.style.cssText='display:flex;flex-wrap:wrap;gap:.25em;align-items:center;margin:0 0 .2em 0;';
    var row2 = document.createElement('div'); row2.style.cssText='display:flex;flex-wrap:wrap;gap:.25em;align-items:center;';
    var row3 = document.createElement('div'); row3.style.cssText='display:flex;flex-wrap:wrap;gap:.25em;align-items:center;margin:.2em 0 0 0;';

    var spans = Array.prototype.slice.call(tmp.querySelectorAll('span'));
    var had = false;

    spans.forEach(function (sp) {
      var t = (sp.textContent || '').trim();
      if (!t || sp.classList.contains('full-start-new__split')) return;

      // Seasons
      var mSeasons = t.match(/Сезон(?:ы|и)?\s*:?\s*(\d+)/i) || t.match(/(\d+)\s+Сезон(?:а|ів)?/i) || t.match(/Season\s*:?\s*(\d+)/i);
      if (mSeasons) {
        var n = parseInt(mSeasons[1],10);
        row1.appendChild(pill(n + ' ' + plural(n,'Сезон','Сезони','Сезонів'), colors.seasons.bg, colors.seasons.text));
        had = true; return;
      }

      // Episodes
      var mEp = t.match(/Сер(и|ії|ий|ій):?\s*(\d+)/i) || t.match(/(\d+)\s+Сер(і|и|ий|ій)/i) || t.match(/Ep(isodes)?\s*:?\s*(\d+)/i);
      if (mEp) {
        var e = parseInt((mEp[2]||mEp[1]),10);
        row1.appendChild(pill(e + ' ' + plural(e,'Серія','Серії','Серій'), colors.episodes.bg, colors.episodes.text));
        had = true; return;
      }

      // Duration-like text
      if (/Тривалість|Продолжительность|Runtime|Время|≈|мин\.|минут|minutes|hour|ч\./i.test(t)) {
        row1.appendChild(pill(t.replace(/\s+/g,' '), colors.duration.bg, colors.duration.text)); had = true; return;
      }

      // Next ep / air info
      if (/Наступна|Следующая|Next|Эпизод|Епізод/i.test(t) || /Залишилось днів|Осталось дней|Days left/i.test(t)) {
        row1.appendChild(pill(t, colors.next.bg, colors.next.text)); had = true; return;
      }

      // Age/PG
      if (/(\bPG\b|\bR\b|TV-|\+\d{1,2}|\d{1,2}\+|NC-17|G\b|M\b)/.test(t)) { row2.appendChild(pill(t, colors.age.bg, colors.age.text)); had = true; return; }

      // Genres – comma or slash separated
      if (/(,|\/)/.test(t) && t.split(/,|\//).length >= 2) {
        t.split(/,|\//).map(function(x){return x.trim();}).filter(Boolean).forEach(function(g){
          var col = genreColors[g] || 'rgba(44,62,80,.55)';
          row3.appendChild(pill(g, col, '#fff'));
          had = true;
        });
        return;
      }
    });

    // If duration wasn't found in spans, try compute from Lampa.Source movie data
    try {
      var movie = Lampa && Lampa.Source ? (Lampa.Source.object || Lampa.Source.last || {}) : {};
      var avg = calculateAverageEpisodeDuration(movie);
      if (avg > 0) {
        row1.appendChild(pill(formatDurationMinutes(avg), colors.duration.bg, colors.duration.text));
        had = true;
      }
    } catch(e){}

    if (!had) return;

    var wrap = document.createElement('div');
    wrap.className = 'ilite-info';
    wrap.style.cssText = 'display:flex;flex-direction:column;';
    wrap.appendChild(row1); wrap.appendChild(row2); wrap.appendChild(row3);

    container.innerHTML = '';
    container.appendChild(wrap);
  }

  function setupInfoPanel() {
    if (!settings.info_panel) return;
    function tryBuild(){
      document.querySelectorAll('.full-start-new__details, .full-start__details').forEach(buildInfoPanelOnce);
    }
    Lampa.Listener.follow('full', function (e) { if (e.type === 'complite') setTimeout(tryBuild, 80); });
    var obs = new MutationObserver(function(){ setTimeout(tryBuild, 120); });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  // ---------- SETTINGS UI ----------
  function moveAfterCoreInterface() {
    var $folders = $('.settings-folder');
    var $iface = $folders.filter(function(){ return $(this).data('component') === 'interface'; });
    var $mine  = $folders.filter(function(){ return $(this).data('component') === 'interface_1to1'; });
    if ($iface.length && $mine.length && $mine.prev()[0] !== $iface[0]) { $mine.insertAfter($iface); }
  }

  function addSettings() {
    Lampa.SettingsApi.addComponent({
      component: 'interface_1to1',
      name: Lampa.Lang.translate('interface_1to1_plugin_name'),
      icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V7C20 7.55228 19.5523 8 19 8H5C4.44772 8 4 7.55228 4 7V5Z" fill="currentColor"/><path d="M4 11C4 10.4477 4.44772 10 5 10H19C19.5523 10 20 10.4477 20 11V13C20 13.5523 19.5523 14 19 14H5C4.44772 14 4 13.5523 4 13V11Z" fill="currentColor"/><path d="M4 17C4 16.4477 4.44772 16 5 16H19C19.5523 16 20 16.4477 20 17V19C20 19.5523 19.5523 20 19 20H5C4.44772 20 4 19.5523 4 19V17Z" fill="currentColor"/></svg>'
    });

    // Info panel
    Lampa.SettingsApi.addParam({
      component: 'interface_1to1',
      param: { name: 'interface_1to1_info_panel', type: 'toggle', default: settings.info_panel },
      field: { name: Lampa.Lang.translate('interface_1to1_info_panel'), description: Lampa.Lang.translate('interface_1to1_info_panel_desc') },
      onChange: function (val) { settings.info_panel = !!val; Lampa.Storage.set('interface_1to1_info_panel', settings.info_panel); }
    });

    // Colored ratings
    Lampa.SettingsApi.addParam({
      component: 'interface_1to1',
      param: { name: 'interface_1to1_colored_ratings', type: 'toggle', default: settings.colored_ratings },
      field: { name: Lampa.Lang.translate('interface_1to1_colored_ratings'), description: Lampa.Lang.translate('interface_1to1_colored_ratings_desc') },
      onChange: function (val) { settings.colored_ratings = !!val; Lampa.Storage.set('interface_1to1_colored_ratings', settings.colored_ratings); }
    });

    // Theme select
    Lampa.SettingsApi.addParam({
      component: 'interface_1to1',
      param: { name: 'interface_1to1_theme', type: 'select', values: {
        'default': Lampa.Lang.translate('interface_1to1_theme_default'),
        'emerald_v1': Lampa.Lang.translate('interface_1to1_theme_emerald_v1'),
        'emerald_v2': Lampa.Lang.translate('interface_1to1_theme_emerald_v2'),
        'aurora': Lampa.Lang.translate('interface_1to1_theme_aurora')
      }, default: settings.theme },
      field: { name: Lampa.Lang.translate('interface_1to1_theme_select'), description: Lampa.Lang.translate('interface_1to1_theme_select_desc') },
      onChange: function (val) { settings.theme = val; Lampa.Storage.set('interface_1to1_theme', val); applyTheme(val); }
    });

    setTimeout(moveAfterCoreInterface, 250);
  }

  // ---------- INIT ----------
  function init(){
    addSettings();
    applyTheme(settings.theme);
    setupVoteColorsObserver();
    setupInfoPanel();
  }

  if (window.appready) init();
  else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') init(); });
})();

(function () {
  'use strict';

  /* ============================================================
   *  ПОЛІФІЛИ ТА УТИЛІТИ
   * ============================================================ */

  if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
      position = position || 0;
      return this.indexOf(searchString, position) === position;
    };
  }

  function plural(n, one, two, five) {
    n = Math.abs(n) % 100;
    if (n >= 5 && n <= 20) return five;
    n = n % 10;
    if (n === 1) return one;
    if (n >= 2 && n <= 4) return two;
    return five;
  }

  function getBool(key, def){
    var v = Lampa.Storage.get(key, def);
    if (typeof v === 'string') v = v.trim().toLowerCase();
    return v === true || v === 'true' || v === 1 || v === '1';
  }

  function calculateAverageEpisodeDuration(movie) {
    if (!movie || typeof movie !== 'object') return 0;
    var total = 0, count = 0;

    if (Array.isArray(movie.episode_run_time) && movie.episode_run_time.length) {
      movie.episode_run_time.forEach(function (m) {
        if (m > 0 && m <= 200) { total += m; count++; }
      });
    } else if (Array.isArray(movie.seasons)) {
      movie.seasons.forEach(function (s) {
        if (Array.isArray(s.episodes)) {
          s.episodes.forEach(function (e) {
            if (e.runtime && e.runtime > 0 && e.runtime <= 200) { total += e.runtime; count++; }
          });
        }
      });
    }

    if (count > 0) return Math.round(total / count);

    if (movie.last_episode_to_air && movie.last_episode_to_air.runtime &&
        movie.last_episode_to_air.runtime > 0 && movie.last_episode_to_air.runtime <= 200) {
      return movie.last_episode_to_air.runtime;
    }
    return 0;
  }

  function formatDurationMinutes(minutes) {
    if (!minutes || minutes <= 0) return '';
    var h = Math.floor(minutes / 60), m = minutes % 60, out = '';
    if (h > 0) {
      out += h + ' ' + plural(h, 'година', 'години', 'годин');
      if (m > 0) out += ' ' + m + ' ' + plural(m, 'хвилина', 'хвилини', 'хвилин');
    } else {
      out += m + ' ' + plural(m, 'хвилина', 'хвилини', 'хвилин');
    }
    return out;
  }

  /* ============================================================
   *  ЛОКАЛІЗАЦІЯ
   * ============================================================ */
  Lampa.Lang.add({
    interface_mod_new_group_title: { ru:'Интерфейс +', en:'Interface +', uk:'Інтерфейс +' },
    interface_mod_new_plugin_name: { ru:'Интерфейс +', en:'Interface +', uk:'Інтерфейс +' },

    interface_mod_new_info_panel: { ru:'Новая инфо-панель', en:'New info panel', uk:'Нова інфо-панель' },
    interface_mod_new_info_panel_desc: {
      ru:'Цветная и перефразированная строка информации',
      en:'Colored and rephrased info line',
      uk:'Кольорова та перефразована інфо-панель'
    },

    interface_mod_new_colored_ratings: { ru:'Цветной рейтинг', en:'Colored rating', uk:'Кольоровий рейтинг' },
    interface_mod_new_colored_ratings_desc: {
      ru:'Включить подсветку рейтингов',
      en:'Enable colored rating highlight',
      uk:'Увімкнути кольорове виділення рейтингу'
    },

    interface_mod_new_colored_status: { ru:'Цветные статусы', en:'Colored statuses', uk:'Кольорові статуси' },
    interface_mod_new_colored_status_desc: {
      ru:'Подсвечивать статус сериала цветом',
      en:'Colorize series status',
      uk:'Підсвічувати статус серіалу'
    },

    interface_mod_new_colored_age: { ru:'Цветной возрастной рейтинг', en:'Colored age rating', uk:'Кольоровий віковий рейтинг' },
    interface_mod_new_colored_age_desc: {
      ru:'Подсвечивать возрастной рейтинг',
      en:'Colorize age rating',
      uk:'Підсвічувати віковий рейтинг'
    },

    interface_mod_new_theme_select_title: { ru:'Тема интерфейса', en:'Interface theme', uk:'Тема інтерфейсу' },
    interface_mod_new_theme_default: { ru:'По умолчанию', en:'Default', uk:'За замовчуванням' },
    interface_mod_new_theme_emerald_v1: { ru:'Emerald V1', en:'Emerald V1', uk:'Emerald V1' },
    interface_mod_new_theme_emerald_v2: { ru:'Emerald V2', en:'Emerald V2', uk:'Emerald V2' },
    interface_mod_new_theme_aurora:     { ru:'Aurora',     en:'Aurora',     uk:'Aurora' },

    // Нові пункти (Enchancer/cc+)
    interface_mod_new_english_data:        { ru:'English Data', en:'English Data', uk:'Англійські дані' },
    interface_mod_new_english_data_desc:   { ru:'Показ оригинального названия и англ. описания при отсутствии локального', en:'Adds English original title and fills overview if missing', uk:'Додає англ. оригінальну назву і підтягує опис, якщо його немає' },

    interface_mod_new_buttons_group:       { ru:'Кнопки', en:'Buttons', uk:'Кнопки' },
    interface_mod_new_buttons_all:         { ru:'Все кнопки в карточке', en:'All buttons in card', uk:'Всі кнопки в картці' },
    interface_mod_new_buttons_all_desc:    { ru:'Показ Онлайн/Торрент/Трейлери навіть якщо приховані', en:'Show Online/Torrent/Trailers even if hidden', uk:'Показує Онлайн/Торент/Трейлери навіть якщо приховані' },
    interface_mod_new_buttons_icons:       { ru:'Иконки без текста', en:'Icons only', uk:'Іконки без тексту' },
    interface_mod_new_buttons_icons_desc:  { ru:'Скрыть подписи, оставить только иконки', en:'Hide labels (keep icons)', uk:'Ховає підписи на кнопках, залишає іконки' },
    interface_mod_new_buttons_sort:        { ru:'Порядок кнопок', en:'Force button order', uk:'Порядок кнопок' },
    interface_mod_new_buttons_sort_desc:   { ru:'Онлайн → Торрент → Трейлеры', en:'Online → Torrent → Trailers', uk:'Онлайн → Торент → Трейлери' },
    interface_mod_new_buttons_color:       { ru:'Цветные кнопки', en:'Colored buttons', uk:'Кольорові кнопки' },
    interface_mod_new_buttons_color_desc:  { ru:'Цвет + обновлённые иконки', en:'Recolor + updated icons', uk:'Розфарбовує кнопки та оновлює іконки' }
  });

  /* ============================================================
   *  НАЛАШТУВАННЯ (дефолти)
   * ============================================================ */
  var settings = {
    info_panel      : getBool('interface_mod_new_info_panel', true),
    colored_ratings : getBool('interface_mod_new_colored_ratings', false),
    colored_status  : getBool('interface_mod_new_colored_status', false),
    colored_age     : getBool('interface_mod_new_colored_age', false),
    theme           : (Lampa.Storage.get('interface_mod_new_theme_select', 'default') || 'default'),

    // Нові — всі "Ні" за замовчуванням
    english_data    : getBool('interface_mod_new_english_data', false),
    buttons_all     : getBool('interface_mod_new_buttons_all',   false),
    buttons_icons   : getBool('interface_mod_new_buttons_icons', false),
    buttons_sort    : getBool('interface_mod_new_buttons_sort',  false),
    buttons_color   : getBool('interface_mod_new_buttons_color', false)
  };

  // Пам’ять активної картки
  var __ifx_last = { details:null, movie:null, originalHTML:'', isTv:false, fullRoot:null };

  /* ============================================================
   *  БАЗОВІ СТИЛІ + КЛАСИ (з !important для стабільності)
   * ============================================================ */
  (function injectBaseCss(){
    if (document.getElementById('interface_mod_base')) return;

    var css = `
      /* Коротка інфо під постером */
      .full-start-new__details{
        color:#fff !important;
        margin:-0.45em !important;
        margin-bottom:1em !important;
        display:flex !important;
        align-items:center !important;
        flex-wrap:wrap !important;
        min-height:1.9em !important;
        font-size:1.1em !important;
      }

      /* UX на тачах */
      *:not(input){ -webkit-user-select:none !important; -moz-user-select:none !important; -ms-user-select:none !important; user-select:none !important; }
      *{ -webkit-tap-highlight-color:transparent; -webkit-touch-callout:none; box-sizing:border-box; outline:none; -webkit-user-drag:none; }

      /* Лінія рейтингів */
      .full-start-new__rate-line > * {
        margin-left: 0 !important;
        margin-right: 1em !important;
        flex-shrink: 0;
        flex-grow: 0;
      }

      /* ===== AGE / STATUS Кольори через класи ===== */
      .ifx-age-kids{        background:#2ecc71 !important; color:#fff !important; border-color:transparent !important; }
      .ifx-age-children{    background:#3498db !important; color:#fff !important; border-color:transparent !important; }
      .ifx-age-teens{       background:#f1c40f !important; color:#000 !important; border-color:transparent !important; }
      .ifx-age-almostadult{ background:#e67e22 !important; color:#fff !important; border-color:transparent !important; }
      .ifx-age-adult{       background:#e74c3c !important; color:#fff !important; border-color:transparent !important; }

      .ifx-status-completed{ background:rgba(46,204,113,.85) !important; color:#fff !important; border-color:transparent !important; }
      .ifx-status-canceled{  background:rgba(231,76,60,.9) !important;   color:#fff !important; border-color:transparent !important; }
      .ifx-status-ongoing{   background:rgba(243,156,18,.95) !important;  color:#000 !important; border-color:transparent !important; }
      .ifx-status-production{background:rgba(52,152,219,.9) !important;   color:#fff !important; border-color:transparent !important; }
      .ifx-status-planned{   background:rgba(155,89,182,.9) !important;   color:#fff !important; border-color:transparent !important; }
      .ifx-status-pilot{     background:rgba(230,126,34,.95)!important;   color:#fff !important; border-color:transparent !important; }
      .ifx-status-released{  background:rgba(26,188,156,.9) !important;   color:#fff !important; border-color:transparent !important; }
      .ifx-status-rumored{   background:rgba(149,165,166,.9)!important;   color:#fff !important; border-color:transparent !important; }
      .ifx-status-post{      background:rgba(0,188,212,.9) !important;     color:#fff !important; border-color:transparent !important; }
      .ifx-status-soon{      background:rgba(52,152,219,.95)!important;    color:#fff !important; border-color:transparent !important; }

      /* ===== Англійська ориг. назва під основною ===== */
      .ifx-eng-title{
        display:block;
        margin-top:.25em;
        /* ТУТ МОЖНА ПІДІБРАТИ СТИЛЬ: ↓↓↓ */
        font-size: 0.75em; /* ~ на 1/4 менше */
        color: #9aa0a6;    /* спокійний сірий */
      }

      /* ===== Кольорові кнопки (м’який стиль) ===== */
      .ifx-colored-buttons .full-start__button{ border-radius:.6em; padding:.45em .75em; }
      .ifx-btn-torrent{ background: rgba(231,76,60,.15);  border:1px solid rgba(231,76,60,.35); }
      .ifx-btn-online { background: rgba(46,204,113,.15); border:1px solid rgba(46,204,113,.35); }
      .ifx-btn-trailer{ background: rgba(52,152,219,.15); border:1px solid rgba(52,152,219,.35); }
    `;
    var st = document.createElement('style');
    st.id = 'interface_mod_base';
    st.textContent = css;
    document.head.appendChild(st);
  })();

  /* ============================================================
   *  ТЕМИ (Emerald V1/V2, Aurora)
   * ============================================================ */
  function applyTheme(theme) {
    var old = document.getElementById('interface_mod_theme');
    if (old) old.remove();
    if (theme === 'default') return;

    var themeCss = {
      emerald_v1: `
        body { background: linear-gradient(135deg, #0c1619 0%, #132730 50%, #18323a 100%) !important; color:#dfdfdf !important; }
        .menu__item, .settings-folder, .settings-param, .selectbox-item,
        .full-start__button, .full-descr__tag, .player-panel .button,
        .custom-online-btn, .custom-torrent-btn, .main2-more-btn,
        .simple-button, .menu__version { border-radius: 1.0em !important; }
        .menu__item.focus, .menu__item.traverse, .menu__item.hover,
        .settings-folder.focus, .settings-param.focus, .selectbox-item.focus,
        .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
        .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus,
        .simple-button.focus, .menu__version.focus {
          background: linear-gradient(to right, #1a594d, #0e3652) !important;
          color: #fff !important;
          box-shadow: 0 2px 8px rgba(26,89,77,.25) !important;
          border-radius: 1.0em !important;
        }
        .card.focus .card__view::after, .card.hover .card__view::after {
          border: 2px solid #1a594d !important;
          box-shadow: 0 0 10px rgba(26,89,77,.35) !important;
          border-radius: 1.0em !important;
        }
        .settings__content, .settings-input__content, .selectbox__content, .modal__content {
          background: rgba(12,22,25,.97) !important;
          border: 1px solid rgba(26,89,77,.12) !important;
          border-radius: 1.0em !important;
        }
      `,
      emerald_v2: `
        body {
          background: radial-gradient(1200px 600px at 70% 10%, #214a57 0%, transparent 60%),
                      linear-gradient(135deg, #112229 0%, #15303a 45%, #0f1c22 100%) !important;
          color: #e6f2ef !important;
        }
        .menu__item.focus, .menu__item.traverse, .menu__item.hover,
        .settings-folder.focus, .settings-param.focus, .selectbox-item.focus,
        .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
        .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus,
        .simple-button.focus, .menu__version.focus {
          background: linear-gradient(90deg, rgba(38,164,131,0.95), rgba(18,94,138,0.95)) !important;
          color: #fff !important;
          backdrop-filter: blur(2px) !important;
          border-radius: .85em !important;
          box-shadow: 0 6px 18px rgba(18,94,138,.35) !important;
        }
        .card.focus .card__view::after, .card.hover .card__view::after {
          border: 3px solid rgba(38,164,131,0.9) !important;
          box-shadow: 0 0 20px rgba(38,164,131,.45) !important;
          border-radius: .9em !important;
        }
        .settings__content, .settings-input__content, .selectbox__content, .modal__content {
          background: rgba(10, 24, 29, 0.98) !important;
          border: 1px solid rgba(38,164,131,.15) !important;
          border-radius: .9em !important;
        }
      `,
      aurora: `
        body { background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%) !important; color: #ffffff !important; }
        .menu__item.focus, .menu__item.traverse, .menu__item.hover,
        .settings-folder.focus, .settings-param.focus, .selectbox-item.focus,
        .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
        .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus,
        .simple-button.focus, .menu__version.focus {
          background: linear-gradient(90deg, #aa4b6b, #6b6b83, #3b8d99) !important;
          color: #fff !important;
          box-shadow: 0 0 20px rgba(170,75,107,.35) !important;
          transform: scale(1.02) !important;
          border-radius: .85em !important;
        }
        .card.focus .card__view::after, .card.hover .card__view::after {
          border: 2px solid #aa4b6b !important;
          box-shadow: 0 0 22px rgba(170,75,107,.45) !important;
          border-radius: .9em !important;
        }
        .settings__content, .settings-input__content, .selectbox__content, .modal__content {
          background: rgba(20, 32, 39, 0.98) !important;
          border: 1px solid rgba(59,141,153,.18) !important;
          border-radius: .9em !important;
        }
      `
    };

    var id = theme === 'emerald_v1' ? 'emerald_v1'
           : theme === 'emerald_v2' ? 'emerald_v2'
           : 'aurora';

    var st = document.createElement('style');
    st.id = 'interface_mod_theme';
    st.textContent = themeCss[id];
    document.head.appendChild(st);
  }

  /* ============================================================
   *  ЄДИНІ СЕЛЕКТОРИ ДЛЯ СТАТУСІВ/PG (враховано варіанти з одним "_")
   * ============================================================ */
  var STATUS_BASE_SEL = [
    '.full-start__status', '.full-start-new__status',
    '.full-start_status',  '.full-start-new_status',
    '.full-start__soon',   '.full-start-new__soon',
    '.full-start_soon',    '.full-start-new_soon',
    '.full-start [data-status]', '.full-start-new [data-status]'
  ].join(',');

  var AGE_BASE_SEL = [
    '.full-start__pg', '.full-start-new__pg',
    '.full-start_pg',  '.full-start-new_pg',
    '.full-start [data-pg]', '.full-start-new [data-pg]',
    '.full-start [data-age]', '.full-start-new [data-age]'
  ].join(',');

  /* ============================================================
   *  МЕНЮ НАЛАШТУВАНЬ + LIVE-APPLY
   * ============================================================ */
  function initInterfaceModSettingsUI(){
    if (window.__ifx_settings_ready) return;
    window.__ifx_settings_ready = true;

    Lampa.SettingsApi.addComponent({
      component: 'interface_mod_new',
      name: Lampa.Lang.translate('interface_mod_new_group_title'),
      icon: '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M4 5c0-.552.448-1 1-1h14c.552 0 1 .448 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5Zm0 6c0-.552.448-1 1-1h14c.552 0 1 .448 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2Zm0 6c0-.552.448-1 1-1h14c.552 0 1 .448 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2Z"/></svg>'
    });

    var add = Lampa.SettingsApi.addParam;

    // Блок "Інтерфейс+"
    add({ component:'interface_mod_new',
      param:{ name:'interface_mod_new_info_panel', type:'trigger', values:true, default:true },
      field:{ name:Lampa.Lang.translate('interface_mod_new_info_panel'), description:Lampa.Lang.translate('interface_mod_new_info_panel_desc') }
    });

    add({ component:'interface_mod_new',
      param:{ name:'interface_mod_new_colored_ratings', type:'trigger', values:true, default:false },
      field:{ name:Lampa.Lang.translate('interface_mod_new_colored_ratings'), description:Lampa.Lang.translate('interface_mod_new_colored_ratings_desc') }
    });

    add({ component:'interface_mod_new',
      param:{ name:'interface_mod_new_colored_status', type:'trigger', values:true, default:false },
      field:{ name:Lampa.Lang.translate('interface_mod_new_colored_status'), description:Lampa.Lang.translate('interface_mod_new_colored_status_desc') }
    });

    add({ component:'interface_mod_new',
      param:{ name:'interface_mod_new_colored_age', type:'trigger', values:true, default:false },
      field:{ name:Lampa.Lang.translate('interface_mod_new_colored_age'), description:Lampa.Lang.translate('interface_mod_new_colored_age_desc') }
    });

    add({ component:'interface_mod_new',
      param:{ name:'interface_mod_new_english_data', type:'trigger', values:true, default:false },
      field:{ name:Lampa.Lang.translate('interface_mod_new_english_data'), description:Lampa.Lang.translate('interface_mod_new_english_data_desc') }
    });

    // Окремий блок "Кнопки"
    Lampa.SettingsApi.addComponent({
      component:'interface_mod_new_buttons',
      name: Lampa.Lang.translate('interface_mod_new_buttons_group'),
      icon:'<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5h13v4H8zM3 5h3v4H3zM8 10h13v4H8zM3 10h3v4H3zM8 15h13v4H8zM3 15h3v4H3z"/></svg>'
    });

    add({ component:'interface_mod_new_buttons',
      param:{ name:'interface_mod_new_buttons_all', type:'trigger', values:true, default:false },
      field:{ name:Lampa.Lang.translate('interface_mod_new_buttons_all'), description:Lampa.Lang.translate('interface_mod_new_buttons_all_desc') }
    });

    add({ component:'interface_mod_new_buttons',
      param:{ name:'interface_mod_new_buttons_icons', type:'trigger', values:true, default:false },
      field:{ name:Lampa.Lang.translate('interface_mod_new_buttons_icons'), description:Lampa.Lang.translate('interface_mod_new_buttons_icons_desc') }
    });

    add({ component:'interface_mod_new_buttons',
      param:{ name:'interface_mod_new_buttons_sort', type:'trigger', values:true, default:false },
      field:{ name:Lampa.Lang.translate('interface_mod_new_buttons_sort'), description:Lampa.Lang.translate('interface_mod_new_buttons_sort_desc') }
    });

    add({ component:'interface_mod_new_buttons',
      param:{ name:'interface_mod_new_buttons_color', type:'trigger', values:true, default:false },
      field:{ name:Lampa.Lang.translate('interface_mod_new_buttons_color'), description:Lampa.Lang.translate('interface_mod_new_buttons_color_desc') }
    });

    // Перемістити секції
    function moveAfterInterface(){
      var $folders = $('.settings-folder');
      var $iface = $folders.filter(function(){ return $(this).data('component') === 'interface'; });
      var $mod   = $folders.filter(function(){ return $(this).data('component') === 'interface_mod_new'; });
      var $btn   = $folders.filter(function(){ return $(this).data('component') === 'interface_mod_new_buttons'; });
      if ($iface.length){
        if ($mod.length && $mod.prev()[0] !== $iface[0]) $mod.insertAfter($iface);
        if ($btn.length && $btn.prev()[0] !== $mod[0]) $btn.insertAfter($mod);
      }
    }
    var tries=0, t=setInterval(function(){ moveAfterInterface(); if(++tries>=40) clearInterval(t); }, 150);
    var obsMenu = new MutationObserver(moveAfterInterface);
    obsMenu.observe(document.body, {childList:true, subtree:true});

    // LIVE-apply через Storage.set
    if (!window.__ifx_patch_storage) {
      window.__ifx_patch_storage = true;
      var _set = Lampa.Storage.set;
      Lampa.Storage.set = function(key, val){
        var res = _set.apply(this, arguments);

        if (typeof key === 'string' && key.indexOf('interface_mod_new') === 0) {
          // перечитування
          settings.info_panel      = getBool('interface_mod_new_info_panel', true);
          settings.colored_ratings = getBool('interface_mod_new_colored_ratings', false);
          settings.colored_status  = getBool('interface_mod_new_colored_status', false);
          settings.colored_age     = getBool('interface_mod_new_colored_age', false);
          settings.english_data    = getBool('interface_mod_new_english_data', false);

          settings.buttons_all     = getBool('interface_mod_new_buttons_all',   false);
          settings.buttons_icons   = getBool('interface_mod_new_buttons_icons', false);
          settings.buttons_sort    = getBool('interface_mod_new_buttons_sort',  false);
          settings.buttons_color   = getBool('interface_mod_new_buttons_color', false);

          settings.theme           = (Lampa.Storage.get('interface_mod_new_theme_select', 'default') || 'default');

          // тема
          if (key === 'interface_mod_new_theme_select') applyTheme(settings.theme);

          // інфо-панель
          if (key === 'interface_mod_new_info_panel')   rebuildInfoPanelActive();

          // кольори рейтингів
          if (key === 'interface_mod_new_colored_ratings') {
            if (settings.colored_ratings) updateVoteColors(); else clearVoteColors();
          }

          // статуси/PG
          if (key === 'interface_mod_new_colored_status' || key === 'interface_mod_new_colored_age') {
            setStatusBaseCssEnabled(settings.colored_status);
            setAgeBaseCssEnabled(settings.colored_age);
            if (settings.colored_status) enableStatusColoring(); else disableStatusColoring(true);
            if (settings.colored_age)    enableAgeColoring();    else disableAgeColoring(true);
          }

          // англ. дані
          if (key === 'interface_mod_new_english_data' && __ifx_last.fullRoot) {
            applyEnglishData(__ifx_last.fullRoot, __ifx_last.movie);
          }

          // кнопки
          if (/interface_mod_new_buttons_/.test(key) && __ifx_last.fullRoot) {
            applyFullButtons(__ifx_last.fullRoot);
          }
        }
        return res;
      };
    }
  }

  /* ============================================================
   *  ІНФО-ПАНЕЛЬ (4 ряди)
   * ============================================================ */
  function buildInfoPanel(details, movie, isTvShow, originalDetails){
    var container = $('<div>').css({
      display:'flex','flex-direction':'column',width:'100%',gap:'0em',
      margin:'-1.0em 0 0.2em 0.45em'
    });

    var row1 = $('<div>').css({ display:'flex','flex-wrap':'wrap',gap:'0.2em','align-items':'center',margin:'0 0 0.2em 0' });
    var row2 = $('<div>').css({ display:'flex','flex-wrap':'wrap',gap:'0.2ем','align-items':'center',margin:'0 0 0.2em 0'.replace('ем','em') });
    var row3 = $('<div>').css({ display:'flex','flex-wrap':'wrap',gap:'0.2em','align-items':'center',margin:'0 0 0.2em 0' });
    var row4 = $('<div>').css({ display:'flex','flex-wrap':'wrap',gap:'0.2em','align-items':'flex-start',margin:'0 0 0.2em 0' });

    var colors = {
      seasons : { bg:'rgba(52,152,219,0.8)', text:'white' },
      episodes: { bg:'rgba(46,204,113,0.8)', text:'white' },
      duration: { bg:'rgba(52,152,219,0.8)', text:'white' },
      next    : { bg:'rgba(230,126,34,0.9)', text:'white' }
    };

    var baseBadge = {
      'border-radius':'0.3em', border:'0', 'font-size':'1.0em',
      padding:'0.2em 0.6em', display:'inline-block', 'white-space':'nowrap',
      'line-height':'1.2em', 'margin-right':'0.4em', 'margin-bottom':'0.2em'
    };

    // 1) Серії
    if (isTvShow && Array.isArray(movie.seasons)) {
      var totalEps = 0, airedEps = 0, now = new Date(), hasEpisodes = false;
      movie.seasons.forEach(function (s) {
        if (s.season_number === 0) return;
        if (s.episode_count) totalEps += s.episode_count;
        if (Array.isArray(s.episodes) && s.episodes.length) {
          hasEpisodes = true;
          s.episodes.forEach(function (e) { if (e.air_date && new Date(e.air_date) <= now) airedEps++; });
        } else if (s.air_date && new Date(s.air_date) <= now && s.episode_count) {
          airedEps += s.episode_count;
        }
      });

      if (!hasEpisodes && movie.next_episode_to_air && movie.next_episode_to_air.season_number && movie.next_episode_to_air.episode_number) {
        var nextS = movie.next_episode_to_air.season_number, nextE = movie.next_episode_to_air.episode_number, rem = 0;
        movie.seasons.forEach(function (s) {
          if (s.season_number === nextS) rem += (s.episode_count || 0) - nextE + 1;
          else if (s.season_number > nextS) rem += s.episode_count || 0;
        });
        if (rem > 0 && totalEps > 0) airedEps = Math.max(0, totalEps - rem);
      }

      var epsText = '';
      if (totalEps > 0 && airedEps > 0 && airedEps < totalEps) epsText = airedEps + ' ' + plural(airedEps, 'Серія', 'Серії', 'Серій') + ' з ' + totalEps;
      else if (totalEps > 0) epsText = totalEps + ' ' + plural(totalEps, 'Серія', 'Серії', 'Серій');

      if (epsText) row1.append($('<span>').text(epsText).css($.extend({}, baseBadge, { 'background-color': colors.episodes.bg, color: colors.episodes.text })));
    }

    // 2) Наступна серія
    if (isTvShow && movie.next_episode_to_air && movie.next_episode_to_air.air_date) {
      var nextDate = new Date(movie.next_episode_to_air.air_date), today = new Date();
      nextDate.setHours(0,0,0,0); today.setHours(0,0,0,0);
      var diff = Math.floor((nextDate - today) / (1000*60*60*24));
      var txt = diff===0 ? 'Наступна серія вже сьогодні' : diff===1 ? 'Наступна серія вже завтра' : diff>1 ? ('Наступна серія через ' + diff + ' ' + plural(diff,'день','дні','днів')) : '';
      if (txt) row2.append($('<span>').text(txt).css($.extend({}, baseBadge, { 'background-color': colors.next.bg, color: colors.next.text })));
    }

    // 3) Тривалість
    if (!isTvShow && movie.runtime > 0) {
      var mins = movie.runtime, h = Math.floor(mins/60), m = mins%60;
      var t = 'Тривалість фільму: ';
      if (h > 0) t += h + ' ' + plural(h,'година','години','годин');
      if (m > 0) t += (h>0?' ':'') + m + ' хв.';
      row3.append($('<span>').text(t).css($.extend({}, baseBadge, { 'background-color': colors.duration.bg, color: colors.duration.text })));
    } else if (isTvShow) {
      var avg = calculateAverageEpisodeDuration(movie);
      if (avg > 0) row3.append($('<span>').text('Тривалість серії ≈ ' + formatDurationMinutes(avg)).css($.extend({}, baseBadge, { 'background-color': colors.duration.bg, color: colors.duration.text })));
    }

    // 4) Сезони (за потреби можна повернути жанри)
    var seasonsCount = (movie.season_count || movie.number_of_seasons || (movie.seasons ? movie.seasons.filter(function(s){return s.season_number!==0;}).length : 0)) || 0;
    if (isTvShow && seasonsCount > 0) {
      row4.append($('<span>').text('Сезони: ' + seasonsCount).css($.extend({}, baseBadge, { 'background-color': 'rgba(52,152,219,0.8)', color: 'white' })));
    }

    container.append(row1);
    if (row2.children().length) container.append(row2);
    if (row3.children().length) container.append(row3);
    if (row4.children().length) container.append(row4);

    details.append(container);
  }

  function rebuildInfoPanelActive(){
    var enabled = getBool('interface_mod_new_info_panel', true);
    if (!__ifx_last.details || !__ifx_last.details.length) return;

    if (!enabled) {
      __ifx_last.details.html(__ifx_last.originalHTML);
    } else {
      __ifx_last.details.empty();
      buildInfoPanel(__ifx_last.details, __ifx_last.movie, __ifx_last.isTv, __ifx_last.originalHTML);
    }
  }

  function newInfoPanel() {
    Lampa.Listener.follow('full', function (data) {
      if (data.type !== 'complite') return;

      setTimeout(function () {
        var fullRoot = $(data.object.activity.render());
        var details = fullRoot.find('.full-start-new__details');
        if (!details.length) details = fullRoot.find('.full-start__details');
        if (!details.length) return;

        var movie = data.data.movie || {};
        var isTvShow = (movie && (
          movie.number_of_seasons > 0 ||
          (movie.seasons && movie.seasons.length > 0) ||
          movie.type === 'tv' || movie.type === 'serial'
        ));

        __ifx_last.details = details;
        __ifx_last.movie = movie;
        __ifx_last.isTv = isTvShow;
        __ifx_last.originalHTML = details.html();
        __ifx_last.fullRoot = fullRoot;

        if (getBool('interface_mod_new_info_panel', true)) {
          details.empty();
          buildInfoPanel(details, movie, isTvShow, __ifx_last.originalHTML);
        }

        // Англійські дані
        applyEnglishData(fullRoot, movie);

        // Кнопки
        applyFullButtons(fullRoot);

      }, 100);
    });
  }

  /* ============================================================
   *  КОЛЬОРОВІ РЕЙТИНГИ
   * ============================================================ */
  function updateVoteColors() {
    if (!getBool('interface_mod_new_colored_ratings', false)) return;

    var SEL = [
      '.card__vote',
      '.full-start__rate',
      '.full-start-new__rate',
      '.info__rate',
      '.card__imdb-rate',
      '.card__kinopoisk-rate'
    ].join(',');

    function paint(el) {
      var txt = ($(el).text() || '').trim();
      var m = txt.match(/(\d+(\.\d+)?)/);
      if (!m) return;
      var v = parseFloat(m[0]);
      if (isNaN(v) || v < 0 || v > 10) return;

      var color =
        (v <= 3) ? 'red' :
        (v <  6) ? 'orange' :
        (v <  8) ? 'cornflowerblue' :
                   'lawngreen';

      $(el).css('color', color);
    }

    $(SEL).each(function(){ paint(this); });
  }
  function clearVoteColors(){
    var SEL = '.card__vote, .full-start__rate, .full-start-new__rate, .info__rate, .card__imdb-rate, .card__kinopoisk-rate';
    $(SEL).css('color','');
  }
  function setupVoteColorsObserver() {
    setTimeout(function(){ if (getBool('interface_mod_new_colored_ratings', false)) updateVoteColors(); }, 400);

    var obs = new MutationObserver(function(){
      if (getBool('interface_mod_new_colored_ratings', false)) setTimeout(updateVoteColors, 80);
    });
    obs.observe(document.body, {childList:true, subtree:true});

    Lampa.Listener.follow('full', function (e) {
      if (e.type === 'complite' && getBool('interface_mod_new_colored_ratings', false)) setTimeout(updateVoteColors, 100);
    });
  }

  /* ============================================================
   *  БАЗА СТИЛЮ ДЛЯ СТАТУСІВ/PG (два стани)
   * ============================================================ */
  function setStatusBaseCssEnabled(enabled){
    var idEn = 'interface_mod_status_enabled';
    var idDis = 'interface_mod_status_disabled';
    document.getElementById(idEn) && document.getElementById(idEn).remove();
    document.getElementById(idDis) && document.getElementById(idDis).remove();

    var st = document.createElement('style');
    if (enabled){
      st.id = idEn;
      st.textContent =
        STATUS_BASE_SEL + '{' +
          'font-size:1.2em!important;' +
          'border:1px solid transparent!important;' + /* геометрія збережена */
          'border-radius:0.2em!important;' +
          'padding:0.3em!important;' +
          'margin-right:0.3em!important;' +
          'margin-left:0!important;' +
        '}';
    } else {
      st.id = idDis;
      st.textContent =
        STATUS_BASE_SEL + '{' +
          'font-size:1.2em!important;' +
          'border:1px solid #fff!important;' +
          'border-radius:0.2em!important;' +
          'padding:0.3em!important;' +
          'margin-right:0.3em!important;' +
          'margin-left:0!important;' +
        '}';
    }
    document.head.appendChild(st);
  }

  function setAgeBaseCssEnabled(enabled){
    var idEn = 'interface_mod_age_enabled';
    var idDis = 'interface_mod_age_disabled';
    document.getElementById(idEn) && document.getElementById(idEn).remove();
    document.getElementById(idDis) && document.getElementById(idDis).remove();

    var st = document.createElement('style');
    if (enabled){
      st.id = idEn;
      st.textContent =
        AGE_BASE_SEL + '{' +
          'font-size:1.2em!important;' +
          'border:1px solid transparent!important;' + /* тримаємо розмір як у стандарті */
          'border-radius:0.2em!important;' +
          'padding:0.3em!important;' +
          'margin-right:0.3em!important;' +
          'margin-left:0!important;' +
        '}';
    } else {
      st.id = idDis;
      st.textContent =
        AGE_BASE_SEL + '{' +
          'font-size:1.2em!important;' +
          'border:1px solid #fff!important;' +
          'border-radius:0.2em!important;' +
          'padding:0.3em!important;' +
          'margin-right:0.3em!important;' +
          'margin-left:0!important;' +
        '}';
    }
    document.head.appendChild(st);
  }

  /* ============================================================
   *  КОЛЬОРИ СТАТУСІВ / PG ЧЕРЕЗ КЛАСИ (з !important)
   * ============================================================ */
  var __statusObserver = null, __statusFollowReady = false;

  function applyStatusOnceIn(elRoot){
    if (!getBool('interface_mod_new_colored_status', false)) return;

    var SEL = STATUS_BASE_SEL;

    function normalize(el){
      el.classList.remove(
        'ifx-status-completed','ifx-status-canceled','ifx-status-ongoing',
        'ifx-status-production','ifx-status-planned','ifx-status-pilot',
        'ifx-status-released','ifx-status-rumored','ifx-status-post','ifx-status-soon'
      );
    }

    function paint(el){
      var t = ($(el).text()||'').trim();
      normalize(el);

      if (/заверш/i.test(t) || /ended/i.test(t)) el.classList.add('ifx-status-completed');
      else if (/скасов/i.test(t) || /cancel(l)?ed/i.test(t)) el.classList.add('ifx-status-canceled');
      else if (/онгоїн|виходить|триває/i.test(t) || /returning/i.test(t)) el.classList.add('ifx-status-ongoing');
      else if (/виробництв/i.test(t) || /in\s*production/i.test(t)) el.classList.add('ifx-status-production');
      else if (/заплан/i.test(t) || /planned/i.test(t)) el.classList.add('ifx-status-planned');
      else if (/пілот/i.test(t) || /pilot/i.test(t)) el.classList.add('ifx-status-pilot');
      else if (/випущ/i.test(t) || /released/i.test(t)) el.classList.add('ifx-status-released');
      else if (/чутк/i.test(t) || /rumored/i.test(t)) el.classList.add('ifx-status-rumored');
      else if (/пост/i.test(t) || /post/i.test(t)) el.classList.add('ifx-status-post');
      else if (/незабаром|скоро|soon/i.test(t)) el.classList.add('ifx-status-soon');
    }

    (elRoot || document).querySelectorAll && $(elRoot || document).find(SEL).each(function(){ paint(this); });
  }

  function enableStatusColoring(){
    applyStatusOnceIn(document);

    if (__statusObserver) __statusObserver.disconnect();
    __statusObserver = new MutationObserver(function(muts){
      if (!getBool('interface_mod_new_colored_status', false)) return;
      muts.forEach(function(m){
        (m.addedNodes||[]).forEach(function(n){
          if (n.nodeType !== 1) return;
          applyStatusOnceIn(n);
        });
      });
    });
    __statusObserver.observe(document.body, {childList:true, subtree:true});

    if (!__statusFollowReady){
      __statusFollowReady = true;
      Lampa.Listener.follow('full', function(e){
        if (e.type === 'complite' && getBool('interface_mod_new_colored_status', false)) {
          setTimeout(function(){ applyStatusOnceIn(e.object.activity.render()); }, 120);
        }
      });
    }
  }

  function disableStatusColoring(clearInline){
    if (__statusObserver) { __statusObserver.disconnect(); __statusObserver = null; }
    if (clearInline) $(STATUS_BASE_SEL).removeClass('ifx-status-completed ifx-status-canceled ifx-status-ongoing ifx-status-production ifx-status-planned ifx-status-pilot ifx-status-released ifx-status-rumored ifx-status-post ifx-status-soon');
  }

  var __ageObserver = null, __ageFollowReady = false;

  function applyAgeOnceIn(elRoot){
    if (!getBool('interface_mod_new_colored_age', false)) return;

    var groups = {
      kids:        ['G','TV-Y','TV-G','0+','3+','0','3'],
      children:    ['PG','TV-PG','TV-Y7','6+','7+','6','7'],
      teens:       ['PG-13','TV-14','12+','13+','14+','12','13','14'],
      almostAdult: ['R','TV-MA','16+','17+','16','17'],
      adult:       ['NC-17','18+','18','X']
    };
    var SEL = AGE_BASE_SEL;

    function normalize(el){
      el.classList.remove('ifx-age-kids','ifx-age-children','ifx-age-teens','ifx-age-almostadult','ifx-age-adult');
    }
    function paint(el){
      var t = ($(el).text()||'').trim(), g = '';
      Object.keys(groups).some(function(k){
        return groups[k].some(function(mark){
          if (t.indexOf(mark) !== -1) { g = k; return true; }
          return false;
        });
      });

      normalize(el);
      if (!g) return; // залишаємо базову рамку

      if (g==='kids') el.classList.add('ifx-age-kids');
      else if (g==='children') el.classList.add('ifx-age-children');
      else if (g==='teens') el.classList.add('ifx-age-teens');
      else if (g==='almostAdult') el.classList.add('ifx-age-almostadult');
      else if (g==='adult') el.classList.add('ifx-age-adult');
    }

    (elRoot || document).querySelectorAll && $(elRoot || document).find(SEL).each(function(){ paint(this); });
  }

  function enableAgeColoring(){
    applyAgeOnceIn(document);

    if (__ageObserver) __ageObserver.disconnect();
    __ageObserver = new MutationObserver(function(m){
      if (!getBool('interface_mod_new_colored_age', false)) return;
      m.forEach(function(x){
        (x.addedNodes||[]).forEach(function(n){
          if (n.nodeType !== 1) return;
          applyAgeOnceIn(n);
        });
      });
    });
    __ageObserver.observe(document.body, {childList:true, subtree:true});

    if (!__ageFollowReady){
      __ageFollowReady = true;
      Lampa.Listener.follow('full', function(e){
        if (e.type === 'complite' && getBool('interface_mod_new_colored_age', false)) {
          setTimeout(function(){ applyAgeOnceIn(e.object.activity.render()); }, 120);
        }
      });
    }
  }

  function disableAgeColoring(clearInline){
    if (__ageObserver) { __ageObserver.disconnect(); __ageObserver = null; }
    if (clearInline) $(AGE_BASE_SEL).removeClass('ifx-age-kids ifx-age-children ifx-age-teens ifx-age-almostadult ifx-age-adult');
  }

  /* ============================================================
   *  АНГЛІЙСЬКІ ДАНІ (оригінальна назва + опис при відсутності)
   * ============================================================ */
  function applyEnglishData(fullRoot, movie){
    var enabled = getBool('interface_mod_new_english_data', false);
    var $root = $(fullRoot||document);
    if (!movie) return;

    // При вимкненні — прибираємо лише вставлену ориг.назву
    if (!enabled) {
      $root.find('.ifx-eng-title').remove();
      return;
    }

    // 1) Оригінальна назва під заголовком
    var engTitle = movie.original_title || movie.original_name || '';
    if (engTitle) {
      var $title = $root.find('.full-start-new__title');
      if (!$title.length) $title = $root.find('.full-start__title');
      if ($title.length) {
        $title.find('.ifx-eng-title').remove();
        $('<span class="ifx-eng-title">').text(engTitle).appendTo($title);
        // Розмір/колір змінюються у CSS класі .ifx-eng-title (коментар у стилях)
      }
    }

    // 2) Опис — лише якщо локальний відсутній або placeholder
    var $descr = $root.find('.full-descr__text');
    if ($descr.length) {
      var txt = ($descr.text()||'').trim();
      var missing = !txt || /^без\s+опису\.?$/i.test(txt) || /^no\s+overview\.?$/i.test(txt) || /^без\s+описания\.?$/i.test(txt) || /^—+$/i.test(txt);

      if (missing) {
        var en =
          movie.overview_en ||
          movie.overview_english ||
          (movie.translations && movie.translations.en && movie.translations.en.overview) ||
          movie.overviewOriginal ||
          '';

        if (en && typeof en === 'string' && en.trim().length>0) {
          // Не змінюємо стиль — просто замінюємо текст на англ. (як у Enchancer)
          $descr.text(en.trim());
        }
      }
    }
  }

  /* ============================================================
   *  КНОПКИ: показ/порядок/іконки/колір
   *  Правила:
   *   - "Всі кнопки" (Так) → порядок: Торент → Онлайн → Трейлери → інші
   *   - "Порядок кнопок" (Так) → порядок: Онлайн → Торент → Трейлери → інші (має пріоритет)
   *   - "Іконки без тексту" (Так) → видаляє <span>/текст
   *   - "Кольорові кнопки" (Так) → додає кольори та оновлює SVG (як у cc+)
   * ============================================================ */
  function applyFullButtons(fullRoot){
    var $root = $(fullRoot || document);
    var $target = $root.find('.full-start-new__buttons');
    if (!$target.length) $target = $root.find('.full-start__buttons');
    if (!$target.length) return;

    var showAll    = getBool('interface_mod_new_buttons_all',   false);
    var forceOrder = getBool('interface_mod_new_buttons_sort',  false);
    var iconsOnly  = getBool('interface_mod_new_buttons_icons', false);
    var colored    = getBool('interface_mod_new_buttons_color', false);

    // якщо нічого не увімкнено — нічого не чіпаємо
    if (!showAll && !forceOrder && !iconsOnly && !colored) return;

    var $full = $target.closest('.full-start, .full-start-new');
    // усі кнопки з обох контейнерів
    var $pool = $().add( $full.find('.buttons--container .full-start__button') )
                   .add( $target.find('.full-start__button') );

    // kill play-дубль, якщо є
    $pool.filter('.button--play').remove();

    var isOnline  = function($b){ var c=($b.attr('class')||''); return $b.hasClass('view--online')  || /online/i.test(c);  };
    var isTorrent = function($b){ var c=($b.attr('class')||''); return $b.hasClass('view--torrent') || /torrent/i.test(c); };
    var isTrailer = function($b){ var c=($b.attr('class')||''); return $b.hasClass('view--trailer') || /trailer|teaser/i.test(c); };

    var buckets = { online:[], torrent:[], trailer:[], other:[] };
    var seen = new Set();

    $pool.each(function(){
      var el = this; if (seen.has(el)) return; seen.add(el);
      var $b = $(el);
      if (showAll) { $b.removeClass('hide').css('display',''); }

      if      (isTorrent($b)) buckets.torrent.push($b);
      else if (isOnline($b))  buckets.online.push($b);
      else if (isTrailer($b)) buckets.trailer.push($b);
      else                    buckets.other.push($b);
    });

    // порядок
    var order = null;
    if (forceOrder)      order = ['online','torrent','trailer'];  // пріоритет над "Всі кнопки"
    else if (showAll)    order = ['torrent','online','trailer'];  // сценарій "Всі кнопки"
    // якщо ні те, ні те — не міняємо розкладку

    if (order){
      $target.empty();
      order.forEach(function(key){ buckets[key].forEach(function($b){ $target.append($b); }); });
      buckets.other.forEach(function($b){ $target.append($b); });
    }

    // іконки без тексту
    if (iconsOnly){
      $target.find('.full-start__button').each(function(){
        var $b = $(this);
        $b.find('span').remove(); // більшість тем кладуть лейбл у span
        // прибрати сирі текст-ноди між тегами
        var html = $b.html();
        $b.html(html.replace(/>[^<]*</g, '><'));
      });
    }

    // кольорові кнопки + svg
    if (colored){
      $target.addClass('ifx-colored-buttons');

      buckets.torrent.forEach(function($b){
        $b.addClass('ifx-btn-torrent');
        var $svg = $b.find('svg');
        if ($svg.length) {
          $svg.replaceWith(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="50px" height="50px">
              <path d="M25,2C12.317,2,2,12.317,2,25s10.317,23,23,23s23-10.317,23-23S37.683,2,25,2zM40.5,30.963c-3.1,0-4.9-2.4-4.9-2.4S34.1,35,27,35c-1.4,0-3.6-0.837-3.6-0.837l4.17,9.643C26.727,43.92,25.874,44,25,44c-2.157,0-4.222-0.377-6.155-1.039L9.237,16.851c0,0-0.7-1.2,0.4-1.5c1.1-0.3,5.4-1.2,5.4-1.2s1.475-0.494,1.8,0.5c0.5,1.3,4.063,11.112,4.063,11.112S22.6,29,27.4,29c4.7,0,5.9-3.437,5.7-3.937c-1.2-3-4.993-11.862-4.993-11.862s-0.6-1.1,0.8-1.4c1.4-0.3,3.8-0.7,3.8-0.7s1.105-0.163,1.6,0.8c0.738,1.437,5.193,11.262,5.193,11.262s1.1,2.9,3.3,2.9c0.464,0,0.834-0.046,1.152-0.104c-0.082,1.635-0.348,3.221-0.817,4.722C42.541,30.867,41.756,30.963,40.5,30.963z"/>
            </svg>
          `);
        }
      });

      buckets.online.forEach(function($b){
        $b.addClass('ifx-btn-online');
        var $svg = $b.find('svg');
        if ($svg.length) {
          $svg.replaceWith(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
              <path d="M20.331 14.644l-13.794-13.831 17.55 10.075zM2.938 0c-0.813 0.425-1.356 1.2-1.356 2.206v27.581c0 1.006 0.544 1.781 1.356 2.206l16.038-16zM29.512 14.1l-3.681-2.131-4.106 4.031 4.106 4.031 3.756-2.131c1.125-0.893 1.125-2.906-0.075-3.8zM6.538 31.188l17.55-10.075-3.756-3.756z"/>
            </svg>
          `);
        }
      });

      buckets.trailer.forEach(function($b){
        $b.addClass('ifx-btn-trailer');
        var $svg = $b.find('svg');
        if ($svg.length) {
          $svg.replaceWith(`
            <svg height="70" viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M71.2555 2.08955C74.6975 3.2397 77.4083 6.62804 78.3283 10.9306C80 18.7291 80 35 80 35C80 35 80 51.2709 78.3283 59.0694C77.4083 63.372 74.6975 66.7603 71.2555 67.9104C65.0167 70 40 70 40 70C40 70 14.9833 70 8.74453 67.9104C5.3025 66.7603 2.59172 63.372 1.67172 59.0694C0 51.2709 0 35 0 35C0 35 0 18.7291 1.67172 10.9306C2.59172 6.62804 5.3025 3.2395 8.74453 2.08955C14.9833 0 40 0 40 0C40 0 65.0167 0 71.2555 2.08955ZM55.5909 35.0004L29.9773 49.5714V20.4286L55.5909 35.0004Z"/>
            </svg>
          `);
        }
      });
    }

    // завжди компактна верстка
    $target.css({ display:'flex', flexWrap:'wrap', gap:'10px' });

    // повертаємо контролер на full_start, щоб фокус не губився
    Lampa.Controller.toggle("full_start");
  }

  /* ============================================================
   *  ЗАПУСК ПЛАГІНА
   * ============================================================ */
  function startPlugin() {
    initInterfaceModSettingsUI();
    newInfoPanel();
    setupVoteColorsObserver();

    // Кольорові рейтинги — разово на старті
    if (settings.colored_ratings) updateVoteColors();

    // Статуси/PG
    setStatusBaseCssEnabled(settings.colored_status);
    if (settings.colored_status) enableStatusColoring(); else disableStatusColoring(true);

    setAgeBaseCssEnabled(settings.colored_age);
    if (settings.colored_age) enableAgeColoring(); else disableAgeColoring(true);

    // Тема
    if (settings.theme) applyTheme(settings.theme);
  }

  if (window.appready) startPlugin();
  else {
    Lampa.Listener.follow('app', function (e) {
      if (e.type === 'ready') startPlugin();
    });
  }
})();

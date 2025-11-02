(function () {
  'use strict';

  /* ============================================================
   *  ПОЛІФІЛИ ТА УТИЛІТИ
   * ============================================================ */

  // Polyfill startsWith для старих WebView
  if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
      position = position || 0;
      return this.indexOf(searchString, position) === position;
    };
  }

  // Правильні українські форми слів (1/2-4/5+)
  function plural(n, one, two, five) {
    n = Math.abs(n) % 100;
    if (n >= 5 && n <= 20) return five;
    n = n % 10;
    if (n === 1) return one;
    if (n >= 2 && n <= 4) return two;
    return five;
  }

  // Нормалізація булевих значень з Storage (прибирає «залипання» тумблерів)
  function getBool(key, def){
    var v = Lampa.Storage.get(key, def);
    if (typeof v === 'string') v = v.trim().toLowerCase();
    return v === true || v === 'true' || v === 1 || v === '1';
  }

  // Обчислення середньої тривалості серії
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

  // Форматування хвилин у «X годин Y хвилин»
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

    // Нові пункти
    interface_mod_new_engdata: { ru:'Английские данные', en:'English data', uk:'Англійські дані' },
    interface_mod_new_engdata_desc: {
      ru:'Добавляет оригинальное английское название и подтягивает описание, если оно отсутствует',
      en:'Adds the original English title and fills description if missing',
      uk:'Додає оригінальну англійську назву та підтягує опис, якщо він відсутній'
    },

    interface_mod_new_all_buttons: { ru:'Все кнопки в карточке', en:'All buttons in card', uk:'Всі кнопки в картці' },
    interface_mod_new_all_buttons_desc: {
      ru:'Показывать Онлайн, Торрент, Трейлеры даже если тема их скрывает',
      en:'Show Online, Torrent, Trailers even if the theme hides them',
      uk:'Показувати Онлайн, Торент, Трейлери навіть якщо тема їх приховує'
    },

    interface_mod_new_icon_only: { ru:'Иконки без текста', en:'Icons without text', uk:'Іконки без тексту' },
    interface_mod_new_icon_only_desc: {
      ru:'Скрыть подписи на кнопках, оставить только иконки',
      en:'Hide button labels, leave icons only',
      uk:'Приховати підписи на кнопках, залишити лише іконки'
    },

    interface_mod_new_button_order: { ru:'Порядок кнопок', en:'Button order', uk:'Порядок кнопок' },
    interface_mod_new_button_order_desc: {
      ru:'Принудительно упорядочить: Торрент → Онлайн → Трейлеры',
      en:'Force order: Torrent → Online → Trailers',
      uk:'Примусово впорядкувати: Торент → Онлайн → Трейлери'
    },

    interface_mod_new_colored_buttons: { ru:'Цветные кнопки', en:'Colored buttons', uk:'Кольорові кнопки' },
    interface_mod_new_colored_buttons_desc: {
      ru:'Раскрасить кнопки и обновить иконки (как в cc+)',
      en:'Colorize buttons and update icons (as in cc+)',
      uk:'Розфарбувати кнопки та оновити іконки (як у cc+)'
    }
  });

  /* ============================================================
   *  НАЛАШТУВАННЯ (дефолти та прапорці)
   * ============================================================ */
  var settings = {
    info_panel      : getBool('interface_mod_new_info_panel', true),
    colored_ratings : getBool('interface_mod_new_colored_ratings', false),
    colored_status  : getBool('interface_mod_new_colored_status', false),
    colored_age     : getBool('interface_mod_new_colored_age', false),
    theme           : (Lampa.Storage.get('interface_mod_new_theme_select', 'default') || 'default'),

    // Нові
    engdata         : getBool('interface_mod_new_engdata', true),  // англ. дані: УВІМКНЕНО за замовчуванням
    all_buttons     : getBool('interface_mod_new_all_buttons', false),   // "Всі кнопки в картці": Ні
    icon_only       : getBool('interface_mod_new_icon_only', false),     // "Іконки без тексту": Ні
    button_order    : getBool('interface_mod_new_button_order', false),  // "Порядок кнопок": Ні
    colored_buttons : getBool('interface_mod_new_colored_buttons', false)// "Кольорові кнопки": Ні
  };

  // Пам’ять поточної картки для миттєвої перебудови інфо-панелі
  var __ifx_last = { details:null, movie:null, originalHTML:'', isTv:false };

  /* ============================================================
   *  БАЗОВІ (СУМІСНІ) СТИЛІ КОНТЕЙНЕРА
   * ============================================================ */
  (function injectBaseCss(){
    if (document.getElementById('interface_mod_base')) return;

    var css = `
      /* Блок короткої інформації під постером */
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

      /* UX: відключає виділення тексту/підсвічування на тачах */
      *:not(input){ -webkit-user-select:none !important; -moz-user-select:none !important; -ms-user-select:none !important; user-select:none !important; }
      *{ -webkit-tap-highlight-color:transparent; -webkit-touch-callout:none; box-sizing:border-box; outline:none; -webkit-user-drag:none; }

      /* Рознесення елементів лінії рейтингів (сумісно зі стандартом) */
      .full-start-new__rate-line > * {
        margin-left: 0 !important;
        margin-right: 1em !important;
        flex-shrink: 0;
        flex-grow: 0;
      }

      /* Контейнер для англ. назви під головним заголовком */
      .ifx-eng-title{
        display:block;
        margin-top: .25em;
        /* >>> МІСЦЕ ДЛЯ НАЛАШТУВАННЯ РОЗМІРУ/КОЛЬОРУ ОРИГІНАЛЬНОЇ НАЗВИ <<<
           Зміни font-size / color під себе. Зараз зменшено приблизно на чверть і зроблено сірим. */
        font-size: 0.75em;           /* 0.75em ≈ на 25% менше за базовий заголовок */
        color: #9aa0a6;              /* сірий колір (можеш обрати інший) */
      }
    `;
    var st = document.createElement('style');
    st.id = 'interface_mod_base';
    st.textContent = css;
    document.head.appendChild(st);
  })();

  /* ============================================================
   *  ТЕМИ: Emerald V1, Emerald V2, Aurora
   * ============================================================ */
  function applyTheme(theme) {
    var old = document.getElementById('interface_mod_theme');
    if (old) old.remove();
    if (theme === 'default') return;

    var themeCss = {
      emerald_v1: `
        body {
          background: linear-gradient(135deg, #0c1619 0%, #132730 50%, #18323a 100%) !important;
          color: #dfdfdf !important;
        }
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
        body {
          background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%) !important;
          color: #ffffff !important;
        }
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
   *  УНІФІКОВАНІ СЕЛЕКТОРИ ДЛЯ СТАТУСІВ ТА PG
   * ============================================================ */
  var STATUS_BASE_SEL = '.full-start__status, .full-start-new__status, .full-start__soon, .full-start-new__soon, .full-start [data-status], .full-start-new [data-status]';
  var AGE_BASE_SEL    = '.full-start__pg, .full-start_pg, .full-start-new__pg, .full-start [data-pg], .full-start-new [data-pg], .full-start [data-age], .full-start-new [data-age]';

  /* ============================================================
   *  МЕНЮ «Інтерфейс+» + МИТТЄВЕ ЗАСТОСУВАННЯ НАЛАШТУВАНЬ
   * ============================================================ */
  function initInterfaceModSettingsUI(){
    if (window.__ifx_settings_ready) return;
    window.__ifx_settings_ready = true;

    // Створюємо групу «Інтерфейс+»
    Lampa.SettingsApi.addComponent({
      component: 'interface_mod_new',
      name: Lampa.Lang.translate('interface_mod_new_group_title'),
      icon: '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M4 5c0-.552.448-1 1-1h14c.552 0 1 .448 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5Zm0 6c0-.552.448-1 1-1h14c.552 0 1 .448 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2Zm0 6c0-.552.448-1 1-1h14c.552 0 1 .448 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2Z"/></svg>'
    });

    var add = Lampa.SettingsApi.addParam;

    // Оригінал інфо-панель / рейтинг / статус / PG / тема
    add({
      component: 'interface_mod_new',
      param: { name: 'interface_mod_new_info_panel', type: 'trigger', values: true, default: true },
      field: { name: Lampa.Lang.translate('interface_mod_new_info_panel'), description: Lampa.Lang.translate('interface_mod_new_info_panel_desc') }
    });
    add({
      component: 'interface_mod_new',
      param: { name: 'interface_mod_new_colored_ratings', type: 'trigger', values: true, default: false },
      field: { name: Lampa.Lang.translate('interface_mod_new_colored_ratings'), description: Lampa.Lang.translate('interface_mod_new_colored_ratings_desc') }
    });
    add({
      component: 'interface_mod_new',
      param: { name: 'interface_mod_new_colored_status', type: 'trigger', values: true, default: false },
      field: { name: Lampa.Lang.translate('interface_mod_new_colored_status'), description: Lampa.Lang.translate('interface_mod_new_colored_status_desc') }
    });
    add({
      component: 'interface_mod_new',
      param: { name: 'interface_mod_new_colored_age', type: 'trigger', values: true, default: false },
      field: { name: Lampa.Lang.translate('interface_mod_new_colored_age'), description: Lampa.Lang.translate('interface_mod_new_colored_age_desc') }
    });
    add({
      component: 'interface_mod_new',
      param: {
        name: 'interface_mod_new_theme_select',
        type: 'select',
        values: {
          'default'     : Lampa.Lang.translate('interface_mod_new_theme_default'),
          'emerald_v1'  : Lampa.Lang.translate('interface_mod_new_theme_emerald_v1'),
          'emerald_v2'  : Lampa.Lang.translate('interface_mod_new_theme_emerald_v2'),
          'aurora'      : Lampa.Lang.translate('interface_mod_new_theme_aurora')
        },
        default: 'default'
      },
      field: { name: Lampa.Lang.translate('interface_mod_new_theme_select_title') }
    });

    // Нові опції
    add({
      component: 'interface_mod_new',
      param: { name: 'interface_mod_new_engdata', type: 'trigger', values: true, default: true },
      field: { name: Lampa.Lang.translate('interface_mod_new_engdata'), description: Lampa.Lang.translate('interface_mod_new_engdata_desc') }
    });
    add({
      component: 'interface_mod_new',
      param: { name: 'interface_mod_new_all_buttons', type: 'trigger', values: true, default: false },
      field: { name: Lampa.Lang.translate('interface_mod_new_all_buttons'), description: Lampa.Lang.translate('interface_mod_new_all_buttons_desc') }
    });
    add({
      component: 'interface_mod_new',
      param: { name: 'interface_mod_new_icon_only', type: 'trigger', values: true, default: false },
      field: { name: Lampa.Lang.translate('interface_mod_new_icon_only'), description: Lampa.Lang.translate('interface_mod_new_icon_only_desc') }
    });
    add({
      component: 'interface_mod_new',
      param: { name: 'interface_mod_new_button_order', type: 'trigger', values: true, default: false },
      field: { name: Lampa.Lang.translate('interface_mod_new_button_order'), description: Lampa.Lang.translate('interface_mod_new_button_order_desc') }
    });
    add({
      component: 'interface_mod_new',
      param: { name: 'interface_mod_new_colored_buttons', type: 'trigger', values: true, default: false },
      field: { name: Lampa.Lang.translate('interface_mod_new_colored_buttons'), description: Lampa.Lang.translate('interface_mod_new_colored_buttons_desc') }
    });

    // Перенесення «Інтерфейс+» одразу за «Інтерфейс»
    function moveAfterInterface(){
      var $folders = $('.settings-folder');
      var $interface = $folders.filter(function(){ return $(this).data('component') === 'interface'; });
      var $mod = $folders.filter(function(){ return $(this).data('component') === 'interface_mod_new'; });
      if ($interface.length && $mod.length && $mod.prev()[0] !== $interface[0]) $mod.insertAfter($interface);
    }
    var tries=0, t=setInterval(function(){ moveAfterInterface(); if(++tries>=40) clearInterval(t); }, 150);
    var obsMenu = new MutationObserver(function(){ moveAfterInterface(); });
    obsMenu.observe(document.body, {childList:true, subtree:true});

    // Патч Storage.set: миттєве застосування змін
    if (!window.__ifx_patch_storage) {
      window.__ifx_patch_storage = true;
      var _set = Lampa.Storage.set;
      Lampa.Storage.set = function(key, val){
        var res = _set.apply(this, arguments);

        if (typeof key === 'string' && key.indexOf('interface_mod_new_') === 0) {
          settings.info_panel      = getBool('interface_mod_new_info_panel', true);
          settings.colored_ratings = getBool('interface_mod_new_colored_ratings', false);
          settings.colored_status  = getBool('interface_mod_new_colored_status', false);
          settings.colored_age     = getBool('interface_mod_new_colored_age', false);
          settings.theme           = (Lampa.Storage.get('interface_mod_new_theme_select', 'default') || 'default');

          settings.engdata         = getBool('interface_mod_new_engdata', true);
          settings.all_buttons     = getBool('interface_mod_new_all_buttons', false);
          settings.icon_only       = getBool('interface_mod_new_icon_only', false);
          settings.button_order    = getBool('interface_mod_new_button_order', false);
          settings.colored_buttons = getBool('interface_mod_new_colored_buttons', false);

          if (key === 'interface_mod_new_theme_select') applyTheme(settings.theme);
          if (key === 'interface_mod_new_info_panel')   rebuildInfoPanelActive();

          if (key === 'interface_mod_new_colored_ratings') {
            if (settings.colored_ratings) updateVoteColors();
            else                          clearVoteColors();
          }

          if (key === 'interface_mod_new_colored_status') {
            setStatusBaseCssEnabled(settings.colored_status);
            if (settings.colored_status) enableStatusColoring(); else disableStatusColoring(true);
          }

          if (key === 'interface_mod_new_colored_age') {
            setAgeBaseCssEnabled(settings.colored_age);
            if (settings.colored_age) enableAgeColoring(); else disableAgeColoring(true);
          }

          // НОВЕ: англ. дані + кнопки — миттєво
          if (key === 'interface_mod_new_engdata') {
            applyEnglishDataOnCurrentCard();
          }
          if (
            key === 'interface_mod_new_all_buttons' ||
            key === 'interface_mod_new_icon_only'   ||
            key === 'interface_mod_new_button_order'||
            key === 'interface_mod_new_colored_buttons'
          ) {
            rebuildButtonsUIOnCurrentCard();
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
    // Контейнер панелі
    var container = $('<div>').css({
      display:'flex','flex-direction':'column',width:'100%',gap:'0em',
      margin:'-1.0em 0 0.2em 0.45em'
    });

    // Ряди
    var row1 = $('<div>').css({ display:'flex','flex-wrap':'wrap',gap:'0.2em','align-items':'center',margin:'0 0 0.2em 0' });
    var row2 = $('<div>').css({ display:'flex','flex-wrap':'wrap',gap:'0.2em','align-items':'center',margin:'0 0 0.2em 0' });
    var row3 = $('<div>').css({ display:'flex','flex-wrap':'wrap',gap:'0.2em','align-items':'center',margin:'0 0 0.2em 0' });
    var row4 = $('<div>').css({ display:'flex','flex-wrap':'wrap',gap:'0.2em','align-items':'flex-start',margin:'0 0 0.2em 0' });

    // Кольори бейджів
    var colors = {
      seasons : { bg:'rgba(52,152,219,0.8)', text:'white' },
      episodes: { bg:'rgba(46,204,113,0.8)', text:'white' },
      duration: { bg:'rgba(52,152,219,0.8)', text:'white' },
      next    : { bg:'rgba(230,126,34,0.9)', text:'white' },
      genres: {
        'Бойовик':{bg:'rgba(231,76,60,.85)',text:'white'}, 'Пригоди':{bg:'rgba(39,174,96,.85)',text:'white'},
        'Мультфільм':{bg:'rgba(155,89,182,.85)',text:'white'}, 'Комедія':{bg:'rgba(241,196,15,.9)',text:'black'},
        'Кримінал':{bg:'rgba(192,57,43,.85)',text:'white'}, 'Документальний':{bg:'rgba(22,160,133,.85)',text:'white'},
        'Драма':{bg:'rgba(142,68,173,.85)',text:'white'}, 'Сімейний':{bg:'rgba(46,204,113,.85)',text:'white'},
        'Фентезі':{bg:'rgba(155,89,182,.85)',text:'white'}, 'Історія':{bg:'rgba(211,84,0,.85)',text:'white'},
        'Жахи':{bg:'rgba(192,57,43,.85)',text:'white'}, 'Музика':{bg:'rgba(52,152,219,.85)',text:'white'},
        'Детектив':{bg:'rgba(52,73,94,.85)',text:'white'}, 'Мелодрама':{bg:'rgba(233,30,99,.85)',text:'white'},
        'Фантастика':{bg:'rgba(41,128,185,.85)',text:'white'}, 'Трилер':{bg:'rgba(192,57,43,.85)',text:'white'},
        'Військовий':{bg:'rgba(127,140,141,.85)',text:'white'}, 'Вестерн':{bg:'rgba(211,84,0,.85)',text:'white'},
        'Бойовик і Пригоди':{bg:'rgba(231,76,60,.85)',text:'white'}, 'Дитячий':{bg:'rgba(46,204,113,.85)',text:'white'},
        'Новини':{bg:'rgba(52,152,219,.85)',text:'white'}, 'Реаліті-шоу':{bg:'rgba(230,126,34,.9)',text:'white'},
        'НФ і Фентезі':{bg:'rgba(41,128,185,.85)',text:'white'}, 'Мильна опера':{bg:'rgba(233,30,99,.85)',text:'white'},
        'Ток-шоу':{bg:'rgba(241,196,15,.9)',text:'black'}, 'Війна і Політика':{bg:'rgba(127,140,141,.85)',text:'white'}
      }
    };

    // Базові стилі бейджів
    var baseBadge = {
      'border-radius':'0.3em', border:'0', 'font-size':'1.0em',
      padding:'0.2em 0.6em', display:'inline-block', 'white-space':'nowrap',
      'line-height':'1.2em', 'margin-right':'0.4em', 'margin-bottom':'0.2em'
    };

    /* 1 — Серії (прогрес/усього) */
    var movieSeasons = Array.isArray(movie.seasons) ? movie.seasons : [];
    var isTvShow = (movie && (
      movie.number_of_seasons > 0 ||
      (movie.seasons && movie.seasons.length > 0) ||
      movie.type === 'tv' || movie.type === 'serial'
    ));

    if (isTvShow && movieSeasons.length) {
      var totalEps = 0, airedEps = 0, now = new Date(), hasEpisodes = false;
      movieSeasons.forEach(function (s) {
        if (s.season_number === 0) return;
        if (s.episode_count) totalEps += s.episode_count;
        if (Array.isArray(s.episodes) && s.episodes.length) {
          hasEpisodes = true;
          s.episodes.forEach(function (e) { if (e.air_date && new Date(e.air_date) <= now) airedEps++; });
        } else if (s.air_date && new Date(s.air_date) <= now && s.episode_count) {
          airedEps += s.episode_count;
        }
      });

      // Якщо немає списків епізодів — коригуємо за next_episode_to_air
      if (!hasEpisodes && movie.next_episode_to_air && movie.next_episode_to_air.season_number && movie.next_episode_to_air.episode_number) {
        var nextS = movie.next_episode_to_air.season_number, nextE = movie.next_episode_to_air.episode_number, rem = 0;
        movieSeasons.forEach(function (s) {
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

    /* 2 — Наступна серія (людський текст: сьогодні/завтра/через N днів) */
    if (isTvShow && movie.next_episode_to_air && movie.next_episode_to_air.air_date) {
      var nextDate = new Date(movie.next_episode_to_air.air_date), today = new Date();
      nextDate.setHours(0,0,0,0); today.setHours(0,0,0,0);
      var diff = Math.floor((nextDate - today) / (1000*60*60*24));
      var txt = diff===0 ? 'Наступна серія вже сьогодні' : diff===1 ? 'Наступна серія вже завтра' : diff>1 ? ('Наступна серія через ' + diff + ' ' + plural(diff,'день','дні','днів')) : '';
      if (txt) row2.append($('<span>').text(txt).css($.extend({}, baseBadge, { 'background-color': colors.next.bg, color: colors.next.text })));
    }

    /* 3 — Тривалість (фільм) / Середня тривалість серії (серіал) */
    if (!isTvShow && movie.runtime > 0) {
      var mins = movie.runtime;
      var t = 'Тривалість фільму: ' + formatDurationMinutes(mins);
      row3.append($('<span>').text(t).css($.extend({}, baseBadge, { 'background-color': colors.duration.bg, color: colors.duration.text })));
    } else if (isTvShow) {
      var avg = calculateAverageEpisodeDuration(movie);
      if (avg > 0) row3.append($('<span>').text('Тривалість серії ≈ ' + formatDurationMinutes(avg)).css($.extend({}, baseBadge, { 'background-color': colors.duration.bg, color: colors.duration.text })));
    }

    /* 4 — Сезони + Жанри */
    var seasonsCount = (movie.season_count || movie.number_of_seasons || (movie.seasons ? movie.seasons.filter(function(s){return s.season_number!==0;}).length : 0)) || 0;
    if (isTvShow && seasonsCount > 0) {
      row4.append($('<span>').text('Сезони: ' + seasonsCount).css($.extend({}, baseBadge, { 'background-color': colors.seasons.bg, color: colors.seasons.text })));
    }

    var genreList = [];
    if (Array.isArray(movie.genres) && movie.genres.length) {
      genreList = movie.genres.map(function(g){ return g.name; });
    } else if (__ifx_last.originalHTML) {
      var tmp = $('<div>').html(__ifx_last.originalHTML);
      tmp.find('span').each(function(){
        var t = $(this).text().trim();
        if (t.indexOf(' | ') !== -1) genreList = genreList.concat(t.split(' | ').map(function(s){return s.trim();}));
      });
    }
    genreList = genreList.filter(Boolean).filter(function(v,i,a){ return a.indexOf(v)===i; });

    var baseGenre = { 'border-radius':'0.3em', border:'0', 'font-size':'1.0em', padding:'0.2em 0.6em', display:'inline-block', 'white-space':'nowrap', 'line-height':'1.2em', 'margin-right':'0.4em', 'margin-bottom':'0.2em' };
    genreList.forEach(function(gn){
      var c = colors.genres[gn] || { bg:'rgba(255,255,255,.12)', text:'white' };
      row4.append($('<span>').text(gn).css($.extend({}, baseGenre, { 'background-color': c.bg, color: c.text })));
    });

    // Збирання
    container.append(row1);
    if (row2.children().length) container.append(row2);
    if (row3.children().length) container.append(row3);
    if (row4.children().length) container.append(row4);

    details.append(container);
  }

  // Перебудова інфо-панелі
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

  // Слухач відкриття картки
  function newInfoPanel() {
    Lampa.Listener.follow('full', function (data) {
      if (data.type !== 'complite') return;

      setTimeout(function () {
        var details = $('.full-start-new__details');
        if (!details.length) details = $('.full-start__details');
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

        if (!getBool('interface_mod_new_info_panel', true)) return;

        details.empty();
        buildInfoPanel(details, movie, isTvShow, __ifx_last.originalHTML);
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
    $(SEL).css({ color:'', border:'' });
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
   *  БАЗА СТИЛІВ ДЛЯ СТАТУСІВ/PG (дві стани)
   *  ВАЖЛИВО: коли «увімкнено», тримаємо білу рамку за замовчуванням,
   *  а під час фактичного підфарбування робимо її прозорою.
   *  Так у разі «проскоку» елемент не залишиться «без рамки».
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
          'border:1px solid #fff!important;' + /* рамка видима за замовчуванням */
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
          'border:1px solid #fff!important;' + /* рамка видима доти, доки не пофарбуємо */
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
   *  КОЛЬОРОВІ СТАТУСИ (+ «Незабаром/Скоро/Soon»)
   * ============================================================ */
  var __statusObserver = null;
  var __statusFollowReady = false;

  function applyStatusOnceIn(elRoot){
    if (!getBool('interface_mod_new_colored_status', false)) return;

    var palette = {
      completed: { bg:'rgba(46,204,113,.85)', text:'white' }, // Завершено / Ended
      canceled : { bg:'rgba(231,76,60,.9)',   text:'white' }, // Скасовано
      ongoing  : { bg:'rgba(243,156,18,.95)', text:'black' }, // Виходить / Returning series
      production:{bg:'rgba(52,152,219,.9)',   text:'white' }, // У виробництві
      planned  : { bg:'rgba(155,89,182,.9)',  text:'white' }, // Заплановано
      pilot    : { bg:'rgba(230,126,34,.95)', text:'white' }, // Пілот
      released : { bg:'rgba(26,188,156,.9)',  text:'white' }, // Випущено (для фільмів)
      rumored  : { bg:'rgba(149,165,166,.9)', text:'white' }, // Чутки
      post     : { bg:'rgba(0,188,212,.9)',   text:'white' }, // Постпродакшн
      soon     : { bg:'rgba(52,152,219,.95)', text:'white' }  // Незабаром / Скоро / Soon
    };

    var SEL = STATUS_BASE_SEL;

    function paint(el){
      var t = (($(el).text()||'') + ' ' + ($(el).attr('data-status')||'')).trim();
      var key = '';
      if (/заверш/i.test(t) || /ended/i.test(t)) key = 'completed';
      else if (/скасов/i.test(t) || /cancel(l)?ed/i.test(t)) key = 'canceled';
      else if (/онгоїн|виходить|триває/i.test(t) || /returning/i.test(t)) key = 'ongoing';
      else if (/виробництв/i.test(t) || /in\s*production/i.test(t)) key = 'production';
      else if (/заплан/i.test(t) || /planned/i.test(t)) key = 'planned';
      else if (/пілот/i.test(t) || /pilot/i.test(t)) key = 'pilot';
      else if (/випущ/i.test(t) || /released/i.test(t)) key = 'released';
      else if (/чутк/i.test(t) || /rumored/i.test(t)) key = 'rumored';
      else if (/\bpost\b/i.test(t) || /постпрод/i.test(t)) key = 'post';
      else if (/незабаром|скоро|\bsoon\b/i.test(t)) key = 'soon';

      if (!key){
        // Нерозпізнано — залишаємо видиму рамку
        el.style.setProperty('border', '1px solid #fff', 'important');
        return;
      }
      var c = palette[key];
      el.style.setProperty('background-color', c.bg, 'important');
      el.style.setProperty('color', c.text, 'important');
      el.style.setProperty('border', '1px solid transparent', 'important'); // рамка ховається після фарбування
      el.style.setProperty('font-size', '1.2em', 'important'); // уніфікуємо розмір
    }

    $(elRoot||document).find(SEL).each(function(){ paint(this); });
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
    if (clearInline) $(STATUS_BASE_SEL).css({ 'background-color':'', color:'', border:'' });
  }

  /* ============================================================
   *  КОЛЬОРОВІ ВІКОВІ РЕЙТИНГИ (PG) — з «жорстким» пріоритетом стилів
   *  (виправляє кейси, коли інші стилі ставлять !important)
   * ============================================================ */
  var __ageObserver = null;
  var __ageFollowReady = false;

  function applyAgeOnceIn(elRoot){
    if (!getBool('interface_mod_new_colored_age', false)) return;

    var SEL = AGE_BASE_SEL;

    function groupOf(t){
      var s = (t||'').trim().toUpperCase();
      // нормалізація нерелевантних пробілів
      s = s.replace(/\s+/g,' ');
      if (/(^|\W)(G|TV-Y|TV-G)(\W|$)|(^0\+$)|(^3\+$)/i.test(s)) return 'kids';
      if (/(^|\W)(PG|TV-PG|TV-Y7)(\W|$)|6\+|7\+/i.test(s)) return 'children';
      if (/(^|\W)(PG-13|TV-14)(\W|$)|12\+|13\+|14\+/i.test(s)) return 'teens';
      if (/(^|\W)(R|TV-MA)(\W|$)|16\+|17\+/i.test(s)) return 'almostAdult';
      if (/(^|\W)(NC-17|X)(\W|$)|18\+/i.test(s)) return 'adult';
      return '';
    }

    var col = {
      kids:{bg:'#2ecc71',text:'white'},
      children:{bg:'#3498db',text:'white'},
      teens:{bg:'#f1c40f',text:'black'},
      almostAdult:{bg:'#e67e22',text:'white'},
      adult:{bg:'#e74c3c',text:'white'}
    };

    function paint(el){
      var t = (($(el).text()||'') + ' ' + ($(el).attr('data-pg')||'') + ' ' + ($(el).attr('data-age')||''));
      var g = groupOf(t);
      if (!g){
        // Немає мапінгу — залишаємо видиму рамку (щоб не було «без рамки»)
        el.style.setProperty('border', '1px solid #fff', 'important');
        el.style.setProperty('font-size', '1.2em', 'important');
        return;
      }
      el.style.setProperty('background-color', col[g].bg, 'important');
      el.style.setProperty('color', col[g].text, 'important');
      el.style.setProperty('border', '1px solid transparent', 'important');
      el.style.setProperty('font-size', '1.2em', 'important'); // тримаємо розмір стабільним
    }

    $(elRoot||document).find(SEL).each(function(){ paint(this); });
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
    if (clearInline) $(AGE_BASE_SEL).css({ 'background-color':'', color:'', border:'' });
  }

  /* ============================================================
   *  АНГЛІЙСЬКІ ДАНІ (як у Enchancer): оригінальна назва + опис якщо відсутній
   * ============================================================ */
  function applyEnglishDataOnCurrentCard(){
    if (!settings.engdata) return;
    // пробуємо на поточному рендері
    var activity = $('.full-start, .full-start-new').closest('.activity')[0];
    if (!activity || !activity.component) return;
    var full = activity.component;
    var root = full.render ? $(full.render()) : $('.full-start, .full-start-new').first();
    if (!root.length) return;

    var movie = (full.card_data && full.card_data.movie) || (full.data && full.data.movie) || {};
    var tmdbSource = Lampa.Storage.field && Lampa.Storage.field('source') === 'tmdb';

    // 1) Оригінальна назва під заголовком (суто візуально)
    var engTitle = movie.original_title || movie.original_name || '';
    if (engTitle) {
      var head = root.find('.full-start-new__head, .full-start__head').first();
      if (head.length && !head.find('.ifx-eng-title').length) {
        head.append($('<div class="ifx-eng-title">').text(engTitle));
      }
    }

    // 2) Опис: тільки якщо його реально НЕМає (без примусу)
    //    Перевіряємо контейнер опису на «Без опису»/порожньо.
    var descrNode = root.find('.full-descr__text, .full-start__full_description, .full-start-new__full_description').first();
    if (!descrNode.length) return;

    var rawText = (descrNode.text() || '').trim();
    var looksEmpty =
      !rawText ||
      /^без\s+опису\.?$/i.test(rawText) ||
      /^без\s+описания\.?$/i.test(rawText) ||
      /^no\s+(description|overview)\.?$/i.test(rawText);

    if (!looksEmpty) return;

    // Якщо в нас є imdb_id — дістаємо англ. опис через TMDB (як в Enchancer).
    // Ключ і URL — ті ж самі, що використовує Enchancer.
    var imdb = (movie.imdb_id || (movie.external_ids && movie.external_ids.imdb_id) || '').trim();
    if (!imdb) return;

    var apiKey = "4ef0d7355d9ffb5151e987764708ce96";
    var apiUrlTMDB = 'https://api.themoviedb.org/3/';
    var apiUrlProxy = 'https://apitmdb.' + ((Lampa.Storage && Lampa.Storage.get('cub_domain')) || 'cub.watch') + '/3/';

    // Тип: movie чи tv — спробуємо обидва (якщо один не знайде)
    function fetchEnOverview(type, cb){
      var url = (Lampa.Storage && Lampa.Storage.field('proxy_tmdb') ? apiUrlProxy : apiUrlTMDB) +
                'find/' + encodeURIComponent(imdb) + '?api_key=' + apiKey + '&language=en-US&external_source=imdb_id';
      $.ajax({url:url, dataType:'json', timeout: 8000})
        .done(function(json){
          try{
            var arr = (type === 'movie') ? (json.movie_results||[]) : (json.tv_results||[]);
            var id  = (arr[0] && arr[0].id) ? arr[0].id : 0;
            if (!id) return cb('');
            var url2 = (Lampa.Storage && Lampa.Storage.field('proxy_tmdb') ? apiUrlProxy : apiUrlTMDB) +
                       type + '/' + id + '?api_key=' + apiKey + '&language=en-US';
            $.ajax({url:url2, dataType:'json', timeout: 8000})
              .done(function(d){ cb((d && (d.overview||'').trim()) || ''); })
              .fail(function(){ cb(''); });
          }catch(_){ cb(''); }
        })
        .fail(function(){ cb(''); });
    }

    fetchEnOverview('movie', function(overviewMovie){
      if (overviewMovie) {
        descrNode.text(overviewMovie);
      } else {
        fetchEnOverview('tv', function(overviewTv){
          if (overviewTv) descrNode.text(overviewTv);
        });
      }
    });
  }

  // Автозастосування англ. даних на кожній картці
  function setupEnglishDataHook(){
    if (!settings.engdata) return;
    Lampa.Listener.follow('full', function (e) {
      if (e.type === 'complite') {
        setTimeout(applyEnglishDataOnCurrentCard, 120);
      }
    });
  }

  /* ============================================================
   *  КНОПКИ (показати всі / іконки без тексту / порядок / кольорові)
   * ============================================================ */
  function ensureColoredButtonsStyle(on){
    var id = 'ifx_colored_buttons_css';
    var old = document.getElementById(id);
    if (old) old.remove();
    if (!on) return;

    var css = `
      /* Базовий стиль кнопок */
      .full-start__button{
        transition: transform .12s ease, box-shadow .12s ease;
      }
      .full-start__button:active{
        transform: translateY(1px) scale(0.99);
      }

      /* Кольори (як у стилізованих модів cc+) */
      .full-start__button.view--torrent{
        background: linear-gradient(135deg,#7f1d1d,#b91c1c);
        color:#fff !important;
      }
      .full-start__button.view--online{
        background: linear-gradient(135deg,#0e4f2f,#10b981);
        color:#fff !important;
      }
      .full-start__button.view--trailer{
        background: linear-gradient(135deg,#1f3a8a,#2563eb);
        color:#fff !important;
      }
      .full-start__button.view--torrent svg path,
      .full-start__button.view--online  svg path,
      .full-start__button.view--trailer svg path{
        fill:#fff !important;
      }
    `;
    var st = document.createElement('style');
    st.id = id;
    st.textContent = css;
    document.head.appendChild(st);
  }

  function replaceButtonIcons(root){
    // Замінюємо SVG (онлайн/торент/трейлер) на сталий набір
    var r = root || document;
    $(r).find('.full-start__button.view--torrent svg').replaceWith(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="22" height="22" style="vertical-align:-3px">
        <path d="M25,2C12.317,2,2,12.317,2,25s10.317,23,23,23s23-10.317,23-23S37.683,2,25,2zM40.5,30.963c-3.1,0-4.9-2.4-4.9-2.4S34.1,35,27,35c-1.4,0-3.6-0.837-3.6-0.837l4.17,9.643C26.727,43.92,25.874,44,25,44c-2.157,0-4.222-0.377-6.155-1.039L9.237,16.851c0,0-0.7-1.2,0.4-1.5c1.1-0.3,5.4-1.2,5.4-1.2s1.475-0.494,1.8,0.5c0.5,1.3,4.063,11.112,4.063,11.112S22.6,29,27.4,29c4.7,0,5.9-3.437,5.7-3.937c-1.2-3-4.993-11.862-4.993-11.862s-0.6-1.1,0.8-1.4c1.4-0.3,3.8-0.7,3.8-0.7s1.105-0.163,1.6,0.8c0.738,1.437,5.193,11.262,5.193,11.262s1.1,2.9,3.3,2.9c0.464,0,0.834-0.046,1.152-0.104c-0.082,1.635-0.348,3.221-0.817,4.722C42.541,30.867,41.756,30.963,40.5,30.963z"/>
      </svg>
    `);

    $(r).find('.full-start__button.view--online svg').replaceWith(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="22" height="22" style="vertical-align:-3px">
        <path d="M20.331 14.644l-13.794-13.831 17.55 10.075zM2.938 0c-0.813 0.425-1.356 1.2-1.356 2.206v27.581c0 1.006 0.544 1.781 1.356 2.206l16.038-16zM29.512 14.1l-3.681-2.131-4.106 4.031 4.106 4.031 3.756-2.131c1.125-0.893 1.125-2.906-0.075-3.8zM6.538 31.188l17.55-10.075-3.756-3.756z"/>
      </svg>
    `);

    $(r).find('.full-start__button.view--trailer svg').replaceWith(`
      <svg viewBox="0 0 80 70" width="26" height="26" style="vertical-align:-5px" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M71.2555 2.08955C74.6975 3.2397 77.4083 6.62804 78.3283 10.9306C80 18.7291 80 35 80 35C80 35 80 51.2709 78.3283 59.0694C77.4083 63.372 74.6975 66.7603 71.2555 67.9104C65.0167 70 40 70 40 70C40 70 14.9833 70 8.74453 67.9104C5.3025 66.7603 2.59172 63.372 1.67172 59.0694C0 51.2709 0 35 0 35C0 35 0 18.7291 1.67172 10.9306C2.59172 6.62804 5.3025 3.2395 8.74453 2.08955C14.9833 0 40 0 40 0C40 0 65.0167 0 71.2555 2.08955ZM55.5909 35.0004L29.9773 49.5714V20.4286L55.5909 35.0004Z"/>
      </svg>
    `);
  }

  function rebuildButtonsUIOnCurrentCard(){
    var activity = $('.full-start, .full-start-new').closest('.activity')[0];
    if (!activity || !activity.component) return;
    var full = activity.component;
    var root = full.render ? $(full.render()) : $('.full-start, .full-start-new').first();
    if (!root.length) return;

    var btnWrap = root.find('.full-start-new__buttons, .full-start__buttons').first();
    if (!btnWrap.length) return;

    // Видаляємо кнопки «Play», якщо вони існують окремо
    root.find('.button--play').remove();

    // Збираємо всі кнопки з різних місць
    var collected = root.find('.buttons--container .full-start__button').add(btnWrap.find('.full-start__button'));

    // Категоризація
    var categories = { torrent:[], online:[], trailer:[], other:[] };
    collected.each(function(){
      var $b = $(this);
      var cls = $b.attr('class') || '';
      if (/torrent/i.test(cls) || /view--torrent/.test(cls)) categories.torrent.push($b);
      else if (/online/i.test(cls) || /view--online/.test(cls)) categories.online.push($b);
      else if (/trailer/i.test(cls) || /view--trailer/.test(cls)) categories.trailer.push($b);
      else categories.other.push($b);
    });

    // Показати всі — робимо елементи видимими
    if (settings.all_buttons) {
      collected.each(function(){
        this.style.removeProperty('display');
        $(this).removeClass('hide hidden');
      });
    }

    // Очищення контейнера та впорядкування
    btnWrap.empty();

    // Порядок:
    //  - Якщо прапорець «Порядок кнопок» УВІМКНЕНО АБО «Всі кнопки» УВІМКНЕНО — примусово:
    //    Торент → Онлайн → Трейлери → Інші (як ти попросив останнім повідомленням)
    var order = (settings.button_order || settings.all_buttons)
      ? ['torrent','online','trailer','other']
      : ['torrent','online','trailer','other']; // fallback: залишив той самий, бо Lampa часто рендерить у своєму порядку

    order.forEach(function(cat){
      categories[cat].forEach(function($b){ btnWrap.append($b); });
    });

    // Іконки без тексту
    if (settings.icon_only) {
      btnWrap.find('.full-start__button span').remove();
    }

    // Кольорові кнопки + заміна іконок
    ensureColoredButtonsStyle(settings.colored_buttons);
    if (settings.colored_buttons) replaceButtonIcons(root);

    // Дрібний лайаут для переносу в ряд/наступний ряд
    btnWrap.css({ display:'flex', flexWrap:'wrap', gap:'10px' });

    // Повертаємо контроль фокусу
    Lampa.Controller.toggle('full_start');
  }

  function setupButtonsHook(){
    Lampa.Listener.follow('full', function (e) {
      if (e.type === 'complite') {
        setTimeout(rebuildButtonsUIOnCurrentCard, 120);
      }
    });
  }

  /* ============================================================
   *  ЗАПУСК ПЛАГІНА
   * ============================================================ */
  function startPlugin() {
    initInterfaceModSettingsUI();
    newInfoPanel();
    setupVoteColorsObserver();

    // Рейтинги
    if (settings.colored_ratings) updateVoteColors();

    // Статуси
    setStatusBaseCssEnabled(settings.colored_status);
    if (settings.colored_status) enableStatusColoring(); else disableStatusColoring(true);

    // Віковий рейтинг (PG)
    setAgeBaseCssEnabled(settings.colored_age);
    if (settings.colored_age) enableAgeColoring(); else disableAgeColoring(true);

    // Тема
    if (settings.theme) applyTheme(settings.theme);

    // Англ. дані
    setupEnglishDataHook();
    if (settings.engdata) setTimeout(applyEnglishDataOnCurrentCard, 150);

    // Кнопки
    setupButtonsHook();
    setTimeout(rebuildButtonsUIOnCurrentCard, 160);
  }

  // Очікуємо готовності застосунку
  if (window.appready) startPlugin();
  else {
    Lampa.Listener.follow('app', function (e) {
      if (e.type === 'ready') startPlugin();
    });
  }
})();

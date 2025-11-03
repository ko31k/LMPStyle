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
      uk:'Підсвічує вікові мітки фільму чи серіалу'
    },

    interface_mod_new_theme_select_title: { ru:'Тема интерфейса', en:'Interface theme', uk:'Тема інтерфейсу' },
    interface_mod_new_theme_default: { ru:'По умолчанию', en:'Default', uk:'За замовчуванням' },
    interface_mod_new_theme_emerald_v1: { ru:'Emerald V1', en:'Emerald V1', uk:'Emerald V1' },
    interface_mod_new_theme_emerald_v2: { ru:'Emerald V2', en:'Emerald V2', uk:'Emerald V2' },
    interface_mod_new_theme_aurora:     { ru:'Aurora',     en:'Aurora',     uk:'Aurora' },

    // Оригінальна назва
    interface_mod_new_en_data:      { ru:'Оригинальное название', en:'Original title', uk:'Оригінальна назва' },
    interface_mod_new_en_data_desc: {
      ru:'Показывать оригинальное (EN) название под заголовком карточки',
      en:'Show the original (EN) title under the card header',
      uk:'Показує оригінальну назву у заголовку.'
    },

    // ДОДАНО: кнопки
    interface_mod_new_all_buttons: { ru:'Все кнопки в карточке', en:'All buttons in card', uk:'Всі кнопки в картці' },
    interface_mod_new_all_buttons_desc: {
      ru:'Показывает все кнопки действий. Порядок: Онлайн → Торренты → Трейлеры',
      en:'Show all action buttons. Order: Online → Torrents → Trailers',
      uk:'Показує всі кнопки у картці. Порядок: Онлайн → Торренти → Трейлери'
    },
    interface_mod_new_icon_only: { ru:'Иконки без текста', en:'Icons only', uk:'Іконки без тексту' },
    interface_mod_new_icon_only_desc: {
      ru:'Скрывает подписи на кнопках, оставляет только иконки',
      en:'Hide button labels, keep only icons',
      uk:'Ховає підписи на кнопках, лишає тільки іконки'
    }
  });

  /* ============================================================
   *  НАЛАШТУВАННЯ
   * ============================================================ */
  function getOriginalTitleEnabled(){
    var rawNew = Lampa.Storage.get('interface_mod_new_en_data');
    if (typeof rawNew !== 'undefined') return getBool('interface_mod_new_en_data', true);
    return getBool('interface_mod_new_english_data', false);
  }

  var settings = {
    info_panel      : getBool('interface_mod_new_info_panel', true),
    colored_ratings : getBool('interface_mod_new_colored_ratings', false),
    colored_status  : getBool('interface_mod_new_colored_status', false),
    colored_age     : getBool('interface_mod_new_colored_age', false),
    theme           : (Lampa.Storage.get('interface_mod_new_theme_select', 'default') || 'default'),

    en_data         : getOriginalTitleEnabled(),

    // ДОДАНО:
    all_buttons     : getBool('interface_mod_new_all_buttons', false),
    icon_only       : getBool('interface_mod_new_icon_only', false)
  };

  var __ifx_last = { details:null, movie:null, originalHTML:'', isTv:false, fullRoot:null };

  /* ============================================================
   *  БАЗОВІ СТИЛІ
   * ============================================================ */
  (function injectBaseCss(){
    if (document.getElementById('interface_mod_base')) return;

    var css = `
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
      *:not(input){ -webkit-user-select:none !important; -moz-user-select:none !important; -ms-user-select:none !important; user-select:none !important; }
      *{ -webkit-tap-highlight-color:transparent; -webkit-touch-callout:none; box-sizing:border-box; outline:none; -webkit-user-drag:none; }

      .full-start-new__rate-line > * {
        margin-left: 0 !important;
        margin-right: 1em !important;
        flex-shrink: 0;
        flex-grow: 0;
      }

      .ifx-original-title{
        color:#aaa;
        font-size: 0.75em;
        font-weight: 600;
        margin-top: 4px;
        border-left: 2px solid #777;
        padding-left: 8px;
      }
    `;
    var st = document.createElement('style');
    st.id = 'interface_mod_base';
    st.textContent = css;
    document.head.appendChild(st);
  })();

  /* ============================================================
   *  ТЕМИ
   * ============================================================ */
  function applyTheme(theme) {
    var old = document.getElementById('interface_mod_theme');
    if (old) old.remove();
    if (theme === 'default') return;

    var themeCss = {
      emerald_v1: `
        body { background: linear-gradient(135deg, #0c1619 0%, #132730 50%, #18323a 100%) !important; color: #dfdfdf !important; }
        .menu__item, .settings-folder, .settings-param, .selectbox-item,
        .full-start__button, .full-descr__tag, .player-panel .button,
        .custom-online-btn, .custom-torrent-btn, .main2-more-btn,
        .simple-button, .menu__version { border-radius: 1.0em !important; }
        .menu__item.focus, .menu__item.traverse, .menu__item.hover,
        .settings-folder.focus, .settings-param.focus, .selectbox-item.focus,
        .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
        .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus,
        .simple-button.focus, .menu__version.focus {
          background: linear-gradient(to right, #1a594d, #0e3652) !important; color: #fff !important;
          box-shadow: 0 2px 8px rgba(26,89,77,.25) !important; border-radius: 1.0em !important;
        }
        .card.focus .card__view::after, .card.hover .card__view::after { border: 2px solid #1a594d !important; box-shadow: 0 0 10px rgba(26,89,77,.35) !important; border-radius: 1.0em !important; }
        .settings__content, .settings-input__content, .selectbox__content, .modal__content { background: rgba(12,22,25,.97) !important; border: 1px solid rgba(26,89,77,.12) !important; border-radius: 1.0em !important; }
      `,
      emerald_v2: `
        body { background: radial-gradient(1200px 600px at 70% 10%, #214a57 0%, transparent 60%), linear-gradient(135deg, #112229 0%, #15303a 45%, #0f1c22 100%) !important; color:#e6f2ef !important; }
        .menu__item.focus, .menu__item.traverse, .menu__item.hover,
        .settings-folder.focus, .settings-param.focus, .selectbox-item.focus,
        .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
        .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus,
        .simple-button.focus, .menu__version.focus {
          background: linear-gradient(90deg, rgba(38,164,131,0.95), rgba(18,94,138,0.95)) !important; color:#fff !important;
          backdrop-filter: blur(2px) !important; border-radius:.85em !important; box-shadow:0 6px 18px rgba(18,94,138,.35) !important;
        }
        .card.focus .card__view::after, .card.hover .card__view::after { border: 3px solid rgba(38,164,131,0.9) !important; box-shadow: 0 0 20px rgba(38,164,131,.45) !important; border-radius: .9em !important; }
        .settings__content, .settings-input__content, .selectbox__content, .modal__content { background: rgba(10,24,29,0.98) !important; border: 1px solid rgba(38,164,131,.15) !important; border-radius: .9em !important; }
      `,
      aurora: `
        body { background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%) !important; color: #ffffff !important; }
        .menu__item.focus, .menu__item.traverse, .menu__item.hover,
        .settings-folder.focus, .settings-param.focus, .selectbox-item.focus,
        .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
        .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus,
        .simple-button.focus, .menu__version.focus {
          background: linear-gradient(90deg, #aa4b6b, #6b6b83, #3b8d99) !important; color:#fff !important;
          box-shadow: 0 0 20px rgba(170,75,107,.35) !important; transform: scale(1.02) !important; border-radius: .85em !important;
        }
        .card.focus .card__view::after, .card.hover .card__view::after { border: 2px solid #aa4b6b !important; box-shadow: 0 0 22px rgba(170,75,107,.45) !important; border-radius: .9em !important; }
        .settings__content, .settings-input__content, .selectbox__content, .modal__content { background: rgba(20, 32, 39, 0.98) !important; border: 1px solid rgba(59,141,153,.18) !important; border-radius: .9em !important; }
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
   *  СЕЛЕКТОРИ ДЛЯ СТАТУСІВ ТА PG
   * ============================================================ */
  var STATUS_BASE_SEL = '.full-start__status, .full-start-new__status, .full-start__soon, .full-start-new__soon, .full-start [data-status], .full-start-new [data-status]';
  var AGE_BASE_SEL    = '.full-start__pg, .full-start-new__pg, .full-start [data-pg], .full-start-new [data-pg], .full-start [data-age], .full-start-new [data-age]';

  /* ============================================================
   *  МЕНЮ НАЛАШТУВАНЬ
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

    // Оригінальна назва
    add({
      component: 'interface_mod_new',
      param: { name: 'interface_mod_new_en_data', type: 'trigger', values: true, default: true },
      field: { name: Lampa.Lang.translate('interface_mod_new_en_data'), description: Lampa.Lang.translate('interface_mod_new_en_data_desc') }
    });

    // ДОДАНО: Всі кнопки / Іконки без тексту
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

    // Переміщення групи під "Інтерфейс"
    function moveAfterInterface(){
      var $folders = $('.settings-folder');
      var $interface = $folders.filter(function(){ return $(this).data('component') === 'interface'; });
      var $mod = $folders.filter(function(){ return $(this).data('component') === 'interface_mod_new'; });
      if ($interface.length && $mod.length && $mod.prev()[0] !== $interface[0]) $mod.insertAfter($interface);
    }
    var tries=0, t=setInterval(function(){ moveAfterInterface(); if(++tries>=40) clearInterval(t); }, 150);
    var obsMenu = new MutationObserver(function(){ moveAfterInterface(); });
    obsMenu.observe(document.body, {childList:true, subtree:true});

    // Патч Storage.set
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

          settings.en_data         = getOriginalTitleEnabled();
          settings.all_buttons     = getBool('interface_mod_new_all_buttons', false);
          settings.icon_only       = getBool('interface_mod_new_icon_only', false);

          if (key === 'interface_mod_new_theme_select') applyTheme(settings.theme);
          if (key === 'interface_mod_new_info_panel')   rebuildInfoPanelActive();

          if (key === 'interface_mod_new_colored_ratings') {
            if (settings.colored_ratings) updateVoteColors(); else clearVoteColors();
          }

          if (key === 'interface_mod_new_colored_status') {
            setStatusBaseCssEnabled(settings.colored_status);
            if (settings.colored_status) enableStatusColoring(); else disableStatusColoring(true);
          }

          if (key === 'interface_mod_new_colored_age') {
            setAgeBaseCssEnabled(settings.colored_age);
            if (settings.colored_age) enableAgeColoring(); else disableAgeColoring(true);
          }

          if (key === 'interface_mod_new_en_data' || key === 'interface_mod_new_english_data') {
            applyOriginalTitleToggle();
          }

          if (key === 'interface_mod_new_all_buttons' || key === 'interface_mod_new_icon_only') {
            rebuildButtonsNow();
          }
        }
        return res;
      };
    }
  }

  /* ============================================================
   *  ІНФО-ПАНЕЛЬ
   * ============================================================ */
  function buildInfoPanel(details, movie, isTvShow, originalDetails){
    var container = $('<div>').css({
      display:'flex','flex-direction':'column',width:'100%',gap:'0em',
      margin:'-1.0em 0 0.2em 0.45em'
    });

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

    if ((movie.number_of_seasons || (movie.seasons && movie.seasons.length)) && Array.isArray(movie.seasons)) {
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

      if (epsText) container.append($('<div>').append($('<span>').text(epsText).css($.extend({}, baseBadge, { 'background-color': colors.episodes.bg, color: colors.episodes.text }))));
    }

    if (movie && movie.next_episode_to_air && movie.next_episode_to_air.air_date) {
      var nextDate = new Date(movie.next_episode_to_air.air_date), today = new Date();
      nextDate.setHours(0,0,0,0); today.setHours(0,0,0,0);
      var diff = Math.floor((nextDate - today) / (1000*60*60*24));
      var txt = diff===0 ? 'Наступна серія вже сьогодні' : diff===1 ? 'Наступна серія вже завтра' : diff>1 ? ('Наступна серія через ' + diff + ' ' + plural(diff,'день','дні','днів')) : '';
      if (txt) container.append($('<div>').append($('<span>').text(txt).css($.extend({}, baseBadge, { 'background-color': colors.next.bg, color: colors.next.text })))); 
    }

    if (movie && !movie.number_of_seasons && !movie.seasons && movie.runtime > 0) {
      var mins = movie.runtime, h = Math.floor(mins/60), m = mins%60;
      var t = 'Тривалість фільму: ';
      if (h > 0) t += h + ' ' + plural(h,'година','години','годин');
      if (m > 0) t += (h>0?' ':'') + m + ' хв.';
      container.append($('<div>').append($('<span>').text(t).css($.extend({}, baseBadge, { 'background-color': colors.duration.bg, color: colors.duration.text }))));
    } else if (movie && (movie.number_of_seasons || (movie.seasons && movie.seasons.length))) {
      var avg = calculateAverageEpisodeDuration(movie);
      if (avg > 0) container.append($('<div>').append($('<span>').text('Тривалість серії ≈ ' + formatDurationMinutes(avg)).css($.extend({}, baseBadge, { 'background-color': colors.duration.bg, color: colors.duration.text }))));
    }

    var seasonsCount = (movie.season_count || movie.number_of_seasons || (movie.seasons ? movie.seasons.filter(function(s){return s.season_number!==0;}).length : 0)) || 0;
    if (seasonsCount > 0) {
      container.append($('<div>').append($('<span>').text('Сезони: ' + seasonsCount).css($.extend({}, baseBadge, { 'background-color': 'rgba(52,152,219,0.8)', color: 'white' }))));
    }

    var genreList = [];
    if (Array.isArray(movie.genres) && movie.genres.length) {
      genreList = movie.genres.map(function(g){ return g.name; });
    }
    genreList = genreList.filter(Boolean).filter(function(v,i,a){ return a.indexOf(v)===i; });
    var baseGenre = { 'border-radius':'0.3em', border:'0', 'font-size':'1.0em', padding:'0.2em 0.6ем'.replace('ем','em'), display:'inline-block', 'white-space':'nowrap', 'line-height':'1.2em', 'margin-right':'0.4em', 'margin-bottom':'0.2em' };
    genreList.forEach(function(gn){
      var c = { bg:'rgba(255,255,255,.12)', text:'white' };
      container.append($('<div>').append($('<span>').text(gn).css($.extend({}, baseGenre, { 'background-color': c.bg, color: c.text }))));
    });

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
        __ifx_last.fullRoot = $(data.object.activity.render());

        if (!getBool('interface_mod_new_info_panel', true)) return;

        details.empty();
        buildInfoPanel(details, movie, isTvShow, __ifx_last.originalHTML);
      }, 100);
    });
  }

  /* ============================================================
   *  КОЛЬОРОВІ РЕЙТИНГИ (числові)
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
   *  БАЗА СТИЛІВ ДЛЯ СТАТУСІВ/PG
   * ============================================================ */
  function setStatusBaseCssEnabled(enabled){
    var idEn = 'interface_mod_status_enabled';
    var idDis = 'interface_mod_status_disabled';
    document.getElementById(idEn) && document.getElementById(idEn).remove();
    document.getElementById(idDis) && document.getElementById(idDis).remove();

    var st = document.createElement('style');
    st.id = enabled ? idEn : idDis;
    st.textContent =
      STATUS_BASE_SEL + '{' +
        'font-size:1.2em!important;' +
        'border:1px solid ' + (enabled ? 'transparent' : '#fff') + '!important;' +
        'border-radius:0.2em!important;' +
        'padding:0.3em!important;' +
        'margin-right:0.3em!important;' +
        'margin-left:0!important;' +
        'display:inline-block!important;' +
      '}';
    document.head.appendChild(st);
  }

  function setAgeBaseCssEnabled(enabled){
    var idEn = 'interface_mod_age_enabled';
    var idDis = 'interface_mod_age_disabled';
    document.getElementById(idEn) && document.getElementById(idEn).remove();
    document.getElementById(idDis) && document.getElementById(idDis).remove();

    var st = document.createElement('style');
    st.id = enabled ? idEn : idDis;
    st.textContent =
      AGE_BASE_SEL + '{' +
        'font-size:1.2em!important;' +
        'border:1px solid ' + (enabled ? 'transparent' : '#fff') + '!important;' +
        'border-radius:0.2em!important;' +
        'padding:0.3em!important;' +
        'margin-right:0.3em!important;' +
        'margin-left:0!important;' +
        'display:inline-block!important;' +
      '}';
    document.head.appendChild(st);
  }

  /* ============================================================
   *  КОЛЬОРОВІ СТАТУСИ
   * ============================================================ */
  var __statusObserver = null;
  var __statusFollowReady = false;

  function applyStatusOnceIn(elRoot){
    if (!getBool('interface_mod_new_colored_status', false)) return;

    var palette = {
      completed: { bg:'rgba(46,204,113,.85)', text:'white' },
      canceled : { bg:'rgba(231,76,60,.9)',   text:'white' },
      ongoing  : { bg:'rgba(243,156,18,.95)', text:'black' },
      production:{bg:'rgba(52,152,219,.9)',   text:'white' },
      planned  : { bg:'rgba(155,89,182,.9)',  text:'white' },
      pilot    : { bg:'rgba(230,126,34,.95)', text:'white' },
      released : { bg:'rgba(26,188,156,.9)',  text:'white' },
      rumored  : { bg:'rgba(149,165,166,.9)', text:'white' },
      post     : { bg:'rgba(0,188,212,.9)',   text:'white' },
      soon     : { bg:'rgba(142,68,173,.95)', text:'white' }
    };

    var $root = $(elRoot||document);
    $root.find(STATUS_BASE_SEL).each(function(){
      var el = this;
      var t = ($(el).text()||'').trim();
      var key = '';
      if (/заверш/i.test(t) || /ended/i.test(t)) key = 'completed';
      else if (/скасов/i.test(t) || /cancel(l)?ed/i.test(t)) key = 'canceled';
      else if (/онгоїн|виходить|триває/i.test(t) || /returning/i.test(t)) key = 'ongoing';
      else if (/виробництв/i.test(t) || /in\s*production/i.test(t)) key = 'production';
      else if (/заплан/i.test(t) || /planned/i.test(t)) key = 'planned';
      else if (/пілот/i.test(t) || /pilot/i.test(t)) key = 'pilot';
      else if (/випущ/i.test(t) || /released/i.test(t)) key = 'released';
      else if (/чутк/i.test(t) || /rumored/i.test(t)) key = 'rumored';
      else if (/пост/i.test(t) || /post/i.test(t)) key = 'post';
      else if (/незабаром|скоро|soon/i.test(t)) key = 'soon';

      if (!key){
        $(el).css({ 'background-color':'', color:'', border:'1px solid #fff' });
        return;
      }
      var c = palette[key];
      $(el).css({ 'background-color': c.bg, color: c.text, 'border-color':'transparent', 'display':'inline-block' });
    });
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
   *  КОЛЬОРОВІ ВІКОВІ РЕЙТИНГИ (PG)
   * ============================================================ */
  var __ageObserver = null;
  var __ageFollowReady = false;

  function applyAgeOnceIn(elRoot){
    if (!getBool('interface_mod_new_colored_age', false)) return;

    var groups = {
      kids:        ['G','TV-Y','TV-G','0+','3+','0','3'],
      children:    ['PG','TV-PG','TV-Y7','6+','7+','6','7'],
      teens:       ['PG-13','TV-14','12+','13+','14+','12','13','14'],
      almostAdult: ['R','TV-MA','16+','17+','16','17'],
      adult:       ['NC-17','18+','18','X']
    };
    var col = {
      kids:{bg:'#2ecc71',text:'white'},
      children:{bg:'#3498db',text:'white'},
      teens:{bg:'#f1c40f',text:'black'},
      almostAdult:{bg:'#e67e22',text:'white'},
      adult:{bg:'#e74c3c',text:'white'}
    };

    var $root = $(elRoot||document);
    $root.find(AGE_BASE_SEL).each(function(){
      var el = this;
      var t = ($(el).text()||'').trim();
      var g = '';
      Object.keys(groups).some(function(k){
        return groups[k].some(function(mark){
          if (t.indexOf(mark) !== -1) { g = k; return true; }
          return false;
        });
      });

      if (!g){
        $(el).css({ 'background-color':'', color:'', border:'1px solid #fff', 'display':'inline-block' });
        return;
      }

      $(el).css({
        'background-color': col[g].bg,
        color: col[g].text,
        'border-color':'transparent',
        'display':'inline-block'
      });
    });
  }

  function scheduleAgePasses(root){
    [100, 300, 800, 1600].forEach(function(ms){
      setTimeout(function(){ applyAgeOnceIn(root); }, ms);
    });
  }

  function enableAgeColoring(){
    applyAgeOnceIn(document);

    if (__ageObserver) __ageObserver.disconnect();

    __ageObserver = new MutationObserver(function(muts){
      if (!getBool('interface_mod_new_colored_age', false)) return;

      muts.forEach(function(m){
        (m.addedNodes||[]).forEach(function(n){
          if (n.nodeType !== 1) return;
          if (n.matches && n.matches(AGE_BASE_SEL)) applyAgeOnceIn(n);
          $(n).find && $(n).find(AGE_BASE_SEL).each(function(){ applyAgeOnceIn(this); });
        });

        if (m.type === 'attributes' && m.target && m.target.nodeType === 1) {
          var target = m.target;
          if (target.matches && target.matches(AGE_BASE_SEL)) {
            applyAgeOnceIn(target);
          }
        }

        if (m.type === 'characterData' && m.target && m.target.parentNode) {
          var parent = m.target.parentNode;
          if (parent.matches && parent.matches(AGE_BASE_SEL)) {
            applyAgeOnceIn(parent);
          }
        }
      });
    });

    __ageObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
      attributeFilter: ['class','data-age','data-pg','style']
    });

    if (!__ageFollowReady){
      __ageFollowReady = true;
      Lampa.Listener.follow('full', function(e){
        if (e.type === 'complite' && getBool('interface_mod_new_colored_age', false)) {
          var root = e.object.activity.render();
          setTimeout(function(){ applyAgeOnceIn(root); }, 120);
          scheduleAgePasses(root);
        }
      });
    }
  }

  function disableAgeColoring(clearInline){
    if (__ageObserver) { __ageObserver.disconnect(); __ageObserver = null; }
    if (clearInline) $(AGE_BASE_SEL).css({ 'background-color':'', color:'', border:'1px solid #fff', 'display':'inline-block' });
  }

  /* ============================================================
   *  ОРИГІНАЛЬНА НАЗВА (EN)
   * ============================================================ */
  function setOriginalTitle(fullRoot, movie){
    if (!fullRoot || !movie) return;

    var head = fullRoot.find('.full-start-new__head, .full-start__head').first();
    if (!head.length) return;

    head.find('.ifx-original-title').remove();

    if (!getOriginalTitleEnabled()) return;

    var original = movie.original_title || movie.original_name || movie.original || movie.name || movie.title || '';
    if (!original) return;

    $('<div class="ifx-original-title"></div>').text(original).appendTo(head);
  }

  function applyOriginalTitleToggle(){
    if (!__ifx_last.fullRoot) return;
    var head = __ifx_last.fullRoot.find('.full-start-new__head, .full-start__head').first();
    if (!head.length) return;

    head.find('.ifx-original-title').remove();
    if (getOriginalTitleEnabled()) setOriginalTitle(__ifx_last.fullRoot, __ifx_last.movie || {});
  }

  function wireOriginalTitleEnhancer(){
    Lampa.Listener.follow('full', function (e) {
      if (e.type !== 'complite') return;
      setTimeout(function(){
        var root = $(e.object.activity.render());
        __ifx_last.fullRoot = root;
        __ifx_last.movie = e.data.movie || __ifx_last.movie || {};
        setOriginalTitle(root, __ifx_last.movie);
      }, 120);
    });
  }

  /* ============================================================
   *  КНОПКИ: "Всі кнопки" + "Іконки без тексту"
   *  (логіка взята з LME showButton, адаптована під наші ключі)
   * ============================================================ */

  function reorderAllButtons(fullRoot){
    if (!fullRoot || !settings.all_buttons) return;

    var container = fullRoot.find('.full-start-new__buttons, .full-start__buttons').first();
    if (!container.length) return;

    // забрати дефолтну play-кнопку
    fullRoot.find('.button--play').remove();

    var allButtons = fullRoot.find('.buttons--container .full-start__button').add(container.find('.full-start__button'));

    var categories = { online: [], torrent: [], trailer: [], other: [] };

    allButtons.each(function () {
      var $btn = $(this);
      var cls = ($btn.attr('class') || '').toLowerCase();
      if (cls.includes('online'))   categories.online.push($btn);
      else if (cls.includes('torrent')) categories.torrent.push($btn);
      else if (cls.includes('trailer')) categories.trailer.push($btn);
      else categories.other.push($btn);
    });

    // порядок за вимогою: Онлайн → Торренти → Трейлери → інші
    var order = ['online','torrent','trailer','other'];

    container.empty();
    order.forEach(function(cat){
      categories[cat].forEach(function($b){ container.append($b); });
    });

    // стилі контейнера як у LME (wrap + gap)
    container.css({ display:'flex', flexWrap:'wrap', gap:'10px' });

    // "Іконки без тексту" — як у LME: прибираємо <span>
    if (settings.icon_only){
      container.find('span').remove();
    }

    try { Lampa.Controller.toggle('full_start'); } catch(e){}
  }

  function applyIconsOnly(fullRoot){
    if (!fullRoot || !settings.icon_only) return;
    // Якщо "Всі кнопки" не активні, все одно прибираємо текст у видимих кнопок
    var container = fullRoot.find('.full-start-new__buttons, .full-start__buttons').first();
    if (!container.length) return;
    container.find('span').remove();
    try { Lampa.Controller.toggle('full_start'); } catch(e){}
  }

  function rebuildButtonsNow(){
    if (!__ifx_last.fullRoot) return;
    if (settings.all_buttons) reorderAllButtons(__ifx_last.fullRoot);
    else if (settings.icon_only) applyIconsOnly(__ifx_last.fullRoot);
  }

  function wireButtonsEnhancer(){
    Lampa.Listener.follow('full', function (e) {
      if (e.type !== 'complite') return;
      setTimeout(function(){
        var root = $(e.object.activity.render());
        __ifx_last.fullRoot = root;
        // застосувати негайно згідно з налаштуваннями
        if (settings.all_buttons) reorderAllButtons(root);
        else if (settings.icon_only) applyIconsOnly(root);
      }, 120);
    });
  }

  /* ============================================================
   *  ЗАПУСК
   * ============================================================ */
  function startPlugin() {
    initInterfaceModSettingsUI();
    newInfoPanel();
    setupVoteColorsObserver();

    if (settings.colored_ratings) updateVoteColors();

    setStatusBaseCssEnabled(settings.colored_status);
    if (settings.colored_status) enableStatusColoring(); else disableStatusColoring(true);

    setAgeBaseCssEnabled(settings.colored_age);
    if (settings.colored_age) enableAgeColoring(); else disableAgeColoring(true);

    if (settings.theme) applyTheme(settings.theme);

    wireOriginalTitleEnhancer();
    wireButtonsEnhancer();
  }

  if (window.appready) startPlugin();
  else {
    Lampa.Listener.follow('app', function (e) {
      if (e.type === 'ready') startPlugin();
    });
  }
})();

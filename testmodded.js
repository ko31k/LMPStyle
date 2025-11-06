(function () {
  'use strict';

  /* ============================================================
   * ПОЛІФІЛИ ТА УТИЛІТИ
   * ============================================================ */

  /**
   * Поліфіл для String.prototype.startsWith
   */
  if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
      position = position || 0;
      return this.indexOf(searchString, position) === position;
    };
  }

  /**
   * Повертає правильну форму слова для числівника
   * @param {number} n - Число
   * @param {string} one - 'година'
   * @param {string} two - 'години'
   * @param {string} five - 'годин'
   * @returns {string}
   */
  function plural(n, one, two, five) {
    n = Math.abs(n) % 100;
    if (n >= 5 && n <= 20) return five;
    n = n % 10;
    if (n === 1) return one;
    if (n >= 2 && n <= 4) return two;
    return five;
  }

  /**
   * Отримує булеве значення зі сховища Lampa
   * @param {string} key - Ключ у сховищі
   * @param {boolean} def - Значення за замовчуванням
   * @returns {boolean}
   */
  function getBool(key, def) {
    var v = Lampa.Storage.get(key, def);
    if (typeof v === 'string') v = v.trim().toLowerCase();
    return v === true || v === 'true' || v === 1 || v === '1';
  }

  /**
   * Розраховує середню тривалість епізоду (в хвилинах)
   * @param {object} movie - Об'єкт movie з Lampa
   * @returns {number} - Середня тривалість в хвилинах
   */
  function calculateAverageEpisodeDuration(movie) {
    if (!movie || typeof movie !== 'object') return 0;
    var total = 0,
      count = 0;

    if (Array.isArray(movie.episode_run_time) && movie.episode_run_time.length) {
      movie.episode_run_time.forEach(function (m) {
        if (m > 0 && m <= 200) {
          total += m;
          count++;
        }
      });
    } else if (Array.isArray(movie.seasons)) {
      movie.seasons.forEach(function (s) {
        if (Array.isArray(s.episodes)) {
          s.episodes.forEach(function (e) {
            if (e.runtime && e.runtime > 0 && e.runtime <= 200) {
              total += e.runtime;
              count++;
            }
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

  /**
   * Форматує хвилини у рядок "X годин Y хвилин"
   * @param {number} minutes - Тривалість в хвилинах
   * @returns {string}
   */
  function formatDurationMinutes(minutes) {
    if (!minutes || minutes <= 0) return '';
    var h = Math.floor(minutes / 60),
      m = minutes % 60,
      out = '';
    if (h > 0) {
      out += h + ' ' + plural(h, 'година', 'години', 'годин');
      if (m > 0) out += ' ' + m + ' ' + plural(m, 'хвилина', 'хвилини', 'хвилин');
    } else {
      out += m + ' ' + plural(m, 'хвилина', 'хвилини', 'хвилин');
    }
    return out;
  }

  /* ============================================================
   * ЛОКАЛІЗАЦІЯ
   * ============================================================ */
  Lampa.Lang.add({
    interface_mod_new_group_title: {
      en: 'Interface +',
      uk: 'Інтерфейс +'
    },
    interface_mod_new_plugin_name: {
      en: 'Interface +',
      uk: 'Інтерфейс +'
    },

    interface_mod_new_info_panel: {
      en: 'New info panel',
      uk: 'Нова інфо-панель'
    },
    interface_mod_new_info_panel_desc: {
      en: 'Colored and rephrased info line',
      uk: 'Кольорова та перефразована інформаційна панель'
    },

    interface_mod_new_colored_ratings: {
      en: 'Colored rating',
      uk: 'Кольоровий рейтинг'
    },
    interface_mod_new_colored_ratings_desc: {
      en: 'Enable colored rating highlight',
      uk: 'Увімкнути кольорове виділення рейтингу'
    },

    interface_mod_new_colored_status: {
      en: 'Colored statuses',
      uk: 'Кольорові статуси'
    },
    interface_mod_new_colored_status_desc: {
      en: 'Colorize series status',
      uk: 'Підсвічувати статус серіалу'
    },

    interface_mod_new_colored_age: {
      en: 'Colored age rating',
      uk: 'Кольоровий віковий рейтинг'
    },
    interface_mod_new_colored_age_desc: {
      en: 'Colorize age rating',
      uk: 'Підсвічувати віковий рейтинг'
    },

    interface_mod_new_theme_select_title: {
      en: 'Interface theme',
      uk: 'Тема інтерфейсу'
    },
    interface_mod_new_theme_default: {
      en: 'Default',
      uk: 'За замовчуванням'
    },
    interface_mod_new_theme_emerald_v1: {
      en: 'Emerald V1',
      uk: 'Emerald V1'
    },
    interface_mod_new_theme_emerald_v2: {
      en: 'Emerald V2',
      uk: 'Emerald V2'
    },
    interface_mod_new_theme_aurora: {
      en: 'Aurora',
      uk: 'Aurora'
    },

    // ОРИГІНАЛЬНА НАЗВА
    interface_mod_new_en_data: {
      en: 'Original title',
      uk: 'Оригінальна назва'
    },
    interface_mod_new_en_data_desc: {
      en: 'Show original (EN) title under the card header',
      uk: 'Показувати оригінальну назву в заголовку картки'
    },

    // КНОПКИ
    interface_mod_new_all_buttons: {
      en: 'All buttons in card',
      uk: 'Всі кнопки в картці'
    },
    interface_mod_new_all_buttons_desc: {
      en: 'Show all buttons in the card. Order: Online → Torrents → Trailers',
      uk: 'Показує всі кнопки у картці (Потрібне перезавантаження)'
    },

    interface_mod_new_icon_only: {
      en: 'Icons only',
      uk: 'Кнопки без тексту'
    },
    interface_mod_new_icon_only_desc: {
      en: 'Hide button labels, keep only icons',
      uk: 'Ховає підписи на кнопках, лишає тільки іконки'
    },

    interface_mod_new_colored_buttons: {
      en: 'Colored buttons',
      uk: 'Кольорові кнопки'
    },
    interface_mod_new_colored_buttons_desc: {
      en: 'Colorize card buttons and update icons',
      uk: 'Розфарбовує кнопки в картці та оновлює іконки'
    },

    // ТОРЕНТИ (з torrents+mod)
    torr_mod_frame: {
      uk: 'Кольорова рамка блоку торентів',
      en: 'Torrent frame by seeders'
    },
    torr_mod_frame_desc: {
      uk: 'Підсвічувати блоки торентів кольоровою рамкою залежно від кількості сідерів',
      en: 'Outline torrent rows based on seeder count'
    },
    torr_mod_bitrate: {
      uk: 'Кольоровий  бітрейт',
      en: 'Bitrate-based coloring'
    },
    torr_mod_bitrate_desc: {
      uk: 'Підсвічувати бітрейт кольором в залежності від розміру',
      en: 'Color bitrate by value'
    },
    torr_mod_seeds: {
      uk: 'Кольорова кількість роздаючих',
      en: 'Seeder count coloring'
    },
    torr_mod_seeds_desc: {
      uk: 'Підсвічувати кількість сідерів на роздачі: \n0–4 — червоний, 5–14 — жовтий, 15 і вище — зелений',
      en: 'Seeders: 0–4 red, 5–14 yellow, 15+ green'
    },
  });

  /* ============================================================
   * НАЛАШТУВАННЯ
   * ============================================================ */

  /**
   * Отримує налаштування оригінальної назви (зі зворотною сумісністю)
   */
  function getOriginalTitleEnabled() {
    var rawNew = Lampa.Storage.get('interface_mod_new_en_data');
    if (typeof rawNew !== 'undefined') return getBool('interface_mod_new_en_data', true);
    // Fallback до старого ключа
    return getBool('interface_mod_new_english_data', false);
  }

  /**
   * Об'єкт з поточними налаштуваннями плагіну
   */
  var settings = {
    info_panel: getBool('interface_mod_new_info_panel', true),
    colored_ratings: getBool('interface_mod_new_colored_ratings', false),
    colored_status: getBool('interface_mod_new_colored_status', false),
    colored_age: getBool('interface_mod_new_colored_age', false),
    theme: (Lampa.Storage.get('interface_mod_new_theme_select', 'default') || 'default'),

    en_data: getOriginalTitleEnabled(),
    all_buttons: getBool('interface_mod_new_all_buttons', false),
    icon_only: getBool('interface_mod_new_icon_only', false),
    colored_buttons: getBool('interface_mod_new_colored_buttons', false),

    // Налаштування для torrents+mod
    tor_frame: getBool('interface_mod_new_tor_frame', true),
    tor_bitrate: getBool('interface_mod_new_tor_bitrate', true),
    tor_seeds: getBool('interface_mod_new_tor_seeds', true),
  };

  /**
   * Кеш DOM-елементів та даних поточної відкритої картки
   */
  var __ifx_last = {
    details: null,
    movie: null,
    originalHTML: '',
    isTv: false,
    fullRoot: null
  };
  var __ifx_btn_cache = {
    container: null,
    nodes: null
  };

  /* ============================================================
   * ФОЛБЕК-CSS + ПРІОРИТЕТ СТИЛІВ
   * ============================================================ */

  /**
   * Додає CSS для "відкату" стилів (якщо кольорові статуси/рейтинги вимкнені)
   */
  function injectFallbackCss() {
    if (document.getElementById('ifx_fallback_css')) return;
    var st = document.createElement('style');
    st.id = 'ifx_fallback_css';
    st.textContent = `
      .ifx-status-fallback{ border-color:#fff !important; background:none !important; color:inherit !important; }
      .ifx-age-fallback{    border-color:#fff !important; background:none !important; color:inherit !important; }
    `;
    document.head.appendChild(st);
  }

  /**
   * Переконується, що стилі плагіну (особливо теми) мають вищий пріоритет
   */
  function ensureStylesPriority(ids) {
    var head = document.head;
    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.parentNode === head) {
        head.removeChild(el);
        head.appendChild(el);
      }
    });
  }

  /* ============================================================
   * БАЗОВІ СТИЛІ
   * ============================================================ */
  (function injectBaseCss() {
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

      /* ОРИГІНАЛЬНА НАЗВА — сірий, −25%, з лівою лінією */
      .ifx-original-title{
        color:#aaa;
        font-size: 0.75em;
        font-weight: 600;
        margin-top: 4px;
        border-left: 2px solid #777;
        padding-left: 8px;
      }

      /* Іконки без тексту */
      .ifx-btn-icon-only .full-start__button span,
      .ifx-btn-icon-only .full-start__button .full-start__text{
        display:none !important;
      }

      .full-start__buttons.ifx-flex,
      .full-start-new__buttons.ifx-flex{
        display:flex !important;
        flex-wrap:wrap !important;
        gap:10px !important;
      }
    `;
    var st = document.createElement('style');
    st.id = 'interface_mod_base';
    st.textContent = css;
    document.head.appendChild(st);
  })();

  /* ============================================================
   * ТЕМИ
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

    var id = theme === 'emerald_v1' ? 'emerald_v1' :
      theme === 'emerald_v2' ? 'emerald_v2' :
      'aurora';

    var st = document.createElement('style');
    st.id = 'interface_mod_theme';
    st.textContent = themeCss[id];
    document.head.appendChild(st);
    ensureStylesPriority(['interface_mod_theme']);
  }

  /* ============================================================
   * СЕЛЕКТОРИ ДЛЯ СТАТУСІВ ТА PG
   * ============================================================ */
  var STATUS_BASE_SEL = '.full-start__status, .full-start-new__status, .full-start__soon, .full-start-new__soon, .full-start [data-status], .full-start-new [data-status]';
  var AGE_BASE_SEL = '.full-start__pg, .full-start-new__pg, .full-start [data-pg], .full-start-new [data-pg], .full-start [data-age], .full-start-new [data-age]';

  /* ============================================================
   * НАЛАШТУВАННЯ UI
   * ============================================================ */

  /**
   * Ініціалізує компонент налаштувань "Інтерфейс +"
   */
  function initInterfaceModSettingsUI() {
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
      param: {
        name: 'interface_mod_new_info_panel',
        type: 'trigger',
        values: true,
        default: true
      },
      field: {
        name: Lampa.Lang.translate('interface_mod_new_info_panel'),
        description: Lampa.Lang.translate('interface_mod_new_info_panel_desc')
      }
    });

    add({
      component: 'interface_mod_new',
      param: {
        name: 'interface_mod_new_colored_ratings',
        type: 'trigger',
        values: true,
        default: false
      },
      field: {
        name: Lampa.Lang.translate('interface_mod_new_colored_ratings'),
        description: Lampa.Lang.translate('interface_mod_new_colored_ratings_desc')
      }
    });

    add({
      component: 'interface_mod_new',
      param: {
        name: 'interface_mod_new_colored_status',
        type: 'trigger',
        values: true,
        default: false
      },
      field: {
        name: Lampa.Lang.translate('interface_mod_new_colored_status'),
        description: Lampa.Lang.translate('interface_mod_new_colored_status_desc')
      }
    });

    add({
      component: 'interface_mod_new',
      param: {
        name: 'interface_mod_new_colored_age',
        type: 'trigger',
        values: true,
        default: false
      },
      field: {
        name: Lampa.Lang.translate('interface_mod_new_colored_age'),
        description: Lampa.Lang.translate('interface_mod_new_colored_age_desc')
      }
    });

    add({
      component: 'interface_mod_new',
      param: {
        name: 'interface_mod_new_theme_select',
        type: 'select',
        values: {
          'default': Lampa.Lang.translate('interface_mod_new_theme_default'),
          'emerald_v1': Lampa.Lang.translate('interface_mod_new_theme_emerald_v1'),
          'emerald_v2': Lampa.Lang.translate('interface_mod_new_theme_emerald_v2'),
          'aurora': Lampa.Lang.translate('interface_mod_new_theme_aurora')
        },
        default: 'default'
      },
      field: {
        name: Lampa.Lang.translate('interface_mod_new_theme_select_title')
      }
    });

    // Оригінальна назва
    add({
      component: 'interface_mod_new',
      param: {
        name: 'interface_mod_new_en_data',
        type: 'trigger',
        values: true,
        default: true
      },
      field: {
        name: Lampa.Lang.translate('interface_mod_new_en_data'),
        description: Lampa.Lang.translate('interface_mod_new_en_data_desc')
      }
    });

    // Всі кнопки + Іконки без тексту
    add({
      component: 'interface_mod_new',
      param: {
        name: 'interface_mod_new_all_buttons',
        type: 'trigger',
        values: true,
        default: false
      },
      field: {
        name: Lampa.Lang.translate('interface_mod_new_all_buttons'),
        description: Lampa.Lang.translate('interface_mod_new_all_buttons_desc')
      }
    });

    add({
      component: 'interface_mod_new',
      param: {
        name: 'interface_mod_new_icon_only',
        type: 'trigger',
        values: true,
        default: false
      },
      field: {
        name: Lampa.Lang.translate('interface_mod_new_icon_only'),
        description: Lampa.Lang.translate('interface_mod_new_icon_only_desc')
      }
    });

    // Кольорові кнопки
    add({
      component: 'interface_mod_new',
      param: {
        name: 'interface_mod_new_colored_buttons',
        type: 'trigger',
        values: true,
        default: false
      },
      field: {
        name: Lampa.Lang.translate('interface_mod_new_colored_buttons'),
        description: Lampa.Lang.translate('interface_mod_new_colored_buttons_desc')
      }
    });

    // Торенти: три тумблери
    add({
      component: 'interface_mod_new',
      param: {
        name: 'interface_mod_new_tor_frame',
        type: 'trigger',
        values: true,
        default: true
      },
      field: {
        name: Lampa.Lang.translate('torr_mod_frame'),
        description: Lampa.Lang.translate('torr_mod_frame_desc')
      }
    });

    add({
      component: 'interface_mod_new',
      param: {
        name: 'interface_mod_new_tor_bitrate',
        type: 'trigger',
        values: true,
        default: true
      },
      field: {
        name: Lampa.Lang.translate('torr_mod_bitrate'),
        description: Lampa.Lang.translate('torr_mod_bitrate_desc')
      }
    });

    add({
      component: 'interface_mod_new',
      param: {
        name: 'interface_mod_new_tor_seeds',
        type: 'trigger',
        values: true,
        default: true
      },
      field: {
        name: Lampa.Lang.translate('torr_mod_seeds'),
        description: Lampa.Lang.translate('torr_mod_seeds_desc')
      }
    });

    /**
     * Переміщує групу "Інтерфейс +" відразу після групи "Інтерфейс"
     */
    function moveAfterInterface() {
      var $folders = $('.settings-folder');
      var $interface = $folders.filter(function () {
        return $(this).data('component') === 'interface';
      });
      var $mod = $folders.filter(function () {
        return $(this).data('component') === 'interface_mod_new';
      });
      if ($interface.length && $mod.length && $mod.prev()[0] !== $interface[0]) $mod.insertAfter($interface);
    }

    var tries = 0,
      t = setInterval(function () {
        moveAfterInterface();
        if (++tries >= 40) clearInterval(t);
      }, 150);

    var obsMenu = new MutationObserver(function () {
      moveAfterInterface();
    });
    obsMenu.observe(document.body, {
      childList: true,
      subtree: true
    });

    /**
     * Закриває випадаючі списки і оновлює налаштування
     * ВИКЛИКАЄ Lampa.Settings.update() - ПРИЧИНА "СТРИБКІВ"
     */
    function closeOpenSelects() {
      setTimeout(function () {
        $('.selectbox').remove();
        Lampa.Settings.update();
      }, 60);
    }

    // ПАТЧ Lampa.Storage.set
    // Це "контролер", який реагує на зміни налаштувань
    if (!window.__ifx_patch_storage) {
      window.__ifx_patch_storage = true;
      var _set = Lampa.Storage.set;

      Lampa.Storage.set = function (key, val) {
        var res = _set.apply(this, arguments);

        // Реагуємо тільки на зміни *наших* налаштувань
        if (typeof key === 'string' && key.indexOf('interface_mod_new_') === 0) {
          
          // Оновлюємо внутрішній об'єкт 'settings'
          settings.info_panel = getBool('interface_mod_new_info_panel', true);
          settings.colored_ratings = getBool('interface_mod_new_colored_ratings', false);
          settings.colored_status = getBool('interface_mod_new_colored_status', false);
          settings.colored_age = getBool('interface_mod_new_colored_age', false);
          settings.theme = (Lampa.Storage.get('interface_mod_new_theme_select', 'default') || 'default');
          settings.en_data = getOriginalTitleEnabled();
          settings.all_buttons = getBool('interface_mod_new_all_buttons', false);
          settings.icon_only = getBool('interface_mod_new_icon_only', false);
          settings.colored_buttons = getBool('interface_mod_new_colored_buttons', false);
          settings.tor_frame = getBool('interface_mod_new_tor_frame', true);
          settings.tor_bitrate = getBool('interface_mod_new_tor_bitrate', true);
          settings.tor_seeds = getBool('interface_mod_new_tor_seeds', true);

          // Застосовуємо зміни

          if (key === 'interface_mod_new_theme_select') {
            applyTheme(settings.theme);
            // [!!!] Викликаємо оновлення тільки для select-боксу,
            // щоб закрити список і уникнути стрибка на інших налаштуваннях.
            closeOpenSelects(); 
          }
          
          if (key === 'interface_mod_new_info_panel') {
            rebuildInfoPanelActive();
          }

          if (key === 'interface_mod_new_colored_ratings') {
            if (settings.colored_ratings) updateVoteColors();
            else clearVoteColors();
          }

          if (key === 'interface_mod_new_colored_status') {
            setStatusBaseCssEnabled(settings.colored_status);
            if (settings.colored_status) enableStatusColoring();
            else disableStatusColoring(true);
          }

          if (key === 'interface_mod_new_colored_age') {
            setAgeBaseCssEnabled(settings.colored_age);
            if (settings.colored_age) enableAgeColoring();
            else disableAgeColoring(true);
          }

          if (key === 'interface_mod_new_en_data' || key === 'interface_mod_new_english_data') {
            applyOriginalTitleToggle();
          }

          if (key === 'interface_mod_new_all_buttons' || key === 'interface_mod_new_icon_only') {
            rebuildButtonsNow();
          }

          if (key === 'interface_mod_new_colored_buttons') {
            setColoredButtonsEnabled(settings.colored_buttons);
          }
          
          // [!!!] Виклик перенесено в `if (key === 'interface_mod_new_theme_select')`
          // closeOpenSelects(); 

          // Оновлюємо стилі торентів при зміні їх налаштувань
          if (key === 'interface_mod_new_tor_frame' || key === 'interface_mod_new_tor_bitrate' || key === 'interface_mod_new_tor_seeds') {
            try {
              if (window.runTorrentStyleRefresh) window.runTorrentStyleRefresh();
            } catch (e) {}
          }

        }
        return res;
      };
    }
  }

  /* ============================================================
   * ІНФО-ПАНЕЛЬ (4 ряди + кольорові жанри)
   * ============================================================ */

  /**
   * Створює і наповнює нову інфо-панель
   */
  function buildInfoPanel(details, movie, isTvShow, originalDetails) {
    var container = $('<div>').css({
      display: 'flex',
      'flex-direction': 'column',
      width: '100%',
      gap: '0em', // '0em'.replace('ем','em') - дивний хак, замінив на '0em'
      margin: '-1.0em 0 0.2em 0.45em'
    });

    var row1 = $('<div>').css({ display: 'flex', 'flex-wrap': 'wrap', gap: '0.2em', 'align-items': 'center', margin: '0 0 0.2em 0' });
    var row2 = $('<div>').css({ display: 'flex', 'flex-wrap': 'wrap', gap: '0.2em', 'align-items': 'center', margin: '0 0 0.2em 0' });
    var row3 = $('<div>').css({ display: 'flex', 'flex-wrap': 'wrap', gap: '0.2em', 'align-items': 'center', margin: '0 0 0.2em 0' });
    var row4 = $('<div>').css({ display: 'flex', 'flex-wrap': 'wrap', gap: '0.2em', 'align-items': 'flex-start', margin: '0 0 0.2em 0' });

    var colors = {
      seasons: { bg: 'rgba(52,152,219,0.8)', text: 'white' },
      episodes: { bg: 'rgba(46,204,113,0.8)', text: 'white' },
      duration: { bg: 'rgba(52,152,219,0.8)', text: 'white' },
      next: { bg: 'rgba(230,126,34,0.9)', text: 'white' },
      genres: {
        'Бойовик': { bg: 'rgba(231,76,60,.85)', text: 'white' }, 'Пригоди': { bg: 'rgba(39,174,96,.85)', text: 'white' },
        'Мультфільм': { bg: 'rgba(155,89,182,.85)', text: 'white' }, 'Комедія': { bg: 'rgba(241,196,15,.9)', text: 'black' },
        'Кримінал': { bg: 'rgba(88,24,69,.85)', text: 'white' }, 'Документальний': { bg: 'rgba(22,160,133,.85)', text: 'white' },
        'Драма': { bg: 'rgba(102,51,153,.85)', text: 'white' }, 'Сімейний': { bg: 'rgba(139,195,74,.90)', text: 'white' },
        'Фентезі': { bg: 'rgba(22,110,116,.85)', text: 'white' }, 'Історія': { bg: 'rgba(121,85,72,.85)', text: 'white' },
        'Жахи': { bg: 'rgba(155,27,48,.85)', text: 'white' }, 'Музика': { bg: 'rgba(63,81,181,.85)', text: 'white' },
        'Детектив': { bg: 'rgba(52,73,94,.85)', text: 'white' }, 'Мелодрама': { bg: 'rgba(233,30,99,.85)', text: 'white' },
        'Фантастика': { bg: 'rgba(41,128,185,.85)', text: 'white' }, 'Трилер': { bg: 'rgba(165,27,11,.90)', text: 'white' },
        'Військовий': { bg: 'rgba(85,107,47,.85)', text: 'white' }, 'Вестерн': { bg: 'rgba(211,84,0,.85)', text: 'white' },
        'Бойовик і Пригоди': { bg: 'rgba(231,76,60,.85)', text: 'white' }, 'Дитячий': { bg: 'rgba(0,188,212,.85)', text: 'white' },
        'Новини': { bg: 'rgba(70,130,180,.85)', text: 'white' }, 'Реаліті-шоу': { bg: 'rgba(230,126,34,.9)', text: 'white' },
        'НФ і Фентезі': { bg: 'rgba(41,128,185,.85)', text: 'white' }, 'Мильна опера': { bg: 'rgba(233,30,99,.85)', text: 'white' },
        'Ток-шоу': { bg: 'rgba(241,196,15,.9)', text: 'black' }, 'Війна і Політика': { bg: 'rgba(96,125,139,.85)', text: 'white' },
        'Екшн і Пригоди': { bg: 'rgba(231,76,60,.85)', text: 'white' },
        'Екшн': { bg: 'rgba(231,76,60,.85)', text: 'white' },
        'Науково фантастичний': { bg: 'rgba(40,53,147,.90)', text: 'white' },
        'Науково-фантастичний': { bg: 'rgba(40,53,147,.90)', text: 'white' },
        'Наукова фантастика': { bg: 'rgba(40,53,147,.90)', text: 'white' },
        'Наукова-фантастика': { bg: 'rgba(40,53,147,.90)', text: 'white' },
        'Науково-фантастика': { bg: 'rgba(40,53,147,.90)', text: 'white' }
      }
    };

    var baseBadge = {
      'border-radius': '0.3em',
      border: '0',
      'font-size': '1.0em',
      padding: '0.2em 0.6em',
      display: 'inline-block',
      'white-space': 'nowrap',
      'line-height': '1.2em',
      'margin-right': '0.4em',
      'margin-bottom': '0.2em'
    };

    // 1 — Серії (для серіалів)
    if (isTvShow && Array.isArray(movie.seasons)) {
      var totalEps = 0,
        airedEps = 0,
        now = new Date(),
        hasEpisodes = false;
      movie.seasons.forEach(function (s) {
        if (s.season_number === 0) return;
        if (s.episode_count) totalEps += s.episode_count;
        if (Array.isArray(s.episodes) && s.episodes.length) {
          hasEpisodes = true;
          s.episodes.forEach(function (e) {
            if (e.air_date && new Date(e.air_date) <= now) airedEps++;
          });
        } else if (s.air_date && new Date(s.air_date) <= now && s.episode_count) {
          airedEps += s.episode_count;
        }
      });

      if (!hasEpisodes && movie.next_episode_to_air && movie.next_episode_to_air.season_number && movie.next_episode_to_air.episode_number) {
        var nextS = movie.next_episode_to_air.season_number,
          nextE = movie.next_episode_to_air.episode_number,
          rem = 0;
        movie.seasons.forEach(function (s) {
          if (s.season_number === nextS) rem += (s.episode_count || 0) - nextE + 1;
          else if (s.season_number > nextS) rem += s.episode_count || 0;
        });
        if (rem > 0 && totalEps > 0) airedEps = Math.max(0, totalEps - rem);
      }

      var epsText = '';
      if (totalEps > 0 && airedEps > 0 && airedEps < totalEps) epsText = airedEps + ' ' + plural(airedEps, 'Серія', 'Серії', 'Серій') + ' з ' + totalEps;
      else if (totalEps > 0) epsText = totalEps + ' ' + plural(totalEps, 'Серія', 'Серії', 'Серій');

      if (epsText) row1.append($('<span>').text(epsText).css($.extend({}, baseBadge, {
        'background-color': colors.episodes.bg,
        color: colors.episodes.text
      })));
    }

    // 2 — Наступна серія
    if (isTvShow && movie.next_episode_to_air && movie.next_episode_to_air.air_date) {
      var nextDate = new Date(movie.next_episode_to_air.air_date),
        today = new Date();
      nextDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      var diff = Math.floor((nextDate - today) / (1000 * 60 * 60 * 24));
      var txt = diff === 0 ? 'Наступна серія вже сьогодні' : diff === 1 ? 'Наступна серія вже завтра' : diff > 1 ? ('Наступна серія через ' + diff + ' ' + plural(diff, 'день', 'дні', 'днів')) : '';
      if (txt) row2.append($('<span>').text(txt).css($.extend({}, baseBadge, {
        'background-color': colors.next.bg,
        color: colors.next.text
      })));
    }

    // 3 — Тривалість
    if (!isTvShow && movie.runtime > 0) {
      var mins = movie.runtime,
        h = Math.floor(mins / 60),
        m = mins % 60;
      var t = 'Тривалість фільму: ';
      if (h > 0) t += h + ' ' + plural(h, 'година', 'години', 'годин');
      if (m > 0) t += (h > 0 ? ' ' : '') + m + ' хв.';
      row3.append($('<span>').text(t).css($.extend({}, baseBadge, {
        'background-color': colors.duration.bg,
        color: colors.duration.text
      })));
    } else if (isTvShow) {
      var avg = calculateAverageEpisodeDuration(movie);
      if (avg > 0) row3.append($('<span>').text('Тривалість серії ≈ ' + formatDurationMinutes(avg)).css($.extend({}, baseBadge, {
        'background-color': colors.duration.bg,
        color: colors.duration.text
      })));
    }

    // 4 — Сезони + Жанри
    var seasonsCount = (movie.season_count || movie.number_of_seasons || (movie.seasons ? movie.seasons.filter(function (s) {
      return s.season_number !== 0;
    }).length : 0)) || 0;
    if (isTvShow && seasonsCount > 0) {
      row4.append($('<span>').text('Сезони: ' + seasonsCount).css($.extend({}, baseBadge, {
        'background-color': colors.seasons.bg,
        color: colors.seasons.text
      })));
    }

    var genreList = [];
    if (Array.isArray(movie.genres) && movie.genres.length) {
      genreList = movie.genres.map(function (g) {
        return g.name;
      });
    }
    genreList = genreList.filter(Boolean).filter(function (v, i, a) {
      return a.indexOf(v) === i;
    });

    var baseGenre = {
      'border-radius': '0.3em',
      border: '0',
      'font-size': '1.0em',
      padding: '0.2em 0.6em',
      display: 'inline-block',
      'white-space': 'nowrap',
      'line-height': '1.2em',
      'margin-right': '0.4em',
      'margin-bottom': '0.2em'
    };
    genreList.forEach(function (gn) {
      var c = colors.genres[gn] || {
        bg: 'rgba(255,255,255,.12)',
        text: 'white'
      };
      row4.append($('<span>').text(gn).css($.extend({}, baseGenre, {
        'background-color': c.bg,
        color: c.text
      })));
    });

    container.append(row1);
    if (row2.children().length) container.append(row2);
    if (row3.children().length) container.append(row3);
    if (row4.children().length) container.append(row4);
    details.append(container);
  }

  /**
   * Перебудовує інфо-панель на відкритій картці (або повертає оригінальну)
   */
  function rebuildInfoPanelActive() {
    var enabled = getBool('interface_mod_new_info_panel', true);
    if (!__ifx_last.details || !__ifx_last.details.length) return;

    if (!enabled) {
      __ifx_last.details.html(__ifx_last.originalHTML);
    } else {
      __ifx_last.details.empty();
      buildInfoPanel(__ifx_last.details, __ifx_last.movie, __ifx_last.isTv, __ifx_last.originalHTML);
    }
  }

  /**
   * Встановлює слухача Lampa.Listener 'full' для нової інфо-панелі
   */
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

        // Кешуємо дані про відкриту картку
        __ifx_last.details = details;
        __ifx_last.movie = movie;
        __ifx_last.isTv = isTvShow;
        __ifx_last.originalHTML = details.html();
        __ifx_last.fullRoot = $(data.object.activity.render());

        // Якщо налаштування вимкнене, нічого не робимо
        if (!getBool('interface_mod_new_info_panel', true)) return;

        // Будуємо нову панель
        details.empty();
        buildInfoPanel(details, movie, isTvShow, __ifx_last.originalHTML);
      }, 100);
    });
  }

  /* ============================================================
   * КОЛЬОРОВІ РЕЙТИНГИ
   * ============================================================ */

  /**
   * Застосовує кольори до всіх видимих рейтингів
   */
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

      var color = (v <= 3) ? 'red' : (v < 6) ? 'orange' : (v < 8) ? 'cornflowerblue' : 'lawngreen';
      $(el).css('color', color);
    }

    $(SEL).each(function () {
      paint(this);
    });
  }

  /**
   * Скидає кольори рейтингів до стандартних
   */
  function clearVoteColors() {
    var SEL = '.card__vote, .full-start__rate, .full-start-new__rate, .info__rate, .card__imdb-rate, .card__kinopoisk-rate';
    $(SEL).css({
      color: '',
      border: ''
    });
  }

  /**
   * Встановлює MutationObserver для динамічного оновлення рейтингів
   */
  function setupVoteColorsObserver() {
    setTimeout(function () {
      if (getBool('interface_mod_new_colored_ratings', false)) updateVoteColors();
    }, 400);

    var obs = new MutationObserver(function () {
      if (getBool('interface_mod_new_colored_ratings', false)) setTimeout(updateVoteColors, 80);
    });
    obs.observe(document.body, {
      childList: true,
      subtree: true
    });

    Lampa.Listener.follow('full', function (e) {
      if (e.type === 'complite' && getBool('interface_mod_new_colored_ratings', false)) setTimeout(updateVoteColors, 100);
    });
  }

  /* ============================================================
   * БАЗА СТИЛІВ ДЛЯ СТАТУСІВ/PG
   * ============================================================ */

  /**
   * Вмикає/вимикає базові стилі для плашок СТАТУСУ
   */
  function setStatusBaseCssEnabled(enabled) {
    var idEn = 'interface_mod_status_enabled';
    var idDis = 'interface_mod_status_disabled';
    document.getElementById(idEn) && document.getElementById(idEn).remove();
    document.getElementById(idDis) && document.getElementById(idDis).remove();

    var st = document.createElement('style');
    if (enabled) {
      st.id = idEn;
      st.textContent =
        STATUS_BASE_SEL + '{' +
        'font-size:1.2em!important;' +
        'border:1px solid transparent!important;' +
        'border-radius:0.2em!important;' +
        'padding:0.3em!important;' +
        'margin-right:0.3em!important;' +
        'margin-left:0!important;' +
        'display:inline-block!important;' +
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
        'display:inline-block!important;' +
        '}';
    }
    document.head.appendChild(st);
  }

  /**
   * Вмикає/вимикає базові стилі для плашок ВІКОВОГО РЕЙТИНГУ (PG)
   */
  function setAgeBaseCssEnabled(enabled) {
    var idEn = 'interface_mod_age_enabled';
    var idDis = 'interface_mod_age_disabled';
    document.getElementById(idEn) && document.getElementById(idEn).remove();
    document.getElementById(idDis) && document.getElementById(idDis).remove();

    var st = document.createElement('style');
    if (enabled) {
      st.id = idEn;
      st.textContent =
        AGE_BASE_SEL + '{' +
        'font-size:1.2em!important;' +
        'border:1px solid transparent!important;' +
        'border-radius:0.2em!important;' +
        'padding:0.3em!important;' +
        'margin-right:0.3em!important;' +
        'margin-left:0!important;' +
        /* БЕЗ display тут (щоб можна було ховати пусті) */
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
        /* БЕЗ display тут! */
        '}';
    }
    document.head.appendChild(st);
  }

  /* ============================================================
   * КОЛЬОРОВІ СТАТУСИ
   * ============================================================ */
  var __statusObserver = null;
  var __statusFollowReady = false;

  /**
   * Застосовує кольори до плашок статусів
   */
  function applyStatusOnceIn(elRoot) {
    if (!getBool('interface_mod_new_colored_status', false)) return;

    var palette = {
      completed: {
        bg: 'rgba(46,204,113,.85)',
        text: 'white'
      },
      canceled: {
        bg: 'rgba(231,76,60,.9)',
        text: 'white'
      },
      ongoing: {
        bg: 'rgba(243,156,18,.95)',
        text: 'black'
      },
      production: {
        bg: 'rgba(52,152,219,.9)',
        text: 'white'
      },
      planned: {
        bg: 'rgba(155,89,182,.9)',
        text: 'white'
      },
      pilot: {
        bg: 'rgba(230,126,34,.95)',
        text: 'white'
      },
      released: {
        bg: 'rgba(26,188,156,.9)',
        text: 'white'
      },
      rumored: {
        bg: 'rgba(149,165,166,.9)',
        text: 'white'
      },
      post: {
        bg: 'rgba(0,188,212,.9)',
        text: 'white'
      },
      soon: {
        bg: 'rgba(142,68,173,.95)',
        text: 'white'
      }
    };

    var $root = $(elRoot || document);
    $root.find(STATUS_BASE_SEL).each(function () {
      var el = this;
      var t = ($(el).text() || '').trim();
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

      el.classList.remove('ifx-status-fallback');

      if (!key) {
        // Якщо статус не розпізнано, повертаємо білу рамку
        el.classList.add('ifx-status-fallback');
        el.style.setProperty('border-width', '1px', 'important');
        el.style.setProperty('border-style', 'solid', 'important');
        el.style.setProperty('border-color', '#fff', 'important');
        el.style.setProperty('background-color', 'transparent', 'important');
        el.style.setProperty('color', 'inherit', 'important');
        return;
      }
      var c = palette[key];
      $(el).css({
        'background-color': c.bg,
        color: c.text,
        'border-color': 'transparent',
        'display': 'inline-block'
      });
    });
  }

  function enableStatusColoring() {
    applyStatusOnceIn(document);

    if (__statusObserver) __statusObserver.disconnect();
    __statusObserver = new MutationObserver(function (muts) {
      if (!getBool('interface_mod_new_colored_status', false)) return;
      muts.forEach(function (m) {
        (m.addedNodes || []).forEach(function (n) {
          if (n.nodeType !== 1) return;
          applyStatusOnceIn(n);
        });
      });
    });
    __statusObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    if (!__statusFollowReady) {
      __statusFollowReady = true;
      Lampa.Listener.follow('full', function (e) {
        if (e.type === 'complite' && getBool('interface_mod_new_colored_status', false)) {
          setTimeout(function () {
            applyStatusOnceIn(e.object.activity.render());
          }, 120);
        }
      });
    }
  }

  function disableStatusColoring(clearInline) {
    if (__statusObserver) {
      __statusObserver.disconnect();
      __statusObserver = null;
    }
    if (clearInline) $(STATUS_BASE_SEL).each(function () {
      this.classList.remove('ifx-status-fallback');
      this.style.removeProperty('border-width');
      this.style.removeProperty('border-style');
      this.style.removeProperty('border-color');
      this.style.removeProperty('background-color');
      this.style.removeProperty('color');
    }).css({
      'background-color': '',
      color: '',
      border: ''
    });
  }

  /* ============================================================
   * КОЛЬОРОВІ ВІКОВІ РЕЙТИНГИ (PG)
   * ============================================================ */
  var __ageObserver = null;
  var __ageFollowReady = false;

  var __ageGroups = {
    kids: ['G', 'TV-Y', 'TV-G', '0+', '3+', '0', '3'],
    children: ['PG', 'TV-PG', 'TV-Y7', '6+', '7+', '6', '7'],
    teens: ['PG-13', 'TV-14', '12+', '13+', '14+', '12', '13', '14'],
    almostAdult: ['R', 'TV-MA', '16+', '17+', '16', '17'],
    adult: ['NC-17', '18+', '18', 'X']
  };
  var __ageColors = {
    kids: {
      bg: '#2ecc71',
      text: 'white'
    },
    children: {
      bg: '#3498db',
      text: 'white'
    },
    teens: {
      bg: '#f1c40f',
      text: 'black'
    },
    almostAdult: {
      bg: '#e67e22',
      text: 'white'
    },
    adult: {
      bg: '#e74c3c',
      text: 'white'
    }
  };

  /**
   * Визначає вікову категорію за текстом
   */
  
    function ageCategoryFor(text) {
    var t = (text || '').trim();

    // 1) Спочатку числовий формат N+
    var mm = t.match(/(^|\D)(\d{1,2})\s*\+(?=\D|$)/);
    if (mm) {
      var n = parseInt(mm[2], 10);
      if (n >= 18) return 'adult';
      if (n >= 17) return 'almostAdult';
      if (n >= 13) return 'teens';      // ← тут 14+ автоматично піде в teens (жовтий)
      if (n >= 6)  return 'children';
      return 'kids';
    }

    // 2) Маркери (дорослі → дитячі) з точними межами
    var ORDER = ['adult', 'almostAdult', 'teens', 'children', 'kids'];
    for (var oi = 0; oi < ORDER.length; oi++) {
      var k = ORDER[oi];
      if (__ageGroups[k] && __ageGroups[k].some(function (mark) {
        var mEsc = (mark || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\+/g, '\\+');
        var re = new RegExp('(^|\\D)' + mEsc + '(?=\\D|$)', 'i');
        return re.test(t);
      })) return k;
    }
    return '';
   }
  
  /*function ageCategoryFor(text) {
    for (var k in __ageGroups) {
      if (__ageGroups[k].some(function (mark) {
          return text.indexOf(mark) !== -1;
        })) return k;
    }
    var m = text.match(/(^|\D)(\d{1,2})\s*\+(?=\D|$)/);
    if (m) {
      var n = parseInt(m[2], 10);
      if (n <= 3) return 'kids';
      if (n <= 7) return 'children';
      if (n <= 14) return 'teens';
      if (n <= 17) return 'almostAdult';
      return 'adult';
    }
    return '';
  }*/

  /**
   * Застосовує кольори до вікових рейтингів (PG)
   */
  function applyAgeOnceIn(elRoot) {
    if (!getBool('interface_mod_new_colored_age', false)) return;

    var $root = $(elRoot || document);
    $root.find(AGE_BASE_SEL).each(function () {
      var el = this;

      // беремо текст або значення з атрибутів
      var t = (el.textContent || '').trim();
      if (!t) {
        var attr = ((el.getAttribute('data-age') || el.getAttribute('data-pg') || '') + '').trim();
        if (attr) t = attr;
      }

      // якщо ПУСТО — ховаємо елемент і зчищаємо все
      if (!t) {
        el.classList.add('hide');
        el.classList.remove('ifx-age-fallback');
        ['border-width', 'border-style', 'border-color', 'background-color', 'color', 'display'].forEach(function (p) {
          el.style.removeProperty(p);
        });
        return;
      }

      // є значення — показуємо та фарбуємо
      el.classList.remove('hide');
      el.classList.remove('ifx-age-fallback');
      ['border-width', 'border-style', 'border-color', 'background-color', 'color'].forEach(function (p) {
        el.style.removeProperty(p);
      });

      var g = ageCategoryFor(t);
      if (g) {
        var c = __ageColors[g];
        $(el).css({
          'background-color': c.bg,
          color: c.text,
          'border-color': 'transparent'
        });
        el.style.display = 'inline-block'; // без !important — .hide завжди переможе
      } else {
        // невідома категорія — «fallback», але тільки коли є текст
        el.classList.add('ifx-age-fallback');
        el.style.setProperty('border-width', '1px', 'important');
        el.style.setProperty('border-style', 'solid', 'important');
        el.style.setProperty('border-color', '#fff', 'important');
        el.style.setProperty('background-color', 'transparent', 'important');
        el.style.setProperty('color', 'inherit', 'important');
        el.style.display = 'inline-block';
      }
    });
  }

  function enableAgeColoring() {
    applyAgeOnceIn(document);

    if (__ageObserver) __ageObserver.disconnect();

    __ageObserver = new MutationObserver(function (muts) {
      if (!getBool('interface_mod_new_colored_age', false)) return;

      muts.forEach(function (m) {
        (m.addedNodes || []).forEach(function (n) {
          if (n.nodeType !== 1) return;
          if (n.matches && n.matches(AGE_BASE_SEL)) applyAgeOnceIn(n);
          $(n).find && $(n).find(AGE_BASE_SEL).each(function () {
            applyAgeOnceIn(this);
          });
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
      attributeFilter: ['class', 'data-age', 'data-pg', 'style']
    });

    if (!__ageFollowReady) {
      __ageFollowReady = true;
      Lampa.Listener.follow('full', function (e) {
        if (e.type === 'complite' && getBool('interface_mod_new_colored_age', false)) {
          var root = e.object.activity.render();
          setTimeout(function () {
            applyAgeOnceIn(root);
          }, 120);
          [100, 300, 800, 1600].forEach(function (ms) {
            setTimeout(function () {
              applyAgeOnceIn(root);
            }, ms);
          });
        }
      });
    }
  }

  function disableAgeColoring(clearInline) {
    if (__ageObserver) {
      __ageObserver.disconnect();
      __ageObserver = null;
    }
    if (clearInline) $(AGE_BASE_SEL).each(function () {
      this.classList.remove('ifx-age-fallback');
      this.style.removeProperty('border-width');
      this.style.removeProperty('border-style');
      this.style.removeProperty('border-color');
      this.style.removeProperty('background-color');
      this.style.removeProperty('color');
    }).css({
      'background-color': '',
      color: '',
      border: '1px solid #fff',
      'display': 'inline-block'
    });
  }

  /* ============================================================
   * ОРИГІНАЛЬНА НАЗВА (EN)
   * ============================================================ */

  /**
   * Додає оригінальну назву в заголовок картки
   */
  function setOriginalTitle(fullRoot, movie) {
    if (!fullRoot || !movie) return;
    var head = fullRoot.find('.full-start-new__head, .full-start__head').first();
    if (!head.length) return;

    head.find('.ifx-original-title').remove();
    if (!getOriginalTitleEnabled()) return;

    var original = movie.original_title || movie.original_name || movie.original || movie.name || movie.title || '';
    if (!original) return;

    $('<div class="ifx-original-title"></div>').text(original).appendTo(head);
  }

  /**
   * Оновлює показ оригінальної назви (для реактивності)
   */
  function applyOriginalTitleToggle() {
    if (!__ifx_last.fullRoot) return;
    var head = __ifx_last.fullRoot.find('.full-start-new__head, .full-start__head').first();
    if (!head.length) return;
    head.find('.ifx-original-title').remove();
    if (getOriginalTitleEnabled()) setOriginalTitle(__ifx_last.fullRoot, __ifx_last.movie || {});
  }

  /* ============================================================
   * КНОПКИ (Всі / Іконки без тексту)
   * ============================================================ */

  /**
   * Перевіряє, чи є кнопка кнопкою "Play" (щоб уникнути дублювання)
   */
  function isPlayBtn($b) {
    var cls = ($b.attr('class') || '').toLowerCase();
    var act = String($b.data('action') || '').toLowerCase();
    var txt = ($b.text() || '').trim().toLowerCase();
    if (/trailer/.test(cls) || /trailer/.test(act) || /трейлер|trailer/.test(txt)) return false;
    if (/(^|\s)(button--play|view--play|button--player|view--player)(\s|$)/.test(cls)) return true;
    if (/(^|\s)(play|player|resume|continue)(\s|$)/.test(act)) return true;
    if (/^(play|відтворити|продовжити|старт)$/i.test(txt)) return true;
    return false;
  }

  /**
   * Перезбирає кнопки в порядку Онлайн -> Торенти -> Трейлери
   */
  function reorderAndShowButtons(fullRoot) {
    if (!fullRoot) return;

    var $container = fullRoot.find('.full-start-new__buttons, .full-start__buttons').first();
    if (!$container.length) return;

    // Прибрати можливі дублі "play"
    fullRoot.find('.button--play, .button--player, .view--play, .view--player').remove();

    // Зібрати всі кнопки
    var $source = fullRoot.find(
      '.buttons--container .full-start__button, ' +
      '.full-start__buttons .full-start__button, ' +
      '.full-start-new__buttons .full-start__button'
    );

    var seen = new Set();
    function sig($b) {
      return ($b.attr('data-action') || '') + '|' + ($b.attr('href') || '') + '|' + ($b.attr('class') || '');
    }

    var groups = {
      online: [],
      torrent: [],
      trailer: [],
      other: []
    };

    $source.each(function () {
      var $b = $(this);
      if (isPlayBtn($b)) return; // Ігноруємо кнопки "Play"

      var s = sig($b);
      if (seen.has(s)) return; // Уникаємо дублікатів
      seen.add(s);

      var cls = ($b.attr('class') || '').toLowerCase();

      if (cls.includes('online')) {
        groups.online.push($b);
      } else if (cls.includes('torrent')) {
        groups.torrent.push($b);
      } else if (cls.includes('trailer')) {
        groups.trailer.push($b);
      } else {
        groups.other.push($b.clone(true));
      }
    });

    // Хак для перефокусування Lampa
    var needToggle = false;
    try {
      needToggle = (Lampa.Controller.enabled().name === 'full_start');
    } catch (e) {}
    if (needToggle) {
      try {
        Lampa.Controller.toggle('settings_component');
      } catch (e) {}
    }

    // Вставляємо кнопки у правильному порядку
    $container.empty();
    ['online', 'torrent', 'trailer', 'other'].forEach(function (cat) {
      groups[cat].forEach(function ($b) {
        $container.append($b);
      });
    });

    // Видаляємо "пусті" кнопки (без тексту та іконок)
    $container.find('.full-start__button').filter(function () {
      return $(this).text().trim() === '' && $(this).find('svg').length === 0;
    }).remove();

    $container.addClass('controller');

    applyIconOnlyClass(fullRoot);

    // Повертаємо фокус
    if (needToggle) {
      setTimeout(function () {
        try {
          Lampa.Controller.toggle('full_start');
        } catch (e) {}
      }, 80);
    }
  }

  /**
   * Відновлює оригінальний порядок кнопок (з кешу)
   */
  function restoreButtons() {
    if (!__ifx_btn_cache.container || !__ifx_btn_cache.nodes) return;

    var needToggle = false;
    try {
      needToggle = (Lampa.Controller.enabled().name === 'full_start');
    } catch (e) {}
    if (needToggle) {
      try {
        Lampa.Controller.toggle('settings_component');
      } catch (e) {}
    }

    var $c = __ifx_btn_cache.container;
    $c.empty().append(__ifx_btn_cache.nodes.clone(true, true));

    $c.addClass('controller');

    if (needToggle) {
      setTimeout(function () {
        try {
          Lampa.Controller.toggle('full_start');
        } catch (e) {}
      }, 80);
    }
    applyIconOnlyClass(__ifx_last.fullRoot || $(document));
  }

  /**
   * Примусово перебудовує кнопки (для реактивності)
   */
  function rebuildButtonsNow() {
    if (!__ifx_last.fullRoot) return;
    if (settings.all_buttons) {
      reorderAndShowButtons(__ifx_last.fullRoot);
    } else {
      restoreButtons();
    }
    applyIconOnlyClass(__ifx_last.fullRoot);

    // якщо ввімкнено — оновлюємо кольорові кнопки після перестановки
    if (settings.colored_buttons) applyColoredButtonsIn(__ifx_last.fullRoot);
  }

  /**
   * Додає/видаляє клас для режиму "тільки іконки"
   */
  function applyIconOnlyClass(fullRoot) {
    var $c = fullRoot.find('.full-start-new__buttons, .full-start__buttons').first();
    if (!$c.length) return;

    if (settings.icon_only) {
      $c.addClass('ifx-btn-icon-only')
        .find('.full-start__button').css('min-width', 'auto');
    } else {
      $c.removeClass('ifx-btn-icon-only')
        .find('.full-start__button').css('min-width', '');
    }
  }

  /* ============================================================
   * КОЛЬОРОВІ КНОПКИ 
   * ============================================================ */
  var __ifx_colbtn = {
    styleId: 'interface_mod_colored_buttons'
  };

  /**
   * Додає CSS для кольорових кнопок
   */
  function injectColoredButtonsCss() {
    if (document.getElementById(__ifx_colbtn.styleId)) return;
    var css = `
      .head__action.selector.open--feed svg path { fill: #2196F3 !important; }

      .full-start__button { transition: transform 0.2s ease !important; position: relative; }
      .full-start__button:active { transform: scale(0.98) !important; }

      .full-start__button.view--online  svg path { fill: #2196f3 !important; }
      .full-start__button.view--torrent svg path { fill: lime !important; }
      .full-start__button.view--trailer svg path { fill: #f44336 !important; }

      .full-start__button.loading::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 2px;
        background: rgba(255,255,255,0.5);
        animation: ifx_loading 1s linear infinite;
      }
      @keyframes ifx_loading {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
    `;
    var st = document.createElement('style');
    st.id = __ifx_colbtn.styleId;
    st.textContent = css;
    document.head.appendChild(st);
  }

  function removeColoredButtonsCss() {
    var el = document.getElementById(__ifx_colbtn.styleId);
    if (el) el.remove();
  }

  // SVG іконки
  var SVG_MAP = {
    torrent: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="50px" height="50px"><path d="M25,2C12.317,2,2,12.317,2,25s10.317,23,23,23s23-10.317,23-23S37.683,2,25,2zM40.5,30.963c-3.1,0-4.9-2.4-4.9-2.4S34.1,35,27,35c-1.4,0-3.6-0.837-3.6-0.837l4.17,9.643C26.727,43.92,25.874,44,25,44c-2.157,0-4.222-0.377-6.155-1.039L9.237,16.851c0,0-0.7-1.2,0.4-1.5c1.1-0.3,5.4-1.2,5.4-1.2s1.475-0.494,1.8,0.5c0.5,1.3,4.063,11.112,4.063,11.112S22.6,29,27.4,29c4.7,0,5.9-3.437,5.7-3.937c-1.2-3-4.993-11.862-4.993-11.862s-0.6-1.1,0.8-1.4c1.4-0.3,3.8-0.7,3.8-0.7s1.105-0.163,1.6,0.8c0.738,1.437,5.193,11.262,5.193,11.262s1.1,2.9,3.3,2.9c0.464,0,0.834-0.046,1.152-0.104c-0.082,1.635-0.348,3.221-0.817,4.722C42.541,30.867,41.756,30.963,40.5,30.963z"/></svg>',
    online: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M20.331 14.644l-13.794-13.831 17.55 10.075zM2.938 0c-0.813 0.425-1.356 1.2-1.356 2.206v27.581c0 1.006 0.544 1.781 1.356 2.206l16.038-16zM29.512 14.1l-3.681-2.131-4.106 4.031 4.106 4.031 3.756-2.131c1.125-0.893 1.125-2.906-0.075-3.8zM6.538 31.188l17.55-10.075-3.756-3.756z"/></svg>',
    trailer: '<svg height="70" viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M71.2555 2.08955C74.6975 3.2397 77.4083 6.62804 78.3283 10.9306C80 18.7291 80 35 80 35C80 35 80 51.2709 78.3283 59.0694C77.4083 63.372 74.6975 66.7603 71.2555 67.9104C65.0167 70 40 70 40 70C40 70 14.9833 70 8.74453 67.9104C5.3025 66.7603 2.59172 63.372 1.67172 59.0694C0 51.2709 0 35 0 35C0 35 0 18.7291 1.67172 10.9306C2.59172 6.62804 5.3025 3.2395 8.74453 2.08955C14.9833 0 40 0 40 0C40 0 65.0167 0 71.2555 2.08955ZM55.5909 35.0004L29.9773 49.5714V20.4286L55.5909 35.0004Z"/></svg>'
  };

  /**
   * Замінює іконки на кастомні
   */
  function replaceIconsIn($root) {
    $root = $root && $root.length ? $root : $(document);
    ['torrent', 'online', 'trailer'].forEach(function (kind) {
      $root.find('.full-start__button.view--' + kind + ' svg').each(function () {
        var $svg = $(this);
        var $btn = $svg.closest('.full-start__button');
        if (!$btn.data('ifxOrigSvg')) $btn.data('ifxOrigSvg', $svg.prop('outerHTML'));
        $svg.replaceWith(SVG_MAP[kind]);
      });
    });
  }

  /**
   * Відновлює оригінальні іконки
   */
  function restoreIconsIn($root) {
    $root = $root && $root.length ? $root : $(document);
    $root.find('.full-start__button').each(function () {
      var $btn = $(this);
      var orig = $btn.data('ifxOrigSvg');
      if (orig) {
        var $current = $btn.find('svg').first();
        if ($current.length) $current.replaceWith(orig);
        $btn.removeData('ifxOrigSvg');
      }
    });
  }

  function applyColoredButtonsIn(root) {
    injectColoredButtonsCss();
    replaceIconsIn(root);
  }

  function setColoredButtonsEnabled(enabled) {
    if (enabled) {
      injectColoredButtonsCss();
      if (__ifx_last.fullRoot) replaceIconsIn(__ifx_last.fullRoot);
    } else {
      removeColoredButtonsCss();
      restoreIconsIn(__ifx_last.fullRoot || $(document));
    }
  }

  /* ============================================================
   * СЛУХАЧ КАРТКИ
   * ============================================================ */

  /**
   * Встановлює слухача Lampa.Listener 'full' для кнопок та оригінальної назви
   */
  function wireFullCardEnhancers() {
    Lampa.Listener.follow('full', function (e) {
      if (e.type !== 'complite') return;
      
      setTimeout(function () {
        var root = $(e.object.activity.render());

        // кешуємо поточний контейнер і його дітей (для відновлення)
        var $container = root.find('.full-start-new__buttons, .full-start__buttons').first();
        if ($container.length) {
          __ifx_btn_cache.container = $container;
          __ifx_btn_cache.nodes = $container.children().clone(true, true);
        }

        __ifx_last.fullRoot = root;
        __ifx_last.movie = e.data.movie || __ifx_last.movie || {};

        // 1. Оригінальна назва
        setOriginalTitle(root, __ifx_last.movie);

        // 2. Всі кнопки
        if (settings.all_buttons) reorderAndShowButtons(root);

        // 3. Режим «іконки без тексту»
        applyIconOnlyClass(root);

        // 4. Кольорові кнопки
        if (settings.colored_buttons) applyColoredButtonsIn(root);
      }, 120);
    });
  }

  // Слухач для оновлення стилів торентів при відкритті картки
  Lampa.Listener.follow('full', function (e) {
    if (e.type === 'complite') {
      setTimeout(function () {
        try {
          if (window.runTorrentStyleRefresh) window.runTorrentStyleRefresh();
        } catch (e) {}
      }, 120);
    }
  });

  // Спостерігач для динамічного оновлення блоків торентів
  (function observeTorrents() {
    var obs = new MutationObserver(function (muts) {
      if (typeof window.runTorrentStyleRefresh === 'function') {
        // антидребезг (debounce)
        clearTimeout(window.__ifx_tor_debounce);
        window.__ifx_tor_debounce = setTimeout(function () {
          try {
            window.runTorrentStyleRefresh();
          } catch (e) {}
        }, 60);
      }
    });
    try {
      obs.observe(document.body, {
        subtree: true,
        childList: true
      });
    } catch (e) {}
  })();


  /* ============================================================
   * ЗАПУСК
   * ============================================================ */
  function startPlugin() {
    injectFallbackCss();
    initInterfaceModSettingsUI();
    newInfoPanel();
    setupVoteColorsObserver();

    if (settings.colored_ratings) updateVoteColors();

    setStatusBaseCssEnabled(settings.colored_status);
    if (settings.colored_status) enableStatusColoring();
    else disableStatusColoring(true);

    setAgeBaseCssEnabled(settings.colored_age);
    if (settings.colored_age) enableAgeColoring();
    else disableAgeColoring(true);

    if (settings.theme) applyTheme(settings.theme);

    wireFullCardEnhancers();

    setColoredButtonsEnabled(settings.colored_buttons);
    
    // Перший запуск стилів торентів
    try {
      if (window.runTorrentStyleRefresh) window.runTorrentStyleRefresh();
    } catch (e) {}
  }

  // Запуск плагіну при готовності Lampa
  if (window.appready) {
    startPlugin();
  } else {
    Lampa.Listener.follow('app', function (e) {
      if (e.type === 'ready') startPlugin();
    });
  }

  /* BEGIN torrents+mod (Verbatim) */
  (function () {
    try {
      (function () {
        // ===================== КОНФІГУРАЦІЯ ПРАПОРЦЯ =====================
        const UKRAINE_FLAG_SVG = '<svg viewBox="0 0 20 15"><rect width="20" height="7.5" y="0" fill="#0057B7"/><rect width="20" height="7.5" y="7.5" fill="#FFD700"/></svg>';

        // ===================== СИСТЕМА ТЕКСТОВИХ ЗАМІН =====================
        const REPLACEMENTS = [
          ['Uaflix', 'UAFlix'],
          ['Zetvideo', 'UaFlix'],
          ['Нет истории просмотра', 'Історія перегляду відсутня'],
          ['Дублированный', 'Дубльований'],
          ['Дубляж', 'Дубльований'],
          ['Многоголосый', 'багатоголосий'],
          ['многоголосый', 'багатоголосий'],
          ['двухголосый', 'двоголосий'],
          ['Украинский', UKRAINE_FLAG_SVG + ' Українською'],
          ['Український', UKRAINE_FLAG_SVG + ' Українською'],
          ['Украинская', UKRAINE_FLAG_SVG + ' Українською'],
          ['Українська', UKRAINE_FLAG_SVG + ' Українською'],
          ['1+1', UKRAINE_FLAG_SVG + ' 1+1'],
          {
            pattern: /\bUkr\b/gi,
            replacement: UKRAINE_FLAG_SVG + ' Українською',
            condition: (text) => !text.includes('flag-container')
          },
          {
            pattern: /\bUa\b/gi,
            replacement: UKRAINE_FLAG_SVG + ' UA',
            condition: (text) => !text.includes('flag-container')
          }
        ];

        // ===================== СИСТЕМА СТИЛІВ ДЛЯ ПРАПОРЦЯ =====================
        const FLAG_STYLES = `
          .flag-container {
              display: inline-flex;
              align-items: center;
              vertical-align: middle;
              height: 1.27em;
              margin-left: 3px;
          }
          .flag-svg {
              display: inline-block;
              vertical-align: middle;
              margin-right: 2px;
              margin-top: -5.5px;
              border-radius: 5px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              border: 1px solid rgba(0,0,0,0.15);
              width: 22.56px;
              height: 17.14px;
          }
          @media (max-width: 767px) {
              .flag-svg {
                  width: 16.03px;
                  height: 12.19px;
                  margin-right: 1px;
                  margin-top: -4px;
              }
          }
          .flag-container ~ span,
          .flag-container + * {
              vertical-align: middle;
          }
          .ua-flag-processed {
              position: relative;
          }
          .filter-item .flag-svg,
          .selector-item .flag-svg,
          .dropdown-item .flag-svg,
          .voice-option .flag-svg,
          .audio-option .flag-svg {
              margin-right: 1px;
              margin-top: -2px;
              width: 18.05px;
              height: 13.54px;
          }
          @media (max-width: 767px) {
              .filter-item .flag-svg,
              .selector-item .flag-svg,
              .dropdown-item .flag-svg,
              .voice-option .flag-svg,
              .audio-option .flag-svg {
                  width: 11.97px;
                  height: 8.98px;
                  margin-right: 0px;
                  margin-top: -1px;
              }
          }
          .online-prestige__description,
          .video-description,
          [class*="description"],
          [class*="info"] {
              line-height: 1.5;
          }
      `;

        // ===================== СИСТЕМА КОЛЬОРОВИХ ІНДИКАТОРІВ =====================
        const STYLES = {
          '.torrent-item__seeds span.low-seeds': {
            color: '#e74c3c',
            'font-weight': 'bold'
          },
          '.torrent-item__seeds span.medium-seeds': {
            color: '#ffff00',
            'font-weight': 'bold'
          },
          '.torrent-item__seeds span.high-seeds': {
            color: '#2ecc71',
            'font-weight': 'bold'
          },
          '.torrent-item.low-seeds': {
            'border': '2px solid rgba(231, 76, 60, 0.6)',
            'border-radius': '6px',
            'box-sizing': 'border-box'
          },
          '.torrent-item.medium-seeds': {
            'border': '2px solid rgba(255, 255, 0, 0.6)',
            'border-radius': '6px',
            'box-sizing': 'border-box'
          },
          '.torrent-item.high-seeds': {
            'border': '2px solid rgba(46, 204, 113, 0.6)',
            'border-radius': '6px',
            'box-sizing': 'border-box'
          },
          '.torrent-item__bitrate span.low-bitrate': {
            color: '#ffff00',
            'font-weight': 'bold'
          },
          '.torrent-item__bitrate span.medium-bitrate': {
            color: '#2ecc71',
            'font-weight': 'bold'
          },
          '.torrent-item__bitrate span.high-bitrate': {
            color: '#e74c3c',
            'font-weight': 'bold'
          },
          '.torrent-item__tracker.utopia': {
            color: '#9b59b6',
            'font-weight': 'bold'
          },
          '.torrent-item__tracker.toloka': {
            color: '#3498db',
            'font-weight': 'bold'
          },
          '.torrent-item__tracker.mazepa': {
            color: '#C9A0DC',
            'font-weight': 'bold'
          }
        };

        // ===================== ІНІЦІАЛІЗАЦІЯ СТИЛІВ =====================
        let style = document.createElement('style');
        style.innerHTML = FLAG_STYLES + '\n' + Object.entries(STYLES).map(([selector, props]) => {
          return `${selector} { ${Object.entries(props).map(([prop, val]) => `${prop}: ${val} !important`).join('; ')} }`;
        }).join('\n');
        document.head.appendChild(style);

        // ===================== СИСТЕМА ЗАМІНИ ТЕКСТУ ДЛЯ ФІЛЬТРІВ =====================
        const UKRAINIAN_STUDIOS = [
          'DniproFilm', 'Дніпрофільм', 'Цікава Ідея', 'Колодій Трейлерів',
          'UaFlix', 'BaibaKo', 'В одне рило', 'Так Треба Продакшн',
          'TreleMore', 'Гуртом', 'Exit Studio', 'FilmUA', 'Novator Film',
          'LeDoyen', 'Postmodern', 'Pryanik', 'CinemaVoice', 'UkrainianVoice'
        ];

        function processVoiceFilters() {
          const voiceFilterSelectors = [
            '[data-type="voice"]', '[data-type="audio"]',
            '.voice-options', '.audio-options',
            '.voice-list', '.audio-list',
            '.studio-list', '.translation-filter', '.dubbing-filter'
          ];

          voiceFilterSelectors.forEach(selector => {
            try {
              const filters = document.querySelectorAll(selector);
              filters.forEach(filter => {
                if (filter.classList.contains('ua-voice-processed')) return;

                let html = filter.innerHTML;
                let changed = false;

                UKRAINIAN_STUDIOS.forEach(studio => {
                  if (html.includes(studio) && !html.includes(UKRAINE_FLAG_SVG)) {
                    html = html.replace(new RegExp(studio, 'g'), UKRAINE_FLAG_SVG + ' ' + studio);
                    changed = true;
                  }
                });

                if (html.includes('Українська') && !html.includes(UKRAINE_FLAG_SVG)) {
                  html = html.replace(/Українська/g, UKRAINE_FLAG_SVG + ' Українська');
                  changed = true;
                }
                if (html.includes('Украинская') && !html.includes(UKRAINE_FLAG_SVG)) {
                  html = html.replace(/Украинская/g, UKRAINE_FLAG_SVG + ' Українська');
                  changed = true;
                }
                if (html.includes('Ukr') && !html.includes(UKRAINE_FLAG_SVG)) {
                  html = html.replace(/Ukr/gi, UKRAINE_FLAG_SVG + ' Українською');
                  changed = true;
                }

                if (changed) {
                  filter.innerHTML = html;
                  filter.classList.add('ua-voice-processed');

                  filter.querySelectorAll('svg').forEach(svg => {
                    if (!svg.closest('.flag-container')) {
                      svg.classList.add('flag-svg');
                      const wrapper = document.createElement('span');
                      wrapper.className = 'flag-container';
                      svg.parentNode.insertBefore(wrapper, svg);
                      wrapper.appendChild(svg);
                    }
                  });
                }
              });
            } catch (error) {
              console.warn('Помилка обробки фільтрів озвучення:', error);
            }
          });
        }

        // ===================== ОПТИМІЗОВАНА СИСТЕМА ЗАМІНИ ТЕКСТУ =====================
        function replaceTexts() {
          const safeContainers = [
            '.online-prestige-watched__body',
            '.online-prestige--full .online-prestige__title',
            '.online-prestige--full .online-prestige__info',
            '.online-prestige__description',
            '.video-description',
            '.content__description',
            '.movie-info',
            '.series-info'
          ];

          const processSafeElements = () => {
            safeContainers.forEach(selector => {
              try {
                const elements = document.querySelectorAll(selector + ':not(.ua-flag-processed)');
                elements.forEach(element => {
                  if (element.closest('.hidden, [style*="display: none"]')) return;

                  let html = element.innerHTML;
                  let changed = false;

                  REPLACEMENTS.forEach(item => {
                    if (Array.isArray(item)) {
                      if (html.includes(item[0]) && !html.includes(UKRAINE_FLAG_SVG)) {
                        html = html.replace(new RegExp(item[0], 'g'), item[1]);
                        changed = true;
                      }
                    } else if (item.pattern) {
                      if ((!item.condition || item.condition(html)) && item.pattern.test(html) && !html.includes(UKRAINE_FLAG_SVG)) {
                        html = html.replace(item.pattern, item.replacement);
                        changed = true;
                      }
                    }
                  });

                  if (changed) {
                    element.innerHTML = html;
                    element.classList.add('ua-flag-processed');

                    element.querySelectorAll('svg').forEach(svg => {
                      if (!svg.closest('.flag-container')) {
                        svg.classList.add('flag-svg');
                        const wrapper = document.createElement('span');
                        wrapper.className = 'flag-container';
                        svg.parentNode.insertBefore(wrapper, svg);
                        wrapper.appendChild(svg);

                        if (svg.nextSibling && svg.nextSibling.nodeType === 3) {
                          wrapper.appendChild(svg.nextSibling);
                        }
                      }
                    });
                  }
                });
              } catch (error) {
                console.warn('Помилка обробки селектора:', selector, error);
              }
            });
          };

          const startTime = Date.now();
          const TIME_LIMIT = 50;

          processSafeElements();

          if (Date.now() - startTime < TIME_LIMIT) {
            processVoiceFilters();
          }
        }

        // ===================== СИСТЕМА ОНОВЛЕННЯ СТИЛІВ ТОРЕНТІВ =====================
        function updateTorrentStyles() {
          const visibleElements = {
            seeds: document.querySelectorAll('.torrent-item__seeds span:not([style*="display: none"])'),
            bitrate: document.querySelectorAll('.torrent-item__bitrate span:not([style*="display: none"])'),
            tracker: document.querySelectorAll('.torrent-item__tracker:not([style*="display: none"])')
          };

          if (visibleElements.seeds.length > 0) {
            visibleElements.seeds.forEach(span => {
              const seeds = parseInt(span.textContent) || 0;
              const torrentItem = span.closest('.torrent-item');

              span.classList.remove('low-seeds', 'medium-seeds', 'high-seeds');
              if (torrentItem) {
                torrentItem.classList.remove('low-seeds', 'medium-seeds', 'high-seeds');
              }

              if (seeds <= 4) {
                span.classList.add('low-seeds');
                if (torrentItem) torrentItem.classList.add('low-seeds');
              } else if (seeds <= 14) {
                span.classList.add('medium-seeds');
                if (torrentItem) torrentItem.classList.add('medium-seeds');
              } else {
                span.classList.add('high-seeds');
                if (torrentItem) torrentItem.classList.add('high-seeds');
              }
            });
          }

          if (visibleElements.bitrate.length > 0) {
            visibleElements.bitrate.forEach(span => {
              const bitrate = parseFloat(span.textContent) || 0;
              span.classList.remove('low-bitrate', 'medium-bitrate', 'high-bitrate');

              if (bitrate <= 10) {
                span.classList.add('low-bitrate');
              } else if (bitrate <= 40) {
                span.classList.add('medium-bitrate');
              } else {
                span.classList.add('high-bitrate');
              }
            });
          }

          if (visibleElements.tracker.length > 0) {
            visibleElements.tracker.forEach(tracker => {
              const text = tracker.textContent.trim().toLowerCase();
              tracker.classList.remove('utopia', 'toloka', 'mazepa');

              if (text.includes('utopia')) tracker.classList.add('utopia');
              else if (text.includes('toloka')) tracker.classList.add('toloka');
              else if (text.includes('mazepa')) tracker.classList.add('mazepa');
            });
          }
        }

        // ===================== ОСНОВНА ФУНКЦІЯ ОНОВЛЕННЯ =====================
        function updateAll() {
          try {
            replaceTexts();
            updateTorrentStyles();
          } catch (error) {
            console.warn('Помилка оновлення:', error);
          }
        }

        // ===================== ОПТИМІЗОВАНА СИСТЕМА СПОСТЕРЕЖЕННЯ =====================
        let updateTimeout = null;
        const observer = new MutationObserver(mutations => {
          const hasImportantChanges = mutations.some(mutation => {
            return mutation.addedNodes.length > 0 &&
              !mutation.target.closest('.hidden, [style*="display: none"]');
          });

          if (hasImportantChanges) {
            clearTimeout(updateTimeout);
            updateTimeout = setTimeout(updateAll, 150);
          }
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: false,
          characterData: false
        });

        setTimeout(updateAll, 1000);
      })();

      /* Lampa.Platform.tv(); */ // Цей виклик тут не потрібен, якщо це плагін
    } catch (e) {
      try {
        console.error('torrents+mod error', e);
      } catch (_e) {}
    }
  })();
  /* END torrents+mod ==== */

  /* Torrent toggles overrides */
  // Цей блок динамічно вмикає/вимикає стилі з torrents+mod
  // на основі налаштувань з "Інтерфейс +"
  (function () {
    // Власна реалізація getBool, щоб бути незалежним
    function getBool(key, def) {
      var v = Lampa.Storage.get(key);
      if (v === true || v === false) return v;
      if (v === 'true') return true;
      if (v === 'false') return false;
      if (v == null) return def;
      return !!v;
    }

    function apply() {
      var s = document.getElementById('torr_mod_overrides');
      if (!s) {
        s = document.createElement('style');
        s.id = 'torr_mod_overrides';
        document.head.appendChild(s);
      }
      
      // Отримуємо налаштування з "Інтерфейс +"
      var ef = getBool('interface_mod_new_tor_frame', true),
          eb = getBool('interface_mod_new_tor_bitrate', true),
          es = getBool('interface_mod_new_tor_seeds', true);
          
      var css = '';
      
      // Якщо налаштування вимкнені, додаємо CSS, який "скидає" стилі
      if (!eb) css += '.torrent-item__bitrate span.low-bitrate, .torrent-item__bitrate span.medium-bitrate, .torrent-item__bitrate span.high-bitrate{ color: inherit !important; font-weight: inherit !important; }\n';
      if (!es) css += '.torrent-item__seeds span.low-seeds, .torrent-item__seeds span.medium-seeds, .torrent-item__seeds span.high-seeds{ color: inherit !important; font-weight: inherit !important; }\n';
      if (!ef) css += '.torrent-item.low-seeds, .torrent-item.medium-seeds, .torrent-item.high-seeds{ border: none !important; }\n';
      
      s.textContent = css;
    }
    
    // Робимо функцію глобальною, щоб її міг викликати основний плагін
    window.runTorrentStyleRefresh = apply;
    setTimeout(apply, 0); // Перший запуск
  })();

/* ============================================================
 *  YEAR PILL + ALT EPISODE CARDS (drop-in block for testmodded.js)
 * ============================================================ */
(function(){
  // ---- i18n ----
  Lampa.Lang.add({
    ifx_year_on_cards:         { uk:'Рік на картках (списки + епізоди)', en:'Year on cards (lists + episodes)' },
    ifx_year_on_cards_desc:    { uk:'Правий низ: рік у чорній капсулі; рейтинг піднімається над роком з мінімальним зазором', en:'Bottom-right pill; rating stacked above year' },

    ifx_episode_alt_cards:     { uk:'Альтернативні картки епізодів', en:'Alternative episode cards' },
    ifx_episode_alt_cards_desc:{ uk:'Вигляд як у loader.js (full-episode), незалежно від вибраної теми', en:'Same look as in loader.js (full-episode), independent of theme' },

    ifx_episode_num_only:      { uk:'Показувати лише номер серії', en:'Show episode number only' },
    ifx_episode_num_only_desc: { uk:'Якщо в епізоду є назва — ховати її і показувати лише «Серія N»', en:'Hide title if present and show only "Episode N"' }
  });

  // ---- settings (default = false) ----
  var KEY_YEAR   = 'interface_mod_new_year_on_cards';
  var KEY_ALT    = 'interface_mod_new_episode_alt_cards';
  var KEY_NUM    = 'interface_mod_new_episode_numbers_only';

  var _settings_extra = {
    year_on_cards:  Lampa.Storage.get(KEY_YEAR, false) === true || Lampa.Storage.get(KEY_YEAR, 'false') === 'true',
    ep_alt_cards:   Lampa.Storage.get(KEY_ALT,  false) === true || Lampa.Storage.get(KEY_ALT,  'false') === 'true',
    ep_num_only:    Lampa.Storage.get(KEY_NUM,  false) === true || Lampa.Storage.get(KEY_NUM,  'false') === 'true'
  };

  // ---- UI items (into existing "Interface +" group) ----
  (function addSettings(){
    var add = Lampa.SettingsApi.addParam;

    add({
      component:'interface_mod_new',
      param:{ name: KEY_YEAR, type:'trigger', values:true, default: false },
      field:{ name:Lampa.Lang.translate('ifx_year_on_cards'),
              description:Lampa.Lang.translate('ifx_year_on_cards_desc') }
    });

    add({
      component:'interface_mod_new',
      param:{ name: KEY_ALT, type:'trigger', values:true, default: false },
      field:{ name:Lampa.Lang.translate('ifx_episode_alt_cards'),
              description:Lampa.Lang.translate('ifx_episode_alt_cards_desc') }
    });

    add({
      component:'interface_mod_new',
      param:{ name: KEY_NUM, type:'trigger', values:true, default: false },
      field:{ name:Lampa.Lang.translate('ifx_episode_num_only'),
              description:Lampa.Lang.translate('ifx_episode_num_only_desc') }
    });
  })();

  // ---- CSS (rating pill style = як .card_vote/.card__vote) ----
  function ensureYearCss(){
    if (document.getElementById('ifx_year_vote_css')) return;
    var st = document.createElement('style');
    st.id = 'ifx_year_vote_css';
    st.textContent = `
      /* контейнер-мітка для режиму "рік на картках" */
      body.ifx-year-on .ifx-year-pill,
      body.ifx-year-on .ifx-vote-pill{
        background: rgba(0,0,0,0.5);
        color:#fff; font-size:1.3em; font-weight:700;
        padding: .2em .5em; border-radius:1em; line-height:1;
        z-index:1;
      }
      /* стек в правому нижньому куті з мінімальним зазором */
      body.ifx-year-on .ifx-corner-stack{
        position:absolute; right:.3em; bottom:.3em;
        display:flex; flex-direction:column-reverse; gap:2px; align-items:flex-end;
        pointer-events:none;
      }
      body.ifx-year-on .ifx-corner-stack > *{ pointer-events:auto; }

      /* робимо місце кріплення */
      body.ifx-year-on .card__view{ position:relative; }
      body.ifx-year-on .card-episode .full-episode{ position:relative; }
      
      /* переносимо поточний .card__vote в низ, коли він НЕ в нашому стеку */
      body.ifx-year-on .card__view > .card__vote{
        top:auto !important; bottom: calc(0.3em + 1.9em + 2px) !important; right:.3em !important;
        background: rgba(0,0,0,0.5); color:#fff; font-size:1.3em; font-weight:700;
        padding:.2em .5em; border-radius:1em;
      }

      /* alt episode cards: показати/сховати назву/номер за тумблером */
      body.ifx-ep-num-only .card-episode .full-episode__name{ display:none !important; }
      body.ifx-ep-num-only .card-episode .full-episode__num{ display:block !important; }
      /* якщо alt не ввімкнено, але хочемо рік на епізодах — додаємо капсулу на превʼю у футері */
      body.ifx-year-on .card-episode__footer .card__view{ position:relative; }
    `;
    document.head.appendChild(st);
  }

  // ---- шаблони (беремо з loader.js) ----
  var __ifx_tpl_card_episode_orig = null;
  var __ifx_tpl_card_episode_alt =
    "<div class=\"card-episode selector layer--visible layer--render\">\
      <div class=\"card-episode__body\">\
        <div class=\"full-episode\">\
          <div class=\"full-episode__img\">\
            <img />\
          </div>\
          <div class=\"full-episode__body\">\
            <div class=\"card__title\">{title}</div>\
            <div class=\"card__age\">{release_year}</div>\
            <div class=\"full-episode__num hide\">{num}</div>\
            <div class=\"full-episode__name\">{name}</div>\
            <div class=\"full-episode__date\">{date}</div>\
          </div>\
        </div>\
      </div>\
      <div class=\"card-episode__footer hide\">\
        <div class=\"card__imgbox\">\
          <div class=\"card__view\">\
            <img class=\"card__img\" />\
          </div>\
        </div>\
        <div class=\"card__left\">\
          <div class=\"card__title\">{title}</div>\
          <div class=\"card__age\">{release_year}</div>\
        </div>\
      </div>\
    </div>";

  function setEpisodeAltCardsEnabled(on){
    // запамʼятовуємо та підміняємо шаблон
    if (__ifx_tpl_card_episode_orig === null){
      try { __ifx_tpl_card_episode_orig = Lampa.Template.get('card_episode', {}, true); } catch(e){ __ifx_tpl_card_episode_orig = null; }
    }
    if (on){
      Lampa.Template.add('card_episode', __ifx_tpl_card_episode_alt);
      document.body.classList.toggle('ifx-ep-num-only', _settings_extra.ep_num_only);
    } else if (__ifx_tpl_card_episode_orig){
      Lampa.Template.add('card_episode', __ifx_tpl_card_episode_orig);
      document.body.classList.remove('ifx-ep-num-only');
    }
    // перерендер — достатньо оновити Settings, далі нові списки вже підхоплять шаблон
    try{ Lampa.Settings.update(); }catch(e){}
  }

  // ---- рік на картках: DOM-інʼєкція ----
  function extractYear($card){
    // 1) є готовий .card__age – беремо з нього цифри
    var t = ($card.find('.card__age').first().text() || '').trim();
    var y = (t.match(/\d{4}/) || [])[0];
    if (y) return y;
    // 2) data-атрибути
    y = $card.data('release_year') || $card.data('year');
    if (y && /^\d{4}$/.test(String(y))) return String(y);
    return '';
  }

  function injectYearPill($scope){
    $scope = $scope || $(document.body);

    // звичайні картки у списках
    $scope.find('.card').each(function(){
      var $card = $(this);
      if ($card.closest('.full-start, .full-start-new').length) return; // не у повній картці
      var $view = $card.find('.card__view').first();
      if (!$view.length) return;

      // створюємо стек кутових капсул (рейтинг + рік)
      var $stack = $view.children('.ifx-corner-stack');
      if (!$stack.length) $stack = $('<div class="ifx-corner-stack"></div>').appendTo($view);

      // рік
      if (!$stack.children('.ifx-year-pill').length){
        var y = extractYear($card);
        if (y) $('<div class="ifx-year-pill"></div>').text(y).appendTo($stack);
      }

      // якщо існує .card__vote у цій картці і він НЕ в стеку — нічого не робимо (CSS сам піджене вниз)
      // якщо хочеш прям фізично перенести в стек:
      var $vote = $view.children('.card__vote');
      if ($vote.length && !$vote.parent().is($stack)){
        // залишаємо як є — CSS already moves it to bottom-right when .ifx-year-on is set
      }
    });

    // «Найближчі епізоди» (коли alt вимкнено — капсула на превʼюшці у футері)
    $scope.find('.card-episode').each(function(){
      var $ep = $(this);
      var $view = $ep.find('.card-episode__footer .card__view').first();
      if (!$view.length) return;
      var $stack = $view.children('.ifx-corner-stack');
      if (!$stack.length) $stack = $('<div class="ifx-corner-stack"></div>').appendTo($view);
      if (!$stack.children('.ifx-year-pill').length){
        var y = extractYear($ep);
        if (y) $('<div class="ifx-year-pill"></div>').text(y).appendTo($stack);
      }
    });
  }

  function removeAllYearPills(){
    $('.ifx-corner-stack, .ifx-year-pill').remove();
  }

  function setYearOnCardsEnabled(on){
    ensureYearCss();
    document.body.classList.toggle('ifx-year-on', !!on);
    if (on) injectYearPill($(document.body));
    else removeAllYearPills();
  }

  // ---- «показувати лише номер серії» ----
  function setEpisodeNumbersOnlyEnabled(on){
    document.body.classList.toggle('ifx-ep-num-only', !!on);
  }

  // ---- live observers ----
  var mo = null;
  function enableObserver(){
    if (mo) return;
    mo = new MutationObserver(function(muts){
      if (!_settings_extra.year_on_cards) return;
      var need = false;
      for (var i=0;i<muts.length;i++){
        var m = muts[i];
        if (m.addedNodes && m.addedNodes.length){
          need = true; break;
        }
      }
      if (need) setTimeout(function(){ injectYearPill($(document.body)); }, 50);
    });
    try { mo.observe(document.body, {subtree:true, childList:true}); } catch(e){}
  }
  function disableObserver(){
    if (mo){ try{ mo.disconnect(); }catch(e){} mo = null; }
  }

  // ---- react on Settings changes (safe wrapper chained after existing one) ----
  if (!window.__ifx_extra_storage_patch){
    window.__ifx_extra_storage_patch = true;
    var _set_prev = Lampa.Storage.set;
    Lampa.Storage.set = function(k,v){
      var r = _set_prev.apply(this, arguments);

      if (typeof k === 'string' && k.indexOf('interface_mod_new_') === 0){
        if (k === KEY_YEAR){
          _settings_extra.year_on_cards = (v===true || v==='true' || Lampa.Storage.get(KEY_YEAR,'false')==='true');
          setYearOnCardsEnabled(_settings_extra.year_on_cards);
          if (_settings_extra.year_on_cards) enableObserver(); else disableObserver();
        }
        if (k === KEY_ALT){
          _settings_extra.ep_alt_cards = (v===true || v==='true' || Lampa.Storage.get(KEY_ALT,'false')==='true');
          setEpisodeAltCardsEnabled(_settings_extra.ep_alt_cards);
        }
        if (k === KEY_NUM){
          _settings_extra.ep_num_only = (v===true || v==='true' || Lampa.Storage.get(KEY_NUM,'false')==='true');
          setEpisodeNumbersOnlyEnabled(_settings_extra.ep_num_only);
        }
      }
      return r;
    };
  }

  // ---- initial apply on plugin start ----
  function bootExtras(){
    ensureYearCss();
    setYearOnCardsEnabled(_settings_extra.year_on_cards);
    setEpisodeAltCardsEnabled(_settings_extra.ep_alt_cards);
    setEpisodeNumbersOnlyEnabled(_settings_extra.ep_num_only);
    if (_settings_extra.year_on_cards) enableObserver();
  }

  if (window.appready) bootExtras();
  else Lampa.Listener.follow('app', function(e){ if (e.type==='ready') bootExtras(); });
})();

})();

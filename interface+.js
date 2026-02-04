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
 * Чи увімкнений монохромний режим
 */
function isMonoEnabled() {
  try {
    return getBool('interface_mod_new_mono_mode', false);
  } catch (e) {
    return false;
  }
}

  /**
   * Монохром застосовується ТІЛЬКИ якщо:
   * - моно увімкнено
   * - і конкретна опція теж увімкнена (кольорові статуси / PG / інфо-панель)
   */
  function isMonoFor(settingKey) {
    return isMonoEnabled() && getBool(settingKey, false);
  }

  /**
   * Єдиний монохромний стиль для бейджів/плашок
   */
  function applyMonoBadgeStyle(el) {
    if (!el || !el.style) return;

    // прибираємо попередні інлайн-кольори/ефекти
    [
      'background-color','color','border','border-color','border-width','border-style',
      'box-shadow','text-shadow'
    ].forEach(function (p) {
      try { el.style.removeProperty(p); } catch (e) {}
    });

    el.style.setProperty('border-width', '1px', 'important');
    el.style.setProperty('border-style', 'solid', 'important');
    el.style.setProperty('border-color', 'rgba(255,255,255,.45)', 'important');
    el.style.setProperty('background-color', 'rgba(255,255,255,.08)', 'important');
    el.style.setProperty('color', '#fff', 'important');
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
      uk: 'Увімкнути кольорове виділення рейтингу в повній картці'
    },

    interface_mod_new_colored_status: {
      en: 'Colored statuses',
      uk: 'Кольорові статуси'
    },
    interface_mod_new_colored_status_desc: {
      en: 'Colorize series status',
      uk: 'Підсвічувати статус фільму/серіалу в повній картці'
    },

    interface_mod_new_colored_age: {
      en: 'Colored age rating',
      uk: 'Кольоровий віковий рейтинг '
    },
    interface_mod_new_colored_age_desc: {
      en: 'Colorize age rating',
      uk: 'Підсвічувати віковий рейтинг в повній картці'
    },
    interface_mod_new_mono_mode: {
      en: 'Monochrome override',
      uk: 'Монохромний режим (Ч/Б)'
    },
    interface_mod_new_mono_mode_desc: {
      en: 'Overrides colors for statuses, age rating and the new info panel (only when those options are enabled)',
      uk: 'Перекриває кольори для статусів, PG та нової інфо-панелі (якщо відповідні опції увімкнені)'
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
      en: 'Show original title under the card header',
      uk: 'Показувати оригінальну назву в заголовку картки'
    },

    // КНОПКИ
    interface_mod_new_all_buttons: {
      en: 'All buttons in card',
      uk: 'Всі кнопки в картці'
    },
    interface_mod_new_all_buttons_desc: {
      en: 'Show all buttons in the card.',
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
      uk: 'Оновлює іконки та кольори кнопок онлайн, торенти, трейлери'
    },

    // ТОРЕНТИ (з torrents+mod)
    torr_mod_frame: {
      uk: 'Кольорова рамка блоку торентів',
      en: 'Colored torrent frame by seeders'
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
    mono_mode: getBool('interface_mod_new_mono_mode', false),
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
  *:not(input){
    -webkit-user-select:none !important;
    -moz-user-select:none !important;
    -ms-user-select:none !important;
    user-select:none !important;
  }
  *{
    -webkit-tap-highlight-color:transparent;
    -webkit-touch-callout:none;
    box-sizing:border-box;
    outline:none;
    -webkit-user-drag:none;
  }

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

  /* ============================================================
   * ONLINE BUTTON COLORS (ICON ONLY)
   * ============================================================ */

  /* BanderaOnline — НЕ ПЕРЕФАРБОВУЄМО (залишається синьо-жовтий прапор) */
  .full-start__button.ifx-bandera-online svg path,
  .full-start__button.ifx-bandera-online svg rect{
    fill: unset !important;
  }

  /* ============================================================
   * BazarNetUA — той самий стиль, що синя кнопка,
   *              АЛЕ ІНШИЙ КОЛІР ІКОНКИ
   *
   * 👉 ТУТ МОЖНА ЗМІНИТИ ФІОЛЕТОВИЙ НА БУДЬ-ЯКИЙ ІНШИЙ КОЛІР
   * ============================================================ */
  :root{
    --ifx-bazarnet-play-color: #8b5cf6; /* ← ЗМІНИ ЦЕ ЗНАЧЕННЯ */
  }

  .full-start__button.view--online.lampac--button[data-subtitle*="BazarNetUA"] svg path{
    fill: var(--ifx-bazarnet-play-color) !important;
  }

  /* ============================================================
   * Всі інші ONLINE — стандартний синій play
   * ============================================================ */
  .full-start__button.view--online:not(.ifx-bandera-online):not(.lampac--button) svg path{
    fill:#2196f3 !important;
  }
  .full-start__button.view--online.lampac--button:not([data-subtitle*="BazarNetUA"]) svg path{
    fill:#2196f3 !important;
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
        name: 'interface_mod_new_mono_mode',
        type: 'trigger',
        values: true,
        default: false
      },
      field: {
        name: Lampa.Lang.translate('interface_mod_new_mono_mode'),
        description: Lampa.Lang.translate('interface_mod_new_mono_mode_desc')
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
     * ВИКЛИКАЄ Lampa.Settings.update()
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
          
          // [!!!] Update only the changed setting in the local 'settings' object
          // and call the specific function for that setting.
          // This avoids re-reading all 13 settings from storage on every change.

          switch (key) {
            case 'interface_mod_new_info_panel':
              settings.info_panel = getBool(key, true);
              rebuildInfoPanelActive();
              break;
              
            case 'interface_mod_new_colored_ratings':
              settings.colored_ratings = getBool(key, false);
              if (settings.colored_ratings) updateVoteColors();
              else clearVoteColors();
              break;
              
            case 'interface_mod_new_colored_status':
              settings.colored_status = getBool(key, false);
              setStatusBaseCssEnabled(settings.colored_status);
              if (settings.colored_status) enableStatusColoring();
              else disableStatusColoring(true);
              break;
              
            case 'interface_mod_new_colored_age':
              settings.colored_age = getBool(key, false);
              setAgeBaseCssEnabled(settings.colored_age);
              if (settings.colored_age) enableAgeColoring();
              else disableAgeColoring(true);
              break;

            case 'interface_mod_new_mono_mode':
              settings.mono_mode = getBool(key, false);
              // Перебудувати інфо-панель (бо кольори там інлайном)
              rebuildInfoPanelActive();
              // Перемалювати статуси/PG на відкритій картці, якщо вони увімкнені
              if (settings.colored_status) applyStatusOnceIn(document);
              if (settings.colored_age) applyAgeOnceIn(document);
              break;
              
            case 'interface_mod_new_theme_select':
              settings.theme = (val || 'default'); // Use 'val' directly from arguments
              applyTheme(settings.theme);
              //closeOpenSelects(); // This is the only one that needs this
              break;
              
            case 'interface_mod_new_en_data':
            case 'interface_mod_new_english_data': // Handle fallback
              settings.en_data = getOriginalTitleEnabled(); // This function already checks both keys
              applyOriginalTitleToggle();
              break;
              
            case 'interface_mod_new_all_buttons':
              settings.all_buttons = getBool(key, false);
              rebuildButtonsNow();
              break;
              
            case 'interface_mod_new_icon_only':
              settings.icon_only = getBool(key, false);
              rebuildButtonsNow();
              break;
              
            case 'interface_mod_new_colored_buttons':
              settings.colored_buttons = getBool(key, false);
              setColoredButtonsEnabled(settings.colored_buttons);
              break;
              
            case 'interface_mod_new_tor_frame':
              settings.tor_frame = getBool(key, true);
              if (window.runTorrentStyleRefresh) window.runTorrentStyleRefresh();
              break;
              
            case 'interface_mod_new_tor_bitrate':
              settings.tor_bitrate = getBool(key, true);
              if (window.runTorrentStyleRefresh) window.runTorrentStyleRefresh();
              break;
              
            case 'interface_mod_new_tor_seeds':
              settings.tor_seeds = getBool(key, true);
              if (window.runTorrentStyleRefresh) window.runTorrentStyleRefresh();
              break;
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
/**
 * Створює і наповнює нову інфо-панель
 * + Монохромний оверрайд (перекриває всі кольори бейджів і жанрів),
 *   але тільки коли:
 *   - увімкнено "Монохромний режим"
 *   - і увімкнено "Нова інфо-панель"
 */
function buildInfoPanel(details, movie, isTvShow, originalDetails) {
  var mono = isMonoFor('interface_mod_new_info_panel');

  var container = $('<div>').css({
    display: 'flex',
    'flex-direction': 'column',
    width: '100%',
    gap: '0em',
    margin: '-1.0em 0 0.2em 0.45em'
  });

  var row1 = $('<div>').css({ display: 'flex', 'flex-wrap': 'wrap', gap: '0.2em', 'align-items': 'center', margin: '0 0 0.2em 0' });
  var row2 = $('<div>').css({ display: 'flex', 'flex-wrap': 'wrap', gap: '0.2em', 'align-items': 'center', margin: '0 0 0.2em 0' });
  var row3 = $('<div>').css({ display: 'flex', 'flex-wrap': 'wrap', gap: '0.2em', 'align-items': 'center', margin: '0 0 0.2em 0' });
  var row4 = $('<div>').css({ display: 'flex', 'flex-wrap': 'wrap', gap: '0.2em', 'align-items': 'flex-start', margin: '0 0 0.2em 0' });

  var colors = {
    seasons: { bg: 'rgba(52,152,219,0.8)', text: 'white' },
    episodes:{ bg: 'rgba(46,204,113,0.8)', text: 'white' },
    duration:{ bg: 'rgba(52,152,219,0.8)', text: 'white' },
    next:    { bg: 'rgba(230,126,34,0.9)', text: 'white' },
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

  // Хелпери стилів: або кольорово, або моно
  function badgeCss(bg, text) {
    if (mono) {
      return $.extend({}, baseBadge, {
        'background-color': 'rgba(255,255,255,.08)',
        color: '#fff',
        border: '1px solid rgba(255,255,255,.45)'
      });
    }
    return $.extend({}, baseBadge, {
      'background-color': bg,
      color: text
    });
  }

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

  function genreCss(bg, text) {
    if (mono) {
      return $.extend({}, baseGenre, {
        'background-color': 'rgba(255,255,255,.08)',
        color: '#fff',
        border: '1px solid rgba(255,255,255,.45)'
      });
    }
    return $.extend({}, baseGenre, {
      'background-color': bg,
      color: text
    });
  }

  // 1 — Серії (для серіалів)
  if (isTvShow && Array.isArray(movie.seasons)) {
    var totalEps = 0, airedEps = 0, now = new Date(), hasEpisodes = false;

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

    if (epsText) row1.append(
      $('<span>').text(epsText).css(badgeCss(colors.episodes.bg, colors.episodes.text))
    );
  }

  // 2 — Наступна серія
  if (isTvShow && movie.next_episode_to_air && movie.next_episode_to_air.air_date) {
    var nextDate = new Date(movie.next_episode_to_air.air_date), today = new Date();
    nextDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    var diff = Math.floor((nextDate - today) / (1000 * 60 * 60 * 24));
    var txt = diff === 0 ? 'Наступна серія вже сьогодні'
      : diff === 1 ? 'Наступна серія вже завтра'
      : diff > 1 ? ('Наступна серія через ' + diff + ' ' + plural(diff, 'день', 'дні', 'днів'))
      : '';

    if (txt) row2.append(
      $('<span>').text(txt).css(badgeCss(colors.next.bg, colors.next.text))
    );
  }

  // 3 — Тривалість
  if (!isTvShow && movie.runtime > 0) {
    var mins = movie.runtime, h = Math.floor(mins / 60), m = mins % 60;
    var tt = 'Тривалість фільму: ';
    if (h > 0) tt += h + ' ' + plural(h, 'година', 'години', 'годин');
    if (m > 0) tt += (h > 0 ? ' ' : '') + m + ' хв.';

    row3.append(
      $('<span>').text(tt).css(badgeCss(colors.duration.bg, colors.duration.text))
    );
  } else if (isTvShow) {
    var avg = calculateAverageEpisodeDuration(movie);
    if (avg > 0) row3.append(
      $('<span>').text('Тривалість серії ≈ ' + formatDurationMinutes(avg))
        .css(badgeCss(colors.duration.bg, colors.duration.text))
    );
  }

  // 4 — Сезони + Жанри
  var seasonsCount = (movie.season_count || movie.number_of_seasons || (movie.seasons ? movie.seasons.filter(function (s) {
    return s.season_number !== 0;
  }).length : 0)) || 0;

  if (isTvShow && seasonsCount > 0) {
    row4.append(
      $('<span>').text('Сезони: ' + seasonsCount).css(badgeCss(colors.seasons.bg, colors.seasons.text))
    );
  }

  var genreList = [];
  if (Array.isArray(movie.genres) && movie.genres.length) {
    genreList = movie.genres.map(function (g) { return g.name; });
  }
  genreList = genreList.filter(Boolean).filter(function (v, i, a) { return a.indexOf(v) === i; });

  genreList.forEach(function (gn) {
    var c = colors.genres[gn] || { bg: 'rgba(255,255,255,.12)', text: 'white' };
    row4.append(
      $('<span>').text(gn).css(genreCss(c.bg, c.text))
    );
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
  var __voteObserverDebounce = null; // OPTIMIZATION: Debounce timer
  function setupVoteColorsObserver() {
    setTimeout(function () {
      if (getBool('interface_mod_new_colored_ratings', false)) updateVoteColors();
    }, 400);

    var obs = new MutationObserver(function () {
      if (getBool('interface_mod_new_colored_ratings', false)) {
        // OPTIMIZATION: Debounce heavy DOM scan
        if (__voteObserverDebounce) clearTimeout(__voteObserverDebounce);
        __voteObserverDebounce = setTimeout(updateVoteColors, 200); // Was 80ms
      }
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
 * + Монохромний оверрайд (перекриває палітру, але тільки коли:
 *   - увімкнено "Монохромний режим"
 *   - і увімкнено "Кольорові статуси"
 */
function applyStatusOnceIn(elRoot) {
  if (!getBool('interface_mod_new_colored_status', false)) return;

  var mono = isMonoFor('interface_mod_new_colored_status');

  var palette = {
    completed: { bg: 'rgba(46,204,113,.85)', text: 'white' },
    canceled:  { bg: 'rgba(231,76,60,.9)',  text: 'white' },
    ongoing:   { bg: 'rgba(243,156,18,.95)', text: 'black' },
    production:{ bg: 'rgba(52,152,219,.9)',  text: 'white' },
    planned:   { bg: 'rgba(155,89,182,.9)',  text: 'white' },
    pilot:     { bg: 'rgba(230,126,34,.95)', text: 'white' },
    released:  { bg: 'rgba(26,188,156,.9)',  text: 'white' },
    rumored:   { bg: 'rgba(149,165,166,.9)', text: 'white' },
    post:      { bg: 'rgba(0,188,212,.9)',    text: 'white' },
    soon:      { bg: 'rgba(142,68,173,.95)',  text: 'white' }
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

    // === МОНОХРОМНИЙ ОВЕРРАЙД ===
    if (mono) {
      // ВАЖЛИВО: перекриваємо value-based кольори
      applyMonoBadgeStyle(el);
      el.style.setProperty('display', 'inline-block', 'important');
      return;
    }

    // === КОЛЬОРОВИЙ РЕЖИМ (як було) ===
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
  
/**
 * Застосовує кольори до вікових рейтингів (PG)
 * + Монохромний оверрайд (перекриває __ageColors, але тільки коли:
 *   - увімкнено "Монохромний режим"
 *   - і увімкнено "Кольоровий віковий рейтинг"
 */
function applyAgeOnceIn(elRoot) {
  if (!getBool('interface_mod_new_colored_age', false)) return;

  var mono = isMonoFor('interface_mod_new_colored_age');

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

    // є значення — показуємо
    el.classList.remove('hide');
    el.classList.remove('ifx-age-fallback');
    ['border-width', 'border-style', 'border-color', 'background-color', 'color'].forEach(function (p) {
      el.style.removeProperty(p);
    });

    var g = ageCategoryFor(t);

    if (g) {
      // === МОНОХРОМНИЙ ОВЕРРАЙD ===
      if (mono) {
        applyMonoBadgeStyle(el);
        el.style.display = 'inline-block'; // без !important — .hide завжди переможе
        return;
      }

      // === КОЛЬОРОВИЙ РЕЖИМ (як було) ===
      var c = __ageColors[g];
      $(el).css({
        'background-color': c.bg,
        color: c.text,
        'border-color': 'transparent'
      });
      el.style.display = 'inline-block';
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

  /* ============================================================
   * ONLINE buttons colors
   * ============================================================ */

  /* 1) BanderaOnline: не чіпаємо (як і було) */
  .full-start__button.ifx-bandera-online svg path,
  .full-start__button.ifx-bandera-online svg rect {
    fill: unset !important;
  }

  /* 2) BazarNetUA */
  :root{
    --ifx-bazarnet-accent: 139, 92, 246;
  }

  .full-start__button.view--online.lampac--button[data-subtitle*="BazarNetUA"]{
    background: rgba(var(--ifx-bazarnet-accent), .18) !important;
    border: 1px solid rgba(var(--ifx-bazarnet-accent), .55) !important;
    color: #ddd6fe !important;
  }

  .full-start__button.view--online.lampac--button[data-subtitle*="BazarNetUA"].focus,
  .full-start__button.view--online.lampac--button[data-subtitle*="BazarNetUA"]:hover{
    background: rgba(var(--ifx-bazarnet-accent), .33) !important;
  }

  .full-start__button.view--online.lampac--button[data-subtitle*="BazarNetUA"] svg{
    color: #ddd6fe !important;
  }

  /* 3) Всі інші online — стандартний синій */
  .full-start__button.view--online:not(.ifx-bandera-online):not(.lampac--button) svg path {
    fill: #2196f3 !important;
  }

  .full-start__button.view--online:not(.ifx-bandera-online).lampac--button:not([data-subtitle*="BazarNetUA"]) svg path {
    fill: #2196f3 !important;
  }

  /* TORRENT / TRAILER */
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

  function makeOnlineUaSvg() {
    var gid = 'ifx_ua_grad_' + Math.random().toString(16).slice(2);

    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">' +
        '<defs>' +
          '<linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0%" stop-color="#156DD1"/>' +
            '<stop offset="50%" stop-color="#156DD1"/>' +
            '<stop offset="50%" stop-color="#FFD948"/>' +
            '<stop offset="100%" stop-color="#FFD948"/>' +
          '</linearGradient>' +
        '</defs>' +
        '<path style="fill:url(#' + gid + ') !important" d="M20.331 14.644l-13.794-13.831 17.55 10.075zM2.938 0c-0.813 0.425-1.356 1.2-1.356 2.206v27.581c0 1.006 0.544 1.781 1.356 2.206l16.038-16zM29.512 14.1l-3.681-2.131-4.106 4.031 4.106 4.031 3.756-2.131c1.125-0.893 1.125-2.906-0.075-3.8zM6.538 31.188l17.55-10.075-3.756-3.756z"/>' +
      '</svg>'
    );
  }

  function isBanderaOnlineBtn($btn) {
    if (!$btn || !$btn.length) return false;

    var sub = String($btn.attr('data-subtitle') || '').toLowerCase();
    var txt = String($btn.text() || '').toLowerCase();

    // BanderaOnline так ідентифікується у твоєму коді:
    // data-subtitle="[Free] Bandera Online vX" і текст "t.me/mmssixxx"
    if (sub.indexOf('bandera online') !== -1) return true;
    if (txt.indexOf('mmssixxx') !== -1) return true;

    return false;
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

        // ✅ SPECIAL: тільки BanderaOnline -> UA play
        if (kind === 'online' && isBanderaOnlineBtn($btn)) {
        // позначаємо кнопку, щоб CSS НЕ перефарбовував її SVG
        $btn.addClass('ifx-bandera-online');
        // якщо хочеш лишити ОРИГІНАЛЬНУ bandera-іконку — нічого не міняй:
        // return;
        // якщо хочеш саме "play" синьо-жовтий (твій SVG) — тоді міняй:
        $svg.replaceWith(makeOnlineUaSvg());
          } else {
            $svg.replaceWith(SVG_MAP[kind]);
          }

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
        //if (settings.colored_buttons) applyColoredButtonsIn(root);
        if (settings.colored_buttons) {
        applyColoredButtonsIn(root);

        // BanderaOnline може вставити кнопку трохи пізніше — доганяємо
        setTimeout(function(){ try { replaceIconsIn(root); } catch(e){} }, 300);
        setTimeout(function(){ try { replaceIconsIn(root); } catch(e){} }, 900);
        }

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
        }, 200); // OPTIMIZATION: Was 60ms
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

  /* BEGIN my torrents mod (Verbatim) */
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
          /* СІДИ: Текст яскравий, фон ледь помітний (0.15) */
          '.torrent-item__seeds span.low-seeds': { 
            'color': '#ff9696', 
            'background': 'rgba(255, 150, 150, 0.10)', 
            'border': '1.4px solid rgba(255, 150, 150, 0.5)',
            'text-shadow': '0 0 5px rgba(255, 150, 150, 0.4)',
            'box-shadow': '0 0 8px rgba(255, 150, 150, 0.2)'
          },
          '.torrent-item__seeds span.medium-seeds': { 
            'color': '#fbcb79', 
            'background': 'rgba(251, 203, 121, 0.10)', 
            'border': '1.4px solid rgba(251, 203, 121, 0.5)',
            'text-shadow': '0 0 5px rgba(251, 203, 121, 0.4)',
            'box-shadow': '0 0 8px rgba(251, 203, 121, 0.2)'
          },
          '.torrent-item__seeds span.high-seeds': { 
            'color': '#77cdb2', 
            'background': 'rgba(119, 205, 178, 0.10)', 
            'border': '1.4px solid rgba(119, 205, 178, 0.5)',
            'text-shadow': '0 0 5px rgba(119, 205, 178, 0.4)',
            'box-shadow': '0 0 8px rgba(119, 205, 178, 0.2)'
          },
          /* БІТРЕЙТ: Кольорова диференціація */
          '.torrent-item__bitrate span.low-bitrate': { 
            'color': '#fbcb79', 
            'background': 'rgba(251, 203, 121, 0.10)', 
            'border': '1.4px solid rgba(251, 203, 121, 0.5)',
            'text-shadow': '0 0 5px rgba(251, 203, 121, 0.4)',
            'box-shadow': '0 0 8px rgba(251, 203, 121, 0.2)'
          },
          '.torrent-item__bitrate span.medium-bitrate': { 
            'color': '#77cdb2', 
            'background': 'rgba(119, 205, 178, 0.10)', 
            'border': '1.4px solid rgba(119, 205, 178, 0.5)',
            'text-shadow': '0 0 5px rgba(119, 205, 178, 0.4)',
            'box-shadow': '0 0 8px rgba(119, 205, 178, 0.2)'
          },
          '.torrent-item__bitrate span.high-bitrate': { 
            'color': '#ff9696', 
            'background': 'rgba(255, 150, 150, 0.10)', 
            'border': '1.4px solid rgba(255, 150, 150, 0.5)',
            'text-shadow': '0 0 5px rgba(255, 150, 150, 0.4)',
            'box-shadow': '0 0 8px rgba(255, 150, 150, 0.2)'
          },
          /* РАМКИ КАРТОК (interface_mod_new_tor_frame) */
          '.torrent-item.low-seeds': { 
            'border': '2px solid rgba(255, 150, 150, 0.45)', 
            'border-radius': '6px',
            'box-sizing': 'border-box'
          },
          '.torrent-item.medium-seeds': { 
            'border': '2px solid rgba(251, 203, 121, 0.45)', 
            'border-radius': '6px',
            'box-sizing': 'border-box'
          },
          '.torrent-item.high-seeds': { 
            'border': '2px solid rgba(119, 205, 178, 0.45)', 
            'border-radius': '6px',
            'box-sizing': 'border-box'
          },
          /* ТРЕКЕРИ */
          '.torrent-item__tracker.utopia': { 'color': '#9b59b6', 'font-weight': 'bold' },
          '.torrent-item__tracker.toloka': { 'color': '#3498db', 'font-weight': 'bold' },
          '.torrent-item__tracker.mazepa': { 'color': '#C9A0DC', 'font-weight': 'bold' }
        };

        // ===================== ІНІЦІАЛІЗАЦІЯ СТИЛІВ ====================
        let style = document.createElement('style');
        style.innerHTML = FLAG_STYLES + '\n' + Object.entries(STYLES).map(([selector, props]) => {
          return `${selector} { ${Object.entries(props).map(([prop, val]) => `${prop}: ${val} !important`).join('; ')} }`;
        }).join('\n');
        document.head.appendChild(style);

        // ============= СИСТЕМА ЗАМІНИ ТЕКСТУ ДЛЯ ФІЛЬТРІВ =============
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

        // =============== ОПТИМІЗОВАНА СИСТЕМА ЗАМІНИ ТЕКСТУ ===============
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
            
            // [!!!] OPTIMIZATION: Combine selectors into one query
            const selectors = safeContainers.map(s => s + ':not(.ua-flag-processed)').join(', ');
            
            try {
              const elements = document.querySelectorAll(selectors);
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
              console.warn('Помилка обробки селекторів:', error);
            }
          };

          const startTime = Date.now();
          const TIME_LIMIT = 50;

          processSafeElements();

          if (Date.now() - startTime < TIME_LIMIT) {
            processVoiceFilters();
          }
        }

        // ================= СИСТЕМА ОНОВЛЕННЯ СТИЛІВ ТОРЕНТІВ =================
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

        // ================= ОПТИМІЗОВАНА СИСТЕМА СПОСТЕРЕЖЕННЯ =================
        let updateTimeout = null;
        const observer = new MutationObserver(mutations => {
          const hasImportantChanges = mutations.some(mutation => {
            return mutation.addedNodes.length > 0 &&
              !mutation.target.closest('.hidden, [style*="display: none"]');
          });

          if (hasImportantChanges) {
            clearTimeout(updateTimeout);
            updateTimeout = setTimeout(updateAll, 250); // OPTIMIZATION: Was 150ms
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
  /* END my torrents mod */

  /* torrent toggles overrides */
  // Цей блок динамічно вмикає/вимикає стилі з torrents mod
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
      
      // Якщо вимкнено БІТРЕЙТ: скидаємо колір, фон та внутрішню рамку цифр
      if (!eb) {
        css += '.torrent-item__bitrate span.low-bitrate, .torrent-item__bitrate span.medium-bitrate, .torrent-item__bitrate span.high-bitrate { color: inherit !important; background: none !important; border: none !important; font-weight: inherit !important; }\n';
      }
      
      // Якщо вимкнено СІДИ: скидаємо колір, фон та внутрішню рамку цифр
      if (!es) {
        css += '.torrent-item__seeds span.low-seeds, .torrent-item__seeds span.medium-seeds, .torrent-item__seeds span.high-seeds { color: inherit !important; background: none !important; border: none !important; font-weight: inherit !important; }\n';
      }
      
      // Якщо вимкнено ЗАГАЛЬНІ РАМКИ: прибираємо бордер з усього рядка торента
      if (!ef) {
        css += '.torrent-item.low-seeds, .torrent-item.medium-seeds, .torrent-item.high-seeds { border: none !important; box-shadow: none !important; }\n';
      }
      
      s.textContent = css;
    }
    
    // Робимо функцію глобальною, щоб її міг викликати основний плагін
    window.runTorrentStyleRefresh = apply;
    setTimeout(apply, 0); // Перший запуск
  })();

/* ============================================================
 * YEAR PILL + ALT EPISODE CARDS (NO MENU REORDER)
 * - year pill styles intact
 * - hide year ONLY on processed list/episode cards (not in full view)
 * - strip year from titles only on processed cards
 * ============================================================ */
(function(){
  // ---------- i18n ----------
  Lampa.Lang.add({
    ifx_year_on_cards:         { uk:'Показувати рік на картці', en:'Show year on card' },
    ifx_year_on_cards_desc:    { uk:'Увімкнути/Вимкнути відображення року на постері', en:'Year displayed on the poster only' },

    ifx_show_rating_on_cards:      { uk:'Показувати рейтинг на картці', en:'Show rating on card' },
    ifx_show_rating_on_cards_desc: { uk:'Увімкнути/Вимкнути стандартний рейтинг на постері',
                                   en:'Toggle the built-in rating badge on list posters' },
      
    ifx_alt_badges:      { uk:'Альтернативні мітки', en:'Alternative badges' },
    ifx_alt_badges_desc: { uk:'Мітки "рік" і "рейтинг" у іншому стилі', en:'Year & Rating  alternative style' },
    
    ifx_episode_alt_cards:     { uk:'Альтернативні "Найближчі епізоди"', en:'Alternative "Upcoming Episodes"' },
    ifx_episode_alt_cards_desc:{ uk:'Компактний вигляд блоку "Найближчі епізоди"', en:'Compact view for the "Upcoming Episodes" block' },

    ifx_episode_num_only:      { uk:'Показувати лише номер серії', en:'Show episode number only' },
    ifx_episode_num_only_desc: { uk:'Завжди показувати номер серії у вигляді "Серія N" замість назви', en:'Always show "Episode N" instead of the title' }

  
  });

  // keys (усі дефолт: false) 
  var KEY_YEAR = 'interface_mod_new_year_on_cards';
  var KEY_ALT  = 'interface_mod_new_episode_alt_cards';
  var KEY_NUM  = 'interface_mod_new_episode_numbers_only';
  var KEY_RATING = 'interface_mod_new_rating_on_cards';
  
  var S = {
    year_on:  (Lampa.Storage.get(KEY_YEAR, false)===true || Lampa.Storage.get(KEY_YEAR,'false')==='true'),
    alt_ep:   (Lampa.Storage.get(KEY_ALT,  false)===true || Lampa.Storage.get(KEY_ALT, 'false')==='true'),
    num_only: (Lampa.Storage.get(KEY_NUM,  false)===true || Lampa.Storage.get(KEY_NUM, 'false')==='true'),
    show_rate:(Lampa.Storage.get(KEY_RATING,true)===true  || Lampa.Storage.get(KEY_RATING,'true')==='true')
  
  };

  // settings UI (без перестановок)
  (function addSettings(){
    var add = Lampa.SettingsApi.addParam;
    add({ component:'interface_mod_new',
      param:{ name: KEY_YEAR, type:'trigger', values:true, default:false },
      field:{ name:Lampa.Lang.translate('ifx_year_on_cards'),
              description:Lampa.Lang.translate('ifx_year_on_cards_desc') }
    });
    add({ component:'interface_mod_new',
      param:{ name: KEY_RATING, type:'trigger', values:true, default:true },
      field:{ name: Lampa.Lang.translate('ifx_show_rating_on_cards'),
              description: Lampa.Lang.translate('ifx_show_rating_on_cards_desc') }
    });
    add({  component: 'interface_mod_new',
      param: { name: 'interface_mod_new_alt_badges', type: 'trigger', values: true, default: false },
      field: { name: Lampa.Lang.translate('ifx_alt_badges'),
               description: Lampa.Lang.translate('ifx_alt_badges_desc') }
    });
    
    add({ component:'interface_mod_new',
      param:{ name: KEY_ALT, type:'trigger', values:true, default:false },
      field:{ name:Lampa.Lang.translate('ifx_episode_alt_cards'),
              description:Lampa.Lang.translate('ifx_episode_alt_cards_desc') }
    });
    add({ component:'interface_mod_new',
      param:{ name: KEY_NUM, type:'trigger', values:true, default:false },
      field:{ name:Lampa.Lang.translate('ifx_episode_num_only'),
              description:Lampa.Lang.translate('ifx_episode_num_only_desc') }
    });
    
  })();

  //  CSS 
function ensureCss(){
    var id = 'ifx_css_stable_final_v2';
    if (document.getElementById(id)) return;
    var st = document.createElement('style');
    st.id = id;
    st.textContent = `
      /* --- 1. БАЗОВІ СТИЛІ КАРТОК (Оригінальна логіка) --- */
      
      /* Пігулка (як .card_vote) — наш власний бейдж року */
      .ifx-pill{
        background: rgba(0,0,0,.5);
        color:#fff; font-size:1.3em; font-weight:700;
        padding:.2em .5em; border-radius:1em; line-height:1;
        white-space:nowrap;
      }

      /* Стек у правому нижньому, мінімальна щілина */
      .ifx-corner-stack{
        position:absolute; right:.3em; bottom:.3em;
        display:flex; flex-direction:column; align-items:flex-end;
        gap:2px; z-index:10; pointer-events:none;
      }
      .ifx-corner-stack > *{ pointer-events:auto; }

      /* Коли переносимо рейтинґ у стек — робимо його пігулкою без absolute */
      .ifx-corner-stack .card__vote, .ifx-corner-stack .card_vote{
        position:static !important; right:auto !important; bottom:auto !important; top:auto !important; left:auto !important;
        background: rgba(0,0,0,.5); color:#fff; font-size:1.3em; font-weight:700;
        padding:.2em .5em; border-radius:1em; line-height:1;
      }

      /* Точки кріплення (для списків і епізодів) */
      .card .card__view{ position:relative; }
      .card-episode .full-episode{ position:relative; }

      /* ALT mode: заголовок у ВЕРХНЬОМУ ЛІВОМУ куті */
      body.ifx-ep-alt .card-episode .full-episode .card__title{
        position:absolute; left:.7em; top:.7em; right:.7em; margin:0;
        z-index:2; text-shadow:0 1px 2px rgba(0,0,0,.35);
      }

      /* ALT mode: ховаємо ВЕЛИКУ цифру та текстовий рік у тілі */
      body.ifx-ep-alt .card-episode .full-episode__num{ display:none !important; }
      body.ifx-ep-alt .card-episode .full-episode__body > .card__age{ display:none !important; }

      /* NUM-ONLY: ховаємо велику цифру завжди (і для ALT, і для стандарту) */
      body.ifx-num-only .card-episode .full-episode__num{ display:none !important; }

      /* ЛОКАЛЬНЕ ховання текстових років тільки для оброблених карток */
      .ifx-hide-age .card__age{ display:none !important; }

      /* Ховаємо штатний рейтинг повністю, коли вимкнено */
      body.ifx-no-rate .card__view > .card__vote,
      body.ifx-no-rate .card__view > .card_vote,
      body.ifx-no-rate .ifx-corner-stack > .card__vote,
      body.ifx-no-rate .ifx-corner-stack > .card_vote {
        display: none !important;
      }

      /* --- 2. ГЕОМЕТРІЯ ТОРРЕНТІВ ТА ФОКУС --- */
      
      /* Уніфікація розміру під стандартний блок ваги (.torrent-item__size) */
      .torrent-item__bitrate span, .torrent-item__seeds span {
        border-radius: 0.3em !important;
        padding: 0.3em 0.5em !important;
        font-weight: bold !important;
        display: inline-block !important;
        line-height: 1.2 !important;
        transition: all 0.2s ease !important;
      }

      /* Фокусна рамка торрента (біла) */
      .torrent-item.focus {
        outline: none !important;
        border: 3px solid #ffffff !important;
        box-shadow: 0 0 15px rgba(255, 255, 255, 0.4) !important;
        transform: scale(1.01) !important;
        z-index: 10 !important;
        background: rgba(255, 255, 255, 0.1) !important;
      }
    `;
    document.head.appendChild(st);
}

// Синхронізуємо ТІЛЬКИ кольори з якості (фон/текст).
// Якщо нічого не знайдено — дефолт як у твоєму прикладі.
function ifxSyncAltBadgeThemeFromQuality(){
  try{
    // Спершу сезонні мітки Quality, потім card__quality
    var q = document.querySelector('.card--season-complete, .card--season-progress')
         || document.querySelector('.card__quality');
    var inner = q ? (q.querySelector('div') || q) : null;

    var bg = 'rgba(61,161,141,0.9)'; // дефолтний зелений фон
    var fg = '#FFFFFF';              // дефолтний білий текст

    if (q){
      var csQ = getComputedStyle(q);
      if (csQ.backgroundColor) bg = csQ.backgroundColor;
    }
    if (inner){
      var csI = getComputedStyle(inner);
      if (csI.color) fg = csI.color;
    }

    var root = document.documentElement;
    root.style.setProperty('--ifx-badge-bg', bg);
    root.style.setProperty('--ifx-badge-color', fg);
  }catch(e){}
}

// Ввімкнення CSS
// Альтернативні мітки у фіксованому стилі.
// ✅ Можеш змінювати значення у КОНСТАНТАХ нижче.
function ensureAltBadgesCss(){
  var st = document.getElementById('ifx_alt_badges_css');

  /* ====== КОНСТАНТИ ДЛЯ ШВИДКОГО ТЮНІНГУ ====== */
  var RIGHT_OFFSET  = '.3em';   // правий відступ (як у стандартного рейтингу/року)
  var BOTTOM_OFFSET = '.50em';  // нижній відступ
  var RADIUS        = '0.3em';  // радіус заокруглення
  var FONT_FAMILY   = "'Roboto Condensed','Arial Narrow',Arial,sans-serif";
  var FONT_WEIGHT   = '700';
  var FONT_SIZE     = '1.0em';  // РОЗМІР ШРИФТУ
  var PAD_Y         = '.19em';  // ВНУТРІШНІ ВІДСТУПИ
  var PAD_X         = '.39em';  // ВНУТРІШНІ ВІДСТУПИ
  var UPPERCASE     = true;     // true => uppercase, false => як є
  /* ============================================ */

  var css = `
    body.ifx-alt-badges .card .card__view{ position:relative; }

    /* Стек праворуч БЕЗ виступу; мінімальна «щілина» між рейтингом і роком */
    body.ifx-alt-badges .ifx-corner-stack{
      position:absolute; right:${RIGHT_OFFSET}; bottom:${BOTTOM_OFFSET};
      margin-right:0;
      display:flex; flex-direction:column; align-items:flex-end;
      gap:0.5px; z-index:10; pointer-events:none;
    }
    body.ifx-alt-badges .ifx-corner-stack > *{ pointer-events:auto; }

    /* Рейтинг у стеку та рік — однаковий вигляд */
    body.ifx-alt-badges .ifx-corner-stack .card__vote,
    body.ifx-alt-badges .ifx-corner-stack .card_vote,
    body.ifx-alt-badges .ifx-corner-stack .ifx-year-pill{
      position:static !important;
      background: var(--ifx-badge-bg, rgba(61,161,141,0.9)) !important;
      color: var(--ifx-badge-color, #FFFFFF) !important;
      border-radius: ${RADIUS};
      padding: ${PAD_Y} ${PAD_X} !important;         /* внутрішні відступи */
      font-family: ${FONT_FAMILY};
      font-weight: ${FONT_WEIGHT};
      font-size: ${FONT_SIZE} !important;            /* розмір шрифту */
      line-height: 1.2;
      ${ UPPERCASE ? 'text-transform: uppercase;' : '' }
      text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.3);
      box-sizing: border-box;
      display: inline-flex; align-items: center;
      white-space: nowrap;
    }

    /* Якщо року немає в стеку — стилізуємо окремо рейтинг у .card__view */
    body.ifx-alt-badges .card__view > .card__vote,
    body.ifx-alt-badges .card__view > .card_vote{
      position:absolute !important;
      right:${RIGHT_OFFSET} !important;
      bottom:${BOTTOM_OFFSET} !important;
      margin-right:0 !important;
      background: var(--ifx-badge-bg, rgba(61,161,141,0.9)) !important;
      color: var(--ifx-badge-color, #FFFFFF) !important;
      border-radius: ${RADIUS};
      padding: ${PAD_Y} ${PAD_X} !important;         /* внутрішні відступи */
      font-family: ${FONT_FAMILY} !important;
      font-weight: ${FONT_WEIGHT} !important;
      font-size: ${FONT_SIZE} !important;            /* розмір шрифту */
      line-height: 1.2;
      ${ UPPERCASE ? 'text-transform: uppercase;' : '' }
      text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.3);
      z-index: 11;
      box-sizing: border-box;
      display: inline-flex; align-items: center;
      white-space: nowrap;
    }
  `;

  if (st){ st.textContent = css; }
  else { st = document.createElement('style'); st.id = 'ifx_alt_badges_css'; st.textContent = css; document.head.appendChild(st); }
}
  // ALT episode template
  var tplEpisodeOriginal = null;
  var tplEpisodeAlt =
    '<div class="card-episode selector layer--visible layer--render">\
      <div class="card-episode__body">\
        <div class="full-episode">\
          <div class="full-episode__img"><img/></div>\
          <div class="full-episode__body">\
            <div class="card__title">{title}</div>\
            <div class="card__age">{release_year}</div>\
            <div class="full-episode__num">{num}</div>\
            <div class="full-episode__name">{name}</div>\
            <div class="full-episode__date">{date}</div>\
          </div>\
        </div>\
      </div>\
      <div class="card-episode__footer hide">\
        <div class="card__imgbox">\
          <div class="card__view"><img class="card__img"/></div>\
        </div>\
        <div class="card__left">\
          <div class="card__title">{title}</div>\
          <div class="card__age">{release_year}</div>\
        </div>\
      </div>\
    </div>';

  function setEpisodeAlt(on){
    if (tplEpisodeOriginal === null){
      try { tplEpisodeOriginal = Lampa.Template.get('card_episode', {}, true); } catch(e){ tplEpisodeOriginal = null; }
    }
    Lampa.Template.add('card_episode', on ? tplEpisodeAlt : (tplEpisodeOriginal || tplEpisodeAlt));
    document.body.classList.toggle('ifx-ep-alt', !!on);
    
    // [!!!] ВИПРАВЛЕНО:
    // 'ifx-num-only' керується незалежно, базуючись лише на S.num_only
    document.body.classList.toggle('ifx-num-only', S.num_only);
    
    try{ Lampa.Settings.update(); }catch(e){}
  }

  // ---------- helpers ----------
  function episodeWord(){
    var code = (Lampa.Lang && Lampa.Lang.code) || 'uk';
    return code.indexOf('en')===0 ? 'Episode' : 'Серія';
  }

  // ВАЖЛИВО: спершу з даних, потім — з DOM (щоб не залежати від прихованих .card__age)
  /* ОПТИМІЗАЦІЯ: Кешування року (WeakMap) + ПРАВИЛЬНИЙ рік серіалу */
  var __ifx_yearCache = window.__ifx_yearCache || new WeakMap();
  window.__ifx_yearCache = __ifx_yearCache;

  /**
   * Оригінальна логіка getYear (Тепер пріоритезує рік СЕРІАЛУ, ігноруючи рік ЕПІЗОДУ)
   * Викликається щонайбільше 1 раз для кожної картки; результат кешується.
   */
  function __ifx_getYear_orig($root){
    var d = $root.data() || {};
    
    // 1) Дані Lampa: Пріоритет - рік виходу СЕРІАЛУ або ФІЛЬМУ
    // (Ми свідомо ігноруємо d.air_date та d.next_episode_date, бо це дати епізодів)
    var y = (d.first_air_date || '').slice(0,4) // << Пріоритет #1: Рік виходу серіалу
         || (d.release_date || '').slice(0,4) // << Пріоритет #2: Рік виходу фільму
         || d.release_year // << Резерв
         || d.year; // << Резерв
    if (/^(19|20)\d{2}$/.test(String(y))) return String(y);

    // 2) Текстовий рік з .card__age
    //    (зазвичай ставиться сюди рік СЕРІАЛУ, навіть на картках епізодів)
    var ageTxt = ($root.find('.card__age').first().text() || '').trim();
    var mAge = ageTxt.match(/(19|20)\d{2}/);
    if (mAge) return mAge[0];

    // 3) Назва: (2023) / [2023] або "— 2023" (як і було)
    //    Це фолбек, якщо .card__age порожній, але в назві рік є.
    var title = ($root.find('.card__title').first().text() || '').trim();
    var mTitle =
      title.match(/[\[\(]\s*((?:19|20)\d{2})\s*[\]\)]\s*$/) ||
      title.match(/(?:[–—·\/-]\s*)((?:19|20)\d{2})\s*$/);
    if (mTitle) return mTitle[1];
    
    // ПРИБРАЛИ ПОШУК .full-episode__date, оскільки він дає рік ЕПІЗОДУ.

    return '';
  }

  /**
   * Головна функція 'getYear' із кешуванням
   */
  function getYear($root){
    try{
      var el = $root && $root[0];
      // 1) З кешу (миттєво)
      if (el && __ifx_yearCache.has(el)) return __ifx_yearCache.get(el);

      // 2) Обчислення + кеш
      var y = __ifx_getYear_orig($root) || '';
      if (el) __ifx_yearCache.set(el, y);
      return y;
    }catch(e){
      // У випадку помилки, просто викликати оригінал без кешування
      return __ifx_getYear_orig($root);
    }
  }
  /* --- Кінець блоку getYear --- */

  function ensureStack($anchor){
    var $stack = $anchor.children('.ifx-corner-stack');
    if (!$stack.length) $stack = $('<div class="ifx-corner-stack"></div>').appendTo($anchor);
    return $stack;
  }

  // Акуратно прибираємо рік у кінці назви: (2021) [2021] – 2021 · 2021 / 2021
  function stripYear(txt){
    var s = String(txt||'');
    s = s.replace(/\s*\((19|20)\d{2}\)\s*$/,'');
    s = s.replace(/\s*\[(19|20)\d{2}\]\s*$/,'');
    s = s.replace(/\s*[–—\-·]\s*(19|20)\d{2}\s*$/,'');
    s = s.replace(/\s*\/\s*(19|20)\d{2}\s*$/,'');
    return s;
  }

  // Підчищаємо/повертаємо рік у заголовках ТІЛЬКИ для оброблених карток (які мають .ifx-hide-age)
  function applyTitleYearHide($scope){
    $scope = $scope || $(document.body);
    // працюємо тільки в межах карток, де ми сховали текстові роки
    var sel = '.ifx-hide-age .card__title';

    $(sel).each(function(){
      var $t = $(this);

      // якщо всередині є .card__age — його вже ховає локальний клас; текст не чіпаємо
      if ($t.find('.card__age').length){
        var saved = $t.data('ifx-title-orig');
        if (typeof saved === 'string'){ $t.text(saved); $t.removeData('ifx-title-orig'); }
        return;
      }

      if (S.year_on){
        var orig = $t.data('ifx-title-orig');
        if (!orig) $t.data('ifx-title-orig', $t.text());
        var base = orig || $t.text();
        var stripped = stripYear(base);
        if (stripped !== $t.text()) $t.text(stripped.trim());
      } else {
        var sv = $t.data('ifx-title-orig');
        if (typeof sv === 'string'){ $t.text(sv); $t.removeData('ifx-title-orig'); }
      }
    });
  }

  // ---------- інʼєкції ----------
  /* === керування видимістю рейтингу в списках === */
  /* === рейтинг працює незалежно від "року" === */
function applyListCard($card){
  var $view = $card.find('.card__view').first();
  if (!$view.length) return;

  var $vote  = $view.find('.card__vote, .card_vote').first();
  var $stack = ensureStack($view);

// 1) Показ/приховування рейтингу — ЖОРСТКО
var hardHide = !S.show_rate || document.body.classList.contains('ifx-no-rate');

if ($vote.length){
  if (hardHide){
    // нічого не переносимо, просто ховаємо
    $vote.addClass('ifx-vote-hidden').hide();
  } else {
    $vote.removeClass('ifx-vote-hidden').show();

    // Переносимо в стек тільки якщо він використовується
    var useStack = S.year_on || document.body.classList.contains('ifx-alt-badges');
    if (useStack && !$vote.parent().is($stack)) $stack.prepend($vote);
  }
}

  // 2) Рік на картці (додаємо/прибираємо бейдж та локальне приховування)
  if (S.year_on){
    if (!$stack.children('.ifx-year-pill').length){
      var y = getYear($card);
      if (y) $('<div class="ifx-pill ifx-year-pill"></div>').text(y).appendTo($stack);
    }
    $card.addClass('ifx-hide-age');
  } else {
    $stack.children('.ifx-year-pill').remove(); // при вимкненні року прибираємо наш бейдж
    $card.removeClass('ifx-hide-age');
  }
}

    function applyEpisodeCard($ep){
      var $full = $ep.find('.full-episode').first();
        if (!$full.length) return;

      var $stack = ensureStack($full);

      if (!$stack.children('.ifx-year-pill').length){
        var y = getYear($ep);
          if (y) $('<div class="ifx-pill ifx-year-pill"></div>').text(y).appendTo($stack);
    }

    // ЛОКАЛЬНО ховаємо текстові роки й підчищаємо назву лише для цієї картки епізоду
    if (S.year_on) $full.addClass('ifx-hide-age'); else $full.removeClass('ifx-hide-age');
  }

function injectAll($scope){
  $scope = $scope || $(document.body);

  // 1) Списки тайтлів: завжди проганяємо, щоб рейтинг працював незалежно від року
  $scope.find('.card').each(function(){
    var $c = $(this);
    if ($c.closest('.full-start, .full-start-new, .full, .details').length) return; // не чіпаємо повну картку
    applyListCard($c);
  });

  // 2) Картки епізодів: рік — тільки коли увімкнено; інакше чистимо
  $scope.find('.card-episode').each(function(){
    var $ep   = $(this);
    var $full = $ep.find('.full-episode').first();

    if (S.year_on){
      applyEpisodeCard($ep);
    } else {
      $full.removeClass('ifx-hide-age');
      $full.find('.ifx-year-pill').remove();
    }
  });

  // 3) Інше
  applyNumberOnly($scope);
  applyTitleYearHide($scope);
}   
  
  // ---------- «лише номер серії» (та ALT) ----------
  function applyNumberOnly($scope){
    $scope = $scope || $(document.body);
    
    // [!!!] ВИПРАВЛЕНО:
    // Тепер 'force' залежить ТІЛЬКИ від S.num_only
    var force = S.num_only;

    $scope.find('.card-episode .full-episode').each(function(){
      var $root = $(this);
      var $name = $root.find('.full-episode__name').first();
      if (!$name.length) return;

      if (!force){
        var orig = $name.data('ifx-orig');
        if (typeof orig === 'string'){ $name.text(orig); $name.removeData('ifx-orig'); }
        return;
      }

      var $num = $root.find('.full-episode__num').first();
      var n = ($num.text()||'').trim();
      if (!n){
        var m = ($name.text()||'').match(/\d+/);
        if (m) n = m[0];
      }
      if (!n) return;

      if (!$name.data('ifx-orig')) $name.data('ifx-orig', $name.text());
      $name.text(episodeWord() + ' ' + String(parseInt(n,10)));
    });
  }

  // ---------- observers ----------
  var mo = null;
  var moDebounce = null; // OPTIMIZATION: Debounce timer
  function enableObserver(){
    if (mo) return;
    mo = new MutationObserver(function(muts){
      for (var i=0;i<muts.length;i++){
        if (muts[i].addedNodes && muts[i].addedNodes.length){
          // OPTIMIZATION: Debounce
          if (moDebounce) clearTimeout(moDebounce);
          moDebounce = setTimeout(function(){ injectAll($(document.body)); }, 200); // Was 30ms
          break;
        }
      }
    });
    try { mo.observe(document.body, {subtree:true, childList:true}); } catch(e){}
  }
  function disableObserver(){ if (mo){ try{ mo.disconnect(); }catch(e){} mo=null; } }

  // ---------- react to settings ----------
  if (!window.__ifx_storage_stable_final_v2){
    window.__ifx_storage_stable_final_v2 = true;
    var _prev = Lampa.Storage.set;
    Lampa.Storage.set = function(k,v){
      var r = _prev.apply(this, arguments);
      if (typeof k==='string' && k.indexOf('interface_mod_new_')===0){
        if (k===KEY_YEAR){
          S.year_on = (v===true || v==='true' || Lampa.Storage.get(KEY_YEAR,'false')==='true');
          ensureCss();
          injectAll($(document.body));
          
          // [!!!] ВИПРАВЛЕНО:
          // Умовне ввімкнення/вимкнення обсервера видалено.
          // if (S.year_on) enableObserver(); else disableObserver(); // <--- ВИДАЛЕНО
        }
        if (k===KEY_ALT){
          S.alt_ep = (v===true || v==='true' || Lampa.Storage.get(KEY_ALT,'false')==='true');
          setEpisodeAlt(S.alt_ep);
          
          // [!!!] ВИПРАВЛЕНО:
          // Рядок document.body.classList.toggle('ifx-num-only', S.alt_ep || S.num_only);
          // ВИДАЛЕНО, оскільки setEpisodeAlt() тепер робить це коректно.
          
          setTimeout(function(){ injectAll($(document.body)); }, 50);
        }
        if (k===KEY_NUM){
          S.num_only = (v===true || v==='true' || Lampa.Storage.get(KEY_NUM,'false')==='true');

          // [!!!] ВИПРАВЛЕНО:
          // Тепер логіка незалежна:
          document.body.classList.toggle('ifx-num-only', S.num_only);
          
          applyNumberOnly($(document.body));
        }
        if (k==='interface_mod_new_alt_badges'){
        var on = (v===true || v==='true' || Lampa.Storage.get('interface_mod_new_alt_badges','false')==='true');
        ensureAltBadgesCss();
        document.body.classList.toggle('ifx-alt-badges', on);
        if (on) ifxSyncAltBadgeThemeFromQuality();
        

        }
        if (k===KEY_RATING){
          S.show_rate = (v===true || v==='true' || Lampa.Storage.get(KEY_RATING,'true')==='true');
          // Перемальовуємо всі видимі картки списків із новим станом
          // NEW: синхронізуємо клас для жорсткого приховування
          document.body.classList.toggle('ifx-no-rate', !S.show_rate);

          // Перемальовуємо всі видимі картки списків із новим станом
  
          injectAll($(document.body));
        }

      }
      return r;
    };
  }

  // ---------- boot ----------
  function boot(){
    ensureCss();
    setEpisodeAlt(S.alt_ep);
    
    // [!!!] ВИПРАВЛЕНО:
    // Обсервер (MutationObserver) тепер вмикається ЗАВЖДИ,
    // а не тільки коли S.year_on === true.
    enableObserver(); // <--- ЗАМІНЕНО (було: if (S.year_on) ... else ...)
    
    injectAll($(document.body));
   
  // ALT badges: підключаємо CSS і застосовуємо стан тумблера
  ensureAltBadgesCss();
  var altOn = (Lampa.Storage.get('interface_mod_new_alt_badges', false)===true
            || Lampa.Storage.get('interface_mod_new_alt_badges','false')==='true');
  document.body.classList.toggle('ifx-alt-badges', altOn);
  if (altOn) ifxSyncAltBadgeThemeFromQuality();

  document.body.classList.toggle('ifx-no-rate', !S.show_rate);
           
  
  }
  if (window.appready) boot();
  else Lampa.Listener.follow('app', function(e){ if (e.type==='ready') boot(); });
})();
  
})();

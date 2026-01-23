// IIFE - самовикликаюча функція для ізоляції плагіна
(function () {
  'use strict';

  /* =========================
   * 1) Локалізація (мінімальна)
   * ========================= */
  function translate() {
    Lampa.Lang.add({
      bat_parser: {
        ru: 'Каталог парсеров',
        en: 'Parsers catalog',
        uk: 'Каталог парсерів',
        zh: '解析器目录'
      },
      bat_parser_description: {
        ru: 'Нажмите для выбора парсера из ',
        en: 'Click to select a parser from the ',
        uk: 'Натисніть для вибору парсера з ',
        zh: '点击从目录中选择解析器 '
      },

      bat_parser_current: {
        ru: 'Текущий выбор:',
        en: 'Current selection:',
        uk: 'Поточний вибір:',
        zh: '当前选择：'
      },
      bat_parser_none: {
        ru: 'Не выбран',
        en: 'Not selected',
        uk: 'Не вибрано',
        zh: '未选择'
      },

      bat_check_parsers: {
        ru: 'Проверить доступность парсеров',
        en: 'Check parsers availability',
        uk: 'Перевірити доступність парсерів',
        zh: '检查解析器可用性'
      },
      bat_check_parsers_desc: {
        ru: 'Выполняет проверку доступности парсеров',
        en: 'Checks parsers availability',
        uk: 'Виконує перевірку доступності парсерів',
        zh: '执行解析器可用性检查'
      },

      bat_check_search: {
        ru: 'Проверить доступность поиска',
        en: 'Check search availability',
        uk: 'Перевірити доступність пошуку',
        zh: '检查搜索可用性'
      },
      bat_check_search_desc: {
        ru: 'Выполняет проверку доступности поиска торрентов',
        en: 'Checks torrent search availability',
        uk: 'Виконує перевірку доступності пошуку торентів',
        zh: '执行种子搜索可用性检查'
      },

      bat_check_done: {
        ru: 'Проверку завершено',
        en: 'Check completed',
        uk: 'Перевірку завершено',
        zh: '检查完成'
      },
      bat_check_done_error: {
        ru: 'Проверку завершено (с ошибкой)',
        en: 'Check completed (with error)',
        uk: 'Перевірку завершено (з помилкою)',
        zh: '检查完成（有错误）'
      },

      bat_status_ok: {
        ru: 'Доступен',
        en: 'Available',
        uk: 'Доступний',
        zh: '可用'
      },
      bat_status_bad: {
        ru: 'Недоступен',
        en: 'Unavailable',
        uk: 'Недоступний',
        zh: '不可用'
      },
      bat_status_checking: {
        ru: 'Проверка…',
        en: 'Checking…',
        uk: 'Перевірка…',
        zh: '检查中…'
      },
      bat_status_unknown: {
        ru: 'Не проверен',
        en: 'Unchecked',
        uk: 'Не перевірено',
        zh: '未检查'
      },
      bat_status_search_ok: {
        ru: 'Поиск работает',
        en: 'Search works',
        uk: 'Пошук працює',
        zh: '搜索可用'
      },
      bat_status_search_empty: {
        ru: 'Поиск без результатов',
        en: 'Search: no results',
        uk: 'Пошук без результатів',
        zh: '搜索无结果'
      }
    });
  }

  var Lang = { translate: translate };

  /* =========================
   * 2) Список парсерів (твій актуальний)
   * ========================= */
  var parsersInfo = [
    {
      base: 'spawnum_duckdns_org_59117',
      name: 'SpawnUA',
      settings: { url: 'spawnum.duckdns.org:59117', key: '2', parser_torrent_type: 'jackett' }
    },
    {
      base: 'lampa_ua',
      name: 'LampaUA',
      settings: { url: 'jackettua.mooo.com', key: 'ua', parser_torrent_type: 'jackett' }
    },
    {
      base: 'jacred_pro',
      name: 'Jacred.pro',
      settings: { url: 'jacred.pro', key: '', parser_torrent_type: 'jackett' }
    },
    {
      base: 'jacred_xyz',
      name: 'Jacred.xyz',
      settings: { url: 'jacred.xyz', key: '', parser_torrent_type: 'jackett' }
    },
    {
      base: 'maxvol_pro',
      name: 'Maxvol.pro',
      settings: { url: 'jac.maxvol.pro', key: '1', parser_torrent_type: 'jackett' }
    },
    {
      base: 'redapi_cfhttp_top',
      name: 'RedApi',
      settings: { url: 'redapi.cfhttp.top', key: '', parser_torrent_type: 'jackett' }
    },
    {
      base: 'spawnpp_ua',
      name: 'Spawnpp-UA',
      settings: { url: 'spawn.pp.ua:59117', key: '2', parser_torrent_type: 'jackett' }
    }
  ];

  /* =========================
   * 3) Константи/хелпери
   * ========================= */
  var STORAGE_KEY = 'bat_url_two';
  var NO_PARSER = 'no_parser';

  var COLOR_OK = '1aff00';
  var COLOR_BAD = 'ff2e36';
  var COLOR_WARN = 'f3d900';
  var COLOR_UNKNOWN = '8c8c8c';

  // Кеш: health 30 сек, deep-search 15 хв
  var cache = {
    data: {},
    ttlHealth: 30 * 1000,
    ttlSearch: 15 * 60 * 1000,
    get: function (key) {
      var v = this.data[key];
      if (v && Date.now() < v.expiresAt) return v;
      return null;
    },
    set: function (key, value, ttl) {
      this.data[key] = {
        value: value,
        expiresAt: Date.now() + ttl
      };
    }
  };

  function notifyDone(textKey) {
    var text = Lampa.Lang.translate(textKey);
    try {
      if (Lampa.Noty && typeof Lampa.Noty.show === 'function') {
        Lampa.Noty.show(text);
        return;
      }
      if (Lampa.Toast && typeof Lampa.Toast.show === 'function') {
        Lampa.Toast.show(text);
        return;
      }
    } catch (e) {}
    alert(text);
  }

  function getProtocolFor(url) {
    // Підтримка url з протоколом або без нього
    var hasProtocol = /^https?:\/\//i.test(url);
    if (hasProtocol) return '';
    return location.protocol === 'https:' ? 'https://' : 'http://';
  }

  function getSelectedBase() {
    return Lampa.Storage.get(STORAGE_KEY, NO_PARSER);
  }

  function getParserByBase(base) {
    return parsersInfo.find(function (p) { return p.base === base; });
  }

  function applySelectedParser(base) {
    if (!base || base === NO_PARSER) return false;

    var p = getParserByBase(base);
    if (!p || !p.settings) return false;

    var settings = p.settings;
    var type = settings.parser_torrent_type || 'jackett';

    Lampa.Storage.set(type === 'prowlarr' ? 'prowlarr_url' : 'jackett_url', settings.url);
    Lampa.Storage.set(type === 'prowlarr' ? 'prowlarr_key' : 'jackett_key', settings.key || '');
    Lampa.Storage.set('parser_torrent_type', type);

    return true;
  }

  /* =========================
   * 4) Перевірки
   * ========================= */

  // HEALTH: для всіх парсерів
  function healthUrl(parser) {
    var protocol = getProtocolFor(parser.settings.url);
    var key = encodeURIComponent(parser.settings.key || '');
    var type = parser.settings.parser_torrent_type || 'jackett';

    if (type === 'prowlarr') {
      return protocol + parser.settings.url + '/api/v1/health?apikey=' + key;
    }
    return protocol + parser.settings.url + '/api/v2.0/indexers/status:healthy/results?apikey=' + key;
  }

  function runHealthChecks(parsers) {
    var map = {}; // base -> {status,color,labelKey}

    var requests = parsers.map(function (parser) {
      return new Promise(function (resolve) {
        var url = healthUrl(parser);
        var cacheKey = 'health::' + parser.base + '::' + url;
        var cached = cache.get(cacheKey);
        if (cached) {
          map[parser.base] = cached.value;
          resolve();
          return;
        }

        $.ajax({
          url: url,
          method: 'GET',
          timeout: 5000,
          success: function (resp, txt, xhr) {
            var ok = xhr && xhr.status === 200;
            var val = {
              color: ok ? COLOR_OK : COLOR_BAD,
              labelKey: ok ? 'bat_status_ok' : 'bat_status_bad'
            };
            map[parser.base] = val;
            cache.set(cacheKey, val, cache.ttlHealth);
            resolve();
          },
          error: function () {
            var val = { color: COLOR_BAD, labelKey: 'bat_status_bad' };
            map[parser.base] = val;
            cache.set(cacheKey, val, cache.ttlHealth);
            resolve();
          }
        });
      });
    });

    return Promise.all(requests).then(function () { return map; });
  }

  // DEEP SEARCH: тільки для вибраного
  function deepSearchUrl(parser, query) {
    var protocol = getProtocolFor(parser.settings.url);
    var key = encodeURIComponent(parser.settings.key || '');
    var q = encodeURIComponent(query);

    // NB: використовуємо /indexers/all/results — як у твоїй поточній логіці.
    // Це “глибша” перевірка і запускається тільки по кнопці.
    return protocol + parser.settings.url
      + '/api/v2.0/indexers/all/results'
      + '?apikey=' + key
      + '&Query=' + q
      + '&Category=2000';
  }

  function runDeepSearchCheckForSelected() {
    var base = getSelectedBase();
    var parser = getParserByBase(base);
    if (!parser) return Promise.resolve({ ok: false, error: true });

    var deepKey = 'search::' + parser.base;
    var cached = cache.get(deepKey);
    if (cached) return Promise.resolve(cached.value);

    var SAFE_QUERIES = ['1080p', 'bluray', 'x264', '2022'];
    var query = SAFE_QUERIES[Math.floor(Math.random() * SAFE_QUERIES.length)];
    var url = deepSearchUrl(parser, query);

    return new Promise(function (resolve) {
      $.ajax({
        url: url,
        method: 'GET',
        timeout: 6000,
        success: function (data) {
          var has = !!(data && data.Results && data.Results.length);
          var res = { ok: true, hasResults: has };
          cache.set(deepKey, res, cache.ttlSearch);
          resolve(res);
        },
        error: function () {
          var res = { ok: false, error: true };
          cache.set(deepKey, res, cache.ttlSearch);
          resolve(res);
        }
      });
    });
  }

  /* =========================
   * 5) Модалка (UI)
   * ========================= */

  function injectStyleOnce() {
    if (window.__bat_parser_modal_style__) return;
    window.__bat_parser_modal_style__ = true;

    var css =
      ".bat-parser-modal{display:flex;flex-direction:column;gap:1em}" +
      ".bat-parser-modal__head{display:flex;align-items:center;justify-content:space-between;gap:1em}" +
      ".bat-parser-modal__current-label{font-size:.9em;opacity:.7}" +
      ".bat-parser-modal__current-value{font-size:1.1em}" +
      ".bat-parser-modal__list{display:flex;flex-direction:column;gap:.6em}" +
      ".bat-parser-modal__item{position:relative;display:flex;align-items:center;justify-content:space-between;gap:1em;padding:.8em 1em .8em 1.8em;border-radius:.7em;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08)}" +
      ".bat-parser-modal__item::before{content:'';position:absolute;left:.8em;top:50%;width:.55em;height:.55em;border-radius:50%;background:var(--bat-status-color," + COLOR_UNKNOWN + ");transform:translateY(-50%);box-shadow:0 0 .6em rgba(0,0,0,.3)}" +
      ".bat-parser-modal__item.is-selected,.bat-parser-modal__item.focus{border-color:#fff}" +
      ".bat-parser-modal__name{font-size:1em}" +
      ".bat-parser-modal__status{font-size:.85em;opacity:.75;text-align:right}" +
      ".bat-parser-modal__actions{display:flex;gap:.6em;flex-wrap:wrap}" +
      ".bat-parser-modal__action{padding:.55em .9em;border-radius:.6em;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2)}" +
      ".bat-parser-modal__action.focus{border-color:#fff}" +
      ".bat-status-ok{--bat-status-color:" + COLOR_OK + "}" +
      ".bat-status-bad{--bat-status-color:" + COLOR_BAD + "}" +
      ".bat-status-warn{--bat-status-color:" + COLOR_WARN + "}" +
      ".bat-status-unknown{--bat-status-color:" + COLOR_UNKNOWN + "}" +
      ".bat-status-checking{--bat-status-color:" + COLOR_WARN + "}";

    var style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }

  function buildParserItem(parser) {
    var item = $(
      "<div class='bat-parser-modal__item selector bat-status-unknown' data-base='" + parser.base + "'>" +
        "<div class='bat-parser-modal__name'></div>" +
        "<div class='bat-parser-modal__status'></div>" +
      "</div>"
    );
    item.find('.bat-parser-modal__name').text(parser.name);
    item.find('.bat-parser-modal__status').text(Lampa.Lang.translate('bat_status_unknown'));
    return item;
  }

  function setItemStatus(item, kind, labelKey) {
    item
      .removeClass('bat-status-ok bat-status-bad bat-status-warn bat-status-unknown bat-status-checking')
      .addClass(kind);
    item.find('.bat-parser-modal__status').text(Lampa.Lang.translate(labelKey));
  }

  function applySelection(list, base) {
    list.find('.bat-parser-modal__item').removeClass('is-selected');
    list.find("[data-base='" + base + "']").addClass('is-selected');
  }

  function updateCurrentLabel(wrapper, base) {
    var parser = getParserByBase(base);
    var label = parser ? parser.name : Lampa.Lang.translate('bat_parser_none');
    wrapper.find('.bat-parser-modal__current-value').text(label);
  }

  function openParserModal() {
    injectStyleOnce();

    // Зібрати список
    var selected = getSelectedBase();
    var modal = $(
      "<div class='bat-parser-modal'>" +
        "<div class='bat-parser-modal__head'>" +
          "<div class='bat-parser-modal__current'>" +
            "<div class='bat-parser-modal__current-label'></div>" +
            "<div class='bat-parser-modal__current-value'></div>" +
          "</div>" +
        "</div>" +
        "<div class='bat-parser-modal__list'></div>" +
        "<div class='bat-parser-modal__actions'></div>" +
      "</div>"
    );

    modal.find('.bat-parser-modal__current-label').text(Lampa.Lang.translate('bat_parser_current'));
    updateCurrentLabel(modal, selected);

    var list = modal.find('.bat-parser-modal__list');
    parsersInfo.forEach(function (p) {
      var item = buildParserItem(p);

      // Вибір парсера
      item.on('hover:enter', function () {
        Lampa.Storage.set(STORAGE_KEY, p.base);
        applySelectedParser(p.base);
        applySelection(list, p.base);
        updateCurrentLabel(modal, p.base);
      });

      list.append(item);
    });

    applySelection(list, selected);

    // Кнопки внизу списку (як ти хотів)
    var actions = modal.find('.bat-parser-modal__actions');

    var btnHealth = $("<div class='bat-parser-modal__action selector'></div>");
    btnHealth.text(Lampa.Lang.translate('bat_check_parsers'));

    var btnSearch = $("<div class='bat-parser-modal__action selector'></div>");
    btnSearch.text(Lampa.Lang.translate('bat_check_search'));

    actions.append(btnHealth).append(btnSearch);

    // Функція: оновити статуси в UI за map
    function applyHealthMap(statusMap) {
      list.find('.bat-parser-modal__item').each(function () {
        var it = $(this);
        var base = it.data('base');
        var st = statusMap[base];
        if (!st) {
          setItemStatus(it, 'bat-status-unknown', 'bat_status_unknown');
          return;
        }
        if (st.color === COLOR_OK) setItemStatus(it, 'bat-status-ok', st.labelKey);
        else setItemStatus(it, 'bat-status-bad', st.labelKey);
      });
    }

    // Перша перевірка при відкритті модалки: health-check (як ти хотів)
    function runHealthUI() {
      // “checking…”
      list.find('.bat-parser-modal__item').each(function () {
        setItemStatus($(this), 'bat-status-checking', 'bat_status_checking');
      });

      return runHealthChecks(parsersInfo)
        .then(function (map) {
          applyHealthMap(map);
          notifyDone('bat_check_done');
        })
        .catch(function () {
          notifyDone('bat_check_done_error');
        });
    }

    // Кнопка #1: health-check
    btnHealth.on('hover:enter', function () {
      runHealthUI();
    });

    // Кнопка #2: deep-search для вибраного
    btnSearch.on('hover:enter', function () {
      var base = getSelectedBase();
      if (!base || base === NO_PARSER) {
        notifyDone('bat_check_done_error');
        return;
      }

      var selectedItem = list.find("[data-base='" + base + "']");
      setItemStatus(selectedItem, 'bat-status-checking', 'bat_status_checking');

      runDeepSearchCheckForSelected()
        .then(function (res) {
          if (res.ok && res.hasResults) {
            setItemStatus(selectedItem, 'bat-status-ok', 'bat_status_search_ok');
          } else if (res.ok && !res.hasResults) {
            setItemStatus(selectedItem, 'bat-status-warn', 'bat_status_search_empty');
          } else {
            setItemStatus(selectedItem, 'bat-status-bad', 'bat_status_bad');
          }
          notifyDone('bat_check_done');
        })
        .catch(function () {
          setItemStatus(selectedItem, 'bat-status-bad', 'bat_status_bad');
          notifyDone('bat_check_done_error');
        });
    });

    // Відкрити модалку
    var firstSelectable = list.find('.bat-parser-modal__item').first();

    Lampa.Modal.open({
      title: Lampa.Lang.translate('bat_parser'),
      html: modal,
      size: 'medium',
      scroll_to_center: true,
      select: firstSelectable,
      onBack: function () {
        Lampa.Modal.close();
        Lampa.Controller.toggle('settings_component');
      }
    });

    // Автозапуск health-check на відкритті
    runHealthUI();
  }

  /* =========================
   * 6) Інтеграція в Налаштування → Парсер
   * =========================
   * Замість select — кнопка, що відкриває модалку.
   */
  function parserSetting() {
    // застосувати вибраний парсер при старті
    applySelectedParser(getSelectedBase());

    Lampa.SettingsApi.addParam({
      component: 'parser',
      param: { name: 'bat_parser_manage', type: 'button' },
      field: {
        name: Lampa.Lang.translate('bat_parser'),
        description: Lampa.Lang.translate('bat_parser_description') + " " + parsersInfo.length
      },
      onChange: function () {
        openParserModal();
      },
      onRender: function (item) {
        setTimeout(function () {
          // показуємо лише якщо parser_use увімкнений
          if (Lampa.Storage.field('parser_use')) item.show();
          else item.hide();

          // розміщуємо біля секції parser
          var parserUse = $('div[data-name="parser_use"]').first();
          if (parserUse.length) item.insertAfter(parserUse);
        });
      }
    });
  }

  var Parser = { parserSetting: parserSetting };

  /* =========================
   * 7) Запуск плагіна
   * ========================= */
  Lampa.Platform.tv();

  function add() {
    Lang.translate();
    Parser.parserSetting();
  }

  function startPlugin() {
    window.plugin_batpublictorr_ready = true;

    if (window.appready) add();
    else {
      Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') add();
      });
    }
  }

  if (!window.plugin_batpublictorr_ready) startPlugin();

})();

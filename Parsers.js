// IIFE (Immediately Invoked Function Expression) - самовикликаюча анонімна функція.
// Створює приватний простір, щоб уникнути конфліктів з іншими скриптами.
(function () {
  'use strict';

  /**
   * Локалізація (переклади)
   */
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
      }
    });
  }

  var Lang = {
    translate: translate
  };

  /**
   * ============================
   * СПИСОК ПАРСЕРІВ (твій)
   * ============================
   * ВАЖЛИВО:
   * - url без http/https (можна додати, код підтримує і так, і так)
   * - key як рядок
   * - base унікальний
   */
  var parsersInfo = [
    {
      base: 'spawnum_duckdns_org_59117',
      name: 'SpawnUA',
      settings: {
        url: 'spawnum.duckdns.org:59117',
        key: '2',
        parser_torrent_type: 'jackett'
      }
    },
    {
      base: 'lampa_ua',
      name: 'LampaUA',
      settings: {
        url: 'jackettua.mooo.com',
        key: 'ua',
        parser_torrent_type: 'jackett'
      }
    },
    {
      base: 'jacred_pro',
      name: 'Jacred.pro',
      settings: {
        url: 'jacred.pro',
        key: '',
        parser_torrent_type: 'jackett'
      }
    },
    {
      base: 'jacred_xyz',
      name: 'Jacred.xyz',
      settings: {
        url: 'jacred.xyz',
        key: '',
        parser_torrent_type: 'jackett'
      }
    },
    {
      base: 'maxvol_pro',
      name: 'Maxvol.pro',
      settings: {
        url: 'jac.maxvol.pro',
        key: '1',
        parser_torrent_type: 'jackett'
      }
    },
    {
      base: 'redapi_cfhttp_top',
      name: 'RedApi',
      settings: {
        url: 'redapi.cfhttp.top',
        key: '',
        parser_torrent_type: 'jackett'
      }
    },
    {
      base: 'spawnpp_ua',
      name: 'Spawnpp-UA',
      settings: {
        url: 'spawn.pp.ua:59117',
        key: '2',
        parser_torrent_type: 'jackett'
      }
    }
  ];

  /**
   * Протокол для запитів (http або https) залежно від сторінки.
   * ВАЖЛИВО: якщо Lampa відкрито по https, а парсер доступний лише по http,
   * health-check може показувати "червоний".
   */
  var proto = location.protocol === "https:" ? 'https://' : 'http://';

  /**
   * Кеш для health-check (30 секунд) і для deep-search (15 хв).
   * Структура:
   * - cache[myLink] = { color, timestamp }
   * - cache['search_' + base] = timestamp
   */
  var cache = {};

  /**
   * ===================================================
   * HEALTH-CHECK: перевірка доступності парсерів (Jackett/Prowlarr)
   * ===================================================
   * Логіка:
   * - Для кожного парсера робимо GET на health endpoint
   * - Якщо HTTP 200 => зелений
   * - Якщо інше / помилка => червоний
   * - Результат фарбує елементи в списку вибору (коли список відкритий)
   * - Кеш 30 секунд
   */
  function checkAlive(type) {
    if (type !== 'parser') return;

    var requests = parsersInfo.map(function (parser) {
      // Підтримка url як з протоколом (http/https), так і без нього
      var hasProtocol = /^https?:\/\//i.test(parser.settings.url);
      var protocol = hasProtocol ? '' : proto;

      // Універсально: ключ береться з settings.key (твій актуальний список)
      var apiKey = (parser.settings.key || '');

      // Health endpoint
      var endPoint = (parser.settings.parser_torrent_type === 'prowlarr')
        ? '/api/v1/health?apikey=' + encodeURIComponent(apiKey)
        : '/api/v2.0/indexers/status:healthy/results?apikey=' + encodeURIComponent(apiKey);

      var myLink = protocol + parser.settings.url + endPoint;

      // Знаходимо пункт у випадаючому списку за назвою (важливо, щоб name збігався з UI)
      var mySelector = $('div.selectbox-item__title').filter(function () {
        return $(this).text().trim() === parser.name;
      });

      // Кеш 30 секунд
      if (cache[myLink] && cache[myLink].timestamp > Date.now() - 30000) {
        $(mySelector).css('color', cache[myLink].color);
        return Promise.resolve();
      }

      return new Promise(function (resolve) {
        $.ajax({
          url: myLink,
          method: 'GET',
          timeout: 5000,
          success: function (response, textStatus, xhr) {
            var color = (xhr && xhr.status === 200) ? '1aff00' : 'ff2e36';
            $(mySelector).css('color', color);

            cache[myLink] = {
              color: color,
              timestamp: Date.now()
            };

            resolve();
          },
          error: function () {
            $(mySelector).css('color', 'ff2e36');

            cache[myLink] = {
              color: 'ff2e36',
              timestamp: Date.now()
            };

            resolve();
          }
        });
      });
    });

    return Promise.all(requests).then(function () {
      console.log('All health-check requests completed');
    });
  }

  /**
   * ===================================================
   * DEEP SEARCH CHECK: перевірка "чи доступний пошук торентів"
   * ===================================================
   * Логіка:
   * - Перевіряємо ТІЛЬКИ обраний зараз парсер
   * - Робимо один запит до /api/v2.0/indexers/all/results
   * - Якщо Results.length > 0 => зелений
   * - Якщо Results порожній => жовтий (API живий, але конкретно тут може не знайти)
   * - Кеш 15 хв (щоб не було банів)
   *
   * УВАГА: ця перевірка може створювати навантаження на індексери/трекери,
   * тому вона запускається ТІЛЬКИ по кнопці.
   */
  function deepSearchCheck() {
    var selectedId = Lampa.Storage.get("bat_url_two");
    var parser = parsersInfo.find(function (p) {
      return p.base === selectedId;
    });

    if (!parser) return;

    // кеш 15 хв
    var deepKey = 'search_' + parser.base;
    if (cache[deepKey] && Date.now() - cache[deepKey] < 900000) {
      console.log('Deep search check from cache');
      return;
    }

    // підтримка url з протоколом або без
    var hasProtocol = /^https?:\/\//i.test(parser.settings.url);
    var protocol = hasProtocol ? '' : proto;

    // "безпечні" запити (не “test/asdf”)
    var SAFE_QUERIES = ['1080p', 'bluray', 'x264', '2022'];
    var query = SAFE_QUERIES[Math.floor(Math.random() * SAFE_QUERIES.length)];

    var url =
      protocol + parser.settings.url +
      '/api/v2.0/indexers/all/results' +
      '?apikey=' + encodeURIComponent(parser.settings.key || '') +
      '&Query=' + encodeURIComponent(query) +
      '&Category=2000';

    console.log('Deep search check:', url);

    $.ajax({
      url: url,
      method: 'GET',
      timeout: 6000,
      success: function (data) {
        // Фарбуємо саме вибраний пункт у списку (коли список відкритий)
        var selector = $('div.selectbox-item__title').filter(function () {
          return $(this).text().trim() === parser.name;
        });

        if (data && data.Results && data.Results.length) {
          $(selector).css('color', '1aff00'); // зелений
        } else {
          $(selector).css('color', 'f3d900'); // жовтий
        }

        cache[deepKey] = Date.now();
      },
      error: function () {
        alert('Помилка перевірки пошуку');
      }
    });
  }

  /**
   * Подія Lampa: коли відкривається випадаючий список select,
   * робимо "першу" перевірку (як ти хотів).
   */
  Lampa.Controller.listener.follow('toggle', function (e) {
    if (e.name === 'select') {
      checkAlive("parser");
    }
  });

  /**
   * Застосувати вибраний парсер у глобальні налаштування Lampa
   */
  function changeParser() {
    var selectedBase = Lampa.Storage.get("bat_url_two");
    var selectedParser = parsersInfo.find(function (parser) {
      return parser.base === selectedBase;
    });

    if (selectedParser) {
      var settings = selectedParser.settings;
      Lampa.Storage.set(
        settings.parser_torrent_type === 'prowlarr' ? "prowlarr_url" : "jackett_url",
        settings.url
      );
      Lampa.Storage.set(
        settings.parser_torrent_type === 'prowlarr' ? "prowlarr_key" : "jackett_key",
        settings.key
      );
      Lampa.Storage.set("parser_torrent_type", settings.parser_torrent_type);
    } else {
      console.warn("Selected parser not found in parsersInfo");
    }
  }

  /**
   * Значення для select: { base: name }
   */
  var s_values = parsersInfo.reduce(function (prev, parser) {
    prev[parser.base] = parser.name;
    return prev;
  }, {
    no_parser: 'Обрати парсер'
  });

  /**
   * ===================================================
   * UI: Налаштування → Парсер
   * - Select "Каталог парсерів"
   * - Кнопка #1 "Перевірити доступність парсерів"
   * - Кнопка #2 "Перевірити доступність пошуку"
   * ===================================================
   *
   * Кнопки розміщуються ПІСЛЯ select на сторінці налаштувань.
   */
  function parserSetting() {
    // 1) Select (каталог парсерів)
    Lampa.SettingsApi.addParam({
      component: 'parser',
      param: {
        name: 'bat_url_two',
        type: 'select',
        values: s_values,
        "default": 'no_parser'
      },
      field: {
        name:
          "<div class=\"settings-folder\" style=\"padding:0!important\">" +
            "<div style=\"font-size:1.0em\">" + Lampa.Lang.translate('bat_parser') + "</div>" +
          "</div>",
        description: Lampa.Lang.translate('bat_parser_description') + " " + parsersInfo.length
      },
      onChange: function () {
        changeParser();
        Lampa.Settings.update();
      },
      onRender: function (item) {
        $('.settings-param__value p.parserName').remove();
        changeParser();

        setTimeout(function () {
          if (Lampa.Storage.field('parser_use')) {
            item.show();
            $('.settings-param__name', item).css('color', 'f3d900');
            $('div[data-name="bat_url_two"]').insertAfter('div[data-children="parser"]');
          } else {
            item.hide();
          }
        });
      }
    });

    // 2) Кнопка №1 – health-check всіх парсерів
    Lampa.SettingsApi.addParam({
      component: 'parser',
      param: {
        name: 'bat_check_parsers',
        type: 'button'
      },
      field: {
        name: 'Перевірити доступність парсерів',
        description: 'Виконує перевірку доступності парсерів'
      },
      onChange: function () {
        checkAlive("parser");
      },
      onRender: function (item) {
        setTimeout(function () {
          // вставляємо кнопку одразу після select
          var select = $('div[data-name="bat_url_two"]').first();
          if (select.length) item.insertAfter(select);

          if (Lampa.Storage.field('parser_use')) item.show();
          else item.hide();
        });
      }
    });

    // 3) Кнопка №2 – deep-search для обраного парсера
    Lampa.SettingsApi.addParam({
      component: 'parser',
      param: {
        name: 'bat_check_search',
        type: 'button'
      },
      field: {
        name: 'Перевірити доступність пошуку',
        description: 'Виконує перевірку доступності пошуку торентів'
      },
      onChange: function () {
        deepSearchCheck();
      },
      onRender: function (item) {
        setTimeout(function () {
          // вставляємо кнопку після першої кнопки
          var btn1 = $('div[data-name="bat_check_parsers"]').first();
          if (btn1.length) item.insertAfter(btn1);

          if (Lampa.Storage.field('parser_use')) item.show();
          else item.hide();
        });
      }
    });
  }

  var Parser = {
    parserSetting: parserSetting
  };

  Lampa.Platform.tv();

  /**
   * Ініціалізація плагіна
   * ВАЖЛИВО: ми НЕ запускаємо setInterval — лише:
   * - автоматична перевірка при відкритті select
   * - ручні перевірки по кнопках
   */
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

// IIFE (Immediately Invoked Function Expression) - самовикликаюча анонімна функція.
// Створює приватний простір, щоб уникнути конфліктів з іншими скриптами.
(function () {
  // 'use strict'; - вмикає строгий режим JavaScript. Це допомагає уникнути поширених помилок.
  'use strict';

  /**
   * Функція для додавання перекладів (локалізації) в Lampa.
   * Додає текстові рядки для різних мов (ru, en, uk, zh).
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
          },
      });
  }
  // Об'єкт-модуль для роботи з мовними функціями.
  var Lang = {
      translate: translate
  };

  /**
   * Основний масив, що містить інформацію про всі доступні парсери.
   * Кожен об'єкт представляє один парсер з його унікальними налаштуваннями.
   */
  var parsersInfo = [
    {
      // Перший парсер: Spawn UA (V1).
      base: 'spawnum_duckdns_org_59117', // Унікальний ідентифікатор
      name: 'Spawn UA (V1)', // Назва, що відображається користувачу
      settings: {
          url: 'spawnum.duckdns.org:59117', // Адреса сервера парсера
          key: '2', // Ключ API
          parser_torrent_type: 'jackett' // Тип парсера (jackett або prowlarr)
      }
    }, 
    {
      // Другий парсер: Spawn UA (V2).
      base: 'spawnum_duckdns_org_49117', // Новий унікальний ідентифікатор
      name: 'Spawn UA (V2)', // Нова назва
      settings: {
          url: 'spawnum.duckdns.org:49117', // Нова адреса
          key: '2', // Новий ключ API
          parser_torrent_type: 'jackett' // Тип парсера
      }
    },
    {
      // Третій парсер: RedApi
      base: 'redapi_cfhttp_top',
      name: 'RedApi',
      settings: {
          url: 'redapi.cfhttp.top',
          key: '',
          parser_torrent_type: 'jackett'
      }
    }, 
    {
      // Четвертий парсер: Jacred viewbox
      base: 'jacred_viewbox_dev',
      name: 'Jacred Viewbox',
      settings: {
          url: 'jacred.viewbox.dev',
          key: 'viewbox',
          parser_torrent_type: 'jackett'
      }
    }, 
    {
      // П'ятий парсер: Jacred pro
      base: 'jacred_pro',
      name: 'Jacred Pro',
      settings: {
          url: 'jacred.pro',
          key: '',
          parser_torrent_type: 'jackett'
      }
    }
  ];

  // Визначаємо протокол (http або https) залежно від поточного протоколу сторінки.
  var proto = location.protocol === "https:" ? 'https://' : 'http://';
  // Об'єкт для кешування результатів перевірки доступності парсерів.
  var cache = {};
  // Змінна для зберігання ідентифікатора інтервалу періодичної перевірки.
  var checkInterval;

  /**
   * Функція для перевірки статусу (доступності) парсерів.
   * @param {string} type - Тип перевірки (в даному випадку завжди 'parser').
   */
  function checkAlive(type) {
    if (type === 'parser') {
      // Створюємо масив запитів до кожного парсера за допомогою .map()
      var requests = parsersInfo.map(function (parser) {
        // Формуємо кінцеву точку (endpoint) для API запиту залежно від типу парсера.
        var endPoint = parser.settings.parser_torrent_type === 'prowlarr' ? 
            '/api/v1/health?apikey=' + parser.settings.key : 
            "/api/v2.0/indexers/status:healthy/results?apikey=" + parser.settings.key;

        // Повне посилання для AJAX-запиту.
        var myLink = proto + parser.settings.url + endPoint;

        // Знаходимо елемент в інтерфейсі Lampa, що відповідає парсеру, за його назвою.
        var mySelector = $('div.selectbox-item__title').filter(function () {
            return $(this).text().trim() === parser.name;
        });

        // Перевіряємо, чи є в кеші свіжий результат (не старіший за 30 секунд).
        if (cache[myLink] && cache[myLink].timestamp > Date.now() - 30000) {
            console.log('Використання кешованої відповіді для', myLink);
            var color = cache[myLink].color;
            // Встановлюємо колір тексту залежно від кешованого результату.
            $(mySelector).css('color', color);
            return Promise.resolve(); // Повертаємо вирішений проміс, щоб не робити новий запит.
        }

        // Повертаємо новий Promise, який виконає AJAX-запит.
        return new Promise(function (resolve) {
            $.ajax({
                url: myLink,
                method: 'GET',
                timeout: 5000, // Таймаут запиту - 5 секунд.
                // Функція, що виконується при успішному запиті.
                success: function success(response, textStatus, xhr) {
                    var color;
                    // Якщо статус відповіді 200 (OK), парсер працює.
                    if (xhr.status === 200) {
                        color = '1aff00'; // Зелений колір
                    // Якщо статус 401 (Unauthorized), ключ API невірний.
                    } else if (xhr.status === 401) {
                        color = 'ff2e36'; // Червоний колір
                    // В інших випадках також вважаємо, що є помилка.
                    } else {
                        color = 'ff2e36'; // Червоний колір
                    }
                    $(mySelector).css('color', color);

                    // Якщо колір було визначено, кешуємо результат.
                    if (color) {
                        cache[myLink] = {
                            color: color,
                            timestamp: Date.now()
                        };
                    }
                },
                // Функція, що виконується при помилці запиту (напр., таймаут, недоступність).
                error: function error() {
                    $(mySelector).css('color', 'ff2e36'); // Червоний колір
                },
                // Функція, що виконується завжди після success або error.
                complete: function complete() {
                    return resolve(); // Вирішуємо проміс, сигналізуючи про завершення запиту.
                }
            });
        });
      });
      // Promise.all чекає, поки всі запити в масиві `requests` завершаться.
      return Promise.all(requests).then(function () {
          console.log('Усі запити на перевірку парсерів завершено');
      });
    }
  }

  /**
   * Запускає періодичну перевірку доступності парсерів кожні 30 секунд.
   */
  function startPeriodicCheck() {
      checkAlive("parser"); // Перший запуск одразу.
      checkInterval = setInterval(function() {
          checkAlive("parser");
      }, 30000); // Повторювати кожні 30000 мс.
  }

  /**
   * Зупиняє періодичну перевірку.
   */
  function stopPeriodicCheck() {
      if (checkInterval) {
          clearInterval(checkInterval);
      }
  }

  // Слухач подій Lampa. Спрацьовує, коли відкривається випадаючий список.
  Lampa.Controller.listener.follow('toggle', function (e) {
      if (e.name === 'select') {
          // Запускаємо перевірку парсерів, коли користувач відкриває список вибору.
          checkAlive("parser");
      }
  });

  /**
   * Змінює налаштування парсера в сховищі Lampa на основі вибору користувача.
   */
  function changeParser() {
      // Отримуємо ідентифікатор вибраного парсера зі сховища.
      var jackettUrlTwo = Lampa.Storage.get("bat_url_two");
      // Знаходимо об'єкт парсера в масиві `parsersInfo` за його ідентифікатором.
      var selectedParser = parsersInfo.find(function (parser) {
          return parser.base === jackettUrlTwo;
      });
      // Якщо парсер знайдено, оновлюємо глобальні налаштування Lampa.
      if (selectedParser) {
          var settings = selectedParser.settings;
          Lampa.Storage.set(settings.parser_torrent_type === 'prowlarr' ? "prowlarr_url" : "jackett_url", settings.url);
          Lampa.Storage.set(settings.parser_torrent_type === 'prowlarr' ? "prowlarr_key" : "jackett_key", settings.key);
          Lampa.Storage.set("parser_torrent_type", settings.parser_torrent_type);
      } else {
          console.warn("Обраний URL парсера не знайдено в списку parsersInfo");
      }
  }

  // Готуємо об'єкт `s_values` для випадаючого списку в налаштуваннях.
  // Використовуємо .reduce() для перетворення масиву `parsersInfo` в об'єкт формату {id: name}.
  var s_values = parsersInfo.reduce(function (prev, _ref) {
      var base = _ref.base,
          name = _ref.name;
      prev[base] = name;
      return prev;
  }, {
      no_parser: 'Обрати парсер' // Додаємо опцію за замовчуванням.
  });

  /**
   * Створює та додає елемент налаштувань для вибору парсера в інтерфейс Lampa.
   */
  function parserSetting() {
      Lampa.SettingsApi.addParam({
          component: 'parser', // Компонент, до якого належить налаштування.
          param: {
              name: 'bat_url_two', // Назва параметра в сховищі.
              type: 'select', // Тип елемента - випадаючий список.
              values: s_values, // Значення для списку.
              "default": 'no_parser' // Значення за замовчуванням.
          },
          field: {
              name: "<div class=\"settings-folder\" style=\"padding:0!important\"><div style=\"font-size:1.0em\">".concat(Lampa.Lang.translate('bat_parser'), "</div></div>"), // Заголовок.
              description: "".concat(Lampa.Lang.translate('bat_parser_description'), " ").concat(parsersInfo.length) // Опис під заголовком.
          },
          // Функція, що викликається при зміні значення.
          onChange: function onChange(value) {
              changeParser(); // Оновлюємо налаштування.
              Lampa.Settings.update(); // Оновлюємо інтерфейс налаштувань.
          },
          // Функція, що викликається при рендерінгу елемента.
          onRender: function onRender(item) {
              changeParser(); // Синхронізуємо налаштування при завантаженні.
          }
      });
  }

  // Об'єкт-модуль для функцій, пов'язаних з парсером.
  var Parser = {
      parserSetting: parserSetting
  };
  
  /**
   * Головна функція для ініціалізації плагіна.
   */
  function add() {
      Lang.translate(); // Додаємо переклади.
      Parser.parserSetting(); // Додаємо налаштування в інтерфейс.
      startPeriodicCheck(); // Запускаємо періодичну перевірку.
  }

  /**
   * Функція-завантажувач. Перевіряє, чи готова програма Lampa, і запускає плагін.
   */
  function startPlugin() {
      // Встановлюємо прапорець, що плагін завантажено, щоб уникнути повторного запуску.
      window.plugin_batpublictorr_ready = true;
      // Якщо Lampa вже готова, запускаємо `add()`.
      if (window.appready) add();
      // Інакше, чекаємо на подію 'ready' від Lampa.
      else {
          Lampa.Listener.follow('app', function (e) {
              if (e.type === 'ready') add();
          });
      }
  }

  // Запускаємо плагін, якщо він ще не був запущений.
  if (!window.plugin_batpublictorr_ready) startPlugin();

  // Додаємо слухача події 'unload' (коли користувач закриває сторінку).
  // Це потрібно для очищення ресурсів, зокрема, для зупинки інтервалу.
  window.addEventListener('unload', function() {
      stopPeriodicCheck();
  });

})();

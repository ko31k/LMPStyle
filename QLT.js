(function() {
    if (window.lampaQualityPlugin) {
        console.log("LQE-LOG: Lampa Quality Enhancer already initialized.");
        return;
    }

    var LQE_CONFIG = {
        CACHE_VERSION: 2, // Версія кешу для інвалідації старих даних
        LOGGING_GENERAL: false, // Загальне логування для налагодження
        LOGGING_QUALITY: false, // Логування процесу визначення якості
        LOGGING_CARDLIST: false, // Логування для спискових карток
        CACHE_VALID_TIME_MS: 24 * 60 * 60 * 1000, // Час життя кешу (24 години)
        CACHE_REFRESH_THRESHOLD_MS: 12 * 60 * 60 * 1000, // Час для фонового оновлення кешу (12 годин)
        CACHE_KEY: 'lampa_quality_cache', // Ключ для зберігання кешу в LocalStorage
        JACRED_PROTOCOL: 'http://', // Протокол для API JacRed
        JACRED_URL: 'jacred.xyz', // Домен API JacRed
        JACRED_API_KEY: '', // Ключ API (не використовується в даній версії)
        PROXY_LIST: [ // Список проксі серверів для обходу CORS обмежень
            'http://api.allorigins.win/raw?url=',
            'http://cors.bwa.workers.dev/'
        ],
        PROXY_TIMEOUT_MS: 4000, // Таймаут для проксі запитів (4 секунди)
        SHOW_QUALITY_FOR_TV_SERIES: true, // ✅ Показувати якість для серіалів
        MAX_PARALLEL_REQUESTS: 12, // Максимальна кількість паралельних запитів
        
        USE_SIMPLE_QUALITY_LABELS: true, // ✅ Використовувати спрощені мітки якості (4K, FHD, TS, TC тощо) "true" - так /  "false" - ні
        
        // Стилі для відображення якості на повній картці
        FULL_CARD_LABEL_BORDER_COLOR: '#FFFFFF',
        FULL_CARD_LABEL_TEXT_COLOR: '#FFFFFF',
        FULL_CARD_LABEL_FONT_WEIGHT: 'normal',
        FULL_CARD_LABEL_FONT_SIZE: '1.2em',
        FULL_CARD_LABEL_FONT_STYLE: 'normal',
        
        // Стилі для відображення якості на спискових картках
        LIST_CARD_LABEL_BORDER_COLOR: '#3DA18D',
        LIST_CARD_LABEL_BACKGROUND_COLOR: 'rgba(61, 161, 141, 0.9)', //Стандартна прозорість фону 0.8 (1 - фон не прозорий)
        LIST_CARD_LABEL_BACKGROUND_TRANSPARENT: false,
        LIST_CARD_LABEL_TEXT_COLOR: '#FFFFFF',
        LIST_CARD_LABEL_FONT_WEIGHT: '600',
        LIST_CARD_LABEL_FONT_SIZE: '1.1em',
        LIST_CARD_LABEL_FONT_STYLE: 'normal',

        // Додаткові налаштування для відображення мітки якості на постері у списку
        // Якщо true — плашка прилипає до самого краю постера (без виходу за межі).
        // Якщо false — плашка трохи вилітає за межі постера (телевізійний стиль).
        LIST_CARD_LABEL_STICK_TO_POSTER_EDGE: false,

        // z-index плашки якості на картках списку (не ставимо занадто великий, щоб не перекривати інтерфейс ТВ-боксу)
        LIST_CARD_LABEL_Z_INDEX: 20,
        
        // Ручні перевизначення якості для конкретних ID контенту
        MANUAL_OVERRIDES: {
            '338969': { 
                quality_code: 2160, 
                full_label: '4K WEB-DL', //✅ Повна мітка
                simple_label: '4K'       //✅ Спрощена мітка
            },
            '654028': { 
                quality_code: 2160, 
                full_label: '4K WEB-DL', //✅ Повна мітка
                simple_label: '4K'       //✅ Спрощена мітка
            },
            '12556': { 
                quality_code: 1080, 
                full_label: '1080 ВDRemux', //✅ Повна мітка
                simple_label: 'FHD'         //✅ Спрощена мітка
            },
            '604079': { 
                quality_code: 2160, 
                full_label: '4K WEB-DL', //✅ Повна мітка
                simple_label: '4K'       //✅ Спрощена мітка
            },
            '1267905': { 
                quality_code: 2160, 
                full_label: '4K WEB-DL', //✅ Повна мітка
                simple_label: '4K'       //✅ Спрощена мітка
            }

            /*'Тут ID фільму': { 
                quality_code: 1080, 
                full_label: '1080p WEB-DLRip',  //✅ Повна мітка
                simple_label: 'FHD'            //✅ Спрощена мітка
            },*/
        }
    };
    var currentGlobalMovieId = null; // Змінна для відстеження поточного ID фільму

    // ===================== МАПИ ДЛЯ ПАРСИНГУ ЯКОСТІ =====================
    
    // Мапа для прямих відповідностей назв якості (fallback)
    var QUALITY_DISPLAY_MAP = {
        "WEBRip 1080p | AVC @ звук с TS": "1080P WEBRip/TS",
        "HDRip 2160p (4K) | WEB-DLRip": "4K HDRip WEB-DLRip",
        "HDRip 2160p (4K)": "4K HDRip",
        "BDRemux 2160p | Dolby Vision": "4K BDRemux DV",
        "WEB-DL 2160p HDR": "4K WEB-DL HDR",
        "WEB-DL 2160p": "4K WEB-DL",
        "WEBRip 2160p": "4K WEBRip",
        "BluRay REMUX 2160p": "4K Remux",
        "Remux 2160p": "4K Remux",
        "BluRay REMUX 1080p": "FHD Remux",
        "WEB-DL 1080p": "1080p WEB-DL",
        "WEBRip 1080p": "1080p WEBRip",
        "HDRip 1080p": "1080p HDRip",
        "BluRay 1080p": "1080p BluRay",
        "BluRay 720p": "720p BluRay",
        "WEB-DL 720p": "720p WEB-DL",
        "WEBRip 720p": "720p WEBRip",
        "HDRip 720p": "720p HDRip",
        "CAMRip": "CamRip",
        "TS 720p": "TS 720p",
        "TS": "TS",
        "TC": "TC",
        "HDTVRip": "HDTVRip",
        "DVDRip": "DVDRip"
    };
    // Мапа для визначення роздільності з назви
    var RESOLUTION_MAP = {
        "2160p": "4K",
        "2160": "4K",
        "4320p": "8K",
        "4320": "8K",
        "4320P": "8K",
        "4320": "8k",
        "4k": "4K",
        "4к": "4K",
        "uhd": "4K",
        "ultra hd": "4K",
        "ultrahd": "4K",
        "dci 4k": "4K",
        "1440p": "QHD",
        "1440": "QHD",
        "2k": "QHD",
        "qhd": "QHD",
        "1080p": "FHD",
        "1080": "FHD",
        "1080i": "FHD",
        "full hd": "FHD",
        "fhd": "FHD",
        "720p": "HD",
        "720": "HD",
        "hd ready": "HD",
        "hd": "HD",
        "480p": "SD",
        "480": "SD",
        "sd": "SD",
        "pal": "SD",
        "ntsc": "SD",
        "576p": "SD",
        "576": "SD",
        "360p": "LQ",
        "360": "LQ",
        "camrip": "CamRip",
        "cam": "CamRip",
        "hdrip 720p": "HD HDRip",
        "ts": "TS",
        "telesync": "TS",
        "telecine": "TC",
        "tc": "TC",
        "dvdrip": "DVDRip",
        "dvdscr": "SCR",
        "screener": "SCR",
        "scr": "SCR",
        "bdscr": "SCR"
    };
    // Мапа для відповідностей, які можуть бути в назві
    var QUALITY_KEYWORDS = {
        // Джерело відео
        "remux": "Remux",
        "bdremux": "Remux",
        "blu-ray remux": "Remux",
        "bluray": "BluRay",
        "blu-ray": "BluRay",
        "bdrip": "BDRip",
        "brrip": "BRRip",
        "web-dl": "WEB-DL",
        "webrip": "WEBRip",
        "web-dlrip": "WEB-DLRip",
        "webdlrip": "WEB-DLRip",
        "hdtv": "HDTV",
        "hdtvrip": "HDTVRip",
        "hdrip": "HDRip",
        "dvdrip": "DVDRip",
        "dvdscr": "SCR",
        "camrip": "CamRip",
        "cam": "CamRip",
        "telesync": "TS",
        "ts": "TS",
        "telecine": "TC",
        "tc": "TC",
        "satrip": "SATRip",
        "satrip 1080p": "1080p SATRip",
        "satrip 720p": "720p SATRip",
        "satrip 2160p": "4K SATRip",
        "dsrip": "DSRip",
        "scr": "SCR",
        "bdscr": "SCR",
        "workprint": "Workprint"
    };
    // Мапа для спрощення повних назв якості до коротких форматів
    var SHORT_QUALITY_MAP = {
        "4k": "4K", "4K": "4K", "2160p": "4K", "2160": "4K", "uhd": "4K", "ultra hd": "4K", "ultrahd": "4K", "dci 4k": "4K",
        "8k": "8K", "4320p": "8K", "4320": "8K",

        "1440p": "QHD", "1440": "QHD", "2k": "QHD", "qhd": "QHD",
        "1080p": "FHD", "1080": "FHD", "1080i": "FHD", "full hd": "FHD", "fhd": "FHD",
        "720p": "HD", "720": "HD", "hd": "HD", "hd ready": "HD",
        "480p": "SD", "480": "SD",
        "576p": "SD", "576": "SD", "pal": "SD", "ntsc": "SD",
        "360p": "LQ", "360": "LQ",

        // Погана якість (джерело) - мають пріоритет над роздільністю при відображенні
        "camrip": "CamRip", "cam": "CamRip", "hdcam": "CamRip", "камрип": "CamRip",
        "telesync": "TS", "ts": "TS", "hdts": "TS", "телесинк": "TS",
        "telecine": "TC", "tc": "TC", "hdtc": "TC", "телесин": "TC",
        "dvdscr": "SCR", "scr": "SCR", "bdscr": "SCR", "screener": "SCR",

        // Якісні джерела
        "remux": "Remux", "bdremux": "Remux", "blu-ray remux": "Remux",
        "bluray": "BR", "blu-ray": "BR", "bdrip": "BRip", "brrip": "BRip",
        "web-dl": "WebDL", "webdl": "WebDL",
        "webrip": "WebRip", "web-dlrip": "WebDLRip", "webdlrip": "WebDLRip",
        "hdtv": "HDTV", "hdtvrip": "HDTV",
        "hdrip": "HDRip",
        "dvdrip": "DVDRip", "dvd": "DVD"
    };
    // ===================== СТИЛІ CSS =====================
    
    // Динамічні параметри позиціонування плашки якості на картці списку
    var __lqe_margin_left = LQE_CONFIG.LIST_CARD_LABEL_STICK_TO_POSTER_EDGE ? '0' : '-0.78em';
    var __lqe_left = '0';
    var __lqe_zindex = (typeof LQE_CONFIG.LIST_CARD_LABEL_Z_INDEX === 'number' ? LQE_CONFIG.LIST_CARD_LABEL_Z_INDEX : 20);

    // Основні стилі для відображення якості
    var styleLQE = "<style id=\"lampa_quality_styles\">" +
        ".full-start-new__rate-line, .full-start__rate-line {" + // Контейнер для лінії рейтингу повної картки
        "visibility: hidden;" + // Приховано під час завантаження
        "flex-wrap: wrap;" + // Дозволити перенос елементів
        "gap: 0.4em 0;" + // Відступи між елементами
        "position: relative;" + // Потрібно для абсолютних дочірніх елементів (анім. завантаження)
        "}" +
        ".full-start-new__rate-line > *, .full-start__rate-line > * {" + // Стилі для всіх дітей лінії рейтингу
        "margin-right: 0.5em;" + // Відступ праворуч
        "flex-shrink: 0;" + // Заборонити стискання
        "flex-grow: 0;" + // Заборонити розтягування
        "}" +
        ".lqe-quality {" + // Стилі для мітки якості на повній картці
        "min-width: 2.8em;" + // Мінімальна ширина
        "text-align: center;" + // Вирівнювання тексту по центру
        "text-transform: none;" + // Без трансформації тексту
        "border: 1px solid " + LQE_CONFIG.FULL_CARD_LABEL_BORDER_COLOR + " !important;" + // Колір рамки з конфігурації
        "color: " + LQE_CONFIG.FULL_CARD_LABEL_TEXT_COLOR + " !important;" + // Колір тексту
        "font-weight: " + LQE_CONFIG.FULL_CARD_LABEL_FONT_WEIGHT + " !important;" + // Товщина шрифту
        "font-size: " + LQE_CONFIG.FULL_CARD_LABEL_FONT_SIZE + " !important;" + // Розмір шрифту
        "font-style: " + LQE_CONFIG.FULL_CARD_LABEL_FONT_STYLE + " !important;" + // Стиль шрифту
        "border-radius: 0.2em;" + // Закруглення кутів
        "padding: 0.3em;" + // Внутрішні відступи
        "height: 1.72em;" + // Фіксована висота
        "display: flex;" + // Flexbox для центрування
        "align-items: center;" + // Вертикальне центрування
        "justify-content: center;" + // Горизонтальне центрування
        "box-sizing: border-box;" + // Box-model
        "}" +
        ".card__view {" + // Контейнер для картки у списку
        " position: relative; " + // Відносне позиціонування
        "}" +
        ".card__quality.lqe-quality {" + // Стилі для мітки якості на списковій картці (наш плагін)
        " position: absolute; " + // Абсолютне позиціонування
        " bottom: 0.50em; " + // Відступ від низу
        " left: " + __lqe_left + "; " + // Вирівнювання по лівому краю
        " margin-left: " + __lqe_margin_left + "; " + // Зсув за межі постера (або ні)
        " background-color: " + (LQE_CONFIG.LIST_CARD_LABEL_BACKGROUND_TRANSPARENT ? 'transparent' : LQE_CONFIG.LIST_CARD_LABEL_BACKGROUND_COLOR) + " !important;" + // Колір фону
        " z-index: " + __lqe_zindex + ";" + // Z-index поверх постера, але не всього UI
        " width: fit-content; " + // Ширина по вмісту
        " max-width: calc(100% - 1em); " + // Максимальна ширина
        " border-radius: 0.3em 0.3em 0.3em 0.3em; " + // Закруглення кутів
        " overflow: hidden;" + // Обрізання переповнення
        "}" +
        ".card__quality.lqe-quality div {" + // Стилі для тексту всередині мітки якості
        " text-transform: uppercase; " + // Великі літери
        " font-family: 'Roboto Condensed', 'Arial Narrow', Arial, sans-serif; " + // Шрифт
        " font-weight: 700; " + // Жирний шрифт
        " letter-spacing: 0.1px; " + // Відстань між літерами
        " font-size: 1.10em; " + // Розмір шрифту
        " color: " + LQE_CONFIG.LIST_CARD_LABEL_TEXT_COLOR + " !important;" + // Колір тексту
        " padding: 0.1em 0.1em 0.08em 0.1em; " + // Внутрішні відступи
        " white-space: nowrap;" + // Заборонити перенос тексту
        " text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.3); " + // Тінь тексту
        "}" +
        "</style>";
    // Додаємо стилі до DOM
    Lampa.Template.add('lampa_quality_css', styleLQE);
    $('body').append(Lampa.Template.get('lampa_quality_css', {}, true));
    // Стилі для плавного з'явлення міток якості
    var fadeStyles = "<style id='lampa_quality_fade'>" +
        ".card__quality.lqe-quality, .full-start__status.lqe-quality {" + // Елементи для анімації
        "opacity: 0;" + // Початково прозорі
        "transition: opacity 0.22s ease-in-out;" + // Плавна зміна прозорості
        "}" +
        ".card__quality.lqe-quality.show, .full-start__status.lqe-quality.show {" + // Клас для показу
        "opacity: 1;" + // Повністю видимі
        "}" +
        ".card__quality.lqe-quality.show.fast, .full-start__status.lqe-quality.show.fast {" + // Вимкнення переходу
        "transition: none !important;" +
        "}" +
        "</style>";

    Lampa.Template.add('lampa_quality_fade', fadeStyles);
    $('body').append(Lampa.Template.get('lampa_quality_fade', {}, true));

    // Стилі для анімації завантаження (крапки)
    var loadingStylesLQE = "<style id=\"lampa_quality_loading_animation\">" +
        ".loading-dots-container {" + // Контейнер для анімації завантаження
        "    position: absolute;" + // Абсолютне позиціонування
        "    top: 50%;" + // По центру вертикалі
        "    left: 0;" + // Лівий край
        "    right: 0;" + // Правий край
        "    text-align: left;" + // Вирівнювання тексту ліворуч
        "    transform: translateY(-50%);" + // Центрування по вертикалі
        "    z-index: 10;" + // Поверх інших елементів
        "}" +
        ".full-start-new__rate-line, .full-start__rate-line {" + // Лінія рейтингу
        "    position: relative;" + // Відносне позиціонування для абсолютних дітей
        "}" +
        ".loading-dots {" + // Контейнер крапок завантаження
        "    display: inline-flex;" + // Inline-flex для вирівнювання
        "    align-items: center;" + // Центрування по вертикалі
        "    gap: 0.4em;" + // Відступи між елементами
        "    color: #ffffff;" + // Колір тексту
        "    font-size: 0.7em;" + // Розмір шрифту
        "    background: rgba(0, 0, 0, 0.3);" + // Напівпрозорий фон
        "    padding: 0.6em 1em;" + // Внутрішні відступи
        "    border-radius: 0.5em;" + // Закруглення кутів
        "}" +
        ".loading-dots__text {" + // Текст \"Пошук...\"
        "    margin-right: 1em;" + // Відступ праворуч
        "}" +
        ".loading-dots__dot {" + // Окремі крапки
        "    width: 0.5em;" + // Ширина крапки
        "    height: 0.5em;" + // Висота крапки
        "    border-radius: 50%;" + // Кругла форма
        "    background-color: currentColor;" + // Колір як у тексту
        "    opacity: 0.3;" + // Напівпрозорість
        "    animation: loading-dots-fade 1.5s infinite both;" + // Анімація
        "}" +
        ".loading-dots__dot:nth-child(1) {" + // Перша крапка
        "    animation-delay: 0s;" + // Без затримки
        "}" +
        ".loading-dots__dot:nth-child(2) {" + // Друга крапка
        "    animation-delay: 0.5s;" + // Затримка 0.5с
        "}" +
        ".loading-dots__dot:nth-child(3) {" + // Третя крапка
        "    animation-delay: 1s;" + // Затримка 1с
        "}" +
        "@keyframes loading-dots-fade {" + // Анімація миготіння крапок
        "    0%, 90%, 100% { opacity: 0.3; }" + // Низька прозорість
        "    35% { opacity: 1; }" + // Пік видимості
        "}" +
        "@media screen and (max-width: 480px) { .loading-dots-container { text-align: center; max-width: 100%; } }" + // Адаптація для мобільних
        "</style>";

    Lampa.Template.add('lampa_quality_loading_animation_css', loadingStylesLQE);
    $('body').append(Lampa.Template.get('lampa_quality_loading_animation_css', {}, true));

    // ===================== МЕРЕЖЕВІ ФУНКЦІЇ =====================
    
    /**
     * Виконує запит через проксі з обробкою помилок
     * @param {string} url - URL JacRed (або інший)
     * @param {string} cardId - ID картки
     * @param {function} callback - функція, яка викликається з результатом або помилкою
     */
    function fetchWithProxies(url, cardId, callback) {
        var currentProxyIndex = 0;
        var callbackCalled = false;
        var controller = null;
        var timeoutId = null;

        // Виконує один HTTP-запит через конкретний проксі
        function attemptRequest(proxyUrl, onDone) {
            try {
                if (controller) {
                    try { controller.abort(); } catch (e) {}
                }
                controller = new AbortController();
                var signal = controller.signal;

                timeoutId = setTimeout(function() {
                    try { controller.abort(); } catch (e) {}
                    onDone(new Error('Proxy timeout: ' + proxyUrl));
                }, LQE_CONFIG.PROXY_TIMEOUT_MS);

                if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", Fetching via proxy:", proxyUrl);

                fetch(proxyUrl, { signal: signal })
                    .then(function(res) {
                        if (!res.ok) {
                            throw new Error('HTTP ' + res.status + ' ' + res.statusText);
                        }
                        return res.json();
                    })
                    .then(function(json) {
                        clearTimeout(timeoutId);
                        if (!callbackCalled) {
                            callbackCalled = true;
                            if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", Proxy success");
                            callback(null, json);
                        }
                        onDone(null);
                    })
                    .catch(function(err) {
                        clearTimeout(timeoutId);
                        if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", Proxy failed:", err.message || err);
                        onDone(err);
                    });
            } catch (errOuter) {
                clearTimeout(timeoutId);
                if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", Proxy exception:", errOuter.message || errOuter);
                onDone(errOuter);
            }
        }

        // Рекурсивна функція спроб через різні проксі
        function tryNextProxy() {
            // Перевіряємо, чи не вичерпано всі проксі
            if (currentProxyIndex >= LQE_CONFIG.PROXY_LIST.length) {
                if (!callbackCalled) { // Якщо callback ще не викликано
                    callbackCalled = true;
                    callback(new Error('All proxies failed for ' + url)); // Повертаємо помилку
                }
                return;
            }
            
            // Формуємо URL з поточним проксі
            var proxyUrl = LQE_CONFIG.PROXY_LIST[currentProxyIndex] + encodeURIComponent(url);
            if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", Fetch with proxy: " + proxyUrl);
            // Встановлюємо таймаут для запиту
            attemptRequest(proxyUrl, function(err) {
                if (!err) {
                    // Успіх, нічого не робимо
                    return;
                }
                // Якщо помилка - пробуємо наступний проксі
                currentProxyIndex++;
                tryNextProxy();
            });
        }
        
        tryNextProxy(); // Починаємо з першого проксі
    }

    // ===================== АНІМАЦІЯ ЗАВАНТАЖЕННЯ =====================
    
    /**
     * Додає анімацію завантаження до картки
     * @param {string} cardId - ID картки
     * @param {Element} renderElement - DOM елемент
     */
    function addLoadingAnimation(cardId, renderElement) {
        if (!renderElement) return; // Перевірка наявності елемента
        if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", Add loading animation");
        // Знаходимо лінію рейтингу в контексті renderElement
        var rateLine = $('.full-start-new__rate-line, .full-start__rate-line', renderElement);
        // Перевіряємо наявність лінії та відсутність вже доданої анімації
        if (!rateLine.length || $('.loading-dots-container', rateLine).length) return;
        // Додаємо HTML структуру анімації
        rateLine.append(
            '<div class="loading-dots-container">' +
            '<div class="loading-dots">' +
            '<span class="loading-dots__text">Пошук...</span>' + // Текст завантаження
            '<span class="loading-dots__dot"></span>' + // Крапка 1
            '<span class="loading-dots__dot"></span>' + // Крапка 2
            '<span class="loading-dots__dot"></span>' + // Крапка 3
            '</div>' +
            '</div>'
        );
        // Робимо анімацію видимою
        $('.loading-dots-container', rateLine).css({
            'opacity': '1',
            'visibility': 'visible'
        });
    }

    /**
     * Видаляє анімацію завантаження
     * @param {string} cardId - ID картки
     * @param {Element} renderElement - DOM елемент
     */
    function removeLoadingAnimation(cardId, renderElement) {
        if (!renderElement) return;
        if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", Remove loading animation");
        // Видаляємо контейнер з анімацією
        $('.loading-dots-container', renderElement).remove();
    }

    // ===================== УТІЛІТИ =====================
    
    /**
     * Перевіряє валідність відповіді JacRed
     * @param {object} data - Дані JacRed
     * @returns {boolean} true якщо валідна
     */
    function isValidJacredResponse(data) {
        return data && typeof data === 'object' && (data.movie || data.results);
    }

    /**
     * Повертає тип картки (movie або tv)
     * @param {object} cardData - Дані картки
     * @returns {string}
     */
    function getCardType(cardData) {
        if (!cardData) return 'movie';
        if (cardData.name || cardData.first_air_date) return 'tv';
        return 'movie';
    }

    /**
     * Створює ключ кешу для картки
     * @param {string|number} version - версія кешу
     * @param {string} type - тип ('movie' або 'tv')
     * @param {string|number} id - ID картки
     * @returns {string}
     */
    function makeCacheKey(version, type, id) {
        return version + '_' + type + '_' + id;
    }

    /**
     * Зберігає дані якості в кеш
     * @param {string} key - ключ кешу
     * @param {object} qualityData - об'єкт даних якості
     * @param {string|number} cardId - ID картки
     */
    function saveQualityCache(key, qualityData, cardId) {
        try {
            var raw = localStorage.getItem(LQE_CONFIG.CACHE_KEY);
            var parsed = raw ? JSON.parse(raw) : {};
            parsed[key] = {
                quality_code: (qualityData && qualityData.quality_code) || null,
                full_label: (qualityData && qualityData.full_label) || null,
                timestamp: Date.now()
            };
            localStorage.setItem(LQE_CONFIG.CACHE_KEY, JSON.stringify(parsed));
            if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", Saved to cache key:", key, parsed[key]);
        } catch (e) {
            console.error("LQE-ERROR: Failed to save cache", e);
        }
    }

    /**
     * Отримує дані якості з кешу
     * @param {string} key - ключ кешу
     * @returns {object|null}
     */
    function getQualityCache(key) {
        try {
            var raw = localStorage.getItem(LQE_CONFIG.CACHE_KEY);
            if (!raw) return null;
            var parsed = JSON.parse(raw);
            if (!parsed[key]) return null;

            // Перевіряємо чи кеш актуальний
            if (Date.now() - parsed[key].timestamp > LQE_CONFIG.CACHE_VALID_TIME_MS) {
                return null;
            }

            return parsed[key];
        } catch (e) {
            console.error("LQE-ERROR: Failed to read cache", e);
            return null;
        }
    }

    /**
     * Визначає найкращу якість релізу на основі даних JacRed
     * @param {object} jacredData - Дані від JacRed
     * @returns {{quality:string, full_label:string}|null}
     */
    function pickBestQualityFromJacred(jacredData) {
        if (!jacredData) return null;

        // JacRed може повертати або {movie:{torrent:[]}}, або {results:[...]}
        var torrents = [];
        if (jacredData.movie && Array.isArray(jacredData.movie.torrent)) {
            torrents = jacredData.movie.torrent;
        } else if (Array.isArray(jacredData.results)) {
            torrents = jacredData.results;
        }

        if (!torrents || torrents.length === 0) return null;

        // Спробуємо вибрати запис з максимальною якістю, пріоритет: 2160p > 1440p > 1080p > 720p > 480p > CAM/TS/TC
        var best = null;
        var bestScore = -Infinity;

        for (var i = 0; i < torrents.length; i++) {
            var t = torrents[i];
            if (!t || !t.name) continue;

            var name = t.name.toLowerCase();
            var score = 0;
            var label = t.name.trim();

            // пріоритет 4K
            if (name.includes('2160') || name.includes('4k') || name.includes('uhd') || name.includes('ultra hd') || name.includes('ultrahd')) score += 1000;
            if (name.includes('4320') || name.includes('8k')) score += 1500;

            // пріоритет remux
            if (name.includes('remux')) score += 400;

            // пріоритет web-dl над webRip
            if (name.includes('web-dl') || name.includes('webdl')) score += 250;
            if (name.includes('webrip')) score += 200;

            // blu-ray/blueray/bdrip/brip
            if (name.includes('blu') || name.includes('bdrip') || name.includes('brrip')) score += 220;

            // fhd
            if (name.includes('1080')) score += 120;
            if (name.includes('720')) score += 50;
            if (name.includes('hdrip') || name.includes('hdrip')) score += 10;

            // штраф за cam / ts / tc / telesync / telecine
            if (name.includes('camrip') || name.includes('camrip')) score -= 500;
            if (name.includes('camrip') || name.includes('camrip')) score -= 500;
            if (name.includes('telesync') || name.includes('ts ' ) || name.includes(' ts') || name.includes(' hdtc') || name.includes('tc ' ) || name.includes(' tc')) score -= 300;

            // порівнюємо
            if (score > bestScore) {
                bestScore = score;
                best = {
                    quality: extractQualityCodeFromTitle(t.name),
                    full_label: t.name.trim()
                };
            }
        }

        return best;
    }

    /**
     * Витягує "код якості" (2160, 1080, TS...) з назви релізу
     * @param {string} title
     * @returns {string|number}
     */
    function extractQualityCodeFromTitle(title) {
        if (!title || typeof title !== 'string') return 'NO';
        var low = title.toLowerCase();

        // якщо є CAM/TS/TC - це критично
        if (low.includes('camrip') || low.includes('cam rip') || low.includes(' hdcam')) return 'CamRip';
        if (low.includes(' telesync') || low.includes('ts ') || low.includes(' ts') || low.includes(' hdts')) return 'TS';
        if (low.includes(' telecine') || low.includes('tc ') || low.includes(' tc') || low.includes(' hdtc')) return 'TC';
        if (low.includes('dvdscr') || low.includes(' screener') || low.includes(' bdscr')) return 'SCR';

        // 8K / 4320p
        if (/\b(4320|4320p|8k)\b/i.test(low)) return 4320;
        // 4K / 2160p
        if (/\b(2160|2160p|4k|uhd|ultra\s?hd|ultrahd|dci\s?4k)\b/i.test(low)) return 2160;
        // 1440p / 2K / QHD
        if (/\b(1440|1440p|2k|qhd)\b/i.test(low)) return 1440;
        // 1080p
        if (/\b(1080|1080p|full\s?hd|fhd)\b/i.test(low)) return 1080;
        // 720p
        if (/\b(720|720p|hd\s?ready|hd\b)\b/i.test(low)) return 720;
        // 480p / SD
        if (/\b(480|480p|sd\b|pal\b|ntsc\b|576|576p)\b/i.test(low)) return 480;
        // геть погана
        if (/\b(camrip|cam|telesync|ts|telecine|tc|dvdscr|scr|bdscr)\b/i.test(low)) {
            return 'LQ';
        }
        return 'NO';
    }

    /**
     * Перекладає якість у більш читабельну форму / або повертає просту форму
     * @param {number|string} code
     * @param {string} fullLabel
     */
    function translateQualityLabel(code, fullLabel) {
        if (!fullLabel && !code) return '';

        // Якщо вимкнули спрощення міток, показуємо повну назву
        if (!LQE_CONFIG.USE_SIMPLE_QUALITY_LABELS) {
            return fullLabel || (code + '');
        }

        // Якщо є CAM/TS/TC/SCR то пріоритет завжди в них
        var low = (fullLabel || '').toLowerCase();
        if (low.includes('camrip') || low.includes('hdcam') || low.includes(' cam ')) return 'CamRip';
        if (low.includes(' telesync') || /\bts\b/i.test(low) || low.includes('hdts')) return 'TS';
        if (low.includes(' telecine') || /\btc\b/i.test(low) || low.includes('hdtc')) return 'TC';
        if (low.includes('dvdscr') || low.includes(' screener') || low.includes(' bdscr')) return 'SCR';

        if (code === 4320 || /4320|8k/i.test(low)) return '8K';
        if (code === 2160 || /2160|4k|uhd|ultra\s?hd|ultrahd|dci\s?4k/i.test(low)) return '4K';
        if (code === 1440 || /1440|1440p|2k|qhd/i.test(low)) return 'QHD';
        if (code === 1080 || /1080|1080p|full\s?hd|fhd/i.test(low)) return 'FHD';
        if (code === 720  || /720|720p|hd\s?ready|hd\b/i.test(low)) return 'HD';
        if (code === 480  || /480|480p|sd\b|pal|ntsc|576|576p/i.test(low)) return 'SD';

        // Якщо не змогли обробити - може це Remux/Web-DL/WEBRip і т.д.
        for (var key in SHORT_QUALITY_MAP) {
            if (SHORT_QUALITY_MAP.hasOwnProperty(key)) {
                if (low.includes(key)) {
                    return SHORT_QUALITY_MAP[key];
                }
            }
        }

        // Fallback
        return fullLabel || (code + '');
    }

    /**
     * Створює URL для JacRed
     * @param {object} cardData
     */
    function buildJacRedQuery(cardData) {
        if (!cardData) return '';
        var queryTitle = encodeURIComponent(cardData.title || cardData.name || '');
        var originalTitle = encodeURIComponent(cardData.original_title || cardData.original_name || '');
        var yearGuess = '';
        if (cardData.release_date) {
            yearGuess = (cardData.release_date + '').split('-')[0];
        } else if (cardData.first_air_date) {
            yearGuess = (cardData.first_air_date + '').split('-')[0];
        }
        var type = getCardType(cardData) === 'tv' ? 'tv' : 'movie';

        var url = LQE_CONFIG.JACRED_PROTOCOL + LQE_CONFIG.JACRED_URL + '/search?query=' + queryTitle +
            (originalTitle ? ('&oquery=' + originalTitle) : '') +
            (yearGuess ? ('&year=' + yearGuess) : '') +
            '&type=' + type;

        return url;
    }

    /**
     * Основна функція для отримання релізів з JacRed
     * @param {object} cardData
     * @param {string} cardId
     * @param {function} callback - (result) => {}
     */
    function getBestReleaseFromJacred(cardData, cardId, callback) {
        var url = buildJacRedQuery(cardData);
        if (!url) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", No URL to JacRed");
            callback(null);
            return;
        }

        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Searching JacRed...");

        fetchWithProxies(url, cardId, function(err, data) {
            if (err) {
                console.error("LQE-ERROR: JacRed request failed for", cardId, err);
                callback(null);
                return;
            }

            if (!isValidJacredResponse(data)) {
                console.warn("LQE-WARN: Invalid JacRed data for card", cardId, data);
                callback(null);
                return;
            }

            var bestQuality = pickBestQualityFromJacred(data);
            if (!bestQuality) {
                callback(null);
                return;
            }

            callback(bestQuality);
        });
    }

    // ===================== РОБОТА З ПОВНОЮ КАРТКОЮ =====================

    /**
     * Очищає елементи якості/статусу на повній картці перед оновленням
     * @param {string} cardId - ID картки
     * @param {Element} renderElement - DOM елемент
     */
    function clearFullCardQualityElements(cardId, renderElement) {
        if (!renderElement) return;
        var rateLine = $('.full-start-new__rate-line, .full-start__rate-line', renderElement);
        if (rateLine.length) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Clearing existing quality elements on full card.");
            // Видаляємо ВСІ плашки .full-start__status (і рідні Lampa, і наші), щоб уникнути дублів типу "4K 4K"
            rateLine.find('.full-start__status').remove();
        }
    }

    /**
     * Показує заглушку завантаження якості
     * @param {string} cardId - ID картки
     * @param {Element} renderElement - DOM елемент
     */
    function showFullCardQualityPlaceholder(cardId, renderElement) {
        if (!renderElement) return;
        var rateLine = $('.full-start-new__rate-line, .full-start__rate-line', renderElement);
        if (!rateLine.length) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Cannot show placeholder, rate-line not found.");
            return;
        }
        
        // Перевіряємо, чи немає вже плейсхолдера якості
        var existing = $('.full-start__status.lqe-quality', rateLine);
        if (!existing.length) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Adding quality placeholder on full card.");
            var placeholder = document.createElement('div');
            placeholder.className = 'full-start__status lqe-quality';
            placeholder.textContent = 'Пошук...';
            placeholder.style.opacity = '0.7';
            
            rateLine.append(placeholder); // Додаємо плейсхолдер
        } else {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Placeholder already exists on full card, skipping.");
        }
    }

    /**
     * Оновлює елемент якості на повній картці
     * @param {number} qualityCode - Код якості
     * @param {string} fullTorrentTitle - Назва торренту
     * @param {string} cardId - ID картки
     * @param {Element} renderElement - DOM елемент
     * @param {boolean} bypassTranslation - Пропустити переклад (використати текст як є)
     */
    function updateFullCardQualityElement(qualityCode, fullTorrentTitle, cardId, renderElement, bypassTranslation) {
        if (!renderElement) return;
        var rateLine = $('.full-start-new__rate-line, .full-start__rate-line', renderElement);
        if (!rateLine.length) return;

        // Перед показом нашої плашки видаляємо всі НЕнашi .full-start__status, щоб не було дубляжу 4K 4K
        rateLine.find('.full-start__status').each(function() {
            if (!this.classList.contains('lqe-quality')) {
                this.remove();
            }
        });

        var element = $('.full-start__status.lqe-quality', rateLine);

        var displayQuality = bypassTranslation ? fullTorrentTitle : translateQualityLabel(qualityCode, fullTorrentTitle);

        // Якщо це ручне перевизначення І увімкнено спрощені мітки — беремо simple_label
        if (bypassTranslation && LQE_CONFIG.USE_SIMPLE_QUALITY_LABELS) {
            var manualData = LQE_CONFIG.MANUAL_OVERRIDES[cardId];
            if (manualData && manualData.simple_label) {
                displayQuality = manualData.simple_label;
            }
        }
        
        if (element.length) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log('LQE-QUALITY', 'card: ' + cardId + ', Updating existing element with quality "' + displayQuality + '" on full card.');
            element.text(displayQuality).css('opacity', '1').addClass('show');
        } else {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log('LQE-QUALITY', 'card: ' + cardId + ', Creating new element with quality "' + displayQuality + '" on full card.');
            var div = document.createElement('div');
            div.className = 'full-start__status lqe-quality';
            div.textContent = displayQuality;
            rateLine.append(div);
            // Додаємо клас для анімації
            setTimeout(function(){ 
                $('.full-start__status.lqe-quality', rateLine).addClass('show'); 
            }, 20);
        }
    }

    /**
     * Оновлює елемент якості на списковій картці
     * @param {Element} cardView - DOM елемент картки (постер)
     * @param {number} qualityCode - Код якості
     * @param {string} fullTorrentTitle - Назва торренту
     * @param {boolean} bypassTranslation - Пропустити переклад (використати текст як є)
     */
    function updateCardListQualityElement(cardView, qualityCode, fullTorrentTitle, bypassTranslation) {
        if (!cardView) return;
        var displayQuality = bypassTranslation ? fullTorrentTitle : translateQualityLabel(qualityCode, fullTorrentTitle);

        // Якщо це ручне перевизначення І увімкнено спрощені мітки — беремо simple_label
        if (bypassTranslation && LQE_CONFIG.USE_SIMPLE_QUALITY_LABELS) {
            var cidFromView = (cardView.card_data && cardView.card_data.id) || (cardView.closest && cardView.closest('.card') && cardView.closest('.card').card_data && cardView.closest('.card').card_data.id);
            var manualDataList = LQE_CONFIG.MANUAL_OVERRIDES[cidFromView];
            if (manualDataList && manualDataList.simple_label) {
                displayQuality = manualDataList.simple_label;
            }
        }
        
        // 1. Прибрати всі сторонні .card__quality (рідні від Lampa), щоб не було дублів
        var existingBadges = cardView.querySelectorAll('.card__quality');
        for (var i = 0; i < existingBadges.length; i++) {
            if (!existingBadges[i].classList.contains('lqe-quality')) {
                existingBadges[i].remove();
            }
        }

        // 2. Оновити або створити нашу плашку
        var existing = cardView.querySelector('.card__quality.lqe-quality');
        if (existing) {
            var innerNode = existing.querySelector('div');
            if (innerNode && innerNode.textContent === displayQuality) {
                existing.classList.add('show');
                return; // Вже актуально
            }
            if (innerNode) {
                innerNode.textContent = displayQuality;
            } else {
                existing.textContent = displayQuality;
            }
            existing.classList.add('show');
            return;
        }

        var qualityDiv = document.createElement('div');
        qualityDiv.className = 'card__quality lqe-quality';
        var innerElement = document.createElement('div');
        innerElement.textContent = displayQuality;
        qualityDiv.appendChild(innerElement);
        cardView.appendChild(qualityDiv);

        // Плавне з'явлення
        requestAnimationFrame(function(){ qualityDiv.classList.add('show'); });
    }

    // ===================== ОБРОБКА ПОВНОЇ КАРТКИ =====================
    
    /**
     * Обробляє якість для повної картки
     * @param {object} cardData - Дані картки
     * @param {Element} renderElement - DOM елемент (контейнер повної картки)
     */
    function processFullCardQuality(cardData, renderElement) {
        if (!renderElement) {
            console.error("LQE-LOG", "Render element is null in processFullCardQuality. Aborting.");
            return;
        }
        
        var cardId = cardData.id;
        if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", Processing full card. Data: ", cardData);
        // Нормалізуємо дані картки
        var normalizedCard = {
            id: cardData.id,
            title: cardData.title || cardData.name || '',
            original_title: cardData.original_title || cardData.original_name || '',
            type: getCardType(cardData),
            release_date: cardData.release_date || cardData.first_air_date || ''
        };
        if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", Normalized full card data: ", normalizedCard);
        
        var rateLine = $('.full-start-new__rate-line, .full-start__rate-line', renderElement);
        if (rateLine.length) {
            // Ховаємо оригінальну лінію та додаємо анімацію завантаження
            rateLine.css('visibility', 'hidden');
            rateLine.addClass('done');
            addLoadingAnimation(cardId, renderElement);
        } else {
            if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", .full-start__rate-line not found, skipping loading animation.");
        }
        
        // Визначаємо тип контенту та створюємо ключ кешу
        var isTvSeries = (normalizedCard.type === 'tv' || normalizedCard.name);
        var cacheKey = LQE_CONFIG.CACHE_VERSION + '_' + (isTvSeries ? 'tv_' : 'movie_') + normalizedCard.id;
        // Перевіряємо ручні налаштування (найвищий пріоритет)
        var manualOverrideData = LQE_CONFIG.MANUAL_OVERRIDES[cardId];
        if (manualOverrideData) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Found manual override:", manualOverrideData);
            updateFullCardQualityElement(null, manualOverrideData.full_label, cardId, renderElement, true);
            removeLoadingAnimation(cardId, renderElement);
            rateLine.css('visibility', 'visible');
            return;
        }

        // Отримуємо дані з кешу
        var cachedQualityData = getQualityCache(cacheKey);
        // Перевіряємо, чи не вимкнено якість для серіалів
        if (!(isTvSeries && LQE_CONFIG.SHOW_QUALITY_FOR_TV_SERIES === false)) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log('LQE-QUALITY', 'card: ' + cardId + ', Quality feature enabled for this content, starting processing.');
            if (cachedQualityData) {
                // Використовуємо кешовані дані
                if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Quality data found in cache:", cachedQualityData);
                updateFullCardQualityElement(cachedQualityData.quality_code, cachedQualityData.full_label, cardId, renderElement);
                
                // Фонове оновлення застарілого кешу
                if (Date.now() - cachedQualityData.timestamp > LQE_CONFIG.CACHE_REFRESH_THRESHOLD_MS) {
                    if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Cache is old, scheduling background refresh AND UI update.");
                    getBestReleaseFromJacred(normalizedCard, cardId, function(jrResult) {
                        if (jrResult && jrResult.quality && jrResult.quality !== 'NO') {
                            saveQualityCache(cacheKey, {
                                quality_code: jrResult.quality,
                                full_label: jrResult.full_label
                            }, cardId);
                            updateFullCardQualityElement(jrResult.quality, jrResult.full_label, cardId, renderElement);
                            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Background cache and UI refresh completed.");
                        }
                    });
                }
                
                removeLoadingAnimation(cardId, renderElement);
                rateLine.css('visibility', 'visible');
            } else {
                // Новий пошук якості
                clearFullCardQualityElements(cardId, renderElement);
                showFullCardQualityPlaceholder(cardId, renderElement);
                
                getBestReleaseFromJacred(normalizedCard, cardId, function(jrResult) {
                    if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", 'card: ' + cardId + ', JacRed callback received for full card. Result:', jrResult);
                    var qualityCode = (jrResult && jrResult.quality) || null;
                    var fullTorrentTitle = (jrResult && jrResult.full_label) || null;
                     
                    if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", 'card: ' + cardId + ', JacRed resolved -> qualityCode: "' + qualityCode + '", full label: "' + fullTorrentTitle + '"');
                    
                    if (qualityCode && qualityCode !== 'NO') {
                        saveQualityCache(cacheKey, {
                            quality_code: qualityCode,
                            full_label: fullTorrentTitle
                        }, cardId);
                        updateFullCardQualityElement(qualityCode, fullTorrentTitle, cardId, renderElement);
                    } else {
                        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", 'card: ' + cardId + ', No quality found from JacRed or it was "NO". Clearing quality elements.');
                        clearFullCardQualityElements(cardId, renderElement);
                    }
                    
                    removeLoadingAnimation(cardId, renderElement);
                    rateLine.css('visibility', 'visible');
                });
            }
        } else {
            // Якість вимкнено для серіалів
            if (LQE_CONFIG.LOGGING_QUALITY) console.log('LQE-QUALITY', 'Quality display disabled for TV series (as configured), skipping quality fetch.');
            clearFullCardQualityElements(cardId, renderElement);
            removeLoadingAnimation(cardId, renderElement);
            rateLine.css('visibility', 'visible');
        }
        
        if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", Full card quality processing initiated.");
    }

    // ===================== ОБРОБКА СПИСКОВИХ КАРТОК =====================
    
    /**
     * Оновлює якість для спискової картки
     * @param {Element} cardElement - DOM елемент картки
     */
    function updateCardListQuality(cardElement) {
        if (LQE_CONFIG.LOGGING_CARDLIST) console.log("LQE-CARDLIST", "Processing list card");
        // Перевіряємо чи вже обробляли цю картку
        if (cardElement.hasAttribute('data-lqe-quality-processed')) {
            if (LQE_CONFIG.LOGGING_CARDLIST) console.log("LQE-CARDLIST", "Card already processed");
            return;
        }
        
        var cardView = cardElement.querySelector('.card__view') || cardElement; // Фолбек для ТВ-боксів
        var cardData = cardElement.card_data;
        
        if (!cardData || !cardView) {
            if (LQE_CONFIG.LOGGING_CARDLIST) console.log("LQE-CARDLIST", "Invalid card data or view");
            return;
        }
        
        var isTvSeries = (getCardType(cardData) === 'tv');
        if (isTvSeries && LQE_CONFIG.SHOW_QUALITY_FOR_TV_SERIES === false) {
            if (LQE_CONFIG.LOGGING_CARDLIST) console.log("LQE-CARDLIST", "Skipping TV series");
            return;
        }

        // Нормалізуємо дані
        var normalizedCard = {
            id: cardData.id || '',
            title: cardData.title || cardData.name || '',
            original_title: cardData.original_title || cardData.original_name || '',
            type: getCardType(cardData),
            release_date: cardData.release_date || cardData.first_air_date || ''
        };
        
        var cardId = normalizedCard.id;
        var cacheKey = makeCacheKey(LQE_CONFIG.CACHE_VERSION, normalizedCard.type, cardId);
        cardElement.setAttribute('data-lqe-quality-processed', 'true'); // Позначаємо як оброблену

        // Перевіряємо ручні перевизначення
        var manualOverrideData = LQE_CONFIG.MANUAL_OVERRIDES[cardId];
        if (manualOverrideData) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Manual override for list");
            updateCardListQualityElement(cardView, null, manualOverrideData.full_label, true);
            return;
        }

        // Перевіряємо кеш
        var cachedQualityData = getQualityCache(cacheKey);
        if (cachedQualityData) {
            if (LQE_CONFIG.LOGGING_CARDLIST) console.log('LQE-CARDLIST', 'card: ' + cardId + ', Using cached quality');
            updateCardListQualityElement(cardView, cachedQualityData.quality_code, cachedQualityData.full_label);

            // Фонове оновлення застарілого кешу
            if (Date.now() - cachedQualityData.timestamp > LQE_CONFIG.CACHE_REFRESH_THRESHOLD_MS) {
                if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Background refresh for list");
                getBestReleaseFromJacred(normalizedCard, cardId, function(jrResult) {
                    if (jrResult && jrResult.quality && jrResult.quality !== 'NO') {
                        saveQualityCache(cacheKey, {
                            quality_code: jrResult.quality,
                            full_label: jrResult.full_label
                        }, cardId);
                        if (document.body.contains(cardElement)) {
                            updateCardListQualityElement(cardView, jrResult.quality, jrResult.full_label);
                        }
                    }
                });
            }
            return;
        }

        // Завантажуємо нові дані
        getBestReleaseFromJacred(normalizedCard, cardId, function(jrResult) {
            if (LQE_CONFIG.LOGGING_CARDLIST) console.log('LQE-CARDLIST', 'card: ' + cardId + ', JacRed result for list');
            
            if (!document.body.contains(cardElement)) {
                if (LQE_CONFIG.LOGGING_CARDLIST) console.log('LQE-CARDLIST', 'Card removed from DOM');
                return;
            }
            
            var qualityCode = (jrResult && jrResult.quality) || null;
            var fullTorrentTitle = (jrResult && jrResult.full_label) || null;
            
            if (qualityCode && qualityCode !== 'NO') {
                if (LQE_CONFIG.LOGGING_CARDLIST) console.log('LQE-CARDLIST', 'card: ' + cardId + ', Quality found for list');
                saveQualityCache(cacheKey, {
                    quality_code: qualityCode,
                    full_label: fullTorrentTitle
                }, cardId);
                updateCardListQualityElement(cardView, qualityCode, fullTorrentTitle);
            } else {
                if (LQE_CONFIG.LOGGING_CARDLIST) console.log('LQE-CARDLIST', 'card: ' + cardId + ', No quality for list');
            }
        });
    }

    // ===================== OPTIMIZED MUTATION OBSERVER =====================
    
    var observer = new MutationObserver(function(mutations) {
        var newCards = [];
        
        // Аналізуємо мутації
        for (var m = 0; m < mutations.length; m++) {
            var mutation = mutations[m];
            if (mutation.addedNodes) {
                for (var j = 0; j < mutation.addedNodes.length; j++) {
                    var node = mutation.addedNodes[j];
                    if (node.nodeType !== 1) continue; // Пропускаємо не-елементи
                     
                    // Перевіряємо чи це картка
                    if (node.classList && node.classList.contains('card')) {
                        newCards.push(node);
                    }
                     
                    // Шукаємо вкладені картки
                    try {
                        var nestedCards = node.querySelectorAll('.card');
                        if (nestedCards && nestedCards.length) {
                            for (var k = 0; k < nestedCards.length; k++) {
                                newCards.push(nestedCards[k]);
                            }
                        }
                    } catch (e) {
                        // Ігноруємо помилки селекторів
                    }
                }
            }
        }

        if (newCards.length > 0) {
            debouncedProcessNewCards(newCards); // Запускаємо обробку з дебаунсингом
        }
    });
    var observerDebounceTimer = null;
    
    /**
     * Оптимізований дебаунс обробки нових карток з TV-оптимізацією
     * @param {Array} cards - Масив карток
     */
    function debouncedProcessNewCards(cards) {
        if (!Array.isArray(cards) || cards.length === 0) return;
        clearTimeout(observerDebounceTimer);
        observerDebounceTimer = setTimeout(function() {
            // Вимикаємо перевірку дублікатів - обробляємо всі картки
            var uniqueCards = cards.filter(function(card) {
                return card && card.isConnected;
            });
            
            if (LQE_CONFIG.LOGGING_CARDLIST && uniqueCards.length < cards.length) {
                console.log("LQE-CARDLIST", "Removed duplicates:", cards.length - uniqueCards.length);
            }
            
    
            if (LQE_CONFIG.LOGGING_CARDLIST) {
                console.log("LQE-CARDLIST", "Processing", uniqueCards.length, "unique cards with batching");
            }
            
            // TV-ОПТИМІЗАЦІЯ: обробка порціями для уникнення фризів
            var BATCH_SIZE = 10; // Кількість карток за один раз
            var DELAY_MS = 50; // Затримка між порціями
            
            function processBatch(startIndex) {
                var endIndex = Math.min(startIndex + BATCH_SIZE, uniqueCards.length);
                var batch = uniqueCards.slice(startIndex, endIndex);
                
                batch.forEach(function(card) {
                    if (card.isConnected) { // Перевіряємо, чи картка ще в DOM
                        updateCardListQuality(card);
                    }
                });
                var nextIndex = startIndex + BATCH_SIZE;
                
                // Якщо залишилися картки - плануємо наступну порцію
                if (nextIndex < uniqueCards.length) {
                    setTimeout(function() {
                        processBatch(nextIndex);
                    }, DELAY_MS);
                } else {
                    // Всі картки оброблено
                    if (LQE_CONFIG.LOGGING_CARDLIST) {
                        console.log("LQE-CARDLIST", "All batches processed successfully");
                    }
                }
            }
            
            // Запускаємо обробку з першої порції
            if (uniqueCards.length > 0) {
                processBatch(0);
            }
            
        }, 15); // Дебаунсинг 15ms для швидшого відображення
    }

    /**
     * Налаштовує Observer для відстеження нових карток
     */
    function attachObserver() {
        var containers = document.querySelectorAll('.cards, .card-list, .content, .main, .cards-list, .preview__list');
        if (containers && containers.length) {
            for (var i = 0; i < containers.length; i++) {
                try {
                    observer.observe(containers[i], { childList: true, subtree: true });
                } catch (e) {
                    console.error("LQE-LOG", "Observer error:", e);
                }
            }
        } else {
            observer.observe(document.body, { childList: true, subtree: true }); // Fallback на весь документ
        }
    }

    /**
     * Пройтись по вже намальованих картках (наприклад, коли плагін вмикається на ТВ-боксі,
     * де елементи вже відмальовані в DOM до того як ми підписалися на observer)
     */
    function applyQualityToExistingCards() {
        try {
            var existingCards = document.querySelectorAll('.card');
            if (existingCards && existingCards.length) {
                for (var i = 0; i < existingCards.length; i++) {
                    var c = existingCards[i];
                    if (c && c.isConnected) {
                        updateCardListQuality(c);
                    }
                }
            }
        } catch (e) {
            if (LQE_CONFIG.LOGGING_CARDLIST) console.log("LQE-CARDLIST", "applyQualityToExistingCards error:", e);
        }
    }

    // ===================== ІНІЦІАЛІЗАЦІЯ ПЛАГІНА =====================
    
    /**
     * Ініціалізує плагін якості
     */
    function initializeLampaQualityPlugin() {
        if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "Lampa Quality Enhancer: Initializing...");
        window.lampaQualityPlugin = true; // Позначаємо плагін як ініціалізований
        
        attachObserver(); // Налаштовуємо спостерігач за новими картками
        if (LQE_CONFIG.LOGGING_GENERAL) console.log('LQE-LOG: MutationObserver started');

        // Одноразово обробити вже існуючі картки (важливо для ТВ-боксів)
        applyQualityToExistingCards();

        // Підписуємося на події повної картки
        Lampa.Listener.follow('full', function(event) {
            if (event.type == 'complite') {
                var renderElement = event.object.activity.render();
                currentGlobalMovieId = event.data.movie.id;
                
                
                if (LQE_CONFIG.LOGGING_GENERAL) {
                    console.log("LQE-LOG", "Full card completed for ID:", currentGlobalMovieId);
                }
                
                processFullCardQuality(event.data.movie, renderElement);
            }
        });
        if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "Lampa Quality Enhancer: Initialized successfully!");
    }

    // Ініціалізуємо плагін якщо ще не ініціалізовано
    if (!window.lampaQualityPlugin) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeLampaQualityPlugin); // Чекаємо завантаження DOM
        } else {
            initializeLampaQualityPlugin(); // Ініціалізуємо негайно
        }
    }

})();

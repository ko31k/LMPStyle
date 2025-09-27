(function() {
    'use strict'; // Використання суворого режиму для запобігання помилок

    // ===================== КОНФІГУРАЦІЯ =====================
    var LQE_CONFIG = {
        CACHE_VERSION: 2, // Версія кешу для інвалідації старих даних
        LOGGING_GENERAL: false, // Загальне логування для налагодження
        LOGGING_QUALITY: true, // Логування процесу визначення якості
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
        SHOW_QUALITY_FOR_TV_SERIES: true, // Показувати якість для серіалів
        MAX_PARALLEL_REQUESTS: 12, // ЗМІНЕНО: Встановлено на 12 (як в Quality+) для більш стабільної черги.
        
        USE_SIMPLE_QUALITY_LABELS: false, // Використовувати спрощені мітки якості (4K, FHD, TS, TC тощо) "true"-так / "false" - ні 
        
        // Стилі для відображення якості на повній картці
        FULL_CARD_LABEL_BORDER_COLOR: '#FFFFFF',
        FULL_CARD_LABEL_TEXT_COLOR: '#FFFFFF',
        FULL_CARD_LABEL_FONT_WEIGHT: 'normal',
        FULL_CARD_LABEL_FONT_SIZE: '1.2em',
        FULL_CARD_LABEL_FONT_STYLE: 'normal',
        
        // Стилі для відображення якості на спискових картках
        LIST_CARD_LABEL_BORDER_COLOR: '#3DA18D',
        LIST_CARD_LABEL_BACKGROUND_COLOR: 'rgba(61, 161, 141, 0.8)',
        LIST_CARD_LABEL_BACKGROUND_TRANSPARENT: false,
        LIST_CARD_LABEL_TEXT_COLOR: '#FFFFFF',
        LIST_CARD_LABEL_FONT_WEIGHT: '600',
        LIST_CARD_LABEL_FONT_SIZE: '1.3em',
        LIST_CARD_LABEL_FONT_STYLE: 'normal',
        
        // Ручні перевизначення якості для конкретних ID контенту
        MANUAL_OVERRIDES: {
            '90802': { quality_code: 2160, full_label: '4K Web-DLRip' },
            '20873': { quality_code: 2160, full_label: '4K BDRip' },
            '1128655': { quality_code: 2160, full_label: '4K Web-DL' },
            '46010': { quality_code: 1080, full_label: '1080p Web-DLRip' },
            '9564': { quality_code: 1080, full_label: '1080p BDRemux' },
            '32334': { quality_code: 1080, full_label: '1080p Web-DLRip' },
            '21028': { quality_code: 1080, full_label: '1080p BDRemux' },
            '20932': { quality_code: 1080, full_label: '1080p HDTVRip' },
            '57778': { quality_code: 2160, full_label: '4K Web-DL' },
            '20977': { quality_code: 1080, full_label: 'HDTVRip-AVC' },
            '33645': { quality_code: 720, full_label: '720p HDTVRip' }
        }
    };

    var currentGlobalMovieId = null; // Змінна для відстеження поточного ID фільму

    // ===================== МАПИ ДЛЯ ПАРСИНГУ ЯКОСТІ =====================
    
    // Мапа для прямих відповідностей назв якості (fallback)
    var QUALITY_DISPLAY_MAP = {
        "WEBRip 1080p | AVC @ звук с TS": "1080P WEBRip/TS",
        "TeleSynch 1080P": "1080P TS",
        "4K Web-DL 10bit HDR P81 HEVC": "4K WEB-DL",
        "Telecine [H.264/1080P] [звук с TS] [AD]": "1080P TS",
        "WEB-DLRip @ Синема УС": "WEB-DLRip",
        "UHD Blu-ray disc 2160p": "4K Blu-ray",
        "Blu-ray disc 1080P]": "1080P Blu-ray",
        "Blu-Ray Remux (1080P)": "1080P BDRemux",
        "BDRemux 1080P] [Крупний план]": "1080P BDRemux",
        "Blu-ray disc (custom) 1080P]": "1080P BDRip",
        "DVDRip [AV1/2160p] [4K, SDR, 10-bit] [hand made Upscale AI]": "4K Upscale AI",
        "Hybrid (2160p)": "4K Hybrid",
        "Blu-ray disc] [Mastered in 4K] [Extended Cut]": "4K Blu-ray",
        "4K, HEVC, HDR / Blu-Ray Remux (2160p)": "4K BDRemux",
        "4K, HEVC, HDR, HDR10+, Dolby Vision / Hybrid (2160p)": "4K Hybrid",
        "4K, HEVC, HDR, Dolby Vision P7 / Blu-Ray Remux (2160p)": "4K BDRemux",
        "4K, HEVC, HDR, Dolby Vision / Blu-Ray Remux (2160p)": "4K BDRemux",
        "Blu-Ray Remux 2160p | 4K | HDR | Dolby Vision P7": "4K BDRemux",
        "4K, HEVC, HDR / WEB-DLRip (2160p)": "4K WEB-DLRip",
        "Blu-ray disc (custom) 1080P] [StudioCanal]": "1080P BDRip",
        "HDTVRip [H.264/720p]": "720p HDTVRip",
        "HDTVRip 720p": "720p HDTVRip",
        "2025 / ЛМ / TC": "TC", // Telecine

        // Стандартні варіанти якості
        "2160p": "4K", "4k": "4K", "4К": "4K", "1080p": "1080p", "1080": "1080p", 
        "1080i": "1080p", "hdtv 1080i": "1080i FHDTV", "480p": "SD", "480": "SD",
        "web-dl": "WEB-DL", "webrip": "WEBRip", "web-dlrip": "WEB-DLRip",
        "bluray": "BluRay", "bdrip": "BDRip", "bdremux": "BDRemux",
        "hdtvrip": "HDTVRip", "dvdrip": "DVDRip", "ts": "TS", "camrip": "CAMRip"
    };

    // Мапа для визначення роздільності з назви
    var RESOLUTION_MAP = {
        "2160p":"4K", "2160":"4K", "4k":"4K", "4к":"4K", "uhd":"4K", "ultra hd":"4K", "ultrahd":"4K", "dci 4k":"4K",
        "1440p":"QHD", "1440":"QHD", "2k":"QHD", "qhd":"QHD", // ← ДОДАТИ QHD
        "1080p":"1080p", "1080":"1080p", "1080i":"1080i", "full hd":"1080p", "fhd":"1080p",
        "720p":"720p", "720":"720p", "hd":"720p", "hd ready":"720p",
        "576p":"576p", "576":"576p", "pal":"576p", 
        "480p":"480p", "480":"480p", "sd":"480p", "standard definition":"480p", "ntsc":"480p",
        "360p":"360p", "360":"360p", "low":"360p"
    };

    // Мапа для визначення джерела відео (оновлена з web-dlrip)
    var SOURCE_MAP = {
        "blu-ray remux":"BDRemux", "uhd bdremux":"4K BDRemux", "bdremux":"BDRemux", 
        "remux":"BDRemux", "blu-ray disc":"Blu-ray", "bluray":"Blu-ray", 
        "blu-ray":"Blu-ray", "bdrip":"BDRip", "brrip":"BDRip",
        "uhd blu-ray":"4K Blu-ray", "4k blu-ray":"4K Blu-ray",
        "web-dl":"WEB-DL", "webdl":"WEB-DL", "web dl":"WEB-DL",
        "web-dlrip":"WEB-DLRip", "webdlrip":"WEB-DLRip", "web dlrip":"WEB-DLRip", // Додано web-dlrip варіанти
        "webrip":"WEBRip", "web rip":"WEBRip", "hdtvrip":"HDTVRip", 
        "hdtv":"HDTVRip", "hdrip":"HDRip", "dvdrip":"DVDRip", "dvd rip":"DVDRip", 
        "dvd":"DVD", "dvdscr":"DVDSCR", "scr":"SCR", "bdscr":"BDSCR", "r5":"R5",
        "hdrip": "HDRip",
        "screener": "SCR",
        "telecine":"TC", "tc":"TC", "hdtc":"TC", "telesync":"TS", "ts":"TS", 
        "hdts":"TS", "camrip":"CAMRip", "cam":"CAMRip", "hdcam":"CAMRip",
        "vhsrip":"VHSRip", "vcdrip":"VCDRip", "dcp":"DCP", "workprint":"Workprint", 
        "preair":"Preair", "tv":"TVRip", "line":"Line Audio", "hybrid":"Hybrid", 
        "uhd hybrid":"4K Hybrid", "upscale":"Upscale", "ai upscale":"AI Upscale",
        "bd3d":"3D Blu-ray", "3d blu-ray":"3D Blu-ray"
    };

    // Мапа для спрощення повних назв якості до коротких форматів
    var QUALITY_SIMPLIFIER_MAP = {
    // Висока якість (роздільність)
    "2160p": "4K", "2160": "4K", "4k": "4K", "4к": "4K", "uhd": "4K", "ultra hd": "4K", "dci 4k": "4K", "ultrahd": "4K",
    "1440p": "QHD", "1440": "QHD", "2k": "QHD", "qhd": "QHD", // Додано QHD/2K
    "1080p": "FHD", "1080": "FHD", "1080i": "FHD", "full hd": "FHD", "fhd": "FHD",
    "720p": "HD", "720": "HD", "hd ready": "HD", "hd": "HD",
    "480p": "SD", "480": "SD", "sd": "SD", "pal": "SD", "ntsc": "SD", "576p": "SD", "576": "SD", // Додано 576p та стандарти
    "360p": "LQ", "360": "LQ",

    // Погана якість (джерело) - мають пріоритет над роздільністю при відображенні
    "camrip": "CamRip", "cam": "CamRip", "hdcam": "CamRip", "камрип": "CamRip",
    "telesync": "TS", "ts": "TS", "hdts": "TS", "телесинк": "TS",
    "telecine": "TC", "tc": "TC", "hdtc": "TC", "телесин": "TC",
    "dvdscr": "SCR", "scr": "SCR", "bdscr": "SCR", "screener": "SCR", // Додано повне слово

    // Якісні джерела
    "remux": "Remux", "bdremux": "Remux", "blu-ray remux": "Remux", // Remux
    "bluray": "BR", "blu-ray": "BR", "bdrip": "BRip", "brrip": "BRip", // Blu-ray Rips
    "web-dl": "WebDL", "webdl": "WebDL", // WEB-DL
    "webrip": "WebRip", "web-dlrip": "WebDLRip", "webdlrip": "WebDLRip", // WEB Rips
    "hdtv": "HDTV", "hdtvrip": "HDTV", // HDTV
    "hdrip": "HDRip", // HDRip
    "dvdrip": "DVDRip", "dvd": "DVD" // DVD Quality
    };

    // ===================== СТИЛІ CSS =====================
    
    // Основні стилі для відображення якості
    var styleLQE = "<style id=\"lampa_quality_styles\">" +
        ".full-start-new__rate-line {" + // Стилі для лінії рейтингу повної картки
        "visibility: hidden;" + // Приховано під час завантаження
        "flex-wrap: wrap;" + // Дозволити перенос елементів
        "gap: 0.4em 0;" + // Відступи між елементами
        "}" +
        ".full-start-new__rate-line > * {" + // Стилі для всіх дітей лінії рейтингу
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
        ".card__quality {" + // Стилі для мітки якості на списковій картці
        " position: absolute; " + // Абсолютне позиціонування
        " bottom: 0.50em; " + // Відступ від низу
        " left: 0; " + // Вирівнювання по лівому краю
        " background-color: " + (LQE_CONFIG.LIST_CARD_LABEL_BACKGROUND_TRANSPARENT ? "transparent" : LQE_CONFIG.LIST_CARD_LABEL_BACKGROUND_COLOR) + " !important;" + // Колір фону
        " z-index: 10;" + // Z-index для поверх інших елементів
        " width: fit-content; " + // Ширина по вмісту
        " max-width: calc(100% - 1em); " + // Максимальна ширина
        " border-radius: 0 0.8em 0.8em 0.3em; " + // Закруглення кутів
        " overflow: hidden;" + // Обрізання переповнення
        "}" +
        ".card__quality div {" + // Стилі для тексту всередині мітки якості
        " text-transform: uppercase; " + // Великі літери
        " font-family: 'Roboto Condensed', 'Arial Narrow', Arial, sans-serif; " + // Шрифт
        " font-weight: 700; " + // Жирний шрифт
        " letter-spacing: 0.1px; " + // Відстань між літерами
        " font-size: 1.30em; " + // Розмір шрифту
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
        ".card__quality, .full-start__status.lqe-quality {" + // Елементи для анімації
        "opacity: 0;" + // Початково прозорі
        "transition: opacity 0.22s ease-in-out;" + // Плавна зміна прозорості
        "}" +
        ".card__quality.show, .full-start__status.lqe-quality.show {" + // Клас для показу
        "opacity: 1;" + // Повністю видимі
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
        ".full-start-new__rate-line {" + // Лінія рейтингу
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
        ".loading-dots__text {" + // Текст "Пошук..."
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
        "@media screen and (max-width: 480px) { .loading-dots-container { -webkit-justify-content: center; justify-content: center; text-align: center; max-width: 100%; }}" + // Адаптація для мобільних
        "</style>";

    Lampa.Template.add('lampa_quality_loading_animation_css', loadingStylesLQE);
    $('body').append(Lampa.Template.get('lampa_quality_loading_animation_css', {}, true));

    // ===================== МЕРЕЖЕВІ ФУНКЦІЇ =====================
    
    /**
     * Виконує запит через проксі з обробкою помилок (Залишено з V6)
     * @param {string} url - URL для запиту
     * @param {string} cardId - ID картки для логування
     * @param {function} callback - Callback функція
     */
    function fetchWithProxy(url, cardId, callback) {
        var currentProxyIndex = 0; // Поточний індекс проксі в списку
        var callbackCalled = false; // Прапорець виклику callback

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
            var timeoutId = setTimeout(function() {
                if (!callbackCalled) { // Якщо ще не отримали відповідь
                    currentProxyIndex++; // Переходимо до наступного проксі
                    tryNextProxy(); // Рекурсивний виклик
                }
            }, LQE_CONFIG.PROXY_TIMEOUT_MS);
            
            // Виконуємо fetch запит
            fetch(proxyUrl)
                .then(function(response) {
                    clearTimeout(timeoutId); // Очищаємо таймаут
                    if (!response.ok) throw new Error('Proxy error: ' + response.status); // Перевіряємо статус
                    return response.text(); // Повертаємо текст відповіді
                })
                .then(function(data) {
                    if (!callbackCalled) {
                        callbackCalled = true;
                        clearTimeout(timeoutId);
                        callback(null, data); // Успішний запит
                    }
                })
                .catch(function(error) {
                    console.error("LQE-LOG", "card: " + cardId + ", Proxy fetch error for " + proxyUrl + ":", error);
                    clearTimeout(timeoutId);
                    if (!callbackCalled) {
                        currentProxyIndex++; // Переходимо до наступного проксі
                        tryNextProxy(); // Рекурсивний виклик
                    }
                });
        }
        
        tryNextProxy(); // Починаємо з першого проксі
    }

    // ============================== Request queue (Lite-черга) - ВЗЯТО З Quality+ ===============================
    var requestQueue = [];
    var activeRequests = 0;

    /**
     * Додає завдання до черги на виконання
     * @param {function(function): void} fn - Функція, яку потрібно виконати. Приймає функцію done
     */
    function enqueueTask(fn) {
        requestQueue.push(fn);
        processQueue();
    }

    /**
     * Обробляє чергу, запускаючи завдання до ліміту MAX_PARALLEL_REQUESTS
     */
    function processQueue() {
        if (activeRequests >= LQE_CONFIG.MAX_PARALLEL_REQUESTS) return;
        var task = requestQueue.shift();
        if (!task) return;
        activeRequests++;
        try {
            task(function onTaskDone() {
                activeRequests--;
                // process next in next tick to avoid recursion
                setTimeout(processQueue, 0);
            });
        } catch (e) {
            activeRequests--;
            setTimeout(processQueue, 0);
        }
    }


    // ===================== АНІМАЦІЯ ЗАВАНТАЖЕННЯ =====================
    
    /**
     * Додає анімацію завантаження до картки (Залишено з V6)
     * @param {string} cardId - ID картки
     * @param {Element} renderElement - DOM елемент
     */
    function addLoadingAnimation(cardId, renderElement) {
        if (!renderElement) return; // Перевірка наявності елемента
        if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", Add loading animation");
        
        // Знаходимо лінію рейтингу в контексті renderElement
        var rateLine = $('.full-start-new__rate-line', renderElement);
        
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
     * Видаляє анімацію завантаження (Залишено з V6)
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
     * Визначає тип контенту (фільм/серіал) (Залишено з V6)
     * @param {object} cardData - Дані картки
     * @returns {string} - 'movie' або 'tv'
     */
    function getCardType(cardData) {
        var type = cardData.media_type || cardData.type; // Отримуємо тип з даних
        if (type === 'movie' || type === 'tv') return type; // Якщо тип визначено
        return cardData.name || cardData.original_name ? 'tv' : 'movie'; // Визначаємо по наявності назви
    }

    /**
     * Очищує та нормалізує назву для пошуку (Залишено з V6)
     * @param {string} title - Оригінальна назва
     * @returns {string} - Нормалізована назва
     */
    function sanitizeTitle(title) {
        if (!title) return ''; // Перевірка на пусту назву
        // Приводимо до нижнього регістру, замінюємо роздільники на пробіли, видаляємо зайві пробіли
        return title.toString().toLowerCase()
                   .replace(/[\._\-\[\]\(\),]+/g, ' ') // Заміна роздільників на пробіли
                   .replace(/\s+/g, ' ') // Видалення зайвих пробілів
                   .trim(); // Обрізка пробілів по краях
    }

    /**
     * Генерує ключ для кешу (Залишено з V6)
     * @param {number} version - Версія кешу
     * @param {string} type - Тип контенту
     * @param {string} id - ID картки
     * @returns {string} - Ключ кешу
     */
    function makeCacheKey(version, type, id) {
        return version + '_' + (type === 'tv' ? 'tv' : 'movie') + '_' + id; // Форматуємо ключ
    }

    // ===================== ПАРСИНГ ЯКОСТІ (Залишено з V6) =====================
    
    /**
     * Спрощує повну назву якості до короткого формату
     * @param {string} fullLabel - Повна назва якості
     * @param {string} originalTitle - Оригінальна назва торренту
     * @returns {string} - Спрощена назва
     */
    function simplifyQualityLabel(fullLabel, originalTitle) {
        if (!fullLabel) return ''; // Перевірка на пусту назву
        
        var lowerLabel = fullLabel.toLowerCase(); // Нижній регістр для порівняння
        var lowerTitle = (originalTitle || '').toLowerCase(); // Нижній регістр оригінальної назви
        
        // Високий пріоритет: спочатку шукаємо погани якості (для попередження користувача)
        // CamRip - найгірша якість (пріоритет 1)
        if (/(camrip|камрип|cam\b)/.test(lowerLabel) || /(camrip|камрип|cam\b)/.test(lowerTitle)) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "Simplified to CamRip");
            return "CamRip";
        }
        
        // TS (Telesync) - пріоритет 2
        if (/(telesync|телесинк|ts\b)/.test(lowerLabel) || /(telesync|телесинк|ts\b)/.test(lowerTitle)) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "Simplified to TS");
            return "TS";
        }
        
        // TC (Telecine) - пріоритет 3 (додано з Quality+)
        if (/(telecine|телесин|tc\b)/.test(lowerLabel) || /(telecine|телесин|tc\b)/.test(lowerTitle)) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "Simplified to TC");
            return "TC";
        }
        
        // SCR (DVD Screener) - пріоритет 4
        if (/(dvdscr|scr\b)/.test(lowerLabel) || /(dvdscr|scr\b)/.test(lowerTitle)) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "Simplified to SCR");
            return "SCR";
        }
        
        // Роздільність: якщо поганих якостей не знайдено
        // 4K (Ultra HD) - найвища якість
        if (/(2160p|4k|uhd|ultra hd)/.test(lowerLabel) || /(2160p|4k|uhd|ultra hd)/.test(lowerTitle)) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "Simplified to 4K");
            return "4K";
        }

        // 2К (QHD)
        if (/(1440p|1440|2k|qhd)/.test(lowerLabel) || /(1440p|1440|2k|qhd)/.test(lowerTitle)) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "Simplified to QHD");
            return "QHD";
        }
      
        // FHD (Full HD) - висока якість
        if (/(1080p|1080|fullhd|fhd)/.test(lowerLabel) || /(1080p|1080|fullhd|fhd)/.test(lowerTitle)) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "Simplified to FHD");
            return "FHD";
        }
        
        // HD (High Definition) - середня якість
        if (/(720p|720|hd\b)/.test(lowerLabel) || /(720p|720|hd\b)/.test(lowerTitle)) {
            // Перевіряємо що це не частина іншого слова (наприклад, "fullhd")
            var hdRegex = /(720p|720|^hd$| hd |hd$)/;
            if (hdRegex.test(lowerLabel) || hdRegex.test(lowerTitle)) {
                if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "Simplified to HD");
                return "HD";
            }
        }
        
        // SD (Standard Definition) - базова якість
        if (/(480p|480|sd\b)/.test(lowerLabel) || /(480p|480|sd\b)/.test(lowerTitle)) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "Simplified to SD");
            return "SD";
        }
        
        // LQ (Low Quality) - дуже низька якість
        if (/(360p|360|low quality|lq\b)/.test(lowerLabel) || /(360p|360|low quality|lq\b)/.test(lowerTitle)) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "Simplified to LQ");
            return "LQ";
        }
        
        // Fallback: якщо нічого не знайдено, повертаємо оригінальну назву
        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "No simplification found, keeping original:", fullLabel);
        return fullLabel;
    }

    /**
     * Перетворює технічну назву якості на читабельну
     * @param {number} qualityCode - Код якості
     * @param {string} fullTorrentTitle - Повна назва торренту
     * @returns {string} - Відформатована назва якості
     */
    function translateQualityLabel(qualityCode, fullTorrentTitle) {
        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "translateQualityLabel:", qualityCode, fullTorrentTitle);
        var title = sanitizeTitle(fullTorrentTitle || ''); // Нормалізуємо назву
        var titleForSearch = ' ' + title + ' '; // Додаємо пробіли для точного пошуку

        // Пошук роздільності в назві
        var resolution = '';
        var bestResKey = '';
        var bestResLen = 0;
        for (var rKey in RESOLUTION_MAP) {
            if (!RESOLUTION_MAP.hasOwnProperty(rKey)) continue; // Перевірка власної властивості
            var lk = rKey.toString().toLowerCase(); // Нижній регістр ключа
            // Шукаємо повне слово в назві
            if (titleForSearch.indexOf(' ' + lk + ' ') !== -1 || title.indexOf(lk) !== -1) {
                // Вибираємо найдовший збіг (найточніший)
                if (lk.length > bestResLen) {
                    bestResLen = lk.length;
                    bestResKey = rKey;
                }
            }
        }
        if (bestResKey) resolution = RESOLUTION_MAP[bestResKey]; // Отримуємо роздільність

        // Пошук джерела в назві
        var source = '';
        var bestSrcKey = '';
        var bestSrcLen = 0;
        for (var sKey in SOURCE_MAP) {
            if (!SOURCE_MAP.hasOwnProperty(sKey)) continue;
            var lk2 = sKey.toString().toLowerCase();
            if (titleForSearch.indexOf(' ' + lk2 + ' ') !== -1 || title.indexOf(lk2) !== -1) {
                if (lk2.length > bestSrcLen) {
                    bestSrcLen = lk2.length;
                    bestSrcKey = sKey;
                }
            }
        }
        if (bestSrcKey) source = SOURCE_MAP[bestSrcKey]; // Отримуємо джерело

        // Комбінуємо роздільність та джерело
        var finalLabel = '';
        if (resolution && source) {
            if (source.toLowerCase().includes(resolution.toLowerCase())) {
                finalLabel = source; // Якщо джерело вже містить роздільність
            } else {
                finalLabel = resolution + ' ' + source; // Комбінуємо
            }
        } else if (resolution) {
            finalLabel = resolution; // Тільки роздільність
        } else if (source) {
            finalLabel = source; // Тільки джерело
        }

        // Fallback на пряму мапу
        if (!finalLabel || finalLabel.trim() === '') {
            var bestDirectKey = '';
            var maxDirectLen = 0;
            for (var qk in QUALITY_DISPLAY_MAP) {
                if (!QUALITY_DISPLAY_MAP.hasOwnProperty(qk)) continue;
                var lkq = qk.toString().toLowerCase();
                if (title.indexOf(lkq) !== -1) {
                    if (lkq.length > maxDirectLen) {
                        maxDirectLen = lkq.length;
                        bestDirectKey = qk;
                    }
                }
            }
            if (bestDirectKey) {
                finalLabel = QUALITY_DISPLAY_MAP[bestDirectKey]; // Використовуємо пряму мапу
            }
        }

        // Останній fallback
        if (!finalLabel || finalLabel.trim() === '') {
            if (qualityCode) {
                var qc = String(qualityCode).toLowerCase();
                finalLabel = QUALITY_DISPLAY_MAP[qc] || qualityCode; // По коду або оригіналу
            } else {
                finalLabel = fullTorrentTitle || ''; // Оригінальна назва
            }
        }

        // Автоматичне спрощення якості (якщо увімкнено в конфігурації)
        if (LQE_CONFIG.USE_SIMPLE_QUALITY_LABELS) {
            var simplifiedLabel = simplifyQualityLabel(finalLabel, fullTorrentTitle);
            if (simplifiedLabel && simplifiedLabel !== finalLabel) {
                if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "Simplified quality:", finalLabel, "→", simplifiedLabel);
                finalLabel = simplifiedLabel;
            }
        }

        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "Final quality label:", finalLabel);
        return finalLabel;
    }

    // ===================== ФУНКЦІЇ КЕШУВАННЯ (Залишено з V6) =====================
    
    /**
     * Отримує кеш з LocalStorage
     * @returns {object} - Об'єкт кешу
     */
    function getCache() {
        try {
            var cached = Lampa.Storage.get(LQE_CONFIG.CACHE_KEY);
            return typeof cached === 'object' && cached !== null ? cached : {};
        } catch (e) {
            console.error("LQE-LOG", "Cache read error:", e);
            return {};
        }
    }

    /**
     * Зберігає кеш в LocalStorage
     * @param {object} cache - Об'єкт кешу
     */
    function setCache(cache) {
        try {
            Lampa.Storage.set(LQE_CONFIG.CACHE_KEY, cache);
        } catch (e) {
            console.error("LQE-LOG", "Cache write error:", e);
        }
    }

    /**
     * Отримує якість з кешу
     * @param {object} cardData - Дані картки
     * @returns {object|null} - Дані якості або null
     */
    function getStoredQuality(cardData) {
        var cardId = cardData.id;
        var type = getCardType(cardData);
        var cache = getCache();
        var key = makeCacheKey(LQE_CONFIG.CACHE_VERSION, type, cardId);
        
        var cachedItem = cache[key];
        
        if (cachedItem && cachedItem.timestamp) {
            var now = Date.now();
            var isExpired = now - cachedItem.timestamp > LQE_CONFIG.CACHE_VALID_TIME_MS;
            var isDueForRefresh = now - cachedItem.timestamp > LQE_CONFIG.CACHE_REFRESH_THRESHOLD_MS;
            
            if (isExpired) {
                if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Cache expired, forcing search.");
                delete cache[key]; // Видаляємо прострочений кеш
                setCache(cache);
                return null;
            }
            
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Found in cache. Refresh due:", isDueForRefresh);
            
            // Якщо час оновлення настав, повертаємо старий результат, але плануємо фоновий пошук
            if (isDueForRefresh) {
                // Фонове оновлення буде ініційоване у processCardListQuality або processFullCardQuality
                cachedItem.needs_refresh = true;
            }
            
            return cachedItem;
        }
        
        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Not found in cache.");
        
        // Перевірка ручних перевизначень
        if (LQE_CONFIG.MANUAL_OVERRIDES.hasOwnProperty(cardId)) {
            var override = LQE_CONFIG.MANUAL_OVERRIDES[cardId];
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Found manual override:", override);
            return override; // Повертаємо ручне перевизначення без кешування
        }
        
        return null;
    }

    /**
     * Зберігає якість у кеші
     * @param {object} cardData - Дані картки
     * @param {object} qualityResult - Результат пошуку якості
     */
    function setStoredQuality(cardData, qualityResult) {
        var cardId = cardData.id;
        var type = getCardType(cardData);
        var cache = getCache();
        var key = makeCacheKey(LQE_CONFIG.CACHE_VERSION, type, cardId);
        
        var now = Date.now();
        
        cache[key] = {
            quality_code: qualityResult.quality_code || qualityResult.quality, // Приймаємо quality або quality_code
            full_label: qualityResult.full_label,
            timestamp: now
        };
        
        setCache(cache);
        
        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Quality stored in cache:", cache[key]);
    }

    // ===================== CORE: ЯКІСТЬ З JACRED (ВЗЯТО З Quality+) =====================

    /**
     * Знаходить найкращий реліз через JacRed API, використовуючи чергу.
     * Логіка пошуку і порівняння якості тут така ж, як в Quality+.js.
     * * @param {object} normalizedCard - Дані картки (з полями id, title, original_title, release_date)
     * @param {string} cardId - ID картки для логування
     * @param {function} callback - Callback (result)
     */
    function getBestReleaseFromJacred(normalizedCard, cardId, callback) {
        // обгортка, яка поміщає пошук у чергу
        enqueueTask(function(done) {
            // Вся логіка пошуку JacRedApi вбудована тут
            if (!LQE_CONFIG.JACRED_URL) {
                if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", JacRed: JACRED_URL is not set.");
                callback(null);
                done();
                return;
            }
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", JacRed: Search initiated.");
            var year = '';
            var dateStr = normalizedCard.release_date || '';
            if (dateStr.length >= 4) {
                year = dateStr.substring(0, 4);
            }
            if (!year || isNaN(year)) {
                if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", JacRed: Missing/invalid year for normalizedCard:", normalizedCard);
                callback(null);
                done();
                return;
            }

            /**
             * Виконує запит до JacRed API
             * @param {string} searchTitle 
             * @param {string} searchYear 
             * @param {boolean} exactMatch 
             * @param {string} strategyName 
             * @param {function} apiCallback 
             */
            function searchJacredApi(searchTitle, searchYear, exactMatch, strategyName, apiCallback) {
                var userId = Lampa.Storage.get('lampac_unic_id', '');
                var apiUrl = LQE_CONFIG.JACRED_PROTOCOL + LQE_CONFIG.JACRED_URL + '/api/v1.0/torrents?search=' +
                    encodeURIComponent(searchTitle) +
                    '&year=' + searchYear +
                    (exactMatch ? '&exact=true' : '') +
                    '&uid=' + userId;
                if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", JacRed: " + strategyName + " URL: " + apiUrl);

                // Загальний таймаут для пошуку з проксі
                var totalTimeoutMs = LQE_CONFIG.PROXY_TIMEOUT_MS * LQE_CONFIG.PROXY_LIST.length + 1000;
                var timeoutId = setTimeout(function() {
                    if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", JacRed: " + strategyName + " request timed out.");
                    apiCallback(null);
                }, totalTimeoutMs);

                fetchWithProxy(apiUrl, cardId, function(error, responseText) {
                    clearTimeout(timeoutId);
                    if (error) {
                        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card:" + cardId + ", JacRed fetch error:", error);
                        apiCallback(null);
                        return;
                    }
                    if (!responseText) {
                        apiCallback(null);
                        return;
                    }
                    try {
                        var torrents = JSON.parse(responseText);
                        if (!Array.isArray(torrents) || torrents.length === 0) {
                            apiCallback(null);
                            return;
                        }
                        var bestNumericQuality = -1;
                        var bestFoundTorrent = null;
                        var searchYearNum = parseInt(searchYear, 10);

                        /** Допоміжна функція для визначення якості з назви торрента, якщо вона відсутня в API */
                        function extractNumericQualityFromTitle(title) {
                            if (!title) return 0;
                            var lower = title.toLowerCase();
                            if (/2160p|4k|uhd/.test(lower)) return 2160;
                            if (/1080p/.test(lower)) return 1080;
                            if (/720p/.test(lower)) return 720;
                            if (/480p|sd/.test(lower)) return 480;
                            if (/ts|telesync/.test(lower)) return 1;
                            if (/camrip|камрип/.test(lower)) return 2;
                            return 0;
                        }

                        /** Допоміжна функція для вилучення року з назви торрента, якщо він відсутній в API */
                        function extractYearFromTitle(title) {
                            if (!title) return 0;
                            var regex = /(?:^|[^\d])(\d{4})(?:[^\d]|$)/g;
                            var match;
                            var lastYear = 0;
                            var currentYear = new Date().getFullYear();
                            while ((match = regex.exec(title)) !== null) {
                                var extractedYear = parseInt(match[1], 10);
                                if (extractedYear >= 1900 && extractedYear <= currentYear + 1) {
                                    lastYear = extractedYear;
                                }
                            }
                            return lastYear;
                        }

                        for (var i = 0; i < torrents.length; i++) {
                            var currentTorrent = torrents[i];
                            var currentNumericQuality = currentTorrent.quality;

                            // 1. Визначення якості
                            if (typeof currentNumericQuality !== 'number' || currentNumericQuality === 0) {
                                var extractedQuality = extractNumericQualityFromTitle(currentTorrent.title);
                                if (extractedQuality > 0) {
                                    currentNumericQuality = extractedQuality;
                                } else {
                                    continue; // Якщо не змогли визначити якість, пропускаємо
                                }
                            }

                            // 2. Валідація року
                            var torrentYear = currentTorrent.relased;
                            var isYearValid = false;
                            var parsedYear = 0;
                            if (torrentYear && !isNaN(torrentYear) && torrentYear > 1900) {
                                parsedYear = parseInt(torrentYear, 10);
                                isYearValid = true;
                            }
                            if (!isYearValid) {
                                parsedYear = extractYearFromTitle(currentTorrent.title);
                                if (parsedYear > 0) {
                                    torrentYear = parsedYear;
                                    isYearValid = true;
                                }
                            }
                            
                            // Порівняння року (якщо рік відомий і він не збігається, пропускаємо)
                            if (isYearValid && !isNaN(searchYearNum) && parsedYear !== searchYearNum) {
                                if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Torrent year mismatch, skipping. Torrent: " + currentTorrent.title + ", Searched: " + searchYearNum + ", Found: " + parsedYear);
                                continue;
                            }

                            // 3. Логування та порівняння
                            if (LQE_CONFIG.LOGGING_QUALITY) {
                                console.log(
                                    "LQE-QUALITY",
                                    "card: " + cardId +
                                    ", Torrent: " + currentTorrent.title +
                                    " | Quality: " + currentNumericQuality + "p" +
                                    " | Year: " + (isYearValid ? parsedYear : "unknown") +
                                    " | Strategy: " + strategyName
                                );
                            }

                            if (currentNumericQuality > bestNumericQuality) {
                                bestNumericQuality = currentNumericQuality;
                                bestFoundTorrent = currentTorrent;
                            } else if (currentNumericQuality === bestNumericQuality && bestFoundTorrent && currentTorrent.title.length > bestFoundTorrent.title.length) {
                                // Якщо якість однакова, віддаємо перевагу довшій назві (часто повніша інформація)
                                bestFoundTorrent = currentTorrent;
                            }
                        }
                        
                        // 4. Повернення результату
                        if (bestFoundTorrent) {
                            apiCallback({
                                quality_code: bestFoundTorrent.quality || bestNumericQuality,
                                full_label: bestFoundTorrent.title
                            });
                        } else {
                            apiCallback(null);
                        }
                    } catch (e) {
                        console.error("LQE-LOG", "card: " + cardId + ", JacRed processing error:", e);
                        apiCallback(null);
                    }
                });
            }

            // Стратегії пошуку
            var searchStrategies = [];
            // Стратегія 1: Оригінальна назва (OriginalTitle) + Точний рік
            if (normalizedCard.original_title && (/[a-zа-яё]/i.test(normalizedCard.original_title) || /^\d+$/.test(normalizedCard.original_title))) {
                searchStrategies.push({
                    title: normalizedCard.original_title.trim(),
                    year: year,
                    exact: true,
                    name: "OriginalTitle Exact Year"
                });
            }
            // Стратегія 2: Локалізована назва (Title) + Точний рік
            if (normalizedCard.title && (/[a-zа-яё]/i.test(normalizedCard.title) || /^\d+$/.test(normalizedCard.title))) {
                searchStrategies.push({
                    title: normalizedCard.title.trim(),
                    year: year,
                    exact: true,
                    name: "Title Exact Year"
                });
            }

            // Виконання стратегій по черзі
            function executeNextStrategy(index) {
                if (index >= searchStrategies.length) {
                    if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", JacRed: All strategies failed. No quality found.");
                    callback(null);
                    done(); // Повідомляємо чергу, що завершено
                    return;
                }
                var strategy = searchStrategies[index];
                if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", JacRed: Trying strategy: " + strategy.name);
                
                searchJacredApi(strategy.title, strategy.year, strategy.exact, strategy.name, function(result) {
                    if (result !== null) {
                        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", JacRed: Successfully found quality using strategy " + strategy.name + ": " + result.quality_code + " (torrent: \"" + result.full_label + "\")");
                        callback(result);
                        done(); // Повідомляємо чергу, що завершено
                    } else {
                        executeNextStrategy(index + 1); // Переходимо до наступної стратегії
                    }
                });
            }
            if (searchStrategies.length > 0) {
                executeNextStrategy(0); // Починаємо з першої стратегії
            } else {
                if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", JacRed: No valid search titles or strategies defined.");
                callback(null);
                done(); // Повідомляємо чергу, що завершено
            }
        });
    }

    // ===================== ОСНОВНА ЛОГІКА (Залишено з V6) =====================

    /**
     * Відображає мітку якості на картці
     * @param {string} qualityLabel - Відформатована мітка якості
     * @param {Element} element - DOM елемент картки
     */
    function renderQualityLabel(qualityLabel, element) {
        if (!qualityLabel || !element) return;
        
        var isFullCard = element.classList.contains('full-start-new');
        var qualityElement = null;

        if (isFullCard) {
            // Для повної картки
            var rateLine = element.querySelector('.full-start-new__rate-line');
            if (rateLine) {
                // Створюємо елемент мітки якості
                qualityElement = document.createElement('div');
                qualityElement.classList.add('lqe-quality', 'full-start__status', 'show'); // show для анімації
                qualityElement.textContent = qualityLabel;
                
                // Знаходимо останній елемент у rateLine (зазвичай жанри або рейтинг)
                var lastElement = rateLine.lastElementChild;
                
                // Вставляємо мітку якості перед останнім елементом (або в кінці, якщо він відсутній)
                if (lastElement && !lastElement.classList.contains('lqe-quality')) {
                    // Якщо останній елемент - не наша мітка якості, вставляємо перед ним
                    rateLine.insertBefore(qualityElement, lastElement);
                } else {
                    // Якщо rateLine порожній або містить тільки наші елементи, додаємо в кінці
                    rateLine.appendChild(qualityElement);
                }
                
                // Робимо rateLine видимим після додавання контенту
                rateLine.style.visibility = 'visible';
            }
        } else {
            // Для картки у списку
            var cardView = element.querySelector('.card__view');
            if (cardView && !cardView.querySelector('.card__quality')) {
                qualityElement = document.createElement('div');
                qualityElement.classList.add('card__quality', 'show');
                qualityElement.innerHTML = '<div>' + qualityLabel + '</div>';
                cardView.appendChild(qualityElement);
            }
        }
    }

    /**
     * Основна функція обробки якості для карток у списку
     * @param {object} cardData - Дані картки
     * @param {Element} element - DOM елемент картки
     */
    function processCardListQuality(cardData, element) {
        var cardId = cardData.id;
        var type = getCardType(cardData);
        
        if (type === 'tv' && !LQE_CONFIG.SHOW_QUALITY_FOR_TV_SERIES) {
            if (LQE_CONFIG.LOGGING_CARDLIST) console.log("LQE-CARD", "card: " + cardId + ", Skipping TV series due to config.");
            return;
        }

        var cachedQuality = getStoredQuality(cardData);
        var needSearch = true;
        
        if (cachedQuality) {
            var qualityLabel = translateQualityLabel(cachedQuality.quality_code, cachedQuality.full_label);
            renderQualityLabel(qualityLabel, element);
            needSearch = cachedQuality.needs_refresh || false;
            
            if (!needSearch && LQE_CONFIG.LOGGING_CARDLIST) {
                console.log("LQE-CARD", "card: " + cardId + ", Quality from cache:", qualityLabel);
                return;
            }
        }
        
        if (needSearch) {
            // Використовуємо нову, більш надійну функцію пошуку з чергою
            getBestReleaseFromJacred(cardData, cardId, function(result) {
                if (result && result.quality_code) {
                    setStoredQuality(cardData, result);
                    var qualityLabel = translateQualityLabel(result.quality_code, result.full_label);
                    renderQualityLabel(qualityLabel, element);
                    if (LQE_CONFIG.LOGGING_CARDLIST) console.log("LQE-CARD", "card: " + cardId + ", Found new quality after search:", qualityLabel);
                } else if (LQE_CONFIG.LOGGING_CARDLIST) {
                    console.log("LQE-CARD", "card: " + cardId + ", Search completed, no result.");
                }
            });
        }
    }

    /**
     * Основна функція обробки якості для повної картки
     * @param {object} cardData - Дані повної картки
     * @param {Element} renderElement - DOM елемент
     */
    function processFullCardQuality(cardData, renderElement) {
        var cardId = cardData.id;
        var type = getCardType(cardData);
        
        removeLoadingAnimation(cardId, renderElement); // Видаляємо стару анімацію, якщо є
        
        // Видаляємо всі попередні мітки якості
        $('.lqe-quality', renderElement).remove();
        
        if (type === 'tv' && !LQE_CONFIG.SHOW_QUALITY_FOR_TV_SERIES) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Skipping TV series due to config.");
            return;
        }

        var cachedQuality = getStoredQuality(cardData);
        var needSearch = true;
        
        if (cachedQuality) {
            var qualityLabel = translateQualityLabel(cachedQuality.quality_code, cachedQuality.full_label);
            renderQualityLabel(qualityLabel, renderElement);
            needSearch = cachedQuality.needs_refresh || false;
            
            if (!needSearch) {
                if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Quality from cache:", qualityLabel);
                return;
            }
        }
        
        if (needSearch) {
            addLoadingAnimation(cardId, renderElement); // Додаємо анімацію пошуку
            
            // Використовуємо нову, більш надійну функцію пошуку з чергою
            getBestReleaseFromJacred(cardData, cardId, function(result) {
                removeLoadingAnimation(cardId, renderElement); // Видаляємо анімацію після завершення
                
                if (result && result.quality_code) {
                    setStoredQuality(cardData, result);
                    var qualityLabel = translateQualityLabel(result.quality_code, result.full_label);
                    renderQualityLabel(qualityLabel, renderElement);
                    if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Found new quality after search:", qualityLabel);
                } else if (LQE_CONFIG.LOGGING_QUALITY) {
                    console.log("LQE-QUALITY", "card: " + cardId + ", Search completed, no result.");
                }
            });
        }
    }

    // ===================== OBSERVER & INIT (Залишено з V6) =====================

    /**
     * Обробник змін DOM для динамічно завантажуваних карток
     * @param {Array<MutationRecord>} mutations - Масив змін
     */
    function processMutations(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                Array.from(mutation.addedNodes).forEach(function(node) {
                    if (node.nodeType === 1 && node.classList.contains('card')) {
                        // Це елемент картки
                        var cardElement = node;
                        var cardData = cardElement.data; // Дані картки зберігаються у властивості data

                        if (cardData && cardData.id) {
                            if (LQE_CONFIG.LOGGING_CARDLIST) console.log("LQE-CARD", "New card added, ID:", cardData.id);
                            // Обробляємо якість для цієї картки
                            processCardListQuality(cardData, cardElement);
                        }
                    }
                });
            }
        });
    }

    /**
     * Прикріплює MutationObserver до контейнерів карток
     */
    function attachObserver() {
        if (typeof MutationObserver === 'undefined') {
            if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "MutationObserver not supported.");
            return;
        }

        var observer = new MutationObserver(processMutations);
        var targets = document.querySelectorAll('.cards, .card-list, .content, .main, .cards-list, .preview__list');
        var targetsFound = false;
        
        if (targets && targets.length) {
            for (var i = 0; i < targets.length; i++) {
                try {
                    observer.observe(targets[i], { childList: true, subtree: true });
                    targetsFound = true;
                } catch (e) {
                    if (LQE_CONFIG.LOGGING_GENERAL) console.error("LQE-LOG", "Error observing target:", e);
                }
            }
        }
        
        // Фоллбек на тіло документа, якщо цільові контейнери не знайдено
        if (!targetsFound) {
            try {
                observer.observe(document.body, { childList: true, subtree: true });
            } catch (e) {
                if (LQE_CONFIG.LOGGING_GENERAL) console.error("LQE-LOG", "Error observing document body:", e);
            }
        }
    }

    /**
     * Ініціалізація плагіна якості
     */
    function initializeLampaQualityPlugin() {
        if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "Lampa Quality Enhancer: Initializing...");
        
        window.lampaQualityPlugin = true; // Позначаємо плагін як ініціалізований
        
        attachObserver(); // Налаштовуємо спостерігач
        if (LQE_CONFIG.LOGGING_GENERAL) console.log('LQE-LOG: MutationObserver started');
        
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
            initializeLampaQualityPlugin(); // Ініціалізуємо одразу
        }
    }

})();

/**
 * Quality+Mod - Enhanced Quality Plugin for Lampa
 * --------------------------------------------------------------------------------
 * Розширений плагін для автоматичного визначення та відображення якості відео
 * Інтегрується з JacRed API для пошуку найкращих доступних релізів.
 * --------------------------------------------------------------------------------
 * Основні можливості:
 * - Автоматичне визначення якості відео (4K, FHD, HD, SD) з торрент-трекера JacRed
 * - Розширена система парсингу якості з розпізнаванням роздільності та джерела
 * - Підтримка спрощених міток якості (4K, FHD, TS, TC тощо) з можливістю налаштування
 * - Відображення міток якості на повних картках та спискових картках з кастомними стилями
 * - Ручні перевизначення якості для конкретних ID контенту
 * - Розумна система кешування з фоновим оновленням (24 години валідності)
 * - Оптимізована черга запитів з обмеженням паралельності (до 12 одночасних запитів)
 * - Підтримка проксі для обходу CORS обмежень
 * - Фолбек логіка, щоб не брати не той реліз (серіал замість фільму і навпаки)
 * - Підтримка Android TV / TV Box (правильний показ плашок якості навіть коли рендер карток відбувся до ініціалізації)
 * - Уникнення дублів якості ("4K 4K" і т.п.)
 */

(function() {
    'use strict'; // Використання суворого режиму для запобігання помилок

    // ===================== КОНФІГУРАЦІЯ =====================
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

        // Налаштування позиціонування бейджа якості у спискових картках
        LIST_CARD_LABEL_STICK_TO_POSTER_EDGE: false, // false = бейдж трохи за межами постера (оригінальний вигляд); true = всередині постера (режим для ТВ)
        LIST_CARD_LABEL_Z_INDEX: 20, // z-index для бейджа у спискових картках
        
        // Ручні перевизначення якості для конкретних ID контенту
		MANUAL_OVERRIDES: {
    		'338969': { 
        		quality_code: 2160, 
        		full_label: '4K WEB-DL', //✅ Повна мітка
        		simple_label: '4K'  	 //✅ Спрощена мітка
    		},
    		'654028': { 
        		quality_code: 2160, 
        		full_label: '4K WEB-DL', //✅ Повна мітка
        		simple_label: '4K'  	 //✅ Спрощена мітка
    		},
	    	'12556': { 
        		quality_code: 1080, 
        		full_label: '1080 ВDRemux', //✅ Повна мітка
        		simple_label: 'FHD'  	 //✅ Спрощена мітка
    		},
    		'604079': { 
        		quality_code: 2160, 
        		full_label: '4K WEB-DL', //✅ Повна мітка
        		simple_label: '4K'  	 //✅ Спрощена мітка
    		},
	    	'1267905': { 
        		quality_code: 2160, 
        		full_label: '4K WEB-DL', //✅ Повна мітка
        		simple_label: '4K'  	 //✅ Спрощена мітка
    		},
            /* приклад:
    		'000000': { 
        		quality_code: 1080, 
        		full_label: '1080p WEB-DLRip',  //✅ Повна мітка
        		simple_label: 'FHD'  		    //✅ Спрощена мітка
    		},*/
		}
    };
    var currentGlobalMovieId = null; // Змінна для відстеження поточного ID фільму

    // ===================== МАПИ ДЛЯ ПАРСИНГУ ЯКОСТІ =====================
    
    // Мапа для прямих відповідностей назв якості (fallback)
    var QUALITY_DISPLAY_MAP = {
        "WEBRip 1080p | AVC @ звук с TS": "1080P WEBRip/TS",
        "TeleSynch 1080P": "1080P TS",
        "4K Web-DL 10bit HDR P81 HEVC": "4K WEB-DL",
        "4K WEB-DL": "4K WEB-DL",
        "4K WEBRip": "4K WEBRip",
        "4K WEBRip HDR": "4K WEBRip HDR",
        "4K HDRip": "4K HDRip",
        "4K HDR": "4K HDR",
        "4K CAMRip": "4K CAMRip",
        "REMUX 2160p": "4K BDRemux",
        "2160p REMUX": "4K BDRemux",
        "UHD BDRemux": "4K BDRemux",
        "4K BDRemux": "4K BDRemux",
        "4K Blu-ray": "4K Blu-ray",
        "Blu-ray Remux": "BDRemux",
        "BDRemux": "BDRemux",
        "BDRip 1080p": "1080p BDRip",
        "WEB-DL 1080p": "1080p WEB-DL",
        "WEB-DLRip 1080p": "1080p WEB-DLRip",
        "HDRip 1080p": "1080p HDRip",
        "HDTVRip 1080p": "1080p HDTVRip",
        "HDTV 1080p": "1080p HDTV",
        "WEBrip 720p": "720p WEBRip",
        "HDTVRip 720p": "720p HDTVRip",
        "HDRip 720p": "720p HDRip",
        "DVDRip": "DVD",
        "TS 720p": "TS 720p",
        "TS 1080p": "TS 1080p",
        "TeleSynch": "TS",
        "Telesync": "TS",
        "TS": "TS",
        "TC": "TC",
        "CAMRip": "CAMRip",
        "CAM": "CAMRip",
        "HDCAM": "CAMRip",
        "WORKPRINT": "Workprint",
        "Preair": "Preair"
    };

    // Мапа для визначення роздільності з назви
    var RESOLUTION_MAP = {
        "2160p":"4K", "2160":"4K", "4k":"4K", "4к":"4K", "uhd":"4K", "ultra hd":"4K", "ultrahd":"4K", "dci 4k":"4K",
        "1440p":"QHD", "1440":"QHD", "2k":"QHD", "qhd":"QHD",
        "1080p":"1080p", "1080":"1080p", "1080i":"1080i", "full hd":"1080p", "fhd":"1080p",
        "720p":"720p", "720":"720p", "hd":"720p", "hd ready":"720p",
        "576p":"576p", "576":"576p", "pal":"576p", 
        "480p":"480p", "480":"480p", "sd":"480p", "standard definition":"480p", "ntsc":"480p",
        "360p":"360p", "360":"360p", "low":"360p"
    };

    // Мапа для визначення джерела відео
    var SOURCE_MAP = {
        "blu-ray remux":"BDRemux", "uhd bdremux":"4K BDRemux", "bdremux":"BDRemux", 
        "remux":"BDRemux", "blu-ray disc":"Blu-ray", "bluray":"Blu-ray", 
        "blu-ray":"Blu-ray", "bdrip":"BDRip", "brrip":"BDRip",
        "uhd blu-ray":"4K Blu-ray", "4k blu-ray":"4K Blu-ray",
        "web-dl":"WEB-DL", "webdl":"WEB-DL", "web dl":"WEB-DL",
        "web-dlrip":"WEB-DLRip", "webdlrip":"WEB-DLRip", "web dlrip":"WEB-DLRip",
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
        // Якість (роздільність)
        "2160p": "4K", "2160": "4K", "4k": "4K", "4к": "4K", "uhd": "4K", "ultra hd": "4K", "dci 4k": "4K", "ultrahd": "4K",
        "1440p": "QHD", "1440": "QHD", "2k": "QHD", "qhd": "QHD",
        "1080p": "FHD", "1080": "FHD", "1080i": "FHD", "full hd": "FHD", "fhd": "FHD",
        "720p": "HD", "720": "HD", "hd ready": "HD", "hd": "HD",
        "480p": "SD", "480": "SD", "sd": "SD", "pal": "SD", "ntsc": "SD", "576p": "SD", "576": "SD",
        "360p": "LQ", "360": "LQ",

        // Джерела
        "uhd bdremux": "4K BDRemux", "bdremux": "BDRemux", "remux": "BDRemux", "blu-ray remux": "BDRemux",
        "4k bdremux": "4K BDRemux", "uhd blu-ray": "4K Blu-ray", "4k blu-ray": "4K Blu-ray",
        "bdrip": "BDRip", "brrip": "BDRip", "bdrip 1080p": "BDRip",
        "webrip": "WebRip", "web-rip": "WebRip", "web rip": "WebRip",
        "web-dl": "WebDL", "webdl": "WebDL",
        "webrip 4k": "4K WebRip", "web-dl 4k": "4K WebDL",
        "web-dlrip": "WebDLRip", "webdlrip": "WebDLRip", "web dlrip": "WebDLRip",
        "hdtv": "HDTV", "hdtvrip": "HDTV",
        "hdrip": "HDRip",
        "dvdrip": "DVDRip", "dvd": "DVD",
        "camrip": "CAMRip", "cam": "CAMRip", "hdcam": "CAMRip",
        "telesync": "TS", "telecine": "TC", "tc": "TC", "ts": "TS",
        "hdts": "TS",
        "workprint": "Workprint",
        "preair": "Preair",
        "line": "LINE"
    };

    // ===================== УТІЛІТИ, КЕШ, МЕРЕЖА і т.д. =====================
    // (нижче код зберігає твою логіку: кеш, JacRed, черга, парсинг якості, observer і т.д.)
    // В тих місцях, де в отриманому файлі були урізані шматки типу "...",
    // вони лишаються такими ж, щоб не вигадувати дані, яких тут немає.

    // ===================== СТИЛІ CSS =====================

    // Динамічні значення позиціонування бейджа якості в спискових картках
    var cardQualityLeft = LQE_CONFIG.LIST_CARD_LABEL_STICK_TO_POSTER_EDGE ? "0.3em" : "0";
    var cardQualityMarginLeft = LQE_CONFIG.LIST_CARD_LABEL_STICK_TO_POSTER_EDGE ? "0" : "-0.78em";
    var cardQualityZIndex = (typeof LQE_CONFIG.LIST_CARD_LABEL_Z_INDEX !== 'undefined') ? LQE_CONFIG.LIST_CARD_LABEL_Z_INDEX : 10;
    
    // Основні стилі для відображення якості
    var styleLQE = "<style id=\"lampa_quality_styles\">" +
        ".full-start-new__rate-line, .full-start__rate-line {" + // Контейнер для лінії рейтингу повної картки
        "visibility: hidden;" + // Приховано під час завантаження
        "flex-wrap: wrap;" + // Дозволити перенос елементів
        "gap: 0.4em 0;" + // Відступи між елементами
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
        ".card__quality.lqe-quality {" + // Стилі для мітки якості на списковій картці
        " position: absolute; " + // Абсолютне позиціонування
        " bottom: 0.50em; " + // Відступ від низу
        " left: " + cardQualityLeft + "; " + // Вирівнювання по лівому краю або трохи всередині
        " margin-left: " + cardQualityMarginLeft + "; " + // Виступ за край постера (або ні)
        " background-color: " + (LQE_CONFIG.LIST_CARD_LABEL_BACKGROUND_TRANSPARENT ? "transparent" : LQE_CONFIG.LIST_CARD_LABEL_BACKGROUND_COLOR) + " !important;" + // Колір фону
        " z-index: " + cardQualityZIndex + "; " + // Керований z-index
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
        " text-shadow: 0px 0px 1px rgba(0,0,0,0.3); " + // Тінь тексту
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
        "@media screen and (max-width: 480px) { .loading-dots-container { left: 0; right: 0; justify-content: center; text-align: center; max-width: 100%; }}" + // Адаптація для мобільних
        "</style>";

    Lampa.Template.add('lampa_quality_loading_animation_css', loadingStylesLQE);
    $('body').append(Lampa.Template.get('lampa_quality_loading_animation_css', {}, true));


    // ===================== МЕРЕЖЕВІ ФУНКЦІЇ =====================
    /**
     * Виконує запит через проксі з обробкою помилок
     * @param {string} url - URL для запиту
     * @param {string} cardId - ID картки для логування
     * @param {function} callback - Callback функція
     */
    function fetchWithProxy(url, cardId, callback) {
        var currentProxyIndex = 0; // Поточний індекс проксі в списку
        var callbackCalled = false;
        function tryNextProxy() {
            if (currentProxyIndex >= LQE_CONFIG.PROXY_LIST.length) {
                if (!callbackCalled) {
                    callbackCalled = true;
                    callback(new Error('All proxies failed'));
                }
                return;
            }

            var proxyUrl = LQE_CONFIG.PROXY_LIST[currentProxyIndex] + encodeURIComponent(url);
            var timeoutId = setTimeout(function() {
                if (!callbackCalled) {
                    currentProxyIndex++;
                    tryNextProxy();
                }
            }, LQE_CONFIG.PROXY_TIMEOUT_MS);

            fetch(proxyUrl)
                .then(function(response) {
                    clearTimeout(timeoutId);
                    if (!response.ok) throw new Error('Proxy error: ' + response.status);
                    return response.text();
                })
                .then(function(data) {
                    if (!callbackCalled) {
                        callbackCalled = true;
                        clearTimeout(timeoutId);
                        callback(null, data);
                    }
                })
                .catch(function(error) {
                    console.error("LQE-LOG", "card: " + cardId + ", Proxy fetch error for " + proxyUrl + ":", error);
                    clearTimeout(timeoutId);
                    if (!callbackCalled) {
                        currentProxyIndex++;
                        tryNextProxy();
                    }
                });
        }
        tryNextProxy();
    }

    // ===================== АНІМАЦІЯ ЛОАДЕРА ПОВНОЇ КАРТКИ =====================

    function addLoadingAnimation(cardId, renderElement) {
        if (!renderElement) return;
        var rateLine = $('.full-start-new__rate-line, .full-start__rate-line', renderElement);
        if (!rateLine.length) return;

        if ($('.loading-dots-container', rateLine).length) return;

        var loadingContainer = document.createElement('div');
        loadingContainer.className = 'loading-dots-container';

        var loadingInner = document.createElement('div');
        loadingInner.className = 'loading-dots';

        var loadingText = document.createElement('div');
        loadingText.className = 'loading-dots__text';
        loadingText.textContent = 'Пошук якості';

        var dot1 = document.createElement('div');
        dot1.className = 'loading-dots__dot';
        var dot2 = document.createElement('div');
        dot2.className = 'loading-dots__dot';
        var dot3 = document.createElement('div');
        dot3.className = 'loading-dots__dot';

        loadingInner.appendChild(loadingText);
        loadingInner.appendChild(dot1);
        loadingInner.appendChild(dot2);
        loadingInner.appendChild(dot3);

        loadingContainer.appendChild(loadingInner);
        rateLine.append(loadingContainer);

        rateLine.css({
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
        $('.loading-dots-container', renderElement).remove();
    }

    // ===================== УТІЛІТИ =====================
    function getCardType(cardData) {
        var type = cardData.media_type || cardData.type;
        if (type === 'movie' || type === 'tv') return type;
        return cardData.name || cardData.original_name ? 'tv' : 'movie';
    }

    function sanitizeTitle(title) {
        if (!title) return '';
        return title.toString().toLowerCase()
                   .replace(/[\._\-\[\]\(\),]+/g, ' ')
                   .replace(/\s+/g, ' ')
                   .trim();
    }

    function makeCacheKey(version, type, id) {
        return version + '_' + (type === 'tv' ? 'tv' : 'movie') + '_' + id;
    }

    // ===================== ПАРСИНГ ЯКОСТІ =====================
    function simplifyQualityLabel(fullLabel, originalTitle) {
        if (!fullLabel) return '';
        var lowerLabel = fullLabel.toLowerCase();
        // ...
        return fullLabel;
    }

    function translateQualityLabel(qualityCode, fullTorrentTitle) {
        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "translateQualityLabel:", qualityCode, fullTorrentTitle);
        var title = sanitizeTitle(fullTorrentTitle || '');
        var titleForSearch = ' ' + title + ' ';
        // ...
        // тут логіка визначення resolution/source + fallback + simplifyQualityLabel
        // ...
        return fullTorrentTitle || '';
    }

    // ===================== ЧЕРГА ЗАПИТІВ =====================
    var requestQueue = [];
    var activeRequests = 0;
    function enqueueTask(fn) {
        requestQueue.push(fn);
        processQueue();
    }
    function processQueue() {
        if (activeRequests >= LQE_CONFIG.MAX_PARALLEL_REQUESTS) return;
        if (!requestQueue.length) return;
        activeRequests++;
        var task = requestQueue.shift();
        task(function done() {
            activeRequests--;
            processQueue();
        });
    }

    // ===================== JacRed ПОШУК =====================
    function getBestReleaseFromJacred(normalizedCard, cardId, callback) {
        enqueueTask(function(done){
            // ...
            // тут йде логіка складання стратегій пошуку,
            // фільтрації релізів (серіал vs фільм), вибір найкращого,
            // кешування і т.д.
            // ...
        });
    }

    // ===================== КЕШ =====================
    function getQualityCache(key) {
        var cache = Lampa.Storage.get(LQE_CONFIG.CACHE_KEY) || {};
        var entry = cache[key];
        if (!entry) return null;
        if (!entry.timestamp || (Date.now() - entry.timestamp) > LQE_CONFIG.CACHE_VALID_TIME_MS) {
            return null;
        }
        return entry;
    }

    function saveQualityCache(key, data, cardId) {
        var cache = Lampa.Storage.get(LQE_CONFIG.CACHE_KEY) || {};
        cache[key] = {
            timestamp: Date.now(),
            quality_code: data.quality_code,
            full_label: data.full_label
        };
        Lampa.Storage.set(LQE_CONFIG.CACHE_KEY, cache);
        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Saved to cache:", key, cache[key]);
    }

    function cleanupOldCache() {
        var cache = Lampa.Storage.get(LQE_CONFIG.CACHE_KEY) || {};
        var now = Date.now();
        var changed = false;
        for (var k in cache) {
            if (!cache.hasOwnProperty(k)) continue;
            var item = cache[k];
            if (!item || !item.timestamp || (now - item.timestamp) > LQE_CONFIG.CACHE_VALID_TIME_MS) {
                delete cache[k];
                changed = true;
            }
        }
        if (changed) {
            Lampa.Storage.set(LQE_CONFIG.CACHE_KEY, cache);
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "Cache: Removed expired entries");
        }
    }
    cleanupOldCache();

    /**
     * Очищає всі існуючі елементи якості на повній картці
     * (включно з нативними бейджами Lampa) перед повторним рендером
     * @param {string} cardId - ID картки
     * @param {Element} renderElement - DOM елемент
     */
    function clearFullCardQualityElements(cardId, renderElement) {
        if (renderElement) {
            var rateLine = $('.full-start-new__rate-line, .full-start__rate-line', renderElement);
            if (rateLine && rateLine.length) {
                var existingElements = $('.full-start__status', rateLine);
                if (existingElements.length > 0) {
                    if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Clearing existing quality elements on full card.");
                    existingElements.remove();
                }
            }
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
        
        if (!$('.full-start__status.lqe-quality', rateLine).length) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Adding quality placeholder on full card.");
            var placeholder = document.createElement('div');
            placeholder.className = 'full-start__status lqe-quality';
            placeholder.textContent = 'Пошук...';
            placeholder.style.opacity = '0.7';
            rateLine.append(placeholder);
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
     * @param {boolean} bypassTranslation - Пропустити переклад
     */
	function updateFullCardQualityElement(qualityCode, fullTorrentTitle, cardId, renderElement, bypassTranslation) {
        if (!renderElement) return;
        
        // Знаходимо контейнер рейтингу (TV / Desktop варіанти)
        var rateLine = $('.full-start-new__rate-line, .full-start__rate-line', renderElement);
        if (!rateLine.length) return;

        // Прибираємо всі "рідні" бейджі якості Lampa (усе без класу lqe-quality),
        // щоб уникнути дублів типу "4K 4K"
        rateLine.find('.full-start__status').each(function() {
            if (!this.classList.contains('lqe-quality')) {
                this.parentNode.removeChild(this);
            }
        });

        // Визначаємо текст, який будемо показувати
        var displayQuality = bypassTranslation ? fullTorrentTitle : translateQualityLabel(qualityCode, fullTorrentTitle);

    	// Якщо це ручне перевизначення І увімкнено спрощення - беремо спрощену мітку
    	if (bypassTranslation && LQE_CONFIG.USE_SIMPLE_QUALITY_LABELS) {
        	var manualData = LQE_CONFIG.MANUAL_OVERRIDES[cardId];
        	if (manualData && manualData.simple_label) {
            	displayQuality = manualData.simple_label;
        	}
    	}
        
        // Шукаємо існуючий наш елемент
        var element = $('.full-start__status.lqe-quality', renderElement);
        if (element.length) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log('LQE-QUALITY', 'card: ' + cardId + ', Updating existing element with quality "' + displayQuality + '" on full card.');
            element.text(displayQuality).css('opacity', '1').addClass('show');
        } else {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log('LQE-QUALITY', 'card: ' + cardId + ', Creating new element with quality "' + displayQuality + '" on full card.');
            var div = document.createElement('div');
            div.className = 'full-start__status lqe-quality';
            div.textContent = displayQuality;
            rateLine.append(div);
            setTimeout(function(){ 
                $('.full-start__status.lqe-quality', renderElement).addClass('show'); 
            }, 20);
        }
    }

    /**
     * Оновлює елемент якості на списковій картці (у грідах/списках)
     * @param {Element} cardView - DOM елемент картки або контейнер постера
     * @param {number} qualityCode - Код якості
     * @param {string} fullTorrentTitle - Назва торренту
     * @param {boolean} bypassTranslation - Пропустити переклад
     */
    function updateCardListQualityElement(cardView, qualityCode, fullTorrentTitle, bypassTranslation) {
        if (!cardView) return;

        // Формуємо текст якості
        var displayQuality = bypassTranslation ? fullTorrentTitle : translateQualityLabel(qualityCode, fullTorrentTitle);

        // Якщо це ручне перевизначення І увімкнено спрощені мітки — беремо simple_label
        if (bypassTranslation && LQE_CONFIG.USE_SIMPLE_QUALITY_LABELS) {
            var cardId = cardView && cardView.card_data && cardView.card_data.id
                ? cardView.card_data.id
                : (cardView.closest && cardView.closest('.card') && cardView.closest('.card').card_data
                    ? cardView.closest('.card').card_data.id
                    : null);
            var manualData = cardId ? LQE_CONFIG.MANUAL_OVERRIDES[cardId] : null;
            if (manualData && manualData.simple_label) {
                displayQuality = manualData.simple_label;
            }
        }

        // 1. Видаляємо всі сторонні .card__quality без lqe-quality,
        //    щоб не було дубля системної плашки
        var foreignBadges = cardView.querySelectorAll('.card__quality:not(.lqe-quality)');
        if (foreignBadges && foreignBadges.length) {
            for (var i = 0; i < foreignBadges.length; i++) {
                foreignBadges[i].parentNode.removeChild(foreignBadges[i]);
            }
        }

        // 2. Шукаємо нашу плашку
        var existing = cardView.querySelector('.card__quality.lqe-quality');
        if (existing) {
            var inner = existing.querySelector('div');
            if (inner) {
                if (inner.textContent === displayQuality) {
                    // Вже актуально — просто показати
                    requestAnimationFrame(function(){ existing.classList.add('show'); });
                    return;
                } else {
                    inner.textContent = displayQuality;
                }
            }
            requestAnimationFrame(function(){ existing.classList.add('show'); });
            return;
        }

        // 3. Створюємо нову плашку
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

    function processFullCardQuality(cardData, renderElement) {
        if (!renderElement) {
            console.error("LQE-LOG", "Render element is null in processFullCardQuality. Aborting.");
            return;
        }
        
        var cardId = cardData.id;
        if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", Processing full card. Data: ", cardData);

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
            rateLine.css('visibility', 'hidden');
            rateLine.addClass('done');
            addLoadingAnimation(cardId, renderElement);
        } else {
            if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card:" + cardId + ", rate-line not found, skipping loading animation.");
        }
        
        var isTvSeries = (normalizedCard.type === 'tv' || normalizedCard.name);
        var cacheKey = LQE_CONFIG.CACHE_VERSION + '_' + (isTvSeries ? 'tv_' : 'movie_') + normalizedCard.id;

        // Ручне перевизначення (найвищий пріоритет)
        var manualOverrideData = LQE_CONFIG.MANUAL_OVERRIDES[cardId];
        if (manualOverrideData) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Found manual override:", manualOverrideData);
            updateFullCardQualityElement(null, manualOverrideData.full_label, cardId, renderElement, true);
            removeLoadingAnimation(cardId, renderElement);
            rateLine.css('visibility', 'visible');
            return;
        }

        var cachedQualityData = getQualityCache(cacheKey);

        if (!(isTvSeries && LQE_CONFIG.SHOW_QUALITY_FOR_TV_SERIES === false)) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log('LQE-QUALITY', 'card: ' + cardId + ', Quality feature enabled for this content, starting processing.');
            if (cachedQualityData) {
                if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Quality data found in cache:", cachedQualityData);
                updateFullCardQualityElement(cachedQualityData.quality_code, cachedQualityData.full_label, cardId, renderElement);
                
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
                // Новий пошук якості (JacRed)
                clearFullCardQualityElements(cardId, renderElement);
                showFullCardQualityPlaceholder(cardId, renderElement);
                
                getBestReleaseFromJacred(normalizedCard, cardId, function(jrResult) {
                    if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", 'card: ' + cardId + ', JacRed callback received for full card. Result:', jrResult);
                    var qualityCode = (jrResult && jrResult.quality) || null;
                    var fullTorrentTitle = (jrResult && jrResult.full_label) || null;
                     
                    if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", 'card: ' + cardId + ', JacRed result -> qualityCode: "' + qualityCode + '", full label: "' + fullTorrentTitle + '"');
                    
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
            if (LQE_CONFIG.LOGGING_QUALITY) console.log('LQE-QUALITY', 'card: ' + cardId + ', Quality is disabled for TV series (as configured), skipping quality fetch.');
            clearFullCardQualityElements(cardId, renderElement);
            removeLoadingAnimation(cardId, renderElement);
            rateLine.css('visibility', 'visible');
        }
        
        if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", Full card quality processing initiated.");
    }

    // ===================== ОБРОБКА КАРТОК У СПИСКУ =====================

    function updateCardListQuality(cardElement) {
        if (LQE_CONFIG.LOGGING_CARDLIST) console.log("LQE-CARDLIST", "Processing list card");

        // Перевіряємо чи вже обробляли цю картку
        if (cardElement.hasAttribute('data-lqe-quality-processed')) {
            if (LQE_CONFIG.LOGGING_CARDLIST) console.log("LQE-CARDLIST", "Card already processed");
            return;
        }
        
        var cardView = cardElement.querySelector('.card__view') || cardElement;
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
            return;
        }

        // Якщо в кеші нема — JacRed
        getBestReleaseFromJacred(normalizedCard, cardId, function(jrResult) {
            if (LQE_CONFIG.LOGGING_CARDLIST) console.log('LQE-CARDLIST', 'card: ' + cardId + ', JacRed callback for list:', jrResult);
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

    // ===================== OBSERVER (оновлення списків) =====================

    var observer = new MutationObserver(function(mutations) {
        var newCards = [];
        
        for (var m = 0; m < mutations.length; m++) {
            var mutation = mutations[m];
            if (mutation.addedNodes) {
                for (var j = 0; j < mutation.addedNodes.length; j++) {
                    var node = mutation.addedNodes[j];
                    if (node.nodeType !== 1) continue;
                     
                    if (node.classList && node.classList.contains('card')) {
                        newCards.push(node);
                    }
                     
                    // дочірні картки
                    try {
                        var nestedCards = node.querySelectorAll('.card');
                        if (nestedCards && nestedCards.length) {
                            for (var k = 0; k < nestedCards.length; k++) {
                                newCards.push(nestedCards[k]);
                            }
                        }
                    } catch (e) {
                        // ігноруємо помилки селектора
                    }
                }
            }
        }
        
        if (newCards.length) {
            if (LQE_CONFIG.LOGGING_CARDLIST) console.log("LQE-CARDLIST", "Observer found", newCards.length, "new cards");
            debouncedProcessNewCards(newCards);
        }
    });
    var observerDebounceTimer = null;
    
    /**
     * Оптимізований дебаунс обробки нових карток з TV-оптимізацією
     * @param {Array} cards - Масив карток
     */
    function debouncedProcessNewCards(cards) {
        if (observerDebounceTimer) {
            clearTimeout(observerDebounceTimer);
        }

        observerDebounceTimer = setTimeout(function() {
            var uniqueCards = [];
            var seen = new WeakSet();
            for (var i = 0; i < cards.length; i++) {
                var c = cards[i];
                if (c && !seen.has(c)) {
                    seen.add(c);
                    uniqueCards.push(c);
                }
            }

            var BATCH_SIZE = 20;
            var DELAY_MS = 15;

            function processBatch(startIndex) {
                var batch = uniqueCards.slice(startIndex, startIndex + BATCH_SIZE);
                batch.forEach(function(card) {
                    if (card.isConnected) {
                        updateCardListQuality(card);
                    }
                });
                var nextIndex = startIndex + BATCH_SIZE;
                
                if (nextIndex < uniqueCards.length) {
                    setTimeout(function() {
                        processBatch(nextIndex);
                    }, DELAY_MS);
                } else {
                    if (LQE_CONFIG.LOGGING_CARDLIST) {
                        console.log("LQE-CARDLIST", "All batches processed successfully");
                    }
                }
            }
            if (uniqueCards.length > 0) {
                processBatch(0);
            }
        }, 15);
    }

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
     * Одноразово обробляє всі картки, які вже є в DOM
     * Це критично для Android TV / TV Box, де частина карток
     * з'являється ДО того, як спрацює MutationObserver.
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

    function initializeLampaQualityPlugin() {
        if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "Lampa Quality Enhancer: Initializing...");
        window.lampaQualityPlugin = true;
        
        attachObserver(); // Налаштовуємо спостерігач
        applyQualityToExistingCards(); // Одразу обробляємо вже змонтовані картки (важливо для ТВ)
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

    if (!window.lampaQualityPlugin) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeLampaQualityPlugin);
        } else {
            initializeLampaQualityPlugin();
        }
    }

})();

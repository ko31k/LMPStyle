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
 * - Адаптація під слабкі пристрої / TV Box (дебаунс, батчинг обробки, мінімум перерисовок)
 * --------------------------------------------------------------------------------
 * Додатково:
 * - Обхід CORS через проксі
 * - Мапи якості та джерел (WebDL, REMUX, TS, HDRip і т.д.)
 * - Пріоритет якісних релізів над TS/камріпами
 * - Пріоритет роздільності (2160 > 1080 > 720 > ...)
 * - Спроба відсіяти фейкові/апскейлені релізи, треш, трейлери
 * - Ручні перевизначення для конкретних ID
 * - Детальне логування різних компонентів
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
        MAX_PARALLEL_REQUESTS: 12, // Максимальна кількість паралельних запитів
        QUEUE_CHECK_INTERVAL: 100, // Інтервал перевірки черги (мс)
        SHOW_QUALITY_FOR_TV_SERIES: true, // Показувати якість для серіалів (true/false)
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
                
        // Режими позиціонування плашки якості у спискових картках
        LIST_CARD_LABEL_STICK_TO_POSTER_EDGE: false, // false = трохи вилітає за постер (дефолт твій стиль), true = прилипає всередині постера для ТВ
        LIST_CARD_LABEL_Z_INDEX: 20,
                

        
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
        		full_label: '1080 ВDRemux', //✅ 
        		simple_label: 'BDRemux'  	 //✅ Спрощена мітка
    		},
			'245891': { 
        		quality_code: 2160, 
        		full_label: '4K Blu-ray',
        		simple_label: '4K BluRay'  	
    		},
			'882598': { 
        		quality_code: 1080, 
        		full_label: 'FullHD Web-DL',
        		simple_label: 'FHD'  	
    		},
			'851424': { 
        		quality_code: 1080, 
        		full_label: 'FullHD Blu-ray',
        		simple_label: 'FHD BR'  	
    		},
			'447365': { 
        		quality_code: 2160, 
        		full_label: '4K Blu-ray', 
        		simple_label: '4K BR'  	 
    		},
			'123456': { 
        		quality_code: 720, 
        		full_label: 'HDTVRip 720p', 
        		simple_label: '720p'  	 
    		},
			'987654': { 
        		quality_code: 1080, 
        		full_label: 'FullHD WEB-DL', 
        		simple_label: 'FHD'  	 
    		}
		}
    };

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
        "DVDRip [AV1/2160p] [HDR10]": "2160p DVDRip HDR10",
        "Telecine 1080P @ звук с TS": "1080P TC/TS",
        "Web-DL 720P [H.265/HEVC] [5.1]": "720P WEB-DL",
        "HDTVRip 720p @ DDP5.1": "720P HDTVRip",
        "FullHD Web-DL": "FullHD WEB-DL",
        "FullHD WEB-DLRip": "FullHD WEB-DLRip",
        "FullHD Web-DLRip": "FullHD WEB-DLRip",
        "FullHD Blu-ray": "FullHD Blu-ray",
        "1080P Blu-ray Remux": "1080P BDRemux",
        "Blu-ray Remux 4K": "4K BDRemux",
        "4K Blu-ray": "4K Blu-ray",
        "4K BDRemux": "4K BDRemux",
        "BDRemux 4K": "4K BDRemux",
        "4K WEB-DL": "4K WEB-DL",
        "FullHD WEB-DL": "FullHD WEB-DL",
        "FullHD WEBRip": "FullHD WEBRip",
        "WEBRip 1080P": "1080P WEBRip",
        "WEBRip 720P": "720P WEBRip",
        "HDRip 720P": "720P HDRip",
        "HDRip 1080P": "1080P HDRip",
        "HDRip": "HDRip",
        "TS 1080P": "1080P TS",
        "TS 720P": "720P TS",
        "TS": "TS",
        "CAMRip": "CAMRip",
        "CAMRip 720P": "720P CAMRip",
        "CAMRip 1080P": "1080P CAMRip",
        "TeleSynch": "TS",
        "TeleSynch 720P": "720P TS",
        "TeleSynch 1080P": "1080P TS",
        "Telecine": "TC",
        "Telecine 720P": "720P TC",
        "Telecine 1080P": "1080P TC",
        "DVDRip": "DVDRip",
        "DVD": "DVD",
        "DVDRemux": "DVDRemux",
        "Remux": "Remux",
        "BDRemux": "BDRemux",
        "BluRay Remux": "BDRemux",
        "Blu-ray Remux": "BDRemux",
        "Blu-Ray Remux": "BDRemux",
        "Blu-ray": "Blu-ray",
        "BluRay": "Blu-ray",
        "UHD Blu-ray": "4K Blu-ray",
        "UHD BluRay": "4K Blu-ray",
        "UHD BDRemux": "4K BDRemux",
        "4K UHD BDRemux": "4K BDRemux",
        "2160P Web-DL": "4K WEB-DL",
        "2160P WEB-DL": "4K WEB-DL",
        "2160P WebRip": "4K WEBRip",
        "2160P WEBRip": "4K WEBRip"
    };

    // Розпізнавання роздільності
    var RESOLUTION_MAP = {
        "4320p": 4320, "8k": 4320, "8к": 4320, "8 k": 4320,
        "2160p": 2160, "4k": 2160, "4к": 2160, "uhd": 2160, "ultra hd": 2160, "ultra-hd": 2160, "ultra_hd": 2160, "uhdremux": 2160, "uhd blu-ray": 2160, "uhd blu ray": 2160, "ultra hd blu-ray": 2160,
        "1440p": 1440, "2k": 1440, "2к": 1440,
        "1080p": 1080, "1080р": 1080, "fullhd": 1080, "full hd": 1080, "full-hd": 1080, "full_hd": 1080, "fhd": 1080, "bdremux 1080": 1080, "remux 1080": 1080, "hdrip 1080": 1080,
        "900p": 900,
        "720p": 720, "720р": 720, "hd": 720, "hdready": 720, "hd ready": 720, "hd-ready": 720, "hdrip 720": 720, "hdtv 720": 720,
        "576p": 576, "sd576": 576, "sd 576": 576,
        "480p": 480, "sd": 480, "sd480": 480, "sd 480": 480, "dvd": 480, "dvdrip": 480, "hdtvrip sd": 480, "hdrip sd": 480,
        "360p": 360, "360р": 360, "ld": 360,
        "240p": 240
    };

    // Ключові слова для визначення джерела/типу релізу
    var QUALITY_KEYWORDS = {
        "remux": 100,
        "bdremux": 100,
        "blu-ray remux": 100,
        "blu-ray": 90,
        "bdrip": 80,
        "brrip": 80,
        "bluray": 90,
        "web-dl": 70,
        "webdl": 70,
        "webrip": 60,
        "webdlrip": 55,
        "web-dlrip": 55,
        "hdtv": 50,
        "hdtvrip": 50,
        "hdrip": 40,
        "hdts": 25,
        "hdcam": 15,
        "camrip": 10,
        "cam": 10,
        "telesync": 20,
        "ts": 20,
        "telecine": 15,
        "tc": 15,
        "screener": 5,
        "scr": 5,
        "dvdscr": 5,
        "dvdrip": 30,
        "dvd": 30,
        "dvdremux": 60,
        "r5": 15,
        "workprint": 1
    };

    // Короткі мітки для спрощеного режиму
    var SHORT_QUALITY_MAP = {
        // Погана якість
        "camrip": "CAM", "cam": "CAM", "hdcam": "CAM",
        "ts": "TS", "telesync": "TS", "telesynch": "TS", "teleSynch": "TS", "hdts": "TS",
        "tc": "TC", "telecine": "TC", "tele-cine": "TC", "tele cine": "TC",
        "workprint": "WP", "wp": "WP", "wp rip": "WP", "work print": "WP",
        "r5": "R5",
        "screener": "SCR", "scr": "SCR", "dvdscr": "SCR", "bdscr": "SCR", "screener rip": "SCR",

        // Середня якість
        "hdrip": "HDRip", "hdtvrip": "HDTV", "hdtv": "HDTV",
        "webrip": "WebRip", "web-rip": "WebRip", "web dl rip": "WebDLRip", "web-dlrip": "WebDLRip", "webdlrip": "WebDLRip", "webdl rip": "WebDLRip",
        "web-dl": "WebDL", "webdl": "WebDL",
        "bdrip": "BRip", "brrip": "BRip", "blurayrip": "BRip", "blu-ray rip": "BRip", "blu ray rip": "BRip",
        "dvdrip": "DVDRip", "dvd rip": "DVDRip", "dvd-rip": "DVDRip", "dvd rip custom": "DVDRip",

        // Висока якість
        "remux": "Remux", "bdremux": "Remux", "bluray remux": "Remux", "blu-ray remux": "Remux", "blu ray remux": "Remux", "uhdremux": "Remux",
        "blu-ray": "BR", "blu ray": "BR", "bluray": "BR", "uhd blu-ray": "4K BR", "uhd blu ray": "4K BR", "uhd blu-ray disc": "4K BR",
        "uhd bdremux": "4K BDRemux", "4k bdremux": "4K BDRemux", "uhd remux": "4K Remux", "4k remux": "4K Remux",
        "web-dl 4k": "4K WebDL", "4k web-dl": "4K WebDL", "2160p web-dl": "4K WebDL",
        "webrip 4k": "4K WebRip", "4k webrip": "4K WebRip", "2160p webrip": "4K WebRip",
        "fullhd web-dl": "FHD WebDL", "fullhd webrip": "FHD WebRip",
        "1080p web-dl": "1080p WebDL", "1080p webrip": "1080p WebRip",
        "1080p bdremux": "1080p BDRemux", "1080p remux": "1080p Remux",
        "720p web-dl": "720p WebDL", "720p webrip": "720p WebRip",
        "720p hdrip": "720p HDRip", "1080p hdrip": "1080p HDRip",
        
        // Додаткові формати
        "hdr10": "HDR10", "dolby vision": "DV", "dovi": "DV", "dv": "DV",
        "10bit": "10bit", "10-bit": "10bit", "10 bit": "10bit",
        "hevc": "HEVC", "x265": "x265", "h.265": "HEVC", "h265": "HEVC", "av1": "AV1",
        "aac 2.0": "AAC2.0", "aac2.0": "AAC2.0", "aac5.1": "AAC5.1", "ddp5.1": "DDP5.1", "dd+5.1": "DDP5.1", "eac3": "EAC3"
    };

    // Мапа для відображення джерела і якості (для перекладу у фінальний лейбл)
    var SOURCE_MAP = {
        // Погані
        "camrip": "CAMRip", "cam": "CAMRip", "hdcam": "CAMRip",
        "ts": "TS", "telesync": "TS", "telesynch": "TS", "teleSynch": "TS", "hdts": "TS",
        "tc": "TC", "telecine": "TC", "tele-cine": "TC", "tele cine": "TC",
        "workprint": "Workprint", "wp": "Workprint",

        // Скрінери
        "r5": "R5", "r5 line": "R5 Line",
        "screener": "SCR", "dvdscr": "SCR", "scr": "SCR", "bdscr": "SCR", "screener rip": "SCR",
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
    
    // Основні стилі для відображення якості
    // Динамічні параметри позиціонування ярлика якості у спискових картках (ПК / ТВ)
    var __lqe_margin_left = LQE_CONFIG.LIST_CARD_LABEL_STICK_TO_POSTER_EDGE ? '0' : '-0.78em';
    var __lqe_left = '0';
    var __lqe_zindex = (typeof LQE_CONFIG.LIST_CARD_LABEL_Z_INDEX === 'number' ? LQE_CONFIG.LIST_CARD_LABEL_Z_INDEX : 20);

    var styleLQE = "<style id=\"lampa_quality_styles\">" +
            ".full-start-new__rate-line, .full-start__rate-line {" + // Контейнер для лінії рейтингу повної картки (новий та старий шаблон)
            "visibility: hidden;" + // Приховано під час завантаження
            "flex-wrap: wrap;" + // Дозволити перенос елементів
            "gap: 0.4em 0;" + // Відступи між елементами
            "position: relative;" + // Потрібно для абсолютних дітей (лоадер)
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
            "border: 1px solid " + LQE_CONFIG.FULL_CARD_LABEL_BORDER_COLOR + " !important;" + // Межа мітки
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
            ".card__quality.lqe-quality {" + // Стилі для мітки якості на списковій картці (наша версія)
            " position: absolute; " + // Абсолютне позиціонування
            " bottom: 0.50em; " + // Відступ від низу
            " left: " + __lqe_left + "; " + // Вирівнювання по лівому краю
            " margin-left: " + __lqe_margin_left + "; " + // Можна трохи винести за постер або прилипнути до краю
            " background-color: " + (LQE_CONFIG.LIST_CARD_LABEL_BACKGROUND_TRANSPARENT ? 'transparent' : LQE_CONFIG.LIST_CARD_LABEL_BACKGROUND_COLOR) + " !important;" + // Колір фону
            " z-index: " + __lqe_zindex + ";" + // Z-index, щоб не тонути під оверлеями ТВ
            " width: fit-content; " + // Ширина по вмісту
            " max-width: calc(100% - 1em); " + // Максимальна ширина
            " border-radius: 0.3em 0.3em 0.3em 0.3em; " + // Закруглення кутів
            " overflow: hidden;" + // Обрізання переповнення
            "}" +
            ".card__quality.lqe-quality div {" + // Стилі тексту усередині мітки якості для списків
            " text-transform: uppercase; " + // Великі літери
            " font-family: 'Roboto Condensed', 'Arial Narrow', Arial, sans-serif; " + // Шрифт
            " font-weight: 700; " + // Жирний шрифт
            " letter-spacing: 0.1px; " + // Відстань між літерами
            " font-size: 1.10em; " + // Розмір шрифту
            " color: " + LQE_CONFIG.LIST_CARD_LABEL_TEXT_COLOR + " !important; " + // Колір тексту
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
			".card__quality.lqe-quality, .full-start__status.lqe-quality {" + // Елементи для анімації (тільки наші)
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
        "@media screen and (max-width: 480px) { .loading-dots-container { -webkit-text-size-adjust: 100%; font-size: 0.9em; text-align: center; max-width: 100%; }}" + // Адаптація для мобільних
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
        var callbackCalled = false; // Прапорець виклику callback

        // Рекурсивна функція спроб через різні проксі
        function tryNextProxy() {
            // Перевіряємо, чи не вичерпано всі проксі
            if (currentProxyIndex >= LQE_CONFIG.PROXY_LIST.length) {
                if (!callbackCalled) { // Якщо callback ще не викликано
                    callbackCalled = true;
                    callback(null); // Повертаємо помилку (null)
                }
                return;
            }

            var proxy = LQE_CONFIG.PROXY_LIST[currentProxyIndex];
            var proxiedUrl = proxy + encodeURIComponent(url);

            if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "Fetching via proxy:", proxiedUrl);

            var xhr = new XMLHttpRequest();
            xhr.open("GET", proxiedUrl, true);
            xhr.timeout = LQE_CONFIG.PROXY_TIMEOUT_MS;

            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300 && xhr.responseText) {
                        try {
                            var data = JSON.parse(xhr.responseText);
                            if (!callbackCalled) {
                                callbackCalled = true;
                                callback(data);
                            }
                        } catch (e) {
                            if (LQE_CONFIG.LOGGING_GENERAL) console.warn("LQE-LOG", "Proxy JSON parse error:", e);
                            tryNextProxy();
                        }
                    } else {
                        if (LQE_CONFIG.LOGGING_GENERAL) console.warn("LQE-LOG", "Proxy HTTP error:", xhr.status, xhr.responseText);
                        currentProxyIndex++;
                        tryNextProxy();
                    }
                }
            };

            xhr.ontimeout = function() {
                if (LQE_CONFIG.LOGGING_GENERAL) console.warn("LQE-LOG", "Proxy timeout:", proxy);
                currentProxyIndex++;
                tryNextProxy();
            };

            xhr.onerror = function() {
                if (LQE_CONFIG.LOGGING_GENERAL) console.warn("LQE-LOG", "Proxy network error:", proxy);
                currentProxyIndex++;
                tryNextProxy();
            };

            xhr.send();
        }

        tryNextProxy();
    }

    /**
     * Формує URL запиту до JacRed
     * @param {Object} cardData - Дані картки
     * @returns {string} - Сформований URL
     */
    function buildJacRedUrl(cardData) {
        var type = getCardType(cardData) === 'tv' ? 'tv' : 'movie';
        var title = encodeURIComponent(cardData.title || cardData.name || '');
        var original = encodeURIComponent(cardData.original_title || cardData.original_name || '');
        var year = '';
        if (cardData.release_date || cardData.first_air_date) {
            year = (cardData.release_date || cardData.first_air_date || '').split('-')[0] || '';
        }
        var query = title || original;
        if (year) {
            query += ' ' + year;
        }

        var finalUrl = LQE_CONFIG.JACRED_PROTOCOL + LQE_CONFIG.JACRED_URL + '/api/v2/search?sort=seeders&query=' + encodeURIComponent(query);

        if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "JacRed request URL:", finalUrl);

        return finalUrl;
    }

    // ===================== ПАРСИНГ / ВИБІР НАЙКРАЩОЇ ЯКОСТІ =====================

    /**
     * Нормалізація тексту
     */
    function sanitizeTitle(str) {
        if (!str || typeof str !== 'string') return '';
        return str
            .replace(/[\.\,\(\)\[\]\{\}\_\-]+/g, ' ') // Замінюємо роздільники пробілами
            .replace(/\s+/g, ' ') // Стискаємо повторні пробіли
            .trim()
            .toLowerCase();
    }

    /**
     * Визначає тип картки (movie / tv)
     */
    function getCardType(cardData) {
        if (!cardData) return 'movie';
        if (cardData.name || cardData.first_air_date) return 'tv';
        return 'movie';
    }

    /**
     * Визначає пріоритет роздільності (вище = краще)
     */
    function resolutionPriority(pixels) {
        if (!pixels || typeof pixels !== 'number') return 0;
        if (pixels >= 4000) return 1000;
        if (pixels >= 2100) return 900;
        if (pixels >= 1440) return 800;
        if (pixels >= 1080) return 700;
        if (pixels >= 720)  return 500;
        if (pixels >= 576)  return 200;
        if (pixels >= 480)  return 100;
        return 10;
    }

    /**
     * Оцінка джерела (Remux/WEB-DL/TS і т.д.)
     */
    function sourcePriority(word) {
        if (!word) return 0;
        word = word.toLowerCase();
        if (word.indexOf('remux') !== -1 || word.indexOf('bdremux') !== -1) return 1000;
        if (word.indexOf('blu-ray') !== -1 || word.indexOf('bluray') !== -1 || word.indexOf('blu ray') !== -1) return 900;
        if (word.indexOf('web-dl') !== -1 || word.indexOf('webdl') !== -1) return 700;
        if (word.indexOf('webrip') !== -1) return 600;
        if (word.indexOf('hdtv') !== -1) return 400;
        if (word.indexOf('hdrip') !== -1) return 300;
        if (word.indexOf('ts') !== -1 || word.indexOf('telesync') !== -1 || word.indexOf('teleSynch') !== -1 || word.indexOf('hdts') !== -1) return 100;
        if (word.indexOf('cam') !== -1 || word.indexOf('camrip') !== -1 || word.indexOf('hdcam') !== -1) return 50;
        if (word.indexOf('telecine') !== -1 || word.indexOf('tc') !== -1) return 80;
        if (word.indexOf('screener') !== -1 || word.indexOf('scr') !== -1 || word.indexOf('dvdscr') !== -1) return 60;
        if (word.indexOf('workprint') !== -1 || word.indexOf('wp') !== -1) return 10;
        return 1;
    }

    /**
     * Витяг роздільності з тексту
     */
    function extractResolutionPixels(str) {
        if (!str) return 0;
        var clean = sanitizeTitle(str);
        var best = 0;
        for (var key in RESOLUTION_MAP) {
            if (!RESOLUTION_MAP.hasOwnProperty(key)) continue;
            if (clean.indexOf(key) !== -1) {
                var val = RESOLUTION_MAP[key];
                if (val > best) best = val;
            }
        }
        return best;
    }

    /**
     * Шукає найкращий реліз з результатів JacRed
     * @param {Object} cardData
     * @param {Function} callback
     */
    function getBestReleaseFromJacred(cardData, callback) {
        if (!cardData || !cardData.id) {
            if (LQE_CONFIG.LOGGING_GENERAL) console.error("LQE-LOG", "Invalid cardData passed into getBestReleaseFromJacred");
            callback(null);
            return;
        }

        var url = buildJacRedUrl(cardData);
        fetchWithProxy(url, cardData.id, function(response) {
            if (!response || !response.result || !Array.isArray(response.result) || response.result.length === 0) {
                if (LQE_CONFIG.LOGGING_GENERAL) console.warn("LQE-LOG", "Empty JacRed response for card:", cardData.id);
                callback(null);
                return;
            }

            // Вибираємо кращий торрент
            var bestItem = null;
            var bestScore = -999999;

            for (var i = 0; i < response.result.length; i++) {
                var item = response.result[i];
                if (!item || !item.title) continue;

                var normTitle = sanitizeTitle(item.title);
                var pixels = extractResolutionPixels(normTitle);
                var rp = resolutionPriority(pixels);

                var sp = 0;
                for (var kw in QUALITY_KEYWORDS) {
                    if (!QUALITY_KEYWORDS.hasOwnProperty(kw)) continue;
                    if (normTitle.indexOf(kw) !== -1) {
                        if (QUALITY_KEYWORDS[kw] > sp) {
                            sp = QUALITY_KEYWORDS[kw];
                        }
                    }
                }

                // штрафи за смітну якість
                var penalty = 0;
                if (normTitle.indexOf('camrip') !== -1 || normTitle.indexOf('hdcam') !== -1 || normTitle.indexOf('cam ') !== -1) {
                    penalty -= 500;
                }
                if (normTitle.indexOf('telesync') !== -1 || normTitle.indexOf('ts ') !== -1 || normTitle.indexOf('hdts') !== -1) {
                    penalty -= 300;
                }
                if (normTitle.indexOf('telecine') !== -1 || normTitle.indexOf('tc ') !== -1) {
                    penalty -= 200;
                }
                if (normTitle.indexOf('workprint') !== -1 || normTitle.indexOf('wp ') !== -1) {
                    penalty -= 900;
                }
                if (normTitle.indexOf('trailer') !== -1 || normTitle.indexOf('трейлер') !== -1) {
                    penalty -= 2000;
                }

                // Серіал / сезонний контент vs фільм
                var isSeasonPattern = /s\d{1,2}e\d{1,2}|season\s?\d|сезон/i.test(item.title);
                var cardLooksLikeTv = (getCardType(cardData) === 'tv');
                if (!cardLooksLikeTv && isSeasonPattern) {
                    // ми в картці фільму, а реліз схожий на сезон серіалу → ігноруємо
                    penalty -= 2000;
                }

                var score = rp + sp + penalty;

                if (!bestItem || score > bestScore) {
                    bestItem = item;
                    bestScore = score;
                }
            }

            if (!bestItem) {
                callback(null);
                return;
            }

            // Витягуємо попередню мітку якості
            var qualityPixels = extractResolutionPixels(bestItem.title);
            var qualityLabel = translateQualityLabel(qualityPixels, bestItem.title);

            callback({
                quality: qualityPixels || 'NO',
                full_label: qualityLabel || (bestItem.title || '').trim(),
                raw_title: bestItem.title || ''
            });
        });
    }

    /**
     * Переклад / побудова мітки якості для відображення користувачу
     * @param {number|string} qualityCode
     * @param {string} fullTorrentTitle
     * @returns {string}
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
        if (bestResKey) {
            var numeric = RESOLUTION_MAP[bestResKey];
            if (numeric >= 4000 || /8k|4320/i.test(bestResKey)) resolution = '8K';
            else if (numeric >= 2100 || /4k|2160/i.test(bestResKey)) resolution = '4K';
            else if (numeric >= 1440 || /2k|1440/i.test(bestResKey)) resolution = '2K';
            else if (numeric >= 1080) resolution = '1080P';
            else if (numeric >= 720)  resolution = '720P';
            else if (numeric >= 480)  resolution = '480P';
            else resolution = numeric + 'P';
        } else {
            if (typeof qualityCode === 'number') {
                if (qualityCode >= 4000) resolution = '8K';
                else if (qualityCode >= 2100) resolution = '4K';
                else if (qualityCode >= 1440) resolution = '2K';
                else if (qualityCode >= 1080) resolution = '1080P';
                else if (qualityCode >= 720)  resolution = '720P';
                else if (qualityCode >= 480)  resolution = '480P';
                else resolution = qualityCode + 'P';
            }
        }

        // Шукаємо джерело
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
                finalLabel = source; // Якщо джерело вже містить роздільність — беремо як є
            } else {
                finalLabel = resolution + ' ' + source;
            }
        }
        else if (resolution) {
            finalLabel = resolution;
        }
        else if (source) {
            finalLabel = source;
        }

        // Якщо не вдалося - пробуємо прямі мапи
        if (!finalLabel && fullTorrentTitle) {
            for (var mapKey in QUALITY_DISPLAY_MAP) {
                if (!QUALITY_DISPLAY_MAP.hasOwnProperty(mapKey)) continue;
                if (fullTorrentTitle.toLowerCase().indexOf(mapKey.toLowerCase()) !== -1) {
                    finalLabel = QUALITY_DISPLAY_MAP[mapKey];
                    break;
                }
            }
        }

        // Якщо й досі пусто — повертаємо як є, але трошки прибрано
        if (!finalLabel && fullTorrentTitle) {
            finalLabel = fullTorrentTitle.replace(/\s+/g, ' ').trim();
        }

        if (LQE_CONFIG.USE_SIMPLE_QUALITY_LABELS && finalLabel) {
            var lowered = sanitizeTitle(fullTorrentTitle || finalLabel);
            var bestShort = '';
            var bestShortLen = 0;
            for (var sk in SHORT_QUALITY_MAP) {
                if (!SHORT_QUALITY_MAP.hasOwnProperty(sk)) continue;
                if (lowered.indexOf(sk) !== -1) {
                    if (sk.length > bestShortLen) {
                        bestShortLen = sk.length;
                        bestShort = SHORT_QUALITY_MAP[sk];
                    }
                }
            }

            if (bestShort) {
                return bestShort.toUpperCase();
            }
        }

        if (finalLabel) {
            return finalLabel.toUpperCase();
        } else {
            return '—';
        }
    }

    // ===================== КЕШ =====================

    /**
     * Формує ключ кешу
     */
    function makeCacheKey(version, type, id) {
        var t = (type === 'tv' ? 'tv' : 'movie');
        return version + '_' + t + '_' + id;
    }

    /**
     * Отримати кеш
     */
    function getQualityCache(cacheKey) {
        try {
            var raw = localStorage.getItem(LQE_CONFIG.CACHE_KEY) || '{}';
            var parsed = JSON.parse(raw);
            if (parsed[cacheKey]) {
                var entry = parsed[cacheKey];
                var age = Date.now() - (entry.timestamp || 0);
                if (age < LQE_CONFIG.CACHE_VALID_TIME_MS) {
                    return entry;
                }
            }
        } catch (e) {
            if (LQE_CONFIG.LOGGING_GENERAL) console.warn("LQE-LOG", "Cache read error:", e);
        }
        return null;
    }

    /**
     * Зберегти кеш
     */
    function saveQualityCache(cacheKey, data, cardId) {
        try {
            var raw = localStorage.getItem(LQE_CONFIG.CACHE_KEY) || '{}';
            var parsed = JSON.parse(raw);
            parsed[cacheKey] = {
                quality_code: data.quality_code || data.quality || 'NO',
                full_label: data.full_label || data.label || '',
                timestamp: Date.now(),
                sourceId: cardId
            };
            localStorage.setItem(LQE_CONFIG.CACHE_KEY, JSON.stringify(parsed));
        } catch (e) {
            if (LQE_CONFIG.LOGGING_GENERAL) console.warn("LQE-LOG", "Cache write error:", e);
        }
    }

    // ===================== DOM / РЕНДЕР =====================

    /**
     * Очищення існуючих кастомних елементів якості (повна картка)
     */
    function clearFullCardQualityElements(cardId, renderElement) {
        if (renderElement) {
            var existingElements = $('.full-start__status.lqe-quality', renderElement);
            if (existingElements.length > 0) {
                if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Clearing existing quality elements on full card.");
                existingElements.remove();
            }
        }
    }

    /**
     * Тимчасова "—" мітка на повній картці (як плейсхолдер)
     */
    function showFullCardQualityPlaceholder(cardId, renderElement) {
        if (!renderElement) return;

        var rateLine = $('.full-start-new__rate-line, .full-start__rate-line', renderElement);
        if (!rateLine.length) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Cannot show placeholder, .full-start-*__rate-line not found.");
            return;
        }

        var existing = $('.full-start__status.lqe-quality', renderElement);
        if (!existing.length) {
            var placeholder = document.createElement('div');
            placeholder.className = 'full-start__status lqe-quality show fast';
            placeholder.textContent = '—';
            rateLine.append(placeholder);
        }
    }

    /**
     * Показати анімацію "Пошук..."
     */
    function addLoadingAnimation(cardId, renderElement) {
        if (!renderElement) return;
        if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", Add loading animation");

        // Підтримка двох шаблонів карток
        var rateLine = $('.full-start-new__rate-line, .full-start__rate-line', renderElement);

        // Перевіряємо наявність лінії та відсутність вже доданої анімації
        if (!rateLine.length || $('.loading-dots-container', rateLine).length) return;

        rateLine.append(
            '<div class="loading-dots-container">' +
            '<div class="loading-dots">' +
            '<span class="loading-dots__text">Пошук...</span>' +
            '<span class="loading-dots__dot"></span>' +
            '<span class="loading-dots__dot"></span>' +
            '<span class="loading-dots__dot"></span>' +
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
     * Прибрати анімацію "Пошук..."
     */
    function removeLoadingAnimation(cardId, renderElement) {
        if (!renderElement) return;
        if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", Remove loading animation");
        // Видаляємо контейнер з анімацією
        $('.loading-dots-container', renderElement).remove();
    }

    /**
     * Оновлює або створює мітку якості на повній картці (full card)
     */
    function updateFullCardQualityElement(qualityCode, fullTorrentTitle, cardId, renderElement, bypassTranslation) {
        if (!renderElement) return;

        // Підтримка як нового, так і старого шаблону повної картки (TV Box / PC)
        var rateLine = $('.full-start-new__rate-line, .full-start__rate-line', renderElement);
        if (!rateLine.length) return;

        // Прибираємо сторонні статуси якості, щоб не було дублів типу "4K 4K"
        rateLine.find('.full-start__status').each(function() {
            if (!this.classList.contains('lqe-quality')) {
                this.remove();
            }
        });

        // Готуємо текст мітки
        var displayQuality = bypassTranslation ? fullTorrentTitle : translateQualityLabel(qualityCode, fullTorrentTitle);

        // ✅ Якщо це ручне перевизначення І увімкнено спрощення - беремо спрощену мітку
        if (bypassTranslation && LQE_CONFIG.USE_SIMPLE_QUALITY_LABELS) {
            var manualData = LQE_CONFIG.MANUAL_OVERRIDES[cardId];
            if (manualData && manualData.simple_label) {
                displayQuality = manualData.simple_label;
            }
        }

        // Оновлюємо існуючу плашку або створюємо нову
        var element = $('.full-start__status.lqe-quality', rateLine);
        if (element.length) {
            element.text(displayQuality).css('opacity', '1').addClass('show');
        } else {
            var div = document.createElement('div');
            div.className = 'full-start__status lqe-quality';
            div.textContent = displayQuality;
            rateLine.append(div);
            setTimeout(function(){
                $('.full-start__status.lqe-quality', rateLine).addClass('show');
            }, 20);
        }
    }

    /**
     * Оновлює або створює мітку якості на картці списку (posters у списках)
     */
    function updateCardListQualityElement(cardView, qualityCode, fullTorrentTitle, bypassTranslation) {
        // Формуємо текст мітки
        var displayQuality = bypassTranslation ? fullTorrentTitle : translateQualityLabel(qualityCode, fullTorrentTitle);

        // ✅ Якщо це ручне перевизначення І увімкнено спрощені мітки — беремо simple_label
        if (bypassTranslation && LQE_CONFIG.USE_SIMPLE_QUALITY_LABELS) {
            var cardId = cardView?.card_data?.id || cardView?.closest('.card')?.card_data?.id;
            var manualData = LQE_CONFIG.MANUAL_OVERRIDES[cardId];
            if (manualData && manualData.simple_label) {
                displayQuality = manualData.simple_label;
            }
        }

        // Видаляємо всі існуючі .card__quality, які не наші (щоб не було дубляжів від Lampa)
        var existingBadges = cardView.querySelectorAll('.card__quality');
        for (var i = 0; i < existingBadges.length; i++) {
            if (!existingBadges[i].classList.contains('lqe-quality')) {
                existingBadges[i].remove();
            }
        }

        // Перевіряємо чи вже є наш бейдж
        var existing = cardView.querySelector('.card__quality.lqe-quality');
        if (existing) {
            var inner = existing.querySelector('div');

            if (inner) {
                if (inner.textContent === displayQuality) {
                    existing.classList.add('show');
                    return;
                }
                inner.textContent = displayQuality;
            } else {
                if (existing.textContent === displayQuality) {
                    existing.classList.add('show');
                    return;
                }
                existing.textContent = displayQuality;
            }

            existing.classList.add('show');
            return;
        }

        // Створюємо новий елемент
        var qualityDiv = document.createElement('div');
        qualityDiv.className = 'card__quality lqe-quality';

        var innerElement = document.createElement('div');
        innerElement.textContent = displayQuality;
        qualityDiv.appendChild(innerElement);

        cardView.appendChild(qualityDiv);

        // Плавне з'явлення
        requestAnimationFrame(function(){
            qualityDiv.classList.add('show');
        });
    }

    /**
     * Обробляє картку в списку (викликається для кожної .card)
     */
    function updateCardListQuality(cardElement) {
        if (LQE_CONFIG.LOGGING_CARDLIST) console.log("LQE-CARDLIST", "Processing list card");

        // Перевіряємо чи вже обробляли цю картку
        if (cardElement.hasAttribute('data-lqe-quality-processed')) {
            if (LQE_CONFIG.LOGGING_CARDLIST) console.log("LQE-CARDLIST", "Card already processed");
            return;
        }

        // На деяких ТВ-box елемента .card__view може не бути або відрізнятись
        var cardView = cardElement.querySelector('.card__view') || cardElement;
        var cardData = cardElement.card_data;

        if (!cardData || !cardView) {
            if (LQE_CONFIG.LOGGING_CARDLIST) console.log("LQE-CARDLIST", "Invalid card data or view");
            return;
        }

        // Нормалізуємо дані картки
        var normalizedCard = {
            id: cardData.id,
            title: cardData.title || cardData.name || '',
            original_title: cardData.original_title || cardData.original_name || '',
            type: getCardType(cardData),
            release_date: cardData.release_date || cardData.first_air_date || ''
        };

        if (LQE_CONFIG.LOGGING_CARDLIST) console.log("LQE-CARDLIST", "Normalized list card data:", normalizedCard);

        // Створюємо ключ кешу
        var cardId = normalizedCard.id;
        var cacheKey = makeCacheKey(LQE_CONFIG.CACHE_VERSION, normalizedCard.type, cardId);

        // Позначаємо як оброблену (щоб не дублювати роботу)
        cardElement.setAttribute('data-lqe-quality-processed', 'true');

        // Перевіряємо ручні перевизначення
        var manualOverrideData = LQE_CONFIG.MANUAL_OVERRIDES[cardId];
        if (manualOverrideData) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Manual override for list");
            updateCardListQualityElement(cardView, null, manualOverrideData.full_label, true);
            return;
        }

        // Перевіряємо кеш
        var cachedQualityData = getQualityCache(cacheKey);
        if (cachedQualityData && cachedQualityData.quality_code && cachedQualityData.quality_code !== 'NO') {
            if (LQE_CONFIG.LOGGING_CARDLIST) console.log("LQE-CARDLIST", "card: " + cardId + ", Using cached quality for list", cachedQualityData);

            updateCardListQualityElement(
                cardView,
                cachedQualityData.quality_code,
                cachedQualityData.full_label,
                false
            );

            var cacheTime = cachedQualityData.timestamp || 0;
            var cacheAge = Date.now() - cacheTime;

            if (cacheAge > LQE_CONFIG.CACHE_REFRESH_THRESHOLD_MS) {
                if (LQE_CONFIG.LOGGING_CARDLIST) console.log("LQE-CARDLIST", "card: " + cardId + ", Cache is old -> refreshing in bg for list");
                getBestReleaseFromJacred(normalizedCard, function(jrResult) {
                    if (jrResult && jrResult.quality && jrResult.quality !== 'NO') {
                        saveQualityCache(cacheKey, {
                            quality_code: jrResult.quality,
                            full_label: jrResult.full_label
                        }, cardId);

                        updateCardListQualityElement(cardView, jrResult.quality, jrResult.full_label);
                    }
                });
            }
            return;
        }

        // Якщо кешу немає — робимо запит у JacRed
        getBestReleaseFromJacred(normalizedCard, function(jrResult) {
            if (LQE_CONFIG.LOGGING_CARDLIST) console.log("LQE-CARDLIST", "card: " + cardId + ", JacRed response for list:", jrResult);

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

    /**
     * Окремо проганяємо всі вже намальовані картки (важливо для ТВ боксів)
     */
    function applyQualityToExistingCards() {
        var existingCards = document.querySelectorAll('.card');
        for (var i = 0; i < existingCards.length; i++) {
            var c = existingCards[i];
            if (c && c.isConnected) {
                updateCardListQuality(c);
            }
        }
    }

    /**
     * Обробляє повну картку (full-screen card)
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

        // Лінія рейтингу (і для нового шаблону, і для старого шаблону ТВ)
        var rateLine = $('.full-start-new__rate-line, .full-start__rate-line', renderElement);
        if (rateLine.length) {
            // Ховаємо оригінальну лінію та додаємо анімацію завантаження
            rateLine.css('visibility', 'hidden');
            rateLine.addClass('done');
            addLoadingAnimation(cardId, renderElement);
        } else {
            if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", .full-start-*__rate-line not found, skipping loading animation.");
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
            if (rateLine.length) rateLine.css('visibility', 'visible');
            return;
        }

        // Отримуємо дані з кешу
        var cachedQualityData = getQualityCache(cacheKey);

        // Перевіряємо, чи не вимкнено якість для серіалів
        if (!(isTvSeries && LQE_CONFIG.SHOW_QUALITY_FOR_TV_SERIES === false)) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", TV allowed:", !isTvSeries || LQE_CONFIG.SHOW_QUALITY_FOR_TV_SERIES !== false);

            if (cachedQualityData && cachedQualityData.quality_code && cachedQualityData.quality_code !== 'NO') {
                if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Using cached quality on full card:", cachedQualityData);

                updateFullCardQualityElement(
                    cachedQualityData.quality_code,
                    cachedQualityData.full_label,
                    cardId,
                    renderElement
                );

                var cacheTime = cachedQualityData.timestamp || 0;
                var cacheAge = Date.now() - cacheTime;

                if (cacheAge > LQE_CONFIG.CACHE_REFRESH_THRESHOLD_MS) {
                    if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Cache too old -> refreshing in background");
                    getBestReleaseFromJacred(normalizedCard, function(jrResult) {
                        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Background JacRed result:", jrResult);

                        if (jrResult && jrResult.quality && jrResult.quality !== 'NO') {
                            saveQualityCache(cacheKey, {
                                quality_code: jrResult.quality,
                                full_label: jrResult.full_label
                            }, cardId);

                            updateFullCardQualityElement(jrResult.quality, jrResult.full_label, cardId, renderElement);
                        }
                        removeLoadingAnimation(cardId, renderElement);
                        if (rateLine.length) rateLine.css('visibility', 'visible');
                    });
                } else {
                    removeLoadingAnimation(cardId, renderElement);
                    if (rateLine.length) rateLine.css('visibility', 'visible');
                }
            } else {
                // Нема кешу → звертаємось до JacRed
                getBestReleaseFromJacred(normalizedCard, function(jrResult) {
                    if (LQE_CONFIG.LOGGING_QUALITY) console.log('LQE-QUALITY', 'card: ' + cardId + ', JacRed direct result (no cache):', jrResult);

                    var qualityCode = (jrResult && jrResult.quality) || null;
                    var fullTorrentTitle = (jrResult && jrResult.full_label) || null;

                    if (LQE_CONFIG.LOGGING_QUALITY) console.log('LQE-QUALITY', 'card: ' + cardId + ', JacRed extracted quality:', qualityCode, 'label:', fullTorrentTitle);

                    if (qualityCode && qualityCode !== 'NO') {
                        saveQualityCache(cacheKey, {
                            quality_code: qualityCode,
                            full_label: fullTorrentTitle
                        }, cardId);
                        updateFullCardQualityElement(qualityCode, fullTorrentTitle, cardId, renderElement);
                    } else {
                        if (LQE_CONFIG.LOGGING_QUALITY) console.log('LQE-QUALITY', 'card: ' + cardId + ', No quality found from JacRed or it was "NO". Clearing quality elements.');
                        clearFullCardQualityElements(cardId, renderElement);
                    }

                    removeLoadingAnimation(cardId, renderElement);
                    if (rateLine.length) rateLine.css('visibility', 'visible');
                });
            }
        } else {
            // Якість вимкнено для серіалів
            if (LQE_CONFIG.LOGGING_QUALITY) console.log('LQE-QUALITY', 'card: ' + cardId + ', Quality display disabled for TV series (as configured), skipping quality fetch.');
            clearFullCardQualityElements(cardId, renderElement);
            removeLoadingAnimation(cardId, renderElement);
            if (rateLine.length) rateLine.css('visibility', 'visible');
        }

        if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", Full card quality processing initiated.");
    }

    // ===================== OBSERVER / ІНІЦІАЛІЗАЦІЯ =====================

    // MutationObserver для списків
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
                    
                    // Шукаємо картки всередині доданих контейнерів
                    var innerCards = node.querySelectorAll ? node.querySelectorAll('.card') : [];
                    for (var ic = 0; ic < innerCards.length; ic++) {
                        newCards.push(innerCards[ic]);
                    }
                }
            }
        }

        if (newCards.length) {
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
     * Ініціалізація плагіна
     */
    function initializeLampaQualityPlugin() {
        if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "Lampa Quality Enhancer: Initializing...");
        window.lampaQualityPlugin = true;

        attachObserver(); // Налаштовуємо спостерігач
        if (LQE_CONFIG.LOGGING_GENERAL) console.log('LQE-LOG: MutationObserver started');

        // Обробити вже присутні картки (важливо для ТВ-боксів, де список уже намальований до запуску плагіна)
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

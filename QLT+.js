(function() {
    // Початок анонімної функції-обгортки
    // Мета: ізолювати область видимості плагіна, щоб уникнути конфліктів імен та засмічення глобальної області
    'use strict';
    // Увімкнення суворого режиму JavaScript для більш безпечного коду (викликає помилки для поширених помилок кодування)

    // ПОЧАТОК: Конфігурація плагіна (налаштування кешу, логів, стилів, проксі)
    var LQE_CONFIG = {
        // Версія кешу: збільшується при оновленні плагіна, щоб автоматично скинути старий кеш користувачів
        CACHE_VERSION: 2,
        // Увімкнення/вимкнення загального логування (для налагодження роботи плагіна)
        LOGGING_GENERAL: false,
        // Увімкнення/вимкнення логування, специфічного для роботи з якістю
        LOGGING_QUALITY: true,
        // Увімкнення/вимкнення логування для карток у списках
        LOGGING_CARDLIST: false,
        // Час життя запису в кеші (в мілісекундах). Тут: 3 дні (3 * 24 * 60 * 60 * 1000)
        CACHE_VALID_TIME_MS: 3 * 24 * 60 * 60 * 1000,
        // Поріг для фонового оновлення кешу. Якщо дані старіші за цей час, вони все ще показуються, але запускається фоновий запит для оновлення. Тут: 12 годин
        CACHE_REFRESH_THRESHOLD_MS: 12 * 60 * 60 * 1000,
        // Ключ, під яким дані кешу зберігаються в LocalStorage браузера
        CACHE_KEY: 'lampa_quality_cache',
        // Протокол для запитів до JacRed API (http:// або https://)
        JACRED_PROTOCOL: 'http://',
        // Базовий URL JacRed API
        JACRED_URL: 'jacred.xyz',
        // API-ключ для JacRed (якщо потрібен)
        JACRED_API_KEY: '',
        // Список URL проксі-серверів для обходу CORS помилок під час запитів до JacRed API
        PROXY_LIST: [
            'http://api.allorigins.win/raw?url=',
            'http://cors.bwa.workers.dev/'
        ],
        // Таймаут для кожного проксі-запиту (в мілісекундах)
        PROXY_TIMEOUT_MS: 5000,
        // Чи показувати якість для телесеріалів (true - так, false - ні)
        SHOW_QUALITY_FOR_TV_SERIES: true,

        // --- СТИЛІ ДЛЯ ЛЕЙБЛА НА ПОВНІЙ КАРТЦІ ФІЛЬМУ ---
        // Колір рамки лейбла якості на повній картці
        FULL_CARD_LABEL_BORDER_COLOR: '#FFFFFF',
        // Колір тексту лейбла якості на повній картці
        FULL_CARD_LABEL_TEXT_COLOR: '#FFFFFF',
        // Товщина шрифту лейбла якості на повній картці
        FULL_CARD_LABEL_FONT_WEIGHT: 'normal',
        // Розмір шрифту лейбла якості на повній картці
        FULL_CARD_LABEL_FONT_SIZE: '1.22em',
        // Стиль шрифту лейбла якості на повній картці (normal, italic)
        FULL_CARD_LABEL_FONT_STYLE: 'normal',

        // --- СТИЛІ ДЛЯ ЛЕЙБЛА НА КАРТКАХ У СПИСКУ ---
        // Колір рамки лейбла якості на картках у списку
        LIST_CARD_LABEL_BORDER_COLOR: '#3DA18D',
        // Колір фону лейбла якості на картках у списку
        LIST_CARD_LABEL_BACKGROUND_COLOR: 'rgba(61, 161, 141, 0.8)',
        // Чи робити фон прозорим (true) чи використовувати LIST_CARD_LABEL_BACKGROUND_COLOR (false)
        LIST_CARD_LABEL_BACKGROUND_TRANSPARENT: false,
        // Колір тексту лейбла якості на картках у списку
        LIST_CARD_LABEL_TEXT_COLOR: '#FFFFFF',
        // Товщина шрифту лейбла якості на картках у списку
        LIST_CARD_LABEL_FONT_WEIGHT: '600',
        // Розмір шрифту лейбла якості на картках у списку
        LIST_CARD_LABEL_FONT_SIZE: '1.5em',
        // Стиль шрифту лейбла якості на картках у списку (normal, italic)
        LIST_CARD_LABEL_FONT_STYLE: 'normal',

        // Ручні перевизначення якості для окремих ID фільмів/серіалів
        // Ключ: ID кінопошуку (KP). Значення: об'єкт з якістю та текстом для відображення
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
    // Глобальна змінна для відстеження ID поточного фільму/серіалу на повній картці
    var currentGlobalMovieId = null;
    // КІНЕЦЬ: Конфігурація

    // ПОЧАТОК: Відповідність назв якості (як писано у торренті → як показати користувачу)
    var QUALITY_DISPLAY_MAP = {
        "WEBRip 1080p | AVC @ звук с TS": "1080P WEBRip/TS",
        "TeleSynch 1080P": "TS",
        "4K Web-DL 10bit HDR P81 HEVC": "4K WEB-DL",
        "Telecine [H.264/1080P] [звук с TS] [AD]": "1080P TS",
        "WEB-DLRip @ Синема УС": "WEB-DLRip",
        "UHD Blu-ray disc 2160p": "4K Blu-ray",
        "Blu-ray disc 1080P]": "1080P Blu-ray",
        "Blu-Ray Remux (1080P)": "1080P BDRemux",
        "BDRemux 1080P] [Крупный план]": "1080P BDRemux",
        "Blu-ray disc (custom) 1080P]": "1080P WEB-DLRip",
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
        "2025 / ЛМ / TC": "Telecine",

        "2160p": "4K",
        "4k": "4K",
        "4К": "4K",
        "1080p": "1080p",
        "1080": "1080p",
        "1080i": "1080p",
        "hdtv 1080i": "1080i FHDTV",
        "blu-ray remux (2160p)": "4K BDRemux",
        "hdtvrip 2160p": "4K HDTVRip",
        "hybrid 2160p": "4K Hybrid",
        "480p": "SD",
        "480": "SD",
        "web-dl": "WEB-DL",
        "webrip": "WEBRip",
        "web-dlrip (2160p)": "4K WEB-DLRip",
        "web-dlrip": "WEB-DLRip",
        "1080p web-dlrip": "1080p WEB-DLRip",
        "webdlrip": "WEB-DLRip",
        "hdtvrip-avc": "HDTVRip-AVC",
        "bluray": "BluRay",
        "bdrip": "BDRip",
        "bdremux": "BDRemux",
        "HDTVRip (1080p)": "1080p FHDTVRip",
        "hdrip": "HDRip",
        "hdtvrip (720p)": "720p HDTVRip",
        "dvdrip": "DVDRip",
        "hdtv": "HDTV",
        "dsrip": "DSRip",
        "satrip": "SATRip",
        "hdr10": "HDR",
        "dolby vision": "DV",
        "p8": "P8",
        "h.265": "H.265",
        "hevc": "HEVC",
        "h.264": "H.264",
        "av1": "AV1",
        "avc": "AVC",
        "ts": "TS",
        "camrip": "CAMRip",
        "sdr": "SDR",
        "10-bit": "10bit",
        "8-bit": "8bit",
        "profile 5": "P5",
        "profile 8.1": "P8.1",
        "p5": "P5",
        "p8.1": "P8.1",
        "profile 7": "P7",
        "p7": "P7",
        "telecine": "Telecine",
        "tc": "Telecine",
        "ts": "TeleSync"
    };
    // КІНЕЦЬ: Відповідність назв якості

    // ПОЧАТОК: Які параметри якості важливіші при складанні позначки (порядок пріоритетів)
    var QUALITY_PRIORITY_ORDER = [
        'resolution', // Роздільна здатність (найважливіша)
        'source',     // Джерело (друга за важливістю)
        // Інші компоненти (HDR, кодек, глибина кольору, профіль) не входять до пріоритетного списку для стислості
    ];
    // КІНЕЦЬ: Порядок пріоритетів

    // ПОЧАТОК: CSS стилі для відображення якості на картках та у повному описі
    var styleLQE = "<style id=\"lampa_quality_styles\">" +
        ".full-start-new__rate-line {" +
        "visibility: hidden !important;" +
        "flex-wrap: wrap !important;" +
        "gap: 0.4em 0 !important;" +
        "}" +
        ".full-start-new__rate-line > * {" +
        "margin-right: 0.5em !important;" +
        "flex-shrink: 0 !important;" +
        "flex-grow: 0 !important;" +
        "}" +
        ".lqe-quality {" +
        " min-width: 2.8em !important;" +
        " text-align: center !important;" +
        " text-transform: none !important;" +
        " border: 0.8px solid " + LQE_CONFIG.FULL_CARD_LABEL_BORDER_COLOR + " !important;" +
        " color: " + LQE_CONFIG.FULL_CARD_LABEL_TEXT_COLOR + " !important;" +
        " font-weight: " + LQE_CONFIG.FULL_CARD_LABEL_FONT_WEIGHT + " !important;" +
        " font-size: " + LQE_CONFIG.FULL_CARD_LABEL_FONT_SIZE + " !important;" +
        " font-style: " + LQE_CONFIG.FULL_CARD_LABEL_FONT_STYLE + " !important;" +
        " border-radius: 0.19em !important;" +
        " padding: 0.25em 0.31em !important;" +
        "}" +
        ".card__view {" +
        " position: relative !important;" +
        "}" +
        ".card__quality {" +
        " position: absolute !important;" +
        " bottom: 0.55em !important;" +
        " left: 0 !important;" +
        " background-color: " + (LQE_CONFIG.LIST_CARD_LABEL_BACKGROUND_TRANSPARENT ? "transparent" : LQE_CONFIG.LIST_CARD_LABEL_BACKGROUND_COLOR) + " !important;" +
        " z-index: 10 !important;" +
        " width: fit-content !important;" +
        " max-width: calc(100% - 1em) !important;" +
        " border-radius: 0 0.8em 0.8em 0 !important;" +
        " overflow: hidden !important;" +
        "}" +
        ".card__quality div {" +
        " text-transform: uppercase !important;" +
        " font-family: 'Roboto Condensed', 'Arial Narrow', Arial, sans-serif !important;" +
        " font-weight: 700 !important;" +
        " letter-spacing: 0.5px !important;" +
        " font-size: 0.75em !important;" +
        " color: " + LQE_CONFIG.LIST_CARD_LABEL_TEXT_COLOR + " !important;" +
        " padding: 0.1em 0.5em 0.08em 0.4em !important;" +
        " white-space: nowrap !important;" +
        " text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.3) !important;" +
        "}" +
        "</style>";
    // Додаємо шаблон CSS до системи шаблонів Lampac і вставляємо його в <body>
    Lampa.Template.add('lampa_quality_css', styleLQE);
    $('body').append(Lampa.Template.get('lampa_quality_css', {}, true));
    // КІНЕЦЬ: CSS стилі для ярликів якості

    // ПОЧАТОК: CSS стилі для анімації завантаження (три точки)
    var loadingStylesLQE = "<style id=\"lampa_quality_loading_animation\">" +
        ".loading-dots-container {" +
        "    position: absolute !important;" +
        "    top: 50% !important;" +
        "    left: 0 !important;" +
        "    right: 0 !important;" +
        "    text-align: left !important;" +
        "    transform: translateY(-50%) !important;" +
        "    z-index: 10 !important;" +
        "}" +
        ".full-start-new__rate-line {" +
        "    position: relative !important;" +
        "}" +
        ".loading-dots {" +
        "    display: inline-flex !important;" +
        "    align-items: center !important;" +
        "    gap: 0.4em !important;" +
        "    color: #ffffff !important;" +
        "    font-size: 0.7em !important;" +
        "    background: rgba(0, 0, 0, 0.3) !important;" +
        "    padding: 0.6em 1em !important;" +
        "    border-radius: 0.5em !important;" +
        "}" +
        ".loading-dots__text {" +
        "    margin-right: 1em !important;" +
        "}" +
        ".loading-dots__dot {" +
        "    width: 0.5em !important;" +
        "    height: 0.5em !important;" +
        "    border-radius: 50% !important;" +
        "    background-color: currentColor !important;" +
        "    opacity: 0.3 !important;" +
        "    animation: loading-dots-fade 1.5s infinite both !important;" +
        "}" +
        ".loading-dots__dot:nth-child(1) {" +
        "    animation-delay: 0s !important;" +
        "}" +
        ".loading-dots__dot:nth-child(2) {" +
        "    animation-delay: 0.5s !important;" +
        "}" +
        ".loading-dots__dot:nth-child(3) {" +
        "    animation-delay: 1s !important;" +
        "}" +
        "@keyframes loading-dots-fade {" +
        "    0%, 90%, 100% { opacity: 0.3 !important; }" +
        "    35% { opacity: 1 !important; }" +
        "}" +
        "@media screen and (max-width: 480px) { .loading-dots-container { -webkit-justify-content: center !important; justify-content: center !important; text-align: center !important; max-width: 100% !important; }}" +
        "</style>";
    // Додаємо шаблон анімації завантаження до системи шаблонів Lampac і вставляємо його в <body>
    Lampa.Template.add('lampa_quality_loading_animation_css', loadingStylesLQE);
    $('body').append(Lampa.Template.get('lampa_quality_loading_animation_css', {}, true));
    // КІНЕЦЬ: CSS стилі для анімації завантаження

    // ПОЧАТОК: Завантаження даних з JacRed через список проксі
    function fetchWithProxy(url, cardId, callback) {
        var currentProxyIndex = 0; // Індекс поточного проксі зі списку PROXY_LIST
        var callbackCalled = false; // Прапорець, щоб гарантувати, що callback викликається лише один раз

        // Рекурсивна функція для спроб використання наступного проксі у списку
        function tryNextProxy() {
            // Якщо всі проксі зі списку вичерпано, викликаємо callback з помилкою
            if (currentProxyIndex >= LQE_CONFIG.PROXY_LIST.length) {
                if (!callbackCalled) {
                    callbackCalled = true;
                    callback(new Error('All proxies failed for ' + url));
                }
                return;
            }
            // Формуємо повний URL запиту: проксі + закодований URL JacRed API
            var proxyUrl = LQE_CONFIG.PROXY_LIST[currentProxyIndex] + encodeURIComponent(url);
            if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", Fetch with proxy: " + proxyUrl);
            // Встановлюємо таймаут для поточного проксі-запиту
            var timeoutId = setTimeout(function() {
                if (!callbackCalled) {
                    currentProxyIndex++; // Переходимо до наступного проксі
                    tryNextProxy(); // Рекурсивний виклик для спроби наступного проксі
                }
            }, LQE_CONFIG.PROXY_TIMEOUT_MS);
            // Виконуємо фактичний HTTP-запит через fetch
            fetch(proxyUrl)
                .then(function(response) {
                    clearTimeout(timeoutId); // Очищаємо таймаут, якщо відповідь отримано
                    if (!response.ok) throw new Error('Proxy error: ' + response.status); // Перевіряємо статус відповіді
                    return response.text(); // Парсимо відповідь як текст
                })
                .then(function(data) {
                    if (!callbackCalled) {
                        callbackCalled = true;
                        clearTimeout(timeoutId);
                        callback(null, data); // Викликаємо callback з успішно отриманими даними
                    }
                })
                .catch(function(error) {
                    console.error("LQE-LOG", "card: " + cardId + ", Proxy fetch error for " + proxyUrl + ":", error);
                    clearTimeout(timeoutId);
                    if (!callbackCalled) {
                        currentProxyIndex++; // Переходимо до наступного проксі
                        tryNextProxy(); // Рекурсивний виклик для спроби наступного проксі
                    }
                });
        }
        // Починаємо процес, викликаючи функцію для першого проксі
        tryNextProxy();
    }
    // КІНЕЦЬ: fetchWithProxy

    // ПОЧАТОК: Додати анімацію 'Завантаження...' на картку
    function addLoadingAnimation(cardId, renderElement) {
        if (!renderElement) return; // Перевірка наявності елементу для рендерингу
        if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", Add loading animation");
        // Знаходимо контейнер (.full-start-new__rate-line) всередині renderElement
        var rateLine = $('.full-start-new__rate-line', renderElement);
        // Якщо контейнер не знайдено або анімація вже додана, виходимо
        if (!rateLine.length || $('.loading-dots-container', rateLine).length) return;
        // Додаємо HTML-структуру анімації завантаження (три точки) до контейнера
        rateLine.append(
            '<div class="loading-dots-container">' +
            '<div class="loading-dots">' +
            '<span class="loading-dots__text">Загрузка...</span>' +
            '<span class="loading-dots__dot"></span>' +
            '<span class="loading-dots__dot"></span>' +
            '<span class="loading-dots__dot"></span>' +
            '</div>' +
            '</div>'
        );
        // Примусово робимо контейнер анімації видимим
        $('.loading-dots-container', rateLine).css({
            'opacity': '1',
            'visibility': 'visible'
        });
    }
    // КІНЕЦЬ: addLoadingAnimation

    // ПОЧАТОК: Прибрати анімацію 'Завантаження...' з картки
    function removeLoadingAnimation(cardId, renderElement) {
        if (!renderElement) return; // Перевірка наявності елементу для рендерингу
        if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", Remove loading animation");
        // Знаходимо та видаляємо контейнер анімації завантаження
        $('.loading-dots-container', renderElement).remove();
    }
    // КІНЕЦЬ: removeLoadingAnimation

    // ПОЧАТОК: Визначення типу картки (фільм чи серіал)
    function getCardType(cardData) {
        // Спершу намагаємося отримати тип з властивостей media_type або type
        var type = cardData.media_type || cardData.type;
        // Якщо тип відомий (movie або tv), повертаємо його
        if (type === 'movie' || type === 'tv') return type;
        // Якщо тип невідомий, визначаємо його за наявністю властивостей, характерних для серіалів
        // Серіали мають властивості name або original_name, фільми - title або original_title
        return cardData.name || cardData.original_name ? 'tv' : 'movie';
    }
    // КІНЕЦЬ: getCardType

    // ПОЧАТОК: Перетворення сирого ярлика якості у гарний вигляд
    function translateQualityLabel(qualityCode, fullTorrentTitle) {
        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "translateQualityLabel: Received qualityCode:", qualityCode, "fullTorrentTitle:", fullTorrentTitle);
        let finalDisplayLabel = ''; // Фінальний текст для відображення
        // Приводимо повну назву торренту до нижнього регістру для порівняння
        const lowerFullTorrentTitle = (fullTorrentTitle || '').toLowerCase();
        let bestDirectMatchKey = ''; // Ключ найкращого прямого збігу
        let maxDirectMatchLength = 0; // Довжина найкращого прямого збігу

        // Список простих ключових слів, які не повинні вважатися прямими збігами
        const simpleComponentKeywords = [
            '2160p', '4k', '4к', '1080P', '1080', '720p', '480p',
            'web-dl', 'webrip', 'bluray', 'bdrip', 'bdremux',
            'hdrip', 'dvdrip', 'hdtv', 'dsrip', 'satrip', 'web',
            'hdr10', 'dolby vision', 'dv', 'p8', 'h.265', 'hevc',
            'h.264', 'avc', 'av1', 'ts', 'camrip', 'sdr', '10-bit',
            '8-bit', 'profile 5', 'profile 8.1', 'p5', 'p8.1',
            'profile 7', 'p7', 'telecine'
        ].map(k => k.toLowerCase());

        // Шукаємо найкращий прямий збіг (довший і не входить до простих ключових слів)
        for (const key in QUALITY_DISPLAY_MAP) {
            if (QUALITY_DISPLAY_MAP.hasOwnProperty(key)) {
                const lowerKey = String(key).toLowerCase();
                // Якщо назва торренту містить ключ, ключ довший за 5 символів і не є простим ключовим словом
                if (lowerFullTorrentTitle.includes(lowerKey) && lowerKey.length > 5 && !simpleComponentKeywords.includes(lowerKey)) {
                    // Вибираємо найдовший збіг
                    if (lowerKey.length > maxDirectMatchLength) {
                        maxDirectMatchLength = lowerKey.length;
                        bestDirectMatchKey = key;
                    }
                }
            }
        }
        // Якщо знайдено прямий збіг, використовуємо відповідне відображення
        if (bestDirectMatchKey) {
            finalDisplayLabel = QUALITY_DISPLAY_MAP[bestDirectMatchKey];
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", `translateQualityLabel: Explicit direct match found for key "${bestDirectMatchKey}". Displaying "${finalDisplayLabel}".`);
            return finalDisplayLabel;
        }

        // Об'єкт для зберігання витягнутих компонентів якості
        let extracted = {
            resolution: '', // Роздільна здатність (напр., 1080p)
            source: '',     // Джерело (напр., WEB-DL)
            hdr: '',        // HDR (напр., HDR10)
            codec: '',      // Кодек (напр., HEVC)
            bit_depth: '',  // Глибина кольору (напр., 10bit)
            profile: ''     // Профіль (напр., P8)
        };

        // Витягуємо роздільну здатність з назви торренту
        const resolutionMatch = lowerFullTorrentTitle.match(/(\d{3,4}p)|(4k)|(4\s*к)/);
        if (resolutionMatch) {
            let matchedRes = resolutionMatch[1] || resolutionMatch[2] || resolutionMatch[3];
            if (matchedRes) {
                matchedRes = matchedRes.replace(/\s*/g, '').toLowerCase(); // Видаляємо пробіли
                // Використовуємо відображення з QUALITY_DISPLAY_MAP або форматуємо самостійно
                extracted.resolution = QUALITY_DISPLAY_MAP[matchedRes] || (matchedRes.includes('p') ? matchedRes.toUpperCase() : (matchedRes === '4k' || matchedRes === '4к' ? '4K' : ''));
            }
            if (LQE_CONFIG.LOGGING_QUALITY) console.log(`LQE-QUALITY: Extracted resolution raw: "${resolutionMatch[0]}", mapped: "${extracted.resolution}"`);
        }

        // Витягуємо джерело (source) з назви торренту
        const sourceRegex = /(web-dl|webrip|bluray|bdrip|hdrip|dvdrip|hdtv|dsrip|satrip|web|bdremux|telecine|ts|camrip)\b/g;
        let sourceMatch;
        let tempSource = '';
        // Шукаємо всі збіги та вибираємо найдовший (найбільш специфічний)
        while ((sourceMatch = sourceRegex.exec(lowerFullTorrentTitle)) !== null) {
            if (sourceMatch[1].length > tempSource.length) {
                tempSource = sourceMatch[1];
            }
        }
        if (tempSource) {
            // Використовуємо відображення з QUALITY_DISPLAY_MAP або форматуємо самостійно
            extracted.source = QUALITY_DISPLAY_MAP[tempSource] || tempSource.toUpperCase();
            if (LQE_CONFIG.LOGGING_QUALITY) console.log(`LQE-QUALITY: Extracted source raw: "${tempSource}", mapped: "${extracted.source}"`);
        }

        // Витягуємо інформацію про HDR
        const hdrMatch = lowerFullTorrentTitle.match(/(hdr10\+?|dolby\s*vision|dv|sdr)\b/);
        if (hdrMatch) {
            let hdrKey = hdrMatch[1].replace(/\s*/g, '').toLowerCase();
            extracted.hdr = QUALITY_DISPLAY_MAP[hdrKey] || hdrKey.toUpperCase();
            if (LQE_CONFIG.LOGGING_QUALITY) console.log(`LQE-QUALITY: Extracted HDR raw: "${hdrMatch[1]}", mapped: "${extracted.hdr}"`);
        }

        // Витягуємо інформацію про кодек
        const codecMatch = lowerFullTorrentTitle.match(/(h\.265|hevc|h\.264|avc|av1)\b/);
        if (codecMatch) {
            extracted.codec = QUALITY_DISPLAY_MAP[codecMatch[1].toLowerCase()] || codecMatch[1].toUpperCase().replace(/\./g, '');
            if (LQE_CONFIG.LOGGING_QUALITY) console.log(`LQE-QUALITY: Extracted codec raw: "${codecMatch[1]}", mapped: "${extracted.codec}"`);
        }

        // Витягуємо інформацію про глибину кольору (бітність)
        const bitDepthMatch = lowerFullTorrentTitle.match(/(10-?bit|8-?bit)\b/);
        if (bitDepthMatch) {
            let bitKey = bitDepthMatch[1].toLowerCase();
            extracted.bit_depth = QUALITY_DISPLAY_MAP[bitKey] || bitKey.replace(/-/g, '');
            if (LQE_CONFIG.LOGGING_QUALITY) console.log(`LQE-QUALITY: Extracted bit_depth raw: "${bitDepthMatch[1]}", mapped: "${extracted.bit_depth}"`);
        }

        // Витягуємо інформацію про профіль (для Dolby Vision)
        const profileMatch = lowerFullTorrentTitle.match(/(profile\s*(5|8\.1|7)|p5|p8\.1|p7)\b/);
        if (profileMatch) {
            let profileKey = profileMatch[1].replace(/\s*/g, '').toLowerCase();
            // Стандартизуємо назву профілю (напр., "profile 5" -> "p5")
            if (profileKey.includes('profile')) {
                profileKey = 'p' + (profileMatch[2] || profileMatch[3]).replace('.', '');
            }
            extracted.profile = QUALITY_DISPLAY_MAP[profileKey] || profileKey.toUpperCase();
            if (LQE_CONFIG.LOGGING_QUALITY) console.log(`LQE-QUALITY: Extracted profile raw: "${profileMatch[1]}", mapped: "${extracted.profile}"`);
        }

        if (LQE_CONFIG.LOGGING_QUALITY) {
            console.log("LQE-QUALITY: Extracted components for assembly:", JSON.stringify(extracted));
        }

        // Складаємо фінальний ярлик з компонентів у порядку пріоритету
        let assembledParts = [];
        QUALITY_PRIORITY_ORDER.forEach(componentType => {
            if (extracted[componentType]) {
                assembledParts.push(extracted[componentType]);
            }
        });
        finalDisplayLabel = assembledParts.join(' ').trim();

        // Якщо не вдалося скласти ярлик, використовуємо qualityCode як запасний варіант
        if (finalDisplayLabel === '' && qualityCode) {
            const lowerQualityCode = String(qualityCode).toLowerCase();
            finalDisplayLabel = QUALITY_DISPLAY_MAP[lowerQualityCode] || qualityCode;
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", `translateQualityLabel: No detailed assembled match. Using qualityCode fallback: "${finalDisplayLabel}"`);
        }

        // Якщо навіть qualityCode не допоміг, залишаємо порожній рядок або використовуємо сирий qualityCode
        if (finalDisplayLabel === '') {
            finalDisplayLabel = qualityCode || '';
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", `translateQualityLabel: No quality found, using raw qualityCode: "${finalDisplayLabel}"`);
        }

        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", `translateQualityLabel: Final display label: "${finalDisplayLabel}"`);
        return finalDisplayLabel;
    }
    // КІНЕЦЬ: translateQualityLabel

    // ПОЧАТОК: Пошук найкращого релізу у JacRed API
    function getBestReleaseFromJacred(normalizedCard, cardId, callback) {
        // Перевірка наявності URL JacRed
        if (!LQE_CONFIG.JACRED_URL) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", JacRed: JACRED_URL is not set.");
            callback(null);
            return;
        }
        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", JacRed: Search initiated.");
        var year = '';
        var dateStr = normalizedCard.release_date || '';
        // Витягуємо рік з дати релізу (перші 4 символи)
        if (dateStr.length >= 4) {
            year = dateStr.substring(0, 4);
        }
        // Якщо рік невірний, припиняємо пошук
        if (!year || isNaN(year)) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", JacRed: Missing/invalid year for normalizedCard:", normalizedCard);
            callback(null);
            return;
        }

        // Функція для пошуку через JacRed API з конкретною стратегією
        function searchJacredApi(searchTitle, searchYear, exactMatch, strategyName, apiCallback) {
            // Отримуємо унікальний ID користувача Lampac (якщо потрібно)
            var userId = Lampa.Storage.get('lampac_unic_id', '');
            // Формуємо URL для запиту до JacRed API
            var apiUrl = LQE_CONFIG.JACRED_PROTOCOL + LQE_CONFIG.JACRED_URL + '/api/v1.0/torrents?search=' +
                encodeURIComponent(searchTitle) +
                '&year=' + searchYear +
                (exactMatch ? '&exact=true' : '') +
                '&uid=' + userId;
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", JacRed: " + strategyName + " URL: " + apiUrl);
            // Створюємо AbortController для можливості переривання запиту
            var controller = new AbortController();
            var signal = controller.signal;
            // Встановлюємо загальний таймаут для цієї стратегії (всі проксі * таймаут + запас)
            var timeoutId = setTimeout(() => {
                controller.abort();
                if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", `card: ${cardId}, JacRed: ${strategyName} request timed out.`);
                apiCallback(null);
            }, LQE_CONFIG.PROXY_TIMEOUT_MS * LQE_CONFIG.PROXY_LIST.length + 1000);
            // Виконуємо запит через проксі
            fetchWithProxy(apiUrl, cardId, function(error, responseText) {
                clearTimeout(timeoutId); // Очищаємо таймаут
                if (error) {
                    console.error("LQE-LOG", "card: " + cardId + ", JacRed: " + strategyName + " request failed:", error);
                    apiCallback(null);
                    return;
                }
                if (!responseText) {
                    if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", JacRed: " + strategyName + " failed or empty response.");
                    apiCallback(null);
                    return;
                }
                try {
                    // Парсимо JSON-відповідь
                    var torrents = JSON.parse(responseText);
                    // Перевіряємо, що відповідь - непустий масив
                    if (!Array.isArray(torrents) || torrents.length === 0) {
                        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", JacRed: " + strategyName + " received no torrents or invalid array.");
                        apiCallback(null);
                        return;
                    }
                    var bestNumericQuality = -1; // Найкраща знайдена якість (числове значення)
                    var bestFoundTorrent = null;  // Найкращий знайдений торент
                    var searchYearNum = parseInt(searchYear, 10); // Рік пошуку як число

                    // Допоміжна функція для визначення якості за назвою торренту (якщо від API прийшло 0)
                    function extractNumericQualityFromTitle(title) {
                        if (!title) return 0;
                        var lower = title.toLowerCase();
                        if (/2160p|4k/.test(lower)) return 2160;
                        if (/1080P/.test(lower)) return 1080;
                        if (/720p/.test(lower)) return 720;
                        if (/480p/.test(lower)) return 480;
                        if (/ts|telesync/.test(lower)) return 1;  // Низька якість для TS
                        if (/camrip|камрип/.test(lower)) return 2; // Низька якість для CAMRip
                        return 0; // Невідома якість
                    }

                    // Допоміжна функція для витягування року з назви торренту
                    function extractYearFromTitle(title) {
                        if (!title) return 0;
                        var regex = /(?:^|[^\d])(\d{4})(?:[^\d]|$)/g;
                        var match;
                        var lastYear = 0;
                        var currentYear = new Date().getFullYear();
                        // Шукаємо всі 4-значні числа у назві, які можуть бути роком
                        while ((match = regex.exec(title)) !== null) {
                            var extractedYear = parseInt(match[1], 10);
                            // Фільтруємо нереальні роки
                            if (extractedYear >= 1900 && extractedYear <= currentYear + 1) {
                                lastYear = extractedYear;
                            }
                        }
                        return lastYear;
                    }

                    // Перебираємо всі торренти у відповіді
                    for (var i = 0; i < torrents.length; i++) {
                        var currentTorrent = torrents[i];
                        var currentNumericQuality = currentTorrent.quality; // Якість від API
                        var torrentYear = currentTorrent.relased; // Рік релізу від API

                        // Якщо якість від API невизначена або 0, намагаємося визначити її з назви
                        if (typeof currentNumericQuality !== 'number' || currentNumericQuality === 0) {
                            var extractedQuality = extractNumericQualityFromTitle(currentTorrent.title);
                            if (extractedQuality > 0) {
                                currentNumericQuality = extractedQuality;
                            } else {
                                continue; // Пропускаємо торент з невизначеною якістю
                            }
                        }

                        var isYearValid = false;
                        var parsedYear = 0;
                        // Перевіряємо рік від API
                        if (torrentYear && !isNaN(torrentYear) && torrentYear > 1900) {
                            parsedYear = parseInt(torrentYear, 10);
                            isYearValid = true;
                        }
                        // Якщо рік від API невірний, намагаємося витягти його з назви
                        if (!isYearValid) {
                            parsedYear = extractYearFromTitle(currentTorrent.title);
                            if (parsedYear > 0) {
                                torrentYear = parsedYear;
                                isYearValid = true;
                            }
                        }
                        // Якщо рік знайдено і він не співпадає з шуканим, пропускаємо торент
                        if (isYearValid && !isNaN(searchYearNum) && parsedYear !== searchYearNum) {
                            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Torrent year mismatch, skipping. Torrent: " + currentTorrent.title + ", Searched: " + searchYearNum + ", Found: " + parsedYear);
                            continue;
                        }

                        // Логуємо інформацію про торент
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

                        // Визначаємо найкращий торент: вища якість, а при однаковій якості - довша назва (більше деталей)
                        if (currentNumericQuality > bestNumericQuality) {
                            bestNumericQuality = currentNumericQuality;
                            bestFoundTorrent = currentTorrent;
                        } else if (currentNumericQuality === bestNumericQuality && bestFoundTorrent && currentTorrent.title.length > bestFoundTorrent.title.length) {
                            bestFoundTorrent = currentTorrent;
                        }
                    }

                    // Якщо найкращий торент знайдено, передаємо його дані в callback
                    if (bestFoundTorrent) {
                        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", JacRed: Found best torrent in " + strategyName + ": \"" + bestFoundTorrent.title + "\" with quality: " + (bestFoundTorrent.quality || bestNumericQuality) + "p");
                        apiCallback({
                            quality: bestFoundTorrent.quality || bestNumericQuality, // Якість
                            full_label: bestFoundTorrent.title // Повна назва торренту
                        });
                    } else {
                        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", JacRed: No suitable torrents found in " + strategyName + ".");
                        apiCallback(null);
                    }
                } catch (e) {
                    console.error("LQE-LOG", "card: " + cardId + ", JacRed: " + strategyName + " error parsing response or processing torrents:", e);
                    apiCallback(null);
                }
            });
        }

        // Визначаємо стратегії пошуку (які заголовки та роки шукати)
        var searchStrategies = [];
        // Стратегія 1: Оригінальна назва + точний рік
        if (normalizedCard.original_title && (/[a-zа-яё]/i.test(normalizedCard.original_title) || /^\d+$/.test(normalizedCard.original_title))) {
            searchStrategies.push({
                title: normalizedCard.original_title.trim(),
                year: year,
                exact: true,
                name: "OriginalTitle Exact Year"
            });
        }
        // Стратегія 2: Локалізована назва + точний рік
        if (normalizedCard.title && (/[a-zа-яё]/i.test(normalizedCard.title) || /^\d+$/.test(normalizedCard.title))) {
            searchStrategies.push({
                title: normalizedCard.title.trim(),
                year: year,
                exact: true,
                name: "Title Exact Year"
            });
        }

        // Функція для послідовного виконання стратегій
        function executeNextStrategy(index) {
            // Якщо всі стратегії вичерпано, викликаємо callback з null
            if (index >= searchStrategies.length) {
                if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", JacRed: All strategies failed. No quality found.");
                callback(null);
                return;
            }
            var strategy = searchStrategies[index];
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", JacRed: Trying strategy: " + strategy.name);
            // Виконуємо поточну стратегію
            searchJacredApi(strategy.title, strategy.year, strategy.exact, strategy.name, function(result) {
                if (result !== null) {
                    // Якщо стратегія успішна, передаємо результат у зовнішній callback
                    if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", JacRed: Successfully found quality using strategy " + strategy.name + ": " + result.quality + " (torrent: \"" + result.full_label + "\")");
                    callback(result);
                } else {
                    // Якщо стратегія не вдалася, переходимо до наступної
                    executeNextStrategy(index + 1);
                }
            });
        }

        // Запускаємо виконання стратегій, якщо вони є
        if (searchStrategies.length > 0) {
            executeNextStrategy(0);
        } else {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", JacRed: No valid search titles or strategies defined.");
            callback(null);
        }
    }
    // КІНЕЦЬ: getBestReleaseFromJacred

    // ПОЧАТОК: Перевірка кешу наявності даних про якість
    function getQualityCache(key) {
        // Отримуємо весь кеш з LocalStorage
        var cache = Lampa.Storage.get(LQE_CONFIG.CACHE_KEY) || {};
        // Отримуємо запис для конкретного ключа (ID фільму/серіалу + тип)
        var item = cache[key];
        // Перевіряємо, чи запис існує і чи не прострочений
        var isCacheValid = item && (Date.now() - item.timestamp < LQE_CONFIG.CACHE_VALID_TIME_MS);
        if (LQE_CONFIG.LOGGING_QUALITY) {
            console.log("LQE-QUALITY", "Cache: Checking quality cache for key:", key, "Found:", !!item, "Valid:", isCacheValid);
        }
        // Повертаємо запис, якщо він валідний, інакше - null
        return isCacheValid ? item : null;
    }
    // КІНЕЦЬ: getQualityCache

    // ПОЧАТОК: Збереження інформації про якість у кеш
    function saveQualityCache(key, data, cardId) {
        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "Cache: Saving quality cache for key:", key, "Data:", data);
        // Отримуємо весь кеш
        var cache = Lampa.Storage.get(LQE_CONFIG.CACHE_KEY) || {};
        // Оновлюємо або створюємо запис для ключа
        cache[key] = {
            quality_code: data.quality_code, // Код якості (напр., 1080)
            full_label: data.full_label,     // Повна назва торренту
            timestamp: Date.now()            // Час створення/оновлення запису
        };
        // Зберігаємо оновлений кеш назад у LocalStorage
        Lampa.Storage.set(LQE_CONFIG.CACHE_KEY, cache);
    }
    // КІНЕЦЬ: saveQualityCache

    // ПОЧАТОК: Видалення старих елементів якості з повної картки
    function clearFullCardQualityElements(cardId, renderElement) {
        if (renderElement) {
            // Знаходимо всі елементи якості всередині renderElement
            var existingElements = $('.full-start__status.lqe-quality', renderElement);
            if (existingElements.length > 0) {
                if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Clearing existing quality elements on full card.");
                // Видаляємо знайдені елементи
                existingElements.remove();
            }
        }
    }
    // КІНЕЦЬ: clearFullCardQualityElements

    // ПОЧАТОК: Додати плейсхолдер 'Завантаження...' у повну картку
    function showFullCardQualityPlaceholder(cardId, renderElement) {
        if (!renderElement) return;
        // Знаходимо контейнер для рейтингу/статусу
        var rateLine = $('.full-start-new__rate-line', renderElement);
        if (!rateLine.length) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Cannot show placeholder, .full-start-new__rate-line not found.");
            return;
        }
        // Перевіряємо, чи ще не додано плейсхолдер
        if (!$('.full-start__status.lqe-quality', rateLine).length) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Adding quality placeholder on full card.");
            // Створюємо елемент плейсхолдера
            var placeholder = document.createElement('div');
            placeholder.className = 'full-start__status lqe-quality';
            placeholder.textContent = 'Загрузка...';
            placeholder.style.opacity = '0.7'; // Робимо напівпрозорим
            // Додаємо плейсхолдер до контейнера
            rateLine.append(placeholder);
        } else {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Placeholder already exists on full card, skipping.");
        }
    }
    // КІНЕЦЬ: showFullCardQualityPlaceholder

    // ПОЧАТОК: Оновлення (або створення) ярлика якості на повній картці
    function updateFullCardQualityElement(qualityCode, fullTorrentTitle, cardId, renderElement, bypassTranslation = false) {
        if (!renderElement) return;
        // Шукаємо існуючий елемент якості
        var element = $('.full-start__status.lqe-quality', renderElement);
        // Знаходимо контейнер для рейтингу/статусу
        var rateLine = $('.full-start-new__rate-line', renderElement);
        if (!rateLine.length) return;

        // Визначаємо текст для відображення: якщо bypassTranslation=true, використовуємо fullTorrentTitle без змін, інакше - транслюємо
        var displayQuality = bypassTranslation ? fullTorrentTitle : translateQualityLabel(qualityCode, fullTorrentTitle);

        // Якщо елемент вже існує, оновлюємо його текст
        if (element.length) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log('LQE-QUALITY', 'card: ' + cardId + ', Updating existing element with quality "' + displayQuality + '" on full card.');
            element.text(displayQuality).css('opacity', '1');
        } else {
            // Якщо елемента немає, створюємо новий
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Creating new element with quality '" + displayQuality + "' on full card.");
            var div = document.createElement('div');
            div.className = 'full-start__status lqe-quality';
            div.textContent = displayQuality;
            rateLine.append(div);
        }
    }
    // КІНЕЦЬ: updateFullCardQualityElement

    // ПОЧАТОК: Логіка обробки повної картки (перевірка кешу, JacRed, ручних правил)
    function processFullCardQuality(cardData, renderElement) {
        if (!renderElement) {
            console.error("LQE-LOG", "Render element is null in processFullCardQuality. Aborting.");
            return;
        }
        var cardId = cardData.id;
        if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", Processing full card. Data: ", cardData);
        // Нормалізуємо дані картки до єдиного формату
        var normalizedCard = {
            id: cardData.id,
            title: cardData.title || cardData.name || '',
            original_title: cardData.original_title || cardData.original_name || '',
            type: getCardType(cardData),
            release_date: cardData.release_date || cardData.first_air_date || ''
        };
        if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", Normalized full card data: ", normalizedCard);
        // Знаходимо контейнер для рейтингу/статусу і ховаємо його поки йде завантаження
        var rateLine = $('.full-start-new__rate-line', renderElement);
        if (rateLine.length) {
            rateLine.css('visibility', 'hidden');
            rateLine.addClass('done');
            // Додаємо анімацію завантаження
            addLoadingAnimation(cardId, renderElement);
        } else {
            if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", .full-start-new__rate-line not found, skipping loading animation.");
        }
        // Визначаємо, чи це серіал
        var isTvSeries = (normalizedCard.type === 'tv' || normalizedCard.name);
        // Формуємо ключ для кешу: версія_тип_id (напр., 2_movie_12345)
        var cacheKey = LQE_CONFIG.CACHE_VERSION + '_' + (isTvSeries ? 'tv_' : 'movie_') + normalizedCard.id;

        // Перевіряємо наявність ручного перевизначення для цього ID
        var manualOverrideData = LQE_CONFIG.MANUAL_OVERRIDES[cardId];
        if (manualOverrideData) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Found manual override:", manualOverrideData);
            // Оновлюємо інтерфейс, використовуючи дані з ручного перевизначення (bypassTranslation=true)
            updateFullCardQualityElement(null, manualOverrideData.full_label, cardId, renderElement, true);
            // Прибираємо анімацію завантаження і показуємо контейнер
            removeLoadingAnimation(cardId, renderElement);
            rateLine.css('visibility', 'visible');
            return; // Ручне перевизначення має найвищий пріоритет - виходимо
        }

        // Перевіряємо кеш на наявність даних про якість
        var cachedQualityData = getQualityCache(cacheKey);
        // Перевіряємо, чи не вимкнено якість для серіалів у конфігурації
        if (!(isTvSeries && LQE_CONFIG.SHOW_QUALITY_FOR_TV_SERIES === false)) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log('LQE-QUALITY', 'card: ' + cardId + ', Quality feature enabled for this content, starting processing.');
            // Якщо дані є в кеші
            if (cachedQualityData) {
                if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Quality data found in cache:", cachedQualityData);
                // Оновлюємо інтерфейс даними з кешу
                updateFullCardQualityElement(cachedQualityData.quality_code, cachedQualityData.full_label, cardId, renderElement);

                // Якщо дані в кеші застаріли (старші за CACHE_REFRESH_THRESHOLD_MS), робимо фонове оновлення
                if (Date.now() - cachedQualityData.timestamp > LQE_CONFIG.CACHE_REFRESH_THRESHOLD_MS) {
                    if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Cache is old, scheduling background refresh AND UI update.");
                    getBestReleaseFromJacred(normalizedCard, cardId, function(jrResult) {
                        // Якщо нові дані отримано успішно
                        if (jrResult && jrResult.quality && jrResult.quality !== 'NO') {
                            // Оновлюємо кеш
                            saveQualityCache(cacheKey, {
                                quality_code: jrResult.quality,
                                full_label: jrResult.full_label
                            }, cardId);
                            // Оновлюємо інтерфейс новими даними
                            updateFullCardQualityElement(jrResult.quality, jrResult.full_label, cardId, renderElement);
                            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Background cache and UI refresh completed.");
                        }
                    });
                }
                // Прибираємо анімацію завантаження і показуємо контейнер
                removeLoadingAnimation(cardId, renderElement);
                rateLine.css('visibility', 'visible');
            } else {
                // Якщо даних у кеші немає
                // Очищаємо можливі старі елементи якості
                clearFullCardQualityElements(cardId, renderElement);
                // Показуємо плейсхолдер "Загрузка..."
                showFullCardQualityPlaceholder(cardId, renderElement);
                // Робимо запит до JacRed API для пошуку якості
                getBestReleaseFromJacred(normalizedCard, cardId, function(jrResult) {
                    if (LQE_CONFIG.LOGGING_QUALITY) console.log('LQE-QUALITY', 'card: ' + cardId + ', JacRed callback received for full card. Result:', jrResult);
                    var qualityCode = (jrResult && jrResult.quality) || null;
                    var fullTorrentTitle = (jrResult && jrResult.full_label) || null;
                    if (LQE_CONFIG.LOGGING_QUALITY) console.log(`LQE-QUALITY: JacRed returned - qualityCode: "${qualityCode}", full label: "${fullTorrentTitle}"`);
                    // Якщо якість знайдено
                    if (qualityCode && qualityCode !== 'NO') {
                        if (LQE_CONFIG.LOGGING_QUALITY) console.log('LQE-QUALITY', 'card: ' + cardId + ', JacRed found quality code: ' + qualityCode + ', full label: ' + fullTorrentTitle);
                        // Зберігаємо дані в кеш
                        saveQualityCache(cacheKey, {
                            quality_code: qualityCode,
                            full_label: fullTorrentTitle
                        }, cardId);
                        // Оновлюємо інтерфейс
                        updateFullCardQualityElement(qualityCode, fullTorrentTitle, cardId, renderElement);
                    } else {
                        // Якщо якість не знайдено, очищаємо елементи якості
                        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", 'card: ' + cardId + ', No quality found from JacRed or it was "NO". Clearing quality elements.');
                        clearFullCardQualityElements(cardId, renderElement);
                    }
                    // Прибираємо анімацію завантаження і показуємо контейнер
                    removeLoadingAnimation(cardId, renderElement);
                    rateLine.css('visibility', 'visible');
                });
            }
        } else {
            // Якщо якість для серіалів вимкнено в конфігурації
            if (LQE_CONFIG.LOGGING_QUALITY) console.log('LQE-QUALITY', 'card: ' + cardId + ', Quality feature disabled for TV series (as configured), skipping quality fetch.');
            // Очищаємо елементи якості, прибираємо анімацію і показуємо контейнер
            clearFullCardQualityElements(cardId, renderElement);
            removeLoadingAnimation(cardId, renderElement);
            rateLine.css('visibility', 'visible');
        }
        if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", Full card quality processing initiated.");
    }
    // КІНЕЦЬ: processFullCardQuality

    // ПОЧАТОК: Оновлення ярлика якості на картці у списку
    function updateCardListQualityElement(cardView, qualityCode, fullTorrentTitle, bypassTranslation = false) {
        // Визначаємо текст для відображення: якщо bypassTranslation=true, використовуємо fullTorrentTitle без змін, інакше - транслюємо
        var displayQuality = bypassTranslation ? fullTorrentTitle : translateQualityLabel(qualityCode, fullTorrentTitle);

        // Видаляємо всі існуючі елементи якості на цій картці
        var existingQualityElements = cardView.getElementsByClassName('card__quality');
        Array.from(existingQualityElements).forEach(el => el.parentNode.removeChild(el));

        // Створюємо новий елемент якості
        var qualityDiv = document.createElement('div');
        qualityDiv.className = 'card__quality';
        var innerElement = document.createElement('div');
        innerElement.textContent = displayQuality;
        qualityDiv.appendChild(innerElement);
        // Додаємо новий елемент якості до картки
        cardView.appendChild(qualityDiv);
    }
    // КІНЕЦЬ: updateCardListQualityElement

    // ПОЧАТОК: Основна логіка роботи зі списковими картками (серіали/фільми)
    function updateCardListQuality(cardElement) {
        if (LQE_CONFIG.LOGGING_CARDLIST) console.log("LQE-CARDLIST", "updateCardListQuality called for card.");
        // Перевіряємо, чи не оброблялася вже ця картка (атрибут data-lqe-quality-processed)
        if (cardElement.hasAttribute('data-lqe-quality-processed')) {
            if (LQE_CONFIG.LOGGING_CARDLIST) console.log("LQE-CARDLIST", "Card already processed, skipping:", cardElement.card_data ? cardElement.card_data.id : 'N/A');
            return;
        }
        // Знаходимо елемент, де потрібно відобразити якість
        var cardView = cardElement.querySelector('.card__view');
        // Отримуємо дані картки, збережені в об'єкті card_data
        var cardData = cardElement.card_data;
        if (!cardData || !cardView) {
            if (LQE_CONFIG.LOGGING_CARDLIST) console.log("LQE-CARDLIST", "cardData or cardView is null for card, skipping quality fetch.");
            return;
        }
        // Визначаємо тип картки (фільм чи серіал)
        var isTvSeries = (getCardType(cardData) === 'tv');
        // Якщо це серіал і якість для серіалів вимкнено, припиняємо обробку
        if (isTvSeries && LQE_CONFIG.SHOW_QUALITY_FOR_TV_SERIES === false) {
            if (LQE_CONFIG.LOGGING_CARDLIST) console.log("LQE-CARDLIST", "Skipping TV series for quality update (as configured). Card:", cardData.id);
            return;
        }
        // Нормалізуємо дані картки
        var normalizedCard = {
            id: cardData.id || '',
            title: cardData.title || cardData.name || '',
            original_title: cardData.original_title || cardData.original_name || '',
            type: getCardType(cardData),
            release_date: cardData.release_date || cardData.first_air_date || ''
        };
        var cardId = normalizedCard.id;
        // Формуємо ключ для кешу
        var cacheKey = LQE_CONFIG.CACHE_VERSION + '_' + normalizedCard.type + '_' + cardId;
        // Позначаємо картку як оброблену
        cardElement.setAttribute('data-lqe-quality-processed', 'true');

        // Перевіряємо наявність ручного перевизначення для цієї картки у списку
        var manualOverrideData = LQE_CONFIG.MANUAL_OVERRIDES[cardId];
        if (manualOverrideData) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Found manual override for card list:", manualOverrideData);
            // Оновлюємо інтерфейс, використовуючи дані з ручного перевизначення (bypassTranslation=true)
            updateCardListQualityElement(cardView, null, manualOverrideData.full_label, true);
            return;
        }

        // Перевіряємо кеш
        var cachedQualityData = getQualityCache(cacheKey);
        // Якщо дані є в кеші
        if (cachedQualityData) {
            if (LQE_CONFIG.LOGGING_CARDLIST) console.log('LQE-CARDLIST', 'card: ' + cardId + ', Quality data found in cache for card list:', cachedQualityData);
            // Оновлюємо інтерфейс даними з кешу
            updateCardListQualityElement(cardView, cachedQualityData.quality_code, cachedQualityData.full_label);

            // Якщо дані в кеші застаріли, робимо фонове оновлення
            if (Date.now() - cachedQualityData.timestamp > LQE_CONFIG.CACHE_REFRESH_THRESHOLD_MS) {
                if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Cache is old, scheduling background refresh.");
                getBestReleaseFromJacred(normalizedCard, cardId, function(jrResult) {
                    if (jrResult && jrResult.quality && jrResult.quality !== 'NO') {
                        // Оновлюємо кеш
                        saveQualityCache(cacheKey, {
                            quality_code: jrResult.quality,
                            full_label: jrResult.full_label
                        }, cardId);
                        // Якщо картка ще в DOM, оновлюємо інтерфейс
                        if (document.body.contains(cardElement)) {
                            updateCardListQualityElement(cardView, jrResult.quality, jrResult.full_label);
                            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Background cache and UI refresh completed for list card.");
                        }
                    }
                });
            }
            return;
        }

        // Якщо даних у кеші немає, робимо запит до JacRed API
        getBestReleaseFromJacred(normalizedCard, cardId, function(jrResult) {
            if (LQE_CONFIG.LOGGING_CARDLIST) console.log('LQE-CARDLIST', 'card: ' + cardId + ', JacRed callback received for card list. Result:', jrResult);
            // Перевіряємо, чи картка ще існує в DOM (користувач міг перейти далі)
            if (!document.body.contains(cardElement)) {
                if (LQE_CONFIG.LOGGING_CARDLIST) console.log('LQE-CARDLIST', 'Card removed from DOM during quality fetch:', cardId);
                return;
            }
            var qualityCode = (jrResult && jrResult.quality) || null;
            var fullTorrentTitle = (jrResult && jrResult.full_label) || null;
            if (LQE_CONFIG.LOGGING_CARDLIST) console.log(`LQE-CARDLIST: JacRed returned - qualityCode: "${qualityCode}", full label: "${fullTorrentTitle}"`);
            // Якщо якість знайдено
            if (qualityCode && qualityCode !== 'NO') {
                if (LQE_CONFIG.LOGGING_CARDLIST) console.log('LQE-CARDLIST', 'card: ' + cardId + ', JacRed found quality code: ' + qualityCode + ', full label: ' + fullTorrentTitle);
                // Зберігаємо дані в кеш
                saveQualityCache(cacheKey, {
                    quality_code: qualityCode,
                    full_label: fullTorrentTitle
                }, cardId);
                // Оновлюємо інтерфейс
                updateCardListQualityElement(cardView, qualityCode, fullTorrentTitle);
                if (LQE_CONFIG.LOGGING_CARDLIST) console.log('LQE-CARDLIST', 'card: ' + cardId + ', Added new quality element to card list.');
            } else {
                if (LQE_CONFIG.LOGGING_CARDLIST) console.log('LQE-CARDLIST', 'card: ' + cardId + ', No quality found from JacRed or it was "NO" for card list.');
            }
        });
    }
    // КІНЕЦЬ: updateCardListQuality

    // ПОЧАТОК: Спостерігач за DOM (MutationObserver) для нових карток
    var observer = new MutationObserver(function(mutations) {
        var newCards = [];
        // Перебираємо всі мутації (зміни в DOM)
        for (var m = 0; m < mutations.length; m++) {
            var mutation = mutations[m];
            // Перевіряємо додані вузли
            if (mutation.addedNodes) {
                for (var j = 0; j < mutation.addedNodes.length; j++) {
                    var node = mutation.addedNodes[j];
                    // Пропускаємо не-елементи (напр., текстові вузли)
                    if (node.nodeType !== 1) continue;
                    // Якщо доданий вузол має клас 'card', додаємо його в список
                    if (node.classList && node.classList.contains('card')) {
                        newCards.push(node);
                    }
                    // Шукаємо також елементи з класом 'card' всередині доданого вузла
                    var nestedCards = node.querySelectorAll('.card');
                    for (var k = 0; k < nestedCards.length; k++) {
                        newCards.push(nestedCards[k]);
                    }
                }
            }
        }
        // Якщо знайдені нові картки, обробляємо їх
        if (newCards.length) {
            if (LQE_CONFIG.LOGGING_CARDLIST) console.log("LQE-CARDLIST", "Observer detected new cards. Total new cards:", newCards.length);
            newCards.forEach(updateCardListQuality);
        }
    });
    // КІНЕЦЬ: observer

    // ПОЧАТОК: Ініціалізація плагіна Lampa Quality (старт логіки)
    function initializeLampaQualityPlugin() {
        if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "Lampa Quality Enhancer: Plugin Initialization Started!");
        // Позначаємо, що плагін вже ініціалізовано (щоб уникнути повторної ініціалізації)
        window.lampaQualityPlugin = true;
        // Запускаємо спостерігач за DOM: спостерігаємо за змінами в body (додавання вузлів) і всіма нащадками
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        if (LQE_CONFIG.LOGGING_GENERAL) console.log('LQE-LOG: Initial observer for card lists started.');
        // Підписуємося на події Lampac для повної картки
        Lampa.Listener.follow('full', function(event) {
            // Коли повна картка завантажена та відображена
            if (event.type == 'complite') {
                // Отримуємо елемент, де відображається картка
                var renderElement = event.object.activity.render();
                // Зберігаємо ID поточного фільму/серіалу
                currentGlobalMovieId = event.data.movie.id;
                if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "Full card event 'complite' for ID:", currentGlobalMovieId);
                // Запускаємо обробку якості для повної картки
                processFullCardQuality(event.data.movie, renderElement);
            }
        });
    }
    // КІНЕЦЬ: initializeLampaQualityPlugin

    // ПОЧАТОК: Запуск плагіна, якщо він ще не був запущений
    if (!window.lampaQualityPlugin) {
        initializeLampaQualityPlugin();
    }
    // КІНЕЦЬ: Умовний запуск
})();
// КІНЕЦЬ: Анонімна функція-обгортка

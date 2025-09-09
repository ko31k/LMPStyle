(function () {
    'use strict';

    // ==================== КОНФІГУРАЦІЯ ПЛАГІНА ====================
    var LQE_CONFIG = {
        CACHE_VERSION: 2,                    // Версія кешу (змінити при оновленні структури даних)
        LOGGING_GENERAL: false,              // Загальне логування (налагодження)
        LOGGING_QUALITY: true,               // Логування якості (налагодження)
        LOGGING_CARDLIST: false,             // Логування списків карток (налагодження)
        CACHE_VALID_TIME_MS: 3 * 24 * 60 * 60 * 1000, // Час життя кешу (3 дні)
        CACHE_REFRESH_THRESHOLD_MS: 12 * 60 * 60 * 1000, // Час для фонового оновлення (12 год)
        CACHE_KEY: 'lampa_quality_cache',    // Ключ зберігання кешу
        JACRED_PROTOCOL: 'http://',          // Протокол JacRed API
        JACRED_URL: 'jacred.xyz',            // URL JacRed API
        JACRED_API_KEY: '',                  // API-ключ JacRed (якщо потрібен)
        PROXY_LIST: [                        // Список проксі-серверів для обходу CORS
            'http://api.allorigins.win/raw?url=',
            'http://cors.bwa.workers.dev/'
        ],
        PROXY_TIMEOUT_MS: 5000,              // Таймаут запиту через проксі (5 сек)
        SHOW_QUALITY_FOR_TV_SERIES: true,    // Показувати якість для серіалів

        // Стилі для лейбла на повній картці
        FULL_CARD_LABEL_BORDER_COLOR: '#FFFFFF',
        FULL_CARD_LABEL_TEXT_COLOR: '#FFFFFF',
        FULL_CARD_LABEL_FONT_WEIGHT: 'normal',
        FULL_CARD_LABEL_FONT_SIZE: '1.22em',
        FULL_CARD_LABEL_FONT_STYLE: 'normal',

        // Стилі для лейбла на картках у списку
        LIST_CARD_LABEL_BORDER_COLOR: '#3DA18D',
        LIST_CARD_LABEL_BACKGROUND_COLOR: 'rgba(61, 161, 141, 0.8)',
        LIST_CARD_LABEL_BACKGROUND_TRANSPARENT: false,
        LIST_CARD_LABEL_TEXT_COLOR: '#FFFFFF',
        LIST_CARD_LABEL_FONT_WEIGHT: '600',
        LIST_CARD_LABEL_FONT_SIZE: '1.3em',
        LIST_CARD_LABEL_FONT_STYLE: 'normal',

        // Ручні перевизначення якості для конкретних ID
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

    var currentGlobalMovieId = null;

    // ==================== АДАПТИВНІ СЕЛЕКТОРИ ====================
    // Механізм для сумісності з Interface+ та іншими плагінами
    var LQE_DOM_SELECTORS = {
        fullCardRateLine: '.full-start-new__rate-line',
        listCardView: '.card__view',
        fallbacks: {
            fullCardRateLine: ['.full-start__rate-line', '.rate-line'],
            listCardView: ['.card-poster', '.card-container']
        }
    };

    var actualSelectors = {
        fullCardRateLine: LQE_DOM_SELECTORS.fullCardRateLine,
        listCardView: LQE_DOM_SELECTORS.listCardView
    };

    function findWorkingSelector(primarySelector, fallbackSelectors, parentElement) {
        var element = (parentElement || document).querySelector(primarySelector);
        if (element) return primarySelector;

        for (var i = 0; i < fallbackSelectors.length; i++) {
            element = (parentElement || document).querySelector(fallbackSelectors[i]);
            if (element) {
                if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG: Using fallback selector: " + fallbackSelectors[i]);
                return fallbackSelectors[i];
            }
        }
        return null;
    }

    function initSelectors() {
        setTimeout(function() {
            var newFullCardSelector = findWorkingSelector(
                LQE_DOM_SELECTORS.fullCardRateLine,
                LQE_DOM_SELECTORS.fallbacks.fullCardRateLine
            );
            var newListCardSelector = findWorkingSelector(
                LQE_DOM_SELECTORS.listCardView,
                LQE_DOM_SELECTORS.fallbacks.listCardView
            );

            if (newFullCardSelector) actualSelectors.fullCardRateLine = newFullCardSelector;
            if (newListCardSelector) actualSelectors.listCardView = newListCardSelector;

            if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG: Actual selectors initialized:", actualSelectors);
        }, 1000);
    }
    initSelectors();

    // ==================== ВІДПОВІДНІСТЬ ЯКОСТІ ====================
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
        "2160p": "4K", "4k": "4K", "4К": "4K",
        "1080p": "1080p", "1080": "1080p", "1080i": "1080p",
        "hdtv 1080i": "1080i FHDTV",
        "blu-ray remux (2160p)": "4K BDRemux",
        "hdtvrip 2160p": "4K HDTVRip",
        "hybrid 2160p": "4K Hybrid",
        "480p": "SD", "480": "SD",
        "web-dl": "WEB-DL", "webrip": "WEBRip",
        "web-dlrip (2160p)": "4K WEB-DLRip",
        "web-dlrip": "WEB-DLRip",
        "1080p web-dlrip": "1080p WEB-DLRip",
        "webdlrip": "WEB-DLRip",
        "hdtvrip-avc": "HDTVRip-AVC",
        "bluray": "BluRay", "bdrip": "BDRip", "bdremux": "BDRemux",
        "HDTVRip (1080p)": "1080p FHDTVRip",
        "hdrip": "HDRip",
        "hdtvrip (720p)": "720p HDTVRip",
        "dvdrip": "DVDRip", "hdtv": "HDTV",
        "dsrip": "DSRip", "satrip": "SATRip",
        "hdr10": "HDR", "dolby vision": "DV",
        "p8": "P8", "h.265": "H.265", "hevc": "HEVC",
        "h.264": "H.264", "av1": "AV1", "avc": "AVC",
        "ts": "TS", "camrip": "CAMRip", "sdr": "SDR",
        "10-bit": "10bit", "8-bit": "8bit",
        "profile 5": "P5", "profile 8.1": "P8.1",
        "p5": "P5", "p8.1": "P8.1",
        "profile 7": "P7", "p7": "P7",
        "telecine": "Telecine", "tc": "Telecine",
        "ts": "TeleSync"
    };

    var QUALITY_PRIORITY_ORDER = ['resolution', 'source'];

// ==================== CSS СТИЛІ ДЛЯ ЛЕЙБЛІВ ЯКОСТІ ====================
var styleLQE = "<style id=\"lampa_quality_styles\">" +
    
    // Стилі для основної лінії рейтингів (прихована до завантаження)
    ".full-start-new__rate-line { " +
    "   visibility: hidden !important; " +
    "   flex-wrap: wrap !important; " +
    "   gap: 0.4em 0 !important; " +
    "}" +
    
    // Стилі для всіх елементів у лінії рейтингів
    ".full-start-new__rate-line > * { " +
    "   margin-right: 0.5em !important; " +
    "   flex-shrink: 0 !important; " +
    "   flex-grow: 0 !important; " +
    "}" +
    
    // Стилі для лейбла якості на повній картці (детальний перегляд) - ЗМІНЕНО ПРЕФІКС
    ".lqe-quality-pp { " +
    "   min-width: 2.8em !important; " +
    "   text-align: center !important; " +
    "   text-transform: none !important; " +
    "   border: 0.8px solid " + LQE_CONFIG.FULL_CARD_LABEL_BORDER_COLOR + " !important; " +
    "   color: " + LQE_CONFIG.FULL_CARD_LABEL_TEXT_COLOR + " !important; " +
    "   font-weight: " + LQE_CONFIG.FULL_CARD_LABEL_FONT_WEIGHT + " !important; " +
    "   font-size: " + LQE_CONFIG.FULL_CARD_LABEL_FONT_SIZE + " !important; " +
    "   font-style: " + LQE_CONFIG.FULL_CARD_LABEL_FONT_STYLE + " !important; " +
    "   border-radius: 0.19em !important; " +
    "   padding: 0.25em 0.31em !important; " +
    "}" +
    
    // БАТЬКІВСЬКИЙ КОНТЕЙНЕР ДЛЯ КАРТКИ У СПИСКАХ - ОСНОВА ДЛЯ АБСОЛЮТНОГО ПОЗИЦІОНУВАННЯ
    ".card__view { " +
    "   position: relative !important; " +  // Необхідно для коректного позиціонування лейбла
    "}" +
    
    // ОСНОВНОЙ КОНТЕЙНЕР ЛЕЙБЛА ЯКОСТІ ДЛЯ КАРТОК У СПИСКАХ - ЗМІНЕНО ПРЕФІКС
    ".lqe-card-quality { " +
    "   position: absolute !important; " +          // Абсолютне позиціонування відносно .card__view
    "   bottom: 0.55em !important; " +              // Відстань 0.55em від нижнього краю картки
    "   left: 0 !important; " +                     // Притискаємо до лівого краю картки
    "   background-color: " + (LQE_CONFIG.LIST_CARD_LABEL_BACKGROUND_TRANSPARENT ? 
                              "transparent" : LQE_CONFIG.LIST_CARD_LABEL_BACKGROUND_COLOR) + " !important; " + // Колір фону з налаштувань
    "   z-index: 10 !important; " +                 // Гарантуємо, що лейбл буде поверх інших елементів
    "   width: fit-content !important; " +          // Ширина автоматично підлаштовується під вміст
    "   max-width: calc(100% - 1em) !important; " + // Максимальна ширина (не більше ніж картка мінус 1em)
    "   border-radius: 0 0.8em 0.8em 0 !important; " + // Скруглення тільки правих кутів (ліві залишаються прямими)
    "   overflow: hidden !important; " +            // Запобігає виходу вмісту за межі скруглених кутів
    "}" +
    
    // ВНУТРІШНІЙ ЕЛЕМЕНТ ЛЕЙБЛА - ВІДПОВІДАЄ ЗА ВІДОБРАЖЕННЯ ТЕКСТУ - ЗМІНЕНО ПРЕФІКС
    ".lqe-card-quality div { " +
    "   text-transform: uppercase !important; " +       // Всі літери великі (напр: "4K", "FHD")
    "   font-family: 'Roboto Condensed', 'Arial Narrow', Arial, sans-serif !important; " + // Конденсований шрифт для компактності
    "   font-weight: 700 !important; " +                // Жирний шрифт для кращої видимості
    "   letter-spacing: 0.5px !important; " +           // Невеликий міжлітерний інтервал для компактності
    "   font-size: 0.75em !important; " +               // Компактний розмір шрифту (75% від базового)
    "   color: " + LQE_CONFIG.LIST_CARD_LABEL_TEXT_COLOR + " !important; " + // Колір тексту з налаштувань
    "   padding: 0.1em 0.5em 0.08em 0.4em !important; " + // Внутрішні відступи: верх 0.1em, право 0.5em, низ 0.08em, ліво 0.4em
    "   white-space: nowrap !important; " +             // Забороняє перенесення тексту на кілька рядків
    "   text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.3) !important; " + // Легка тінь тексту для покращення читабельності на різних фонах
    "}" +
    
"</style>";
    
    Lampa.Template.add('lampa_quality_css', styleLQE);
    $('body').append(Lampa.Template.get('lampa_quality_css', {}, true));

    var loadingStylesLQE = "<style id=\"lampa_quality_loading_animation\">" +
        ".lqe-loading-dots-container { position: absolute; top: 50%; left: 0; right: 0; " +
        "text-align: left; transform: translateY(-50%); z-index: 10; }" +
        ".full-start-new__rate-line { position: relative; }" +
        ".lqe-loading-dots { display: inline-flex; align-items: center; gap: 0.4em; " +
        "color: #ffffff; font-size: 0.7em; background: rgba(0, 0, 0, 0.3); " +
        "padding: 0.6em 1em; border-radius: 0.5em; }" +
        ".lqe-loading-dots__text { margin-right: 1em; }" +
        ".lqe-loading-dots__dot { width: 0.5em; height: 0.5em; border-radius: 50%; " +
        "background-color: currentColor; opacity: 0.3; " +
        "animation: lqe-loading-dots-fade 1.5s infinite both; }" +
        ".lqe-loading-dots__dot:nth-child(1) { animation-delay: 0s; }" +
        ".lqe-loading-dots__dot:nth-child(2) { animation-delay: 0.5s; }" +
        ".lqe-loading-dots__dot:nth-child(3) { animation-delay: 1s; }" +
        "@keyframes lqe-loading-dots-fade { " +
        "0%, 90%, 100% { opacity: 0.3; } 35% { opacity: 1; } }" +
        "@media screen and (max-width: 480px) { " +
        ".lqe-loading-dots-container { justify-content: center; text-align: center; max-width: 100%; } }" +
        "</style>";

    Lampa.Template.add('lampa_quality_loading_animation_css', loadingStylesLQE);
    $('body').append(Lampa.Template.get('lampa_quality_loading_animation_css', {}, true));

    // ==================== ОСНОВНІ ФУНКЦІЇ ====================
    function fetchWithProxy(url, cardId, callback) {
        var currentProxyIndex = 0;
        var callbackCalled = false;

        function tryNextProxy() {
            if (currentProxyIndex >= LQE_CONFIG.PROXY_LIST.length) {
                if (!callbackCalled) {
                    callbackCalled = true;
                    callback(new Error('All proxies failed for ' + url));
                }
                return;
            }
            var proxyUrl = LQE_CONFIG.PROXY_LIST[currentProxyIndex] + encodeURIComponent(url);
            if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", Fetch with proxy: " + proxyUrl);
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

    function addLoadingAnimation(cardId, renderElement) {
        if (!renderElement) return;
        if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", Add loading animation");
        var rateLine = $(actualSelectors.fullCardRateLine, renderElement);
        if (!rateLine.length || $('.lqe-loading-dots-container', rateLine).length) return;
        rateLine.append(
            '<div class="lqe-loading-dots-container">' +
            '<div class="lqe-loading-dots">' +
            '<span class="lqe-loading-dots__text">Загрузка...</span>' +
            '<span class="lqe-loading-dots__dot"></span>' +
            '<span class="lqe-loading-dots__dot"></span>' +
            '<span class="lqe-loading-dots__dot"></span>' +
            '</div>' +
            '</div>'
        );
        $('.lqe-loading-dots-container', rateLine).css({'opacity': '1', 'visibility': 'visible'});
    }

    function removeLoadingAnimation(cardId, renderElement) {
        if (!renderElement) return;
        if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", Remove loading animation");
        $('.lqe-loading-dots-container', renderElement).remove();
    }

    function getCardType(cardData) {
        var type = cardData.media_type || cardData.type;
        if (type === 'movie' || type === 'tv') return type;
        return cardData.name || cardData.original_name ? 'tv' : 'movie';
    }

    function translateQualityLabel(qualityCode, fullTorrentTitle) {
        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "translateQualityLabel: Received qualityCode:", qualityCode, "fullTorrentTitle:", fullTorrentTitle);
        let finalDisplayLabel = '';
        const lowerFullTorrentTitle = (fullTorrentTitle || '').toLowerCase();
        let bestDirectMatchKey = '';
        let maxDirectMatchLength = 0;
        const simpleComponentKeywords = [
            '2160p', '4k', '4к', '1080P', '1080', '720p', '480p',
            'web-dl', 'webrip', 'bluray', 'bdrip', 'bdremux',
            'hdrip', 'dvdrip', 'hdtv', 'dsrip', 'satrip', 'web',
            'hdr10', 'dolby vision', 'dv', 'p8', 'h.265', 'hevc',
            'h.264', 'avc', 'av1', 'ts', 'camrip', 'sdr', '10-bit',
            '8-bit', 'profile 5', 'profile 8.1', 'p5', 'p8.1',
            'profile 7', 'p7', 'telecine'
        ].map(k => k.toLowerCase());
        for (const key in QUALITY_DISPLAY_MAP) {
            if (QUALITY_DISPLAY_MAP.hasOwnProperty(key)) {
                const lowerKey = String(key).toLowerCase();
                if (lowerFullTorrentTitle.includes(lowerKey) && lowerKey.length > 5 && !simpleComponentKeywords.includes(lowerKey)) {
                    if (lowerKey.length > maxDirectMatchLength) {
                        maxDirectMatchLength = lowerKey.length;
                        bestDirectMatchKey = key;
                    }
                }
            }
        }
        if (bestDirectMatchKey) {
            finalDisplayLabel = QUALITY_DISPLAY_MAP[bestDirectMatchKey];
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", `translateQualityLabel: Explicit direct match found for key "${bestDirectMatchKey}". Displaying "${finalDisplayLabel}".`);
            return finalDisplayLabel;
        }
        let extracted = {resolution: '', source: '', hdr: '', codec: '', bit_depth: '', profile: ''};
        const resolutionMatch = lowerFullTorrentTitle.match(/(\d{3,4}p)|(4k)|(4\s*к)/);
        if (resolutionMatch) {
            let matchedRes = resolutionMatch[1] || resolutionMatch[2] || resolutionMatch[3];
            if (matchedRes) {
                matchedRes = matchedRes.replace(/\s*/g, '').toLowerCase();
                extracted.resolution = QUALITY_DISPLAY_MAP[matchedRes] || (matchedRes.includes('p') ? matchedRes.toUpperCase() : (matchedRes === '4k' || matchedRes === '4к' ? '4K' : ''));
            }
            if (LQE_CONFIG.LOGGING_QUALITY) console.log(`LQE-QUALITY: Extracted resolution raw: "${resolutionMatch[0]}", mapped: "${extracted.resolution}"`);
        }
        const sourceRegex = /(web-dl|webrip|bluray|bdrip|hdrip|dvdrip|hdtv|dsrip|satrip|web|bdremux|telecine|ts|camrip)\b/g;
        let sourceMatch;
        let tempSource = '';
        while ((sourceMatch = sourceRegex.exec(lowerFullTorrentTitle)) !== null) {
            if (sourceMatch[1].length > tempSource.length) {
                tempSource = sourceMatch[1];
            }
        }
        if (tempSource) {
            extracted.source = QUALITY_DISPLAY_MAP[tempSource] || tempSource.toUpperCase();
            if (LQE_CONFIG.LOGGING_QUALITY) console.log(`LQE-QUALITY: Extracted source raw: "${tempSource}", mapped: "${extracted.source}"`);
        }
        const hdrMatch = lowerFullTorrentTitle.match(/(hdr10\+?|dolby\s*vision|dv|sdr)\b/);
        if (hdrMatch) {
            let hdrKey = hdrMatch[1].replace(/\s*/g, '').toLowerCase();
            extracted.hdr = QUALITY_DISPLAY_MAP[hdrKey] || hdrKey.toUpperCase();
            if (LQE_CONFIG.LOGGING_QUALITY) console.log(`LQE-QUALITY: Extracted HDR raw: "${hdrMatch[1]}", mapped: "${extracted.hdr}"`);
        }
        const codecMatch = lowerFullTorrentTitle.match(/(h\.265|hevc|h\.264|avc|av1)\b/);
        if (codecMatch) {
            extracted.codec = QUALITY_DISPLAY_MAP[codecMatch[1].toLowerCase()] || codecMatch[1].toUpperCase().replace(/\./g, '');
            if (LQE_CONFIG.LOGGING_QUALITY) console.log(`LQE-QUALITY: Extracted codec raw: "${codecMatch[1]}", mapped: "${extracted.codec}"`);
        }
        const bitDepthMatch = lowerFullTorrentTitle.match(/(10-?bit|8-?bit)\b/);
        if (bitDepthMatch) {
            let bitKey = bitDepthMatch[1].toLowerCase();
            extracted.bit_depth = QUALITY_DISPLAY_MAP[bitKey] || bitKey.replace(/-/g, '');
            if (LQE_CONFIG.LOGGING_QUALITY) console.log(`LQE-QUALITY: Extracted bit_depth raw: "${bitDepthMatch[1]}", mapped: "${extracted.bit_depth}"`);
        }
        const profileMatch = lowerFullTorrentTitle.match(/(profile\s*(5|8\.1|7)|p5|p8\.1|p7)\b/);
        if (profileMatch) {
            let profileKey = profileMatch[1].replace(/\s*/g, '').toLowerCase();
            if (profileKey.includes('profile')) {
                profileKey = 'p' + (profileMatch[2] || profileMatch[3]).replace('.', '');
            }
            extracted.profile = QUALITY_DISPLAY_MAP[profileKey] || profileKey.toUpperCase();
            if (LQE_CONFIG.LOGGING_QUALITY) console.log(`LQE-QUALITY: Extracted profile raw: "${profileMatch[1]}", mapped: "${extracted.profile}"`);
        }
        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY: Extracted components for assembly:", JSON.stringify(extracted));
        let assembledParts = [];
        QUALITY_PRIORITY_ORDER.forEach(componentType => {
            if (extracted[componentType]) {
                assembledParts.push(extracted[componentType]);
            }
        });
        finalDisplayLabel = assembledParts.join(' ').trim();
        if (finalDisplayLabel === '' && qualityCode) {
            const lowerQualityCode = String(qualityCode).toLowerCase();
            finalDisplayLabel = QUALITY_DISPLAY_MAP[lowerQualityCode] || qualityCode;
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", `translateQualityLabel: No detailed assembled match. Using qualityCode fallback: "${finalDisplayLabel}"`);
        }
        if (finalDisplayLabel === '') {
            finalDisplayLabel = qualityCode || '';
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", `translateQualityLabel: No quality found, using raw qualityCode: "${finalDisplayLabel}"`);
        }
        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", `translateQualityLabel: Final display label: "${finalDisplayLabel}"`);
        return finalDisplayLabel;
    }

    function getBestReleaseFromJacred(normalizedCard, cardId, callback) {
        if (!LQE_CONFIG.JACRED_URL) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", JacRed: JACRED_URL is not set.");
            callback(null);
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
            return;
        }

        function searchJacredApi(searchTitle, searchYear, exactMatch, strategyName, apiCallback) {
            var userId = Lampa.Storage.get('lampac_unic_id', '');
            var apiUrl = LQE_CONFIG.JACRED_PROTOCOL + LQE_CONFIG.JACRED_URL + '/api/v1.0/torrents?search=' +
                encodeURIComponent(searchTitle) + '&year=' + searchYear + (exactMatch ? '&exact=true' : '') + '&uid=' + userId;
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", JacRed: " + strategyName + " URL: " + apiUrl);
            var controller = new AbortController();
            var signal = controller.signal;
            var timeoutId = setTimeout(() => {
                controller.abort();
                if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", `card: ${cardId}, JacRed: ${strategyName} request timed out.`);
                apiCallback(null);
            }, LQE_CONFIG.PROXY_TIMEOUT_MS * LQE_CONFIG.PROXY_LIST.length + 1000);
            fetchWithProxy(apiUrl, cardId, function(error, responseText) {
                clearTimeout(timeoutId);
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
                    var torrents = JSON.parse(responseText);
                    if (!Array.isArray(torrents) || torrents.length === 0) {
                        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", JacRed: " + strategyName + " received no torrents or invalid array.");
                        apiCallback(null);
                        return;
                    }
                    var bestNumericQuality = -1;
                    var bestFoundTorrent = null;
                    var searchYearNum = parseInt(searchYear, 10);

                    function extractNumericQualityFromTitle(title) {
                        if (!title) return 0;
                        var lower = title.toLowerCase();
                        if (/2160p|4k/.test(lower)) return 2160;
                        if (/1080P/.test(lower)) return 1080;
                        if (/720p/.test(lower)) return 720;
                        if (/480p/.test(lower)) return 480;
                        if (/ts|telesync/.test(lower)) return 1;
                        if (/camrip|камрип/.test(lower)) return 2;
                        return 0;
                    }

                    function extractYearFromTitle(title) {
                        if (!title) return 0;
                        var regex = /(?:^|[^0-9])(19[0-9]{2}|20[0-2][0-9])(?:[^0-9]|$)/g;
                        var match = regex.exec(title);
                        if (match && match[1]) {
                            return parseInt(match[1], 10);
                        }
                        return 0;
                    }

                    for (var i = 0; i < torrents.length; i++) {
                        var torrent = torrents[i];
                        if (!torrent || !torrent.title) continue;
                        var torrentYear = extractYearFromTitle(torrent.title);
                        if (Math.abs(torrentYear - searchYearNum) > 1) {
                            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", JacRed: Skipping torrent due to year mismatch (torrent: " + torrentYear + ", search: " + searchYearNum + "): " + torrent.title);
                            continue;
                        }
                        var qualityNum = extractNumericQualityFromTitle(torrent.title);
                        if (qualityNum > bestNumericQuality) {
                            bestNumericQuality = qualityNum;
                            bestFoundTorrent = torrent;
                        }
                    }
                    if (bestFoundTorrent) {
                        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", JacRed: " + strategyName + " found best torrent: " + bestFoundTorrent.title + " (quality: " + bestNumericQuality + ")");
                        apiCallback({
                            quality_code: bestNumericQuality,
                            full_torrent_title: bestFoundTorrent.title
                        });
                    } else {
                        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", JacRed: " + strategyName + " found torrents but none matched year or had quality.");
                        apiCallback(null);
                    }
                } catch (parseError) {
                    console.error("LQE-LOG", "card: " + cardId + ", JacRed: " + strategyName + " JSON parse error:", parseError, "Response:", responseText);
                    apiCallback(null);
                }
            });
        }

        var strategies = [
            { name: 'Exact title + year', searchTitle: normalizedCard.title, year: year, exactMatch: true },
            { name: 'Original title + year', searchTitle: normalizedCard.original_title || normalizedCard.title, year: year, exactMatch: true },
            { name: 'Exact title only', searchTitle: normalizedCard.title, year: year, exactMatch: false },
            { name: 'Original title only', searchTitle: normalizedCard.original_title || normalizedCard.title, year: year, exactMatch: false }
        ];
        var currentStrategyIndex = 0;

        function tryNextStrategy() {
            if (currentStrategyIndex >= strategies.length) {
                if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", JacRed: All strategies exhausted.");
                callback(null);
                return;
            }
            var strategy = strategies[currentStrategyIndex];
            searchJacredApi(strategy.searchTitle, strategy.year, strategy.exactMatch, strategy.name, function(result) {
                if (result) {
                    callback(result);
                } else {
                    currentStrategyIndex++;
                    tryNextStrategy();
                }
            });
        }
        tryNextStrategy();
    }

    function getBestReleaseFromCache(cardId, cardType, normalizedCard, callback) {
        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Cache: Checking cache for quality.");
        var cache = Lampa.Storage.get(LQE_CONFIG.CACHE_KEY);
        if (!cache || !cache.data || !cache.version || cache.version !== LQE_CONFIG.CACHE_VERSION) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Cache: No cache or version mismatch.");
            callback(null);
            return;
        }
        var cacheKey = cardId + '_' + cardType;
        var cachedItem = cache.data[cacheKey];
        if (!cachedItem) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Cache: No entry for key " + cacheKey);
            callback(null);
            return;
        }
        var now = Date.now();
        if (now - cachedItem.timestamp > LQE_CONFIG.CACHE_VALID_TIME_MS) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Cache: Entry expired for " + cacheKey);
            delete cache.data[cacheKey];
            Lampa.Storage.set(LQE_CONFIG.CACHE_KEY, cache);
            callback(null);
            return;
        }
        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Cache: Using cached quality: " + cachedItem.quality_code);
        callback(cachedItem);
    }

    function updateCache(cardId, cardType, qualityData) {
        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Cache: Updating cache for " + cardId + '_' + cardType);
        var cache = Lampa.Storage.get(LQE_CONFIG.CACHE_KEY) || { version: LQE_CONFIG.CACHE_VERSION, data: {} };
        if (!cache.version || cache.version !== LQE_CONFIG.CACHE_VERSION) {
            cache = { version: LQE_CONFIG.CACHE_VERSION, data: {} };
        }
        cache.data[cardId + '_' + cardType] = {
            quality_code: qualityData.quality_code,
            full_torrent_title: qualityData.full_torrent_title,
            timestamp: Date.now()
        };
        Lampa.Storage.set(LQE_CONFIG.CACHE_KEY, cache);
    }

    function getQualityData(cardId, cardType, normalizedCard, callback) {
        if (LQE_CONFIG.MANUAL_OVERRIDES[cardId]) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Using manual override.");
            callback(LQE_CONFIG.MANUAL_OVERRIDES[cardId]);
            return;
        }
        getBestReleaseFromCache(cardId, cardType, normalizedCard, function(cachedData) {
            if (cachedData) {
                callback(cachedData);
                var now = Date.now();
                if (cachedData.timestamp && (now - cachedData.timestamp > LQE_CONFIG.CACHE_REFRESH_THRESHOLD_MS)) {
                    if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Cache: Entry old, refreshing in background.");
                    getBestReleaseFromJacred(normalizedCard, cardId, function(jacredData) {
                        if (jacredData) {
                            updateCache(cardId, cardType, jacredData);
                        }
                    });
                }
            } else {
                getBestReleaseFromJacred(normalizedCard, cardId, function(jacredData) {
                    if (jacredData) {
                        updateCache(cardId, cardType, jacredData);
                        callback(jacredData);
                    } else {
                        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", No quality data found from any source.");
                        callback(null);
                    }
                });
            }
        });
    }

    function normalizeCardData(cardData) {
        var normalized = {
            id: cardData.id,
            title: cardData.title || cardData.name || '',
            original_title: cardData.original_title || cardData.original_name || '',
            release_date: cardData.release_date || cardData.first_air_date || '',
            media_type: cardData.media_type || cardData.type
        };
        return normalized;
    }

    function renderQualityLabelInFullCard(cardId, qualityData, renderElement) {
        if (!renderElement) return;
        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Rendering quality label in full card.");
        var rateLine = $(actualSelectors.fullCardRateLine, renderElement);
        if (!rateLine.length) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Full card rate line not found.");
            return;
        }
        var qualityDisplayLabel = translateQualityLabel(qualityData.quality_code, qualityData.full_torrent_title);
        var qualityLabelHtml = '<div class="lqe-quality-pp" style="opacity: 1; visibility: visible;">' + qualityDisplayLabel + '</div>';
        rateLine.append(qualityLabelHtml);
        rateLine.css('visibility', 'visible');
        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Quality label rendered: " + qualityDisplayLabel);
    }

    function renderQualityLabelInListCard(cardId, qualityData, renderElement) {
        if (!renderElement) return;
        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Rendering quality label in list card.");
        var cardView = $(actualSelectors.listCardView, renderElement);
        if (!cardView.length) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", List card view not found.");
            return;
        }
        var qualityDisplayLabel = translateQualityLabel(qualityData.quality_code, qualityData.full_torrent_title);
        var qualityLabelHtml = '<div class="lqe-card-quality" style="opacity: 1; visibility: visible;"><div>' + qualityDisplayLabel + '</div></div>';
        cardView.append(qualityLabelHtml);
        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Quality label rendered: " + qualityDisplayLabel);
    }

    function processCard(cardData, renderElement, isFullCard) {
        if (!cardData || !cardData.id) return;
        var cardId = cardData.id;
        var cardType = getCardType(cardData);
        if (cardType === 'tv' && !LQE_CONFIG.SHOW_QUALITY_FOR_TV_SERIES) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Skipping TV series.");
            return;
        }
        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Processing started. Type: " + cardType + ", isFullCard: " + isFullCard);
        var normalizedCard = normalizeCardData(cardData);
        if (isFullCard) {
            addLoadingAnimation(cardId, renderElement);
        }
        getQualityData(cardId, cardType, normalizedCard, function(qualityData) {
            if (!qualityData) {
                if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", No quality data available.");
                if (isFullCard) {
                    removeLoadingAnimation(cardId, renderElement);
                    $(actualSelectors.fullCardRateLine, renderElement).css('visibility', 'visible');
                }
                return;
            }
            if (isFullCard) {
                removeLoadingAnimation(cardId, renderElement);
                renderQualityLabelInFullCard(cardId, qualityData, renderElement);
            } else {
                renderQualityLabelInListCard(cardId, qualityData, renderElement);
            }
        });
    }

    // ==================== ПІДПИСКА НА ПОДІЇ ====================
    Lampa.Listener.follow('full', function(e) {
        if (e.type === 'full' && e.data && e.data.card_data) {
            currentGlobalMovieId = e.data.card_data.id;
            if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG: Full card opened, ID:", currentGlobalMovieId);
            setTimeout(function() {
                processCard(e.data.card_data, e.render, true);
            }, 100);
        }
    });

    Lampa.Listener.follow('card', function(e) {
        if (e.type === 'card' && e.data && e.data.card_data) {
            setTimeout(function() {
                processCard(e.data.card_data, e.render, false);
            }, 100);
        }
    });

    // ==================== ІНІЦІАЛІЗАЦІЯ ПЛАГІНА ====================
    if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG: Plugin initialized.");
})();

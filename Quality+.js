(function() {    // Початок анонімної функції-обгортки (щоб не засмічувати глобальну область)
    'use strict';    // Увімкнення суворого режиму JS (менше помилок)

// ПОЧАТОК: Конфігурація плагіна (налаштування кешу, логів, стилів, проксі)
    var LQE_CONFIG = {    // Основний об'єкт з усіма налаштуваннями плагіна
        CACHE_VERSION: 2,    // Версія кешу (щоб скидати старий кеш при оновленнях)
        LOGGING_GENERAL: false,
        LOGGING_QUALITY: true,
        LOGGING_CARDLIST: false,
        CACHE_VALID_TIME_MS: 3 * 24 * 60 * 60 * 1000, // 1 день    // Час життя кешу (тут: 3 дні)
        CACHE_REFRESH_THRESHOLD_MS: 12 * 60 * 60 * 1000, // 12 часов для фонового обновления    // Коли кеш старий (12 год), робимо фонове оновлення
        CACHE_KEY: 'lampa_quality_cache',
        JACRED_PROTOCOL: 'http://',
        JACRED_URL: 'jacred.xyz',
        JACRED_API_KEY: '',
        PROXY_LIST: [    // Список проксі-серверів для обходу CORS блокувань
            'http://api.allorigins.win/raw?url=',
            'http://cors.bwa.workers.dev/'
        ],
        PROXY_TIMEOUT_MS: 5000,
        SHOW_QUALITY_FOR_TV_SERIES: true,
        
        // --- СТИЛІ ДЛЯ ЛЕЙБЛА НА ПОВНІЙ КАРТЦІ ФІЛЬМУ ---
        FULL_CARD_LABEL_BORDER_COLOR: '#FFFFFF', // <-- Колір рамки лейбла (білий)
        FULL_CARD_LABEL_TEXT_COLOR: '#FFFFFF', // <-- Колір тексту всередині (білий)
        FULL_CARD_LABEL_FONT_WEIGHT: 'normal',
        FULL_CARD_LABEL_FONT_SIZE: '1.22em',
        FULL_CARD_LABEL_FONT_STYLE: 'normal',

        // --- СТИЛІ ДЛЯ ЛЕЙБЛА НА КАРТКАХ У СПИСКУ ---
        LIST_CARD_LABEL_BORDER_COLOR: '#3DA18D', // <-- Колір рамки (м'ятний)
        LIST_CARD_LABEL_BACKGROUND_COLOR: 'rgba(61, 161, 141, 0.8)', // <-- Колір фону лейбла (м'ятний)
        LIST_CARD_LABEL_BACKGROUND_TRANSPARENT: false,
        LIST_CARD_LABEL_TEXT_COLOR: '#FFFFFF', // <-- Колір тексту всередині (білий)
        LIST_CARD_LABEL_FONT_WEIGHT: '600',
        LIST_CARD_LABEL_FONT_SIZE: '2.5em',
        LIST_CARD_LABEL_FONT_STYLE: 'normal',

        MANUAL_OVERRIDES: {    // Ручні перевизначення якості для окремих ID фільмів/серіалів
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

// ПОЧАТОК: Які параметри якості важливіші при складанні позначки
    var QUALITY_PRIORITY_ORDER = [
        'resolution',
        'source',
    ];

// КІНЕЦЬ: Порядок пріоритетів

// ПОЧАТОК: CSS стилі для відображення якості на картках та у повному описі
var styleLQE = "<style id=\"lampa_quality_styles\">" +
    ".full-start-new__rate-line {" +
    "visibility: hidden;" +
    "flex-wrap: wrap;" +
    "gap: 0.4em 0;" +
    "}" +
    ".full-start-new__rate-line > * {" +
    "margin-right: 0.5em;" +
    "flex-shrink: 0;" +
    "flex-grow: 0;" +
    "}" +
    ".lqe-quality {" +
    " min-width: 2.8em;" +
    " text-align: center;" +
    " text-transform: none; " +
    // --- ЗМІНА: Додано !important до рамки, щоб гарантувати застосування кольору ---
    " border: 0.8px solid " + LQE_CONFIG.FULL_CARD_LABEL_BORDER_COLOR + " !important;" +
    " color: " + LQE_CONFIG.FULL_CARD_LABEL_TEXT_COLOR + " !important;" +
    " font-weight: " + LQE_CONFIG.FULL_CARD_LABEL_FONT_WEIGHT + " !important;" +
    " font-size: " + LQE_CONFIG.FULL_CARD_LABEL_FONT_SIZE + " !important;" +
    " font-style: " + LQE_CONFIG.FULL_CARD_LABEL_FONT_STYLE + " !important;" +
    " border-radius: 0.19em; " +
    " padding: 0.25em 0.31em; " +
    "}" +
    ".card__view {" +
    " position: relative; " +
    "}" +
    ".card__quality {" +
    " position: absolute; " +
    " bottom: 0.50em; " +
    " left: 0; " +
    " background-color: " + (LQE_CONFIG.LIST_CARD_LABEL_BACKGROUND_TRANSPARENT ? "transparent" : LQE_CONFIG.LIST_CARD_LABEL_BACKGROUND_COLOR) + " !important;" +
    " z-index: 10;" +
    " width: fit-content; " +
    " max-width: calc(100% - 1em); " +
    " border-radius: 0 0.8em 0.8em 0; " +
    " overflow: hidden;" +
    "}" +
    ".card__quality div {" +
    " text-transform: uppercase; " +
    " font-family: 'Roboto Condensed', 'Arial Narrow', Arial, sans-serif; " +
    " font-weight: 700; " +
    " letter-spacing: 0.5px; " +
    " font-size: 1.30em; " +
    // --- ЗМІНА: Додано !important до кольору тексту, щоб гарантувати застосування ---
    " color: " + LQE_CONFIG.LIST_CARD_LABEL_TEXT_COLOR + " !important;" +
    " padding: 0.1em 0.2em 0.08em 0.2em; " +
    " white-space: nowrap;" +
    " text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.3); " +
    "}" +
    "</style>";

    Lampa.Template.add('lampa_quality_css', styleLQE);
    $('body').append(Lampa.Template.get('lampa_quality_css', {}, true));

// КІНЕЦЬ: CSS стилі для ярликів якості

// ПОЧАТОК: CSS стилі для анімації завантаження (три точки)
    var loadingStylesLQE = "<style id=\"lampa_quality_loading_animation\">" +
        ".loading-dots-container {" +
        "    position: absolute;" +
        "    top: 50%;" +
        "    left: 0;" +
        "    right: 0;" +
        "    text-align: left;" +
        "    transform: translateY(-50%);" +
        "    z-index: 10;" +
        "}" +
        ".full-start-new__rate-line {" +
        "    position: relative;" +
        "}" +
        ".loading-dots {" +
        "    display: inline-flex;" +
        "    align-items: center;" +
        "    gap: 0.4em;" +
        "    color: #ffffff;" +
        "    font-size: 0.7em;" +
        "    background: rgba(0, 0, 0, 0.3);" +
        "    padding: 0.6em 1em;" +
        "    border-radius: 0.5em;" +
        "}" +
        ".loading-dots__text {" +
        "    margin-right: 1em;" +
        "}" +
        ".loading-dots__dot {" +
        "    width: 0.5em;" +
        "    height: 0.5em;" +
        "    border-radius: 50%;" +
        "    background-color: currentColor;" +
        "    opacity: 0.3;" +
        "    animation: loading-dots-fade 1.5s infinite both;" +
        "}" +
        ".loading-dots__dot:nth-child(1) {" +
        "    animation-delay: 0s;" +
        "}" +
        ".loading-dots__dot:nth-child(2) {" +
        "    animation-delay: 0.5s;" +
        "}" +
        ".loading-dots__dot:nth-child(3) {" +
        "    animation-delay: 1s;" +
        "}" +
        "@keyframes loading-dots-fade {" +
        "    0%, 90%, 100% { opacity: 0.3; }" +
        "    35% { opacity: 1; }" +
        "}" +
        "@media screen and (max-width: 480px) { .loading-dots-container { -webkit-justify-content: center; justify-content: center; text-align: center; max-width: 100%; }}" +
        "</style>";

    Lampa.Template.add('lampa_quality_loading_animation_css', loadingStylesLQE);
    $('body').append(Lampa.Template.get('lampa_quality_loading_animation_css', {}, true));

// КІНЕЦЬ: CSS стилі для анімації завантаження

// ПОЧАТОК: Завантаження даних з JacRed через список проксі
    function fetchWithProxy(url, cardId, callback) {
        var currentProxyIndex = 0;
        var callbackCalled = false;

        function tryNextProxy() {
            if (currentProxyIndex >= LQE_CONFIG.PROXY_LIST.length) {    // Список проксі-серверів для обходу CORS блокувань
                if (!callbackCalled) {
                    callbackCalled = true;
                    callback(new Error('All proxies failed for ' + url));
                }
                return;
            }
            var proxyUrl = LQE_CONFIG.PROXY_LIST[currentProxyIndex] + encodeURIComponent(url);    // Список проксі-серверів для обходу CORS блокувань
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

// КІНЕЦЬ: fetchWithProxy

// ПОЧАТОК: Додати анімацію 'Завантаження...' на картку
    function addLoadingAnimation(cardId, renderElement) {
        if (!renderElement) return;
        if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", Add loading animation");
        var rateLine = $('.full-start-new__rate-line', renderElement);
        if (!rateLine.length || $('.loading-dots-container', rateLine).length) return;
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
        $('.loading-dots-container', rateLine).css({
            'opacity': '1',
            'visibility': 'visible'
        });
    }

// КІНЕЦЬ: addLoadingAnimation

// ПОЧАТОК: Прибрати анімацію 'Завантаження...' з картки
    function removeLoadingAnimation(cardId, renderElement) {
        if (!renderElement) return;
        if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", Remove loading animation");
        $('.loading-dots-container', renderElement).remove();
    }

// КІНЕЦЬ: removeLoadingAnimation

// ПОЧАТОК: Визначення типу картки (фільм чи серіал)
    function getCardType(cardData) {
        var type = cardData.media_type || cardData.type;
        if (type === 'movie' || type === 'tv') return type;
        return cardData.name || cardData.original_name ? 'tv' : 'movie';
    }

// КІНЕЦЬ: getCardType

// ПОЧАТОК: Перетворення сирого ярлика якості у гарний вигляд
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
        let extracted = {
            resolution: '',
            source: '',
            hdr: '',
            codec: '',
            bit_depth: '',
            profile: ''
        };
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
        if (LQE_CONFIG.LOGGING_QUALITY) {
            console.log("LQE-QUALITY: Extracted components for assembly:", JSON.stringify(extracted));
        }
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

// КІНЕЦЬ: translateQualityLabel

// ПОЧАТОК: Пошук найкращого релізу у JacRed API
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
                encodeURIComponent(searchTitle) +
                '&year=' + searchYear +
                (exactMatch ? '&exact=true' : '') +
                '&uid=' + userId;
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", JacRed: " + strategyName + " URL: " + apiUrl);
            var controller = new AbortController();
            var signal = controller.signal;
            var timeoutId = setTimeout(() => {
                controller.abort();
                if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", `card: ${cardId}, JacRed: ${strategyName} request timed out.`);
                apiCallback(null);
            }, LQE_CONFIG.PROXY_TIMEOUT_MS * LQE_CONFIG.PROXY_LIST.length + 1000);    // Список проксі-серверів для обходу CORS блокувань
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
                        var torrentYear = currentTorrent.relased;
                        if (typeof currentNumericQuality !== 'number' || currentNumericQuality === 0) {
                            var extractedQuality = extractNumericQualityFromTitle(currentTorrent.title);
                            if (extractedQuality > 0) {
                                currentNumericQuality = extractedQuality;
                            } else {
                                continue;
                            }
                        }
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
                        if (isYearValid && !isNaN(searchYearNum) && parsedYear !== searchYearNum) {
                            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Torrent year mismatch, skipping. Torrent: " + currentTorrent.title + ", Searched: " + searchYearNum + ", Found: " + parsedYear);
                            continue;
                        }
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
                            bestFoundTorrent = currentTorrent;
                        }
                    }
                    if (bestFoundTorrent) {
                        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", JacRed: Found best torrent in " + strategyName + ": \"" + bestFoundTorrent.title + "\" with quality: " + (bestFoundTorrent.quality || bestNumericQuality) + "p");
                        apiCallback({
                            quality: bestFoundTorrent.quality || bestNumericQuality,
                            full_label: bestFoundTorrent.title
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
        var searchStrategies = [];
        if (normalizedCard.original_title && (/[a-zа-яё]/i.test(normalizedCard.original_title) || /^\d+$/.test(normalizedCard.original_title))) {
            searchStrategies.push({
                title: normalizedCard.original_title.trim(),
                year: year,
                exact: true,
                name: "OriginalTitle Exact Year"
            });
        }
        if (normalizedCard.title && (/[a-zа-яё]/i.test(normalizedCard.title) || /^\d+$/.test(normalizedCard.title))) {
            searchStrategies.push({
                title: normalizedCard.title.trim(),
                year: year,
                exact: true,
                name: "Title Exact Year"
            });
        }

        function executeNextStrategy(index) {
            if (index >= searchStrategies.length) {
                if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", JacRed: All strategies failed. No quality found.");
                callback(null);
                return;
            }
            var strategy = searchStrategies[index];
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", JacRed: Trying strategy: " + strategy.name);
            searchJacredApi(strategy.title, strategy.year, strategy.exact, strategy.name, function(result) {
                if (result !== null) {
                    if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", JacRed: Successfully found quality using strategy " + strategy.name + ": " + result.quality + " (torrent: \"" + result.full_label + "\")");
                    callback(result);
                } else {
                    executeNextStrategy(index + 1);
                }
            });
        }
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
        var cache = Lampa.Storage.get(LQE_CONFIG.CACHE_KEY) || {};
        var item = cache[key];
        var isCacheValid = item && (Date.now() - item.timestamp < LQE_CONFIG.CACHE_VALID_TIME_MS);    // Час життя кешу (тут: 3 дні)
        if (LQE_CONFIG.LOGGING_QUALITY) {
            console.log("LQE-QUALITY", "Cache: Checking quality cache for key:", key, "Found:", !!item, "Valid:", isCacheValid);
        }
        return isCacheValid ? item : null;
    }

// КІНЕЦЬ: getQualityCache

// ПОЧАТОК: Збереження інформації про якість у кеш
    function saveQualityCache(key, data, cardId) {
        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "Cache: Saving quality cache for key:", key, "Data:", data);
        var cache = Lampa.Storage.get(LQE_CONFIG.CACHE_KEY) || {};
        cache[key] = {
            quality_code: data.quality_code,
            full_label: data.full_label,
            timestamp: Date.now()
        };
        Lampa.Storage.set(LQE_CONFIG.CACHE_KEY, cache);
    }

// КІНЕЦЬ: saveQualityCache

// ПОЧАТОК: Видалення старих елементів якості з повної картки
    function clearFullCardQualityElements(cardId, renderElement) {
        if (renderElement) {
            var existingElements = $('.full-start__status.lqe-quality', renderElement);
            if (existingElements.length > 0) {
                if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Clearing existing quality elements on full card.");
                existingElements.remove();
            }
        }
    }

// КІНЕЦЬ: clearFullCardQualityElements

// ПОЧАТОК: Додати плейсхолдер 'Завантаження...' у повну картку
    function showFullCardQualityPlaceholder(cardId, renderElement) {
        if (!renderElement) return;
        var rateLine = $('.full-start-new__rate-line', renderElement);
        if (!rateLine.length) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Cannot show placeholder, .full-start-new__rate-line not found.");
            return;
        }
        if (!$('.full-start__status.lqe-quality', rateLine).length) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Adding quality placeholder on full card.");
            var placeholder = document.createElement('div');
            placeholder.className = 'full-start__status lqe-quality';
            placeholder.textContent = 'Загрузка...';
            placeholder.style.opacity = '0.7';
            rateLine.append(placeholder);
        } else {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Placeholder already exists on full card, skipping.");
        }
    }

    /**
     * ИСПРАВЛЕНИЕ: Добавлен флаг bypassTranslation.
     * Если true, label используется напрямую, без вызова translateQualityLabel.
     * Это нужно для MANUAL_OVERRIDES, чтобы отображать метку "как есть".    // Ручні перевизначення якості для окремих ID фільмів/серіалів
     */
// КІНЕЦЬ: showFullCardQualityPlaceholder

// ПОЧАТОК: Оновлення (або створення) ярлика якості на повній картці
    function updateFullCardQualityElement(qualityCode, fullTorrentTitle, cardId, renderElement, bypassTranslation = false) {
        if (!renderElement) return;
        var element = $('.full-start__status.lqe-quality', renderElement);
        var rateLine = $('.full-start-new__rate-line', renderElement);
        if (!rateLine.length) return;
        
        var displayQuality = bypassTranslation ? fullTorrentTitle : translateQualityLabel(qualityCode, fullTorrentTitle);
        
        if (element.length) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log('LQE-QUALITY', 'card: ' + cardId + ', Updating existing element with quality "' + displayQuality + '" on full card.');
            element.text(displayQuality).css('opacity', '1');
        } else {
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
        var normalizedCard = {
            id: cardData.id,
            title: cardData.title || cardData.name || '',
            original_title: cardData.original_title || cardData.original_name || '',
            type: getCardType(cardData),
            release_date: cardData.release_date || cardData.first_air_date || ''
        };
        if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", Normalized full card data: ", normalizedCard);
        var rateLine = $('.full-start-new__rate-line', renderElement);
        if (rateLine.length) {
            rateLine.css('visibility', 'hidden');
            rateLine.addClass('done');
            addLoadingAnimation(cardId, renderElement);
        } else {
            if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", .full-start-new__rate-line not found, skipping loading animation.");
        }
        var isTvSeries = (normalizedCard.type === 'tv' || normalizedCard.name);
        var cacheKey = LQE_CONFIG.CACHE_VERSION + '_' + (isTvSeries ? 'tv_' : 'movie_') + normalizedCard.id;    // Версія кешу (щоб скидати старий кеш при оновленнях)
        
        // ИСПРАВЛЕНИЕ: Проверяем ручные настройки
        var manualOverrideData = LQE_CONFIG.MANUAL_OVERRIDES[cardId];    // Ручні перевизначення якості для окремих ID фільмів/серіалів
        if (manualOverrideData) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Found manual override:", manualOverrideData);
            // Вызываем обновление UI, передавая true для обхода трансляции
            updateFullCardQualityElement(null, manualOverrideData.full_label, cardId, renderElement, true);
            removeLoadingAnimation(cardId, renderElement);
            rateLine.css('visibility', 'visible');
            return; // Завершаем выполнение, так как ручная настройка имеет высший приоритет
        }

        var cachedQualityData = getQualityCache(cacheKey);
        if (!(isTvSeries && LQE_CONFIG.SHOW_QUALITY_FOR_TV_SERIES === false)) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log('LQE-QUALITY', 'card: ' + cardId + ', Quality feature enabled for this content, starting processing.');
            if (cachedQualityData) {
                if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Quality data found in cache:", cachedQualityData);
                updateFullCardQualityElement(cachedQualityData.quality_code, cachedQualityData.full_label, cardId, renderElement);
                
                if (Date.now() - cachedQualityData.timestamp > LQE_CONFIG.CACHE_REFRESH_THRESHOLD_MS) {    // Коли кеш старий (12 год), робимо фонове оновлення
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
                clearFullCardQualityElements(cardId, renderElement);
                showFullCardQualityPlaceholder(cardId, renderElement);
                getBestReleaseFromJacred(normalizedCard, cardId, function(jrResult) {
                    if (LQE_CONFIG.LOGGING_QUALITY) console.log('LQE-QUALITY', 'card: ' + cardId + ', JacRed callback received for full card. Result:', jrResult);
                    var qualityCode = (jrResult && jrResult.quality) || null;
                    var fullTorrentTitle = (jrResult && jrResult.full_label) || null;
                    if (LQE_CONFIG.LOGGING_QUALITY) console.log(`LQE-QUALITY: JacRed returned - qualityCode: "${qualityCode}", full label: "${fullTorrentTitle}"`);
                    if (qualityCode && qualityCode !== 'NO') {
                        if (LQE_CONFIG.LOGGING_QUALITY) console.log('LQE-QUALITY', 'card: ' + cardId + ', JacRed found quality code: ' + qualityCode + ', full label: ' + fullTorrentTitle);
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
            if (LQE_CONFIG.LOGGING_QUALITY) console.log('LQE-QUALITY', 'card: ' + cardId + ', Quality feature disabled for TV series (as configured), skipping quality fetch.');
            clearFullCardQualityElements(cardId, renderElement);
            removeLoadingAnimation(cardId, renderElement);
            rateLine.css('visibility', 'visible');
        }
        if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", Full card quality processing initiated.");
    }

    /**
     * ИСПРАВЛЕНИЕ: Добавлен флаг bypassTranslation.
     * Аналогично `updateFullCardQualityElement`, позволяет обойти трансляцию для ручных настроек.
     */
// КІНЕЦЬ: processFullCardQuality

// ПОЧАТОК: Оновлення ярлика якості на картці у списку
    function updateCardListQualityElement(cardView, qualityCode, fullTorrentTitle, bypassTranslation = false) {
        var displayQuality = bypassTranslation ? fullTorrentTitle : translateQualityLabel(qualityCode, fullTorrentTitle);
        
        var existingQualityElements = cardView.getElementsByClassName('card__quality');
        Array.from(existingQualityElements).forEach(el => el.parentNode.removeChild(el));

        var qualityDiv = document.createElement('div');
        qualityDiv.className = 'card__quality';
        var innerElement = document.createElement('div');
        innerElement.textContent = displayQuality;
        qualityDiv.appendChild(innerElement);
        cardView.appendChild(qualityDiv);
    }
// КІНЕЦЬ: updateCardListQualityElement

// ПОЧАТОК: Основна логіка роботи зі списковими картками (серіали/фільми)
    function updateCardListQuality(cardElement) {
        if (LQE_CONFIG.LOGGING_CARDLIST) console.log("LQE-CARDLIST", "updateCardListQuality called for card.");
        if (cardElement.hasAttribute('data-lqe-quality-processed')) {
            if (LQE_CONFIG.LOGGING_CARDLIST) console.log("LQE-CARDLIST", "Card already processed, skipping:", cardElement.card_data ? cardElement.card_data.id : 'N/A');
            return;
        }
        var cardView = cardElement.querySelector('.card__view');
        var cardData = cardElement.card_data;
        if (!cardData || !cardView) {
            if (LQE_CONFIG.LOGGING_CARDLIST) console.log("LQE-CARDLIST", "cardData or cardView is null for card, skipping quality fetch.");
            return;
        }
        var isTvSeries = (getCardType(cardData) === 'tv');
        if (isTvSeries && LQE_CONFIG.SHOW_QUALITY_FOR_TV_SERIES === false) {
            if (LQE_CONFIG.LOGGING_CARDLIST) console.log("LQE-CARDLIST", "Skipping TV series for quality update (as configured). Card:", cardData.id);
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
        var cacheKey = LQE_CONFIG.CACHE_VERSION + '_' + normalizedCard.type + '_' + cardId;    // Версія кешу (щоб скидати старий кеш при оновленнях)
        cardElement.setAttribute('data-lqe-quality-processed', 'true');

        // ИСПРАВЛЕНИЕ: Проверяем ручные настройки для карточек в списке
        var manualOverrideData = LQE_CONFIG.MANUAL_OVERRIDES[cardId];    // Ручні перевизначення якості для окремих ID фільмів/серіалів
        if (manualOverrideData) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Found manual override for card list:", manualOverrideData);
            updateCardListQualityElement(cardView, null, manualOverrideData.full_label, true);
            return;
        }

        var cachedQualityData = getQualityCache(cacheKey);
        if (cachedQualityData) {
            if (LQE_CONFIG.LOGGING_CARDLIST) console.log('LQE-CARDLIST', 'card: ' + cardId + ', Quality data found in cache for card list:', cachedQualityData);
            updateCardListQualityElement(cardView, cachedQualityData.quality_code, cachedQualityData.full_label);

            if (Date.now() - cachedQualityData.timestamp > LQE_CONFIG.CACHE_REFRESH_THRESHOLD_MS) {    // Коли кеш старий (12 год), робимо фонове оновлення
                if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Cache is old, scheduling background refresh.");
                getBestReleaseFromJacred(normalizedCard, cardId, function(jrResult) {
                    if (jrResult && jrResult.quality && jrResult.quality !== 'NO') {
                        saveQualityCache(cacheKey, {
                            quality_code: jrResult.quality,
                            full_label: jrResult.full_label
                        }, cardId);
                        if (document.body.contains(cardElement)) {
                            updateCardListQualityElement(cardView, jrResult.quality, jrResult.full_label);
                            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Background cache and UI refresh completed for list card.");
                        }
                    }
                });
            }
            return;
        }
        
        getBestReleaseFromJacred(normalizedCard, cardId, function(jrResult) {
            if (LQE_CONFIG.LOGGING_CARDLIST) console.log('LQE-CARDLIST', 'card: ' + cardId + ', JacRed callback received for card list. Result:', jrResult);
            if (!document.body.contains(cardElement)) {
                if (LQE_CONFIG.LOGGING_CARDLIST) console.log('LQE-CARDLIST', 'Card removed from DOM during quality fetch:', cardId);
                return;
            }
            var qualityCode = (jrResult && jrResult.quality) || null;
            var fullTorrentTitle = (jrResult && jrResult.full_label) || null;
            if (LQE_CONFIG.LOGGING_CARDLIST) console.log(`LQE-CARDLIST: JacRed returned - qualityCode: "${qualityCode}", full label: "${fullTorrentTitle}"`);
            if (qualityCode && qualityCode !== 'NO') {
                if (LQE_CONFIG.LOGGING_CARDLIST) console.log('LQE-CARDLIST', 'card: ' + cardId + ', JacRed found quality code: ' + qualityCode + ', full label: ' + fullTorrentTitle);
                saveQualityCache(cacheKey, {
                    quality_code: qualityCode,
                    full_label: fullTorrentTitle
                }, cardId);
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
        for (var m = 0; m < mutations.length; m++) {
            var mutation = mutations[m];
            if (mutation.addedNodes) {
                for (var j = 0; j < mutation.addedNodes.length; j++) {
                    var node = mutation.addedNodes[j];
                    if (node.nodeType !== 1) continue;
                    if (node.classList && node.classList.contains('card')) {
                        newCards.push(node);
                    }
                    var nestedCards = node.querySelectorAll('.card');
                    for (var k = 0; k < nestedCards.length; k++) {
                        newCards.push(nestedCards[k]);
                    }
                }
            }
        }
        if (newCards.length) {
            if (LQE_CONFIG.LOGGING_CARDLIST) console.log("LQE-CARDLIST", "Observer detected new cards. Total new cards:", newCards.length);
            newCards.forEach(updateCardListQuality);
        }
    });

// КІНЕЦЬ: observer

// ПОЧАТОК: Ініціалізація плагіна Lampa Quality (старт логіки)
    function initializeLampaQualityPlugin() {
        if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "Lampa Quality Enhancer: Plugin Initialization Started!");
        window.lampaQualityPlugin = true;
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        if (LQE_CONFIG.LOGGING_GENERAL) console.log('LQE-LOG: Initial observer for card lists started.');
        Lampa.Listener.follow('full', function(event) {
            if (event.type == 'complite') {
                var renderElement = event.object.activity.render();
                currentGlobalMovieId = event.data.movie.id;
                if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "Full card event 'complite' for ID:", currentGlobalMovieId);
                processFullCardQuality(event.data.movie, renderElement);
            }
        });
    }

// КІНЕЦЬ: initializeLampaQualityPlugin

// ПОЧАТОК: Запуск плагіна, якщо він ще не був запущений
    if (!window.lampaQualityPlugin) {
        initializeLampaQualityPlugin();
    }
})();

(function() {
    'use strict';

    // ===================== КОНФІГУРАЦІЯ =====================
    var LQE_CONFIG = {
        CACHE_VERSION: 2,
        LOGGING_GENERAL: false,
        LOGGING_QUALITY: true,
        LOGGING_CARDLIST: false,
        CACHE_VALID_TIME_MS: 24 * 60 * 60 * 1000, // 24 години
        CACHE_REFRESH_THRESHOLD_MS: 12 * 60 * 60 * 1000, // 12 годин
        CACHE_KEY: 'lampa_quality_cache',
        JACRED_PROTOCOL: 'http://',
        JACRED_URL: 'jacred.xyz',
        JACRED_API_KEY: '',
        PROXY_LIST: [
            'http://api.allorigins.win/raw?url=',
            'http://cors.bwa.workers.dev/'
        ],
        PROXY_TIMEOUT_MS: 5000,
        SHOW_QUALITY_FOR_TV_SERIES: true,
        MAX_PARALLEL_REQUESTS: 16, // Збільшено для швидкості
        FULL_CARD_LABEL_BORDER_COLOR: '#FFFFFF',
        FULL_CARD_LABEL_TEXT_COLOR: '#FFFFFF',
        FULL_CARD_LABEL_FONT_WEIGHT: 'normal',
        FULL_CARD_LABEL_FONT_SIZE: '1.2em',
        FULL_CARD_LABEL_FONT_STYLE: 'normal',
        LIST_CARD_LABEL_BORDER_COLOR: '#3DA18D',
        LIST_CARD_LABEL_BACKGROUND_COLOR: 'rgba(61, 161, 141, 0.8)',
        LIST_CARD_LABEL_BACKGROUND_TRANSPARENT: false,
        LIST_CARD_LABEL_TEXT_COLOR: '#FFFFFF',
        LIST_CARD_LABEL_FONT_WEIGHT: '600',
        LIST_CARD_LABEL_FONT_SIZE: '1.3em',
        LIST_CARD_LABEL_FONT_STYLE: 'normal',
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

    // ===================== МАПИ ДЛЯ ПАРСИНГУ ЯКОСТІ =====================
    var QUALITY_DISPLAY_MAP = {
        "WEBRip 1080p | AVC @ звук с TS": "1080P WEBRip/TS",
        "TeleSynch 1080P": "TS",
        "4K Web-DL 10bit HDR P81 HEVC": "4K WEB-DL",
        "Telecine [H.264/1080P] [звук с TS] [AD]": "1080P TS",
        "WEB-DLRip @ Синема УС": "WEB-DLRip",
        "UHD Blu-ray disc 2160p": "4K Blu-ray",
        "Blu-ray disc 1080P]": "1080P Blu-ray",
        "Blu-Ray Remux (1080P)": "1080P BDRemux",
        "BDRemux 1080P] [Крупний план]": "1080P BDRemux",
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

        "2160p": "4K", "4k": "4K", "4К": "4K", "1080p": "1080p", "1080": "1080p",
        "1080i": "1080p", "hdtv 1080i": "1080i FHDTV", "480p": "SD", "480": "SD",
        "web-dl": "WEB-DL", "webrip": "WEBRip", "web-dlrip": "WEB-DLRip",
        "bluray": "BluRay", "bdrip": "BDRip", "bdremux": "BDRemux",
        "hdtvrip": "HDTVRip", "dvdrip": "DVDRip", "ts": "TS", "camrip": "CAMRip"
    };

    var RESOLUTION_MAP = {
        "2160p":"4K", "4k":"4K", "4к":"4K", "uhd":"4K", "ultra hd":"4K",
        "ultrahd":"4K", "dci 4k":"4K", "1440p":"1440p", "2k":"1440p", "qhd":"1440p",
        "1080p":"1080p", "1080":"1080p", "1080i":"1080i", "full hd":"1080p", "fhd":"1080p",
        "720p":"720p", "720":"720p", "hd":"720p", "hd ready":"720p",
        "576p":"576p", "576":"576p", "pal":"576p", "480p":"480p", "480":"480p",
        "sd":"480p", "standard definition":"480p", "ntsc":"480p",
        "360p":"360p", "360":"360p", "low":"360p"
    };

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
        "telecine":"TC", "tc":"TC", "hdtc":"TC", "telesync":"TS", "ts":"TS",
        "hdts":"TS", "camrip":"CAMRip", "cam":"CAMRip", "hdcam":"CAMRip",
        "vhsrip":"VHSRip", "vcdrip":"VCDRip", "dcp":"DCP", "workprint":"Workprint",
        "preair":"Preair", "tv":"TVRip", "line":"Line Audio", "hybrid":"Hybrid",
        "uhd hybrid":"4K Hybrid", "upscale":"Upscale", "ai upscale":"AI Upscale",
        "bd3d":"3D Blu-ray", "3d blu-ray":"3D Blu-ray"
    };

    // ===================== СТИЛІ CSS =====================
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
        "min-width: 2.8em;" +
        "text-align: center;" +
        "text-transform: none;" +
        "border: 1px solid " + LQE_CONFIG.FULL_CARD_LABEL_BORDER_COLOR + " !important;" +
        "color: " + LQE_CONFIG.FULL_CARD_LABEL_TEXT_COLOR + " !important;" +
        "font-weight: " + LQE_CONFIG.FULL_CARD_LABEL_FONT_WEIGHT + " !important;" +
        "font-size: " + LQE_CONFIG.FULL_CARD_LABEL_FONT_SIZE + " !important;" +
        "font-style: " + LQE_CONFIG.FULL_CARD_LABEL_FONT_STYLE + " !important;" +
        "border-radius: 0.2em;" +
        "padding: 0.3em;" +
        "height: 1.72em;" +
        "display: flex;" +
        "align-items: center;" +
        "justify-content: center;" +
        "box-sizing: border-box;" +
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
        " border-radius: 0 0.8em 0.8em 0.3em; " +
        " overflow: hidden;" +
        "}" +
        ".card__quality div {" +
        " text-transform: uppercase; " +
        " font-family: 'Roboto Condensed', 'Arial Narrow', Arial, sans-serif; " +
        " font-weight: 700; " +
        " letter-spacing: 0.1px; " +
        " font-size: 1.30em; " +
        " color: " + LQE_CONFIG.LIST_CARD_LABEL_TEXT_COLOR + " !important;" +
        " padding: 0.1em 0.1em 0.08em 0.1em; " +
        " white-space: nowrap;" +
        " text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.3); " +
        "}" +
        "</style>";

    Lampa.Template.add('lampa_quality_css', styleLQE);
    $('body').append(Lampa.Template.get('lampa_quality_css', {}, true));

    var fadeStyles = "<style id='lampa_quality_fade'>" +
        ".card__quality, .full-start__status.lqe-quality {" +
        "opacity: 0;" +
        "transition: opacity 0.22s ease-in-out;" +
        "}" +
        ".card__quality.show, .full-start__status.lqe-quality.show {" +
        "opacity: 1;" +
        "}" +
        "</style>";
    Lampa.Template.add('lampa_quality_fade', fadeStyles);
    $('body').append(Lampa.Template.get('lampa_quality_fade', {}, true));

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

    // ===================== МЕРЕЖЕВІ ФУНКЦІЇ =====================
    /**
     * Виконує запит через проксі з ротацією при помилках
     * @param {string} url - URL для запиту
     * @param {string} cardId - ID картки для логування
     * @param {function} callback - Callback функція
     */
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

    // ===================== АНІМАЦІЯ ЗАВАНТАЖЕННЯ =====================
    /**
     * Додає анімацію завантаження до картки
     * @param {string} cardId - ID картки
     * @param {Element} renderElement - DOM елемент
     */
    function addLoadingAnimation(cardId, renderElement) {
        if (!renderElement) return;
        if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", Add loading animation");
        
        var rateLine = renderElement.querySelector('.full-start-new__rate-line');
        if (!rateLine || rateLine.querySelector('.loading-dots-container')) return;
        
        rateLine.insertAdjacentHTML('beforeend',
            '<div class="loading-dots-container">' +
            '<div class="loading-dots">' +
            '<span class="loading-dots__text">Загрузка...</span>' +
            '<span class="loading-dots__dot"></span>' +
            '<span class="loading-dots__dot"></span>' +
            '<span class="loading-dots__dot"></span>' +
            '</div>' +
            '</div>'
        );
        
        var container = rateLine.querySelector('.loading-dots-container');
        if (container) {
            container.style.opacity = '1';
            container.style.visibility = 'visible';
        }
    }

    /**
     * Видаляє анімацію завантаження
     * @param {string} cardId - ID картки
     * @param {Element} renderElement - DOM елемент
     */
    function removeLoadingAnimation(cardId, renderElement) {
        if (!renderElement) return;
        if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", Remove loading animation");
        
        var el = renderElement.querySelector('.loading-dots-container');
        if (el) el.remove();
    }

    // ===================== УТІЛІТИ =====================
    /**
     * Визначає тип контенту (фільм/серіал)
     * @param {object} cardData - Дані картки
     * @returns {string} - 'movie' або 'tv'
     */
    function getCardType(cardData) {
        var type = cardData.media_type || cardData.type;
        if (type === 'movie' || type === 'tv') return type;
        return cardData.name || cardData.original_name ? 'tv' : 'movie';
    }

    /**
     * Очищує та нормалізує назву для пошуку
     * @param {string} title - Оригінальна назва
     * @returns {string} - Нормалізована назва
     */
    function sanitizeTitle(title) {
        if (!title) return '';
        return title.toString().toLowerCase()
                   .replace(/[\._\-\[\]\(\),]+/g, ' ')
                   .replace(/\s+/g, ' ')
                   .trim();
    }

    /**
     * Генерує ключ для кешу
     * @param {number} version - Версія кешу
     * @param {string} type - Тип контенту
     * @param {string} id - ID картки
     * @returns {string} - Ключ кешу
     */
    function makeCacheKey(version, type, id) {
        return version + '_' + (type === 'tv' ? 'tv' : 'movie') + '_' + id;
    }

    // ===================== ПАРСИНГ ЯКОСТІ =====================
    /**
     * Перетворює технічну назву якості на читабельну
     * @param {number} qualityCode - Код якості
     * @param {string} fullTorrentTitle - Повна назва торренту
     * @returns {string} - Відформатована назва якості
     */
    function translateQualityLabel(qualityCode, fullTorrentTitle) {
        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "translateQualityLabel:", qualityCode, fullTorrentTitle);

        var title = sanitizeTitle(fullTorrentTitle || '');
        var titleForSearch = ' ' + title + ' ';

        var resolution = '';
        var bestResKey = '';
        var bestResLen = 0;
        for (var rKey in RESOLUTION_MAP) {
            if (!RESOLUTION_MAP.hasOwnProperty(rKey)) continue;
            var lk = rKey.toString().toLowerCase();
            if (titleForSearch.indexOf(' ' + lk + ' ') !== -1 || title.indexOf(lk) !== -1) {
                if (lk.length > bestResLen) {
                    bestResLen = lk.length;
                    bestResKey = rKey;
                }
            }
        }
        if (bestResKey) resolution = RESOLUTION_MAP[bestResKey];

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
        if (bestSrcKey) source = SOURCE_MAP[bestSrcKey];

        var finalLabel = '';
        if (resolution && source) {
            if (source.toLowerCase().includes(resolution.toLowerCase())) {
                finalLabel = source;
            } else {
                finalLabel = resolution + ' ' + source;
            }
        } else if (resolution) {
            finalLabel = resolution;
        } else if (source) {
            finalLabel = source;
        }

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
                finalLabel = QUALITY_DISPLAY_MAP[bestDirectKey];
            }
        }

        if (!finalLabel || finalLabel.trim() === '') {
            if (qualityCode) {
                var qc = String(qualityCode).toLowerCase();
                finalLabel = QUALITY_DISPLAY_MAP[qc] || qualityCode;
            } else {
                finalLabel = fullTorrentTitle || '';
            }
        }

        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "Final quality label:", finalLabel);
        return finalLabel;
    }

    // ===================== ОПТИМІЗОВАНА ЧЕРГА ЗАПИТІВ =====================
    /**
     * Клас для управління чергою запитів з обмеженням паралельності
     */
    class RequestQueue {
        constructor(maxParallel) {
            this.queue = [];
            this.active = 0;
            this.maxParallel = maxParallel || LQE_CONFIG.MAX_PARALLEL_REQUESTS;
        }

        /**
         * Додає завдання до черги
         * @param {function} fn - Функція завдання (приймає callback done)
         * @returns {Promise} - Promise який виконується після завершення
         */
        add(fn) {
            if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "RequestQueue: add task, queue length:", this.queue.length);
            return new Promise((resolve) => {
                this.queue.push({ fn: fn, resolve: resolve });
                this._process();
            });
        }

        /**
         * Обробляє чергу (внутрішній метод)
         */
        _process() {
            if (this.active >= this.maxParallel) return;
            if (this.queue.length === 0) return;
            
            var item = this.queue.shift();
            this.active++;

            if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "RequestQueue: processing task, active:", this.active);

            const doneCallback = () => {
                this.active--;
                item.resolve();
                setTimeout(() => this._process(), 0);
            };

            try {
                item.fn(doneCallback);
            } catch (e) {
                console.error("LQE-LOG", "RequestQueue task error:", e);
                doneCallback();
            }
        }
    }

    var requestQueue = new RequestQueue(LQE_CONFIG.MAX_PARALLEL_REQUESTS);

    /**
     * Обгортка для зворотної сумісності
     * @param {function} fn - Функція завдання
     */
    function enqueueTask(fn) {
        return requestQueue.add(fn);
    }

    // ===================== ОПТИМІЗОВАНИЙ ПОШУК В JACRED =====================
    /**
     * Знаходить найкращий реліз в JacRed API з виправленим scoring
     * @param {object} normalizedCard - Нормалізовані дані картки
     * @param {string} cardId - ID картки
     * @param {function} callback - Callback функція
     */
    function getBestReleaseFromJacred(normalizedCard, cardId, callback) {
        enqueueTask(function (done) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Searching JacRed...");

            // Перевірка майбутніх релізів
            var relDate = normalizedCard.release_date ? new Date(normalizedCard.release_date) : null;
            if (relDate && relDate.getTime() > Date.now()) {
                if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Future release, skipping");
                callback(null);
                done();
                return;
            }

            if (!LQE_CONFIG.JACRED_URL) {
                if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", JacRed URL not configured");
                callback(null);
                done();
                return;
            }

            // Витягуємо рік з дати релізу
            var year = '';
            if (normalizedCard.release_date && normalizedCard.release_date.length >= 4) {
                year = normalizedCard.release_date.substring(0, 4);
            }
            if (!year || isNaN(year)) {
                if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Invalid year");
                callback(null);
                done();
                return;
            }
            
            var searchYearNum = parseInt(year, 10);
            var currentYear = new Date().getFullYear();

            // ВИПРАВЛЕНІ ДОПОМІЖНІ ФУНКЦІЇ
            /**
             * Визначає числовий код якості з назви (виправлена версія)
             * @param {string} title - Назва торренту
             * @returns {number} - Код якості
             */
            function extractNumericQualityFromTitle(title) {
                var lower = (title || '').toLowerCase();
                
                // Високоякісні формати
                if (/2160p|4k|uhd/.test(lower)) return 2160;
                if (/1080p|fhd/.test(lower)) return 1080;
                if (/720p|hd/.test(lower)) return 720;
                if (/480p|sd/.test(lower)) return 480;
                
                // Низькоякісні формати (низький пріоритет, але не виключаємо)
                if (/ts|telesync/.test(lower)) return 100;
                if (/camrip|камрип/.test(lower)) return 50;
                if (/tc|telecine/.test(lower)) return 150;
                
                return 0;
            }

            function extractYearFromTitle(title) {
                var regex = /(?:^|[^\d])(\d{4})(?:[^\d]|$)/g;
                var match, lastYear = 0;
                while ((match = regex.exec(title)) !== null) {
                    var extractedYear = parseInt(match[1], 10);
                    if (extractedYear >= 1900 && extractedYear <= currentYear + 1) {
                        lastYear = extractedYear;
                    }
                }
                return lastYear;
            }

            function containsWholeWord(haystack, needle) {
                if (!needle) return false;
                var regex = new RegExp("\\b" + needle.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "\\b", "i");
                return regex.test(haystack.toLowerCase());
            }

            // ОПТИМІЗОВАНА ФУНКЦІЯ ПОШУКУ
            function searchJacredApi(searchTitle, searchYear, exactMatch, contentType, apiCallback) {
                var userId = Lampa.Storage.get('lampac_unic_id', '');
                var apiUrl = LQE_CONFIG.JACRED_PROTOCOL + LQE_CONFIG.JACRED_URL + '/api/v1.0/torrents?search=' +
                    encodeURIComponent(searchTitle) +
                    '&year=' + searchYear +
                    (exactMatch ? '&exact=true' : '');
                
                if (contentType) {
                    var jacredType = contentType === 'movie' ? 'movie' : 'serial';
                    apiUrl += '&type=' + jacredType;
                }
                apiUrl += '&uid=' + userId;

                // ШВИДКИЙ ТАЙМАУТ (4 секунди)
                var timeoutId = setTimeout(function () {
                    if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", JacRed API timeout");
                    apiCallback(null);
                }, 4000);

                fetchWithProxy(apiUrl, cardId, function (error, responseText) {
                    clearTimeout(timeoutId);
                    
                    if (error || !responseText) {
                        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", JacRed API error:", error);
                        apiCallback(null);
                        return;
                    }
                    
                    try {
                        var torrents = JSON.parse(responseText);
                        if (!Array.isArray(torrents) || torrents.length === 0) {
                            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", No torrents found");
                            apiCallback(null);
                            return;
                        }

                        var bestScore = -1;
                        var bestTorrent = null;

                        // Аналізуємо кожен торрент з ВИПРАВЛЕНИМ SCORING
                        for (var i = 0; i < torrents.length; i++) {
                            var t = torrents[i];
                            
                            // Визначаємо якість (виправлена функція)
                            var qualityNum = t.quality;
                            if (typeof qualityNum !== 'number' || qualityNum === 0) {
                                var q = extractNumericQualityFromTitle(t.title);
                                if (q > 0) qualityNum = q; else continue;
                            }

                            // Фільтрація по типу контенту
                            if (contentType) {
                                var torrentType = String(t.type || '').toLowerCase();
                                var okType = contentType === 'movie'
                                    ? torrentType.includes('movie') || torrentType.includes('фільм')
                                    : torrentType.includes('serial') || torrentType.includes('серіал');
                                if (!okType) continue;
                            }

                            // Перевірка року релізу (±1 рік)
                            var parsedYear = parseInt(t.relased, 10);
                            if (!parsedYear || isNaN(parsedYear)) parsedYear = extractYearFromTitle(t.title);
                            var yearDiff = Math.abs(parsedYear - searchYearNum);
                            if (yearDiff > 1) continue;

                            // ВИПРАВЛЕНІ БОНУСИ (менш агресивні)
                            var titleBonus = 0;
                            if (containsWholeWord(t.title, normalizedCard.original_title)) {
                                titleBonus = 300;  // Зменшено для уникнення переваги TS
                            } else if (containsWholeWord(t.title, normalizedCard.title)) {
                                titleBonus = 100;  // Зменшено
                            }

                            // Бонуси за рік
                            var yearBonus = 0;
                            if (parsedYear === searchYearNum) yearBonus = 200;
                            else if (yearDiff === 1) yearBonus = 50;

                            // Загальний бал (вибираємо завжди найкращий доступний)
                            var score = qualityNum + titleBonus + yearBonus;
                            if (score > bestScore) {
                                bestScore = score;
                                bestTorrent = t;
                            }
                        }

                        if (bestTorrent) {
                            var quality = bestTorrent.quality || extractNumericQualityFromTitle(bestTorrent.title);
                            var result = {
                                quality: quality,
                                full_label: bestTorrent.title
                            };
                            
                            // Логуємо якість результату
                            if (quality <= 100) {
                                if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Low-quality version found:", quality);
                            }
                            
                            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Best torrent found:", result);
                            apiCallback(result);
                        } else {
                            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", No suitable torrent found");
                            apiCallback(null);
                        }

                    } catch (e) {
                        console.error("LQE-LOG", "card: " + cardId + ", JacRed API parse error:", e);
                        apiCallback(null);
                    }
                });
            }

            // Стратегії пошуку (пріоритети)
            var searchStrategies = [];
            var isTvSeries = (normalizedCard.type === 'tv');

            // 1. Оригінальна назва + тип контенту
            if (normalizedCard.original_title && normalizedCard.original_title.trim()) {
                searchStrategies.push({
                    title: normalizedCard.original_title.trim(),
                    year: year,
                    exact: true,
                    contentType: isTvSeries ? 'tv' : 'movie'
                });
            }

            // 2. Оригінальна назва без типу контенту
            if (normalizedCard.original_title && normalizedCard.original_title.trim()) {
                searchStrategies.push({
                    title: normalizedCard.original_title.trim(),
                    year: year,
                    exact: true,
                    contentType: null
                });
            }

            // 3. Локалізована назва (резерв)
            if (normalizedCard.title && normalizedCard.title.trim() &&
                normalizedCard.title !== normalizedCard.original_title) {
                searchStrategies.push({
                    title: normalizedCard.title.trim(),
                    year: year,
                    exact: true,
                    contentType: isTvSeries ? 'tv' : 'movie'
                });
            }

            function executeNextStrategy(index) {
                if (index >= searchStrategies.length) {
                    if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", All strategies exhausted");
                    callback(null);
                    done();
                    return;
                }
                
                var s = searchStrategies[index];
                if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Trying strategy", index + 1, ":", s.title);
                
                searchJacredApi(s.title, s.year, s.exact, s.contentType, function (result) {
                    if (result !== null) {
                        callback(result);
                        done();
                    } else {
                        executeNextStrategy(index + 1);
                    }
                });
            }

            if (searchStrategies.length > 0) {
                executeNextStrategy(0);
            } else {
                if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", No search strategies available");
                callback(null);
                done();
            }
        });
    }

    // ===================== КЕШУВАННЯ =====================
    function getQualityCache(key) {
        var cache = Lampa.Storage.get(LQE_CONFIG.CACHE_KEY) || {};
        var item = cache[key];
        var isCacheValid = item && (Date.now() - item.timestamp < LQE_CONFIG.CACHE_VALID_TIME_MS);
        
        if (LQE_CONFIG.LOGGING_QUALITY) {
            console.log("LQE-QUALITY", "Cache: Checking quality cache for key:", key, "Found:", !!item, "Valid:", isCacheValid);
        }
        
        return isCacheValid ? item : null;
    }

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

    function removeExpiredCacheEntries() {
        var cache = Lampa.Storage.get(LQE_CONFIG.CACHE_KEY) || {};
        var changed = false;
        var now = Date.now();
        
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

    removeExpiredCacheEntries();

    // ===================== ОПТИМІЗОВАНІ UI ФУНКЦІЇ =====================
    function clearFullCardQualityElements(cardId, renderElement) {
        if (renderElement) {
            var existingElements = renderElement.querySelectorAll('.full-start__status.lqe-quality');
            if (existingElements.length > 0) {
                if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Clearing existing quality elements");
                existingElements.forEach(function(el){ el.remove(); });
            }
        }
    }

    function showFullCardQualityPlaceholder(cardId, renderElement) {
        if (!renderElement) return;
        var rateLine = renderElement.querySelector('.full-start-new__rate-line');
        if (!rateLine) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Rate line not found");
            return;
        }
        
        if (!rateLine.querySelector('.full-start__status.lqe-quality')) {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Adding quality placeholder");
            var placeholder = document.createElement('div');
            placeholder.className = 'full-start__status lqe-quality';
            placeholder.textContent = 'Загрузка...';
            placeholder.style.opacity = '0.7';
            rateLine.appendChild(placeholder);
        }
    }

    function updateFullCardQualityElement(qualityCode, fullTorrentTitle, cardId, renderElement, bypassTranslation) {
        if (!renderElement) return;
        
        var element = renderElement.querySelector('.full-start__status.lqe-quality');
        var rateLine = renderElement.querySelector('.full-start-new__rate-line');
        if (!rateLine) return;

        var displayQuality = bypassTranslation ? fullTorrentTitle : translateQualityLabel(qualityCode, fullTorrentTitle);

        if (element) {
            if (element.textContent === displayQuality) {
                element.style.opacity = '1';
                element.classList.add('show');
            } else {
                if (LQE_CONFIG.LOGGING_QUALITY) console.log('LQE-QUALITY', 'card: ' + cardId + ', Updating quality to: "' + displayQuality + '"');
                element.textContent = displayQuality;
                element.style.opacity = '1';
                element.classList.add('show');
            }
        } else {
            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Creating quality element: '" + displayQuality + "'");
            var div = document.createElement('div');
            div.className = 'full-start__status lqe-quality';
            div.textContent = displayQuality;
            rateLine.appendChild(div);
            requestAnimationFrame(function(){ div.classList.add('show'); });
        }
    }

    function updateCardListQualityElement(cardView, qualityCode, fullTorrentTitle, bypassTranslation) {
        var displayQuality = bypassTranslation ? fullTorrentTitle : translateQualityLabel(qualityCode, fullTorrentTitle);

        var existing = cardView.querySelector('.card__quality');
        if (existing) {
            var inner = existing.querySelector('div');
            if (inner && inner.textContent === displayQuality) return;
            existing.remove();
        }

        var qualityDiv = document.createElement('div');
        qualityDiv.className = 'card__quality';
        var innerElement = document.createElement('div');
        innerElement.textContent = displayQuality;
        qualityDiv.appendChild(innerElement);
        cardView.appendChild(qualityDiv);
        requestAnimationFrame(function(){ qualityDiv.classList.add('show'); });
    }

    // ===================== ОПТИМІЗОВАНА ОБРОБКА ПОВНОЇ КАРТКИ =====================
    function processFullCardQuality(cardData, renderElement) {
        try {
            if (!renderElement) {
                console.error("LQE-LOG", "Render element is null in processFullCardQuality");
                return;
            }
            
            var cardId = cardData.id;
            if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", Processing full card quality");

            var normalizedCard = {
                id: cardData.id,
                title: cardData.title || cardData.name || '',
                original_title: cardData.original_title || cardData.original_name || '',
                type: getCardType(cardData),
                release_date: cardData.release_date || cardData.first_air_date || ''
            };
            
            if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", Normalized data:", normalizedCard);

            var rateLine = renderElement.querySelector('.full-start-new__rate-line');
            if (rateLine) {
                rateLine.style.visibility = 'hidden';
                rateLine.classList.add('done');
                addLoadingAnimation(cardId, renderElement);
            }

            var isTvSeries = (normalizedCard.type === 'tv');
            var cacheKey = makeCacheKey(LQE_CONFIG.CACHE_VERSION, isTvSeries ? 'tv' : 'movie', normalizedCard.id);

            var manualOverrideData = LQE_CONFIG.MANUAL_OVERRIDES[cardId];
            if (manualOverrideData) {
                if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Using manual override:", manualOverrideData);
                updateFullCardQualityElement(null, manualOverrideData.full_label, cardId, renderElement, true);
                removeLoadingAnimation(cardId, renderElement);
                if (rateLine) {
                    rateLine.style.visibility = 'visible';
                    rateLine.classList.remove('done');
                }
                return;
            }

            if (!(isTvSeries && LQE_CONFIG.SHOW_QUALITY_FOR_TV_SERIES === false)) {
                if (LQE_CONFIG.LOGGING_QUALITY) console.log('LQE-QUALITY', 'card: ' + cardId + ', Quality feature enabled');

                var cachedQualityData = getQualityCache(cacheKey);
                if (cachedQualityData) {
                    if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Using cached data:", cachedQualityData);
                    updateFullCardQualityElement(cachedQualityData.quality_code, cachedQualityData.full_label, cardId, renderElement);

                    if (Date.now() - cachedQualityData.timestamp > LQE_CONFIG.CACHE_REFRESH_THRESHOLD_MS) {
                        if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Cache stale, background refresh");
                        getBestReleaseFromJacred(normalizedCard, cardId, function(jrResult) {
                            if (jrResult && jrResult.quality && jrResult.quality !== 'NO') {
                                saveQualityCache(cacheKey, {
                                    quality_code: jrResult.quality,
                                    full_label: jrResult.full_label
                                }, cardId);
                                updateFullCardQualityElement(jrResult.quality, jrResult.full_label, cardId, renderElement);
                            }
                        });
                    }

                    removeLoadingAnimation(cardId, renderElement);
                    if (rateLine) {
                        rateLine.style.visibility = 'visible';
                        rateLine.classList.remove('done');
                    }
                } else {
                    clearFullCardQualityElements(cardId, renderElement);
                    showFullCardQualityPlaceholder(cardId, renderElement);
                    
                    getBestReleaseFromJacred(normalizedCard, cardId, function(jrResult) {
                        if (LQE_CONFIG.LOGGING_QUALITY) console.log('LQE-QUALITY', 'card: ' + cardId + ', JacRed result:', jrResult);
                        
                        var qualityCode = (jrResult && jrResult.quality) || null;
                        var fullTorrentTitle = (jrResult && jrResult.full_label) || null;
                        
                        if (qualityCode && qualityCode !== 'NO') {
                            if (LQE_CONFIG.LOGGING_QUALITY) console.log('LQE-QUALITY', 'card: ' + cardId + ', Quality found:', qualityCode, fullTorrentTitle);
                            saveQualityCache(cacheKey, {
                                quality_code: qualityCode,
                                full_label: fullTorrentTitle
                            }, cardId);
                            updateFullCardQualityElement(qualityCode, fullTorrentTitle, cardId, renderElement);
                        } else {
                            if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", 'card: ' + cardId + ', No quality found');
                            clearFullCardQualityElements(cardId, renderElement);
                        }
                        
                        removeLoadingAnimation(cardId, renderElement);
                        if (rateLine) {
                            rateLine.style.visibility = 'visible';
                            rateLine.classList.remove('done');
                        }
                    });
                }
            } else {
                if (LQE_CONFIG.LOGGING_QUALITY) console.log('LQE-QUALITY', 'card: ' + cardId + ', Quality disabled for TV series');
                clearFullCardQualityElements(cardId, renderElement);
                removeLoadingAnimation(cardId, renderElement);
                if (rateLine) {
                    rateLine.style.visibility = 'visible';
                    rateLine.classList.remove('done');
                }
            }
            
            if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "card: " + cardId + ", Full card quality processing completed");
        } catch (e) {
            console.error("LQE-LOG", "processFullCardQuality error", e);
        }
    }

    // ===================== ОПТИМІЗОВАНА ОБРОБКА СПИСКОВИХ КАРТОК =====================
    function updateCardListQuality(cardElement) {
        try {
            if (LQE_CONFIG.LOGGING_CARDLIST) console.log("LQE-CARDLIST", "Processing list card");
            
            if (cardElement.hasAttribute('data-lqe-quality-processed')) {
                if (LQE_CONFIG.LOGGING_CARDLIST) console.log("LQE-CARDLIST", "Card already processed");
                return;
            }
            
            var cardView = cardElement.querySelector('.card__view');
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
            cardElement.setAttribute('data-lqe-quality-processed', 'true');

            var manualOverrideData = LQE_CONFIG.MANUAL_OVERRIDES[cardId];
            if (manualOverrideData) {
                if (LQE_CONFIG.LOGGING_QUALITY) console.log("LQE-QUALITY", "card: " + cardId + ", Manual override for list");
                updateCardListQualityElement(cardView, null, manualOverrideData.full_label, true);
                return;
            }

            var cachedQualityData = getQualityCache(cacheKey);
            if (cachedQualityData) {
                if (LQE_CONFIG.LOGGING_CARDLIST) console.log('LQE-CARDLIST', 'card: ' + cardId + ', Using cached quality');
                updateCardListQualityElement(cardView, cachedQualityData.quality_code, cachedQualityData.full_label);

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

            getBestReleaseFromJacred(normalizedCard, cardId, function(jrResult) {
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
        } catch (e) {
            console.error("LQE-LOG", "updateCardListQuality error", e);
        }
    }

    // ===================== ОПТИМІЗОВАНИЙ MUTATION OBSERVER =====================
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
                    
                    try {
                        var nestedCards = node.querySelectorAll('.card');
                        if (nestedCards && nestedCards.length) {
                            for (var k = 0; k < nestedCards.length; k++) {
                                newCards.push(nestedCards[k]);
                            }
                        }
                    } catch (e) {}
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
     * ШВИДКИЙ дебаунсинг для обробки нових карток
     * @param {Array} cards - Масив карток
     */
    function debouncedProcessNewCards(cards) {
        if (!Array.isArray(cards) || cards.length === 0) return;
        
        clearTimeout(observerDebounceTimer);
        observerDebounceTimer = setTimeout(function() {
            // ШВИДКА перевірка унікальності
            var uniqueCards = [];
            var seenIds = new Set();
            
            for (var i = 0; i < cards.length; i++) {
                var card = cards[i];
                if (!card) continue;
                
                var cardId = card.card_data?.id;
                if (cardId && !seenIds.has(cardId)) {
                    seenIds.add(cardId);
                    uniqueCards.push(card);
                }
            }
            
            if (LQE_CONFIG.LOGGING_CARDLIST) {
                console.log("LQE-CARDLIST", "Quick processing", uniqueCards.length, "unique cards");
            }
            
            // ШВИДКА обробка
            uniqueCards.forEach(updateCardListQuality);
        }, 15); // ШВИДКИЙ дебаунсинг (15ms)
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
            observer.observe(document.body, { childList: true, subtree: true });
        }
    }

    // ===================== ІНІЦІАЛІЗАЦІЯ =====================
    function initializeLampaQualityPlugin() {
        if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "Lampa Quality Enhancer: Initializing...");
        
        window.lampaQualityPlugin = true;
        
        attachObserver();
        if (LQE_CONFIG.LOGGING_GENERAL) console.log('LQE-LOG: Optimized observer started');
        
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
        
        if (LQE_CONFIG.LOGGING_GENERAL) console.log("LQE-LOG", "Lampa Quality Enhancer: Optimized version initialized!");
    }

    if (!window.lampaQualityPlugin) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeLampaQualityPlugin);
        } else {
            initializeLampaQualityPlugin();
        }
    }

})();

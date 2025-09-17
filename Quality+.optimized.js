
(function() {
    'use strict';

    // ===== LQE CONFIG =====
    var LQE_CONFIG = {
        CACHE_VERSION: 2,
        LOGGING_GENERAL: false,
        LOGGING_QUALITY: false,
        LOGGING_CARDLIST: false,
        CACHE_VALID_TIME_MS: 3 * 24 * 60 * 60 * 1000, // 3 days
        CACHE_REFRESH_THRESHOLD_MS: 12 * 60 * 60 * 1000, // 12 hours
        CACHE_KEY: 'lampa_quality_cache',
        JACRED_PROTOCOL: 'http://',
        JACRED_URL: 'jacred.xyz',
        JACRED_API_KEY: '',
        PROXY_LIST: [
            'http://api.allorigins.win/raw?url=',
            'http://cors.bwa.workers.dev/'
        ],
        PROXY_TIMEOUT_MS: 5000,
        PROXY_FETCH_CONCURRENCY: 3,
        SHOW_QUALITY_FOR_TV_SERIES: true,
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
            '20873': { quality_code: 2160, full_label: '4K BDRip' }
            // ... keep others if needed
        }
    };

    var memoryCache = {}; // in-memory cache to avoid frequent Lampa.Storage calls
    var qualityMapCompiled = null; // precompiled array for fast matching

    // ===== helper: safe console log =====
    function log(type) {
        if (!LQE_CONFIG.LOGGING_GENERAL) return;
        console.log.apply(console, arguments);
    }
    function qlog() {
        if (!LQE_CONFIG.LOGGING_QUALITY) return;
        console.log.apply(console, arguments);
    }
    function clog() {
        if (!LQE_CONFIG.LOGGING_CARDLIST) return;
        console.log.apply(console, arguments);
    }

    // ===== Original QUALITY_DISPLAY_MAP (trimmed inlined) =====
    var QUALITY_DISPLAY_MAP = {
        "4k": "4K", "4к": "4K", "2160p": "4K", "1080p": "1080p", "1080": "1080p",
        "720p": "720p", "480p": "SD", "web-dl": "WEB-DL", "webrip": "WEBRip",
        "bluray": "BluRay", "bdrip": "BDRip", "bdremux": "BDRemux", "hdrip": "HDRip",
        "dvdrip": "DVDRip", "hdtv": "HDTV", "ts": "TeleSync", "camrip": "CAMRip",
        "hevc": "HEVC", "h.265": "HEVC", "h.264": "H.264", "av1": "AV1",
        "hdr10": "HDR", "dolby vision": "DV", "dv": "DV"
        // add other specific mappings as needed
    };

    // Precompile quality map (lowercased keys with original)
    function compileQualityMap() {
        if (qualityMapCompiled) return;
        qualityMapCompiled = [];
        for (var k in QUALITY_DISPLAY_MAP) {
            if (!QUALITY_DISPLAY_MAP.hasOwnProperty(k)) continue;
            qualityMapCompiled.push({ key: String(k).toLowerCase(), display: QUALITY_DISPLAY_MAP[k] });
        }
        // sort by length desc to ensure longer matches take precedence
        qualityMapCompiled.sort(function(a,b){ return b.key.length - a.key.length; });
    }

    // ===== CSS injection (single check) =====
    function injectStyleOnce(id, css) {
        if (document.getElementById(id)) return;
        var style = document.createElement('style');
        style.id = id;
        style.textContent = css;
        document.head.appendChild(style);
    }

    // main styles (kept concise)
    var styleLQE = " .full-start-new__rate-line{visibility:hidden;flex-wrap:wrap;gap:.4em 0}.full-start-new__rate-line>*{margin-right:.5em;flex:0 0 auto}.lqe-quality{min-width:2.8em;text-align:center;text-transform:none;border:1px solid " + LQE_CONFIG.FULL_CARD_LABEL_BORDER_COLOR + " !important;color:" + LQE_CONFIG.FULL_CARD_LABEL_TEXT_COLOR + " !important;font-weight:" + LQE_CONFIG.FULL_CARD_LABEL_FONT_WEIGHT + " !important;font-size:" + LQE_CONFIG.FULL_CARD_LABEL_FONT_SIZE + " !important;font-style:" + LQE_CONFIG.FULL_CARD_LABEL_FONT_STYLE + " !important;border-radius:.2em;padding:.3em;height:1.72em;display:flex;align-items:center;justify-content:center;box-sizing:border-box}.card__view{position:relative}.card__quality{position:absolute;bottom:.5em;left:0;background-color:" + (LQE_CONFIG.LIST_CARD_LABEL_BACKGROUND_TRANSPARENT ? "transparent" : LQE_CONFIG.LIST_CARD_LABEL_BACKGROUND_COLOR) + " !important;z-index:10;width:fit-content;max-width:calc(100% - 1em);border-radius:0 .8em .8em .3em;overflow:hidden}.card__quality div{text-transform:uppercase;font-family:'Roboto Condensed','Arial Narrow',Arial,sans-serif;font-weight:700;letter-spacing:.1px;font-size:1.3em;color:" + LQE_CONFIG.LIST_CARD_LABEL_TEXT_COLOR + " !important;padding:.1em .1em .08em .1em;white-space:nowrap;text-shadow:0.5px 0.5px 1px rgba(0,0,0,.3)}";

    injectStyleOnce('lampa_quality_styles', styleLQE);

    // loading animation styles
    var loadingCSS = ".loading-dots-container{position:absolute;top:50%;left:0;right:0;text-align:left;transform:translateY(-50%);z-index:10}.loading-dots{display:inline-flex;align-items:center;gap:.4em;color:#fff;font-size:.7em;background:rgba(0,0,0,.3);padding:.6em 1em;border-radius:.5em}.loading-dots__dot{width:.5em;height:.5em;border-radius:50%;background-color:currentColor;opacity:.3;animation:loading-dots-fade 1.5s infinite both}.loading-dots__dot:nth-child(2){animation-delay:.5s}.loading-dots__dot:nth-child(3){animation-delay:1s}@keyframes loading-dots-fade{0%,90%,100%{opacity:.3}35%{opacity:1}}@media screen and (max-width:480px){.loading-dots-container{text-align:center}}";
    injectStyleOnce('lampa_quality_loading_animation_css', loadingCSS);

    // ===== in-memory + persistent cache helpers =====
    function loadPersistentCache() {
        try {
            var raw = Lampa.Storage.get(LQE_CONFIG.CACHE_KEY) || {};
            // copy into memoryCache for fast read
            Object.keys(raw).forEach(function(k){
                memoryCache[k] = raw[k];
            });
        } catch (e) {
            console.warn('LQE: failed to load persistent cache', e);
        }
    }
    function persistMemoryCache() {
        try {
            Lampa.Storage.set(LQE_CONFIG.CACHE_KEY, memoryCache);
        } catch (e) {
            console.warn('LQE: failed to persist cache', e);
        }
    }

    loadPersistentCache();

    function getQualityCache(key) {
        var item = memoryCache[key];
        if (item && (Date.now() - item.timestamp < LQE_CONFIG.CACHE_VALID_TIME_MS)) {
            qlog('Cache hit', key);
            return item;
        }
        // fallback to persistent if not in memory
        var persisted = Lampa.Storage.get(LQE_CONFIG.CACHE_KEY) || {};
        if (persisted[key] && (Date.now() - persisted[key].timestamp < LQE_CONFIG.CACHE_VALID_TIME_MS)) {
            memoryCache[key] = persisted[key];
            qlog('Cache loaded from storage', key);
            return memoryCache[key];
        }
        return null;
    }

    function saveQualityCache(key, data) {
        var entry = {
            quality_code: data.quality_code,
            full_label: data.full_label,
            timestamp: Date.now()
        };
        memoryCache[key] = entry;
        // persist async (debounced simple)
        setTimeout(persistMemoryCache, 0);
    }

    // ===== small util: getCardType =====
    function getCardType(cardData) {
        var type = cardData.media_type || cardData.type;
        if (type === 'movie' || type === 'tv') return type;
        return (cardData.name || cardData.original_name) ? 'tv' : 'movie';
    }

    // ===== translateQualityLabel optimized =====
    function translateQualityLabel(qualityCode, fullTorrentTitle) {
        compileQualityMap();
        var title = (fullTorrentTitle || '').toLowerCase();
        // try direct compiled map
        for (var i = 0; i < qualityMapCompiled.length; i++) {
            var item = qualityMapCompiled[i];
            if (item.key.length > 0 && title.indexOf(item.key) !== -1) {
                return item.display;
            }
        }
        // fallback: check resolution and common tokens
        var resMatch = title.match(/(\b2160p\b|\b4k\b|\b4\s*к\b|\b1080p\b|\b720p\b|\b480p\b)/);
        if (resMatch) {
            var r = resMatch[0].replace(/\s+/g,'').toLowerCase();
            if (QUALITY_DISPLAY_MAP[r]) return QUALITY_DISPLAY_MAP[r];
            if (/\b2160p\b|\b4k\b|\b4к\b/.test(r)) return '4K';
            if (/\b1080p\b/.test(r)) return '1080p';
            if (/\b720p\b/.test(r)) return '720p';
            if (/\b480p\b/.test(r)) return 'SD';
        }
        if (qualityCode) {
            var qc = String(qualityCode).toLowerCase();
            return QUALITY_DISPLAY_MAP[qc] || qualityCode;
        }
        return '';
    }

    // ===== fetchWithProxy with AbortController and queueing =====
    var proxyQueue = [];
    var activeProxyFetches = 0;

    function runNextProxyTask() {
        if (!proxyQueue.length || activeProxyFetches >= LQE_CONFIG.PROXY_FETCH_CONCURRENCY) return;
        activeProxyFetches++;
        var task = proxyQueue.shift();
        (function(task){
            var finished = false;
            var controller = new AbortController();
            var signal = controller.signal;
            var timeoutId = setTimeout(function(){
                controller.abort();
            }, LQE_CONFIG.PROXY_TIMEOUT_MS);

            fetch(task.url, { signal: signal }).then(function(response){
                clearTimeout(timeoutId);
                if (finished) return;
                finished = true;
                if (!response.ok) throw new Error('Proxy response ' + response.status);
                return response.text();
            }).then(function(text){
                activeProxyFetches--;
                task.resolve(null, text);
                runNextProxyTask();
            }).catch(function(err){
                activeProxyFetches--;
                task.reject(err);
                runNextProxyTask();
            });
        })(task);
    }

    function fetchWithProxy(url, cardId, callback) {
        // Build array of proxied URLs
        var attempts = LQE_CONFIG.PROXY_LIST.map(function(p){ return p + encodeURIComponent(url); });
        var tried = 0;
        function attemptNext() {
            if (tried >= attempts.length) {
                callback(new Error('All proxies failed for ' + url));
                return;
            }
            var proxyUrl = attempts[tried++];
            // wrap in promise-style task that queue runner will execute
            var taskPromise = new Promise(function(resolve, reject){
                proxyQueue.push({
                    url: proxyUrl,
                    resolve: resolve,
                    reject: reject
                });
                runNextProxyTask();
            });
            taskPromise.then(function(_, text){ callback(null, text); }, function(err){
                // if failed, try next proxy
                attemptNext();
            });
        }
        attemptNext();
    }

    // ===== loading animation helpers (reuse rateLine) =====
    function addLoadingAnimation(cardId, rateLine) {
        if (!rateLine || $('.loading-dots-container', rateLine).length) return;
        rateLine.append('<div class="loading-dots-container"><div class="loading-dots"><span class="loading-dots__text">Загрузка...</span><span class="loading-dots__dot"></span><span class="loading-dots__dot"></span><span class="loading-dots__dot"></span></div></div>');
        $('.loading-dots-container', rateLine).css({'opacity':'1','visibility':'visible'});
    }
    function removeLoadingAnimation(cardId, rateLine) {
        if (!rateLine) return;
        $('.loading-dots-container', rateLine).remove();
    }

    // ===== Full card UI update helpers (reuse DOM nodes) =====
    function clearFullCardQualityElements(rateLine) {
        if (!rateLine) return;
        $('.full-start__status.lqe-quality', rateLine).remove();
    }
    function showFullCardQualityPlaceholder(rateLine) {
        if (!rateLine) return;
        if (!$('.full-start__status.lqe-quality', rateLine).length) {
            var placeholder = document.createElement('div');
            placeholder.className = 'full-start__status lqe-quality';
            placeholder.textContent = 'Загрузка...';
            placeholder.style.opacity = '0.7';
            rateLine.append(placeholder);
        }
    }
    function updateFullCardQualityElement(qualityCode, fullTorrentTitle, cardId, rateLine, bypassTranslation) {
        if (!rateLine) return;
        var element = $('.full-start__status.lqe-quality', rateLine);
        var displayQuality = bypassTranslation ? fullTorrentTitle : translateQualityLabel(qualityCode, fullTorrentTitle);
        if (element.length) {
            element.text(displayQuality).css('opacity','1');
        } else {
            var div = document.createElement('div');
            div.className = 'full-start__status lqe-quality';
            div.textContent = displayQuality;
            rateLine.append(div);
        }
    }

    // ===== Get best release from JacRed (uses fetchWithProxy) =====
    function getBestReleaseFromJacred(normalizedCard, cardId, callback) {
        if (!LQE_CONFIG.JACRED_URL) { callback(null); return; }
        var year = (normalizedCard.release_date || '').substring(0,4);
        if (!year || isNaN(year)) { callback(null); return; }

        compileQualityMap();

        var strategies = [];
        if (normalizedCard.original_title) strategies.push({ title: normalizedCard.original_title.trim(), year: year, exact: true, name: 'OriginalTitle Exact Year' });
        if (normalizedCard.title) strategies.push({ title: normalizedCard.title.trim(), year: year, exact: true, name: 'Title Exact Year' });

        var idx = 0;
        function nextStrategy() {
            if (idx >= strategies.length) { callback(null); return; }
            var s = strategies[idx++];
            var userId = Lampa.Storage.get('lampac_unic_id', '');
            var apiUrl = LQE_CONFIG.JACRED_PROTOCOL + LQE_CONFIG.JACRED_URL + '/api/v1.0/torrents?search=' + encodeURIComponent(s.title) + '&year=' + s.year + '&uid=' + userId + (s.exact ? '&exact=true' : '');
            fetchWithProxy(apiUrl, cardId, function(err, responseText) {
                if (err || !responseText) { nextStrategy(); return; }
                try {
                    var torrents = JSON.parse(responseText);
                    if (!Array.isArray(torrents) || torrents.length === 0) { nextStrategy(); return; }
                    var bestNumericQuality = -1;
                    var bestFoundTorrent = null;
                    for (var i=0;i<torrents.length;i++){
                        var t = torrents[i];
                        var numQ = t.quality || 0;
                        // try to extract quality from title if missing
                        if (!numQ) {
                            var tit = (t.title || '').toLowerCase();
                            if (/2160p|4k/.test(tit)) numQ = 2160;
                            else if (/1080p/.test(tit)) numQ = 1080;
                            else if (/720p/.test(tit)) numQ = 720;
                            else if (/480p/.test(tit)) numQ = 480;
                        }
                        if (!numQ) continue;
                        var torrentYear = t.relased || 0;
                        if (torrentYear && String(torrentYear) !== String(s.year)) continue; // insist on same year
                        if (numQ > bestNumericQuality) { bestNumericQuality = numQ; bestFoundTorrent = t; }
                        else if (numQ === bestNumericQuality && bestFoundTorrent && (t.title || '').length > (bestFoundTorrent.title || '').length) {
                            bestFoundTorrent = t;
                        }
                    }
                    if (bestFoundTorrent) {
                        callback({ quality: bestFoundTorrent.quality || bestNumericQuality, full_label: bestFoundTorrent.title });
                    } else nextStrategy();
                } catch(e){
                    nextStrategy();
                }
            });
        }
        nextStrategy();
    }

    // ===== processFullCardQuality (reduced DOM lookups) =====
    function processFullCardQuality(cardData, renderElement) {
        if (!renderElement) return;
        var cardId = cardData.id;
        log('Processing full card', cardId);
        var normalizedCard = {
            id: cardData.id,
            title: cardData.title || cardData.name || '',
            original_title: cardData.original_title || cardData.original_name || '',
            type: getCardType(cardData),
            release_date: cardData.release_date || cardData.first_air_date || ''
        };
        var rateLine = $('.full-start-new__rate-line', renderElement);
        if (rateLine.length) {
            rateLine.css('visibility','hidden').addClass('done');
            addLoadingAnimation(cardId, rateLine);
        }

        var isTvSeries = (normalizedCard.type === 'tv' || normalizedCard.name);
        var cacheKey = LQE_CONFIG.CACHE_VERSION + '_' + (isTvSeries ? 'tv_' : 'movie_') + normalizedCard.id;

        // manual overrides
        var manual = LQE_CONFIG.MANUAL_OVERRIDES[cardId];
        if (manual) {
            updateFullCardQualityElement(null, manual.full_label, cardId, rateLine, true);
            removeLoadingAnimation(cardId, rateLine);
            rateLine.css('visibility','visible');
            return;
        }

        var cached = getQualityCache(cacheKey);
        if (!(isTvSeries && LQE_CONFIG.SHOW_QUALITY_FOR_TV_SERIES === false)) {
            if (cached) {
                updateFullCardQualityElement(cached.quality_code, cached.full_label, cardId, rateLine);
                if (Date.now() - cached.timestamp > LQE_CONFIG.CACHE_REFRESH_THRESHOLD_MS) {
                    // background refresh
                    getBestReleaseFromJacred(normalizedCard, cardId, function(jrResult) {
                        if (jrResult && jrResult.quality) {
                            saveQualityCache(cacheKey, { quality_code: jrResult.quality, full_label: jrResult.full_label });
                            updateFullCardQualityElement(jrResult.quality, jrResult.full_label, cardId, rateLine);
                        }
                    });
                }
                removeLoadingAnimation(cardId, rateLine);
                rateLine.css('visibility','visible');
            } else {
                clearFullCardQualityElements(rateLine);
                showFullCardQualityPlaceholder(rateLine);
                getBestReleaseFromJacred(normalizedCard, cardId, function(jrResult){
                    var qualityCode = (jrResult && jrResult.quality) || null;
                    var fullTorrentTitle = (jrResult && jrResult.full_label) || null;
                    if (qualityCode) {
                        saveQualityCache(cacheKey, { quality_code: qualityCode, full_label: fullTorrentTitle });
                        updateFullCardQualityElement(qualityCode, fullTorrentTitle, cardId, rateLine);
                    } else {
                        clearFullCardQualityElements(rateLine);
                    }
                    removeLoadingAnimation(cardId, rateLine);
                    rateLine.css('visibility','visible');
                });
            }
        } else {
            clearFullCardQualityElements(rateLine);
            removeLoadingAnimation(cardId, rateLine);
            rateLine.css('visibility','visible');
        }
    }

    // ===== card list update logic (reduced DOM calls) =====
    function updateCardListQualityElement(cardView, qualityCode, fullTorrentTitle, bypassTranslation) {
        var displayQuality = bypassTranslation ? fullTorrentTitle : translateQualityLabel(qualityCode, fullTorrentTitle);
        // remove old
        var existing = cardView.getElementsByClassName('card__quality');
        while (existing.length) existing[0].parentNode.removeChild(existing[0]);
        var qualityDiv = document.createElement('div');
        qualityDiv.className = 'card__quality';
        var inner = document.createElement('div');
        inner.textContent = displayQuality;
        qualityDiv.appendChild(inner);
        cardView.appendChild(qualityDiv);
    }

    function updateCardListQuality(cardElement) {
        if (cardElement.hasAttribute('data-lqe-quality-processed')) return;
        var cardView = cardElement.querySelector('.card__view');
        var cardData = cardElement.card_data;
        if (!cardData || !cardView) return;
        var isTvSeries = (getCardType(cardData) === 'tv');
        if (isTvSeries && LQE_CONFIG.SHOW_QUALITY_FOR_TV_SERIES === false) return;
        var normalizedCard = {
            id: cardData.id || '',
            title: cardData.title || cardData.name || '',
            original_title: cardData.original_title || cardData.original_name || '',
            type: getCardType(cardData),
            release_date: cardData.release_date || cardData.first_air_date || ''
        };
        var cacheKey = LQE_CONFIG.CACHE_VERSION + '_' + normalizedCard.type + '_' + normalizedCard.id;
        cardElement.setAttribute('data-lqe-quality-processed','true');

        var manual = LQE_CONFIG.MANUAL_OVERRIDES[normalizedCard.id];
        if (manual) {
            updateCardListQualityElement(cardView, null, manual.full_label, true);
            return;
        }
        var cached = getQualityCache(cacheKey);
        if (cached) {
            updateCardListQualityElement(cardView, cached.quality_code, cached.full_label);
            if (Date.now() - cached.timestamp > LQE_CONFIG.CACHE_REFRESH_THRESHOLD_MS) {
                getBestReleaseFromJacred(normalizedCard, normalizedCard.id, function(jrResult){
                    if (jrResult && jrResult.quality) {
                        saveQualityCache(cacheKey, { quality_code: jrResult.quality, full_label: jrResult.full_label });
                        if (document.body.contains(cardElement)) updateCardListQualityElement(cardView, jrResult.quality, jrResult.full_label);
                    }
                });
            }
            return;
        }

        getBestReleaseFromJacred(normalizedCard, normalizedCard.id, function(jrResult){
            if (!document.body.contains(cardElement)) return;
            var qualityCode = (jrResult && jrResult.quality) || null;
            var fullTorrentTitle = (jrResult && jrResult.full_label) || null;
            if (qualityCode) {
                saveQualityCache(cacheKey, { quality_code: qualityCode, full_label: fullTorrentTitle });
                updateCardListQualityElement(cardView, qualityCode, fullTorrentTitle);
            }
        });
    }

    // ===== MutationObserver (batch new cards processing) =====
    var observer = new MutationObserver(function(mutations){
        var newCards = [];
        for (var m=0;m<mutations.length;m++){
            var mutation = mutations[m];
            if (mutation.addedNodes) {
                for (var j=0;j<mutation.addedNodes.length;j++){
                    var node = mutation.addedNodes[j];
                    if (node.nodeType !== 1) continue;
                    if (node.classList && node.classList.contains('card')) newCards.push(node);
                    var nested = node.querySelectorAll && node.querySelectorAll('.card');
                    if (nested && nested.length) {
                        for (var k=0;k<nested.length;k++) newCards.push(nested[k]);
                    }
                }
            }
        }
        if (newCards.length) {
            // process in microtask to avoid blocking
            setTimeout(function(){ newCards.forEach(updateCardListQuality); }, 0);
        }
    });

    // ===== Initialization =====
    function initializeLampaQualityPlugin() {
        if (window.lampaQualityPlugin) return;
        log('Initializing Lampa Quality Enhancer');
        window.lampaQualityPlugin = true;
        observer.observe(document.body, { childList: true, subtree: true });
        Lampa.Listener.follow('full', function(event){
            if (event.type == 'complite') {
                var renderElement = event.object.activity.render();
                processFullCardQuality(event.data.movie, renderElement);
            }
        });
    }

    // start plugin
    initializeLampaQualityPlugin();

})();

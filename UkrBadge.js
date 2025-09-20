/* UkrBadge.js v2
   Покращена версія з інтеграцією Jacred API
*/

(function (){
    'use strict';

    var CONFIG = {
        MAX_PARALLEL_REQUESTS: 8,
        CACHE_VALID_TIME_MS: 24 * 60 * 60 * 1000,
        CACHE_KEY: 'ukr_badge_cache_v2',
        JACRED_PROTOCOL: 'http://',
        JACRED_URL: 'jacred.xyz',
        PROXY_LIST: [
            'http://api.allorigins.win/raw?url=',
            'http://cors.bwa.workers.dev/'
        ],
        PROXY_TIMEOUT_MS: 5000,
        ENABLE_FADE_IN: true,
        LOGGING: false,
        BADGE_STYLE: {
            position: 'absolute',
            bottom: '32px',
            left: '6px',
            zIndex: '9999',
            padding: '3px 6px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #ffa800, #ff5e00)',
            color: '#fff'
        }
    };

    function now() { return Date.now(); }

    /* ---------------- Черга ---------------- */
    var requestQueue = [];
    var activeRequests = 0;

    function enqueueTask(fn) {
        requestQueue.push(fn);
        processQueue();
    }

    function processQueue() {
        if (activeRequests >= CONFIG.MAX_PARALLEL_REQUESTS || requestQueue.length === 0) return;
        
        var task = requestQueue.shift();
        activeRequests++;
        
        task(function() {
            activeRequests--;
            setTimeout(processQueue, 0);
        });
    }

    /* ---------------- Кеш ---------------- */
    function cacheLoad() {
        try {
            return Lampa.Storage.get(CONFIG.CACHE_KEY) || {};
        } catch (e) { return {}; }
    }

    function cacheSave(obj) {
        try {
            Lampa.Storage.set(CONFIG.CACHE_KEY, obj);
        } catch (e) {}
    }

    function isItemStale(item) {
        return !item || (now() - (item.timestamp || 0)) > CONFIG.CACHE_VALID_TIME_MS;
    }

    /* ---------------- Network Helper ---------------- */
    function fetchWithProxy(url, callback) {
        var currentProxyIndex = 0;
        var callbackCalled = false;

        function tryNextProxy() {
            if (currentProxyIndex >= CONFIG.PROXY_LIST.length) {
                if (!callbackCalled) {
                    callback(new Error('All proxies failed'));
                    callbackCalled = true;
                }
                return;
            }

            var proxyUrl = CONFIG.PROXY_LIST[currentProxyIndex] + encodeURIComponent(url);
            var timeoutId = setTimeout(function() {
                if (!callbackCalled) {
                    currentProxyIndex++;
                    tryNextProxy();
                }
            }, CONFIG.PROXY_TIMEOUT_MS);

            fetch(proxyUrl)
                .then(function(response) {
                    clearTimeout(timeoutId);
                    if (!response.ok) throw new Error('Proxy error: ' + response.status);
                    return response.text();
                })
                .then(function(data) {
                    if (!callbackCalled) {
                        callbackCalled = true;
                        callback(null, data);
                    }
                })
                .catch(function(error) {
                    clearTimeout(timeoutId);
                    if (!callbackCalled) {
                        currentProxyIndex++;
                        tryNextProxy();
                    }
                });
        }
        
        tryNextProxy();
    }

    /* ---------------- Перевірка Ukr ---------------- */
    function checkHasUkrInAnyTorrent(torrents) {
        if (!torrents || !Array.isArray(torrents)) return false;

        for (var i = 0; i < torrents.length; i++) {
            var title = (torrents[i].title || '').toLowerCase();

            // Ігноруємо субтитри
            if (/sub[^a-z0-9]*ukr/i.test(title) || /subs[^a-z0-9]*ukr/i.test(title)) {
                continue;
            }

            // Перевірка на Ukr доріжку (Ukr/Eng, 2xUkr/, 3xUkr/ тощо)
            if (/(\d+x)?\s*ukr\//i.test(title)) {
                if (CONFIG.LOGGING) console.log("UKR-BADGE", "Ukr track detected in:", torrents[i].title);
                return true;
            }
        }
        return false;
    }

    /* ---------------- Jacred Search ---------------- */
    function searchJacredApi(searchTitle, searchYear, cardId, callback) {
        var userId = Lampa.Storage.get('lampac_unic_id', '');
        var apiUrl = CONFIG.JACRED_PROTOCOL + CONFIG.JACRED_URL + '/api/v1.0/torrents?search=' +
            encodeURIComponent(searchTitle) +
            '&year=' + searchYear +
            '&uid=' + userId;

        if (CONFIG.LOGGING) console.log("UKR-BADGE", "Searching Jacred for:", searchTitle, searchYear);

        var timeoutId = setTimeout(function() {
            callback(null);
        }, CONFIG.PROXY_TIMEOUT_MS * CONFIG.PROXY_LIST.length + 1000);

        fetchWithProxy(apiUrl, function(error, responseText) {
            clearTimeout(timeoutId);
            if (error) {
                if (CONFIG.LOGGING) console.log("UKR-BADGE", "Fetch error:", error);
                callback(null);
                return;
            }

            try {
                var torrents = JSON.parse(responseText);
                callback(Array.isArray(torrents) ? torrents : []);
            } catch (e) {
                if (CONFIG.LOGGING) console.log("UKR-BADGE", "Parse error:", e);
                callback([]);
            }
        });
    }

    /* ---------------- Рендер бейджа ---------------- */
    function renderUkrBadge(cardElement) {
        if (!cardElement) return;
        
        // Видаляємо існуючі бейджи
        var existing = cardElement.querySelector('.ukr-badge');
        if (existing) existing.remove();

        var badge = document.createElement('div');
        badge.className = 'ukr-badge';
        badge.textContent = 'Ukr';
        
        // Застосовуємо стилі
        for (var prop in CONFIG.BADGE_STYLE) {
            badge.style[prop] = CONFIG.BADGE_STYLE[prop];
        }

        if (CONFIG.ENABLE_FADE_IN) {
            badge.style.opacity = '0';
            badge.style.transition = 'opacity .28s ease';
            setTimeout(function(){ badge.style.opacity = '1'; }, 30);
        }
        
        cardElement.appendChild(badge);
    }

    /* ---------------- Обробка картки ---------------- */
    function processCard(cardElement, cardData) {
        if (!cardElement || !cardData) return;
        
        var cardId = cardData.id;
        if (!cardId) return;
        
        // Перевіряємо, чи це картка з даними
        if (!cardData.title && !cardData.name) return;
        
        var cache = cacheLoad();
        var cacheKey = 'card_' + cardId;
        var cached = cache[cacheKey];

        // Перевіряємо кеш
        if (cached && !isItemStale(cached)) {
            if (cached.hasUkr) renderUkrBadge(cardElement);
            return;
        }

        // Готуємо дані для пошуку
        var title = cardData.title || cardData.name || '';
        var originalTitle = cardData.original_title || cardData.original_name || '';
        var releaseDate = cardData.release_date || cardData.first_air_date || '';
        var year = releaseDate.substring(0, 4) || '';

        if (!year || isNaN(year)) {
            if (CONFIG.LOGGING) console.log("UKR-BADGE", "No valid year for card:", cardId);
            return;
        }

        enqueueTask(function(done){
            // Спочатку шукаємо по оригінальній назві
            searchJacredApi(originalTitle, year, cardId, function(torrentsOriginal) {
                // Потім по локалізованій назві
                searchJacredApi(title, year, cardId, function(torrentsLocalized) {
                    var allTorrents = [];
                    
                    // Об'єднуємо результати
                    if (Array.isArray(torrentsOriginal)) {
                        allTorrents = allTorrents.concat(torrentsOriginal);
                    }
                    if (Array.isArray(torrentsLocalized)) {
                        allTorrents = allTorrents.concat(torrentsLocalized);
                    }

                    // Видаляємо дублікати
                    var uniqueTorrents = [];
                    var seenTitles = {};
                    
                    allTorrents.forEach(function(torrent) {
                        if (torrent.title && !seenTitles[torrent.title]) {
                            seenTitles[torrent.title] = true;
                            uniqueTorrents.push(torrent);
                        }
                    });

                    var hasUkr = checkHasUkrInAnyTorrent(uniqueTorrents);
                    
                    // Оновлюємо кеш
                    cache[cacheKey] = {
                        hasUkr: hasUkr,
                        timestamp: now()
                    };
                    cacheSave(cache);

                    // Відображаємо бейдж
                    if (hasUkr) {
                        renderUkrBadge(cardElement);
                    }

                    done();
                });
            });
        });
    }

    /* ---------------- Mutation Observer ---------------- */
    function attachObserver() {
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes) {
                    Array.from(mutation.addedNodes).forEach(function(node) {
                        if (node.nodeType === 1 && node.classList && 
                            (node.classList.contains('card') || node.querySelector('.card'))) {
                            
                            var cards = node.classList.contains('card') ? [node] : node.querySelectorAll('.card');
                            cards.forEach(function(card) {
                                if (card.card_data && !card.hasAttribute('data-ukr-processed')) {
                                    card.setAttribute('data-ukr-processed', 'true');
                                    processCard(card, card.card_data);
                                }
                            });
                        }
                    });
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    /* ---------------- Скан існуючих карток ---------------- */
    function scanExistingCards() {
        var cards = document.querySelectorAll('.card');
        cards.forEach(function(card) {
            if (card.card_data && !card.hasAttribute('data-ukr-processed')) {
                card.setAttribute('data-ukr-processed', 'true');
                processCard(card, card.card_data);
            }
        });
    }

    /* ---------------- Ініціалізація ---------------- */
    function init() {
        setTimeout(function() {
            scanExistingCards();
            attachObserver();
            
            // Також обробляємо повні картки
            Lampa.Listener.follow('full', function(event) {
                if (event.type === 'complite' && event.data && event.data.movie) {
                    var renderElement = event.object.activity.render();
                    if (renderElement) {
                        var cardElement = renderElement.querySelector('.card');
                        if (cardElement) {
                            processCard(cardElement, event.data.movie);
                        }
                    }
                }
            });
        }, 1000);
    }

    // Запускаємо ініціалізацію
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

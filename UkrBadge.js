/* UkrBadge.js
   Окремий плагін для Lampa
   Додає бейдж (Ukr) на картках, якщо є українська доріжка у релізах
   - Використовує Jacred для пошуку
   - Має кешування (24 год)
   - Lite-черга запитів
   - Бейдж з тими ж стилями, що і в Quality++
   - Розташування: нижній лівий кут картки, вище бейджа якості
*/

(function (){
    'use strict';

    var CONFIG = {
        MAX_PARALLEL_REQUESTS: 8,
        CACHE_VALID_TIME_MS: 24 * 60 * 60 * 1000, // 24 години
        CACHE_KEY: 'ukr_badge_cache_v1',
        ENABLE_FADE_IN: true,
        LOGGING: false
    };

    function now() { return (new Date()).getTime(); }

    /* ---------------- Черга ---------------- */
    var requestQueue = [];
    var activeRequests = 0;

    function enqueueTask(fn) {
        requestQueue.push(fn);
        processQueue();
    }

    function processQueue() {
        if (activeRequests >= CONFIG.MAX_PARALLEL_REQUESTS) return;
        var task = requestQueue.shift();
        if (!task) return;
        activeRequests++;
        try {
            task(function done() {
                activeRequests--;
                setTimeout(processQueue, 0);
            });
        } catch (e) {
            activeRequests--;
            setTimeout(processQueue, 0);
        }
    }

    /* ---------------- Кеш ---------------- */
    function cacheLoad() {
        try {
            var raw = Lampa.Storage.get(CONFIG.CACHE_KEY) || '{}';
            return JSON.parse(raw);
        } catch (e) { return {}; }
    }
    function cacheSave(obj) {
        try {
            Lampa.Storage.set(CONFIG.CACHE_KEY, JSON.stringify(obj));
        } catch (e) {}
    }
    function isItemStale(item) {
        if (!item || !item._ts) return true;
        return (now() - item._ts) > CONFIG.CACHE_VALID_TIME_MS;
    }

    /* ---------------- Перевірка Ukr ---------------- */
    function checkHasUkrInAnyTorrent(torrents) {
        if (!torrents || !Array.isArray(torrents)) return false;

        for (var i = 0; i < torrents.length; i++) {
            var title = (torrents[i].title || '').toLowerCase();

            // 1. Ігноруємо субтитри
            if (/sub[^a-z0-9]*ukr/i.test(title) || /subs[^a-z0-9]*ukr/i.test(title)) {
                continue;
            }

            // 2. Перевірка на Ukr доріжку (Ukr/Eng або 2xUkr/...)
            if (/\bukr\//i.test(title) || /\d+x\s*ukr\//i.test(title)) {
                if (CONFIG.LOGGING) console.log("UKR-BADGE", "Ukr track detected in:", torrents[i].title);
                return true;
            }
        }
        return false;
    }

    /* ---------------- Jacred ---------------- */
    function getFromJacred(query, callback) {
        var params = {query: query};
        Lampa.Api.search(params, function (result) {
            callback(result && result.list ? result.list : result || []);
        }, function (err) {
            callback([]);
        });
    }

    /* ---------------- Рендер бейджа ---------------- */
    function renderUkrBadge(cardElement) {
        if (!cardElement) return;
        var existing = cardElement.querySelector('.ukr-badge');
        if (existing) existing.remove();

        var badge = document.createElement('div');
        badge.className = 'ukr-badge';
        badge.textContent = 'Ukr';
        badge.style.cssText = 'position:absolute; bottom:32px; left:6px; z-index:9999; padding:3px 6px; border-radius:6px; font-size:12px; font-weight:700; background:linear-gradient(135deg, #ffa800, #ff5e00); color:#fff;';

        if (CONFIG.ENABLE_FADE_IN) {
            badge.style.opacity = 0;
            badge.style.transition = 'opacity .28s ease';
            setTimeout(function(){ badge.style.opacity = 1; }, 30);
        }
        cardElement.appendChild(badge);
    }

    /* ---------------- Обробка картки ---------------- */
    function processCard(cardElement, movieMeta) {
        if (!cardElement || !movieMeta) return;
        var engTitle = movieMeta.title || '';
        var localTitle = movieMeta.title_local || '';

        var cache = cacheLoad();
        var cacheKey = (engTitle || localTitle || '').toLowerCase();
        var cached = cache[cacheKey];

        if (cached && !isItemStale(cached)) {
            if (cached.hasUkr) renderUkrBadge(cardElement);
            return;
        }

        enqueueTask(function(done){
            getFromJacred(engTitle, function(releasesEng){
                getFromJacred(localTitle, function(releasesLocal){
                    var all = [];
                    function merge(list){ if(list) list.forEach(function(r){ if(r && r.title && !all.some(function(x){return x.title===r.title;})) all.push(r); }); }
                    merge(releasesEng); merge(releasesLocal);

                    var hasUkr = checkHasUkrInAnyTorrent(all);
                    var item = {_ts: now(), hasUkr: hasUkr};
                    cache[cacheKey] = item;
                    cacheSave(cache);

                    if (hasUkr) renderUkrBadge(cardElement);
                    done();
                });
            });
        });
    }

    /* ---------------- Метадані з картки ---------------- */
    function extractMetaFromCard(card) {
        if (!card) return null;
        var titleEl = card.querySelector('.title, .card-title, .movie-title');
        var localEl = card.querySelector('.local-title, .original-title');
        if (!titleEl) return null;
        return {
            title: titleEl.textContent.trim(),
            title_local: localEl ? localEl.textContent.trim() : ''
        };
    }

    /* ---------------- Observer ---------------- */
    function attachObserver() {
        var container = document.querySelector('.content, .card-list, .cards, #app');
        if (!container) return;

        var observer = new MutationObserver(function(mutations){
            mutations.forEach(function(m){
                var added = m.addedNodes;
                if (!added || !added.length) return;
                for (var i = 0; i < added.length; i++) {
                    var node = added[i];
                    if (!(node instanceof Element)) continue;
                    var cards = node.querySelectorAll ? node.querySelectorAll('.card, .card-item, .movie-card') : [];
                    for (var c = 0; c < cards.length; c++) {
                        var meta = extractMetaFromCard(cards[c]);
                        if (meta) processCard(cards[c], meta);
                    }
                }
            });
        });
        observer.observe(container, { childList: true, subtree: true });
    }

    /* ---------------- Scan існуючих ---------------- */
    function scanExistingCards() {
        var cards = document.querySelectorAll('.card, .card-item, .movie-card');
        for (var i = 0; i < cards.length; i++) {
            var meta = extractMetaFromCard(cards[i]);
            if (meta) processCard(cards[i], meta);
        }
    }

    function init() {
        try {
            scanExistingCards();
            attachObserver();
        } catch (e) {}
    }

    setTimeout(init, 800);

})();
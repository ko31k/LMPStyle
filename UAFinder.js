/**
 * Lampa Track Finder v2.3
 * --------------------------------------------------------------------------------
 * Цей плагін призначений для пошуку та відображення інформації про наявність
 * українських аудіодоріжок у релізах, доступних через Jacred API.
 * --------------------------------------------------------------------------------
 * Основні можливості:
 * - Шукає згадки українських доріжок (Ukr, 2xUkr і т.д.) у назвах торрентів.
 * - Ігнорує українські субтитри, аналізуючи лише частину назви до слова "sub".
 * - Виконує паралельний пошук за оригінальною та локалізованою назвою для максимального охоплення.
 * - Обирає реліз з найбільшою кількістю знайдених українських доріжок.
 * - Для серіалів відфільтровує релізи, що не містять ознак сезону.
 * - Для фільмів відфільтровує релізи, що містять ознаки сезону.
 * - Оптимізована обробка карток для уникнення пропусків та підвищення продуктивності.
 * - Відображає стильну мітку на постерах, яка динамічно адаптується до присутності плагіна RatingUp.
 * - Має систему кешування для зменшення навантаження та пришвидшення роботи.
 * - Не виконує пошук для майбутніх релізів або релізів з невідомою датою.
 * --------------------------------------------------------------------------------
 */
(function() {
    'use strict'; // Використовуємо суворий режим для кращої якості коду та запобігання помилок.

    // ===================== КОНФІГУРАЦІЯ ПЛАГІНА (LTF - Lampa Track Finder) =====================
    var LTF_CONFIG = {
        // --- Налаштування кешу ---
        CACHE_VERSION: 5, // Оновлено версію кешу через зміну логіки
        CACHE_KEY: 'lampa_ukr_tracks_cache', // Унікальний ключ для зберігання кешу в LocalStorage.
        CACHE_VALID_TIME_MS: 12 * 60 * 60 * 1000, // Час життя кешу (12 годин).
        CACHE_REFRESH_THRESHOLD_MS: 6 * 60 * 60 * 1000, // Через скільки часу кеш потребує фонового оновлення (6 годин).

        // --- Налаштування логування для налагодження ---
        LOGGING_GENERAL: false, // Загальні логі роботи плагіна.
        LOGGING_TRACKS: false, // Логи, що стосуються процесу пошуку та підрахунку доріжок.
        LOGGING_CARDLIST: false, // Логи для відстеження обробки карток у списках.

        // --- Налаштування API та мережі ---
        JACRED_PROTOCOL: 'http://', // Протокол для API JacRed.
        JACRED_URL: 'jacred.xyz', // Домен API JacRed.
        PROXY_LIST: [ // Список проксі-серверів для обходу CORS-обмежень.
            'http://api.allorigins.win/raw?url=',
            'http://cors.bwa.workers.dev/'
        ],
        PROXY_TIMEOUT_MS: 4000, // Максимальний час очікування відповіді від одного проксі (4 секунди).
        MAX_PARALLEL_REQUESTS: 16, // Максимальна кількість одночасних запитів до Jacred.

        // --- Налаштування функціоналу ---
        SHOW_TRACKS_FOR_TV_SERIES: true, // Чи показувати мітки для серіалів (true або false)
    };

    // ===================== СТИЛІ CSS =====================
    var styleTracks = "<style id=\"lampa_tracks_styles\">" +
        ".card__view { position: relative; }" +
        ".card__tracks {" +
        " position: absolute !important; " +
        " right: 0.3em !important; " +
        " top: 0.3em !important; " +
        " background: rgba(0,0,0,0.5) !important;" +
        " color: #FFFFFF !important;" +
        " font-size: 1.3em !important;" +
        " padding: 0.2em 0.5em !important;" +
        " border-radius: 1em !important;" +
        " font-weight: 700 !important;" +
        " z-index: 2 !important;" +
        "}" +
        ".card__tracks.positioned-below-rating {" +
        " top: 2.15em !important; " +
        "}" +
        ".card__tracks div {" +
        " font-family: 'Roboto Condensed', 'Arial Narrow', Arial, sans-serif; font-weight: 700; letter-spacing: 0.1px; font-size: 1em; color: #FFFFFF; padding: 0; white-space: nowrap; text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.3);" +
        "}" +
        "</style>";
    Lampa.Template.add('lampa_tracks_css', styleTracks);
    $('body').append(Lampa.Template.get('lampa_tracks_css', {}, true));

    // ===================== УПРАВЛІННЯ ЧЕРГОЮ ЗАПИТІВ =====================
    var requestQueue = []; 
    var activeRequests = 0; 

    function enqueueTask(fn) {
        requestQueue.push(fn); 
        processQueue(); 
    }

    function processQueue() {
        if (activeRequests >= LTF_CONFIG.MAX_PARALLEL_REQUESTS) return; 
        var task = requestQueue.shift(); 
        if (!task) return; 

        activeRequests++; 
        try {
            task(function onTaskDone() {
                activeRequests--; 
                setTimeout(processQueue, 0); 
            });
        } catch (e) {
            console.error("LTF-LOG", "Помилка виконання завдання з черги:", e);
            activeRequests--; 
            setTimeout(processQueue, 0);
        }
    }

    // ===================== МЕРЕЖЕВІ ФУНКЦІЇ =====================
    function fetchWithProxy(url, cardId, callback) {
        var currentProxyIndex = 0; 
        var callbackCalled = false; 

        function tryNextProxy() {
            if (currentProxyIndex >= LTF_CONFIG.PROXY_LIST.length) {
                if (!callbackCalled) {
                    callbackCalled = true;
                    callback(new Error('Всі проксі не відповіли для ' + url));
                }
                return;
            }
            var proxyUrl = LTF_CONFIG.PROXY_LIST[currentProxyIndex] + encodeURIComponent(url);
            
            var timeoutId = setTimeout(function() {
                if (!callbackCalled) {
                    currentProxyIndex++; 
                    tryNextProxy();
                }
            }, LTF_CONFIG.PROXY_TIMEOUT_MS);

            fetch(proxyUrl)
                .then(function(response) {
                    clearTimeout(timeoutId); 
                    if (!response.ok) throw new Error('Помилка проксі: ' + response.status);
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
    
    // ===================== ДОПОМІЖНІ ФУНКЦІЇ =====================
    function getCardType(cardData) {
        var type = cardData.media_type || cardData.type;
        if (type === 'movie' || type === 'tv') return type;
        return cardData.name || cardData.original_name ? 'tv' : 'movie';
    }

    // ===================== ОСНОВНА ЛОГІКА ПІДРАХУНКУ ДОРІЖОК =====================
    function countUkrainianTracks(title) {
        if (!title) return 0; 
        let cleanTitle = title.toLowerCase(); 
        
        const subsIndex = cleanTitle.indexOf('sub');
        if (subsIndex !== -1) {
            cleanTitle = cleanTitle.substring(0, subsIndex);
        }

        const multiTrackMatch = cleanTitle.match(/(\d+)x\s*ukr/);
        if (multiTrackMatch && multiTrackMatch[1]) {
            return parseInt(multiTrackMatch[1], 10);
        }

        const singleTrackMatches = cleanTitle.match(/\bukr\b/g);
        if (singleTrackMatches) {
            return singleTrackMatches.length;
        }
        return 0;
    }

    function formatTrackLabel(count) {
        if (!count || count === 0) return null; 
        if (count === 1) return "Ukr"; 
        return `${count}xUkr`; 
    }

    // ===================== ПОШУК НА JACRED =====================
    function getBestReleaseWithUkr(normalizedCard, cardId, callback) {
        enqueueTask(function(done) {
            var releaseDate = normalizedCard.release_date ? new Date(normalizedCard.release_date) : null;
            if (releaseDate && releaseDate.getTime() > Date.now()) {
                callback(null);
                done();
                return;
            }

            var year = '';
            if (normalizedCard.release_date && normalizedCard.release_date.length >= 4) {
                year = normalizedCard.release_date.substring(0, 4);
            }
            if (!year || isNaN(parseInt(year, 10))) {
                callback(null);
                done();
                return;
            }
            var searchYearNum = parseInt(year, 10);
            
            function extractYearFromTitle(title) {
                var regex = /(?:^|[^\d])(\d{4})(?:[^\d]|$)/g;
                var match, lastYear = 0;
                var currentYear = new Date().getFullYear();
                while ((match = regex.exec(title)) !== null) {
                    var extractedYear = parseInt(match[1], 10);
                    if (extractedYear >= 1900 && extractedYear <= currentYear + 2) { 
                        lastYear = extractedYear;
                    }
                }
                return lastYear;
            }

            function searchJacredApi(searchTitle, searchYear, apiCallback) {
                var userId = Lampa.Storage.get('lampac_unic_id', '');
                var apiUrl = LTF_CONFIG.JACRED_PROTOCOL + LTF_CONFIG.JACRED_URL + '/api/v1.0/torrents?search=' +
                    encodeURIComponent(searchTitle) +
                    '&year=' + searchYear +
                    '&uid=' + userId;
                
                fetchWithProxy(apiUrl, cardId, function(error, responseText) {
                    if (error || !responseText) {
                        apiCallback(null);
                        return;
                    }
                    try {
                        var torrents = JSON.parse(responseText);
                        if (!Array.isArray(torrents) || torrents.length === 0) {
                            apiCallback(null);
                            return;
                        }

                        let bestTrackCount = 0;
                        let bestFoundTorrent = null;

                        for (let i = 0; i < torrents.length; i++) {
                            const currentTorrent = torrents[i];

                            // Перевірка на серіал
                            if (normalizedCard.type === 'tv') {
                                const tTitle = currentTorrent.title.toLowerCase();
                                if (!/(сезон|season|s\d{1,2}|серии|\d{1,2}\s*из\s*\d{1,2})/.test(tTitle)) {
                                    if (LTF_CONFIG.LOGGING_TRACKS) console.log(`LTF-LOG [${cardId}]: Пропускаємо реліз (схожий на фільм для картки серіалу):`, currentTorrent.title);
                                    continue; 
                                }
                            }
                            
                            // === НОВА ЛОГІКА: Перевірка на фільм ===
                            // Якщо картка, яку ми обробляємо, - це фільм...
                            if (normalizedCard.type === 'movie') {
                                // ...приводимо назву торрента до нижнього регістру...
                                const tTitleMovie = currentTorrent.title.toLowerCase();
                                // ...і перевіряємо, чи є в ній ознаки серіалу.
                                if (/(сезон|season|s\d{1,2}|\d{1,2}\s*из\s*\d{1,2}|серии)/.test(tTitleMovie)) {
                                    // Якщо ознаки є, це, ймовірно, серіал-тезка. Пропускаємо його.
                                    if (LTF_CONFIG.LOGGING_TRACKS) console.log(`LTF-LOG [${cardId}]: Пропускаємо реліз (схожий на серіал для картки фільму):`, currentTorrent.title);
                                    continue; // Перейти до наступного торрента.
                                }
                            }
                            
                            // Сувора перевірка року.
                            var parsedYear = parseInt(currentTorrent.relased, 10) || extractYearFromTitle(currentTorrent.title);
                            var yearDifference = Math.abs(parsedYear - searchYearNum);
                            // ЗА ВАШИМ БАЖАННЯМ: залишено сувору перевірку.
                            if (parsedYear > 1900 && yearDifference > 0) {
                                continue;
                            }
                            
                            const currentTrackCount = countUkrainianTracks(currentTorrent.title);
                            
                            if (currentTrackCount > bestTrackCount) {
                                bestTrackCount = currentTrackCount;
                                bestFoundTorrent = currentTorrent;
                            } else if (currentTrackCount === bestTrackCount && bestTrackCount > 0 && bestFoundTorrent && currentTorrent.title.length > bestFoundTorrent.title.length) {
                                bestFoundTorrent = currentTorrent;
                            }
                        }

                        if (bestFoundTorrent) {
                            apiCallback({
                                track_count: bestTrackCount,
                                full_label: bestFoundTorrent.title
                            });
                        } else {
                            apiCallback(null);
                        }
                    } catch (e) {
                        apiCallback(null);
                    }
                });
            }

            const titlesToSearch = [ normalizedCard.original_title, normalizedCard.title ];
            const uniqueTitles = [...new Set(titlesToSearch)].filter(Boolean);
            if (LTF_CONFIG.LOGGING_TRACKS) console.log('LTF-LOG', `[${cardId}] Запускаємо пошук за назвами:`, uniqueTitles);
            const searchPromises = uniqueTitles.map(title => {
                return new Promise(resolve => {
                    searchJacredApi(title, year, resolve);
                });
            });

            Promise.all(searchPromises).then(results => {
                let bestOverallResult = null;
                let maxTrackCount = 0;
                results.forEach(result => {
                    if (!result || !result.track_count) return;
                    if (result.track_count > maxTrackCount) {
                        maxTrackCount = result.track_count;
                        bestOverallResult = result;
                    }
                });
                if (LTF_CONFIG.LOGGING_TRACKS) console.log('LTF-LOG', `[${cardId}] Найкращий результат з усіх пошуків:`, bestOverallResult);
                callback(bestOverallResult);
                done();
            });
        });
    }

    // ===================== РОБОТА З КЕШЕМ =====================
    function getTracksCache(key) {
        var cache = Lampa.Storage.get(LTF_CONFIG.CACHE_KEY) || {};
        var item = cache[key];
        var isCacheValid = item && (Date.now() - item.timestamp < LTF_CONFIG.CACHE_VALID_TIME_MS);
        return isCacheValid ? item : null;
    }

    function saveTracksCache(key, data) {
        var cache = Lampa.Storage.get(LTF_CONFIG.CACHE_KEY) || {};
        cache[key] = {
            track_count: data.track_count,
            timestamp: Date.now()
        };
        Lampa.Storage.set(LTF_CONFIG.CACHE_KEY, cache);
    }
    
    // ===================== ОНОВЛЕННЯ ІНТЕРФЕЙСУ (UI) =====================
    function updateCardListTracksElement(cardView, trackCount) {
        const displayLabel = formatTrackLabel(trackCount);
        const existingElement = cardView.querySelector('.card__tracks');
        if (existingElement) existingElement.remove();
        if (!displayLabel) return;
        
        const trackDiv = document.createElement('div');
        trackDiv.className = 'card__tracks';

        const parentCard = cardView.closest('.card');
        if (parentCard) {
            const voteElement = parentCard.querySelector('.card__vote');
            if (voteElement && getComputedStyle(voteElement).top !== 'auto' && parseInt(getComputedStyle(voteElement).top) < 100) {
                trackDiv.classList.add('positioned-below-rating');
            }
        }
        
        const innerElement = document.createElement('div');
        innerElement.textContent = displayLabel;
        trackDiv.appendChild(innerElement);
        cardView.appendChild(trackDiv);
    }

    // ===================== ГОЛОВНИЙ ОБРОБНИК КАРТОК =====================
    function processListCard(cardElement) {
        var cardData = cardElement.card_data;
        var cardView = cardElement.querySelector('.card__view');
        if (!cardData || !cardView) return;

        if (cardElement.hasAttribute('data-ltf-tracks-processed')) return;
        
        var isTvSeries = (getCardType(cardData) === 'tv');
        if (isTvSeries && !LTF_CONFIG.SHOW_TRACKS_FOR_TV_SERIES) return;

        var normalizedCard = {
            id: cardData.id || '',
            title: cardData.title || cardData.name || '',
            original_title: cardData.original_title || cardData.original_name || '',
            type: getCardType(cardData),
            release_date: cardData.release_date || cardData.first_air_date || ''
        };
        var cardId = normalizedCard.id;
        var cacheKey = `${LTF_CONFIG.CACHE_VERSION}_${normalizedCard.type}_${cardId}`;
        cardElement.setAttribute('data-ltf-tracks-processed', 'true');

        var cachedData = getTracksCache(cacheKey);
        if (cachedData) {
            updateCardListTracksElement(cardView, cachedData.track_count);
            
            if (Date.now() - cachedData.timestamp > LTF_CONFIG.CACHE_REFRESH_THRESHOLD_MS) {
                getBestReleaseWithUkr(normalizedCard, cardId, function(liveResult) {
                    let trackCount = liveResult ? liveResult.track_count : 0;
                    saveTracksCache(cacheKey, { track_count: trackCount });
                    if (document.body.contains(cardElement)) {
                        updateCardListTracksElement(cardView, trackCount);
                    }
                });
            }
        } else {
            getBestReleaseWithUkr(normalizedCard, cardId, function(liveResult) {
                if (document.body.contains(cardElement)) {
                    let trackCount = liveResult ? liveResult.track_count : 0;
                    saveTracksCache(cacheKey, { track_count: trackCount });
                    updateCardListTracksElement(cardView, trackCount);
                }
            });
        }
    }
    
    // ===================== ІНІЦІАЛІЗАЦІЯ ПЛАГІНА =====================
    // === НОВА ЛОГІКА: Оптимізація обробки карток (дебаунсинг) ===
    var observerDebounceTimer = null; // Таймер для затримки.
    var cardsToProcess = []; // Масив для накопичення нових карток.

    /**
     * Запускає обробку накопичених карток із затримкою.
     */
    function debouncedProcessCards() {
        clearTimeout(observerDebounceTimer); // Скидаємо попередній таймер, якщо він був.
        // Встановлюємо новий таймер. Обробка почнеться через 100 мс після ОСТАННЬОГО виявлення нової картки.
        observerDebounceTimer = setTimeout(function() {
            // Створюємо копію масиву і очищуємо оригінал для наступних накопичень.
            const batch = [...cardsToProcess];
            cardsToProcess = [];
            
            if (LTF_CONFIG.LOGGING_CARDLIST) console.log("LTF-LOG: Обробка пачки з", batch.length, "карток.");

            // Обробляємо кожну картку з накопиченої пачки.
            batch.forEach(card => {
                // Перевіряємо, чи картка все ще існує на сторінці.
                if (card.isConnected) {
                    processListCard(card);
                }
            });
        }, 100); // Затримка в 100 мілісекунд.
    }
    
    // MutationObserver - "око", яке слідкує за появою нових карток на сторінці.
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { 
                        if (node.classList && node.classList.contains('card')) {
                            cardsToProcess.push(node); // Додаємо картку в масив для обробки.
                        }
                        const nestedCards = node.querySelectorAll('.card');
                        if (nestedCards.length) {
                           nestedCards.forEach(card => cardsToProcess.push(card));
                        }
                    }
                });
            }
        });
        
        // Якщо були додані нові картки, запускаємо відкладену обробку.
        if (cardsToProcess.length > 0) {
            debouncedProcessCards();
        }
    });

    /**
     * Головна функція ініціалізації, яка запускає весь механізм.
     */
    function initializeLampaTracksPlugin() {
        if (window.lampaTrackFinderPlugin) return; // Запобігаємо повторній ініціалізації.
        window.lampaTrackFinderPlugin = true;

        var containers = document.querySelectorAll('.cards, .card-list, .content, .main, .cards-list, .preview__list');
        if (containers.length) {
            containers.forEach(container => observer.observe(container, { childList: true, subtree: true }));
        } else {
            observer.observe(document.body, { childList: true, subtree: true });
        }

        if (LTF_CONFIG.LOGGING_GENERAL) console.log("LTF-LOG: Плагін пошуку українських доріжок успішно ініціалізовано!");
    }

    // Запускаємо ініціалізацію, коли сторінка (DOM) буде готова.
    if (document.body) {
        initializeLampaTracksPlugin();
    } else {
        document.addEventListener('DOMContentLoaded', initializeLampaTracksPlugin);
    }
})();

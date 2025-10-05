/**
 * Lampa Track Finder v2.6
 * --------------------------------------------------------------------------------
 * Цей плагін призначений для пошуку та відображення інформації про наявність
 * українських аудіодоріжок у релізах, доступних через Jacred API.
 * --------------------------------------------------------------------------------
 * v2.6 Оновлення та Покращення:
 * - Підвищена надійність: Використовує Lampa.Utils.fetch як основний метод
 * запитів (План А) та старий метод з проксі як резервний (План Б).
 * - Гарантоване охоплення карток: MutationObserver тепер відстежує увесь
 * `document.body`, що виключає пропуски карток у будь-якій версії Lampa.
 * - Оптимізована швидкість: Збільшено кількість паралельних запитів та
 * зменшено затримку обробки для швидшої появи міток.
 * - Гнучке налаштування: Додано параметр для керування допустимою різницею
 * в роках між релізом на картці та в торренті.
 * --------------------------------------------------------------------------------
 */
(function() {
    'use strict'; // Використовуємо суворий режим для кращої якості коду та запобігання помилок.

    // ===================== КОНФІГУРАЦІЯ ПЛАГІНА (LTF - Lampa Track Finder) =====================
    var LTF_CONFIG = {
        // --- Налаштування кешу ---
        CACHE_VERSION: 2.6, // Версія кешу. Змініть, якщо хочете скинути старі збережені дані.
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
        PROXY_LIST: [ // Список проксі-серверів для обходу CORS-обмежень (ПЛАН Б).
            'http://api.allorigins.win/raw?url=',
            'http://cors.bwa.workers.dev/'
        ],
        PROXY_TIMEOUT_MS: 4000, // Максимальний час очікування відповіді (4 секунди).
        MAX_PARALLEL_REQUESTS: 24, // Максимальна кількість одночасних запитів до Jacred (збільшено для швидкості).

        // --- Налаштування функціоналу ---
        YEAR_DIFFERENCE_TOLERANCE: 1, // Допустима різниця в роках (1 = ±1 рік). Збільште для пошуку трилогій/ремастерів.
        SHOW_TRACKS_FOR_TV_SERIES: true, // Чи показувати мітки для серіалів (true або false).
    };

    // ===================== СТИЛІ CSS =====================
    // Цей блок створює та додає на сторінку всі необхідні стилі для відображення міток.
    var styleTracks = "<style id=\"lampa_tracks_styles\">" +
        ".card__view { position: relative; }" +
        ".card__tracks {" +
        " position: absolute !important; " +
        " right: 0.3em !important; " +
        " left: auto !important; " +
        " top: 0.3em !important; " +
        " background: rgba(0,0,0,0.5) !important;" +
        " color: #FFFFFF !important;" +
        " font-size: 1.3em !important;" +
        " padding: 0.2em 0.5em !important;" +
        " border-radius: 1em !important;" +
        " font-weight: 700 !important;" +
        " z-index: 20 !important;" +
        " width: fit-content !important; " +
        " max-width: calc(100% - 1em) !important; " +
        " overflow: hidden !important;" +
        "}" +
        ".card__tracks.positioned-below-rating {" +
        " top: 1.85em !important; " + // Позиція, якщо плагін RatingUp активний.
        "}" +
        ".card__tracks div {" +
        " text-transform: none !important; " +
        " font-family: 'Roboto Condensed', 'Arial Narrow', Arial, sans-serif !important; " +
        " font-weight: 700 !important; " +
        " letter-spacing: 0.1px !important; " +
        " font-size: 1.05em !important; " +
        " color: #FFFFFF !important;" +
        " padding: 0 !important; " +
        " white-space: nowrap !important;" +
        " display: flex !important; " +
        " align-items: center !important; " +
        " gap: 4px !important; " +
        " text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.3) !important; " +
        "}" +
        "</style>";
    // Додаємо стилі в DOM один раз при завантаженні плагіна.
    if (!$('#lampa_tracks_styles').length) {
        $('body').append(styleTracks);
    }

    // ===================== УПРАВЛІННЯ ЧЕРГОЮ ЗАПИТІВ =====================
    // Цей механізм запобігає одночасному відправленню занадто великої кількості запитів, щоб не перевантажувати API.
    var requestQueue = []; // Масив, де зберігаються завдання на пошук.
    var activeRequests = 0; // Лічильник активних запитів.

    /**
     * Додає завдання (функцію пошуку) до черги.
     * @param {function} fn - Функція, яку потрібно виконати.
     */
    function enqueueTask(fn) {
        requestQueue.push(fn); // Додати в кінець черги.
        processQueue(); // Запустити обробку.
    }

    /**
     * Обробляє чергу, запускаючи завдання по одному, з урахуванням ліміту.
     */
    function processQueue() {
        // Не перевищувати ліміт паралельних запитів.
        if (activeRequests >= LTF_CONFIG.MAX_PARALLEL_REQUESTS) return;
        // Взяти перше завдання з черги.
        var task = requestQueue.shift();
        if (!task) return; // Якщо черга порожня, вийти.

        activeRequests++; // Збільшити лічильник активних запитів.
        try {
            // Виконати завдання, передавши йому функцію `done`, яку потрібно викликати по завершенню.
            task(function onTaskDone() {
                activeRequests--; // Зменшити лічильник.
                setTimeout(processQueue, 0); // Запустити обробку наступного завдання асинхронно.
            });
        } catch (e) {
            console.error("LTF-ERROR", "Помилка виконання завдання з черги:", e);
            activeRequests--; // Все одно зменшити лічильник при помилці.
            setTimeout(processQueue, 0);
        }
    }

    // ===================== МЕРЕЖЕВІ ФУНКЦІЇ =====================

    /**
     * Виконує надійний мережевий запит з резервним варіантом.
     * План А: Спробувати запит через вбудований Lampa.Utils.fetch.
     * План Б: Якщо План А не вдався, використати метод із проксі-серверами.
     * @param {string} url - URL-адреса для запиту.
     * @param {string} cardId - ID картки для логування.
     * @param {function} callback - Функція, яка викликається з результатом `(error, data)`.
     */
    function robustFetch(url, cardId, callback) {
        // Перевіряємо, чи існує нативний метод Lampa.
        if (window.Lampa && Lampa.Utils && typeof Lampa.Utils.fetch === 'function') {
            // ПЛАН А: Використовуємо Lampa.Utils.fetch.
            Lampa.Utils.fetch(url, {
                timeout: LTF_CONFIG.PROXY_TIMEOUT_MS
            }).then(data => {
                // Успіх з Планом А.
                callback(null, data);
            }).catch(error => {
                // План А не вдався, переходимо до Плану Б.
                console.warn(`LTF-LOG [${cardId}]: План А (Lampa.Utils.fetch) не вдався. Перемикаю на План Б (проксі). Помилка:`, error);
                fetchWithProxy(url, cardId, callback);
            });
        } else {
            // Якщо Lampa.Utils.fetch не існує, одразу використовуємо План Б.
            if (LTF_CONFIG.LOGGING_GENERAL) console.warn(`LTF-LOG [${cardId}]: Lampa.Utils.fetch не знайдено. Використовую План Б.`);
            fetchWithProxy(url, cardId, callback);
        }
    }

    /**
     * Виконує мережевий запит через список проксі-серверів (ПЛАН Б).
     * @param {string} url - URL-адреса для запиту.
     * @param {string} cardId - ID картки для логування.
     * @param {function} callback - Функція, яка викликається з результатом `(error, data)`.
     */
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
    /**
     * Визначає тип контенту (фільм/серіал) з даних картки.
     * @param {object} cardData - Дані картки Lampa.
     * @returns {string} - 'movie' або 'tv'.
     */
    function getCardType(cardData) {
        var type = cardData.media_type || cardData.type;
        if (type === 'movie' || type === 'tv') return type;
        return cardData.name || cardData.original_name ? 'tv' : 'movie';
    }

    // ===================== ОСНОВНА ЛОГІКА ПІДРАХУНКУ ДОРІЖОК =====================
    /**
     * Рахує кількість українських доріжок у назві, ігноруючи субтитри.
     * @param {string} title - Назва торрента.
     * @returns {number} - Кількість знайдених українських аудіодоріжок.
     */
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

    /**
     * Форматує текст мітки на основі кількості доріжок.
     * @param {number} count - Кількість доріжок.
     * @returns {string|null} - Текст мітки ("Ukr", "2xUkr") або null.
     */
    function formatTrackLabel(count) {
        if (!count || count === 0) return null;
        if (count === 1) return "Ukr";
        return `${count}xUkr`;
    }

    // ===================== ПОШУК НА JACRED =====================
    /**
     * Знаходить найкращий реліз за максимальною кількістю українських доріжок.
     * @param {object} normalizedCard - Нормалізовані дані картки.
     * @param {string} cardId - ID картки.
     * @param {function} callback - Функція, яка викликається з фінальним результатом.
     */
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
                
                // Використовуємо нашу нову надійну функцію для запитів.
                robustFetch(apiUrl, cardId, function(error, responseText) {
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
                            const torrentTitle = currentTorrent.title.toLowerCase();
                            const torrentTypeFromApi = (currentTorrent.type || '').toLowerCase();

                            // Дворівневий фільтр "Фільм/Серіал".
                            if (normalizedCard.type === 'tv' && torrentTypeFromApi.includes('movie')) continue;
                            if (normalizedCard.type === 'movie' && torrentTypeFromApi.includes('serial')) continue;
                            const isSeriesTorrent = /(сезон|season|s\d{1,2}|серии|серії|episodes|епізод|\d{1,2}\s*из\s*\d{1,2}|\d+×\d+)/.test(torrentTitle);
                            if (normalizedCard.type === 'tv' && !isSeriesTorrent) continue;
                            if (normalizedCard.type === 'movie' && isSeriesTorrent) continue;
                            
                            // Перевірка року з гнучким допуском із конфігурації.
                            var parsedYear = extractYearFromTitle(currentTorrent.title) || parseInt(currentTorrent.relased, 10);
                            var yearDifference = Math.abs(parsedYear - searchYearNum);
                            if (parsedYear > 1900 && yearDifference > LTF_CONFIG.YEAR_DIFFERENCE_TOLERANCE) {
                                if (LTF_CONFIG.LOGGING_TRACKS) console.log(`LTF-LOG [${cardId}]: Пропускаємо (рік не співпадає: ${parsedYear} vs ${searchYearNum}):`, currentTorrent.title);
                                continue;
                            }
                            
                            const currentTrackCount = countUkrainianTracks(currentTorrent.title);
                            
                            if (currentTrackCount > bestTrackCount) {
                                bestTrackCount = currentTrackCount;
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

            // Логіка паралельного пошуку за оригінальною та локалізованою назвою.
            const titlesToSearch = [ normalizedCard.original_title, normalizedCard.title ];
            const uniqueTitles = [...new Set(titlesToSearch)].filter(Boolean);
            const searchPromises = uniqueTitles.map(title => {
                return new Promise(resolve => {
                    searchJacredApi(title, year, resolve);
                });
            });

            Promise.all(searchPromises).then(results => {
                let bestOverallResult = null;
                let maxTrackCount = 0;
                results.forEach(result => {
                    if (result && result.track_count > maxTrackCount) {
                        maxTrackCount = result.track_count;
                        bestOverallResult = result;
                    }
                });
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
        // Спочатку видаляємо стару мітку, якщо вона є.
        const existingElement = cardView.querySelector('.card__tracks');
        if (existingElement) existingElement.remove();
        // Якщо доріжок немає, нічого не додаємо.
        if (!displayLabel) return;
        
        const trackDiv = document.createElement('div');
        trackDiv.className = 'card__tracks';

        // Перевіряємо наявність плагіна RatingUp за позицією елемента рейтингу.
        const parentCard = cardView.closest('.card');
        if (parentCard) {
            const voteElement = parentCard.querySelector('.card__vote');
            if (voteElement) {
                 const topStyle = getComputedStyle(voteElement).top;
                 if (topStyle !== 'auto' && parseInt(topStyle) < 100) {
                     trackDiv.classList.add('positioned-below-rating');
                 }
            }
        }
        
        const innerElement = document.createElement('div');
        innerElement.textContent = displayLabel;
        trackDiv.appendChild(innerElement);
        cardView.appendChild(trackDiv);
    }

    // ===================== ГОЛОВНИЙ ОБРОБНИК КАРТОК =====================
    function processListCard(cardElement) {
        // Перевіряємо, чи є в елемента необхідні дані.
        var cardData = cardElement.card_data;
        var cardView = cardElement.querySelector('.card__view');
        if (!cardData || !cardView) return;

        // Пропускаємо, якщо картка вже була оброблена.
        if (cardElement.hasAttribute('data-ltf-tracks-processed')) return;
        cardElement.setAttribute('data-ltf-tracks-processed', 'true');
        
        // Перевірка налаштування для серіалів.
        var isTvSeries = (getCardType(cardData) === 'tv');
        if (isTvSeries && !LTF_CONFIG.SHOW_TRACKS_FOR_TV_SERIES) return;

        // Нормалізуємо дані для зручності.
        var normalizedCard = {
            id: cardData.id || '',
            title: cardData.title || cardData.name || '',
            original_title: cardData.original_title || cardData.original_name || '',
            type: getCardType(cardData),
            release_date: cardData.release_date || cardData.first_air_date || ''
        };
        var cardId = normalizedCard.id;
        var cacheKey = `${LTF_CONFIG.CACHE_VERSION}_${normalizedCard.type}_${cardId}`;

        // Робота з кешем та запитами.
        var cachedData = getTracksCache(cacheKey);
        if (cachedData) {
            // Якщо дані є в кеші, одразу показуємо їх.
            updateCardListTracksElement(cardView, cachedData.track_count);
            // І перевіряємо, чи не час оновити кеш у фоновому режимі.
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
            // Якщо даних в кеші немає, робимо запит до API.
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
    // Оптимізація обробки карток (дебаунсинг).
    var observerDebounceTimer = null; // Таймер для затримки.
    var cardsToProcess = []; // Масив для накопичення нових карток.

    /**
     * Запускає обробку накопичених карток із затримкою.
     */
    function debouncedProcessCards() {
        clearTimeout(observerDebounceTimer);
        // Встановлюємо таймер. Обробка почнеться після ОСТАННЬОГО виявлення нової картки.
        observerDebounceTimer = setTimeout(function() {
            const batch = [...new Set(cardsToProcess)];
            cardsToProcess = [];
            
            if (LTF_CONFIG.LOGGING_CARDLIST) console.log("LTF-LOG: Обробка пачки з", batch.length, "унікальних карток.");

            batch.forEach(card => {
                if (card.isConnected) { // Перевіряємо, чи картка все ще існує на сторінці.
                    processListCard(card);
                }
            });
        }, 50); // Зменшена затримка для швидшої реакції інтерфейсу.
    }
    
    // MutationObserver - "око", яке слідкує за появою нових карток на сторінці.
    var observer = new MutationObserver(function(mutations) {
        let newCardsFound = false;
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { 
                        if (node.classList && node.classList.contains('card')) {
                            cardsToProcess.push(node);
                            newCardsFound = true;
                        }
                        const nestedCards = node.querySelectorAll('.card');
                        if (nestedCards.length) {
                           nestedCards.forEach(card => cardsToProcess.push(card));
                           newCardsFound = true;
                        }
                    }
                });
            }
        });
        
        if (newCardsFound) {
            debouncedProcessCards();
        }
    });

    /**
     * Головна функція ініціалізації, яка запускає весь механізм.
     */
    function initializeLampaTracksPlugin() {
        // Запобігаємо повторній ініціалізації.
        if (window.lampaTrackFinderPlugin) return;
        window.lampaTrackFinderPlugin = true;

        // ПОКРАЩЕНО: Спостерігаємо за всім `body`. Це найнадійніший спосіб,
        // який гарантує, що жодна картка не буде пропущена.
        observer.observe(document.body, { childList: true, subtree: true });

        if (LTF_CONFIG.LOGGING_GENERAL) console.log("LTF-LOG: Плагін пошуку українських доріжок успішно ініціалізовано!");
    }

    // Запускаємо ініціалізацію, коли DOM буде готовий.
    if (document.body) {
        initializeLampaTracksPlugin();
    } else {
        document.addEventListener('DOMContentLoaded', initializeLampaTracksPlugin);
    }
})();

(function() {
    'use strict'; // Використовуємо суворий режим для кращої якості коду та запобігання помилок.

    // ===================== КОНФІГУРАЦІЯ ПЛАГІНА (LTF - Lampa Track Finder) =====================
    var LTF_CONFIG = {
        // --- Налаштування кешу ---
        CACHE_VERSION: 2, // Оновлено версію кешу через зміну логіки
        CACHE_KEY: 'lampa_ukr_tracks_cache', // Унікальний ключ для зберігання кешу в LocalStorage.
        CACHE_VALID_TIME_MS: 12 * 60 * 60 * 1000, // Час життя кешу (12 годин).
        CACHE_REFRESH_THRESHOLD_MS: 6 * 60 * 60 * 1000, // Через скільки часу кеш вважається застарілим і потребує фонового оновлення (6 годин).

        // --- Налаштування логування для налагодження ---
        LOGGING_GENERAL: false, // Загальні логі роботи плагіна.
        LOGGING_TRACKS: true, // Логи, що стосуються процесу пошуку та підрахунку доріжок.
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
        SHOW_TRACKS_FOR_TV_SERIES: true, // Чи показувати мітки для серіалів.

        // --- Налаштування стилів мітки на картках у списку ---
        LIST_CARD_LABEL_BACKGROUND_COLOR: 'rgba(0, 0, 0, 0.6)', // Колір фону мітки.
        LIST_CARD_LABEL_TEXT_COLOR: '#FFFFFF', // Колір тексту мітки.
        LIST_CARD_LABEL_BORDER_COLOR: '#3DA18D',
        LIST_CARD_LABEL_BACKGROUND_TRANSPARENT: false,
        LIST_CARD_LABEL_FONT_WEIGHT: '600',
        LIST_CARD_LABEL_FONT_SIZE: '1.3em',
        LIST_CARD_LABEL_FONT_STYLE: 'normal',
        };

    // ===================== СТИЛІ CSS =====================
    // Цей блок створює та додає на сторінку всі необхідні стилі для відображення міток.
    var styleTracks = "<style id=\"lampa_tracks_styles\">" +
        // Встановлюємо контекст позиціонування для постера.
        ".card__view { position: relative; }" +

        // Стиль для нашої нової мітки з доріжками.
        ".card__tracks {" +
        " position: absolute; " + // Абсолютне позиціонування відносно .card__view.
        " top: 0.8em; " +
        " bottom: auto; " + // Відступ від нижнього краю постера.
        " right: 0.3em; " + // Прив'язка до правого краю.
        " left: auto: " +
        //" margin-right: -0.4em; " + // Виступ за правий край для кращого візуального ефекту.
        " background-color: " + LTF_CONFIG.LIST_CARD_LABEL_BACKGROUND_COLOR + " !important;" + // Колір фону з конфігурації.
        " z-index: 10;" + // Відображати поверх інших елементів.
        " width: fit-content; " + // Ширина за вмістом.
        " max-width: calc(100% - 1em); " + // Максимальна ширина, щоб не вилазити занадто сильно.
        " border-radius: 0.8em 0 0 0.8em; " + // Закруглені ліві кути та гострі праві.
        " overflow: hidden;" + // Приховувати все, що виходить за межі закруглених кутів.
        "}" +
   
        // Стиль для тексту всередині мітки.
        ".card__tracks div {" +
        " text-transform: none; " + // Великі літери (Ukr, 2xUkr).
        " font-family: 'Roboto Condensed', 'Arial Narrow', Arial, sans-serif; " + // Шрифт.
        " font-weight: 700; " + // Жирність шрифту.
        " letter-spacing: 0.1px; " + // Міжлітерна відстань.
        " font-size: 1.05em; " + // Розмір шрифту.
        " color: " + LTF_CONFIG.LIST_CARD_LABEL_TEXT_COLOR + " !important;" + // Колір тексту з конфігурації.
        " padding: 0.3em 0.4em; " + // Внутрішні відступи.
        " white-space: nowrap;" + // Заборона переносу тексту.
        " display: flex; " +                                                 /* Той самий flex */
        "align-items: center; " +                                               /* Той самий вирівнювання */
        "gap: 4px; " +
        " text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.3); " + // Тінь для кращої читабельності.
        "}" +

        // Стилі для відображення мітки на повній картці (поруч з рейтингом).
        ".full-start-new__rate-line > .ltf-tracks {" +
        " border: 1px solid #FFFFFF !important; color: #FFFFFF !important; font-weight: normal !important; font-size: 1.2em !important; padding: 0.3em 0.5em; border-radius: 0.2em; margin-right: 0.5em; height: 1.72em; display: flex; align-items: center; justify-content: center; box-sizing: border-box;" +
        "}" +
        "</style>";
    // Додаємо стилі в DOM.
    Lampa.Template.add('lampa_tracks_css', styleTracks);
    $('body').append(Lampa.Template.get('lampa_tracks_css', {}, true));

    // ===================== УПРАВЛІННЯ ЧЕРГОЮ ЗАПИТІВ =====================
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
        if (activeRequests >= LTF_CONFIG.MAX_PARALLEL_REQUESTS) return; // Не перевищувати ліміт.
        var task = requestQueue.shift(); // Взяти перше завдання з черги.
        if (!task) return; // Якщо черга порожня, вийти.

        activeRequests++; // Збільшити лічильник активних запитів.
        try {
            // Виконати завдання, передавши йому функцію `done`, яку потрібно викликати по завершенню.
            task(function onTaskDone() {
                activeRequests--; // Зменшити лічильник.
                setTimeout(processQueue, 0); // Запустити обробку наступного завдання.
            });
        } catch (e) {
            console.error("LTF-LOG", "Помилка виконання завдання з черги:", e);
            activeRequests--; // Все одно зменшити лічильник при помилці.
            setTimeout(processQueue, 0);
        }
    }

    // ===================== МЕРЕЖЕВІ ФУНКЦІЇ =====================
    /**
     * Виконує мережевий запит через список проксі-серверів.
     * @param {string} url - URL-адреса для запиту.
     * @param {string} cardId - ID картки для логування.
     * @param {function} callback - Функція, яка викликається з результатом.
     */
    function fetchWithProxy(url, cardId, callback) {
        var currentProxyIndex = 0; // Починаємо з першого проксі.
        var callbackCalled = false; // Прапорець, щоб уникнути подвійного виклику callback.

        function tryNextProxy() {
            // Якщо всі проксі не спрацювали.
            if (currentProxyIndex >= LTF_CONFIG.PROXY_LIST.length) {
                if (!callbackCalled) {
                    callbackCalled = true;
                    callback(new Error('Всі проксі не відповіли для ' + url));
                }
                return;
            }
            // Формуємо URL через проксі.
            var proxyUrl = LTF_CONFIG.PROXY_LIST[currentProxyIndex] + encodeURIComponent(url);
            
            // Встановлюємо таймаут для запиту.
            var timeoutId = setTimeout(function() {
                if (!callbackCalled) {
                    currentProxyIndex++; // Переходимо до наступного проксі.
                    tryNextProxy();
                }
            }, LTF_CONFIG.PROXY_TIMEOUT_MS);

            // Виконуємо запит.
            fetch(proxyUrl)
                .then(function(response) {
                    clearTimeout(timeoutId); // Прибираємо таймаут.
                    if (!response.ok) throw new Error('Помилка проксі: ' + response.status);
                    return response.text();
                })
                .then(function(data) {
                    if (!callbackCalled) {
                        callbackCalled = true;
                        callback(null, data); // Успіх.
                    }
                })
                .catch(function(error) {
                    clearTimeout(timeoutId);
                    if (!callbackCalled) {
                        currentProxyIndex++; // Переходимо до наступного проксі при помилці.
                        tryNextProxy();
                    }
                });
        }
        tryNextProxy(); // Починаємо спроби.
    }
    
    // ===================== ДОПОМІЖНІ ФУНКЦІЇ =====================
    /**
     * Визначає тип контенту (фільм/серіал).
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
        if (!title) return 0; // Якщо назва порожня, повернути 0.
        let cleanTitle = title.toLowerCase(); // Переводимо в нижній регістр для зручного пошуку.
        
        // Знаходимо позицію слова "sub" (субтитри).
        const subsIndex = cleanTitle.indexOf('sub');
        // Якщо "sub" знайдено, обрізаємо рядок, щоб аналізувати тільки частину до субтитрів.
        if (subsIndex !== -1) {
            cleanTitle = cleanTitle.substring(0, subsIndex);
        }

        // Крок 1: Шукаємо мульти-доріжки формату "NxUkr" (наприклад, "3xUkr").
        const multiTrackMatch = cleanTitle.match(/(\d+)x\s*ukr/);
        if (multiTrackMatch && multiTrackMatch[1]) {
            // Якщо знайдено, повертаємо число, яке стоїть перед "xUkr".
            return parseInt(multiTrackMatch[1], 10);
        }

        // Крок 2: Якщо мульти-доріжок немає, шукаємо одиночні згадки "ukr".
        // Використовуємо \b (границя слова), щоб не знайти "ukr" всередині інших слів.
        const singleTrackMatches = cleanTitle.match(/\bukr\b/g);
        if (singleTrackMatches) {
            // Повертаємо кількість знайдених збігів. Зазвичай це буде 1.
            return singleTrackMatches.length;
        }

        // Якщо нічого не знайдено, повертаємо 0.
        return 0;
    }

    /**
     * Форматує текст мітки на основі кількості доріжок.
     * @param {number} count - Кількість доріжок.
     * @returns {string|null} - Текст мітки ("Ukr", "2xUkr") або null, якщо доріжок немає.
     */
    function formatTrackLabel(count) {
        if (!count || count === 0) return null; // Не показувати мітку, якщо доріжок 0.
        if (count === 1) return "Ukr"; // Для однієї доріжки.
        return `${count}xUkr`; // Для кількох доріжок.
    }

    // ===================== ПОШУК НА JACRED =====================
    /**
     * Знаходить найкращий реліз за максимальною кількістю українських доріжок.
     * @param {object} normalizedCard - Нормалізовані дані картки.
     * @param {string} cardId - ID картки.
     * @param {function} callback - Функція, яка викликається з результатом.
     */
    function getBestReleaseWithUkr(normalizedCard, cardId, callback) {
        enqueueTask(function(done) {
            // Перевірка, чи реліз ще не вийшов.
            var releaseDate = normalizedCard.release_date ? new Date(normalizedCard.release_date) : null;
            if (releaseDate && releaseDate.getTime() > Date.now()) {
                callback(null);
                done();
                return;
            }

            // Перевірка наявності року.
            var year = '';
            if (normalizedCard.release_date && normalizedCard.release_date.length >= 4) {
                year = normalizedCard.release_date.substring(0, 4);
            }
            if (!year || isNaN(year)) {
                callback(null);
                done();
                return;
            }
            var searchYearNum = parseInt(year, 10);
            
            // Функція для витягування року з назви торрента.
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

            // Функція для виконання запиту до API.
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
                            var parsedYear = parseInt(currentTorrent.relased, 10) || extractYearFromTitle(currentTorrent.title);
                            var yearDifference = Math.abs(parsedYear - searchYearNum);
                            if (parsedYear > 1900 && yearDifference > 1) {
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

            // === НОВА ЛОГІКА ПАРАЛЕЛЬНОГО ПОШУКУ ===
            // 1. Створюємо масив назв для пошуку (оригінальна, локалізована).
            const titlesToSearch = [
                normalizedCard.original_title,
                normalizedCard.title
            ];

            // 2. Фільтруємо, щоб залишити тільки унікальні та непусті назви.
            const uniqueTitles = [...new Set(titlesToSearch)].filter(Boolean);

            // 3. Створюємо масив "обіцянок" для кожного пошукового запиту.
            const searchPromises = uniqueTitles.map(title => {
                return new Promise(resolve => {
                    searchJacredApi(title, year, resolve);
                });
            });

            // 4. Запускаємо всі пошуки одночасно.
            Promise.all(searchPromises).then(results => {
                // 'results' - це масив результатів, наприклад: [result_from_original, result_from_localized].
                
                let bestOverallResult = null;
                let maxTrackCount = 0;

                // 5. Перебираємо результати від усіх пошуків.
                results.forEach(result => {
                    if (!result || !result.track_count) {
                        return; // Пропускаємо, якщо для цієї назви нічого не знайдено.
                    }

                    // 6. Знаходимо найкращий серед усіх.
                    if (result.track_count > maxTrackCount) {
                        maxTrackCount = result.track_count;
                        bestOverallResult = result;
                    }
                });
                
                // 7. Повертаємо фінальний, найкращий результат.
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
        const innerElement = document.createElement('div');
        innerElement.textContent = displayLabel;
        trackDiv.appendChild(innerElement);
        cardView.appendChild(trackDiv);
    }

    function updateFullCardTracksElement(renderElement, trackCount) {
        const displayLabel = formatTrackLabel(trackCount);
        const rateLine = $('.full-start-new__rate-line', renderElement);
        const existingElement = $('.ltf-tracks', rateLine);
        if (existingElement.length) existingElement.remove();
        if (!displayLabel || !rateLine.length) {
            rateLine.css('visibility', 'visible');
            return;
        }
        
        const div = document.createElement('div');
        div.className = 'full-start__status ltf-tracks';
        div.textContent = displayLabel;
        rateLine.prepend(div);
        rateLine.css('visibility', 'visible');
    }

    // ===================== ГОЛОВНИЙ ОБРОБНИК КАРТОК =====================
    function processCard(cardElement, isFullCard) {
        var cardData = cardElement.card_data;
        var cardView = isFullCard ? cardElement : cardElement.querySelector('.card__view');
        if (!cardData || !cardView) return;

        if (!isFullCard && cardElement.hasAttribute('data-ltf-tracks-processed')) return;
        
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
        if (!isFullCard) cardElement.setAttribute('data-ltf-tracks-processed', 'true');

        var cachedData = getTracksCache(cacheKey);
        if (cachedData) {
            if (isFullCard) updateFullCardTracksElement(cardView, cachedData.track_count);
            else updateCardListTracksElement(cardView, cachedData.track_count);
            
            if (Date.now() - cachedData.timestamp > LTF_CONFIG.CACHE_REFRESH_THRESHOLD_MS) {
                getBestReleaseWithUkr(normalizedCard, cardId, function(liveResult) {
                    let trackCount = liveResult ? liveResult.track_count : 0;
                    saveTracksCache(cacheKey, { track_count: trackCount });
                    if (document.body.contains(isFullCard ? cardView[0] : cardElement)) {
                        if (isFullCard) updateFullCardTracksElement(cardView, trackCount);
                        else updateCardListTracksElement(cardView, trackCount);
                    }
                });
            }
        } else {
            if (isFullCard) $('.full-start-new__rate-line', cardView).css('visibility', 'hidden');
            getBestReleaseWithUkr(normalizedCard, cardId, function(liveResult) {
                if (document.body.contains(isFullCard ? cardView[0] : cardElement)) {
                    let trackCount = liveResult ? liveResult.track_count : 0;
                    saveTracksCache(cacheKey, { track_count: trackCount });
                    if (isFullCard) updateFullCardTracksElement(cardView, trackCount);
                    else updateCardListTracksElement(cardView, trackCount);
                }
            });
        }
    }
    
    // ===================== ІНІЦІАЛІЗАЦІЯ ПЛАГІНА =====================
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) {
                        if (node.classList.contains('card')) {
                            processCard(node, false);
                        }
                        node.querySelectorAll('.card').forEach(function(card) {
                            processCard(card, false);
                        });
                    }
                });
            }
        });
    });

    function initializeLampaTracksPlugin() {
        if (window.lampaTrackFinderPlugin) return;
        window.lampaTrackFinderPlugin = true;

        var containers = document.querySelectorAll('.cards, .card-list, .content, .main, .cards-list, .preview__list');
        if (containers.length) {
            containers.forEach(container => observer.observe(container, { childList: true, subtree: true }));
        } else {
            observer.observe(document.body, { childList: true, subtree: true });
        }

        Lampa.Listener.follow('full', function(event) {
            if (event.type === 'complite') {
                var renderElement = event.object.activity.render();
                renderElement.card_data = event.data.movie;
                processCard(renderElement, true);
            }
        });

        if (LTF_CONFIG.LOGGING_GENERAL) console.log("LTF-LOG: Плагін пошуку українських доріжок успішно ініціалізовано!");
    }

    if (document.body) {
        initializeLampaTracksPlugin();
    } else {
        document.addEventListener('DOMContentLoaded', initializeLampaTracksPlugin);
    }
})();

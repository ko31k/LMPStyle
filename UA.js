(function() {
    'use strict'; // Використовуємо суворий режим для кращої якості коду та запобігання помилок.

    // ===================== КОНФІГУРАЦІЯ ПЛАГІНА (LTF - Lampa Track Finder) =====================
    var LTF_CONFIG = {
        // --- Налаштування кешу ---
        CACHE_VERSION: 1, // Версія кешу. Змініть, якщо хочете скинути старі збережені дані.
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
        LIST_CARD_LABEL_BACKGROUND_COLOR: 'rgba(61, 161, 141, 0.8)', // Колір фону мітки.
        LIST_CARD_LABEL_TEXT_COLOR: '#FFFFFF', // Колір тексту мітки.
    };

    // ===================== СТИЛІ CSS =====================
    // Цей блок створює та додає на сторінку всі необхідні стилі для відображення міток.
    var styleTracks = "<style id=\"lampa_tracks_styles\">" +
        // Встановлюємо контекст позиціонування для постера.
        ".card__view { position: relative; }" +

        // Стиль для нашої нової мітки з доріжками.
        ".card__tracks {" +
        " position: absolute; " + // Абсолютне позиціонування відносно .card__view.
        " bottom: 0.50em; " + // Відступ від нижнього краю постера.
        " right: 0; " + // Прив'язка до правого краю.
        " margin-right: -0.4em; " + // Виступ за правий край для кращого візуального ефекту.
        " background-color: " + LTF_CONFIG.LIST_CARD_LABEL_BACKGROUND_COLOR + " !important;" + // Колір фону з конфігурації.
        " z-index: 10;" + // Відображати поверх інших елементів.
        " width: fit-content; " + // Ширина за вмістом.
        " max-width: calc(100% - 1em); " + // Максимальна ширина, щоб не вилазити занадто сильно.
        " border-radius: 0.8em 0 0.3em 0.8em; " + // Закруглені ліві кути та гострі праві.
        " overflow: hidden;" + // Приховувати все, що виходить за межі закруглених кутів.
        "}" +

        // Стиль для тексту всередині мітки.
        ".card__tracks div {" +
        " text-transform: uppercase; " + // Великі літери (Ukr, 2xUkr).
        " font-family: 'Roboto Condensed', 'Arial Narrow', Arial, sans-serif; " + // Шрифт.
        " font-weight: 700; " + // Жирність шрифту.
        " letter-spacing: 0.1px; " + // Міжлітерна відстань.
        " font-size: 1.30em; " + // Розмір шрифту.
        " color: " + LTF_CONFIG.LIST_CARD_LABEL_TEXT_COLOR + " !important;" + // Колір тексту з конфігурації.
        " padding: 0.1em 0.3em 0.08em 0.3em; " + // Внутрішні відступи.
        " white-space: nowrap;" + // Заборона переносу тексту.
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
                    if (extractedYear >= 1900 && extractedYear <= currentYear + 2) { // +2 для майбутніх релізів
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

                        let bestTrackCount = 0; // Найкраща знайдена кількість доріжок.
                        let bestFoundTorrent = null; // Найкращий знайдений торрент.

                        // Перебираємо всі знайдені торренти.
                        for (let i = 0; i < torrents.length; i++) {
                            const currentTorrent = torrents[i];
                            
                            // Сувора перевірка року.
                            var parsedYear = parseInt(currentTorrent.relased, 10) || extractYearFromTitle(currentTorrent.title);
                            var yearDifference = Math.abs(parsedYear - searchYearNum);
                            if (parsedYear > 1900 && yearDifference > 1) {
                                continue; // Пропускаємо, якщо рік не збігається.
                            }
                            
                            // Рахуємо кількість доріжок у поточному торренті.
                            const currentTrackCount = countUkrainianTracks(currentTorrent.title);
                            
                            // Логіка вибору найкращого.
                            if (currentTrackCount > bestTrackCount) {
                                // Якщо знайдено реліз з більшою кількістю доріжок, обираємо його.
                                bestTrackCount = currentTrackCount;
                                bestFoundTorrent = currentTorrent;
                            } else if (currentTrackCount === bestTrackCount && bestTrackCount > 0 && bestFoundTorrent && currentTorrent.title.length > bestFoundTorrent.title.length) {
                                // Якщо кількість доріжок однакова, обираємо реліз з довшою назвою.
                                bestFoundTorrent = currentTorrent;
                            }
                        }

                        // Якщо знайдено хоча б один реліз з доріжками.
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

            // Стратегії пошуку (спочатку за оригінальною назвою, потім за локалізованою).
            var searchStrategies = [];
            if (normalizedCard.original_title) {
                searchStrategies.push({ title: normalizedCard.original_title.trim(), year: year });
            }
            if (normalizedCard.title && normalizedCard.title !== normalizedCard.original_title) {
                searchStrategies.push({ title: normalizedCard.title.trim(), year: year });
            }

            // Рекурсивний запуск стратегій.
            function executeNextStrategy(index) {
                if (index >= searchStrategies.length) {
                    callback(null);
                    done();
                    return;
                }
                var s = searchStrategies[index];
                searchJacredApi(s.title, s.year, function(result) {
                    if (result !== null) {
                        callback(result);
                        done();
                    } else {
                        executeNextStrategy(index + 1);
                    }
                });
            }

            if (searchStrategies.length > 0) executeNextStrategy(0);
            else { callback(null); done(); }
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
    /**
     * Оновлює/створює мітку на картці в списку.
     * @param {Element} cardView - DOM-елемент постера.
     * @param {number} trackCount - Кількість доріжок.
     */
    function updateCardListTracksElement(cardView, trackCount) {
        const displayLabel = formatTrackLabel(trackCount);
        const existingElement = cardView.querySelector('.card__tracks');
        if (existingElement) existingElement.remove(); // Завжди видаляємо стару мітку.
        if (!displayLabel) return; // Не створювати нову, якщо доріжок немає.
        
        const trackDiv = document.createElement('div');
        trackDiv.className = 'card__tracks';
        const innerElement = document.createElement('div');
        innerElement.textContent = displayLabel;
        trackDiv.appendChild(innerElement);
        cardView.appendChild(trackDiv);
    }

    /**
     * Оновлює/створює мітку на повній картці.
     * @param {Element} renderElement - DOM-елемент всієї картки.
     * @param {number} trackCount - Кількість доріжок.
     */
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
        rateLine.prepend(div); // Додаємо на початок лінії рейтингу.
        rateLine.css('visibility', 'visible');
    }

    // ===================== ГОЛОВНИЙ ОБРОБНИК КАРТОК =====================
    /**
     * Запускає процес пошуку та відображення доріжок для картки.
     * @param {Element} cardElement - DOM-елемент картки.
     * @param {boolean} isFullCard - Прапорець, що вказує, чи це повна картка.
     */
    function processCard(cardElement, isFullCard) {
        var cardData = cardElement.card_data;
        var cardView = isFullCard ? cardElement : cardElement.querySelector('.card__view');
        if (!cardData || !cardView) return;

        // Не обробляти картки у списку повторно.
        if (!isFullCard && cardElement.hasAttribute('data-ltf-tracks-processed')) return;
        
        var isTvSeries = (getCardType(cardData) === 'tv');
        if (isTvSeries && !LTF_CONFIG.SHOW_TRACKS_FOR_TV_SERIES) return;

        // Нормалізуємо дані картки.
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

        // Робота з кешем.
        var cachedData = getTracksCache(cacheKey);
        if (cachedData) {
            // Якщо є валідні дані в кеші, відображаємо їх.
            if (isFullCard) updateFullCardTracksElement(cardView, cachedData.track_count);
            else updateCardListTracksElement(cardView, cachedData.track_count);
            
            // Якщо кеш застарів, запускаємо фонове оновлення.
            if (Date.now() - cachedData.timestamp > LTF_CONFIG.CACHE_REFRESH_THRESHOLD_MS) {
                getBestReleaseWithUkr(normalizedCard, cardId, function(liveResult) {
                    if (liveResult && liveResult.track_count >= 0) { // >= 0 щоб оновити навіть якщо доріжки зникли
                        saveTracksCache(cacheKey, liveResult);
                        if (document.body.contains(isFullCard ? cardView[0] : cardElement)) {
                            if (isFullCard) updateFullCardTracksElement(cardView, liveResult.track_count);
                            else updateCardListTracksElement(cardView, liveResult.track_count);
                        }
                    }
                });
            }
        } else {
            // Якщо в кеші нічого немає, робимо новий запит.
            if (isFullCard) $('.full-start-new__rate-line', cardView).css('visibility', 'hidden');
            getBestReleaseWithUkr(normalizedCard, cardId, function(liveResult) {
                if (document.body.contains(isFullCard ? cardView[0] : cardElement)) {
                    if (liveResult && liveResult.track_count > 0) {
                        saveTracksCache(cacheKey, liveResult);
                        if (isFullCard) updateFullCardTracksElement(cardView, liveResult.track_count);
                        else updateCardListTracksElement(cardView, liveResult.track_count);
                    } else {
                        // Якщо нічого не знайдено, переконуємось, що мітки немає і лінія рейтингу видима.
                        if (isFullCard) updateFullCardTracksElement(cardView, 0);
                        else updateCardListTracksElement(cardView, 0);
                    }
                }
            });
        }
    }
    
    // ===================== ІНІЦІАЛІЗАЦІЯ ПЛАГІНА =====================
    // Слідкуємо за появою нових карток на сторінці.
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Перевіряємо, що це HTML-елемент.
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

    /**
     * Головна функція ініціалізації.
     */
    function initializeLampaTracksPlugin() {
        // Запобігаємо повторній ініціалізації.
        if (window.lampaTrackFinderPlugin) return;
        window.lampaTrackFinderPlugin = true;

        // Вказуємо, за якими контейнерами слідкувати.
        var containers = document.querySelectorAll('.cards, .card-list, .content, .main, .cards-list, .preview__list');
        if (containers.length) {
            containers.forEach(container => observer.observe(container, { childList: true, subtree: true }));
        } else {
            // Якщо не знайдено, слідкуємо за всією сторінкою.
            observer.observe(document.body, { childList: true, subtree: true });
        }

        // Слідкуємо за відкриттям повної картки.
        Lampa.Listener.follow('full', function(event) {
            if (event.type === 'complite') {
                var renderElement = event.object.activity.render();
                renderElement.card_data = event.data.movie;
                processCard(renderElement, true);
            }
        });

        if (LTF_CONFIG.LOGGING_GENERAL) console.log("LTF-LOG: Плагін пошуку українських доріжок успішно ініціалізовано!");
    }

    // Запускаємо ініціалізацію, коли сторінка буде готова.
    if (document.body) {
        initializeLampaTracksPlugin();
    } else {
        document.addEventListener('DOMContentLoaded', initializeLampaTracksPlugin);
    }
})();

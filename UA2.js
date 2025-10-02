/**
 * Lampa Track Finder v2.0
 * * Цей плагін призначений для пошуку та відображення інформації про наявність 
 * українських аудіодоріжок у релізах, доступних через Jacred API.
 * * Основні можливості:
 * - Шукає згадки українських доріжок (Ukr, 2xUkr і т.д.) у назвах торрентів.
 * - Ігнорує українські субтитри, аналізуючи лише частину назви до слова "sub".
 * - Виконує паралельний пошук за оригінальною та локалізованою назвою для максимального охоплення.
 * - Обирає реліз з найбільшою кількістю знайдених українських доріжок.
 * - Відображає стильну мітку на постерах у списках, яка не конфліктує з іншими плагінами (напр., RatingUp).
 * - Має систему кешування для зменшення навантаження та пришвидшення роботи.
 */
(function() {
    'use strict'; // Використовуємо суворий режим для кращої якості коду та запобігання помилок.

    // ===================== КОНФІГУРАЦІЯ ПЛАГІНА (LTF - Lampa Track Finder) =====================
    var LTF_CONFIG = {
        // --- Налаштування кешу ---
        CACHE_VERSION: 3, // Версія кешу. Змініть, якщо хочете скинути старі збережені дані.
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
        SHOW_TRACKS_FOR_TV_SERIES: true, // Чи показувати мітки для серіалів.
    };

    // ===================== СТИЛІ CSS =====================
    // Цей блок створює та додає на сторінку всі необхідні стилі для відображення міток.
    var styleTracks = "<style id=\"lampa_tracks_styles\">" +
        // Встановлюємо контекст позиціонування для постера. Це необхідно для абсолютно позиціонованих дочірніх елементів.
        ".card__view { position: relative; }" +

        // Стиль для нашої нової мітки з доріжками (копіює стиль .card__vote).
        ".card__tracks {" +
        " position: absolute !important; " + // Абсолютне позиціонування відносно .card__view.
        " right: 0.3em !important; " + // Відступ праворуч.
        " top: 0.3em !important; " + // Позиція за замовчуванням (коли RatingUp неактивний).
        " background: rgba(0,0,0,0.5) !important;" + // Напівпрозорий чорний фон.
        " color: #FFFFFF !important;" + // Білий колір тексту.
        " font-size: 1.3em !important;" + // Розмір шрифту.
        " padding: 0.2em 0.5em !important;" + // Внутрішні відступи.
        " border-radius: 1em !important;" + // Закруглення кутів.
        " font-weight: 700 !important;" + // Жирний шрифт.
        " z-index: 2 !important;" + // z-index трохи вищий за рейтинг (у якого 1), щоб мітка була "поверх".
        "}" +

        // Додатковий клас, який застосовується динамічно, якщо плагін RatingUp активний.
        ".card__tracks.positioned-below-rating {" +
        " top: 2.3em !important; " + // Нова позиція зверху, щоб зміститися нижче рейтингу.
        "}" +
        
        // Стиль для тексту всередині мітки.
        ".card__tracks div {" +
        " text-transform: uppercase; font-family: 'Roboto Condensed', 'Arial Narrow', Arial, sans-serif; font-weight: 700; letter-spacing: 0.1px; font-size: 1em; color: #FFFFFF; padding: 0; white-space: nowrap; text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.3);" +
        "}" +
        "</style>";
    // Додаємо стилі в DOM один раз при завантаженні плагіна.
    Lampa.Template.add('lampa_tracks_css', styleTracks);
    $('body').append(Lampa.Template.get('lampa_tracks_css', {}, true));

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
        if (activeRequests >= LTF_CONFIG.MAX_PARALLEL_REQUESTS) return; // Не перевищувати ліміт.
        var task = requestQueue.shift(); // Взяти перше завдання з черги.
        if (!task) return; // Якщо черга порожня, вийти.

        activeRequests++; // Збільшити лічильник активних запитів.
        try {
            // Виконати завдання, передавши йому функцію `done`, яку потрібно викликати по завершенню.
            task(function onTaskDone() {
                activeRequests--; // Зменшити лічильник.
                setTimeout(processQueue, 0); // Запустити обробку наступного завдання асинхронно.
            });
        } catch (e) {
            console.error("LTF-LOG", "Помилка виконання завдання з черги:", e);
            activeRequests--; // Все одно зменшити лічильник при помилці.
            setTimeout(processQueue, 0);
        }
    }

    // ===================== МЕРЕЖЕВІ ФУНКЦІЇ =====================
    /**
     * Виконує мережевий запит через список проксі-серверів, щоб обійти CORS.
     * @param {string} url - URL-адреса для запиту.
     * @param {string} cardId - ID картки для логування.
     * @param {function} callback - Функція, яка викликається з результатом `(error, data)`.
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
                    if (LTF_CONFIG.LOGGING_GENERAL) console.log('LTF-LOG', `Проксі ${proxyUrl} не відповів вчасно.`);
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
                        callback(null, data); // Успіх, повертаємо дані.
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
        // Використовуємо \b (границя слова), щоб не знайти "ukr" всередині інших слів (наприклад, "bulgarian").
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
     * Знаходить найкращий реліз за максимальною кількістю українських доріжок, виконуючи паралельний пошук.
     * @param {object} normalizedCard - Нормалізовані дані картки.
     * @param {string} cardId - ID картки.
     * @param {function} callback - Функція, яка викликається з фінальним результатом.
     */
    function getBestReleaseWithUkr(normalizedCard, cardId, callback) {
        enqueueTask(function(done) {
            // Перевірка, чи реліз ще не вийшов.
            var releaseDate = normalizedCard.release_date ? new Date(normalizedCard.release_date) : null;
            if (releaseDate && releaseDate.getTime() > Date.now()) {
                callback(null); // Не шукати для майбутніх релізів.
                done();
                return;
            }

            // Перевірка наявності року.
            var year = '';
            if (normalizedCard.release_date && normalizedCard.release_date.length >= 4) {
                year = normalizedCard.release_date.substring(0, 4);
            }
            if (!year || isNaN(year)) {
                callback(null); // Не шукати без року.
                done();
                return;
            }
            var searchYearNum = parseInt(year, 10);
            
            // Функція для витягування року з назви торрента (якщо він там є).
            function extractYearFromTitle(title) {
                var regex = /(?:^|[^\d])(\d{4})(?:[^\d]|$)/g;
                var match, lastYear = 0;
                var currentYear = new Date().getFullYear();
                while ((match = regex.exec(title)) !== null) {
                    var extractedYear = parseInt(match[1], 10);
                    // Допускаємо невеликий запас для майбутніх релізів.
                    if (extractedYear >= 1900 && extractedYear <= currentYear + 2) {
                        lastYear = extractedYear;
                    }
                }
                return lastYear;
            }

            // Внутрішня функція для виконання одного запиту до API.
            function searchJacredApi(searchTitle, searchYear, apiCallback) {
                var userId = Lampa.Storage.get('lampac_unic_id', ''); // ID користувача для статистики Jacred.
                var apiUrl = LTF_CONFIG.JACRED_PROTOCOL + LTF_CONFIG.JACRED_URL + '/api/v1.0/torrents?search=' +
                    encodeURIComponent(searchTitle) +
                    '&year=' + searchYear +
                    '&uid=' + userId;
                
                // Запускаємо запит через проксі.
                fetchWithProxy(apiUrl, cardId, function(error, responseText) {
                    if (error || !responseText) {
                        apiCallback(null); // Повертаємо null при помилці мережі.
                        return;
                    }
                    try {
                        var torrents = JSON.parse(responseText);
                        if (!Array.isArray(torrents) || torrents.length === 0) {
                            apiCallback(null); // Повертаємо null, якщо нічого не знайдено.
                            return;
                        }

                        let bestTrackCount = 0; // Найкраща знайдена кількість доріжок для ЦЬОГО запиту.
                        let bestFoundTorrent = null; // Найкращий знайдений торрент для ЦЬОГО запиту.

                        // Перебираємо всі знайдені торренти.
                        for (let i = 0; i < torrents.length; i++) {
                            const currentTorrent = torrents[i];
                            
                            // Сувора, але гнучка перевірка року.
                            var parsedYear = parseInt(currentTorrent.relased, 10) || extractYearFromTitle(currentTorrent.title);
                            var yearDifference = Math.abs(parsedYear - searchYearNum);
                            // Дозволяємо різницю в 3 роки для охоплення трилогій та кіносеріалів.
                            if (parsedYear > 1900 && yearDifference > 3) {
                                continue; // Пропускаємо, якщо рік не збігається.
                            }
                            
                            // Рахуємо кількість доріжок у поточному торренті.
                            const currentTrackCount = countUkrainianTracks(currentTorrent.title);
                            
                            // Логіка вибору найкращого релізу.
                            if (currentTrackCount > bestTrackCount) {
                                // Якщо знайдено реліз з більшою кількістю доріжок, обираємо його.
                                bestTrackCount = currentTrackCount;
                                bestFoundTorrent = currentTorrent;
                            } else if (currentTrackCount === bestTrackCount && bestTrackCount > 0 && bestFoundTorrent && currentTorrent.title.length > bestFoundTorrent.title.length) {
                                // Якщо кількість доріжок однакова, обираємо реліз з довшою назвою (більше інформації).
                                bestFoundTorrent = currentTorrent;
                            }
                        }

                        // Якщо знайдено хоча б один реліз з доріжками.
                        if (bestFoundTorrent) {
                            // Повертаємо об'єкт з результатом.
                            apiCallback({
                                track_count: bestTrackCount,
                                full_label: bestFoundTorrent.title
                            });
                        } else {
                            // Якщо для цієї назви нічого не знайдено, повертаємо null.
                            apiCallback(null);
                        }
                    } catch (e) {
                        apiCallback(null); // Повертаємо null при помилці парсингу JSON.
                    }
                });
            }

            // --- НОВА ЛОГІКА ПАРАЛЕЛЬНОГО ПОШУКУ ---
            // 1. Створюємо масив назв для пошуку (оригінальна, локалізована).
            const titlesToSearch = [
                normalizedCard.original_title,
                normalizedCard.title
            ];

            // 2. Фільтруємо, щоб залишити тільки унікальні та непусті назви.
            const uniqueTitles = [...new Set(titlesToSearch)].filter(Boolean);

            if (LTF_CONFIG.LOGGING_TRACKS) console.log('LTF-LOG', `[${cardId}] Запускаємо пошук за назвами:`, uniqueTitles);

            // 3. Створюємо масив "обіцянок" (промісів) для кожного пошукового запиту.
            const searchPromises = uniqueTitles.map(title => {
                return new Promise(resolve => {
                    searchJacredApi(title, year, resolve);
                });
            });

            // 4. Запускаємо всі пошуки одночасно і чекаємо на їх завершення.
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
                
                if (LTF_CONFIG.LOGGING_TRACKS) console.log('LTF-LOG', `[${cardId}] Найкращий результат з усіх пошуків:`, bestOverallResult);
                
                // 7. Повертаємо фінальний, найкращий результат.
                callback(bestOverallResult);
                done(); // Завершуємо завдання в черзі.
            });
        });
    }

    // ===================== РОБОТА З КЕШЕМ =====================
    /**
     * Отримує дані з кешу за ключем.
     * @param {string} key - Ключ кешу.
     * @returns {object|null} - Дані з кешу або null, якщо їх немає або вони застарілі.
     */
    function getTracksCache(key) {
        var cache = Lampa.Storage.get(LTF_CONFIG.CACHE_KEY) || {};
        var item = cache[key];
        var isCacheValid = item && (Date.now() - item.timestamp < LTF_CONFIG.CACHE_VALID_TIME_MS);
        return isCacheValid ? item : null;
    }

    /**
     * Зберігає дані в кеш.
     * @param {string} key - Ключ кешу.
     * @param {object} data - Дані для збереження.
     */
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
     * Оновлює/створює мітку на картці в списку з урахуванням позиціонування.
     * @param {Element} cardView - DOM-елемент постера.
     * @param {number} trackCount - Кількість доріжок.
     */
    function updateCardListTracksElement(cardView, trackCount) {
        const displayLabel = formatTrackLabel(trackCount); // Форматуємо текст мітки.
        const existingElement = cardView.querySelector('.card__tracks');
        if (existingElement) existingElement.remove(); // Завжди видаляємо стару мітку, щоб уникнути дублів.
        if (!displayLabel) return; // Не створювати нову, якщо доріжок немає.
        
        // Створюємо головний контейнер мітки.
        const trackDiv = document.createElement('div');
        trackDiv.className = 'card__tracks';

        // --- НОВА ЛОГІКА ДИНАМІЧНОГО ПОЗИЦІОНУВАННЯ ---
        const parentCard = cardView.closest('.card'); // Знаходимо головний контейнер картки.
        if (parentCard) {
            const voteElement = parentCard.querySelector('.card__vote'); // Шукаємо елемент рейтингу.
            // Перевіряємо, чи існує рейтинг і чи він знаходиться зверху (як це робить RatingUp).
            // `getComputedStyle` отримує фінальні стилі елемента, навіть якщо вони задані через JS.
            if (voteElement && getComputedStyle(voteElement).top !== 'auto' && parseInt(getComputedStyle(voteElement).top) < 100) {
                 // Якщо так, додаємо клас, який зсуне нашу мітку нижче.
                trackDiv.classList.add('positioned-below-rating');
            }
        }
        
        // Створюємо внутрішній елемент для тексту.
        const innerElement = document.createElement('div');
        innerElement.textContent = displayLabel;
        trackDiv.appendChild(innerElement);
        cardView.appendChild(trackDiv); // Додаємо готову мітку на постер.
    }

    // ===================== ГОЛОВНИЙ ОБРОБНИК КАРТОК =====================
    /**
     * Запускає процес пошуку та відображення доріжок для картки у списку.
     * @param {Element} cardElement - DOM-елемент картки (`.card`).
     */
    function processListCard(cardElement) {
        // Перевіряємо, що у картки є необхідні дані.
        var cardData = cardElement.card_data;
        var cardView = cardElement.querySelector('.card__view');
        if (!cardData || !cardView) return;

        // Не обробляти картки у списку повторно.
        if (cardElement.hasAttribute('data-ltf-tracks-processed')) return;
        
        // Перевіряємо, чи ввімкнено показ для серіалів.
        var isTvSeries = (getCardType(cardData) === 'tv');
        if (isTvSeries && !LTF_CONFIG.SHOW_TRACKS_FOR_TV_SERIES) return;

        // Нормалізуємо дані картки для зручності.
        var normalizedCard = {
            id: cardData.id || '',
            title: cardData.title || cardData.name || '',
            original_title: cardData.original_title || cardData.original_name || '',
            type: getCardType(cardData),
            release_date: cardData.release_date || cardData.first_air_date || ''
        };
        var cardId = normalizedCard.id;
        var cacheKey = `${LTF_CONFIG.CACHE_VERSION}_${normalizedCard.type}_${cardId}`;
        cardElement.setAttribute('data-ltf-tracks-processed', 'true'); // Позначаємо картку як оброблену.

        // Робота з кешем.
        var cachedData = getTracksCache(cacheKey);
        if (cachedData) {
            // Якщо є валідні дані в кеші, відображаємо їх.
            updateCardListTracksElement(cardView, cachedData.track_count);
            
            // Якщо кеш застарів, запускаємо фонове оновлення.
            if (Date.now() - cachedData.timestamp > LTF_CONFIG.CACHE_REFRESH_THRESHOLD_MS) {
                getBestReleaseWithUkr(normalizedCard, cardId, function(liveResult) {
                    let trackCount = liveResult ? liveResult.track_count : 0;
                    saveTracksCache(cacheKey, { track_count: trackCount }); // Оновлюємо кеш.
                    // Перевіряємо, чи картка ще існує на сторінці перед оновленням UI.
                    if (document.body.contains(cardElement)) {
                        updateCardListTracksElement(cardView, trackCount);
                    }
                });
            }
        } else {
            // Якщо в кеші нічого немає, робимо новий мережевий запит.
            getBestReleaseWithUkr(normalizedCard, cardId, function(liveResult) {
                if (document.body.contains(cardElement)) {
                    let trackCount = liveResult ? liveResult.track_count : 0;
                    // Зберігаємо результат в кеш (навіть якщо це 0, щоб не робити повторних запитів).
                    saveTracksCache(cacheKey, { track_count: trackCount });
                    updateCardListTracksElement(cardView, trackCount);
                }
            });
        }
    }
    
    // ===================== ІНІЦІАЛІЗАЦІЯ ПЛАГІНА =====================
    // MutationObserver - це "око", яке слідкує за змінами на сторінці.
    // Коли Lampa додає нові картки (наприклад, при скролі), цей код спрацьовує.
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Перевіряємо, що це HTML-елемент.
                        // Якщо доданий елемент - це сама картка.
                        if (node.classList.contains('card')) {
                            processListCard(node);
                        }
                        // Шукаємо картки всередині доданого елемента (якщо додався цілий контейнер).
                        node.querySelectorAll('.card').forEach(function(card) {
                            processListCard(card);
                        });
                    }
                });
            }
        });
    });

    /**
     * Головна функція ініціалізації, яка запускає весь механізм.
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

        if (LTF_CONFIG.LOGGING_GENERAL) console.log("LTF-LOG: Плагін пошуку українських доріжок успішно ініціалізовано!");
    }

    // Запускаємо ініціалізацію, коли сторінка (DOM) буде готова.
    if (document.body) {
        initializeLampaTracksPlugin();
    } else {
        document.addEventListener('DOMContentLoaded', initializeLampaTracksPlugin);
    }
})();

/**
 * Lampa Track Finder v2.7 - OPTIMIZED
 * --------------------------------------------------------------------------------
 * Цей плагін призначений для пошуку та відображення інформації про наявність
 * українських аудіодоріжок у релізах, доступних через Jacred API.
 * --------------------------------------------------------------------------------
 * Основні можливості:
 * - Шукає згадки українських доріжок (Ukr, 2xUkr і т.д.) у назвах торрентів.
 * - Ігнорує українські субтитри, аналізуючи лише частину назви до слова "sub".
 * - Виконує паралельний пошук за оригінальною та локалізованою назвою для максимального охоплення.
 * - Обирає реліз з найбільшою кількістю знайдених українських доріжок.
 * - Має надійний дворівневий фільтр для розрізнення фільмів та серіалів (по типу з API та по ключових словах).
 * - Оптимізована обробка карток (дебаунсинг) для уникнення пропусків та підвищення продуктивності.
 * - Відображає мітку на постерах (динамічно адаптується до присутності плагіна RatingUp).
 * - Має систему кешування для зменшення навантаження та пришвидшення роботи.
 * - Не виконує пошук для майбутніх релізів або релізів з невідомою датою.
 * --------------------------------------------------------------------------------
 * v2.7: Покращена стабільність, retry-механізм, адаптивна черга, додано ручні перевизначення доріжок
 */
(function() {
    'use strict'; // Використовуємо суворий режим для кращої якості коду та запобігання помилок.

    // ===================== КОНФІГУРАЦІЯ ПЛАГІНА (LTF - Lampa Track Finder) =====================
    var LTF_CONFIG = {
        // --- Налаштування кешу ---
        CACHE_VERSION: 7, // Версія кешу. Змініть, якщо хочете скинути старі збережені дані.
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
        PROXY_TIMEOUT_MS: 3500, // Максимальний час очікування відповіді від одного проксі (3.5 секунди).
        MAX_PARALLEL_REQUESTS: 10, // ✅ ОПТИМІЗОВАНО: Зменшено для стабільності (було 16)
        MAX_RETRY_ATTEMPTS: 2, // ✅ НОВЕ: Максимальна кількість спроб повторної обробки

        // --- Налаштування функціоналу ---
        SHOW_TRACKS_FOR_TV_SERIES: true, // Чи показувати мітки для серіалів (true або false)

        //ДОДАНО: Ручні перевизначення доріжок для конкретних ID контенту ===
        MANUAL_OVERRIDES: {
            '207703': { track_count: 1 },    //✅Примусово показувати Ukr для цього ID
            '1195518': { track_count: 2 },   //✅Примусово показувати 2xUkr для цього ID
            '215995': { track_count: 2 },    //✅Примусово показувати 2xUkr для цього ID
            '1234821': { track_count: 2 },   //✅Примусово показувати 2xUkr для цього ID
            '933260': { track_count: 3 }     //✅Примусово показувати 3xUkr для цього ID
            /*'Тут ID фільму': { track_count: 0 },*/   //✅Примусово приховувати мітку для цього ID
            /*'Тут ID фільму': { track_count: 3 }*/    //✅Примусово показувати 3xUkr для цього ID
        }
        // КІНЕЦЬ перевизначень
    
    };

    // ======== АВТОМАТИЧНЕ СКИДАННЯ СТАРОГО КЕШУ ПРИ ОНОВЛЕННІ ========
    (function resetOldCache() {
        var cache = Lampa.Storage.get(LTF_CONFIG.CACHE_KEY) || {};
        var hasOld = Object.keys(cache).some(k => !k.startsWith(LTF_CONFIG.CACHE_VERSION + '_'));
            if (hasOld) {
            console.log('UA-Finder: очищено старий кеш доріжок');
            Lampa.Storage.set(LTF_CONFIG.CACHE_KEY, {});
            }
    })();
    
    // ===================== СТИЛІ CSS =====================
    // Цей блок створює та додає на сторінку всі необхідні стилі для відображення міток.
    var styleTracks = "<style id=\"lampa_tracks_styles\">" +
        // Встановлюємо контекст позиціонування для постера. Це необхідно для абсолютно позиціонованих дочірніх елементів.
        ".card__view { position: relative; }" +

        // Стиль для мітки з доріжками.
        ".card__tracks {" +
        " position: absolute !important; " + // Абсолютне позиціонування відносно .card__view.
        " right: 0.3em !important; " + // Відступ праворуч.
        " left: auto !important; " + // Скидаємо позиціонування зліва.
        " top: 0.3em !important; " + // Позиція за замовчуванням (коли RatingUp неактивний).
        " background: rgba(0,0,0,0.5) !important;" + // Напівпрозорий чорний фон.
        " color: #FFFFFF !important;" + // Білий колір тексту.
        " font-size: 1.3em !important;" + // Розмір шрифту.
        " padding: 0.2em 0.5em !important;" + // Внутрішні відступи.
        " border-radius: 1em !important;" + // Закруглення кутів.
        " font-weight: 700 !important;" + // Жирний шрифт.
        " z-index: 20 !important;" + // Високий z-index, щоб бути поверх інших елементів.
        " width: fit-content !important; " + // Ширина за вмістом.
        " max-width: calc(100% - 1em) !important; " + // Максимальна ширина.
        " overflow: hidden !important;" + // Приховувати все, що виходить за межі.
        "}" +

        // Додатковий клас, який застосовується динамічно, якщо плагін RatingUp активний.
        ".card__tracks.positioned-below-rating {" +
        " top: 1.85em !important; " + // Версія позиції, щоб зміститися нижче рейтингу.
        "}" +
        
        // Стиль для тексту всередині мітки.
        ".card__tracks div {" +
        " text-transform: none !important; " + // Без перетворення у великі літери.
        " font-family: 'Roboto Condensed', 'Arial Narrow', Arial, sans-serif !important; " + // Шрифт.
        " font-weight: 700 !important; " + // Жирність.
        " letter-spacing: 0.1px !important; " + // Міжлітерна відстань.
        " font-size: 1.05em !important; " + // Розмір шрифту.
        " color: #FFFFFF !important;" + // Колір тексту.
        " padding: 0 !important; " + // Скидання відступів (вони в батьківському елементі).
        " white-space: nowrap !important;" + // Заборона переносу рядка.
        " display: flex !important; " + // Flex-контейнер.
        " align-items: center !important; " + // Вертикальне вирівнювання.
        " gap: 4px !important; " + // Відстань між елементами (якщо їх буде декілька).
        " text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.3) !important; " + // Тінь для тексту.
        "}" +
        "</style>";
    // Додаємо стилі в DOM один раз при завантаженні плагіна.
    Lampa.Template.add('lampa_tracks_css', styleTracks);
    $('body').append(Lampa.Template.get('lampa_tracks_css', {}, true));

    // ===================== УПРАВЛІННЯ ЧЕРГОЮ ЗАПИТІВ =====================
    // ✅ ОПТИМІЗОВАНО: Адаптивна черга з динамічним лімітом
    var requestQueue = []; // Масив, де зберігаються завдання на пошук.
    var activeRequests = 0; // Лічильник активних запитів.
    var networkHealth = 1.0; // ✅ НОВЕ: Показник здоров'я мережі (0.0 - 1.0)

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
        // ✅ ОПТИМІЗОВАНО: Адаптивний ліміт на основі здоров'я мережі
        var adaptiveLimit = Math.max(3, Math.min(LTF_CONFIG.MAX_PARALLEL_REQUESTS, Math.floor(LTF_CONFIG.MAX_PARALLEL_REQUESTS * networkHealth)));
        
        if (activeRequests >= adaptiveLimit) return; // Не перевищувати адаптивний ліміт.
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

    // ✅ НОВЕ: Функція оновлення здоров'я мережі
    function updateNetworkHealth(success) {
        if (success) {
            networkHealth = Math.min(1.0, networkHealth + 0.1); // Покращити здоров'я при успіху
        } else {
            networkHealth = Math.max(0.3, networkHealth - 0.2); // Погіршити здоров'я при помилці
        }
        if (LTF_CONFIG.LOGGING_GENERAL) console.log("LTF-LOG", "Оновлено здоров'я мережі:", networkHealth);
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
                    updateNetworkHealth(false); // ✅ ОНОВЛЕННЯ: Погіршити здоров'я мережі
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
                        updateNetworkHealth(true); // ✅ ОНОВЛЕННЯ: Покращити здоров'я мережі
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

            // Якщо дата відсутня або некоректна — не запускаємо пошук
            if (!normalizedCard.release_date || normalizedCard.release_date.toLowerCase().includes('невідомо') || isNaN(new Date(normalizedCard.release_date).getTime())) {
                callback(null);
                done();
                return;
                }
            
            // Перевірка, чи реліз ще не вийшов.
            var releaseDate = normalizedCard.release_date ? new Date(normalizedCard.release_date) : null;
            if (releaseDate && releaseDate.getTime() > Date.now()) {
                callback(null);
                done();
                return;
            }

            // Перевірка наявності та коректності року.
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
            
            // Функція для витягування року з назви торрента.
            function extractYearFromTitle(title) {
                var regex = /(?:^|[^\d])(\d{4})(?:[^\d]|$)/g;
                var match, lastYear = 0;
                var currentYear = new Date().getFullYear();
                while ((match = regex.exec(title)) !== null) {
                    var extractedYear = parseInt(match[1], 10);
                    // Обмежуємо максимальний рік поточним + 2 для уникнення помилкових співпадінь
                    if (extractedYear >= 1900 && extractedYear <= currentYear + 2) { 
                        lastYear = extractedYear;
                    }
                }
                return lastYear;
            }

            // Внутрішня функція для виконання одного запиту до API.
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
                            const torrentTitle = currentTorrent.title.toLowerCase();
                            const torrentTypeFromApi = (currentTorrent.type || '').toLowerCase();

                            // --- ДВОРІВНЕВИЙ ФІЛЬТР "ФІЛЬМ/СЕРІАЛ" ---
                            
                            // Рівень 1: Перевірка по типу з API Jacred (найнадійніший).
                            /*if (normalizedCard.type === 'tv' && torrentTypeFromApi.includes('movie')) {
                                if (LTF_CONFIG.LOGGING_TRACKS) console.log(`LTF-LOG [${cardId}]: Пропускаємо (API тип 'movie' для картки серіалу):`, currentTorrent.title);
                                continue;
                            }
                            if (normalizedCard.type === 'movie' && torrentTypeFromApi.includes('serial')) {
                                if (LTF_CONFIG.LOGGING_TRACKS) console.log(`LTF-LOG [${cardId}]: Пропускаємо (API тип 'serial' для картки фільму):`, currentTorrent.title);
                                continue;
                            }*/

                            // Рівень 2: Перевірка по ключових словах у назві (якщо тип в API не вказано).
                            // Додано більше ключових слів для кращої фільтрації серіалів
                            const isSeriesTorrent = /(сезон|season|s\d{1,2}|серии|серії|episodes|епізод|\d{1,2}\s*из\s*\d{1,2}|\d+×\d+)/.test(torrentTitle);
                            if (normalizedCard.type === 'tv' && !isSeriesTorrent) {
                                if (LTF_CONFIG.LOGGING_TRACKS) console.log(`LTF-LOG [${cardId}]: Пропускаємо (схожий на фільм для картки серіалу):`, currentTorrent.title);
                                continue; 
                            }
                            if (normalizedCard.type === 'movie' && isSeriesTorrent) {
                                if (LTF_CONFIG.LOGGING_TRACKS) console.log(`LTF-LOG [${cardId}]: Пропускаємо (схожий на серіал для картки фільму):`, currentTorrent.title);
                                continue;
                            }
                            
                            // Рівень 3: Додаткова перевірка для уникнення співпадінь фільмів з серіалами
                            // Якщо це фільм, а в назві торренту є чіткі ознаки серіалу - пропускати
                            if (normalizedCard.type === 'movie') {
                                const hasStrongSeriesIndicators = /(сезон|season|s\d|серії|episodes|епізод|\d+×\d+)/i.test(torrentTitle);
                                if (hasStrongSeriesIndicators) {
                                    if (LTF_CONFIG.LOGGING_TRACKS) console.log(`LTF-LOG [${cardId}]: Пропускаємо (чіткі ознаки серіалу для картки фільму):`, currentTorrent.title);
                                    continue;
                                }
                            }
                            
                            // --- НАЛАШТУВАННЯ ГНУЧКОСТІ ПОШУКУ ЗА РОКОМ ---
                            // Тут можна змінити припустиму різницю у роках.
                            // > 0 : Тільки точний збіг року. Максимальна точність, але може пропускати релізи на межі років.
                            // > 1 : Дозволяє різницю в 1 рік. РЕКОМЕНДОВАНО для серіалів та фільмів на межі років.
                            // > 3 : Дозволяє різницю в 3 роки. Добре для трилогій, але може іноді помилятись

                            //Шукаємо рік в назві релізу
                            //Спочатку бере рік із назви релізу (extractYearFromTitle), 
                            //а потім із поля relased, якщо в назві року немає.
                            var parsedYear = extractYearFromTitle(currentTorrent.title) || parseInt(currentTorrent.relased, 10);
                            var yearDifference = Math.abs(parsedYear - searchYearNum);
                            if (parsedYear > 1900 && yearDifference > 0) {   /*Дозволяє різницю в ±1 рік*/
                                if (LTF_CONFIG.LOGGING_TRACKS) console.log(`LTF-LOG [${cardId}]: Пропускаємо (рік не співпадає: ${parsedYear} vs ${searchYearNum}):`, currentTorrent.title);
                                continue;
                            }
                            
                            //Попередній пошук року
                            //Спочатку намагається взяти рік із поля currentTorrent.relased (з API Jacred),
                            //а лише потім — із назви
                            /*var parsedYear = parseInt(currentTorrent.relased, 10) || extractYearFromTitle(currentTorrent.title);
                            var yearDifference = Math.abs(parsedYear - searchYearNum);
                            if (parsedYear > 1900 && yearDifference > 1) {
                                if (LTF_CONFIG.LOGGING_TRACKS) console.log(`LTF-LOG [${cardId}]: Пропускаємо (рік не співпадає: ${parsedYear} vs ${searchYearNum}):`, currentTorrent.title);
                                continue;
                            }*/
                            
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

            // --- ЛОГІКА ПАРАЛЕЛЬНОГО ПОШУКУ ---
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

    // ВРАХОВУЄМО ОПИС: Рейтинг (.card__vote) є завжди, але RatingUp змінює його позицію.
    // Перевіряємо, чи позиція рейтингу (якщо він є) зміщена у верхній правий кут.
    const parentCard = cardView.closest('.card');
    if (parentCard) {
        // Ми перевіряємо, чи RatingUp активний на даній картці, по наявності/позиції .card__vote
        const voteElement = parentCard.querySelector('.card__vote');
        
        // RatingUp переміщує оцінку у верхній кут.
        // Перевірка, чи не знаходиться елемент .card__vote у верхньому куті, вказує на активність RatingUp.
        // Якщо .card__vote є, і його top менше певного значення (наприклад, 100px), ми вважаємо RatingUp активним.
        if (voteElement) {
             const topStyle = getComputedStyle(voteElement).top;
             // Перевірка topStyle > 100px означатиме, що він у нижньому куті (RatingUp неактивний)
             // Перевірка topStyle < 100px означатиме, що він у верхньому куті (RatingUp активний)
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
    // ✅ ОПТИМІЗОВАНО: Retry-механізм для пропущених карток
    function processListCard(cardElement) {
        // ✅ ПОКРАЩЕНА ПЕРЕВІРКА: Перевіряємо чи картка ще існує в DOM
        if (!cardElement || !cardElement.isConnected || !document.body.contains(cardElement)) {
            return;
        }

        var cardData = cardElement.card_data;
        var cardView = cardElement.querySelector('.card__view');
        if (!cardData || !cardView) return;


    // [UA-Finder PATCH]
    // Якщо картка вже мала мітку 'processed', але DOM перемалювався і мітка зникла —
    // відновлюємо її з кешу, не виконуючи повторний запит.
    if (cardElement.hasAttribute('data-ltf-tracks-processed')) {
        try {
            const cardType = getCardType(cardData);
            const cacheKey = `${LTF_CONFIG.CACHE_VERSION}_${cardType}_${cardData.id}`;
            const cached = getTracksCache(cacheKey);
            const hasBadge = cardElement.querySelector('.ltf-badge');

            if (cached && cached.track_count > 0 && !hasBadge) {
                const view = cardElement.querySelector('.card__view');
                if (view) {
                    updateCardListTracksElement(view, cached.track_count);
                    if (LTF_CONFIG.LOGGING_GENERAL)
                        console.log('[UA-Finder] Відновлено мітку з кешу:', cacheKey);
                }
            }
        } catch (e) {
            if (LTF_CONFIG.LOGGING_GENERAL)
                console.warn('[UA-Finder] Помилка при перевірці кешу для картки', e);
        }
        // Не продовжуємо стандартну обробку, щоб уникнути дублю
        return;
    }
    //[END PATCH]

        
        // ✅ ОПТИМІЗОВАНО: Retry-механізм - перевіряємо кількість спроб
        var retryCount = parseInt(cardElement.getAttribute('data-ltf-retry') || '0');
        if (retryCount >= LTF_CONFIG.MAX_RETRY_ATTEMPTS) {
            if (LTF_CONFIG.LOGGING_CARDLIST) console.log("LTF-LOG", "Досягнуто максимум спроб для картки:", cardData.id);
            return;
        }

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

        //ДОДАНО: ✅ Перевірка ручних перевизначень
        var manualOverrideData = LTF_CONFIG.MANUAL_OVERRIDES[cardId];
            if (manualOverrideData) {
                if (LTF_CONFIG.LOGGING_TRACKS) console.log(`LTF-LOG [${cardId}]: Використовується ручне перевизначення:`, manualOverrideData);
                updateCardListTracksElement(cardView, manualOverrideData.track_count);
                return; // Не продовжуємо стандартну обробку
            }
        // КІНЕЦЬ ДОДАНОГО КОДУ

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
                // ✅ ПОКРАЩЕНА ПЕРЕВІРКА: Перевіряємо чи картка ще існує перед оновленням
                if (!cardElement.isConnected || !document.body.contains(cardElement)) {
                    return;
                }
                
                let trackCount = liveResult ? liveResult.track_count : 0;
                saveTracksCache(cacheKey, { track_count: trackCount });
                updateCardListTracksElement(cardView, trackCount);
            });
        }
    }
    
    // ===================== ІНІЦІАЛІЗАЦІЯ ПЛАГІНА =====================
    // ✅ ОПТИМІЗОВАНО: Покращений дебаунсинг з пакетною обробкою
    var observerDebounceTimer = null; // Таймер для затримки.
    var cardsToProcess = []; // Масив для накопичення нових карток.

    /**
     * Запускає обробку накопичених карток із затримкою.
     */
    function debouncedProcessCards() {
        clearTimeout(observerDebounceTimer); // Скидаємо попередній таймер, якщо він був.
        // Встановлюємо новий таймер. Обробка почнеться через 150 мс після ОСТАННЬОГО виявлення нової картки.
        observerDebounceTimer = setTimeout(function() {
            // Створюємо копію масиву і очищуємо оригінал для наступних накопичень.
            const batch = [...cardsToProcess];
            cardsToProcess = []; // Очищаємо для нових карток
            
            if (LTF_CONFIG.LOGGING_CARDLIST) console.log("LTF-LOG: Обробка пачки з", batch.length, "карток.");

            // ✅ ОПТИМІЗОВАНО: Пакетна обробка карток для плавності
            var BATCH_SIZE = 12; // Обробляти по 12 карток за раз
            var DELAY_MS = 30;   // Затримка 30ms між пакетами

            /**
             * Рекурсивна функція обробки пакетів карток
             * @param {number} startIndex - Індекс початку поточного пакету
             */
            function processBatch(startIndex) {
                var currentBatch = batch.slice(startIndex, startIndex + BATCH_SIZE);
                
                if (LTF_CONFIG.LOGGING_CARDLIST && currentBatch.length > 0) {
                    console.log("LTF-LOG: Обробка пакету", (startIndex/BATCH_SIZE) + 1, "з", currentBatch.length, "карток");
                }
                
                // Обробляємо кожну картку з поточного пакету
                currentBatch.forEach(card => {
                    if (card.isConnected && document.body.contains(card)) {
                        processListCard(card);
                    }
                });
                
                var nextIndex = startIndex + BATCH_SIZE;
                // Якщо залишилися картки - плануємо наступний пакет
                if (nextIndex < batch.length) {
                    setTimeout(function() {
                        processBatch(nextIndex);
                    }, DELAY_MS);
                }
            }
            
            // Запускаємо пакетну обробку
            if (batch.length > 0) {
                processBatch(0);
            }
            
        }, 150); // Затримка в 150 мілісекунд.
    }

    // MutationObserver - "око", яке слідкує за появою нових карток на сторінці.
    var observer = new MutationObserver(function(mutations) {
        let newCardsFound = false;
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { 
                        if (node.classList && node.classList.contains('card')) {
                            cardsToProcess.push(node); // Додаємо картку в масив для обробки.
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
        
        // Якщо були додані нові картки, запускаємо відкладену обробку.
        if (newCardsFound) {
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

        // ✅ НОВЕ: Retry-механізм для карток, які могли бути пропущені
        setTimeout(function() {
            const allCards = document.querySelectorAll('.card:not([data-ltf-tracks-processed])');
            if (allCards.length > 0 && LTF_CONFIG.LOGGING_GENERAL) {
                console.log("LTF-LOG: Знайдено пропущені картки для retry:", allCards.length);
            }
            allCards.forEach(card => {
                if (!card.hasAttribute('data-ltf-retry')) {
                    card.setAttribute('data-ltf-retry', '0');
                }
                const retryCount = parseInt(card.getAttribute('data-ltf-retry'));
                if (retryCount < LTF_CONFIG.MAX_RETRY_ATTEMPTS) {
                    card.setAttribute('data-ltf-retry', (retryCount + 1).toString());
                    processListCard(card);
                }
            });
        }, 3000); // Перший retry через 3 секунди

        if (LTF_CONFIG.LOGGING_GENERAL) console.log("LTF-LOG: Плагін пошуку українських доріжок успішно ініціалізовано!");
    }

    // Запускаємо ініціалізацію, коли сторінка (DOM) буде готова.
    if (document.body) {
        initializeLampaTracksPlugin();
    } else {
        document.addEventListener('DOMContentLoaded', initializeLampaTracksPlugin);
    }

    // [UA-Finder PATCH]
    // Періодично перевіряємо DOM на наявність карток без мітки, але з кешем.
    // Це дозволяє автоматично відновлювати позначки після скролу, перемикання або оновлення списку.
    // [UA-Finder PATCH - FIXED v2]
    // ✅ Автоматичне відновлення міток із кешу для карток, які Lampa перемалювала або оновила
setInterval(() => {
    try {
        document.querySelectorAll('.card').forEach(card => {
            const data = card.card_data;
            if (!data) return;

            const type = getCardType(data);
            const cacheKey = `${LTF_CONFIG.CACHE_VERSION}_${type}_${data.id}`;
            const cached = getTracksCache(cacheKey);

            // 🟢 Виправлено: тепер перевіряємо правильний клас (.card__tracks),
            // бо саме він використовується для відображення мітки.
            const hasBadge = card.querySelector('.card__tracks');

            // Якщо кеш існує, є доріжки, але DOM-мітка відсутня — додаємо її наново
            if (cached && cached.track_count > 0 && !hasBadge) {
                const view = card.querySelector('.card__view');
                if (view) {
                    updateCardListTracksElement(view, cached.track_count);
                    if (LTF_CONFIG.LOGGING_GENERAL)
                        console.log('[UA-Finder] 🔁 Відновлено мітку з кешу:', cacheKey);
                }
            }
        });
    } catch (err) {
        if (LTF_CONFIG.LOGGING_GENERAL)
            console.warn('[UA-Finder] ⚠️ Автооновлення DOM-карток помилка:', err);
    }
}, 5000); // інтервал 5 секунд (можна змінити на 7000–10000 для меншої частоти перевірок)
// [END PATCH - FIXED]

    
})();

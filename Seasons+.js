(function () {
    'use strict';

    // --- Захист від повторного запуску плагіна ---
    // Перевіряємо, чи плагін вже був ініціалізований
    if (window.SeasonBadgePlugin && window.SeasonBadgePlugin.__initialized) return;
    
    // Ініціалізуємо глобальний об'єкт плагіна
    window.SeasonBadgePlugin = window.SeasonBadgePlugin || {};
    window.SeasonBadgePlugin.__initialized = true;

    // === НАЛАШТУВАННЯ ПЛАГІНА ===
    var CONFIG = {
        tmdbApiKey: '1ad1fd4b4938e876aa6c96d0cded9395',   // API ключ для доступу до TMDB
        cacheTime: 24 * 60 * 60 * 1000,                   // Час зберігання кешу (24 години)
        enabled: true,                                    // Активувати/деактивувати плагін
        language: 'uk'                                    // Мова для запитів до TMDB
    };

    // === СТИЛІ ДЛЯ МІТКИ СЕЗОНУ ===
    var style = document.createElement('style');
    style.textContent = `
    .card--season-complete {
        position: absolute;
        left: 0;
        bottom: 0.50em; /* Стандартна позиція, якщо немає мітки якості */
        background-color: rgba(61, 161, 141, 0.8);
        z-index: 12;
        width: fit-content;
        max-width: calc(100% - 1em);
        border-radius: 0 0.8em 0.8em 0; /* Заокруглення: верх-ліво=0, верх-право=0.8em, низ-право=0.8em, низ-ліво=0 */
        overflow: hidden;
        opacity: 0;
        transition: opacity 0.22s ease-in-out;
    }
    .card--season-complete div {
        text-transform: uppercase;
        font-family: 'Roboto Condensed', 'Arial Narrow', Arial, sans-serif;
        font-weight: 700;
        font-size: 1.30em;
        color: #ffffff;
        padding: 0.1em;
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 4px;
    }
    .card--season-complete.show {
        opacity: 1;
    }
    @media (max-width: 768px) {
        .card--season-complete div {
            font-size: 1.20em;
        }
    }
    `;
    document.head.appendChild(style);

    // === ДОПОМІЖНІ ФУНКЦІЇ ===

    /**
     * Визначає тип медіа на основі даних картки
     * @param {Object} cardData - дані картки
     * @returns {string} - тип медіа ('tv', 'movie', 'unknown')
     */
    function getMediaType(cardData) {
        // Якщо дані відсутні - повертаємо 'unknown'
        if (!cardData) return 'unknown';
        
        // Перевірка на серіал (наявність назви або дати першого ефіру)
        if (cardData.name || cardData.first_air_date) return 'tv';
        
        // Перевірка на фільм (наявність назви або дати релізу)
        if (cardData.title || cardData.release_date) return 'movie';
        
        // Якщо тип не визначено
        return 'unknown';
    }

    // Ініціалізація кешу з localStorage
    var cache = JSON.parse(localStorage.getItem('seasonBadgeCache') || '{}');

    /**
     * Завантажує дані серіалу з TMDB API з використанням кешу
     * @param {number} tmdbId - ID серіалу в базі TMDB
     * @returns {Promise} - проміс з даними серіалу
     */
    function fetchSeriesData(tmdbId) {
        return new Promise(function(resolve, reject) {
            // Перевірка кешу: якщо дані є і не прострочені - використовуємо їх
            if (cache[tmdbId] && (Date.now() - cache[tmdbId].timestamp < CONFIG.cacheTime)) {
                return resolve(cache[tmdbId].data);
            }

            // Перевірка коректності API ключа
            if (!CONFIG.tmdbApiKey || CONFIG.tmdbApiKey === 'ваш_tmdb_api_key_тут') {
                return reject(new Error('Будь ласка, вставте коректний TMDB API ключ'));
            }

            // Формування URL для запиту до TMDB API
            var url = `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${CONFIG.tmdbApiKey}&language=${CONFIG.language}`;
            
            // Виконання HTTP запиту
            fetch(url)
                .then(response => response.json())
                .then(function(data) {
                    // Перевірка на помилку від API
                    if (data.success === false) throw new Error(data.status_message);

                    // Збереження даних в кеш
                    cache[tmdbId] = { 
                        data: data, 
                        timestamp: Date.now() 
                    };
                    localStorage.setItem('seasonBadgeCache', JSON.stringify(cache));

                    resolve(data);
                })
                .catch(reject);
        });
    }

    /**
     * Перевіряє, чи завершений останній сезон серіалу
     * @param {Object} tmdbData - дані серіалу з TMDB
     * @returns {boolean} - true, якщо останній сезон завершений
     */
    function isSeasonComplete(tmdbData) {
        // Перевірка наявності необхідних даних
        if (!tmdbData || !tmdbData.seasons || !tmdbData.last_episode_to_air) return false;
        
        // Останній випущений епізод
        var lastEpisode = tmdbData.last_episode_to_air;
        
        // Пошук поточного сезону (сезони з номером > 0)
        var currentSeason = tmdbData.seasons.find(s => 
            s.season_number === lastEpisode.season_number && s.season_number > 0
        );
        
        // Якщо сезон не знайдено
        if (!currentSeason) return false;
        
        // Загальна кількість епізодів в сезоні
        var totalEpisodes = currentSeason.episode_count || 0;
        
        // Кількість випущених епізодів
        var airedEpisodes = lastEpisode.episode_number || 0;
        
        // Перевірка завершеності: всі епізоди випущені
        return totalEpisodes > 0 && airedEpisodes >= totalEpisodes;
    }

    /**
     * Створює DOM-елемент мітки сезону
     * @param {string} content - текстовий вміст мітки
     * @param {boolean} loading - чи є це тимчасовою міткою завантаження
     * @returns {HTMLElement} - створений елемент мітки
     */
    function createBadge(content, loading) {
        var badge = document.createElement('div');
        badge.className = 'card--season-complete' + (loading ? ' loading' : '');
        badge.innerHTML = `<div>${content}</div>`;
        return badge;
    }

    /**
     * Вирівнює мітку сезону відносно мітки якості
     * Якщо мітки якості немає - розміщує мітку сезону внизу картки
     * @param {HTMLElement} cardEl - елемент картки
     * @param {HTMLElement} badge - елемент мітки сезону
     */
    function adjustBadgePosition(cardEl, badge) {
        // Пошук елемента мітки якості в картці
        let quality = cardEl.querySelector('.card__quality');
        
        if (quality && badge) {
            // ВИПАДОК 1: Є мітка якості - розміщуємо вище неї
            
            // Отримуємо фактичну висоту мітки якості
            let qHeight = quality.offsetHeight; 
            
            // Отримуємо значення нижнього відступу з CSS
            let qBottom = parseFloat(getComputedStyle(quality).bottom) || 0; 
            
            // Встановлюємо позицію мітки сезону (вище мітки якості)
            badge.style.bottom = (qHeight + qBottom) + 'px';
        } else if (badge) {
            // ВИПАДОК 2: Мітки якості немає - розміщуємо в стандартному положенні
            badge.style.bottom = '0.50em'; // Стандартний нижній відступ
        }
    }

    /**
     * Додає мітку статусу сезону до картки серіалу
     * @param {HTMLElement} cardEl - елемент картки
     */
    function addSeasonBadge(cardEl) {
        // Перевірка: чи картка вже оброблена або відсутня
        if (!cardEl || cardEl.hasAttribute('data-season-processed')) return;

        // Перевірка: чи готові дані картки (якщо ні - відкладаємо обробку)
        if (!cardEl.card_data) {
            requestAnimationFrame(() => addSeasonBadge(cardEl));
            return;
        }

        var data = cardEl.card_data;

        // Перевірка: чи є це серіал (тільки для серіалів показуємо мітку)
        if (getMediaType(data) !== 'tv') return;

        // Знаходження контейнера для міток (елемент .card__view)
        var view = cardEl.querySelector('.card__view');
        if (!view) return;

        // Видалення попередньої мітки (якщо вона існує)
        var oldBadge = view.querySelector('.card--season-complete');
        if (oldBadge) oldBadge.remove();

        // Створення тимчасової мітки завантаження
        var badge = createBadge('...', true);
        
        // Додавання мітки до DOM
        view.appendChild(badge);
        
        // ВИКЛИК 1: Перше вирівнювання одразу після додавання в DOM
        adjustBadgePosition(cardEl, badge);

        // Позначення картки як обробленої (статус: завантаження)
        cardEl.setAttribute('data-season-processed', 'loading');

        // Завантаження даних серіалу з TMDB
        fetchSeriesData(data.id)
            .then(function(tmdbData) {
                // Перевірка завершеності сезону
                if (isSeasonComplete(tmdbData)) {
                    var lastEpisode = tmdbData.last_episode_to_air;

                    // Оновлення мітки на фінальний вигляд
                    badge.className = 'card--season-complete';
                    badge.innerHTML = `<div>S${lastEpisode.season_number} ✓</div>`;

                    // ВИКЛИК 2: Вирівнювання після оновлення вмісту мітки
                    adjustBadgePosition(cardEl, badge);

                    // Затримка для плавного показу мітки
                    setTimeout(() => {
                        badge.classList.add('show');
                        
                        // ВИКЛИК 3: Фінальне вирівнювання після показу
                        adjustBadgePosition(cardEl, badge);
                    }, 50);

                    // Позначення картки як обробленої (статус: завершено)
                    cardEl.setAttribute('data-season-processed', 'complete');
                } else {
                    // Видалення мітки, якщо сезон не завершений
                    badge.remove();
                    cardEl.setAttribute('data-season-processed', 'not-complete');
                }
            })
            .catch(function(error) {
                // Обробка помилок завантаження даних
                console.log('SeasonBadgePlugin помилка:', error.message);
                badge.remove();
                cardEl.setAttribute('data-season-processed', 'error');
            });
    }

    // === СИСТЕМА СПОСТЕРЕЖЕННЯ ЗА НОВИМИ КАРТКАМИ ===
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            // Перебір всіх доданих вузлів
            mutation.addedNodes?.forEach(function(node) {
                // Перевірка, що це HTML-елемент (не текстовий вузол)
                if (node.nodeType !== 1) return;

                // Якщо доданий елемент є карткою - обробляємо його
                if (node.classList && node.classList.contains('card')) {
                    addSeasonBadge(node);
                }

                // Якщо доданий контейнер містить картки - обробляємо всі внутрішні картки
                if (node.querySelectorAll) {
                    node.querySelectorAll('.card').forEach(addSeasonBadge);
                }
            });
        });
    });

    // === ОБРОБНИК ЗМІНИ РОЗМІРУ ВІКНА ===
    window.addEventListener('resize', function() {
        // Оновлення позицій всіх міток при зміні розміру вікна
        document.querySelectorAll('.card--season-complete').forEach(function(badge) {
            var cardEl = badge.closest('.card');
            if (cardEl) {
                adjustBadgePosition(cardEl, badge);
            }
        });
    });

    /**
     * Основна функція ініціалізації плагіна
     */
    function initPlugin() {
        // Перевірка активності плагіна
        if (!CONFIG.enabled) return;

        // Список контейнерів, де можуть знаходитись картки
        var containers = document.querySelectorAll('.cards, .card-list, .content, .main, .cards-list, .preview__list');

        if (containers.length > 0) {
            // Підключення спостерігача до кожного знайденого контейнера
            containers.forEach(container => {
                try {
                    observer.observe(container, {
                        childList: true,    // Спостереження за додаванням/видаленням дітей
                        subtree: true      // Спостереження за всіма нащадками
                    });
                } catch (e) {
                    console.log('Помилка спостереження за контейнером:', e);
                }
            });
        } else {
            // Якщо контейнери не знайдені - спостерігаємо за всім документом
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }

        // Обробка вже існуючих карток на сторінці
        document.querySelectorAll('.card:not([data-season-processed])').forEach((card, index) => {
            // Затримка для уникнення одночасного завантаження великої кількості карток
            setTimeout(() => addSeasonBadge(card), index * 300);
        });
    }

    // === СИСТЕМА ЗАПУСКУ ПЛАГІНА ===

    // ВАРІАНТ 1: Якщо додаток вже готовий (стандартний випадок)
    if (window.appready) {
        initPlugin();
    } 
    // ВАРІАНТ 2: Для Lampa Framework (чекаємо подію готовності)
    else if (window.Lampa && Lampa.Listener) {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') initPlugin();
        });
    } 
    // ВАРІАНТ 3: Резервний варіант (запуск через 2 секунди)
    else {
        setTimeout(initPlugin, 2000);
    }

})();

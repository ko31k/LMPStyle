(function () {
    'use strict';

    // --- Захист від повторного запуску плагіна ---
    if (window.SeasonBadgePlugin && window.SeasonBadgePlugin.__initialized) return;
    window.SeasonBadgePlugin = window.SeasonBadgePlugin || {};
    window.SeasonBadgePlugin.__initialized = true;

    // === НАЛАШТУВАННЯ ===
    var CONFIG = {
        tmdbApiKey: '1ad1fd4b4938e876aa6c96d0cded9395',   // TMDB API ключ
        cacheTime: 24 * 60 * 60 * 1000,   // час кешу (24 години)
        enabled: true,                     // вкл/викл плагін
        language: 'uk'                     // мова запитів до TMDB
    };

    // === СТИЛІ МІТКИ ===
    var style = document.createElement('style');
    style.textContent = `
    .card--season-complete {
        position: absolute;
        left: 0;
        background-color: rgba(61, 161, 141, 0.8);
        z-index: 12;
        width: fit-content;
        max-width: calc(100% - 1em);
        border-radius: 0 0.8em 0.8em 0.3em;
        overflow: hidden;
        opacity: 0;
        transition: opacity 0.22s ease-in-out;
        /* bottom буде встановлюватись динамічно через JS */
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
     * Визначає тип медіа на основі card_data
     * @param {Object} cardData - дані картки
     * @returns {string} - тип медіа ('tv', 'movie', 'unknown')
     */
    function getMediaType(cardData) {
        if (!cardData) return 'unknown';
        if (cardData.name || cardData.first_air_date) return 'tv';
        if (cardData.title || cardData.release_date) return 'movie';
        return 'unknown';
    }

    // Кеш у localStorage (простий key:value)
    var cache = JSON.parse(localStorage.getItem('seasonBadgeCache') || '{}');

    /**
     * Завантажує дані серіалу з TMDB (з кешем)
     * @param {number} tmdbId - ID серіалу в TMDB
     * @returns {Promise} - проміс з даними серіалу
     */
    function fetchSeriesData(tmdbId) {
        return new Promise(function(resolve, reject) {
            // Перевірка кешу: якщо є в кеші і не прострочено — повертаємо
            if (cache[tmdbId] && (Date.now() - cache[tmdbId].timestamp < CONFIG.cacheTime)) {
                return resolve(cache[tmdbId].data);
            }

            // Перевірка API ключа
            if (!CONFIG.tmdbApiKey || CONFIG.tmdbApiKey === 'ваш_tmdb_api_key_тут') {
                return reject(new Error('Вставте TMDB API ключ'));
            }

            // Формування URL для запиту
            var url = `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${CONFIG.tmdbApiKey}&language=${CONFIG.language}`;
            
            // Виконання HTTP запиту
            fetch(url)
                .then(response => response.json())
                .then(function(data) {
                    if (data.success === false) throw new Error(data.status_message);

                    // Зберігаємо у кеш (мінімум потрібних даних)
                    cache[tmdbId] = { data, timestamp: Date.now() };
                    localStorage.setItem('seasonBadgeCache', JSON.stringify(cache));

                    resolve(data);
                })
                .catch(reject);
        });
    }

    /**
     * Перевіряє, чи завершений останній сезон
     * @param {Object} tmdbData - дані з TMDB
     * @returns {boolean} - true якщо сезон завершений
     */
    function isSeasonComplete(tmdbData) {
        if (!tmdbData || !tmdbData.seasons || !tmdbData.last_episode_to_air) return false;
        
        var lastEpisode = tmdbData.last_episode_to_air;
        var currentSeason = tmdbData.seasons.find(s => 
            s.season_number === lastEpisode.season_number && s.season_number > 0
        );
        
        if (!currentSeason) return false;
        
        var totalEpisodes = currentSeason.episode_count || 0;
        var airedEpisodes = lastEpisode.episode_number || 0;
        
        return totalEpisodes > 0 && airedEpisodes >= totalEpisodes;
    }

    /**
     * Створює DOM-елемент мітки
     * @param {string} content - текст мітки
     * @param {boolean} loading - чи це завантажувальна мітка
     * @returns {HTMLElement} - створений елемент мітки
     */
    function createBadge(content, loading) {
        var badge = document.createElement('div');
        badge.className = 'card--season-complete' + (loading ? ' loading' : '');
        badge.innerHTML = `<div>${content}</div>`;
        return badge;
    }

    /**
     * Вирівнює сезонну мітку так, щоб вона торкалась quality-бейджа
     * @param {HTMLElement} cardEl - елемент картки
     * @param {HTMLElement} badge - елемент мітки сезону
     */
    function adjustBadgePosition(cardEl, badge) {
        // Знаходимо мітку якості відео
        let quality = cardEl.querySelector('.card__quality');
        if (quality && badge) {
            // Фактична висота мітки якості
            let qHeight = quality.offsetHeight; 
            
            // Нижній відступ мітки якості (з CSS)
            let qBottom = parseFloat(getComputedStyle(quality).bottom) || 0; 
            
            // Встановлюємо позицію сезонної мітки (вище мітки якості)
            badge.style.bottom = (qHeight + qBottom) + 'px';
        }
    }

    /**
     * Додає мітку до картки серіалу
     * @param {HTMLElement} cardEl - елемент картки
     */
    function addSeasonBadge(cardEl) {
        // Перевірка чи вже оброблено цю картку
        if (!cardEl || cardEl.hasAttribute('data-season-processed')) return;

        // Якщо card_data ще не готовий — повторимо трохи пізніше
        if (!cardEl.card_data) {
            requestAnimationFrame(() => addSeasonBadge(cardEl));
            return;
        }

        var data = cardEl.card_data;

        // Перевірка що це серіал (тільки для серіалів показуємо мітку)
        if (getMediaType(data) !== 'tv') return;

        // Знаходимо контейнер для міток
        var view = cardEl.querySelector('.card__view');
        if (!view) return;

        // Видаляємо стару мітку (якщо була)
        var oldBadge = view.querySelector('.card--season-complete');
        if (oldBadge) oldBadge.remove();

        // Створюємо тимчасову мітку завантаження
        var badge = createBadge('...', true);
        view.appendChild(badge);
        
        // ВИКЛИК 1: Вирівнювання одразу після додавання в DOM
        adjustBadgePosition(cardEl, badge);

        // Позначаємо картку як оброблену
        cardEl.setAttribute('data-season-processed', 'loading');

        // Завантажуємо дані серіалу з TMDB
        fetchSeriesData(data.id)
            .then(function(tmdbData) {
                if (isSeasonComplete(tmdbData)) {
                    var lastEpisode = tmdbData.last_episode_to_air;

                    // Оновлюємо мітку на фінальний вигляд
                    badge.className = 'card--season-complete';
                    badge.innerHTML = `<div>S${lastEpisode.season_number} ✓</div>`;

                    // ВИКЛИК 2: Вирівнювання після оновлення контенту
                    adjustBadgePosition(cardEl, badge);

                    // Плавна поява мітки
                    setTimeout(() => {
                        badge.classList.add('show');
                        // ВИКЛИК 3: Фінальне вирівнювання після показу
                        adjustBadgePosition(cardEl, badge);
                    }, 50);

                    cardEl.setAttribute('data-season-processed', 'complete');
                } else {
                    // Видаляємо мітку якщо сезон не завершений
                    badge.remove();
                    cardEl.setAttribute('data-season-processed', 'not-complete');
                }
            })
            .catch(function(error) {
                // Обробка помилок
                console.log('SeasonBadgePlugin помилка:', error.message);
                badge.remove();
                cardEl.setAttribute('data-season-processed', 'error');
            });
    }

    // === СПОСТЕРЕЖЕННЯ ЗА НОВИМИ КАРТКАМИ ===
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes?.forEach(function(node) {
                // Перевірка що це HTML елемент
                if (node.nodeType !== 1) return;

                // Якщо додана картка — обробляємо її
                if (node.classList && node.classList.contains('card')) {
                    addSeasonBadge(node);
                }

                // Якщо доданий контейнер з картками — обробляємо всі картки всередині
                if (node.querySelectorAll) {
                    node.querySelectorAll('.card').forEach(addSeasonBadge);
                }
            });
        });
    });

    // === ОБРОБНИК РОЗМІРУ ВІКНА ===
    window.addEventListener('resize', function() {
        // Оновлюємо позиції всіх міток при зміні розміру вікна
        document.querySelectorAll('.card--season-complete').forEach(function(badge) {
            var cardEl = badge.closest('.card');
            if (cardEl) {
                adjustBadgePosition(cardEl, badge);
            }
        });
    });

    /**
     * Ініціалізація плагіна
     */
    function initPlugin() {
        if (!CONFIG.enabled) return;

        // Список контейнерів де можуть з'являтись картки
        var containers = document.querySelectorAll('.cards, .card-list, .content, .main, .cards-list, .preview__list');

        if (containers.length > 0) {
            // Спостереження за кожним контейнером
            containers.forEach(container => {
                try {
                    observer.observe(container, {childList: true, subtree: true});
                } catch (e) {
                    console.log('Помилка спостереження за контейнером:', e);
                }
            });
        } else {
            // Якщо контейнери не знайдені — спостерігаємо за всім документом
            observer.observe(document.body, {childList: true, subtree: true});
        }

        // Додаємо мітки до вже існуючих карток
        document.querySelectorAll('.card:not([data-season-processed])').forEach((card, index) => {
            // Затримка для уникнення одночасного завантаження всіх карток
            setTimeout(() => addSeasonBadge(card), index * 300);
        });
    }

    // === ЗАПУСК ПЛАГІНА ПІСЛЯ ГОТОВНОСТІ ДОДАТКУ ===
    if (window.appready) {
        // Якщо додаток вже готовий — запускаємо одразу
        initPlugin();
    } else if (window.Lampa && Lampa.Listener) {
        // Для Lampa Framework — чекаємо подію готовності
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') initPlugin();
        });
    } else {
        // Запасний варіант — запуск через 2 секунди
        setTimeout(initPlugin, 2000);
    }

})();

(function () {
    'use strict';

    // --- Захист від повторного запуску плагіна ---
    if (window.SeasonBadgePlugin && window.SeasonBadgePlugin.__initialized) return;
    window.SeasonBadgePlugin = window.SeasonBadgePlugin || {};
    window.SeasonBadgePlugin.__initialized = true;

    // === НАЛАШТУВАННЯ ПЛАГІНА ===
    var CONFIG = {
        tmdbApiKey: '1ad1fd4b4938e876aa6c96d0cded9395',   // API ключ для доступу до TMDB
        cacheTime: 24 * 60 * 60 * 1000,                   // Час зберігання кешу (24 години)
        enabled: true,                                    // Активувати/деактивувати плагін
        language: 'uk'                                    // Мова для запитів до TMDB
    };

    // === СТИЛІ ДЛЯ МІТОК СЕЗОНУ ===
    var style = document.createElement('style');
    style.textContent = `
    /* Стиль для ЗАВЕРШЕНИХ сезонів (зелена мітка) */
    .card--season-complete {
        position: absolute;
        left: 0;
        bottom: 0.50em;
        background-color: rgba(61, 161, 141, 0.8);  /* Зелений колір */
        z-index: 12;
        width: fit-content;
        max-width: calc(100% - 1em);
        border-radius: 0 0.8em 0.8em 0em;
        overflow: hidden;
        opacity: 0;
        transition: opacity 0.22s ease-in-out;
    }
    
    /* Стиль для НЕЗАВЕРШЕНИХ сезонів (жовта мітка з прогресом) */
    .card--season-progress {
        position: absolute;
        left: 0;
        bottom: 0.50em;
        background-color: rgba(255, 193, 7, 0.8);   /* Жовтий колір */
        z-index: 12;
        width: fit-content;
        max-width: calc(100% - 1em);
        border-radius: 0 0.8em 0.8em 0em;
        overflow: hidden;
        opacity: 0;
        transition: opacity 0.22s ease-in-out;
    }
    
    /* Загальні стилі для тексту в мітках */
    .card--season-complete div,
    .card--season-progress div {
        text-transform: uppercase;
        font-family: 'Roboto Condensed', 'Arial Narrow', Arial, sans-serif;
        font-weight: 700;
        font-size: 1.30em;
        padding: 0.1em;
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 4px;
    }
    
    /* Колір тексту для завершених сезонів (білий на зеленому) */
    .card--season-complete div {
        color: #ffffff;
    }
    
    /* Колір тексту для незавершених сезонів (чорний на жовтому) */
    .card--season-progress div {
        color: #000000;
    }
    
    /* Клас для плавного показу мітки */
    .card--season-complete.show,
    .card--season-progress.show {
        opacity: 1;
    }
    
    /* Адаптація для мобільних пристроїв */
    @media (max-width: 768px) {
        .card--season-complete div,
        .card--season-progress div {
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
        if (!cardData) return 'unknown';
        if (cardData.name || cardData.first_air_date) return 'tv';
        if (cardData.title || cardData.release_date) return 'movie';
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
            if (cache[tmdbId] && (Date.now() - cache[tmdbId].timestamp < CONFIG.cacheTime)) {
                return resolve(cache[tmdbId].data);
            }

            if (!CONFIG.tmdbApiKey || CONFIG.tmdbApiKey === 'ваш_tmdb_api_key_тут') {
                return reject(new Error('Будь ласка, вставте коректний TMDB API ключ'));
            }

            var url = `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${CONFIG.tmdbApiKey}&language=${CONFIG.language}`;
            
            fetch(url)
                .then(response => response.json())
                .then(function(data) {
                    if (data.success === false) throw new Error(data.status_message);

                    cache[tmdbId] = { data, timestamp: Date.now() };
                    localStorage.setItem('seasonBadgeCache', JSON.stringify(cache));

                    resolve(data);
                })
                .catch(reject);
        });
    }

    /**
     * Перевіряє стан сезону та повертає інформацію про прогрес
     * @param {Object} tmdbData - дані серіалу з TMDB
     * @returns {Object|boolean} - інформація про прогрес або false
     */
    function getSeasonProgress(tmdbData) {
        if (!tmdbData || !tmdbData.seasons || !tmdbData.last_episode_to_air) return false;
        
        var lastEpisode = tmdbData.last_episode_to_air;
        var currentSeason = tmdbData.seasons.find(s => 
            s.season_number === lastEpisode.season_number && s.season_number > 0
        );
        
        if (!currentSeason) return false;
        
        var totalEpisodes = currentSeason.episode_count || 0;
        var airedEpisodes = lastEpisode.episode_number || 0;
        
        return {
            seasonNumber: lastEpisode.season_number,
            airedEpisodes: airedEpisodes,
            totalEpisodes: totalEpisodes,
            isComplete: airedEpisodes >= totalEpisodes
        };
    }

    /**
     * Створює DOM-елемент мітки сезону
     * @param {string} content - текстовий вміст мітки
     * @param {boolean} isComplete - чи є сезон завершеним
     * @param {boolean} loading - чи є це тимчасовою міткою завантаження
     * @returns {HTMLElement} - створений елемент мітки
     */
    function createBadge(content, isComplete, loading) {
        var badge = document.createElement('div');
        // Вибираємо клас в залежності від стану сезону
        var badgeClass = isComplete ? 'card--season-complete' : 'card--season-progress';
        badge.className = badgeClass + (loading ? ' loading' : '');
        badge.innerHTML = `<div>${content}</div>`;
        return badge;
    }

    /**
     * Вирівнює мітку сезону відносно мітки якості
     * @param {HTMLElement} cardEl - елемент картки
     * @param {HTMLElement} badge - елемент мітки сезону
     */
    function adjustBadgePosition(cardEl, badge) {
        let quality = cardEl.querySelector('.card__quality');
        
        if (quality && badge) {
            let qHeight = quality.offsetHeight; 
            let qBottom = parseFloat(getComputedStyle(quality).bottom) || 0; 
            badge.style.bottom = (qHeight + qBottom) + 'px';
        } else if (badge) {
            badge.style.bottom = '0.50em';
        }
    }

    /**
     * Додає мітку статусу сезону до картки серіалу
     * @param {HTMLElement} cardEl - елемент картки
     */
    function addSeasonBadge(cardEl) {
        if (!cardEl || cardEl.hasAttribute('data-season-processed')) return;

        if (!cardEl.card_data) {
            requestAnimationFrame(() => addSeasonBadge(cardEl));
            return;
        }

        var data = cardEl.card_data;
        if (getMediaType(data) !== 'tv') return;

        var view = cardEl.querySelector('.card__view');
        if (!view) return;

        // Видаляємо старі мітки обох типів
        var oldBadges = view.querySelectorAll('.card--season-complete, .card--season-progress');
        oldBadges.forEach(function(badge) {
            badge.remove();
        });

        // Створюємо тимчасову мітку завантаження (по дефолту - для незавершених)
        var badge = createBadge('...', false, true);
        view.appendChild(badge);
        adjustBadgePosition(cardEl, badge);

        cardEl.setAttribute('data-season-processed', 'loading');

        fetchSeriesData(data.id)
            .then(function(tmdbData) {
                var progressInfo = getSeasonProgress(tmdbData);
                
                if (progressInfo) {
                    var content = '';
                    var isComplete = progressInfo.isComplete;
                    
                    if (isComplete) {
                        // ДЛЯ ЗАВЕРШЕНИХ СЕЗОНІВ: "S1 ✓" (зелена мітка)
                        content = `S${progressInfo.seasonNumber} ✓`;
                    } else {
                        // ДЛЯ НЕЗАВЕРШЕНИХ СЕЗОНІВ: "S1 5/10" (жовта мітка з прогресом)
                        content = `S${progressInfo.seasonNumber} ${progressInfo.airedEpisodes}/${progressInfo.totalEpisodes}`;
                    }
                    
                    // Оновлюємо мітку з правильним класом та вмістом
                    badge.className = isComplete ? 'card--season-complete' : 'card--season-progress';
                    badge.innerHTML = `<div>${content}</div>`;
                    adjustBadgePosition(cardEl, badge);

                    // Плавний показ мітки
                    setTimeout(() => {
                        badge.classList.add('show');
                        adjustBadgePosition(cardEl, badge);
                    }, 50);

                    cardEl.setAttribute('data-season-processed', isComplete ? 'complete' : 'in-progress');
                } else {
                    // Якщо не вдалося отримати інформацію про сезон
                    badge.remove();
                    cardEl.setAttribute('data-season-processed', 'error');
                }
            })
            .catch(function(error) {
                console.log('SeasonBadgePlugin помилка:', error.message);
                badge.remove();
                cardEl.setAttribute('data-season-processed', 'error');
            });
    }

    // === СИСТЕМА СПОСТЕРЕЖЕННЯ ЗА НОВИМИ КАРТКАМИ ===
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes?.forEach(function(node) {
                if (node.nodeType !== 1) return;

                if (node.classList && node.classList.contains('card')) {
                    addSeasonBadge(node);
                }

                if (node.querySelectorAll) {
                    node.querySelectorAll('.card').forEach(addSeasonBadge);
                }
            });
        });
    });

    // === ОБРОБНИК ЗМІНИ РОЗМІРУ ВІКНА ===
    window.addEventListener('resize', function() {
        // Оновлюємо позиції всіх міток при зміні розміру вікна
        var allBadges = document.querySelectorAll('.card--season-complete, .card--season-progress');
        allBadges.forEach(function(badge) {
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
        if (!CONFIG.enabled) return;

        var containers = document.querySelectorAll('.cards, .card-list, .content, .main, .cards-list, .preview__list');

        if (containers.length > 0) {
            containers.forEach(container => {
                try {
                    observer.observe(container, {childList: true, subtree: true});
                } catch (e) {
                    console.log('Помилка спостереження за контейнером:', e);
                }
            });
        } else {
            observer.observe(document.body, {childList: true, subtree: true});
        }

        document.querySelectorAll('.card:not([data-season-processed])').forEach((card, index) => {
            setTimeout(() => addSeasonBadge(card), index * 300);
        });
    }

    // === СИСТЕМА ЗАПУСКУ ПЛАГІНА ===
    if (window.appready) {
        initPlugin();
    } else if (window.Lampa && Lampa.Listener) {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') initPlugin();
        });
    } else {
        setTimeout(initPlugin, 2000);
    }

})();

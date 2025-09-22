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
        enabled: true,                        // вкл/викл плагін
        language: 'uk'                        // мова запитів до TMDB
    };

    // === СТИЛІ МІТКИ ===
    var style = document.createElement('style');
    style.textContent = `
    .card--season-complete {
        position: absolute;
        bottom: calc(0.50em + 2.82em); /* вище мітки якості */
        left: 0;
        background-color: rgba(61, 161, 141, 0.8);
        z-index: 12;
        width: fit-content;
        max-width: calc(100% - 1em);
        border-radius: 0 0.8em 0.8em 0.3em;
        overflow: hidden;
        opacity: 0; /* плавна поява */
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
        .card--season-complete {
            bottom: calc(0.50em + 1.65em); /* трохи менше для мобільних */
        }
        .card--season-complete div {
            font-size: 1.20em;
        }
    }
    `;
    document.head.appendChild(style);

    // === ДОПОМІЖНІ ФУНКЦІЇ ===

    /**
     * Визначає тип медіа на основі card_data
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
     */
    function fetchSeriesData(tmdbId) {
        return new Promise(function(resolve, reject) {
            // Якщо є в кеші і не прострочено — повертаємо
            if (cache[tmdbId] && (Date.now() - cache[tmdbId].timestamp < CONFIG.cacheTime)) {
                return resolve(cache[tmdbId].data);
            }

            // Перевірка ключа
            if (!CONFIG.tmdbApiKey || CONFIG.tmdbApiKey === 'ваш_tmdb_api_key_тут') {
                return reject(new Error('Вставте TMDB API ключ'));
            }

            var url = `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${CONFIG.tmdbApiKey}&language=${CONFIG.language}`;
            
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
     */
    function createBadge(content, loading) {
        var badge = document.createElement('div');
        badge.className = 'card--season-complete' + (loading ? ' loading' : '');
        badge.innerHTML = `<div>${content}</div>`;
        return badge;
    }

    /**
     * Додає мітку до картки серіалу
     */
    function addSeasonBadge(cardEl) {
        if (!cardEl || cardEl.hasAttribute('data-season-processed')) return;

        // Якщо card_data ще не готовий — повторимо трохи пізніше
        if (!cardEl.card_data) {
            requestAnimationFrame(() => addSeasonBadge(cardEl));
            return;
        }

        var data = cardEl.card_data;

        // Перевірка що це серіал
        if (getMediaType(data) !== 'tv') return;

        var view = cardEl.querySelector('.card__view');
        if (!view) return;

        // Видаляємо стару мітку (якщо була)
        var oldBadge = view.querySelector('.card--season-complete');
        if (oldBadge) oldBadge.remove();

        // Показуємо тимчасову мітку "..."
        var badge = createBadge('...', true);
        view.appendChild(badge);

        cardEl.setAttribute('data-season-processed', 'loading');

        // Завантажуємо дані серіалу
        fetchSeriesData(data.id)
            .then(function(tmdbData) {
                if (isSeasonComplete(tmdbData)) {
                    var lastEpisode = tmdbData.last_episode_to_air;

                    // Оновлюємо мітку на "S{номер} ✓"
                    badge.className = 'card--season-complete';
                    badge.innerHTML = `<div>S${lastEpisode.season_number} ✓</div>`;

                    // Плавна поява
                    setTimeout(() => badge.classList.add('show'), 50);

                    cardEl.setAttribute('data-season-processed', 'complete');
                } else {
                    badge.remove();
                    cardEl.setAttribute('data-season-processed', 'not-complete');
                }
            })
            .catch(function(error) {
                console.log('SeasonBadgePlugin помилка:', error.message);
                badge.remove();
                cardEl.setAttribute('data-season-processed', 'error');
            });
    }

    // === СПОСТЕРЕЖЕННЯ ЗА НОВИМИ КАРТКАМИ ===
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes?.forEach(function(node) {
                if (node.nodeType !== 1) return;

                // Якщо це картка — додаємо мітку
                if (node.classList && node.classList.contains('card')) {
                    addSeasonBadge(node);
                }

                // Якщо всередині є картки
                if (node.querySelectorAll) {
                    node.querySelectorAll('.card').forEach(addSeasonBadge);
                }
            });
        });
    });

    /**
     * Ініціалізація плагіна
     */
    function initPlugin() {
        if (!CONFIG.enabled) return;

        var containers = document.querySelectorAll('.cards, .card-list, .content, .main, .cards-list, .preview__list');

        if (containers.length > 0) {
            containers.forEach(container => {
                try {
                    observer.observe(container, {childList: true, subtree: true});
                } catch (e) {}
            });
        } else {
            observer.observe(document.body, {childList: true, subtree: true});
        }

        // Додаємо мітки до вже існуючих карток
        document.querySelectorAll('.card:not([data-season-processed])').forEach((card, index) => {
            setTimeout(() => addSeasonBadge(card), index * 300); // невелика затримка щоб не було "ривка"
        });
    }

    // === Запуск плагіна після готовності додатку ===
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

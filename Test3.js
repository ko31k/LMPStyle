(function () {
    'use strict';

    if (window.SeasonBadgePlugin && window.SeasonBadgePlugin.__initialized) return;
    window.SeasonBadgePlugin = window.SeasonBadgePlugin || {};
    window.SeasonBadgePlugin.__initialized = true;

    // === НАЛАШТУВАННЯ ===
    var CONFIG = {
        tmdbApiKey: '1ad1fd4b4938e876aa6c96d0cded9395', // ОБОВ'ЯЗКОВО вставте ключ!
        cacheTime: 7 * 24 * 60 * 60 * 1000,
        enabled: true,
        language: 'uk'
    };

    // === СТИЛІ ===
    var style = document.createElement('style');
    style.textContent = `
    .card--seria-status {
        position: absolute;
        right: 0;
        bottom: 0.50em;
        z-index: 11;
        background: rgba(76, 175, 80, 0.85);
        color: #fff;
        font-family: 'Roboto Condensed','Arial Narrow',Arial,sans-serif;
        font-weight: 700;
        font-size: 1.20em;
        border-radius: 0.8em 0 0.3em 0.8em;
        padding: 0.15em 0.5em;
        white-space: nowrap;
        text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.3);
    }
    
    .card--seria-status.loading {
        background: rgba(33, 150, 243, 0.85);
    }
    
    .card--seria-status.not-complete {
        background: rgba(255, 193, 7, 0.85);
    }
    
    @media (max-width: 768px) {
        .card--seria-status {
            font-size: 1.10em;
            padding: 0.1em 0.4em;
        }
    }
    `;
    document.head.appendChild(style);

    // === ДОПОМІЖНІ ФУНКЦІЇ ===
    function getMediaType(cardData) {
        if (!cardData) return 'unknown';
        if (cardData.name || cardData.original_name || cardData.first_air_date) return 'tv';
        if (cardData.title || cardData.original_title || cardData.release_date) return 'movie';
        return 'unknown';
    }

    var cache = JSON.parse(localStorage.getItem('seasonBadgeCache') || '{}');

    function fetchSeriesData(tmdbId) {
        return new Promise(function(resolve, reject) {
            if (cache[tmdbId] && (Date.now() - cache[tmdbId].timestamp < CONFIG.cacheTime)) {
                resolve(cache[tmdbId].data);
                return;
            }

            if (!CONFIG.tmdbApiKey || CONFIG.tmdbApiKey === 'ваш_tmdb_api_key_тут') {
                reject(new Error('Вставте TMDB API ключ'));
                return;
            }

            var url = `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${CONFIG.tmdbApiKey}&language=${CONFIG.language}`;
            
            fetch(url)
                .then(response => response.json())
                .then(function(data) {
                    if (data.success === false) throw new Error(data.status_message);
                    
                    cache[tmdbId] = { data: data, timestamp: Date.now() };
                    localStorage.setItem('seasonBadgeCache', JSON.stringify(cache));
                    resolve(data);
                })
                .catch(reject);
        });
    }

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

    // === ОСНОВНА ЛОГІКА ===
    function addSeriaBadge(cardEl) {
        if (!cardEl || cardEl.hasAttribute('data-seria-status')) return;

        var checkData = function(attempt) {
            if (attempt > 10) return;

            var data = cardEl.card_data;
            if (!data) {
                setTimeout(() => checkData(attempt + 1), 200);
                return;
            }

            // Перевіряємо чи це серіал
            if (getMediaType(data) !== 'tv') return;

            var view = cardEl.querySelector('.card__view');
            if (!view) return;

            // Видаляємо старі мітки
            var oldBadge = view.querySelector('.card--seria-status');
            if (oldBadge) oldBadge.remove();

            // Додаємо мітку завантаження
            var badge = document.createElement('div');
            badge.className = 'card--seria-status loading';
            badge.textContent = '...';
            view.appendChild(badge);

            cardEl.setAttribute('data-seria-status', 'loading');

            // Завантажуємо дані з TMDB
            fetchSeriesData(data.id)
                .then(function(tmdbData) {
                    if (isSeasonComplete(tmdbData)) {
                        var lastEpisode = tmdbData.last_episode_to_air;
                        badge.className = 'card--seria-status';
                        badge.textContent = 'S' + lastEpisode.season_number + ' ✓';
                        cardEl.setAttribute('data-seria-status', 'complete');
                    } else {
                        badge.remove();
                        cardEl.setAttribute('data-seria-status', 'not-complete');
                    }
                })
                .catch(function(error) {
                    console.log('Помилка:', error);
                    badge.className = 'card--seria-status not-complete';
                    badge.textContent = 'Помилка API';
                    setTimeout(() => badge.remove(), 3000);
                });
        };

        checkData(0);
    }

    // === MUTATION OBSERVER ===
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (!mutation.addedNodes) return;
            
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType !== 1) return;
                
                if (node.classList && node.classList.contains('card')) {
                    setTimeout(() => addSeriaBadge(node), 100);
                }
                
                if (node.querySelectorAll) {
                    node.querySelectorAll('.card').forEach(function(card) {
                        setTimeout(() => addSeriaBadge(card), 100);
                    });
                }
            });
        });
    });

    function initPlugin() {
        if (!CONFIG.enabled) return;
        
        var containers = document.querySelectorAll('.cards, .card-list, .content, .main, .cards-list, .preview__list');
        if (containers.length > 0) {
            containers.forEach(function(container) {
                try {
                    observer.observe(container, {childList: true, subtree: true});
                } catch(e) {}
            });
        } else {
            observer.observe(document.body, {childList: true, subtree: true});
        }

        setTimeout(function() {
            document.querySelectorAll('.card:not([data-seria-status])').forEach(function(card, index) {
                setTimeout(() => addSeriaBadge(card), index * 500);
            });
        }, 1000);
    }

    // Запуск
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

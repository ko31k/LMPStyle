(function () {
    'use strict';

    if (window.SeasonBadgePlugin && window.SeasonBadgePlugin.__initialized) return;
    window.SeasonBadgePlugin = window.SeasonBadgePlugin || {};
    window.SeasonBadgePlugin.__initialized = true;

    // === НАЛАШТУВАНЯ TMDB ===
    var CONFIG = {
        tmdbApiKey: '1ad1fd4b4938e876aa6c96d0cded9395', // Безкоштовний ключ з themoviedb.org
        cacheTime: 7 * 24 * 60 * 60 * 1000, // 7 днів кешу
        enabled: true,
        maxParallelRequests: 3, // Обмеження запитів
        language: 'uk' // Мова для даних
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
        display: flex;
        align-items: center;
        gap: 4px;
    }
    
    .card--seria-status.loading {
        background: rgba(33, 150, 243, 0.85);
    }
    
    .card--seria-status.error {
        background: rgba(244, 67, 54, 0.85);
    }
    
    @media (max-width: 768px) {
        .card--seria-status {
            font-size: 1.10em;
            padding: 0.1em 0.4em;
        }
    }
    `;
    document.head.appendChild(style);

    // === КЕШ ===
    var cache = JSON.parse(localStorage.getItem('seasonBadgeCache') || '{}');
    var activeRequests = 0;
    var requestQueue = [];

    function saveCache() {
        // Очищаємо старий кеш
        var now = Date.now();
        for (var key in cache) {
            if (now - cache[key].timestamp > CONFIG.cacheTime) {
                delete cache[key];
            }
        }
        localStorage.setItem('seasonBadgeCache', JSON.stringify(cache));
    }

    // === ЧЕРГА ЗАПИТІВ ===
    function processQueue() {
        if (activeRequests >= CONFIG.maxParallelRequests || requestQueue.length === 0) return;
        
        var task = requestQueue.shift();
        activeRequests++;
        
        task(function() {
            activeRequests--;
            setTimeout(processQueue, 100);
        });
    }

    function enqueueRequest(tmdbId, callback) {
        requestQueue.push(function(done) {
            fetchSeriesData(tmdbId).then(function(data) {
                callback(data);
                done();
            }).catch(function(error) {
                callback(null, error);
                done();
            });
        });
        processQueue();
    }

    // === TMDB API ===
    function fetchSeriesData(tmdbId) {
        return new Promise(function(resolve, reject) {
            // Перевіряємо кеш
            if (cache[tmdbId] && (Date.now() - cache[tmdbId].timestamp < CONFIG.cacheTime)) {
                resolve(cache[tmdbId].data);
                return;
            }

            var url = `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${CONFIG.tmdbApiKey}&language=${CONFIG.language}&append_to_response=season%2Flatest`;
            
            fetch(url)
                .then(function(response) {
                    if (!response.ok) throw new Error('HTTP ' + response.status);
                    return response.json();
                })
                .then(function(data) {
                    if (data.success === false) {
                        reject(new Error(data.status_message));
                        return;
                    }
                    
                    cache[tmdbId] = {
                        data: data,
                        timestamp: Date.now()
                    };
                    saveCache();
                    resolve(data);
                })
                .catch(reject);
        });
    }

    // === ПЕРЕВІРКА СЕЗОНУ ===
    function isSeasonComplete(tmdbData) {
        if (!tmdbData || !tmdbData.seasons || !tmdbData.last_episode_to_air) {
            return false;
        }
        
        var lastEpisode = tmdbData.last_episode_to_air;
        var seasons = tmdbData.seasons || [];
        
        // Шукаємо поточний сезон (виключаємо сезон 0)
        var currentSeason = seasons.find(function(season) {
            return season.season_number === lastEpisode.season_number && season.season_number > 0;
        });
        
        if (!currentSeason) return false;
        
        var totalEpisodes = currentSeason.episode_count || 0;
        var airedEpisodes = lastEpisode.episode_number || 0;
        
        // Перевіряємо чи всі серії вийшли
        var isComplete = totalEpisodes > 0 && airedEpisodes >= totalEpisodes;
        
        return isComplete;
    }

    function getBadgeText(tmdbData) {
        if (!isSeasonComplete(tmdbData)) return null;
        
        var lastEpisode = tmdbData.last_episode_to_air;
        var currentSeason = tmdbData.seasons.find(function(s) {
            return s.season_number === lastEpisode.season_number;
        });
        
        return 'S' + lastEpisode.season_number + ' ✓'; // Наприклад: "S3 ✓"
    }

    // === ОБРОБКА КАРТКИ ===
    function addSeriaBadge(cardEl) {
        if (!cardEl || cardEl.hasAttribute('data-seria-status')) return;

        var data = cardEl.card_data;
        if (!data || data.type !== 'tv') return;

        var view = cardEl.querySelector('.card__view');
        if (!view) return;

        // Додаємо мітку завантаження
        var badge = document.createElement('div');
        badge.className = 'card--seria-status loading';
        badge.innerHTML = '⏳';
        view.appendChild(badge);

        cardEl.setAttribute('data-seria-status', 'loading');

        // Додаємо картку в чергу запитів
        enqueueRequest(data.id, function(tmdbData, error) {
            if (error) {
                console.log('TMDB Error for', data.id, error);
                badge.className = 'card--seria-status error';
                badge.innerHTML = '❌';
                setTimeout(function() { badge.remove(); }, 2000);
                cardEl.setAttribute('data-seria-status', 'error');
                return;
            }

            if (!tmdbData) {
                badge.remove();
                cardEl.setAttribute('data-seria-status', 'no-data');
                return;
            }

            var badgeText = getBadgeText(tmdbData);
            if (badgeText) {
                badge.className = 'card--seria-status';
                badge.innerHTML = '✅ ' + badgeText;
                cardEl.setAttribute('data-seria-status', 'complete');
            } else {
                badge.remove();
                cardEl.setAttribute('data-seria-status', 'not-complete');
            }
        });
    }

    // === MUTATION OBSERVER ===
    var observer = new MutationObserver(function(mutations) {
        var newCards = [];
        
        mutations.forEach(function(mutation) {
            if (!mutation.addedNodes) return;
            
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType !== 1) return;
                
                if (node.classList && node.classList.contains('card')) {
                    newCards.push(node);
                }
                
                if (node.querySelectorAll) {
                    var nestedCards = node.querySelectorAll('.card');
                    nestedCards.forEach(function(card) {
                        newCards.push(card);
                    });
                }
            });
        });

        newCards.forEach(function(card) {
            setTimeout(function() { addSeriaBadge(card); }, 100);
        });
    });

    // === ІНІЦІАЛІЗАЦІЯ ===
    function initPlugin() {
        if (!CONFIG.enabled) return;
        
        if (!CONFIG.tmdbApiKey || CONFIG.tmdbApiKey === 'ваш_tmdb_api_key_тут') {
            console.log('❌ SeasonBadgePlugin: Будь ласка, вставте ваш TMDB API ключ');
            return;
        }
        
        // Спостерігаємо за контейнерами
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

        // Обробляємо існуючі картки
        setTimeout(function() {
            var existingCards = document.querySelectorAll('.card:not([data-seria-status])');
            console.log('🔄 Обробка існуючих карток:', existingCards.length);
            
            existingCards.forEach(function(card, index) {
                setTimeout(function() { addSeriaBadge(card); }, index * 300);
            });
        }, 1500);
        
        console.log('✅ SeasonBadgePlugin з TMDB API ініціалізовано');
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

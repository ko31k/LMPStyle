(function () {
    'use strict';

    if (window.SeasonBadgePlugin && window.SeasonBadgePlugin.__initialized) return;
    window.SeasonBadgePlugin = window.SeasonBadgePlugin || {};
    window.SeasonBadgePlugin.__initialized = true;

    // === СТИЛІ З РІЗНИМИ КОЛЬОРАМИ ДЛЯ ДІАГНОСТИКИ ===
    var style = document.createElement('style');
    style.textContent = `
    .card--seria-status {
        position: absolute;
        right: 0;
        bottom: 0.50em;
        z-index: 11;
        color: #fff;
        font-family: 'Roboto Condensed','Arial Narrow',Arial,sans-serif;
        font-weight: 700;
        font-size: 1.20em;
        border-radius: 0.8em 0 0.3em 0.8em;
        padding: 0.15em 0.5em;
        white-space: nowrap;
        text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.3);
    }
    
    /* Зелений - сезон завершений */
    .card--seria-status.complete {
        background: rgba(76, 175, 80, 0.85);
    }
    
    /* Червоний - немає даних */
    .card--seria-status.no-data {
        background: rgba(244, 67, 54, 0.85);
    }
    
    /* Сірий - не серіал */
    .card--seria-status.not-tv {
        background: rgba(158, 158, 158, 0.85);
    }
    
    /* Жовтий - сезон не завершений */
    .card--seria-status.not-complete {
        background: rgba(255, 193, 7, 0.85);
    }
    
    /* Синій - очікування даних */
    .card--seria-status.waiting {
        background: rgba(33, 150, 243, 0.85);
    }
    `;
    document.head.appendChild(style);

    // === ОБРОБКА КАРТОК ===
    function addSeriaBadge(cardEl) {
        if (!cardEl || cardEl.hasAttribute('data-seria-status')) return;

        // Додаємо тимчасову мітку "очікування"
        var view = cardEl.querySelector('.card__view');
        if (!view) return;
        
        var tempBadge = document.createElement('div');
        tempBadge.className = 'card--seria-status waiting';
        tempBadge.textContent = '...';
        view.appendChild(tempBadge);

        // Чекаємо на card_data
        var checkData = function(attempt) {
            if (attempt > 10) {
                tempBadge.className = 'card--seria-status no-data';
                tempBadge.textContent = 'Нема даних';
                cardEl.setAttribute('data-seria-status', 'timeout');
                return;
            }

            var data = cardEl.card_data;

            if (!data) {
                tempBadge.textContent = 'Заван...';
                setTimeout(function(){ checkData(attempt + 1); }, 200);
                return;
            }

            // Оновлюємо мітку відповідно до статусу
            if (data.type !== 'tv') {
                tempBadge.className = 'card--seria-status not-tv';
                tempBadge.textContent = 'Не серіал';
                cardEl.setAttribute('data-seria-status', 'not-tv');
                return;
            }

            if (!data.seasons || !data.last_episode_to_air) {
                tempBadge.className = 'card--seria-status no-data';
                tempBadge.textContent = 'Нема сезонів';
                cardEl.setAttribute('data-seria-status', 'no-seasons');
                return;
            }

            var lastEpisode = data.last_episode_to_air;
            var seasons = data.seasons || [];
            
            var currentSeason = seasons.find(function(season) {
                return season.season_number === lastEpisode.season_number && season.season_number > 0;
            });

            if (!currentSeason) {
                tempBadge.className = 'card--seria-status no-data';
                tempBadge.textContent = 'Нема сезону';
                cardEl.setAttribute('data-seria-status', 'no-season');
                return;
            }

            var totalEpisodes = currentSeason.episode_count || 0;
            var airedEpisodes = lastEpisode.episode_number || 0;
            var isComplete = totalEpisodes > 0 && airedEpisodes >= totalEpisodes;

            if (isComplete) {
                tempBadge.className = 'card--seria-status complete';
                tempBadge.textContent = 'S' + lastEpisode.season_number + ' ✓';
                cardEl.setAttribute('data-seria-status', 'complete');
            } else {
                tempBadge.className = 'card--seria-status not-complete';
                tempBadge.textContent = 'S' + lastEpisode.season_number + ' ' + airedEpisodes + '/' + totalEpisodes;
                cardEl.setAttribute('data-seria-status', 'not-complete');
            }
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
                    setTimeout(function(){ addSeriaBadge(node); }, 100);
                }
                
                if (node.querySelectorAll) {
                    var nestedCards = node.querySelectorAll('.card');
                    nestedCards.forEach(function(card) {
                        setTimeout(function(){ addSeriaBadge(card); }, 100);
                    });
                }
            });
        });
    });

    // === ІНІЦІАЛІЗАЦІЯ ===
    function initPlugin() {        
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
            existingCards.forEach(function(card, index) {
                setTimeout(function(){ addSeriaBadge(card); }, index * 300);
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

(function () {
    'use strict';

    if (window.SeasonCompletePlugin && window.SeasonCompletePlugin.__initialized) return;
    window.SeasonCompletePlugin = window.SeasonCompletePlugin || {};
    window.SeasonCompletePlugin.__initialized = true;

    // Налаштування
    var CONFIG = {
        enabled: true,
        text: 'Усі серії',
        showIcon: true
    };

    // Стилі в стилі Quality+.js для правого нижнього кута
    var style = document.createElement('style');
    style.textContent = `
        .season-complete-badge {
            position: absolute;
            bottom: 0.50em;
            right: 0;
            background: rgba(76, 175, 80, 0.85);
            z-index: 12;
            width: fit-content;
            max-width: calc(100% - 1em);
            border-radius: 0.8em 0 0.3em 0.8em;
            overflow: hidden;
        }
        
        .season-complete-badge div {
            text-transform: uppercase;
            font-family: 'Roboto Condensed', 'Arial Narrow', Arial, sans-serif;
            font-weight: 700;
            letter-spacing: 0.1px;
            font-size: 1.20em;
            color: #ffffff;
            padding: 0.15em 0.5em;
            white-space: nowrap;
            text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            gap: 4px;
        }
        
        .season-complete-badge__icon {
            font-size: 1.1em;
            display: ${CONFIG.showIcon ? 'block' : 'none'};
        }
        
        /* Анімація появи як у Quality+.js */
        .season-complete-badge {
            opacity: 0;
            transition: opacity 0.22s ease-in-out;
        }
        
        .season-complete-badge.show {
            opacity: 1;
        }
        
        @media (max-width: 768px) {
            .season-complete-badge div {
                font-size: 1.10em;
                padding: 0.1em 0.4em;
            }
        }
    `;
    document.head.appendChild(style);

    // Функція перевірки завершеності останнього сезону
    function isSeasonComplete(cardData) {
        try {
            if (!cardData || cardData.type !== 'tv') return false;
            if (!cardData.seasons || !Array.isArray(cardData.seasons)) return false;
            
            var lastEpisode = cardData.last_episode_to_air;
            if (!lastEpisode || !lastEpisode.season_number) return false;
            
            // Шукаємо останній сезон (виключаємо сезон 0)
            var lastSeason = cardData.seasons.find(function(season) {
                return season.season_number === lastEpisode.season_number && season.season_number > 0;
            });
            
            if (!lastSeason) return false;
            
            var totalEpisodes = parseInt(lastSeason.episode_count) || 0;
            var airedEpisodes = parseInt(lastEpisode.episode_number) || 0;
            
            // Перевіряємо чи всі серії останнього сезону вийшли
            return totalEpisodes > 0 && airedEpisodes >= totalEpisodes;
            
        } catch (error) {
            console.log('Season Complete Plugin: error checking season', error);
            return false;
        }
    }

    // Функція додавання мітки
    function addSeasonBadge(cardElement) {
        if (!cardElement || cardElement.hasAttribute('data-season-processed')) return;
        
        // Чекаємо на завантаження даних картки
        var checkData = function(attempt) {
            if (attempt > 10) {
                cardElement.setAttribute('data-season-processed', 'true');
                return;
            }
            
            var cardData = cardElement.card_data;
            if (!cardData) {
                setTimeout(function() { checkData(attempt + 1); }, 100);
                return;
            }
            
            // Перевіряємо чи останній сезон завершений
            if (!isSeasonComplete(cardData)) {
                cardElement.setAttribute('data-season-processed', 'true');
                return;
            }
            
            // Створюємо мітку
            var cardView = cardElement.querySelector('.card__view');
            if (!cardView) {
                cardElement.setAttribute('data-season-processed', 'true');
                return;
            }
            
            // Видаляємо старі мітки
            var oldBadge = cardView.querySelector('.season-complete-badge');
            if (oldBadge) oldBadge.remove();
            
            var badge = document.createElement('div');
            badge.className = 'season-complete-badge';
            badge.innerHTML = `
                <div>
                    ${CONFIG.showIcon ? '<span class="season-complete-badge__icon">✅</span>' : ''}
                    <span>${CONFIG.text}</span>
                </div>
            `;
            
            cardView.appendChild(badge);
            cardElement.setAttribute('data-season-processed', 'true');
            
            // Анімація появи
            setTimeout(function() {
                badge.classList.add('show');
            }, 50);
        };
        
        checkData(0);
    }

    // MutationObserver для відстеження нових карток
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) {
                        if (node.classList && node.classList.contains('card')) {
                            setTimeout(function() { addSeasonBadge(node); }, 100);
                        }
                        
                        var cards = node.querySelectorAll && node.querySelectorAll('.card');
                        if (cards) {
                            cards.forEach(function(card) {
                                setTimeout(function() { addSeasonBadge(card); }, 100);
                            });
                        }
                    }
                });
            }
        });
    });

    // Ініціалізація плагіна
    function initPlugin() {
        if (!CONFIG.enabled) return;
        
        // Спостерігаємо за контейнерами карток
        var containers = document.querySelectorAll('.cards, .card-list, .content, .main, .cards-list, .preview__list');
        if (containers.length > 0) {
            containers.forEach(function(container) {
                try {
                    observer.observe(container, { childList: true, subtree: true });
                } catch (e) {}
            });
        } else {
            observer.observe(document.body, { childList: true, subtree: true });
        }
        
        // Обробляємо існуючі картки
        setTimeout(function() {
            var existingCards = document.querySelectorAll('.card:not([data-season-processed])');
            existingCards.forEach(function(card) {
                setTimeout(function() { addSeasonBadge(card); }, 200);
            });
        }, 1500);
        
        console.log('Season Complete Plugin: initialized');
    }

    // Запуск після готовності Lampa
    if (window.appready) {
        initPlugin();
    } else {
        Lampa.Listener.follow('app', function(event) {
            if (event.type === 'ready') initPlugin();
        });
    }

})();

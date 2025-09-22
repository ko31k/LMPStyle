(function () {
    'use strict';

    if (window.SeasonCompletePlugin && window.SeasonCompletePlugin.__initialized) return;
    window.SeasonCompletePlugin = window.SeasonCompletePlugin || {};
    window.SeasonCompletePlugin.__initialized = true;

    // Налаштування
    var CONFIG = {
        enabled: true,
        position: 'bottom-right', // bottom-right, bottom-left, top-right, top-left
        showIcon: true,
        text: 'Усі серії',
        backgroundColor: 'rgba(76, 175, 80, 0.9)', // зелений колір
        textColor: '#ffffff',
        fontSize: '0.85em',
        borderRadius: '4px',
        padding: '3px 6px',
        margin: '5px'
    };

    // Додаємо стилі
    var style = document.createElement('style');
    style.textContent = `
        .season-complete-badge {
            position: absolute;
            z-index: 10;
            background: ${CONFIG.backgroundColor};
            color: ${CONFIG.textColor};
            font-size: ${CONFIG.fontSize};
            border-radius: ${CONFIG.borderRadius};
            padding: ${CONFIG.padding};
            margin: ${CONFIG.margin};
            display: flex;
            align-items: center;
            gap: 4px;
            font-weight: 600;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
            pointer-events: none;
            user-select: none;
        }
        
        .season-complete-badge.bottom-right {
            bottom: 0;
            right: 0;
            border-radius: 8px 0 0 0;
        }
        
        .season-complete-badge.bottom-left {
            bottom: 0;
            left: 0;
            border-radius: 0 8px 0 0;
        }
        
        .season-complete-badge.top-right {
            top: 0;
            right: 0;
            border-radius: 0 0 0 8px;
        }
        
        .season-complete-badge.top-left {
            top: 0;
            left: 0;
            border-radius: 0 0 8px 0;
        }
        
        .season-complete-badge__icon {
            font-size: 1.1em;
            display: ${CONFIG.showIcon ? 'block' : 'none'};
        }
    `;
    document.head.appendChild(style);

    // Функція перевірки завершеності сезону
    function isSeasonComplete(cardData) {
        if (!cardData || cardData.type !== 'tv') return false;
        
        var seasons = cardData.seasons || [];
        var lastEpisode = cardData.last_episode_to_air;
        
        if (!lastEpisode || !seasons.length) return false;
        
        // Шукаємо поточний сезон
        var currentSeason = seasons.find(function(season) {
            return season.season_number === lastEpisode.season_number && season.season_number > 0;
        });
        
        if (!currentSeason) return false;
        
        // Перевіряємо чи всі серії вийшли
        var totalEpisodes = currentSeason.episode_count || 0;
        var airedEpisodes = lastEpisode.episode_number || 0;
        
        return totalEpisodes > 0 && airedEpisodes >= totalEpisodes;
    }

    // Функція додавання мітки
    function addSeasonBadge(cardElement, cardData) {
        if (!cardElement || !cardData) return;
        
        // Перевіряємо чи вже є мітка
        if (cardElement.querySelector('.season-complete-badge')) return;
        
        // Перевіряємо чи сезон завершений
        if (!isSeasonComplete(cardData)) return;
        
        var cardView = cardElement.querySelector('.card__view, .card-v');
        if (!cardView) return;
        
        // Створюємо мітку
        var badge = document.createElement('div');
        badge.className = 'season-complete-badge ' + CONFIG.position;
        badge.innerHTML = `
            ${CONFIG.showIcon ? '<span class="season-complete-badge__icon">✅</span>' : ''}
            <span class="season-complete-badge__text">${CONFIG.text}</span>
        `;
        
        cardView.appendChild(badge);
    }

    // Обробник для нових карток
    function handleNewCards() {
        var cards = document.querySelectorAll('.card:not([data-season-checked])');
        
        cards.forEach(function(card) {
            card.setAttribute('data-season-checked', 'true');
            
            if (!card.card_data) return;
            
            // Чекаємо трохи поки картка повністю завантажиться
            setTimeout(function() {
                addSeasonBadge(card, card.card_data);
            }, 100);
        });
    }

    // MutationObserver для відстеження нових карток
    var observer = new MutationObserver(function(mutations) {
        var hasNewCards = mutations.some(function(mutation) {
            return mutation.addedNodes && mutation.addedNodes.length > 0;
        });
        
        if (hasNewCards) {
            setTimeout(handleNewCards, 50);
        }
    });

    // Ініціалізація плагіна
    function initPlugin() {
        if (!CONFIG.enabled) return;
        
        // Спостерігаємо за змінами в DOM
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Обробляємо вже існуючі картки
        setTimeout(handleNewCards, 1000);
        
        console.log('Season Complete Plugin: initialized');
    }

    // Запускаємо після завантаження Lampa
    if (window.appready) {
        initPlugin();
    } else {
        Lampa.Listener.follow('app', function(event) {
            if (event.type === 'ready') initPlugin();
        });
    }

    // Додаємо налаштування в інтерфейс Lampa (опціонально)
    Lampa.SettingsApi.addParam({
        component: 'interface',
        param: {
            name: 'season_complete_badge',
            type: 'trigger',
            default: true
        },
        field: {
            name: 'Показувати мітку "Усі серії"'
        }
    });

})();

(function () {
    'use strict';

    if (window.SeasonBadgePlugin && window.SeasonBadgePlugin.__initialized) return;
    window.SeasonBadgePlugin = window.SeasonBadgePlugin || {};
    window.SeasonBadgePlugin.__initialized = true;

    // === СТИЛІ ===
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
    
    .card--seria-status.tv-series { 
        background: rgba(76, 175, 80, 0.85); 
    }
    .card--seria-status.movie { 
        background: rgba(158, 158, 158, 0.85); 
    }
    .card--seria-status.unknown { 
        background: rgba(255, 193, 7, 0.85); 
    }
    `;
    document.head.appendChild(style);

    // === ФУНКЦІЯ ВИЗНАЧЕННЯ ТИПУ ===
    function getMediaType(cardData) {
        if (!cardData) return 'unknown';
        
        // Спосіб 1: Явно вказаний тип
        if (cardData.type === 'tv') return 'tv';
        if (cardData.type === 'movie') return 'movie';
        
        // Спосіб 2: Перевірка за назвами полів (як у Lampa)
        if (cardData.name || cardData.original_name || cardData.first_air_date) {
            return 'tv'; // Серіал
        }
        if (cardData.title || cardData.original_title || cardData.release_date) {
            return 'movie'; // Фільм
        }
        
        // Спосіб 3: Перевірка за посиланням
        if (cardData.link && cardData.link.includes('/tv/')) return 'tv';
        if (cardData.link && cardData.link.includes('/movie/')) return 'movie';
        
        return 'unknown';
    }

    // === ОБРОБКА КАРТКИ ===
    function addSeriaBadge(cardEl) {
        if (!cardEl || cardEl.hasAttribute('data-seria-status')) return;

        // Чекаємо на card_data
        var checkData = function(attempt) {
            if (attempt > 15) {
                cardEl.setAttribute('data-seria-status', 'timeout');
                return;
            }

            var data = cardEl.card_data;
            
            if (!data) {
                setTimeout(function(){ checkData(attempt + 1); }, 150);
                return;
            }

            var view = cardEl.querySelector('.card__view');
            if (!view) {
                cardEl.setAttribute('data-seria-status', 'no-view');
                return;
            }

            // Видаляємо старі мітки
            var oldBadge = view.querySelector('.card--seria-status');
            if (oldBadge) oldBadge.remove();

            var badge = document.createElement('div');
            badge.className = 'card--seria-status';
            
            var mediaType = getMediaType(data);
            
            if (mediaType === 'tv') {
                badge.className += ' tv-series';
                badge.textContent = 'Серіал';
                
                // Додаткова інформація для серіалів
                if (data.name) badge.textContent = data.name.substring(0, 10) + '...';
                if (data.first_air_date) badge.textContent += ' ' + data.first_air_date.substring(0, 4);
                
            } else if (mediaType === 'movie') {
                badge.className += ' movie';
                badge.textContent = 'Фільм';
            } else {
                badge.className += ' unknown';
                badge.textContent = '?';
            }

            view.appendChild(badge);
            cardEl.setAttribute('data-seria-status', 'added');
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

    function initPlugin() {        
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
                setTimeout(function(){ addSeriaBadge(card); }, index * 200);
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

(function () {
    'use strict';

    if (window.SeasonBadgePlugin && window.SeasonBadgePlugin.__initialized) return;
    window.SeasonBadgePlugin = window.SeasonBadgePlugin || {};
    window.SeasonBadgePlugin.__initialized = true;

    // === ТЕСТОВІ НАЛАШТУВАННЯ ===
    var CONFIG = {
        // ТЕСТОВИЙ РЕЖИМ - показуємо мітки навіть без API
        testMode: true,
        enabled: true
    };

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
    
    /* РІЗНІ КОЛЬОРИ ДЛЯ ТЕСТУ */
    .card--seria-status.tv-series { background: rgba(76, 175, 80, 0.85); }
    .card--seria-status.movie { background: rgba(158, 158, 158, 0.85); }
    .card--seria-status.no-data { background: rgba(244, 67, 54, 0.85); }
    .card--seria-status.test { background: rgba(255, 193, 7, 0.85); }
    `;
    document.head.appendChild(style);

    // === СПРОЩЕНА ОБРОБКА ===
    function addSeriaBadge(cardEl) {
        if (!cardEl || cardEl.hasAttribute('data-seria-status')) return;

        // Чекаємо на card_data
        var checkData = function(attempt) {
            if (attempt > 10) {
                cardEl.setAttribute('data-seria-status', 'timeout');
                return;
            }

            var data = cardEl.card_data;
            
            if (!data) {
                setTimeout(function(){ checkData(attempt + 1); }, 200);
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
            
            if (CONFIG.testMode) {
                // ТЕСТОВИЙ РЕЖИМ - показуємо інформацію про картку
                if (data.type === 'tv') {
                    badge.className += ' tv-series';
                    badge.textContent = 'Серіал ' + (data.id || '');
                } else {
                    badge.className += ' movie';
                    badge.textContent = 'Фільм';
                }
            } else {
                // Нормальний режим
                if (data.type === 'tv') {
                    badge.className += ' tv-series';
                    badge.textContent = 'Усі серії ✓';
                } else {
                    badge.className += ' movie';
                    badge.textContent = 'Фільм';
                }
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

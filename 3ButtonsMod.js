// == Плагін для сортування та миттєвого запуску кнопок у Lampa ==
// Версія: 3.0
// Автор: AI Assistant
// Опис: Сортує кнопки та робить їх миттєвого запуску

(function() {
    'use strict';

    // Конфігурація
    const config = {
        buttonOrder: ['online', 'torrent', 'trailer'],
        buttonContainerSelector: '.buttons__list',
        buttonSelector: '.button',
        debugMode: false,
        originalPriorityKey: 'full_btn_priority_backup'
    };

    // Стилі для кнопок
    const buttonStyles = `
        .buttons__list {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
        }
        
        .button {
            border-radius: 8px;
            padding: 12px 20px;
            font-weight: 500;
            transition: all 0.2s ease;
            min-height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        }
        
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        
        .button.view--online {
            background: linear-gradient(135deg, #2196F3, #1976D2);
            color: white;
        }
        
        .button.view--torrent {
            background: linear-gradient(135deg, #4CAF50, #388E3C);
            color: white;
        }
        
        .button.view--trailer {
            background: linear-gradient(135deg, #F44336, #D32F2F);
            color: white;
        }
        
        .button:not(.view--online):not(.view--torrent):not(.view--trailer) {
            background: linear-gradient(135deg, #9E9E9E, #757575);
            color: white;
        }
        
        .button svg {
            width: 20px;
            height: 20px;
            margin-right: 8px;
        }
        
        .button.view--online svg path {
            fill: white;
        }
        
        .button.view--torrent svg path {
            fill: white;
        }
        
        .button.view--trailer svg path {
            fill: white;
        }
    `;

    function log(message) {
        if (config.debugMode) {
            console.log('[ButtonSorter] ' + message);
        }
    }

    function saveOriginalPriority() {
        if (Lampa.Storage && !Lampa.Storage.get(config.originalPriorityKey)) {
            const originalPriority = Lampa.Storage.get('full_btn_priority');
            Lampa.Storage.set(config.originalPriorityKey, originalPriority);
            log('Збережено оригінальний пріоритет');
        }
    }

    function restoreOriginalPriority() {
        if (Lampa.Storage) {
            const originalPriority = Lampa.Storage.get(config.originalPriorityKey);
            if (originalPriority) {
                Lampa.Storage.set('full_btn_priority', originalPriority);
                Lampa.Storage.remove(config.originalPriorityKey);
                log('Відновлено оригінальний пріоритет');
            }
        }
    }

    function clearPriorityParameter() {
        if (Lampa.Storage) {
            Lampa.Storage.remove('full_btn_priority');
            log('Параметр full_btn_priority очищено');
        }
    }

    function getButtonCategory(buttonElement) {
        const classList = Array.from(buttonElement.classList);
        
        for (const className of classList) {
            for (const category of config.buttonOrder) {
                if (className.includes(category)) {
                    return category;
                }
            }
        }
        
        return 'other';
    }

    // Функція для заміни іконок кнопок
    function replaceButtonIcons() {
        const buttons = document.querySelectorAll(config.buttonSelector);
        
        buttons.forEach(button => {
            if (button.classList.contains('view--online')) {
                button.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                    </svg>
                    Онлайн
                `;
            }
            else if (button.classList.contains('view--torrent')) {
                button.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                        <path d="M19 8l-4 4h3c0 3.31-2.69 6-6 6-1.01 0-1.97-.25-2.8-.7l-1.46 1.46C8.97 19.54 10.43 20 12 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46C15.03 4.46 13.57 4 12 4c-4.42 0-8 3.58-8 8H1l4 4 4-4H6z"/>
                    </svg>
                    Торренти
                `;
            }
            else if (button.classList.contains('view--trailer')) {
                button.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                        <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                    </svg>
                    Трейлер
                `;
            }
        });
    }

    // Функція для миттєвого запуску дії кнопки
    function enableInstantAction() {
        const buttons = document.querySelectorAll(config.buttonSelector);
        
        buttons.forEach(button => {
            // Видаляємо всі попередні обробники
            button.onclick = null;
            button.addEventListener('click', handleButtonClick, true);
        });
    }

    // Обробник кліку на кнопку
    function handleButtonClick(event) {
        event.preventDefault();
        event.stopPropagation();
        
        const button = event.currentTarget;
        
        if (button.classList.contains('view--online')) {
            log('Запуск онлайн перегляду');
            launchOnline();
        }
        else if (button.classList.contains('view--torrent')) {
            log('Запуск торрент перегляду');
            launchTorrent();
        }
        else if (button.classList.contains('view--trailer')) {
            log('Запуск трейлера');
            launchTrailer();
        }
    }

    // Функції для запуску відповідних дій
    function launchOnline() {
        if (Lampa && Lampa.Activity) {
            // Шукаємо перше доступне онлайн джерело і запускаємо
            const card = Lampa.Activity.active().card;
            if (card && card.online && card.online.length > 0) {
                Lampa.Player.play(card.online[0]);
            }
        }
    }

    function launchTorrent() {
        if (Lampa && Lampa.Activity) {
            // Шукаємо перший доступний торрент і запускаємо
            const card = Lampa.Storage.get('full_card');
            if (card && card.torrent && card.torrent.length > 0) {
                Lampa.Player.play(card.torrent[0]);
            }
        }
    }

    function launchTrailer() {
        if (Lampa && Lampa.Activity) {
            // Запускаємо трейлер
            const card = Lampa.Storage.get('full_card');
            if (card && card.trailer) {
                Lampa.Player.play(card.trailer);
            }
        }
    }

    function sortButtons() {
        try {
            log('Початок сортування кнопок...');
            
            const buttonContainer = document.querySelector(config.buttonContainerSelector);
            if (!buttonContainer) {
                log('Контейнер кнопок не знайдено');
                return false;
            }
            
            const buttons = Array.from(buttonContainer.querySelectorAll(config.buttonSelector));
            if (buttons.length === 0) {
                log('Кнопки не знайдено');
                return false;
            }
            
            const categorizedButtons = buttons.map(button => {
                return {
                    element: button,
                    category: getButtonCategory(button)
                };
            });
            
            categorizedButtons.sort((a, b) => {
                const aIndex = config.buttonOrder.indexOf(a.category);
                const bIndex = config.buttonOrder.indexOf(b.category);
                
                if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                if (aIndex !== -1) return -1;
                if (bIndex !== -1) return 1;
                return 0;
            });
            
            while (buttonContainer.firstChild) {
                buttonContainer.removeChild(buttonContainer.firstChild);
            }
            
            categorizedButtons.forEach(item => {
                buttonContainer.appendChild(item.element);
            });
            
            // Замінюємо іконки та активуємо миттєвий запуск
            replaceButtonIcons();
            enableInstantAction();
            
            log('Сортування успішно завершено!');
            return true;
            
        } catch (error) {
            console.error('[ButtonSorter] Помилка:', error);
            return false;
        }
    }

    function addStyles() {
        if (!document.getElementById('button-sorter-styles')) {
            const style = document.createElement('style');
            style.id = 'button-sorter-styles';
            style.textContent = buttonStyles;
            document.head.appendChild(style);
            log('Стилі додано');
        }
    }

    function observeDOMChanges() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length > 0) {
                    const hasNewButtons = Array.from(mutation.addedNodes).some(node => {
                        return node.nodeType === 1 && node.matches && 
                              (node.matches(config.buttonSelector) || 
                               node.querySelector(config.buttonSelector));
                    });
                    
                    if (hasNewButtons) {
                        setTimeout(() => {
                            sortButtons();
                            replaceButtonIcons();
                            enableInstantAction();
                        }, 300);
                    }
                }
            });
        });
        
        const container = document.querySelector(config.buttonContainerSelector);
        if (container) {
            observer.observe(container, {
                childList: true,
                subtree: true
            });
        }
    }

    function initPlugin() {
        log('Ініціалізація плагіна...');
        
        if (typeof Lampa === 'undefined') {
            console.error('[ButtonSorter] Lampa не знайдено!');
            return;
        }
        
        saveOriginalPriority();
        clearPriorityParameter();
        addStyles();
        
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') {
                setTimeout(() => {
                    sortButtons();
                    observeDOMChanges();
                }, 1500);
            }
        });
        
        // Перевіряємо кнопки при кожному відкритті сторінки
        Lampa.Listener.follow('full', function() {
            setTimeout(() => {
                sortButtons();
                replaceButtonIcons();
                enableInstantAction();
            }, 800);
        });
        
        window.addEventListener('beforeunload', function() {
            if (window.plugin && !window.plugin.__buttonSorterActive) {
                restoreOriginalPriority();
            }
        });
    }

    // Запускаємо плагін
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPlugin);
    } else {
        initPlugin();
    }

    window.plugin = window.plugin || {};
    window.plugin.__buttonSorterActive = true;

})();
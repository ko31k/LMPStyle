// == Безпечний плагін для сортування кнопок у Lampa ==
// Версія: 1.1
// Автор: AI Assistant
// Опис: Сортує кнопки у порядку: Онлайн -> Торренти -> Трейлери -> Інше

(function() {
    'use strict';

    // Конфігурація
    const config = {
        buttonOrder: ['online', 'torrent', 'trailer'],
        buttonContainerSelector: '.buttons__list',
        buttonSelector: '.button',
        debugMode: false,
        originalPriorityKey: 'full_btn_priority' // Ключ для зберігання оригінального пріоритету
    };

    // Функція для логування
    function log(message) {
        if (config.debugMode) {
            console.log('[ButtonSorter] ' + message);
        }
    }

    // Зберігаємо оригінальний пріоритет перед змінами
    function saveOriginalPriority() {
        if (Lampa.Storage && !Lampa.Storage.get(config.originalPriorityKey)) {
            const originalPriority = Lampa.Storage.get('full_btn_priority');
            Lampa.Storage.set(config.originalPriorityKey, originalPriority);
            log('Збережено оригінальний пріоритет: ' + JSON.stringify(originalPriority));
        }
    }

    // Відновлюємо оригінальний пріоритет при видаленні плагіна
    function restoreOriginalPriority() {
        if (Lampa.Storage) {
            const originalPriority = Lampa.Storage.get(config.originalPriorityKey);
            if (originalPriority) {
                Lampa.Storage.set('full_btn_priority', originalPriority);
                Lampa.Storage.remove(config.originalPriorityKey);
                log('Відновлено оригінальний пріоритет');
            } else {
                Lampa.Storage.remove('full_btn_priority');
                log('Видалено параметр пріоритету');
            }
        }
    }

    // Очищаємо параметр пріоритету для коректної роботи
    function clearPriorityParameter() {
        if (Lampa.Storage) {
            Lampa.Storage.remove('full_btn_priority');
            log('Параметр full_btn_priority очищено');
        }
    }

    // Визначаємо категорію кнопки
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

    // Основна функція сортування кнопок
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
            
            log('Знайдено кнопок: ' + buttons.length);
            
            const categorizedButtons = buttons.map(button => {
                return {
                    element: button,
                    category: getButtonCategory(button)
                };
            });
            
            categorizedButtons.sort((a, b) => {
                const aIndex = config.buttonOrder.indexOf(a.category);
                const bIndex = config.buttonOrder.indexOf(b.category);
                
                if (aIndex !== -1 && bIndex !== -1) {
                    return aIndex - bIndex;
                }
                
                if (aIndex !== -1) return -1;
                if (bIndex !== -1) return 1;
                
                return 0;
            });
            
            while (buttonContainer.firstChild) {
                buttonContainer.removeChild(buttonContainer.firstChild);
            }
            
            categorizedButtons.forEach(item => {
                buttonContainer.appendChild(item.element);
                log('Додано кнопку категорії: ' + item.category);
            });
            
            log('Сортування успішно завершено!');
            return true;
            
        } catch (error) {
            console.error('[ButtonSorter] Помилка під час сортування:', error);
            return false;
        }
    }

    // Спостереження за змінами DOM
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
                        log('Виявлено зміни в DOM, пересортовуємо кнопки...');
                        setTimeout(sortButtons, 300);
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
            log('Спостереження за змінами DOM активовано');
        }
    }

    // Ініціалізація плагіна
    function initPlugin() {
        log('Ініціалізація плагіна...');
        
        if (typeof Lampa === 'undefined') {
            console.error('[ButtonSorter] Lampa не знайдено!');
            return;
        }
        
        // Зберігаємо оригінальні налаштування
        saveOriginalPriority();
        
        // Очищаємо параметр пріоритету
        clearPriorityParameter();
        
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') {
                log('Lampa готовий, починаємо роботу...');
                
                setTimeout(() => {
                    sortButtons();
                    observeDOMChanges();
                }, 1000);
            }
        });
        
        // Додаємо обробник для відновлення налаштувань при видаленні плагіна
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

    // Позначаємо плагін як активний
    window.plugin = window.plugin || {};
    window.plugin.__buttonSorterActive = true;

})();
// == Безпечний плагін для сортування кнопок у Lampa ==
// Версія: 1.0
// Автор: AI Assistant
// Опис: Сортує кнопки у порядку: Онлайн -> Торренти -> Трейлери -> Інше

(function() {
    'use strict'; // Використовуємо суворий режим для безпеки

    // Конфігурація - легко змінити при потребі
    const config = {
        buttonOrder: ['online', 'torrent', 'trailer'], // Порядок категорій
        buttonContainerSelector: '.buttons__list', // Селектор контейнера кнопок
        buttonSelector: '.button', // Селектор окремої кнопки
        debugMode: false // Режим налагодження (виводить інформацію в консоль)
    };

    // Функція для логування (працює тільки в debugMode)
    function log(message) {
        if (config.debugMode) {
            console.log('[ButtonSorter] ' + message);
        }
    }

    // Визначаємо категорію кнопки на основі її класів
    function getButtonCategory(buttonElement) {
        // Перевіряємо кожен клас кнопки на наявність ключових слів
        const classList = Array.from(buttonElement.classList);
        
        for (const className of classList) {
            for (const category of config.buttonOrder) {
                if (className.includes(category)) {
                    return category;
                }
            }
        }
        
        return 'other'; // Якщо нічого не знайшли
    }

    // Основна функція сортування кнопок
    function sortButtons() {
        try {
            log('Початок сортування кнопок...');
            
            // Знаходимо контейнер з кнопками
            const buttonContainer = document.querySelector(config.buttonContainerSelector);
            if (!buttonContainer) {
                log('Контейнер кнопок не знайдено: ' + config.buttonContainerSelector);
                return false;
            }
            
            // Отримуємо всі кнопки
            const buttons = Array.from(buttonContainer.querySelectorAll(config.buttonSelector));
            if (buttons.length === 0) {
                log('Кнопки не знайдено');
                return false;
            }
            
            log('Знайдено кнопок: ' + buttons.length);
            
            // Визначаємо категорію для кожної кнопки
            const categorizedButtons = buttons.map(button => {
                return {
                    element: button,
                    category: getButtonCategory(button)
                };
            });
            
            // Сортуємо кнопки за заданим порядком
            categorizedButtons.sort((a, b) => {
                const aIndex = config.buttonOrder.indexOf(a.category);
                const bIndex = config.buttonOrder.indexOf(b.category);
                
                // Якщо обидві кнопки мають визначені категорії
                if (aIndex !== -1 && bIndex !== -1) {
                    return aIndex - bIndex;
                }
                
                // Якщо тільки одна кнопка має визначену категорію
                if (aIndex !== -1) return -1;
                if (bIndex !== -1) return 1;
                
                // Якщо обидві кнопки без визначеної категорії
                return 0;
            });
            
            // Видаляємо всі кнопки з контейнера
            while (buttonContainer.firstChild) {
                buttonContainer.removeChild(buttonContainer.firstChild);
            }
            
            // Додаємо кнопки назад у відсортованому порядку
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

    // Чекаємо, поки Lampa повністю завантажиться
    function initPlugin() {
        log('Ініціалізація плагіна...');
        
        if (typeof Lampa === 'undefined') {
            console.error('[ButtonSorter] Lampa не знайдено!');
            return;
        }
        
        // Підписуємось на подію готовності додатка
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') {
                log('Lampa готовий, починаємо роботу...');
                
                // Запускаємо сортування з невеликою затримкою, щоб все гарантовано завантажилось
                setTimeout(sortButtons, 1000);
                
                // Додатково: спостерігаємо за змінами DOM на випадок динамічного завантаження кнопок
                observeDOMChanges();
            }
        });
    }

    // Спостереження за змінами DOM для динамічно завантажених кнопок
    function observeDOMChanges() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length > 0) {
                    // Перевіряємо, чи з'явилися нові кнопки
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
        
        // Починаємо спостереження
        const container = document.querySelector(config.buttonContainerSelector);
        if (container) {
            observer.observe(container, {
                childList: true,
                subtree: true
            });
            log('Спостереження за змінами DOM активовано');
        }
    }

    // Запускаємо плагін
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPlugin);
    } else {
        initPlugin();
    }

})();
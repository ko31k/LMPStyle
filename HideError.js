// Lampa Plugin: hide_green_notifications.plugin.js
// Версія: 1.0.0
// Автор: AI Assistant
// Опис: Приховує зелені сповіщення про помилки в Lampa Player

(function() {
    'use strict';
    
    // Налаштування плагіна
    const PLUGIN_NAME = 'hide_green_notifications';
    const PLUGIN_SETTING = 'lampa_hide_green';
    
    // Перевіряємо наявність Lampa
    if (typeof Lampa === 'undefined') {
        console.warn('Lampa not found - plugin cannot initialize');
        return;
    }
    
    // Перевіряємо налаштування користувача
    try {
        if (localStorage && localStorage.getItem(PLUGIN_SETTING) === 'off') {
            console.log('Green notifications plugin is disabled');
            return;
        }
    } catch(e) {
        console.warn('Cannot access localStorage:', e);
    }
    
    // Функція ініціалізації плагіна
    function initPlugin() {
        // Чекаємо, поки Lampa повністю завантажиться
        if (!Lampa.Noty || typeof Lampa.Noty.show !== 'function') {
            setTimeout(initPlugin, 100);
            return;
        }
        
        // Зберігаємо оригінальну функцію
        const originalShow = Lampa.Noty.show;
        
        // Перевизначаємо метод показу сповіщень
        Lampa.Noty.show = function(text, type, time) {
            // Приховуємо зелені сповіщення (type === 'error')
            if (type === 'error') {
                console.log('🔇 Hidden green notification:', text);
                return false; // Не показуємо сповіщення
            }
            
            // Для всіх інших типів використовуємо стандартну поведінку
            return originalShow.apply(this, arguments);
        };
        
        // Додатково перехоплюємо можливі альтернативні методи
        patchAlternativeMethods();
        
        console.log('✅ Green error notifications plugin: active');
    }
    
    // Функція для перехоплення альтернативних методів сповіщень
    function patchAlternativeMethods() {
        // Перевіряємо додаткові можливі методи
        const alternativeMethods = [
            'toast',
            'notification',
            'showNotification',
            'displayMessage'
        ];
        
        alternativeMethods.forEach(method => {
            if (Lampa[method] && typeof Lampa[method] === 'function') {
                const originalMethod = Lampa[method];
                Lampa[method] = function() {
                    // Аналізуємо аргументи на наявність помилок
                    const args = Array.from(arguments);
                    const hasError = args.some(arg => 
                        typeof arg === 'string' && arg.toLowerCase().includes('error') ||
                        (arg && arg.type === 'error')
                    );
                    
                    if (hasError) {
                        console.log('🔇 Hidden alternative error:', args);
                        return false;
                    }
                    
                    return originalMethod.apply(this, arguments);
                };
            }
        });
    }
    
    // Функція для створення інтерфейсу управління
    function createControlInterface() {
        // Додаємо глобальні функції для управління
        window.hideGreenNotifications = {
            enable: function() {
                try {
                    localStorage.removeItem(PLUGIN_SETTING);
                    console.log('✅ Green notifications hiding enabled');
                    location.reload();
                } catch(e) {
                    console.error('Cannot enable plugin:', e);
                }
            },
            
            disable: function() {
                try {
                    localStorage.setItem(PLUGIN_SETTING, 'off');
                    console.log('❌ Green notifications hiding disabled');
                    location.reload();
                } catch(e) {
                    console.error('Cannot disable plugin:', e);
                }
            },
            
            status: function() {
                try {
                    const isEnabled = localStorage.getItem(PLUGIN_SETTING) !== 'off';
                    console.log('Plugin status:', isEnabled ? 'ENABLED' : 'DISABLED');
                    return isEnabled;
                } catch(e) {
                    console.error('Cannot check status:', e);
                    return false;
                }
            }
        };
    }
    
    // Ініціалізація
    function start() {
        createControlInterface();
        
        // Запускаємо ініціалізацію плагіна
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            initPlugin();
        } else {
            document.addEventListener('DOMContentLoaded', initPlugin);
            window.addEventListener('load', initPlugin);
        }
    }
    
    // Запускаємо плагін
    start();
    
})();

// Додатковий CSS для гарантованого приховування (на випадок, якщо сповіщення все ж показуються)
(function() {
    'use strict';
    
    const css = `
        /* Приховуємо зелені сповіщення */
        .notyf__toast--error,
        .notification-error,
        .toast-error,
        .lampa-notify-error,
        [class*="error"],
        [class*="Error"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            height: 0 !important;
            width: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
        }
    `;
    
    // Додаємо CSS до документу
    const style = document.createElement('style');
    style.id = 'hide-green-notifications-css';
    style.textContent = css;
    
    if (document.head) {
        document.head.appendChild(style);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            document.head.appendChild(style);
        });
    }
})();

// Lampa Plugin: hide_green_notifications.plugin.js
// Версія: 2.0.0
// Автор: AI Assistant
// Опис: Повністю приховує зелені сповіщення та мілкі помилки в Lampa Player

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
    
    // Змінна для зберігання оригінальних методів
    let originalMethods = {};
    
    // Функція ініціалізації плагіна
    function initPlugin() {
        // Чекаємо, поки Lampa повністю завантажиться
        if (!Lampa.Noty || typeof Lampa.Noty.show !== 'function') {
            setTimeout(initPlugin, 100);
            return;
        }
        
        // 1. Перехоплюємо основні сповіщення через API
        patchNotificationAPI();
        
        // 2. Видаляємо існуючі сповіщення після завантаження
        removeExistingNotifications();
        
        // 3. Додаємо CSS для блокування сповіщень
        addBlockingCSS();
        
        // 4. Створюємо інтерфейс управління
        createControlInterface();
        
        console.log('✅ Green error notifications plugin: fully active');
    }
    
    // Перехоплення API сповіщень
    function patchNotificationAPI() {
        // Основне API сповіщень
        if (Lampa.Noty && Lampa.Noty.show) {
            originalMethods.notyShow = Lampa.Noty.show;
            Lampa.Noty.show = function(text, type, time) {
                if (type === 'error') {
                    console.log('🔇 Hidden green notification:', text);
                    return false;
                }
                return originalMethods.notyShow.apply(this, arguments);
            };
        }
        
        // Альтернативні методи
        const alternativeMethods = ['toast', 'notification', 'showNotification', 'displayMessage'];
        
        alternativeMethods.forEach(method => {
            if (Lampa[method] && typeof Lampa[method] === 'function') {
                originalMethods[method] = Lampa[method];
                Lampa[method] = function() {
                    const args = Array.from(arguments);
                    const hasError = args.some(arg => 
                        (typeof arg === 'string' && arg.toLowerCase().includes('error')) ||
                        (arg && arg.type === 'error') ||
                        (arg && typeof arg === 'object' && arg.type && arg.type.toLowerCase().includes('error'))
                    );
                    
                    if (hasError) {
                        console.log('🔇 Hidden alternative error:', args);
                        return false;
                    }
                    
                    return originalMethods[method].apply(this, arguments);
                };
            }
        });
    }
    
    // Видалення існуючих сповіщень
    function removeExistingNotifications() {
        // Видаляємо сповіщення після повного завантаження додатка
        Lampa.Listener.follow('app', (e) => {
            if (e.type === 'ready') {
                // Видаляємо всі відомі типи сповіщень
                const selectors = [
                    '.noty', '.notify', '.notification',
                    '.toast', '.lampa-notify',
                    '[class*="error"]', '[class*="Error"]',
                    '[class*="noty"]', '[class*="notify"]'
                ];
                
                selectors.forEach(selector => {
                    try {
                        document.querySelectorAll(selector).forEach(el => {
                            if (el.parentNode) {
                                el.parentNode.removeChild(el);
                            }
                        });
                    } catch(e) {
                        console.warn('Error removing elements:', e);
                    }
                });
                
                console.log('🧹 Removed existing notifications');
                
                // Додатково: регулярна перевірка нових сповіщень
                setInterval(checkForNewNotifications, 2000);
            }
        });
    }
    
    // Регулярна перевірка нових сповіщень
    function checkForNewNotifications() {
        const notificationSelectors = [
            '.noty', '.notify', '.notification', 
            '.toast', '[class*="error"]', '[class*="noty"]'
        ];
        
        notificationSelectors.forEach(selector => {
            try {
                document.querySelectorAll(selector).forEach(el => {
                    // Перевіряємо, чи це справді сповіщення
                    const style = window.getComputedStyle(el);
                    const isVisible = style.display !== 'none' && 
                                    style.visibility !== 'hidden' && 
                                    style.opacity !== '0';
                    
                    if (isVisible) {
                        el.style.display = 'none';
                        el.style.visibility = 'hidden';
                        console.log('🔇 Auto-hidden notification:', selector);
                    }
                });
            } catch(e) {
                // Ігноруємо помилки
            }
        });
    }
    
    // Додавання блокуючого CSS
    function addBlockingCSS() {
        const css = `
            /* Приховуємо всі типи сповіщень */
            .noty, .notify, .notification,
            .toast, .lampa-notify,
            .notyf__toast--error, .notification-error,
            .toast-error, .lampa-notify-error,
            [class*="error"], [class*="Error"],
            [class*="noty"], [class*="notify"] {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                height: 0 !important;
                width: 0 !important;
                padding: 0 !important;
                margin: 0 !important;
                border: none !important;
                pointer-events: none !important;
                position: absolute !important;
                left: -9999px !important;
            }
            
            /* Запобігаємо анімаціям сповіщень */
            .notyf__toast, .notyf__notification {
                animation: none !important;
                transition: none !important;
            }
        `;
        
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
    }
    
    // Інтерфейс управління плагіном
    function createControlInterface() {
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
            },
            
            // Додаткова функція для ручного видалення сповіщень
            clearAll: function() {
                const selectors = ['.noty', '.notify', '.notification', '.toast'];
                let removed = 0;
                
                selectors.forEach(selector => {
                    document.querySelectorAll(selector).forEach(el => {
                        el.remove();
                        removed++;
                    });
                });
                
                console.log('🧹 Manually removed', removed, 'notifications');
                return removed;
            },
            
            // Відновлення оригінальних методів (для налагодження)
            restore: function() {
                if (originalMethods.notyShow) {
                    Lampa.Noty.show = originalMethods.notyShow;
                }
                
                Object.keys(originalMethods).forEach(method => {
                    if (method !== 'notyShow' && Lampa[method]) {
                        Lampa[method] = originalMethods[method];
                    }
                });
                
                console.log('🔧 Original methods restored');
            }
        };
    }
    
    // Обробка помилок для запобігання збоям
    function setupErrorHandling() {
        const originalConsoleError = console.error;
        console.error = function() {
            // Фільтруємо мілкі помилки app.min.js
            const args = Array.from(arguments);
            const errorMessage = args[0] ? args[0].toString() : '';
            
            const ignorePatterns = [
                'app.min.js',
                'small error',
                'minor error',
                'notification error',
                'TypeError'
            ];
            
            const shouldIgnore = ignorePatterns.some(pattern => 
                errorMessage.includes(pattern)
            );
            
            if (!shouldIgnore) {
                originalConsoleError.apply(console, arguments);
            }
        };
    }
    
    // Ініціалізація
    function start() {
        try {
            setupErrorHandling();
            
            if (document.readyState === 'complete' || document.readyState === 'interactive') {
                initPlugin();
            } else {
                document.addEventListener('DOMContentLoaded', initPlugin);
                window.addEventListener('load', initPlugin);
            }
        } catch(error) {
            console.warn('Plugin initialization error:', error);
        }
    }
    
    // Запускаємо плагін
    start();
    
})();

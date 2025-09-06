(function(){
    // Список текстових замін
    const REPLACEMENTS = {
        'Дублированный': 'Дубльований',
        'Ukr': '🇺🇦 Українською',
        'Ua': '🇺🇦 Ua',
        'Дубляж': 'Дубльований',
        'Многоголосый': 'Багатоголосий',
        'Украинский': '🇺🇦 Українською',
        'Zetvideo': 'UaFlix',
        'Нет истории просмотра': 'Історія перегляду відсутня'
    };

    // Конфігурація стилів
    const STYLES = {
        // Стилі для роздач (Роздають)
        '.torrent-item span.low-seeds': {
            color: '#ff0000',
            'font-weight': 'bold'
        },
        '.torrent-item span.medium-seeds': {
            color: '#ffff00',
            'font-weight': 'bold'
        },
        '.torrent-item span.high-seeds': {
            color: '#2ecc71',
            'font-weight': 'bold'
        },
        // Стилі для бітрейту
        '.torrent-item span.low-bitrate': {
            color: '#3498db',
            'font-weight': 'bold'
        },
        '.torrent-item span.medium-bitrate': {
            color: '#2ecc71',
            'font-weight': 'bold'
        },
        '.torrent-item span.high-bitrate': {
            color: '#e74c3c',
            'font-weight': 'bold'
        },
        // Стилі для трекерів
        '.torrent-item span.toloka-tracker': {
            color: '#2ecc71',
            'font-weight': 'bold'
        },
        '.torrent-item span.utopia-tracker': {
            color: '#9b59b6',
            'font-weight': 'bold'
        }
    };

    // Додаємо CSS-стилі
    let style = document.createElement('style');
    style.innerHTML = Object.entries(STYLES).map(([selector, props]) => {
        return selector + ' { ' + Object.entries(props).map(([prop, val]) => prop + ': ' + val + ' !important').join('; ') + ' }';
    }).join('\n');
    document.head.appendChild(style);

    // Функція для заміни текстів у вказаних контейнерах
    function replaceTexts() {
        // Список селекторів, де потрібно шукати тексти для заміни
        const containers = [
            '.online-prestige-watched__body',
            '.online-prestige--full .online-prestige__title',
            '.online-prestige--full .online-prestige__info'
        ];

        containers.forEach(selector => {
            document.querySelectorAll(selector).forEach(container => {
                // Заміняємо текст у всіх вузлах-нащадках
                const walker = document.createTreeWalker(
                    container,
                    NodeFilter.SHOW_TEXT,
                    null,
                    false
                );

                let node;
                while (node = walker.nextNode()) {
                    let text = node.nodeValue;
                    Object.entries(REPLACEMENTS).forEach(([original, replacement]) => {
                        if (text.includes(original)) {
                            text = text.replace(new RegExp(original, 'g'), replacement);
                        }
                    });
                    node.nodeValue = text;
                }
            });
        });
    }

    // Функція для оновлення стилів торентів
    function updateTorrentStyles() {
        // Шукаємо всі span в torrent-item
        document.querySelectorAll('.torrent-item span').forEach(span => {
            const text = span.textContent.trim();
            const lowerText = text.toLowerCase();
            
            // Обробка роздач (Роздають)
            if (text.includes('Роздають:')) {
                const seeds = parseInt(text.replace('Роздають:', '').trim()) || 0;
                span.classList.remove('low-seeds', 'medium-seeds', 'high-seeds');
                
                if (seeds <= 4) {
                    span.classList.add('low-seeds');
                } else if (seeds <= 14) {
                    span.classList.add('medium-seeds');
                } else {
                    span.classList.add('high-seeds');
                }
            }
            
            // Обробка бітрейту
            else if (text.includes('Бітрейт:')) {
                const bitrateText = text.replace('Бітрейт:', '').replace('Мбіт/с', '').trim();
                const bitrate = parseFloat(bitrateText) || 0;
                span.classList.remove('low-bitrate', 'medium-bitrate', 'high-bitrate');
                
                if (bitrate <= 10) {
                    span.classList.add('low-bitrate');
                } else if (bitrate <= 40) {
                    span.classList.add('medium-bitrate');
                } else {
                    span.classList.add('high-bitrate');
                }
            }
            
            // Обробка трекерів
            else if (lowerText.includes('toloka')) {
                span.classList.add('toloka-tracker');
            }
            else if (lowerText.includes('utopia')) {
                span.classList.add('utopia-tracker');
            }
        });
    }

    // Основна функція оновлення
    function updateAll() {
        replaceTexts();
        updateTorrentStyles();
    }

    // Оптимізований спостерігач
    const observer = new MutationObserver(mutations => {
        if (mutations.some(m => m.addedNodes.length)) {
            updateAll();
        }
    });

    // Ініціалізація
    observer.observe(document.body, { childList: true, subtree: true });
    updateAll();
})();

Lampa.Platform.tv();

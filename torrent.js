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
        '.torrent-item__seeds span.low-seeds': {
            color: '#ff0000',
            'font-weight': 'bold'
        },
        '.torrent-item__seeds span.medium-seeds': {
            color: '#ffff00',
            'font-weight': 'bold'
        },
        '.torrent-item__seeds span.high-seeds': {
            color: '#00ff00',
            'font-weight': 'bold'
        },
        // Стилі для бітрейту
        '.torrent-item__bitrate span.low-bitrate': {
            color: '#3498db',
            'font-weight': 'bold'
        },
        '.torrent-item__bitrate span.medium-bitrate': {
            color: '#2ecc71',
            'font-weight': 'bold'
        },
        '.torrent-item__bitrate span.high-bitrate': {
            color: '#e74c3c',
            'font-weight': 'bold'
        },
        // Стилі для трекерів
        '.torrent-item__tracker.utopia': {
            color: '#9b59b6',
            'font-weight': 'bold'
        },
        '.torrent-item__tracker.toloka': {
            color: '#2ecc71',
            'font-weight': 'bold'
        },
        '.torrent-item__info span.toloka-text': {
            color: '#2ecc71',
            'font-weight': 'bold'
        },
        '.torrent-item__info span.utopia-text': {
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
        // Роздають (Seeds) - три діапазони
        document.querySelectorAll('.torrent-item__seeds span').forEach(span => {
            const seeds = parseInt(span.textContent) || 0;
            span.classList.remove('low-seeds', 'medium-seeds', 'high-seeds');
            
            if (seeds <= 4) {
                span.classList.add('low-seeds'); // червоний: 0-4
            } else if (seeds <= 14) {
                span.classList.add('medium-seeds'); // жовтий: 5-14
            } else {
                span.classList.add('high-seeds'); // зелений: 15+
            }
        });

        // Бітрейт - три діапазони
        document.querySelectorAll('.torrent-item__bitrate span').forEach(span => {
            const bitrate = parseFloat(span.textContent) || 0;
            span.classList.remove('low-bitrate', 'medium-bitrate', 'high-bitrate');
            
            if (bitrate <= 10) {
                span.classList.add('low-bitrate'); // синій: до 10
            } else if (bitrate <= 40) {
                span.classList.add('medium-bitrate'); // зелений: 11-40
            } else {
                span.classList.add('high-bitrate'); // червоний: 41+
            }
        });

        // Шукаємо всі span в інформації про торент
        document.querySelectorAll('.torrent-item__info span').forEach(span => {
            const text = span.textContent.trim().toLowerCase();
            
            // Видаляємо попередні класи
            span.classList.remove('toloka-text', 'utopia-text');
            
            // Додаємо класи залежно від тексту
            if (text.includes('toloka')) {
                span.classList.add('toloka-text');
            }
            else if (text.includes('utopia')) {
                span.classList.add('utopia-text');
            }
        });

        // Також перевіряємо елементи з класом tracker
        document.querySelectorAll('.torrent-item__tracker').forEach(tracker => {
            const text = tracker.textContent.trim().toLowerCase();
            tracker.classList.remove('utopia', 'toloka');
            
            if (text.includes('utopia')) tracker.classList.add('utopia');
            else if (text.includes('toloka')) tracker.classList.add('toloka');
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

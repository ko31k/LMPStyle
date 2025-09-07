(function(){
    // SVG прапорець України
    const UKRAINE_FLAG_SVG = '<svg width="20" height="15" viewBox="0 0 20 15" style="display:inline-block;vertical-align:middle;margin-right:8px;border-radius:4px;box-shadow:0 2px 4px rgba(0,0,0,0.3);border:1px solid rgba(0,0,0,0.2)"><rect width="20" height="7.5" y="0" fill="#0057B7"/><rect width="20" height="7.5" y="7.5" fill="#FFD700"/></svg>';

    // Список текстових замін з обережними умовами
    const REPLACEMENTS = {
        'Дублированный': 'Дубльований',
        'Ukr': UKRAINE_FLAG_SVG + ' Українською',
        'Ua': UKRAINE_FLAG_SVG + ' UA',
        'Дубляж': 'Дубльований',
        'Многоголосый': 'Багатоголосий',
        'Украинский': UKRAINE_FLAG_SVG + ' Українською',
        'Zetvideo': 'UaFlix',
        'Uaflix': 'UAFlix',
        'Нет истории просмотра': 'Історія перегляду відсутня'
    };

    // Додаткові стилі для вирівнювання
    const FLAG_STYLES = `
        .flag-container {
            display: inline-flex;
            align-items: center;
            vertical-align: middle;
            height: 1.27em;
        }
        .flag-svg {
            display: inline-block;
            vertical-align: middle;
            margin-right: 8px;
            margin-top: -8.5px;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            border: 1px solid rgba(0,0,0,0.15);
            width: 25px;
            height: 19px;
        }
        .flag-container ~ span,
        .flag-container + * {
            vertical-align: middle;
        }
    `;

    // Конфігурація стилів
    const STYLES = {
        '.torrent-item__seeds span.low-seeds': {
            color: '#e74c3c',
            'font-weight': 'bold'
        },
        '.torrent-item__seeds span.medium-seeds': {
            color: '#ffff00',
           'font-weight': 'bold'
        },
        '.torrent-item__seeds span.high-seeds': {
            color: '#2ecc71',
            'font-weight': 'bold'
        },
        '.torrent-item__bitrate span.low-bitrate': {
            color: '#ffff00',
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
        '.torrent-item__tracker.utopia': {
            color: '#9b59b6',
            'font-weight': 'bold'
        },
        '.torrent-item__tracker.toloka': {
            color: '#3498db',
            'font-weight': 'bold'
        },
        '.torrent-item__tracker.mazepa': {
            color: '#C9A0DC',
            'font-weight': 'bold'
        }
    };

    // Додаємо CSS-стилі
    let style = document.createElement('style');
    style.innerHTML = FLAG_STYLES + '\n' + Object.entries(STYLES).map(([selector, props]) => {
        return `${selector} { ${Object.entries(props).map(([prop, val]) => `${prop}: ${val} !important`).join('; ')} }`;
    }).join('\n');
    document.head.appendChild(style);

    // Функція для заміни текстів з перевіркою на слово
    function replaceTexts() {
        const containers = [
            '.online-prestige-watched__body',
            '.online-prestige--full .online-prestige__title',
            '.online-prestige--full .online-prestige__info'
        ];

        containers.forEach(selector => {
            document.querySelectorAll(selector).forEach(container => {
                const walker = document.createTreeWalker(
                    container,
                    NodeFilter.SHOW_TEXT,
                    null,
                    false
                );

                let node;
                while (node = walker.nextNode()) {
                    let text = node.nodeValue;
                    let changed = false;
                    
                    // Використовуємо регулярні вирази для пошуку окремих слів
                    Object.entries(REPLACEMENTS).forEach(([original, replacement]) => {
                        const regex = new RegExp(`\\b${original}\\b`, 'g'); // \b - межа слова
                        if (regex.test(text)) {
                            text = text.replace(regex, replacement);
                            changed = true;
                        }
                    });
                    
                    if (changed) {
                        // Безпечна заміна з HTML
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = text;
                        
                        const newNode = document.createDocumentFragment();
                        while (tempDiv.firstChild) {
                            newNode.appendChild(tempDiv.firstChild);
                        }
                        
                        node.parentNode.replaceChild(newNode, node);
                    }
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
                span.classList.add('low-bitrate'); // синій: до 10 включно
            } else if (bitrate <= 40) {
                span.classList.add('medium-bitrate'); // зелений: 11-40
            } else {
                span.classList.add('high-bitrate'); // червоний: 41+
            }
        });

        // Трекери - нечутлива до регістру перевірка
        document.querySelectorAll('.torrent-item__tracker').forEach(tracker => {
            const text = tracker.textContent.trim().toLowerCase();
            tracker.classList.remove('utopia', 'toloka', 'mazepa');
            
            if (text.includes('utopia')) tracker.classList.add('utopia');
            else if (text.includes('toloka')) tracker.classList.add('toloka');
            else if (text.includes('mazepa')) tracker.classList.add('mazepa');
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
            setTimeout(updateAll, 100);
        }
    });

    // Ініціалізація
    observer.observe(document.body, { childList: true, subtree: true });
    updateAll();
})();

Lampa.Platform.tv();

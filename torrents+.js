(function(){
    // Додамо CSS для підтримки емодзі
    const EMOJI_STYLES = `
        .emoji-font {
            font-family: 'Segoe UI Emoji', 'Segoe UI Symbol', 'Arial', sans-serif;
            font-weight: normal;
        }
        .ua-flag {
            display: inline-block;
            width: 16px;
            height: 12px;
            background: linear-gradient(to bottom, #0057B7 50%, #FFD700 50%);
            margin-right: 5px;
            vertical-align: middle;
            border: 1px solid #ccc;
            border-radius: 2px;
        }
    `;

    // Список текстових замін з HTML-прапорцями
    const REPLACEMENTS = {
        'Дублированный': 'Дубльований',
        'Ukr': '<span class="ua-flag"></span> Українською',
        'Ua': '<span class="ua-flag"></span> UA',
        'Дубляж': 'Дубльований',
        'Многоголосый': 'Багатоголосий',
        'Украинский': '<span class="ua-flag"></span> Українською',
        'Zetvideo': 'UaFlix',
        'Нет истории просмотра': 'Історія перегляду відсутня'
    };

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
    style.innerHTML = EMOJI_STYLES + '\n' + Object.entries(STYLES).map(([selector, props]) => {
        return `${selector} { ${Object.entries(props).map(([prop, val]) => `${prop}: ${val} !important`).join('; ')} }`;
    }).join('\n');
    document.head.appendChild(style);

    // Функція для заміни текстів з підтримкою HTML
    function replaceTexts() {
        const containers = [
            '.online-prestige-watched__body',
            '.online-prestige--full .online-prestige__title',
            '.online-prestige--full .online-prestige__info'
        ];

        containers.forEach(selector => {
            document.querySelectorAll(selector).forEach(container => {
                let html = container.innerHTML;
                let changed = false;
                
                Object.entries(REPLACEMENTS).forEach(([original, replacement]) => {
                    if (html.includes(original)) {
                        html = html.replace(new RegExp(original, 'g'), replacement);
                        changed = true;
                    }
                });
                
                if (changed) {
                    container.innerHTML = html;
                    // Додаємо клас emoji-font до всіх елементів всередині контейнера
                    container.querySelectorAll('*').forEach(el => {
                        if (!el.classList.contains('emoji-font')) {
                            el.classList.add('emoji-font');
                        }
                    });
                }
            });
        });
    }

    // Інші функції залишаються без змін
    function updateTorrentStyles() {
        document.querySelectorAll('.torrent-item__seeds span').forEach(span => {
            const seeds = parseInt(span.textContent) || 0;
            span.classList.remove('low-seeds', 'medium-seeds', 'high-seeds');
            if (seeds <= 4) span.classList.add('low-seeds');
            else if (seeds <= 14) span.classList.add('medium-seeds');
            else span.classList.add('high-seeds');
        });

        document.querySelectorAll('.torrent-item__bitrate span').forEach(span => {
            const bitrate = parseFloat(span.textContent) || 0;
            span.classList.remove('low-bitrate', 'medium-bitrate', 'high-bitrate');
            if (bitrate <= 10) span.classList.add('low-bitrate');
            else if (bitrate <= 40) span.classList.add('medium-bitrate');
            else span.classList.add('high-bitrate');
        });

        document.querySelectorAll('.torrent-item__tracker').forEach(tracker => {
            const text = tracker.textContent.trim().toLowerCase();
            tracker.classList.remove('utopia', 'toloka', 'mazepa');
            if (text.includes('utopia')) tracker.classList.add('utopia');
            else if (text.includes('toloka')) tracker.classList.add('toloka');
            else if (text.includes('mazepa')) tracker.classList.add('mazepa');
        });
    }

    function updateAll() {
        replaceTexts();
        updateTorrentStyles();
    }

    const observer = new MutationObserver(mutations => {
        if (mutations.some(m => m.addedNodes.length)) {
            setTimeout(updateAll, 100);
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    updateAll();
})();

Lampa.Platform.tv();

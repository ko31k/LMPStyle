(function(){
    // ===================== КОНФІГУРАЦІЯ ПРАПОРЦЯ =====================
    const UKRAINE_FLAG_SVG = '<svg viewBox="0 0 20 15"><rect width="20" height="7.5" y="0" fill="#0057B7"/><rect width="20" height="7.5" y="7.5" fill="#FFD700"/></svg>';

    // ===================== СИСТЕМА ТЕКСТОВИХ ЗАМІН =====================
    const REPLACEMENTS = [
        ['Uaflix', 'UAFlix'],
        ['Zetvideo', 'UaFlix'],
        ['Нет истории просмотра', 'Історія перегляду відсутня'],
        ['Дублированный', 'Дубльований'],
        ['Дубляж', 'Дубльований'],
        ['Многоголосый', 'Багатоголосий'],
        ['Украинский', UKRAINE_FLAG_SVG + ' Українською'],
        ['Український', UKRAINE_FLAG_SVG + ' Українською'],
        ['Украинская', UKRAINE_FLAG_SVG + ' Українською'],
        ['Українська', UKRAINE_FLAG_SVG + ' Українською'],
        ['1+1', UKRAINE_FLAG_SVG + ' 1+1']
    ];

    // ===================== СИСТЕМА СТИЛІВ ДЛЯ ПРАПОРЦЯ =====================
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
            margin-top: -5.5px;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            border: 1px solid rgba(0,0,0,0.15);
            width: 25px;
            height: 19px;
        }
        
        @media (max-width: 767px) {
            .flag-svg {
                width: 18.75px;
                height: 14.25px;
                margin-right: 6px;
                margin-top: -4px;
            }
        }
        
        .flag-container ~ span,
        .flag-container + * {
            vertical-align: middle;
        }
        
        .ua-flag-processed {
            position: relative;
        }

        /* Стилі для фільтрів перекладу */
        .voice-option .flag-svg,
        .audio-option .flag-svg,
        .translation-item .flag-svg {
            margin-right: 6px;
            margin-top: -2px;
            width: 20px;
            height: 15px;
        }
    `;

    // ===================== СИСТЕМА КОЛЬОРОВИХ ІНДИКАТОРІВ =====================
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

    // ===================== ІНІЦІАЛІЗАЦІЯ СТИЛІВ =====================
    let style = document.createElement('style');
    style.innerHTML = FLAG_STYLES + '\n' + Object.entries(STYLES).map(([selector, props]) => {
        return `${selector} { ${Object.entries(props).map(([prop, val]) => `${prop}: ${val} !important`).join('; ')} }`;
    }).join('\n');
    document.head.appendChild(style);

    // ===================== ОБРОБКА ФІЛЬТРІВ ПЕРЕКЛАДУ =====================
    function processTranslationFilters() {
        // Спеціальні селектори тільки для фільтрів перекладу
        const translationSelectors = [
            '.selector__body',
            '.dropdown__body',
            '.filter__body',
            '[data-type="voice"]',
            '[data-type="audio"]',
            '[data-type="translation"]'
        ];

        translationSelectors.forEach(selector => {
            const containers = document.querySelectorAll(selector);
            containers.forEach(container => {
                if (container.classList.contains('ua-translation-processed')) return;
                
                // Шукаємо тільки елементи з текстом перекладу
                const textElements = container.querySelectorAll('.selector__item, .dropdown__item, .filter__item, [class*="item"]');
                
                textElements.forEach(element => {
                    if (element.classList.contains('ua-flag-processed')) return;
                    
                    const text = element.textContent;
                    let newHtml = element.innerHTML;
                    let changed = false;

                    // Тільки для українських перекладів
                    const isUkrainian = text.match(/(Українськ|Украинск|Ukr|UKR|\[UKR\]|Цікава Ідея|DniproFilm)/i);
                    
                    if (isUkrainian && !newHtml.includes(UKRAINE_FLAG_SVG)) {
                        // Додаємо прапор тільки на початок тексту
                        newHtml = UKRAINE_FLAG_SVG + ' ' + newHtml;
                        changed = true;
                    }
                    
                    if (changed) {
                        element.innerHTML = newHtml;
                        element.classList.add('ua-flag-processed');
                        
                        // Додаємо контейнер для прапора
                        element.querySelectorAll('svg').forEach(svg => {
                            if (!svg.closest('.flag-container')) {
                                svg.classList.add('flag-svg');
                                const wrapper = document.createElement('span');
                                wrapper.className = 'flag-container';
                                svg.parentNode.insertBefore(wrapper, svg);
                                wrapper.appendChild(svg);
                            }
                        });
                    }
                });
                
                container.classList.add('ua-translation-processed');
            });
        });
    }

    // ===================== ОБРОБКА ЗАГАЛЬНИХ ТЕКСТІВ =====================
    function replaceTexts() {
        const safeContainers = [
            '.online-prestige-watched__body',
            '.online-prestige--full .online-prestige__title',
            '.online-prestige--full .online-prestige__info',
            '.online-prestige__description'
        ];

        safeContainers.forEach(selector => {
            const elements = document.querySelectorAll(selector + ':not(.ua-flag-processed)');
            elements.forEach(element => {
                let html = element.innerHTML;
                let changed = false;
                
                REPLACEMENTS.forEach(([original, replacement]) => {
                    if (html.includes(original) && !html.includes(UKRAINE_FLAG_SVG)) {
                        html = html.replace(new RegExp(original, 'g'), replacement);
                        changed = true;
                    }
                });
                
                if (changed) {
                    element.innerHTML = html;
                    element.classList.add('ua-flag-processed');
                    
                    element.querySelectorAll('svg').forEach(svg => {
                        if (!svg.closest('.flag-container')) {
                            svg.classList.add('flag-svg');
                            const wrapper = document.createElement('span');
                            wrapper.className = 'flag-container';
                            svg.parentNode.insertBefore(wrapper, svg);
                            wrapper.appendChild(svg);
                        }
                    });
                }
            });
        });
    }

    // ===================== СИСТЕМА ОНОВЛЕННЯ СТИЛІВ ТОРЕНТІВ =====================
    function updateTorrentStyles() {
        const elements = {
            seeds: document.querySelectorAll('.torrent-item__seeds span'),
            bitrate: document.querySelectorAll('.torrent-item__bitrate span'),
            tracker: document.querySelectorAll('.torrent-item__tracker')
        };

        elements.seeds.forEach(span => {
            const seeds = parseInt(span.textContent) || 0;
            span.classList.remove('low-seeds', 'medium-seeds', 'high-seeds');
            if (seeds <= 4) span.classList.add('low-seeds');
            else if (seeds <= 14) span.classList.add('medium-seeds');
            else span.classList.add('high-seeds');
        });

        elements.bitrate.forEach(span => {
            const bitrate = parseFloat(span.textContent) || 0;
            span.classList.remove('low-bitrate', 'medium-bitrate', 'high-bitrate');
            if (bitrate <= 10) span.classList.add('low-bitrate');
            else if (bitrate <= 40) span.classList.add('medium-bitrate');
            else span.classList.add('high-bitrate');
        });

        elements.tracker.forEach(tracker => {
            const text = tracker.textContent.trim().toLowerCase();
            tracker.classList.remove('utopia', 'toloka', 'mazepa');
            if (text.includes('utopia')) tracker.classList.add('utopia');
            else if (text.includes('toloka')) tracker.classList.add('toloka');
            else if (text.includes('mazepa')) tracker.classList.add('mazepa');
        });
    }

    // ===================== ОСНОВНА ФУНКЦІЯ ОНОВЛЕННЯ =====================
    function updateAll() {
        try {
            replaceTexts();
            processTranslationFilters();
            updateTorrentStyles();
        } catch (error) {
            console.warn('Помилка оновлення:', error);
        }
    }

    // ===================== СИСТЕМА СПОСТЕРЕЖЕННЯ =====================
    let updateTimeout = null;
    const observer = new MutationObserver(mutations => {
        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(updateAll, 200);
    });

    observer.observe(document.body, { 
        childList: true,
        subtree: true
    });
    
    // Первинна ініціалізація
    setTimeout(updateAll, 1000);
})();

// ===================== ІНІЦІАЛІЗАЦІЯ TV РЕЖИМУ LAMPA =====================
Lampa.Platform.tv();

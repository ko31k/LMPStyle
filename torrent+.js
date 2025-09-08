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

    // ===================== ОБРОБКА ФІЛЬТРІВ ПЕРЕКЛАДУ ДЛЯ СЕРІАЛІВ =====================
    function processSeriesTranslationFilters() {
        console.log('Пошук фільтрів перекладу для серіалів...');
        
        // ВСІ МОЖЛИВІ СЕЛЕКТОРИ ДЛЯ ФІЛЬТРІВ СЕРІАЛІВ
        const allPossibleSelectors = [
            // Основні контейнери
            '.selector',
            '.dropdown',
            '.filter',
            '.voice-selector',
            '.audio-selector',
            '.translation-selector',
            '.dubbing-selector',
            
            // Тіла контейнерів
            '.selector__body',
            '.dropdown__body',
            '.filter__body',
            '.selector__content',
            '.dropdown__content',
            '.filter__content',
            
            // Списки
            '.selector__list',
            '.dropdown__list',
            '.filter__list',
            '.voice-list',
            '.audio-list',
            '.translation-list',
            '.dubbing-list',
            '.studio-list',
            
            // Елементи списків
            '.selector__item',
            '.dropdown__item',
            '.filter__item',
            '.voice-item',
            '.audio-item',
            '.translation-item',
            '.dubbing-item',
            '.studio-item',
            
            // Опції
            '.selector__option',
            '.dropdown__option',
            '.filter__option',
            '.voice-option',
            '.audio-option',
            '.translation-option',
            '.dubbing-option',
            
            // Data-атрибути
            '[data-type="voice"]',
            '[data-type="audio"]',
            '[data-type="translation"]',
            '[data-type="dubbing"]',
            '[data-type="studio"]',
            
            // Загальні класи
            '[class*="voice"]',
            '[class*="audio"]',
            '[class*="translation"]',
            '[class*="dubbing"]',
            '[class*="studio"]',
            '[class*="переклад"]',
            '[class*="озвучення"]',
            '[class*="дубляж"]'
        ];

        // Спроба знайти фільтри перекладу
        let foundFilters = false;

        allPossibleSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    console.log('Знайдено елементи за селектором:', selector, elements.length);
                    
                    elements.forEach(element => {
                        if (element.classList.contains('ua-series-processed')) return;
                        
                        // Шукаємо текстовий вміст з перекладами
                        const text = element.textContent || '';
                        const isTranslationFilter = text.includes('Переклад') || 
                                                   text.includes('Озвучення') ||
                                                   text.includes('DniproFilm') ||
                                                   text.includes('Цікава Ідея') ||
                                                   text.includes('LostFilm') ||
                                                   text.match(/(Українськ|Украинск|Ukr|UKR|рус|eng)/i);
                        
                        if (isTranslationFilter && !element.innerHTML.includes(UKRAINE_FLAG_SVG)) {
                            console.log('Обробка фільтра перекладу:', text.substring(0, 50));
                            
                            // Додаємо прапори до українських варіантів
                            let newHtml = element.innerHTML;
                            let changed = false;
                            
                            // Українські студії та позначення
                            const ukrainianPatterns = [
                                'Цікава Ідея', 'DniproFilm', 'Українська', 'Украинская', 'Ukr', 'UKR', '[UKR]'
                            ];
                            
                            ukrainianPatterns.forEach(pattern => {
                                if (newHtml.includes(pattern) && !newHtml.includes(UKRAINE_FLAG_SVG)) {
                                    newHtml = newHtml.replace(new RegExp(pattern, 'g'), UKRAINE_FLAG_SVG + ' ' + pattern);
                                    changed = true;
                                }
                            });
                            
                            if (changed) {
                                element.innerHTML = newHtml;
                                foundFilters = true;
                                
                                // Додаємо контейнери для прапорів
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
                        }
                        
                        element.classList.add('ua-series-processed');
                    });
                }
            } catch (error) {
                console.warn('Помилка обробки селектора', selector, error);
            }
        });

        if (!foundFilters) {
            console.log('Фільтри перекладу не знайдено, спроба через 2 секунди...');
            setTimeout(processSeriesTranslationFilters, 2000);
        }
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
    setTimeout(processSeriesTranslationFilters, 1500);
})();

// ===================== ІНІЦІАЛІЗАЦІЯ TV РЕЖИМУ LAMPA =====================
Lampa.Platform.tv();

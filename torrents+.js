(function(){
    // ===================== КОНФІГУРАЦІЯ ПРАПОРЦЯ =====================
    const UKRAINE_FLAG_SVG = '<svg viewBox="0 0 20 15"><rect width="20" height="7.5" y="0" fill="#0057B7"/><rect width="20" height="7.5" y="7.5" fill="#FFD700"/></svg>';

    // ===================== СИСТЕМА ТЕКСТОВИХ ЗАМІН =====================
    const REPLACEMENTS = [
        // ---------- Перший пріоритет: складні та довші слова ----------
        ['Uaflix', 'UAFlix'],
        ['Zetvideo', 'UaFlix'],
        ['Нет истории просмотра', 'Історія перегляду відсутня'],
        ['Дублированный', 'Дубльований'],
        ['Дубляж', 'Дубльований'],
        ['Многоголосый', 'Багатоголосий'],
        
        // ---------- Другий пріоритет: слова з прапорами ----------
        ['Украинский', UKRAINE_FLAG_SVG + ' Українською'],
        ['Український', UKRAINE_FLAG_SVG + ' Українською'],
        ['Украинская', UKRAINE_FLAG_SVG + ' Українською'],
        ['Українська', UKRAINE_FLAG_SVG + ' Українською'],
        ['1+1', UKRAINE_FLAG_SVG + ' 1+1'],
        
        // ---------- Третій пріоритет: регулярні вирази з умовами ----------
        {
            pattern: /\bUkr\b/gi,
            replacement: UKRAINE_FLAG_SVG + ' Українською',
            condition: (text) => !text.includes('flag-container')
        },
        {
            pattern: /\bUa\b/gi, 
            replacement: UKRAINE_FLAG_SVG + ' UA',
            condition: (text) => !text.includes('flag-container')
        }
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
            margin-right: 3px;
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
                margin-right: 2px;
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

        /* Спеціальні стилі для фільтрів та випадаючих списків */
        .filter-item .flag-svg,
        .selector-item .flag-svg,
        .dropdown-item .flag-svg,
        .voice-option .flag-svg,
        .audio-option .flag-svg {
            margin-right: 2px;
            margin-top: -2px;
            width: 20px;
            height: 15px;
        }

        /* Стилі для описів відео */
        .online-prestige__description,
        .video-description,
        [class*="description"],
        [class*="info"] {
            line-height: 1.5;
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

    // ===================== СИСТЕМА ЗАМІНИ ТЕКСТУ ДЛЯ ФІЛЬТРІВ =====================
    const UKRAINIAN_STUDIOS = [
        'DniproFilm', 'Дніпрофільм', 'Цікава Ідея', 'Колодій Трейлерів', 
        'UaFlix', 'BaibaKo', 'В одне рило', 'Так Треба Продакшн', 
        'TreleMore', 'Гуртом', 'Exit Studio', 'FilmUA', 'Novator Film', 
        'LeDoyen', 'Postmodern', 'Pryanik', 'CinemaVoice', 'UkrainianVoice'
    ];

    function processVoiceFilters() {
        const voiceFilterSelectors = [
            '[data-type="voice"]',
            '[data-type="audio"]',
            '.voice-options',
            '.audio-options',
            '.voice-list',
            '.audio-list',
            '.studio-list',
            '.translation-filter',
            '.dubbing-filter'
        ];

        voiceFilterSelectors.forEach(selector => {
            try {
                const filters = document.querySelectorAll(selector);
                filters.forEach(filter => {
                    if (filter.classList.contains('ua-voice-processed')) return;
                    
                    let html = filter.innerHTML;
                    let changed = false;
                    
                    // Додаємо прапори тільки для українських студій у фільтрах
                    UKRAINIAN_STUDIOS.forEach(studio => {
                        if (html.includes(studio) && !html.includes(UKRAINE_FLAG_SVG)) {
                            html = html.replace(new RegExp(studio, 'g'), UKRAINE_FLAG_SVG + ' ' + studio);
                            changed = true;
                        }
                    });

                    // Додаємо прапори для загальних українських позначень
                    if (html.includes('Українська') && !html.includes(UKRAINE_FLAG_SVG)) {
                        html = html.replace(/Українська/g, UKRAINE_FLAG_SVG + ' Українська');
                        changed = true;
                    }
                    if (html.includes('Украинская') && !html.includes(UKRAINE_FLAG_SVG)) {
                        html = html.replace(/Украинская/g, UKRAINE_FLAG_SVG + ' Українська');
                        changed = true;
                    }
                    if (html.includes('Ukr') && !html.includes(UKRAINE_FLAG_SVG)) {
                        html = html.replace(/Ukr/gi, UKRAINE_FLAG_SVG + ' Українською');
                        changed = true;
                    }
                    
                    if (changed) {
                        filter.innerHTML = html;
                        filter.classList.add('ua-voice-processed');
                        
                        filter.querySelectorAll('svg').forEach(svg => {
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
            } catch (error) {
                console.warn('Помилка обробки фільтрів озвучення:', error);
            }
        });
    }

    // ===================== ОПТИМІЗОВАНА СИСТЕМА ЗАМІНИ ТЕКСТУ =====================
    function replaceTexts() {
        // Обмежений список контейнерів для уникнення зависання
        const safeContainers = [
            '.online-prestige-watched__body',
            '.online-prestige--full .online-prestige__title',
            '.online-prestige--full .online-prestige__info',
            '.online-prestige__description',
            '.video-description',
            '.content__description',
            '.movie-info',
            '.series-info'
        ];

        // Безпечний пошук елементів з обмеженням
        const processSafeElements = () => {
            safeContainers.forEach(selector => {
                try {
                    const elements = document.querySelectorAll(selector + ':not(.ua-flag-processed)');
                    elements.forEach(element => {
                        if (element.closest('.hidden, [style*="display: none"]')) return;
                        
                        let html = element.innerHTML;
                        let changed = false;
                        
                        REPLACEMENTS.forEach(item => {
                            if (Array.isArray(item)) {
                                if (html.includes(item[0]) && !html.includes(UKRAINE_FLAG_SVG)) {
                                    html = html.replace(new RegExp(item[0], 'g'), item[1]);
                                    changed = true;
                                }
                            } else if (item.pattern) {
                                if ((!item.condition || item.condition(html)) && item.pattern.test(html) && !html.includes(UKRAINE_FLAG_SVG)) {
                                    html = html.replace(item.pattern, item.replacement);
                                    changed = true;
                                }
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
                                    
                                    if (svg.nextSibling && svg.nextSibling.nodeType === 3) {
                                        wrapper.appendChild(svg.nextSibling);
                                    }
                                }
                            });
                        }
                    });
                } catch (error) {
                    console.warn('Помилка обробки селектора:', selector, error);
                }
            });
        };

        // Виконуємо обробку з обмеженням часу
        const startTime = Date.now();
        const TIME_LIMIT = 50;
        
        processSafeElements();
        
        // Окремо обробляємо фільтри озвучення
        if (Date.now() - startTime < TIME_LIMIT) {
            processVoiceFilters();
        }
    }

    // ===================== СИСТЕМА ОНОВЛЕННЯ СТИЛІВ ТОРЕНТІВ =====================
    function updateTorrentStyles() {
        // Швидка обробка тільки видимих елементів
        const visibleElements = {
            seeds: document.querySelectorAll('.torrent-item__seeds span:not([style*="display: none"])'),
            bitrate: document.querySelectorAll('.torrent-item__bitrate span:not([style*="display: none"])'),
            tracker: document.querySelectorAll('.torrent-item__tracker:not([style*="display: none"])')
        };

        if (visibleElements.seeds.length > 0) {
            visibleElements.seeds.forEach(span => {
                const seeds = parseInt(span.textContent) || 0;
                span.classList.remove('low-seeds', 'medium-seeds', 'high-seeds');
                
                if (seeds <= 4) span.classList.add('low-seeds');
                else if (seeds <= 14) span.classList.add('medium-seeds');
                else span.classList.add('high-seeds');
            });
        }

        if (visibleElements.bitrate.length > 0) {
            visibleElements.bitrate.forEach(span => {
                const bitrate = parseFloat(span.textContent) || 0;
                span.classList.remove('low-bitrate', 'medium-bitrate', 'high-bitrate');
                
                if (bitrate <= 10) span.classList.add('low-bitrate');
                else if (bitrate <= 40) span.classList.add('medium-bitrate');
                else span.classList.add('high-bitrate');
            });
        }

        if (visibleElements.tracker.length > 0) {
            visibleElements.tracker.forEach(tracker => {
                const text = tracker.textContent.trim().toLowerCase();
                tracker.classList.remove('utopia', 'toloka', 'mazepa');
                
                if (text.includes('utopia')) tracker.classList.add('utopia');
                else if (text.includes('toloka')) tracker.classList.add('toloka');
                else if (text.includes('mazepa')) tracker.classList.add('mazepa');
            });
        }
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

    // ===================== ОПТИМІЗОВАНА СИСТЕМА СПОСТЕРЕЖЕННЯ =====================
    let updateTimeout = null;
    const observer = new MutationObserver(mutations => {
        // Фільтруємо тільки важливі зміни
        const hasImportantChanges = mutations.some(mutation => {
            return mutation.addedNodes.length > 0 && 
                   !mutation.target.closest('.hidden, [style*="display: none"]');
        });

        if (hasImportantChanges) {
            clearTimeout(updateTimeout);
            updateTimeout = setTimeout(updateAll, 150);
        }
    });

    // Обмежене спостереження
    observer.observe(document.body, { 
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false
    });
    
    // Відкладена ініціалізація
    setTimeout(updateAll, 1000);
})();

// ===================== ІНІЦІАЛІЗАЦІЯ TV РЕЖИМУ LAMPA =====================
Lampa.Platform.tv();

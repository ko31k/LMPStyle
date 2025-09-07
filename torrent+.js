(function(){
    // ===================== КОНФІГУРАЦІЯ ПРАПОРЦЯ =====================
    // SVG прапорець України БЕЗ вбудованих стилів - лише векторні дані
    // Видалено width, height, style з SVG щоб CSS мав повний контроль
    const UKRAINE_FLAG_SVG = '<svg viewBox="0 0 20 15"><rect width="20" height="7.5" y="0" fill="#0057B7"/><rect width="20" height="7.5" y="7.5" fill="#FFD700"/></svg>';

    // ===================== СИСТЕМА ТЕКСТОВИХ ЗАМІН =====================
    // Важливий порядок: спочатку довші слова, потім коротші
    const REPLACEMENTS = [
        // ---------- Перший пріоритет: складні та довші слова ----------
        ['Uaflix', 'UAFlix'],                    // Заміна бренду (від Zetvideo до UAFlix)
        ['Zetvideo', 'UaFlix'],                  // Альтернативна назва сервісу
        ['Нет истории просмотра', 'Історія перегляду відсутня'], // Переклад російського тексту
        ['Дублированный', 'Дубльований'],        // Корекція терміну дублювання
        ['Дубляж', 'Дубльований'],               // Альтернативний варіант терміну
        ['Многоголосый', 'Багатоголосий'],       // Переклад типу озвучення
        
        // ---------- Другий пріоритет: слова з прапорами ----------
        ['Украинский', UKRAINE_FLAG_SVG + ' Українською'], // Повна форма з прапором
        ['Ukr', UKRAINE_FLAG_SVG + ' Українською'],        // Коротка форма (малі літери)
        ['UKR', UKRAINE_FLAG_SVG + ' Українською'],        // Коротка форма (великі літери)
        ['Ua', UKRAINE_FLAG_SVG + ' UA'],                  // Скорочення (малі літери)
        
        // ---------- Третій пріоритет: регулярні вирази (нечутливі до регістру) ----------
        [/\bUa\b/gi, UKRAINE_FLAG_SVG + ' UA'],           // Будь-який регістр: UA, ua, Ua
        [/\bUkr\b/gi, UKRAINE_FLAG_SVG + ' Українською']  // Будь-який регістр: UKR, ukr, Ukr
    ];

    // ===================== СИСТЕМА СТИЛІВ ДЛЯ ПРАПОРЦЯ =====================
    const FLAG_STYLES = `
        /* Контейнер для прапора та тексту - забезпечує точне вирівнювання */
        .flag-container {
            display: inline-flex;                /* Гнучкий контейнер в рядку */
            align-items: center;                 /* Вертикальне центрування вмісту */
            vertical-align: middle;              /* Вирівнювання по середині рядка */
            height: 1.27em;                      /* Адаптивна висота (емівські одиниці) */
        }
        
        /* Стилі безпосередньо для SVG прапора */
        .flag-svg {
            display: inline-block;               /* Блоковий елемент в потокі тексту */
            vertical-align: middle;              /* Вертикальне центрування в рядку */
            margin-right: 8px;                   /* Простір між прапором і текстом */
            margin-top: -5.5px;                  /* Точна корекція позиції по вертикалі */
            border-radius: 5px;                  /* Закруглені кути для сучасного вигляду */
            box-shadow: 0 2px 4px rgba(0,0,0,0.2); /* Легка тінь для 3D ефекту */
            border: 1px solid rgba(0,0,0,0.15);  /* Тонка рамка для кращого контрасту */
            width: 25px;                         /* Фіксована ширина прапора */
            height: 19px;                        /* Фіксована висота прапора */
        }
        
        /* Стилі для тексту поруч з прапором - забезпечують узгоджене вирівнювання */
        .flag-container ~ span,
        .flag-container + * {
            vertical-align: middle;              /* Центрування тексту відносно прапора */
        }
    `;

    // ===================== СИСТЕМА КОЛЬОРОВИХ ІНДИКАТОРІВ =====================
    const STYLES = {
        // ---------- Індикатори кількості роздач (Seeds) ----------
        '.torrent-item__seeds span.low-seeds': {
            color: '#e74c3c',                    // Червоний - критично мало (0-4)
            'font-weight': 'bold'                // Жирний шрифт для акценту
        },
        '.torrent-item__seeds span.medium-seeds': {
            color: '#ffff00',                    // Жовтий - середня кількість (5-14)
           'font-weight': 'bold'                 // Жирний шрифт для помітності
        },
        '.torrent-item__seeds span.high-seeds': {
            color: '#2ecc71',                    // Зелений - багато роздач (15+)
            'font-weight': 'bold'                // Жирний шрифт для виділення
        },
        
        // ---------- Індикатори якості (бітрейт) ----------
        '.torrent-item__bitrate span.low-bitrate': {
            color: '#ffff00',                    // Жовтий - низька якість (≤10)
            'font-weight': 'bold'                // Жирний шрифт для попередження
        },
        '.torrent-item__bitrate span.medium-bitrate': {
            color: '#2ecc71',                    // Зелений - середня якість (11-40)
            'font-weight': 'bold'                // Жирний шрифт для позитивного акценту
        },
        '.torrent-item__bitrate span.high-bitrate': {
            color: '#e74c3c',                    // Червоний - висока якість (41+)
            'font-weight': 'bold'                // Жирний шрифт для виділення
        },
        
        // ---------- Індикатори джерел (трекери) ----------
        '.torrent-item__tracker.utopia': {
            color: '#9b59b6',                    // Фіолетовий - трекер Utopia
            'font-weight': 'bold'                // Жирний шрифт для ідентифікації
        },
        '.torrent-item__tracker.toloka': {
            color: '#3498db',                    // Блакитний - трекер Toloka  
            'font-weight': 'bold'                // Жирний шрифт для ідентифікації
        },
        '.torrent-item__tracker.mazepa': {
            color: '#C9A0DC',                    // Лавандовий - трекер Mazepa
            'font-weight': 'bold'                // Жирний шрифт для ідентифікації
        }
    };

    // ===================== ІНІЦІАЛІЗАЦІЯ СТИЛІВ =====================
    let style = document.createElement('style'); // Створення динамічного стилевого елемента
    style.innerHTML = FLAG_STYLES + '\n' + Object.entries(STYLES).map(([selector, props]) => {
        // Генерація CSS правил для кожного селектора
        return `${selector} { ${Object.entries(props).map(([prop, val]) => `${prop}: ${val} !important`).join('; ')} }`;
    }).join('\n'); // Об'єднання всіх правил в один рядок
    document.head.appendChild(style); // Вставка стилів в голову документа

    // ===================== СИСТЕМА ЗАМІНИ ТЕКСТУ =====================
    function replaceTexts() {
        // Список контейнерів для обробки (CSS селектори)
        const containers = [
            '.online-prestige-watched__body',     // Історія перегляду
            '.online-prestige--full .online-prestige__title', // Заголовки повних описів
            '.online-prestige--full .online-prestige__info'   // Інформаційні блоки
        ];

        // Обхід всіх контейнерів
        containers.forEach(selector => {
            document.querySelectorAll(selector).forEach(container => {
                let html = container.innerHTML; // Оригінальний HTML вміст
                let changed = false;           // Флаг змін
                
                // Послідовна обробка всіх шаблонів заміни
                REPLACEMENTS.forEach(([original, replacement]) => {
                    if (original instanceof RegExp) {
                        // Обробка регулярних виразів (нечутливі до регістру)
                        if (original.test(html)) {
                            html = html.replace(original, replacement);
                            changed = true; // Встановлення флагу змін
                        }
                    } else {
                        // Обробка звичайних рядків (чутливі до регістру)
                        if (html.includes(original)) {
                            html = html.replace(new RegExp(original, 'g'), replacement);
                            changed = true; // Встановлення флагу змін
                        }
                    }
                });
                
                // Якщо були зміни - оновлюємо вміст
                if (changed) {
                    container.innerHTML = html;
                    
                    // Обробка SVG прапорців для вирівнювання
                    container.querySelectorAll('svg').forEach(svg => {
                        svg.classList.add('flag-svg'); // Додавання CSS класу
                        // Створення контейнера для вирівнювання
                        if (svg.parentNode && !svg.parentNode.classList.contains('flag-container')) {
                            const wrapper = document.createElement('span');
                            wrapper.className = 'flag-container';
                            svg.parentNode.insertBefore(wrapper, svg);
                            wrapper.appendChild(svg);
                            // Додавання сусіднього тексту в контейнер
                            if (svg.nextSibling && svg.nextSibling.nodeType === 3) {
                                wrapper.appendChild(svg.nextSibling);
                            }
                        }
                    });
                }
            });
        });
    }

    // ===================== СИСТЕМА ОНОВЛЕННЯ СТИЛІВ ТОРЕНТІВ =====================
    function updateTorrentStyles() {
        // Оновлення індикаторів кількості роздач
        document.querySelectorAll('.torrent-item__seeds span').forEach(span => {
            const seeds = parseInt(span.textContent) || 0; // Числове значення
            span.classList.remove('low-seeds', 'medium-seeds', 'high-seeds'); // Очищення старих класів
            
            // Динамічне додавання класів за значенням
            if (seeds <= 4) {
                span.classList.add('low-seeds'); // Червоний індикатор
            } else if (seeds <= 14) {
                span.classList.add('medium-seeds'); // Жовтий індикатор
            } else {
                span.classList.add('high-seeds'); // Зелений індикатор
            }
        });

        // Оновлення індикаторів якості (бітрейт)
        document.querySelectorAll('.torrent-item__bitrate span').forEach(span => {
            const bitrate = parseFloat(span.textContent) || 0; // Числове значення
            span.classList.remove('low-bitrate', 'medium-bitrate', 'high-bitrate'); // Очищення
            
            // Динамічне додавання класів за значенням
            if (bitrate <= 10) {
                span.classList.add('low-bitrate'); // Жовтий індикатор
            } else if (bitrate <= 40) {
                span.classList.add('medium-bitrate'); // Зелений індикатор
            } else {
                span.classList.add('high-bitrate'); // Червоний індикатор
            }
        });

        // Оновлення індикаторів джерел (трекери)
        document.querySelectorAll('.torrent-item__tracker').forEach(tracker => {
            const text = tracker.textContent.trim().toLowerCase(); // Текст в нижньому регістрі
            tracker.classList.remove('utopia', 'toloka', 'mazepa'); // Очищення старих класів
            
            // Додавання класів за назвою трекера
            if (text.includes('utopia')) tracker.classList.add('utopia');
            else if (text.includes('toloka')) tracker.classList.add('toloka');
            else if (text.includes('mazepa')) tracker.classList.add('mazepa');
        });
    }

    // ===================== ОСНОВНА ФУНКЦІЯ ОНОВЛЕННЯ =====================
    function updateAll() {
        replaceTexts();        // Виконання текстових замін
        updateTorrentStyles(); // Оновлення візуальних стилів
    }

    // ===================== СИСТЕМА СПОСТЕРЕЖЕННЯ ЗМІН DOM =====================
    const observer = new MutationObserver(mutations => {
        // Перевірка на додані нові елементи
        if (mutations.some(m => m.addedNodes.length)) {
            setTimeout(updateAll, 100); // Відкладене оновлення (100ms)
        }
    });

    // Запуск спостерігача за змінами в DOM
    observer.observe(document.body, { 
        childList: true,    // Спостереження за зміною дочірніх елементів
        subtree: true       // Спостереження за всіма вкладеними елементами
    });
    
    // Первинна ініціалізація при завантаженні
    updateAll();
})();

// ===================== ІНІЦІАЛІЗАЦІЯ TV РЕЖИМУ LAMPA =====================
Lampa.Platform.tv();

(function(){
    // SVG прапорець України БЕЗ вбудованих стилів (лише дані)
    // Видалено width, height та style з SVG, щоб CSS мав пріоритет
    const UKRAINE_FLAG_SVG = '<svg viewBox="0 0 20 15"><rect width="20" height="7.5" y="0" fill="#0057B7"/><rect width="20" height="7.5" y="7.5" fill="#FFD700"/></svg>';

    // Список текстових замін в правильному порядку (важливо для уникнення конфліктів)
    const REPLACEMENTS = [
        // Спочатку замінюємо складніші та довші слова
        ['Uaflix', 'UAFlix'],                    // Заміна назви сервісу
        ['Zetvideo', 'UaFlix'],                  // Заміна іншого найменування сервісу
        ['Нет истории просмотра', 'Історія перегляду відсутня'], // Заміна російського тексту
        ['Дублированный', 'Дубльований'],        // Заміна терміну дублювання
        ['Дубляж', 'Дубльований'],               // Альтернативна заміна терміну
        ['Многоголосый', 'Багатоголосий'],       // Заміна типу озвучення
        
        // Потім замінюємо слова з прапорами - ВАЖЛИВИЙ ПОРЯДОК!
        ['Украинский', UKRAINE_FLAG_SVG + ' Українською'], // Заміна з прапором
        ['Ukr', UKRAINE_FLAG_SVG + ' Українською'],        // Коротка форма з прапором
        
        // Використовуємо регулярний вираз для точної заміни лише окремих слів
        [/\bUa\b/g, UKRAINE_FLAG_SVG + ' UA']    // Заміняємо тільки окреме слово "Ua"
    ];

    // Додаткові CSS стилі для коректного відображення прапорців
    // Тепер CSS має повний контроль над стилями
    const FLAG_STYLES = `
        .flag-container {
            display: inline-flex;                /* Гнучкий контейнер для вирівнювання */
            align-items: center;                 /* Вертикальне вирівнювання по центру */
            vertical-align: middle;              /* Вирівнювання по середині рядка */
            height: 1.27em;                      /* Відносна висота (20px при 16px шрифті) */
        }
        .flag-svg {
            display: inline-block;               /* Блоковий елемент в рядку */
            vertical-align: middle;              /* Вирівнювання по середині */
            margin-right: 8px;                   /* Відступ праворуч від прапора */
            margin-top: -5.5px;                  /* Корекція положення - по центру уявної червоної лінії */
            border-radius: 5px;                  /* Закруглені кути для естетики */
            box-shadow: 0 2px 4px rgba(0,0,0,0.2); /* Легка тінь для об'ємного ефекту */
            border: 1px solid rgba(0,0,0,0.15);  /* Тонка рамка для кращого контуру */
            width: 25px;                         /* Ширина прапора (контролюється CSS) */
            height: 19px;                        /* Висота прапора (контролюється CSS) */
        }
        /* Стилі для сусідніх елементів біля прапора */
        .flag-container ~ span,
        .flag-container + * {
            vertical-align: middle;              /* Вирівнювання тексту по центру відносно прапора */
        }
    `;

    // Конфігурація кольорових стилів для різних елементів інтерфейсу
    const STYLES = {
        // Стилі для кількості роздач (Seeds) - три кольорові діапазони
        '.torrent-item__seeds span.low-seeds': {
            color: '#e74c3c',                    // Червоний колір для низької кількості (0-4)
            'font-weight': 'bold'                // Жирний шрифт для кращої видимості
        },
        '.torrent-item__seeds span.medium-seeds': {
            color: '#ffff00',                    // Жовтий колір для середньої кількості (5-14)
           'font-weight': 'bold'                 // Жирний шрифт для кращої видимості
        },
        '.torrent-item__seeds span.high-seeds': {
            color: '#2ecc71',                    // Зелений колір для високої кількості (15+)
            'font-weight': 'bold'                // Жирний шрифт для кращої видимості
        },
        
        // Стилі для бітрейту - три кольорові діапазони
        '.torrent-item__bitrate span.low-bitrate': {
            color: '#ffff00',                    // Жовтий колір для низького бітрейту (≤10)
            'font-weight': 'bold'                // Жирний шрифт для кращої видимості
        },
        '.torrent-item__bitrate span.medium-bitrate': {
            color: '#2ecc71',                    // Зелений колір для середнього бітрейту (11-40)
            'font-weight': 'bold'                // Жирний шрифт для кращої видимості
        },
        '.torrent-item__bitrate span.high-bitrate': {
            color: '#e74c3c',                    // Червоний колір для високого бітрейту (41+)
            'font-weight': 'bold'                // Жирний шрифт для кращої видимості
        },
        
        // Стилі для трекерів (різні кольори для різних джерел)
        '.torrent-item__tracker.utopia': {
            color: '#9b59b6',                    // Фіолетовий колір для трекера Utopia
            'font-weight': 'bold'                // Жирний шрифт для кращої видимості
        },
        '.torrent-item__tracker.toloka': {
            color: '#3498db',                    // Блакитний колір для трекера Toloka
            'font-weight': 'bold'                // Жирний шрифт для кращої видимості
        },
        '.torrent-item__tracker.mazepa': {
            color: '#C9A0DC',                    // Лавандовий колір для трекера Mazepa
            'font-weight': 'bold'                // Жирний шрифт для кращої видимості
        }
    };

    // Додаємо CSS-стилі до документу
    let style = document.createElement('style'); // Створюємо элемент style
    style.innerHTML = FLAG_STYLES + '\n' + Object.entries(STYLES).map(([selector, props]) => {
        // Генеруємо CSS правила для кожного селектора
        return `${selector} { ${Object.entries(props).map(([prop, val]) => `${prop}: ${val} !important`).join('; ')} }`;
    }).join('\n'); // Об'єднуємо всі правила
    document.head.appendChild(style); // Додаємо стилі до head документа

    // Функція для заміни текстів в указаних контейнерах
    function replaceTexts() {
        // Список CSS селекторів контейнерів, де потрібно шукати тексти для заміни
        const containers = [
            '.online-prestige-watched__body',     // Контейнер історії перегляду
            '.online-prestige--full .online-prestige__title', // Заголовок повного опису
            '.online-prestige--full .online-prestige__info'   // Інформація повного опису
        ];

        // Обробляємо кожен контейнер
        containers.forEach(selector => {
            document.querySelectorAll(selector).forEach(container => {
                let html = container.innerHTML; // Отримуємо HTML вміст контейнера
                let changed = false;           // Прапорець змін
                
                // Виконуємо заміни в строгому порядку
                REPLACEMENTS.forEach(([original, replacement]) => {
                    if (original instanceof RegExp) {
                        // Для регулярних виразів (як \bUa\b)
                        if (original.test(html)) {
                            html = html.replace(original, replacement);
                            changed = true;
                        }
                    } else {
                        // Для звичайних рядків
                        if (html.includes(original)) {
                            html = html.replace(new RegExp(original, 'g'), replacement);
                            changed = true;
                        }
                    }
                });
                
                // Якщо були зміни, оновлюємо вміст контейнера
                if (changed) {
                    container.innerHTML = html;
                    
                    // Додаємо CSS класи для кращого вирівнювання прапорців
                    container.querySelectorAll('svg').forEach(svg => {
                        svg.classList.add('flag-svg'); // Додаємо клас для SVG
                        // Створюємо контейнер для прапора та тексту
                        if (svg.parentNode && !svg.parentNode.classList.contains('flag-container')) {
                            const wrapper = document.createElement('span');
                            wrapper.className = 'flag-container';
                            svg.parentNode.insertBefore(wrapper, svg);
                            wrapper.appendChild(svg);
                            // Додаємо текст після прапора в той же контейнер
                            if (svg.nextSibling && svg.nextSibling.nodeType === 3) {
                                wrapper.appendChild(svg.nextSibling);
                            }
                        }
                    });
                }
            });
        });
    }

    // Функція для оновлення стилів торентів (кольори, класи)
    function updateTorrentStyles() {
        // Оновлюємо стилі для кількості роздач (Seeds)
        document.querySelectorAll('.torrent-item__seeds span').forEach(span => {
            const seeds = parseInt(span.textContent) || 0; // Парсимо кількість seeds
            span.classList.remove('low-seeds', 'medium-seeds', 'high-seeds'); // Видаляємо старі класи
            
            // Додаємо класи залежно від кількості seeds
            if (seeds <= 4) {
                span.classList.add('low-seeds'); // Червоний: 0-4
            } else if (seeds <= 14) {
                span.classList.add('medium-seeds'); // Жовтий: 5-14
            } else {
                span.classList.add('high-seeds'); // Зелений: 15+
            }
        });

        // Оновлюємо стилі для бітрейту
        document.querySelectorAll('.torrent-item__bitrate span').forEach(span => {
            const bitrate = parseFloat(span.textContent) || 0; // Парсимо бітрейт
            span.classList.remove('low-bitrate', 'medium-bitrate', 'high-bitrate'); // Видаляємо старі класи
            
            // Додаємо класи залежно від бітрейту
            if (bitrate <= 10) {
                span.classList.add('low-bitrate'); // Жовтий: до 10 включно
            } else if (bitrate <= 40) {
                span.classList.add('medium-bitrate'); // Зелений: 11-40
            } else {
                span.classList.add('high-bitrate'); // Червоний: 41+
            }
        });

        // Оновлюємо стилі для трекерів (джерел)
        document.querySelectorAll('.torrent-item__tracker').forEach(tracker => {
            const text = tracker.textContent.trim().toLowerCase(); // Отримуємо текст трекера
            tracker.classList.remove('utopia', 'toloka', 'mazepa'); // Видаляємо старі класи
            
            // Додаємо класи залежно від назви трекера
            if (text.includes('utopia')) tracker.classList.add('utopia');
            else if (text.includes('toloka')) tracker.classList.add('toloka');
            else if (text.includes('mazepa')) tracker.classList.add('mazepa');
        });
    }

    // Основна функція оновлення - викликає всі необхідні функції
    function updateAll() {
        replaceTexts();        // Замінюємо тексти
        updateTorrentStyles(); // Оновлюємо стилі
    }

    // Створюємо спостерігач (MutationObserver) для відстеження змін DOM
    const observer = new MutationObserver(mutations => {
        // Якщо з'явилися нові елементи
        if (mutations.some(m => m.addedNodes.length)) {
            setTimeout(updateAll, 100); // Викликаємо оновлення з невеликою затримкою
        }
    });

    // Починаємо спостерігати за змінами в body
    observer.observe(document.body, { 
        childList: true,    // Спостерігаємо за додаванням/видаленням дочірніх елементів
        subtree: true       // Спостерігаємо за всіма нащадками
    });
    
    // Викликаємо перше оновлення при завантаженні
    updateAll();
})();

// Ініціалізація TV платформи Lampa
Lampa.Platform.tv();
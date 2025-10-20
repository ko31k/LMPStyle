/**
 * ===========================================================================
 * 🇺🇦 UKRAINIAN ENHANCEMENT PLUGIN FOR LAMPA
 * Версія: 2.1
 * Автор: Українська спільнота
 * 
 * ОПИС ПЛАГІНУ:
 * - Додає українську символіку (прапорці) до українського контенту
 * - Виконує текстові заміни російських слів на українські
 * - Додає кольорові індикатори для торрентів (кількість роздач, якість, трекери)
 * - Додає рамку навколо основного блоку торренту та кольорову рамку для роздаючих
 * - Оптимізовано для TV-режиму Lampa
 * - Підтримує адаптивний дизайн для мобільних пристроїв
 * 
 * ФУНКЦІОНАЛ:
 * 1. Текстові заміни з підтримкою прапорців
 * 2. Візуальні індикатори якості торрентів
 * 3. Рамка навколо основного блоку та кольорова рамка для "роздають"
 * 4. Підсвічування українських студій озвучення
 * 5. Оптимізація продуктивності
 * ===========================================================================
 */

(function(){
    // ===================== КОНФІГУРАЦІЯ ПРАПОРЦЯ =====================
    // SVG прапорець України БЕЗ вбудованих стилів - лише векторні дані
    // Видалено width, height, style з SVG щоб CSS мав повний контроль
    const UKRAINE_FLAG_SVG = '<svg viewBox="0 0 20 15"><rect width="20" height="7.5" y="0" fill="#0057B7"/><rect width="20" height="7.5" y="7.5" fill="#FFD700"/></svg>';

    // ===================== СИСТЕМА ТЕКСТОВИХ ЗАМІН =====================
    // Важливий порядок: спочатку довші слова, потім коротші
    // Додано маркери для уникнення повторної обробки
    const REPLACEMENTS = [
        // ---------- Перший пріоритет: складні та довші слова ----------
        ['Uaflix', 'UAFlix'],                    // Заміна бренду (від Zetvideo до UAFlix)
        ['Zetvideo', 'UaFlix'],                  // Альтернативна назва сервісу
        ['Нет истории просмотра', 'Історія перегляду відсутня'], // Переклад російського тексту
        ['Дублированный', 'Дубльований'],        // Корекція терміну дублювання
        ['Дубляж', 'Дубльований'],               // Альтернативний варіант терміну
        ['Многоголосый', 'Багатоголосий'],       // Переклад типу озвучення
        
        // ---------- Другий пріоритет: слова з прапорами ----------
        ['Украинский', UKRAINE_FLAG_SVG + ' Українською'], // Повна форма з прапором (російська)
        ['Український', UKRAINE_FLAG_SVG + ' Українською'], // Повна форма з прапором (українська)
        ['Украинская', UKRAINE_FLAG_SVG + ' Українською'], // Жіноча форма з прапором (російська)
        ['Українська', UKRAINE_FLAG_SVG + ' Українською'], // Жіноча форма з прапором (українська)
        ['1+1', UKRAINE_FLAG_SVG + ' 1+1'],      // Телеканал 1+1 з прапором
        
        // ---------- Третій пріоритет: регулярні вирази з умовами ----------
        // Додано перевірку на наявність прапора перед заміною
        {
            pattern: /\bUkr\b/gi,
            replacement: UKRAINE_FLAG_SVG + ' Українською',
            condition: (text) => !text.includes('flag-container') // Не замінюємо якщо вже є прапор
        },
        {
            pattern: /\bUa\b/gi, 
            replacement: UKRAINE_FLAG_SVG + ' UA',
            condition: (text) => !text.includes('flag-container') // Не замінюємо якщо вже є прапор
        }
    ];

    // ===================== СИСТЕМА УКРАЇНСЬКИХ СТУДІЙ ОЗВУЧЕННЯ =====================
    const UKRAINIAN_STUDIOS = [
        'DniproFilm', 'Дніпрофільм', 'Цікава Ідея', 'Колодій Трейлерів', 
        'UaFlix', 'BaibaKo', 'В одне рило', 'Так Треба Продакшн', 
        'TreleMore', 'Гуртом', 'Exit Studio', 'FilmUA', 'Novator Film', 
        'LeDoyen', 'Postmodern', 'Pryanik', 'CinemaVoice', 'UkrainianVoice'
    ];

    // ===================== СИСТЕМА СТИЛІВ ДЛЯ ПРАПОРЦЯ ТА ТОРРЕНТІВ =====================
    const FLAG_STYLES = `
        /* ===================== СТИЛІ ДЛЯ ПРАПОРЦЯ ===================== */
        /* Контейнер для прапора та тексту - забезпечує точне вирівнювання */
        .flag-container {
            display: inline-flex;                /* Гнучкий контейнер в рядку */
            align-items: center;                 /* Вертикальне центрування вмісту */
            vertical-align: middle;              /* Вирівнювання по середині рядка */
            height: 1.27em;                      /* Адаптивна висота (емівські одиниці) */
            margin-left: 3px;                    /* Відступ зліва 3px (збільшено на 1px) */
        }
        
        /* Стилі безпосередньо для SVG прапора */
        .flag-svg {
            display: inline-block;               /* Блоковий елемент в потокі тексту */
            vertical-align: middle;              /* Вертикальне центрування в рядку */
            margin-right: 2px;                   /* Зменшений відступ справа (2px) */
            margin-top: -5.5px;                  /* Точна корекція позиції по вертикалі */
            border-radius: 5px;                  /* Закруглені кути для сучасного вигляду */
            box-shadow: 0 2px 4px rgba(0,0,0,0.2); /* Легка тінь для 3D ефекту */
            border: 1px solid rgba(0,0,0,0.15);  /* Тонка рамка для кращого контрасту */
            width: 22.56px;                      /* Зменшена ширина на 10% (25px - 10% = 22.5px) */
            height: 17.14px;                     /* Зменшена висота на 10% (19px - 10% = 17.1px) */
        }
        
        /* Стилі для мобільних пристроїв (екран менше 768px) */
        @media (max-width: 767px) {
            .flag-svg {
                width: 16.03px;                  /* Зменшена ширина на 15% (18.75px - 15% = 15.94px) */
                height: 12.19px;                 /* Зменшена висота на 15% (14.25px - 15% = 12.11px) */
                margin-right: 1px;               /* Зменшений відступ справа для мобільних */
                margin-top: -4px;                /* Скоригована вертикальна позиція */
            }
        }
        
        /* Стилі для текстів поруч з прапором - забезпечують узгоджене вирівнювання */
        .flag-container ~ span,
        .flag-container + * {
            vertical-align: middle;              /* Центрування тексту відносно прапора */
        }
        
        /* Маркер для вже оброблених елементів - запобігає повторній обробці */
        .ua-flag-processed {
            position: relative;
        }

        /* ===================== СТИЛІ ДЛЯ ТОРРЕНТ-БЛОКІВ ===================== */
        /* Основний стиль для торрент-блоків - ОДНА РАМКА НАВКОЛО ВСЬОГО БЛОКУ */
        .torrent-item {
            position: relative;
            margin: 12px 0;
            padding: 16px;
            border-radius: 12px;
            background: rgba(30, 30, 35, 0.7);
            transition: all 0.3s ease;
            border: 2px solid rgba(100, 100, 110, 0.3); /* Стандартна сіра рамка */
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        /* Ефект при наведенні для кращої інтерактивності */
        .torrent-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
            border-color: rgba(120, 120, 130, 0.5); /* Легке підсвічування рамки при наведенні */
        }

        /* ===================== СТИЛІ ДЛЯ БЛОКУ "РОЗДАЮТЬ" З КОЛЬОРОВОЮ РАМКОЮ ===================== */
        /* Контейнер для інформації про роздаючих */
        .seeds-info-container {
            display: inline-block;
            margin: 4px 0;
            padding: 6px 10px;
            border-radius: 8px;
            background: rgba(40, 40, 45, 0.8);
            border: 2px solid transparent;
            transition: all 0.3s ease;
        }

        /* Кольорові рамки для блоку "роздають" за кількістю роздаючих */
        .seeds-info-container.low-seeds-border {
            border-color: #8B4513 !important; /* Темно-коричневий для мало роздаючих */
            background: linear-gradient(135deg, rgba(40, 40, 45, 0.9), rgba(139, 69, 19, 0.15));
        }

        .seeds-info-container.medium-seeds-border {
            border-color: #B8860B !important; /* Темно-золотий для середньої кількості */
            background: linear-gradient(135deg, rgba(40, 40, 45, 0.9), rgba(184, 134, 11, 0.15));
        }

        .seeds-info-container.high-seeds-border {
            border-color: #2F4F2F !important; /* Темно-оливковий для багатьох роздаючих */
            background: linear-gradient(135deg, rgba(40, 40, 45, 0.9), rgba(47, 79, 47, 0.15));
        }

        /* Стилі для інформації про торрент */
        .torrent-info {
            margin: 8px 0;
            padding: 8px 12px;
            background: rgba(40, 40, 45, 0.6);
            border-radius: 8px;
            border-left: 3px solid #555;
        }

        /* Стилі для аудіо/відео доріжок */
        .track-item {
            display: inline-block;
            margin: 4px 8px 4px 0;
            padding: 4px 8px;
            background: rgba(50, 50, 55, 0.6);
            border-radius: 6px;
            border: 1px solid rgba(100, 100, 110, 0.3);
        }

        /* ===================== ІНДИКАТОРИ ЯКОСТІ ТОРРЕНТІВ ===================== */
        /* Індикатори якості (бітрейт) */
        .torrent-item__bitrate span.low-bitrate {
            color: #B8860B !important; /* Темно-золотий */
            font-weight: bold;
        }
        .torrent-item__bitrate span.medium-bitrate {
            color: #2F4F2F !important; /* Темно-оливковий */
            font-weight: bold;
        }
        .torrent-item__bitrate span.high-bitrate {
            color: #8B4513 !important; /* Темно-коричневий */
            font-weight: bold;
        }
        
        /* Індикатори кількості роздач (Seeds) */
        .torrent-item__seeds span.low-seeds {
            color: #8B4513 !important; /* Темно-коричневий */
            font-weight: bold;
        }
        .torrent-item__seeds span.medium-seeds {
            color: #B8860B !important; /* Темно-золотий */
            font-weight: bold;
        }
        .torrent-item__seeds span.high-seeds {
            color: #2F4F2F !important; /* Темно-оливковий */
            font-weight: bold;
        }
        
        /* Індикатори трекерів */
        .torrent-item__tracker.utopia {
            color: #7B68EE !important; /* Приглушений фіолетовий */
            font-weight: bold;
        }
        .torrent-item__tracker.toloka {
            color: #5F9EA0 !important; /* Приглушений блакитний */
            font-weight: bold;
        }
        .torrent-item__tracker.mazepa {
            color: #BA55D3 !important; /* Приглушений лавандовий */
            font-weight: bold;
        }

        /* Стилі для мобільних пристроїв */
        @media (max-width: 767px) {
            .torrent-item {
                margin: 8px 0;
                padding: 12px;
                border-radius: 10px;
                border-width: 1.5px;
            }
            
            .seeds-info-container {
                padding: 4px 8px;
                margin: 3px 0;
                border-radius: 6px;
                border-width: 1.5px;
            }
            
            .torrent-info {
                padding: 6px 10px;
                margin: 6px 0;
            }
            
            .track-item {
                margin: 3px 6px 3px 0;
                padding: 3px 6px;
                font-size: 0.9em;
            }
        }

        /* Спеціальні стилі для фільтрів та випадаючих списків */
        .filter-item .flag-svg,
        .selector-item .flag-svg,
        .dropdown-item .flag-svg,
        .voice-option .flag-svg,
        .audio-option .flag-svg {
            margin-right: 1px;                   /* Зменшений відступ справа для фільтрів */
            margin-top: -2px;                    /* Вертикальна корекція для фільтрів */
            width: 18.05px;                      /* Зменшена ширина на 10% (20px - 10% = 18px) */
            height: 13.54px;                     /* Зменшена висота на 10% (15px - 10% = 13.5px) */
        }

        /* Стилі для мобільних пристроїв у фільтрах */
        @media (max-width: 767px) {
            .filter-item .flag-svg,
            .selector-item .flag-svg,
            .dropdown-item .flag-svg,
            .voice-option .flag-svg,
            .audio-option .flag-svg {
                width: 11.97px;                  /* Зменшена ширина на 15% (14px - 15% = 11.9px) */
                height: 8.98px;                  /* Зменшена висота на 15% (10.5px - 15% = 8.93px) */
                margin-right: 0px;               /* Мінімальний відступ справа для мобільних фільтрів */
                margin-top: -1px;                /* Скоригована вертикальна позиція */
            }
        }

        /* Стилі для описів відео - покращує читабельність */
        .online-prestige__description,
        .video-description,
        [class*="description"],
        [class*="info"] {
            line-height: 1.5;                    /* Збільшений міжрядковий інтервал */
        }
    `;

    // ===================== ІНІЦІАЛІЗАЦІЯ СТИЛІВ =====================
    // Створення динамічного стилевого елемента
    let style = document.createElement('style'); 
    style.innerHTML = FLAG_STYLES;
    document.head.appendChild(style); // Вставка стилів в голову документа

    // ===================== СИСТЕМА ЗАМІНИ ТЕКСТУ ДЛЯ ФІЛЬТРІВ ОЗВУЧЕННЯ =====================
    function processVoiceFilters() {
        // Селектори для всіх типів фільтрів озвучення
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

        // Обробка кожного типу фільтра
        voiceFilterSelectors.forEach(selector => {
            try {
                const filters = document.querySelectorAll(selector);
                filters.forEach(filter => {
                    // Пропускаємо вже оброблені фільтри
                    if (filter.classList.contains('ua-voice-processed')) return;
                    
                    let html = filter.innerHTML;
                    let changed = false;
                    
                    // Додаємо прапори для українських студій озвучення
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
                    
                    // Якщо були зміни - оновлюємо вміст
                    if (changed) {
                        filter.innerHTML = html;
                        filter.classList.add('ua-voice-processed');
                        
                        // Обробка SVG прапорців для правильного вирівнювання
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
                        // Пропускаємо приховані елементи
                        if (element.closest('.hidden, [style*="display: none"]')) return;
                        
                        let html = element.innerHTML;
                        let changed = false;
                        
                        // Застосовуємо всі текстові заміни
                        REPLACEMENTS.forEach(item => {
                            if (Array.isArray(item)) {
                                // Обробка звичайних рядків (чутливі до регістру)
                                if (html.includes(item[0]) && !html.includes(UKRAINE_FLAG_SVG)) {
                                    html = html.replace(new RegExp(item[0], 'g'), item[1]);
                                    changed = true;
                                }
                            } else if (item.pattern) {
                                // Обробка регулярних виразів з умовами
                                if ((!item.condition || item.condition(html)) && item.pattern.test(html) && !html.includes(UKRAINE_FLAG_SVG)) {
                                    html = html.replace(item.pattern, item.replacement);
                                    changed = true;
                                }
                            }
                        });
                        
                        // Якщо були зміни - оновлюємо вміст
                        if (changed) {
                            element.innerHTML = html;
                            element.classList.add('ua-flag-processed');
                            
                            // Обробка SVG прапорців для вирівнювання
                            element.querySelectorAll('svg').forEach(svg => {
                                // Перевіряємо чи вже не знаходиться в контейнері
                                if (!svg.closest('.flag-container')) {
                                    svg.classList.add('flag-svg'); // Додавання CSS класу
                                    // Створення контейнера для вирівнювання
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
                } catch (error) {
                    console.warn('Помилка обробки селектора:', selector, error);
                }
            });
        };

        // Виконуємо обробку з обмеженням часу
        const startTime = Date.now();
        const TIME_LIMIT = 50; // 50ms максимальний час обробки
        
        processSafeElements();
        
        // Перевіряємо час та обробляємо фільтри тільки якщо є час
        if (Date.now() - startTime < TIME_LIMIT) {
            processVoiceFilters();
        }
    }

    // ===================== СИСТЕМА ОНОВЛЕННЯ СТИЛІВ ТОРРЕНТІВ =====================
    function updateTorrentStyles() {
        // Знаходимо всі можливі торрент-елементи
        const torrentItems = document.querySelectorAll('.torrent-item, [class*="torrent"], .download-item, [class*="download"]');
        
        torrentItems.forEach(item => {
            // Додаємо базовий клас якщо ще немає
            if (!item.classList.contains('torrent-item')) {
                item.classList.add('torrent-item');
            }
            
            // Знаходимо кількість роздаючих
            let seeds = 0;
            const seedsElement = item.querySelector('.torrent-item__seeds span, [class*="seeds"] span, .seeds span');
            
            if (seedsElement) {
                seeds = parseInt(seedsElement.textContent) || 0;
            } else {
                // Спробуємо знайти текст "Роздають: X" в середині елемента
                const seedsText = item.textContent.match(/Роздають:\s*(\d+)/);
                if (seedsText) {
                    seeds = parseInt(seedsText[1]) || 0;
                }
            }
            
            // Створюємо або оновлюємо контейнер для інформації про роздаючих
            updateSeedsInfoContainer(item, seeds);
            
            // Оновлюємо стилі для тексту (seeds, bitrate, tracker)
            updateTextStyles(item);
        });
    }

    // ===================== ФУНКЦІЯ ОНОВЛЕННЯ КОНТЕЙНЕРА "РОЗДАЮТЬ" =====================
    function updateSeedsInfoContainer(container, seeds) {
        // Знаходимо або створюємо контейнер для інформації про роздаючих
        let seedsContainer = container.querySelector('.seeds-info-container');
        const seedsElement = container.querySelector('.torrent-item__seeds, [class*="seeds"]');
        
        if (seedsElement && !seedsContainer) {
            // Створюємо новий контейнер
            seedsContainer = document.createElement('div');
            seedsContainer.className = 'seeds-info-container';
            
            // Переміщуємо елемент з роздаючими в новий контейнер
            seedsElement.parentNode.insertBefore(seedsContainer, seedsElement);
            seedsContainer.appendChild(seedsElement);
        }
        
        if (seedsContainer) {
            // Видаляємо старі класи рамок
            seedsContainer.classList.remove('low-seeds-border', 'medium-seeds-border', 'high-seeds-border');
            
            // Додаємо новий клас рамки за кількістю роздаючих
            if (seeds <= 4) {
                seedsContainer.classList.add('low-seeds-border');        // Мало роздаючих (0-4)
            } else if (seeds <= 14) {
                seedsContainer.classList.add('medium-seeds-border');     // Середня кількість (5-14)
            } else {
                seedsContainer.classList.add('high-seeds-border');       // Багато роздаючих (15+)
            }
        }
    }

    // ===================== ФУНКЦІЯ ОНОВЛЕННЯ ТЕКСТОВИХ СТИЛІВ =====================
    function updateTextStyles(container) {
        // Оновлюємо стилі для seeds (кількість роздаючих)
        const seedsSpans = container.querySelectorAll('.torrent-item__seeds span, [class*="seeds"] span');
        seedsSpans.forEach(span => {
            const seeds = parseInt(span.textContent) || 0;
            span.classList.remove('low-seeds', 'medium-seeds', 'high-seeds');
            
            if (seeds <= 4) {
                span.classList.add('low-seeds');
            } else if (seeds <= 14) {
                span.classList.add('medium-seeds');
            } else {
                span.classList.add('high-seeds');
            }
        });

        // Оновлюємо стилі для bitrate (якість відео)
        const bitrateSpans = container.querySelectorAll('.torrent-item__bitrate span, [class*="bitrate"] span');
        bitrateSpans.forEach(span => {
            const bitrate = parseFloat(span.textContent) || 0;
            span.classList.remove('low-bitrate', 'medium-bitrate', 'high-bitrate');
            
            if (bitrate <= 10) {
                span.classList.add('low-bitrate');
            } else if (bitrate <= 40) {
                span.classList.add('medium-bitrate');
            } else {
                span.classList.add('high-bitrate');
            }
        });

        // Оновлюємо стилі для tracker (джерела торрентів)
        const trackers = container.querySelectorAll('.torrent-item__tracker, [class*="tracker"]');
        trackers.forEach(tracker => {
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
            replaceTexts();        // Виконання текстових замін
            updateTorrentStyles(); // Оновлення візуальних стилів торрентів
        } catch (error) {
            console.warn('Помилка оновлення плагіну:', error);
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

        // Якщо є важливі зміни - запускаємо оновлення з затримкою
        if (hasImportantChanges) {
            clearTimeout(updateTimeout);
            updateTimeout = setTimeout(updateAll, 150); // Відкладене оновлення (150ms)
        }
    });

    // Запуск спостерігача за змінами в DOM
    observer.observe(document.body, { 
        childList: true,    // Спостереження за зміною дочірніх елементів
        subtree: true,      // Спостереження за всіма вкладеними елементами
        attributes: false,  // Вимкнути спостереження за атрибутами
        characterData: false // Вимкнути спостереження за текстом
    });
    
    // Первинна ініціалізація при завантаженні сторінки
    setTimeout(updateAll, 1000);
})();

// ===================== ІНІЦІАЛІЗАЦІЯ TV РЕЖИМУ LAMPA =====================
Lampa.Platform.tv();

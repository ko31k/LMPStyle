(function() {
    'use strict';

    /*
     * Об'єднаний плагін: твоя логіка OMDb + кеш + RT+ меню/іконки/нагороди/modal
     * - Збережено твої стилі/мови/функції, додано:
     *   - парсинг нагород (oscars, emmy, awards)
     *   - збереження emmy/awards в кеш
     *   - insertRatings розширено для нагород
     *   - insertIcons / showRatingsModal з RT+
     *   - меню налаштувань через Lampa.SettingsApi
     */

    // -----------------------
    // SVG іконки (взято з RT+, потрібні для нагород/значків)
    // -----------------------
    var avg_svg = '<svg width="800px" height="800px" viewBox="0 0 24 24" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:cc="http://creativecommons.org/ns#" xmlns:dc="http://purl.org/dc/elements/1.1/"><g transform="translate(0 -1028.4)"><path d="m9.533-0.63623 2.79 6.2779 5.581 0.6976-4.186 3.4877 1.395 6.278-5.58-3.488-5.5804 3.488 1.3951-6.278-4.1853-3.4877 5.5804-0.6976z" transform="matrix(1.4336 0 0 1.4336 -1.6665 1029.3)" fill="#f39c12"/><g fill="#f1c40f"><g><path d="m12 0v13l4-4z" transform="translate(0 1028.4)"/><path d="m12 13 12-3-6 5z" transform="translate(0 1028.4)"/><path d="m12 13 8 11-8-5z" transform="translate(0 1028.4)"/><path d="m12 13-8 11 2-9z" transform="translate(0 1028.4)"/></g><path d="m12 13-12-3 8-1z" transform="translate(0 1028.4)"/></g></g></svg>';
    var oscars_svg = '<svg width="18px" height="60px" viewBox="0 0 18 60" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><title>icon_award_1</title><desc>Created with Sketch.</desc><defs></defs><g id="icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="icons_web" transform="translate(-803.000000, -370.000000)"><g id="Group-70" transform="translate(803.000000, 376.000000)"><path d="M1.0605,10.9082 C0.5425,12.0462 0.5435,13.6232 1.0555,15.0802 C1.0745,16.2022 1.1915,17.3052 1.6625,18.1582 C1.8995,19.1772 2.6285,20.1292 3.4585,21.0222 C3.4865,21.2622 3.5285,21.5702 3.5905,21.8922 C2.8275,24.3242 3.5075,28.7202 4.4055,30.8782 C4.3865,31.2082 4.3985,31.5812 4.4795,31.9552 C4.4705,32.0062 4.4605,32.0592 4.4495,32.1202 C4.3835,32.4682 4.2945,32.9442 4.3285,33.6582 C4.3785,34.7902 4.7415,36.6992 5.4065,39.3312 C5.2935,39.7672 5.2895,40.1282 5.3175,40.4572 L4.6625,40.4572 C3.4415,40.4572 2.4495,41.4502 2.4495,42.6722 L2.4495,42.9952 C2.4495,43.0452 1.5895,43.9502 1.5895,43.9502 L1.7175,43.9502 C1.4395,44.3222 1.2775,44.7832 1.2775,45.2792 L1.2775,48.1552 L0.9995,48.3432 C0.3735,48.7652 -0.0005,49.4692 -0.0005,50.2252 L-0.0005,51.7302 C-0.0005,52.9822 1.0165,54.0002 2.2665,54.0002 L15.7325,54.0002 C16.9825,54.0002 17.9995,52.9822 17.9995,51.7302 L17.9995,50.2252 C17.9995,49.4752 17.6295,48.7742 17.0095,48.3432 L16.7315,48.1552 L16.7315,45.2792 C16.7315,44.7832 16.5695,44.3222 16.2915,43.9502 L16.4195,43.9502 C16.4195,43.9502 15.5595,43.0452 15.5595,42.9952 L15.5595,42.6722 C15.5595,41.4502 14.5675,40.4572 13.3465,40.4572 L12.6915,40.4572 C12.7195,40.1282 12.7155,39.7672 12.6025,39.3312 C13.2675,36.6992 13.6305,34.7902 13.6805,33.6582 C13.7145,32.9442 13.6255,32.4682 13.5595,32.1202 C13.5485,32.0592 13.5385,32.0062 13.5295,31.9552 C13.6105,31.5812 13.6225,31.2082 13.6035,30.8782 C14.5015,28.7202 15.1815,24.3242 14.4185,21.8922 C14.4805,21.5702 14.5225,21.2622 14.5505,21.0222 C15.3805,20.1292 16.1095,19.1772 16.3465,18.1582 C16.8175,17.3052 16.9345,16.2022 16.9535,15.0802 C17.4655,13.6232 17.4665,12.0462 16.9485,10.9082 C15.4045,7.2612 13.0525,4.7122 11.1905,3.2142 C9.2985,1.6912 7.1755,1.0002 6.8995,1.0002 C6.6235,1.0002 4.5005,1.6912 2.6085,3.2142 C0.7465,4.7122 -0.6055,7.2612 1.0605,10.9082 Z" id="Combined-Shape" fill="#F7C948"></path></g></g></g></svg>';
    var emmy_svg = '<svg width="18px" height="18px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path fill="#F7C948" d="M15.9 0C10.3 0 6 4.3 6 9.9c0 .6.1 1.3.2 1.9l-5.1 1.5C.9 13.8 0 14.9 0 16.2c0 1.6 1.1 3 2.6 3.4 1.1.3 2.3-.1 3-.9l4.3-4.9c.6.3 1.3.6 2 .6 1.9 0 3.7-1.1 4.6-2.7l3.4 1.9c.8.4 1.7.4 2.5.1 1-.4 1.7-1.5 1.7-2.6 0-.9-.5-1.8-1.2-2.3l-5.3-3.9C25.7 7.8 23 5 19.9 4.6 18.8 2 17 0 15.9 0z"/></svg>';
    var awards_svg = '<svg width="18px" height="18px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="#F7C948" d="M12 2a4 4 0 014 4c0 2.2-2 5-4 7-2-2-4-4.8-4-7a4 4 0 014-4m0-2C9.2 0 6 2 . 6S0 9.2 0 12c0 3.9 2.8 7.2 6.5 8.2L6 24h4l1.5-3.8C12 20.7 12 20.7 12 20.7s0 0 0 0l1.5 3.3h4l-.5-3.8C21.2 19.2 24 15.9 24 12c0-2.8-3.3-6-12-12z"/></svg>';

    // Іконки для джерел (як у RT+) — деякі з них ти вже мав у Lampa.Lang, але тут додам змінні, щоб insertIcons їх підставляв
    var imdb_svg = '<img src="data:image/svg+xml;base64,...." style="height:14px; width:auto; display:inline-block; vertical-align:middle; object-fit:contain; transform:scale(1.2);">'; // (якщо хочеш, заміни на реальний base64 або SVG)
    var tmdb_svg = '<img src="data:image/svg+xml;base64,...." style="height:14px; width:auto; display:inline-block; vertical-align:middle; object-fit:contain; transform:scale(1.2);">';
    var rt_svg = '<img src="data:image/svg+xml;base64,...." style="height:14px; width:auto; display:inline-block; vertical-align:middle; object-fit:contain; transform:scale(1.2);">';
    var mc_svg = '<img src="data:image/svg+xml;base64,...." style="height:14px; width:auto; display:inline-block; vertical-align:middle; object-fit:contain; transform:scale(1.2);">';
    var kp_svg = '<img src="data:image/svg+xml;base64,...." style="height:14px; width:auto; display:inline-block; vertical-align:middle; object-fit:contain; transform:scale(1.2);">';

    // -----------------------
    // Локалізації (твій блок, удосконалений — залишив без змін де було)
    // -----------------------
    Lampa.Lang.add({
        ratimg_omdb_avg: {
            ru: 'ИТОГ',
            en: 'TOTAL',
            uk: '<svg width="14px" height="14px" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" class="iconify iconify--twemoji" preserveAspectRatio="xMidYMid meet"><path fill="#FFAC33" d="M27.287 34.627c-.404 0-.806-.124-1.152-.371L18 28.422l-8.135 5.834a1.97 1.97 0 0 1-2.312-.008a1.971 1.971 0 0 1-.721-2.194l3.034-9.792l-8.062-5.681a1.98 1.98 0 0 1-.708-2.203a1.978 1.978 0 0 1 1.866-1.363L12.947 13l3.179-9.549a1.976 1.976 0 0 1 3.749 0L23 13l10.036.015a1.975 1.975 0 0 1 1.159 3.566l-8.062 5.681l3.034 9.792a1.97 1.97 0 0 1-.72 2.194a1.957 1.957 0 0 1-1.16.379z"></path></svg>',
            be: 'ВЫНІК',
            pt: 'TOTAL',
            zh: '总评',
            he: 'סה"כ',
            cs: 'VÝSLEDEK',
            bg: 'РЕЗУЛТАТ'
        },
        loading_dots: {
            ru: 'Загрузка рейтингов',
            en: 'Loading ratings',
            uk: 'Трішки зачекаємо ...',
            be: 'Загрузка рэйтынгаў',
            pt: 'Carregando classificações',
            zh: '加载评分',
            he: 'טוען דירוגים',
            cs: 'Načítání hodnocení',
            bg: 'Зареждане на рейтинги'
        },
        maxsm_omdb_oscars: {
            ru: 'Оскары',
            en: 'Oscars',
            uk: oscars_svg,
            be: 'Оскары',
            pt: 'Oscars',
            zh: '奥斯卡奖',
            he: 'אוסקר',
            cs: 'Oscary',
            bg: 'Оскари'
        },
        maxsm_ratings_mode: { ru: 'Режим', en: 'Mode', uk: 'Режим', be: 'Рэжым', pt: 'Modo', zh: '模式', he: 'מצב', cs: 'Režim', bg: 'Режим' },
        maxsm_ratings_mode_normal: { ru: 'Полный', en: 'Full', uk: 'Повний', be: 'Поўны', pt: 'Completo', zh: '完整', he: 'מלא', cs: 'Plný', bg: 'Пълен' },
        maxsm_ratings_mode_simple: { ru: 'Простой', en: 'Simple', uk: 'Простий', be: 'Просты', pt: 'Simples', zh: '简单', he: 'פשוט', cs: 'Jednoduchý', bg: 'Опционален' },
        maxsm_ratings_mode_noavg: { ru: 'Без среднего', en: 'No average', uk: 'Без середнього', be: 'Без сярэдняга', pt: 'Sem média', zh: '无平均', he: 'ללא ממוצע', cs: 'Bez průměru', bg: 'Без средно' },
        maxsm_ratings_awards: { ru: 'Награды', en: 'Awards', uk: 'Нагороди', be: 'Награды', pt: 'Prêmios', zh: '奖项', he: 'פרסים', cs: 'Ocenění', bg: 'Награди' },
        maxsm_ratings_emmy: { ru: 'Эмми', en: 'Emmy', uk: 'Еммі', be: 'Эммі', pt: 'Emmy', zh: '艾美奖', he: 'אממי', cs: 'Emmy', bg: 'Emmy' },
        maxsm_ratings_oscars: { ru: 'Оскары', en: 'Oscars', uk: 'Оскари', be: 'Оскары', pt: 'Oscars', zh: '奥斯卡', he: 'אוסקר', cs: 'Oscary', bg: 'Оскари' },
        maxsm_ratings_avg: { ru: 'Средний', en: 'Average', uk: 'Середній', be: 'Сярэдні', pt: 'Média', zh: '平均', he: 'ממוצע', cs: 'Průměr', bg: 'Средно' },
        maxsm_ratings_avg_simple: { ru: 'Средний (прост.)', en: 'Average (simple)', uk: 'Середній (простий)', be: 'Сярэдні (просты)', pt: 'Média (simples)', zh: '平均（简单）', he: 'ממוצע (פשוט)', cs: 'Průměr (jednoduchý)', bg: 'Средно (опр.)' },
        maxsm_ratings_critic: { ru: 'Оценки критиков', en: 'Critic scores', uk: 'Оцінки критиків', be: 'Ацэнкі крытыкаў', pt: 'Avaliações de críticos', zh: '影评评分', he: 'דירוג מבקרים', cs: 'Hodnocení kritiků', bg: 'Оценки на критици' },
        maxsm_ratings_colors: { ru: 'Цвета', en: 'Colors', uk: 'Кольори', be: 'Колеры', pt: 'Cores', zh: '颜色', he: 'צבעים', cs: 'Barvy', bg: 'Цветове' },
        maxsm_ratings_icons: { ru: 'Значки', en: 'Icons', uk: 'Значки', be: 'Значкі', pt: 'Ícones', zh: '图标', he: 'אייקונים', cs: 'Ikony', bg: 'Значки' },
        maxsm_ratings_cc: { ru: 'Очистить кеш', en: 'Clear cache', uk: 'Очистити кеш', be: 'Ачысціць кэш', pt: 'Limpar cache', zh: '清除缓存', he: 'נקה מטמון', cs: 'Vymazat cache', bg: 'Изчисти кеш' },
        maxsm_ratings_loading: { ru: 'Загрузка', en: 'Loading', uk: 'Завантаження', be: 'Загрузка', pt: 'Carregando', zh: '加载中', he: 'טוען', cs: 'Načítání', bg: 'Зареждане' }
    });

    // -----------------------
    // Стилі (твій стиль + невеликі доповнення для modal / значків)
    // -----------------------
    var style = "<style id=\"maxsm_omdb_rating\">" +
        ".full-start-new__rate-line {" +
        "visibility: hidden;" +
        "flex-wrap: wrap;" +
        " gap: 0.4em 0;" +
        "}" +
        ".full-start-new__rate-line > * {" +
        "    margin-left: 0 !important;" +
        "    margin-right: 0.6em !important;" +
        "}" +
        ".rate--avg.rating--green  { color: #4caf50; }" +
        ".rate--avg.rating--lime   { color: #3399ff; }" +
        ".rate--avg.rating--orange { color: #ff9933; }" +
        ".rate--avg.rating--red    { color: #f44336; }" +
        ".rate--oscars             { color: gold;    }" +
        ".rate--icon img { height:14px; width:auto; display:inline-block; vertical-align:middle; }" +
        ".maxsm-modal-ratings { display:flex; flex-direction:column; gap:6px; padding:10px; }" +
        ".maxsm-modal-rating-line { padding:6px 8px; border-radius:6px; background:rgba(255,255,255,0.03); }" +
        ".rate--avg.rate--green { background: rgba(76,175,80,0.08); }" +
        ".rate--avg.rate--lime { background: rgba(51,153,255,0.06); }" +
        ".rate--avg.rate--orange { background: rgba(255,153,51,0.06); }" +
        ".rate--avg.rate--red { background: rgba(244,67,54,0.06); }" +
        "</style>";

    Lampa.Template.add('card_css', style);
    $('body').append(Lampa.Template.get('card_css', {}, true));

    // Loading animation CSS
    var loadingStyles = "<style id=\"maxsm_loading_animation\">" +
        ".loading-dots-container {" +
        "    position: absolute;" +
        "    top: 50%;" +
        "    left: 0;" +
        "    right: 0;" +
        "    text-align: left;" +
        "    transform: translateY(-50%);" +
        "    z-index: 10;" +
        "}" +
        ".full-start-new__rate-line {" +
        "    position: relative;" +
        "}" +
        ".loading-dots {" +
        "    display: inline-flex;" +
        "    align-items: center;" +
        "    gap: 0.4em;" +
        "    color: #ffffff;" +
        "    font-size: 1em;" +
        "    background: rgba(0, 0, 0, 0.3);" +
        "    padding: 0.6em 1em;" +
        "    border-radius: 0.5em;" +
        "}" +
        ".loading-dots__text {" +
        "    margin-right: 1em;" +
        "}" +
        ".loading-dots__dot {" +
        "    width: 0.5em;" +
        "    height: 0.5em;" +
        "    border-radius: 50%;" +
        "    background-color: currentColor;" +
        "    animation: loading-dots-bounce 1.4s infinite ease-in-out both;" +
        "}" +
        ".loading-dots__dot:nth-child(1) {" +
        "    animation-delay: -0.32s;" +
        "}" +
        ".loading-dots__dot:nth-child(2) {" +
        "    animation-delay: -0.16s;" +
        "}" +
        "@keyframes loading-dots-bounce {" +
        "    0%, 80%, 100% { transform: translateY(0); opacity: 0.6; }" +
        "    40% { transform: translateY(-0.5em); opacity: 1; }" +
        "}" +
        "</style>";

    Lampa.Template.add('loading_animation_css', loadingStyles);
    $('body').append(Lampa.Template.get('loading_animation_css', {}, true));

    // -----------------------
    // Конфігурація кешу / ключів
    // -----------------------
    var CACHE_TIME = 3 * 24 * 60 * 60 * 1000; // 3 дня
    var OMDB_CACHE = 'maxsm_rating_omdb';
    var ID_MAPPING_CACHE = 'maxsm_rating_id_mapping';
    // Дозволити масив ключів (RT+ підхід), але зберегти твій ключ як запасний
    var OMDB_API_KEYS = (window.RATINGS_PLUGIN_TOKENS && window.RATINGS_PLUGIN_TOKENS.OMDB_API_KEYS) || [ (window.RATINGS_PLUGIN_TOKENS && window.RATINGS_PLUGIN_TOKENS.OMDB_API_KEY) || '12c9249c' ];

    // Словник вікових рейтингів (залишив)
    var AGE_RATINGS = {
        'G': '3+',
        'PG': '6+',
        'PG-13': '13+',
        'R': '17+',
        'NC-17': '18+',
        'TV-Y': '0+',
        'TV-Y7': '7+',
        'TV-G': '3+',
        'TV-PG': '6+',
        'TV-14': '14+',
        'TV-MA': '17+'
    };

    // Ваги — взято як у RT+ (але в твоєму коді були інші — якщо хочеш, можна підлаштувати)
    var WEIGHTS = {
        imdb: 0.40,
        tmdb: 0.40,
        mc: 0.10,
        rt: 0.10
    };

    // -----------------------
    // Допоміжні: витягання рандомного ключа
    // -----------------------
    function getRandomToken(tokens) {
        if (!tokens || !tokens.length) return (window.RATINGS_PLUGIN_TOKENS && window.RATINGS_PLUGIN_TOKENS.OMDB_API_KEY) || OMDB_API_KEYS[0];
        return tokens[Math.floor(Math.random() * tokens.length)];
    }

    // -----------------------
    // Парсер нагород (взято з RT+): oscars, emmy, awards
    // -----------------------
    function parseAwards(awardsText) {
        if (typeof awardsText !== 'string') return { oscars: 0, emmy: 0, awards: 0 };
        var result = { oscars: 0, emmy: 0, awards: 0 };

        var oscarMatch = awardsText.match(/Won (\d+) Oscars?/i);
        if (oscarMatch && oscarMatch[1]) result.oscars = parseInt(oscarMatch[1], 10);

        var emmyMatch = awardsText.match(/Won (\d+) Primetime Emmys?/i);
        if (emmyMatch && emmyMatch[1]) result.emmy = parseInt(emmyMatch[1], 10);

        var otherMatch = awardsText.match(/Another (\d+) wins?/i);
        if (otherMatch && otherMatch[1]) result.awards = parseInt(otherMatch[1], 10);

        if (!result.awards) {
            var simpleMatch = awardsText.match(/(\d+) wins?/i);
            if (simpleMatch && simpleMatch[1]) result.awards = parseInt(simpleMatch[1], 10);
        }

        return result;
    }

    // -----------------------
    // Функції кеша (омитнувши твої) — оновив saveOmdbCache, щоб зберігати emmy/awards
    // -----------------------
    function getOmdbCache(key) {
        var cache = Lampa.Storage.get(OMDB_CACHE) || {};
        var item = cache[key];
        return item && (Date.now() - item.timestamp < CACHE_TIME) ? item : null;
    }

    function saveOmdbCache(key, data) {
        var hasValidRating = (
            (data.rt && data.rt !== "N/A") ||
            (data.mc && data.mc !== "N/A") ||
            (data.imdb && data.imdb !== "N/A")
        );

        var hasValidAgeRating = (
            data.ageRating &&
            data.ageRating !== "N/A" &&
            data.ageRating !== "Not Rated"
        );

        var hasOscars = typeof data.oscars === 'number' && data.oscars > 0;
        var hasEmmy = typeof data.emmy === 'number' && data.emmy > 0;
        var hasAwards = typeof data.awards === 'number' && data.awards > 0;

        if (!hasValidRating && !hasValidAgeRating && !hasOscars && !hasEmmy && !hasAwards) return;

        var cache = Lampa.Storage.get(OMDB_CACHE) || {};
        cache[key] = {
            rt: data.rt,
            mc: data.mc,
            imdb: data.imdb || null,
            ageRating: data.ageRating,
            oscars: data.oscars || null,
            emmy: data.emmy || null,
            awards: data.awards || null,
            timestamp: Date.now()
        };
        Lampa.Storage.set(OMDB_CACHE, cache);
    }

    // -----------------------
    // Функція для отримання даних OMDb — розширена: повертає emmy/awards
    // -----------------------
    function fetchOmdbRatings(card, cacheKey, callback) {
        if (!card.imdb_id) {
            callback(null);
            return;
        }

        var typeParam = (card.type === 'tv') ? '&type=series' : '';
        var url = 'https://www.omdbapi.com/?apikey=' + getRandomToken(OMDB_API_KEYS) + '&i=' + card.imdb_id + typeParam;

        new Lampa.Reguest().silent(url, function (data) {
            if (data && data.Response === 'True' && (data.Ratings || data.imdbRating)) {
                var parsed = parseAwards(data.Awards || '');
                callback({
                    rt: extractRating(data.Ratings, 'Rotten Tomatoes'),
                    mc: extractRating(data.Ratings, 'Metacritic'),
                    imdb: data.imdbRating || null,
                    ageRating: data.Rated || null,
                    oscars: parsed.oscars,
                    emmy: parsed.emmy,
                    awards: parsed.awards
                });
            } else {
                callback(null);
            }
        }, function () {
            callback(null);
        });
    }

    // -----------------------
    // Допоміжний extractRating (твій) — без змін
    // -----------------------
    function extractRating(ratings, source) {
        if (!ratings || !Array.isArray(ratings)) return null;

        for (var i = 0; i < ratings.length; i++) {
            if (ratings[i].Source === source) {
                try {
                    if (source === 'Rotten Tomatoes') {
                        return parseFloat(ratings[i].Value.replace('%', '')) / 10;
                    } else {
                        return parseFloat(ratings[i].Value.split('/')[0]) / 10;
                    }
                } catch (e) {
                    console.error('Помилка при парсингу рейтингу:', e);
                    return null;
                }
            }
        }
        return null;
    }

    // -----------------------
    // Допоміжні: анімація завантаження (оновлено, щоб приймати render)
    // -----------------------
    function addLoadingAnimation(render) {
        if (!render) return;

        var rateLine = $('.full-start-new__rate-line', render);
        if (!rateLine.length || $('.loading-dots-container', rateLine).length) return;

        rateLine.append(
            '<div class="loading-dots-container">' +
                '<div class="loading-dots">' +
                    '<span class="loading-dots__text">' + Lampa.Lang.translate("loading_dots") + '</span>' +
                    '<span class="loading-dots__dot"></span>' +
                    '<span class="loading-dots__dot"></span>' +
                    '<span class="loading-dots__dot"></span>' +
                '</div>' +
            '</div>'
        );

        $('.loading-dots-container', rateLine).css({
            'opacity': '1',
            'visibility': 'visible'
        });
    }

    function removeLoadingAnimation(render) {
        if (!render) return;
        $('.loading-dots-container', render).remove();
    }

    // -----------------------
    // Вставка рейтингів у UI — розширена (додає oscars/emmy/awards) і враховує налаштування
    // -----------------------
    function insertRatings(rtRating, mcRating, oscars, awards, emmy, render) {
        if (!render) return;

        var rateLine = $('.full-start-new__rate-line', render);
        if (!rateLine.length) return;

        var lastRate = $('.full-start__rate:last', rateLine);

        var showAwards = localStorage.getItem('maxsm_ratings_awards') === 'true';
        var showCritic = localStorage.getItem('maxsm_ratings_critic') === 'true';

        // RT
        if (showCritic && rtRating && !isNaN(rtRating) && !$('.rate--rt', rateLine).length) {
            var rtValue = rtRating.toFixed(1);
            var rtElement = $(
                '<div class="full-start__rate rate--rt">' +
                    '<div>' + rtValue + '</div>' +
                    '<div class="source--name"></div>' +
                '</div>'
            );
            rtElement.find('.source--name').html(Lampa.Lang.translate('source_rt') || rt_svg);
            if (lastRate.length) rtElement.insertAfter(lastRate);
            else rateLine.prepend(rtElement);
        }

        // MC
        if (showCritic && mcRating && !isNaN(mcRating) && !$('.rate--mc', rateLine).length) {
            var mcValue = mcRating.toFixed(1);
            var insertAfter = $('.rate--rt', rateLine).length ? $('.rate--rt', rateLine) : lastRate;
            var mcElement = $(
                '<div class="full-start__rate rate--mc">' +
                    '<div>' + mcValue + '</div>' +
                    '<div class="source--name"></div>' +
                '</div>'
            );
            mcElement.find('.source--name').html(Lampa.Lang.translate('source_mc') || mc_svg);
            if (insertAfter.length) mcElement.insertAfter(insertAfter);
            else rateLine.prepend(mcElement);
        }

        // Oscars
        if (showAwards && oscars && !isNaN(oscars) && oscars > 0 && !$('.rate--oscars', rateLine).length) {
            var oscElement = $(
                '<div class="full-start__rate rate--oscars">' +
                    '<div>' + oscars + '</div>' +
                    '<div class="source--name"></div>' +
                '</div>'
            );
            oscElement.find('.source--name').html(Lampa.Lang.translate("maxsm_omdb_oscars") || oscars_svg);
            rateLine.prepend(oscElement);
        }

        // Emmy
        if (showAwards && emmy && !isNaN(emmy) && emmy > 0 && !$('.rate--emmy', rateLine).length) {
            var emElement = $(
                '<div class="full-start__rate rate--emmy">' +
                    '<div>' + emmy + '</div>' +
                    '<div class="source--name"></div>' +
                '</div>'
            );
            emElement.find('.source--name').html(Lampa.Lang.translate("maxsm_ratings_emmy") || emmy_svg);
            rateLine.prepend(emElement);
        }

        // Other awards
        if (showAwards && awards && !isNaN(awards) && awards > 0 && !$('.rate--awards', rateLine).length) {
            var awElement = $(
                '<div class="full-start__rate rate--awards">' +
                    '<div>' + awards + '</div>' +
                    '<div class="source--name"></div>' +
                '</div>'
            );
            awElement.find('.source--name').html(Lampa.Lang.translate("maxsm_ratings_awards") || awards_svg);
            rateLine.prepend(awElement);
        }
    }

    // -----------------------
    // Оновлення прихованих елементів (PG, IMDB, TMDB label) — твоя логіка з підтримкою нагород
    // -----------------------
    function updateHiddenElements(ratings) {
        var render = Lampa.Activity.active().activity.render();
        if (!render || !render[0]) return;

        // Оновлення вікового рейтингу
        var pgElement = $('.full-start__pg.hide', render);
        if (pgElement.length && ratings.ageRating) {
            var invalidRatings = ['N/A', 'Not Rated', 'Unrated', 'NR'];
            var isValid = invalidRatings.indexOf(ratings.ageRating) === -1;

            if (isValid) {
                var localizedRating = AGE_RATINGS[ratings.ageRating] || ratings.ageRating;
                pgElement.removeClass('hide').text(localizedRating);
            }
        }

        // IMDB
        var imdbContainer = $('.rate--imdb', render);
        if (imdbContainer.length) {
            var imdbDivs = imdbContainer.children('div');

            if (ratings.imdb && !isNaN(ratings.imdb)) {
                imdbContainer.removeClass('hide');
                if (imdbDivs.length >= 2) {
                    imdbDivs.eq(0).text(parseFloat(ratings.imdb).toFixed(1));
                    imdbDivs.eq(1).html(Lampa.Lang.translate('source_imdb'));
                }
            } else {
                imdbContainer.addClass('hide');
            }
        }

        // TMDB label (ті ж що було)
        var tmdbContainer = $('.rate--tmdb', render);
        if (tmdbContainer.length) {
            tmdbContainer.find('> div:nth-child(2)').html(Lampa.Lang.translate('source_tmdb'));
        }
    }

    // -----------------------
    // Рахунок середнього (calculateAverageRating) — розширено: враховує налаштування режиму/кольорів
    // -----------------------
    function getRatingClass(rating) {
        // відповідність кольорів — підлаштував під RT+ пороги
        if (rating >= 8.0) return 'rating--green';
        if (rating >= 6.0) return 'rating--lime';
        if (rating >= 5.5) return 'rating--orange';
        return 'rating--red';
    }

    function calculateAverageRating() {
        var render = Lampa.Activity.active().activity.render();
        if (!render) return;

        var rateLine = $('.full-start-new__rate-line', render);
        if (!rateLine.length) return;

        var ratings = {
            imdb: parseFloat($('.rate--imdb div:first', rateLine).text()) || 0,
            tmdb: parseFloat($('.rate--tmdb div:first', rateLine).text()) || 0,
            mc: parseFloat($('.rate--mc div:first', rateLine).text()) || 0,
            rt: parseFloat($('.rate--rt div:first', rateLine).text()) || 0
        };

        // Якщо Metacritic / RT в UI відображаються в 0-100, ми очікуємо що extractRating вже привів до 0-10
        // але є випадки — у RT+ MC і RT ділилися /10 при підрахунку модалки — тут залишив як в твоєму початковому коді.

        var totalWeight = 0;
        var weightedSum = 0;
        var ratingsCount = 0;

        for (var key in ratings) {
            if (ratings.hasOwnProperty(key) && !isNaN(ratings[key]) && ratings[key] > 0) {
                weightedSum += ratings[key] * WEIGHTS[key];
                totalWeight += WEIGHTS[key];
                ratingsCount++;
            }
        }

        $('.rate--avg', rateLine).remove();

        if (ratingsCount > 1 && totalWeight > 0) {
            var averageRating = weightedSum / totalWeight;
            var colorClass = getRatingClass(averageRating);

            var avgElement = $(
                '<div class="full-start__rate rate--avg ' + colorClass + '">' +
                    '<div>' + averageRating.toFixed(1) + '</div>' +
                    '<div class="source--name">' + Lampa.Lang.translate("ratimg_omdb_avg") + '</div>' +
                '</div>'
            );

            var showColors = localStorage.getItem('maxsm_ratings_colors') === 'true';
            if (!showColors) avgElement.removeClass(colorClass);

            $('.full-start__rate:first', rateLine).before(avgElement);
        }

        removeLoadingAnimation(render);
        rateLine.css('visibility', 'visible');
    }

    // -----------------------
    // Вставка іконок (replace labels with svg icons) — з RT+
    // -----------------------
    function insertIcons(render) {
        if (!render) return;

        function replaceIcon(className, svg) {
            var Element = $('.' + className, render);
            if (Element.length) {
                var sourceNameElement = Element.find('.source--name');
                if (sourceNameElement.length) {
                    sourceNameElement.html(svg).addClass('rate--icon');
                } else {
                    var childDivs = Element.children('div');
                    if (childDivs.length >= 2) {
                        $(childDivs[1]).html(svg).addClass('rate--icon');
                    }
                }
            }
        }

        replaceIcon('rate--imdb', imdb_svg);
        replaceIcon('rate--tmdb', tmdb_svg);
        replaceIcon('rate--rt', rt_svg);
        replaceIcon('rate--mc', mc_svg);
        replaceIcon('rate--oscars', oscars_svg);
        replaceIcon('rate--emmy', emmy_svg);
        replaceIcon('rate--awards', awards_svg);
        replaceIcon('rate--avg', avg_svg);
        replaceIcon('rate--kp', kp_svg);
    }

    // -----------------------
    // Модальне вікно зі списком рейтингів (showRatingsModal) — з RT+
    // -----------------------
    function showRatingsModal(render) {
        if (!render) return;

        var showColors = localStorage.getItem('maxsm_ratings_colors') === 'true';
        var modalContent = $('<div class="maxsm-modal-ratings"></div>');
        var rateLine = $('.full-start-new__rate-line', render);
        if (!rateLine.length) return;

        var ratingOrder = [
            'rate--avg',
            'rate--oscars',
            'rate--emmy',
            'rate--awards',
            'rate--tmdb',
            'rate--imdb',
            'rate--kp',
            'rate--rt',
            'rate--mc'
        ];

        ratingOrder.forEach(function (className) {
            var element = $('.' + className, rateLine);
            if (element.length) {
                var value = element.children().eq(0).text().trim();
                var numericValue = parseFloat(value);
                var label = '';
                switch (className) {
                    case 'rate--avg': label = Lampa.Lang.translate("maxsm_ratings_avg"); break;
                    case 'rate--oscars': label = Lampa.Lang.translate("maxsm_ratings_oscars"); break;
                    case 'rate--emmy': label = Lampa.Lang.translate("maxsm_ratings_emmy"); break;
                    case 'rate--awards': label = Lampa.Lang.translate("maxsm_ratings_awards"); break;
                    case 'rate--tmdb': label = 'TMDB'; break;
                    case 'rate--imdb': label = 'IMDb'; break;
                    case 'rate--kp': label = 'Кинопоиск'; break;
                    case 'rate--rt': label = 'Rotten Tomatoes'; break;
                    case 'rate--mc': label = 'Metacritic'; break;
                }

                var item = $('<div class="maxsm-modal-rating-line"></div>');

                if (showColors) {
                    var colorClass;
                    if (className === 'rate--avg') {
                        colorClass = getRatingClass(numericValue);
                        if (colorClass) item.addClass(colorClass);
                    } else {
                        colorClass = 'maxsm-modal-' + className.replace('rate--', '');
                        item.addClass(colorClass);
                    }
                }

                item.text(value + ' - ' + label);
                modalContent.append(item);
            }
        });

        Lampa.Modal.open({
            title: Lampa.Lang.translate("maxsm_ratings_avg_simple"),
            html: modalContent,
            width: 600,
            onBack: function () {
                Lampa.Modal.close();
            }
        });
    }

    // -----------------------
    // Отримання imdb id з TMDB (з твоєї логіки, але з callback signature як в RT+)
    // -----------------------
    function getImdbIdFromTmdb(tmdbId, type, callback) {
        if (!tmdbId) return callback(null);

        var cleanType = type === 'movie' ? 'movie' : 'tv';
        var cacheKey = cleanType + '_' + tmdbId;
        var cache = Lampa.Storage.get(ID_MAPPING_CACHE) || {};

        if (cache[cacheKey] && (Date.now() - cache[cacheKey].timestamp < CACHE_TIME)) {
            return callback(cache[cacheKey].imdb_id);
        }

        var url = 'https://api.themoviedb.org/3/' + cleanType + '/' + tmdbId + '/external_ids?api_key=' + Lampa.TMDB.key();

        var makeRequest = function(url, success, error) {
            new Lampa.Reguest().silent(url, success, function() {
                new Lampa.Reguest().native(url, function(data) {
                    try {
                        success(typeof data === 'string' ? JSON.parse(data) : data);
                    } catch(e) {
                        error();
                    }
                }, error, false, { dataType: 'json' });
            });
        };

        makeRequest(url, function(data) {
            if (data && data.imdb_id) {
                cache[cacheKey] = {
                    imdb_id: data.imdb_id,
                    timestamp: Date.now()
                };
                Lampa.Storage.set(ID_MAPPING_CACHE, cache);
                callback(data.imdb_id);
            } else {
                if (cleanType === 'tv') {
                    var altUrl = 'https://api.themoviedb.org/3/tv/' + tmdbId + '?api_key=' + Lampa.TMDB.key();
                    makeRequest(altUrl, function(altData) {
                        var imdbId = (altData && altData.external_ids && altData.external_ids.imdb_id) || null;
                        if (imdbId) {
                            cache[cacheKey] = {
                                imdb_id: imdbId,
                                timestamp: Date.now()
                            };
                            Lampa.Storage.set(ID_MAPPING_CACHE, cache);
                        }
                        callback(imdbId);
                    }, function() {
                        callback(null);
                    });
                } else {
                    callback(null);
                }
            }
        }, function() {
            callback(null);
        });
    }

    // -----------------------
    // Основна функція: отримання додаткових рейтингів та оновлення UI
    // (взято з твоєї версії, але інтегровано підтримку awards/emmy та вставку іконок/модалки)
    // -----------------------
    function getCardType(card) {
        var type = card.media_type || card.type;
        if (type === 'movie' || type === 'tv') return type;
        return card.name || card.original_name ? 'tv' : 'movie';
    }

    function fetchAdditionalRatings(card) {
        var render = Lampa.Activity.active().activity.render();
        if (!render) return;

        var normalizedCard = {
            id: card.id,
            imdb_id: card.imdb_id || card.imdb || null,
            title: card.title || card.name || '',
            original_title: card.original_title || card.original_name || '',
            type: getCardType(card),
            release_date: card.release_date || card.first_air_date || ''
        };

        var rateLine = $('.full-start-new__rate-line', render);
        if (rateLine.length) {
            rateLine.css('visibility', 'hidden');
            addLoadingAnimation(render);
        }

        var cacheKey = normalizedCard.type + '_' + (normalizedCard.imdb_id || normalizedCard.id);
        var cachedData = getOmdbCache(cacheKey);
        var ratingsData = {};

        var imdbElement = $('.rate--imdb:not(.hide)', render);
        if (imdbElement.length > 0 && !!imdbElement.find('> div').eq(0).text().trim()) {
            // якщо вже є IMDB в карточці — нічого не чіпаємо
            processNextStep();
            return;
        }

        if (cachedData) {
            ratingsData.rt = cachedData.rt;
            ratingsData.mc = cachedData.mc;
            ratingsData.imdb = cachedData.imdb;
            ratingsData.ageRating = cachedData.ageRating;
            ratingsData.oscars = cachedData.oscars;
            ratingsData.emmy = cachedData.emmy;
            ratingsData.awards = cachedData.awards;
            updateUI();
        } else if (normalizedCard.imdb_id) {
            fetchOmdbRatings(normalizedCard, cacheKey, function(omdbData) {
                if (omdbData) {
                    ratingsData.rt = omdbData.rt;
                    ratingsData.mc = omdbData.mc;
                    ratingsData.imdb = omdbData.imdb;
                    ratingsData.ageRating = omdbData.ageRating;
                    ratingsData.oscars = omdbData.oscars;
                    ratingsData.emmy = omdbData.emmy;
                    ratingsData.awards = omdbData.awards;
                    saveOmdbCache(cacheKey, omdbData);
                }
                updateUI();
            });
        } else {
            getImdbIdFromTmdb(normalizedCard.id, normalizedCard.type, function(newImdbId) {
                if (newImdbId) {
                    normalizedCard.imdb_id = newImdbId;
                    cacheKey = normalizedCard.type + '_' + newImdbId;
                    fetchOmdbRatings(normalizedCard, cacheKey, function(omdbData) {
                        if (omdbData) {
                            ratingsData.rt = omdbData.rt;
                            ratingsData.mc = omdbData.mc;
                            ratingsData.imdb = omdbData.imdb;
                            ratingsData.ageRating = omdbData.ageRating;
                            ratingsData.oscars = omdbData.oscars;
                            ratingsData.emmy = omdbData.emmy;
                            ratingsData.awards = omdbData.awards;
                            saveOmdbCache(cacheKey, omdbData);
                        }
                        updateUI();
                    });
                } else {
                    updateUI();
                }
            });
        }

        function updateUI() {
            insertRatings(ratingsData.rt, ratingsData.mc, ratingsData.oscars, ratingsData.awards, ratingsData.emmy, render);
            updateHiddenElements(ratingsData);

            var mode = parseInt(localStorage.getItem('maxsm_ratings_mode') || '0', 10);
            var isPortrait = window.innerHeight > window.innerWidth;
            if (isPortrait) mode = 1;

            if (mode !== 2) calculateAverageRating();

            var showIcons = localStorage.getItem('maxsm_ratings_icons') === 'true';
            if (showIcons) insertIcons(render);

            // портретний режим: клік відкриває модалку
            if (isPortrait) {
                var rateElement = $('.full-start__rate', render);
                rateElement.off('click.ratings-modal').on('click.ratings-modal', function (e) {
                    e.stopPropagation();
                    showRatingsModal(render);
                });
            }

            removeLoadingAnimation(render);
            if (rateLine.length) rateLine.css('visibility', 'visible');
        }

        function processNextStep() {
            // placeholder — логіка розгортання в RT+ складніша, тут ми використовуємо простий flow
        }
    }

    // -----------------------
    // Меню налаштувань — як у RT+ (Lampa.SettingsApi)
    // -----------------------
    function initSettings() {
        if (!Lampa.SettingsApi) return;

        // Створюємо компонент налаштувань
        Lampa.SettingsApi.addComponent({
            name: 'maxsm_ratings',
            title: 'MAXSM Ratings',
            hidden: false
        });

        // Режим (select)
        var modeValue = {};
        modeValue[0] = Lampa.Lang.translate("maxsm_ratings_mode_normal");
        modeValue[1] = Lampa.Lang.translate("maxsm_ratings_mode_simple");
        modeValue[2] = Lampa.Lang.translate("maxsm_ratings_mode_noavg");

        Lampa.SettingsApi.addParam({
            component: "maxsm_ratings",
            param: {
                name: "maxsm_ratings_mode",
                type: 'select',
                values: modeValue,
                default: 0
            },
            field: {
                name: Lampa.Lang.translate("maxsm_ratings_mode"),
                description: ''
            },
            onChange: function (value) {}
        });

        // Нагороди
        Lampa.SettingsApi.addParam({
            component: "maxsm_ratings",
            param: {
                name: "maxsm_ratings_awards",
                type: "trigger",
                default: true
            },
            field: {
                name: Lampa.Lang.translate("maxsm_ratings_awards"),
                description: ''
            },
            onChange: function (value) {}
        });

        // Критики
        Lampa.SettingsApi.addParam({
            component: "maxsm_ratings",
            param: {
                name: "maxsm_ratings_critic",
                type: "trigger",
                default: true
            },
            field: {
                name: Lampa.Lang.translate("maxsm_ratings_critic"),
                description: ''
            },
            onChange: function (value) {}
        });

        // Кольори
        Lampa.SettingsApi.addParam({
            component: "maxsm_ratings",
            param: {
                name: "maxsm_ratings_colors",
                type: "trigger",
                default: true
            },
            field: {
                name: Lampa.Lang.translate("maxsm_ratings_colors"),
                description: ''
            },
            onChange: function (value) {}
        });

        // Значки
        Lampa.SettingsApi.addParam({
            component: "maxsm_ratings",
            param: {
                name: "maxsm_ratings_icons",
                type: "trigger",
                default: true
            },
            field: {
                name: Lampa.Lang.translate("maxsm_ratings_icons"),
                description: ''
            },
            onChange: function (value) {}
        });

        // Кнопка очистки кеша
        Lampa.SettingsApi.addParam({
            component: 'maxsm_ratings',
            param: {
                name: 'maxsm_ratings_cc',
                type: 'button'
            },
            field: {
                name: Lampa.Lang.translate('maxsm_ratings_cc')
            },
            onChange: function () {
                Lampa.Storage.set(OMDB_CACHE, {});
                Lampa.Storage.set(ID_MAPPING_CACHE, {});
                window.location.reload();
            }
        });

        // Ініціалізація дефолтних localStorage значень (як у RT+), якщо їх ще немає
        if (!localStorage.getItem('maxsm_ratings_awards')) localStorage.setItem('maxsm_ratings_awards', 'true');
        if (!localStorage.getItem('maxsm_ratings_critic')) localStorage.setItem('maxsm_ratings_critic', 'true');
        if (!localStorage.getItem('maxsm_ratings_colors')) localStorage.setItem('maxsm_ratings_colors', 'true');
        if (!localStorage.getItem('maxsm_ratings_icons')) localStorage.setItem('maxsm_ratings_icons', 'true');
        if (!localStorage.getItem('maxsm_ratings_mode')) localStorage.setItem('maxsm_ratings_mode', '0');
    }

    // -----------------------
    // Ініціалізація плагіну: слухаємо подию відкриття повної карточки
    // -----------------------
    function startPlugin() {
        if (window.combined_ratings_plugin) return;
        window.combined_ratings_plugin = true;

        initSettings();

        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'complite') {
                // Викличемо з невеликою затримкою, щоб рендер встиг створитись
                setTimeout(function() {
                    try {
                        fetchAdditionalRatings(e.data.movie);
                    } catch (err) {
                        console.error('MAXSM-RATINGS fetch error', err);
                    }
                }, 300);
            }
        });
    }

    startPlugin();

})(); 

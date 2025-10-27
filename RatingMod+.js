(function () {
    'use strict';

    /********************************************************************
     * Плагін рейтингів для Lampa
     *
     * ВАЖЛИВО:
     * - дефолтні розміри/відступи/фон блоків такі самі, як у твоєму оригіналі
     *   (0.6em/1em паддінг, 0.5em радіус, rgba(...,0.6) фон і т.д.)
     *
     * - ДОДАНО:
     *   • глобальне масштабування ВСІХ іконок (а не тільки TMDB/IMDb)
     *   • live-оновлення після зміни налаштувань
     ********************************************************************/

    /*******************************
     * КЛЮЧІ ДЛЯ STORAGE
     *******************************/
    var STORAGE_KEY_MDBLIST         = 'ratings_plugin_mdblist_key';
    var STORAGE_KEY_OMDB            = 'ratings_plugin_omdb_key';
    var STORAGE_KEY_MONO            = 'ratings_plugin_monochrome';
    var STORAGE_KEY_SHOWAWARDS      = 'ratings_plugin_showawards';
    var STORAGE_KEY_SHOWAVERAGE     = 'ratings_plugin_showaverage';

    // стилі
    var STORAGE_KEY_ICON_OFFSET     = 'ratings_plugin_icon_offset_px';          // +1 => +1px до висоти іконок
    var STORAGE_KEY_MARGIN_STEPS    = 'ratings_plugin_margin_steps';            // +1 => +0.1em до margin-right між блоками
    var STORAGE_KEY_BADGE_SIZE_OFF  = 'ratings_plugin_badge_size_offset_px';    // +1 => +1px до padding бейджа
    var STORAGE_KEY_BADGE_OPACITY   = 'ratings_plugin_badge_opacity';           // alpha (0..1), дефолт 0.6
    var STORAGE_KEY_BADGE_TONE      = 'ratings_plugin_badge_tone';              // 0..255, дефолт 0 (чорний фон)

    /*******************************
     * КЕШ РЕЙТИНГІВ
     *******************************/
    var CACHE_TIME_MS        = 3 * 24 * 60 * 60 * 1000; // 3 дні
    var RATINGS_CACHE_KEY    = 'ratings_plugin_cache';     // mdblist+omdb відповіді
    var ID_MAPPING_CACHE_KEY = 'ratings_plugin_id_map';    // TMDB -> IMDb кеш

    /*******************************
     * ДОПОМОЖНІ ФУНКЦІЇ ДЛЯ STORAGE
     *******************************/
    function loadFromStorage(key, fallback) {
        try {
            var v = Lampa.Storage.get(key);
            if (typeof v === 'undefined' || v === null) return fallback;
            return v;
        } catch (e) {
            return fallback;
        }
    }

    function saveToStorage(key, value) {
        try {
            Lampa.Storage.set(key, value);
        } catch (e) { /* noop */ }
    }

    function ensureDefault(key, defVal) {
        if (typeof Lampa.Storage.get(key) === 'undefined') {
            saveToStorage(key, defVal);
        }
    }

    // дефолти → ті самі, що були в твоєму коді
    ensureDefault(STORAGE_KEY_MDBLIST, '');
    ensureDefault(STORAGE_KEY_OMDB, '');
    ensureDefault(STORAGE_KEY_MONO, false);
    ensureDefault(STORAGE_KEY_SHOWAWARDS, true);
    ensureDefault(STORAGE_KEY_SHOWAVERAGE, true);

    ensureDefault(STORAGE_KEY_ICON_OFFSET, 0);        // px
    ensureDefault(STORAGE_KEY_MARGIN_STEPS, 0);       // кроки по 0.1em
    ensureDefault(STORAGE_KEY_BADGE_SIZE_OFF, 0);     // px
    ensureDefault(STORAGE_KEY_BADGE_OPACITY, 0.6);    // альфа фону бейджів
    ensureDefault(STORAGE_KEY_BADGE_TONE, 0);         // 0 = чорний фон

    /*******************************
     * ПОТОЧНІ НАЛАШТУВАННЯ (геттери)
     *******************************/
    var RatingsSettings = {
        get mdblistKey() {
            return loadFromStorage(STORAGE_KEY_MDBLIST, '');
        },
        get omdbKey() {
            return loadFromStorage(STORAGE_KEY_OMDB, '');
        },
        get monochrome() {
            return !!loadFromStorage(STORAGE_KEY_MONO, false);
        },
        get showAwards() {
            return !!loadFromStorage(STORAGE_KEY_SHOWAWARDS, true);
        },
        get showAverage() {
            return !!loadFromStorage(STORAGE_KEY_SHOWAVERAGE, true);
        },

        // стилі
        get iconOffsetPx() {
            var n = parseFloat(loadFromStorage(STORAGE_KEY_ICON_OFFSET, 0));
            return isNaN(n) ? 0 : n;
        },
        get marginSteps() {
            var n = parseFloat(loadFromStorage(STORAGE_KEY_MARGIN_STEPS, 0));
            return isNaN(n) ? 0 : n;
        },
        get badgeSizeOffsetPx() {
            var n = parseFloat(loadFromStorage(STORAGE_KEY_BADGE_SIZE_OFF, 0));
            return isNaN(n) ? 0 : n;
        },
        get badgeOpacity() {
            var n = parseFloat(loadFromStorage(STORAGE_KEY_BADGE_OPACITY, 0.6));
            if (isNaN(n)) n = 0.6;
            if (n < 0) n = 0;
            if (n > 1) n = 1;
            return n;
        },
        get badgeTone() {
            var n = parseInt(loadFromStorage(STORAGE_KEY_BADGE_TONE, 0));
            if (isNaN(n)) n = 0;
            if (n < 0) n = 0;
            if (n > 255) n = 255;
            return n;
        }
    };

    /*******************************
     * КЛАС НА BODY ДЛЯ Ч/Б РЕЖИМУ
     *******************************/
    function applyMonochromeClass() {
        var body = $('body');
        if (!body || !body.length) return;
        body.toggleClass('lmp-enh--mono', RatingsSettings.monochrome);
    }

    /*******************************
     * ДИНАМІЧНІ СТИЛІ ПІД НАШІ НАЛАШТУВАННЯ
     *
     * ВАЖЛИВО: тут залишаю той самий вигляд бейджів,
     * який був у твоєму "оригіналі":
     *  - padding: 0.6em / 1em
     *  - border-radius: 0.5em
     *  - background rgba(tone,tone,tone,opacity)
     *  - base margin-right: 0.3em (далі кроками 0.1em)
     *******************************/
    function updateDynamicStyles() {
        // відступ між блоками
        var marginEm = 0.3 + (0.1 * RatingsSettings.marginSteps);
        if (marginEm < 0) marginEm = 0;

        // padding бейджів
        var padOffsetPx = RatingsSettings.badgeSizeOffsetPx;
        if (isNaN(padOffsetPx)) padOffsetPx = 0;

        // фон бейджів
        var tone = RatingsSettings.badgeTone;       // 0..255
        var alpha = RatingsSettings.badgeOpacity;   // 0..1

        var css =
            '.full-start-new__rate-line .full-start__rate{' +
                'margin-right:' + marginEm + 'em !important;' +
                'padding:calc(0.6em + ' + padOffsetPx + 'px) calc(1em + ' + padOffsetPx + 'px);' +
                'border-radius:0.5em;' +
                'background-color:rgba(' + tone + ',' + tone + ',' + tone + ',' + alpha + ');' +
            '}' +
            '.full-start-new__rate-line .full-start__rate:last-child{' +
                'margin-right:0 !important;' +
            '}' +

            /* золото для нагород у кольоровому режимі */
            '.rate--oscars,' +
            '.rate--emmy,' +
            '.rate--awards,' +
            '.rate--gold{' +
                'color: gold;' +
            '}' +

            /* моно-режим: прибираємо золото/кольори і робимо нейтральним */
            'body.lmp-enh--mono .rate--oscars,' +
            'body.lmp-enh--mono .rate--emmy,' +
            'body.lmp-enh--mono .rate--awards,' +
            'body.lmp-enh--mono .rate--gold,' +
            'body.lmp-enh--mono .rating--green,' +
            'body.lmp-enh--mono .rating--lime,' +
            'body.lmp-enh--mono .rating--orange,' +
            'body.lmp-enh--mono .rating--red,' +
            'body.lmp-enh--mono .full-start__rate{' +
                'color: inherit !important;' +
            '}' +

            /* лоадер, теж лишаємо як було в оригіналі */
            '.loading-dots-container {' +
                'display:flex;' +
                'align-items:center;' +
                'font-size:0.85em;' +
                'color:#ccc;' +
                'padding:0.6em 1em;' +
                'border-radius:0.5em;' +
            '}' +
            '.loading-dots__text {' +
                'margin-right:1em;' +
            '}' +
            '.loading-dots__dot {' +
                'width:0.5em;' +
                'height:0.5em;' +
                'border-radius:50%;' +
                'background-color:currentColor;' +
                'animation:loading-dots-bounce 1.4s infinite ease-in-out both;' +
            '}' +
            '.loading-dots__dot:nth-child(1){animation-delay:-0.32s;}' +
            '.loading-dots__dot:nth-child(2){animation-delay:-0.16s;}' +
            '@keyframes loading-dots-bounce {' +
                '0%,80%,100% {transform:translateY(0);opacity:0.6;}' +
                '40% {transform:translateY(-0.5em);opacity:1;}' +
            '}';

        var el = document.getElementById('ratings_plugin_dynamic_styles');
        if (!el) {
            el = document.createElement('style');
            el.id = 'ratings_plugin_dynamic_styles';
            document.head.appendChild(el);
        }
        el.textContent = css;
    }

    /*******************************
     * СТАТИЧНІ БАЗОВІ СТИЛІ (твій оригінал)
     *******************************/
    function injectBaseStyles() {
        if (document.getElementById('ratings_plugin_base_styles')) return;

        var css = `
/* Лоадер під час підвантаження рейтингів */
.loading-dots-container {
    display:flex;
    align-items:center;
    font-size:0.85em;
    color:#ccc;
    padding:0.6em 1em;
    border-radius:0.5em;
}
.loading-dots__text {
    margin-right:1em;
}
.loading-dots__dot {
    width:0.5em;
    height:0.5em;
    border-radius:50%;
    background-color:currentColor;
    animation:loading-dots-bounce 1.4s infinite ease-in-out both;
}
.loading-dots__dot:nth-child(1){animation-delay:-0.32s;}
.loading-dots__dot:nth-child(2){animation-delay:-0.16s;}
@keyframes loading-dots-bounce {
    0%,80%,100% {transform:translateY(0);opacity:0.6;}
    40% {transform:translateY(-0.5em);opacity:1;}
}

/* золото для нагород у кольоровому режимі */
.rate--oscars,
.rate--emmy,
.rate--awards,
.rate--gold {
    color: gold;
}

/* у моно-режимі робимо нейтральним */
body.lmp-enh--mono .rate--oscars,
body.lmp-enh--mono .rate--emmy,
body.lmp-enh--mono .rate--awards,
body.lmp-enh--mono .rate--gold,
body.lmp-enh--mono .rating--green,
body.lmp-enh--mono .rating--lime,
body.lmp-enh--mono .rating--orange,
body.lmp-enh--mono .rating--red,
body.lmp-enh--mono .full-start__rate {
    color: inherit !important;
}

/* дефолтно даємо базовий відступ 0.3em між бейджами,
   (updateDynamicStyles() потім перебиває margin-right і фон/паддінг динамічно) */
.full-start-new__rate-line .full-start__rate{
    margin-right:0.3em !important;
}
.full-start-new__rate-line .full-start__rate:last-child{
    margin-right:0 !important;
}
        `;

        var styleEl = document.createElement('style');
        styleEl.id = 'ratings_plugin_base_styles';
        styleEl.type = 'text/css';
        styleEl.appendChild(document.createTextNode(css));
        document.head.appendChild(styleEl);
    }

    injectBaseStyles();
    applyMonochromeClass();
    updateDynamicStyles();

    /*******************************
     * ІКОНИ (статичні URL)
     *******************************/
    var ICONS = {
        total_star: 'https://raw.githubusercontent.com/ko31k/LMPStyle/main/wwwroot/star.png',
        awards:     'https://raw.githubusercontent.com/ko31k/LMPStyle/main/wwwroot/awards.png',
        popcorn:    'https://raw.githubusercontent.com/ko31k/LMPStyle/main/wwwroot/popcorn.png',
        rotten_bad: 'https://raw.githubusercontent.com/ko31k/LMPStyle/main/wwwroot/RottenBad.png',
        imdb:       'https://www.streamingdiscovery.com/logo/imdb.png',
        tmdb:       'https://www.streamingdiscovery.com/logo/tmdb.png',
        metacritic: 'https://www.streamingdiscovery.com/logo/metacritic.png',
        rotten_good:'https://raw.githubusercontent.com/ko31k/LMPStyle/main/wwwroot/RottenTomatoes.png'
    };

    /*******************************
     * ЕММІ / ОСКАР
     *******************************/

    // той самий SVG Еммі, що в твоєму коді (довжелезний)
    var emmy_svg = '<svg   xmlns:dc="http://purl.org/dc/elements/1.1/"   xmlns:cc="http://creativecommons.org/ns#"   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"   xmlns:svg="http://www.w3.org/2000/svg"   xmlns="http://www.w3.org/2000/svg"   id="svg2"   version="1.1"   width="321"   height="563.40002"   viewBox="0 0 321 563.40002">  <metadata     id="metadata8">    <rdf:RDF>      <cc:Work         rdf:about=\"\">        <dc:format>image/svg+xml</dc:format>        <dc:type           rdf:resource=\"http://purl.org/dc/dcmitype/StillImage\" />        <dc:title></dc:title>      </cc:Work>    </rdf:RDF>  </metadata>  <defs     id=\"defs6\" />  <path     style=\"fill:#ffea55;fill-opacity:1\"     d=\"m 74.000736,558.45002 ... 0.9,0.581169 0.495,0 0.9,-0.106113 0.9,-0.235806 z\"     id=\"path4144\" />  <rect     y=\"493.01883\"     x=\"91.434082\"     height=\"35.565834\"     width=\"209.03105\"     id=\"rect4134\"     style=\"opacity:1;fill:#000000;fill-opacity:1;fill-rule:evenodd;stroke:none;stroke-width:0.60000002;stroke-linecap:square;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1\" /></svg>';

    // утиліта: скільки пікселів повинна мати іконка з урахуванням offset
    function calcIconHeightPx(basePx) {
        var h = basePx + RatingsSettings.iconOffsetPx;
        if (h < 1) h = 1;
        return h;
    }

    // ця функція буде ще й перезаписуватися при зміні налаштувань
    function refreshAllIconSizesInDom() {
        var off = RatingsSettings.iconOffsetPx;
        var mono = RatingsSettings.monochrome;

        $('.lmp-rating-icon').each(function () {
            var baseH = parseFloat(this.getAttribute('data-base')) || 0;
            var newH = baseH + off;
            if (newH < 1) newH = 1;
            this.style.height = newH + 'px';

            // ч/б
            if (mono) {
                this.style.filter = 'grayscale(100%)';
            } else {
                // важливо: не чіпаємо інші inline стилі тут
                // просто прибираємо фільтр
                this.style.filter = '';
            }
        });
    }

    function emmyIconInline() {
        var base = 14; // твоя базова висота
        var finalH = calcIconHeightPx(base);

        // span з класом lmp-rating-icon, щоб refreshAllIconSizesInDom() теж міг його чіпати
        // (filter буде ставитися на сам span)
        var filter = RatingsSettings.monochrome ? 'filter:grayscale(100%);' : '';

        return '' +
        '<span class="lmp-rating-icon" data-base="' + base + '" ' +
            'style="height:' + finalH + 'px; width:auto; display:inline-block; vertical-align:middle; ' +
            'transform:scale(1.2); transform-origin:center; ' + filter + '">' +
            emmy_svg +
        '</span>';
    }

    function oscarIconInline() {
        var base = 14; // твоя базова для Оскара
        var finalH = calcIconHeightPx(base);
        var filter = RatingsSettings.monochrome ? 'filter:grayscale(100%);' : '';

        return '' +
        '<span class="lmp-rating-icon" data-base="' + base + '" ' +
            'style="height:' + finalH + 'px; width:auto; display:inline-block; vertical-align:middle; ' +
            'object-fit:contain; transform:scale(1.2); transform-origin:center; ' + filter + '">' +
            '<img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgdmVyc2lvbj0iMS4xIgogICBpZD0ic3ZnMiIKICAgdmlld0JveD0iMCAwIDM4LjE4NTc0NCAxMDEuNzY1IgogICBoZWlnaHQ9IjEzNS42Njk0NSIKICAgd2lkdGg9IjUwLjkwODIwMyI+CiAgPG1ldGFkYXRhCiAgICAgaWQ9Im1ldGFkYXRhMTYiPgogICAgPHJkZjpSREY+CiAgICAgIDxjYzpXb3JrCiAgICAgICAgIHJkZjphYm91dD0iIj4KICAgICAgICA8ZGM6Zm9ybWF0PmltYWdlL3N2Zyt4bWw8L2RjOmZvcm1hdD4KICAgICAgICA8ZGM6dHlwZQogICAgICAgICAgIHJkZjpyZXNvdXJjZT0iaHR0cDovL3B1cmwub3JnL2RjL2RjbWl0eXBlL1N0aWxsSW1hZ2UiIC8+CiAgICAgICAgPGRjOnRpdGxlPjwvZGM6dGl0bGU+CiAgICAgIDwvY2M6V29yaz4KICAgIDwvcmRmOlJERj4KICA8L21ldGFkYXRhPgogIDxnIHN0eWxlPSJmaWxsOiNmZmNjMDAiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC04LjQwNjE3NDUsMC42OTMpIj4KICAgIDxwYXRoIGQ9Im0gMjcuMzcxLC0wLjY5MyBjIC0zLjkyNywwLjM2NiAtNS4yMjksMy41MzggLTQuOTYzLDYuNzc4IDAuMjY2LDMuMjM5IDMuNjg1LDYuOTcyIDAuMTM1LDguOTU2IC0xLjU3NywxLjQxMyAtMy4xNTQsMy4wNzMgLTUuMjA3LDMuNTQgLTIuNjc5LDAuNjA3IC00LjI4NywzLjA1NCAtNC42MDcsNi40MTkgMS4zODgsNC44MjQgMC4zNjUsOS4yODUgMS43NzMsMTIuODI0IDEuNDA3LDMuNTM5IDMuNjk2LDMuODMxIDMuOTg2LDUuMDc2IDAuMzE3LDcuNjM3IDIuMzQxLDE3LjUzNSAwLjg1NiwyNC45MyAxLjE3MiwwLjE4NCAwLjkzLDAuNDQ0IDAuODk0LDAuNzI5IC0wLjAzNiwwLjI4NCAtMC40OCwwLjM4MSAtMS4wODgsMC41MjcgMC44NDcsNy42ODQgLTAuMjc4LDEyLjEzNiAxLjk4MywxOC43NzEgbCAwLDMuNTkyIC0xLjA3LDAgMCwxLjUyNCBjIDAsMCAtNy4zMSwtMC4wMDUgLTguNTY1LDAgMCwwIDAuNjgsMi4xNTkgLTEuNTIzLDMuMDI3IDAuMDA4LDEuMSAwLDIuNzE5IDAsMi43MTkgbCAtMS41NjksMCAwLDIuMzUzIGMgMTMuMjIxNzAzLDAgMjYuODM3OTA3LDAgMzguMTg2LDAgbCAwLC0yLjM1MiAtMS41NywwIGMgMCwwIC0wLjAwNywtMS42MTkgMC4wMDEsLTIuNzE5IEMgNDIuODIsOTUuMTMzIDQzLjUsOTIuOTc0IDQzLjUsOTIuOTc0IGMgLTEuMjU1LC0wLjAwNSAtOC41NjQsMCAtOC41NjQsMCBsIDAsLTEuNTI0IC0xLjA3MywwIDAsLTMuNTkyIGMgMi4yNjEsLTYuNjM1IDEuMTM4LC0xMS4wODcgMS45ODUsLTE4Ljc3MSAtMC42MDgsLTAuMTQ2IC0xLjA1NCwtMC4yNDMgLTEuMDksLTAuNTI3IC0wLjAzNiwtMC4yODUgLTAuMjc4LC0wLjU0NSAwLjg5NCwtMC43MjkgLTAuODQ1LC04LjA1OCAwLjkwMiwtMTcuNDkzIDAuODU4LC0yNC45MyAwLjI5LC0xLjI0NSAyLjU3OSwtMS41MzcgMy45ODYsLTUuMDc2IDEuNDA4LC0zLjUzOSAwLjM4NSwtOCAxLjc3NCwtMTIuODI0IC0wLjMyLC0zLjM2NSAtMS45MzEsLTUuODEyIC00LjYxLC02LjQyIC0yLjA1MywtMC40NjYgLTMuNDY5LC0yLjYgLTUuMzY5LC0zLjg4NCAtMy4xMTgsLTIuNDcyIC0wLjYxLC01LjM2NCAwLjM3MywtOC41NzggMCwtNS4wMSAtMi4xNTQsLTYuNDgzIC01LjI5MywtNi44MTEgeiIvPgogIDwvZz4KPC9zdmc+\" ' +
            'style="height:100%; width:auto; display:inline-block; vertical-align:middle; object-fit:contain;">' +
        '</span>';
    }

    /*******************************
     * ВІКОВІ РЕЙТИНГИ (PG → "6+" і т.п.)
     *******************************/
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

    /*******************************
     * ДОПОМІЖНЕ
     *******************************/
    function nowMs() {
        return Date.now ? Date.now() : (new Date()).getTime();
    }

    function loadRatingsCache() {
        var cache = loadFromStorage(RATINGS_CACHE_KEY, null);
        if (!cache || typeof cache !== 'object') cache = {};
        return cache;
    }

    function saveRatingsCache(cacheObj) {
        saveToStorage(RATINGS_CACHE_KEY, cacheObj);
    }

    function getCachedRatings(cacheKey) {
        var cache = loadRatingsCache();
        var entry = cache[cacheKey];
        if (!entry) return null;
        if (!entry.timestamp || (nowMs() - entry.timestamp) > CACHE_TIME_MS) return null;
        return entry.data || null;
    }

    function setCachedRatings(cacheKey, data) {
        if (!data) return;
        var cache = loadRatingsCache();
        cache[cacheKey] = {
            timestamp: nowMs(),
            data: data
        };
        saveRatingsCache(cache);
    }

    function getCardType(card) {
        var type = card.media_type || card.type;
        if (type === 'movie' || type === 'tv') return type;
        return card.name || card.original_name ? 'tv' : 'movie';
    }

    function getRatingClass(rating) {
        if (rating >= 8.0) return 'rating--green';
        if (rating >= 6.0) return 'rating--lime';
        if (rating >= 5.5) return 'rating--orange';
        return 'rating--red';
    }

    /*******************************
     * TMDB → IMDb ID (кеш)
     *******************************/
    function getImdbIdFromTmdb(tmdbId, type, callback) {
        if (!tmdbId) return callback(null);

        var normType = (type === 'movie') ? 'movie' : 'tv';
        var cacheKey = normType + '_' + tmdbId;
        var mapCache = loadFromStorage(ID_MAPPING_CACHE_KEY, {}) || {};

        if (mapCache[cacheKey] && (nowMs() - mapCache[cacheKey].timestamp < CACHE_TIME_MS)) {
            return callback(mapCache[cacheKey].imdb_id);
        }

        var url = 'https://api.themoviedb.org/3/' + normType + '/' +
            tmdbId + '/external_ids?api_key=' + Lampa.TMDB.key();

        function requestJson(url, success, error) {
            new Lampa.Reguest().silent(url, success, function () {
                new Lampa.Reguest().native(url, function (data) {
                    try {
                        success(typeof data === 'string' ? JSON.parse(data) : data);
                    } catch (e) {
                        error();
                    }
                }, error, false, { dataType: 'json' });
            });
        }

        requestJson(url, function (data) {
            var imdbId = data && data.imdb_id ? data.imdb_id : null;
            if (!imdbId && normType === 'tv') {
                var altUrl = 'https://api.themoviedb.org/3/tv/' + tmdbId +
                    '?api_key=' + Lampa.TMDB.key();
                requestJson(altUrl, function (altData) {
                    var altImdb = (altData && altData.external_ids && altData.external_ids.imdb_id) || null;
                    mapCache[cacheKey] = {
                        imdb_id: altImdb,
                        timestamp: nowMs()
                    };
                    saveToStorage(ID_MAPPING_CACHE_KEY, mapCache);
                    callback(altImdb);
                }, function () {
                    callback(null);
                });
            } else {
                mapCache[cacheKey] = {
                    imdb_id: imdbId,
                    timestamp: nowMs()
                };
                saveToStorage(ID_MAPPING_CACHE_KEY, mapCache);
                callback(imdbId);
            }
        }, function () {
            callback(null);
        });
    }

    /*******************************
     * РОЗБІР НАГОРОД З OMDb
     *******************************/
    function parseAwards(awardsText) {
        if (typeof awardsText !== 'string') {
            return { oscars: 0, emmy: 0, awards: 0 };
        }

        var res = { oscars: 0, emmy: 0, awards: 0 };

        var osc = awardsText.match(/Won (\d+) Oscars?/i);
        if (osc && osc[1]) res.oscars = parseInt(osc[1], 10);

        var em  = awardsText.match(/Won (\d+) Primetime Emmys?/i);
        if (em && em[1]) res.emmy = parseInt(em[1], 10);

        var oth = awardsText.match(/Another (\d+) wins?/i);
        if (oth && oth[1]) res.awards = parseInt(oth[1], 10);

        if (res.awards === 0) {
            var any = awardsText.match(/(\d+) wins?/i);
            if (any && any[1]) res.awards = parseInt(any[1], 10);
        }

        return res;
    }

    /*******************************
     * MDBList API
     *******************************/
    function fetchMdbListRatings(card, callback) {
        var key = RatingsSettings.mdblistKey;
        if (!key) {
            callback(null);
            return;
        }

        var typeSegment = (card.type === 'tv') ? 'show' : card.type;
        var url = 'https://api.mdblist.com/tmdb/' + typeSegment + '/' + card.id +
            '?apikey=' + encodeURIComponent(key);

        $.ajax({
            url: url,
            method: 'GET',
            timeout: 0
        }).done(function (response) {
            if (!response || !response.ratings || !response.ratings.length) {
                callback(null);
                return;
            }

            var res = {
                tmdb_display: null,
                tmdb_for_avg: null,

                imdb_display: null,
                imdb_for_avg: null,

                mc_user_display: null,
                mc_user_for_avg: null,

                mc_critic_display: null,
                mc_critic_for_avg: null,

                rt_display: null,
                rt_for_avg: null,
                rt_fresh: null,

                popcorn_display: null,
                popcorn_for_avg: null
            };

            function parseRawScore(rawVal) {
                if (rawVal === null || rawVal === undefined) return null;
                if (typeof rawVal === 'number') return rawVal;
                if (typeof rawVal === 'string') {
                    if (rawVal.indexOf('%') !== -1) {
                        return parseFloat(rawVal.replace('%', ''));
                    }
                    if (rawVal.indexOf('/') !== -1) {
                        return parseFloat(rawVal.split('/')[0]);
                    }
                    return parseFloat(rawVal);
                }
                return null;
            }

            function isUserSource(src) {
                return (
                    src.indexOf('user') !== -1 ||
                    src.indexOf('users') !== -1 ||
                    src.indexOf('metacriticuser') !== -1 ||
                    src.indexOf('metacritic_user') !== -1
                );
            }

            response.ratings.forEach(function (r) {
                var src = (r.source || '').toLowerCase();
                var val = parseRawScore(r.value);
                if (val === null || isNaN(val)) return;

                // TMDB (/10)
                if (src.indexOf('tmdb') !== -1) {
                    var tmdb10 = val > 10 ? (val / 10) : val;
                    res.tmdb_display = tmdb10.toFixed(1);
                    res.tmdb_for_avg = tmdb10;
                }

                // IMDb (/10)
                if (src.indexOf('imdb') !== -1) {
                    var imdb10 = val > 10 ? (val / 10) : val;
                    res.imdb_display = imdb10.toFixed(1);
                    res.imdb_for_avg = imdb10;
                }

                // Metacritic USER
                if (src.indexOf('metacritic') !== -1 && isUserSource(src)) {
                    var user10 = val > 10 ? (val / 10) : val;
                    res.mc_user_display = user10.toFixed(1);
                    res.mc_user_for_avg = user10;
                }

                // Metacritic CRITIC → /10
                if (src.indexOf('metacritic') !== -1 && !isUserSource(src)) {
                    var critic10 = val > 10 ? (val / 10) : val;
                    res.mc_critic_display = critic10.toFixed(1);
                    res.mc_critic_for_avg = critic10;
                }

                // Rotten Tomatoes (%)
                if (src.indexOf('rotten') !== -1 || src.indexOf('tomato') !== -1) {
                    res.rt_display = String(Math.round(val));
                    res.rt_for_avg = val / 10;
                    res.rt_fresh = val >= 60;
                }

                // Popcorn / Audience (%)
                if (src.indexOf('popcorn') !== -1 || src.indexOf('audience') !== -1) {
                    res.popcorn_display = String(Math.round(val));
                    res.popcorn_for_avg = val / 10;
                }
            });

            callback(res);
        }).fail(function () {
            callback(null);
        });
    }

    /*******************************
     * OMDb API
     *******************************/
    function fetchOmdbRatings(card, callback) {
        var key = RatingsSettings.omdbKey;
        if (!key || !card.imdb_id) {
            callback(null);
            return;
        }

        var typeParam = (card.type === 'tv') ? '&type=series' : '';
        var url = 'https://www.omdbapi.com/?apikey=' + encodeURIComponent(key) +
            '&i=' + encodeURIComponent(card.imdb_id) + typeParam;

        new Lampa.Reguest().silent(url, function (data) {
            if (!data || data.Response !== 'True') {
                callback(null);
                return;
            }

            var awardsParsed = parseAwards(data.Awards || '');
            var rtScore = null;
            var mcScore = null;

            if (Array.isArray(data.Ratings)) {
                data.Ratings.forEach(function (r) {
                    if (r.Source === 'Rotten Tomatoes') {
                        var v = parseInt((r.Value || '').replace('%', ''));
                        if (!isNaN(v)) rtScore = v;
                    }
                    if (r.Source === 'Metacritic') {
                        var m = parseInt((r.Value || '').split('/')[0]);
                        if (!isNaN(m)) mcScore = m;
                    }
                });
            }

            var mc10 = (mcScore !== null && !isNaN(mcScore))
                ? (mcScore > 10 ? mcScore / 10 : mcScore)
                : null;

            var res = {
                tmdb_display: null,
                tmdb_for_avg: null,

                imdb_display: data.imdbRating && data.imdbRating !== 'N/A'
                    ? parseFloat(data.imdbRating).toFixed(1)
                    : null,
                imdb_for_avg: data.imdbRating && data.imdbRating !== 'N/A'
                    ? parseFloat(data.imdbRating)
                    : null,

                mc_user_display: null,
                mc_user_for_avg: null,

                mc_critic_display: (mc10 !== null ? mc10.toFixed(1) : null),
                mc_critic_for_avg: (mc10 !== null ? mc10 : null),

                rt_display: (rtScore !== null && !isNaN(rtScore))
                    ? String(rtScore)
                    : null,
                rt_for_avg: (rtScore !== null && !isNaN(rtScore))
                    ? (rtScore / 10)
                    : null,
                rt_fresh: (rtScore !== null && !isNaN(rtScore))
                    ? (rtScore >= 60)
                    : null,

                popcorn_display: null,
                popcorn_for_avg: null,

                ageRating: data.Rated || null,

                oscars: awardsParsed.oscars || 0,
                emmy:   awardsParsed.emmy || 0,
                awards: awardsParsed.awards || 0
            };

            callback(res);
        }, function () {
            callback(null);
        });
    }

    /*******************************
     * MERGE MDBList + OMDb
     *******************************/
    function mergeRatings(mdb, omdb) {
        mdb = mdb || {};
        omdb = omdb || {};

        var mc_display = null;
        var mc_for_avg = null;
        if (mdb.mc_user_display) {
            mc_display = mdb.mc_user_display;
            mc_for_avg = mdb.mc_user_for_avg;
        } else if (mdb.mc_critic_display) {
            mc_display = mdb.mc_critic_display;
            mc_for_avg = mdb.mc_critic_for_avg;
        } else if (omdb.mc_critic_display) {
            mc_display = omdb.mc_critic_display;
            mc_for_avg = omdb.mc_critic_for_avg;
        }

        return {
            tmdb_display: mdb.tmdb_display || null,
            tmdb_for_avg: mdb.tmdb_for_avg || null,

            imdb_display: mdb.imdb_display || omdb.imdb_display || null,
            imdb_for_avg: mdb.imdb_for_avg || omdb.imdb_for_avg || null,

            mc_display: mc_display || null,
            mc_for_avg: (typeof mc_for_avg === 'number' ? mc_for_avg : null),

            rt_display: mdb.rt_display || omdb.rt_display || null,
            rt_for_avg: mdb.rt_for_avg || omdb.rt_for_avg || null,
            rt_fresh:   (mdb.rt_display || omdb.rt_display)
                        ? (mdb.rt_display ? mdb.rt_fresh : omdb.rt_fresh)
                        : null,

            popcorn_display: mdb.popcorn_display || null,
            popcorn_for_avg: mdb.popcorn_for_avg || null,

            ageRating: omdb.ageRating || null,

            oscars: omdb.oscars || 0,
            emmy:   omdb.emmy || 0,
            awards: omdb.awards || 0
        };
    }

    /*******************************
     * ЛОАДЕР
     *******************************/
    function addLoadingAnimation() {
        var render = Lampa.Activity.active().activity.render();
        if (!render) return;

        var rateLine = $('.full-start-new__rate-line', render);
        if (!rateLine.length || $('.loading-dots-container', rateLine).length) return;

        var loaderHtml =
            '<div class="loading-dots-container">' +
                '<div class="loading-dots__text">Loading ratings</div>' +
                '<div class="loading-dots__dot"></div>' +
                '<div class="loading-dots__dot"></div>' +
                '<div class="loading-dots__dot"></div>' +
            '</div>';

        rateLine.append(loaderHtml);
    }

    function removeLoadingAnimation() {
        var render = Lampa.Activity.active().activity.render();
        if (!render) return;
        $('.loading-dots-container', render).remove();
    }

    /*******************************
     * Універсальний логотип (IMDb/TMDB/MC/RT/Popcorn/Star/Awards)
     * - ДОДАНО клас .lmp-rating-icon і data-base
     * - розмір тепер базується на baseHeightPx + offset
     * - ч/б через filter ставиться тут, а потім може бути оновлений refreshAllIconSizesInDom()
     *******************************/
    function iconImg(url, alt, baseHeightPx, extraStyle) {
        var finalH = calcIconHeightPx(baseHeightPx);
        var filter = RatingsSettings.monochrome ? 'filter:grayscale(100%);' : '';

        return '<img class="lmp-rating-icon" data-base="' + baseHeightPx + '" style="' +
            'height:' + finalH + 'px; width:auto; display:inline-block; vertical-align:middle; ' +
            'object-fit:contain; ' +
            (extraStyle || '') + ' ' +
            filter + '" ' +
            'src="' + url + '" alt="' + (alt || '') + '">';
    }

    /*******************************
     * ОНОВЛЕННЯ ІСНУЮЧИХ ЕЛЕМЕНТІВ (IMDb/TMDB/PG)
     *******************************/
    function updateHiddenElements(data) {
        var render = Lampa.Activity.active().activity.render();
        if (!render || !render[0]) return;

        // Віковий рейтинг
        var pgElement = $('.full-start__pg.hide', render);
        if (pgElement.length && data.ageRating) {
            var invalid = ['N/A', 'Not Rated', 'Unrated'];
            var ok = invalid.indexOf(data.ageRating) === -1;
            if (ok) {
                var localized = AGE_RATINGS[data.ageRating] || data.ageRating;
                pgElement.removeClass('hide').text(localized);
            }
        }

        // IMDb
        var imdbContainer = $('.rate--imdb', render);
        if (imdbContainer.length) {
            if (data.imdb_display) {
                imdbContainer.removeClass('hide');

                var imdbParts = imdbContainer.find('> div');
                if (imdbParts.length >= 2) {
                    imdbParts.eq(0).text(parseFloat(data.imdb_display).toFixed(1));
                    imdbParts.eq(1).html(
                        iconImg(ICONS.imdb, 'IMDb', 22)
                    );
                }
            } else {
                imdbContainer.addClass('hide');
            }
        }

        // TMDB
        var tmdbContainer = $('.rate--tmdb', render);
        if (tmdbContainer.length) {
            if (data.tmdb_display) {
                var tmdbParts = tmdbContainer.find('> div');
                if (tmdbParts.length >= 2) {
                    tmdbParts.eq(0).text(parseFloat(data.tmdb_display).toFixed(1));
                    tmdbParts.eq(1).html(
                        iconImg(ICONS.tmdb, 'TMDB', 24)
                    );
                }
            }
        }

        // синхронізація всіх іконок після оновлення imdb/tmdb
        refreshAllIconSizesInDom();
    }

    /*******************************
     * ДОДАЄМО НАШІ БЕЙДЖІ (MC, Rotten, Popcorn, Нагороди)
     *******************************/
    function insertRatings(data) {
        var render = Lampa.Activity.active().activity.render();
        if (!render) return;

        var rateLine = $('.full-start-new__rate-line', render);
        if (!rateLine.length) return;

        // Metacritic
        if (data.mc_display && !$('.rate--mc', rateLine).length) {

            var mcVal = null;
            if (data.mc_for_avg && !isNaN(data.mc_for_avg)) {
                mcVal = parseFloat(data.mc_for_avg);
            } else if (!isNaN(parseFloat(data.mc_display))) {
                mcVal = parseFloat(data.mc_display);
            }

            var mcText = (mcVal !== null && !isNaN(mcVal))
                ? mcVal.toFixed(1)
                : data.mc_display;

            var mcElement = $(
                '<div class="full-start__rate rate--mc">' +
                    '<div>' + mcText + '</div>' +
                    '<div class="source--name"></div>' +
                '</div>'
            );

            mcElement.find('.source--name').html(
                iconImg(ICONS.metacritic, 'Metacritic', 22)
            );

            var afterImdb = $('.rate--imdb', rateLine);
            if (afterImdb.length) mcElement.insertAfter(afterImdb);
            else rateLine.append(mcElement);
        }

        // Rotten Tomatoes
        if (data.rt_display && !$('.rate--rt', rateLine).length) {
            var rtIconUrl = data.rt_fresh ? ICONS.rotten_good : ICONS.rotten_bad;
            var extra = data.rt_fresh ? 'border-radius:4px;' : '';

            var rtElement = $(
                '<div class="full-start__rate rate--rt">' +
                    '<div>' + data.rt_display + '</div>' +
                    '<div class="source--name"></div>' +
                '</div>'
            );

            rtElement.find('.source--name').html(
                iconImg(rtIconUrl, 'Rotten Tomatoes', 22, extra)
            );

            var afterMc = $('.rate--mc', rateLine);
            if (afterMc.length) {
                rtElement.insertAfter(afterMc);
            } else {
                var afterImdb2 = $('.rate--imdb', rateLine);
                if (afterImdb2.length) rtElement.insertAfter(afterImdb2);
                else rateLine.append(rtElement);
            }
        }

        // Popcorn / Audience
        if (data.popcorn_display && !$('.rate--popcorn', rateLine).length) {
            var pcElement = $(
                '<div class="full-start__rate rate--popcorn">' +
                    '<div>' + data.popcorn_display + '</div>' +
                    '<div class="source--name"></div>' +
                '</div>'
            );

            pcElement.find('.source--name').html(
                iconImg(ICONS.popcorn, 'Audience', 22)
            );

            var afterRt = $('.rate--rt', rateLine);
            if (afterRt.length) {
                pcElement.insertAfter(afterRt);
            } else {
                var afterMc2 = $('.rate--mc', rateLine);
                if (afterMc2.length) pcElement.insertAfter(afterMc2);
                else rateLine.append(pcElement);
            }
        }

        // Нагороди (тільки якщо показ увімкнено)
        if (RatingsSettings.showAwards) {
            // інші нагороди
            if (data.awards && data.awards > 0 && !$('.rate--awards', rateLine).length) {
                var awardsElement = $(
                    '<div class="full-start__rate rate--awards rate--gold">' +
                        '<div>' + data.awards + '</div>' +
                        '<div class="source--name"></div>' +
                    '</div>'
                );

                awardsElement.find('.source--name')
                    .html(iconImg(ICONS.awards, 'Awards', 20))
                    .attr('title', Lampa.Lang.translate('awards_other_label'));

                rateLine.prepend(awardsElement);
            }

            // Еммі
            if (data.emmy && data.emmy > 0 && !$('.rate--emmy', rateLine).length) {
                var emmyElement = $(
                    '<div class="full-start__rate rate--emmy rate--gold">' +
                        '<div>' + data.emmy + '</div>' +
                        '<div class="source--name"></div>' +
                    '</div>'
                );

                emmyElement.find('.source--name')
                    .html(emmyIconInline())
                    .attr('title', Lampa.Lang.translate('emmy_label'));

                rateLine.prepend(emmyElement);
            }

            // Оскар
            if (data.oscars && data.oscars > 0 && !$('.rate--oscars', rateLine).length) {
                var oscarsElement = $(
                    '<div class="full-start__rate rate--oscars rate--gold">' +
                        '<div>' + data.oscars + '</div>' +
                        '<div class="source--name"></div>' +
                    '</div>'
                );

                oscarsElement.find('.source--name')
                    .html(oscarIconInline())
                    .attr('title', Lampa.Lang.translate('oscars_label'));

                rateLine.prepend(oscarsElement);
            }
        }

        // після додавання всіх нових бейджів — оновлюємо розміри/фільтр
        refreshAllIconSizesInDom();
    }

    /*******************************
     * СЕРЕДНІЙ РЕЙТИНГ (AVG)
     *******************************/
    function calculateAverageRating(data) {
        var render = Lampa.Activity.active().activity.render();
        if (!render) return;

        var rateLine = $('.full-start-new__rate-line', render);
        if (!rateLine.length) return;

        // прибрати попередній AVG
        $('.rate--avg', rateLine).remove();

        if (!RatingsSettings.showAverage) {
            removeLoadingAnimation();
            rateLine.css('visibility', 'visible');
            return;
        }

        var parts = [];
        if (data.tmdb_for_avg && !isNaN(data.tmdb_for_avg)) parts.push(data.tmdb_for_avg);
        if (data.imdb_for_avg && !isNaN(data.imdb_for_avg)) parts.push(data.imdb_for_avg);
        if (data.mc_for_avg && !isNaN(data.mc_for_avg))     parts.push(data.mc_for_avg);
        if (data.rt_for_avg && !isNaN(data.rt_for_avg))     parts.push(data.rt_for_avg);
        if (data.popcorn_for_avg && !isNaN(data.popcorn_for_avg)) parts.push(data.popcorn_for_avg);

        if (!parts.length) {
            removeLoadingAnimation();
            rateLine.css('visibility', 'visible');
            return;
        }

        var sum = 0;
        for (var i = 0; i < parts.length; i++) sum += parts[i];
        var avg = sum / parts.length;

        var colorClass = getRatingClass(avg);

        var avgElement = $(
            '<div class="full-start__rate rate--avg ' + colorClass + '">' +
                '<div>' + avg.toFixed(1) + '</div>' +
                '<div class="source--name"></div>' +
            '</div>'
        );

        avgElement.find('.source--name').html(
            iconImg(ICONS.total_star, 'AVG', 20)
        );

        var firstRate = $('.full-start__rate:first', rateLine);
        if (firstRate.length) firstRate.before(avgElement);
        else rateLine.prepend(avgElement);

        // оновлюємо розміри/фільтр іконок знов
        refreshAllIconSizesInDom();

        removeLoadingAnimation();
        rateLine.css('visibility', 'visible');
    }

    /*******************************
     * ПОВНИЙ ЦИКЛ ОНОВЛЕННЯ ДАНИХ
     *******************************/
    var currentRatingsData = null;

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
            addLoadingAnimation();
        }

        function proceed() {
            var cacheKey = normalizedCard.type + '_' + (normalizedCard.imdb_id || normalizedCard.id);
            var cached = getCachedRatings(cacheKey);
            if (cached) {
                currentRatingsData = cached;
                renderAll();
                return;
            }

            var pending = 2;
            var mdbRes = null;
            var omdbRes = null;

            function doneOne() {
                pending--;
                if (pending === 0) {
                    currentRatingsData = mergeRatings(mdbRes, omdbRes);
                    setCachedRatings(cacheKey, currentRatingsData);
                    renderAll();
                }
            }

            fetchMdbListRatings(normalizedCard, function (r1) {
                mdbRes = r1 || {};
                doneOne();
            });

            fetchOmdbRatings(normalizedCard, function (r2) {
                omdbRes = r2 || {};
                doneOne();
            });
        }

        function renderAll() {
            if (!currentRatingsData) {
                removeLoadingAnimation();
                if (rateLine.length) rateLine.css('visibility', 'visible');
                return;
            }

            updateHiddenElements(currentRatingsData);
            insertRatings(currentRatingsData);
            calculateAverageRating(currentRatingsData);
        }

        if (!normalizedCard.imdb_id) {
            getImdbIdFromTmdb(normalizedCard.id, normalizedCard.type, function (imdb_id) {
                normalizedCard.imdb_id = imdb_id;
                proceed();
            });
        } else {
            proceed();
        }
    }

    /*******************************
     * ПЕРЕКЛАДИ / LABELS ДЛЯ НАГОРОД
     *******************************/
    Lampa.Lang.add({
        oscars_label: {
            ru: 'Оскары',
            en: 'Oscars',
            uk: 'Оскар'
        },
        emmy_label: {
            ru: 'Эмми',
            en: 'Emmy',
            uk: 'Еммі'
        },
        awards_other_label: {
            ru: 'Награды',
            en: 'Awards',
            uk: 'Нагороди'
        },
        popcorn_label: {
            ru: 'Зрители',
            en: 'Audience',
            uk: 'Глядачі'
        },
        source_tmdb: { ru:'TMDB', en:'TMDB', uk:'TMDB' },
        source_imdb:{ ru:'IMDb', en:'IMDb', uk:'IMDb' },
        source_mc:  { ru:'Metacritic', en:'Metacritic', uk:'Metacritic' },
        source_rt:  { ru:'Rotten', en:'Rotten', uk:'Rotten' }
    });

    /*******************************
     * РОЗДІЛ НАЛАШТУВАНЬ "РЕЙТИНГИ"
     *******************************/
    (function registerSettingsMenu() {
        Lampa.SettingsApi.addComponent({
            component: "ratings_plugin",
            name: 'Рейтинги',
            icon:
                '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" ' +
                'viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" ' +
                'stroke-linecap="round" stroke-linejoin="round">' +
                '<polygon points="12 2 15 8.5 22 9.5 17 14 18.5 21 12 17.5 5.5 21 7 14 2 9.5 9 8.5 12 2"/>' +
                '</svg>'
        });

        // 1. API ключ (OMDb)
        Lampa.SettingsApi.addParam({
            component: "ratings_plugin",
            param: {
                name: STORAGE_KEY_OMDB,
                type: "input",
                placeholder: '',
                values: ''
            },
            field: {
                name: 'API ключ (OMDb)',
                description: 'Введи свій ключ OMDb. Можна отримати на omdbapi.com'
            },
            onChange: function () {
                Lampa.Settings.update();
            }
        });

        // 2. API ключ (MDBList)
        Lampa.SettingsApi.addParam({
            component: "ratings_plugin",
            param: {
                name: STORAGE_KEY_MDBLIST,
                type: "input",
                placeholder: '',
                values: ''
            },
            field: {
                name: 'API ключ (MDBList)',
                description: 'Введи свій ключ MDBList. Можна отримати на mdblist.com'
            },
            onChange: function () {
                Lampa.Settings.update();
            }
        });

        // 3. Ч/Б логотипи
        Lampa.SettingsApi.addParam({
            component: "ratings_plugin",
            param: {
                name: STORAGE_KEY_MONO,
                type: "trigger",
                "default": false
            },
            field: {
                name: 'Ч/Б логотипи',
                description: 'Кольорові або чорно-білі логотипи рейтингів'
            },
            onChange: function () {
                applyMonochromeClass();
                updateDynamicStyles();
                refreshAllIconSizesInDom();
                Lampa.Settings.update();
            }
        });

        // 4. Нагороди
        Lampa.SettingsApi.addParam({
            component: "ratings_plugin",
            param: {
                name: STORAGE_KEY_SHOWAWARDS,
                type: "trigger",
                "default": true
            },
            field: {
                name: 'Нагороди',
                description: 'Показувати Оскари, Еммі та інші нагороди'
            },
            onChange: function () {
                Lampa.Settings.update();
            }
        });

        // 5. Середній рейтинг
        Lampa.SettingsApi.addParam({
            component: "ratings_plugin",
            param: {
                name: STORAGE_KEY_SHOWAVERAGE,
                type: "trigger",
                "default": true
            },
            field: {
                name: 'Середній рейтинг',
                description: 'Показувати середній рейтинг'
            },
            onChange: function () {
                Lampa.Settings.update();
            }
        });

        // 6.1 Розмір логотипів
        Lampa.SettingsApi.addParam({
            component: "ratings_plugin",
            param: {
                name: STORAGE_KEY_ICON_OFFSET,
                type: "input",
                placeholder: '0',
                values: ''
            },
            field: {
                name: 'Розмір логотипів',
                description:
                    '0 за замовчуванням. 1 збільшує ВСІ логотипи на +1px висоти; -1 зменшує на -1px.'
            },
            onChange: function () {
                updateDynamicStyles();
                refreshAllIconSizesInDom();
                Lampa.Settings.update();
            }
        });

        // 6.2 Відступи між блоками
        Lampa.SettingsApi.addParam({
            component: "ratings_plugin",
            param: {
                name: STORAGE_KEY_MARGIN_STEPS,
                type: "input",
                placeholder: '0',
                values: ''
            },
            field: {
                name: 'Відступи між блоками',
                description:
                    '0 за замовчуванням. 1 = +0.1em до відступу між блоками; -1 = -0.1em.'
            },
            onChange: function () {
                updateDynamicStyles();
                Lampa.Settings.update();
            }
        });

        // 6.3 Розмір фону під логотипи
        Lampa.SettingsApi.addParam({
            component: "ratings_plugin",
            param: {
                name: STORAGE_KEY_BADGE_SIZE_OFF,
                type: "input",
                placeholder: '0',
                values: ''
            },
            field: {
                name: 'Розмір фону під логотипи',
                description:
                    '0 за замовчуванням. 1 збільшує блоки на +1px по обидвох осях; -1 зменшує на -1px.'
            },
            onChange: function () {
                updateDynamicStyles();
                Lampa.Settings.update();
            }
        });

        // 6.4 Прозорість фону
        Lampa.SettingsApi.addParam({
            component: "ratings_plugin",
            param: {
                name: STORAGE_KEY_BADGE_OPACITY,
                type: "input",
                placeholder: '' + RatingsSettings.badgeOpacity,
                values: ''
            },
            field: {
                name: 'Прозорість фону',
                description:
                    'Число від 0 до 1. 0 = повністю прозорий, 1 = щільний. Дефолт 0.6.'
            },
            onChange: function () {
                updateDynamicStyles();
                Lampa.Settings.update();
            }
        });

        // 6.5 Тон фону
        Lampa.SettingsApi.addParam({
            component: "ratings_plugin",
            param: {
                name: STORAGE_KEY_BADGE_TONE,
                type: "input",
                placeholder: '' + RatingsSettings.badgeTone,
                values: ''
            },
            field: {
                name: 'Тон фону',
                description:
                    'Введи 0–255. 0 = чорний фон. Більше значення — світліший фон.'
            },
            onChange: function () {
                updateDynamicStyles();
                Lampa.Settings.update();
            }
        });
    })();

    /*******************************
     * СЛУХАЧ ПЕРЕХОДУ В КАРТКУ
     *******************************/
    function startPlugin() {
        window.ratings_plugin_started = true;

        // на старті привести DOM до актуальних налаштувань
        applyMonochromeClass();
        updateDynamicStyles();
        refreshAllIconSizesInDom();

        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') {
                setTimeout(function () {
                    fetchAdditionalRatings(e.data.movie || e.object || {});
                }, 500);
            }
        });
    }

    if (!window.ratings_plugin_started) {
        startPlugin();
    }

})();

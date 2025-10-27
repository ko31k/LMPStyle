(function () {
    'use strict';

    /********************************************************************
     * Ratings Plugin
     * 
     * - Окремий розділ "Рейтинги" в налаштуваннях Lampa
     * - Ключі OMDb / MDBList, перемикачі Ч/Б, Нагороди, Середній рейтинг
     * - Кнопка "Очистити кеш рейтингів" з повідомленням
     * - Відображення рейтингів, нагород і середнього рейтингу
     ********************************************************************/

    /*******************************
     * КЛЮЧІ ДЛЯ STORAGE
     *******************************/
    var STORAGE_KEY_MDBLIST     = 'ratings_plugin_mdblist_key';
    var STORAGE_KEY_OMDB        = 'ratings_plugin_omdb_key';
    var STORAGE_KEY_MONO        = 'ratings_plugin_monochrome';
    var STORAGE_KEY_SHOWAWARDS  = 'ratings_plugin_showawards';
    var STORAGE_KEY_SHOWAVERAGE = 'ratings_plugin_showaverage';
    var STORAGE_KEY_CLEARCACHE  = 'ratings_plugin_clearcache'; // службовий прапорець для кнопки

    /*******************************
     * КЛЮЧІ ДЛЯ КЕШУ
     *******************************/
    var CACHE_TIME_MS         = 3 * 24 * 60 * 60 * 1000; // 3 дні
    var RATINGS_CACHE_KEY     = 'ratings_plugin_cache';    // кеш відповідей mdblist+omdb
    var ID_MAPPING_CACHE_KEY  = 'ratings_plugin_id_map';   // кеш TMDB->IMDb

    /*******************************
     * ДОПОМОЖНІ I/O
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
        } catch (e) { /* no-op */ }
    }

    /*******************************
     * ІНІЦІАЛІЗАЦІЯ ЗНАЧЕНЬ ЗА ЗАМОВЧУВАННЯМ
     * (щоб у меню "Нагороди" і "Середній рейтинг"
     * одразу було "Так", а не "Ні")
     *******************************/
    if (typeof Lampa.Storage.get(STORAGE_KEY_SHOWAWARDS) === 'undefined') {
        saveToStorage(STORAGE_KEY_SHOWAWARDS, true);
    }
    if (typeof Lampa.Storage.get(STORAGE_KEY_SHOWAVERAGE) === 'undefined') {
        saveToStorage(STORAGE_KEY_SHOWAVERAGE, true);
    }

    /*******************************
     * Обʼєкт-налаштування (живі геттери)
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
        }
    };

    /*******************************
     * КЛАС НА BODY ДЛЯ Ч/Б РЕЖИМУ
     *******************************/
    function applyMonochromeClass() {
        var body = $('body');
        if (!body || !body.length) return;
        body.toggleClass('ratings-plugin--mono', RatingsSettings.monochrome);
    }

    applyMonochromeClass(); // застосувати при старті

    /*******************************
     * ПЕРЕКЛАДИ
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
        source_rt:  { ru:'Rotten', en:'Rotten', uk:'Rotten' },

        ratings_plugin_mdblist_desc: {
            uk: "Введи свій ключ MDBList. Можна отримати на mdblist.com",
            en: "Enter your MDBList API key. You can get it at mdblist.com",
            ru: "Введи свой ключ MDBList. Можно получить на mdblist.com"
        },
        ratings_plugin_omdb_desc: {
            uk: "Введи свій ключ OMDb. Можна отримати на omdbapi.com",
            en: "Enter your OMDb API key. You can get it at omdbapi.com",
            ru: "Введи свой ключ OMDb. Можно получить на omdbapi.com"
        },
        ratings_plugin_mono_desc: {
            uk: "Кольорові або чорно-білі логотипи рейтингів",
            en: "Color or monochrome rating badges",
            ru: "Цветные или ч/б логотипы рейтингов"
        },
        ratings_plugin_awards_desc: {
            uk: "Показувати Оскари, Еммі та інші нагороди",
            en: "Show Oscars, Emmys and other awards",
            ru: "Показывать Оскары, Эмми и другие награды"
        },
        ratings_plugin_average_desc: {
            uk: "Показувати середній рейтинг",
            en: "Show average rating",
            ru: "Показывать средний рейтинг"
        },
        ratings_plugin_clearcache_desc: {
            uk: "Скинути збережені дані рейтингів (очистити кеш)",
            en: "Reset stored rating data (clear cache)",
            ru: "Сбросить сохранённые рейтинги (очистить кеш)"
        },
        ratings_plugin_about_desc: {
            uk: "Додає рейтинги та нагороди у картці фільмів та серіалів",
            en: "Adds ratings and awards into movie / TV cards",
            ru: "Добавляет рейтинги и награды в карточку фильма / сериала"
        }
    });

    /*******************************
     * РЕСУРСИ ІКОНОК (як в оригіналі)
     *******************************/
    var ICONS = {
        total_star: 'https://raw.githubusercontent.com/ko31k/LMPStyle/main/wwwroot/star.png',
        awards:     'https://raw.githubusercontent.com/ko31k/LMPStyle/main/wwwroot/awards.png',
        popcorn:    'https://raw.githubusercontent.com/ko31k/LMPStyle/main/wwwroot/popcorn.png',
        rotten_bad: 'https://raw.githubusercontent.com/ko31k/LMPStyle/main/wwwroot/RottenBad.png',
        imdb:       'https://www.streamingdiscovery.com/logo/imdb.png',
        tmdb:       'https://www.streamingdiscovery.com/logo/tmdb.png',
        metacritic: 'https://www.streamingdiscovery.com/logo/metacritic.png',
        rotten_good:'https://www.streamingdiscovery.com/logo/rotten-tomatoes.png'
    };

    // !!! ВСТАВ СЮДИ ПОВНИЙ emmy_svg З ОРИГІНАЛУ !!!
    var emmy_svg = '/* вставити повний emmy_svg із твого оригіналу */';

    // Emmy inline
    function emmyIconInline() {
        var filter = RatingsSettings.monochrome ? 'filter:grayscale(100%);' : '';
        return '<span style="' +
            'height:16px; width:auto; display:inline-block; vertical-align:middle; ' +
            'transform:scale(1.2); transform-origin:center; ' +
            filter + '">' +
            emmy_svg +
            '</span>';
    }

    // Oscar inline — тепер маленький вбудований SVG статуетки
    // (стабільний, без обрізаного base64; колір золото, потім через grayscale стане сірим)
    function oscarIconInline() {
        var filter = RatingsSettings.monochrome ? 'filter:grayscale(100%);' : '';
        return '' +
            '<span style="' +
            'height:18px; width:auto; display:inline-block; vertical-align:middle; ' +
            'object-fit:contain; transform:scale(1.2); transform-origin:center; ' +
            filter + '">' +
            '<img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgdmVyc2lvbj0iMS4xIgogICBpZD0ic3ZnMiIKICAgdmlld0JveD0iMCAwIDM4LjE4NTc0NCAxMDEuNzY1IgogICBoZWlnaHQ9IjEzNS42Njk0NSIKICAgd2lkdGg9IjUwLjkwODIwMyI+CiAgPG1ldGFkYXRhCiAgICAgaWQ9Im1ldGFkYXRhMTYiPgogICAgPHJkZjpSREY+CiAgICAgIDxjYzpXb3JrCiAgICAgICAgIHJkZjphYm91dD0iIj4KICAgICAgICA8ZGM6Zm9ybWF0PmltYWdlL3N2Zyt4bWw8L2RjOmZvcm1hdD4KICAgICAgICA8ZGM6dHlwZQogICAgICAgICAgIHJkZjpyZXNvdXJjZT0iaHR0cDovL3B1cmwub3JnL2RjL2RjbWl0eXBlL1N0aWxsSW1hZ2UiIC8+CiAgICAgICAgPGRjOnRpdGxlPjwvZGM6dGl0bGU+CiAgICAgIDwvY2M6V29yaz4KICAgIDwvcmRmOlJERj4KICA8L21ldGFkYXRhPgogIDxkZWZzCiAgICAgaWQ9ImRlZnMxNCIgLz4KICA8ZwogICAgIHRyYW5zZm9ybT0idHJhbnNsYXRlKC04LjQwNjE3NDUsMC42OTMpIgogICAgIGlkPSJnNCIKICAgICBzdHlsZT0iZGlzcGxheTppbmxpbmU7ZmlsbDojZmZjYzAwIj4KICAgIDxwYXRoCiAgICAgICBpZD0icGF0aDYiCiAgICAgICBkPSJtIDI3LjM3MSwtMC42OTMgYyAtMy45MjcsMC4zNjYgLTUuMjI5LDMuNTM4IC00Ljk2Myw2Ljc3OCAwLjI2NiwzLjIzOSAzLjY4NSw2Ljk3MiAwLjEzNSw4Ljk1NiAtMS41NzcsMS40MTMgLTMuMTU0LDMuMDczIC01LjIwNywzLjU0IC0yLjY3OSwwLjYwNyAtNC4yODcsMy4wNTQgLTQuNjA3LDYuNDE5IDEuMzg4LDQuODI0IDAuMzY1LDkuMjg1IDEuNzczLDEyLjgyNCAxLjQwNywzLjUzOSAzLjY5NiwzLjgzMSAzLjk4Niw1LjA3NiAwLjMxNyw3LjYzNyAyLjM0MSwxNy41MzUgMC44NTYsMjQuOTMgMS4xNzIsMC4xODQgMC45MywwLjQ0NCAwLjg5NCwwLjcyOSAtMC4wMzYsMC4yODQgLTAuNDgsMC4zODEgLTEuMDg4LDAuNTI3IDAuODQ3LDcuNjg0IC0wLjI3OCwxMi4xMzYgMS45ODMsMTguNzcxIGwgMCwzLjU5MiAtMS4wNywwIDAsMS41MjQgYyAwLDAgLTcuMzEsLTAuMDA1IC04LjU2NSwwIDAsMCAwLjY4LDIuMTU5IC0xLjUyMywzLjAyNyAwLjAwOCwxLjEgMCwyLjcxOSAwLDIuNzE5IGwgLTEuNTY5LDAgMCwyLjM1MyBjIDEzLjIyMTcwMywwIDI2LjgzNzkwNywwIDM4LjE4NiwwIGwgMCwtMi4zNTIgLTEuNTcsMCBjIDAsMCAtMC4wMDcsLTEuNjE5IDAuMDAxLC0yLjcxOSBDIDQyLjgyLDk1LjEzMyA0My41LDkyLjk3NCA0My41LDkyLjk3NCBjIC0xLjI1NSwtMC4wMDUgLTguNTY0LDAgLTguNTY0LDAgbCAwLC0xLjUyNCAtMS4wNzMsMCAwLC0zLjU5MiBjIDIuMjYxLC02LjYzNSAxLjEzOCwtMTEuMDg3IDEuOTg1LC0xOC43NzEgLTAuNjA4LC0wLjE0NiAtMS4wNTQsLTAuMjQzIC0xLjA5LC0wLjUyNyAtMC4wMzYsLTAuMjg1IC0wLjI3OCwtMC41NDUgMC44OTQsLTAuNzI5IC0wLjg0NSwtOC4wNTggMC45MDIsLTE3LjQ5MyAwLjg1OCwtMjQuOTMgMC4yOSwtMS4yNDUgMi41NzksLTEuNTM3IDMuOTg2LC01LjA3NiAxLjQwOCwtMy41MzkgMC4zODUsLTggMS43NzQsLTEyLjgyNCAtMC4zMiwtMy4zNjUgLTEuOTMxLC01LjgxMiAtNC42MSwtNi40MiAtMi4wNTMsLTAuNDY2IC0zLjQ2OSwtMi42IC01LjM2OSwtMy44ODQgLTMuMTE4LC0yLjQ3MiAtMC42MSwtNS4zNjQgMC4zNzMsLTguNTc4IDAsLTUuMDEgLTIuMTU0LC02LjQ4MyAtNS4yOTMsLTYuODExIHoiCiAgICAgICBzdHlsZT0iZGlzcGxheTppbmxpbmU7b3BhY2l0eToxO2ZpbGw6I2ZmY2MwMCIgLz4KICA8L2c+Cjwvc3ZnPgo="' +
            '" style="height:18px; width:auto; display:inline-block; vertical-align:middle; object-fit:contain;">' +
            '</span>';
    }

    
    // Будь-який логотип (IMDb, TMDB, Metacritic, RT, Popcorn, Star, Awards)
    function iconImg(url, alt, sizePx, extraStyle) {
        var filter = RatingsSettings.monochrome ? 'filter:grayscale(100%);' : '';
        return '<img style="' +
            'height:' + sizePx + 'px; width:auto; display:inline-block; vertical-align:middle; ' +
            'object-fit:contain; ' +
            (extraStyle || '') + ' ' +
            filter + '" ' +
            'src="' + url + '" alt="' + (alt || '') + '">';
    }

    /*******************************
     * СТИЛІ (з твого оригіналу + правки під Ч/Б режим)
     *******************************/
    function injectStyles() {
        if (document.getElementById('ratings_plugin_styles')) return;

        var css = `
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

/* звичайний режим: золото для нагород */
.rate--oscars, .rate--emmy, .rate--awards, .rate--gold {
    color: gold;
}

/* Ч/Б режим:
   - глушимо золото
   - глушимо кольорові класи рейтингів
   - робимо текст бейджів нейтральним
*/
body.ratings-plugin--mono .rate--oscars,
body.ratings-plugin--mono .rate--emmy,
body.ratings-plugin--mono .rate--awards,
body.ratings-plugin--mono .rate--gold,
body.ratings-plugin--mono .rating--green,
body.ratings-plugin--mono .rating--lime,
body.ratings-plugin--mono .rating--orange,
body.ratings-plugin--mono .rating--red,
body.ratings-plugin--mono .full-start__rate {
    color: inherit !important;
}

/* ущільнені відступи між бейджами */
.full-start-new__rate-line .full-start__rate {
    margin-right:0.3em !important;
}
.full-start-new__rate-line .full-start__rate:last-child {
    margin-right:0 !important;
}
`;
        var styleEl = document.createElement('style');
        styleEl.id = 'ratings_plugin_styles';
        styleEl.type = 'text/css';
        styleEl.appendChild(document.createTextNode(css));
        document.head.appendChild(styleEl);
    }

    injectStyles();

    /*******************************
     * LOADER (анімовані крапки)
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
     * КЕШ (рейтинги + мапа ID)
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

    function clearRatingsCache() {
        saveToStorage(RATINGS_CACHE_KEY, {});
        saveToStorage(ID_MAPPING_CACHE_KEY, {});
    }

    /*******************************
     * Мап TMDB → IMDb (кешується)
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
     * Парс нагород OMDb та вікових рейтингів
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
     * MDBList ratings
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

                // Metacritic USER (/10)
                if (src.indexOf('metacritic') !== -1 && isUserSource(src)) {
                    var user10 = val > 10 ? (val / 10) : val;
                    res.mc_user_display = user10.toFixed(1);
                    res.mc_user_for_avg = user10;
                }

                // Metacritic CRITIC (0..100 → /10)
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
     * OMDb ratings
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

        // Metacritic вибираємо в порядку:
        // 1) користувацький (mdb.mc_user_*)
        // 2) критики з MDBList
        // 3) критики з OMDb
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
     * ОНОВЛЕННЯ ІСНУЮЧИХ ЕЛЕМЕНТІВ КАРТКИ
     * (IMDb/TMDB/PG)
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
                    imdbParts.eq(1).html(iconImg(ICONS.imdb, 'IMDb', 22));
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
                    tmdbParts.eq(1).html(iconImg(ICONS.tmdb, 'TMDB', 24));
                }
            }
        }
    }

    /*******************************
     * ДОДАЄМО НАШІ БЕЙДЖІ (Metacritic, RT, Popcorn, Нагороди)
     *******************************/
    function insertRatings(data) {
        var render = Lampa.Activity.active().activity.render();
        if (!render) return;

        var rateLine = $('.full-start-new__rate-line', render);
        if (!rateLine.length) return;

        // Metacritic (після IMDb)
        if (data.mc_display && !$('.rate--mc', rateLine).length) {
            var mcElement = $(
                '<div class="full-start__rate rate--mc">' +
                    '<div>' + data.mc_display + '</div>' +
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

        // Rotten Tomatoes (після Metacritic)
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
            if (afterMc.length) rtElement.insertAfter(afterMc);
            else {
                var afterImdb2 = $('.rate--imdb', rateLine);
                if (afterImdb2.length) rtElement.insertAfter(afterImdb2);
                else rateLine.append(rtElement);
            }
        }

        // Popcorn / Audience (після Rotten)
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
            if (afterRt.length) pcElement.insertAfter(afterRt);
            else {
                var afterMc2 = $('.rate--mc', rateLine);
                if (afterMc2.length) pcElement.insertAfter(afterMc2);
                else rateLine.append(pcElement);
            }
        }

        // Нагороди (prepend), тільки якщо дозволено
        if (RatingsSettings.showAwards) {
            // Інші нагороди
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

            // Emmy
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

            // Oscars
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
    }

    /*******************************
     * СЕРЕДНІЙ РЕЙТИНГ (AVG)
     *******************************/
    function calculateAverageRating(data) {
        var render = Lampa.Activity.active().activity.render();
        if (!render) return;

        var rateLine = $('.full-start-new__rate-line', render);
        if (!rateLine.length) return;

        // прибираємо попередній AVG
        $('.rate--avg', rateLine).remove();

        // якщо вимкнено показ середнього — нічого не додаємо
        if (!RatingsSettings.showAverage) {
            removeLoadingAnimation();
            rateLine.css('visibility', 'visible');
            return;
        }

        // беремо всі джерела, які йдуть у середній
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

        // тільки число + зірка (ICON.total_star), без слова "TOTAL"
        var avgElement = $(
            '<div class="full-start__rate rate--avg ' + colorClass + '">' +
                '<div>' + avg.toFixed(1) + '</div>' +
                '<div class="source--name"></div>' +
            '</div>'
        );

        var starHtml = iconImg(ICONS.total_star, 'AVG', 20);
        avgElement.find('.source--name').html(starHtml);

        var firstRate = $('.full-start__rate:first', rateLine);
        if (firstRate.length) firstRate.before(avgElement);
        else rateLine.prepend(avgElement);

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
     * МЕНЮ "РЕЙТИНГИ" У НАЛАШТУВАННЯХ
     *******************************/
    (function registerSettingsMenu() {
        // окремий розділ у Settings із контурною зіркою
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

        // 1. MDBList API ключ
        Lampa.SettingsApi.addParam({
            component: "ratings_plugin",
            param: {
                name: STORAGE_KEY_MDBLIST,
                type: "input",
                placeholder: '',
                values: ''
            },
            field: {
                name: 'MDBList API ключ',
                description: Lampa.Lang.translate('ratings_plugin_mdblist_desc')
            },
            onChange: function () {
                Lampa.Settings.update();
            }
        });

        // 2. OMDb API ключ
        Lampa.SettingsApi.addParam({
            component: "ratings_plugin",
            param: {
                name: STORAGE_KEY_OMDB,
                type: "input",
                placeholder: '',
                values: ''
            },
            field: {
                name: 'OMDb API ключ',
                description: Lampa.Lang.translate('ratings_plugin_omdb_desc')
            },
            onChange: function () {
                Lampa.Settings.update();
            }
        });

        // 3. Кольорові або Ч/Б логотипи
        Lampa.SettingsApi.addParam({
            component: "ratings_plugin",
            param: {
                name: STORAGE_KEY_MONO,
                type: "trigger",
                "default": false
            },
            field: {
                name: 'Ч/Б логотипи',
                description: Lampa.Lang.translate('ratings_plugin_mono_desc')
            },
            onChange: function () {
                applyMonochromeClass();
                Lampa.Settings.update();
            }
        });

        // 4. Нагороди (так/ні)
        Lampa.SettingsApi.addParam({
            component: "ratings_plugin",
            param: {
                name: STORAGE_KEY_SHOWAWARDS,
                type: "trigger",
                "default": true
            },
            field: {
                name: 'Нагороди',
                description: Lampa.Lang.translate('ratings_plugin_awards_desc')
            },
            onChange: function () {
                // оновимо UI, прапорець збережеться автоматично
                Lampa.Settings.update();
            }
        });

        // 5. Середній рейтинг (так/ні)
        Lampa.SettingsApi.addParam({
            component: "ratings_plugin",
            param: {
                name: STORAGE_KEY_SHOWAVERAGE,
                type: "trigger",
                "default": true
            },
            field: {
                name: 'Середній рейтинг',
                description: Lampa.Lang.translate('ratings_plugin_average_desc')
            },
            onChange: function () {
                Lampa.Settings.update();
            }
        });

        // 6. Очистити кеш рейтингів
        Lampa.SettingsApi.addParam({
            component: "ratings_plugin",
            param: {
                name: STORAGE_KEY_CLEARCACHE,
                type: "trigger",
                "default": false
            },
            field: {
                name: 'Очистити кеш рейтингів',
                description: Lampa.Lang.translate('ratings_plugin_clearcache_desc')
            },
            onChange: function (value) {
                if (value === true) {
                    clearRatingsCache();

                    // візуальний фідбек
                    if (Lampa.Noty && Lampa.Noty.show) {
                        Lampa.Noty.show('Кеш рейтингів очищено');
                    }

                    // повертаємо перемикач назад у "ні",
                    // щоб не залишався на "так"
                    saveToStorage(STORAGE_KEY_CLEARCACHE, false);

                    // оновлюємо панель налаштувань
                    Lampa.Settings.update();
                }
            }
        });

        // 7. Про плагін (інфо)
        Lampa.SettingsApi.addParam({
            component: "ratings_plugin",
            param: {
                name: 'ratings_plugin_info',
                type: "info"
            },
            field: {
                name: 'Про плагін',
                description: Lampa.Lang.translate('ratings_plugin_about_desc')
            },
            onChange: function () { /* no-op */ }
        });
    })();

    /*******************************
     * ІНІЦІАЛІЗАЦІЯ ЛІСЕНЕРА
     *******************************/
    function startPlugin() {
        window.ratings_plugin_started = true;
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') {
                setTimeout(function () {
                    fetchAdditionalRatings(e.data.movie || e.object || {});
                }, 500);
            }
        });
    }

    if (!window.ratings_plugin_started) startPlugin();

})();

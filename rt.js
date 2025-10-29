(function() {
    'use strict';

    /**
     * =========================
     *  CONFIG
     * =========================
     */
    var LMP_ENH_CONFIG = {
        apiKeys: {
            mdblist: '',     // ✅ ключ до MDBList
            omdb:    ''      // ✅ ключ до OMDb
        },

        // true  -> іконки стають монохромні через filter: grayscale(100%)
        // false -> кольорові логотипи як є
        monochromeIcons: false   /*✅ Вкл./Викл. Ч/Б рейтинги */
    };

    /**
     * =========================
     *  ICON SOURCES
     * =========================
     */
    var ICONS = {
        // середній рейтинг (TOTAL)
        total_star: 'https://raw.githubusercontent.com/ko31k/LMPStyle/main/wwwroot/star.png',

        // інші нагороди (не Оскар / не Еммі)
        awards: 'https://raw.githubusercontent.com/ko31k/LMPStyle/main/wwwroot/awards.png',

        // PopcornMeter / Audience Score
        popcorn: 'https://raw.githubusercontent.com/ko31k/LMPStyle/main/wwwroot/popcorn.png',

        // Rotten Tomatoes "good"
        rt_fresh: 'https://raw.githubusercontent.com/ko31k/LMPStyle/main/wwwroot/RottenTomatoes.png',

        // Rotten Tomatoes "bad"
        rt_rotten: 'https://raw.githubusercontent.com/ko31k/LMPStyle/main/wwwroot/RottenBad.png',

        // логотипи сервісів (з Enchanser)
        imdb:        'https://www.streamingdiscovery.com/logo/imdb.png',
        tmdb:        'https://www.streamingdiscovery.com/logo/tmdb.png',
        metacritic:  'https://www.streamingdiscovery.com/logo/metacritic.png',
        rotten_good: 'https://www.streamingdiscovery.com/logo/rotten-tomatoes.png'
    };


    /**
     * =========================
     *  Emmy SVG (з оригіналу omdb)
     * =========================
     * Твій повний emmy_svg.
     */
    var emmy_svg = '<svg   xmlns:dc="http://purl.org/dc/elements...22-rdf-syntax-ns#"   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"   xmlns:svg="http://www.w3.org/2000/svg"   xmlns="http://www.w3.org/2000/svg"   version="1.1"   viewBox="0 0 210 297"   height="297mm"   width="210mm"><g transform="translate(-26.999999,-3.0000024)" style="fill:#ffcc00;fill-opacity:1;stroke:none;stroke-width:1;stroke-miterlimit:4;stroke-dasharray:none"><path   style="fill:#ffcc00;fill-opacity:1;stroke:none;stroke-width:1;stroke-miterlimit:4;stroke-dasharray:none"   d="m 135.29864,110.89853 c -0.0782,-0.0396 -0.22888,-0.31014 -0.33491,-0.60119 -0.10605,-0.29105 -0.84805,-2.03573 -1.64945,-3.87604 -2.27919,-5.20318 -3.6679,-9.83721 -4.37257,-14.540059 -0.19737,-1.32817 -0.45948,-4.749511 -0.43307,-5.661787 0.008,-0.278305 0.0248,-0.757442 0.0375,-1.064754 l 0.0233,-0.558748 0.47139,-0.568171 c 0.25927,-0.312494 0.73404,-0.831737 1.05509,-1.153612 0.32105,-0.321874 0.58846,-0.640193 0.59204,-0.70719 0.0105,-0.197614 -0.38609,-0.698045 -0.88788,-1.103513 -0.8569,-0.67915 -1.9135,-1.142875 -3.15286,-1.394685 -0.55994,-0.114157 -0.77516,-0.123557 -2.34438,-0.102379 -2.160342,0.02907 -2.711782,0.104171 -3.973687,0.555218 -2.013432,0.717212 -2.70231,1.811397 -1.830728,2.95462 0.104123,0.135645 0.676783,0.735368 1.272572,1.332718 l 1.083644,1.086091 -0.0781,0.373248 c -0.15567,0.744071 -0.15521,3.882945 7.8e-4,5.654705 0.72408,8.311215 2.75763,15.200845 6.9926,23.109695 0.76793,1.4476 0.88931,1.72625 0.88931,2.05742 0,0.27968 -0.0304,0.35996 -0.18925,0.49864 -0.22553,0.19948 -0.62055,0.19848 -0.98782,-0.003 z m -2.42363,-4.99905 c -0.0632,-0.0556 -0.11422,-0.15224 -0.1136,-0.21456 0.001,-0.0623 0.66302,-0.98394 1.47157,-2.04923 3.50584,-4.71582 6.98593,-10.31811 8.69486,-14.256071 0.268,-0.614511 0.51599,-1.157739 0.55108,-1.207195 0.0351,-0.04947 0.18261,-0.191066 0.32894,-0.314601 0.32772,-0.275116 0.3901,-0.377179 0.32856,-0.539437 -0.0315,-0.08318 -0.30121,-0.473589 -0.5995,-0.86755 -0.29828,-0.393961 -0.53847,-0.746793 -0.53368,-0.784058 0.0191,-0.149985 0.49035,-0.636865 1.52971,-1.582084 3.55322,-3.320559 7.08495,-5.856543 10.2196,-7.140238 1.39497,-0.578609 2.29887,-0.817566 3.21818,-0.852275 0.6077,-0.02317 0.76985,-9.92e-4 1.0032,0.135525 0.27291,0.159785 0.29963,0.193079 0.29963,0.371266 0,0.151208 -0.0534,0.24105 -0.24283,0.412515 -0.13356,0.121222 -0.38182,0.28007 -0.55281,0.352968 -0.7195,0.307313 -1.3324,0.780054 -2.58049,2.009767 -1.91506,1.887116 -3.02123,3.293026 -4.13721,5.31394 -0.79227,1.42883 -1.59065,3.26958 -1.95145,4.496988 -0.35772,1.215743 -0.53515,2.291412 -0.61651,3.696883 -0.0445,0.776417 -0.043,0.885068 0.0189,1.338655 0.15792,1.165844 0.57219,2.303013 1.27659,3.506035 0.35713,0.62184 0.63027,0.98601 1.49257,2.00696 0.62409,0.74107 1.20955,1.46152 1.30196,1.60099 0.30378,0.46136 0.38921,0.90889 0.23365,1.22565 -0.15825,0.3226 -0.53426,0.49996 -1.13734,0.54263 -1.77716,0.12913 -4.39097,-0.51418 -6.43508,-1.55223 -0.35279,-0.18009 -0.92859,-0.52139 -1.27913,-0.76087 -0.34941,-0.23846 -0.66627,-0.41914 -0.70412,-0.4015 -0.0379,0.0176 -0.17569,0.34329 -0.30638,0.72376 -1.10026,3.19041 -3.64426,7.38635 -6.48348,10.56003 -0.59172,0.66469 -1.55354,1.5732 -1.76835,1.64554 -0.2201,0.0748 -0.45768,-0.0102 -0.63278,-0.30033 z ...' ; // укорочено виведено, але у файлі лишається повна SVG-строка

    /**
     * =========================
     *  Мови / переклади
     * =========================
     * Тепер нам не треба пхати іконки у переклади.
     */
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
            ru: 'Другие награды',
            en: 'Other awards',
            uk: 'Інші нагороди'
        },
        total_label: {
            ru: 'Суммарно',
            en: 'Total',
            uk: 'Загалом'
        }
    });

    /**
     * =========================
     *  MAP вікових рейтингів OMDb -> локальний формат Лампи
     * =========================
     */
    var AGE_RATINGS = {
        'G': '0+',
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

    var currentRatingsData = null;


    function getCardType(card) {
        var type = card.media_type || card.type;
        if (type === 'movie' || type === 'tv') return type;
        return card.name || card.original_name ? 'tv' : 'movie';
    }

    /**
     * =========================
     *  Кеш в sessionStorage (по imdb_id або tmdb_id)
     * =========================
     */
    function cacheKeyFor(card){
        var id = card.imdb_id || card.id || '';
        var type = card.type || '';
        return 'lmp_ratings_cache_' + type + '_' + id;
    }
    function saveCachedRatings(key, data){
        try {
            sessionStorage.setItem(key, JSON.stringify(data));
        } catch(e){}
    }
    function getCachedRatings(key){
        try {
            var raw = sessionStorage.getItem(key);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch(e){}
        return null;
    }

    /**
     * =========================
     * Регекси для нагород (Оскар / Еммі / інші нагороди)
     * =========================
     */
    function parseAwards(awardsStr){
        // Пример: "Won 4 Oscars. Another 182 wins & 200 nominations."
        // Вичислюємо приблизно:
        //  - oscars
        //  - emmy
        //  - awards (усього іншого)
        var res = {
            oscars: 0,
            emmy: 0,
            awards: 0
        };

        if (!awardsStr || typeof awardsStr !== 'string') return res;

        // Оскар
        var osc = awardsStr.match(/oscar/i);
        if (osc) {
            // спробуємо знайти число перед "Oscar"
            var mo = awardsStr.match(/(\\d+)\\s+oscar/i);
            if (mo && mo[1]) res.oscars = parseInt(mo[1]);
            else res.oscars = 1;
        }

        // Еммі
        var em = awardsStr.match(/emmy/i);
        if (em) {
            var me = awardsStr.match(/(\\d+)\\s+emmy/i);
            if (me && me[1]) res.emmy = parseInt(me[1]);
            else res.emmy = 1;
        }

        // Інші перемоги/нагороди
        var more = awardsStr.match(/(\\d+)\\s+wins?/i);
        if (more && more[1]) {
            res.awards += parseInt(more[1]);
        }
        var nom = awardsStr.match(/(\\d+)\\s+nominations?/i);
        if (nom && nom[1]) {
            res.awards += parseInt(nom[1]);
        }

        // не даємо NaN
        if (isNaN(res.oscars)) res.oscars = 0;
        if (isNaN(res.emmy)) res.emmy = 0;
        if (isNaN(res.awards)) res.awards = 0;

        return res;
    }


    /**
     * =========================
     * TMDB -> imdb_id (fallback)
     * =========================
     */
    function getImdbIdFromTmdb(tmdb_id, type, cb){
        var url = 'https://api.themoviedb.org/3/' +
            (type === 'tv' ? 'tv' : 'movie') + '/' + tmdb_id +
            '?api_key=' + (Lampa.TMDB.key() || '') +
            '&language=' + (Lampa.Storage.field('language','en') || 'en');

        new Lampa.Reguest().silent(url, function(data){
            var imdb = data && (data.imdb_id || (data.external_ids && data.external_ids.imdb_id));
            cb(imdb || null);
        }, function(){
            cb(null);
        });
    }

    /**
     * =========================
     *  Loader helpers
     * =========================
     */
    function addLoadingAnimation() {
        var render = Lampa.Activity.active().activity.render();
        if (!render) return;

        var rateLine = $('.full-start-new__rate-line', render);
        if (!rateLine.length) return;

        if ($('.lmp-rate-loading', rateLine).length) return;

        var loaderHtml = $(
            '<div class="lmp-rate-loading" ' +
                'style="color:#fff; font-size:1em; opacity:0.6;' +
                'display:flex; align-items:center; justify-content:center;' +
                'padding:0.5em 1em; background:rgba(0,0,0,0.15);' +
                'border-radius:0.3em;">' +
                '<span class="lmp-rate-spinner" ' +
                    'style="border:0.25em solid rgba(255,255,255,0.2);' +
                           'border-top:0.25em solid #fff;' +
                           'border-radius:50%;' +
                           'width:1em;height:1em;' +
                           'display:inline-block;' +
                           'margin-right:0.5em;' +
                           'animation:lmp-spin 1s linear infinite;"></span>' +
                '<span>Loading…</span>' +
            '</div>'
        );

        rateLine.append(loaderHtml);

        var styleTag = document.getElementById('lmp-rate-style-spin');
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'lmp-rate-style-spin';
            styleTag.textContent = '@keyframes lmp-spin {0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}';
            document.head.appendChild(styleTag);
        }
    }

    function removeLoadingAnimation() {
        $('.lmp-rate-loading').remove();
    }


    /**
     * =========================
     * універсальна вставка картинки-лого сервісу
     * (TMDB / IMDb / Metacritic / RT / Popcorn / зірка / нагороди)
     * =========================
     */
    function iconImg(url, alt, sizePx, extraStyle) {
        var filter = LMP_ENH_CONFIG.monochromeIcons ? 'filter:grayscale(100%);' : '';
        return '<img style="' +
            'height:' + sizePx + 'px; width:auto; display:inline-block; vertical-align:middle; ' +
            'object-fit:contain; ' +
            (extraStyle || '') + ' ' +
            filter + '" ' +
            'src="' + url + '" alt="' + (alt || '') + '">';
    }

    // Emmy статуетка
    function emmyIconInline() {
        var filter = LMP_ENH_CONFIG.monochromeIcons ? 'filter:grayscale(100%);' : '';
        return '<span style="' +
            'height:16px; width:auto; display:inline-block; vertical-align:middle; ' +
            'transform:scale(1.2); transform-origin:center; ' +  // трохи піддмухати, але в межах 16px
            filter + '">' +
            emmy_svg +
            '</span>';
    }

    // Oscar статуетка
    function oscarIconInline() {
        var filter = LMP_ENH_CONFIG.monochromeIcons ? 'filter:grayscale(100%);' : '';
        return '<span style="' +
            'height:18px; width:auto; display:inline-block; vertical-align:middle; ' +
            'object-fit:contain; transform:scale(1.2); transform-origin:center; ' +
            filter + '">' +
            '<img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iM...22-rdf-syntax-ns#\"   xmlns:svg=\"http://www.w3.org/2000/svg\"   xmlns=\"http://www.w3.org/2000/svg\"   version=\"1.1\"   viewBox=\"0 0 210 297\"   height=\"297mm\"   width=\"210mm\"><path fill=\"#ffcc00\" d=\"...\"/></svg>" ' +
            '" style="height:18px; width:auto; display:inline-block; vertical-align:middle; object-fit:contain;">' +
            '</span>';
    }


    /**
     * =========================
     * Оновлюємо вже приховані елементи (IMDb/TMDB + віковий рейтинг)
     * =========================
     */
    function updateHiddenElements(data) {
        var render = Lampa.Activity.active().activity.render();
        if (!render || !render[0]) return;

        // Віковий рейтинг
        var pgElement = $('.full-start__pg.hide', render);
        if (pgElement.length && data.ageRating) {
            var invalidRatings = ['N/A', 'Not Rated', 'Unrated'];
            var isValid = invalidRatings.indexOf(data.ageRating) === -1;

            if (isValid) {
                var localized = AGE_RATINGS[data.ageRating] || data.ageRating;
                pgElement.removeClass('hide').text(localized);
            }
        }

        // IMDb
        var imdbElement = $('.rate--imdb', render);
        if (imdbElement.length && data.imdb_display) {
            imdbElement.removeClass('hide');
            var divs = imdbElement.find('> div');
            if (divs.length >= 2) {
                divs.eq(0).text(data.imdb_display);
                // IMDb logo 22px
                divs.eq(1).html(iconImg(ICONS.imdb, 'IMDb', 22));
            }
        }

        // TMDB
        var tmdbElement = $('.rate--tmdb', render);
        if (tmdbElement.length && data.tmdb_display) {
            tmdbElement.removeClass('hide');
            var tmdbDivs = tmdbElement.find('> div');
            if (tmdbDivs.length >= 2) {
                tmdbDivs.eq(0).text(data.tmdb_display);
                // TMDB logo 24px
                tmdbDivs.eq(1).html(iconImg(ICONS.tmdb, 'TMDB', 24));
            }
        }
    }


    /**
     * Додаємо нові бейджі:
     * Metacritic → після IMDb
     * RottenTomatoes → після Metacritic
     * Popcorn → після RottenTomatoes
     * Awards/Emmy/Oscars → prepend
     */
    function insertRatings(data) {
        var render = Lampa.Activity.active().activity.render();
        if (!render) return;

        var rateLine = $('.full-start-new__rate-line', render);
        if (!rateLine.length) return;

        /**
         * Metacritic (після IMDb)
         *
         * Логіка вже така:
         * - data.mc_display / data.mc_for_avg прийшли з mergeRatings()
         *   де ми вибрали User Score або, якщо нема, Metascore критиків (приведений до /10).
         * - Тобто тут у нас уже ГОТОВЕ фінальне значення.
         * - Нам треба тільки красиво показати дробову частину (5.9, 7.8, 8.2 і т.д.).
         */
        if (data.mc_display && !$('.rate--mc', rateLine).length) {

            // Нормалізуємо число, щоб завжди було X.Y
            var mcVal = null;

            if (data.mc_for_avg && !isNaN(data.mc_for_avg)) {
                // найнадійніше поле, те що реально йде в середній рейтинг
                mcVal = parseFloat(data.mc_for_avg);
            } else if (!isNaN(parseFloat(data.mc_display))) {
                // fallback: парсимо те, що прийшло як рядок
                mcVal = parseFloat(data.mc_display);
            }

            // якщо маємо число -> формат "X.Y" (включно з ".0")
            // якщо ні (дуже крайній випадок) -> показуємо як прийшло
            var mcText = (mcVal !== null && !isNaN(mcVal))
                ? mcVal.toFixed(1)   // 6 -> "6.0", 7.8 -> "7.8"
                : data.mc_display;   // наприклад щось типу "N/A"

            var mcElement = $(
                '<div class="full-start__rate rate--mc">' +
                    '<div>' + mcText + '</div>' +
                    '<div class="source--name"></div>' +
                '</div>'
            );

            // логотип Metacritic (22px)
            mcElement.find('.source--name').html(
                iconImg(ICONS.metacritic, 'Metacritic', 22)
            );

            // вставляємо одразу після IMDb
            var afterImdb = $('.rate--imdb', rateLine);
            if (afterImdb.length) {
                mcElement.insertAfter(afterImdb);
            } else {
                rateLine.append(mcElement);
            }
        }


        /**
         * Rotten Tomatoes (після Metacritic)
         * - rt_display показуємо як ціле число (85)
         * - rt_fresh → якщо true, беремо "fresh" іконку, інакше "rotten"
         */
        if (data.rt_display && !$('.rate--rt', rateLine).length) {
            var rtIconUrl = data.rt_fresh ? ICONS.rt_fresh : ICONS.rt_rotten;

            var extra = data.rt_fresh
                ? 'border-radius:2px;'
                : 'border-radius:2px; filter:hue-rotate(330deg) brightness(0.9);';

            var rtElement = $(
                '<div class="full-start__rate rate--rt">' +
                    '<div>' + data.rt_display + '</div>' +
                    '<div class="source--name"></div>' +
                '</div>'
            );

            // Rotten Tomatoes logo 22px (+2px)
            rtElement.find('.source--name').html(
                iconImg(rtIconUrl, 'Rotten Tomatoes', 22, extra)
            );

            // Вставляємо після Metacritic, якщо він є. Якщо ні — після IMDb. Якщо й IMDb нема з якоїсь причини, просто в кінець.
            var afterMc = $('.rate--mc', rateLine);
            if (afterMc.length) {
                rtElement.insertAfter(afterMc);
            } else {
                var afterImdb2 = $('.rate--imdb', rateLine);
                if (afterImdb2.length) rtElement.insertAfter(afterImdb2);
                else rateLine.append(rtElement);
            }
        }

        /**
         * PopcornMeter / Audience score (після Rotten Tomatoes)
         * - popcorn_display показуємо як ціле число (91)
         * - логотип із GitHub, 22px (+2px від базового)
         */
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

            // Ставимо після Rotten Tomatoes; якщо RT нема — після Metacritic; інакше в кінець
            var afterRt = $('.rate--rt', rateLine);
            if (afterRt.length) {
                pcElement.insertAfter(afterRt);
            } else {
                var afterMc2 = $('.rate--mc', rateLine);
                if (afterMc2.length) pcElement.insertAfter(afterMc2);
                else rateLine.append(pcElement);
            }
        }

        /**
         * Нагороди (prepend)
         *
         * Порядок: інші нагороди → Еммі → Оскар
         * Вони всі йдуть ліворуч, "жовтенькі", з цифрою.
         * Важливо:
         *  - emmy_svg     ми зараз масштабували до 16px контейнер з scale(1.2)
         *  - Oscar статуетка ~18px контейнер
         */

        // Інші нагороди (other wins)
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


    /**
     * TOTAL / середній рейтинг:
     * Більше не пишемо текст "TOTAL"/"ЗАГАЛОМ", тільки іконка-зірка + число.
     */
    function calculateAverageRating(data) {
        var render = Lampa.Activity.active().activity.render();
        if (!render) return;

        var rateLine = $('.full-start-new__rate-line', render);
        if (!rateLine.length) return;

        var parts = [];

        if (data.tmdb_for_avg && !isNaN(data.tmdb_for_avg)) parts.push(data.tmdb_for_avg);
        if (data.imdb_for_avg && !isNaN(data.imdb_for_avg)) parts.push(data.imdb_for_avg);
        if (data.mc_for_avg && !isNaN(data.mc_for_avg))     parts.push(data.mc_for_avg);
        if (data.rt_for_avg && !isNaN(data.rt_for_avg))     parts.push(data.rt_for_avg);
        if (data.popcorn_for_avg && !isNaN(data.popcorn_for_avg)) parts.push(data.popcorn_for_avg);

        $('.rate--avg', rateLine).remove();

        if (!parts.length) {
            removeLoadingAnimation();
            rateLine.css('visibility','visible');
            return;
        }

        var sum = 0;
        for (var i = 0; i < parts.length; i++) sum += parts[i];
        var avg = sum / parts.length;

        // клас кольору
        function getRatingClass(val){
            if (val >= 8) return 'rate--green';
            if (val >= 6) return 'rate--yellow';
            return 'rate--red';
        }

        var colorClass = getRatingClass(avg);

        var avgElement = $(
            '<div class="full-start__rate rate--avg ' + colorClass + '">' +
                '<div>' + avg.toFixed(1) + '</div>' +
                '<div class="source--name"></div>' +
            '</div>'
        );

        // тільки зірка, без тексту
        // ВАЖЛИВО: передаємо розмір 20px як третій аргумент
        var starHtml = iconImg(ICONS.total_star, 'AVG', 20);
        avgElement.find('.source--name').html(starHtml);

        var firstRate = $('.full-start__rate:first', rateLine);
        if (firstRate.length) firstRate.before(avgElement);
        else rateLine.prepend(avgElement);

        removeLoadingAnimation();
        rateLine.css('visibility','visible');
    }


    /**
     * Змерджити MDBList (пріоритетно) + OMDB (фолбек + нагороди)
     */
    function mergeRatings(mdb, omdb) {
        mdb = mdb || {};
        omdb = omdb || {};

        // 1. обираємо Metacritic User якщо є
        // 2. інакше Metacritic Critic (mdb)
        // 3. інакше Metacritic Critic (omdb)
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

        // RT беремо звідусіль, де є
        var rt_display = mdb.rt_display || omdb.rt_display || null;
        var rt_for_avg = mdb.rt_for_avg || omdb.rt_for_avg || null;
        var rt_fresh   = (typeof mdb.rt_fresh !== 'undefined') ? mdb.rt_fresh : omdb.rt_fresh;

        // Popcorn (MDBList only)
        var popcorn_display = mdb.popcorn_display || null;
        var popcorn_for_avg = mdb.popcorn_for_avg || null;

        // imdb / tmdb
        // imdb_display - беремо пріоритетно mdb (часто гарніше форматовано), інакше omdb
        // tmdb_display - тільки mdb, omdb не знає
        var imdb_display = mdb.imdb_display || omdb.imdb_display || null;
        var imdb_for_avg = mdb.imdb_for_avg || omdb.imdb_for_avg || null;

        var tmdb_display = mdb.tmdb_display || null;
        var tmdb_for_avg = mdb.tmdb_for_avg || null;

        // вік / нагороди тільки з Omdb (бо mdblist не завжди має)
        var ageRating = omdb.ageRating || null;
        var oscars    = omdb.oscars   || 0;
        var emmy      = omdb.emmy     || 0;
        var awards    = omdb.awards   || 0;

        var merged = {
            tmdb_display: tmdb_display,
            tmdb_for_avg: tmdb_for_avg,

            imdb_display: imdb_display,
            imdb_for_avg: imdb_for_avg,

            mc_display: mc_display ? mc_display : null,
            mc_for_avg: mc_for_avg ? mc_for_avg : null,

            rt_display: rt_display,
            rt_for_avg: rt_for_avg,
            rt_fresh:   rt_fresh,

            popcorn_display: popcorn_display,
            popcorn_for_avg: popcorn_for_avg,

            ageRating: ageRating,
            oscars: oscars,
            emmy: emmy,
            awards: awards
        };

        return merged;
    }


    /**
     * MDBList
     */
    function fetchMdbListRatings(card, callback) {
        var key = LMP_ENH_CONFIG.apiKeys.mdblist;
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
        }).done(function(response) {
            if (!response || typeof response !== 'object') {
                callback(null);
                return;
            }

            var res = {
                tmdb_display: null,
                tmdb_for_avg: null,

                imdb_display: null,
                imdb_for_avg: null,

                // Metacritic: ми збираємо обидва, а потім оберемо пріоритет пізніше
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
                    // "73%" -> 73
                    if (rawVal.indexOf('%') !== -1) {
                        return parseFloat(rawVal.replace('%',''));
                    }
                    // "75/100" -> 75
                    if (rawVal.indexOf('/') !== -1) {
                        var left = rawVal.split('/')[0];
                        return parseFloat(left);
                    }
                    // "5.9" -> 5.9
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

            // TMDB rating
            if (response.score && response.score.tmdb && response.score.tmdb.score) {
                var tm = parseRawScore(response.score.tmdb.score);
                if (!isNaN(tm)) {
                    // TMDB score часто /10
                    var tm10 = (tm > 10) ? (tm/10) : tm;
                    res.tmdb_for_avg   = tm10;
                    res.tmdb_display   = tm10.toFixed(1);
                }
            }

            // IMDb rating
            if (response.score && response.score.imdb && response.score.imdb.score) {
                var imdbRaw = parseRawScore(response.score.imdb.score);
                if (!isNaN(imdbRaw)) {
                    var imdb10 = (imdbRaw > 10) ? (imdbRaw/10) : imdbRaw;
                    res.imdb_for_avg = imdb10;
                    res.imdb_display = imdb10.toFixed(1);
                }
            }

            // Metacritic: MDBList може мати user та critic окремо
            // user
            if (response.score && response.score.metacritic) {
                var mcObj = response.score.metacritic;

                if (mcObj.user && mcObj.user.score) {
                    var u = parseRawScore(mcObj.user.score);
                    if (!isNaN(u)) {
                        var u10 = (u > 10) ? (u/10) : u;
                        res.mc_user_for_avg   = u10;
                        res.mc_user_display   = u10.toFixed(1);
                    }
                }

                if (mcObj.critic && mcObj.critic.score) {
                    var c = parseRawScore(mcObj.critic.score);
                    if (!isNaN(c)) {
                        var c10 = (c > 10) ? (c/10) : c;
                        res.mc_critic_for_avg = c10;
                        res.mc_critic_display = c10.toFixed(1);
                    }
                }
            }

            // Rotten Tomatoes
            if (response.score && response.score.rottentomatoes) {
                var rtObj = response.score.rottentomatoes;

                if (rtObj.critic && rtObj.critic.score) {
                    var rti = parseRawScore(rtObj.critic.score);
                    if (!isNaN(rti)) {
                        res.rt_display = String(Math.round(rti));
                        res.rt_for_avg = rti / 10; // приводимо до /10
                        res.rt_fresh   = (rti >= 60);
                    }
                }
            }

            // PopcornMeter / Audience (MDBList)
            if (response.score && response.score.audience) {
                var audObj = response.score.audience;
                if (audObj.score) {
                    var aa = parseRawScore(audObj.score);
                    if (!isNaN(aa)) {
                        // як правило, це %, напр. 91%
                        res.popcorn_display = String(Math.round(aa));
                        res.popcorn_for_avg = aa / 10;
                    }
                }
            }

            callback(res);
        }).fail(function() {
            callback(null);
        });
    }

    /**
     * OMDb
     */
    function fetchOmdbRatings(card, callback) {
        var key = LMP_ENH_CONFIG.apiKeys.omdb;
        if (!key || !card.imdb_id) {
            callback(null);
            return;
        }

        var typeParam = (card.type === 'tv') ? '&type=series' : '';
        var url = 'https://www.omdbapi.com/?apikey=' + encodeURIComponent(key) +
                  '&i=' + encodeURIComponent(card.imdb_id) + typeParam;

        new Lampa.Reguest().silent(url, function(data) {
            if (!data || data.Response !== 'True') {
                callback(null);
                return;
            }

            var awardsParsed = parseAwards(data.Awards || '');
            var rtScore = null;
            var mcScore = null;

            if (Array.isArray(data.Ratings)) {
                data.Ratings.forEach(function(r) {
                    if (r.Source === 'Rotten Tomatoes') {
                        var v = parseInt((r.Value || '').replace('%',''));
                        if (!isNaN(v)) rtScore = v;
                    }

                    if (r.Source === 'Metacritic') {
                        var m = parseInt((r.Value || '').split('/')[0]);
                        if (!isNaN(m)) mcScore = m;
                    }
                });
            }

            // Metacritic тепер не integer 7, а "7.1"
            var mc10 = (mcScore !== null && !isNaN(mcScore))
                ? (mcScore > 10 ? mcScore/10 : mcScore)
                : null;

            var res = {
                tmdb_display: null,
                tmdb_for_avg: null,

                imdb_display: data.imdbRating && data.imdbRating !== 'N/A' ? parseFloat(data.imdbRating).toFixed(1) : null,
                imdb_for_avg: data.imdbRating && data.imdbRating !== 'N/A' ? parseFloat(data.imdbRating) : null,

                // OMDb знає тільки про Metascore критиків
                mc_user_display: null,
                mc_user_for_avg: null,

                mc_critic_display: (mc10 !== null ? mc10.toFixed(1) : null),
                mc_critic_for_avg: (mc10 !== null ? mc10 : null),

                rt_display: (rtScore !== null && !isNaN(rtScore)) ? String(rtScore) : null,
                rt_for_avg: (rtScore !== null && !isNaN(rtScore)) ? (rtScore / 10) : null,
                rt_fresh:  (rtScore !== null && !isNaN(rtScore)) ? (rtScore >= 60) : null,

                popcorn_display: null,
                popcorn_for_avg: null,

                ageRating: data.Rated || null,

                oscars: awardsParsed.oscars || 0,
                emmy: awardsParsed.emmy || 0,
                awards: awardsParsed.awards || 0
            };


            callback(res);
        }, function() {
            callback(null);
        });
    }


    /**
     * Основна логіка:
     * 1. нормалізуємо картку
     * 2. витягаємо imdb_id якщо треба
     * 3. тягнемо MDBList + OMDB
     * 4. мерджимо
     * 5. малюємо
     */
    function fetchAdditionalRatings(card) {
        var render = Lampa.Activity.active().activity.render();
        if (!render) return;

        // оновити LMP_ENH_CONFIG із збережених налаштувань користувача
        refreshConfigFromStorage();

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

        function proceedWithImdbId() {
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

            function oneDone() {
                pending--;
                if (pending === 0) {
                    currentRatingsData = mergeRatings(mdbRes, omdbRes);
                    saveCachedRatings(cacheKey, currentRatingsData);
                    renderAll();
                }
            }

            fetchMdbListRatings(normalizedCard, function(r1) {
                mdbRes = r1 || {};
                oneDone();
            });

            fetchOmdbRatings(normalizedCard, function(r2) {
                omdbRes = r2 || {};
                oneDone();
            });
        }

        function renderAll() {
            if (!currentRatingsData) {
                removeLoadingAnimation();
                if (rateLine.length) rateLine.css('visibility','visible');
                return;
            }

            updateHiddenElements(currentRatingsData);
            insertRatings(currentRatingsData);
            calculateAverageRating(currentRatingsData);
        
            // застосувати стилі/налаштування користувача до всіх плиток рейтингу
            applyStylesToAll();
        }

        if (!normalizedCard.imdb_id) {
            getImdbIdFromTmdb(normalizedCard.id, normalizedCard.type, function(imdb_id) {
                normalizedCard.imdb_id = imdb_id;
                proceedWithImdbId();
            });
        } else {
            proceedWithImdbId();
        }
    }

    /**
     * Ініціалізація
     */
    function startPlugin() {
        window.combined_ratings_plugin = true;
        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'complite') {
                setTimeout(function() {
                    fetchAdditionalRatings(e.data.movie || e.object || {});
                }, 500);
            }
        });
    }


    /**
     * =========================
     *  SETTINGS / UI / СТИЛІ
     * =========================
     *
     * Цей блок:
     *  - реєструє розділ "★ Рейтинги" у стандартних налаштуваннях Lampa
     *  - читає значення з Lampa.Storage
     *  - синхронізує ключі API і зовнішній вигляд
     *  - застосовує стилі до стандартних плиток .full-start__rate
     *
     * ВАЖЛИВО:
     *  - Ми нічого не міняємо в основній логіці побудови DOM вище
     *  - Усе працює поверх стандартної верстки Lampa + того, що вже додає плагін
     */

    // дефолтні значення (вони ж йдуть у SettingsApi.addParam як default)
    var RCFG_DEFAULT = {
        ratings_omdb_key:      (LMP_ENH_CONFIG.apiKeys.omdb || ''),
        ratings_mdblist_key:   (LMP_ENH_CONFIG.apiKeys.mdblist || ''),

        ratings_bw_logos:      false,   // Ч/Б логотипи (ні = кольорові)
        ratings_show_awards:   true,    // показувати Оскар / Еммі / інші нагороди
        ratings_show_average:  true,    // показувати середній рейтинг

        ratings_logo_offset:   0,       // офсет висоти логотипів у px (може бути від’ємний)
        ratings_font_offset:   0,       // офсет розміру числа рейтингу у px (може бути від’ємний)

        ratings_badge_alpha:   0.15,    // прозорість бекґраунду плитки (альфа 0..1)
        ratings_badge_tone:    0,       // яскравість 0..255 (rgb(tone,tone,tone))

        ratings_gap_step:      0        // крок відступів між плитками (0 => 1em, 1 => 1.1em, ...)
    };

    /**
     * Повертає актуальні значення з Lampa.Storage з fallback'ом у дефолти
     */
    function getCfg() {
        var omdbKey = Lampa.Storage.get('ratings_omdb_key', RCFG_DEFAULT.ratings_omdb_key);
        var mdblistKey = Lampa.Storage.get('ratings_mdblist_key', RCFG_DEFAULT.ratings_mdblist_key);

        var bwLogos = !!Lampa.Storage.field('ratings_bw_logos', RCFG_DEFAULT.ratings_bw_logos);
        var showAwards = !!Lampa.Storage.field('ratings_show_awards', RCFG_DEFAULT.ratings_show_awards);
        var showAverage = !!Lampa.Storage.field('ratings_show_average', RCFG_DEFAULT.ratings_show_average);

        var logoOffRaw = Lampa.Storage.get('ratings_logo_offset', RCFG_DEFAULT.ratings_logo_offset);
        var logoOffset = parseInt(logoOffRaw,10);
        if (isNaN(logoOffset)) logoOffset = 0;

        var fontOffRaw = Lampa.Storage.get('ratings_font_offset', RCFG_DEFAULT.ratings_font_offset);
        var fontOffset = parseInt(fontOffRaw,10);
        if (isNaN(fontOffset)) fontOffset = 0;

        var alphaRaw = Lampa.Storage.get('ratings_badge_alpha', RCFG_DEFAULT.ratings_badge_alpha);
        var badgeAlpha = parseFloat(alphaRaw);
        if (isNaN(badgeAlpha)) badgeAlpha = RCFG_DEFAULT.ratings_badge_alpha;
        if (badgeAlpha < 0) badgeAlpha = 0;
        if (badgeAlpha > 1) badgeAlpha = 1;

        var toneRaw = Lampa.Storage.get('ratings_badge_tone', RCFG_DEFAULT.ratings_badge_tone);
        var badgeTone = parseInt(toneRaw,10);
        if (isNaN(badgeTone)) badgeTone = RCFG_DEFAULT.ratings_badge_tone;
        if (badgeTone < 0) badgeTone = 0;
        if (badgeTone > 255) badgeTone = 255;

        var gapRaw = Lampa.Storage.get('ratings_gap_step', RCFG_DEFAULT.ratings_gap_step);
        var gapStep = parseInt(gapRaw,10);
        if (isNaN(gapStep) || gapStep < 0) gapStep = 0;

        return {
            omdbKey: omdbKey || '',
            mdblistKey: mdblistKey || '',

            bwLogos: bwLogos,
            showAwards: showAwards,
            showAverage: showAverage,

            logoOffset: logoOffset,
            fontOffset: fontOffset,

            badgeAlpha: badgeAlpha,
            badgeTone: badgeTone,

            gapStep: gapStep
        };
    }

    /**
     * Синхронізує apiKeys + monochromeIcons у LMP_ENH_CONFIG
     * Викликається перед тим як тягнути дані з API.
     */
    function refreshConfigFromStorage(){
        var cfg = getCfg();

        // API keys
        LMP_ENH_CONFIG.apiKeys.omdb    = cfg.omdbKey || '';
        LMP_ENH_CONFIG.apiKeys.mdblist = cfg.mdblistKey || '';

        // ч/б логотипи
        LMP_ENH_CONFIG.monochromeIcons = cfg.bwLogos;

        return cfg;
    }

    /**
     * Ховає/показує блоки з нагородами (Оскар / Еммі / інші)
     */
    function toggleAwards(showAwards){
        var nodes = document.querySelectorAll('.rate--oscars, .rate--emmy, .rate--awards');
        nodes.forEach(function(n){
            n.style.display = showAwards ? '' : 'none';
        });
    }

    /**
     * Ховає/показує блок середнього рейтингу
     */
    function toggleAverage(showAverage){
        var nodes = document.querySelectorAll('.rate--avg');
        nodes.forEach(function(n){
            n.style.display = showAverage ? '' : 'none';
        });
    }

    /**
     * Масштабує текстову частину рейтингу (число в першому div усередині .full-start__rate)
     * Робимо це через зміни font-size самої плитки .full-start__rate
     * і запам'ятовуємо базу в data-base-fontsize, щоб не накопичувати зміни
     */
    function tuneRatingFont(offsetPx){
        var tiles = document.querySelectorAll('.full-start__rate');
        tiles.forEach(function(tile){
            if (!tile.getAttribute('data-base-fontsize')){
                var cs = window.getComputedStyle(tile);
                var basePx = parseFloat(cs.fontSize);
                if (isNaN(basePx)) basePx = 23;
                tile.setAttribute('data-base-fontsize', basePx);
            }
            var baseStored = parseFloat(tile.getAttribute('data-base-fontsize'));
            if (isNaN(baseStored)) baseStored = 23;
            var finalPx = baseStored + offsetPx;
            if (finalPx < 1) finalPx = 1;
            tile.style.fontSize = finalPx + 'px';
        });
    }

    /**
     * Масштабує логотипи (джерело / іконка праворуч у плитці)
     * Шукаємо .full-start__rate .source--name img / span
     * зберігаємо їхню базову висоту в data-base-height
     */
    function tuneLogos(offsetPx){
        var logos = document.querySelectorAll('.full-start__rate .source--name img, .full-start__rate .source--name span');
        logos.forEach(function(logo){
            if (!logo.getAttribute('data-base-height')){
                var ch = parseFloat(window.getComputedStyle(logo).height);
                if (isNaN(ch)) ch = 16;
                logo.setAttribute('data-base-height', ch);
            }
            var baseH = parseFloat(logo.getAttribute('data-base-height'));
            if (isNaN(baseH) || baseH <= 0) baseH = 16;

            var finalH = baseH + offsetPx;
            if (finalH < 1) finalH = 1;

            logo.style.height = finalH + 'px';
            logo.style.maxHeight = finalH + 'px';
            logo.style.lineHeight = finalH + 'px';

            // Спробувати також підправити вкладені <img>/<svg> усередині span (Оскар, Еммі)
            var innerImgs = logo.querySelectorAll && logo.querySelectorAll('img,svg');
            if (innerImgs && innerImgs.length){
                innerImgs.forEach(function(inner){
                    inner.style.height = finalH + 'px';
                    inner.style.maxHeight = finalH + 'px';
                    inner.style.lineHeight = finalH + 'px';
                });
            }
        });
    }

    /**
     * Оновлює прозорість та тон бекґраунду для .full-start__rate
     * і для .full-start__rate > div:first-child
     * Згідно стандарту Lampa обидві частини мають однакове rgba(...)
     */
    function tuneBadgeBackground(tone, alpha){
        var rgba = 'rgba(' + tone + ',' + tone + ',' + tone + ',' + alpha + ')';
        var tiles = document.querySelectorAll('.full-start__rate');
        tiles.forEach(function(tile){
            tile.style.background = rgba;

            // перший div усередині (квадратик з числом)
            var firstDiv = tile.firstElementChild;
            if (firstDiv){
                firstDiv.style.background = rgba;
            }
        });
    }

    /**
     * Задає відступи між плитками у .full-start-new__rate-line
     * base 1em + gapStep*0.1em
     */
    function tuneGap(gapStep){
        var lines = document.querySelectorAll('.full-start-new__rate-line');
        var totalEm = (1 + gapStep * 0.1);
        lines.forEach(function(line){
            var kids = line.children;
            for (var i=0;i<kids.length;i++){
                kids[i].style.marginRight = totalEm + 'em';
            }
        });
    }

    /**
     * Ч/Б логотипи (грейскейл)
     * Ми керуємо через inline style.filter елементів-логотипів,
     * щоб можна було перемикати без перезавантаження.
     */
    function applyBwLogos(enabled){
        var logos = document.querySelectorAll('.full-start__rate .source--name img, .full-start__rate .source--name span');
        logos.forEach(function(node){
            node.style.filter = enabled ? 'grayscale(100%)' : '';
        });
    }

    /**
     * Головна функція стилізації — викликається після того,
     * як картиночки рейтингів вставлені у DOM
     */
    function applyStylesToAll(){
        var cfg = getCfg();

        // ховаємо/показуємо нагороди
        toggleAwards(cfg.showAwards);

        // ховаємо/показуємо середній рейтинг
        toggleAverage(cfg.showAverage);

        // розмір шрифту чисел рейтингу (усі плитки)
        tuneRatingFont(cfg.fontOffset);

        // розмір логотипів
        tuneLogos(cfg.logoOffset);

        // фон і прозорість бейджів
        tuneBadgeBackground(cfg.badgeTone, cfg.badgeAlpha);

        // відступи між плитками
        tuneGap(cfg.gapStep);

        // ч/б логотипи
        applyBwLogos(cfg.bwLogos);
    }

    /**
     * Реєструє секцію "★ Рейтинги" у налаштуваннях Lampa.
     * Більше нічого не чіпає.
     */
    function addSettingsSection(){
        if (window.lmp_ratings_add_param_ready) return;
        window.lmp_ratings_add_param_ready = true;

        // сам розділ
        Lampa.SettingsApi.addComponent({
            component: 'lmp_ratings',
            name: '★ Рейтинги',
            icon:
                '<svg width="24" height="24" viewBox="0 0 24 24" ' +
                'fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '<path d="M12 3l3.09 6.26L22 10.27l-5 4.87L18.18 21 ' +
                '12 17.77 5.82 21 7 15.14l-5-4.87 6.91-1.01L12 3z" ' +
                'stroke="currentColor" stroke-width="2" ' +
                'fill="none" stroke-linejoin="round" stroke-linecap="round"/>' +
                '</svg>'
        });

        // 1. API ключ (OMDb)
        Lampa.SettingsApi.addParam({
            component: 'lmp_ratings',
            param: {
                name: 'ratings_omdb_key',
                type: 'input',
                values: '',
                "default": RCFG_DEFAULT.ratings_omdb_key
            },
            field: {
                name: 'API ключ (OMDb)',
                description: 'Введи свій ключ OMDb. Можна отримати на omdbapi.com'
            },
            onRender: function(item){}
        });

        // 2. API ключ (MDBList)
        Lampa.SettingsApi.addParam({
            component: 'lmp_ratings',
            param: {
                name: 'ratings_mdblist_key',
                type: 'input',
                values: '',
                "default": RCFG_DEFAULT.ratings_mdblist_key
            },
            field: {
                name: 'API ключ (MDBList)',
                description: 'Введи свій ключ MDBList. Можна отримати на mdblist.com'
            },
            onRender: function(item){}
        });

        // 3. Ч/Б логотипи
        Lampa.SettingsApi.addParam({
            component: 'lmp_ratings',
            param: {
                name: 'ratings_bw_logos',
                type: 'trigger',
                values: '',
                "default": RCFG_DEFAULT.ratings_bw_logos
            },
            field: {
                name: 'Ч/Б логотипи',
                description: 'Чорно-білі логотипи рейтингів'
            },
            onRender: function(item){}
        });

        // 4. Нагороди
        Lampa.SettingsApi.addParam({
            component: 'lmp_ratings',
            param: {
                name: 'ratings_show_awards',
                type: 'trigger',
                values: '',
                "default": RCFG_DEFAULT.ratings_show_awards
            },
            field: {
                name: 'Нагороди',
                description:
                    'Показувати Оскари, Еммі та інші нагороди. ' +
                    'Це керує блоками з Оскаром, Еммі та "інші нагороди".'
            },
            onRender: function(item){}
        });

        // 5. Середній рейтинг
        Lampa.SettingsApi.addParam({
            component: 'lmp_ratings',
            param: {
                name: 'ratings_show_average',
                type: 'trigger',
                values: '',
                "default": RCFG_DEFAULT.ratings_show_average
            },
            field: {
                name: 'Середній рейтинг',
                description: 'Показувати середній рейтинг'
            },
            onRender: function(item){}
        });

        // 6. Розмір логотипів рейтингів
        Lampa.SettingsApi.addParam({
            component: 'lmp_ratings',
            param: {
                name: 'ratings_logo_offset',
                type: 'input',
                values: '',
                "default": RCFG_DEFAULT.ratings_logo_offset
            },
            field: {
                name: 'Розмір логотипів рейтингів',
                description:
                    'Зміна висоти логотипів рейтингів. "0" – стандартний розмір. ' +
                    '"1" збільшує всі логотипи на +1px; "-1" зменшує на -1px. ' +
                    'Це додається поверх базової висоти КОЖНОГО лого.'
            },
            onRender: function(item){}
        });

        // 7. Розмір числа рейтингу
        Lampa.SettingsApi.addParam({
            component: 'lmp_ratings',
            param: {
                name: 'ratings_font_offset',
                type: 'input',
                values: '',
                "default": RCFG_DEFAULT.ratings_font_offset
            },
            field: {
                name: 'Розмір числа рейтингу',
                description:
                    'Зміна розміру числа рейтингу. "0" – стандартний розмір. ' +
                    '+1 → трохи більший шрифт; -1 → трохи менший. ' +
                    'Застосовується до ВСІХ текстових оцінок у плитках рейтингу.'
            },
            onRender: function(item){}
        });

        // пункт 8 ("Корекція розміру фону під рейтингом") поки НЕ додаємо

        // 9. Прозорість фону під рейтингом
        Lampa.SettingsApi.addParam({
            component: 'lmp_ratings',
            param: {
                name: 'ratings_badge_alpha',
                type: 'input',
                values: '',
                "default": RCFG_DEFAULT.ratings_badge_alpha
            },
            field: {
                name: 'Прозорість фону під рейтингом',
                description:
                    'Прозорість фону під рейтингом ("0" – повністю прозорий, "1" – повністю чорний). ' +
                    'Введи 0.15, щоб повернути стандартне значення. ' +
                    'Однакове значення застосовується і до всієї плитки, і до квадратика з числом.'
            },
            onRender: function(item){}
        });

        // 10. Яскравість плиток
        Lampa.SettingsApi.addParam({
            component: 'lmp_ratings',
            param: {
                name: 'ratings_badge_tone',
                type: 'input',
                values: '',
                "default": RCFG_DEFAULT.ratings_badge_tone
            },
            field: {
                name: 'Яскравість плиток',
                description:
                    'Яскравість плиток рейтингу. "0" – за замовчуванням. Від 0 до 255. ' +
                    'Більше значення → світліше (сіріше), менше → темніше (чорніше).'
            },
            onRender: function(item){}
        });

        // 11. Відступи між блоками
        Lampa.SettingsApi.addParam({
            component: 'lmp_ratings',
            param: {
                name: 'ratings_gap_step',
                type: 'input',
                values: '',
                "default": RCFG_DEFAULT.ratings_gap_step
            },
            field: {
                name: 'Відступи між блоками',
                description:
                    'Відступи між блоками. "0" – за замовчуванням. "1" → +0.1em до відступу. ' +
                    'Від’ємні значення не підтримуються.'
            },
            onRender: function(item){}
        });
    }

    /**
     * Ініціалізація меню та експорт утиліт
     */
    function initRatingsPluginUI(){
        addSettingsSection();

        // зробимо утиліти доступними глобально (для дебагу / зовнішніх викликів)
        window.LampaRatings = window.LampaRatings || {};
        window.LampaRatings.applyStyles = applyStylesToAll;
        window.LampaRatings.getConfig   = getCfg;

        // одразу застосувати стилі до вже відкритої картки, якщо є
        applyStylesToAll();
    }

    // ініціалізація меню налаштувань та стилізації
    initRatingsPluginUI();

    if (LMP_ENH_CONFIG.monochromeIcons) {
        $('body').addClass('lmp-enh--mono');
    }
    if (!window.combined_ratings_plugin) startPlugin();

})();

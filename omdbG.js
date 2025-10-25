(function() {
    'use strict';

    /**
     * =========================
     *  CONFIG
     * =========================
     * Важливо:
     * 1) Вкажи свої API ключі
     * 2) Вкажи режим іконок (кольорові або ч/б)
     */
    var LMP_ENH_CONFIG = {
        apiKeys: {
            mdblist: 'm8po461k1zq14sroj2ez5d7um', // ключ до https://api.mdblist.com
            omdb:    '12c9249c'     // ключ до https://omdbapi.com
        },

        // true  -> всі іконки примусово ч/б через CSS filter: grayscale(100%)
        // false -> залишати кольорові логотипи
        monochromeIcons: false
    };


    /**
     * =========================
     *  ICON SOURCES
     * =========================
     * Тут збираємо всі логотипи.
     * Частина — з твого GitHub (LMPStyle/wwwroot),
     * частина — з Enchanser (streamingdiscovery).
     */
    var ICONS = {
        // середній рейтинг (TOTAL)
        total_star: 'https://raw.githubusercontent.com/ko31k/LMPStyle/main/wwwroot/star.png',

        // інші нагороди (не Оскар / не Еммі)
        awards: 'https://raw.githubusercontent.com/ko31k/LMPStyle/main/wwwroot/awards.png',

        // PopcornMeter / audience score
        popcorn: 'https://raw.githubusercontent.com/ko31k/LMPStyle/main/wwwroot/popcorn.png',

        // Rotten Tomatoes поганий (гнилий)
        rotten_bad: 'https://raw.githubusercontent.com/ko31k/LMPStyle/main/wwwroot/RottenBad.png',

        // логотипи сервісів з Enchanser
        imdb:        'https://www.streamingdiscovery.com/logo/imdb.png',
        tmdb:        'https://www.streamingdiscovery.com/logo/tmdb.png',
        metacritic:  'https://www.streamingdiscovery.com/logo/metacritic.png',
        rotten_good: 'https://www.streamingdiscovery.com/logo/rotten-tomatoes.png'
    };


    /**
     * =========================
     *  INLINE SVG (Emmy)
     * =========================
     * Оригінальна статуетка Emmy з попереднього omdb.
     * Вона використовується в бейджі Emmy.
     */
    var emmy_svg = "<svg   xmlns:dc=\"http://purl.org/dc/elements/1.1/\"   xmlns:cc=\"http://creativecommons.org/ns#\"   xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"   xmlns:svg=\"http://www.w3.org/2000/svg\"   xmlns=\"http://www.w3.org/2000/svg\"   xmlns:sodipodi=\"http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd\"   xmlns:inkscape=\"http://www.inkscape.org/namespaces/inkscape\"   id=\"svg4260\"   version=\"1.1\"   inkscape:version=\"0.48.4 r9939\"   viewBox=\"0 0 210 297\"   sodipodi:docname=\"Emmy_Award_vector.svg\"><metadata     id=\"metadata5218\"><rdf:RDF><cc:Work         rdf:about=\"\"><dc:format>image/svg+xml</dc:format><dc:type           rdf:resource=\"http://purl.org/dc/dcmitype/StillImage\" /><dc:title /></cc:Work></rdf:RDF></metadata><defs     id=\"defs5216\" /><sodipodi:namedview     pagecolor=\"#ffffff\"     bordercolor=\"#666666\"     borderopacity=\"1\"     objecttolerance=\"10\"     gridtolerance=\"10\"     guidetolerance=\"10\"     inkscape:pageopacity=\"0\"     inkscape:pageshadow=\"2\"     inkscape:window-width=\"2560\"     inkscape:window-height=\"1382\"     id=\"namedview5214\"     showgrid=\"false\"     inkscape:zoom=\"3.7509437\"     inkscape:cx=\"95.745228\"     inkscape:cy=\"168.08483\"     inkscape:window-x=\"0\"     inkscape:window-y=\"18\"     inkscape:window-maximized=\"1\"     inkscape:current-layer=\"layer1\" /><g     inkscape:label=\"Layer 1\"     inkscape:groupmode=\"layer\"     id=\"layer1\"     transform=\"translate(0,-755.36218)\"><path       inkscape:connector-curvature=\"0\"       id=\"path4642\"       d=\"m 83.898307,873.85997 c 0,0 -0.604825,3.72074 0.691286,5.45918 1.296085,1.73847 4.287641,3.40809 4.287641,3.40809 0,0 -1.22393,-1.4343 0.457025,-1.73792 1.680982,-0.30352 4.287641,2.27983 4.287641,2.27983 0,0 0.288046,-6.95854 -4.819995,-9.80981 -5.108041,-2.8513 -4.903598,0.40063 -4.903598,0.40063 z\"       style=\"fill:#d4b919;fill-opacity:1;fill-rule:evenodd;stroke:none\" /><path       inkscape:connector-curvature=\"0\"       id=\"path4640\"       d=\"m 73.232028,909.60933 c 0,0 -1.839201,2.11879 -1.148069,3.42716 0.691132,1.30835 2.816714,1.69088 2.816714,1.69088 0,0 8.099396,2.54321 12.142009,-9.80644 4.042595,-12.34972 -2.503924,-21.43722 -2.503924,-21.43722 l -0.740491,0.70476 c 0,0 4.777097,8.07248 0.696177,19.84319 -4.080508,11.77066 -11.958416,5.57767 -11.958416,5.57767 z\"       style=\"fill:#d4b919;fill-opacity:1;fill-rule:evenodd;stroke:none\" /><path       inkscape:connector-curvature=\"0\"       id=\"path4638\"       d=\"m 89.050281,866.70221 c -6.838296,-0.0869 -6.359245,6.28365 -6.359245,6.28365 0,0 0.686336,7.33106 10.921647,10.12361 2.019695,0.54805 3.368474,0.93457 4.34031,1.21807 3.024222,4.87703 2.213897,13.17305 2.213897,13.17305 l 0.9016,0.12815 0.88038,0.1228 c 0,0 0.76391,-8.98188 -1.70777,-14.26222 5.66537,0.98249 12.222,0.47613 15.635,0.0425 1.53465,-0.19939 2.83745,-0.3946 3.82894,-0.5552 7.8878,4.9977 7.79347,5.95547 8.09761,6.86068 0.30416,0.90522 -0.67752,1.24661 -0.67752,1.24661 l 0.40608,0.53647 c 0,0 2.50102,-0.251 2.15568,-2.12782 -0.34534,-1.87679 -3.3776,-4.59469 -8.94444,-8.29258 -0.45174,-0.29891 -0.97129,-0.61998 -1.5232,-0.95717 0.80957,-0.14775 1.44842,-0.26789 1.87027,-0.34977 3.19385,-0.62172 5.31053,-1.60801 5.34352,-2.45125 0.0268,-0.68762 -1.59139,-1.30789 -1.59139,-1.30789 l -0.45872,0.14198 c 0,0 0.94361,0.9176 0.54621,1.43235 -0.39735,0.51466 -1.72127,1.00354 -4.42473,1.47276 -0.36325,0.0626 -0.79568,0.13507 -1.26932,0.21202 -1.42584,-0.80272 -3.10115,-1.65152 -4.90777,-2.4089 1.44786,-1.41598 2.32648,-2.5795 2.32648,-2.5795 l -0.12296,-0.95668 c 0,0 -1.41519,-0.0994 -1.92459,1.46647 -0.50939,1.56583 -2.48741,2.33214 -4.09804,2.69269 -1.55782,-0.57529 -3.19529,-1.01657 -4.73483,-1.33686 0.48812,-3.33636 2.75974,-6.44141 2.75974,-6.44141 l -0.40709,-0.85483 c 0,0 -3.65273,2.80864 -4.33181,7.29038 -4.63772,-0.4695 -8.30666,-0.0662 -9.85502,0.15638 -0.0101,-0.032 -0.0171,-0.0661 -0.0278,-0.0977 -1.42178,-4.39249 3.48029,-7.764 7.3101,-7.15183 3.82981,0.61214 3.11579,2.09279 3.11579,2.09279 l 0.66921,-0.0148 c 0,0 1.5932,-2.77933 -3.60546,-3.84652 -0.69118,-0.14377 -1.3346,-0.20336 -1.93189,-0.21124 z m 17.549019,11.97573 c 0.66343,0.25329 1.29358,0.51616 1.90676,0.78434 -0.9644,0.12902 -2.07064,0.27878 -3.29219,0.42583 -0.22408,-0.39054 -0.45125,-0.77359 -0.69129,-1.1384 0.74834,-0.028 1.49908,-0.0552 2.07672,-0.0717 z\"       style=\"fill:#d4b919;fill-opacity:1;fill-rule:evenodd;stroke:none\" /><path       inkscape:connector-curvature=\"0\"       id=\"path4644\"       d=\"m 125.70182,860.27606 c 0,0 3.62922,1.57043 4.39212,3.06663 0.76289,1.49628 0.38661,4.71991 0.38661,4.71991 0,0 -0.95793,-1.61444 -1.64512,0.002 -0.68718,1.61647 0.99519,4.76455 0.99519,4.76455 0,0 -6.64133,-2.73675 -7.3652,-8.8747 -0.7238,-6.13797 2.52921,-3.67826 2.52921,-3.67826 z\"       style=\"fill:#d4b919;fill-opacity:1;fill-rule:evenodd;stroke:none\" /><path       inkscape:connector-curvature=\"0\"       id=\"path4646\"       d=\"m 142.66711,854.83562 c 0,0 4.06189,3.54074 4.26721,5.91447 0.20533,2.37375 -1.86674,6.14018 -1.86674,6.14018 0,0 0.23053,-2.28372 -1.64234,-1.53066 -1.8729,0.75296 -2.92939,5.5004 -2.92939,5.5004 0,0 -5.71873,-5.57583 -3.22107,-12.94584 2.49767,-7.37002 5.39233,-3.07855 5.39233,-3.07855 z\"       style=\"fill:#d4b919;fill-opacity:1;fill-rule:evenodd;stroke:none\" /><path       inkscape:connector-curvature=\"0\"       id=\"path4648\"       d=\"m 122.34186,923.55025 c 0,0 -3.63191,-7.78737 -11.27161,-13.34076 -7.63971,-5.55333 -10.34663,-18.31516 -10.34663,-18.31516 l -1.55785,0.22759 c 0,0 1.31047,16.1706 9.00231,21.25982 7.69186,5.08922 14.24923,14.16889 14.24923,14.16889 z\"       style=\"fill:#d4b919;fill-opacity:1;fill-rule:evenodd;stroke:none\" /><path       inkscape:connector-curvature=\"0\"       id=\"path4650\"       d=\"m 77.886742,1008.8069 -2.131918,0.2266 c 0,0 8.303568,21.153 32.029156,18.7762 19.84453,-1.9732 29.2252,-13.66397 31.81084,-18.61452 l -1.64528,-0.2355 c -2.34307,3.5007 -12.00475,14.96662 -30.26801,16.87562 -21.701101,2.2119 -29.794234,-17.0284 -29.794234,-17.0284 z\"       style=\"fill:#d4b919;fill-opacity:1;fill-rule:evenodd;stroke:none\" /><path       inkscape:connector-curvature=\"0\"       id=\"path4652\"       d=\"m 73.424015,1010.747 c 0,0 -0.113121,27.7268 32.899755,25.6705 36.86915,-2.3207 31.92893,-25.9988 31.92893,-25.9988 l -64.828685,0.3283 z\"       style=\"fill:#d4b919;fill-opacity:1;fill-rule:evenodd;stroke:none\" /><path       inkscape:connector-curvature=\"0\"       id=\"path4654\"       d=\"m 105.43536,892.43064 c 0.89953,2.17968 1.39242,4.56731 1.62639,6.99749 0.27942,2.8644 0.24071,5.82541 0.15862,8.47877 -0.0912,2.9467 -0.23245,5.43328 -0.17842,7.12866 0.0886,2.81353 -0.012,6.20571 -0.19722,9.84744 -0.23264,4.51045 -0.55856,9.3948 -0.42685,14.03686 0.11356,2.65546 0.30425,5.1751 0.5625,7.36382 l 1.74584,0.76583 c -0.37167,-2.1595 -0.63294,-4.6433 -0.76509,-7.32836 -0.18419,-4.5962 0.12763,-9.45649 0.32873,-13.95271 0.17307,-3.66623 0.30856,-7.07872 0.21534,-9.98228 -0.0569,-1.68253 -0.0563,-4.1804 0.128-7.13939 0.12301,-1.8909 0.15404,-4.10508 0.0618,-6.45649 -0.13125,-3.28144 -0.61463,-6.84645 -2.04007,-9.99105 -0.52122,-1.58633 -1.15537,-3.06157 -1.91627,-4.36746 z\"       style=\"fill:#d4b919;fill-opacity:1;fill-rule:evenodd;stroke:none\" /><path       inkscape:connector-curvature=\"0\"       id=\"path4656\"       d=\"m 121.87023,914.50608 c -0.45698,4.40004 -1.3691,8.9692 -2.88138,13.46863 -2.77393,8.2563 -10.5747,23.10425 -6.47272,37.26619 0.18869,1.9101 1.83021,-0.7704 1.38801,-6.4234 -0.60634,-8.84775 1.73708,-15.58125 3.86718,-23.39608 1.5702,-5.74237 2.45115,-12.02798 2.67628,-17.54285 l 2.33566,0.62751 c -0.14742,5.47505 -1.14576,11.64519 -2.89326,17.27932 -3.16406,9.93603 -6.22082,18.30713 -4.80156,27.79933 0.94846,4.915 2.84405,8.2953 4.61172,8.1711 1.15456,-0.1071 2.21818,-1.6794 2.902,-4.1602 0.69212,-2.5116 0.8909,-5.6429 0.65979,-8.994 -0.65164,-5.79608 0.7132,-11.07209 2.25911,-16.78921 1.57471,-5.82022 3.33962,-12.27146 3.86696,-20.03817 l -0.6719,-1.1339 c 0.15086,-4.8483 -0.0371,-9.49618 -0.98325,-13.13421 -0.26991,-0.42977 -0.56864,-0.80604 -0.86758,-1.14996 z\"       style=\"fill:#d4b919;fill-opacity:1;fill-rule:evenodd;stroke:none\" /><path       inkscape:connector-curvature=\"0\"       id=\"path4658\"       d=\"m 113.28632,889.11052 c 0,0 0.68821,4.43258 -1.62554,6.66774 -2.31365,2.23503 -7.70084,2.14344 -7.70084,2.14344 0,0 2.42373,-1.02424 0.78771,-2.35417 -1.63602,-1.32993 -6.39078,-0.51094 -6.39078,-0.51094 0,0 4.61227,-8.23149 12.56036,-8.24744 7.94808,-0.0159 2.36809,2.30137 2.36809,2.30137 z\"       style=\"fill:#d4b919;fill-opacity:1;fill-rule:evenodd;stroke:none\" /></g></svg>";

    /**
     * =========================
     *  Локалізовані підписи (мінімум)
     * =========================
     */
    Lampa.Lang.add({
        ratimg_avg_label: {
            ru: 'ИТОГ',
            en: 'TOTAL',
            uk: 'ЗАГАЛОМ'
        },
        oscars_label: {
            ru: 'Оскары',
            en: 'Oscars',
            uk: 'Оскар'
        },
        emmy_label: {
            ru: 'Эмми',
            en: 'Emmy',
            uk: 'Єммі'
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


    /**
     * =========================
     *  CSS + loader (від omdb версії)
     * =========================
     */
    var loadingStyles = "<style>" +
        ".loading-dots-container {" +
        "    display: flex;" +
        "    align-items: center;" +
        "    font-size: 0.85em;" +
        "    color: #ccc;" +
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


    /**
     * =========================
     *  Кеш і мапи
     * =========================
     */
    var CACHE_TIME = 3 * 24 * 60 * 60 * 1000; // 3 дні
    var RATING_CACHE_KEY = 'lmp_enh_rating_cache';
    var ID_MAPPING_CACHE = 'maxsm_rating_id_mapping'; // reuse з існуючого коду

    // відповідність вікових рейтингів
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


    // поточний набір змерджених рейтингів
    var currentRatingsData = null;


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

    // Генеруємо <img> з урахуванням monochromeIcons
    function iconImg(url, alt) {
        var filter = LMP_ENH_CONFIG.monochromeIcons ? 'filter:grayscale(100%);' : '';
        return '<img style="' +
            'height:12px; width:auto; display:inline-block; vertical-align:middle; ' +
            'object-fit:contain; transform:scale(1.2); ' + filter + '" ' +
            'src="' + url + '" alt="' + (alt || '') + '">';
    }

    function emmyIconInline() {
        var filter = LMP_ENH_CONFIG.monochromeIcons ? 'filter:grayscale(100%);' : '';
        return '<span style="' +
            'height:12px; width:auto; display:inline-block; vertical-align:middle; ' +
            'transform:scale(1.0); ' + filter + '">' + emmy_svg + '</span>';
    }

    function oscarIconInline() {
        var filter = LMP_ENH_CONFIG.monochromeIcons ? 'filter:grayscale(100%);' : '';
        return '<span style="' +
            'height:12px; width:auto; display:inline-block; vertical-align:middle; ' +
            'object-fit:contain; transform:scale(1.2); ' + filter + '">' +
            // <<< ОТУТ ВСТАВЛЯЄШ СВОЙ <img ...> або <svg ...> >>>
            '<img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgdmVyc2lvbj0iMS4xIgogICBpZD0ic3ZnMiIKICAgdmlld0JveD0iMCAwIDM4LjE4NTc0NCAxMDEuNzY1IgogICBoZWlnaHQ9IjEzNS42Njk0NSIKICAgd2lkdGg9IjUwLjkwODIwMyI+CiAgPG1ldGFkYXRhCiAgICAgaWQ9Im1ldGFkYXRhMTYiPgogICAgPHJkZjpSREY+CiAgICAgIDxjYzpXb3JrCiAgICAgICAgIHJkZjphYm91dD0iIj4KICAgICAgICA8ZGM6Zm9ybWF0PmltYWdlL3N2Zyt4bWw8L2RjOmZvcm1hdD4KICAgICAgICA8ZGM6dHlwZQogICAgICAgICAgIHJkZjpyZXNvdXJjZT0iaHR0cDovL3B1cmwub3JnL2RjL2RjbWl0eXBlL1N0aWxsSW1hZ2UiIC8+CiAgICAgICAgPGRjOnRpdGxlPjwvZGM6dGl0bGU+CiAgICAgIDwvY2M6V29yaz4KICAgIDwvcmRmOlJERj4KICA8L21ldGFkYXRhPgogIDxkZWZzCiAgICAgaWQ9ImRlZnMxNCIgLz4KICA8ZwogICAgIHRyYW5zZm9ybT0idHJhbnNsYXRlKC04LjQwNjE3NDUsMC42OTMpIgogICAgIGlkPSJnNCIKICAgICBzdHlsZT0iZGlzcGxheTppbmxpbmU7ZmlsbDojZmZjYzAwIj4KICAgIDxwYXRoCiAgICAgICBpZD0icGF0aDYiCiAgICAgICBkPSJtIDI3LjM3MSwtMC42OTMgYyAtMy45MjcsMC4zNjYgLTUuMjI5LDMuNTM4IC00Ljk2Myw2Ljc3OCAwLjI2NiwzLjIzOSAzLjY4NSw2Ljk3MiAwLjEzNSw4Ljk1NiAtMS41NzcsMS40MTMgLTMuMTU0LDMuMDczIC01LjIwNywzLjU0IC0yLjY3OSwwLjYwNyAtNC4yODcsMy4wNTQgLTQuNjA3LDYuNDE5IDEuMzg4LDQuODI0IDAuMzY1LDkuMjg1IDEuNzczLDEyLjgyNCAxLjQwNywzLjUzOSAzLjY5NiwzLjgzMSAzLjk4Niw1LjA3NiAwLjMxNyw3LjYzNyAyLjM0MSwxNy41MzUgMC44NTYsMjQuOTMgMS4xNzIsMC4xODQgMC45MywwLjQ0NCAwLjg5NCwwLjcyOSAtMC4wMzYsMC4yODQgLTAuNDgsMC4zODEgLTEuMDg4LDAuNTI3IDAuODQ3LDcuNjg0IC0wLjI3OCwxMi4xMzYgMS45ODMsMTguNzcxIGwgMCwzLjU5MiAtMS4wNywwIDAsMS41MjQgYyAwLDAgLTcuMzEsLTAuMDA1IC04LjU2NSwwIDAsMCAwLjY4LDIuMTU5IC0xLjUyMywzLjAyNyAwLjAwOCwxLjEgMCwyLjcxOSAwLDIuNzE5IGwgLTEuNTY5LDAgMCwyLjM1MyBjIDEzLjIyMTcwMywwIDI2LjgzNzkwNywwIDM4LjE4NiwwIGwgMCwtMi4zNTIgLTEuNTcsMCBjIDAsMCAtMC4wMDcsLTEuNjE5IDAuMDAxLC0yLjcxOSBDIDQyLjgyLDk1LjEzMyA0My41LDkyLjk3NCA0My41LDkyLjk3NCBjIC0xLjI1NSwtMC4wMDUgLTguNTY0LDAgLTguNTY0LDAgbCAwLC0xLjUyNCAtMS4wNzMsMCAwLC0zLjU5MiBjIDIuMjYxLC02LjYzNSAxLjEzOCwtMTEuMDg3IDEuOTg1LC0xOC43NzEgLTAuNjA4LC0wLjE0NiAtMS4wNTQsLTAuMjQzIC0xLjA5LC0wLjUyNyAtMC4wMzYsLTAuMjg1IC0wLjI3OCwtMC41NDUgMC44OTQsLTAuNzI5IC0wLjg0NSwtOC4wNTggMC45MDIsLTE3LjQ5MyAwLjg1OCwtMjQuOTMgMC4yOSwtMS4yNDUgMi41NzksLTEuNTM3IDMuOTg2LC01LjA3NiAxLjQwOCwtMy41MzkgMC4zODUsLTggMS43NzQsLTEyLjgyNCAtMC4zMiwtMy4zNjUgLTEuOTMxLC01LjgxMiAtNC42MSwtNi40MiAtMi4wNTMsLTAuNDY2IC0zLjQ2OSwtMi42IC01LjM2OSwtMy44ODQgLTMuMTE4LC0yLjQ3MiAtMC42MSwtNS4zNjQgMC4zNzMsLTguNTc4IDAsLTUuMDEgLTIuMTU0LC02LjQ4MyAtNS4yOTMsLTYuODExIHoiCiAgICAgICBzdHlsZT0iZGlzcGxheTppbmxpbmU7b3BhY2l0eToxO2ZpbGw6I2ZmY2MwMCIgLz4KICA8L2c+Cjwvc3ZnPgo=" style="height:14px; width:auto; display:inline-block; vertical-align:middle; object-fit:contain; transform:scale(1.2);">' +
            '</span>';
    }

  
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


    // Кеш результатів по ключу type+id
    function getCachedRatings(key) {
        var cache = Lampa.Storage.get(RATING_CACHE_KEY) || {};
        var item = cache[key];
        if (!item) return null;
        if (Date.now() - item.timestamp > CACHE_TIME) return null;
        return item.data || null;
    }

    function saveCachedRatings(key, data) {
        if (!data) return;
        var cache = Lampa.Storage.get(RATING_CACHE_KEY) || {};
        cache[key] = {
            timestamp: Date.now(),
            data: data
        };
        Lampa.Storage.set(RATING_CACHE_KEY, cache);
    }


    /**
     * Отримання imdb_id через TMDB (беремо твою логіку)
     */
    function getImdbIdFromTmdb(tmdbId, type, callback) {
        if (!tmdbId) return callback(null);

        var cleanType = type === 'movie' ? 'movie' : 'tv';
        var cacheKey = cleanType + '_' + tmdbId;
        var cache = Lampa.Storage.get(ID_MAPPING_CACHE) || {};

        if (cache[cacheKey] && (Date.now() - cache[cacheKey].timestamp < CACHE_TIME)) {
            return callback(cache[cacheKey].imdb_id);
        }

        var url = 'https://api.themoviedb.org/3/' + cleanType + '/' + tmdbId +
            '/external_ids?api_key=' + Lampa.TMDB.key();

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
                    var altUrl = 'https://api.themoviedb.org/3/tv/' + tmdbId +
                        '?api_key=' + Lampa.TMDB.key();
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


    /**
     * Парсимо текст нагород OMDb → кількість Oscar / Emmy / інших нагород
     */
    function parseAwards(awardsText) {
        if (typeof awardsText !== 'string') return {oscars:0, emmy:0, awards:0};

        var result = { oscars: 0, emmy: 0, awards: 0 };

        var oscarMatch = awardsText.match(/Won (\d+) Oscars?/i);
        if (oscarMatch && oscarMatch[1]) {
            result.oscars = parseInt(oscarMatch[1], 10);
        }

        var emmyMatch = awardsText.match(/Won (\d+) Primetime Emmys?/i);
        if (emmyMatch && emmyMatch[1]) {
            result.emmy = parseInt(emmyMatch[1], 10);
        }

        var otherMatch = awardsText.match(/Another (\d+) wins?/i);
        if (otherMatch && otherMatch[1]) {
            result.awards = parseInt(otherMatch[1], 10);
        }

        if (result.awards === 0) {
            var simpleMatch = awardsText.match(/(\d+) wins?/i);
            if (simpleMatch && simpleMatch[1]) {
                result.awards = parseInt(simpleMatch[1], 10);
            }
        }

        return result;
    }


    /**
     * MDBList:
     *  - TMDB
     *  - IMDb
     *  - Metacritic
     *  - RottenTomatoes
     *  - Popcorn/Audience
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
            if (!response || !response.ratings || !response.ratings.length) {
                callback(null);
                return;
            }

            var res = {
                tmdb_display: null,
                tmdb_for_avg: null,

                imdb_display: null,
                imdb_for_avg: null,

                mc_display: null,
                mc_for_avg: null,

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
                        return parseFloat(rawVal.replace('%',''));
                    }
                    if (rawVal.indexOf('/') !== -1) {
                        return parseFloat(rawVal.split('/')[0]);
                    }
                    return parseFloat(rawVal);
                }
                return null;
            }

            response.ratings.forEach(function(r) {
                var src = (r.source || '').toLowerCase();
                var val = parseRawScore(r.value);
                if (val === null || isNaN(val)) return;

                // TMDB (може бути 73/10 → 7.3)
                if (src.indexOf('tmdb') !== -1) {
                    var tmdb10 = val > 10 ? (val / 10) : val;
                    res.tmdb_display = tmdb10.toFixed(1);
                    res.tmdb_for_avg = tmdb10;
                }

                // IMDb
                if (src.indexOf('imdb') !== -1) {
                    var imdb10 = val > 10 ? (val / 10) : val;
                    res.imdb_display = imdb10.toFixed(1);
                    res.imdb_for_avg = imdb10;
                }

                // Metacritic / Metascore (0..100)
                if (src.indexOf('meta') !== -1 || src.indexOf('metacritic') !== -1) {
                    res.mc_display = String(Math.round(val));   // показуємо ціле число
                    res.mc_for_avg = val / 10;                  // для середнього → /10
                }

                // Rotten Tomatoes (%, 0..100)
                if (src.indexOf('rotten') !== -1 || src.indexOf('tomato') !== -1) {
                    res.rt_display = String(Math.round(val));   // показуємо % як 85
                    res.rt_for_avg = val / 10;                  // 85 → 8.5
                    res.rt_fresh = val >= 60;                   // 60+ = fresh
                }

                // Popcorn / Audience
                if (src.indexOf('popcorn') !== -1 || src.indexOf('audience') !== -1) {
                    res.popcorn_display = String(Math.round(val)); // 91
                    res.popcorn_for_avg = val / 10;                // 91 → 9.1
                }
            });

            callback(res);
        }).fail(function() {
            callback(null);
        });
    }


    /**
     * OMDB:
     *  - IMDb
     *  - Metacritic
     *  - Rotten Tomatoes
     *  - Age rating (Rated)
     *  - Awards (Oscars, Emmy, other wins)
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

            var res = {
                tmdb_display: null,
                tmdb_for_avg: null,

                imdb_display: data.imdbRating && data.imdbRating !== 'N/A' ? data.imdbRating : null,
                imdb_for_avg: data.imdbRating && data.imdbRating !== 'N/A' ? parseFloat(data.imdbRating) : null,

                mc_display: mcScore !== null && !isNaN(mcScore) ? String(mcScore) : null,
                mc_for_avg: mcScore !== null && !isNaN(mcScore) ? (mcScore / 10) : null,

                rt_display: rtScore !== null && !isNaN(rtScore) ? String(rtScore) : null,
                rt_for_avg: rtScore !== null && !isNaN(rtScore) ? (rtScore / 10) : null,
                rt_fresh: rtScore !== null && !isNaN(rtScore) ? (rtScore >= 60) : null,

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
     * Зливаємо MDBList (пріоритет) + OMDB (резерв).
     */
    function mergeRatings(mdb, omdb) {
        mdb = mdb || {};
        omdb = omdb || {};

        var merged = {
            // TMDB тільки з MDBList
            tmdb_display: mdb.tmdb_display || null,
            tmdb_for_avg: mdb.tmdb_for_avg || null,

            // IMDb: MDBList має пріоритет
            imdb_display: mdb.imdb_display || omdb.imdb_display || null,
            imdb_for_avg: mdb.imdb_for_avg || omdb.imdb_for_avg || null,

            // Metacritic
            mc_display: mdb.mc_display || omdb.mc_display || null,
            mc_for_avg: mdb.mc_for_avg || omdb.mc_for_avg || null,

            // Rotten Tomatoes
            rt_display: mdb.rt_display || omdb.rt_display || null,
            rt_for_avg: mdb.rt_for_avg || omdb.rt_for_avg || null,
            rt_fresh: (mdb.rt_display || omdb.rt_display)
                ? (mdb.rt_display ? mdb.rt_fresh : omdb.rt_fresh)
                : null,

            // PopcornMeter — тільки MDBList
            popcorn_display: mdb.popcorn_display || null,
            popcorn_for_avg: mdb.popcorn_for_avg || null,

            // Віковий рейтинг і нагороди
            ageRating: omdb.ageRating || null,
            oscars: omdb.oscars || 0,
            emmy: omdb.emmy || 0,
            awards: omdb.awards || 0
        };

        return merged;
    }


    /**
     * Оновлюємо вже існуючі елементи (IMDb / TMDB / віковий рейтинг)
     * і міняємо текстові підписи на логотипи.
     */
    function updateHiddenElements(data) {
        var render = Lampa.Activity.active().activity.render();
        if (!render || !render[0]) return;

        // Віковий рейтинг (PG-13 -> 13+ і т.д.)
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
        var imdbContainer = $('.rate--imdb', render);
        if (imdbContainer.length) {
            if (data.imdb_display) {
                imdbContainer.removeClass('hide');
                var imdbDivs = imdbContainer.find('> div');
                if (imdbDivs.length >= 2) {
                    imdbDivs.eq(0).text(parseFloat(data.imdb_display).toFixed(1));
                    imdbDivs.eq(1).html(iconImg(ICONS.imdb,'IMDb'));
                }
            } else {
                imdbContainer.addClass('hide');
            }
        }

        // TMDB
        var tmdbContainer = $('.rate--tmdb', render);
        if (tmdbContainer.length) {
            if (data.tmdb_display) {
                var tmdbDivs = tmdbContainer.find('> div');
                if (tmdbDivs.length >= 2) {
                    tmdbDivs.eq(0).text(parseFloat(data.tmdb_display).toFixed(1));
                    tmdbDivs.eq(1).html(iconImg(ICONS.tmdb,'TMDB'));
                }
            }
        }
    }


    /**
     * Додаємо нові бейджі:
     * - Metacritic (після IMDb)
     * - Rotten Tomatoes (після Metacritic)
     * - PopcornMeter (після Rotten Tomatoes)
     * - інші нагороди, Emmy, Oscars (в початок ряду)
     */
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
            mcElement.find('.source--name').html(iconImg(ICONS.metacritic,'Metacritic'));

            var afterImdb = $('.rate--imdb', rateLine);
            if (afterImdb.length) mcElement.insertAfter(afterImdb);
            else rateLine.append(mcElement);
        }

        // Rotten Tomatoes (після Metacritic)
        if (data.rt_display && !$('.rate--rt', rateLine).length) {
            var rtIconUrl = data.rt_fresh ? ICONS.rotten_good : ICONS.rotten_bad;
            var rtElement = $(
                '<div class="full-start__rate rate--rt">' +
                    '<div>' + data.rt_display + '</div>' +
                    '<div class="source--name"></div>' +
                '</div>'
            );
            rtElement.find('.source--name').html(iconImg(rtIconUrl,'Rotten Tomatoes'));

            var afterMc = $('.rate--mc', rateLine);
            if (afterMc.length) rtElement.insertAfter(afterMc);
            else {
                var afterImdb2 = $('.rate--imdb', rateLine);
                if (afterImdb2.length) rtElement.insertAfter(afterImdb2);
                else rateLine.append(rtElement);
            }
        }

        // PopcornMeter / Audience Score (після Rotten Tomatoes)
        if (data.popcorn_display && !$('.rate--popcorn', rateLine).length) {
            var pcElement = $(
                '<div class="full-start__rate rate--popcorn">' +
                    '<div>' + data.popcorn_display + '</div>' +
                    '<div class="source--name"></div>' +
                '</div>'
            );
            pcElement.find('.source--name').html(iconImg(ICONS.popcorn,'Audience'));

            var afterRt = $('.rate--rt', rateLine);
            if (afterRt.length) pcElement.insertAfter(afterRt);
            else {
                var afterMc2 = $('.rate--mc', rateLine);
                if (afterMc2.length) pcElement.insertAfter(afterMc2);
                else rateLine.append(pcElement);
            }
        }

        // Далі йдуть нагороди — prepend у зворотному порядку,
        // щоб вийшло: Oscars → Emmy → Інші нагороди
        // (а перед ними вже потім стане TOTAL)
        if (data.awards && data.awards > 0 && !$('.rate--awards', rateLine).length) {
            var awardsElement = $(
                '<div class="full-start__rate rate--awards rate--gold">' +
                    '<div>' + data.awards + '</div>' +
                    '<div class="source--name"></div>' +
                '</div>'
            );
            awardsElement.find('.source--name')
                .html(iconImg(ICONS.awards,'Awards'))
                .attr('title', Lampa.Lang.translate('awards_other_label'));
            rateLine.prepend(awardsElement);
        }

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
     * беремо tmdb, imdb, metacritic, rotten, popcorn
     * (усі приведені в /10), рахуємо просту середню,
     * показуємо як X.Y
     * Іконка - star.png з GitHub.
     */
    function calculateAverageRating(data) {
        var render = Lampa.Activity.active().activity.render();
        if (!render) return;

        var rateLine = $('.full-start-new__rate-line', render);
        if (!rateLine.length) return;

        var parts = [];

        if (data.tmdb_for_avg && !isNaN(data.tmdb_for_avg)) parts.push(data.tmdb_for_avg);
        if (data.imdb_for_avg && !isNaN(data.imdb_for_avg)) parts.push(data.imdb_for_avg);
        if (data.mc_for_avg && !isNaN(data.mc_for_avg))   parts.push(data.mc_for_avg);
        if (data.rt_for_avg && !isNaN(data.rt_for_avg))   parts.push(data.rt_for_avg);
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

        var colorClass = getRatingClass(avg);

        var avgElement = $(
            '<div class="full-start__rate rate--avg ' + colorClass + '">' +
                '<div>' + avg.toFixed(1) + '</div>' +
                '<div class="source--name"></div>' +
            '</div>'
        );

        var starHtml = iconImg(ICONS.total_star,'AVG');
        var labelText = Lampa.Lang.translate('ratimg_avg_label');
        avgElement.find('.source--name').html(
            starHtml +
            '<span style="margin-left:0.3em; vertical-align:middle; display:inline-block;">' +
            labelText +
            '</span>'
        );

        var firstRate = $('.full-start__rate:first', rateLine);
        if (firstRate.length) firstRate.before(avgElement);
        else rateLine.prepend(avgElement);

        removeLoadingAnimation();
        rateLine.css('visibility','visible');
    }


    /**
     * Основний цикл:
     * 1. Формуємо картку
     * 2. Тягаємо imdb_id якщо треба
     * 3. Тягнемо MDBList і OMDB паралельно
     * 4. Мерджимо
     * 5. Малюємо бейджі
     */
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

    if (!window.combined_ratings_plugin) startPlugin();

})();

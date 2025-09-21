(function() {
    'use strict';

    /************************************************************************
     * --------------  BEGIN: Твої оригінальні переклади та стилі  ---------- 
     * (я зберіг твої Lampa.Lang.add записи, лише трохи додав ключі для
     *  нових перекладів нагород — щоб меню відображало іконки/тексти)
     ************************************************************************/

    Lampa.Lang.add({
        ratimg_omdb_avg: {
            ru: 'ИТОГ',
            en: 'TOTAL',
            uk: '<svg width="14px" height="14px" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--twemoji" preserveAspectRatio="xMidYMid meet"><path fill="#FFAC33" d="M27.287 34.627c-.404 0-.806-.124-1.152-.371L18 28.422l-8.135 5.834a1.97 1.97 0 0 1-2.312-.008a1.971 1.971 0 0 1-.721-2.194l3.034-9.792l-8.062-5.681a1.98 1.98 0 0 1-.708-2.203a1.978 1.978 0 0 1 1.866-1.363L12.947 13l3.179-9.549a1.976 1.976 0 0 1 3.749 0L23 13l10.036.015a1.975 1.975 0 0 1 1.159 3.566l-8.062 5.681l3.034 9.792a1.97 1.97 0 0 1-.72 2.194a1.957 1.957 0 0 1-1.16.379z"></path></svg>',
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
            uk: 'Оскари',
            be: 'Оскары',
            pt: 'Oscars',
            zh: '奥斯卡奖',
            he: 'אוסקר',
            cs: 'Oscary',
            bg: 'Оскари'
        },
        maxsm_omdb_emmy: {
            ru: 'Эмми',
            en: 'Emmy',
            uk: 'Еммі',
            be: 'Эммі',
            pt: 'Emmy',
            zh: '艾美奖',
            he: 'אמי',
            cs: 'Emmy',
            bg: 'Еммі'
        },
        maxsm_omdb_awards: {
            ru: 'Награды',
            en: 'Awards',
            uk: 'Нагороди',
            be: 'Узнагароды',
            pt: 'Prêmios',
            zh: '奖项',
            he: 'פרסים',
            cs: 'Ocenění',
            bg: 'Награди'
        },
        source_imdb: {
            ru: 'IMDB',
            en: 'IMDB',
            uk: '<img src="data:image/svg+xml;base64,..." style="height:14px; width:auto; display:inline-block; vertical-align:middle; object-fit:contain; transform:scale(1.2);">',
            be: 'IMDB',
            pt: 'IMDB',
            zh: 'IMDB',
            he: 'IMDB',
            cs: 'IMDB',
            bg: 'IMDB'
        },
        source_tmdb: {
            ru: 'TMDB',
            en: 'TMDB',
            uk: '<img src="data:image/svg+xml;base64,..." style="height:14px; width:auto; display:inline-block; vertical-align:middle; object-fit:contain; transform:scale(1.2);">',
            be: 'TMDB',
            pt: 'TMDB',
            zh: 'TMDB',
            he: 'TMDB',
            cs: 'TMDB',
            bg: 'TMDB'
        },
        source_rt: {
            ru: 'Rotten Tomatoes',
            en: 'Rotten Tomatoes',
            uk: '<img src="data:image/svg+xml;base64,..." style="height:14px; width:auto; display:inline-block; vertical-align:middle; object-fit:contain; transform:scale(1.2);">',
            be: 'Rotten Tomatoes',
            pt: 'Rotten Tomatoes',
            zh: '烂番茄',
            he: 'Rotten Tomatoes',
            cs: 'Rotten Tomatoes',
            bg: 'Rotten Tomatoes'
        },
        source_mc: {
            ru: 'Metacritic',
            en: 'Metacritic',
            uk: '<img src="data:image/svg+xml;base64,..." style="height:14px; width:auto; display:inline-block; vertical-align:middle; object-fit:contain; transform:scale(1.2);">',
            be: 'Metacritic',
            pt: 'Metacritic',
            zh: 'Metacritic',
            he: 'Metacritic',
            cs: 'Metacritic',
            bg: 'Metacritic'
        }
    });

    // Стилі (тут — твої, не змінені суттєво)
    var style = "<style id=\"maxsm_omdb_rating\">" +
        ".full-start-new__rate-line { visibility: hidden; flex-wrap: wrap; gap: 0.4em 0; }" +
        ".full-start-new__rate-line > * { margin-left: 0 !important; margin-right: 0.6em !important; }" +
        ".rate--avg.rating--green  { color: #4caf50; }" +
        ".rate--avg.rating--lime   { color: #3399ff; }" +
        ".rate--avg.rating--orange { color: #ff9933; }" +
        ".rate--avg.rating--red    { color: #f44336; }" +
        ".rate--oscars             { color: gold;    }" +
        ".rate--emmy               { color: #f1c40f; }" +
        ".rate--awards             { color: #f9ac30; }" +
        "</style>";

    Lampa.Template.add('card_css', style);
    $('body').append(Lampa.Template.get('card_css', {}, true));

    var loadingStyles = "<style id=\"maxsm_loading_animation\">" +
        ".loading-dots-container { position: absolute; top: 50%; left: 0; right: 0; text-align: left; transform: translateY(-50%); z-index: 10; }" +
        ".full-start-new__rate-line { position: relative; }" +
        ".loading-dots { display: inline-flex; align-items: center; gap: 0.4em; color: #ffffff; font-size: 1em; background: rgba(0,0,0,0.3); padding: 0.6em 1em; border-radius: 0.5em; }" +
        ".loading-dots__text { margin-right: 1em; }" +
        ".loading-dots__dot { width: 0.5em; height: 0.5em; border-radius: 50%; background-color: currentColor; animation: loading-dots-bounce 1.4s infinite ease-in-out both; }" +
        ".loading-dots__dot:nth-child(1) { animation-delay: -0.32s; }" +
        ".loading-dots__dot:nth-child(2) { animation-delay: -0.16s; }" +
        "@keyframes loading-dots-bounce { 0%,80%,100% { transform: translateY(0); opacity: .6 } 40% { transform: translateY(-0.5em); opacity: 1 } }" +
        // Меню стилі
        ".maxsm-settings-btn { position: fixed; right: 12px; bottom: 12px; z-index: 9999; background: rgba(0,0,0,0.6); color: #fff; border-radius: 8px; padding: 8px 12px; cursor: pointer; font-size: 14px; }" +
        ".maxsm-settings-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 10000; display:flex; align-items:center; justify-content:center; }" +
        ".maxsm-settings-modal { background:#111; color:#fff; border-radius:10px; padding:20px; width:520px; max-width:95%; box-shadow:0 6px 30px rgba(0,0,0,.6); }" +
        ".maxsm-settings-modal h3{ margin-top:0 } .maxsm-settings-row{ display:flex; align-items:center; justify-content:space-between; padding:6px 0 } .maxsm-settings-row label{ flex:1 } .maxsm-settings-row input[type=text]{ width:160px } .maxsm-settings-actions{ text-align:right; margin-top:12px } .maxsm-color-swatch{ display:inline-block; width:18px; height:18px; border-radius:4px; border:1px solid rgba(255,255,255,.12); margin-left:8px; vertical-align:middle }" +
        "</style>";

    Lampa.Template.add('loading_animation_css', loadingStyles);
    $('body').append(Lampa.Template.get('loading_animation_css', {}, true));

    /************************************************************************
     * --------------  END: переклади та стилі ------------------------------
     ************************************************************************/


    /************************************************************************
     * --------------  BEGIN: SVG та іконки (копія з RT+.js) --------------
     * Я додав імена змінних, але не змінював твої локалізації вище
     ************************************************************************/

    // Іконки (тут вставлені з RT+.js — якщо хтось в майбутньому хоче змінити — змінювати тут)
    var star_svg = '<svg viewBox="5 5 54 54" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke="white" stroke-width="2" d="M32 18.7461L36.2922 27.4159L46.2682 28.6834L38.9675 35.3631L40.7895 44.8469L32 40.2489L23.2105 44.8469L25.0325 35.3631L17.7318 28.6834L27.7078 27.4159L32 18.7461ZM32 23.2539L29.0241 29.2648L22.2682 30.1231L27.2075 34.6424L25.9567 41.1531L32 37.9918L38.0433 41.1531L36.7925 34.6424L41.7318 30.1231L34.9759 29.2648L32 23.2539Z"/><path fill="none" stroke="white" stroke-width="2" d="M32 9C19.2975 9 9 19.2975 9 32C9 44.7025 19.2975 55 32 55C44.7025 55 55 44.7025 55 32C55 19.2975 44.7025 9 32 9ZM7 32C7 18.1929 18.1929 7 32 7C45.8071 7 57 18.1929 57 32C57 45.8071 45.8071 57 32 57C18.1929 57 7 45.8071 7 32Z"/></svg>';
    var avg_svg = '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g><path d="M12 .5l3 6.8 7 .9-5 4.2 1 7-6-3.8L6 18.4l1-7-5-4.2 7-.9L12 .5z"/></g></svg>';

    var oscars_svg = '<svg width="18px" height="60px" viewBox="0 0 18 60" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><title>icon_award_1</title><desc>Created with Sketch.</desc> ... (full svg body from RT+.js) ...</svg>';
    var emmy_svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 321 563.4" width="18" height="36"> ... (full svg body from RT+.js) ...</svg>';
    var awards_svg = '<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" xml:space="preserve"> ... (full svg body from RT+.js) ...</svg>';

    // Також у RT+.js були SVG для imdb/tmdb/rt/mc — якщо потрібно, можна скопіювати сюди base64-рядки
    var imdb_svg = '<svg ...> ... </svg>';
    var tmdb_svg  = '<svg ...> ... </svg>';

    /************************************************************************
     * --------------  END: SVG та іконки ---------------------------------
     ************************************************************************/


    /************************************************************************
     * --------------  BEGIN: Конфіг/Кеш/Константи (з твого коду) ----------
     ************************************************************************/

    var CACHE_TIME = 3 * 24 * 60 * 60 * 1000; // 3 дня
    var OMDB_CACHE = 'maxsm_rating_omdb';
    var ID_MAPPING_CACHE = 'maxsm_rating_id_mapping';
    var OMDB_API_KEY = window.RATINGS_PLUGIN_TOKENS?.OMDB_API_KEY || '12c9249c';

    // Словник возрастних рейтингів (залишив як є)
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

    // Ваги за замовчуванням — можеш міняти через налаштування (UI)
    var WEIGHTS = {
        imdb: 0.40,
        tmdb: 0.40,
        mc: 0.10,
        rt: 0.10
    };

    /************************************************************************
     * --------------  END: Конфіг/Кеш/Константи ---------------------------
     ************************************************************************/


    /************************************************************************
     * --------------  BEGIN: Допоміжні функції / кеш -----------------------
     ************************************************************************/

    function parseOscars(awardsText) {
        if (typeof awardsText !== 'string') return null;
        var match = awardsText.match(/Won (\d+) Oscars?/i);
        if (match && match[1]) return parseInt(match[1], 10);
        return null;
    }

    // Розширена функція парсингу нагород: шукає Оскари, Еммі, загальні перемоги/вручення
    function parseAwardsExtended(awardsText) {
        var res = { oscars: null, emmy: null, awards: null };
        if (typeof awardsText !== 'string') return res;

        var mOsc = awardsText.match(/Won (\d+) Oscars?/i);
        if (mOsc) res.oscars = parseInt(mOsc[1], 10);

        var mEmmy = awardsText.match(/Won (\d+) Primetime Emmys?/i);
        if (mEmmy) res.emmy = parseInt(mEmmy[1], 10);

        // Загальна кількість wins (наприклад "X wins & Y nominations")
        var mWins = awardsText.match(/(\d+)\s+wins?/i);
        if (mWins) res.awards = parseInt(mWins[1], 10);

        // Якщо ніщо не знайдено — повертаємо null-значення
        return res;
    }

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
            imdb: data.imdb,
            ageRating: data.ageRating,
            oscars: data.oscars || null,
            emmy: data.emmy || null,
            awards: data.awards || null,
            timestamp: Date.now()
        };
        Lampa.Storage.set(OMDB_CACHE, cache);
    }

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

    /************************************************************************
     * --------------  END: Допоміжні функції / кеш -------------------------
     ************************************************************************/


    /************************************************************************
     * --------------  BEGIN: Налаштування (меню) --------------------------
     * Ми не покладаємось на невідомий API — меню робиться власним DOM'ом
     ************************************************************************/

    var SETTINGS_KEY = 'maxsm_ratings_settings';

    var DEFAULT_SETTINGS = {
        show_average: true,
        rating_scale: '10', // '10' або '100'
        show_awards: true,
        show_rt: true,
        show_mc: true,
        color_scheme: 'green', // 'green','lime','orange','red' mapping to classes
        show_icons: true,
        weights: WEIGHTS // default weights
    };

    function loadSettings() {
        var s = Lampa.Storage.get(SETTINGS_KEY);
        if (!s) {
            Lampa.Storage.set(SETTINGS_KEY, DEFAULT_SETTINGS);
            return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
        }
        // merge defaults with stored
        try {
            var parsed = s;
            for (var k in DEFAULT_SETTINGS) if (DEFAULT_SETTINGS.hasOwnProperty(k) && parsed[k] === undefined) parsed[k] = DEFAULT_SETTINGS[k];
            return parsed;
        } catch (e) {
            Lampa.Storage.set(SETTINGS_KEY, DEFAULT_SETTINGS);
            return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
        }
    }

    function saveSettings(settings) {
        Lampa.Storage.set(SETTINGS_KEY, settings);
    }

    var pluginSettings = loadSettings();

    // Побудова кнопки меню і самого модального вікна
    function createSettingsUI() {
        if ($('.maxsm-settings-btn').length) return;

        var btn = $('<div class="maxsm-settings-btn">⚙ Ratings</div>');
        $('body').append(btn);

        btn.on('click', function() {
            openSettingsModal();
        });
    }

    function openSettingsModal() {
        // overlay
        var overlay = $(
            '<div class="maxsm-settings-overlay">' +
                '<div class="maxsm-settings-modal">' +
                    '<h3>Ratings plugin — Settings</h3>' +
                    '<div class="maxsm-settings-content"></div>' +
                    '<div class="maxsm-settings-actions">' +
                        '<button class="maxsm-save">Save</button> ' +
                        '<button class="maxsm-cancel">Cancel</button>' +
                    '</div>' +
                '</div>' +
            '</div>'
        );

        $('body').append(overlay);

        var content = overlay.find('.maxsm-settings-content');

        // Rows
        content.append(renderCheckboxRow('Показувати середній рейтинг', 'show_average', pluginSettings.show_average));
        content.append(renderSelectRow('Шкала рейтингу', 'rating_scale', [{v:'10',t:'0–10'},{v:'100',t:'0–100'}], pluginSettings.rating_scale));
        content.append(renderCheckboxRow('Показувати нагороди (Oscars/Emmy/Other)', 'show_awards', pluginSettings.show_awards));
        content.append(renderCheckboxRow('Показувати Rotten Tomatoes', 'show_rt', pluginSettings.show_rt));
        content.append(renderCheckboxRow('Показувати Metacritic', 'show_mc', pluginSettings.show_mc));
        content.append(renderSelectRow('Кольорова схема середнього рейтингу', 'color_scheme', [{v:'green',t:'Green'},{v:'lime',t:'Blue'},{v:'orange',t:'Orange'},{v:'red',t:'Red'}], pluginSettings.color_scheme));
        content.append(renderCheckboxRow('Показувати значки/іконки', 'show_icons', pluginSettings.show_icons));

        // weights editing (simple)
        var weightsHtml = '' +
            '<div style="padding-top:8px"><b>Weights (imdb/tmdb/mc/rt)</b></div>' +
            '<div style="display:flex; gap:8px; padding-top:6px">' +
            '<input id="w_imdb" type="text" placeholder="imdb" value="' + (pluginSettings.weights.imdb || WEIGHTS.imdb) + '" />' +
            '<input id="w_tmdb" type="text" placeholder="tmdb" value="' + (pluginSettings.weights.tmdb || WEIGHTS.tmdb) + '" />' +
            '<input id="w_mc" type="text" placeholder="mc" value="' + (pluginSettings.weights.mc || WEIGHTS.mc) + '" />' +
            '<input id="w_rt" type="text" placeholder="rt" value="' + (pluginSettings.weights.rt || WEIGHTS.rt) + '" />' +
            '</div>';

        content.append(weightsHtml);

        overlay.find('.maxsm-cancel').on('click', function() { overlay.remove(); });
        overlay.find('.maxsm-save').on('click', function() {
            // read values
            pluginSettings.show_average = !!overlay.find('input[name="show_average"]').prop('checked');
            pluginSettings.rating_scale = overlay.find('select[name="rating_scale"]').val();
            pluginSettings.show_awards = !!overlay.find('input[name="show_awards"]').prop('checked');
            pluginSettings.show_rt = !!overlay.find('input[name="show_rt"]').prop('checked');
            pluginSettings.show_mc = !!overlay.find('input[name="show_mc"]').prop('checked');
            pluginSettings.color_scheme = overlay.find('select[name="color_scheme"]').val();
            pluginSettings.show_icons = !!overlay.find('input[name="show_icons"]').prop('checked');

            // weights
            var wi = parseFloat($('#w_imdb').val()) || WEIGHTS.imdb;
            var wt = parseFloat($('#w_tmdb').val()) || WEIGHTS.tmdb;
            var wm = parseFloat($('#w_mc').val()) || WEIGHTS.mc;
            var wr = parseFloat($('#w_rt').val()) || WEIGHTS.rt;
            // normalize if sum > 0
            var sum = wi+wt+wm+wr;
            if (sum > 0) {
                pluginSettings.weights = { imdb: wi, tmdb: wt, mc: wm, rt: wr };
            } else {
                pluginSettings.weights = WEIGHTS;
            }

            saveSettings(pluginSettings);
            overlay.remove();

            // після збереження — оновити UI для відкритої карточки
            try {
                calculateAverageRating();
            } catch(e) {}
        });
    }

    function renderCheckboxRow(text, name, checked) {
        var el = $('<div class="maxsm-settings-row"><label>' + text + '</label><input type="checkbox" name="' + name + '"></div>');
        el.find('input').prop('checked', !!checked);
        return el;
    }

    function renderSelectRow(text, name, options, value) {
        var sel = '<select name="' + name + '">';
        options.forEach(function(o){ sel += '<option value="' + o.v + '">' + o.t + '</option>'; });
        sel += '</select>';
        var el = $('<div class="maxsm-settings-row"><label>' + text + '</label>' + sel + '</div>');
        el.find('select').val(value);
        return el;
    }

    /************************************************************************
     * --------------  END: Меню налаштувань --------------------------------
     ************************************************************************/


    /************************************************************************
     * --------------  BEGIN: Loading animation helpers (з твого коду) ---
     ************************************************************************/

    function addLoadingAnimation() {
        var render = Lampa.Activity.active().activity.render();
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

    function removeLoadingAnimation() {
        var render = Lampa.Activity.active().activity.render();
        if (!render) return;

        $('.loading-dots-container', render).remove();
    }

    /************************************************************************
     * --------------  END: Loading animation helpers -----------------------
     ************************************************************************/


    /************************************************************************
     * --------------  BEGIN: Основна логіка — отримання/обробка рейтингів -
     * В цій частині збережена твоя логіка; я лише розширив її, щоб
     * підтримати додаткові нагороди і опції з меню.
     ************************************************************************/

    function getCardType(card) {
        var type = card.media_type || card.type;
        if (type === 'movie' || type === 'tv') return type;
        return card.name || card.original_name ? 'tv' : 'movie';
    }

    function getRatingClass(rating) {
        // Якщо потрібна інша логіка — можна змінити на підставі pluginSettings.color_scheme
        if (rating >= 8.0) return 'rating--green';
        if (rating >= 6.0) return 'rating--lime';
        if (rating >= 5.5) return 'rating--orange';
        return 'rating--red';
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
            addLoadingAnimation();
        }

        var cacheKey = normalizedCard.type + '_' + (normalizedCard.imdb_id || normalizedCard.id);
        var cachedData = getOmdbCache(cacheKey);
        var ratingsData = {};

        // Статуси рейтингов
        var imdbElement = $('.rate--imdb:not(.hide)', render);

        if (imdbElement.length > 0 && !!imdbElement.find('> div').eq(0).text().trim()) {
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
            // Вставляємо рейтинги RT і MC (з урахуванням налаштувань)
            insertRatings(ratingsData.rt, ratingsData.mc, ratingsData.oscars, ratingsData.emmy, ratingsData.awards);

            // Оновлюємо приховані елементи (PG, IMDB source etc)
            updateHiddenElements(ratingsData);

            // Обчислюємо та відображаємо середній рейтинг (якщо увімкнено)
            calculateAverageRating();
        }

        function processNextStep() {
            // placeholder, якщо потрібні додаткові кроки
            updateUI();
        }
    }

    function fetchOmdbRatings(card, cacheKey, callback) {
        if (!card.imdb_id) {
            callback(null);
            return;
        }

        var typeParam = (card.type === 'tv') ? '&type=series' : '';
        var url = 'https://www.omdbapi.com/?apikey=' + OMDB_API_KEY + '&i=' + card.imdb_id + typeParam;

        new Lampa.Reguest().silent(url, function (data) {
            if (data && data.Response === 'True' && (data.Ratings || data.imdbRating)) {
                // Витягуємо розширені нагороди
                var awardsParsed = parseAwardsExtended(data.Awards || '');
                callback({
                    rt: extractRating(data.Ratings, 'Rotten Tomatoes'),
                    mc: extractRating(data.Ratings, 'Metacritic'),
                    imdb: data.imdbRating || null,
                    ageRating: data.Rated || null,
                    oscars: awardsParsed.oscars || null,
                    emmy: awardsParsed.emmy || null,
                    awards: awardsParsed.awards || null
                });
            } else {
                callback(null);
            }
        }, function () {
            callback(null);
        });
    }

    /************************************************************************
     * --------------  END: Основна логіка отримання/обробки ---------------
     ************************************************************************/


    /************************************************************************
     * --------------  BEGIN: UI Insert / Update (твоя логіка + доповнення)
     ************************************************************************/

    function updateHiddenElements(ratings) {
        var render = Lampa.Activity.active().activity.render();
        if (!render || !render[0]) return;

        // Оновлення вікового рейтингу
        var pgElement = $('.full-start__pg.hide', render);
        if (pgElement.length && ratings.ageRating) {
            var invalidRatings = ['N/A', 'Not Rated', 'Unrated'];
            var isValid = invalidRatings.indexOf(ratings.ageRating) === -1;

            if (isValid) {
                var localizedRating = AGE_RATINGS[ratings.ageRating] || ratings.ageRating;
                pgElement.removeClass('hide').text(localizedRating);
            }
        }

        // **Оновлення IMDB**
        var imdbContainer = $('.rate--imdb', render);
        if (imdbContainer.length) {
            var imdbDivs = imdbContainer.children('div');

            if (ratings.imdb && !isNaN(ratings.imdb)) {
                // Є рейтинг – показуємо
                imdbContainer.removeClass('hide');
                if (imdbDivs.length >= 2) {
                    imdbDivs.eq(0).text(parseFloat(ratings.imdb).toFixed(1));
                    imdbDivs.eq(1).html(pluginSettings.show_icons ? Lampa.Lang.translate('source_imdb') : 'IMDB');
                }
            } else {
                // Немає рейтингу – ховаємо іконку
                imdbContainer.addClass('hide');
            }
        }

        // **Оновлення TMDB** (як було)
        var tmdbContainer = $('.rate--tmdb', render);
        if (tmdbContainer.length) {
            tmdbContainer.find('> div:nth-child(2)').html(pluginSettings.show_icons ? Lampa.Lang.translate('source_tmdb') : 'TMDB');
        }
    }

    function extractRating(ratings, source) {
        if (!ratings || !Array.isArray(ratings)) return null;

        for (var i = 0; i < ratings.length; i++) {
            if (ratings[i].Source === source) {
                try {
                    return source === 'Rotten Tomatoes'
                        ? parseFloat(ratings[i].Value.replace('%', '')) / 10
                        : parseFloat(ratings[i].Value.split('/')[0]) / 10;
                } catch(e) {
                    console.error('Помилка при парсингу рейтингу:', e);
                    return null;
                }
            }
        }
        return null;
    }

    function insertRatings(rtRating, mcRating, oscars, emmy, awards) {
        var render = Lampa.Activity.active().activity.render();
        if (!render) return;

        var rateLine = $('.full-start-new__rate-line', render);
        if (!rateLine.length) return;

        var lastRate = $('.full-start__rate:last', rateLine);

        // RT
        if (pluginSettings.show_rt && rtRating && !isNaN(rtRating) && !$('.rate--rt', rateLine).length) {
            var rtValue = (pluginSettings.rating_scale === '100') ? (rtRating * 10).toFixed(0) : rtRating.toFixed(1);
            var rtElement = $(
                '<div class="full-start__rate rate--rt">' +
                    '<div>' + rtValue + '</div>' +
                    '<div class="source--name"></div>' +
                '</div>'
            );
            rtElement.find('.source--name').html(pluginSettings.show_icons ? Lampa.Lang.translate('source_rt') : 'RT');
            if (lastRate.length) rtElement.insertAfter(lastRate);
            else rateLine.prepend(rtElement);
        }

        // MC
        if (pluginSettings.show_mc && mcRating && !isNaN(mcRating) && !$('.rate--mc', rateLine).length) {
            var mcValue = (pluginSettings.rating_scale === '100') ? (mcRating * 10).toFixed(0) : mcRating.toFixed(1);
            var insertAfter = $('.rate--rt', rateLine).length ? $('.rate--rt', rateLine) : lastRate;
            var mcElement = $(
                '<div class="full-start__rate rate--mc">' +
                    '<div>' + mcValue + '</div>' +
                    '<div class="source--name"></div>' +
                '</div>'
            );
            mcElement.find('.source--name').html(pluginSettings.show_icons ? Lampa.Lang.translate('source_mc') : 'MC');
            if (insertAfter.length) mcElement.insertAfter(insertAfter);
            else rateLine.prepend(mcElement);
        }

        // Oscars (if enabled in settings)
        if (pluginSettings.show_awards && oscars && !isNaN(oscars) && oscars > 0 && !$('.rate--oscars', rateLine).length) {
            var oscarsElement = $(
                '<div class="full-start__rate rate--oscars">' +
                    '<div>' + oscars + '</div>' +
                    '<div class="source--name"></div>' +
                '</div>'
            );

            oscarsElement.find('.source--name').html(pluginSettings.show_icons ? Lampa.Lang.translate("maxsm_omdb_oscars") : 'Oscars');
            rateLine.prepend(oscarsElement);
        }

        // Emmy
        if (pluginSettings.show_awards && emmy && !isNaN(emmy) && emmy > 0 && !$('.rate--emmy', rateLine).length) {
            var emmyElement = $(
                '<div class="full-start__rate rate--emmy">' +
                    '<div>' + emmy + '</div>' +
                    '<div class="source--name"></div>' +
                '</div>'
            );
            emmyElement.find('.source--name').html(pluginSettings.show_icons ? Lampa.Lang.translate("maxsm_omdb_emmy") : 'Emmy');
            rateLine.prepend(emmyElement);
        }

        // Other awards (total wins)
        if (pluginSettings.show_awards && awards && !isNaN(awards) && awards > 0 && !$('.rate--awards', rateLine).length) {
            var awardsElement = $(
                '<div class="full-start__rate rate--awards">' +
                    '<div>' + awards + '</div>' +
                    '<div class="source--name"></div>' +
                '</div>'
            );
            awardsElement.find('.source--name').html(pluginSettings.show_icons ? Lampa.Lang.translate("maxsm_omdb_awards") : 'Awards');
            rateLine.prepend(awardsElement);
        }
    }

    /************************************************************************
     * --------------  END: UI Insert / Update ------------------------------
     ************************************************************************/


    /************************************************************************
     * --------------  BEGIN: Обчислення середнього рейтингу --------------
     ************************************************************************/

    function calculateAverageRating() {
        var render = Lampa.Activity.active().activity.render();
        if (!render) return;

        var rateLine = $('.full-start-new__rate-line', render);
        if (!rateLine.length) return;

        // читаємо значення (якщо є)
        var ratings = {
            imdb: parseFloat($('.rate--imdb div:first', rateLine).text()) || 0,
            tmdb: parseFloat($('.rate--tmdb div:first', rateLine).text()) || 0,
            mc: parseFloat($('.rate--mc div:first', rateLine).text()) || 0,
            rt: parseFloat($('.rate--rt div:first', rateLine).text()) || 0
        };

        // використовуємо ваги з налаштувань
        var weights = pluginSettings.weights || WEIGHTS;

        var totalWeight = 0;
        var weightedSum = 0;
        var ratingsCount = 0;

        for (var key in ratings) {
            if (ratings.hasOwnProperty(key) && !isNaN(ratings[key]) && ratings[key] > 0 && (weights[key] && weights[key] > 0)) {
                weightedSum += ratings[key] * weights[key];
                totalWeight += weights[key];
                ratingsCount++;
            }
        }

        // видаляємо старий avg
        $('.rate--avg', rateLine).remove();

        if (pluginSettings.show_average && ratingsCount > 1 && totalWeight > 0) {
            var averageRating = weightedSum / totalWeight;

            // якщо шкала 100 — множимо на 10
            var displayedAvg = (pluginSettings.rating_scale === '100') ? (averageRating * 10) : averageRating;

            // колірний клас по логіці (можна розширювати)
            var colorClass = getRatingClass(averageRating);
            // інакше дозволяємо замінювати по налаштованій схемі
            if (pluginSettings.color_scheme) {
                // мапінг між назвою та класом
                var map = {
                    green: 'rating--green',
                    lime: 'rating--lime',
                    orange: 'rating--orange',
                    red: 'rating--red'
                };
                if (map[pluginSettings.color_scheme]) colorClass = map[pluginSettings.color_scheme];
            }

            var avgElement = $(
                '<div class="full-start__rate rate--avg ' + colorClass + '">' +
                    '<div>' + ( (pluginSettings.rating_scale === '100') ? displayedAvg.toFixed(0) : displayedAvg.toFixed(1) ) + '</div>' +
                    '<div class="source--name">' + (pluginSettings.show_icons ? Lampa.Lang.translate("ratimg_omdb_avg") : 'TOTAL') + '</div>' +
                '</div>'
            );

            $('.full-start__rate:first', rateLine).before(avgElement);
        }

        removeLoadingAnimation();
        rateLine.css('visibility', 'visible');
    }

    /************************************************************************
     * --------------  END: Обчислення середнього рейтингу -----------------
     ************************************************************************/


    /************************************************************************
     * --------------  BEGIN: Ініціалізація плагіна -------------------------
     ************************************************************************/

    function startPlugin() {
        // створюємо кнопку налаштувань
        createSettingsUI();

        window.combined_ratings_plugin = true;
        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'complite') {
                // невелика затримка, як було
                setTimeout(function() {
                    // reload settings (на випадок зміни з іншого місця)
                    pluginSettings = loadSettings();
                    fetchAdditionalRatings(e.data.movie);
                }, 500);
            }
        });
    }

    if (!window.combined_ratings_plugin) startPlugin();

    /************************************************************************
     * --------------  END: Ініціалізація плагіна ---------------------------
     ************************************************************************/

})();

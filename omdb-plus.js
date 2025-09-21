// ==UserScript==
// @name         OMDB Plus Ratings & Awards
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Плагін Lampa: RT, MC, IMDb, віковий рейтинг + нагороди (як у RT+)
// ==/UserScript==

(function(){
    const OMDB_CACHE = 'omdb_plus_cache';
    const SETTINGS_KEY = 'omdb_plus_settings';

    const DEFAULT_SETTINGS = {
        show_imdb: true,
        show_tmdb: true,
        show_rt: true,
        show_mc: true,
        show_age: true,
        show_awards: true
    };

    function getSettings() {
        return Object.assign({}, DEFAULT_SETTINGS, Lampa.Storage.get(SETTINGS_KEY) || {});
    }
    function saveSettings(s) {
        Lampa.Storage.set(SETTINGS_KEY, s);
    }

    function parseAwards(awardsText) {
        if (typeof awardsText !== 'string' || !awardsText.trim()) {
            return {
                text: '',
                oscarsWon: 0,
                oscarsNominated: 0,
                otherWins: 0,
                otherNominations: 0,
                totalWins: 0,
                totalNominations: 0
            };
        }
        const txt = awardsText;
        const getInt = (m) => m ? parseInt(m[1], 10) : 0;
        const mWonOscars = txt.match(/Won\s+(\d+)\s+Oscars?/i);
        const oscarsWon = getInt(mWonOscars);
        const mNomOscars = txt.match(/Nominated\s+for\s+(\d+)\s+Oscars?/i);
        const oscarsNominated = getInt(mNomOscars);
        let otherWins = 0, otherNominations = 0;
        const mAnother = txt.match(/Another\s+(\d+)\s+wins?\s*&\s*(\d+)\s+nominations?/i);
        if (mAnother) {
            otherWins = parseInt(mAnother[1],10);
            otherNominations = parseInt(mAnother[2],10);
        } else {
            const mWinsNoms = txt.match(/(\d+)\s+wins?\s*&\s*(\d+)\s+nominations?/i);
            if (mWinsNoms) {
                otherWins = parseInt(mWinsNoms[1],10);
                otherNominations = parseInt(mWinsNoms[2],10);
            } else {
                const mWinsOnly = txt.match(/(\d+)\s+wins?/i);
                if (mWinsOnly) otherWins = parseInt(mWinsOnly[1],10);
                const mNomsOnly = txt.match(/(\d+)\s+nominations?/i);
                if (mNomsOnly) otherNominations = parseInt(mNomsOnly[1],10);
            }
        }
        return {
            text: awardsText,
            oscarsWon,
            oscarsNominated,
            otherWins,
            otherNominations,
            totalWins: oscarsWon + otherWins,
            totalNominations: oscarsNominated + otherNominations
        };
    }

    function insertAwards(awards) {
        const settings = getSettings();
        if (!settings.show_awards) return;
        const render = Lampa.Activity.active().activity.render();
        if (!render) return;
        const rateLine = $('.full-start-new__rate-line', render);
        if (!rateLine.length) return;
        $('.rate--awards', rateLine).remove();
        if (!awards || (!awards.oscarsWon && !awards.otherWins && !awards.otherNominations)) return;
        const parts = [];
        if (awards.oscarsWon>0) parts.push('🏆 '+awards.oscarsWon+' Oscars');
        if (awards.oscarsNominated>0) parts.push('🎬 '+awards.oscarsNominated+' Noms');
        if (awards.otherWins>0) parts.push('⭐ '+awards.otherWins+' wins');
        if (awards.otherNominations>0) parts.push('🎗 '+awards.otherNominations+' noms');
        const short = parts.join(' • ');
        const el = $('<div class="full-start__rate rate--awards"><div>'+short+'</div><div class="source--name">Awards</div></div>');
        rateLine.prepend(el);
        el.on('hover:enter', function(){
            const details = $('.rate--awards-details', rateLine);
            if (details.length) {
                details.remove();
                return;
            }
            const d = $('<div class="rate--awards-details" style="padding:0.5em 1em;font-size:0.85em;">'+(awards.text||'—')+'</div>');
            el.after(d);
        });
    }

    Lampa.Settings.add({
        title: 'Рейтинги & Нагороди',
        id: 'omdb_plus',
        html: function() {
            const el = $('<div></div>');
            const s = getSettings();
            Object.keys(DEFAULT_SETTINGS).forEach(function(key){
                const label = key.replace('show_','').toUpperCase();
                const row = $('<div class="settings-param selector">'+label+'</div>');
                row.toggleClass('active', s[key]);
                row.on('hover:enter', function(){
                    s[key] = !s[key];
                    saveSettings(s);
                    row.toggleClass('active', s[key]);
                });
                el.append(row);
            });
            return el;
        }
    });

    function fetchOmdbRatings(imdbID, cb){
        fetch('https://www.omdbapi.com/?apikey=YOURKEY&i=' + imdbID)
        .then(r=>r.json())
        .then(data=>{
            const awards = parseAwards(data.Awards||'');
            cb({rt:data.Ratings, mc:data.Metascore, imdb:data.imdbRating, ageRating:data.Rated, awards:awards});
        })
        .catch(()=>cb(null));
    }

    function updateUI(ratingsData){
        if (ratingsData && ratingsData.awards) insertAwards(ratingsData.awards);
        // решта твоєї логіки оновлення UI для RT, MC, IMDB, ageRating
    }

})();
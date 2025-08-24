// ==UserScript==
// @name         Ratings Combined (JacRed + tmdb-proxy)
// @namespace    http://cub.red/plugin
// @version      1.0
// @description  Показ жовтих бірок з якістю у всіх категоріях Lampa (потрібен tmdb-proxy). Поєднання ratings.js + ratings_new.js логіки.
// @author       ChatGPT
// @match        *://cub.red/*
// @grant        none
// ==/UserScript==

(function(){
    'use strict';

    const Q_LOGGING = false;
    const QUALITY_CACHE = {};

    function log(...args){ if(Q_LOGGING) console.log('[RATINGS]', ...args); }

    function fetchQuality(title, year){
        const key = `${title}_${year||''}`;
        if(QUALITY_CACHE[key]) return Promise.resolve(QUALITY_CACHE[key]);

        let url = `https://jacred.fun/api/v1.0/torrents?search=${encodeURIComponent(title)}`;
        if(year) url += `&year=${year}`;

        return fetch(url).then(r=>r.json()).then(data=>{
            if(!data.results || !data.results.length) return {};
            let q = data.results[0].quality || '';
            QUALITY_CACHE[key] = {quality:q};
            return {quality:q};
        }).catch(err=>{
            log('JacRed error',err);
            return {};
        });
    }

    function translateQuality(q){
        q = (q||'').toLowerCase();
        if(q.includes('2160')) return '4K';
        if(q.includes('1080')) return 'FHD';
        if(q.includes('720')) return 'HD';
        if(q.includes('ts')) return 'TS';
        return q.toUpperCase() || '?';
    }

    function addBadge(element, text){
        if(!element) return;
        element.querySelectorAll('.q-badge').forEach(e=>e.remove());
        const span = document.createElement('div');
        span.className = 'q-badge';
        span.innerText = text;
        span.style.position = 'absolute';
        span.style.bottom = '5px';
        span.style.left = '5px';
        span.style.background = '#FFD600';
        span.style.padding = '2px 5px';
        span.style.borderRadius = '5px';
        span.style.color = '#000';
        span.style.fontWeight = 'bold';
        element.appendChild(span);
    }

    function processCard(card, movie){
        if(!card || !movie) return;

        const title = movie.title || movie.name || movie.original_title;
        const year = movie.release_year || (movie.release_date||'').split('-')[0];

        // малюємо бірку одразу, навіть порожню (щоб було видно місце)
        addBadge(card, '…');

        fetchQuality(title,year).then(q=>{
            if(q.quality){
                addBadge(card, translateQuality(q.quality));
            } else {
                addBadge(card, '?');
            }
        });
    }

    function handler(e){
        if(e.type === 'build' || e.type === 'full' || e.type === 'card' || e.type === 'line' || e.type === 'items'){
            const card = e.card;
            const movie = e.data || card?.data;
            if(card && movie){
                processCard(card, movie);
            }
        }
    }

    // Слухаємо всі можливі типи карток
    Lampa.Listener.follow('full', handler);
    Lampa.Listener.follow('card', handler);
    Lampa.Listener.follow('line', handler);
    Lampa.Listener.follow('items', handler);
    Lampa.Listener.follow('build', handler);

    log('Ratings Combined plugin loaded');

})();

// ==UserScript==
// @name         Ratings Plugin (Updated with line/items support)
// @namespace    http://cub.red/plugin
// @version      2.0
// @description  Додає оцінки (IMDb, KP) і якість (JacRed) у всі категорії, включно з "Тренди" та "Кінотеатри"
// @author       ko31k + ChatGPT
// @match        *://cub.red/*
// @grant        none
// ==/UserScript==

(function(){
    'use strict';

    const PROXY_LIST = [
        'https://cors.bwa.workers.dev/?u=',
        'https://api.allorigins.win/raw?url='
    ];

    const OMDB_CACHE = {};
    const KP_CACHE = {};
    const QUALITY_CACHE = {};

    const optimize = Lampa.Storage.get('maxsm_ratings_optimize', '0');

    function log(...args){ console.log('[RATINGS]', ...args); }

    function fetchWithProxy(url){
        return new Promise((resolve,reject)=>{
            let index = 0;
            function tryNext(){
                if(index >= PROXY_LIST.length){
                    reject('All proxies failed');
                    return;
                }
                const proxyUrl = PROXY_LIST[index++] + encodeURIComponent(url);
                fetch(proxyUrl).then(r=>{
                    if(!r.ok) throw new Error(r.statusText);
                    return r.text();
                }).then(resolve).catch(tryNext);
            }
            tryNext();
        });
    }

    function fetchKPRating(id){
        if(KP_CACHE[id]) return Promise.resolve(KP_CACHE[id]);
        const url = `https://rating.kinopoisk.ru/${id}.xml`;
        return fetchWithProxy(url).then(xml=>{
            const kpMatch = xml.match(/<kp_rating>([\d.]+)<\/kp_rating>/);
            const imdbMatch = xml.match(/<imdb_rating>([\d.]+)<\/imdb_rating>/);
            const result = {};
            if(kpMatch) result.kinopoisk = parseFloat(kpMatch[1]);
            if(imdbMatch) result.imdb = parseFloat(imdbMatch[1]);
            KP_CACHE[id] = result;
            return result;
        }).catch(err=>{
            log('KP error',err);
            return {};
        });
    }
    function fetchQuality(title,year){
        const key = `${title}_${year}`;
        if(QUALITY_CACHE[key]) return Promise.resolve(QUALITY_CACHE[key]);
        const url = `https://jacred.fun/api/v1.0/torrents?search=${encodeURIComponent(title)}&year=${year}`;
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
        return q.toUpperCase();
    }

    function applyRatings(element, movie){
        if(!movie) return;

        const id = movie.id || movie.kinopoisk_id;
        const title = movie.title || movie.name || movie.original_title;
        const year = movie.release_year || (movie.release_date||'').split('-')[0];

        if(!id && (!title || !year)) return;

        // IMDb/KP
        if(id){
            fetchKPRating(id).then(ratings=>{
                if(ratings.kinopoisk){
                    element.querySelectorAll('.kp-rating').forEach(e=>e.remove());
                    const span = document.createElement('div');
                    span.className = 'kp-rating';
                    span.innerText = ratings.kinopoisk.toFixed(1);
                    span.style.position = 'absolute';
                    span.style.top = '5px';
                    span.style.right = '5px';
                    span.style.background = 'rgba(0,0,0,0.7)';
                    span.style.padding = '2px 5px';
                    span.style.borderRadius = '5px';
                    span.style.color = '#fff';
                    element.appendChild(span);
                }
            });
        }
        // Quality
        fetchQuality(title,year).then(q=>{
            if(q.quality){
                element.querySelectorAll('.q-badge').forEach(e=>e.remove());
                const span = document.createElement('div');
                span.className = 'q-badge';
                span.innerText = translateQuality(q.quality);
                span.style.position = 'absolute';
                span.style.bottom = '5px';
                span.style.left = '5px';
                span.style.background = '#FFD600';
                span.style.padding = '2px 5px';
                span.style.borderRadius = '5px';
                span.style.color = '#000';
                element.appendChild(span);
            }
        });
    }

    function handler(e){
        if(e.type === 'build' || e.type === 'full' || e.type === 'card' || e.type === 'line' || e.type === 'items'){
            const card = e.card;
            const movie = e.data || card?.data;
            if(card && movie){
                applyRatings(card, movie);
            }
        }
    }

    Lampa.Listener.follow('full', handler);
    Lampa.Listener.follow('card', handler);
    Lampa.Listener.follow('line', handler);
    Lampa.Listener.follow('items', handler);
    Lampa.Listener.follow('build', handler);

    log('Plugin loaded with extended support');

})();

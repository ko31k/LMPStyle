// ==UserScript==
// @name         Ratings Combined DOM (JacRed + tmdb-proxy aware)
// @namespace    http://cub.red/plugin
// @version      1.1
// @description  Жовті бірки якості у всіх категоріях Lampa. Працює разом із tmdb-proxy (не дублює вже намальовані бірки). DOM-спостерігач без залежності від Lampa.Listener.
// @author       ChatGPT
// @match        *://cub.red/*
// @grant        none
// ==/UserScript==
(function(){
  'use strict';

  // ===== Config =====
  const DEBUG = false;
  const MAX_CONCURRENCY = 4;
  const PROXY_LIST = [
    (u)=>`https://jacred.fun${u}`,
    (u)=>`https://cors.bwa.workers.dev/?u=${encodeURIComponent('https://jacred.fun'+u)}`,
    (u)=>`https://api.allorigins.win/raw?url=${encodeURIComponent('https://jacred.fun'+u)}`
  ];

  // ===== State =====
  const CACHE = new Map();     // key: title|year -> {quality, ts}
  const INFLIGHT = new Map();  // key -> Promise
  let activeFetches = 0;

  // ===== Utils =====
  const log = (...a)=>{ if(DEBUG) console.log('[RATINGS-COMBINED]', ...a); };

  function rankQuality(q){
    if(!q) return 0;
    const s = String(q).toLowerCase();
    if(s.includes('2160') || s.includes('4k')) return 100;
    if(s.includes('1080') || s.includes('fhd')) return 80;
    if(s.includes('720')  || s.includes('hd'))  return 60;
    if(s.includes('webrip')||s.includes('webdl')||s.includes('web')) return 50;
    if(s.includes('hdrip')) return 40;
    if(s.includes('ts'))     return 20;
    if(s.includes('cam'))    return 10;
    return 1;
  }

  function translateQuality(q){
    const s = String(q||'').toLowerCase();
    if(s.includes('2160') || s.includes('4k')) return '4K';
    if(s.includes('1080') || s.includes('fhd')) return 'FHD';
    if(s.includes('720')  || s.includes('hd'))  return 'HD';
    if(s.includes('ts')) return 'TS';
    if(s.includes('cam')) return 'CAM';
    if(s.includes('webrip') || s.includes('webdl') || s.includes('web')) return 'WEB';
    return (q||'?').toString().toUpperCase().slice(0,8);
  }

  function hasAnyQualityBadge(card){
    // наша бірка
    if(card.querySelector('.ratings-badge')) return true;
    // можливі чужі бірки (tmdb-proxy або інші): підбираємо загальні селектори
    const candidate = card.querySelector(
      '.q-badge, .quality, .torrent-quality, .badge, [class*="quality"], [class*="Quality"]'
    );
    if(!candidate) return false;
    const t = (candidate.textContent||'').toUpperCase();
    return /(4K|FHD|HD|TS|CAM|2160|1080|720|WEB)/.test(t);
  }

  function ensureRelative(card){
    const cs = getComputedStyle(card);
    if(cs.position === 'static'){
      card.style.position = 'relative';
    }
  }

  function addBadge(card, text){
    ensureRelative(card);
    let el = card.querySelector('.ratings-badge');
    if(!el){
      el = document.createElement('div');
      el.className = 'ratings-badge';
      el.style.position = 'absolute';
      el.style.left = '6px';
      el.style.bottom = '6px';
      el.style.padding = '2px 6px';
      el.style.borderRadius = '6px';
      el.style.fontWeight = '600';
      el.style.fontSize = '12px';
      el.style.background = '#FFD600';
      el.style.color = '#000';
      el.style.zIndex = '3';
      card.appendChild(el);
    }
    el.textContent = text;
  }

  function extractText(el, sel){
    const n = el.querySelector(sel);
    return n ? (n.textContent || '').trim() : '';
  }

  function getCardInfo(card){
    try{
      // 1) якщо tmdb-proxy/Lampa поклав дані в card.card_data
      const cd = card.card_data || card.data;
      if(cd){
        const title = cd.title || cd.name || cd.original_title || cd.original_name || '';
        const year = (cd.release_year) ? String(cd.release_year)
                   : (cd.release_date ? String(cd.release_date).slice(0,4) : '');
        if(title) return {title, year};
      }

      // 2) dataset
      const ds = card.dataset || {};
      const titleDS = ds.title || ds.name || ds.originalTitle || ds.originalName || '';
      const yearDS = ds.year || ds.releaseYear || '';
      if(titleDS) return {title: titleDS, year: yearDS};

      // 3) DOM
      const titleDom = extractText(card, '.card__title, .card__name, .name, .title');
      let yearDom = extractText(card, '.card__age, .card__meta, .card__subline, .meta, .subtitle');
      // шукаємо рік у тексті
      const m = yearDom.match(/(19|20)\d{2}/);
      if(!yearDom && titleDom){
        const m2 = titleDom.match(/\((19|20)\d{2}\)/);
        if(m2) yearDom = m2[0].replace(/[()]/g,'');
      }
      return {title: titleDom, year: m ? m[0] : yearDom};
    }catch(e){
      log('getCardInfo error', e);
      return {title:'', year:''};
    }
  }

  function fetchJacredBest(title, year){
    if(!title) return Promise.resolve({quality: null});

    const key = `${title}__${year||''}`.toLowerCase();
    if(CACHE.has(key)) return Promise.resolve(CACHE.get(key));
    if(INFLIGHT.has(key)) return INFLIGHT.get(key);

    const doFetch = ()=> new Promise((resolve)=>{
      const endpoint = `/api/v1.0/torrents?search=${encodeURIComponent(title)}${year?`&year=${encodeURIComponent(year)}`:''}`;

      let idx = 0;
      const tryNext = ()=>{
        if(idx >= PROXY_LIST.length){
          resolve({quality:null});
          return;
        }
        const url = PROXY_LIST[idx++](endpoint);
        fetch(url).then(r=>{
          if(!r.ok) throw new Error('HTTP '+r.status);
          return r.json();
        }).then(json=>{
          const arr = (json && json.results) ? json.results : [];
          if(!arr.length){ resolve({quality:null}); return; }
          // вибрати найкращу якість
          let best = {quality:null, score:0};
          for(const it of arr){
            const q = it.quality || it.Quality || '';
            const score = rankQuality(q);
            if(score > best.score) best = {quality:q, score};
          }
          resolve({quality: best.quality});
        }).catch(err=>{
          log('Jacred proxy fail', err);
          tryNext();
        });
      };
      tryNext();
    }).finally(()=>{ activeFetches = Math.max(0, activeFetches-1); });

    // повага до ліміту конкурентності
    const p = new Promise((resolve)=>{
      const tick = ()=>{
        if(activeFetches < MAX_CONCURRENCY){
          activeFetches++;
          doFetch().then(resolve);
        }else{
          setTimeout(tick, 80);
        }
      };
      tick();
    });

    INFLIGHT.set(key, p);
    p.then(res=>{ CACHE.set(key, res); INFLIGHT.delete(key); });
    return p;
  }

  function processCard(card){
    if(!card || card.__ratingsProcessed) return;
    card.__ratingsProcessed = true;

    // якщо вже є бірка від tmdb-proxy або іншого — нічого не робимо
    if(hasAnyQualityBadge(card)) return;

    const {title, year} = getCardInfo(card);
    if(!title){
      log('skip (no title)', card);
      return;
    }

    // показати плейсхолдер
    addBadge(card, '…');

    fetchJacredBest(title, year).then(res=>{
      if(!document.body.contains(card)) return; // картку могли прибрати
      const q = res.quality ? translateQuality(res.quality) : '?';
      addBadge(card, q);
    });
  }

  // ===== Observers =====
  const seen = new WeakSet();

  const io = new IntersectionObserver((entries)=>{
    for(const ent of entries){
      if(ent.isIntersecting){
        const card = ent.target;
        io.unobserve(card);
        if(!seen.has(card)){
          seen.add(card);
          processCard(card);
        }
      }
    }
  }, {root:null, rootMargin:'200px', threshold:0.01});

  function scan(){
    // Lampa зазвичай використовує .card
    const cards = document.querySelectorAll('.card, .card--poster, [data-card], .video-card');
    for(const c of cards){
      if(c.__ratingsObserved) continue;
      c.__ratingsObserved = true;
      io.observe(c);
    }
  }

  const mo = new MutationObserver(()=> scan());
  mo.observe(document.body, {childList:true, subtree:true});
  // перший прохід
  scan();

  log('Ratings Combined DOM loaded');
})();

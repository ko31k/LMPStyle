(function () {
  'use strict';

  if (window.SeasonBadgePlugin && window.SeasonBadgePlugin.__initialized) return;
  window.SeasonBadgePlugin = window.SeasonBadgePlugin || {};
  window.SeasonBadgePlugin.__initialized = true;

  // === CSS у стилі Quality+, але вище на кілька em ===
  var style = document.createElement('style');
  style.textContent = `
  .card--seria-status {
    position: absolute;
    left: 0;
    bottom: calc(0.50em + 1.85em); /* вище мітки якості */
    z-index: 11;
    background: rgba(23,23,23,0.86);
    color: #fff;
    font-family: 'Roboto Condensed','Arial Narrow',Arial,sans-serif;
    font-weight: 700;
    font-size: 1.02em;
    border-radius: 0 0.8em 0.8em 0.3em;
    padding: 0.14em 0.5em 0.12em 0.5em;
    white-space: nowrap;
    text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.4);
    opacity:0;
    transition:opacity 0.2s;
  }
  .card--seria-status.show {opacity:1;}
  `;
  document.head.appendChild(style);

  function addSeriaBadge(cardEl){
    if (!cardEl || cardEl.hasAttribute('data-seria-status')) return;

    var data = cardEl.card_data;
    if (!data || !data.seasons) return; // тільки серіали

    var lastEp = data.last_episode_to_air;
    if (!lastEp) return;

    // шукаємо поточний сезон, відкидаючи сезон 0
    var season = data.seasons.find(function(s){
      return s.season_number === lastEp.season_number && s.season_number>0;
    });
    if (!season) return;

    // якщо ще не всі серії – нічого не показуємо
    if (lastEp.episode_number < (season.episode_count||0)) return;

    var view = cardEl.querySelector('.card__view');
    if (!view) return;

    // прибрати старий бейдж
    var old=view.querySelector('.card--seria-status');
    if(old) old.remove();

    var badge=document.createElement('div');
    badge.className='card--seria-status';
    badge.textContent='S'+season.season_number+' ✓';

    view.appendChild(badge);
    setTimeout(function(){badge.classList.add('show');},30);

    cardEl.setAttribute('data-seria-status','true');
  }

  // MutationObserver – ловимо додавання нових карток
  var observer = new MutationObserver(function(muts){
    muts.forEach(function(m){
      m.addedNodes.forEach(function(n){
        if (n.nodeType!==1) return;
        if (n.classList && n.classList.contains('card')) {
          setTimeout(function(){addSeriaBadge(n);},150);
        } else if (n.querySelectorAll) {
          n.querySelectorAll('.card').forEach(function(c){setTimeout(function(){addSeriaBadge(c);},150);});
        }
      });
    });
  });

  function initPlugin() {
    var containers=document.querySelectorAll('.cards,.card-list,.content,.main,.cards-list,.preview__list');
    if (containers.length) {
      containers.forEach(function(ct){observer.observe(ct,{childList:true,subtree:true});});
    } else observer.observe(document.body,{childList:true,subtree:true});

    // обробити наявні картки
    document.querySelectorAll('.card').forEach(function(c){addSeriaBadge(c);});

    console.log('SeasonBadgePlugin initialized');
  }

  if (window.appready) initPlugin();
  else if (window.Lampa && Lampa.Listener && Lampa.Listener.follow){
    Lampa.Listener.follow('app',function(e){if(e.type==='ready')initPlugin();});
  } else setTimeout(initPlugin,1000);

})();

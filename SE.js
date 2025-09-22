(function () {
  'use strict';

  if (window.SeasonBadgePluginV2 && window.SeasonBadgePluginV2.__initialized) return;
  window.SeasonBadgePluginV2 = window.SeasonBadgePluginV2 || {};
  window.SeasonBadgePluginV2.__initialized = true;

  // ======= Налаштування =======
  var CONFIG = {
    LOG: false,                // true => детальний лог у консолі
    POLL_INTERVAL: 800,        // ms
    POLL_MAX: 20,              // кількість опитувань
    BOTTOM_CALC: 'calc(0.50em + 1.85em)'
  };

  function debug() { if (CONFIG.LOG) console.log.apply(console, ['[SeasonBadgeV2]'].concat(Array.from(arguments))); }

  // ======= CSS (стиль як Quality+, трохи вище якості) =======
  var style = document.createElement('style');
  style.textContent = '\
  .card--seria-status {\
    position: absolute;\
    left: 0;\
    bottom: ' + CONFIG.BOTTOM_CALC + ';\
    z-index: 11;\
    background: rgba(23,23,23,0.86);\
    color: #fff;\
    font-family: \"Roboto Condensed\",\"Arial Narrow\",Arial,sans-serif;\
    font-weight: 700;\
    font-size: 1.02em;\
    border-radius: 0 0.8em 0.8em 0.3em;\
    padding: 0.14em 0.5em 0.12em 0.5em;\
    white-space: nowrap;\
    text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.4);\
    opacity: 0;\
    transition: opacity 0.22s ease-in-out;\
    box-sizing: border-box;\
  }\
  .card--seria-status.show { opacity: 1; }\
  @media (max-width:768px) { .card--seria-status { font-size: 0.98em; padding: 0.12em 0.38em; } }';
  document.head.appendChild(style);

  // ======= Утиліти для отримання даних картки =======
  function tryParseJSON(s) {
    try { return JSON.parse(s); } catch (e) { return null; }
  }

  function getCardData(cardEl) {
    if (!cardEl) return null;
    // прямі поля
    var candidates = ['card_data', 'card', 'cardData', '_card_data', '_card', 'data'];
    for (var i = 0; i < candidates.length; i++) {
      var k = candidates[i];
      if (cardEl[k]) {
        debug('getCardData found direct key', k);
        return cardEl[k];
      }
    }
    // dataset.card може містити JSON
    try {
      if (cardEl.dataset && cardEl.dataset.card) {
        var parsed = tryParseJSON(cardEl.dataset.card);
        if (parsed) {
          debug('getCardData parsed dataset.card');
          return parsed;
        }
      }
    } catch (e) { /* ignore */ }

    // спробуємо знайти у дочірніх елементах (іноді Lampa підвісила дані на внутрішні ноди)
    try {
      var childWithData = cardEl.querySelector && (cardEl.querySelector('[data-card]') || cardEl.querySelector('[data-item]'));
      if (childWithData && childWithData.dataset && childWithData.dataset.card) {
        var p = tryParseJSON(childWithData.dataset.card);
        if (p) {
          debug('getCardData parsed child dataset.card');
          return p;
        }
      }
    } catch (e) { /* ignore */ }

    return null;
  }

  function getNested(obj, path) {
    if (!obj) return null;
    var parts = Array.isArray(path) ? path : String(path).split('.');
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return null;
      cur = cur[parts[i]];
    }
    return cur;
  }

  function findProp(obj, names) {
    if (!obj) return null;
    for (var i = 0; i < names.length; i++) {
      var n = names[i];
      if (n.indexOf('.') !== -1) {
        var val = getNested(obj, n.split('.'));
        if (val !== undefined && val !== null) return val;
      } else {
        if (obj[n] !== undefined && obj[n] !== null) return obj[n];
      }
    }
    return null;
  }

  function getLastEpisode(cardData) {
    return findProp(cardData, [
      'last_episode_to_air',
      'lastEpisodeToAir',
      'last_episode',
      'last_episode_air',
      'latest_episode'
    ]);
  }

  function getSeasonsArray(cardData) {
    var v = findProp(cardData, [
      'seasons',
      'data.seasons',
      '_seasons',
      'seasons_list',
      'series',
      'seasonsInfo'
    ]);
    if (Array.isArray(v)) return v;
    return [];
  }

  function getSeasonEpisodeCount(seasonObj) {
    if (!seasonObj) return 0;
    return parseInt(seasonObj.episode_count || seasonObj.episodes_count || seasonObj.totalEpisodes || seasonObj.episodeCount || (Array.isArray(seasonObj.episodes) ? seasonObj.episodes.length : 0) || 0, 10) || 0;
  }

  function getLastEpisodeNumber(lastEp) {
    if (!lastEp) return 0;
    return parseInt(lastEp.episode_number || lastEp.episodeNumber || lastEp.ep || lastEp.number || 0, 10) || 0;
  }

  function findSeasonByNumber(seasons, num) {
    if (!Array.isArray(seasons)) return null;
    for (var i = 0; i < seasons.length; i++) {
      var s = seasons[i];
      var sn = parseInt(s.season_number || s.season || s.number || 0, 10) || 0;
      if (sn === num) return s;
    }
    return null;
  }

  // евристика: чи вважаємо сезон "повним"
  function seasonIsComplete(seasonObj, cardData) {
    if (!seasonObj) return false;
    // явний прапорець
    if (seasonObj.complete === true || seasonObj.is_complete === true || seasonObj.all_episodes === true) return true;

    var total = getSeasonEpisodeCount(seasonObj);
    if (total <= 0) return false;

    // якщо є масив episodes — перевіряємо наявність доступних епізодів
    if (Array.isArray(seasonObj.episodes) && seasonObj.episodes.length) {
      var available = 0;
      for (var i = 0; i < seasonObj.episodes.length; i++) {
        var ep = seasonObj.episodes[i];
        if (!ep) continue;
        if (ep.available === true || (ep.files && ep.files.length) || (ep.torrents && ep.torrents.length) || ep.link || ep.path || ep.url) available++;
      }
      if (available >= total) return true;
    }

    // fallback: глобальні episodes у cardData
    if (cardData && Array.isArray(cardData.episodes) && cardData.episodes.length) {
      var sn = parseInt(seasonObj.season_number || seasonObj.season || seasonObj.number || 0, 10) || 0;
      var gl = cardData.episodes.filter(function (e) {
        var sne = parseInt(e.season_number || e.season || e.seasonNum || 0, 10) || 0;
        return sne === sn;
      });
      if (gl.length) {
        var av = 0;
        for (var j = 0; j < gl.length; j++) {
          var e = gl[j];
          if (e.available === true || (e.files && e.files.length) || (e.torrents && e.torrents.length) || e.link || e.path || e.url) av++;
        }
        if (av >= total) return true;
      }
    }

    // available_count
    if (seasonObj.available_count && parseInt(seasonObj.available_count, 10) >= total) return true;

    return false;
  }

  // знайти "найновіший" повний сезон (за номером)
  function findLatestCompleteSeason(cardData) {
    var seasons = getSeasonsArray(cardData);
    if (!seasons.length) return null;
    var completes = [];
    for (var i = 0; i < seasons.length; i++) {
      var s = seasons[i];
      var num = parseInt(s.season_number || s.season || s.number || 0, 10) || 0;
      if (num <= 0) continue;
      if (seasonIsComplete(s, cardData)) {
        completes.push({ num: num, total: getSeasonEpisodeCount(s), final: !!(s.final || s.is_final || s.season_final) });
      }
    }
    if (!completes.length) return null;
    completes.sort(function (a, b) { return b.num - a.num; });
    return completes[0];
  }

  // первинна логіка: використовуємо last_episode_to_air, але маємо fallback на явні completed-сезони
  function detectCompleteSeason(cardData) {
    if (!cardData) return null;
    var lastEp = getLastEpisode(cardData);
    if (lastEp && (lastEp.season_number || lastEp.season || lastEp.seasonNumber)) {
      var sn = parseInt(lastEp.season_number || lastEp.season || lastEp.seasonNumber || 0, 10) || 0;
      if (sn > 0) {
        var seasons = getSeasonsArray(cardData);
        var season = findSeasonByNumber(seasons, sn);
        if (season) {
          // якщо lastEp має episode_number використовуємо його
          var lastNum = getLastEpisodeNumber(lastEp);
          var total = getSeasonEpisodeCount(season);
          if (total > 0 && lastNum >= total) {
            debug('detectCompleteSeason: via lastEp, season', sn, 'lastNum', lastNum, 'total', total);
            return { num: sn, total: total, final: !!(season.final || season.is_final) };
          }
        }
      }
    }

    // fallback: якщо у якихось сезонів відмічено complete або набір епізодів всі доступні
    var latestComplete = findLatestCompleteSeason(cardData);
    if (latestComplete) {
      debug('detectCompleteSeason: via latestCompleteSeason', latestComplete);
      return latestComplete;
    }
    return null;
  }

  // ======= DOM: додавання / оновлення бейджа =======
  function findBadgeContainer(cardEl) {
    // зазвичай .card__view; але робимо fallback
    var selectors = ['.card__view', '.card__poster', '.card__img', '.card__body', '.poster', '.full-start__poster'];
    for (var i = 0; i < selectors.length; i++) {
      try {
        var el = cardEl.querySelector(selectors[i]);
        if (el) return el;
      } catch (e) { /* ignore bad selector */ }
    }
    // останній fallback — сам елемент картки
    return cardEl;
  }

  function createBadgeEl(seasonInfo) {
    var badge = document.createElement('div');
    badge.className = 'card--seria-status';
    // компактний формат: S{n} ✓
    var text = 'S' + seasonInfo.num + ' ✓';
    // якщо хочеш додати кількість: uncomment next line
    // text = 'S' + seasonInfo.num + ' ' + seasonInfo.total + '/' + seasonInfo.total + ' ✓';
    badge.textContent = text;
    badge.setAttribute('title', 'Сезон ' + seasonInfo.num + ' — всі серії (' + seasonInfo.total + '/' + seasonInfo.total + ')' + (seasonInfo.final ? ' — фінальний' : ''));
    return badge;
  }

  function removeBadge(cardEl) {
    try {
      var c = cardEl.querySelector && cardEl.querySelector('.card--seria-status');
      if (c && c.parentNode) c.parentNode.removeChild(c);
      cardEl.removeAttribute('data-seria-status');
    } catch (e) { debug('removeBadge error', e); }
  }

  function addOrUpdateBadge(cardEl, seasonInfo) {
    if (!cardEl) return;
    var container = findBadgeContainer(cardEl);
    if (!container) return;

    var prev = cardEl.getAttribute('data-seria-status') || '';
    if (!seasonInfo) {
      // немає повного сезону => видаляємо, якщо було
      if (prev) removeBadge(cardEl);
      return;
    }

    // якщо вже позначено тим же сезоном — нічого не робимо
    if (prev === String(seasonInfo.num) && container.querySelector('.card--seria-status')) {
      return;
    }

    // видаляємо старий
    var old = container.querySelector('.card--seria-status');
    if (old) old.remove();

    var badge = createBadgeEl(seasonInfo);
    container.appendChild(badge);
    // анімація появи
    setTimeout(function () { badge.classList.add('show'); }, 30);
    cardEl.setAttribute('data-seria-status', String(seasonInfo.num));
    debug('Badge added for card', cardEl, 'season', seasonInfo.num);
  }

  // ======= Головна обробка однієї картки =======
  function processCard(cardEl) {
    try {
      if (!cardEl) return;
      var cardData = getCardData(cardEl);
      if (!cardData) {
        // не ставимо processed, дозволяємо майбутньому polling-у обробити
        debug('processCard: no card_data yet for', cardEl);
        return;
      }
      // тільки якщо є seasons (тобто серіал)
      var seasons = getSeasonsArray(cardData);
      if (!seasons || !seasons.length) {
        // на випадок, що це не серіал — видаляємо бейдж, якщо був
        addOrUpdateBadge(cardEl, null);
        debug('processCard: not a TV-series', cardEl);
        return;
      }

      var seasonInfo = detectCompleteSeason(cardData);
      if (seasonInfo) addOrUpdateBadge(cardEl, seasonInfo);
      else addOrUpdateBadge(cardEl, null);

    } catch (e) {
      debug('processCard error', e);
    }
  }

  // ======= MutationObserver + polling для карток =======
  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      if (!m.addedNodes) return;
      m.addedNodes.forEach(function (n) {
        if (n.nodeType !== 1) return;
        if (n.classList && n.classList.contains('card')) {
          setTimeout(function () { processCard(n); }, 150);
        } else if (n.querySelectorAll) {
          var nested = n.querySelectorAll('.card');
          if (nested && nested.length) {
            nested.forEach(function (c) { setTimeout(function () { processCard(c); }, 150); });
          }
        }
      });
    });
  });

  function startObservers() {
    var containers = document.querySelectorAll('.cards, .card-list, .content, .main, .cards-list, .preview__list');
    if (containers && containers.length) {
      containers.forEach(function (ct) {
        try { observer.observe(ct, { childList: true, subtree: true }); } catch (e) { debug('observer attach fail', e); }
      });
    } else {
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  function initialScanAndPoll() {
    // початкова обробка
    var all = document.querySelectorAll('.card');
    all.forEach(function (c) { processCard(c); });

    // короткий polling щоб впіймати асинхронно заповнені card.card_data
    var scans = 0;
    var poll = setInterval(function () {
      scans++;
      var cards = document.querySelectorAll('.card');
      cards.forEach(function (c) { processCard(c); });
      if (scans >= CONFIG.POLL_MAX) clearInterval(poll);
    }, CONFIG.POLL_INTERVAL);
  }

  // ======= Ініціалізація =======
  function init() {
    debug('init start');
    startObservers();
    initialScanAndPoll();
    debug('SeasonBadgePluginV2 initialized');
  }

  if (window.appready) {
    init();
  } else if (window.Lampa && Lampa.Listener && Lampa.Listener.follow) {
    Lampa.Listener.follow('app', function (e) {
      if (e.type === 'ready') init();
    });
  } else {
    // fallback
    setTimeout(init, 1000);
  }

})();

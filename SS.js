/* =========================================================================
 * Lampa Plugin: Interface+ (Info Panel, Colored Ratings, Themes)
 * ========================================================================= */
(function () {
  'use strict';
  if (!window.Lampa) return;
  var Lampa = window.Lampa;
  var $ = window.$ || window.jQuery;

  // Polyfill startsWith
  if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position){ position = position || 0; return this.indexOf(searchString, position) === position; };
  }

  // I18N
  Lampa.Lang.add({
    interface_mod_new_plugin_name: { ru:'Интерфейс +', en:'Interface +', uk:'Інтерфейс +' },

    interface_mod_new_info_panel: { ru:'Новая инфо-панель', en:'New info panel', uk:'Нова інфо-панель' },
    interface_mod_new_info_panel_desc: { ru:'Цветная и перефразированная строка информации', en:'Colored and rephrased info line', uk:'Кольорова та перефразована інформаційна панель' },

    interface_mod_new_colored_ratings: { ru:'Цветной рейтинг', en:'Colored rating', uk:'Кольоровий рейтинг' },
    interface_mod_new_colored_ratings_desc: { ru:'Подсветка числовых рейтингов', en:'Highlight numeric ratings', uk:'Підсвічування числових рейтингів' },

    interface_mod_new_theme_select: { ru:'Тема интерфейса', en:'Interface theme', uk:'Тема інтерфейсу' },
    interface_mod_new_theme_select_desc: { ru:'Выберите тему', en:'Choose theme', uk:'Виберіть тему' },
    interface_mod_new_theme_default: { ru:'По умолчанию', en:'Default', uk:'За замовчуванням' },
    interface_mod_new_theme_emerald_v1:{ ru:'Emerald V1', en:'Emerald V1', uk:'Emerald V1' },
    interface_mod_new_theme_emerald_v2:{ ru:'Emerald V2', en:'Emerald V2', uk:'Emerald V2' },
    interface_mod_new_theme_aurora:    { ru:'Aurora',     en:'Aurora',     uk:'Aurora' }
  });

  // Storage helpers
  var KEY = k => 'interface_mod_new_' + k;
  var settings = {
    info_panel:      Lampa.Storage.get(KEY('info_panel'), true),
    colored_ratings: Lampa.Storage.get(KEY('colored_ratings'), true),
    theme:           Lampa.Storage.get(KEY('theme_select'), 'default')
  };
  function saveSetting(name, value){
    if (name==='info_panel'){ settings.info_panel=!!value; Lampa.Storage.set(KEY('info_panel'), settings.info_panel); }
    if (name==='colored_ratings'){ settings.colored_ratings=!!value; Lampa.Storage.set(KEY('colored_ratings'), settings.colored_ratings); }
    if (name==='theme'){ settings.theme=String(value||'default'); Lampa.Storage.set(KEY('theme_select'), settings.theme); }
  }

  /* ====== Базові стилі, що заміняють стандартні (важливе з твоїх стилів) ====== */
  (function injectBase(){
    var css = `
      .full-start-new__details{
        color:#fff;
        margin:-0.45em;
        margin-bottom:1em;
        display:flex;
        align-items:center;
        flex-wrap:wrap;
        min-height:1.9em;
        font-size:1.1em;
      }
      *:not(input){ -webkit-user-select:none !important; -moz-user-select:none !important; -ms-user-select:none !important; user-select:none !important; }
      *{ -webkit-tap-highlight-color:transparent; -webkit-touch-callout:none; box-sizing:border-box; outline:none; -webkit-user-drag:none; }
      ::-webkit-scrollbar{ display:none; }

      /* Контейнер і рядки інфо-панелі — відступи як у твоєму коді */
      .ifacepp-wrap{ display:flex; flex-direction:column; width:100%; gap:0em; margin:-1.0em 0 0.2em 0.45em; }
      .ifacepp-row{ display:flex; flex-wrap:wrap; gap:.2em; align-items:center; margin:0 0 0.2em 0; }
      .ifacepp-badge{
        border-radius:.3em; border:0; font-size:1.0em; padding:.2em .6em; display:inline-block;
        white-space:nowrap; line-height:1.2em; margin-right:.4em; margin-bottom:.2em;
      }
      .ifacepp-chip-blue{ background:rgba(52,152,219,.8) !important; color:#fff !important; }
      .ifacepp-chip-green{ background:rgba(46,204,113,.8) !important; color:#fff !important; }
      .ifacepp-chip-orange{ background:rgba(230,126,34,.8) !important; color:#fff !important; }
      .ifacepp-genre{ border-radius:.3em; padding:.2em .6em; display:inline-block; margin-right:.4em; margin-bottom:.2em; }
    `;
    var s=document.createElement('style'); s.id='ifacepp_base'; s.textContent=css; document.head.appendChild(s);
  })();

  /* ====== Теми (Emerald V1, Emerald V2, Aurora) ====== */
  var THEME_ID='interface_mod_theme';
  function setThemeCSS(txt){ var n=document.getElementById(THEME_ID); if(n) n.remove(); if(!txt) return; var s=document.createElement('style'); s.id=THEME_ID; s.textContent=txt; document.head.appendChild(s); }
  function applyTheme(theme){
    if (theme==='default'){ setThemeCSS(''); return; }
    if (theme==='emerald-v1') setThemeCSS(`
      body { background:linear-gradient(135deg,#1a2a3a 0%,#2C5364 50%,#203A43 100%) !important; color:#fff !important; }
      .menu__item.focus,.menu__item.traverse,.menu__item.hover,.settings-folder.focus,.settings-param.focus,.selectbox-item.focus,
      .full-start__button.focus,.full-descr__tag.focus,.player-panel .button.focus,.custom-online-btn.focus,.custom-torrent-btn.focus,
      .main2-more-btn.focus,.simple-button.focus,.menu__version.focus{
        background:linear-gradient(to right,#43cea2,#185a9d) !important; color:#fff !important; box-shadow:0 4px 15px rgba(67,206,162,.3) !important; border-radius:5px !important;
      }
      .card.focus .card__view::after,.card.hover .card__view::after{ border:3px solid #43cea2 !important; box-shadow:0 0 20px rgba(67,206,162,.4) !important; }
      .head__action.focus,.head__action.hover{ background:linear-gradient(45deg,#43cea2,#185a9d) !important; }
      .full-start__background{ opacity:.85 !important; filter:brightness(1.1) saturate(1.2) !important; }
      .settings__content,.settings-input__content,.selectbox__content,.modal__content{ background:rgba(26,42,58,.98) !important; border:1px solid rgba(67,206,162,.1) !important; }
    `);
    else if (theme==='emerald-v2') setThemeCSS(`
      body{ background:linear-gradient(135deg,#0c1619 0%,#132730 50%,#18323a 100%) !important; color:#dfdfdf !important; }
      .menu__item,.settings-folder,.settings-param,.selectbox-item,.full-start__button,.full-descr__tag,.player-panel .button,
      .custom-online-btn,.custom-torrent-btn,.main2-more-btn,.simple-button,.menu__version{ border-radius:1.0em !important; }
      .menu__item.focus,.menu__item.traverse,.menu__item.hover,.settings-folder.focus,.settings-param.focus,.selectbox-item.focus,
      .full-start__button.focus,.full-descr__tag.focus,.player-panel .button.focus,.custom-online-btn.focus,.custom-torrent-btn.focus,
      .main2-more-btn.focus,.simple-button.focus,.menu__version.focus{
        background:linear-gradient(to right,#1a594d,#0e3652) !important; color:#fff !important; box-shadow:0 2px 8px rgba(26,89,77,.2) !important; border-radius:1.0em !important;
      }
      .card,.card.focus,.card.hover{ border-radius:1.0em !important; }
      .card.focus .card__view::after,.card.hover .card__view::after{ border:2px solid #1a594d !important; box-shadow:0 0 10px rgba(26,89,77,.3) !important; border-radius:1.0em !important; }
      .head__action,.head__action.focus,.head__action.hover{ border-radius:1.0em !important; }
      .head__action.focus,.head__action.hover{ background:linear-gradient(45deg,#1a594d,#0e3652) !important; }
      .full-start__background{ opacity:.75 !important; filter:brightness(.9) saturate(1.1) !important; }
      .settings__content,.settings-input__content,.selectbox__content,.modal__content{ background:rgba(12,22,25,.97) !important; border:1px solid rgba(26,89,77,.1) !important; border-radius:1.0em !important; }
    `);
    else setThemeCSS(`
      body{ background:linear-gradient(135deg,#0f2027 0%,#203a43 50%,#2c5364 100%) !important; color:#fff !important; }
      .menu__item.focus,.menu__item.traverse,.menu__item.hover,.settings-folder.focus,.settings-param.focus,.selectbox-item.focus,
      .full-start__button.focus,.full-descr__tag.focus,.player-panel .button.focus,.custom-online-btn.focus,.custom-torrent-btn.focus,
      .main2-more-btn.focus,.simple-button.focus,.menu__version.focus{
        background:linear-gradient(to right,#aa4b6b,#6b6b83,#3b8d99) !important; color:#fff !important;
        box-shadow:0 0 20px rgba(170,75,107,.3) !important; transform:scale(1.02) !important; transition:all .3s ease !important;
      }
      .card.focus .card__view::after,.card.hover .card__view::after{ border:2px solid #aa4b6b !important; box-shadow:0 0 25px rgba(170,75,107,.5) !important; }
      .head__action.focus,.head__action.hover{ background:linear-gradient(45deg,#aa4b6b,#3b8d99) !important; transform:scale(1.05) !important; }
      .full-start__background{ opacity:.75 !important; filter:contrast(1.1) brightness(1.1) !important; }
    `);
  }

  /* ====== Утиліти ====== */
  function plural(number, one, two, five){
    var n=Math.abs(number)%100; if(n>=5 && n<=20) return five; n%=10; if(n===1) return one; if(n>=2 && n<=4) return two; return five;
  }
  function calculateAverageEpisodeDuration(movie){
    if (!movie || typeof movie!=='object') return 0;
    var total=0, cnt=0;
    if (movie.episode_run_time && Array.isArray(movie.episode_run_time) && movie.episode_run_time.length){
      movie.episode_run_time.filter(x=>x>0 && x<=200).forEach(x=>{ total+=x; cnt++; });
    } else if (movie.seasons && Array.isArray(movie.seasons)){
      movie.seasons.forEach(s=>{
        if (s.episodes && Array.isArray(s.episodes)) s.episodes.forEach(e=>{ if(e.runtime && e.runtime>0 && e.runtime<=200){ total+=e.runtime; cnt++; }});
      });
    }
    if (cnt>0) return Math.round(total/cnt);
    if (movie.last_episode_to_air && movie.last_episode_to_air.runtime && movie.last_episode_to_air.runtime>0 && movie.last_episode_to_air.runtime<=200) return movie.last_episode_to_air.runtime;
    return 0;
  }
  function formatDurationMinutes(minutes){
    if (!minutes || minutes<=0) return '';
    var h=Math.floor(minutes/60), m=minutes%60, out='';
    if (h>0){ out+=h+' '+plural(h,'година','години','годин'); if (m>0) out+=' '+m+' '+plural(m,'хвилина','хвилини','хвилин'); }
    else out+=m+' '+plural(m,'хвилина','хвилини','хвилин');
    return out;
  }

  /* ====== Кольоровий рейтинг (цифрові значення) ====== */
  function updateVoteColors(){
    if (!settings.colored_ratings) return;
    function paint(el){
      var t=$(el).text().trim(), m=t.match(/(\d+(\.\d+)?)/); if(!m) return;
      var v=parseFloat(m[1]);
      if (v<=3) $(el).css('color','red');
      else if (v<6) $(el).css('color','orange');
      else if (v<8) $(el).css('color','cornflowerblue');
      else $(el).css('color','lawngreen');
    }
    $('.card__vote, .full-start__rate, .full-start-new__rate, .info__rate, .card__imdb-rate, .card__kinopoisk-rate').each(function(){ paint(this); });
  }
  function observeVoteColors(){
    if (!settings.colored_ratings) return;
    setTimeout(updateVoteColors, 400);
    new MutationObserver(function(){ setTimeout(updateVoteColors,100); }).observe(document.body,{childList:true,subtree:true});
    Lampa.Listener.follow('full', d=>{ if(d.type==='complite') setTimeout(updateVoteColors,100); });
  }

  /* ====== Кольори жанрів ====== */
  var GENRE_COLORS = {
    'Бойовик':{bg:'rgba(231,76,60,0.8)',text:'white'}, 'Екшн':{bg:'rgba(231,76,60,0.8)',text:'white'},
    'Пригоди':{bg:'rgba(39,174,96,0.8)',text:'white'},
    'Мультфільм':{bg:'rgba(155,89,182,0.8)',text:'white'},
    'Комедія':{bg:'rgba(241,196,15,0.8)',text:'black'},
    'Кримінал':{bg:'rgba(192,57,43,0.8)',text:'white'},
    'Документальний':{bg:'rgba(22,160,133,0.8)',text:'white'},
    'Драма':{bg:'rgba(142,68,173,0.8)',text:'white'},
    'Сімейний':{bg:'rgba(46,204,113,0.8)',text:'white'},
    'Фентезі':{bg:'rgba(155,89,182,0.8)',text:'white'},
    'Історія':{bg:'rgba(211,84,0,0.8)',text:'white'},
    'Жахи':{bg:'rgba(192,57,43,0.8)',text:'white'},
    'Музика':{bg:'rgba(52,152,219,0.8)',text:'white'},
    'Детектив':{bg:'rgba(52,73,94,0.8)',text:'white'},
    'Мелодрама':{bg:'rgba(233,30,99,0.8)',text:'white'},
    'Фантастика':{bg:'rgba(41,128,185,0.8)',text:'white'},
    'Трилер':{bg:'rgba(192,57,43,0.8)',text:'white'},
    'Військовий':{bg:'rgba(127,140,141,0.8)',text:'white'},
    'Вестерн':{bg:'rgba(211,84,0,0.8)',text:'white'},
    'Бойовик і Пригоди':{bg:'rgba(231,76,60,0.8)',text:'white'},
    'Дитячий':{bg:'rgba(46,204,113,0.8)',text:'white'},
    'Новини':{bg:'rgba(52,152,219,0.8)',text:'white'},
    'Реаліті-шоу':{bg:'rgba(230,126,34,0.8)',text:'white'},
    'НФ і Фентезі':{bg:'rgba(41,128,185,0.8)',text:'white'},
    'Мильна опера':{bg:'rgba(233,30,99,0.8)',text:'white'},
    'Ток-шоу':{bg:'rgba(241,196,15,0.8)',text:'black'},
    'Війна і Політика':{bg:'rgba(127,140,141,0.8)',text:'white'}
  };

  /* ====== ТВОЯ ОСНОВНА ФУНКЦІЯ ІНФО-ПАНЕЛІ (адаптовано рівно під вимоги рядків) ====== */
  function newInfoPanel() {
    if (!settings.info_panel) return;

    Lampa.Listener.follow('full', function(data) {
      if (data.type !== 'complite' || !settings.info_panel) return;

      setTimeout(function() {
        var details = $('.full-start-new__details');
        if (!details.length) return;

        var movie = data.data.movie;
        var isTvShow = movie && (movie.number_of_seasons > 0 || (movie.seasons && movie.seasons.length > 0) || movie.type === 'tv' || movie.type === 'serial');

        // оригінальні бейджі
        var originalDetails = details.html();
        details.empty();

        // контейнер і рядки — відступи як у тебе
        var wrap = $('<div class="ifacepp-wrap"></div>');
        var row1 = $('<div class="ifacepp-row"></div>'); // Серії
        var row2 = $('<div class="ifacepp-row"></div>'); // Наступна серія
        var row3 = $('<div class="ifacepp-row"></div>'); // Тривалість
        var row4 = $('<div class="ifacepp-row"></div>'); // Сезони + Жанри

        // тимчасовий контейнер для парсингу дефолтних бейджів
        var temp = $('<div>').html(originalDetails);

        // прибираємо дефолтні "Наступна:" та "Залишилось днів:"
        temp.find('span').filter(function() {
          var t = $(this).text();
          return t.indexOf('Наступна:') !== -1 || t.indexOf('Залишилось днів:') !== -1;
        }).remove();

        // зберемо жанри як елементи
        var genreElements = [];
        temp.find('span').each(function() {
          var $span = $(this);
          var text = $span.text();
          if ($span.hasClass('full-start-new__split')) return;

          // жанри: "A | B | C" або одинарні
          var parts = text.split(' | ');
          if (parts.length > 1) {
            parts.map(s=>s.trim()).forEach(function(genre){
              var c = GENRE_COLORS[genre] || {bg:'rgba(255,255,255,0.1)', text:'white'};
              var $badge = $('<span class="ifacepp-genre"></span>').text(genre).css({'background-color': c.bg, 'color': c.text});
              genreElements.push($badge);
            });
          } else {
            var genre = text.trim();
            var c = GENRE_COLORS[genre] || null;
            if (c){
              var $badge = $('<span class="ifacepp-genre"></span>').text(genre).css({'background-color': c.bg, 'color': c.text});
              genreElements.push($badge);
            }
          }
        });

        /* ===== 1) Серії ===== */
        if (isTvShow && movie && movie.seasons && Array.isArray(movie.seasons)) {
          var totalEpisodes = 0;
          var airedEpisodes = 0;
          var currentDate = new Date();
          var hasEpisodes = false;

          movie.seasons.forEach(function(season) {
            if (season.season_number === 0) return;
            if (season.episode_count) totalEpisodes += season.episode_count;

            if (season.episodes && Array.isArray(season.episodes) && season.episodes.length) {
              hasEpisodes = true;
              season.episodes.forEach(function(episode) {
                if (episode.air_date) {
                  var epAirDate = new Date(episode.air_date);
                  if (epAirDate <= currentDate) airedEpisodes++;
                }
              });
            } else if (season.air_date) {
              var airDate = new Date(season.air_date);
              if (airDate <= currentDate && season.episode_count) airedEpisodes += season.episode_count;
            }
          });

          // якщо нема детальної розкладки — розрахунок від next_episode_to_air
          if (!hasEpisodes && movie.next_episode_to_air && movie.next_episode_to_air.season_number && movie.next_episode_to_air.episode_number) {
            var nextSeason = movie.next_episode_to_air.season_number;
            var nextEpisode = movie.next_episode_to_air.episode_number;
            var remaining = 0;
            movie.seasons.forEach(function(season) {
              if (season.season_number === nextSeason) remaining = (season.episode_count || 0) - nextEpisode + 1;
              else if (season.season_number > nextSeason) remaining += season.episode_count || 0;
            });
            if (remaining > 0 && totalEpisodes > 0) {
              var calc = totalEpisodes - remaining;
              if (calc >= 0 && calc <= totalEpisodes) airedEpisodes = calc;
            }
          }

          var episodesText = '';
          if (totalEpisodes > 0 && airedEpisodes > 0 && airedEpisodes < totalEpisodes) {
            episodesText = airedEpisodes + ' ' + plural(airedEpisodes, 'Серія', 'Серії', 'Серій') + ' з ' + totalEpisodes;
          } else if (totalEpisodes > 0) {
            episodesText = totalEpisodes + ' ' + plural(totalEpisodes, 'Серія', 'Серії', 'Серій');
          }
          if (episodesText) row1.append($('<span class="ifacepp-badge ifacepp-chip-green"></span>').text(episodesText));
        }

        /* ===== 2) Наступна серія ===== */
        if (isTvShow && movie.next_episode_to_air && movie.next_episode_to_air.air_date) {
          var nextDate = new Date(movie.next_episode_to_air.air_date);
          var today = new Date();
          nextDate.setHours(0,0,0,0); today.setHours(0,0,0,0);
          var diffDays = Math.floor((nextDate.getTime() - today.getTime()) / (1000*60*60*24));
          var nextText = '';
          if      (diffDays === 0) nextText = 'Наступна серія вже сьогодні';
          else if (diffDays === 1) nextText = 'Наступна серія вже завтра';
          else if (diffDays > 1)   nextText = 'Наступна серія через ' + diffDays + ' ' + plural(diffDays, 'день', 'дні', 'днів');
          if (nextText) row2.append($('<span class="ifacepp-badge ifacepp-chip-orange"></span>').text(nextText));
        }

        /* ===== 3) Тривалість ===== */
        if (isTvShow) {
          var avg = calculateAverageEpisodeDuration(movie);
          if (avg > 0) row3.append($('<span class="ifacepp-badge ifacepp-chip-blue"></span>').text('Тривалість серії ≈ ' + formatDurationMinutes(avg)));
        } else if (movie && movie.runtime > 0) {
          var mins = movie.runtime, hours = Math.floor(mins / 60), min = mins % 60;
          var text = 'Тривалість фільму: ' + (hours>0 ? (hours + ' ' + plural(hours,'година','години','годин') + (min>0 ? ' ' : '')) : '') + (min>0 ? (min + ' хв.') : '');
          row3.append($('<span class="ifacepp-badge ifacepp-chip-blue"></span>').text(text));
        }

        /* ===== 4) Сезони + Жанри (СЕЗОНИ ТУТ) ===== */
        if (isTvShow && movie.number_of_seasons > 0) {
          row4.append($('<span class="ifacepp-badge ifacepp-chip-blue"></span>').text('Сезони: ' + movie.number_of_seasons));
        }
        genreElements.forEach(function(el){ row4.append(el); });

        // скласти і додати
        if (row1.children().length) wrap.append(row1);
        if (row2.children().length) wrap.append(row2);
        if (row3.children().length) wrap.append(row3);
        if (row4.children().length) wrap.append(row4);

        details.append(wrap);
      }, 100);
    });
  }

  /* ====== Кольоровий вік-рейтинг (залишив легку підсвітку існуючих бейджів) ====== */
  function colorizeAgeRating() {
    function applyAgeRatingColor(el) {
      var txt=$(el).text().trim();
      var groups={ kids:['G','TV-Y','TV-G','0+','3+','0','3'],
                   children:['PG','TV-PG','TV-Y7','6+','7+','6','7'],
                   teens:['PG-13','TV-14','12+','13+','14+','12','13','14'],
                   almost:['R','TV-MA','16+','17+','16','17'],
                   adult:['NC-17','18+','18','X'] };
      var colors={ kids:{bg:'#2ecc71',tx:'#fff'}, children:{bg:'#3498db',tx:'#fff'}, teens:{bg:'#f1c40f',tx:'#000'}, almost:{bg:'#e67e22',tx:'#fff'}, adult:{bg:'#e74c3c',tx:'#fff'} };
      var key=null; for (var k in groups){ if (groups[k].some(s=>txt.includes(s))){ key=k; break; } }
      if (key) $(el).css({'background-color':colors[key].bg,'color':colors[key].tx,'border-radius':'.3em','font-size':'1.3em','border':'0'});
    }
    $('.full-start__pg').each(function(){ applyAgeRatingColor(this); });
    new MutationObserver(function(m){ m.forEach(function(x){ $(x.addedNodes).find('.full-start__pg').each(function(){ applyAgeRatingColor(this); }); }); }).observe(document.body,{childList:true,subtree:true});
    Lampa.Listener.follow('full', d=>{ if (d.type==='complite') setTimeout(function(){ $(d.object.activity.render()).find('.full-start__pg').each(function(){ applyAgeRatingColor(this); }); },100); });
  }

  /* ====== Меню «Інтерфейс +» (без порожньої папки) ====== */
  function addSettings(){
    Lampa.SettingsApi.addComponent({
      component:'interface_mod_new',
      name:Lampa.Lang.translate('interface_mod_new_plugin_name'),
      icon:'<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V7C20 7.55228 19.5523 8 19 8H5C4.44772 8 4 7.55228 4 7V5Z" fill="currentColor"/><path d="M4 11C4 10.4477 4.44772 10 5 10H19C19.5523 10 20 10.4477 20 11V13C20 13.5523 19.5523 14 19 14H5C4.44772 14 4 13.5523 4 13V11Z" fill="currentColor"/><path d="M4 17C4 16.4477 4.44772 16 5 16H19C19.5523 16 20 16.4477 20 17V19C20 19.5523 19.5523 20 19 20H5C4.44772 20 4 19.5523 4 19V17Z" fill="currentColor"/></svg>'
    });

    function ensureParams(){
      // Інфо-панель
      Lampa.SettingsApi.addParam({
        component:'interface_mod_new',
        param:'info_panel',
        name:Lampa.Lang.translate('interface_mod_new_info_panel'),
        type:'switch',
        default:true,
        value:settings.info_panel,
        descr:Lampa.Lang.translate('interface_mod_new_info_panel_desc')
      }, function(v){ saveSetting('info_panel', v); Lampa.Activity.call(Lampa.Activity.active().activity); });

      // Кольоровий рейтинг
      Lampa.SettingsApi.addParam({
        component:'interface_mod_new',
        param:'colored_ratings',
        name:Lampa.Lang.translate('interface_mod_new_colored_ratings'),
        type:'switch',
        default:true,
        value:settings.colored_ratings,
        descr:Lampa.Lang.translate('interface_mod_new_colored_ratings_desc')
      }, function(v){ saveSetting('colored_ratings', v); if (settings.colored_ratings) updateVoteColors(); else $('.card__vote,.full-start__rate,.full-start-new__rate,.info__rate,.card__imdb-rate,.card__kinopoisk-rate').css('color',''); });

      // Тема
      Lampa.SettingsApi.addParam({
        component:'interface_mod_new',
        param:'theme_select',
        name:Lampa.Lang.translate('interface_mod_new_theme_select'),
        type:'select',
        default:'default',
        value:settings.theme,
        values:{
          'default': Lampa.Lang.translate('interface_mod_new_theme_default'),
          'emerald-v1': Lampa.Lang.translate('interface_mod_new_theme_emerald_v1'),
          'emerald-v2': Lampa.Lang.translate('interface_mod_new_theme_emerald_v2'),
          'aurora': Lampa.Lang.translate('interface_mod_new_theme_aurora')
        },
        descr:Lampa.Lang.translate('interface_mod_new_theme_select_desc')
      }, function(v){ saveSetting('theme', v); applyTheme(settings.theme); });
    }

    ensureParams();

    // Якщо папка раптом порожня — добудуємо при відкритті
    Lampa.Listener.follow('settings', function(ev){
      if (ev.type==='open'){
        setTimeout(function(){
          var folder = $('.settings-folder[data-component="interface_mod_new"]');
          if (folder.length && folder.find('.settings-param').length===0) ensureParams();
        },0);
      }
    });

    // Пересунути «Інтерфейс +» під «Інтерфейс»
    function move(){
      var $f=$('.settings-folder');
      var $iface=$f.filter(function(){ return $(this).data('component')==='interface'; });
      var $me=$f.filter(function(){ return $(this).data('component')==='interface_mod_new'; });
      if ($iface.length && $me.length && $me.prev()[0] !== $iface[0]) $me.insertAfter($iface);
    }
    setTimeout(move,1000);
    new MutationObserver(function(){ setTimeout(move,100); }).observe(document.body,{childList:true,subtree:true});
  }

  /* ====== Ініціалізація ====== */
  function start(){
    addSettings();
    applyTheme(settings.theme);
    newInfoPanel();
    if (settings.colored_ratings){ updateVoteColors(); observeVoteColors(); }
    colorizeAgeRating();
  }

  if (window.appready) start();
  else Lampa.Listener.follow('app', function (e){ if (e.type==='ready') start(); });
})();

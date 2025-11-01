/* =========================================================================
 * Lampa Plugin: Interface+ (Info Panel, Colored Rating, 3 Themes)
 * ========================================================================= */
(function () {
  'use strict';
  if (typeof window === 'undefined' || !window.Lampa) return;

  var Lampa = window.Lampa;
  var $ = window.$ || window.jQuery;

  // Polyfill
  if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
      position = position || 0;
      return this.indexOf(searchString, position) === position;
    };
  }

  // i18n
  Lampa.Lang.add({
    interface_mod_new_plugin_name: { ru: 'Интерфейс +', en: 'Interface +', uk: 'Інтерфейс +' },

    interface_mod_new_info_panel: { ru:'Новая инфо-панель', en:'New info panel', uk:'Нова інфо-панель' },
    interface_mod_new_info_panel_desc: {
      ru:'Цветная и перефразированная инфо-панель о фильме/сериале',
      en:'Colored and rephrased info line about movie/series',
      uk:'Кольорова та перефразована інформаційна панель'
    },

    interface_mod_new_colored_ratings: { ru:'Цветной рейтинг', en:'Colored rating', uk:'Кольоровий рейтинг' },
    interface_mod_new_colored_ratings_desc: {
      ru:'Включить цветовое выделение числовых рейтингов',
      en:'Enable colored highlight for ratings',
      uk:'Увімкнути кольорове виділення числових рейтингів'
    },

    interface_mod_new_theme_select: { ru:'Тема интерфейса', en:'Interface theme', uk:'Тема інтерфейсу' },
    interface_mod_new_theme_select_desc: {
      ru:'Выберите тему оформления интерфейса',
      en:'Choose interface theme',
      uk:'Виберіть тему оформлення інтерфейсу'
    },
    interface_mod_new_theme_default: { ru:'По умолчанию', en:'Default', uk:'За замовчуванням' },
    interface_mod_new_theme_emerald_v1:{ ru:'Emerald V1', en:'Emerald V1', uk:'Emerald V1' },
    interface_mod_new_theme_emerald_v2:{ ru:'Emerald V2', en:'Emerald V2', uk:'Emerald V2' },
    interface_mod_new_theme_aurora:    { ru:'Aurora',     en:'Aurora',     uk:'Aurora' }
  });

  // === Settings ===
  var KEY = function(k){ return 'interface_mod_new_'+k; };
  var settings = {
    info_panel:      Lampa.Storage.get(KEY('info_panel'), true),
    colored_ratings: Lampa.Storage.get(KEY('colored_ratings'), true),
    theme:           Lampa.Storage.get(KEY('theme_select'), 'default')
  };

  function save(k,v){
    if (k==='info_panel'){ settings.info_panel=!!v; Lampa.Storage.set(KEY('info_panel'), settings.info_panel); }
    if (k==='colored_ratings'){ settings.colored_ratings=!!v; Lampa.Storage.set(KEY('colored_ratings'), settings.colored_ratings); }
    if (k==='theme'){ settings.theme=String(v||'default'); Lampa.Storage.set(KEY('theme_select'), settings.theme); }
  }

  // === Base overrides used by panel ===
  function injectStyle(css, id){
    var node=document.getElementById(id);
    if(!node){ node=document.createElement('style'); node.id=id; document.head.appendChild(node); }
    node.textContent=css;
  }
  injectStyle(`
    .full-start-new__details {
      color:#fff;
      margin:-0.45em;
      margin-bottom:1em;
      display:flex;
      align-items:center;
      flex-wrap:wrap;
      min-height:1.9em;
      font-size:1.1em;
    }
    *:not(input){ user-select:none; -webkit-user-select:none; -moz-user-select:none; -ms-user-select:none; }
    *{ -webkit-tap-highlight-color:transparent; -webkit-touch-callout:none; box-sizing:border-box; outline:none; -webkit-user-drag:none; }
    ::-webkit-scrollbar{ display:none; }

    .ifacepp-row{ display:flex; flex-wrap:wrap; gap:.2em; align-items:center; width:100%; margin:0 0 .2em 0; }
    .ifacepp-badge{
      border-radius:.3em; border:0; font-size:1.0em; padding:.2em .6em; display:inline-block;
      white-space:nowrap; line-height:1.2em; margin-right:.4em; margin-bottom:.2em;
    }
    .ifacepp-chip-blue{ background:rgba(52,152,219,.8); color:#fff; }
    .ifacepp-chip-green{ background:rgba(46,204,113,.8); color:#fff; }
    .ifacepp-chip-orange{ background:rgba(230,126,34,.8); color:#fff; }
    .ifacepp-genre{ border-radius:.3em; padding:.2em .6em; margin-right:.4em; margin-bottom:.2em; display:inline-block; }
  `, 'ifacepp_base');

  // === Themes (only 3, with !important) ===
  var THEME_ID = 'interface_mod_theme';
  function removeTheme(){ var n=document.getElementById(THEME_ID); if(n) n.remove(); }
  function setThemeCSS(txt){ removeTheme(); if(!txt) return; var s=document.createElement('style'); s.id=THEME_ID; s.textContent=txt; document.head.appendChild(s); }

  var CSS_EMERALD_V1 = `
  body { background: linear-gradient(135deg, #1a2a3a 0%, #2C5364 50%, #203A43 100%) !important; color:#ffffff !important; }
  .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus,
  .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus, .custom-online-btn.focus, .custom-torrent-btn.focus,
  .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
    background: linear-gradient(to right, #43cea2, #185a9d) !important;
    color:#fff !important; box-shadow:0 4px 15px rgba(67,206,162,.3) !important; border-radius:5px !important;
  }
  .card.focus .card__view::after, .card.hover .card__view::after { border:3px solid #43cea2 !important; box-shadow:0 0 20px rgba(67,206,162,.4) !important; }
  .head__action.focus, .head__action.hover { background: linear-gradient(45deg, #43cea2, #185a9d) !important; }
  .full-start__background { opacity:.85 !important; filter: brightness(1.1) saturate(1.2) !important; }
  .settings__content, .settings-input__content, .selectbox__content, .modal__content {
    background: rgba(26, 42, 58, .98) !important; border: 1px solid rgba(67, 206, 162, .1) !important;
  }`;

  var CSS_EMERALD_V2 = `
  body { background: linear-gradient(135deg, #0c1619 0%, #132730 50%, #18323a 100%) !important; color:#dfdfdf !important; }
  .menu__item, .settings-folder, .settings-param, .selectbox-item, .full-start__button, .full-descr__tag, .player-panel .button,
  .custom-online-btn, .custom-torrent-btn, .main2-more-btn, .simple-button, .menu__version { border-radius:1.0em !important; }
  .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus,
  .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus, .custom-online-btn.focus, .custom-torrent-btn.focus,
  .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
    background: linear-gradient(to right, #1a594d, #0e3652) !important; color:#fff !important;
    box-shadow:0 2px 8px rgba(26,89,77,.2) !important; border-radius:1.0em !important;
  }
  .card, .card.focus, .card.hover { border-radius:1.0em !important; }
  .card.focus .card__view::after, .card.hover .card__view::after {
    border:2px solid #1a594d !important; box-shadow:0 0 10px rgba(26,89,77,.3) !important; border-radius:1.0em !important;
  }
  .head__action, .head__action.focus, .head__action.hover { border-radius:1.0em !important; }
  .head__action.focus, .head__action.hover { background: linear-gradient(45deg, #1a594d, #0e3652) !important; }
  .full-start__background { opacity:.75 !important; filter: brightness(.9) saturate(1.1) !important; }
  .settings__content, .settings-input__content, .selectbox__content, .modal__content {
    background: rgba(12, 22, 25, .97) !important; border: 1px solid rgba(26, 89, 77, .1) !important; border-radius:1.0em !important;
  }`;

  var CSS_AURORA = `
  body { background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%) !important; color:#ffffff !important; }
  .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus,
  .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus, .custom-online-btn.focus, .custom-torrent-btn.focus,
  .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
    background: linear-gradient(to right, #aa4b6b, #6b6b83, #3b8d99) !important; color:#fff !important;
    box-shadow:0 0 20px rgba(170,75,107,.3) !important; transform:scale(1.02) !important; transition:all .3s ease !important;
  }
  .card.focus .card__view::after, .card.hover .card__view::after { border:2px solid #aa4b6b !important; box-shadow:0 0 25px rgba(170,75,107,.5) !important; }
  .head__action.focus, .head__action.hover { background: linear-gradient(45deg, #aa4b6b, #3b8d99) !important; transform:scale(1.05) !important; }
  .full-start__background { opacity:.75 !important; filter: contrast(1.1) brightness(1.1) !important; }`;

  function applyTheme(name){
    if (name==='default'){ removeTheme(); return; }
    if (name==='emerald-v1') setThemeCSS(CSS_EMERALD_V1);
    else if (name==='emerald-v2') setThemeCSS(CSS_EMERALD_V2);
    else setThemeCSS(CSS_AURORA);
  }

  // === Helpers (declensions + durations) ===
  function plural(number, one, two, five){
    var n=Math.abs(number); n%=100; if(n>=5&&n<=20) return five; n%=10; if(n===1) return one; if(n>=2&&n<=4) return two; return five;
  }
  function calculateAverageEpisodeDuration(movie){
    if (!movie || typeof movie!=='object') return 0;
    var total=0,count=0;
    if (movie.episode_run_time && Array.isArray(movie.episode_run_time) && movie.episode_run_time.length){
      var arr=movie.episode_run_time.filter(function(x){return x>0 && x<=200;});
      arr.forEach(function(x){ total+=x; count++; });
    } else if (movie.seasons && Array.isArray(movie.seasons)){
      movie.seasons.forEach(function(s){
        if (s.episodes && Array.isArray(s.episodes)){
          s.episodes.forEach(function(e){ if (e.runtime && e.runtime>0 && e.runtime<=200){ total+=e.runtime; count++; }});
        }
      });
    }
    if (count>0) return Math.round(total/count);
    if (movie.last_episode_to_air && movie.last_episode_to_air.runtime && movie.last_episode_to_air.runtime>0 && movie.last_episode_to_air.runtime<=200) return movie.last_episode_to_air.runtime;
    return 0;
  }
  function formatDurationMinutes(min){
    if (!min||min<=0) return '';
    var h=Math.floor(min/60), m=min%60, out='';
    if (h>0){ out+=h+' '+plural(h,'година','години','годин'); if (m>0) out+=' '+m+' '+plural(m,'хвилина','хвилини','хвилин'); }
    else out+=m+' '+plural(m,'хвилина','хвилини','хвилин');
    return out;
  }

  // === Colored numeric ratings (toggle) ===
  function updateVoteColors(){
    if (!settings.colored_ratings) return;
    function paint(el){
      var t=$(el).text().trim(), m=t.match(/(\d+(\.\d+)?)/); if(!m) return;
      var v=parseFloat(m[1]);
      if (v>=0 && v<=3) $(el).css('color','red');
      else if (v>3 && v<6) $(el).css('color','orange');
      else if (v>=6 && v<8) $(el).css('color','cornflowerblue');
      else if (v>=8 && v<=10) $(el).css('color','lawngreen');
    }
    $('.card__vote, .full-start__rate, .full-start-new__rate, .info__rate, .card__imdb-rate, .card__kinopoisk-rate').each(function(){ paint(this); });
  }
  function observeVoteColors(){
    if (!settings.colored_ratings) return;
    setTimeout(updateVoteColors, 500);
    new MutationObserver(function(){ setTimeout(updateVoteColors,100); })
      .observe(document.body,{childList:true,subtree:true});
    Lampa.Listener.follow('full', function(d){ if (d.type==='complite') setTimeout(updateVoteColors,100); });
  }

  // === Age rating chip coloring ===
  function colorizeAgeRating(){
    function apply(el){
      var t=$(el).text().trim();
      var groups={
        kids:['G','TV-Y','TV-G','0+','3+','0','3'],
        children:['PG','TV-PG','TV-Y7','6+','7+','6','7'],
        teens:['PG-13','TV-14','12+','13+','14+','12','13','14'],
        almostAdult:['R','TV-MA','16+','17+','16','17'],
        adult:['NC-17','18+','18','X']
      };
      var colors={ kids:{bg:'#2ecc71',text:'#fff'}, children:{bg:'#3498db',text:'#fff'}, teens:{bg:'#f1c40f',text:'#000'}, almostAdult:{bg:'#e67e22',text:'#fff'}, adult:{bg:'#e74c3c',text:'#fff'} };
      var group=null; for (var k in groups){ if (groups[k].some(function(s){return t.includes(s);})){ group=k; break; } }
      if (group) $(el).css({'background-color':colors[group].bg,'color':colors[group].text,'border-radius':'.3em','font-size':'1.3em','border':'0'});
    }
    $('.full-start__pg').each(function(){ apply(this); });
    new MutationObserver(function(m){ m.forEach(function(x){ if (x.addedNodes && x.addedNodes.length){ $(x.addedNodes).find('.full-start__pg').each(function(){ apply(this); }); } }); })
      .observe(document.body,{childList:true,subtree:true});
    Lampa.Listener.follow('full', function(d){ if (d.type==='complite') setTimeout(function(){ $(d.object.activity.render()).find('.full-start__pg').each(function(){ apply(this); }); },100); });
  }

  // === Genre color map ===
  var GENRE_COLORS = {
    'Бойовик':{bg:'rgba(231,76,60,.8)',text:'white'}, 'Пригоди':{bg:'rgba(39,174,96,.8)',text:'white'},
    'Мультфільм':{bg:'rgba(155,89,182,.8)',text:'white'}, 'Комедія':{bg:'rgba(241,196,15,.8)',text:'black'},
    'Кримінал':{bg:'rgba(192,57,43,.8)',text:'white'}, 'Документальний':{bg:'rgba(22,160,133,.8)',text:'white'},
    'Драма':{bg:'rgba(142,68,173,.8)',text:'white'}, 'Сімейний':{bg:'rgba(46,204,113,.8)',text:'white'},
    'Фентезі':{bg:'rgba(155,89,182,.8)',text:'white'}, 'Історія':{bg:'rgba(211,84,0,.8)',text:'white'},
    'Жахи':{bg:'rgba(192,57,43,.8)',text:'white'}, 'Музика':{bg:'rgba(52,152,219,.8)',text:'white'},
    'Детектив':{bg:'rgba(52,73,94,.8)',text:'white'}, 'Мелодрама':{bg:'rgba(233,30,99,.8)',text:'white'},
    'Фантастика':{bg:'rgba(41,128,185,.8)',text:'white'}, 'Трилер':{bg:'rgba(192,57,43,.8)',text:'white'},
    'Військовий':{bg:'rgba(127,140,141,.8)',text:'white'}, 'Вестерн':{bg:'rgba(211,84,0,.8)',text:'white'},
    'Бойовик і Пригоди':{bg:'rgba(231,76,60,.8)',text:'white'}, 'Дитячий':{bg:'rgba(46,204,113,.8)',text:'white'},
    'Новини':{bg:'rgba(52,152,219,.8)',text:'white'}, 'Реаліті-шоу':{bg:'rgba(230,126,34,.8)',text:'white'},
    'НФ і Фентезі':{bg:'rgba(41,128,185,.8)',text:'white'}, 'Мильна опера':{bg:'rgba(233,30,99,.8)',text:'white'},
    'Ток-шоу':{bg:'rgba(241,196,15,.8)',text:'black'}, 'Війна і Політика':{bg:'rgba(127,140,141,.8)',text:'white'}
  };

  // === Info panel (separate rows; no extra chips/duplicates) ===
  function newInfoPanel(){
    if (!settings.info_panel) return;

    Lampa.Listener.follow('full', function(data){
      if (data.type !== 'complite' || !settings.info_panel) return;

      setTimeout(function () {
        var $details = $('.full-start-new__details');
        if (!$details.length) return;

        // зняти попереднє додавання (щоб не було повторів)
        $details.find('[data-ifacepp="1"]').remove();

        var movie = data.data.movie || {};
        var isTv = !!(movie && (movie.number_of_seasons>0 || (movie.seasons&&movie.seasons.length>0) || movie.type==='tv' || movie.type==='serial'));

        // обробляємо оригінальні спани (щоб зберегти формати), але відфільтровуємо роздільники/сміття
        var origHTML = $details.html();
        var $tmp = $('<div>').html(origHTML);

        // прибрати "Наступна:"/ "Залишилось днів:" та розділювачі
        $tmp.find('span').filter(function(){
          var t=$(this).text().trim();
          return t.indexOf('Наступна:')!==-1 || t.indexOf('Залишилось днів:')!==-1 || $(this).hasClass('full-start-new__split') || t==='•';
        }).remove();

        var seasonChips=[], episodeChips=[], genreNodes=[], secondRow=$('<div class="ifacepp-row" data-ifacepp="1"></div>');
        var firstRow =$('<div class="ifacepp-row" data-ifacepp="1"></div>');
        var thirdRow =$('<div class="ifacepp-row" data-ifacepp="1"></div>');
        var genresRow=$('<div class="ifacepp-row" data-ifacepp="1"></div>');

        // розбір на сезони/серії/жанри
        $tmp.find('span').each(function(){
          var $s=$(this), t=$s.text().trim();
          if ($s.hasClass('full-start-new__split')) return;

          // сезони
          var mS=t.match(/Сезон(?:ы|и)?:?\s*(\d+)/i);
          if (mS){
            var n=parseInt(mS[1],10);
            var $chip=$('<span class="ifacepp-badge ifacepp-chip-blue"></span>').text(n+' '+plural(n,'Сезон','Сезону','Сезонів'));
            seasonChips.push($chip); return;
          }
          // серії (прості)
          var mE=t.match(/Серії?:?\s*(\d+)/i);
          if (mE){
            var n2=parseInt(mE[1],10);
            var $chip=$('<span class="ifacepp-badge ifacepp-chip-green"></span>').text(n2+' '+plural(n2,'Серія','Серії','Серій'));
            episodeChips.push($chip); return;
          }

          // жанри
          if (t.includes(' | ')){
            t.split(' | ').map(function(g){return g.trim();}).filter(Boolean).forEach(function(g){
              var c=GENRE_COLORS[g]||{bg:'rgba(255,255,255,.1)',text:'white'};
              var $g=$('<span class="ifacepp-genre"></span>').text(g).css({'background-color':c.bg,'color':c.text});
              genreNodes.push($g);
            });
          } else {
            // одиночні, але відсій непотрібного (години/хвилини, вікові, значки типу 4K/Онгоїнг)
            if (/^\d{2}:\d{2}$/.test(t)) return;
            if (/^\d+\+?$/.test(t) || /Онгоїнг|4K|TMDB/i.test(t)) return;
            if (t) {
              var c=GENRE_COLORS[t]||{bg:'rgba(255,255,255,.1)',text:'white'};
              var $g=$('<span class="ifacepp-genre"></span>').text(t).css({'background-color':c.bg,'color':c.text});
              genreNodes.push($g);
            }
          }
        });

        // 1) сезони/серії (для серіалів — розширений підрахунок)
        if (isTv && movie && Array.isArray(movie.seasons)){
          var total=0, aired=0, now=new Date(), hasEpisodes=false;
          movie.seasons.forEach(function(season){
            if (season.season_number===0) return;
            if (season.episode_count) total+=season.episode_count;
            if (season.episodes && Array.isArray(season.episodes) && season.episodes.length){
              hasEpisodes=true;
              season.episodes.forEach(function(ep){ if (ep.air_date){ var d=new Date(ep.air_date); if (d<=now) aired++; } });
            } else if (season.air_date){
              var d=new Date(season.air_date);
              if (d<=now && season.episode_count) aired+=season.episode_count;
            }
          });
          if (movie.number_of_seasons>0){
            var n=movie.number_of_seasons;
            firstRow.append($('<span class="ifacepp-badge ifacepp-chip-blue"></span>').text(n+' '+plural(n,'Сезон','Сезону','Сезонів')));
          }
          if (total>0){
            var txt = (aired>0 && aired<total) ? (aired+' '+plural(aired,'Серія','Серії','Серій')+' з '+total) : (total+' '+plural(total,'Серія','Серії','Серій'));
            firstRow.append($('<span class="ifacepp-badge ifacepp-chip-green"></span>').text(txt));
          }
        } else {
          // фільми: просто перенесемо, якщо були «Сезони/Серії» у вихідній розмітці (рідко)
          seasonChips.forEach(function($c){ firstRow.append($c); });
          episodeChips.forEach(function($c){ firstRow.append($c); });
        }

        // 2) наступна серія
        if (isTv && movie.next_episode_to_air && movie.next_episode_to_air.air_date){
          var nextDate=new Date(movie.next_episode_to_air.air_date), today=new Date();
          nextDate.setHours(0,0,0,0); today.setHours(0,0,0,0);
          var diff=Math.floor((nextDate.getTime()-today.getTime())/(1000*60*60*24));
          var nextText = diff===0 ? 'Наступна серія вже сьогодні' :
                         diff===1 ? 'Наступна серія вже завтра' :
                         (diff>1 ? 'Наступна серія через '+diff+' '+plural(diff,'день','дні','днів') : '');
          if (nextText) secondRow.append($('<span class="ifacepp-badge ifacepp-chip-orange"></span>').text(nextText));
        }

        // 3) тривалість
        if (isTv){
          var avg=calculateAverageEpisodeDuration(movie);
          if (avg>0) thirdRow.append($('<span class="ifacepp-badge ifacepp-chip-blue"></span>').text('Тривалість серії ≈ '+formatDurationMinutes(avg)));
        } else if (movie && movie.runtime>0){
          var mins=movie.runtime, h=Math.floor(mins/60), m=mins%60;
          var txt='Тривалість фільму: '; if (h>0) txt+=h+' '+plural(h,'година','години','годин'); if (m>0) txt+=(h>0?' ':'')+m+' хв.';
          thirdRow.append($('<span class="ifacepp-badge ifacepp-chip-blue"></span>').text(txt));
        }

        // 4) жанри
        genreNodes.forEach(function(n){ genresRow.append(n); });

        // Додавання у DOM (тільки непорожні рядки)
        if (firstRow.children().length)  $details.append(firstRow);
        if (secondRow.children().length) $details.append(secondRow);
        if (thirdRow.children().length)  $details.append(thirdRow);
        if (genresRow.children().length) $details.append(genresRow);

      }, 100);
    });
  }

  // === Settings UI (strictly inside "Інтерфейс +") ===
  function addSettings(){
    Lampa.SettingsApi.addComponent({
      component: 'interface_mod_new',
      name: Lampa.Lang.translate('interface_mod_new_plugin_name'),
      icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V7C20 7.55228 19.5523 8 19 8H5C4.44772 8 4 7.55228 4 7V5Z" fill="currentColor"/><path d="M4 11C4 10.4477 4.44772 10 5 10H19C19.5523 10 20 10.4477 20 11V13C20 13.5523 19.5523 14 19 14H5C4.44772 14 4 13.5523 4 13V11Z" fill="currentColor"/><path d="M4 17C4 16.4477 4.44772 16 5 16H19C19.5523 16 20 16.4477 20 17V19C20 19.5523 19.5523 20 19 20H5C4.44772 20 4 19.5523 4 19V17Z" fill="currentColor"/></svg>'
    });

    // Пересунути блок одразу під "Інтерфейс"
    function moveModSettingsFolder(){
      var $folders=$('.settings-folder');
      var $interface=$folders.filter(function(){ return $(this).data('component')==='interface'; });
      var $mod=$folders.filter(function(){ return $(this).data('component')==='interface_mod_new'; });
      if ($interface.length && $mod.length && $mod.prev()[0] !== $interface[0]) $mod.insertAfter($interface);
    }
    setTimeout(moveModSettingsFolder, 1000);
    new MutationObserver(function(){ setTimeout(moveModSettingsFolder, 100); })
      .observe(document.body,{childList:true,subtree:true});

    // 1. Нова-інфо панель
    Lampa.SettingsApi.addParam({
      component: 'interface_mod_new',
      param: 'info_panel',
      name: Lampa.Lang.translate('interface_mod_new_info_panel'),
      type: 'switch',
      default: true,
      values: [true,false],
      descr: Lampa.Lang.translate('interface_mod_new_info_panel_desc')
    }, function(v){
      save('info_panel', !!v);
      // Перебудувати поточну сторінку
      $('.full-start-new__details [data-ifacepp="1"]').remove();
      if (settings.info_panel) Lampa.Activity.call(Lampa.Activity.active().activity);
    });

    // 2. Кольоровий рейтинг
    Lampa.SettingsApi.addParam({
      component: 'interface_mod_new',
      param: 'colored_ratings',
      name: Lampa.Lang.translate('interface_mod_new_colored_ratings'),
      type: 'switch',
      default: true,
      values: [true,false],
      descr: Lampa.Lang.translate('interface_mod_new_colored_ratings_desc')
    }, function(v){
      save('colored_ratings', !!v);
      if (settings.colored_ratings) updateVoteColors();
      else $('.card__vote, .full-start__rate, .full-start-new__rate, .info__rate, .card__imdb-rate, .card__kinopoisk-rate').css('color','');
    });

    // 3. Тема інтерфейсу
    Lampa.SettingsApi.addParam({
      component: 'interface_mod_new',
      param: 'theme',
      name: Lampa.Lang.translate('interface_mod_new_theme_select'),
      type: 'select',
      default: 'default',
      values: ['default','emerald-v1','emerald-v2','aurora'],
      descr: Lampa.Lang.translate('interface_mod_new_theme_select_desc')
    }, function(v){
      save('theme', v);
      applyTheme(settings.theme);
    });
  }

  // === Init ===
  function start(){
    addSettings();
    applyTheme(settings.theme);
    newInfoPanel();
    if (settings.colored_ratings){
      updateVoteColors();
      observeVoteColors();
    }
    colorizeAgeRating();
    console.log('%cInterface+ loaded','color:#23d18b');
  }

  if (window.appready) start();
  else Lampa.Listener.follow('app', function (e){ if (e.type==='ready') start(); });

})();

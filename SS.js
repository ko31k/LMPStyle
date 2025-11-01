/* =========================================================================
 * Lampa Plugin: Interface+ — Info Panel, Colored Rating, Themes (Emerald V1/V2, Aurora)
 * ========================================================================= */
(function () {
  'use strict';
  if (!window.Lampa) return;
  var Lampa = window.Lampa;
  var $ = window.$ || window.jQuery;

  // polyfill
  if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (s, p){ p=p||0; return this.indexOf(s,p)===p; };
  }

  // i18n
  Lampa.Lang.add({
    interface_mod_new_plugin_name: { ru:'Интерфейс +', en:'Interface +', uk:'Інтерфейс +' },

    interface_mod_new_info_panel: { ru:'Новая инфо-панель', en:'New info panel', uk:'Нова інфо-панель' },
    interface_mod_new_info_panel_desc: {
      ru:'Цветная и перефразированная строка информации',
      en:'Colored and rephrased info line',
      uk:'Кольорова та перефразована інформаційна панель'
    },

    interface_mod_new_colored_ratings: { ru:'Цветной рейтинг', en:'Colored rating', uk:'Кольоровий рейтинг' },
    interface_mod_new_colored_ratings_desc: {
      ru:'Подсветка числовых рейтингов',
      en:'Highlight numeric ratings',
      uk:'Підсвічування числових рейтингів'
    },

    interface_mod_new_theme_select: { ru:'Тема интерфейса', en:'Interface theme', uk:'Тема інтерфейсу' },
    interface_mod_new_theme_select_desc: { ru:'Выберите тему', en:'Choose theme', uk:'Виберіть тему' },
    interface_mod_new_theme_default: { ru:'По умолчанию', en:'Default', uk:'За замовчуванням' },
    interface_mod_new_theme_emerald_v1:{ ru:'Emerald V1', en:'Emerald V1', uk:'Emerald V1' },
    interface_mod_new_theme_emerald_v2:{ ru:'Emerald V2', en:'Emerald V2', uk:'Emerald V2' },
    interface_mod_new_theme_aurora:    { ru:'Aurora',     en:'Aurora',     uk:'Aurora' }
  });

  // storage helpers
  var KEY = k => 'interface_mod_new_' + k;
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

  // base css (override default; важливе з твоїх стилів)
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
      *:not(input){ user-select:none; -webkit-user-select:none; -moz-user-select:none; -ms-user-select:none; }
      *{ -webkit-tap-highlight-color:transparent; -webkit-touch-callout:none; box-sizing:border-box; outline:none; -webkit-user-drag:none; }
      ::-webkit-scrollbar{ display:none; }

      /* Інфо-панель */
      .ifacepp-wrap{ display:flex; flex-direction:column; width:100%; gap:0em; margin:-1.0em 0 0.2em 0.45em; }
      .ifacepp-row{ display:flex; flex-wrap:wrap; gap:.2em; align-items:center; width:100%; margin:0 0 0.2em 0; }
      .ifacepp-badge{
        border-radius:.3em; border:0; font-size:1.0em; padding:.2em .6em; display:inline-block;
        white-space:nowrap; line-height:1.2em; margin-right:.4em; margin-bottom:.2em;
      }
      .ifacepp-chip-blue{ background:rgba(52,152,219,.8) !important; color:#fff !important; }
      .ifacepp-chip-green{ background:rgba(46,204,113,.8) !important; color:#fff !important; }
      .ifacepp-chip-orange{ background:rgba(230,126,34,.8) !important; color:#fff !important; }
      .ifacepp-genre{ border-radius:.3em; padding:.2em .6em; margin-right:.4em; margin-bottom:.2em; display:inline-block; }
    `;
    var s=document.createElement('style'); s.id='ifacepp_base'; s.textContent=css; document.head.appendChild(s);
  })();

  // themes (3 only)
  var THEME_ID='interface_mod_theme';
  function setThemeCSS(txt){ var n=document.getElementById(THEME_ID); if(n) n.remove(); if(!txt) return; var s=document.createElement('style'); s.id=THEME_ID; s.textContent=txt; document.head.appendChild(s); }
  function applyTheme(name){
    if (name==='default'){ setThemeCSS(''); return; }
    if (name==='emerald-v1') setThemeCSS(`
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
    else if (name==='emerald-v2') setThemeCSS(`
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

  // helpers
  function plural(n, one, two, five){ var x=Math.abs(n)%100; if(x>=5&&x<=20) return five; x%=10; if(x===1) return one; if(x>=2&&x<=4) return two; return five; }
  function calcAvgEp(movie){
    if (!movie||typeof movie!=='object') return 0;
    var sum=0,c=0;
    if (movie.episode_run_time && Array.isArray(movie.episode_run_time) && movie.episode_run_time.length){
      movie.episode_run_time.filter(v=>v>0&&v<=200).forEach(v=>{ sum+=v; c++; });
    } else if (movie.seasons && Array.isArray(movie.seasons)){
      movie.seasons.forEach(s=>{
        if (s.episodes && Array.isArray(s.episodes)){
          s.episodes.forEach(e=>{ if(e.runtime&&e.runtime>0&&e.runtime<=200){ sum+=e.runtime; c++; }});
        }
      });
    }
    if (c>0) return Math.round(sum/c);
    if (movie.last_episode_to_air && movie.last_episode_to_air.runtime && movie.last_episode_to_air.runtime>0 && movie.last_episode_to_air.runtime<=200) return movie.last_episode_to_air.runtime;
    return 0;
  }
  function fmtMin(m){ if(!m||m<=0)return''; var h=Math.floor(m/60), mm=m%60, s=''; if(h>0){ s+=h+' '+plural(h,'година','години','годин'); if(mm>0) s+=' '+mm+' '+plural(mm,'хвилина','хвилини','хвилин'); } else s+=mm+' '+plural(mm,'хвилина','хвилини','хвилин'); return s; }

  // rating colors
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
    setTimeout(updateVoteColors, 500);
    new MutationObserver(function(){ setTimeout(updateVoteColors,100); }).observe(document.body,{childList:true,subtree:true});
    Lampa.Listener.follow('full', d=>{ if(d.type==='complite') setTimeout(updateVoteColors,100); });
  }

  // genre colors (UA)
  var GENRE = {
    'Бойовик':{bg:'rgba(231,76,60,.8)',text:'#fff'}, 'Екшн':{bg:'rgba(231,76,60,.8)',text:'#fff'},
    'Екшн і Пригоди':{bg:'rgba(231,76,60,.8)',text:'#fff'}, 'Бойовик і Пригоди':{bg:'rgba(231,76,60,.8)',text:'#fff'},
    'Пригоди':{bg:'rgba(39,174,96,.8)',text:'#fff'}, 'Мультфільм':{bg:'rgba(155,89,182,.8)',text:'#fff'},
    'Комедія':{bg:'rgba(241,196,15,.8)',text:'#000'}, 'Кримінал':{bg:'rgba(192,57,43,.8)',text:'#fff'},
    'Документальний':{bg:'rgba(22,160,133,.8)',text:'#fff'}, 'Драма':{bg:'rgba(142,68,173,.8)',text:'#fff'},
    'Сімейний':{bg:'rgba(46,204,113,.8)',text:'#fff'}, 'Фентезі':{bg:'rgba(155,89,182,.8)',text:'#fff'},
    'Історія':{bg:'rgba(211,84,0,.8)',text:'#fff'}, 'Жахи':{bg:'rgba(192,57,43,.8)',text:'#fff'},
    'Музика':{bg:'rgba(52,152,219,.8)',text:'#fff'}, 'Детектив':{bg:'rgba(52,73,94,.8)',text:'#fff'},
    'Науково-фантастичний':{bg:'rgba(41,128,185,.8)',text:'#fff'}, 'Науково фантастичний':{bg:'rgba(41,128,185,.8)',text:'#fff'},
    'Фантастика':{bg:'rgba(41,128,185,.8)',text:'#fff'}, 'Трилер':{bg:'rgba(192,57,43,.8)',text:'#fff'},
    'Військовий':{bg:'rgba(127,140,141,.8)',text:'#fff'}, 'Вестерн':{bg:'rgba(211,84,0,.8)',text:'#fff'},
    'Новини':{bg:'rgba(52,152,219,.8)',text:'#fff'}, 'Реаліті-шоу':{bg:'rgba(230,126,34,.8)',text:'#fff'},
    'НФ і Фентезі':{bg:'rgba(41,128,185,.8)',text:'#fff'}, 'Мильна опера':{bg:'rgba(233,30,99,.8)',text:'#fff'},
    'Ток-шоу':{bg:'rgba(241,196,15,.8)',text:'#000'}, 'Війна і Політика':{bg:'rgba(127,140,141,.8)',text:'#fff'}
  };

  // INFO PANEL (порядок рядків і відступи як у тебе)
  function newInfoPanel(){
    if (!settings.info_panel) return;

    Lampa.Listener.follow('full', function(data){
      if (data.type!=='complite' || !settings.info_panel) return;

      setTimeout(function(){
        var $details = $('.full-start-new__details');
        if (!$details.length) return;

        var original = $details.html();
        $details.empty();

        var movie = data.data.movie || {};
        var isTv = !!(movie && (movie.number_of_seasons>0 || (movie.seasons&&movie.seasons.length>0) || movie.type==='tv' || movie.type==='serial'));

        // очистити непотрібне та витягти жанри з оригіналу
        var $tmp = $('<div>').html(original);
        $tmp.find('span').filter(function(){
          var t=$(this).text().trim();
          var isDot = /^([•·]|\.{1,3})$/.test(t);
          var isAge = /^\d{1,2}\+?$/.test(t);
          var isTime= /^\d{1,2}:\d{2}$/.test(t);
          var isServ= /(Онгоїнг|On ?going|4K|TMDB|HDR|UHD|SDR)/i.test(t);
          var isNext= t.indexOf('Наступна:')!==-1 || t.indexOf('Залишилось днів:')!==-1;
          var isSeEp = /Сезон|Серії?/i.test(t); // ми малюємо свої
          return isDot||isAge||isTime||isServ||isNext||isSeEp||$(this).hasClass('full-start-new__split');
        }).remove();

        // обгортка з твоїми відступами
        var wrap  = $('<div class="ifacepp-wrap" data-ifacepp="1"></div>');
        var row1  = $('<div class="ifacepp-row"></div>'); // Серії
        var row2  = $('<div class="ifacepp-row"></div>'); // Наступна
        var row3  = $('<div class="ifacepp-row"></div>'); // Тривалість
        var row4  = $('<div class="ifacepp-row"></div>'); // Сезони + Жанри

        // 1) Серії
        (function buildEpisodes(){
          if (isTv && movie && Array.isArray(movie.seasons)){
            var total=0, aired=0, now=new Date(), hasEp=false;
            movie.seasons.forEach(function(s){
              if (s.season_number===0) return;
              if (s.episode_count) total+=s.episode_count;
              if (s.episodes && Array.isArray(s.episodes) && s.episodes.length){
                hasEp=true;
                s.episodes.forEach(function(e){ if(e.air_date){ var d=new Date(e.air_date); if(d<=now) aired++; } });
              } else if (s.air_date){
                var d=new Date(s.air_date);
                if(d<=now && s.episode_count) aired+=s.episode_count;
              }
            });
            if (!hasEp && movie.next_episode_to_air && movie.next_episode_to_air.season_number && movie.next_episode_to_air.episode_number){
              var nextS = movie.next_episode_to_air.season_number;
              var nextE = movie.next_episode_to_air.episode_number;
              var remain=0;
              movie.seasons.forEach(function(s){
                if (s.season_number===nextS) remain = (s.episode_count||0) - nextE + 1;
                else if (s.season_number>nextS) remain += (s.episode_count||0);
              });
              if (remain>0 && total>0){
                var calc = total-remain;
                if (calc>=0 && calc<=total) aired=calc;
              }
            }
            if (total>0){
              var txt = (aired>0 && aired<total) ? (aired+' '+plural(aired,'Серія','Серії','Серій')+' з '+total)
                                                 : (total+' '+plural(total,'Серія','Серії','Серій'));
              row1.append($('<span class="ifacepp-badge ifacepp-chip-green"></span>').text(txt));
            }
          }
        })();

        // 2) Наступна серія
        if (isTv && movie.next_episode_to_air && movie.next_episode_to_air.air_date){
          var nextDate=new Date(movie.next_episode_to_air.air_date), today=new Date();
          nextDate.setHours(0,0,0,0); today.setHours(0,0,0,0);
          var diff=Math.floor((nextDate.getTime()-today.getTime())/(1000*60*60*24));
          var txt = diff===0 ? 'Наступна серія вже сьогодні'
                 : diff===1 ? 'Наступна серія вже завтра'
                 : (diff>1 ? 'Наступна серія через '+diff+' '+plural(diff,'день','дні','днів') : '');
          if (txt) row2.append($('<span class="ifacepp-badge ifacepp-chip-orange"></span>').text(txt));
        }

        // 3) Тривалість
        if (isTv){
          var avg=calcAvgEp(movie); if (avg>0)
            row3.append($('<span class="ifacepp-badge ifacepp-chip-blue"></span>').text('Тривалість серії ≈ '+fmtMin(avg)));
        } else if (movie && movie.runtime>0){
          var m=movie.runtime, h=Math.floor(m/60), mm=m%60;
          var t='Тривалість фільму: '; if (h>0) t+=h+' '+plural(h,'година','години','годин'); if (mm>0) t+=(h>0?' ':'')+mm+' хв.';
          row3.append($('<span class="ifacepp-badge ifacepp-chip-blue"></span>').text(t));
        }

        // 4) Сезони + Жанри
        if (isTv && movie.number_of_seasons>0){
          row4.append($('<span class="ifacepp-badge ifacepp-chip-blue"></span>').text('Сезони: ' + movie.number_of_seasons));
        }
        $tmp.find('span').each(function(){
          var t=$(this).text().trim(); if(!t) return;
          if (t.includes(' | ')){
            t.split(' | ').map(s=>s.trim()).filter(Boolean).forEach(function(g){
              var c=GENRE[g]||{bg:'rgba(255,255,255,.1)',text:'#fff'};
              row4.append($('<span class="ifacepp-genre"></span>').text(g).css({'background-color':c.bg,'color':c.text}));
            });
          } else {
            var c=GENRE[t]||{bg:'rgba(255,255,255,.1)',text:'#fff'};
            row4.append($('<span class="ifacepp-genre"></span>').text(t).css({'background-color':c.bg,'color':c.text}));
          }
        });

        // скласти у wrap і додати
        if (row1.children().length) wrap.append(row1);
        if (row2.children().length) wrap.append(row2);
        if (row3.children().length) wrap.append(row3);
        if (row4.children().length) wrap.append(row4);
        $details.append(wrap);
      }, 100);
    });
  }

  // age rating coloring (залишаю тільки підсвітку існуючих елементів)
  function colorizeAge(){
    function apply(el){
      var t=$(el).text().trim(), group=null;
      var g={ kids:['G','TV-Y','TV-G','0+','3+','0','3'],
              children:['PG','TV-PG','TV-Y7','6+','7+','6','7'],
              teens:['PG-13','TV-14','12+','13+','14+','12','13','14'],
              almost:['R','TV-MA','16+','17+','16','17'],
              adult:['NC-17','18+','18','X'] };
      var col={ kids:{bg:'#2ecc71',tx:'#fff'}, children:{bg:'#3498db',tx:'#fff'}, teens:{bg:'#f1c40f',tx:'#000'}, almost:{bg:'#e67e22',tx:'#fff'}, adult:{bg:'#e74c3c',tx:'#fff'} };
      for (var k in g){ if (g[k].some(s=>t.includes(s))){ group=k; break; } }
      if (group) $(el).css({'background-color':col[group].bg,'color':col[group].tx,'border-radius':'.3em','font-size':'1.3em','border':'0'});
    }
    $('.full-start__pg').each(function(){ apply(this); });
    new MutationObserver(function(m){ m.forEach(function(x){ $(x.addedNodes).find('.full-start__pg').each(function(){ apply(this); }); }); })
      .observe(document.body,{childList:true,subtree:true});
    Lampa.Listener.follow('full', d=>{ if(d.type==='complite') setTimeout(function(){ $(d.object.activity.render()).find('.full-start__pg').each(function(){ apply(this); }); },100); });
  }

  // settings UI (зі страховкою від «порожньої папки»)
  function addSettings(){
    Lampa.SettingsApi.addComponent({
      component:'interface_mod_new',
      name:Lampa.Lang.translate('interface_mod_new_plugin_name'),
      icon:'<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V7C20 7.55228 19.5523 8 19 8H5C4.44772 8 4 7.55228 4 7V5Z" fill="currentColor"/><path d="M4 11C4 10.4477 4.44772 10 5 10H19C19.5523 10 20 10.4477 20 11V13C20 13.5523 19.5523 14 19 14H5C4.44772 14 4 13.5523 4 13V11Z" fill="currentColor"/><path d="M4 17C4 16.4477 4.44772 16 5 16H19C19.5523 16 20 16.4477 20 17V19C20 19.5523 19.5523 20 19 20H5C4.44772 20 4 19.5523 4 19V17Z" fill="currentColor"/></svg>'
    });

    function addParams(){
      // 1) інфо-панель
      Lampa.SettingsApi.addParam({
        component:'interface_mod_new',
        param:'info_panel',
        name:Lampa.Lang.translate('interface_mod_new_info_panel'),
        type:'switch',
        default:true,
        value: settings.info_panel,
        descr:Lampa.Lang.translate('interface_mod_new_info_panel_desc')
      }, function(v){ save('info_panel',!!v); Lampa.Activity.call(Lampa.Activity.active().activity); });

      // 2) кольоровий рейтинг
      Lampa.SettingsApi.addParam({
        component:'interface_mod_new',
        param:'colored_ratings',
        name:Lampa.Lang.translate('interface_mod_new_colored_ratings'),
        type:'switch',
        default:true,
        value: settings.colored_ratings,
        descr:Lampa.Lang.translate('interface_mod_new_colored_ratings_desc')
      }, function(v){ save('colored_ratings',!!v); if(settings.colored_ratings) updateVoteColors(); else $('.card__vote, .full-start__rate, .full-start-new__rate, .info__rate, .card__imdb-rate, .card__kinopoisk-rate').css('color',''); });

      // 3) тема
      Lampa.SettingsApi.addParam({
        component:'interface_mod_new',
        param:'theme',
        name:Lampa.Lang.translate('interface_mod_new_theme_select'),
        type:'select',
        default:'default',
        value: settings.theme,
        values: {
          'default': Lampa.Lang.translate('interface_mod_new_theme_default'),
          'emerald-v1': Lampa.Lang.translate('interface_mod_new_theme_emerald_v1'),
          'emerald-v2': Lampa.Lang.translate('interface_mod_new_theme_emerald_v2'),
          'aurora': Lampa.Lang.translate('interface_mod_new_theme_aurora')
        },
        descr:Lampa.Lang.translate('interface_mod_new_theme_select_desc')
      }, function(v){ save('theme', v); applyTheme(settings.theme); });
    }

    // додати параметри одразу
    addParams();

    // якщо папка порожня — добудувати при відкритті
    Lampa.Listener.follow('settings', function(ev){
      if (ev.type==='open'){
        setTimeout(function(){
          var folder = $('.settings-folder[data-component="interface_mod_new"]');
          if (folder.length && folder.find('.settings-param').length===0) addParams();
        }, 0);
      }
    });

    // поставити під "Інтерфейс"
    function move(){
      var $f=$('.settings-folder');
      var $i=$f.filter(function(){return $(this).data('component')==='interface';});
      var $m=$f.filter(function(){return $(this).data('component')==='interface_mod_new';});
      if($i.length&&$m.length&&$m.prev()[0]!==$i[0]) $m.insertAfter($i);
    }
    setTimeout(move,1000);
    new MutationObserver(function(){ setTimeout(move,100); }).observe(document.body,{childList:true,subtree:true});
  }

  // init
  function start(){
    addSettings();
    applyTheme(settings.theme);
    newInfoPanel();
    if (settings.colored_ratings){ updateVoteColors(); observeVoteColors(); }
    colorizeAge();
    console.log('%cInterface+ loaded','color:#23d18b');
  }
  if (window.appready) start();
  else Lampa.Listener.follow('app', function (e){ if (e.type==='ready') start(); });
})();

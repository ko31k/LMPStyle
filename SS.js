/* =========================================================================
 * Lampa Plugin: Interface+ (Info Panel, Colored Rating, Themes)
 * Version: 1.0.0
 * Features:
 *   • Нова-інфо панель (жанри, тривалість, серії, наступна серія)
 *   • Кольоровий рейтинг (фарбування числового значення)
 *   • Теми: Emerald V1, Emerald V2, Aurora (та Default)
 *   • Меню "Інтерфейс+" (SettingsApi), без будь-яких бічних/швидких меню
 * ========================================================================= */
(function () {
  'use strict';

  if (typeof window === 'undefined' || typeof (window.Lampa || window.Lampa) === 'undefined') return;
  const L = window.Lampa;
  const $ = window.$ || window.jQuery;

  // Polyfill: startsWith
  if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
      position = position || 0;
      return this.indexOf(searchString, position) === position;
    };
  }

  // ───────────────────────────────────────────────────────────────────────
  // i18n
  // ───────────────────────────────────────────────────────────────────────
  L.Lang.add({
    interface_mod_new_plugin_name: { ru: 'Интерфейс +', en: 'Interface +', uk: 'Інтерфейс +' },

    interface_mod_new_info_panel: { ru:'Новая инфо-панель', en:'New info panel', uk:'Нова інфо-панель' },
    interface_mod_new_info_panel_desc: {
      ru:'Цветная и перефразированная строка информации о фильме/сериале',
      en:'Colored and rephrased info line about movie/series',
      uk:'Кольорова та перефразована інформаційна панель'
    },

    interface_mod_new_colored_ratings: { ru:'Цветной рейтинг', en:'Colored rating', uk:'Кольоровий рейтинг' },
    interface_mod_new_colored_ratings_desc: {
      ru:'Включить цветовое выделение рейтинга',
      en:'Enable colored rating highlight',
      uk:'Увімкнути кольорове виділення рейтингу'
    },

    interface_mod_new_theme_select: { ru:'Тема интерфейса', en:'Interface theme', uk:'Тема інтерфейсу' },
    interface_mod_new_theme_select_desc: {
      ru:'Выберите тему оформления интерфейса',
      en:'Choose interface theme',
      uk:'Виберіть тему оформлення інтерфейсу'
    },
    interface_mod_new_theme_default: { ru:'По умолчанию', en:'Default', uk:'За замовчуванням' },
    interface_mod_new_theme_emerald_v1: { ru:'Emerald V1', en:'Emerald V1', uk:'Emerald V1' },
    interface_mod_new_theme_emerald_v2: { ru:'Emerald V2', en:'Emerald V2', uk:'Emerald V2' },
    interface_mod_new_theme_aurora:     { ru:'Aurora',     en:'Aurora',     uk:'Aurora' }
  });

  // ───────────────────────────────────────────────────────────────────────
  // Settings (Storage keys сумісні з твоїм кодом)
  // ───────────────────────────────────────────────────────────────────────
  const SKEY = (k)=> `interface_mod_new_${k}`;
  let settings = {
    info_panel:      L.Storage.get(SKEY('info_panel'), true),
    colored_ratings: L.Storage.get(SKEY('colored_ratings'), true),
    theme:           L.Storage.get(SKEY('theme_select'), 'default')
  };
  function saveSetting(key, val){
    if (key === 'info_panel'){
      settings.info_panel = !!val; L.Storage.set(SKEY('info_panel'), settings.info_panel);
    } else if (key === 'colored_ratings'){
      settings.colored_ratings = !!val; L.Storage.set(SKEY('colored_ratings'), settings.colored_ratings);
    } else if (key === 'theme'){
      settings.theme = String(val || 'default'); L.Storage.set(SKEY('theme_select'), settings.theme);
    }
  }

  // ───────────────────────────────────────────────────────────────────────
  // CSS базовий для панелі/рейтингів/тем
  // (не переписує глобальні системні стилі Lampa)
  // ───────────────────────────────────────────────────────────────────────
  const BASE_CSS = `
  :root{
    --ifacepp-radius: 16px;
    --ifacepp-gap: 12px;
    --ifacepp-pad: 12px;
    --ifacepp-font: 14px;
  }
  /* Теми: через body-класи */
  body.ifacepp-theme-emerald-v1{
    --ifacepp-bg:#0b1110; --ifacepp-elev:#0f1715; --ifacepp-card:#101b18; --ifacepp-text:#d9f5ea; --ifacepp-soft:#c3ede0;
    --ifacepp-accent:#15b57a; --ifacepp-border:#175a45; --ifacepp-hover:#133d33;
  }
  body.ifacepp-theme-emerald-v2{
    --ifacepp-bg:#0a0f0c; --ifacepp-elev:#0e1612; --ifacepp-card:#0f1b14; --ifacepp-text:#e7fff3; --ifacepp-soft:#c8ffe7;
    --ifacepp-accent:#23d18b; --ifacepp-border:#1d6a4d; --ifacepp-hover:#144232;
  }
  body.ifacepp-theme-aurora{
    --ifacepp-bg:#070a12; --ifacepp-elev:#0b1020; --ifacepp-card:#0e1426; --ifacepp-text:#eaf2ff; --ifacepp-soft:#cddcff;
    --ifacepp-accent:linear-gradient(90deg,#6ae4a6,#86a9ff,#e1a0ff); --ifacepp-border:#2a3d73; --ifacepp-hover:#17224c;
  }

  /* Інфо-панель */
  .ifacepp-info-panel{
    display:flex; flex-wrap:wrap; gap:10px 14px; align-items:center;
    background:var(--ifacepp-card, rgba(255,255,255,.04));
    border:1px solid var(--ifacepp-border, rgba(255,255,255,.08));
    border-radius:var(--ifacepp-radius); padding:14px 16px; margin:12px 0 6px 0;
    font-size:var(--ifacepp-font); color:var(--ifacepp-text,#fff);
  }
  .ifacepp-chip{ display:inline-flex; align-items:center; gap:8px; padding:6px 10px; border-radius:999px; border:1px solid var(--ifacepp-border);
    background:var(--ifacepp-elev, rgba(255,255,255,.03)); line-height:1; white-space:nowrap; }
  .ifacepp-badge{ padding:6px 10px; border-radius:10px; font-weight:700; background:var(--ifacepp-hover); border:1px solid var(--ifacepp-border); }

  /* Кольоровий рейтинг (фарбування тексту виконується JS; нижче — легкий патч для vote-бейджів на картках) */
  .card__vote.ifacepp-patch{ border-radius:8px; padding:3px 6px; font-weight:800; }
  `;
  injectStyle(BASE_CSS);
  function injectStyle(css, id = 'ifacepp_style_block'){
    let node = document.getElementById(id);
    if (!node){ node = document.createElement('style'); node.id = id; document.head.appendChild(node); }
    node.textContent = css;
  }

  // ───────────────────────────────────────────────────────────────────────
  // Теми: тільки 3 (Emerald V1/V2, Aurora) + default (нічого не чіпаємо)
  // ───────────────────────────────────────────────────────────────────────
  function applyTheme(theme){
    const classes = ['ifacepp-theme-emerald-v1','ifacepp-theme-emerald-v2','ifacepp-theme-aurora'];
    document.body.classList.remove(...classes);
    if (theme === 'emerald-v1')      document.body.classList.add('ifacepp-theme-emerald-v1');
    else if (theme === 'emerald-v2') document.body.classList.add('ifacepp-theme-emerald-v2');
    else if (theme === 'aurora')     document.body.classList.add('ifacepp-theme-aurora');
    // default — без класів (вигляд Lampa)
  }

  // ───────────────────────────────────────────────────────────────────────
  // Допоміжні (плюрали та тривалості)
  // ───────────────────────────────────────────────────────────────────────
  function plural(number, one, two, five){
    var n=Math.abs(number); n%=100; if (n>=5&&n<=20) return five; n%=10; if (n===1) return one; if (n>=2&&n<=4) return two; return five;
  }
  function calculateAverageEpisodeDuration(movie){
    if (!movie || typeof movie !== 'object') return 0;
    var total=0, count=0;
    if (movie.episode_run_time && Array.isArray(movie.episode_run_time) && movie.episode_run_time.length>0){
      var filtered = movie.episode_run_time.filter(function(d){ return d>0 && d<=200; });
      if (filtered.length>0){ filtered.forEach(function(d){ total+=d; count++; }); }
    } else if (movie.seasons && Array.isArray(movie.seasons)){
      movie.seasons.forEach(function(season){
        if (season.episodes && Array.isArray(season.episodes)){
          season.episodes.forEach(function(ep){ if (ep.runtime && ep.runtime>0 && ep.runtime<=200){ total+=ep.runtime; count++; } });
        }
      });
    }
    if (count>0) return Math.round(total/count);
    if (movie.last_episode_to_air && movie.last_episode_to_air.runtime && movie.last_episode_to_air.runtime>0 && movie.last_episode_to_air.runtime<=200) return movie.last_episode_to_air.runtime;
    return 0;
  }
  function formatDurationMinutes(minutes){
    if (!minutes || minutes<=0) return '';
    var h=Math.floor(minutes/60), m=minutes%60, out='';
    if (h>0){ out+=h+' '+plural(h,'година','години','годин'); if (m>0) out+=' '+m+' '+plural(m,'хвилина','хвилини','хвилин'); }
    else    { out+=m+' '+plural(m,'хвилина','хвилини','хвилин'); }
    return out;
  }

  // ───────────────────────────────────────────────────────────────────────
  // Нова-інфо панель
  // ───────────────────────────────────────────────────────────────────────
  function newInfoPanel(){
    if (!settings.info_panel || !L.Listener || !$) return;

    var colors = {
      seasons:  { bg:'rgba(52,152,219,0.8)',  text:'white' },
      episodes: { bg:'rgba(46,204,113,0.8)',  text:'white' },
      duration: { bg:'rgba(52,152,219,0.8)',  text:'white' },
      next:     { bg:'rgba(230,126,34,0.8)',  text:'white' },
      genres: {
        'Бойовик':{bg:'rgba(231,76,60,0.8)',text:'white'}, 'Пригоди':{bg:'rgba(39,174,96,0.8)',text:'white'},
        'Мультфільм':{bg:'rgba(155,89,182,0.8)',text:'white'}, 'Комедія':{bg:'rgba(241,196,15,0.8)',text:'black'},
        'Кримінал':{bg:'rgba(192,57,43,0.8)',text:'white'}, 'Документальний':{bg:'rgba(22,160,133,0.8)',text:'white'},
        'Драма':{bg:'rgba(142,68,173,0.8)',text:'white'}, 'Сімейний':{bg:'rgba(46,204,113,0.8)',text:'white'},
        'Фентезі':{bg:'rgba(155,89,182,0.8)',text:'white'}, 'Історія':{bg:'rgba(211,84,0,0.8)',text:'white'},
        'Жахи':{bg:'rgba(192,57,43,0.8)',text:'white'}, 'Музика':{bg:'rgba(52,152,219,0.8)',text:'white'},
        'Детектив':{bg:'rgba(52,73,94,0.8)',text:'white'}, 'Мелодрама':{bg:'rgba(233,30,99,0.8)',text:'white'},
        'Фантастика':{bg:'rgba(41,128,185,0.8)',text:'white'}, 'Трилер':{bg:'rgba(192,57,43,0.8)',text:'white'},
        'Військовий':{bg:'rgba(127,140,141,0.8)',text:'white'}, 'Вестерн':{bg:'rgba(211,84,0,0.8)',text:'white'},
        'Бойовик і Пригоди':{bg:'rgba(231,76,60,0.8)',text:'white'}, 'Дитячий':{bg:'rgba(46,204,113,0.8)',text:'white'},
        'Новини':{bg:'rgba(52,152,219,0.8)',text:'white'}, 'Реаліті-шоу':{bg:'rgba(230,126,34,0.8)',text:'white'},
        'НФ і Фентезі':{bg:'rgba(41,128,185,0.8)',text:'white'}, 'Мильна опера':{bg:'rgba(233,30,99,0.8)',text:'white'},
        'Ток-шоу':{bg:'rgba(241,196,15,0.8)',text:'black'}, 'Війна і Політика':{bg:'rgba(127,140,141,0.8)',text:'white'}
      }
    };

    L.Listener.follow('full', function(data){
      if (data.type !== 'complite' || !settings.info_panel) return;

      setTimeout(function(){
        var details = $('.full-start-new__details');
        if (!details.length) return;

        var movie = data.data && data.data.movie ? data.data.movie : null;
        var isTvShow = movie && (movie.number_of_seasons>0 || (movie.seasons && movie.seasons.length>0) || movie.type==='tv' || movie.type==='serial');

        var original = details.html();
        details.empty();

        var newContainer = $('<div>').css({ display:'flex','flex-direction':'column', width:'100%','gap':'0em', margin:'-1.0em 0 0.2em 0.45em' });
        var firstRow  = $('<div>').css({ display:'flex','flex-wrap':'wrap','gap':'0.2em','align-items':'center', margin:'0 0 0.2em 0' });
        var secondRow = $('<div>').css({ display:'flex','flex-wrap':'wrap','gap':'0.2em','align-items':'center', margin:'0 0 0.2ем 0' });
        var thirdRow  = $('<div>').css({ display:'flex','flex-wrap':'wrap','gap':'0.2em','align-items':'center', margin:'0 0 0.2ем 0' });

        var seasonElements=[], episodeElements=[], nextEpisodeElements=[], genreElements=[], durationElement=null;

        var tmp = $('<div>').html(original);
        // Прибрати дефолтні "Наступна:"/“Залишилось днів:”
        tmp.find('span').filter(function(){
          var t=$(this).text();
          return t.indexOf('Наступна:')!==-1 || t.indexOf('Залишилось днів:')!==-1;
        }).remove();

        // Розбір вихідних <span> у наші бейджі
        tmp.find('span').each(function(){
          var $span=$(this), text=$span.text();
          if ($span.hasClass('full-start-new__split')) return;
          var base={ 'border-radius':'0.3em', border:'0px', 'font-size':'1.0em', padding:'0.2em 0.6em', display:'inline-block', 'white-space':'nowrap','line-height':'1.2em', 'margin-right':'0.4em','margin-bottom':'0.2em' };

          // Сезони
          var mS = text.match(/Сезон(?:ы|и)?:?\s*(\d+)/i);
          if (mS){
            var n=parseInt(mS[1],10);
            $span.text(n+' '+plural(n,'Сезон','Сезону','Сезонів'));
            $span.css($.extend({},base,{ 'background-color':colors.seasons.bg, color:colors.seasons.text }));
            seasonElements.push($span.clone()); return;
          }
          // Серії
          var mE = text.match(/Серії?:?\s*(\d+)/i);
          if (mE){
            var n2=parseInt(mE[1],10);
            $span.text(n2+' '+plural(n2,'Серія','Серії','Серій'));
            $span.css($.extend({},base,{ 'background-color':colors.episodes.bg, color:colors.episodes.text }));
            episodeElements.push($span.clone()); return;
          }
          // Жанри
          var parts = text.split(' | ');
          if (parts.length>1){
            var cont=$('<div>').css({ display:'flex','flex-wrap':'wrap','align-items':'center' });
            parts.forEach(function(g){
              g=g.trim(); var c=colors.genres[g]||{bg:'rgba(255,255,255,0.1)',text:'white'};
              var chip=$('<span>').text(g).css($.extend({},base,{ 'background-color':c.bg, color:c.text }));
              cont.append(chip);
            });
            genreElements.push(cont);
          } else {
            var g2=text.trim(); if (!g2) return;
            var c2=colors.genres[g2]||{bg:'rgba(255,255,255,0.1)',text:'white'};
            $span.css($.extend({},base,{ 'background-color':c2.bg, color:c2.text }));
            genreElements.push($span.clone());
          }
        });

        if (isTvShow && movie && movie.seasons && Array.isArray(movie.seasons)){
          var total=0, aired=0, now=new Date(), hasEpisodes=false;
          movie.seasons.forEach(function(season){
            if (season.season_number===0) return;
            if (season.episode_count) total+=season.episode_count;
            if (season.episodes && Array.isArray(season.episodes) && season.episodes.length){
              hasEpisodes=true;
              season.episodes.forEach(function(ep){
                if (ep.air_date){ var d=new Date(ep.air_date); if (d<=now) aired++; }
              });
            } else if (season.air_date){
              var d2=new Date(season.air_date);
              if (d2<=now && season.episode_count) aired+=season.episode_count;
            }
          });

          if (!hasEpisodes && movie.next_episode_to_air && movie.next_episode_to_air.season_number && movie.next_episode_to_air.episode_number){
            var nextS=movie.next_episode_to_air.season_number, nextE=movie.next_episode_to_air.episode_number, remaining=0;
            movie.seasons.forEach(function(season){
              if (season.season_number===nextS) remaining=(season.episode_count||0)-nextE+1;
              else if (season.season_number>nextS) remaining+=season.episode_count||0;
            });
            if (remaining>0 && total>0){
              var calc=total-remaining; if (calc>=0 && calc<=total) aired=calc;
            }
          }

          // 1-й рядок: сезони + "x серій з y"
          firstRow.empty(); seasonElements.forEach(function(el){ firstRow.append(el); });
          var episodesText='';
          if (total>0 && aired>0 && aired<total) episodesText = aired+' '+plural(aired,'Серія','Серії','Серій')+' з '+total;
          else if (total>0) episodesText = total+' '+plural(total,'Серія','Серії','Серій');
          if (episodesText){
            var base={ 'border-radius':'0.3em', border:'0px', 'font-size':'1.0em', padding:'0.2em 0.6em', display:'inline-block', 'white-space':'nowrap','line-height':'1.2em','margin-right':'0.4em','margin-bottom':'0.2em' };
            firstRow.append( $('<span>').text(episodesText).css($.extend({},base,{ 'background-color':colors.episodes.bg, color:colors.episodes.text })) );
          }

          // 2-й рядок: наступна серія
          secondRow.empty();
          if (movie.next_episode_to_air && movie.next_episode_to_air.air_date && (total===0 || aired<total)){
            var nextDate=new Date(movie.next_episode_to_air.air_date);
            var today=new Date(); nextDate.setHours(0,0,0,0); today.setHours(0,0,0,0);
            var diff = Math.floor((nextDate.getTime()-today.getTime())/(1000*60*60*24));
            var nextText = diff===0 ? 'Наступна серія вже сьогодні' : diff===1 ? 'Наступна серія вже завтра' : (diff>1 ? ('Наступна серія через '+diff+' '+plural(diff,'день','дні','днів')) : '');
            if (nextText){
              var st={ 'border-radius':'0.3em', border:'0px', 'font-size':'1.0em', padding:'0.2em 0.6em', display:'inline-block', 'white-space':'nowrap', 'line-height':'1.2em', 'background-color':colors.next.bg, color:colors.next.text, 'margin-right':'0.4em', 'margin-bottom':'0.2em' };
              secondRow.append( $('<span>').text(nextText).css(st) );
            }
          }

          // 3-й рядок: середня тривалість серії
          thirdRow.empty();
          var avg=calculateAverageEpisodeDuration(movie);
          if (avg>0){
            var dtext='Тривалість серії ≈ '+formatDurationMinutes(avg);
            var bs={ 'border-radius':'0.3em', border:'0px', 'font-size':'1.0em', padding:'0.2em 0.6em', display:'inline-block', 'white-space':'nowrap', 'line-height':'1.2em', 'margin-right':'0.2em', 'margin-bottom':'0.2em' };
            thirdRow.append( $('<span>').text(dtext).css($.extend({},bs,{ 'background-color':colors.duration.bg, color:colors.duration.text })) );
          }

          // Жанри
          var genresRow=$('<div>').css({ display:'flex','flex-wrap':'wrap', gap:'0.2em','align-items':'flex-start', margin:'0 0 0.2em 0' });
          genreElements.forEach(function(el){ genresRow.append(el); });

          newContainer.empty();
          newContainer.append(firstRow);
          if (secondRow.children().length) newContainer.append(secondRow);
          if (thirdRow.children().length)  newContainer.append(thirdRow);
          if (genresRow.children().length) newContainer.append(genresRow);
          details.append(newContainer);
          return;
        }

        // Фільм — тривалість фільму
        if (!isTvShow && movie && movie.runtime>0){
          var mins=movie.runtime, h=Math.floor(mins/60), m=mins%60;
          var text='Тривалість фільму: ';
          if (h>0) text+=h+' '+plural(h,'година','години','годин');
          if (m>0) text+=(h>0?' ':'')+m+' хв.';
          var badge=$('<span>').text(text).css({ 'border-radius':'0.3em', border:'0px', 'font-size':'1.0em', padding:'0.2em 0.6em', display:'inline-block', 'white-space':'nowrap', 'line-height':'1.2em', 'background-color':colors.duration.bg, color:colors.duration.text, 'margin-right':'0.4em', 'margin-bottom':'0.2em' });
          var cont=$('<div>').css({ display:'flex','flex-wrap':'wrap', gap:'0.2em','align-items':'center', margin:'-1.0ем 0 0.2em 0.45em' });
          cont.append(badge); details.append(cont);
        }
      }, 100);
    });
  }

  // ───────────────────────────────────────────────────────────────────────
  // Кольоровий рейтинг (фарбування тексту)
  // ───────────────────────────────────────────────────────────────────────
  function updateVoteColors() {
    if (!settings.colored_ratings) return;
    function applyColorByRating(element) {
      var voteText = $(element).text().trim();
      var match = voteText.match(/(\d+(\.\d+)?)/);
      if (!match) return;
      var vote = parseFloat(match[0]);
      if (vote >= 0 && vote <= 3)        $(element).css('color', 'red');
      else if (vote > 3 && vote < 6)     $(element).css('color', 'orange');
      else if (vote >= 6 && vote < 8)    $(element).css('color', 'cornflowerblue');
      else if (vote >= 8 && vote <= 10)  $(element).css('color', 'lawngreen');
    }
    $(".card__vote").each(function(){ applyColorByRating(this); });
    $(".full-start__rate, .full-start-new__rate").each(function(){ applyColorByRating(this); });
    $(".info__rate, .card__imdb-rate, .card__kinopoisk-rate").each(function(){ applyColorByRating(this); });
  }
  function setupVoteColorsObserver(){
    if (!settings.colored_ratings) return;
    setTimeout(updateVoteColors, 500);
    var observer = new MutationObserver(function(){ setTimeout(updateVoteColors, 100); });
    observer.observe(document.body, { childList:true, subtree:true });
  }
  function setupVoteColorsForDetailPage(){
    if (!settings.colored_ratings) return;
    L.Listener.follow('full', function (data) {
      if (data.type === 'complite') setTimeout(updateVoteColors, 100);
    });
  }

  // ───────────────────────────────────────────────────────────────────────
  // Меню: Інтерфейс+
  // ───────────────────────────────────────────────────────────────────────
  function addSettings(){
    if (!L.SettingsApi) return;

    L.SettingsApi.addComponent({
      component: 'interface_mod_new',
      name: L.Lang.translate('interface_mod_new_plugin_name'),
      icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V7C20 7.55228 19.5523 8 19 8H5C4.44772 8 4 7.55228 4 7V5Z" fill="currentColor"/><path d="M4 11C4 10.4477 4.44772 10 5 10H19C19.5523 10 20 10.4477 20 11В13C20 13.5523 19.5523 14 19 14H5C4.44772 14 4 13.5523 4 13В11Z" fill="currentColor"/><path d="M4 17C4 16.4477 4.44772 16 5 16H19C19.5523 16 20 16.4477 20 17В19C20 19.5523 19.5523 20 19 20H5C4.44772 20 4 19.5523 4 19В17Z" fill="currentColor"/></svg>'
    });

    // Перемістити “Інтерфейс+” одразу після “Інтерфейс”
    if ($){
      function moveModSettingsFolder(){
        var $folders = $('.settings-folder');
        var $interface = $folders.filter(function(){ return $(this).data('component') === 'interface'; });
        var $mod = $folders.filter(function(){ return $(this).data('component') === 'interface_mod_new'; });
        if ($interface.length && $mod.length){
          if ($mod.prev()[0] !== $interface[0]) $mod.insertAfter($interface);
        }
      }
      moveModSettingsFolder();
      new MutationObserver(moveModSettingsFolder).observe(document.body, { childList:true, subtree:true });
    }

    // Пункт: Нова-інфо панель
    L.SettingsApi.addParam({
      component: 'interface_mod_new',
      param: 'info_panel',
      name: L.Lang.translate('interface_mod_new_info_panel'),
      type: 'switch',
      default: true,
      values: [true,false],
      descr: L.Lang.translate('interface_mod_new_info_panel_desc')
    }, function(v){
      saveSetting('info_panel', !!v);
      // Перемалюємо сторінку деталей при наступному відкритті; на поточній підчистимо/додамо
      if (!settings.info_panel) $('.ifacepp-info-panel').remove();
    });

    // Пункт: Кольоровий рейтинг
    L.SettingsApi.addParam({
      component: 'interface_mod_new',
      param: 'colored_ratings',
      name: L.Lang.translate('interface_mod_new_colored_ratings'),
      type: 'switch',
      default: true,
      values: [true,false],
      descr: L.Lang.translate('interface_mod_new_colored_ratings_desc')
    }, function(v){
      saveSetting('colored_ratings', !!v);
      if (settings.colored_ratings) updateVoteColors();
      else {
        // скинемо inline-колір
        $(".card__vote, .full-start__rate, .full-start-new__rate, .info__rate, .card__imdb-rate, .card__kinopoisk-rate").css('color','');
      }
    });

    // Пункт: Тема
    L.SettingsApi.addParam({
      component: 'interface_mod_new',
      param: 'theme',
      name: L.Lang.translate('interface_mod_new_theme_select'),
      type: 'select',
      default: 'default',
      values: ['default','emerald-v1','emerald-v2','aurora'],
      labels: [
        L.Lang.translate('interface_mod_new_theme_default'),
        L.Lang.translate('interface_mod_new_theme_emerald_v1'),
        L.Lang.translate('interface_mod_new_theme_emerald_v2'),
        L.Lang.translate('interface_mod_new_theme_aurora')
      ],
      descr: L.Lang.translate('interface_mod_new_theme_select_desc')
    }, function(v){
      saveSetting('theme', v);
      applyTheme(settings.theme);
    });

    // Синхронізуємо UI з поточними значеннями
    try{ L.SettingsApi.updateParam('interface_mod_new','info_panel', settings.info_panel); }catch(e){}
    try{ L.SettingsApi.updateParam('interface_mod_new','colored_ratings', settings.colored_ratings); }catch(e){}
    try{ L.SettingsApi.updateParam('interface_mod_new','theme', settings.theme); }catch(e){}
  }

  // ───────────────────────────────────────────────────────────────────────
  // Init
  // ───────────────────────────────────────────────────────────────────────
  function startPlugin(){
    applyTheme(settings.theme);
    addSettings();
    newInfoPanel();
    if (settings.colored_ratings){
      updateVoteColors();
      setupVoteColorsObserver();
      setupVoteColorsForDetailPage();
    }
    // Fallback: якщо сторінка деталей уже відкрита — тригеримо оновлення невеличкою затримкою
    setTimeout(function(){ updateVoteColors(); }, 300);
    console.log('%cInterface+ loaded','color:#23d18b');
  }

  if (window.appready) startPlugin();
  else L.Listener.follow('app', function (event) { if (event.type === 'ready') startPlugin(); });

})();

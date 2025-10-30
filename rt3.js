(function(){
  'use strict';

  /* =============================
   * localStorage shim (якщо вимкнено/недоступний)
   * ============================= */
  (function(){
    var ok = true;
    try{
      var t='__lmp_test__';
      window.localStorage.setItem(t,'1');
      window.localStorage.removeItem(t);
    }catch(e){ ok = false; }

    if(!ok){
      var mem = {};
      window.localStorage = {
        getItem: function(k){ return Object.prototype.hasOwnProperty.call(mem,k) ? mem[k] : null; },
        setItem: function(k,v){ mem[k] = String(v); },
        removeItem: function(k){ delete mem[k]; },
        clear: function(){ mem = {}; }
      };
    }
  })();

  /* =============================
   * Promise (мінімальний поліфіл) — достатньо для then/catch/all
   * ============================= */
  (function(global){
    if(global.Promise) return; // вже є
    var PENDING=0, FULFILLED=1, REJECTED=2;
    function asap(fn){ setTimeout(fn,0); }
    function MiniPromise(executor){
      if(!(this instanceof MiniPromise)) return new MiniPromise(executor);
      var self=this; self._state=PENDING; self._value=void 0; self._handlers=[];
      function resolve(value){
        if(self._state!==PENDING) return;
        if(value && (typeof value==='object' || typeof value==='function')){
          var then;
          try{ then = value.then; }catch(e){ return reject(e); }
          if(typeof then==='function') return then.call(value,resolve,reject);
        }
        self._state=FULFILLED; self._value=value; finale();
      }
      function reject(reason){ if(self._state!==PENDING) return; self._state=REJECTED; self._value=reason; finale(); }
      function finale(){ asap(function(){ var q=self._handlers; self._handlers=[]; for(var i=0;i<q.length;i++) handle(q[i]); }); }
      function handle(h){
        if(self._state===PENDING){ self._handlers.push(h); return; }
        var cb = self._state===FULFILLED ? h.onFulfilled : h.onRejected;
        if(!cb){ (self._state===FULFILLED ? h.resolve : h.reject)(self._value); return; }
        try{ var ret = cb(self._value); h.resolve(ret); }catch(e){ h.reject(e); }
      }
      this.then = function(onFulfilled, onRejected){
        return new MiniPromise(function(resolve,reject){ handle({onFulfilled:onFulfilled, onRejected:onRejected, resolve:resolve, reject:reject}); });
      };
      this.catch = function(onRejected){ return this.then(null, onRejected); };
      try{ executor(resolve,reject); }catch(e){ reject(e); }
    }
    MiniPromise.resolve = function(v){ return new MiniPromise(function(res){ res(v); }); };
    MiniPromise.reject = function(r){ return new MiniPromise(function(_,rej){ rej(r); }); };
    MiniPromise.all = function(arr){
      return new MiniPromise(function(resolve,reject){
        if(!arr || !arr.length) return resolve([]);
        var out=new Array(arr.length), left=arr.length;
        for(var i=0;i<arr.length;i++) (function(i){ MiniPromise.resolve(arr[i]).then(function(v){ out[i]=v; if(--left===0) resolve(out); }, reject); })(i);
      });
    };
    global.Promise = MiniPromise;
    })(typeof globalThis!=='undefined' ? globalThis : (typeof window!=='undefined' ? window : this));


  /* =============================
   * fetch polyfill (з урахуванням Lampa.Reguest для обходу CORS)
   * ============================= */
  (function(global){
    if(global.fetch) return; // вже є

    function Response(body, init){
      this.status = init && init.status || 200;
      this.ok = this.status>=200 && this.status<300;
      this._body = body==null ? '' : String(body);
      this.headers = (init && init.headers) || {};
    }
    Response.prototype.text = function(){ var self=this; return Promise.resolve(self._body); };
    Response.prototype.json = function(){ var self=this; return Promise.resolve().then(function(){ return JSON.parse(self._body || 'null'); }); };

    global.fetch = function(input, init){
      init = init || {};
      var url = (typeof input==='string') ? input : (input && input.url) || '';
      var method = (init.method || 'GET').toUpperCase();
      var headers = init.headers || {};
      var body = init.body || null;

      // Якщо є Lampa.Reguest — використовуємо його (часто працює там, де CORS блокує fetch)
      if(global.Lampa && Lampa.Reguest){
        return new Promise(function(resolve){
          new Lampa.Reguest().native(
            url,
            function(data){
              var text = (typeof data==='string') ? data : (data!=null ? JSON.stringify(data) : '');
              resolve(new Response(text, {status:200, headers:headers}));
            },
            function(){ resolve(new Response('', {status:500, headers:headers})); },
            false,
            { dataType: 'text', method: method, headers: headers, data: body }
          );
        });
      }

      // Звичайний XMLHttpRequest-фолбек
      return new Promise(function(resolve, reject){
        try{
          var xhr = new XMLHttpRequest();
          xhr.open(method, url, true);
          for(var k in headers){ if(Object.prototype.hasOwnProperty.call(headers,k)) xhr.setRequestHeader(k, headers[k]); }
          xhr.onload = function(){ resolve(new Response(xhr.responseText, {status:xhr.status, headers:headers})); };
          xhr.onerror = function(){ reject(new TypeError('Network request failed')); };
          xhr.send(body);
        }catch(e){ reject(e); }
      });
    };
    })(typeof globalThis!=='undefined' ? globalThis : (typeof window!=='undefined' ? window : this));


    
(function() {
    'use strict';
    // --- ПОЛІФІЛИ ДЛЯ СТАРИХ ANDROID WEBVIEW ---

    // NodeList.forEach
    if (window.NodeList && !NodeList.prototype.forEach) {
        NodeList.prototype.forEach = function(callback, thisArg) {
            thisArg = thisArg || window;
            for (var i = 0; i < this.length; i++) {
                callback.call(thisArg, this[i], i, this);
            }
        };
    }

    // Element.matches
    if (!Element.prototype.matches) {
        Element.prototype.matches =
            Element.prototype.msMatchesSelector ||
            Element.prototype.webkitMatchesSelector ||
            function(selector) {
                var node = this;
                var nodes = (node.parentNode || document).querySelectorAll(selector);
                for (var i = 0; i < nodes.length; i++) {
                    if (nodes[i] === node) return true;
                }
                return false;
            };
    }

    // Element.closest
    if (!Element.prototype.closest) {
        Element.prototype.closest = function(selector) {
            var el = this;
            while (el && el.nodeType === 1) {
                if (el.matches(selector)) return el;
                el = el.parentElement || el.parentNode;
            }
            return null;
        };
    }
    
    /**
     * =========================
     * CONFIG
     * =========================
     */
    var LMP_ENH_CONFIG = {
        apiKeys: {
            mdblist: '',    // ✅ ключ до MDBList
            omdb:    ''     // ✅ ключ до OMDb
        },

        // true  -> іконки стають монохромні через filter: grayscale(100%)
        // false -> кольорові логотипи як є
        monochromeIcons: false   /*✅ Вкл./Викл. Ч/Б рейтинги */
    };

    /**
     * =========================
     * ICON SOURCES
     * =========================
     */
// Базовий шлях до іконок у репо
var BASE_ICON = 'https://raw.githubusercontent.com/ko3ik/LMP/main/wwwroot/';

var ICONS = {
  // середній рейтинг (TOTAL)
  total_star:     BASE_ICON + 'star.png',

  // логотипи сервісів
  imdb:           BASE_ICON + 'imdb.png',
  tmdb:           BASE_ICON + 'tmdb.png',
  metacritic:     BASE_ICON + 'metacritic.png',

  // Rotten Tomatoes
  rotten_good:    BASE_ICON + 'RottenTomatoes.png',
  rotten_bad:     BASE_ICON + 'RottenBad.png',

  // PopcornMeter / Audience
  popcorn:        BASE_ICON + 'PopcornGood.png',

  // Нагороди
  awards:         BASE_ICON + 'awards.png',
  oscar:          BASE_ICON + 'OscarGold.png',
  emmy:           BASE_ICON + 'EmmyGold.png'
};


    /**
     * =========================
     * Мови / переклади
     * =========================
     */
    Lampa.Lang.add({
        oscars_label: {
            uk: 'Оскар'
        },
        emmy_label: {
            uk: 'Еммі'
        },
        awards_other_label: {
            uk: 'Нагороди'
        },
        popcorn_label: {
            uk: 'Глядачі'
        },
        source_tmdb: { ru:'TMDB', en:'TMDB', uk:'TMDB' },
        source_imdb:{ ru:'IMDb', en:'IMDb', uk:'IMDb' },
        source_mc:  { ru:'Metacritic', en:'Metacritic', uk:'Metacritic' },
        source_rt:  { ru:'Rotten', en:'Rotten', uk:'Rotten' }
    });


    /**
     * =========================
     * CSS
     * =========================
     */
    var pluginStyles = "<style>" +
        ".loading-dots-container {" +
        "    display: flex;" +
        "    align-items: center;" +
        "    font-size: 0.85em;" +
        "    color: #ccc;" +
        "    padding: 0.6em 1em;" +
        "    border-radius: 0.5em;" +
        "}" +
        ".loading-dots__text {" +
        "    margin-right: 1em;" +
        "}" +
        ".loading-dots__dot {" +
        "    width: 0.5em;" +
        "    height: 0.5em;" +
        "    border-radius: 50%;" +
        "    background-color: currentColor;" +
        "    animation: loading-dots-bounce 1.4s infinite ease-in-out both;" +
        "}" +
        ".loading-dots__dot:nth-child(1) {" +
        "    animation-delay: -0.32s;" +
        "}" +
        ".loading-dots__dot:nth-child(2) {" +
        "    animation-delay: -0.16s;" +
        "}" +
        "@keyframes loading-dots-bounce {" +
        "    0%, 80%, 100% { transform: translateY(0); opacity: 0.6; }" +
        "    40% { transform: translateY(-0.5em); opacity: 1; }" +
        "}" +

":root{" +
"  --lmp-h-imdb:24px;" +
"  --lmp-h-mc:26px;" +
"  --lmp-h-rt:26px;" +
"  --lmp-h-popcorn:26px;" +
"  --lmp-h-tmdb:28px;" +
"  --lmp-h-awards:20px;" +  // іконка 'Awards' у rate--awards
"  --lmp-h-avg:20px;" +     // зірка 'TOTAL/AVG'
"  --lmp-h-oscar:22px;" +   // статуетка Оскара
"  --lmp-h-emmy:22px;" +    // статуетка Еммі
"}" +
 
        /* КОЛЬОРОВИЙ РЕЖИМ (за замовчуванням): */
        ".rate--oscars, .rate--emmy, .rate--awards, .rate--gold {" +
        "    color: gold;" +
        "}" +

        /* МОНОХРОМ РЕЖИМ: */
        "body.lmp-enh--mono .rate--oscars," +
        "body.lmp-enh--mono .rate--emmy," +
        "body.lmp-enh--mono .rate--awards," +
        "body.lmp-enh--mono .rate--gold," +

        "body.lmp-enh--mono .rating--green," +
        "body.lmp-enh--mono .rating--lime," +
        "body.lmp-enh--mono .rating--orange," +
        "body.lmp-enh--mono .rating--red," +

        "body.lmp-enh--mono .full-start__rate {" +
        "    color: inherit !important;" +
        "}" +

        /* ущільнюємо відстань між бейджами рейтингів */
        ".full-start-new__rate-line .full-start__rate {" +
        "    margin-right: 0.3em !important;" +
        "}" +
        ".full-start-new__rate-line .full-start__rate:last-child {" +
        "    margin-right: 0 !important;" +
        "}" +

"/* Однакове вирівнювання іконок нагород (Оскар / Еммі) */" +".lmp-award-icon{" +
"  display:inline-flex;" +
"  align-items:center;" +
"  justify-content:center;" +
"  line-height:1;" +
"  height:auto;" +                     /* не фіксуємо тут висоту */
"  width:auto;" +
"  flex-shrink:0;" +
"}" +
".lmp-award-icon img{" +
"  height:auto;" +                     /* керуємо нижче через img у модифікаторах */
"  width:auto;" +
"  display:block;" +
"  object-fit:contain;" +
"}" +
".lmp-award-icon--oscar img{height:var(--lmp-h-oscar);}" +
".lmp-award-icon--emmy  img{height:var(--lmp-h-emmy);}" +

"/* Базові розміри іконок через CSS-змінні */" +
".rate--imdb    .source--name img{height:var(--lmp-h-imdb);}" +
".rate--mc      .source--name img{height:var(--lmp-h-mc);}" +
".rate--rt      .source--name img{height:var(--lmp-h-rt);}" +
".rate--popcorn .source--name img{height:var(--lmp-h-popcorn);}" +
".rate--tmdb    .source--name img{height:var(--lmp-h-tmdb);}" +
".rate--awards  .source--name img{height:var(--lmp-h-awards);}" +
".rate--avg     .source--name img{height:var(--lmp-h-avg);}" +

".settings-param__descr,.settings-param__subtitle{white-space:pre-line;}" +

".full-start__rate .source--name{" +
"  display:inline-flex;" +
"  align-items:center;" +          /* по вертикалі центр */
"  justify-content:center;" +      /* по горизонталі центр */
"}" +

"/* ========================= */" +
"/*       MOBILE RULES        */" +
"/* ========================= */" +

"@media (max-width: 600px){" +
"  .full-start-new__rate-line{flex-wrap:wrap;}" +
"  .full-start__rate{" +
"    margin-right:.25em !important;" +
"    margin-bottom:.25em;" +
"    font-size:18px;" +
"    min-width:unset;" +
"  }" +
"  :root{" +
"    --lmp-h-imdb:14px; --lmp-h-mc:16px; --lmp-h-rt:16px;" +
"    --lmp-h-popcorn:16px; --lmp-h-tmdb:18px; --lmp-h-awards:10px;" +
"    --lmp-h-avg:10px; --lmp-h-oscar:12px; --lmp-h-emmy:12px;" +
"  }" +
"  .loading-dots-container{font-size:.8em; padding:.4em .8em;}" +
"  .lmp-award-icon{height:16px;}" +
"}" +

"@media (max-width: 360px){" +
"  .full-start__rate{font-size:18px;}" +
"  :root{" +
"    --lmp-h-imdb:12px; --lmp-h-mc:14px; --lmp-h-rt:14px;" +
"    --lmp-h-popcorn:14px; --lmp-h-tmdb:16px; --lmp-h-awards:8px;" +
"    --lmp-h-avg:8px; --lmp-h-oscar:10px; --lmp-h-emmy:10px;" +
"  }" +
"  .lmp-award-icon{height:12px;}" +
"}" +
"</style>";

    Lampa.Template.add('lmp_enh_styles', pluginStyles);
    $('body').append(Lampa.Template.get('lmp_enh_styles', {}, true));


    /**
     * =========================
     * Кеш, допоміжне
     * =========================
     */
    /*var CACHE_TIME = 3 * 24 * 60 * 60 * 1000; // 3 дні*/
    var CACHE_TIME = 60 * 60 * 1000; // 1 година
    var RATING_CACHE_KEY = 'lmp_enh_rating_cache';
    var ID_MAPPING_CACHE = 'lmp_rating_id_cache';

    // для вікового рейтингу
    var AGE_RATINGS = {
        'G': '3+',
        'PG': '6+',
        'PG-13': '13+',
        'R': '17+',
        'NC-17': '18+',
        'TV-Y': '0+',
        'TV-Y7': '7+',
        'TV-G': '3+',
        'TV-PG': '6+',
        'TV-14': '14+',
        'TV-MA': '17+'
    };

    var currentRatingsData = null;


    function getCardType(card) {
        var type = card.media_type || card.type;
        if (type === 'movie' || type === 'tv') return type;
        return card.name || card.original_name ? 'tv' : 'movie';
    }

    function getRatingClass(rating) {
        if (rating >= 8.0) return 'rating--green';
        if (rating >= 6.0) return 'rating--lime';
        if (rating >= 5.5) return 'rating--orange';
        return 'rating--red';
    }


    /**
     * =========================
     * Генератори іконок
     * =========================
     */

// універсальна картинка-сервіс
function iconImg(url, alt, sizePx, extraStyle) {
        return '<img style="' +
            /* 'height:' + sizePx + 'px; ' + */ // Висота тепер у CSS
            'width:auto; display:inline-block; vertical-align:middle; ' +
            'object-fit:contain; ' +
            (extraStyle || '') + ' ' +
            '" ' +
            'src="' + url + '" alt="' + (alt || '') + '">';
    }

    // Emmy, Oscar статуетки

function emmyIconInline(){
  return '<span class="lmp-award-icon lmp-award-icon--emmy"><img src="' + ICONS.emmy  + '" alt="Emmy"></span>';
}
function oscarIconInline(){
  return '<span class="lmp-award-icon lmp-award-icon--oscar"><img src="' + ICONS.oscar + '" alt="Oscar"></span>';
}

function dimRateLine(rateLine){
  if (!rateLine || !rateLine.length) return;
  rateLine.children('.full-start__rate').css({
    opacity: .3,
    pointerEvents: 'none'
  });
}

function undimRateLine(rateLine){
  if (!rateLine || !rateLine.length) return;
  rateLine.children('.full-start__rate').css({
    opacity: '',
    pointerEvents: ''
  });
}


    /**
     * =========================
     * Loader helpers
     * =========================
     */
    function addLoadingAnimation() {
        var render = Lampa.Activity.active().activity.render();
        if (!render) return;

        var rateLine = $('.full-start-new__rate-line', render);
        if (!rateLine.length || $('.loading-dots-container', rateLine).length) return;

        var loaderHtml =
            '<div class="loading-dots-container">' +
                '<div class="loading-dots__text">Пошук…</div>'+
                '<div class="loading-dots__dot"></div>' +
                '<div class="loading-dots__dot"></div>' +
                '<div class="loading-dots__dot"></div>' +
            '</div>';

        rateLine.append(loaderHtml);
    }

    function removeLoadingAnimation() {
        var render = Lampa.Activity.active().activity.render();
        if (!render) return;

        $('.loading-dots-container', render).remove();
    }

    function getCachedRatings(key) {
        var cache = Lampa.Storage.get(RATING_CACHE_KEY) || {};
        var item = cache[key];
        if (!item) return null;
        if (Date.now() - item.timestamp > CACHE_TIME) return null;
        return item.data || null;
    }

    function saveCachedRatings(key, data) {
        if (!data) return;
        var cache = Lampa.Storage.get(RATING_CACHE_KEY) || {};
        cache[key] = {
            timestamp: Date.now(),
            data: data
        };
        Lampa.Storage.set(RATING_CACHE_KEY, cache);
    }


    /**
     * TMDB → imdb_id
     */

function getImdbIdFromTmdb(tmdbId, type, callback) {
    if (!tmdbId) return callback(null);

    var preferredType = (type === 'movie') ? 'movie' : 'tv';
    var altType       = preferredType === 'movie' ? 'tv' : 'movie';

    var cache = Lampa.Storage.get(ID_MAPPING_CACHE) || {};
    var now = Date.now();

    function fromCache(key){
        var item = cache[key];
        if (!item) return null;
        if (!item.imdb_id) return null;
        if (now - item.timestamp > CACHE_TIME) return null;
        return item.imdb_id;
    }

    var keyPreferred = preferredType + '_' + tmdbId;
    var keyAlt       = altType       + '_' + tmdbId;

    // 1) Шукаємо в кеші обидва варіанти
    var cachedId = fromCache(keyPreferred) || fromCache(keyAlt);
    if (cachedId) return callback(cachedId);

    var tmdbKey = Lampa.TMDB.key();
    // 2) Стара послідовна схема, але для обох типів
    var queue = [
        'https://api.themoviedb.org/3/' + preferredType + '/' + tmdbId + '/external_ids?api_key=' + tmdbKey,
        'https://api.themoviedb.org/3/' + preferredType + '/' + tmdbId + '?api_key=' + tmdbKey + '&append_to_response=external_ids',
        'https://api.themoviedb.org/3/' + altType       + '/' + tmdbId + '/external_ids?api_key=' + tmdbKey,
        'https://api.themoviedb.org/3/' + altType       + '/' + tmdbId + '?api_key=' + tmdbKey + '&append_to_response=external_ids'
    ];

    var makeRequest = function(u, success, error) {
        new Lampa.Reguest().silent(u, success, function() {
            new Lampa.Reguest().native(
                u,
                function(data) {
                    try { success(typeof data === 'string' ? JSON.parse(data) : data); }
                    catch(e){ error(); }
                },
                error,
                false,
                { dataType: 'json' }
            );
        });
    };

    function extractImdbId(obj){
        if (!obj || typeof obj !== 'object') return null;
        if (obj.imdb_id && typeof obj.imdb_id === 'string') return obj.imdb_id;
        if (obj.external_ids && typeof obj.external_ids.imdb_id === 'string') return obj.external_ids.imdb_id;
        return null;
    }

    function saveAndReturn(id){
        // кешуємо під ОБОМА ключами, щоб наступні виклики не залежали від type
        var payload = { imdb_id: id, timestamp: Date.now() };
        cache[keyPreferred] = payload;
        cache[keyAlt]       = payload;
        Lampa.Storage.set(ID_MAPPING_CACHE, cache);
        callback(id);
    }

    (function next(){
        var url = queue.shift();
        if (!url) return callback(null);

        makeRequest(url, function(data){
            var imdbId = extractImdbId(data);
            if (imdbId) saveAndReturn(imdbId);
            else next();
        }, function(){
            next();
        });
    })();
}

    /**
     * Парсимо текст нагород OMDB
     */
    function parseAwards(awardsText) {
        if (typeof awardsText !== 'string') return {oscars:0, emmy:0, awards:0};

        var result = { oscars: 0, emmy: 0, awards: 0 };

        var oscarMatch = awardsText.match(/Won (\d+) Oscars?/i);
        if (oscarMatch && oscarMatch[1]) {
            result.oscars = parseInt(oscarMatch[1], 10);
        }

        var emmyMatch = awardsText.match(/Won (\d+) Primetime Emmys?/i);
        if (emmyMatch && emmyMatch[1]) {
            result.emmy = parseInt(emmyMatch[1], 10);
        }

        var otherMatch = awardsText.match(/Another (\d+) wins?/i);
        if (otherMatch && otherMatch[1]) {
            result.awards = parseInt(otherMatch[1], 10);
        }

        if (result.awards === 0) {
            var simpleMatch = awardsText.match(/(\d+) wins?/i);
            if (simpleMatch && simpleMatch[1]) {
                result.awards = parseInt(simpleMatch[1], 10);
            }
        }

        return result;
    }


    /**
     * MDBList
     */
    function fetchMdbListRatings(card, callback) {
        var key = LMP_ENH_CONFIG.apiKeys.mdblist;
        if (!key) {
            callback(null);
            return;
        }

        var typeSegment = (card.type === 'tv') ? 'show' : card.type;
        var url = 'https://api.mdblist.com/tmdb/' + typeSegment + '/' + card.id +
                  '?apikey=' + encodeURIComponent(key);

        // основний запит через Lampa.Reguest (воно вміє ходити без CORS-проблем)
        new Lampa.Reguest().silent(url, handleSuccess, handleFail);

        // якщо silent не зміг, пробуємо native
        function handleFail() {
            new Lampa.Reguest().native(
                url,
                function(data){
                    try {
                        handleSuccess(typeof data === 'string' ? JSON.parse(data) : data);
                    } catch(e){
                        callback(null);
                    }
                },
                function(){
                    callback(null);
                },
                false,
                { dataType: 'json' }
            );
        }

        function handleSuccess(response){
            if (!response || !response.ratings || !response.ratings.length) {
                callback(null);
                return;
            }

            var res = {
                tmdb_display: null,
                tmdb_for_avg: null,

                imdb_display: null,
                imdb_for_avg: null,

                mc_user_display: null,
                mc_user_for_avg: null,

                mc_critic_display: null,
                mc_critic_for_avg: null,

                rt_display: null,
                rt_for_avg: null,
                rt_fresh: null,

                popcorn_display: null,
                popcorn_for_avg: null
            };

            function parseRawScore(rawVal) {
                if (rawVal === null || rawVal === undefined) return null;
                if (typeof rawVal === 'number') return rawVal;

                if (typeof rawVal === 'string') {
                    if (rawVal.indexOf('%') !== -1) {
                        return parseFloat(rawVal.replace('%',''));
                    }
                    if (rawVal.indexOf('/') !== -1) {
                        return parseFloat(rawVal.split('/')[0]);
                    }
                    return parseFloat(rawVal);
                }
                return null;
            }

            function isUserSource(src) {
                return (
                    src.indexOf('user') !== -1 ||
                    src.indexOf('users') !== -1 ||
                    src.indexOf('metacriticuser') !== -1 ||
                    src.indexOf('metacritic_user') !== -1
                );
            }

            response.ratings.forEach(function(r) {
                var src = (r.source || '').toLowerCase();
                var val = parseRawScore(r.value);
                if (val === null || isNaN(val)) return;

                // TMDB
                if (src.indexOf('tmdb') !== -1) {
                    var tmdb10 = val > 10 ? (val / 10) : val;
                    res.tmdb_display = tmdb10.toFixed(1);
                    res.tmdb_for_avg = tmdb10;
                }

                // IMDb
                if (src.indexOf('imdb') !== -1) {
                    var imdb10 = val > 10 ? (val / 10) : val;
                    res.imdb_display = imdb10.toFixed(1);
                    res.imdb_for_avg = imdb10;
                }

                // Metacritic (users)
                if (src.indexOf('metacritic') !== -1 && isUserSource(src)) {
                    var user10 = val > 10 ? (val / 10) : val;
                    res.mc_user_display = user10.toFixed(1);
                    res.mc_user_for_avg = user10;
                }

                // Metacritic (critics)
                if (src.indexOf('metacritic') !== -1 && !isUserSource(src)) {
                    var critic10 = val > 10 ? (val / 10) : val;
                    res.mc_critic_display = critic10.toFixed(1);
                    res.mc_critic_for_avg = critic10;
                }

                // Rotten Tomatoes
                if (src.indexOf('rotten') !== -1 || src.indexOf('tomato') !== -1) {
                    res.rt_display = String(Math.round(val));
                    res.rt_for_avg = val / 10;
                    res.rt_fresh = val >= 60;
                }

                // PopcornMeter / Audience
                if (src.indexOf('popcorn') !== -1 || src.indexOf('audience') !== -1) {
                    res.popcorn_display = String(Math.round(val));
                    res.popcorn_for_avg = val / 10;
                }
            });

            callback(res);
        }
    }



    /**
     * OMDB
     */
    function fetchOmdbRatings(card, callback) {
        var key = LMP_ENH_CONFIG.apiKeys.omdb;
        if (!key || !card.imdb_id) {
            callback(null);
            return;
        }

        var typeParam = (card.type === 'tv') ? '&type=series' : '';
        var url = 'https://www.omdbapi.com/?apikey=' + encodeURIComponent(key) +
                  '&i=' + encodeURIComponent(card.imdb_id) + typeParam;

        new Lampa.Reguest().silent(url, function(data) {
            if (!data || data.Response !== 'True') {
                callback(null);
                return;
            }

            var awardsParsed = parseAwards(data.Awards || '');
            var rtScore = null;
            var mcScore = null;

            if (Array.isArray(data.Ratings)) {
                data.Ratings.forEach(function(r) {
                    if (r.Source === 'Rotten Tomatoes') {
                        var v = parseInt((r.Value || '').replace('%',''));
                        if (!isNaN(v)) rtScore = v;
                    }
                    if (r.Source === 'Metacritic') {
                        var m = parseInt((r.Value || '').split('/')[0]);
                        if (!isNaN(m)) mcScore = m;
                    }
                });
            }

            var mc10 = (mcScore !== null && !isNaN(mcScore))
                ? (mcScore > 10 ? mcScore/10 : mcScore)
                : null;

            var res = {
                tmdb_display: null,
                tmdb_for_avg: null,

                imdb_display: data.imdbRating && data.imdbRating !== 'N/A' ? parseFloat(data.imdbRating).toFixed(1) : null,
                imdb_for_avg: data.imdbRating && data.imdbRating !== 'N/A' ? parseFloat(data.imdbRating) : null,

                mc_user_display: null,
                mc_user_for_avg: null,

                mc_critic_display: (mc10 !== null ? mc10.toFixed(1) : null),
                mc_critic_for_avg: (mc10 !== null ? mc10 : null),

                rt_display: (rtScore !== null && !isNaN(rtScore)) ? String(rtScore) : null,
                rt_for_avg: (rtScore !== null && !isNaN(rtScore)) ? (rtScore / 10) : null,
                rt_fresh:  (rtScore !== null && !isNaN(rtScore)) ? (rtScore >= 60) : null,

                popcorn_display: null,
                popcorn_for_avg: null,

                ageRating: data.Rated || null,

                oscars: awardsParsed.oscars || 0,
                emmy: awardsParsed.emmy || 0,
                awards: awardsParsed.awards || 0
            };

            callback(res);
        }, function() {
            callback(null);
        });
    }


    /**
     * Змерджити MDBList + OMDB
     */
    function mergeRatings(mdb, omdb) {
        mdb = mdb || {};
        omdb = omdb || {};

        var mc_display = null;
        var mc_for_avg = null;

        if (mdb.mc_user_display) {
            mc_display = mdb.mc_user_display;
            mc_for_avg = mdb.mc_user_for_avg;
        } else if (mdb.mc_critic_display) {
            mc_display = mdb.mc_critic_display;
            mc_for_avg = mdb.mc_critic_for_avg;
        } else if (omdb.mc_critic_display) {
            mc_display = omdb.mc_critic_display;
            mc_for_avg = omdb.mc_critic_for_avg;
        }

        var merged = {
            tmdb_display: mdb.tmdb_display || null,
            tmdb_for_avg: mdb.tmdb_for_avg || null,

            imdb_display: mdb.imdb_display || omdb.imdb_display || null,
            imdb_for_avg: mdb.imdb_for_avg || omdb.imdb_for_avg || null,

            mc_display: mc_display || null,
            mc_for_avg: (typeof mc_for_avg === 'number' ? mc_for_avg : null),

            rt_display: mdb.rt_display || omdb.rt_display || null,
            rt_for_avg: mdb.rt_for_avg || omdb.rt_for_avg || null,
            rt_fresh: (mdb.rt_display || omdb.rt_display)
                ? (mdb.rt_display ? mdb.rt_fresh : omdb.rt_fresh)
                : null,

            popcorn_display: mdb.popcorn_display || null,
            popcorn_for_avg: mdb.popcorn_for_avg || null,

            ageRating: omdb.ageRating || null,
            oscars: omdb.oscars || 0,
            emmy: omdb.emmy || 0,
            awards: omdb.awards || 0
        };

        return merged;
    }


    /**
     * Оновлюємо приховані елементи
     */
function updateHiddenElements(data) {
    var render = Lampa.Activity.active().activity.render();
    if (!render || !render[0]) return;

    // віковий рейтинг
    var pgElement = $('.full-start__pg.hide', render);
    if (pgElement.length && data.ageRating) {
        var invalidRatings = ['N/A', 'Not Rated', 'Unrated'];
        var isValid = invalidRatings.indexOf(data.ageRating) === -1;

        if (isValid) {
            var localized = AGE_RATINGS[data.ageRating] || data.ageRating;
            pgElement.removeClass('hide').text(localized);
        }
    }

    // IMDb блок
    var imdbContainer = $('.rate--imdb', render);
    if (imdbContainer.length) {
        if (data.imdb_display) {
            imdbContainer.removeClass('hide');

            var imdbDivs = imdbContainer.find('> div');
            if (imdbDivs.length >= 2) {
                // значення рейтингу
                imdbDivs.eq(0).text(parseFloat(data.imdb_display).toFixed(1));

                // логотип
                imdbDivs.eq(1)
                    .addClass('source--name') // <-- важливо!
                    .html(iconImg(ICONS.imdb, 'IMDb', 22));
            }
        } else {
            imdbContainer.addClass('hide');
        }
    }

    // TMDB блок
    var tmdbContainer = $('.rate--tmdb', render);
    if (tmdbContainer.length) {
        if (data.tmdb_display) {
            var tmdbDivs = tmdbContainer.find('> div');
            if (tmdbDivs.length >= 2) {
                // значення рейтингу
                tmdbDivs.eq(0).text(parseFloat(data.tmdb_display).toFixed(1));

                // логотип
                tmdbDivs.eq(1)
                    .addClass('source--name') // <-- теж важливо
                    .html(iconImg(ICONS.tmdb, 'TMDB', 24));
            }
        }
    }
}



    /**
     * Додаємо нові бейджі
     */
    function insertRatings(data) {
        var render = Lampa.Activity.active().activity.render();
        if (!render) return;

        var rateLine = $('.full-start-new__rate-line', render);
        if (!rateLine.length) return;

         if (data.mc_display && !$('.rate--mc', rateLine).length) {
            var mcVal = null;

            if (data.mc_for_avg && !isNaN(data.mc_for_avg)) {
                mcVal = parseFloat(data.mc_for_avg);
            } else if (!isNaN(parseFloat(data.mc_display))) {
                mcVal = parseFloat(data.mc_display);
            }

            var mcText = (mcVal !== null && !isNaN(mcVal))
                ? mcVal.toFixed(1)
                : data.mc_display;

            var mcElement = $(
                '<div class="full-start__rate rate--mc">' +
                    '<div>' + mcText + '</div>' +
                    '<div class="source--name"></div>' +
                '</div>'
            );

            mcElement.find('.source--name').html(
                iconImg(ICONS.metacritic, 'Metacritic', 22)
            );

            var afterImdb = $('.rate--imdb', rateLine);
            if (afterImdb.length) {
                mcElement.insertAfter(afterImdb);
            } else {
                rateLine.append(mcElement);
            }
        }

        if (data.rt_display && !$('.rate--rt', rateLine).length) {
            var rtIconUrl = data.rt_fresh ? ICONS.rotten_good : ICONS.rotten_bad;
            var extra = data.rt_fresh ? 'border-radius:4px;' : '';

            var rtElement = $(
                '<div class="full-start__rate rate--rt">' +
                    '<div>' + data.rt_display + '</div>' +
                    '<div class="source--name"></div>' +
                '</div>'
            );

            rtElement.find('.source--name').html(
                iconImg(rtIconUrl, 'Rotten Tomatoes', 22, extra)
            );

            var afterMc = $('.rate--mc', rateLine);
            if (afterMc.length) {
                rtElement.insertAfter(afterMc);
            } else {
                var afterImdb2 = $('.rate--imdb', rateLine);
                if (afterImdb2.length) rtElement.insertAfter(afterImdb2);
                else rateLine.append(rtElement);
            }
        }

        if (data.popcorn_display && !$('.rate--popcorn', rateLine).length) {
            var pcElement = $(
                '<div class="full-start__rate rate--popcorn">' +
                    '<div>' + data.popcorn_display + '</div>' +
                    '<div class="source--name"></div>' +
                '</div>'
            );

            pcElement.find('.source--name').html(
                iconImg(ICONS.popcorn, 'Audience', 22)
            );

            var afterRt = $('.rate--rt', rateLine);
            if (afterRt.length) {
                pcElement.insertAfter(afterRt);
            } else {
                var afterMc2 = $('.rate--mc', rateLine);
                if (afterMc2.length) pcElement.insertAfter(afterMc2);
                else rateLine.append(pcElement);
            }
        }

        if (data.awards && data.awards > 0 && !$('.rate--awards', rateLine).length) {
            var awardsElement = $(
                '<div class="full-start__rate rate--awards rate--gold">' +
                    '<div>' + data.awards + '</div>' +
                    '<div class="source--name"></div>' +
                '</div>'
            );
            awardsElement.find('.source--name')
                .html(iconImg(ICONS.awards, 'Awards', 20))
                .attr('title', Lampa.Lang.translate('awards_other_label'));

            rateLine.prepend(awardsElement);
        }

        if (data.emmy && data.emmy > 0 && !$('.rate--emmy', rateLine).length) {
            var emmyElement = $(
                '<div class="full-start__rate rate--emmy rate--gold">' +
                    '<div>' + data.emmy + '</div>' +
                    '<div class="source--name"></div>' +
                '</div>'
            );

            emmyElement.find('.source--name')
                .html(emmyIconInline())
                .attr('title', Lampa.Lang.translate('emmy_label'));

            rateLine.prepend(emmyElement);
        }

        if (data.oscars && data.oscars > 0 && !$('.rate--oscars', rateLine).length) {
            var oscarsElement = $(
                '<div class="full-start__rate rate--oscars rate--gold">' +
                    '<div>' + data.oscars + '</div>' +
                    '<div class="source--name"></div>' +
                '</div>'
            );

            oscarsElement.find('.source--name')
                .html(oscarIconInline())
                .attr('title', Lampa.Lang.translate('oscars_label'));

            rateLine.prepend(oscarsElement);
        }
    }


    /**
     * TOTAL / середній рейтинг
     */
    function calculateAverageRating(data) {
        var render = Lampa.Activity.active().activity.render();
        if (!render) return;

        var rateLine = $('.full-start-new__rate-line', render);
        if (!rateLine.length) return;

        var parts = [];

        if (data.tmdb_for_avg && !isNaN(data.tmdb_for_avg)) parts.push(data.tmdb_for_avg);
        if (data.imdb_for_avg && !isNaN(data.imdb_for_avg)) parts.push(data.imdb_for_avg);
        if (data.mc_for_avg && !isNaN(data.mc_for_avg))     parts.push(data.mc_for_avg);
        if (data.rt_for_avg && !isNaN(data.rt_for_avg))     parts.push(data.rt_for_avg);
        if (data.popcorn_for_avg && !isNaN(data.popcorn_for_avg)) parts.push(data.popcorn_for_avg);

        $('.rate--avg', rateLine).remove();

if (!parts.length) {
    removeLoadingAnimation();
    undimRateLine(rateLine);
    return;
}


        var sum = 0;
        for (var i = 0; i < parts.length; i++) sum += parts[i];
        var avg = sum / parts.length;

        var colorClass = getRatingClass(avg);

        var avgElement = $(
            '<div class="full-start__rate rate--avg ' + colorClass + '">' +
                '<div>' + avg.toFixed(1) + '</div>' +
                '<div class="source--name"></div>' +
            '</div>'
        );

        var starHtml = iconImg(ICONS.total_star, 'AVG', 20);
        avgElement.find('.source--name').html(starHtml);

        var firstRate = $('.full-start__rate:first', rateLine);
        if (firstRate.length) firstRate.before(avgElement);
        else rateLine.prepend(avgElement);

removeLoadingAnimation();
undimRateLine(rateLine);

    }


    /**
     * Основна логіка (з доповненнями)
     */
    function fetchAdditionalRatings(card) {
        var render = Lampa.Activity.active().activity.render();
        if (!render) return;

        //Синхронізуємо конфіг з налаштувань Lampa
        refreshConfigFromStorage();

var normalizedCard = {
    id: card.id,
    imdb_id: card.imdb_id || card.imdb || null,
    title: card.title || card.name || '',
    original_title: card.original_title || card.original_name || '',
    type: getCardType(card),
    release_date: card.release_date || card.first_air_date || '',

    // ⬇️ додаємо запасний рейтинг з TMDB (vote_average)
    vote: card.vote_average || card.vote || null
};


        var rateLine = $('.full-start-new__rate-line', render);
        if (rateLine.length) {
            dimRateLine(rateLine);
            addLoadingAnimation();
        }


function proceedWithImdbId() {
    // 1) будуємо ключ кешу акуратно
    var cacheKeyBase = normalizedCard.imdb_id || normalizedCard.id;
    var cacheKey = cacheKeyBase ? (normalizedCard.type + '_' + cacheKeyBase) : null;

    // 2) якщо в кеші вже є НЕпорожні дані — просто малюємо і виходимо
    var cached = cacheKey ? getCachedRatings(cacheKey) : null;
    if (cached) {
        currentRatingsData = cached;
        renderAll();
        return;
    }

    // 3) тягнемо MDBList і OMDb паралельно
    var pending = 2;
    var mdbRes = null;
    var omdbRes = null;

    function oneDone() {
        pending--;
        if (pending === 0) {
            // 4) змерджили обидві відповіді
            currentRatingsData = mergeRatings(mdbRes, omdbRes);

            // 5) fallback на vote_average з TMDB,
            // якщо MDBList не дав tmdb_display
            if (
                (!currentRatingsData.tmdb_display || !currentRatingsData.tmdb_for_avg) &&
                normalizedCard.vote != null
            ) {
                var tm = parseFloat(normalizedCard.vote);
                if (!isNaN(tm)) {
                    // іноді значення може бути не в діапазоні 0-10 (проти надійності)
                    if (tm > 10) tm = tm / 10;
                    if (tm < 0) tm = 0;
                    if (tm > 10) tm = 10;

                    currentRatingsData.tmdb_for_avg = tm;
                    currentRatingsData.tmdb_display = tm.toFixed(1);
                }
            }

            // 6) кешуємо ТІЛЬКИ якщо є якісь реальні дані,
            // щоб не закешувати "порожнечу назавжди"
            if (
                cacheKey &&
                currentRatingsData && (
                    currentRatingsData.tmdb_display ||
                    currentRatingsData.imdb_display ||
                    currentRatingsData.mc_display ||
                    currentRatingsData.rt_display ||
                    currentRatingsData.popcorn_display ||
                    currentRatingsData.oscars ||
                    currentRatingsData.emmy ||
                    currentRatingsData.awards
                )
            ) {
                saveCachedRatings(cacheKey, currentRatingsData);
            }

            // 7) малюємо все
            renderAll();
        }
    }

    fetchMdbListRatings(normalizedCard, function(r1) {
        mdbRes = r1 || {};
        oneDone();
    });

    fetchOmdbRatings(normalizedCard, function(r2) {
        omdbRes = r2 || {};
        oneDone();
    });
}

        function renderAll() {
        if (!currentRatingsData) {
            removeLoadingAnimation();
            if (rateLine.length) undimRateLine(rateLine);
            return;
        }


            updateHiddenElements(currentRatingsData);
            insertRatings(currentRatingsData);
            calculateAverageRating(currentRatingsData);
            
            // Викликаємо applyStylesToAll, щоб застосувати налаштування з меню
            applyStylesToAll();
        }

        if (!normalizedCard.imdb_id) {
            getImdbIdFromTmdb(normalizedCard.id, normalizedCard.type, function(imdb_id) {
                normalizedCard.imdb_id = imdb_id;
                proceedWithImdbId();
            });
        } else {
            proceedWithImdbId();
        }
    }

    /**
     * Ініціалізація
     */
    function startPlugin() {
        window.combined_ratings_plugin = true;
        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'complite') {
                setTimeout(function() {
                    fetchAdditionalRatings(e.data.movie || e.object || {});
                }, 500);
            }
        });
    }


    /**
     * =========================
     * SETTINGS / UI / СТИЛІ
     * =========================
     */

    // дефолтні значення
    var RCFG_DEFAULT = {
        ratings_omdb_key:      (LMP_ENH_CONFIG.apiKeys.omdb || ''),
        ratings_mdblist_key:   (LMP_ENH_CONFIG.apiKeys.mdblist || ''),

        ratings_bw_logos:      false,
        ratings_show_awards:   true,
        ratings_show_average:  true,

        ratings_logo_offset:   0,
        ratings_font_offset:   0,

        ratings_badge_alpha:   0.15,
        ratings_badge_tone:    0,

        ratings_gap_step:      0
    };

    /**
     * Повертає актуальні значення з Lampa.Storage
     */
    function getCfg() {
        var omdbKey = Lampa.Storage.get('ratings_omdb_key', RCFG_DEFAULT.ratings_omdb_key);
        var mdblistKey = Lampa.Storage.get('ratings_mdblist_key', RCFG_DEFAULT.ratings_mdblist_key);

        var bwLogos = !!Lampa.Storage.field('ratings_bw_logos', RCFG_DEFAULT.ratings_bw_logos);
        var showAwards = !!Lampa.Storage.field('ratings_show_awards', RCFG_DEFAULT.ratings_show_awards);
        var showAverage = !!Lampa.Storage.field('ratings_show_average', RCFG_DEFAULT.ratings_show_average);

        var logoOffRaw = Lampa.Storage.get('ratings_logo_offset', RCFG_DEFAULT.ratings_logo_offset);
        var logoOffset = parseInt(logoOffRaw,10);
        if (isNaN(logoOffset)) logoOffset = 0;

        var fontOffRaw = Lampa.Storage.get('ratings_font_offset', RCFG_DEFAULT.ratings_font_offset);
        var fontOffset = parseInt(fontOffRaw,10);
        if (isNaN(fontOffset)) fontOffset = 0;

        var alphaRaw = Lampa.Storage.get('ratings_badge_alpha', RCFG_DEFAULT.ratings_badge_alpha);
        var badgeAlpha = parseFloat(alphaRaw);
        if (isNaN(badgeAlpha)) badgeAlpha = RCFG_DEFAULT.ratings_badge_alpha;
        if (badgeAlpha < 0) badgeAlpha = 0;
        if (badgeAlpha > 1) badgeAlpha = 1;

        var toneRaw = Lampa.Storage.get('ratings_badge_tone', RCFG_DEFAULT.ratings_badge_tone);
        var badgeTone = parseInt(toneRaw,10);
        if (isNaN(badgeTone)) badgeTone = RCFG_DEFAULT.ratings_badge_tone;
        if (badgeTone < 0) badgeTone = 0;
        if (badgeTone > 255) badgeTone = 255;

        var gapRaw = Lampa.Storage.get('ratings_gap_step', RCFG_DEFAULT.ratings_gap_step);
        var gapStep = parseInt(gapRaw,10);
        if (isNaN(gapStep) || gapStep < 0) gapStep = 0;

        return {
            omdbKey: omdbKey || '',
            mdblistKey: mdblistKey || '',
            bwLogos: bwLogos,
            showAwards: showAwards,
            showAverage: showAverage,
            logoOffset: logoOffset,
            fontOffset: fontOffset,
            badgeAlpha: badgeAlpha,
            badgeTone: badgeTone,
            gapStep: gapStep
        };
    }

    /**
     * Синхронізує apiKeys + monochromeIcons у LMP_ENH_CONFIG
     */
    function refreshConfigFromStorage(){
        var cfg = getCfg();

        LMP_ENH_CONFIG.apiKeys.omdb    = cfg.omdbKey || '';
        LMP_ENH_CONFIG.apiKeys.mdblist = cfg.mdblistKey || '';
        LMP_ENH_CONFIG.monochromeIcons = cfg.bwLogos; // Це поле більше не використовується для рендеру, але лишаємо для сумісності

        // Додатково оновлюємо клас на body
        if (cfg.bwLogos) {
            $('body').addClass('lmp-enh--mono');
        } else {
            $('body').removeClass('lmp-enh--mono');
        }

        return cfg;
    }

    /**
     * Ховає/показує блоки з нагородами
     */
    function toggleAwards(showAwards){
        var nodes = document.querySelectorAll('.rate--oscars, .rate--emmy, .rate--awards');
        nodes.forEach(function(n){
            n.style.display = showAwards ? '' : 'none';
        });
    }

    /**
     * Ховає/показує блок середнього рейтингу
     */
    function toggleAverage(showAverage){
        var nodes = document.querySelectorAll('.rate--avg');
        nodes.forEach(function(n){
            n.style.display = showAverage ? '' : 'none';
        });
    }

    /**
     * Масштабує текстову частину рейтингу
     */
function tuneRatingFont(offsetPx){
  var off = parseFloat(offsetPx)||0;
  var tiles = document.querySelectorAll('.full-start__rate');

  tiles.forEach(function(tile){
    // Тимчасово прибираємо інлайнове значення, щоб прочитати «чисту» CSS-базу
    var prev = tile.style.fontSize;
    tile.style.fontSize = '';
    var basePx = parseFloat(getComputedStyle(tile).fontSize);
    if (isNaN(basePx)) basePx = 23;

    var finalPx = Math.max(1, basePx + off);
    tile.style.fontSize = finalPx + 'px';
  });
}


    /**
     * Масштабує логотипи
     */
// Масштабування логотипів (у т.ч. IMDb + нагороди)

function tuneLogos(offsetPx){
  var REF_BASE = 28;
  var scale = (REF_BASE + (parseFloat(offsetPx)||0)) / REF_BASE;
  if (scale < 0.1) scale = 0.1;

  var logos = document.querySelectorAll(
    '.full-start__rate .source--name img,' +
    '.rate--imdb > div:nth-child(2) img,' +
    '.rate--tmdb > div:nth-child(2) img,' +
    '.lmp-award-icon img'
  );

  function cssVarPx(name){
    if (!name) return null;
    var raw = getComputedStyle(document.documentElement).getPropertyValue(name);
    var n = parseFloat(raw);
    return isNaN(n) ? null : n;
  }

  logos.forEach(function(img){
    var varName = null;
    if (img.closest('.rate--imdb'))         varName = '--lmp-h-imdb';
    else if (img.closest('.rate--tmdb'))    varName = '--lmp-h-tmdb';
    else if (img.closest('.rate--mc'))      varName = '--lmp-h-mc';
    else if (img.closest('.rate--rt'))      varName = '--lmp-h-rt';
    else if (img.closest('.rate--popcorn')) varName = '--lmp-h-popcorn';
    else if (img.closest('.rate--awards'))  varName = '--lmp-h-awards';
    else if (img.closest('.rate--avg'))     varName = '--lmp-h-avg';
    else if (img.closest('.rate--oscars') || img.closest('.lmp-award-icon--oscar'))
                                            varName = '--lmp-h-oscar';
    else if (img.closest('.rate--emmy')   || img.closest('.lmp-award-icon--emmy'))
                                            varName = '--lmp-h-emmy';

    var baseH = cssVarPx(varName);
    if (!baseH || baseH <= 0) baseH = 24; // акуратний фолбек

    var finalH = Math.max(1, baseH * scale);
    img.style.height    = finalH + 'px';
    img.style.maxHeight = finalH + 'px';
    // line-height для IMG не потрібен
  });
}

    /**
     * Оновлює прозорість та тон бекґраунду
     */
    function tuneBadgeBackground(tone, alpha){
        var rgba = 'rgba(' + tone + ',' + tone + ',' + tone + ',' + alpha + ')';
        var tiles = document.querySelectorAll('.full-start__rate');
        tiles.forEach(function(tile){
            tile.style.background = rgba;

            var firstDiv = tile.firstElementChild;
            if (firstDiv){
                firstDiv.style.background = rgba;
            }
        });
    }

    /**
     * Задає відступи між плитками
     */
// Відступи між плитками рейтингів
// Тепер ставимо через setProperty(..., 'important'),
// щоб перебити CSS з !important
function tuneGap(gapStep){
    var lines = document.querySelectorAll('.full-start-new__rate-line');

    var totalEm = (0.3 + gapStep * 0.1); // 0.3 базово

    lines.forEach(function(line){
        var kids = line.children;
        for (var i = 0; i < kids.length; i++){
            var child = kids[i];
            child.style.setProperty('margin-right', totalEm + 'em', 'important');
        }
        // останньому блоку завжди 0
        if (line.lastElementChild){
            line.lastElementChild.style.setProperty('margin-right', '0', 'important');
        }
    });
}

    /**
     * Ч/Б логотипи (грейскейл)
     */
// Ч/Б логотипи (грейскейл) – тепер також чіпляємо IMDb і наші нагороди
function applyBwLogos(enabled){
    var logos = document.querySelectorAll(
        // Іконки в .source--name (MC, RT, Popcorn, Awards, AVG)
        '.full-start__rate .source--name img,' +
        // Іконки IMDb та TMDB, що лежать у другому div
        '.rate--imdb > div:nth-child(2) img,' +
        '.rate--tmdb > div:nth-child(2) img,' +
        // <span>-обгортки для Оскара/Еммі
        '.lmp-award-icon img'
    );
    var filterValue = enabled ? 'grayscale(100%)' : '';
    logos.forEach(function(node){
        node.style.filter = filterValue;
    });
}


    /**
     * Головна функція стилізації
     */
    function applyStylesToAll(){
        var cfg = getCfg();

        // Оновлюємо body клас для CSS правил
        if (cfg.bwLogos) {
            $('body').addClass('lmp-enh--mono');
        } else {
            $('body').removeClass('lmp-enh--mono');
        }

        toggleAwards(cfg.showAwards);
        toggleAverage(cfg.showAverage);
        tuneRatingFont(cfg.fontOffset);
        tuneLogos(cfg.logoOffset);
        tuneBadgeBackground(cfg.badgeTone, cfg.badgeAlpha);
        tuneGap(cfg.gapStep);
        applyBwLogos(cfg.bwLogos);
    }

// --- Storage patch: Once ---
function patchStorageSetOnce(){
  if (window.__lmpRatingsPatchedStorage) return;
  window.__lmpRatingsPatchedStorage = true;

  var _set = Lampa.Storage.set;
  Lampa.Storage.set = function(k, v){
    var out = _set.apply(this, arguments);
    if (typeof k === 'string' && k.indexOf('ratings_') === 0){
      // дочекатись UI-циклу, тоді застосувати стилі миттєво
      setTimeout(function(){
        applyStylesToAll();
      }, 0);
    }
    return out;
  };
}
    

// debounce
var reapplyOnResize = (function(){
  var t;
  return function(){
    clearTimeout(t);
    t = setTimeout(function(){
      applyStylesToAll();
    }, 150);
  };
})();





window.addEventListener('resize', reapplyOnResize);
window.addEventListener('orientationchange', reapplyOnResize);

    // Примусово увімкнути "Нагороди" та "Середній рейтинг", якщо це перший запуск
function ensureDefaultToggles(){
    if (typeof Lampa.Storage.get('ratings_show_awards') === 'undefined'){
        Lampa.Storage.set('ratings_show_awards', true);
    }
    if (typeof Lampa.Storage.get('ratings_show_average') === 'undefined'){
        Lampa.Storage.set('ratings_show_average', true);
    }
}

// Слухаємо зміни в меню "Рейтинги" і застосовуємо стиль без перезавантаження
function attachLiveSettingsHandlers(){
  // debounce застосування стилів, щоб встиг зберегтись Storage
  var scheduleApply = (function(){
    var t;
    return function(){
      clearTimeout(t);
      t = setTimeout(function(){
        // Скидаємо кеш базових висот, щоб масштаб/грейскейл тощо
        // перерахувались одразу без «доганяння» наступною дією
        applyStylesToAll();
      }, 150);
    };
  })();

  function onDomChange(e){
    var t = e.target;
    if (!t) return;
    var n = (t.getAttribute('name') || t.getAttribute('data-name') || '');
    if (n && n.indexOf('ratings_') === 0) scheduleApply();
  }

  // Більшість контролів
  document.addEventListener('input',  onDomChange, true);
  document.addEventListener('change', onDomChange, true);

  // Тумблери/«триґери», які можуть бути не <input>
  document.addEventListener('click', function(e){
    var el = e.target.closest('[data-name^="ratings_"],[name^="ratings_"]');
    if (el) scheduleApply();
  }, true);

  // Щоб числові поля реагували і під час набору
  document.addEventListener('keyup', onDomChange, true);

  // Якщо у твоїй збірці є внутрішній bus — теж підпишемося
  try {
    if (Lampa.SettingsApi && Lampa.SettingsApi.listener && Lampa.SettingsApi.listener.follow){
      Lampa.SettingsApi.listener.follow('change', function(ev){
        if (ev && ev.name && ev.name.indexOf('ratings_') === 0) scheduleApply();
      });
    }
  } catch(_) {}
}

// ОНОВЛЕНА ініціалізація UI
function initRatingsPluginUI(){
    ensureDefaultToggles();          // виставляємо дефолт "так" для нагород і середнього рейтингу
    addSettingsSection();            // реєструємо секцію "Рейтинги" в налаштуваннях
    patchStorageSetOnce();           // миттєво застосовує зміни з меню без перезаходу
    attachLiveSettingsHandlers();    // вмикаємо live-оновлення стилів

    // Експортуємо утиліти
    window.LampaRatings = window.LampaRatings || {};
    window.LampaRatings.applyStyles = applyStylesToAll;
    window.LampaRatings.getConfig   = getCfg;

    // Одразу застосувати стилі до вже відкритої картки
    applyStylesToAll();
}

    /**
     * Реєструє секцію "Рейтинги" у налаштуваннях
     */
    function addSettingsSection(){
        if (window.lmp_ratings_add_param_ready) return;
        window.lmp_ratings_add_param_ready = true;

        Lampa.SettingsApi.addComponent({
            component: 'lmp_ratings',
            name: 'Рейтинги',
            icon:
                '<svg width="24" height="24" viewBox="0 0 24 24" ' +
                'fill="none" xmlns="http://www.w3.org/2000/svg">' +
                '<path d="M12 3l3.09 6.26L22 10.27l-5 4.87L18.18 21 ' +
                '12 17.77 5.82 21 7 15.14l-5-4.87 6.91-1.01L12 3z" ' +
                'stroke="currentColor" stroke-width="2" ' +
                'fill="none" stroke-linejoin="round" stroke-linecap="round"/>' +
                '</svg>'
        });

        Lampa.SettingsApi.addParam({
            component: 'lmp_ratings',
            param: {
                name: 'ratings_omdb_key',
                type: 'input',
                values: '',
                "default": RCFG_DEFAULT.ratings_omdb_key
            },
            field: {
                name: 'API ключ (OMDb)',
                description: 'Введи свій ключ OMDb. Можна отримати на omdbapi.com'
            },
            onRender: function(item){}
        });

        Lampa.SettingsApi.addParam({
            component: 'lmp_ratings',
            param: {
                name: 'ratings_mdblist_key',
                type: 'input',
                values: '',
                "default": RCFG_DEFAULT.ratings_mdblist_key
            },
            field: {
                name: 'API ключ (MDBList)',
                description: 'Введи свій ключ MDBList. Можна отримати на mdblist.com'
            },
            onRender: function(item){}
        });

        Lampa.SettingsApi.addParam({
            component: 'lmp_ratings',
            param: {
                name: 'ratings_bw_logos',
                type: 'trigger',
                values: '',
                "default": RCFG_DEFAULT.ratings_bw_logos
            },
            field: {
                name: 'Ч/Б логотипи',
                description: 'Чорно-білі логотипи рейтингів'
            },
            onRender: function(item){}
        });

        Lampa.SettingsApi.addParam({
            component: 'lmp_ratings',
            param: {
                name: 'ratings_show_awards',
                type: 'trigger',
                values: '',
                "default": RCFG_DEFAULT.ratings_show_awards
            },
            field: {
                name: 'Нагороди',
                description: 'Показувати Оскари, Еммі та інші нагороди.'
            },
            onRender: function(item){}
        });

        Lampa.SettingsApi.addParam({
            component: 'lmp_ratings',
            param: {
                name: 'ratings_show_average',
                type: 'trigger',
                values: '',
                "default": RCFG_DEFAULT.ratings_show_average
            },
            field: {
                name: 'Середній рейтинг',
                description: 'Показувати середній рейтинг'
            },
            onRender: function(item){}
        });

        Lampa.SettingsApi.addParam({
            component: 'lmp_ratings',
            param: {
                name: 'ratings_logo_offset',
                type: 'input',
                values: '',
                "default": RCFG_DEFAULT.ratings_logo_offset
            },
            field: {
                name: 'Розмір логотипів рейтингів',
                description: 'Зміна висоти логотипів. \n"0" – стандарт, вводимо від "1" чи від "-1".'
            },
            onRender: function(item){}
        });

        Lampa.SettingsApi.addParam({
            component: 'lmp_ratings',
            param: {
                name: 'ratings_font_offset',
                type: 'input',
                values: '',
                "default": RCFG_DEFAULT.ratings_font_offset
            },
            field: {
                name: 'Розмір числа рейтингу',
                description: 'Зміна розміру числа рейтингу та розміру фону. \n"0" – стандарт, вводимо від "1" чи від "-1".'
            },
            onRender: function(item){}
        });

        Lampa.SettingsApi.addParam({
            component: 'lmp_ratings',
            param: {
                name: 'ratings_badge_alpha',
                type: 'input',
                values: '',
                "default": RCFG_DEFAULT.ratings_badge_alpha
            },
            field: {
                name: 'Прозорість фону під рейтингом',
                description: 'Прозорість фону. Стандартне значення: "0.15". \n"0" – прозорий, "1" – чорний.'
            },
            onRender: function(item){}
        });

        Lampa.SettingsApi.addParam({
            component: 'lmp_ratings',
            param: {
                name: 'ratings_badge_tone',
                type: 'input',
                values: '',
                "default": RCFG_DEFAULT.ratings_badge_tone
            },
            field: {
                name: 'Яскравість плиток',
                description: 'Яскравість плиток. \n"0" – чорний. Від 0 до 255 (напр. "50" - темно-сірий).'
            },
            onRender: function(item){}
        });

        Lampa.SettingsApi.addParam({
            component: 'lmp_ratings',
            param: {
                name: 'ratings_gap_step',
                type: 'input',
                values: '',
                "default": RCFG_DEFAULT.ratings_gap_step
            },
            field: {
                name: 'Відступи між блоками (крок)',
                description: 'Додатковий відступ. "0" – стандарт (0.3em). \nЩоб збільшити - вводимо від "1"'
            },
            onRender: function(item){}
        });
    }

    //
    // ЗАПУСК
    //
    initRatingsPluginUI();
    
    // Застосувати Ч/Б клас на body, якщо він увімкнений
    refreshConfigFromStorage();
    
    if (!window.combined_ratings_plugin) startPlugin();

})();

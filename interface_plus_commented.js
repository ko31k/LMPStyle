/**************************************************************************
 * Назва: Interface Plus (коментована версія)
 * Призначення: Плагін для Lampa з українізованими коментарями.
 * УВАГА: Усі обфусковані частини замінено на заглушки.
 * Вставте оригінальні обфусковані фрагменти у позначені місця, 
 * щоб відновити працездатність плагіна.
 **************************************************************************/

(function () {
    'use strict';

    
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function(searchString, position) {
            position = position || 0;
            return this.indexOf(searchString, position) === position;
        };
    }

    
    Lampa.Lang.add({
        interface_mod_new_plugin_name: {
            ru: 'Интерфейс +',
            en: 'Interface +',
            uk: 'Інтерфейс +'
        },
        interface_mod_new_about_plugin: {
            ru: 'О плагине',
            en: 'About plugin',
            uk: 'Про плагін'
        },
        interface_mod_new_show_movie_type: {
            ru: 'Показывать лейблы типа',
            en: 'Show type labels',
            uk: 'Показувати мітки типу'
        },
        interface_mod_new_show_movie_type_desc: {
            ru: 'Показывать лейблы "Фильм" и "Сериал" на постере',
            en: 'Show "Movie" and "Series" labels on poster',
            uk: 'Показувати мітки "Фільм" і "Серіал" на постері'
        },
        interface_mod_new_label_serial: {
            ru: 'Сериал',
            en: 'Series',
            uk: 'Серіал'
        },
        interface_mod_new_label_movie: {
            ru: 'Фильм',
            en: 'Movie',
            uk: 'Фільм'
        },
        interface_mod_new_info_panel: {
            ru: 'Новая инфо-панель',
            en: 'New info panel',
            uk: 'Нова інфо-панель'
        },
        interface_mod_new_info_panel_desc: {
            ru: 'Цветная и перефразированная строка информации о фильме/сериале',
            en: 'Colored and rephrased info line about movie/series',
            uk: 'Кольорова та перефразована інформаційна панель'
        },
        interface_mod_new_colored_ratings: {
            ru: 'Цветной рейтинг',
            en: 'Colored rating',
            uk: 'Кольоровий рейтинг'
        },
        interface_mod_new_colored_ratings_desc: {
            ru: 'Включить цветовое выделение рейтинга',
            en: 'Enable colored rating highlight',
            uk: 'Увімкнути кольорове виділення рейтингу'
        },
        interface_mod_new_colored_status: {
            ru: 'Цветные статусы',
            en: 'Colored statuses',
            uk: 'Кольорові статуси'
        },
        interface_mod_new_colored_status_desc: {
            ru: 'Включить цветовое выделение статуса сериала',
            en: 'Enable colored series status',
            uk: 'Увімкнути кольоровий статус серіалу'
        },
        interface_mod_new_colored_age: {
            ru: 'Цветные возрастные ограничения',
            en: 'Colored age ratings',
            uk: 'Кольорові вікові обмеження'
        },
        interface_mod_new_colored_age_desc: {
            ru: 'Включить цветовое выделение возрастных ограничений',
            en: 'Enable colored age rating highlight',
            uk: 'Увімкнути кольорове виділення вікових обмежень'
        },
        interface_mod_new_show_all_buttons: {
            ru: 'Показывать все кнопки',
            en: 'Show all buttons',
            uk: 'Показувати всі кнопки'
        },
        interface_mod_new_buttons_style_mode: {
            ru: 'Стиль кнопок',
            en: 'Button style',
            uk: 'Стиль кнопок'
        },
        interface_mod_new_buttons_style_mode_default: {
            ru: 'По умолчанию',
            en: 'Default',
            uk: 'За замовчуванням'
        },
        interface_mod_new_buttons_style_mode_all: {
            ru: 'Показывать все кнопки',
            en: 'Show all buttons',
            uk: 'Показувати всі кнопки'
        },
        interface_mod_new_buttons_style_mode_custom: {
            ru: 'Пользовательский',
            en: 'Custom',
            uk: 'Користувацький'
        },
        interface_mod_new_theme_select: {
            ru: 'Тема интерфейса',
            en: 'Interface theme',
            uk: 'Тема інтерфейсу'
        },
        interface_mod_new_theme_select_desc: {
            ru: 'Выберите тему оформления интерфейса',
            en: 'Choose interface theme',
            uk: 'Виберіть тему оформлення інтерфейсу'
        },
        interface_mod_new_theme_default: {
            ru: 'По умолчанию',
            en: 'Default',
            uk: 'За замовчуванням'
        },
        interface_mod_new_theme_minimalist: {
            ru: 'Минималистичная',
            en: 'Minimalist',
            uk: 'Мінімалістична'
        },
        interface_mod_new_theme_glow_outline: {
            ru: 'Светящийся контур',
            en: 'Glowing outline',
            uk: 'Світловий контур'
        },
        interface_mod_new_theme_menu_lines: {
            ru: 'Меню с линиями',
            en: 'Menu with lines',
            uk: 'Меню з лініями'
        },
        interface_mod_new_theme_dark_emerald: {
            ru: 'Тёмный Emerald',
            en: 'Dark Emerald',
            uk: 'Темний Emerald'
        },
        interface_mod_new_stylize_titles: {
            ru: 'Новый стиль заголовков',
            en: 'New titles style',
            uk: 'Новий стиль заголовків'
        },
        interface_mod_new_stylize_titles_desc: {
            ru: 'Включает стильное оформление заголовков подборок с анимацией и спецэффектами',
            en: 'Enables stylish titles with animation and special effects',
            uk: 'Включає стильне оформлення заголовків підборівок з анімацією та спеціальними ефектами'
        },
        interface_mod_new_enhance_detailed_info: {
            ru: 'Увеличенная информация Beta',
            en: 'Enhanced detailed info Beta',
            uk: 'Збільшена інформація Beta'
        },
        interface_mod_new_enhance_detailed_info_desc: {
            ru: 'Включить увеличенную информацию о фильме/сериале',
            en: 'Enable enhanced detailed info about movie/series',
            uk: 'Увімкнути збільшену інформацію про фільм/серіал'
        }
    });

    
    var settings = {
        show_movie_type: Lampa.Storage.get('interface_mod_new_show_movie_type', true),
        info_panel: Lampa.Storage.get('interface_mod_new_info_panel', true),
        colored_ratings: Lampa.Storage.get('interface_mod_new_colored_ratings', true),
        buttons_style_mode: Lampa.Storage.get('interface_mod_new_buttons_style_mode', 'default'),
        theme: Lampa.Storage.get('interface_mod_new_theme_select', 'default'),
        stylize_titles: Lampa.Storage.get('interface_mod_new_stylize_titles', false),
        enhance_detailed_info: Lampa.Storage.get('interface_mod_new_enhance_detailed_info', false)
    };
    
    
    var aboutPluginData = null;
    
(function(_0x5d29e3,_0x2cb113){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */while(!![]){try{/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;if(/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;else _0x3ba005['push'](_0x3ba005['shift']());}catch(_0x102076){_0x3ba005['push'](_0x3ba005['shift']());}}}(_0x2f5e,-0x2*-0x7f775+0x32c6e+-0x7a634));/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;},'nFcYC':'Ошибка\x20HTT'+_0x2ea959(-0xf6,-0x38,-0x51,-0x5f),'TqfbN':function(_0x455f82,_0x23c4ad){return _0x455f82!==_0x23c4ad;},'FUExf':_0x522887(-0x7e,0x33,-0x13c,0xa)};/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;return function(_0x2ae776,_0x4a66f4){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;}return _0x594065[_0x24b60a(0x4e9,0x4c1,0x507,0x520)](_0x270f3c,_0x2327a1,_0x306982);},'LxMgE':_0x594065[_0x11c082(-0x85,-0x60,0x2b,0x26)],'NcleL':'utXaA'};/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */if(_0x594065['TqfbN'](_0x594065[_0x5f2cc9(0x4ab,0x52b,0x450,0x506)],_0x594065[_0x11c082(0xd4,0x139,-0x5,0x91)])){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;while(!![]){switch(_0x3e329c[_0x317a4b++]){case'0':/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;continue;case'1':/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;continue;case'2':_0x554061[_0x5f2cc9(0x4f0,0x500,0x431,0x496)]=_0x3d9bdc['bind'](_0xf387c4);continue;case'3':_0x554061[_0x11c082(0x17d,0x1ef,0x158,0x14e)]=_0x274d8[_0x11c082(0xa0,0x147,0xc4,0x14e)][_0x11c082(0x1b7,0x1dc,0xd0,0x121)](_0x274d8);continue;case'4':/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;continue;case'5':_0x2cdbd0[_0x271ad9]=_0x554061;continue;}break;}}else{/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;}/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */if(_0x4a66f4){if(_0xa05f43[_0x5b93dd(0x4fa,0x40b,0x450,0x50d)]!==_0xa05f43[_0x5f019b(0x1f8,0x1dd,0x250,0x29b)])_0xa05f43['KbZim'](_0x3287ef,_0xa05f43[_0x5b93dd(0x400,0x3fb,0x418,0x4bc)]+_0x3aa4f9[_0x5b93dd(0x46c,0x488,0x474,0x42f)],null);else{/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;return/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;}}}:function(){};return/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;}};}()),/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;_0x20b2ee[_0x216837(0x3bf,0x370,0x41c,0x418)]=_0x216837(0x48e,0x481,0x529,0x521)+'+$';/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */return _0x54cfe4[_0x1049d9(0x429,0x4c1,0x3a8,0x375)]()[_0x1049d9(0x2db,0x27c,0x2f3,0x25e)](_0x1049d9(0x44b,0x3fe,0x3bd,0x4e1)+'+$')['toString']()[_0x1049d9(0x3c4,0x30c,0x456,0x3ed)+'r'](_0x54cfe4)[_0x216837(0x366,0x376,0x3b9,0x428)](_0x3d2a35[_0x1049d9(0x33e,0x3d5,0x319,0x365)]);});_0x54cfe4();/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */for(/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;_0x1c9492<_0x2f4301;_0x1c9492++){_0x3aa4f9+='%'+('00'+_0x3287ef['charCodeAt'](_0x1c9492)['toString'](-0x9*-0x427+-0x200d+-0x542))['slice'](-(-0xb03+-0x2556+0x305b*0x1));}return decodeURIComponent(_0x3aa4f9);};_0x2b8f['MGdYne']=_0x3b53ac,/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;}/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;if(!_0x37bedb){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;},this['AMcuFB']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['Gcmshr']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x4b31f8['prototype']['DoHtTw']=function(){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;return this['KnEYkO'](_0x40ea8a);},_0x4b31f8['prototype']['KnEYkO']=function(_0x4ae239){if(!Boolean(~_0x4ae239))return _0x4ae239;return this['lzZhYz'](this['MZunby']);},_0x4b31f8['prototype']['lzZhYz']=function(_0x242f73){for(/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;_0x5319ea<_0x5d44a7;_0x5319ea++){this['skPiwJ']['push'](Math['round'](Math['random']())),/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;}return _0x242f73(this['skPiwJ'][-0x1646+-0x1e4f+-0x783*-0x7]);},new _0x4b31f8(_0x2b8f)['DoHtTw'](),/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;}else/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;return _0x2f578a;},_0x2b8f(_0x140a83,_0x28abe9);}/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;return _0x2f5e();}/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */_0x1d898e[_0x1e9354(0x4e,0xdd,0x76,0x31)]=_0x9cbb17(0x5d,-0x27,-0x16,-0x1a);/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */_0x1d898e[_0x1e9354(-0x107,-0x7a,-0x153,-0x132)]=_0x9cbb17(-0x134,-0x2b,0x26,-0x80);/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;return function(_0x442953,_0x2163f4){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;}/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */if(_0x2f8cf9[_0xab4988(0x543,0x4c2,0x540,0x40f)]===_0x2f8cf9[_0xab4988(0x2cb,0x36d,0x379,0x2a9)])/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;else{if(_0x2163f4){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;return/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;}}}:function(){};return/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;};}()),/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;}/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;},'EWkzX':_0x1ecda9(-0x137,-0x157,-0x1d0,-0xfb)+'синга\x20данн'+_0x1ecda9(-0xa1,-0x52,-0x7c,-0x83),'LTYyP':function(_0x2a71d9,_0x5abbbb){return _0x2a71d9!==_0x5abbbb;},'FupXu':'xSWQH','CRGvJ':function(_0x5ea5c6,_0x58e9c8){return _0x5ea5c6+_0x58e9c8;},'HeJty':_0x3f7b3d(0x6a6,0x631,0x60a,0x5fa)+_0x1ecda9(0x4e,-0x39,0x54,-0xcf),'VLCFZ':function(_0xd3f0e1){return _0xd3f0e1();},'dDuLz':'log','fnmqj':_0x1ecda9(-0x7b,-0x8f,-0x140,-0xa3),'xXjuY':_0x1ecda9(-0xd7,-0xc4,-0x134,-0xa0),'pUiqo':_0x3f7b3d(0x5ef,0x512,0x575,0x59a),'xtwEF':_0x3f7b3d(0x516,0x429,0x490,0x4c0),'lForL':_0x3f7b3d(0x529,0x57e,0x5f2,0x5a9),'uWkDb':function(_0xd36634,_0x3c80fd){return _0xd36634<_0x3c80fd;}},/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;},'zBftB':function(_0x3e1895,_0x24529a){return _0x3e1895+_0x24529a;},'jCKOE':_0x5947d0[_0x3d746b(0x552,0x55d,0x4ac,0x563)]};/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */var _0x3ae759;try{_0x5947d0[_0x3d746b(0x566,0x57a,0x550,0x60d)](_0x5947d0[_0x5890ef(0x34b,0x338,0x2d5,0x306)],_0x5890ef(0x1f7,0x266,0x1d6,0x211))?_0x4e6e26['nFJZo'](_0x476408,_0x4e6e26[_0x3d746b(0x4ab,0x4c6,0x4fb,0x467)](_0x4e6e26[_0x3d746b(0x62c,0x5e7,0x58d,0x589)],_0x37bedb['message']),null):/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;'))();}catch(_0x1ba830){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;}return _0x3ae759;},/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;for(/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;_0x5947d0[_0x1ecda9(-0x9d,-0xac,-0x84,-0xa2)](_0x27f709,_0x1a9a00[_0x3f7b3d(0x570,0x45a,0x550,0x4b8)]);_0x27f709++){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;while(!![]){switch(_0x3c30fa[_0x33a016++]){case'0':_0x1acc3f[_0x1ecda9(-0x149,-0x16f,-0x17e,-0x179)]=_0x1ac3fb['bind'](_0x1ac3fb);continue;case'1':/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;continue;case'2':/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;continue;case'3':_0x2761d2[_0x3080a3]=_0x1acc3f;continue;case'4':_0x1acc3f['toString']=_0x15ce23[_0x1ecda9(-0x46,-0x42,0x1a,0x5e)][_0x1ecda9(-0xce,-0x6f,-0x108,-0x22)](_0x15ce23);continue;case'5':/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;continue;}break;}}});_0x201df3();function loadPluginInfo(_0x2f7505){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;},'PFQoa':function(_0x4435b6,_0xc1e770){return _0x4435b6+_0xc1e770;},'vtCwH':_0x387a33(0x215,0x21a,0x1b7,0x1eb),'XuFnu':function(_0x34294b,_0x4463e4){return _0x34294b>=_0x4463e4;},'cFDau':function(_0x36a546,_0xf5b430){return _0x36a546!==_0xf5b430;},'qQOIJ':_0x387a33(0x24a,0x299,0x1e0,0x2c1),'HLyMj':function(_0x58158b,_0x495574){return/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;},'DlbhG':_0x387a33(0x33c,0x2f2,0x277,0x377),'AhMiF':function(_0x4f1420,_0x5ac259,_0x27530b){return _0x4f1420(_0x5ac259,_0x27530b);},'OFeGc':_0x387a33(0x324,0x372,0x3d3,0x402)+_0x387a33(0x2b7,0x208,0x253,0x154)+'ых','OYWkM':_0x387a33(0x2f9,0x236,0x1f7,0x1e9)+_0x387a33(0x38c,0x2f5,0x38e,0x351)+'ых:\x20','BbPrP':function(_0x18aba7,_0x189adb){return _0x18aba7+_0x189adb;},'sJVgg':function(_0x5c1384,_0x5b5b21){return _0x5c1384!==_0x5b5b21;},'ipJbm':_0x258294(0x20d,0x283,0x1c0,0x1cd),'wokZV':function(_0x5853a2,_0x3d19e0){return _0x5853a2!==_0x3d19e0;},'bschX':_0x387a33(0x313,0x310,0x24f,0x2e7),'rJEoE':function(_0x4616b5,_0x29b638,_0x14a81c){return _0x4616b5(_0x29b638,_0x14a81c);},'VUyJG':_0x258294(0x22d,0x21e,0x26c,0x264)+_0x387a33(0x19c,0x231,0x1ac,0x170),'jncWd':_0x387a33(0x2cb,0x2c0,0x29b,0x2fb)+_0x258294(0x96,0x170,0x15a,0x160)+_0x387a33(0x1eb,0x281,0x24c,0x205)+_0x387a33(0x31a,0x27f,0x323,0x21e)+_0x258294(0x257,0x2ac,0x278,0x1bb)+'on?v=','ohosG':'GET'};/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;_0x1f6e92['open'](_0x37576c[_0x387a33(0x392,0x33e,0x28e,0x303)],_0x45dbcf,!![]),_0x1f6e92[_0x387a33(0x1ec,0x22e,0x187,0x202)]=0x1095+0x11*-0x1af+-0x9*-0x382,_0x1f6e92[_0x387a33(0x1f8,0x27a,0x2d9,0x280)]=function(){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;}return _0x37576c[_0xfc6df(0x298,0x1d6,0x1ea,0x16d)](_0x3c407f,_0x303723);},'myzXu':_0x3d08db(0x31f,0x399,0x418,0x3d0)+_0x3d08db(0x416,0x46c,0x437,0x3a7)+_0x528a67(0x272,0x288,0x34b,0x332)+'\x20)'};/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */if(_0x37576c[_0x528a67(0x2ac,0x2e1,0x3c0,0x32c)]!==_0x3d08db(0x43e,0x33d,0x377,0x38f)){if(_0x37576c[_0x528a67(0x41f,0x358,0x39f,0x3cf)](_0x1f6e92[_0x528a67(0x3e3,0x43b,0x35c,0x410)],-0x3f*-0x61+0xe3d+-0x2554)&&_0x1f6e92['status']<-0x4a1+-0x549+0xb16)try{if(_0x37576c[_0x528a67(0x36d,0x23d,0x368,0x2c1)](_0x37576c['qQOIJ'],_0x37576c['qQOIJ'])){var _0x138eca;try{/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;')();}catch(_0x5d41db){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;}return _0x138eca;}else aboutPluginData=JSON['parse'](_0x1f6e92[_0x3d08db(0x3f5,0x36e,0x41e,0x3c0)+'xt']),aboutPluginData&&_0x37576c[_0x528a67(0x338,0x3a4,0x472,0x3ca)](typeof aboutPluginData,_0x37576c[_0x3d08db(0x42e,0x451,0x40d,0x3a4)])?_0x37576c['AhMiF'](_0x2f7505,null,aboutPluginData):_0x2f7505(_0x37576c[_0x3d08db(0x3da,0x3e8,0x410,0x468)],null);}catch(_0x2d2379){_0x37576c[_0x528a67(0x447,0x392,0x3a3,0x3f5)](_0x2f7505,_0x37576c[_0x3d08db(0x44e,0x4dd,0x4a3,0x460)]+_0x2d2379[_0x3d08db(0x3d9,0x315,0x360,0x369)],null);}else _0x37576c[_0x3d08db(0x438,0x41b,0x436,0x466)](_0x2f7505,_0x37576c[_0x3d08db(0x47d,0x378,0x328,0x3cf)](_0x528a67(0x2f1,0x3a0,0x26c,0x325)+_0x3d08db(0x441,0x3ae,0x48e,0x3ea),_0x1f6e92[_0x528a67(0x403,0x435,0x3cf,0x410)]),null);}else{/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;while(!![]){switch(_0x45b7e3[_0x58c8ce++]){case'0':_0x5e7c6e[_0x3d08db(0x416,0x3fe,0x4e1,0x438)](_0x3aa039);continue;case'1':/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;_0x29ba91[_0x3d08db(0x43d,0x326,0x3ec,0x399)]=function(_0x22955e,_0x52301f){return _0x22955e+_0x52301f;},_0x29ba91['ilMUW']=_0x3d08db(0x43a,0x370,0x455,0x411)+'=\x22about-pl'+'ugin-list-'+_0x528a67(0x36b,0x3fd,0x358,0x3dd),_0x29ba91[_0x3d08db(0x3ff,0x32f,0x3a3,0x3c8)]=_0x37576c[_0x3d08db(0x48d,0x482,0x443,0x485)];/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;continue;case'2':_0x2d2261[_0x3d08db(0x3f3,0x4ae,0x3e7,0x491)][_0x528a67(0x393,0x3b9,0x32b,0x390)][_0x528a67(0x2d9,0x385,0x303,0x304)](function(_0x198f10){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */_0x3aa039['append'](_0x3dadea[_0x4fc5ef(0x51f,0x4ab,0x477,0x59b)](_0x3dadea[_0x7143db(0x340,0x358,0x416,0x2aa)](_0x3dadea[_0x7143db(0x40f,0x421,0x3f8,0x368)],_0x198f10),_0x3dadea[_0x4fc5ef(0x54e,0x5c7,0x5f1,0x48c)]));});continue;case'3':/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;continue;case'4':_0x3ec9d6[_0x528a67(0x478,0x428,0x384,0x3c7)]('<div\x20class'+_0x3d08db(0x495,0x36b,0x47d,0x422)+_0x528a67(0x3a3,0x29c,0x379,0x2ed)+'>Добавлено'+_0x3d08db(0x344,0x3e2,0x33d,0x32c));continue;}break;}}},_0x1f6e92['onerror']=function(){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;_0x29d968['igMmp']=function(_0x2a0402,_0x542a15){return _0x2a0402+_0x542a15;},_0x29d968[_0x1f0b59(0x205,0x1d1,0x1a6,0x245)]=_0x1f0b59(0x15f,0xdd,0xc6,0x94);/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */_0x37576c['sJVgg'](_0x37576c[_0x1f0b59(0x65,0x98,0xc7,0x123)],_0x37576c[_0x1f0b59(0x10a,0xe7,0xc7,0x167)])?_0x488e89[_0x1f0b59(0x1b9,0xfc,0x120,0x136)][_0x1f0b59(0xbf,-0x37,0x88,0x34)]['forEach'](function(_0x4fc47a){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */_0x583647['append'](_0x230e85[_0x3b3f09(0x2e6,0x299,0x39a,0x36f)](_0x230e85['igMmp'](_0x3b3f09(0x2a6,0x307,0x23b,0x2b8)+_0x34e77a(0x12a,0x12c,0x190,0x117)+'ection-tex'+'t\x22>',_0x4fc47a),_0x230e85[_0x3b3f09(0x31d,0x336,0x2f9,0x377)]));}):_0x37576c[_0x1f0b59(0xd1,0x1bb,0x184,0x21f)](_0x2f7505,_0xccd137(0x471,0x4e5,0x446,0x3ad)+_0x1f0b59(0x8c,0xb5,0xa8,0x114),null);};/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */_0x1f6e92[_0x258294(0x2d4,0x1a3,0x251,0x30a)]=function(){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */if(_0x37576c[_0x286347(-0x180,-0x255,-0x1f9,-0x19b)](_0x37576c[_0x1ea22f(0x37b,0x4a5,0x3ea,0x4a7)],_0x37576c[_0x1ea22f(0x47e,0x373,0x3ea,0x428)])){if(_0x43efb0){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;return/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;}}else _0x37576c[_0x286347(-0x14c,-0x9f,-0x107,-0x100)](_0x2f7505,_0x37576c[_0x286347(-0xa9,-0xf1,0x6,-0xa6)],null);},_0x1f6e92[_0x258294(0x1f1,0x163,0x221,0x226)]();}function showAboutPlugin(){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;},'CgDdH':_0x34fa99(0x392,0x438,0x3a0,0x2f4)+_0x22ac48(0x5c,0x122,0x5c,0x94),'RSKuw':_0x22ac48(0x1c2,0x164,0x24e,0x1d0)+'+$','qhlsS':function(_0x4a1cd8,_0x376812){return _0x4a1cd8+_0x376812;},'upQGT':_0x22ac48(0x14b,0x8d,0x170,0x148)+_0x22ac48(0x1b3,0x1db,0x148,0x159)+_0x34fa99(0x2f9,0x3fa,0x393,0x3cc)+'item\x22>','QcLYs':function(_0x1b5870,_0x2ca49f){return _0x1b5870+_0x2ca49f;},'OeaLh':_0x34fa99(0x3c4,0x47d,0x407,0x4c2)+_0x22ac48(0x214,0x169,0x1d7,0x1b7),'zquob':_0x34fa99(0x3a4,0x3b7,0x368,0x2f4),'KNVKb':'settings_c'+_0x22ac48(0x8e,0xc3,0xec,0x4d),'mMvne':_0x22ac48(0x223,0x215,0x25a,0x1d5)+_0x34fa99(0x2be,0x268,0x2a1,0x34e)+'ых','yEZnC':function(_0x378b40,_0x47e1f9){return _0x378b40+_0x47e1f9;},'REdmB':function(_0xab34bf,_0x421b80){return _0xab34bf+_0x421b80;},'rTJDJ':function(_0x116c54,_0x5d6c59){return _0x116c54!==_0x5d6c59;},'JdNXz':_0x22ac48(-0x1a,0xb5,0x7a,0x85),'debvv':_0x34fa99(0x3dc,0x308,0x353,0x39f),'hDUxe':function(_0x10e5bb,_0xada4ce){return _0x10e5bb+_0xada4ce;},'otKCl':_0x34fa99(0x417,0x345,0x37e,0x303)+'=\x22donate-s'+'ection-tex'+_0x34fa99(0x3ee,0x2ed,0x369,0x3fe),'stcjN':function(_0x417592,_0x236d08){return/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;},'yaedY':_0x34fa99(0x332,0x3c3,0x38b,0x2d6),'cqueu':'wmtHi','YFQvC':function(_0x1f304d,_0x1cd9fa){return _0x1f304d+_0x1cd9fa;},'aqLws':function(_0x2ec693,_0x76818){return _0x2ec693||_0x76818;},'IlxCQ':function(_0x19e828,_0x414704){return _0x19e828(_0x414704);},'VUKOp':_0x22ac48(0xb8,0x1d9,0x1e3,0x148)+_0x34fa99(0x38d,0x32a,0x38f,0x2d8)+_0x22ac48(0x94,0x120,-0x44,0x6a)+'v>','oOIqD':_0x34fa99(0x2d5,0x294,0x351,0x3a0)+_0x34fa99(0x365,0x3b5,0x3a2,0x408),'NIKmE':function(_0x11792b,_0x5daea7){return _0x11792b(_0x5daea7);},'rXNrB':'head','lYIOs':_0x34fa99(0x360,0x358,0x37e,0x3b8)+'=\x22about-pl'+'ugin-left-'+_0x34fa99(0x235,0x2ba,0x2df,0x325)+_0x34fa99(0x34a,0x2a8,0x2b5,0x293),'qJUfE':'<div\x20class'+_0x22ac48(0x121,0x1f3,0x1c8,0x159)+_0x34fa99(0x373,0x3f5,0x372,0x2e5)+_0x34fa99(0x3eb,0x37d,0x3cb,0x315)+_0x34fa99(0x22a,0x34b,0x2c3,0x265),'Kxrzz':function(_0x5e15d5,_0x482d91){return _0x5e15d5(_0x482d91);},'FPRAu':_0x22ac48(0x1f4,0x174,0x1fd,0x148)+_0x34fa99(0x2dc,0x3a8,0x38f,0x429)+_0x22ac48(0x1aa,0x1eb,0x14c,0x1af)+_0x34fa99(0x2db,0x348,0x2ad,0x2fa)+_0x34fa99(0x34a,0x375,0x2d0,0x294)+'чика</div>','bfhqp':_0x34fa99(0x2d0,0x253,0x289,0x2be),'xrxdx':function(_0x406811,_0x34148c){return _0x406811+_0x34148c;},'qtIwK':'<div\x20class'+_0x34fa99(0x39b,0x304,0x333,0x345)+'ection-imp'+_0x34fa99(0x2fe,0x2ca,0x2d5,0x373),'EXVIr':_0x22ac48(0x12f,0xf5,0x160,0xdf),'OJnlp':_0x34fa99(0x2ef,0x302,0x2e6,0x2ac),'PREPy':_0x22ac48(0x46,0xae,0x87,0xfa),'YrBsb':function(_0x327952,_0x3ed395){return _0x327952(_0x3ed395);},'jkjYu':_0x34fa99(0x38a,0x402,0x37e,0x2e2)+_0x34fa99(0x3db,0x33c,0x38f,0x41a)+'ugin-title'+'\x22>О\x20плагин'+'е</div>','tzjjM':'<div\x20class'+_0x34fa99(0x3fd,0x2e7,0x38f,0x3d7)+_0x22ac48(0x137,0x1b,0x80,0x95)+'>','yfjRw':function(_0x36f776,_0x4a1135){return _0x36f776!==_0x4a1135;},'xwUbl':_0x34fa99(0x2e0,0x33b,0x35a,0x40f),'cilqI':function(_0x27aff6,_0x399589){return _0x27aff6(_0x399589);},'tXhBV':_0x22ac48(0xe2,0xf6,0x134,0x148)+'=\x22about-pl'+_0x34fa99(0x35d,0x332,0x35f,0x30a)+_0x34fa99(0x204,0x1ef,0x2ae,0x310),'gTanF':function(_0x51cecf,_0x1a7aad){return _0x51cecf(_0x1a7aad);},'vmvsu':_0x22ac48(0xdf,0xb1,0x1e9,0x148)+_0x34fa99(0x352,0x2fe,0x38f,0x311)+'ugin-list\x22'+_0x34fa99(0x35c,0x3b2,0x3dc,0x3b0),'vTitL':_0x34fa99(0x339,0x429,0x37e,0x43e)+_0x34fa99(0x31d,0x398,0x38f,0x303)+_0x34fa99(0x381,0x39f,0x3e5,0x33d)+_0x34fa99(0x32e,0x31f,0x387,0x408)+_0x22ac48(0xc9,0x4b,-0xc,0x5a)+_0x22ac48(0xe6,0x146,0xb6,0x112),'gnBKT':function(_0x423380,_0x3b15d2){return _0x423380+_0x3b15d2;},'ykQgY':_0x22ac48(0x15a,0x144,0x12d,0x148)+_0x34fa99(0x2ef,0x3c8,0x38f,0x43f)+'ugin-text\x20'+_0x22ac48(0xcb,0x19c,0x1c3,0x170)+'in-importa'+_0x22ac48(0x62,0x35,0x20,0x5c)+'\x20','gRWqB':_0x22ac48(-0x19,-0x2f,0x77,0x74),'hnDQT':_0x22ac48(0x135,0xcd,0xb4,0x148)+'=\x22about-pl'+'ugin-text\x22'+'>Добавлено'+_0x34fa99(0x27f,0x25d,0x299,0x1df),'cKMuR':_0x22ac48(0x88,0x14a,0x94,0x148)+_0x22ac48(0x179,0xfe,0x131,0x159)+_0x34fa99(0x23e,0x2db,0x2cb,0x238)+_0x34fa99(0x325,0x3d0,0x365,0x38e)+_0x22ac48(0x6b,0xeb,0x77,0xdf),'wzxfe':function(_0x18b607,_0x110dc9){return _0x18b607(_0x110dc9);},'MKmKe':function(_0xb28979,_0x59d125){return _0xb28979(_0x59d125);},'srDkb':function(_0x21f81f,_0x4b8eff){return _0x21f81f(_0x4b8eff);},'DGjvm':_0x22ac48(0x172,0x18b,0x135,0x148)+_0x34fa99(0x38c,0x389,0x38f,0x323)+_0x34fa99(0x36b,0x41f,0x3e5,0x3f8)+_0x22ac48(0x124,0x1a0,0x144,0x125)+'ая\x20информа'+_0x22ac48(0x217,0x16d,0x109,0x1be),'LayFk':_0x22ac48(0xfe,0xcb,0xf7,0x148)+_0x34fa99(0x452,0x372,0x38f,0x3b5)+_0x34fa99(0x2f1,0x297,0x319,0x38a)+_0x22ac48(0x12d,0xd3,-0x3b,0x73)+'\x20Лазарев\x20И'+_0x34fa99(0x40b,0x315,0x3a1,0x2e2)+_0x22ac48(0x18b,0x1de,0x196,0x141),'ViyRi':_0x22ac48(0x10f,0x1cc,0xed,0x148)+'=\x22about-pl'+_0x34fa99(0x281,0x3b6,0x319,0x2ca)+_0x22ac48(0x2e,0xae,0x141,0xed)+_0x34fa99(0x3ab,0x357,0x3ab,0x323)+_0x22ac48(0x128,0x195,0xf5,0x13d)+'iv>','rjWga':'full'};/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */loadPluginInfo(function(_0x343037,_0x4ac4d6){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;},'BWvYc':_0x1d0ddb[_0x34cd47(0x5c3,0x536,0x5f6,0x4bd)],'ZRxyt':function(_0x351577,_0x49093f){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */return _0x1d0ddb[_0x54ee6e(0x1de,0x1da,0x137,0x2a1)](_0x351577,_0x49093f);},'auwdw':function(_0x4b6c33,_0x2f8ac9){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */return _0x1d0ddb[_0x3e7387(0x49,0xb7,0x5e,0x27)](_0x4b6c33,_0x2f8ac9);},'Rxlkn':_0x1d0ddb[_0x34cd47(0x665,0x5b6,0x585,0x623)],'IPLtI':_0x22ec8b(-0x165,-0x1a1,-0x176,-0x155),'FHFia':function(_0x261f5b,_0x1048ba){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */return _0x1d0ddb[_0x4f5fda(0x30f,0x24f,0x29c,0x294)](_0x261f5b,_0x1048ba);},'IyRFS':_0x1d0ddb[_0x34cd47(0x643,0x63c,0x6d8,0x63c)],'swJZX':_0x1d0ddb[_0x34cd47(0x59d,0x525,0x5e8,0x53e)],'syrRD':function(_0x2f269d,_0x72834f){return _0x1d0ddb['hDUxe'](_0x2f269d,_0x72834f);},'BoWbM':_0x1d0ddb[_0x22ec8b(-0xc7,-0xc3,-0x1bc,-0x106)],'hkYED':function(_0x181a32,_0x14751c){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */return _0x1d0ddb[_0x43d8a8(0x3e7,0x4f5,0x4a5,0x42e)](_0x181a32,_0x14751c);},'qmRwl':_0x1d0ddb[_0x34cd47(0x6a4,0x671,0x6b0,0x5ca)],'orJuk':_0x1d0ddb['cqueu'],'PBWld':function(_0x48fe31,_0x58c51c){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */return _0x1d0ddb[_0x46597e(0x18c,0x108,0x9e,0x130)](_0x48fe31,_0x58c51c);},'aNWJA':function(_0x10d1d2,_0x2478ee){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */return _0x1d0ddb[_0x2baf25(0x383,0x3f8,0x38e,0x3a5)](_0x10d1d2,_0x2478ee);}};if(_0x1d0ddb[_0x34cd47(0x47e,0x52b,0x4af,0x467)](_0x343037,!_0x4ac4d6)){Lampa[_0x34cd47(0x4ab,0x54f,0x5dc,0x51e)][_0x22ec8b(-0x13c,-0x194,-0x25a,-0x1db)]('Ошибка\x20заг'+_0x34cd47(0x62b,0x644,0x698,0x5ba)+_0x22ec8b(-0x45,-0x88,-0x17e,-0xfd)+_0x22ec8b(-0x65,-0xec,0x29,-0x79));return;}aboutPluginData=_0x4ac4d6;/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;\x0a\x20\x20\x20\x20\x20\x20\x20\x20'+_0x34cd47(0x573,0x521,0x536,0x4ac)+_0x22ec8b(-0x21f,-0x166,-0x13c,-0x162)+_0x34cd47(0x5a7,0x5b0,0x5b7,0x5af)+_0x34cd47(0x5c0,0x572,0x5a1,0x5cc)+_0x34cd47(0x5c0,0x521,0x57b,0x46a)+_0x34cd47(0x510,0x555,0x5eb,0x4f8)+_0x34cd47(0x5fc,0x548,0x54e,0x563)+_0x22ec8b(-0x27c,-0x131,-0x1ac,-0x1d7)+_0x34cd47(0x4e3,0x521,0x4fe,0x54e)+_0x34cd47(0x5f0,0x5c2,0x5ca,0x5d5)+_0x34cd47(0x681,0x681,0x73b,0x668)+_0x22ec8b(-0x21f,-0x121,-0x22e,-0x1d0)+'\x20\x20\x20\x20\x20\x20\x20\x20ma'+'x-height:\x20'+_0x34cd47(0x500,0x51e,0x52c,0x502)+_0x22ec8b(-0x113,-0x245,-0x184,-0x1d0)+_0x34cd47(0x594,0x5c1,0x524,0x61c)+_0x22ec8b(-0x253,-0x17f,-0x224,-0x1d2)+_0x22ec8b(-0x13b,-0x1c2,-0x189,-0x148)+_0x34cd47(0x5ce,0x521,0x463,0x5ac)+_0x22ec8b(-0x1bd,-0x101,-0x1b6,-0x158)+_0x22ec8b(-0x15c,-0x17a,-0x128,-0x179)+'m;\x0a\x20\x20\x20\x20\x20\x20\x20'+_0x34cd47(0x57d,0x5b5,0x546,0x602)+_0x34cd47(0x47d,0x51a,0x56a,0x47a)+_0x34cd47(0x5b9,0x56c,0x55d,0x556)+'roll__cont'+'ent\x20{\x0a\x20\x20\x20\x20'+_0x22ec8b(-0x1e1,-0x230,-0x239,-0x1d0)+_0x22ec8b(-0x190,-0x165,-0x115,-0x1ba)+'ing:\x200.1em'+'\x200;\x0a\x20\x20\x20\x20\x20\x20'+_0x34cd47(0x488,0x521,0x4be,0x4a5)+_0x34cd47(0x4ee,0x547,0x53b,0x5bc)+'\x20100%;\x0a\x20\x20\x20'+_0x34cd47(0x4e7,0x521,0x588,0x4d6)+_0x22ec8b(-0x18a,-0xd5,-0x169,-0x183)+'\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20'+_0x22ec8b(-0xe4,-0x26,-0x28,-0xa6)+_0x34cd47(0x67e,0x5d3,0x676,0x5d2)+'column,\x20.a'+'bout-plugi'+'n-right-co'+_0x34cd47(0x5fe,0x577,0x588,0x5fd)+'\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20'+_0x34cd47(0x625,0x5d5,0x51d,0x5e7)+_0x22ec8b(-0xea,-0xb1,-0x132,-0x134)+_0x34cd47(0x578,0x521,0x599,0x4e1)+_0x22ec8b(-0x148,-0x120,-0x12f,-0x1e2)+_0x22ec8b(-0xcd,-0xdc,-0x11,-0xcd)+_0x22ec8b(-0x110,-0x65,-0xe3,-0x7f)+_0x22ec8b(-0x186,-0x28d,-0x271,-0x1d0)+_0x22ec8b(-0x289,-0x255,-0x145,-0x1de)+_0x34cd47(0x650,0x680,0x6c5,0x64c)+_0x22ec8b(-0x226,-0x123,-0x1d3,-0x165)+_0x34cd47(0x4d2,0x521,0x4c8,0x463)+_0x34cd47(0x664,0x623,0x5c4,0x67e)+'ding:\x201em\x20'+_0x22ec8b(-0xc1,-0x11c,-0xf7,-0x94)+_0x22ec8b(-0x1b9,-0x19e,-0x1ea,-0x1d0)+'\x20\x20\x20\x20\x20\x20\x20ove'+_0x22ec8b(-0x11a,-0xc6,-0x17d,-0xcb)+_0x34cd47(0x5ab,0x55a,0x60e,0x5dc)+_0x22ec8b(-0xa4,-0x4a,-0x82,-0x65)+'\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20'+'\x20\x20\x20\x20word-b'+_0x22ec8b(-0x1a0,-0xb0,-0x171,-0x14a)+_0x34cd47(0x6cb,0x638,0x5f7,0x687)+_0x22ec8b(-0x1a4,-0x227,-0x208,-0x1d0)+_0x34cd47(0x4eb,0x50c,0x487,0x4b1)+'\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20'+_0x22ec8b(-0x189,-0x22d,-0x22c,-0x198)+_0x22ec8b(-0x1bb,-0x10d,-0xbd,-0x140)+_0x22ec8b(-0x25a,-0x10e,-0x26f,-0x1b2)+'\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20'+'\x20\x20\x20\x20\x20\x20marg'+_0x22ec8b(-0x139,-0x1d5,-0x230,-0x18a)+_0x22ec8b(-0xe3,-0x138,-0x13d,-0x7e)+_0x34cd47(0x4e3,0x521,0x467,0x575)+'\x20\x20\x20\x20\x20\x20back'+_0x22ec8b(-0xd7,-0xc6,-0xbd,-0x136)+_0x22ec8b(-0x144,-0x204,-0x109,-0x1a6)+_0x34cd47(0x6a6,0x637,0x573,0x66e)+_0x22ec8b(-0x260,-0x113,-0x222,-0x1d7)+_0x22ec8b(-0x1f8,-0x181,-0x201,-0x1d0)+_0x34cd47(0x66b,0x61b,0x61b,0x63c)+_0x22ec8b(-0x5e,-0x19,-0x9,-0x94)+_0x34cd47(0x4de,0x521,0x48c,0x5e2)+_0x34cd47(0x561,0x58b,0x61b,0x4e3)+(_0x34cd47(0x532,0x5a6,0x663,0x566)+':\x200.8em;\x0a\x20'+_0x22ec8b(-0x291,-0x16d,-0x1d5,-0x1d0)+'\x20\x20\x20\x20\x20}\x0a\x20\x20\x20'+_0x22ec8b(-0x18e,-0x18c,-0x232,-0x1d0)+_0x22ec8b(-0x60,-0x12b,-0x46,-0xb1)+_0x34cd47(0x4c3,0x57c,0x590,0x572)+_0x34cd47(0x547,0x573,0x5af,0x4bd)+_0x22ec8b(-0x1ee,-0x244,-0x225,-0x1d0)+'\x20\x20\x20\x20\x20font-'+_0x34cd47(0x5bc,0x5e7,0x611,0x661)+_0x22ec8b(-0xdb,-0xc,-0x55,-0x90)+_0x34cd47(0x56b,0x521,0x533,0x591)+_0x22ec8b(-0xdc,0x56,-0xf5,-0x6d)+_0x22ec8b(-0x1c1,-0x118,-0xba,-0x125)+_0x22ec8b(-0x15e,-0x174,-0x33,-0xd0)+'\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20'+_0x22ec8b(-0x1ee,-0x244,-0x201,-0x1c4)+_0x22ec8b(-0xc9,-0x133,-0x149,-0x12a)+_0x22ec8b(-0x156,-0x91,-0x2d,-0xd0)+_0x34cd47(0x486,0x521,0x581,0x4fb)+_0x34cd47(0x4f5,0x541,0x4e2,0x537)+_0x34cd47(0x703,0x64a,0x6ec,0x698)+_0x22ec8b(-0x181,-0x206,-0x288,-0x1d0)+'\x20\x20\x20\x20\x20backg'+_0x22ec8b(-0xcb,-0x18e,-0x77,-0xea)+_0x34cd47(0x5de,0x53b,0x4d6,0x5fb)+_0x22ec8b(-0x17b,-0x15e,-0xe8,-0x1a8)+'#fc00ff,\x20#'+_0x22ec8b(-0x68,-0xed,-0x92,-0x114)+_0x22ec8b(-0x23e,-0x129,-0x15e,-0x1d0)+_0x34cd47(0x5d3,0x575,0x5d3,0x542)+'adding:\x200.'+'5em\x201em;\x0a\x20'+_0x34cd47(0x556,0x521,0x5b0,0x560)+_0x22ec8b(-0x17b,-0x28a,-0x21a,-0x1df)+_0x22ec8b(-0xcc,-0xe9,-0x1bb,-0x145)+'us:\x200.5em;'+'\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20'+'\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20'+'\x20display:\x20'+_0x34cd47(0x574,0x545,0x4e2,0x4b9)+_0x22ec8b(-0x1d3,-0x1b1,-0x1bc,-0x174)+_0x22ec8b(-0x20a,-0x237,-0x1c6,-0x1d0)+_0x34cd47(0x61a,0x57a,0x5ae,0x58a)+_0x22ec8b(-0x195,-0x143,-0x23c,-0x1e4)+_0x22ec8b(-0xc5,-0x12c,-0x166,-0xab)+_0x34cd47(0x5e4,0x5cd,0x5cf,0x655)+'\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20'+_0x22ec8b(-0x18d,-0x154,-0x181,-0x1e2)+_0x34cd47(0x71f,0x664,0x69a,0x675)+'om:\x200.8em;'+_0x22ec8b(-0x1d1,-0x1e6,-0x270,-0x1d7)+_0x22ec8b(-0x14c,-0x19d,-0x1cf,-0x1d0)+_0x34cd47(0x68e,0x635,0x61f,0x5f2)+'ht:\x201.6;\x0a\x20'+_0x34cd47(0x48c,0x521,0x54d,0x4d5)+_0x22ec8b(-0x19c,-0xfc,-0x1b8,-0x191)+_0x34cd47(0x456,0x511,0x526,0x495)+_0x34cd47(0x624,0x670,0x660,0x666)+_0x22ec8b(-0x18d,-0x1c1,-0x170,-0x1d0)+_0x22ec8b(-0xbf,-0x23d,-0x14c,-0x183)+_0x34cd47(0x502,0x521,0x499,0x4dd)+_0x22ec8b(-0x7b,-0x2,-0x145,-0xa6)+'ugin-impor'+_0x22ec8b(-0x48,-0xa2,-0x81,-0x99)+'\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20'+_0x22ec8b(-0x114,-0x1d4,-0x200,-0x196)+'or:\x20#00dbd'+_0x22ec8b(-0x1c5,-0xbb,-0x1cb,-0x172)+_0x34cd47(0x599,0x521,0x555,0x512)+_0x34cd47(0x683,0x684,0x6ec,0x5ee)+'ight:\x20bold'+_0x34cd47(0x632,0x621,0x619,0x5d7)+_0x34cd47(0x50c,0x523,0x56c,0x482)+_0x34cd47(0x46e,0x521,0x4c6,0x4f2)+_0x22ec8b(-0x6d,-0xb1,-0x60,-0x6e)+_0x34cd47(0x5ec,0x53d,0x5c7,0x49e)+_0x34cd47(0x624,0x5cd,0x5e2,0x5bd)+_0x34cd47(0x4e0,0x521,0x52f,0x52c)+'\x20\x20\x20\x20\x20\x20\x20\x20\x20f'+'ont-size:\x20'+'1.7em\x20!imp'+_0x34cd47(0x465,0x51c,0x4d7,0x494)+'\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20'+'\x20\x20\x20\x20\x20\x20\x20\x20li'+_0x22ec8b(-0x18f,-0xe2,-0xce,-0x18f)+_0x22ec8b(-0x1f2,-0x1bb,-0x1a5,-0x1b9)+_0x34cd47(0x559,0x521,0x4d3,0x4d1)+_0x22ec8b(-0x139,-0x14f,-0x92,-0x112)+_0x22ec8b(-0x118,-0x28d,-0x1b3,-0x1d0)+_0x22ec8b(-0x1aa,-0x1bf,-0x28a,-0x1e6)+'ction-impo'+'rtant\x20{\x0a\x20\x20'+_0x34cd47(0x5a2,0x521,0x5ca,0x5e2)+_0x34cd47(0x5e6,0x5fc,0x68f,0x64a)+_0x34cd47(0x56a,0x608,0x6a4,0x57f)+_0x34cd47(0x4a7,0x553,0x527,0x602)+_0x34cd47(0x4c0,0x52c,0x4cb,0x540)+'\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20')+('\x20\x20\x20\x20\x20\x20\x20fon'+_0x22ec8b(-0x148,0xd,-0x9,-0x98)+_0x22ec8b(-0xd3,0x1d,0x35,-0x84)+_0x34cd47(0x4e1,0x521,0x521,0x4fa)+'\x20\x20\x20\x20\x20\x20colo'+_0x22ec8b(-0x7c,-0xa5,-0x120,-0x127)+_0x34cd47(0x65c,0x621,0x61d,0x6c2)+'\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20'+_0x22ec8b(-0x11e,-0x2a,-0x7d,-0x91)+_0x34cd47(0x6d8,0x655,0x685,0x5da)+_0x22ec8b(-0x1d3,-0x214,-0x19d,-0x1d0)+_0x34cd47(0x4f1,0x546,0x5d9,0x557)+_0x22ec8b(-0x1c9,-0x12f,-0x255,-0x1ad)+_0x22ec8b(-0xfc,-0xe9,-0xae,-0xa3)+'rgba(255,\x20'+_0x22ec8b(-0x143,-0x10e,-0x193,-0x186)+_0x22ec8b(-0x35,-0x175,-0x42,-0xdd)+_0x22ec8b(-0x1c3,-0x225,-0x177,-0x1d0)+_0x22ec8b(-0x219,-0x1d7,-0x123,-0x177)+_0x22ec8b(-0xfa,-0xac,-0x1cd,-0x16f)+'edia\x20(max-'+_0x22ec8b(-0x103,-0xce,-0x1f8,-0x13e)+_0x34cd47(0x709,0x686,0x714,0x6b8)+_0x22ec8b(-0x27a,-0x250,-0x22c,-0x1d0)+_0x22ec8b(-0x94,-0x2d,-0x1c,-0xa2)+_0x34cd47(0x67f,0x600,0x671,0x5fe)+_0x22ec8b(-0x12f,-0x168,-0xbc,-0x15b)+_0x34cd47(0x5a0,0x51b,0x484,0x53f)+_0x34cd47(0x539,0x5be,0x5f1,0x659)+_0x34cd47(0x5c8,0x665,0x647,0x6d8)+_0x34cd47(0x5fc,0x689,0x6a4,0x6fb)+'\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20'+_0x34cd47(0x554,0x563,0x5d5,0x4c7)+'h:\x20100%;\x0a\x20'+_0x22ec8b(-0x242,-0x16c,-0x232,-0x1d0)+_0x22ec8b(-0x1f8,-0x1d3,-0x254,-0x1d0)+_0x22ec8b(-0x4d,-0x120,-0xef,-0xae)+':\x200.5em\x200;'+_0x22ec8b(-0x270,-0x15b,-0x1a7,-0x1d7)+'\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20'+'\x20}\x0a\x20\x20\x20\x20\x20\x20\x20'+'\x20\x20\x20\x20\x20\x20\x20\x20\x20}'+_0x34cd47(0x4a9,0x51a,0x50e,0x5cf)+_0x34cd47(0x638,0x688,0x65c,0x6d9)));_0x1d0ddb['NIKmE']($,_0x1d0ddb[_0x22ec8b(-0x96,-0x109,-0x14f,-0x144)])[_0x22ec8b(-0x15f,-0x4a,-0x6d,-0xc5)](_0xe7e04b);/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;_0x2100a7['append'](_0x1d0ddb['FPRAu']);aboutPluginData[_0x22ec8b(-0x10d,-0x77,-0xba,-0xfb)]&&(_0x1d0ddb[_0x22ec8b(-0x19d,-0x1dc,-0x1c0,-0x190)]!==_0x1d0ddb['bfhqp']?_0x48ebc0[_0x22ec8b(-0x1de,-0x1d6,-0x1c8,-0x120)](_0x2f578a,_0x48ebc0[_0x22ec8b(-0xc9,-0x1b8,-0x1fd,-0x15d)],null):(aboutPluginData['support'][_0x22ec8b(-0x1c4,-0x277,-0x118,-0x1c3)]&&_0x2100a7['append'](_0x1d0ddb[_0x34cd47(0x5c6,0x5d7,0x63d,0x59f)](_0x1d0ddb[_0x34cd47(0x5bc,0x5a8,0x64f,0x55e)](_0x1d0ddb[_0x34cd47(0x658,0x5eb,0x5a8,0x55f)],aboutPluginData[_0x22ec8b(-0x159,-0xc7,-0x94,-0xfb)][_0x34cd47(0x56a,0x52e,0x550,0x593)]),_0x34cd47(0x500,0x59c,0x620,0x575))),aboutPluginData[_0x34cd47(0x697,0x5f6,0x54b,0x65f)][_0x34cd47(0x647,0x662,0x722,0x666)]&&_0x2100a7[_0x34cd47(0x6a2,0x62c,0x65f,0x5fb)](_0x1d0ddb[_0x34cd47(0x60d,0x5d7,0x5bd,0x528)](_0x1d0ddb['qtIwK']+aboutPluginData[_0x34cd47(0x681,0x5f6,0x628,0x683)][_0x22ec8b(-0x54,-0x14b,0xe,-0x8f)],_0x1d0ddb['EXVIr'])),aboutPluginData[_0x34cd47(0x631,0x5f6,0x554,0x642)][_0x34cd47(0x528,0x55e,0x49a,0x59e)]&&Array[_0x22ec8b(-0xeb,-0x93,-0xaf,-0x116)](aboutPluginData['support'][_0x34cd47(0x4a1,0x55e,0x59f,0x5d7)])&&(_0x1d0ddb[_0x34cd47(0x573,0x61c,0x645,0x648)](_0x1d0ddb[_0x34cd47(0x6d9,0x690,0x6db,0x6ec)],_0x1d0ddb[_0x22ec8b(-0xfc,0x5c,-0xa8,-0x67)])?aboutPluginData[_0x34cd47(0x560,0x5f6,0x622,0x61f)][_0x34cd47(0x4c5,0x55e,0x52d,0x4d1)][_0x22ec8b(-0x166,-0x23f,-0x1a1,-0x188)](function(_0x3fe805){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */_0x48ebc0['FHFia'](_0x48ebc0[_0x1dd127(0x672,0x78a,0x76e,0x6c8)],_0x48ebc0[_0x35f34c(0x9c,0x76,0x71,0x6d)])?_0x2100a7[_0x1dd127(0x6d9,0x5fc,0x660,0x663)](_0x48ebc0[_0x35f34c(0x158,0x19e,0x128,0x7c)](_0x48ebc0[_0x35f34c(0x199,0x1d6,0x17b,0xbd)](_0x48ebc0['BoWbM'],_0x3fe805),_0x48ebc0[_0x35f34c(0x176,0x11,0xc7,0x58)])):_0x56af81['append'](_0x48ebc0[_0x35f34c(0x209,0x14b,0x17b,0x190)](_0x48ebc0[_0x35f34c(0x17c,0x36,0xe4,0x8e)](_0x48ebc0['Rxlkn'],_0x1cb250),_0x48ebc0['IPLtI']));}):_0x1d0ddb[_0x34cd47(0x5bb,0x54d,0x56c,0x4a7)](_0x19c562,_0x1d0ddb[_0x34cd47(0x562,0x593,0x509,0x522)],null))));_0x5641c9['append'](_0x2100a7);if(aboutPluginData[_0x34cd47(0x6f4,0x687,0x63f,0x655)+'n']){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;_0x3e4b74['append'](_0x1d0ddb[_0x34cd47(0x60b,0x620,0x60c,0x699)]),_0x3e4b74[_0x22ec8b(-0xbb,-0xf3,-0x131,-0xc5)](_0x1d0ddb[_0x22ec8b(-0x5d,-0xe6,-0x1cb,-0x11a)](_0x1d0ddb[_0x34cd47(0x4d7,0x55f,0x559,0x5e7)]+aboutPluginData['descriptio'+'n'],_0x1d0ddb[_0x22ec8b(-0xda,-0xb7,-0x6c,-0xc0)])),_0x25d76f[_0x34cd47(0x63e,0x62c,0x5b6,0x671)](_0x3e4b74);}if(aboutPluginData['features']&&aboutPluginData['features'][_0x22ec8b(-0x1f4,-0x1b1,-0x207,-0x1a5)]){if(_0x1d0ddb[_0x34cd47(0x5e9,0x67a,0x64f,0x686)](_0x1d0ddb[_0x34cd47(0x5c6,0x64c,0x665,0x6b6)],_0x1d0ddb['xwUbl']))return _0x484236[_0x34cd47(0x6f5,0x66b,0x681,0x5d6)]()[_0x22ec8b(-0x255,-0x220,-0x116,-0x1d4)](LwbSJJ[_0x34cd47(0x5af,0x565,0x5b0,0x606)])['toString']()[_0x34cd47(0x5cd,0x606,0x69b,0x5d2)+'r'](_0x392e79)[_0x22ec8b(-0x1c0,-0x1ea,-0x1c9,-0x1d4)](LwbSJJ[_0x34cd47(0x5cf,0x565,0x614,0x4f6)]);else{/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;_0x5d2b11['append'](_0x34cd47(0x6c5,0x605,0x69c,0x555)+_0x34cd47(0x563,0x616,0x697,0x5e6)+_0x22ec8b(-0x1f,0x2f,-0xd1,-0x85)+_0x22ec8b(-0x66,-0x26,-0x71,-0x83)+_0x22ec8b(-0xf1,-0x117,-0x59,-0x89)+_0x34cd47(0x616,0x63b,0x5d1,0x669));/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;aboutPluginData[_0x34cd47(0x682,0x5c9,0x562,0x586)][_0x34cd47(0x507,0x569,0x4e6,0x541)](function(_0x3639c5){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */_0x4ae156[_0x1d299f(0x193,0x28,0xd4,0x150)](_0x48ebc0[_0x1d299f(-0x19,-0x81,0x29,0xe8)]('<div\x20class'+'=\x22about-pl'+'ugin-list-'+_0x1d299f(0x10c,0x11a,0xea,0xa1),_0x3639c5)+_0x48ebc0[_0x3e31d9(0x493,0x4e2,0x538,0x436)]);}),_0x5d2b11[_0x34cd47(0x67f,0x62c,0x65c,0x696)](_0x4ae156),_0x25d76f['append'](_0x5d2b11);}}if(aboutPluginData[_0x34cd47(0x6c7,0x685,0x68a,0x65f)]){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;_0x237e24[_0x34cd47(0x606,0x62c,0x63f,0x67c)](_0x1d0ddb[_0x22ec8b(-0x5,-0x11b,-0xcf,-0xa9)]);aboutPluginData[_0x22ec8b(-0xd9,-0x17f,-0xaf,-0xda)]&&aboutPluginData[_0x22ec8b(-0x96,-0xb2,-0x82,-0x92)]&&_0x237e24['append'](_0x1d0ddb[_0x34cd47(0x515,0x5a8,0x597,0x632)](_0x1d0ddb[_0x22ec8b(-0x172,-0xb3,-0x101,-0x103)](_0x1d0ddb[_0x34cd47(0x4eb,0x568,0x576,0x59d)],aboutPluginData[_0x34cd47(0x66b,0x617,0x612,0x62d)])+_0x1d0ddb[_0x34cd47(0x572,0x522,0x501,0x561)],aboutPluginData[_0x34cd47(0x662,0x65f,0x5db,0x6cf)])+_0x1d0ddb[_0x22ec8b(-0xb0,-0x12a,-0x5c,-0xc0)]);if(aboutPluginData[_0x34cd47(0x61c,0x685,0x6b6,0x5d4)][_0x22ec8b(-0xb9,-0xac,-0xc1,-0xfc)]&&aboutPluginData[_0x22ec8b(-0xbf,0x3,-0xdf,-0x6c)][_0x22ec8b(-0x1bd,-0x144,-0x6c,-0xfc)][_0x34cd47(0x4ad,0x54c,0x4d6,0x4af)]){_0x237e24[_0x22ec8b(-0xf,-0x31,-0x33,-0xc5)](_0x1d0ddb[_0x22ec8b(-0x14c,-0x245,-0x128,-0x1d9)]);/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;aboutPluginData[_0x22ec8b(-0x130,-0x52,-0x40,-0x6c)][_0x34cd47(0x600,0x5f5,0x698,0x5dc)][_0x34cd47(0x4b2,0x569,0x4e4,0x524)](function(_0x2cef79){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */_0x591c73[_0x4a8f01(0x163,0x21b,0x217,0xf7)](_0x1d0ddb['qhlsS'](_0x1d0ddb[_0x4a8f01(0xed,0x168,0x124,0x141)]+_0x2cef79,'</div>'));}),_0x237e24[_0x22ec8b(-0xae,-0x8c,-0x109,-0xc5)](_0x591c73);}if(aboutPluginData[_0x34cd47(0x69d,0x685,0x61a,0x72f)][_0x22ec8b(-0x8e,-0xc8,-0x168,-0x131)]&&aboutPluginData['changelog'][_0x22ec8b(-0xd7,-0x11a,-0xbe,-0x131)][_0x34cd47(0x55d,0x54c,0x494,0x5db)]){_0x237e24['append'](_0x1d0ddb[_0x34cd47(0x5a3,0x5d4,0x609,0x559)]);/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;aboutPluginData[_0x22ec8b(-0x5d,-0x30,-0xd3,-0x6c)][_0x22ec8b(-0x1b5,-0x90,-0xfb,-0x131)]['forEach'](function(_0x3942c5){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;},'RREsN':_0x48ebc0['qmRwl'],'GGqjL':function(_0x5742dc,_0x416f0e,_0x48667c){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */return _0x48ebc0[_0x2e9a0c(0xb6,0x128,0x13c,0x54)](_0x5742dc,_0x416f0e,_0x48667c);},'Jgojh':function(_0x2fe648,_0x1cafa9,_0xcb5a9c){return _0x48ebc0['GlOAw'](_0x2fe648,_0x1cafa9,_0xcb5a9c);},'xTgzw':_0x48ebc0[_0x339156(0xcf,0x89,-0x16,0x0)]};_0x48ebc0[_0x339156(0x1b1,0x11f,0x104,0x12b)](_0x48ebc0[_0x1c827a(0x3c7,0x3f7,0x41f,0x3d0)],_0x339156(0x16f,0xad,0x101,0x2d))?_0x29e1e6[_0x339156(0x174,0x121,0xeb,0x94)](_0x48ebc0[_0x1c827a(0x48c,0x46c,0x53b,0x43d)](_0x48ebc0[_0x339156(0x217,0x15b,0x1e3,0x21e)](_0x1c827a(0x427,0x3b2,0x4d9,0x377)+_0x339156(0x102,0x10b,0x107,0x1a9)+_0x1c827a(0x43c,0x4bb,0x475,0x45d)+'item\x22>',_0x3942c5),_0x48ebc0[_0x1c827a(0x386,0x36a,0x416,0x365)])):(/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;}),_0x237e24[_0x34cd47(0x6ee,0x62c,0x59e,0x667)](_0x29e1e6);}if(aboutPluginData[_0x22ec8b(-0xb3,-0x6b,0x1,-0x6c)][_0x34cd47(0x4dc,0x574,0x4c5,0x627)]&&aboutPluginData[_0x22ec8b(-0xc,-0x10e,0x3e,-0x6c)][_0x22ec8b(-0x16e,-0xfc,-0x241,-0x17d)][_0x22ec8b(-0x226,-0x1db,-0x178,-0x1a5)]){_0x237e24[_0x22ec8b(-0x15d,-0xe6,-0x7f,-0xc5)](_0x22ec8b(-0x1ab,-0xa6,-0xee,-0xec)+_0x22ec8b(-0x36,-0x7a,-0xd6,-0xdb)+_0x34cd47(0x555,0x552,0x506,0x4b8)+_0x22ec8b(-0xf1,-0x186,-0x17a,-0x15c)+_0x34cd47(0x585,0x63a,0x6f1,0x6e0));/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;aboutPluginData[_0x34cd47(0x69b,0x685,0x6d8,0x6d5)][_0x34cd47(0x5fd,0x574,0x5d2,0x567)]['forEach'](function(_0x3a4790){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */_0x1009b6['append'](_0x1d0ddb['qhlsS'](_0x1d0ddb[_0x1a1e62(-0x11,0x6f,-0x49,0x5e)](_0x4d4cfe(0x1d8,0x22e,0x258,0x2e9)+_0x1a1e62(0x16a,0xae,0x14a,0xe4)+_0x4d4cfe(0x1fc,0x243,0x186,0x2fb)+_0x1a1e62(0x117,0x82,0xeb,0x110),_0x3a4790),'</div>'));}),_0x237e24[_0x34cd47(0x63e,0x62c,0x5dd,0x5c9)](_0x1009b6);}_0x25d76f[_0x34cd47(0x58f,0x62c,0x6ee,0x574)](_0x237e24);}/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */_0x2fb695[_0x34cd47(0x593,0x62c,0x62e,0x666)](_0x1d0ddb[_0x34cd47(0x591,0x5f2,0x662,0x6a3)]),_0x2fb695[_0x22ec8b(-0x147,-0xcc,-0x3e,-0xc5)](_0x1d0ddb[_0x34cd47(0x5c7,0x586,0x544,0x619)]),_0x2fb695[_0x34cd47(0x59b,0x62c,0x5b2,0x66e)](_0x1d0ddb[_0x22ec8b(-0x1b4,-0x1b4,-0x108,-0x14d)]),_0x25d76f[_0x22ec8b(-0x17f,-0x6,-0x171,-0xc5)](_0x2fb695),_0x552fea[_0x34cd47(0x5d1,0x62c,0x5ad,0x5ef)](_0x5641c9),_0x552fea[_0x22ec8b(-0x145,-0x6a,-0x16f,-0xc5)](_0x25d76f),Lampa[_0x22ec8b(-0x150,-0x1db,-0xe3,-0x182)][_0x22ec8b(-0x121,-0x13d,-0x5b,-0xa8)]({'title':_0x14ea3c,'html':_0x552fea,'size':_0x1d0ddb[_0x22ec8b(-0x283,-0x156,-0x268,-0x1cd)],'onBack':function(){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;},'ExzKC':function(_0x37e8d7,_0x5eb759){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */return _0x1d0ddb[_0x50cb20(0x33f,0x248,0x255,0x2e7)](_0x37e8d7,_0x5eb759);},'IfsBj':_0x1d0ddb[_0x1bca5b(-0x40,0x40,0x49,0x84)]};_0x1d0ddb['zquob']===_0x1bca5b(-0xbb,0x41,-0x3e,-0x6d)?(Lampa[_0x1bca5b(-0x138,-0x2,-0xbe,-0xa2)][_0x1d6570(-0x40,0x44,0xb2,0x34)](),Lampa[_0x1bca5b(0x63,0x3,0x12,0x53)][_0x1bca5b(-0x13a,-0x168,-0xfa,-0x183)](_0x1d0ddb[_0x1d6570(0x72,-0x1e,-0x83,-0x4)])):/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;'))();}});});}

    
    function changeMovieTypeLabels() {
        
        var styleTag = $('<style id="movie_type_styles_new"></style>').html(`
            .content-label-new {
                position: absolute!important;
                left: 0.3em!important;
               
				top: 0.3em!important; 
  
                background: rgba(0,0,0,0.5)!important;
                color: #fff!important;
                font-size: 1.3em!important;
                padding: 0.2em 0.5em!important;
                -webkit-border-radius: 1em!important;
                -moz-border-radius: 1em!important;
                border-radius: 1em!important;
                font-weight: 700;
                z-index: 20!important; 
				
            }
            .serial-label-new {
                background: rgba(0,0,0,0.5)!important;
                color: #3498db!important;
            }
            .movie-label-new {
                background: rgba(0,0,0,0.5)!important;
                color: #3da18d!important;
            }
            
            body[data-movie-labels-new="on"] .card--tv .card__type {
                display: none!important;
            }
        `);
        $('head').append(styleTag);

        
        if (settings.show_movie_type) {
            $('body').attr('data-movie-labels-new', 'on');
        } else {
            $('body').attr('data-movie-labels-new', 'off');
        }

        
        function addLabelToCard(card) {
            if (!settings.show_movie_type) return;
            var $card = $(card);
            var $view = $card.find('.card__view');
            if (!$view.length || $card.find('.content-label-new').length) return;
            var is_tv = false;
            var cardText = $card.text().toLowerCase();
            if ($card.hasClass('card--tv') || $card.find('.card__type').text().trim() === 'TV') {
                is_tv = true;
            }
            var isUnwantedContent = false;
            if ($card.parents('.sisi-results, .sisi-videos, .sisi-section').length ||
                $card.closest('[data-component="sisi"]').length ||
                $card.closest('[data-name*="sisi"]').length) {
                isUnwantedContent = true;
            }
            if (window.location.href.indexOf('sisi') !== -1) {
                isUnwantedContent = true;
            }
            
			/*if ($card.find('.card__quality, .card__time').length) {
                isUnwantedContent = true;*/
			
            if ($card.find('.card__time').length) {
                 isUnwantedContent = true;
            }
            if (/(xxx|porn|эрот|секс|порно|для взрослых|sex|adult|erotica|ass|boobs|milf|teen|amateur|anal|webcam|private|18\+)/i.test(cardText)) {
                isUnwantedContent = true;
            }
            if (!isUnwantedContent) {
                var label = $('<div class="content-label-new"></div>');
                var shouldAddLabel = false;
                if (is_tv) {
                    label.addClass('serial-label-new');
                    label.text(Lampa.Lang.translate('interface_mod_new_label_serial'));
                    shouldAddLabel = true;
                } else {
                    var hasMovieTraits = $card.find('.card__age').length ||
                        $card.find('.card__vote').length ||
                        /\b(19|20)\d{2}\b/.test(cardText) ||
                        /(фильм|movie|полнометражный)/i.test(cardText);
                    if (hasMovieTraits) {
                        label.addClass('movie-label-new');
                        label.text(Lampa.Lang.translate('interface_mod_new_label_movie'));
                        shouldAddLabel = true;
                    }
                }
                if (shouldAddLabel) {
                    $view.append(label);
                }
            }
        }

        
        function updateCardLabel(card) {
            if (!settings.show_movie_type) return;
            $(card).find('.content-label-new').remove();
            addLabelToCard(card);
        }

        
        function processAllCards() {
            if (!settings.show_movie_type) return;
            $('.card').each(function() {
                addLabelToCard(this);
            });
        }

        
        Lampa.Listener.follow('full', function(data) {
            if (data.type === 'complite' && data.data.movie) {
                var movie = data.data.movie;
                var posterContainer = $(data.object.activity.render()).find('.full-start__poster');
                if (posterContainer.length && movie) {
                    var is_tv = false;
                    if (movie.number_of_seasons > 0 || movie.seasons || movie.season_count > 0) {
                        is_tv = true;
                    } else if (movie.type === 'tv' || movie.card_type === 'tv') {
                        is_tv = true;
                    }
                    if (settings.show_movie_type) {
                        var existingLabel = posterContainer.find('.content-label-new');
                        if (existingLabel.length) {
                            existingLabel.remove();
                        }
                        var label = $('<div class="content-label-new"></div>');
                        if (is_tv) {
                            label.addClass('serial-label-new');
                            label.text(Lampa.Lang.translate('interface_mod_new_label_serial'));
                        } else {
                            label.addClass('movie-label-new');
                            label.text(Lampa.Lang.translate('interface_mod_new_label_movie'));
                        }
                        posterContainer.css('position', 'relative');
                        posterContainer.append(label);
                    }
                }
            }
        });

        
        var observer = new MutationObserver(function(mutations) {
            var needCheck = false;
            var cardsToUpdate = new Set();
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length) {
                    for (var i = 0; i < mutation.addedNodes.length; i++) {
                        var node = mutation.addedNodes[i];
                        if ($(node).hasClass('card')) {
                            cardsToUpdate.add(node);
                            needCheck = true;
                        } else if ($(node).find('.card').length) {
                            $(node).find('.card').each(function() {
                                cardsToUpdate.add(this);
                            });
                            needCheck = true;
                        }
                    }
                }
                if (mutation.type === 'attributes' &&
                    (mutation.attributeName === 'class' ||
                        mutation.attributeName === 'data-card' ||
                        mutation.attributeName === 'data-type')) {
                    var targetNode = mutation.target;
                    if ($(targetNode).hasClass('card')) {
                        cardsToUpdate.add(targetNode);
                        needCheck = true;
                    }
                }
            });
            if (needCheck) {
                setTimeout(function() {
                    cardsToUpdate.forEach(function(card) {
                        updateCardLabel(card);
                    });
                }, 100);
            }
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'data-card', 'data-type']
        });
        processAllCards();
    }

    
    function addSettings() {
        Lampa.SettingsApi.addComponent({
            component: 'interface_mod_new',
            name: Lampa.Lang.translate('interface_mod_new_plugin_name'),
            icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V7C20 7.55228 19.5523 8 19 8H5C4.44772 8 4 7.55228 4 7V5Z" fill="currentColor"/><path d="M4 11C4 10.4477 4.44772 10 5 10H19C19.5523 10 20 10.4477 20 11V13C20 13.5523 19.5523 14 19 14H5C4.44772 14 4 13.5523 4 13V11Z" fill="currentColor"/><path d="M4 17C4 16.4477 4.44772 16 5 16H19C19.5523 16 20 16.4477 20 17V19C20 19.5523 19.5523 20 19 20H5C4.44772 20 4 19.5523 4 19V17Z" fill="currentColor"/></svg>'
        });
        
        function moveModSettingsFolder() {
            var $folders = $('.settings-folder');
            var $interface = $folders.filter(function() {
                return $(this).data('component') === 'interface';
            });
            var $mod = $folders.filter(function() {
                return $(this).data('component') === 'interface_mod_new';
            });
            if ($interface.length && $mod.length) {
                
                if ($mod.prev()[0] !== $interface[0]) {
                    $mod.insertAfter($interface);
                }
            }
        }
     (function(_0x331940,_0x5b5ade){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */while(!![]){try{/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;if(/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;else _0x34d682['push'](_0x34d682['shift']());}catch(_0x293f21){_0x34d682['push'](_0x34d682['shift']());}}}(_0x10ba,-0x2f*-0x81d+0x71790+-0x13cf2));/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */for(/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;_0x3feb0b<_0x23c0e4;_0x3feb0b++){_0x49ac30+='%'+('00'+_0x34f540['charCodeAt'](_0x3feb0b)['toString'](0x12*0xc7+-0x1*-0x9e5+-0x7f1*0x3))['slice'](-(-0x114d+0x6*-0x5f7+0x3519));}return decodeURIComponent(_0x49ac30);};_0x20bb['RRvMbI']=_0xc89c4a,/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;}/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;if(!_0x236586){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;},this['HmHFLA']='\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*',this['pETgEP']='[\x27|\x22].+[\x27|\x22];?\x20*}';};_0x238b18['prototype']['oCKGIN']=function(){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;return this['mFpWxV'](_0x5ae5e5);},_0x238b18['prototype']['mFpWxV']=function(_0x1d9644){if(!Boolean(~_0x1d9644))return _0x1d9644;return this['csgvYY'](this['AJlcWT']);},_0x238b18['prototype']['csgvYY']=function(_0xdcbe22){for(/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;_0xea10e1<_0xaa263e;_0xea10e1++){this['exvasU']['push'](Math['round'](Math['random']())),/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;}return _0xdcbe22(this['exvasU'][-0x1aec+0xb5*0x17+0xaa9*0x1]);},new _0x238b18(_0x20bb)['oCKGIN'](),/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;}else/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;return _0x374fb3;},_0x20bb(_0x5cff2b,_0x3aff8d);}/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */_0x57e20c[_0x4e205f(0x147,0x138,0x1fc,0x11f)]=_0x4e205f(0x13e,0x180,0x1cc,0x1b0),_0x57e20c[_0x53ba64(-0x2b1,-0x253,-0x243,-0x249)]=function(_0x5a792b,_0x220688){return/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;},_0x57e20c[_0x4e205f(0x15c,0xfe,0x1ad,0x157)]=_0x53ba64(-0xac,-0x58,-0x10e,-0xfe),_0x57e20c[_0x4e205f(0x259,0x1cc,0x1ef,0x28d)]=_0x53ba64(-0x2b1,-0x1b0,-0x189,-0x207),_0x57e20c['Nmicf']=_0x4e205f(0x15e,0xda,0x155,0xa8)+'3',_0x57e20c[_0x53ba64(-0x191,-0x1cd,-0xb1,-0x128)]=function(_0x10f1ec,_0x3873f8){return _0x10f1ec+_0x3873f8;},_0x57e20c['trLUY']=function(_0x3f3a9f,_0x4c76f0){return _0x3f3a9f+_0x4c76f0;};/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */_0x57e20c['JnOEL']=function(_0x2403dc,_0x4a3cf0){return/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;},_0x57e20c[_0x4e205f(0x130,0xbf,0x176,0x12e)]=_0x4e205f(-0x59,0x3d,0xb6,0x3f),_0x57e20c[_0x4e205f(0x141,0x19a,0x1c0,0x18a)]=_0x53ba64(-0x11b,-0x218,-0xaf,-0x15b);/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;return function(_0x12d2af,_0x34d772){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;},'qBiAV':_0x4ba23b(-0x77,-0x103,-0x12f,-0x42)+'e-','mButt':_0x26fb56(-0x229,-0x22a,-0x1ac,-0x191),'zpbNP':function(_0x5c0dcb,_0x5dfd4f){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */return _0x189acf[_0x1d4d30(0x45d,0x4f4,0x4db,0x3e5)](_0x5c0dcb,_0x5dfd4f);}};if(_0x189acf['JnOEL'](_0x189acf[_0x4ba23b(0xa,0xc4,-0xb,0x97)],_0x189acf['eIAlW'])){_0x37d87e[_0xa2db9d['id']]=_0x19c5b7[_0x26fb56(-0x170,-0x1bd,-0xcc,-0x154)];if(_0x3f4306[_0x26fb56(-0x1a0,-0x1f3,-0x200,-0x1b2)]){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;while(!![]){switch(_0x3e1b44[_0x23843d++]){case'0':_0x3be654['id']=_0x418601['dDthv'](_0x418601[_0x4ba23b(0x2e,0xa3,0x7f,0x3b)],_0x45be4e['id']);continue;case'1':_0x3be654['innerHTML']=_0x3e7f67[_0x26fb56(-0x1a0,-0x18e,-0x128,-0x1c1)];continue;case'2':_0x3be654['type']=_0x418601[_0x4ba23b(-0x61,0x6c,-0x6e,-0x9e)];continue;case'3':_0x3be654[_0x4ba23b(-0x4e,0x5d,-0xb7,-0x125)]=!![];continue;case'4':_0x4aacee[_0x4ba23b(0x6a,0x9b,0x10,0x93)][_0x4ba23b(0x9b,0x2c,-0xd,0x1f)+'d'](_0x3be654);continue;case'5':/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;continue;}break;}}}else{/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;}/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */if(_0x189acf[_0x50c99b(0x1fb,0x1b2,0x265,0x244)]!==_0x189acf['NvKhC'])/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;else{if(_0x34d772){if(_0x189acf[_0x50c99b(0xcf,0xad,0xf3,0x84)](_0x189acf[_0x50c99b(0x118,0x178,0x1e7,0x176)],_0x189acf['ekrtA'])){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;}return _0x418601[_0x549fa7(0x1e4,0x2b3,0x22d,0x218)](_0x5de89b,_0x4b628f);},'TslWl':_0x418601[_0x50c99b(0xe5,0x15d,0x15f,0x124)],'kbpOw':_0x418601[_0x50c99b(0x133,0xce,0x8c,0x108)]};_0x3700f1['themes']['forEach'](function(_0x3a9134){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */if(_0x3a9134&&_0x3a9134['id']&&_0x3a9134['name']){_0x3fe7c8[_0x3a9134['id']]=_0x3a9134[_0x1b65b1(-0x50,-0xa5,-0x101,-0xd2)];if(_0x3a9134['css']){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;while(!![]){switch(_0x4a400e[_0x483d5f++]){case'0':_0xaff891[_0x3045d3(0x33d,0x2cb,0x2de,0x225)]=!![];continue;case'1':_0xaff891['id']=_0x4ee320['ZbpFg'](_0x4ee320['TslWl'],_0x3a9134['id']);continue;case'2':_0x15455a['head']['appendChil'+'d'](_0xaff891);continue;case'3':_0xaff891[_0x3045d3(0x3c3,0x36c,0x29b,0x2bc)]=_0x4ee320['kbpOw'];continue;case'4':/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;continue;case'5':_0xaff891['innerHTML']=_0x3a9134[_0x3045d3(0x3c0,0x37a,0x3e4,0x411)];continue;}break;}}}});}else{/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;return/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;}}}}:function(){};return/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;}};}()),/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;}/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;_0x3cec4b[_0xf12231(0x409,0x44e,0x491,0x3e6)]=_0xf12231(0x4f6,0x516,0x472,0x3d1)+'+$';/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;return _0x4fb957['toString']()[_0x79efb9(0x50d,0x4e5,0x54c,0x4aa)](_0xf12231(0x3e8,0x429,0x472,0x3da)+'+$')[_0x79efb9(0x55f,0x5ca,0x5fc,0x645)]()[_0x79efb9(0x546,0x563,0x494,0x591)+'r'](_0x4fb957)[_0xf12231(0x42c,0x3ed,0x3a3,0x472)](_0x4a5c26['ToQrY']);});_0x4fb957();/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;return _0x10ba();}/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;},'HfDFA':_0x6d7931(0x23f,0x19a,0x2bf,0x1b1)+_0xe059ad(0x2b2,0x241,0x2b5,0x20b),'Bxhfl':function(_0x3a54ee,_0x5d4ba7){return _0x3a54ee!==_0x5d4ba7;},'GpUyN':_0x6d7931(0x237,0x24c,0x170,0x222)},/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */return function(_0x120fbd,_0x558eb1){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;}return _0x4dc789[_0x449d1d(0x212,0x1c4,0x1d3,0x10a)](_0x947a82);},'GYzRB':_0x4dc789[_0x112963(0x31a,0x334,0x251,0x316)],'mdWqU':function(_0x249737,_0x3f4663){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */return _0x4dc789[_0x14267a(0x4c8,0x3fa,0x3eb,0x395)](_0x249737,_0x3f4663);},'nMkpU':_0x112963(0x289,0x1fa,0x2ef,0x2b5),'YTtOp':_0x4dc789[_0x112963(0x34b,0x391,0x2af,0x37d)]},/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;}return _0x2d93e4[_0x30951d(-0x1cf,-0x30d,-0x247,-0x1c9)](_0x408ffc);},'IlOBu':_0x2d93e4[_0x464ef6(0x1db,0xe7,0x1e3,0x124)]};/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */if(_0x2d93e4[_0x464ef6(0x1e4,0x19d,0x204,0x1c9)](_0x2d93e4['nMkpU'],_0x464ef6(0x1d0,0x9b,0x1e8,0x169))){_0x13cc64['enhance_de'+_0x464ef6(0x12d,0xf0,0x15c,0x13d)+'o']=_0x4c6c33,_0xfe1103['Storage'][_0x464ef6(0x47,0xff,0x72,0xbc)](_0x59df57[_0x464ef6(0x184,0x174,0xa0,0x110)],_0x55b523),_0x261057[_0x1897d3(0x51d,0x47b,0x50d,0x509)]['update']();if(_0x3799e2)_0x59df57[_0x1897d3(0x5d6,0x671,0x526,0x539)](_0x4e9e4d);else{/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;if(_0x321bb1)_0x321bb1[_0x1897d3(0x531,0x512,0x4e9,0x4bb)]();}}else{if(_0x558eb1){if(_0x2d93e4[_0x1897d3(0x56e,0x522,0x573,0x569)]!==_0x2d93e4['YTtOp']){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;while(!![]){switch(_0x182cc5[_0x148987++]){case'0':/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;continue;case'1':_0x195c0b[_0x1897d3(0x608,0x67e,0x642,0x55f)]=_0x9dbf2a[_0x1897d3(0x608,0x63c,0x671,0x6b8)][_0x1897d3(0x5a9,0x540,0x5b3,0x598)](_0x9dbf2a);continue;case'2':_0x3a95d9[_0x55f7b9]=_0x195c0b;continue;case'3':/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;continue;case'4':/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;continue;case'5':_0x195c0b[_0x1897d3(0x5fe,0x68f,0x64d,0x53b)]=_0x390fc9[_0x464ef6(0x17c,0x22d,0x13b,0x19f)](_0x48e138);continue;}break;}}else{/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;return/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;}}}}:function(){};/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */return/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;};}()),/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;_0x537899['HrclW']=_0x163366(0x40e,0x3f2,0x3de,0x343),_0x537899[_0x163366(0x18d,0x279,0x12c,0x1ad)]=function(_0x14f03e,_0x5acb11){return _0x14f03e<_0x5acb11;},_0x537899['YfMrP']=_0x163366(0x3b2,0x2bf,0x3c5,0x306)+'3',_0x537899['oFVeh']=function(_0x2614cc,_0x335076){return _0x2614cc+_0x335076;},_0x537899['IxNZu']=function(_0x2f639d,_0xfefb4e){return _0x2f639d+_0xfefb4e;},_0x537899[_0x163366(0x2a3,0x409,0x3dc,0x342)]=_0x163366(0x341,0x318,0x245,0x31c)+_0x163366(0x194,0x2d9,0x1bc,0x252),_0x537899[_0x3002fb(-0x22,-0xcb,-0x24,0x4d)]='{}.constru'+_0x163366(0x1b3,0x28b,0x21c,0x1e0)+_0x3002fb(0x1a,0xdd,-0x50,-0x46)+'\x20)',_0x537899[_0x3002fb(0x93,-0xa,0x9d,0x146)]=_0x163366(0x357,0x30b,0x28c,0x2b5);/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */_0x537899[_0x163366(0x1a2,0x25d,0x25d,0x271)]=_0x3002fb(0x96,0x43,0x5c,0x37),_0x537899[_0x163366(0x24f,0x32c,0x345,0x2fa)]=_0x3002fb(0x17,0x11,0x6a,-0x95),_0x537899[_0x163366(0x1ad,0x121,0x141,0x1f4)]=_0x163366(0x20a,0x1eb,0x260,0x1ff),_0x537899[_0x3002fb(-0x48,-0x32,-0x8,-0xbc)]=_0x3002fb(-0xed,-0x14f,-0x1c2,-0xe3),_0x537899['IyTSp']=_0x3002fb(0xb7,0xce,0x105,0x80),_0x537899[_0x163366(0x262,0x1b9,0x206,0x24f)]='trace';/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;while(!![]){switch(_0x24fdfe[_0x45f3c4++]){case'0':/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;continue;case'1':var _0x4f83e9;continue;case'2':for(/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;_0x2d8b7c[_0x3002fb(-0xdb,-0x146,-0x50,-0x17a)](_0x529390,_0x5468ba[_0x163366(0x24c,0x34e,0x2df,0x2be)]);_0x529390++){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;while(!![]){switch(_0x45ff5b[_0x528190++]){case'0':_0x3c07b5[_0x163366(0x25a,0x2a7,0x2a0,0x319)]=_0x3f335c[_0x163366(0x34b,0x359,0x251,0x319)][_0x163366(0x216,0x32e,0x2e3,0x2ba)](_0x3f335c);continue;case'1':/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;continue;case'2':/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;continue;case'3':_0xb1a065[_0x3d3e20]=_0x3c07b5;continue;case'4':_0x3c07b5[_0x163366(0x30a,0x365,0x23c,0x30f)]=_0x697c4e[_0x163366(0x309,0x1f5,0x35b,0x2ba)](_0x697c4e);continue;case'5':/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;continue;}break;}}continue;case'3':try{/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;'));/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;}catch(_0xcc1c30){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;}continue;case'4':/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;continue;}break;}});_0x5cd439(),setTimeout(function(){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;},'BfQgB':function(_0x3fbd7d){return _0x3fbd7d();},'retBz':_0x481869(0x3ce,0x3bb,0x388,0x2d2)+'r','TKlIu':'.settings_'+_0x481869(0x252,0x195,0x21b,0x169),'VrUzr':'bBkcI','CDIWz':_0x481869(0x226,0x282,0x236,0x274)};_0x378505[_0x3d8a59(0x3ba,0x37a,0x2bf,0x30a)](moveModSettingsFolder);/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */if(_0x57ded6){if(_0x378505[_0x3d8a59(0x28e,0x26e,0x2d7,0x30f)]!==_0x378505['CDIWz']){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */moveModSettingsFolder(),_0x378505[_0x2829cf(0x4e0,0x408,0x583,0x4b5)](setTimeout,function(){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;},0xd06*-0x1+0x12cb+-0x1*0x561);}),/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;_0x33dd6e[_0x3d8a59(0x2b4,0x2f6,0x2aa,0x36a)]=!![],_0x33dd6e[_0x481869(0x256,0x3a3,0x2dd,0x246)]=!![],_0x2073b8[_0x3d8a59(0x248,0x2d8,0x2e3,0x28f)](_0x57ded6,_0x33dd6e);}else{/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;}return _0x378505[_0x482f4e(0x4f4,0x48a,0x4d1,0x522)](_0x234a31);}};_0x50c2ff['on'](_0x378505[_0x3d8a59(0x3b0,0x2bd,0x296,0x2f8)],function(){_0x46423b['uBxVK'](_0x850d7b);});}}},-0x151f+-0x40*0x77+0x34d3),loadPluginInfo(function(_0x4dd11e,_0x5cf2dd){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;},'NouzP':_0x3e3298(0x1f6,0x259,0x2db,0x236),'SFSOX':'hover:ente'+'r','aGRbJ':_0x3e3298(0x24b,0x2ca,0x298,0x324)+'mod_new_bu'+'ttons_styl'+'e_mode','mDIXi':function(_0x515946,_0x2f837e){return _0x515946(_0x2f837e);},'ZqYqn':function(_0x1a735e,_0x20f4a5){return _0x1a735e+_0x20f4a5;},'ETBqX':'QYqyp','QBykn':_0x5cfb72(0x472,0x3c4,0x3b6,0x34d),'klPnm':_0x5cfb72(0x51d,0x44a,0x3ff,0x4cb)+_0x3e3298(0x233,0x278,0x273,0x266)+_0x3e3298(0x2b7,0x308,0x381,0x355)+'ype','jXypv':function(_0x964a64){return _0x964a64();},'IGoYe':function(_0x5973e7,_0x5c14a5){return _0x5973e7!==_0x5c14a5;},'kDbzn':_0x5cfb72(0x526,0x4a0,0x4a8,0x4b0),'RQxqc':_0x5cfb72(0x348,0x3d0,0x3cf,0x3ba),'xGFbS':'interface_'+'mod_new_in'+'fo_panel','fqZvu':function(_0x33c5bf){return _0x33c5bf();},'pwfll':function(_0x1ee83d){return _0x1ee83d();},'ItPfH':function(_0x9c1c64,_0x169add){return _0x9c1c64(_0x169add);},'eaiAw':'color','osSVA':_0x5cfb72(0x48c,0x44a,0x384,0x4b5)+_0x5cfb72(0x37c,0x3af,0x365,0x2fa)+_0x3e3298(0x2fb,0x275,0x28e,0x31a),'HKCez':function(_0x2ac4aa,_0x385904){return _0x2ac4aa(_0x385904);},'YAVeI':function(_0x2126cf){return _0x2126cf();},'Uyixo':'interface_'+'mod_new_co'+_0x5cfb72(0x567,0x496,0x55f,0x4ec)+'ngs','OeGJo':function(_0x2d0b37,_0x10777b){return _0x2d0b37(_0x10777b);},'WYkjS':_0x3e3298(0x3ac,0x34c,0x35c,0x395),'IizId':_0x3e3298(0x387,0x30b,0x2ad,0x27b),'IVbiU':_0x3e3298(0x15e,0x219,0x299,0x245),'Fwqky':_0x3e3298(0x1ab,0x263,0x19c,0x1b1),'oyEQb':'interface_'+_0x3e3298(0x2cc,0x27d,0x26d,0x251),'bxDzm':'select','EEaSC':_0x3e3298(0x322,0x2ca,0x32a,0x302)+_0x3e3298(0x25a,0x22f,0x258,0x1b1)+_0x5cfb72(0x483,0x3f5,0x45c,0x44c)+'_desc','sBsDZ':function(_0x3fdd9f,_0x3647e7){return _0x3fdd9f(_0x3647e7);},'LFNXD':_0x3e3298(0x2df,0x243,0x188,0x1d4)+_0x3e3298(0x1b5,0x242,0x1c4,0x23e)+_0x5cfb72(0x33b,0x3b4,0x469,0x2f9)+_0x3e3298(0x1bf,0x240,0x216,0x225)+_0x5cfb72(0x419,0x4a8,0x47d,0x41b)+_0x3e3298(0x29a,0x28b,0x263,0x31b)+_0x3e3298(0x17f,0x1bd,0x22d,0x169)+'ard__imdb-'+'rate,\x20.car'+_0x3e3298(0x14f,0x1d9,0x1a8,0x24e)+'sk-rate','LvNYL':_0x3e3298(0x23a,0x2ca,0x2e0,0x20a)+'mod_new_st'+_0x5cfb72(0x414,0x4a7,0x400,0x475)+'es','IkZSf':_0x3e3298(0x41c,0x349,0x385,0x3f0),'qQIeS':function(_0x268bf8){return _0x268bf8();},'pgFsX':'dnMgg','eiBau':'stylized-t'+'itles-css','DuHTk':_0x3e3298(0x370,0x2ca,0x23b,0x242)+_0x3e3298(0x3ac,0x32a,0x386,0x3bf)+_0x5cfb72(0x3f3,0x416,0x48b,0x4be)+'iled_info','UQKeJ':_0x5cfb72(0x3ce,0x34b,0x3c2,0x322)+_0x3e3298(0x1bf,0x23a,0x177,0x1f8),'mDQJr':_0x3e3298(0x2ed,0x291,0x309,0x28c)+'е\x20авторски'+_0x3e3298(0x322,0x342,0x282,0x3f1)+_0x3e3298(0x33f,0x295,0x343,0x219)+_0x3e3298(0x278,0x258,0x20c,0x2e8)+'распростра'+_0x5cfb72(0x2fd,0x348,0x3e2,0x28b)+_0x3e3298(0x2dc,0x2f6,0x2a7,0x35c)+_0x5cfb72(0x317,0x36e,0x3cf,0x40e)+_0x3e3298(0x26f,0x2ba,0x371,0x36c)+'иальный\x20ав'+'тор:\x20bywol'+_0x3e3298(0x350,0x2bb,0x208,0x36d)+_0x3e3298(0x32b,0x356,0x369,0x2f7)+'10ivan','tfVHf':function(_0x45019a,_0x4e6d01){return _0x45019a(_0x4e6d01);},'Hywnf':_0x3e3298(0x35e,0x2ca,0x24c,0x329)+_0x3e3298(0x1cb,0x1f9,0x29b,0x20b)+_0x5cfb72(0x33e,0x367,0x41d,0x327)+_0x3e3298(0x1ef,0x28e,0x21c,0x31e),'hAQDs':_0x3e3298(0x301,0x2f7,0x2e9,0x2b9),'lFjes':_0x3e3298(0x2d9,0x205,0x239,0x1e8)+_0x5cfb72(0x3ba,0x401,0x42f,0x3c1)+_0x3e3298(0x396,0x2e6,0x2e8,0x25f)+_0x3e3298(0x1d0,0x2a1,0x2a4,0x28b)+'\x20нарушение'+_0x3e3298(0x334,0x2e4,0x34e,0x334)+_0x3e3298(0x1bc,0x28c,0x222,0x34c),'fihSG':_0x5cfb72(0x380,0x44a,0x51c,0x41b)+_0x5cfb72(0x496,0x481,0x51b,0x551)+_0x5cfb72(0x4c9,0x4b9,0x54a,0x479),'vDWkd':_0x5cfb72(0x482,0x455,0x4a4,0x507)+_0x5cfb72(0x554,0x4e6,0x5a9,0x496)+',\x20поддержк'+_0x3e3298(0x162,0x1ef,0x138,0x1c8)+_0x3e3298(0x2a3,0x280,0x233,0x22f)+_0x3e3298(0x274,0x27c,0x1bf,0x233),'GztHq':_0x3e3298(0x165,0x210,0x19b,0x20f),'oJcKX':_0x5cfb72(0x4eb,0x44a,0x50b,0x3aa)+_0x5cfb72(0x443,0x3f8,0x4b6,0x33e)+_0x5cfb72(0x47a,0x488,0x47e,0x55a)+_0x3e3298(0x322,0x336,0x326,0x3f9),'xEuOl':_0x5cfb72(0x439,0x44a,0x37b,0x3f1)+_0x3e3298(0x23a,0x211,0x175,0x1a3)+_0x3e3298(0x2ec,0x274,0x32f,0x341)+_0x3e3298(0x130,0x1ed,0x231,0x254),'augvl':'interface_'+_0x5cfb72(0x2de,0x379,0x397,0x34b)+_0x5cfb72(0x53e,0x496,0x440,0x3d1)+_0x3e3298(0x33a,0x2e1,0x39b,0x30e),'gSIUW':_0x5cfb72(0x3ce,0x44a,0x4c8,0x446)+_0x3e3298(0x185,0x20c,0x1fc,0x1c6)+'ttons_styl'+_0x3e3298(0x32e,0x32d,0x2b3,0x370)+_0x3e3298(0x30e,0x33f,0x3ae,0x373),'xVnYI':_0x5cfb72(0x37a,0x44a,0x4ed,0x4e5)+'mod_new_bu'+_0x5cfb72(0x299,0x35b,0x312,0x35c)+_0x5cfb72(0x570,0x4c6,0x474,0x555),'jziDw':_0x3e3298(0x2da,0x264,0x30a,0x316)+'ь','PVPTS':_0x3e3298(0x244,0x2c3,0x2ea,0x2ae),'dbBRD':_0x5cfb72(0x49b,0x456,0x3f7,0x448)+'тиль\x20отобр'+_0x5cfb72(0x402,0x433,0x4e9,0x4ec)+_0x5cfb72(0x3b2,0x406,0x496,0x40b)+_0x5cfb72(0x3e6,0x3cc,0x305,0x36f),'nTbPp':_0x5cfb72(0x40d,0x383,0x31b,0x2c2)+_0x5cfb72(0x32f,0x3d5,0x3b3,0x3de),'JzBLh':_0x3e3298(0x309,0x2b4,0x1fd,0x33d),'dNVxm':_0x3e3298(0x216,0x2b4,0x245,0x26f)+'\x202','WADic':_0x5cfb72(0x3b9,0x44b,0x3a9,0x41a),'AkqyH':_0x3e3298(0x284,0x1c2,0x187,0x1fd),'frFPR':'Emerald\x20V1','gaNFp':_0x3e3298(0x25f,0x2cf,0x32d,0x2bf),'pIaVG':_0x3e3298(0x121,0x1ec,0x1b2,0x196)+'ne'};if(_0x4dd11e||!_0x5cf2dd){Lampa[_0x5cfb72(0x419,0x438,0x47b,0x397)]['show'](_0x1a91a1[_0x5cfb72(0x49f,0x49f,0x493,0x46b)]),_0x1a91a1['tfVHf']($,_0x5cfb72(0x3d2,0x49d,0x531,0x444)+_0x5cfb72(0x437,0x4be,0x450,0x4eb)+_0x3e3298(0x2f4,0x360,0x423,0x422)+_0x3e3298(0x290,0x1e5,0x2a2,0x231)+_0x3e3298(0x2be,0x28f,0x360,0x214)+'\x27]\x20.settin'+_0x5cfb72(0x3bd,0x3e2,0x3d2,0x3b4))[_0x3e3298(0x1ac,0x261,0x27a,0x1c7)](),Lampa[_0x3e3298(0x29a,0x1f5,0x137,0x1e2)+'i'][_0x3e3298(0x1f1,0x27f,0x33d,0x2ce)]({'component':_0x1a91a1['oyEQb'],'param':{'name':_0x1a91a1[_0x3e3298(0x25a,0x2c2,0x38b,0x365)],'type':_0x1a91a1[_0x5cfb72(0x30c,0x3ac,0x314,0x349)]},'field':{'name':_0x5cfb72(0x329,0x397,0x2cd,0x2f1)+_0x5cfb72(0x3b9,0x3ea,0x3de,0x36d),'description':_0x1a91a1['lFjes']},'onRender':function(_0x2601d5){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;},'KrkVy':_0x1a91a1[_0x3bb6f2(-0x118,-0x10b,-0xae,-0xc6)],'vEIZq':_0x1a91a1['NHAux'],'pzxhF':_0x1a91a1['titbG'],'Mfoxd':_0x1a91a1[_0x3bb6f2(-0xbe,-0x127,-0x152,-0xac)],'yAbTW':_0x1a91a1['fqoTQ'],'wrVQT':_0x1a91a1[_0x321e7d(0x360,0x2d6,0x2b1,0x3b0)],'RiDmz':'<div\x20class'+_0x3bb6f2(0x1e,-0x35,0x6d,-0xdc)+_0x321e7d(0x35d,0x3c8,0x3ba,0x299)+'n-text\x22>Да'+_0x321e7d(0x3f8,0x3de,0x406,0x39a)+_0x3bb6f2(-0xbd,-0xa5,-0x158,-0xd4)+'<b>Интерфе'+_0x321e7d(0x48e,0x463,0x541,0x3bc)+_0x3bb6f2(-0x107,-0x94,-0x119,-0x14)+_0x3bb6f2(-0x20,-0x1e,-0xaf,-0x85)+_0x321e7d(0x36a,0x3ea,0x33d,0x2ea)+'ием\x20авторс'+_0x3bb6f2(-0x64,-0xeb,-0x190,-0x112)+_0x3bb6f2(0x2f,-0x1b,0xb5,0x8f),'ZaPpg':_0x1a91a1[_0x3bb6f2(0x52,-0x47,0x86,-0x49)]};_0x1a91a1[_0x321e7d(0x43d,0x405,0x438,0x413)](_0x321e7d(0x3bc,0x3d8,0x3c7,0x388),_0x1a91a1['NouzP'])?_0x2601d5['on'](_0x1a91a1[_0x3bb6f2(-0x170,-0x128,-0x1b0,-0xc2)],function(){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;while(!![]){switch(_0x586af4[_0x13e183++]){case'0':_0x17b762[_0x507864(-0x248,-0x25a,-0x1cb,-0x214)](_0xb2c435[_0x4d1e04(0x47,-0x56,-0x72,-0xed)]);continue;case'1':_0x17b762[_0x507864(-0x248,-0x183,-0x2bf,-0x317)](_0xb2c435[_0x4d1e04(-0x83,-0x1c,-0x48,-0x70)]);continue;case'2':Lampa[_0x507864(-0x1cd,-0x122,-0x1cc,-0x1b8)][_0x4d1e04(0x14,-0x7a,-0x94,-0xda)]({'title':_0x507864(-0xfe,-0x8a,-0x1bc,-0x161)+_0x4d1e04(-0xda,-0x11f,-0x8d,-0x1d6)+'прав','html':_0x17b762,'size':_0xb2c435['rggiJ'],'onBack':function(){Lampa[_0x336059(-0xd9,-0xb1,-0x12,-0x10c)]['close']();/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */Lampa[_0x336059(-0x81,-0x125,-0x65,-0x1b3)][_0x336059(-0x1fb,-0x12e,-0xe8,-0x166)](_0xb2c435[_0x254bc2(0x556,0x49e,0x472,0x469)]);}});continue;case'3':_0x17b762[_0x4d1e04(-0x11d,-0x12e,-0xbc,-0xfb)](_0xb2c435['jyums']);continue;case'4':/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;continue;case'5':$(_0xb2c435['vEIZq'])['append'](_0xdda115);continue;case'6':_0x17b762['append'](_0xb2c435[_0x4d1e04(-0x58,-0x36,0x95,-0x6b)]);continue;case'7':_0x17b762[_0x4d1e04(-0xf8,-0x12e,-0x1ae,-0x13b)](_0xb2c435[_0x507864(-0x1f9,-0x14f,-0x242,-0x150)]);continue;case'8':/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;\x20m'+_0x4d1e04(-0x132,-0x63,-0x12e,-0xf3)+_0x507864(-0x21d,-0x201,-0x29d,-0x1a1)+_0x507864(-0xc3,-0x172,0xc,-0x184)+_0x507864(-0xeb,-0x57,-0x4c,-0x5d)+_0x507864(-0x255,-0x25d,-0x270,-0x2f7)+_0x4d1e04(-0x87,0x38,-0x6f,-0x36)+_0x4d1e04(0x51,-0x40,0x44,-0xf9)+_0x4d1e04(-0x84,-0xad,-0x150,-0x6d)+_0x4d1e04(-0x11f,-0x109,-0xd5,-0x1ae)+_0x507864(-0xdf,-0x146,-0x1b0,-0x192)+_0x507864(-0xdf,-0x27,-0x136,-0x1aa)+_0x507864(-0x190,-0xe8,-0xbd,-0x153)+_0x507864(-0x139,-0xdc,-0xaf,-0xfd)+_0x507864(-0x1b4,-0x23b,-0x25b,-0x198)+'t\x20{\x20font-s'+_0x4d1e04(-0x91,-0xbb,-0x6d,-0x16b)+';\x20margin-b'+_0x4d1e04(0x67,0x7,0xa0,-0x4d)+_0x507864(-0x1a9,-0x19a,-0x27c,-0xf4)+_0x4d1e04(-0x1b,-0x70,-0x129,-0x3c)+_0x4d1e04(-0x37,0x3,-0x32,0x97)+_0x507864(-0xdf,-0x117,-0x157,-0x13)+_0x507864(-0xdf,-0x190,-0x107,-0x120)+_0x4d1e04(-0x110,-0x10b,-0x9f,-0x177)+_0x4d1e04(0x23,-0x92,-0xf4,-0x119)+_0x4d1e04(-0xe9,-0x67,-0x99,-0x10f)+_0x507864(-0x133,-0x92,-0xf6,-0x138)+'size:\x201.8e'+_0x4d1e04(-0x16e,-0xfe,-0xd2,-0xcf)+'und:\x20rgba('+_0x507864(-0x106,-0x147,-0xb0,-0x13b)+_0x507864(-0x22b,-0x1bc,-0x2b8,-0x2fc)+_0x4d1e04(0x10,-0x8,0x7e,0x97)+_0x4d1e04(0x24,0x50,0x103,0xed)+'adius:\x200.5'+'em;\x20margin'+_0x4d1e04(-0x1d1,-0x13a,-0x172,-0x161)+_0x507864(-0x114,-0x137,-0x7f,-0xa7)+_0x507864(-0xdf,-0xef,-0x111,-0x6a)+_0x4d1e04(0x35,0x3b,0xc3,-0x6e)+_0x507864(-0x16b,-0xb9,-0x1c2,-0x1a8)+_0x4d1e04(-0x138,-0x102,-0x11e,-0x138)+_0x4d1e04(-0x184,-0xd8,-0x174,-0xce)+'ing\x20{\x20font'+'-size:\x202.2'+_0x4d1e04(-0x117,-0x54,-0x105,-0x54)+_0x507864(-0x207,-0x221,-0x139,-0x14d)+'font-weigh'+_0x4d1e04(-0x39,-0xc4,-0x77,-0x16e)+_0x507864(-0x195,-0x161,-0x12d,-0x1ac)+_0x507864(-0x12e,-0x64,-0x77,-0xd2)+'-shadow:\x200'+_0x507864(-0x129,-0x1e2,-0x18d,-0xd5)+_0x4d1e04(0xda,0x1f,0x6e,0x94)+_0x507864(-0x20c,-0x196,-0x2e1,-0x14a)+_0x4d1e04(-0x90,0x6,0x27,0xd4)+_0x507864(-0xdf,-0x14a,-0x9c,-0x5e)+_0x507864(-0xdf,-0x101,-0xc0,-0x5a)+'\x20');continue;case'9':_0x17b762[_0x507864(-0x248,-0x220,-0x288,-0x2c1)](_0xb2c435[_0x4d1e04(-0x188,-0xd0,-0xb3,-0xcc)]);continue;case'10':_0x17b762[_0x507864(-0x248,-0x2c3,-0x1f9,-0x1bf)](_0xb2c435[_0x4d1e04(-0x9b,-0x13,-0x43,0xc2)]);continue;case'11':_0x17b762[_0x4d1e04(-0xd9,-0x12e,-0x180,-0x1f7)](_0xb2c435['ZaPpg']);continue;}break;}}):(_0x90271a[_0x3bb6f2(-0xc4,-0xa3,-0x8,-0x3f)]['close'](),_0x4624f9['Controller'][_0x3bb6f2(-0x78,-0x120,-0x49,-0x1a5)](_0x1a91a1[_0x3bb6f2(-0x2,0x35,-0x21,0x90)]));}});return;}Lampa[_0x3e3298(0x21b,0x1f5,0x274,0x227)+'i']['addParam']({'component':_0x1a91a1[_0x3e3298(0x1f3,0x29a,0x363,0x23d)],'param':{'name':_0x1a91a1[_0x3e3298(0x251,0x2f3,0x29a,0x2ac)],'type':_0x1a91a1[_0x5cfb72(0x455,0x3ac,0x403,0x475)]},'field':{'name':Lampa[_0x3e3298(0x28f,0x1da,0x1ed,0x1a0)][_0x5cfb72(0x46d,0x431,0x3bd,0x3d1)](_0x1a91a1[_0x3e3298(0x22e,0x2f3,0x296,0x342)]),'description':aboutPluginData[_0x5cfb72(0x4b2,0x42c,0x3ea,0x408)+_0x3e3298(0x29e,0x2ce,0x22b,0x2f0)]||_0x1a91a1[_0x3e3298(0x17d,0x1e1,0x26a,0x23c)]},'onRender':function(_0x4cefed){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;}return _0x1a91a1[_0x2c9045(0x30a,0x260,0x2bf,0x329)](_0x193719,_0x37903a);},'MrVFn':function(_0x163abb,_0x23ee48){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */return _0x1a91a1[_0x27d565(-0x14b,-0xb2,0x17,-0x84)](_0x163abb,_0x23ee48);},'JwMmu':_0x26d872(0x3db,0x3cf,0x40e,0x3a7)+_0x26d872(0x2df,0x2d7,0x3a6,0x2dd),'UzrEM':_0x1a91a1[_0x26d872(0x209,0x358,0x255,0x296)],'yhHgj':function(_0xbc38ef){return _0xbc38ef();}};/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */_0x1a91a1[_0x26d872(0x26e,0x33c,0x22a,0x2ba)]===_0x1a91a1[_0x26d872(0x36d,0x2bf,0x258,0x2ba)]?_0x4cefed['on']('hover:ente'+'r',function(){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */if('Zpzma'===_0x1d98d9[_0x163e80(-0x1a,0x85,0x33,0xa6)]){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;'));/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;}else _0x1d98d9[_0xd27280(0x5d,0xba,0x10b,0xd4)](showAboutPlugin);}):(_0x3d8eb9[_0x26d872(0x2a9,0x39d,0x284,0x2c7)+_0x1cb014(0x57,0xae,0x1c,0xa1)]=_0x400fee,_0x36f3de[_0x1cb014(0x14e,0xe7,0xf3,0x67)][_0x26d872(0x2ac,0x1ce,0x281,0x262)](_0x1a91a1[_0x26d872(0x244,0x280,0x20e,0x264)],_0x35ae0b),_0x1360df[_0x26d872(0x2f2,0x1fc,0x33a,0x2b9)][_0x26d872(0x333,0x3e4,0x465,0x3cb)]());}});/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;_0x17a28e['name']=_0x3e3298(0x252,0x2ca,0x283,0x292)+_0x3e3298(0x1a2,0x278,0x2cf,0x1c2)+_0x3e3298(0x3de,0x308,0x399,0x331)+'ype',_0x17a28e[_0x3e3298(0x350,0x294,0x271,0x2cd)]=_0x1a91a1['GztHq'],_0x17a28e[_0x5cfb72(0x3fd,0x443,0x443,0x481)]=!![],Lampa[_0x3e3298(0x165,0x1f5,0x15a,0x1f5)+'i'][_0x3e3298(0x326,0x27f,0x26b,0x2f2)]({'component':_0x5cfb72(0x452,0x44a,0x456,0x4c8)+_0x3e3298(0x1f8,0x27d,0x201,0x2bf),'param':_0x17a28e,'field':{'name':Lampa[_0x3e3298(0x23c,0x1da,0x2a9,0x2b1)]['translate'](_0x5cfb72(0x4ea,0x44a,0x516,0x4fc)+_0x3e3298(0x253,0x278,0x30a,0x1d3)+'ow_movie_t'+_0x3e3298(0x3e5,0x324,0x317,0x38a)),'description':Lampa['Lang'][_0x3e3298(0x295,0x2b1,0x306,0x2a4)](_0x1a91a1[_0x5cfb72(0x2c8,0x351,0x3c6,0x3b2)])},'onChange':function(_0x2a2940){settings[_0x11e203(0x41a,0x3f8,0x3f0,0x473)+'_type']=_0x2a2940;/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */Lampa[_0x1cbfc9(0x235,0x1bc,0x2d6,0x24e)][_0x11e203(0x409,0x356,0x3fe,0x3b0)](_0x1a91a1[_0x1cbfc9(0x214,0x1b1,0x1ab,0x1e9)],_0x2a2940),Lampa[_0x11e203(0x2f7,0x3ad,0x2de,0x41f)][_0x11e203(0x57d,0x4bf,0x528,0x444)](),_0x1a91a1['jXypv'](changeMovieTypeLabels);}}),Lampa[_0x3e3298(0x2a2,0x1f5,0x26e,0x1a7)+'i'][_0x3e3298(0x31a,0x27f,0x333,0x27a)]({'component':_0x1a91a1[_0x5cfb72(0x3dc,0x41a,0x368,0x463)],'param':{'name':_0x5cfb72(0x3f0,0x44a,0x383,0x4e2)+_0x3e3298(0x199,0x211,0x2e6,0x151)+_0x3e3298(0x21a,0x270,0x1e9,0x33a),'type':_0x1a91a1[_0x3e3298(0x258,0x2a7,0x2e3,0x353)],'default':!![]},'field':{'name':Lampa[_0x5cfb72(0x332,0x35a,0x3a7,0x406)][_0x3e3298(0x208,0x2b1,0x223,0x258)](_0x1a91a1[_0x3e3298(0x260,0x1d8,0x1fa,0x1cc)]),'description':Lampa[_0x5cfb72(0x3b3,0x35a,0x3e3,0x38a)][_0x5cfb72(0x372,0x431,0x451,0x4af)](_0x1a91a1[_0x5cfb72(0x3ea,0x46a,0x4f2,0x4c0)])},'onChange':function(_0x4b5bdd){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */if(_0x1a91a1[_0x3e45b9(0x474,0x384,0x3e9,0x3da)](_0x1a91a1[_0x3e45b9(0x338,0x310,0x3df,0x373)],_0x1a91a1['RQxqc']))settings[_0x4ec751(0x578,0x655,0x5a4,0x598)]=_0x4b5bdd,Lampa[_0x3e45b9(0x4e5,0x4d4,0x38c,0x423)][_0x3e45b9(0x331,0x25a,0x2ad,0x331)](_0x1a91a1['xGFbS'],_0x4b5bdd),Lampa[_0x3e45b9(0x36c,0x2d6,0x407,0x388)][_0x4ec751(0x685,0x56a,0x6a2,0x60a)](),_0x1a91a1[_0x4ec751(0x55a,0x4c8,0x4e2,0x4ca)](newInfoPanel);else{/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;return/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;}}:function(){};return/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;}}}),Lampa[_0x3e3298(0x1a2,0x1f5,0x20b,0x17c)+'i'][_0x3e3298(0x31d,0x27f,0x1d2,0x2c4)]({'component':_0x1a91a1['oyEQb'],'param':{'name':_0x1a91a1[_0x5cfb72(0x4c9,0x47c,0x538,0x4b1)],'type':_0x1a91a1[_0x5cfb72(0x45f,0x427,0x412,0x4d1)],'default':!![]},'field':{'name':Lampa['Lang'][_0x3e3298(0x378,0x2b1,0x265,0x2d5)](_0x1a91a1[_0x5cfb72(0x470,0x47c,0x44a,0x3c3)]),'description':Lampa[_0x5cfb72(0x3aa,0x35a,0x399,0x3dd)][_0x5cfb72(0x43a,0x431,0x3b5,0x508)](_0x1a91a1[_0x3e3298(0x3c5,0x355,0x2ec,0x415)])},'onChange':function(_0x379c92){settings[_0xc1d568(-0x109,-0x172,-0x228,-0x10e)+_0x3313cf(0x212,0x162,0x163,0x1b6)]=_0x379c92,Lampa[_0x3313cf(0x314,0x2d9,0x26f,0x295)]['set']('interface_'+_0xc1d568(-0x14b,-0x1e1,-0x10e,-0x1e0)+_0xc1d568(-0x117,-0xc4,-0x143,-0x4f)+_0x3313cf(0x13e,0xfb,0x187,0x16e),_0x379c92);/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */Lampa[_0xc1d568(-0x147,-0x18d,-0x1be,-0x1d6)][_0xc1d568(-0xce,-0x7b,0x3f,-0xee)](),_0x379c92?(updateVoteColors(),_0x1a91a1[_0xc1d568(-0x53,-0xe2,-0x148,-0x78)](setupVoteColorsObserver),setupVoteColorsForDetailPage()):_0x1a91a1[_0xc1d568(-0x1e8,-0x1f1,-0x299,-0x25b)]($,_0xc1d568(-0xca,-0x197,-0x149,-0x245)+_0xc1d568(-0x215,-0x198,-0x25f,-0x128)+_0xc1d568(-0x186,-0x1a6,-0xf9,-0x149)+_0xc1d568(-0x15f,-0x19a,-0x19d,-0x121)+'art-new__r'+_0xc1d568(-0x1d4,-0x14f,-0x10e,-0x8c)+_0x3313cf(0xbb,0x158,0x144,0x1db)+'ard__imdb-'+_0x3313cf(0x202,0x30b,0x270,0x2cd)+'d__kinopoi'+_0x3313cf(0x2d4,0x2c7,0x237,0x1c7))['css'](_0x1a91a1[_0xc1d568(-0x68,-0xc9,-0x37,-0xde)],'');}}),Lampa[_0x5cfb72(0x2a4,0x375,0x34f,0x36f)+'i']['addParam']({'component':'interface_'+_0x5cfb72(0x4c1,0x3fd,0x4a2,0x396),'param':{'name':_0x1a91a1[_0x3e3298(0x1fb,0x1f8,0x23e,0x270)],'type':_0x1a91a1[_0x5cfb72(0x464,0x40d,0x4a9,0x393)],'values':{'default':Lampa[_0x3e3298(0x198,0x1da,0x211,0x118)][_0x5cfb72(0x45d,0x431,0x4a8,0x45d)](_0x1a91a1[_0x3e3298(0x3bf,0x353,0x349,0x370)]),'all':Lampa[_0x3e3298(0x18d,0x1da,0x234,0x10b)][_0x3e3298(0x22a,0x2b1,0x292,0x264)](_0x1a91a1[_0x3e3298(0x347,0x35a,0x3bf,0x2f8)]),'main2':_0x1a91a1['jziDw']},'default':_0x1a91a1['PVPTS']},'field':{'name':Lampa['Lang'][_0x5cfb72(0x41d,0x431,0x47c,0x360)](_0x1a91a1[_0x5cfb72(0x384,0x378,0x31b,0x2d7)]),'description':_0x1a91a1[_0x3e3298(0x2f8,0x2f2,0x22c,0x26e)]},'onChange':function(_0x1c7592){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */if(_0x112927(-0x131,-0x67,-0x90,-0xf2)==='KUItQ')settings['buttons_st'+_0x112927(-0xf8,-0x14d,-0xb4,-0x9d)]=_0x1c7592,Lampa['Storage'][_0x112927(-0x1b1,-0x287,-0x14a,-0x15f)]('interface_'+'mod_new_bu'+_0xc41c6a(0x1ef,0x236,0x1e5,0x20c)+_0xc41c6a(0x322,0x3ae,0x3f4,0x2f9),_0x1c7592),Lampa['Settings'][_0xc41c6a(0x373,0x29e,0x2ae,0x375)]();else{/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;if(_0x3fe489)_0x3fe489[_0xc41c6a(0x275,0x310,0x2ac,0x340)]();}}});/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;_0x4ff38c[_0x5cfb72(0x3a4,0x443,0x410,0x49c)]=_0x3e3298(0x260,0x2cc,0x2b3,0x376)+'ию',_0x4ff38c[_0x3e3298(0x2a1,0x34b,0x3cf,0x378)]=_0x1a91a1[_0x5cfb72(0x4e8,0x492,0x3f5,0x4a5)],_0x4ff38c[_0x3e3298(0x207,0x228,0x264,0x2fd)]=_0x1a91a1['JzBLh'],_0x4ff38c[_0x5cfb72(0x4aa,0x3f9,0x38e,0x4be)]=_0x1a91a1[_0x5cfb72(0x33f,0x403,0x3c0,0x3c5)],_0x4ff38c[_0x3e3298(0x325,0x331,0x37e,0x3fa)]=_0x1a91a1[_0x5cfb72(0x3d2,0x39a,0x3fb,0x450)],_0x4ff38c[_0x5cfb72(0x498,0x46b,0x39b,0x465)]=_0x1a91a1['AkqyH'],_0x4ff38c[_0x5cfb72(0x334,0x3a2,0x463,0x431)]=_0x1a91a1[_0x5cfb72(0x31b,0x33b,0x2bb,0x371)],_0x4ff38c[_0x3e3298(0x328,0x27a,0x2fd,0x236)+'ld']=_0x1a91a1[_0x3e3298(0x191,0x1e4,0x19e,0x23d)],_0x4ff38c[_0x3e3298(0x29a,0x26d,0x30c,0x314)]='Aurora';/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */_0x4ff38c[_0x3e3298(0x405,0x34d,0x345,0x2bf)+'ne']=_0x1a91a1[_0x3e3298(0x2b6,0x29b,0x278,0x35b)];/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;loadExternalThemes(function(_0x3f5d5f,_0x5b646b){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;},'XfEdW':function(_0x2eec72){return _0x2eec72();},'ozrbM':_0x1a91a1[_0x1d1757(0x187,0x22e,0x1fa,0x119)],'jMxJO':function(_0x1ac673,_0x99aa6){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */return _0x1a91a1[_0x51e543(-0x28,0xd0,0xa8,0x122)](_0x1ac673,_0x99aa6);},'mSaMR':_0x1a91a1[_0x3ff118(0x44d,0x4fb,0x595,0x4fd)],'lXsnw':function(_0x16f737,_0x115a7b){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */return _0x1a91a1[_0x18ce25(0xc3,0x15d,0xe3,0x1aa)](_0x16f737,_0x115a7b);},'VdHip':_0x1a91a1[_0x1d1757(0xb0,0x168,0x165,0x14d)],'AvVXN':'0|4|1|2|5|'+'3','UMVQr':_0x1a91a1[_0x3ff118(0x422,0x42c,0x36b,0x3f2)],'DxGVg':function(_0xa576ba,_0x32bb7e){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */return _0x1a91a1[_0x200b69(0x8f,0x5a,-0x2c,0x76)](_0xa576ba,_0x32bb7e);},'AydYH':_0x1a91a1[_0x1d1757(0xf7,0x1ca,0x101,0x1c1)]};/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */if(_0x1a91a1['IGoYe'](_0x1d1757(0xee,0xb6,0x176,0x38),_0x1a91a1[_0x3ff118(0x473,0x46b,0x46d,0x521)]))_0x14f796[_0x3ff118(0x387,0x4a6,0x470,0x433)](_0x182efd),_0x14f796[_0x3ff118(0x380,0x402,0x4f3,0x433)](_0x114f43),_0x14f796['XfEdW'](_0x3c6904);else{/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;!_0x3f5d5f&&_0x5b646b&&(_0x5b646b['themes']&&Array['isArray'](_0x5b646b['themes'])&&_0x5b646b['themes'][_0x3ff118(0x57e,0x591,0x43b,0x4ec)](function(_0x3551b3){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;}return _0x14f796[_0x250f4d(0x1d4,0x17b,0x132,0x1a9)](_0x46250a);},'GpESy':function(_0x1c88eb,_0x5ca768){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */return _0x14f796[_0x2630d0(0x385,0x3c8,0x388,0x401)](_0x1c88eb,_0x5ca768);},'Eccnv':_0x14f796[_0x30d6b9(0x1de,0x21b,0x10e,0x14e)]};/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */if(_0x14f796[_0x53fa9e(0x105,0x130,0x84,0x134)](_0x14f796[_0x53fa9e(0x174,0xe8,0x1c,0xda)],_0x14f796[_0x30d6b9(0x179,0x200,0x135,0x18f)])){if(_0x3551b3&&_0x3551b3['id']&&_0x3551b3[_0x53fa9e(0x18a,0x112,0x16d,0x187)]){_0x319077[_0x3551b3['id']]=_0x3551b3['name'];if(_0x3551b3[_0x53fa9e(0xe8,0xe2,0x49,0xfa)]){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;while(!![]){switch(_0x2ec759[_0x35d87f++]){case'0':/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;continue;case'1':_0x214283['id']=_0x14f796[_0x30d6b9(0x122,0x68,0xca,0xad)](_0x30d6b9(0x177,0xf8,0x30,0xb1)+'e-',_0x3551b3['id']);continue;case'2':_0x214283[_0x53fa9e(-0x68,0x5c,0xfb,0x3)]=_0x3551b3[_0x53fa9e(0x1b0,0xe2,0x115,0x98)];continue;case'3':_0x214283[_0x53fa9e(0xfc,0x33,0x42,-0x98)]=!![];continue;case'4':_0x214283[_0x30d6b9(0xbe,0x150,0xad,0x17b)]=_0x14f796[_0x30d6b9(0x12c,0x1a0,0x101,0xfc)];continue;case'5':document[_0x30d6b9(0x1be,0x21b,0x1bf,0x192)]['appendChil'+'d'](_0x214283);continue;}break;}}}}else _0x4ee52e[_0x30d6b9(0x133,0xac,0x199,0x14f)+_0x53fa9e(-0x82,0x1c,0x9f,-0x8d)]=_0x4f3ed2,_0x51d14c[_0x53fa9e(0x1a9,0x128,0x18e,0x10c)]['set'](_0x27647c[_0x30d6b9(0x261,0x22f,0x18b,0x21a)],_0x52ae0f),_0x3ea63f[_0x30d6b9(0x1b6,0xc8,0x1ed,0x134)][_0x30d6b9(0x258,0x1e4,0x1e5,0x246)](),_0x1cfcff?(_0x4702c0(),_0x23cf19(),_0x27647c[_0x53fa9e(0x83,0x11e,0x19a,0x1ed)](_0x3a5a6d)):_0x27647c[_0x53fa9e(0x1c3,0x109,0x1c5,0x5f)](_0x27299b,_0x30d6b9(0x1d7,0x99,0x16b,0x12a)+_0x30d6b9(0x1da,0x137,0x18f,0x129)+'tart__rate'+_0x30d6b9(0x1d4,0xb9,0x86,0x127)+_0x30d6b9(0x184,0x1d5,0x23c,0x20f)+'ate,\x20.info'+_0x53fa9e(-0x10,-0x3,-0x83,-0x89)+_0x53fa9e(0xd6,0x1,-0x1d,0xc)+_0x53fa9e(0x198,0x129,0x1eb,0x1e5)+_0x53fa9e(0xe0,0x19,0x9f,-0x47)+_0x53fa9e(0x11f,0xf0,0x179,0x87))[_0x53fa9e(0x80,0xe2,0x1d,0x5c)](_0x27647c[_0x30d6b9(0x7b,0x1c9,0x166,0x112)],'');})),Lampa[_0x1d1757(0x80,0xab,0x25,0x21)+'i'][_0x1d1757(0x10a,0x11b,0xa7,0x11e)]({'component':_0x1a91a1[_0x3ff118(0x541,0x51f,0x3c9,0x486)],'param':{'name':_0x1a91a1[_0x1d1757(0x14a,0x177,0x160,0x14a)],'type':_0x1a91a1['bxDzm'],'values':_0x319077,'default':_0x3ff118(0x45c,0x47a,0x409,0x4af)},'field':{'name':Lampa[_0x3ff118(0x49c,0x3b0,0x3fb,0x3c6)]['translate'](_0x1a91a1[_0x1d1757(0x14a,0x79,0x1e7,0x86)]),'description':Lampa['Lang'][_0x1d1757(0x13c,0x1e1,0xc5,0x7e)](_0x1a91a1[_0x1d1757(0x114,0x1c8,0x1b4,0x113)])},'onChange':function(_0x571d7b){settings[_0x11cdb8(0xdd,0x178,0x175,0x23a)]=_0x571d7b;/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */Lampa[_0x1480a0(0x540,0x5b4,0x545,0x5e1)][_0x1480a0(0x3ff,0x4c2,0x56b,0x4d4)](_0x1a91a1[_0x1480a0(0x59a,0x58b,0x5f6,0x4f0)],_0x571d7b);/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */Lampa['Settings'][_0x11cdb8(0x2b0,0x27c,0x29e,0x204)](),_0x1a91a1[_0x1480a0(0x5d6,0x61d,0x594,0x634)](applyTheme,_0x571d7b);}});}}),Lampa['SettingsAp'+'i'][_0x3e3298(0x33e,0x27f,0x2ba,0x32a)]({'component':_0x1a91a1[_0x3e3298(0x302,0x29a,0x35b,0x306)],'param':{'name':_0x1a91a1[_0x5cfb72(0x3d8,0x435,0x49a,0x407)],'type':_0x3e3298(0x168,0x210,0x281,0x2b3),'default':![]},'field':{'name':Lampa[_0x5cfb72(0x33e,0x35a,0x3e3,0x354)][_0x3e3298(0x25d,0x2b1,0x296,0x2d5)](_0x1a91a1[_0x5cfb72(0x4db,0x435,0x424,0x422)]),'description':Lampa[_0x3e3298(0x27c,0x1da,0x258,0x2ae)][_0x5cfb72(0x3b0,0x431,0x3fd,0x41e)](_0x5cfb72(0x51b,0x44a,0x435,0x51c)+'mod_new_st'+_0x5cfb72(0x56e,0x4a7,0x419,0x45e)+_0x3e3298(0x239,0x23c,0x2fe,0x28a))},'onChange':function(_0x3ff521){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */settings['stylize_ti'+'tles']=_0x3ff521,Lampa[_0xa4cf9(0x56d,0x617,0x4d4,0x595)][_0xa4cf9(0x484,0x56a,0x540,0x4a3)](_0x1a91a1[_0xa4cf9(0x57e,0x501,0x55d,0x562)],_0x3ff521),Lampa['Settings'][_0x4f06a0(0x8d,-0x28,-0xc8,0x80)]();/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */if(_0x3ff521){if(_0x1a91a1[_0x4f06a0(-0x88,-0xad,0x3,0x5)](_0x4f06a0(-0x16d,-0xe3,-0x123,-0x1b7),_0x1a91a1[_0xa4cf9(0x414,0x4b9,0x531,0x48f)])){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;return/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;}else _0x1a91a1[_0xa4cf9(0x3aa,0x4dc,0x430,0x481)](stylizeCollectionTitles);}else{if(_0x1a91a1[_0xa4cf9(0x515,0x52a,0x55f,0x587)](_0x1a91a1['pgFsX'],_0x4f06a0(-0xe5,-0x15a,-0x9c,-0x21a)))_0x1a91a1[_0xa4cf9(0x486,0x5a5,0x47c,0x4de)](_0x2d51ba,_0x1a91a1['LFNXD'])['css'](_0xa4cf9(0x6c2,0x67b,0x553,0x5f7),'');else{/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;if(_0x8cc55f)_0x8cc55f[_0x4f06a0(-0x119,-0x126,-0x91,-0xcf)]();}}}});/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== *//* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;_0x22d7a7['name']=_0x1a91a1[_0x3e3298(0x406,0x359,0x3dc,0x2f3)],_0x22d7a7[_0x5cfb72(0x46b,0x414,0x3a2,0x48a)]=_0x1a91a1[_0x5cfb72(0x4fa,0x427,0x44f,0x447)],_0x22d7a7[_0x3e3298(0x312,0x2c3,0x394,0x2f3)]=![],Lampa[_0x5cfb72(0x437,0x375,0x2a8,0x3c4)+'i'][_0x5cfb72(0x49c,0x3ff,0x42f,0x4c6)]({'component':_0x5cfb72(0x519,0x44a,0x3e1,0x441)+_0x3e3298(0x2ff,0x27d,0x33f,0x30a),'param':_0x22d7a7,'field':{'name':Lampa[_0x3e3298(0x122,0x1da,0x232,0x105)][_0x3e3298(0x307,0x2b1,0x1e0,0x1eb)](_0x1a91a1[_0x5cfb72(0x473,0x4d9,0x438,0x4e9)]),'description':Lampa[_0x5cfb72(0x2cf,0x35a,0x3ba,0x3f2)][_0x5cfb72(0x3f2,0x431,0x3b9,0x41a)](_0x5cfb72(0x481,0x44a,0x3ea,0x384)+_0x3e3298(0x361,0x32a,0x3a8,0x356)+_0x3e3298(0x2a5,0x296,0x266,0x2db)+_0x5cfb72(0x4eb,0x41c,0x47d,0x4b8)+'desc')},'onChange':function(_0x27dd21){/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */settings[_0x4ebd77(0x1a2,0x181,0x22a,0xd9)+_0x27062f(0x1e8,0xe8,0x150,0x95)+'o']=_0x27dd21;/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */Lampa[_0x4ebd77(0x175,0xf2,0x1ba,0x19a)]['set'](_0x1a91a1[_0x27062f(0x280,0x242,0x232,0x2c4)],_0x27dd21),Lampa[_0x4ebd77(0xda,0x7b,0x3e,0x68)][_0x27062f(0x170,0x264,0x238,0x18f)]();if(_0x27dd21)enhanceDetailedInfo();else{/* ===== ТУТ МАЄ БУТИ ЗАШИФРОВАНА ЧАСТИНА ===== */;if(_0x44b0f7)_0x44b0f7['remove']();}}});});
    }

    
    function plural(number, one, two, five) {
        var n = Math.abs(number);
        n %= 100;
        if (n >= 5 && n <= 20) return five;
        n %= 10;
        if (n === 1) return one;
        if (n >= 2 && n <= 4) return two;
        return five;
    }

    
    function calculateAverageEpisodeDuration(movie) {
        if (!movie || typeof movie !== 'object') return 0;
        var totalDuration = 0, episodeCount = 0;
        
        if (movie.episode_run_time && Array.isArray(movie.episode_run_time) && movie.episode_run_time.length > 0) {
            var filtered = movie.episode_run_time.filter(function(duration) {
                return duration > 0 && duration <= 200;
            });
            if (filtered.length > 0) {
                filtered.forEach(function(duration) {
                    totalDuration += duration;
                    episodeCount++;
                });
            }
        } else if (movie.seasons && Array.isArray(movie.seasons)) {
            movie.seasons.forEach(function(season) {
                if (season.episodes && Array.isArray(season.episodes)) {
                    season.episodes.forEach(function(episode) {
                        if (episode.runtime && episode.runtime > 0 && episode.runtime <= 200) {
                            totalDuration += episode.runtime;
                            episodeCount++;
                        }
                    });
                }
            });
        }
        if (episodeCount > 0) return Math.round(totalDuration / episodeCount);
        
        if (movie.last_episode_to_air && movie.last_episode_to_air.runtime && movie.last_episode_to_air.runtime > 0 && movie.last_episode_to_air.runtime <= 200) {
            return movie.last_episode_to_air.runtime;
        }
        
        return 0;
    }
		function formatDurationMinutes(minutes) {
		if (!minutes || minutes <= 0) return '';
		var hours = Math.floor(minutes / 60);
		var mins = minutes % 60;
		var result = '';
		if (hours > 0) {
        result += hours + ' ' + plural(hours, 'година', 'години', 'годин');
        if (mins > 0) result += ' ' + mins + ' ' + plural(mins, 'хвилина', 'хвилини', 'хвилин');
		} else {
        result += mins + ' ' + plural(mins, 'хвилина', 'хвилини', 'хвилин');
		}
		return result;
	}

    
    function newInfoPanel() {
        if (!settings.info_panel) return;
        var colors = {
            seasons: { bg: 'rgba(52, 152, 219, 0.8)', text: 'white' },
            episodes: { bg: 'rgba(46, 204, 113, 0.8)', text: 'white' },
            duration: { bg: 'rgba(52, 152, 219, 0.8)', text: 'white' },
            next: { bg: 'rgba(230, 126, 34, 0.8)', text: 'white' },
            genres: {
					'Бойовик': { bg: 'rgba(231, 76, 60, 0.8)', text: 'white' },
					'Пригоди': { bg: 'rgba(39, 174, 96, 0.8)', text: 'white' },
					'Мультфільм': { bg: 'rgba(155, 89, 182, 0.8)', text: 'white' },
					'Комедія': { bg: 'rgba(241, 196, 15, 0.8)', text: 'black' },
					'Кримінал': { bg: 'rgba(192, 57, 43, 0.8)', text: 'white' },
					'Документальний': { bg: 'rgba(22, 160, 133, 0.8)', text: 'white' },
					'Драма': { bg: 'rgba(142, 68, 173, 0.8)', text: 'white' },
					'Сімейний': { bg: 'rgba(46, 204, 113, 0.8)', text: 'white' },
					'Фентезі': { bg: 'rgba(155, 89, 182, 0.8)', text: 'white' },
					'Історія': { bg: 'rgba(211, 84, 0, 0.8)', text: 'white' },
					'Жахи': { bg: 'rgba(192, 57, 43, 0.8)', text: 'white' },
					'Музика': { bg: 'rgba(52, 152, 219, 0.8)', text: 'white' },
					'Детектив': { bg: 'rgba(52, 73, 94, 0.8)', text: 'white' },
					'Мелодрама': { bg: 'rgba(233, 30, 99, 0.8)', text: 'white' },
					'Фантастика': { bg: 'rgba(41, 128, 185, 0.8)', text: 'white' },
					'Трилер': { bg: 'rgba(192, 57, 43, 0.8)', text: 'white' },
					'Військовий': { bg: 'rgba(127, 140, 141, 0.8)', text: 'white' },
					'Вестерн': { bg: 'rgba(211, 84, 0, 0.8)', text: 'white' },
					'Бойовик і Пригоди': { bg: 'rgba(231, 76, 60, 0.8)', text: 'white' },
					'Дитячий': { bg: 'rgba(46, 204, 113, 0.8)', text: 'white' },
					'Новини': { bg: 'rgba(52, 152, 219, 0.8)', text: 'white' },
					'Реаліті-шоу': { bg: 'rgba(230, 126, 34, 0.8)', text: 'white' },
					'НФ і Фентезі': { bg: 'rgba(41, 128, 185, 0.8)', text: 'white' },
					'Мильна опера': { bg: 'rgba(233, 30, 99, 0.8)', text: 'white' },
					'Ток-шоу': { bg: 'rgba(241, 196, 15, 0.8)', text: 'black' },
					'Війна і Політика': { bg: 'rgba(127, 140, 141, 0.8)', text: 'white' }
            }
        };
        Lampa.Listener.follow('full', function(data) {
            if (data.type === 'complite' && settings.info_panel) {
                setTimeout(function() {
                    var details = $('.full-start-new__details');
                    if (!details.length) return;
                    var movie = data.data.movie;
                    var isTvShow = movie && (movie.number_of_seasons > 0 || (movie.seasons && movie.seasons.length > 0) || movie.type === 'tv' || movie.type === 'serial');
                    var originalDetails = details.html();
                    details.empty();
                    var newContainer = $('<div>').css({
                        'display': 'flex',
                        'flex-direction': 'column',
                        'width': '100%',
                        'gap': '0em',
                        'margin': '-1.0em 0 0.2em 0.45em' 
                    });
                    var firstRow = $('<div>').css({
                        'display': 'flex',
                        'flex-wrap': 'wrap',
                        'gap': '0.2em',
                        'align-items': 'center',
                        'margin': '0 0 0.2em 0'
                    });
                    var secondRow = $('<div>').css({
                        'display': 'flex',
                        'flex-wrap': 'wrap',
                        'gap': '0.2em',
                        'align-items': 'center',
                        'margin': '0 0 0.2em 0'
                    });
                    var thirdRow = $('<div>').css({
                        'display': 'flex',
                        'flex-wrap': 'wrap',
                        'gap': '0.2em',
                        'align-items': 'center',
                        'margin': '0 0 0.2em 0'
                    });
                    var durationElement = null, seasonElements = [], episodeElements = [], nextEpisodeElements = [], genreElements = [];
                    var tempContainer = $('<div>').html(originalDetails);
                    
                    tempContainer.find('span').filter(function() {
                        var t = $(this).text();
                        return t.indexOf('Наступна:') !== -1 || t.indexOf('Залишилось днів:') !== -1;
                    }).remove();
                    tempContainer.find('span').each(function() {
                        var $span = $(this);
                        var text = $span.text();
                        if ($span.hasClass('full-start-new__split')) return;
                        var baseStyle = { 'border-radius': '0.3em', 'border': '0px', 'font-size': '1.0em', 'padding': '0.2em 0.6em', 'display': 'inline-block', 'white-space': 'nowrap', 'line-height': '1.2em', 'margin-right': '0.4em', 'margin-bottom': '0.2em' };
                        
                        var matchSeasons = text.match(/Сезон(?:ы)?:?\s*(\d+)/i);
                        if (matchSeasons) {
                            var n = parseInt(matchSeasons[1], 10);
                            $span.text(n + ' ' + plural(n, 'Сезон', 'Сезону', 'Сезонів'));
                            $span.css($.extend({}, baseStyle, { 'background-color': colors.seasons.bg, 'color': colors.seasons.text }));
                            seasonElements.push($span.clone());
                            return;
                        }
                        
                        var matchEpisodes = text.match(/Серії?:?\s*(\d+)/i);
                        if (matchEpisodes) {
                            var n = parseInt(matchEpisodes[1], 10);
                            $span.text(n + ' ' + plural(n, 'Серія', 'Серії', 'Серій'));
                            $span.css($.extend({}, baseStyle, { 'background-color': colors.episodes.bg, 'color': colors.episodes.text }));
                            episodeElements.push($span.clone());
                            return;
                        }
                        
                        var genres = text.split(' | ');
                        if (genres.length > 1) {
                            var $genresContainer = $('<div>').css({ 'display': 'flex', 'flex-wrap': 'wrap', 'align-items': 'center' });
                            for (var i = 0; i < genres.length; i++) {
                                var genre = genres[i].trim();
                                var color = colors.genres[genre] || { bg: 'rgba(255, 255, 255, 0.1)', text: 'white' };
                                var $badge = $('<span>').text(genre).css($.extend({}, baseStyle, { 'background-color': color.bg, 'color': color.text })); 
                                $genresContainer.append($badge);
                            }
                            genreElements.push($genresContainer);
                        } else {
                            var genre = text.trim();
                            var color = colors.genres[genre] || { bg: 'rgba(255, 255, 255, 0.1)', text: 'white' };
                            $span.css($.extend({}, baseStyle, { 'background-color': color.bg, 'color': color.text, /*'margin': '0.2em'*/ }));
                            genreElements.push($span.clone());
                        }
                    });
                    
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
                        
                        console.log('[interface_mod_new] airedEpisodes:', airedEpisodes, 'totalEpisodes:', totalEpisodes, movie);
                        
                        if (!hasEpisodes && movie.next_episode_to_air && movie.next_episode_to_air.season_number && movie.next_episode_to_air.episode_number) {
                            var nextSeason = movie.next_episode_to_air.season_number;
                            var nextEpisode = movie.next_episode_to_air.episode_number;
                            var remainingEpisodes = 0;
                            movie.seasons.forEach(function(season) {
                                if (season.season_number === nextSeason) {
                                    remainingEpisodes = (season.episode_count || 0) - nextEpisode + 1;
                                } else if (season.season_number > nextSeason) {
                                    remainingEpisodes += season.episode_count || 0;
                                }
                            });
                            if (remainingEpisodes > 0 && totalEpisodes > 0) {
                                var calculatedAired = totalEpisodes - remainingEpisodes;
                                if (calculatedAired >= 0 && calculatedAired <= totalEpisodes) {
                                    airedEpisodes = calculatedAired;
                                }
                            }
                        }
                        
                        var episodesText = '';
                        if (totalEpisodes > 0 && airedEpisodes > 0 && airedEpisodes < totalEpisodes) {
                            episodesText = airedEpisodes + ' ' + plural(airedEpisodes, 'Серія', 'Серії', 'Серій') + ' з ' + totalEpisodes;
                        } else if (totalEpisodes > 0) {
                            episodesText = totalEpisodes + ' ' + plural(totalEpisodes, 'Серія', 'Серії', 'Серій');
                        }
                        
                        
                        firstRow.empty();
                        seasonElements.forEach(function(el) { firstRow.append(el); });
                        
                        
                        if (episodesText) {
                            var baseStyle = { 'border-radius': '0.3em', 'border': '0px', 'font-size': '1.0em', 'padding': '0.2em 0.6em', 'display': 'inline-block', 'white-space': 'nowrap', 'line-height': '1.2em', 'margin-right': '0.4em', 'margin-bottom': '0.2em' };
                            var $badge = $('<span>').text(episodesText).css($.extend({}, baseStyle, { 'background-color': colors.episodes.bg, 'color': colors.episodes.text }));
                            firstRow.append($badge);
                        }
                        
                        secondRow.empty();
                        if (movie.next_episode_to_air && movie.next_episode_to_air.air_date && airedEpisodes < totalEpisodes) {
                            var nextDate = new Date(movie.next_episode_to_air.air_date);
                            var today = new Date();
                            nextDate.setHours(0,0,0,0);
                            today.setHours(0,0,0,0);
                            var diffDays = Math.floor((nextDate.getTime() - today.getTime()) / (1000*60*60*24));
                            var nextText = '';
                            if (diffDays === 0) nextText = 'Наступна серія вже сьогодні';
                            else if (diffDays === 1) nextText = 'Наступна серія вже завтра';
                            else if (diffDays > 1) nextText = 'Наступна серія через ' + diffDays + ' ' + plural(diffDays, 'день', 'дні', 'днів');
                            if (nextText) {
                                var nextStyle = { 'border-radius': '0.3em', 'border': '0px', 'font-size': '1.0em', 'padding': '0.2em 0.6em', 'display': 'inline-block', 'white-space': 'nowrap', 'line-height': '1.2em', 'background-color': colors.next.bg, 'color': colors.next.text, 'margin-right': '0.4em', 'margin-bottom': '0.2em' };
                                var $nextBadge = $('<span>').text(nextText).css(nextStyle);
                                secondRow.append($nextBadge);
                            }
                        }
                        
                        thirdRow.empty();
                        var avgDuration = calculateAverageEpisodeDuration(movie);
                        if (avgDuration > 0) {
                            var durationText = 'Тривалість серії ≈ ' + formatDurationMinutes(avgDuration);
                            var baseStyle = { 'border-radius': '0.3em', 'border': '0px', 'font-size': '1.0em', 'padding': '0.2em 0.6em', 'display': 'inline-block', 'white-space': 'nowrap', 'line-height': '1.2em', 'margin-right': '0.2em', 'margin-bottom': '0.2em' }; 
                            var $avgDurationBadge = $('<span>').text(durationText).css($.extend({}, baseStyle, { 'background-color': colors.duration.bg, 'color': colors.duration.text }));
                            thirdRow.append($avgDurationBadge);
                        }
                        
                        var genresRow = $('<div>').css({
   						'display':'flex',
    					'flex-wrap':'wrap',
    					'gap':'0.2em',
    					'align-items':'flex-start', 
    					'margin':'0 0 0.2em 0'
						});
			


genreElements.forEach(function(el) {
    if (!isTvShow && el.children().length > 1) { 
        el.css({ 'margin-left': '0' });
    }
    genresRow.append(el);
});
			
                        genreElements.forEach(function(el) { genresRow.append(el); });
                        
                        newContainer.empty();
                        newContainer.append(firstRow);
                        if (secondRow.children().length) newContainer.append(secondRow);
                        if (thirdRow.children().length) newContainer.append(thirdRow);
                        if (genresRow.children().length) newContainer.append(genresRow);
                        details.append(newContainer);
                        return;
                    }
                    
                    
                    if (!isTvShow && movie && movie.runtime > 0) {
                        
                        tempContainer.find('span').filter(function() {
                            var t = $(this).text().trim();
                            return /^\d{2}:\d{2}$/.test(t) || t.indexOf('Тривалість серії ≈') === 0;
                        }).remove();
                        
                        genreElements = genreElements.filter(function(el) {
                            var t = $(el).text().trim();
                            return !/^\d{2}:\d{2}$/.test(t);
                        });
                        
                        var mins = movie.runtime;
                        var hours = Math.floor(mins / 60);
                        var min = mins % 60;
                        var text = 'Тривалість фільму: ';
                        if (hours > 0) text += hours + ' ' + plural(hours, 'година', 'години', 'годин');
                        if (min > 0) text += (hours > 0 ? ' ' : '') + min + ' хв.';
                        var $badge = $('<span>').text(text).css({
                            'border-radius': '0.3em',
                            'border': '0px',
                            'font-size': '1.0em',
                            'padding': '0.2em 0.6em',
                            'display': 'inline-block',
                            'white-space': 'nowrap',
                            'line-height': '1.2em',
                            'background-color': colors.duration.bg,
                            'color': colors.duration.text,
                            //'margin': '0.2em',
                            'margin-right': '0.4em',
                            'margin-bottom': '0.2em'
                        });
                        secondRow.empty().append($badge);
                    } else if (isTvShow) {
                        var avgDuration = calculateAverageEpisodeDuration(movie);
                        if (avgDuration > 0) {
                            var durationText = 'Тривалість серії ≈ ' + formatDurationMinutes(avgDuration);
                            var baseStyle = { 'border-radius': '0.3em', 'border': '0px', 'font-size': '1.0em', 'padding': '0.2em 0.6em', 'display': 'inline-block', 'white-space': 'nowrap', 'line-height': '1.2em', 'margin-right': '0.4em', 'margin-bottom': '0.2em' };
                            var $avgDurationBadge = $('<span>').text(durationText).css($.extend({}, baseStyle, { 'background-color': colors.duration.bg, 'color': colors.duration.text }));
                            secondRow.prepend($avgDurationBadge);
                        }
                    }
                    
                    if (durationElement) firstRow.append(durationElement);
                    seasonElements.forEach(function(el) { firstRow.append(el); });
                    episodeElements.forEach(function(el) { firstRow.append(el); });
                    nextEpisodeElements.forEach(function(el) { firstRow.append(el); });
                    genreElements.forEach(function(el) { thirdRow.append(el); });
                    newContainer.append(firstRow).append(secondRow).append(thirdRow);
                    details.append(newContainer);
                }, 100);
            }
        });
    }

    
    function updateVoteColors() {
        if (!settings.colored_ratings) return;
        function applyColorByRating(element) {
            var voteText = $(element).text().trim();
            var match = voteText.match(/(\d+(\.\d+)?)/);
            if (!match) return;
            var vote = parseFloat(match[0]);
            if (vote >= 0 && vote <= 3) {
                $(element).css('color', 'red');
            } else if (vote > 3 && vote < 6) {
                $(element).css('color', 'orange');
            } else if (vote >= 6 && vote < 8) {
                $(element).css('color', 'cornflowerblue');
            } else if (vote >= 8 && vote <= 10) {
                $(element).css('color', 'lawngreen');
            }
        }
        $(".card__vote").each(function() { applyColorByRating(this); });
        $(".full-start__rate, .full-start-new__rate").each(function() { applyColorByRating(this); });
        $(".info__rate, .card__imdb-rate, .card__kinopoisk-rate").each(function() { applyColorByRating(this); });
    }
    function setupVoteColorsObserver() {
        if (!settings.colored_ratings) return;
        setTimeout(updateVoteColors, 500);
        var observer = new MutationObserver(function() { setTimeout(updateVoteColors, 100); });
        observer.observe(document.body, { childList: true, subtree: true });
    }
    function setupVoteColorsForDetailPage() {
        if (!settings.colored_ratings) return;
        Lampa.Listener.follow('full', function (data) {
            if (data.type === 'complite') {
                setTimeout(updateVoteColors, 100);
            }
        });
    }
    function colorizeSeriesStatus() {
        function applyStatusColor(statusElement) {
            var statusText = $(statusElement).text().trim();
            var statusColors = {
                'completed': { bg: 'rgba(46, 204, 113, 0.8)', text: 'white' },
                'canceled': { bg: 'rgba(231, 76, 60, 0.8)', text: 'white' },
                'ongoing': { bg: 'rgba(243, 156, 18, 0.8)', text: 'black' },
                'production': { bg: 'rgba(52, 152, 219, 0.8)', text: 'white' },
                'planned': { bg: 'rgba(155, 89, 182, 0.8)', text: 'white' },
                'pilot': { bg: 'rgba(230, 126, 34, 0.8)', text: 'white' },
                'released': { bg: 'rgba(26, 188, 156, 0.8)', text: 'white' },
                'rumored': { bg: 'rgba(149, 165, 166, 0.8)', text: 'white' },
                'post': { bg: 'rgba(0, 188, 212, 0.8)', text: 'white' }
            };
            var bgColor = '', textColor = '';
            if (statusText.includes('Заверш') || statusText.includes('Ended')) { bgColor = statusColors.completed.bg; textColor = statusColors.completed.text; }
            else if (statusText.includes('Скасован') || statusText.includes('Canceled')) { bgColor = statusColors.canceled.bg; textColor = statusColors.canceled.text; }
            else if (statusText.includes('Онгоїнг') || statusText.includes('Выход') || statusText.includes('В процессе') || statusText.includes('Return')) { bgColor = statusColors.ongoing.bg; textColor = statusColors.ongoing.text; }
            else if (statusText.includes('виробництві') || statusText.includes('Production')) { bgColor = statusColors.production.bg; textColor = statusColors.production.text; }
            else if (statusText.includes('Запланировано') || statusText.includes('Planned')) { bgColor = statusColors.planned.bg; textColor = statusColors.planned.text; }
            else if (statusText.includes('Пилотный') || statusText.includes('Pilot')) { bgColor = statusColors.pilot.bg; textColor = statusColors.pilot.text; }
            else if (statusText.includes('Выпущенный') || statusText.includes('Released')) { bgColor = statusColors.released.bg; textColor = statusColors.released.text; }
            else if (statusText.includes('слухам') || statusText.includes('Rumored')) { bgColor = statusColors.rumored.bg; textColor = statusColors.rumored.text; }
            else if (statusText.includes('Скоро') || statusText.includes('Post')) { bgColor = statusColors.post.bg; textColor = statusColors.post.text; }
            if (bgColor) {
                $(statusElement).css({
                    'background-color': bgColor,
                    'color': textColor,
                    'border-radius': '0.3em',
                    'border': '0px',
                    'font-size': '1.3em', 
                    'display': 'inline-block'
                });
            }
        }
        $('.full-start__status').each(function() { applyStatusColor(this); });
        var statusObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length) {
                    for (var i = 0; i < mutation.addedNodes.length; i++) {
                        var node = mutation.addedNodes[i];
                        $(node).find('.full-start__status').each(function() { applyStatusColor(this); });
                        if ($(node).hasClass('full-start__status')) { applyStatusColor(node); }
                    }
                }
            });
        });
        statusObserver.observe(document.body, { childList: true, subtree: true });
        Lampa.Listener.follow('full', function(data) {
            if (data.type === 'complite' && data.data.movie) {
                setTimeout(function() {
                    $(data.object.activity.render()).find('.full-start__status').each(function() { applyStatusColor(this); });
                }, 100);
            }
        });
    }
    function colorizeAgeRating() {
        function applyAgeRatingColor(ratingElement) {
            var ratingText = $(ratingElement).text().trim();
            var ageRatings = {
                kids: ['G', 'TV-Y', 'TV-G', '0+', '3+', '0', '3'],
                children: ['PG', 'TV-PG', 'TV-Y7', '6+', '7+', '6', '7'],
                teens: ['PG-13', 'TV-14', '12+', '13+', '14+', '12', '13', '14'],
                almostAdult: ['R', 'TV-MA', '16+', '17+', '16', '17'],
                adult: ['NC-17', '18+', '18', 'X']
            };
            var colors = {
                kids: { bg: '#2ecc71', text: 'white' },
                children: { bg: '#3498db', text: 'white' },
                teens: { bg: '#f1c40f', text: 'black' },
                almostAdult: { bg: '#e67e22', text: 'white' },
                adult: { bg: '#e74c3c', text: 'white' }
            };
            var group = null;
            for (var groupKey in ageRatings) {
                if (ageRatings[groupKey].includes(ratingText)) { group = groupKey; break; }
                for (var i = 0; i < ageRatings[groupKey].length; i++) {
                    if (ratingText.includes(ageRatings[groupKey][i])) { group = groupKey; break; }
                }
                if (group) break;
            }
            if (group) {
                $(ratingElement).css({
                    'background-color': colors[group].bg,
                    'color': colors[group].text,
                    'border-radius': '0.3em',
                    'font-size': '1.3em',
                    'border': '0px'
                });
            }
        }
        $('.full-start__pg').each(function() { applyAgeRatingColor(this); });
        var ratingObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes && mutation.addedNodes.length) {
                    for (var i = 0; i < mutation.addedNodes.length; i++) {
                        var node = mutation.addedNodes[i];
                        $(node).find('.full-start__pg').each(function() { applyAgeRatingColor(this); });
                        if ($(node).hasClass('full-start__pg')) { applyAgeRatingColor(node); }
                    }
                }
            });
        });
        ratingObserver.observe(document.body, { childList: true, subtree: true });
        Lampa.Listener.follow('full', function(data) {
            if (data.type === 'complite' && data.data.movie) {
                setTimeout(function() {
                    $(data.object.activity.render()).find('.full-start__pg').each(function() { applyAgeRatingColor(this); });
                }, 100);
            }
        });
    }
    

    
    function stringToColor(str) {
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        var color = '#';
        for (var i = 0; i < 3; i++) {
            var value = (hash >> (i * 8)) & 0xFF;
            color += ('00' + value.toString(16)).substr(-2);
        }
        return color;
    }
    
    
    function extractProviderIcon(btn) {
        var iconHtml = '';
        
        
        if (btn.find('svg').length) {
            var icon = btn.find('svg').clone();
            
            var originalViewBox = icon.attr('viewBox');
            
            icon.removeAttr('width height style x y class version xml:space');
            if (!originalViewBox) {
                
                icon.attr('viewBox', '0 0 512 512');
            }
            
            icon.attr({
                width: 32,
                height: 32,
                style: 'width:32px;height:32px;display:block;'
            });
            
            
            if (icon.find('path').length === 0 && icon.find('g').length === 0) {
                
                iconHtml = '<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">' + 
                    btn.find('svg').parent().html() + '</div>';
            } else {
                iconHtml = icon[0].outerHTML;
            }
        }
        
        else if (btn.find('img').length) {
            var imgSrc = btn.find('img').attr('src');
            iconHtml = '<img src="' + imgSrc + '" style="width:32px;height:32px;display:block;object-fit:contain;" />';
        }
        
        else if (btn.find('.ico').length) {
            var icoElement = btn.find('.ico').clone();
            
            if (icoElement.find('svg').length) {
                iconHtml = '<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">' + 
                    icoElement.html() + '</div>';
            } else {
                icoElement.attr('style', 'width:32px;height:32px;display:block;');
                iconHtml = icoElement[0].outerHTML;
            }
        }
        
        else if (btn.find('.button__ico').length) {
            var buttonIco = btn.find('.button__ico').clone();
            
            if (buttonIco.find('svg').length) {
                iconHtml = '<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">' + 
                    buttonIco.html() + '</div>';
            } else {
                buttonIco.attr('style', 'width:32px;height:32px;display:block;');
                iconHtml = buttonIco[0].outerHTML;
            }
        }
        
        else {
            var elemWithBg = btn.find('[style*="background-image"]');
            if (elemWithBg.length) {
                var bgStyle = elemWithBg.css('background-image');
                if (bgStyle && bgStyle.indexOf('url') !== -1) {
                    iconHtml = '<div style="width:32px;height:32px;display:block;background-image:' + bgStyle + ';background-size:contain;background-position:center;background-repeat:no-repeat;"></div>';
                }
            }
            
            else {
                var possibleIcons = btn.find('.icon, .logo, [class*="icon"], [class*="logo"]').first();
                if (possibleIcons.length) {
                    
                    if (possibleIcons.find('svg').length) {
                        iconHtml = '<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">' + 
                            possibleIcons.html() + '</div>';
                    } else {
                        var possibleIcon = possibleIcons.clone();
                        possibleIcon.attr('style', 'width:32px;height:32px;display:block;');
                        iconHtml = possibleIcon[0].outerHTML;
                    }
                }
                
                else {
                    var dataIcon = btn.attr('data-icon') || btn.attr('data-logo');
                    if (dataIcon) {
                        if (dataIcon && (dataIcon.indexOf('<svg') === 0 || dataIcon.indexOf('<img') === 0)) {
                            iconHtml = dataIcon;
                        } else if (dataIcon && (dataIcon.indexOf('http') === 0 || dataIcon.indexOf('/') === 0)) {
                            iconHtml = '<img src="' + dataIcon + '" style="width:32px;height:32px;display:block;object-fit:contain;" />';
                        }
                    }
                    
                    else {
                        var providerName = btn.text().trim();
                        if (providerName) {
                            var firstLetter = providerName.charAt(0).toUpperCase();
                            var backgroundColor = stringToColor(providerName);
                            iconHtml = '<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;background-color:' + backgroundColor + ';color:white;border-radius:50%;font-weight:bold;font-size:18px;">' + firstLetter + '</div>';
                        }
                    }
                }
            }
        }
        return iconHtml;
    }

    
    function createMoreButtonMenu(otherButtons) {
        return function() {
            var items = [];
            otherButtons.forEach(function(btn) {
                var btnText = btn.text().trim();
                var subtitle = btn.attr('data-subtitle') || btn.data('subtitle') || btn.attr('title') || '';
                var iconHtml = extractProviderIcon(btn);
                
                items.push({
                    title: btnText,
                    icon: iconHtml,
                    subtitle: subtitle,
                    btn: btn
                });
            });
            
            Lampa.Select.show({
                title: 'Дополнительные опции',
                items: items,
                onSelect: function(selected) {
                    if (selected && selected.btn) {
                        selected.btn.trigger('hover:enter');
                    }
                },
                onBack: function() {}
            });
            
            setTimeout(function() {
                $('.selectbox-item').each(function(i) {
                    if (items[i]) {
                        var iconHtml = '';
                        if (items[i].icon) {
                            iconHtml = '<div class="menu__ico plugin-menu-ico" style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;margin-right:0.7em;flex-shrink:0;padding:2px;position:absolute;left:10px;top:50%;transform:translateY(-50%);overflow:hidden;">' + items[i].icon + '</div>';
                        }
                        
                        $(this).css({
                            'position': 'relative',
                            'padding-left': items[i].icon ? '56px' : '16px'
                        }).prepend(iconHtml);
                        
                        
                        $(this).find('.menu__ico svg').css({
                            'width': '100%',
                            'height': '100%',
                            'max-width': '32px',
                            'max-height': '32px'
                        });
                        
                        
                        $(this).find('.menu__ico svg > *').each(function() {
                            
                            var svg = $(this).closest('svg');
                            if (!svg.attr('viewBox') || svg.attr('viewBox') === '0 0 24 24') {
                                
                                var paths = svg.find('path');
                                if (paths.length) {
                                    svg.attr('viewBox', '0 0 512 512');
                                    svg.attr('preserveAspectRatio', 'xMidYMid meet');
                                }
                            }
                        });
                        
                        
                        $(this).on('hover:focus hover:hover', function(){
                            $(this).find('.menu__ico').css({
                                'transform': 'translateY(-50%) scale(1.1)',
                                'transition': 'all 0.3s'
                            });
                        }).on('hover:blur', function(){
                            $(this).find('.menu__ico').css({
                                'transform': 'translateY(-50%)',
                                'transition': 'all 0.3s'
                            });
                        });
                    }
                });
            }, 50);
        };
    }

    
    function showAllButtons() {
        
        
        

        
        if (!document.getElementById('interface_mod_new_buttons_style')) {
            var buttonStyle = document.createElement('style');
            buttonStyle.id = 'interface_mod_new_buttons_style';
            buttonStyle.innerHTML = `
                .full-start-new__buttons, .full-start__buttons {
                    display: flex !important;
                    flex-wrap: wrap !important;
                    gap: 0.7em !important;
                }
                    .custom-online-btn { background-color: #2f2f2fd1; box-shadow: 0 0 13px #00b2ff; margin: 0.6em; margin-right: 1.1em; }
                    .custom-torrent-btn { background-color: #2f2f2fd1; box-shadow: 0 0 13px #00ff40; }
                    .main2-more-btn { background-color: #2f2f2fd1; margin-left: 1.4em; font-weight: bold; box-shadow: 0 0 13px #e67e22; }
                
                @media (max-width: 600px) {
                    .custom-online-btn { background-color: #2f2f2fd1; box-shadow: 0 0 8px #00b2ff; margin: 0.8em; }
                    .custom-torrent-btn { background-color: #2f2f2fd1; box-shadow: 0 0 8px #00ff40; }
                    .main2-more-btn { background-color: #2f2f2fd1; margin-left: 1.4em; font-weight: bold; box-shadow: 0 0 8px #e67e22; }

                    
                     .full-start__button.focus,
                     .custom-online-btn.focus,
                     .custom-torrent-btn.focus,
                     .main2-more-btn.focus {
                        background: none;
                        background-color: #2f2f2fd1;
                        color: #fff;
                        filter: none;
                    }
                }
            `;
            document.head.appendChild(buttonStyle);
        }

        var originFullCard;
        if (Lampa.FullCard) {
            originFullCard = Lampa.FullCard.build;
            Lampa.FullCard.build = function(data) {
                var card = originFullCard(data);
                card.organizeButtons = function() {
                    var activity = card.activity;
                    if (!activity) return;
                    var element = activity.render();
                    if (!element) return;
                    var targetContainer = element.find('.full-start-new__buttons');
                    if (!targetContainer.length) targetContainer = element.find('.full-start__buttons');
                    if (!targetContainer.length) targetContainer = element.find('.buttons-container');
                    if (!targetContainer.length) return;

                    var allButtons = [];
                    var buttonSelectors = [
                        '.buttons--container .full-start__button',
                        '.full-start-new__buttons .full-start__button',
                        '.full-start__buttons .full-start__button',
                        '.buttons-container .button',
                        '.full-start-new__buttons .button',
                        '.full-start__buttons .button'
                    ];
                    buttonSelectors.forEach(function(selector) {
                        element.find(selector).each(function() {
                            allButtons.push(this);
                        });
                    });
                    if (allButtons.length === 0) return;

                    var categories = {
                        online: [],
                        torrent: [],
                        trailer: [],
                        other: []
                    };
                    var addedButtonTexts = {};
                    $(allButtons).each(function() {
                        var button = this;
                        var buttonText = $(button).text().trim();
                        var className = button.className || '';
                        if (!buttonText || addedButtonTexts[buttonText]) return;
                        addedButtonTexts[buttonText] = true;
                        if (className.includes('online')) {
                            categories.online.push(button);
                        } else if (className.includes('torrent')) {
                            categories.torrent.push(button);
                        } else if (className.includes('trailer')) {
                            categories.trailer.push(button);
                        } else {
                            categories.other.push(button);
                        }
                    });
                    var buttonSortOrder = ['online', 'torrent', 'trailer', 'other'];
                    var needToggle = Lampa.Controller.enabled().name === 'full_start';
                    if (needToggle) Lampa.Controller.toggle('settings_component');
                    var originalElements = targetContainer.children().detach();
                    targetContainer.css({
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.7em'
                    });
                    buttonSortOrder.forEach(function(category) {
                        categories[category].forEach(function(button) {
                            targetContainer.append(button);
                        });
                    });
                    
                    if (settings.buttons_style_mode === 'main2') {
                        
                        var allOnlineButtons = [];
                        var seenOnlineTexts = {};
                        $(allButtons).each(function() {
                            var btn = $(this);
                            if (Array.prototype.slice.call(btn[0].classList).some(function(cls){ return cls.indexOf('view--online') === 0; })) {
                                var key = btn.text().trim() + (btn.attr('data-subtitle') || '');
                                if (!seenOnlineTexts[key]) {
                                    allOnlineButtons.push(btn);
                                    seenOnlineTexts[key] = true;
                                }
                            }
                        });
                        allButtons.forEach(function(btn) { $(btn).hide(); });
                        var origOnline = targetContainer.find('.full-start__button.view--online');
                        var origTorrent = targetContainer.find('.full-start__button.view--torrent');
                        origOnline.hide();
                        origTorrent.hide();
                        targetContainer.find('.custom-online-btn, .custom-torrent-btn, .main2-more-btn, .main2-menu').remove();
                        
                        var onlineBtn = $('<div class="full-start__button selector custom-online-btn main2-big-btn" tabindex="0"></div>')
                            .text('Онлайн')
                            .attr('data-subtitle', 'Lampac v1.4.8')
                            .on('hover:focus', function(){ $(this).addClass('focus'); })
                            .on('hover:blur', function(){ $(this).removeClass('focus'); });
                        
                        var onlineMenu = $('<div class="main2-menu main2-online-menu" style="display:none;"></div>');
                        function showOnlineMenu() {
                            if (allOnlineButtons.length === 0) {
                                Lampa.Noty.show('Нет онлайн-провайдера');
                                return;
                            }
                            if (allOnlineButtons.length === 1) {
                                allOnlineButtons[0].trigger('hover:enter');
                                return;
                            }
                            var items = [];
                            for (var idx = 0; idx < allOnlineButtons.length; idx++) {
                                var btn = allOnlineButtons[idx];
                                var iconHtml = extractProviderIcon(btn);
                                var subtitle = btn.attr('data-subtitle') || btn.data('subtitle') || btn.attr('title') || '';
                                items.push({
                                    title: btn.text().trim(),
                                    icon: iconHtml,
                                    subtitle: subtitle,
                                    idx: idx
                                });
                            }
                            Lampa.Select.show({
                                title: 'Выберите онлайн-провайдера',
                                items: items,
                                onSelect: function(selected) {
                                    if (selected && typeof selected.idx !== 'undefined') {
                                        allOnlineButtons[selected.idx].trigger('hover:enter');
                                    }
                                },
                                onBack: function() {}
                            });
                            setTimeout(function() {
                                $('.selectbox-item').each(function(i) {
                                    if (items[i]) {
                                        var iconHtml = '';
                                        if (items[i].icon) {
                                            iconHtml = '<div class="menu__ico plugin-menu-ico" style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;margin-right:0.7em;flex-shrink:0;padding:2px;position:absolute;left:10px;top:50%;transform:translateY(-50%);overflow:hidden;">' + items[i].icon + '</div>';
                                        }
                                        
                                        $(this).css({
                                            'position': 'relative',
                                            'padding-left': items[i].icon ? '56px' : '16px'
                                        }).prepend(iconHtml);
                                        
                                        
                                        $(this).find('.menu__ico svg').css({
                                            'width': '100%',
                                            'height': '100%',
                                            'max-width': '32px',
                                            'max-height': '32px'
                                        });
                                        
                                        
                                        $(this).find('.menu__ico svg > *').each(function() {
                                            
                                            var svg = $(this).closest('svg');
                                            if (!svg.attr('viewBox') || svg.attr('viewBox') === '0 0 24 24') {
                                                
                                                var paths = svg.find('path');
                                                if (paths.length) {
                                                    svg.attr('viewBox', '0 0 512 512');
                                                    svg.attr('preserveAspectRatio', 'xMidYMid meet');
                                                }
                                            }
                                        });
                                        
                                        
                                        $(this).on('hover:focus hover:hover', function(){
                                            $(this).find('.menu__ico').css({
                                                'transform': 'translateY(-50%) scale(1.1)',
                                                'transition': 'all 0.3s'
                                            });
                                        }).on('hover:blur', function(){
                                            $(this).find('.menu__ico').css({
                                                'transform': 'translateY(-50%)',
                                                'transition': 'all 0.3s'
                                            });
                                        });
                                    }
                                });
                            }, 50);
                        }
                        onlineBtn.on('hover:enter', function() {
                            if (allOnlineButtons.length === 0) {
                                Lampa.Noty.show('Нет онлайн-провайдера');
                                return;
                            }
                            if (allOnlineButtons.length === 1) {
                                allOnlineButtons[0].trigger('hover:enter');
                                return;
                            }
                            var items = [];
                            for (var idx = 0; idx < allOnlineButtons.length; idx++) {
                                var btn = allOnlineButtons[idx];
                                var iconHtml = extractProviderIcon(btn);
                                var subtitle = btn.attr('data-subtitle') || btn.data('subtitle') || btn.attr('title') || '';
                                items.push({
                                    title: btn.text().trim(),
                                    icon: iconHtml,
                                    subtitle: subtitle,
                                    idx: idx
                                });
                            }
                            Lampa.Select.show({
                                title: 'Выберите онлайн-провайдера',
                                items: items,
                                onSelect: function(selected) {
                                    if (selected && typeof selected.idx !== 'undefined') {
                                        allOnlineButtons[selected.idx].trigger('hover:enter');
                                    }
                                },
                                onBack: function() {}
                            });
                            setTimeout(function() {
                                $('.selectbox-item').each(function(i) {
                                    if (items[i]) {
                                        var iconHtml = '';
                                        if (items[i].icon) {
                                            iconHtml = '<div class="menu__ico plugin-menu-ico" style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;margin-right:0.7em;flex-shrink:0;padding:2px;position:absolute;left:10px;top:50%;transform:translateY(-50%);overflow:hidden;">' + items[i].icon + '</div>';
                                        }
                                        
                                        $(this).css({
                                            'position': 'relative',
                                            'padding-left': items[i].icon ? '56px' : '16px'
                                        }).prepend(iconHtml);
                                        
                                        
                                        $(this).find('.menu__ico svg').css({
                                            'width': '100%',
                                            'height': '100%',
                                            'max-width': '32px',
                                            'max-height': '32px'
                                        });
                                        
                                        
                                        $(this).find('.menu__ico svg > *').each(function() {
                                            
                                            var svg = $(this).closest('svg');
                                            if (!svg.attr('viewBox') || svg.attr('viewBox') === '0 0 24 24') {
                                                
                                                var paths = svg.find('path');
                                                if (paths.length) {
                                                    svg.attr('viewBox', '0 0 512 512');
                                                    svg.attr('preserveAspectRatio', 'xMidYMid meet');
                                                }
                                            }
                                        });
                                        
                                        
                                        $(this).on('hover:focus hover:hover', function(){
                                            $(this).find('.menu__ico').css({
                                                'transform': 'translateY(-50%) scale(1.1)',
                                                'transition': 'all 0.3s'
                                            });
                                        }).on('hover:blur', function(){
                                            $(this).find('.menu__ico').css({
                                                'transform': 'translateY(-50%)',
                                                'transition': 'all 0.3s'
                                            });
                                        });
                                    }
                                });
                            }, 50);
                        });
                        
                        onlineMenu.on('keydown', function(e) {
                            if (e.key === 'Back' || e.key === 'Escape') {
                                onlineMenu.hide();
                                onlineBtn.addClass('focus');
                            }
                        });
                        onlineMenu.on('focusout', function() {
                            setTimeout(function() {
                                if (!onlineMenu.find('.focus').length) onlineMenu.hide();
                            }, 100);
                        });
                        
                        var torrentBtn = $('<div class="full-start__button selector custom-torrent-btn main2-big-btn" tabindex="0"></div>')
                            .text('Торрент')
                            .attr('data-subtitle', 'Торрент')
                            .on('hover:focus', function(){ $(this).addClass('focus'); })
                            .on('hover:blur', function(){ $(this).removeClass('focus'); })
                            .on('hover:enter', function() {
                                if (origTorrent.length) origTorrent.first().trigger('hover:enter');
                                else Lampa.Noty.show('Нет торрент-провайдера');
                            });
                        
                        var otherButtons = [];
                        
                        var onlineButtonTexts = {};
                        allOnlineButtons.forEach(function(btn) {
                            var text = $(btn).text().trim();
                            if (text) {
                                onlineButtonTexts[text] = true;
                            }
                        });
                        
                        
                        var hideButtonTexts = {
                            'Смотреть': true,
                            'Подписаться': true
                        };
                        
                        $(allButtons).each(function() {
                            var btn = $(this);
                            var btnText = btn.text().trim();
                            
                            if (!btn.hasClass('view--online') && !btn.hasClass('view--torrent') && 
                                !onlineButtonTexts[btnText] && !hideButtonTexts[btnText]) {
                                otherButtons.push(btn.clone(true, true).removeClass('focus'));
                            }
                        });
                        
                        var moreBtn = $('<div class="full-start__button selector main2-more-btn" tabindex="0">⋯</div>')
                            .on('hover:focus', function(){ $(this).addClass('focus'); })
                            .on('hover:blur', function(){ $(this).removeClass('focus'); });
                        
                        
                        moreBtn.on('hover:enter', createMoreButtonMenu(otherButtons));
                        
                        
                        targetContainer.prepend(moreBtn);
                        targetContainer.prepend(torrentBtn);
                        targetContainer.prepend(onlineBtn);
                        targetContainer.prepend(onlineMenu);
                        
                        setTimeout(function() {
                            targetContainer.find('.custom-online-btn, .custom-torrent-btn, .main2-more-btn').each(function(){
                                this.removeAttribute('style');
                            });
                        }, 10);
                        
                        targetContainer.addClass('controller');
                        Lampa.Controller.enable('full_start');
                        setTimeout(function() {
                            onlineBtn.addClass('focus');
                        }, 100);
                    }
                    
                    if (needToggle) {
                        setTimeout(function() {
                            Lampa.Controller.toggle('full_start');
                        }, 100);
                    }
                };
                card.onCreate = function() {
                    if (settings.buttons_style_mode === 'all' || settings.buttons_style_mode === 'main2') {
                        setTimeout(function() {
                            card.organizeButtons();
                        }, 300);
                    }
                };
                return card;
            };
        }
        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'complite' && e.object && e.object.activity) {
                if ((settings.buttons_style_mode === 'all' || settings.buttons_style_mode === 'main2') && !Lampa.FullCard) {
                    setTimeout(function() {
                        var fullContainer = e.object.activity.render();
                        var targetContainer = fullContainer.find('.full-start-new__buttons');
                        if (!targetContainer.length) targetContainer = fullContainer.find('.full-start__buttons');
                        if (!targetContainer.length) targetContainer = fullContainer.find('.buttons-container');
                        if (!targetContainer.length) return;
                        targetContainer.css({
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.7em'
                        });
                        var allButtons = [];
                        var buttonSelectors = [
                            '.buttons--container .full-start__button',
                            '.full-start-new__buttons .full-start__button',
                            '.full-start__buttons .full-start__button',
                            '.buttons-container .button',
                            '.full-start-new__buttons .button',
                            '.full-start__buttons .button'
                        ];
                        buttonSelectors.forEach(function(selector) {
                            fullContainer.find(selector).each(function() {
                                allButtons.push(this);
                            });
                        });
                        if (allButtons.length === 0) return;
                        var categories = {
                            online: [],
                            torrent: [],
                            trailer: [],
                            other: []
                        };
                        var addedButtonTexts = {};
                        $(allButtons).each(function() {
                            var button = this;
                            var buttonText = $(button).text().trim();
                            var className = button.className || '';
                            if (!buttonText || addedButtonTexts[buttonText]) return;
                            addedButtonTexts[buttonText] = true;
                            if (className.includes('online')) {
                                categories.online.push(button);
                            } else if (className.includes('torrent')) {
                                categories.torrent.push(button);
                            } else if (className.includes('trailer')) {
                                categories.trailer.push(button);
                            } else {
                                categories.other.push(button);
                            }
                        });
                        var buttonSortOrder = ['online', 'torrent', 'trailer', 'other'];
                        var needToggle = Lampa.Controller.enabled().name === 'full_start';
                        if (needToggle) Lampa.Controller.toggle('settings_component');
                        var originalElements = targetContainer.children().detach();
                        buttonSortOrder.forEach(function(category) {
                            categories[category].forEach(function(button) {
                                targetContainer.append(button);
                            });
                        });
                        
                        if (settings.buttons_style_mode === 'main2') {
                            
                            var allOnlineButtons = [];
                            var seenOnlineTexts = {};
                            $(allButtons).each(function() {
                                var btn = $(this);
                                if (Array.prototype.slice.call(btn[0].classList).some(function(cls){ return cls.indexOf('view--online') === 0; })) {
                                    var key = btn.text().trim() + (btn.attr('data-subtitle') || '');
                                    if (!seenOnlineTexts[key]) {
                                        allOnlineButtons.push(btn);
                                        seenOnlineTexts[key] = true;
                                    }
                                }
                            });
                            allButtons.forEach(function(btn) { $(btn).hide(); });
                            var origOnline = targetContainer.find('.full-start__button.view--online');
                            var origTorrent = targetContainer.find('.full-start__button.view--torrent');
                            origOnline.hide();
                            origTorrent.hide();
                            targetContainer.find('.custom-online-btn, .custom-torrent-btn, .main2-more-btn, .main2-menu').remove();
                            
                            var onlineBtn = $('<div class="full-start__button selector custom-online-btn main2-big-btn" tabindex="0"></div>')
                                .text('Онлайн')
                                .attr('data-subtitle', 'Lampac v1.4.8')
                                .on('hover:focus', function(){ $(this).addClass('focus'); })
                                .on('hover:blur', function(){ $(this).removeClass('focus'); });
                            
                            var onlineMenu = $('<div class="main2-menu main2-online-menu" style="display:none;"></div>');
                            function showOnlineMenu() {
                                if (allOnlineButtons.length === 0) {
                                    Lampa.Noty.show('Нет онлайн-провайдера');
                                    return;
                                }
                                if (allOnlineButtons.length === 1) {
                                    allOnlineButtons[0].trigger('hover:enter');
                                    return;
                                }
                                var items = [];
                                for (var idx = 0; idx < allOnlineButtons.length; idx++) {
                                    var btn = allOnlineButtons[idx];
                                    var iconHtml = extractProviderIcon(btn);
                                    var subtitle = btn.attr('data-subtitle') || btn.data('subtitle') || btn.attr('title') || '';
                                    items.push({
                                        title: btn.text().trim(),
                                        icon: iconHtml,
                                        subtitle: subtitle,
                                        idx: idx
                                    });
                                }
                                Lampa.Select.show({
                                    title: 'Выберите онлайн-провайдера',
                                    items: items,
                                    onSelect: function(selected) {
                                        if (selected && typeof selected.idx !== 'undefined') {
                                            allOnlineButtons[selected.idx].trigger('hover:enter');
                                        }
                                    },
                                    onBack: function() {}
                                });
                                setTimeout(function() {
                                    $('.selectbox-item').each(function(i) {
                                        if (items[i]) {
                                            var iconHtml = '';
                                            if (items[i].icon) {
                                                iconHtml = '<div class="menu__ico plugin-menu-ico" style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;margin-right:0.7em;flex-shrink:0;padding:2px;position:absolute;left:10px;top:50%;transform:translateY(-50%);overflow:hidden;">' + items[i].icon + '</div>';
                                            }
                                            
                                            $(this).css({
                                                'position': 'relative',
                                                'padding-left': items[i].icon ? '56px' : '16px'
                                            }).prepend(iconHtml);
                                            
                                            
                                            $(this).find('.menu__ico svg').css({
                                                'width': '100%',
                                                'height': '100%',
                                                'max-width': '32px',
                                                'max-height': '32px'
                                            });
                                            
                                            
                                            $(this).find('.menu__ico svg > *').each(function() {
                                                
                                                var svg = $(this).closest('svg');
                                                if (!svg.attr('viewBox') || svg.attr('viewBox') === '0 0 24 24') {
                                                    
                                                    var paths = svg.find('path');
                                                    if (paths.length) {
                                                        svg.attr('viewBox', '0 0 512 512');
                                                        svg.attr('preserveAspectRatio', 'xMidYMid meet');
                                                    }
                                                }
                                            });
                                            
                                            
                                            $(this).on('hover:focus hover:hover', function(){
                                                $(this).find('.menu__ico').css({
                                                    'transform': 'translateY(-50%) scale(1.1)',
                                                    'transition': 'all 0.3s'
                                                });
                                            }).on('hover:blur', function(){
                                                $(this).find('.menu__ico').css({
                                                    'transform': 'translateY(-50%)',
                                                    'transition': 'all 0.3s'
                                                });
                                            });
                                        }
                                    });
                                }, 50);
                            }
                            onlineBtn.on('hover:enter', function() {
                                if (allOnlineButtons.length === 0) {
                                    Lampa.Noty.show('Нет онлайн-провайдера');
                                    return;
                                }
                                if (allOnlineButtons.length === 1) {
                                    allOnlineButtons[0].trigger('hover:enter');
                                    return;
                                }
                                var items = [];
                                for (var idx = 0; idx < allOnlineButtons.length; idx++) {
                                    var btn = allOnlineButtons[idx];
                                    var iconHtml = extractProviderIcon(btn);
                                    var subtitle = btn.attr('data-subtitle') || btn.data('subtitle') || btn.attr('title') || '';
                                    items.push({
                                        title: btn.text().trim(),
                                        icon: iconHtml,
                                        subtitle: subtitle,
                                        idx: idx
                                });
                                }
                                Lampa.Select.show({
                                    title: 'Выберите онлайн-провайдера',
                                    items: items,
                                    onSelect: function(selected) {
                                        if (selected && typeof selected.idx !== 'undefined') {
                                            allOnlineButtons[selected.idx].trigger('hover:enter');
                                        }
                                    },
                                    onBack: function() {}
                                });
                                setTimeout(function() {
                                    $('.selectbox-item').each(function(i) {
                                        if (items[i]) {
                                            var iconHtml = '';
                                            if (items[i].icon) {
                                                iconHtml = '<div class="menu__ico plugin-menu-ico" style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;margin-right:0.7em;flex-shrink:0;padding:2px;position:absolute;left:10px;top:50%;transform:translateY(-50%);overflow:hidden;">' + items[i].icon + '</div>';
                                            }
                                            
                                            $(this).css({
                                                'position': 'relative',
                                                'padding-left': items[i].icon ? '56px' : '16px'
                                            }).prepend(iconHtml);
                                            
                                            
                                            $(this).find('.menu__ico svg').css({
                                                'width': '100%',
                                                'height': '100%',
                                                'max-width': '32px',
                                                'max-height': '32px'
                                            });
                                            
                                            
                                            $(this).find('.menu__ico svg > *').each(function() {
                                                
                                                var svg = $(this).closest('svg');
                                                if (!svg.attr('viewBox') || svg.attr('viewBox') === '0 0 24 24') {
                                                    
                                                    var paths = svg.find('path');
                                                    if (paths.length) {
                                                        svg.attr('viewBox', '0 0 512 512');
                                                        svg.attr('preserveAspectRatio', 'xMidYMid meet');
                                                    }
                                                }
                                            });
                                            
                                            
                                            $(this).on('hover:focus hover:hover', function(){
                                                $(this).find('.menu__ico').css({
                                                    'transform': 'translateY(-50%) scale(1.1)',
                                                    'transition': 'all 0.3s'
                                                });
                                            }).on('hover:blur', function(){
                                                $(this).find('.menu__ico').css({
                                                    'transform': 'translateY(-50%)',
                                                    'transition': 'all 0.3s'
                                                });
                                            });
                                        }
                                    });
                                }, 50);
                            });
                            
                            onlineMenu.on('keydown', function(e) {
                                if (e.key === 'Back' || e.key === 'Escape') {
                                    onlineMenu.hide();
                                    onlineBtn.addClass('focus');
                                }
                            });
                            onlineMenu.on('focusout', function() {
                                setTimeout(function() {
                                    if (!onlineMenu.find('.focus').length) onlineMenu.hide();
                                }, 100);
                            });
                            
                            var torrentBtn = $('<div class="full-start__button selector custom-torrent-btn main2-big-btn" tabindex="0"></div>')
                                .text('Торрент')
                                .attr('data-subtitle', 'Торрент')
                                .on('hover:focus', function(){ $(this).addClass('focus'); })
                                .on('hover:blur', function(){ $(this).removeClass('focus'); })
                                .on('hover:enter', function() {
                                    if (origTorrent.length) origTorrent.first().trigger('hover:enter');
                                    else Lampa.Noty.show('Нет торрент-провайдера');
                                });
                            
                            var otherButtons = [];
                            
                            var onlineButtonTexts = {};
                            allOnlineButtons.forEach(function(btn) {
                                var text = $(btn).text().trim();
                                if (text) {
                                    onlineButtonTexts[text] = true;
                                }
                            });
                            
                            
                            var hideButtonTexts = {
                                'Смотреть': true,
                                'Подписаться': true
                            };
                            
                            $(allButtons).each(function() {
                                var btn = $(this);
                                var btnText = btn.text().trim();
                                
                                if (!btn.hasClass('view--online') && !btn.hasClass('view--torrent') && 
                                    !onlineButtonTexts[btnText] && !hideButtonTexts[btnText]) {
                                    otherButtons.push(btn.clone(true, true).removeClass('focus'));
                                }
                            });
                            
                            var moreBtn = $('<div class="full-start__button selector main2-more-btn" tabindex="0">⋯</div>')
                                .on('hover:focus', function(){ $(this).addClass('focus'); })
                                .on('hover:blur', function(){ $(this).removeClass('focus'); });
                            
                            
                            moreBtn.on('hover:enter', createMoreButtonMenu(otherButtons));
                            
                            
                            targetContainer.prepend(moreBtn);
                            targetContainer.prepend(torrentBtn);
                            targetContainer.prepend(onlineBtn);
                            targetContainer.prepend(onlineMenu);
                            
                            setTimeout(function() {
                                targetContainer.find('.custom-online-btn, .custom-torrent-btn, .main2-more-btn').each(function(){
                                    this.removeAttribute('style');
                                });
                            }, 10);
                            
                            targetContainer.addClass('controller');
                            Lampa.Controller.enable('full_start');
                            setTimeout(function() {
                                onlineBtn.addClass('focus');
                            }, 100);
                        }
                        
                        
						if (needToggle) {
    					setTimeout(function() {
        					
        					if (Lampa.Controller.enabled() === 'full_start') {
            				Lampa.Controller.toggle('full_start');
        					}
    					}, 100);
						}

						
						/*if (needToggle) {
                            setTimeout(function() {
                                Lampa.Controller.toggle('full_start');
                            }, 100);
                        }*/
                    }, 300);
                }
            }
        });
        var buttonObserver = new MutationObserver(function(mutations) {
            if (settings.buttons_style_mode !== 'all' && settings.buttons_style_mode !== 'main2') return;
            var needReorganize = false;
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' &&
                    (mutation.target.classList.contains('full-start-new__buttons') ||
                        mutation.target.classList.contains('full-start__buttons') ||
                        mutation.target.classList.contains('buttons-container'))) {
                    needReorganize = true;
                }
            });
            if (needReorganize) {
                setTimeout(function() {
                    if (Lampa.FullCard && Lampa.Activity.active() && Lampa.Activity.active().activity.card) {
                        if (typeof Lampa.Activity.active().activity.card.organizeButtons === 'function') {
                            Lampa.Activity.active().activity.card.organizeButtons();
                        }
                    }
                }, 100);
            }
        });
        buttonObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    
    function applyTheme(theme) {
        
        const oldStyle = document.querySelector('#interface_mod_theme');
        if (oldStyle) oldStyle.remove();

        
        if (theme === 'default') {
            
            document.querySelectorAll('[id^="theme-style-"]').forEach(function(el) {
                el.disabled = true;
            });
            return;
        }

        
        var externalThemeStyle = document.querySelector('#theme-style-' + theme);
        if (externalThemeStyle) {
            
            document.querySelectorAll('[id^="theme-style-"]').forEach(function(el) {
                el.disabled = true;
            });
            
            externalThemeStyle.disabled = false;
            return;
        }

        
        const style = document.createElement('style');
        style.id = 'interface_mod_theme';


const themes = {
    neon: `
        body { background: linear-gradient(135deg, #0d0221 0%, #150734 50%, #1f0c47 100%) !important; color: #ffffff !important; }
        .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
        .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
            background: linear-gradient(to right, #ff00ff, #00ffff) !important;
            color: #fff !important;
            box-shadow: 0 0 20px rgba(255, 0, 255, 0.4) !important;
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.5) !important;
            border: none !important;
        }
        .card.focus .card__view::after, .card.hover .card__view::after {
            border: 2px solid #ff00ff !important;
            box-shadow: 0 0 20px #00ffff !important;
        }
        .head__action.focus, .head__action.hover {
            background: linear-gradient(45deg, #ff00ff, #00ffff) !important;
            box-shadow: 0 0 15px rgba(255, 0, 255, 0.3) !important;
        }
        .full-start__background {
            opacity: 0.7 !important;
            filter: brightness(1.2) saturate(1.3) !important;
        }
        .settings__content, .settings-input__content, .selectbox__content, .modal__content {
            background: rgba(15, 2, 33, 0.95) !important;
            border: 1px solid rgba(255, 0, 255, 0.1) !important;
        }
    `,
    sunset: `
        body { background: linear-gradient(135deg, #2d1f3d 0%, #614385 50%, #516395 100%) !important; color: #ffffff !important; }
        .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
        .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
            background: linear-gradient(to right, #ff6e7f, #bfe9ff) !important;
            color: #2d1f3d !important;
            box-shadow: 0 0 15px rgba(255, 110, 127, 0.3) !important;
            font-weight: bold !important;
        }
        .card.focus .card__view::after, .card.hover .card__view::after {
            border: 2px solid #ff6e7f !important;
            box-shadow: 0 0 15px rgba(255, 110, 127, 0.5) !important;
        }
        .head__action.focus, .head__action.hover {
            background: linear-gradient(45deg, #ff6e7f, #bfe9ff) !important;
            color: #2d1f3d !important;
        }
        .full-start__background {
            opacity: 0.8 !important;
            filter: saturate(1.2) contrast(1.1) !important;
        }
    `,
    emerald: `
        body { background: linear-gradient(135deg, #1a2a3a 0%, #2C5364 50%, #203A43 100%) !important; color: #ffffff !important; }
        .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
        .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
            background: linear-gradient(to right, #43cea2, #185a9d) !important;
            color: #fff !important;
            box-shadow: 0 4px 15px rgba(67, 206, 162, 0.3) !important;
            border-radius: 5px !important;
        }
        .card.focus .card__view::after, .card.hover .card__view::after {
            border: 3px solid #43cea2 !important;
            box-shadow: 0 0 20px rgba(67, 206, 162, 0.4) !important;
        }
        .head__action.focus, .head__action.hover {
            background: linear-gradient(45deg, #43cea2, #185a9d) !important;
        }
        .full-start__background {
            opacity: 0.85 !important;
            filter: brightness(1.1) saturate(1.2) !important;
        }
        .settings__content, .settings-input__content, .selectbox__content, .modal__content {
            background: rgba(26, 42, 58, 0.98) !important;
            border: 1px solid rgba(67, 206, 162, 0.1) !important;
        }
    `,
    aurora: `
        body { background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%) !important; color: #ffffff !important; }
        .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
        .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
            background: linear-gradient(to right, #aa4b6b, #6b6b83, #3b8d99) !important;
            color: #fff !important;
            box-shadow: 0 0 20px rgba(170, 75, 107, 0.3) !important;
            transform: scale(1.02) !important;
            transition: all 0.3s ease !important;
        }
        .card.focus .card__view::after, .card.hover .card__view::after {
            border: 2px solid #aa4b6b !important;
            box-shadow: 0 0 25px rgba(170, 75, 107, 0.5) !important;
        }
        .head__action.focus, .head__action.hover {
            background: linear-gradient(45deg, #aa4b6b, #3b8d99) !important;
            transform: scale(1.05) !important;
        }
        .full-start__background {
            opacity: 0.75 !important;
            filter: contrast(1.1) brightness(1.1) !important;
        }
    `,
    bywolf_mod: `
        body { background: linear-gradient(135deg, #090227 0%, #170b34 50%, #261447 100%) !important; color: #ffffff !important; }
        .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
        .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
            background: linear-gradient(to right, #fc00ff, #00dbde) !important;
            color: #fff !important;
            box-shadow: 0 0 30px rgba(252, 0, 255, 0.3) !important;
            animation: cosmic-pulse 2s infinite !important;
        }
        @keyframes cosmic-pulse {
            0% { box-shadow: 0 0 20px rgba(252, 0, 255, 0.3) !important; }
            50% { box-shadow: 0 0 30px rgba(0, 219, 222, 0.3) !important; }
            100% { box-shadow: 0 0 20px rgba(252, 0, 255, 0.3) !important; }
        }
        .card.focus .card__view::after, .card.hover .card__view::after {
            border: 2px solid #fc00ff !important;
            box-shadow: 0 0 30px rgba(0, 219, 222, 0.5) !important;
        }
        .head__action.focus, .head__action.hover {
            background: linear-gradient(45deg, #fc00ff, #00dbde) !important;
            animation: cosmic-pulse 2s infinite !important;
        }
        .full-start__background {
            opacity: 0.8 !important;
            filter: saturate(1.3) contrast(1.1) !important;
        }
        .settings__content, .settings-input__content, .selectbox__content, .modal__content {
            background: rgba(9, 2, 39, 0.95) !important;
            border: 1px solid rgba(252, 0, 255, 0.1) !important;
            box-shadow: 0 0 30px rgba(0, 219, 222, 0.1) !important;
        }
    `,
    minimalist: `
        body { background: #121212 !important; color: #e0e0e0 !important; }
        .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
        .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
            background: #2c2c2c !important;
            color: #ffffff !important;
            box-shadow: none !important;
            border-radius: 3px !important;
            border-left: 3px solid #3d3d3d !important;
        }
        .card.focus .card__view::after, .card.hover .card__view::after {
            border: 1px solid #3d3d3d !important;
            box-shadow: none !important;
        }
        .head__action.focus, .head__action.hover {
            background: #2c2c2c !important;
        }
        .full-start__background {
            opacity: 0.6 !important;
            filter: grayscale(0.5) brightness(0.7) !important;
        }
        .settings__content, .settings-input__content, .selectbox__content, .modal__content {
            background: rgba(18, 18, 18, 0.95) !important;
            border: 1px solid #2c2c2c !important;
        }
        .selectbox-item + .selectbox-item {
            border-top: 1px solid #2c2c2c !important;
        }
        .card__title, .card__vote, .full-start__title, .full-start__rate, .full-start-new__title, .full-start-new__rate {
            color: #e0e0e0 !important;
        }
    `,
    glow_outline: `
        body { background: #0a0a0a !important; color: #f5f5f5 !important; }
        .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
        .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
            background: rgba(40, 40, 40, 0.8) !important;
            color: #fff !important;
            box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3) !important;
            border-radius: 3px !important;
            transition: all 0.3s ease !important;
            position: relative !important;
            z-index: 1 !important;
        }
        .menu__item.focus::before, .settings-folder.focus::before, .settings-param.focus::before, .selectbox-item.focus::before,
        .custom-online-btn.focus::before, .custom-torrent-btn.focus::before, .main2-more-btn.focus::before, .simple-button.focus::before {
            content: '' !important;
            position: absolute !important;
            top: -2px !important;
            left: -2px !important;
            right: -2px !important;
            bottom: -2px !important;
            z-index: -1 !important;
            border-radius: 5px !important;
            background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent) !important;
            animation: glowing 1.5s linear infinite !important;
        }
        @keyframes glowing {
            0% { box-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #f0f, 0 0 20px #0ff !important; }
            50% { box-shadow: 0 0 10px #fff, 0 0 15px #0ff, 0 0 20px #f0f, 0 0 25px #0ff !important; }
            100% { box-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #f0f, 0 0 20px #0ff !important; }
        }
        .card.focus .card__view::after, .card.hover .card__view::after {
            border: none !important;
            box-shadow: 0 0 0 2px #fff, 0 0 10px #0ff, 0 0 15px rgba(0, 255, 255, 0.5) !important;
            animation: card-glow 1.5s ease-in-out infinite alternate !important;
        }
        @keyframes card-glow {
            from { box-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #f0f, 0 0 20px #0ff !important; }
            to { box-shadow: 0 0 10px #fff, 0 0 15px #0ff, 0 0 20px #f0f, 0 0 25px #0ff !important; }
        }
        .head__action.focus, .head__action.hover {
            background: #292929 !important;
            box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3), 0 0 10px rgba(0, 255, 255, 0.5) !important;
        }
        .full-start__background {
            opacity: 0.7 !important;
            filter: brightness(0.8) contrast(1.2) !important;
        }
    `,
    menu_lines: `
        body { background: #121212 !important; color: #f5f5f5 !important; }
        .menu__item {
            border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
            margin-bottom: 5px !important;
            padding-bottom: 5px !important;
        }
        .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
        .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
            background: linear-gradient(to right, #303030 0%, #404040 100%) !important;
            color: #fff !important;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3) !important;
            border-left: 3px solid #808080 !important;
            border-bottom: 1px solid #808080 !important;
        }
        .settings-folder, .settings-param {
            border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
            margin-bottom: 5px !important;
            padding-bottom: 5px !important;
        }
        .settings-folder + .settings-folder {
            border-top: none !important;
        }
        .card.focus .card__view::after, .card.hover .card__view::after {
            border: 2px solid #808080 !important;
            box-shadow: 0 0 10px rgba(128, 128, 128, 0.5) !important;
        }
        .head__action.focus, .head__action.hover {
            background: #404040 !important;
            border-left: 3px solid #808080 !important;
        }
        .full-start__background {
            opacity: 0.7 !important;
            filter: brightness(0.8) !important;
        }
        .menu__list {
            border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        .selectbox-item + .selectbox-item {
            border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
    `,
    dark_emerald: `
        body { 
            background: linear-gradient(135deg, #0c1619 0%, #132730 50%, #18323a 100%) !important; 
            color: #dfdfdf !important; 
        }
        .menu__item, .settings-folder, .settings-param, .selectbox-item, .full-start__button, .full-descr__tag, .player-panel .button,
        .custom-online-btn, .custom-torrent-btn, .main2-more-btn, .simple-button, .menu__version {
            border-radius: 1.0em !important;
        }
        .menu__item.focus, .menu__item.traverse, .menu__item.hover, .settings-folder.focus, .settings-param.focus, .selectbox-item.focus, .full-start__button.focus, .full-descr__tag.focus, .player-panel .button.focus,
        .custom-online-btn.focus, .custom-torrent-btn.focus, .main2-more-btn.focus, .simple-button.focus, .menu__version.focus {
            background: linear-gradient(to right, #1a594d, #0e3652) !important;
            color: #fff !important;
            box-shadow: 0 2px 8px rgba(26, 89, 77, 0.2) !important;
            border-radius: 1.0em !important;
        }
        .card, .card.focus, .card.hover {
            border-radius: 1.0em !important;
        }
        .card.focus .card__view::after, .card.hover .card__view::after {
            border: 2px solid #1a594d !important;
            box-shadow: 0 0 10px rgba(26, 89, 77, 0.3) !important;
            border-radius: 1.0em !important;
        }
        .head__action, .head__action.focus, .head__action.hover {
            border-radius: 1.0em !important;
        }
        .head__action.focus, .head__action.hover {
            background: linear-gradient(45deg, #1a594d, #0e3652) !important;
        }
        .full-start__background {
            opacity: 0.75 !important;
            filter: brightness(0.9) saturate(1.1) !important;
        }
        .settings__content, .settings-input__content, .selectbox__content, .modal__content {
            background: rgba(12, 22, 25, 0.97) !important;
            border: 1px solid rgba(26, 89, 77, 0.1) !important;
            border-radius: 1.0em !important;
        }
    `
};
		
        style.textContent = themes[theme] || '';
        document.head.appendChild(style);
    }

    
    function loadExternalThemes(callback) {
        var themeUrl = 'https://bywolf88.github.io/lampa-plugins/theme.json';
        var xhr = new XMLHttpRequest();
        xhr.open('GET', themeUrl, true);
        xhr.timeout = 5000;
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    var externalThemes = JSON.parse(xhr.responseText);
                    if (externalThemes && typeof externalThemes === 'object') {
                        callback(null, externalThemes);
                    } else {
                        callback('Invalid themes data format', null);
                    }
                } catch (e) {
                    callback('Error parsing themes data: ' + e.message, null);
                }
            } else {
                callback('HTTP Error: ' + xhr.status, null);
            }
        };
        xhr.onerror = function() {
            callback('Network error', null);
        };
        xhr.ontimeout = function() {
            callback('Request timeout', null);
        };
        xhr.send();
    }

    
    function stylizeCollectionTitles() {
        if (!settings.stylize_titles) return;
        
        
        var oldStyle = document.getElementById('stylized-titles-css');
        if (oldStyle) oldStyle.remove();
        
        
        var styleElement = document.createElement('style');
        styleElement.id = 'stylized-titles-css';
        
        
        var css = `
            .items-line__title {
                font-size: 2.4em;
                display: inline-block;
                background: linear-gradient(45deg, #FF3CAC 0%, #784BA0 50%, #2B86C5 100%);
                background-size: 200% auto;
                background-clip: text;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                animation: gradient-text 3s ease infinite;
                font-weight: 800;
                text-shadow: 0 1px 3px rgba(0,0,0,0.2);
                position: relative;
                padding: 0 5px;
                z-index: 1;
            }
            
            .items-line__title::before {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 2px;
                background: linear-gradient(to right, transparent, #784BA0, transparent);
                z-index: -1;
                transform: scaleX(0);
                transform-origin: bottom right;
                transition: transform 0.5s ease-out;
                animation: line-animation 3s ease infinite;
            }
            
            .items-line__title::after {
                content: '';
                position: absolute;
                top: -5px;
                left: -5px;
                right: -5px;
                bottom: -5px;
                background: rgba(0,0,0,0.05);
                border-radius: 6px;
                z-index: -2;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .items-line:hover .items-line__title::before {
                transform: scaleX(1);
                transform-origin: bottom left;
            }
            
            .items-line:hover .items-line__title::after {
                opacity: 1;
            }
            
            @keyframes gradient-text {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            
            @keyframes line-animation {
                0% { transform: scaleX(0.2); opacity: 0.5; }
                50% { transform: scaleX(1); opacity: 1; }
                100% { transform: scaleX(0.2); opacity: 0.5; }
            }
        `;
        
        styleElement.textContent = css;
        document.head.appendChild(styleElement);
        
        
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) { 
                            var titles = node.querySelectorAll('.items-line__title');
                            if (titles.length) {
                                
                            }
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    
    function enhanceDetailedInfo() {
        if (!settings.enhance_detailed_info) return;
        
        
        var oldStyle = document.getElementById('enhanced-info-css');
        if (oldStyle) oldStyle.remove();
        
        
        var enhancedInfoStyle = document.createElement('style');
        enhancedInfoStyle.id = 'enhanced-info-css';
        enhancedInfoStyle.textContent = `
             
             .full-start-new__details {
                 font-size: 1.9em;
             }
             
             .full-start-new__details > * {
                 font-size: 1.9em;
                 margin: 0.1em;
             }

             .full-start-new__buttons, .full-start__buttons {
                 font-size: 1.4em !important;
             }
             
             .full-start__button {
                 font-size: 1.8em;
             }

             .full-start-new__rate-line {
                 font-size: 1.5em;
                 margin-bottom: 1em;
             }

             .full-start-new__poster {
                 display: none;
             }
             
             .full-start-new__left {
                 display: none;
             }
             
             .full-start-new__right {
                 width: 100%;
             }
             
             .full-descr__text {
                 font-size: 1.8em;
                 line-height: 1.4;
                 font-weight: 600;
                 width: 100%;
             }
             
             .info-unified-line {
                 display: flex;
                 flex-wrap: wrap;
                 align-items: center;
                 gap: 0.5em;
                 margin-bottom: 0.5em;
             }
             
             .info-unified-item {
                 border-radius: 0.3em;
                 border: 0px;
                 font-size: 1.3em;
                 padding: 0.2em 0.6em;
                 display: inline-block;
                 white-space: nowrap;
                 line-height: 1.2em;
             }
             
             
             .full-start-new__title {
                 font-size: 2.2em !important;
             }
             
             .full-start-new__tagline {
                 font-size: 1.4em !important;
             }
             
             .full-start-new__desc {
                 font-size: 1.6em !important;
                 margin-top: 1em !important;
             }
             
             
             .full-start-new__info {
                 font-size: 1.4em !important;
             }
             
             
             @media (max-width: 768px) {
                 .full-start-new__title {
                     font-size: 1.8em !important;
                 }
                 
                 .full-start-new__desc {
                     font-size: 1.4em !important;
                 }
                 
                 .full-start-new__details {
                     font-size: 1.5em;
                 }
                 
                 .full-start-new__details > * {
                     font-size: 1.5em;
                     margin: 0.3em;
                 }
                 
                 .full-descr__text {
                     font-size: 1.5em;
                 }
             }
        `;
        document.head.appendChild(enhancedInfoStyle);
        
        
        Lampa.Listener.follow('full', function(data) {
            if (data.type === 'complite' && settings.enhance_detailed_info) {
                setTimeout(function() {
                    var details = $('.full-start-new__details');
                    if (!details.length) return;
                    
                    
                    var seasonText = '';
                    var episodeText = '';
                    var durationText = '';
                    
                    
                    details.find('span').each(function() {
                        var text = $(this).text().trim();
                        
                        if (text.match(/Сезон(?:и)?:?\s*(\d+)/i) || text.match(/(\d+)\s+Сезон(?:а|ів)?/i)) {
                            seasonText = text;
                        } else if (text.match(/Серії?:?\s*(\d+)/i) || text.match(/(\d+)\s+Сері(?:я|ї|й)/i)) {
                            episodeText = text;
                        } else if (text.match(/Тривалість/i) || text.indexOf('≈') !== -1) {
                            durationText = text;
                        }
                    });
                    
                    
                    if ((seasonText && episodeText) || (seasonText && durationText) || (episodeText && durationText)) {
                        
                        var unifiedLine = $('<div class="info-unified-line"></div>');
                        
                        
                        if (seasonText) {
                            var seasonItem = $('<span class="info-unified-item"></span>')
                                .text(seasonText)
                                .css({
                                    'background-color': 'rgba(52, 152, 219, 0.8)',
                                    'color': 'white'
                                });
                            unifiedLine.append(seasonItem);
                        }
                        
                        
                        if (episodeText) {
                            var episodeItem = $('<span class="info-unified-item"></span>')
                                .text(episodeText)
                                .css({
                                    'background-color': 'rgba(46, 204, 113, 0.8)',
                                    'color': 'white'
                                });
                            unifiedLine.append(episodeItem);
                        }
                        
                        
                        if (durationText) {
                            var durationItem = $('<span class="info-unified-item"></span>')
                                .text(durationText)
                                .css({
                                    'background-color': 'rgba(52, 152, 219, 0.8)',
                                    'color': 'white'
                                });
                            unifiedLine.append(durationItem);
                        }
                        
                        
                        details.find('span').each(function() {
                            var text = $(this).text().trim();
                            if (text === seasonText || text === episodeText || text === durationText) {
                                $(this).remove();
                            }
                        });
                        
                        
                        details.prepend(unifiedLine);
                    }
                }, 300);
            }
        });
    }

    
    function startPlugin() {
        
        addSettings();
        changeMovieTypeLabels();
        newInfoPanel();
        if (settings.colored_ratings) {
            updateVoteColors();
            setupVoteColorsObserver();
            setupVoteColorsForDetailPage();
        }
        colorizeSeriesStatus();
        colorizeAgeRating();
        if (settings.buttons_style_mode === 'all' || settings.buttons_style_mode === 'main2') {
            showAllButtons();
        }
        
        
        if (settings.theme) {
            applyTheme(settings.theme);
        }
        
        
        if (settings.stylize_titles) {
            stylizeCollectionTitles();
        }
        
        
        if (settings.enhance_detailed_info) {
            enhanceDetailedInfo();
        }
    }

    
    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') {
                startPlugin();
            }
        });
    }

})();

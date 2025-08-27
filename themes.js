(function() {
    'use strict';
    
    Lampa.Lang.add({
        maxsm_themes: {
            ru: "Темы оформления",
            en: "Interface themes",
            uk: "Теми оформлення",
            be: "Тэмы афармлення",
            zh: "主题",
            pt: "Temas",
            bg: "Теми",
            he: "ערכות נושא",
            cs: "Témata"
        }
    });

    // Основной объект плагина
    var maxsm_themes = {
        // Название плагина
        name: 'maxsm_themes',
        // Версия плагина
        version: '2.2.1',
        // Настройки по умолчанию
        settings: {
            theme: 'mint_dark'
        }
    };

    // Была ли предыдущая тема стоковая
    var prevtheme = '';
    // Запускаем только один раз
    var onetime = false;

    // Цвета loader'а для каждой темы
    var loaderColors = {
        "default": '#fff',
        violet_blue: '#6a11cb',
        mint_dark: '#3da18d',
        deep_aurora: '#7e7ed9',
        crystal_cyan: '#7ed0f9',
        amber_noir: '#f4a261',
        velvet_sakura: '#f6a5b0'
    };

    // Функция для применения тем
    function applyTheme(theme) {
        // Удаляем предыдущие стили темы
        $('#maxsm_interface_mod_theme').remove();

        if (
            prevtheme !== '' &&
            (
                (prevtheme === 'default' && theme !== 'default') ||
                (prevtheme !== 'default' && theme === 'default')
            )
        ) {
            window.location.reload();
        }

        prevtheme = theme;

        // Если выбрано "Нет", просто удаляем стили
        if (theme === 'default') return;

        var color = loaderColors[theme] || loaderColors["default"];

        var svgCode = encodeURIComponent("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"135\" height=\"140\" fill=\"".concat(color, "\"><rect width=\"10\" height=\"40\" y=\"100\" rx=\"6\"><animate attributeName=\"height\" begin=\"0s\" calcMode=\"linear\" dur=\"1s\" repeatCount=\"indefinite\" values=\"40;100;40\" keyTimes=\"0;0.5;1\"/><animate attributeName=\"y\" begin=\"0s\" calcMode=\"linear\" dur=\"1s\" repeatCount=\"indefinite\" values=\"100;40;100\" keyTimes=\"0;0.5;1\"/></rect><rect width=\"10\" height=\"40\" x=\"20\" y=\"100\" rx=\"6\"><animate attributeName=\"height\" begin=\"0.2s\" calcMode=\"linear\" dur=\"1s\" repeatCount=\"indefinite\" values=\"40;100;40\" keyTimes=\"0;0.5;1\"/><animate attributeName=\"y\" begin=\"0.2s\" calcMode=\"linear\" dur=\"1s\" repeatCount=\"indefinite\" values=\"100;40;100\" keyTimes=\"0;0.5;1\"/></rect><rect width=\"10\" height=\"40\" x=\"40\" y=\"100\" rx=\"6\"><animate attributeName=\"height\" begin=\"0.4s\" calcMode=\"linear\" dur=\"1s\" repeatCount=\"indefinite\" values=\"40;100;40\" keyTimes=\"0;0.5;1\"/><animate attributeName=\"y\" begin=\"0.4s\" calcMode=\"linear\" dur=\"1s\" repeatCount=\"indefinite\" values=\"100;40;100\" keyTimes=\"0;0.5;1\"/></rect><rect width=\"10\" height=\"40\" x=\"60\" y=\"100\" rx=\"6\"><animate attributeName=\"height\" begin=\"0.6s\" calcMode=\"linear\" dur=\"1s\" repeatCount=\"indefinite\" values=\"40;100;40\" keyTimes=\"0;0.5;1\"/><animate attributeName=\"y\" begin=\"0.6s\" calcMode=\"linear\" dur=\"1s\" repeatCount=\"indefinite\" values=\"100;40;100\" keyTimes=\"0;0.5;1\"/></rect><rect width=\"10\" height=\"40\" x=\"80\" y=\"100\" rx=\"6\"><animate attributeName=\"height\" begin=\"0.8s\" calcMode=\"linear\" dur=\"1s\" repeatCount=\"indefinite\" values=\"40;100;40\" keyTimes=\"0;0.5;1\"/><animate attributeName=\"y\" begin=\"0.8s\" calcMode=\"linear\" dur=\"1s\" repeatCount=\"indefinite\" values=\"100;40;100\" keyTimes=\"0;0.5;1\"/></rect><rect width=\"10\" height=\"40\" x=\"100\" y=\"100\" rx=\"6\"><animate attributeName=\"height\" begin=\"1s\" calcMode=\"linear\" dur=\"1s\" repeatCount=\"indefinite\" values=\"40;100;40\" keyTimes=\"0;0.5;1\"/><animate attributeName=\"y\" begin=\"1s\" calcMode=\"linear\" dur=\"1s\" repeatCount=\"indefinite\" values=\"100;40;100\" keyTimes=\"0;0.5;1\"/></rect><rect width=\"10\" height=\"40\" x=\"120\" y=\"100\" rx=\"6\"><animate attributeName=\"height\" begin=\"1.2s\" calcMode=\"linear\" dur=\"1s\" repeatCount=\"indefinite\" values=\"40;100;40\" keyTimes=\"0;0.5;1\"/><animate attributeName=\"y\" begin=\"1.2s\" calcMode=\"linear\" dur=\"1s\" repeatCount=\"indefinite\" values=\"100;40;100\" keyTimes=\"0;0.5;1\"/></rect></svg>"));


        // Создаем новый стиль
        var style = $('<style id="maxsm_interface_mod_theme"></style>');

        // Определяем стили для разных тем
        var themes = {
            mint_dark: "\n.navigation-bar__body\n{background: rgba(18, 32, 36, 0.96) !important;\n}\n.card__quality,\n .card--tv .card__type {\nbackground: linear-gradient(to right, #1e6262dd, #3da18ddd) !important;\n}\n.screensaver__preload {\nbackground:url(\"data:image/svg+xml,".concat(svgCode, "\") no-repeat 50% 50% !important;\n}\n.activity__loader {\nposition:absolute;\ntop:0;\nleft:0;\nwidth:100%;\nheight:100%;\ndisplay:none;\nbackground:url(\"data:image/svg+xml,").concat(svgCode, "\") no-repeat 50% 50% !important;\n \n}\nbody, .extensions\n {\nbackground: linear-gradient(135deg, #0a1b2a, #1a4036) !important;\ncolor: #ffffff !important;\n}\n.company-start.icon--broken .company-start__icon,\n.explorer-card__head-img > img,\n.bookmarks-folder__layer,\n.card-more__box,\n.card__img\n,.extensions__block-add\n,.extensions__item\n {\nbackground-color: #1e2c2f !important;\n}\n.search-source.focus,\n.simple-button.focus,\n.menu__item.focus,\n.menu__item.traverse,\n.menu__item.hover,\n.full-start__button.focus,\n.full-descr__tag.focus,\n.player-panel .button.focus,\n.full-person.selector.focus,\n.tag-count.selector.focus,\n.full-review.focus {\nbackground: linear-gradient(to right, #1e6262, #3da18d) !important;\ncolor: #fff !important;\nbox-shadow: 0 0.0em 0.4em rgba(61, 161, 141, 0.0) !important;\n}\n.selectbox-item.focus,\n.settings-folder.focus,\n.settings-param.focus {\nbackground: linear-gradient(to right, #1e6262, #3da18d) !important;\ncolor: #fff !important;\nbox-shadow: 0 0.0em 0.4em rgba(61, 161, 141, 0.0) !important;\nborder-radius: 0.5em 0 0 0.5em !important;\n}\n.full-episode.focus::after,\n.card-episode.focus .full-episode::after,\n.items-cards .selector.focus::after,  \n.card-more.focus .card-more__box::after,\n.card-episode.focus .full-episode::after,\n.card-episode.hover .full-episode::after,\n.card.focus .card__view::after,\n.card.hover .card__view::after,\n.torrent-item.focus::after,\n.online-prestige.selector.focus::after,\n.online-prestige--full.selector.focus::after,\n.explorer-card__head-img.selector.focus::after,\n.extensions__item.focus::after,\n.extensions__block-add.focus::after,\n.full-review-add.focus::after {\nborder: 0.2em solid #3da18d !important;\nbox-shadow: 0 0 0.8em rgba(61, 161, 141, 0.0) !important;\n}\n.head__action.focus,\n.head__action.hover {\nbackground: linear-gradient(45deg, #3da18d, #1e6262) !important;\n}\n.modal__content {\nbackground: rgba(18, 32, 36, 0.96) !important;\nborder: 0em solid rgba(18, 32, 36, 0.96) !important;\n}\n.settings__content,\n.settings-input__content,\n.selectbox__content,\n.settings-input {\nbackground: rgba(18, 32, 36, 0.96) !important;\n}\n.torrent-serial {\nbackground: rgba(0, 0, 0, 0.22) !important;\nborder: 0.2em solid rgba(0, 0, 0, 0.22) !important;\n}\n.torrent-serial.focus {\nbackground-color: #1a3b36cc !important;\nborder: 0.2em solid #3da18d !important;\n}\n"),
            crystal_cyan: "\n.navigation-bar__body\n{background: rgba(10, 25, 40, 0.96);\n}\n.card__quality,\n .card--tv .card__type {\nbackground: linear-gradient(to right, #00d2ffdd, #3a8ee6dd);\n}\n.screensaver__preload {\nbackground:url(\"data:image/svg+xml,".concat(svgCode, "\") no-repeat 50% 50%\n}\n.activity__loader {\nposition:absolute;\ntop:0;\nleft:0;\nwidth:100%;\nheight:100%;\ndisplay:none;\nbackground:url(\"data:image/svg+xml,").concat(svgCode, "\") no-repeat 50% 50%\n \n}\nbody, .extensions\n {\nbackground: linear-gradient(135deg, #081822, #104059);\ncolor: #ffffff;\n}\n.company-start.icon--broken .company-start__icon,\n.explorer-card__head-img > img,\n.bookmarks-folder__layer,\n.card-more__box,\n.card__img\n,.extensions__block-add\n,.extensions__item\n {\nbackground-color: #112b3a;\n}\n.search-source.focus,\n.simple-button.focus,\n.menu__item.focus,\n.menu__item.traverse,\n.menu__item.hover,\n.full-start__button.focus,\n.full-descr__tag.focus,\n.player-panel .button.focus,\n.full-person.selector.focus,\n.tag-count.selector.focus,\n.full-review.focus {\nbackground: linear-gradient(to right, #00d2ff, #3a8ee6);\ncolor: #fff;\nbox-shadow: 0 0.0em 0.4em rgba(72, 216, 255, 0.0);\n}\n.selectbox-item.focus,\n.settings-folder.focus,\n.settings-param.focus {\nbackground: linear-gradient(to right, #00d2ff, #3a8ee6);\ncolor: #fff;\nbox-shadow: 0 0.0em 0.4em rgba(72, 216, 255, 0.0);\nborder-radius: 0.5em 0 0 0.5em;\n}\n.full-episode.focus::after,\n.card-episode.focus .full-episode::after,\n.items-cards .selector.focus::after,  \n.card-more.focus .card-more__box::after,\n.card-episode.focus .full-episode::after,\n.card-episode.hover .full-episode::after,\n.card.focus .card__view::after,\n.card.hover .card__view::after,\n.torrent-item.focus::after,\n.online-prestige.selector.focus::after,\n.online-prestige--full.selector.focus::after,\n.explorer-card__head-img.selector.focus::after,\n.extensions__item.focus::after,\n.extensions__block-add.focus::after,\n.full-review-add.focus::after {\nborder: 0.2em solid #00d2ff;\nbox-shadow: 0 0 0.8em rgba(72, 216, 255, 0.0);\n}\n.head__action.focus,\n.head__action.hover {\nbackground: linear-gradient(45deg, #00d2ff, #3a8ee6);\n}\n.modal__content {\nbackground: rgba(10, 25, 40, 0.96);\nborder: 0em solid rgba(10, 25, 40, 0.96);\n}\n.settings__content,\n.settings-input__content,\n.selectbox__content,\n.settings-input {\nbackground: rgba(10, 25, 40, 0.96);\n}\n.torrent-serial {\nbackground: rgba(0, 0, 0, 0.22);\nborder: 0.2em solid rgba(0, 0, 0, 0.22);\n}\n.torrent-serial.focus {\nbackground-color: #0c2e45cc;\nborder: 0.2em solid #00d2ff;\n}\n"),
            deep_aurora: "\n.navigation-bar__body\n{background: rgba(18, 34, 59, 0.96);\n}\n.card__quality,\n .card--tv .card__type {\nbackground: linear-gradient(to right, #2c6fc1dd, #7e7ed9dd);\n}\n.screensaver__preload {\nbackground:url(\"data:image/svg+xml,".concat(svgCode, "\") no-repeat 50% 50%\n}\n.activity__loader {\nposition:absolute;\ntop:0;\nleft:0;\nwidth:100%;\nheight:100%;\ndisplay:none;\nbackground:url(\"data:image/svg+xml,").concat(svgCode, "\") no-repeat 50% 50%\n \n}\nbody, .extensions\n {\nbackground: linear-gradient(135deg, #1a102b, #0a1c3f);\ncolor: #ffffff;\n}\n.company-start.icon--broken .company-start__icon,\n.explorer-card__head-img > img,\n.bookmarks-folder__layer,\n.card-more__box,\n.card__img\n,.extensions__block-add\n,.extensions__item\n {\nbackground-color: #171f3a;\n}\n.search-source.focus,\n.simple-button.focus,\n.menu__item.focus,\n.menu__item.traverse,\n.menu__item.hover,\n.full-start__button.focus,\n.full-descr__tag.focus,\n.player-panel .button.focus,\n.full-person.selector.focus,\n.tag-count.selector.focus,\n.full-review.focus {\nbackground: linear-gradient(to right, #2c6fc1, #7e7ed9);\ncolor: #fff;\nbox-shadow: 0 0.0em 0.4em rgba(124, 194, 255, 0.0);\n}\n.selectbox-item.focus,\n.settings-folder.focus,\n.settings-param.focus {\nbackground: linear-gradient(to right, #2c6fc1, #7e7ed9);\ncolor: #fff;\nbox-shadow: 0 0.0em 0.4em rgba(124, 194, 255, 0.0);\nborder-radius: 0.5em 0 0 0.5em;\n}\n.full-episode.focus::after,\n.card-episode.focus .full-episode::after,\n.items-cards .selector.focus::after,  \n.card-more.focus .card-more__box::after,\n.card-episode.focus .full-episode::after,\n.card-episode.hover .full-episode::after,\n.card.focus .card__view::after,\n.card.hover .card__view::after,\n.torrent-item.focus::after,\n.online-prestige.selector.focus::after,\n.online-prestige--full.selector.focus::after,\n.explorer-card__head-img.selector.focus::after,\n.extensions__item.focus::after,\n.extensions__block-add.focus::after,\n.full-review-add.focus::after {\nborder: 0.2em solid #7e7ed9;\nbox-shadow: 0 0 0.8em rgba(124, 194, 255, 0.0);\n}\n.head__action.focus,\n.head__action.hover {\nbackground: linear-gradient(45deg, #7e7ed9, #2c6fc1);\n}\n.modal__content {\nbackground: rgba(18, 34, 59, 0.96);\nborder: 0em solid rgba(18, 34, 59, 0.96);\n}\n.settings__content,\n.settings-input__content,\n.selectbox__content,\n.settings-input {\nbackground: rgba(18, 34, 59, 0.96);\n}\n.torrent-serial {\nbackground: rgba(0, 0, 0, 0.22);\nborder: 0.2em solid rgba(0, 0, 0, 0.22);\n}\n.torrent-serial.focus {\nbackground-color: #1a102bcc;\nborder: 0.2em solid #7e7ed9;\n}\n"),
            amber_noir: "\n.navigation-bar__body\n{background: rgba(28, 18, 10, 0.96);\n}\n.card__quality,\n .card--tv .card__type {\nbackground: linear-gradient(to right, #f4a261dd, #e76f51dd);\n}\n.screensaver__preload {\nbackground:url(\"data:image/svg+xml,".concat(svgCode, "\") no-repeat 50% 50%\n}\n.activity__loader {\nposition:absolute;\ntop:0;\nleft:0;\nwidth:100%;\nheight:100%;\ndisplay:none;\nbackground:url(\"data:image/svg+xml,").concat(svgCode, "\") no-repeat 50% 50%\n \n}\nbody, .extensions\n {\nbackground: linear-gradient(135deg, #1f0e04, #3b2a1e);\ncolor: #ffffff;\n}\n.company-start.icon--broken .company-start__icon,\n.explorer-card__head-img > img,\n.bookmarks-folder__layer,\n.card-more__box,\n.card__img\n,.extensions__block-add\n,.extensions__item\n {\nbackground-color: #2a1c11;\n}\n.search-source.focus,\n.simple-button.focus,\n.menu__item.focus,\n.menu__item.traverse,\n.menu__item.hover,\n.full-start__button.focus,\n.full-descr__tag.focus,\n.player-panel .button.focus,\n.full-person.selector.focus,\n.tag-count.selector.focus,\n.full-review.focus {\nbackground: linear-gradient(to right, #f4a261, #e76f51);\ncolor: #fff;\nbox-shadow: 0 0.0em 0.4em rgba(255, 160, 90, 0.0);\n}\n.selectbox-item.focus,\n.settings-folder.focus,\n.settings-param.focus {\nbackground: linear-gradient(to right, #f4a261, #e76f51);\ncolor: #fff;\nbox-shadow: 0 0.0em 0.4em rgba(255, 160, 90, 0.0);\nborder-radius: 0.5em 0 0 0.5em;\n}\n.full-episode.focus::after,\n.card-episode.focus .full-episode::after,\n.items-cards .selector.focus::after,  \n.card-more.focus .card-more__box::after,\n.card-episode.focus .full-episode::after,\n.card-episode.hover .full-episode::after,\n.card.focus .card__view::after,\n.card.hover .card__view::after,\n.torrent-item.focus::after,\n.online-prestige.selector.focus::after,\n.online-prestige--full.selector.focus::after,\n.explorer-card__head-img.selector.focus::after,\n.extensions__item.focus::after,\n.extensions__block-add.focus::after,\n.full-review-add.focus::after {\nborder: 0.2em solid #f4a261;\nbox-shadow: 0 0 0.8em rgba(255, 160, 90, 0.0);\n}\n.head__action.focus,\n.head__action.hover {\nbackground: linear-gradient(45deg, #f4a261, #e76f51);\n}\n.modal__content {\nbackground: rgba(28, 18, 10, 0.96);\nborder: 0em solid rgba(28, 18, 10, 0.96);\n}\n.settings__content,\n.settings-input__content,\n.selectbox__content,\n.settings-input {\nbackground: rgba(28, 18, 10, 0.96);\n}\n.torrent-serial {\nbackground: rgba(0, 0, 0, 0.22);\nborder: 0.2em solid rgba(0, 0, 0, 0.22);\n}\n.torrent-serial.focus {\nbackground-color: #3b2412cc;\nborder: 0.2em solid #f4a261;\n}\n"),
            velvet_sakura: "\n.navigation-bar__body\n{background: rgba(56, 32, 45, 0.96);\n}\n.card__quality,\n .card--tv .card__type {\nbackground: linear-gradient(to right, #f6a5b0dd, #f9b8d3dd);\n}\n.screensaver__preload {\nbackground:url(\"data:image/svg+xml,".concat(svgCode, "\") no-repeat 50% 50%\n}\n.activity__loader {\nposition:absolute;\ntop:0;\nleft:0;\nwidth:100%;\nheight:100%;\ndisplay:none;\nbackground:url(\"data:image/svg+xml,").concat(svgCode, "\") no-repeat 50% 50%\n \n}\nbody, .extensions\n {\nbackground: linear-gradient(135deg, #4b0e2b, #7c2a57);\ncolor: #ffffff;\n}\n.company-start.icon--broken .company-start__icon,\n.explorer-card__head-img > img,\n.bookmarks-folder__layer,\n.card-more__box,\n.card__img\n,.extensions__block-add\n,.extensions__item\n {\nbackground-color: #5c0f3f;\n}\n.search-source.focus,\n.simple-button.focus,\n.menu__item.focus,\n.menu__item.traverse,\n.menu__item.hover,\n.full-start__button.focus,\n.full-descr__tag.focus,\n.player-panel .button.focus,\n.full-person.selector.focus,\n.tag-count.selector.focus,\n.full-review.focus {\nbackground: linear-gradient(to right, #f6a5b0, #f9b8d3);\ncolor: #fff;\nbox-shadow: 0 0.0em 0.4em rgba(246, 165, 176, 0.0);\n}\n.selectbox-item.focus,\n.settings-folder.focus,\n.settings-param.focus {\nbackground: linear-gradient(to right, #f6a5b0, #f9b8d3);\ncolor: #fff;\nbox-shadow: 0 0.0em 0.4em rgba(246, 165, 176, 0.0);\nborder-radius: 0.5em 0 0 0.5em;\n}\n.full-episode.focus::after,\n.card-episode.focus .full-episode::after,\n.items-cards .selector.focus::after,  \n.card-more.focus .card-more__box::after,\n.card-episode.focus .full-episode::after,\n.card-episode.hover .full-episode::after,\n.card.focus .card__view::after,\n.card.hover .card__view::after,\n.torrent-item.focus::after,\n.online-prestige.selector.focus::after,\n.online-prestige--full.selector.focus::after,\n.explorer-card__head-img.selector.focus::after,\n.extensions__item.focus::after,\n.extensions__block-add.focus::after,\n.full-review-add.focus::after {\nborder: 0.2em solid #f6a5b0;\nbox-shadow: 0 0 0.8em rgba(246, 165, 176, 0.0);\n}\n.head__action.focus,\n.head__action.hover {\nbackground: linear-gradient(45deg, #f9b8d3, #f6a5b0);\n}\n.modal__content {\nbackground: rgba(56, 32, 45, 0.96);\nborder: 0em solid rgba(56, 32, 45, 0.96);\n}\n.settings__content,\n.settings-input__content,\n.selectbox__content,\n.settings-input {\nbackground: rgba(56, 32, 45, 0.96);\n}\n.torrent-serial {\nbackground: rgba(0, 0, 0, 0.22);\nborder: 0.2em solid rgba(0, 0, 0, 0.22);\n}\n.torrent-serial.focus {\nbackground-color: #7c2a57cc;\nborder: 0.2em solid #f6a5b0;\n}\n")
        };

        // Устанавливаем стили для выбранной темы
        style.html(themes[theme] || '');

        // Добавляем стиль в head
        $('head').append(style);

        if (onetime === false) {
            onetime = true;
            forall();
            removeFromSettingsMenu();
        }

    }

    function removeFromSettingsMenu() {
        // Скрываем всё, что плохо сочетается с плагином тем
        Lampa.Settings.listener.follow('open', function(e) {
            if (e.name == 'interface') {
                e.body.find('[data-name="light_version"]').remove();
                e.body.find('[data-name="background"]').remove();
                e.body.find('[data-name="background_type"]').remove();
                e.body.find('[data-name="card_interfice_type"]').remove();
                e.body.find('[data-name="glass_style"]').prev('.settings-param-title').remove();
                e.body.find('[data-name="glass_style"]').remove();
                e.body.find('[data-name="glass_opacity"]').remove();
                e.body.find('[data-name="card_interfice_poster"]').prev('.settings-param-title').remove();
                e.body.find('[data-name="card_interfice_poster"]').remove();
                e.body.find('[data-name="card_interfice_cover"]').remove();
                e.body.find('[data-name="advanced_animation"]').remove();
            }
        });
        // Настройки интерфейса под темы
        Lampa.Storage.set('light_version', 'false');
        Lampa.Storage.set('background', 'false');
        Lampa.Storage.set('card_interfice_type', 'new');
        Lampa.Storage.set('glass_style', 'false');
        Lampa.Storage.set('card_interfice_poster', 'false');
        Lampa.Storage.set('card_interfice_cover', 'true');
        Lampa.Storage.set('advanced_animation', 'false');

    }

    // Дополнительные Шаблоны, не меняющиеся от цветовых стилей    
    function forall() {
        // Шаблон карточки, где год перенесен выше названия
        Lampa.Template.add('card', "<div class=\"card selector layer--visible layer--render\">\n    <div class=\"card__view\">\n        <img src=\"./img/img_load.svg\" class=\"card__img\" />\n\n        <div class=\"card__icons\">\n            <div class=\"card__icons-inner\">\n                \n            </div>\n        </div>\n    <div class=\"card__age\">{release_year}</div>\n    </div>\n\n    <div class=\"card__title\">{title}</div>\n    </div>");
        // Шаблон карточки выхода эпизода, выкинем футер из card_episode, год и название на карточку
        Lampa.Template.add('card_episode', "<div class=\"card-episode selector layer--visible layer--render\">\n    <div class=\"card-episode__body\">\n        <div class=\"full-episode\">\n            <div class=\"full-episode__img\">\n                <img />\n            </div>\n\n            <div class=\"full-episode__body\">\n     <div class=\"card__title\">{title}</div>\n             <div class=\"card__age\">{release_year}</div>\n             <div class=\"full-episode__num hide\">{num}</div>\n                <div class=\"full-episode__name\">{name}</div>\n                <div class=\"full-episode__date\">{date}</div>\n            </div>\n        </div>\n    </div>\n    <div class=\"card-episode__footer hide\">\n    </div>\n</div>");
        // Шаблон карточки Фильма\Сериала, переносим кнопки из кнопки "Смотреть" на верхний уровень etc.
        Lampa.Template.add('full_start_new', "<div class=\"full-start-new\">\n\n<div class=\"full-start-new__body\">\n<div class=\"full-start-new__left\">\n<div class=\"full-start-new__poster\">\n<img class=\"full-start-new__img full--poster\" />\n</div>\n</div>\n\n<div class=\"full-start-new__right\">\n<div class=\"full-start-new__head\"></div>\n<div class=\"full-start-new__title\">{title}</div>\n<div class=\"full-start__title-original\">{original_title}</div>\n<div class=\"full-start-new__tagline full--tagline\">{tagline}</div>\n<div class=\"full-start-new__rate-line\">\n<div class=\"full-start__rate rate--tmdb\"><div>{rating}</div><div class=\"source--name\">TMDB</div></div>\n<div class=\"full-start__rate rate--imdb hide\"><div></div><div class=\"source--name\">IMDb</div></div>\n<div class=\"full-start__rate rate--kp hide\"><div></div><div class=\"source--name\">Кинопоиск</div></div>\n\n<div class=\"full-start__pg hide\"></div>\n<div class=\"full-start__status hide\"></div>\n</div>\n<div class=\"full-start-new__details\"></div>\n<div class=\"full-start-new__reactions\">\n<div>#{reactions_none}</div>\n</div>\n\n<div class=\"full-start-new__buttons\">\n<div class=\"full-start__button selector button--play\">\n<svg width=\"28\" height=\"29\" viewBox=\"0 0 28 29\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<circle cx=\"14\" cy=\"14.5\" r=\"13\" stroke=\"currentColor\" stroke-width=\"2.7\"/>\n<path d=\"M18.0739 13.634C18.7406 14.0189 18.7406 14.9811 18.0739 15.366L11.751 19.0166C11.0843 19.4015 10.251 18.9204 10.251 18.1506L10.251 10.8494C10.251 10.0796 11.0843 9.5985 11.751 9.9834L18.0739 13.634Z\" fill=\"currentColor\"/>\n</svg>\n\n<span>#{title_watch}</span>\n</div>\n\n<div class=\"full-start__button view--torrent\">\n<svg xmlns=\"http://www.w3.org/2000/svg\"  viewBox=\"0 0 50 50\" width=\"50px\" height=\"50px\">\n<path d=\"M25,2C12.317,2,2,12.317,2,25s10.317,23,23,23s23-10.317,23-23S37.683,2,25,2z M40.5,30.963c-3.1,0-4.9-2.4-4.9-2.4 S34.1,35,27,35c-1.4,0-3.6-0.837-3.6-0.837l4.17,9.643C26.727,43.92,25.874,44,25,44c-2.157,0-4.222-0.377-6.155-1.039L9.237,16.851 c0,0-0.7-1.2,0.4-1.5c1.1-0.3,5.4-1.2,5.4-1.2s1.475-0.494,1.8,0.5c0.5,1.3,4.063,11.112,4.063,11.112S22.6,29,27.4,29 c4.7,0,5.9-3.437,5.7-3.937c-1.2-3-4.993-11.862-4.993-11.862s-0.6-1.1,0.8-1.4c1.4-0.3,3.8-0.7,3.8-0.7s1.105-0.163,1.6,0.8 c0.738,1.437,5.193,11.262,5.193,11.262s1.1,2.9,3.3,2.9c0.464,0,0.834-0.046,1.152-0.104c-0.082,1.635-0.348,3.221-0.817,4.722 C42.541,30.867,41.756,30.963,40.5,30.963z\" fill=\"currentColor\"/>\n</svg>\n\n<span>#{full_torrents}</span>\n</div>\n\n<div class=\"full-start__button selector view--trailer\">\n<svg height=\"70\" viewBox=\"0 0 80 70\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M71.2555 2.08955C74.6975 3.2397 77.4083 6.62804 78.3283 10.9306C80 18.7291 80 35 80 35C80 35 80 51.2709 78.3283 59.0694C77.4083 63.372 74.6975 66.7603 71.2555 67.9104C65.0167 70 40 70 40 70C40 70 14.9833 70 8.74453 67.9104C5.3025 66.7603 2.59172 63.372 1.67172 59.0694C0 51.2709 0 35 0 35C0 35 0 18.7291 1.67172 10.9306C2.59172 6.62804 5.3025 3.2395 8.74453 2.08955C14.9833 0 40 0 40 0C40 0 65.0167 0 71.2555 2.08955ZM55.5909 35.0004L29.9773 49.5714V20.4286L55.5909 35.0004Z\" fill=\"currentColor\"></path>\n</svg>\n\n<span>#{full_trailers}</span>\n</div>\n<div class=\"full-start__button selector button--book\">\n<svg width=\"21\" height=\"32\" viewBox=\"0 0 21 32\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M2 1.5H19C19.2761 1.5 19.5 1.72386 19.5 2V27.9618C19.5 28.3756 19.0261 28.6103 18.697 28.3595L12.6212 23.7303C11.3682 22.7757 9.63183 22.7757 8.37885 23.7303L2.30302 28.3595C1.9739 28.6103 1.5 28.3756 1.5 27.9618V2C1.5 1.72386 1.72386 1.5 2 1.5Z\" stroke=\"currentColor\" stroke-width=\"2.5\"/>\n</svg>\n\n<span>#{settings_input_links}</span>\n</div>\n\n<div class=\"full-start__button selector button--reaction\">\n<svg width=\"38\" height=\"34\" viewBox=\"0 0 38 34\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M37.208 10.9742C37.1364 10.8013 37.0314 10.6441 36.899 10.5117C36.7666 10.3794 36.6095 10.2744 36.4365 10.2028L12.0658 0.108375C11.7166 -0.0361828 11.3242 -0.0361227 10.9749 0.108542C10.6257 0.253206 10.3482 0.530634 10.2034 0.879836L0.108666 25.2507C0.0369593 25.4236 3.37953e-05 25.609 2.3187e-08 25.7962C-3.37489e-05 25.9834 0.0368249 26.1688 0.108469 26.3418C0.180114 26.5147 0.28514 26.6719 0.417545 26.8042C0.54995 26.9366 0.707139 27.0416 0.880127 27.1131L17.2452 33.8917C17.5945 34.0361 17.9869 34.0361 18.3362 33.8917L29.6574 29.2017C29.8304 29.1301 29.9875 29.0251 30.1199 28.8928C30.2523 28.7604 30.3573 28.6032 30.4289 28.4303L37.2078 12.065C37.2795 11.8921 37.3164 11.7068 37.3164 11.5196C37.3165 11.3325 37.2796 11.1471 37.208 10.9742ZM20.425 29.9407L21.8784 26.4316L25.3873 27.885L20.425 29.9407ZM28.3407 26.0222L21.6524 23.252C21.3031 23.1075 20.9107 23.1076 20.5615 23.2523C20.2123 23.3969 19.9348 23.6743 19.79 24.0235L17.0194 30.7123L3.28783 25.0247L12.2918 3.28773L34.0286 12.2912L28.3407 26.0222Z\" fill=\"currentColor\"/>\n<path d=\"M25.3493 16.976L24.258 14.3423L16.959 17.3666L15.7196 14.375L13.0859 15.4659L15.4161 21.0916L25.3493 16.976Z\" fill=\"currentColor\"/>\n</svg>                \n\n<span>#{title_reactions}</span>\n</div>\n\n<div class=\"full-start__button selector button--subscribe hide\">\n<svg width=\"25\" height=\"30\" viewBox=\"0 0 25 30\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<path d=\"M6.01892 24C6.27423 27.3562 9.07836 30 12.5 30C15.9216 30 18.7257 27.3562 18.981 24H15.9645C15.7219 25.6961 14.2632 27 12.5 27C10.7367 27 9.27804 25.6961 9.03542 24H6.01892Z\" fill=\"currentColor\"/>\n<path d=\"M3.81972 14.5957V10.2679C3.81972 5.41336 7.7181 1.5 12.5 1.5C17.2819 1.5 21.1803 5.41336 21.1803 10.2679V14.5957C21.1803 15.8462 21.5399 17.0709 22.2168 18.1213L23.0727 19.4494C24.2077 21.2106 22.9392 23.5 20.9098 23.5H4.09021C2.06084 23.5 0.792282 21.2106 1.9273 19.4494L2.78317 18.1213C3.46012 17.0709 3.81972 15.8462 3.81972 14.5957Z\" stroke=\"currentColor\" stroke-width=\"2.5\"/>\n</svg>\n\n<span>#{title_subscribe}</span>\n</div>\n\n<div class=\"full-start__button selector button--options\">\n<svg width=\"38\" height=\"10\" viewBox=\"0 0 38 10\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n<circle cx=\"4.88968\" cy=\"4.98563\" r=\"4.75394\" fill=\"currentColor\"/>\n<circle cx=\"18.9746\" cy=\"4.98563\" r=\"4.75394\" fill=\"currentColor\"/>\n<circle cx=\"33.0596\" cy=\"4.98563\" r=\"4.75394\" fill=\"currentColor\"/>\n</svg>\n</div>\n\n</div>\n</div>\n</div>\n</div>");
        // Стили 
        var style = "\n        <style id=\"maxsm_interface_mod_theme_forall\">\n " +
            // Круглые чек-боксы
            ".selectbox-item__checkbox\n {\nborder-radius: 100%\n}\n" +
            ".selectbox-item--checked .selectbox-item__checkbox\n {\nbackground: #ccc;\n}\n" +
            //  Рейтинг внутри карточки
            ".full-start-new__rate-line .full-start__pg {\n    font-size: 1em;\nbackground: #fff;\n    color: #000;\n}\n." +
            ".full-start__rate \n{\n      border-radius: 0.25em;\n padding: 0.3em;\n background-color: rgba(0, 0, 0, 0.3);\n}\n" +
            ".full-start__pg, .full-start__status\n {\nfont-size: 1em;\nbackground: #fff;\n    color: #000;\n}\n" +
            // Докручиваем плашки на карточках стилями 
            // Заголовок
            ".card__title {\n                     height: 3.6em;\n                     text-overflow: ellipsis;\n                     -o-text-overflow: ellipsis;\n                     text-overflow: ellipsis;\n                     -webkit-line-clamp: 3;\n                     line-clamp: 3;\n                 }\n " +
            // Год
            ".card__age {\n  position: absolute;\n  right: 0em;\n  bottom: 0em;\n  z-index: 10;\n  background: rgba(0, 0, 0, 0.6);\n  color: #ffffff;\n  font-weight: 700;\n  padding: 0.4em 0.6em;\n  -webkit-border-radius: 0.48em 0 0.48em 0;\n       -moz-border-radius: 0.48em 0 0.48em 0;\n           border-radius: 0.48em 0 0.48em 0;\nline-height: 1.0;\nfont-size: 1.0em;\n}\n " +
            // Рейтинг
            ".card__vote {\n  position: absolute;\n  bottom: auto; \n right: 0em;\n  top: 0em;\n  background: rgba(0, 0, 0, 0.6);\n  font-weight: 700;\n  color: #fff;\n -webkit-border-radius: 0 0.34em 0 0.34em;\n       -moz-border-radius: 0 0.34em 0 0.34em;\n           border-radius: 0 0.34em 0 0.34em;\nline-height: 1.0;\nfont-size: 1.4em;\n}\n  " +
            // Тип (Сериал)
            ".card__type  {\n  position: absolute;\n  bottom: auto; \n left: 0em; \nright: auto;\n  top: 0em;\n  background: rgba(0, 0, 0, 0.6);\n  color: #fff;\n  font-weight: 700;\n  padding: 0.4em 0.6em;\n  -webkit-border-radius: 0.4em 0 0.4em 0;\n       -moz-border-radius: 0.4em 0 0.4em 0;;\n           border-radius: 0.4em 0 0.4em 0;\nline-height: 1.0;\nfont-size: 1.0em;\n}\n " +
            ".card--tv .card__type {\n  color: #fff;\n}\n" +
            // Иконки закладок и т.д.
            ".card__icons {\n  position: absolute;\n  top: 2em;\n  left: 0;\n  right: auto;\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -moz-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-pack: center;\n  -webkit-justify-content: center;\n         -moz-box-pack: center;\n          -ms-flex-pack: center;\n              justify-content: center;\n background: rgba(0, 0, 0, 0.6);\n  color: #fff;\n       -webkit-border-radius: 0 0.5em 0.5em 0;\n         -moz-border-radius: 0 0.5em 0.5em 0;\n             border-radius: 0 0.5em 0.5em 0;\n}\n" +
            ".card__icons-inner {\n  background: rgba(0, 0, 0, 0); \n}\n" +
            // Статус расширенных закладок
            ".card__marker {\n position: absolute;\n  left: 0em;\n  top: 4em;\n  bottom: auto; \n  background: rgba(0, 0, 0, 0.6);\n  -webkit-border-radius: 0 0.5em 0.5em 0;\n       -moz-border-radius: 0 0.5em 0.5em 0;\n           border-radius: 0 0.5em 0.5em 0;\n  font-weight: 700;\n font-size: 1.0em;\n    padding: 0.4em 0.6em;\n    display: -webkit-box;\n  display: -webkit-flex;\n  display: -moz-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-align: center;\n  -webkit-align-items: center;\n         -moz-box-align: center;\n          -ms-flex-align: center;\n              align-items: center;\n  line-height: 1.2;\nmax-width: min(12em, 95%);\nbox-sizing: border-box;\n}\n" +
            // На маленьких экранах обрезаем, на больших полностью
            ".card__marker > span {\n max-width: min(12em, 95%);\n}\n" +
            // отметка качества background: rgba(0, 0, 0, 0.6);\n  
            ".card__quality {\n  position: absolute;\n  left: auto;\n ri\n"

        // Добавляем стиль в head
        $('head').append(style);
        
        // Переносим настройки из основного кода плагина для единообразия
        Lampa.Settings.listener.follow('open', function(e) {
            if (e.name == 'interface') {
                $("div[data-name=interface_size]").after($("div[data-name=theme_select]"));
            }
        });
    }

    // Ждем загрузки приложения и запускаем плагин
    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function(event) {
            if (event.type === 'ready') {
                startPlugin();
            }
        });
    }

    function startPlugin() {
        // Добавляем в настройки Lampa
        Lampa.Settings.add('maxsm_themes', {
            component: 'select',
            options: {
                title: Lampa.Lang.translate('maxsm_themes'),
                items: Object.keys(themes).concat(['default']),
                selected: maxsm_themes.settings.theme
            },
            onChange: function onChange(value) {
                maxsm_themes.settings.theme = value;
                Lampa.Settings.update();
                applyTheme(value);
            }
        });

        // Применяем настройки и проверяем, существует ли выбранная тема
        var savedTheme = Lampa.Storage.get('theme_select', 'mint_dark');
        if (Object.keys(themes).indexOf(savedTheme) === -1 && savedTheme !== 'default') {
            // Если сохраненная тема не существует, ставим по умолчанию
            Lampa.Storage.set('theme_select', 'mint_dark');
            savedTheme = 'mint_dark';
        }
        maxsm_themes.settings.theme = savedTheme;
        applyTheme(maxsm_themes.settings.theme);
        
        Lampa.Settings.listener.follow('open', function(e) {
            if (e.name == 'interface') {
                $("[data-name=light_version]").remove()
                $("[data-name=background]").remove()
                $("[data-name=background_type]").remove()
                $("[data-name=card_interfice_type]").remove()
                $("[data-name=glass_style]").prev('.settings-param-title').remove();
                $("[data-name=glass_style]").remove()
                $("[data-name=glass_opacity]").remove()
                $("[data-name=card_interfice_poster]").prev('.settings-param-title').remove();
                $("[data-name=card_interfice_poster]").remove()
                $("[data-name=card_interfice_cover]").remove()
                $("[data-name=advanced_animation]").remove()
            }
        });
        
        // Настройки интерфейса под темы
        Lampa.Storage.set('light_version', 'false');
        Lampa.Storage.set('background', 'false');
        Lampa.Storage.set('card_interfice_type', 'new');
        Lampa.Storage.set('glass_style', 'false');
        Lampa.Storage.set('card_interfice_poster', 'false');
        Lampa.Storage.set('card_interfice_cover', 'true');
        Lampa.Storage.set('advanced_animation', 'false');

        // Переносим вызовы forall() и removeFromSettingsMenu() в startPlugin() для лучшей организации
        forall();
        removeFromSettingsMenu();
    }

    // Регистрация плагина в манифесте
    Lampa.Manifest.plugins.push({
        name: 'maxsm_themes',
        version: '2.2.1',
        author: 'maxsm_themes',
        description: 'Темы оформления',
        about: 'Тема',
        icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDBweCIgaGVpZ2h0PSIxMDBweCIgdmlld0JveD0iMCAwIDEwMCAxMDAiPjxwYXRoIGQ9Ik01MCwwYTIuMzIsMi4zMiwwLDAsMC0yLjMxLDIuMzF2MzYuNDZhMi4zMiwyLjMyLDAsMCwwLDIuMzEsMi4zMmgyMy41NGEyLjMyLDIuMzIsMCwwLDAsMi4zMi0yLjMyVjI1Ljg5QTQ5Ljg1LDQ5Ljg1LDAsMCwwLDk0LjQsMjcuMjJsLTEwLTYuNjRhMi4zMiwyLjMyLDAsMCwwLTIuNzgsMy43Mkw4MSwyNi4xNEExNS4xNiwxNS4xNiwwLDAsMSw3NS4yMSwyNGgyLjY4YTIuMzIsMi4zMiwwLDAsMCwyLjMxLTIuMzFWOS4xYTIuMzIsMi4zMiwwLDAsMC0yLjMxLTIuMzFaIiBmaWxsPSIjZWRlZTIwIi8+PHBhdGggZD0iTTU3LjQ3LDM5Ljg3YTM5Ljg1LDM5Ljg1LDAsMCwxLDYuNTgsNC40bDEuMjMsMi4yNGE0Mi4xNCw0Mi4xNCwwLDAsMC02LjE2LTQuODNBNDEuOTEsNDEuOTEsMCwwLDAsNTcuNDcsMzkuODdaIiBmaWxsPSIjMmFjNWU4Ii8+PHBhdGggZD0iTTU4LjM1LDM3LjYyYTQ0LjY3LDQ0LjY3LDAsMCwwLTEuMTMtMi42NGwtMS43OCwxLjYyYTM1LjgyLDM1LjgyLDAsMCwxLDEuNTcsMS42OFoiIGZpbGw9IiM2YmI4Y2EiLz48cGF0aCBkPSJNNjMuMzUsNDQuMjNhMzkuNzksMzkuNzksMCwwLDAtNy41Niw1LjQ1bDEuOTIsMi41NmE0NC40OCw0NC40OCwwLDAsMCw3Ljc1LTYuMTZaIiBmaWxsPSIjZmY5OWJkIi8+PHBhdGggZD0iTTU2LjA4LDUwLjIyYTM3LDM3LDAsMCwxLDQuNzYsLjgxbDAsLjg3YS0zOC4xNywzOC4xNywwLDAsMC00LjYyLS41OVoiIGZpbGw9IiM0ZWJmYmQiLz48cGF0aCBkPSJNNTUuMTksNTIuMjZhMzYuNjEsMzYuNjEsMCwwLDAsMiwuMjdsLDEuNTQsMi40YTM3LjkzLDM3LjkzLDAsMCwxLTIuMDctLjI4YTM2LjYzLDM2LjYzLDAsMCwxLS41OS0uMTlsLS45Mi0uNTJhMjIuMjgsMjIuMjgsMCwwLDAtLjc1LS40MWwtMi43NSwyLjU1LDEuMzgsLjgyYTIzLjcxLDIzLjcxLDAsMCwxLjc1LDMuNzcsMjQuMTcsMjQuMTcsMCwwLDEtMS4zNSwwYTI1LjUsMjUuNSwwLDAsMS0xLjQ3LTMuNjNsLS4xMy0uMzZhMjQuNzcsMjQuNzcsMCwwLDEtMS4wNy0uMjdMMzkuMjIsNjguODFhMjIuNTEsMjIuNTEsMCwwLDEtMS44NiwwLDIxLjg3LDIxLjg3LDAsMCwxLS42MS01LjY5YTM2LjcxLDM2LjcxLDAsMCwwLTE0LjU1LTUuMzhsLTEuNDYsMi4zMmEzNS41NiwzNS41NiwwLDAsMSwxNS41LDUuNTRaIiBmaWxsPSIjYTE2YTI2Ii8+PHBhdGggZD0iTTU4LDU3LjUzYTQyLjQ0LDQyLjQ0LDAsMCwxLTMuNjEsMjcuOTIsMjIuNjUsMjIuNjUsMCwwLDEtLjY5LTcuODJhMzcuNDgsMzcuNDgsMCwwLDAsNC4yMS0yMC4xWiIgZmlsbD0iI2Y2Y2MwMCIvPjxwYXRoIGQ9Ik01MS4yMyw4NS42M2E0MC41Myw0MC41MywwLDAsMSw3LjEzLTI2LjY5bC0xLjcsLjc0YTM2LjcsMzYuNywwLDAsMC02LDE5LjY3WjUwLjgxLDc5YTIyLjcxLDIyLjcxLDAsMCwxLTQuMjIsNS43MiwyMy41NiwyMy41NiwwLDAsMC0uNTgtNi40MywxOC40MiwxOC40MiwwLDAsMSw1LjkxLS44MloiIGZpbGw9IiM3ZTdlZDkiLz48cGF0aCBkPSJNNDcuNjQsNzkuMDFhNDMuNzksNDMuNzksMCwwLDAsOC4zNSwyLjY5bDIuMTctMS4yNWExNi44NCwxNi44NCwwLDAsMS0xLjM2LTIuMzlMMzcuODMsNzMuMjVhNDQuNDMsNDQuNDMsMCwwLDAsOS44MSw1Ljc2WiIgZmlsbD0iIzQ2ZjJkNyIvPjxwYXRoIGQ9Ik00Ny4yNSw4MS4yYTE5LjE2LDE5LjE2LDAsMCwxLTUuMTUtLjU0bDEuMjQtMi4zMmExOS41NSwxOS41NSwwLDAsMCw0LjY3LjU0WiIgZmlsbD0iIzAwZmZlZCIvPjxwYXRoIGQ9Ik00Ni44OSw4Mi4zNWExNi4zOSwxNi4zOSwwLDAsMC02LjctMS40LDE0LjU4LDE0LjU4LDAsMCwxLDYuNzksMS42NFoiIGZpbGw9IiMxYjZjNmMiLz48cGF0aCBkPSJNMzkuNjYsNzkuMzhhMTYuNDIsMTYuNDIsMCwwLDEtNS41My0yLjY3YTE3Ljg4LDE3Ljg4LDAsMCwxLDMuNzIsMS41N1oiIGZpbGw9IiM2OWZlYzMiLz48cGF0aCBkPSJNNDEuNzQsNjMuNWEzNi43MSwzNi43MSwwLDAsMC0xNC42OS01LjE5bDEuNDgtMi4zMmEzNS44NywzNS44NywwLDAsMSwxNC42NSw1LjMyWiIgZmlsbD0iIzZjMWYwNCIvPjxwYXRoIGQ9Ik00MC42LDU2LjE2YTM2LjcxLDM2LjcxLDAsMCwxLDQuMDgtMTMuOTdsLTUuMDYsMy45M2EzNS41LDM1LjUsMCwwLDAsMS45OCw5LjczWjM4LjQ3LDU5LjI1YTE5LjE3LDE5LjE3LDAsMCwxLTIuNDctOC42MmwxLjQ4LTIuMzJhMjAuNjgsMjAuNjgsMCwwLDAsMi45LDEwLjA3WiIgZmlsbD0iIzhlYzFhYyIvPjxwYXRoIGQ9Ik0yOS42OCw1NC45YTQxLjgsNDEuOCwwLDAsMC0xLjU1LTcuOTNsMi4zMi0xLjQ0YTM5Ljc0LDM5Ljc0LDAsMCwxLDEuMzgsNi43MlptLTkuMTYtLjIyLDEuNDctMi4yOSwzLjQxLDUuNjZhNDIuNjIsNDIuNjIsMCwwLDAtNC42OC0zLjM3WiIgZmlsbD0iI2FjNWJiYiIvPjxwYXRoIGQ9Ik03OS44NCw0My41NGE0Mi42LDQyLjYsMCwwLDAtNC42OCwzLjQ0bDEuNDcsMi4yOWE0NC40NCw0NC40NCwwLDAsMSw0LjQ3LTMuNjdaIiBmaWxsPSIjOGFiNGFkIi8+PHBhdGggZD0iTTc2LjQ0LDQwLjc3YTM5Ljg3LDM5Ljg3LDAsMCwwLTcuNzUtNi4xNmw1LjUxLTQuMjVhNDEuODksNDEuODksMCwwLDEsMy40Nyw2LjQ3WiIgZmlsbD0iIzczYmYzMSIvPjxwYXRoIGQ9Ik02OS45NCwyMS4zNmE0MS4yMSw0MS4yMSwwLDAsMC04LjUyLDYuNDdsLTQuMTctMy43M2E0NS42OCw0NS42OCwwLDAsMSw5LjItNi43OVoiIGZpbGw9IiM3YTgyZTMiLz48cGF0aCBkPSJNNzguMTUsMTIuNDVsLTguMTYsMTJhNDYuNTcsNDYuNTcsMCwwLDAtMTMuODMtOC4yMWwxMS42Mi03Ljg5YTIuMzEsMi4zMSwwLDAsMCwwLjg0LS4yYzUuMjYtLjksMTAuMTgtMi44MywxMS40Ny00LjQ4YTIuMzIsMi4zMiwwLDAsMCwuMDktMi45MWwtNS4zOC04LjQxYTIuMzIsMi4zMiwwLDAsMC0zLjI5LS41NFoiIGZpbGw9IiM2MDgzZmIiLz48cGF0aCBkPSJNNzkuMjcsNDIuMzJhMjIuMjIsMjIuMjIsMCwwLDAsMSw1Ljg2bDEuNDYsMi4zMmExOS41NywxOS41NywwLDAsMS0xLjUyLTUuMTdaIiBmaWxsPSIjNzQ3NGNlIi8+PHBhdGggZD0iTTM5Ljg4LDU2LjI4YTE3LjY0LDE3LjY0LDAsMCwxLDExLjIzLjk0bDEuMDgsMi4xYTE5LjExLDE5LjExLDAsMCwwLTkuMzYtMS42N1oiIGZpbGw9IiM5ZTRlY2UiLz48cGF0aCBkPSJNNDAuNTksNTQuOTZhMTYuNzgsMTYuNzgsMCwwLDAtMTIuODktNC4xNWwxLjQ3LTIuMzJhMTQuODksMTQuODksMCwwLDEsMTEuMSwzLjI3WiIgZmlsbD0iI2QyMjM1YyIvPjxwYXRoIGQ9Ik02My41OCwxMi40MWExOC41MywxOC41MywwLDAsMC02LjctMS42N2wtMS40OCwyLjMyYTE5LDE5LDAsMCwxLDcuMTIuOTFaIiBmaWxsPSIjYzFjMWI0Ii8+PHBhdGggZD0iTTIuMzEsNDkuNjZhNDcuNjgsNDcuNjgsMCwwLDAsMiwzLjVsNC4wNy0uMThhNDQuNzYsNDQuNzYsMCwwLDEtMS44OC0yLjY5Wk04LjEzLDQyLjc3YTM1LjUsMzUuNSwwLDAsMC01Ljg3LTMuNjNsMS40Ny0yLjMyYTIyLjc3LDIyLjc3LDAsMCwxLDQuNzUsMy43NFoiIGZpbGw9IiNmYmZkY2YiLz48cGF0aCBkPSJNNS4wOCw1NC4yMmE0Mi44Nyw0Mi44NywwLDAsMCwxMy4xMSw0LjYzYTE2Ljg3LDE2Ljg3LDAsMCwwLDkuNjMtMS43NWwyLjcxLDQuMWE0MC45NCw0MC45NCwwLDAsMS0xMy40MywxLjI5YTE0LDE0LDAsMCwxLTQuMjUtMi4xOWwtMS4xNCwyLjIzYTE1LjI0LDE1LjI0LDAsMCwwLDQuNTYsMi41MWE0NS4yMSw0NS4yMSwwLDAsMS0xMi42OS00LjU0Wk0yOS42OCw1NC45MWE0MS44Myw0MS44MywwLDAsMS0xLjU1LTcuOTNsMi4zMi0xLjQ1YTE2LjczLDE2LjczLDAsMCwwLDEuMzgsNi43MloiIGZpbGw9IiMxNTU0NGYiLz48cGF0aCBkPSJNMjkuNzMsNTVhNDEuMjksNDEuMjksMCwwLDAtNC42MywxNC4wOGwxLjQ4LDIuMzJhMzguNzEsMzguNzEsMCwwLDAsNC41LTEyLjY3WiIgZmlsbD0iI2UwYjFkYyIvPjxwYXRoIGQ9Ik0yNS44OSw3Mi4xN2ExOS44NCwxOS44NCwwLDAsMC00LjIsMi40NWwtMi41My0xLjU3YTIxLDE4LjEsMCwwLDAsMy4xOC0yWiIgZmlsbD0iI2FjMGUwYyIvPjxwYXRoIGQ9Ik0yMS40NCw3NC40NWExOC44OSwxOC44OSwwLDAsMC0zLjYyLDMuMjdsLTIuMDgtMi4xM2ExOC41OSwxOC41OSwwLDAsMSwzLjY4LTMuNTRaIiBmaWxsPSIjZmY5OWJkIi8+PHBhdGggZD0iTTI2LjQyLDczLjc3YTQzLjE4LDQzLjE4LDAsMCwxLTcuNTMsNC4yMWwyLjA1LDIuMTEyYTQ2LjcxLDQ2LjcxLDAsMCwwLDcuODgtNC4xNVoiIGZpbGw9IiNmZjAwYjQiLz48cGF0aCBkPSJNMzEuMTYsNzYuNTRhNDcuMTEsNDcuMTEsMCwwLDEtMTAuNjgsMy44N2wyLjczLDQuMWE0My4xOSw0My4xOSwwLDAsMCwxMS40Ni02LjQyWiIgZmlsbD0iI2I2MjU5YyIvPjxwYXRoIGQ9Ik02My41OCwxMi40MWExOC41MywxOC41MywwLDAsMC02LjctMS42N2wtMS40OCwyLjMyYTE5LDE5LDAsMCwxLDcuMTIuOTFaIiBmaWxsPSIjYTE2YTI2Ii8+PHBhdGggZD0iTTcuMjMsMTAuNTNhNDcuNDYsNDcuNDYsMCwwLDEsMTUuMSwyLjUxTDE4LjksNC44NGEyMy40NCwyMy40NCwwLDAsMC0xMS42Nyw1LjY5WiIgZmlsbD0iIzVjNWM2YiIvPjxwYXRoIGQ9Ik03LjY5LDEyLjg2YTQ2LjczLDQ2LjczLDAsMCwxLDguNTIsNi40N2wtNS41MSw0LjI1YTM5Ljg3LDM5Ljg3LDAsMCwwLTMuNDctNi40N1oiIGZpbGw9IiNhYWM4YmEiLz48cGF0aCBkPSJNMTAuOTUsMjEuMjJhNDQuNDQsNDQuNDQsMCwwLDAsNC42OCwzLjQ0bC0xLjQ3LDIuMjlhNDIuNiwyMy42LDAsMCwxLTQuNDctMy42N1oiIGZpbGw9IiM2MmFiMmQiLz48cGF0aCBkPSJNMTQuMzUsMjYuMTNhMzkuNzksMzkuNzksMCwwLDAtNy43NSw2LjE2bDEuOTIsMi41NmE0NC40OCw0NC40OCwwLDAsMCw3Ljc1LTYuMTZaIiBmaWxsPSIjZmY3YmJiIi8+PHBhdGggZD0iTTI3LjcyLDQzLjIzYTM3LjQsMzcuNCwwLDAsMSw0LjIxLTIwLjE0bC0xLjcsLjc0YTM2Ljc2LDM2Ljc2LDAsMCwwLTQuMzIsMjAuMTVaIiBmaWxsPSIjNGViZmJkIi8+PHBhdGggZD0iTTIwLjgxLDYyLjQ3YTE4LjQyLDE4LjQyLDAsMCwwLTYsLjgxbDEuNTQsMi40YTE2LjcsMTYuNywwLDAsMSw0LjQ5LS42MloiIGZpbGw9IiM3ZTdlZDkiLz48cGF0aCBkPSJNNjcuNzYsNDMuOTVsLTEuOTItMi41NmE0MS41Myw0MS41MywwLDAsMSw3Ljc1LTYuMTZsMS40NywyLjI5YTIzLjM1LDIzLjM1LDAsMCwwLTQuNjgsMy4zN1oiIGZpbGw9IiM2MDgzZmIiLz48cGF0aCBkPSJNODAuOTIsNTQuNjRhNDEuODQsNDEuODQsMCwwLDAtMTMuMTEtNC42M2wtMi43MSw0LjExYTI2LjEsMjYuMSwwLDAsMSwxMy40MywxLjI5LDE3Ljg0LDE3Ljg0LDAsMCwxLDQuMjUtMi4xOWwxLjE1LDIuMjJhMTkuMjYsMTkuMjYsMCwwLDAtNC41NiwyLjUxYTQzLjkzLDQzLjkzLDAsMCwxLDEyLjY5LDQuNTRaTTk0LjQsMjcuMjJhNDkuODUsNDkuODUsMCwwLDEtNC44NC0xLjMzbC0xMC02LjY0YTIuMzIsMi4zMiwwLDAsMC0yLjc4LDMuNzJMODEsMjYuMTRhMTUuMTUsMTUuMTUsMCwwLDEtNS43OS0yLjE0bDIuNjgtMS42YTIuMzIsMi4zMiwwLDAsMCwyLjMxLTIuMzFWOS4xYTIuMzIsMi4zMiwwLDAsMC0yLjMxLTIuMzFoLTEwLjhhMjUuMSwyNS4xLDAsMCwwLDcuOTItLjczLDkuNDUsOS40NSwwLDAsMCwwLS43OWwxLjg4LTEuOTFBNDcuNDcsNDcuNDcsMCwwLDAsOTQuNCwyNy4yMloiIGZpbGw9IiMxNTU0NGYiLz48cGF0aCBkPSJNMjIuODMsNzkuNzRhMTkuNjgsMTkuNjgsMCwwLDAsMTIuNDMsMS41MWwtMS4zOS0yLjM3YTE4LjUsMTguNSwwLDAsMS0xMC41My0xLjEzWk04NC4yLDI0LjgyYTM2LjcxLDM2LjcxLDAsMCwwLTIuMy01LjYzbDEuNDctMi4yOWEzNS41NiwzNS41NiwwLDAsMSwyLjEyLDUuNjFaIiBmaWxsPSIjZDc3ODhhIi8+PHBhdGggZD0iTTg4LjIsMzAuMTJhNDEuODMsNDEuODMsMCwwLDAtMTAuNjctNC4zOGwxLjQ4LTIuMzJhNDMuNzksNDMuNzksMCwwLDEsMTEuNTgsNC41NlptMTEuMjksMjUuNzJhNDcuNTgsNDcuNTgsMCwwLDAtMi41Mi0zLjUxbC00LjA3LjE4YTM1Ljg3LDM1Ljg3LDAsMCwxLjc1LDMuOTZaIiBmaWxsPSIjZWRlZTIwIi8+PHBhdGggZD0iTTIuMzEsNTBhNDcuODcsNDcuODcsMCwwLDAtMi4zMSwzNy4yMWwxLjQ2LTIuMzJhNDUuNjIsNDUuNjIsMCwwLDEsMi4xMi01LjcxWk0xMS43NCw4Mi43NWE0My4yNCw0My4yNCwwLDAsMCw3LjUzLTQuMjJsLTIuMDUtMi4xMWExOC41NSwxOC41NSwwLDAsMS03Ljg4LDQuMTRaIiBmaWxsPSIjMDA3ZjYyIi8+PHBhdGggZD0iTTMzLjQ5LDg0LjQzYTQ3LjI5LDQ3LjI5LDAsMCwwLTMuMzYtMS4xNGwtMi4yNCwxLjUzYTE5Ljc3LDIwLDEwLDAsMSwyLjI0LDEuMjZabTMuMTctMS41MmE1MC44NCw1MC44NCwwLDAsMS03LjktMi4xNGwtMS40OCwyLjMyYTQ4LjI5LDQ4LjI5LDAsMCwwLDguMTQsMi40M1ptNTIuNTgsOS40MWExOC41MywxOC41MywwLDAsMC0xNC40OSw1LjA1bDEuMTQtMi4yM2ExNC43NSwxNC43NSwwLDAsMSwxMy40Ny00LjY2WiIgZmlsbD0iIzc2ZmZjOSIvPjxwYXRoIGQ9Ik0zMy4zNiw4NS4yMWExNS41OSwxNS41OSwwLDAsMS0yLjcyLTEuMjZMMjkuNDIsODUsMTQuMjMsNjAuNjNhNDguNDksNDguNDksMCwwLDAtNC42NC0zLjgxLDE1Ljg1LDE1Ljg1LDAsMCwwLTEsMy41Nmw1LjY5LDQuMTJhNDQuMjIsNDQuMjIsMCwwLDEsMTYuNTgsMjMuMzdsMS40OC0yLjMyYTQ2LjcxLDQ2LjcxLDAsMCwwLTE1LjU2LTIyWiIgZmlsbD0iIzNhMjMwMCIvPjxwYXRoIGQ9Ik05NC40LDI3LjIyYTM1LjgyLDM1LjgyLDAsMCwxLTEuMTMtMi42NGwtMS43OCwxLjYyYTM1LjgyLDM1LjgyLDAsMCwwLDQuMTEsMWE0MS42OSw0MS42OSwwLDAsMC0xLjIyLTEuNzVaIiBmaWxsPSIjMWE1MzhjIi8+PHBhdGggZD0iTTE2Ljk1LDMyLjM0YTQ3LjA2LDQ3LjA2LDAsMCwwLTIuMTgsMTguOTdsMS4zMi0yLjM5YTM5Ljc5LDM5Ljc5LDAsMCwxLDEtMTQuNTZaIiBmaWxsPSIjNTQ2YTdmIi8+PHBhdGggZD0iTTE5Ljg0LDMxLjE5YTUxLDEwLjYsMCwwLDAsMTEuOTItMTIuODdsLTMuMTMsLjY0YTUyLDEyLjgsMCwwLDEtMTEuNTcsMTIuNDhaIiBmaWxsPSIjMjM3M2UyIi8+PHBhdGggZD0iTTExLjY0LDI2YTUuMTcsNS4xNywwLDAsMCwwLS43OWwxLjg4LTEuOTFBNDUuNjcsNDUuNjcsMCwwLDAsMTAuODcsMjUuOTRBLjguOCwwLDAsMCwxMS42NCwyNloiIGZpbGw9IiM2YmI4Y2EiLz48cGF0aCBkPSJNMjkuNDUsMzkuNDVhMzcuMzgsMzcuMzgsMCwwLDAtNC43Ni0uODFsLS44NywwYTM4LjYyLDM4LjYyLDAsMCwxLDQuNjIsLjYxWiIgZmlsbD0iI2QyMjM1YyIvPjxwYXRoIGQ9Ik02My40Miw0Ni42OGE0MS4yNCw0MS4yNCwwLDAsMC02LjE2LTQuODNsLTQuMTctMy43M2E0Mi4xOCw0Mi4xOCwwLDAsMSw5LjItNi43OUw2My40Miw0Ni42OFoiIGZpbGw9IiM3YmE2MzYiLz48cGF0aCBkPSJNMjMuMjksNDcuNjJhMzkuMjQsMzkuMjQsMCwwLDAsLTguNzgtMi4zM2wtMS40NiwyLjMyYTM1LjI5LDM1LjI5LDAsMCwxLDguNDUsMi4xM1oiIGZpbGw9IiM4YmExNjciLz48cGF0aCBkPSJNMjguNDEsNDkuNTZhNDcuNDQsNDcuNDQsMCwwLDAsLTcuMjIsMi44MWwxLjIyLTIuMTlhNDEuNjgsNDEuNjgsMCwwLDEsNC42NC0xLjk2WiIgZmlsbD0iIzQ2ZjJkNyIvPjxwYXRoIGQ9Ik0yMS4xOSw1NS4xOWExNi43OCwxNi43OCwwLDAsMSwyLjIxLTQuMjRsLTMuMzQtLjkyYTE1LjcxLDE1LjcxLDAsMCwwLTMuODIsMy4xMVoiIGZpbGw9IiM3MjZmYjIiLz48cGF0aCBkPSJNMjkuNDcsNzUuNjZhMjQuMTcsMjQuMTcsMCwwLDAtMS4zNSwwYTI1LjU2LDI1LjU2LDAsMCwwLTEuNDctMy42M2wtLjEzLS4zNmEyMy42OCwyMy42OCwwLDAsMC0xLjA3LS4yN2wxLjQsLjgzYTE1LjYxLDE1LjYxLDAsMCwxLC43NS0uNDEsMTUuMTUsMTUuMTUsMCwwLDAsLS45Mi0uNTJsLTMuMTItMi40NGExNy44MiwxNy44MiwwLDAsMSwzLjIzLjg5YTE2LjM5LDE2LjM5LDAsMCwxLDYuNzksMS42NFoiIGZpbGw9IiM5ZTRlY2UiLz48cGF0aCBkPSJNNDIuMTQsNjcuNzJhMTkuMTYsMTkuMTYsMCwwLDAsLTUuMTUtLjU0bDEuMjQtMi4zMmExOS41NSwxOS41NSwwLDAsMSw0LjY3LjU0WiIgZmlsbD0iI2ZmN2JiYiIvPjwvZz48L3N2Zz4=',
        author: 'maxsm',
        settings: 'maxsm_themes'
    });
})();

(function () {
    'use strict';

    // --- Захист від повторного запуску плагіна ---
    // Перевіряємо, чи плагін вже був ініціалізований
    if (window.SeasonBadgePlugin && window.SeasonBadgePlugin.__initialized) return;
    
    // Ініціалізуємо глобальний об'єкт плагіна
    window.SeasonBadgePlugin = window.SeasonBadgePlugin || {};
    window.SeasonBadgePlugin.__initialized = true;

    // ===================== КОНФІГУРАЦІЯ ПЛАГІНА =====================
    var CONFIG = {
        tmdbApiKey: '1ad1fd4b4938e876aa6c96d0cded9395',   // API ключ для доступу до TMDB
        cacheTime: 12 * 60 * 60 * 1000,                   // Час зберігання кешу (12 години)
        enabled: true,                                    // Активувати/деактивувати плагін
        language: 'uk'                                    // Мова для запитів до TMDB
    };

    // ===================== СТИЛІ ДЛЯ МІТОК СЕЗОНУ ЧЕРЕЗ LAMPA.TEMPLATE =====================
    // Вирівняно з Quality+Mod.js: однакові font-size, padding, margin-left, z-index
    var seasonStyles = "<style id=\"season_badge_styles\">" +
        ".card--season-complete {" + // Стиль для ЗАВЕРШЕНИХ сезонів (зелена мітка)
        " position: absolute; " +
        " bottom: 0.50em; " +
        " left: 0; " +
        " margin-left: -0.78em; " + // Як у Quality+Mod.js
        " background-color: rgba(61, 161, 141, 1); " + // Зелений колір
        " z-index: 10;" + // Вирівняно з Quality+Mod.js (було 9)
        " width: fit-content; " +
        " max-width: calc(100% - 1em); " +
        " border-radius: 0.3em 0.3em 0.3em 0.3em; " +
        " overflow: hidden;" +
        " opacity: 0;" +
        " transition: opacity 0.22s ease-in-out;" +
        "}" +
        ".card--season-progress {" + // Стиль для НЕЗАВЕРШЕНИХ сезонів (жовта мітка з прогресом)
        " position: absolute; " +
        " bottom: 0.50em; " +
        " left: 0; " +
        " margin-left: -0.78em; " + // Як у Quality+Mod.js
        " background-color: rgba(255, 193, 7, 1); " + // Жовтий колір
        " z-index: 10;" + // Вирівняно з Quality+Mod.js (було 9)
        " width: fit-content; " +
        " max-width: calc(100% - 1em); " +
        " border-radius: 0.3em 0.3em 0.3em 0.3em; " +
        " overflow: hidden;" +
        " opacity: 0;" +
        " transition: opacity 0.22s ease-in-out;" +
        "}" +
        ".card--season-complete div," + // Стилі тексту для обох типів міток
        ".card--season-progress div {" +
        " text-transform: uppercase; " +
        " font-family: 'Roboto Condensed', 'Arial Narrow', Arial, sans-serif; " +
        " font-weight: 700; " + 
        " letter-spacing: 0.1px; " + 
        " font-size: 1.10em; " + // Як у Quality+Mod.js
        " padding: 0.1em 0.1em 0.08em 0.1em; " + // Як у Quality+Mod.js
        " white-space: nowrap;" +
        " text-shadow: 0.5px 0.5px 1px rgba(0,0,0,0.3); " + 
        " display: flex;" + 
        " align-items: center;" + 
        " gap: 4px;" + 
        "}" +
        ".card--season-complete div {" + // Білий текст для зелених міток
        " color: #ffffff !important;" +
        "}" +
        ".card--season-progress div {" + // Чорний текст для жовтих міток
        " color: #000000 !important;" +
        "}" +
        ".card--season-complete.show," + // Клас для плавного показу мітки
        ".card--season-progress.show {" +
        " opacity: 1;" + 
        "}" +
        "</style>";

    // Додаємо стилі через Lampa.Template (як у Quality+Mod.js)
    if (window.Lampa && Lampa.Template) {
        Lampa.Template.add('season_badge_css', seasonStyles);
        $('body').append(Lampa.Template.get('season_badge_css', {}, true));
    } else {
        // Fallback якщо Lampa не завантажена
        document.head.insertAdjacentHTML('beforeend', seasonStyles);
    }

    // Стилі для плавного з'явлення міток сезонів (як у Quality+Mod.js)
    var seasonFadeStyles = "<style id='season_badge_fade'>" +
        ".card--season-complete, .card--season-progress {" +
        "opacity: 0;" + 
        "transition: opacity 0.22s ease-in-out;" + 
        "}" +
        ".card--season-complete.show, .card--season-progress.show {" +
        "opacity: 1;" + 
        "}" +
        "</style>";
    
    if (window.Lampa && Lampa.Template) {
        Lampa.Template.add('season_badge_fade_css', seasonFadeStyles);
        $('body').append(Lampa.Template.get('season_badge_fade_css', {}, true));
    } else {
        document.head.insertAdjacentHTML('beforeend', seasonFadeStyles);
    }

    // ===================== ДОПОМІЖНІ ФУНКЦІЇ =====================
    function getMediaType(cardData) {
        if (!cardData) return 'unknown';
        if (cardData.name || cardData.first_air_date) return 'tv';
        if (cardData.title || cardData.release_date) return 'movie';
        return 'unknown';
    }

    // ===================== КЕШУВАННЯ ДАНИХ =====================
    var cache = JSON.parse(localStorage.getItem('seasonBadgeCache') || '{}');
    function fetchSeriesData(tmdbId) {
        return new Promise(function(resolve, reject) {
            if (cache[tmdbId] && (Date.now() - cache[tmdbId].timestamp < CONFIG.cacheTime)) {
                return resolve(cache[tmdbId].data);
            }
            if (!CONFIG.tmdbApiKey || CONFIG.tmdbApiKey === 'ваш_tmdb_api_key_тут') {
                return reject(new Error('Будь ласка, вставте коректний TMDB API ключ'));
            }
            var url = `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${CONFIG.tmdbApiKey}&language=${CONFIG.language}`;
            fetch(url)
                .then(response => response.json())
                .then(function(data) {
                    if (data.success === false) throw new Error(data.status_message);
                    cache[tmdbId] = { data: data, timestamp: Date.now() };
                    localStorage.setItem('seasonBadgeCache', JSON.stringify(cache));
                    resolve(data);
                })
                .catch(reject);
        });
    }

    // ===================== ОБРОБКА ДАНИХ СЕЗОНІВ =====================
    function getSeasonProgress(tmdbData) {
        if (!tmdbData || !tmdbData.seasons || !tmdbData.last_episode_to_air) return false;
        var lastEpisode = tmdbData.last_episode_to_air;
        var currentSeason = tmdbData.seasons.find(s => 
            s.season_number === lastEpisode.season_number && s.season_number > 0
        );
        if (!currentSeason) return false;
        var totalEpisodes = currentSeason.episode_count || 0;
        var airedEpisodes = lastEpisode.episode_number || 0;
        return {
            seasonNumber: lastEpisode.season_number,
            airedEpisodes: airedEpisodes,
            totalEpisodes: totalEpisodes,
            isComplete: airedEpisodes >= totalEpisodes
        };
    }

    // ===================== РОБОТА З DOM ЕЛЕМЕНТАМИ =====================
    function createBadge(content, isComplete, loading) {
        var badge = document.createElement('div');
        var badgeClass = isComplete ? 'card--season-complete' : 'card--season-progress';
        badge.className = badgeClass + (loading ? ' loading' : '');
        badge.innerHTML = `<div>${content}</div>`;
        return badge;
    }

    function adjustBadgePosition(cardEl, badge) {
        let quality = cardEl.querySelector('.card__quality');
        if (quality && badge) {
            let qHeight = quality.offsetHeight; 
            let qBottom = parseFloat(getComputedStyle(quality).bottom) || 0; 
            badge.style.bottom = (qHeight + qBottom) + 'px';
        } else if (badge) {
            badge.style.bottom = '0.50em'; 
        }
    }

    function updateBadgePositions(cardEl) {
        var badges = cardEl.querySelectorAll('.card--season-complete, .card--season-progress');
        badges.forEach(function(badge) {
            adjustBadgePosition(cardEl, badge);
        });
    }

    // ===================== СПОСТЕРЕЖЕННЯ ЗА МІТКАМИ ЯКОСТІ =====================
    var qualityObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes?.forEach(function(node) {
                if (node.classList && node.classList.contains('card__quality')) {
                    var cardEl = node.closest('.card');
                    if (cardEl) setTimeout(() => updateBadgePositions(cardEl), 100);
                }
            });
            mutation.removedNodes?.forEach(function(node) {
                if (node.classList && node.classList.contains('card__quality')) {
                    var cardEl = node.closest('.card');
                    if (cardEl) setTimeout(() => updateBadgePositions(cardEl), 100);
                }
            });
        });
    });

    // ===================== ОСНОВНА ФУНКЦІЯ ДОДАВАННЯ МІТОК =====================
    function addSeasonBadge(cardEl) {
        if (!cardEl || cardEl.hasAttribute('data-season-processed')) return;
        if (!cardEl.card_data) {
            requestAnimationFrame(() => addSeasonBadge(cardEl));
            return;
        }
        var data = cardEl.card_data;
        if (getMediaType(data) !== 'tv') return;
        var view = cardEl.querySelector('.card__view');
        if (!view) return;
        var oldBadges = view.querySelectorAll('.card--season-complete, .card--season-progress');
        oldBadges.forEach(b => b.remove());
        var badge = createBadge('...', false, true);
        view.appendChild(badge);
        adjustBadgePosition(cardEl, badge);
        try {
            qualityObserver.observe(view, { childList: true, subtree: true });
        } catch (e) {
            console.log('Помилка спостереження за мітками якості:', e);
        }
        cardEl.setAttribute('data-season-processed', 'loading');
        fetchSeriesData(data.id)
            .then(function(tmdbData) {
                var progressInfo = getSeasonProgress(tmdbData);
                if (progressInfo) {
                    var content = '';
                    var isComplete = progressInfo.isComplete;
                    if (isComplete) {
                        content = `S${progressInfo.seasonNumber}`;
                    } else {
                        content = `S${progressInfo.seasonNumber} ${progressInfo.airedEpisodes}/${progressInfo.totalEpisodes}`;
                    }
                    badge.className = isComplete ? 'card--season-complete' : 'card--season-progress';
                    badge.innerHTML = `<div>${content}</div>`;
                    adjustBadgePosition(cardEl, badge);
                    setTimeout(() => {
                        badge.classList.add('show');
                        adjustBadgePosition(cardEl, badge);
                    }, 50);
                    cardEl.setAttribute('data-season-processed', isComplete ? 'complete' : 'in-progress');
                } else {
                    badge.remove();
                    cardEl.setAttribute('data-season-processed', 'error');
                }
            })
            .catch(function(error) {
                console.log('SeasonBadgePlugin помилка:', error.message);
                badge.remove();
                cardEl.setAttribute('data-season-processed', 'error');
            });
    }

    // ===================== СИСТЕМА СПОСТЕРЕЖЕННЯ ЗА НОВИМИ КАРТКАМИ =====================
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes?.forEach(function(node) {
                if (node.nodeType !== 1) return;
                if (node.classList && node.classList.contains('card')) {
                    addSeasonBadge(node);
                }
                if (node.querySelectorAll) {
                    node.querySelectorAll('.card').forEach(addSeasonBadge);
                }
            });
        });
    });

    // ===================== ОБРОБНИК ЗМІНИ РОЗМІРУ ВІКНА =====================
    window.addEventListener('resize', function() {
        var allBadges = document.querySelectorAll('.card--season-complete, .card--season-progress');
        allBadges.forEach(function(badge) {
            var cardEl = badge.closest('.card');
            if (cardEl) adjustBadgePosition(cardEl, badge);
        });
    });

    // ===================== ОСНОВНА ФУНКЦІЯ ІНІЦІАЛІЗАЦІЇ ПЛАГІНА =====================
    function initPlugin() {
        if (!CONFIG.enabled) return;
        var containers = document.querySelectorAll('.cards, .card-list, .content, .main, .cards-list, .preview__list');
        if (containers.length > 0) {
            containers.forEach(container => {
                try {
                    observer.observe(container, { childList: true, subtree: true });
                } catch (e) {
                    console.log('Помилка спостереження за контейнером:', e);
                }
            });
        } else {
            observer.observe(document.body, { childList: true, subtree: true });
        }
        document.querySelectorAll('.card:not([data-season-processed])').forEach((card, index) => {
            setTimeout(() => addSeasonBadge(card), index * 300);
        });
    }

    // ===================== СИСТЕМА ЗАПУСКУ ПЛАГІНА =====================
    if (window.appready) {
        initPlugin();
    } 
    else if (window.Lampa && Lampa.Listener) {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') initPlugin();
        });
    } 
    else {
        setTimeout(initPlugin, 2000);
    }

})();

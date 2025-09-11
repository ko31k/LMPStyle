(function () {
    'use strict';

    if (window.SeasonSeriaPlugin && window.SeasonSeriaPlugin.__initialized) return;
    window.SeasonSeriaPlugin = window.SeasonSeriaPlugin || {};
    window.SeasonSeriaPlugin.__initialized = true;

    Lampa.Lang.add({
        season_seria_setting: {
            en: "Show series status (season/episode)",
            uk: "Відображення стану серіалу (сезон/серія)",
            ru: "Отображение статуса сериала (сезон/эпизод)"
        },
        season_seria_active: {
            en: "Season {season}\nEpisodes {current}/{total}",
            uk: "Сезон {season}\nЕпізодів {current}/{total}",
            ru: "Сезон {season}\nЭпизодов {current}/{total}"
        },
        season_seria_season_completed: {
            en: "Season {season} Episodes {episodes}\nIn Production",
            uk: "Сезон {season} Епізодів {episodes}\nЗнімається",
            ru: "Сезон {season} Эпизодов {episodes}\nСнимается"
        },
        season_seria_series_ended: {
            en: "Seasons {seasons} Episodes {episodes}\nEnded",
            uk: "Сезонів {seasons} Епізодів {episodes}\nЗакінчений",
            ru: "Сезонов {seasons} Эпизодов {episodes}\nЗавершено"
        },
        season_seria_series_canceled: {
            en: "Seasons {seasons} Episodes {episodes}\nCanceled",
            uk: "Сезонів {seasons} Епізодів {episodes}\nВідмінений",
            ru: "Сезонов {seasons} Эпизодов {episodes}\nОтменено"
        },
        season_seria_series_planned: {
            en: "Season {season}\nPlanned",
            uk: "Сезон {season}\nЗапланований",
            ru: "Сезон {season}\nЗапланировано"
        },
        season_seria_returning_series: {
            en: "Season {season}\nReturning Series",
            uk: "Сезон {season}\nПродовжується",
            ru: "Сезон {season}\nПродолжается"
        },
        season_seria_pilot: {
            en: "Pilot\nIn Production",
            uk: "Пілот\nЗнімається",
            ru: "Пилот\nСнимается"
        },
        season_seria_unknown_status: {
            en: "Season {season}\nStatus unknown",
            uk: "Сезон {season}\nСтатус невідомий",
            ru: "Сезон {season}\nСтатус неизвестен"
        }
    });

    Lampa.SettingsApi.addParam({
        component: 'interface',
        param: {
            name: 'season_and_seria',
            type: 'trigger',
            default: true
        },
        field: {
            name: Lampa.Lang.translate('season_seria_setting')
        }
    });

    function isSeasonSeriaEnabled() {
        return Lampa.Storage.get('season_and_seria', true) === true;
    }

    function initPlugin() {
        if (!isSeasonSeriaEnabled()) return;

        var style = $('<style>' +
            '.full-start__poster, .full-start-new__poster { position: relative; width: 100%; }' +
            '.card--new_seria { position: absolute; top: 3.25em; right: 0; width: auto; max-width: 100%; font-size: 1em; padding: 0.15em 1em; border-radius: 1em 0 0 1em; z-index: 11; background: rgba(0,0,0,0.3); color: #fff; text-align: center; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; font-weight: bold; }' +
            '.card--new_seria span { display: block; white-space: pre; }' +
            '</style>');
        $('head').append(style);

        Lampa.Listener.follow('full', function (event) {
            if (event.type !== 'complite' || Lampa.Activity.active().component !== 'full') return;

            var data = Lampa.Activity.active().card;
            if (!data || data.source !== 'tmdb' || !data.seasons || !isSeasonSeriaEnabled()) return;

            var activityRender = Lampa.Activity.active().activity.render();
            var cardContainer = $('.full-start__poster, .full-start-new__poster', activityRender);
            if ($('.card--new_seria', activityRender).length || !cardContainer.length) return;

            var status = data.status || '';
            var seasons = data.seasons || [];
            var lastEpisode = data.last_episode_to_air;
            var nextEpisode = data.next_episode_to_air;
            
            // Фільтруємо тільки реальні сезони (виключаємо спеціальні сезони з номером 0)
            var realSeasons = seasons.filter(function(season) {
                return season.season_number > 0 && season.episode_count > 0;
            });

            // Підраховуємо загальну кількість епізодів
            var totalEpisodes = realSeasons.reduce(function(total, season) {
                return total + (season.episode_count || 0);
            }, 0);

            var labelText = '';

            if (status === 'Ended') {
                // Для завершених серіалів
                labelText = Lampa.Lang.translate('season_seria_series_ended')
                    .replace('{seasons}', realSeasons.length)
                    .replace('{episodes}', totalEpisodes);
            } 
            else if (status === 'Canceled') {
                // Для скасованих серіалів
                labelText = Lampa.Lang.translate('season_seria_series_canceled')
                    .replace('{seasons}', realSeasons.length)
                    .replace('{episodes}', totalEpisodes);
            }
            else if (status === 'Planned') {
                // Для запланованих серіалів
                labelText = Lampa.Lang.translate('season_seria_series_planned')
                    .replace('{season}', 1);
            }
            else if (status === 'Returning Series') {
                // Для серіалів, які продовжуються
                if (lastEpisode) {
                    labelText = Lampa.Lang.translate('season_seria_returning_series')
                        .replace('{season}', lastEpisode.season_number);
                } else {
                    labelText = Lampa.Lang.translate('season_seria_returning_series')
                        .replace('{season}', 1);
                }
            }
            else if (lastEpisode) {
                // Для активних серіалів
                var currentSeasonNumber = lastEpisode.season_number;
                var currentEpisodeNumber = lastEpisode.episode_number;
                
                var currentSeason = realSeasons.find(function(season) {
                    return season.season_number === currentSeasonNumber;
                });
                
                var episodeCount = currentSeason ? currentSeason.episode_count : currentEpisodeNumber;
                
                if (nextEpisode && new Date(nextEpisode.air_date) <= new Date()) {
                    // Є наступна серія, яка вже вийшла
                    labelText = Lampa.Lang.translate('season_seria_active')
                        .replace('{season}', nextEpisode.season_number)
                        .replace('{current}', nextEpisode.episode_number)
                        .replace('{total}', episodeCount);
                } else {
                    // Поточна серія - остання випущена
                    labelText = Lampa.Lang.translate('season_seria_active')
                        .replace('{season}', currentSeasonNumber)
                        .replace('{current}', currentEpisodeNumber)
                        .replace('{total}', episodeCount);
                }
            }
            else if (realSeasons.length === 0 && seasons.find(function(s) { return s.season_number === 0; })) {
                // Пілотний епізод (спеціальний сезон 0)
                labelText = Lampa.Lang.translate('season_seria_pilot');
            }
            else {
                // Невідомий статус
                labelText = Lampa.Lang.translate('season_seria_unknown_status')
                    .replace('{season}', 1);
            }

            var newSeriaTag = '<div class="card--new_seria"><span>' + labelText + '</span></div>';
            cardContainer.append(newSeriaTag);
        });
    }

    if (window.appready) {
        initPlugin();
    } else {
        Lampa.Listener.follow('app', function (event) {
            if (event.type === 'ready') initPlugin();
        });
    }
})();

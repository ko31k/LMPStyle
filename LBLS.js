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
            en: "Season {season}\nEpisodes {episodes}\nIn Production",
            uk: "Сезон {season}\nЕпізодів {episodes}\nЗнімається",
            ru: "Сезон {season}\nЭпизодов {episodes}\nСнимается"
        },
        season_seria_series_ended: {
            en: "Seasons {seasons}\nEpisodes {episodes}\nEnded",
            uk: "Сезонів {seasons}\nЕпізодів {episodes}\nЗакінчено",
            ru: "Сезонов {seasons}\nЭпизодов {episodes}\nЗавершено"
        },
        season_seria_series_canceled: {
            en: "Seasons {seasons}\nEpisodes {episodes}\nCanceled",
            uk: "Сезонів {seasons}\nЕпізодів {episodes}\nПрипинено",
            ru: "Сезонов {seasons}\nЭпизодов {episodes}\nОтменено"
        },
        season_seria_series_planned: {
            en: "Season {season}\nPlanned\n{date}",
            uk: "Сезон {season}\nЗаплановано\n{date}",
            ru: "Сезон {season}\nЗапланировано\n{date}"
        },
        season_seria_series_announced: {
            en: "Season {season}\nAnnounced",
            uk: "Сезон {season}\nАнонсовано",
            ru: "Сезон {season}\nАнонсировано"
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
        season_seria_no_episodes: {
            en: "Season {season}\nEpisodes 0/{total}",
            uk: "Сезон {season}\nЕпізодів 0/{total}",
            ru: "Сезон {season}\nЭпизодов 0/{total}"
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

    function formatDate(dateString) {
        if (!dateString) return '';
        var date = new Date(dateString);
        return date.toLocaleDateString();
    }

    function initPlugin() {
        if (!isSeasonSeriaEnabled()) return;

        var style = $('<style>' +
            '.full-start__poster, .full-start-new__poster { position: relative; width: 100%; }' +
            '.card--new_seria { position: absolute; top: 3em; right: 0; width: auto; max-width: 100%; font-size: 1em; padding: 0.15em 1em; border-radius: 1em 0 0 1em; z-index: 11; background: rgba(0,0,0,0.3); color: #fff; text-align: center; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; font-weight: bold; }' +
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
                return season.season_number > 0;
            });

            // Сортуємо сезони по номеру
            realSeasons.sort(function(a, b) {
                return a.season_number - b.season_number;
            });

            // Підраховуємо загальну кількість епізодів
            var totalEpisodes = realSeasons.reduce(function(total, season) {
                return total + (season.episode_count || 0);
            }, 0);

            var labelText = '';

            // Для серіалів, які ще не почалися (немає епізодів)
            if (!lastEpisode && realSeasons.length > 0) {
                var firstSeason = realSeasons[0];
                var episodeCount = firstSeason.episode_count || 0;
                
                if (episodeCount > 0) {
                    // Відомо кількість серій - показуємо 0/8
                    labelText = Lampa.Lang.translate('season_seria_no_episodes')
                        .replace('{season}', 1)
                        .replace('{total}', episodeCount);
                } 
                else if (firstSeason.air_date) {
                    // Є дата виходу
                    var formattedDate = formatDate(firstSeason.air_date);
                    labelText = Lampa.Lang.translate('season_seria_series_planned')
                        .replace('{season}', 1)
                        .replace('{date}', formattedDate);
                } 
                else if (status === 'Planned' || status === 'In Production') {
                    // Заплановано або в процесі зйомок
                    labelText = Lampa.Lang.translate('season_seria_series_planned')
                        .replace('{season}', 1)
                        .replace('{date}', '');
                } 
                else {
                    // Просто анонсовано
                    labelText = Lampa.Lang.translate('season_seria_series_announced')
                        .replace('{season}', 1);
                }
            }
            // Для завершених серіалів
            else if (status === 'Ended') {
                labelText = Lampa.Lang.translate('season_seria_series_ended')
                    .replace('{seasons}', realSeasons.length)
                    .replace('{episodes}', totalEpisodes);
            } 
            // Для скасованих серіалів
            else if (status === 'Canceled') {
                labelText = Lampa.Lang.translate('season_seria_series_canceled')
                    .replace('{seasons}', realSeasons.length)
                    .replace('{episodes}', totalEpisodes);
            }
            // Для серіалів, які продовжуються
            else if (status === 'Returning Series' && lastEpisode) {
                var currentSeason = realSeasons.find(function(season) {
                    return season.season_number === lastEpisode.season_number;
                });
                
                if (currentSeason && lastEpisode.episode_number === currentSeason.episode_count) {
                    // Сезон завершено, знімається наступний
                    labelText = Lampa.Lang.translate('season_seria_season_completed')
                        .replace('{season}', lastEpisode.season_number)
                        .replace('{episodes}', currentSeason.episode_count);
                } else {
                    // Сезон ще триває
                    labelText = Lampa.Lang.translate('season_seria_active')
                        .replace('{season}', lastEpisode.season_number)
                        .replace('{current}', lastEpisode.episode_number)
                        .replace('{total}', currentSeason ? currentSeason.episode_count : 0);
                }
            }
            // Для серіалів в процесі зйомок
            else if (lastEpisode) {
                var currentSeasonNumber = lastEpisode.season_number;
                var currentEpisodeNumber = lastEpisode.episode_number;
                
                var currentSeason = realSeasons.find(function(season) {
                    return season.season_number === currentSeasonNumber;
                });
                
                var episodeCount = currentSeason ? currentSeason.episode_count : 0;
                
                if (currentSeason && currentEpisodeNumber === episodeCount) {
                    // Сезон завершено
                    labelText = Lampa.Lang.translate('season_seria_season_completed')
                        .replace('{season}', currentSeasonNumber)
                        .replace('{episodes}', episodeCount);
                } else {
                    // Сезон ще триває
                    labelText = Lampa.Lang.translate('season_seria_active')
                        .replace('{season}', currentSeasonNumber)
                        .replace('{current}', currentEpisodeNumber)
                        .replace('{total}', episodeCount);
                }
            }
            // Пілотний епізод
            else if (realSeasons.length === 0 && seasons.find(function(s) { return s.season_number === 0; })) {
                labelText = Lampa.Lang.translate('season_seria_pilot');
            }
            // Серіал без епізодів
            else if (totalEpisodes === 0) {
                labelText = Lampa.Lang.translate('season_seria_no_episodes')
                    .replace('{season}', 1)
                    .replace('{total}', 0);
            }
            // Невідомий статус
            else {
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

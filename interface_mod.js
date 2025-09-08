// Основная функция новой инфо-панели
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
    
    // Додаємо змінну для відстеження поточної картки
    var currentMovieId = null;

    Lampa.Listener.follow('full', function(data) {
        if (data.type === 'complite' && settings.info_panel) {
            // Перевіряємо, чи є дані для обробки
            if (!data.data || !data.data.movie) return;
            
            // Отримуємо ID поточного фільму/серіалу
            var movieId = data.data.movie.id || Date.now();
            
            // Якщо це та сама картка, не робимо нічого
            if (currentMovieId === movieId) return;
            
            currentMovieId = movieId;
            
            setTimeout(function() {
                var details = $('.full-start-new__details');
                if (!details.length) return;
                
                // ПОВНІСТЮ очищаємо контейнер
                details.empty();
                
                var movie = data.data.movie;
                var isTvShow = movie && (movie.number_of_seasons > 0 || (movie.seasons && movie.seasons.length > 0) || movie.type === 'tv' || movie.type === 'serial');
                
                var newContainer = $('<div>').css({
                    'display': 'flex',
                    'flex-direction': 'column',
                    'width': '100%',
                    'gap': '0.6em',
                    'margin': '0.6em 0 0.6em 0'
                });
                
                var firstRow = $('<div>').css({
                    'display': 'flex',
                    'flex-wrap': 'wrap',
                    'gap': '0.4em',
                    'align-items': 'center',
                    'margin': '0 0 0.2em 0'
                });
                
                var secondRow = $('<div>').css({
                    'display': 'flex',
                    'flex-wrap': 'wrap',
                    'gap': '0.4em',
                    'align-items': 'center',
                    'margin': '0 0 0.2em 0'
                });
                
                var thirdRow = $('<div>').css({
                    'display': 'flex',
                    'flex-wrap': 'wrap',
                    'gap': '0.4em',
                    'align-items': 'center',
                    'margin': '0 0 0.2em 0'
                });
                
                // --- КОРРЕКТНЫЙ ВЫВОД СЕРИЙ ДЛЯ СЕРИАЛОВ + МЕТКА О СЛЕДУЮЩЕЙ СЕРИИ ---
                if (isTvShow && movie && movie.seasons && Array.isArray(movie.seasons)) {
                    var totalEpisodes = 0;
                    var airedEpisodes = 0;
                    var currentDate = new Date();
                    
                    movie.seasons.forEach(function(season) {
                        if (season.season_number === 0) return;
                        if (season.episode_count) totalEpisodes += season.episode_count;
                        if (season.episodes && Array.isArray(season.episodes)) {
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
                    
                    // Додаємо інформацію про сезони
                    if (movie.number_of_seasons > 0) {
                        var baseStyle = { 'border-radius': '0.3em', 'border': '0px', 'font-size': '1.3em', 'padding': '0.2em 0.6em', 'display': 'inline-block', 'white-space': 'nowrap', 'line-height': '1.2em', 'margin-right': '0.4em', 'margin-bottom': '0.2em' };
                        var seasonText = movie.number_of_seasons + ' ' + plural(movie.number_of_seasons, 'Сезон', 'Сезону', 'Сезонів');
                        var $seasonBadge = $('<span>').text(seasonText).css($.extend({}, baseStyle, { 'background-color': colors.seasons.bg, 'color': colors.seasons.text }));
                        firstRow.append($seasonBadge);
                    }
                    
                    // Додаємо інформацію про серії
                    if (totalEpisodes > 0) {
                        var baseStyle = { 'border-radius': '0.3em', 'border': '0px', 'font-size': '1.3em', 'padding': '0.2em 0.6em', 'display': 'inline-block', 'white-space': 'nowrap', 'line-height': '1.2em', 'margin-right': '0.4em', 'margin-bottom': '0.2em' };
                        var episodesText = '';
                        
                        if (airedEpisodes > 0 && airedEpisodes < totalEpisodes) {
                            episodesText = airedEpisodes + ' ' + plural(airedEpisodes, 'Серія', 'Серії', 'Серій') + ' з ' + totalEpisodes;
                        } else {
                            episodesText = totalEpisodes + ' ' + plural(totalEpisodes, 'Серія', 'Серії', 'Серій');
                        }
                        
                        var $episodeBadge = $('<span>').text(episodesText).css($.extend({}, baseStyle, { 'background-color': colors.episodes.bg, 'color': colors.episodes.text }));
                        firstRow.append($episodeBadge);
                    }
                    
                    // Додаємо метку про наступну серію
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
                            var nextStyle = { 'border-radius': '0.3em', 'border': '0px', 'font-size': '1.3em', 'padding': '0.2em 0.6em', 'display': 'inline-block', 'white-space': 'nowrap', 'line-height': '1.2em', 'background-color': colors.next.bg, 'color': colors.next.text, 'margin-right': '0.4em', 'margin-bottom': '0.2em' };
                            var $nextBadge = $('<span>').text(nextText).css(nextStyle);
                            secondRow.append($nextBadge);
                        }
                    }
                    
                    // Додаємо тривалість серії
                    var avgDuration = calculateAverageEpisodeDuration(movie);
                    if (avgDuration > 0) {
                        var durationText = 'Тривалість серії ≈ ' + formatDurationMinutes(avgDuration);
                        var baseStyle = { 'border-radius': '0.3em', 'border': '0px', 'font-size': '1.3em', 'padding': '0.2em 0.6em', 'display': 'inline-block', 'white-space': 'nowrap', 'line-height': '1.2em', 'margin-right': '0.4em', 'margin-bottom': '0.2em' };
                        var $avgDurationBadge = $('<span>').text(durationText).css($.extend({}, baseStyle, { 'background-color': colors.duration.bg, 'color': colors.duration.text }));
                        thirdRow.append($avgDurationBadge);
                    }
                }
                
                // --- ОБРОБКА ДЛЯ ФИЛЬМОВ ---
                if (!isTvShow && movie && movie.runtime > 0) {
                    var mins = movie.runtime;
                    var hours = Math.floor(mins / 60);
                    var min = mins % 60;
                    var text = 'Тривалість фільму: ';
                    
                    if (hours > 0) text += hours + ' ' + plural(hours, 'година', 'години', 'годин');
                    if (min > 0) text += (hours > 0 ? ' ' : '') + min + ' хв.';
                    
                    var $badge = $('<span>').text(text).css({
                        'border-radius': '0.3em',
                        'border': '0px',
                        'font-size': '1.3em',
                        'padding': '0.2em 0.6em',
                        'display': 'inline-block',
                        'white-space': 'nowrap',
                        'line-height': '1.2em',
                        'background-color': colors.duration.bg,
                        'color': colors.duration.text,
                        'margin': '0.2em',
                        'margin-right': '0.4em',
                        'margin-bottom': '0.2em'
                    });
                    secondRow.append($badge);
                }
                
                // --- ДОДАЄМО ЖАНРИ ---
                if (movie.genres && Array.isArray(movie.genres)) {
                    var $genresContainer = $('<div>').css({ 'display': 'flex', 'flex-wrap': 'wrap', 'align-items': 'center', 'gap': '0.4em' });
                    
                    movie.genres.forEach(function(genre) {
                        if (genre && genre.name) {
                            var color = colors.genres[genre.name] || { bg: 'rgba(255, 255, 255, 0.1)', text: 'white' };
                            var baseStyle = { 'border-radius': '0.3em', 'border': '0px', 'font-size': '1.3em', 'padding': '0.2em 0.6em', 'display': 'inline-block', 'white-space': 'nowrap', 'line-height': '1.2em' };
                            var $badge = $('<span>').text(genre.name).css($.extend({}, baseStyle, { 'background-color': color.bg, 'color': color.text }));
                            $genresContainer.append($badge);
                        }
                    });
                    
                    thirdRow.append($genresContainer);
                }
                
                // --- ДОДАЄМО ВСІ РЯДКИ В КОНТЕЙНЕР ---
                if (firstRow.children().length) newContainer.append(firstRow);
                if (secondRow.children().length) newContainer.append(secondRow);
                if (thirdRow.children().length) newContainer.append(thirdRow);
                
                // Додаємо контейнер до деталей
                details.append(newContainer);
                
            }, 100);
        }
        
        // Очищаємо при закритті картки
        if (data.type === 'close') {
            currentMovieId = null;
        }
    });
}
(function(){
    let plugin = {
        title: 'Auto Upcoming Episodes',
        description: 'Автоматично оновлює закладки серіалів при старті, щоб працював розділ "Найближчі виходи епізодів".',
        version: '1.1',
        author: 'GPT + User',
        type: 'general',

        run(){
            console.log('[AutoUpcoming] Запуск плагіна');

            // Читаємо закладки
            let favorites = Lampa.Storage.get('favorite','[]');
            let serials = favorites.filter(f => f.type === 'tv');

            if(!serials.length){
                console.log('[AutoUpcoming] Серіалів у закладках немає');
                return;
            }

            console.log('[AutoUpcoming] Серіалів у закладках:', serials.length);

            serials.forEach((item, i) => {
                setTimeout(() => {
                    try {
                        // Викликаємо details (те саме, що коли відкриваєш картку)
                        Lampa.TMDB.details('tv', item.id, (data) => {
                            console.log('[AutoUpcoming] Оновлено:', item.name || item.title);
                        }, (err) => {
                            console.warn('[AutoUpcoming] Помилка:', item.id, err);
                        });
                    } catch(e){
                        console.error('[AutoUpcoming] Виключення:', e.message);
                    }
                }, i * 1000); // пауза між запитами
            });
        }
    };

    Lampa.Plugin.create(plugin);
})();

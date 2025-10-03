(function(){
    /**
     * Auto Upcoming Episodes (background version)
     * ------------------------------------------
     * При кожному старті Lampa проходить по всіх закладках (Подобається, Пізніше, Закладки)
     * і підтягує дані серіалів. Це активує стандартний розділ "Найближчі виходи епізодів".
     */

    function updateSerials(){
        let favorites = Lampa.Storage.get('favorite','{}');
        let lists = Object.values(favorites || {});
        let all = [];

        // Об’єднуємо всі групи в один масив
        lists.forEach(list => {
            (list || []).forEach(item => {
                if(item.type === 'tv') all.push(item);
            });
        });

        if(!all.length){
            console.log('[AutoUpcoming] Серіалів у закладках немає');
            return;
        }

        console.log('[AutoUpcoming] Серіалів для оновлення:', all.length);

        // Проходимо по кожному серіалу
        all.forEach((item, i) => {
            setTimeout(() => {
                try {
                    Lampa.TMDB.details('tv', item.id, (data) => {
                        console.log('[AutoUpcoming] Оновлено:', item.name || item.title);
                    }, (err) => {
                        console.warn('[AutoUpcoming] Помилка оновлення:', item.id, err);
                    });
                } catch(e){
                    console.error('[AutoUpcoming] Виключення:', e.message);
                }
            }, i * 1000); // затримка 1 секунда між запитами
        });
    }

    // Коли додаток готовий – запускаємо перевірку
    Lampa.Listener.follow('app', (event) => {
        if(event.type === 'ready'){
            console.log('[AutoUpcoming] Запуск у фоні');
            updateSerials();
        }
    });
})();

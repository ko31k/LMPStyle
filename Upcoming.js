(function(){
    function updateUpcoming(){
        let fav = Lampa.Storage.get('favorite','{}');
        if(!fav) return;

        let all = [];
        ['like','later','book'].forEach(group => {
            if(fav[group]) fav[group].forEach(item => {
                if(item.type === 'tv') all.push(item);
            });
        });

        console.log('[AutoUpcoming] Серіалів для оновлення:', all.length);

        all.forEach((item, i) => {
            setTimeout(() => {
                Lampa.TMDB.details('tv', item.id, data => {
                    console.log('[AutoUpcoming] Оновлено:', data.name);
                }, e => {
                    console.warn('[AutoUpcoming] Помилка:', item.id, e);
                });
            }, i * 1500); // невелика затримка
        });
    }

    // Коли додаток готовий — запускаємо
    Lampa.Listener.follow('app', e => {
        if(e.type === 'ready'){
            setTimeout(updateUpcoming, 5000);
        }
    });
})();

(function(){
    /**
     * Плагін "Auto Upcoming Episodes"
     * --------------------------------
     * Ідея: при кожному старті Lampa автоматично "проходить" по закладках серіалів
     * і підтягує для них дані. Це імітує відкриття картки вручну.
     * У результаті стандартний блок "Найближчі виходи епізодів" стає активним одразу.
     */

    // Основна функція ініціалізації
    function init(){
        // Отримуємо всі закладки з локального сховища
        let favorites = Lampa.Storage.get('favorite','[]');

        // Відбираємо тільки серіали (type === 'tv')
        let serials = favorites.filter(f => f.type === 'tv');

        console.log('[AutoUpcoming] Знайдено серіалів у закладках:', serials.length);

        // Якщо серіалів немає – виходимо
        if(!serials.length) return;

        // Проходимо по кожному серіалу з невеликою затримкою,
        // щоб не робити занадто багато запитів одночасно
        serials.forEach((item, i) => {
            setTimeout(() => {
                try {
                    // Викликаємо API Lampa для отримання даних серіалу з TMDB
                    Lampa.TMDB.tv(item.id, (data) => {
                        console.log('[AutoUpcoming] Оновлено серіал:', item.name || item.title);
                        // Нічого не малюємо – цього достатньо, щоб Lampa
                        // оновила кеш і підхопила інформацію для "Найближчих виходів"
                    }, (error) => {
                        console.warn('[AutoUpcoming] Помилка оновлення серіалу:', item.id, error);
                    });
                } catch(e){
                    console.error('[AutoUpcoming] Виключення при оновленні серіалу:', e.message);
                }
            }, i * 800); // 800мс затримки між запитами (налаштовується)
        });
    }

    // Підписуємося на подію старту додатку
    Lampa.Listener.follow('app', (event) => {
        if(event.type === 'ready'){
            console.log('[AutoUpcoming] Старт плагіна');
            init();
        }
    });

    // Реєструємо плагін у меню "Мої налаштування" (щоб було видно, що він увімкнений)
    Lampa.Plugin.create({
        title: 'Auto Upcoming Episodes',
        description: 'Автоматично оновлює закладки серіалів при старті, щоб з\'являвся розділ "Найближчі виходи епізодів".',
        version: '1.0',
        author: 'GPT + User',
        type: 'general'
    });
})();

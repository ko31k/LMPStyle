(function () {
    "use strict";

    // 1. Блокуємо завантаження скриптів Shorts
    var originalPutScript = Lampa.Utils.putScript;
    Lampa.Utils.putScript = function (url, callback, error_callback, sync) {
        if (typeof url === "string" && url.indexOf('shorts') !== -1) {
            if (callback) callback();
            return;
        }
        return originalPutScript.apply(this, arguments);
    };

    // 2. Вирізаємо Shorts зі списку відео в картці фільму
    Lampa.Listener.follow("full", function (e) {
        if (e.type == "complite") {
            var movie = e.data.movie;
            if (movie && movie.videos && movie.videos.results) {
                movie.videos.results = movie.videos.results.filter(function (v) {
                    var name = (v.name || "").toLowerCase();
                    // Фільтруємо Shorts та Backstage
                    return name.indexOf("shorts") === -1 && name.indexOf("backstage") === -1;
                });
            }
        }
    });

    // 3. Приховуємо кнопку Shorts, якщо вона з'являється в меню
    var style = document.createElement('style');
    style.innerHTML = `
        [data-action="shorts"], .menu__item:contains("Shorts") { 
            display: none !important; 
        }
    `;
    document.head.appendChild(style);

    console.log("Plugin: Shorts Blocked (Light version)");
})();

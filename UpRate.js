(function() {
    'use strict';
    
    // Основна функція запуску плагіна
    function startPlugin() {
        // Створюємо CSS стиль для зміни позиції рейтингу
        let style = document.createElement('style');
        // Додаємо CSS правило: змінюємо позицію знизу на верх
        style.innerHTML = `
            .card:not(.fullscreen) .card_vote {
                top: 0.3em !important;        // Відступ зверху (як було знизу)
                bottom: auto !important;      // Вимикаємо відступ знизу
            }
        `;
        // Додаємо стиль до документу
        document.head.appendChild(style);

        // Функція для оновлення позиції всіх рейтингів
        function updateVotePosition() {
            // Знаходимо всі елементи з рейтингом
            document.querySelectorAll(".card_vote").forEach(voteElement => {
                // Перевіряємо, що це не повноекранний режим
                if (!voteElement.closest('.fullscreen')) {
                    // Встановлюємо нову позицію через JavaScript
                    voteElement.style.top = "0.3em";      // Відступ зверху
                    voteElement.style.bottom = "auto";    // Скидаємо відступ знизу
                }
            });
        }

        // Запускаємо оновлення позиції через 1 секунду після завантаження
        setTimeout(updateVotePosition, 1000);
        
        // Створюємо спостерігач за змінами в DOM
        const observer = new MutationObserver(() => {
            // Оновлюємо позицію нових елементів через 0.3 секунди
            setTimeout(updateVotePosition, 300);
        });
        // Починаємо спостерігати за змінами в body
        observer.observe(document.body, { 
            childList: true,    // Слідкуємо за додаванням/видаленням елементів
            subtree: true       // Слідкуємо за всіма вкладеними елементами
        });
    }

    // Перевіряємо, чи додаток вже завантажено
    if (window.appready) {
        // Якщо так - запускаємо плагін одразу
        startPlugin();
    } else {
        // Якщо ні - чекаємо поки додаток буде готовий
        Lampa.Listener.follow('app', e => {
            if (e.type === 'ready') {
                // Запускаємо плагін після завантаження додатка
                startPlugin();
            }
        });
    }
})();

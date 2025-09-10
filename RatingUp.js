(function() {
    'use strict';
    
    function startPlugin() {
        console.log('UpRate plugin started - using .card__vote selector');

        // CSS для зміни позиції
        let style = document.createElement('style');
        style.innerHTML = `
            .card:not(.fullscreen) .card__vote {
                top: 0.3em !important;
                bottom: auto !important;
                right: 0.3em !important;
                left: auto !important;
            }
        `;
        document.head.appendChild(style);

        function updateVotePosition() {
            const votes = document.querySelectorAll(".card__vote");
            console.log('Found', votes.length, 'vote elements with .card__vote');
            
            votes.forEach(voteElement => {
                if (!voteElement.closest('.fullscreen')) {
                    voteElement.style.top = "0.3em";
                    voteElement.style.bottom = "auto";
                    voteElement.style.right = "0.3em";
                    voteElement.style.left = "auto";
                    voteElement.style.position = "absolute";
                }
            });
        }

        // Запускаємо кілька разів
        setTimeout(updateVotePosition, 500);
        setTimeout(updateVotePosition, 1000);
        setTimeout(updateVotePosition, 2000);
        
        // Слідкуємо за змінами
        const observer = new MutationObserver(updateVotePosition);
        observer.observe(document.body, { 
            childList: true, 
            subtree: true
        });
    }

    // Запускаємо плагін
    if (typeof Lampa !== 'undefined') {
        if (window.appready) startPlugin();
        else Lampa.Listener.follow('app', e => {
            if (e.type === 'ready') startPlugin();
        });
    } else {
        window.addEventListener('load', startPlugin);
    }
})();

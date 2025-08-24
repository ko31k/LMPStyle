(function() {
    setTimeout(function() {
        const clearBtnId = 'CLEARCACHE';

        // Видалення існуючої кнопки
        $('#' + clearBtnId).remove();

        // Додавання CSS
        if (!document.getElementById('clearcache-style')) {
            const css = `
                /* Новий стиль для кнопки Стрічка */
                .head__action.selector.open--feed svg path {
                    fill: #2196F3 !important;
                }
                
                /* Решта вашого оригінального CSS */
                #${clearBtnId} svg path {
                    fill: lime !important;
                    transition: fill 0.2s ease;
                }
                #${clearBtnId}.selector:hover,
                #${clearBtnId}.selector:focus,
                #${clearBtnId}.selector:active {
                    background: white !important;
                }
                #${clearBtnId}.selector:hover svg path,
                #${clearBtnId}.selector:focus svg path,
                #${clearBtnId}.selector:active svg path {
                    fill: black !important;
                }

                .full-start__button {
                    transition: transform 0.2s ease !important;
                    position: relative;
                }
                .full-start__button:active {
                    transform: scale(0.98) !important;
                }

                .full-start__button.view--online svg path {
                    fill: #2196f3 !important;
                }
                .full-start__button.view--torrent svg path {
                    fill: lime !important;
                }
                .full-start__button.view--trailer svg path {
                    fill: #f44336 !important;
                }

                .full-start__button.loading::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: rgba(255,255,255,0.5);
                    animation: loading 1s linear infinite;
                }
                @keyframes loading {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }

                @media (max-width: 767px) {
                    .full-start__button {
                        min-height: 44px !important;
                        padding: 10px !important;
                    }
                }
            `;
            const style = document.createElement('style');
            style.id = 'clearcache-style';
            style.textContent = css;
            document.head.appendChild(style);
        }

        // Додавання кнопки очищення кешу
        $('.head__actions').append(`
            <div id="${clearBtnId}" class="head__action selector m-clear-cache">
                <svg width="24" height="24" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 3.1l1.4 2.2-1.6 1.1 1.3 0.3 2.8 0.6 0.6-2.7 0.4-1.4-1.8 1.1-2-3.3h-2.2l-2.6 4.3 1.7 1z"/>
                    <path d="M16 12l-2.7-4.3-1.7 1 2 3.3h-2.6v-2l-3 3 3 3v-2h3.7z"/>
                    <path d="M2.4 12v0l1.4-2.3 1.7 1.1-0.9-4.2-2.8 0.7-1.3 0.3 1.6 1-2.1 3.4 1.3 2h5.7v-2z"/>
                </svg>
            </div>
        `);

        // Оригінальний обробник для TV (повертаємо стару логіку)
        $('#' + clearBtnId).on('hover:enter hover:click hover:touch', function() {
            try {
                $(this).addClass('loading');
                
                if (Lampa && Lampa.Cache && typeof Lampa.Cache.clear === 'function') {
                    Lampa.Cache.clear();
                    setTimeout(() => {
                        alert('🗑 Кеш Lampa очищено');
                        $(this).removeClass('loading');
                        setTimeout(() => location.reload(), 300);
                    }, 800);
                } else {
                    if (confirm('Очистить кеш? Данные парсера будут сохранены.\n\nНажмите OK для очистки без данных парсера\nИли Отмена для полной очистки')) {
                        // Очистка БЕЗ данных парсера
                        setTimeout(() => {
                            let removed = 0;
                            const keysToRemove = [];
                            for (let i = 0; i < localStorage.length; i++) {
                                const key = localStorage.key(i);
                                if ((key.startsWith('card_') || key.startsWith('full_card_') || 
                                     key.startsWith('lite_card_') || key.startsWith('viewed_card_') || 
                                     key.startsWith('viewed_continue_') || key.startsWith('cub_') || 
                                     key.startsWith('start_time_') || key.startsWith('cache_')) &&
                                     !key.startsWith('parser_')) {
                                    keysToRemove.push(key);
                                }
                            }
                            keysToRemove.forEach(key => {
                                localStorage.removeItem(key);
                                removed++;
                            });
                            alert(` Локальний кеш очищено: ${removed} ключів (данные парсера сохранены)`);
                            $(this).removeClass('loading');
                            setTimeout(() => location.reload(), 300);
                        }, 800);
                    } else {
                        // Полная очистка ВКЛЮЧАЯ данные парсера
                        setTimeout(() => {
                            let removed = 0;
                            const keysToRemove = [];
                            for (let i = 0; i < localStorage.length; i++) {
                                const key = localStorage.key(i);
                                if (key.startsWith('card_') || key.startsWith('full_card_') || 
                                    key.startsWith('lite_card_') || key.startsWith('viewed_card_') || 
                                    key.startsWith('viewed_continue_') || key.startsWith('parser_') || 
                                    key.startsWith('cub_') || key.startsWith('start_time_') || 
                                    key.startsWith('cache_')) {
                                    keysToRemove.push(key);
                                }
                            }
                            keysToRemove.forEach(key => {
                                localStorage.removeItem(key);
                                removed++;
                            });
                            alert(` Полная очистка кеша: ${removed} ключів (включая данные парсера)`);
                            $(this).removeClass('loading');
                            setTimeout(() => location.reload(), 300);
                        }, 800);
                    }
                }
            } catch (e) {
                console.error('Помилка очищення кешу:', e);
                $('#' + clearBtnId).removeClass('loading');
            }
        });

        // Оновлення кнопок
        function updateButtons() {
            $('.full-start__button.view--torrent svg').replaceWith(`
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="50px" height="50px">
                    <path d="M25,2C12.317,2,2,12.317,2,25s10.317,23,23,23s23-10.317,23-23S37.683,2,25,2zM40.5,30.963c-3.1,0-4.9-2.4-4.9-2.4S34.1,35,27,35c-1.4,0-3.6-0.837-3.6-0.837l4.17,9.643C26.727,43.92,25.874,44,25,44c-2.157,0-4.222-0.377-6.155-1.039L9.237,16.851c0,0-0.7-1.2,0.4-1.5c1.1-0.3,5.4-1.2,5.4-1.2s1.475-0.494

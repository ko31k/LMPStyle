(function addDesktopThemePatch(){
  const themeColor = getComputedStyle(document.body).backgroundColor;
  const patch = document.createElement('style');
  patch.id = 'interface_mod_theme_patch';
  patch.textContent = `
    /* фон для десктопа */
    html, body,
    .app, .content, .background,
    .app__body, .app__content,
    .layer, .layout, .page, .wrap, .scroll, .screensaver__body {
        background: ${themeColor} !important;
    }

    /* одразу заокруглені кнопки */
    .full-start__button,
    .full-start-new__buttons .button,
    .buttons-container .button {
        border-radius: 1.5em !important;          /* базове заокруглення */
        transition: border-radius 0.3s ease;
    }
    /* при наведенні ще трохи більше */
    .full-start__button:hover,
    .full-start-new__buttons .button:hover,
    .buttons-container .button:hover {
        border-radius: 1.5em !important;        /* більше заокруглення */
    }`;
  document.head.appendChild(patch);
})();

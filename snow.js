(function () {
    'use strict';

    // Prevent double init
    if (window.__snow_plugin_init__) return;
    window.__snow_plugin_init__ = true;

    // ----- Storage helpers (try Lampa.Storage, fallback to localStorage) -----
    function getStorage(key, def) {
        try {
            if (window.Lampa && Lampa.Storage && typeof Lampa.Storage.get === 'function') {
                var v = Lampa.Storage.get(key);
                if (v === undefined || v === null) return def;
                try { return JSON.parse(v); } catch (e) { return v; }
            }
        } catch (e) {}
        try {
            var s = localStorage.getItem(key);
            return s === null ? def : JSON.parse(s);
        } catch (e) { return def; }
    }

    function setStorage(key, value) {
        try {
            if (window.Lampa && Lampa.Storage && typeof Lampa.Storage.set === 'function') {
                try { Lampa.Storage.set(key, value); return; } catch (e) {}
            }
        } catch (e) {}
        try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
    }

    // ----- initial settings -----
    var intensity = parseInt(getStorage('snow_intensity', 200)) || 200; // ms between flakes
    var enabled = (getStorage('snow_enabled', true) === true);

    var intervalId = null;

    // ----- plugin registration (safe) -----
    function registerPlugin() {
        try {
            if (window.Lampa && Lampa.Plugin && typeof Lampa.Plugin.create === 'function') {
                Lampa.Plugin.create({
                    title: 'Snow',
                    description: 'Ефект падаючого снігу',
                    id: 'snow',
                    status: true
                });
            }
        } catch (e) { /* silent */ }
    }

    // ----- snow styles -----
    function injectSnowStyles() {
        if (document.getElementById('snow-styles')) return;
        var style = document.createElement('style');
        style.id = 'snow-styles';
        style.textContent = '\n' +
            '.snowflake{position:fixed;top:-10px;left:0;will-change:transform;pointer-events:none;user-select:none;' +
            'animation-name:snow-fall;animation-timing-function:linear;z-index:2147483647;color:#fff}\n' +
            '@keyframes snow-fall{to{transform:translateY(100vh);}}\n' +
            '#snow-settings-btn{position:fixed;right:12px;bottom:12px;z-index:2147483646;width:46px;height:46px;border-radius:50%;' +
            'background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;color:#fff;cursor:pointer;font-size:22px}\n' +
            '#snow-settings-modal{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:2147483647;' +
            'background:rgba(0,0,0,0.9);color:#fff;padding:18px;border-radius:8px;min-width:280px;max-width:90vw}\n' +
            '#snow-settings-modal h3{margin:0 0 10px 0;font-size:16px}\n' +
            '#snow-settings-modal label{display:block;margin:8px 0;font-size:14px}\n' +
            '#snow-settings-modal .row{display:flex;align-items:center;justify-content:space-between;margin-top:8px}\n' +
            '#snow-settings-close{position:absolute;right:8px;top:8px;cursor:pointer;font-size:16px}\n' +
            '#snow-settings-modal input[type=range]{width:100%}\n';
        document.head.appendChild(style);
    }

    // ----- create single snowflake -----
    function createSnowflake() {
        if (!enabled) return;
        var s = document.createElement('div');
        s.className = 'snowflake';
        s.textContent = '❄';
        s.style.left = (Math.random() * window.innerWidth) + 'px';
        s.style.fontSize = (Math.random() * 14 + 10) + 'px';
        s.style.opacity = (Math.random() * 0.6 + 0.4).toFixed(2);
        s.style.animationDuration = (Math.random() * 3 + 2) + 's';
        document.body.appendChild(s);
        // remove after animation duration + small margin
        setTimeout(function () { try { s.remove(); } catch (e) {} }, 7000);
    }

    // ----- control snow -----
    function startSnow() {
        injectSnowStyles();
        stopSnow();
        intervalId = setInterval(createSnowflake, Math.max(50, intensity));
    }
    function stopSnow() {
        if (intervalId) clearInterval(intervalId);
        intervalId = null;
    }
    function toggleSnow(on) {
        enabled = !!on;
        setStorage('snow_enabled', enabled);
        if (enabled) startSnow(); else stopSnow();
    }
    function setIntensity(ms) {
        ms = parseInt(ms) || 200;
        if (ms < 50) ms = 50;
        intensity = ms;
        setStorage('snow_intensity', intensity);
        if (enabled) startSnow();
    }

    // ----- Settings UI fallback -----
    function addSettingsFallback() {
        try {
            if (document.getElementById('snow-settings-btn')) return;
            injectSnowStyles();

            var btn = document.createElement('div');
            btn.id = 'snow-settings-btn';
            btn.title = 'Snow — налаштування';
            btn.innerHTML = '❄';
            btn.addEventListener('click', openModal);
            document.body.appendChild(btn);

            function openModal() {
                if (document.getElementById('snow-settings-modal')) return;
                var modal = document.createElement('div');
                modal.id = 'snow-settings-modal';
                modal.innerHTML = '<span id="snow-settings-close">✕</span>' +
                    '<h3>Snow — налаштування</h3>' +
                    '<label><input id="snow-enable-checkbox" type="checkbox"> Увімкнути сніг</label>' +
                    '<label>Інтенсивність (мс між сніжинками): <span id="snow-intensity-val"></span></label>' +
                    '<input id="snow-intensity" type="range" min="50" max="1000" step="10">' +
                    '<div class="row"><button id="snow-save">Зберегти</button><button id="snow-close">Закрити</button></div>';

                document.body.appendChild(modal);

                var ch = document.getElementById('snow-enable-checkbox');
                var rng = document.getElementById('snow-intensity');
                var v = document.getElementById('snow-intensity-val');
                ch.checked = enabled;
                rng.value = intensity;
                v.textContent = intensity;

                function close() {
                    try { modal.remove(); } catch (e) {}
                }

                document.getElementById('snow-settings-close').addEventListener('click', close);
                document.getElementById('snow-close').addEventListener('click', close);

                rng.addEventListener('input', function () {
                    v.textContent = rng.value;
                    setIntensity(rng.value);
                });

                ch.addEventListener('change', function () {
                    toggleSnow(ch.checked);
                });

                document.getElementById('snow-save').addEventListener('click', function () {
                    setIntensity(rng.value);
                    toggleSnow(ch.checked);
                    close();
                });
            }
        } catch (e) { /* silent */ }
    }

    // ----- add to official settings if available, otherwise fallback -----
    function addSettings() {
        try {
            if (window.Lampa && Lampa.Settings && typeof Lampa.Settings.add === 'function') {
                Lampa.Settings.add({
                    title: 'Snow',
                    id: 'snow',
                    icon: 'snowflake',
                    items: [
                        {
                            title: 'Увімкнути сніг',
                            subtitle: 'Показувати/ховати ефект',
                            type: 'toggle',
                            value: enabled,
                            onChange: function (val) { toggleSnow(val); }
                        },
                        {
                            title: 'Інтенсивність снігу (мс)',
                            subtitle: 'Чим менше — тим сильніший сніг',
                            type: 'input',
                            value: intensity,
                            onChange: function (val) {
                                var ms = parseInt(val) || 200;
                                if (ms < 50) ms = 50;
                                setIntensity(ms);
                            }
                        }
                    ]
                });
                return;
            }
        } catch (e) { /* silent */ }

        // fallback UI
        addSettingsFallback();
    }

    // ----- boot sequence -----
    function boot() {
        registerPlugin();
        addSettings();
        if (enabled) startSnow();
    }

    if (window.Lampa && Lampa.Listener && typeof Lampa.Listener.follow === 'function') {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') boot();
        });
        // fallback to boot after short delay
        setTimeout(function () { if (!intervalId) boot(); }, 3000);
    } else if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();

(function () {
  'use strict';

  // ============================================================
  // Right Menu Editor (Settings / Right menu)
  // - Adds pinned item "Редагувати" (pencil) at the very end
  // - Opens editor overlay: move items up/down, hide/show
  // - Persists order + hidden across reloads
  // - Works for ALL existing/future items in this right menu
  // ============================================================

  if (window.__right_menu_editor_loaded__) return;
  window.__right_menu_editor_loaded__ = true;

  // Guards
  if (window.__right_menu_editor_started__ === undefined) window.__right_menu_editor_started__ = false;

  // Storage keys
  var KEY_ORDER  = 'right_menu_editor__order';   // JSON array of components
  var KEY_HIDDEN = 'right_menu_editor__hidden';  // JSON object map: {component:1}

  // Our pinned item
  var EDIT_ITEM_COMPONENT = 'right_menu_editor__edit';
  var editItemEl = null;

  // Watchers
  var settingsMO = null;
  var applyTimer = 0;

  // ============================================================
  // Utils
  // ============================================================
  function safeParseJSON(str, def) {
    try { return JSON.parse(str); } catch (e) { return def; }
  }

  function UA() { return (navigator.userAgent || ''); }

  function storageGet(key, def) {
    try {
      if (window.Lampa && Lampa.Storage && Lampa.Storage.get) return Lampa.Storage.get(key, def);
    } catch (e) {}
    try {
      var v = localStorage.getItem(key);
      if (v === null || typeof v === 'undefined') return def;
      return v;
    } catch (e2) {}
    return def;
  }

  function storageSet(key, val) {
    try {
      if (window.Lampa && Lampa.Storage && Lampa.Storage.set) return Lampa.Storage.set(key, val);
    } catch (e) {}
    try { localStorage.setItem(key, val); } catch (e2) {}
  }

  function isInSettings() {
    var h = (location.hash || '').toLowerCase();
    return (h.indexOf('settings') !== -1 || h.indexOf('настройк') !== -1 || h.indexOf('налашт') !== -1);
  }

  function debounceApply(ms) {
    clearTimeout(applyTimer);
    applyTimer = setTimeout(applyStateOnce, ms || 80);
  }

  // ============================================================
  // Settings root + items
  // ============================================================
  function getSettingsRoot() {
    // Right menu (Settings screen)
    var settings = document.querySelector('.settings');
    if (!settings) return null;

    // Most builds: .scroll__content .scroll__body contains folders
    return settings.querySelector('.scroll__content .scroll__body') || null;
  }

  function getItemComponent(el) {
    try { return el && el.getAttribute && el.getAttribute('data-component'); } catch (e) {}
    return null;
  }

  function getItemName(el) {
    if (!el) return '';
    // Try common selectors
    var n =
      el.querySelector('.settings-folder__name') ||
      el.querySelector('.settings-folder__title') ||
      el.querySelector('.settings__name') ||
      el.querySelector('.name');
    if (n && n.textContent) return String(n.textContent).trim();
    return (el.textContent || '').trim().split('\n')[0].trim();
  }

  function scanItems(root) {
    var out = [];
    if (!root) return out;

    // Only "folders" (menu items)
    var nodes = root.querySelectorAll('.settings-folder.selector, .settings-folder, [data-component]');
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (!n || n.nodeType !== 1) continue;

      var comp = getItemComponent(n);
      if (!comp) continue;

      // Our pinned "Edit" must NOT be managed
      if (comp === EDIT_ITEM_COMPONENT) continue;

      // Avoid duplicates: pick first occurrence
      var exists = false;
      for (var j = 0; j < out.length; j++) {
        if (out[j].component === comp) { exists = true; break; }
      }
      if (exists) continue;

      out.push({
        component: comp,
        el: n,
        name: getItemName(n)
      });
    }

    return out;
  }

  // ============================================================
  // Pinned "Редагувати" item
  // ============================================================
  function pencilIconSvg() {
    return '' +
      '<svg class="rme-pencil" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
        '<path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm2.92 2.33H5v-.92l8.06-8.06.92.92L5.92 19.58zM20.71 7.04a1.003 1.003 0 0 0 0-1.42L18.37 3.29a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.83z"/>' +
      '</svg>';
  }

  function ensureEditorCSS() {
    if (document.getElementById('right_menu_editor_css')) return;

    var st = document.createElement('style');
    st.id = 'right_menu_editor_css';
    st.type = 'text/css';

    // Minimal safe CSS (doesn't rely on Lampa internals too hard)
    st.textContent =
      /* Pinned item icon align (best effort) */
      '.settings-folder.selector[data-component="' + EDIT_ITEM_COMPONENT + '"] .settings-folder__icon,' +
      '.settings-folder[data-component="' + EDIT_ITEM_COMPONENT + '"] .settings-folder__icon{display:flex;align-items:center;justify-content:center;}' +

      /* Overlay */
      '.rme-overlay{position:fixed;inset:0;z-index:100000;display:flex;flex-direction:column;background:rgba(0,0,0,.72);backdrop-filter:blur(8px);}' +
      '.rme-panel{margin:auto;width:min(980px,92vw);max-height:86vh;border-radius:18px;background:rgba(20,22,28,.96);box-shadow:0 16px 60px rgba(0,0,0,.55);overflow:hidden;display:flex;flex-direction:column;}' +
      '.rme-header{display:flex;align-items:center;gap:12px;padding:18px 18px;border-bottom:1px solid rgba(255,255,255,.08);}' +
      '.rme-header .rme-title{font-size:22px;line-height:1.2;color:#fff;opacity:.96;}' +
      '.rme-header .rme-sub{font-size:13px;color:rgba(255,255,255,.6);margin-top:2px;}' +
      '.rme-header .rme-spacer{flex:1;}' +
      '.rme-btn{appearance:none;border:0;border-radius:12px;padding:10px 12px;background:rgba(255,255,255,.10);color:#fff;cursor:pointer;}' +
      '.rme-btn:active{transform:scale(.98);}' +

      '.rme-list{overflow:auto;padding:10px 10px 14px 10px;}' +
      '.rme-row{display:flex;align-items:center;gap:12px;padding:12px 12px;border-radius:14px;cursor:pointer;color:#fff;}' +
      '.rme-row:hover{background:rgba(255,255,255,.06);}' +
      '.rme-row.is-hidden{opacity:.55;}' +
      '.rme-name{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:16px;}' +
      '.rme-controls{display:flex;align-items:center;gap:10px;}' +
      '.rme-iconbtn{width:44px;height:40px;border-radius:12px;border:0;background:rgba(255,255,255,.10);color:#fff;cursor:pointer;font-size:18px;line-height:1;}' +
      '.rme-iconbtn:disabled{opacity:.35;cursor:default;}' +
      '.rme-check{width:22px;height:22px;border-radius:6px;border:2px solid rgba(255,255,255,.55);display:flex;align-items:center;justify-content:center;background:transparent;}' +
      '.rme-check.is-on{background:rgba(255,255,255,.92);border-color:rgba(255,255,255,.92);color:#111;}' +
      '.rme-check svg{width:16px;height:16px;}' +
      '.rme-foot{padding:14px 18px;border-top:1px solid rgba(255,255,255,.08);display:flex;gap:10px;justify-content:flex-end;}' +

      /* Small screens */
      '@media (max-width:520px){.rme-header .rme-title{font-size:18px}.rme-row{padding:10px}.rme-iconbtn{width:40px}}';

    (document.head || document.documentElement).appendChild(st);
  }

  function buildEditMenuItem() {
    // Create menu item using typical classes
    var el = document.createElement('div');
    el.className = 'settings-folder selector';
    el.setAttribute('data-component', EDIT_ITEM_COMPONENT);
    el.tabIndex = 0;

    el.innerHTML =
      '<div class="settings-folder__icon">' + pencilIconSvg() + '</div>' +
      '<div class="settings-folder__content">' +
        '<div class="settings-folder__name">Редагувати</div>' +
      '</div>';

    // Click
    el.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      openEditor();
    });

    // Enter/OK
    el.addEventListener('keydown', function (e) {
      var key = e.keyCode || e.which;
      if (key === 13) {
        e.preventDefault();
        e.stopPropagation();
        openEditor();
      }
    });

    return el;
  }

  function ensurePinnedEditItem() {
    var root = getSettingsRoot();
    if (!root) return false;

    ensureEditorCSS();

    var existing = root.querySelector('.settings-folder.selector[data-component="' + EDIT_ITEM_COMPONENT + '"]');
    if (existing) editItemEl = existing;

    if (!editItemEl) {
      editItemEl = buildEditMenuItem();
      root.appendChild(editItemEl);
    }

    // Always last
    try { root.appendChild(editItemEl); } catch (e) {}
    return true;
  }

  // ============================================================
  // Persisted state (order + hidden)
  // ============================================================
  function loadState() {
    var orderRaw = storageGet(KEY_ORDER, '');
    var hiddenRaw = storageGet(KEY_HIDDEN, '');

    var order = safeParseJSON(orderRaw, []);
    if (!Array.isArray(order)) order = [];

    var hidden = safeParseJSON(hiddenRaw, {});
    if (!hidden || typeof hidden !== 'object') hidden = {};

    return { order: order, hidden: hidden };
  }

  function saveState(order, hidden) {
    try { storageSet(KEY_ORDER, JSON.stringify(order || [])); } catch (e) {}
    try { storageSet(KEY_HIDDEN, JSON.stringify(hidden || {})); } catch (e2) {}
  }

  // ============================================================
  // Apply ordering/hiding to real menu
  // ============================================================
  function applyStateOnce() {
    var root = getSettingsRoot();
    if (!root) return false;

    var items = scanItems(root);
    if (!items.length) {
      ensurePinnedEditItem();
      return false;
    }

    var state = loadState();
    var order = state.order || [];
    var hidden = state.hidden || {};

    // Map by component
    var map = {};
    for (var i = 0; i < items.length; i++) map[items[i].component] = items[i];

    // Build desired sequence:
    // 1) components from saved order that still exist
    // 2) append new components in current DOM order
    var seq = [];
    var used = {};

    for (var j = 0; j < order.length; j++) {
      var c = order[j];
      if (map[c] && !used[c]) { seq.push(c); used[c] = 1; }
    }
    for (var k = 0; k < items.length; k++) {
      var c2 = items[k].component;
      if (!used[c2]) { seq.push(c2); used[c2] = 1; }
    }

    // Apply: hide + reorder by appending in seq
    for (var s = 0; s < seq.length; s++) {
      var comp = seq[s];
      var it = map[comp];
      if (!it || !it.el) continue;

      var isHidden = !!hidden[comp];
      try { it.el.style.display = isHidden ? 'none' : ''; } catch (e3) {}

      // Reorder
      try { root.appendChild(it.el); } catch (e4) {}
    }

    // Keep pinned "Редагувати" always at the end
    ensurePinnedEditItem();

    // Normalize stored order (keep growing menu clean)
    // Only store managed seq (excluding pinned)
    saveState(seq, hidden);

    return true;
  }

  // ============================================================
  // Editor overlay UI
  // ============================================================
  function checkSvg() {
    return '' +
      '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
        '<path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/>' +
      '</svg>';
  }

  function openEditor() {
    ensureEditorCSS();

    var root = getSettingsRoot();
    if (!root) return;

    var items = scanItems(root);
    if (!items.length) return;

    var state = loadState();
    var order = state.order || [];
    var hidden = state.hidden || {};

    // Build current sequence using same logic as apply
    var map = {};
    for (var i = 0; i < items.length; i++) map[items[i].component] = items[i];

    var seq = [];
    var used = {};
    for (var j = 0; j < order.length; j++) {
      var c = order[j];
      if (map[c] && !used[c]) { seq.push(c); used[c] = 1; }
    }
    for (var k = 0; k < items.length; k++) {
      var c2 = items[k].component;
      if (!used[c2]) { seq.push(c2); used[c2] = 1; }
    }

    // Overlay
    var overlay = document.createElement('div');
    overlay.className = 'rme-overlay';
    overlay.tabIndex = -1;

    var panel = document.createElement('div');
    panel.className = 'rme-panel';

    var header = document.createElement('div');
    header.className = 'rme-header';
    header.innerHTML =
      '<div style="width:34px;height:34px;display:flex;align-items:center;justify-content:center;border-radius:12px;background:rgba(255,255,255,.10);color:#fff;">' +
        pencilIconSvg() +
      '</div>' +
      '<div>' +
        '<div class="rme-title">Редагувати</div>' +
        '<div class="rme-sub">Переміщення пунктів ↑/↓ та приховування ✅</div>' +
      '</div>' +
      '<div class="rme-spacer"></div>' +
      '<button class="rme-btn" type="button" data-act="close">Закрити</button>';

    var list = document.createElement('div');
    list.className = 'rme-list';

    var foot = document.createElement('div');
    foot.className = 'rme-foot';
    foot.innerHTML =
      '<button class="rme-btn" type="button" data-act="reset">Скинути</button>' +
      '<button class="rme-btn" type="button" data-act="save" style="background:rgba(255,255,255,.18)">Зберегти</button>';

    panel.appendChild(header);
    panel.appendChild(list);
    panel.appendChild(foot);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    function render() {
      list.innerHTML = '';

      for (var idx = 0; idx < seq.length; idx++) {
        var comp = seq[idx];
        var it = map[comp];
        if (!it) continue;

        var row = document.createElement('div');
        row.className = 'rme-row' + (hidden[comp] ? ' is-hidden' : '');
        row.setAttribute('data-comp', comp);
        row.tabIndex = 0;

        var name = (it.name || comp);
        row.innerHTML =
          '<div class="rme-name" title="' + escapeHtml(name) + '">' + escapeHtml(name) + '</div>' +
          '<div class="rme-controls">' +
            '<button class="rme-iconbtn" type="button" data-act="up" ' + (idx === 0 ? 'disabled' : '') + '>▲</button>' +
            '<button class="rme-iconbtn" type="button" data-act="down" ' + (idx === seq.length - 1 ? 'disabled' : '') + '>▼</button>' +
            '<div class="rme-check ' + (hidden[comp] ? '' : 'is-on') + '" data-act="toggle" title="Показувати/Приховати">' +
              (hidden[comp] ? '' : checkSvg()) +
            '</div>' +
          '</div>';

        // Click routing
        row.addEventListener('click', function (e) {
          var target = e.target;
          var act = (target && target.getAttribute) ? target.getAttribute('data-act') : null;

          // If click on inner SVG inside check
          if (!act && target && target.parentNode && target.parentNode.getAttribute) {
            act = target.parentNode.getAttribute('data-act');
            if (act === 'toggle') target = target.parentNode;
          }

          var comp2 = this.getAttribute('data-comp');
          var pos = indexOf(seq, comp2);
          if (pos < 0) return;

          if (act === 'up') move(pos, -1);
          else if (act === 'down') move(pos, +1);
          else if (act === 'toggle') toggleHidden(comp2);
        });

        // Keyboard (TV-friendly minimal)
        row.addEventListener('keydown', function (e) {
          var key = e.keyCode || e.which;
          var comp2 = this.getAttribute('data-comp');
          var pos = indexOf(seq, comp2);
          if (pos < 0) return;

          // 37 left, 39 right, 38 up, 40 down, 13 enter
          if (key === 38) { // Up
            e.preventDefault();
            move(pos, -1);
            focusRow(comp2);
          } else if (key === 40) { // Down
            e.preventDefault();
            move(pos, +1);
            focusRow(comp2);
          } else if (key === 13) { // Enter toggles hide/show
            e.preventDefault();
            toggleHidden(comp2);
            focusRow(comp2);
          } else if (key === 27 || key === 8) { // Esc/Back
            e.preventDefault();
            close();
          }
        });

        list.appendChild(row);
      }
    }

    function escapeHtml(s) {
      return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function indexOf(arr, v) {
      for (var i = 0; i < arr.length; i++) if (arr[i] === v) return i;
      return -1;
    }

    function move(pos, delta) {
      var np = pos + delta;
      if (np < 0 || np >= seq.length) return;
      var tmp = seq[pos];
      seq[pos] = seq[np];
      seq[np] = tmp;
      render();
    }

    function toggleHidden(comp) {
      if (hidden[comp]) delete hidden[comp];
      else hidden[comp] = 1;
      render();
    }

    function focusRow(comp) {
      setTimeout(function () {
        try {
          var row = list.querySelector('.rme-row[data-comp="' + cssEscape(comp) + '"]');
          if (row) row.focus();
        } catch (e) {}
      }, 0);
    }

    function cssEscape(s) {
      // minimal escape for attribute selector usage
      return String(s).replace(/"/g, '\\"');
    }

    function close() {
      try { document.body.removeChild(overlay); } catch (e) {}
      // Apply changes immediately
      saveState(seq, hidden);
      applyStateOnce();
    }

    function reset() {
      // Clear saved state: return to default order (current DOM) + show all
      seq = [];
      for (var i = 0; i < items.length; i++) seq.push(items[i].component);
      hidden = {};
      render();
    }

    // Header / foot buttons
    header.querySelector('[data-act="close"]').addEventListener('click', function () { close(); });
    foot.querySelector('[data-act="save"]').addEventListener('click', function () { close(); });
    foot.querySelector('[data-act="reset"]').addEventListener('click', function () { reset(); });

    // Click outside panel closes
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });

    // Global key close
    overlay.addEventListener('keydown', function (e) {
      var key = e.keyCode || e.which;
      if (key === 27 || key === 8) { e.preventDefault(); close(); }
    });

    render();
    // Focus first row for TV
    setTimeout(function () {
      try {
        var first = list.querySelector('.rme-row');
        if (first) first.focus();
      } catch (e) {}
    }, 30);
  }

  // ============================================================
  // Watch: apply on open + mutations
  // ============================================================
  function startSettingsWatch() {
    if (settingsMO) return;

    var root = getSettingsRoot();
    if (!root) return;

    ensurePinnedEditItem();
    applyStateOnce();

    settingsMO = new MutationObserver(function () {
      // when menu changes (new items appear) -> re-apply
      debounceApply(80);
    });

    // Observe only menu root (faster + safer)
    try { settingsMO.observe(root, { childList: true, subtree: true }); } catch (e) {}
  }

  function stopSettingsWatch() {
    if (!settingsMO) return;
    try { settingsMO.disconnect(); } catch (e) {}
    settingsMO = null;
  }

  function onHash() {
    if (isInSettings()) startSettingsWatch();
    else stopSettingsWatch();
  }

  // ============================================================
  // Boot
  // ============================================================
  if (window.__right_menu_editor_started__) return;
  window.__right_menu_editor_started__ = true;

  function boot() {
    // Hash enter/exit settings
    window.addEventListener('hashchange', onHash);

    // Periodic safety apply (covers lazy renders)
    setInterval(function () {
      if (!isInSettings()) return;
      ensurePinnedEditItem();
      applyStateOnce();
    }, 900);

    // Initial
    onHash();
  }

  function bootWhenReady() {
    if (document.body && document.head) boot();
    else document.addEventListener('DOMContentLoaded', boot, { once: true });
  }

  // Prefer Lampa ready event, but also fallback
  if (window.Lampa && window.Lampa.Listener && typeof window.Lampa.Listener.follow === 'function') {
    try {
      Lampa.Listener.follow('app', function (e) {
        if (e && e.type === 'ready') bootWhenReady();
      });
    } catch (e) {}
    setTimeout(bootWhenReady, 1200);
  } else {
    bootWhenReady();
  }
})();

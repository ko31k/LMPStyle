(function () {
  'use strict';

  if (window.__right_menu_editor_loaded__) return;
  window.__right_menu_editor_loaded__ = true;

  var KEY_ORDER  = 'right_menu_editor__order_v1';
  var KEY_HIDDEN = 'right_menu_editor__hidden_v1';

  var EDIT_COMPONENT = 'right_menu_editor__edit';
  var EDIT_ID = 'right_menu_editor__edit_item';

  var pollTimer = 0;
  var applyTimer = 0;
  var mo = null;

  // ---------------- Storage ----------------
  function sGet(key, def) {
    try { if (window.Lampa && Lampa.Storage && Lampa.Storage.get) return Lampa.Storage.get(key, def); } catch (e) {}
    try {
      var v = localStorage.getItem(key);
      return (v === null || typeof v === 'undefined') ? def : v;
    } catch (e2) {}
    return def;
  }
  function sSet(key, val) {
    try { if (window.Lampa && Lampa.Storage && Lampa.Storage.set) return Lampa.Storage.set(key, val); } catch (e) {}
    try { localStorage.setItem(key, val); } catch (e2) {}
  }
  function jParse(str, def) { try { return JSON.parse(str); } catch (e) { return def; } }

  function loadState() {
    var order = jParse(sGet(KEY_ORDER, ''), []);
    if (!Array.isArray(order)) order = [];
    var hidden = jParse(sGet(KEY_HIDDEN, ''), {});
    if (!hidden || typeof hidden !== 'object') hidden = {};
    return { order: order, hidden: hidden };
  }
  function saveState(order, hidden) {
    sSet(KEY_ORDER, JSON.stringify(order || []));
    sSet(KEY_HIDDEN, JSON.stringify(hidden || {}));
  }

  // ---------------- Helpers ----------------
  function q(sel, root) { try { return (root || document).querySelector(sel); } catch (e) { return null; } }
  function qa(sel, root) { try { return (root || document).querySelectorAll(sel); } catch (e) { return []; } }

  function getSettingsRoot() {
    // Твій реальний root зі скріна:
    var root = q('.settings .settings__body .scroll__content .scroll__body');
    if (root && root.querySelector('[data-component]')) return root;

    // запасні варіанти під інші збірки
    root = q('.settings .scroll__content .scroll__body');
    if (root && root.querySelector('[data-component]')) return root;

    root = q('.settings .scroll__body');
    if (root && root.querySelector('[data-component]')) return root;

    return null;
  }

  function compOf(el) {
    try { return el.getAttribute('data-component') || ''; } catch (e) { return ''; }
  }

  function nameOf(el) {
    if (!el) return '';
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

    var nodes = qa('.settings-folder.selector[data-component], .settings-folder[data-component], [data-component]', root);
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (!el || el.nodeType !== 1) continue;

      var c = compOf(el);
      if (!c) continue;
      if (c === EDIT_COMPONENT) continue;

      // дедуп
      var exists = false;
      for (var j = 0; j < out.length; j++) {
        if (out[j].component === c) { exists = true; break; }
      }
      if (exists) continue;

      out.push({ component: c, el: el, name: nameOf(el) });
    }
    return out;
  }

  // ---------------- UI (CSS + Icons) ----------------
  function pencilSvg() {
    return '' +
      '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
        '<path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm2.92 2.33H5v-.92l8.06-8.06.92.92L5.92 19.58zM20.71 7.04a1.003 1.003 0 0 0 0-1.42L18.37 3.29a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.83z"/>' +
      '</svg>';
  }
  function checkSvg() {
    return '' +
      '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
        '<path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/>' +
      '</svg>';
  }

  function ensureCSS() {
    if (document.getElementById('rme_css')) return;

    var st = document.createElement('style');
    st.id = 'rme_css';
    st.type = 'text/css';
    st.textContent =
      '.rme-overlay{position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.72);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;}' +
      '.rme-panel{width:min(980px,92vw);max-height:86vh;border-radius:18px;background:rgba(20,22,28,.96);box-shadow:0 16px 60px rgba(0,0,0,.55);overflow:hidden;display:flex;flex-direction:column;}' +
      '.rme-head{display:flex;gap:12px;align-items:center;padding:16px 18px;border-bottom:1px solid rgba(255,255,255,.08);}' +
      '.rme-badge{width:36px;height:36px;border-radius:12px;background:rgba(255,255,255,.10);color:#fff;display:flex;align-items:center;justify-content:center;}' +
      '.rme-title{font-size:22px;line-height:1.2;color:#fff;opacity:.96;}' +
      '.rme-sub{font-size:13px;color:rgba(255,255,255,.62);margin-top:2px;}' +
      '.rme-sp{flex:1;}' +
      '.rme-btn{border:0;border-radius:12px;padding:10px 12px;background:rgba(255,255,255,.10);color:#fff;cursor:pointer;}' +
      '.rme-btn:active{transform:scale(.98);}' +
      '.rme-list{padding:10px;overflow:auto;}' +
      '.rme-row{display:flex;align-items:center;gap:12px;padding:12px 12px;border-radius:14px;color:#fff;}' +
      '.rme-row:hover{background:rgba(255,255,255,.06);}' +
      '.rme-row.is-hidden{opacity:.55;}' +
      '.rme-name{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:16px;}' +
      '.rme-ctl{display:flex;align-items:center;gap:10px;}' +
      '.rme-ib{width:44px;height:40px;border-radius:12px;border:0;background:rgba(255,255,255,.10);color:#fff;cursor:pointer;font-size:18px;}' +
      '.rme-ib:disabled{opacity:.35;cursor:default;}' +
      '.rme-check{width:22px;height:22px;border-radius:6px;border:2px solid rgba(255,255,255,.55);display:flex;align-items:center;justify-content:center;background:transparent;}' +
      '.rme-check.is-on{background:rgba(255,255,255,.92);border-color:rgba(255,255,255,.92);color:#111;}' +
      '.rme-check svg{width:16px;height:16px;}' +
      '.rme-foot{padding:14px 18px;border-top:1px solid rgba(255,255,255,.08);display:flex;gap:10px;justify-content:flex-end;}' +
      '@media(max-width:520px){.rme-title{font-size:18px}.rme-row{padding:10px}.rme-ib{width:40px}}';
    (document.head || document.documentElement).appendChild(st);
  }

  // ---------------- Create pinned "Редагувати" ----------------
  function ensureEditItem(root) {
    if (!root) return false;

    // already exists?
    var ex = q('#' + EDIT_ID, root);
    if (ex) {
      // always keep at end
      try { root.appendChild(ex); } catch (e0) {}
      return true;
    }

    // clone a real item to keep native look
    var sample =
      q('.settings-folder.selector[data-component]', root) ||
      q('.settings-folder[data-component]', root) ||
      q('[data-component]', root);

    if (!sample) return false;

    var node = sample.cloneNode(true);
    node.id = EDIT_ID;
    node.setAttribute('data-component', EDIT_COMPONENT);
    node.setAttribute('data-static', 'true'); // важливо для деяких збірок
    try { node.classList.add('selector'); } catch (e1) {}
    try { node.style.display = ''; } catch (e2) {}

    // set label
    var nameEl =
      node.querySelector('.settings-folder__name') ||
      node.querySelector('.settings-folder__title') ||
      node.querySelector('.settings__name') ||
      node.querySelector('.name');
    if (nameEl) nameEl.textContent = 'Редагувати';

    // set pencil icon if icon container exists
    var iconWrap = node.querySelector('.settings-folder__icon') || node.querySelector('.icon');
    if (iconWrap) iconWrap.innerHTML = pencilSvg();

    // clear any value/right side
    var right = node.querySelector('.settings-folder__value') || node.querySelector('.settings-folder__right') || node.querySelector('.value') || node.querySelector('.right');
    if (right) { try { right.textContent = ''; } catch (e3) {} }

    node.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      openEditor();
    });

    node.addEventListener('keydown', function (e) {
      var k = e.keyCode || e.which;
      if (k === 13) { e.preventDefault(); e.stopPropagation(); openEditor(); }
    });

    root.appendChild(node);
    return true;
  }

  // ---------------- Apply order/hidden to menu ----------------
  function applyState() {
    var root = getSettingsRoot();
    if (!root) return;

    var items = scanItems(root);
    if (!items.length) { ensureEditItem(root); return; }

    var st = loadState();
    var order = st.order || [];
    var hidden = st.hidden || {};

    var map = {};
    for (var i = 0; i < items.length; i++) map[items[i].component] = items[i];

    // build final sequence: saved order first, then new items
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

    // reorder + hide
    for (var s = 0; s < seq.length; s++) {
      var comp = seq[s];
      var it = map[comp];
      if (!it || !it.el) continue;

      var isHidden = !!hidden[comp];
      try { it.el.style.display = isHidden ? 'none' : ''; } catch (e1) {}
      try { root.appendChild(it.el); } catch (e2) {}
    }

    // pinned edit at end
    ensureEditItem(root);

    // save normalized state
    saveState(seq, hidden);
  }

  function debounceApply(ms) {
    clearTimeout(applyTimer);
    applyTimer = setTimeout(applyState, ms || 80);
  }

  // ---------------- Editor overlay ----------------
  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function openEditor() {
    ensureCSS();

    var root = getSettingsRoot();
    if (!root) return;

    var items = scanItems(root);
    if (!items.length) return;

    var st = loadState();
    var order = st.order || [];
    var hidden = st.hidden || {};

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

    function renderRows(listEl) {
      var html = '';
      for (var x = 0; x < seq.length; x++) {
        var comp = seq[x];
        var it = map[comp];
        if (!it) continue;

        var isHidden = !!hidden[comp];
        html +=
          '<div class="rme-row' + (isHidden ? ' is-hidden' : '') + '" data-comp="' + esc(comp) + '" tabindex="0">' +
            '<div class="rme-name">' + esc(it.name || comp) + '</div>' +
            '<div class="rme-ctl">' +
              '<button class="rme-ib" data-act="up" title="Вгору">↑</button>' +
              '<button class="rme-ib" data-act="down" title="Вниз">↓</button>' +
              '<div class="rme-check' + (isHidden ? '' : ' is-on') + '" data-act="toggle" title="Показ/Приховати">' +
                (isHidden ? '' : checkSvg()) +
              '</div>' +
            '</div>' +
          '</div>';
      }
      listEl.innerHTML = html;
      fixDisabled(listEl);
    }

    function idxOf(comp) {
      for (var i = 0; i < seq.length; i++) if (seq[i] === comp) return i;
      return -1;
    }

    function fixDisabled(listEl) {
      var rows = qa('.rme-row', listEl);
      for (var i = 0; i < rows.length; i++) {
        var comp = rows[i].getAttribute('data-comp');
        var up = rows[i].querySelector('[data-act="up"]');
        var dn = rows[i].querySelector('[data-act="down"]');
        if (up) up.disabled = (i === 0);
        if (dn) dn.disabled = (i === rows.length - 1);
      }
    }

    function move(comp, dir) {
      var i = idxOf(comp);
      if (i < 0) return;
      var ni = i + dir;
      if (ni < 0 || ni >= seq.length) return;
      var tmp = seq[i];
      seq[i] = seq[ni];
      seq[ni] = tmp;
    }

    function toggle(comp) {
      hidden[comp] = !hidden[comp];
    }

    // build overlay
    var overlay = document.createElement('div');
    overlay.className = 'rme-overlay';
    overlay.tabIndex = -1;

    var panel = document.createElement('div');
    panel.className = 'rme-panel';

    var head = document.createElement('div');
    head.className = 'rme-head';
    head.innerHTML =
      '<div class="rme-badge" style="color:#fff;">' + pencilSvg() + '</div>' +
      '<div>' +
        '<div class="rme-title">Редагувати</div>' +
        '<div class="rme-sub">↑/↓ — порядок • Enter/OK — показ/приховати</div>' +
      '</div>' +
      '<div class="rme-sp"></div>' +
      '<button class="rme-btn" data-act="reset">Скинути</button>' +
      '<button class="rme-btn" data-act="close">Закрити</button>';

    var list = document.createElement('div');
    list.className = 'rme-list';

    var foot = document.createElement('div');
    foot.className = 'rme-foot';
    foot.innerHTML =
      '<button class="rme-btn" data-act="cancel">Скасувати</button>' +
      '<button class="rme-btn" data-act="save">Зберегти</button>';

    panel.appendChild(head);
    panel.appendChild(list);
    panel.appendChild(foot);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    renderRows(list);

    function closeOverlay() {
      try { overlay.parentNode.removeChild(overlay); } catch (e) {}
    }

    function commit() {
      saveState(seq, hidden);
      debounceApply(10);
    }

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeOverlay();
    });

    panel.addEventListener('click', function (e) {
      var t = e.target;

      var act = t && t.getAttribute ? t.getAttribute('data-act') : null;
      if (!act && t && t.parentElement) act = t.parentElement.getAttribute && t.parentElement.getAttribute('data-act');

      if (!act) return;

      if (act === 'close' || act === 'cancel') { closeOverlay(); return; }
      if (act === 'save') { commit(); closeOverlay(); return; }

      if (act === 'reset') {
        seq = [];
        hidden = {};
        renderRows(list);
        return;
      }

      // find row
      var row = t.closest ? t.closest('.rme-row') : null;
      if (!row) return;
      var comp = row.getAttribute('data-comp');
      if (!comp) return;

      if (act === 'up') move(comp, -1);
      else if (act === 'down') move(comp, +1);
      else if (act === 'toggle') toggle(comp);

      renderRows(list);
    });

    // keyboard: Enter toggles, arrows move
    panel.addEventListener('keydown', function (e) {
      var row = e.target && e.target.closest ? e.target.closest('.rme-row') : null;
      if (!row) return;

      var comp = row.getAttribute('data-comp');
      if (!comp) return;

      var k = e.keyCode || e.which;
      if (k === 13) { // Enter
        e.preventDefault();
        toggle(comp);
        renderRows(list);
        // restore focus to same row if possible
        var r2 = list.querySelector('.rme-row[data-comp="' + comp.replace(/"/g, '\\"') + '"]');
        if (r2) r2.focus();
      } else if (k === 38) { // Up
        e.preventDefault();
        move(comp, -1);
        renderRows(list);
      } else if (k === 40) { // Down
        e.preventDefault();
        move(comp, +1);
        renderRows(list);
      } else if (k === 27) { // Esc
        e.preventDefault();
        closeOverlay();
      }
    });

    // autofocus first row
    setTimeout(function () {
      var first = list.querySelector('.rme-row');
      if (first) first.focus();
    }, 50);
  }

  // ---------------- Watch settings menu ----------------
  function attachObserver(root) {
    if (mo) return;

    mo = new MutationObserver(function () {
      debounceApply(80);
    });

    try { mo.observe(root, { childList: true, subtree: true }); } catch (e) { mo = null; }
  }

  function tickFindSettings() {
    var root = getSettingsRoot();
    if (!root) return;

    attachObserver(root);
    applyState();
  }

  // ---------------- Boot ----------------
  function start() {
    // легкий polling, бо settings DOM з’являється/перемальовується динамічно
    clearInterval(pollTimer);
    pollTimer = setInterval(tickFindSettings, 600);

    // перша спроба одразу
    setTimeout(tickFindSettings, 200);
    setTimeout(tickFindSettings, 1200);
  }

  function startWhenReady() {
    if (document.body && document.head) start();
    else document.addEventListener('DOMContentLoaded', start, { once: true });
  }

  if (window.Lampa && window.Lampa.Listener && typeof window.Lampa.Listener.follow === 'function') {
    Lampa.Listener.follow('app', function (e) {
      if (e && e.type === 'ready') startWhenReady();
    });
    setTimeout(startWhenReady, 1200);
  } else {
    startWhenReady();
  }
})();

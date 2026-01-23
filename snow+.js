(function () {
  'use strict';

  if (window.__snowfx_loaded__) return;
  window.__snowfx_loaded__ = true;

  var KEY_ENABLED = 'snowfx_enabled';
  var KEY_DENSITY = 'snowfx_density'; // 0 auto, 1 low, 2 mid, 3 high
  var KEY_SETTLE  = 'snowfx_settle';  // 0 off, 1 on
  var KEY_SIZE    = 'snowfx_flake_size'; // 0 auto, 1 small, 2 medium, 3 large, 4 huge
  var KEY_SETTLE_SPEED = 'snowfx_settle_speed'; // 0 auto, 1 slow, 2 medium, 3 fast
  var KEY_FALL_SPEED = 'snowfx_fall_speed'; // 0 auto, 1 slow, 2 medium, 3 fast
  var KEY_SHAKE   = 'snowfx_shake';   // 0 off, 1 on (shake to clear on mobile)
  var KEY_FLAKE   = 'snowfx_flake_style'; // 0 auto, 1 dots, 2 flakes, 3 mixed
  var KEY_IN_CARD = 'snowfx_in_card'; // 0 off, 1 on (details/card screen)
  // Menu icon (filled), behaves like native icons (color inherits from menu item)
  var SNOW_ICON =
    '<svg class="snowfx-menu-icon" width="88" height="83" viewBox="0 0 88 83" xmlns="http://www.w3.org/2000/svg">' +
      '<g fill="currentColor" fill-rule="evenodd" clip-rule="evenodd">' +
        // Р’РµСЂС‚РёРєР°Р»СЊРЅР°СЏ РѕСЃСЊ (С‚РѕР»С‰Рµ)
        '<path d="M40 7H48V76H40Z"/>' +
        // Р“РѕСЂРёР·РѕРЅС‚Р°Р»СЊРЅР°СЏ РѕСЃСЊ (С‚РѕР»С‰Рµ)
        '<path d="M10 37H78V45H10Z"/>' +
        // Р”РёР°РіРѕРЅР°Р»Рё (С‚РѕР»С‰РёРЅР° СѓР¶Рµ РЅРѕСЂРј, С‡СѓС‚СЊ СЂР°СЃС€РёСЂРµРЅС‹)
        '<path d="M19.8 22.2L26.2 15.8L68.2 57.8L61.8 64.2Z"/>' +
        '<path d="M61.8 15.8L68.2 22.2L26.2 64.2L19.8 57.8Z"/>' +
        // РќР°РєРѕРЅРµС‡РЅРёРєРё (С‡С‚РѕР±С‹ РІРёР·СѓР°Р»СЊРЅРѕ "РїРѕР»РЅРµР№" РєР°Рє Сѓ РґСЂСѓРіРёС… РёРєРѕРЅРѕРє)
        '<path d="M34 10H54V18H34Z"/>' +
        '<path d="M34 65H54V73H34Z"/>' +
        '<path d="M12 31H20V51H12Z"/>' +
        '<path d="M68 31H76V51H68Z"/>' +
      '</g>' +
    '</svg>';



  // --- platform detect ---
  function isTizen() {
    try { if (window.Lampa && Lampa.Platform && Lampa.Platform.is && Lampa.Platform.is('tizen')) return true; } catch (e) {}
    return /Tizen/i.test(navigator.userAgent || '');
  }

  function isAndroid() {
    try { if (window.Lampa && Lampa.Platform && Lampa.Platform.is && Lampa.Platform.is('android')) return true; } catch (e) {}
    return /Android/i.test(navigator.userAgent || '');
  }

  function isMobileUA() {
    var ua = navigator.userAgent || '';
    return /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  }

  function isDesktop() {
    return !isMobileUA() && !isTizen();
  }

  function prefersReduceMotion() {
    try { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
    catch (e) { return false; }
  }

  function storageGet(key, def) {
    try { if (window.Lampa && Lampa.Storage && Lampa.Storage.get) return Lampa.Storage.get(key, def); }
    catch (e) {}
    return def;
  }

  function num(v, def) {
    v = Number(v);
    return isNaN(v) ? def : v;
  }

function isElVisible(el) {
  if (!el) return false;

  try {
    var r = el.getBoundingClientRect();
    if (!r || r.width < 10 || r.height < 10) return false;

    var Wv = window.innerWidth || 1;
    var Hv = window.innerHeight || 1;

    // РѕР±СЏР·Р°С‚РµР»СЊРЅРѕ РїРµСЂРµСЃРµС‡РµРЅРёРµ СЃ РІСЊСЋРїРѕСЂС‚РѕРј (РІР°Р¶РЅРѕ РґР»СЏ "СѓРµС…Р°РІС€РёС…" РїР°РЅРµР»РµР№)
    if (r.right <= 0 || r.bottom <= 0 || r.left >= Wv || r.top >= Hv) return false;

    var cs = window.getComputedStyle ? getComputedStyle(el) : null;
    if (cs) {
      if (cs.display === 'none' || cs.visibility === 'hidden') return false;
      if (Number(cs.opacity) === 0) return false;
    }

    return true;
  } catch (e) {
    return false;
  }
}

  // --- overlay detection (РЅР°СЃС‚СЂРѕР№РєРё/РјРµРЅСЋ/РјРѕРґР°Р»РєРё) ---
  // С†РµР»СЊ: РќР• РїРµСЂРµРєСЂС‹РІР°С‚СЊ РЅР°СЃС‚СЂРѕР№РєРё вЂ” РїСЂРѕСЃС‚Рѕ РіР°СЃРёРј СЃРЅРµРі РїРѕРєР° РѕС‚РєСЂС‹С‚ РѕРІРµСЂР»РµР№
 function detectOverlayOpen() {
  var Wv = window.innerWidth || 1;
  var Hv = window.innerHeight || 1;
  var viewArea = Wv * Hv;

  // РєР°РЅРґРёРґР°С‚С‹ (РЅР°СЃС‚СЂРѕР№РєРё/РјРѕРґР°Р»РєРё)
  var sels = [
    '.settings',
    '.settings__content',
    '.settings__layer',
    '.settings-window',
    '.modal',
    '.dialog',
    '.selectbox',
    '.notification'];

  function intersectsEnough(r) {
    // СЃС‡РёС‚Р°РµРј РїР»РѕС‰Р°РґСЊ РїРµСЂРµСЃРµС‡РµРЅРёСЏ СЃ РІСЊСЋРїРѕСЂС‚РѕРј
    var x1 = Math.max(0, r.left);
    var y1 = Math.max(0, r.top);
    var x2 = Math.min(Wv, r.right);
    var y2 = Math.min(Hv, r.bottom);
    var w = Math.max(0, x2 - x1);
    var h = Math.max(0, y2 - y1);
    var a = w * h;

    // РѕРІРµСЂР»РµР№ РґРѕР»Р¶РµРЅ Р·Р°РЅРёРјР°С‚СЊ Р·Р°РјРµС‚РЅСѓСЋ С‡Р°СЃС‚СЊ СЌРєСЂР°РЅР°
    return a > (viewArea * 0.08); // 8% Рё РІС‹С€Рµ
  }

  function coversPoint(el) {
    // РїСЂРѕРІРµСЂСЏРµРј, С‡С‚Рѕ СЌР»РµРјРµРЅС‚ СЂРµР°Р»СЊРЅРѕ "СЃРІРµСЂС…Сѓ" (С‡РµСЂРµР· elementFromPoint)
    try {
      var r = el.getBoundingClientRect();

      // Р±РµСЂС‘Рј С‚РѕС‡РєСѓ РІРЅСѓС‚СЂРё РІРёРґРёРјРѕР№ С‡Р°СЃС‚Рё СЌР»РµРјРµРЅС‚Р°
      var px = Math.min(Wv - 2, Math.max(2, (r.left + r.right) / 2));
      var py = Math.min(Hv - 2, Math.max(2, (r.top + r.bottom) / 2));

      var topEl = document.elementFromPoint(px, py);
      if (!topEl) return false;

      return el === topEl || (el.contains && el.contains(topEl));
    } catch (e) {
      return false;
    }
  }

  for (var i = 0; i < sels.length; i++) {
    var el = null;
    try { el = document.querySelector(sels[i]); } catch (e1) {}
    if (!el) continue;
    if (!isElVisible(el)) continue;

    var r = null;
    try { r = el.getBoundingClientRect(); } catch (e2) { r = null; }
    if (!r) continue;

    if (!intersectsEnough(r)) continue;
    if (!coversPoint(el)) continue;

    return true;
  }

  return false;
}

  // --- РіРґРµ РїРѕРєР°Р·С‹РІР°С‚СЊ СЃРЅРµРі (РіР»Р°РІРЅР°СЏ + С„РёР»СЊРјС‹/СЃРµСЂРёР°Р»С‹ + РєР°С‚РµРіРѕСЂРёРё) ---
  var ALLOWED_COMPONENTS = {
    main: 1, home: 1, start: 1,
    cub: 1,
    movies: 1, movie: 1,
    tv: 1, series: 1, serial: 1, serials: 1,
    tvshow: 1, tvshows: 1,
    category: 1, categories: 1,
    catalog: 1,
    genre: 1, genres: 1
  };

  // --- activity name for details/card screen ---
  // Р’ СЂР°Р·РЅС‹С… СЃР±РѕСЂРєР°С… Lampa РєР°СЂС‚РѕС‡РєР° С„РёР»СЊРјР°/СЃРµСЂРёР°Р»Р° РјРѕР¶РµС‚ РёРјРµС‚СЊ component: "full" (С‡Р°С‰Рµ РІСЃРµРіРѕ),
  // Р»РёР±Рѕ РґСЂСѓРіРёРµ РІР°СЂРёР°РЅС‚С‹. Р”РµСЂР¶РёРј РѕС‚РґРµР»СЊРЅС‹Р№ СЃРїРёСЃРѕРє, С‡С‚РѕР±С‹ РєРѕСЂСЂРµРєС‚РЅРѕ РІРєР»СЋС‡Р°С‚СЊ СЃРЅРµРі РїРѕ РѕРїС†РёРё.
  var DETAILS_COMPONENTS = {
    full: 1,
    details: 1,
    detail: 1,
    card: 1,
    info: 1
  };

  function isDetailsActivity(e) {
    var c = (e && (e.component || (e.object && e.object.component))) || '';
    return !!DETAILS_COMPONENTS[c];
  }


  function isAllowedActivity(e) {
    var c = (e && (e.component || (e.object && e.object.component))) || '';
    return !!ALLOWED_COMPONENTS[c];
  }

  // --- details/card screen detect (СЃС‚СЂР°РЅРёС†Р° РєР°СЂС‚РѕС‡РєРё С„РёР»СЊРјР°/СЃРµСЂРёР°Р»Р°) ---
  function isDetailsScreen() {
    try {
      // РљР°СЂС‚РѕС‡РєР° С„РёР»СЊРјР°/СЃРµСЂРёР°Р»Р° (РґРµС‚Р°Р»Рё). РљР»Р°СЃСЃС‹ РјРѕРіСѓС‚ РЅРµРјРЅРѕРіРѕ РѕС‚Р»РёС‡Р°С‚СЊСЃСЏ РјРµР¶РґСѓ РІРµСЂСЃРёСЏРјРё/С‚РµРјР°РјРё,
      // РїРѕСЌС‚РѕРјСѓ РїСЂРѕРІРµСЂСЏРµРј РЅРµСЃРєРѕР»СЊРєРѕ СѓСЃС‚РѕР№С‡РёРІС‹С… СЌР»РµРјРµРЅС‚РѕРІ "С€Р°РїРєРё" Рё Р±Р»РѕРєР° РґРµР№СЃС‚РІРёР№.
      return !!document.querySelector(
        '.full, .full-start, .full-start__poster, .full-start__title,' +
        ' .full-start__head, .full-start__body, .full-start__buttons, .full-start__actions,' +
        ' .full__body, .full__head, .full__left, .full__right,' +
        ' .full__poster, .full__title, .full__buttons, .full__actions,' +
        ' .full__descr, .full__tagline, .full__info, .full__meta'
      );
    } catch (e) {
      return false;
    }
  }

  // --- state from Lampa ---
  var on_allowed_screen = true; // РµСЃР»Рё РЅРµС‚ СЃРѕР±С‹С‚РёР№ вЂ” СЃС‡РёС‚Р°РµРј "СЂР°Р·СЂРµС€С‘РЅРЅС‹Р№ СЌРєСЂР°РЅ"
  var in_player = false;
  var overlay_open = false;
  var in_details_activity = false;

  // Р РµР°Р»СЊРЅРѕРµ РѕРїСЂРµРґРµР»РµРЅРёРµ РїР»РµРµСЂР° (С„РѕР»Р»Р±РµРє, РєРѕРіРґР° СЃРѕР±С‹С‚РёСЏ start/destroy РЅРµ РїСЂРёС…РѕРґСЏС‚)
  function detectActuallyInPlayer() {
    // HTML5 video (РІРЅСѓС‚СЂРµРЅРЅРёР№ РїР»РµРµСЂ)
    try {
      var vids = document.getElementsByTagName('video');
      for (var i = 0; i < vids.length; i++) {
        var v = vids[i];
        if (!v) continue;
        if (typeof v.paused === 'boolean') {
          if (!v.paused && !v.ended) return true;
        }
      }
    } catch (e1) {}

    // РєРѕРЅС‚РµР№РЅРµСЂС‹ РїР»РµРµСЂР° (РЅР° СЂР°Р·РЅС‹С… РїР»Р°С‚С„РѕСЂРјР°С…/СЃР±РѕСЂРєР°С…)
    try {
      var el = document.querySelector('.player, .player__content, .player__video, .player__layer, .player-layer, .video-player');
      if (el && isElVisible(el)) return true;
    } catch (e2) {}

    return false;
  }

  // --- config ---
  function getTargetByDensity(density, platform) {
    if (platform === 'tizen') return 45; // С„РёРєСЃРёСЂСѓРµРј РєР°Рє РїСЂРѕСЃРёР»Рё

    if (platform === 'android') {
      if (density === 1) return 120;
      if (density === 2) return 180;
      if (density === 3) return 240;
      return 200;
    }

    if (platform === 'desktop') {
      if (density === 1) return 170;
      if (density === 2) return 240;
      if (density === 3) return 310;
      return 270;
    }

    if (density === 1) return 90;
    if (density === 2) return 130;
    if (density === 3) return 190;
    return 120;
  }

  // Р Р°Р·РјРµСЂ СЃРЅРµР¶РёРЅРѕРє (РЅРµР·Р°РІРёСЃРёРјРѕ РѕС‚ РІРёРґР°)
  // РќР° Tizen "РђРІС‚Рѕ" С‡СѓС‚СЊ РјРµРЅСЊС€Рµ РґР»СЏ СЃРЅРёР¶РµРЅРёСЏ РЅР°РіСЂСѓР·РєРё.
  function getSizeMult(size, platform) {
    // 0 auto, 1 small, 2 medium, 3 large, 4 huge
    if (platform === 'tizen') {
      // РќР° РўР’ Р»СѓС‡С€Рµ РЅРµ СЂР°Р·РґСѓРІР°С‚СЊ СЃРїСЂР°Р№С‚С‹
      if (size === 0) return 0.85;
      if (size === 1) return 0.75;
      if (size === 2) return 0.90;
      // large/huge РїСЂРёРЅСѓРґРёС‚РµР»СЊРЅРѕ РѕРіСЂР°РЅРёС‡РёРІР°РµРј
      return 0.95;
    }

    if (size === 1) return 0.75;
    if (size === 2) return 1.00;
    if (size === 3) return 1.30;
    if (size === 4) return 1.60;
    return 1.00;
  }

  // РЎРєРѕСЂРѕСЃС‚СЊ РѕСЃРµРґР°РЅРёСЏ (РёРЅС‚РµРЅСЃРёРІРЅРѕСЃС‚СЊ РЅР°РєРѕРїР»РµРЅРёСЏ)
  // 0 auto, 1 slow, 2 medium, 3 fast
  function getSettleIntensity(speed, platform) {
    // РќР° Tizen РѕСЃРµРґР°РЅРёРµ РІСЃС‘ СЂР°РІРЅРѕ РІС‹РєР»СЋС‡РµРЅРѕ, РЅРѕ РїСѓСЃС‚СЊ Р±СѓРґРµС‚ Р±РµР·РѕРїР°СЃРЅРѕРµ Р·РЅР°С‡РµРЅРёРµ
    if (platform === 'tizen') return 0.0;
    if (speed === 1) return 0.60;
    if (speed === 2) return 1.00;
    if (speed === 3) return 1.55;
    // auto
    return 1.00;
  }


  // РЎРєРѕСЂРѕСЃС‚СЊ РїР°РґРµРЅРёСЏ СЃРЅРµР¶РёРЅРѕРє (СѓРјРЅРѕР¶РёС‚РµР»СЊ СЃРєРѕСЂРѕСЃС‚Рё vy)
  // 0 auto, 1 slow, 2 medium, 3 fast
  function getFallSpeedMult(speed, platform) {
    // РЎРєРѕСЂРѕСЃС‚СЊ РїРѕС‡С‚Рё РЅРµ РІР»РёСЏРµС‚ РЅР° РЅР°РіСЂСѓР·РєСѓ, РЅРѕ РЅР° РўР’ РёР·Р±РµРіР°РµРј СЃР»РёС€РєРѕРј "Р±С‹СЃС‚СЂРѕРіРѕ" СЌС„С„РµРєС‚Р°
    if (platform === 'tizen') {
      if (speed === 1) return 0.75;
      if (speed === 2) return 0.95;
      if (speed === 3) return 1.10;
      return 0.95; // auto
    }

    if (speed === 1) return 0.75;
    if (speed === 2) return 1.00;
    if (speed === 3) return 1.35;
    return 1.00; // auto
  }

  function computeConfig() {
    var tizen = isTizen();
    var android = isAndroid();
    var desktop = isDesktop();

    var density = num(storageGet(KEY_DENSITY, 0), 0) | 0;
    if (density < 0) density = 0;
    if (density > 3) density = 3;

    // РћСЃРµРґР°РЅРёРµ: РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ Р’РєР» РЅР° Android/РџРљ, Р’С‹РєР» РЅР° Tizen
    var settleDefault = tizen ? 0 : 1;
    var settle = num(storageGet(KEY_SETTLE, settleDefault), settleDefault) ? 1 : 0;

    // РўРёРї СЃРЅРµР¶РёРЅРѕРє: 0 Р°РІС‚Рѕ, 1 С‚РѕС‡РєРё, 2 СЃРЅРµР¶РёРЅРєРё, 3 СЃРјРµС€Р°РЅРЅС‹Рµ
    var flakeDefault = 0;
    var flake_style = num(storageGet(KEY_FLAKE, flakeDefault), flakeDefault) | 0;
    if (flake_style < 0) flake_style = 0;
    if (flake_style > 3) flake_style = 3;
    if (tizen && flake_style === 0) flake_style = 1;
    var platform = tizen ? 'tizen' : (android ? 'android' : (desktop ? 'desktop' : 'other'));
    var flakesCount = getTargetByDensity(density, platform);

    var fps = tizen ? 22 : (android ? 50 : 60);

    // РќР° Tizen РїСЂРё РІС‹Р±РѕСЂРµ "РЎРЅРµР¶РёРЅРєРё/РЎРјРµС€Р°РЅРЅС‹Рµ" СѓРјРµРЅСЊС€Р°РµРј РЅР°РіСЂСѓР·РєСѓ
    if (tizen && (flake_style === 2 || flake_style === 3)) {
      fps = 18;
      flakesCount = Math.min(flakesCount, 28);
    }

    // РЎРЅРµРі РІ РєР°СЂС‚РѕС‡РєРµ (РґРµС‚Р°Р»Рё)
    var inCardDefault = 0;
    var in_card = num(storageGet(KEY_IN_CARD, inCardDefault), inCardDefault) ? 1 : 0;

    // Р Р°Р·РјРµСЂ СЃРЅРµР¶РёРЅРѕРє
    var sizeDefault = 0;
    var flake_size = num(storageGet(KEY_SIZE, sizeDefault), sizeDefault) | 0;
    if (flake_size < 0) flake_size = 0;
    if (flake_size > 4) flake_size = 4;

    // РЎРєРѕСЂРѕСЃС‚СЊ РѕСЃРµРґР°РЅРёСЏ
    var settleSpeedDefault = 0;
    var settle_speed = num(storageGet(KEY_SETTLE_SPEED, settleSpeedDefault), settleSpeedDefault) | 0;
    if (settle_speed < 0) settle_speed = 0;
    if (settle_speed > 3) settle_speed = 3;
    // РЎРєРѕСЂРѕСЃС‚СЊ РїР°РґРµРЅРёСЏ СЃРЅРµР¶РёРЅРѕРє
    var fallSpeedDefault = 0;
    var fall_speed = num(storageGet(KEY_FALL_SPEED, fallSpeedDefault), fallSpeedDefault) | 0;
    if (fall_speed < 0) fall_speed = 0;
    if (fall_speed > 3) fall_speed = 3;


    // РќР° Tizen РїСЂРёРЅСѓРґРёС‚РµР»СЊРЅРѕ РѕРіСЂР°РЅРёС‡РёРІР°РµРј С‚СЏР¶С‘Р»С‹Рµ РІР°СЂРёР°РЅС‚С‹ СЂР°Р·РјРµСЂР°
    if (tizen && flake_size >= 3) flake_size = 2;

    return {
      tizen: tizen,
      flakes: flakesCount,
      fps: fps,
      settle: settle,
      flake_style: flake_style,
      in_card: in_card,
      flake_size: flake_size,
      settle_speed: settle_speed,
      fall_speed: fall_speed,
      size_mult: getSizeMult(flake_size, platform),
      fall_mult: getFallSpeedMult(fall_speed, platform),
      settle_intensity: getSettleIntensity(settle_speed, platform)
    };
  }

  function shouldRunNow() {
    var enabled = num(storageGet(KEY_ENABLED, 1), 1) ? 1 : 0;
    if (!enabled) return false;
    if (in_player) return false;
    if (overlay_open) return false;      // РєР»СЋС‡РµРІРѕР№ С„РёРєСЃ: РЅРµ РїРµСЂРµРєСЂС‹РІР°С‚СЊ РЅР°СЃС‚СЂРѕР№РєРё

    // РєР°СЂС‚РѕС‡РєР° С„РёР»СЊРјР°/СЃРµСЂРёР°Р»Р° (РґРµС‚Р°Р»Рё)
    // Р’ РЅРµРєРѕС‚РѕСЂС‹С… СЃР±РѕСЂРєР°С… РєР°СЂС‚РѕС‡РєР° РїСЂРёС…РѕРґРёС‚ РєР°Рє "РЅРµСЂР°Р·СЂРµС€С‘РЅРЅР°СЏ activity",
    // РїРѕСЌС‚РѕРјСѓ РґР»СЏ РЅРµС‘ РґРµР»Р°РµРј РѕС‚РґРµР»СЊРЅРѕРµ РїСЂР°РІРёР»Рѕ:
    // - РµСЃР»Рё РІ РЅР°СЃС‚СЂРѕР№РєР°С… РІРєР»СЋС‡РµРЅРѕ "РЎРЅРµРі РІ РєР°СЂС‚РѕС‡РєРµ" в†’ РїРѕРєР°Р·С‹РІР°РµРј
    // - РµСЃР»Рё РІС‹РєР»СЋС‡РµРЅРѕ в†’ РЅРµ РїРѕРєР°Р·С‹РІР°РµРј
    var details = in_details_activity || isDetailsScreen();
    if (details) return !!cfg_in_card;

    if (!on_allowed_screen) return false;
    return true;
  }

  // --- canvases ---
  var fallCanvas = null, fallCtx = null;
  var accCanvas  = null, accCtx  = null;

  var W = 0, H = 0, dpr = 1;
  var spriteDot = null;
  var spritesFall = null;

  var flakes = [];
  var running = false;
  var rafId = 0;
  var lastTs = 0;

  // applied cfg
  var cfg_tizen = false;
  var cfg_fps = 30;
  var cfg_flakes = 80;
  var cfg_settle = 0;
  var cfg_settle_user = 0; // user setting (before runtime overrides)
  var cfg_flake_style = 0;
  var cfg_in_card = 0;
  var cfg_size_mult = 1.0;
  var cfg_fall_mult = 1.0;
  var cfg_settle_intensity = 1.0;

  // settle surfaces
  var surfaces = [];
  var surfTimer = 0;
  var capObserver = null;
  var resetTimer = 0;
  var fadeRaf = 0;

function stopFade() {
  if (fadeRaf) cancelAnimationFrame(fadeRaf);
  fadeRaf = 0;
}

// РѕС‡РёСЃС‚РєР° РЅР°РєРѕРїР»РµРЅРЅРѕРіРѕ СЃРЅРµРіР°/С‚Р°Р№РјРµСЂРѕРІ (РёСЃРїРѕР»СЊР·СѓРµРј РїСЂРё РІС‹РєР»СЋС‡РµРЅРёРё РѕСЃРµРґР°РЅРёСЏ, РЅР°РїСЂРёРјРµСЂ РІ РєР°СЂС‚РѕС‡РєРµ)
function clearAccumulationRuntime(reason) {
  stopFade();
  try { if (surfTimer) { clearTimeout(surfTimer); surfTimer = 0; } } catch (e1) {}
  try { if (resetTimer) { clearTimeout(resetTimer); resetTimer = 0; } } catch (e2) {}
  surfaces = [];
  try { if (accCtx) accCtx.clearRect(0, 0, W, H); } catch (e3) {}
  try { stopCaps(); } catch (e4) {}
}

// РјРіРЅРѕРІРµРЅРЅС‹Р№ СЃР±СЂРѕСЃ (РґР»СЏ resize/СЃРјРµРЅС‹ СЌРєСЂР°РЅРѕРІ/РЅР°СЃС‚СЂРѕРµРє)
function resetAccumulationHard(reason) {
  if (cfg_tizen || !cfg_settle) return;
  if (!accCtx) return;

  stopFade();

    // РµСЃР»Рё СЌС„С„РµРєС‚ РІС‹РєР»СЋС‡РµРЅ вЂ” РЅРµ СЃР»СѓС€Р°РµРј РґР°С‚С‡РёРєРё
    if (!running || !shake_enabled) stopMotion();

  try { accCtx.clearRect(0, 0, W, H); } catch (e) {}
  surfaces = [];

  if (resetTimer) clearTimeout(resetTimer);
  resetTimer = setTimeout(function () {
    resetTimer = 0;
    buildSurfaces();
  }, 180);
}

// РїР»Р°РІРЅС‹Р№ СЃР±СЂРѕСЃ (РґР»СЏ РїСЂРѕРєСЂСѓС‚РєРё)
function resetAccumulationSoft(reason) {
  if (cfg_tizen || !cfg_settle) return;
  if (!accCtx) return;

  if (fadeRaf) return; // СѓР¶Рµ Р·Р°С‚СѓС…Р°РµРј

  var start = (window.performance && performance.now) ? performance.now() : Date.now();
  var duration = 320;

  function step() {
    if (!accCtx) { stopFade(); return; }

    // РІС‹РјС‹РІР°РµРј Р°Р»СЊС„Сѓ Сѓ СѓР¶Рµ РЅР°СЂРёСЃРѕРІР°РЅРЅРѕРіРѕ
    accCtx.save();
    accCtx.globalCompositeOperation = 'destination-out';
    accCtx.fillStyle = 'rgba(0,0,0,0.22)'; // СЃРєРѕСЂРѕСЃС‚СЊ РёСЃС‡РµР·РЅРѕРІРµРЅРёСЏ
    accCtx.fillRect(0, 0, W, H);
    accCtx.restore();

    var now = (window.performance && performance.now) ? performance.now() : Date.now();
    if (now - start < duration) {
      fadeRaf = requestAnimationFrame(step);
    } else {
      stopFade();
      try { accCtx.clearRect(0, 0, W, H); } catch (e) {}
      surfaces = [];

      if (resetTimer) clearTimeout(resetTimer);
      resetTimer = setTimeout(function () {
        resetTimer = 0;
        buildSurfaces();
      }, 160);
    }
  }

  fadeRaf = requestAnimationFrame(step);
}
  function rand(min, max) { return min + Math.random() * (max - min); }

  function makeSprite() {
    if (spritesFall && spriteDot) return;

    // --- dot sprite (for very small flakes + accumulation) ---
    var cd = document.createElement('canvas');
    cd.width = 16;
    cd.height = 16;
    var dctx = cd.getContext('2d');
    dctx.clearRect(0, 0, 16, 16);
    dctx.fillStyle = 'rgba(255,255,255,1)';
    dctx.beginPath();
    dctx.arc(8, 8, 6.2, 0, Math.PI * 2, false);
    dctx.fill();
    spriteDot = cd;

    function makeSnowflakeSprite(variant) {
      var c = document.createElement('canvas');
      c.width = 64;
      c.height = 64;
      var ctx = c.getContext('2d');
      ctx.clearRect(0, 0, 64, 64);

      // РЅРµР±РѕР»СЊС€Р°СЏ РјСЏРіРєРѕСЃС‚СЊ, РєР°Рє Сѓ "РЅР°СЃС‚РѕСЏС‰РёС…" СЃРЅРµР¶РёРЅРѕРє
      ctx.shadowColor = 'rgba(255,255,255,0.85)';
      ctx.shadowBlur = variant === 3 ? 1.2 : 0.8;

      ctx.strokeStyle = 'rgba(255,255,255,1)';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // С‡РµРј РІС‹С€Рµ variant вЂ” С‚РµРј "РїР»РѕС‚РЅРµРµ" СЃРЅРµР¶РёРЅРєР°
      ctx.lineWidth = variant === 1 ? 3.0 : (variant === 2 ? 3.8 : 4.6);

      var cx = 32, cy = 32;
      var R = 22;

      function line(x1,y1,x2,y2){
        ctx.beginPath();
        ctx.moveTo(x1,y1);
        ctx.lineTo(x2,y2);
        ctx.stroke();
      }

      for (var i = 0; i < 6; i++) {
        var a = i * Math.PI / 3;
        var ca = Math.cos(a), sa = Math.sin(a);

        // РѕСЃРЅРѕРІРЅР°СЏ "СЃРїРёС†Р°"
        line(cx, cy, cx + ca * R, cy + sa * R);

        // РІРµС‚РѕС‡РєРё Р±Р»РёР¶Рµ Рє С†РµРЅС‚СЂСѓ
        var b1 = R * 0.55;
        var br1 = R * 0.22;
        var bx1 = cx + ca * b1;
        var by1 = cy + sa * b1;

        var a1 = a + Math.PI / 6;
        var a2 = a - Math.PI / 6;

        line(bx1, by1, bx1 + Math.cos(a1) * br1, by1 + Math.sin(a1) * br1);
        line(bx1, by1, bx1 + Math.cos(a2) * br1, by1 + Math.sin(a2) * br1);

        // РґРѕРїРѕР»РЅРёС‚РµР»СЊРЅС‹Рµ РІРµС‚РѕС‡РєРё (РґР»СЏ Р±РѕР»РµРµ "Р±РѕРіР°С‚С‹С…" РІР°СЂРёР°РЅС‚РѕРІ)
        if (variant >= 2) {
          var b2 = R * 0.78;
          var br2 = R * 0.18;
          var bx2 = cx + ca * b2;
          var by2 = cy + sa * b2;

          line(bx2, by2, bx2 + Math.cos(a1) * br2, by2 + Math.sin(a1) * br2);
          line(bx2, by2, bx2 + Math.cos(a2) * br2, by2 + Math.sin(a2) * br2);
        }

        // РјР°Р»РµРЅСЊРєРёР№ "Р·СѓР±С‡РёРє" РЅР° РєРѕРЅС†Рµ
        if (variant === 3) {
          var tipx = cx + ca * R;
          var tipy = cy + sa * R;
          var px = -sa, py = ca;
          line(tipx - px * 2.2, tipy - py * 2.2, tipx + px * 2.2, tipy + py * 2.2);
        }
      }

      // С†РµРЅС‚СЂ
      ctx.fillStyle = 'rgba(255,255,255,1)';
      ctx.beginPath();
      ctx.arc(cx, cy, variant === 1 ? 2.2 : 2.6, 0, Math.PI * 2, false);
      ctx.fill();

      ctx.shadowBlur = 0;

      return c;
    }

    spritesFall = [];
    // 0: С‚РѕС‡РєРё, 1..3: СЃРЅРµР¶РёРЅРєРё
    spritesFall[0] = spriteDot;
    spritesFall[1] = makeSnowflakeSprite(1);
    spritesFall[2] = makeSnowflakeSprite(2);
    spritesFall[3] = makeSnowflakeSprite(3);
  }


  function ensureCanvases() {
    if (!document.body) return;

    if (!fallCanvas) {
      makeSprite();

      fallCanvas = document.createElement('canvas');
      fallCanvas.id = 'snowfx_fall';
      fallCanvas.style.cssText =
        'position:fixed;left:0;top:0;width:100%;height:100%;' +
        'pointer-events:none;z-index:999999;';

      document.body.appendChild(fallCanvas);
      fallCtx = fallCanvas.getContext('2d', { alpha: true });
    }

    if (!accCanvas) {
      accCanvas = document.createElement('canvas');
      accCanvas.id = 'snowfx_acc';
      accCanvas.style.cssText =
        'position:fixed;left:0;top:0;width:100%;height:100%;' +
        'pointer-events:none;z-index:999998;';

      document.body.appendChild(accCanvas);
      accCtx = accCanvas.getContext('2d', { alpha: true });
    }

    resize();
  }

  function removeCanvases() {
    stopFade();
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;

    try { window.removeEventListener('resize', resize, false); } catch (e) {}

    if (fallCanvas && fallCanvas.parentNode) fallCanvas.parentNode.removeChild(fallCanvas);
    if (accCanvas && accCanvas.parentNode)  accCanvas.parentNode.removeChild(accCanvas);

    fallCanvas = null; fallCtx = null;
    accCanvas = null;  accCtx = null;

    flakes = [];
    surfaces = [];
    running = false;
    lastTs = 0;

    stopCaps();

    // СЌРєРѕРЅРѕРјРёРј Р±Р°С‚Р°СЂРµСЋ РЅР° РјРѕР±РёР»РєР°С…
    stopMotion();
  }

  function resize() {
    if (!fallCanvas || !fallCtx || !accCanvas || !accCtx) return;

    dpr = cfg_tizen ? 1 : Math.min(window.devicePixelRatio || 1, 2);

    W = Math.max(1, window.innerWidth || 1);
    H = Math.max(1, window.innerHeight || 1);

    fallCanvas.width = (W * dpr) | 0;
    fallCanvas.height = (H * dpr) | 0;
    accCanvas.width = (W * dpr) | 0;
    accCanvas.height = (H * dpr) | 0;

    fallCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    accCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // РїСЂРё СЂРµСЃР°Р№Р·Рµ Р»СѓС‡С€Рµ СЃР±СЂР°СЃС‹РІР°С‚СЊ РѕСЃРµРґР°РЅРёРµ, С‡С‚РѕР±С‹ РЅРµ "СЃСЉРµР·Р¶Р°Р»Рѕ"
    resetAccumulationHard('resize');
  }

  // --- flakes ---
  function spawnFlake() {
    // style: 0 Р°РІС‚Рѕ, 1 С‚РѕС‡РєРё, 2 СЃРЅРµР¶РёРЅРєРё, 3 СЃРјРµС€Р°РЅРЅС‹Рµ (РїРѕСЂРѕРІРЅСѓ)
    var style = cfg_flake_style | 0;
    if (cfg_tizen && style === 0) style = 1;

    var fancy = false;
    var k = 0;

    if (style === 1) {
      fancy = false;
      k = 0;
    }
    else if (style === 2) {
      fancy = true;
      k = 1 + ((Math.random() * 3) | 0);
    }
    else if (style === 3) {
      fancy = Math.random() < 0.5;
      k = fancy ? (1 + ((Math.random() * 3) | 0)) : 0;
    }
    else {
      // 0 = С‚РѕС‡РєР°, 1..3 = "РЅР°СЃС‚РѕСЏС‰Р°СЏ" СЃРЅРµР¶РёРЅРєР°
      fancy = (Math.random() < (isMobileUA() ? 0.72 : 0.62));
      k = fancy ? (1 + ((Math.random() * 3) | 0)) : 0;
    }

    // СЂР°Р·РјРµСЂ: С‚РѕС‡РєРё РјРµР»РєРёРµ, СЃРЅРµР¶РёРЅРєРё РєСЂСѓРїРЅРµРµ (С‡СѓС‚СЊ СѓРІРµР»РёС‡РёР»Рё)
    // + РїРѕР»СЊР·РѕРІР°С‚РµР»СЊСЃРєРёР№ РјРЅРѕР¶РёС‚РµР»СЊ СЂР°Р·РјРµСЂР° (РЅРµР·Р°РІРёСЃРёРјРѕ РѕС‚ РІРёРґР°)
    var r = fancy ? rand(2.7, 6.6) : rand(1.0, 2.7);
    r = r * (cfg_size_mult || 1);
    // Р·Р°С‰РёС‚Р° РѕС‚ СЃР»РёС€РєРѕРј Р±РѕР»СЊС€РёС… Р·РЅР°С‡РµРЅРёР№
    if (r < 0.6) r = 0.6;
    if (!cfg_tizen && r > 12) r = 12;
    if (cfg_tizen && r > 5.2) r = 5.2;

    // Р±РѕР»СЊС€РёРµ СЃРЅРµР¶РёРЅРєРё РїР°РґР°СЋС‚ С‡СѓС‚СЊ РјРµРґР»РµРЅРЅРµРµ
    var vy1 = cfg_tizen ? 0.45 : (fancy ? 0.22 : 0.55);
    var vy2 = cfg_tizen ? 1.25 : (fancy ? 1.05 : 1.55);

    return {
      k: k,
      x: rand(0, W),
      y: rand(-H, 0),
      r: r,
      vy: rand(vy1, vy2) * (cfg_fall_mult || 1),
      vx: rand(cfg_tizen ? -0.20 : -0.30, cfg_tizen ? 0.20 : 0.30),
      a: rand(0.35, 0.95)
    };
  }


  function applyFlakeCount(target) {
    target = Math.max(0, target | 0);

    if (flakes.length > target) {
      flakes.length = target;
      return;
    }
    while (flakes.length < target) flakes.push(spawnFlake());
  }

  // --- poster/card detection (С‡С‚РѕР±С‹ РЅРµ С†РµРїР»СЏС‚СЊ РЅР°СЃС‚СЂРѕР№РєРё Рё РјРµР»РєРёРµ СЌР»РµРјРµРЅС‚С‹) ---
  function looksLikePoster(el) {
    if (!el) return false;

    try {
      var r = el.getBoundingClientRect();
      if (!r || r.width < 90 || r.height < 90) return false;

      // РµСЃР»Рё РІРЅСѓС‚СЂРё РµСЃС‚СЊ РєСЂСѓРїРЅР°СЏ РєР°СЂС‚РёРЅРєР° вЂ” РїРѕС‡С‚Рё РЅР°РІРµСЂРЅСЏРєР° РєР°СЂС‚РѕС‡РєР°
      if (el.querySelector) {
        var img = el.querySelector('img');
        if (img) {
          var ir = img.getBoundingClientRect();
          if (ir && ir.width > 70 && ir.height > 70) return true;
        }
      }

      // РёР»Рё С„РѕРЅ-РєР°СЂС‚РёРЅРєР° (С‡Р°СЃС‚Рѕ РІ Р›Р°РјРїРµ РїРѕСЃС‚РµСЂ вЂ” background-image)
      var cs = window.getComputedStyle ? getComputedStyle(el) : null;
      if (cs && cs.backgroundImage && cs.backgroundImage !== 'none') return true;
    } catch (e) {}

    return false;
  }

  function getCardElements() {
    var list = [];
    // Р±РѕР»РµРµ С‚РѕС‡РЅС‹Рµ СЃРµР»РµРєС‚РѕСЂС‹, РЅРѕ РѕСЃС‚Р°РІР»СЏРµРј РЅРµСЃРєРѕР»СЊРєРѕ РґР»СЏ СЃРѕРІРјРµСЃС‚РёРјРѕСЃС‚Рё
    var sels = [
      '.card__view',
      '.items__item .card__view',
      '.full-start__poster',
      '.card',
      '[data-card]',
      '[data-type="card"]'
    ];

    for (var i = 0; i < sels.length; i++) {
      try {
        var nodes = document.querySelectorAll(sels[i]);
        if (nodes && nodes.length) list = list.concat([].slice.call(nodes));
      } catch (e) {}
    }

    // СѓРЅРёРєР°Р»РёР·Р°С†РёСЏ + С„РёР»СЊС‚СЂ РЅР° "РїРѕС…РѕР¶ РЅР° РїРѕСЃС‚РµСЂ"
    var uniq = [];
    var seen = [];
    for (var k = 0; k < list.length; k++) {
      var el = list[k];
      if (!el || !el.getBoundingClientRect) continue;
      if (seen.indexOf(el) !== -1) continue;
      seen.push(el);

      if (!looksLikePoster(el)) continue;
      uniq.push(el);
    }

    return uniq;
  }

  // --- settle surfaces ---
  function drawAccDot(x, y, r, a) {
    if (!accCtx) return;
    accCtx.globalAlpha = a;
    var s = (r * 2.0) | 0;
    accCtx.drawImage(spriteDot, x, y, s, s);
    accCtx.globalAlpha = 1;
  }

  function buildSurfaces() {
    surfaces = [];
    if (cfg_tizen || !cfg_settle) return;

    var els = getCardElements();
    var max = isAndroid() ? 40 : 55; // РѕРіСЂР°РЅРёС‡РёРІР°РµРј, С‡С‚РѕР±С‹ РЅРµ Р¶СЂР°С‚СЊ CPU
    var added = 0;

    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var r = null;

      // С‚РѕР»СЊРєРѕ СЂРµР°Р»СЊРЅРѕ РІРёРґРёРјС‹Рµ РєР°СЂС‚РѕС‡РєРё (РІР°Р¶РЅРѕ РґР»СЏ РіРѕСЂРёР·РѕРЅС‚Р°Р»СЊРЅС‹С… РєР°СЂСѓСЃРµР»РµР№ Рё СЃРєСЂС‹С‚С‹С… СЃРїРёСЃРєРѕРІ)
      if (!isElVisible(el)) continue;

      try { r = el.getBoundingClientRect(); } catch (e) { r = null; }
      if (!r) continue;

      if (r.bottom < 0 || r.top > H) continue;

      // Р·Р°С‰РёС‚Р° РѕС‚ "С€РёСЂРѕРєРёС…" РєРѕРЅС‚РµР№РЅРµСЂРѕРІ (РёРЅР°С‡Рµ РјРѕРіСѓС‚ РїРѕСЏРІР»СЏС‚СЊСЃСЏ Р»РёРЅРёРё РЅР° СЃС‚Р°СЂС‚Рµ)
      if (r.width > W * 0.82) continue;
      if (r.height > H * 0.95) continue;

      var y = r.top + 2;
      if (y < 0 || y > H) continue;

      // РЅРµРјРЅРѕРіРѕ СЃСѓР¶Р°РµРј, С‡С‚РѕР±С‹ РЅРµ Р»РёРїР»Рѕ РЅР° РІСЃСЋ С€РёСЂРёРЅСѓ "Р±Р»РѕРєРѕРІ"
      var x1 = r.left + 10;
      var x2 = r.right - 10;
      if ((x2 - x1) < 60) continue;
      surfaces.push({
        x1: x1,
        x2: x2,
        y: y
      });

      added++;
      if (added >= max) break;
    }
  }

  function scheduleSurfaces() {
    if (cfg_tizen || !cfg_settle) return;

    var delay = isAndroid() ? 650 : 750;
    if (surfTimer) return;

    surfTimer = setTimeout(function () {
      surfTimer = 0;
      buildSurfaces();
    }, delay);
  }

  // --- вЂњСЃРЅРµР¶РЅС‹Рµ С€Р°РїРєРёвЂќ (CSS) ---
  function injectCapStyles() {
    if (document.getElementById('snowfx_caps_css')) return;

    var st = document.createElement('style');
    st.id = 'snowfx_caps_css';
    st.type = 'text/css';
    st.textContent =
      '.snowfx_cap{position:absolute;left:-2px;right:-2px;top:-2px;height:14px;pointer-events:none;' +
      'background:linear-gradient(to bottom, rgba(255,255,255,.85), rgba(255,255,255,.20), rgba(255,255,255,0));' +
      'filter:blur(.2px);border-top-left-radius:12px;border-top-right-radius:12px;}' +
      '.snowfx_cap:after{content:"";position:absolute;left:6px;right:6px;top:2px;height:2px;' +
      'background:rgba(255,255,255,.55);border-radius:4px;}';
    document.head.appendChild(st);
  }

  function applyCaps() {
    if (cfg_tizen || !cfg_settle) return;

    injectCapStyles();

    var els = getCardElements();
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (!el || el.__snowfx_cap__) continue;

      // РґРµР»Р°РµРј РєРѕРЅС‚РµР№РЅРµСЂРѕРј
      try {
        var cs = window.getComputedStyle ? getComputedStyle(el) : null;
        if (cs && cs.position === 'static') el.style.position = 'relative';
      } catch (e) {}

      var cap = document.createElement('div');
      cap.className = 'snowfx_cap';
      cap.style.zIndex = '2';
      cap.style.opacity = '0.8';

      try {
        el.appendChild(cap);
        el.__snowfx_cap__ = true;
      } catch (e2) {}
    }
  }

  function startCaps() {
    if (cfg_tizen || !cfg_settle) return;

    applyCaps();

    if (capObserver) return;
    try {
      capObserver = new MutationObserver(function () {
        setTimeout(function () {
          applyCaps();
          scheduleSurfaces();
        }, 140);
      });
      capObserver.observe(document.body, { childList: true, subtree: true });
    } catch (e) {
      capObserver = null;
    }
  }

  function stopCaps() {
    try {
      var caps = document.querySelectorAll('.snowfx_cap');
      for (var i = 0; i < caps.length; i++) {
        var c = caps[i];
        if (c && c.parentNode) {
          var p = c.parentNode;
          p.removeChild(c);
          try { p.__snowfx_cap__ = false; } catch (e4) {}
        }
      }
    } catch (e) {}

    try { if (capObserver) capObserver.disconnect(); } catch (e2) {}
    capObserver = null;

    try {
      var st = document.getElementById('snowfx_caps_css');
      if (st && st.parentNode) st.parentNode.removeChild(st);
    } catch (e3) {}
  }

  // --- loop ---
  function drawFrame(dt) {
    if (!fallCtx) return;

    fallCtx.clearRect(0, 0, W, H);

    if (cfg_settle && !cfg_tizen) {
      scheduleSurfaces();
      // caps disabled (they СЃРѕР·РґР°РІР°Р»Рё Р±РµР»С‹Рµ РїРѕР»РѕСЃРєРё РїСЂРё Р·Р°РіСЂСѓР·РєРµ)
    }

    for (var i = 0; i < flakes.length; i++) {
      var f = flakes[i];

      f.y += f.vy * (dt / 16.67);
      f.x += f.vx * (dt / 16.67);

      if (!cfg_tizen) f.x += Math.sin((f.y + i) * 0.01) * 0.25;

      // --- РѕСЃРµРґР°РЅРёРµ ---
      if (cfg_settle && !cfg_tizen && accCtx && spriteDot) {
        var si = (cfg_settle_intensity || 1);
        if (si < 0) si = 0;
        // РґР»СЏ "РјРµРґР»РµРЅРЅРѕРіРѕ" РѕСЃРµРґР°РЅРёСЏ РїСЂРѕСЃС‚Рѕ РЅРµ РІСЃРµРіРґР° СЂРёСЃСѓРµРј РЅР°РєРѕРїР»РµРЅРёРµ
        function allowDeposit() {
          if (si >= 0.999) return true;
          return Math.random() < si;
        }
        function p(base, cap) {
          if (!cap) cap = 0.95;
          return Math.min(cap, base * si);
        }
        // РЅРёР· СЌРєСЂР°РЅР°
        if (f.y >= H - 8) {
          if (allowDeposit()) {
            drawAccDot(f.x, H - 10, f.r, Math.min(0.9, f.a + 0.1));
            if (Math.random() < p(0.18, 0.55)) drawAccDot(f.x + rand(-4, 4), H - 10, f.r * 0.85, Math.min(0.85, f.a + 0.05));
          }
          f.x = rand(0, W);
          f.y = rand(-H, 0);
          continue;
        }

        // РІРµСЂС… РєР°СЂС‚РѕС‡РµРє
        if (surfaces.length && f.y > 0) {
          for (var sidx = 0; sidx < surfaces.length; sidx++) {
            var s = surfaces[sidx];
            if (f.x < s.x1 || f.x > s.x2) continue;

            if (f.y >= s.y && f.y <= s.y + 3) {
              if (allowDeposit()) {
                drawAccDot(f.x, s.y - 1, f.r, Math.min(0.9, f.a + 0.15));
                if (Math.random() < p(0.55)) drawAccDot(f.x + rand(-4, 4), s.y - 1, f.r * 0.85, Math.min(0.8, f.a));
                if (Math.random() < p(0.30, 0.85)) drawAccDot(f.x + rand(-6, 6), s.y - 2, f.r * 0.75, Math.min(0.7, f.a));
                // СѓСЃРєРѕСЂРµРЅРЅРѕРµ РѕСЃРµРґР°РЅРёРµ: РёРЅРѕРіРґР° РґРѕР±Р°РІРёРј РµС‰С‘ С‚РѕС‡РєСѓ
                if (si > 1.25 && Math.random() < Math.min(0.25, (si - 1.0) * 0.18)) {
                  drawAccDot(f.x + rand(-7, 7), s.y - 2, f.r * 0.65, Math.min(0.65, f.a));
                }
              }

              f.x = rand(0, W);
              f.y = rand(-H, 0);
              break;
            }
          }
        }
      }

      if (f.y > H + 12) { f.y = -12; f.x = rand(0, W); }
      if (f.x < -12) f.x = W + 12;
      else if (f.x > W + 12) f.x = -12;

      fallCtx.globalAlpha = f.a;
      var size = (f.r * 2.0) | 0;
      var img = (spritesFall && spritesFall[f.k]) ? spritesFall[f.k] : (spritesFall ? spritesFall[0] : spriteDot);
      fallCtx.drawImage(img, f.x, f.y, size, size);
    }

    fallCtx.globalAlpha = 1;
  }

  function loop(ts) {
    if (!running) return;

    if (document.hidden) {
      lastTs = ts;
      rafId = requestAnimationFrame(loop);
      return;
    }

    var interval = 1000 / cfg_fps;
    if (!lastTs) lastTs = ts;
    var dt = ts - lastTs;

    if (dt >= interval) {
      lastTs = ts;
      drawFrame(dt);
    }

    rafId = requestAnimationFrame(loop);
  }

  function startEngine() {
    if (running) return;
    if (prefersReduceMotion()) return;

    ensureCanvases();
    if (!fallCanvas || !fallCtx) return;

    try { window.addEventListener('resize', resize, false); } catch (e) {}

    flakes = [];
    applyFlakeCount(cfg_flakes);

    // РїРµСЂРІРёС‡РЅС‹Р№ СЂР°СЃС‡С‘С‚ РїРѕРІРµСЂС…РЅРѕСЃС‚РµР№ (С‡СѓС‚СЊ РїРѕР·Р¶Рµ, РєРѕРіРґР° РІС‘СЂСЃС‚РєР° СЃС‚Р°Р±РёР»РёР·РёСЂСѓРµС‚СЃСЏ)
    if (cfg_settle && !cfg_tizen) {
      // СѓР±РёСЂР°РµРј Р»СЋР±С‹Рµ СЃС‚Р°СЂС‹Рµ "С€Р°РїРєРё" РѕС‚ РїСЂРѕС€Р»С‹С… РІРµСЂСЃРёР№
      stopCaps();
      setTimeout(function(){
        // РЅР° СЃС‚Р°СЂС‚Рµ РґРµР»Р°РµРј С‡РёСЃС‚Рѕ, С‡С‚РѕР±С‹ РЅРµ РїРѕСЏРІР»СЏР»РёСЃСЊ Р±РµР»С‹Рµ РїРѕР»РѕСЃС‹
        resetAccumulationHard('warmup');
      }, 350);
    }

    running = true;

    // РІРєР»СЋС‡Р°РµРј "СЃС‚СЂСЏС…РёРІР°РЅРёРµ" РїСЂРё С„Р°РєС‚РёС‡РµСЃРєРѕРј СЃС‚Р°СЂС‚Рµ СЌС„С„РµРєС‚Р°
    if (shake_enabled) ensureMotion();

    rafId = requestAnimationFrame(loop);
  }

  function stopEngine() {
    removeCanvases();
  }

  // --- РїСЂРѕРєСЂСѓС‚РєР°/РґРІРёР¶РµРЅРёРµ РєРѕРЅС‚РµРЅС‚Р°: СЃР±СЂР°СЃС‹РІР°РµРј РѕСЃРµРґР°РЅРёРµ ---
  // 1) Р»РѕРІРёРј СЂРµР°Р»СЊРЅС‹Рµ scroll-СЃРѕР±С‹С‚РёСЏ (РІРєР»СЋС‡Р°СЏ РІР»РѕР¶РµРЅРЅС‹Рµ, capture=true)
  // 2) РїР»СЋСЃ "РїСЂРѕР±РЅРёРє" РЅР° СЃР»СѓС‡Р°Р№ РµСЃР»Рё Р›Р°РјРїР° СЃРєСЂРѕР»Р»РёС‚ transform-РѕРј (Р±РµР· scroll event)
  var scrollDebounce = 0;
  var probeSel = ['.scroll__body', '.scroll__content', '.content', '.activity', '.layer'];
  var probeEl = null;
  var probeTop = null;

  function findProbe() {
    for (var i = 0; i < probeSel.length; i++) {
      var el = null;
      try { el = document.querySelector(probeSel[i]); } catch (e) {}
      if (el && el.getBoundingClientRect) return el;
    }
    return null;
  }

  function onAnyScrollLike() {
    if (cfg_tizen || !cfg_settle) return;
    if (!running) return;

    if (scrollDebounce) return;
    scrollDebounce = setTimeout(function () {
      scrollDebounce = 0;
      resetAccumulationSoft('scroll');
    }, 120);
  }

  function bindScrollReset() {
    if (window.__snowfx_scrollbind__) return;
    window.__snowfx_scrollbind__ = true;

    try { document.addEventListener('scroll', onAnyScrollLike, true); } catch (e1) {}
    try { document.addEventListener('wheel', onAnyScrollLike, { passive: true }); } catch (e2) {}
    try { document.addEventListener('touchmove', onAnyScrollLike, { passive: true }); } catch (e3) {}

    // probe interval
    setInterval(function () {
      if (cfg_tizen || !cfg_settle) return;
      if (!running) return;

      if (!probeEl) probeEl = findProbe();
      if (!probeEl) return;

      var t = null;
      try { t = probeEl.getBoundingClientRect().top; } catch (e4) { t = null; }
      if (t === null) return;

      if (probeTop === null) {
        probeTop = t;
        return;
      }

      // РµСЃР»Рё РєРѕРЅС‚РµРЅС‚ вЂњРїРѕРµС…Р°Р»вЂќ вЂ” СЃР±СЂР°СЃС‹РІР°РµРј РѕСЃРµРґР°РЅРёРµ
      if (Math.abs(t - probeTop) > 2.5) {
        probeTop = t;
        onAnyScrollLike();
      }
    }, 250);
  }
  function injectSnowIconCSS() {
    try {
      if (document.getElementById('snowfx_menu_icon_css')) return;

      var st = document.createElement('style');
      st.id = 'snowfx_menu_icon_css';
      st.type = 'text/css';

      // Default: white icon on dark menu
      // Focus/Select/Hover: use currentColor (РѕР±С‹С‡РЅРѕ СЃС‚Р°РЅРѕРІРёС‚СЃСЏ С‡С‘СЂРЅС‹Рј РЅР° СЃРІРµС‚Р»РѕР№ РїРѕРґР»РѕР¶РєРµ)
      st.textContent =
        '.snowfx-menu-icon path{fill:#fff !important;}' +
        '.menu__item.select .snowfx-menu-icon path,' +
        '.menu__item.active .snowfx-menu-icon path,' +
        '.menu__item.hover .snowfx-menu-icon path,' +
        '.menu__item:focus .snowfx-menu-icon path,' +
        '.menu__item:hover .snowfx-menu-icon path,' +
        '.menu li.focus .snowfx-menu-icon path,' +
        '.menu li.select .snowfx-menu-icon path{fill:currentColor !important;}';

      (document.head || document.documentElement).appendChild(st);
    } catch (e) {}
  }

  // --- Shake to clear snow (mobile) ---
  // Р Р°Р±РѕС‚Р°РµС‚ С‡РµСЂРµР· devicemotion. РќР° iOS РјРѕР¶РµС‚ С‚СЂРµР±РѕРІР°С‚СЊСЃСЏ СЂР°Р·СЂРµС€РµРЅРёРµ (РїРµСЂРІС‹Р№ С‚Р°Рї/РєР»РёРє).
  // Р’Р°Р¶РЅРѕ: Р·Р°РїСѓСЃРєР°РµРј/РѕСЃС‚Р°РЅР°РІР»РёРІР°РµРј СЃР»СѓС€Р°С‚РµР»СЊ РІРјРµСЃС‚Рµ СЃ Р·Р°РїСѓСЃРєРѕРј/РѕСЃС‚Р°РЅРѕРІРєРѕР№ СЌС„С„РµРєС‚Р°, РёРЅР°С‡Рµ РїРѕСЃР»Рµ Р·Р°РєСЂС‹С‚РёСЏ РЅР°СЃС‚СЂРѕРµРє
  // (РєРѕРіРґР° СЃРЅРµРі РІСЂРµРјРµРЅРЅРѕ РІС‹РєР»СЋС‡РµРЅ РёР·-Р·Р° overlay) "СЃС‚СЂСЏС…РёРІР°РЅРёРµ" РјРѕР¶РµС‚ РЅРµ РІРєР»СЋС‡РёС‚СЊСЃСЏ РѕР±СЂР°С‚РЅРѕ.
  var shake_enabled = 0;

  var motion_active = false;
  var motion_ready = false;
  var motion_ask_bound = false;

  // last motion sample (РґР»СЏ СЂР°СЃС‡С‘С‚Р° СЂС‹РІРєР°)
  var last_mot_x = null;
  var last_mot_y = null;
  var last_mot_z = null;
  var last_mot_ts = 0;

  // Р°РЅС‚Рё-СЃРїР°Рј РґР»СЏ С‚СЂРёРіРіРµСЂР°
  var last_shake_ts = 0;
  var shake_hits = 0;
  var shake_window_ts = 0;

  function setShakeEnabled(v) {
    v = v ? 1 : 0;

    // РµСЃР»Рё Р·РЅР°С‡РµРЅРёРµ РЅРµ РјРµРЅСЏР»РѕСЃСЊ вЂ” РїСЂРѕСЃС‚Рѕ СЃРёРЅС…СЂРѕРЅРёР·РёСЂСѓРµРј СЃРѕСЃС‚РѕСЏРЅРёРµ СЃР»СѓС€Р°С‚РµР»СЏ СЃ running
    if (shake_enabled === v) {
      if (!shake_enabled) { stopMotion(); return; }
      if (cfg_tizen || !isMobileUA()) { stopMotion(); return; }
      if (running) ensureMotion(); else stopMotion();
      return;
    }

    shake_enabled = v;

    if (!shake_enabled) {
      stopMotion();
      return;
    }

    // С‚РѕР»СЊРєРѕ РјРѕР±РёР»РєРё, РЅРµ Tizen
    if (cfg_tizen || !isMobileUA()) {
      stopMotion();
      return;
    }

    // Р·Р°РїСѓСЃРєР°РµРј С‚РѕР»СЊРєРѕ РєРѕРіРґР° СЌС„С„РµРєС‚ СЂРµР°Р»СЊРЅРѕ Р°РєС‚РёРІРµРЅ
    if (running) ensureMotion();
    else stopMotion();
  }

  function normalizeAccel(ax, ay, az) {
    // РќРµРєРѕС‚РѕСЂС‹Рµ WebView/Р±СЂР°СѓР·РµСЂС‹ РѕС‚РґР°СЋС‚ СѓСЃРєРѕСЂРµРЅРёРµ РІ "g", РЅРµРєРѕС‚РѕСЂС‹Рµ РІ m/s^2.
    // Р•СЃР»Рё Р·РЅР°С‡РµРЅРёСЏ РѕС‡РµРЅСЊ РјР°Р»РµРЅСЊРєРёРµ (РѕР±С‹С‡РЅРѕ <= ~3), СЃС‡РёС‚Р°РµРј С‡С‚Рѕ СЌС‚Рѕ g Рё РїРµСЂРµРІРѕРґРёРј РІ m/s^2.
    var mx = Math.max(Math.abs(ax), Math.abs(ay), Math.abs(az));
    if (mx > 0 && mx <= 3.5) {
      ax *= 9.81; ay *= 9.81; az *= 9.81;
    }
    return { x: ax, y: ay, z: az };
  }

  function doShakeEffect() {
    // РѕС‡РёС‰Р°РµРј "РѕСЃРµРІС€РёР№" СЃРЅРµРі РґР°Р¶Рµ РµСЃР»Рё РѕСЃРµРґР°РЅРёРµ РІСЂРµРјРµРЅРЅРѕ РІС‹РєР»СЋС‡РµРЅРѕ (РЅР°РїСЂРёРјРµСЂ, РІ РєР°СЂС‚РѕС‡РєРµ)
    try { clearAccumulationRuntime('shake'); } catch (e1) {}

    // РµСЃР»Рё РѕСЃРµРґР°РЅРёРµ РІРєР»СЋС‡РµРЅРѕ вЂ” РїРµСЂРµСЃС‚СЂРѕРёРј РїРѕРІРµСЂС…РЅРѕСЃС‚Рё С‡СѓС‚СЊ РїРѕР·Р¶Рµ
    if (!cfg_tizen && cfg_settle) {
      try {
        if (resetTimer) clearTimeout(resetTimer);
        resetTimer = setTimeout(function () {
          resetTimer = 0;
          buildSurfaces();
        }, 180);
      } catch (e2) {}
    }

    // РїРѕСЂС‹РІ РІРµС‚СЂР° Сѓ РїР°РґР°СЋС‰РµРіРѕ СЃРЅРµРіР° (С‡С‚РѕР±С‹ Р±С‹Р»Рѕ РІРёРґРЅРѕ, С‡С‚Рѕ РІСЃС‚СЂСЏС…РёРІР°РЅРёРµ СЃСЂР°Р±РѕС‚Р°Р»Рѕ РґР°Р¶Рµ Р±РµР· РѕСЃРµРґР°РЅРёСЏ)
    try {
      for (var i = 0; i < flakes.length; i++) {
        flakes[i].vx += rand(-1.6, 1.6);
        flakes[i].vy *= 0.80;
        // РЅРµРјРЅРѕРіРѕ "РїРѕРґР±СЂРѕСЃРёРј" С‡Р°СЃС‚СЊ СЃРЅРµР¶РёРЅРѕРє РІРІРµСЂС…
        if (Math.random() < 0.35) flakes[i].y = rand(-H * 0.35, 0);
      }
    } catch (e3) {}
  }

  function onDeviceMotion(e) {
    if (!shake_enabled) return;
    if (cfg_tizen) return;
    if (!isMobileUA()) return;

    // РќРµС‡РµРіРѕ "СЃС‚СЂСЏС…РёРІР°С‚СЊ", РµСЃР»Рё СЌС„С„РµРєС‚ СЃРµР№С‡Р°СЃ РІС‹РєР»СЋС‡РµРЅ (РЅР°СЃС‚СЂРѕР№РєРё/РїР»РµРµСЂ)
    if (!running) return;

    var acc = e && (e.accelerationIncludingGravity || e.acceleration);
    if (!acc) return;

    var ax = Number(acc.x || 0);
    var ay = Number(acc.y || 0);
    var az = Number(acc.z || 0);

    var n = normalizeAccel(ax, ay, az);
    ax = n.x; ay = n.y; az = n.z;

    var now = Date.now();
    if (!last_mot_ts) {
      last_mot_ts = now;
      last_mot_x = ax; last_mot_y = ay; last_mot_z = az;
      return;
    }

    // РµСЃР»Рё РјРµР¶РґСѓ СЃРѕР±С‹С‚РёСЏРјРё Р±С‹Р» Р±РѕР»СЊС€РѕР№ СЂР°Р·СЂС‹РІ вЂ” СЃР±СЂР°СЃС‹РІР°РµРј baseline
    if (now - last_mot_ts > 1200) {
      last_mot_ts = now;
      last_mot_x = ax; last_mot_y = ay; last_mot_z = az;
      return;
    }

    // РѕС†РµРЅРєР° "СЂС‹РІРєР°": СЃСѓРјРјР° РјРѕРґСѓР»РµР№ РґРµР»СЊС‚ РїРѕ РѕСЃСЏРј (РіСЂР°РІРёС‚Р°С†РёСЏ С‡Р°СЃС‚РёС‡РЅРѕ РєРѕРјРїРµРЅСЃРёСЂСѓРµС‚СЃСЏ СЂР°Р·РЅРѕСЃС‚СЊСЋ)
    var jerk = Math.abs(ax - last_mot_x) + Math.abs(ay - last_mot_y) + Math.abs(az - last_mot_z);

    last_mot_ts = now;
    last_mot_x = ax; last_mot_y = ay; last_mot_z = az;

    // РїРѕСЂРѕРіРё: iOS С‡Р°СЃС‚Рѕ РґР°С‘С‚ С‡СѓС‚СЊ "РјСЏРіС‡Рµ" Р·РЅР°С‡РµРЅРёСЏ в†’ РїРѕСЂРѕРі РІС‹С€Рµ РЅРµ РЅСѓР¶РµРЅ
    var ua = navigator.userAgent || '';
    var isiOS = /iPhone|iPad|iPod/i.test(ua);

    var TH = isiOS ? 12.5 : 11.0;   // РїРѕСЂРѕРі СЂС‹РІРєР° (m/s^2)
    var WINDOW = 650;              // РѕРєРЅРѕ РґРµС‚РµРєС†РёРё
    var COOLDOWN = 1100;           // Р°РЅС‚РёСЃРїР°Рј

    if (jerk > TH) {
      if (now - last_shake_ts < COOLDOWN) return;

      if (!shake_window_ts || (now - shake_window_ts) > WINDOW) {
        shake_window_ts = now;
        shake_hits = 0;
      }

      shake_hits++;

      // С‚СЂРµР±СѓРµРј 2 СЃРёР»СЊРЅС‹С… СЂС‹РІРєР° РІ РѕРєРЅРµ вЂ” С‚Р°Рє РјРµРЅСЊС€Рµ Р»РѕР¶РЅС‹С… СЃСЂР°Р±Р°С‚С‹РІР°РЅРёР№
      if (shake_hits >= 2) {
        last_shake_ts = now;
        shake_hits = 0;
        shake_window_ts = 0;

        doShakeEffect();
      }
    }
  }

  function startMotion() {
    if (motion_active) return;
    if (typeof window.DeviceMotionEvent === 'undefined') return;

    try {
      // passive СЃРЅРёР¶Р°РµС‚ РІР»РёСЏРЅРёРµ РЅР° scroll
      window.addEventListener('devicemotion', onDeviceMotion, { passive: true });
      motion_active = true;
    } catch (e) {
      try {
        window.addEventListener('devicemotion', onDeviceMotion, false);
        motion_active = true;
      } catch (e2) {}
    }
  }

  function stopMotion() {
    if (!motion_active) return;
    try { window.removeEventListener('devicemotion', onDeviceMotion, { passive: true }); } catch (e) {}
    try { window.removeEventListener('devicemotion', onDeviceMotion, false); } catch (e2) {}
    motion_active = false;
  }

  function ensureMotion() {
    if (!shake_enabled) return;

    if (motion_ready) { startMotion(); return; }

    // iOS 13+ С‚СЂРµР±СѓРµС‚ Р·Р°РїСЂРѕСЃ СЂР°Р·СЂРµС€РµРЅРёСЏ С‚РѕР»СЊРєРѕ РїРѕ РїРѕР»СЊР·РѕРІР°С‚РµР»СЊСЃРєРѕРјСѓ РґРµР№СЃС‚РІРёСЋ
    if (typeof window.DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      if (motion_ask_bound) return;
      motion_ask_bound = true;

      var ask = function () {
        try { document.removeEventListener('click', ask, true); } catch (e1) {}
        try { document.removeEventListener('touchend', ask, true); } catch (e2) {}
        motion_ask_bound = false;

        try {
          DeviceMotionEvent.requestPermission().then(function (res) {
            if (res === 'granted') {
              motion_ready = true;
              startMotion();
            }
          }).catch(function () {});
        } catch (e3) {}
      };

      try { document.addEventListener('click', ask, true); } catch (e4) {}
      try { document.addEventListener('touchend', ask, true); } catch (e5) {}
      return;
    }

    // Android/Chrome Рё Р±РѕР»СЊС€РёРЅСЃС‚РІРѕ WebView вЂ” СЃСЂР°Р·Сѓ
    motion_ready = true;
    startMotion();
  }

  // --- i18n (Settings labels) ---

  function snowfx_detect_lang() {
    var l = '';
    try {
      if (window.Lampa && Lampa.Storage) {
        if (typeof Lampa.Storage.lang === 'function') l = Lampa.Storage.lang();
        else if (typeof Lampa.Storage.get === 'function') l = Lampa.Storage.get('language') || Lampa.Storage.get('lang') || Lampa.Storage.get('locale');
      }
    } catch (e) {}

    if (!l) {
      try { l = (navigator.language || navigator.userLanguage || '').toLowerCase(); } catch (e2) {}
    }

    l = (l || 'ru').toString().toLowerCase();
    if (l.indexOf('en') === 0) return 'en';
    if (l.indexOf('uk') === 0 || l.indexOf('ua') === 0) return 'uk';
    if (l.indexOf('ru') === 0) return 'ru';
    return 'ru';
  }

  var SNOWFX_LANG = snowfx_detect_lang();
  var SNOWFX_I18N = {
    ru: {
      component: 'РЎРЅРµРі',

      enabled_name: 'РЎРЅРµРі РЅР° СЌРєСЂР°РЅР°С…',
      enabled_desc: 'Р“Р»Р°РІРЅР°СЏ / Р¤РёР»СЊРјС‹ / РЎРµСЂРёР°Р»С‹ / РљР°С‚РµРіРѕСЂРёРё',

      in_card_name: 'РЎРЅРµРі РІ РєР°СЂС‚РѕС‡РєРµ',
      in_card_desc: 'РџРѕРєР°Р·С‹РІР°С‚СЊ СЃРЅРµРі РЅР° СЃС‚СЂР°РЅРёС†Рµ РґРµС‚Р°Р»РµР№ С„РёР»СЊРјР°/СЃРµСЂРёР°Р»Р°',

      density_name: 'РџР»РѕС‚РЅРѕСЃС‚СЊ СЃРЅРµРіР°',
      density_desc: 'РќР° Tizen РїР»РѕС‚РЅРѕСЃС‚СЊ РѕРіСЂР°РЅРёС‡РµРЅР°',

      flake_name: 'РўРёРї СЃРЅРµР¶РёРЅРѕРє',
      flake_desc: 'Р’С‹Р±РѕСЂ РІРёРґР° СЃРЅРµР¶РёРЅРѕРє. РќР° Tizen РјРѕР¶РЅРѕ РІРєР»СЋС‡РёС‚СЊ СЃРЅРµР¶РёРЅРєРё, РЅРѕ РІРѕР·РјРѕР¶РЅС‹ Р»Р°РіРё.',

      size_name: 'Р Р°Р·РјРµСЂ СЃРЅРµР¶РёРЅРѕРє',
      size_desc: 'РџСЂРёРјРµРЅСЏРµС‚СЃСЏ РєРѕ РІСЃРµРј РІРёРґР°Рј. РќР° Tizen Р±РѕР»СЊС€РёРµ СЂР°Р·РјРµСЂС‹ РѕРіСЂР°РЅРёС‡РµРЅС‹ РґР»СЏ СЃРЅРёР¶РµРЅРёСЏ РЅР°РіСЂСѓР·РєРё.',

      fall_speed_name: 'РЎРєРѕСЂРѕСЃС‚СЊ РїР°РґРµРЅРёСЏ',
      fall_speed_desc: 'РЎРєРѕСЂРѕСЃС‚СЊ РґРІРёР¶РµРЅРёСЏ РїР°РґР°СЋС‰РёС… СЃРЅРµР¶РёРЅРѕРє. РќР° Tizen Р±С‹СЃС‚СЂС‹Р№ СЂРµР¶РёРј РѕРіСЂР°РЅРёС‡РµРЅ.',

      settle_name: 'РћСЃРµРґР°РЅРёРµ РЅР° РєР°СЂС‚РѕС‡РєР°С…',
      settle_desc: 'РџСЂРё РїСЂРѕРєСЂСѓС‚РєРµ РѕСЃРµРґР°РЅРёРµ СЃР±СЂР°СЃС‹РІР°РµС‚СЃСЏ. РќР° Tizen РїСЂРёРЅСѓРґРёС‚РµР»СЊРЅРѕ Р’С‹РєР».',

      settle_speed_name: 'РЎРєРѕСЂРѕСЃС‚СЊ РѕСЃРµРґР°РЅРёСЏ',
      settle_speed_desc: 'РЎРєРѕСЂРѕСЃС‚СЊ РЅР°РєРѕРїР»РµРЅРёСЏ "СЃРЅРµР¶РЅС‹С… С‚РѕС‡РµРє" (СЂР°Р±РѕС‚Р°РµС‚ С‚РѕР»СЊРєРѕ РµСЃР»Рё РѕСЃРµРґР°РЅРёРµ РІРєР»СЋС‡РµРЅРѕ).',

      shake_name: 'РЎС‚СЂСЏС…РёРІР°РЅРёРµ СЃРЅРµРіР°',
      shake_desc: 'РќР° СЃРјР°СЂС‚С„РѕРЅРµ РјРѕР¶РЅРѕ СЃС‚СЂСЏС…РЅСѓС‚СЊ СЃРЅРµРі РїРѕС‚СЂСЏС…РёРІР°РЅРёРµРј',

      on: 'Р’РєР»',
      off: 'Р’С‹РєР»',
      yes: 'Р”Р°',
      no: 'РќРµС‚',
      auto: 'РђРІС‚Рѕ',

      density_low: 'РњР°Р»Рѕ',
      density_mid: 'РЎСЂРµРґРЅРµ',
      density_high: 'РњРЅРѕРіРѕ',

      style_dots: 'РўРѕС‡РєРё',
      style_flakes: 'РЎРЅРµР¶РёРЅРєРё',
      style_mixed: 'РЎРјРµС€Р°РЅРЅС‹Рµ',

      size_small: 'РњР°Р»РµРЅСЊРєРёРµ',
      size_medium: 'РЎСЂРµРґРЅРёРµ',
      size_large: 'Р‘РѕР»СЊС€РёРµ',
      size_huge: 'РћРіСЂРѕРјРЅС‹Рµ',

      speed_slow: 'РњРµРґР»РµРЅРЅР°СЏ',
      speed_medium: 'РЎСЂРµРґРЅСЏСЏ',
      speed_fast: 'Р‘С‹СЃС‚СЂР°СЏ'
    },

    en: {
      component: 'Snow',

      enabled_name: 'Snow on screens',
      enabled_desc: 'Home / Movies / Series / Categories',

      in_card_name: 'Snow inside cards',
      in_card_desc: 'Show snow on the details page',

      density_name: 'Snow density',
      density_desc: 'On Tizen, density is limited',

      flake_name: 'Flake type',
      flake_desc: 'Choose the flake style. On Tizen, flakes may cause stutter.',

      size_name: 'Flake size',
      size_desc: 'Applies to all styles. On Tizen, large sizes are limited to reduce load.',

      fall_speed_name: 'Fall speed',
      fall_speed_desc: 'Speed of falling flakes. On Tizen, fast mode is limited.',

      settle_name: 'Settle on cards',
      settle_desc: 'Settling resets while scrolling. Forced Off on Tizen.',

      settle_speed_name: 'Settle speed',
      settle_speed_desc: 'How fast settled "snow dots" accumulate (works only when settling is enabled).',

      shake_name: 'Shake to clear',
      shake_desc: 'On mobile you can shake to clear snow',

      on: 'On',
      off: 'Off',
      yes: 'Yes',
      no: 'No',
      auto: 'Auto',

      density_low: 'Low',
      density_mid: 'Medium',
      density_high: 'High',

      style_dots: 'Dots',
      style_flakes: 'Flakes',
      style_mixed: 'Mixed',

      size_small: 'Small',
      size_medium: 'Medium',
      size_large: 'Large',
      size_huge: 'Huge',

      speed_slow: 'Slow',
      speed_medium: 'Medium',
      speed_fast: 'Fast'
    },

    uk: {
      component: 'РЎРЅС–Рі',

      enabled_name: 'РЎРЅС–Рі РЅР° РµРєСЂР°РЅР°С…',
      enabled_desc: 'Р“РѕР»РѕРІРЅР° / Р¤С–Р»СЊРјРё / РЎРµСЂС–Р°Р»Рё / РљР°С‚РµРіРѕСЂС–С—',

      in_card_name: 'РЎРЅС–Рі Сѓ РєР°СЂС‚С†С–',
      in_card_desc: 'РџРѕРєР°Р·СѓРІР°С‚Рё СЃРЅС–Рі РЅР° СЃС‚РѕСЂС–РЅС†С– РґРµС‚Р°Р»РµР№ С„С–Р»СЊРјСѓ/СЃРµСЂС–Р°Р»Сѓ',

      density_name: 'Р©С–Р»СЊРЅС–СЃС‚СЊ СЃРЅС–РіСѓ',
      density_desc: 'РќР° Tizen С‰С–Р»СЊРЅС–СЃС‚СЊ РѕР±РјРµР¶РµРЅР°',

      flake_name: 'РўРёРї СЃРЅС–Р¶РёРЅРѕРє',
      flake_desc: 'Р’РёР±С–СЂ РІРёРґСѓ СЃРЅС–Р¶РёРЅРѕРє. РќР° Tizen РјРѕР¶Р»РёРІС– РїС–РґРіР°Р»СЊРјРѕРІСѓРІР°РЅРЅСЏ.',

      size_name: 'Р РѕР·РјС–СЂ СЃРЅС–Р¶РёРЅРѕРє',
      size_desc: 'Р—Р°СЃС‚РѕСЃРѕРІСѓС”С‚СЊСЃСЏ РґРѕ РІСЃС–С… РІРёРґС–РІ. РќР° Tizen РІРµР»РёРєС– СЂРѕР·РјС–СЂРё РѕР±РјРµР¶РµРЅС– РґР»СЏ Р·РЅРёР¶РµРЅРЅСЏ РЅР°РІР°РЅС‚Р°Р¶РµРЅРЅСЏ.',

      fall_speed_name: 'РЁРІРёРґРєС–СЃС‚СЊ РїР°РґС–РЅРЅСЏ',
      fall_speed_desc: 'РЁРІРёРґРєС–СЃС‚СЊ СЂСѓС…Сѓ РїР°РґР°СЋС‡РёС… СЃРЅС–Р¶РёРЅРѕРє. РќР° Tizen С€РІРёРґРєРёР№ СЂРµР¶РёРј РѕР±РјРµР¶РµРЅРѕ.',

      settle_name: 'РћСЃС–РґР°РЅРЅСЏ РЅР° РєР°СЂС‚РєР°С…',
      settle_desc: 'РџС–Рґ С‡Р°СЃ РїСЂРѕРєСЂСѓС‚РєРё РѕСЃС–РґР°РЅРЅСЏ СЃРєРёРґР°С”С‚СЊСЃСЏ. РќР° Tizen РїСЂРёРјСѓСЃРѕРІРѕ Р’РёРјРє.',

      settle_speed_name: 'РЁРІРёРґРєС–СЃС‚СЊ РѕСЃС–РґР°РЅРЅСЏ',
      settle_speed_desc: 'РЁРІРёРґРєС–СЃС‚СЊ РЅР°РєРѕРїРёС‡РµРЅРЅСЏ "СЃРЅС–РіРѕРІРёС… С‚РѕС‡РѕРє" (РїСЂР°С†СЋС” Р»РёС€Рµ СЏРєС‰Рѕ РѕСЃС–РґР°РЅРЅСЏ СѓРІС–РјРєРЅРµРЅРѕ).',

      shake_name: 'РЎС‚СЂСѓСЃРёС‚Рё СЃРЅС–Рі',
      shake_desc: 'РќР° СЃРјР°СЂС‚С„РѕРЅС– РјРѕР¶РЅР° СЃС‚СЂСѓСЃРёС‚Рё СЃРЅС–Рі РїРѕС‚СЂСЏС…СѓРІР°РЅРЅСЏРј',

      on: 'РЈРІС–РјРє',
      off: 'Р’РёРјРє',
      yes: 'РўР°Рє',
      no: 'РќС–',
      auto: 'РђРІС‚Рѕ',

      density_low: 'РњР°Р»Рѕ',
      density_mid: 'РЎРµСЂРµРґРЅСЊРѕ',
      density_high: 'Р‘Р°РіР°С‚Рѕ',

      style_dots: 'РўРѕС‡РєРё',
      style_flakes: 'РЎРЅС–Р¶РёРЅРєРё',
      style_mixed: 'Р—РјС–С€Р°РЅС–',

      size_small: 'РњР°Р»С–',
      size_medium: 'РЎРµСЂРµРґРЅС–',
      size_large: 'Р’РµР»РёРєС–',
      size_huge: 'Р’РµР»РёС‡РµР·РЅС–',

      speed_slow: 'РџРѕРІС–Р»СЊРЅР°',
      speed_medium: 'РЎРµСЂРµРґРЅСЏ',
      speed_fast: 'РЁРІРёРґРєР°'
    }
  };

  function snowfx_t(key) {
    var dict = SNOWFX_I18N[SNOWFX_LANG] || SNOWFX_I18N.ru;
    return (dict && dict[key]) || (SNOWFX_I18N.ru && SNOWFX_I18N.ru[key]) || key;
  }

// --- Settings UI ---
  function addSettingsUI() {
    injectSnowIconCSS();
    if (!window.Lampa || !Lampa.SettingsApi) return;

    var onoff = { 0: snowfx_t('off'), 1: snowfx_t('on') };
    var yesno = { 0: snowfx_t('no'), 1: snowfx_t('yes') };
    var density_vals = { 0: snowfx_t('auto'), 1: snowfx_t('density_low'), 2: snowfx_t('density_mid'), 3: snowfx_t('density_high') };
    var style_vals = { 0: snowfx_t('auto'), 1: snowfx_t('style_dots'), 2: snowfx_t('style_flakes'), 3: snowfx_t('style_mixed') };
    var size_vals = { 0: snowfx_t('auto'), 1: snowfx_t('size_small'), 2: snowfx_t('size_medium'), 3: snowfx_t('size_large'), 4: snowfx_t('size_huge') };
    var speed_vals = { 0: snowfx_t('auto'), 1: snowfx_t('speed_slow'), 2: snowfx_t('speed_medium'), 3: snowfx_t('speed_fast') };

    try {
      Lampa.SettingsApi.addComponent({
        component: 'snowfx',
        name: snowfx_t('component'),
        icon: SNOW_ICON
      });

      Lampa.SettingsApi.addParam({
        component: 'snowfx',
        param: {
          name: KEY_ENABLED,
          type: 'select',
          values: onoff,
          "default": 1
        },
        field: {
          name: snowfx_t('enabled_name'),
          description: snowfx_t('enabled_desc')
        }
      });

      Lampa.SettingsApi.addParam({
        component: 'snowfx',
        param: {
          name: KEY_IN_CARD,
          type: 'select',
          values: yesno,
          "default": 0
        },
        field: {
          name: snowfx_t('in_card_name'),
          description: snowfx_t('in_card_desc')
        }
      });

      Lampa.SettingsApi.addParam({
        component: 'snowfx',
        param: {
          name: KEY_DENSITY,
          type: 'select',
          values: density_vals,
          "default": 0
        },
        field: {
          name: snowfx_t('density_name'),
          description: snowfx_t('density_desc')
        }
      });

      Lampa.SettingsApi.addParam({
        component: 'snowfx',
        param: {
          name: KEY_FLAKE,
          type: 'select',
          values: style_vals,
          "default": 0
        },
        field: {
          name: snowfx_t('flake_name'),
          description: snowfx_t('flake_desc')
        }
      });

      Lampa.SettingsApi.addParam({
        component: 'snowfx',
        param: {
          name: KEY_SIZE,
          type: 'select',
          values: size_vals,
          "default": 0
        },
        field: {
          name: snowfx_t('size_name'),
          description: snowfx_t('size_desc')
        }
      });

      Lampa.SettingsApi.addParam({
        component: 'snowfx',
        param: {
          name: KEY_FALL_SPEED,
          type: 'select',
          values: speed_vals,
          "default": 0
        },
        field: {
          name: snowfx_t('fall_speed_name'),
          description: snowfx_t('fall_speed_desc')
        }
      });

      Lampa.SettingsApi.addParam({
        component: 'snowfx',
        param: {
          name: KEY_SETTLE,
          type: 'select',
          values: onoff,
          "default": 1
        },
        field: {
          name: snowfx_t('settle_name'),
          description: snowfx_t('settle_desc')
        }
      });

      Lampa.SettingsApi.addParam({
        component: 'snowfx',
        param: {
          name: KEY_SETTLE_SPEED,
          type: 'select',
          values: speed_vals,
          "default": 0
        },
        field: {
          name: snowfx_t('settle_speed_name'),
          description: snowfx_t('settle_speed_desc')
        }
      });

      Lampa.SettingsApi.addParam({
        component: 'snowfx',
        param: {
          name: KEY_SHAKE,
          type: 'select',
          values: onoff,
          "default": 1
        },
        field: {
          name: snowfx_t('shake_name'),
          description: snowfx_t('shake_desc')
        }
      });
    } catch (e) {}
  }

  // --- Lampa hooks ---
  function bindLampaHooks() {
    if (!window.Lampa) return;

    try {
      if (Lampa.Listener && Lampa.Listener.follow) {
        Lampa.Listener.follow('activity', function (e) {
          if (!e || e.type !== 'start') return;
          in_details_activity = isDetailsActivity(e);
          on_allowed_screen = isAllowedActivity(e) || in_details_activity;

          // СЃР±СЂРѕСЃ РїСЂРѕР±РЅРёРєР° СЃРєСЂРѕР»Р»Р° РїСЂРё СЃРјРµРЅРµ СЌРєСЂР°РЅР°
          try { probeEl = null; probeTop = null; } catch (e0) {}

          applyConfigAndState(true);

          // РѕР±РЅРѕРІРёРј shake СЃСЂР°Р·Сѓ, Р±РµР· РѕР¶РёРґР°РЅРёСЏ watcher
          try {
            var t = isTizen();
            var sd = (!t && isMobileUA()) ? 1 : 0;
            var shv = num(storageGet(KEY_SHAKE, sd), sd) | 0;
            setShakeEnabled(!!shv);
          } catch (e3) {}
        });
      }
    } catch (e1) {}

    try {
      if (Lampa.Player && Lampa.Player.listener && Lampa.Player.listener.follow) {
        Lampa.Player.listener.follow('start', function () {
          in_player = true;
          applyConfigAndState(true);
        });
        Lampa.Player.listener.follow('destroy', function () {
          in_player = false;
          applyConfigAndState(true);
        });

        // РґСЂСѓРіРёРµ РёРјРµРЅР° СЃРѕР±С‹С‚РёР№ (РІ СЂР°Р·РЅС‹С… СЃР±РѕСЂРєР°С…/РїР»РµРµСЂР°С…)
        var _end_events = ['stop', 'end', 'close', 'exit', 'back'];
        for (var i = 0; i < _end_events.length; i++) {
          try {
            Lampa.Player.listener.follow(_end_events[i], function () {
              in_player = false;
              applyConfigAndState(true);
            });
          } catch (e3) {}
        }
      }
    } catch (e2) {}
  }

  // --- apply state ---
  function applyConfigAndState(resetAcc) {
    var cfg = computeConfig();

    cfg_tizen = !!cfg.tizen;
    cfg_fps = cfg.fps;
    cfg_flakes = cfg.flakes;

    // СЃРёРЅС…СЂРѕРЅРёР·РёСЂСѓРµРј РЅР°СЃС‚СЂРѕР№РєСѓ \"РЎС‚СЂСЏС…РёРІР°РЅРёРµ\" (РІР°Р¶РЅРѕ: РµСЃР»Рё РІРєР»СЋС‡РёР»Рё РІ РЅР°СЃС‚СЂРѕР№РєР°С…, РєРѕРіРґР° РѕРІРµСЂР»РµР№ РѕС‚РєСЂС‹С‚, СЌС„С„РµРєС‚ РІСЂРµРјРµРЅРЅРѕ РІС‹РєР»СЋС‡РµРЅ Рё СЃР»СѓС€Р°С‚РµР»СЊ РёРЅР°С‡Рµ РЅРµ СЃС‚Р°СЂС‚Р°РЅС‘С‚)
    try {
      var sd = (!cfg_tizen && isMobileUA()) ? 1 : 0;
      var shv = num(storageGet(KEY_SHAKE, sd), sd) ? 1 : 0;
      setShakeEnabled(shv);
    } catch (e0) {}

    // СЂР°Р·РјРµСЂ СЃРЅРµР¶РёРЅРѕРє
    var prev_size_mult = cfg_size_mult;
    cfg_size_mult = (typeof cfg.size_mult === 'number') ? cfg.size_mult : 1.0;
    if (!cfg_size_mult || cfg_size_mult <= 0) cfg_size_mult = 1.0;

    // СЃРєРѕСЂРѕСЃС‚СЊ РїР°РґРµРЅРёСЏ СЃРЅРµР¶РёРЅРѕРє
    var prev_fall_mult = cfg_fall_mult;
    cfg_fall_mult = (typeof cfg.fall_mult === 'number') ? cfg.fall_mult : 1.0;
    if (!cfg_fall_mult || cfg_fall_mult <= 0) cfg_fall_mult = 1.0;

    // СЃРєРѕСЂРѕСЃС‚СЊ РѕСЃРµРґР°РЅРёСЏ (РёРЅС‚РµРЅСЃРёРІРЅРѕСЃС‚СЊ РЅР°РєРѕРїР»РµРЅРёСЏ)
    cfg_settle_intensity = (typeof cfg.settle_intensity === 'number') ? cfg.settle_intensity : 1.0;
    if (cfg_settle_intensity < 0) cfg_settle_intensity = 0;

    // settle: РЅР° tizen РїСЂРёРЅСѓРґРёС‚РµР»СЊРЅРѕ 0
    // Р’ РєР°СЂС‚РѕС‡РєРµ (РґРµС‚Р°Р»Рё) РѕСЃРµРґР°РЅРёРµ РїСЂРёРЅСѓРґРёС‚РµР»СЊРЅРѕ РІС‹РєР»СЋС‡Р°РµРј вЂ” РёРЅР°С‡Рµ РІРѕР·РјРѕР¶РЅС‹ Р°СЂС‚РµС„Р°РєС‚С‹
    // (РѕСЃРµРґР°РЅРёРµ РЅР° СЃРєСЂС‹С‚С‹Рµ/РЅРµРІРёРґРёРјС‹Рµ РєР°СЂС‚РѕС‡РєРё Рё СЌР»РµРјРµРЅС‚С‹ РёРЅС‚РµСЂС„РµР№СЃР°).
    var detailsNow = in_details_activity || isDetailsScreen();
    var prev_settle_effective = cfg_settle;
    cfg_settle_user = cfg_tizen ? 0 : (cfg.settle ? 1 : 0);
    cfg_settle = (cfg_settle_user && !detailsNow) ? 1 : 0;
    if (prev_settle_effective && !cfg_settle) {
      clearAccumulationRuntime('settle_off');
    }

    // С‚РёРї СЃРЅРµР¶РёРЅРѕРє
    var next_style = (cfg.flake_style | 0);
    if (next_style < 0) next_style = 0;
    if (next_style > 3) next_style = 3;
    var style_changed = (cfg_flake_style !== next_style);
    cfg_flake_style = next_style;

    // СЃРЅРµРі РІ РєР°СЂС‚РѕС‡РєРµ (РґРµС‚Р°Р»Рё)
    cfg_in_card = cfg.in_card ? 1 : 0;

    // РџСЂРµРґСѓРїСЂРµР¶РґРµРЅРёРµ РґР»СЏ Tizen РїСЂРё РІРєР»СЋС‡РµРЅРёРё "РЎРЅРµР¶РёРЅРєРё/РЎРјРµС€Р°РЅРЅС‹Рµ"
    if (cfg_tizen && (cfg_flake_style === 2 || cfg_flake_style === 3) && !window.__snowfx_tizen_flake_warned__) {
      window.__snowfx_tizen_flake_warned__ = 1;
      try { if (window.Lampa && Lampa.Noty && Lampa.Noty.show) Lampa.Noty.show('Р’РЅРёРјР°РЅРёРµ: СЃРЅРµР¶РёРЅРєРё РЅР° Tizen РјРѕРіСѓС‚ РІС‹Р·С‹РІР°С‚СЊ Р»Р°РіРё'); } catch (e) {}
    }
    if (resetAcc) resetAccumulationHard('apply');

    var size_changed = (Math.abs((prev_size_mult || 1) - (cfg_size_mult || 1)) > 0.001);
    var fall_changed = (Math.abs((prev_fall_mult || 1) - (cfg_fall_mult || 1)) > 0.001);

    if (running) {
      if (style_changed || size_changed) {
        flakes = [];
      } else if (fall_changed) {
        // РјР°СЃС€С‚Р°Р±РёСЂСѓРµРј С‚РµРєСѓС‰СѓСЋ СЃРєРѕСЂРѕСЃС‚СЊ РїР°РґРµРЅРёСЏ Р±РµР· РїРµСЂРµСЃРѕР·РґР°РЅРёСЏ СЃРЅРµР¶РёРЅРѕРє
        var prev = (prev_fall_mult || 1);
        if (!prev || prev <= 0) prev = 1;
        var ratio = (cfg_fall_mult || 1) / prev;
        try {
          for (var i = 0; i < flakes.length; i++) {
            flakes[i].vy *= ratio;
          }
        } catch (e0) {}
      }
      applyFlakeCount(cfg_flakes);
      if (fallCanvas && fallCtx && accCanvas && accCtx) resize();
    }

    if (shouldRunNow()) startEngine();
    else stopEngine();
  }

  // --- watcher (РЅР°СЃС‚СЂРѕР№РєРё/РѕРІРµСЂР»РµР№/РёР·РјРµРЅРµРЅРёСЏ) ---
  var last_enabled = null;
  var last_density = null;
  var last_flake = null;
  var last_settle = null;
  var last_size = null;
  var last_settle_speed = null;
  var last_fall_speed = null;
  var last_shake = null;
  var last_in_card = null;
  var last_overlay = null;

  function startWatcher() {
    setInterval(function () {
      overlay_open = detectOverlayOpen();

      var tizen = isTizen();
      var settleDefault = tizen ? 0 : 1;

      var en = num(storageGet(KEY_ENABLED, 1), 1) | 0;
      var de = num(storageGet(KEY_DENSITY, 0), 0) | 0;
      var fd = tizen ? 1 : 0;
      var fl = num(storageGet(KEY_FLAKE, fd), fd) | 0;
      if (fl < 0) fl = 0;
      if (fl > 3) fl = 3;
      // РќР° Tizen РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ "РўРѕС‡РєРё", РЅРѕ РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ РјРѕР¶РµС‚ РІС‹Р±СЂР°С‚СЊ "РЎРЅРµР¶РёРЅРєРё/РЎРјРµС€Р°РЅРЅС‹Рµ" (СЃ РѕРіСЂР°РЅРёС‡РµРЅРёСЏРјРё)
      if (tizen && fl === 0) fl = 1;
      var se = num(storageGet(KEY_SETTLE, settleDefault), settleDefault) | 0;

      var sz = num(storageGet(KEY_SIZE, 0), 0) | 0;
      if (sz < 0) sz = 0;
      if (sz > 4) sz = 4;
      if (tizen && sz >= 3) sz = 2;

      var ss = num(storageGet(KEY_SETTLE_SPEED, 0), 0) | 0;
      if (ss < 0) ss = 0;
      if (ss > 3) ss = 3;

      var fs = num(storageGet(KEY_FALL_SPEED, 0), 0) | 0;
      if (fs < 0) fs = 0;
      if (fs > 3) fs = 3;

      var sd = (!tizen && isMobileUA()) ? 1 : 0;
      var sh = num(storageGet(KEY_SHAKE, sd), sd) | 0;
      var ic = num(storageGet(KEY_IN_CARD, 0), 0) | 0;
      ic = ic ? 1 : 0;
      var ov = overlay_open ? 1 : 0;

      // С„РѕР»Р»Р±РµРє: РёРЅРѕРіРґР° РїРѕСЃР»Рµ РїР»РµРµСЂР° С„Р»Р°Рі РЅРµ СЃР±СЂР°СЃС‹РІР°РµС‚СЃСЏ (РІРЅРµС€РЅРёР№/РІРЅСѓС‚СЂРµРЅРЅРёР№ РїР»РµРµСЂ)
      var player_fix = 0;
      if (in_player && !document.hidden) {
        if (!detectActuallyInPlayer()) {
          in_player = false;
          player_fix = 1;
        }
      }

      if (en !== last_enabled || de !== last_density || fl !== last_flake || se !== last_settle || sz !== last_size || ss !== last_settle_speed || fs !== last_fall_speed || sh !== last_shake || ic !== last_in_card || ov !== last_overlay || player_fix) {
        last_enabled = en;
        last_density = de;
        last_flake = fl;
        last_settle = se;
        last_size = sz;
        last_settle_speed = ss;
        last_fall_speed = fs;
        last_shake = sh;
        last_in_card = ic;
        last_overlay = ov;
        applyConfigAndState(true);
      }
    }, 650);
  }

  function bindVisibility() {
    try {
      document.addEventListener('visibilitychange', function () {
        overlay_open = detectOverlayOpen();

        // РїСЂРё РІРѕР·РІСЂР°С‚Рµ РёР· РІРЅРµС€РЅРµРіРѕ РїСЂРёР»РѕР¶РµРЅРёСЏ/РїР»РµРµСЂР° РёРЅРѕРіРґР° РЅРµ РїСЂРёС…РѕРґРёС‚ destroy
        var need_reset = false;
        if (!document.hidden) {
          if (in_player && !detectActuallyInPlayer()) {
            in_player = false;
            need_reset = true;
          }
        }

        applyConfigAndState(need_reset);
      }, false);
    } catch (e) {}
  }

  function bindResume() {
    if (window.__snowfx_resume_bound__) return;
    window.__snowfx_resume_bound__ = true;

    var onResume = function () {
      overlay_open = detectOverlayOpen();

      // РќР° resume/focus Р»СѓС‡С€Рµ РїСЂРёРЅСѓРґРёС‚РµР»СЊРЅРѕ РїРµСЂРµСЃРѕР·РґР°РІР°С‚СЊ РєР°РЅРІР°СЃС‹
      if (in_player && !detectActuallyInPlayer()) in_player = false;

      applyConfigAndState(true);
    };

    try { window.addEventListener('focus', onResume, true); } catch (e1) {}
    try { window.addEventListener('pageshow', onResume, true); } catch (e2) {}
    try { document.addEventListener('resume', onResume, true); } catch (e3) {}
  }

  // --- bootstrap ---
  var tries = 0;
  function boot() {
    tries++;

    addSettingsUI();
    bindLampaHooks();
    bindVisibility();
    bindResume();
    bindScrollReset();

    if (!window.__snowfx_watcher_started__) {
      window.__snowfx_watcher_started__ = true;
      startWatcher();
    }

    overlay_open = detectOverlayOpen();
    applyConfigAndState(false);

    try {
      var t = isTizen();
      var sd = (!t && isMobileUA()) ? 1 : 0;
      setShakeEnabled(!!num(storageGet(KEY_SHAKE, sd), sd));
    } catch (e) {}

    if (!window.Lampa && tries < 20) setTimeout(boot, 300);
  }

  boot();
})();

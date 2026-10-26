// Homescreen-Logik. Bewusst ES5-nah gehalten, weil Tizen 5.5 einen alten Chromium hat.
(function () {
  'use strict';

  var CFG = window.HOME_CONFIG;
  var LAYOUTS = [
    { key: 'spotlight', name: 'Spotlight' },
    { key: 'raster',    name: 'Raster' },
    { key: 'minimal',   name: 'Minimal' }
  ];
  var RASTER_COLS = 4;

  // Tasten: Fernbedienung (Tizen-Keycodes) plus Tastatur zum Testen im Browser
  var K = { LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, ENTER: 13, BACK: 10009, RED: 403, GREEN: 404, YELLOW: 405, BLUE: 406 };

  var state = load();
  var focus = 0;          // Index der fokussierten Kachel
  var settingsOpen = false;
  var sFocus = { row: 0, col: 0 };

  var $ = function (id) { return document.getElementById(id); };

  // ---------- Einstellungen merken ----------
  function load() {
    var s = { layout: 'spotlight', bg: 0, clock: true };
    try {
      var raw = localStorage.getItem('tvhome');
      if (raw) { var p = JSON.parse(raw); for (var k in p) s[k] = p[k]; }
    } catch (e) {}
    return s;
  }
  function save() { try { localStorage.setItem('tvhome', JSON.stringify(state)); } catch (e) {} }

  // ---------- Darstellung ----------
  function renderTiles() {
    var box = $('tiles');
    box.innerHTML = '';
    CFG.apps.forEach(function (app, i) {
      var t = document.createElement('div');
      t.className = 'tile' + (i === focus ? ' focus' : '');
      t.style.background = app.color;
      t.innerHTML = '<div class="face"><span class="mono"></span></div><div class="label"></div>';
      t.querySelector('.mono').textContent = app.short;
      t.querySelector('.label').textContent = app.name;
      t.addEventListener('click', function () { focus = i; updateFocus(); launch(app); });
      box.appendChild(t);
    });
    updateFocus();
  }

  function updateFocus() {
    var tiles = $('tiles').children;
    for (var i = 0; i < tiles.length; i++) tiles[i].className = 'tile' + (i === focus ? ' focus' : '');
    $('spot-name').textContent = CFG.apps[focus] ? CFG.apps[focus].name : '';
  }

  function applyLayout() {
    var cls = 'layout-' + state.layout + (state.clock ? '' : ' no-clock');
    document.body.className = cls;
  }

  function applyBackground() {
    var b = CFG.backgrounds[state.bg] || CFG.backgrounds[0];
    var el = $('bg');
    el.style.background = b.image ? 'url("' + b.image + '") center / cover no-repeat' : b.css;
    el.className = b.anim || '';
  }

  function tick() {
    var d = new Date();
    var h = d.getHours();
    $('clock').textContent = pad(h) + ':' + pad(d.getMinutes());
    $('date').textContent = d.toLocaleDateString('de-AT', { weekday: 'long', day: 'numeric', month: 'long' });
    $('greeting').textContent = h < 5 ? 'Gute Nacht' : h < 11 ? 'Guten Morgen' : h < 18 ? 'Hallo' : 'Guten Abend';
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  var toastTimer;
  function toast(msg) {
    var t = $('toast');
    t.textContent = msg;
    t.className = 'show';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.className = ''; }, 2200);
  }

  // ---------- Apps starten ----------
  // Die Seite läuft bei TizenBrew als Webseite ohne tizen-API.
  // Apps startet deshalb der Hintergrunddienst des Moduls (service.js).
  var SERVICE = 'http://127.0.0.1:8095';

  function launch(app) {
    if (app.id === 'tv') {
      toast('Zum Fernsehen: Zurück-Taste gedrückt halten');
      return;
    }
    toast('Starte ' + app.name + ' …');
    fetch(SERVICE + '/launch?id=' + encodeURIComponent(app.id))
      .then(function (r) { return r.json(); })
      .then(function (j) { if (!j.ok) toast(app.name + ': ' + j.error); })
      .catch(function () { toast('Dienst nicht erreichbar – TizenBrew neu starten'); });
  }

  // Gelbe Taste: zurück ins TizenBrew-Menü (z.B. für Autolaunch-Einstellungen)
  function backToTizenBrew() {
    if (history.length > 1) history.back();
    else toast('TizenBrew neu öffnen, um ins Menü zu kommen');
  }

  // ---------- Einstellungs-Panel ----------
  function settingsRows() {
    return [
      { id: 'row-layout', items: LAYOUTS.map(function (l) { return { label: l.name, active: state.layout === l.key, pick: function () { state.layout = l.key; applyLayout(); } }; }) },
      { id: 'row-bg', items: CFG.backgrounds.map(function (b, i) { return { label: b.name, swatch: b, active: state.bg === i, pick: function () { state.bg = i; applyBackground(); } }; }) },
      { id: 'row-clock', items: [
        { label: 'Anzeigen', active: state.clock, pick: function () { state.clock = true; applyLayout(); } },
        { label: 'Ausblenden', active: !state.clock, pick: function () { state.clock = false; applyLayout(); } }
      ] }
    ];
  }

  function renderSettings() {
    settingsRows().forEach(function (row, r) {
      var el = $(row.id);
      el.innerHTML = '';
      row.items.forEach(function (it, c) {
        var o = document.createElement('div');
        o.className = 'opt' + (it.active ? ' active' : '') + (r === sFocus.row && c === sFocus.col ? ' focus' : '');
        if (it.swatch) {
          var sw = document.createElement('span');
          sw.className = 'sw';
          sw.style.background = it.swatch.image ? 'url("' + it.swatch.image + '") center / cover' : it.swatch.css;
          o.appendChild(sw);
        }
        o.appendChild(document.createTextNode(it.label));
        o.addEventListener('click', function () { sFocus = { row: r, col: c }; it.pick(); save(); renderSettings(); });
        el.appendChild(o);
      });
    });
  }

  function openSettings(open) {
    settingsOpen = open;
    $('settings').className = open ? '' : 'hidden';
    if (open) { sFocus = { row: 0, col: 0 }; renderSettings(); }
  }

  function settingsKey(code) {
    var rows = settingsRows();
    var len = rows[sFocus.row].items.length;
    if (code === K.LEFT) sFocus.col = Math.max(0, sFocus.col - 1);
    else if (code === K.RIGHT) sFocus.col = Math.min(len - 1, sFocus.col + 1);
    else if (code === K.UP) sFocus.row = Math.max(0, sFocus.row - 1);
    else if (code === K.DOWN) sFocus.row = Math.min(rows.length - 1, sFocus.row + 1);
    else if (code === K.ENTER) { rows[sFocus.row].items[sFocus.col].pick(); save(); }
    else if (code === K.BACK || code === K.BLUE) { openSettings(false); return; }
    sFocus.col = Math.min(sFocus.col, settingsRows()[sFocus.row].items.length - 1);
    renderSettings();
  }

  // ---------- Navigation ----------
  function homeKey(code) {
    var n = CFG.apps.length;
    var grid = state.layout === 'raster';
    if (code === K.LEFT) focus = Math.max(0, focus - 1);
    else if (code === K.RIGHT) focus = Math.min(n - 1, focus + 1);
    else if (code === K.UP && grid) focus = Math.max(0, focus - RASTER_COLS);
    else if (code === K.DOWN && grid) focus = Math.min(n - 1, focus + RASTER_COLS);
    else if (code === K.ENTER) { launch(CFG.apps[focus]); return; }
    else if (code === K.RED) { cycleLayout(); return; }
    else if (code === K.GREEN) { state.bg = (state.bg + 1) % CFG.backgrounds.length; applyBackground(); save(); toast(CFG.backgrounds[state.bg].name); return; }
    else if (code === K.BLUE) { openSettings(true); return; }
    else if (code === K.YELLOW) { backToTizenBrew(); return; }
    else return;
    updateFocus();
  }

  function cycleLayout() {
    var i = 0;
    for (var j = 0; j < LAYOUTS.length; j++) if (LAYOUTS[j].key === state.layout) i = j;
    state.layout = LAYOUTS[(i + 1) % LAYOUTS.length].key;
    applyLayout(); save(); toast(LAYOUTS[(i + 1) % LAYOUTS.length].name);
  }

  // Tastatur-Ersatz für Tests am PC: Esc/Backspace = Zurück, r/g/y/b = Farbtasten
  var KEYBOARD = { 27: K.BACK, 8: K.BACK, 82: K.RED, 71: K.GREEN, 89: K.YELLOW, 66: K.BLUE };

  document.addEventListener('keydown', function (e) {
    var code = KEYBOARD[e.keyCode] || e.keyCode;
    if (settingsOpen) settingsKey(code); else homeKey(code);
    if (code !== K.BACK || settingsOpen) e.preventDefault();
  });

  // Farbtasten anmelden (TizenBrew macht das über package.json, doppelt schadet nicht)
  try {
    ['ColorF0Red', 'ColorF1Green', 'ColorF2Yellow', 'ColorF3Blue'].forEach(function (k) { tizen.tvinputdevice.registerKey(k); });
  } catch (e) {}

  // ---------- Start ----------
  applyLayout();
  applyBackground();
  renderTiles();
  tick();
  setInterval(tick, 10000);
})();

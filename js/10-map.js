/* Żbików — Historia na mapie: Mapa, style map, nakładka 1944, znaczniki i skupiska.
 * Pliki js/ ładują się po kolei i dzielą jeden zakres globalny (kolejność ma znaczenie). */
// --- Map setup ---
// Keyboard-focusable divIcon markers are role=button with no name; `ariaLabel` gives them one
// (unlike `title`, it adds no native tooltip on top of the Leaflet one). Re-applied when setIcon rebuilds the icon.
var initMarkerIcon = L.Marker.prototype._initIcon;
L.Marker.prototype._initIcon = function(){
  initMarkerIcon.call(this);
  var label = this.options.ariaLabel || (this.getChildCount ? t('Skupisko punktów: ') + this.getChildCount() : '');   // getChildCount: a markercluster group
  if (label && this._icon) this._icon.setAttribute('aria-label', label);
};
// Leaflet only turns Enter into a click for markers with a popup; ours open cards instead
L.Marker.addInitHook(function(){
  this.on('keypress', function(e){ if (e.originalEvent && e.originalEvent.keyCode === 13 && !this.getChildCount) this.fire('click', e); });
});
var map = L.map('map', { zoomControl: false, attributionControl: true });
map.attributionControl.addAttribution('Wersja demonstracyjna · &copy; Tomasz Wrotek, wszelkie prawa zastrzeżone');
// On narrow screens the attribution wraps; publish its height so the bottom bar can sit above it
(function(){
  var el = map.attributionControl.getContainer();
  function sync(){ document.documentElement.style.setProperty('--attr-h', el.offsetHeight + 'px'); }
  if (window.ResizeObserver) new ResizeObserver(sync).observe(el);
  sync();
})();
var mapEl = $('map');
var osmAttr = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
var MAP_STYLES = {
  kolorowa: { name: 'Kolorowa', cls: '', swatch: 'linear-gradient(135deg,#F2EFE9 0 40%,#FCE38A 40% 55%,#8FD694 55% 75%,#7FB8F0 75%)',
    layer: function(){ return L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', { subdomains: 'abc', maxZoom: 20, attribution: osmAttr + ' · styl: OpenStreetMap France' }); } },
  pastelowa: { name: 'Pastelowa', cls: '', swatch: 'linear-gradient(135deg,#F4F1E8 0 45%,#D9E6B8 45% 62%,#E7D3C4 62% 80%,#BFDCE6 80%)',
    layer: function(){ return L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', { subdomains: 'abc', maxZoom: 20, attribution: osmAttr + ' · styl: Humanitarian OSM Team' }); } },
  ciepla: { name: 'Ciepła', cls: '', swatch: 'linear-gradient(135deg,#F3E7C9 0 45%,#F0C9A0 45% 62%,#FFFFFF 62% 72%,#E4D7B8 72%)',
    layer: function(){ return L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, attribution: 'Tiles &copy; Esri — Source: Esri, HERE, Garmin, USGS, Intermap, INCREMENT P, NRCan, Esri Japan, METI, Esri China (Hong Kong), Esri Korea, Esri (Thailand), NGCC, &copy; OpenStreetMap contributors, and the GIS User Community' }); } },
  klasyczna: { name: 'OSM', cls: '', swatch: 'linear-gradient(135deg,#F2EFE9 0 40%,#F9B29C 40% 55%,#ADD19E 55% 75%,#AAD3DF 75%)',
    layer: function(){ return L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: osmAttr }); } },
  ciemna: { name: 'Ciemna', cls: 'tiles-dark', swatch: 'linear-gradient(135deg,#1B2B34 0 45%,#34505E 45% 65%,#22404C 65%)',
    layer: function(){ return L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: osmAttr }); } },
  vintage: { name: 'Vintage', cls: 'tiles-vintage', swatch: 'linear-gradient(135deg,#EBDDC0 0 45%,#C9A97A 45% 62%,#B9B08A 62% 80%,#D7C29B 80%)',
    layer: function(){ return L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: osmAttr }); } },
  satelita: { name: 'Satelita', cls: '', swatch: 'linear-gradient(135deg,#3E4F2E 0 35%,#6B6A4A 35% 60%,#2F3A2A 60%)',
    layer: function(){ return L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, attribution: 'Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community' }); } }
};
var THEMES = {
  noc: { name: 'Nocny', swatch: 'linear-gradient(90deg,#0F2C44 0 55%,#FFB23E 55% 78%,#FF5A5F 78%)', meta: '#0F2C44' },
  dzien: { name: 'Jasny', swatch: 'linear-gradient(90deg,#FBF7F0 0 55%,#E4572E 55% 78%,#D7263D 78%)', meta: '#FBF7F0' },
  vintage: { name: 'Vintage', swatch: 'linear-gradient(90deg,#F2E8D5 0 55%,#A8472A 55% 78%,#8E2C1F 78%)', meta: '#F2E8D5' },
  morski: { name: 'Morski', swatch: 'linear-gradient(90deg,#1C4552 0 55%,#D98F45 55% 78%,#C23B30 78%)', meta: '#1C4552' }
};
function store(k, v){ try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
var qs = new URLSearchParams(location.search);
var baseLayer = null, mapStyle = null, lastNonSat = 'kolorowa';
function setMapStyle(key, persist){
  if (!MAP_STYLES[key]) key = 'kolorowa';
  var st = MAP_STYLES[key];
  if (baseLayer) map.removeLayer(baseLayer);
  baseLayer = st.layer().addTo(map);
  baseLayer.bringToBack();
  mapEl.classList.remove('tiles-dark', 'tiles-vintage');
  if (st.cls) mapEl.classList.add(st.cls);
  mapStyle = key;
  if (key !== 'satelita') lastNonSat = key;
  var shown = MAP_STYLES[lastNonSat];
  $('style-name').textContent = shown.name.toUpperCase();
  $('style-sw').style.background = shown.swatch;
  document.querySelectorAll('#sm-maps button').forEach(function(b){ b.setAttribute('aria-pressed', String(key !== 'satelita' && b.dataset.map === key)); });
  $('sat-btn').setAttribute('aria-pressed', String(key === 'satelita'));
  if (persist !== false){ store('zbikow-map', lastNonSat); store('zbikow-sat', key === 'satelita' ? '1' : '0'); }
}
function setTheme(key, persist){
  if (!THEMES[key]) key = 'noc';
  document.documentElement.setAttribute('data-theme', key);
  document.querySelector('meta[name="theme-color"]').setAttribute('content', THEMES[key].meta);
  document.querySelectorAll('#sm-themes button').forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.theme === key)); });
  if (persist !== false) store('zbikow-theme', key);
  if (typeof activeRoute !== 'undefined' && activeRoute) drawRoute(activeRoute);
}
// Satellite has its own toggle button, so the menu lists only the drawn map styles.
$('sm-maps').innerHTML = Object.keys(MAP_STYLES).filter(function(k){ return k !== 'satelita'; }).map(function(k){
  return '<button data-map="' + k + '"><span class="sw" style="background:' + MAP_STYLES[k].swatch + '"></span>' + MAP_STYLES[k].name + '</button>';
}).join('');
$('sm-themes').innerHTML = Object.keys(THEMES).map(function(k){
  return '<button data-theme="' + k + '"><span class="sw" style="background:' + THEMES[k].swatch + '"></span>' + THEMES[k].name + '</button>';
}).join('');
$('sat-btn').addEventListener('click', function(e){
  e.stopPropagation();
  setMapStyle(mapStyle === 'satelita' ? lastNonSat : 'satelita');
});
var styleMenu = $('style-menu'), styleBtn = $('style-btn');
function toggleStyleMenu(open){
  styleMenu.classList.toggle('open', open);
  styleBtn.setAttribute('aria-expanded', String(open));
}
styleBtn.addEventListener('click', function(e){ e.stopPropagation(); toggleStyleMenu(!styleMenu.classList.contains('open')); });
styleMenu.addEventListener('click', function(e){
  e.stopPropagation();
  var b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.map) setMapStyle(b.dataset.map);
  if (b.dataset.theme) setTheme(b.dataset.theme);
  if (b.dataset.text) setTextSize(b.dataset.text);
  if (b.dataset.lang && b.dataset.lang !== LANG){ store('zbikow-lang', b.dataset.lang); location.reload(); }
});
document.addEventListener('click', function(){ toggleStyleMenu(false); });
// Esc with the menu open closes only the menu (registered first, so it can stop the sheet handler below)
document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && styleMenu.classList.contains('open')){ toggleStyleMenu(false); e.stopImmediatePropagation(); } });
// First visit: follow the device's light/dark preference; afterwards the chosen theme
var prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
// ?theme= / ?map= in a shared link apply to this visit only; they never overwrite the visitor's own choice
if (qs.get('theme')) setTheme(qs.get('theme'), false); else setTheme(store('zbikow-theme') || (prefersLight ? 'dzien' : 'noc'));
function setTextSize(k){
  k = k === 'big' ? 'big' : 'normal';
  document.documentElement.setAttribute('data-text', k);
  document.querySelectorAll('#sm-text button').forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.text === k)); });
  store('zbikow-text', k);
}
setTextSize(store('zbikow-text'));
lastNonSat = MAP_STYLES[store('zbikow-map')] && store('zbikow-map') !== 'satelita' ? store('zbikow-map') : 'kolorowa';
if (qs.get('map')) setMapStyle(qs.get('map'), false); else setMapStyle(store('zbikow-sat') === '1' ? 'satelita' : lastNonSat);

// 1944 aerial overlay (georeferenced in MapWarper), on its own pane so the tile filters
// above (which only target the base map pane) never touch it.
map.createPane('pane1944');
map.getPane('pane1944').style.zIndex = 350;   // above the base tiles (200), below route/war/bus lines (400)
var slider = $('opacity-slider');
// Extent of the georeferenced photo (MapWarper API, map 112543): outside it there is nothing to show
var BOUNDS_1944 = L.latLngBounds([52.1315061, 20.7500685], [52.2018091, 20.8610813]);
var layer1944 = L.tileLayer('https://mapwarper.net/maps/tile/112543/{z}/{x}/{y}.png', {
  pane: 'pane1944', opacity: 1 - parseFloat(slider.value), maxZoom: 19, maxNativeZoom: 17, bounds: BOUNDS_1944,
  attribution: 'Zdjęcie lotnicze 1944, zgeoreferencowane w MapWarper'
});
var frame1944 = L.rectangle(BOUNDS_1944, { color: '#D98F45', weight: 1.5, dashArray: '6 6', fill: false, interactive: false });
function in1944(ll){ return !!ll && BOUNDS_1944.contains(ll); }
// Slider is oriented "1944" (left) -> "dziś" (right); its value represents how far toward
// "today" you've dragged, so the 1944 layer's opacity is the inverse of that value.
slider.addEventListener('input', function(){ layer1944.setOpacity(1 - parseFloat(slider.value)); });

var btn1944 = $('btn-1944');
function set1944(on){
  if (on && !map.hasLayer(layer1944)){ layer1944.addTo(map); frame1944.addTo(map); }
  if (!on && map.hasLayer(layer1944)){ map.removeLayer(layer1944); map.removeLayer(frame1944); }
  $('opacity-ctrl').classList.toggle('show', on);
  $('ov-btn').setAttribute('aria-pressed', String(on));
  btn1944.setAttribute('aria-pressed', String(on));
  btn1944.querySelector('span').textContent = on ? t('Wróć do mapy współczesnej') : t('Zobacz na zdjęciu z 1944');
}

$('ov-btn').addEventListener('click', function(e){
  e.stopPropagation();
  var on = !map.hasLayer(layer1944);
  set1944(on);
  if (on && !BOUNDS_1944.intersects(map.getBounds())){ map.fitBounds(BOUNDS_1944, { padding: [40, 40] }); showToast('Zdjęcie z 1944 r. obejmuje Żbików i Pruszków — przesunięto mapę na jego zasięg (przerywana ramka).'); }
});

$('zoom-in').addEventListener('click', function(){ map.zoomIn(); });
$('zoom-out').addEventListener('click', function(){ map.zoomOut(); });

// --- Markers: one per historical record. Records that share an address sit on the same point;
// the cluster layer shows them as one red numbered marker and fans them out ("spiderfy") on click.
function pinIcon(hasPh, hasFeat, approx){
  return L.divIcon({ className: '', html: '<div class="marker-pin' + (hasPh ? ' has-photo' : '') + (hasFeat ? ' has-feat' : '') + (approx ? ' approx' : '') + '"><i></i></div>', iconSize: [24,24], iconAnchor: [12,12] });
}
function groupIcon(n){
  return L.divIcon({ className: '', html: '<div class="marker-group">' + n + '</div>', iconSize: [30,30], iconAnchor: [15,15] });
}
function samePoint(ms){
  var a = ms[0].getLatLng();
  return ms.every(function(m){ return m.getLatLng().equals(a); });
}

var hasCluster = typeof L.markerClusterGroup === 'function';
function clusterIcon(n){
  return L.divIcon({ className: '', html: '<div class="cluster"><span>' + n + '</span></div>', iconSize: [40,40], iconAnchor: [20,20] });
}
// Shared by the main map and the war layers: stacked records fan out ("spiderfy") on click.
function makeClusterLayer(sameIcon, multiIcon){
  if (!hasCluster) return L.layerGroup();
  return L.markerClusterGroup({
    showCoverageOnHover: false,
    // Close up, only records at the very same address stay grouped.
    maxClusterRadius: function(z){ return z >= 17 ? 6 : 40; },
    spiderfyDistanceMultiplier: 1.7,
    spiderLegPolylineOptions: { color: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#FFB23E', weight: 1.5, opacity: 0.85 },
    iconCreateFunction: function(cluster){
      var ms = cluster.getAllChildMarkers();
      return samePoint(ms) ? sameIcon(ms.length, ms) : (multiIcon || clusterIcon)(ms.length);
    }
  });
}
var markerLayer = makeClusterLayer(groupIcon);

var markers = {}, bounds = [], placeByKey = {};
function llKey(ll){ return ll.lat.toFixed(7) + ',' + ll.lng.toFixed(7); }
PLACES.forEach(function(p){
  var recs = p.isGroup ? p.members : [p];
  placeByKey[llKey(L.latLng(p.lat, p.lng))] = p;
  recs.forEach(function(r){
    var hasPh = !!(PHOTOS[r.origId] && PHOTOS[r.origId].length);
    var hasFeat = !!(ARTIFACTS[r.origId] && ARTIFACTS[r.origId].length);
    var marker = L.marker([p.lat, p.lng], { icon: pinIcon(hasPh, hasFeat, !!(r.approx || p.approx)), keyboard: true, title: '', ariaLabel: r.name });
    marker.bindTooltip(esc(r.name) + (hasPh ? ' 📷' : '') + (hasFeat ? ' ⚙' : ''), { className: 'tt', direction: 'top', offset: [0, -12] });
    marker.on('click', function(){ openRecord(r.origId); });
    markerLayer.addLayer(marker);
    markers[r.origId] = marker;
  });
  bounds.push([p.lat, p.lng]);
});
if (hasCluster){
  // Name the address when hovering a stacked group.
  markerLayer.on('clustermouseover', function(e){
    var ms = e.layer.getAllChildMarkers();
    if (!samePoint(ms)) return;
    var p = placeByKey[llKey(ms[0].getLatLng())];
    if (!p) return;
    e.layer.bindTooltip(esc(p.groupName || p.address) + ' · ' + ms.length + ' obiekty — kliknij, aby rozłożyć',
      { className: 'tt', direction: 'top', offset: [0, -16] }).openTooltip();
  });
}
markerLayer.addTo(map);
var allBounds = L.latLngBounds(bounds);
function fitAll(){
  // Phones: a thin side margin (60 px each side would leave too little width and zoom out a whole level);
  // top and bottom leave room for the toolbars over the map.
  if (window.innerWidth <= 480) map.fitBounds(allBounds, { paddingTopLeft: [12, 70], paddingBottomRight: [12, 90] });
  else map.fitBounds(allBounds, { padding: [60,60] });
}
fitAll();
$('zoom-all').addEventListener('click', fitAll);
$('brand').addEventListener('click', function(){ closeSheets(); fitAll(); });

var activeOrig = null;
function setActiveMarker(orig){
  var old = activeOrig != null && markers[activeOrig];
  if (old && old._icon) old._icon.classList.remove('is-active');
  activeOrig = orig;
  var m = orig != null && markers[orig];
  if (m && m._icon){ m._icon.classList.add('is-active'); m.setZIndexOffset(1000); }
}
// Marker DOM is recreated when clusters change; re-apply the highlight.
map.on('zoomend moveend', function(){ if (activeOrig != null) setActiveMarker(activeOrig); });
if (hasCluster) markerLayer.on('animationend spiderfied', function(){ if (activeOrig != null) setActiveMarker(activeOrig); });

// Map centre that keeps a point visible next to the side panel / above the bottom sheet.
function offsetCenter(ll, z){
  if (!panel.classList.contains('open')) return ll;
  var pt = map.project(ll, z);
  pt = bottomSheets() ? pt.add([0, sheetPad(panel) / 2 - 20]) : pt.add([panel.offsetWidth / 2, 0]);
  return map.unproject(pt, z);
}
// Height of a bottom sheet for map padding, capped so an expanded sheet never swallows the whole viewport
function sheetPad(el){ return Math.min(el.offsetHeight, Math.round(map.getSize().y * 0.55)); }
// Run fn once the current map move ends. A newer request replaces an older one: a flyTo cut short by
// another never fires its own moveend, so the old callback would otherwise act on the wrong marker.
var pendingMoveEnd = null;
function onMoveEnd(fn){
  if (pendingMoveEnd) map.off('moveend', pendingMoveEnd);
  pendingMoveEnd = fn ? function(){ pendingMoveEnd = null; fn(); } : null;   // onMoveEnd(null) just cancels
  if (fn) map.once('moveend', pendingMoveEnd);
}
// Bring a record's marker into view; if it shares an address, fan the group out.
function revealMarker(orig, cb){ revealIn(markerLayer, markers[orig], cb); }
function revealIn(layer, m, cb, minZ){
  if (!m) return;
  minZ = minZ || 17;
  var z = Math.max(map.getZoom(), minZ);
  function spread(){
    // flyTo's own _stop() fires a synchronous moveend while an earlier pan is still running; wait one more
    if ((map._animatingZoom || map._flyToFrame) && !spread.retried){ spread.retried = true; onMoveEnd(spread); return; }
    if (hasCluster && layer._inZoomAnimation){ layer.once('animationend', spread); return; }
    var parent = hasCluster ? layer.getVisibleParent(m) : m;
    if (parent && parent !== m && parent.spiderfy && layer._spiderfied !== parent){
      layer.once('spiderfied', cb);
      parent.spiderfy();
    } else cb();
  }
  if (m._icon && map.getZoom() >= minZ){ onMoveEnd(null); map.panTo(offsetCenter(m.getLatLng(), z)); cb(); return; }
  map.flyTo(offsetCenter(m.getLatLng(), z), z, { duration: 0.5 });
  onMoveEnd(spread);   // armed after flyTo, so the synchronous moveend of an interrupted move is not consumed
}

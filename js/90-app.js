/* Żbików — Historia na mapie: Okna dialogowe, klawiatura, zegar, ekran powitalny, start.
 * Pliki js/ ładują się po kolei i dzielą jeden zakres globalny (kolejność ma znaczenie). */
// --- Info dialog ---
var info = $('info');
$('stats').innerHTML =
  '<div class="stat"><b>' + totalAll + '</b><span>obiektów w bazie</span></div>' +
  '<div class="stat"><b>' + totalMapped + '</b><span>z dokładnym adresem</span></div>' +
  '<div class="stat"><b>' + PLACES.length + '</b><span>punktów na mapie</span></div>';
$('info-btn').addEventListener('click', function(){ if (info.showModal) info.showModal(); else info.setAttribute('open', ''); });
$('close-info').addEventListener('click', function(){ info.close ? info.close() : info.removeAttribute('open'); });
info.addEventListener('click', function(e){ if (e.target === info) info.close(); });

// --- Keyboard & map interactions ---
document.addEventListener('keydown', function(e){
  var typing = /INPUT|TEXTAREA/.test(document.activeElement.tagName);
  if (cz.open || welcome.open) return;
  if (e.key === '/' && !typing && !info.open){ e.preventDefault(); searchInput.focus(); }
  else if (e.key === 'Escape' && !info.open){
    var lf = $('list-filter');
    if (document.activeElement === lf && lf.value){ lf.value = ''; lf.dispatchEvent(new Event('input')); return; }   // first Esc clears the filter
    if (routesSheet.classList.contains('open')){ routesSheet.classList.remove('open'); syncBodyState(); }
    else if (warSheet.classList.contains('open')) closeWarSheet();
    else if (nearSheet.classList.contains('open')) closeNear();
    else if (panel.classList.contains('open')) closeSheets();
    else if (placesList.classList.contains('open')){ placesList.classList.remove('open'); syncBodyState(); }
  }
});
map.on('click', function(){ if (mobileMQ.matches) closeSheets(); });

// Swipe down on the sheet header to close on mobile.
[panel, placesList, routesSheet, warSheet, nearSheet].forEach(function(sheet){
  var y0 = null;
  var handle = sheet.querySelector('.sheet-head');
  handle.addEventListener('touchstart', function(e){ y0 = e.touches[0].clientY; }, { passive: true });
  function shut(){
    if (sheet === panel) closeSheets(); else if (sheet === warSheet) closeWarSheet(); else { sheet.classList.remove('open'); syncBodyState(); }
  }
  handle.addEventListener('touchend', function(e){
    if (y0 === null) return;
    var dy = e.changedTouches[0].clientY - y0;
    y0 = null;
    if (e.target.closest('button')) return;
    if (!bottomSheets()){ if (dy > 60) shut(); return; }   // side sheets (landscape, tablets) have no expanded state
    if (dy < -40) sheet.classList.add('expanded');
    else if (dy > 60){ if (sheet.classList.contains('expanded')) sheet.classList.remove('expanded'); else shut(); }
    else if (Math.abs(dy) < 8) sheet.classList.toggle('expanded');
  });
  var grab = sheet.querySelector('.grabber');
  if (grab) grab.addEventListener('click', function(){ sheet.classList.toggle('expanded'); });
});

// --- Clock: what is shown as "za 5 min" / "otwarte do" must not freeze at the moment it was drawn ---
function tickClock(){
  if (document.hidden) return;
  if (current && current.kind === 'stop' && panel.classList.contains('open')){
    var box = $('deps-box'), st = stopById[current.stopId];
    if (box && st) box.innerHTML = depsHTML(st);
  }
  if (POI && mode === 'modern'){
    if (nearSheet.classList.contains('open')){ var y = nearBody.scrollTop; renderNear(); nearBody.scrollTop = y; }
    if (map.hasLayer(poiLayer)) showPoiLayer();
  }
}
setInterval(tickClock, 60000);
document.addEventListener('visibilitychange', function(){ if (!document.hidden) tickClock(); });

// --- Welcome screen: once, on a first visit without a deep link ---
var welcome = $('welcome');
function openWelcome(){ if (welcome.showModal) welcome.showModal(); else welcome.setAttribute('open', ''); }
function closeWelcome(){ store('zbikow-welcome', '1'); if (welcome.open) welcome.close(); }
$('wl-start').addEventListener('click', closeWelcome);
welcome.addEventListener('close', function(){ store('zbikow-welcome', '1'); });
welcome.addEventListener('click', function(e){
  if (e.target === welcome){ closeWelcome(); return; }
  var b = e.target.closest('button[data-go]');
  if (!b) return;
  closeWelcome();
  var go = b.dataset.go;
  if (go === 'ww2') setMode('ww2');
  else document.querySelector('.seg-btn[data-layer="' + go + '"]').click();
});
$('show-welcome').addEventListener('click', function(){ if (info.open) info.close(); openWelcome(); });

document.querySelector('.skip-link').addEventListener('click', function(e){ e.preventDefault(); $('view-bar').focus(); });
// Offline / fast repeat visits: the page, data and thumbnails are cached by sw.js (not on file://)
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)){
  navigator.serviceWorker.register('sw.js').catch(function(){});
}
var deepLinked = readHash();
if (!deepLinked && !location.hash && store('zbikow-welcome') !== '1') openWelcome();

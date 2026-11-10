/* Żbików — Historia na mapie: Trasy spacerowe i „Gdzie jestem?”.
 * Pliki js/ ładują się po kolei i dzielą jeden zakres globalny (kolejność ma znaczenie). */
// --- Walking routes (TRASY) ---
var routesBody = $('routes-body');
var routeById = {};
ROUTES.forEach(function(r){ routeById[r.id] = r; });
map.createPane('routeStops');
map.getPane('routeStops').style.zIndex = 640;
var routeLayer = L.layerGroup().addTo(map);
var activeRoute = null;

function recLatLng(orig){
  var r = recordByOrig[orig];
  return r && r.place ? L.latLng(r.place.lat, r.place.lng) : null;
}
function routeStopName(r, i){
  var rec = recordByOrig[r.stops[i]];
  return rec ? rec.item.name : '';
}
function routeMeta(r){
  return String(r.km).replace('.', ',') + t(' km · ok. ') + r.minutes + t(' min · ') + r.stops.length + t(' przystanków');
}
function renderRoutesList(){
  $('routes-kicker').textContent = t('Trasy spacerowe');
  $('routes-title').textContent = t('Wybierz trasę');
  routesBody.innerHTML = '<ul class="route-cards">' + ROUTES.map(function(r){
    return '<li><button data-route="' + r.id + '" style="--rc:' + r.color + '">' +
      '<span class="rc-bar" aria-hidden="true"></span><span class="rc-text"><b>' + esc(r.name) + '</b>' +
      '<small>' + routeMeta(r) + '</small><span>' + esc(r.desc) + '</span></span></button></li>';
  }).join('') + '</ul>';
}
function gmapsUrl(r){
  var pts = r.stops.map(recLatLng).filter(Boolean).map(function(ll){ return ll.lat.toFixed(6) + ',' + ll.lng.toFixed(6); });
  var mid = pts.slice(1, -1);
  // Google Maps accepts at most 9 waypoints.
  if (mid.length > 9){ var step = mid.length / 9, s = []; for (var i = 0; i < 9; i++) s.push(mid[Math.floor(i * step)]); mid = s; }
  return 'https://www.google.com/maps/dir/?api=1&travelmode=walking&origin=' + pts[0] + '&destination=' + pts[pts.length - 1] +
    (mid.length ? '&waypoints=' + encodeURIComponent(mid.join('|')) : '');
}
function renderRouteDetail(r){
  $('routes-kicker').textContent = t('Trasa spacerowa');
  $('routes-title').textContent = r.name;
  var stopsHTML = r.stops.map(function(o, i){
    var rec = recordByOrig[o];
    return '<li><button data-stop="' + i + '"><span class="num" style="background:' + r.color + '">' + (i + 1) + '</span><span>' + esc(rec.item.name) +
      (PHOTOS[o] ? camSvg : '') + '<small>' + esc(rec.place.address) + '<span class="dist" data-dist-stop="' + i + '"></span></small></span></button></li>';
  }).join('');
  var extrasHTML = r.extras.map(function(o){
    var rec = recordByOrig[o];
    if (!rec) return '';
    var sub = rec.place ? rec.place.address + t(' · poza trasą') : (rec.item.locationDesc || '') + t(' · bez dokładnej lokalizacji');
    return '<li><button data-orig="' + o + '"><span class="ind' + (rec.place ? '' : ' off') + '" aria-hidden="true"></span><span>' + esc(rec.item.name) +
      '<small>' + esc(sub) + '</small></span></button></li>';
  }).join('');
  routesBody.innerHTML = '<div class="panel-inner">' +
    '<div class="route-head" style="--rc:' + r.color + '"><span class="rc-bar" aria-hidden="true"></span><div><div class="route-meta">' + routeMeta(r) + '</div>' +
    '<p class="desc">' + esc(r.desc) + '</p></div></div>' +
    '<div class="route-actions">' +
      '<button class="btn primary" id="route-start">' + t('Zacznij od przystanku 1') + '</button>' +
      '<a class="btn" href="' + esc(gmapsUrl(r)) + '" target="_blank" rel="noopener">' + t('Nawiguj w Google Maps') + '</a>' +
      '<button class="btn" id="route-locate" aria-pressed="' + String(!!geoWatch) + '">' + (geoWatch ? t('Ukryj moją pozycję') : t('Gdzie jestem?')) + '</button>' +
    '</div>' +
    transitRouteHTML(r) +
    '<div><div class="section-label">' + t('Przystanki') + '</div><ol class="stops">' + stopsHTML + '</ol></div>' +
    (extrasHTML ? '<div><div class="section-label">' + t('Powiązane miejsca') + '</div><ul class="sibs extras">' + extrasHTML + '</ul></div>' : '') +
    '<div class="route-foot"><button class="btn" id="route-all">' + t('← Wszystkie trasy') + '</button><button class="btn" id="route-print">' + t('Drukuj trasę') + '</button><button class="btn" id="route-end">' + t('Zakończ trasę') + '</button></div>' +
    '<p class="print-only">' + t('Mapa z trasą: ') + '' + esc(location.origin + location.pathname + '#t=' + r.id) + '</p>' +
    '</div>';
}
function drawRoute(r){
  routeLayer.clearLayers();
  L.polyline(r.geometry, { color: getComputedStyle(document.documentElement).getPropertyValue('--casing').trim(), weight: 9, opacity: 1, interactive: false }).addTo(routeLayer);
  L.polyline(r.geometry, { color: r.color, weight: 4.5, opacity: 0.95, interactive: false }).addTo(routeLayer);
  // One numbered marker per location; consecutive stops at the same address share it ("3–4").
  var groups = [];
  r.stops.forEach(function(o, i){
    var ll = recLatLng(o), last = groups[groups.length - 1];
    if (last && last.ll.equals(ll)) last.to = i; else groups.push({ ll: ll, from: i, to: i });
  });
  groups.forEach(function(g){
    var label = g.from === g.to ? String(g.from + 1) : (g.from + 1) + '–' + (g.to + 1);
    var m = L.marker(g.ll, {
      pane: 'routeStops', ariaLabel: label + '. ' + routeStopName(r, g.from),
      icon: L.divIcon({ className: '', html: '<div class="stop-num" style="background:' + r.color + '">' + label + '</div>', iconSize: [30,30], iconAnchor: [15,15] })
    });
    m.bindTooltip(esc(routeStopName(r, g.from)) + (g.to > g.from ? t(' i in.') : ''), { className: 'tt', direction: 'top', offset: [0, -16] });
    m.on('click', function(){ openStop(g.from); });
    m.addTo(routeLayer);
  });
}
function fitRoute(r){
  var b = L.latLngBounds(r.geometry);
  var pad = bottomSheets() ? { paddingTopLeft: [30, 30], paddingBottomRight: [30, sheetPad(routesSheet) + 30] }
                             : { paddingTopLeft: [50, 50], paddingBottomRight: [routesSheet.offsetWidth + 50, 90] };
  map.fitBounds(b, pad);
}
function startRoute(id, keepView){
  var r = routeById[id];
  if (!r) return;
  if (mode !== 'modern') setMode('modern', true);
  activeRoute = r;
  mapEl.classList.add('route-mode');
  drawRoute(r);
  renderRouteDetail(r);
  routesSheet.classList.remove('expanded');   // the map must stay visible while the route is fitted
  showSheet(routesSheet);
  clearExtraActive();
  markNearStops(r);
  routesBody.scrollTop = 0;
  setActiveMarker(null);
  current = null;
  setHash('');
  if (!keepView) setTimeout(function(){ fitRoute(r); }, 60);
}
function endRoute(){
  activeRoute = null;
  visitedStops = {};
  hideRouteNav();
  routeLayer.clearLayers();
  markNearStops(null);
  mapEl.classList.remove('route-mode');
  stopLocate();
  renderRoutesList();
  setHash('');
  syncBodyState();
}
function openRoutes(){
  if (activeRoute) renderRouteDetail(activeRoute); else renderRoutesList();
  showSheet(routesSheet);
  setActiveMarker(null);
}
function openStop(i){
  if (!activeRoute) return;
  openRecord(activeRoute.stops[i], i);
}
// Prepended to the place card while a route is active.
// Sticky "‹ i of n ›" bar on top of a card; used by routes (data-rb) and war timelines (data-wb).
function seqBarHTML(attr, color, title, label, i, n){
  return '<div class="route-bar" style="--rc:' + color + '">' +
    '<button class="rb-list" data-' + attr + '="list"><span class="num" style="background:' + color + '">' + (i + 1) + '</span>' +
    '<span><small>' + esc(title) + '</small>' + label + ' ' + (i + 1) + t(' z ') + n + '</span></button>' +
    '<button class="icon-btn" data-' + attr + '="prev" aria-label="Poprzedni"' + (i === 0 ? ' disabled' : '') + '>‹</button>' +
    '<button class="icon-btn" data-' + attr + '="next" aria-label="Następny"' + (i === n - 1 ? ' disabled' : '') + '>›</button>' +
    '</div>';
}
function routeBarHTML(i){
  return seqBarHTML('rb', activeRoute.color, activeRoute.name, t('Przystanek'), i, activeRoute.stops.length) +
    (geoWatch != null ? '<div class="rb-dist" data-rb-dist></div>' : '');
}
panel.addEventListener('click', function(e){
  var b = e.target.closest('[data-rb]');
  if (!b || !activeRoute || current == null || current.routeStop == null) return;
  if (b.dataset.rb === 'list') openRoutes();
  else if (b.dataset.rb === 'prev') openStop(current.routeStop - 1);
  else if (b.dataset.rb === 'next') openStop(current.routeStop + 1);
});
routesBody.addEventListener('click', function(e){
  var t = e.target.closest('button, a');
  if (!t) return;
  if (t.dataset.route) startRoute(t.dataset.route);
  else if (t.dataset.stop) openStop(parseInt(t.dataset.stop, 10));
  else if (t.dataset.orig) openRecord(parseInt(t.dataset.orig, 10));
  else if (t.id === 'route-start') openStop(0);
  else if (t.id === 'route-all'){ endRoute(); showSheet(routesSheet); }
  else if (t.id === 'route-end'){ endRoute(); routesSheet.classList.remove('open'); syncBodyState(); }
  else if (t.id === 'route-locate') toggleLocate(t);
  else if (t.id === 'route-print'){ document.body.classList.add('print-route'); window.print(); }
});
$('close-routes').addEventListener('click', function(){ routesSheet.classList.remove('open'); syncBodyState(); });

// --- "Gdzie jestem?" (geolocation) ---
var geoWatch = null, geoMarker = null, geoCircle = null, geoFirst = true;
function stopLocate(){
  hideRouteNav();
  if (geoWatch != null) navigator.geolocation.clearWatch(geoWatch);
  geoWatch = null;
  if (geoMarker){ map.removeLayer(geoMarker); map.removeLayer(geoCircle); geoMarker = geoCircle = null; }
}
// --- Walking with a route: nearest stop, distance, and the card opens by itself when you reach a stop ---
var routeNav = $('route-nav'), visitedStops = {};
function onRouteFix(ll, accuracy){
  var r = activeRoute, best = null;
  r.stops.forEach(function(o, i){
    var p = recLatLng(o); if (!p) return;
    var d = ll.distanceTo(p);
    var el = routesBody.querySelector('[data-dist-stop="' + i + '"]');
    if (el) el.textContent = ' · ' + fmtDist(d);
    if (!best || d < best.d) best = { i: i, d: d, name: routeStopName(r, i) };
  });
  if (!best) return;
  routeNav.hidden = false;
  routeNav.innerHTML = '<span class="num" style="background:' + r.color + '">' + (best.i + 1) + '</span><span class="grow"><b>' + esc(best.name) + '</b><small>' +
    (best.d < 40 ? t('jesteś na miejscu') : fmtDist(best.d) + t(' do najbliższego przystanku')) + '</small></span>';
  routeNav.dataset.stop = best.i;
  // Within 40 m (and a usable fix): open the stop's card once per stop per walk
  var key = r.id + ':' + best.i;
  if (best.d < 40 && accuracy < 80 && !visitedStops[key] && !(current && current.routeStop === best.i)){
    visitedStops[key] = true;
    openStop(best.i);
    showToast(t('Jesteś przy przystanku ') + (best.i + 1) + ': ' + best.name);
  }
  var rb = panel.querySelector('[data-rb-dist]');
  if (rb) rb.textContent = (current && current.routeStop === best.i && best.d < 40) ? t('Jesteś na miejscu') : fmtDist(best.d) + t(' do przystanku ') + (best.i + 1) + (current && current.routeStop !== best.i ? t(' (najbliższego)') : '');
}
routeNav.addEventListener('click', function(){ if (activeRoute && routeNav.dataset.stop != null) openStop(parseInt(routeNav.dataset.stop, 10)); });
function hideRouteNav(){ routeNav.hidden = true; routeNav.innerHTML = ''; }
function toggleLocate(btn){
  if (geoWatch != null){ stopLocate(); }
  else if (!navigator.geolocation){ showToast(t('Ta przeglądarka nie udostępnia lokalizacji.')); }
  else {
    geoFirst = true;
    geoWatch = navigator.geolocation.watchPosition(function(pos){
      var ll = L.latLng(pos.coords.latitude, pos.coords.longitude);
      if (!geoMarker){
        geoCircle = L.circle(ll, { radius: pos.coords.accuracy, color: '#6BB6FF', weight: 1, fillOpacity: 0.12, interactive: false }).addTo(map);
        geoMarker = L.marker(ll, { pane: 'routeStops', icon: L.divIcon({ className: '', html: '<div class="me-dot"></div>', iconSize: [18,18], iconAnchor: [9,9] }), interactive: false }).addTo(map);
      } else { geoMarker.setLatLng(ll); geoCircle.setLatLng(ll).setRadius(pos.coords.accuracy); }
      if (activeRoute) onRouteFix(ll, pos.coords.accuracy);
      if (geoFirst){
        geoFirst = false;
        if (allBounds.pad(0.5).contains(ll)) map.panTo(ll); else showToast(t('Jesteś poza Żbikowem — pozycja jest na mapie, ale daleko od tras.'));
      }
    }, function(err){
      // Only a denial ends the watch; "unavailable" and "timeout" are passing and the next fix still arrives
      if (err.code === 1){
        showToast(t('Brak zgody na lokalizację — włącz ją w ustawieniach przeglądarki.'));
        stopLocate();
        if (activeRoute){ var y = routesBody.scrollTop; renderRouteDetail(activeRoute); routesBody.scrollTop = y; }
      } else if (!geoMarker) showToast(t('Nie udało się jeszcze ustalić pozycji — próbuję dalej.'));
    }, { enableHighAccuracy: true, maximumAge: 10000 });
  }
  if (btn){ btn.setAttribute('aria-pressed', String(geoWatch != null)); btn.textContent = geoWatch != null ? t('Ukryj moją pozycję') : t('Gdzie jestem?'); }
}
renderRoutesList();

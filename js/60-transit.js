/* Żbików — Historia na mapie: Autobusy: przystanki, odjazdy, przebiegi linii.
 * Pliki js/ ładują się po kolei i dzielą jeden zakres globalny (kolejność ma znaczenie). */
// --- Buses (data/transit.js: GTFS of Pruszków city lines + GPA, baked by tools/import_transit.py) ---
var busLayer = L.layerGroup(), busLineLayer = L.layerGroup().addTo(map), busMarkers = {}, busShown = {};
var busSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><rect x="4" y="3" width="16" height="15" rx="3"/><path d="M4 11h16M8 21v-3M16 21v-3"/></svg>';
function easter(y){
  var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  var h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  return new Date(y, Math.floor((h + l - 7 * m + 114) / 31) - 1, (h + l - 7 * m + 114) % 31 + 1);
}
function isHoliday(dt){
  var md = (dt.getMonth() + 1) + '-' + dt.getDate();
  if (['1-1','1-6','5-1','5-3','8-15','11-1','11-11','12-24','12-25','12-26'].indexOf(md) !== -1) return true;
  var e = easter(dt.getFullYear()), day = 864e5, t = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()).getTime();
  return [0, 1, 60].some(function(off){ return Math.round((t - e.getTime()) / day) === off; });
}
// Timetables are in Warsaw time, whatever the device's time zone.
// Returns a local Date whose fields (year … minute) show the current Warsaw wall-clock time.
var warsawFmt = null;
try { warsawFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Warsaw', hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }); } catch (e) {}
function warsawNow(){
  if (!warsawFmt) return new Date();
  var p = {};
  warsawFmt.formatToParts(new Date()).forEach(function(x){ p[x.type] = +x.value; });
  var d = new Date(p.year, p.month - 1, p.day, p.hour % 24, p.minute, p.second);
  return isNaN(d.getTime()) ? new Date() : d;
}
// Same wall-clock time on a neighbouring calendar day (not ±24 h, which slips a day across DST changes).
function addDays(dt, n){ return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + n, dt.getHours(), dt.getMinutes()); }
function dayType(dt){ return dt.getDay() === 0 || isHoliday(dt) ? 'su' : dt.getDay() === 6 ? 'sa' : 'wd'; }
var DAY_LABEL = { wd: t('dzień roboczy'), sa: t('sobota'), su: t('niedziela i święta') };
function hm(m){ m = m % 1440; return Math.floor(m / 60) + ':' + ('0' + (m % 60)).slice(-2); }
function hmEnd(m){ return m === 1440 ? '24:00' : hm(m); }   // a closing time of midnight reads "24:00", not "0:00"
function lineOf(key){ return key.split('|')[0]; }
function lnChip(rk, pressed){
  var r = TRANSIT.routes[rk] || { n: rk, c: '#555', op: '' };
  var tag = pressed == null ? 'span' : 'button';
  return '<' + tag + ' class="ln" style="--lc:' + r.c + '"' + (pressed == null ? '' : ' data-line="' + esc(rk) + '" aria-pressed="' + String(!!pressed) + '"') +
    ' title="' + esc((r.op === 'GPA' ? 'GPA ' : t('Linia miejska ')) + r.n + ' · ' + r.long) + '">' + esc(r.n) + '</' + tag + '>';
}
function stopLines(st){
  var seen = {}, out = [];
  Object.keys(st.d).forEach(function(k){ var l = lineOf(k); if (!seen[l]){ seen[l] = 1; out.push(l); } });
  return out;
}
// Next departures from a stop: today's timetable from now on, topped up with tomorrow's first runs.
// Times of 24:00 and later (minutes >= 1440) belong to the previous service day, so just after
// midnight yesterday's late runs are still ahead of us.
function nextDeps(st, n, now){
  now = now || warsawNow();
  var t = dayType(now), ty = dayType(addDays(now, -1)), m = now.getHours() * 60 + now.getMinutes(), out = [];
  Object.keys(st.d).forEach(function(k){
    (st.d[k][ty] || []).forEach(function(x){ if (x >= 1440 && x - 1440 >= m) out.push({ k: k, t: x - 1440, wait: x - 1440 - m }); });
    (st.d[k][t] || []).forEach(function(x){ if (x >= m) out.push({ k: k, t: x, wait: x - m }); });
  });
  out.sort(function(a, b){ return a.t - b.t; });
  if (out.length < n){
    var t2 = dayType(addDays(now, 1)), more = [];
    Object.keys(st.d).forEach(function(k){ (st.d[k][t2] || []).forEach(function(x){ if (x < 1440) more.push({ k: k, t: x, wait: 1440 - m + x, tomorrow: true }); }); });
    more.sort(function(a, b){ return a.t - b.t; });
    out = out.concat(more.slice(0, n - out.length));
  }
  return out.slice(0, n);
}
function waitLabel(d){ return d.tomorrow ? t('jutro') : d.wait < 1 ? t('teraz') : d.wait < 60 ? t('za ') + d.wait + t(' min') : t('za ') + Math.floor(d.wait / 60) + ' h ' + (d.wait % 60) + t(' min'); }
function transitValidity(){
  var w = warsawNow(), today = w.getFullYear() + '-' + ('0' + (w.getMonth() + 1)).slice(-2) + '-' + ('0' + w.getDate()).slice(-2);
  return today > TRANSIT.validTo ? '<div class="warn">Rozkład w mapie był ważny do ' + esc(TRANSIT.validTo) + ' — może być nieaktualny.</div>' : '';
}
function transitNote(){
  return '<p class="bus-note">Rozkład planowy z otwartych danych GTFS (komunikacja miejska Pruszkowa i GPA, przez zbiorkom.live), ważny ' +
    esc(TRANSIT.validFrom) + ' – ' + esc(TRANSIT.validTo) + '. Opóźnień nie widać — aktualne odjazdy: <a href="https://rozkladjazdy.pruszkow.pl/" target="_blank" rel="noopener">rozkladjazdy.pruszkow.pl</a>, <a href="https://gpagrodzisk.pl/rozklad" target="_blank" rel="noopener">gpagrodzisk.pl</a>.</p>';
}
function busIcon(near){ return L.divIcon({ className: '', html: '<div class="bus-stop' + (near ? ' near' : '') + '">' + busSvg + '</div>', iconSize: [20,20], iconAnchor: [10,10] }); }
if (TRANSIT){
  TRANSIT.stops.forEach(function(st){
    var mk = L.marker([st.lat, st.lng], { icon: busIcon(false), keyboard: true, ariaLabel: t('Przystanek ') + st.n, zIndexOffset: -200 });
    mk.bindTooltip('<b>' + esc(st.n) + '</b><br>linie: ' + esc(stopLines(st).map(function(l){ return TRANSIT.routes[l] ? TRANSIT.routes[l].n : l; }).join(', ')), { className: 'tt', direction: 'top', offset: [0, -10] });
    mk.on('click', function(){ openBusStop(st.id); });
    busMarkers[st.id] = mk;
    busLayer.addLayer(mk);
  });
} else $('bus-btn').hidden = true;
var stopById = {};
(TRANSIT ? TRANSIT.stops : []).forEach(function(st){ stopById[st.id] = st; });
function setBus(on, quiet){
  if (!TRANSIT) return;
  if (on) busLayer.addTo(map); else { map.removeLayer(busLayer); busLineLayer.clearLayers(); busShown = {}; }
  $('bus-btn').setAttribute('aria-pressed', String(on));
  store('zbikow-bus', on ? '1' : '0');
  if (on && !quiet) showToast(t('Przystanki autobusowe: kliknij przystanek, aby zobaczyć najbliższe odjazdy.'));
}
$('bus-btn').addEventListener('click', function(e){
  e.stopPropagation();
  // Bus stops are a modern-map layer: from a war layer, switch back and show them
  if (mode !== 'modern'){ setMode('modern', true); setBus(true); return; }
  setBus(!map.hasLayer(busLayer));
});
if (store('zbikow-bus') === '1') setBus(true, true);
function drawBusLine(rk, on){
  busShown[rk] = on;
  busLineLayer.clearLayers();
  var pts = [];
  Object.keys(busShown).forEach(function(k){
    if (!busShown[k]) return;
    var r = TRANSIT.routes[k];
    (TRANSIT.shapes[k] || []).forEach(function(run){
      L.polyline(run, { color: '#fff', weight: 7, opacity: 0.9, interactive: false }).addTo(busLineLayer);
      L.polyline(run, { color: r.c, weight: 4, opacity: 0.95, dashArray: '10 6', interactive: false }).addTo(busLineLayer);
      run.forEach(function(p){ pts.push(p); });
    });
  });
  return pts;
}
function depsHTML(st){
  var deps = nextDeps(st, 10), dtyp = dayType(warsawNow());
  return '<div class="section-label">' + t('Najbliższe odjazdy · ') + '' + DAY_LABEL[dtyp] + '</div>' +
    (deps.length ? '<ul class="deps">' + deps.map(function(d){
      return '<li><b>' + hm(d.t) + '</b>' + lnChip(lineOf(d.k)) + '<span class="to">→ ' + esc(d.k.split('|')[1] || '') + '</span><span class="in">' + waitLabel(d) + '</span></li>';
    }).join('') + '</ul>' : '<p class="list-empty">' + t('Brak odjazdów w rozkładzie.') + '</p>');
}
function openBusStop(id){
  var st = stopById[id];
  if (!st) return;
  if (mode !== 'modern') setMode('modern', true);
  if (!map.hasLayer(busLayer)) setBus(true, true);
  var dtyp = dayType(warsawNow());
  var byDir = Object.keys(st.d).map(function(k){
    var times = st.d[k][dtyp] || [], hours = {};
    times.forEach(function(x){ var h = Math.floor(x / 60); (hours[h] = hours[h] || []).push(('0' + (x % 60)).slice(-2)); });   // after-midnight runs stay at the end
    var rows = Object.keys(hours).sort(function(a, b){ return a - b; }).map(function(h){ return '<div><b>' + (h % 24) + '</b><span>' + hours[h].join(' ') + '</span></div>'; }).join('');
    return '<details class="notes"><summary>' + lnChip(lineOf(k)) + ' → ' + esc(k.split('|')[1] || '') + ' <small>(' + times.length + ')</small></summary>' +
      '<div class="tt-table">' + (rows || '<div><span>' + t('Brak kursów w tym dniu.') + '</span></div>') + '</div></details>';
  }).join('');
  galleryLists = [];
  $('panel-kicker').textContent = t('Przystanek autobusowy');
  panelBody.innerHTML = '<div class="panel-inner">' +
    '<div class="badges"><span class="badge" style="color:#5BA4F0"><span class="dot"></span>Przystanek</span></div>' +
    '<div><h2 class="display title" id="panel-title">' + esc(st.n) + '</h2></div>' +
    '<div><div class="section-label">' + t('Linie · kliknij, aby pokazać przebieg na mapie') + '</div><div class="ln-row">' +
      stopLines(st).map(function(l){ return lnChip(l, !!busShown[l]); }).join('') + '</div></div>' +
    transitValidity() +
    '<div id="deps-box">' + depsHTML(st) + '</div>' +
    '<div><div class="section-label">' + t('Rozkład na dziś (') + '' + DAY_LABEL[dtyp] + ')</div>' + byDir + '</div>' +
    transitNote() +
    '</div>';
  panelBody.scrollTop = 0;
  btn1944.hidden = true;
  current = { kind: 'stop', stopId: id };
  setHash(id, null, 's');
  var wasOpen = panel.classList.contains('open');
  showSheet(panel);
  panel.focus({ preventScroll: true });
  setActiveMarker(null);
  clearExtraActive();
  activeBusMk = busMarkers[id];
  var seq = revealSeq;
  setTimeout(function(){
    if (seq !== revealSeq) return;
    var ll = L.latLng(st.lat, st.lng), z = Math.max(map.getZoom(), 16);
    map.flyTo(offsetCenter(ll, z), z, { duration: 0.5 });
    onMoveEnd(function(){ if (seq === revealSeq && activeBusMk && activeBusMk._icon) activeBusMk._icon.classList.add('is-active'); });
  }, wasOpen ? 0 : 60);
}
panelBody.addEventListener('click', function(e){
  var b = e.target.closest('[data-line]');
  if (b){
    var on = b.getAttribute('aria-pressed') !== 'true';
    b.setAttribute('aria-pressed', String(on));
    var pts = drawBusLine(b.dataset.line, on);
    if (on && pts.length) map.fitBounds(L.latLngBounds(pts), bottomSheets() ? { paddingTopLeft: [30, 80], paddingBottomRight: [30, sheetPad(panel) + 30] } : { paddingTopLeft: [60, 80], paddingBottomRight: [panel.offsetWidth + 60, 100] });
    return;
  }
  var sb = e.target.closest('[data-busstop]');
  if (sb) openBusStop(sb.dataset.busstop);
});
routesBody.addEventListener('click', function(e){
  var sb = e.target.closest('[data-busstop]');
  if (sb){ e.stopPropagation(); openBusStop(sb.dataset.busstop); return; }
  if (e.target.closest('#route-bus')){
    setBus(!map.hasLayer(busLayer), true);
    renderRouteDetail(activeRoute);
    var bb = routesBody.querySelector('.bus-block'); if (bb) bb.open = true;
  }
});
// Walking distance ≈ 1.25 × straight line, 75 m per minute.
function nearStops(ll, max, n){
  return TRANSIT.stops.map(function(st){ return { st: st, d: ll.distanceTo([st.lat, st.lng]) }; })
    .filter(function(x){ return x.d <= max; }).sort(function(a, b){ return a.d - b.d; }).slice(0, n);
}
function nearHTML(list, label){
  return '<div class="section-label">' + label + '</div><ul class="bus-near">' + list.map(function(x){
    var dep = nextDeps(x.st, 3), walk = Math.max(1, Math.round(x.d * 1.25 / 75));
    return '<li><button data-busstop="' + x.st.id + '"><span class="bn-head"><span>' + busSvgInline + ' ' + esc(x.st.n) + '</span><small>' + Math.round(x.d * 1.25 / 10) * 10 + ' m · ' + walk + t(' min pieszo') + '</small></span>' +
      '<span class="ln-row">' + stopLines(x.st).map(function(l){ return lnChip(l); }).join('') + '</span>' +
      (dep.length ? '<span class="bn-next">' + t('Najbliższe: ') + '' + dep.map(function(d){ return '<b>' + hm(d.t) + '</b> ' + esc(TRANSIT.routes[lineOf(d.k)].n) + (d.tomorrow ? t(' (jutro)') : ''); }).join(' · ') + '</span>' : '') +
      '</button></li>';
  }).join('') + '</ul>';
}
// Stops listed under "Dojazd autobusem" get a highlighted icon while the route is active
var nearStopIds = [];
function markNearStops(r){
  if (!TRANSIT) return;
  nearStopIds.forEach(function(id){ if (busMarkers[id]){ busMarkers[id].setIcon(busIcon(false)); if (busMarkers[id] === activeBusMk && activeBusMk._icon) activeBusMk._icon.classList.add('is-active'); } });
  nearStopIds = [];
  if (!r || !r.stops.length) return;
  var a = recLatLng(r.stops[0]), z = recLatLng(r.stops[r.stops.length - 1]);
  if (!a) return;
  nearStops(a, 600, 3).concat(z && a.distanceTo(z) > 400 ? nearStops(z, 600, 2) : []).forEach(function(x){ nearStopIds.push(x.st.id); busMarkers[x.st.id].setIcon(busIcon(true)); });
}
var busSvgInline = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5BA4F0" stroke-width="2.4" style="vertical-align:-2px" aria-hidden="true"><rect x="4" y="3" width="16" height="15" rx="3"/><path d="M4 11h16M8 21v-3M16 21v-3"/></svg>';
function transitRouteHTML(r){
  if (!TRANSIT || !r || !r.stops.length) return '';
  var a = recLatLng(r.stops[0]), z = recLatLng(r.stops[r.stops.length - 1]);
  if (!a) return '';
  var start = nearStops(a, 600, 3), end = z && a.distanceTo(z) > 400 ? nearStops(z, 600, 2) : [];
  if (!start.length && !end.length) return '';
  return '<details class="notes bus-block"' + (store('zbikow-bus') === '1' ? ' open' : '') + '><summary>' + t('Dojazd autobusem') + '</summary><div class="notes-body" style="display:flex;flex-direction:column;gap:12px">' +
    (start.length ? nearHTML(start, t('Przystanki przy starcie (przystanek 1)')) : '') +
    (end.length ? nearHTML(end, t('Powrót — przystanki przy mecie')) : '') +
    '<button class="btn" id="route-bus" aria-pressed="' + String(map.hasLayer(busLayer)) + '">' + (map.hasLayer(busLayer) ? t('Ukryj przystanki na mapie') : t('Pokaż przystanki na mapie')) + '</button>' +
    transitNote() + '</div></details>';
}
if (TRANSIT) TRANSIT.stops.forEach(function(st){
  var entry = { label: st.n, sub: 'Przystanek · linie ' + stopLines(st).map(function(l){ return TRANSIT.routes[l].n; }).join(', '), type: 'przystanek autobusowy',
                go: function(){ openBusStop(st.id); }, mapped: true };
  entry.nLabel = norm(entry.label + ' przystanek'); entry.nRest = norm(entry.sub + ' autobus bus');
  searchIndex.push(entry);
});

/* Żbików — Historia na mapie: Okolica: kultura, sklepy, stacje, apteki z OSM.
 * Pliki js/ ładują się po kolei i dzielą jeden zakres globalny (kolejność ma znaczenie). */
// --- Okolica (data/poi.js from OpenStreetMap, tools/import_poi.py) ---
var POI_CAT = {
  kultura: { color: '#8E44AD', icon: '🏛', label: 'Kultura' },
  kawiarnie: { color: '#A0522D', icon: '☕', label: 'Kawiarnie' },
  spozywcze: { color: '#2E8B57', icon: '🛒', label: 'Sklepy spożywcze' },
  paliwo: { color: '#C0392B', icon: '⛽', label: 'Stacje paliw' },
  apteki: { color: '#16A085', icon: '✚', label: 'Apteki' }
};
var nearBody = $('near-body'), poiLayer = L.layerGroup(), poiMarkers = {}, poiById = {};
var nearState = { cat: 'kultura', openOnly: false, from: null };
var DAYS_PL = ['poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota', 'niedziela'];
// Opening state from the weekly plan baked by the importer (minutes, Monday first; PH = Polish holidays).
// Grocery shops without explicit holiday (PH) hours in OSM: Polish law closes them on public holidays,
// so the weekday plan must not be assumed. Pharmacies, stations and cafés keep the weekday fallback.
function dayPlan(p, dt){
  if (!p.h) return null;
  if (isHoliday(dt)){ if (p.h.ph) return p.h.ph; if (p.c === 'spozywcze') return []; }
  return p.h.w[(dt.getDay() + 6) % 7];
}
function ohState(p, now){
  if (!p.h) return { k: 'unk', t: p.oh ? 'godziny: ' + p.oh : 'brak godzin w OSM' };
  now = now || warsawNow();
  var m = now.getHours() * 60 + now.getMinutes(), today = dayPlan(p, now) || [];
  var y = addDays(now, -1), yest = dayPlan(p, y) || [];
  for (var i = 0; i < yest.length; i++) if (yest[i][1] > 1440 && m + 1440 < yest[i][1]) return { k: 'open', t: 'otwarte do ' + hmEnd(yest[i][1]) };
  for (i = 0; i < today.length; i++) if (m >= today[i][0] && m < today[i][1]) {
    if (today[i][0] === 0 && today[i][1] >= 1440) return { k: 'open', t: 'otwarte całą dobę' };
    return { k: 'open', t: 'otwarte do ' + hmEnd(today[i][1]) + (today[i][1] - m <= 30 ? ' (zaraz zamykają)' : '') };
  }
  if (isHoliday(now) && !p.h.ph && p.c === 'spozywcze') return { k: 'closed', t: 'święto · sklep zamknięty (brak godzin świątecznych w OSM)' };
  for (i = 0; i < today.length; i++) if (today[i][0] > m) return { k: 'closed', t: 'zamknięte · otwierają o ' + hm(today[i][0]) };
  for (var d = 1; d <= 7; d++){
    var dt = addDays(now, d), pl = dayPlan(p, dt) || [];
    if (pl.length) return { k: 'closed', t: 'zamknięte · otwierają ' + (d === 1 ? 'jutro' : DAYS_PL[(dt.getDay() + 6) % 7]) + ' o ' + hm(pl[0][0]) };
  }
  return { k: 'closed', t: 'zamknięte' };
}
function poiIcon(p, st){
  var c = POI_CAT[p.c];
  return L.divIcon({ className: '', html: '<div class="poi-pin' + (st && st.k === 'closed' ? ' shut' : '') + '" style="--pc:' + c.color + '">' + c.icon + '</div>', iconSize: [24,24], iconAnchor: [12,12] });
}
if (POI){
  POI.items.forEach(function(p){
    poiById[p.id] = p;
    var mk = L.marker([p.lat, p.lng], { icon: poiIcon(p), keyboard: true, ariaLabel: p.n, zIndexOffset: 300 });
    // A function, so "open now" is worked out each time the tooltip opens, not frozen at page load
    mk.bindTooltip(function(){ return '<b>' + esc(p.n) + '</b><br>' + esc(p.s) + ' · ' + esc(ohState(p).t); }, { className: 'tt', direction: 'top', offset: [0, -12] });
    mk.on('click', function(){ openPoi(p.id); });
    poiMarkers[p.id] = mk;
  });
} else { segButtons.forEach(function(b){ if (b.dataset.layer === 'okolica') b.hidden = true; }); }
function nearOrigin(){
  if (nearState.from) return nearState.from;
  if (geoMarker) return geoMarker.getLatLng();
  return map.getCenter();
}
function fmtDist(d){ return d < 1000 ? Math.round(d / 10) * 10 + ' m' : (d / 1000).toFixed(1).replace('.', ',') + ' km'; }
function showPoiLayer(){
  if (mode !== 'modern') setMode('modern', true);
  poiLayer.clearLayers();
  POI.items.forEach(function(p){
    if (p.c !== nearState.cat) return;
    var st = ohState(p);
    if (nearState.openOnly && st.k !== 'open') return;
    poiMarkers[p.id].setIcon(poiIcon(p, st));
    poiLayer.addLayer(poiMarkers[p.id]);
  });
  // The place whose card is open stays on the map and highlighted (setIcon rebuilds the icon element)
  if (current && current.kind === 'poi' && poiMarkers[current.poiId]){
    var am = poiMarkers[current.poiId];
    if (!poiLayer.hasLayer(am)) poiLayer.addLayer(am);
    if (am._icon) am._icon.classList.add('is-active');
  }
  if (!map.hasLayer(poiLayer)) poiLayer.addTo(map);
}
function nearestOpen(cat){
  var o = nearOrigin(), best = null;
  POI.items.forEach(function(p){
    if (p.c !== cat || ohState(p).k !== 'open') return;
    var d = o.distanceTo([p.lat, p.lng]);
    if (!best || d < best.d) best = { p: p, d: d };
  });
  return best;
}
function renderNear(){
  var o = nearOrigin(), counts = {};
  POI.items.forEach(function(p){ counts[p.c] = (counts[p.c] || 0) + 1; });
  var list = POI.items.filter(function(p){ return p.c === nearState.cat; }).map(function(p){ return { p: p, st: ohState(p), d: o.distanceTo([p.lat, p.lng]) }; })
    .filter(function(x){ return !nearState.openOnly || x.st.k === 'open'; })
    .sort(function(a, b){ return (a.st.k === 'open' ? 0 : 1) - (b.st.k === 'open' ? 0 : 1) || a.d - b.d; });
  var quick = ['spozywcze', 'paliwo', 'apteki', 'kawiarnie'].map(function(c){
    var b = nearestOpen(c), cc = POI_CAT[c];
    return '<button data-nearest="' + c + '"' + (b ? '' : ' disabled') + '><span>' + cc.icon + ' ' + (c === 'spozywcze' ? 'Najbliższy otwarty sklep' : c === 'paliwo' ? 'Najbliższa stacja' : c === 'apteki' ? 'Najbliższa apteka' : 'Najbliższa kawiarnia') + '</span>' +
      '<small>' + (b ? esc(b.p.n) + ' · ' + fmtDist(b.d) : 'teraz nic otwartego (wg OSM)') + '</small></button>';
  }).join('');
  var fromLabel = nearState.from ? 'od Twojej pozycji' : geoMarker ? 'od Twojej pozycji' : 'od środka mapy';
  nearBody.innerHTML = '<div class="panel-inner">' +
    '<div class="near-quick">' + quick + '</div>' +
    '<div class="near-cats" role="group" aria-label="Kategoria">' + Object.keys(POI_CAT).map(function(c){
      var cc = POI_CAT[c];
      return '<button data-cat="' + c + '" style="--pc:' + cc.color + '" aria-pressed="' + String(nearState.cat === c) + '">' + cc.icon + ' ' + cc.label + ' <small>' + (counts[c] || 0) + '</small></button>';
    }).join('') + '</div>' +
    '<div class="near-tools"><label><input type="checkbox" id="near-open"' + (nearState.openOnly ? ' checked' : '') + '> tylko otwarte teraz</label>' +
      '<button class="btn" id="near-me" style="margin-left:auto">' + (nearState.from || geoMarker ? 'Odśwież moją pozycję' : 'Szukaj od mojej pozycji') + '</button></div>' +
    '<div><div class="section-label">' + esc(POI_CAT[nearState.cat].label) + ' · ' + list.length + ' · odległość ' + fromLabel + '</div>' +
      (list.length ? '<ul class="near-list">' + list.map(function(x){
        var p = x.p;
        return '<li><button data-poi="' + p.id + '"><span class="pi" style="--pc:' + POI_CAT[p.c].color + '">' + POI_CAT[p.c].icon + '</span><span>' + esc(p.n) +
          '<small>' + esc([p.s, p.a].filter(Boolean).join(' · ')) + '</small><small class="oh ' + x.st.k + '">' + esc(x.st.t) + '</small></span><span class="dist">' + fmtDist(x.d) + '</span></button></li>';
      }).join('') + '</ul>' : '<p class="list-empty">Nic otwartego w tej kategorii (według godzin w OpenStreetMap).</p>') + '</div>' +
    '<p class="bus-note">Dane: © autorzy <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> (ODbL), stan na ' + esc(POI.updated) +
      '. Godziny wpisują wolontariusze — mogą być nieaktualne, a przy części miejsc ich brak. Niedziele niehandlowe nie są uwzględnione, jeśli sklep nie ma ich w godzinach.</p>' +
    '</div>';
}
function openNear(){
  if (!POI) return;
  renderNear();
  showSheet(nearSheet);
  setActiveMarker(null);
  showPoiLayer();
}
function locateOnce(cb){
  if (!navigator.geolocation){ showToast('Ta przeglądarka nie udostępnia lokalizacji.'); return; }
  navigator.geolocation.getCurrentPosition(function(pos){
    nearState.from = L.latLng(pos.coords.latitude, pos.coords.longitude);
    cb();
  }, function(err){ showToast(err.code === 1 ? 'Brak zgody na lokalizację — odległości liczę od środka mapy.' : 'Nie udało się ustalić pozycji.'); }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
}
nearBody.addEventListener('click', function(e){
  var c = e.target.closest('[data-cat]');
  if (c){ nearState.cat = c.dataset.cat; renderNear(); showPoiLayer(); return; }
  var q = e.target.closest('[data-nearest]');
  if (q){ var b = nearestOpen(q.dataset.nearest); if (b){ nearState.cat = q.dataset.nearest; showPoiLayer(); openPoi(b.p.id); } return; }
  var pb = e.target.closest('[data-poi]');
  if (pb){ openPoi(pb.dataset.poi); return; }
  if (e.target.closest('#near-me')) locateOnce(function(){ renderNear(); });
});
nearBody.addEventListener('change', function(e){
  if (e.target.id === 'near-open'){ nearState.openOnly = e.target.checked; renderNear(); showPoiLayer(); }
});
function closeNear(){ nearSheet.classList.remove('open'); syncBodyState(); hidePoiLayerIfIdle(); }
$('close-near').addEventListener('click', closeNear);
// "od środka mapy": the list follows the map
var nearMoveTimer;
map.on('moveend', function(){
  if (!nearSheet.classList.contains('open') || nearState.from || geoMarker) return;
  clearTimeout(nearMoveTimer);
  nearMoveTimer = setTimeout(function(){ var y = nearBody.scrollTop; renderNear(); nearBody.scrollTop = y; }, 250);
});
// A place with history within ~50 m of a POI (e.g. Muzeum Dulag 121 ↔ Dulag 121 records).
function historyNear(p){
  var ll = L.latLng(p.lat, p.lng), best = null;
  PLACES.forEach(function(pl){ var d = ll.distanceTo([pl.lat, pl.lng]); if (d < 60 && (!best || d < best.d)) best = { pl: pl, d: d }; });
  return best && best.pl;
}
function openPoi(id){
  var p = poiById[id];
  if (!p) return;
  if (!map.hasLayer(poiLayer) || nearState.cat !== p.c){ nearState.cat = p.c; showPoiLayer(); }
  if (!poiLayer.hasLayer(poiMarkers[id])) poiLayer.addLayer(poiMarkers[id]);
  var st = ohState(p), now = warsawNow(), cc = POI_CAT[p.c];
  var phToday = isHoliday(now) && !!(p.h && p.h.ph), ti = phToday ? -1 : (now.getDay() + 6) % 7;
  function ivText(iv){ return iv.length ? iv.map(function(x){ return hm(x[0]) + '–' + hmEnd(x[1]); }).join(', ') : 'zamknięte'; }
  var table = p.h ? '<div class="oh-table">' + DAYS_PL.map(function(dn, i){
    return '<span' + (i === ti ? ' class="today"' : '') + '>' + dn + '</span><span' + (i === ti ? ' class="today"' : '') + '>' + ivText(p.h.w[i]) + '</span>';
  }).join('') + (p.h.ph ? '<span' + (phToday ? ' class="today"' : '') + '>święta</span><span' + (phToday ? ' class="today"' : '') + '>' + ivText(p.h.ph) + '</span>' : '') + '</div>'
    : '<p class="bus-note">' + (p.oh ? 'Godziny w OSM: ' + esc(p.oh) : 'Brak godzin otwarcia w OpenStreetMap.') + '</p>';
  var hist = historyNear(p), histRec = hist ? (hist.isGroup ? hist.members[0] : hist) : null;
  galleryLists = [];
  $('panel-kicker').textContent = 'Okolica · ' + cc.label;
  panelBody.innerHTML = '<div class="panel-inner">' +
    '<div class="badges"><span class="badge" style="color:' + cc.color + ';filter:brightness(1.4)"><span class="dot"></span>' + esc(p.s) + '</span>' + (p.b ? '<span class="badge">' + esc(p.b) + '</span>' : '') + (p.lpg ? '<span class="badge">LPG</span>' : '') + '</div>' +
    '<div><h2 class="display title" id="panel-title">' + esc(p.n) + '</h2>' + (p.a ? '<div class="addr">' + pinSvg + '<span>' + esc(p.a) + '</span></div>' : '') + '</div>' +
    '<div class="oh ' + st.k + '" style="font-size:15px">' + esc(st.t) + '</div>' +
    '<div><div class="section-label">Godziny otwarcia</div>' + table + '</div>' +
    ((p.tel || p.www) ? '<dl class="facts">' + (p.tel ? '<dt>Telefon</dt><dd><a href="tel:' + esc(p.tel.replace(/\s/g, '')) + '">' + esc(p.tel) + '</a></dd>' : '') +
      (p.www ? '<dt>Strona</dt><dd><a href="' + esc(/^https?:/.test(p.www) ? p.www : 'https://' + p.www) + '" target="_blank" rel="noopener">' + esc(p.www.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')) + '</a></dd>' : '') + '</dl>' : '') +
    (histRec ? '<button class="btn" data-modern="' + histRec.origId + '">Historia tego miejsca: ' + esc(hist.isGroup ? hist.groupName : histRec.name) + '</button>' : '') +
    '<a class="btn" href="https://www.google.com/maps/dir/?api=1&destination=' + p.lat + ',' + p.lng + '" target="_blank" rel="noopener">Nawiguj w Google Maps</a>' +
    '<p class="bus-note">© autorzy <a href="https://www.openstreetmap.org/' + ({ n: 'node', w: 'way', r: 'relation' })[p.id[0]] + '/' + p.id.slice(1) + '" target="_blank" rel="noopener">OpenStreetMap</a> — widzisz błąd w godzinach? Można go poprawić w OSM.</p>' +
    '</div>';
  panelBody.scrollTop = 0;
  btn1944.hidden = true;
  current = { kind: 'poi', poiId: id };
  setHash(id, null, 'poi');
  var wasOpen = panel.classList.contains('open');
  showSheet(panel);
  panel.focus({ preventScroll: true });
  setActiveMarker(null);
  clearExtraActive();
  activePoiMk = poiMarkers[id];
  var seq = revealSeq;
  setTimeout(function(){
    if (seq !== revealSeq) return;
    var ll = L.latLng(p.lat, p.lng), z = Math.max(map.getZoom(), 16);
    map.flyTo(offsetCenter(ll, z), z, { duration: 0.5 });
    onMoveEnd(function(){ if (seq === revealSeq && activePoiMk && activePoiMk._icon) activePoiMk._icon.classList.add('is-active'); });
  }, wasOpen ? 0 : 60);
}
if (POI) POI.items.forEach(function(p){
  var entry = { label: p.n, sub: POI_CAT[p.c].label + (p.a ? ' · ' + p.a : ''), type: p.s, go: function(){ openPoi(p.id); }, mapped: true };
  entry.nLabel = norm(entry.label); entry.nRest = norm(entry.sub + ' ' + entry.type + ' okolica');
  searchIndex.push(entry);
});

/* Żbików — Historia na mapie: Warstwy I i II wojny światowej.
 * Pliki js/ ładują się po kolei i dzielą jeden zakres globalny (kolejność ma znaczenie). */
// --- War layers: I / II wojna światowa (data: data/wars.js) ---
var mode = 'modern';              // 'modern' | 'ww1' | 'ww2'
var WAR_TYPES = WARS.types || {}, LINE_TYPES = WARS.lineTypes || {};
var warBody = $('war-body');
var warState = {};                // key -> built layer state
var activeWarMk = null;

function warType(t){ return WAR_TYPES[t] || { label: t || 'Wydarzenie', color: '#94A3B8', glyph: '•' }; }
function glyphHTML(t, cls, side){
  return '<span class="' + cls + ' sym" aria-hidden="true">' + warSymbolSVG(t, side) + '</span>';
}
// An event inherits name, text, dating, photos and position from the record it references (ev.ref);
// its own fields override them. ev.link only points the "show on the modern map" button at a record.
function resolveSources(list, war){
  return (list || []).map(function(s){
    if (typeof s !== 'string') return s;
    var d = war && war.sources && war.sources[s];
    return d ? { name: s + ' · ' + d.name, url: d.url } : { name: s };
  });
}
function resolveEvent(ev, war){
  var rec = ev.ref != null ? recordByOrig[ev.ref] : null;
  var base = rec ? rec.item : {}, item = {};
  for (var k in base) item[k] = base[k];
  item.origId = rec ? base.origId : null;
  if (ev.title) item.name = ev.title;
  if (!item.name) item.name = 'Wydarzenie';
  if (ev.date) item.dating = ev.date;
  if (ev.desc) item.shortDesc = ev.desc;
  if (ev.category) item.type = ev.category;
  if (ev.where) item.locationDesc = ev.where;
  if (ev.note) item.note = ev.note;
  if (!rec){ item.source = ''; }
  var place = null, ll = null;
  if (ev.lat != null && ev.lng != null) ll = L.latLng(ev.lat, ev.lng);
  else if (ev.at && placeById[ev.at]){ place = placeById[ev.at]; ll = L.latLng(place.lat, place.lng); }
  else if (rec && rec.place){ place = rec.place; ll = L.latLng(place.lat, place.lng); }
  var linkRec = ev.link != null ? recordByOrig[ev.link] : rec;
  return { ev: ev, item: item, place: place, ll: ll, rec: rec, sources: resolveSources(ev.sources, war),
           modernLink: linkRec && linkRec.place ? linkRec.item.origId : null,
           photos: ev.photos && ev.photos.length ? ev.photos : ev.photosFrom != null ? PHOTOS[ev.photosFrom] : (rec ? PHOTOS[base.origId] : null) };
}
// Tactical symbols in the style of period staff maps: unit frame in the side's colour,
// the type drawn inside (artillery dot, observation triangle, HQ staff, trench zigzag…), impacts as bursts.
var PAPER = '#F4EAD0', INK = '#2B2118';
function symColor(side, type){
  if (side && side.indexOf('/') !== -1 && side.indexOf('ofiary') === -1) return '#6B2E83';
  if (side && (side.indexOf('Polacy') === 0 || side.indexOf('AK') === 0)) return '#B3261E';
  if (side && side.indexOf('Rosjanie') === 0) return '#B3261E';
  if (side && side.indexOf('Niemcy') === 0) return '#1F4E8C';
  if (side && side.indexOf('Obie') === 0) return '#6B2E83';
  if (side && side.indexOf('Ludność') === 0) return '#6B4F2A';
  return warType(type).color;
}
function warSymbolSVG(t, side){
  var c = symColor(side, t), ty = warType(t);
  var frame = '<rect x="3" y="3" width="30" height="21" rx="1" fill="' + PAPER + '" stroke="' + c + '" stroke-width="2.6"/>';
  var inner;
  switch (t){
    case 'artyleria': inner = frame + '<circle cx="18" cy="13.5" r="4.6" fill="' + c + '"/>'; break;
    case 'okopy': inner = frame + '<path d="M7 17 l3.5-6 3.5 6 3.5-6 3.5 6 3.5-6 3.5 6" fill="none" stroke="' + c + '" stroke-width="2"/>'; break;
    case 'sztab': inner = '<path d="M4 34 V3" stroke="' + INK + '" stroke-width="2.2"/>' + frame.replace('x="3"', 'x="4"') + '<text x="19" y="18" text-anchor="middle" font-family="Special Elite,Courier New,monospace" font-size="10" fill="' + c + '">SZT</text>'; break;
    case 'obserwacja': return '<svg class="war-sym" width="34" height="30" viewBox="0 0 36 30"><path d="M18 3 L33 27 H3 Z" fill="' + PAPER + '" stroke="' + c + '" stroke-width="2.6" stroke-linejoin="round"/><circle cx="18" cy="19" r="3" fill="' + c + '"/></svg>';
    case 'natarcie': return '<svg class="war-sym" width="34" height="24" viewBox="0 0 36 24"><path d="M3 9 H22 V3 L34 12 L22 21 V15 H3 Z" fill="' + c + '" stroke="' + INK + '" stroke-width="1.4" stroke-linejoin="round"/></svg>';
    case 'schron': inner = frame + '<path d="M9 20 a9 8 0 0 1 18 0 z" fill="' + c + '"/>'; break;
    case 'zniszczenie': case 'pocisk':
      var pts = [], n = 12, R = t === 'pocisk' ? 13 : 14, r = t === 'pocisk' ? 6 : 7;
      for (var i = 0; i < n * 2; i++){ var a = Math.PI * i / n, rr = i % 2 ? r : R; pts.push((16 + rr * Math.sin(a)).toFixed(1) + ',' + (16 - rr * Math.cos(a)).toFixed(1)); }
      return '<svg class="war-sym" width="32" height="32" viewBox="0 0 32 32"><polygon points="' + pts.join(' ') + '" fill="' + (t === 'pocisk' ? '#F59E0B' : '#E4572E') + '" stroke="' + INK + '" stroke-width="1.3" stroke-linejoin="round"/><circle cx="16" cy="16" r="' + (t === 'pocisk' ? 3 : 3.6) + '" fill="#FFE8A3"/></svg>';
    case 'szpital': inner = frame + '<path d="M18 7 V20 M11.5 13.5 H24.5" stroke="#C0392B" stroke-width="3.6"/>'; break;
    case 'pamiec': return '<svg class="war-sym" width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="11.5" fill="' + PAPER + '" stroke="' + INK + '" stroke-width="2"/><path d="M14 6.5 V21.5 M8.5 11.5 H19.5" stroke="' + INK + '" stroke-width="2.6"/></svg>';
    default: inner = frame + '<text x="18" y="18.5" text-anchor="middle" font-size="12" font-weight="700" fill="' + c + '">' + esc(ty.glyph) + '</text>';
  }
  return '<svg class="war-sym" width="36" height="' + (t === 'sztab' ? 36 : 27) + '" viewBox="0 0 36 ' + (t === 'sztab' ? 36 : 27) + '">' + inner + '</svg>';
}
function warPinIcon(t, dim, side){
  var ty = warType(t);
  var h = t === 'sztab' ? 36 : 30;
  return L.divIcon({ className: '', html: '<div class="war-pin' + (ty.impact ? ' impact' : '') + (dim ? ' dim' : '') + '">' + warSymbolSVG(t, side) + '</div>', iconSize: [36, h], iconAnchor: [18, t === 'sztab' ? 34 : h / 2] });
}
var SIDE_COLORS = { 'Rosjanie': '#EF4444', 'Niemcy': '#60A5FA', 'Ludność': '#A855F7' };
function sideColor(side){
  for (var k in SIDE_COLORS) if (side && side.indexOf(k) === 0) return SIDE_COLORS[k];
  return '#EAB308';
}
function certBadge(c){
  if (!c) return '';
  var n = norm(c), cls = n.indexOf('potwierdz') === 0 ? 'cert-pot' : n.indexOf('relacja') === 0 ? 'cert-rel' : n.indexOf('hipotez') === 0 ? 'cert-hip' : '';
  var m = /^(.*?)\s*(\(.*\))$/.exec(c);
  return '<span class="badge ' + cls + '" title="Pewność: ' + esc(c) + '"><span class="dot"></span>' + (m ? esc(m[1]) + '<span class="cx">&nbsp;' + esc(m[2]) + '</span>' : esc(c)) + '</span>';
}
// Day-by-day view: an event is active on a day when it falls inside its from–to range.
// s.day is either a single day ('1914-10-17') or a period { from, to, i, label } (war.phases).
function rng(day){ return typeof day === 'string' ? { from: day, to: day } : day; }
// Events without a from/to range count on the single day their `sort` names (YYYY-MM-DD); month-only dates never match a day.
function evFrom(e){ return e.ev.from || (String(e.ev.sort || '').length === 10 ? e.ev.sort : null); }
function activeOn(e, day){ if (!day) return true; var r = rng(day), f = evFrom(e); return !!(f && f <= r.to && (e.ev.to || f) >= r.from); }
function dayLabel(iso){
  var m = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
  var p = iso.split('-');
  return { d: String(parseInt(p[2], 10)), m: m[parseInt(p[1], 10) - 1] };
}
function dayList(days){
  var out = [], d = new Date(days.from + 'T12:00:00Z'), end = new Date(days.to + 'T12:00:00Z');
  while (d <= end){ out.push(d.toISOString().slice(0, 10)); d.setUTCDate(d.getUTCDate() + 1); }
  return out;
}
// Arrow head at the end of a line; the angle is constant across zoom levels (Mercator is conformal).
function arrowHead(coords, color){
  var a = map.project(L.latLng(coords[coords.length - 2]), 17), b = map.project(L.latLng(coords[coords.length - 1]), 17);
  var deg = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
  return L.marker(coords[coords.length - 1], { interactive: false, keyboard: false,
    icon: L.divIcon({ className: '', html: '<div class="arrow-head" style="transform:rotate(' + deg + 'deg)"><svg width="26" height="22" viewBox="0 0 26 22"><path d="M1 2 L25 11 L1 20 L7 11 Z" fill="' + color + '" stroke="' + INK + '" stroke-width="1.3" stroke-linejoin="round"/></svg></div>', iconSize: [26,22], iconAnchor: [19,11] }) });
}
// Artillery fire drawn as a ballistic arc (quadratic curve bowed to the left of the direction of fire).
function ballisticArc(a, b){
  var pa = map.project(L.latLng(a), 15), pb = map.project(L.latLng(b), 15);
  var dx = pb.x - pa.x, dy = pb.y - pa.y, len = Math.sqrt(dx * dx + dy * dy);
  var cx = (pa.x + pb.x) / 2 + dy / len * len * 0.18, cy = (pa.y + pb.y) / 2 - dx / len * len * 0.18;
  var out = [];
  for (var i = 0; i <= 40; i++){
    var u = i / 40, x = (1 - u) * (1 - u) * pa.x + 2 * (1 - u) * u * cx + u * u * pb.x, y = (1 - u) * (1 - u) * pa.y + 2 * (1 - u) * u * cy + u * u * pb.y;
    var ll = map.unproject(L.point(x, y), 15); out.push([ll.lat, ll.lng]);
  }
  return out;
}
// Front line "teeth": small triangles on the right-hand side of the line direction.
function frontTeeth(coords, color){
  var out = [], z = 15, step = 80;
  for (var i = 0; i < coords.length - 1; i++){
    var pa = map.project(L.latLng(coords[i]), z), pb = map.project(L.latLng(coords[i + 1]), z);
    var dx = pb.x - pa.x, dy = pb.y - pa.y, len = Math.sqrt(dx * dx + dy * dy), ux = dx / len, uy = dy / len;
    for (var d = step / 2; d < len; d += step){
      var bx = pa.x + ux * d, by = pa.y + uy * d, w = 14, h = 16;
      var p1 = map.unproject(L.point(bx - ux * w, by - uy * w), z), p2 = map.unproject(L.point(bx + ux * w, by + uy * w), z),
          p3 = map.unproject(L.point(bx - uy * h, by + ux * h), z);
      out.push(L.polygon([p1, p3, p2], { color: color, weight: 1, fillColor: color, fillOpacity: 0.9, opacity: 0.9, interactive: false }));
    }
  }
  return out;
}
// Label written along the middle of a line, kept upright.
function lineLabel(geom, text, color){
  if (!text || geom.length < 2) return null;
  var mid = Math.floor(geom.length / 2), a = geom[Math.max(0, mid - 1)], b = geom[Math.min(geom.length - 1, mid + 1)];
  var pa = map.project(L.latLng(a), 15), pb = map.project(L.latLng(b), 15);
  var deg = Math.atan2(pb.y - pa.y, pb.x - pa.x) * 180 / Math.PI;
  if (deg > 90) deg -= 180; if (deg < -90) deg += 180;
  return L.marker(geom[mid], { interactive: false, keyboard: false,
    icon: L.divIcon({ className: '', html: '<div class="war-label" style="--lc:' + color + ';transform:translate(-50%,-150%) rotate(' + deg.toFixed(1) + 'deg)"><span>' + esc(text) + '</span></div>', iconSize: [0, 0] }) });
}
function buildWar(key){
  if (warState[key]) return warState[key];
  var war = WARS[key];
  var events = (war.events || []).filter(function(e){ return !e.placeholder; }).map(function(ev){ return resolveEvent(ev, war); })
    .sort(function(a, b){ return sortKey(a.ev.sort).localeCompare(sortKey(b.ev.sort)); });
  var s = { key: key, war: war, events: events, markers: {}, filter: {}, bounds: [], day: null,
    placeholders: (war.events || []).filter(function(e){ return e.placeholder; }),
    layer: (function(){
      var stamp = function(n){ return L.divIcon({ className: '', html: '<div class="war-stamp" style="--wc:' + war.color + '">' + n + '</div>', iconSize: [40,40], iconAnchor: [20,20] }); };
      return makeClusterLayer(stamp, stamp);
    })(),
    lineLayer: L.layerGroup() };
  events.forEach(function(e, i){
    if (!e.ll) return;
    var m = L.marker(e.ll, { icon: warPinIcon(e.ev.type, false, e.ev.side), keyboard: true, title: '', ariaLabel: e.item.name });
    m.bindTooltip(esc(e.item.name) + (e.item.dating ? ' · ' + esc(e.item.dating) : '') + (e.ev.side ? ' · ' + esc(e.ev.side) : ''), { className: 'tt', direction: 'top', offset: [0, -14] });
    m.on('click', function(){ openEvent(key, i); });
    m.evType = e.ev.type;
    m.evRef = e;
    s.markers[e.ev.id] = m;
    s.bounds.push(e.ll);
  });
  s.lineParts = [];
  (war.lines || []).forEach(function(line){
    if (!line.coords || line.coords.length < 2) return;   // placeholders without coordinates are only listed
    var lt = LINE_TYPES[line.type] || { color: war.color, dash: null, arrow: false, label: '' };
    var color = line.color || lt.color;
    var geom = line.type === 'ostrzal' && line.coords.length === 2 ? ballisticArc(line.coords[0], line.coords[1]) : line.coords;
    var casing = L.polyline(geom, { color: getComputedStyle(document.documentElement).getPropertyValue('--casing').trim(), weight: 8, opacity: line.context ? 0.5 : 1, interactive: false }).addTo(s.lineLayer);
    var pl = L.polyline(geom, { color: color, weight: line.context ? 3 : 4, opacity: 0.95, dashArray: lt.dash || null, className: lt.animate ? 'fire-line' : '' }).addTo(s.lineLayer);
    pl.bindTooltip('<b>' + esc(line.title || lt.label) + '</b>' + (line.date ? '<br>' + esc(line.date) : '') + (line.side ? ' · ' + esc(line.side) : '') + (line.desc ? '<br>' + esc(line.desc) : ''), { className: 'tt', sticky: true });
    var ah = lt.arrow ? arrowHead(geom, color).addTo(s.lineLayer) : null;
    var paths = [casing, pl], ops = [line.context ? 0.5 : 1, 0.95];
    if (line.type === 'front') frontTeeth(line.coords, color).forEach(function(tp){ tp.addTo(s.lineLayer); paths.push(tp); ops.push(0.9); });
    var lbl = lineLabel(geom, (line.label || (lt.label + (line.date ? ' · ' + line.date : ''))).toUpperCase(), color);
    if (lbl) lbl.addTo(s.lineLayer);
    s.lineParts.push({ line: line, paths: paths, op: ops, arrow: ah, label: lbl });
    if (!line.context) line.coords.forEach(function(c){ s.bounds.push(L.latLng(c)); });
  });
  s.areaParts = [];
  (war.areas || []).forEach(function(ar){
    if (!ar.coords || ar.coords.length < 3) return;
    var col = ar.color || war.color;
    var pg = L.polygon(ar.coords, { color: col, weight: 2.5, dashArray: '7 5', fillColor: col, fillOpacity: 0.12, opacity: 0.95 }).addTo(s.lineLayer);
    pg.bindTooltip('<b>' + esc(ar.title) + '</b>' + (ar.desc ? '<br>' + esc(ar.desc) : ''), { className: 'tt', sticky: true });
    var c = pg.getBounds().getCenter();
    var lbl = L.marker([pg.getBounds().getNorth(), c.lng], { interactive: false, keyboard: false,
      icon: L.divIcon({ className: '', html: '<div class="war-label" style="--lc:' + col + ';transform:translate(-50%,-120%)"><span>' + esc((ar.label || ar.title).toUpperCase()) + '</span></div>', iconSize: [0, 0] }) }).addTo(s.lineLayer);
    s.areaParts.push({ area: ar, pg: pg, label: lbl, color: col });
    ar.coords.forEach(function(p){ s.bounds.push(L.latLng(p)); });
  });
  applyWarFilter(s);
  s.layer.on('animationend spiderfied', function(){ setActiveWar(activeWarMk); });
  warState[key] = s;
  return s;
}
// '1914-10' sorts after '1914-10-31', '1914' after '1914-12-31'.
function sortKey(k){ k = String(k || ''); return k.length === 4 ? k + '-99-99' : k.length === 7 ? k + '-99' : k; }
function lineActive(line, day){ if (!day || !line.from) return true; var r = rng(day); return line.from <= r.to && (line.to || line.from) >= r.from; }
// Diagonal hatching for areas (camp grounds etc.), injected into Leaflet's SVG renderer.
function hatchAreas(s){
  (s.areaParts || []).forEach(function(ap){
    var path = ap.pg._path, svg = path && path.ownerSVGElement;
    if (!svg) return;
    var id = 'hatch-' + ap.area.id, ns = 'http://www.w3.org/2000/svg';
    if (!svg.querySelector('#' + id)){
      var defs = svg.querySelector('defs') || svg.insertBefore(document.createElementNS(ns, 'defs'), svg.firstChild);
      var pat = document.createElementNS(ns, 'pattern');
      pat.setAttribute('id', id); pat.setAttribute('patternUnits', 'userSpaceOnUse');
      pat.setAttribute('width', '9'); pat.setAttribute('height', '9'); pat.setAttribute('patternTransform', 'rotate(45)');
      var ln = document.createElementNS(ns, 'line');
      ln.setAttribute('x1', '0'); ln.setAttribute('y1', '0'); ln.setAttribute('x2', '0'); ln.setAttribute('y2', '9');
      ln.setAttribute('stroke', ap.color); ln.setAttribute('stroke-width', '2.4'); ln.setAttribute('stroke-opacity', '0.55');
      pat.appendChild(ln); defs.appendChild(pat);
    }
    path.setAttribute('fill', 'url(#' + id + ')');
    path.setAttribute('fill-opacity', '1');
  });
}
function applyWarFilter(s){
  s.layer.clearLayers();
  Object.keys(s.markers).forEach(function(id){
    var m = s.markers[id];
    // With a day selected only that day's places are shown (clusters would hide "dimmed" pins).
    if (s.filter[m.evType] !== false && activeOn(m.evRef, s.day)) s.layer.addLayer(m);
  });
  (s.lineParts || []).forEach(function(lp){
    var on = lineActive(lp.line, s.day);
    lp.paths.forEach(function(p){ p.setStyle({ opacity: on ? lp.op[lp.paths.indexOf(p)] : 0.12 }); });
    if (lp.arrow) lp.arrow.setOpacity(on ? 1 : 0.15);
    if (lp.label) lp.label.setOpacity(on ? 1 : 0.2);
  });
  (s.areaParts || []).forEach(function(ap){
    var on = lineActive(ap.area, s.day);
    if (ap.pg._path) ap.pg._path.style.opacity = on ? 1 : 0.25;
    ap.label.setOpacity(on ? 1 : 0.25);
  });
  setActiveWar(activeWarMk);
}
function setActiveWar(mk){
  if (activeWarMk && activeWarMk._icon) activeWarMk._icon.classList.remove('is-active');
  activeWarMk = mk || null;
  if (mk && mk._icon){ mk._icon.classList.add('is-active'); mk.setZIndexOffset(1000); }
}
map.on('zoomend moveend', function(){ if (activeWarMk) setActiveWar(activeWarMk); });
function syncLabelZoom(){ mapEl.classList.toggle('war-zoom-low', map.getZoom() < 13); }
map.on('zoomend', syncLabelZoom);
syncLabelZoom();

function fitWar(s){
  if (!s.bounds.length) return;
  var open = [warSheet, panel].filter(function(x){ return x.classList.contains('open'); })[0];
  var top = mobileMQ.matches ? (($('war-chip').offsetHeight || 0) + 80) : 80;
  var bottom = ($('war-time').offsetHeight || 0) + 90;
  var pad = bottomSheets() ? { paddingTopLeft: [30, top], paddingBottomRight: [30, (open ? sheetPad(open) + 30 : bottom)] }
                           : { paddingTopLeft: [mobileMQ.matches ? 20 : 60, mobileMQ.matches ? top - 40 : 80], paddingBottomRight: [(open ? open.offsetWidth : 0) + (mobileMQ.matches ? 20 : 60), bottom] };
  map.fitBounds(L.latLngBounds(s.bounds), pad);
}
function warPoints(s){
  var pts = s.events.filter(function(x){ return x.ll && activeOn(x, s.day) && s.filter[x.ev.type] !== false; }).map(function(x){ return x.ll; });
  (s.lineParts || []).forEach(function(lp){ if (!lp.line.context && lineActive(lp.line, s.day)) lp.line.coords.forEach(function(c){ pts.push(L.latLng(c)); }); });
  (s.areaParts || []).forEach(function(ap){ if (lineActive(ap.area, s.day)) ap.area.coords.forEach(function(c){ pts.push(L.latLng(c)); }); });
  return pts;
}
function syncWarChip(){
  var chip = $('war-chip');
  chip.hidden = mode === 'modern';
  if (mode === 'modern') return;
  var s = warState[mode], w = s.war, d = s.day, sub;
  if (d && typeof d !== 'string') sub = d.label;
  else if (d){ var lb = dayLabel(d); sub = lb.d + ' ' + lb.m; }
  else sub = w.period;
  var n = s.events.filter(function(e){ return e.ll && activeOn(e, d) && s.filter[e.ev.type] !== false; }).length;
  chip.innerHTML = '<b>' + esc(w.label) + '</b><small>' + esc(sub) + ' · ' + n + ' na mapie</small>' +
    '<span class="key">' + (w.sidesKey || [{ label: 'Rosjanie', color: '#B3261E' }, { label: 'Niemcy', color: '#1F4E8C' }]).slice(0, 3)
      .map(function(k){ return '<span><i style="border-color:' + k.color + '"></i>' + esc(k.label) + '</span>'; }).join('') + '</span>';
}
$('war-chip').addEventListener('click', function(){ openWarSheet(); });

// Stops of the time scrubber: "whole period", then each day with events (WW1) or each period (WW2).
function warStops(s){
  if (s.stops) return s.stops;
  var war = s.war, stops = [null];
  if (war.phases) war.phases.forEach(function(ph, i){ stops.push({ from: ph.from, to: ph.to, label: ph.label, i: i }); });
  else if (war.days){
    var chron = {};
    (war.chronicle || []).forEach(function(c){ chron[c.sort] = 1; });
    dayList(war.days).forEach(function(d){ if (chron[d] || s.events.some(function(e){ return activeOn(e, d); })) stops.push(d); });
  }
  return (s.stops = stops);
}
function stopIndex(s){
  var st = warStops(s), d = s.day;
  for (var i = 1; i < st.length; i++){
    if (typeof d === 'string' ? st[i] === d : (d && st[i] && st[i].i === d.i)) return i;
  }
  return 0;
}
function stopLabel(st){
  if (!st) return 'cały okres';
  if (typeof st !== 'string') return st.label;
  var lb = dayLabel(st); return lb.d + ' ' + lb.m + ' ' + st.slice(0, 4);
}
function syncWarTime(){
  var box = $('war-time');
  box.hidden = mode === 'modern';
  if (mode === 'modern') return;
  var s = warState[mode], st = warStops(s), i = stopIndex(s), r = $('wt-range');
  if (st.length < 2){ box.hidden = true; return; }
  r.max = st.length - 1; r.value = i;
  r.setAttribute('aria-valuetext', stopLabel(st[i]));
  $('wt-cur').textContent = stopLabel(st[i]);
  $('wt-n').textContent = s.events.filter(function(e){ return e.ll && activeOn(e, s.day) && s.filter[e.ev.type] !== false; }).length + ' na mapie · ' + i + '/' + (st.length - 1);
  $('wt-prev').disabled = i === 0;
  $('wt-next').disabled = i === st.length - 1;
  var ticks = $('wt-ticks');
  if (ticks.dataset.war !== mode){
    ticks.dataset.war = mode;
    ticks.innerHTML = st.map(function(x, k){ return '<i style="left:' + (k / (st.length - 1) * 100) + '%"' + (k === 0 ? ' class="all"' : '') + '></i>'; }).join('');
  }
  [].forEach.call(ticks.children, function(t, k){ t.classList.toggle('on', k === i && k > 0); });
}
// One place that changes the selected day / period: map, sheet, chip and scrubber stay in sync.
var fitTimer;
// Re-render the sheet without losing the keyboard focus (the focused button is rebuilt)
function rerenderWarSheet(s){
  var a = document.activeElement, sel = a && warBody.contains(a) && a.dataset ? ['day', 'phase', 'wtype'].map(function(k){ return a.dataset[k] != null ? '[data-' + k + '="' + a.dataset[k] + '"]' : null; }).filter(Boolean)[0] : null;
  var y = warBody.scrollTop;
  renderWarSheet(s);
  warBody.scrollTop = y;
  var again = sel && warBody.querySelector(sel);
  if (again) again.focus({ preventScroll: true });
}
function setWarDay(s, day, fitNow){
  s.day = day;
  applyWarFilter(s);
  if (warSheet.classList.contains('open')){
    rerenderWarSheet(s);
    var sel = warBody.querySelector('.days button[aria-pressed="true"]');
    if (sel){ var strip = sel.parentNode; strip.scrollLeft = sel.offsetLeft - strip.offsetLeft - strip.clientWidth / 2 + sel.offsetWidth / 2; }
  }
  syncWarChip();
  syncWarTime();
  clearTimeout(fitTimer);
  fitTimer = setTimeout(function(){ var pts = warPoints(s); if (pts.length) fitWar({ bounds: pts }); }, fitNow ? 0 : 350);
}
function stepWar(delta){
  if (mode === 'modern') return;
  var s = warState[mode], st = warStops(s), i = Math.max(0, Math.min(st.length - 1, stopIndex(s) + delta));
  setWarDay(s, st[i], true);
}
$('wt-range').addEventListener('input', function(){
  if (mode === 'modern') return;
  var s = warState[mode];
  setWarDay(s, warStops(s)[parseInt(this.value, 10)] || null);
});
$('wt-prev').addEventListener('click', function(){ stepWar(-1); });
$('wt-next').addEventListener('click', function(){ stepWar(1); });
function setMode(m, quiet){
  if (m !== 'modern' && !WARS[m]) m = 'modern';
  if (m === mode){ if (m !== 'modern' && !quiet) openWarSheet(); return; }
  if (mode !== 'modern'){
    var prev = warState[mode];
    map.removeLayer(prev.layer); map.removeLayer(prev.lineLayer);
    setActiveWar(null);
  }
  var leavingWar = mode !== 'modern';
  mode = m;
  setPressed('wspolczesna', m === 'modern');
  setPressed('ww1', m === 'ww1');
  setPressed('ww2', m === 'ww2');
  mapEl.classList.toggle('war-mode', m !== 'modern');
  document.body.classList.toggle('war-on', m !== 'modern');
  if (m !== 'modern'){
    if (TRANSIT){ map.removeLayer(busLayer); busLineLayer.clearLayers(); busShown = {}; $('bus-btn').setAttribute('aria-pressed', 'false'); }
    if (POI){ map.removeLayer(poiLayer); nearSheet.classList.remove('open'); }
  } else if (TRANSIT && store('zbikow-bus') === '1'){ busLayer.addTo(map); $('bus-btn').setAttribute('aria-pressed', 'true'); }
  clearExtraActive();
  clearTimeout(fitTimer);
  var cart = $('war-cartouche');
  cart.hidden = m === 'modern';
  $('war-compass').toggleAttribute('hidden', m === 'modern');
  if (m !== 'modern'){
    var w = WARS[m];
    cart.innerHTML = '<b>' + esc(w.mapTitle || (w.label + ' · ' + w.period)) + '</b>' + (w.mapSubtitle ? '<small>' + esc(w.mapSubtitle) + '</small>' : '') +
      '<div class="key">' + (w.sidesKey || [{ label: 'wojska rosyjskie', color: '#B3261E' }, { label: 'wojska niemieckie', color: '#1F4E8C' }, { label: 'obie strony', color: '#6B2E83' }])
        .map(function(k){ return '<span><i style="border-color:' + k.color + '"></i>' + esc(k.label) + '</span>'; }).join('') + '</div>';
  }
  if (m === 'modern'){
    if (!map.hasLayer(markerLayer)) markerLayer.addTo(map);
    warSheet.classList.remove('open');
    if (leavingWar && !quiet && current && current.kind === 'event'){ panel.classList.remove('open'); current = null; }
    syncBodyState();
    syncWarChip();
    syncWarTime();
    setHash('');
    return;
  }
  if (activeRoute) endRoute();
  if (map.hasLayer(markerLayer)) map.removeLayer(markerLayer);
  setActiveMarker(null);
  var s = buildWar(m);
  s.lineLayer.addTo(map);
  s.layer.addTo(map);
  hatchAreas(s);
  syncWarChip();
  syncWarTime();
  if (current && (current.kind !== 'event' || current.warKey !== m)){ panel.classList.remove('open'); current = null; }
  // The sheet animates its height for 250 ms; measuring it earlier pads the map with a half-open sheet
  if (!quiet){ openWarSheet(); setTimeout(function(){ if (mode === m) fitWar(s.day ? { bounds: warPoints(s) } : s); }, 300); }
  else syncBodyState();
  setHash('');
}
function openWarSheet(){
  if (mode === 'modern') return;
  renderWarSheet(warState[mode]);
  showSheet(warSheet);
}
function renderWarSheet(s){
  var war = s.war;
  $('war-kicker').textContent = 'Warstwa historyczna · ' + war.period;
  $('war-title').textContent = war.label;
  var counts = {};
  s.events.forEach(function(e){ counts[e.ev.type] = (counts[e.ev.type] || 0) + 1; });
  var legend = Object.keys(counts).map(function(t){
    return '<button data-wtype="' + esc(t) + '" aria-pressed="' + String(s.filter[t] !== false) + '">' + glyphHTML(t, 'g') + esc(warType(t).label) + ' <small>' + counts[t] + '</small></button>';
  }).join('');
  var lastYear = '', shown = 0;
  var items = s.events.map(function(e, i){
    if (s.filter[e.ev.type] === false) return '';
    shown++;
    var year = String(e.ev.sort || '').slice(0, 4), head = '';
    if (year && year !== lastYear){ head = '<li class="year" aria-hidden="true">' + esc(year) + '</li>'; lastYear = year; }
    var where = e.ev.where || (e.place ? e.place.address : (e.item.locationDesc || ''));
    return head + '<li' + (activeOn(e, s.day) ? '' : ' class="off"') + '><button data-ev="' + i + '">' + glyphHTML(e.ev.type, 'g', e.ev.side) + '<span><span class="d">' + esc(e.item.dating || year) + '</span>' +
      esc(e.item.name) + (e.photos && e.photos.length ? camSvg : '') +
      '<small>' + esc(where) + (e.ll ? '' : (where ? ' · ' : '') + 'bez punktu na mapie') + '</small></span></button></li>';
  }).join('');
  var lines = (war.lines || []).map(function(line){
    var lt = LINE_TYPES[line.type] || { label: '', color: war.color };
    var missing = line.placeholder || !(line.coords && line.coords.length > 1);
    return '<li style="--lc:' + (line.color || lt.color) + '"><span class="sw' + (lt.dash ? ' dash' : '') + '" aria-hidden="true"></span><span><b>' + esc(line.title || lt.label) + '</b>' +
      (missing ? '<span class="todo">do uzupełnienia</span>' : '') +
      '<small>' + esc([lt.label, line.side, line.date].filter(Boolean).join(' · ')) + '</small>' + (line.desc ? esc(line.desc) : '') +
      (line.sources && line.sources.length ? '<small>Źródła: ' + esc(line.sources.map(function(x){ return typeof x === 'string' ? x : x.name; }).join(', ')) + '</small>' : '') + '</span></li>';
  }).join('');
  var ph = s.placeholders.map(function(ev){
    return '<li><span class="sw" aria-hidden="true"></span><span><b>' + esc(ev.title || 'Wydarzenie') + '</b><span class="todo">do uzupełnienia</span>' +
      (ev.desc ? '<small>' + esc(ev.desc) + '</small>' : '') + '</span></li>';
  }).join('');
  var daysHTML = '';
  if (war.phases){
    var inRange = function(c, r){ return c.sort >= r.from && c.sort <= r.to; };
    var cur = s.day && typeof s.day !== 'string' ? s.day : null;
    var notes = cur ? (war.chronicle || []).filter(function(c){ return inRange(c, cur); }) : [];
    daysHTML = '<div><div class="section-label">Okresy · kliknij, aby pokazać na mapie</div><div class="days phases" role="group" aria-label="Wybierz okres">' +
      '<button data-phase="" aria-pressed="' + String(!cur) + '"><small>cały</small>okres</button>' +
      war.phases.map(function(ph, i){
        var n = s.events.filter(function(e){ return activeOn(e, ph); }).length;
        return '<button data-phase="' + i + '" class="has" aria-pressed="' + String(!!cur && cur.i === i) + '">' + esc(ph.label) + '<small>' + n + ' miejsc</small></button>';
      }).join('') + '</div>' +
      (cur ? notes.slice(0, 6).map(function(c){ return '<div class="day-note"><b>' + esc(c.date) + '</b>' + esc(c.text) + '</div>'; }).join('') +
        (notes.length > 6 ? '<div class="day-note"><b>Kronika</b>… i ' + (notes.length - 6) + ' kolejnych wpisów (zobacz „Kronika” niżej).</div>' : '') +
        '<div class="day-note"><b>Na mapie</b>' + s.events.filter(function(e){ return activeOn(e, cur); }).length + ' wydarzeń z tego okresu (' + s.events.filter(function(e){ return e.ll && activeOn(e, cur); }).length + ' z punktem na mapie); linie z innych okresów są wyblakłe.</div>' : '') +
      '</div>';
  } else if (war.days){
    var chronByDay = {};
    (war.chronicle || []).forEach(function(c){ (chronByDay[c.sort] = chronByDay[c.sort] || []).push(c); });
    daysHTML = '<div><div class="section-label">Dzień po dniu · ' + esc(war.days.label) + '</div><div class="days" role="group" aria-label="Wybierz dzień">' +
      '<button data-day="" aria-pressed="' + String(!s.day) + '"><small>cały</small>okres</button>' +
      dayList(war.days).map(function(d){
        var lb = dayLabel(d), has = s.events.some(function(e){ return activeOn(e, d); }) || chronByDay[d];
        return '<button data-day="' + d + '" class="' + (has ? 'has' : '') + '" aria-pressed="' + String(s.day === d) + '"' + (has ? '' : ' disabled title="Brak wydarzeń tego dnia"') + '>' + lb.d + '<small>' + lb.m + '</small></button>';
      }).join('') + '</div>' +
      (s.day ? (chronByDay[s.day] || []).map(function(c){ return '<div class="day-note"><b>' + esc(c.date) + '</b>' + esc(c.text) + '</div>'; }).join('') +
        '<div class="day-note"><b>Na mapie</b>' + s.events.filter(function(e){ return activeOn(e, s.day); }).length + ' wydarzeń z tego dnia (' + s.events.filter(function(e){ return e.ll && activeOn(e, s.day); }).length + ' z punktem na mapie); linie z innych dni są wyblakłe.</div>' : '') +
      '</div>';
  }
  var chronHTML = (war.chronicle || []).length ? '<details class="notes"><summary>Kronika ' + esc(war.period) + ' (' + war.chronicle.length + ')</summary><ul class="chron">' +
    war.chronicle.map(function(c){
      return '<li><span class="cd">' + esc(c.date) + '</span><span><span class="sc ' + (c.scale === 'Front' ? 'front' : 'lok') + '">' + esc(c.scale === 'Front' ? 'front' : 'lokalnie') + '</span>' + esc(c.text) +
        (c.sources && c.sources.length ? '<small>Źródła: ' + esc(c.sources.join(', ')) + '</small>' : '') + '</span></li>';
    }).join('') + '</ul></details>' : '';
  var srcKeys = war.sources ? Object.keys(war.sources) : [];
  var srcHTML = srcKeys.length ? '<details class="notes"><summary>Źródła (' + srcKeys.length + ')</summary><ul class="src-list">' +
    srcKeys.map(function(k){
      var d = war.sources[k];
      return '<li><span><b>' + esc(k) + '</b>' + (d.url ? '<a href="' + esc(d.url) + '" target="_blank" rel="noopener">' + esc(d.name) + '</a>' : esc(d.name)) +
        '<small>' + esc([d.type, d.note].filter(Boolean).join(' · ')) + '</small></span></li>';
    }).join('') + '</ul></details>' : '';
  warBody.innerHTML = '<div class="panel-inner">' +
    (war.intro ? '<p class="war-intro' + (s.introOpen || war.intro.length < 160 ? '' : ' clamp') + '">' + esc(war.intro) + '</p>' +
      (war.intro.length < 160 ? '' : '<button class="intro-more" aria-expanded="' + String(!!s.introOpen) + '">' + (s.introOpen ? 'Zwiń ▴' : 'Czytaj więcej ▾') + '</button>') : '') +
    daysHTML +
    (legend ? '<div><div class="section-label">Legenda · kliknij, aby filtrować</div><div class="legend-chips">' + legend + '</div></div>' : '') +
    '<div><div class="section-label">Oś czasu (' + shown + ')</div>' +
      (items ? '<ul class="timeline">' + items + '</ul>' : '<p class="list-empty">Brak wydarzeń dla wybranych filtrów.</p>') + '</div>' +
    (lines ? '<div><div class="section-label">Front i kierunki ataków</div><ul class="line-list">' + lines + '</ul></div>' : '') +
    (ph ? '<div><div class="section-label">Do uzupełnienia</div><ul class="line-list">' + ph + '</ul></div>' : '') +
    chronHTML + srcHTML +
    (war.dataset ? '<p class="kicker" style="text-transform:none;letter-spacing:0;font-weight:500">Dane: ' + esc(war.dataset) + '</p>' : '') +
    '</div>';
}
warBody.addEventListener('click', function(e){
  var s = warState[mode];
  if (!s) return;
  var db = e.target.closest('[data-day],[data-phase]');
  if (db){
    var day;
    if (db.hasAttribute('data-phase')){
      var ph = db.dataset.phase === '' ? null : s.war.phases[parseInt(db.dataset.phase, 10)];
      day = ph ? { from: ph.from, to: ph.to, label: ph.label, i: parseInt(db.dataset.phase, 10) } : null;
    } else day = db.dataset.day || null;
    setWarDay(s, day, true);
    return;
  }
  var tb = e.target.closest('[data-wtype]');
  if (tb){
    var t = tb.dataset.wtype;
    s.filter[t] = s.filter[t] === false;
    applyWarFilter(s);
    rerenderWarSheet(s);
    syncWarChip();
    syncWarTime();
    return;
  }
  var mb = e.target.closest('.intro-more');
  if (mb){
    var p = warBody.querySelector('.war-intro');
    var open = p.classList.toggle('clamp') === false;
    s.introOpen = open;
    mb.textContent = open ? 'Zwiń ▴' : 'Czytaj więcej ▾';
    mb.setAttribute('aria-expanded', String(open));
    return;
  }
  var eb = e.target.closest('[data-ev]');
  if (eb) openEvent(mode, parseInt(eb.dataset.ev, 10));
});
function closeWarSheet(){
  warSheet.classList.remove('open', 'expanded');
  syncBodyState();
  if (mobileMQ.matches && mode !== 'modern' && !panel.classList.contains('open')){
    var pts = warPoints(warState[mode]);
    if (pts.length) fitWar({ bounds: pts });
  }
}
$('close-war').addEventListener('click', closeWarSheet);

function openEvent(key, i){
  var s = buildWar(key), e = s.events[i];
  if (!e) return false;
  if (mode !== key) setMode(key, true);
  clearTimeout(fitTimer);
  clearExtraActive();
  var ty = warType(e.ev.type);
  galleryLists = [];
  $('panel-kicker').textContent = s.war.label + ' · ' + s.war.period;
  panelBody.innerHTML = seqBarHTML('wb', s.war.color, s.war.label, 'Wydarzenie', i, s.events.length) +
    renderRecordHTML(e.item, e.place, {
      photos: e.photos, approx: e.ev.approx, sources: e.sources, noSiblings: true, hasPoint: !!e.ll,
      addr: e.ev.where && e.ll ? e.ev.where : null,
      badges: '<span class="badge" style="color:' + ty.color + '"><span class="dot"></span>' + esc(ty.label) + '</span>' +
        (e.ev.side ? '<span class="badge side-badge" style="--sc:' + sideColor(e.ev.side) + '"><i></i>' + esc(e.ev.side) + '</span>' : '') +
        certBadge(e.ev.certainty),
      facts: [['Względem torów', e.ev.tracks], ['Obszar', e.ev.area], ['ID w arkuszu', e.ev.code]],
      modernLink: e.modernLink
    });
  panelBody.scrollTop = 0;
  btn1944.hidden = !in1944(e.ll);
  current = { place: e.place, item: e.item, kind: 'event', warKey: key, warIndex: i };
  var wasOpen = panel.classList.contains('open');
  showSheet(panel);
  panel.focus({ preventScroll: true });
  setHash('', e.ev.id);
  var mk = s.markers[e.ev.id] || null;
  // Opening an event outside the selected day/period clears that filter so the event is visible.
  if (s.day && !activeOn(e, s.day)){ s.day = null; applyWarFilter(s); syncWarChip(); syncWarTime(); }
  setActiveWar(mk);
  if (mk){
    if (s.filter[e.ev.type] === false){ s.filter[e.ev.type] = true; applyWarFilter(s); syncWarChip(); syncWarTime(); }
    setTimeout(function(){ revealIn(s.layer, mk, function(){ setActiveWar(mk); }, 15); }, wasOpen ? 0 : 60);
  }
  return true;
}
function openEventById(key, id){
  var s = buildWar(key);
  for (var i = 0; i < s.events.length; i++) if (s.events[i].ev.id === id) return openEvent(key, i);
}
panel.addEventListener('click', function(e){
  var b = e.target.closest('[data-wb]');
  if (!b || !current || current.kind !== 'event') return;
  if (b.dataset.wb === 'list') openWarSheet();
  else if (b.dataset.wb === 'prev') openEvent(current.warKey, current.warIndex - 1);
  else if (b.dataset.wb === 'next') openEvent(current.warKey, current.warIndex + 1);
});
// War events are searchable too.
Object.keys(WARS).forEach(function(key){
  var war = WARS[key];
  if (!war || !war.events) return;
  war.events.forEach(function(ev){
    if (ev.placeholder) return;
    var r = resolveEvent(ev, war);
    var entry = { label: r.item.name, sub: war.label + (r.item.dating ? ' · ' + r.item.dating : ''), type: warType(ev.type).label,
                  go: function(){ openEventById(key, ev.id); }, mapped: !!r.ll };
    entry.nLabel = norm(entry.label); entry.nRest = norm(entry.sub + ' ' + entry.type);
    searchIndex.push(entry);
  });
});

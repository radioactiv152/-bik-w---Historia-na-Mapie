/* Żbików — Historia na mapie: Karta miejsca, galeria i karuzela, linki (#o= #p= #t= #w= #e= #s= #poi=).
 * Pliki js/ ładują się po kolei i dzielą jeden zakres globalny (kolejność ma znaczenie). */
// --- Panel rendering ---
var panel = $('panel'), panelBody = $('panel-body'), placesList = $('places-list'), routesSheet = $('routes-sheet'), warSheet = $('war-sheet'), nearSheet = $('near-sheet');
var pinSvg = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.2"/></svg>';

function confBadge(conf){
  if (!conf) return '';
  var n = norm(conf), cls = n.indexOf('wysoka') === 0 ? 'conf-wysoka' : n.indexOf('srednia') === 0 ? 'conf-srednia' : n.indexOf('niska') === 0 ? 'conf-niska' : '';
  return '<span class="badge ' + cls + '" title="Pewność informacji"><span class="dot"></span>Pewność: ' + esc(conf) + '</span>';
}
function factsBlock(item, sources, extra){
  var rows = '';
  (extra || []).forEach(function(f){ if (f[1]) rows += '<dt>' + esc(f[0]) + '</dt><dd>' + esc(f[1]) + '</dd>'; });
  if (item.dating) rows += '<dt>Datowanie</dt><dd>' + esc(item.dating) + '</dd>';
  if (item.source) rows += '<dt>Źródło</dt><dd>' + esc(item.source) + '</dd>';
  if (sources && sources.length) rows += '<dt>Źródła</dt><dd>' + sources.map(function(s){
    return s.url ? '<a href="' + esc(s.url) + '" target="_blank" rel="noopener" title="' + esc(s.name || s.url) + '">' + esc(s.name || s.url) + '</a>' : esc(s.name);
  }).join('<br>') + '</dd>';
  if (item.level) rows += '<dt>Lokalizacja</dt><dd>' + esc(item.level) + '</dd>';
  return rows ? '<dl class="facts">' + rows + '</dl>' : '';
}
function notesBlock(item){
  var out = '';
  if (item.dup) out += '<div class="warn">' + esc(item.dup) + '</div>';
  var inner = '';
  if (item.note) inner += '<div class="note">' + esc(item.note) + '</div>';
  if (item.mapNote) inner += '<div class="note">' + esc(item.mapNote) + '</div>';
  if (inner) out += '<details class="notes"><summary>Uwagi do źródeł i lokalizacji</summary><div class="notes-body">' + inner + '</div></details>';
  return out;
}
function siblingsBlock(place, orig){
  if (!place || !place.isGroup) return '';
  return '<div><div class="section-label">Pod tym samym adresem (' + place.members.length + ')</div><ul class="sibs">' +
    place.members.map(function(m){
      var cur = m.origId === orig;
      return '<li><button data-orig="' + m.origId + '"' + (cur ? ' aria-current="true"' : '') + '>' +
        '<span class="ind" aria-hidden="true"></span><span>' + esc(m.name) + (PHOTOS[m.origId] ? camSvg : '') +
        '<small>' + esc([m.type, m.dating].filter(Boolean).join(' · ')) + '</small></span></button></li>';
    }).join('') + '</ul></div>';
}
var camSvg = '<svg class="cam" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-label="ma zdjęcie"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>';
function photoCredit(ph){
  return (ph.caption ? '<b>' + esc(ph.caption) + '</b><br>' : '') +
    esc([ph.date, ph.author ? 'fot. ' + ph.author : ''].filter(Boolean).join(' · ')) +
    '<br>Źródło: <a href="' + esc(ph.sourceUrl) + '" target="_blank" rel="noopener">' + esc(ph.sourceName) + '</a> · ' + esc(ph.license);
}
var galleryLists = [];   // photo lists of the card currently shown (indexed by data-g)
function galleryBlock(orig, list){
  list = list || PHOTOS[orig];
  if (!list || !list.length) return '';
  var ph = list[0];
  galleryLists.push(list);
  return '<figure class="gallery" data-g="' + (galleryLists.length - 1) + '" data-i="0">' +
    '<button class="main" aria-label="Powiększ zdjęcie"><img src="' + esc(ph.thumb || ph.file) + '" alt="' + esc(ph.caption || '') + '" loading="lazy">' +
    '<span class="zoom" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></span></button>' +
    (list.length > 1 ? '<div class="thumbs">' + list.map(function(p, i){
      return '<button data-i="' + i + '"' + (i === 0 ? ' aria-current="true"' : '') + ' aria-label="Zdjęcie ' + (i + 1) + '"><img src="' + esc(p.thumb || p.file) + '" alt="" loading="lazy"></button>';
    }).join('') + '</div>' : '') +
    '<figcaption>' + photoCredit(ph) + '</figcaption></figure>';
}
// "ARTEFAKTY" / "CO TU PRODUKOWANO" highlighted links (data: data/artifacts.js).
var FEAT_KINDS = {
  artefakt: { label: 'Artefakty', cls: 'art', icon: '◆' },
  produkcja: { label: 'Co tu produkowano', cls: 'prod', icon: '⚙' }
};
function featItems(orig, kind){
  return (ARTIFACTS[orig] || []).filter(function(a){ return (a.kind || 'artefakt') === kind; });
}
function featBlock(orig){
  if (orig == null) return '';
  var html = Object.keys(FEAT_KINDS).map(function(k){
    var n = featItems(orig, k).length;
    if (!n) return '';
    var f = FEAT_KINDS[k];
    return '<button class="feat ' + f.cls + '" data-feat="' + k + '" data-orig="' + orig + '"><span aria-hidden="true">' + f.icon + '</span>' + f.label + ' <b>' + n + '</b></button>';
  }).join('');
  return html ? '<div class="feat-links">' + html + '</div>' : '';
}
// opts (war cards): { photos, badges, approx, sources, facts, addr, hasPoint, noSiblings, modernLink }
function renderRecordHTML(item, place, opts){
  opts = opts || {};
  var address = opts.addr || (place ? place.address : null);
  var photos = opts.photos || PHOTOS[item.origId];
  return '<div class="panel-inner">' + galleryBlock(item.origId, photos) +
      '<div class="badges">' + (opts.badges || '') +
        (item.type ? '<span class="badge">' + esc(item.type) + '</span>' : '') +
        confBadge(item.confidence) +
      '</div>' +
      '<div>' +
        '<h2 class="display title" id="panel-title">' + esc(item.name) + '</h2>' +
        (address ? '<div class="addr">' + pinSvg + '<span>' + esc(address) + '</span></div>'
                 : (item.locationDesc ? '<div class="addr">' + pinSvg + '<span>' + esc(item.locationDesc) + (opts.hasPoint ? '' : ' <span class="flag">brak punktu na mapie</span>') + '</span></div>' : '')) +
      '</div>' +
      featBlock(item.origId) +
      factsBlock(item, opts.sources, opts.facts) +
      ((opts.approx || item.approx || (place && place.approx)) ? '<div class="note approx">' + esc(opts.approx || item.approx || place.approx) + '</div>' : '') +
      (item.shortDesc ? '<p class="desc">' + esc(item.shortDesc) + '</p>' : '') +
      notesBlock(item) +
      (opts.modernLink != null ? '<button class="btn" data-modern="' + opts.modernLink + '">Pokaż to miejsce na mapie współczesnej</button>' : '') +
      (opts.noSiblings ? '' : siblingsBlock(place, item.origId)) +
    '</div>';
}

var current = null; // { rec }
function syncBodyState(){
  [panel, placesList, routesSheet, warSheet, nearSheet].forEach(function(x){ if (!x.classList.contains('open')) x.classList.remove('expanded'); });
  document.body.classList.toggle('panel-open', panel.classList.contains('open') || placesList.classList.contains('open') || routesSheet.classList.contains('open') || warSheet.classList.contains('open') || nearSheet.classList.contains('open'));
  setPressed('okolica', nearSheet.classList.contains('open'));
  setPressed('trasy', routesSheet.classList.contains('open') || !!activeRoute);
  setPressed('miejsca', placesList.classList.contains('open') && listFilter !== 'photos');
  setPressed('zdjecia', placesList.classList.contains('open') && listFilter === 'photos');
}
function showSheet(el){
  [panel, placesList, routesSheet, warSheet, nearSheet].forEach(function(s){ if (s !== el) s.classList.remove('open'); });
  // A list replacing an open card: the card's state and link go with it
  if (el !== panel && current){ current = null; setActiveMarker(null); setActiveWar(null); clearExtraActive(); setHash(''); }
  el.classList.add('open');
  if (el !== nearSheet) hidePoiLayerIfIdle();
  syncBodyState();
}
// Bus-stop / Okolica markers keep their own highlight; a pending reveal belongs to the card that asked for it
var activeBusMk = null, activePoiMk = null, revealSeq = 0;
function clearExtraActive(){
  [activeBusMk, activePoiMk].forEach(function(m){ if (m && m._icon) m._icon.classList.remove('is-active'); });
  activeBusMk = activePoiMk = null;
  revealSeq++;
  onMoveEnd(null);
}
function hidePoiLayerIfIdle(){
  if (POI && !nearSheet.classList.contains('open') && !(current && current.kind === 'poi') && map.hasLayer(poiLayer)) map.removeLayer(poiLayer);
}
function closeSheets(){
  panel.classList.remove('open');
  placesList.classList.remove('open');
  routesSheet.classList.remove('open');
  warSheet.classList.remove('open');
  nearSheet.classList.remove('open');
  setActiveMarker(null);
  setActiveWar(null);
  clearExtraActive();
  if (TRANSIT){ busLineLayer.clearLayers(); busShown = {}; }
  current = null;
  hidePoiLayerIfIdle();
  setHash('');
  syncBodyState();
}

function openRecord(orig, routeStop){
  var r = recordByOrig[orig];
  if (!r) return false;
  if (mode !== 'modern') setMode('modern', true);
  var p = r.place;
  $('panel-kicker').textContent = !p ? 'Bez punktu na mapie' : p.isGroup ? (p.groupName || 'Adres z kilkoma obiektami') : 'Karta miejsca';
  if (routeStop == null && activeRoute){ var si = activeRoute.stops.indexOf(orig); if (si !== -1) routeStop = si; }
  galleryLists = [];
  panelBody.innerHTML = (activeRoute && routeStop != null ? routeBarHTML(routeStop) : '') + renderRecordHTML(r.item, p);
  panelBody.scrollTop = 0;
  btn1944.hidden = !p || !in1944([p.lat, p.lng]);   // no photo outside the 1944 extent
  current = { place: r.place, item: r.item, kind: r.kind, routeStop: routeStop };
  var wasOpen = panel.classList.contains('open');
  clearExtraActive();
  var seq = revealSeq;
  showSheet(panel);
  panel.focus({ preventScroll: true });
  setHash(orig);
  if (p){
    setActiveMarker(orig);
    // Wait for the sheet to slide in so the offset is measured correctly.
    setTimeout(function(){ if (seq === revealSeq) revealMarker(orig, function(){ if (seq === revealSeq) setActiveMarker(orig); }); }, wasOpen ? 0 : 60);
  } else setActiveMarker(null);
  return true;
}
// A whole address (e.g. from search): fan its records out on the map.
function focusGroup(p){
  closeSheets();
  setHash(p.id, null, 'p');
  var first = p.members[0].origId;
  revealMarker(first, function(){});
  showToast((p.address) + ': ' + p.members.length + ' obiekty — wybierz punkt na mapie.');
}

panelBody.addEventListener('click', function(e){
  var b = e.target.closest('.sibs button[data-orig]');
  if (b) return openRecord(parseInt(b.dataset.orig, 10));
  var fb = e.target.closest('.feat[data-feat]');
  if (fb) return openFeatures(parseInt(fb.dataset.orig, 10), fb.dataset.feat);
  var mb = e.target.closest('[data-modern]');
  if (mb) return openRecord(parseInt(mb.dataset.modern, 10));
  var fig = e.target.closest('.gallery');
  if (!fig) return;
  var list = galleryLists[parseInt(fig.dataset.g, 10)];
  var t = e.target.closest('.thumbs button');
  if (t){
    var i = parseInt(t.dataset.i, 10), ph = list[i];
    fig.dataset.i = i;
    fig.querySelector('.main img').src = ph.thumb || ph.file;
    fig.querySelector('.main img').alt = ph.caption || '';
    fig.querySelector('figcaption').innerHTML = photoCredit(ph);
    fig.querySelectorAll('.thumbs button').forEach(function(x){ x.setAttribute('aria-current', String(x === t)); });
    return;
  }
  if (e.target.closest('.main')) openCarousel(photoSlides(list), parseInt(fig.dataset.i, 10), 'Zdjęcia archiwalne');
});

// --- Carousel: one component for archival photos, artefacts and products ---
// slide: { img, thumb, title, desc, meta, sub, sourceName, sourceUrl, license, author }
var cz = $('carousel'), czSlides = [], czIndex = 0;
function photoSlides(list){
  return list.map(function(ph){
    return { img: ph.file, thumb: ph.thumb, title: ph.caption, meta: ph.date, author: ph.author,
             sourceName: ph.sourceName, sourceUrl: ph.sourceUrl, license: ph.license };
  });
}
function featureSlides(items){
  var out = [];
  items.forEach(function(a, ai){
    var imgs = a.images && a.images.length ? a.images : [null];
    imgs.forEach(function(im, ii){
      out.push({ img: im && im.file, thumb: im && (im.thumb || im.file), title: a.name, desc: a.desc, meta: a.date,
        sub: (items.length > 1 ? (ai + 1) + ' z ' + items.length : '') + (imgs.length > 1 ? ' · zdjęcie ' + (ii + 1) + ' z ' + imgs.length : ''),
        caption: im && im.caption, author: im && im.author,
        sourceName: (im && im.sourceName) || a.source, sourceUrl: (im && im.sourceUrl) || a.sourceUrl, license: im && im.license });
    });
  });
  return out;
}
function openFeatures(orig, kind){
  var r = recordByOrig[orig];
  openCarousel(featureSlides(featItems(orig, kind)), 0, FEAT_KINDS[kind].label + (r ? ' · ' + r.item.name : ''));
}
function renderCarousel(){
  var s = czSlides[czIndex], n = czSlides.length;
  $('cz-media').innerHTML = s.img
    ? '<img src="' + esc(s.img) + '" alt="' + esc(s.caption || s.title || '') + '">'
    : '<div class="cz-ph"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.5"/><path d="m21 16-5-5-4 4-3-3-6 6"/></svg>Zdjęcie do uzupełnienia</div>';
  $('cz-meta').textContent = [s.meta, s.sub].filter(Boolean).join(' · ');
  $('cz-title').textContent = s.title || '';
  $('cz-desc').textContent = [s.desc, s.caption && s.caption !== s.title ? s.caption : ''].filter(Boolean).join(' — ');
  $('cz-desc').hidden = !$('cz-desc').textContent;
  var src = [];
  if (s.author) src.push('fot. ' + esc(s.author));
  if (s.sourceName || s.sourceUrl) src.push('Źródło: ' + (s.sourceUrl ? '<a href="' + esc(s.sourceUrl) + '" target="_blank" rel="noopener">' + esc(s.sourceName || s.sourceUrl) + '</a>' : esc(s.sourceName)));
  if (s.license) src.push(esc(s.license));
  $('cz-src').innerHTML = src.join(' · ');
  $('cz-count').textContent = n > 1 ? (czIndex + 1) + ' / ' + n : '';
  $('cz-prev').hidden = $('cz-next').hidden = n < 2;
  $('cz-thumbs').hidden = n < 2;
  $('cz-thumbs').innerHTML = n < 2 ? '' : czSlides.map(function(x, i){
    return '<button data-i="' + i + '"' + (i === czIndex ? ' aria-current="true"' : '') + ' aria-label="' + (i + 1) + '">' +
      (x.thumb ? '<img src="' + esc(x.thumb) + '" alt="" loading="lazy">' : '◆') + '</button>';
  }).join('');
}
function openCarousel(slides, start, kicker){
  if (!slides || !slides.length) return;
  czSlides = slides; czIndex = Math.max(0, Math.min(start || 0, slides.length - 1));
  $('cz-kicker').textContent = kicker || 'Zdjęcia';
  renderCarousel();
  if (cz.showModal){ if (!cz.open) cz.showModal(); } else cz.setAttribute('open', '');
}
function czGo(d){ if (czSlides.length > 1){ czIndex = (czIndex + d + czSlides.length) % czSlides.length; renderCarousel(); } }
$('cz-prev').addEventListener('click', function(){ czGo(-1); });
$('cz-next').addEventListener('click', function(){ czGo(1); });
$('cz-thumbs').addEventListener('click', function(e){
  var b = e.target.closest('button[data-i]');
  if (!b) return;
  czIndex = parseInt(b.dataset.i, 10);
  renderCarousel();
  var cur = $('cz-thumbs').querySelector('[aria-current="true"]');   // the clicked button was rebuilt; keep focus so arrows still work
  if (cur) cur.focus({ preventScroll: true });
});
$('close-cz').addEventListener('click', function(){ cz.close(); });
cz.addEventListener('click', function(e){ if (e.target === cz) cz.close(); });
cz.addEventListener('keydown', function(e){
  if (e.key === 'ArrowLeft'){ e.preventDefault(); czGo(-1); }
  else if (e.key === 'ArrowRight'){ e.preventDefault(); czGo(1); }
});
(function(){
  var x0 = null, stage = $('cz-stage');
  stage.addEventListener('touchstart', function(e){ x0 = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', function(e){
    if (x0 !== null){ var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) czGo(dx < 0 ? 1 : -1); }
    x0 = null;
  });
})();
$('close-panel').addEventListener('click', closeSheets);
btn1944.addEventListener('click', function(){
  var on = !map.hasLayer(layer1944);
  set1944(on);
  if (on && current && current.kind === 'event'){ if (activeWarMk) revealIn(warState[current.warKey].layer, activeWarMk, function(){}); }
  else if (on && current && current.place) revealMarker(current.item.origId, function(){});
});

// --- Deep links: #o=<origId> (a record), #p=<placeId> (an address), #s=<stopId> (a bus stop), #poi=<id> (Okolica) ---
var hashLock = false;
function setHash(v, ev, key){
  var parts = [];
  if (mode !== 'modern') parts.push('w=' + mode);
  if (ev) parts.push('e=' + ev);
  if (activeRoute) parts.push('t=' + activeRoute.id);
  if (v !== '' && v != null) parts.push((key || 'o') + '=' + (key ? encodeURIComponent(v) : v));
  var h = parts.length ? '#' + parts.join('&') : '';
  if (location.hash === h) return;
  hashLock = true;
  history.replaceState(null, '', h || location.pathname + location.search);
  hashLock = false;
}
function readHash(){
  var wm = location.hash.match(/[#&]w=(ww1|ww2)/), em = location.hash.match(/[#&]e=([\w-]+)/);
  if (wm && WARS[wm[1]]){
    setMode(wm[1], !!em);
    // An event id that no longer exists: behave like a plain #w= link (sheet open, map fitted)
    if (em && !openEventById(wm[1], em[1])){ openWarSheet(); setTimeout(function(){ fitWar(warState[wm[1]]); }, 300); }
    return true;
  }
  var tm = location.hash.match(/[#&]t=([\w-]+)/), om = location.hash.match(/[#&]o=(\d+)/);
  var sm = location.hash.match(/[#&](s|poi)=([^&]+)/);
  function openExtra(){
    if (!sm) return false;
    var id = decodeURIComponent(sm[2]);
    if (sm[1] === 's' && stopById[id]){ openBusStop(id); return true; }
    if (sm[1] === 'poi' && poiById[id]){ openPoi(id); return true; }
    return false;
  }
  if (tm && routeById[tm[1]]){
    startRoute(tm[1], !!(om || sm));
    if (om) openRecord(parseInt(om[1], 10)); else openExtra();
    return true;
  }
  if (sm) return openExtra();
  var m = location.hash.match(/^#(o|p)=(.+)$/);
  if (!m) return false;
  if (m[1] === 'o') return openRecord(parseInt(m[2], 10));
  var p = placeById[decodeURIComponent(m[2])];
  if (!p) return false;
  if (p.isGroup) focusGroup(p); else openRecord(p.origId);
  return true;
}
window.addEventListener('hashchange', function(){ if (!hashLock && !readHash() && !location.hash) closeSheets(); });

function copyLink(url){
  function done(){ showToast('Link do tego miejsca skopiowany.'); }
  if (navigator.clipboard && window.isSecureContext){
    navigator.clipboard.writeText(url).then(done, function(){ showToast(url); });
  } else { showToast(url); }
}
function shareTitle(){ var t = $('panel-title'); return (t ? t.textContent.trim() + ' — ' : '') + 'Żbików: Historia na mapie'; }
// Phones get the system share sheet; elsewhere the link goes to the clipboard
var canShare = !!(navigator.share && window.isSecureContext);
if (canShare) $('btn-share-label').textContent = 'Udostępnij';
$('btn-share').addEventListener('click', function(){
  var url = location.href;
  if (canShare) navigator.share({ title: shareTitle(), text: shareTitle(), url: url }).catch(function(e){ if (e && e.name !== 'AbortError') copyLink(url); });
  else copyLink(url);
});
// QR code of the current link, for printing (e.g. a plaque by the building)
var qrDlg = $('qr');
$('btn-qr').addEventListener('click', function(){
  if (typeof qrcode !== 'function'){ showToast('Generator kodów QR jeszcze się ładuje — spróbuj za chwilę.'); return; }
  var url = location.href, q = qrcode(0, 'M');
  q.addData(url); q.make();
  $('qr-box').innerHTML = q.createSvgTag({ cellSize: 6, margin: 4, scalable: true });
  $('qr-title').textContent = $('panel-title') ? $('panel-title').textContent.trim() : '';
  $('qr-url').textContent = url;
  document.body.classList.add('print-qr');
  if (qrDlg.showModal) qrDlg.showModal(); else qrDlg.setAttribute('open', '');
});
qrDlg.addEventListener('close', function(){ document.body.classList.remove('print-qr'); });
$('close-qr').addEventListener('click', function(){ qrDlg.close(); });
qrDlg.addEventListener('click', function(e){ if (e.target === qrDlg) qrDlg.close(); });
$('qr-print').addEventListener('click', function(){ window.print(); });
$('qr-copy').addEventListener('click', function(){ copyLink($('qr-url').textContent); });

/* Żbików — Historia na mapie: Wyszukiwarka, lista miejsc, pasek widoków.
 * Pliki js/ ładują się po kolei i dzielą jeden zakres globalny (kolejność ma znaczenie). */
// --- Search: every individual record (mapped members + unmapped) ---
var searchIndex = [];
PLACES.forEach(function(p){
  if (p.isGroup){
    if (p.members.every(function(m){ return m.name !== p.groupName; }))
      searchIndex.push({ label: p.groupName, sub: p.address, type: p.members.length + ' obiekty pod adresem', go: function(){ focusGroup(p); }, mapped: true });
    p.members.forEach(function(m){
      searchIndex.push({ label: m.name, sub: p.address, type: m.type, go: function(){ openRecord(m.origId); }, mapped: true });
    });
  } else {
    searchIndex.push({ label: p.name, sub: p.address, type: p.type, go: function(){ openRecord(p.origId); }, mapped: true });
  }
});
UNMAPPED.forEach(function(u){
  searchIndex.push({ label: u.name, sub: u.locationDesc || '', type: u.type, go: function(){ openRecord(u.origId); }, mapped: false });
});
searchIndex.forEach(function(s){ s.nLabel = norm(s.label); s.nRest = norm(s.sub + ' ' + (s.type || '')); });

var searchInput = $('search'), searchResults = $('search-results');
var matches = [], kbIndex = -1;
function closeResults(){
  searchResults.classList.remove('open');
  searchInput.setAttribute('aria-expanded', 'false');
  searchInput.removeAttribute('aria-activedescendant');
  kbIndex = -1;
}
function renderResults(){
  var q = norm(searchInput.value.trim());
  if (!q){ closeResults(); searchResults.innerHTML = ''; return; }
  // Name matches first (prefix before substring), then address/type matches.
  matches = searchIndex.map(function(s){
    var i = s.nLabel.indexOf(q);
    var score = s.nLabel === q ? 0 : i === 0 ? 1 : i > 0 ? 2 : s.nRest.indexOf(q) !== -1 ? 3 : -1;
    return { s: s, score: score };
  }).filter(function(x){ return x.score >= 0; })
    .sort(function(a, b){ return a.score - b.score || a.s.label.localeCompare(b.s.label, 'pl'); })
    .slice(0, 12).map(function(x){ return x.s; });
  kbIndex = matches.length ? 0 : -1;
  searchResults.innerHTML = matches.length ? matches.map(function(m, i){
    return '<button class="search-item' + (i === 0 ? ' kb' : '') + '" role="option" id="sr-' + i + '" data-i="' + i + '">' + highlight(m.label, q) +
      '<small>' + esc([m.sub, m.type].filter(Boolean).join(' · ')) + (m.mapped ? '' : ' <span class="flag">' + t('bez punktu') + '</span>') + '</small></button>';
  }).join('') : '<div class="search-empty">' + t('Brak wyników dla „') + '' + esc(searchInput.value.trim()) + '”.</div>';
  searchResults.classList.add('open');
  searchInput.setAttribute('aria-expanded', 'true');
  if (matches.length) searchInput.setAttribute('aria-activedescendant', 'sr-0'); else searchInput.removeAttribute('aria-activedescendant');
}
function moveKb(d){
  if (!matches.length) return;
  kbIndex = (kbIndex + d + matches.length) % matches.length;
  searchResults.querySelectorAll('.search-item').forEach(function(b, i){ b.classList.toggle('kb', i === kbIndex); });
  var el = $('sr-' + kbIndex);
  if (el){ el.scrollIntoView({ block: 'nearest' }); searchInput.setAttribute('aria-activedescendant', el.id); }
}
function pick(i){
  var m = matches[i];
  if (!m) return;
  closeResults();
  searchInput.value = '';
  searchInput.blur();
  m.go();
}
searchInput.addEventListener('input', renderResults);
searchInput.addEventListener('focus', function(){ if (searchInput.value.trim()) renderResults(); });
searchInput.addEventListener('keydown', function(e){
  if (e.key === 'ArrowDown'){ e.preventDefault(); moveKb(1); }
  else if (e.key === 'ArrowUp'){ e.preventDefault(); moveKb(-1); }
  else if (e.key === 'Enter'){ e.preventDefault(); pick(kbIndex); }
  else if (e.key === 'Escape'){ searchInput.value = ''; closeResults(); searchInput.blur(); e.stopPropagation(); }
});
searchResults.addEventListener('click', function(e){
  var btn = e.target.closest('.search-item');
  if (btn) pick(parseInt(btn.dataset.i, 10));
});
searchResults.addEventListener('keydown', function(e){
  if (e.key === 'Escape'){ e.stopPropagation(); closeResults(); searchInput.focus(); }
});
document.addEventListener('click', function(e){
  if (!e.target.closest('.search-wrap')) closeResults();
});

// --- Places list (MIEJSCA) ---
var placesUl = $('places-ul');
var flatList = [];
PLACES.forEach(function(p){
  if (p.isGroup){
    p.members.forEach(function(m){ flatList.push({ label: m.name, sub: p.address, orig: m.origId, mapped: true }); });
  } else {
    flatList.push({ label: p.name, sub: p.address, orig: p.origId, mapped: true });
  }
});
UNMAPPED.forEach(function(u){ flatList.push({ label: u.name, sub: u.locationDesc || '', orig: u.origId, mapped: false }); });
flatList.forEach(function(m){ m.photo = !!PHOTOS[m.orig]; m.feat = !!(ARTIFACTS[m.orig] && ARTIFACTS[m.orig].length); });
flatList.forEach(function(m){ m.n = norm(m.label + ' ' + m.sub); m.key = m.label.replace(/^[„"'(\s]+/, ''); });
flatList.sort(function(a,b){ return a.key.localeCompare(b.key, 'pl'); });

var listFilter = 'all';
function renderList(){
  var q = norm($('list-filter').value.trim());
  var rows = flatList.filter(function(m){
    if (listFilter === 'mapped' && !m.mapped) return false;
    if (listFilter === 'unmapped' && m.mapped) return false;
    if (listFilter === 'photos' && !m.photo) return false;
    if (listFilter === 'feat' && !m.feat) return false;
    return !q || m.n.indexOf(q) !== -1;
  });
  var lastLetter = '', html = '';
  rows.forEach(function(m){
    var first = m.key.charAt(0).toLocaleUpperCase('pl');
    if (first !== lastLetter && !q){ html += '<li class="letter" aria-hidden="true">' + esc(first) + '</li>'; lastLetter = first; }
    html += '<li><button data-orig="' + m.orig + '"><span class="ind' + (m.mapped ? '' : ' off') + '" aria-hidden="true"></span><span>' + esc(m.label) + (m.photo ? camSvg : '') +
      '<small>' + esc(m.sub) + (m.mapped ? '' : t(' · bez punktu na mapie')) + '</small></span></button></li>';
  });
  placesUl.innerHTML = html || '<li class="list-empty">' + t('Nic nie pasuje do filtra.') + '</li>';
  $('list-count').textContent = rows.length === totalAll ? totalAll + t(' obiektów · ') + totalMapped + t(' na mapie') : rows.length + t(' z ') + totalAll + t(' obiektów');
}
renderList();
$('list-filter').addEventListener('input', renderList);
function setListFilter(f){
  listFilter = f;
  document.querySelectorAll('.chips button').forEach(function(x){ x.setAttribute('aria-pressed', String(x.dataset.f === f)); });
  renderList();
  syncBodyState();
}
document.querySelectorAll('.chips button').forEach(function(b){
  b.addEventListener('click', function(){ setListFilter(b.dataset.f); });
});
placesUl.addEventListener('click', function(e){
  var btn = e.target.closest('button[data-orig]');
  if (btn) openRecord(parseInt(btn.dataset.orig, 10));
});
$('close-list').addEventListener('click', function(){ placesList.classList.remove('open'); syncBodyState(); });

// --- Layer / view toolbar ---
var segButtons = document.querySelectorAll('.seg-btn');
function setPressed(layer, on){
  segButtons.forEach(function(b){ if (b.dataset.layer === layer) b.setAttribute('aria-pressed', String(on)); });
}
var toast = $('toast'), toastTimer;
function showToast(msg){
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function(){ toast.classList.remove('show'); }, 4200);
}
segButtons.forEach(function(btn){
  btn.addEventListener('click', function(){
    var layer = btn.dataset.layer;
    if (layer === 'wspolczesna') setMode('modern');
    else if (layer === 'okolica'){
      if (nearSheet.classList.contains('open')) closeNear();
      else openNear();
    }
    else if (layer === 'ww1' || layer === 'ww2'){
      if (mode === layer && warSheet.classList.contains('open')) closeWarSheet();
      else if (mode === layer) openWarSheet();
      else setMode(layer);
    }
    else if (layer === 'miejsca'){
      if (placesList.classList.contains('open') && listFilter !== 'photos'){ placesList.classList.remove('open'); syncBodyState(); }
      else { showSheet(placesList); setActiveMarker(null); if (listFilter === 'photos') setListFilter('all'); setTimeout(function(){ if (!mobileMQ.matches) $('list-filter').focus(); }, 260); }
    }
    else if (layer === 'zdjecia'){
      if (placesList.classList.contains('open') && listFilter === 'photos'){ placesList.classList.remove('open'); syncBodyState(); }
      else { showSheet(placesList); setActiveMarker(null); setListFilter('photos'); }
    }
    else if (layer === 'trasy'){
      if (routesSheet.classList.contains('open')){ routesSheet.classList.remove('open'); syncBodyState(); }
      else openRoutes();
    }
  });
});

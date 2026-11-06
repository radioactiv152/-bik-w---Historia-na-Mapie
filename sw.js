/* Żbików — Historia na mapie: service worker.
 * Strona, dane i miniatury działają bez sieci; kafelki map są zapamiętywane w ograniczonej liczbie.
 * Zmiana wersji poniżej (albo listy plików) usuwa stary cache przy następnym otwarciu. */
var VERSION = 'zbikow-v2';
var SHELL = [
  './', 'index.html', 'css/app.css', 'css/fonts.css',
  'js/00-core.js', 'js/05-i18n.js', 'js/10-map.js', 'js/20-panel.js', 'js/30-search-list.js', 'js/40-routes.js', 'js/50-wars.js', 'js/60-transit.js', 'js/70-poi.js', 'js/90-app.js',
  'data/places.js', 'data/photos.js', 'data/routes.js', 'data/wars.js', 'data/artifacts.js', 'data/transit.js', 'data/poi.js',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.5.3/MarkerCluster.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/1.5.3/leaflet.markercluster.js',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js'
];
var TILE_CACHE = VERSION + '-tiles', TILE_LIMIT = 600;
var TILE_HOSTS = /(tile\.openstreetmap\.(org|fr)|arcgisonline\.com|mapwarper\.net)$/;

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(VERSION).then(function(c){
    // Fonts and thumbnails are fetched from the stylesheet / data, not listed by hand
    return c.addAll(SHELL).then(function(){ return fetch('css/fonts.css').then(function(r){ return r.text(); }).then(function(css){
      var urls = (css.match(/url\(([^)]+)\)/g) || []).map(function(u){ return 'css/' + u.slice(4, -1); });
      return c.addAll(urls);
    }).catch(function(){}); });
  }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k !== VERSION && k !== TILE_CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});

function trimTiles(){
  return caches.open(TILE_CACHE).then(function(c){ return c.keys().then(function(keys){
    if (keys.length <= TILE_LIMIT) return;
    return Promise.all(keys.slice(0, keys.length - TILE_LIMIT).map(function(k){ return c.delete(k); }));
  }); });
}

self.addEventListener('fetch', function(e){
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  // Map tiles: network first (fresh), cache as a fallback for offline use
  if (TILE_HOSTS.test(url.hostname)){
    e.respondWith(fetch(req).then(function(res){
      if (res.ok){ var copy = res.clone(); caches.open(TILE_CACHE).then(function(c){ c.put(req, copy); trimTiles(); }); }
      return res;
    }).catch(function(){ return caches.match(req); }));
    return;
  }
  var sameOrigin = url.origin === self.location.origin, cdn = url.hostname === 'cdnjs.cloudflare.com';
  if (!sameOrigin && !cdn) return;
  // Page, data, images, fonts, libraries: serve from cache at once, refresh in the background
  e.respondWith(caches.open(VERSION).then(function(c){
    return c.match(req, { ignoreSearch: sameOrigin }).then(function(cached){
      var network = fetch(req).then(function(res){ if (res.ok) c.put(req, res.clone()); return res; }).catch(function(){ return cached; });
      return cached || network;
    });
  }));
});

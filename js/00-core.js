/* Żbików — Historia na mapie: Pomocnicze funkcje, dane z data/*.js, indeks rekordów.
 * Pliki js/ ładują się po kolei i dzielą jeden zakres globalny (kolejność ma znaczenie). */
var D = window.ZBIKOW || {};
var PLACES = D.places || [], UNMAPPED = D.unmapped || [], PHOTOS = D.photos || {}, ROUTES = D.routes || [];
var WARS = D.wars || {}, ARTIFACTS = D.artifacts || {}, TRANSIT = D.transit || null, POI = D.poi || null;
// Data lives in data/*.js (see the header of each file for its schema).

var mobileMQ = window.matchMedia('(max-width: 860px)');
var landMQ = window.matchMedia('(max-width: 860px) and (orientation: landscape) and (max-height: 520px)');
function bottomSheets(){ return mobileMQ.matches && !landMQ.matches; }
function $(id){ return document.getElementById(id); }

function esc(s){
  if (s === null || s === undefined) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
// Lowercase + strip Polish diacritics so "zbikow" finds "Żbików".
function norm(s){
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/ł/g,'l');
}
function highlight(text, q){
  if (!q) return esc(text);
  var n = norm(text), i = n.indexOf(q);
  if (i === -1) return esc(text);
  return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + q.length)) + '</mark>' + esc(text.slice(i + q.length));
}

// --- Index records ---
var placeById = {}, recordByOrig = {}, totalMapped = 0;
PLACES.forEach(function(p){
  placeById[p.id] = p;
  if (p.isGroup){
    p.members.forEach(function(m){ recordByOrig[m.origId] = { kind: 'member', place: p, item: m }; });
    totalMapped += p.members.length;
  } else {
    recordByOrig[p.origId] = { kind: 'single', place: p, item: p };
    totalMapped += 1;
  }
});
UNMAPPED.forEach(function(u){ recordByOrig[u.origId] = { kind: 'unmapped', place: null, item: u }; });
var totalAll = totalMapped + UNMAPPED.length;

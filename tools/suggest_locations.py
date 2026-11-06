#!/usr/bin/env python3
"""Raport miejsc bez punktu na mapie z podpowiedziami lokalizacji.

Czyta data/places.js (rekordy „unmapped”) i data/wars.js (wydarzenia bez współrzędnych) i dla każdego
próbuje zaproponować punkt:
  1. obiekt z bazy — gdy opis lokalizacji wymienia miejsce, które już ma punkt (np. „cmentarz żbikowski”),
  2. adres — ulica z numerem znaleziona w OpenStreetMap (Nominatim),
  3. ulica — sam środek ulicy w OSM (punkt orientacyjny, do ręcznego doprecyzowania).
Nic nie zapisuje do danych: wynik to tools/unmapped_report.md do przejrzenia i ręcznego zatwierdzenia.

Użycie: python3 tools/suggest_locations.py [--no-net]   (Nominatim: 1 zapytanie/s, wymaga sieci)
"""
import json, os, re, sys, time, urllib.parse, urllib.request, unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UA = 'ZbikowMap/1.0 (github.com/radioactiv152)'
VIEWBOX = '20.74,52.21,20.87,52.12'   # Żbików i Pruszków
NET = '--no-net' not in sys.argv


def load_js(path, var):
    """Pliki data/*.js to JavaScript (wars.js ma klucze bez cudzysłowów), więc czyta je node."""
    import subprocess
    code = "global.window={};eval(require('fs').readFileSync(process.argv[1],'utf8'));process.stdout.write(JSON.stringify(window.ZBIKOW[process.argv[2]]))"
    return json.loads(subprocess.check_output(['node', '-e', code, os.path.join(ROOT, path), var]))


def fold(s):
    s = unicodedata.normalize('NFKD', s or '').lower()
    return ''.join(c for c in s if not unicodedata.combining(c))


_cache = {}
def nominatim(params):
    key = json.dumps(params, sort_keys=True)
    if key in _cache: return _cache[key]
    if not NET: return []
    url = 'https://nominatim.openstreetmap.org/search?' + urllib.parse.urlencode(dict(params, format='jsonv2', limit=1, viewbox=VIEWBOX, bounded=1, countrycodes='pl'))
    res = []
    for attempt in range(4):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA})
            res = json.load(urllib.request.urlopen(req, timeout=30)); break
        except urllib.error.HTTPError as e:
            if e.code == 429: time.sleep(5 * (attempt + 1)); continue   # przeciążenie: odczekaj i spróbuj ponownie
            print('Nominatim', e, file=sys.stderr); break
        except Exception as e:
            print('Nominatim', e, file=sys.stderr); break
    _cache[key] = res
    time.sleep(1.5)   # polityka Nominatim: najwyżej 1 zapytanie na sekundę
    return res


STREET_RE = re.compile(r'(?:ul\.|ulic[ay]|przy|róg|rejon|okolic[ea]|na|al\.)?\s*((?:3 Maja|[A-ZŻŹĆŃŁŚÓ][\w\-]+(?: [A-ZŻŹĆŃŁŚÓ][\w\-]+)?))\s*(\d+[A-Za-z]?)?', re.U)
STOP = {'Stary', 'Żbików', 'Pruszków', 'Żbikowa', 'Pruszkowa', 'Warszawy', 'Warszawa', 'Teren', 'Rejon', 'Okolice', 'Dokładny', 'Przy', 'ZNTK'}


def street_candidates(text):
    """Ulice (i numery) wymienione w opisie lokalizacji — do zapytań adresowych."""
    out = []
    for m in re.finditer(r'(?:ul\.|ulic[ay]|al\.)\s*([^,;/()]+?)(?:\s+(\d+[A-Za-z]?))?(?=[,;/()]|\s+i\s|\s*$| / )', text or ''):
        name = m.group(1).strip()
        if name and name.split()[0] not in STOP: out.append((name, m.group(2)))
    m = re.search(r'\b(3 Maja)\s*(\d+[A-Za-z]?)?', text or '')
    if m and not any(n == '3 Maja' for n, _ in out): out.append((m.group(1), m.group(2)))
    return out


COMMON = {'przy', 'dawny', 'dawna', 'dawne', 'dawnego', 'zbikow', 'zbikowski', 'zbikowska', 'zbikowskie', 'pruszkow', 'pruszkowa', 'budynek', 'teren', 'miejsce', 'obecny', 'obecnie', 'kamienica', 'domy', 'okolice', 'rejon'}
def known_place_match(text, places):
    """Obiekt z bazy: opis lokalizacji zawiera adres obiektu (np. „3 Maja 8A”) albo charakterystyczne słowa jego nazwy."""
    t = fold(text)
    best = None
    for p in places:
        addr = re.sub(r'^(ul\.|al\.|pl\.)\s*', '', fold(p.get('address', ''))).strip()
        for rec in (p.get('members') or [p]):
            words = [w for w in re.findall(r'[a-z0-9]{5,}', fold(rec['name'])) if w not in COMMON]
            hit = sum(1 for w in words if w in t)
            score = 0
            if addr and len(addr) > 5 and addr in t: score = 10 + hit           # adres w opisie — najpewniejsze
            elif hit >= 2 or (hit == 1 and len(words) == 1 and len(words[0]) >= 7): score = hit
            if score and (not best or score > best[0]): best = (score, rec['name'], p['lat'], p['lng'], p['address'])
    return best


def suggest(text, places):
    text = text or ''
    kp = known_place_match(text, places)
    if kp: return ('obiekt z bazy', kp[2], kp[3], '%s (%s)' % (kp[1], kp[4]))
    for name, num in street_candidates(text):
        if num:
            r = nominatim({'street': num + ' ' + name, 'city': 'Pruszków'})
            if r: return ('adres', float(r[0]['lat']), float(r[0]['lon']), r[0]['display_name'].split(', powiat')[0])
    for name, num in street_candidates(text):
        r = nominatim({'q': name + ', Pruszków'})
        if r: return ('ulica (środek)', float(r[0]['lat']), float(r[0]['lon']), r[0]['display_name'].split(', powiat')[0])
    return ('brak', None, None, '')


def main():
    places = load_js('data/places.js', 'places')
    unmapped = load_js('data/places.js', 'unmapped')
    wars = load_js('data/wars.js', 'wars')
    rows, stats = [], {}
    def add(section, ident, name, kind, where, level):
        kind_s, lat, lng, src = suggest(where, places)
        stats[kind_s] = stats.get(kind_s, 0) + 1
        rows.append((section, ident, name, kind, where, level, kind_s, lat, lng, src))
    for r in unmapped:
        add('Miejsca', r['origId'], r['name'], r.get('type', ''), (r.get('locationDesc') or '') + ('; ' + r['mapNote'] if r.get('mapNote') else ''), r.get('level', ''))
    for key in ('ww1', 'ww2'):
        for e in wars[key]['events']:
            if e.get('lat') is None:
                add(wars[key]['label'], e['id'], e.get('title') or e.get('name') or e['id'], e.get('type', ''), e.get('where') or '', e.get('certainty', ''))
    out = ['# Miejsca bez punktu na mapie — podpowiedzi lokalizacji', '',
           'Wygenerowane przez `tools/suggest_locations.py`. Podpowiedzi są do **ręcznego sprawdzenia**; nic nie trafia do danych automatycznie.',
           'Zatwierdzony punkt wpisz do arkusza (kolumny „Szer. geogr.” / „Dł. geogr.”) albo do `data/places.js` (pole `lat`/`lng`, rekord przenieś z `unmapped` do `places`).', '',
           'Rodzaj podpowiedzi: **obiekt z bazy** — opis wymienia miejsce, które już ma punkt; **adres** — ulica z numerem w OSM; **ulica (środek)** — tylko ulica, punkt orientacyjny; **brak** — opis bez adresu (np. „adresy nieznane”).', '',
           'Podsumowanie: ' + ', '.join('%s: %d' % kv for kv in sorted(stats.items())) + ' (razem %d).' % len(rows), '']
    cur = None
    for section, ident, name, kind, where, level, kind_s, lat, lng, src in rows:
        if section != cur:
            cur = section
            out += ['', '## ' + section, '', '| ID | Nazwa | Typ | Lokalizacja (opis) | Podpowiedź | Punkt | Źródło podpowiedzi |', '|---|---|---|---|---|---|---|']
        pt = '%.6f, %.6f' % (lat, lng) if lat is not None else ''
        link = ' [mapa](https://www.openstreetmap.org/?mlat=%.6f&mlon=%.6f#map=18/%.6f/%.6f)' % (lat, lng, lat, lng) if lat is not None else ''
        cell = lambda s: str(s).replace('|', '\\|').replace('\n', ' ')
        out.append('| %s | %s | %s | %s | %s | %s%s | %s |' % (ident, cell(name), cell(kind), cell(where), kind_s, pt, link, cell(src)))
    path = os.path.join(ROOT, 'tools', 'unmapped_report.md')
    open(path, 'w', encoding='utf-8').write('\n'.join(out) + '\n')
    print('zapisano', path, stats)


if __name__ == '__main__':
    main()

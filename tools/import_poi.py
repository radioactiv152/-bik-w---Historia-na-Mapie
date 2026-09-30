#!/usr/bin/env python3
"""Okolica: kultura, kawiarnie, sklepy spożywcze, stacje paliw i apteki -> data/poi.js

Dane z OpenStreetMap (licencja ODbL, © autorzy OpenStreetMap) pobierane przez Overpass API.
Godziny otwarcia (opening_hours) są tu zamieniane na prosty tygodniowy plan w minutach, żeby strona
mogła policzyć „otwarte teraz” bez ciężkiej biblioteki. Nietypowe zapisy zostają jako tekst.

Użycie:  python3 tools/import_poi.py               (pobiera świeże dane)
         python3 tools/import_poi.py --raw plik.json  (używa zapisanej odpowiedzi Overpass)
"""
import json, math, os, re, sys, urllib.request, urllib.parse, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MARGIN_M = 1500
MIRRORS = ['https://overpass-api.de/api/interpreter', 'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
           'https://overpass.kumi.systems/api/interpreter', 'https://overpass.private.coffee/api/interpreter']
CATS = {
    'kultura': 'Kultura', 'kawiarnie': 'Kawiarnie', 'spozywcze': 'Sklepy spożywcze', 'paliwo': 'Stacje paliw', 'apteki': 'Apteki',
}
SUB = {
    'library': ('kultura', 'biblioteka'), 'arts_centre': ('kultura', 'dom kultury'), 'theatre': ('kultura', 'teatr'),
    'cinema': ('kultura', 'kino'), 'community_centre': ('kultura', 'ośrodek kultury'), 'museum': ('kultura', 'muzeum'),
    'gallery': ('kultura', 'galeria'), 'cafe': ('kawiarnie', 'kawiarnia'), 'fuel': ('paliwo', 'stacja paliw'),
    'pharmacy': ('apteki', 'apteka'), 'supermarket': ('spozywcze', 'supermarket'), 'convenience': ('spozywcze', 'sklep spożywczy'),
    'bakery': ('spozywcze', 'piekarnia'), 'greengrocer': ('spozywcze', 'warzywniak'), 'butcher': ('spozywcze', 'mięsny'),
}
SKIP_NAME = re.compile(r'poradni', re.I)   # community_centre w OSM obejmuje też poradnie – to nie placówki kultury

DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
D = r'(?:Mo|Tu|We|Th|Fr|Sa|Su)'
DSEL = r'(?:%s(?:\s*-\s*%s)?|PH)' % (D, D)
T = r'\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}'
RULE = re.compile(r'(?:(?P<days>%s(?:\s*,\s*%s)*)\s+)?(?P<times>off|closed|%s(?:\s*,\s*%s)*)' % (DSEL, DSEL, T, T))


def tmin(s):
    h, m = s.strip().split(':'); return int(h) * 60 + int(m)


def parse_hours(raw):
    """'Mo-Fr 06:00-22:00; Sa 07:00-21:00; PH off' -> {'w': [[[360,1320]],…7], 'ph': [] | None}; None when unsupported."""
    s = raw.strip()
    if s == '24/7':
        return {'w': [[[0, 1440]] for _ in range(7)], 'ph': None}
    week = [[] for _ in range(7)]; ph = None; pos = 0; seen = False
    for m in RULE.finditer(s):
        if s[pos:m.start()].strip(' ;,'):
            return None
        pos = m.end(); seen = True
        days, times = m.group('days'), m.group('times')
        if times in ('off', 'closed'): iv = []
        else:
            iv = []
            for part in times.split(','):
                a, b = part.split('-'); a, b = tmin(a), tmin(b)
                if b <= a: b += 1440   # past midnight
                iv.append([a, b])
        targets, is_ph = set(), False
        for sel in (days.split(',') if days else ['Mo-Su']):
            sel = sel.strip()
            if sel == 'PH': is_ph = True; continue
            if '-' in sel:
                a, b = [DAYS.index(x.strip()) for x in sel.split('-')]
                i = a
                while True:
                    targets.add(i)
                    if i == b: break
                    i = (i + 1) % 7
            else: targets.add(DAYS.index(sel))
        for i in targets: week[i] = iv   # a later rule replaces an earlier one for its days (OSM semantics)
        if is_ph: ph = iv
    if not seen or s[pos:].strip(' ;,'):
        return None
    return {'w': week, 'ph': ph}


def places_bbox():
    s = open(os.path.join(ROOT, 'data', 'places.js'), encoding='utf-8').read()
    P = json.loads(re.search(r'places = (\[.*?\]);\n', s, re.S).group(1))
    la = [p['lat'] for p in P]; lo = [p['lng'] for p in P]
    dl = MARGIN_M / 111320.0; dg = MARGIN_M / (111320.0 * math.cos(math.radians(52.17)))
    return min(la) - dl, min(lo) - dg, max(la) + dl, max(lo) + dg


def fetch(bbox):
    b = '%.4f,%.4f,%.4f,%.4f' % bbox
    q = ('[out:json][timeout:90];(nwr["amenity"~"^(library|cafe|fuel|pharmacy|arts_centre|theatre|cinema|community_centre)$"](%s);'
         'nwr["tourism"~"^(museum|gallery)$"](%s);nwr["shop"~"^(supermarket|convenience|bakery|greengrocer|butcher)$"](%s););out center tags;') % (b, b, b)
    data = urllib.parse.urlencode({'data': q}).encode()
    last = None
    for url in MIRRORS:
        try:
            req = urllib.request.Request(url, data=data, headers={'User-Agent': 'ZbikowMap/1.0 (github.com/radioactiv152)'})
            return json.load(urllib.request.urlopen(req, timeout=120))
        except Exception as e:
            last = e; print('Overpass', url, e, file=sys.stderr)
    raise SystemExit('Overpass niedostępny: %s' % last)


def main():
    raw = json.load(open(sys.argv[sys.argv.index('--raw') + 1])) if '--raw' in sys.argv else fetch(places_bbox())
    out, unparsed = [], 0
    for e in raw['elements']:
        t = e.get('tags', {})
        kind = t.get('amenity') or t.get('tourism') or t.get('shop')
        if kind not in SUB: continue
        cat, sub = SUB[kind]
        name = t.get('name') or t.get('brand')
        if kind == 'community_centre' and (not name or SKIP_NAME.search(name)): continue
        c = e.get('center') or e
        if 'lat' not in c: continue
        addr = ' '.join(x for x in [t.get('addr:street') or t.get('addr:place'), t.get('addr:housenumber')] if x)
        p = {'id': e['type'][0] + str(e['id']), 'n': name or sub[0].upper() + sub[1:], 'c': cat, 's': sub,
             'lat': round(c['lat'], 6), 'lng': round(c['lon'], 6)}
        if addr: p['a'] = addr
        if t.get('brand') and t.get('brand') != name: p['b'] = t['brand']
        oh = t.get('opening_hours')
        if oh:
            p['oh'] = oh
            h = parse_hours(oh)
            if h: p['h'] = h
            else: unparsed += 1
        for k, key in (('tel', 'phone'), ('tel', 'contact:phone'), ('www', 'website'), ('www', 'contact:website')):
            if t.get(key) and k not in p: p[k] = t[key].split(';')[0].strip()
        if kind == 'fuel' and t.get('fuel:lpg') == 'yes': p['lpg'] = 1
        out.append(p)
    out.sort(key=lambda p: (p['c'], p['n']))
    if len(out) < 20:
        sys.exit('Za mało miejsc (%d) — zostawiam poprzedni data/poi.js' % len(out))
    data = {'updated': datetime.date.today().isoformat(), 'cats': CATS, 'items': out,
            'source': 'OpenStreetMap (ODbL), przez Overpass API'}
    head = ('/* Żbików — Historia na mapie: poi.js (wygenerowane przez tools/import_poi.py — nie edytuj ręcznie)\n'
            ' * Okolica: kultura, kawiarnie, sklepy spożywcze, stacje paliw, apteki. © autorzy OpenStreetMap, licencja ODbL.\n'
            ' * items: [{id, n, c (kategoria), s (rodzaj), lat, lng, a (adres), oh (opening_hours z OSM),\n'
            ' *          h: {w: [[[od,do] w minutach]… 7 dni od poniedziałku], ph: godziny w święta | null}, tel, www}] */\n')
    js = head + 'window.ZBIKOW = window.ZBIKOW || {};\nwindow.ZBIKOW.poi = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n'
    open(os.path.join(ROOT, 'data', 'poi.js'), 'w', encoding='utf-8').write(js)
    from collections import Counter
    print('items', len(out), dict(Counter(p['c'] for p in out)), 'with hours', sum(1 for p in out if 'h' in p), 'unparsed', unparsed, 'bytes', len(js))


if __name__ == '__main__':
    main()

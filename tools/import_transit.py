#!/usr/bin/env python3
"""Rozkłady autobusów wokół Żbikowa -> data/transit.js

Pobiera otwarte pliki GTFS (republikowane przez zbiorkom.live):
  - komunikacja miejska Pruszkowa (linie 1–10B),
  - Grodziskie Przewozy Autobusowe (GPA).
Zostawia przystanki w obrębie mapy (miejsca z data/places.js + margines), łączy słupki
o tej samej nazwie w jeden przystanek i zapisuje odjazdy dla typowego dnia roboczego,
soboty i niedzieli/święta. Strona liczy z tego najbliższe odjazdy bez żadnego API.

Użycie:  python3 tools/import_transit.py            (pobiera świeże dane)
         python3 tools/import_transit.py --dir DIR  (używa rozpakowanych feedów z DIR/<nazwa>/)
"""
import csv, io, json, math, os, re, sys, urllib.request, zipfile, datetime
from collections import defaultdict, Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FEEDS = [
    ('P', 'Pruszków', 'https://cdn.zbiorkom.live/gtfs/warsaw-pruszkow.zip', 'komunikacja miejska Pruszkowa'),
    ('G', 'GPA', 'https://cdn.zbiorkom.live/gtfs/warsaw-gpa.zip', 'Grodziskie Przewozy Autobusowe'),
]
MARGIN_M = 700          # przystanki do tylu metrów poza obszarem miejsc
SHAPE_MARGIN_M = 2500   # przebiegi linii przycinane do szerszego prostokąta
MERGE_M = 250           # słupki o tej samej nazwie bliżej niż tyle metrów = jeden przystanek


def load_places_bbox():
    s = open(os.path.join(ROOT, 'data', 'places.js'), encoding='utf-8').read()
    P = json.loads(re.search(r'places = (\[.*?\]);\n', s, re.S).group(1))
    lats = [p['lat'] for p in P]; lngs = [p['lng'] for p in P]
    return min(lats), max(lats), min(lngs), max(lngs)


def grow(b, m):
    dlat = m / 111320.0; dlng = m / (111320.0 * math.cos(math.radians((b[0] + b[1]) / 2)))
    return b[0] - dlat, b[1] + dlat, b[2] - dlng, b[3] + dlng


def inside(b, lat, lng):
    return b[0] <= lat <= b[1] and b[2] <= lng <= b[3]


def dist(a, b):
    return math.hypot((a[0] - b[0]) * 111320, (a[1] - b[1]) * 111320 * math.cos(math.radians(a[0])))


def read_feed(url, local):
    if local and os.path.isdir(local):
        return {n: open(os.path.join(local, n), encoding='utf-8-sig').read() for n in os.listdir(local) if n.endswith('.txt')}
    req = urllib.request.Request(url, headers={'User-Agent': 'ZbikowMap/1.0 (github.com/radioactiv152)'})
    data = urllib.request.urlopen(req, timeout=120).read()
    z = zipfile.ZipFile(io.BytesIO(data))
    return {n: z.read(n).decode('utf-8-sig') for n in z.namelist() if n.endswith('.txt')}


def rows(files, name):
    return list(csv.DictReader(io.StringIO(files.get(name, ''))))


def pl_holidays(year):
    a = year % 19; b = year // 100; c = year % 100; d = b // 4; e = b % 4; f = (b + 8) // 25; g = (b - f + 1) // 3
    h = (19 * a + b - d - g + 15) % 30; i = c // 4; k = c % 4; l = (32 + 2 * e + 2 * i - h - k) % 7; m = (a + 11 * h + 22 * l) // 451
    month = (h + l - 7 * m + 114) // 31; day = (h + l - 7 * m + 114) % 31 + 1
    easter = datetime.date(year, month, day)
    fixed = [(1, 1), (1, 6), (5, 1), (5, 3), (8, 15), (11, 1), (11, 11), (12, 24), (12, 25), (12, 26)]
    return {datetime.date(year, mo, d) for mo, d in fixed} | {easter, easter + datetime.timedelta(1), easter + datetime.timedelta(60)}


def sample_days(start, end):
    """First ordinary Wednesday, Saturday and Sunday from max(today, feed start)."""
    d = max(datetime.date.today(), start); out = {}
    while d <= end and len(out) < 3:
        hol = d in pl_holidays(d.year)
        if d.weekday() == 2 and not hol: out.setdefault('wd', d)
        if d.weekday() == 5 and not hol: out.setdefault('sa', d)
        if d.weekday() == 6: out.setdefault('su', d)
        d += datetime.timedelta(1)
    return out


def active_services(files, day):
    wk = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][day.weekday()]
    ds = day.strftime('%Y%m%d'); on = set()
    for r in rows(files, 'calendar.txt'):
        if r['start_date'] <= ds <= r['end_date'] and r.get(wk) == '1': on.add(r['service_id'])
    for r in rows(files, 'calendar_dates.txt'):
        if r['date'] == ds:
            if r['exception_type'] == '1': on.add(r['service_id'])
            elif r['exception_type'] == '2': on.discard(r['service_id'])
    return on


def simplify(pts, tol):
    if len(pts) < 3: return pts
    def perp(p, a, b):
        if a == b: return dist(p, a)
        ax, ay = 0, 0; bx = (b[1] - a[1]) * 68500; by = (b[0] - a[0]) * 111320
        px = (p[1] - a[1]) * 68500; py = (p[0] - a[0]) * 111320
        t = max(0, min(1, (px * bx + py * by) / (bx * bx + by * by)))
        return math.hypot(px - t * bx, py - t * by)
    dmax, idx = 0, 0
    for i in range(1, len(pts) - 1):
        d = perp(pts[i], pts[0], pts[-1])
        if d > dmax: dmax, idx = d, i
    if dmax > tol:
        return simplify(pts[:idx + 1], tol)[:-1] + simplify(pts[idx:], tol)
    return [pts[0], pts[-1]]


def clip_runs(pts, box):
    runs, cur = [], []
    for p in pts:
        if inside(box, *p): cur.append(p)
        elif cur:
            runs.append(cur); cur = []
    if cur: runs.append(cur)
    return [r for r in runs if len(r) > 1]


def mins(t):
    h, m, *_ = t.split(':'); return int(h) * 60 + int(m)


def main():
    local = sys.argv[sys.argv.index('--dir') + 1] if '--dir' in sys.argv else None
    base = load_places_bbox()
    box, sbox = grow(base, MARGIN_M), grow(base, SHAPE_MARGIN_M)
    routes, stops, shapes, sources = {}, [], {}, []
    valid_from, valid_to, days_used = None, None, {}
    for prefix, op, url, label in FEEDS:
        files = read_feed(url, os.path.join(local, os.path.basename(url)[:-4]) if local else None)
        info = (rows(files, 'feed_info.txt') or [{}])[0]
        start = datetime.datetime.strptime(info.get('feed_start_date', datetime.date.today().strftime('%Y%m%d')), '%Y%m%d').date()
        end = datetime.datetime.strptime(info.get('feed_end_date', (datetime.date.today() + datetime.timedelta(90)).strftime('%Y%m%d')), '%Y%m%d').date()
        valid_from = max(valid_from or start, start); valid_to = min(valid_to or end, end)
        sources.append({'name': label, 'via': 'zbiorkom.live', 'url': url, 'version': info.get('feed_version', '')})
        days = sample_days(start, end); days_used = {k: v.isoformat() for k, v in days.items()}
        svc = {k: active_services(files, d) for k, d in days.items()}
        near = {r['stop_id']: r for r in rows(files, 'stops.txt') if inside(box, float(r['stop_lat']), float(r['stop_lon']))}
        rinfo = {r['route_id']: r for r in rows(files, 'routes.txt')}
        trips = {r['trip_id']: r for r in rows(files, 'trips.txt')}
        dep = defaultdict(lambda: defaultdict(lambda: defaultdict(set)))   # stop -> (route, headsign) -> daytype -> {min}
        last_seq = {}
        st_rows = rows(files, 'stop_times.txt')
        for r in st_rows:
            seq = int(r['stop_sequence']); t = r['trip_id']
            if seq > last_seq.get(t, -1): last_seq[t] = seq
        used_routes, shape_count = set(), Counter()
        for r in st_rows:
            if r['stop_id'] not in near: continue
            tr = trips.get(r['trip_id'])
            if not tr or int(r['stop_sequence']) == last_seq[r['trip_id']]: continue   # no departures at the terminus
            key = (tr['route_id'], tr.get('trip_headsign', '').strip())
            for k, ids in svc.items():
                if tr['service_id'] in ids:
                    dep[r['stop_id']][key][k].add(mins(r['departure_time'] or r['arrival_time']))
            used_routes.add(tr['route_id'])
            if tr.get('shape_id'): shape_count[(tr['route_id'], tr.get('direction_id', ''), tr['shape_id'])] += 1
        for rid in used_routes:
            ri = rinfo[rid]
            routes[prefix + ri['route_short_name']] = {'n': ri['route_short_name'], 'op': op,
                'c': '#' + (ri.get('route_color') or '555555').upper(), 'long': ri.get('route_long_name', '')}
        # One shape per route and direction (the most frequent one), clipped to the map area.
        best = {}
        for (rid, d, sh), n in shape_count.items():
            if n > best.get((rid, d), (None, 0))[1]: best[(rid, d)] = (sh, n)
        want = {v[0] for v in best.values()}
        pts = defaultdict(list)
        for r in rows(files, 'shapes.txt'):
            if r['shape_id'] in want: pts[r['shape_id']].append((int(r['shape_pt_sequence']), float(r['shape_pt_lat']), float(r['shape_pt_lon'])))
        for (rid, d), (sh, _) in best.items():
            line = [(round(la, 5), round(lo, 5)) for _, la, lo in sorted(pts[sh])]
            key = prefix + rinfo[rid]['route_short_name']
            for run in clip_runs(line, sbox):
                shapes.setdefault(key, []).append([list(p) for p in simplify(run, 6)])
        # Merge platforms that share a name into one stop.
        for sid, s in near.items():
            if sid not in dep: continue
            ll = (float(s['stop_lat']), float(s['stop_lon']))
            name = re.sub(r'^Pruszków\s+', '', s['stop_name'].strip())
            key = name.lower()
            tgt = next((x for x in stops if x['key'] == key and dist(ll, (x['lat'], x['lng'])) < MERGE_M), None)
            if not tgt:
                tgt = {'n': name, 'key': key, 'lat': ll[0], 'lng': ll[1], 'pts': [], 'd': {}}; stops.append(tgt)
            elif tgt['n'].isupper() and not name.isupper():
                tgt['n'] = name   # prefer "Dulag" over "DULAG"
            tgt['pts'].append(ll)
            for (rid, head), per in dep[sid].items():
                k = prefix + rinfo[rid]['route_short_name'] + '|' + head
                slot = tgt['d'].setdefault(k, {})
                for dt, ms in per.items():
                    slot[dt] = sorted(set(slot.get(dt, [])) | ms)
    out_stops = []
    for s in stops:
        if s['n'].isupper() and len(s['n']) > 4: s['n'] = s['n'].title()   # DULAG -> Dulag, USC stays
    for i, s in enumerate(sorted(stops, key=lambda x: x['n'])):
        lat = sum(p[0] for p in s['pts']) / len(s['pts']); lng = sum(p[1] for p in s['pts']) / len(s['pts'])
        out_stops.append({'id': 's%d' % i, 'n': s['n'], 'lat': round(lat, 6), 'lng': round(lng, 6),
                          'd': {k: s['d'][k] for k in sorted(s['d'], key=lambda k: (len(k.split('|')[0]), k))}})
    for k in shapes:
        shapes[k] = [[list(p) for p in run] for run in shapes[k]]
    data = {'updated': datetime.date.today().isoformat(), 'validFrom': valid_from.isoformat(), 'validTo': valid_to.isoformat(),
            'sampleDays': days_used, 'sources': sources, 'routes': dict(sorted(routes.items(), key=lambda kv: (kv[1]['op'], len(kv[1]['n']), kv[1]['n']))),
            'stops': out_stops, 'shapes': shapes}
    head = ('/* Żbików — Historia na mapie: transit.js (wygenerowane przez tools/import_transit.py — nie edytuj ręcznie)\n'
            ' * Przystanki i rozkłady autobusów w okolicy Żbikowa: komunikacja miejska Pruszkowa i GPA.\n'
            ' * Źródło: otwarte pliki GTFS republikowane przez zbiorkom.live. Odjazdy w minutach od północy,\n'
            ' * osobno dla dnia roboczego (wd), soboty (sa) i niedzieli/święta (su); klucz odjazdów = "linia|kierunek".\n'
            ' * routes: {P1: {n, op, c, long}}, stops: [{id, n, lat, lng, d: {"P1|PKP Pruszków": {wd:[…], sa:[…], su:[…]}}}],\n'
            ' * shapes: {P1: [[[lat,lng],…], …]} – przebiegi linii przycięte do okolicy mapy. */\n')
    js = head + 'window.ZBIKOW = window.ZBIKOW || {};\nwindow.ZBIKOW.transit = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n'
    if len(out_stops) < 10 or len(routes) < 3:
        sys.exit('Za mało danych (%d przystanków, %d linii) — zostawiam poprzedni data/transit.js' % (len(out_stops), len(routes)))
    open(os.path.join(ROOT, 'data', 'transit.js'), 'w', encoding='utf-8').write(js)
    print('routes', len(routes), 'stops', len(out_stops), 'shapes', len(shapes), 'bytes', len(js), 'valid', valid_from, '–', valid_to, days_used)


if __name__ == '__main__':
    main()

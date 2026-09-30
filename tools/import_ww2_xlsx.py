"""Import warstwy „II wojna światowa” (data/wars.js → ww2) z arkusza badawczego.

Użycie:  pip install openpyxl
         python3 tools/import_ww2_xlsx.py zbikow_II_wojna_swiatowa_research_2.xlsx

Arkusze: Miejsca (W01…), Os_czasu, Zrodla (S01…). Współrzędne wpisane w arkuszu (kolumny „Szer. geogr.”
i „Dł. geogr.”) mają pierwszeństwo przed punktami przypisanymi w PLAN poniżej (wyznaczonymi z OpenStreetMap).
Nowe wiersze bez wpisu w PLAN trafiają na listę jako „bez punktu na mapie”.
"""
import json, math, os, sys, openpyxl

XLSX = sys.argv[1] if len(sys.argv) > 1 else 'zbikow_II_wojna_swiatowa_research_2.xlsx'
WARS = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'wars.js')
wb = openpyxl.load_workbook(XLSX, data_only=True)


def rows(name):
    it = wb[name].iter_rows(values_only=True)
    head = [str(h).strip() if h else '' for h in next(it)]
    return [{h: (str(v).strip() if v is not None else '') for h, v in zip(head, r)} for r in it if any(c is not None for c in r)]


# --- points found in OpenStreetMap (Nominatim) or taken from places.js
C = {
    'camp': (52.175621, 20.815648), 'camp_se': (52.176799, 20.824417), 'camp_rail': (52.171900, 20.816000),
    'museum': (52.1730618, 20.8075932), 'church': (52.180644, 20.785821), 'kazimierz': (52.162348, 20.809598),
    'piekna': (52.171979, 20.812155), 'tworki_szpital': (52.168680, 20.827208), 'park_mazowsze': (52.184054, 20.801618),
    'getto': (52.158000, 20.805500), 'zwirownia': (52.154700, 20.805800), 'kraszewskiego': (52.162495, 20.812580),
    'potulickich': (52.166221, 20.813737), 'komorow': (52.148400, 20.810000), 'mauzoleum': (52.156153, 20.847840),
    'sekocin': (52.101223, 20.891504), 'helenow': (52.150532, 20.785705), 'parzniew': (52.152222, 20.762777),
    'brwinow': (52.142555, 20.717070), 'reguly': (52.176533, 20.865237), 'wola': (52.236237, 20.954781),
    'grodzisk': (52.106622, 20.631344), 'pruszkow': (52.171959, 20.802982), 'pecice': (52.153333, 20.849166),
}
HALL = 'Punkt orientacyjny: środek terenu obozu; położenie hali w obrębie obozu do ustalenia (plan obozu, graf. K. Urban).'
CAMP = 'Punkt orientacyjny: teren obozu; dokładne miejsce nieznane.'
D, END = ('1944-08-06', '1945-01-17')
# id -> (point | ('at', placeId) | None, approx, type, from, to, sort, link, photosFrom)
PLAN = {
    'W01': ('camp', 'Punkt w środku terenu dawnych Warsztatów; obrys obozu zaznaczony na mapie.', 'oboz', D, END, '1944-08-06', 179, 179),
    'W02': ('camp', HALL, 'oboz', D, '1944-10-31', '1944-08-07', None, None),
    'W03': ('camp', HALL, 'oboz', D, '1944-10-31', '1944-08-10', None, None),
    'W04': ('camp', HALL, 'oboz', D, END, '1944-08-07', None, None),
    'W05': ('camp', HALL, 'oboz', D, '1944-10-31', '1944-08-07', None, None),
    'W06': ('camp', HALL, 'szpital', '1944-08-11', END, '1944-08-11', None, None),
    'W07': ('camp', HALL, 'oboz', '1944-09-01', '1944-10-31', '1944-09-28', None, None),
    'W08': ('camp', HALL, 'oboz', '1944-11-01', END, '1944-11', None, None),
    'W09': ('camp', CAMP, 'obiekt', D, END, '1944-08-06', None, None),
    'W10': ('camp', CAMP, 'pomoc', D, END, '1944-08-06', None, None),
    'W11': ('camp', 'Punkt orientacyjny: ambulatoria działały w halach obozu.', 'szpital', D, '1944-10-31', '1944-08-06', None, None),
    'W12': ('camp_rail', 'Punkt orientacyjny: linia kolejowa przy obozie.', 'pomoc', D, '1944-10-31', '1944-08-07', None, None),
    'W13': (('at', 'ul-3-maja-8'), None, 'pamiec', '1945-01-18', '2099-12-31', '1945', 157, None),
    'W14': ('church', None, 'pomoc', '1939-09-01', END, '1944-08-06', 7, None),
    'W15': (None, None, 'pomoc', '1944-08-01', '1945-12-31', '1944-08', None, None),
    'W16': ('kazimierz', None, 'pomoc', '1944-08-06', '1944-08-06', '1944-08-06', None, None),
    'W17': ('piekna', 'Punkt orientacyjny: ul. Piękna; budynek szpitala do ustalenia.', 'szpital', D, '1944-10-31', '1944-08-06', None, None),
    'W18': ('tworki_szpital', None, 'szpital', D, '1944-10-31', '1944-08-06', None, None),
    'W19': ('park_mazowsze', 'Punkt orientacyjny: Park Mazowsze (dawne wyrobiska cegielni Hosera).', 'represje', '1939-09-01', '1944-12-31', '1940', None, None),
    'W20': (None, None, 'zaglada', '1939-09-01', '1941-02-28', '1940', None, None),
    'W21': ('getto', 'Punkt orientacyjny: kwartał ulic Armii Krajowej (dawnej Pęcickiej), Komorowskiej, Ceramicznej i Polnej.', 'zaglada', '1940-11-15', '1941-02-28', '1940-11-15', None, None),
    'W22': ('zwirownia', 'Punkt orientacyjny: rejon ulic Żwirowej i Komorowskiej.', 'represje', '1939-09-01', END, '1944-08-02', None, None),
    'W23': ('kraszewskiego', 'Punkt orientacyjny: dzisiejszy budynek przy ul. Kraszewskiego 14/16.', 'represje', '1939-09-01', END, '1940', None, None),
    'W24': ('potulickich', None, 'represje', '1944-01-01', '1944-12-31', '1944', None, None),
    'W25': (('at', 'ul-domaniewska-cmentarz-zbikowski'), None, 'pamiec', '1939-09-01', '1939-09-30', '1939-09', 214, None),
    'W26': (('at', 'ul-domaniewska-cmentarz-zbikowski'), None, 'pamiec', D, '1945-01-31', '1944-08', None, None),
    'W27': ('komorow', 'Punkt orientacyjny: róg ul. Kolejowej i Krótkiej w Komorowie.', 'pamiec', '1944-09-01', '1944-10-31', '1944-10-09', None, None),
    'W28': ('mauzoleum', None, 'powstanie', '1944-08-02', '1944-08-02', '1944-08-02', None, None),
    'W29': ('sekocin', 'Punkt orientacyjny: Sękocin-Las (Lasy Sękocińskie).', 'powstanie', '1944-08-01', '1944-08-03', '1944-08-01', None, None),
    'W30': ('helenow', 'Punkt orientacyjny: Helenów (pałac Potockich).', 'bitwa', '1939-09-12', '1939-09-12', '1939-09-12', None, None),
    'W31': (None, None, 'bitwa', '1939-09-12', '1939-09-12', '1939-09-12', None, None),
    'W32': ('parzniew', 'Punkt orientacyjny: wieś Parzniew; miejsce egzekucji i pomnik do ustalenia.', 'represje', '1939-09-12', '1939-09-12', '1939-09-12', None, None),
    'W33': (None, None, 'zniszczenie', '1939-09-01', '1939-09-01', '1939-09-01', None, None),
    'W34': (None, None, 'oboz', '1944-10-01', END, '1944-10', None, None),
    'W35': ('camp_se', 'Punkt orientacyjny: południowo-wschodnia część terenu obozu; odcinek muru i torów do ustalenia.', 'oboz', D, END, '1944-08-10', None, None),
    'W36': ('museum', 'Punkt orientacyjny: mur obozu od strony ul. 3 Maja; odcinek muru nieznany.', 'pomoc', D, '1944-10-31', '1944-08-07', None, None),
    'W37': (('at', 'oboz-przejsciowy-dulag-121'), None, 'pamiec', '1947-01-01', '2099-12-31', '1947', 179, None),
}
CAT_TYPES = {'Obóz Dulag 121': 'oboz', 'Pomoc wypędzonym': 'pomoc', 'Upamiętnienie': 'pamiec', 'Szpital': 'szpital',
             'Egzekucje': 'represje', 'Zagłada Żydów': 'zaglada', 'Cmentarz / mogiła': 'pamiec', 'Powstanie 1944': 'powstanie',
             'Walki 1939': 'bitwa', 'Nalot i zniszczenia': 'zniszczenie'}

sources = {r['ID']: {'name': r['Opis źródła'], 'url': r['Adres'] if r['Adres'].startswith('http') else '', 'type': r['Typ'], 'note': r['Uwagi o wiarygodności']}
           for r in rows('Zrodla')}

events = []
for r in rows('Miejsca'):
    mid = r['ID']
    pt, approx, typ, dfrom, dto, sort, link, pfrom = PLAN.get(mid, (None, None, CAT_TYPES.get(r['Kategoria'], 'obiekt'), None, None, '1939', None, None))
    try:
        lat, lng = float(r['Szer. geogr.'].replace(',', '.')), float(r['Dł. geogr.'].replace(',', '.'))
        pt, approx = ('sheet', (lat, lng)), None
    except ValueError:
        pass
    ev = {'id': 'ww2-' + mid.lower(), 'code': mid, 'title': r['Nazwa'], 'category': r['Kategoria'], 'type': typ,
          'date': r['Okres'], 'sort': sort, 'desc': r['Opis'], 'where': r['Lokalizacja dziś (opis)'],
          'area': r['Część obszaru'], 'tracks': r['Względem torów'], 'side': r['Strona'] if r['Strona'] not in ('', '—') else '',
          'certainty': r['Pewność'], 'note': r['Uwagi'],
          'sources': [s for s in [r['Źródło główne (ID)']] + [x.strip() for x in r['Dodatkowe źródła (ID)'].split(',')] if s]}
    if dfrom:
        ev['from'], ev['to'] = dfrom, dto
    if isinstance(pt, tuple) and pt[0] == 'sheet':
        ev['lat'], ev['lng'] = pt[1]
    elif isinstance(pt, tuple) and pt[0] == 'at':
        ev['at'] = pt[1]
    elif pt:
        ev['lat'], ev['lng'] = C[pt]
    if approx:
        ev['approx'] = approx
    if link:
        ev['link'] = link
    if pfrom:
        ev['photosFrom'] = pfrom
    events.append({k: v for k, v in ev.items() if v not in ('', None, [])})

# records from the main database that the spreadsheet does not cover
events += [
    {'id': 'ww2-mogila-nieznanego-1939', 'ref': 215, 'type': 'pamiec', 'sort': '1939-09', 'from': '1939-09-01', 'to': '1939-09-30'},
    {'id': 'ww2-oboz-jeniecki-1939', 'ref': 177, 'type': 'oboz', 'sort': '1939-10', 'from': '1939-10-01', 'to': '1939-12-31'},
    {'id': 'ww2-ostbahn', 'ref': 72, 'type': 'obiekt', 'sort': '1939-11', 'from': '1939-10-01', 'to': '1945-01-17'},
    {'id': 'ww2-wiezyczki', 'ref': 22, 'type': 'obiekt', 'sort': '1940', 'from': '1939-10-01', 'to': '1945-01-17'},
    {'id': 'ww2-oboz-pracy-1941', 'ref': 178, 'type': 'oboz', 'sort': '1941-01-20', 'from': '1941-01-20'},
    {'id': 'ww2-majatek-zbikow', 'ref': 208, 'type': 'konspiracja', 'sort': '1942', 'from': '1942-01-01', 'to': '1944-05-09'},
    {'id': 'ww2-egzekucje-kowalskiego', 'ref': 218, 'type': 'represje', 'sort': '1942', 'from': '1942-01-01', 'to': '1944-12-31'},
    {'id': 'ww2-sklep-jansowej', 'ref': 209, 'type': 'konspiracja', 'sort': '1943', 'from': '1943-01-01', 'to': '1944-12-31'},
    {'id': 'ww2-bunkry-promyka', 'ref': 194, 'type': 'konspiracja', 'sort': '1943-05', 'from': '1943-05-01', 'to': '1944-06-03'},
    {'id': 'ww2-pilnikowa-1944', 'ref': 213, 'type': 'bitwa', 'sort': '1944-02-08', 'from': '1944-02-08', 'to': '1944-02-08', 'side': 'Niemcy / AL'},
    {'id': 'ww2-magazyn-cegielnia', 'ref': 210, 'type': 'konspiracja', 'sort': '1944-06', 'from': '1944-01-01', 'to': '1944-06-30'},
    {'id': 'ww2-pole-bandurskiej', 'ref': 212, 'type': 'konspiracja', 'sort': '1944-07-29', 'from': '1944-07-29', 'to': '1944-08-02'},
    {'id': 'ww2-brama-zntk', 'ref': 153, 'type': 'obiekt', 'sort': '1944-08', 'from': D, 'to': END},
    {'id': 'ww2-bunkier-zntk', 'ref': 154, 'type': 'obiekt', 'sort': '1944-08', 'from': D, 'to': END},
    {'id': 'ww2-wieza-1', 'ref': 156, 'type': 'obiekt', 'sort': '1944-08', 'from': D, 'to': END},
    {'id': 'ww2-wieza-3', 'ref': 158, 'type': 'obiekt', 'sort': '1944-08', 'from': D, 'to': END},
    {'id': 'ww2-ogrod-plebanii', 'ref': 211, 'type': 'konspiracja', 'sort': '1944-09', 'from': '1944-09-01', 'to': '1944-09-30'},
]


def offset(a, b, m):
    lat0 = math.radians((a[0] + b[0]) / 2)
    dx = (b[1] - a[1]) * math.cos(lat0); dy = b[0] - a[0]
    n = math.hypot(dx, dy); px, py = -dy / n, dx / n
    d = m / 111320
    return [[round(p[0] + py * d, 6), round(p[1] + px * d / math.cos(lat0), 6)] for p in (a, b)]


POL, GER = '#B3261E', '#1F4E8C'
lines = [
    {'id': 'ww2-atak-helenow', 'type': 'atak', 'side': 'Polacy', 'color': POL, 'label': 'atak I/36 pp na Helenów · 12 IX',
     'title': 'Atak I batalionu 36 pp Legii Akademickiej na Helenów', 'date': '12 IX 1939, ok. południa',
     'desc': 'Atak załamał się w ogniu moździerzy i broni maszynowej. Kierunek schematycznie: od zgrupowania pod Brwinowem.',
     'sources': ['S08', 'S09'], 'from': '1939-09-12', 'to': '1939-09-12', 'coords': offset(C['brwinow'], C['helenow'], 250)},
    {'id': 'ww2-czolgi', 'type': 'atak', 'side': 'Niemcy', 'color': GER, 'label': 'czołgi 4 DPanc. · 12 IX 13:00',
     'title': 'Uderzenie czołgów 4 Dywizji Pancernej od strony Helenowa', 'date': '12 IX 1939, ok. 13:00',
     'desc': 'Czołgi skoncentrowane w Pruszkowie uderzyły od strony Helenowa na polskie zgrupowanie pod Brwinowem. Kierunek schematycznie.',
     'sources': ['S08', 'S09'], 'from': '1939-09-12', 'to': '1939-09-12', 'coords': offset(C['helenow'], C['brwinow'], 250)},
    {'id': 'ww2-ak-ochota', 'type': 'atak', 'side': 'AK', 'color': POL, 'label': 'AK Ochota · 2 VIII 1944',
     'title': 'Oddziały AK IV obwodu wycofujące się z Ochoty: bój na drodze z Reguł do Pęcic', 'date': '2 VIII 1944',
     'desc': 'Według Muzeum Dulag 121: 31 poległych, 67 wziętych do niewoli, 60 rozstrzelanych w pęcickiej cegielni.',
     'sources': ['S20'], 'from': '1944-08-02', 'to': '1944-08-02', 'coords': [list(C['reguly']), list(C['mauzoleum'])]},
    {'id': 'ww2-vi-rejon', 'type': 'transport', 'side': 'AK', 'color': POL, 'label': 'VI Rejon AK do Lasów Sękocińskich · 1–3 VIII',
     'title': 'Żołnierze VI Rejonu „Helenów” AK ruszają do Lasów Sękocińskich', 'date': '1–3 VIII 1944',
     'desc': 'W oczekiwaniu na zrzuty; 3 VIII komendant „Paweł” nakazał powrót do konspiracji. Kierunek schematycznie.',
     'sources': ['S04'], 'from': '1944-08-01', 'to': '1944-08-03', 'context': True, 'coords': [list(C['pruszkow']), list(C['sekocin'])]},
    {'id': 'ww2-wypedzeni-wola', 'type': 'transport', 'side': 'Ludność', 'label': 'wypędzeni z Woli · od 7 VIII 1944',
     'title': 'Wypędzeni z Warszawy do Dulagu 121: pierwsza piesza grupa z Woli', 'date': '7 VIII 1944',
     'desc': 'Pieszo dotarła pierwsza grupa ok. 3 tys. kobiet i dzieci ocalałych z Rzezi Woli. Kierunek schematycznie.',
     'sources': ['S01'], 'from': '1944-08-07', 'to': '1944-10-31', 'context': True, 'coords': [list(C['wola']), list(C['camp'])]},
    {'id': 'ww2-transporty', 'type': 'deportacja', 'side': 'Niemcy', 'label': 'transporty z obozu · VIII 1944 – I 1945',
     'title': 'Transporty z Dulagu 121: do GG, na roboty do Rzeszy i do obozów koncentracyjnych', 'date': 'VIII 1944 – I 1945',
     'desc': 'Pierwsze trzy transporty niezdolnych do pracy do powiatu łowickiego (10, 12, 13 VIII). Do KL ok. 60 tys. osób (Auschwitz ok. 13,5 tys., Stutthof ok. 4,5 tys.). Strzałka schematycznie na zachód wzdłuż linii kolejowej.',
     'sources': ['S24', 'S25'], 'from': '1944-08-10', 'to': END, 'context': True, 'coords': [list(C['camp_se']), list(C['grodzisk'])]},
]

area = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dulag_area.json')))
areas = [{'id': 'ww2-teren-dulag', 'title': 'Teren obozu Dulag 121 (dawne Warsztaty Kolejowe)', 'label': 'teren obozu Dulag 121',
          'desc': 'Obrys dzisiejszego terenu MLP Pruszków I (ok. 42 ha) według OpenStreetMap. Obóz zajmował 48–53 ha — granice orientacyjne.',
          'color': '#4A1F1F', 'sources': ['S01', 'S17'], 'from': D, 'to': END, 'coords': area['coords']}]

chron = [{'sort': r['Data (sortowanie)'][:10], 'date': r['Data (opis)'], 'text': r['Wydarzenie'], 'scale': r['Skala'],
          'sources': [s.strip() for s in r['Źródło (ID)'].split(',') if s.strip()]} for r in rows('Os_czasu') if r.get('Wydarzenie')]

ww2 = {
    'label': 'II wojna światowa', 'period': '1939–1945', 'color': '#E0735F',
    'mapTitle': 'Żbików pod okupacją · Dulag 121', 'mapSubtitle': '1939–1945 · walki 1939, Zagłada, Powstanie, obóz przejściowy',
    'sidesKey': [{'label': 'Polacy / AK', 'color': POL}, {'label': 'Niemcy', 'color': GER}, {'label': 'obie strony', 'color': '#6B2E83'}],
    'intro': 'Na Żbikowie nie było długich walk. Najważniejsze są: obóz Dulag 121 w halach Warsztatów Kolejowych (1944–45) i pomoc wypędzonym, Zagłada Żydów, egzekucje i mogiły, walki września 1939 pod Helenowem i Brwinowem oraz Powstanie 1944 w okolicy.',
    'dataset': 'Arkusz „zbikow_II_wojna_swiatowa_research_2.xlsx” (miejsca W01–W37, oś czasu, źródła S01–S28) oraz rekordy bazy głównej.',
    'phases': [
        {'label': 'Wrzesień 1939', 'from': '1939-09-01', 'to': '1939-09-30'},
        {'label': 'Okupacja 1939–1944', 'from': '1939-10-01', 'to': '1944-07-31'},
        {'label': 'Powstanie · 1–5 VIII 1944', 'from': '1944-08-01', 'to': '1944-08-05'},
        {'label': 'Dulag 121 · VIII 1944 – I 1945', 'from': D, 'to': END},
        {'label': 'Pamięć · po 1945', 'from': '1945-01-18', 'to': '2099-12-31'},
    ],
    'sources': sources, 'events': events, 'lines': lines, 'areas': areas, 'chronicle': chron,
}

js = open(WARS).read()
a = js.index('  ww2: {')
b = js.rindex('\n};')
body = json.dumps(ww2, ensure_ascii=False, indent=2)
body = '\n'.join('  ' + l if i else l for i, l in enumerate(body.split('\n')))
js = js[:a] + '  ww2: ' + body + js[b:]
open(WARS, 'w').write(js)
print(len(events), 'events,', sum(1 for e in events if 'lat' in e or 'at' in e or 'ref' in e), 'with position/ref,', len(lines), 'lines,', len(chron), 'chronicle')

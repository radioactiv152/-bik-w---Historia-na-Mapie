"""Import warstwy „I wojna światowa” (data/wars.js → ww1) z arkusza badawczego.

Użycie:  pip install openpyxl
         python3 tools/import_ww1_xlsx.py zbikow_I_wojna_swiatowa_research_v2.xlsx

Arkusze: Miejsca (M01…), Os_czasu, Zrodla (Z01…). Współrzędne: jeśli w arkuszu wpisano szerokość/długość
(kolumny „Szer. geogr.” i „Dł. geogr.”), mają pierwszeństwo przed punktami przypisanymi w PLAN poniżej.
Nowe wiersze bez wpisu w PLAN trafiają na listę jako „bez punktu na mapie”.
"""
import json, math, os, sys, openpyxl

XLSX = sys.argv[1] if len(sys.argv) > 1 else 'zbikow_I_wojna_swiatowa_research_v2.xlsx'
WARS = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'wars.js')
wb = openpyxl.load_workbook(XLSX, data_only=True)


def rows(name):
    ws = wb[name]
    it = ws.iter_rows(values_only=True)
    head = [str(h).strip() if h else '' for h in next(it)]
    out = []
    for r in it:
        if not any(c is not None for c in r):
            continue
        out.append({h: (str(v).strip() if v is not None else '') for h, v in zip(head, r)})
    return out


# --- coordinates found in OpenStreetMap (Nominatim) or taken from places.js
C = {
    'church': (52.180644, 20.785821), 'plebania': (52.1804209, 20.7867175), 'szkola': (52.175633, 20.804720),
    'kopiec': (52.173678, 20.805919), 'helenow': (52.150532, 20.785705), 'paszkow': (52.115000, 20.833333),
    'tworki': (52.168746, 20.819220), 'tworki_szpital': (52.168680, 20.827208), 'pecice': (52.153333, 20.849166),
    'pecice_kosciol': (52.151755, 20.848633), 'pecice_cm': (52.157173, 20.851779), 'stacja': (52.168222, 20.798925),
    'kazimierz': (52.162348, 20.809598), 'cm_pruszkow': (52.157041, 20.799612), 'rokitno_kosciol': (52.184856, 20.667204),
    'rokitno_cm': (52.183551, 20.663917), 'stalowa': (52.162655, 20.792576), 'olowkowa': (52.162811, 20.794173),
    'teichfeld': (52.161432, 20.806072), 'sochaczew': (52.229656, 20.237937), 'blonie': (52.194606, 20.616969),
    'pruszkow': (52.171959, 20.802982), 'sokol': (52.1660022, 20.8017553),
}
HOSER = (52.1908357, 20.8060521)   # ul. Żbikowska 51 (szkółki Hoserów)

# id -> (point key | ('at', placeId) | None, approx note | None, type, from, to, sort, link origId)
PLAN = {
    'M09': ('church', None, 'zniszczenie', '1914-10-13', '1914-10-17', '1914-10-17', 7),
    'M33': ('church', None, 'obserwacja', '1914-10-16', '1914-10-17', '1914-10-16', 7),
    'M34': ('plebania', None, 'sztab', '1914-10-16', '1914-10-17', '1914-10-16', None),
    'M35': ('church', 'Punkt orientacyjny: baterie stały za kościołem, poza ogrodem i budynkami plebanii; dokładne miejsce do ustalenia.', 'artyleria', '1914-10-17', '1914-10-17', '1914-10-17', None),
    'M36': ('church', 'Punkt orientacyjny: park przy kościele i plebanii.', 'obserwacja', '1914-10-17', '1914-10-17', '1914-10-17', None),
    'M37': ('church', None, 'schron', '1914-10-17', '1914-10-17', '1914-10-17', 7),
    'M05': (('at', 'ul-zbikowska-51'), 'Punkt orientacyjny: „w okolicach szkółek Hoserów” (ul. Żbikowska 51); dokładne stanowiska do ustalenia.', 'artyleria', '1914-10-13', '1914-10-17', '1914-10-13', 29),
    'M10': ('szkola', None, 'schron', '1914-10-13', '1914-10-17', '1914-10-13', 17),
    'M11': (('at', 'ul-3-maja-8'), None, 'zniszczenie', None, None, '1915-07', 19),
    'M47': (None, None, 'spoleczne', None, None, '1915-08', None),
    'M31': (('at', 'ul-3-maja-27'), None, 'niepodleglosc', None, None, '1916', 125),
    'M32': ('kopiec', None, 'niepodleglosc', None, None, '1917-10-15', None),
    'M01': ('helenow', None, 'artyleria', '1914-10-12', '1914-10-19', '1914-10-12', None),
    'M02': ('helenow', 'Punkt orientacyjny: zagajnik przy pałacu w Helenowie.', 'okopy', '1914-10-12', '1914-10-19', '1914-10-12', None),
    'M03': ('paszkow', 'Punkt orientacyjny: przysiółek Paszków; położenie okopów do ustalenia.', 'okopy', None, None, '1914-10', None),
    'M04': (None, None, 'natarcie', '1914-10-11', '1914-10-11', '1914-10-11', None),
    'M06': ('tworki', 'Punkt orientacyjny: Tworki; linia piechoty ok. wiorsty od Tworek.', 'artyleria', '1914-10-13', '1914-10-16', '1914-10-13', None),
    'M07': (None, None, 'artyleria', '1914-10-13', '1914-10-16', '1914-10-13', None),
    'M08': ('pecice', 'Punkt orientacyjny: Pęcice; wzgórze nad Utratą i dwór do ustalenia.', 'artyleria', None, None, '1914-10', None),
    'M12': ('stacja', None, 'zniszczenie', '1914-10-11', '1914-10-14', '1914-10-11', None),
    'M13': (None, None, 'zniszczenie', None, None, '1914-10', None),
    'M14': ('stalowa', 'Punkt orientacyjny: ul. Stalowa.', 'zniszczenie', None, None, '1914-10', None),
    'M43': ('olowkowa', 'Punkt orientacyjny: rejon ulic Stalowej i Ołówkowej.', 'zniszczenie', '1914-10-14', '1914-10-19', '1914-10-14', None),
    'M41': (None, None, 'zniszczenie', '1914-10-14', '1914-10-19', '1914-10-14', None),
    'M15': (None, None, 'zniszczenie', None, None, '1914-10', None),
    'M16': ('sokol', None, 'zniszczenie', '1914-10-13', '1914-10-14', '1914-10-13', None),
    'M17': (None, None, 'zniszczenie', '1914-10-13', '1914-10-14', '1914-10-13', None),
    'M18': ('teichfeld', 'Punkt orientacyjny: przy pałacu Teichfelda; fabryka stała w południowej dzielnicy osady.', 'zniszczenie', '1914-10-13', '1914-10-14', '1914-10-13', None),
    'M19': (None, None, 'zniszczenie', '1914-10-13', '1914-10-14', '1914-10-13', None),
    'M20': (None, None, 'zniszczenie', '1914-10-13', '1914-10-14', '1914-10-13', None),
    'M21': ('kazimierz', None, 'zniszczenie', '1914-10-13', '1914-10-14', '1914-10-13', None),
    'M22': ('tworki_szpital', None, 'zniszczenie', '1914-10-13', '1914-10-17', '1914-10-14', None),
    'M23': (None, None, 'schron', '1914-10-13', '1914-10-17', '1914-10-13', None),
    'M24': (None, None, 'pocisk', None, None, '1914-10', None),
    'M25': ('pecice', 'Punkt orientacyjny: Pęcice; dokładne położenie pałacu do ustalenia.', 'zniszczenie', None, None, '1914-10', None),
    'M26': ('pecice_kosciol', None, 'pocisk', None, None, '1914-10', None),
    'M38': ('rokitno_kosciol', None, 'zniszczenie', '1914-10-17', '1914-10-17', '1914-10-17', None),
    'M39': ('rokitno_cm', 'Punkt orientacyjny: cmentarz w Rokitnie.', 'pamiec', None, None, '1914-10-16', None),
    'M27': ('cm_pruszkow', 'Punkt orientacyjny: ul. Cmentarna.', 'pamiec', None, None, '1914-10', None),
    'M28': ('pecice_cm', None, 'pamiec', None, None, '1914-10', None),
    'M29': (None, None, 'pamiec', None, None, '1914-10-20', None),
    'M30': ('helenow', 'Punkt orientacyjny: za okopami w Helenowie.', 'pamiec', None, None, '1914-10-19', None),
}

CAT_TYPES = {'Stanowisko artylerii': 'artyleria', 'Punkt obserwacyjny': 'obserwacja', 'Kwatera': 'sztab',
             'Kierunek natarcia': 'natarcie', 'Okopy': 'okopy', 'Zniszczenia': 'zniszczenie', 'Pocisk': 'pocisk',
             'Schron': 'schron', 'Cmentarz': 'pamiec', 'Skutki po wojnie': 'spoleczne', 'Niepodległość': 'niepodleglosc'}

# public-domain photos attached to spreadsheet rows (files in img/, thumbnails in img/t/)
PHOTOS = {
    'M16': [{'file': 'img/sokol-siedziba.jpg', 'thumb': 'img/t/sokol-siedziba.jpg',
             'caption': 'Pruszków — siedziba „Sokoła” (pocztówka)', 'date': 'przed 1939', 'author': '',
             'sourceName': 'Polona / Wikimedia Commons',
             'sourceUrl': 'https://commons.wikimedia.org/wiki/File:Pruszkow_-_siedziba_%22Sokola%22._przed_1939_(72788923).jpg',
             'license': 'domena publiczna'}],
}

src = {r['ID']: r for r in rows('Zrodla')}
sources = {k: {'name': v['Opis źródła'], 'url': v['Adres'] if v['Adres'].startswith('http') else '', 'type': v['Typ'], 'note': v['Uwagi o wiarygodności']} for k, v in src.items()}

events = []
for r in rows('Miejsca'):
    mid = r['ID']
    pt, approx, typ, dfrom, dto, sort, link = PLAN.get(mid, (None, None, CAT_TYPES.get(r['Kategoria'].split(' /')[0], 'zniszczenie'), None, None, '1914', None))
    try:
        lat, lng = float(r['Szer. geogr.'].replace(',', '.')), float(r['Dł. geogr.'].replace(',', '.'))
        pt, approx = ('sheet', (lat, lng)), None
    except ValueError:
        pass
    ev = {'id': 'ww1-' + mid.lower(), 'code': mid, 'title': r['Nazwa'], 'category': r['Kategoria'], 'type': typ,
          'date': r['Okres'], 'sort': sort, 'desc': r['Opis'], 'where': r['Lokalizacja dziś (opis)'],
          'area': r['Część obszaru'], 'tracks': r['Względem torów'], 'side': r['Strona'] if r['Strona'] not in ('', '—') else '',
          'certainty': r['Pewność'], 'note': r['Uwagi']}
    ids = [r['Źródło główne (ID)']] + [s.strip() for s in r['Dodatkowe źródła (ID)'].split(',') if s.strip()]
    ev['sources'] = [s for s in ids if s]
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
    if mid in PHOTOS:
        ev['photos'] = PHOTOS[mid]
    events.append({k: v for k, v in ev.items() if v not in ('', None, [])})

# records from the main database that the spreadsheet does not cover
events += [
    {'id': 'ww1-bitwa-1914', 'ref': 202, 'type': 'bitwa', 'sort': '1914-10-11', 'from': '1914-10-11', 'to': '1914-10-17'},
    {'id': 'ww1-posterunek-przejazd', 'ref': 82, 'type': 'obiekt', 'sort': '1915-08'},
    {'id': 'ww1-posterunek-papiernia', 'ref': 83, 'type': 'obiekt', 'sort': '1915-08'},
    {'id': 'ww1-ochronka-kuklinskiego', 'ref': 64, 'type': 'spoleczne', 'sort': '1916'},
    {'id': 'ww1-bursy-narodowa', 'ref': 65, 'type': 'spoleczne', 'sort': '1916'},
    {'id': 'ww1-bursa-cicha', 'ref': 169, 'type': 'spoleczne', 'sort': '1916'},
    {'id': 'ww1-pakownia-hoserow', 'ref': 32, 'type': 'zniszczenie', 'sort': '1917', 'title': 'Pakownia Hoserów — odbudowa po zniszczeniach wojennych'},
    {'id': 'ww1-sierocin', 'ref': 171, 'type': 'spoleczne', 'sort': '1917'},
]


def offset(a, b, m):
    """Shift segment a-b sideways by m metres (so two opposite arrows don't overlap)."""
    lat0 = math.radians((a[0] + b[0]) / 2)
    dx = (b[1] - a[1]) * math.cos(lat0); dy = b[0] - a[0]
    n = math.hypot(dx, dy); px, py = -dy / n, dx / n
    d = m / 111320
    return [[round(p[0] + py * d, 6), round(p[1] + px * d / math.cos(lat0), 6)] for p in (a, b)]


lines = [
    {'id': 'ww1-pojedynek-ros', 'from': '1914-10-13', 'to': '1914-10-17', 'type': 'ostrzal', 'side': 'Rosjanie', 'color': '#EF4444',
     'title': 'Pojedynek artyleryjski: rosyjskie baterie przy szkółkach Hoserów → baterie niemieckie pod Helenowem',
     'date': '13–17 X 1914', 'desc': 'Część pocisków chybiała i padała na Pruszków, leżący między stanowiskami.',
     'sources': ['Z01', 'Z25'], 'coords': offset(HOSER, C['helenow'], 90)},
    {'id': 'ww1-pojedynek-niem', 'from': '1914-10-13', 'to': '1914-10-17', 'type': 'ostrzal', 'side': 'Niemcy', 'color': '#60A5FA',
     'title': 'Pojedynek artyleryjski: niemieckie baterie spod Helenowa → rosyjskie baterie przy szkółkach Hoserów',
     'date': '13–17 X 1914', 'sources': ['Z01', 'Z25'], 'coords': offset(C['helenow'], HOSER, 90)},
    {'id': 'ww1-rokitno', 'from': '1914-10-17', 'to': '1914-10-17', 'type': 'ostrzal', 'side': 'Rosjanie', 'color': '#EF4444',
     'title': 'Rosyjskie baterie za kościołem żbikowskim → kościół w Rokitnie',
     'date': '17 X 1914', 'desc': 'Ogień korygowany przez obserwatorów z wieży kościoła (wg relacji J. Ryxa, 1924).',
     'sources': ['Z13', 'Z12'], 'coords': [list(C['church']), list(C['rokitno_kosciol'])]},
    {'id': 'ww1-wejscie-niemcow', 'from': '1914-10-11', 'to': '1914-10-11', 'type': 'atak', 'side': 'Niemcy', 'color': '#60A5FA',
     'title': 'Wejście Niemców do Pruszkowa aleją lipową od Helenowa',
     'date': '11 X 1914, ok. 16:30', 'desc': 'Kierunek schematycznie: z Helenowa do stacji, gdzie zniszczono telegraf i telefon. Dokładny przebieg alei do ustalenia.',
     'sources': ['Z01'], 'coords': [list(C['helenow']), list(C['stacja'])]},
    {'id': 'ww1-ewakuacja-kosciol', 'from': '1914-10-17', 'to': '1914-10-17', 'type': 'transport', 'side': 'Ludność',
     'title': 'Ucieczka z podziemi kościoła przez pola w kierunku Warszawy',
     'date': '17 X 1914', 'desc': 'Kierunek schematycznie: źródło podaje tylko „przez pola w kierunku Warszawy”.',
     'sources': ['Z13'], 'coords': [list(C['church']), [52.1795, 20.8110]]},
    {'id': 'ww1-linia-2-armii', 'type': 'front', 'context': True,
     'title': 'Linia Sochaczew–Błonie–Pruszków: tu Niemcy odrzucili rosyjską 2 Armię',
     'date': '9 X 1914', 'desc': 'Schemat przez centra miejscowości, nie przebieg okopów.',
     'sources': ['Z07'], 'coords': [list(C['sochaczew']), list(C['blonie']), list(C['pruszkow'])]},
]

chron = []
for r in rows('Os_czasu'):
    if not r.get('Wydarzenie'):
        continue
    chron.append({'sort': r['Data (sortowanie)'][:10], 'date': r['Data (opis)'], 'text': r['Wydarzenie'],
                  'scale': r['Skala'], 'sources': [s.strip() for s in r['Źródło (ID)'].split(',') if s.strip()]})

ww1 = {
    'label': 'I wojna światowa', 'period': '1914–1918', 'color': '#C8A24A',
    'intro': 'Walki o Pruszków i ostrzał Żbikowa w październiku 1914 r.: stanowiska artylerii obu stron, punkty obserwacyjne, schrony, zniszczenia i mogiły, a także skutki wojny do 1918 r. Kolory linii: czerwone — ogień rosyjski, niebieskie — niemiecki.',
    'dataset': 'Arkusz „zbikow_I_wojna_swiatowa_research_v2.xlsx” (miejsca M01–M47, oś czasu, źródła Z01–Z25) oraz rekordy bazy głównej.',
    'days': {'label': 'Bitwa o Pruszków, październik 1914', 'from': '1914-10-11', 'to': '1914-10-22'},
    'sources': sources, 'events': events, 'lines': lines, 'chronicle': chron,
}

js = open(WARS).read()
a = js.index('  ww1: {')
b = js.index('  ww2: {')
body = json.dumps(ww1, ensure_ascii=False, indent=2)
body = '\n'.join('  ' + l if i else l for i, l in enumerate(body.split('\n')))
js = js[:a] + '  ww1: ' + body + ',\n\n' + js[b:]
open(WARS, 'w').write(js)
print(len(events), 'events,', sum(1 for e in events if 'lat' in e or 'at' in e or 'ref' in e), 'with position/ref,', len(lines), 'lines,', len(chron), 'chronicle')

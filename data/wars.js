/* Żbików — Historia na mapie: wars.js
 * Warstwy „I WOJNA ŚWIATOWA” i „II WOJNA ŚWIATOWA”. Plik danych ładowany przez index.html (window.ZBIKOW).
 *
 * WYDARZENIE (events[]):
 *   {
 *     id:     'ww1-…'              – unikalny identyfikator (używany w linkach #w=ww1&e=…)
 *     ref:    202                   – (opcjonalnie) origId rekordu z places.js; wydarzenie dziedziczy z niego
 *                                     nazwę, opis, datowanie, źródło, zdjęcia oraz punkt na mapie
 *     at:     'ul-zbikowska-51'     – (opcjonalnie) id miejsca z places.js, gdy punkt ma być w innym miejscu
 *     lat, lng                      – (opcjonalnie) własne współrzędne (mają pierwszeństwo)
 *     approx: 'tekst'               – (opcjonalnie) uwaga, że punkt jest orientacyjny
 *     title, date, desc             – (opcjonalnie) własny tytuł, data opisowa i opis (nadpisują dane z ref)
 *     sort:   '1914-10-11'          – klucz sortowania osi czasu (RRRR, RRRR-MM lub RRRR-MM-DD)
 *     type:   'bitwa'               – klucz z `types` poniżej
 *     sources: [{ name, url }]      – (opcjonalnie) dodatkowe źródła
 *     photos:  [{ file, thumb, caption, date, author, sourceName, sourceUrl, license }]
 *     placeholder: true             – wpis-szablon do uzupełnienia (widoczny tylko na liście, bez punktu)
 *   }
 *   Wydarzenie bez współrzędnych (ani ref do rekordu z punktem) pojawia się na osi czasu jako „bez punktu na mapie”.
 *
 * LINIA / STRZAŁKA (lines[]) – przebieg frontu, kierunek ataku, ostrzału, przemieszczeń:
 *   { id, type: 'front'|'atak'|'ostrzal'|'transport', title, date, desc, ref?, coords: [[lat,lng], …],
 *     sources?, placeholder? }
 *   Strzałka jest rysowana na końcu linii (ostatni punkt = kierunek). Linia bez współrzędnych nie jest rysowana.
 */
window.ZBIKOW = window.ZBIKOW || {};
window.ZBIKOW.wars = {
  types: {
    bitwa:       { label: 'Walki i ataki',                   color: '#EF4444', glyph: '⚔' },
    zniszczenie: { label: 'Zniszczenia',                     color: '#F97316', glyph: '✹' },
    obiekt:      { label: 'Obiekty wojskowe i okupacyjne',   color: '#94A3B8', glyph: '■' },
    oboz:        { label: 'Obozy',                           color: '#A855F7', glyph: '▲' },
    konspiracja: { label: 'Konspiracja i ruch oporu',        color: '#22C55E', glyph: '★' },
    represje:    { label: 'Represje i egzekucje',            color: '#DC2626', glyph: '✕' },
    pamiec:      { label: 'Mogiły i miejsca pamięci',        color: '#EAB308', glyph: '✚' },
    spoleczne:   { label: 'Opieka i życie codzienne',        color: '#38BDF8', glyph: '♥' }
  },
  lineTypes: {
    front:     { label: 'Linia frontu',               color: '#EF4444', dash: '10 7', arrow: false },
    atak:      { label: 'Kierunek ataku',             color: '#EF4444', dash: null,   arrow: true },
    ostrzal:   { label: 'Kierunek ostrzału',          color: '#F97316', dash: '3 8',  arrow: true },
    transport: { label: 'Przemieszczenia ludności',   color: '#A855F7', dash: '8 6',  arrow: true }
  },

  ww1: {
    label: 'I wojna światowa',
    period: '1914–1918',
    color: '#C8A24A',
    intro: 'Wydarzenia lat 1914–1918 zapisane w bazie: walki i ostrzał Żbikowa w październiku 1914 r., wysadzenie części Warsztatów Kolejowych przez wycofujących się Rosjan w 1915 r., niemieckie posterunki rozbrojone 11 listopada 1918 r. przez POW oraz opieka nad sierotami wojennymi.',
    events: [
      { id: 'ww1-bitwa-1914', ref: 202, type: 'bitwa', sort: '1914-10-11', at: 'ul-zbikowska-51',
        approx: 'Punkt orientacyjny: według opisu w bazie epicentrum walk było przy szkółkach Hoserów (ul. Żbikowska).' },
      { id: 'ww1-warsztaty-1915', ref: 203, type: 'zniszczenie', sort: '1915-07' },
      { id: 'ww1-posterunek-przejazd', ref: 82, type: 'obiekt', sort: '1915' },
      { id: 'ww1-posterunek-papiernia', ref: 83, type: 'obiekt', sort: '1915' },
      { id: 'ww1-ochronka-kuklinskiego', ref: 64, type: 'spoleczne', sort: '1916' },
      { id: 'ww1-bursy-narodowa', ref: 65, type: 'spoleczne', sort: '1916' },
      { id: 'ww1-bursa-cicha', ref: 169, type: 'spoleczne', sort: '1916' },
      { id: 'ww1-pakownia-hoserow', ref: 32, type: 'zniszczenie', sort: '1917',
        title: 'Pakownia Hoserów — odbudowa po zniszczeniach wojennych' },
      { id: 'ww1-sierocin', ref: 171, type: 'spoleczne', sort: '1917' },
      { id: 'ww1-kopiec-kosciuszki', ref: 47, type: 'pamiec', sort: '1917' },
      { id: 'ww1-pow-apteka', ref: 15, type: 'konspiracja', sort: '1917' }
    ],
    lines: [
      { id: 'ww1-ostrzal-1914', type: 'ostrzal', ref: 202, placeholder: true,
        title: 'Pojedynek artyleryjski: baterie niemieckie pod Helenowem → pozycje rosyjskie przy szkółkach Hoserów',
        date: '11–17 X 1914',
        desc: 'Do uzupełnienia: współrzędne stanowisk baterii niemieckich (Helenów) i pozycji rosyjskich (szkółki Hoserów).',
        coords: [] }
    ]
  },

  ww2: {
    label: 'II wojna światowa',
    period: '1939–1945',
    color: '#E0735F',
    intro: 'Okupacja 1939–1945 w bazie: mogiły żołnierzy z września 1939 r., obozy na terenie Warsztatów Kolejowych (jeniecki w 1939, obóz pracy dla Żydów od 1941, Dulag 121 w 1944), represje i egzekucje oraz magazyny broni i punkty konspiracji AK.',
    events: [
      { id: 'ww2-mogila-zbiorowa-1939', ref: 214, type: 'pamiec', sort: '1939-09' },
      { id: 'ww2-mogila-nieznanego-1939', ref: 215, type: 'pamiec', sort: '1939-09' },
      { id: 'ww2-oboz-jeniecki-1939', ref: 177, type: 'oboz', sort: '1939-10' },
      { id: 'ww2-ostbahn', ref: 72, type: 'obiekt', sort: '1939-11' },
      { id: 'ww2-wiezyczki', ref: 22, type: 'obiekt', sort: '1940' },
      { id: 'ww2-egzekucje-cegielnia', ref: 71, type: 'represje', sort: '1940' },
      { id: 'ww2-oboz-pracy-1941', ref: 178, type: 'oboz', sort: '1941-01-20' },
      { id: 'ww2-magazyn-wieza', ref: 207, type: 'konspiracja', sort: '1941-12' },
      { id: 'ww2-domy-zydowskie', ref: 70, type: 'represje', sort: '1942' },
      { id: 'ww2-majatek-zbikow', ref: 208, type: 'konspiracja', sort: '1942' },
      { id: 'ww2-egzekucje-kowalskiego', ref: 218, type: 'represje', sort: '1942' },
      { id: 'ww2-sklep-jansowej', ref: 209, type: 'konspiracja', sort: '1943' },
      { id: 'ww2-bunkry-promyka', ref: 194, type: 'konspiracja', sort: '1943-05' },
      { id: 'ww2-pilnikowa-1944', ref: 213, type: 'bitwa', sort: '1944-02-08' },
      { id: 'ww2-magazyn-cegielnia', ref: 210, type: 'konspiracja', sort: '1944-06' },
      { id: 'ww2-pole-bandurskiej', ref: 212, type: 'konspiracja', sort: '1944-07-29' },
      { id: 'ww2-dulag-121', ref: 179, type: 'oboz', sort: '1944-08-06' },
      { id: 'ww2-brama-zntk', ref: 153, type: 'obiekt', sort: '1944-08' },
      { id: 'ww2-bunkier-zntk', ref: 154, type: 'obiekt', sort: '1944-08' },
      { id: 'ww2-wieza-1', ref: 156, type: 'obiekt', sort: '1944-08' },
      { id: 'ww2-wieza-2', ref: 157, type: 'pamiec', sort: '1944-08' },
      { id: 'ww2-wieza-3', ref: 158, type: 'obiekt', sort: '1944-08' },
      { id: 'ww2-ogrod-plebanii', ref: 211, type: 'konspiracja', sort: '1944-09' }
    ],
    lines: [
      { id: 'ww2-droga-wypedzonych', type: 'transport', ref: 179, placeholder: true,
        title: 'Droga wypędzonych mieszkańców Warszawy do Dulagu 121',
        date: 'VIII–X 1944',
        desc: 'Do uzupełnienia: przebieg transportów kolejowych i pieszych kolumn do obozu (współrzędne kolejnych punktów).',
        coords: [] }
    ]
  }
};

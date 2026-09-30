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
 *     link:   19                    – (opcjonalnie) origId rekordu tylko do przycisku „Pokaż na mapie współczesnej”
 *                                     (bez dziedziczenia opisu)
 *     category, where, side, certainty, tracks, area, note, code – opis z arkusza badawczego
 *                                     (kategoria, lokalizacja dziś, strona, pewność, względem torów, część obszaru, uwagi, ID)
 *     from, to: '1914-10-13'        – zakres dni do paska „Dzień po dniu” (war.days)
 *   }
 *   sources mogą być identyfikatorami ('Z01') z war.sources = { Z01: { name, url, type, note } }.
 *   war.chronicle = [{ sort, date, text, scale: 'Front'|'Lokalna', sources: ['Z07'] }] – kronika wydarzeń.
 *   Linia z `context: true` (np. przebieg frontu w regionie) nie wpływa na dopasowanie widoku mapy.
 *   war.areas = [{ id, title, label, desc, color, coords: [[lat,lng]…], from, to, sources }] – zakreskowane obszary.
 *   war.phases = [{ label, from, to }] – okresy zamiast paska dni (np. II wojna); war.sidesKey – legenda stron w kartuszu.
 *   photosFrom: 179 – zdjęcia wydarzenia brane z photos.js dla podanego rekordu.
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
    bitwa:         { label: 'Walki i ataki',                   color: '#EF4444', glyph: '⚔' },
    artyleria:     { label: 'Stanowiska artylerii',            color: '#DC2626', glyph: '◎' },
    obserwacja:    { label: 'Punkty obserwacyjne',             color: '#F59E0B', glyph: '◉' },
    sztab:         { label: 'Kwatery i sztaby',                color: '#8B5CF6', glyph: '⚑' },
    natarcie:      { label: 'Kierunki natarcia',               color: '#B91C1C', glyph: '➜' },
    okopy:         { label: 'Okopy i ziemianki',               color: '#A16207', glyph: '≡' },
    zniszczenie:   { label: 'Zniszczenia od ostrzału',         color: '#F97316', glyph: '✹', impact: true },
    pocisk:        { label: 'Trafienia pocisków',              color: '#FB7185', glyph: '✸', impact: true },
    schron:        { label: 'Schrony ludności',                color: '#38BDF8', glyph: '⌂' },
    obiekt:        { label: 'Obiekty wojskowe i okupacyjne',   color: '#94A3B8', glyph: '■' },
    oboz:          { label: 'Obozy',                           color: '#A855F7', glyph: '▲' },
    konspiracja:   { label: 'Konspiracja i ruch oporu',        color: '#22C55E', glyph: '★' },
    niepodleglosc: { label: 'Niepodległość (POW, 1917–1918)',  color: '#E11D48', glyph: '★' },
    represje:      { label: 'Represje i egzekucje',            color: '#DC2626', glyph: '✕' },
    pamiec:        { label: 'Mogiły i miejsca pamięci',        color: '#EAB308', glyph: '✚' },
    spoleczne:     { label: 'Opieka i skutki wojny',           color: '#0EA5E9', glyph: '♥' },
    pomoc:         { label: 'Pomoc wypędzonym',                color: '#15803D', glyph: '♥' },
    szpital:       { label: 'Szpitale i opieka lekarska',      color: '#0EA5E9', glyph: '✚' },
    zaglada:       { label: 'Zagłada Żydów',                   color: '#6D28D9', glyph: '✡' },
    powstanie:     { label: 'Powstanie 1944 (AK)',             color: '#B91C1C', glyph: 'AK' }
  },
  lineTypes: {
    front:     { label: 'Linia frontu (kontekst)',    color: '#EAB308', dash: '10 7', arrow: false },
    atak:      { label: 'Kierunek natarcia',          color: '#EF4444', dash: null,   arrow: true },
    ostrzal:   { label: 'Kierunek ostrzału',          color: '#F97316', dash: '2 9',  arrow: true, animate: true },
    transport: { label: 'Ruch ludności i oddziałów',  color: '#A855F7', dash: '8 6',  arrow: true },
    deportacja:{ label: 'Transporty z obozu',         color: '#4A1F1F', dash: '14 6', arrow: true }
  },

  ww1: {
    "label": "I wojna światowa",
    "period": "1914–1918",
    "color": "#C8A24A",
    "mapTitle": "Szkic działań · Pruszków – Żbików",
    "mapSubtitle": "październik 1914 · bitwa o Pruszków i ostrzał Żbikowa",
    "intro": "Walki o Pruszków i ostrzał Żbikowa w październiku 1914 r.: stanowiska artylerii obu stron, punkty obserwacyjne, schrony, zniszczenia i mogiły, a także skutki wojny do 1918 r. Znaki i linie: czerwone — wojska rosyjskie, niebieskie — niemieckie.",
    "dataset": "Arkusz „zbikow_I_wojna_swiatowa_research_v2.xlsx” (miejsca M01–M47, oś czasu, źródła Z01–Z25) oraz rekordy bazy głównej.",
    "days": {
      "label": "Bitwa o Pruszków, październik 1914",
      "from": "1914-10-11",
      "to": "1914-10-22"
    },
    "sources": {
      "Z01": {
        "name": "Kurjer Warszawski nr 292, 294, 300, 301 (22–31 X 1914): relacje mieszkańców, lekarzy z Tworek, właścicieli Helenowa i Paszkowa (przedruk Muzeum Dulag 121)",
        "url": "http://dulag121.pl/pruskovianaa/pruszkow-w-ogniu-bojowym/",
        "type": "Prasa z epoki (przedruk)",
        "note": "Główne źródło do ostrzału 11–19 X 1914. Relacje często anonimowe."
      },
      "Z02": {
        "name": "Marian Skwara, „Żbików – rys historyczny” (Żbikowianka, 2019)",
        "url": "http://dulag121.pl/pruskovianaa/skwara-zbikow-rys-historyczny/",
        "type": "Opracowanie historyka",
        "note": "Żbików 1914–1918, ewakuacja 1915, POW, bursy. Autor także „Historii Pruszkowa do roku 1945” (2011)."
      },
      "Z03": {
        "name": "Wikipedia: Bitwa o Pruszków",
        "url": "https://pl.wikipedia.org/wiki/Bitwa_o_Pruszk%C3%B3w",
        "type": "Encyklopedia (wtórne)",
        "note": "Daty 12–14 X (walki do 18 X)."
      },
      "Z04": {
        "name": "Muzeum Dulag 121: Ostrzał artyleryjski Pruszkowa (13–14 X 1914)",
        "url": "http://dulag121.pl/niepodlegla/ostrzal-artyleryjski-pruszkowa-pazdziernik-1914-r/",
        "type": "Muzeum",
        "note": "Lista zniszczonych obiektów. W tym tekście błędne wezwanie kościoła na Żbikowie („Nawiedzenia NMP”)."
      },
      "Z05": {
        "name": "Muzeum Dulag 121: Na wycieczkę 3 – Pęcice, Chlebów, Komorów (z relacją A. Marylskiego)",
        "url": "http://dulag121.pl/trasy/na-wycieczke-3-pecice-chlebow-komorow/",
        "type": "Muzeum / wspomnienie właściciela dworu",
        "note": "Pęcice 1914; Marylski, „Niemcy pod Warszawą” (1921)."
      },
      "Z06": {
        "name": "Powiat Pruszkowski: Cmentarz z I wojny światowej (Pęcice)",
        "url": "https://samorzad.gov.pl/web/powiat-pruszkowski/cmentarz-z-i-wojny-swiatowej",
        "type": "Administracja",
        "note": "49 niemieckich i 218 rosyjskich żołnierzy."
      },
      "Z07": {
        "name": "Szlak Frontu Wschodniego I Wojny Światowej na Mazowszu – przewodnik (MROT, XI 2024), s. 6–21, 23–25",
        "url": "",
        "type": "Przewodnik turystyczny",
        "note": "Kontekst frontu 1914–1915. Pruszków, Żbików, Gąsin, Bąki w nim nie występują."
      },
      "Z08": {
        "name": "Wikipedia: Bitwa pod Warszawą i Iwangorodem (1914)",
        "url": "https://pl.wikipedia.org/wiki/Bitwa_pod_Warszaw%C4%85_i_Iwangorodem",
        "type": "Encyklopedia (wtórne)",
        "note": "Ogólne ramy operacji."
      },
      "Z09": {
        "name": "Zabytek.pl: Pruszków, cmentarz parafialny (kwatera żołnierzy rosyjskich i niemieckich z I wojny)",
        "url": "https://zabytek.pl/en/obiekty/pruszkow-cmentarz-par-rzym-kat-225675",
        "type": "Rejestr zabytków",
        "note": "Potwierdza istnienie kwatery, bez opisu."
      },
      "Z10": {
        "name": "Opencaching / blog „Polska wzdłuż szosy”: Pęcice – cmentarz 1914, pociski w ścianie kościoła",
        "url": "https://opencaching.pl/viewcache.php?cacheid=21174",
        "type": "Serwis turystyczny (wtórne)",
        "note": "Pociski w ścianie kościoła w Pęcicach: do potwierdzenia na miejscu."
      },
      "Z11": {
        "name": "Moje miasto i ogród działkowy – Pruszków (pruszkow.sabak.info.pl)",
        "url": "https://pruszkow.sabak.info.pl/",
        "type": "Serwis lokalny (niższa wiarygodność)",
        "note": "Ewakuacja szpitala w Tworkach w 1915."
      },
      "Z12": {
        "name": "Jacek Dobrosz, „Dzieje żbikowskiej parafii” (Regio-Media, 2012), oparte na Albumie 750-lecia Parafii Żbikowskiej (1994)",
        "url": "http://regio-media.pl/2012/09/09/dzieje-zbikowskiej-parafii/",
        "type": "Publicystyka lokalna (wtórne)",
        "note": "Parafia obejmuje Żbików i Gąsin. Komenda odcinka Ołtarzew–Pruszków i rosyjskie baterie na terenie parafii."
      },
      "Z13": {
        "name": "Jerzy Ryx, „Kościół Żbikowski w r. 1914” (Echo Pruszkowskie 1924 nr 7; przedruk Muzeum Dulag 121)",
        "url": "http://dulag121.pl/pruskovianaa/ryx-kosciol-zbikowski-w-1914/",
        "type": "Wspomnienie sprzed 10 lat (literackie)",
        "note": "Najbogatsze źródło o ostrzale kościoła. Styl literacki, daty i nazwiska wymagają weryfikacji."
      },
      "Z14": {
        "name": "Zofia Mrówczyńska, „Rys historyczny miasta Pruszkowa” (Przegląd Pruszkowski 1996 nr 1; przedruk Dulag 121)",
        "url": "http://dulag121.pl/pruskovianaa/mrowczynska-rys-historyczny-pruszkowa/",
        "type": "Opracowanie (kustosz muzeum)",
        "note": "Podział osady na dzielnice, ulice Żbikowa, straty 1914, prawa miejskie."
      },
      "Z15": {
        "name": "Muzeum Dulag 121: Archiwum fotografii (Zaborscy: zniszczona Fabryka Ołówków 1914; Polona: pocztówki 1914, niemiecka mapa z rosyjskimi pozycjami; Archiwum geodezji: zdjęcia Gąsina z lat 30.)",
        "url": "https://dulag121.pl/pruskoviana-type/fotografia/",
        "type": "Archiwum zdjęć",
        "note": "Zdjęcia nieprzejrzane wizualnie, korzystano z podpisów."
      },
      "Z16": {
        "name": "Archidiecezja Warszawska: Parafia NPNMP w Pruszkowie-Żbikowie",
        "url": "https://archwwa.pl/parafie/pruszkow-niepokalanego-poczecia-nmp/",
        "type": "Kuria",
        "note": "Wieża i dach uszkodzone w X 1914, odbudowa 1915–1922."
      },
      "Z17": {
        "name": "Wikipedia: Kościół NPNMP w Pruszkowie",
        "url": "https://pl.wikipedia.org/wiki/Ko%C5%9Bci%C3%B3%C5%82_Niepokalanego_Pocz%C4%99cia_Naj%C5%9Bwi%C4%99tszej_Maryi_Panny_w_Pruszkowie",
        "type": "Encyklopedia (wtórne)",
        "note": "Potwierdza uszkodzenie wieży i dachu."
      },
      "Z18": {
        "name": "Parafia Żbików: Historia (mat. T. Błażejewski)",
        "url": "https://parafia-zbikow.pl/historia/",
        "type": "Strona parafii",
        "note": "Topografia Żbikowa: dwór biskupi, cmentarz, Utrata, granica z Gąsinem. Link do PDF „Żbików i okolice na starych mapach”."
      },
      "Z19": {
        "name": "Muzeum Dulag 121: Szkoła im. M. Curie-Skłodowskiej (Szkoła Kolejowa)",
        "url": "https://dulag121.pl/pruskovianaa/szkola-marii-curie-sklodowskiej/",
        "type": "Muzeum",
        "note": "Adres szkoły, ewakuacja do Połtawy 1915."
      },
      "Z20": {
        "name": "Muzeum Dulag 121: Kopiec Kościuszki",
        "url": "https://dulag121.pl/pruskovianaa/kopiec-kosciuszki/",
        "type": "Muzeum",
        "note": "Obchody 15 X 1917, lokalizacja kopca."
      },
      "Z21": {
        "name": "Muzeum Dulag 121: Żbikowska apteka",
        "url": "https://dulag121.pl/pruskovianaa/apteka/",
        "type": "Muzeum",
        "note": "Skrzynka kontaktowa POW 1916–1918."
      },
      "Z22": {
        "name": "Ks. Tadeusz Czechowski, „Historia Parafji Żbikowskiej” i „Pamiątka lat dawnych” (Echo Pruszkowskie 1924 nr 7)",
        "url": "http://dulag121.pl/pruskovianaa/czechowski-historia-parafii-zbikowskiej/",
        "type": "Wspomnienie proboszcza (1916–1928)",
        "note": "Topografia: kapliczka przy cmentarzu, stary trakt z lipami przy szkółkach Hosera."
      },
      "Z23": {
        "name": "Muzeum Dulag 121: Cegielnia braci Hoser",
        "url": "https://dulag121.pl/pruskovianaa/cegielnia-braci-hoser/",
        "type": "Muzeum",
        "note": "Kolejka wąskotorowa Hoserów: ul. Mostowa, mostek na Utracie, ul. Elektryczna."
      },
      "Z24": {
        "name": "Parafia św. Kazimierza w Pruszkowie: Historia",
        "url": "https://parafiaswkazimierza.pl/historia/",
        "type": "Strona parafii",
        "note": "Granice parafii od strony Utraty i torów."
      },
      "Z25": {
        "name": "Muzeum Dulag 121: Parafia Żbikowska",
        "url": "http://dulag121.pl/pruskovianaa/parafia-zbikowska/",
        "type": "Muzeum",
        "note": "Niemcy pod Helenowem, baterie rosyjskie przy szkółkach Hoserów, kościół uszkodzony w drugiej połowie X 1914."
      }
    },
    "events": [
      {
        "id": "ww1-m09",
        "code": "M09",
        "title": "Kościół NPNMP na Żbikowie (1906–1914): trafienia w wieżę, dach, ścianę frontową",
        "category": "Zniszczenia",
        "type": "zniszczenie",
        "date": "X 1914 (Ryx: rano 17 X; Skwara: 13–14 X)",
        "sort": "1914-10-17",
        "desc": "Nowy kościół uszkodzony ogniem artylerii: wieża i dach (Wikipedia, kuria). Wg relacji z 1924 granat dużego kalibru trafił w wieżę, robiąc olbrzymi wyłom i zrzucając dzwony. Kolejny pocisk wpadł przez ścianę frontową nad chórem i wybuchł przed głównym ołtarzem. Część dachu z miedzianą sygnaturką zapadła się, wypadły witraże. Odbudowa 1915–1922, remont trwał dłużej niż budowa. Ślady po ostrzale na wieży widoczne do dziś.",
        "where": "Żbików, ul. 3 Maja, wzgórze kościelne",
        "area": "Żbików",
        "tracks": "Północ",
        "side": "Obie strony (ostrzał niemiecki)",
        "certainty": "Potwierdzone (źródło wtórne)",
        "note": "Relacja Ryxa o pociskach wewnątrz kościoła jest wspomnieniem z 1924. Ślady na wieży podaje Regio-Media (Z12): sprawdzić na miejscu.",
        "sources": [
          "Z16",
          "Z02",
          "Z12",
          "Z13",
          "Z17"
        ],
        "from": "1914-10-13",
        "to": "1914-10-17",
        "lat": 52.180644,
        "lng": 20.785821,
        "link": 7
      },
      {
        "id": "ww1-m33",
        "code": "M33",
        "title": "Wieża kościoła: rosyjski punkt obserwacyjny",
        "category": "Punkt obserwacyjny",
        "type": "obserwacja",
        "date": "16–17 X 1914",
        "sort": "1914-10-16",
        "desc": "Rosyjscy wywiadowcy stali za framugami okien wieży i przez telefon polowy korygowali ogień baterii. Niemcy wiedzieli o obserwatorach. Jeden obserwator poległ po trafieniu wieży granatem dużego kalibru.",
        "where": "Wieża kościoła NPNMP",
        "area": "Żbików",
        "tracks": "Północ",
        "side": "Rosjanie",
        "certainty": "Relacja świadka",
        "note": "Wspomnienie z 1924.",
        "sources": [
          "Z13",
          "Z12"
        ],
        "from": "1914-10-16",
        "to": "1914-10-17",
        "lat": 52.180644,
        "lng": 20.785821,
        "link": 7
      },
      {
        "id": "ww1-m34",
        "code": "M34",
        "title": "Plebania żbikowska: komenda odcinka Pruszków–Ołtarzew",
        "category": "Kwatera / sztab",
        "type": "sztab",
        "date": "X 1914 (kilka dni do 17 X)",
        "sort": "1914-10-16",
        "desc": "W kancelarii plebanii pracowały dwa wojskowe telefony komendy odcinka Pruszków–Ołtarzew. Rosyjski komendant z adiutantem i lekarzem wojskowym kwaterował u proboszcza. 16 X ostrzegł go o czterech niemieckich bateriach polowych naprzeciw odcinka.",
        "where": "Plebania przy kościele, Żbików",
        "area": "Żbików",
        "tracks": "Północ",
        "side": "Rosjanie",
        "certainty": "Relacja świadka",
        "note": "Fakt komendy odcinka na terenie parafii potwierdza też Z12. Szczegóły z plebanii tylko z Z13.",
        "sources": [
          "Z13",
          "Z12"
        ],
        "from": "1914-10-16",
        "to": "1914-10-17",
        "lat": 52.1804209,
        "lng": 20.7867175
      },
      {
        "id": "ww1-m35",
        "code": "M35",
        "title": "Zaplecze kościoła: ukryte rosyjskie baterie (cel: Rokitno)",
        "category": "Stanowisko artylerii",
        "type": "artyleria",
        "date": "17 X 1914",
        "sort": "1914-10-17",
        "desc": "Rosyjskie baterie większego kalibru stały ukryte poza ogrodem i budynkami za kościołem. Zgodnie ze wskazówkami z wieży ostrzeliwały głównie kościół w Rokitnie. Komendant stał z oficerami tuż pod kościołem od strony północno-wschodniej.",
        "where": "Teren za plebanią i ogrodem, Żbików (do ustalenia)",
        "area": "Żbików",
        "tracks": "Północ",
        "side": "Rosjanie",
        "certainty": "Relacja świadka",
        "note": "Może to ta sama lub sąsiednia pozycja co szkółki Hoserów (M05).",
        "sources": [
          "Z13",
          "Z12"
        ],
        "from": "1914-10-17",
        "to": "1914-10-17",
        "lat": 52.180644,
        "lng": 20.785821,
        "approx": "Punkt orientacyjny: baterie stały za kościołem, poza ogrodem i budynkami plebanii; dokładne miejsce do ustalenia."
      },
      {
        "id": "ww1-m36",
        "code": "M36",
        "title": "Park Żbikowski: obserwatorzy na drzewach z telefonem",
        "category": "Punkt obserwacyjny",
        "type": "obserwacja",
        "date": "17 X 1914",
        "sort": "1914-10-17",
        "desc": "Po trafieniu wieży obserwatorzy weszli na najwyższe drzewa parku żbikowskiego i założyli nową linię telefoniczną.",
        "where": "Park przy kościele, Żbików",
        "area": "Żbików",
        "tracks": "Północ",
        "side": "Rosjanie",
        "certainty": "Relacja świadka",
        "note": "Zakładamy park przy kościele i plebanii.",
        "sources": [
          "Z13"
        ],
        "from": "1914-10-17",
        "to": "1914-10-17",
        "lat": 52.180644,
        "lng": 20.785821,
        "approx": "Punkt orientacyjny: park przy kościele i plebanii."
      },
      {
        "id": "ww1-m37",
        "code": "M37",
        "title": "Podziemia kościoła: schron ludności i ewakuacja przez pola",
        "category": "Schron",
        "type": "schron",
        "date": "17 X 1914",
        "sort": "1914-10-17",
        "desc": "Proboszcz z wikarym i grupą mieszkańców schronili się w podziemiach kościoła z zapalonymi świecami. Rosyjski komendant kazał uchodzić, ostrzegając o zawaleniu. Proboszcz wyniósł z kościoła puszkę z komunikantami, a potem grupa przeszła przez pola w kierunku Warszawy. Wg relacji nikt nie zginął.",
        "where": "Kościół NPNMP, podziemia",
        "area": "Żbików",
        "tracks": "Północ",
        "side": "Ludność",
        "certainty": "Relacja świadka",
        "note": "Nazwiska księży z relacji (ks. Makowski, wik. Poskrobko) niezweryfikowane. Czechowski (Z22) wymienia ks. Jana Makowskiego wśród zasłużonych przy budowie kościoła.",
        "sources": [
          "Z13"
        ],
        "from": "1914-10-17",
        "to": "1914-10-17",
        "lat": 52.180644,
        "lng": 20.785821,
        "link": 7
      },
      {
        "id": "ww1-m05",
        "code": "M05",
        "title": "Szkółki Żbikowskie Hoserów: rosyjskie baterie",
        "category": "Stanowisko artylerii",
        "type": "artyleria",
        "date": "13–17 X 1914",
        "sort": "1914-10-13",
        "desc": "Rosyjskie baterie rozlokowane w okolicach szkółek Hoserów prowadziły pojedynek z bateriami niemieckimi spod Helenowa. Część pocisków chybiała i padała na Pruszków. Szkółki leżały na skraju Żbikowa. Na ich terenie stoją ostatnie trzy lipy dawnego traktu warszawskiego.",
        "where": "Teren szkółek Hoserów, Żbików, w pobliżu cmentarza i kapliczki (do ustalenia)",
        "area": "Żbików",
        "tracks": "Północ",
        "side": "Rosjanie",
        "certainty": "Potwierdzone (źródło wtórne)",
        "note": "Sformułowanie „w okolicach” pochodzi z opisu muzeum, nie z relacji świadka.",
        "sources": [
          "Z01",
          "Z25",
          "Z02",
          "Z22"
        ],
        "from": "1914-10-13",
        "to": "1914-10-17",
        "at": "ul-zbikowska-51",
        "approx": "Punkt orientacyjny: „w okolicach szkółek Hoserów” (ul. Żbikowska 51); dokładne stanowiska do ustalenia.",
        "link": 29
      },
      {
        "id": "ww1-m10",
        "code": "M10",
        "title": "Szkoła Kolejowa: schron w suterenach",
        "category": "Schron",
        "type": "schron",
        "date": "13–17 X 1914",
        "sort": "1914-10-13",
        "desc": "Wiele kobiet i dzieci schroniło się w rozległych suterenach szkoły kolejowej. Budynek szkoły przy ul. Szkolnej 14 (dziś Szkolna 3) służył szkole w latach 1902–1915. W 1915 nauczyciele i uczniowie ewakuowani do Połtawy, wrócili w 1918. Budynek zajęła wtedy bursa RGO.",
        "where": "ul. Szkolna 3 (dawniej 14), Żbików",
        "area": "Żbików",
        "tracks": "Północ",
        "side": "Ludność",
        "certainty": "Relacja świadka",
        "sources": [
          "Z01",
          "Z19",
          "Z02"
        ],
        "from": "1914-10-13",
        "to": "1914-10-17",
        "lat": 52.175633,
        "lng": 20.80472,
        "link": 17
      },
      {
        "id": "ww1-m11",
        "code": "M11",
        "title": "Warsztaty Drogi Żelaznej Warszawsko-Wiedeńskiej",
        "category": "Zniszczenia / 1915",
        "type": "zniszczenie",
        "date": "X 1914; lato 1915; odbudowa do 1920",
        "sort": "1915-07",
        "desc": "Relacja z 1914: warsztaty względnie mało uszkodzone. Lato 1915: Rosjanie wysadzili część infrastruktury, ewakuowano kadrę i rodziny. Odbudowę warsztatów zakończono w 1920. Leżały w polach między Żbikowem a Tworkami.",
        "where": "ZNTK, okolice ul. 3 Maja i torów",
        "area": "Żbików / Tworki",
        "tracks": "Na torach",
        "certainty": "Potwierdzone (źródło wtórne)",
        "note": "Rozbieżność: Dulag (Z04) wymienia warsztaty wśród zniszczonych w 1914.",
        "sources": [
          "Z02",
          "Z01",
          "Z04",
          "Z14"
        ],
        "at": "ul-3-maja-8",
        "link": 19
      },
      {
        "id": "ww1-m47",
        "code": "M47",
        "title": "Bursy RGO i opuszczone kamienice (ul. Narodowa, Szkolna, Cicha)",
        "category": "Skutki po wojnie",
        "type": "spoleczne",
        "date": "1915–1919",
        "sort": "1915-08",
        "desc": "Po przymusowej ewakuacji 1915 największe domy czynszowe stały puste. W 1919 delegat rządowy zarekwirował kilka z nich na bursy dla wojennych sierot. W szczycie mieszkało na Żbikowie ok. tysiąca dzieci.",
        "where": "ul. Narodowa, Szkolna, Cicha",
        "area": "Żbików",
        "tracks": "Północ",
        "side": "Ludność",
        "certainty": "Potwierdzone (źródło wtórne)",
        "note": "Dokładne adresy kamienic nie są podane.",
        "sources": [
          "Z02"
        ]
      },
      {
        "id": "ww1-m31",
        "code": "M31",
        "title": "Apteka Bielawskiego: skrzynka kontaktowa i komenda POW",
        "category": "Niepodległość",
        "type": "niepodleglosc",
        "date": "1916–1918",
        "sort": "1916",
        "desc": "Skrzynka kontaktowa i komenda pruszkowskiego oddziału POW. Stąd 11 XI 1918 peowiacy ruszyli rozbrajać niemieckie posterunki.",
        "where": "ul. 3 Maja, Żbików",
        "area": "Żbików",
        "tracks": "Północ",
        "certainty": "Potwierdzone (źródło wtórne)",
        "sources": [
          "Z21",
          "Z02"
        ],
        "at": "ul-3-maja-27",
        "link": 125
      },
      {
        "id": "ww1-m32",
        "code": "M32",
        "title": "Kopiec Kościuszki i popiersie (15 X 1917)",
        "category": "Niepodległość",
        "type": "niepodleglosc",
        "date": "15 X 1917",
        "sort": "1917-10-15",
        "desc": "Po nabożeństwie mieszkańcy przeszli ul. Główną (dziś 3 Maja) do skrzyżowania z ul. Narodową, gdzie odsłonięto popiersie na małym kopcu. Pomnik prawdopodobnie zniszczony jeszcze w czasie wojny, odbudowany. Dziś stoi u zbiegu ul. Warsztatowej i 3 Maja.",
        "where": "zbieg ul. Warsztatowej i 3 Maja",
        "area": "Żbików",
        "tracks": "Północ",
        "certainty": "Potwierdzone (źródło wtórne)",
        "note": "Data: Dulag 15 X (rocznica śmierci Kościuszki), Skwara 17 X.",
        "sources": [
          "Z20",
          "Z02"
        ],
        "lat": 52.173678,
        "lng": 20.805919
      },
      {
        "id": "ww1-m01",
        "code": "M01",
        "title": "Helenów, pałac Potockich: sztab i stanowiska niemieckiej artylerii",
        "category": "Stanowisko artylerii / sztab",
        "type": "artyleria",
        "date": "12–19 X 1914",
        "sort": "1914-10-12",
        "desc": "Niemcy zajęli pałac 12 X rano: sztab na piętrze, lazaret na parterze, artyleria przy pałacu, miejsce dla 150 koni. Właściciele 8 dni w piwnicy. Pałac mocno uszkodzony, park wycięty i poryty rowami.",
        "where": "Helenów (dawny majątek)",
        "area": "Helenów",
        "tracks": "Do ustalenia",
        "side": "Niemcy",
        "certainty": "Relacja świadka",
        "sources": [
          "Z01",
          "Z25"
        ],
        "from": "1914-10-12",
        "to": "1914-10-19",
        "lat": 52.150532,
        "lng": 20.785705
      },
      {
        "id": "ww1-m02",
        "code": "M02",
        "title": "Helenów, zagajnik przy pałacu: okopy i ziemianki („miasto podziemne”)",
        "category": "Okopy / ziemianki",
        "type": "okopy",
        "date": "12–19 X 1914",
        "sort": "1914-10-12",
        "desc": "Odkryto ziemianki wyłożone słomą. W okopach były meble, drzwi, okna i naczynia zrabowane w Pruszkowie. Niemcy bronili się w Helenowie cały tydzień po wyparciu z Pruszkowa.",
        "where": "Helenów",
        "area": "Helenów",
        "tracks": "Do ustalenia",
        "side": "Niemcy",
        "certainty": "Relacja świadka",
        "sources": [
          "Z01"
        ],
        "from": "1914-10-12",
        "to": "1914-10-19",
        "lat": 52.150532,
        "lng": 20.785705,
        "approx": "Punkt orientacyjny: zagajnik przy pałacu w Helenowie."
      },
      {
        "id": "ww1-m03",
        "code": "M03",
        "title": "Paszków: niemieckie okopy i kwatera",
        "category": "Okopy / ziemianki",
        "type": "okopy",
        "date": "ok. 10 dni, X 1914",
        "sort": "1914-10",
        "desc": "Zarekwirowano bydło, zboże, konie. Rozebrano płoty i stodołę na opał. Na polach okopy, padlina koni, gilzy i puszki po konserwach.",
        "where": "okolice Helenowa / Raszyna",
        "area": "Paszków (sąsiedztwo Helenowa)",
        "tracks": "Do ustalenia",
        "side": "Niemcy",
        "certainty": "Relacja świadka",
        "note": "Relacja wspomina, że Niemcy mieli strzelać przez pomyłkę do własnego oddziału.",
        "sources": [
          "Z01"
        ],
        "lat": 52.115,
        "lng": 20.833333,
        "approx": "Punkt orientacyjny: przysiółek Paszków; położenie okopów do ustalenia."
      },
      {
        "id": "ww1-m04",
        "code": "M04",
        "title": "Aleja lipowa od strony Helenowa: wejście Niemców do Pruszkowa",
        "category": "Kierunek natarcia",
        "type": "natarcie",
        "date": "11 X 1914, ok. 16:30",
        "sort": "1914-10-11",
        "desc": "Niemcy weszli do miasta aleją lipową od Helenowa i zniszczyli telegraf oraz telefon na stacji.",
        "where": "aleja prowadząca z Helenowa",
        "area": "Pruszków",
        "tracks": "Do ustalenia",
        "side": "Niemcy",
        "certainty": "Relacja świadka",
        "sources": [
          "Z01"
        ],
        "from": "1914-10-11",
        "to": "1914-10-11"
      },
      {
        "id": "ww1-m06",
        "code": "M06",
        "title": "Tworki: pozycje rosyjskie, linia piechoty, artyleria dalekonośna",
        "category": "Stanowisko artylerii",
        "type": "artyleria",
        "date": "13–16 X 1914",
        "sort": "1914-10-13",
        "desc": "Z Tworek waliła artyleria dalekonośna. Rosyjska piechota atakowała skokami i okopywała się ok. wiorsty od Tworek.",
        "where": "Tworki",
        "area": "Tworki",
        "tracks": "Południe",
        "side": "Rosjanie",
        "certainty": "Relacja świadka",
        "note": "Tworki leżą po południowej stronie torów (Z02).",
        "sources": [
          "Z01",
          "Z02"
        ],
        "from": "1914-10-13",
        "to": "1914-10-16",
        "lat": 52.168746,
        "lng": 20.81922,
        "approx": "Punkt orientacyjny: Tworki; linia piechoty ok. wiorsty od Tworek."
      },
      {
        "id": "ww1-m07",
        "code": "M07",
        "title": "Kierunek Włochy: rosyjskie ciężkie armaty",
        "category": "Stanowisko artylerii",
        "type": "artyleria",
        "date": "13–16 X 1914",
        "sort": "1914-10-13",
        "desc": "Lekarze w Tworkach słyszeli ciężkie armaty „od Włoch”. Nie wiadomo, czy to działa fortowe, czy polowe przy fortach.",
        "where": "Włochy, lokalizacja nieustalona",
        "area": "Włochy (kierunek)",
        "tracks": "Do ustalenia",
        "side": "Rosjanie",
        "certainty": "Hipoteza",
        "note": "Twierdzę Warszawa skasowano w 1909, ale forty służyły jako linia oparcia 2 Armii w X 1914.",
        "sources": [
          "Z01",
          "Z07"
        ],
        "from": "1914-10-13",
        "to": "1914-10-16"
      },
      {
        "id": "ww1-m08",
        "code": "M08",
        "title": "Pęcice: wzgórze nad Utratą i niemiecka pozycja przy dworze",
        "category": "Stanowisko artylerii / okopy",
        "type": "artyleria",
        "date": "X 1914",
        "sort": "1914-10",
        "desc": "Rosjanie ze wzgórza ostrzeliwali niemiecką pozycję w rowie ok. 200 kroków od dworu. Niemiecka artyleria strzelała zza wsi, nad dworem krążyły dwa rosyjskie samoloty.",
        "where": "Pęcice, okolice dworu",
        "area": "Pęcice",
        "tracks": "Do ustalenia",
        "side": "Obie strony",
        "certainty": "Relacja świadka",
        "sources": [
          "Z05"
        ],
        "lat": 52.153333,
        "lng": 20.849166,
        "approx": "Punkt orientacyjny: Pęcice; wzgórze nad Utratą i dwór do ustalenia."
      },
      {
        "id": "ww1-m12",
        "code": "M12",
        "title": "Stacja kolejowa Pruszków",
        "category": "Zniszczenia",
        "type": "zniszczenie",
        "date": "11–14 X 1914",
        "sort": "1914-10-11",
        "desc": "Stację ostrzelano. Niemcy zniszczyli telegraf i telefon 11 X. Pociągi nie kursowały od 11 X.",
        "where": "stacja Pruszków",
        "area": "Pruszków",
        "tracks": "Na torach",
        "certainty": "Potwierdzone (źródło wtórne)",
        "sources": [
          "Z03",
          "Z01"
        ],
        "from": "1914-10-11",
        "to": "1914-10-14",
        "lat": 52.168222,
        "lng": 20.798925
      },
      {
        "id": "ww1-m13",
        "code": "M13",
        "title": "Fabryka Ołówków St. Majewskiego (Pruszków II)",
        "category": "Zniszczenia",
        "type": "zniszczenie",
        "date": "X 1914; odbudowa 1920",
        "sort": "1914-10",
        "desc": "Spłonęła. Na zdjęciach z 1914 m.in. częściowo zniszczona wieża ciśnień przy spalonym budynku głównym, spalona siłownia, podziurawiona granatami ściana graficiarni, zniszczona portiernia i drewniany dom Zaborskich oraz „Biała willa”. Fabrykę odbudowano w 1920.",
        "where": "okolice stacji (Pruszków II), do ustalenia",
        "area": "Pruszków II",
        "tracks": "Do ustalenia",
        "certainty": "Potwierdzone (źródło wtórne)",
        "note": "Względem torów: Mrówczyńska (Z14) nazywa tę część „dzielnicą północną” osady, do potwierdzenia na mapie.",
        "sources": [
          "Z01",
          "Z15",
          "Z14"
        ]
      },
      {
        "id": "ww1-m14",
        "code": "M14",
        "title": "Ulica Stalowa: spalone domy",
        "category": "Zniszczenia",
        "type": "zniszczenie",
        "date": "X 1914",
        "sort": "1914-10",
        "desc": "Kilka domów spłonęło.",
        "where": "ul. Stalowa",
        "area": "Pruszków II",
        "tracks": "Do ustalenia",
        "certainty": "Relacja świadka",
        "note": "Jw., „dzielnica północna” wg Z14.",
        "sources": [
          "Z01",
          "Z14"
        ],
        "lat": 52.162655,
        "lng": 20.792576,
        "approx": "Punkt orientacyjny: ul. Stalowa."
      },
      {
        "id": "ww1-m43",
        "code": "M43",
        "title": "Dzielnica północna osady: rejon fabryk Troetzera, Rudnickiego i Majewskiego (ul. Stalowa, Ołówkowa, Kolejowa, dziś Sienkiewicza)",
        "category": "Zniszczenia",
        "type": "zniszczenie",
        "date": "14–19 X 1914",
        "sort": "1914-10-14",
        "desc": "Niemiecki ostrzał zniszczył obiekty przemysłowe i budynki mieszkalne w północno-zachodniej części osady i we wsi Józefów. Straty w pierwszym roku wojny oszacowano na 1,3 mln rubli, do 1916 na 3 mln.",
        "where": "okolice ul. Stalowej, Ołówkowej, Sienkiewicza",
        "area": "Pruszków",
        "tracks": "Do ustalenia",
        "side": "Niemcy (ostrzał)",
        "certainty": "Potwierdzone (źródło wtórne)",
        "note": "Kolumna „Względem torów” celowo „Do ustalenia”: źródło mówi o północy osady, nie o torach.",
        "sources": [
          "Z14"
        ],
        "from": "1914-10-14",
        "to": "1914-10-19",
        "lat": 52.162811,
        "lng": 20.794173,
        "approx": "Punkt orientacyjny: rejon ulic Stalowej i Ołówkowej."
      },
      {
        "id": "ww1-m41",
        "code": "M41",
        "title": "Józefów: zniszczenia od ostrzału",
        "category": "Zniszczenia",
        "type": "zniszczenie",
        "date": "14–19 X 1914",
        "sort": "1914-10-14",
        "desc": "Niemiecki ostrzał zniszczył budynki mieszkalne we wsi Józefów.",
        "where": "Józefów, Pruszków",
        "area": "Józefów (dziś Pruszków)",
        "tracks": "Do ustalenia",
        "side": "Niemcy (ostrzał)",
        "certainty": "Potwierdzone (źródło wtórne)",
        "sources": [
          "Z14",
          "Z24"
        ],
        "from": "1914-10-14",
        "to": "1914-10-19"
      },
      {
        "id": "ww1-m15",
        "code": "M15",
        "title": "Park Bersohna",
        "category": "Zniszczenia",
        "type": "zniszczenie",
        "date": "X 1914",
        "sort": "1914-10",
        "desc": "Połamane drzewa, ogrodzenia zniesione doszczętnie. Wg Wikipedii wszystkie budynki w parku zniszczone.",
        "where": "Park Bersohna",
        "area": "Pruszków",
        "tracks": "Do ustalenia",
        "certainty": "Potwierdzone (źródło wtórne)",
        "sources": [
          "Z01",
          "Z03"
        ]
      },
      {
        "id": "ww1-m16",
        "code": "M16",
        "title": "Pałacyk Stowarzyszenia Księży Emerytów (dziś „Sokół”)",
        "category": "Zniszczenia",
        "type": "zniszczenie",
        "date": "13–14 X 1914",
        "sort": "1914-10-13",
        "desc": "Zrujnowany ostrzałem.",
        "where": "pałacyk „Sokół”",
        "area": "Pruszków",
        "tracks": "Do ustalenia",
        "certainty": "Potwierdzone (źródło wtórne)",
        "sources": [
          "Z04"
        ],
        "from": "1914-10-13",
        "to": "1914-10-14",
        "lat": 52.1660022,
        "lng": 20.8017553,
        "photos": [
          {
            "file": "img/sokol-siedziba.jpg",
            "thumb": "img/t/sokol-siedziba.jpg",
            "caption": "Pruszków — siedziba „Sokoła” (pocztówka)",
            "date": "przed 1939",
            "author": "",
            "sourceName": "Polona / Wikimedia Commons",
            "sourceUrl": "https://commons.wikimedia.org/wiki/File:Pruszkow_-_siedziba_%22Sokola%22._przed_1939_(72788923).jpg",
            "license": "domena publiczna"
          }
        ]
      },
      {
        "id": "ww1-m17",
        "code": "M17",
        "title": "Młyn nad Utratą",
        "category": "Zniszczenia",
        "type": "zniszczenie",
        "date": "13–14 X 1914",
        "sort": "1914-10-13",
        "desc": "Zniszczony w ostrzale.",
        "where": "nad Utratą",
        "area": "Pruszków",
        "tracks": "Do ustalenia",
        "certainty": "Potwierdzone (źródło wtórne)",
        "sources": [
          "Z04"
        ],
        "from": "1914-10-13",
        "to": "1914-10-14"
      },
      {
        "id": "ww1-m18",
        "code": "M18",
        "title": "Fabryka fajansu Teichfelda",
        "category": "Zniszczenia",
        "type": "zniszczenie",
        "date": "13–14 X 1914",
        "sort": "1914-10-13",
        "desc": "Całkowite lub częściowe zniszczenie. Fabryka w południowej dzielnicy osady.",
        "where": "późniejszy Porcelit, do potwierdzenia",
        "area": "Pruszków",
        "tracks": "Południe",
        "certainty": "Potwierdzone (źródło wtórne)",
        "sources": [
          "Z04",
          "Z14"
        ],
        "from": "1914-10-13",
        "to": "1914-10-14",
        "lat": 52.161432,
        "lng": 20.806072,
        "approx": "Punkt orientacyjny: przy pałacu Teichfelda; fabryka stała w południowej dzielnicy osady."
      },
      {
        "id": "ww1-m19",
        "code": "M19",
        "title": "Fabryka J. Troetzera (pomp, maszyn)",
        "category": "Zniszczenia",
        "type": "zniszczenie",
        "date": "13–14 X 1914",
        "sort": "1914-10-13",
        "desc": "Całkowite lub częściowe zniszczenie. W 1915 maszyny i kadra ewakuowane w głąb Rosji.",
        "where": "późniejsze Zakłady „Mechaników”",
        "area": "Pruszków",
        "tracks": "Do ustalenia",
        "certainty": "Potwierdzone (źródło wtórne)",
        "sources": [
          "Z04",
          "Z14"
        ],
        "from": "1914-10-13",
        "to": "1914-10-14"
      },
      {
        "id": "ww1-m20",
        "code": "M20",
        "title": "Wille „Wenecja” i „Anielin”",
        "category": "Zniszczenia",
        "type": "zniszczenie",
        "date": "13–14 X 1914",
        "sort": "1914-10-13",
        "desc": "Zniszczone w ostrzale.",
        "where": "do ustalenia",
        "area": "Pruszków",
        "tracks": "Do ustalenia",
        "certainty": "Potwierdzone (źródło wtórne)",
        "sources": [
          "Z04"
        ],
        "from": "1914-10-13",
        "to": "1914-10-14"
      },
      {
        "id": "ww1-m21",
        "code": "M21",
        "title": "Kościół św. Kazimierza",
        "category": "Zniszczenia",
        "type": "zniszczenie",
        "date": "13–14 X 1914",
        "sort": "1914-10-13",
        "desc": "Poważnie uszkodzony.",
        "where": "kościół św. Kazimierza",
        "area": "Pruszków",
        "tracks": "Do ustalenia",
        "certainty": "Potwierdzone (źródło wtórne)",
        "sources": [
          "Z03",
          "Z24"
        ],
        "from": "1914-10-13",
        "to": "1914-10-14",
        "lat": 52.162348,
        "lng": 20.809598
      },
      {
        "id": "ww1-m22",
        "code": "M22",
        "title": "Szpital w Tworkach: punkt opatrunkowy w fermie szpitalnej",
        "category": "Zniszczenia",
        "type": "zniszczenie",
        "date": "13–17 X 1914; 1915",
        "sort": "1914-10-14",
        "desc": "Punkt opatrunkowy, w środę 14 X specjalnie ostrzeliwany. Wszystkie pawilony uszkodzone. W 1915 szpital ewakuowano w głąb Rosji.",
        "where": "Szpital w Tworkach",
        "area": "Tworki",
        "tracks": "Południe",
        "side": "Rosjanie",
        "certainty": "Relacja świadka",
        "sources": [
          "Z01",
          "Z11"
        ],
        "from": "1914-10-13",
        "to": "1914-10-17",
        "lat": 52.16868,
        "lng": 20.827208
      },
      {
        "id": "ww1-m23",
        "code": "M23",
        "title": "Piwnica przy ul. Marii-Jadwigi: schron 16 osób",
        "category": "Schron",
        "type": "schron",
        "date": "13–17 X 1914",
        "sort": "1914-10-13",
        "desc": "Autor relacji z 15 osobami przeżył 5 dni w ciasnej suterenie, bez ognia (dym miał ściągać ostrzał).",
        "where": "ul. Marii-Jadwigi (dzisiejsza nazwa do ustalenia)",
        "area": "Pruszków",
        "tracks": "Do ustalenia",
        "side": "Ludność",
        "certainty": "Relacja świadka",
        "note": "Nazwa ulicy z 1914 roku.",
        "sources": [
          "Z01"
        ],
        "from": "1914-10-13",
        "to": "1914-10-17"
      },
      {
        "id": "ww1-m24",
        "code": "M24",
        "title": "Dom, w którym kula armatnia przebiła ściany na wylot",
        "category": "Pocisk",
        "type": "pocisk",
        "date": "X 1914",
        "sort": "1914-10",
        "desc": "Relacja wspomina dom, w którym kula armatnia przebiła ściany i zniszczyła meble. Mieszkańcy zbierali kule armatnie z domów i podwórek.",
        "where": "lokalizacja nieznana",
        "area": "Pruszków",
        "tracks": "Do ustalenia",
        "certainty": "Hipoteza",
        "note": "Nie znaleziono źródła o „wielkim pocisku” w konkretnym miejscu.",
        "sources": [
          "Z01"
        ]
      },
      {
        "id": "ww1-m25",
        "code": "M25",
        "title": "Pałac w Pęcicach",
        "category": "Zniszczenia",
        "type": "zniszczenie",
        "date": "X 1914",
        "sort": "1914-10",
        "desc": "Zniszczony i spalony, w piwnicach schroniła się ludność. Odbudowany 1919–1923.",
        "where": "Pęcice, dwór",
        "area": "Pęcice",
        "tracks": "Do ustalenia",
        "side": "Niemcy (ostrzał: Rosjanie)",
        "certainty": "Potwierdzone (źródło wtórne)",
        "sources": [
          "Z05",
          "Z06"
        ],
        "lat": 52.153333,
        "lng": 20.849166,
        "approx": "Punkt orientacyjny: Pęcice; dokładne położenie pałacu do ustalenia."
      },
      {
        "id": "ww1-m26",
        "code": "M26",
        "title": "Kościół w Pęcicach: pociski w ścianie",
        "category": "Pocisk",
        "type": "pocisk",
        "date": "X 1914",
        "sort": "1914-10",
        "desc": "Kościół, plebania i dzwonnica zniszczone, odbudowa w latach 20. Pociski z 1914 mają tkwić w południowej ścianie kościoła.",
        "where": "kościół św. Piotra i Pawła, Pęcice",
        "area": "Pęcice",
        "tracks": "Do ustalenia",
        "certainty": "Potwierdzone (źródło wtórne)",
        "note": "Do potwierdzenia na miejscu.",
        "sources": [
          "Z10",
          "Z05"
        ],
        "lat": 52.151755,
        "lng": 20.848633
      },
      {
        "id": "ww1-m38",
        "code": "M38",
        "title": "Kościół w Rokitnie: zniszczony rosyjskim ostrzałem",
        "category": "Zniszczenia",
        "type": "zniszczenie",
        "date": "17 X 1914",
        "sort": "1914-10-17",
        "desc": "Według Ryxa rosyjskie baterie ze Żbikowa zamieniły w gruzy świątynię w Rokitnie. Zdjęcia kościoła w 1914 są na Polonie. Dulag pisze, że ostrzeliwano niemieckie pozycje w Rokitnie.",
        "where": "Rokitno, gm. Błonie",
        "area": "Rokitno (koło Błonia)",
        "tracks": "Do ustalenia",
        "side": "Rosjanie (ostrzał)",
        "certainty": "Relacja świadka",
        "note": "Odległość od Żbikowa trzeba sprawdzić. Miejsce poza obszarem, ale kluczowe dla celu baterii.",
        "sources": [
          "Z13",
          "Z12",
          "Z15"
        ],
        "from": "1914-10-17",
        "to": "1914-10-17",
        "lat": 52.184856,
        "lng": 20.667204
      },
      {
        "id": "ww1-m39",
        "code": "M39",
        "title": "Rokitno: cmentarz z I wojny (750 żołnierzy) i grób płk. Różańskiego",
        "category": "Cmentarz / mogiła",
        "type": "pamiec",
        "date": "X 1914",
        "sort": "1914-10-16",
        "desc": "Zbiorowe mogiły 750 żołnierzy rosyjskich i niemieckich poległych w walkach o Rokitno w X 1914. Pojedynczy grób płk. Stanisława Różańskiego, dowódcy 16 Pułku Strzelców Syberyjskich, poległego 16 X 1914.",
        "where": "Rokitno, gm. Błonie",
        "area": "Rokitno (koło Błonia)",
        "tracks": "Do ustalenia",
        "side": "Obie strony",
        "certainty": "Potwierdzone (źródło wtórne)",
        "note": "Przewodnik s. 25.",
        "sources": [
          "Z07"
        ],
        "lat": 52.183551,
        "lng": 20.663917,
        "approx": "Punkt orientacyjny: cmentarz w Rokitnie."
      },
      {
        "id": "ww1-m27",
        "code": "M27",
        "title": "Cmentarz parafialny w Pruszkowie: kwatera rosyjsko-niemiecka",
        "category": "Cmentarz / mogiła",
        "type": "pamiec",
        "date": "X 1914",
        "sort": "1914-10",
        "desc": "Wspólna kwatera żołnierzy rosyjskich i niemieckich poległych w 1914.",
        "where": "ul. Cmentarna, Pruszków",
        "area": "Pruszków",
        "tracks": "Do ustalenia",
        "side": "Obie strony",
        "certainty": "Potwierdzone (źródło wtórne)",
        "note": "Cmentarz założony w 1914.",
        "sources": [
          "Z09",
          "Z03"
        ],
        "lat": 52.157041,
        "lng": 20.799612,
        "approx": "Punkt orientacyjny: ul. Cmentarna."
      },
      {
        "id": "ww1-m28",
        "code": "M28",
        "title": "Cmentarz wojenny w Pęcicach",
        "category": "Cmentarz / mogiła",
        "type": "pamiec",
        "date": "X 1914",
        "sort": "1914-10",
        "desc": "49 niemieckich i 218 rosyjskich żołnierzy. Pochowany także Polak Ignacy Tarczyński.",
        "where": "na wschód od Pęcic, obok dworu",
        "area": "Pęcice",
        "tracks": "Do ustalenia",
        "side": "Obie strony",
        "certainty": "Potwierdzone (źródło wtórne)",
        "sources": [
          "Z06"
        ],
        "lat": 52.157173,
        "lng": 20.851779
      },
      {
        "id": "ww1-m29",
        "code": "M29",
        "title": "Mogiły w Utracie przy plancie (sosenki)",
        "category": "Cmentarz / mogiła",
        "type": "pamiec",
        "date": "X 1914",
        "sort": "1914-10-20",
        "desc": "Pierwsze świeże mogiły z krzyżami widziane po bitwie przy plancie kolejowym wśród karłowatych sosenek.",
        "where": "Utrata, przy torach",
        "area": "Utrata",
        "tracks": "Do ustalenia",
        "certainty": "Relacja świadka",
        "sources": [
          "Z01"
        ]
      },
      {
        "id": "ww1-m30",
        "code": "M30",
        "title": "Grób kanoniera landwery za okopami w Helenowie",
        "category": "Cmentarz / mogiła",
        "type": "pamiec",
        "date": "X 1914",
        "sort": "1914-10-19",
        "desc": "Na świeżej mogile za okopami krzyż z polskim napisem. Polak w armii niemieckiej.",
        "where": "Helenów",
        "area": "Helenów",
        "tracks": "Do ustalenia",
        "side": "Niemcy",
        "certainty": "Relacja świadka",
        "sources": [
          "Z01"
        ],
        "lat": 52.150532,
        "lng": 20.785705,
        "approx": "Punkt orientacyjny: za okopami w Helenowie."
      },
      {
        "id": "ww1-bitwa-1914",
        "ref": 202,
        "type": "bitwa",
        "sort": "1914-10-11",
        "from": "1914-10-11",
        "to": "1914-10-17"
      },
      {
        "id": "ww1-posterunek-przejazd",
        "ref": 82,
        "type": "obiekt",
        "sort": "1915-08"
      },
      {
        "id": "ww1-posterunek-papiernia",
        "ref": 83,
        "type": "obiekt",
        "sort": "1915-08"
      },
      {
        "id": "ww1-ochronka-kuklinskiego",
        "ref": 64,
        "type": "spoleczne",
        "sort": "1916"
      },
      {
        "id": "ww1-bursy-narodowa",
        "ref": 65,
        "type": "spoleczne",
        "sort": "1916"
      },
      {
        "id": "ww1-bursa-cicha",
        "ref": 169,
        "type": "spoleczne",
        "sort": "1916"
      },
      {
        "id": "ww1-pakownia-hoserow",
        "ref": 32,
        "type": "zniszczenie",
        "sort": "1917",
        "title": "Pakownia Hoserów — odbudowa po zniszczeniach wojennych"
      },
      {
        "id": "ww1-sierocin",
        "ref": 171,
        "type": "spoleczne",
        "sort": "1917"
      }
    ],
    "lines": [
      {
        "id": "ww1-pojedynek-ros",
        "label": "ogień rosyjski · 13–17 X",
        "from": "1914-10-13",
        "to": "1914-10-17",
        "type": "ostrzal",
        "side": "Rosjanie",
        "color": "#B3261E",
        "title": "Pojedynek artyleryjski: rosyjskie baterie przy szkółkach Hoserów → baterie niemieckie pod Helenowem",
        "date": "13–17 X 1914",
        "desc": "Część pocisków chybiała i padała na Pruszków, leżący między stanowiskami.",
        "sources": [
          "Z01",
          "Z25"
        ],
        "coords": [
          [
            52.190597,
            20.807311
          ],
          [
            52.150293,
            20.786964
          ]
        ]
      },
      {
        "id": "ww1-pojedynek-niem",
        "label": "ogień niemiecki · 13–17 X",
        "from": "1914-10-13",
        "to": "1914-10-17",
        "type": "ostrzal",
        "side": "Niemcy",
        "color": "#1F4E8C",
        "title": "Pojedynek artyleryjski: niemieckie baterie spod Helenowa → rosyjskie baterie przy szkółkach Hoserów",
        "date": "13–17 X 1914",
        "sources": [
          "Z01",
          "Z25"
        ],
        "coords": [
          [
            52.150771,
            20.784446
          ],
          [
            52.191075,
            20.804793
          ]
        ]
      },
      {
        "id": "ww1-rokitno",
        "label": "ogień na Rokitno · 17 X",
        "from": "1914-10-17",
        "to": "1914-10-17",
        "type": "ostrzal",
        "side": "Rosjanie",
        "color": "#B3261E",
        "title": "Rosyjskie baterie za kościołem żbikowskim → kościół w Rokitnie",
        "date": "17 X 1914",
        "desc": "Ogień korygowany przez obserwatorów z wieży kościoła (wg relacji J. Ryxa, 1924).",
        "sources": [
          "Z13",
          "Z12"
        ],
        "coords": [
          [
            52.180644,
            20.785821
          ],
          [
            52.184856,
            20.667204
          ]
        ]
      },
      {
        "id": "ww1-wejscie-niemcow",
        "label": "wejście Niemców · 11 X",
        "from": "1914-10-11",
        "to": "1914-10-11",
        "type": "atak",
        "side": "Niemcy",
        "color": "#1F4E8C",
        "title": "Wejście Niemców do Pruszkowa aleją lipową od Helenowa",
        "date": "11 X 1914, ok. 16:30",
        "desc": "Kierunek schematycznie: z Helenowa do stacji, gdzie zniszczono telegraf i telefon. Dokładny przebieg alei do ustalenia.",
        "sources": [
          "Z01"
        ],
        "coords": [
          [
            52.150532,
            20.785705
          ],
          [
            52.168222,
            20.798925
          ]
        ]
      },
      {
        "id": "ww1-ewakuacja-kosciol",
        "label": "ucieczka ludności · 17 X",
        "from": "1914-10-17",
        "to": "1914-10-17",
        "type": "transport",
        "side": "Ludność",
        "title": "Ucieczka z podziemi kościoła przez pola w kierunku Warszawy",
        "date": "17 X 1914",
        "desc": "Kierunek schematycznie: źródło podaje tylko „przez pola w kierunku Warszawy”.",
        "sources": [
          "Z13"
        ],
        "coords": [
          [
            52.180644,
            20.785821
          ],
          [
            52.1795,
            20.811
          ]
        ]
      },
      {
        "id": "ww1-linia-2-armii",
        "label": "linia 2 Armii ros. · 9 X 1914",
        "type": "front",
        "context": true,
        "title": "Linia Sochaczew–Błonie–Pruszków: tu Niemcy odrzucili rosyjską 2 Armię",
        "date": "9 X 1914",
        "desc": "Schemat przez centra miejscowości, nie przebieg okopów.",
        "sources": [
          "Z07"
        ],
        "coords": [
          [
            52.229656,
            20.237937
          ],
          [
            52.194606,
            20.616969
          ],
          [
            52.171959,
            20.802982
          ]
        ]
      }
    ],
    "chronicle": [
      {
        "sort": "1914-08-09",
        "date": "9 VIII 1914",
        "text": "W Pruszkowie powstaje 11-osobowy Komitet Obywatelski, pełniący rolę zarządu gminy. Działał do 31 I 1916.",
        "scale": "Lokalna",
        "sources": [
          "Z14"
        ]
      },
      {
        "sort": "1914-09-28",
        "date": "28 IX 1914",
        "text": "Niemiecka 9 Armia rozpoczyna natarcie w pasie Piotrków–Kielce.",
        "scale": "Front",
        "sources": [
          "Z07"
        ]
      },
      {
        "sort": "1914-10-06",
        "date": "6 X 1914",
        "text": "Niemcy osiągają linię starych fortów warszawskich.",
        "scale": "Front",
        "sources": [
          "Z07"
        ]
      },
      {
        "sort": "1914-10-08",
        "date": "8 X 1914",
        "text": "Grupa Mackensena na linii Góra Kalwaria–Grójec–Mszczonów–Skierniewice.",
        "scale": "Front",
        "sources": [
          "Z07"
        ]
      },
      {
        "sort": "1914-10-09",
        "date": "9 X 1914",
        "text": "Niemcy odrzucają rosyjską 2 Armię na linię Sochaczew–Błonie–Pruszków. W Pruszkowie słychać armaty, uchodźcy z Nadarzyna.",
        "scale": "Lokalna",
        "sources": [
          "Z07",
          "Z01"
        ]
      },
      {
        "sort": "1914-10-10",
        "date": "10 X 1914",
        "text": "Grupa Mackensena dociera do Piaseczna.",
        "scale": "Front",
        "sources": [
          "Z07"
        ]
      },
      {
        "sort": "1914-10-11",
        "date": "11 X 1914 (niedziela)",
        "text": "Pociąg podziurawiony kulami na stacji. Ok. 16:30 Niemcy wchodzą do Pruszkowa aleją lipową od Helenowa.",
        "scale": "Lokalna",
        "sources": [
          "Z01"
        ]
      },
      {
        "sort": "1914-10-12",
        "date": "12 X 1914 (poniedziałek)",
        "text": "Niemcy zajmują Helenów (sztab, lazaret, artyleria). Wikipedia: początek bitwy o Pruszków.",
        "scale": "Lokalna",
        "sources": [
          "Z01",
          "Z03"
        ]
      },
      {
        "sort": "1914-10-13",
        "date": "13 X 1914 (wtorek)",
        "text": "Około 11:00 zaczyna grać artyleria od strony Utraty. Początek kilkudniowego pojedynku baterii. Naczelne dowództwo rosyjskie wydaje dyrektywę kontrofensywy.",
        "scale": "Lokalna",
        "sources": [
          "Z01",
          "Z07"
        ]
      },
      {
        "sort": "1914-10-14",
        "date": "14 X 1914 (środa)",
        "text": "Najcięższy dzień wg lekarzy z Tworek. Niemieckie działa uciszone, ataki na bagnety wypierają Niemców. Punkt opatrunkowy w Tworkach ostrzeliwany.",
        "scale": "Lokalna",
        "sources": [
          "Z01"
        ]
      },
      {
        "sort": "1914-10-16",
        "date": "16 X 1914 (wieczór)",
        "text": "W Żbikowie cisza. Ciągną tabory i oddziały rosyjskie w stronę Warszawy. Dwa telefony komendy odcinka Pruszków–Ołtarzew w plebanii. Komendant ostrzega proboszcza o czterech niemieckich bateriach polowych.",
        "scale": "Lokalna",
        "sources": [
          "Z13"
        ]
      },
      {
        "sort": "1914-10-17",
        "date": "17 X 1914 (sobota, rano)",
        "text": "Według Ryxa: początek ostrzału. Rosyjskie baterie za kościołem żbikowskim ostrzeliwują Rokitno. Niemieckie pociski trafiają w kościół, wieżę i ścianę frontową. Mieszkańcy w podziemiach kościoła. Rosyjskie władze nakazują przymusową ewakuację ludności (Kurjer).",
        "scale": "Lokalna",
        "sources": [
          "Z13",
          "Z01"
        ]
      },
      {
        "sort": "1914-10-18",
        "date": "18 X 1914",
        "text": "Rusza rosyjska kontrofensywa gen. Ruzskiego. Po dwóch dniach Niemcy odstępują od Warszawy.",
        "scale": "Front",
        "sources": [
          "Z07"
        ]
      },
      {
        "sort": "1914-10-19",
        "date": "19 X 1914 (poniedziałek)",
        "text": "Niemcy opuszczają Helenów, właściciele wychodzą z piwnicy.",
        "scale": "Lokalna",
        "sources": [
          "Z01"
        ]
      },
      {
        "sort": "1914-10-22",
        "date": "22 X 1914",
        "text": "Mieszkańcy wracają do Pruszkowa. Niemcy cofają się na linię Łowicz–Rawa–Nowe Miasto.",
        "scale": "Lokalna",
        "sources": [
          "Z01",
          "Z07"
        ]
      },
      {
        "sort": "1914-10-28",
        "date": "27/28 X 1914",
        "text": "Niemcy opuszczają linię Pilicy i Rawki.",
        "scale": "Front",
        "sources": [
          "Z07"
        ]
      },
      {
        "sort": "1914-12-06",
        "date": "5/6 XII 1914",
        "text": "Rosjanie opuszczają Łódź i cofają się na linię Bzura–Rawka–Pilica. Front pozycyjny do lipca 1915.",
        "scale": "Front",
        "sources": [
          "Z07"
        ]
      },
      {
        "sort": "1914-12-23",
        "date": "23 XII 1914",
        "text": "Niemcy wypierają Rosjan z Sochaczewa, linia frontu ustala się nad dolną Bzurą i Rawką.",
        "scale": "Front",
        "sources": [
          "Z07"
        ]
      },
      {
        "sort": "1915-07-01",
        "date": "lato 1915",
        "text": "Rosjanie wysadzają część infrastruktury warsztatów kolejowych w Żbikowie. Przymusowa ewakuacja ok. 2 tys. osób (połowa mieszkańców Żbikowa). Szkoła Kolejowa wraz z uczniami ewakuowana do Połtawy.",
        "scale": "Lokalna",
        "sources": [
          "Z02",
          "Z19"
        ]
      },
      {
        "sort": "1915-07-17",
        "date": "16–17 VII 1915",
        "text": "Rosjanie opuszczają Bzurę i Rawkę. 2 Armia cofa się na linię Błonie–Grójec, wysadzając wsie, zakłady, drogi i tory.",
        "scale": "Front",
        "sources": [
          "Z07"
        ]
      },
      {
        "sort": "1915-08-03",
        "date": "2/3 VIII 1915",
        "text": "Zakończenie odwrotu rosyjskich wojsk z lewego brzegu Wisły przez Warszawę.",
        "scale": "Front",
        "sources": [
          "Z07"
        ]
      },
      {
        "sort": "1915-08-05",
        "date": "4/5 VIII 1915",
        "text": "Ostatni żołnierz rosyjski opuszcza Warszawę 5 VIII. Pruszków i Żbików pod okupacją niemiecką bez walki.",
        "scale": "Lokalna",
        "sources": [
          "Z07",
          "Z01",
          "Z03"
        ]
      },
      {
        "sort": "1915-09-01",
        "date": "od 1915 do 1922",
        "text": "Odbudowa kościoła żbikowskiego trwa do 1922.",
        "scale": "Lokalna",
        "sources": [
          "Z16"
        ]
      },
      {
        "sort": "1916-11-09",
        "date": "9 XI 1916 (Mrówczyńska) lub 10 XII 1916 (Wikipedia)",
        "text": "Prawa miejskie dla Pruszkowa, do miasta włączony Żbików, Tworki, Józefów i Józefina. Daty w źródłach się różnią.",
        "scale": "Lokalna",
        "sources": [
          "Z14",
          "Z02"
        ]
      },
      {
        "sort": "1917-10-15",
        "date": "15 X 1917",
        "text": "Obchody stulecia śmierci Kościuszki. Po nabożeństwie w kościele na Żbikowie pochód ul. Główną do ul. Narodowej, gdzie odsłonięto popiersie na kopcu.",
        "scale": "Lokalna",
        "sources": [
          "Z20"
        ]
      },
      {
        "sort": "1918-11-11",
        "date": "11 XI 1918",
        "text": "Konspiratorzy spod apteki Bielawskiego rozbrajają niemieckie posterunki.",
        "scale": "Lokalna",
        "sources": [
          "Z02",
          "Z21"
        ]
      },
      {
        "sort": "1920-06-01",
        "date": "1920",
        "text": "Zakończenie odbudowy warsztatów kolejowych i odbudowa fabryki ołówków.",
        "scale": "Lokalna",
        "sources": [
          "Z14"
        ]
      }
    ]
  },

  ww2: {
    "label": "II wojna światowa",
    "period": "1939–1945",
    "color": "#E0735F",
    "mapTitle": "Żbików pod okupacją · Dulag 121",
    "mapSubtitle": "1939–1945 · walki 1939, Zagłada, Powstanie, obóz przejściowy",
    "sidesKey": [
      {
        "label": "Polacy / AK",
        "color": "#B3261E"
      },
      {
        "label": "Niemcy",
        "color": "#1F4E8C"
      },
      {
        "label": "obie strony",
        "color": "#6B2E83"
      }
    ],
    "intro": "Na Żbikowie nie było długich walk. Najważniejsze są: obóz Dulag 121 w halach Warsztatów Kolejowych (1944–45) i pomoc wypędzonym, Zagłada Żydów, egzekucje i mogiły, walki września 1939 pod Helenowem i Brwinowem oraz Powstanie 1944 w okolicy.",
    "dataset": "Arkusz „zbikow_II_wojna_swiatowa_research_2.xlsx” (miejsca W01–W37, oś czasu, źródła S01–S28) oraz rekordy bazy głównej.",
    "phases": [
      {
        "label": "Wrzesień 1939",
        "from": "1939-09-01",
        "to": "1939-09-30"
      },
      {
        "label": "Okupacja 1939–1944",
        "from": "1939-10-01",
        "to": "1944-07-31"
      },
      {
        "label": "Powstanie · 1–5 VIII 1944",
        "from": "1944-08-01",
        "to": "1944-08-05"
      },
      {
        "label": "Dulag 121 · VIII 1944 – I 1945",
        "from": "1944-08-06",
        "to": "1945-01-17"
      },
      {
        "label": "Pamięć · po 1945",
        "from": "1945-01-18",
        "to": "2099-12-31"
      }
    ],
    "sources": {
      "S01": {
        "name": "Muzeum Dulag 121: Durchgangslager 121 (hasło encyklopedii)",
        "url": "http://dulag121.pl/encyklopediaa/durchgangslager-121/",
        "type": "Muzeum",
        "note": "Główne źródło o organizacji obozu, numeracji hal, liczbach. Szacunki więźniów 340–650 tys."
      },
      "S02": {
        "name": "Muzeum Dulag 121: Pomoc wypędzonym",
        "url": "http://dulag121.pl/encyklopediaa/pomoc-wypedzonym/",
        "type": "Muzeum",
        "note": "Kuchnia, ambulatoria, akcja „Peron”, szpitale, rola parafii i AK."
      },
      "S03": {
        "name": "Marian Skwara, „Żbików – rys historyczny” (2019)",
        "url": "http://dulag121.pl/pruskovianaa/skwara-zbikow-rys-historyczny/",
        "type": "Opracowanie historyka",
        "note": "Okupacja na Żbikowie: Żydzi, cegielnia Hosera, pomoc dla wypędzonych."
      },
      "S04": {
        "name": "Maria Zima-Marjańska, „Egzekucja na pruszkowskiej żwirowni” (Przystanek Historia IPN, 2021)",
        "url": "https://przystanekhistoria.pl/pa2/teksty/85258,Egzekucja-na-pruszkowskiej-zwirowni-odwet-za-Powstanie-Warszawskie.html",
        "type": "Artykuł IPN",
        "note": "Egzekucje 2 VIII 1944, VI Rejon „Helenów” AK. Autorka omawia rozbieżności liczb."
      },
      "S05": {
        "name": "Muzeum Dulag 121: Historia pruszkowskiego getta",
        "url": "http://dulag121.pl/pruskovianaa/historia-pruszkowskiego-getta/",
        "type": "Muzeum (wg Skwary)",
        "note": "Granice getta, liczby."
      },
      "S06": {
        "name": "Wirtualny Sztetl: Miejsce straceń w Pruszkowie – glinianki przy cegielni (ul. Lipowa)",
        "url": "https://sztetl.org.pl/pl/miejscowosci/p/597-pruszkow/116-miejsca-martyrologii/49743-miejsce-stracen-w-pruszkowie-glinianki-przy-cegielni-ul-lipowa",
        "type": "Fragment książki Skwary",
        "note": "Wymienia wyrobiska cegielni Hosera na Żbikowie."
      },
      "S07": {
        "name": "Wirtualny Sztetl: Getto w Pruszkowie",
        "url": "https://sztetl.org.pl/pl/miejscowosci/p/597-pruszkow/116-miejsca-martyrologii/49734-getto-w-pruszkowie",
        "type": "Fragment książki Skwary",
        "note": "Getto otwarte, 256 izb."
      },
      "S08": {
        "name": "Wikipedia: Bitwa pod Brwinowem (12 IX 1939)",
        "url": "https://pl.wikipedia.org/wiki/Bitwa_pod_Brwinowem",
        "type": "Encyklopedia (wtórne)",
        "note": "Czołgi 4 DPanc. skoncentrowane w Pruszkowie, próba zdobycia Helenowa."
      },
      "S09": {
        "name": "Muzeum Dulag 121: 12 WRZ (bitwa pod Brwinowem)",
        "url": "http://dulag121.pl/kartka/12-wrze/",
        "type": "Muzeum",
        "note": "Największa bitwa 1939 w okolicach Pruszkowa."
      },
      "S10": {
        "name": "Wikipedia EN: Parzniew",
        "url": "https://en.wikipedia.org/wiki/Parzniew",
        "type": "Encyklopedia (wtórne)",
        "note": "Ok. 100 polskich jeńców rozstrzelanych 12 IX 1939."
      },
      "S11": {
        "name": "Zofia Mrówczyńska, „Rys historyczny miasta Pruszkowa” (1996)",
        "url": "http://dulag121.pl/pruskovianaa/mrowczynska-rys-historyczny-pruszkowa/",
        "type": "Opracowanie",
        "note": "1939: nalot 1 IX, ewakuacja 6 IX; 17 I 1945."
      },
      "S12": {
        "name": "Bohaterowie1939.pl: Pruszków–Żbików, mogiła zbiorowa",
        "url": "https://www.bohaterowie1939.pl/_content.php?a=cementary&itemID=182",
        "type": "Serwis poświęcony mogiłom 1939",
        "note": "Adres w serwisie: ul. Domaniewska."
      },
      "S13": {
        "name": "Pruszków Online: Cmentarz żbikowski",
        "url": "https://pruszkow-online.pl/przewodnik/cmentarz-zbikowski",
        "type": "Serwis lokalny",
        "note": "Mogiła żołnierzy WP 1939 przy głównej bramie."
      },
      "S14": {
        "name": "Powiat Pruszkowski: Obchody Dnia Pamięci Więźniów Obozu Dulag 121",
        "url": "https://samorzad.gov.pl/web/powiat-pruszkowski/obchody-dnia-pamieci-wiezniow-obozu-dulag-121-i-niosacych-im-pomoc",
        "type": "Administracja",
        "note": "Tablice przy bramie Cmentarza Żbikowskiego i w Tworkach. Teren obozu dziś MLP Group."
      },
      "S15": {
        "name": "Rzeczpospolita (historia): Pamięci ofiar obozu Dulag w Pruszkowie",
        "url": "https://historia.rp.pl/historia/art18955801-pamieci-ofiar-obozu-dulag-w-pruszkowie",
        "type": "Prasa",
        "note": "Bezimienni więźniowie w zbiorowej mogile na Cmentarzu Żbikowskim."
      },
      "S16": {
        "name": "Miejsca pamięci – Pruszków (pruszkow.sabak.info.pl)",
        "url": "https://pruszkow.sabak.info.pl/index.php?adres=prusz-pamiec.htm",
        "type": "Serwis lokalny (niższa wiarygodność)",
        "note": "Pomniki: ul. Lipowa, Komorowska, Tworki."
      },
      "S17": {
        "name": "Wikipedia EN: Dulag 121 camp in Pruszków",
        "url": "https://en.wikipedia.org/wiki/Dulag_121_camp_in_Pruszk%C3%B3w",
        "type": "Encyklopedia (wtórne)",
        "note": "Powierzchnia 48 ha."
      },
      "S18": {
        "name": "Wikipedia EN: Pruszków",
        "url": "https://en.wikipedia.org/wiki/Pruszk%C3%B3w",
        "type": "Encyklopedia (wtórne)",
        "note": "Palmiry 14 XII 1939: 46 pruszkowian."
      },
      "S19": {
        "name": "Jacek Dobrosz, „Dzieje żbikowskiej parafii” (Regio-Media 2012)",
        "url": "http://regio-media.pl/2012/09/09/dzieje-zbikowskiej-parafii/",
        "type": "Publicystyka lokalna",
        "note": "Wieża kościoła: magazyn broni ZWZ/AK."
      },
      "S20": {
        "name": "Muzeum Dulag 121: Na wycieczkę 3 (Pęcice, Komorów); Wikipedia: Pomnik Mauzoleum w Pęcicach",
        "url": "http://dulag121.pl/trasy/na-wycieczke-3-pecice-chlebow-komorow/",
        "type": "Muzeum / encyklopedia",
        "note": "Bój pod Pęcicami 2 VIII 1944, cmentarz „Na zieleńcu” w Komorowie."
      },
      "S21": {
        "name": "Muzeum Dulag 121: Cegielnia braci Hoser",
        "url": "https://dulag121.pl/pruskovianaa/cegielnia-braci-hoser/",
        "type": "Muzeum",
        "note": "Zdjęcie lotnicze z 1944 z zabudowaniami cegielni."
      },
      "S22": {
        "name": "Archidiecezja Warszawska: Parafia NPNMP w Pruszkowie-Żbikowie",
        "url": "https://archwwa.pl/parafie/pruszkow-niepokalanego-poczecia-nmp/",
        "type": "Kuria",
        "note": "Wieża: magazyn broni ZWZ, potem AK."
      },
      "S23": {
        "name": "Przegląd Pruszkowski 2010 nr 181: „Bój brwinowski – 12 września 1939”",
        "url": "https://bazhum.muzhp.pl/media/texts/przeglad-pruszkowski/2010-numer-181/przeglad_pruszkowski-r2010-t-n181-s26-38.pdf",
        "type": "Artykuł (niezapoznany)",
        "note": "Nie otwierano, tylko wskazówka."
      },
      "S24": {
        "name": "Muzeum Dulag 121: Transporty z obozu Dulag 121",
        "url": "http://dulag121.pl/encyklopediaa/transporty-z-obozu-dulag-121/",
        "type": "Muzeum",
        "note": "Miejsce załadunku, liczby deportowanych (ok. 60 tys. do KL)."
      },
      "S25": {
        "name": "Muzeum Dulag 121: Transporty z Dulagu 121 do KL Stutthof",
        "url": "https://dulag121.pl/encyklopediaa/transporty-z-dulagu-121-do-kl-stuthoff/",
        "type": "Muzeum",
        "note": "Transporty 25 VIII, 31 VIII, 29 IX 1944; przerzucanie jedzenia przez mur."
      },
      "S26": {
        "name": "dzieje.pl: „Upiorne wyzwolenie” – 17 stycznia 1945",
        "url": "https://dzieje.pl/wiadomosci/upiorne-wyzwolenie-17-stycznia-1945-r-rozpoczela-sie-sowiecka-okupacja-warszawy",
        "type": "Portal historyczny",
        "note": "Operacja warszawska 14–17 I 1945: 47 i 61 Armia uderzają w kierunku Błonia."
      },
      "S27": {
        "name": "Portal „Wrona” (Andrzejew): Muzeum Dulag 121",
        "url": "https://www.portalwrona.com/single-post/muzeum-dulag-121",
        "type": "Portal regionalny (niższa wiarygodność)",
        "note": "Makieta obozu, pierwsza tablica pamiątkowa z 1947."
      },
      "S28": {
        "name": "Zdzisław Zaborski i in., „Trwaliśmy przy tobie, Warszawo. Historia konspiracji i walki VI rejonu »Helenów«” (Książnica Pruszkowska)",
        "url": "https://mbc.cyfrowemazowsze.pl/dlibra/publication/edition/65412/content",
        "type": "Publikacja zdigitalizowana (niezapoznana)",
        "note": "Nie otwierano. Kluczowe źródło o AK w Pruszkowie, Piastowie, Ursusie i Sękocinie."
      }
    },
    "events": [
      {
        "id": "ww2-w01",
        "code": "W01",
        "title": "Dulag 121: teren obozu w Warsztatach Kolejowych (OAW), ul. 3 Maja 8a",
        "category": "Obóz Dulag 121",
        "type": "oboz",
        "date": "6 VIII 1944 – 16/17 I 1945",
        "sort": "1944-08-06",
        "desc": "Obóz przejściowy dla ludności wypędzonej z Warszawy i okolic. Niemcy ewakuowali maszyny z hal pod koniec lipca 1944. Hale tylko ponumerowano i ogrodzono drutem. Przeszło przez obóz od 340 do 650 tys. osób. Kierownictwo od 11 VIII: płk Kurt Sieber (Wehrmacht). Gestapo i Arbeitsamt pozostały na terenie. W nocy 16/17 I 1945 Niemcy wycofali załogę.",
        "where": "dawne ZNTK przy ul. 3 Maja 8a (dziś m.in. MLP Group)",
        "area": "Żbików",
        "tracks": "Na torach",
        "side": "Niemcy",
        "certainty": "Potwierdzone (źródło wtórne)",
        "note": "Dulag pisze, że warsztaty leżą w dzielnicy Żbików przy linii kolei warszawsko-wiedeńskiej. Powierzchnia: 48 ha (S17), 50 ha, 53 ha (S01).",
        "sources": [
          "S01",
          "S14",
          "S17"
        ],
        "from": "1944-08-06",
        "to": "1945-01-17",
        "lat": 52.175621,
        "lng": 20.815648,
        "approx": "Punkt w środku terenu dawnych Warsztatów; obrys obozu zaznaczony na mapie.",
        "link": 179,
        "photosFrom": 179
      },
      {
        "id": "ww2-w02",
        "code": "W02",
        "title": "Dulag: hala nr 5 (największa), segregacja więźniów",
        "category": "Obóz Dulag 121",
        "type": "oboz",
        "date": "VIII–X 1944",
        "sort": "1944-08-07",
        "desc": "Wypędzeni kierowani zwykle do największej hali nr 5, gdzie czekali od kilku godzin do kilkunastu dni na segregację. Brutalną segregację prowadzili funkcjonariusze Arbeitsamtu i Gestapo z niemieckimi kolejarzami. Dzielono na zdolnych i niezdolnych do pracy (wiek ok. 14–60 lat, oceniany „na oko”).",
        "where": "hala nr 5 na terenie dawnych warsztatów",
        "area": "Żbików",
        "tracks": "Na torach",
        "side": "Niemcy",
        "certainty": "Potwierdzone (źródło wtórne)",
        "note": "Plan obozu z numerami hal jest na stronie Muzeum (graf. K. Urban): nieotwarty jako obraz.",
        "sources": [
          "S01"
        ],
        "from": "1944-08-06",
        "to": "1944-10-31",
        "lat": 52.175621,
        "lng": 20.815648,
        "approx": "Punkt orientacyjny: środek terenu obozu; położenie hali w obrębie obozu do ustalenia (plan obozu, graf. K. Urban)."
      },
      {
        "id": "ww2-w03",
        "code": "W03",
        "title": "Dulag: hala nr 1, niezdolni do pracy (transporty do GG)",
        "category": "Obóz Dulag 121",
        "type": "oboz",
        "date": "VIII–X 1944",
        "sort": "1944-08-10",
        "desc": "Najliczniejsza grupa: osoby starsze, chore, kobiety z małymi dziećmi. Czekały w hali od kilku do kilkunastu dni na transport w głąb Generalnego Gubernatorstwa.",
        "where": "hala nr 1",
        "area": "Żbików",
        "tracks": "Na torach",
        "side": "Niemcy",
        "certainty": "Potwierdzone (źródło wtórne)",
        "sources": [
          "S01"
        ],
        "from": "1944-08-06",
        "to": "1944-10-31",
        "lat": 52.175621,
        "lng": 20.815648,
        "approx": "Punkt orientacyjny: środek terenu obozu; położenie hali w obrębie obozu do ustalenia (plan obozu, graf. K. Urban)."
      },
      {
        "id": "ww2-w04",
        "code": "W04",
        "title": "Dulag: hale nr 3 i 4, zdolni do pracy (Rzesza); hala 3 też magazyn dóbr kultury",
        "category": "Obóz Dulag 121",
        "type": "oboz",
        "date": "VIII 1944 – I 1945",
        "sort": "1944-08-07",
        "desc": "Osoby zakwalifikowane do pracy w III Rzeszy umieszczano w halach 3 i 4. W hali 3 urządzono magazyn dóbr kultury uratowanych przez grupę Stanisława Lorentza w ramach „akcji pruszkowskiej”.",
        "where": "hale nr 3 i 4",
        "area": "Żbików",
        "tracks": "Na torach",
        "side": "Niemcy / Polacy",
        "certainty": "Potwierdzone (źródło wtórne)",
        "sources": [
          "S01"
        ],
        "from": "1944-08-06",
        "to": "1945-01-17",
        "lat": 52.175621,
        "lng": 20.815648,
        "approx": "Punkt orientacyjny: środek terenu obozu; położenie hali w obrębie obozu do ustalenia (plan obozu, graf. K. Urban)."
      },
      {
        "id": "ww2-w05",
        "code": "W05",
        "title": "Dulag: hala nr 6, podejrzani o udział w Powstaniu",
        "category": "Obóz Dulag 121",
        "type": "oboz",
        "date": "VIII–X 1944",
        "sort": "1944-08-07",
        "desc": "Hala dla osób podejrzewanych przez Gestapo o udział w Powstaniu, kierowanych do obozów koncentracyjnych. Z obozu do KL trafiło 60–70 tys. osób.",
        "where": "hala nr 6",
        "area": "Żbików",
        "tracks": "Na torach",
        "side": "Niemcy",
        "certainty": "Potwierdzone (źródło wtórne)",
        "sources": [
          "S01"
        ],
        "from": "1944-08-06",
        "to": "1944-10-31",
        "lat": 52.175621,
        "lng": 20.815648,
        "approx": "Punkt orientacyjny: środek terenu obozu; położenie hali w obrębie obozu do ustalenia (plan obozu, graf. K. Urban)."
      },
      {
        "id": "ww2-w06",
        "code": "W06",
        "title": "Dulag: hala nr 2 (komisja lekarska) i budynek 2B (szpital zakaźny)",
        "category": "Obóz Dulag 121",
        "type": "szpital",
        "date": "od 11 VIII 1944",
        "sort": "1944-08-11",
        "desc": "W hali w centrum obozu działała niemiecka komisja lekarska, decydująca o zwolnieniach i transportach. W sąsiednim budynku 2B prowizoryczny szpital zakaźny, w którym lekarzami byli jeńcy radzieccy. Polskie tłumaczki wpisywały zagrożonych na listy zwolnionych.",
        "where": "hala nr 2 i budynek 2B",
        "area": "Żbików",
        "tracks": "Na torach",
        "side": "Niemcy / Polacy",
        "certainty": "Potwierdzone (źródło wtórne)",
        "sources": [
          "S01",
          "S02"
        ],
        "from": "1944-08-11",
        "to": "1945-01-17",
        "lat": 52.175621,
        "lng": 20.815648,
        "approx": "Punkt orientacyjny: środek terenu obozu; położenie hali w obrębie obozu do ustalenia (plan obozu, graf. K. Urban)."
      },
      {
        "id": "ww2-w07",
        "code": "W07",
        "title": "Dulag: hale nr 7 i 8, jeńcy i szpital powstańców",
        "category": "Obóz Dulag 121",
        "type": "oboz",
        "date": "IX–X 1944",
        "sort": "1944-09-28",
        "desc": "Pod koniec września do izolowanej hali 7 trafił ok. 1200-osobowy oddział z Mokotowa, potem powstańcy z Żoliborza. Hala 8: szpital dla powstańców. Od drugiej połowy października w hali 7 więźniowie z łapanek pod Warszawą.",
        "where": "hale nr 7 i 8",
        "area": "Żbików",
        "tracks": "Na torach",
        "side": "Niemcy",
        "certainty": "Potwierdzone (źródło wtórne)",
        "sources": [
          "S01"
        ],
        "from": "1944-09-01",
        "to": "1944-10-31",
        "lat": 52.175621,
        "lng": 20.815648,
        "approx": "Punkt orientacyjny: środek terenu obozu; położenie hali w obrębie obozu do ustalenia (plan obozu, graf. K. Urban)."
      },
      {
        "id": "ww2-w08",
        "code": "W08",
        "title": "Dulag: hala nr 13, Arbeitskommando rabujące Warszawę",
        "category": "Obóz Dulag 121",
        "type": "oboz",
        "date": "XI 1944 – I 1945",
        "sort": "1944-11",
        "desc": "Oddział warszawiaków zmuszanych do rabowania wysiedlonej i burzonej Warszawy. Część łupów trafiała do obozu.",
        "where": "hala nr 13",
        "area": "Żbików",
        "tracks": "Na torach",
        "side": "Niemcy",
        "certainty": "Potwierdzone (źródło wtórne)",
        "sources": [
          "S01"
        ],
        "from": "1944-11-01",
        "to": "1945-01-17",
        "lat": 52.175621,
        "lng": 20.815648,
        "approx": "Punkt orientacyjny: środek terenu obozu; położenie hali w obrębie obozu do ustalenia (plan obozu, graf. K. Urban)."
      },
      {
        "id": "ww2-w09",
        "code": "W09",
        "title": "Dulag: „zielony wagon”, siedziba Gestapo (Heinrich Diehl)",
        "category": "Obóz Dulag 121",
        "type": "obiekt",
        "date": "VIII 1944 – I 1945",
        "sort": "1944-08-06",
        "desc": "Siedziba szefa obozowego Gestapo SS-Obersturmbannführera Heinricha Diehla. Gestapo nadzorowało segregację i kierunki transportów.",
        "where": "na terenie obozu, dokładne miejsce nieznane",
        "area": "Żbików",
        "tracks": "Na torach",
        "side": "Niemcy",
        "certainty": "Potwierdzone (źródło wtórne)",
        "sources": [
          "S01"
        ],
        "from": "1944-08-06",
        "to": "1945-01-17",
        "lat": 52.175621,
        "lng": 20.815648,
        "approx": "Punkt orientacyjny: teren obozu; dokładne miejsce nieznane."
      },
      {
        "id": "ww2-w10",
        "code": "W10",
        "title": "Dulag: kuchnia obozowa (Maria Bogucka)",
        "category": "Pomoc wypędzonym",
        "type": "pomoc",
        "date": "od 6 VIII 1944",
        "sort": "1944-08-06",
        "desc": "Polska kuchnia uruchomiona od pierwszych dni. W szczycie pracowało do 480 osób, wydawano do 35 tys. posiłków dziennie. Produkty z zapasów VI Rejonu „Helenów” AK, RGO i darów mieszkańców Pruszkowa, Pęcic, Reguł, Duchnic, Parzniewa, Moszny.",
        "where": "na terenie obozu, miejsce nieznane",
        "area": "Żbików",
        "tracks": "Na torach",
        "side": "Polacy",
        "certainty": "Potwierdzone (źródło wtórne)",
        "sources": [
          "S02"
        ],
        "from": "1944-08-06",
        "to": "1945-01-17",
        "lat": 52.175621,
        "lng": 20.815648,
        "approx": "Punkt orientacyjny: teren obozu; dokładne miejsce nieznane."
      },
      {
        "id": "ww2-w11",
        "code": "W11",
        "title": "Dulag: ambulatoria w halach (dr Kazimierz Szupryczyński „Bożymir”)",
        "category": "Pomoc wypędzonym",
        "type": "szpital",
        "date": "VIII–X 1944",
        "sort": "1944-08-06",
        "desc": "Sieć prowizorycznych ambulatoriów w halach, zorganizowana z inicjatywy naczelnego lekarza VI Rejonu „Helenów” AK. Ciężko chorych odsyłano do szpitali poza obozem.",
        "where": "hale obozu",
        "area": "Żbików",
        "tracks": "Na torach",
        "side": "Polacy",
        "certainty": "Potwierdzone (źródło wtórne)",
        "sources": [
          "S02"
        ],
        "from": "1944-08-06",
        "to": "1944-10-31",
        "lat": 52.175621,
        "lng": 20.815648,
        "approx": "Punkt orientacyjny: ambulatoria działały w halach obozu."
      },
      {
        "id": "ww2-w12",
        "code": "W12",
        "title": "Linia kolejowa i peron: akcja „Peron”, ucieczki z transportów",
        "category": "Pomoc wypędzonym",
        "type": "pomoc",
        "date": "VIII–X 1944",
        "sort": "1944-08-07",
        "desc": "Kolejarze i pracownicy EKD ułatwiali ucieczki z transportów i zwalniali bieg pociągów, aby uczestnicy akcji „Peron” mogli wrzucać żywność do wagonów jadących do obozu. Wypędzeni wyrzucali też z okienek karteczki z adresami, zbierane przez kolejarzy i harcerzy.",
        "where": "linia Warszawa–Pruszków przy obozie",
        "area": "Żbików",
        "tracks": "Na torach",
        "side": "Polacy",
        "certainty": "Potwierdzone (źródło wtórne)",
        "sources": [
          "S02"
        ],
        "from": "1944-08-06",
        "to": "1944-10-31",
        "lat": 52.1719,
        "lng": 20.816,
        "approx": "Punkt orientacyjny: linia kolejowa przy obozie."
      },
      {
        "id": "ww2-w13",
        "code": "W13",
        "title": "Pomnik „Tędy przeszła Warszawa” i napis na murze przy torach",
        "category": "Upamiętnienie",
        "type": "pamiec",
        "date": "po 1944",
        "sort": "1945",
        "desc": "Napis na pomniku i na murze, który mijają pociągi do Skierniewic. Przy pomniku odbywają się obchody Dnia Pamięci Więźniów Obozu Dulag 121.",
        "where": "ul. 3 Maja 8A, teren dawnego obozu",
        "area": "Żbików",
        "tracks": "Na torach",
        "certainty": "Potwierdzone (źródło wtórne)",
        "sources": [
          "S14",
          "S17"
        ],
        "from": "1945-01-18",
        "to": "2099-12-31",
        "at": "ul-3-maja-8",
        "link": 157
      },
      {
        "id": "ww2-w14",
        "code": "W14",
        "title": "Kościół NPNMP na Żbikowie: apel 6 VIII 1944 i magazyn broni w wieży",
        "category": "Pomoc wypędzonym",
        "type": "pomoc",
        "date": "1939–1945; 6 VIII 1944",
        "sort": "1944-08-06",
        "desc": "6 VIII 1944 wieczorem proboszcz ks. Franciszek Dyżewski ogłosił apel o zbiórkę żywności i naczyń dla obozu. W czasie okupacji w wieży kościoła mieścił się magazyn broni ZWZ, potem AK.",
        "where": "Żbików, ul. 3 Maja",
        "area": "Żbików",
        "tracks": "Północ",
        "side": "Polacy",
        "certainty": "Potwierdzone (źródło wtórne)",
        "sources": [
          "S02",
          "S22",
          "S19"
        ],
        "from": "1939-09-01",
        "to": "1945-01-17",
        "lat": 52.180644,
        "lng": 20.785821,
        "link": 7
      },
      {
        "id": "ww2-w15",
        "code": "W15",
        "title": "Domy mieszkańców Żbikowa: zbiórki, pomoc w ucieczkach, przechowywanie uciekinierów",
        "category": "Pomoc wypędzonym",
        "type": "pomoc",
        "date": "VIII 1944 – 1945",
        "sort": "1944-08",
        "desc": "Żbikowianie organizowali zbiórki żywności, ubrań i naczyń, pomagali w ucieczkach z obozu i przechowywali uciekinierów w okolicznych domach.",
        "where": "adresy nieznane",
        "area": "Żbików",
        "tracks": "Północ",
        "side": "Polacy",
        "certainty": "Potwierdzone (źródło wtórne)",
        "note": "Źródła prawie nigdy nie podają adresów. Ślad do zbadania w relacjach świadków.",
        "sources": [
          "S03",
          "S02"
        ],
        "from": "1944-08-01",
        "to": "1945-12-31"
      },
      {
        "id": "ww2-w16",
        "code": "W16",
        "title": "Kościół św. Kazimierza: delegatura PolKO (ks. Edward Tyszka)",
        "category": "Pomoc wypędzonym",
        "type": "pomoc",
        "date": "6 VIII 1944",
        "sort": "1944-08-06",
        "desc": "Proboszcz ks. Edward Tyszka był przewodniczącym pruszkowskiej delegatury Polskiego Komitetu Opiekuńczego (RGO) i też ogłosił apel o pomoc.",
        "where": "kościół św. Kazimierza",
        "area": "Pruszków",
        "tracks": "Do ustalenia",
        "side": "Polacy",
        "certainty": "Potwierdzone (źródło wtórne)",
        "sources": [
          "S02"
        ],
        "from": "1944-08-06",
        "to": "1944-08-06",
        "lat": 52.162348,
        "lng": 20.809598
      },
      {
        "id": "ww2-w17",
        "code": "W17",
        "title": "Szpital powiatowy przy ul. Pięknej",
        "category": "Szpital",
        "type": "szpital",
        "date": "VIII–X 1944",
        "sort": "1944-08-06",
        "desc": "Jeden z pruszkowskich szpitali, do których kierowano rannych i chorych z obozu.",
        "where": "ul. Piękna",
        "area": "Żbików / Pruszków",
        "tracks": "Południe",
        "side": "Polacy",
        "certainty": "Potwierdzone (źródło wtórne)",
        "note": "Ul. Piękna leżała po południowej stronie torów (Skwara).",
        "sources": [
          "S02",
          "S03"
        ],
        "from": "1944-08-06",
        "to": "1944-10-31",
        "lat": 52.171979,
        "lng": 20.812155,
        "approx": "Punkt orientacyjny: ul. Piękna; budynek szpitala do ustalenia."
      },
      {
        "id": "ww2-w18",
        "code": "W18",
        "title": "Szpital w Tworkach: II pawilon dla rannych z Dulagu; cmentarz szpitalny z tablicą",
        "category": "Szpital",
        "type": "szpital",
        "date": "VIII–X 1944",
        "sort": "1944-08-06",
        "desc": "W II pawilonie utworzono szpital dla rannych z obozu. Na cmentarzu szpitalnym (założonym w 1924) są mogiły ofiar Dulagu, tablica ku czci więźniów, powstańców i ofiar cywilnych.",
        "where": "Szpital w Tworkach, ul. Partyzantów 2/4",
        "area": "Tworki",
        "tracks": "Południe",
        "side": "Polacy",
        "certainty": "Potwierdzone (źródło wtórne)",
        "note": "Tworki leżą na południe od torów.",
        "sources": [
          "S02",
          "S14",
          "S16"
        ],
        "from": "1944-08-06",
        "to": "1944-10-31",
        "lat": 52.16868,
        "lng": 20.827208
      },
      {
        "id": "ww2-w19",
        "code": "W19",
        "title": "Wyrobiska cegielni Hosera na Żbikowie (dziś Park Mazowsze): egzekucje",
        "category": "Egzekucje",
        "type": "represje",
        "date": "1939–1944",
        "sort": "1940",
        "desc": "Sporadycznie rozstrzeliwano tu ludzi, według Skwary „wyłapywanych Żydów”. Największe miejsca straceń leżały jednak przy ul. Lipowej, Żwirowej i w Parku Potulickich.",
        "where": "Park Mazowsze, Glinki Hosera, ul. Mostowa",
        "area": "Żbików",
        "tracks": "Północ",
        "side": "Niemcy",
        "certainty": "Potwierdzone (źródło wtórne)",
        "note": "Skala egzekucji na Żbikowie nieznana. Łączna liczba ponad 900 rozstrzelanych w Pruszkowie dotyczy glinianek Hosera i Potulickich oraz parku (S04).",
        "sources": [
          "S06",
          "S03",
          "S21"
        ],
        "from": "1939-09-01",
        "to": "1944-12-31",
        "lat": 52.184054,
        "lng": 20.801618,
        "approx": "Punkt orientacyjny: Park Mazowsze (dawne wyrobiska cegielni Hosera)."
      },
      {
        "id": "ww2-w20",
        "code": "W20",
        "title": "Żbików: 8 domów żydowskich odebranych przez okupanta",
        "category": "Zagłada Żydów",
        "type": "zaglada",
        "date": "1939–1941",
        "sort": "1940",
        "desc": "Żbikowskim Żydom okupanci odebrali wszystkie nieruchomości (8 domów), a ich samych zamknięto w pruszkowskim getcie. Wojnę przeżyły tylko jednostki.",
        "where": "adresy nieznane",
        "area": "Żbików",
        "tracks": "Północ",
        "side": "Niemcy",
        "certainty": "Potwierdzone (źródło wtórne)",
        "note": "Adresy do ustalenia z książki Skwary „Pruszkowscy Żydzi” (2007).",
        "sources": [
          "S03"
        ],
        "from": "1939-09-01",
        "to": "1941-02-28"
      },
      {
        "id": "ww2-w21",
        "code": "W21",
        "title": "Getto w Pruszkowie: kwartał ulic Pęcicka (dziś AK), Komorowska, Ceramiczna, Polna",
        "category": "Zagłada Żydów",
        "type": "zaglada",
        "date": "ok. 15 XI 1940 – II 1941",
        "sort": "1940-11-15",
        "desc": "1331 osób w 29 domach (256 izb), getto otwarte, nadzorowane przez policjanta. Niemal wszystkich mieszkańców deportowano do warszawskiego getta.",
        "where": "kwartał ulic Armii Krajowej, Komorowska, Ceramiczna, Polna",
        "area": "Pruszków",
        "tracks": "Do ustalenia",
        "side": "Niemcy",
        "certainty": "Potwierdzone (źródło wtórne)",
        "note": "Pęcicka należała do południowej dzielnicy osady (Mrówczyńska), więc getto leżało prawdopodobnie po południowej stronie torów.",
        "sources": [
          "S05",
          "S07"
        ],
        "from": "1940-11-15",
        "to": "1941-02-28",
        "lat": 52.158,
        "lng": 20.8055,
        "approx": "Punkt orientacyjny: kwartał ulic Armii Krajowej (dawnej Pęcickiej), Komorowskiej, Ceramicznej i Polnej."
      },
      {
        "id": "ww2-w22",
        "code": "W22",
        "title": "Glinianki i żwirownia przy ul. Lipowej / Żwirowej: egzekucje (2 VIII 1944 i inne)",
        "category": "Egzekucje",
        "type": "represje",
        "date": "1939–1945; 2 VIII 1944",
        "sort": "1944-08-02",
        "desc": "2 VIII 1944 żandarmi rozstrzelali tu co najmniej 27–34 mężczyzn pojmanych w odwecie za Powstanie, w tym żołnierzy VI Rejonu „Helenów” AK. W latach 1939–45 przy Lipowej i żwirowni zamordowano ok. 800 Polaków, także Żydów z getta.",
        "where": "ul. Lipowa, Żwirowa, rogu Komorowskiej",
        "area": "Pruszków (Komorów)",
        "tracks": "Do ustalenia",
        "side": "Niemcy",
        "certainty": "Potwierdzone (źródło wtórne)",
        "note": "Liczby się różnią (patrz Do_sprawdzenia). Miejsce w południowej części miasta (S04).",
        "sources": [
          "S04",
          "S06",
          "S16"
        ],
        "from": "1939-09-01",
        "to": "1945-01-17",
        "lat": 52.1547,
        "lng": 20.8058,
        "approx": "Punkt orientacyjny: rejon ulic Żwirowej i Komorowskiej."
      },
      {
        "id": "ww2-w23",
        "code": "W23",
        "title": "Posterunek żandarmerii przy ul. Kraszewskiego 16: egzekucje na zapleczu",
        "category": "Egzekucje",
        "type": "represje",
        "date": "1939–1945",
        "sort": "1940",
        "desc": "Wiele egzekucji dokonano na zapleczu siedziby żandarmerii.",
        "where": "ul. Kraszewskiego 16",
        "area": "Pruszków",
        "tracks": "Do ustalenia",
        "side": "Niemcy",
        "certainty": "Potwierdzone (źródło wtórne)",
        "sources": [
          "S06",
          "S04"
        ],
        "from": "1939-09-01",
        "to": "1945-01-17",
        "lat": 52.162495,
        "lng": 20.81258,
        "approx": "Punkt orientacyjny: dzisiejszy budynek przy ul. Kraszewskiego 14/16."
      },
      {
        "id": "ww2-w24",
        "code": "W24",
        "title": "Park Potulickich: egzekucje",
        "category": "Egzekucje",
        "type": "represje",
        "date": "1944",
        "sort": "1944",
        "desc": "Sporadycznie rozstrzeliwano tu ludzi.",
        "where": "Park Potulickich",
        "area": "Pruszków",
        "tracks": "Do ustalenia",
        "side": "Niemcy",
        "certainty": "Potwierdzone (źródło wtórne)",
        "sources": [
          "S06",
          "S04"
        ],
        "from": "1944-01-01",
        "to": "1944-12-31",
        "lat": 52.166221,
        "lng": 20.813737
      },
      {
        "id": "ww2-w25",
        "code": "W25",
        "title": "Cmentarz żbikowski: mogiła zbiorowa żołnierzy WP poległych we wrześniu 1939",
        "category": "Cmentarz / mogiła",
        "type": "pamiec",
        "date": "IX 1939",
        "sort": "1939-09",
        "desc": "Zbiorowa mogiła wojenna przy głównej bramie cmentarza parafii NPNMP.",
        "where": "cmentarz żbikowski, główna brama",
        "area": "Żbików",
        "tracks": "Północ",
        "side": "Polacy",
        "certainty": "Potwierdzone (źródło wtórne)",
        "note": "Adres w serwisie Bohaterowie1939: ul. Domaniewska.",
        "sources": [
          "S12",
          "S13"
        ],
        "from": "1939-09-01",
        "to": "1939-09-30",
        "at": "ul-domaniewska-cmentarz-zbikowski",
        "link": 214
      },
      {
        "id": "ww2-w26",
        "code": "W26",
        "title": "Cmentarz żbikowski: zbiorowe mogiły więźniów Dulagu, tablica przy głównej bramie",
        "category": "Cmentarz / mogiła",
        "type": "pamiec",
        "date": "VIII 1944 – I 1945",
        "sort": "1944-08",
        "desc": "Bezimienni zmarli i zamordowani więźniowie obozu pochowani w zbiorowych mogiłach. Przy głównej bramie tablica, pod którą składa się kwiaty.",
        "where": "cmentarz żbikowski, główna brama",
        "area": "Żbików",
        "tracks": "Północ",
        "side": "Niemcy (ofiary)",
        "certainty": "Potwierdzone (źródło wtórne)",
        "sources": [
          "S15",
          "S14"
        ],
        "from": "1944-08-06",
        "to": "1945-01-31",
        "at": "ul-domaniewska-cmentarz-zbikowski"
      },
      {
        "id": "ww2-w27",
        "code": "W27",
        "title": "Komorów: cmentarz „Na zieleńcu” (róg ul. Kolejowej i Krótkiej)",
        "category": "Cmentarz / mogiła",
        "type": "pamiec",
        "date": "IX–X 1944",
        "sort": "1944-10-09",
        "desc": "Prowizoryczny cmentarz zmarłych ze szpitala RGO: warszawiacy zwolnieni z obozu jako niezdolni do pracy. Pochowano tu m.in. Aleksandra Janowskiego (zm. 9 X 1944, później ekshumowany na Powązki). Po wojnie ekshumowano 34 osoby.",
        "where": "róg ul. Kolejowej i Krótkiej, Komorów",
        "area": "Komorów",
        "tracks": "Do ustalenia",
        "side": "Niemcy (ofiary)",
        "certainty": "Potwierdzone (źródło wtórne)",
        "note": "Poza obszarem Żbikowa.",
        "sources": [
          "S20"
        ],
        "from": "1944-09-01",
        "to": "1944-10-31",
        "lat": 52.1484,
        "lng": 20.81,
        "approx": "Punkt orientacyjny: róg ul. Kolejowej i Krótkiej w Komorowie."
      },
      {
        "id": "ww2-w28",
        "code": "W28",
        "title": "Pęcice: bój 2 VIII 1944 (AK Ochota) i pomnik-mauzoleum",
        "category": "Powstanie 1944",
        "type": "powstanie",
        "date": "2 VIII 1944",
        "sort": "1944-08-02",
        "desc": "Oddziały AK IV obwodu wycofujące się z Ochoty natknęły się na Niemców na drodze z Reguł do Pęcic. Według Dulagu poległo 31 powstańców, 67 wzięto do niewoli, 60 rozstrzelano w pęcickiej cegielni. Po ekshumacji w 1946 złożono ich w mauzoleum w parku dworskim.",
        "where": "Pęcice, park dworski, pomnik-mauzoleum",
        "area": "Pęcice",
        "tracks": "Do ustalenia",
        "side": "Niemcy / AK",
        "certainty": "Potwierdzone (źródło wtórne)",
        "note": "Wikipedia: mauzoleum 88 poległych. Liczby do zweryfikowania.",
        "sources": [
          "S20"
        ],
        "from": "1944-08-02",
        "to": "1944-08-02",
        "lat": 52.156153,
        "lng": 20.84784
      },
      {
        "id": "ww2-w29",
        "code": "W29",
        "title": "Lasy Sękocińskie: VI Rejon „Helenów” AK po nieudanej mobilizacji",
        "category": "Powstanie 1944",
        "type": "powstanie",
        "date": "1–3 VIII 1944",
        "sort": "1944-08-01",
        "desc": "1 VIII żołnierze VI Rejonu podjęli akcje, część ostrzelano w drodze na zbiórkę. Żołnierze ruszyli do Lasów Sękocińskich w oczekiwaniu na zrzuty. 3 VIII komendant „Paweł” nakazał powrót do konspiracji z powodu represji.",
        "where": "Lasy Sękocińskie",
        "area": "Sękocin",
        "tracks": "Do ustalenia",
        "side": "AK",
        "certainty": "Potwierdzone (źródło wtórne)",
        "sources": [
          "S04"
        ],
        "from": "1944-08-01",
        "to": "1944-08-03",
        "lat": 52.101223,
        "lng": 20.891504,
        "approx": "Punkt orientacyjny: Sękocin-Las (Lasy Sękocińskie)."
      },
      {
        "id": "ww2-w30",
        "code": "W30",
        "title": "Helenów: atak I batalionu 36 pp załamany 12 IX 1939",
        "category": "Walki 1939",
        "type": "bitwa",
        "date": "12 IX 1939",
        "sort": "1939-09-12",
        "desc": "Około południa I batalion 36 pp (Legia Akademicka) uderzył na Helenów, atak załamał się w ogniu moździerzy i broni maszynowej. Ok. 13:00 od strony Helenowa uderzyły czołgi 4 Dywizji Pancernej.",
        "where": "Helenów",
        "area": "Helenów",
        "tracks": "Do ustalenia",
        "side": "Polacy / Niemcy",
        "certainty": "Potwierdzone (źródło wtórne)",
        "note": "Ten sam Helenów był w 1914 niemiecką bazą artylerii.",
        "sources": [
          "S08",
          "S09"
        ],
        "from": "1939-09-12",
        "to": "1939-09-12",
        "lat": 52.150532,
        "lng": 20.785705,
        "approx": "Punkt orientacyjny: Helenów (pałac Potockich)."
      },
      {
        "id": "ww2-w31",
        "code": "W31",
        "title": "Pruszków: koncentracja czołgów 4 Dywizji Pancernej 12 IX 1939",
        "category": "Walki 1939",
        "type": "bitwa",
        "date": "12 IX 1939",
        "sort": "1939-09-12",
        "desc": "Niemcy skoncentrowali w Pruszkowie oddział czołgów przeciw polskiemu zgrupowaniu pod Brwinowem.",
        "where": "Pruszków, miejsce nieznane",
        "area": "Pruszków",
        "tracks": "Do ustalenia",
        "side": "Niemcy",
        "certainty": "Potwierdzone (źródło wtórne)",
        "note": "Brak lokalizacji. Kalendaria piszą o walce „o Brwinów oraz Pruszków”.",
        "sources": [
          "S08",
          "S09"
        ],
        "from": "1939-09-12",
        "to": "1939-09-12"
      },
      {
        "id": "ww2-w32",
        "code": "W32",
        "title": "Parzniew: rozstrzelanie ok. 100 polskich jeńców 12 IX 1939",
        "category": "Egzekucje",
        "type": "represje",
        "date": "12 IX 1939",
        "sort": "1939-09-12",
        "desc": "Wehrmacht rozstrzelał ok. 100 jeńców. Pomnik ofiar.",
        "where": "Parzniew (gm. Brwinów)",
        "area": "Parzniew",
        "tracks": "Do ustalenia",
        "side": "Niemcy",
        "certainty": "Potwierdzone (źródło wtórne)",
        "note": "Poza obszarem. Tylko Wikipedia EN, do potwierdzenia w polskiej literaturze.",
        "sources": [
          "S10"
        ],
        "from": "1939-09-12",
        "to": "1939-09-12",
        "lat": 52.152222,
        "lng": 20.762777,
        "approx": "Punkt orientacyjny: wieś Parzniew; miejsce egzekucji i pomnik do ustalenia."
      },
      {
        "id": "ww2-w33",
        "code": "W33",
        "title": "Domy przy torach uszkodzone w nalocie 1 IX 1939",
        "category": "Nalot i zniszczenia",
        "type": "zniszczenie",
        "date": "1 IX 1939",
        "sort": "1939-09-01",
        "desc": "Podczas nalotu uszkodzono trzy domy w pobliżu torów kolejowych. Pruszków nie poniósł dużych strat materialnych w 1939.",
        "where": "w pobliżu torów, dokładnie nieznane",
        "area": "Pruszków",
        "tracks": "Na torach",
        "side": "Niemcy",
        "certainty": "Potwierdzone (źródło wtórne)",
        "sources": [
          "S11"
        ],
        "from": "1939-09-01",
        "to": "1939-09-01"
      },
      {
        "id": "ww2-w34",
        "code": "W34",
        "title": "Filie Dulagu: Ursus (PZInż), Piastów (Tudor), Włochy (Era), Grodzisk",
        "category": "Obóz Dulag 121",
        "type": "oboz",
        "date": "od początku X 1944",
        "sort": "1944-10",
        "desc": "Gdy obóz w Pruszkowie nie mógł przyjąć wszystkich, uruchomiono filie w Ursusie i Piastowie. Wypędzeni trafiali też do obozów w Grodzisku i we Włochach.",
        "where": "Ursus, Piastów, Włochy, Grodzisk Maz.",
        "area": "poza obszarem",
        "tracks": "Do ustalenia",
        "side": "Niemcy",
        "certainty": "Potwierdzone (źródło wtórne)",
        "sources": [
          "S01"
        ],
        "from": "1944-10-01",
        "to": "1945-01-17"
      },
      {
        "id": "ww2-w35",
        "code": "W35",
        "title": "Dulag: tory wzdłuż wewnętrznej strony południowo-wschodniego muru, załadunek transportów",
        "category": "Obóz Dulag 121",
        "type": "oboz",
        "date": "VIII 1944 – I 1945",
        "sort": "1944-08-10",
        "desc": "Składy pociągów towarowych podstawiano na tory biegnące po wewnętrznej stronie południowo-wschodniego muru obozu. Stąd ruszały transporty do GG, Rzeszy i obozów koncentracyjnych (do KL ok. 60 tys. osób, w tym Auschwitz ok. 13,5 tys., Stutthof ok. 4,5 tys.).",
        "where": "południowo-wschodni mur obozu, przy torach",
        "area": "Żbików",
        "tracks": "Na torach",
        "side": "Niemcy",
        "certainty": "Potwierdzone (źródło wtórne)",
        "sources": [
          "S24",
          "S25"
        ],
        "from": "1944-08-06",
        "to": "1945-01-17",
        "lat": 52.176799,
        "lng": 20.824417,
        "approx": "Punkt orientacyjny: południowo-wschodnia część terenu obozu; odcinek muru i torów do ustalenia."
      },
      {
        "id": "ww2-w36",
        "code": "W36",
        "title": "Dulag: mur obozu, miejsce przerzucania jedzenia i kontaktu z więźniami",
        "category": "Pomoc wypędzonym",
        "type": "pomoc",
        "date": "VIII–X 1944",
        "sort": "1944-08-07",
        "desc": "Pod murem panowało największe ożywienie: przerzucano przez niego do obozu małe opakowania z jedzeniem, a mieszkańcy nawiązywali kontakt z więźniami i przekazywali wiadomości rodzinom.",
        "where": "mur obozu, ul. 3 Maja i okolice",
        "area": "Żbików",
        "tracks": "Na torach",
        "side": "Polacy",
        "certainty": "Potwierdzone (źródło wtórne)",
        "note": "Odcinek muru nieznany.",
        "sources": [
          "S25",
          "S02"
        ],
        "from": "1944-08-06",
        "to": "1944-10-31",
        "lat": 52.1730618,
        "lng": 20.8075932,
        "approx": "Punkt orientacyjny: mur obozu od strony ul. 3 Maja; odcinek muru nieznany."
      },
      {
        "id": "ww2-w37",
        "code": "W37",
        "title": "Muzeum Dulag 121: makieta obozu i ściana pamięci",
        "category": "Upamiętnienie",
        "type": "pamiec",
        "date": "po 1947",
        "sort": "1947",
        "desc": "Wygląd obozu pokazuje makieta wykonana na podstawie archiwalnych fotografii i relacji. Ściana pamięci wymienia miejsca, dokąd kierowano transporty. Pierwszą tablicę pamiątkową odsłonięto już w 1947.",
        "where": "ul. 3 Maja 8A",
        "area": "Żbików",
        "tracks": "Na torach",
        "certainty": "Potwierdzone (źródło wtórne)",
        "note": "Gdzie wisiała tablica z 1947, nie wiadomo.",
        "sources": [
          "S27",
          "S17"
        ],
        "from": "1947-01-01",
        "to": "2099-12-31",
        "at": "oboz-przejsciowy-dulag-121",
        "link": 179
      },
      {
        "id": "ww2-mogila-nieznanego-1939",
        "ref": 215,
        "type": "pamiec",
        "sort": "1939-09",
        "from": "1939-09-01",
        "to": "1939-09-30"
      },
      {
        "id": "ww2-oboz-jeniecki-1939",
        "ref": 177,
        "type": "oboz",
        "sort": "1939-10",
        "from": "1939-10-01",
        "to": "1939-12-31"
      },
      {
        "id": "ww2-ostbahn",
        "ref": 72,
        "type": "obiekt",
        "sort": "1939-11",
        "from": "1939-10-01",
        "to": "1945-01-17"
      },
      {
        "id": "ww2-wiezyczki",
        "ref": 22,
        "type": "obiekt",
        "sort": "1940",
        "from": "1939-10-01",
        "to": "1945-01-17"
      },
      {
        "id": "ww2-oboz-pracy-1941",
        "ref": 178,
        "type": "oboz",
        "sort": "1941-01-20",
        "from": "1941-01-20"
      },
      {
        "id": "ww2-majatek-zbikow",
        "ref": 208,
        "type": "konspiracja",
        "sort": "1942",
        "from": "1942-01-01",
        "to": "1944-05-09"
      },
      {
        "id": "ww2-egzekucje-kowalskiego",
        "ref": 218,
        "type": "represje",
        "sort": "1942",
        "from": "1942-01-01",
        "to": "1944-12-31"
      },
      {
        "id": "ww2-sklep-jansowej",
        "ref": 209,
        "type": "konspiracja",
        "sort": "1943",
        "from": "1943-01-01",
        "to": "1944-12-31"
      },
      {
        "id": "ww2-bunkry-promyka",
        "ref": 194,
        "type": "konspiracja",
        "sort": "1943-05",
        "from": "1943-05-01",
        "to": "1944-06-03"
      },
      {
        "id": "ww2-pilnikowa-1944",
        "ref": 213,
        "type": "bitwa",
        "sort": "1944-02-08",
        "from": "1944-02-08",
        "to": "1944-02-08",
        "side": "Niemcy / AL"
      },
      {
        "id": "ww2-magazyn-cegielnia",
        "ref": 210,
        "type": "konspiracja",
        "sort": "1944-06",
        "from": "1944-01-01",
        "to": "1944-06-30"
      },
      {
        "id": "ww2-pole-bandurskiej",
        "ref": 212,
        "type": "konspiracja",
        "sort": "1944-07-29",
        "from": "1944-07-29",
        "to": "1944-08-02"
      },
      {
        "id": "ww2-brama-zntk",
        "ref": 153,
        "type": "obiekt",
        "sort": "1944-08",
        "from": "1944-08-06",
        "to": "1945-01-17"
      },
      {
        "id": "ww2-bunkier-zntk",
        "ref": 154,
        "type": "obiekt",
        "sort": "1944-08",
        "from": "1944-08-06",
        "to": "1945-01-17"
      },
      {
        "id": "ww2-wieza-1",
        "ref": 156,
        "type": "obiekt",
        "sort": "1944-08",
        "from": "1944-08-06",
        "to": "1945-01-17"
      },
      {
        "id": "ww2-wieza-3",
        "ref": 158,
        "type": "obiekt",
        "sort": "1944-08",
        "from": "1944-08-06",
        "to": "1945-01-17"
      },
      {
        "id": "ww2-ogrod-plebanii",
        "ref": 211,
        "type": "konspiracja",
        "sort": "1944-09",
        "from": "1944-09-01",
        "to": "1944-09-30"
      }
    ],
    "lines": [
      {
        "id": "ww2-atak-helenow",
        "type": "atak",
        "side": "Polacy",
        "color": "#B3261E",
        "label": "atak I/36 pp na Helenów · 12 IX",
        "title": "Atak I batalionu 36 pp Legii Akademickiej na Helenów",
        "date": "12 IX 1939, ok. południa",
        "desc": "Atak załamał się w ogniu moździerzy i broni maszynowej. Kierunek schematycznie: od zgrupowania pod Brwinowem.",
        "sources": [
          "S08",
          "S09"
        ],
        "from": "1939-09-12",
        "to": "1939-09-12",
        "coords": [
          [
            52.144762,
            20.716389
          ],
          [
            52.152739,
            20.785024
          ]
        ]
      },
      {
        "id": "ww2-czolgi",
        "type": "atak",
        "side": "Niemcy",
        "color": "#1F4E8C",
        "label": "czołgi 4 DPanc. · 12 IX 13:00",
        "title": "Uderzenie czołgów 4 Dywizji Pancernej od strony Helenowa",
        "date": "12 IX 1939, ok. 13:00",
        "desc": "Czołgi skoncentrowane w Pruszkowie uderzyły od strony Helenowa na polskie zgrupowanie pod Brwinowem. Kierunek schematycznie.",
        "sources": [
          "S08",
          "S09"
        ],
        "from": "1939-09-12",
        "to": "1939-09-12",
        "coords": [
          [
            52.148325,
            20.786386
          ],
          [
            52.140348,
            20.717751
          ]
        ]
      },
      {
        "id": "ww2-ak-ochota",
        "type": "atak",
        "side": "AK",
        "color": "#B3261E",
        "label": "AK Ochota · 2 VIII 1944",
        "title": "Oddziały AK IV obwodu wycofujące się z Ochoty: bój na drodze z Reguł do Pęcic",
        "date": "2 VIII 1944",
        "desc": "Według Muzeum Dulag 121: 31 poległych, 67 wziętych do niewoli, 60 rozstrzelanych w pęcickiej cegielni.",
        "sources": [
          "S20"
        ],
        "from": "1944-08-02",
        "to": "1944-08-02",
        "coords": [
          [
            52.176533,
            20.865237
          ],
          [
            52.156153,
            20.84784
          ]
        ]
      },
      {
        "id": "ww2-vi-rejon",
        "type": "transport",
        "side": "AK",
        "color": "#B3261E",
        "label": "VI Rejon AK do Lasów Sękocińskich · 1–3 VIII",
        "title": "Żołnierze VI Rejonu „Helenów” AK ruszają do Lasów Sękocińskich",
        "date": "1–3 VIII 1944",
        "desc": "W oczekiwaniu na zrzuty; 3 VIII komendant „Paweł” nakazał powrót do konspiracji. Kierunek schematycznie.",
        "sources": [
          "S04"
        ],
        "from": "1944-08-01",
        "to": "1944-08-03",
        "context": true,
        "coords": [
          [
            52.171959,
            20.802982
          ],
          [
            52.101223,
            20.891504
          ]
        ]
      },
      {
        "id": "ww2-wypedzeni-wola",
        "type": "transport",
        "side": "Ludność",
        "label": "wypędzeni z Woli · od 7 VIII 1944",
        "title": "Wypędzeni z Warszawy do Dulagu 121: pierwsza piesza grupa z Woli",
        "date": "7 VIII 1944",
        "desc": "Pieszo dotarła pierwsza grupa ok. 3 tys. kobiet i dzieci ocalałych z Rzezi Woli. Kierunek schematycznie.",
        "sources": [
          "S01"
        ],
        "from": "1944-08-07",
        "to": "1944-10-31",
        "context": true,
        "coords": [
          [
            52.236237,
            20.954781
          ],
          [
            52.175621,
            20.815648
          ]
        ]
      },
      {
        "id": "ww2-transporty",
        "type": "deportacja",
        "side": "Niemcy",
        "label": "transporty z obozu · VIII 1944 – I 1945",
        "title": "Transporty z Dulagu 121: do GG, na roboty do Rzeszy i do obozów koncentracyjnych",
        "date": "VIII 1944 – I 1945",
        "desc": "Pierwsze trzy transporty niezdolnych do pracy do powiatu łowickiego (10, 12, 13 VIII). Do KL ok. 60 tys. osób (Auschwitz ok. 13,5 tys., Stutthof ok. 4,5 tys.). Strzałka schematycznie na zachód wzdłuż linii kolejowej.",
        "sources": [
          "S24",
          "S25"
        ],
        "from": "1944-08-10",
        "to": "1945-01-17",
        "context": true,
        "coords": [
          [
            52.176799,
            20.824417
          ],
          [
            52.106622,
            20.631344
          ]
        ]
      }
    ],
    "areas": [
      {
        "id": "ww2-teren-dulag",
        "title": "Teren obozu Dulag 121 (dawne Warsztaty Kolejowe)",
        "label": "teren obozu Dulag 121",
        "desc": "Obrys dzisiejszego terenu MLP Pruszków I (ok. 42 ha) według OpenStreetMap. Obóz zajmował 48–53 ha — granice orientacyjne.",
        "color": "#4A1F1F",
        "sources": [
          "S01",
          "S17"
        ],
        "from": "1944-08-06",
        "to": "1945-01-17",
        "coords": [
          [
            52.172986,
            20.807588
          ],
          [
            52.17282,
            20.807897
          ],
          [
            52.173141,
            20.808405
          ],
          [
            52.17267,
            20.808758
          ],
          [
            52.172388,
            20.808358
          ],
          [
            52.172036,
            20.809046
          ],
          [
            52.172124,
            20.80923
          ],
          [
            52.172097,
            20.809339
          ],
          [
            52.171953,
            20.809466
          ],
          [
            52.172781,
            20.811948
          ],
          [
            52.172722,
            20.811998
          ],
          [
            52.176799,
            20.824417
          ],
          [
            52.176949,
            20.824336
          ],
          [
            52.176844,
            20.823046
          ],
          [
            52.177594,
            20.822898
          ],
          [
            52.178,
            20.824233
          ],
          [
            52.178018,
            20.824703
          ],
          [
            52.177956,
            20.825267
          ],
          [
            52.178005,
            20.825232
          ],
          [
            52.178035,
            20.824972
          ],
          [
            52.178108,
            20.824964
          ],
          [
            52.17846,
            20.822232
          ],
          [
            52.178444,
            20.822043
          ],
          [
            52.178658,
            20.820732
          ],
          [
            52.178527,
            20.820348
          ],
          [
            52.178585,
            20.8194
          ],
          [
            52.178489,
            20.81939
          ],
          [
            52.178049,
            20.81753
          ],
          [
            52.17864,
            20.816958
          ],
          [
            52.175893,
            20.808602
          ],
          [
            52.175406,
            20.80909
          ],
          [
            52.175304,
            20.809065
          ],
          [
            52.173909,
            20.808175
          ],
          [
            52.17363,
            20.807886
          ],
          [
            52.173344,
            20.808173
          ],
          [
            52.172986,
            20.807588
          ]
        ]
      }
    ],
    "chronicle": [
      {
        "sort": "1939-09-01",
        "date": "1 IX 1939",
        "text": "Nalot uszkadza trzy domy przy torach w Pruszkowie.",
        "scale": "Lokalna",
        "sources": [
          "S11"
        ]
      },
      {
        "sort": "1939-09-06",
        "date": "6 IX 1939",
        "text": "Z Pruszkowa ewakuowano urzędy, pocztę i policję.",
        "scale": "Lokalna",
        "sources": [
          "S11"
        ]
      },
      {
        "sort": "1939-09-08",
        "date": "8 IX 1939",
        "text": "Niemcy docierają do Warszawy.",
        "scale": "Kontekst",
        "sources": [
          "S09"
        ]
      },
      {
        "sort": "1939-09-12",
        "date": "12 IX 1939",
        "text": "Bitwa pod Brwinowem (28 DP, 36 pp Legii Akademickiej). Czołgi 4 DPanc. skoncentrowane w Pruszkowie uderzają od strony Helenowa. W Parzniewie Niemcy rozstrzeliwują ok. 100 polskich jeńców.",
        "scale": "Lokalna",
        "sources": [
          "S08",
          "S09",
          "S10"
        ]
      },
      {
        "sort": "1939-09-13",
        "date": "13 IX 1939",
        "text": "Niemcy wkraczają do Brwinowa.",
        "scale": "Kontekst",
        "sources": [
          "S08"
        ]
      },
      {
        "sort": "1939-12-14",
        "date": "14 XII 1939",
        "text": "Palmiry: Niemcy rozstrzeliwują 46 mieszkańców Pruszkowa.",
        "scale": "Lokalna",
        "sources": [
          "S18"
        ]
      },
      {
        "sort": "1940-11-15",
        "date": "ok. 15 XI 1940",
        "text": "Utworzenie getta w Pruszkowie w kwartale ulic Pęcickiej, Komorowskiej, Ceramicznej i Polnej. 1331 osób w 29 domach. Żydzi ze Żbikowa trafili tam po utracie domów.",
        "scale": "Lokalna",
        "sources": [
          "S05",
          "S03"
        ]
      },
      {
        "sort": "1941-02-01",
        "date": "początek II 1941",
        "text": "Niemal wszystkich mieszkańców getta deportowano do getta warszawskiego.",
        "scale": "Lokalna",
        "sources": [
          "S05"
        ]
      },
      {
        "sort": "1944-07-25",
        "date": "koniec VII 1944",
        "text": "Niemcy ewakuują maszyny z warsztatów kolejowych na Żbikowie.",
        "scale": "Lokalna",
        "sources": [
          "S01"
        ]
      },
      {
        "sort": "1944-08-01",
        "date": "1 VIII 1944",
        "text": "Wybuch Powstania. Żołnierze VI Rejonu „Helenów” AK podejmują akcje, część ostrzelana w drodze na zbiórkę.",
        "scale": "Lokalna",
        "sources": [
          "S04"
        ]
      },
      {
        "sort": "1944-08-02",
        "date": "2 VIII 1944",
        "text": "Egzekucja na żwirowni (ul. Lipowa / Żwirowa): 27–34 mężczyzn. Tego dnia bój pod Pęcicami (AK Ochota, 31 poległych, 67 w niewoli, 60 rozstrzelanych).",
        "scale": "Lokalna",
        "sources": [
          "S04",
          "S20"
        ]
      },
      {
        "sort": "1944-08-03",
        "date": "3 VIII 1944",
        "text": "Komendant „Paweł” nakazuje VI Rejonowi powrót do konspiracji.",
        "scale": "Lokalna",
        "sources": [
          "S04"
        ]
      },
      {
        "sort": "1944-08-06",
        "date": "6 VIII 1944",
        "text": "Utworzenie Dulagu 121. Komisarz miasta Walter Bock zleca RGO pomoc. Wieczorem apele ks. Tyszki i ks. Dyżewskiego w pruszkowskich kościołach o żywność, naczynia i ochotników.",
        "scale": "Lokalna",
        "sources": [
          "S01",
          "S02"
        ]
      },
      {
        "sort": "1944-08-07",
        "date": "7 VIII 1944",
        "text": "Pieszo dociera pierwsza grupa ok. 3 tys. kobiet i dzieci ocalałych z Rzezi Woli.",
        "scale": "Lokalna",
        "sources": [
          "S01"
        ]
      },
      {
        "sort": "1944-08-10",
        "date": "10, 12 i 13 VIII 1944",
        "text": "Pierwsze trzy transporty osób niezdolnych do pracy ruszają do powiatu łowickiego.",
        "scale": "Lokalna",
        "sources": [
          "S24"
        ]
      },
      {
        "sort": "1944-08-11",
        "date": "11 VIII 1944",
        "text": "Kierownictwo obozu przejmuje Wehrmacht (płk Kurt Sieber). Zakaz bicia i używania broni krótkiej. W hali 2 zaczyna działać komisja lekarska.",
        "scale": "Lokalna",
        "sources": [
          "S01"
        ]
      },
      {
        "sort": "1944-08-15",
        "date": "ok. 15 VIII 1944",
        "text": "Łączniczki VI Rejonu „Helenów” przenoszą meldunek o sytuacji w obozie do powstańczej Warszawy. 25 VIII apel do MCK nadany przez radiostację powstańczą.",
        "scale": "Lokalna",
        "sources": [
          "S01"
        ]
      },
      {
        "sort": "1944-08-25",
        "date": "25 VIII, 31 VIII i 29 IX 1944",
        "text": "Trzy transporty z Dulagu do KL Stutthof (pierwszy 25 VIII). Do KL Auschwitz wywieziono ok. 13,5 tys. osób.",
        "scale": "Lokalna",
        "sources": [
          "S25",
          "S24"
        ]
      },
      {
        "sort": "1944-09-01",
        "date": "pierwsze dni IX 1944",
        "text": "Szczyt pierwszej fali: w obozie do 75 tys. osób.",
        "scale": "Lokalna",
        "sources": [
          "S01"
        ]
      },
      {
        "sort": "1944-09-05",
        "date": "5 IX 1944",
        "text": "Inspekcja gen. von dem Bacha-Zelewskiego (propagandowa).",
        "scale": "Lokalna",
        "sources": [
          "S01"
        ]
      },
      {
        "sort": "1944-09-17",
        "date": "17–18 IX 1944",
        "text": "Wizytacja przedstawiciela Międzynarodowego Czerwonego Krzyża dr. Paula Wyssa.",
        "scale": "Lokalna",
        "sources": [
          "S01"
        ]
      },
      {
        "sort": "1944-09-28",
        "date": "koniec IX 1944",
        "text": "Do hali 7 trafia ok. 1200 powstańców z Mokotowa, potem z Żoliborza. Hala 8: szpital dla powstańców.",
        "scale": "Lokalna",
        "sources": [
          "S01"
        ]
      },
      {
        "sort": "1944-10-01",
        "date": "początek X 1944",
        "text": "Druga fala: w niecałe dwa tygodnie ok. 170 tys. osób. Uruchomiono filie w Ursusie i Piastowie.",
        "scale": "Lokalna",
        "sources": [
          "S01"
        ]
      },
      {
        "sort": "1944-11-01",
        "date": "XI 1944 – I 1945",
        "text": "W hali 13 zakwaterowane Arbeitskommando rabujące Warszawę.",
        "scale": "Lokalna",
        "sources": [
          "S01"
        ]
      },
      {
        "sort": "1945-01-14",
        "date": "14–17 I 1945",
        "text": "Operacja warszawska: 47 i 61 Armia uderzają w kierunku Błonia, oskrzydlając stolicę i 9 Armię niemiecką. Do 17 I Niemcy opuszczają lewobrzeżną Warszawę i Pruszków.",
        "scale": "Kontekst",
        "sources": [
          "S26",
          "S11"
        ]
      },
      {
        "sort": "1945-01-16",
        "date": "16/17 I 1945",
        "text": "Niemcy ewakuują załogę obozu, Dulag przestaje istnieć. 17 I Pruszków opuszczony przez okupanta, rusza Miejska Rada Narodowa.",
        "scale": "Lokalna",
        "sources": [
          "S01",
          "S11"
        ]
      },
      {
        "sort": "1945-04-01",
        "date": "wiosna 1945",
        "text": "Ekshumacje ofiar niemieckich w Pruszkowie.",
        "scale": "Lokalna",
        "sources": [
          "S06"
        ]
      },
      {
        "sort": "1947-01-01",
        "date": "1947",
        "text": "Odsłonięcie pierwszej tablicy pamiątkowej o obozie (miejsce nieustalone).",
        "scale": "Lokalna",
        "sources": [
          "S27"
        ]
      }
    ]
  }
};

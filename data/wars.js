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
    spoleczne:     { label: 'Opieka i skutki wojny',           color: '#0EA5E9', glyph: '♥' }
  },
  lineTypes: {
    front:     { label: 'Linia frontu (kontekst)',    color: '#EAB308', dash: '10 7', arrow: false },
    atak:      { label: 'Kierunek natarcia',          color: '#EF4444', dash: null,   arrow: true },
    ostrzal:   { label: 'Kierunek ostrzału',          color: '#F97316', dash: '2 9',  arrow: true, animate: true },
    transport: { label: 'Ruch ludności',              color: '#A855F7', dash: '8 6',  arrow: true }
  },

  ww1: {
    "label": "I wojna światowa",
    "period": "1914–1918",
    "color": "#C8A24A",
    "intro": "Walki o Pruszków i ostrzał Żbikowa w październiku 1914 r.: stanowiska artylerii obu stron, punkty obserwacyjne, schrony, zniszczenia i mogiły, a także skutki wojny do 1918 r. Kolory linii: czerwone — ogień rosyjski, niebieskie — niemiecki.",
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
        "from": "1914-10-13",
        "to": "1914-10-17",
        "type": "ostrzal",
        "side": "Rosjanie",
        "color": "#EF4444",
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
        "from": "1914-10-13",
        "to": "1914-10-17",
        "type": "ostrzal",
        "side": "Niemcy",
        "color": "#60A5FA",
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
        "from": "1914-10-17",
        "to": "1914-10-17",
        "type": "ostrzal",
        "side": "Rosjanie",
        "color": "#EF4444",
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
        "from": "1914-10-11",
        "to": "1914-10-11",
        "type": "atak",
        "side": "Niemcy",
        "color": "#60A5FA",
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

# Żbików — Historia na mapie

Interaktywna mapa historii Żbikowa (Leaflet + OpenStreetMap / ortofotomapa / mapa archiwalna).
Cała aplikacja to statyczna strona (`index.html`, style w `css/`, skrypty w `js/`, dane w `data/`, zdjęcia w `img/`) — nie wymaga budowania ani serwera.

> **Wersja demonstracyjna.** © Tomasz Wrotek. Wszelkie prawa zastrzeżone.

## Uruchomienie z GitHuba (GitHub Pages)

Strona jest publikowana automatycznie przez workflow `.github/workflows/pages.yml`
przy każdym pushu na domyślną gałąź repozytorium.

Jednorazowo w repozytorium: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
Po udanym wdrożeniu strona będzie dostępna pod adresem:

https://radioactiv152.github.io/-bik-w---Historia-na-Mapie/

Alternatywnie (bez Actions): **Source: Deploy from a branch**, wybierz gałąź i folder `/ (root)`.

## Uruchomienie lokalne

Otwórz `index.html` w przeglądarce albo uruchom prosty serwer:

```sh
python3 -m http.server 8000
# http://localhost:8000
```

Przy pierwszym otwarciu potrzebny jest internet (Leaflet z CDN, kafelki map z zewnętrznych serwerów). Czcionki są lokalne (`fonts/`).
Po pierwszej wizycie `sw.js` (service worker) trzyma stronę, dane, miniatury i ostatnio oglądane kafelki w pamięci podręcznej,
więc kolejne otwarcia są natychmiastowe, a spacer z trasą działa bez zasięgu (nowe fragmenty mapy wymagają sieci).

## Struktura kodu

| Plik | Zawartość |
|---|---|
| `css/app.css`, `css/fonts.css` | style strony (motywy, układ mobilny, druk) i lokalne czcionki |
| `js/00-core.js` … `js/90-app.js` | skrypty w kolejności ładowania; dzielą jeden zakres globalny: dane, mapa, karty, wyszukiwarka, trasy, wojny, autobusy, Okolica, start |
| `js/05-i18n.js` | tłumaczenie interfejsu na angielski (`?lang=en` albo menu stylu mapy); treść pozostaje po polsku |
| `sw.js` | praca offline i szybkie ponowne otwarcie |
| `tests/` | testy Playwright (komputer i telefon): `cd tests && npm ci && npx playwright install chromium && npx playwright test` — uruchamiane też w workflow przed publikacją |


## Dane

Wszystkie dane są w folderze `data/` jako zwykłe pliki JavaScript. Można je edytować ręcznie, bez zmian w `index.html`;
na początku każdego pliku jest opis pól.

| Plik | Zawartość |
|---|---|
| `data/places.js` | miejsca z bazy (z adresem i bez dokładnej lokalizacji) |
| `data/photos.js` | zdjęcia archiwalne przypisane do miejsc (tylko domena publiczna, sprzed 1990 r.) |
| `data/routes.js` | trasy spacerowe |
| `data/wars.js` | warstwy „I wojna światowa” i „II wojna światowa”: wydarzenia, typy, linie frontu i kierunki ataków |
| `data/artifacts.js` | „ARTEFAKTY” i „CO TU PRODUKOWANO” dla miejsc, z dowolną liczbą pozycji i zdjęć |
| `data/poi.js` | zakładka „Okolica”: kultura, kawiarnie, sklepy spożywcze, stacje paliw, apteki z OpenStreetMap — generowane |
| `data/transit.js` | przystanki i rozkłady autobusów (linie miejskie Pruszkowa i GPA) — generowane, nie edytuj ręcznie |

Warstwy wojenne generują z arkuszy badawczych skrypty `tools/import_ww1_xlsx.py`
(`python3 tools/import_ww1_xlsx.py zbikow_I_wojna_swiatowa_research_v2.xlsx`) i `tools/import_ww2_xlsx.py`
(`python3 tools/import_ww2_xlsx.py zbikow_II_wojna_swiatowa_research_2.xlsx`; obrys obozu w `tools/dulag_area.json`). Współrzędne wpisane w arkuszu
(kolumny „Szer. geogr.” i „Dł. geogr.”) mają pierwszeństwo przed punktami wyznaczonymi z OpenStreetMap.

## Autobusy

Przycisk z autobusem obok „1944” pokazuje przystanki w okolicy Żbikowa; karta przystanku ma najbliższe odjazdy
(czas warszawski, dzień roboczy / sobota / niedziela i święta) i cały rozkład na dziś, a kliknięcie numeru linii
rysuje jej przebieg. W trasach spacerowych sekcja „Dojazd autobusem” podaje przystanki przy starcie i mecie.

Dane pochodzą z otwartych plików GTFS (komunikacja miejska Pruszkowa i GPA, republikowane przez
[zbiorkom.live](https://zbiorkom.live)). `python3 tools/import_transit.py` pobiera je i zapisuje `data/transit.js`;
workflow Pages robi to przy każdej publikacji i co poniedziałek, więc rozkład na stronie sam się odświeża
(GitHub wyłącza harmonogram po 60 dniach bez aktywności w repozytorium — wtedy trzeba go włączyć w zakładce Actions).
To rozkład planowy — bez opóźnień na żywo.

## Okolica

Zakładka **OKOLICA** pokazuje placówki kultury (biblioteki, Muzeum Dulag 121, domy kultury), kawiarnie, sklepy
spożywcze, stacje paliw i apteki, z informacją „otwarte teraz / otwierają o …” i skrótami „najbliższy otwarty
sklep / stacja / apteka”. Odległości liczone są od Twojej pozycji (po zgodzie) albo od środka mapy. Przy miejscach
stojących obok obiektów historycznych jest przycisk „Historia tego miejsca”.

Dane pochodzą z OpenStreetMap (ODbL) — Google Maps nie pozwala legalnie kopiować ani przechowywać swoich danych.
`python3 tools/import_poi.py` pobiera je przez Overpass API i zamienia godziny otwarcia na prosty plan tygodniowy
(`data/poi.js`); workflow Pages robi to przy każdej publikacji i co poniedziałek.

## Ułatwienia dostępu

- Przy pierwszej wizycie strona pokazuje ekran powitalny z trzema wejściami (lista miejsc, trasy, lata wojny);
  można go wywołać ponownie z okna „O mapie”.
- Kolory strony (ciemne, jasne, papierowe, morskie) dobierają się przy pierwszej wizycie do ustawień urządzenia;
  wszystkie motywy mają kontrast tekstu co najmniej 4,5:1 (WCAG AA).
- W menu stylu mapy jest przełącznik **Rozmiar tekstu** (normalny / większy) — powiększa karty, listy i okna, nie mapę.
- Link „Pomiń mapę” (pierwszy Tab) prowadzi klawiaturą od razu do menu widoków, z pominięciem znaczników na mapie.
- Wszystkie przyciski mają nazwy dla czytników ekranu, a na ekranach dotykowych co najmniej 44 px wysokości.
- Interfejs po angielsku: `?lang=en` albo „Język · Language” w menu stylu mapy (opisy miejsc pozostają po polsku).

## Trasy spacerowe

Pięć tras tematycznych (dane w `data/routes.js`). Przebieg po ulicach został wyznaczony raz
serwisem OSRM (profil pieszy, dane OpenStreetMap) i zapisany w pliku, więc strona nie korzysta
z żadnej usługi routingu w czasie działania.

Po włączeniu „Gdzie jestem?” strona pokazuje nad menu najbliższy przystanek trasy i odległość do niego,
odległości na liście przystanków, a po podejściu na ok. 40 m sama otwiera kartę przystanku (raz na przystanek).
Trasę można wydrukować (przycisk „Drukuj trasę” — lista przystanków i link do mapy).

## Udostępnianie i zgłaszanie uwag

Każda karta ma przycisk „Udostępnij” (na telefonie systemowy arkusz, na komputerze kopiowanie linku) i kod QR
do wydruku, np. na tabliczkę przy obiekcie. Pod opisem jest link „Zgłoś błąd lub uzupełnienie”, który otwiera
wstępnie wypełnione zgłoszenie w tym repozytorium.

## Miejsca bez punktu

`python3 tools/suggest_locations.py` tworzy `tools/unmapped_report.md`: listę rekordów i wydarzeń bez punktu na mapie
z podpowiedziami (obiekt z bazy wymieniony w opisie, adres albo ulica z OpenStreetMap). Podpowiedzi są do ręcznego
sprawdzenia; zatwierdzony punkt wpisuje się do arkusza albo do `data/places.js`.

## Zdjęcia

Folder `img/` zawiera wyłącznie historyczne fotografie (sprzed 1990 r.) w domenie publicznej,
pobrane z Wikimedia Commons (`img/t/` to miniatury). Autor, data, źródło i podstawa prawna
każdego zdjęcia są zapisane w `data/photos.js` i wyświetlane pod zdjęciem.

## Prawa autorskie

© Tomasz Wrotek. Wszelkie prawa zastrzeżone. Projekt jest wersją demonstracyjną.
Dane i materiały stron trzecich (OpenStreetMap — ODbL, rozkłady GTFS, fotografie z Wikimedia Commons w domenie
publicznej) pozostają na swoich licencjach.

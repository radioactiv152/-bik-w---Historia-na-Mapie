# Żbików — Historia na mapie

Interaktywna mapa historii Żbikowa (Leaflet + OpenStreetMap / ortofotomapa / mapa archiwalna).
Cała aplikacja to jeden statyczny plik `index.html` — nie wymaga budowania ani serwera.

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

Wymagany dostęp do internetu (Leaflet i czcionki ładowane z CDN, kafelki map z zewnętrznych serwerów).

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

Warstwy wojenne generują z arkuszy badawczych skrypty `tools/import_ww1_xlsx.py`
(`python3 tools/import_ww1_xlsx.py zbikow_I_wojna_swiatowa_research_v2.xlsx`) i `tools/import_ww2_xlsx.py`
(`python3 tools/import_ww2_xlsx.py zbikow_II_wojna_swiatowa_research_2.xlsx`; obrys obozu w `tools/dulag_area.json`). Współrzędne wpisane w arkuszu
(kolumny „Szer. geogr.” i „Dł. geogr.”) mają pierwszeństwo przed punktami wyznaczonymi z OpenStreetMap.

## Trasy spacerowe

Pięć tras tematycznych (dane `ROUTES` w `index.html`). Przebieg po ulicach został wyznaczony raz
serwisem OSRM (profil pieszy, dane OpenStreetMap) i zapisany w pliku, więc strona nie korzysta
z żadnej usługi routingu w czasie działania.

## Zdjęcia

Folder `img/` zawiera wyłącznie historyczne fotografie (sprzed 1990 r.) w domenie publicznej,
pobrane z Wikimedia Commons (`img/t/` to miniatury). Autor, data, źródło i podstawa prawna
każdego zdjęcia są zapisane w danych `PHOTOS` w `index.html` i wyświetlane pod zdjęciem.

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

## Zdjęcia

Folder `img/` zawiera wyłącznie historyczne fotografie (sprzed 1990 r.) w domenie publicznej,
pobrane z Wikimedia Commons (`img/t/` to miniatury). Autor, data, źródło i podstawa prawna
każdego zdjęcia są zapisane w danych `PHOTOS` w `index.html` i wyświetlane pod zdjęciem.

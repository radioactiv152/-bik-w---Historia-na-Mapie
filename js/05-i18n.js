/* Żbików — Historia na mapie: język interfejsu (polski domyślnie, angielski przez ?lang=en albo menu stylu).
 * Tłumaczone są napisy interfejsu: przyciski, nagłówki, etykiety, okna. Treść (nazwy, opisy, kategorie,
 * źródła) pozostaje po polsku. t('…') zwraca tłumaczenie klucza albo sam klucz. */
var LANG = (function(){
  var q = new URLSearchParams(location.search).get('lang'), saved = null;
  try { saved = localStorage.getItem('zbikow-lang'); if (q === 'en' || q === 'pl') localStorage.setItem('zbikow-lang', q); } catch (e) {}
  var l = q || saved || 'pl';
  return l === 'en' ? 'en' : 'pl';
})();

var I18N_EN = {
  // karty i listy
  'Karta miejsca': 'Place', 'Bez punktu na mapie': 'No point on the map', 'Adres z kilkoma obiektami': 'Address with several places',
  'Przystanek autobusowy': 'Bus stop', 'Trasa spacerowa': 'Walking route', 'Trasy spacerowe': 'Walking routes', 'Wybierz trasę': 'Choose a route',
  'Okolica · ': 'Nearby · ', 'W pobliżu': 'Nearby', 'Warstwa historyczna · ': 'Historical layer · ', 'Wszystkie miejsca': 'All places',
  'wysoka': 'high', 'średnia': 'medium', 'niska': 'low',
  'Datowanie': 'Dates', 'Źródło': 'Source', 'Źródła': 'Sources', 'Lokalizacja': 'Location', 'Pewność: ': 'Certainty: ', 'Pewność informacji': 'Certainty of the information',
  'Pod tym samym adresem': 'At the same address', 'Uwagi do źródeł i lokalizacji': 'Notes on sources and location',
  'brak punktu na mapie': 'no point on the map', 'bez punktu': 'no point', ' · bez punktu na mapie': ' · no point on the map',
  'Pokaż to miejsce na mapie współczesnej': 'Show this place on the modern map', 'Zgłoś błąd lub uzupełnienie do tego miejsca': 'Report a mistake or add information about this place',
  'Zdjęcia': 'Photos', 'Artefakty': 'Artefacts', 'Co tu produkowano': 'What was made here',
  'Wszystkie': 'All', 'Na mapie': 'On the map', 'Bez dokładnego adresu': 'No exact address', 'Ze zdjęciami': 'With photos', 'Artefakty i produkcja': 'Artefacts and production',
  'Nic nie pasuje do filtra.': 'Nothing matches the filter.', 'Brak wyników dla „': 'No results for “', ' obiektów · ': ' places · ', ' na mapie': ' on the map', ' z ': ' of ', ' obiektów': ' places',
  'obiektów w bazie': 'places in the database', 'z dokładnym adresem': 'with an exact address', 'punktów na mapie': 'points on the map',
  'Link do tego miejsca skopiowany.': 'Link to this place copied.', 'Kopiuj link': 'Copy link', 'Udostępnij': 'Share',
  'Zobacz na zdjęciu z 1944': 'See on the 1944 photo', 'Wróć do mapy współczesnej': 'Back to the modern map',
  // trasy
  'Przystanki': 'Stops', 'Powiązane miejsca': 'Related places', 'Zacznij od przystanku 1': 'Start from stop 1', 'Nawiguj w Google Maps': 'Navigate in Google Maps',
  'Gdzie jestem?': 'Where am I?', 'Ukryj moją pozycję': 'Hide my position', '← Wszystkie trasy': '← All routes', 'Drukuj trasę': 'Print the route', 'Zakończ trasę': 'End the route',
  ' km · ok. ': ' km · about ', ' min · ': ' min · ', ' przystanków': ' stops', 'Przystanek': 'Stop', 'Wydarzenie': 'Event', ' z ': ' of ',
  'jesteś na miejscu': 'you are here', ' do najbliższego przystanku': ' to the nearest stop', 'Jesteś przy przystanku ': 'You are at stop ', 'Jesteś na miejscu': 'You are here',
  ' do przystanku ': ' to stop ', ' (najbliższego)': ' (nearest)', ' · poza trasą': ' · off the route', ' · bez dokładnej lokalizacji': ' · no exact location',
  'Mapa z trasą: ': 'Map with the route: ', ' i in.': ' and others',
  // autobusy
  'dzień roboczy': 'weekday', 'sobota': 'Saturday', 'niedziela i święta': 'Sunday and holidays', 'Linia miejska ': 'City line ',
  'Najbliższe odjazdy · ': 'Next departures · ', 'Rozkład na dziś (': 'Timetable for today (', 'Linie · kliknij, aby pokazać przebieg na mapie': 'Lines · click to show the route on the map',
  'Brak odjazdów w rozkładzie.': 'No departures in the timetable.', 'Brak kursów w tym dniu.': 'No service on this day.', 'jutro': 'tomorrow', 'teraz': 'now', 'za ': 'in ', ' min': ' min',
  'Dojazd autobusem': 'Getting there by bus', 'Przystanki przy starcie (przystanek 1)': 'Stops near the start (stop 1)', 'Powrót — przystanki przy mecie': 'Return — stops near the end',
  'Pokaż przystanki na mapie': 'Show bus stops on the map', 'Ukryj przystanki na mapie': 'Hide bus stops on the map', 'Najbliższe: ': 'Next: ', ' (jutro)': ' (tomorrow)', ' min pieszo': ' min on foot',
  'Przystanek ': 'Bus stop ', 'Skupisko punktów: ': 'Cluster of points: ',
  // okolica
  'Kultura': 'Culture', 'Kawiarnie': 'Cafés', 'Sklepy spożywcze': 'Grocery shops', 'Stacje paliw': 'Petrol stations', 'Apteki': 'Pharmacies',
  'otwarte do ': 'open until ', 'zamknięte · otwierają o ': 'closed · opens at ', 'zamknięte · otwierają ': 'closed · opens ', ' o ': ' at ', 'otwarte całą dobę': 'open 24 hours', 'zamknięte': 'closed',
  ' (zaraz zamykają)': ' (closing soon)', 'brak godzin w OSM': 'no opening hours in OSM', 'godziny: ': 'hours: ', 'święto · sklep zamknięty (brak godzin świątecznych w OSM)': 'public holiday · shop closed (no holiday hours in OSM)',
  'Godziny otwarcia': 'Opening hours', 'Historia tego miejsca: ': 'History of this place: ', 'tylko otwarte teraz': 'open now only', 'Szukaj od mojej pozycji': 'Search from my position', 'Odśwież moją pozycję': 'Refresh my position',
  'od Twojej pozycji': 'from your position', 'od środka mapy': 'from the map centre', 'Najbliższy otwarty sklep': 'Nearest open shop', 'Najbliższa stacja': 'Nearest station', 'Najbliższa apteka': 'Nearest pharmacy', 'Najbliższa kawiarnia': 'Nearest café',
  'teraz nic otwartego (wg OSM)': 'nothing open now (per OSM)', ' · odległość ': ' · distance ', 'święta': 'holidays',
  'poniedziałek': 'Monday', 'wtorek': 'Tuesday', 'środa': 'Wednesday', 'czwartek': 'Thursday', 'piątek': 'Friday', 'niedziela': 'Sunday',
  // wojny
  'Okresy · kliknij, aby pokazać na mapie': 'Periods · click to show on the map', 'Dzień po dniu · ': 'Day by day · ', 'Legenda · kliknij, aby filtrować': 'Legend · click to filter',
  'Oś czasu (': 'Timeline (', 'cały okres': 'whole period', 'cały': 'whole', 'okres': 'period', 'Czytaj więcej': 'Read more', 'Zwiń': 'Collapse', ' na mapie · ': ' on the map · ',
  'Brak wydarzeń tego dnia': 'No events on this day', 'Kronika ': 'Chronicle ', 'Źródła warstwy': 'Sources of the layer',
  // różne
  'Przystanki autobusowe: kliknij przystanek, aby zobaczyć najbliższe odjazdy.': 'Bus stops: click a stop to see the next departures.',
  'Generator kodów QR jeszcze się ładuje — spróbuj za chwilę.': 'The QR generator is still loading — try again in a moment.',
  'Brak zgody na lokalizację — włącz ją w ustawieniach przeglądarki.': 'Location access denied — enable it in your browser settings.',
  'Nie udało się jeszcze ustalić pozycji — próbuję dalej.': 'Could not get a position yet — still trying.', 'Ta przeglądarka nie udostępnia lokalizacji.': 'This browser does not provide location.',
  'Jesteś poza Żbikowem — pozycja jest na mapie, ale daleko od tras.': 'You are outside Żbików — your position is on the map, but far from the routes.',
  'Zdjęcie z 1944 r. obejmuje Żbików i Pruszków — przesunięto mapę na jego zasięg (przerywana ramka).': 'The 1944 photo covers Żbików and Pruszków — the map was moved to its extent (dashed frame).'
};
function t(s){ if (LANG !== 'en') return s; var v = I18N_EN[s]; return v == null ? s : v; }

// Statyczne elementy strony i dwa okna z dłuższym tekstem
var STATIC_EN = {
  'title': 'Żbików — History on the map',
  '#search@placeholder': 'Search for a place, address, type…', '#search@aria-label': 'Search for a place or address',
  '.skip-link': 'Skip the map and go to the view menu', '#brand@aria-label': 'Show all of Żbików', '.brand-text .tag': 'History on the map · demo version',
  '#info-btn .lbl': 'About', '#info-btn@aria-label': 'About the map: how to use it, legend',
  '#sat-btn': 'Satellite', '#sat-btn@title': 'Satellite map on or off', '#ov-btn@title': 'Overlay: the 1944 aerial photo on the modern map',
  '#bus-btn .lbl': 'Buses', '#bus-btn@title': 'Bus stops and timetables (Pruszków, GPA)', '#bus-btn@aria-label': 'Bus stops',
  '[data-layer=wspolczesna] .lg': 'Modern', '[data-layer=wspolczesna] .sh': 'Today', '[data-layer=ww1] .lg': 'World War I', '[data-layer=ww1] .sh': 'WW<br>I', '[data-layer=ww2] .lg': 'World War II', '[data-layer=ww2] .sh': 'WW<br>II',
  '[data-layer=ww1]@title': 'World War I (1914–1918)', '[data-layer=ww2]@title': 'World War II (1939–1945)',
  '[data-layer=miejsca]': 'Places', '[data-layer=zdjecia]': 'Photos', '[data-layer=trasy]': 'Routes', '[data-layer=okolica]': 'Nearby', '[data-layer=okolica]@title': 'Culture, cafés, shops, petrol stations and pharmacies — what is open now',
  '#view-bar@aria-label': 'Layers and views', '#zoom-in@aria-label': 'Zoom in', '#zoom-out@aria-label': 'Zoom out', '#zoom-all@aria-label': 'Show all places', '#zoom-all@title': 'Show all places',
  '#style-menu .sm-label:nth-of-type(1)': 'Map style', '#style-menu .sm-label:nth-of-type(2)': 'Page colours', '#style-menu .sm-label:nth-of-type(3)': 'Text size', '#style-menu .sm-label:nth-of-type(4)': 'Language · Język',
  '#sm-text [data-text=normal]': '<b>A</b>Normal', '#sm-text [data-text=big]': '<b style="font-size:21px">A</b>Larger',
  '#panel-kicker': 'Place', '#close-panel@aria-label': 'Close the place card', '#btn-1944 span': 'See on the 1944 photo', '#btn-share-label': 'Copy link', '#btn-share@aria-label': 'Share the link to this place', '#btn-share@title': 'Share the link to this place',
  '#btn-qr@aria-label': 'QR code with the link to this place', '#btn-qr@title': 'QR code for printing',
  '#war-kicker': 'Historical layer', '#close-war@aria-label': 'Close the event list', '#near-kicker': 'Nearby · now', '#near-title': 'Nearby', '#close-near@aria-label': 'Close nearby',
  '#routes-kicker': 'Walking routes', '#routes-title': 'Choose a route', '#close-routes@aria-label': 'Close the routes', '#list-title': 'All places', '#close-list@aria-label': 'Close the list',
  '#list-filter@placeholder': 'Filter the list…', '[data-f=all]': 'All', '[data-f=mapped]': 'On the map', '[data-f=unmapped]': 'No exact address', '[data-f=photos]': 'With photos', '[data-f=feat]': 'Artefacts and production',
  '#wt-prev@aria-label': 'Earlier', '#wt-next@aria-label': 'Later', '#wt-range@aria-label': 'Choose a date or period', '#wt-cur': 'whole period', '#war-time@aria-label': 'Timeline on the map',
  '#opacity-slider@aria-label': 'Blend between the 1944 photo and the modern map', '#opacity-ctrl span': 'today',
  '#info-title': 'Żbików — History on the map', '#close-info@aria-label': 'Close', '#close-cz@aria-label': 'Close', '#cz-prev@aria-label': 'Previous', '#cz-next@aria-label': 'Next',
  '#qr .kicker': 'QR code', '#close-qr@aria-label': 'Close', '.qr-hint': 'Scan with your phone to open this place on the map. The code can be printed, e.g. for a plaque by the building.', '#qr-print': 'Print', '#qr-copy': 'Copy link',
  '#wl-start': 'Start with the map', '#welcome .wl-hero .kicker': 'Żbików · History on the map', '#wl-title': 'Welcome to the map of Żbików\'s history',
  '#welcome .wl-hero p': 'Every red point is a place with a history: a house, school, factory, church or memorial. Click a point to read what was here.',
  '#welcome [data-go=miejsca] b': 'List of places', '#welcome [data-go=miejsca] span:not(.ic)': 'All places alphabetically, with descriptions, dates and sources.',
  '#welcome [data-go=trasy] b': 'Walking routes', '#welcome [data-go=trasy] span:not(.ic)': 'Five routes through the streets of Żbików, from 15 minutes to an hour.',
  '#welcome [data-go=ww2] b': 'The war years', '#welcome [data-go=ww2] span:not(.ic)': 'Maps of 1914–1918 and 1939–1945 with a day-by-day timeline.',
  '#welcome .wl-tip > span:last-child': 'A number in a circle means several places close together — zoom in or click the circle to separate them. The <b>1944</b> button lays a wartime aerial photo over the map.',
  '#welcome .wl-foot small': 'You can find this screen again under the “About” button.'
};
var INFO_EN = '<p class="demo-note"><b>Demo version.</b> Content and features may be incomplete and will still change. Place descriptions, categories and sources are in Polish.</p>' +
  '<p>A map of what is known about the history of Żbików (Pruszków): churches, villas, factories, schools, places of memory and of the resistance. Click a point on the map, search for a place or browse the <b>Places</b> list.</p>' +
  '<div class="stats" id="stats"></div>' +
  '<h4>Legend</h4><ul class="legend">' +
  '<li><span class="sw"><span class="marker-pin"><i></i></span></span>A single place at an exact modern address</li>' +
  '<li><span class="sw"><span class="marker-pin approx"><i></i></span></span>Approximate location (a crossing, a factory site, an area) — details on the card</li>' +
  '<li><span class="sw"><span class="bus-stop" style="display:inline-flex"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4"><rect x="4" y="3" width="16" height="15" rx="3"/><path d="M4 11h16M8 21v-3M16 21v-3"/></svg></span></span>Bus stop (the bus button next to “1944”) — next departures of Pruszków and GPA city lines</li>' +
  '<li><span class="sw"><span class="marker-group">3</span></span>Several places at one address — click to spread them into separate points</li>' +
  '<li><span class="sw"><span class="cluster"><span>12</span></span></span>A cluster of points — zoom in to separate them</li>' +
  '<li><span class="sw"><span class="badge conf-wysoka"><span class="dot"></span></span></span>Certainty of the information: <span style="color:var(--ok)">high</span> · <span style="color:var(--mid)">medium</span> · <span style="color:var(--low)">low</span></li></ul>' +
  '<h4>The 1944 overlay</h4><p>An aerial photo from 1944, georeferenced in MapWarper. Switch it on with the <b>1944</b> button next to the map style; the slider blends between 1944 and today. Works on every layer.</p>' +
  '<h4>World War I and II</h4><p>The <b>World War I</b> and <b>World War II</b> buttons switch the map to a layer with places and events of 1914–1918 and 1939–1945 — with a timeline, a legend and event cards. Events, front lines, shelling and attack directions come from the research sheets. On a phone the card can be expanded to full screen by dragging it up or tapping the handle.</p>' +
  '<h4>Artefacts and production</h4><p>Where artefacts are linked to a place, or it is known what was made there, the card shows the <b>ARTEFACTS</b> and <b>WHAT WAS MADE HERE</b> buttons, which open a gallery. Such points have a small green dot.</p>' +
  '<h4>Walking routes</h4><p>Five themed routes through the streets of Żbików. The <b>Routes</b> button shows the list; on a route you can move between stops with the ‹ › arrows, switch on your position (“Where am I?”) or open walking navigation in Google Maps.</p>' +
  '<h4>Archival photos</h4><p>Only historical photographs (before 1990) in the public domain are shown. Under each photo you will find the author, date, source and legal basis. Points with a photo have a light ring; the <b>Photos</b> button lists such places.</p>' +
  '<h4>About the data</h4><p>Places without an exact address (descriptive or area locations) are in the search and the list, but have no point on the map — so the map does not suggest more certainty than the sources give.</p>' +
  '<h4>Accessibility</h4><p>In the map style menu (top left) you can set the <b>page colours</b> (light, dark, paper) and <b>larger text</b>. <button class="linklike" id="show-welcome" type="button">Show the welcome screen again</button>.</p>' +
  '<h4>Shortcuts</h4><p><kbd>/</kbd> search · <kbd>↑</kbd><kbd>↓</kbd> <kbd>Enter</kbd> pick a result · <kbd>Esc</kbd> close</p>' +
  '<p class="copyright">© Tomasz Wrotek. All rights reserved. Demo version.<br>Map data, photographs and open data remain under the licences stated with them (OpenStreetMap — ODbL, photographs — public domain).</p>';

(function applyStaticLang(){
  document.querySelectorAll('#sm-lang button').forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.lang === LANG)); });
  if (LANG !== 'en') return;
  document.documentElement.lang = 'en';
  Object.keys(STATIC_EN).forEach(function(key){
    var parts = key.split('@'), sel = parts[0], attr = parts[1];
    if (sel === 'title'){ document.title = STATIC_EN[key]; return; }
    document.querySelectorAll(sel).forEach(function(el){
      if (attr) el.setAttribute(attr, STATIC_EN[key]); else el.innerHTML = STATIC_EN[key];
    });
  });
  var info = document.querySelector('#info .dlg-body');
  if (info) info.innerHTML = INFO_EN;
  var md = document.querySelector('meta[name="description"]');
  if (md) md.setAttribute('content', 'Interactive map of the history of Żbików (Pruszków, Poland): churches, villas, places of memory and of the resistance, with a 1944 aerial photo overlay.');
})();

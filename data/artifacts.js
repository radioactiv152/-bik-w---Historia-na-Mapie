/* Żbików — Historia na mapie: artifacts.js
 * ARTEFAKTY i CO TU PRODUKOWANO — przypisane do rekordów z places.js (klucz = origId).
 * Plik danych ładowany przez index.html (window.ZBIKOW). Jedno miejsce może mieć wiele pozycji,
 * a każda pozycja wiele zdjęć. Karta miejsca pokazuje wyróżnione przyciski „ARTEFAKTY” i „CO TU PRODUKOWANO”,
 * a kliknięcie otwiera karuzelę ze zdjęciami.
 *
 * artifacts = {
 *   "<origId>": [
 *     {
 *       kind:   'artefakt' | 'produkcja',
 *       name:   'Nazwa artefaktu lub produktu',
 *       desc:   'Krótki opis',
 *       date:   'okres / data (opcjonalnie)',
 *       source: 'źródło informacji', sourceUrl: 'https://… (opcjonalnie)',
 *       images: [ { file: 'img/art/…jpg', thumb: 'img/art/t/…jpg', caption: '…', author: '…',
 *                   license: 'domena publiczna / CC BY… (tylko jeśli pozwala na publikację)', sourceUrl: '…' } ]
 *     }
 *   ]
 * }
 * Pozycja bez zdjęć jest pokazywana z miejscem na zdjęcie „do uzupełnienia”.
 *
 * Wpisy „produkcja” poniżej pochodzą wprost z opisów rekordów w bazie. Artefaktów w bazie jeszcze nie ma —
 * przykład do skopiowania:
 *   "7": [ { kind: 'artefakt', name: '…', desc: '…', date: '…', source: '…', images: [] } ]
 */
window.ZBIKOW = window.ZBIKOW || {};
window.ZBIKOW.artifacts = {
 "19": [
  {
   "kind": "produkcja",
   "name": "Naprawa taboru kolejowego",
   "desc": "Warsztaty były dużym kompleksem naprawy taboru kolei warszawsko-wiedeńskiej, kluczowym dla rozwoju Żbikowa.",
   "date": "od 1897 r.–?",
   "source": "Kucharski / Skwara",
   "sourceUrl": "",
   "images": []
  }
 ],
 "25": [
  {
   "kind": "produkcja",
   "name": "Cegła maszynowa i kamionkowa",
   "desc": "Cegielnia braci Hoser produkowała cegłę maszynową i kamionkową; do torów kolei warszawsko-wiedeńskiej wożono ją własną kolejką cegielnianą.",
   "date": "1897–po 1944, przed 1955",
   "source": "Kaleta / Dulag 121",
   "sourceUrl": "",
   "images": []
  }
 ],
 "29": [
  {
   "kind": "produkcja",
   "name": "Rośliny ze szkółek Hoserów",
   "desc": "Szkółki były dużym zakładem ogrodniczym i ośrodkiem hodowli roślin.",
   "date": "od 1896 r.–obecnie",
   "source": "Kucharski",
   "sourceUrl": "",
   "images": []
  }
 ],
 "39": [
  {
   "kind": "produkcja",
   "name": "Pilniki",
   "desc": "Fabryka Henryka Hosera „Hossyb” produkowała pilniki; od 1900 r. pracowała z turbiną parową i zatrudniała ok. 150 osób.",
   "date": "od 1900 r.–?",
   "source": "Skwara / Kaleta",
   "sourceUrl": "",
   "images": []
  }
 ],
 "40": [
  {
   "kind": "produkcja",
   "name": "Guziki",
   "desc": "Fabryczka „Butonia” produkowała guziki.",
   "date": "pocz. XX w.–?",
   "source": "Skwara / Kaleta",
   "sourceUrl": "",
   "images": []
  }
 ],
 "77": [
  {
   "kind": "produkcja",
   "name": "Tapety",
   "desc": "Budynek Papierni był pierwotnie przeznaczony do produkcji tapet; później służył m.in. jako budynek mieszkalny.",
   "date": "ok. 1890–?",
   "source": "Gminna Ewidencja Zabytków 2022; materiały historyczne o Żbikowie",
   "sourceUrl": "",
   "images": []
  }
 ],
 "80": [
  {
   "kind": "produkcja",
   "name": "Pieczywo",
   "desc": "Piekarnię prowadziła kolejarska spółdzielnia spożywcza.",
   "date": "od 1902 r.–?",
   "source": "Muzeum Dulag 121 / Kucharski",
   "sourceUrl": "",
   "images": []
  }
 ],
 "160": [
  {
   "kind": "produkcja",
   "name": "Cegła",
   "desc": "Cegielnia rodziny Prędkiewiczów („Trojanówka”) działała w okresie okupacji i po wojnie.",
   "date": "od połowy lat 30. XX w.; co najmniej 1940–okres powojenny",
   "source": "Muzeum Dulag 121 – „Cegielnia Trojanówka” / archiwum rodziny Prędkiewiczów",
   "sourceUrl": "",
   "images": []
  }
 ],
 "161": [
  {
   "kind": "produkcja",
   "name": "Cegła",
   "desc": "Międzywojenna cegielnia przy ul. Żbikowskiej; po zakładzie pozostały wyrobiska i glinianki.",
   "date": "okres międzywojenny; co najmniej lata 30. XX w.–1955",
   "source": "Muzeum Dulag 121 – „Cegielnia Trojanówka” / „Na wycieczkę 1: Pętla Szczepkowskiego”",
   "sourceUrl": "",
   "images": []
  }
 ],
 "219": [
  {
   "kind": "produkcja",
   "name": "Prodiże elektryczne",
   "desc": "Prodiż – elektryczny „mini-piekarnik” z okienkiem w pokrywie, jeden z najbardziej rozpoznawalnych sprzętów kuchennych PRL – produkowany w Pruszkowie przez „Prumel”.",
   "date": "od czasów PRL–obecnie",
   "source": "prumel.com.pl",
   "sourceUrl": "http://prumel.com.pl/",
   "images": []
  },
  {
   "kind": "produkcja",
   "name": "Sokowniki",
   "desc": "Obok prodiży zakład produkował sokowniki do domowego wyrobu soków.",
   "date": "od czasów PRL–obecnie",
   "source": "prumel.com.pl",
   "sourceUrl": "http://prumel.com.pl/",
   "images": []
  }
 ]
};

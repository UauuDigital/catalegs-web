# UAUU — Catàleg de Finques Web

Catàleg interactiu de finques de casaments per a **UAUU Digital**, que presenta 4 espais de celebracions a Catalunya: Can Macià, Ca n'Alzina, Castell de Tous i Mas Vivencs.

Aplicació d'una sola pàgina (SPA) amb selecció d'idioma (Català / Español / English), any de celebració (2026 / 2027) i detall complet de serveis, menús i preus per finca. Desplegada a [uauu.cat](https://uauu.cat).

---

## Stack tècnic

- **Vanilla HTML / CSS / JS** — sense framework, sense bundler, sense pas de compilació
- **Fonts**: Ogg Medium (titulars) + Inter Variable (cos)
- **Analítica**: Umami (events personalitzats) + Microsoft Clarity (gravació de sessions)
- **Media CDN**: imatges i vídeos allotjats a `https://uauu.cat/media/`
- **Utilitat Python**: `compress_to_webp.py` per comprimir imatges abans de pujar-les

---

## Estructura del directori

```
catalegs-web/
├── index.html              # Punt d'entrada únic — 6 pàgines + header + menu overlay
├── css/
│   └── styles.css          # Tot l'estil (~1100 línies); breakpoint a 1024px
├── js/
│   ├── engine.js           # Motor de la wheel (física spring, touch/mouse, snap)
│   ├── data.js             # Totes les dades hardcoded (preus, finques, traduccions)
│   ├── nav.js              # Estat de navegació (sel), header, menú, wheel setup
│   ├── pages.js            # Renderers de pàgines P2–P5, carousel, lightbox
│   └── analytics.js        # Seguiment Umami (events personalitzats)
├── fonts/
│   ├── OGG MEDIUM/
│   └── Inter-VariableFont_opsz,wght.ttf
├── logos/                  # Logos de finques i marca (PDF + PNG)
├── favicon.ico
├── compress_to_webp.py     # Utilitat de compressió — no es desplega
└── esquema-pagines.txt     # Especificació UX en català
```

---

## Ordre de càrrega dels scripts

Els scripts s'han de carregar en aquest ordre (tal com estan a `index.html`):

| Ordre | Fitxer | Depèn de |
|---|---|---|
| 1 | `engine.js` | — |
| 2 | `data.js` | — |
| 3 | `nav.js` | `engine.js` (makeWheel) |
| 4 | `pages.js` | `data.js`, `nav.js`, `engine.js` |
| 5 | `analytics.js` | `nav.js` (navigate), `pages.js` (renderItemDetail) |

---

## Comandes habituals

No hi ha `package.json` ni eina de compilació. El desplegament és pujada directa de fitxers.

| Tasca | Com |
|---|---|
| Dev local | Obre `index.html` al navegador directament, o `python3 -m http.server` |
| Desplegament | Pujada manual (FTP/SFTP) al servidor uauu.cat |
| Cache bust | Incrementa `?v=N` a les 5 etiquetes `<script>` d'`index.html` |
| Preparar imatges | Executa `compress_to_webp.py` localment abans de pujar media al servidor |

---

## Com actualitzar dades

Totes les dades estan hardcoded a **`js/data.js`**. No hi ha API ni fitxers CSV externs.

### Canviar preus o features d'una finca

Edita `VENUE_DATA` a `js/data.js`. Cada finca és un objecte indexat per any (`'2026'`, `'2027'`), amb un array d'ítems (cerimònia, menú, preus, dj, allotjament, galeria, ubicació, reserva, catàleg).

### Afegir un any nou (ex: 2028)

1. Copia el bloc `'2027'` de cada finca dins `VENUE_DATA`
2. Reanomena la clau a `'2028'`
3. Edita preus i contingut
4. Afegeix `'2028'` a l'array de la wheel a `js/nav.js` (línia `['2026', '2027']`)
5. Afegeix URLs de catàleg a `CATALEG_URLS` a `js/data.js`

### Canviar URLs de catàlegs PDF

Edita `CATALEG_URLS` a `js/data.js`. Les claus són: índex de finca (0–3) → any → idioma.

### Afegir una traducció

Els textos de la UI s'afegeixen als constants de `js/data.js`:
- Features d'ítems → `FEAT_TRANS`
- Notes/disclaimer → `NOTE_TRANS`
- Descripció de dates de preus → `PREUSDATE_TRANS`
- Notes a peu de taula de preus → `PREUSNOTE_TRANS`

---

## Descripció dels fitxers JS

### `js/engine.js`
Motor de la wheel selector (P0 idioma, P1 any). Física de spring amb RAF, suport touch/mouse/teclat. Exporta `makeWheel()`. No té dependències externes.

### `js/data.js`
Totes les dades estàtiques de l'app: contingut de les pàgines P2 i P3, noms de finques, etiquetes d'ítems, traduccions (CA/ES/EN), URLs de catàlegs, arrays d'imatges i `VENUE_DATA` (l'estructura principal de preus i serveis per finca i any).

### `js/nav.js`
Estat global (`sel`, `curPage`), funció `navigate()`, gestió de l'historial del navegador, header i menú overlay. Inicialitza les wheels de P0 i P1 i el formulari mòbil combinat.

### `js/pages.js`
Tots els renderers de pàgines (`initPage2` a `initPage5`) i components reutilitzables: arc UI de P2, carousel d'imatges desktop i mòbil, lightbox, taula de preus interactiva i targetes mòbil de P4.

### `js/analytics.js`
Wrapper d'Umami que enregistra events de navegació entre pàgines, visualitzacions d'ítems i clics als CTAs principals. Patcha `navigate()` i `renderItemDetail()` sense modificar la lògica original.

---

## Flux de dades

```
Usuari selecciona idioma → any → finca → ítem
                ↓
         sel { language, year, venueIdx, itemIdx }
                ↓
    getVenueItems() llegeix VENUE_DATA[venueIdx].years[year]
                ↓
    renderItemDetail() llegeix FEAT_TRANS, NOTE_TRANS, etc.
                ↓
              DOM
```

---

## Convencions del codi

- **Constants de dades en MAJÚSCULES**: `VENUE_DATA`, `ITEM_LABELS`, `FEAT_TRANS`, etc.
- **Variables privades/internes amb prefix `_`**: `_CM_GAL`, `_lb`, `_carouselNav`, etc.
- **Índex de finca positional**: 0=Can Macià, 1=Ca n'Alzina, 2=Castell de Tous, 3=Mas Vivencs
- **Claus d'ítem estables**: `cerimonia`, `menu`, `preus`, `quota`, `dj`, `galeria`, `ubicacio`, `reserva`, `cataleg`, `suite`/`allotjament`
- **Breakpoint mòbil**: `isMobile()` → `window.innerWidth <= 1024`
- **Format de preus**: `'1.234,00€'` (locale català, decimal amb coma)
- **Traduccions inline**: tots els textos de la UI es defineixen com a objectes `{ 'Català': …, 'Español': …, 'English': … }`

---

## Desplegament

- **Servidor**: uauu.cat
- **Mètode**: pujada estàtica de fitxers (FTP/SFTP), sense CI/CD
- **Cache busting**: paràmetre `?v=N` als 5 `<script>` i al `<link>` de CSS a `index.html`
- **Media**: imatges i vídeos servits des de `https://uauu.cat/media/` (no inclòs al repo)
- **Fonts i logos**: servits des del repo

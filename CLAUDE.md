# CLAUDE.md — catalegs-web

## Project overview

Interactive wedding venue catalog for UAUU Digital, showcasing 4 Catalan wedding venues (Can Macià, Ca n'Alzina, Castell de Tous, Mas Vivencs). A single-page app with multi-language support (Català / Español / English), year-based pricing (2026/2027), and detailed service/menu/pricing breakdowns per venue. Deployed publicly at uauu.cat.

---

## Tech stack

- **Vanilla HTML/CSS/JS** — no framework, no bundler, no build step
- **Fonts**: Ogg Medium (display/serif) + Inter Variable (UI/body)
- **Analytics**: Umami (custom events) + Microsoft Clarity (session recording)
- **Media CDN**: all images and videos hosted at `https://uauu.cat/media/` (not in repo)
- **Python utility**: `compress_to_webp.py` for one-off image/video compression (not part of deploy)

---

## Directory structure

```
catalegs-web/
├── index.html              # Single entry point — 6 page containers + header + menu overlay
├── css/
│   └── styles.css          # All styling (~1100 lines); breakpoint at 1024px
├── js/
│   ├── engine.js           # Wheel physics engine (spring, touch/mouse, snap) — no deps
│   ├── data.js             # All static data: VENUE_DATA, translations, image arrays, PDF URLs
│   ├── nav.js              # State (sel, curPage), navigate(), header, menu, wheel init
│   ├── pages.js            # Page renderers P2–P5, carousel, lightbox, preus UI
│   └── analytics.js        # Umami custom event tracking (patches navigate + renderItemDetail)
├── fonts/
│   ├── OGG MEDIUM/         # Ogg-Medium.otf + .ttf
│   └── Inter-VariableFont_opsz,wght.ttf
├── logos/                  # Venue/brand logos (PDF + PNG, blanc/negre variants)
├── favicon.ico
├── compress_to_webp.py     # Dev utility — not deployed
└── esquema-pagines.txt     # Catalan spec doc: page flow, breakpoints, animation notes
```

Media (images, video) is gitignored and served from uauu.cat CDN.

**Script loading order** (enforced by order in `index.html`): `engine.js` → `data.js` → `nav.js` → `pages.js` → `analytics.js`

---

## Common commands

No package.json, no build tool. Deploy is direct file upload.

| Task | How |
|---|---|
| Local dev | Open `index.html` in browser directly, or use any static server (`python3 -m http.server`) |
| Deploy | Manual upload (FTP/SFTP) to uauu.cat web root — no CI/CD pipeline found |
| Cache bust | Increment `?v=N` on all 5 `<script>` tags in `index.html` (and `styles.css` link) |
| Image prep | Run `compress_to_webp.py` locally before uploading media to server |

---

## Data flow

All data is **hardcoded in `js/data.js`** — no API calls, no CSV imports, no external data sources:

1. **User picks** language → year → venue → service item (each stored in `sel` object in `nav.js`)
2. `sel` drives rendering: `getVenueItems()` (in `pages.js`) reads `VENUE_DATA[venueIdx].years[year]`
3. `renderItemDetail()` (in `pages.js`) pulls translations from constants in `data.js` and renders into DOM
4. Images are lazy-loaded `<img>` tags pointing to `https://uauu.cat/media/…`
5. PDF catalogs per venue/year/language are hardcoded in `CATALEG_URLS` (in `data.js`)

To update prices, features, or copy: edit the relevant constant in `data.js` (see Key files for structure).

---

## Deployment

- **Host**: uauu.cat (inferred from CDN base URL and analytics config)
- **Method**: Static file upload — no detected FTP config file, deploy script, or CI pipeline
- **No environment variables** — everything is hardcoded
- **Cache busting**: query param `?v=N` on the 5 script tags and `styles.css` link in `index.html`
- Logos and fonts are served from the repo; all media from external CDN

---

## Conventions

- **All UI text is translated inline** via JS objects keyed `{ 'Català': …, 'Español': …, 'English': … }` — never hardcoded in HTML
- **Data constants use ALL_CAPS**: `VENUE_DATA`, `CATALEG_URLS`, `FEAT_TRANS`, `ITEM_TITLES`, etc.
- **Private/internal vars prefixed `_`**: `_CDT_CERIM`, `_MV_GAL`, etc.
- **Venue index is positional**: 0=Can Macià, 1=Ca n'Alzina, 2=Castell de Tous, 3=Mas Vivencs — must stay consistent across all arrays
- **Item keys are stable identifiers**: `cerimonia`, `menu`, `preus`, `quota`, `dj`, `galeria`, `ubicacio`, `reserva`, `cataleg`, `suite`/`allotjament` — used as CSS hooks and translation keys
- **Year content lives under `VENUE_DATA[n].years['YYYY']`** — adding a new year means duplicating + editing that block
- **Mobile breakpoint**: `isMobile()` checks `window.innerWidth <= 1024`; defined in `nav.js`, used in `pages.js`
- Prices formatted as `'1.234,00€'` (Catalan locale, comma decimal)

---

## Key files

| File | Purpose |
|---|---|
| [js/engine.js](js/engine.js) | Wheel physics: `KF` keyframes, spring constants, `makeWheel()` — no external dependencies |
| [js/data.js](js/data.js) | All static data: `P3_CONTENT`, `P4_CONTENT`, `VENUE_TITLES/NAMES`, `ITEM_LABELS/TITLES`, `FEAT_TRANS`, `NOTE_TRANS`, `PREUSDATE_TRANS`, `PREUSNOTE_TRANS`, `PREUS_UI`, `MAPS_BTN`, `CATALEG_URLS`, image arrays, `VENUE_DATA` |
| [js/nav.js](js/nav.js) | State (`sel`, `curPage`), `navigate()`, `rebuildNav()`, header modes, menu overlay, wheel setup for P0/P1, mobile combined form, `isMobile()`, `attachScrollHide()` |
| [js/pages.js](js/pages.js) | `getCatalegUrl()`, `itemTitle()`, `getVenueItems()`, `initPage2–5`, `buildArc()`, arc animation, `initPage3`, `buildItemList()`, `buildMobCards()`, `makeMobCarousel()`, `makeCarousel()`, `buildPreusInteractive()`, lightbox, `renderItemDetail()` |
| [js/analytics.js](js/analytics.js) | Umami event tracking — patches `navigate` and `renderItemDetail` at load time |
| [index.html](index.html) | Shell: 6 page `<div>` containers, header, menu overlay, analytics snippets, 5 script tags in order |
| [css/styles.css](css/styles.css) | All styles — layout, animations, responsive, dark/light header modes |
| [esquema-pagines.txt](esquema-pagines.txt) | Catalan spec doc — consult for intended UX behaviour, animation constants, and feature matrix before making structural changes |
| [compress_to_webp.py](compress_to_webp.py) | One-off image/video optimisation script; run locally before uploading new media |

### Key sections inside each JS file

**`js/engine.js`**

| Lines | What |
|---|---|
| 1–20 | `KF` keyframes, `SPRING`, `SNAP_THR`, math helpers (`mod`, `lerp`, `clamp`, `styleAt`) |
| 23–132 | `makeWheel()` — wheel constructor with mouse/touch/keyboard/click |

**`js/data.js`**

| Section | What |
|---|---|
| Top | `P3_CONTENT` (page 2), `P4_CONTENT` (page 3) |
| Middle | `VENUE_TITLES`, `VENUE_NAMES`, `ITEM_LABELS`, `ITEM_TITLES`, `MANDATORY_KEYS/LABEL`, `VENUE_INTRO`, `CERIMONIA_PREFIX`, `PREUS_UI`, `MAPS_BTN`, `CATALEG_URLS` |
| Translations | `FEAT_TRANS`, `NOTE_TRANS`, `PREUSDATE_TRANS`, `PREUSNOTE_TRANS` |
| Bottom | Image arrays (`_CM_CERIM`, `_CNA_GAL`, `_MV_GAL`, etc.), `preusNotes()`, `VENUE_DATA` |

**`js/nav.js`**

| Section | What |
|---|---|
| Top | `LABELS`, `PAGES`, `sel`, `curPage`, history state, `attachScrollHide`, `bgVideo` |
| Middle | `navigate()`, `rebuildNav()`, `openMenu/closeMenu`, event listeners |
| Bottom | Wheel setup (P0/P1), `MOB_STRINGS`, `updateMobStrings()`, `initPage0()`, mobile form, `isMobile` |

**`js/pages.js`**

| Section | What |
|---|---|
| Top | `getCatalegUrl()`, `itemTitle()`, `getVenueItems()` |
| P2 arc | `P3_DIST`, arc constants, arc animation vars, `p3StyleAt`, `arcPaint`, `arcTick`, `arcAnim`, `arcMove`, `playArcHint`, `updateP2Mobile`, `initPage2`, `buildArc` |
| P3 | `initPage3` |
| P4 | `buildItemList`, `initPage4` |
| Components | `makeMobCarousel`, `findPreusRow`, `buildPreusInteractive`, `buildMobCards` |
| Lightbox | `_lb*` vars, keyboard handler, `openLightbox`, `closeLightbox`, `lbGoTo` |
| Carousel | `makeCarousel` |
| P5 | `initPage5`, `renderItemDetail` |

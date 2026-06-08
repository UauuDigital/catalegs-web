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
│   └── main.js             # Entire app logic (~2330 lines); see Key files
├── fonts/
│   ├── OGG MEDIUM/         # Ogg-Medium.otf + .ttf
│   └── Inter-VariableFont_opsz,wght.ttf
├── logos/                  # Venue/brand logos (PDF + PNG, blanc/negre variants)
├── favicon.ico
├── compress_to_webp.py     # Dev utility — not deployed
└── esquema-pagines.txt     # Catalan spec doc: page flow, breakpoints, animation notes
```

Media (images, video) is gitignored and served from uauu.cat CDN.

---

## Common commands

No package.json, no build tool. Deploy is direct file upload.

| Task | How |
|---|---|
| Local dev | Open `index.html` in browser directly, or use any static server (`python3 -m http.server`) |
| Deploy | Manual upload (FTP/SFTP) to uauu.cat web root — no CI/CD pipeline found |
| Cache bust | Increment `?v=N` on `<script src="js/main.js?v=10">` in `index.html` |
| Image prep | Run `compress_to_webp.py` locally before uploading media to server |

---

## Data flow

All data is **hardcoded in `js/main.js`** — no API calls, no CSV imports, no external data sources:

1. **User picks** language → year → venue → service item (each stored in `sel` object)
2. `sel` drives rendering: `getVenueItems()` reads `VENUE_DATA[venueIdx].years[year]`
3. `renderItemDetail()` pulls translations from constants (`FEAT_TRANS`, `PREUSNOTE_TRANS`, etc.) and renders into DOM
4. Images are lazy-loaded `<img>` tags pointing to `https://uauu.cat/media/…`
5. PDF catalogs per venue/year/language are hardcoded in `CATALEG_URLS`

To update prices, features, or copy: edit the relevant constant in `main.js` (see Key files for structure).

---

## Deployment

- **Host**: uauu.cat (inferred from CDN base URL and analytics config)
- **Method**: Static file upload — no detected FTP config file, deploy script, or CI pipeline
- **No environment variables** — everything is hardcoded
- **Cache busting**: query param `?v=N` on `main.js` and `styles.css` in `index.html`
- Logos and fonts are served from the repo; all media from external CDN

---

## Conventions

- **All UI text is translated inline** via JS objects keyed `{ 'Català': …, 'Español': …, 'English': … }` — never hardcoded in HTML
- **Data constants use ALL_CAPS**: `VENUE_DATA`, `CATALEG_URLS`, `FEAT_TRANS`, `ITEM_TITLES`, etc.
- **Private/internal vars prefixed `_`**: `_CDT_CERIM`, `_MV_GAL`, etc.
- **Venue index is positional**: 0=Can Macià, 1=Ca n'Alzina, 2=Castell de Tous, 3=Mas Vivencs — must stay consistent across all arrays
- **Item keys are stable identifiers**: `cerimonia`, `menu`, `preus`, `quota`, `dj`, `galeria`, `ubicacio`, `reserva`, `cataleg`, `suite`/`allotjament` — used as CSS hooks and translation keys
- **Year content lives under `VENUE_DATA[n].years['YYYY']`** — adding a new year means duplicating + editing that block
- **Mobile breakpoint**: `isMobile()` checks `window.innerWidth < 1024`; separate rendering paths for mobile exist in p2, p4, p5
- Prices formatted as `'1.234,00€'` (Catalan locale, comma decimal)

---

## Key files

| File | Purpose |
|---|---|
| [js/main.js](js/main.js) | Entire app: state (`sel`), navigation, all data constants, page renderers, wheel physics, gallery, analytics |
| [index.html](index.html) | Shell: 6 page `<div>` containers, header, menu overlay, analytics snippets, script tags |
| [css/styles.css](css/styles.css) | All styles — layout, animations, responsive, dark/light header modes |
| [esquema-pagines.txt](esquema-pagines.txt) | Catalan spec doc — consult for intended UX behaviour, animation constants, and feature matrix before making structural changes |
| [compress_to_webp.py](compress_to_webp.py) | One-off image/video optimisation script; run locally before uploading new media |

### Key sections inside `main.js`

| Lines | What |
|---|---|
| 1–135 | Wheel engine (spring physics, touch/mouse, snap) |
| 138–245 | `sel` state object + `navigate()` + header modes |
| 298–580 | Page 2 — Quatre Escenaris arc UI |
| 648–814 | Page 3 — Venue selection |
| 878–921 | Translation constants (labels, UI strings, PDF URLs) |
| 1076–1445 | `VENUE_DATA` — all venue/year/item/pricing data |
| 1462–2070 | Page 4/5 renderers, pricing tables, lightbox |
| 2246–2332 | Umami analytics event tracking |

  /* ═══════════════════════════════════════════════════════
     NAVIGATION — estat, header i menú
  ═══════════════════════════════════════════════════════ */

  const LABELS = {
    'Català':  ['Inici', 'Any',  'Visió',    'Espais',   'Finca'],
    'Español': ['Inicio', 'Año',  'Visión',   'Espacios', 'Finca'],
    'English': ['Home', 'Year', 'Overview', 'Venues', 'Venue'],
  };
  const PAGES = [
    { id: 'page-0' },
    { id: 'page-1' },
    { id: 'page-2' },
    { id: 'page-3' },
    { id: 'page-4' },
    { id: 'page-5' },
  ];

  let curPage = 0;
  const sel   = {};   // { language, year, … }

  /* ── URL compartible ──
     ?lang=ca                                         → P1 (any)
     ?lang=ca&any=2028                                → P2 (visió)
     ?lang=ca&any=2028&pagina=espais                  → P3 (espais)
     ?lang=ca&any=2028&finca=mas-vivencs              → P4 (finca)
     ?lang=ca&any=2028&finca=mas-vivencs&seccio=menu  → P5 (detall) */
  const URL_LANGS  = { 'Català': 'ca', 'Español': 'es', 'English': 'en' };
  // 2026 ja no surt al selector d'any, però continua accessible per URL (?any=2026)
  const URL_YEARS  = ['2026', '2027', '2028'];
  const URL_VENUES = ['can-macia', 'can-alzina', 'castell-de-tous', 'mas-vivencs'];

  function buildUrl(page) {
    const q = [];
    if (page >= 1 && URL_LANGS[sel.language]) q.push('lang=' + URL_LANGS[sel.language]);
    if (page >= 2 && sel.year)                q.push('any=' + sel.year);
    if (page === 3)                         q.push('pagina=espais');
    if (page >= 4)                          q.push('finca=' + URL_VENUES[sel.venueIdx ?? 0]);
    if (page === 5) {
      const item = getVenueItems()[sel.itemIdx ?? 0];
      if (item) q.push('seccio=' + item.key);
    }
    return location.pathname + (q.length ? '?' + q.join('&') : '') + location.hash;
  }

  // Actualitza la URL sense crear entrada nova a l'historial (canvis dins la mateixa pàgina)
  function syncUrl() {
    history.replaceState({ page: curPage, sel: { ...sel } }, '', buildUrl(curPage));
  }

  // Llegeix la URL, omple `sel` i retorna la pàgina; s'atura al darrer nivell vàlid
  function applyUrl() {
    Object.keys(sel).forEach(k => delete sel[k]);
    const q = new URLSearchParams(location.search);
    const language = Object.keys(URL_LANGS).find(l => URL_LANGS[l] === q.get('lang'));
    if (!language) return 0;
    sel.language = language;
    if (!URL_YEARS.includes(q.get('any'))) return 1;
    sel.year = q.get('any');
    const venueIdx = URL_VENUES.indexOf(q.get('finca'));
    if (venueIdx === -1) return q.get('pagina') === 'espais' ? 3 : 2;
    sel.venueIdx = venueIdx;
    sel.itemIdx  = 0;
    const itemIdx = getVenueItems().findIndex(i =>
      i.key === q.get('seccio') && i.type !== 'cataleg' && i.type !== 'reserva');
    if (itemIdx === -1) return 4;
    sel.itemIdx = itemIdx;
    return 5;
  }

  history.replaceState({ page: 0, sel: {} }, '');

  window.addEventListener('popstate', e => {
    if (!e.state) { navigate(applyUrl(), { push: false }); return; }
    Object.keys(sel).forEach(k => delete sel[k]);
    Object.assign(sel, e.state.sel);
    navigate(e.state.page, { push: false });
  });

  // Enllaç directe: restaura l'estat de la URL un cop carregats tots els scripts (getVenueItems és a pages.js)
  document.addEventListener('DOMContentLoaded', () => {
    const page = applyUrl();
    if (page > 0) navigate(page, { push: false });
    syncUrl();
  });

  const header  = document.getElementById('siteHeader');
  const overlay = document.getElementById('menuOverlay');
  const navList = document.getElementById('overlayNav');

  function attachScrollHide(scrollEl) {
    const hdr = document.querySelector('.site-header');
    let lastY = 0;
    let upAccum = 0;
    scrollEl.onscroll = () => {
      const y = Math.max(0, scrollEl.scrollTop);
      const dy = y - lastY;
      if (dy > 0) {
        upAccum = 0;
        if (y > 40) hdr.classList.add('hdr-hidden');
      } else {
        upAccum += -dy;
        if (upAccum > 40) hdr.classList.remove('hdr-hidden');
      }
      lastY = y;
    };
  }

  const bgVideo = document.querySelector('.video-bg video');
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && bgVideo && bgVideo.paused) bgVideo.play().catch(() => {});
  });

  function navigate(to, { push = true } = {}) {
    document.querySelector('.site-header').classList.remove('hdr-hidden');
    if (to === 0 && bgVideo && bgVideo.paused) bgVideo.play().catch(() => {});
    if (to === curPage) return;
    const fwd   = to > curPage;
    const fromEl = document.getElementById(PAGES[curPage].id);
    const toEl   = document.getElementById(PAGES[to].id);

    // Exit current page
    fromEl.className = `page ${fwd ? 'is-above' : 'is-below'}`;

    // Stage entering page at its start position, then animate in
    toEl.className = `page ${fwd ? 'is-below' : 'is-above'}`;
    void toEl.offsetHeight;
    requestAnimationFrame(() => { toEl.className = 'page is-active'; });

    curPage = to;
    header.classList.toggle('nav-on', curPage > 0);
    header.classList.toggle('is-light', to === 3);
    header.classList.toggle('is-venue', to === 4 || to === 5);
    rebuildNav();
    if (to === 0) requestAnimationFrame(initPage0);
    if (to === 2) requestAnimationFrame(initPage2);
    if (to === 3) requestAnimationFrame(initPage3);
    if (to === 4) requestAnimationFrame(initPage4);
    if (to === 5) requestAnimationFrame(initPage5);
    if (push) history.pushState({ page: to, sel: { ...sel } }, '', buildUrl(to));
  }

  function rebuildNav() {
    navList.innerHTML = '';
    const lang = sel.language || 'Català';
    for (let i = 0; i < curPage; i++) {
      const btn       = document.createElement('button');
      btn.className   = 'overlay-nav-item';
      btn.textContent = (LABELS[lang] || LABELS['Català'])[i];
      const dest = i;
      btn.addEventListener('click', () => { closeMenu(); navigate(dest); });
      navList.appendChild(btn);
    }
  }

  // ── Menu open / close ──
  function openMenu()  { overlay.classList.add('open'); }
  function closeMenu() { overlay.classList.remove('open'); }

  document.querySelector('.hdr-logo').addEventListener('click', () => {
    if (curPage === 5) navigate(4);
    else if (header.classList.contains('is-venue')) navigate(3);
    else navigate(0);
  });

  document.getElementById('menuOpenBtn').addEventListener('click', openMenu);
  document.getElementById('menuCloseBtn').addEventListener('click', closeMenu);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  /* ═══════════════════════════════════════════════════════
     WHEELS — P0 (idioma) i P1 (any)
  ═══════════════════════════════════════════════════════ */

  // Page 0 — Language
  makeWheel(
    document.getElementById('track-0'),
    document.getElementById('list-0'),
    ['Català', 'Español', 'English'],
    lang => { sel.language = lang; navigate(1); }
  );

  // Page 1 — Year
  makeWheel(
    document.getElementById('track-1'),
    document.getElementById('list-1'),
    ['2027', '2028'],
    year => { sel.year = year; navigate(2); }
  );

  // Page 0 — Mobile combined form
  const MOB_STRINGS = {
    'Català':  { lang: 'Idioma',   year: 'Any',  cta: 'Continuar' },
    'Español': { lang: 'Idioma',   year: 'Año',  cta: 'Continuar' },
    'English': { lang: 'Language', year: 'Year', cta: 'Continue'  },
  };
  function updateMobStrings(language) {
    const s = MOB_STRINGS[language] || MOB_STRINGS['Català'];
    document.getElementById('mob-label-lang').textContent = s.lang;
    document.getElementById('mob-label-year').textContent = s.year;
    document.getElementById('mob-sel-cta-label').textContent = s.cta;
  }
  function initPage0() {
    const mobLang = document.getElementById('mob-lang');
    const mobYear = document.getElementById('mob-year');
    if (sel.language) mobLang.value = sel.language;
    if (sel.year && mobYear.querySelector(`option[value="${sel.year}"]`)) mobYear.value = sel.year;
    updateMobStrings(mobLang.value);
  }
  document.getElementById('mob-lang').addEventListener('change', e => updateMobStrings(e.target.value));
  document.getElementById('mob-sel-cta').addEventListener('click', () => {
    sel.language = document.getElementById('mob-lang').value;
    sel.year     = document.getElementById('mob-year').value;
    navigate(2);
  });

  const isMobile = () => window.innerWidth <= 1024;

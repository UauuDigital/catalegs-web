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

  history.replaceState({ page: 0, sel: {} }, '');

  window.addEventListener('popstate', e => {
    if (!e.state) return;
    Object.keys(sel).forEach(k => delete sel[k]);
    Object.assign(sel, e.state.sel);
    navigate(e.state.page, { push: false });
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
    if (push) history.pushState({ page: to, sel: { ...sel } }, '');
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
    ['2026', '2027'],
    year => { sel.year = year; navigate(2); },
    1
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
    if (sel.year)     mobYear.value = sel.year;
    updateMobStrings(mobLang.value);
  }
  document.getElementById('mob-lang').addEventListener('change', e => updateMobStrings(e.target.value));
  document.getElementById('mob-sel-cta').addEventListener('click', () => {
    sel.language = document.getElementById('mob-lang').value;
    sel.year     = document.getElementById('mob-year').value;
    navigate(2);
  });

  const isMobile = () => window.innerWidth <= 1024;

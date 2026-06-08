  /* ═══════════════════════════════════════════════════════
     WHEEL ENGINE
  ═══════════════════════════════════════════════════════ */

  const KF = [
    { size: 58, op: 1.00, ls: -.025, blur: 0   },   // dist 0 — centre
    { size: 43, op: 0.32, ls: -.015, blur: 2.5 },   // dist ±1
    { size: 32, op: 0.08, ls:  .000, blur: 5.5 },   // dist ±2
  ];
  const SPRING = 0.14, SNAP_THR = 0.25;

  const mod   = (n, m) => ((n % m) + m) % m;
  const lerp  = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  function styleAt(d) {
    const da = Math.abs(d);
    const [a, b] = da <= 1 ? [KF[0], KF[1]] : [KF[1], KF[2]];
    const t = da <= 1 ? da : clamp(da - 1, 0, 1);
    return { size: lerp(a.size, b.size, t), op: lerp(a.op, b.op, t), ls: lerp(a.ls, b.ls, t), blur: lerp(a.blur, b.blur, t) };
  }

  function makeWheel(trackEl, listEl, items, onSelect, startIdx = 0) {
    let cur = startIdx, vo = 0, to = 0, raf = null;
    const N = items.length;
    const H = () => listEl.querySelector('.wheel-item')?.offsetHeight ?? 80;

    function build() {
      listEl.innerHTML = '';
      for (let i = -2; i <= 2; i++) {
        const el = document.createElement('div');
        el.className   = 'wheel-item';
        el.textContent = items[mod(cur + i, N)];
        listEl.appendChild(el);
      }
    }

    function refresh() {
      listEl.querySelectorAll('.wheel-item').forEach((el, i) =>
        el.textContent = items[mod(cur + (i - 2), N)]);
    }

    function paint(px) {
      vo = px;
      listEl.style.transform = `translateY(${px}px)`;
      const h = H();
      listEl.querySelectorAll('.wheel-item').forEach((el, i) => {
        const s = styleAt((i - 2) + px / h);
        el.style.fontSize      = `${s.size}px`;
        el.style.opacity       =  s.op;
        el.style.letterSpacing = `${s.ls}em`;
        el.style.filter        = `blur(${s.blur.toFixed(2)}px)`;
      });
    }

    function tick() {
      vo += (to - vo) * SPRING;
      if (Math.abs(to - vo) < SNAP_THR) {
        cur = mod(cur - Math.round(to / H()), N);
        vo = 0; to = 0;
        paint(0); refresh();
        raf = null; return;
      }
      paint(vo);
      raf = requestAnimationFrame(tick);
    }

    function anim() { if (!raf) raf = requestAnimationFrame(tick); }

    function go(dir) {
      const h = H();
      to = clamp(to + dir * -h, -h * 2, h * 2);
      anim();
    }

    // ── Mouse wheel ──
    let snapTimer = null;
    trackEl.addEventListener('wheel', e => {
      e.preventDefault();
      const h = H();
      to = clamp(to - e.deltaY * (h / 120), -h * 2, h * 2);
      anim();
      clearTimeout(snapTimer);
      snapTimer = setTimeout(() => {
        to = clamp(Math.round(to / h) * h, -h * 2, h * 2);
        anim();
      }, 150);
    }, { passive: false });

    // ── Touch ──
    let ty0 = 0, tv0 = 0, tyL = 0, ttL = 0, vel = 0, drag = false;
    trackEl.addEventListener('touchstart', e => {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      drag = true; ty0 = e.touches[0].clientY; tv0 = vo;
      tyL = ty0; ttL = performance.now(); vel = 0;
    }, { passive: true });
    trackEl.addEventListener('touchmove', e => {
      if (!drag) return;
      const y = e.touches[0].clientY, now = performance.now(), dt = now - ttL;
      if (dt > 0) vel = (y - tyL) / dt * 16;
      tyL = y; ttL = now;
      const h = H();
      paint(clamp(tv0 + (y - ty0), -h * 1.5, h * 1.5));
      to = vo;
    }, { passive: true });
    trackEl.addEventListener('touchend', () => {
      if (!drag) return; drag = false;
      const h = H();
      to = clamp(Math.round((vo + vel * 4) / h) * h, -h * 2, h * 2);
      anim();
    }, { passive: true });

    // ── Click ──
    listEl.addEventListener('click', e => {
      const item = e.target.closest('.wheel-item');
      if (!item) return;
      const pos = [...listEl.querySelectorAll('.wheel-item')].indexOf(item) - 2;
      if (pos === 0) onSelect(items[cur]);
      else go(pos);
    });

    // ── Keyboard (only when parent page is active) ──
    document.addEventListener('keydown', e => {
      if (!trackEl.closest('.page')?.classList.contains('is-active')) return;
      if      (e.key === 'ArrowDown') go(1);
      else if (e.key === 'ArrowUp')   go(-1);
      else if (e.key === 'Enter')     onSelect(items[cur]);
    });

    build(); paint(0);
    return { selected: () => items[cur] };
  }

  /* ═══════════════════════════════════════════════════════
     NAVIGATION
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
     WHEELS
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

  /* ═══════════════════════════════════════════════════════
     PAGE 2 — QUATRE ESCENARIS
  ═══════════════════════════════════════════════════════ */

  const P3_CONTENT = {
    'Català': {
      h1: 'Quatre escenaris,<br>una sola visió.',
      h2: 'Tot el que necessites<br>en un equip.',
      cta: 'Descobreix els espais',
      items: [
        { num:'01', label:'Espai',       desc:'Exclusivitat d\'espais únics' },
        { num:'02', label:'Coordinació', desc:'Acompanyament des del primer dia fins al casament' },
        { num:'03', label:'Cerimònia',   desc:'Muntatge, decoració floral i coordinació' },
        { num:'04', label:'Decoració',   desc:'Menatge de taula i centres florals' },
        { num:'05', label:'Gastronomia', desc:'A escollir entre una extensa varietat' },
        { num:'06', label:'Festa',       desc:'2 hores de barra lliure incloses' },
      ],
    },
    'Español': {
      h1: 'Cuatro escenarios,<br>una sola visión.',
      h2: 'Todo lo que necesitas<br>en un equipo.',
      cta: 'Descubre los espacios',
      items: [
        { num:'01', label:'Espacio',      desc:'Exclusividad de espacios únicos' },
        { num:'02', label:'Coordinación', desc:'Acompañamiento desde el primer día hasta la boda' },
        { num:'03', label:'Ceremonia',    desc:'Montaje, decoración floral y coordinación' },
        { num:'04', label:'Decoración',   desc:'Menaje de mesa y centros florales' },
        { num:'05', label:'Gastronomía',  desc:'A elegir entre una extensa variedad' },
        { num:'06', label:'Fiesta',       desc:'2 horas de barra libre incluidas' },
      ],
    },
    'English': {
      h1: 'Four venues,<br>one vision.',
      h2: 'Everything you need<br>in one team.',
      cta: 'Discover the venues',
      items: [
        { num:'01', label:'Space',        desc:'Exclusivity of unique venues' },
        { num:'02', label:'Coordination', desc:'Support from day one to the wedding' },
        { num:'03', label:'Ceremony',     desc:'Setup, floral decoration and coordination' },
        { num:'04', label:'Decoration',   desc:'Tableware and floral centrepieces' },
        { num:'05', label:'Gastronomy',   desc:'Choose from an extensive variety' },
        { num:'06', label:'Party',        desc:'2 hours of open bar included' },
      ],
    },
  };

  // Styles per distance from active item
  const P3_DIST = [
    { size:120, op:1.00, ls:-.025, blur: 0   },  // 0 — active
    { size: 72, op:0.48, ls:-.015, blur: 2   },  // 1
    { size: 54, op:0.24, ls: .000, blur: 4.5 },  // 2
    { size: 40, op:0.12, ls: .000, blur: 7   },  // 3+
  ];

  // Arc geometry constants
  // 180° maps to screen vertical centre (leftmost point of the circle)
  // Each item step rotates by ARC_STEP degrees along the circle
  const ARC_CENTER = 180;
  const ARC_STEP   = 17;

  let arcPos    = 0;   // continuous float — which item index is at centre
  let arcTarget = 0;
  let arcRaf    = null;
  let p3Built   = false;

  function p3StyleAt(da) {
    const max = P3_DIST.length - 1;
    const i = Math.min(Math.floor(da), max - 1);
    const t = clamp(da - i, 0, 1);
    const a = P3_DIST[i], b = P3_DIST[Math.min(i + 1, max)];
    return { size: lerp(a.size, b.size, t), op: lerp(a.op, b.op, t), ls: lerp(a.ls, b.ls, t), blur: lerp(a.blur, b.blur, t) };
  }

  // arcPaint computes every item's position and style from arcPos each frame
  function arcPaint() {
    const rightEl = document.getElementById('p3-right');
    if (!rightEl) return;
    const W = rightEl.offsetWidth, H = rightEl.offsetHeight;
    const cx = W, cy = H / 2, r = H * 0.45;
    const INFO_W = Math.min(280, W * 0.44);
    const activeIdx = Math.round(arcPos);

    document.querySelectorAll('.p3-item').forEach((el, i) => {
      // Item i sits at an angle offset from centre by (arcPos - i) steps
      const deg = ARC_CENTER + (arcPos - i) * ARC_STEP;
      const rad = deg * Math.PI / 180;
      const x   = cx + r * Math.cos(rad);
      const y   = cy + r * Math.sin(rad);

      el.style.left       = `${x - INFO_W}px`;
      el.style.top        = `${y}px`;
      el.style.visibility = (y >= -H * 0.2 && y <= H * 1.2) ? 'visible' : 'hidden';

      const sty = p3StyleAt(Math.abs(i - arcPos));
      const num = el.querySelector('.p3-item-num');
      num.style.fontSize      = `${sty.size}px`;
      num.style.opacity       =  sty.op;
      num.style.letterSpacing = `${sty.ls}em`;
      el.style.filter         = `blur(${sty.blur.toFixed(2)}px)`;
      el.querySelector('.p3-item-dot').style.opacity = i === activeIdx ? '1' : '0';
      const info = el.querySelector('.p3-item-info');
      i === activeIdx ? info.classList.remove('hidden') : info.classList.add('hidden');
      el.style.cursor        = i === activeIdx ? 'default' : 'pointer';
      el.style.pointerEvents = i === activeIdx ? 'none'    : 'auto';
    });
    const cta = document.getElementById('p3-cta');
    if (cta) cta.classList.add('is-visible');
  }

  function arcTick() {
    arcPos += (arcTarget - arcPos) * SPRING;
    arcPaint();
    if (Math.abs(arcTarget - arcPos) < 0.002) { arcPos = arcTarget; arcRaf = null; return; }
    arcRaf = requestAnimationFrame(arcTick);
  }

  function arcAnim() { if (!arcRaf) arcRaf = requestAnimationFrame(arcTick); }

  function arcMove(dir) {
    const N = document.querySelectorAll('.p3-item').length;
    arcTarget = clamp(arcTarget + dir, 0, N - 1);
    arcAnim();
  }

  const isMobile = () => window.innerWidth <= 1024;

  function playArcHint() {
    if (isMobile()) return;
    let cancelled = false;
    const p2 = document.getElementById('page-2');
    const stop = () => { cancelled = true; };
    p2.addEventListener('wheel',      stop, { once: true, passive: true });
    p2.addEventListener('touchstart', stop, { once: true, passive: true });
    p2.addEventListener('keydown',    stop, { once: true });

    let t0 = null;
    const DURATION = 2200;
    const PEAK_T   = 0.52;
    const PEAK_POS = 2.0;

    function frame(ts) {
      if (cancelled || !p2.classList.contains('is-active')) {
        arcTarget = Math.round(arcPos);
        arcAnim();
        return;
      }
      if (!t0) t0 = ts;
      const t = Math.min((ts - t0) / DURATION, 1);
      let pos;
      if (t < PEAK_T) {
        const u = t / PEAK_T;
        pos = PEAK_POS * (1 - Math.pow(1 - u, 2.2));   // ease-out up
      } else {
        const u = (t - PEAK_T) / (1 - PEAK_T);
        pos = PEAK_POS * Math.pow(1 - u, 2.2);          // ease-in back
      }
      arcPos = pos; arcTarget = pos;
      arcPaint();
      if (t < 1) requestAnimationFrame(frame);
      else { arcPos = 0; arcTarget = 0; arcPaint(); }
    }
    requestAnimationFrame(frame);
  }

  function updateP2Mobile(items, idx) {
    const sl = document.getElementById('p2-mob-slides');
    if (!sl) return;
    sl.style.transition = 'transform 0.32s cubic-bezier(0.25,0.46,0.45,0.94)';
    sl.style.transform  = `translateX(${-idx * 100}%)`;
    const cta = document.getElementById('p2-mob-cta');
    if (cta) cta.classList.add('is-visible');
    document.querySelectorAll('.p2-mob-dot').forEach((d, i) => d.classList.toggle('is-active', i === idx));
  }

  function initPage2() {
    const lang    = sel.language || 'Català';
    const content = P3_CONTENT[lang] || P3_CONTENT['Català'];
    document.getElementById('p3-h1').innerHTML = content.h1;
    document.getElementById('p3-h2').innerHTML = content.h2;
    document.getElementById('p3-cta-label').textContent = content.cta;
    document.getElementById('p3-cta').onclick = () => navigate(3);
    arcPos = 0; arcTarget = 0;
    buildArc(content);
    setTimeout(playArcHint, 550);

    // Mobile swipe layout
    document.getElementById('p2-mob-h1').innerHTML          = content.h1;
    document.getElementById('p2-mob-h2').innerHTML          = content.h2;
    document.getElementById('p2-mob-cta-label').textContent = content.cta;
    document.getElementById('p2-mob-cta').onclick = () => navigate(3);
    const items = content.items || [];
    const slidesEl = document.getElementById('p2-mob-slides');
    slidesEl.innerHTML = '';
    slidesEl.style.transition = '';
    slidesEl.style.transform  = 'translateX(0)';
    items.forEach(item => {
      const slide = document.createElement('div');
      slide.className = 'p2-mob-slide';
      slide.innerHTML = `<div class="p2-mob-slide-label">${item.label}</div><div class="p2-mob-slide-desc">${item.desc}</div>`;
      slidesEl.appendChild(slide);
    });
    const dotsEl = document.getElementById('p2-mob-dots');
    dotsEl.innerHTML = '';
    items.forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 'p2-mob-dot' + (i === 0 ? ' is-active' : '');
      d.onclick = () => { arcTarget = i; arcAnim(); updateP2Mobile(items, i); };
      dotsEl.appendChild(d);
    });
    updateP2Mobile(items, 0);

    if (!p3Built) {
      const p3El = document.getElementById('page-2');
      let arcSnapTimer = null;
      p3El.addEventListener('wheel', e => {
        e.preventDefault();
        const N = document.querySelectorAll('.p3-item').length;
        arcTarget = clamp(arcTarget + e.deltaY / 120, 0, N - 1);
        arcAnim();
        clearTimeout(arcSnapTimer);
        arcSnapTimer = setTimeout(() => {
          arcTarget = Math.round(arcTarget);
          arcAnim();
          if (isMobile()) updateP2Mobile(items, Math.round(arcTarget));
        }, 150);
      }, { passive: false });

      let arcTx0 = 0, arcTy0 = 0, arcDrag = false, arcDragAxis = null;
      p3El.addEventListener('touchstart', e => {
        arcDrag = true; arcDragAxis = null;
        arcTx0 = e.touches[0].clientX;
        arcTy0 = e.touches[0].clientY;
        if (isMobile()) {
          const sl = document.getElementById('p2-mob-slides');
          if (sl) sl.style.transition = '';
        }
      }, { passive: true });
      p3El.addEventListener('touchmove', e => {
        if (!arcDrag) return;
        const dx = e.touches[0].clientX - arcTx0;
        const dy = e.touches[0].clientY - arcTy0;
        if (isMobile()) {
          // Determine axis on first significant move
          if (!arcDragAxis && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
            arcDragAxis = Math.abs(dx) >= Math.abs(dy) ? 'h' : 'v';
          }
          if (arcDragAxis === 'h') {
            e.preventDefault();
            const sl = document.getElementById('p2-mob-slides');
            if (sl) {
              const idx = Math.round(arcTarget);
              const N = items.length;
              const rubber = (idx === 0 && dx > 0) || (idx === N - 1 && dx < 0);
              const offset = rubber ? dx * 0.22 : dx;
              sl.style.transform = `translateX(calc(${-idx * 100}% + ${offset}px))`;
            }
          }
        } else {
          if (Math.abs(dy) >= 60) { arcMove(dy < 0 ? 1 : -1); arcTy0 = e.touches[0].clientY; }
        }
      }, { passive: false });
      p3El.addEventListener('touchend', e => {
        if (!arcDrag) { return; }
        arcDrag = false;
        if (isMobile() && arcDragAxis === 'h') {
          const dx = (e.changedTouches[0]?.clientX ?? arcTx0) - arcTx0;
          if (Math.abs(dx) > 36) {
            arcTarget = clamp(Math.round(arcTarget) + (dx < 0 ? 1 : -1), 0, items.length - 1);
            arcAnim();
          }
          updateP2Mobile(items, Math.round(arcTarget));
        }
        arcDragAxis = null;
      });
      document.addEventListener('keydown', e => {
        if (!document.getElementById('page-2').classList.contains('is-active')) return;
        if      (e.key === 'ArrowDown' || e.key === 'ArrowRight') { arcMove(1);  if (isMobile()) updateP2Mobile(items, Math.round(arcTarget)); }
        else if (e.key === 'ArrowUp'   || e.key === 'ArrowLeft')  { arcMove(-1); if (isMobile()) updateP2Mobile(items, Math.round(arcTarget)); }
      });
      window.addEventListener('resize', () => {
        const l = sel.language || 'Català';
        buildArc(P3_CONTENT[l] || P3_CONTENT['Català']);
      });
      p3Built = true;
    }
  }

  function buildArc(content) {
    const rightEl = document.getElementById('p3-right');
    const W = rightEl.offsetWidth, H = rightEl.offsetHeight;
    const cx = W, cy = H / 2, r = H * 0.45;
    const INFO_W = Math.min(280, W * 0.44);

    function degToXY(deg) {
      const rad = deg * Math.PI / 180;
      return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
    }

    // Static arc line — runs from near top to near bottom of viewport through 180°
    const svg = document.getElementById('p3-svg');
    svg.innerHTML = '';
    const s = degToXY(250), e = degToXY(110);
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'rgba(255,255,255,0.15)');
    path.setAttribute('stroke-width', '1');
    // sweep=0 counterclockwise: 250° → 180° → 110°, the left-side arc
    path.setAttribute('d', `M ${s.x} ${s.y} A ${r} ${r} 0 0 0 ${e.x} ${e.y}`);
    svg.appendChild(path);

    // Build item DOM — positions are set by arcPaint() each frame
    const container = document.getElementById('p3-items');
    container.innerHTML = '';
    for (let i = 0; i < content.items.length; i++) {
      const item = document.createElement('div');
      item.className = 'p3-item';

      const info = document.createElement('div');
      info.className = 'p3-item-info hidden';
      info.style.width = `${INFO_W}px`;

      const lbl = document.createElement('div');
      lbl.className = 'p3-item-label';
      lbl.textContent = content.items[i].label;

      const dsc = document.createElement('div');
      dsc.className = 'p3-item-desc';
      dsc.textContent = content.items[i].desc;

      info.append(lbl, dsc);

      const num = document.createElement('div');
      num.className = 'p3-item-num';
      num.textContent = content.items[i].num;

      const dot = document.createElement('div');
      dot.className = 'p3-item-dot';

      item.append(info, num, dot);
      const idx = i;
      item.addEventListener('click', () => {
        arcTarget = idx;
        arcAnim();
      });
      container.appendChild(item);
    }

    arcPaint();
  }

  /* ═══════════════════════════════════════════════════════
     PAGE 3 — ESCOLLIR ESPAI
  ═══════════════════════════════════════════════════════ */

  const P4_CONTENT = {
    'Català': {
      labels: { essencia: 'Essència', capacitat: 'Capacitat', ubicacio: 'Ubicació' },
      venues: [
        { name: 'can macià',       img: 'https://uauu.cat/media/fotos/finques/can-macia.webp',
          essencia: 'Finca situada en plena natura, envoltada entre vinyes i ametllers.',
          capacitat: 'Fins a 250 convidats.',
          ubicacio:  'Òdena, a 40 minuts de Barcelona.' },
        { name: "ca n'alzina",     img: 'https://uauu.cat/media/fotos/finques/ca-n-alzina.webp',
          essencia: 'Masia en un entorn natural privilegiat, i unes vistes espectaculars a la Serra de Rubió.',
          capacitat: 'Fins a 250 convidats.',
          ubicacio:  'Rubió, a 45 minuts de Barcelona.' },
        { name: 'castell de tous', img: 'https://uauu.cat/media/fotos/finques/castell-de-tous.webp',
          essencia: "Un escenari de conte, un castell històric rehabilitat amb més de 1000 anys d'història.",
          capacitat: 'Fins a 140 convidats.',
          ubicacio:  'Sant Martí de Tous, a 50 minuts de Barcelona.' },
        { name: 'mas vivencs',     img: 'https://uauu.cat/media/fotos/finques/mas-vivencs.webp',
          essencia: 'Casa del segle XVII envoltada de frondosos jardins.',
          capacitat: 'Fins a 250 convidats.',
          ubicacio:  'La Pobla de Claramunt, a 45 minuts de Barcelona.' },
      ],
    },
    'Español': {
      labels: { essencia: 'Esencia', capacitat: 'Capacidad', ubicacio: 'Ubicación' },
      venues: [
        { name: 'can macià',       img: 'https://uauu.cat/media/fotos/finques/can-macia.webp',
          essencia: 'Finca situada en plena naturaleza, rodeada de viñas y almendros.',
          capacitat: 'Hasta 250 invitados.',
          ubicacio:  'Òdena, a 40 minutos de Barcelona.' },
        { name: "ca n'alzina",     img: 'https://uauu.cat/media/fotos/finques/ca-n-alzina.webp',
          essencia: 'Masía en un entorno natural privilegiado, con vistas espectaculares a la Serra de Rubió.',
          capacitat: 'Hasta 250 invitados.',
          ubicacio:  'Rubió, a 45 minutos de Barcelona.' },
        { name: 'castell de tous', img: 'https://uauu.cat/media/fotos/finques/castell-de-tous.webp',
          essencia: 'Un escenario de cuento, un castillo histórico rehabilitado con más de 1000 años de historia.',
          capacitat: 'Hasta 140 invitados.',
          ubicacio:  'Sant Martí de Tous, a 50 minutos de Barcelona.' },
        { name: 'mas vivencs',     img: 'https://uauu.cat/media/fotos/finques/mas-vivencs.webp',
          essencia: 'Casa del siglo XVII rodeada de frondosos jardines.',
          capacitat: 'Hasta 250 invitados.',
          ubicacio:  'La Pobla de Claramunt, a 45 minutos de Barcelona.' },
      ],
    },
    'English': {
      labels: { essencia: 'Essence', capacitat: 'Capacity', ubicacio: 'Location' },
      venues: [
        { name: 'can macià',       img: 'https://uauu.cat/media/fotos/finques/can-macia.webp',
          essencia: 'Estate in the heart of nature, surrounded by vineyards and almond trees.',
          capacitat: 'Up to 250 guests.',
          ubicacio:  'Òdena, 40 minutes from Barcelona.' },
        { name: "ca n'alzina",     img: 'https://uauu.cat/media/fotos/finques/ca-n-alzina.webp',
          essencia: 'Farmhouse in a privileged natural setting, with spectacular views of the Serra de Rubió.',
          capacitat: 'Up to 250 guests.',
          ubicacio:  'Rubió, 45 minutes from Barcelona.' },
        { name: 'castell de tous', img: 'https://uauu.cat/media/fotos/finques/castell-de-tous.webp',
          essencia: 'A fairytale setting — a historic castle restored with over 1,000 years of history.',
          capacitat: 'Up to 140 guests.',
          ubicacio:  'Sant Martí de Tous, 50 minutes from Barcelona.' },
        { name: 'mas vivencs',     img: 'https://uauu.cat/media/fotos/finques/mas-vivencs.webp',
          essencia: '17th-century house surrounded by lush gardens.',
          capacitat: 'Up to 250 guests.',
          ubicacio:  'La Pobla de Claramunt, 45 minutes from Barcelona.' },
      ],
    },
  };

  function initPage3() {
    const lang    = sel.language || 'Català';
    const content = P4_CONTENT[lang] || P4_CONTENT['Català'];
    const { labels, venues } = content;

    // Set translatable labels
    document.getElementById('p4-lbl-essencia').textContent = labels.essencia;
    document.getElementById('p4-lbl-capacitat').textContent = labels.capacitat;
    document.getElementById('p4-lbl-ubicacio').textContent  = labels.ubicacio;

    // Reset visual state
    const img  = document.getElementById('p4-img');
    const info = document.getElementById('p4-info');
    img.classList.remove('is-visible');
    info.classList.remove('is-visible');

    // Preload images
    venues.forEach(v => { const i = new Image(); i.src = v.img; });

    // Build venue list
    const listEl = document.getElementById('p4-list');
    listEl.innerHTML = '';
    listEl.classList.remove('has-hover');

    venues.forEach((v, i) => {
      const item = document.createElement('div');
      item.className = 'p4-item';
      item.dataset.idx = i;
      item.textContent = v.name;
      listEl.appendChild(item);
    });

    listEl.addEventListener('click', e => {
      const item = e.target.closest('.p4-item');
      if (!item) return;
      sel.venueIdx = parseInt(item.dataset.idx);
      sel.itemIdx = 0;
      navigate(4);
    });

    let activeIdx = -1;

    listEl.onmousemove = e => {
      const items = [...listEl.querySelectorAll('.p4-item')];
      const TOL = 6;
      let newIdx = -1;
      for (let j = 0; j < items.length; j++) {
        const r = items[j].getBoundingClientRect();
        if (e.clientY >= r.top - TOL && e.clientY <= r.bottom + TOL) { newIdx = j; break; }
      }
      if (newIdx === -1 || newIdx === activeIdx) return;
      activeIdx = newIdx;
      const v = venues[newIdx];
      items.forEach(el => el.classList.remove('is-active'));
      items[newIdx].classList.add('is-active');
      listEl.classList.add('has-hover');
      img.src = v.img;
      img.classList.add('is-visible');
      document.getElementById('p4-val-essencia').textContent = v.essencia;
      document.getElementById('p4-val-capacitat').textContent = v.capacitat;
      document.getElementById('p4-val-ubicacio').textContent  = v.ubicacio;
      info.classList.add('is-visible');
    };

    listEl.onmouseleave = () => {
      activeIdx = -1;
      listEl.querySelectorAll('.p4-item').forEach(el => el.classList.remove('is-active'));
      listEl.classList.remove('has-hover');
      img.classList.remove('is-visible');
      info.classList.remove('is-visible');
    };

    // Mobile: vertical venue cards
    const mobCards = document.getElementById('p3-mob-cards');
    mobCards.innerHTML = '';
    venues.forEach((v, i) => {
      const card = document.createElement('div');
      card.className = 'p3-mob-card';
      const cardImg = document.createElement('img');
      cardImg.src = v.img; cardImg.alt = v.name; cardImg.loading = 'lazy';
      const overlay = document.createElement('div');
      overlay.className = 'p3-mob-card-overlay';
      const nameEl = document.createElement('div');
      nameEl.className = 'p3-mob-card-name';
      nameEl.textContent = v.name;
      const capEl = document.createElement('div');
      capEl.className = 'p3-mob-card-cap';
      capEl.textContent = v.capacitat;
      overlay.appendChild(nameEl);
      overlay.appendChild(capEl);
      card.appendChild(cardImg);
      card.appendChild(overlay);
      card.onclick = () => { sel.venueIdx = i; sel.itemIdx = 0; navigate(4); };
      mobCards.appendChild(card);
    });
    attachScrollHide(document.getElementById('p3-mob-cards'));
  }
  /* ═══════════════════════════════════════════════════════
     VENUE DATA
  ═══════════════════════════════════════════════════════ */

  const VENUE_TITLES = [
    'Can<br>Macià',
    "Ca<br>n'Alzina",
    'Castell<br>de Tous',
    'Mas<br>Vivencs',
  ];

  const VENUE_NAMES = [
    'Can Macià',
    "Ca n'Alzina",
    'Castell de Tous',
    'Mas Vivencs',
  ];

  // Shared preu del menú footnote content per venue
  function preusNotes(finca) {
    const notes = {
      'can-macia':      ['En cas de voler fer el casament en una data on no s\'arriba al mínim de convidats adults es cobrarà 75,00€ per persona fins al mínim requerit segons data.', 'Possibilitat de realitzar banquet exterior amb un cost de 10,00€ / convidat (mínim 1500€)'],
      'can-alzina':     ['En cas de voler fer el casament en una data on no s\'arriba al mínim de convidats adults es cobrarà 75,00€ per persona fins al mínim requerit segons data.', "Possibilitat de realitzar l'aperitiu al jardí de la masia, amb un suplement de 10,00€ / convidat (mínim 1000€)"],
      'castell-tous':   ['En cas de voler fer el casament en una data on no s\'arriba al mínim de convidats adults es cobrarà 100,00€ per persona fins al mínim requerit segons data.', 'Opció de banquet exterior: suplement de 2500€'],
      'mas-vivencs':    ['En cas de voler fer el casament en una data on no s\'arriba al mínim de convidats adults es cobrarà 75,00€ per persona fins al mínim requerit segons data.'],
    };
    return notes[finca];
  }

  // Item label sets (CA/ES/EN)
  const ITEM_LABELS = {
    cerimonia:  { 'Català': 'cerimònia',                  'Español': 'ceremonia',                    'English': 'ceremony' },
    menu:       { 'Català': "què inclou el menú",         'Español': 'qué incluye el menú',          'English': "what's included" },
    preus:      { 'Català': 'preu del menú',              'Español': 'precio del menú',              'English': 'menu pricing' },
    quota:      { 'Català': 'quota de serveis essencials','Español': 'cuota de servicios esenciales','English': 'essential services' },
    dj:         { 'Català': 'servei de dj',               'Español': 'servicio de dj',               'English': 'DJ service' },
    allotjament:{ 'Català': 'allotjament',                'Español': 'alojamiento',                  'English': 'accommodation' },
    suite:      { 'Català': 'allotjament',                'Español': 'alojamiento',                  'English': 'accommodation' },
    galeria:    { 'Català': "galeria d'imatges",          'Español': 'galería de imágenes',          'English': 'image gallery' },
    ubicacio:   { 'Català': 'ubicació',                   'Español': 'ubicación',                    'English': 'location' },
    reserva:    { 'Català': 'reservar visita presencial', 'Español': 'reservar visita presencial',   'English': 'book a visit' },
    cataleg:    { 'Català': 'catàleg complert',           'Español': 'catálogo completo',             'English': 'full catalogue' },
  };

  // Standard item title (right panel) — multilingual
  const ITEM_TITLES = {
    cerimonia:   { 'Català':'Cerimònia',                   'Español':'Ceremonia',                    'English':'Ceremony' },
    menu:        { 'Català':'Què inclou el menú?',          'Español':'¿Qué incluye el menú?',        'English':"What's included?" },
    preus:       { 'Català':'Preu del menú',               'Español':'Precio del menú',              'English':'Menu pricing' },
    quota:       { 'Català':'Quota de serveis essencials', 'Español':'Cuota de servicios esenciales','English':'Essential services fee' },
    dj:          { 'Català':'Servei de DJ',                'Español':'Servicio de DJ',               'English':'DJ service' },
    allotjament: { 'Català':'Allotjament',                 'Español':'Alojamiento',                  'English':'Accommodation' },
    suite:       { 'Català':'Allotjament',                 'Español':'Alojamiento',                  'English':'Accommodation' },
    galeria:     { 'Català':"Galeria d'imatges",           'Español':'Galería de imágenes',          'English':'Image gallery' },
    ubicacio:    { 'Català':'Com arribar-hi',              'Español':'Cómo llegar',                  'English':'Getting there' },
  };

  const MANDATORY_KEYS = new Set(['quota', 'dj']);
  const MANDATORY_LABEL = { 'Català': 'Imprescindible', 'Español': 'Imprescindible', 'English': 'Essential' };

  const VENUE_INTRO = {
    'Català': 'Descobreix la proposta de',
    'Español': 'Descubre la propuesta de',
    'English': 'Discover the proposal of',
  };

  const CERIMONIA_PREFIX = {
    //                      Can Macià              Ca n'Alzina            Castell de Tous        Mas Vivencs
    'Català':  ['La cerimònia de',  'La cerimònia de',  'La cerimònia del', 'La cerimònia de'],
    'Español': ['La ceremonia de',  'La ceremonia de',  'La ceremonia del', 'La ceremonia de'],
    'English': ['The ceremony at',  'The ceremony at',  'The ceremony at',  'The ceremony at'],
  };

  function itemTitle(item, lang) {
    if (item.key === 'cerimonia') {
      const prefixes = CERIMONIA_PREFIX[lang] || CERIMONIA_PREFIX['Català'];
      const prefix = prefixes[sel.venueIdx ?? 0] ?? prefixes[0];
      return `${prefix} ${VENUE_NAMES[sel.venueIdx ?? 0]}`;
    }
    return (ITEM_TITLES[item.key] || {})[lang] || (ITEM_TITLES[item.key] || {})['Català'] || item.key;
  }

  // UI strings for preus panel
  const PREUS_UI = {
    'Català':  { date:'Data',  min:'Mín.',  price:'Preu/p.',    dis:'Dissabtes', div:'Divendres', diu:'Diumenges', dll:'Dll–Dij' },
    'Español': { date:'Fecha', min:'Mín.',  price:'Precio/p.',  dis:'Sábados',   div:'Viernes',   diu:'Domingos',  dll:'Lun–Jue' },
    'English': { date:'Date',  min:'Min.',  price:'Price/p.',   dis:'Saturdays', div:'Fridays',   diu:'Sundays',   dll:'Mon–Thu' },
  };

  // Maps button label
  const MAPS_BTN = { 'Català':'Com arribar-hi', 'Español':'Cómo llegar', 'English':'Getting there' };

  // Catalogue PDF URLs per venue index, year and language
  const CATALEG_URLS = {
    0: { // Can Macià
      '2026': { 'Català': 'https://drive.google.com/file/d/1LDVu9t_vv71nwCAautXGtXVKzAQQiPtc/view?usp=drive_link', 'Español': 'https://drive.google.com/file/d/1omL_4k2vrKsvxsuZD7hTxD4pVNH1MT41/view?usp=drive_link', 'English': 'https://drive.google.com/file/d/1eJ5FV16dCFiKtSQQ_7mwBd5OEMTbBiAN/view?usp=drive_link' },
      '2027': { 'Català': 'https://drive.google.com/file/d/1Wntl4PdsY60KAkj82vavVkig4Lpwwv-q/view?usp=drive_link', 'Español': 'https://drive.google.com/file/d/1Vb_nRlh9_x9QHiQiGLSvBWyGQcy3swqI/view?usp=drive_link', 'English': 'https://drive.google.com/file/d/1uSnO6md3JorBFhSHOno6-lwYOUkL8npB/view?usp=drive_link' },
    },
    1: { // Ca n'Alzina
      '2026': { 'Català': 'https://drive.google.com/file/d/1XU9TzOWgtJSHZK5oGNITwEvT7oImfgUg/view?usp=drive_link', 'Español': 'https://drive.google.com/file/d/1rMNZCzk91L1ld-TRwann1QpRCaOaSgyy/view?usp=drive_link', 'English': 'https://drive.google.com/file/d/1k5cvBkbRwYTVPvreP5FyzLZdDM7W95Ir/view?usp=drive_link' },
      '2027': { 'Català': 'https://drive.google.com/file/d/1Aq8k_LDGqwb1yxq8Mr6Np4_pSSK5MUqc/view?usp=drive_link', 'Español': 'https://drive.google.com/file/d/1atYq851ZqJKA0wgrE29PyRUrc4Jf9ziF/view?usp=drive_link', 'English': 'https://drive.google.com/file/d/1Fw3A6rjn--YYkpuj4zJKW4H49WxU2DKf/view?usp=drive_link' },
    },
    2: { // Castell de Tous
      '2026': { 'Català': 'https://drive.google.com/file/d/10W7PuAUqL75OnNNO6wzeThfYkrXkz7LH/view?usp=drive_link', 'Español': 'https://drive.google.com/file/d/10c7qHpVdysD9pCTnsgXEF9f2QyGDx15p/view?usp=drive_link', 'English': 'https://drive.google.com/file/d/1le5vZF1a9zgu57nfNhdIyeQPABw9wmLr/view?usp=drive_link' },
      '2027': { 'Català': 'https://drive.google.com/file/d/1uy4In96kfkLItaBPI8hL92t5Aq5sdMJa/view?usp=drive_link', 'Español': 'https://drive.google.com/file/d/1U8BvKgRAN_YiTlMaGYNOTiib1LD-GdTH/view?usp=drive_link', 'English': 'https://drive.google.com/file/d/1qRF5p48M5Uytyd3B-6AKB1rZDUJ0y_mY/view?usp=drive_link' },
    },
    3: { // Mas Vivencs
      '2026': { 'Català': 'https://drive.google.com/file/d/1h8msU4C4BnK9s_6PzO0MAp1tVLpWqNvF/view?usp=drive_link', 'Español': 'https://drive.google.com/file/d/1WYNaDLhNDWT5rz3vG3Xp7Lqvt1VSTxA6/view?usp=drive_link', 'English': 'https://drive.google.com/file/d/1lKau7JDcvNXazHSa_JyrKRQqam9ixg2C/view?usp=drive_link' },
      '2027': { 'Català': 'https://drive.google.com/file/d/13LsdX1Y4ZekZ-nYdziZwM02IhmEWM8su/view?usp=drive_link', 'Español': 'https://drive.google.com/file/d/1HxMjzSgSNvBOybxmwlMHABoOSfNB-82z/view?usp=drive_link', 'English': 'https://drive.google.com/file/d/1vkcaI4FFu9EA-6RhHw5Js9nT1-mrYxVw/view?usp=drive_link' },
    },
  };

  function getCatalegUrl() {
    const venueIdx = sel.venueIdx ?? 0;
    const year = sel.year || '2027';
    const lang = sel.language || 'Català';
    return CATALEG_URLS[venueIdx]?.[year]?.[lang] || null;
  }

  // Feature string translations (key = CA string)
  const FEAT_TRANS = {
    'Español': {
      'Muntatge de cadires':                                        'Montaje de sillas',
      'Decoració floral':                                           'Decoración floral',
      'Música i DJ amb megafonia':                                  'Música y DJ con megafonía',
      'Habitació per canviar-se la núvia o nuvi':                   'Habitación para cambiarse la novia o el novio',
      'Welcome drink':                                              'Welcome drink',
      'Possibilitat de celebrar cerimònia religiosa':               'Posibilidad de celebrar ceremonia religiosa',
      'Arc floral':                                                 'Arco floral',
      'Pack de pètals':                                             'Pack de pétalos',
      'Paquet de pètals':                                           'Pack de pétalos',
      'Aperitiu a escollir':                                        'Aperitivo a elegir',
      'Barra de begudes':                                           'Barra de bebidas',
      'Plat principal':                                             'Plato principal',
      'Pre postre':                                                 'Pre postre',
      'Pastís de noces':                                            'Tarta nupcial',
      '2 hores de barra lliure':                                    '2 horas de barra libre',
      'Centres florals de taula':                                   'Centros florales de mesa',
      'Menatge de taula a seleccionar':                             'Menaje de mesa a seleccionar',
      'Papereria (minutes, sitting plan, marca llocs)':             'Papelería (minutas, sitting plan, marca sitios)',
      'Coordinació del casament':                                   'Coordinación de la boda',
      "Exclusivitat de l'espai durant el casament":                 'Exclusividad del espacio durante la boda',
      'Assistència al Pre Wedding Day pels nuvis':                  'Asistencia al Pre Wedding Day para los novios',
      'Menú de tast pels nuvis':                                    'Menú de degustación para los novios',
      'Sitting Plan':                                               'Sitting Plan',
      'Papereria (minutes i marca llocs)':                          'Papelería (minutas y marca sitios)',
      "Servei de neteja durant l'esdeveniment":                     'Servicio de limpieza durante el evento',
      "Música des de l'aperitiu fins al final de la festa":         'Música desde el aperitivo hasta el final de la fiesta',
      'Reunió prèvia al casament per acordar tota la selecció musical': 'Reunión previa a la boda para acordar toda la selección musical',
      'Servei de pantalla i projecció':                             'Servicio de pantalla y proyección',
      'Sopar del DJ':                                               'Cena del DJ',
      'Allotjament complert fins a 15 persones':                    'Alojamiento completo para hasta 15 personas',
      'Allotjament complert fins a 21 persones':                    'Alojamiento completo para hasta 21 personas',
      "Inclou l'esmorzar de l'endemà":                              'Incluye el desayuno del día siguiente',
      'Sortida a les 11:30h':                                       'Salida a las 11:30h',
      'Allotjament per la parella':                                 'Alojamiento para la pareja',
      "Inclou l'esmorzar de l'endemà (sortida a les 11:30h)":       'Incluye el desayuno del día siguiente (salida a las 11:30h)',
    },
    'English': {
      'Muntatge de cadires':                                        'Chair setup',
      'Decoració floral':                                           'Floral decoration',
      'Música i DJ amb megafonia':                                  'Music & DJ with sound system',
      'Habitació per canviar-se la núvia o nuvi':                   'Dressing room for the bride or groom',
      'Welcome drink':                                              'Welcome drink',
      'Possibilitat de celebrar cerimònia religiosa':               'Option to hold a religious ceremony',
      'Arc floral':                                                 'Floral arch',
      'Pack de pètals':                                             'Petal pack',
      'Paquet de pètals':                                           'Petal pack',
      'Aperitiu a escollir':                                        'Cocktail hour of your choice',
      'Barra de begudes':                                           'Open bar',
      'Plat principal':                                             'Main course',
      'Pre postre':                                                 'Pre-dessert',
      'Pastís de noces':                                            'Wedding cake',
      '2 hores de barra lliure':                                    '2 hours of open bar',
      'Centres florals de taula':                                   'Table floral centrepieces',
      'Menatge de taula a seleccionar':                             'Tableware of your choice',
      'Papereria (minutes, sitting plan, marca llocs)':             'Stationery (menu cards, seating plan, place cards)',
      'Coordinació del casament':                                   'Wedding coordination',
      "Exclusivitat de l'espai durant el casament":                 'Exclusive use of the venue on your wedding day',
      'Assistència al Pre Wedding Day pels nuvis':                  'Pre Wedding Day attendance for the couple',
      'Menú de tast pels nuvis':                                    'Tasting menu for the couple',
      'Sitting Plan':                                               'Seating plan',
      'Papereria (minutes i marca llocs)':                          'Stationery (menu cards & place cards)',
      "Servei de neteja durant l'esdeveniment":                     'Cleaning service during the event',
      "Música des de l'aperitiu fins al final de la festa":         'Music from the cocktail hour to the end of the party',
      'Reunió prèvia al casament per acordar tota la selecció musical': 'Pre-wedding meeting to agree on the full music selection',
      'Servei de pantalla i projecció':                             'Screen & projection service',
      'Sopar del DJ':                                               "DJ's dinner",
      'Allotjament complert fins a 15 persones':                    'Full accommodation for up to 15 guests',
      'Allotjament complert fins a 21 persones':                    'Full accommodation for up to 21 guests',
      "Inclou l'esmorzar de l'endemà":                              'Includes breakfast the following morning',
      'Sortida a les 11:30h':                                       'Check-out at 11:30am',
      'Allotjament per la parella':                                 'Accommodation for the couple',
      "Inclou l'esmorzar de l'endemà (sortida a les 11:30h)":       'Includes breakfast the following morning (check-out at 11:30am)',
    },
  };

  // Note string translations (key = CA string)
  const NOTE_TRANS = {
    'Español': {
      '*El preu de la cerimònia no inclou cerimoniant':   '*El precio de la ceremonia no incluye oficiant',
      '*No inclou taxes SGAE i AGEDI':                    '*No incluye tasas SGAE y AGEDI',
      '*Obligatori en dissabtes de Maig a Octubre':       '*Obligatorio en sábados de Mayo a Octubre',
    },
    'English': {
      '*El preu de la cerimònia no inclou cerimoniant':   '*Ceremony price does not include an officiant',
      '*No inclou taxes SGAE i AGEDI':                    '*Does not include SGAE and AGEDI fees',
      '*Obligatori en dissabtes de Maig a Octubre':       '*Mandatory on Saturdays from May to October',
    },
  };

  // Preus date string translations (key = CA string)
  const PREUSDATE_TRANS = {
    'Español': {
      'Dissabtes de Juny, Juliol, Setembre i Octubre':                                               'Sábados de Junio, Julio, Septiembre y Octubre',
      'Dissabtes de Maig, Agost i Novembre':                                                         'Sábados de Mayo, Agosto y Noviembre',
      "Dissabtes d'Abril":                                                                            'Sábados de Abril',
      "Dissabtes de Gener, Febrer, Març i Desembre (excepte cap d'any)":                             'Sábados de Enero, Febrero, Marzo y Diciembre (excepto Nochevieja)',
      'Divendres de Juny, Juliol, Setembre i Octubre':                                               'Viernes de Junio, Julio, Septiembre y Octubre',
      'Divendres de Maig i Agost':                                                                    'Viernes de Mayo y Agosto',
      'Divendres de Gener, Febrer, Març, Abril, Novembre i Desembre':                                'Viernes de Enero, Febrero, Marzo, Abril, Noviembre y Diciembre',
      "Tots els diumenges de l'any (excepte vigílies de festiu)":                                    'Todos los domingos del año (excepto vísperas de festivo)',
      "Tots els Dilluns – Dijous de l'any (excepte festius o vigílies de festiu)":                   'Todos los lunes – jueves del año (excepto festivos o vísperas de festivo)',
    },
    'English': {
      'Dissabtes de Juny, Juliol, Setembre i Octubre':                                               'Saturdays in June, July, September & October',
      'Dissabtes de Maig, Agost i Novembre':                                                         'Saturdays in May, August & November',
      "Dissabtes d'Abril":                                                                            'Saturdays in April',
      "Dissabtes de Gener, Febrer, Març i Desembre (excepte cap d'any)":                             "Saturdays in January, February, March & December (except New Year's Eve)",
      'Divendres de Juny, Juliol, Setembre i Octubre':                                               'Fridays in June, July, September & October',
      'Divendres de Maig i Agost':                                                                    'Fridays in May & August',
      'Divendres de Gener, Febrer, Març, Abril, Novembre i Desembre':                                'Fridays in January, February, March, April, November & December',
      "Tots els diumenges de l'any (excepte vigílies de festiu)":                                    'All Sundays of the year (except eves of public holidays)',
      "Tots els Dilluns – Dijous de l'any (excepte festius o vigílies de festiu)":                   'All Monday – Thursday (except public holidays or eves thereof)',
    },
  };

  // Preus footnote translations (key = CA string)
  const PREUSNOTE_TRANS = {
    'Español': {
      "En cas de voler fer el casament en una data on no s'arriba al mínim de convidats adults es cobrarà 75,00€ per persona fins al mínim requerit segons data.":
        'En caso de querer celebrar la boda en una fecha en la que no se alcanza el mínimo de invitados adultos, se cobrará 75,00€ por persona hasta el mínimo requerido según la fecha.',
      "En cas de voler fer el casament en una data on no s'arriba al mínim de convidats adults es cobrarà 100,00€ per persona fins al mínim requerit segons data.":
        'En caso de querer celebrar la boda en una fecha en la que no se alcanza el mínimo de invitados adultos, se cobrará 100,00€ por persona hasta el mínimo requerido según la fecha.',
      'Possibilitat de realitzar banquet exterior amb un cost de 10,00€ / convidat (mínim 1500€)':
        'Posibilidad de realizar el banquete en exterior con un coste de 10,00€ / invitado (mínimo 1.500€)',
      "Possibilitat de realitzar l'aperitiu al jardí de la masia, amb un suplement de 10,00€ / convidat (mínim 1000€)":
        'Posibilidad de realizar el aperitivo en el jardín de la masía, con un suplemento de 10,00€ / invitado (mínimo 1.000€)',
      'Opció de banquet exterior: suplement de 2500€':
        'Opción de banquete exterior: suplemento de 2.500€',
    },
    'English': {
      "En cas de voler fer el casament en una data on no s'arriba al mínim de convidats adults es cobrarà 75,00€ per persona fins al mínim requerit segons data.":
        'If the wedding takes place on a date where the minimum number of adult guests is not met, €75.00 per person will be charged up to the required minimum for that date.',
      "En cas de voler fer el casament en una data on no s'arriba al mínim de convidats adults es cobrarà 100,00€ per persona fins al mínim requerit segons data.":
        'If the wedding takes place on a date where the minimum number of adult guests is not met, €100.00 per person will be charged up to the required minimum for that date.',
      'Possibilitat de realitzar banquet exterior amb un cost de 10,00€ / convidat (mínim 1500€)':
        'Option to hold an outdoor banquet at a cost of €10.00 / guest (minimum €1,500)',
      "Possibilitat de realitzar l'aperitiu al jardí de la masia, amb un suplement de 10,00€ / convidat (mínim 1000€)":
        'Option to hold the cocktail hour in the farmhouse garden, with a supplement of €10.00 / guest (minimum €1,000)',
      'Opció de banquet exterior: suplement de 2500€':
        'Outdoor banquet option: supplement of €2,500',
    },
  };

  const IMG = 'https://uauu.cat/media/fotos/finques/';

  const _GAST_BASE = 'https://uauu.cat/media/general/gastronomia/';
  const _GAST = Array.from({ length: 17 }, (_, i) => _GAST_BASE + (i + 1) + '.webp');
  const gastImgs = () => _GAST;

  // Ca n'Alzina specific image arrays
  const _CNA_CERIM = Array.from({ length: 13 }, (_, i) => 'https://uauu.cat/media/finques/ca-n-alzina/cerimonia/' + (i + 3) + '.webp');

  const _CNA_ALLOT = Array.from({ length: 13 }, (_, i) => 'https://uauu.cat/media/finques/ca-n-alzina/allotjament/' + (i + 1) + '.webp');

  // Ca n'Alzina galeria
  const _CNA_GAL = Array.from({ length: 50 }, (_, i) => i + 1).filter(n => n !== 44).map(n => 'https://uauu.cat/media/finques/ca-n-alzina/galeria-dimatges/' + n + '.webp');

  // Can Macià allotjament
  const _CM_ALLOT = Array.from({ length: 18 }, (_, i) => 'https://uauu.cat/media/finques/can-macia/allotjament/' + (i + 1) + '.webp');

  // Can Macià cerimònia
  const _CM_CERIM = Array.from({ length: 17 }, (_, i) => i + 1).filter(n => n !== 2).map(n => 'https://uauu.cat/media/finques/can-macia/cerimonia/' + n + '.webp');

  // Can Macià galeria
  const _CM_GAL = Array.from({ length: 50 }, (_, i) => i + 1).filter(n => n !== 3).map(n => 'https://uauu.cat/media/finques/can-macia/galeria-dimatges/' + n + '.webp');

  // Castell de Tous cerimònia
  const _CDT_CERIM = Array.from({ length: 17 }, (_, i) => i + 1).filter(n => n !== 2).map(n => 'https://uauu.cat/media/finques/castell-de-tous/cerimonia/' + n + '.webp');

  // Castell de Tous galeria
  const _CDT_GAL = Array.from({ length: 49 }, (_, i) => i + 1).filter(n => n !== 2).map(n => 'https://uauu.cat/media/finques/castell-de-tous/galeria-dimatges/' + n + '.webp');

  // Mas Vivencs cerimònia
  const _MV_CERIM = Array.from({ length: 17 }, (_, i) => i + 1).filter(n => n !== 17).map(n => 'https://uauu.cat/media/finques/mas-vivencs/cerimonia/' + n + '.webp');

  // Mas Vivencs galeria
  const _MV_GAL_BASE = 'https://uauu.cat/media/finques/mas-vivencs/galeria-dimatges/';
  const _MV_GAL = [
    ...Array.from({ length: 5 },  (_, i) => _MV_GAL_BASE + (i + 1) + '.webp'),
    _MV_GAL_BASE + '5.1.webp',
    ...Array.from({ length: 14 }, (_, i) => _MV_GAL_BASE + (i + 6) + '.webp'),
    _MV_GAL_BASE + '20.1.webp',
    ...Array.from({ length: 30 }, (_, i) => i + 21).filter(n => n !== 22 && n !== 35 && n !== 47).map(n => _MV_GAL_BASE + n + '.webp'),
  ];

  // Mas Vivencs suite nupcial
  const _MV_SUITE = [
    "21-09-2024-samuel-ariadna-m6a3570.webp","boda-andrea-quim-mas-vivencs-156.webp",
    "boda-aurora-jose-luis-668.webp","boda-joelmonica-mas-vivencs-230.webp",
    "mas-vivencs-2025-267.webp","mas-vivencs-2025-268.webp","mas-vivencs-2025-272.webp",
  ].map(f => IMG + "mas-vivencs/suite-nupcial/" + f);

  const VENUE_DATA = [
    /* 0 — Can Macià */
    {
      mapSrc: 'https://www.google.com/maps?q=41.5980211,1.6563518&t=&z=15&output=embed',
      fallback: IMG + 'can-macia.webp',
      years: {
        '2026': [
          { key:'cerimonia', type:'standard',
            images: _CM_CERIM,
            features: ['Muntatge de cadires','Decoració floral','Música i DJ amb megafonia',"Habitació per canviar-se la núvia o nuvi",'Welcome drink','Possibilitat de celebrar cerimònia religiosa'],
            note: '*El preu de la cerimònia no inclou cerimoniant', price: '1190,00€' },
          { key:'menu', type:'standard',
            images: gastImgs(),
            features: ["Aperitiu a escollir",'Barra de begudes','Plat principal','Pre postre','Pastís de noces','2 hores de barra lliure','Centres florals de taula','Menatge de taula a seleccionar','Papereria (minutes, sitting plan, marca llocs)','Coordinació del casament'],
            price: null },
          { key:'preus', type:'preus',
            img: IMG + 'can-macia/gastronomia/pallares-01732.webp',
            rows: [
              { date:"Dissabtes de Juny, Juliol, Setembre i Octubre", day:'dis', min:120, price:'154,00€' },
              { date:"Dissabtes de Maig, Agost i Novembre",           day:'dis', min:80,  price:'154,00€' },
              { date:"Dissabtes d'Abril",                             day:'dis', min:35,  price:'142,00€' },
              { date:"Dissabtes de Gener, Febrer, Març i Desembre (excepte cap d'any)", day:'dis', min:35, price:'129,00€' },
              { date:"Divendres de Juny, Juliol, Setembre i Octubre", day:'div', min:60,  price:'142,00€' },
              { date:"Divendres de Maig i Agost",                     day:'div', min:35,  price:'142,00€' },
              { date:"Divendres de Gener, Febrer, Març, Abril, Novembre i Desembre", day:'div', min:35, price:'129,00€' },
              { date:"Tots els diumenges de l'any (excepte vigílies de festiu)", day:'diu', min:35, price:'129,00€' },
              { date:"Tots els Dilluns – Dijous de l'any (excepte festius o vigílies de festiu)", day:'dll', min:35, price:'129,00€' },
            ], notes: preusNotes('can-macia') },
          { key:'dj', type:'standard',
            img: 'https://uauu.cat/media/general/dj/festa.webp',
            features: ["Música des de l'aperitiu fins al final de la festa","Reunió prèvia al casament per acordar tota la selecció musical","Servei de pantalla i projecció","Sopar del DJ"],
            note: '*No inclou taxes SGAE i AGEDI', price: '1195,00€' },
          { key:'allotjament', type:'standard',
            images: _CM_ALLOT,
            features: ['Allotjament complert fins a 15 persones',"Inclou l'esmorzar de l'endemà",'Sortida a les 11:30h'],
            note: '*Obligatori en dissabtes de Maig a Octubre', price: '1190,00€' },
          { key:'galeria', type:'galeria', images: _CM_GAL },
          { key:'ubicacio', type:'mapa' },
          { key:'reserva',  type:'reserva' },
          { key:'cataleg',  type:'cataleg' },
        ],
        '2027': [
          { key:'cerimonia', type:'standard',
            images: _CM_CERIM,
            features: ['Muntatge de cadires','Decoració floral','Música i DJ amb megafonia',"Habitació per canviar-se la núvia o nuvi",'Welcome drink','Arc floral','Paquet de pètals','Possibilitat de celebrar cerimònia religiosa'],
            note: '*El preu de la cerimònia no inclou cerimoniant', price: '1740,00€' },
          { key:'menu', type:'standard',
            images: gastImgs(),
            features: ["Aperitiu a escollir",'Barra de begudes','Plat principal','Pre postre','Pastís de noces','2 hores de barra lliure','Centres florals de taula','Menatge de taula a seleccionar'],
            price: null },
          { key:'preus', type:'preus',
            img: IMG + 'can-macia/gastronomia/pallares-01732.webp',
            rows: [
              { date:"Dissabtes de Juny, Juliol, Setembre i Octubre", day:'dis', min:120, price:'154,00€' },
              { date:"Dissabtes de Maig, Agost i Novembre",           day:'dis', min:80,  price:'154,00€' },
              { date:"Dissabtes d'Abril",                             day:'dis', min:60,  price:'144,00€' },
              { date:"Dissabtes de Gener, Febrer, Març i Desembre (excepte cap d'any)", day:'dis', min:35, price:'134,00€' },
              { date:"Divendres de Juny, Juliol, Setembre i Octubre", day:'div', min:60,  price:'144,00€' },
              { date:"Divendres de Maig i Agost",                     day:'div', min:35,  price:'144,00€' },
              { date:"Divendres de Gener, Febrer, Març, Abril, Novembre i Desembre", day:'div', min:35, price:'134,00€' },
              { date:"Tots els diumenges de l'any (excepte vigílies de festiu)", day:'diu', min:35, price:'134,00€' },
              { date:"Tots els Dilluns – Dijous de l'any (excepte festius o vigílies de festiu)", day:'dll', min:35, price:'134,00€' },
            ], notes: preusNotes('can-macia') },
          { key:'quota', type:'standard',
            img: 'https://uauu.cat/media/general/serveis-esencials/coordinacio.webp',
            features: ["Exclusivitat de l'espai durant el casament",'Coordinació del casament','Assistència al Pre Wedding Day pels nuvis','Menú de tast pels nuvis','Sitting Plan','Papereria (minutes i marca llocs)','Servei de neteja durant l\'esdeveniment'],
            price: '890,00€' },
          { key:'dj', type:'standard',
            img: 'https://uauu.cat/media/general/dj/festa.webp',
            features: ["Música des de l'aperitiu fins al final de la festa","Reunió prèvia al casament per acordar tota la selecció musical","Servei de pantalla i projecció","Sopar del DJ"],
            note: '*No inclou taxes SGAE i AGEDI', price: '1250,00€' },
          { key:'allotjament', type:'standard',
            images: _CM_ALLOT,
            features: ['Allotjament complert fins a 15 persones',"Inclou l'esmorzar de l'endemà",'Sortida a les 11:30h'],
            note: '*Obligatori en dissabtes de Maig a Octubre', price: '1290,00€' },
          { key:'galeria', type:'galeria', images: _CM_GAL },
          { key:'ubicacio', type:'mapa' },
          { key:'reserva',  type:'reserva' },
          { key:'cataleg',  type:'cataleg' },
        ],
      },
    },

    /* 1 — Ca n'Alzina */
    {
      mapSrc: 'https://www.google.com/maps?q=41.640489,1.5645722&t=&z=15&output=embed',
      fallback: IMG + "ca-n-alzina.webp",
      years: {
        '2026': [
          { key:'cerimonia', type:'standard',
            images: _CNA_CERIM,
            features: ['Muntatge de cadires','Decoració floral','Música i DJ amb megafonia',"Habitació per canviar-se la núvia o nuvi",'Welcome drink','Arc floral','Pack de pètals'],
            note: '*El preu de la cerimònia no inclou cerimoniant', price: '1690,00€' },
          { key:'menu', type:'standard',
            images: gastImgs(),
            features: ["Aperitiu a escollir",'Barra de begudes','Plat principal','Pre postre','Pastís de noces','2 hores de barra lliure','Centres florals de taula','Menatge de taula a seleccionar','Papereria (minutes, sitting plan, marca llocs)','Coordinació del casament'],
            price: null },
          { key:'preus', type:'preus',
            img: IMG + "ca-n-alzina/gastronomia/pallares-01732.webp",
            rows: [
              { date:"Dissabtes de Juny, Juliol, Setembre i Octubre", day:'dis', min:120, price:'158,00€' },
              { date:"Dissabtes de Maig, Agost i Novembre",           day:'dis', min:80,  price:'158,00€' },
              { date:"Dissabtes d'Abril",                             day:'dis', min:35,  price:'146,00€' },
              { date:"Dissabtes de Gener, Febrer, Març i Desembre (excepte cap d'any)", day:'dis', min:35, price:'133,00€' },
              { date:"Divendres de Juny, Juliol, Setembre i Octubre", day:'div', min:60,  price:'146,00€' },
              { date:"Divendres de Maig i Agost",                     day:'div', min:35,  price:'146,00€' },
              { date:"Divendres de Gener, Febrer, Març, Abril, Novembre i Desembre", day:'div', min:35, price:'133,00€' },
              { date:"Tots els diumenges de l'any (excepte vigílies de festiu)", day:'diu', min:35, price:'133,00€' },
              { date:"Tots els Dilluns – Dijous de l'any (excepte festius o vigílies de festiu)", day:'dll', min:35, price:'133,00€' },
            ], notes: preusNotes('can-alzina') },
          { key:'dj', type:'standard',
            img: 'https://uauu.cat/media/general/dj/festa.webp',
            features: ["Música des de l'aperitiu fins al final de la festa","Reunió prèvia al casament per acordar tota la selecció musical","Servei de pantalla i projecció","Sopar del DJ"],
            note: '*No inclou taxes SGAE i AGEDI', price: '1195,00€' },
          { key:'allotjament', type:'standard',
            images: _CNA_ALLOT,
            features: ['Allotjament complert fins a 21 persones',"Inclou l'esmorzar de l'endemà",'Sortida a les 11:30h'],
            note: '*Obligatori en dissabtes de Maig a Octubre', price: '1290,00€' },
          { key:'galeria', type:'galeria', images: _CNA_GAL },
          { key:'ubicacio', type:'mapa' },
          { key:'reserva',  type:'reserva' },
          { key:'cataleg',  type:'cataleg' },
        ],
        '2027': [
          { key:'cerimonia', type:'standard',
            images: _CNA_CERIM,
            features: ['Muntatge de cadires','Decoració floral','Música i DJ amb megafonia',"Habitació per canviar-se la núvia o nuvi",'Welcome drink','Arc floral','Paquet de pètals'],
            note: '*El preu de la cerimònia no inclou cerimoniant', price: '1740,00€' },
          { key:'menu', type:'standard',
            images: gastImgs(),
            features: ["Aperitiu a escollir",'Barra de begudes','Plat principal','Pre postre','Pastís de noces','2 hores de barra lliure','Centres florals de taula','Menatge de taula a seleccionar'],
            price: null },
          { key:'preus', type:'preus',
            img: IMG + "ca-n-alzina/gastronomia/pallares-01732.webp",
            rows: [
              { date:"Dissabtes de Juny, Juliol, Setembre i Octubre", day:'dis', min:120, price:'158,00€' },
              { date:"Dissabtes de Maig, Agost i Novembre",           day:'dis', min:80,  price:'158,00€' },
              { date:"Dissabtes d'Abril",                             day:'dis', min:60,  price:'148,00€' },
              { date:"Dissabtes de Gener, Febrer, Març i Desembre (excepte cap d'any)", day:'dis', min:35, price:'138,00€' },
              { date:"Divendres de Juny, Juliol, Setembre i Octubre", day:'div', min:60,  price:'148,00€' },
              { date:"Divendres de Maig i Agost",                     day:'div', min:35,  price:'148,00€' },
              { date:"Divendres de Gener, Febrer, Març, Abril, Novembre i Desembre", day:'div', min:35, price:'138,00€' },
              { date:"Tots els diumenges de l'any (excepte vigílies de festiu)", day:'diu', min:35, price:'138,00€' },
              { date:"Tots els Dilluns – Dijous de l'any (excepte festius o vigílies de festiu)", day:'dll', min:35, price:'138,00€' },
            ], notes: preusNotes('can-alzina') },
          { key:'quota', type:'standard',
            img: 'https://uauu.cat/media/general/serveis-esencials/coordinacio.webp',
            features: ["Exclusivitat de l'espai durant el casament",'Coordinació del casament','Assistència al Pre Wedding Day pels nuvis','Menú de tast pels nuvis','Sitting Plan','Papereria (minutes i marca llocs)','Servei de neteja durant l\'esdeveniment'],
            price: '1490,00€' },
          { key:'dj', type:'standard',
            img: 'https://uauu.cat/media/general/dj/festa.webp',
            features: ["Música des de l'aperitiu fins al final de la festa","Reunió prèvia al casament per acordar tota la selecció musical","Servei de pantalla i projecció","Sopar del DJ"],
            note: '*No inclou taxes SGAE i AGEDI', price: '1250,00€' },
          { key:'allotjament', type:'standard',
            images: _CNA_ALLOT,
            features: ['Allotjament complert fins a 21 persones',"Inclou l'esmorzar de l'endemà",'Sortida a les 11:30h'],
            note: '*Obligatori en dissabtes de Maig a Octubre', price: '1390,00€' },
          { key:'galeria', type:'galeria', images: _CNA_GAL },
          { key:'ubicacio', type:'mapa' },
          { key:'reserva',  type:'reserva' },
          { key:'cataleg',  type:'cataleg' },
        ],
      },
    },

    /* 2 — Castell de Tous */
    {
      mapSrc: 'https://www.google.com/maps?q=41.5594685,1.5252126&t=&z=15&output=embed',
      fallback: IMG + 'castell-de-tous.webp',
      years: {
        '2026': [
          { key:'cerimonia', type:'standard',
            images: _CDT_CERIM,
            features: ['Muntatge de cadires','Decoració floral','Música i DJ amb megafonia',"Habitació per canviar-se la núvia o nuvi",'Welcome drink','Arc floral','Pack de pètals'],
            note: '*El preu de la cerimònia no inclou cerimoniant', price: '1690,00€' },
          { key:'menu', type:'standard',
            images: gastImgs(),
            features: ["Aperitiu a escollir",'Barra de begudes','Plat principal','Pre postre','Pastís de noces','2 hores de barra lliure','Centres florals de taula','Menatge de taula a seleccionar','Papereria (minutes, sitting plan, marca llocs)','Coordinació del casament'],
            price: null },
          { key:'preus', type:'preus',
            img: IMG + 'castell-de-tous/gastronomia/pallares-01732.webp',
            rows: [
              { date:"Dissabtes de Juny, Juliol, Setembre i Octubre", day:'dis', min:80,  price:'160,00€' },
              { date:"Dissabtes de Maig, Agost i Novembre",           day:'dis', min:60,  price:'160,00€' },
              { date:"Dissabtes d'Abril",                             day:'dis', min:35,  price:'147,00€' },
              { date:"Dissabtes de Gener, Febrer, Març i Desembre (excepte cap d'any)", day:'dis', min:35, price:'135,00€' },
              { date:"Divendres de Juny, Juliol, Setembre i Octubre", day:'div', min:45,  price:'147,00€' },
              { date:"Divendres de Maig i Agost",                     day:'div', min:35,  price:'147,00€' },
              { date:"Divendres de Gener, Febrer, Març, Abril, Novembre i Desembre", day:'div', min:35, price:'135,00€' },
              { date:"Tots els diumenges de l'any (excepte vigílies de festiu)", day:'diu', min:35, price:'135,00€' },
              { date:"Tots els Dilluns – Dijous de l'any (excepte festius o vigílies de festiu)", day:'dll', min:35, price:'135,00€' },
            ], notes: preusNotes('castell-tous') },
          { key:'dj', type:'standard',
            img: 'https://uauu.cat/media/general/dj/festa.webp',
            features: ["Música des de l'aperitiu fins al final de la festa","Reunió prèvia al casament per acordar tota la selecció musical","Servei de pantalla i projecció","Sopar del DJ"],
            note: '*No inclou taxes SGAE i AGEDI', price: '1195,00€' },
          { key:'galeria', type:'galeria', images: _CDT_GAL },
          { key:'ubicacio', type:'mapa' },
          { key:'reserva',  type:'reserva' },
          { key:'cataleg',  type:'cataleg' },
        ],
        '2027': [
          { key:'cerimonia', type:'standard',
            images: _CDT_CERIM,
            features: ['Muntatge de cadires','Decoració floral','Música i DJ amb megafonia',"Habitació per canviar-se la núvia o nuvi",'Welcome drink','Arc floral','Paquet de pètals'],
            note: '*El preu de la cerimònia no inclou cerimoniant', price: '1740,00€' },
          { key:'menu', type:'standard',
            images: gastImgs(),
            features: ["Aperitiu a escollir",'Barra de begudes','Plat principal','Pre postre','Pastís de noces','2 hores de barra lliure','Centres florals de taula','Menatge de taula a seleccionar'],
            price: null },
          { key:'preus', type:'preus',
            img: IMG + 'castell-de-tous/gastronomia/pallares-01732.webp',
            rows: [
              { date:"Dissabtes de Juny, Juliol, Setembre i Octubre", day:'dis', min:80,  price:'160,00€' },
              { date:"Dissabtes de Maig, Agost i Novembre",           day:'dis', min:60,  price:'160,00€' },
              { date:"Dissabtes d'Abril",                             day:'dis', min:45,  price:'150,00€' },
              { date:"Dissabtes de Gener, Febrer, Març i Desembre (excepte cap d'any)", day:'dis', min:35, price:'140,00€' },
              { date:"Divendres de Juny, Juliol, Setembre i Octubre", day:'div', min:45,  price:'150,00€' },
              { date:"Divendres de Maig i Agost",                     day:'div', min:35,  price:'150,00€' },
              { date:"Divendres de Gener, Febrer, Març, Abril, Novembre i Desembre", day:'div', min:35, price:'140,00€' },
              { date:"Tots els diumenges de l'any (excepte vigílies de festiu)", day:'diu', min:35, price:'140,00€' },
              { date:"Tots els Dilluns – Dijous de l'any (excepte festius o vigílies de festiu)", day:'dll', min:35, price:'140,00€' },
            ], notes: preusNotes('castell-tous') },
          { key:'quota', type:'standard',
            img: 'https://uauu.cat/media/general/serveis-esencials/coordinacio.webp',
            features: ["Exclusivitat de l'espai durant el casament",'Coordinació del casament','Assistència al Pre Wedding Day pels nuvis','Menú de tast pels nuvis','Sitting Plan','Papereria (minutes i marca llocs)','Servei de neteja durant l\'esdeveniment'],
            price: '1890,00€' },
          { key:'dj', type:'standard',
            img: 'https://uauu.cat/media/general/dj/festa.webp',
            features: ["Música des de l'aperitiu fins al final de la festa","Reunió prèvia al casament per acordar tota la selecció musical","Servei de pantalla i projecció","Sopar del DJ"],
            note: '*No inclou taxes SGAE i AGEDI', price: '1250,00€' },
          { key:'galeria', type:'galeria', images: _CDT_GAL },
          { key:'ubicacio', type:'mapa' },
          { key:'reserva',  type:'reserva' },
          { key:'cataleg',  type:'cataleg' },
        ],
      },
    },

    /* 3 — Mas Vivencs */
    {
      mapSrc: 'https://www.google.com/maps?q=41.5548048,1.6830515&t=&z=15&output=embed',
      fallback: IMG + 'mas-vivencs.webp',
      years: {
        '2026': [
          { key:'cerimonia', type:'standard',
            images: _MV_CERIM,
            features: ['Muntatge de cadires','Decoració floral','Música i DJ amb megafonia',"Habitació per canviar-se la núvia o nuvi",'Welcome drink'],
            note: '*El preu de la cerimònia no inclou cerimoniant', price: '1190,00€' },
          { key:'menu', type:'standard',
            images: gastImgs(),
            features: ["Aperitiu a escollir",'Barra de begudes','Plat principal','Pre postre','Pastís de noces','2 hores de barra lliure','Centres florals de taula','Menatge de taula a seleccionar','Papereria (minutes, sitting plan, marca llocs)','Coordinació del casament'],
            price: null },
          { key:'preus', type:'preus',
            img: IMG + 'mas-vivencs/gastronomia/pallares-01732.webp',
            rows: [
              { date:"Dissabtes de Juny, Juliol, Setembre i Octubre", day:'dis', min:100, price:'154,00€' },
              { date:"Dissabtes de Maig, Agost i Novembre",           day:'dis', min:80,  price:'154,00€' },
              { date:"Dissabtes d'Abril",                             day:'dis', min:35,  price:'142,00€' },
              { date:"Dissabtes de Gener, Febrer, Març i Desembre (excepte cap d'any)", day:'dis', min:35, price:'129,00€' },
              { date:"Divendres de Juny, Juliol, Setembre i Octubre", day:'div', min:60,  price:'142,00€' },
              { date:"Divendres de Maig i Agost",                     day:'div', min:35,  price:'142,00€' },
              { date:"Divendres de Gener, Febrer, Març, Abril, Novembre i Desembre", day:'div', min:35, price:'129,00€' },
              { date:"Tots els diumenges de l'any (excepte vigílies de festiu)", day:'diu', min:35, price:'129,00€' },
              { date:"Tots els Dilluns – Dijous de l'any (excepte festius o vigílies de festiu)", day:'dll', min:35, price:'129,00€' },
            ], notes: preusNotes('mas-vivencs') },
          { key:'dj', type:'standard',
            img: 'https://uauu.cat/media/general/dj/festa.webp',
            features: ["Música des de l'aperitiu fins al final de la festa","Reunió prèvia al casament per acordar tota la selecció musical","Servei de pantalla i projecció","Sopar del DJ"],
            note: '*No inclou taxes SGAE i AGEDI', price: '1195,00€' },
          { key:'suite', type:'standard',
            images: _MV_SUITE,
            features: ['Allotjament per la parella',"Inclou l'esmorzar de l'endemà (sortida a les 11:30h)"],
            price: '290,00€' },
          { key:'galeria', type:'galeria', images: _MV_GAL },
          { key:'ubicacio', type:'mapa' },
          { key:'reserva',  type:'reserva' },
          { key:'cataleg',  type:'cataleg' },
        ],
        '2027': [
          { key:'cerimonia', type:'standard',
            images: _MV_CERIM,
            features: ['Muntatge de cadires','Decoració floral','Música i DJ amb megafonia',"Habitació per canviar-se la núvia o nuvi",'Welcome drink','Arc floral','Paquet de pètals'],
            note: '*El preu de la cerimònia no inclou cerimoniant', price: '1740,00€' },
          { key:'menu', type:'standard',
            images: gastImgs(),
            features: ["Aperitiu a escollir",'Barra de begudes','Plat principal','Pre postre','Pastís de noces','2 hores de barra lliure','Centres florals de taula','Menatge de taula a seleccionar'],
            price: null },
          { key:'preus', type:'preus',
            img: IMG + 'mas-vivencs/gastronomia/pallares-01732.webp',
            rows: [
              { date:"Dissabtes de Juny, Juliol, Setembre i Octubre", day:'dis', min:100, price:'154,00€' },
              { date:"Dissabtes de Maig, Agost i Novembre",           day:'dis', min:80,  price:'154,00€' },
              { date:"Dissabtes d'Abril",                             day:'dis', min:60,  price:'144,00€' },
              { date:"Dissabtes de Gener, Febrer, Març i Desembre (excepte cap d'any)", day:'dis', min:35, price:'134,00€' },
              { date:"Divendres de Juny, Juliol, Setembre i Octubre", day:'div', min:60,  price:'144,00€' },
              { date:"Divendres de Maig i Agost",                     day:'div', min:35,  price:'144,00€' },
              { date:"Divendres de Gener, Febrer, Març, Abril, Novembre i Desembre", day:'div', min:35, price:'134,00€' },
              { date:"Tots els diumenges de l'any (excepte vigílies de festiu)", day:'diu', min:35, price:'134,00€' },
              { date:"Tots els Dilluns – Dijous de l'any (excepte festius o vigílies de festiu)", day:'dll', min:35, price:'134,00€' },
            ], notes: preusNotes('mas-vivencs') },
          { key:'quota', type:'standard',
            img: 'https://uauu.cat/media/general/serveis-esencials/coordinacio.webp',
            features: ["Exclusivitat de l'espai durant el casament",'Coordinació del casament','Assistència al Pre Wedding Day pels nuvis','Menú de tast pels nuvis','Sitting Plan','Papereria (minutes i marca llocs)','Servei de neteja durant l\'esdeveniment'],
            price: '890,00€' },
          { key:'dj', type:'standard',
            img: 'https://uauu.cat/media/general/dj/festa.webp',
            features: ["Música des de l'aperitiu fins al final de la festa","Reunió prèvia al casament per acordar tota la selecció musical","Servei de pantalla i projecció","Sopar del DJ"],
            note: '*No inclou taxes SGAE i AGEDI', price: '1250,00€' },
          { key:'allotjament', type:'standard',
            images: _MV_SUITE,
            features: ['Allotjament per la parella',"Inclou l'esmorzar de l'endemà (sortida a les 11:30h)"],
            price: '295,00€' },
          { key:'galeria', type:'galeria', images: _MV_GAL },
          { key:'ubicacio', type:'mapa' },
          { key:'reserva',  type:'reserva' },
          { key:'cataleg',  type:'cataleg' },
        ],
      },
    },
  ];

  /* ═══════════════════════════════════════════════════════
     PAGE 4 — VENUE DETAIL
  ═══════════════════════════════════════════════════════ */

  function getVenueItems() {
    const venueIdx = sel.venueIdx ?? 0;
    const year     = sel.year || '2027';
    const vd       = VENUE_DATA[venueIdx];
    const items    = vd.years[year] || vd.years['2027'] || vd.years['2026'] || [];
    const FIRST    = ['menu', 'preus', 'cerimonia'];
    const head     = FIRST.map(k => items.find(i => i.key === k)).filter(Boolean);
    const tail     = items.filter(i => !FIRST.includes(i.key));
    return [...head, ...tail];
  }

  function buildItemList(containerEl, itemClass, items, lang, onHover, onClick) {
    containerEl.innerHTML = '';
    containerEl.classList.remove('has-hover');
    items.forEach((item, i) => {
      const el = document.createElement('div');
      el.className   = itemClass;
      el.textContent = (ITEM_LABELS[item.key] || {})[lang] || item.key;
      el.dataset.idx = i;
      containerEl.appendChild(el);
    });
    let activeIdx = -1;
    containerEl.onmousemove = e => {
      const els = [...containerEl.querySelectorAll('.' + itemClass)];
      let newIdx = -1;
      for (let j = 0; j < els.length; j++) {
        const r = els[j].getBoundingClientRect();
        if (e.clientY >= r.top - 6 && e.clientY <= r.bottom + 6) { newIdx = j; break; }
      }
      if (newIdx === -1 || newIdx === activeIdx) return;
      activeIdx = newIdx;
      els.forEach(el => el.classList.remove('is-active'));
      els[newIdx].classList.add('is-active');
      containerEl.classList.add('has-hover');
      if (onHover) onHover(newIdx);
    };
    containerEl.onmouseleave = () => {
      activeIdx = -1;
      containerEl.querySelectorAll('.' + itemClass).forEach(el => el.classList.remove('is-active'));
      containerEl.classList.remove('has-hover');
      if (onHover) onHover(-1);
    };
    if (onClick) {
      containerEl.onclick = e => {
        const el = e.target.closest('.' + itemClass);
        if (!el) return;
        onClick(parseInt(el.dataset.idx));
      };
    }
  }

  function initPage4() {
    document.getElementById('page-4').scrollTop = 0;
    attachScrollHide(document.getElementById('page-4'));
    const lang     = sel.language || 'Català';
    const venueIdx = sel.venueIdx ?? 0;
    document.getElementById('hdr-venue-name').innerHTML = VENUE_TITLES[venueIdx];
    const items = getVenueItems();
    const p5List = document.getElementById('p5-list');
    buildItemList(
      p5List, 'p5-item', items, lang,
      null,
      idx => {
        if (items[idx].type === 'cataleg') { const u = getCatalegUrl(); if (u) window.open(u, '_blank'); return; }
        if (items[idx].type === 'reserva') { window.open('https://espaigastronomia.simplybook.it/v2/#book', '_blank'); return; }
        sel.itemIdx = idx; navigate(5);
      }
    );
    const p5Year = document.createElement('div');
    p5Year.className = 'p5-list-year';
    if (sel.year === '2028') {
      p5Year.innerHTML = `${sel.year}<span class="list-year-notice">Preus orientatius 2027 · Oferta 2028 pendent de confirmar</span>`;
    } else {
      p5Year.textContent = sel.year || '2027';
    }
    p5List.insertBefore(p5Year, p5List.firstChild);
    const p5Title = document.createElement('div');
    p5Title.className = 'p5-venue-title';
    p5Title.textContent = `${VENUE_INTRO[lang] || VENUE_INTRO['Català']} ${VENUE_NAMES[venueIdx]}`;
    p5List.insertBefore(p5Title, p5Year.nextSibling);
    buildMobCards();
  }

  function makeMobCarousel(container, imgs) {
    if (imgs.length <= 1) {
      const img = document.createElement('img');
      img.src = imgs[0]; img.alt = ''; img.loading = 'lazy';
      container.appendChild(img);
      return;
    }
    let cur = 0;
    let startX = 0;
    let dragging = false;
    let w = 0;

    const track = document.createElement('div');
    track.className = 'mob-car-track';
    imgs.forEach((src, i) => {
      const slide = document.createElement('div');
      slide.className = 'mob-car-slide';
      const img = document.createElement('img');
      img.alt = '';
      if (i === 0) { img.src = src; } else { img.dataset.src = src; }
      slide.appendChild(img);
      track.appendChild(slide);
    });

    const dotsEl = document.createElement('div');
    dotsEl.className = 'mob-car-dots';
    imgs.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'mob-car-dot' + (i === 0 ? ' is-active' : '');
      dot.onclick = () => goTo(i);
      dotsEl.appendChild(dot);
    });

    function snap(x, animate) {
      track.style.transition = animate ? 'transform 0.32s cubic-bezier(.22,1,.36,1)' : 'none';
      track.style.transform = `translateX(${x}px)`;
    }

    function loadSlide(j) {
      if (j < 0 || j >= imgs.length) return;
      const img = track.children[j]?.querySelector('img[data-src]');
      if (img) { img.src = img.dataset.src; img.removeAttribute('data-src'); }
    }

    function goTo(idx) {
      cur = Math.max(0, Math.min(imgs.length - 1, idx));
      w = container.offsetWidth;
      snap(-cur * w, true);
      dotsEl.querySelectorAll('.mob-car-dot').forEach((d, i) => d.classList.toggle('is-active', i === cur));
      loadSlide(cur - 1); loadSlide(cur); loadSlide(cur + 1);
    }

    track.addEventListener('touchstart', e => {
      w = container.offsetWidth;
      startX = e.touches[0].clientX;
      dragging = true;
      track.style.transition = 'none';
    }, { passive: true });

    track.addEventListener('touchmove', e => {
      if (!dragging) return;
      const dx = e.touches[0].clientX - startX;
      let x = -cur * w + dx;
      // edge resistance
      if (x > 0)                        x = dx * 0.2;
      if (x < -(imgs.length - 1) * w)  x = -(imgs.length - 1) * w + (x + (imgs.length - 1) * w) * 0.2;
      track.style.transform = `translateX(${x}px)`;
    }, { passive: true });

    track.addEventListener('touchend', e => {
      if (!dragging) return;
      dragging = false;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) goTo(dx < 0 ? cur + 1 : cur - 1);
      else goTo(cur);
    }, { passive: true });

    const prev = document.createElement('button');
    prev.className = 'mob-car-btn mob-car-prev';
    prev.innerHTML = `<svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M6 1L1 6L6 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    prev.onclick = () => goTo(cur - 1);
    const next = document.createElement('button');
    next.className = 'mob-car-btn mob-car-next';
    next.innerHTML = `<svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1L6 6L1 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    next.onclick = () => goTo(cur + 1);

    snap(0, false);
    loadSlide(1);
    container.appendChild(track);
    container.appendChild(prev);
    container.appendChild(next);
    container.appendChild(dotsEl);
  }

  function findPreusRow(rows, dayKey, monthNum) {
    const MONTHS = ['gener','febrer','març','abril','maig','juny','juliol','agost','setembre','octubre','novembre','desembre'];
    const m = MONTHS[monthNum - 1];
    return rows.find(r => {
      if (r.day !== dayKey) return false;
      const d = r.date.toLowerCase();
      return d.includes("de l'any") || d.includes(m);
    }) || null;
  }

  function buildPreusInteractive(container, item, lang) {
    const PI = {
      'Català':  { months:['Gen','Feb','Mar','Abr','Mai','Jun','Jul','Ago','Set','Oct','Nov','Des'], labelMonth:'Seleccioneu el mes', labelDay:'Seleccioneu el dia', min:'Mínim', per:'persones' },
      'Español': { months:['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'], labelMonth:'Selecciona el mes', labelDay:'Selecciona el día', min:'Mínimo', per:'personas' },
      'English': { months:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], labelMonth:'Select the month', labelDay:'Select the day',   min:'Minimum', per:'people' },
    };
    const ui = PREUS_UI[lang] || PREUS_UI['Català'];
    const pi = PI[lang]       || PI['Català'];
    let selMonth = null;
    let selDay   = null;

    const title = document.createElement('div');
    title.className = 'preus-int-title';
    title.textContent = itemTitle(item, lang);
    container.appendChild(title);

    // Step 1 — month
    const monthLabel = document.createElement('div');
    monthLabel.className = 'preus-int-label';
    monthLabel.textContent = pi.labelMonth;
    container.appendChild(monthLabel);

    const monthGrid = document.createElement('div');
    monthGrid.className = 'preus-int-month-grid';
    pi.months.forEach((label, i) => {
      const btn = document.createElement('button');
      btn.className = 'preus-int-month-btn'; btn.textContent = label; btn.dataset.month = i + 1;
      btn.onclick = () => {
        selMonth = selMonth === i + 1 ? null : i + 1;
        if (!selMonth) selDay = null;
        monthGrid.querySelectorAll('.preus-int-month-btn').forEach(b =>
          b.classList.toggle('is-active', +b.dataset.month === selMonth));
        daySection.classList.toggle('preus-int-step--visible', !!selMonth);
        if (!selMonth) dayGrid.querySelectorAll('.preus-int-month-btn').forEach(b => b.classList.remove('is-active'));
        updateResult();
      };
      monthGrid.appendChild(btn);
    });
    container.appendChild(monthGrid);

    // Step 2 — day (hidden until month chosen)
    const daySection = document.createElement('div');
    daySection.className = 'preus-int-step';

    const dayLabel = document.createElement('div');
    dayLabel.className = 'preus-int-label';
    dayLabel.textContent = pi.labelDay;
    daySection.appendChild(dayLabel);

    const dayGrid = document.createElement('div');
    dayGrid.className = 'preus-int-day-grid';
    ['dis','div','diu','dll'].forEach(dk => {
      const btn = document.createElement('button');
      btn.className = 'preus-int-month-btn'; btn.textContent = ui[dk]; btn.dataset.day = dk;
      btn.onclick = () => {
        selDay = selDay === dk ? null : dk;
        dayGrid.querySelectorAll('.preus-int-month-btn').forEach(b =>
          b.classList.toggle('is-active', b.dataset.day === selDay && selDay !== null));
        updateResult();
      };
      dayGrid.appendChild(btn);
    });
    daySection.appendChild(dayGrid);
    container.appendChild(daySection);

    // Result
    const resultEl = document.createElement('div');
    resultEl.className = 'preus-int-result';
    container.appendChild(resultEl);

    function updateResult() {
      if (!selMonth || !selDay) { resultEl.innerHTML = ''; return; }
      const row = findPreusRow(item.rows, selDay, selMonth);
      if (!row) { resultEl.innerHTML = ''; return; }
      resultEl.innerHTML = `
        <div class="preus-int-row">
          <div class="preus-int-row-day">${ui[selDay]}</div>
          <div class="preus-int-row-right">
            <div class="preus-int-row-price">${row.price}<span class="preus-int-iva"> +IVA</span></div>
            <div class="preus-int-row-min">${pi.min} ${row.min} ${pi.per}</div>
          </div>
        </div>`;
    }

    if (item.notes) {
      item.notes.forEach(note => {
        const fn = document.createElement('div');
        fn.className = 'p6-preus-footnote';
        fn.textContent = (PREUSNOTE_TRANS[lang] || {})[note] || note;
        container.appendChild(fn);
      });
    }
  }

  function buildMobCards() {
    const lang  = sel.language || 'Català';
    const items = getVenueItems();
    const vd    = VENUE_DATA[sel.venueIdx ?? 0];
    const wrap  = document.getElementById('mob-cards-wrap');
    wrap.innerHTML = '';

    // Year label
    const yearEl = document.createElement('div');
    yearEl.className = 'p5-list-year';
    if (sel.year === '2028') {
      yearEl.innerHTML = `${sel.year}<span class="list-year-notice">Preus orientatius 2027 · Oferta 2028 pendent de confirmar</span>`;
    } else {
      yearEl.textContent = sel.year || '2027';
    }
    wrap.appendChild(yearEl);
    const mobTitle = document.createElement('div');
    mobTitle.className = 'p5-venue-title';
    mobTitle.textContent = `${VENUE_INTRO[lang] || VENUE_INTRO['Català']} ${VENUE_NAMES[sel.venueIdx ?? 0]}`;
    wrap.appendChild(mobTitle);

    const tFeat = FEAT_TRANS[lang] || {};
    const tNote = NOTE_TRANS[lang] || {};

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'mob-card';
      card.id = `mob-card-${item.key}`;

      if (item.type === 'galeria') {
        if (!item.images || item.images.length === 0) return;
        const strip = document.createElement('div');
        strip.className = 'mob-card-gallery';
        item.images.forEach((src, i) => {
          const cell = document.createElement('div');
          cell.className = 'mob-card-gallery-item';
          const img = document.createElement('img');
          img.dataset.src = src; img.alt = '';
          cell.appendChild(img);
          cell.onclick = () => openLightbox(item.images, i);
          strip.appendChild(cell);
        });
        card.appendChild(strip);
        wrap.appendChild(card);
        const galObs = new IntersectionObserver(entries => {
          if (entries[0].isIntersecting) {
            strip.querySelectorAll('img[data-src]').forEach(img => {
              img.src = img.dataset.src; img.removeAttribute('data-src');
            });
            galObs.disconnect();
          }
        }, { rootMargin: '300px' });
        galObs.observe(card);
        return;
      }

      if (item.type === 'reserva') {
        card.classList.add('mob-card-reserva');
        const btn = document.createElement('a');
        btn.href = 'https://espaigastronomia.simplybook.it/v2/#book';
        btn.target = '_blank'; btn.rel = 'noopener noreferrer';
        btn.className = 'mob-sel-cta';
        btn.innerHTML = `<span>${(ITEM_LABELS['reserva']||{})[lang]||'Reservar'}</span><span class="mob-sel-cta-arrow"></span>`;
        card.appendChild(btn);
        wrap.appendChild(card);
        return;
      }

      if (item.type === 'cataleg') {
        const catalogUrl = getCatalegUrl();
        if (!catalogUrl) return;
        card.classList.add('mob-card-cataleg');
        const btn = document.createElement('a');
        btn.href = catalogUrl;
        btn.target = '_blank'; btn.rel = 'noopener noreferrer';
        btn.className = 'mob-sel-cta';
        btn.innerHTML = `<span>${(ITEM_LABELS['cataleg']||{})[lang]||'Catàleg complert'}</span><span class="mob-sel-cta-arrow"></span>`;
        card.appendChild(btn);
        wrap.appendChild(card);
        return;
      }

      if (item.type === 'mapa') {
        card.innerHTML = '';
        const inner = document.createElement('div');
        inner.className = 'mob-card-mapa';
        const frame = document.createElement('div');
        frame.className = 'mob-card-map-frame';
        frame.innerHTML = `<iframe src="${vd.mapSrc}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>`;
        const coords = (vd.mapSrc.match(/[?&]q=([\d.,]+)/) || [])[1] || '';
        const mapsUrl = coords ? `https://www.google.com/maps?q=${coords}` : 'https://www.google.com/maps';
        const btn = document.createElement('a');
        btn.href = mapsUrl; btn.target = '_blank'; btn.rel = 'noopener noreferrer';
        btn.className = 'p6-maps-btn';
        btn.innerHTML = `${MAPS_BTN[lang]||MAPS_BTN['Català']}<span class="p6-maps-btn-arrow"></span>`;
        inner.appendChild(frame);
        inner.appendChild(btn);
        card.appendChild(inner);
        wrap.appendChild(card);
        return;
      }

      if (item.type === 'preus') {
        card.classList.add('is-preus');
        const inner = document.createElement('div');
        inner.className = 'mob-card-preus-wrap';
        buildPreusInteractive(inner, item, lang);
        card.appendChild(inner);
        wrap.appendChild(card);
        return;
      }

      // Standard item
      const imgs = (item.images && item.images.length > 0) ? item.images : item.img ? [item.img] : [vd.fallback];
      const imgWrap = document.createElement('div');
      imgWrap.className = 'mob-card-img';
      makeMobCarousel(imgWrap, imgs);
      card.appendChild(imgWrap);

      const body = document.createElement('div');
      body.className = 'mob-card-body';

      const title = document.createElement('div');
      title.className = 'mob-card-title';
      title.textContent = itemTitle(item, lang);
      body.appendChild(title);
      if (MANDATORY_KEYS.has(item.key)) {
        const badge = document.createElement('div');
        badge.className = 'mob-card-mandatory';
        badge.textContent = MANDATORY_LABEL[lang] || 'Imprescindible';
        body.appendChild(badge);
      }

      if (item.features) {
        const ul = document.createElement('ul');
        ul.className = 'mob-card-features';
        item.features.forEach(f => { const li = document.createElement('li'); li.textContent = tFeat[f] || f; ul.appendChild(li); });
        body.appendChild(ul);
      }
      if (item.note) {
        const note = document.createElement('div');
        note.className = 'mob-card-note';
        note.textContent = tNote[item.note] || item.note;
        body.appendChild(note);
      }
      if (item.price) {
        const price = document.createElement('div');
        price.className = 'mob-card-price';
        price.innerHTML = `${item.price}<span class="mob-card-price-iva">+IVA</span>`;
        body.appendChild(price);
      }
      if (item.key === 'menu') {
        const preusLabel = (ITEM_TITLES['preus']||{})[lang] || 'Preu del menú';
        const btn = document.createElement('button');
        btn.className = 'p6-preus-link-btn';
        btn.innerHTML = `${preusLabel}<span class="p6-preus-link-arrow"></span>`;
        btn.onclick = () => document.getElementById('mob-card-preus')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        body.appendChild(btn);
      }

      card.appendChild(body);
      wrap.appendChild(card);
    });
  }

  /* ═══════════════════════════════════════════════════════
     LIGHTBOX
  ═══════════════════════════════════════════════════════ */

  let _lb = null, _lbImgs = [], _lbIdx = 0, _lbObs = null;
  let _carouselNav = null;

  document.addEventListener('keydown', e => {
    if (_lb && _lb.classList.contains('open')) return;
    if (!_carouselNav) return;
    if (e.key === 'ArrowLeft')  { e.preventDefault(); _carouselNav.prev(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); _carouselNav.next(); }
  });

  function openLightbox(images, startIdx) {
    if (!_lb) {
      _lb = document.createElement('div');
      _lb.className = 'p6-lightbox';
      _lb.innerHTML = `
        <button class="p6-lightbox-close" id="lb-close">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
        </button>
        <button class="p6-lightbox-nav p6-lightbox-prev" id="lb-prev">
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M7 1L1 7L7 13" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <div class="p6-lightbox-track" id="lb-track"></div>
        <button class="p6-lightbox-nav p6-lightbox-next" id="lb-next">
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M1 1L7 7L1 13" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <div class="p6-lightbox-counter" id="lb-counter"></div>`;
      document.body.appendChild(_lb);

      _lb.querySelector('#lb-close').onclick = closeLightbox;
      _lb.querySelector('#lb-prev').onclick  = e => { e.stopPropagation(); lbGoTo(_lbIdx - 1); };
      _lb.querySelector('#lb-next').onclick  = e => { e.stopPropagation(); lbGoTo(_lbIdx + 1); };

      document.addEventListener('keydown', e => {
        if (!_lb.classList.contains('open')) return;
        if (e.key === 'Escape')     closeLightbox();
        if (e.key === 'ArrowLeft')  lbGoTo(_lbIdx - 1);
        if (e.key === 'ArrowRight') lbGoTo(_lbIdx + 1);
      });
    }

    _lbImgs = images;
    if (_lbObs) { _lbObs.disconnect(); _lbObs = null; }

    const track = _lb.querySelector('#lb-track');
    track.innerHTML = '';

    images.forEach((src, i) => {
      const slide = document.createElement('div');
      slide.className = 'p6-lightbox-slide';
      const img = document.createElement('img');
      img.alt = '';
      if (Math.abs(i - startIdx) <= 1) { img.src = src; } else { img.dataset.src = src; }
      slide.appendChild(img);
      track.appendChild(slide);
    });

    _lbObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const slides = [...track.children];
        const idx = slides.indexOf(entry.target);
        [-1, 0, 1, 2].forEach(offset => {
          const s = slides[idx + offset];
          if (!s) return;
          const lazy = s.querySelector('img[data-src]');
          if (lazy) { lazy.src = lazy.dataset.src; lazy.removeAttribute('data-src'); }
        });
      });
    }, { root: track, threshold: 0 });
    [...track.children].forEach(s => _lbObs.observe(s));

    track.addEventListener('scroll', () => {
      const idx = Math.round(track.scrollLeft / track.clientWidth);
      if (idx === _lbIdx) return;
      _lbIdx = idx;
      _lb.querySelector('#lb-counter').textContent = `${idx + 1} / ${images.length}`;
    }, { passive: true });

    _lb.classList.add('open');
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => {
      track.scrollTo({ left: startIdx * track.clientWidth, behavior: 'instant' });
      _lbIdx = startIdx;
      _lb.querySelector('#lb-counter').textContent = `${startIdx + 1} / ${images.length}`;
      const hasMult = images.length > 1;
      _lb.querySelector('#lb-prev').style.display = hasMult ? '' : 'none';
      _lb.querySelector('#lb-next').style.display = hasMult ? '' : 'none';
    });
  }

  function closeLightbox() {
    _lb.classList.remove('open');
    document.body.style.overflow = '';
    if (_lbObs) { _lbObs.disconnect(); _lbObs = null; }
  }

  function lbGoTo(n) {
    _lbIdx = ((n % _lbImgs.length) + _lbImgs.length) % _lbImgs.length;
    const track = _lb.querySelector('#lb-track');
    track.scrollTo({ left: _lbIdx * track.clientWidth, behavior: 'smooth' });
    _lb.querySelector('#lb-counter').textContent = `${_lbIdx + 1} / ${_lbImgs.length}`;
  }

  /* ═══════════════════════════════════════════════════════
     CAROUSEL HELPER
  ═══════════════════════════════════════════════════════ */

  function makeCarousel(centerEl, images) {
    const wrap  = document.createElement('div');
    wrap.className = 'p6-carousel-wrap';

    const track = document.createElement('div');
    track.className = 'p6-carousel-track';
    images.forEach((src, i) => {
      const slide = document.createElement('div');
      slide.className = 'p6-carousel-slide' + (i === 0 ? ' is-active' : '');
      const img = document.createElement('img');
      img.alt = '';
      if (i === 0) { img.src = src; img.fetchPriority = 'high'; }
      else         { img.dataset.src = src; }
      slide.appendChild(img);
      track.appendChild(slide);
    });
    wrap.appendChild(track);

    let cur = 0;
    function goTo(n) {
      const slides = track.querySelectorAll('.p6-carousel-slide');
      const dots   = wrap.querySelectorAll('.p6-carousel-dot');
      slides[cur].classList.remove('is-active');
      if (dots[cur]) dots[cur].classList.remove('is-active');
      cur = ((n % images.length) + images.length) % images.length;
      const lazyImg = slides[cur].querySelector('img[data-src]');
      if (lazyImg) { lazyImg.src = lazyImg.dataset.src; delete lazyImg.dataset.src; }
      slides[cur].classList.add('is-active');
      if (dots[cur]) dots[cur].classList.add('is-active');
    }
    _carouselNav = { prev: () => goTo(cur - 1), next: () => goTo(cur + 1) };

    if (images.length > 1) {
      const nav  = document.createElement('div'); nav.className = 'p6-carousel-nav';
      const prev = document.createElement('button'); prev.className = 'p6-carousel-btn';
      prev.innerHTML = '<svg width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M7 1L1 7L7 13" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      const next = document.createElement('button'); next.className = 'p6-carousel-btn';
      next.innerHTML = '<svg width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M1 1L7 7L1 13" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      prev.onclick = () => goTo(cur - 1);
      next.onclick = () => goTo(cur + 1);
      nav.append(prev, next);
      wrap.appendChild(nav);

      const dotsEl = document.createElement('div'); dotsEl.className = 'p6-carousel-dots';
      images.forEach((_, i) => {
        const d = document.createElement('div');
        d.className = 'p6-carousel-dot' + (i === 0 ? ' is-active' : '');
        d.onclick = () => goTo(i);
        dotsEl.appendChild(d);
      });
      wrap.appendChild(dotsEl);
    }

    centerEl.innerHTML = '';
    centerEl.appendChild(wrap);
  }

  /* ═══════════════════════════════════════════════════════
     PAGE 5 — ITEM DETAIL
  ═══════════════════════════════════════════════════════ */

  function initPage5() {
    const lang     = sel.language || 'Català';
    const venueIdx = sel.venueIdx ?? 0;
    const itemIdx  = sel.itemIdx  ?? 0;
    const items    = getVenueItems();
    const item     = items[itemIdx] ?? items[0];
    const vd       = VENUE_DATA[venueIdx];

    document.getElementById('hdr-venue-name').innerHTML = VENUE_TITLES[venueIdx];

    // Left: same list, click changes item without page transition
    const listEl = document.getElementById('p6-list');
    buildItemList(listEl, 'p6-item', items, lang, null, idx => {
      if (items[idx].type === 'cataleg') { const u = getCatalegUrl(); if (u) window.open(u, '_blank'); return; }
      if (items[idx].type === 'reserva') { window.open('https://espaigastronomia.simplybook.it/v2/#book', '_blank'); return; }
      sel.itemIdx = idx;
      renderItemDetail(items[idx], vd);
      listEl.querySelectorAll('.p6-item').forEach((el, i) => {
        el.classList.toggle('is-active', i === idx);
      });
      listEl.classList.add('has-hover');
    });
    // Year label at top of item list
    const yearLabel = document.createElement('div');
    yearLabel.className = 'p6-list-year';
    if (sel.year === '2028') {
      yearLabel.innerHTML = `${sel.year}<span class="list-year-notice">Preus orientatius 2027 · Oferta 2028 pendent de confirmar</span>`;
    } else {
      yearLabel.textContent = sel.year || '2027';
    }
    listEl.insertBefore(yearLabel, listEl.firstChild);

    // Persist selection when mouse leaves
    listEl.onmouseleave = () => {
      listEl.querySelectorAll('.p6-item').forEach((el, i) => {
        el.classList.toggle('is-active', i === sel.itemIdx);
      });
      listEl.classList.add('has-hover');
    };
    // Mark current active item
    const els = listEl.querySelectorAll('.p6-item');
    els[itemIdx]?.classList.add('is-active');
    listEl.classList.add('has-hover');

    // Mobile: horizontal pills nav
    const mobNav = document.getElementById('p6-mob-nav');
    mobNav.innerHTML = '';
    const mobYear = document.createElement('div');
    mobYear.className = 'p6-mob-year';
    mobYear.textContent = sel.year || '2027';
    mobNav.appendChild(mobYear);
    items.forEach((it, i) => {
      const pill = document.createElement('button');
      pill.className = 'p6-mob-pill' + (i === itemIdx ? ' is-active' : '');
      pill.textContent = (ITEM_LABELS[it.key] || {})[lang] || it.key;
      pill.onclick = () => {
        if (it.type === 'cataleg') { const u = getCatalegUrl(); if (u) window.open(u, '_blank'); return; }
        if (it.type === 'reserva') { window.open('https://espaigastronomia.simplybook.it/v2/#book', '_blank'); return; }
        sel.itemIdx = i;
        renderItemDetail(it, vd);
        mobNav.querySelectorAll('.p6-mob-pill').forEach((p, j) => p.classList.toggle('is-active', j === i));
        listEl.querySelectorAll('.p6-item').forEach((el, j) => el.classList.toggle('is-active', j === i));
        listEl.classList.add('has-hover');
      };
      mobNav.appendChild(pill);
    });
    const activePill = mobNav.querySelector('.p6-mob-pill.is-active');
    if (activePill) activePill.scrollIntoView({ block: 'nearest', inline: 'center' });

    renderItemDetail(item, vd);
  }

  function renderItemDetail(item, vd) {
    const lang      = sel.language || 'Català';
    const centerEl = document.getElementById('p6-center');
    const rightEl  = document.getElementById('p6-right');
    const layoutEl = document.getElementById('p6-layout');
    layoutEl.classList.toggle('is-galeria', item.type === 'galeria');
    layoutEl.classList.toggle('is-preus',   item.type === 'preus');

    // ── CENTER ──
    _carouselNav = null;
    if (item.type === 'mapa') {
      centerEl.innerHTML = `<div class="p6-map"><iframe src="${vd.mapSrc}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>`;
    } else if (item.type === 'galeria') {
      if (item.images && item.images.length > 0) {
        const grid = document.createElement('div');
        grid.className = 'p6-grid';
        item.images.forEach((src, i) => {
          const cell = document.createElement('div');
          cell.className = 'p6-grid-item';
          const img = document.createElement('img');
          img.src = src; img.alt = ''; img.loading = 'lazy';
          cell.appendChild(img);
          cell.onclick = () => openLightbox(item.images, i);
          grid.appendChild(cell);
        });
        centerEl.innerHTML = '';
        centerEl.appendChild(grid);
      } else {
        centerEl.innerHTML = `<div class="p6-media"><img src="${vd.fallback}" alt=""></div>`;
      }
    } else if (item.type === 'preus') {
      centerEl.innerHTML = '';
    } else {
      const imgs = (item.images && item.images.length > 0)
        ? item.images
        : item.img ? [item.img] : [vd.fallback];
      if (imgs.length > 1) {
        makeCarousel(centerEl, imgs);
      } else {
        centerEl.innerHTML = `<div class="p6-media"><img src="${imgs[0]}" alt=""></div>`;
      }
    }

    // ── RIGHT ──
    if (item.type === 'preus') {
      const wrap = document.createElement('div');
      wrap.className = 'p6-preus-wrap';
      buildPreusInteractive(wrap, item, lang);
      rightEl.innerHTML = '';
      rightEl.appendChild(wrap);

    } else if (item.type === 'mapa') {
      const coords = (vd.mapSrc.match(/[?&]q=([\d.,]+)/) || [])[1] || '';
      const mapsUrl = coords ? `https://www.google.com/maps?q=${coords}` : 'https://www.google.com/maps';
      const btnLabel = MAPS_BTN[lang] || MAPS_BTN['Català'];
      rightEl.innerHTML = `
        <div class="p6-title">${itemTitle(item, lang)}</div>
        <a class="p6-maps-btn" href="${mapsUrl}" target="_blank" rel="noopener noreferrer">
          ${btnLabel}
          <span class="p6-maps-btn-arrow"></span>
        </a>`;

    } else if (item.type === 'galeria') {
      rightEl.innerHTML = '';

    } else {
      // Standard item
      const titleKey    = itemTitle(item, lang);
      const titleHtml   = `<div class="p6-title">${titleKey}</div>`;
      const badgeHtml   = MANDATORY_KEYS.has(item.key)
        ? `<div class="p6-mandatory-badge">${MANDATORY_LABEL[lang] || 'Imprescindible'}</div>`
        : '';
      const tFeat = FEAT_TRANS[lang] || {};
      const featuresHtml = item.features
        ? `<ul class="p6-features">${item.features.map(f => `<li>${tFeat[f] || f}</li>`).join('')}</ul>`
        : '';
      const tNote = NOTE_TRANS[lang] || {};
      const noteHtml  = item.note ? `<div class="p6-note">${tNote[item.note] || item.note}</div>` : '';
      const priceHtml = item.price ? `<div class="p6-price">${item.price}<span class="p6-price-iva">+IVA</span></div>` : '';
      const preusBtnHtml = item.key === 'menu'
        ? `<button class="p6-preus-link-btn">${(ITEM_TITLES['preus']||{})[lang]||(ITEM_TITLES['preus']||{})['Català']||'Preu del menú'}<span class="p6-preus-link-arrow"></span></button>`
        : '';
      rightEl.innerHTML = titleHtml + badgeHtml + featuresHtml + noteHtml + priceHtml + preusBtnHtml;
      if (item.key === 'menu') {
        rightEl.querySelector('.p6-preus-link-btn').onclick = () => {
          const allItems = getVenueItems();
          const preusIdx = allItems.findIndex(i => i.key === 'preus');
          if (preusIdx === -1) return;
          const listEl = document.getElementById('p6-list');
          const mobNav = document.getElementById('p6-mob-nav');
          sel.itemIdx = preusIdx;
          renderItemDetail(allItems[preusIdx], vd);
          listEl.querySelectorAll('.p6-item').forEach((el, i) => el.classList.toggle('is-active', i === preusIdx));
          listEl.classList.add('has-hover');
          mobNav.querySelectorAll('.p6-mob-pill').forEach((p, j) => p.classList.toggle('is-active', j === preusIdx));
          const activePill = mobNav.querySelector('.p6-mob-pill.is-active');
          if (activePill) activePill.scrollIntoView({ block: 'nearest', inline: 'center' });
        };
      }
    }
  }

  /* ═══════════════════════════════════════════════════════
     TRACKING — Umami custom events
  ═══════════════════════════════════════════════════════ */

  (function () {
    function utrack(event, props) {
      if (typeof umami === 'undefined') return;
      umami.track(event, props);
    }

    const VENUE_SLUGS = ['can-macia', 'can-alzina', 'castell-de-tous', 'mas-vivencs'];
    const PAGE_NAMES  = ['idioma', 'any', 'escenaris', 'espais', 'finca', 'detall'];

    // ── Page transitions ──────────────────────────────────
    // Wraps navigate() sense modificar la lògica existent.
    // La reassignació funciona perquè JS resol l'identificador
    // al moment de la crida, no al moment de la definició.
    const _origNav = navigate;
    navigate = function (to, opts) {
      _origNav(to, opts);
      const props = { pagina: PAGE_NAMES[to] || ('pagina-' + to) };
      if (to >= 1) props.idioma = sel.language || null;
      if (to >= 2) props.any    = sel.year     || null;
      if (to >= 4) props.finca  = VENUE_SLUGS[sel.venueIdx ?? 0] || null;
      utrack('pagina_vista', props);
    };

    // ── Item detail — seccions de la pàgina 5 ────────────
    const _origRender = renderItemDetail;
    renderItemDetail = function (item, vd) {
      _origRender(item, vd);
      utrack('seccio_vista', {
        finca:  VENUE_SLUGS[sel.venueIdx ?? 0] || null,
        seccio: item.key,
        any:    sel.year     || null,
        idioma: sel.language || null,
      });
    };

    // ── CTA clicks ────────────────────────────────────────
    document.addEventListener('click', function (e) {
      const venueProps = {
        finca:  VENUE_SLUGS[sel.venueIdx ?? 0] || null,
        any:    sel.year     || null,
        idioma: sel.language || null,
      };

      // Reservar visita — botons de header i overlay
      if (e.target.closest('.book-link, .overlay-book')) {
        utrack('cta_clic', { tipus: 'reserva-visita' });
        return;
      }
      // Reserva — targeta mòbil
      if (e.target.closest('.mob-card-reserva')) {
        utrack('cta_clic', { tipus: 'reserva-visita', ...venueProps });
        return;
      }
      // Catàleg PDF — targeta mòbil
      if (e.target.closest('.mob-card-cataleg')) {
        utrack('cta_clic', { tipus: 'cataleg-pdf', ...venueProps });
        return;
      }
      // Google Maps
      if (e.target.closest('.p6-maps-btn')) {
        utrack('cta_clic', { tipus: 'mapes', finca: venueProps.finca });
        return;
      }

      // Desktop: llista p5 i p6 — ítems de reserva i catàleg
      const listItem = e.target.closest('#p5-list .p5-item, #p6-list .p6-item');
      if (listItem) {
        const item = getVenueItems()[parseInt(listItem.dataset.idx)];
        if (item?.type === 'cataleg') utrack('cta_clic', { tipus: 'cataleg-pdf',    ...venueProps });
        if (item?.type === 'reserva') utrack('cta_clic', { tipus: 'reserva-visita', ...venueProps });
        return;
      }

      // Mòbil: pills de la pàgina 5 — reserva i catàleg
      const pill = e.target.closest('#p6-mob-nav .p6-mob-pill');
      if (pill) {
        const idx  = [...document.querySelectorAll('#p6-mob-nav .p6-mob-pill')].indexOf(pill);
        const item = getVenueItems()[idx];
        if (item?.type === 'cataleg') utrack('cta_clic', { tipus: 'cataleg-pdf',    ...venueProps });
        if (item?.type === 'reserva') utrack('cta_clic', { tipus: 'reserva-visita', ...venueProps });
      }
    });
  }());
  
  /* ═══════════════════════════════════════════════════════
     HELPERS DE DADES AMB ESTAT (usen `sel`)
  ═══════════════════════════════════════════════════════ */

  function getCatalegUrl() {
    const venueIdx = sel.venueIdx ?? 0;
    const year = sel.year || '2027';
    const lang = sel.language || 'Català';
    return CATALEG_URLS[venueIdx]?.[year]?.[lang] || null;
  }

  function itemTitle(item, lang) {
    if (item.key === 'cerimonia') {
      const prefixes = CERIMONIA_PREFIX[lang] || CERIMONIA_PREFIX['Català'];
      const prefix = prefixes[sel.venueIdx ?? 0] ?? prefixes[0];
      return `${prefix} ${VENUE_NAMES[sel.venueIdx ?? 0]}`;
    }
    return (ITEM_TITLES[item.key] || {})[lang] || (ITEM_TITLES[item.key] || {})['Català'] || item.key;
  }

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

  /* ═══════════════════════════════════════════════════════
     PAGE 2 — QUATRE ESCENARIS (arc UI)
  ═══════════════════════════════════════════════════════ */

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
     PAGE 4 — VENUE DETAIL (llista d'ítems)
  ═══════════════════════════════════════════════════════ */

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

  /* ═══════════════════════════════════════════════════════
     COMPONENTS — Carousel mòbil
  ═══════════════════════════════════════════════════════ */

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

  /* ═══════════════════════════════════════════════════════
     COMPONENTS — Taula de preus interactiva
  ═══════════════════════════════════════════════════════ */

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

  /* ═══════════════════════════════════════════════════════
     MOBILE CARDS — targetes d'ítems per a mòbil (P4)
  ═══════════════════════════════════════════════════════ */

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
     COMPONENTS — Carousel de desktop (P5)
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

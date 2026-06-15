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

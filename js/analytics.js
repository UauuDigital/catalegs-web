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

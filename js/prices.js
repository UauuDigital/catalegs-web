  /* ═══════════════════════════════════════════════════════
     PREUS — Sincronització amb Google Sheets
     Patxa VENUE_DATA en memòria sense bloquejar la navegació.
     Si el fetch falla, es mantenen els preus hardcoded de data.js.
  ═══════════════════════════════════════════════════════ */

  const _PREUS_CSV = 'https://docs.google.com/spreadsheets/d/1sDCJhzn-xYT26mY23dKkmuSakEgbPorwfabaUHf1tSg/export?format=csv&gid=0';

  // Masia (columna) → índex de VENUE_DATA
  const _PREUS_MASIA = {
    'Can Macià':       0,
    "Ca n'Alzina":     1,
    'Castell de Tous': 2,
    'Mas Vivencs':     3,
  };

  // Nom Servei (columna) → claus d'ítem a VENUE_DATA
  // Allotjament cobreix tant 'allotjament' com 'suite' (Mas Vivencs 2026)
  const _PREUS_KEYS = {
    'Cerimònia':               ['cerimonia'],
    'Quota serveis essencials': ['quota'],
    'DJ':                      ['dj'],
    'Allotjament':             ['allotjament', 'suite'],
  };

  function _csvLine(line) {
    const out = [];
    let f = '', q = false;
    for (const c of line) {
      if (c === '"')             { q = !q; }
      else if (c === ',' && !q) { out.push(f); f = ''; }
      else                       { f += c; }
    }
    out.push(f);
    return out;
  }

  // Converteix "1390", "1.390", "1390,00", "1.390,00", "1390,00 €" → "1.390,00€"
  function _formatPreu(raw) {
    let s = String(raw).trim().replace(/[€\s]/g, ''); // elimina € i espais
    s = s.replace(/,\d+$/, '');                        // elimina decimal coma: "1390,00" → "1390"
    const digits = s.replace(/[^\d]/g, '');            // elimina punts de milers
    if (!digits) return null;
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',00€';
  }

  function _aplicarPreus(csv) {
    const lines = csv.replace(/^﻿/, '').trim().split(/\r?\n/);
    if (lines.length < 2) return;

    const hdrs = _csvLine(lines[0]).map(h => h.trim().replace(/"/g, ''));
    const iN = hdrs.indexOf('Nom Servei');
    const iM = hdrs.indexOf('Masia');
    const iA = hdrs.indexOf('Any');
    const iP = hdrs.indexOf('Preu');

    if ([iN, iM, iA, iP].some(x => x === -1)) {
      console.warn('[preus] Capçaleres no trobades. S\'espera: Nom Servei, Masia, Any, Preu');
      console.warn('[preus] Capçaleres rebudes:', JSON.stringify(hdrs));
      return;
    }

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const cols = _csvLine(lines[i]);
      const nom  = cols[iN]?.trim();
      const any  = String(cols[iA]?.trim());
      const preu = _formatPreu(cols[iP]?.trim());

      const keys = _PREUS_KEYS[nom];
      if (!keys || !preu) continue;

      // La cel·la Masia pot contenir múltiples finques separades per comes
      const masies = (cols[iM] || '').split(',').map(m => m.trim()).filter(Boolean);

      for (const masia of masies) {
        const idx = _PREUS_MASIA[masia];
        if (idx === undefined) continue;

        const items = VENUE_DATA[idx]?.years[any];
        if (!items) continue;

        keys.forEach(k => {
          const item = items.find(it => it.key === k);
          if (item) item.price = preu;
        });
      }
    }
  }

  fetch(_PREUS_CSV)
    .then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    })
    .then(csv => {
      _aplicarPreus(csv);
      // Si l'usuari ja és a P4 o P5, re-renderitza amb els preus actualitzats
      if (typeof curPage !== 'undefined') {
        if (curPage === 4) requestAnimationFrame(initPage4);
        if (curPage === 5) requestAnimationFrame(initPage5);
      }
    })
    .catch(err => console.warn('[preus] Error carregant preus del full de càlcul:', err));

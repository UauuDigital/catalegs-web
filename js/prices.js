  /* ═══════════════════════════════════════════════════════
     PREUS — Sincronització amb Google Sheets
     Patxa VENUE_DATA en memòria sense bloquejar la navegació.
     Si el fetch falla, es mantenen els preus hardcoded de data.js.
  ═══════════════════════════════════════════════════════ */

  const _PREUS_CSV      = 'https://docs.google.com/spreadsheets/d/1sDCJhzn-xYT26mY23dKkmuSakEgbPorwfabaUHf1tSg/export?format=csv&gid=0';
  const _PREUS_MENU_CSV = 'https://docs.google.com/spreadsheets/d/1sDCJhzn-xYT26mY23dKkmuSakEgbPorwfabaUHf1tSg/export?format=csv&gid=1385757976';

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

  // Mesos que porten "d'" en lloc de "de" en català
  const _VOCAL_MES = ['Abril', 'Agost', 'Octubre'];

  // Singulars que necessiten plural per als dies de la setmana
  const _PLURAL_DIA = { 'Dissabte': 'Dissabtes', 'Diumenge': 'Diumenges' };

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

  // Converteix "1390", "1.390", "1390,00", "1390,00 €" → "1.390,00€"
  function _formatPreu(raw) {
    let s = String(raw).trim().replace(/[€\s]/g, ''); // elimina € i espais
    s = s.replace(/,\d+$/, '');                        // elimina decimal coma: "1390,00" → "1390"
    const digits = s.replace(/[^\d]/g, '');            // elimina punts de milers
    if (!digits) return null;
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',00€';
  }

  // Genera la frase de data a partir de Dia i Mes del full
  // Ex: ("Dissabte", "Juny, Juliol") → "Dissabtes de Juny i Juliol"
  // Ex: ("Diumenge", "")             → "Tots els Diumenges de l'any"
  function _dateFrase(dia, mes) {
    const dies   = dia.split(',').map(d => d.trim()).filter(Boolean);
    const mesos  = mes ? mes.split(',').map(m => m.trim()).filter(Boolean) : [];

    const joinAnd = arr => arr.length < 2 ? arr[0] || '' :
      arr.slice(0, -1).join(', ') + ' i ' + arr[arr.length - 1];

    const diesPlur = dies.map(d => _PLURAL_DIA[d] || d);
    const diesStr  = joinAnd(diesPlur);

    if (mesos.length === 0) return "Tots els " + diesStr + " de l'any";

    const prep    = _VOCAL_MES.includes(mesos[0]) ? "d'" : "de ";
    const mesosStr = joinAnd(mesos);
    return diesStr + ' ' + prep + mesosStr;
  }

  // Determina el codi de dia ('dis','div','diu','dll') a partir de la columna Dia
  function _diaCode(dia) {
    if (dia.includes('Dissabte'))  return 'dis';
    if (dia.includes('Divendres')) return 'div';
    if (dia.includes('Diumenge'))  return 'diu';
    return 'dll';
  }

  function _rerender() {
    if (typeof curPage === 'undefined') return;
    if (curPage === 4) requestAnimationFrame(initPage4);
    if (curPage === 5) requestAnimationFrame(initPage5);
  }

  // ── Pestanya principal: preus per servei (cerimònia, quota, DJ, allotjament) ──
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

  // ── Banquet a l'exterior (Ca n'Alzina): preu compost "X per convidat, mínim Y" ──
  const _NOM_BANQUET_EXT = "Banquet a l'exterior";

  function _aplicarBanquetExterior(csv) {
    const lines = csv.replace(/^﻿/, '').trim().split(/\r?\n/);
    if (lines.length < 2) return;

    const hdrs  = _csvLine(lines[0]).map(h => h.trim().replace(/"/g, ''));
    const iN    = hdrs.indexOf('Nom Servei');
    const iM    = hdrs.indexOf('Masia');
    const iA    = hdrs.indexOf('Any');
    const iConv = hdrs.indexOf('Llindà preu X<0');
    const iMin  = hdrs.indexOf('Llindà preu 0<X');

    if ([iN, iM, iA, iConv, iMin].some(x => x === -1)) {
      console.warn('[banquet-exterior] Capçaleres no trobades. S\'espera: Nom Servei, Masia, Any, Llindà preu X<0, Llindà preu 0<X');
      console.warn('[banquet-exterior] Capçaleres rebudes:', JSON.stringify(hdrs));
      return;
    }

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const cols = _csvLine(lines[i]);
      const nom  = cols[iN]?.trim();
      if (nom !== _NOM_BANQUET_EXT) continue;

      // Nota: al full real, "Llindà preu 0<X" és el preu per convidat (valor petit, ex. 15€)
      // i "Llindà preu X<0" és el mínim (valor gran, ex. 1.500€) — invers al que suggeria
      // el nom de les columnes. Verificat contra dades reals de Ca n'Alzina 2026/2027.
      const any         = String(cols[iA]?.trim());
      const preuConvidat = _formatPreu(cols[iMin]?.trim());
      const preuMinim    = _formatPreu(cols[iConv]?.trim());
      if (!preuConvidat || !preuMinim) continue;

      const masies = (cols[iM] || '').split(',').map(m => m.trim()).filter(Boolean);
      for (const masia of masies) {
        const idx = _PREUS_MASIA[masia];
        if (idx === undefined) continue;
        const items = VENUE_DATA[idx]?.years[any];
        if (!items) continue;
        const item = items.find(it => it.key === 'banquet_exterior');
        if (item) {
          item.price = `${preuConvidat} / convidat`;
          item.priceSub = `Mínim ${preuMinim}`;
        }
      }
    }
  }

  // ── Pestanya PreusMenu: taula de preus per persona del menú ──
  function _aplicarPreusMenu(csv) {
    const lines = csv.replace(/^﻿/, '').trim().split(/\r?\n/);
    if (lines.length < 2) return;

    const hdrs = _csvLine(lines[0]).map(h => h.trim().replace(/"/g, ''));
    const iMin = hdrs.indexOf('MÍN');
    const iP   = hdrs.indexOf('PREU/P');
    const iDia = hdrs.indexOf('Dia');
    const iMes = hdrs.indexOf('Mes');
    const iM   = hdrs.indexOf('Masia');
    const iA   = hdrs.indexOf('Any');

    if ([iMin, iP, iDia, iM, iA].some(x => x === -1)) {
      console.warn('[preus-menu] Capçaleres no trobades. S\'espera: MÍN, PREU/P, Dia, Masia, Any');
      console.warn('[preus-menu] Capçaleres rebudes:', JSON.stringify(hdrs));
      return;
    }

    // Acumula files per (idx, any) per substituir el rows[] sencer
    const grups = {};

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const cols = _csvLine(lines[i]);
      const dia  = cols[iDia]?.trim() || '';
      const mes  = iMes !== -1 ? (cols[iMes]?.trim() || '') : '';
      const min  = parseInt(String(cols[iMin]?.trim()).replace(/[^\d]/g, ''), 10) || 0;
      const preu = _formatPreu(cols[iP]?.trim());
      const any  = String(cols[iA]?.trim());

      if (!dia || !preu) continue;

      const masies = (cols[iM] || '').split(',').map(m => m.trim()).filter(Boolean);
      for (const masia of masies) {
        const idx = _PREUS_MASIA[masia];
        if (idx === undefined) continue;

        const k = idx + '-' + any;
        if (!grups[k]) grups[k] = { idx, any, rows: [] };
        grups[k].rows.push({ date: _dateFrase(dia, mes), day: _diaCode(dia), min, price: preu });
      }
    }

    // Substitueix rows[] a VENUE_DATA
    for (const { idx, any, rows } of Object.values(grups)) {
      const items = VENUE_DATA[idx]?.years[any];
      if (!items) continue;
      const preusItem = items.find(it => it.key === 'preus');
      if (preusItem) preusItem.rows = rows;
    }
  }

  // Llança els dos fetchos en paral·lel i re-renderitza quan ambdós acabin
  Promise.all([
    fetch(_PREUS_CSV)
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
      .then(csv => { _aplicarPreus(csv); _aplicarBanquetExterior(csv); })
      .catch(err => console.warn('[preus] Error:', err)),
    fetch(_PREUS_MENU_CSV)
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
      .then(_aplicarPreusMenu)
      .catch(err => console.warn('[preus-menu] Error:', err)),
  ]).then(_rerender);

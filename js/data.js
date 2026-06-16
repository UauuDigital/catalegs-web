  /* ═══════════════════════════════════════════════════════
     CONTINGUT P2 — QUATRE ESCENARIS
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

  /* ═══════════════════════════════════════════════════════
     CONTINGUT P3 — SELECTOR DE FINQUES
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

  /* ═══════════════════════════════════════════════════════
     NOMS I TÍTOLS DE FINQUES
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

  /* ═══════════════════════════════════════════════════════
     ETIQUETES I TRADUCCIONS D'ÍTEMS
  ═══════════════════════════════════════════════════════ */

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

  const MANDATORY_KEYS  = new Set(['quota', 'dj']);
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

  // UI strings for preus panel
  const PREUS_UI = {
    'Català':  { date:'Data',  min:'Mín.',  price:'Preu/p.',    dis:'Dissabtes', div:'Divendres', diu:'Diumenges', dll:'Dll–Dij' },
    'Español': { date:'Fecha', min:'Mín.',  price:'Precio/p.',  dis:'Sábados',   div:'Viernes',   diu:'Domingos',  dll:'Lun–Jue' },
    'English': { date:'Date',  min:'Min.',  price:'Price/p.',   dis:'Saturdays', div:'Fridays',   diu:'Sundays',   dll:'Mon–Thu' },
  };

  // Maps button label
  const MAPS_BTN = { 'Català':'Com arribar-hi', 'Español':'Cómo llegar', 'English':'Getting there' };

  /* ═══════════════════════════════════════════════════════
     URLS DE CATÀLEGS PDF
  ═══════════════════════════════════════════════════════ */

  // Catalogue PDF URLs per venue index, year and language
  const CATALEG_URLS = {
    0: { // Can Macià
      '2026': { 'Català': 'https://drive.google.com/file/d/1LDVu9t_vv71nwCAautXGtXVKzAQQiPtc/view?usp=drive_link', 'Español': 'https://drive.google.com/file/d/1omL_4k2vrKsvxsuZD7hTxD4pVNH1MT41/view?usp=drive_link', 'English': 'https://drive.google.com/file/d/1eJ5FV16dCFiKtSQQ_7mwBd5OEMTbBiAN/view?usp=drive_link' },
      '2027': { 'Català': 'https://drive.google.com/file/d/1Wntl4PdsY60KAkj82vavVkig4Lpwwv-q/view?usp=drive_link', 'Español': 'https://drive.google.com/file/d/1Vb_nRlh9_x9QHiQiGLSvBWyGQcy3swqI/view?usp=drive_link', 'English': 'https://drive.google.com/file/d/1uSnO6md3JorBFhSHYOno6-lwYOUkL8npB/view?usp=drive_link' },
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

  /* ═══════════════════════════════════════════════════════
     TRADUCCIONS DE FEATURES, NOTES I PREUS
  ═══════════════════════════════════════════════════════ */

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

  /* ═══════════════════════════════════════════════════════
     IMATGES I DADES DE FINQUES (VENUE_DATA)
  ═══════════════════════════════════════════════════════ */

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
            note: '*El preu de la cerimònia no inclou cerimoniant', price: null },
          { key:'menu', type:'standard',
            images: gastImgs(),
            features: ["Aperitiu a escollir",'Barra de begudes','Plat principal','Pre postre','Pastís de noces','2 hores de barra lliure','Centres florals de taula','Menatge de taula a seleccionar','Papereria (minutes, sitting plan, marca llocs)','Coordinació del casament'],
            price: null },
          { key:'preus', type:'preus',
            img: IMG + 'can-macia/gastronomia/pallares-01732.webp',
            rows: [], notes: preusNotes('can-macia') },
          { key:'dj', type:'standard',
            img: 'https://uauu.cat/media/general/dj/festa.webp',
            features: ["Música des de l'aperitiu fins al final de la festa","Reunió prèvia al casament per acordar tota la selecció musical","Servei de pantalla i projecció","Sopar del DJ"],
            note: '*No inclou taxes SGAE i AGEDI', price: null },
          { key:'allotjament', type:'standard',
            images: _CM_ALLOT,
            features: ['Allotjament complert fins a 15 persones',"Inclou l'esmorzar de l'endemà",'Sortida a les 11:30h'],
            note: '*Obligatori en dissabtes de Maig a Octubre', price: null },
          { key:'galeria', type:'galeria', images: _CM_GAL },
          { key:'ubicacio', type:'mapa' },
          { key:'reserva',  type:'reserva' },
          { key:'cataleg',  type:'cataleg' },
        ],
        '2027': [
          { key:'cerimonia', type:'standard',
            images: _CM_CERIM,
            features: ['Muntatge de cadires','Decoració floral','Música i DJ amb megafonia',"Habitació per canviar-se la núvia o nuvi",'Welcome drink','Arc floral','Paquet de pètals','Possibilitat de celebrar cerimònia religiosa'],
            note: '*El preu de la cerimònia no inclou cerimoniant', price: null },
          { key:'menu', type:'standard',
            images: gastImgs(),
            features: ["Aperitiu a escollir",'Barra de begudes','Plat principal','Pre postre','Pastís de noces','2 hores de barra lliure','Centres florals de taula','Menatge de taula a seleccionar'],
            price: null },
          { key:'preus', type:'preus',
            img: IMG + 'can-macia/gastronomia/pallares-01732.webp',
            rows: [], notes: preusNotes('can-macia') },
          { key:'quota', type:'standard',
            img: 'https://uauu.cat/media/general/serveis-esencials/coordinacio.webp',
            features: ["Exclusivitat de l'espai durant el casament",'Coordinació del casament','Assistència al Pre Wedding Day pels nuvis','Menú de tast pels nuvis','Sitting Plan','Papereria (minutes i marca llocs)','Servei de neteja durant l\'esdeveniment'],
            price: null },
          { key:'dj', type:'standard',
            img: 'https://uauu.cat/media/general/dj/festa.webp',
            features: ["Música des de l'aperitiu fins al final de la festa","Reunió prèvia al casament per acordar tota la selecció musical","Servei de pantalla i projecció","Sopar del DJ"],
            note: '*No inclou taxes SGAE i AGEDI', price: null },
          { key:'allotjament', type:'standard',
            images: _CM_ALLOT,
            features: ['Allotjament complert fins a 15 persones',"Inclou l'esmorzar de l'endemà",'Sortida a les 11:30h'],
            note: '*Obligatori en dissabtes de Maig a Octubre', price: null },
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
            note: '*El preu de la cerimònia no inclou cerimoniant', price: null },
          { key:'menu', type:'standard',
            images: gastImgs(),
            features: ["Aperitiu a escollir",'Barra de begudes','Plat principal','Pre postre','Pastís de noces','2 hores de barra lliure','Centres florals de taula','Menatge de taula a seleccionar','Papereria (minutes, sitting plan, marca llocs)','Coordinació del casament'],
            price: null },
          { key:'preus', type:'preus',
            img: IMG + "ca-n-alzina/gastronomia/pallares-01732.webp",
            rows: [], notes: preusNotes('can-alzina') },
          { key:'dj', type:'standard',
            img: 'https://uauu.cat/media/general/dj/festa.webp',
            features: ["Música des de l'aperitiu fins al final de la festa","Reunió prèvia al casament per acordar tota la selecció musical","Servei de pantalla i projecció","Sopar del DJ"],
            note: '*No inclou taxes SGAE i AGEDI', price: null },
          { key:'allotjament', type:'standard',
            images: _CNA_ALLOT,
            features: ['Allotjament complert fins a 21 persones',"Inclou l'esmorzar de l'endemà",'Sortida a les 11:30h'],
            note: '*Obligatori en dissabtes de Maig a Octubre', price: null },
          { key:'galeria', type:'galeria', images: _CNA_GAL },
          { key:'ubicacio', type:'mapa' },
          { key:'reserva',  type:'reserva' },
          { key:'cataleg',  type:'cataleg' },
        ],
        '2027': [
          { key:'cerimonia', type:'standard',
            images: _CNA_CERIM,
            features: ['Muntatge de cadires','Decoració floral','Música i DJ amb megafonia',"Habitació per canviar-se la núvia o nuvi",'Welcome drink','Arc floral','Paquet de pètals'],
            note: '*El preu de la cerimònia no inclou cerimoniant', price: null },
          { key:'menu', type:'standard',
            images: gastImgs(),
            features: ["Aperitiu a escollir",'Barra de begudes','Plat principal','Pre postre','Pastís de noces','2 hores de barra lliure','Centres florals de taula','Menatge de taula a seleccionar'],
            price: null },
          { key:'preus', type:'preus',
            img: IMG + "ca-n-alzina/gastronomia/pallares-01732.webp",
            rows: [], notes: preusNotes('can-alzina') },
          { key:'quota', type:'standard',
            img: 'https://uauu.cat/media/general/serveis-esencials/coordinacio.webp',
            features: ["Exclusivitat de l'espai durant el casament",'Coordinació del casament','Assistència al Pre Wedding Day pels nuvis','Menú de tast pels nuvis','Sitting Plan','Papereria (minutes i marca llocs)','Servei de neteja durant l\'esdeveniment'],
            price: null },
          { key:'dj', type:'standard',
            img: 'https://uauu.cat/media/general/dj/festa.webp',
            features: ["Música des de l'aperitiu fins al final de la festa","Reunió prèvia al casament per acordar tota la selecció musical","Servei de pantalla i projecció","Sopar del DJ"],
            note: '*No inclou taxes SGAE i AGEDI', price: null },
          { key:'allotjament', type:'standard',
            images: _CNA_ALLOT,
            features: ['Allotjament complert fins a 21 persones',"Inclou l'esmorzar de l'endemà",'Sortida a les 11:30h'],
            note: '*Obligatori en dissabtes de Maig a Octubre', price: null },
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
            note: '*El preu de la cerimònia no inclou cerimoniant', price: null },
          { key:'menu', type:'standard',
            images: gastImgs(),
            features: ["Aperitiu a escollir",'Barra de begudes','Plat principal','Pre postre','Pastís de noces','2 hores de barra lliure','Centres florals de taula','Menatge de taula a seleccionar','Papereria (minutes, sitting plan, marca llocs)','Coordinació del casament'],
            price: null },
          { key:'preus', type:'preus',
            img: IMG + 'castell-de-tous/gastronomia/pallares-01732.webp',
            rows: [], notes: preusNotes('castell-tous') },
          { key:'dj', type:'standard',
            img: 'https://uauu.cat/media/general/dj/festa.webp',
            features: ["Música des de l'aperitiu fins al final de la festa","Reunió prèvia al casament per acordar tota la selecció musical","Servei de pantalla i projecció","Sopar del DJ"],
            note: '*No inclou taxes SGAE i AGEDI', price: null },
          { key:'galeria', type:'galeria', images: _CDT_GAL },
          { key:'ubicacio', type:'mapa' },
          { key:'reserva',  type:'reserva' },
          { key:'cataleg',  type:'cataleg' },
        ],
        '2027': [
          { key:'cerimonia', type:'standard',
            images: _CDT_CERIM,
            features: ['Muntatge de cadires','Decoració floral','Música i DJ amb megafonia',"Habitació per canviar-se la núvia o nuvi",'Welcome drink','Arc floral','Paquet de pètals'],
            note: '*El preu de la cerimònia no inclou cerimoniant', price: null },
          { key:'menu', type:'standard',
            images: gastImgs(),
            features: ["Aperitiu a escollir",'Barra de begudes','Plat principal','Pre postre','Pastís de noces','2 hores de barra lliure','Centres florals de taula','Menatge de taula a seleccionar'],
            price: null },
          { key:'preus', type:'preus',
            img: IMG + 'castell-de-tous/gastronomia/pallares-01732.webp',
            rows: [], notes: preusNotes('castell-tous') },
          { key:'quota', type:'standard',
            img: 'https://uauu.cat/media/general/serveis-esencials/coordinacio.webp',
            features: ["Exclusivitat de l'espai durant el casament",'Coordinació del casament','Assistència al Pre Wedding Day pels nuvis','Menú de tast pels nuvis','Sitting Plan','Papereria (minutes i marca llocs)','Servei de neteja durant l\'esdeveniment'],
            price: null },
          { key:'dj', type:'standard',
            img: 'https://uauu.cat/media/general/dj/festa.webp',
            features: ["Música des de l'aperitiu fins al final de la festa","Reunió prèvia al casament per acordar tota la selecció musical","Servei de pantalla i projecció","Sopar del DJ"],
            note: '*No inclou taxes SGAE i AGEDI', price: null },
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
            note: '*El preu de la cerimònia no inclou cerimoniant', price: null },
          { key:'menu', type:'standard',
            images: gastImgs(),
            features: ["Aperitiu a escollir",'Barra de begudes','Plat principal','Pre postre','Pastís de noces','2 hores de barra lliure','Centres florals de taula','Menatge de taula a seleccionar','Papereria (minutes, sitting plan, marca llocs)','Coordinació del casament'],
            price: null },
          { key:'preus', type:'preus',
            img: IMG + 'mas-vivencs/gastronomia/pallares-01732.webp',
            rows: [], notes: preusNotes('mas-vivencs') },
          { key:'dj', type:'standard',
            img: 'https://uauu.cat/media/general/dj/festa.webp',
            features: ["Música des de l'aperitiu fins al final de la festa","Reunió prèvia al casament per acordar tota la selecció musical","Servei de pantalla i projecció","Sopar del DJ"],
            note: '*No inclou taxes SGAE i AGEDI', price: null },
          { key:'suite', type:'standard',
            images: _MV_SUITE,
            features: ['Allotjament per la parella',"Inclou l'esmorzar de l'endemà (sortida a les 11:30h)"],
            price: null },
          { key:'galeria', type:'galeria', images: _MV_GAL },
          { key:'ubicacio', type:'mapa' },
          { key:'reserva',  type:'reserva' },
          { key:'cataleg',  type:'cataleg' },
        ],
        '2027': [
          { key:'cerimonia', type:'standard',
            images: _MV_CERIM,
            features: ['Muntatge de cadires','Decoració floral','Música i DJ amb megafonia',"Habitació per canviar-se la núvia o nuvi",'Welcome drink','Arc floral','Paquet de pètals'],
            note: '*El preu de la cerimònia no inclou cerimoniant', price: null },
          { key:'menu', type:'standard',
            images: gastImgs(),
            features: ["Aperitiu a escollir",'Barra de begudes','Plat principal','Pre postre','Pastís de noces','2 hores de barra lliure','Centres florals de taula','Menatge de taula a seleccionar'],
            price: null },
          { key:'preus', type:'preus',
            img: IMG + 'mas-vivencs/gastronomia/pallares-01732.webp',
            rows: [], notes: preusNotes('mas-vivencs') },
          { key:'quota', type:'standard',
            img: 'https://uauu.cat/media/general/serveis-esencials/coordinacio.webp',
            features: ["Exclusivitat de l'espai durant el casament",'Coordinació del casament','Assistència al Pre Wedding Day pels nuvis','Menú de tast pels nuvis','Sitting Plan','Papereria (minutes i marca llocs)','Servei de neteja durant l\'esdeveniment'],
            price: null },
          { key:'dj', type:'standard',
            img: 'https://uauu.cat/media/general/dj/festa.webp',
            features: ["Música des de l'aperitiu fins al final de la festa","Reunió prèvia al casament per acordar tota la selecció musical","Servei de pantalla i projecció","Sopar del DJ"],
            note: '*No inclou taxes SGAE i AGEDI', price: null },
          { key:'allotjament', type:'standard',
            images: _MV_SUITE,
            features: ['Allotjament per la parella',"Inclou l'esmorzar de l'endemà (sortida a les 11:30h)"],
            price: null },
          { key:'galeria', type:'galeria', images: _MV_GAL },
          { key:'ubicacio', type:'mapa' },
          { key:'reserva',  type:'reserva' },
          { key:'cataleg',  type:'cataleg' },
        ],
      },
    },
  ];

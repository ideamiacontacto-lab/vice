/* Pestaña "Anual": el calendario anual de Vice por mes, nivel y tipo. Lee window.CAL_ANUAL (anual.js). */
(function () {
  const D = window.CAL_ANUAL; const meses = document.getElementById('an-meses'), filtros = document.getElementById('an-filtros'), lista = document.getElementById('an-lista');
  if (!D || !meses) return;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const MES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const MESL = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const NIVEL = { 1: 'Campaña mayor', 2: 'Campaña especial', 3: 'Campaña baja', 4: 'Mención' };
  const TIPO = { propia: 'De la marca', pais: 'Rubro y país', universo: 'Universo Miami' };
  const hoy = new Date(); const anioDe = m => (m - 1 < hoy.getMonth() ? hoy.getFullYear() + 1 : hoy.getFullYear()); // la próxima vez que cae
  const fecha = (m, d) => new Date(anioDe(m), m - 1, d);
  const ddmm = dt => dt.getDate() + '/' + (dt.getMonth() + 1);
  const dia = dt => ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'][dt.getDay()];
  const arranque = f => { // cuándo hay que empezar a planificar, según el nivel
    const dt = fecha(f.m, f.d);
    if (f.nivel === 1) return 'Brainstorming ' + ddmm(new Date(dt - 45 * 864e5)) + ' · planificar desde ' + ddmm(new Date(dt - 42 * 864e5));
    if (f.nivel === 2) return 'Planificar desde ' + ddmm(new Date(dt - 30 * 864e5));
    if (f.nivel === 3) return 'Se resuelve dentro del mes';
    return 'Mención eventual, sin acción';
  };
  let MES_SEL = hoy.getMonth() + 1, NIV = { 1: true, 2: true, 3: true, 4: true }, TIP = { propia: true, pais: true, universo: true }, ABIERTA = null;
  const pasa = f => NIV[f.nivel] && TIP[f.tipo];

  function pintarMeses() {
    meses.innerHTML = MES.map((n, i) => {
      const m = i + 1, fs = D.fechas.filter(f => f.m === m && pasa(f));
      const pts = fs.slice(0, 4).map(f => '<i class="n' + f.nivel + '"></i>').join('');
      return '<button class="an-m' + (m === MES_SEL ? ' sel' : '') + (m === hoy.getMonth() + 1 ? ' hoy' : '') + '" data-m="' + m + '" aria-pressed="' + (m === MES_SEL) + '"><b>' + n + '</b><span>' + pts + '</span></button>';
    }).join('');
  }
  function pintarFiltros() {
    filtros.innerHTML = [1, 2, 3, 4].map(n => '<button class="an-f n' + n + (NIV[n] ? ' on' : '') + '" data-n="' + n + '" aria-pressed="' + NIV[n] + '"><i></i>N' + n + '</button>').join('')
      + '<span class="an-sep"></span>'
      + Object.keys(TIPO).map(t => '<button class="an-f t' + (TIP[t] ? ' on' : '') + '" data-t="' + t + '" aria-pressed="' + TIP[t] + '">' + TIPO[t] + '</button>').join('');
  }
  function pintarLista() {
    const fs = D.fechas.filter(f => f.m === MES_SEL && pasa(f)).sort((a, b) => a.d - b.d);
    const anio = anioDe(MES_SEL);
    let html = '<p class="an-t">' + MESL[MES_SEL - 1].charAt(0).toUpperCase() + MESL[MES_SEL - 1].slice(1) + ' <span>' + anio + '</span></p>';
    if (NIV[1] && TIP.propia) html += '<div class="an-fijo"><i class="n1"></i><b>' + esc(D.fijo.t) + '</b><span>' + esc(D.fijo.d) + '</span></div>';
    if (!fs.length) html += '<p class="vacio">Nada en este mes con los filtros elegidos.</p>';
    fs.forEach((f, i) => {
      const k = f.m + '-' + f.d + '-' + i, dt = fecha(f.m, f.d), ab = ABIERTA === k;
      html += '<button class="an-c' + (ab ? ' ab' : '') + '" data-k="' + k + '" aria-expanded="' + ab + '">'
        + '<span class="an-d"><b>' + f.d + '</b><small>' + dia(dt) + '</small></span>'
        + '<span class="an-b"><b>' + esc(f.t) + '</b>'
        + '<span class="an-tags"><em class="n' + f.nivel + '">N' + f.nivel + ' · ' + NIVEL[f.nivel] + '</em><em class="tp">' + TIPO[f.tipo] + '</em></span>'
        + (ab ? '<span class="an-desc">' + esc(f.desc) + '</span><span class="an-cuando">' + esc(arranque(f)) + '</span>' : '')
        + '</span></button>';
    });
    lista.innerHTML = html;
    const ab = lista.querySelector('.an-c.ab'); if (ab) ab.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); // la tarjeta abierta queda a la vista dentro de la lista
  }
  const todo = () => { pintarMeses(); pintarFiltros(); pintarLista(); };
  meses.addEventListener('click', e => { const b = e.target.closest('.an-m'); if (b) { MES_SEL = +b.dataset.m; ABIERTA = null; todo(); } });
  filtros.addEventListener('click', e => {
    const b = e.target.closest('.an-f'); if (!b) return;
    if (b.dataset.n) NIV[b.dataset.n] = !NIV[b.dataset.n]; else TIP[b.dataset.t] = !TIP[b.dataset.t];
    todo();
  });
  lista.addEventListener('click', e => { const b = e.target.closest('.an-c'); if (b) { ABIERTA = ABIERTA === b.dataset.k ? null : b.dataset.k; pintarLista(); } });
  todo();
})();

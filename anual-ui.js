/* Pestaña "Anual": el calendario anual de Vice por mes, nivel y tipo. Lee window.CAL_ANUAL (anual.js). */
(function () {
  const D = window.CAL_ANUAL; const meses = document.getElementById('an-meses'), filtros = document.getElementById('an-filtros'), lista = document.getElementById('an-lista');
  if (!D || !meses) return;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const MES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const MESL = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const NIVEL = { 1: D.niveles[1].n, 2: D.niveles[2].n, 3: D.niveles[3].n, 4: D.niveles[4].n };
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
  const API = 'https://script.google.com/macros/s/AKfycbwCxld4KNBsNMSGGluIA138f1vaKBo2TnqMIXsO2Y8iV87k4d7NUic47-MpvEgYehZJ/exec', MARCA = 'vice-burger';
  let BM = {}, EDIT = false; // burger del mes por "aaaa-mm": la carga el cliente y queda en Trello
  try { BM = JSON.parse(localStorage.getItem('vice:bm') || '{}'); } catch (e) {}
  const clave = m => anioDe(m) + '-' + String(m).padStart(2, '0');
  const largaF = s => { const d = new Date(s + 'T12:00:00'); return ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][d.getDay()] + ' ' + d.getDate() + '/' + (d.getMonth() + 1); };
  let MES_SEL = hoy.getMonth() + 1, NIV_SEL = 0, ABIERTA = null, ANIMAR = true; // NIV_SEL 0 = todos los niveles
  const pasa = f => !NIV_SEL || f.nivel === NIV_SEL;

  function pintarMeses() {
    meses.innerHTML = MES.map((n, i) => {
      const m = i + 1, fs = D.fechas.filter(f => f.m === m && pasa(f));
      const pts = fs.slice(0, 4).map(f => '<i class="n' + f.nivel + '"></i>').join('');
      const y = anioDe(m); return '<button class="an-m' + (m === MES_SEL ? ' sel' : '') + (m === hoy.getMonth() + 1 ? ' hoy' : '') + '" data-m="' + m + '" aria-pressed="' + (m === MES_SEL) + '"><b>' + n + '</b><small>' + String(y).slice(2) + '</small><span>' + pts + '</span></button>';
    }).join('');
  }
  // Escala de niveles, de la campaña más grande a la mención: se elige uno (o todos) y abajo se explica qué significa.
  // Barras de intensidad: el nivel 1 llena las cuatro, el 4 una sola. Se lee el tamaño de la campaña sin leer texto.
  const barras = n => '<span class="bars n' + n + '">' + [1, 2, 3, 4].map(k => '<i' + (k <= 5 - n ? ' class="f"' : '') + '></i>').join('') + '</span>';
  // La escala se arma una sola vez: así el indicador puede deslizarse entre niveles en vez de redibujarse.
  function armarFiltros() {
    const cuenta = n => D.fechas.filter(f => f.nivel === n).length;
    filtros.innerHTML = '<div class="an-escala" role="radiogroup" aria-label="Nivel"><span class="an-ind" aria-hidden="true"></span>'
      + '<button class="an-e" data-n="0" role="radio">Todos</button>'
      + [1, 2, 3, 4].map(n => '<button class="an-e n' + n + '" data-n="' + n + '" role="radio" aria-label="Nivel ' + n + ', ' + cuenta(n) + ' fechas">' + barras(n) + '<span>N' + n + '</span></button>').join('')
      + '</div><div class="an-def" aria-live="polite"></div>';
  }
  function pintarFiltros() {
    if (!filtros.querySelector('.an-escala')) armarFiltros();
    const botones = [...filtros.querySelectorAll('.an-e')], ind = filtros.querySelector('.an-ind');
    botones.forEach(b => { const on = +b.dataset.n === NIV_SEL; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); });
    const sel = botones.find(b => +b.dataset.n === NIV_SEL);
    ind.style.width = sel.offsetWidth + 'px'; ind.style.transform = 'translateX(' + sel.offsetLeft + 'px)'; ind.className = 'an-ind n' + NIV_SEL;
    const L = D.niveles[NIV_SEL], def = filtros.querySelector('.an-def');
    def.className = 'an-def n' + NIV_SEL;
    def.innerHTML = L ? barras(NIV_SEL) + '<div><b>' + esc(L.n) + '</b><span>' + esc(L.que) + '</span><em>' + esc(L.cuando) + '</em></div>'
      : '<span class="bars-todos">' + [1, 2, 3, 4].map(barras).join('') + '</span><div><b>Cuatro niveles, de mayor a menor</b><span>Las barras muestran el tamaño de cada campaña. Tocá un nivel para filtrar.</span></div>';
    void def.offsetWidth; def.classList.add('in'); // vuelve a disparar la entrada
  }
  function burgerHtml() {
    const k = clave(MES_SEL), b = BM[k] || {};
    if (EDIT) {
      const y = anioDe(MES_SEL), ult = new Date(y, MES_SEL, 0).getDate();
      return '<form class="bm-form" id="bm-form"><p class="bm-k"><i class="n1"></i>Burger del mes · ' + MESL[MES_SEL - 1] + '</p>'
        + '<label>Nombre<input name="nombre" maxlength="80" placeholder="Ej.: La 305" value="' + esc(b.nombre) + '"></label>'
        + '<label>Día de lanzamiento<input name="fecha" type="date" min="' + k + '-01" max="' + k + '-' + ult + '" value="' + esc(b.fecha) + '"></label>'
        + '<label>Ingredientes<textarea name="ingredientes" rows="2" maxlength="400" placeholder="Pan, doble carne, cheddar, cebolla crispy…">' + esc(b.ingredientes) + '</textarea></label>'
        + '<label>Notas<textarea name="notas" rows="2" maxlength="400" placeholder="Precio, combo, si sale con batalla…">' + esc(b.notas) + '</textarea></label>'
        + '<div class="bm-pie"><p class="bm-est" role="status"></p><button type="button" class="bm-x" data-bm="cancelar">Cancelar</button><button type="submit">Guardar</button></div></form>';
    }
    if (b.hay === 'no') return '<div class="bm-ok bm-no"><p class="bm-k"><i class="n4"></i>Burger del mes</p><p class="bm-t">Este mes no hay burger del mes.</p>'
      + '<p class="bm-est" role="status"></p><button class="bm-ed" data-bm="pregunta">Cambiar</button></div>';
    if (!b.nombre && !b.fecha) return '<div class="bm-preg"><p class="bm-k"><i class="n1"></i>Burger del mes</p><p class="bm-q">¿Este mes hay burger del mes?</p>'
      + '<div class="bm-sn"><button class="bm-si" data-bm="si">Sí, hay</button><button class="bm-nono" data-bm="no">No, este mes no</button></div><p class="bm-est" role="status"></p></div>';
    return '<div class="bm-ok"><p class="bm-k"><i class="n1"></i>Burger del mes</p>'
      + '<p class="bm-t">Este mes largamos <b>' + esc(b.nombre || 'la burger nueva') + '</b>' + (b.fecha ? ' el <b>' + esc(largaF(b.fecha)) + '</b>' : '') + '.</p>'
      + (b.ingredientes ? '<p class="bm-i">' + esc(b.ingredientes) + '</p>' : '') + (b.notas ? '<p class="bm-n">' + esc(b.notas) + '</p>' : '')
      + '<button class="bm-ed" data-bm="editar">Editar</button></div>';
  }
  function pintarLista() {
    const fs = D.fechas.filter(f => f.m === MES_SEL && pasa(f)).sort((a, b) => a.d - b.d);
    const anio = anioDe(MES_SEL);
    let html = '<p class="an-t">' + MESL[MES_SEL - 1].charAt(0).toUpperCase() + MESL[MES_SEL - 1].slice(1) + ' <span>' + anio + '</span></p>';
    if (!NIV_SEL || NIV_SEL === 1) html += burgerHtml();
    if (!fs.length) html += '<p class="vacio">' + (NIV_SEL ? 'Este mes no hay fechas de nivel ' + NIV_SEL + '.' : 'Este mes no hay fechas cargadas.') + '</p>';
    fs.sort((a, b) => a.nivel - b.nivel || a.d - b.d);
    let nivelAnt = 0;
    fs.forEach((f, i) => {
      if (!NIV_SEL && f.nivel !== nivelAnt) { html += '<p class="an-g">' + barras(f.nivel) + 'Nivel ' + f.nivel + ' · ' + NIVEL[f.nivel] + '</p>'; nivelAnt = f.nivel; }
      const k = f.m + '-' + f.d + '-' + i, dt = fecha(f.m, f.d), ab = ABIERTA === k;
      html += '<button class="an-c n' + f.nivel + (ab ? ' ab' : '') + '" style="--i:' + i + '" data-k="' + k + '" aria-expanded="' + ab + '">'
        + '<span class="an-d"><b>' + f.d + '</b><small>' + dia(dt) + '</small></span>'
        + '<span class="an-b"><b>' + esc(f.t) + '</b>'
        + '<span class="an-tags"><em class="n' + f.nivel + '">N' + f.nivel + '</em><em class="tp">' + TIPO[f.tipo] + '</em>' + (f.sug ? '<em class="sug">Sugerencia</em>' : '') + '</span>'
        + (ab ? '<span class="an-desc">' + esc(f.desc) + '</span><span class="an-cuando">' + esc(arranque(f)) + '</span>' : '')
        + '</span></button>';
    });
    lista.classList.remove('anim'); lista.innerHTML = html;
    if (ANIMAR) { void lista.offsetWidth; lista.classList.add('anim'); ANIMAR = false; } // las fechas entran escalonadas solo al cambiar de mes o de nivel
    const ab = lista.querySelector('.an-c.ab'); if (ab) ab.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); // la tarjeta abierta queda a la vista dentro de la lista
  }
  // La lista toma el alto que sobra para que la página entre en una pantalla (la explicación del nivel cambia de largo).
  function ajustarAlto() {
    if (document.getElementById('p-anual').hidden) return;
    lista.style.maxHeight = 'none';
    const sobra = document.documentElement.scrollHeight - innerHeight;
    lista.style.maxHeight = Math.max(140, lista.offsetHeight - Math.max(0, sobra)) + 'px';
  }
  addEventListener('resize', ajustarAlto); addEventListener('hashchange', () => setTimeout(ajustarAlto, 0));
  document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => setTimeout(ajustarAlto, 0)));
  const todo = () => { pintarMeses(); pintarFiltros(); pintarLista(); ajustarAlto(); };
  meses.addEventListener('click', e => { const b = e.target.closest('.an-m'); if (b) { MES_SEL = +b.dataset.m; ABIERTA = null; ANIMAR = true; todo(); } });
  filtros.addEventListener('click', e => {
    const b = e.target.closest('.an-e'); if (!b) return;
    NIV_SEL = +b.dataset.n === NIV_SEL ? 0 : +b.dataset.n; ABIERTA = null; ANIMAR = true; // tocar el nivel elegido otra vez vuelve a "Todos"
    todo();
  });
  lista.addEventListener('click', e => {
    const a = e.target.closest('[data-bm]');
    if (a) {
      e.preventDefault(); const k = clave(MES_SEL), acc = a.dataset.bm;
      if (acc === 'no') return guardar({ hay: 'no' }, a.closest('div').parentNode.querySelector('.bm-est') || a);
      if (acc === 'pregunta') { BM[k] = {}; EDIT = false; pintarLista(); return; }
      EDIT = acc === 'editar' || acc === 'si'; pintarLista();
      if (EDIT) { const f = lista.querySelector('#bm-form input'); if (f) f.focus(); lista.scrollTop = 0; }
      return;
    }
    const b = e.target.closest('.an-c'); if (b) { ABIERTA = ABIERTA === b.dataset.k ? null : b.dataset.k; pintarLista(); }
  });
  async function guardar(d, est) {
    const k = clave(MES_SEL); if (est && est.classList) { est.className = 'bm-est'; est.textContent = 'Guardando…'; }
    try {
      const r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(Object.assign({ action: 'guardarBurgerMes', marca: MARCA, mes: k }, d)) }).then(x => x.json());
      if (!r.ok) throw new Error(r.mensaje || 'No se pudo guardar');
      BM[k] = d; try { localStorage.setItem('vice:bm', JSON.stringify(BM)); } catch (x) {}
      EDIT = false; pintarLista(); return true;
    } catch (x) { if (est && est.classList) { est.className = 'bm-est err'; est.textContent = x.message; } return false; }
  }
  lista.addEventListener('submit', async e => {
    const f = e.target.closest('#bm-form'); if (!f) return; e.preventDefault();
    const est = f.querySelector('.bm-est'), btn = f.querySelector('button[type=submit]'), k = clave(MES_SEL);
    const d = { nombre: f.nombre.value.trim(), fecha: f.fecha.value, ingredientes: f.ingredientes.value.trim(), notas: f.notas.value.trim() };
    if (!d.nombre && !d.fecha) { est.textContent = 'Poné al menos el nombre o el día.'; est.className = 'bm-est err'; return; }
    btn.disabled = true;
    if (!(await guardar(Object.assign({ hay: 'si' }, d), est))) btn.disabled = false;
  });
  // lo cargado (por el cliente o el equipo) se lee de Trello al abrir
  (function () {
    const cb = '__bm' + Date.now(), sc = document.createElement('script');
    window[cb] = r => { if (r && r.ok) { BM = Object.assign({}, r.meses); try { localStorage.setItem('vice:bm', JSON.stringify(BM)); } catch (x) {} if (!EDIT) pintarLista(); } delete window[cb]; sc.remove(); };
    sc.src = API + '?action=burgersMes&marca=' + MARCA + '&cb=' + cb; document.head.appendChild(sc);
  })();
  todo();
})();

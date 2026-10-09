/* Calendario provisorio de Vice: lo que sale en los próximos 15 días, leído de Trello
   a través del Apps Script del Panel Ideamia (action=cliente). Solo lectura. */
(function () {
  const API = 'https://script.google.com/macros/s/AKfycbwCxld4KNBsNMSGGluIA138f1vaKBo2TnqMIXsO2Y8iV87k4d7NUic47-MpvEgYehZJ/exec';
  const MARCA = 'vice-burger', DIAS = 15, TZ = 'America/Argentina/Cordoba';
  const $ = s => document.querySelector(s);
  const box = $('#cal-lista'), estado = $('#cal-estado');
  if (!box) return;

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (iso, o) => new Intl.DateTimeFormat('es-AR', Object.assign({ timeZone: TZ }, o)).format(new Date(iso));
  const diaClave = iso => fmt(iso, { year: 'numeric', month: '2-digit', day: '2-digit' });
  const hora = iso => fmt(iso, { hour: '2-digit', minute: '2-digit', hour12: false });
  const hoyClave = diaClave(new Date().toISOString());
  const manana = diaClave(new Date(Date.now() + 864e5).toISOString());
  const dm = iso => fmt(iso, { day: 'numeric' }) + '/' + fmt(iso, { month: 'numeric' });
  const corta = iso => diaClave(iso) === hoyClave ? 'hoy' : diaClave(iso) === manana ? 'mañana' : fmt(iso, { weekday: 'short' }).replace('.', '') + ' ' + dm(iso);
  const larga = iso => fmt(iso, { weekday: 'long' }) + ' ' + dm(iso);
  const futuro = iso => iso && diaClave(iso) >= hoyClave;

  /* ---------- estado de cada parte, en palabras ---------- */
  const NOMBRE = { copy: 'Copy', diseno: 'Diseño', guion: 'Guion', video: 'Video' };
  function chip(p) {
    const ok = p.estado === 'listo';
    let t = NOMBRE[p.k];
    if (ok) t += ' listo';
    else if (p.estado === 'revision') t += ' en revisión';
    else if (p.estado === 'ajuste') t += ' en ajustes';
    else if (p.estado === 'produccion') t += ' en producción';
    else if (p.estado === 'falta') t += ' en preparación';
    else if (p.entrega && futuro(p.entrega)) t += ' · llega ' + corta(p.entrega);
    else t += ' en proceso';
    return '<span class="st ' + (ok ? 'ok' : p.estado === 'revision' ? 'rev' : 'pen') + '">' + (ok ? '✓ ' : '') + esc(t) + '</span>';
  }
  function frase(p) {
    const f = p.entrega && futuro(p.entrega) ? (diaClave(p.entrega) === hoyClave ? 'hoy' : diaClave(p.entrega) === manana ? 'mañana' : 'el ' + larga(p.entrega)) : null;
    switch (p.k) {
      case 'copy': return { listo: 'El copy está aprobado.', revision: 'El copy está escrito y en revisión.', ajuste: 'Estamos ajustando el copy.', falta: 'El copy está en preparación.' }[p.estado];
      case 'diseno': return { listo: 'El diseño está listo.', revision: 'El diseño ya se entregó y lo estamos revisando.', ajuste: 'El diseño está en ajustes.' }[p.estado]
        || (f ? 'Todavía no está el diseño: el diseñador lo entrega ' + f + '.' : 'El diseño está en proceso y llega antes de la publicación.');
      case 'guion': return { listo: 'El guion está aprobado.', revision: 'El guion está escrito y en revisión.', ajuste: 'Estamos ajustando el guion.' }[p.estado]
        || (f ? 'El guion lo entrega el guionista ' + f + '.' : 'El guion está en preparación.');
      case 'video': return { listo: 'El video está listo.', revision: 'El video está editado y en revisión.', ajuste: 'El video está en ajustes.', produccion: 'El video está en producción.' }[p.estado]
        || 'El video todavía no se grabó.';
    }
    return '';
  }
  function resumen(it) {
    if (it.estado === 'publicado') return 'Ya se publicó.';
    if (it.estado === 'programado') return 'Ya está programado para salir.';
    if (it.estado === 'listo') return 'Está todo listo para salir.';
    const copy = it.partes.filter(p => p.k === 'copy')[0], resto = it.partes.filter(p => p.k !== 'copy');
    if (copy && copy.estado !== 'falta' && resto.length && resto.every(p => p.estado !== 'listo' && p.estado !== 'revision'))
      return 'Por ahora la tarjeta solo tiene el copy.';
    return '';
  }

  /* ---------- copy: limpio de markdown, con las fotos de Drive como miniaturas ---------- */
  const driveId = u => { const m = /drive\.google\.com\/(?:file\/d\/|open\?id=)([\w-]{20,})/.exec(u); return m && m[1]; };
  function copyHtml(txt) {
    let s = String(txt || '').replace(/‌|​/g, '').replace(/\[([^\]]*)\]\((https?:[^)\s]+)(?:\s+"[^"]*")?\)/g, '$2')
      .replace(/\*\*|__|`/g, '').replace(/\\\*/g, '*').replace(/\n{3,}/g, '\n\n').trim();
    if (!s) return '';
    const bloques = s.split(/\n(?=\s*(?:historia|placa|escena|slide|portada)\s*\d*\s*:)/i);
    return bloques.map(b => {
      const lineas = b.split('\n').map(l => l.trim().replace(/^(?:\d+\.\s+)+(?=\d+\.\s)/, '')).filter(Boolean);
      let titulo = '';
      if (/^(historia|placa|escena|slide|portada)\s*\d*\s*:$/i.test(lineas[0] || '')) titulo = lineas.shift().replace(/:$/, '');
      const html = lineas.map(l => {
        const hor = /^horario\s*:\s*(.+)$/i.exec(l);
        if (hor) return '<span class="hor">🕗 ' + esc(hor[1]) + '</span>';
        const urls = l.match(/https?:\/\/\S+/g) || [];
        const tipo = /^\s*(video|reel)\b/i.test(l) ? 'Ver video' : /^\s*(foto|imagen)\b/i.test(l) ? 'Ver foto' : 'Ver archivo';
        let t = l.replace(/https?:\/\/\S+/g, '').replace(/\s{2,}/g, ' ').replace(/[:·-]\s*$/, '').trim();
        if (urls.length && tipo !== 'Ver archivo') t = t.replace(/\([^)]*\)/g, '').trim(); // notas de edición ("cortar principio…"): son internas
        if (/^(foto|video|imagen|reel)$/i.test(t)) t = '';
        t = esc(t.replace(/^(foto|video|imagen)\s*:\s*/i, ''));
        let media = '';
        urls.forEach(u => {
          const id = driveId(u);
          if (id && tipo === 'Ver video') media += dvid(id, u);
          else if (id) media += '<a class="foto" href="' + esc(u) + '" target="_blank" rel="noopener"><img loading="lazy" src="https://lh3.googleusercontent.com/d/' + id + '=w800" data-id="' + id + '" alt="" onerror="__fotoErr(this)"><span>' + tipo + ' ↗</span></a>';
          else media += ' <a class="lnk" href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(u.replace(/^https?:\/\/(www\.)?/, '').split(/[/?]/)[0]) + ' ↗</a>';
        });
        if (/^cm\s*:/i.test(l)) t = '<span class="nota">Sticker con enlace: ' + t.replace(/^cm\s*:\s*/i, '') + '</span>';
        return (t ? '<p>' + t + '</p>' : '') + media;
      }).join('');
      return '<div class="bloque">' + (titulo ? '<h5>' + esc(titulo) + '</h5>' : '') + html + '</div>';
    }).join('');
  }
  /* fotos de Drive: lh3 → miniatura de Drive → botón que abre la vista previa de Drive ahí mismo */
  window.__fotoErr = img => {
    if (!img.dataset.paso) { img.dataset.paso = 1; img.src = 'https://drive.google.com/thumbnail?id=' + img.dataset.id + '&sz=w800'; return; }
    const a = img.closest('a.foto'); if (!a) return img.remove();
    const d = document.createElement('div'); d.className = 'dvid';
    d.innerHTML = '<button class="dplay foto-p" data-drive="' + esc(img.dataset.id) + '" aria-label="Ver foto"><span class="pl">◉</span></button>';
    a.parentNode.insertBefore(d, a); img.remove();
  };
  /* video de Drive: miniatura con ▶; al tocarla se carga el reproductor de Drive ahí mismo */
  function dvid(id, u) {
    return '<div class="dvid"><button class="dplay" data-drive="' + esc(id) + '" aria-label="Reproducir video"><img loading="lazy" src="https://lh3.googleusercontent.com/d/' + id + '=w800" data-id="' + id + '" alt="" onerror="__fotoErr(this)"><span class="pl">▶</span></button>'
      + '<a class="dlink" href="' + esc(u) + '" target="_blank" rel="noopener">Abrir en Drive ↗</a></div>';
  }
  /* piezas finales: diseños (imágenes) y videos subidos a Trello (por el puente) o links de Drive / Canva */
  function archivosHtml(arr) {
    const vis = (arr || []).filter(a => a.src || /drive\.google|canva\.com|figma\.com/.test(a.u || ''));
    if (!vis.length) return '';
    const imgs = vis.filter(a => a.src && a.img).length;
    return '<h4>Diseño y video</h4><div class="arch' + (imgs > 1 ? ' dos' : '') + '">' + vis.map(a => {
      if (a.src && a.video) return '<video class="ancho" src="' + esc(a.src) + '" controls playsinline preload="metadata"></video>';
      if (a.src && a.img) return '<a href="' + esc(a.src) + '" target="_blank" rel="noopener"><img loading="lazy" src="' + esc(a.src) + '" alt="' + esc(a.n) + '"></a>';
      const id = driveId(a.u);
      if (id && (a.video || /\.(mp4|mov|webm)$/i.test(a.n || ''))) return '<div class="ancho">' + dvid(id, a.u) + '</div>';
      if (id) return '<a class="foto" href="' + esc(a.u) + '" target="_blank" rel="noopener"><img loading="lazy" src="https://lh3.googleusercontent.com/d/' + id + '=w800" data-id="' + id + '" alt="" onerror="__fotoErr(this)"><span>' + esc(a.n || 'Ver archivo') + ' ↗</span></a>';
      return '<a class="lnk ancho" href="' + esc(a.u) + '" target="_blank" rel="noopener">' + esc(a.n || 'Ver pieza') + ' ↗</a>';
    }).join('') + '</div>';
  }

  /* ---------- calendario: grilla de semanas (lun–dom) + lo del día elegido ---------- */
  let ITEMS = [], SEL = null;
  const ymd = iso => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso));
  const dUTC = s => new Date(s + 'T12:00:00Z');
  const sumar = (s, n) => new Date(dUTC(s).getTime() + n * 864e5).toISOString().slice(0, 10);
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const DSEM = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
  const tono = it => it.estado === 'publicado' || it.estado === 'programado' || it.estado === 'listo' ? 'ok' : it.partes.some(p => p.estado === 'revision') ? 'rev' : 'pen';
  function pintar() {
    const hoy = ymd(new Date().toISOString()), fin = sumar(hoy, DIAS);
    const porDia = {};
    ITEMS.forEach((it, i) => (porDia[ymd(it.salida)] = porDia[ymd(it.salida)] || []).push(i));
    if (!SEL || SEL < hoy || SEL > fin) SEL = Object.keys(porDia).sort()[0] || hoy;
    const dow = s => (dUTC(s).getUTCDay() + 6) % 7; // lunes = 0
    const desde = sumar(hoy, -dow(hoy)), hasta = sumar(fin, 6 - dow(fin));
    const m1 = +desde.slice(5, 7) - 1, m2 = +hasta.slice(5, 7) - 1;
    let html = '<div class="cg"><div class="cg-h"><p class="cg-mes">' + (m1 === m2 ? MESES[m1] : MESES[m1] + ' – ' + MESES[m2]) + ' <span>' + hasta.slice(0, 4) + '</span></p>'
      + '</div>'
      + '<div class="cg-sem">' + ['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(x => '<span>' + x + '</span>').join('') + '</div><div class="cg-grid">';
    for (let s = desde; s <= hasta; s = sumar(s, 1)) {
      const fuera = s < hoy || s > fin, ids = porDia[s] || [];
      const cls = 'cg-d' + (fuera ? ' fuera' : '') + (s === hoy ? ' hoy' : '') + (s === SEL ? ' sel' : '') + (ids.length ? ' con' : '');
      const dots = ids.slice(0, 3).map(i => '<i class="' + tono(ITEMS[i]) + '"></i>').join('') + (ids.length > 3 ? '<em>+' + (ids.length - 3) + '</em>' : '');
      const nom = DSEM[dow(s)] + ' ' + (+s.slice(8)) + '/' + (+s.slice(5, 7)) + (ids.length ? ', ' + ids.length + (ids.length > 1 ? ' publicaciones' : ' publicación') : ', sin publicaciones');
      html += fuera ? '<span class="' + cls + '" aria-hidden="true"><b>' + (+s.slice(8)) + '</b></span>'
        : '<button class="' + cls + '" data-d="' + s + '" aria-label="' + nom + '"' + (s === SEL ? ' aria-pressed="true"' : '') + '><b>' + (+s.slice(8)) + '</b><span class="pts">' + dots + '</span></button>';
    }
    html += '</div><p class="cg-ley"><i class="ok"></i>Listo<i class="rev"></i>En revisión<i class="pen"></i>En proceso</p></div>';
    const ids = porDia[SEL] || [], rot = SEL === hoy ? 'Hoy' : SEL === sumar(hoy, 1) ? 'Mañana' : DSEM[dow(SEL)].charAt(0).toUpperCase() + DSEM[dow(SEL)].slice(1);
    html += '<div class="dia"><p class="dia-t">' + esc(rot) + ' ' + (+SEL.slice(8)) + '/' + (+SEL.slice(5, 7)) + '<span>' + (ids.length ? ids.length + (ids.length > 1 ? ' publicaciones' : ' publicación') : '') + '</span></p>';
    html += ids.length ? ids.map(i => {
      const it = ITEMS[i], r = resumen(it);
      return '<button class="item" data-i="' + i + '"><span class="item-h"><span class="fmt">' + esc(it.formato) + '</span><span class="hr">' + hora(it.salida) + ' h</span></span>'
        + '<b>' + esc(it.n) + '</b>' + (r ? '<small>' + esc(r) + '</small>' : '')
        + '<span class="sts">' + it.partes.map(chip).join('') + ((it.comentarios || []).length ? '<span class="st com">💬 ' + it.comentarios.length + '</span>' : '') + '</span></button>';
    }).join('') : '<p class="vacio">No hay nada programado para este día.</p>';
    box.innerHTML = html + '</div>';
  }
  box.addEventListener('click', e => {
    const d = e.target.closest('.cg-d[data-d]');
    if (d) { // al elegir un día, si lo de ese día quedó fuera de pantalla, se acerca solo
      SEL = d.dataset.d; pintar();
      const lista = box.querySelector('.dia'); if (lista && lista.getBoundingClientRect().top > innerHeight - 160) lista.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    const b = e.target.closest('.item'); if (b) ver(+b.dataset.i);
  });

  /* ---------- comentarios: el cliente escribe, queda en la tarjeta de Trello; el equipo responde con "Para el cliente: …" ----------
     Los que se mandaron desde este celular se pueden editar o borrar: al mandarlos el servidor devuelve una clave que queda acá. */
  const guardado = k => { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } };
  const mios = () => { try { return JSON.parse(localStorage.getItem('vice:mios') || '{}'); } catch (e) { return {}; } };
  const guardarMios = o => { try { localStorage.setItem('vice:mios', JSON.stringify(o)); } catch (e) {} };
  const api = body => fetch(API, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(Object.assign({ marca: MARCA }, body)) })
    .then(x => x.json()).then(r => { if (!r.ok) throw new Error(r.mensaje || 'No se pudo'); return r; });
  let CUR = -1;
  function msgHtml(m) {
    const propio = m.de === 'cliente' && m.id && mios()[m.id];
    return '<div class="msg ' + (m.de === 'equipo' ? 'eq' : 'cl') + '"' + (propio ? ' data-c="' + esc(m.id) + '"' : '') + '><p class="msg-q">' + esc(m.q) + ' · ' + esc(dm(m.f)) + ' ' + hora(m.f) + ' h' + (m.ed ? ' · editado' : '') + '</p>'
      + '<p class="msg-t">' + esc(m.t).replace(/\n/g, '<br>') + '</p>'
      + (propio ? '<p class="msg-acc"><button type="button" data-acc="editar">Editar</button><button type="button" data-acc="borrar">Borrar</button></p>' : '') + '</div>';
  }
  function comentariosHtml(it, i) {
    const hilo = (it.comentarios || []).map(msgHtml).join('');
    return '<h4>Comentarios</h4><div class="hilo">' + (hilo || '<p class="hilo-vacio">¿Algo para cambiar o sumar? Dejanos un comentario y le llega al equipo.</p>') + '</div>'
      + '<form class="coment" data-i="' + i + '">'
      + '<input class="c-nombre" name="nombre" maxlength="40" autocomplete="name" placeholder="Tu nombre" value="' + esc(guardado('vice:nombre')) + '">'
      + '<textarea name="texto" rows="3" maxlength="1500" placeholder="Escribí tu comentario…" required></textarea>'
      + '<div class="c-pie"><p class="c-estado" role="status"></p><button type="submit">Enviar</button></div></form>';
  }
  const pintarHilo = () => { const h = hojaIn.querySelector('.hilo'), it = ITEMS[CUR]; if (h && it) h.innerHTML = (it.comentarios || []).map(msgHtml).join('') || '<p class="hilo-vacio">¿Algo para cambiar o sumar? Dejanos un comentario y le llega al equipo.</p>'; };
  async function enviar(f) {
    const it = ITEMS[+f.dataset.i], est = f.querySelector('.c-estado'), btn = f.querySelector('button');
    const nombre = f.nombre.value.trim(), texto = f.texto.value.trim();
    if (!texto) { f.texto.focus(); return; }
    try { localStorage.setItem('vice:nombre', nombre); } catch (e) {}
    btn.disabled = true; est.className = 'c-estado'; est.textContent = 'Enviando…';
    const lento = setTimeout(() => { if (btn.disabled) est.textContent = 'Enviando… puede tardar unos segundos, no cierres.'; }, 3000);
    try {
      const r = await api({ action: 'comentarCliente', cardId: it.id, nombre: nombre, texto: texto });
      if (r.id && r.tok) { const o = mios(); o[r.id] = r.tok; guardarMios(o); }
      (it.comentarios = it.comentarios || []).push({ de: 'cliente', q: nombre || 'Cliente', t: texto, f: new Date().toISOString(), id: r.id });
      pintarHilo();
      f.texto.value = ''; est.className = 'c-estado ok'; est.textContent = '✓ Listo, el equipo ya lo ve.';
      pintar();
    } catch (e) { est.className = 'c-estado err'; est.textContent = e.message || 'No se pudo enviar. Probá de nuevo.'; }
    clearTimeout(lento); btn.disabled = false;
  }
  async function accionComentario(btn) {
    const box = btn.closest('.msg'), id = box.dataset.c, it = ITEMS[CUR], m = (it.comentarios || []).filter(x => x.id === id)[0];
    if (!m) return;
    const acc = btn.dataset.acc, tok = mios()[id];
    if (acc === 'editar') {
      box.querySelector('.msg-t').outerHTML = '<textarea class="msg-ed" rows="3" maxlength="1500">' + esc(m.t) + '</textarea>';
      box.querySelector('.msg-acc').innerHTML = '<button type="button" data-acc="cancelar">Cancelar</button><button type="button" class="pri" data-acc="guardar">Guardar</button>';
      const ta = box.querySelector('.msg-ed'); ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length);
      return;
    }
    if (acc === 'cancelar') return pintarHilo();
    if (acc === 'borrar') {
      box.querySelector('.msg-acc').innerHTML = '<span>¿Borrarlo?</span><button type="button" data-acc="cancelar">No</button><button type="button" class="pri" data-acc="si-borrar">Sí, borrar</button>';
      return;
    }
    const texto = acc === 'guardar' ? box.querySelector('.msg-ed').value.trim() : '';
    if (acc === 'guardar' && !texto) return box.querySelector('.msg-ed').focus();
    box.querySelectorAll('button').forEach(b => b.disabled = true);
    try {
      await api({ action: 'cambiarComentarioCliente', id: id, tok: tok, nombre: m.q, texto: texto, borrar: acc === 'si-borrar' });
      if (acc === 'si-borrar') { it.comentarios = it.comentarios.filter(x => x.id !== id); const o = mios(); delete o[id]; guardarMios(o); }
      else { m.t = texto; m.ed = true; }
      pintarHilo(); pintar();
    } catch (e) {
      box.querySelectorAll('button').forEach(b => b.disabled = false);
      box.querySelector('.msg-acc').insertAdjacentHTML('afterbegin', '<span class="err">' + esc(e.message) + '</span>');
    }
  }

  /* ---------- detalle (hoja que sube desde abajo) ---------- */
  const hoja = $('#hoja'), hojaIn = $('#hoja-in');
  function ver(i) {
    CUR = i;
    const it = ITEMS[i], r = resumen(it), c = copyHtml(it.copy);
    hojaIn.innerHTML = '<button class="cerrar" aria-label="Cerrar">×</button>'
      + '<p class="hoja-k">' + esc(it.formato) + ' · ' + esc(larga(it.salida)) + ' · ' + hora(it.salida) + ' h</p>'
      + '<h3>' + esc(it.n) + '</h3>'
      + '<div class="estado-box">' + (r ? '<p class="lead">' + esc(r) + '</p>' : '') + '<ul>' + it.partes.map(p => '<li class="' + (p.estado === 'listo' ? 'ok' : p.estado === 'revision' ? 'rev' : 'pen') + '">' + esc(frase(p)) + '</li>').join('') + '</ul></div>'
      + archivosHtml(it.archivos)
      + (c ? '<h4>' + (it.formato === 'Reel' ? 'Idea y guion' : 'Copy') + '</h4><div class="copy">' + c + '</div>' : '<p class="vacio">Todavía no tiene copy cargado.</p>')
      + comentariosHtml(it, i)
      + '<a class="trello" href="' + esc(it.url) + '" target="_blank" rel="noopener">Ver la tarjeta en Trello ↗</a>';
    hoja.hidden = false; requestAnimationFrame(() => hoja.classList.add('on'));
    document.body.style.overflow = 'hidden'; hojaIn.scrollTop = 0;
    hojaIn.querySelector('.cerrar').focus({ preventScroll: true });
  }
  function cerrar() { hoja.classList.remove('on'); document.body.style.overflow = ''; setTimeout(() => { hoja.hidden = true; }, 250); }
  hoja.addEventListener('click', e => {
    if (e.target === hoja || e.target.closest('.cerrar')) return cerrar();
    const acc = e.target.closest('.msg-acc button'); if (acc) return accionComentario(acc);
    const p = e.target.closest('.dplay');
    if (p) p.outerHTML = '<iframe class="dframe" src="https://drive.google.com/file/d/' + encodeURIComponent(p.dataset.drive) + '/preview" allow="autoplay; fullscreen" allowfullscreen></iframe>';
  });
  hoja.addEventListener('submit', e => { const f = e.target.closest('.coment'); if (f) { e.preventDefault(); enviar(f); } });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !hoja.hidden) cerrar(); });

  /* ---------- datos ---------- */
  function listo(d) {
    if (!d || !d.ok) { estado.textContent = 'No pudimos cargar el calendario. Probá en un rato o miralo en Trello.'; box.innerHTML = ''; return; }
    ITEMS = d.items || [];
    estado.textContent = 'Actualizado ' + fmt(d.generado, { day: 'numeric', month: 'numeric' }) + ' a las ' + hora(d.generado) + ' h';
    try { localStorage.setItem('vice:cal', JSON.stringify(d)); } catch (e) {}
    pintar();
  }
  try { const c = JSON.parse(localStorage.getItem('vice:cal') || 'null'); if (c && c.ok) { ITEMS = c.items || []; pintar(); } } catch (e) {}
  if (/[?&]demo\b/.test(location.search) && window.CAL_DEMO) { listo(window.CAL_DEMO); return; }
  const cb = '__cal' + Date.now(), s = document.createElement('script');
  window[cb] = d => { listo(d); delete window[cb]; s.remove(); };
  s.onerror = () => listo(null);
  s.src = API + '?action=cliente&marca=' + MARCA + '&dias=' + DIAS + '&cb=' + cb;
  document.head.appendChild(s);
})();

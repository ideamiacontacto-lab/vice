/* Calendario provisorio de Vice: lo que sale en los próximos 15 días, leído de Trello
   a través del Apps Script del Panel Ideamia (action=cliente). Solo lectura. */
(function () {
  const API = 'https://script.google.com/macros/s/AKfycbwCxld4KNBsNMSGGluIA138f1vaKBo2TnqMIXsO2Y8iV87k4d7NUic47-MpvEgYehZJ/exec';
  const MARCA = 'vice-burger', DIAS = 15, TZ = 'America/Argentina/Cordoba', VISIBLES = 99;
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

  /* ---------- lista por día ---------- */
  let ITEMS = [], abierto = false;
  function pintar() {
    if (!ITEMS.length) { box.innerHTML = '<p class="vacio">No hay publicaciones cargadas para los próximos ' + DIAS + ' días.</p>'; return; }
    const grupos = [];
    ITEMS.forEach((it, i) => {
      const k = diaClave(it.salida), g = grupos[grupos.length - 1];
      if (g && g.k === k) g.items.push(i); else grupos.push({ k: k, iso: it.salida, items: [i] });
    });
    let n = 0, html = '';
    grupos.forEach(g => {
      if (!abierto && n >= VISIBLES) return;
      const rot = g.k === hoyClave ? 'Hoy' : g.k === manana ? 'Mañana' : larga(g.iso);
      html += '<div class="dia"><p class="dia-t">' + esc(rot.charAt(0).toUpperCase() + rot.slice(1)) + '</p>';
      g.items.forEach(i => {
        n++;
        const it = ITEMS[i], r = resumen(it);
        html += '<button class="item" data-i="' + i + '"><span class="item-h"><span class="fmt">' + esc(it.formato) + '</span><span class="hr">' + hora(it.salida) + ' h</span></span>'
          + '<b>' + esc(it.n) + '</b>'
          + (r ? '<small>' + esc(r) + '</small>' : '')
          + '<span class="sts">' + it.partes.map(chip).join('') + '</span></button>';
      });
      html += '</div>';
    });
    if (ITEMS.length > n || abierto) html += '<button class="mas" id="cal-mas">' + (abierto ? 'Ver menos' : 'Ver las ' + ITEMS.length + ' publicaciones') + '</button>';
    box.innerHTML = html;
  }
  box.addEventListener('click', e => {
    if (e.target.closest('#cal-mas')) { abierto = !abierto; pintar(); return; }
    const b = e.target.closest('.item'); if (b) ver(+b.dataset.i);
  });

  /* ---------- detalle (hoja que sube desde abajo) ---------- */
  const hoja = $('#hoja'), hojaIn = $('#hoja-in');
  function ver(i) {
    const it = ITEMS[i], r = resumen(it), c = copyHtml(it.copy);
    hojaIn.innerHTML = '<button class="cerrar" aria-label="Cerrar">×</button>'
      + '<p class="hoja-k">' + esc(it.formato) + ' · ' + esc(larga(it.salida)) + ' · ' + hora(it.salida) + ' h</p>'
      + '<h3>' + esc(it.n) + '</h3>'
      + '<div class="estado-box">' + (r ? '<p class="lead">' + esc(r) + '</p>' : '') + '<ul>' + it.partes.map(p => '<li class="' + (p.estado === 'listo' ? 'ok' : p.estado === 'revision' ? 'rev' : 'pen') + '">' + esc(frase(p)) + '</li>').join('') + '</ul></div>'
      + archivosHtml(it.archivos)
      + (c ? '<h4>' + (it.formato === 'Reel' ? 'Idea y guion' : 'Copy') + '</h4><div class="copy">' + c + '</div>' : '<p class="vacio">Todavía no tiene copy cargado.</p>')
      + '<a class="trello" href="' + esc(it.url) + '" target="_blank" rel="noopener">Ver la tarjeta en Trello ↗</a>';
    hoja.hidden = false; requestAnimationFrame(() => hoja.classList.add('on'));
    document.body.style.overflow = 'hidden'; hojaIn.scrollTop = 0;
    hojaIn.querySelector('.cerrar').focus({ preventScroll: true });
  }
  function cerrar() { hoja.classList.remove('on'); document.body.style.overflow = ''; setTimeout(() => { hoja.hidden = true; }, 250); }
  hoja.addEventListener('click', e => {
    if (e.target === hoja || e.target.closest('.cerrar')) return cerrar();
    const p = e.target.closest('.dplay');
    if (p) p.outerHTML = '<iframe class="dframe" src="https://drive.google.com/file/d/' + encodeURIComponent(p.dataset.drive) + '/preview" allow="autoplay; fullscreen" allowfullscreen></iframe>';
  });
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

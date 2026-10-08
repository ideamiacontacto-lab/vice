/* Calendario anual de Vice (Orne · Social Media). Una entrada por fecha, con el nivel que marcó Orne con color en su documento:
   rojo = nivel 1 · amarillo = nivel 2 · verde = nivel 3 · gris = nivel 4.
   tipo: propia (de la marca) · pais (del rubro y del país) · universo (Miami / EE. UU., lo que la competencia no usa). */
window.CAL_ANUAL = {
  niveles: {
    1: { n: 'Campaña mayor', que: 'Campaña integral: influencers, promo, producción audiovisual, pauta y acción en el local.', cuando: 'Se planifica 30 días hábiles antes. Brainstorming, un mes y medio antes.' },
    2: { n: 'Campaña especial', que: 'Acción puntual: un reel, un sorteo o una colaboración chica.', cuando: 'Se planifica entre 20 y 30 días hábiles antes.' },
    3: { n: 'Campaña baja', que: 'Una publicación simple o historias alusivas, institucionales o de comunidad.', cuando: 'Se resuelve dentro del mes.' },
    4: { n: 'Mención', que: 'Efeméride lejana al rubro o de poca relevancia comercial.', cuando: 'Mención eventual, o se deja pasar.' }
  },
  fechas: [
    { m: 1, d: 6, t: 'Día de Reyes', nivel: 4, tipo: 'pais', desc: 'Mención eventual.' },
    { m: 1, d: 23, t: 'Cumpleaños de Vice', nivel: 1, tipo: 'propia', desc: 'En 2027 es el primer aniversario de la marca: hacer algo grande en el local.' },
    { m: 2, d: 13, t: 'Día del Queso Cheddar', nivel: 3, tipo: 'universo', desc: 'El cheddar como protagonista.' },
    { m: 2, d: 14, t: 'Super Bowl', nivel: 3, tipo: 'universo', desc: 'Miami Dolphins: “por cada partido ganado de los Miami…”.' },
    { m: 2, d: 14, t: 'Día de los Enamorados', nivel: 2, tipo: 'pais', desc: 'Sorteos, promociones e historias. “Hay amores que vienen entre dos panes.” Campaña para parejas o amigos.' },
    { m: 2, d: 16, t: 'Carnaval', nivel: 4, tipo: 'pais', desc: 'Fin de semana de juntadas, música, combos y pedidos.' },
    { m: 3, d: 5, t: 'Miami Day · #305Day', nivel: 1, tipo: 'universo', desc: 'Se celebra por el código de área 305 de Miami. La ciudad de origen de la marca.' },
    { m: 3, d: 8, t: 'Día de la Mujer', nivel: 3, tipo: 'pais', desc: '“Detrás de todo hombre turbio, hay una gran mujer.”' },
    { m: 3, d: 20, t: 'Día Mundial de la Harina', nivel: 3, tipo: 'universo', desc: 'Relacionarlo con el pan.' },
    { m: 4, d: 5, t: 'Pascua', nivel: 3, tipo: 'pais', desc: 'Colaboración con una cuenta de postres.' },
    { m: 4, d: 29, t: 'Día del Animal', nivel: 3, tipo: 'pais', desc: 'Cómo incluir a las mascotas en el local: lugar de espera, agua y correa.' },
    { m: 5, d: 1, t: 'Día del Trabajador', nivel: 3, tipo: 'pais', desc: 'Foto de los trabajadores y descuentos: “Después de laburar, te lo merecés.”' },
    { m: 5, d: 5, t: 'Día de la Celiaquía', nivel: 4, tipo: 'pais', desc: 'Colaboración con “Con amor sin TACC”.' },
    { m: 5, d: 25, t: 'Día de la Patria', nivel: 4, tipo: 'pais', desc: 'Mención eventual.' },
    { m: 5, d: 28, t: 'Día de la Hamburguesa', nivel: 1, tipo: 'pais', desc: 'La gran campaña anual: producto especial, colaboración, lanzamiento o promo. Se celebra en todo el mundo.' },
    { m: 6, d: 14, t: 'Día Mundial del Pepino', nivel: 3, tipo: 'universo', desc: 'Descuento en la burger con pepino. Idea: la “ley seca” del pepino, prohibido y traficado.' },
    { m: 6, d: 20, t: 'Día de la Bandera', nivel: 3, tipo: 'pais', desc: 'Un guiño contra la bandera yankee.' },
    { m: 6, d: 21, t: 'Día del Padre', nivel: 3, tipo: 'pais', desc: 'Publicación del día.' },
    { m: 7, d: 1, t: 'Semana de la Dulzura', nivel: 3, tipo: 'pais', desc: 'Del 1 al 7: colaboración o regalo con los pedidos (cookies, milkshake).' },
    { m: 7, d: 4, t: 'Independencia de EE. UU.', nivel: 2, tipo: 'universo', desc: 'Promo en todas las burgers. Idea “la purga”: pistolas de agua, la bolsita con alioli, el paquete incautado con la burger adentro.' },
    { m: 7, d: 9, t: 'Día de la Independencia', nivel: 3, tipo: 'pais', desc: 'Packaging especial o stickers.' },
    { m: 7, d: 20, t: 'Día del Amigo', nivel: 1, tipo: 'pais', desc: 'Combos para compartir, juntadas, humor y sorteos. Reel: en medio de un plan narco, los amigos paran a comer Vice.' },
    { m: 8, d: 16, t: 'Día del Niño', nivel: 3, tipo: 'pais', desc: 'Publicación del día.' },
    { m: 8, d: 20, t: 'Día de la Papa Frita', nivel: 2, tipo: 'pais', desc: 'Papas de regalo en todos los combos, con un packaging estilo paquete de cigarrillos.' },
    { m: 8, d: 29, t: 'Día del Gamer', nivel: 2, tipo: 'universo', desc: 'Recrear una escena icónica de GTA.' },
    { m: 9, d: 18, t: 'Día de la Cheeseburger', nivel: 1, tipo: 'universo', desc: 'Descuentos especiales, acciones en el local y burgers de regalo.' },
    { m: 9, d: 21, t: 'Primavera · Día del Estudiante', nivel: 2, tipo: 'pais', desc: 'Planes al aire libre y juntadas. Concurso: una juntada de hamburguesas para tu curso.' },
    { m: 10, d: 1, t: 'Día del Vegetariano', nivel: 2, tipo: 'pais', desc: 'Mostrar las opciones NotCo. Idea: parodia del vegetariano.' },
    { m: 10, d: 16, t: 'Día Mundial del Pan', nivel: 3, tipo: 'universo', desc: 'Foco en el pan.' },
    { m: 10, d: 18, t: 'Día de la Madre', nivel: 3, tipo: 'pais', desc: 'Nivel a confirmar con Vice.' },
    { m: 10, d: 31, t: 'Halloween', nivel: 2, tipo: 'universo', desc: 'Venir disfrazado al local a cambio de algo. Video: alguien disfrazado y quieto que asusta a los que pasan.' },
    { m: 11, d: 18, t: 'Miami Heat en la NBA', nivel: 3, tipo: 'universo', desc: 'Evento en el local con el partido y un aro: “si metés 3 tiros seguidos, burger gratis”.' },
    { m: 12, d: 21, t: 'Día del Básquet', nivel: 3, tipo: 'pais', desc: 'Un partido de básquet.' },
    { m: 12, d: 24, t: 'Navidad', nivel: 1, tipo: 'pais', desc: 'Fecha fuerte de fin de año.' },
    { m: 12, d: 28, t: 'Día de los Inocentes', nivel: 3, tipo: 'pais', desc: 'Una broma de marca.' },
    { m: 12, d: 31, t: 'Año Nuevo', nivel: 1, tipo: 'propia', desc: 'Última burger del año, cierre de temporada y agradecimiento a la comunidad.' },

    /* Sugerencias de Ideamia (sug: true): fechas del universo de la marca o del producto que la competencia no usa. A validar con Orne y Vice. */
    { m: 6, d: 22, t: 'National Onion Rings Day', nivel: 3, tipo: 'universo', sug: true, desc: 'Día de los aros de cebolla en EE. UU. Los aros de Vice casi no se conocen: es la excusa para mostrarlos.' },
    { m: 7, d: 13, t: 'National French Fry Day', nivel: 3, tipo: 'universo', sug: true, desc: 'Día de las papas fritas en EE. UU. Las papas en grasa como protagonistas: “acá no entra aceite”.' },
    { m: 9, d: 12, t: 'National Milkshake Day', nivel: 3, tipo: 'universo', sug: true, desc: 'Día del milkshake en EE. UU. Si los milkshakes ya salieron, es su primera fecha propia.' },
    { m: 9, d: 16, t: 'Aniversario de Miami Vice', nivel: 3, tipo: 'universo', sug: true, desc: 'La serie se estrenó el 16/9/1984. Pieza con la estética del concepto: neón, trajes y autos.' },
    { m: 10, d: 29, t: 'Aniversario de GTA Vice City', nivel: 3, tipo: 'universo', sug: true, desc: 'El juego salió el 29/10/2002. Guiño directo a la Ciudad del Vicio, la víspera de Halloween.' },
    { m: 11, d: 14, t: 'National Pickle Day', nivel: 3, tipo: 'universo', sug: true, desc: 'Día del pepino en EE. UU. La MOP (mostaza, cebolla y pepino) tiene su día.' },
    { m: 12, d: 9, t: 'Aniversario de Scarface', nivel: 4, tipo: 'universo', sug: true, desc: 'La película se estrenó el 9/12/1983. Mención con una frase del universo.' }
  ]
};

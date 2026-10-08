/* Calendario anual de Vice 2026/27 (Orne · Social Media). Un registro por fecha.
   nivel: 1 campañas mayores (planificar 30 días hábiles antes) · 2 especiales (20 a 30 días) · 3 bajas (dentro del mes) · 4 mención eventual.
   tipo: propia (de la marca) · pais (del rubro y del país) · universo (del universo Miami / EE. UU., que la competencia no usa).
   Los niveles son la propuesta de Ideamia sobre el documento de Orne: se ajustan acá mismo. */
window.CAL_ANUAL = {
  anio: 2026,
  fijo: { t: 'La burger del mes', d: 'Todos los meses: batalla, votación, lanzamiento numerado y edición limitada. Brainstorming un mes y medio antes.', nivel: 1, tipo: 'propia' },
  fechas: [
    { m: 1, d: 6, t: 'Día de Reyes', nivel: 4, tipo: 'pais', desc: 'Mención eventual, sin acción directa.' },
    { m: 1, d: 23, t: 'Cumpleaños de Vice', nivel: 1, tipo: 'propia', desc: 'Primer aniversario de la marca (2027). Algo grande en el local: una semana de eventos, no un posteo.' },
    { m: 2, d: 13, t: 'Día del Queso Cheddar', nivel: 3, tipo: 'universo', desc: '“El cheddar no se negocia.” Historias de producto con la Cheese como protagonista.' },
    { m: 2, d: 14, t: 'Super Bowl', nivel: 2, tipo: 'universo', desc: 'Miami Dolphins: “por cada partido ganado de los Miami…”. Promo bien yankee para ver el partido con burgers.' },
    { m: 2, d: 14, t: 'Día de los Enamorados', nivel: 2, tipo: 'pais', desc: '“Hay amores que vienen entre dos panes.” Campaña para parejas o amigos, con sorteo y promo.' },
    { m: 2, d: 16, t: 'Carnaval', nivel: 3, tipo: 'pais', desc: 'Fin de semana largo de juntadas: música, combos y pedidos.' },
    { m: 3, d: 5, t: 'Miami Day · 305', nivel: 2, tipo: 'universo', desc: 'El #305Day celebra el código de área de Miami. Día de la ciudad de origen de la marca: lanzamiento o promo con el código 305.' },
    { m: 3, d: 8, t: 'Día de la Mujer', nivel: 3, tipo: 'pais', desc: '“Detrás de todo hombre turbio, hay una gran mujer.” Pieza con el tono de la marca.' },
    { m: 3, d: 20, t: 'Día Mundial de la Harina', nivel: 3, tipo: 'universo', desc: 'Hablar del pan: de dónde viene y por qué es el que es.' },
    { m: 4, d: 5, t: 'Pascua', nivel: 3, tipo: 'pais', desc: 'Colaboración con una cuenta de postres.' },
    { m: 4, d: 29, t: 'Día del Animal', nivel: 3, tipo: 'pais', desc: 'Cómo entran las mascotas al local: lugar de espera, agua y correa. Reel de referencia en el doc.' },
    { m: 5, d: 1, t: 'Día del Trabajador', nivel: 3, tipo: 'pais', desc: 'Foto del equipo y descuento: “Después de laburar, te lo merecés.”' },
    { m: 5, d: 5, t: 'Día de la Celiaquía', nivel: 3, tipo: 'pais', desc: 'Colaboración con “Con amor sin TACC”.' },
    { m: 5, d: 25, t: 'Día de la Patria', nivel: 3, tipo: 'pais', desc: 'Mención con el tono de la marca.' },
    { m: 5, d: 28, t: 'Día de la Hamburguesa', nivel: 1, tipo: 'pais', desc: 'La gran campaña anual: producto especial, colaboración, lanzamiento o promo. Carta corta y cupo.' },
    { m: 6, d: 14, t: 'Día Mundial del Pepino', nivel: 3, tipo: 'universo', desc: 'Descuento en la burger con pepino. Idea: la “ley seca” del pepino, con un video donde lo prohíben y llega traficado.' },
    { m: 6, d: 20, t: 'Día de la Bandera', nivel: 3, tipo: 'pais', desc: 'Guiño patriótico con humor: la bandera yankee en problemas.' },
    { m: 6, d: 21, t: 'Día del Padre', nivel: 2, tipo: 'pais', desc: 'Fecha de venta fuerte: combos para compartir y promo del fin de semana.' },
    { m: 7, d: 1, t: 'Semana de la Dulzura', nivel: 3, tipo: 'pais', desc: 'Del 1 al 7: colaboración o regalo con los pedidos (cookies, milkshake).' },
    { m: 7, d: 4, t: 'Independencia de EE. UU.', nivel: 2, tipo: 'universo', desc: 'Promo en todas las burgers. Idea “la purga”: pistolas de agua, la bolsita de “merca” con alioli, el paquete incautado con la burger adentro.' },
    { m: 7, d: 9, t: 'Día de la Independencia', nivel: 3, tipo: 'pais', desc: 'Packaging especial o stickers. El contrapunto argentino del 4 de julio.' },
    { m: 7, d: 13, t: 'National French Fry Day', nivel: 3, tipo: 'universo', desc: 'Día de las papas en EE. UU.: las papas en grasa como protagonistas.' },
    { m: 7, d: 20, t: 'Día del Amigo', nivel: 2, tipo: 'pais', desc: 'Combos para compartir, juntadas y humor. Reel: en medio de un plan narco, los amigos paran a comer Vice. “Todos tienen a alguien que los segundee.”' },
    { m: 8, d: 16, t: 'Día del Niño', nivel: 3, tipo: 'pais', desc: 'Mención con producto para los más chicos.' },
    { m: 8, d: 20, t: 'Día de la Papa Frita', nivel: 2, tipo: 'pais', desc: 'Papas de regalo en todos los combos, con un packaging estilo paquete de puchos.' },
    { m: 8, d: 29, t: 'Día del Gamer', nivel: 3, tipo: 'universo', desc: 'Recrear una escena icónica de GTA Vice City.' },
    { m: 9, d: 18, t: 'National Cheeseburger Day', nivel: 2, tipo: 'universo', desc: 'Descuentos, acciones en el local y burgers de regalo. Hecho propio: un día por clásico.' },
    { m: 9, d: 21, t: 'Primavera · Día del Estudiante', nivel: 2, tipo: 'pais', desc: 'Planes al aire libre y juntadas. Concurso: “participá por una juntada de hamburguesas con tu curso”.' },
    { m: 10, d: 1, t: 'Día del Vegetariano', nivel: 3, tipo: 'pais', desc: 'Mostrar las ocho opciones veggie (NotCo). Idea: parodia del vegetariano.' },
    { m: 10, d: 16, t: 'Día Mundial del Pan', nivel: 3, tipo: 'universo', desc: 'Foco en el pan: cómo se hace y cómo se tuesta.' },
    { m: 10, d: 18, t: 'Día de la Madre', nivel: 2, tipo: 'pais', desc: 'Fecha de venta fuerte: “hoy el vicio lo elige ella”. Nivel a confirmar con Vice.' },
    { m: 10, d: 31, t: 'Halloween', nivel: 2, tipo: 'universo', desc: 'Venir disfrazado al local a cambio de algo. Video: alguien disfrazado y quieto que asusta a los que pasan.' },
    { m: 11, d: 18, t: 'Miami Heat en la NBA', nivel: 2, tipo: 'universo', desc: 'Evento en el local: se pasa el partido y hay un aro. “Si metés 3 tiros seguidos, burger gratis.”' },
    { m: 12, d: 21, t: 'Día del Básquet', nivel: 3, tipo: 'pais', desc: 'Partido de básquet con la comunidad.' },
    { m: 12, d: 24, t: 'Navidad', nivel: 3, tipo: 'pais', desc: 'Saludo con el tono de la marca y horarios de las fiestas.' },
    { m: 12, d: 28, t: 'Día de los Inocentes', nivel: 3, tipo: 'pais', desc: 'Una broma de marca: un lanzamiento falso bien hecho.' },
    { m: 12, d: 31, t: 'Año Nuevo', nivel: 2, tipo: 'propia', desc: 'Última burger del año, cierre de temporada y agradecimiento a la comunidad.' }
  ]
};

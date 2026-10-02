// Folio OMM se deja vacío cuando la fuente no publica un código identificador.
const crearOmm = (id, titulo, categoria, ubicacion, estado, responsable, datos = {}) => ({
  id,
  codigoOMM: null,
  titulo,
  categoria,
  ubicacion,
  fechaLimite: null,
  fechaUltimaRevision: datos.fechaRealizacion || null,
  estado,
  prioridad: null,
  presupuesto: null,
  responsable,
  descripcion: '',
  proveedor: null,
  archivosAdjuntos: [],
  presupuestoEjecutado: null,
  avanceFisico: null,
  tipo: 'mantencion',
  fechaRealizacion: null,
  periodo: null,
  frecuencia: null,
  origen: null,
  preventivo: false,
  presupuestoActivo: false,
  mesInicio: null,
  mesFin: null,
  ...datos
});

const ommData = [
  crearOmm('proyecto-105-107', 'Remodelación habitaciones 105 y 107', 'Remodelación', 'Habitaciones 105 y 107', 'Completado', 'Daniel - Raúl', {
    tipo: 'proyecto', periodo: 'Julio–agosto · año no indicado', mesInicio: 7, mesFin: 8, presupuesto: 4500000,
    origen: 'Mejoras a proyectos futuros .txt'
  }),
  crearOmm('proyecto-drene-ascensor', 'Construcción de drene y obra de ascensor', 'Obras', 'Hotel', 'En curso', 'Daniel', {
    tipo: 'proyecto', periodo: 'Mayo–junio · año no indicado', mesInicio: 5, mesFin: 6, presupuesto: 40000000,
    origen: 'Mejoras a proyectos futuros .txt', presupuestoActivo: true
  }),
  crearOmm('proyecto-riego-limoneros', 'Sistema de riego por goteo y limoneros', 'Jardinería', 'Entrada Centro de Eventos', 'En curso', 'Palito - Domingo', {
    tipo: 'proyecto', periodo: 'Agosto–septiembre · año no indicado', mesInicio: 8, mesFin: 9, presupuesto: 1200000,
    origen: 'Mejoras a proyectos futuros .txt; PLAN ANUAL DE TRABAJO.xlsx', presupuestoActivo: true
  }),
  crearOmm('proyecto-chapas', 'Cambio de chapas de puertas con tarjeta', 'Obras', 'Hotel', 'Pendiente', 'Externos', {
    tipo: 'proyecto', periodo: 'Octubre · año no indicado', mesInicio: 10, mesFin: 10, presupuesto: 4000000,
    origen: 'Mejoras a proyectos futuros .txt', presupuestoActivo: true
  }),
  ...[
    ['meta-techo-307', 'Reparar cielo de habitación 307', 'Obras', 'Habitación 307', 'Mayo · año no indicado', 'Completado', 'Daniel - Raúl', '1 vez', 'METAS OBRAS'],
    ['meta-esquineros', 'Instalar esquineros', 'Obras', 'Hotel', 'Todo el año · año no indicado', 'En curso', 'Raúl', 'Las necesarias', 'METAS OBRAS'],
    ['meta-red-paneles', 'Red de agua para lavar paneles solares', 'Gasfitería', 'Hotel', null, 'Pendiente', 'Daniel - Raúl', '1 vez', 'METAS OBRAS'],
    ['meta-pasto-aguas', 'Obra de pasto y aguas lluvias en oficinas y comedor', 'Jardinería', 'Oficinas y comedor personal', 'Abril–mayo · año no indicado', 'Completado', 'Daniel - Raúl', '1 vez', 'METAS OBRAS'],
    ['meta-pintar-hotel', 'Pintar hotel', 'Obras', 'Hotel', null, 'Pendiente', 'Daniel - Raúl', '1 vez', 'METAS OBRAS'],
    ['meta-bajada-ascensor', 'Bajada de agua del ascensor', 'Gasfitería', 'Ascensor', 'Junio · año no indicado', 'Completado', 'Daniel', '1 vez', 'METAS OBRAS'],
    ['meta-riego-estrella', 'Hacer sistema de riego Estrella', 'Jardinería', 'Sector Estrella', 'Julio · año no indicado', 'Pendiente', 'Palito - Domingo', '1 vez', 'METAS JARDNERIA'],
    ['meta-riego-cerro', 'Revisar todo el riego del cerro', 'Jardinería', 'Cerro', 'Todo el año · año no indicado', 'Pendiente', 'Palito - Domingo', '2 veces al año', 'METAS JARDNERIA'],
    ['meta-acequia-comedores', 'Acequia para desaguar zona de comedores', 'Gasfitería', 'Comedores', 'Junio · año no indicado', 'Completado', 'Palito - Domingo', '1 vez', 'METAS JARDNERIA'],
    ['meta-cortar-pinos', 'Cortar pinos secos', 'Jardinería', 'Caseta de jardinería, Centro de Eventos', 'Junio · año no indicado', 'Completado', 'Palito - Domingo', '1 vez', 'METAS JARDNERIA'],
    ['meta-limpiar-acequia', 'Limpiar acequia, línea sur', 'Jardinería', 'Centro de Eventos', 'Mayo–julio · año no indicado', 'Completado', 'Palito - Domingo', '1 vez al año', 'METAS JARDNERIA'],
    ['meta-poda-mascantas', 'Podar mascantas zona sur', 'Jardinería', 'Zona sur del hotel', null, 'Completado', 'Palito - Domingo', '1 vez al año', 'METAS JARDNERIA'],
    ['meta-cortar-pasto', 'Cortar pasto y recoger hojas', 'Jardinería', 'Hotel', 'Junio–agosto · año no indicado', 'Completado', 'Palito - Domingo', '2 veces al mes', 'METAS JARDNERIA']
  ].map(([id, titulo, categoria, ubicacion, periodo, estado, responsable, frecuencia, hoja]) => crearOmm(
    id, titulo, categoria, ubicacion, estado, responsable, {
      periodo, frecuencia, preventivo: true,
      origen: `Mejoras de Proyectos futuros/POR HACER- Area Mantenciones.xlsx · hoja ${hoja}`
    }
  )),
  ...[
    ['mant-grasera-cocina-hotel', 'Mantención de grasera de cocina', 'Grasera Cocina Hotel', 'Hotel', '2026-04-01'],
    ['mant-camara-lavanderia', 'Mantención de cámara de registro', 'Cámara de Registro Lavandería', 'Lavandería', '2026-04-01'],
    ['mant-planta-tratamiento', 'Mantención de planta de tratamiento', 'Planta de tratamiento principal · segundo estanque', 'Hotel', '2026-04-01'],
    ['mant-fosa-hotel', 'Mantención de fosa general', 'Fosa Hotel General · 20.000 litros', 'Hotel', '2025-08-23']
  ].map(([id, titulo, equipo, ubicacion, fechaRealizacion]) => crearOmm(
    id, titulo, 'Gasfitería', ubicacion, 'Completado', null, {
      descripcion: `Registro de servicio para ${equipo}.`, fechaRealizacion,
      origen: 'Mantecion General/LISTA FOSAS DE ALCANTARILLADOS .xlsx',
      archivosAdjuntos: id === 'mant-fosa-hotel'
        ? [{ nombre: 'Foto_Evidencia_Fosa_demo.svg', tipo: 'image/svg+xml', url: 'assets/Foto_Evidencia_Fosa_demo.svg', simulado: true }]
        : []
    }
  )),
  crearOmm('remodel-201', 'Remodelación habitación 201', 'Remodelación', 'Habitación 201', null, null, {
    tipo: 'remodelacion', presupuesto: 2640986, origen: 'Remodelacion/Remodelacion 201/Presupuesto Remodelacion 201 .xlsx · Real'
  }),
  crearOmm('remodel-202', 'Remodelación habitación 202', 'Remodelación', 'Habitación 202', null, null, {
    tipo: 'remodelacion', presupuesto: 679403, origen: 'Remodelacion/Remodelacion 202/Presupuesto Remodelacion 202.xlsx'
  }),
  crearOmm('remodel-203', 'Remodelación habitación 203', 'Remodelación', 'Habitación 203', null, null, {
    tipo: 'remodelacion', presupuesto: 2118855, origen: 'Remodelacion/Remodelacion 203/Presupuesto Remodelacion 203.xlsx'
  }),
  crearOmm('remodel-204', 'Remodelación habitación 204', 'Remodelación', 'Habitación 204', null, null, {
    tipo: 'remodelacion', presupuesto: 637371, origen: 'Remodelacion/Remodelacion 204/Presupuesto Remodelacion 204.xlsx'
  }),
  ...[
    ['101', 'Habitación 101'], ['102', 'Habitación 102'], ['103', 'Habitación 103'], ['104', 'Habitación 104'],
    ['105', 'Habitación 105'], ['106', 'Habitación 106'], ['107', 'Habitación 107'], ['108', 'Habitación 108'],
    ['201', 'Habitación 201'], ['203', 'Habitación 203'], ['204', 'Habitación 204'], ['205', 'Habitación 205'],
    ['206', 'Habitación 206'], ['207', 'Habitación 207'], ['208', 'Habitación 208'],
    ['301', 'Habitación 301'], ['302', 'Habitación 302'], ['303', 'Habitación 303'], ['304', 'Habitación 304'],
    ['305', 'Habitación 305'], ['306', 'Habitación 306'], ['307', 'Habitación 307'], ['308', 'Habitación 308'],
    ['salon-3', 'Salón tercer piso'], ['recepcion', 'Recepción'], ['oficina-jesus', 'Oficina Jesús Cordero'],
    ['oficina-andres', 'Oficina Andrés Cordero'], ['oficina-javiera', 'Oficina Javiera Cordero']
  ].map(([equipo, ubicacion]) => crearOmm(
    `mant-radiador-${equipo}`, `Limpieza de radiadores · ${ubicacion.toLowerCase()}`, 'Climatización', ubicacion, 'Completado', 'Palito - Jorge', {
      descripcion: 'Limpieza con presión de agua.', fechaRealizacion: '2026-03-16', proveedor: 'Cosmoplas',
      origen: 'Mantecion General/LISTA DE MANTENCIONES.xlsx · hoja RADIADORES'
    }
  )),
  ...[
    ['Refrigerador N°1', 'Bodega Quincho', '2026-02-12'],
    ['Refrigerador N°2', 'Bodega Quincho', '2026-02-13'],
    ['Mantenedor N°1', 'Quincho Chico', '2026-02-14'],
    ['Refrigerador N°1', 'Cocina Salón', '2026-02-15']
  ].map(([equipo, ubicacion, fechaRealizacion], indice) => crearOmm(
    `mant-maquina-${indice + 1}`, `Mantención de ${equipo.toLowerCase()}`, 'Máquinas', ubicacion, 'Completado', 'Diego Martínez', {
      descripcion: 'Limpieza y aceitado de la hélice.', fechaRealizacion, proveedor: 'Mimet',
      origen: 'Mantecion General/LISTA DE MANTENCIONES.xlsx · hoja REFRIGERADOR'
    }
  )),
  ...[
    ['mant-bombas-agua', 'Mantención de bombas de agua trifásicas', 'Máquinas', 'Caseta de Agua Potable', 'Completado', '2024-09-29', 'Mauricio Sanhueza', null, 'Mantención a las bombas.'],
    ['mant-bomba-riego', 'Bomba de agua con pedestal y filtro cabezal', 'Máquinas', 'Caseta de Agua de Riego', null, null, null, 'Cosmoplas', 'No hay intervención fechada en la planilla.'],
    ['mant-generador', 'Generador de tres zonas', 'Máquinas', 'Centro de Eventos', null, null, null, null, 'Sin fechas ni trabajos asociados en la fila de origen.'],
    ['mant-aire-202', 'Mantención de aire acondicionado · habitación 202', 'Climatización', 'Habitación 202', 'Completado', '2022-06-19', 'Andrés Cordero', 'Mejor Ambiente', 'Mantención de filtros; detalle parcial en la planilla.'],
    ['mant-aire-cabana-sol', 'Aire acondicionado · Cabaña Sol', 'Climatización', 'Cabaña Sol', 'Completado', '2025-09-01', 'Trabajador de Luis', 'Luis-Gringo', 'Mantención general de unidades interior y exterior.'],
    ['mant-aire-cabana-luna', 'Aire acondicionado · Cabaña Luna', 'Climatización', 'Cabaña Luna', 'Completado', '2025-10-01', 'Trabajador de Luis', 'Luis-Gringo', 'Mantención general de unidades interior y exterior.'],
    ['mant-ducto-extraccion', 'Limpieza de ducto de extracción de cocina', 'Climatización', 'Hotel', 'Completado', '2026-03-06', 'Daniel - Jorge', null, 'Limpieza interna del ducto con antigrasa.'],
    ['mant-secadora-lg', 'Mantención de secadora eléctrica LG', 'Máquinas', 'Lavandería', 'Completado', '2026-09-14', 'American Tech Spa', 'American Tech Spa', 'Limpieza general del equipo.'],
    ['mant-secadora-maytag', 'Mantención de secadora a gas Maytag', 'Máquinas', 'Lavandería', 'Completado', '2026-09-14', 'American Tech Spa', 'American Tech Spa', 'Limpieza general del equipo.'],
    ['mant-lavadora-girbau', 'Mantención de lavadora industrial Girbau', 'Máquinas', 'Lavandería', 'Completado', '2026-09-14', 'American Tech Spa', 'American Tech Spa', 'Limpieza general del equipo.'],
    ['mant-calandra-girbau', 'Mantención de calandra a gas Girbau', 'Máquinas', 'Lavandería', 'Completado', '2026-09-14', 'American Tech Spa', 'American Tech Spa', 'Limpieza general del equipo.']
  ].map(([id, titulo, categoria, ubicacion, estado, fechaRealizacion, responsable, proveedor, descripcion]) => crearOmm(
    id, titulo, categoria, ubicacion, estado, responsable, {
      fechaRealizacion, proveedor, descripcion,
      origen: 'Mantecion General/LISTA DE MANTENCIONES.xlsx · hoja MAQUINAS'
    }
  )),
  crearOmm('mant-caldera-acv', 'Mantención de caldera a gas ACV', 'Calderas', 'Sala de Caldera', 'Completado', 'Fermín', {
    descripcion: 'Limpieza de inyectores y limpieza interna de la caldera.', fechaRealizacion: '2025-03-27',
    proveedor: 'Mejor Ambiente', origen: 'Mantecion General/LISTA DE MANTENCIONES.xlsx · hoja MAQUINAS',
    archivosAdjuntos: [{ nombre: 'Manual_Caldera_ACV_demo.txt', tipo: 'text/plain', url: 'assets/Manual_Caldera_ACV_demo.txt', simulado: true }]
  })
];

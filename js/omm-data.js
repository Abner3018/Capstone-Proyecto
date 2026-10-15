var ommData = window.ommData = [];
window.ommDataLoaded = false;
window.ommDataCollectionsLoaded = [];

const coleccionesMantencion = [
  { nombre: 'alcantarillado', categoria: 'Alcantarillado' },
  { nombre: 'baño', categoria: 'Baño' },
  { nombre: 'bodega', categoria: 'Bodega' },
  { nombre: 'jardineria', categoria: 'Jardinería' },
  { nombre: 'maquina', categoria: 'Máquinas' },
  { nombre: 'puertas', categoria: 'Puertas' },
  { nombre: 'radiador', categoria: 'Radiador' },
  { nombre: 'refrigerador', categoria: 'Refrigerador' },
  { nombre: 'televisionespilas', categoria: 'Televisiones / Pilas' }
];

function leerCampo(documento, ...campos) {
  for (const campo of campos) {
    if (documento[campo] !== undefined && documento[campo] !== null && documento[campo] !== '') {
      return documento[campo];
    }
  }
  return null;
}

function normalizarFecha(valor) {
  if (!valor) return null;
  if (typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valor)) return valor;
  const fecha = typeof valor.toDate === 'function' ? valor.toDate() : valor instanceof Date ? valor : new Date(valor);
  return Number.isNaN(fecha.getTime())
    ? String(valor)
    : `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
}

function normalizarMonto(valor) {
  if (valor === null) return null;
  const monto = Number(valor);
  return Number.isFinite(monto) ? monto : null;
}

function normalizarEstado(valor) {
  if (!valor) return null;
  const estados = {
    'al día': 'Al día',
    pendiente: 'Pendiente',
    vencido: 'Vencido',
    'en curso': 'En curso',
    planificado: 'Planificado',
    completado: 'Completado'
  };
  const estado = String(valor).trim();
  return estados[estado.toLocaleLowerCase('es-CL')] || estado;
}

function normalizarRegistro(documento, coleccion) {
  const datos = documento.data();
  const presupuesto = leerCampo(datos, 'presupuesto', 'costo_presupuestado', 'costoPresupuestado', 'budget');
  const estado = normalizarEstado(leerCampo(datos, 'estado', 'status'));
  const frecuencia = leerCampo(datos, 'frecuencia', 'frequency');
  const fechaLimite = normalizarFecha({
    bodega: leerCampo(datos, 'inventariadofecha'),
    puertas: leerCampo(datos, 'fechaultimamantencion'),
    maquina: leerCampo(datos, 'fechamantencion')
  }[coleccion.nombre] || leerCampo(datos, 'fecha', 'fechaLimite', 'fecha_limite', 'dueDate'));
  const tipo = String(leerCampo(datos, 'tipo', 'type') || 'mantencion').toLocaleLowerCase('es-CL');
  const lugar = leerCampo(datos, 'lugar');
  const numero = leerCampo(datos, 'numero');

  return {
    ...datos,
    id: documento.id,
    coleccion: coleccion.nombre,
    tipoMantencion: coleccion.nombre === 'baño' ? leerCampo(datos, 'tipo') : null,
    codigoOMM: leerCampo(datos, 'codigoOMM', 'codigo_omm', 'folioOMM', 'folio_omm', 'folio', 'code'),
    titulo: leerCampo(datos, 'nombrecompleto', 'titulo', 'elemento', 'title', 'nombre') ||
      [lugar, numero].filter(Boolean).join(' ') || `Mantención · ${coleccion.categoria}`,
    categoria: coleccion.categoria,
    ubicacion: leerCampo(datos, 'ubicacion', 'location') || [lugar, numero].filter(Boolean).join(' ') || null,
    estado,
    prioridad: leerCampo(datos, 'prioridad', 'priority'),
    presupuesto: normalizarMonto(presupuesto),
    presupuestoEjecutado: normalizarMonto(leerCampo(datos, 'presupuestoEjecutado', 'presupuesto_ejecutado')),
    responsable: leerCampo(datos, 'responsable', 'assignedTo'),
    descripcion: leerCampo(datos, 'detalle', 'descripcion', 'description') || '',
    proveedor: leerCampo(datos, 'proveedor', 'vendor'),
    origen: leerCampo(datos, 'origen', 'fuente', 'source'),
    archivosAdjuntos: Array.isArray(datos.archivosAdjuntos)
      ? datos.archivosAdjuntos
      : Array.isArray(datos.adjuntos) ? datos.adjuntos : [],
    fechaLimite,
    fechaUltimaRevision: normalizarFecha(leerCampo(datos, 'fechaUltimaRevision', 'fecha_ultima_revision', 'ultimaRevision')),
    fechaRealizacion: normalizarFecha(leerCampo(datos, 'fechaRealizacion', 'fecha_realizacion')),
    frecuencia,
    preventivo: datos.preventivo === true || Boolean(frecuencia),
    tipo: tipo.includes('remodel') ? 'remodelacion' : tipo.includes('proyecto') ? 'proyecto' : 'mantencion'
  };
}

function fechaCreacionMillis(documento) {
  const datos = documento.data();
  const fecha = leerCampo(datos, 'fechaCreacion', 'createdAt', 'created_at');
  if (fecha && typeof fecha.toMillis === 'function') return fecha.toMillis();
  if (fecha instanceof Date) return fecha.getTime();
  const valor = Date.parse(fecha || '');
  return Number.isNaN(valor) ? null : valor;
}

function normalizarRegistros(snapshot, coleccion) {
  return [...snapshot.docs]
    .sort((a, b) => {
      const fechaA = fechaCreacionMillis(a);
      const fechaB = fechaCreacionMillis(b);
      if (fechaA !== null && fechaB !== null && fechaA !== fechaB) return fechaA - fechaB;
      if (fechaA !== null && fechaB === null) return -1;
      if (fechaA === null && fechaB !== null) return 1;
      return a.id.localeCompare(b.id);
    })
    .map(documento => normalizarRegistro(documento, coleccion));
}

function publicarErrorFirestore(error) {
  console.error('No se pudieron cargar los registros de mantención desde Firestore.', error);
  window.dispatchEvent(new CustomEvent('omm-data-error', { detail: error }));
}

let firestoreConnectionStarted = false;
const coleccionesConListener = new Set();
const coleccionesRecibidas = new Set();
const registrosPorColeccion = new Map();

function publicarRegistrosActualizados() {
  window.ommData = ommData = coleccionesMantencion.flatMap(coleccion =>
    registrosPorColeccion.get(coleccion.nombre) || []
  );
  window.ommDataCollectionsLoaded = [...coleccionesRecibidas];
  window.ommDataLoaded = document.body.dataset.page === 'mantencion'
    ? coleccionesRecibidas.size > 0
    : coleccionesRecibidas.size === coleccionesMantencion.length;
  window.dispatchEvent(new CustomEvent('omm-data-updated', { detail: window.ommData }));
}

function cargarColeccionMantencion(nombreColeccion) {
  const coleccion = coleccionesMantencion.find(item => item.nombre === nombreColeccion);
  if (!coleccion) throw new Error(`La colección de mantención "${nombreColeccion}" no está configurada.`);
  if (!window.db || !window.firebaseApi) {
    publicarErrorFirestore(new Error('Firestore no está inicializado correctamente.'));
    return;
  }
  if (coleccionesConListener.has(nombreColeccion)) return;
  coleccionesConListener.add(nombreColeccion);
  window.firebaseApi.onSnapshot(
    window.firebaseApi.collection(window.db, coleccion.nombre),
    snapshot => {
      registrosPorColeccion.set(coleccion.nombre, normalizarRegistros(snapshot, coleccion));
      coleccionesRecibidas.add(coleccion.nombre);
      publicarRegistrosActualizados();
    },
    error => publicarErrorFirestore(error)
  );
}

function conectarFirestore() {
  if (firestoreConnectionStarted) return;
  if (!window.db || !window.firebaseApi) {
    publicarErrorFirestore(new Error('Firestore no está inicializado correctamente.'));
    return;
  }
  firestoreConnectionStarted = true;
  window.cargarColeccionMantencion = cargarColeccionMantencion;
  const coleccionesIniciales = document.body.dataset.page === 'mantencion'
    ? [coleccionesMantencion[0]]
    : coleccionesMantencion;
  coleccionesIniciales.forEach(coleccion => cargarColeccionMantencion(coleccion.nombre));
}

window.addEventListener('firebase-ready', conectarFirestore, { once: true });
window.addEventListener('firebase-config-error', evento => {
  publicarErrorFirestore(evento.detail || new Error('No se pudo inicializar Firebase.'));
}, { once: true });

if (window.db && window.firebaseApi) {
  conectarFirestore();
} else {
  window.setTimeout(() => {
    if (!firestoreConnectionStarted) {
      publicarErrorFirestore(new Error('La inicialización de Firebase no respondió.'));
    }
  }, 10000);
}

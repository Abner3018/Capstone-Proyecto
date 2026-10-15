var ommData = window.ommData = [];
window.ommDataLoaded = false;

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
  if (typeof valor.toDate === 'function') return valor.toDate().toISOString().slice(0, 10);
  if (valor instanceof Date) return valor.toISOString().slice(0, 10);
  const fecha = String(valor);
  return /^\d{4}-\d{2}-\d{2}/.test(fecha) ? fecha.slice(0, 10) : fecha;
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

function normalizarRegistro(documento) {
  const datos = documento.data();
  const presupuesto = leerCampo(datos, 'presupuesto', 'costo_presupuestado', 'costoPresupuestado', 'budget');
  const categoria = leerCampo(datos, 'categoria', 'category', 'area') || 'Mantención General';
  const estado = normalizarEstado(leerCampo(datos, 'estado', 'status'));
  const frecuencia = leerCampo(datos, 'frecuencia', 'frequency');
  const fechaLimite = normalizarFecha(leerCampo(datos, 'fechaLimite', 'fecha_limite', 'dueDate'));
  const tipo = String(leerCampo(datos, 'tipo', 'type') || 'mantencion').toLocaleLowerCase('es-CL');

  return {
    ...datos,
    id: documento.id,
    codigoOMM: leerCampo(datos, 'codigoOMM', 'codigo_omm', 'folioOMM', 'folio_omm', 'folio', 'code'),
    titulo: leerCampo(datos, 'titulo', 'elemento', 'title', 'nombre') || 'Registro sin título',
    categoria,
    ubicacion: leerCampo(datos, 'ubicacion', 'location'),
    estado,
    prioridad: leerCampo(datos, 'prioridad', 'priority'),
    presupuesto: normalizarMonto(presupuesto),
    presupuestoEjecutado: normalizarMonto(leerCampo(datos, 'presupuestoEjecutado', 'presupuesto_ejecutado')),
    responsable: leerCampo(datos, 'responsable', 'assignedTo'),
    descripcion: leerCampo(datos, 'descripcion', 'description') || '',
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

function normalizarRegistros(snapshot) {
  const documentos = [...snapshot.docs].sort((a, b) => {
    const fechaA = fechaCreacionMillis(a);
    const fechaB = fechaCreacionMillis(b);
    if (fechaA !== null && fechaB !== null && fechaA !== fechaB) return fechaA - fechaB;
    if (fechaA !== null && fechaB === null) return -1;
    if (fechaA === null && fechaB !== null) return 1;
    return a.id.localeCompare(b.id);
  });
  const registros = documentos.map(normalizarRegistro);
  const usados = new Set(registros
    .map(registro => Number(registro.idSecuencial))
    .filter(numero => Number.isSafeInteger(numero) && numero > 0));
  let siguienteDisponible = 1;

  registros.forEach(registro => {
    const guardado = Number(registro.idSecuencial);
    if (Number.isSafeInteger(guardado) && guardado > 0) return;
    while (usados.has(siguienteDisponible)) siguienteDisponible += 1;
    registro.idSecuencial = siguienteDisponible;
    usados.add(siguienteDisponible);
    siguienteDisponible += 1;
  });
  return registros;
}

function publicarErrorFirestore(error) {
  console.error('No se pudieron cargar los registros de mantención desde Firestore.', error);
  window.dispatchEvent(new CustomEvent('omm-data-error', { detail: error }));
}

let firestoreListenerStarted = false;

function conectarFirestore() {
  if (firestoreListenerStarted) return;
  firestoreListenerStarted = true;
  if (!window.db || !window.firebaseApi) {
    publicarErrorFirestore(new Error('Firestore no está inicializado correctamente.'));
    return;
  }
  window.firebaseApi.onSnapshot(window.firebaseApi.collection(window.db, 'mantencion_general'), snapshot => {
    window.ommData = ommData = normalizarRegistros(snapshot);
    window.ommDataLoaded = true;
    window.dispatchEvent(new CustomEvent('omm-data-updated', { detail: window.ommData }));
  }, publicarErrorFirestore);
}

window.addEventListener('firebase-ready', conectarFirestore, { once: true });
window.addEventListener('firebase-config-error', evento => {
  publicarErrorFirestore(evento.detail || new Error('No se pudo inicializar Firebase.'));
}, { once: true });

if (window.db && window.firebaseApi) {
  conectarFirestore();
} else {
  window.setTimeout(() => {
    if (!firestoreListenerStarted) {
      publicarErrorFirestore(new Error('La inicialización de Firebase no respondió.'));
    }
  }, 10000);
}

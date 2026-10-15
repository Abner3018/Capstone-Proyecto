const categoriasMantencion = {
  machines: registro => ['Máquinas', 'Climatización', 'Calderas', 'Mantención General'].includes(registro.categoria),
  garden: registro => ['Jardinería', 'Exteriores'].includes(registro.categoria),
  reactive: registro => ['Reactiva', 'Gasfitería'].includes(registro.categoria) || (
    registro.tipo === 'mantencion' && registro.categoria === 'Obras' && registro.estado !== 'Completado'
  ),
  history: registro => registro.estado === 'Completado'
};
const estadosPermitidos = ['Al día', 'Pendiente', 'Vencido', 'En curso', 'Completado'];
const formatoFechaMantencion = new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium' });
const almacenamientoNotas = 'hotel-almendro-mantencion-notas';
const notasPorRegistro = leerAlmacenamiento(almacenamientoNotas, {});
let categoriaActiva = 'machines';
let registroActivo = null;
let registroEnEdicion = null;
let importacionEnCurso = false;

function sincronizarRegistros() {
  actualizarContadores();
  renderizarTarjetas();
}

function leerAlmacenamiento(clave, valorAlternativo) {
  try {
    const valor = localStorage.getItem(clave);
    return valor ? JSON.parse(valor) : valorAlternativo;
  } catch {
    return valorAlternativo;
  }
}

function guardarAlmacenamiento(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
    return true;
  } catch {
    return false;
  }
}

function escaparHTML(valor) {
  return String(valor ?? '').replace(/[&<>"']/g, caracter => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[caracter]);
}

function fechaVisible(valor) {
  if (!valor) return 'No informado';
  const fecha = new Date(`${valor}T12:00:00`);
  return Number.isNaN(fecha.getTime()) ? escaparHTML(valor) : formatoFechaMantencion.format(fecha);
}

function claseBadge(estado) {
  if (estado === 'Completado' || estado === 'Al día') return 'status-done';
  if (estado === 'Pendiente') return 'status-pending';
  if (estado === 'Vencido') return 'status-overdue';
  if (estado === 'En curso') return 'status-progress';
  return 'status-unknown';
}

function ubicacionVisible(valor) {
  const ubicacion = String(valor || '').trim();
  if (!ubicacion) return 'Ubicación no informada';
  const numeroHabitacion = ubicacion.match(/^(?:hab(?:itación)?\.?\s*)?(\d+[a-z]?)$/i);
  if (numeroHabitacion) return `Hab. ${numeroHabitacion[1]}`;
  return ubicacion;
}

function filtrarRegistros() {
  const categoria = categoriasMantencion[categoriaActiva];
  const consulta = document.getElementById('maintenanceSearch').value.trim().toLocaleLowerCase('es-CL');
  const estado = document.getElementById('statusFilter').value;
  return ommData.filter(registro => {
    if (registro.tipo !== 'mantencion' || !categoria(registro)) return false;
    if (estado !== 'Todos' && registro.estado !== estado) return false;
    const texto = [registro.id, registro.codigoOMM, registro.titulo, registro.categoria, registro.ubicacion, registro.responsable, registro.estado]
      .filter(Boolean).join(' ').toLocaleLowerCase('es-CL');
    return !consulta || texto.includes(consulta);
  });
}

function actualizarContadores() {
  Object.entries(categoriasMantencion).forEach(([categoria, predicate]) => {
    const cantidad = ommData.filter(registro => registro.tipo === 'mantencion' && predicate(registro)).length;
    const elemento = document.querySelector(`[data-count="${categoria}"]`);
    if (elemento) elemento.textContent = String(cantidad);
  });
}

function renderizarTarjetas() {
  const registros = filtrarRegistros();
  const cuadrilla = document.getElementById('maintenanceCards');
  document.getElementById('resultCount').textContent = `${registros.length} registros`;
  document.getElementById('emptyTable').hidden = registros.length > 0;
  cuadrilla.innerHTML = registros.map(registro => {
    const fechaClave = registro.fechaLimite
      ? `Vence ${fechaVisible(registro.fechaLimite)}`
      : `Revisión ${fechaVisible(registro.fechaUltimaRevision || registro.fechaRealizacion)}`;
    return `<article class="maintenance-card" data-id="${escaparHTML(registro.id)}">
      <button class="maintenance-card-open" type="button" data-action="detail" aria-haspopup="dialog" aria-label="Ver detalle: ${escaparHTML(registro.titulo)}">
        <span class="maintenance-card-top"><span class="status-badge ${claseBadge(registro.estado)}">${escaparHTML(registro.estado || 'Sin estado')}</span><span class="maintenance-location" title="${escaparHTML(ubicacionVisible(registro.ubicacion))}">${escaparHTML(ubicacionVisible(registro.ubicacion))}</span></span>
        <span class="maintenance-card-title">${escaparHTML(registro.titulo)}</span>
        <span class="maintenance-card-category">${escaparHTML(registro.categoria)}</span>
        <span class="maintenance-card-metrics"><span class="maintenance-card-date"><small>${registro.fechaLimite ? 'Fecha límite' : 'Última revisión'}</small><strong>${escaparHTML(fechaClave.replace(/^(Vence|Revisión) /, ''))}</strong></span></span>
      </button>
      <div class="maintenance-card-actions" aria-label="Acciones de mantención">
        <button class="card-action-button" type="button" data-action="edit">Editar</button>
        ${registro.estado === 'Completado' ? '' : '<button class="card-action-button" type="button" data-action="complete">Marcar como Completado</button>'}
        <button class="card-action-button card-action-delete" type="button" data-action="delete">Eliminar</button>
      </div>
    </article>`;
  }).join('');
}

function obtenerRegistro(id) {
  return ommData.find(registro => registro.id === id);
}

function abrirDetalle(registro, editarEstado = false) {
  registroActivo = registro;
  const dialogo = document.getElementById('ommDialog');
  document.getElementById('dialogTitle').textContent = registro.titulo;
  document.getElementById('dialogCode').textContent =
    `ID: #${String(registro.idSecuencial).padStart(3, '0')}`;
  const campos = [
    ['Descripción', registro.descripcion || 'No informado'],
    ['Categoría', registro.categoria || 'No informado'], ['Ubicación', registro.ubicacion || 'No informado'],
    ['Estado', registro.estado || 'No informado'], ['Prioridad', registro.prioridad || 'No informada'],
    ['Fecha límite', fechaVisible(registro.fechaLimite)],
    ['Última revisión', fechaVisible(registro.fechaUltimaRevision || registro.fechaRealizacion)],
    ['Responsable', registro.responsable || 'No informado'], ['Proveedor', registro.proveedor || 'No informado'],
    ['Presupuesto', registro.presupuesto === null ? 'No informado' : formatoCLP.format(registro.presupuesto)],
    ['Frecuencia', registro.frecuencia || 'No informada'], ['Fuente', registro.origen || 'No informada']
  ];
  document.getElementById('detailFields').innerHTML = campos.map(([etiqueta, valor]) =>
    `<div class="detail-field"><dt>${escaparHTML(etiqueta)}</dt><dd>${escaparHTML(valor)}</dd></div>`
  ).join('');
  document.getElementById('statusEditor').hidden = !editarEstado;
  document.getElementById('newStatus').value = estadosPermitidos.includes(registro.estado) ? registro.estado : 'Pendiente';
  renderizarNotas();
  if (!dialogo.open) dialogo.showModal();
}

function renderizarNotas() {
  const notas = notasPorRegistro[registroActivo.id] || [];
  document.getElementById('noteList').innerHTML = notas.length
    ? notas.map(nota => `<li><time>${escaparHTML(nota.fecha)}</time>${escaparHTML(nota.texto)}</li>`).join('')
    : '<li class="empty-note">Todavía no hay observaciones en la bitácora.</li>';
}

async function guardarEstado() {
  if (!registroActivo) return;
  const nuevoEstado = document.getElementById('newStatus').value;
  try {
    await window.firebaseApi.updateDoc(
      window.firebaseApi.doc(window.db, 'mantencion_general', registroActivo.id),
      { estado: nuevoEstado }
    );
    registroActivo.estado = nuevoEstado;
    renderizarTarjetas();
    actualizarContadores();
    abrirDetalle(registroActivo, true);
  } catch (error) {
    console.error('No se pudo actualizar el estado de la mantención.', error);
    window.alert('No se pudo guardar el estado. Verifica la conexión y los permisos de Firestore.');
  }
}

async function completarMantencion(registro, boton) {
  boton.disabled = true;
  try {
    await window.firebaseApi.updateDoc(
      window.firebaseApi.doc(window.db, 'mantencion_general', registro.id),
      { estado: 'Completado' }
    );
  } catch (error) {
    console.error('No se pudo marcar la mantención como completada.', error);
    window.alert('No se pudo actualizar el estado. Verifica la conexión y los permisos de Firestore.');
  } finally {
    boton.disabled = false;
  }
}

async function eliminarMantencion(registro, boton) {
  if (!window.confirm(`¿Eliminar la mantención "${registro.titulo}"? Esta acción no se puede deshacer.`)) return;
  boton.disabled = true;
  try {
    await window.firebaseApi.deleteDoc(
      window.firebaseApi.doc(window.db, 'mantencion_general', registro.id)
    );
  } catch (error) {
    console.error('No se pudo eliminar la mantención de Firestore.', error);
    window.alert('No se pudo eliminar la mantención. Verifica la conexión y los permisos de Firestore.');
  } finally {
    boton.disabled = false;
  }
}

function exportarReporte() {
  document.title = 'Reporte de Mantención - Hotel El Almendro';
  window.print();
  window.setTimeout(() => { document.title = 'Mantención General | Hotel El Almendro'; }, 500);
}

function seleccionarCategoriaMantencion(categoria) {
  const categoriaTab = ['Jardinería', 'Exteriores'].includes(categoria)
    ? 'garden'
    : ['Reactiva', 'Gasfitería', 'Obras'].includes(categoria)
      ? 'reactive'
      : 'machines';
  categoriaActiva = categoriaTab;
  document.querySelectorAll('.maintenance-tab').forEach(tab => {
    const activa = tab.dataset.category === categoriaTab;
    tab.classList.toggle('active', activa);
    tab.setAttribute('aria-selected', String(activa));
  });
  document.getElementById('maintenanceSearch').value = '';
  document.getElementById('statusFilter').value = 'Todos';
  renderizarTarjetas();
}

function abrirFormularioMantencion() {
  registroEnEdicion = null;
  const formulario = document.getElementById('newMaintenanceForm');
  formulario.reset();
  document.getElementById('newMaintenanceTitle').textContent = 'Nueva Mantención';
  document.getElementById('saveNewMaintenance').textContent = 'Guardar mantención';
  document.getElementById('newMaintenanceDialog').showModal();
  document.getElementById('newMaintenanceTitleInput').focus();
}

function editarFicha(registro) {
  registroEnEdicion = registro;
  const formulario = document.getElementById('newMaintenanceForm');
  formulario.reset();
  const campos = {
    titulo: registro.titulo || '',
    descripcion: registro.descripcion || '',
    categoria: registro.categoria || '',
    ubicacion: registro.ubicacion || '',
    estado: registro.estado || 'Pendiente',
    prioridad: registro.prioridad || '',
    fechaLimite: registro.fechaLimite || '',
    fechaUltimaRevision: registro.fechaUltimaRevision || registro.fechaRealizacion || '',
    responsable: registro.responsable || '',
    proveedor: registro.proveedor || '',
    presupuesto: registro.presupuesto ?? '',
    frecuencia: registro.frecuencia || '',
    origen: registro.origen || ''
  };
  Object.entries(campos).forEach(([nombre, valor]) => {
    const campo = formulario.elements.namedItem(nombre);
    if (campo) campo.value = String(valor);
  });
  const categoria = formulario.elements.namedItem('categoria');
  if (registro.categoria && ![...categoria.options].some(opcion => opcion.value === registro.categoria)) {
    categoria.add(new Option(registro.categoria, registro.categoria));
    categoria.value = registro.categoria;
  }
  document.getElementById('newMaintenanceTitle').textContent = 'Editar Mantención';
  document.getElementById('saveNewMaintenance').textContent = 'Guardar cambios';
  document.getElementById('ommDialog').close();
  document.getElementById('newMaintenanceDialog').showModal();
  document.getElementById('newMaintenanceTitleInput').focus();
}

async function guardarNuevaMantencion(evento) {
  evento.preventDefault();
  const formulario = evento.currentTarget;
  if (!formulario.reportValidity()) return;

  const datos = new FormData(formulario);
  const presupuesto = Number(datos.get('presupuesto'));
  const textoObligatorio = ['titulo', 'descripcion', 'ubicacion', 'responsable', 'proveedor', 'origen'];
  const campoVacio = textoObligatorio.find(campo => !String(datos.get(campo) || '').trim());
  if (campoVacio || !Number.isFinite(presupuesto) || presupuesto < 0) {
    window.alert(campoVacio
      ? 'Completa todos los campos obligatorios con contenido.'
      : 'Ingresa un presupuesto válido igual o mayor que cero.');
    return;
  }

  const botonGuardar = document.getElementById('saveNewMaintenance');
  const documento = {
    titulo: String(datos.get('titulo')).trim(),
    descripcion: String(datos.get('descripcion')).trim(),
    categoria: datos.get('categoria'),
    ubicacion: String(datos.get('ubicacion')).trim(),
    estado: datos.get('estado'),
    prioridad: datos.get('prioridad'),
    fechaLimite: datos.get('fechaLimite'),
    fechaUltimaRevision: datos.get('fechaUltimaRevision'),
    responsable: String(datos.get('responsable')).trim(),
    proveedor: String(datos.get('proveedor')).trim(),
    presupuesto,
    frecuencia: datos.get('frecuencia'),
    origen: String(datos.get('origen')).trim(),
    tipo: 'mantencion',
    preventivo: true
  };

  botonGuardar.disabled = true;
  botonGuardar.textContent = 'Guardando…';

  try {
    if (!window.db || !window.firebaseApi) throw new Error('Firestore no está disponible. Verifica la conexión e inténtalo nuevamente.');
    if (!window.ommDataLoaded) throw new Error('Espera a que termine de cargar la lista antes de guardar.');
    const coleccion = window.firebaseApi.collection(window.db, 'mantencion_general');
    const referencia = registroEnEdicion
      ? window.firebaseApi.doc(window.db, 'mantencion_general', registroEnEdicion.id)
      : window.firebaseApi.doc(coleccion);
    const numeroSecuencial = await reservarIdSecuencial(registroEnEdicion?.id);
    documento.idSecuencial = numeroSecuencial;
    documento.fechaCreacion = registroEnEdicion?.fechaCreacion ||
      window.firebaseApi.serverTimestamp();
    if (registroEnEdicion) {
      await window.firebaseApi.updateDoc(referencia, documento);
      Object.assign(registroEnEdicion, documento);
    } else {
      await window.firebaseApi.setDoc(referencia, documento);
    }
    formulario.reset();
    document.getElementById('newMaintenanceDialog').close();
    const categoriaGuardada = documento.categoria;
    registroEnEdicion = null;
    seleccionarCategoriaMantencion(categoriaGuardada);
  } catch (error) {
    console.error('No se pudo guardar la ficha de mantención en Firebase.', error);
    window.alert('No se pudo guardar la ficha. Revisa tu conexión y los permisos de Firestore, e inténtalo nuevamente.');
  } finally {
    botonGuardar.disabled = false;
    botonGuardar.textContent = registroEnEdicion ? 'Guardar cambios' : 'Guardar mantención';
  }
}

const encabezadosImportacion = {
  titulo: ['titulo', 'tarea', 'elemento', 'title'],
  categoria: ['categoria', 'submodulo', 'category'],
  ubicacion: ['habitacion', 'habitacion ubicacion', 'ubicacion', 'location', 'room'],
  estado: ['estado', 'status'],
  prioridad: ['prioridad', 'priority'],
  frecuencia: ['frecuencia', 'frequency'],
  presupuesto: ['presupuesto', 'costo', 'costo presupuestado', 'budget'],
  responsable: ['responsable', 'assigned to', 'assignedto']
};

function normalizarEncabezado(valor) {
  return String(valor ?? '').trim().toLocaleLowerCase('es-CL')
    .replace(/^\uFEFF/, '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ').trim();
}

function textoCelda(valor) {
  return String(valor ?? '').trim();
}

function presupuestoImportado(valor) {
  if (typeof valor === 'number') return Number.isFinite(valor) && valor >= 0 ? valor : null;
  let texto = textoCelda(valor).replace(/[^\d,.-]/g, '');
  if (!texto) return null;
  const ultimaComa = texto.lastIndexOf(',');
  const ultimoPunto = texto.lastIndexOf('.');
  if (ultimaComa >= 0 && ultimoPunto >= 0) {
    const decimal = ultimaComa > ultimoPunto ? ',' : '.';
    const miles = decimal === ',' ? '.' : ',';
    texto = texto.split(miles).join('').replace(decimal, '.');
  } else if (ultimaComa >= 0 || ultimoPunto >= 0) {
    const separador = ultimaComa >= 0 ? ',' : '.';
    const partes = texto.split(separador);
    if (partes.length > 2 || partes[partes.length - 1].length === 3) {
      texto = partes.join('');
    } else {
      texto = `${partes.slice(0, -1).join('')}.${partes[partes.length - 1]}`;
    }
  }
  const numero = Number(texto);
  return Number.isFinite(numero) && numero >= 0 ? numero : null;
}

function valorEnumerado(valor, opciones) {
  const normalizado = normalizarEncabezado(valor);
  return opciones.find(opcion => normalizarEncabezado(opcion) === normalizado) || null;
}

function categoriaImportada(valor) {
  const normalizada = normalizarEncabezado(valor)
    .replace(/\s+y\s+/g, ' ')
    .replace(/\s*&\s*/g, ' ');
  const categorias = {
    'maquinas equipos': 'Máquinas',
    maquinas: 'Máquinas',
    'jardineria exteriores': 'Jardinería',
    jardineria: 'Jardinería',
    exteriores: 'Exteriores',
    'reactiva incidencias': 'Reactiva',
    reactiva: 'Reactiva',
    'mantencion general': 'Mantención General',
    climatizacion: 'Climatización',
    calderas: 'Calderas',
    gasfiteria: 'Gasfitería',
    obras: 'Obras'
  };
  return categorias[normalizada] || null;
}

function filasDeImportacion(matriz) {
  if (!matriz.length) throw new Error('El archivo no contiene filas para importar.');
  const encabezados = matriz[0].map(normalizarEncabezado);
  const indices = {};
  Object.entries(encabezadosImportacion).forEach(([campo, aliases]) => {
    indices[campo] = encabezados.findIndex(encabezado => aliases.includes(encabezado));
  });
  const camposFaltantes = Object.entries(indices)
    .filter(([, indice]) => indice < 0)
    .map(([campo]) => campo);
  if (camposFaltantes.length) {
    const nombres = {
      titulo: 'Título', categoria: 'Categoría', ubicacion: 'Habitación',
      estado: 'Estado', prioridad: 'Prioridad', frecuencia: 'Frecuencia',
      presupuesto: 'Presupuesto', responsable: 'Responsable'
    };
    throw new Error(`Faltan columnas requeridas: ${camposFaltantes.map(campo => nombres[campo]).join(', ')}.`);
  }

  const indiceOpcional = aliases => encabezados.findIndex(encabezado => aliases.includes(encabezado));
  const opcionales = {
    descripcion: indiceOpcional(['descripcion', 'description']),
    proveedor: indiceOpcional(['proveedor', 'vendor']),
    origen: indiceOpcional(['fuente', 'origen', 'source']),
    fechaLimite: indiceOpcional(['fecha limite', 'fechalimite', 'due date']),
    fechaUltimaRevision: indiceOpcional(['ultima revision', 'fecha ultima revision', 'review date'])
  };
  const filasValidas = [];
  const filasInvalidas = [];
  const estados = ['Al día', 'Pendiente', 'Vencido', 'En curso', 'Completado'];
  const prioridades = ['Baja', 'Media', 'Alta', 'Urgente'];
  const frecuencias = ['Diaria', 'Semanal', 'Mensual', 'Anual'];

  matriz.slice(1).forEach((fila, indiceFila) => {
    if (!fila.some(valor => textoCelda(valor))) return;
    const numeroFila = indiceFila + 2;
    const titulo = textoCelda(fila[indices.titulo]);
    const categoria = categoriaImportada(fila[indices.categoria]);
    const ubicacion = textoCelda(fila[indices.ubicacion]);
    const estado = valorEnumerado(fila[indices.estado], estados);
    const prioridad = valorEnumerado(fila[indices.prioridad], prioridades);
    const frecuencia = valorEnumerado(fila[indices.frecuencia], frecuencias);
    const presupuesto = presupuestoImportado(fila[indices.presupuesto]);
    const responsable = textoCelda(fila[indices.responsable]);
    const errores = [];
    if (!titulo) errores.push('falta Título');
    if (!categoria) errores.push('Categoría no reconocida');
    if (!ubicacion) errores.push('falta Habitación');
    if (!estado) errores.push('Estado no reconocido');
    if (!prioridad) errores.push('Prioridad no reconocida');
    if (!frecuencia) errores.push('Frecuencia no reconocida');
    if (presupuesto === null) errores.push('Presupuesto debe ser un número igual o mayor que cero');
    if (!responsable) errores.push('falta Responsable');
    if (errores.length) {
      filasInvalidas.push({ numeroFila, errores });
      return;
    }
    filasValidas.push({
      titulo,
      categoria,
      ubicacion,
      estado,
      prioridad,
      frecuencia,
      presupuesto,
      responsable,
      descripcion: opcionales.descripcion >= 0 ? textoCelda(fila[opcionales.descripcion]) : '',
      proveedor: opcionales.proveedor >= 0 ? textoCelda(fila[opcionales.proveedor]) : '',
      origen: opcionales.origen >= 0 && textoCelda(fila[opcionales.origen])
        ? textoCelda(fila[opcionales.origen])
        : 'Importación masiva',
      fechaLimite: opcionales.fechaLimite >= 0 ? fechaImportada(fila[opcionales.fechaLimite]) : '',
      fechaUltimaRevision: opcionales.fechaUltimaRevision >= 0
        ? fechaImportada(fila[opcionales.fechaUltimaRevision])
        : ''
    });
  });
  if (!filasValidas.length && !filasInvalidas.length) {
    throw new Error('No se encontraron filas con datos después de los encabezados.');
  }
  return { filasValidas, filasInvalidas };
}

function fechaImportada(valor) {
  if (valor instanceof Date && !Number.isNaN(valor.getTime())) return valor.toISOString().slice(0, 10);
  const texto = textoCelda(valor);
  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) return texto;
  if (typeof valor === 'number' && window.XLSX?.SSF) {
    const fecha = window.XLSX.SSF.parse_date_code(valor);
    if (fecha) return `${fecha.y}-${String(fecha.m).padStart(2, '0')}-${String(fecha.d).padStart(2, '0')}`;
  }
  return '';
}

async function leerArchivoImportacion(archivo) {
  const extension = archivo.name.split('.').pop().toLocaleLowerCase('es-CL');
  if (!['xlsx', 'csv'].includes(extension)) throw new Error('Selecciona un archivo con extensión .xlsx o .csv.');
  if (!window.XLSX) throw new Error('No se pudo cargar el lector Excel/CSV. Comprueba tu conexión e inténtalo nuevamente.');
  const libro = extension === 'csv'
    ? window.XLSX.read(await archivo.text(), { type: 'string', codepage: 65001, raw: true })
    : window.XLSX.read(await archivo.arrayBuffer(), { type: 'array', cellDates: true });
  const primeraHoja = libro.Sheets[libro.SheetNames[0]];
  if (!primeraHoja) throw new Error('El archivo no contiene una hoja de cálculo.');
  const matriz = window.XLSX.utils.sheet_to_json(primeraHoja, {
    header: 1,
    defval: '',
    raw: true,
    blankrows: false
  });
  return filasDeImportacion(matriz);
}

async function reservarIdsSecuenciales(cantidad) {
  if (!Number.isSafeInteger(cantidad) || cantidad < 1) throw new Error('La cantidad de IDs a reservar no es válida.');
  if (!window.firebaseApi || !window.db) throw new Error('Firebase no está disponible.');
  const referenciaContador = window.firebaseApi.doc(window.db, 'contadores', 'mantencion_general');
  let primerId = null;
  await window.firebaseApi.runTransaction(window.db, async transaccion => {
    const contador = await transaccion.get(referenciaContador);
    const maximoEnRegistros = ommData.reduce((maximo, registro) =>
      Math.max(maximo, Number(registro.idSecuencial) || 0), 0
    );
    const valorContador = contador.exists() ? Number(contador.data().ultimoId) || 0 : 0;
    primerId = Math.max(valorContador, maximoEnRegistros) + 1;
    const ultimoId = primerId + cantidad - 1;
    if (!Number.isSafeInteger(ultimoId)) throw new Error('Se excedió el rango permitido para los IDs secuenciales.');
    transaccion.set(referenciaContador, { ultimoId }, { merge: true });
  });
  if (!Number.isSafeInteger(primerId) || primerId < 1) throw new Error('No se pudieron reservar los IDs secuenciales.');
  return primerId;
}

function actualizarProgresoImportacion(progreso, etiqueta) {
  document.getElementById('importProgress').hidden = false;
  document.getElementById('importProgressLabel').textContent = etiqueta;
  document.getElementById('importProgressValue').textContent = `${progreso}%`;
  const barra = document.getElementById('importProgressBar');
  barra.value = progreso;
  barra.setAttribute('aria-label', etiqueta);
}

function mostrarFilasInvalidas(filas) {
  const contenedor = document.getElementById('importInvalidRows');
  contenedor.replaceChildren();
  if (!filas.length) {
    contenedor.hidden = true;
    return;
  }
  const titulo = document.createElement('strong');
  titulo.textContent = 'Filas omitidas:';
  const lista = document.createElement('ul');
  filas.slice(0, 30).forEach(fila => {
    const item = document.createElement('li');
    item.textContent = `Fila ${fila.numeroFila}: ${fila.errores.join('; ')}`;
    lista.append(item);
  });
  if (filas.length > 30) {
    const item = document.createElement('li');
    item.textContent = `y ${filas.length - 30} filas más.`;
    lista.append(item);
  }
  contenedor.append(titulo, lista);
  contenedor.hidden = false;
}

async function importarMantenciones() {
  const archivo = document.getElementById('importFileInput').files[0];
  const resultado = document.getElementById('importResult');
  const botonImportar = document.getElementById('startImportMaintenance');
  let importadas = 0;
  if (!archivo) {
    resultado.textContent = 'Selecciona un archivo antes de iniciar la importación.';
    resultado.classList.add('is-error');
    resultado.hidden = false;
    return;
  }
  botonImportar.disabled = true;
  importacionEnCurso = true;
  document.getElementById('closeImportMaintenance').disabled = true;
  document.getElementById('cancelImportMaintenance').disabled = true;
  resultado.hidden = true;
  resultado.classList.remove('is-error');
  mostrarFilasInvalidas([]);
  try {
    if (!window.db || !window.firebaseApi) throw new Error('Firestore no está disponible.');
    if (!window.ommDataLoaded) throw new Error('Espera a que termine de cargar la lista antes de importar.');
    actualizarProgresoImportacion(5, 'Leyendo archivo…');
    const { filasValidas, filasInvalidas } = await leerArchivoImportacion(archivo);
    if (!filasValidas.length) {
      mostrarFilasInvalidas(filasInvalidas);
      throw new Error(`No se importó ninguna mantención. ${filasInvalidas.length} fila(s) no cumplen los requisitos.`);
    }
    const primerId = await reservarIdsSecuenciales(filasValidas.length);
    const coleccion = window.firebaseApi.collection(window.db, 'mantencion_general');
    const tamanoLote = 400;
    const totalLotes = Math.ceil(filasValidas.length / tamanoLote);
    for (let inicio = 0; inicio < filasValidas.length; inicio += tamanoLote) {
      const lote = window.firebaseApi.writeBatch(window.db);
      filasValidas.slice(inicio, inicio + tamanoLote).forEach((fila, indice) => {
        const referencia = window.firebaseApi.doc(coleccion);
        lote.set(referencia, {
          ...fila,
          tipo: 'mantencion',
          preventivo: true,
          idSecuencial: primerId + inicio + indice,
          fechaCreacion: window.firebaseApi.serverTimestamp()
        });
      });
      await lote.commit();
      importadas += Math.min(tamanoLote, filasValidas.length - inicio);
      const loteActual = Math.floor(inicio / tamanoLote) + 1;
      actualizarProgresoImportacion(
        Math.min(100, Math.round(loteActual / totalLotes * 100)),
        `Guardando lote ${loteActual} de ${totalLotes}…`
      );
    }
    const primeraCategoria = filasValidas[0].categoria;
    seleccionarCategoriaMantencion(primeraCategoria);
    actualizarProgresoImportacion(100, 'Importación finalizada');
    const textoExito = filasValidas.length === 1
      ? 'Se importó 1 mantención correctamente.'
      : `Se importaron ${filasValidas.length} mantenciones correctamente.`;
    resultado.textContent = `${textoExito}${filasInvalidas.length ? ` Se omitieron ${filasInvalidas.length} fila(s) con errores.` : ''}`;
    resultado.hidden = false;
    mostrarFilasInvalidas(filasInvalidas);
    document.getElementById('importFileName').textContent = archivo.name;
  } catch (error) {
    console.error('No se pudo completar la importación de mantenciones.', error);
    resultado.textContent = importadas
      ? `La importación se interrumpió después de guardar ${importadas} mantención(es). ${error instanceof Error ? error.message : 'Revisa la conexión y los permisos de Firestore.'}`
      : error instanceof Error
      ? error.message
      : 'No se pudo completar la importación. Revisa el archivo, la conexión y los permisos de Firestore.';
    resultado.classList.add('is-error');
    resultado.hidden = false;
  } finally {
    importacionEnCurso = false;
    botonImportar.disabled = false;
    document.getElementById('closeImportMaintenance').disabled = false;
    document.getElementById('cancelImportMaintenance').disabled = false;
  }
}

function abrirImportacionMantenciones() {
  document.getElementById('importFileInput').value = '';
  document.getElementById('importFileName').textContent = 'Ningún archivo seleccionado';
  document.getElementById('startImportMaintenance').disabled = true;
  document.getElementById('importProgress').hidden = true;
  document.getElementById('importResult').hidden = true;
  document.getElementById('importInvalidRows').hidden = true;
  document.getElementById('importMaintenanceDialog').showModal();
}

function descargarPlantillaImportacion() {
  const contenido = '\uFEFFTítulo,Categoría,Habitación,Estado,Prioridad,Frecuencia,Presupuesto,Responsable\r\n';
  const enlace = document.createElement('a');
  const url = URL.createObjectURL(new Blob([contenido], { type: 'text/csv;charset=utf-8' }));
  enlace.href = url;
  enlace.download = 'plantilla-mantenciones.csv';
  enlace.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function reservarIdSecuencial(idRegistroEditado) {
  if (!window.firebaseApi || !window.db) throw new Error('Firebase no está disponible.');
  const referenciaContador = window.firebaseApi.doc(window.db, 'contadores', 'mantencion_general');
  let numeroReservado = null;
  await window.firebaseApi.runTransaction(window.db, async transaccion => {
    const contador = await transaccion.get(referenciaContador);
    const maximoEnRegistros = ommData.reduce((maximo, registro) =>
      Math.max(maximo, Number(registro.idSecuencial) || 0), 0
    );
    const valorContador = contador.exists() ? Number(contador.data().ultimoId) || 0 : 0;
    if (idRegistroEditado) {
      const registro = obtenerRegistro(idRegistroEditado);
      const idExistente = Number(registro?.idSecuencial);
      if (Number.isSafeInteger(idExistente) && idExistente > 0) {
        numeroReservado = idExistente;
        if (idExistente > valorContador) {
          transaccion.set(referenciaContador, { ultimoId: idExistente }, { merge: true });
        }
        return;
      }
    }
    numeroReservado = Math.max(valorContador, maximoEnRegistros) + 1;
    transaccion.set(referenciaContador, { ultimoId: numeroReservado }, { merge: true });
  });
  if (!Number.isSafeInteger(numeroReservado) || numeroReservado < 1) {
    throw new Error('No se pudo reservar un ID secuencial válido.');
  }
  return numeroReservado;
}

document.querySelectorAll('.maintenance-tab').forEach(boton => {
  boton.addEventListener('click', () => {
    categoriaActiva = boton.dataset.category;
    document.querySelectorAll('.maintenance-tab').forEach(tab => {
      const activa = tab === boton;
      tab.classList.toggle('active', activa);
      tab.setAttribute('aria-selected', String(activa));
    });
    document.getElementById('statusFilter').value = 'Todos';
    renderizarTarjetas();
  });
});
document.getElementById('maintenanceSearch').addEventListener('input', renderizarTarjetas);
document.getElementById('statusFilter').addEventListener('change', renderizarTarjetas);
document.getElementById('exportReport').addEventListener('click', exportarReporte);
document.getElementById('newMaintenanceButton').addEventListener('click', abrirFormularioMantencion);
document.getElementById('importMaintenanceButton').addEventListener('click', abrirImportacionMantenciones);
document.getElementById('importDropzone').addEventListener('click', () => {
  document.getElementById('importFileInput').click();
});
document.getElementById('importFileInput').addEventListener('change', evento => {
  const archivo = evento.target.files[0];
  document.getElementById('importFileName').textContent = archivo
    ? archivo.name
    : 'Ningún archivo seleccionado';
  document.getElementById('startImportMaintenance').disabled = !archivo;
  document.getElementById('importResult').hidden = true;
  document.getElementById('importInvalidRows').hidden = true;
  document.getElementById('importProgress').hidden = true;
});
document.getElementById('importDropzone').addEventListener('dragover', evento => {
  evento.preventDefault();
  evento.currentTarget.classList.add('is-dragging');
});
document.getElementById('importDropzone').addEventListener('dragleave', evento => {
  evento.currentTarget.classList.remove('is-dragging');
});
document.getElementById('importDropzone').addEventListener('drop', evento => {
  evento.preventDefault();
  evento.currentTarget.classList.remove('is-dragging');
  const archivo = evento.dataTransfer.files[0];
  if (!archivo) return;
  const transferencia = new DataTransfer();
  transferencia.items.add(archivo);
  const entrada = document.getElementById('importFileInput');
  entrada.files = transferencia.files;
  entrada.dispatchEvent(new Event('change', { bubbles: true }));
});
document.getElementById('startImportMaintenance').addEventListener('click', () => {
  void importarMantenciones();
});
document.getElementById('downloadImportTemplate').addEventListener('click', descargarPlantillaImportacion);
document.getElementById('closeImportMaintenance').addEventListener('click', () => {
  document.getElementById('importMaintenanceDialog').close();
});
document.getElementById('cancelImportMaintenance').addEventListener('click', () => {
  document.getElementById('importMaintenanceDialog').close();
});
document.getElementById('importMaintenanceDialog').addEventListener('click', evento => {
  if (evento.target === evento.currentTarget && !importacionEnCurso) {
    evento.currentTarget.close();
  }
});
document.getElementById('importMaintenanceDialog').addEventListener('cancel', evento => {
  if (importacionEnCurso) evento.preventDefault();
});
document.getElementById('newMaintenanceForm').addEventListener('submit', guardarNuevaMantencion);
document.getElementById('closeNewMaintenance').addEventListener('click', () => {
  document.getElementById('newMaintenanceDialog').close();
});
document.getElementById('cancelNewMaintenance').addEventListener('click', () => {
  document.getElementById('newMaintenanceDialog').close();
});
document.getElementById('newMaintenanceDialog').addEventListener('click', evento => {
  if (evento.target === evento.currentTarget) evento.currentTarget.close();
});
document.getElementById('maintenanceCards').addEventListener('click', evento => {
  const boton = evento.target.closest('[data-action]');
  const tarjeta = evento.target.closest('.maintenance-card');
  const registro = tarjeta && obtenerRegistro(tarjeta.dataset.id);
  if (!registro || !boton) return;
  if (boton.dataset.action === 'detail') abrirDetalle(registro);
  if (boton.dataset.action === 'edit') editarFicha(registro);
  if (boton.dataset.action === 'complete') void completarMantencion(registro, boton);
  if (boton.dataset.action === 'delete') void eliminarMantencion(registro, boton);
});
document.getElementById('closeDialog').addEventListener('click', () => document.getElementById('ommDialog').close());
document.getElementById('doneDialog').addEventListener('click', () => document.getElementById('ommDialog').close());
document.getElementById('editStatus').addEventListener('click', () => {
  document.getElementById('statusEditor').hidden = false;
  document.getElementById('newStatus').focus();
});
document.getElementById('editRecord').addEventListener('click', () => {
  if (registroActivo) editarFicha(registroActivo);
});
document.getElementById('saveStatus').addEventListener('click', guardarEstado);
document.getElementById('noteForm').addEventListener('submit', evento => {
  evento.preventDefault();
  const campo = document.getElementById('noteInput');
  const texto = campo.value.trim();
  if (!texto || !registroActivo) return;
  const lista = notasPorRegistro[registroActivo.id] || [];
  lista.unshift({ texto, fecha: formatoFechaMantencion.format(new Date()) });
  notasPorRegistro[registroActivo.id] = lista;
  guardarAlmacenamiento(almacenamientoNotas, notasPorRegistro);
  campo.value = '';
  renderizarNotas();
});
document.getElementById('ommDialog').addEventListener('click', evento => {
  if (evento.target === evento.currentTarget) evento.currentTarget.close();
});

const formatoCLP = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
window.addEventListener('omm-data-updated', sincronizarRegistros);
sincronizarRegistros();

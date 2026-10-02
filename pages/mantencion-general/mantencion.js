const categoriasMantencion = {
  machines: registro => ['Máquinas', 'Climatización', 'Calderas'].includes(registro.categoria),
  garden: registro => registro.categoria === 'Jardinería',
  reactive: registro => registro.categoria === 'Gasfitería' || (
    registro.tipo === 'mantencion' && registro.categoria === 'Obras' && registro.estado !== 'Completado'
  ),
  history: registro => registro.estado === 'Completado'
};
const estadosPermitidos = ['Al día', 'Pendiente', 'Vencido', 'En curso', 'Completado'];
const formatoFechaMantencion = new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium' });
const almacenamientoEstados = 'hotel-almendro-mantencion-estados';
const almacenamientoNotas = 'hotel-almendro-mantencion-notas';
const sobrescriturasEstado = leerAlmacenamiento(almacenamientoEstados, {});
const notasPorRegistro = leerAlmacenamiento(almacenamientoNotas, {});
const archivosLocales = new Map();
let categoriaActiva = 'machines';
let registroActivo = null;

ommData.forEach(registro => {
  if (sobrescriturasEstado[registro.id]) registro.estado = sobrescriturasEstado[registro.id];
  if (!Array.isArray(registro.archivosAdjuntos)) registro.archivosAdjuntos = [];
  archivosLocales.set(registro.id, [...registro.archivosAdjuntos]);
});

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
    const archivos = archivosLocales.get(registro.id) || [];
    const fechaClave = registro.fechaLimite
      ? `Vence ${fechaVisible(registro.fechaLimite)}`
      : `Revisión ${fechaVisible(registro.fechaUltimaRevision || registro.fechaRealizacion)}`;
    const adjuntoTexto = archivos.length ? `Adjuntos · ${archivos.length}` : 'Sin adjuntos';
    return `<article class="maintenance-card" role="button" tabindex="0" aria-haspopup="dialog" aria-label="Ver detalle: ${escaparHTML(registro.titulo)}" data-action="detail" data-id="${escaparHTML(registro.id)}">
      <div class="maintenance-card-top"><span class="status-badge ${claseBadge(registro.estado)}">${escaparHTML(registro.estado || 'Sin estado')}</span><span class="maintenance-location">${escaparHTML(registro.ubicacion || 'Ubicación no informada')}</span></div>
      <h3>${escaparHTML(registro.titulo)}</h3>
      <p class="maintenance-card-category">${escaparHTML(registro.categoria)}</p>
      <div class="maintenance-card-metrics"><span class="maintenance-card-date"><small>${registro.fechaLimite ? 'Fecha límite' : 'Última revisión'}</small><strong>${escaparHTML(fechaClave.replace(/^(Vence|Revisión) /, ''))}</strong></span><span class="maintenance-card-attachments ${archivos.length ? 'has-files' : ''}">${escaparHTML(adjuntoTexto)}</span></div>
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
  document.getElementById('dialogCode').textContent = `${registro.codigoOMM || 'Folio OMM no informado'} · ID interno ${registro.id}`;
  const campos = [
    ['Descripción', registro.descripcion || 'No incluida en la fuente'],
    ['Categoría', registro.categoria], ['Ubicación', registro.ubicacion],
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
  renderizarAdjuntos();
  renderizarNotas();
  if (!dialogo.open) dialogo.showModal();
}

function renderizarAdjuntos() {
  const lista = document.getElementById('attachmentList');
  const adjuntos = archivosLocales.get(registroActivo.id) || [];
  const adjuntosDemo = adjuntos.filter(archivo => archivo.simulado).length;
  document.getElementById('attachmentHelp').textContent = adjuntos.length
    ? `${adjuntos.length} archivo${adjuntos.length === 1 ? '' : 's'} · ${adjuntosDemo} de demostración, no originales del cliente.`
    : 'No hay adjuntos originales en la fuente OMM.';
  lista.innerHTML = adjuntos.length ? adjuntos.map((archivo, indice) => `
    <li class="attachment-item"><span>${escaparHTML(archivo.nombre)}</span>
    ${archivo.url ? `<a href="${escaparHTML(archivo.url)}" target="_blank" rel="noopener" download="${escaparHTML(archivo.nombre)}">Ver / descargar</a>` : `<span class="muted-cell">Adjunto registrado en fuente</span>`}
    </li>`).join('') : '<li class="empty-attachments">Sin archivos vinculados. Los documentos seleccionados no se suben a un servidor.</li>';
}

function renderizarNotas() {
  const notas = notasPorRegistro[registroActivo.id] || [];
  document.getElementById('noteList').innerHTML = notas.length
    ? notas.map(nota => `<li><time>${escaparHTML(nota.fecha)}</time>${escaparHTML(nota.texto)}</li>`).join('')
    : '<li class="empty-attachments">Todavía no hay observaciones en la bitácora.</li>';
}

function agregarAdjuntos(archivos) {
  if (!registroActivo || !archivos.length) return;
  const existentes = archivosLocales.get(registroActivo.id) || [];
  const nuevos = [...archivos].map(archivo => ({
    nombre: archivo.name,
    tipo: archivo.type || 'application/octet-stream',
    url: URL.createObjectURL(archivo),
    local: true
  }));
  archivosLocales.set(registroActivo.id, [...existentes, ...nuevos]);
  renderizarAdjuntos();
  renderizarTarjetas();
}

function guardarEstado() {
  if (!registroActivo) return;
  const nuevoEstado = document.getElementById('newStatus').value;
  registroActivo.estado = nuevoEstado;
  sobrescriturasEstado[registroActivo.id] = nuevoEstado;
  guardarAlmacenamiento(almacenamientoEstados, sobrescriturasEstado);
  renderizarTarjetas();
  actualizarContadores();
  abrirDetalle(registroActivo, true);
}

function exportarReporte() {
  document.title = 'Reporte de Mantención - Hotel El Almendro';
  window.print();
  window.setTimeout(() => { document.title = 'Mantención General | Hotel El Almendro'; }, 500);
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
document.getElementById('maintenanceCards').addEventListener('click', evento => {
  const tarjeta = evento.target.closest('[data-action="detail"]');
  const registro = tarjeta && obtenerRegistro(tarjeta.dataset.id);
  if (registro) abrirDetalle(registro);
});
document.getElementById('maintenanceCards').addEventListener('keydown', evento => {
  if (!['Enter', ' '].includes(evento.key)) return;
  const tarjeta = evento.target.closest('[data-action="detail"]');
  const registro = tarjeta && obtenerRegistro(tarjeta.dataset.id);
  if (registro) {
    evento.preventDefault();
    abrirDetalle(registro);
  }
});
document.getElementById('closeDialog').addEventListener('click', () => document.getElementById('ommDialog').close());
document.getElementById('doneDialog').addEventListener('click', () => document.getElementById('ommDialog').close());
document.getElementById('editStatus').addEventListener('click', () => {
  document.getElementById('statusEditor').hidden = false;
  document.getElementById('newStatus').focus();
});
document.getElementById('saveStatus').addEventListener('click', guardarEstado);
document.getElementById('attachmentInput').addEventListener('change', evento => {
  agregarAdjuntos(evento.target.files);
  evento.target.value = '';
});
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
actualizarContadores();
renderizarTarjetas();

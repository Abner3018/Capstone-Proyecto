const formatoMontoMejoras = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
const propuestasMejoras = ommData.filter(registro => registro.tipo === 'proyecto' && registro.categoria !== 'Remodelación');
const cotizacionesLocales = new Map();
let proyectoActivo = null;

function escaparMejoras(valor) {
  return String(valor ?? '').replace(/[&<>"']/g, caracter => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[caracter]);
}

function claseEstadoMejoras(estado) {
  if (estado === 'En curso') return 'status-progress';
  if (estado === 'Pendiente') return 'status-pending';
  if (estado === 'Completado') return 'status-done';
  return 'status-unknown';
}

function proyectosFiltrados() {
  const consulta = document.getElementById('projectSearch').value.trim().toLocaleLowerCase('es-CL');
  const estado = document.getElementById('projectState').value;
  return propuestasMejoras.filter(proyecto => {
    if (estado !== 'Todos' && proyecto.estado !== estado) return false;
    const texto = [proyecto.titulo, proyecto.categoria, proyecto.ubicacion, proyecto.responsable].filter(Boolean).join(' ').toLocaleLowerCase('es-CL');
    return !consulta || texto.includes(consulta);
  });
}

function renderizarProyectos() {
  const proyectos = proyectosFiltrados();
  const montoSolicitado = propuestasMejoras.filter(proyecto => proyecto.presupuestoActivo).reduce((total, proyecto) => total + (proyecto.presupuesto || 0), 0);
  const abiertos = propuestasMejoras.filter(proyecto => proyecto.estado !== 'Completado');
  document.getElementById('requestedBudget').textContent = formatoMontoMejoras.format(montoSolicitado);
  document.getElementById('openProjects').textContent = String(abiertos.length);
  document.getElementById('projectStatusSummary').textContent = `${propuestasMejoras.filter(proyecto => proyecto.estado === 'En curso').length} en curso · ${propuestasMejoras.filter(proyecto => proyecto.estado === 'Pendiente').length} pendientes`;
  document.getElementById('projectCount').textContent = `${proyectos.length} proyectos`;
  document.getElementById('projectGrid').innerHTML = proyectos.length ? proyectos.map(proyecto => {
    const cotizaciones = cotizacionesLocales.get(proyecto.id) || [];
    return `<article class="project-card">
      <div class="project-card-head"><div><span class="project-code">${escaparMejoras(proyecto.codigoOMM || `ID interno ${proyecto.id}`)} · ${escaparMejoras(proyecto.categoria)}</span><h3>${escaparMejoras(proyecto.titulo)}</h3></div><span class="status-badge ${claseEstadoMejoras(proyecto.estado)}">${escaparMejoras(proyecto.estado || 'Estado no informado')}</span></div>
      <p>${escaparMejoras(proyecto.descripcion || 'Descripción detallada no incluida en la fuente.')}</p>
      <div class="project-meta"><span>Área: ${escaparMejoras(proyecto.categoria)}</span><span>Ubicación: ${escaparMejoras(proyecto.ubicacion || 'No informada')}</span><span>Periodo: ${escaparMejoras(proyecto.periodo || 'No informado')}</span><span>Responsable: ${escaparMejoras(proyecto.responsable || 'No informado')}</span></div>
      <div class="project-card-bottom"><div class="project-budget">${proyecto.presupuesto === null ? 'No informado' : formatoMontoMejoras.format(proyecto.presupuesto)}<small>Presupuesto documentado</small></div><button class="button button-secondary" type="button" data-project="${escaparMejoras(proyecto.id)}">Ver comparativa${cotizaciones.length ? ` · ${cotizaciones.length}` : ''}</button></div>
      <p class="source-note">Fuente: ${escaparMejoras(proyecto.origen || 'OMM')}</p>
    </article>`;
  }).join('') : '<p class="no-projects">No hay proyectos que coincidan con estos filtros.</p>';
}

function abrirComparativa(proyecto) {
  proyectoActivo = proyecto;
  document.getElementById('quoteTitle').textContent = proyecto.titulo;
  document.getElementById('quoteContext').textContent = `${proyecto.categoria} · ${proyecto.periodo || 'Periodo no informado'} · ${proyecto.responsable || 'Responsable no informado'}`;
  document.getElementById('supplierName').value = '';
  document.getElementById('quoteAmount').value = '';
  document.getElementById('quoteFile').value = '';
  renderizarCotizaciones();
  document.getElementById('quoteDialog').showModal();
}

function renderizarCotizaciones() {
  const cotizaciones = cotizacionesLocales.get(proyectoActivo.id) || [];
  document.getElementById('quoteRows').innerHTML = cotizaciones.map(cotizacion => `<tr><td>${escaparMejoras(cotizacion.proveedor)}</td><td>${formatoMontoMejoras.format(cotizacion.monto)}</td><td>${cotizacion.archivo ? `<a href="${escaparMejoras(cotizacion.url)}" download="${escaparMejoras(cotizacion.archivo)}">${escaparMejoras(cotizacion.archivo)}</a>` : 'Sin archivo'}</td></tr>`).join('');
  document.getElementById('emptyQuotes').hidden = cotizaciones.length > 0;
}

document.getElementById('projectSearch').addEventListener('input', renderizarProyectos);
document.getElementById('projectState').addEventListener('change', renderizarProyectos);
document.getElementById('projectGrid').addEventListener('click', evento => {
  const boton = evento.target.closest('[data-project]');
  if (!boton) return;
  const proyecto = propuestasMejoras.find(item => item.id === boton.dataset.project);
  if (proyecto) abrirComparativa(proyecto);
});
document.getElementById('closeQuote').addEventListener('click', () => document.getElementById('quoteDialog').close());
document.getElementById('doneQuote').addEventListener('click', () => document.getElementById('quoteDialog').close());
document.getElementById('quoteForm').addEventListener('submit', evento => {
  evento.preventDefault();
  if (!proyectoActivo) return;
  const archivo = document.getElementById('quoteFile').files[0];
  const cotizaciones = cotizacionesLocales.get(proyectoActivo.id) || [];
  cotizaciones.push({
    proveedor: document.getElementById('supplierName').value.trim(),
    monto: Number(document.getElementById('quoteAmount').value),
    archivo: archivo?.name || null,
    url: archivo ? URL.createObjectURL(archivo) : null
  });
  cotizacionesLocales.set(proyectoActivo.id, cotizaciones);
  renderizarCotizaciones();
  renderizarProyectos();
  evento.currentTarget.reset();
});
document.getElementById('quoteDialog').addEventListener('click', evento => {
  if (evento.target === evento.currentTarget) evento.currentTarget.close();
});
renderizarProyectos();

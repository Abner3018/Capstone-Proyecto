const formatoMontoObra = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
const obrasRemodelacion = ommData.filter(registro =>
  registro.categoria === 'Remodelación' && ['proyecto', 'remodelacion'].includes(registro.tipo)
);
const fasesObra = ['Demolición', 'Obra gruesa', 'Terminaciones', 'Equipamiento'];
const evidenciaLocal = [];

function escaparObra(valor) {
  return String(valor ?? '').replace(/[&<>"']/g, caracter => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[caracter]);
}

function formatoEstadoObra(estado) {
  if (estado === 'Completado') return 'status-done';
  if (estado === 'En curso') return 'status-progress';
  if (estado === 'Pendiente') return 'status-pending';
  return 'status-unknown';
}

function renderizarObras() {
  const presupuestoTotal = obrasRemodelacion.reduce((total, obra) => total + (obra.presupuesto || 0), 0);
  const registrosConAvance = obrasRemodelacion.filter(obra => Number.isFinite(obra.avanceFisico));
  const avancePromedio = registrosConAvance.length
    ? `${Math.round(registrosConAvance.reduce((total, obra) => total + obra.avanceFisico, 0) / registrosConAvance.length)}%`
    : 'N/D';
  document.getElementById('renovationBudget').textContent = formatoMontoObra.format(presupuestoTotal);
  document.getElementById('renovationCount').textContent = `${obrasRemodelacion.length} proyectos o presupuestos documentados`;
  document.getElementById('executedBudget').textContent = obrasRemodelacion.some(obra => Number.isFinite(obra.presupuestoEjecutado))
    ? formatoMontoObra.format(obrasRemodelacion.reduce((total, obra) => total + (obra.presupuestoEjecutado || 0), 0))
    : 'N/D';
  document.getElementById('physicalProgress').textContent = avancePromedio;

  document.getElementById('renovationGrid').innerHTML = obrasRemodelacion.map(obra => {
    const ejecutado = Number.isFinite(obra.presupuestoEjecutado) ? obra.presupuestoEjecutado : null;
    const avance = Number.isFinite(obra.avanceFisico) ? obra.avanceFisico : null;
    const estado = obra.estado || 'Estado no informado';
    return `<article class="renovation-card">
      <div class="renovation-card-head"><div><h3>${escaparObra(obra.titulo)}</h3><p>${escaparObra(obra.ubicacion)} · ${escaparObra(obra.periodo || 'Periodo no informado')}</p></div><span class="status-badge ${formatoEstadoObra(obra.estado)}">${escaparObra(estado)}</span></div>
      <div class="renovation-budget">${obra.presupuesto === null ? 'No informado' : formatoMontoObra.format(obra.presupuesto)}<small>Presupuesto consignado en OMM</small></div>
      <div class="finance-line"><span>Ejecutado</span><strong>${ejecutado === null ? 'No informado' : formatoMontoObra.format(ejecutado)}</strong></div>
      <div class="progress-track ${ejecutado === null ? 'unknown' : ''}"><span style="width:${ejecutado !== null && obra.presupuesto ? Math.min(100, ejecutado / obra.presupuesto * 100) : 0}%"></span></div>
      <div class="progress-caption"><span>Avance financiero</span><span>${ejecutado === null ? 'N/D' : `${Math.round(ejecutado / obra.presupuesto * 100)}%`}</span></div>
      <div class="finance-line"><span>Avance físico</span><strong>${avance === null ? 'No informado' : `${avance}%`}</strong></div>
      <div class="progress-track ${avance === null ? 'unknown' : ''}"><span style="width:${avance ?? 0}%"></span></div>
      <div class="progress-caption"><span>Estado fuente</span><span>${escaparObra(estado)}</span></div>
      <p class="card-source">Responsable: ${escaparObra(obra.responsable || 'No informado')} · ${escaparObra(obra.origen || '')}</p>
    </article>`;
  }).join('');

  document.getElementById('phaseGrid').innerHTML = fasesObra.map((fase, indice) => `
    <article class="phase-step"><span>FASE 0${indice + 1}</span><strong>${fase}</strong><small>Fecha y estado no informados</small></article>`).join('');
  document.getElementById('relatedOmm').innerHTML = obrasRemodelacion.map(obra => `
    <div class="related-item"><div><strong>${escaparObra(obra.titulo)}</strong><small>${escaparObra(obra.codigoOMM || `Folio no informado · ID ${obra.id}`)} · ${escaparObra(obra.ubicacion)}</small></div><span class="status-badge ${formatoEstadoObra(obra.estado)}">${escaparObra(obra.estado || 'Sin estado')}</span></div>`).join('');
  document.getElementById('evidenceProject').innerHTML = obrasRemodelacion.map(obra => `<option value="${escaparObra(obra.id)}">${escaparObra(obra.titulo)}</option>`).join('');
}

function renderizarGaleria() {
  for (const etapa of ['before', 'progress']) {
    const destino = document.getElementById(etapa === 'before' ? 'beforeGallery' : 'progressGallery');
    const imagenes = evidenciaLocal.filter(imagen => imagen.etapa === etapa && imagen.proyecto === document.getElementById('evidenceProject').value);
    destino.innerHTML = imagenes.length ? imagenes.map(imagen => `<figure class="gallery-figure"><img src="${escaparObra(imagen.url)}" alt="${escaparObra(imagen.nombre)}"><figcaption>${escaparObra(imagen.nombre)}</figcaption></figure>`).join('')
      : '<p class="gallery-empty">No hay fotos cargadas en esta sesión.</p>';
  }
}

document.getElementById('evidenceInput').addEventListener('change', evento => {
  const archivo = evento.target.files[0];
  if (!archivo || !archivo.type.startsWith('image/')) return;
  evidenciaLocal.push({
    proyecto: document.getElementById('evidenceProject').value,
    etapa: document.getElementById('evidenceStage').value,
    nombre: archivo.name,
    url: URL.createObjectURL(archivo)
  });
  renderizarGaleria();
  evento.target.value = '';
});
document.getElementById('evidenceProject').addEventListener('change', renderizarGaleria);
renderizarObras();
renderizarGaleria();

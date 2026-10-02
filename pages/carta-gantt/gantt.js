const mesesGantt = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const hoyGantt = new Date();
const anioGantt = hoyGantt.getFullYear();
let filtroGantt = 'todos';
const detalleGantt = document.getElementById('ganttDetail');

function escaparGantt(valor) {
  return String(valor ?? '').replace(/[&<>"']/g, caracter => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[caracter]);
}

function fechaGantt(valor) {
  if (!valor) return 'No informada';
  const fecha = new Date(`${valor}T12:00:00`);
  return Number.isNaN(fecha.getTime()) ? escaparGantt(valor) : new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium' }).format(fecha);
}

function categoriaGantt(registro) {
  if (registro.tipo === 'remodelacion' || registro.categoria === 'Remodelación') return 'remodelacion';
  if (registro.tipo === 'proyecto') return 'mejoras';
  return 'mantencion';
}

function registrosConPeriodo() {
  return ommData.flatMap(registro => {
    if (registro.mesInicio && registro.mesFin) {
      return [{ registro, inicioMes: registro.mesInicio, finMes: registro.mesFin, hito: false, anioDesconocido: true }];
    }
    if (registro.tipo !== 'mantencion' || !registro.fechaRealizacion) return [];
    const fecha = new Date(`${registro.fechaRealizacion}T12:00:00`);
    if (Number.isNaN(fecha.getTime()) || fecha.getFullYear() !== anioGantt) return [];
    return [{
      registro,
      inicioMes: fecha.getMonth() + 1,
      finMes: fecha.getMonth() + 1,
      hito: true,
      dia: fecha.getDate(),
      diasMes: new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).getDate(),
      anioDesconocido: false
    }];
  });
}

function filasVisibles() {
  return registrosConPeriodo().filter(fila => filtroGantt === 'todos' || categoriaGantt(fila.registro) === filtroGantt);
}

function claseBarra(registro) {
  if (registro.estado === 'Completado' || registro.estado === 'Al día') return 'completed';
  if (registro.estado === 'Vencido') return 'overdue';
  if (registro.estado === 'Urgente' || registro.prioridad === 'Urgente' || registro.estado === 'Pendiente') return 'pending';
  if (registro.estado === 'Planificado') return 'planned';
  return 'progress';
}

function porcentajeHoy() {
  const inicioAnio = new Date(anioGantt, 0, 1);
  const transcurrido = hoyGantt - inicioAnio;
  const total = new Date(anioGantt + 1, 0, 1) - inicioAnio;
  return Math.min(100, Math.max(0, transcurrido / total * 100));
}

function renderizarGantt() {
  const meses = document.getElementById('ganttMonths');
  const cuerpo = document.getElementById('ganttRows');
  meses.innerHTML = mesesGantt.map(mes => `<span>${mes}</span>`).join('');
  const filas = filasVisibles();
  const hoy = porcentajeHoy();
  document.getElementById('ganttToday').textContent = `Hoy · ${new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium' }).format(hoyGantt)}`;
  document.getElementById('ganttCount').textContent = `${filas.length} ${filas.length === 1 ? 'registro' : 'registros'} con periodo o hito fechado`;
  cuerpo.innerHTML = filas.length ? filas.map(({ registro, inicioMes, finMes, hito, dia, diasMes, anioDesconocido }) => {
    const status = registro.estado || 'Estado no informado';
    const inicio = hito ? `Última revisión: ${fechaGantt(registro.fechaRealizacion)}` : `Mes ${mesesGantt[inicioMes - 1]}–${mesesGantt[finMes - 1]} · año no indicado`;
    const tituloBarra = `${registro.titulo} · ${inicio} · ${status}`;
    const columnaInicio = inicioMes;
    const columnaFin = hito ? inicioMes + 1 : finMes + 1;
    const estiloDia = hito ? `--day-offset:${(dia - 1) / diasMes * 100}` : '';
    const tipoClase = categoriaGantt(registro);
    const barClasses = `gantt-bar ${claseBarra(registro)} ${hito ? 'milestone' : ''}`;
    return `<article class="gantt-row">
      <div class="gantt-task"><strong>${escaparGantt(registro.titulo)}</strong><small>${escaparGantt(registro.codigoOMM || `Folio no informado · ${registro.categoria}`)} · ${escaparGantt(inicio)}</small></div>
      <div class="gantt-track" aria-label="${escaparGantt(tituloBarra)}"><span class="today-marker" style="left:${hoy}%" aria-label="Hoy"></span>
        <button class="${barClasses}" type="button" data-omm-id="${escaparGantt(registro.id)}" data-module="${tipoClase}" style="grid-column:${columnaInicio}/${columnaFin};${estiloDia}" title="${escaparGantt(tituloBarra)}" aria-label="Abrir detalle: ${escaparGantt(tituloBarra)}">${hito ? '' : escaparGantt(registro.responsable || status)}</button>
      </div>
    </article>`;
  }).join('') : '<p class="gantt-empty">No hay OMM con periodos o hitos fechados para este filtro. Los registros sin fecha permanecen en sus módulos, sin asignarles un cronograma supuesto.</p>';
}

function adjuntoEnGantt(registro, archivo) {
  if (archivo.url?.startsWith('blob:') || archivo.url?.startsWith('http')) return archivo.url;
  if (archivo.simulado && archivo.url) return `../mantencion-general/${archivo.url}`;
  return archivo.url || '#';
}

function abrirDetalleGantt(registro) {
  document.getElementById('ganttDetailTitle').textContent = registro.titulo;
  document.getElementById('ganttDetailCode').textContent = `${registro.codigoOMM || 'Folio OMM no informado'} · ID interno ${registro.id}`;
  const periodo = registro.periodo || (registro.mesInicio && registro.mesFin
    ? `${mesesGantt[registro.mesInicio - 1]}–${mesesGantt[registro.mesFin - 1]} · año no indicado`
    : 'No informado');
  const valores = [
    ['Categoría', registro.categoria], ['Ubicación', registro.ubicacion], ['Estado', registro.estado || 'No informado'],
    ['Prioridad', registro.prioridad || 'No informada'], ['Periodo / fecha', periodo],
    ['Fecha límite', fechaGantt(registro.fechaLimite)], ['Última revisión', fechaGantt(registro.fechaUltimaRevision || registro.fechaRealizacion)],
    ['Responsable', registro.responsable || 'No informado'], ['Presupuesto', registro.presupuesto === null ? 'No informado' : new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(registro.presupuesto)],
    ['Descripción', registro.descripcion || 'No incluida en la fuente'], ['Fuente', registro.origen || 'No informada']
  ];
  document.getElementById('ganttDetailFields').innerHTML = valores.map(([etiqueta, valor]) => `<div class="gantt-detail"><dt>${escaparGantt(etiqueta)}</dt><dd>${escaparGantt(valor)}</dd></div>`).join('');
  const adjuntos = registro.archivosAdjuntos || [];
  document.getElementById('ganttAttachments').innerHTML = adjuntos.length
    ? adjuntos.map(archivo => `<li><span>${escaparGantt(archivo.nombre)}${archivo.simulado ? ' · demo' : ''}</span><a href="${escaparGantt(adjuntoEnGantt(registro, archivo))}" target="_blank" rel="noopener">Ver / descargar</a></li>`).join('')
    : '<li>Sin archivos adjuntos informados.</li>';
  detalleGantt.showModal();
}

document.getElementById('ganttFilter').addEventListener('change', evento => {
  filtroGantt = evento.target.value;
  renderizarGantt();
});
document.getElementById('ganttRows').addEventListener('click', evento => {
  const barra = evento.target.closest('[data-omm-id]');
  if (!barra) return;
  const registro = ommData.find(item => item.id === barra.dataset.ommId);
  if (registro) abrirDetalleGantt(registro);
});
document.getElementById('closeGanttDetail').addEventListener('click', () => detalleGantt.close());
document.getElementById('doneGanttDetail').addEventListener('click', () => detalleGantt.close());
detalleGantt.addEventListener('click', evento => { if (evento.target === detalleGantt) detalleGantt.close(); });
renderizarGantt();

const formatoCLP = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0
});
const ordenEstados = ['Al día', 'Pendiente', 'Vencido', 'En curso', 'Planificado', 'Completado', 'Sin estado'];
const coloresEstado = {
  'Al día': '#1b8a5a',
  'Pendiente': '#b78103',
  'Vencido': '#d9363e',
  'En curso': '#0958d9',
  'Planificado': '#5b46e0',
  'Completado': '#74a98a',
  'Sin estado': '#aaa198'
};
const paletaAreas = ['#b58d3d', '#1b8a5a', '#5b46e0', '#0958d9', '#d9363e', '#74a98a'];
const instanciasGraficos = {};
let areaSeleccionada = 'Todas';

function obtenerRegistrosVisibles() {
  return areaSeleccionada === 'Todas'
    ? ommData
    : ommData.filter(registro => registro.categoria === areaSeleccionada);
}

function actualizarTexto(id, valor) {
  const elemento = document.getElementById(id);
  if (elemento) elemento.textContent = valor;
}

function contarEstados(registros) {
  return ordenEstados.map(estado => ({
    estado,
    cantidad: estado === 'Sin estado'
      ? registros.filter(registro => !registro.estado).length
      : registros.filter(registro => registro.estado === estado).length
  }));
}

function sumarPresupuestosPorArea(registros) {
  const totales = new Map();
  registros.forEach(registro => {
    if (!Number.isFinite(registro.presupuesto)) return;
    const categoria = registro.categoria || 'Sin categoría';
    totales.set(categoria, (totales.get(categoria) || 0) + registro.presupuesto);
  });
  return [...totales].map(([etiqueta, monto], indice) => ({
    etiqueta,
    monto,
    color: paletaAreas[indice % paletaAreas.length]
  }));
}

function actualizarTarjetas(registros) {
  const conPresupuesto = registros.filter(registro => Number.isFinite(registro.presupuesto));
  const proyectosEnCurso = registros.filter(registro => registro.estado === 'En curso');
  const alertas = registros.filter(registro =>
    registro.estado === 'Vencido' || estaVencido(registro.fechaLimite) ||
    ['Alta', 'Urgente'].includes(registro.prioridad)
  );
  const preventivasConFecha = registros.filter(registro =>
    registro.preventivo && registro.fechaLimite
  );
  const preventivasAlDia = preventivasConFecha.filter(registro => registro.estado === 'Al día');
  const preventivasCompletadas = registros.filter(registro =>
    registro.preventivo && registro.estado === 'Completado'
  );
  const presupuestoTotal = conPresupuesto.reduce((total, registro) => total + registro.presupuesto, 0);

  actualizarTexto('kpiBudget', formatoCLP.format(presupuestoTotal));
  actualizarTexto('kpiBudgetNote', `${conPresupuesto.length} registros con presupuesto informado`);
  actualizarTexto('kpiProgress', String(proyectosEnCurso.length));
  actualizarTexto('kpiProgressNote', `${proyectosEnCurso.length} registros en curso`);
  actualizarTexto('kpiAlerts', String(alertas.length));
  actualizarTexto('kpiPreventive', preventivasConFecha.length
    ? `${preventivasAlDia.length} / ${preventivasConFecha.length}`
    : 'N/D');
  actualizarTexto('kpiPreventiveNote', preventivasConFecha.length
    ? `${Math.round(preventivasAlDia.length / preventivasConFecha.length * 100)}% según fechas límite registradas`
    : `${preventivasCompletadas.length} tareas preventivas completadas; sin fechas límite para calcular cumplimiento`);

  renderizarAlertas(alertas);
  renderizarProximos(registros.filter(registro =>
    registro.estado === 'Pendiente' && (registro.periodo || registro.fechaLimite)
  ));
}

function estaVencido(fecha) {
  if (!fecha) return false;
  const fechaLimite = new Date(`${fecha}T23:59:59`);
  return !Number.isNaN(fechaLimite.getTime()) && fechaLimite < new Date();
}

function renderizarAlertas(registros) {
  const lista = document.getElementById('alertList');
  if (!lista) return;
  if (!registros.length) {
    lista.innerHTML = '<div class="empty-state"><div><strong>Sin alertas críticas registradas</strong><span>Los registros críticos aparecerán aquí cuando se informen en Firestore.</span></div></div>';
    return;
  }
  lista.innerHTML = `<ul class="alert-list">${registros.map(registro => `
    <li class="alert-item">
      <div><strong>${escaparDashboard(registro.titulo)}</strong><small>${escaparDashboard(registro.ubicacion || registro.categoria)} · ${escaparDashboard(registro.responsable || 'Responsable no informado')}</small></div>
      <span class="status-badge ${claseEstado(registro.estado)}">${escaparDashboard(registro.estado || registro.prioridad)}</span>
    </li>`).join('')}</ul>`;
}

function renderizarProximos(registros) {
  const lista = document.getElementById('upcomingList');
  if (!lista) return;
  lista.innerHTML = registros.length
    ? registros.map(registro => `<li class="alert-item"><div><strong>${escaparDashboard(registro.titulo)}</strong><small>${escaparDashboard(registro.periodo || registro.fechaLimite)} · ${escaparDashboard(registro.responsable || 'Responsable no informado')}</small></div><span class="status-badge status-pending">PENDIENTE</span></li>`).join('')
    : '<li class="no-records">No hay registros pendientes con fecha para esta selección.</li>';
}

function escaparDashboard(valor) {
  return String(valor ?? '').replace(/[&<>"']/g, caracter => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[caracter]);
}

function claseEstado(estado) {
  if (estado === 'Completado' || estado === 'Al día') return 'status-done';
  if (estado === 'Pendiente' || estado === 'Urgente') return 'status-pending';
  if (estado === 'Vencido') return 'status-overdue';
  if (estado === 'Planificado') return 'status-planned';
  if (estado === 'En curso') return 'status-progress';
  return 'status-unknown';
}

function renderizarLeyenda(elemento, items, presupuesto = false) {
  elemento.innerHTML = items.length
    ? items.map(item => `<li><span class="legend-swatch" style="background:${item.color}"></span><span>${escaparDashboard(item.etiqueta)}: ${presupuesto ? formatoCLP.format(item.monto) : item.cantidad}</span></li>`).join('')
    : '<li>Sin registros</li>';
}

function crearGrafico(id, configuracion) {
  if (instanciasGraficos[id]) instanciasGraficos[id].destroy();
  const canvas = document.getElementById(id);
  if (!canvas || !window.Chart) return;
  instanciasGraficos[id] = new Chart(canvas, configuracion);
}

function renderizarGraficos(registros) {
  const presupuestoPorArea = sumarPresupuestosPorArea(registros);
  const estados = registros.length ? contarEstados(registros).filter(item => item.cantidad > 0) : [];
  const remodelaciones = registros.filter(registro => registro.tipo === 'remodelacion' && registro.presupuesto !== null);

  renderizarLeyenda(document.getElementById('budgetLegend'), presupuestoPorArea, true);
  renderizarLeyenda(document.getElementById('statusLegend'), estados.map(item => ({
    etiqueta: item.estado,
    cantidad: item.cantidad,
    color: coloresEstado[item.estado]
  })));

  if (!window.Chart) {
    document.querySelectorAll('.chart-fallback').forEach(elemento => { elemento.hidden = false; });
    document.querySelectorAll('.chart-canvas').forEach(canvas => { canvas.hidden = true; });
    return;
  }
  document.querySelectorAll('.chart-fallback').forEach(elemento => { elemento.hidden = true; });
  document.querySelectorAll('.chart-canvas').forEach(canvas => { canvas.hidden = false; });

  crearGrafico('budgetChart', {
    type: 'doughnut',
    data: {
      labels: presupuestoPorArea.map(item => item.etiqueta),
      datasets: [{
        data: presupuestoPorArea.map(item => item.monto),
        backgroundColor: presupuestoPorArea.map(item => item.color),
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverOffset: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: contexto => `${contexto.label}: ${formatoCLP.format(contexto.raw)}` } }
      }
    }
  });

  crearGrafico('statusChart', {
    type: 'bar',
    data: {
      labels: estados.map(item => item.estado),
      datasets: [{
        data: estados.map(item => item.cantidad),
        backgroundColor: estados.map(item => coloresEstado[item.estado]),
        borderRadius: 3,
        maxBarThickness: 22
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { beginAtZero: true, ticks: { precision: 0, color: '#756a60' }, grid: { color: '#efe8dc' } },
        y: { ticks: { color: '#756a60' }, grid: { display: false } }
      }
    }
  });

  crearGrafico('remodelChart', {
    type: 'bar',
    data: {
      labels: remodelaciones.map(item => item.ubicacion.replace('Habitación ', 'Hab. ')),
      datasets: [{
        label: 'Presupuesto con IVA',
        data: remodelaciones.map(item => item.presupuesto),
        backgroundColor: ['#b58d3d', '#1b8a5a', '#0958d9', '#5b46e0'],
        borderRadius: 3,
        maxBarThickness: 54
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: contexto => formatoCLP.format(contexto.raw) } }
      },
      scales: {
        y: { beginAtZero: true, ticks: { color: '#756a60', callback: valor => formatoCLP.format(valor) }, grid: { color: '#e2d7c5' } },
        x: { ticks: { color: '#756a60' }, grid: { display: false } }
      }
    }
  });
}

function renderizarDashboard() {
  actualizarFiltroAreas();
  const registros = obtenerRegistrosVisibles();
  actualizarTarjetas(registros);
  renderizarGraficos(registros);
}

function actualizarFiltroAreas() {
  const filtro = document.getElementById('areaFilter');
  const valorActual = filtro.value;
  const categorias = [...new Set(ommData.map(registro => registro.categoria).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'es-CL')
  );
  filtro.innerHTML = '<option value="Todas">Todas las áreas</option>';
  categorias.forEach(categoria => {
    const opcion = document.createElement('option');
    opcion.value = categoria;
    opcion.textContent = categoria;
    filtro.append(opcion);
  });
  filtro.value = categorias.includes(valorActual) ? valorActual : 'Todas';
}

document.getElementById('areaFilter').addEventListener('change', evento => {
  areaSeleccionada = evento.target.value;
  renderizarDashboard();
});
window.addEventListener('resize', () => {
  Object.values(instanciasGraficos).forEach(grafico => grafico.resize());
});
renderizarDashboard();
window.addEventListener('omm-data-updated', renderizarDashboard);

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
const paletaAreas = ['#b58d3d', '#1b8a5a', '#5b46e0'];
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
  const areas = [
    { categoria: 'Obras', etiqueta: 'Mejoras obras' },
    { categoria: 'Jardinería', etiqueta: 'Jardinería' },
    { categoria: 'Remodelación', etiqueta: 'Remodelaciones' }
  ];
  return areas.map((area, indice) => ({
    etiqueta: area.etiqueta,
    monto: registros
      .filter(registro => registro.categoria === area.categoria)
      .reduce((total, registro) => total + (registro.presupuesto || 0), 0),
    color: paletaAreas[indice]
  })).filter(area => area.monto > 0);
}

function actualizarTarjetas(registros) {
  const proyectosActivos = registros.filter(registro => registro.tipo === 'proyecto' && registro.presupuestoActivo);
  const proyectosEnCurso = proyectosActivos.filter(registro => registro.estado === 'En curso');
  const alertas = registros.filter(registro =>
    registro.estado === 'Vencido' || ['Alta', 'Urgente'].includes(registro.prioridad)
  );
  const preventivasConFecha = registros.filter(registro =>
    registro.preventivo && registro.fechaLimite
  );
  const preventivasAlDia = preventivasConFecha.filter(registro => registro.estado === 'Al día');
  const preventivasCompletadas = registros.filter(registro =>
    registro.preventivo && registro.estado === 'Completado'
  );
  const presupuestoActivo = proyectosActivos.reduce(
    (total, registro) => total + (registro.presupuesto || 0), 0
  );

  actualizarTexto('kpiBudget', formatoCLP.format(presupuestoActivo));
  actualizarTexto('kpiBudgetNote', `${proyectosActivos.length} proyectos no cerrados con presupuesto explícito`);
  actualizarTexto('kpiProgress', String(proyectosEnCurso.length));
  actualizarTexto('kpiProgressNote', `${proyectosEnCurso.length} de ${proyectosActivos.length} proyectos no cerrados`);
  actualizarTexto('kpiAlerts', String(alertas.length));
  actualizarTexto('kpiPreventive', preventivasConFecha.length
    ? `${preventivasAlDia.length} / ${preventivasConFecha.length}`
    : 'N/D');
  actualizarTexto('kpiPreventiveNote', preventivasConFecha.length
    ? `${Math.round(preventivasAlDia.length / preventivasConFecha.length * 100)}% según fechas límite registradas`
    : `${preventivasCompletadas.length} tareas marcadas al día; faltan fechas límite para calcular cumplimiento`);

  renderizarAlertas(alertas);
  renderizarProximos(registros.filter(registro => registro.tipo === 'proyecto' && registro.estado === 'Pendiente'));
}

function renderizarAlertas(registros) {
  const lista = document.getElementById('alertList');
  if (!lista) return;
  if (!registros.length) {
    lista.innerHTML = '<div class="empty-state"><div><strong>Sin alertas críticas registradas</strong><span>No hay OMM marcadas como vencidas ni con prioridad alta o urgente en los archivos revisados.</span></div></div>';
    return;
  }
  lista.innerHTML = `<ul class="alert-list">${registros.map(registro => `
    <li class="alert-item">
      <div><strong>${registro.titulo}</strong><small>${registro.ubicacion || registro.categoria} · ${registro.responsable || 'Responsable no informado'}</small></div>
      <span class="status-badge ${claseEstado(registro.estado)}">${registro.estado || registro.prioridad}</span>
    </li>`).join('')}</ul>`;
}

function renderizarProximos(registros) {
  const lista = document.getElementById('upcomingList');
  if (!lista) return;
  lista.innerHTML = registros.length
    ? registros.map(registro => `<li class="alert-item"><div><strong>${registro.titulo}</strong><small>${registro.periodo || 'Periodo no informado'} · ${registro.responsable || 'Responsable no informado'}</small></div><span class="status-badge status-pending">PENDIENTE</span></li>`).join('')
    : '<li class="no-records">No hay proyectos pendientes en esta selección.</li>';
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
    ? items.map(item => `<li><span class="legend-swatch" style="background:${item.color}"></span><span>${item.etiqueta}: ${presupuesto ? formatoCLP.format(item.monto) : item.cantidad}</span></li>`).join('')
    : '<li>Sin registros para esta área</li>';
}

function crearGrafico(id, configuracion) {
  if (instanciasGraficos[id]) instanciasGraficos[id].destroy();
  const canvas = document.getElementById(id);
  if (!canvas || !window.Chart) return;
  instanciasGraficos[id] = new Chart(canvas, configuracion);
}

function renderizarGraficos(registros) {
  const presupuestoPorArea = sumarPresupuestosPorArea(registros);
  const estados = contarEstados(registros).filter(item =>
    item.cantidad > 0 || ['Al día', 'Pendiente', 'Vencido', 'En curso', 'Planificado'].includes(item.estado)
  );
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
  const registros = obtenerRegistrosVisibles();
  actualizarTarjetas(registros);
  renderizarGraficos(registros);
}

document.getElementById('areaFilter').addEventListener('change', evento => {
  areaSeleccionada = evento.target.value;
  renderizarDashboard();
});
window.addEventListener('resize', () => {
  Object.values(instanciasGraficos).forEach(grafico => grafico.resize());
});
renderizarDashboard();

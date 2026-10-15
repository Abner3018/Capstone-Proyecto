const categoriasMantencion = [
  { collection: 'alcantarillado', label: 'Alcantarillado' },
  { collection: 'baño', label: 'Baño' },
  { collection: 'bodega', label: 'Bodega' },
  { collection: 'jardineria', label: 'Jardinería' },
  { collection: 'maquina', label: 'Máquinas' },
  { collection: 'puertas', label: 'Puertas' },
  { collection: 'radiador', label: 'Radiador' },
  { collection: 'refrigerador', label: 'Refrigerador' },
  { collection: 'televisionespilas', label: 'Televisiones / Pilas' }
];
const estadosAlcantarillado = ['Completa', 'No se realizó', 'Otro'];
const tiposBano = [
  'Mantención desagüe lavamanos',
  'Mantención desagüe tina',
  'Instalación de porta rollo'
];
const ubicacionesAlcantarillado = ['Centro de eventos', 'Hotel', 'Casa'];
const ubicacionesBodega = ['Centro de eventos', 'Hotel'];
const sectoresJardineria = ['Centro', 'Hotel', 'Parcela Casa'];
const opcionesSiNo = ['si', 'no'];
const prioridadesJardineria = ['0', '1', '2', '3'];
const estadosMaquina = ['Activo', 'Descontinuado'];
const ubicacionesRefrigerador = [
  'Bodega quincho', 'Quincho chico', 'Cocina salon', 'Bodega congelados', 'Salon comedor', 'Recepcion'
];
const ubicacionesRadiador = ['Hotel', 'Salon', 'Recepción', 'Oficina', 'Sala de caldera'];
const nombresRadiadorPorUbicacion = {
  Hotel: [
    ...Array.from({ length: 8 }, (_, index) => ({ value: `${101 + index} (Rojo)`, label: `${101 + index} (Rojo)` })),
    ...Array.from({ length: 8 }, (_, index) => ({ value: `${201 + index} (Verde)`, label: `${201 + index} (Verde)` })),
    ...Array.from({ length: 8 }, (_, index) => ({ value: `${301 + index} (Azul)`, label: `${301 + index} (Azul)` }))
  ],
  Salon: [{ value: '2° piso', label: '2° piso' }, { value: '3° piso', label: '3° piso' }],
  Recepción: [{ value: 'Recepción', label: 'Recepción' }],
  Oficina: ['Jesús Cordero', 'Andrés Cordero', 'Javiera Cordero'].map(nombre => ({ value: nombre, label: nombre })),
  'Sala de caldera': ['Caldera', 'Separador de partículas'].map(nombre => ({ value: nombre, label: nombre }))
};
const proveedoresRadiador = ['Cosmoplas', 'Midea', 'otro'];
const lugaresBano = ['Habitación', 'Baño Público', 'Cabaña'];
const lugaresTelevisiones = ['Habitación', 'Salon', 'Cabaña'];
const opcionesNumeroBano = {
  'Habitación': Array.from({ length: 24 }, (_, index) => {
    const bloque = Math.floor(index / 8) + 1;
    return { value: String(bloque * 100 + (index % 8) + 1), label: String(bloque * 100 + (index % 8) + 1) };
  }),
  'Baño Público': [{ value: 'Baño P. 1', label: 'Baño P. 1' }, { value: 'Baño P. 2', label: 'Baño P. 2' }],
  Cabaña: [{ value: 'Sol', label: 'Sol' }, { value: 'Luna', label: 'Luna' }]
};
const opcionesNumeroTelevisiones = {
  'Habitación': [
    ...Array.from({ length: 8 }, (_, index) => ({ value: String(101 + index), label: `${101 + index} - Rojo` })),
    ...Array.from({ length: 8 }, (_, index) => ({ value: String(201 + index), label: `${201 + index} - Verde` })),
    ...Array.from({ length: 8 }, (_, index) => ({ value: String(301 + index), label: `${301 + index} - Azul` }))
  ],
  Salon: [{ value: 'Salon 2°piso', label: 'Salon 2°piso' }, { value: 'Salon 3°piso', label: 'Salon 3°piso' }],
  Cabaña: [{ value: 'Sol', label: 'Sol' }, { value: 'Luna', label: 'Luna' }]
};
const esquemaCampos = {
  alcantarillado: {
    campos: ['nombrecompleto', 'ubicacion', 'fecha', 'estado', 'detalle'],
    requeridos: ['nombrecompleto', 'ubicacion', 'fecha', 'estado'],
    fechas: ['fecha'],
    opciones: { ubicacion: ubicacionesAlcantarillado, estado: estadosAlcantarillado }
  },
  baño: {
    campos: ['lugar', 'numero', 'tipo', 'fecha'],
    requeridos: ['lugar', 'numero', 'tipo', 'fecha'],
    fechas: ['fecha'],
    opciones: { lugar: lugaresBano, tipo: tiposBano }
  },
  bodega: {
    campos: ['nombrecompleto', 'nemotecnico', 'ubicacion', 'inventariadofecha', 'responsable'],
    requeridos: ['nombrecompleto', 'nemotecnico', 'ubicacion', 'inventariadofecha', 'responsable'],
    fechas: ['inventariadofecha'],
    opciones: { ubicacion: ubicacionesBodega }
  },
  puertas: {
    campos: ['nombrecompleto', 'ubicacion', 'fechaultimamantencion', 'responsable'],
    requeridos: ['nombrecompleto', 'ubicacion', 'fechaultimamantencion', 'responsable'],
    fechas: ['fechaultimamantencion']
  },
  jardineria: {
    campos: ['nombre', 'sector', 'periodoinvoto', 'periodoverpri', 'prioridad'],
    requeridos: ['nombre', 'sector', 'periodoinvoto', 'periodoverpri', 'prioridad'],
    opciones: {
      sector: sectoresJardineria,
      periodoinvoto: opcionesSiNo,
      periodoverpri: opcionesSiNo,
      prioridad: prioridadesJardineria
    },
    numericos: ['prioridad']
  },
  maquina: {
    campos: ['nombre', 'ubicacion', 'proveedor', 'fechamantencion', 'responsable', 'detalletrabajo', 'estado'],
    requeridos: ['nombre', 'ubicacion', 'proveedor', 'fechamantencion', 'responsable', 'estado'],
    fechas: ['fechamantencion'],
    opciones: { estado: estadosMaquina }
  },
  radiador: {
    campos: ['ubicacion', 'nombre', 'descripcion', 'proveedor', 'fecha', 'responsable', 'detalletrabajo'],
    requeridos: ['ubicacion', 'nombre', 'proveedor', 'fecha', 'responsable'],
    fechas: ['fecha'],
    opciones: { ubicacion: ubicacionesRadiador, proveedor: proveedoresRadiador }
  },
  refrigerador: {
    campos: ['nombre', 'ubicacion', 'proveedor', 'fecha', 'responsable', 'detalle'],
    requeridos: ['nombre', 'ubicacion', 'proveedor', 'fecha', 'responsable'],
    fechas: ['fecha'],
    opciones: { ubicacion: ubicacionesRefrigerador }
  },
  televisionespilas: {
    campos: [
      'lugar', 'numero', 'tvmarca', 'tamaño', 'controltvoriginal',
      'controltvmantencionfecha', 'controldecofunciona', 'controldecofechaman'
    ],
    requeridos: ['lugar', 'numero', 'tvmarca', 'tamaño', 'controltvoriginal', 'controldecofunciona'],
    fechasONa: ['controltvmantencionfecha', 'controldecofechaman'],
    opciones: {
      lugar: lugaresTelevisiones,
      controltvoriginal: ['si', 'no'],
      controldecofunciona: ['si', 'no']
    },
    numericos: ['tamaño']
  }
};
const formatoFechaMantencion = new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium' });
const almacenamientoNotas = 'hotel-almendro-mantencion-notas';
const notasPorRegistro = leerAlmacenamiento(almacenamientoNotas, {});
let categoriaActiva = 'alcantarillado';
let registroActivo = null;
let registroEnEdicion = null;

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

function fechaInput(valor) {
  if (!valor) return '';
  if (typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valor)) return valor;
  const fecha = typeof valor.toDate === 'function'
    ? valor.toDate()
    : valor instanceof Date ? valor : new Date(valor);
  if (Number.isNaN(fecha.getTime())) return '';
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
}

function fechaVisible(valor) {
  const fecha = fechaInput(valor);
  if (!fecha) return 'No informada';
  const [year, month, day] = fecha.split('-').map(Number);
  return formatoFechaMantencion.format(new Date(year, month - 1, day));
}

function claseBadge(estado) {
  if (estado === 'Completa' || estado === 'Activo') return 'status-done';
  if (estado === 'No se realizó' || estado === 'Descontinuado') return 'status-overdue';
  if (estado === 'Otro') return 'status-unknown';
  return 'status-pending';
}

function categoriaLabel(collection) {
  return categoriasMantencion.find(categoria => categoria.collection === collection)?.label || collection;
}

function valorBusqueda(registro) {
  return Object.entries(registro)
    .filter(([campo]) => !['id', 'coleccion'].includes(campo))
    .map(([campo, valor]) => campo === 'tipo' && registro.tipoMantencion ? [campo, registro.tipoMantencion] : [campo, valor])
    .map(([, valor]) => valor instanceof Date || (valor && typeof valor.toDate === 'function') ? fechaVisible(valor) : valor)
    .filter(valor => valor !== null && valor !== undefined && typeof valor !== 'object')
    .join(' ')
    .toLocaleLowerCase('es-CL');
}

function filtrarRegistros() {
  const consulta = document.getElementById('maintenanceSearch').value.trim().toLocaleLowerCase('es-CL');
  const estado = document.getElementById('statusFilter').value;
  return ommData.filter(registro => {
    if (registro.coleccion !== categoriaActiva) return false;
    if (estado !== 'Todos' && registro.estado !== estado) return false;
    return !consulta || valorBusqueda(registro).includes(consulta);
  });
}

function actualizarContadores() {
  categoriasMantencion.forEach(({ collection }) => {
    const cantidad = ommData.filter(registro => registro.coleccion === collection).length;
    const elemento = document.querySelector(`[data-count="${collection}"]`);
    if (elemento) {
      const cargadas = window.ommDataCollectionsLoaded || [];
      elemento.textContent = cargadas.includes(collection) ? String(cantidad) : '…';
    }
  });
}

function renderizarTarjetas() {
  const registros = filtrarRegistros();
  const cuadrilla = document.getElementById('maintenanceCards');
  document.getElementById('resultCount').textContent = `${registros.length} registros`;
  document.getElementById('emptyTable').hidden = registros.length > 0;
  cuadrilla.innerHTML = registros.map(registro => {
    const titulo = registro.titulo || `Mantención · ${categoriaLabel(registro.coleccion)}`;
    const ubicacion = registro.ubicacion || registro.lugar || 'Ubicación no informada';
    const fechaValor = [
      registro.fechaLimite, registro.fecha, registro.inventariadofecha,
      registro.fechaultimamantencion, registro.fechamantencion,
      registro.controltvmantencionfecha, registro.controldecofechaman
    ].find(valor => valor && String(valor).toLocaleLowerCase('es-CL') !== 'na');
    const fecha = fechaVisible(fechaValor);
    const estado = registro.estado || 'Sin estado';
    const responsable = registro.responsable ? `<span class="maintenance-card-assignee">Responsable: ${escaparHTML(registro.responsable)}</span>` : '';
    const nemotecnico = registro.nemotecnico ? `<span class="maintenance-card-code">${escaparHTML(registro.nemotecnico)}</span>` : '';
    return `<article class="maintenance-card" data-id="${escaparHTML(registro.id)}" data-collection="${escaparHTML(registro.coleccion)}">
      <button class="maintenance-card-open" type="button" data-action="detail" aria-haspopup="dialog" aria-label="Ver detalle: ${escaparHTML(titulo)}">
        <span class="maintenance-card-top"><span class="status-badge ${claseBadge(estado)}">${escaparHTML(estado)}</span><span class="maintenance-location" title="${escaparHTML(ubicacion)}">${escaparHTML(ubicacion)}</span></span>
        <span class="maintenance-card-title">${escaparHTML(titulo)}</span>
        <span class="maintenance-card-category">${escaparHTML(categoriaLabel(registro.coleccion))}</span>
        ${nemotecnico}
        ${responsable}
        <span class="maintenance-card-metrics"><span class="maintenance-card-date"><small>Fecha</small><strong>${escaparHTML(fecha)}</strong></span></span>
      </button>
      <div class="maintenance-card-actions" aria-label="Acciones de mantención">
        <button class="card-action-button" type="button" data-action="edit">Editar</button>
        <button class="card-action-button card-action-delete" type="button" data-action="delete">Eliminar</button>
      </div>
    </article>`;
  }).join('');
}

function sincronizarRegistros() {
  actualizarContadores();
  renderizarTarjetas();
}

function obtenerRegistro(id, collection) {
  return ommData.find(registro => registro.id === id && registro.coleccion === collection);
}

function valorDetalle(valor) {
  if (valor === null || valor === undefined || valor === '') return 'No informado';
  if (typeof valor.toDate === 'function') return fechaVisible(valor);
  if (valor instanceof Date) return fechaVisible(valor);
  if (typeof valor === 'object') return JSON.stringify(valor);
  return String(valor);
}

function abrirDetalle(registro) {
  registroActivo = registro;
  const titulo = registro.titulo || `Mantención · ${categoriaLabel(registro.coleccion)}`;
  document.getElementById('dialogTitle').textContent = titulo;
  document.getElementById('dialogCode').textContent = `Colección: ${registro.coleccion} · ID: ${registro.id}`;
  const camposCategoria = {
    bodega: ['nombrecompleto', 'nemotecnico', 'ubicacion', 'inventariadofecha', 'responsable'],
    puertas: ['nombrecompleto', 'ubicacion', 'fechaultimamantencion', 'responsable'],
    jardineria: ['nombre', 'sector', 'periodoinvoto', 'periodoverpri', 'prioridad'],
    maquina: ['nombre', 'ubicacion', 'proveedor', 'fechamantencion', 'responsable', 'detalletrabajo', 'estado'],
    radiador: ['ubicacion', 'nombre', 'descripcion', 'proveedor', 'fecha', 'responsable', 'detalletrabajo'],
    refrigerador: ['nombre', 'ubicacion', 'proveedor', 'fecha', 'responsable', 'detalle'],
    televisionespilas: [
      'lugar', 'numero', 'tvmarca', 'tamaño', 'controltvoriginal',
      'controltvmantencionfecha', 'controldecofunciona', 'controldecofechaman'
    ]
  };
  const camposInternos = [
    'id', 'coleccion', 'titulo', 'categoria', 'codigoOMM', 'fechaLimite', 'fechaUltimaRevision',
    'fechaRealizacion', 'tipoMantencion', 'prioridad', 'presupuesto', 'presupuestoEjecutado',
    'responsable', 'descripcion', 'proveedor', 'origen', 'archivosAdjuntos', 'frecuencia',
    'preventivo', 'tipo'
  ];
  const camposVisibles = camposCategoria[registro.coleccion]
    ? camposCategoria[registro.coleccion]
      .filter(campo => registro[campo] !== undefined && registro[campo] !== null && registro[campo] !== '')
      .map(campo => [campo, valorDetalle(registro[campo])])
    : Object.entries(registro)
      .filter(([campo]) => !camposInternos.includes(campo))
      .map(([campo, valor]) => [campo, valorDetalle(valor)]);
  if (registro.coleccion === 'baño' && registro.tipoMantencion) {
    camposVisibles.push(['tipo', valorDetalle(registro.tipoMantencion)]);
  }
  document.getElementById('detailFields').innerHTML = camposVisibles.map(([etiqueta, valor]) =>
    `<div class="detail-field"><dt>${escaparHTML(etiqueta)}</dt><dd>${escaparHTML(valor)}</dd></div>`
  ).join('');
  renderizarNotas();
  document.getElementById('ommDialog').showModal();
}

function claveNota(registro) {
  return `${registro.coleccion}:${registro.id}`;
}

function renderizarNotas() {
  const notas = notasPorRegistro[claveNota(registroActivo)] || [];
  document.getElementById('noteList').innerHTML = notas.length
    ? notas.map(nota => `<li><time>${escaparHTML(nota.fecha)}</time>${escaparHTML(nota.texto)}</li>`).join('')
    : '<li class="empty-note">Todavía no hay observaciones en la bitácora.</li>';
}

function campoTexto(nombre, etiqueta, requerido = false, tipo = 'text') {
  const estrella = requerido ? ' <span aria-hidden="true">*</span>' : '';
  return `<label class="maintenance-form-field" for="field-${nombre}">${etiqueta}${estrella}
    <input id="field-${nombre}" name="${nombre}" type="${tipo}"${requerido ? ' required' : ''}>
  </label>`;
}

function campoSelector(nombre, etiqueta, opciones, requerido = false) {
  const estrella = requerido ? ' <span aria-hidden="true">*</span>' : '';
  return `<label class="maintenance-form-field" for="field-${nombre}">${etiqueta}${estrella}
    <select id="field-${nombre}" name="${nombre}"${requerido ? ' required' : ''}>
      <option value="">Selecciona ${etiqueta.toLocaleLowerCase('es-CL')}</option>
      ${opciones.map(opcion => `<option value="${escaparHTML(opcion)}">${escaparHTML(opcion)}</option>`).join('')}
    </select>
  </label>`;
}

function campoFechaONa(nombre, etiqueta) {
  return `<label class="maintenance-form-field" for="field-${nombre}">${etiqueta}
    <input id="field-${nombre}" name="${nombre}" type="text" inputmode="text" placeholder="AAAA-MM-DD o na">
  </label>`;
}

function campoNumero(collection) {
  return `<label class="maintenance-form-field" for="field-numero">Número <span aria-hidden="true">*</span>
    <select id="field-numero" name="numero" required disabled>
      <option value="">Selecciona primero el lugar</option>
    </select>
  </label>`;
}

function campoOpcionesDinamicas(nombre, etiqueta, requerido = false) {
  const estrella = requerido ? ' <span aria-hidden="true">*</span>' : '';
  return `<label class="maintenance-form-field" for="field-${nombre}">${etiqueta}${estrella}
    <select id="field-${nombre}" name="${nombre}"${requerido ? ' required' : ''} disabled>
      <option value="">Selecciona primero la ubicación</option>
    </select>
  </label>`;
}

function actualizarOpcionesNumero(collection, lugar, valorActual = '') {
  const selector = document.getElementById('field-numero');
  if (!selector) return;
  const opcionesPorLugar = collection === 'baño' ? opcionesNumeroBano : opcionesNumeroTelevisiones;
  const opciones = opcionesPorLugar[lugar] || [];
  selector.innerHTML = `<option value="">${opciones.length ? 'Selecciona un número' : 'Selecciona primero el lugar'}</option>` +
    opciones.map(opcion => `<option value="${escaparHTML(opcion.value)}">${escaparHTML(opcion.label)}</option>`).join('');
  selector.disabled = opciones.length === 0;
  if (opciones.some(opcion => opcion.value === valorActual)) selector.value = valorActual;
}

function actualizarOpcionesNombreRadiador(ubicacion, valorActual = '') {
  const selector = document.getElementById('field-nombre');
  if (!selector) return;
  const opciones = nombresRadiadorPorUbicacion[ubicacion] || [];
  selector.innerHTML = `<option value="">${opciones.length ? 'Selecciona un nombre' : 'Selecciona primero la ubicación'}</option>` +
    opciones.map(opcion => `<option value="${escaparHTML(opcion.value)}">${escaparHTML(opcion.label)}</option>`).join('');
  selector.disabled = opciones.length === 0;
  if (opciones.some(opcion => opcion.value === valorActual)) selector.value = valorActual;
}

function renderizarCamposCategoria(collection, valores = {}) {
  const contenedor = document.getElementById('categoryFields');
  if (!collection) {
    contenedor.innerHTML = '<p class="category-fields-hint">Selecciona una categoría para mostrar sus campos.</p>';
    return;
  }
  if (collection === 'alcantarillado') {
    contenedor.innerHTML = `<div class="maintenance-form-grid">
      ${campoTexto('nombrecompleto', 'Nombre completo', true)}
      ${campoSelector('ubicacion', 'Ubicación', ubicacionesAlcantarillado, true)}
      ${campoTexto('fecha', 'Fecha', true, 'date')}
      <label class="maintenance-form-field" for="field-estado">Estado <span aria-hidden="true">*</span>
        <select id="field-estado" name="estado" required>
          <option value="">Selecciona un estado</option>
          ${estadosAlcantarillado.map(estado => `<option value="${estado}">${estado}</option>`).join('')}
        </select>
      </label>
      <label class="maintenance-form-field field-wide" for="field-detalle">Detalle
        <textarea id="field-detalle" name="detalle" rows="3"></textarea>
      </label>
    </div>`;
  } else if (collection === 'baño') {
    contenedor.innerHTML = `<div class="maintenance-form-grid">
      <label class="maintenance-form-field" for="field-lugar">Lugar <span aria-hidden="true">*</span>
        <select id="field-lugar" name="lugar" required>
          <option value="">Selecciona lugar</option>
          ${lugaresBano.map(lugar => `<option value="${lugar}">${lugar}</option>`).join('')}
        </select>
      </label>
      ${campoNumero(collection)}
      ${campoSelector('tipo', 'Tipo', tiposBano, true)}
      ${campoTexto('fecha', 'Fecha', true, 'date')}
    </div>`;
  } else if (collection === 'bodega') {
    contenedor.innerHTML = `<div class="maintenance-form-grid">
      ${campoTexto('nombrecompleto', 'Nombre completo', true)}
      ${campoTexto('nemotecnico', 'Nemotécnico', true)}
      ${campoSelector('ubicacion', 'Ubicación', ubicacionesBodega, true)}
      ${campoTexto('inventariadofecha', 'Fecha de inventario', true, 'date')}
      ${campoTexto('responsable', 'Responsable', true)}
    </div>`;
  } else if (collection === 'puertas') {
    contenedor.innerHTML = `<div class="maintenance-form-grid">
      ${campoTexto('nombrecompleto', 'Nombre completo', true)}
      ${campoTexto('ubicacion', 'Ubicación', true)}
      ${campoTexto('fechaultimamantencion', 'Fecha de última mantención', true, 'date')}
      ${campoTexto('responsable', 'Responsable', true)}
    </div>`;
  } else if (collection === 'jardineria') {
    contenedor.innerHTML = `<div class="maintenance-form-grid">
      ${campoTexto('nombre', 'Nombre', true)}
      ${campoSelector('sector', 'Sector', sectoresJardineria, true)}
      ${campoSelector('periodoinvoto', 'Periodo invierno otoño', opcionesSiNo, true)}
      ${campoSelector('periodoverpri', 'Periodo verano primavera', opcionesSiNo, true)}
      ${campoSelector('prioridad', 'Prioridad', prioridadesJardineria, true)}
    </div>`;
  } else if (collection === 'maquina') {
    contenedor.innerHTML = `<div class="maintenance-form-grid">
      ${campoTexto('nombre', 'Nombre', true)}
      ${campoTexto('ubicacion', 'Ubicación', true)}
      ${campoTexto('proveedor', 'Proveedor', true)}
      ${campoTexto('fechamantencion', 'Fecha de mantención', true, 'date')}
      ${campoTexto('responsable', 'Responsable', true)}
      <label class="maintenance-form-field" for="field-estado">Estado <span aria-hidden="true">*</span>
        <select id="field-estado" name="estado" required>
          <option value="">Selecciona un estado</option>
          ${estadosMaquina.map(estado => `<option value="${escaparHTML(estado)}">${escaparHTML(estado)}</option>`).join('')}
        </select>
      </label>
      <label class="maintenance-form-field field-wide" for="field-detalletrabajo">Detalle trabajo
        <textarea id="field-detalletrabajo" name="detalletrabajo" rows="3"></textarea>
      </label>
    </div>`;
  } else if (collection === 'radiador') {
    contenedor.innerHTML = `<div class="maintenance-form-grid">
      ${campoSelector('ubicacion', 'Ubicación', ubicacionesRadiador, true)}
      ${campoOpcionesDinamicas('nombre', 'Nombre', true)}
      <label class="maintenance-form-field field-wide" for="field-descripcion">Descripción
        <textarea id="field-descripcion" name="descripcion" rows="3"></textarea>
      </label>
      ${campoSelector('proveedor', 'Proveedor', proveedoresRadiador, true)}
      ${campoTexto('fecha', 'Fecha', true, 'date')}
      ${campoTexto('responsable', 'Responsable', true)}
      <label class="maintenance-form-field field-wide" for="field-detalletrabajo">Detalle trabajo
        <textarea id="field-detalletrabajo" name="detalletrabajo" rows="3"></textarea>
      </label>
    </div>`;
  } else if (collection === 'refrigerador') {
    contenedor.innerHTML = `<div class="maintenance-form-grid">
      ${campoTexto('nombre', 'Nombre', true)}
      ${campoSelector('ubicacion', 'Ubicación', ubicacionesRefrigerador, true)}
      <label class="maintenance-form-field" for="field-proveedor">Proveedor <span aria-hidden="true">*</span>
        <input id="field-proveedor" name="proveedor" type="text" list="refrigeratorSuppliers" required>
        <datalist id="refrigeratorSuppliers"><option value="MIMET"><option value="otro"></datalist>
      </label>
      ${campoTexto('fecha', 'Fecha', true, 'date')}
      ${campoTexto('responsable', 'Responsable', true)}
      <label class="maintenance-form-field field-wide" for="field-detalle">Detalle
        <textarea id="field-detalle" name="detalle" rows="3"></textarea>
      </label>
    </div>`;
  } else if (collection === 'televisionespilas') {
    contenedor.innerHTML = `<div class="maintenance-form-grid">
      <label class="maintenance-form-field" for="field-lugar">Lugar <span aria-hidden="true">*</span>
        <select id="field-lugar" name="lugar" required>
          <option value="">Selecciona lugar</option>
          ${lugaresTelevisiones.map(lugar => `<option value="${lugar}">${lugar}</option>`).join('')}
        </select>
      </label>
      ${campoNumero(collection)}
      <label class="maintenance-form-field" for="field-tvmarca">Marca TV <span aria-hidden="true">*</span>
        <input id="field-tvmarca" name="tvmarca" type="text" list="tvBrands" required>
        <datalist id="tvBrands"><option value="Samsung"><option value="AOC"><option value="otros"></datalist>
      </label>
      ${campoTexto('tamaño', 'Tamaño', true, 'number')}
      ${campoSelector('controltvoriginal', 'Control TV original', ['si', 'no'], true)}
      ${campoFechaONa('controltvmantencionfecha', 'Fecha mantención control TV')}
      ${campoSelector('controldecofunciona', 'Control deco funciona', ['si', 'no'], true)}
      ${campoFechaONa('controldecofechaman', 'Fecha mantención control deco')}
    </div>`;
  } else {
    contenedor.innerHTML = `<p class="category-fields-hint">Los campos específicos de ${escaparHTML(categoriaLabel(collection))} se definirán más adelante.</p>`;
  }

  Object.entries(valores).forEach(([nombre, valor]) => {
    const campo = contenedor.querySelector(`[name="${nombre}"]`);
    if (campo) {
      const fechaONa = ['controltvmantencionfecha', 'controldecofechaman'].includes(nombre);
      campo.value = fechaONa && (String(valor).toLocaleLowerCase('es-CL') === 'na')
        ? 'na'
        : nombre.toLocaleLowerCase('es-CL').includes('fecha') ? fechaInput(valor) : String(valor ?? '');
    }
  });
  const selectorLugar = contenedor.querySelector('#field-lugar');
  if (selectorLugar && (collection === 'baño' || collection === 'televisionespilas')) {
    actualizarOpcionesNumero(collection, valores.lugar || '');
    const selectorNumero = contenedor.querySelector('#field-numero');
    if (selectorNumero && valores.numero) selectorNumero.value = String(valores.numero);
  }
  if (collection === 'radiador') {
    actualizarOpcionesNombreRadiador(valores.ubicacion || '', valores.nombre || '');
  }
}

function seleccionarCategoria(collection) {
  categoriaActiva = collection;
  if (typeof window.cargarColeccionMantencion === 'function') {
    window.cargarColeccionMantencion(collection);
  }
  document.querySelectorAll('.maintenance-tab').forEach(tab => {
    const activa = tab.dataset.category === collection;
    tab.classList.toggle('active', activa);
    tab.setAttribute('aria-selected', String(activa));
  });
  document.getElementById('maintenanceSearch').value = '';
  document.getElementById('statusFilter').value = 'Todos';
  renderizarTarjetas();
}

function abrirFormularioMantencion() {
  registroEnEdicion = null;
  document.getElementById('newMaintenanceForm').reset();
  document.getElementById('newMaintenanceCategory').disabled = false;
  document.getElementById('newMaintenanceTitle').textContent = 'Nueva Mantención';
  document.getElementById('saveNewMaintenance').textContent = 'Guardar mantención';
  renderizarCamposCategoria('');
  document.getElementById('newMaintenanceDialog').showModal();
  document.getElementById('newMaintenanceCategory').focus();
}

function editarFicha(registro) {
  registroEnEdicion = registro;
  const formulario = document.getElementById('newMaintenanceForm');
  formulario.reset();
  const selector = document.getElementById('newMaintenanceCategory');
  selector.value = registro.coleccion;
  selector.disabled = true;
  const esquema = esquemaCampos[registro.coleccion];
  const valores = Object.fromEntries((esquema?.campos || []).map(campo => [
    campo,
    campo === 'tipo' && registro.coleccion === 'baño' ? registro.tipoMantencion : registro[campo]
  ]));
  renderizarCamposCategoria(registro.coleccion, valores);
  document.getElementById('newMaintenanceTitle').textContent = 'Editar Mantención';
  document.getElementById('saveNewMaintenance').textContent = 'Guardar cambios';
  document.getElementById('ommDialog').close();
  document.getElementById('newMaintenanceDialog').showModal();
}

function validarFechaISO(valor) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const [year, month, day] = valor.split('-').map(Number);
  const fecha = new Date(year, month - 1, day, 12);
  return fecha.getFullYear() === year && fecha.getMonth() === month - 1 && fecha.getDate() === day;
}

function validarFormulario(formulario, collection) {
  const esquema = esquemaCampos[collection];
  if (!esquema) {
    window.alert('Selecciona una categoría con campos definidos antes de guardar.');
    return false;
  }
  const datos = new FormData(formulario);
  const faltantes = esquema.requeridos.filter(nombre => !String(datos.get(nombre) || '').trim());
  if (collection === 'baño' || collection === 'televisionespilas') {
    const opcionesNumero = collection === 'baño' ? opcionesNumeroBano : opcionesNumeroTelevisiones;
    const numerosValidos = opcionesNumero[String(datos.get('lugar') || '')] || [];
    if (datos.get('numero') && !numerosValidos.some(opcion => opcion.value === String(datos.get('numero')))) {
      faltantes.push('numero válido para el lugar');
    }
  }
  if (collection === 'radiador') {
    const nombresValidos = nombresRadiadorPorUbicacion[String(datos.get('ubicacion') || '')] || [];
    if (datos.get('nombre') && !nombresValidos.some(opcion => opcion.value === String(datos.get('nombre')))) {
      faltantes.push('nombre válido para la ubicación');
    }
  }
  if (faltantes.length) {
    window.alert(`Completa los campos obligatorios: ${faltantes.join(', ')}.`);
    return false;
  }
  const camposInvalidos = [];
  (esquema.numericos || []).forEach(nombre => {
    const valor = String(datos.get(nombre) || '').trim();
    if (valor && !Number.isFinite(Number(valor))) camposInvalidos.push(nombre);
  });
  (esquema.fechas || []).forEach(nombre => {
    if (!validarFechaISO(String(datos.get(nombre) || ''))) camposInvalidos.push(nombre);
  });
  (esquema.fechasONa || []).forEach(nombre => {
    const valor = String(datos.get(nombre) || '').trim();
    if (valor && valor.toLocaleLowerCase('es-CL') !== 'na' && !validarFechaISO(valor)) camposInvalidos.push(nombre);
  });
  Object.entries(esquema.opciones || {}).forEach(([nombre, opciones]) => {
    const valor = String(datos.get(nombre) || '');
    if (valor && !opciones.includes(valor)) camposInvalidos.push(nombre);
  });
  if (camposInvalidos.length) {
    window.alert(`Revisa los valores de estos campos: ${camposInvalidos.join(', ')}.`);
    return false;
  }
  return true;
}

function convertirCampo(valor, nombre, esquema) {
  if ((esquema.fechas || []).includes(nombre)) return new Date(`${valor}T12:00:00`);
  if ((esquema.fechasONa || []).includes(nombre)) {
    if (String(valor).toLocaleLowerCase('es-CL') === 'na') return 'na';
    return new Date(`${valor}T12:00:00`);
  }
  if ((esquema.numericos || []).includes(nombre)) return Number(valor);
  return valor;
}

function obtenerDocumento(formulario, collection) {
  const datos = new FormData(formulario);
  const documento = {};
  const esquema = esquemaCampos[collection];
  (esquema?.campos || []).forEach(nombre => {
    const valor = String(datos.get(nombre) || '').trim();
    if (!valor) return;
    documento[nombre] = convertirCampo(valor, nombre, esquema);
  });
  return documento;
}

async function guardarNuevaMantencion(evento) {
  evento.preventDefault();
  const formulario = evento.currentTarget;
  const collection = document.getElementById('newMaintenanceCategory').value;
  if (!validarFormulario(formulario, collection) || !formulario.reportValidity()) return;
  const documento = obtenerDocumento(formulario, collection);
  const botonGuardar = document.getElementById('saveNewMaintenance');
  botonGuardar.disabled = true;
  botonGuardar.textContent = 'Guardando…';
  try {
    if (!window.db || !window.firebaseApi) throw new Error('Firestore no está disponible.');
    const referenciaColeccion = window.firebaseApi.collection(window.db, collection);
    if (registroEnEdicion) {
      await window.firebaseApi.setDoc(
        window.firebaseApi.doc(window.db, registroEnEdicion.coleccion, registroEnEdicion.id),
        documento
      );
    } else {
      await window.firebaseApi.setDoc(window.firebaseApi.doc(referenciaColeccion), documento);
    }
    formulario.reset();
    document.getElementById('newMaintenanceCategory').disabled = false;
    document.getElementById('newMaintenanceDialog').close();
    registroEnEdicion = null;
    seleccionarCategoria(collection);
  } catch (error) {
    console.error('No se pudo guardar la mantención en Firestore.', error);
    window.alert('No se pudo guardar la mantención. Revisa tu conexión y los permisos de Firestore.');
  } finally {
    botonGuardar.disabled = false;
    botonGuardar.textContent = registroEnEdicion ? 'Guardar cambios' : 'Guardar mantención';
  }
}

async function eliminarMantencion(registro, boton) {
  const titulo = registro.titulo || categoriaLabel(registro.coleccion);
  if (!window.confirm(`¿Eliminar la mantención "${titulo}"? Esta acción no se puede deshacer.`)) return;
  boton.disabled = true;
  try {
    await window.firebaseApi.deleteDoc(
      window.firebaseApi.doc(window.db, registro.coleccion, registro.id)
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

document.querySelectorAll('.maintenance-tab').forEach(boton => {
  boton.addEventListener('click', () => seleccionarCategoria(boton.dataset.category));
});
document.getElementById('maintenanceSearch').addEventListener('input', renderizarTarjetas);
document.getElementById('statusFilter').addEventListener('change', renderizarTarjetas);
document.getElementById('exportReport').addEventListener('click', exportarReporte);
document.getElementById('newMaintenanceButton').addEventListener('click', abrirFormularioMantencion);
document.getElementById('newMaintenanceCategory').addEventListener('change', evento => {
  renderizarCamposCategoria(evento.currentTarget.value);
});
document.getElementById('categoryFields').addEventListener('change', evento => {
  const collection = document.getElementById('newMaintenanceCategory').value;
  if (evento.target.id === 'field-lugar') {
    actualizarOpcionesNumero(collection, evento.target.value);
  } else if (collection === 'radiador' && evento.target.id === 'field-ubicacion') {
    actualizarOpcionesNombreRadiador(evento.target.value);
  }
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
  const registro = tarjeta && obtenerRegistro(tarjeta.dataset.id, tarjeta.dataset.collection);
  if (!registro || !boton) return;
  if (boton.dataset.action === 'detail') abrirDetalle(registro);
  if (boton.dataset.action === 'edit') editarFicha(registro);
  if (boton.dataset.action === 'delete') void eliminarMantencion(registro, boton);
});
document.getElementById('editRecord').addEventListener('click', () => {
  if (registroActivo) editarFicha(registroActivo);
});
document.getElementById('closeDialog').addEventListener('click', () => document.getElementById('ommDialog').close());
document.getElementById('doneDialog').addEventListener('click', () => document.getElementById('ommDialog').close());
document.getElementById('noteForm').addEventListener('submit', evento => {
  evento.preventDefault();
  const campo = document.getElementById('noteInput');
  const texto = campo.value.trim();
  if (!texto || !registroActivo) return;
  const clave = claveNota(registroActivo);
  const lista = notasPorRegistro[clave] || [];
  lista.unshift({ texto, fecha: formatoFechaMantencion.format(new Date()) });
  notasPorRegistro[clave] = lista;
  guardarAlmacenamiento(almacenamientoNotas, notasPorRegistro);
  campo.value = '';
  renderizarNotas();
});
document.getElementById('ommDialog').addEventListener('click', evento => {
  if (evento.target === evento.currentTarget) evento.currentTarget.close();
});

window.addEventListener('omm-data-updated', sincronizarRegistros);
window.addEventListener('omm-data-error', () => {
  document.getElementById('firestoreError').hidden = false;
});
sincronizarRegistros();

// ===== TEMA =====
function aplicarTema(tema){
  const temaOscuro = tema === 'dark';
  document.documentElement.dataset.theme = temaOscuro ? 'dark' : 'light';
  document.documentElement.classList.toggle('dark-theme', temaOscuro);
}

aplicarTema(localStorage.getItem('temaHotelAlmendro') || 'light');

function inicializarTema(){
  const target = document.querySelector('.site-header') || document.querySelector('.auth-layout');
  if(!target) return;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'theme-toggle';
  button.setAttribute('aria-label', 'Cambiar tema de color');
  button.setAttribute('aria-pressed', document.documentElement.dataset.theme === 'dark' ? 'true' : 'false');

  function actualizarTexto(){
    button.textContent = document.documentElement.dataset.theme === 'dark' ? 'Modo blanco' : 'Modo oscuro';
  }

  button.addEventListener('click', () => {
    const tema = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    aplicarTema(tema);
    localStorage.setItem('temaHotelAlmendro', tema);
    button.setAttribute('aria-pressed', tema === 'dark' ? 'true' : 'false');
    actualizarTexto();
  });
  actualizarTexto();
  target.appendChild(button);
}

// ===== DATOS GLOBALES =====
const productosCatalogo = [
  {id:1, nombre:'Agua Embotellada 500ml', categoria:'bebidas', unidad:'botella', stock:50, minimo:20, precio:800},
  {id:2, nombre:'Jugo Natural Naranja', categoria:'bebidas', unidad:'litro', stock:15, minimo:10, precio:3500},
  {id:3, nombre:'Café Tostado', categoria:'bebidas', unidad:'kg', stock:8, minimo:5, precio:12000},
  {id:4, nombre:'Pan Tostado', categoria:'pan', unidad:'paquete', stock:12, minimo:8, precio:2500},
  {id:5, nombre:'Pan Blanco Molde', categoria:'pan', unidad:'unidad', stock:5, minimo:3, precio:1800},
  {id:6, nombre:'Queso Fresco', categoria:'lacteos', unidad:'kg', stock:3, minimo:2, precio:8500},
  {id:7, nombre:'Leche Entera', categoria:'lacteos', unidad:'litro', stock:25, minimo:15, precio:1200},
  {id:8, nombre:'Yogur Natural', categoria:'lacteos', unidad:'pote', stock:18, minimo:10, precio:800},
  {id:9, nombre:'Snack Papas', categoria:'snacks', unidad:'paquete', stock:40, minimo:15, precio:2000},
  {id:10, nombre:'Almendras Saladas', categoria:'snacks', unidad:'kg', stock:6, minimo:3, precio:18000}
];

let movimientos = [];
let recepciones = [];

// ===== FUNCIONES UTILITARIAS =====
function getStockStatus(stock, minimo){
  if(stock <= minimo) return {clase:'alert-danger', texto:'Peligro'};
  if(stock <= minimo + 5) return {clase:'alert-watch', texto:'Vigilancia'};
  return {clase:'status-normal', texto:'Normal'};
}

function guardarEnLocalStorage(key, data){
  localStorage.setItem(key, JSON.stringify(data));
}

function cargarDelLocalStorage(key, defecto=null){
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defecto;
}

function obtenerSesion(){
  return cargarDelLocalStorage('sesionUsuario', null);
}

function actualizarRolVisible(){
  const header = document.querySelector('.site-header');
  const sesion = obtenerSesion();
  if(!header || !sesion) return;

  let roleBadge = document.getElementById('userRole');
  if(!roleBadge){
    roleBadge = document.createElement('span');
    roleBadge.id = 'userRole';
    roleBadge.className = 'user-role';
    header.appendChild(roleBadge);
  }
  roleBadge.textContent = `${sesion.nombre} · ${sesion.rol}`;
}

// ===== MENU LATERAL =====
function inicializarMenu(){
  const menuBtn = document.getElementById('menuBtn');
  const sideMenu = document.getElementById('sideMenu');
  const closeMenu = document.getElementById('closeMenu');
  const overlay = document.getElementById('overlay');
  
  function openMenu(){ 
    if(sideMenu){ 
      sideMenu.classList.add('open'); 
      sideMenu.setAttribute('aria-hidden','false'); 
      overlay.classList.add('show'); 
    } 
  }
  
  function closeMenuFn(){ 
    if(sideMenu){ 
      sideMenu.classList.remove('open'); 
      sideMenu.setAttribute('aria-hidden','true'); 
      overlay.classList.remove('show'); 
    } 
  }
  
  if(menuBtn){ menuBtn.addEventListener('click', openMenu); }
  if(closeMenu){ closeMenu.addEventListener('click', closeMenuFn); }
  if(overlay){ overlay.addEventListener('click', closeMenuFn); }
  
  document.addEventListener('click', e=>{
    if(e.target.closest('.side-nav a')){
      if(e.target.closest('a[href*="login.html"]')) localStorage.removeItem('sesionUsuario');
      closeMenuFn();
    }
  });
}

// ===== PÁGINA: INVENTARIO =====
function inicializarInventario(){
  const inventoryBody = document.getElementById('inventoryBody');
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const stockFilter = document.getElementById('stockFilter');
  
  if(!inventoryBody) return;
  
  function renderTablero(){
    let filtered = productosCatalogo;
    
    if(searchInput.value){
      const term = searchInput.value.toLowerCase();
      filtered = filtered.filter(p => p.nombre.toLowerCase().includes(term) || p.id.toString().includes(term));
    }
    
    if(categoryFilter.value){
      filtered = filtered.filter(p => p.categoria === categoryFilter.value);
    }
    
    if(stockFilter.value){
      filtered = filtered.filter(p => {
        const status = getStockStatus(p.stock, p.minimo);
        if(stockFilter.value === 'critico') return status.clase === 'alert-danger';
        if(stockFilter.value === 'bajo') return status.clase === 'alert-watch';
        if(stockFilter.value === 'normal') return status.clase === 'status-normal';
        return true;
      });
    }
    
    inventoryBody.innerHTML = filtered.map(p => {
      const status = getStockStatus(p.stock, p.minimo);
      return `
        <tr>
          <td>#${p.id}</td>
          <td>${p.nombre}</td>
          <td>${p.categoria}</td>
          <td>${p.unidad}</td>
          <td>${p.stock}</td>
          <td>${p.minimo}</td>
          <td>$${p.precio.toLocaleString()}</td>
          <td><span class="status-badge ${status.clase}">${status.texto}</span></td>
        </tr>
      `;
    }).join('');
    
    // Actualizar estadísticas
    const totalStats = {total:0, peligro:0, vigilancia:0, normal:0};
    productosCatalogo.forEach(p => {
      totalStats.total++;
      const status = getStockStatus(p.stock, p.minimo);
      if(status.texto === 'Peligro') totalStats.peligro++;
      else if(status.texto === 'Vigilancia') totalStats.vigilancia++;
      else totalStats.normal++;
    });
    
    const totalEl = document.getElementById('totalProducts');
    const criticalEl = document.getElementById('criticalCount');
    const lowEl = document.getElementById('lowCount');
    const normalEl = document.getElementById('normalCount');
    
    if(totalEl) totalEl.textContent = totalStats.total;
    if(criticalEl) criticalEl.textContent = totalStats.peligro;
    if(lowEl) lowEl.textContent = totalStats.vigilancia;
    if(normalEl) normalEl.textContent = totalStats.normal;
  }
  
  renderTablero();
  if(searchInput) searchInput.addEventListener('input', renderTablero);
  if(categoryFilter) categoryFilter.addEventListener('change', renderTablero);
  if(stockFilter) stockFilter.addEventListener('change', renderTablero);
}

// ===== PÁGINA: RECEPCIÓN =====
function inicializarRecepcion(){
  const form = document.getElementById('recepcionForm');
  if(!form) return;
  
  const productSelect = document.getElementById('producto');
  const fraccionSelect = document.getElementById('fraccionado');
  const fraccionDiv = document.getElementById('fraccionDiv');
  
  // Llenar select de productos
  productSelect.innerHTML = '<option value="">-- Seleccionar producto --</option>' + 
    productosCatalogo.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');
  
  // Mostrar/ocultar campo de fraccionamiento
  if(fraccionSelect){
    fraccionSelect.addEventListener('change', e => {
      if(fraccionDiv) fraccionDiv.style.display = e.target.value === 'si' ? 'block' : 'none';
    });
  }
  
  // Procesar formulario
  form.addEventListener('submit', e => {
    e.preventDefault();
    
    const productoId = parseInt(document.getElementById('producto').value);
    const cantidad = parseInt(document.getElementById('cantidad').value);
    const lote = document.getElementById('lote').value;
    const fechaVencimiento = document.getElementById('fechaVencimiento').value;
    const bodeguero = document.getElementById('bodeguero').value;
    const fraccionado = document.getElementById('fraccionado').value === 'si';
    const unidadesPorBolsa = parseInt(document.getElementById('unidadesPorBolsa').value) || cantidad;
    
    // Actualizar stock
    const producto = productosCatalogo.find(p => p.id === productoId);
    if(producto){
      producto.stock += cantidad;
    }
    
    // Registrar movimiento
    const movimiento = {
      fecha: new Date().toLocaleString(),
      tipo: 'entrada',
      productoId,
      cantidad,
      bodeguero,
      lote,
      fechaVencimiento,
      fraccionado,
      unidadesPorBolsa
    };
    
    recepciones.push(movimiento);
    movimientos.push(movimiento);
    
    guardarEnLocalStorage('productosCatalogo', productosCatalogo);
    guardarEnLocalStorage('movimientos', movimientos);
    guardarEnLocalStorage('recepciones', recepciones);
    
    alert('Entrada registrada correctamente');
    form.reset();
    
    // Actualizar lista de recepciones
    actualizarReceptionsList();
  });
  
  actualizarReceptionsList();
}

function actualizarReceptionsList(){
  const lista = document.getElementById('receptionsList');
  if(!lista) return;
  
  if(recepciones.length === 0){
    lista.innerHTML = '<p class="muted">No hay recepciones registradas aún.</p>';
    return;
  }
  
  lista.innerHTML = recepciones.slice(-5).reverse().map(r => {
    const prod = productosCatalogo.find(p => p.id === r.productoId);
    return `
      <div style="padding:10px;border-bottom:1px solid #e6e9ee;">
        <strong>${prod?.nombre || 'Producto'}</strong> - ${r.cantidad} ${prod?.unidad || ''}
        <br><small>${r.fecha} | Lote: ${r.lote} | Bodeguero: ${r.bodeguero}</small>
      </div>
    `;
  }).join('');
}

// ===== PÁGINA: MOVIMIENTOS =====
function inicializarMovimientos(){
  const movementsBody = document.getElementById('movementsBody');
  if(!movementsBody) return;
  
  const tipoFilter = document.getElementById('tipoMovimiento');
  const fechaFilter = document.getElementById('fechaMovimiento');
  const areaFilter = document.getElementById('areaDestino');
  
  function renderMovimientos(){
    let filtered = movimientos;
    
    if(tipoFilter?.value){
      filtered = filtered.filter(m => m.tipo === tipoFilter.value);
    }
    
    if(movementsBody.innerHTML === '<tr><td colspan="8" class="muted">No hay movimientos registrados aún.</td></tr>' && movimientos.length > 0){
      // Primera vez que hay datos
    }
    
    if(filtered.length === 0){
      movementsBody.innerHTML = '<tr><td colspan="8" class="muted">No hay movimientos registrados.</td></tr>';
      return;
    }
    
    movementsBody.innerHTML = filtered.map(m => {
      const prod = productosCatalogo.find(p => p.id === m.productoId);
      return `
        <tr>
          <td>${m.fecha}</td>
          <td>${m.tipo === 'entrada' ? 'Entrada' : 'Salida'}</td>
          <td>${prod?.nombre || 'N/A'}</td>
          <td>${m.cantidad}</td>
          <td>${m.bodeguero || m.responsable || '-'}</td>
          <td>${m.area || '-'}</td>
          <td>${m.lote || '-'}</td>
          <td>${m.observaciones || '-'}</td>
        </tr>
      `;
    }).join('');
    
    // Actualizar estadísticas
    actualizarEstadisticasMovimientos(filtered);
  }
  
  function actualizarEstadisticasMovimientos(datos){
    const totalEntradas = datos.filter(m => m.tipo === 'entrada').reduce((sum, m) => sum + m.cantidad, 0);
    const totalSalidas = datos.filter(m => m.tipo === 'salida').reduce((sum, m) => sum + m.cantidad, 0);
    
    if(document.getElementById('totalEntradas')) document.getElementById('totalEntradas').textContent = totalEntradas;
    if(document.getElementById('totalSalidas')) document.getElementById('totalSalidas').textContent = totalSalidas;
  }
  
  renderMovimientos();
  if(tipoFilter) tipoFilter.addEventListener('change', renderMovimientos);
}

// ===== PÁGINA: CRUD DE INVENTARIO =====
function inicializarCrudInventario(){
  const form = document.getElementById('productForm');
  const productsBody = document.getElementById('crudProductsBody');
  if(!form || !productsBody) return;

  const editingId = document.getElementById('editingProductId');
  const cancelButton = document.getElementById('cancelEdit');
  const formTitle = document.getElementById('productFormTitle');
  const unitSelect = document.getElementById('productUnit');
  const stockLabel = document.getElementById('productStockLabel');

  function actualizarEtiquetaCantidad(){
    const unidad = unitSelect.value;
    stockLabel.textContent = unidad ? `Cantidad actual (${unidad})` : 'Cantidad actual';
  }

  function limpiarFormulario(){
    form.reset();
    editingId.value = '';
    formTitle.textContent = 'Agregar producto';
    cancelButton.hidden = true;
  }

  function renderProductos(){
    productsBody.innerHTML = productosCatalogo.map(producto => `
      <tr>
        <td>#${producto.id}</td>
        <td>${producto.nombre}</td>
        <td>${producto.categoria}</td>
        <td>${producto.unidad}</td>
        <td>${producto.stock}</td>
        <td>${producto.minimo}</td>
        <td>$${producto.precio.toLocaleString()}</td>
        <td class="table-actions">
          <button type="button" class="btn-small btn-edit" data-edit-id="${producto.id}">Editar</button>
          <button type="button" class="btn-small btn-delete" data-delete-id="${producto.id}">Eliminar</button>
        </td>
      </tr>
    `).join('');
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const productData = {
      nombre: document.getElementById('productName').value.trim(),
      categoria: document.getElementById('productCategory').value,
      unidad: document.getElementById('productUnit').value.trim(),
      stock: Number(document.getElementById('productStock').value),
      minimo: Number(document.getElementById('productMinimum').value),
      precio: Number(document.getElementById('productPrice').value)
    };

    if(editingId.value){
      const producto = productosCatalogo.find(item => item.id === Number(editingId.value));
      if(producto) Object.assign(producto, productData);
    } else {
      const nextId = productosCatalogo.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;
      productosCatalogo.push({id: nextId, ...productData});
    }

    guardarEnLocalStorage('productosCatalogo', productosCatalogo);
    renderProductos();
    limpiarFormulario();
  });

  productsBody.addEventListener('click', event => {
    const editId = event.target.dataset.editId;
    const deleteId = event.target.dataset.deleteId;
    if(editId){
      const producto = productosCatalogo.find(item => item.id === Number(editId));
      if(!producto) return;
      editingId.value = producto.id;
      document.getElementById('productName').value = producto.nombre;
      document.getElementById('productCategory').value = producto.categoria;
      document.getElementById('productUnit').value = producto.unidad;
      actualizarEtiquetaCantidad();
      document.getElementById('productStock').value = producto.stock;
      document.getElementById('productMinimum').value = producto.minimo;
      document.getElementById('productPrice').value = producto.precio;
      formTitle.textContent = 'Editar producto';
      cancelButton.hidden = false;
      form.scrollIntoView({behavior:'smooth', block:'start'});
    }
    if(deleteId && confirm('¿Eliminar este producto del inventario?')){
      const index = productosCatalogo.findIndex(item => item.id === Number(deleteId));
      if(index !== -1) productosCatalogo.splice(index, 1);
      guardarEnLocalStorage('productosCatalogo', productosCatalogo);
      renderProductos();
    }
  });

  cancelButton.addEventListener('click', limpiarFormulario);
  unitSelect.addEventListener('change', actualizarEtiquetaCantidad);
  renderProductos();
}

function inicializarAlertasInventario(){
  const alertsContainer = document.getElementById('stockAlerts');
  if(!alertsContainer) return;

  const alertas = productosCatalogo
    .map(producto => ({producto, alerta: getStockStatus(producto.stock, producto.minimo)}))
    .filter(item => item.alerta.texto !== 'Normal')
    .sort((a, b) => a.producto.stock - a.producto.minimo - (b.producto.stock - b.producto.minimo));

  alertsContainer.innerHTML = alertas.length ? alertas.map(({producto, alerta}) => `
    <div class="stock-alert ${alerta.clase}">
      <div><strong>${alerta.texto}</strong><span>${producto.nombre}</span></div>
      <span>${producto.stock} ${producto.unidad} / mínimo ${producto.minimo}</span>
    </div>
  `).join('') : '<p class="muted">No hay productos cerca del stock mínimo.</p>';
}

// ===== COUNTDOWN TIMERS =====
function inicializarContadores(){
  function formatSeconds(s){
    const h=Math.floor(s/3600).toString().padStart(2,'0');
    const m=Math.floor((s%3600)/60).toString().padStart(2,'0');
    const sec=(s%60).toString().padStart(2,'0');
    return `${h}:${m}:${sec}`;
  }
  
  const countdowns=document.querySelectorAll('.countdown');
  countdowns.forEach(el=>{
    let sec=parseInt(el.getAttribute('data-seconds')||'0',10);
    el.textContent=formatSeconds(sec);
    const iv=setInterval(()=>{
      if(sec<=0){ clearInterval(iv); el.textContent='00:00:00'; return; }
      sec--; el.textContent=formatSeconds(sec);
    },1000);
  });
}

// ===== TABS Y SUB-TABS =====
function inicializarTabs(){
  // Main tabs - navegar a diferentes páginas
  const tabBtns = document.querySelectorAll('.tab-btn');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      const tabName = btn.dataset.tab;
      const currentPage = window.location.pathname.split('/').pop() || 'mantencion.html';
      
      // Determinar a qué página navegar
      let targetPage = 'mantencion.html';
      if(tabName === 'mejoras') targetPage = 'mejoras.html';
      else if(tabName === 'remodelacion') targetPage = 'remodelacion.html';
      
      // Si ya estamos en esa página, no navegar
      if(!currentPage.includes(targetPage)){
        window.location.href = targetPage;
      }
    });
  });
  
  // Marcar el tab actual como activo
  const currentPage = window.location.pathname.split('/').pop() || 'mantencion.html';
  tabBtns.forEach(btn => {
    const tabName = btn.dataset.tab;
    let isCurrentPage = false;
    
    if(tabName === 'mantencion' && currentPage.includes('mantencion.html')) isCurrentPage = true;
    else if(tabName === 'mejoras' && currentPage.includes('mejoras.html')) isCurrentPage = true;
    else if(tabName === 'remodelacion' && currentPage.includes('remodelacion.html')) isCurrentPage = true;
    
    if(isCurrentPage){
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Sub-tabs - cambiar contenido dentro de la misma página
  const subTabBtns = document.querySelectorAll('.sub-tab');
  subTabBtns.forEach(btn => {
    btn.addEventListener('click', e => {
      const subtabName = btn.dataset.subtab;
      const parent = btn.closest('.sub-tabs');
      
      if(!parent) return;
      
      // Ocultar todos los sub-tabs de este grupo
      const container = btn.closest('.tab-content') || document.body;
      const subtabContents = container.querySelectorAll('.subtab-content');
      subtabContents.forEach(content => {
        content.style.display = 'none';
        content.classList.remove('active');
      });
      
      // Remover clase active de todos los botones del grupo
      const subBtnsInGroup = parent.querySelectorAll('.sub-tab');
      subBtnsInGroup.forEach(b => b.classList.remove('active'));
      
      // Mostrar sub-tab seleccionado
      const selectedSubtab = document.getElementById(subtabName);
      if(selectedSubtab){
        selectedSubtab.style.display = 'block';
        selectedSubtab.classList.add('active');
      }
      
      // Agregar clase active al botón
      btn.classList.add('active');
    });
  });
}

// ===== INICIALIZACIÓN PRINCIPAL =====
document.addEventListener('DOMContentLoaded', function(){
  inicializarTema();
  // Recuperar datos del localStorage
  const savedProducts = cargarDelLocalStorage('productosCatalogo');
  const savedMovimientos = cargarDelLocalStorage('movimientos', []);
  const savedRecepciones = cargarDelLocalStorage('recepciones', []);
  
  if(savedProducts) {
    productosCatalogo.length = 0;
    productosCatalogo.push(...savedProducts);
  }
  
  if(savedMovimientos) {
    movimientos = savedMovimientos;
  }
  if(savedRecepciones) {
    recepciones = savedRecepciones;
  }
  
  const loginBtn = document.getElementById('loginBtn');
  if(loginBtn) loginBtn.addEventListener('click', () => {
    const nameInput = document.getElementById('username');
    const roleInput = document.getElementById('userRoleSelect');
    const nombre = nameInput?.value.trim();
    if(!nombre || !roleInput?.value){
      alert('Ingresa tu nombre y selecciona un rol.');
      return;
    }
    guardarEnLocalStorage('sesionUsuario', {nombre, rol: roleInput.value});
    window.location.href = '../mantenimiento/mantencion.html';
  });
  
  actualizarRolVisible();
  inicializarMenu();
  inicializarInventario();
  inicializarCrudInventario();
  inicializarAlertasInventario();
  inicializarRecepcion();
  inicializarMovimientos();
  inicializarContadores();
  inicializarTabs();
});

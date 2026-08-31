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
  if(stock <= minimo * 0.5) return {clase:'status-critical', texto:'Crítico'};
  if(stock <= minimo) return {clase:'status-low', texto:'Bajo'};
  return {clase:'status-normal', texto:'Normal'};
}

function guardarEnLocalStorage(key, data){
  localStorage.setItem(key, JSON.stringify(data));
}

function cargarDelLocalStorage(key, defecto=null){
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defecto;
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
        if(stockFilter.value === 'critico') return status.clase === 'status-critical';
        if(stockFilter.value === 'bajo') return status.clase === 'status-low';
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
    const totalStats = {total:0, critico:0, bajo:0, normal:0};
    productosCatalogo.forEach(p => {
      totalStats.total++;
      const status = getStockStatus(p.stock, p.minimo);
      if(status.clase === 'status-critical') totalStats.critico++;
      else if(status.clase === 'status-low') totalStats.bajo++;
      else totalStats.normal++;
    });
    
    const totalEl = document.getElementById('totalProducts');
    const criticalEl = document.getElementById('criticalCount');
    const lowEl = document.getElementById('lowCount');
    const normalEl = document.getElementById('normalCount');
    
    if(totalEl) totalEl.textContent = totalStats.total;
    if(criticalEl) criticalEl.textContent = totalStats.critico;
    if(lowEl) lowEl.textContent = totalStats.bajo;
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

// ===== INICIALIZACIÓN PRINCIPAL =====
document.addEventListener('DOMContentLoaded', function(){
  // Recuperar datos del localStorage
  const savedProducts = cargarDelLocalStorage('productosCatalogo');
  const savedMovimientos = cargarDelLocalStorage('movimientos', []);
  
  if(savedProducts) {
    productosCatalogo.length = 0;
    productosCatalogo.push(...savedProducts);
  }
  
  if(savedMovimientos) {
    movimientos = savedMovimientos;
  }
  
  const loginBtn = document.getElementById('loginBtn');
  if(loginBtn) loginBtn.addEventListener('click', () => window.location.href = 'index.html');
  
  inicializarMenu();
  inicializarInventario();
  inicializarRecepcion();
  inicializarMovimientos();
  inicializarContadores();
});

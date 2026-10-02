const formatoFecha = new Intl.DateTimeFormat('es-CL', { dateStyle: 'long' });
const elementoFecha = document.getElementById('currentDate');

if (elementoFecha) {
  elementoFecha.textContent = formatoFecha.format(new Date());
}

const navegacion = document.querySelector('.main-nav');
if (navegacion) {
  const paginaActual = document.body.dataset.page;
  const enlaces = [...navegacion.querySelectorAll('.nav-tab')];
  enlaces.forEach(enlace => {
    if (enlace.dataset.page === paginaActual) {
      enlace.setAttribute('aria-current', 'page');
    } else {
      enlace.removeAttribute('aria-current');
    }
  });

  navegacion.addEventListener('keydown', evento => {
    if (!['ArrowLeft', 'ArrowRight'].includes(evento.key)) return;
    const actual = enlaces.indexOf(document.activeElement);
    if (actual < 0) return;
    evento.preventDefault();
    const direccion = evento.key === 'ArrowRight' ? 1 : -1;
    enlaces[(actual + direccion + enlaces.length) % enlaces.length].focus();
  });
}

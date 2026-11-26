// Configuración del sitio: cambia aquí el número de WhatsApp
(function () {
  var WHATSAPP = '593998386074';
  var MENSAJE = 'Hola, vengo de la página web y quiero información sobre mi tienda online.';
  var link = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(MENSAJE);
  document.querySelectorAll('[data-wa]').forEach(function (a) { a.href = link; });
  document.getElementById('anio') && (document.getElementById('anio').textContent = new Date().getFullYear());

  var top = document.querySelector('.top');
  function onScroll() { top && top.classList.toggle('scrolled', window.scrollY > 8); }
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  // Aparición suave al desplazarse (una sola vez). Sin JavaScript todo se ve igual.
  var items = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -60px 0px' });
  items.forEach(function (el) {
    // lo que ya está a la vista al cargar no se esconde
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    el.classList.add('wait'); io.observe(el);
  });
})();

// Medición con Meta: píxel + API de conversiones. Nada se carga sin que la persona acepte.
(function () {
  var PIXEL = '1680506207067286';                 // PIXEL INNOVATE SOLUTIONS MKT 2027
  var CAPI = 'https://yfgbckwdneohetdeixrm.supabase.co/functions/v1/meta-capi-web';
  var CLAVE = 'cookies_publicidad';
  // En una copia local no se envía nada, para no ensuciar los datos
  var EN_LINEA = /^(www\.)?innovatesolutionsmkt\.com$/.test(location.hostname);
  var gpc = navigator.globalPrivacyControl === true;
  var activo = false, cargado = false, listo = null;

  function leer() { try { return localStorage.getItem(CLAVE); } catch (e) { return null; } }
  function guardar(v) { try { localStorage.setItem(CLAVE, v); } catch (e) {} }
  function cookie(n) { var m = document.cookie.match(new RegExp('(?:^|; )' + n + '=([^;]*)')); return m ? m[1] : undefined; }

  function fbc() {
    var id = new URLSearchParams(location.search).get('fbclid');
    return cookie('_fbc') || (id ? 'fb.1.' + Date.now() + '.' + id : undefined);
  }

  // Cada evento sale por el navegador y por el servidor con el mismo identificador
  function enviar(nombre, datos) {
    if (!activo || !EN_LINEA) return;
    var id = 'ev.' + Date.now() + '.' + Math.random().toString(36).slice(2, 10);
    var url = location.href;
    window.fbq('track', nombre, datos || {}, { eventID: id });
    listo.then(function () {
      if (!activo) return;
      fetch(CAPI, {
        method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_name: nombre, event_id: id, event_source_url: url, fbp: cookie('_fbp'), fbc: fbc() })
      }).catch(function () {});
    });
  }

  function activar() {
    if (activo || gpc) return;
    activo = true;
    if (!EN_LINEA) return;
    if (cargado) { window.fbq('consent', 'grant'); listo = Promise.resolve(); return; }
    cargado = true;
    var f = window.fbq = function () { f.callMethod ? f.callMethod.apply(f, arguments) : f.queue.push(arguments); };
    window._fbq = f; f.push = f; f.loaded = true; f.version = '2.0'; f.queue = [];
    var s = document.createElement('script');
    // se espera un momento a que el píxel cree su cookie (si está bloqueado, se sigue igual)
    listo = new Promise(function (ok) {
      s.onload = function () { setTimeout(ok, 600); };
      s.onerror = ok;
      setTimeout(ok, 3000);
    });
    s.async = true; s.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(s);
    f('set', 'autoConfig', false, PIXEL);
    f('init', PIXEL);
    enviar('PageView');
  }

  function desactivar() {
    activo = false;
    if (window.fbq) window.fbq('consent', 'revoke');
    ['_fbp', '_fbc'].forEach(function (n) {
      ['', '; domain=.innovatesolutionsmkt.com'].forEach(function (d) { document.cookie = n + '=; Max-Age=0; path=/' + d; });
    });
  }

  function cerrar() {
    var a = document.getElementById('aviso-cookies');
    if (a) a.remove();
    document.body.classList.remove('con-aviso');
  }

  function preguntar() {
    cerrar();
    var a = document.createElement('section');
    a.id = 'aviso-cookies'; a.className = 'cookies'; a.setAttribute('aria-label', 'Aviso de cookies');
    a.innerHTML = gpc
      ? '<p>Tu navegador pide no ser rastreado, así que no usamos cookies de publicidad. <a href="privacidad.html">Más información</a></p><div><button type="button" class="btn btn-small" data-r="no">Entendido</button></div>'
      : '<p>¿Nos permites usar cookies de Meta para medir nuestra publicidad? <a href="privacidad.html">Más información</a></p><div><button type="button" class="btn btn-small btn-ghost" data-r="no">Rechazar</button><button type="button" class="btn btn-small" data-r="si">Aceptar</button></div>';
    a.addEventListener('click', function (e) {
      var r = e.target.getAttribute && e.target.getAttribute('data-r');
      if (!r) return;
      guardar(r); cerrar();
      if (r === 'si') activar(); else desactivar();
    });
    document.body.appendChild(a);
    document.body.classList.add('con-aviso');
  }

  document.addEventListener('click', function (e) {
    if (!e.target.closest) return;
    if (e.target.closest('[data-cookies]')) { preguntar(); return; }
    if (e.target.closest('[data-wa]')) enviar('Contact');
    else if (e.target.closest('#cy-link')) enviar('ViewContent', { content_name: 'ConfirmaYa' });
  });

  var decision = leer();
  if (decision === 'si') activar();
  else if (decision !== 'no' && !gpc) preguntar();
})();

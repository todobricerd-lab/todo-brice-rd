/*
 * site.js — Aplica la configuración editable desde el CMS (data/site.json)
 * en toda la página: colores de marca, número de WhatsApp y textos con [data-cms].
 * No requiere build step: es JavaScript plano cargado con <script defer>.
 */
(function () {
  function aplicarColores(colores) {
    if (!colores) return;
    var root = document.documentElement.style;
    if (colores.azul) root.setProperty('--brand-blue', colores.azul);
    if (colores.verde) root.setProperty('--brand-green', colores.verde);
    if (colores.naranja) root.setProperty('--brand-orange', colores.naranja);
  }

  function aplicarWhatsapp(whatsapp) {
    if (!whatsapp || !whatsapp.numero) return;
    window.BRICE_WA_NUMERO = whatsapp.numero;
    document.querySelectorAll('a[href*="wa.me/18293795820"]').forEach(function (a) {
      a.setAttribute('href', a.getAttribute('href').replace('18293795820', whatsapp.numero));
    });
  }

  function obtenerValor(sitio, ruta) {
    var partes = ruta.split('.');
    var val = sitio;
    for (var i = 0; i < partes.length; i++) {
      if (val == null) return undefined;
      val = val[partes[i]];
    }
    return val;
  }

  function aplicarTextos(sitio) {
    document.querySelectorAll('[data-cms]').forEach(function (el) {
      var val = obtenerValor(sitio, el.getAttribute('data-cms'));
      if (typeof val === 'string') el.textContent = val;
    });
  }

  function aplicarMedios(sitio) {
    document.querySelectorAll('[data-cms-src]').forEach(function (el) {
      var val = obtenerValor(sitio, el.getAttribute('data-cms-src'));
      if (typeof val === 'string' && val) el.setAttribute('src', val);
    });
    document.querySelectorAll('[data-cms-poster]').forEach(function (el) {
      var val = obtenerValor(sitio, el.getAttribute('data-cms-poster'));
      if (typeof val === 'string' && val) el.setAttribute('poster', val);
    });
  }

  fetch('data/site.json')
    .then(function (r) { return r.json(); })
    .then(function (sitio) {
      window.BRICE_SITE = sitio;
      aplicarColores(sitio.colores);
      aplicarWhatsapp(sitio.whatsapp);
      aplicarTextos(sitio);
      aplicarMedios(sitio);
    })
    .catch(function (err) {
      console.error('No se pudo cargar data/site.json:', err);
    });
})();

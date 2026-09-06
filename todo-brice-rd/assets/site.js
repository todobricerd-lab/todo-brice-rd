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

  /* Reescribe TODOS los enlaces wa.me al número configurado en el CMS,
     incluidos los que el JavaScript genera después (catálogo, cotizador, promos). */
  function reescribirEnlacesWa(numero) {
    var re = /wa\.me\/\d+/;
    document.querySelectorAll('a[href*="wa.me/"]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (href && re.test(href)) a.setAttribute('href', href.replace(re, 'wa.me/' + numero));
    });
  }

  function aplicarWhatsapp(whatsapp) {
    if (!whatsapp || !whatsapp.numero) return;
    window.BRICE_WA_NUMERO = whatsapp.numero;
    reescribirEnlacesWa(whatsapp.numero);
    /* El catálogo y el cotizador se pintan después de este fetch:
       observamos el DOM para corregir los enlaces nuevos. */
    if (window.MutationObserver) {
      var pendiente = false;
      new MutationObserver(function () {
        if (pendiente) return;
        pendiente = true;
        requestAnimationFrame(function () {
          pendiente = false;
          reescribirEnlacesWa(window.BRICE_WA_NUMERO);
        });
      }).observe(document.body, { childList: true, subtree: true });
    }
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

  /* Campos que conservan marcado interno (negritas, palabras en naranja).
     El valor guardado en site.json incluye ese HTML. */
  function aplicarTextosHtml(sitio) {
    document.querySelectorAll('[data-cms-html]').forEach(function (el) {
      var val = obtenerValor(sitio, el.getAttribute('data-cms-html'));
      if (typeof val === 'string') el.innerHTML = val;
    });
  }

  /* El enlace tel: se arma con los dígitos del teléfono del CMS. */
  function aplicarTelefonos(sitio) {
    document.querySelectorAll('[data-cms-tel]').forEach(function (el) {
      var val = obtenerValor(sitio, el.getAttribute('data-cms-tel'));
      if (typeof val !== 'string') return;
      var d = val.replace(/\D/g, '');
      if (d.length === 10) d = '1' + d;
      if (d.length >= 10) el.setAttribute('href', 'tel:+' + d);
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
      aplicarTextosHtml(sitio);
      aplicarTelefonos(sitio);
      aplicarMedios(sitio);
    })
    .catch(function (err) {
      console.error('No se pudo cargar data/site.json:', err);
    });
})();

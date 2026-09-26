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

  /* ── Redes sociales ─────────────────────────────────────────
     Se pintan desde la lista para que se puedan agregar desde el panel
     sin tocar las seis páginas. El ícono de Instagram sigue siendo el
     mismo dibujo que estaba escrito a mano en el pie; los demás usan un
     símbolo, y una red nueva que no esté en esta lista sale con 🔗. */
  var ICONOS = {
    instagram: '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clip-rule="evenodd" /></svg>',
    tiktok: '<span>🎵</span>',
    facebook: '<span>📘</span>',
    youtube: '<span>▶️</span>',
    otro: '<span>🔗</span>',
  };

  function aplicarRedes(redes) {
    var caja = document.querySelector('[data-cms-redes]');
    if (!caja) return;
    if (!Array.isArray(redes) || !redes.length) { caja.innerHTML = ''; return; }

    /* El enlace se arma con createElement y no con innerHTML para el
       href: así una dirección con comillas no puede salirse del atributo.
       El ícono sí es HTML, pero sale de esta lista fija, no del panel. */
    caja.innerHTML = '';
    redes.forEach(function (red) {
      if (!red || (!red.usuario && !red.enlace)) return;
      var li = document.createElement('li');
      li.className = 'flex items-center gap-2' + (red.tipo === 'instagram' ? ' text-brandOrange' : '');
      li.innerHTML = ICONOS[red.tipo] || ICONOS.otro;

      var texto = red.usuario || red.nombre || red.enlace;
      if (red.enlace) {
        var a = document.createElement('a');
        a.href = red.enlace;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.className = 'text-gray-400 hover:text-white transition';
        a.textContent = texto;
        li.appendChild(a);
      } else {
        var s = document.createElement('span');
        s.className = 'text-gray-400';
        s.textContent = texto;
        li.appendChild(s);
      }
      caja.appendChild(li);
    });
  }

  function aplicar(sitio) {
    window.BRICE_SITE = sitio;
    aplicarColores(sitio.colores);
    aplicarWhatsapp(sitio.whatsapp);
    aplicarTextos(sitio);
    aplicarTextosHtml(sitio);
    aplicarTelefonos(sitio);
    aplicarMedios(sitio);
    aplicarRedes(sitio.redes);
  }

  /* Se pide primero a /api/site, que es lo que el panel edita. El archivo
     del repositorio queda de respaldo para cuando no hay servidor
     detrás, como al abrir la página desde el disco. */
  fetch('/api/site')
    .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('sin api')); })
    .catch(function () {
      return fetch('data/site.json').then(function (r) { return r.json(); });
    })
    .then(aplicar)
    .catch(function (err) {
      console.error('No se pudo cargar la configuración del sitio:', err);
    });
})();

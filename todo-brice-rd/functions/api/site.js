/*
 * La información general del sitio: teléfonos, WhatsApp, correo, redes y
 * el logo. Es lo mismo que hace /api/catalogo con los productos.
 *
 *   GET /api/site   → lo guardado, o data/site.json del repositorio
 *   PUT /api/site   → guarda (solo con sesión abierta)
 *
 * El panel manda el archivo entero, pero aquí solo se aceptan las partes
 * que el panel edita y el resto se toma de lo que ya había. Así un envío
 * mal formado no puede vaciar los textos de las páginas ni meter claves
 * nuevas que nadie lee.
 */

import { haySesion, json } from '../_auth.js';

const CLAVE = 'site';

/* Cuánto se admite en cada casilla. No es seguridad contra quien ya
   tiene la contraseña: es para que un copiar y pegar accidental de media
   página no acabe dentro del pie. */
const LARGO = {
  telefono_visible: 40,
  whatsapp_visible: 40,
  direccion: 160,
  correo: 120,
  instagram_usuario: 60,
  tiktok_usuario: 60,
  numero: 20,
  mensaje_general: 300,
  logo: 300,
};

const texto = (valor, tope) =>
  typeof valor === 'string' && valor.length <= tope ? valor.trim() : null;

/* Toma de `nuevo` solo lo conocido y lo pone sobre `base`. Lo que no
   esté en esta función no se puede cambiar desde el panel. */
function combinar(base, nuevo) {
  const salida = JSON.parse(JSON.stringify(base || {}));
  if (!nuevo || typeof nuevo !== 'object') return salida;

  const c = nuevo.contacto || {};
  salida.contacto = salida.contacto || {};
  for (const campo of ['telefono_visible', 'whatsapp_visible', 'direccion', 'correo', 'instagram_usuario', 'tiktok_usuario']) {
    const v = texto(c[campo], LARGO[campo]);
    if (v !== null) salida.contacto[campo] = v;
  }

  const w = nuevo.whatsapp || {};
  salida.whatsapp = salida.whatsapp || {};
  /* El número que abre el chat va sin espacios ni guiones: así es como lo
     espera wa.me, y escribirlo bonito rompería todos los enlaces. */
  const numero = texto(w.numero, LARGO.numero);
  if (numero !== null) salida.whatsapp.numero = numero.replace(/[^0-9]/g, '');
  const mensaje = texto(w.mensaje_general, LARGO.mensaje_general);
  if (mensaje !== null) salida.whatsapp.mensaje_general = mensaje;

  const m = nuevo.medios || {};
  salida.medios = salida.medios || {};
  const logo = texto(m.logo, LARGO.logo);
  if (logo !== null && logo) salida.medios.logo = logo;

  if (Array.isArray(nuevo.redes)) {
    salida.redes = nuevo.redes
      .filter((r) => r && typeof r === 'object')
      .slice(0, 12)
      .map((r) => ({
        tipo: texto(r.tipo, 20) || 'otro',
        nombre: texto(r.nombre, 40) || '',
        usuario: texto(r.usuario, 60) || '',
        enlace: enlaceSeguro(r.enlace),
      }))
      .filter((r) => r.usuario || r.enlace);
  }

  return salida;
}

/* Solo http y https. Sin esto, un "javascript:" en el enlace de una red
   se ejecutaría en el navegador de cualquiera que lo tocara en el pie. */
function enlaceSeguro(valor) {
  if (typeof valor !== 'string' || valor.length > 300) return '';
  const limpio = valor.trim();
  if (!limpio) return '';
  try {
    const u = new URL(limpio);
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : '';
  } catch {
    return '';
  }
}

async function semilla(env, request) {
  const url = new URL('/data/site.json', request.url);
  const r = await env.ASSETS.fetch(new Request(url, { method: 'GET' }));
  if (!r.ok) return {};
  return r.json();
}

/* Las redes no existían en el archivo original: se arman a partir de los
   usuarios que ya estaban sueltos, para que el pie siga igual el primer
   día y desde ahí se puedan agregar más. */
function redesPorDefecto(sitio) {
  if (Array.isArray(sitio.redes) && sitio.redes.length) return sitio;
  const c = sitio.contacto || {};
  const redes = [];
  if (c.instagram_usuario) {
    redes.push({
      tipo: 'instagram',
      nombre: 'Instagram',
      usuario: c.instagram_usuario,
      enlace: 'https://www.instagram.com/' + String(c.instagram_usuario).replace(/^@/, '') + '/',
    });
  }
  if (c.tiktok_usuario) {
    redes.push({
      tipo: 'tiktok',
      nombre: 'TikTok',
      usuario: c.tiktok_usuario,
      enlace: 'https://www.tiktok.com/' + (String(c.tiktok_usuario).startsWith('@') ? c.tiktok_usuario : '@' + c.tiktok_usuario),
    });
  }
  return { ...sitio, redes };
}

export async function onRequestGet({ request, env }) {
  if (env.CATALOGO) {
    const guardado = await env.CATALOGO.get(CLAVE, 'json');
    if (guardado) return json(redesPorDefecto(guardado));
  }
  return json(redesPorDefecto(await semilla(env, request)));
}

export async function onRequestPut({ request, env }) {
  if (!(await haySesion(request, env))) return json({ ok: false, error: 'Sesión vencida' }, 401);
  if (!env.CATALOGO) return json({ ok: false, error: 'Falta conectar el almacén' }, 500);

  let datos;
  try {
    datos = await request.json();
  } catch {
    return json({ ok: false, error: 'No se entendió el envío' }, 400);
  }

  const guardado = await env.CATALOGO.get(CLAVE, 'json');
  const base = guardado || (await semilla(env, request));
  const final = combinar(redesPorDefecto(base), datos);

  await env.CATALOGO.put(CLAVE, JSON.stringify(final));
  return json({ ok: true, guardado: new Date().toISOString() });
}

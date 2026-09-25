/*
 * El catálogo que ve la página y que edita el panel.
 *
 *   GET /api/catalogo   → lo que hay guardado, o el archivo del repo
 *   PUT /api/catalogo   → guarda (solo con sesión abierta)
 *
 * Se guarda en KV y no en el repositorio a propósito. Escribir en el
 * repositorio obligaría a tener aquí un token con permiso para cambiar
 * el código del sitio, y a esperar el despliegue en cada cambio de
 * precio. Con KV el cambio sale al instante y el peor caso de una fuga
 * es un catálogo editado, no el sitio entero.
 *
 * data/productos.json sigue en el repositorio y hace de semilla: es lo
 * que se sirve mientras nadie haya guardado nada desde el panel.
 */

import { haySesion, json } from '../_auth.js';

const CLAVE = 'catalogo';

/* Lo que se acepta guardar. Sin esto, cualquier cosa con sesión válida
   podría dejar el catálogo en un estado que rompa la página pública. */
function revisar(datos) {
  if (!datos || typeof datos !== 'object') return 'formato inválido';
  if (!Array.isArray(datos.categorias)) return 'faltan las categorías';
  if (datos.categorias.length > 60) return 'demasiadas categorías';

  for (const cat of datos.categorias) {
    if (!cat || typeof cat.nombre !== 'string' || !cat.nombre.trim()) {
      return 'hay una categoría sin nombre';
    }
    if (typeof cat.id !== 'string' || !/^[a-z0-9-]+$/.test(cat.id)) {
      return `el identificador de "${cat.nombre}" solo admite minúsculas, números y guiones`;
    }
    /* Una sección recién creada, o una que quedó vacía, viene sin lista.
       Eso es válido: se normaliza en vez de rechazarse. */
    if (cat.productos == null) cat.productos = [];
    const productos = cat.productos;
    if (!Array.isArray(productos)) return `"${cat.nombre}" no tiene lista de productos`;
    if (productos.length > 300) return `"${cat.nombre}" tiene demasiados productos`;

    for (const p of productos) {
      if (!p || typeof p.nombre !== 'string' || !p.nombre.trim()) {
        return `hay un producto sin nombre en "${cat.nombre}"`;
      }
      if (!Array.isArray(p.precios)) return `"${p.nombre}" no tiene precios`;
      for (const precio of p.precios) {
        if (typeof precio.monto !== 'number' || !Number.isFinite(precio.monto) || precio.monto < 0) {
          return `"${p.nombre}" tiene un precio que no es un número`;
        }
      }
    }
  }
  return null;
}

async function semilla(env, request) {
  const url = new URL('/data/productos.json', request.url);
  const r = await env.ASSETS.fetch(new Request(url, { method: 'GET' }));
  if (!r.ok) return { categorias: [] };
  return r.json();
}

export async function onRequestGet({ request, env }) {
  if (env.CATALOGO) {
    const guardado = await env.CATALOGO.get(CLAVE, 'json');
    if (guardado) return json(guardado);
  }
  return json(await semilla(env, request));
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

  const problema = revisar(datos);
  if (problema) return json({ ok: false, error: problema }, 400);

  await env.CATALOGO.put(CLAVE, JSON.stringify(datos));
  return json({ ok: true, guardado: new Date().toISOString() });
}

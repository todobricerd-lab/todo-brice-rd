/*
 * Las fotos de los productos.
 *
 *   POST /api/foto        → sube una (solo con sesión abierta)
 *   GET  /api/foto/<id>   → la devuelve
 *
 * Van en el mismo KV que el catálogo y no en R2 a propósito: R2 exige un
 * método de pago en la cuenta, y para fotos de producto de unos cientos
 * de kilobytes el KV sobra. El panel las reduce y las comprime antes de
 * mandarlas, así que lo que llega aquí ya viene liviano.
 *
 * Cada foto queda bajo su propia clave en vez de meterse dentro del JSON
 * del catálogo. Si fueran parte del catálogo, la página pública tendría
 * que descargarse todas las fotos en un solo archivo antes de pintar
 * nada, y el navegador no podría guardarlas en caché por separado.
 */

import { haySesion, json } from '../../_auth.js';

const PREFIJO = 'foto:';
const TIPOS = ['image/jpeg', 'image/png', 'image/webp'];
const MAXIMO = 3 * 1024 * 1024; /* 3 MB: el panel manda ~200 KB; esto es
                                   el tope por si alguien llama la API
                                   directo sin pasar por el panel. */

/* El identificador es aleatorio y no lleva el nombre del archivo: los
   nombres que salen de un celular repiten mucho (IMG_0001) y además
   pueden traer caracteres que no se pueden poner en una ruta. */
const nuevoId = () => crypto.randomUUID().replace(/-/g, '');

export async function onRequestPost({ request, env }) {
  if (!(await haySesion(request, env))) return json({ ok: false, error: 'Sesión vencida' }, 401);
  if (!env.CATALOGO) return json({ ok: false, error: 'Falta conectar el almacén' }, 500);

  const tipo = (request.headers.get('Content-Type') || '').split(';')[0].trim().toLowerCase();
  if (!TIPOS.includes(tipo)) {
    return json({ ok: false, error: 'Solo se aceptan imágenes JPG, PNG o WebP' }, 400);
  }

  const cuerpo = await request.arrayBuffer();
  if (!cuerpo.byteLength) return json({ ok: false, error: 'La imagen llegó vacía' }, 400);
  if (cuerpo.byteLength > MAXIMO) return json({ ok: false, error: 'La imagen pesa demasiado' }, 413);

  const id = nuevoId();
  await env.CATALOGO.put(PREFIJO + id, cuerpo, {
    metadata: { tipo: tipo, subida: new Date().toISOString() },
  });

  return json({ ok: true, url: '/api/foto/' + id });
}

export async function onRequestGet({ params, env }) {
  const id = Array.isArray(params.ruta) ? params.ruta[0] : params.ruta;
  if (!id || !/^[a-f0-9]{32}$/.test(id)) return new Response('No encontrada', { status: 404 });
  if (!env.CATALOGO) return new Response('Sin almacén', { status: 503 });

  const { value, metadata } = await env.CATALOGO.getWithMetadata(PREFIJO + id, {
    type: 'arrayBuffer',
  });
  if (!value) return new Response('No encontrada', { status: 404 });

  return new Response(value, {
    headers: {
      'Content-Type': (metadata && metadata.tipo) || 'image/jpeg',
      /* El identificador es único por subida: cambiar la foto crea otra
         clave, así que esta nunca cambia y se puede cachear para siempre. */
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}

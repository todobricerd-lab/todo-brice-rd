/*
 * Las promociones del carrusel de Inicio, que edita el panel.
 *
 *   GET /api/promos   → lo que hay guardado, o el archivo del repo
 *   PUT /api/promos   → guarda (solo con sesión abierta)
 *
 * Igual que el catálogo: se guarda en KV para que el cambio salga al
 * instante, sin token de GitHub ni despliegue. data/promos.json queda de
 * semilla mientras nadie guarde nada desde el panel.
 */

import { haySesion, json } from '../_auth.js';

const CLAVE = 'promos';
const COLORES = ['naranja', 'verde', 'azul'];
const MEDIOS = ['imagen', 'video'];

/* Tope de largo por campo: más que eso no cabe en la tarjeta del carrusel
   y suele ser un pegado por error. */
const TEXTOS = { etiqueta: 40, categoria: 60, tituloPrecio: 80, descripcion: 400, whatsappTexto: 300 };

function revisar(datos) {
  if (!datos || typeof datos !== 'object') return 'formato inválido';
  if (!Array.isArray(datos.promos)) return 'faltan las promociones';
  if (datos.promos.length > 20) return 'demasiadas promociones (máximo 20)';

  for (const [i, p] of datos.promos.entries()) {
    const cual = `la promoción ${i + 1}`;
    if (!p || typeof p !== 'object') return `${cual} no tiene formato válido`;
    if (typeof p.activa !== 'boolean') return `${cual}: falta decir si está activa`;
    if (!MEDIOS.includes(p.tipoMedio)) return `${cual}: el tipo debe ser imagen o video`;
    if (typeof p.imagen !== 'string' || p.imagen.length > 300) {
      return `${cual}: la foto debe ser una dirección, no la imagen entera`;
    }
    if (p.activa && !p.imagen) return `${cual} está activa pero no tiene foto`;
    for (const c of ['colorEtiqueta', 'colorBoton']) {
      if (p[c] != null && !COLORES.includes(p[c])) return `${cual}: color no válido`;
    }
    for (const [campo, max] of Object.entries(TEXTOS)) {
      if (p[campo] != null && typeof p[campo] !== 'string') return `${cual}: "${campo}" no es texto`;
      if (typeof p[campo] === 'string' && p[campo].length > max) {
        return `${cual}: "${campo}" pasa de ${max} letras`;
      }
    }
  }
  return null;
}

async function semilla(env, request) {
  const url = new URL('/data/promos.json', request.url);
  const r = await env.ASSETS.fetch(new Request(url, { method: 'GET' }));
  if (!r.ok) return { promos: [] };
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

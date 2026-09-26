/*
 * Que Manuel se ponga su propia contraseña.
 *
 *   GET  /api/clave                      → dice si ya la cambió
 *   POST /api/clave  { actual, nueva }   → la cambia
 *
 * Pide la actual aunque ya haya sesión abierta. Si no, bastaría con que
 * alguien se quedara un minuto frente al celular desbloqueado para
 * dejarlo fuera de su propio panel.
 */

import { claveCorrecta, guardada, amasar, nuevaSal, haySesion, json, CLAVE_KV, VUELTAS } from '../_auth.js';

const MINIMO = 8;

const frenar = () => new Promise((listo) => setTimeout(listo, 700));

export async function onRequestGet({ request, env }) {
  if (!(await haySesion(request, env))) return json({ ok: false }, 401);
  const propia = await guardada(env);
  return json({
    ok: true,
    propia: !!propia,
    cambiada: propia ? propia.cambiada : null,
  });
}

export async function onRequestPost({ request, env }) {
  if (!(await haySesion(request, env))) return json({ ok: false, error: 'Sesión vencida' }, 401);
  if (!env.CATALOGO) return json({ ok: false, error: 'Falta conectar el almacén' }, 500);

  let cuerpo;
  try {
    cuerpo = await request.json();
  } catch {
    return json({ ok: false, error: 'No se entendió el envío' }, 400);
  }

  const actual = String((cuerpo && cuerpo.actual) ?? '');
  const nueva = String((cuerpo && cuerpo.nueva) ?? '');

  if (nueva.length < MINIMO) {
    return json({ ok: false, error: `La nueva debe tener al menos ${MINIMO} caracteres` }, 400);
  }
  if (nueva === actual) {
    return json({ ok: false, error: 'La nueva es igual a la de ahora' }, 400);
  }
  /* Espacios al principio o al final: se escriben sin querer y después
     nadie entiende por qué no entra. */
  if (nueva !== nueva.trim()) {
    return json({ ok: false, error: 'La nueva no puede empezar ni terminar con espacios' }, 400);
  }

  if (!(await claveCorrecta(actual, env))) {
    await frenar();
    return json({ ok: false, error: 'La contraseña de ahora no coincide' }, 401);
  }

  const sal = nuevaSal();
  await env.CATALOGO.put(
    CLAVE_KV,
    JSON.stringify({
      sal,
      hash: await amasar(nueva, sal),
      vueltas: VUELTAS,
      cambiada: new Date().toISOString(),
    })
  );

  return json({ ok: true });
}

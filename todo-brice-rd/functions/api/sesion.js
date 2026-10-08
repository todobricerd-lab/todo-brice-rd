/*
 * Entrar y salir del panel.
 *
 *   POST /api/sesion   { clave }   → abre sesión
 *   GET  /api/sesion               → dice si la sesión sigue viva
 *   DELETE /api/sesion             → cierra sesión
 *
 * Nunca se responde en qué falló el intento. Decir "contraseña
 * incorrecta" frente a "falta configurar" le regala información a quien
 * está probando desde fuera.
 *
 * A los cinco fallos seguidos la conexión queda fuera una hora (ver
 * _auth.js). Eso sí se dice: Manuel tiene que saber por qué no entra.
 */

import {
  claveCorrecta, cookieDeSesion, cookieVacia, haySesion, json,
  bloqueado, anotarFallo, olvidarFallos, DEMASIADOS,
} from '../_auth.js';

/* Espera breve ante un intento fallido: no frena a nadie decidido, pero
   encarece probar contraseñas a mansalva desde un script. */
const frenar = () => new Promise((listo) => setTimeout(listo, 700));

export async function onRequestPost({ request, env }) {
  let cuerpo;
  try {
    cuerpo = await request.json();
  } catch {
    return json({ ok: false }, 400);
  }

  if (await bloqueado(request, env)) return json({ ok: false, error: DEMASIADOS }, 429);

  if (await claveCorrecta(cuerpo && cuerpo.clave, env)) {
    await olvidarFallos(request, env);
    return json({ ok: true }, 200, { 'Set-Cookie': await cookieDeSesion(env) });
  }

  await anotarFallo(request, env);
  await frenar();
  return json({ ok: false }, 401);
}

export async function onRequestGet({ request, env }) {
  return json({ ok: await haySesion(request, env) });
}

export async function onRequestDelete() {
  return json({ ok: true }, 200, { 'Set-Cookie': cookieVacia() });
}

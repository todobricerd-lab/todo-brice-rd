/*
 * Sesión del panel de Manuel.
 *
 * La contraseña nunca viaja al navegador ni vive en el código: está en
 * Cloudflare como variable secreta (PANEL_CLAVE). Lo único que recibe el
 * navegador es una cookie firmada, y la firma se hace con otro secreto
 * (PANEL_SECRETO) que tampoco sale de aquí.
 *
 * Por qué firmada y no un simple "logueado=si": una cookie sin firma la
 * escribe cualquiera desde la consola del navegador. Con firma, cambiar
 * un solo carácter invalida la sesión, porque el servidor recalcula el
 * HMAC y no coincide.
 *
 * Los archivos que empiezan con guion bajo no generan ruta: este no se
 * puede pedir desde fuera.
 */

const COOKIE = 'brice_sesion';
const DURACION_HORAS = 12;

const codificar = (texto) => new TextEncoder().encode(texto);

const aHex = (buffer) =>
  [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');

async function firmar(valor, secreto) {
  const clave = await crypto.subtle.importKey(
    'raw',
    codificar(secreto),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return aHex(await crypto.subtle.sign('HMAC', clave, codificar(valor)));
}

/* Comparación de tiempo constante: comparar con === deja escapar, por lo
   que tarda, pistas sobre cuántos caracteres acertó quien lo intenta. */
function igualesSinFiltrar(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diferencia = 0;
  for (let i = 0; i < a.length; i++) diferencia |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diferencia === 0;
}

export async function claveCorrecta(intento, env) {
  if (!env.PANEL_CLAVE) return false;
  /* Se comparan los hash y no los textos: así la comparación siempre mide
     lo mismo aunque las longitudes difieran. */
  const [a, b] = await Promise.all([
    firmar(String(intento ?? ''), env.PANEL_SECRETO || 'sal'),
    firmar(env.PANEL_CLAVE, env.PANEL_SECRETO || 'sal'),
  ]);
  return igualesSinFiltrar(a, b);
}

export async function cookieDeSesion(env) {
  const vence = Date.now() + DURACION_HORAS * 60 * 60 * 1000;
  const cuerpo = String(vence);
  const firma = await firmar(cuerpo, env.PANEL_SECRETO || 'sal');
  const valor = `${cuerpo}.${firma}`;
  return `${COOKIE}=${valor}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${DURACION_HORAS * 3600}`;
}

export const cookieVacia = () =>
  `${COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;

export async function haySesion(request, env) {
  const crudas = request.headers.get('Cookie') || '';
  const par = crudas.split(';').map((c) => c.trim()).find((c) => c.startsWith(COOKIE + '='));
  if (!par) return false;

  const valor = par.slice(COOKIE.length + 1);
  const corte = valor.lastIndexOf('.');
  if (corte < 1) return false;

  const cuerpo = valor.slice(0, corte);
  const firma = valor.slice(corte + 1);

  const esperada = await firmar(cuerpo, env.PANEL_SECRETO || 'sal');
  if (!igualesSinFiltrar(firma, esperada)) return false;

  const vence = Number(cuerpo);
  return Number.isFinite(vence) && vence > Date.now();
}

export const json = (datos, estado = 200, cabeceras = {}) =>
  new Response(JSON.stringify(datos), {
    status: estado,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...cabeceras },
  });

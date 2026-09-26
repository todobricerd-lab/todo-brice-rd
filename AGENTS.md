# Reglas de trabajo en este repositorio

Este archivo es para cualquier agente que trabaje aquí (Antigravity, Claude
Code, Cursor u otro). Léelo antes de tocar nada.

---

## Lo primero

**No hagas nada que no se te haya pedido.** Ni mejoras, ni rediseños, ni
renombrar, ni "de paso arreglé". Si ves algo que está mal, dilo en una
línea y sigue con lo pedido.

**No cambies textos que escribió el cliente.** Los textos de esta página
los redactó Manuel Brice o se acordaron con él. Cambiar "podemos realizar"
por "realizamos" convierte una oferta en una promesa. Si un texto te
parece mejorable, propónlo; no lo cambies.

**Enseña el diff antes de subir.** Siempre. Un cambio que toca 500 líneas
cuando se pidió un botón es motivo para revertir, no para celebrar.

**No digas que funciona sin haberlo comprobado.** Enseña la salida del
comando o la respuesta del servidor que lo demuestra.

---

## Cómo está armado esto

Sitio estático de seis páginas HTML servido por **Cloudflare Pages**, con
**Pages Functions** para la parte que guarda datos.

```
todo-brice-rd/
  index.html  productos.html  nosotros.html
  contacto.html  aviso-legal.html  airbnb.html   ← las seis páginas
  panel.html                                     ← el panel de Manuel
  assets/site.js                                 ← aplica lo editable
  data/site.json, data/productos.json            ← semillas
  functions/_auth.js                             ← sesión y contraseña
  functions/api/sesion.js  catalogo.js  site.js  clave.js  foto/[[ruta]].js
  _headers                                       ← cabeceras y caché
```

### Cosas que rompen si no se saben

- **No hay plantilla.** Las seis páginas repiten la cabecera y el pie a
  mano. Un cambio en el pie hay que hacerlo en las seis, o quedan
  distintas. Cuando toques una, revisa si aplica a las demás.

- **Los atributos `data-cms` son la conexión con el panel.** `assets/site.js`
  busca `[data-cms]`, `[data-cms-html]`, `[data-cms-tel]`, `[data-cms-src]`,
  `[data-cms-poster]` y `[data-cms-redes]` y les mete el valor guardado. Si
  reescribes un bloque y te los comes, el panel deja de poder editar esa
  parte **y no da ningún error**: simplemente ya no hace nada.

- **Los datos viven en KV, no en el repositorio.** `data/*.json` son solo
  la semilla del primer día. Lo que se ve en el sitio es lo que devuelve
  `/api/catalogo` y `/api/site`. Editar el JSON del repositorio no cambia
  lo que ya está guardado.

- **`assets/site.js` y el CSS no llevan versión en el nombre.** Si los
  cambias, sube el `?v=` de `<script src="assets/site.js?v=N">` en las seis
  páginas. Si no, Cloudflare puede seguir sirviendo la versión vieja y vas
  a jurar que el cambio no se desplegó.

- **El `<body>` lleva un `transform` puesto** por el fundido de entrada.
  Eso convierte al `<body>` en el marco de referencia de todo lo que tenga
  `position: fixed`. Un elemento fijo nuevo hay que colgarlo del `<html>`,
  como ya hace `#barraPedido` en `productos.html`.

- **Las fotos subidas se guardan en KV**, no en el repositorio, y se sirven
  por `/api/foto/<id>`. No intentes escribirlas en `img/`.

## Secretos

`PANEL_CLAVE` y `PANEL_SECRETO` viven en Cloudflare como variables
secretas, y en local en `.dev.vars`, que está en `.gitignore`.

- **Nunca leas ni imprimas el contenido de `.dev.vars`.** Si necesitas
  probar el panel, haz una copia del archivo, pon una contraseña de
  prueba tuya, prueba, y devuelve el original al terminar.
- Nunca pongas una contraseña, un token o una clave dentro del código.

## Antes de subir

1. `git status` — que no se cuele nada que no toca.
2. `git diff` — léelo entero.
3. Que el sitio cargue: `npx wrangler pages dev . --kv CATALOGO`
4. Si tocaste una función, prueba la ruta con `curl` y enseña la respuesta.

Los mensajes de commit van en español, explicando **por qué**, no qué.

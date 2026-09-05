# Guía para Manuel — Cómo editar la página Todo Brice RD

Esta guía es para ti, Manuel, sin necesidad de saber de computadoras. Todo se
hace desde un panel visual (el "CMS"): tocas botones, llenas campos y
guardas — nunca tienes que tocar código.

---

## 1. ¿Cómo entro al panel?

1. Abre el enlace del panel que te compartió tu desarrollador (guárdalo en
   favoritos del navegador o en una nota del celular).
2. Inicia sesión con la cuenta que se configuró para ti.
3. Verás un menú a la izquierda (o arriba, si usas el celular) con tres
   secciones:
   - **⚙️ Configuración General**
   - **🎉 Promociones (Inicio)**
   - **🛒 Catálogo y Precios**

Cada cambio que hagas hay que **guardarlo** ("Save" / "Guardar") y luego
**publicarlo**. Si el panel te muestra un botón que dice "Publish" o
"Commit", tócalo — si no lo tocas, el cambio no se ve en la página real.
Los cambios tardan uno o dos minutos en aparecer en el sitio.

---

## 2. Añadir un producto nuevo

1. Entra a **🛒 Catálogo y Precios**.
2. Toca la categoría donde va el producto (ej. "Línea Brice", "Bebidas").
3. Baja hasta el final de la lista de productos de esa categoría.
4. Toca el botón **"+ Add item"** (o el que tenga un símbolo de "+").
5. Llena:
   - **Nombre del producto**
   - **Foto del producto** (sube la imagen desde tu celular o computadora)
   - **Etiqueta corta** (una frase breve, ej. "Súper Rendidor")
   - **Descripción**
   - **Presentación y precio**: agrega al menos un tamaño con su precio en
     RD$ (puedes añadir varios: grande, mediano, pequeño).
6. Guarda y publica.

## 3. Quitar un producto

1. Entra a la categoría donde está el producto.
2. Ábrelo y busca el botón de basurero 🗑 (o "Remove") que está arriba de
   ese producto.
3. Tócalo, guarda y publica.

**Truco:** si solo quieres esconder un producto por un tiempo (por ejemplo
si se te acabó), es más fácil quitarle la foto o dejar la descripción como
"Agotado temporalmente" en vez de borrarlo — así no tienes que volver a
escribirlo todo cuando regrese.

## 4. Añadir una categoría nueva (ej. "Bebidas")

1. Entra a **🛒 Catálogo y Precios**.
2. Al final de la lista de categorías, toca **"+ Add item"**.
3. Llena:
   - **Nombre de la categoría** (ej. "Bebidas Frías")
   - **Icono (emoji)**: copia y pega uno, ej. 🥤
   - **Color de la categoría**: elige uno de la lista.
   - **Identificador interno**: escribe algo corto, en minúsculas, sin
     espacios ni tildes (ej. `bebidas-frias`). Este campo no lo ve el
     cliente, es solo para el sistema.
4. Guarda y publica.

## 5. Quitar una categoría

Igual que quitar un producto, pero con el botón 🗑 al nivel de toda la
categoría. **Ojo:** esto borra también todos los productos que tenía
adentro, así que revisa bien antes de confirmar.

## 6. Activar o desactivar una promoción

En **🎉 Promociones (Inicio)**, cada tarjeta tiene un interruptor
**"¿Mostrar esta promoción?"**. Apágalo para ocultarla sin perder el
contenido (útil cuando la promo se acaba pero la vas a repetir más
adelante), y enciéndelo cuando quieras que vuelva a aparecer.

## 7. Cambiar teléfono, WhatsApp, dirección o Instagram

Entra a **⚙️ Configuración General → Datos de contacto**. Ahí editas lo que
se ve en pantalla. Si cambias tu número real de WhatsApp (al que llegan los
pedidos), hazlo también en **"Número real de WhatsApp"**, un poco más
abajo en la misma sección — ese es el único campo que de verdad cambia a
dónde llegan los mensajes.

## 8. Cambiar los datos bancarios de Recargas y Pagos

Entra a **⚙️ Configuración General → 💳 Datos bancarios para Recargas y
Pagos**. Ahí puedes actualizar el banco, el nombre del titular y el número
de cuenta que ve el cliente al pedir una recarga. **Revisa dos veces el
número de cuenta** antes de guardar.

---

## 9. Sobre tus datos y los de tus clientes

- La página **no tiene servidor propio ni base de datos**: no guarda
  contraseñas, no crea cuentas, y no almacena los números de teléfono ni
  los montos que un cliente escribe para pedir una recarga o cotizar un
  producto. Ese mensaje se abre directo en WhatsApp y viaja del teléfono
  del cliente al tuyo — la página nunca lo recibe.
- Se agregó una página de **Aviso Legal y Privacidad** (enlace en el pie
  de página de todo el sitio) donde se explica esto mismo a tus clientes,
  para tu tranquilidad y la de ellos.
- Las recargas y pagos de servicio los confirmas siempre tú, a mano, por
  WhatsApp — el sitio solo arma el mensaje, no procesa ni cobra nada
  automáticamente.

---

## 10. Si algo sale mal

- Si un cambio no se ve después de unos minutos, revisa que hayas tocado
  el botón de "Publicar" / "Publish", no solo "Guardar".
- Si borraste algo por error, escríbele a tu desarrollador antes de seguir
  haciendo cambios — casi siempre se puede recuperar la versión anterior.

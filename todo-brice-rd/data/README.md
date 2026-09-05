# Catálogo y cotizador

El archivo `productos.json` es la única fuente de productos, presentaciones y precios de la página **Productos & Servicios**. Al guardar cambios allí se actualizan automáticamente la categoría seleccionable, todas las presentaciones visibles, el cotizador y el mensaje de pedido por WhatsApp.

## Añadir un producto

Dentro de `productos` de la categoría correcta, copia este modelo. Cada entrada de `precios` se muestra completa en el catálogo y queda disponible en el selector del cotizador.

```json
{
  "nombre": "Nombre del producto",
  "imagen": "img/nombre-de-la-foto.jpg",
  "etiqueta": "Tipo de producto",
  "destacado": false,
  "descripcion": "Descripción corta y clara.",
  "precios": [
    { "tamano": "Presentación grande", "monto": 250 },
    { "tamano": "Presentación pequeña", "monto": 120 }
  ]
}
```

No escribas `RD$` en `monto`: usa solamente el número. No agregues el producto manualmente en `productos.html`.

## Añadir una categoría

Copia una categoría existente, usa un `id` único en minúsculas y con guiones, y añade sus productos. Aunque esté vacía aparecerá como **Próximamente**; cuando tenga productos se podrá seleccionar y cotizar.

## Fotos y videos

- Fotos de producto: JPG o WebP, recomendación `1200 × 1200 px`, máximo **500 KB** por foto. Usa fondo claro y el producto completo.
- Fotos generales: máximo **1600 px** en el lado largo y **1 MB**.
- Videos: MP4 (H.264), máximo `1920 × 1080 px`, duración recomendada de 15–45 segundos y máximo **12 MB**. Incluye una imagen `-poster.jpg` de máximo **500 KB**.

Estos límites mantienen la página rápida y evitan que una imagen o video rompa el diseño en móviles.
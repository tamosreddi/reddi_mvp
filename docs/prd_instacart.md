# Product Requirement Document (PRD)
## Módulo: Compra de Productos v1 (MVP)

**Autor:** Ricardo Garcia
**Versión:** 1.0
**Fecha:** Junio 19, 2025

---

### 1. Visión y Objetivo

**Visión:** Crear la experiencia de compra de abarrotes más intuitiva, rápida y agradable en el mercado, permitiendo a nuestros usuarios explorar, descubrir y seleccionar productos para su hogar sin esfuerzo.

**Objetivo:** Implementar una nueva sección de compra de productos dentro de la aplicación, inspirada en las mejores prácticas de líderes como Instacart. Para el MVP, nos enfocaremos en la exploración de productos y la construcción del carrito de compras, sentando las bases para futuras funcionalidades de pago y entrega.

**Principios Clave:**
- **Mobile-First:** Cada componente y flujo estará optimizado para la experiencia móvil.
- **Velocidad es una Feature:** La interfaz debe ser instantáneamente responsiva.
- **Claridad Visual:** El usuario debe entender cómo usar la interfaz sin necesidad de instrucciones.

### 2. Personas e Historias de Usuario (Ejemplos)

- **Persona 1: El Dueño de Tienda Eficiente**
  - *Como dueño de una tienda con inventario establecido, quiero reabastecer mis productos agotados en menos de 10 minutos para poder dedicarme a atender a mis clientes.*
- **Persona 2: El Gerente de Compras Astuto**
  - *Como responsable de compras, quiero identificar rápidamente ofertas por volumen y nuevos productos con alto margen para mejorar la rentabilidad de mi negocio.*
- **Persona 3: El Nuevo Emprendedor**
  - *Como estoy abriendo mi primera tienda, quiero explorar todo el catálogo del distribuidor por pasillos y categorías para armar mi inventario inicial.*

### 3. Navegación Principal

La sección será autocontenida y se accederá a través de una nueva estructura de navegación principal basada en una **Barra de Pestañas Inferior (Bottom Tab Bar)**, que estará siempre visible dentro de la sección. Se prioriza el flujo de reabastecimiento.

- **Pestañas:**
    1.  **Reabastecer (Buy it again):** La pantalla de inicio por defecto. Acceso rápido a compras anteriores para máxima eficiencia.
    2.  **Tienda (Shop):** Página con productos nuevos, destacados y carruseles para el descubrimiento.
    3.  **Pasillos (Aisles):** Exploración del catálogo completo por categorías.
    4.  **Ofertas (Flyers):** Sección dedicada a promociones y descuentos por volumen.

![Referencia de Navegación](https://i.imgur.com/39g3Sdn.png)

### 4. Componentes Persistentes

Estos componentes estarán visibles en la mayoría de las pantallas de la sección.

**4.1. Barra de Navegación Superior**
- **Contenido:**
    - Un **Buscador** persistente.
    - Opcional (Post-MVP): Selector de tienda/localización, ícono de notificaciones.
- **Comportamiento:** Al tocar el buscador, se transiciona a la vista de Búsqueda (ver sección 5.5).

**4.2. Resumen Flotante del Carrito**
- **Diseño:** Una barra flotante anclada en la parte inferior, justo por encima de la barra de pestañas.
- **Contenido:** Muestra el número de artículos en el carrito y, opcionalmente, el subtotal. Ej: "**Estás ahorrando en el envío | 🛒 3**"
- **Comportamiento:**
    - Siempre visible si el carrito tiene 1 o más artículos.
    - Al tocarlo, lleva al usuario a la pantalla del Carrito de Compras (a definir en v2).

![Referencia de Resumen del Carrito](https://i.imgur.com/jI5v3UN.png)

### 5. Especificaciones de las Pestañas (Features)

**5.1. Pestaña "Tienda" (Home)**
- **Diseño:** Una vista de scroll vertical que contiene múltiples carruseles de scroll horizontal.
- **Carruseles (Ejemplos):**
    - **Ofertas destacadas:** Productos con `is_discounted=true`.
    - **Los más vendidos:** Productos con `is_best_seller=true`.
    - **Frutas y Verduras de Temporada:** Productos con `tag='temporada'`.
    - **Novedades:** Productos ordenados por fecha de creación descendente.

**5.2. Componente: Tarjeta de Producto (Product Card)**
- **Diseño:** Tarjeta vertical con un fuerte énfasis en la imagen.
- **Elementos:**
    - Imagen del producto.
    - Precio **por unidad y por caja** (ej. "$15.99 c/u | $180 por caja de 12").
    - Nombre del producto.
    - Descripción corta (ej. "Caja con 12 pzs", "Bolsa de 10 kg").
    - Indicador de stock ("Muchos en stock").
    - **Botón de Agregar (+):**
        - Un círculo verde con un `+` blanco, superpuesto en la esquina superior derecha de la imagen.
        - **Interacción:** Al tocarlo, **abre un pop-up o modal para ingresar la cantidad**, optimizado para números grandes. El modal debe tener botones para "Cajas" o "Unidades". Una vez ingresada, el botón `+` se transforma en un **Indicador de Cantidad**.
- **Componente: Indicador de Cantidad**
    - Reemplaza al botón `+`.
    - **Diseño:** Un óvalo verde que muestra la cantidad actual en el carrito (ej. "12 cajas").
    - **Interacción:** Al tocar el óvalo, se reabre el modal de cantidad para una edición rápida. Un ícono de basura permite eliminar el producto del carrito. La interacción de `+` y `-` para ajuste fino es secundaria o se puede omitir en el MVP.

![Referencia de Interacción](https://i.imgur.com/k6uYwXh.png)

**5.3. Pestaña "Pasillos" (Aisles)**
- **Diseño:** Una **cuadrícula (Grid)** de categorías/pasillos, no una lista. Cada elemento de la cuadrícula es una tarjeta con una imagen representativa y el nombre del pasillo (ej. "Snacks & Candy", "Produce", "Meat & Seafood").
- **Flujo:**
    1. El usuario toca una categoría de la cuadrícula (ej. "Produce").
    2. Navega a una nueva pantalla de "Lista de Productos" que muestra todos los artículos de ese pasillo, con opciones de filtrado y ordenamiento.

![Referencia de Pasillos](https://i.imgur.com/83pL3eQ.png)

**5.4. Pestaña "Reabastecer" (Buy it Again)**
- **Objetivo:** Ser la herramienta principal y más rápida para que un negocio reponga su inventario.
- **Diseño:** Una lista de productos comprados anteriormente, optimizada para la acción rápida. Cada fila debe mostrar:
    - Imagen y nombre del producto.
    - La última cantidad comprada (ej. "Última vez: 5 cajas").
    - Un campo de **entrada de cantidad** directo en la fila.
    - Un botón grande para "Agregar al Carrito".
- **Estado Vacío:** Muestra un mensaje amigable y una ilustración. Texto: "Aquí aparecerán tus productos comprados. ¡Haz tu primer pedido para empezar a reabastecer más rápido!" con un CTA para "Explorar Pasillos".

**5.5. Pestaña "Ofertas" (Flyers)**
- **Objetivo:** Centralizar todas las promociones, especialmente las relevantes para B2B como descuentos por volumen.
- **Diseño:** Similar a la pestaña "Tienda", pero enfocada exclusivamente en productos con descuentos, ofertas especiales (ej. "Compra 1, llévate 1 con $X de descuento"), y banners promocionales.

**5.6. Funcionalidad de Búsqueda**
- **Acceso:** Desde la barra de búsqueda en la Navegación Superior.
- **Vista de Búsqueda (Estado Inicial):**
    - Se abre al tocar el buscador.
    - En lugar de una pantalla en blanco, muestra sugerencias para guiar al usuario.
    - **Sugerencias:**
        - Búsquedas Populares (ej. "huevos", "leche", "pan").
        - Categorías sugeridas (ej. "Fruta de temporada").
        - Se presentan como una cuadrícula de imágenes o etiquetas.
- **Vista de Búsqueda (Estado Activo):**
    - A medida que el usuario escribe, los resultados aparecen en tiempo real (con `debounce` de ~300ms).
    - **Cada resultado de la lista debe mostrar:** Imagen, Nombre, Precio y un botón `+` (con la misma funcionalidad de transformación descrita en 5.2).

![Referencia de Búsqueda](https://i.imgur.com/sC5oR8c.png)

### 6. Consideraciones Técnicas (Recomendaciones para Ingeniería)

**6.1. Base de Datos (Supabase)**

Se recomienda revisar y potencialmente ampliar la tabla `products` y crear nuevas tablas para soportar la nueva funcionalidad.

- **Tabla `products` (Sugerencia de columnas):**
  - `id` (uuid)
  - `name` (text)
  - `description` (text)
  - `unit_price` (numeric) - Precio por unidad individual.
  - `case_price` (numeric) - Precio por caja o paquete.
  - `units_per_case` (integer) - Unidades por caja, para cálculo.
  - `old_case_price` (numeric, nullable) - Para ofertas de cajas.
  - `image_url` (text)
  - `stock_status` (enum: 'in_stock', 'low_stock', 'out_of_stock')
  - `is_best_seller` (boolean, default: false)
  - `is_promoted` (boolean, default: false) - Para la sección de ofertas
  - `tags` (text[]) - Para búsqueda flexible (ej. 'orgánico', 'importado', 'alto margen')
  - `aisle_id` (fk a `aisles.id`)
  - `category_id` (fk a `categories.id`)
  - **Índices:** Crear índices GIN/GIST en `name` y `tags` para acelerar la búsqueda de texto.

- **Nueva Tabla `aisles`:**
  - `id` (uuid)
  - `name` (text, ej. "Lácteos y Huevos")
  - `image_url` (text)

- **Nueva Tabla `categories`:**
  - `id` (uuid)
  - `name` (text, ej. "Yogures")
  - `aisle_id` (fk a `aisles.id`)

- **Nueva Tabla `purchase_history`:**
  - `id` (uuid)
  - `user_id` (fk a `auth.users`)
  - `product_id` (fk a `products.id`)
  - `purchase_date` (timestampz)
  - `quantity` (integer)

**6.2. API Endpoints (Sugerencias)**
- `GET /api/shop/home`: Devuelve los datos para los carruseles de la página principal.
- `GET /api/products/search?q=...`: Endpoint para la búsqueda con `debounce`.
- `GET /api/aisles`: Devuelve todas las categorías de pasillos para la cuadrícula.
- `GET /api/aisles/:id/products`: Devuelve los productos de un pasillo específico.
- `GET /api/users/me/purchase-history`: Devuelve el historial de compras del usuario actual.
- `POST /api/cart`: Endpoint para agregar/actualizar/eliminar productos del carrito.

### 7. Requisitos de Ingeniería (MVP)
- **Base de Datos:** Implementar el esquema de DB propuesto.
- **Rutas:** Usar el App Router de Next.js para las rutas de las pestañas (`/shop`, `/aisles`, etc.).
- **Estado del Carrito:** Utilizar un Context de React (`CartContext`) para gestionar el estado del carrito de forma global en el lado del cliente.
- **Componentes:** Construir los componentes reutilizables (`ProductCard`, `QuantityStepper`, etc.) siguiendo la estructura de `src/app/components`.
- **Data Fetching:** Usar React Server Components (RSC) por defecto para obtener los datos de Supabase.
- **Optimización:** Implementar `debounce` en la búsqueda. Asegurar la optimización de imágenes con `next/image`.

### 8. Métricas de Éxito (MVP)
- **Tasa de Adopción:** % de usuarios activos que ingresan a la nueva sección.
- **Engagement:** El 80% de los usuarios que entran utilizan la función de "Reabastecer".
- **Conversión a Carrito:** El 70% de las sesiones en la sección resultan en un carrito con un valor superior a [definir monto, ej. $2,000 MXN].
- **Métrica de Eficiencia:** El tiempo promedio para completar un pedido de reabastecimiento (usando la pestaña "Reabastecer") es menor a 10 minutos.
- **Performance:**
    - Tiempo de respuesta del buscador < 300ms.
    - Largest Contentful Paint (LCP) de la pestaña "Reabastecer" < 2.5s.

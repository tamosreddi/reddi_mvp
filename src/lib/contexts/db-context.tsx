// Para definir las tablas en Supabase y que Crusor tenga contexto de las tablas

// Para definir las tablas en Supabase y que Cursor tenga contexto de las tablas

export const databaseSchema = {
    user: {
        user_id: "UUID - Identificador único del usuario, debe ser igual al ID en auth.users.",
        created_at: "Timestamp con zona horaria - Fecha de creación del perfil.",
        updated_at: "Timestamp con zona horaria - Fecha en la que hubo actualización.",
        name: "Texto - Nombre del usuario.",
        email: "Texto - Correo electrónico del usuario.",
        phone: "Texto - Teléfono del usuario.",
        rfc: "Texto - RFC del usuario para identificación fiscal.",
        country: "Texto - Ubicación del usuario (Mexico por defecto).",
        region: "Texto - Región del usuario.",
        is_active: "Booleano - Estado del usuario (activo/inactivo).",
        last_name: "Texto - Apellido del usuario."
    },
    stores: {
        store_id: "UUID - Identificador único de la tienda.",
        user_id: "UUID - Identificador del dueño de la tienda, enlazado a la tabla user.",
        store_name: "Texto - Nombre de la tienda (ej. Tienda Doña María).",
        store_address: "Texto - Dirección física de la tienda.",
        store_category: "Texto - Categoría de la tienda (ej. abarrotes, papelería).",
        store_phone: "Texto - Número de teléfono de contacto.",
        store_email: "Texto - Correo electrónico de contacto.",
        is_active: "Booleano - Estado de la tienda (activa/inactiva).",
        created_at: "Timestamp con zona horaria - Fecha de creación del registro.",
        updated_at: "Timestamp con zona horaria - Fecha de la última actualización del registro."
    },
    transactions: {
        transaction_id: "UUID - Identificador único de la transacción.",
        user_id: "UUID - Usuario que registró la transacción.",
        store_id: "UUID - Tienda asociada a la transacción.",
        transaction_type: "Texto - Tipo de transacción (ej. sale, expense).",
        transaction_description: "Texto - Descripción adicional de la transacción.",
        stakeholder_id: "UUID - Cliente o proveedor involucrado, si aplica.",
        payment_method: "Texto - Método de pago utilizado.",
        transaction_subtype: "Texto - Subtipo del evento, si es necesario. Ej. Renta, Gas, Luz.",
        advance_payment: "NUMERIC - Monto de anticipo, si aplica.",
        transaction_date: "TIMESTAMPTZ - Fecha efectiva de la transacción.",
        created_at: "TIMESTAMPTZ - Fecha de creación del registro.",
        updated_at: "TIMESTAMPTZ - Fecha de última actualización.",
        is_paid: "Booleano - Indica si la transacción fue pagada.",
        stakeholder_type: "Texto - Tipo de stakeholder ('client' o 'supplier').",
        total_amount: "NUMERIC - Monto total de la transacción, calculado como la suma de los items en transaction_items."
     },
      transaction_items: {
        transaction_item_id: "UUID - Identificador único del producto en la transacción.",
        transaction_id: "UUID - Relación con la transacción general (venta, compra, etc.).",
        product_reference_id: "UUID - Referencia al producto vendido/comprado (puede ser global o personalizado).",
        product_type: "TEXT - Indica si el producto es 'global' (de tabla products) o 'custom' (de tabla store_products).",
        quantity: "NUMERIC - Cantidad de unidades involucradas en la transacción.",
        unit_price: "NUMERIC - Precio unitario del producto en esta transacción.",
        created_at: "TIMESTAMPTZ - Fecha de creación del registro.",
        updated_at: "TIMESTAMPTZ - Fecha de última actualización.",
        store_id: "UUID - Referencia a la tienda propietaria de la transacción. Relación con la tabla stores.",
        total_amount: "NUMERIC - Monto total del producto en esta transacción (unit_price * quantity)."
    },
    products: {
        product_id: "UUID - Identificador único del producto.",
        sku: "VARCHAR - Código único del producto (ej. código de barras).",
        name: "TEXT - Nombre del producto.",
        description: "TEXT - Descripción del producto.",
        brand: "TEXT - Marca del producto.",
        image: "TEXT - URL de la imagen del producto.",
        category: "TEXT - Categoría del producto (ej. bebidas, snacks, limpieza).",
        distributor_id: "UUID - Referencia al distribuidor que provee el producto, si aplica.",
        barcode: "VARCHAR - Código de barras del producto.",
        created_at: "TIMESTAMPTZ - Fecha de creación del producto.",
        updated_at: "TIMESTAMPTZ - Fecha de la última actualización del producto."
    },
    store_inventory: {
        inventory_id: "UUID - Identificador único del registro de inventario.",
        store_id: "UUID - Referencia a la tienda propietaria del inventario.",
        product_reference_id: "UUID - Referencia única al producto, puede ser global (products) o personalizado (store_products).",
        product_type: "Texto - Tipo de producto, puede ser global (products) o custom (store_products).",
        quantity: "NUMERIC - Cantidad disponible del producto.",
        unit_price: "NUMERIC - Precio unitario para la tienda.",
        name_alias: "TEXT - Nombre alternativo del producto para la tienda. Si está presente, se muestra este nombre en vez del nombre original del producto.",
        unit_cost: "NUMERIC - Costo unitario del producto.",
        min_stock: "NUMERIC - Mínima cantidad antes de alertar al usuario.",
        expiration_date: "TIMESTAMPTZ - Fecha de expiración del producto, si aplica.",
        last_change: "TIMESTAMPTZ - Fecha del último cambio de inventario.",
        created_at: "TIMESTAMPTZ - Fecha de creación del registro.",
        updated_at: "TIMESTAMPTZ - Fecha de la última actualización del registro."
    },
    distributors: {
        distributor_id: "UUID - Identificador único del distribuidor.",
        name: "TEXT - Nombre del distribuidor.",
        contact_info: "JSONB - Información de contacto del distribuidor (ej. teléfono, email).",
        is_active: "BOOLEAN - Estado del distribuidor (activo/inactivo).",
        created_at: "TIMESTAMPTZ - Fecha de creación del registro.",
        updated_at: "TIMESTAMPTZ - Fecha de la última actualización del registro."
    },
    store_products: {
        store_product_id: "UUID - Identificador único del producto personalizado.",
        store_id: "UUID - Referencia a la tienda propietaria del producto.",
        name: "TEXT - Nombre del producto personalizado.",
        description: "TEXT - Descripción del producto personalizado.",
        brand: "TEXT - Marca del producto personalizado, si aplica.",
        category: "TEXT - Categoría del producto (ej. alimentos, bebidas, panadería).",
        barcode: "VARCHAR - Código de barras del producto personalizado, si aplica.",
        created_at: "TIMESTAMPTZ - Fecha de creación del producto.",
        updated_at: "TIMESTAMPTZ - Fecha de la última actualización del producto."
    },
    clients: {
        client_id: "UUID - Identificador único del cliente.",
        store_id: "UUID - Referencia a la tienda propietaria del cliente.",
        name: "VARCHAR - Nombre del cliente.",
        gender: "VARCHAR - Género del cliente, si se quiere registrar.",
        age: "VARCHAR - Edad o rango de edad del cliente, si se quiere registrar.",
        email: "VARCHAR - Correo electrónico del cliente, si se quiere registrar.",
        phone: "VARCHAR - Número de teléfono del cliente, si se quiere registrar.",
        address: "TEXT - Dirección del cliente, si se quiere registrar.",
        created_at: "TIMESTAMPTZ - Fecha de creación del cliente.",
        updated_at: "TIMESTAMPTZ - Fecha de la última actualización del registro del cliente.",
        notes: "TEXT - Notas adicionales sobre el cliente, si se quiere registrar.",
        is_active: "BOOLEAN - Estado del cliente (activo/inactivo)."
    }
};


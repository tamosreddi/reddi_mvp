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
        transaction_id: "UUID - Identificador único para cada evento.",
        user_id: "UUID - Usuario que registró el evento, relación con la tabla user.",
        store_id: "UUID - Tienda asociada al evento, relación con la tabla stores.",
        transaction_type: "Texto - Tipo de evento (expense, income, refund, sale, purchase).",
        quantity: "Decimal - Cantidad de artículos involucrados en el evento.",
        value: "Decimal - Precio unitario del artículo.",
        total_amount: "Decimal - Monto total calculado automáticamente (quantity * unit_amount).",
        transaction_description: "Texto - Descripción opcional del evento.",
        stakeholder_id: "UUID - Identificador único del proveedor o cliente, si aplica.",
        sku_id: "UUID - Identificador único del producto, si aplica.",
        payment_method: "Texto - Método de pago (cash, card, transfer).",
        is_paid: "Booleano - Indica si el evento ha sido pagado.",
        transaction_subtype: "Texto - Subtipo del evento, si es necesario.",
        advance_payment: "Decimal - Pago adelantado, si aplica.",
        created_by: "UUID - Usuario que creó el evento, relación con la tabla user.",
        transaction_date: "Timestamp con zona horaria - Fecha del evento.",
        created_at: "Timestamp con zona horaria - Fecha de creación del registro.",
        updated_at: "Timestamp con zona horaria - Fecha de la última actualización del registro."
    },
    products: {
        product_id: "UUID - Identificador único del producto.",
        sku: "VARCHAR - Código único del producto (ej. código de barras).",
        name: "TEXT - Nombre del producto.",
        description: "TEXT - Descripción del producto.",
        brand: "TEXT - Marca del producto.",
        category: "TEXT - Categoría del producto (ej. bebidas, snacks, limpieza).",
        distributor_id: "UUID - Referencia al distribuidor que provee el producto, si aplica.",
        created_at: "TIMESTAMPTZ - Fecha de creación del producto.",
        updated_at: "TIMESTAMPTZ - Fecha de la última actualización del producto."
    },
    store_inventory: {
        inventory_id: "UUID - Identificador único del registro de inventario.",
        store_id: "UUID - Referencia a la tienda propietaria del inventario.",
        product_id: "UUID - Referencia al producto del catálogo global, si aplica.",
        store_product_id: "UUID - Referencia al producto personalizado de la tienda, si aplica.",
        quantity: "NUMERIC - Cantidad disponible del producto.",
        unit_price: "NUMERIC - Precio unitario para la tienda.",
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
        unit_price: "NUMERIC - Precio unitario del producto personalizado.",
        created_at: "TIMESTAMPTZ - Fecha de creación del producto.",
        updated_at: "TIMESTAMPTZ - Fecha de la última actualización del producto."
    }
};


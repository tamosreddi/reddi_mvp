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
        unit_amount: "Decimal - Precio unitario del artículo.",
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
    }
};


// Para definir las tablas en Supabase y que Crusor tenga contexto de las tablas

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
    }
};

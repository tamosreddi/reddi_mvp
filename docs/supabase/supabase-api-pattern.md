# Patrón para llamadas seguras y consistentes a Supabase desde API Routes en Next.js

## Contexto

Cuando usamos Supabase con Row Level Security (RLS) activado, **todas las operaciones de escritura/lectura protegidas deben ser autenticadas**.  
Esto significa que el backend (API route) debe saber quién es el usuario que hace la petición.

Además, es fundamental mantener un **estándar consistente** para inicializar el cliente de Supabase, manejar errores y validar los datos, para que el código sea fácil de mantener y seguro.

---

## Reglas y Estándares

### 1. **Siempre inicializa el cliente de Supabase de forma consistente**

- **Para endpoints protegidos por RLS (la mayoría):**
  - El frontend debe enviar el token del usuario autenticado en el header `Authorization`.
  - El backend debe recuperar ese token y usarlo al crear el cliente de Supabase.
  - Si no hay token, rechaza la petición.

  ```ts
  // En el handler de la API Route:
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ success: false, message: "No token provided" }, { status: 401 });
  }
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader } } }
  );
  ```

- **Para endpoints internos, administrativos o sin RLS (ejemplo: tareas de sistema, migraciones, etc):**
  - Usa la `SUPABASE_SERVICE_ROLE_KEY` **solo en el backend** y nunca la expongas al frontend.
  - Ejemplo:
    ```ts
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    ```

### 2. **Valida SIEMPRE los parámetros de entrada**

- Antes de hacer cualquier operación, valida que los parámetros requeridos estén presentes y sean del tipo correcto.
- Si falta algún parámetro, responde con un error 400 claro.

  ```ts
  if (!productId || !storeId) {
    return NextResponse.json({ error: 'Missing productId or storeId' }, { status: 400 });
  }
  ```

### 3. **Manejo de errores de Supabase**

- Siempre revisa el objeto `error` después de cada operación con Supabase.
- Si hay error, responde con un mensaje claro y el status HTTP adecuado (500 para errores internos, 404 si no se encuentra el recurso, etc).
- Loguea los errores relevantes para debugging.

  ```ts
  const { data, error } = await supabase.from('tabla').select('*').single();
  if (error) {
    console.error('Supabase Error:', error);
    return NextResponse.json({ error: 'No se pudo cargar el recurso' }, { status: 500 });
  }
  ```

### 4. **Estructura de respuesta estándar**

- Devuelve siempre objetos JSON con claves claras: `{ success, data, error }` o `{ error }` si falla.
- Para operaciones exitosas, incluye los datos relevantes.
- Para errores, incluye un mensaje útil para el frontend.

### 5. **Nunca expongas claves sensibles**

- **Nunca** expongas la `SUPABASE_SERVICE_ROLE_KEY` ni ninguna clave privada en el frontend o en endpoints públicos.
- Usa variables de entorno correctamente y documenta cuáles son necesarias.

### 6. **Ejemplo completo (basado en API de inventario)**

```ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  // 1. Recupera y valida el token
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "No token provided" }, { status: 401 });
  }
  // 2. Inicializa el cliente de Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader } } }
  );
  // 3. Valida parámetros
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');
  const storeId = searchParams.get('storeId');
  if (!productId || !storeId) {
    return NextResponse.json({ error: 'Missing productId or storeId' }, { status: 400 });
  }
  // 4. Lógica de negocio y manejo de errores
  const { data, error } = await supabase
    .from('store_inventory')
    .select('*')
    .eq('inventory_id', productId)
    .eq('store_id', storeId)
    .single();
  if (error || !data) {
    return NextResponse.json({ error: 'No se pudo cargar el producto' }, { status: 404 });
  }
  // 5. Respuesta estándar
  return NextResponse.json({ success: true, product: data });
}
```

---

## Checklist para conectar con Supabase en una API Route

- [ ] ¿Estás usando el cliente de Supabase correcto según el tipo de endpoint?
- [ ] ¿Validas todos los parámetros de entrada antes de hacer queries?
- [ ] ¿Manejas y logueas los errores de Supabase?
- [ ] ¿Nunca expones claves sensibles?
- [ ] ¿La respuesta tiene una estructura clara y estándar?
- [ ] ¿El código es fácil de leer y mantener?

---

## Referencias

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/api-routes)
- [Ejemplo real: API de inventario](../../src/app/api/inventario/detail-view/route.ts)

---

**¡IMPORTANTE!**  
Nunca expongas la `SUPABASE_SERVICE_ROLE_KEY` en el frontend ni la uses en endpoints públicos.

---

## ¿Por qué seguir este patrón?

- Permite que Supabase aplique correctamente las políticas de RLS y sepa quién hace la petición.
- Hace el código más seguro, mantenible y fácil de auditar.
- Facilita el debugging y la colaboración entre desarrolladores.
- Evita errores y vulnerabilidades comunes.
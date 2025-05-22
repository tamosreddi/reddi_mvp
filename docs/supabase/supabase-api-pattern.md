# Patrón para llamadas seguras a Supabase desde API Routes en Next.js

## Contexto

Cuando usamos Supabase con Row Level Security (RLS) activado, **todas las operaciones de escritura/lectura protegidas deben ser autenticadas**.  
Esto significa que el backend (API route) debe saber quién es el usuario que hace la petición.

## Regla

**Siempre que una API route de Next.js deba modificar o leer datos protegidos por RLS en Supabase:**

1. **El frontend debe enviar el token del usuario autenticado** en el header `Authorization`:
   ```js
   fetch('/api/mi-endpoint', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       Authorization: `Bearer ${session.access_token}`
     },
     body: JSON.stringify({ ... })
   })
   ```

2. **El backend debe recuperar ese token y usarlo al crear el cliente de Supabase:**
   ```ts
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

3. **El backend debe rechazar la petición si no hay token.**

## Ejemplo de uso

Ver `/src/app/api/ventas/actualizar-descripcion/route.ts` y `/src/components/ventas/sale-confirmation.tsx` para un ejemplo completo.

---

**¡IMPORTANTE!**  
Nunca expongas la `SUPABASE_SERVICE_ROLE_KEY` en el frontend ni la uses en endpoints públicos.

---

## ¿Por qué?

- Así Supabase puede aplicar correctamente las políticas de RLS y saber quién está haciendo la petición.
- Es la forma recomendada por Supabase y Next.js para apps seguras y escalables.

---

## Referencias

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/api-routes)
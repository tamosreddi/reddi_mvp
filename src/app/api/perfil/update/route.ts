import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Inicializa el cliente de Supabase con variables de entorno
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, name, lastName, phone, storeId, storeName } = body

    if (!userId) {
      return NextResponse.json({ error: 'Falta userId' }, { status: 400 })
    }

    // Actualiza el perfil del usuario
    const { error: userError } = await supabase
      .from('user')
      .update({
        name,
        last_name: lastName,
        phone: phone || null,
      })
      .eq('user_id', userId)

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 })
    }

    // Actualiza el nombre de la tienda si se provee storeId y storeName
    if (storeId && storeName) {
      const { error: storeError } = await supabase
        .from('stores')
        .update({ store_name: storeName })
        .eq('store_id', storeId)
      if (storeError) {
        return NextResponse.json({ error: storeError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error inesperado' }, { status: 500 })
  }
}

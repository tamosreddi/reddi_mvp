import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { description, store_id, user_id, lost_sale_date } = body

    if (!description || !store_id || !user_id || !lost_sale_date) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos obligatorios: description, store_id, user_id y lost_sale_date' }, 
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('lost_sales')
      .insert({
        description,
        store_id,
        user_id,
        lost_sale_date,
        // product_reference_id y product_type son opcionales, así que no los incluimos por ahora
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

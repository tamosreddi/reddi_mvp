import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, notes, store_id } = body
    if (!name || !store_id) {
      return NextResponse.json({ success: false, error: 'Faltan campos obligatorios: name y store_id' }, { status: 400 })
    }
    const { data, error } = await supabase
      .from('suppliers')
      .insert({ name, notes, store_id })
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

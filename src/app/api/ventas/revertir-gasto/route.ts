import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { transaction_id, store_id } = await req.json()
    if (!transaction_id || !store_id) {
      return NextResponse.json({ success: false, error: 'transaction_id y store_id requeridos' }, { status: 400 })
    }

    // 1. Eliminar los transaction_items relacionados
    await supabase
      .from('transaction_items')
      .delete()
      .eq('transaction_id', transaction_id)

    // 2. Eliminar la transacción de gastos
    await supabase
      .from('transactions')
      .delete()
      .eq('transaction_id', transaction_id)

    // 3. (Opcional) Si el gasto afectó inventario, aquí iría la lógica para revertir inventario
    // Por ahora, asumimos que los gastos no afectan inventario

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Error al revertir gasto:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

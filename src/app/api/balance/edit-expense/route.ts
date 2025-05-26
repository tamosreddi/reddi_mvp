import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      transaction_id,
      transaction_date,
      is_paid,
      transaction_description,
      stakeholder_id,
      stakeholder_type,
      payment_method,
      total_amount,
      transaction_subtype
    } = body
    if (!transaction_id) {
      return NextResponse.json({ success: false, error: 'transaction_id requerido' }, { status: 400 })
    }

    // Actualizar la transacción (gasto)
    const { error: txError } = await supabase
      .from('transactions')
      .update({
        transaction_date,
        is_paid,
        transaction_description,
        stakeholder_id,
        stakeholder_type,
        payment_method,
        total_amount,
        transaction_subtype,
        updated_at: new Date().toISOString(),
      })
      .eq('transaction_id', transaction_id)
    if (txError) throw txError

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Error al editar gasto:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
} 
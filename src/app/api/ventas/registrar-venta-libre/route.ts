// PARA REGISTRAR VENTA DE PRODUCTOS LIBRE

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    // Extraer y validar los datos necesarios
    const {
      user_id,
      store_id,
      transaction_type,
      transaction_subtype,
      transaction_description,
      payment_method,
      transaction_date,
      stakeholder_id,
      stakeholder_type,
      is_paid,
      total_amount
    } = data

    if (!user_id || !store_id || !transaction_type || !transaction_subtype || !payment_method || !transaction_date || typeof total_amount !== 'number') {
      return NextResponse.json({ success: false, error: 'Payload incompleto o inválido' }, { status: 400 })
    }

    // Insertar la transacción en la tabla 'transactions'
    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert([
        {
          user_id,
          store_id,
          transaction_type,
          transaction_subtype,
          transaction_description,
          payment_method,
          transaction_date,
          stakeholder_id: stakeholder_id || null,
          stakeholder_type: stakeholder_type || null,
          is_paid,
          total_amount,
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, transaction })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Error inesperado' }, { status: 500 })
  }
}


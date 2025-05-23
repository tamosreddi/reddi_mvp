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
      products // [{ product_reference_id, product_type, quantity, unit_price, product_name }]
    } = body
    if (!transaction_id) {
      return NextResponse.json({ success: false, error: 'transaction_id requerido' }, { status: 400 })
    }

    // 1. Actualizar la transacción
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
        updated_at: new Date().toISOString(),
      })
      .eq('transaction_id', transaction_id)
    if (txError) throw txError

    // 2. Eliminar los transaction_items actuales
    await supabase
      .from('transaction_items')
      .delete()
      .eq('transaction_id', transaction_id)

    // 3. Insertar los nuevos transaction_items
    if (Array.isArray(products) && products.length > 0) {
      const itemsToInsert = products.map(p => ({
        transaction_id,
        product_reference_id: p.product_reference_id,
        product_type: p.product_type,
        quantity: p.quantity,
        unit_price: p.unit_price,
        product_name: p.product_name,
        total_amount: Number(p.unit_price) * Number(p.quantity),
        store_id: p.store_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))
      await supabase.from('transaction_items').insert(itemsToInsert)
    }

    // 4. (Opcional) Ajustar inventario si cambian los productos/cantidades
    // Aquí podrías comparar los productos originales vs los nuevos y ajustar store_inventory/inventory_batches
    // Por ahora, omite esta lógica o implementa un TODO

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Error al editar venta:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

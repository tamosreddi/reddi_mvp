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

    // 2. Eliminar e insertar transaction_items SOLO si products viene definido y tiene al menos un elemento
    if (Array.isArray(products) && products.length > 0) {
      // Validar que todos los productos tengan los campos requeridos
      const allValid = products.every(p =>
        p.product_reference_id !== undefined &&
        p.product_type !== undefined &&
        p.quantity !== undefined &&
        p.unit_price !== undefined &&
        p.product_name !== undefined &&
        p.store_id !== undefined
      );
      if (!allValid) {
        return NextResponse.json({ success: false, error: 'Todos los productos deben tener los campos requeridos.' }, { status: 400 });
      }

      // Eliminar los transaction_items actuales
      await supabase
        .from('transaction_items')
        .delete()
        .eq('transaction_id', transaction_id)

      // Insertar los nuevos transaction_items
      const itemsToInsert = products.map(p => ({
        transaction_id,
        product_reference_id: p.product_reference_id,
        product_type: p.product_type,
        quantity: p.quantity,
        unit_price: p.unit_price,
        product_name: p.product_name,
        store_id: p.store_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))
      const { error: insertError } = await supabase.from('transaction_items').insert(itemsToInsert)
      if (insertError) {
        return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
      }
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

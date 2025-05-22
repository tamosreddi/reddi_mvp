import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { transaction_id, store_id } = await req.json()
    if (!transaction_id || !store_id) {
      return NextResponse.json({ success: false, error: 'transaction_id y store_id requeridos' }, { status: 400 })
    }

    // 1. Obtener todos los transaction_items
    const { data: items, error: itemsError } = await supabase
      .from('transaction_items')
      .select('product_reference_id, product_type, quantity')
      .eq('transaction_id', transaction_id)
    if (itemsError) throw itemsError

    // 2. Por cada producto, devolver la cantidad al batch más reciente
    for (const item of items) {
      // Buscar batch más reciente
      const { data: batches } = await supabase
        .from('inventory_batches')
        .select('batch_id, quantity_remaining, unit_cost, received_date')
        .eq('product_reference_id', item.product_reference_id)
        .eq('store_id', store_id)
        .order('received_date', { ascending: false })
        .limit(1)
      if (batches && batches.length > 0) {
        // Hay batch activo, sumar la cantidad
        const batch = batches[0]
        const newQty = Number(batch.quantity_remaining) + Number(item.quantity)
        await supabase
          .from('inventory_batches')
          .update({ quantity_remaining: newQty })
          .eq('batch_id', batch.batch_id)
      } else {
        // No hay batch activo, crear uno nuevo
        await supabase
          .from('inventory_batches')
          .insert({
            store_id,
            product_reference_id: item.product_reference_id,
            product_type: item.product_type,
            quantity_received: item.quantity,
            quantity_remaining: item.quantity,
            unit_cost: 0, // No sabemos el costo, se puede mejorar
            received_date: new Date().toISOString(),
            expiration_date: null,
          })
      }
      // Actualizar store_inventory.quantity
      const { data: inv } = await supabase
        .from('store_inventory')
        .select('quantity')
        .eq('product_reference_id', item.product_reference_id)
        .eq('store_id', store_id)
        .single()
      if (inv) {
        const newInvQty = Number(inv.quantity) + Number(item.quantity)
        await supabase
          .from('store_inventory')
          .update({ quantity: newInvQty })
          .eq('product_reference_id', item.product_reference_id)
          .eq('store_id', store_id)
      }
    }

    // 3. Eliminar los transaction_items
    await supabase
      .from('transaction_items')
      .delete()
      .eq('transaction_id', transaction_id)

    // 4. Eliminar la transacción
    await supabase
      .from('transactions')
      .delete()
      .eq('transaction_id', transaction_id)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Error al revertir venta:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
} 
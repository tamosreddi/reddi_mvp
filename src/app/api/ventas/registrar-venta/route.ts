import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Inicializa el cliente de Supabase usando variables de entorno
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    // Validación básica del payload
    const { storeId, userId, paymentMethod, total, date, customer, items } = data
    if (!storeId || !userId || !paymentMethod || !total || !date || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Payload incompleto o inválido' }, { status: 400 })
    }

    // 1. Insertar la transacción
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert([
        {
          store_id: storeId,
          user_id: userId,
          payment_method: paymentMethod,
          total_amount: total,
          transaction_date: date,
          stakeholder_id: customer?.id || null,
          stakeholder_type: customer ? 'client' : null,
          transaction_type: 'sale',
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single()

    if (transactionError) {
      return NextResponse.json({ success: false, error: transactionError.message }, { status: 500 })
    }

    // 2. Insertar los productos vendidos en transaction_items
    const transactionItemsPayload = items.map((item: any) => ({
      transaction_id: transaction.transaction_id,
      product_reference_id: item.productId,
      product_type: item.productType,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      store_id: storeId,
      total_amount: item.unitPrice * item.quantity,
      created_at: new Date().toISOString(),
    }))

    const { data: transactionItems, error: transactionItemsError } = await supabase
      .from('transaction_items')
      .insert(transactionItemsPayload)
      .select()

    if (transactionItemsError) {
      return NextResponse.json({ success: false, error: transactionItemsError.message }, { status: 500 })
    }

    // 3. Por cada producto vendido, asignar batches y registrar en transaction_item_batches
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      let quantityToSell = item.quantity;
      // Obtener batches activos (FIFO)
      const { data: batches, error: batchesError } = await supabase
        .from('inventory_batches')
        .select('batch_id, quantity_remaining')
        .eq('product_reference_id', item.productId)
        .eq('store_id', storeId)
        .gt('quantity_remaining', 0)
        .order('received_date', { ascending: true });
      if (batchesError) {
        return NextResponse.json({ success: false, error: `Error obteniendo batches para producto ${item.productId}: ${batchesError.message}` }, { status: 500 })
      }
      for (const batch of batches) {
        if (quantityToSell <= 0) break;
        const used = Math.min(Number(batch.quantity_remaining), quantityToSell);
        // 1. Registrar en transaction_item_batches
        const { error: tibError } = await supabase
          .from('transaction_item_batches')
          .insert([
            {
              transaction_item_id: transactionItems[i].transaction_item_id,
              batch_id: batch.batch_id,
              quantity_used: used,
              created_at: new Date().toISOString(),
            }
          ]);
        if (tibError) {
          return NextResponse.json({ success: false, error: `Error registrando uso de batch: ${tibError.message}` }, { status: 500 })
        }
        // 2. Actualizar el batch (restar quantity_remaining)
        const { error: updateBatchError } = await supabase
          .from('inventory_batches')
          .update({ quantity_remaining: Number(batch.quantity_remaining) - used })
          .eq('batch_id', batch.batch_id);
        if (updateBatchError) {
          return NextResponse.json({ success: false, error: `Error actualizando batch: ${updateBatchError.message}` }, { status: 500 })
        }
        quantityToSell -= used;
      }
      if (quantityToSell > 0) {
        return NextResponse.json({ success: false, error: `No hay suficiente inventario para el producto ${item.productId}` }, { status: 400 })
      }
      // 4. Actualizar store_inventory.quantity para este producto
      const { data: updatedBatches } = await supabase
        .from('inventory_batches')
        .select('quantity_remaining')
        .eq('product_reference_id', item.productId)
        .eq('store_id', storeId)
        .gt('quantity_remaining', 0);
      const newQuantity = updatedBatches
        ? updatedBatches.reduce((sum, b) => sum + Number(b.quantity_remaining), 0)
        : 0;
      const { error: updateInventoryQtyError } = await supabase
        .from('store_inventory')
        .update({ quantity: newQuantity })
        .eq('store_id', storeId)
        .eq('product_reference_id', item.productId);
      if (updateInventoryQtyError) {
        return NextResponse.json({ success: false, error: `Error actualizando cantidad total en inventario: ${updateInventoryQtyError.message}` }, { status: 500 })
      }
    }

    // Por ahora responde con los IDs de la transacción y los items creados
    return NextResponse.json({
      success: true,
      transactionId: transaction.transaction_id,
      transactionItemIds: transactionItems.map((ti: any) => ti.transaction_item_id)
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Error inesperado' }, { status: 500 })
  }
}

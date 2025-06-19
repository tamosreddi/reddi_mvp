// Creado para registrar VENTA DE PRODUCTOS de inventario

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Inicializa el cliente de Supabase usando variables de entorno
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    // Validación básica del payload
    const { storeId, userId, paymentMethod, total, date, customer, items } = data
    if (!storeId || !userId || !paymentMethod || total === undefined || !date || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Payload incompleto o inválido' }, { status: 400 })
    }

    const totalAmount = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

    // 0. Para cada producto global o custom vendido, si no está en store_inventory, agrégalo; si ya está y el precio cambió, actualiza unit_price
    for (const item of items) {
      if (item.productType === "global" || item.productType === "custom") {
        // Verifica si ya existe en store_inventory
        const { data: existing, error: existError } = await supabase
          .from("store_inventory")
          .select("inventory_id, unit_price, is_active")
          .eq("store_id", storeId)
          .eq("product_reference_id", item.productId)
          .maybeSingle();

        if (!existing) {
          // Insertar nuevo registro en store_inventory (incluso si el precio es 0)
          const { error: insertError } = await supabase
            .from("store_inventory")
            .insert({
              store_id: storeId,
              product_reference_id: item.productId,
              product_type: item.productType,
              quantity: 0,
              unit_price: item.unitPrice || 0, // Asegurarnos que si es undefined sea 0
              created_at: new Date().toISOString(),
              is_active: true
            });
          if (insertError) {
            return NextResponse.json({ success: false, error: `Error agregando producto a inventario: ${insertError.message}` }, { status: 500 })
          }
        } else {
          // Si existe pero está inactivo, reactivarlo
          if (!existing.is_active) {
            const { error: reactivateError } = await supabase
              .from("store_inventory")
              .update({ is_active: true })
              .eq("inventory_id", existing.inventory_id);
            if (reactivateError) {
              return NextResponse.json({ success: false, error: `Error reactivando producto en inventario: ${reactivateError.message}` }, { status: 500 })
            }
          }
          // Si el precio es diferente (incluso si alguno es 0), actualizarlo
          if (existing.unit_price !== item.unitPrice) {
            const { error: updateError } = await supabase
              .from("store_inventory")
              .update({ unit_price: item.unitPrice || 0 })
              .eq("inventory_id", existing.inventory_id);
            if (updateError) {
              return NextResponse.json({ success: false, error: `Error actualizando precio en inventario: ${updateError.message}` }, { status: 500 })
            }
          }
        }
      }
    }

    // 1. Insertar la transacción
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert([
        {
          store_id: storeId,
          user_id: userId,
          payment_method: paymentMethod,
          transaction_date: date,
          stakeholder_id: customer?.id || null,
          stakeholder_type: customer ? 'client' : null,
          transaction_type: 'sale',
          transaction_subtype: 'products-sale',
          total_amount: totalAmount,
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single()

    if (transactionError) {
      return NextResponse.json({ success: false, error: transactionError.message }, { status: 500 })
    }

    // 2. Insertar los productos vendidos en transaction_items (con product_name)
    const transactionItemsPayload = [];
    for (const item of items) {
      if (item.productType === "free-sale") {
        // Venta libre: no buscar nombre ni batches
        transactionItemsPayload.push({
          transaction_id: transaction.transaction_id,
          product_reference_id: null,
          product_type: "free-sale",
          quantity: 1,
          unit_price: item.unitPrice,
          store_id: storeId,
          created_at: new Date().toISOString(),
          product_name: item.productName || item.name || "Venta libre"
        });
      } else {
        // Usar el nombre que viene del frontend
        transactionItemsPayload.push({
          transaction_id: transaction.transaction_id,
          product_reference_id: item.productId,
          product_type: item.productType,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          store_id: storeId,
          created_at: new Date().toISOString(),
          product_name: item.productName || "" // Usar el nombre que viene del frontend
        });
      }
    }

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
      // Saltar lógica de batches/inventario para ventas libres
      if (item.productType === "free-sale") continue;
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

      // Registrar la venta sin validar cantidad disponible
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

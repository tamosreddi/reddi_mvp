import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const productId = searchParams.get('productId')
  const storeId = searchParams.get('storeId')

  console.log('API DETAIL VIEW:', { productId, storeId });

  if (!productId || !storeId) {
    return NextResponse.json({ error: 'Missing productId or storeId' }, { status: 400 })
  }

  // 1. Obtener inventario
  const { data: inventory, error: invError } = await supabase
    .from('store_inventory')
    .select('*')
    .eq('inventory_id', productId) //Buscar por inventory_id
    .eq('store_id', storeId)
    .single()

  console.log('INVENTORY RESULT:', { inventory, invError });

  console.log('Supabase Query Details:', {
    table: 'store_inventory',
    columns: '*',
    filters: {
      inventory_id: productId,
      store_id: storeId
    }
  });

  if (invError) {
    console.error('Supabase Error Details:', {
      code: invError.code,
      message: invError.message,
      details: invError.details
    });
  }


  if (invError || !inventory) {
    return NextResponse.json({ error: 'No se pudo cargar el producto' }, { status: 404 })
  }

  let productData = {
    id: inventory.inventory_id,
    store_product_id: '',
    name: '',
    name_alias: inventory.name_alias || '',
    category: '',
    barcode: '',
    description: '',
    quantity: inventory.quantity,
    price: inventory.unit_price,
    cost: inventory.unit_cost || 0,
    product_type: inventory.product_type,
    image: '/Groserybasket.png', // Imagen por defecto
  }

  // 2. Dependiendo del tipo, consulta la tabla correspondiente
  if (inventory.product_type === 'global') {
    const { data: globalProduct, error: globalError } = await supabase
      .from('products')
      .select('name, category, barcode, description')
      .eq('product_id', inventory.product_reference_id)
      .single()
    console.log('GLOBAL PRODUCT:', { globalProduct, globalError });
    if (globalProduct) {
      productData = {
        ...productData,
        name: globalProduct.name || '',
        category: globalProduct.category || '',
        barcode: globalProduct.barcode || '',
        description: globalProduct.description || '',
      }
    }
  } else if (inventory.product_type === 'custom') {
    const { data: customProduct } = await supabase
      .from('store_products')
      .select('store_product_id, name, category, barcode, description, image')
      .eq('store_product_id', inventory.product_reference_id)
      .single()
    console.log('CUSTOM PRODUCT:', { customProduct });
    if (customProduct) {
      productData = {
        ...productData,
        store_product_id: customProduct.store_product_id,
        name: customProduct.name || '',
        category: customProduct.category || '',
        barcode: customProduct.barcode || '',
        description: customProduct.description || '',
        image: customProduct.image || '/Groserybasket.png',
      }
    }
  }

  // 3. Obtener batches activos para este producto y tienda
  const { data: batches, error: batchFetchError } = await supabase
    .from('inventory_batches')
    .select('batch_id, quantity_remaining, unit_cost, received_date')
    .eq('product_reference_id', inventory.product_reference_id)
    .eq('store_id', storeId)
    .gt('quantity_remaining', 0)
    .order('received_date', { ascending: true })
  console.log('BATCHES RESULT:', { batches, batchFetchError });

  // 4. Calcular el costo promedio si hay batches
  if (batches && batches.length > 0) {
    const totalCost = batches.reduce((sum, b) => sum + Number(b.unit_cost) * Number(b.quantity_remaining), 0)
    const totalQty = batches.reduce((sum, b) => sum + Number(b.quantity_remaining), 0)
    productData.cost = totalQty > 0 ? totalCost / totalQty : 0
  }

  return NextResponse.json({ product: productData, batches: batches || [] })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { product, storeId } = body;
    if (!product || !storeId) {
      return NextResponse.json({ error: 'Missing product or storeId' }, { status: 400 });
    }
    let error = null;
    // 1. Obtener todos los batches activos (quantity_remaining > 0) para este producto y tienda
    const { data: batches, error: batchFetchError } = await supabase
      .from("inventory_batches")
      .select("batch_id, quantity_remaining, unit_cost, received_date")
      .eq("product_reference_id", product.product_type === "custom" ? product.store_product_id : product.id)
      .eq("store_id", storeId)
      .gt("quantity_remaining", 0)
      .order("received_date", { ascending: true });
    if (batchFetchError) {
      return NextResponse.json({ error: "No se pudieron obtener los batches de inventario." }, { status: 500 });
    }
    // 2. Calcular el total actual y la diferencia con la cantidad nueva
    const currentTotal = batches.reduce((sum, b) => sum + Number(b.quantity_remaining), 0);
    const newTotal = Number(product.quantity);
    const diff = newTotal - currentTotal;
    // 3. Lógica para aumentar o disminuir inventario según diff
    if (diff > 0) {
      // Aumentar inventario: crear un nuevo batch
      let lastCost = 0;
      if (batches.length > 0) {
        lastCost = Number(batches[batches.length - 1].unit_cost) || 0;
      } else if (product.cost) {
        lastCost = Number(product.cost) || 0;
      }
      const { error: batchInsertError } = await supabase.from("inventory_batches").insert([
        {
          store_id: storeId,
          product_reference_id: product.product_type === "custom" ? product.store_product_id : product.id,
          product_type: product.product_type,
          quantity_received: diff,
          quantity_remaining: diff,
          unit_cost: lastCost,
          received_date: new Date().toISOString(),
          expiration_date: null,
        }
      ]);
      if (batchInsertError) {
        return NextResponse.json({ error: "No se pudo crear el nuevo batch de inventario." }, { status: 500 });
      }
    }
    if (diff < 0) {
      // Reducir inventario: restar unidades de los batches existentes (FIFO)
      let toRemove = Math.abs(diff);
      for (const batch of batches) {
        if (toRemove <= 0) break;
        const removeQty = Math.min(Number(batch.quantity_remaining), toRemove);
        const newQty = Number(batch.quantity_remaining) - removeQty;
        const { error: updateBatchError } = await supabase
          .from("inventory_batches")
          .update({ quantity_remaining: newQty })
          .eq("batch_id", batch.batch_id);
        if (updateBatchError) {
          return NextResponse.json({ error: "No se pudo actualizar el inventario por lotes." }, { status: 500 });
        }
        toRemove -= removeQty;
      }
    }
    // Actualización de producto
    if (product.product_type === "global") {
      // Solo actualiza el alias y los campos de inventario
      const { error: invError } = await supabase
        .from("store_inventory")
        .update({
          name_alias: product.name_alias,
          quantity: product.quantity,
          unit_price: product.price,
          unit_cost: product.cost,
          updated_at: new Date().toISOString(),
        })
        .eq("inventory_id", product.id);
      error = invError;
    } else if (product.product_type === "custom") {
      // Actualiza el producto personalizado
      const { error: prodError } = await supabase
        .from("store_products")
        .update({
          name: product.name,
          category: product.category,
          barcode: product.barcode,
          description: product.description,
        })
        .eq("store_product_id", product.store_product_id);
      // Actualiza el inventario
      const { error: invError } = await supabase
        .from("store_inventory")
        .update({
          quantity: product.quantity,
          unit_price: product.price,
          unit_cost: product.cost,
          updated_at: new Date().toISOString(),
        })
        .eq("inventory_id", product.id);
      error = prodError || invError;
    }
    // Actualiza el unit_cost en todos los batches activos
    const { error: updateCostError } = await supabase
      .from("inventory_batches")
      .update({ unit_cost: Number(product.cost) })
      .eq("product_reference_id", product.product_type === "custom" ? product.store_product_id : product.id)
      .eq("store_id", storeId)
      .gt("quantity_remaining", 0);
    if (updateCostError) {
      return NextResponse.json({ error: "No se pudo actualizar el costo en los batches activos." }, { status: 500 });
    }
    // Sumar los quantity_remaining de todos los batches activos y actualizar store_inventory.quantity
    const { data: updatedBatches } = await supabase
      .from("inventory_batches")
      .select("quantity_remaining")
      .eq("product_reference_id", product.product_type === "custom" ? product.store_product_id : product.id)
      .eq("store_id", storeId)
      .gt("quantity_remaining", 0);
    const newQuantity = updatedBatches
      ? updatedBatches.reduce((sum, b) => sum + Number(b.quantity_remaining), 0)
      : 0;
    const { error: updateInventoryQtyError } = await supabase
      .from("store_inventory")
      .update({ quantity: newQuantity })
      .eq("inventory_id", product.id);
    if (updateInventoryQtyError) {
      return NextResponse.json({ error: "No se pudo actualizar la cantidad total en inventario." }, { status: 500 });
    }
    const { error: priceUpdateError } = await supabase
      .from("store_inventory")
      .update({ unit_price: Number(product.price) })
      .eq("inventory_id", product.id);
    if (priceUpdateError) {
      return NextResponse.json({ error: "No se pudo actualizar el precio del producto." }, { status: 500 });
    }
    if (!error) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "No se pudieron guardar los cambios. Intenta de nuevo." }, { status: 500 });
    }
  } catch (err) {
    return NextResponse.json({ error: 'Error inesperado en el servidor.' }, { status: 500 });
  }
}

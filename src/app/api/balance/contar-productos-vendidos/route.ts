// en el Detalle del balance, para poder contact cuantos productos se vendieron en una determinada fecha



import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { transactionIds } = await req.json()
    if (!Array.isArray(transactionIds) || transactionIds.length === 0) {
      return NextResponse.json({ success: false, error: 'transactionIds requerido' }, { status: 400 })
    }

    // 1. Get transaction items
    const { data: transactionItems, error: itemsError } = await supabase
      .from('transaction_items')
      .select('quantity, product_reference_id, store_id')
      .in('transaction_id', transactionIds)

    if (itemsError) {
      return NextResponse.json({ success: false, error: itemsError.message }, { status: 500 })
    }
    
    if (!transactionItems || transactionItems.length === 0) {
      return NextResponse.json({ success: true, totalProducts: 0, hasMissingCost: false, totalCost: 0 });
    }
    
    const totalProducts = transactionItems.reduce((sum, item) => sum + item.quantity, 0)
    
    // 2. Get unique product references
    const productRefs = transactionItems.map(item => ({ 
      id: item.product_reference_id, 
      store_id: item.store_id 
    })).filter(p => p.id && p.store_id);

    const uniqueProductRefs = Array.from(new Set(productRefs.map(p => JSON.stringify(p)))).map(s => JSON.parse(s));

    if (uniqueProductRefs.length === 0) {
        return NextResponse.json({ success: true, totalProducts, hasMissingCost: false, totalCost: 0 });
    }

    // 3. Check inventory for the cost of these products
    const inventoryChecks = uniqueProductRefs.map(p => 
        supabase
            .from('store_inventory')
            .select('unit_cost')
            .eq('product_reference_id', p.id)
            .eq('store_id', p.store_id)
            .single()
    );
    
    const inventoryResults = await Promise.all(inventoryChecks);

    // 4. Map costs and calculate total cost
    const costMap = new Map<string, number | null>();
    uniqueProductRefs.forEach((p, index) => {
        const cost = inventoryResults[index]?.data?.unit_cost;
        costMap.set(p.id, cost ?? null);
    });

    let totalCost = 0;
    let hasMissingCost = false;

    for (const item of transactionItems) {
        const cost = costMap.get(item.product_reference_id);
        if (cost != null && cost > 0) {
            totalCost += item.quantity * cost;
        } else {
            hasMissingCost = true;
        }
    }

    return NextResponse.json({ success: true, totalProducts, hasMissingCost, totalCost })
  } catch (err: any) {
    // A .single() query can throw an error if more than one row is found (PGRST116)
    // We treat this as a "missing cost" scenario.
    if (err.code === 'PGRST116') {
        return NextResponse.json({ success: true, totalProducts: 0, hasMissingCost: true, totalCost: 0 });
    }
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
} 
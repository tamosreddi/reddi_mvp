import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { transactionIds } = await req.json()
    if (!Array.isArray(transactionIds) || transactionIds.length === 0) {
      return NextResponse.json({ success: false, error: 'transactionIds requerido' }, { status: 400 })
    }
    // Obtener todos los items de esas transacciones
    const { data, error } = await supabase
      .from('transaction_items')
      .select('transaction_id, product_name')
      .in('transaction_id', transactionIds)
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
    // Agrupar por transaction_id
    const result: Record<string, string[]> = {}
    for (const item of data) {
      if (!result[item.transaction_id]) result[item.transaction_id] = []
      result[item.transaction_id].push(item.product_name)
    }
    return NextResponse.json({ success: true, productsByTransaction: result })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
} 
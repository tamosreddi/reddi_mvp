import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

// Inicializa el cliente de Supabase usando variables de entorno
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Permitir consultas por día, semana, mes
type Period = 'day' | 'week' | 'month'

export async function POST(req: Request) {
  try {
    const { date, period = 'day' } = await req.json()
    const storeId = req.headers.get('x-store-id')
    
    if (!storeId) {
      return NextResponse.json(
        { error: "ID de tienda no proporcionado" },
        { status: 400 }
      )
    }

    if (!date || !isValidDate(date)) {
      return NextResponse.json(
        { error: "Fecha inválida" },
        { status: 400 }
      )
    }

    let startDate = new Date(date)
    let endDate = new Date(date)
    
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7)
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1)
    }

    const { data, error } = await supabase
      .from('transactions')
      .select('amount, date')
      .eq('type', 'ingreso')
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())
      .eq('store_id', storeId)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    const total = data.reduce((sum, item) => sum + item.amount, 0)
    
    const formattedDate = format(parseISO(date), "d 'de' MMMM", { locale: es })
    
    const response = {
      total,
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      message: period === 'day' 
        ? `El ingreso del ${formattedDate} fue de $${total}`
        : period === 'week'
        ? `El ingreso de la última semana fue de $${total}`
        : `El ingreso del último mes fue de $${total}`
    }

    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}
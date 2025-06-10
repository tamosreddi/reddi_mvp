import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// GET /api/clientes
export async function GET(request: Request) {
  // 1. Obtén el token del header
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.replace("Bearer ", "")

  // 2. Inicializa el cliente de Supabase con el token
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  })

  // 3. (Opcional) Loguea el usuario autenticado
  const { data: { user } } = await supabase.auth.getUser()
  console.log("Usuario autenticado en API clientes:", user)

  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get("storeId")
    const searchTerm = searchParams.get("searchTerm")

    if (!storeId) {
      return NextResponse.json(
        { error: "Se requiere el ID de la tienda" },
        { status: 400 }
      )
    }

    console.log('API CLIENTES - storeId:', storeId);

    let query = supabase
      .from("clients")
      .select("*")
      .eq("store_id", storeId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (searchTerm) {
      query = query.ilike("name", `%${searchTerm}%`)
    }

    const { data, error } = await query

    console.log('API CLIENTES - data:', data, 'error:', error);
    console.log('Supabase data:', data, 'error:', error)

    if (error) {
      return NextResponse.json(
        { error: "Error al obtener clientes" },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// PATCH /api/clientes
export async function PATCH(request: Request) {
  // Inicializa el cliente de Supabase con el token de autorización
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.replace("Bearer ", "")
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  })
  try {
    const body = await request.json()
    const { clientId, name, notes, email, phone, address } = body

    if (!clientId) {
      return NextResponse.json(
        { error: "Se requiere el ID del cliente" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("clients")
      .update({
        name,
        notes,
        email,
        phone,
        address,
        updated_at: new Date().toISOString(),
      })
      .eq("client_id", clientId)
      .select()

    if (error) {
      return NextResponse.json(
        { error: "Error al actualizar el cliente" },
        { status: 500 }
      )
    }

    return NextResponse.json(data[0])
  } catch (error) {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// DELETE /api/clientes (soft delete)
export async function DELETE(request: Request) {
  // Inicializa el cliente de Supabase con el token de autorización
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.replace("Bearer ", "")
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  })
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get("clientId")

    if (!clientId) {
      return NextResponse.json(
        { error: "Se requiere el ID del cliente" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("clients")
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("client_id", clientId)
      .select()

    if (error) {
      return NextResponse.json(
        { error: "Error al desactivar el cliente" },
        { status: 500 }
      )
    }

    return NextResponse.json(data[0])
  } catch (error) {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
} 
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/supabaseClient"

// GET /api/proveedores
export async function GET(request: Request) {
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

    let query = supabase
      .from("suppliers")
      .select("*")
      .eq("store_id", storeId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (searchTerm) {
      query = query.ilike("name", `%${searchTerm}%`)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { error: "Error al obtener proveedores" },
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

// PATCH /api/proveedores
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { supplierId, name, notes, email, phone, address } = body

    if (!supplierId) {
      return NextResponse.json(
        { error: "Se requiere el ID del proveedor" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("suppliers")
      .update({
        name,
        notes,
        email,
        phone,
        address,
        updated_at: new Date().toISOString(),
      })
      .eq("supplier_id", supplierId)
      .select()

    if (error) {
      return NextResponse.json(
        { error: "Error al actualizar el proveedor" },
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

// DELETE /api/proveedores (soft delete)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const supplierId = searchParams.get("supplierId")

    if (!supplierId) {
      return NextResponse.json(
        { error: "Se requiere el ID del proveedor" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("suppliers")
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("supplier_id", supplierId)
      .select()

    if (error) {
      return NextResponse.json(
        { error: "Error al desactivar el proveedor" },
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
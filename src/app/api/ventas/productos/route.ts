// API para mostrar los productos en VENTA PRODUCTOS

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// GET /api/ventas/productos?storeId=xxx
export async function GET(request: Request) {
  // 1. Obtén el token del header
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.replace("Bearer ", "")
  console.log("[API productos] Token recibido:", token)

  // 2. Inicializa el cliente de Supabase con el token
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  })

  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get("storeId")
    console.log("[API productos] storeId recibido:", storeId)
    if (!storeId) {
      console.log("[API productos] FALTA storeId")
      return NextResponse.json(
        { error: "Se requiere el ID de la tienda" },
        { status: 400 }
      )
    }

    // 1. Obtener inventario de la tienda (solo productos custom por ahora)
    const { data: inventory, error } = await supabase
      .from("store_inventory")
      .select("product_reference_id, quantity, name_alias, unit_price")
      .eq("store_id", storeId)
      .eq("product_type", "custom")
    console.log("[API productos] Resultado store_inventory:", inventory, error)
    if (error) {
      console.log("[API productos] Error al obtener inventario:", error)
      return NextResponse.json(
        { error: "Error al obtener inventario", details: error },
        { status: 500 }
      )
    }
    if (!inventory || inventory.length === 0) {
      console.log("[API productos] Inventario vacío")
      return NextResponse.json([])
    }
    // 2. Obtener los datos de los productos custom
    const productIds = inventory.map((item) => item.product_reference_id)
    console.log("[API productos] productIds:", productIds)
    const { data: productsData, error: prodError } = await supabase
      .from("store_products")
      .select("store_product_id, name, category, image, barcode")
      .in("store_product_id", productIds)
      .eq("is_active", true)
    console.log("[API productos] Resultado store_products:", productsData, prodError)
    if (prodError) {
      console.log("[API productos] Error al obtener productos:", prodError)
      return NextResponse.json(
        { error: "Error al obtener productos", details: prodError },
        { status: 500 }
      )
    }
    // 3. Mapear al formato Product
    const productsMapped = inventory
      .map((inv) => {
        const prod = productsData.find((p) => p.store_product_id === inv.product_reference_id)
        if (!prod) return null; // Si no existe el producto (inactivo o borrado), no lo muestres
        return {
          id: inv.product_reference_id,
          name: prod.name || "Sin nombre",
          price: Number(inv.unit_price) || 0,
          quantity: Number(inv.quantity) || 0,
          category: prod.category || "Sin categoría",
          image: prod.image || "/Groserybasket.png",
          productId: inv.product_reference_id.toString(),
          productType: "custom"
        }
      })
      .filter((p) => Boolean(p));
    console.log("[API productos] productsMapped:", productsMapped)
    return NextResponse.json(productsMapped)
  } catch (error) {
    console.log("[API productos] Excepción:", error)
    return NextResponse.json(
      { error: "Error interno del servidor", details: error },
      { status: 500 }
    )
  }
} 
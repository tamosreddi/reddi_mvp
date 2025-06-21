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

    // 1. Fetch all inventory items for the store (including inactive)
    const { data: inventoryRows, error: invError } = await supabase
      .from("store_inventory")
      .select("*")
      .eq("store_id", storeId)
      .order("updated_at", { ascending: false });

    if (invError) {
      console.log("[API productos] Error al obtener inventario:", invError)
      return NextResponse.json(
        { error: "Error al obtener inventario", details: invError },
        { status: 500 }
      )
    }

    // 2. Fetch all global products
    const { data: globalProducts, error: globalError } = await supabase
      .from("products")
      .select("*");

    if (globalError) {
      console.log("[API productos] Error al obtener productos globales:", globalError);
      return NextResponse.json(
        { error: "Error al obtener productos globales", details: globalError },
        { status: 500 }
      );
    }

    // 3. Fetch all custom products for this store
    const { data: customProducts, error: customError } = await supabase
      .from("store_products")
      .select("*")
      .eq("store_id", storeId);

    if (customError) {
      console.log("[API productos] Error al obtener productos custom:", customError);
      return NextResponse.json(
        { error: "Error al obtener productos custom", details: customError },
        { status: 500 }
      );
    }

    // 4. Build the inventory array (all records, but only active for display in 'Mi Tienda')
    let products: any[] = [];
    for (const item of inventoryRows) {
      if (!item.is_active) continue; // Only show active in 'Mi Tienda'
      let productData = null;
      if (item.product_type === "custom") {
        productData = customProducts?.find(p => p.store_product_id === item.product_reference_id);
      } else if (item.product_type === "global") {
        productData = globalProducts?.find(p => p.product_id === item.product_reference_id);
      }
      if (productData) {
        products.push({
          id: String(item.inventory_id),
          product_reference_id: item.product_reference_id,
          name: productData.name,
          name_alias: item.name_alias,
          category: productData.category,
          image: productData.image || "/Groserybasket.png",
          quantity: item.quantity,
          price: Number(item.unit_price),
          cost: 0, // Puedes optimizar esto después si necesitas el costo
          created_at: item.created_at,
          description: productData.description,
          productId: item.product_reference_id.toString(),
          productType: item.product_type
        });
      }
    }

    console.log("[API productos] products:", products.length);

    return NextResponse.json(products);
  } catch (error) {
    console.log("[API productos] Excepción:", error)
    return NextResponse.json(
      { error: "Error interno del servidor", details: error },
      { status: 500 }
    )
  }
} 
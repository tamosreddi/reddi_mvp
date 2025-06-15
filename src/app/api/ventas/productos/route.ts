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

    // 1. Obtener inventario de la tienda (custom y global)
    const { data: inventory, error } = await supabase
      .from("store_inventory")
      .select("product_reference_id, quantity, name_alias, unit_price, product_type")
      .eq("store_id", storeId)
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
    // 2. Obtener detalles de productos custom y global
    const customIds = inventory.filter(i => i.product_type === "custom").map(i => i.product_reference_id);
    const globalIds = inventory.filter(i => i.product_type === "global").map(i => i.product_reference_id);

    const { data: customProducts } = customIds.length > 0 ? await supabase
      .from("store_products")
      .select("store_product_id, name, category, image")
      .in("store_product_id", customIds) : { data: [] };

    const { data: globalProductsDetails } = globalIds.length > 0 ? await supabase
      .from("products")
      .select("product_id, name, category, image")
      .in("product_id", globalIds) : { data: [] };

    const productsMapped = inventory.map(inv => {
      let prod;
      if (inv.product_type === "custom") {
        prod = customProducts?.find(p => p.store_product_id === inv.product_reference_id);
      } else {
        prod = globalProductsDetails?.find(p => p.product_id === inv.product_reference_id);
      }
      if (!prod) return null;
      return {
        id: inv.product_reference_id,
        name: prod.name || "Sin nombre",
        price: Number(inv.unit_price) || 0,
        quantity: Number(inv.quantity) || 0,
        category: prod.category || "Sin categoría",
        image: prod.image || "/Groserybasket.png",
        productId: inv.product_reference_id.toString(),
        productType: inv.product_type
      }
    }).filter((p): p is NonNullable<typeof p> => Boolean(p));
    console.log("[API productos] productsMapped:", productsMapped)

    // 1. IDs de productos ya en inventario
    const inventoryProductIds = new Set(productsMapped.map((p) => p.productId));

    // 2. Obtener productos globales
    const { data: globalProducts, error: globalError } = await supabase
      .from("products")
      .select("product_id, name, category, image")
      .order("name");

    if (globalError) {
      console.log("[API productos] Error al obtener productos globales:", globalError);
      return NextResponse.json(
        { error: "Error al obtener productos globales", details: globalError },
        { status: 500 }
      );
    }

    // 3. Filtrar y mapear productos globales que NO están en inventario
    const globalProductsMapped = (globalProducts || [])
      .filter(Boolean)
      .filter((p): p is { product_id: string, name: string, category: string, image: string } => !inventoryProductIds.has(String(p.product_id)))
      .map((p) => ({
        id: p.product_id,
        name: p.name || "Sin nombre",
        price: 0, // o el precio base si tienes uno
        quantity: 0,
        category: p.category || "Sin categoría",
        image: p.image || "/Groserybasket.png",
        productId: String(p.product_id),
        productType: "global"
      }));

    // 4. Unir ambos arrays
    const allProducts = [...productsMapped, ...globalProductsMapped];

    console.log("[API productos] allProducts:", allProducts.length);

    return NextResponse.json(allProducts);
  } catch (error) {
    console.log("[API productos] Excepción:", error)
    return NextResponse.json(
      { error: "Error interno del servidor", details: error },
      { status: 500 }
    )
  }
} 
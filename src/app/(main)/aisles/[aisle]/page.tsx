//PAGINA DE PASILLO ESPECIFICO, POR EJEMPLO BEBIDAS
//main/aisles/[aisle]/page.tsx

import ShopHeader from "@/components/shop/ShopHeader";
import HorizontalProductCarousel from "@/components/shop/HorizontalProductCarousel";
import SubcategoryPillsClient from "@/components/shop/SubcategoryPillsClient";
import Link from "next/link";
import AisleGrid from "@/components/shop/AisleGrid";
import { getAisleData, getAisleProducts } from "@/lib/aisles";
import AisleClient from "./AisleClient";
import CartBar from "@/components/shared/CartBar";

export default async function AislePage({
  params,
  searchParams,
}: {
  params: Promise<{ aisle: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { aisle } = await params;
  const { category } = searchParams ? await searchParams : { category: undefined };

  let aisleName = "";
  let categories: string[] = ["Todas las categorías"];
  let subcategories: string[] = [];
  let products: any[] = [];
  let errorMsg = "";
  
  try {
    // Obtener información completa del pasillo
    const aisleData = await getAisleData(aisle);
    aisleName = aisleData.name;
    categories = aisleData.categories;
    subcategories = aisleData.subcategories;

    // Obtener productos del pasillo
    products = await getAisleProducts(aisle, category);

  } catch (e: any) {
    errorMsg = e.message || "Error al cargar el pasillo";
    console.error("[AislePage] Error:", e);
  }

  const activeCategory = category || categories[0];

  // Convertir productos reales al formato esperado por los componentes
  const formattedProducts = products.map(product => ({
    id: product.product_id, // Usar product_id como id principal
    name: product.name,
    image: product.image || "/icons/carrito.png",
    price: `$0.00`, // Tu tabla no tiene precio, puedes agregarlo o usar un valor fijo
    description: product.description || product.brand || "Sin descripción",
    quantity: 1,
    category: product.category,
    subcategory: product.subcategory,
    sku: product.sku,
    barcode: product.barcode,
    brand: product.brand
  }));

  return (
    <div className="min-h-screen bg-white pb-24">
      <ShopHeader searchPlaceholder={`Buscar en ${aisleName || "..."}`} backHref="/aisles" />
      
      <h2 className="text-xl font-semibold px-4 mt-4 mb-2 capitalize">
        {errorMsg ? (
          <span className="text-red-500">Error: {errorMsg}</span>
        ) : (
          aisleName || "Cargando..."
        )}
      </h2>

      {/* Tabs de categorías */}
      <div className="flex gap-4 px-4 overflow-x-auto pb-2 border-b border-gray-200">
        {categories.map((cat) => (
          <Link
            key={cat}
            href={`/aisles/${aisle}?category=${encodeURIComponent(cat)}`}
            className={`pb-1 text-xs whitespace-nowrap bg-transparent border-none outline-none
              ${activeCategory === cat
                ? "font-semibold text-gray-900 border-b-2 border-gray-900"
                : "text-gray-400"}
            `}
          >
            {cat}
          </Link>
        ))}
      </div>

      {/* Carruseles y grid manejados por el Client Component */}
      <AisleClient 
        categories={categories}
        subcategories={subcategories}
        formattedProducts={formattedProducts}
        activeCategory={activeCategory}
      />
      <CartBar />
    </div>
  );
}
//PAGINA DE PASILLO ESPECIFICO, POR EJEMPLO BEBIDAS
//main/aisles/[aisle]/page.tsx

import ShopHeader from "@/components/shop/ShopHeader";
import HorizontalProductCarousel from "@/components/shop/HorizontalProductCarousel";
import SubcategoryPillsClient from "@/components/shop/SubcategoryPillsClient";
import Link from "next/link";
import AisleGrid from "@/components/shop/AisleGrid";
import { getAisleData, getAisleProducts } from "@/lib/aisles";

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
      <ShopHeader searchPlaceholder={`Buscar en ${aisleName || "..."}`} />
      
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

      {/* Subcategorías tipo píldora (Client Component) */}
      {activeCategory !== "Todas las categorías" && subcategories.length > 0 && (
        <SubcategoryPillsClient subcategories={subcategories} />
      )}

      {/* Carruseles horizontales por categoría - Solo mostrar si estamos en "Todas las categorías" */}
      {activeCategory === "Todas las categorías" && 
        categories.filter((c) => c !== "Todas las categorías").map((cat) => {
          const categoryProducts = formattedProducts.filter((p: any) => p.category === cat);
          
          // Solo mostrar carrusel si hay productos en esta categoría
          if (categoryProducts.length === 0) return null;
          
          return (
            <HorizontalProductCarousel
              key={cat}
              title={cat}
              products={categoryProducts}
            />
          );
        })
      }

      {/* Grid de todos los productos */}
      <h3 className="text-lg font-semibold px-4 mt-6 mb-2">
        {activeCategory === "Todas las categorías" 
          ? "Todos los productos" 
          : `Productos en ${activeCategory}`}
      </h3>
      
      {formattedProducts.length > 0 ? (
        <AisleGrid products={formattedProducts} />
      ) : !errorMsg ? (
        <div className="px-4 py-8 text-center text-gray-500">
          <p>No se encontraron productos en este pasillo.</p>
          {activeCategory !== "Todas las categorías" && (
            <p className="text-sm mt-2">
              Intenta seleccionar &quot;Todas las categorías&quot; o una categoría diferente.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
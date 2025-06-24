//PAGINA DE PASILLO ESPECIFICO, POR EJEMPLO BEBIDAS

import ShopHeader from "@/components/shop/ShopHeader";
import HorizontalProductCarousel from "@/components/shop/HorizontalProductCarousel";
import SubcategoryPillsClient from "@/components/shop/SubcategoryPillsClient";
import Link from "next/link";
import Image from "next/image";

const mockCategories = ["Todas las categorías", "Frutas Frescas1", "Verduras Frescas1"];
const mockSubcategories = ["All1", "Berries1", "Apples1", "Grapefruits & Oranges1"];
const mockProducts = Array.from({ length: 8 }).map((_, i) => ({
  id: i,
  name: `Producto ${i + 1}`,
  image: "/icons/carrito.png",
  price: `$${(Math.random() * 100).toFixed(2)}`,
  description: "Descripción corta",
  stock: "Muchos en stock",
  quantity: 1,
  category: i % 2 === 0 ? "Frutas Frescas" : "Verduras Frescas",
}));

async function fetchAisleData(aisleId: string, category?: string) {
  try {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/products/aisle/${aisleId}` + (category ? `?category=${encodeURIComponent(category)}` : "");
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (e) {
    return null;
  }
}

export default async function AislePage({
  params,
  searchParams,
}: {
  params: Promise<{ aisle: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { aisle } = await params;
  const { category } = searchParams ? await searchParams : { category: undefined };
  let data = await fetchAisleData(aisle, category);

  // Fallbacks si hay error o no hay datos
  const categories = data?.categories?.length ? ["Todas las categorías", ...data.categories] : mockCategories;
  const subcategories = data?.subcategories?.length ? data.subcategories : mockSubcategories;
  const products = data?.products?.length ? data.products : mockProducts;
  const aisleName = data?.aisle?.name || "PasilloMock";
  const activeCategory = category || categories[0];

  return (
    <div className="min-h-screen bg-white pb-24">
      <ShopHeader searchPlaceholder={`Buscar en ${aisleName}...`} />
      <h2 className="text-xl font-semibold px-4 mt-4 mb-2 capitalize">{aisleName}</h2>
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
      {activeCategory !== "Todas las categorías" && (
        <SubcategoryPillsClient subcategories={subcategories} />
      )}
      {/* Carruseles horizontales por categoría */}
      {categories.filter((c) => c !== "Todas las categorías").map((cat) => (
        <HorizontalProductCarousel
          key={cat}
          title={cat}
          products={products.filter((p: any) => p.category === cat)}
        />
      ))}
      {/* Grid de todos los productos */}
      <h3 className="text-base font-semibold px-4 mt-6 mb-2">Todos los productos</h3>
      <div className="grid grid-cols-2 gap-3 px-4">
        {products.map((p: any) => (
          <div key={p.id} className="bg-white rounded-lg p-2 flex flex-col items-center">
            <Image src={p.image_url || "/icons/carrito.png"} alt={p.name} width={64} height={64} className="w-16 h-16 object-contain mb-1" />
            <span className="text-xs font-medium text-gray-800 text-center">{p.name}</span>
            <span className="text-xs text-gray-500">{p.price || p.unit_price}</span>
            <span className="text-[10px] text-green-600">{p.stock || "Muchos en stock"}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 
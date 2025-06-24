//PAGINA DE PASILLO ESPECIFICO

import ShopHeader from "@/components/shop/ShopHeader";
import HorizontalProductCarousel from "@/components/shop/HorizontalProductCarousel";
import SubcategoryPillsClient from "@/components/shop/SubcategoryPillsClient";
import Link from "next/link";

// Mock data para estructura inicial
const mockCategories = ["Todas las categorías", "Frutas Frescas", "Verduras Frescas"];
const mockSubcategories = ["All", "Berries", "Apples", "Grapefruits & Oranges"];
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

export default function AislePage({ params, searchParams }: { params: { aisle: string }, searchParams: { category?: string } }) {
  const aisleName = decodeURIComponent(params.aisle).replace(/-/g, " ");
  const activeCategory = searchParams.category || mockCategories[0];

  return (
    <div className="min-h-screen bg-white pb-24">
      <ShopHeader searchPlaceholder={`Buscar en ${aisleName}...`} />
      <h2 className="text-lg font-semibold px-4 mt-4 mb-2 capitalize">{aisleName}</h2>
      {/* Tabs de categorías */}
      <div className="flex gap-4 px-4 overflow-x-auto pb-2 border-b border-gray-200">
        {mockCategories.map((cat) => (
          <Link
            key={cat}
            href={`/aisles/${params.aisle}?category=${encodeURIComponent(cat)}`}
            className={`pb-1 text-base whitespace-nowrap bg-transparent border-none outline-none
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
        <SubcategoryPillsClient subcategories={mockSubcategories} />
      )}
      {/* Carruseles horizontales por categoría */}
      {mockCategories.filter((c) => c !== "Todas las categorías").map((cat) => (
        <HorizontalProductCarousel
          key={cat}
          title={cat}
          products={mockProducts.filter((p) => p.category === cat)}
        />
      ))}
      {/* Grid de todos los productos */}
      <h3 className="text-base font-semibold px-4 mt-6 mb-2">Todos los productos</h3>
      <div className="grid grid-cols-2 gap-3 px-4">
        {mockProducts.map((p) => (
          <div key={p.id} className="bg-white rounded-lg p-2 flex flex-col items-center">
            <img src={p.image} alt={p.name} className="w-16 h-16 object-contain mb-1" />
            <span className="text-xs font-medium text-gray-800 text-center">{p.name}</span>
            <span className="text-xs text-gray-500">{p.price}</span>
            <span className="text-[10px] text-green-600">{p.stock}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 
//PAGINA PRINCIPAL DE PASILLOS

import ShopHeader from "@/components/shop/ShopHeader";
import Image from "next/image";
import Link from "next/link";

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

const categories = [
  { name: "Lácteos", img: "/icons/manita.png" },
  { name: "Bebidas", img: "/icons/carrito.png" },
  { name: "Snacks", img: "/icons/carrito.png" },
  { name: "Limpieza", img: "/icons/carrito.png" },
  { name: "Abarrotes", img: "/icons/carrito.png" },
  { name: "Frescos", img: "/icons/carrito.png" },
  { name: "Panadería", img: "/icons/carrito.png" },
  { name: "Cuidado Personal", img: "/icons/carrito.png" },
  { name: "Mascotas", img: "/icons/carrito.png" },
  { name: "Congelados", img: "/icons/carrito.png" },
  { name: "Hogar", img: "/icons/carrito.png" },
  { name: "Otros", img: "/icons/carrito.png" },
];

export default function AislesPage() {
  return (
    <div className="min-h-screen bg-reddi-background pb-24">
      <ShopHeader searchDisabled searchPlaceholder="Buscar..." />
      {/* Título */}
      <h2 className="text-lg font-semibold px-4 mt-4 mb-2">Comprar por pasillo</h2>
      {/* Grid de categorías */}
      <div className="grid grid-cols-4 gap-3 px-4">
        {categories.map((cat) => (
          <Link key={cat.name} href={`/aisles/${slugify(cat.name)}`} className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-2 shadow-sm hover:bg-gray-100 transition">
            <Image src={cat.img} alt={cat.name} width={48} height={48} className="mb-1" />
            <span className="text-xs text-gray-700 text-center font-medium leading-tight">{cat.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
} 
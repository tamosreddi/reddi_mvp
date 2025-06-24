//PAGINA PRINCIPAL DE PASILLOS EN CUADROS

import ShopHeader from "@/components/shop/ShopHeader";
import Image from "next/image";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/supabaseServerClient";

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

const fallbackAisles = [
  { id: 1, name: "Lácteos1", image_url: "/icons/manita.png" },
  { id: 2, name: "Bebidas1", image_url: "/icons/carrito.png" },
  { id: 3, name: "Snacks1", image_url: "/icons/carrito.png" },
  { id: 4, name: "Limpieza1", image_url: "/icons/carrito.png" },
  { id: 5, name: "Abarrotes1", image_url: "/icons/carrito.png" },
  { id: 6, name: "Frescos1", image_url: "/icons/carrito.png" },
  { id: 7, name: "Panadería1", image_url: "/icons/carrito.png" },
  { id: 8, name: "Cuidado Personal1", image_url: "/icons/carrito.png" },
  { id: 9, name: "Mascotas1", image_url: "/icons/carrito.png" },
  { id: 10, name: "Congelados1", image_url: "/icons/carrito.png" },
  { id: 11, name: "Hogar1", image_url: "/icons/carrito.png" },
  { id: 12, name: "Otros1", image_url: "/icons/carrito.png" },
];

export default async function AislesPage() {
  let aisles = fallbackAisles;
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("aisles")
      .select("id, name, image_url")
      .eq("is_active", true)
      .order("display_order", { ascending: true });
    console.log("[AislesPage] Supabase fetch:", { data, error });
    if (!error && data && data.length > 0) {
      aisles = data;
    }
  } catch (e) {
    console.log("[AislesPage] Exception:", e);
    // fallback to mock
  }

  return (
    <div className="min-h-screen bg-reddi-background pb-24">
      <ShopHeader searchDisabled searchPlaceholder="Buscar..." />
      {/* Título */}
      <h2 className="text-lg font-semibold px-4 mt-4 mb-2">Comprar por pasillo</h2>
      {/* Grid de pasillos */}
      <div className="grid grid-cols-4 gap-3 px-4">
        {aisles.map((aisle) => (
          <Link key={aisle.id} href={`/aisles/${aisle.id}`} className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-2 shadow-sm hover:bg-gray-100 transition">
            <Image src={aisle.image_url || "/icons/carrito.png"} alt={aisle.name} width={48} height={48} className="mb-1" />
            <span className="text-xs text-gray-700 text-center font-medium leading-tight">{aisle.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
} 
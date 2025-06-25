import Image from "next/image";

interface Product {
  id: number | string;
  name: string;
  image: string;
  price: string;
  quantity: number;
}

interface AisleGridProps {
  products: Product[];
}

export default function AisleGrid({ products }: AisleGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 px-4">
      {products.map((p) => (
        <div key={p.id} className="bg-white rounded-lg p-2 flex flex-col items-center">
          <Image src={p.image} alt={p.name} width={80} height={80} className="w-20 h-20 object-contain mb-1 self-center" />
          <span className="text-base font-semibold text-gray-800 text-left w-full">{p.price}</span>
          <span className="text-xs text-gray-500 text-left w-full">{p.name}</span>
          <span className="text-xs text-gray-500 text-left w-full">{p.quantity}</span>
        </div>
      ))}
    </div>
  );
} 
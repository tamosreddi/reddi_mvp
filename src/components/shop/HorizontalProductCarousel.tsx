//COMPONENTE DE CARROSEL HORIZONTAL DE PRODUCTOS EN SHOP

import Image from "next/image";

interface Product {
  id: number | string;
  name: string;
  image: string;
  price: string;
  quantity: number;
}

interface HorizontalProductCarouselProps {
  title: string;
  products: Product[];
}

export default function HorizontalProductCarousel({ title, products }: HorizontalProductCarouselProps) {
  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold px-4 mb-2">{title}</h3>
      <div className="flex gap-3 px-4 overflow-x-auto pb-2">
        {products.map((p) => (
          <div key={p.id} className="min-w-[140px] bg-white rounded-lg p-2 flex flex-col items-center">
            <Image src={p.image} alt={p.name} width={80} height={80} className="w-20 h-20 object-contain mb-1 self-center" />
            <span className="text-base font-semibold text-gray-800 text-left w-full">{p.price}</span>
            <span className="text-xs text-gray-500 text-left w-full">{p.name}</span>
            <span className="text-xs text-gray-500 text-left w-full">{p.quantity}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 
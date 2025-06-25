//COMPONENTE DE CARROSEL HORIZONTAL DE PRODUCTOS EN SHOP

import Image from "next/image";
import { Plus, Trash2, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";
import ProductAddButton from "./ProductAddButton";

interface Product {
  id: number | string;
  name: string;
  image: string;
  price: string;
  quantity: number;
}

interface CartItem {
  id: number | string;
  quantity: number;
}

interface HorizontalProductCarouselProps {
  title: string;
  products: Product[];
  cart: CartItem[];
  onAdd: (product: Product) => void;
  onRemove: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export default function HorizontalProductCarousel({ title, products, cart, onAdd, onRemove, onDelete }: HorizontalProductCarouselProps) {
  // Helper para saber si el producto está en el carrito
  const getCartQuantity = (productId: number | string) => {
    const item = cart.find((c) => c.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold px-4 mb-2">{title}</h3>
      <div className="flex gap-3 px-4 overflow-x-auto pb-2">
        {products.map((p) => {
          const quantity = getCartQuantity(p.id);
          return (
            <div key={p.id} className="min-w-[140px] bg-white rounded-lg p-2 flex flex-col items-center relative">
              {/* Imagen del producto */}
              <div className="w-full flex items-center justify-center relative">
                <Image src={p.image} alt={p.name} width={80} height={80} className="w-20 h-20 object-contain mb-1 self-center" />
                {/* Botón flotante reutilizable */}
                <ProductAddButton
                  quantity={quantity}
                  onAdd={() => onAdd(p)}
                  onRemove={() => onRemove(p)}
                  onDelete={() => onDelete(p)}
                />
              </div>
              {/* Info producto */}
              <span className="text-base font-semibold text-gray-800 text-left w-full">{p.price}</span>
              <span className="text-xs text-gray-500 text-left w-full">{p.name}</span>
              <span className="text-xs text-gray-500 text-left w-full">{p.quantity}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
} 
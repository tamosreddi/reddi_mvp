import Image from "next/image";
import ProductAddButton from "./ProductAddButton";

interface Product {
  id: number | string;
  name: string;
  image: string;
  price: string;
  quantity: number;
  category: string;
  subcategory?: string;
  sku?: string;
  barcode?: string;
  brand?: string;
}

interface CartItem {
  id: number | string;
  quantity: number;
}

interface AisleGridProps {
  products: Product[];
  cart: CartItem[];
  onAdd: (product: Product) => void;
  onRemove: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export default function AisleGrid({ products, cart, onAdd, onRemove, onDelete }: AisleGridProps) {
  // Helper para saber la cantidad en el carrito
  const getCartQuantity = (productId: number | string) => {
    const item = cart.find((c) => c.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="grid grid-cols-2 gap-3 px-4">
      {products.map((p) => {
        const quantity = getCartQuantity(p.id);
        return (
          <div key={p.id} className="bg-white rounded-lg p-2 flex flex-col items-center relative">
            <div className="w-full flex items-center justify-center relative">
              <Image src={p.image} alt={p.name} width={80} height={80} className="w-20 h-20 object-contain mb-1 self-center" />
              <ProductAddButton
                quantity={quantity}
                onAdd={() => onAdd(p)}
                onRemove={() => onRemove(p)}
                onDelete={() => onDelete(p)}
              />
            </div>
            <span className="text-base font-semibold text-gray-800 text-left w-full">{p.price}</span>
            <span className="text-xs text-gray-500 text-left w-full">{p.name}</span>
            <span className="text-xs text-gray-500 text-left w-full">{p.quantity}</span>
          </div>
        );
      })}
    </div>
  );
} 
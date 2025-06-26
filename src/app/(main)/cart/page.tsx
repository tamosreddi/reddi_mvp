// Carrito de compras de SHOP

"use client";
import { useCart } from "@/lib/contexts/CartContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ProductAddButton from "@/components/shop/ProductAddButton";
import TopProfileMenu from "@/components/shared/top-profile-menu";

export default function CartPage() {
  const { cart, addToCart, decrementCartItem, removeFromCart } = useCart();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white pb-24 pt-14">
      {/* Header reutilizando TopProfileMenu */}
      <TopProfileMenu
        simpleMode={true}
        title="Canasta"
        onBackClick={() => router.back()}
        className="bg-white"
      />

      {/* Lista de productos en el carrito */}
      <div className="flex flex-col gap-4 p-4">
        {cart.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">Tu canasta está vacía.</div>
        ) : (
          cart.map((product) => (
            <div key={product.id} className="flex items-center gap-4 bg-white rounded-lg shadow-sm p-3">
              <Image
                src={product.image || "/icons/carrito.png"}
                alt={product.name}
                width={64}
                height={64}
                className="w-16 h-16 object-contain rounded"
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">{product.name}</div>
                <div className="text-gray-700 text-base font-semibold">{typeof product.price === "number" ? product.price.toLocaleString("es-MX", { style: "currency", currency: "MXN" }) : product.price}</div>
              </div>
              <ProductAddButton
                quantity={product.cartQuantity || 0}
                onAdd={() => addToCart(product)}
                onRemove={() => decrementCartItem(product.id)}
                onDelete={() => removeFromCart(product.id)}
                className=""
                variant="cart"
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
} 
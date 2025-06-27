// Carrito de compras de SHOP. En donde se muestran listados los productos agregados al carrito.

"use client";
import { useCart } from "@/lib/contexts/CartContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ProductAddButton from "@/components/shop/ProductAddButton";
import TopProfileMenu from "@/components/shared/top-profile-menu";
import CartBar from "@/components/shared/CartBar";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CartPage() {
  const { cart, addToCart, decrementCartItem, removeFromCart, clearCart } = useCart();
  const router = useRouter();

  const rightContent = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white" aria-label="Más opciones">
          <MoreVertical className="h-5 w-5 text-gray-700" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 bg-white border border-gray-200 shadow-lg rounded-xl py-2 px-1">
        <DropdownMenuItem
          onClick={() => {
            clearCart();
            router.push("/aisles");
          }}
          className="text-red-600 cursor-pointer bg-red-50 border border-red-200 rounded-lg px-4 py-2 font-normal hover:bg-red-100 transition"
        >
          Borrar Carrito
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="min-h-screen bg-white pb-24 pt-14">
      {/* Header reutilizando TopProfileMenu */}
      <TopProfileMenu
        simpleMode={true}
        title="Canasta"
        onBackClick={() => router.back()}
        className="bg-white"
        rightContent={rightContent}
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
                <div className="font-normal text-gray-900 truncate">{product.name}</div>
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
      <CartBar label="Continúa con la compra" />
    </div>
  );
} 
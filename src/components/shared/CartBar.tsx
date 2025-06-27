// Carrito que aparece en Shop cuande se agrega un producto al carrito. 
//Navegación inferior.

"use client";
import { useCart } from "@/lib/contexts/CartContext";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface CartBarProps {
  label?: string;
  onClick?: () => void;
}

export default function CartBar({ label = "Canasta", onClick }: CartBarProps) {
  const { cart, cartItemCount, cartTotal } = useCart();
  const router = useRouter();
  // console.log("CartBar context:", cart, cartItemCount);

  if (cartItemCount === 0) return null;

  const handleClick = onClick || (() => router.push("/cart"));

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white py-3 px-4 rounded-none shadow-lg z-50 cursor-pointer"
      onClick={handleClick}
      aria-label={label}
    >
      <div className="max-w-4xl mx-auto w-full">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-700 rounded-md flex items-center justify-center mr-3">
              {cartItemCount}
            </div>
            <span className="text-lg font-medium">{label}</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">{cartTotal.toLocaleString()} MXN</span>
            <ChevronRight className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  );
} 
"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  id: number | string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  image: string;
  sku?: string;
  barcode?: string;
  brand?: string;
  subcategory?: string;
  cartQuantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Omit<CartItem, "cartQuantity">) => void;
  removeFromCart: (productId: number | string) => void;
  decrementCartItem: (productId: number | string) => void;
  clearCart: () => void;
  cartItemCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Cargar carrito desde localStorage al montar
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("aislesCart");
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch {}
      }
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("aislesCart", JSON.stringify(cart));
    }
  }, [cart]);

  // Handlers
  const addToCart = (product: Omit<CartItem, "cartQuantity">) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...product, cartQuantity: 1 }];
      }
    });
  };

  const decrementCartItem = (productId: number | string) => {
    setCart((prevCart) => {
      const updated = prevCart.map((item) => {
        if (item.id === productId) {
          return { ...item, cartQuantity: Math.max(0, item.cartQuantity - 1) };
        }
        return item;
      });
      return updated.filter((item) => item.cartQuantity > 0);
    });
  };

  const removeFromCart = (productId: number | string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const clearCart = () => setCart([]);

  const cartItemCount = cart.reduce((total, item) => total + (item.cartQuantity || 0), 0);
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.cartQuantity), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, decrementCartItem, clearCart, cartItemCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de un CartProvider");
  return ctx;
} 
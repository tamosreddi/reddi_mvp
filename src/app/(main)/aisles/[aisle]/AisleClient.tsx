"use client";
import { useState } from "react";
import HorizontalProductCarousel from "@/components/shop/HorizontalProductCarousel";
import AisleGrid from "@/components/shop/AisleGrid";

interface Product {
  id: number | string;
  name: string;
  image: string;
  price: string;
  quantity: number;
  category: string;
  [key: string]: any;
}

interface CartItem {
  id: number | string;
  quantity: number;
}

interface AisleClientProps {
  categories: string[];
  formattedProducts: Product[];
}

export default function AisleClient({ categories, formattedProducts }: AisleClientProps) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Handler para agregar producto
  const handleAdd = (product: Product) => {
    setCart((prev) => {
      const found = prev.find((item) => item.id === product.id);
      if (found) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { id: product.id, quantity: 1 }];
    });
  };

  // Handler para eliminar producto del carrito
  const handleDelete = (product: Product) => {
    setCart((prev) => prev.filter((item) => item.id !== product.id));
  };

  // Handler para disminuir cantidad (opcional, si implementas botón de "-")
  const handleRemove = (product: Product) => {
    setCart((prev) => {
      const found = prev.find((item) => item.id === product.id);
      if (found && found.quantity > 1) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      // Si la cantidad es 1, eliminar del carrito
      return prev.filter((item) => item.id !== product.id);
    });
  };

  return (
    <>
      {/* Carruseles por categoría */}
      {categories.filter((c) => c !== "Todas las categorías").map((cat) => {
        const categoryProducts = formattedProducts.filter((p) => p.category === cat);
        if (categoryProducts.length === 0) return null;
        return (
          <HorizontalProductCarousel
            key={cat}
            title={cat}
            products={categoryProducts}
            cart={cart}
            onAdd={handleAdd as any}
            onRemove={handleRemove as any}
            onDelete={handleDelete as any}
          />
        );
      })}
      {/* Grid de productos */}
      <AisleGrid products={formattedProducts} />
    </>
  );
} 
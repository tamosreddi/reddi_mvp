"use client";
import React from "react";
import { useState, useMemo } from "react";
import HorizontalProductCarousel from "@/components/shop/HorizontalProductCarousel";
import AisleGrid from "@/components/shop/AisleGrid";
import SubcategoryPillsClient from "@/components/shop/SubcategoryPillsClient";

interface Product {
  id: number | string;
  name: string;
  image: string;
  price: string;
  quantity: number;
  category: string;
  subcategory?: string;
  [key: string]: any;
}

interface CartItem {
  id: number | string;
  quantity: number;
}

interface AisleClientProps {
  categories: string[];
  subcategories: string[];
  formattedProducts: Product[];
  activeCategory: string;
}

export default function AisleClient({ categories, subcategories, formattedProducts, activeCategory }: AisleClientProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeSubcategory, setActiveSubcategory] = useState<string>("");

  // Filtrar subcategorías según la categoría activa y agregar 'Todas' al inicio
  const filteredSubcategories = useMemo(() => {
    if (activeCategory === "Todas las categorías") return [];
    const subs = formattedProducts
      .filter((p) => p.category === activeCategory && p.subcategory)
      .map((p) => p.subcategory!);
    const uniqueSubs = Array.from(new Set(subs));
    return ["Todas", ...uniqueSubs];
  }, [activeCategory, formattedProducts]);

  // Inicializar subcategoría activa si cambia la categoría
  React.useEffect(() => {
    if (filteredSubcategories.length > 0) {
      setActiveSubcategory("Todas");
    } else {
      setActiveSubcategory("");
    }
  }, [filteredSubcategories]);

  // Filtrar productos por categoría y subcategoría
  const visibleProducts = useMemo(() => {
    let products = formattedProducts;
    if (activeCategory !== "Todas las categorías") {
      products = products.filter((p) => p.category === activeCategory);
      if (activeSubcategory && activeSubcategory !== "Todas") {
        products = products.filter((p) => p.subcategory === activeSubcategory);
      }
    }
    return products;
  }, [formattedProducts, activeCategory, activeSubcategory]);

  // Handlers de carrito
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
      {/* Subcategorías tipo píldora */}
      {activeCategory !== "Todas las categorías" && filteredSubcategories.length > 0 && (
        <SubcategoryPillsClient
          subcategories={filteredSubcategories}
          activeSubcategory={activeSubcategory}
          onChange={setActiveSubcategory}
        />
      )}
      {/* Carruseles por categoría solo si está seleccionada 'Todas las categorías' */}
      {activeCategory === "Todas las categorías" && categories.filter((c) => c !== "Todas las categorías").map((cat) => {
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
      {/* Carruseles por subcategoría si está seleccionada una categoría y subcategoría es 'Todas' */}
      {activeCategory !== "Todas las categorías" && activeSubcategory === "Todas" && filteredSubcategories.filter((s) => s !== "Todas").map((subcat) => {
        const subcatProducts = formattedProducts.filter((p) => p.category === activeCategory && p.subcategory === subcat);
        if (subcatProducts.length === 0) return null;
        return (
          <HorizontalProductCarousel
            key={subcat}
            title={subcat}
            products={subcatProducts}
            cart={cart}
            onAdd={handleAdd as any}
            onRemove={handleRemove as any}
            onDelete={handleDelete as any}
          />
        );
      })}
      {/* Grid de productos filtrados (solo si no se está mostrando carruseles por subcategoría) */}
      {!(activeCategory !== "Todas las categorías" && activeSubcategory === "Todas") && (
        <>
          {activeCategory === "Todas las categorías" && (
            <h3 className="text-lg font-semibold px-4 mb-2 mt-6">Todos los productos</h3>
          )}
          <AisleGrid 
            products={visibleProducts}
            cart={cart}
            onAdd={handleAdd}
            onRemove={handleRemove}
            onDelete={handleDelete}
          />
        </>
      )}
    </>
  );
} 
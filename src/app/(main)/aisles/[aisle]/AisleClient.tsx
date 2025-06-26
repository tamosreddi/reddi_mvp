"use client";
import React from "react";
import { useState, useMemo } from "react";
import HorizontalProductCarousel from "@/components/shop/HorizontalProductCarousel";
import AisleGrid from "@/components/shop/AisleGrid";
import SubcategoryPillsClient from "@/components/shop/SubcategoryPillsClient";
import { useCart } from "@/lib/contexts/CartContext";
import type { Product } from '@/lib/types/product';

interface AisleClientProps {
  categories: string[];
  subcategories: string[];
  formattedProducts: Product[];
  activeCategory: string;
}

export default function AisleClient({ categories, subcategories, formattedProducts, activeCategory }: AisleClientProps) {
  // Usar el carrito global
  const { cart, addToCart, decrementCartItem, removeFromCart } = useCart();
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

  // Handlers para el grid y carrusel
  const handleAdd = (product: Product) => {
    const parsedProduct = {
      ...product,
      price: typeof product.price === "string" ? Number(product.price.replace(/[^\d.]/g, "")) : product.price,
    };
    console.log("Agregando al carrito:", parsedProduct);
    addToCart(parsedProduct);
  };
  const handleRemove = (product: Product) => decrementCartItem(product.id);
  const handleDelete = (product: Product) => removeFromCart(product.id);

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
            onAdd={handleAdd}
            onRemove={handleRemove}
            onDelete={handleDelete}
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
            onAdd={handleAdd}
            onRemove={handleRemove}
            onDelete={handleDelete}
          />
        );
      })}
      {/* Grid de productos filtrados (solo si no se está mostrando carruseles por subcategoría) */}
      {!(activeCategory !== "Todas las categorías" && activeSubcategory === "Todas") && (
        <>
          {activeCategory === "Todas las categorías" && (
            <h3 className="text-lg font-semibold px-4 mb-2 mt-6">Todos los productos</h3>
          )}
          {activeCategory !== "Todas las categorías" && activeSubcategory && activeSubcategory !== "Todas" && (
            <h3 className="text-lg font-semibold px-4 mb-2 mt-6">{activeSubcategory}</h3>
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
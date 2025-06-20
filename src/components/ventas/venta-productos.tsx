// Al dar click en modal "VENTA DE PRODUCTOS" se muestra este componente.

"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Search, Barcode, ShoppingCart, ChevronRight, Plus, Minus, Home } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import CreateProductForm from "@/components/inventario/create-product-form"
import TopProfileMenu from "@/components/shared/top-profile-menu"
import { useStore } from "@/lib/contexts/StoreContext"
import Image from 'next/image'
import { supabase } from "@/lib/supabase/supabaseClient"
import SearchBar from "@/components/shared/SearchBar"

// Definición de tipos
interface Product {
  id: number
  name: string
  price: number
  quantity: number
  category: string
  image: string
  productId: string
  productType: string
}

interface CartItem extends Product {
  cartQuantity: number
}

export default function ProductSale({ transactionId }: { transactionId?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const { selectedStore } = useStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>("__mi_tienda__")
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([]);
  const [categories, setCategories] = useState<string[]>([])
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([])
  // New state to control whether to show the create product form
  const [showCreateProductForm, setShowCreateProductForm] = useState(false)

  // Nueva función para obtener productos del catálogo
  const fetchCatalogProducts = async () => {
    if (!selectedStore?.store_id) return;
    try {
      // 1. Obtener productos globales
      const { data: globalProducts, error: globalError } = await supabase
        .from("products")
        .select("*")
        .order("name");
      
      if (globalError) throw globalError;

      // 2. Obtener productos personalizados (custom) del usuario
      const { data: customProducts, error: customError } = await supabase
        .from("store_products")
        .select("*")
        .eq("store_id", selectedStore.store_id)
        .order("name");

      if (customError) throw customError;
      
      // Obtener el inventario de la tienda para los precios
      const { data: inventoryData, error: inventoryError } = await supabase
        .from("store_inventory")
        .select("product_reference_id, unit_price")
        .eq("store_id", selectedStore.store_id);

      if (inventoryError) throw inventoryError;

      const priceMap = new Map<string, number>();
      if (inventoryData) {
        inventoryData.forEach(item => {
          if (item.product_reference_id && item.unit_price != null) {
            priceMap.set(item.product_reference_id, Number(item.unit_price));
          }
        });
      }
      
      // 3. Mapear productos globales al formato Product
      const mappedGlobalProducts = (globalProducts || []).map(product => ({
        id: product.product_id,
        name: product.name,
        price: priceMap.get(String(product.product_id)) ?? 0,
        quantity: 0,
        category: product.category,
        image: product.image || "/Groserybasket.png",
        productId: product.product_id.toString(),
        productType: "global"
      }));

      // 4. Mapear productos personalizados al formato Product
      const mappedCustomProducts = (customProducts || []).map(product => ({
        id: product.store_product_id,
        name: product.name,
        price: priceMap.get(String(product.store_product_id)) ?? 0,
        quantity: 0,
        category: product.category,
        image: product.image || "/Groserybasket.png",
        productId: product.store_product_id.toString(),
        productType: "custom"
      }));
      
      // 5. Combinar ambos arrays
      setCatalogProducts([...mappedGlobalProducts, ...mappedCustomProducts]);
    } catch (err) {
      console.error("Error al obtener productos del catálogo:", err);
      setCatalogProducts([]);
    }
  };

  // Cargar productos del catálogo al montar el componente
  useEffect(() => {
    fetchCatalogProducts();
  }, [selectedStore]);

  // Nueva función para obtener productos del inventario
  const fetchInventory = async () => {
    if (!selectedStore?.store_id) return;
    let token = "";
    try {
      const session = (await supabase.auth.getSession()).data.session;
      if (session) {
        token = session.access_token;
      }
    } catch (e) {
      token = "";
    }
    try {
      const res = await fetch(`/api/ventas/productos?storeId=${selectedStore.store_id}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Error al obtener productos");
      const productsMapped = await res.json();
      // Elimina duplicados por id
      const uniqueProducts = Array.from(new Map((productsMapped as Product[]).map((p) => [p.id, p])).values());
      setProducts(uniqueProducts);
      setCategories(Array.from(new Set(uniqueProducts.map((p) => p.category))));
    } catch (err) {
      setProducts([]);
      setCategories([]);
      console.error("Error al obtener productos desde API:", err);
    }
  }

  useEffect(() => {
    fetchInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStore])

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (typeof window !== "undefined" && cart.length > 0) {
      console.log("[venta-productos] Guardando carrito en localStorage:", cart)
      localStorage.setItem("productCart", JSON.stringify(cart))
    }
  }, [cart])

  // Obtener todas las categorías únicas combinando inventario y catálogo
  useEffect(() => {
    const inventoryCategories = products.map(p => p.category);
    const catalogCategories = catalogProducts.map(p => p.category);
    const uniqueCategories = Array.from(new Set([...inventoryCategories, ...catalogCategories])).filter(Boolean);
    setCategories(uniqueCategories);
  }, [products, catalogProducts]);

  // Cargar carrito desde localStorage al montar
  useEffect(() => {
    // Si venimos de edición, cargar editProductCart
    const editCart = localStorage.getItem("editProductCart");
    console.log("[venta-productos] editProductCart localStorage:", editCart);
    if (editCart) {
      try {
        const parsedCart = JSON.parse(editCart);
        console.log("[venta-productos] editProductCart parsed:", parsedCart);
        // Normalizar productos al formato CartItem
        const normalizedCart = parsedCart.map((p: any) => ({
          id: p.product_reference_id || p.id,
          name: p.product_name || p.name,
          price: Number(p.unit_price ?? p.price),
          quantity: Number(p.quantity),
          category: p.category || "Sin categoría",
          image: p.image || "/Groserybasket.png",
          productId: (p.product_reference_id || p.id || "").toString(),
          productType: p.product_type || "custom",
          cartQuantity: Number(p.quantity),
        }));
        console.log("[venta-productos] editProductCart normalized:", normalizedCart);
        setCart(normalizedCart);
        setTimeout(() => {
          console.log("[venta-productos] cart state after setCart:", normalizedCart);
        }, 100);
        localStorage.removeItem("editProductCart");
        return;
      } catch (e) {
        console.error("Error parsing editProductCart from localStorage:", e);
      }
    }
    // Si no, cargar productCart normal
    const savedCart = localStorage.getItem("productCart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      } catch (e) {
        console.error("Error parsing cart from localStorage:", e);
      }
    }
  }, []);

  // Ajusta el filtro para mostrar productos según la categoría seleccionada
  const filteredProducts = (selectedCategory === "__mi_tienda__" ? products : catalogProducts).filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    // Si hay búsqueda, ignora cualquier filtro de categoría
    if (searchTerm.trim() !== "") {
      return matchesSearch;
    }
    // Si está seleccionado "Mi Tienda", muestra solo productos del inventario
    if (selectedCategory === "__mi_tienda__") {
      return true;
    }
    // Si hay otra categoría seleccionada, filtra por ella
    if (selectedCategory) {
      return product.category === selectedCategory;
    }
    // Si no hay filtro de categoría, muestra todo
    return true;
  });

  // Añadir producto al carrito
  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)

      if (existingItem) {
        // Si ya existe en el carrito, incrementar cantidad
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item,
        )
      } else {
        // Si no existe, añadirlo con cantidad 1.
        // El `productId` y `productType` correctos ya vienen en el objeto `product`
        // y se propagan con el operador de propagación (...).
        return [...prevCart, { 
          ...product, 
          cartQuantity: 1
        }]
      }
    })
  }

  // Decrementar cantidad de un producto en el carrito
  const decrementCartItem = (productId: number) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) => {
        if (item.id === productId) {
          return { ...item, cartQuantity: Math.max(0, item.cartQuantity - 1) }
        }
        return item
      })
      // Eliminar productos con cantidad 0
      return updatedCart.filter((item) => item.cartQuantity > 0)
    })
  }

  // Calcular total de items en el carrito
  const cartItemCount = cart.reduce((total, item) => total + item.cartQuantity, 0)

  // Calcular precio total del carrito
  const cartTotal = cart.reduce((total, item) => total + item.price * item.cartQuantity, 0)

  // Show create product form
  const handleShowCreateProductForm = () => {
    setShowCreateProductForm(true)
  }

  // Handle when the create product form is closed
  const handleCreateProductFormClose = () => {
    setShowCreateProductForm(false)
  }

  // Navegar a la página de canasta
  const navigateToCart = () => {
    if (transactionId) {
      router.push(`/dashboard/ventas/canasta?edit=1&transaction_id=${transactionId}`);
    } else {
      router.push(`/dashboard/ventas/canasta`);
    }
  }

  const handleBackToDashboard = () => {
    localStorage.removeItem("productCart");
    localStorage.removeItem("selectedCustomer");
    // Redirige al dashboard
    router.push("/dashboard");
  };

  // If showing create product form, render it
  if (showCreateProductForm) {
    return (
      <CreateProductForm
        initialReferrer={pathname}
        onCancel={handleCreateProductFormClose}
        onSuccess={() => {
          setShowCreateProductForm(false)
          fetchInventory()
        }}
      />
    )
  }

  // Otherwise, render the product sale view
  return (
    <div className="flex flex-col min-h-screen bg-reddi-background pb-16 pt-16">
      {/* Header */}
      <TopProfileMenu 
        simpleMode={true}
        title="Nueva venta"
        onBackClick={handleBackToDashboard}
        rightContent={
          <button 
            className="flex h-10 w-10 items-center justify-center" 
            aria-label="Escanear código de barras"
          >
            <Barcode className="h-6 w-6" />
          </button>
        }
      />

      {/* Search Bar */}
      <div className="p-4 max-w-4xl mx-auto w-full">
        <SearchBar
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value);
            if (value.trim() !== "") {
              setSelectedCategory(null); // Forzar "Todas las categorías"
            }
          }}
          placeholder="Buscar por nombre o código"
        />
      </div>

      {/* Category Filter */}
      <div className="px-4 overflow-x-auto max-w-4xl mx-auto w-full">
        <div className="flex space-x-2 pb-3">
          {/* Mi Tienda (Casa) Filtro */}
          <button
            onClick={() => setSelectedCategory("__mi_tienda__")}
            className={cn(
              "px-3 py-1.5 rounded-full whitespace-nowrap text-sm transition-all flex items-center justify-center",
              selectedCategory === "__mi_tienda__"
                ? "bg-[#57BAB5] text-white shadow-md"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            )}
            aria-label="Solo productos de mi tienda"
            style={{ minWidth: 40, minHeight: 40 }}
          >
            <Home className={cn("h-5 w-5", selectedCategory === "__mi_tienda__" ? "text-white" : "text-gray-500")} />
          </button>

          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              "px-3 py-1.5 rounded-full whitespace-nowrap text-sm transition-all",
              !selectedCategory
                ? "bg-yellow-400 text-gray-900 shadow-md"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50",
            )}
          >
            Todas las categorías
          </button>

          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "px-3 py-1.5 rounded-full whitespace-nowrap text-sm transition-all",
                selectedCategory === category
                  ? "bg-yellow-400 text-gray-900 shadow-md"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50",
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid - Responsive grid with improved styling */}
      <div className="flex-1 p-4 pb-20 max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
          {/* New Product Button */}
          <button
            onClick={() => setShowCreateProductForm(true)}
            className="flex flex-col items-center justify-center p-2 border-2 border-dashed border-gray-300 rounded-lg aspect-square hover:bg-gray-50 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full border-2 border-gray-800 flex items-center justify-center mb-1 group-hover:bg-yellow-100 transition-colors">
              <Plus className="h-5 w-5" />
            </div>
            <span className="text-center font-bold text-gray-800 text-sm">NUEVO PRODUCTO</span>
          </button>

          {/* Product Cards - Redesigned with improved styling */}
          {filteredProducts.map((product) => {
            const inCart = cart.find((item) => item.id === product.id)
            // const isOutOfStock = product.quantity <= 0 // No usar validación de stock

            return (
              <div
                key={product.id}
                onClick={() => addToCart(product)}
                className={cn(
                  "bg-white rounded-lg overflow-hidden relative flex flex-col shadow-sm cursor-pointer hover:shadow-md transition-all hover:translate-y-[-2px] p-1 sm:p-2"
                )}
              >
                {/* Product Image */}
                <div className={cn("h-16 sm:h-20 bg-gray-200 flex items-center justify-center")}> 
                  <Image
                    src={product.image || "/Groserybasket.png"}
                    alt={product.name}
                    width={64}
                    height={64}
                    className={
                      `w-full h-full max-h-full max-w-full grayscale ` +
                      (
                        !product.image || product.image === "/Groserybasket.png"
                          ? "object-contain p-1"
                          : "object-cover"
                      )
                    }
                  />
                </div>

                {/* Cart indicator if product is in cart */}
                {inCart && (
                  <div className="absolute top-1 right-1 bg-yellow-400 rounded-md px-2 py-0.5 flex items-center text-xs shadow-sm">
                    <ShoppingCart className="h-3 w-3 mr-0.5" />
                    <span>{inCart.cartQuantity}</span>
                  </div>
                )}

                {/* Product Info */}
                <div className="p-1 sm:p-2 flex-1 flex flex-col justify-between">
                  {/* Price */}
                  <p className="text-xs sm:text-base font-bold text-gray-900 leading-tight">$ {product.price.toLocaleString()}</p>
                  {/* Product Name */}
                  <h3 className="font-normal sm:font-medium text-xs sm:text-sm leading-tight line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] text-gray-800">
                    {product.name}
                  </h3>
                  {/* Plus/Minus Buttons si el producto está en el carrito */}
                  <div className="flex justify-between items-center mt-2 w-full">
                    {inCart ? (
                      <>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            decrementCartItem(product.id);
                          }}
                          className="w-9 h-9 rounded-md border-2 border-gray-800 flex items-center justify-center hover:bg-gray-100"
                          aria-label={`Quitar ${product.name} del carrito`}
                        >
                          <Minus className="h-5 w-5" />
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            addToCart(product);
                          }}
                          className="w-9 h-9 rounded-md border-2 border-gray-800 flex items-center justify-center hover:bg-gray-100"
                          aria-label={`Añadir ${product.name} al carrito`}
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        className="w-9 h-9 rounded-md border-2 border-gray-800 flex items-center justify-center hover:bg-gray-100"
                        aria-label={`Añadir ${product.name} al carrito`}
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Cart Bar */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white py-3 px-4 rounded-none shadow-lg">
          <div className="max-w-4xl mx-auto w-full">
            <button className="w-full flex items-center justify-between" onClick={navigateToCart}>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-700 rounded-md flex items-center justify-center mr-3">
                  {cartItemCount}
                </div>
                <span className="text-lg font-medium">Canasta</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">{cartTotal.toLocaleString()} MXN</span>
                <ChevronRight className="h-5 w-5" />
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
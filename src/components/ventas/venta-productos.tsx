// Al dar click en modal "VENTA DE PRODUCTOS" se muestra este componente.

"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Search, Barcode, ShoppingCart, ChevronRight, Plus, Minus } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import CreateProductForm from "@/components/inventario/create-product-form"
import TopProfileMenu from "@/components/shared/top-profile-menu"
import { supabase } from "@/lib/supabase/supabaseClient"
import { useStore } from "@/lib/contexts/StoreContext"
import SelectProductModal from "@/components/shared/select_product_modal"

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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([]);
  const [categories, setCategories] = useState<string[]>([])
  // New state to control whether to show the create product form
  const [showCreateProductForm, setShowCreateProductForm] = useState(false)
  // New state to control whether to show the select product modal
  const [showSelectProductModal, setShowSelectProductModal] = useState(false)

  // Nueva función para refrescar inventario
  const fetchInventory = async () => {
    if (!selectedStore) return;
    // 1. Obtener inventario de la tienda (solo productos custom por ahora)
    const { data: inventory, error } = await supabase
      .from("store_inventory")
      .select("product_reference_id, quantity, name_alias, unit_price")
      .eq("store_id", selectedStore.store_id)
      .eq("product_type", "custom")
    if (error) {
      console.error("Error fetching inventory:", error)
      return
    }
    if (!inventory || inventory.length === 0) {
      setProducts([])
      setCategories([])
      return
    }
    // 2. Obtener los datos de los productos custom
    const productIds = inventory.map((item) => item.product_reference_id)
    const { data: productsData, error: prodError } = await supabase
      .from("store_products")
      .select("store_product_id, name, category, image, barcode")
      .in("store_product_id", productIds)
      .eq("is_active", true)
    if (prodError) {
      console.error("Error fetching products:", prodError)
      return
    }
    // 3. Mapear al formato Product
    const productsMapped = inventory.map((inv) => {
      const prod = productsData.find((p) => p.store_product_id === inv.product_reference_id)
      return {
        id: inv.product_reference_id,
        name: prod?.name || "Sin nombre",
        price: Number(inv.unit_price) || 0,
        quantity: Number(inv.quantity) || 0,
        category: prod?.category || "Sin categoría",
        image: prod?.image || "/Groserybasket.png",
        productId: inv.product_reference_id.toString(),
        productType: "custom"
      }
    })
    setProducts(productsMapped)
    setCategories(Array.from(new Set(productsMapped.map((p) => p.category))))
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

  // Filtrar productos basados en búsqueda y categoría
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true
    return matchesSearch && matchesCategory
  })

  // Añadir producto al carrito
  const addToCart = (product: Product) => {
    if (product.quantity <= 0) return // No añadir productos sin stock

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)

      if (existingItem) {
        // Si ya existe en el carrito, incrementar cantidad
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item,
        )
      } else {
        // Si no existe, añadirlo con cantidad 1
        return [...prevCart, { 
          ...product, 
          cartQuantity: 1,
          productId: product.id.toString(),
          productType: "custom"
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
    <div className="flex flex-col min-h-screen bg-gray-100 pb-16 pt-16">
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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o código"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-sm"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="px-4 overflow-x-auto max-w-4xl mx-auto w-full">
        <div className="flex space-x-2 pb-3">
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
            onClick={() => setShowSelectProductModal(true)}
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
            const isOutOfStock = product.quantity <= 0

            return (
              <div
                key={product.id}
                onClick={() => !isOutOfStock && addToCart(product)}
                className={cn(
                  "bg-white rounded-lg overflow-hidden relative flex flex-col shadow-sm",
                  isOutOfStock
                    ? "opacity-70"
                    : "cursor-pointer hover:shadow-md transition-all hover:translate-y-[-2px]",
                  "p-1 sm:p-2"
                )}
              >
                {/* Product Image - Improved sizing and styling */}
                <div className={cn("h-16 sm:h-20 bg-gray-200 flex items-center justify-center")}>
                  <img
                    src={product.image || "/Groserybasket.png"}
                    alt={product.name}
                    className={
                      `w-full h-full max-h-full max-w-full grayscale ` +
                      (
                        !product.image || product.image === "/Groserybasket.png"
                          ? "object-contain p-1"
                          : "object-cover"
                      )
                    }
                  />

                  {/* Add button overlay for desktop */}
                  {!isOutOfStock && !inCart && (
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity sm:flex">
                      <div className="bg-yellow-400 rounded-full p-2 shadow-md">
                        <Plus className="h-6 w-6" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Cart indicator if product is in cart */}
                {inCart && (
                  <div className="absolute top-1 right-1 bg-yellow-400 rounded-md px-2 py-0.5 flex items-center text-xs shadow-sm">
                    <ShoppingCart className="h-3 w-3 mr-0.5" />
                    <span>{inCart.cartQuantity}</span>
                  </div>
                )}

                {/* Product Info - Improved layout and spacing */}
                <div className="p-1 sm:p-2 flex-1 flex flex-col justify-between">
                  {/* Price */}
                  <p className="text-xs sm:text-base font-bold text-gray-900 leading-tight">$ {product.price.toLocaleString()}</p>

                  {/* Product Name - Ensure it wraps properly */}
                  <h3 className="font-normal sm:font-medium text-xs sm:text-sm leading-tight line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] text-gray-800">
                    {product.name}
                  </h3>

                  {/* Availability */}
                  <p
                    className={cn(
                      "text-[10px] sm:text-xs mt-1",
                      product.quantity <= 0 ? "text-red-500" : "text-gray-500"
                    )}
                  >
                    <span className="sm:hidden">DISP</span>
                    <span className="hidden sm:inline">disponibles</span>
                    : {product.quantity}
                  </p>

                  {/* Add/Remove Buttons */}
                  <div className="flex justify-between items-center mt-1 w-full">
                    {inCart ? (
                      <>
                        {/* Minus button moved to the left */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            decrementCartItem(product.id)
                          }}
                          className="w-9 h-9 rounded-md border-2 border-gray-800 flex items-center justify-center hover:bg-gray-100"
                          aria-label={`Quitar ${product.name} del carrito`}
                        >
                          <Minus className="h-5 w-5" />
                        </button>

                        {/* Plus button stays on the right */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            addToCart(product)
                          }}
                          disabled={isOutOfStock}
                          className={cn(
                            "w-9 h-9 rounded-md border-2 border-gray-800 flex items-center justify-center hover:bg-gray-100",
                            isOutOfStock && "opacity-50 cursor-not-allowed",
                          )}
                          aria-label={`Añadir ${product.name} al carrito`}
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Empty div to maintain layout when not in cart */}
                        <div></div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            addToCart(product)
                          }}
                          disabled={isOutOfStock}
                          className={cn(
                            "w-9 h-9 rounded-md border-2 border-gray-800 flex items-center justify-center hover:bg-gray-100",
                            isOutOfStock && "opacity-50 cursor-not-allowed",
                          )}
                          aria-label={`Añadir ${product.name} al carrito`}
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </>
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

      {/* Select Product Modal */}
      <SelectProductModal
        isOpen={showSelectProductModal}
        onClose={() => setShowSelectProductModal(false)}
        onSelect={(type) => {
          setShowSelectProductModal(false)
          if (type === 'custom') {
            setShowCreateProductForm(true)
          } else {
            console.log('Tipo de producto seleccionado:', type)
            // Aquí puedes manejar la lógica para inventario
          }
        }}
      />
    </div>
  )
}

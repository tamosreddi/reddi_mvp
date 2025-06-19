// Página de la canasta de compras, en Venta de Productos --> Canasta

"use client"

import { useState, useEffect, useRef, useLayoutEffect } from "react"
import { ArrowLeft, CalendarIcon, Trash2, Edit, User, ChevronUp, Plus, Minus, ChevronRight } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import Button from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import PaymentMethodModal from "@/components/shared/payment-method-modal"
import TopProfileMenu from "@/components/shared/top-profile-menu"
import { useStore } from "@/lib/contexts/StoreContext"
import Image from 'next/image'
import IsPaidToggle from "@/components/ui/is-paid-toggle"
import FreeSaleModal from "@/components/shared/free-sale-modal"

// Definición de tipos
interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  cartQuantity: number
  category: string
  image?: string
  productId: string
  productType: string
}

interface Customer {
  id: number
  client_id: string
  name: string
  notes?: string
}

export default function CartView() {
  const router = useRouter()
  const searchParams = useSearchParams();
  const isEdit = searchParams.get("edit") === "1";
  const transactionId = searchParams.get("transaction_id");
  const [date, setDate] = useState<Date>(new Date())
  const [isPaid, setIsPaid] = useState(true)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("productCart")
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          return []
        }
      }
    }
    return []
  })
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [bottomSectionHeight, setBottomSectionHeight] = useState(0)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const bottomSectionRef = useRef<HTMLDivElement>(null)
  const mainContentRef = useRef<HTMLDivElement>(null)
  const [paymentMethod, setPaymentMethod] = useState<string>("Efectivo")
  const { selectedStore } = useStore()
  const cartItemsRef = useRef(cartItems);
  const [isFreeSaleModalOpen, setIsFreeSaleModalOpen] = useState(false)

  // Measure the height of the bottom section using useLayoutEffect for more accurate measurements
  useLayoutEffect(() => {
    const updatePadding = () => {
      if (bottomSectionRef.current) {
        const height = bottomSectionRef.current.offsetHeight
        // Add extra padding (32px) to ensure there's plenty of space
        setBottomSectionHeight(height + 32)
      }
    }

    // Initial measurement
    updatePadding()

    // Set up resize observer to detect any size changes in the bottom section
    const resizeObserver = new ResizeObserver(updatePadding)
    if (bottomSectionRef.current) {
      resizeObserver.observe(bottomSectionRef.current)
    }

    // Also listen for window resize events
    window.addEventListener("resize", updatePadding)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", updatePadding)
    }
  }, [])

  // Ensure padding is updated when cart items change
  useEffect(() => {
    if (bottomSectionRef.current && mainContentRef.current) {
      const height = bottomSectionRef.current.offsetHeight
      setBottomSectionHeight(height + 32) // Extra padding for safety
    }
  }, [cartItems])

  // Load cart from localStorage
  useEffect(() => {
    setIsLoading(true)
    const savedCart = localStorage.getItem("productCart")
    console.log("[cart-view] Cargando carrito desde localStorage:", savedCart)
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        setCartItems(parsedCart)
      } catch (e) {
        console.error("Error parsing cart from localStorage:", e)
      }
    }
    setIsLoading(false)
  }, [])

  // Load selected customer from localStorage
  useEffect(() => {
    const savedCustomer = localStorage.getItem("selectedCustomer")
    console.log("[cart-view] useEffect: localStorage.getItem('selectedCustomer'):", savedCustomer)
    if (savedCustomer) {
      try {
        const parsedCustomer = JSON.parse(savedCustomer)
        if (!parsedCustomer.client_id && parsedCustomer.id) {
          parsedCustomer.client_id = parsedCustomer.id
        }
        setSelectedCustomer(parsedCustomer)
        console.log("[cart-view] setSelectedCustomer:", parsedCustomer)
      } catch (e) {
        console.error("Error parsing customer from localStorage:", e)
      }
    }
  }, [])

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (!isLoading && cartItems.length > 0) {
      console.log("[cart-view] Guardando carrito en localStorage (useEffect):", cartItems)
      localStorage.setItem("productCart", JSON.stringify(cartItems))
    }
  }, [cartItems, isLoading])

  useEffect(() => {
    cartItemsRef.current = cartItems;
  }, [cartItems]);

  // Calculate cart total
  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.cartQuantity, 0)

  // Increment product quantity
  const incrementQuantity = (id: number) => {
    setCartItems((prevItems) => {
      const updated = prevItems.map((item) => {
        if (item.id === id) {
          const newQuantity = item.cartQuantity + 1;
          return { ...item, cartQuantity: newQuantity, quantity: newQuantity };
        }
        return item;
      });
      localStorage.setItem("productCart", JSON.stringify(updated));
      console.log('[cart-view] incrementQuantity (updated):', updated);
      console.log('[cart-view] incrementQuantity (localStorage):', localStorage.getItem("productCart"));
      return updated;
    });
  }

  // Decrement product quantity
  const decrementQuantity = (id: number) => {
    setCartItems((prevItems) => {
      const updated = prevItems.map((item) => {
        if (item.id === id && item.cartQuantity > 1) {
          const newQuantity = item.cartQuantity - 1;
          return { ...item, cartQuantity: newQuantity, quantity: newQuantity };
        }
        return item;
      });
      localStorage.setItem("productCart", JSON.stringify(updated));
      console.log('[cart-view] decrementQuantity (updated):', updated);
      console.log('[cart-view] decrementQuantity (localStorage):', localStorage.getItem("productCart"));
      return updated;
    });
  }

  // Remove product from cart
  const removeItem = (id: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id))
  }

  // Update product price
  const updatePrice = (id: number, newPrice: number) => {
    setCartItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, price: newPrice } : item)))
  }

  // Handle price editing
  const handlePriceEdit = (id: number) => {
    const item = cartItems.find((item) => item.id === id)
    if (!item) return

    const newPrice = Number.parseFloat(
      prompt("Ingrese el nuevo precio:", item.price.toString()) || item.price.toString(),
    )
    if (!isNaN(newPrice) && newPrice >= 0) {
      updatePrice(id, newPrice)
    }
  }

  // Navigate to customer selection
  const navigateToCustomerSelection = () => {
    // Save current path to return to after selection
    const currentPath = "/venta/canasta"
    router.push(`/clientes?select=true&returnTo=${encodeURIComponent(currentPath)}`)
  }

  // Remove selected customer
  const removeSelectedCustomer = () => {
    setSelectedCustomer(null)
    localStorage.removeItem("selectedCustomer")
    console.log("[cart-view] removeSelectedCustomer: cliente eliminado del estado y localStorage")
  }

  // Open payment modal
  const openPaymentModal = () => {
    setIsPaymentModalOpen(true)
  }

  // Close payment modal
  const closePaymentModal = () => {
    setIsPaymentModalOpen(false)
  }

  // Confirm sale with payment method
  const confirmSaleWithPaymentMethod = (paymentMethod: string) => {
    // Aquí normalmente guardarías la venta en la base de datos
    const customerInfo = selectedCustomer ? `para ${selectedCustomer.name}` : ""
    alert(`Venta ${customerInfo} confirmada con éxito! Método de pago: ${paymentMethod}`)

    // Limpiar cliente seleccionado
    setSelectedCustomer(null)
    localStorage.removeItem("selectedCustomer")
    console.log("[cart-view] confirmSaleWithPaymentMethod: cliente eliminado del estado y localStorage")

    setIsPaymentModalOpen(false)
    localStorage.removeItem("productCart")
    router.push("/")
  }

  // Transform cart items to match the API payload format
  const transformCartItems = () => {
    return cartItems.map(item => ({
      productId: item.productId,
      productType: item.productType,
      quantity: item.cartQuantity,
      unitPrice: item.price,
      productName: item.name
    }))
  }

  // Función para regresar al dashboard y limpiar el cliente seleccionado
  const handleBack = (destination: string) => {
    if (destination === "/dashboard") {
      setSelectedCustomer(null)
      localStorage.removeItem("selectedCustomer")
      localStorage.removeItem("productCart")
    }
    router.push(destination)
  }

  // Agregar venta libre a la canasta
  const addFreeSaleToCart = (concept: string, amount: number) => {
    setCartItems((prevItems) => [
      ...prevItems,
      {
        id: Date.now() + Math.floor(Math.random() * 10000), // id único
        name: concept,
        price: amount,
        quantity: 1,
        cartQuantity: 1,
        category: "Venta Libre",
        image: undefined,
        productId: `free-sale-${Date.now()}`,
        productType: "free-sale"
      }
    ])
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <TopProfileMenu
        simpleMode={true}
        title="Canasta"
        onBackClick={() => handleBack("/dashboard/ventas/productos")}
      />

      {/* Main Content - Dynamic padding based on bottom section height */}
      <div
        ref={mainContentRef}
        className="flex-1 p-4 space-y-4 pt-16"
        style={{ paddingBottom: `${bottomSectionHeight}px` }}
      >
        {/* Date and Payment Status */}
        <div className="grid grid-cols-2 gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-2.5 text-left w-full h-10 text-sm"
              >
                <CalendarIcon className="h-4 w-4 text-gray-500" />
                <span className="truncate">{format(date, "'Hoy,' dd MMMM", { locale: es })}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate: Date | undefined) => newDate && setDate(newDate)}
                className="border rounded-md"
              />
            </PopoverContent>
          </Popover>

          {/* IsPaidToggle - Ocultado temporalmente */}
          {/* <IsPaidToggle
            value={isPaid}
            onChange={setIsPaid}
            labels={{ paid: "Pagada", credit: "Deuda" }}
            className="h-10"
          /> */}
        </div>

        {/* Cart Items */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Cargando productos...</div>
          ) : cartItems.length > 0 ? (
            <>
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-xl p-3 shadow-sm flex">
                  {/* Imagen con trash */}
                  {item.productType !== "free-sale" ? (
                    <div className="relative h-14 w-14 rounded-lg bg-gray-100 mr-3 flex-shrink-0 overflow-hidden">
                      <Image
                        src={item.image || "/Groserybasket.png"}
                        alt={item.name}
                        width={56}
                        height={56}
                        className="h-full w-full object-cover grayscale"
                      />
                      <button
                        onClick={() => removeItem(item.id)}
                        className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/10 rounded-lg transition-colors"
                        aria-label="Eliminar producto"
                        style={{ zIndex: 2 }}
                      >
                        <span className="bg-black/80 rounded-full p-1.5 shadow-lg">
                          <Trash2 className="h-5 w-5 text-white" />
                        </span>
                      </button>
                    </div>
                  ) : (
                    <div className="relative h-14 w-14 rounded-lg bg-gray-100 mr-3 flex-shrink-0 overflow-hidden flex items-center justify-center">
                      <span className="text-2xl text-gray-400">💸</span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/10 rounded-lg transition-colors"
                        aria-label="Eliminar venta libre"
                        style={{ zIndex: 2 }}
                      >
                        <span className="bg-black/80 rounded-full p-1.5 shadow-lg">
                          <Trash2 className="h-5 w-5 text-white" />
                        </span>
                      </button>
                    </div>
                  )}
                  {/* Info producto o venta libre */}
                  <div className="flex-1 flex flex-col justify-between">
                    {/* Nombre o concepto */}
                    <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1">{item.name}</h3>
                    {/* Si es venta libre, replica la fila de cantidad/precio pero oculta los botones de cantidad */}
                    {item.productType === "free-sale" ? (
                      <>
                        <div className="flex items-center gap-3 justify-between">
                          {/* Espacio para alinear con los botones de cantidad, pero oculto */}
                          <div className="flex items-center space-x-1 opacity-0 pointer-events-none select-none">
                            <button className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center" disabled>
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="font-medium text-sm">1</span>
                            <button className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center" disabled>
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          {/* Botón editar monto alineado a la derecha */}
                          <button
                            onClick={() => handlePriceEdit(item.id)}
                            className="flex items-center text-gray-900 text-sm font-bold ml-auto"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            <span>${item.price.toFixed(2)}</span>
                          </button>
                        </div>
                        <div className="flex justify-end">
                          <span className="text-xs text-gray-500 mt-0.5">= ${item.price.toFixed(2)}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 justify-between">
                          {/* Cantidad */}
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => decrementQuantity(item.id)}
                              className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center"
                              disabled={item.cartQuantity <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="font-medium text-sm">{item.cartQuantity}</span>
                            <button
                              onClick={() => incrementQuantity(item.id)}
                              className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          {/* Precio unitario alineado a la derecha */}
                          <button
                            onClick={() => handlePriceEdit(item.id)}
                            className="flex items-center text-gray-900 text-sm font-bold ml-auto"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            <span>${item.price.toFixed(2)}</span>
                          </button>
                        </div>
                        <div className="flex justify-end">
                          <span className="text-xs text-gray-500 mt-0.5">= ${(item.price * item.cartQuantity).toFixed(2)}</span>
                        </div>
                      </>
                    )}
                    {item.price === 0 && (
                      <span className="ml-2 px-2 py-0.5 rounded bg-yellow-300 text-yellow-900 text-xs font-semibold">
                        ¡Asigna un precio y se guardará!
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {/* Botón Agregar Venta Libre */}
              <div className="pt-2">
                <button
                  onClick={() => setIsFreeSaleModalOpen(true)}
                  className="flex items-center justify-between w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-medium shadow-sm hover:bg-gray-50"
                  type="button"
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-2">💸</span>
                    <span className="text-xs font-medium">Agregar una venta libre</span>
                  </div>
                  <span className="text-xs text-gray-400 ml-1">(editar total)</span>
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No hay productos en la canasta.
              <div className="mt-4">
                <Button onClick={() => router.push("/venta/productos")} className="bg-blue-500 hover:bg-blue-600">
                  Agregar productos
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Extra spacer div to ensure content is never hidden */}
        <div className="h-4"></div>
      </div>

      {/* Fixed bottom section - with ref to measure height */}
      <div
        ref={bottomSectionRef}
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 space-y-2 z-40 shadow-lg"
      >
        {/* Customer Selection */}
        {selectedCustomer ? (
          <div className="flex items-center justify-between bg-blue-50 px-2 py-1 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 text-sm">{selectedCustomer.name}</h3>
            </div>
            <button onClick={removeSelectedCustomer} className="text-red-500 p-0.5" aria-label="Quitar cliente">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => router.push('/dashboard/clientes?select=true&returnTo=/dashboard/ventas/canasta')}
            className="flex items-center justify-between w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-medium shadow-sm"
          >
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-xs font-medium">Agregar un cliente</span>
              <span className="text-xs text-gray-400 ml-1">(opcional)</span>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </button>
        )}

        {/* Total */}
        <div className="flex justify-between items-center pt-1 pb-1">
          <h3 className="text-xl text-gray-600">Total</h3>
          <div className="flex items-center">
            <span className="text-2xl font-bold">$ {cartTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Confirm Button */}
        <Button
          onClick={isEdit ? () => {
            console.log('[cart-view] Botón Actualizar productos - cartItemsRef.current:', cartItemsRef.current);
            console.log('[cart-view] Botón Actualizar productos - productCart antes:', localStorage.getItem("productCart"));
            localStorage.setItem("productCart", JSON.stringify(cartItemsRef.current));
            const latestCart = JSON.parse(localStorage.getItem("productCart") || "[]");
            console.log('[cart-view] Botón Actualizar productos - latestCart:', latestCart);
            localStorage.setItem("editProductCart", JSON.stringify(latestCart));
            console.log('[cart-view] Botón Actualizar productos - editProductCart después:', localStorage.getItem("editProductCart"));
            if (transactionId) {
              router.push(`/balance/edit-income/${transactionId}`);
            } else {
              router.back();
            }
          } : openPaymentModal}
          size="lg"
          fullWidth
          variant="primary"
          disabled={cartItems.length === 0}
        >
          {isEdit ? "Actualizar productos" : "CONFIRMAR VENTA"}
        </Button>
      </div>

      {/* Payment Method Modal */}
      <PaymentMethodModal
        isOpen={isPaymentModalOpen}
        onClose={closePaymentModal}
        onConfirm={confirmSaleWithPaymentMethod}
        total={cartTotal}
        cartItems={transformCartItems()}
        storeId={selectedStore?.store_id || ""}
        customer={selectedCustomer}
      />

      {/* Free Sale Modal */}
      <FreeSaleModal
        isOpen={isFreeSaleModalOpen}
        onClose={() => setIsFreeSaleModalOpen(false)}
        onAdd={addFreeSaleToCart}
      />
    </div>
  )
}

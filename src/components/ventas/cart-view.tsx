"use client"

import { useState, useEffect, useRef, useLayoutEffect } from "react"
import { ArrowLeft, CalendarIcon, Trash2, Edit, User, ChevronUp, Plus, Minus, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import Button from "@/components/ui/Button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import PaymentMethodModal from "@/components/ventas/sale-confirmation"

// Definición de tipos
interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  cartQuantity: number
  category: string
  image?: string
}

interface Customer {
  id: number
  name: string
  notes?: string
}

export default function CartView() {
  const router = useRouter()
  const [date, setDate] = useState<Date>(new Date())
  const [isPaid, setIsPaid] = useState(true)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [bottomSectionHeight, setBottomSectionHeight] = useState(0)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const bottomSectionRef = useRef<HTMLDivElement>(null)
  const mainContentRef = useRef<HTMLDivElement>(null)
  const [paymentMethod, setPaymentMethod] = useState<string>("Efectivo")

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
    if (savedCustomer) {
      try {
        const parsedCustomer = JSON.parse(savedCustomer)
        setSelectedCustomer(parsedCustomer)
      } catch (e) {
        console.error("Error parsing customer from localStorage:", e)
      }
    }
  }, [])

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("productCart", JSON.stringify(cartItems))
    }
  }, [cartItems, isLoading])

  // Calculate cart total
  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.cartQuantity, 0)

  // Increment product quantity
  const incrementQuantity = (id: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item)),
    )
  }

  // Decrement product quantity
  const decrementQuantity = (id: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id && item.cartQuantity > 1) {
          return { ...item, cartQuantity: item.cartQuantity - 1 }
        }
        return item
      }),
    )
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
    // Here you would typically save the sale with the customer to your database
    const customerInfo = selectedCustomer ? `para ${selectedCustomer.name}` : ""
    alert(`Venta ${customerInfo} confirmada con éxito! Método de pago: ${paymentMethod}`)

    // Clear selected customer
    localStorage.removeItem("selectedCustomer")

    setIsPaymentModalOpen(false)
    router.push("/")
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-yellow-400 p-4 h-16 flex items-center">
        <button onClick={() => router.push("/venta/productos")} className="mr-4" aria-label="Volver">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold">Canasta</h1>
      </div>

      {/* Main Content - Dynamic padding based on bottom section height */}
      <div ref={mainContentRef} className="flex-1 p-4 space-y-4" style={{ paddingBottom: `${bottomSectionHeight}px` }}>
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
                onSelect={(newDate) => newDate && setDate(newDate)}
                locale={es}
                className="border rounded-md"
              />
            </PopoverContent>
          </Popover>

          <div className="flex rounded-lg border border-gray-200 bg-white h-10">
            <button
              type="button"
              className={cn(
                "flex-1 rounded-l-lg py-1.5 px-2 text-center text-sm font-medium transition-colors",
                isPaid ? "bg-green-500 text-white" : "bg-white text-gray-700",
              )}
              onClick={() => setIsPaid(true)}
            >
              Pagada
            </button>
            <button
              type="button"
              className={cn(
                "flex-1 rounded-r-lg py-1.5 px-2 text-center text-sm font-medium transition-colors",
                !isPaid ? "bg-green-500 text-white" : "bg-white text-gray-700",
              )}
              onClick={() => setIsPaid(false)}
            >
              A crédito
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Cargando productos...</div>
          ) : cartItems.length > 0 ? (
            cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-start mb-3">
                  <div className="h-16 w-16 rounded-lg bg-gray-100 mr-3 overflow-hidden">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500"
                        aria-label="Eliminar producto"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500">Categoría: {item.category}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => decrementQuantity(item.id)}
                      className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                      disabled={item.cartQuantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="font-medium">{item.cartQuantity}</span>
                    <button
                      onClick={() => incrementQuantity(item.id)}
                      className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center">
                    <button onClick={() => handlePriceEdit(item.id)} className="flex items-center text-gray-700 mr-2">
                      <Edit className="h-4 w-4 mr-1" />
                    </button>
                    <span className="font-bold text-lg">${(item.price * item.cartQuantity).toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-2 text-sm text-gray-500 flex justify-between">
                  <span>Precio unitario: ${item.price.toFixed(2)}</span>
                  <span>{item.quantity} disponibles</span>
                </div>
              </div>
            ))
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
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 space-y-4 z-40 shadow-lg"
      >
        {/* Customer Selection */}
        {selectedCustomer ? (
          <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{selectedCustomer.name}</h3>
                {selectedCustomer.notes && (
                  <p className="text-xs text-gray-600 line-clamp-1">{selectedCustomer.notes}</p>
                )}
              </div>
            </div>
            <button onClick={removeSelectedCustomer} className="text-red-500 p-1" aria-label="Quitar cliente">
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={navigateToCustomerSelection}
            className="flex items-center justify-between w-full p-3 rounded-lg border border-gray-200 bg-white"
          >
            <div className="flex items-center">
              <User className="h-5 w-5 mr-2 text-gray-500" />
              <span className="text-sm font-medium">Agregar un cliente a la venta</span>
              <span className="text-xs text-gray-400 ml-1">(opcional)</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        )}

        {/* Total */}
        <div className="flex justify-between items-center pt-2">
          <h3 className="text-xl text-gray-600">Total</h3>
          <div className="flex items-center">
            <span className="text-2xl font-bold">$ {cartTotal.toFixed(2)}</span>
            <ChevronUp className="h-5 w-5 ml-2" />
          </div>
        </div>

        {/* Confirm Button */}
        <Button
          onClick={openPaymentModal}
          className="w-full bg-gray-900 text-white p-6 text-lg font-medium uppercase tracking-wide rounded-xl"
          disabled={cartItems.length === 0}
        >
          CONFIRMAR VENTA
        </Button>
      </div>

      {/* Payment Method Modal */}
      <PaymentMethodModal
        isOpen={isPaymentModalOpen}
        onClose={closePaymentModal}
        onConfirm={confirmSaleWithPaymentMethod}
        total={cartTotal}
        paymentMethod={paymentMethod}
      />
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import Button from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/hooks/useAuth"
import { toast } from "sonner"
import type { AuthContextType } from "@/lib/contexts/AuthContext"

interface CartItem {
  productId: string
  productType: string
  quantity: number
  unitPrice: number
}

interface PaymentMethodModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (method: string) => void
  total: number
  cartItems: CartItem[]
  storeId: string
}

export default function PaymentMethodModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  total, 
  cartItems,
  storeId 
}: PaymentMethodModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState("efectivo")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const auth = useAuth() as AuthContextType
  const user = auth.user

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleConfirm = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para realizar una venta")
      return
    }

    setIsLoading(true)
    try {
      // Mapeo de métodos de pago a los valores válidos para la base de datos
      const paymentMethodMap: Record<string, string> = {
        efectivo: "cash",
        tarjeta: "card",
        transferencia: "transfer",
        otro: "other"
      };

      const payload = {
        storeId,
        userId: user.id,
        paymentMethod: paymentMethodMap[selectedMethod] || "cash",
        total,
        date: new Date().toISOString(),
        items: cartItems
      }

      console.log("Payload enviado a /api/ventas/registrar-venta:", payload);

      const response = await fetch('/api/ventas/registrar-venta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      console.log("Respuesta del backend:", data);

      if (!data.success) {
        throw new Error(data.error || 'Error al registrar la venta')
      }

      toast.success("Venta registrada exitosamente")
      router.push(`/dashboard/ventas/confirmacion?total=${total}&paymentMethod=${selectedMethod}&transactionId=${data.transactionId}`)
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'Error al registrar la venta')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isVisible) return null

  const paymentMethods = [
    {
      id: "efectivo",
      name: "Efectivo",
      icon: <div className="mb-2 text-2xl">💵</div>,
    },
    {
      id: "tarjeta",
      name: "Tarjeta",
      icon: <div className="mb-2 text-2xl">💳</div>,
    },
    {
      id: "transferencia",
      name: "Transferencia bancaria",
      icon: <div className="mb-2 text-2xl">🏦</div>,
    },
    {
      id: "otro",
      name: "Otro",
      icon: <div className="mb-2 text-2xl">⚙️</div>,
    },
  ]

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md rounded-t-xl bg-white p-6 shadow-lg transition-transform duration-300 relative z-51 ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Selecciona el método de pago</h2>
          <button
            onClick={onClose}
            className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition absolute top-4 right-4 z-10"
            aria-label="Cerrar"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={cn(
                "flex flex-col items-center justify-center rounded-lg border p-4 text-center transition-colors",
                selectedMethod === method.id ? "border-green-500 bg-green-50" : "border-gray-200 bg-white",
              )}
            >
              {method.icon}
              <span className="text-sm">{method.name}</span>
            </button>
          ))}
        </div>

        <Button
          onClick={handleConfirm}
          size="lg"
          fullWidth
          variant="primary"
          disabled={isLoading}
        >
          {isLoading ? "PROCESANDO..." : "CREAR VENTA"}
        </Button>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import Button from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface PaymentMethodModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (method: string) => void
  total: number
}

export default function PaymentMethodModal({ isOpen, onClose, onConfirm, total }: PaymentMethodModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState("efectivo")
  const router = useRouter()

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

  const handleConfirm = () => {
    // Skip the onConfirm callback to avoid any additional confirmations
    // Just navigate directly to the confirmation page
    router.push(`/dashboard/ventas/confirmacion?total=${total}&paymentMethod=${selectedMethod}`)
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
        >
          CREAR VENTA
        </Button>
      </div>
    </div>
  )
}

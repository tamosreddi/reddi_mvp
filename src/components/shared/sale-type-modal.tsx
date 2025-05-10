"use client"

import { X } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface SaleTypeModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SaleTypeModal({ isOpen, onClose }: SaleTypeModalProps) {
  const [isVisible, setIsVisible] = useState(false)
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

  const handleSelectSaleType = (type: "products" | "free") => {
    onClose()
    if (type === "free") {
      router.push("/venta/libre")
    } else {
      router.push("/venta/productos")
    }
  }

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-end justify-center bg-black bg-opacity-50 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md rounded-t-xl bg-white p-6 shadow-lg transition-transform duration-300 relative z-[101] ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Nueva venta</h2>
          <button onClick={onClose} className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
            <X className="h-5 w-5" />
            <span className="sr-only">Cerrar</span>
          </button>
        </div>

        <p className="mb-4 text-gray-600">Selecciona el tipo de venta que quieres hacer.</p>

        <div className="space-y-3">
          <button
            onClick={() => handleSelectSaleType("products")}
            className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white p-4 text-left hover:bg-gray-50"
          >
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                <span role="img" aria-label="Basket" className="text-2xl">
                  🧺
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Venta de productos</h3>
                <p className="text-sm text-gray-600">
                  Registra una venta seleccionando los productos de tu inventario.
                </p>
              </div>
            </div>
            <span className="text-gray-400">›</span>
          </button>

          <button
            onClick={() => handleSelectSaleType("free")}
            className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white p-4 text-left hover:bg-gray-50"
          >
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <span role="img" aria-label="Money" className="text-2xl">
                  💵
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Venta libre</h3>
                <p className="text-sm text-gray-600">Registra un ingreso sin seleccionar productos de tu inventario.</p>
              </div>
            </div>
            <span className="text-gray-400">›</span>
          </button>
        </div>

        <div className="mt-6 flex justify-center">
          <div className="h-1 w-16 rounded-full bg-gray-300"></div>
        </div>
      </div>
    </div>
  )
}


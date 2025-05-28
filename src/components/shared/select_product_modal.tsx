// Este es el MODAL para seleccionar el tipo de producto a agregar.
// Puede ser un producto personalizado o un producto de inventario.
// Aparece cada que el usuario quiere crear o agregar un producto a su inventario

"use client"

import { X } from "lucide-react"
import { useEffect, useState } from "react"

interface SelectProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (type: "custom" | "inventory") => void
}

export default function SelectProductModal({ isOpen, onClose, onSelect }: SelectProductModalProps) {
  const [isVisible, setIsVisible] = useState(false)

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
          <h2 className="text-xl font-bold text-gray-800">Selecciona el tipo de producto</h2>
          <button onClick={onClose} className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
            <X className="h-5 w-5" />
            <span className="sr-only">Cerrar</span>
          </button>
        </div>

        <p className="mb-4 text-gray-600">¿Qué tipo de producto deseas agregar?</p>

        <div className="space-y-3">
          <button
            onClick={() => { onSelect("custom"); onClose(); }}
            className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white p-4 text-left hover:bg-gray-50"
          >
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <span role="img" aria-label="Custom Product" className="text-2xl">
                  ✨
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Producto Personalizado</h3>
                <p className="text-sm text-gray-600">
                  Crear un producto nuevo que no existe.
                </p>
              </div>
            </div>
            <span className="text-gray-400">›</span>
          </button>

          <button
            onClick={() => { onSelect("inventory"); onClose(); }}
            className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white p-4 text-left hover:bg-gray-50"
          >
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <span role="img" aria-label="Inventory Product" className="text-2xl">
                  📦
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Producto de Inventario</h3>
                <p className="text-sm text-gray-600">Reabastecer un producto ya existente.</p>
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

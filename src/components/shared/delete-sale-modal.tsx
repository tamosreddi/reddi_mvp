// Este es el MODAL cuando un usuario quiere eliminar una venta que ya se habia registrado
// Esto se puede hacer desde balance - income-detail.view.tsx

"use client"

import { X } from "lucide-react"
import { useEffect, useState } from "react"

interface DeleteSaleModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function DeleteSaleModal({ isOpen, onClose, onConfirm }: DeleteSaleModalProps) {
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
      className={`fixed inset-0 z-[100] flex items-end justify-center bg-black bg-opacity-50 transition-opacity duration-300 sm:items-center`}
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-white p-6 shadow-lg transition-transform duration-300 relative z-[101] ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Cerrar</span>
        </button>

        <h2 className="text-lg font-bold text-gray-900 mb-2 text-center">
          ¿Quieres eliminar esta transacción?
        </h2>

        <p className="text-gray-600 text-center mb-6">
          Recuerda que si la eliminas, no volverás a verla en tu balance.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className="w-full rounded-xl bg-red-700 text-white font-bold py-3 text-base hover:bg-red-800 transition"
          >
            SÍ, ELIMINAR
          </button>
          <button
            onClick={onClose}
            className="w-full rounded-xl border border-gray-300 text-gray-900 font-bold py-3 text-base bg-white hover:bg-gray-100 transition"
          >
            NO, CANCELAR
          </button>
        </div>
      </div>
    </div>
  )
}
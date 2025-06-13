//Modeal para agregar una venta libre dentro de la CANASTA

"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import Button from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FreeSaleModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (concept: string, amount: number) => void
}

export default function FreeSaleModal({ isOpen, onClose, onAdd }: FreeSaleModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [concept, setConcept] = useState("")
  const [amount, setAmount] = useState("")
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setConcept("")
      setAmount("")
      setError(null)
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const validate = () => {
    if (!concept.trim()) {
      setError("El concepto es obligatorio.")
      return false
    }
    const num = Number(amount)
    if (isNaN(num) || num <= 0) {
      setError("El monto debe ser un número positivo.")
      return false
    }
    setError(null)
    return true
  }

  const handleAdd = () => {
    if (!validate()) return
    onAdd(concept.trim(), Number(amount))
    onClose()
  }

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
      onClick={onClose}
    >
      <div
        className={cn(
          "w-full max-w-md rounded-t-xl bg-white p-6 shadow-lg transition-transform duration-300 relative z-51",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Agrega una venta libre</h2>
          <button
            onClick={onClose}
            className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition absolute top-4 right-4 z-10"
            aria-label="Cerrar"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>
        <div className="mb-4">
          <label className="block text-lg font-medium text-gray-700 mb-1">Concepto</label>
          <input
            type="text"
            className="w-full rounded-lg border border-gray-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej. Pago extra, propina, etc."
            value={concept}
            onChange={e => setConcept(e.target.value)}
            maxLength={60}
            autoFocus
          />
        </div>
        <div className="mb-4">
          <label className="block text-lg font-medium text-gray-700 mb-1">Monto</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            className="w-full rounded-lg border border-gray-200 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="$0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            inputMode="decimal"
          />
        </div>
        {error && <div className="text-red-500 text-xs mb-3">{error}</div>}
        <Button
          onClick={handleAdd}
          size="lg"
          fullWidth
          variant="primary"
          disabled={!concept.trim() || !amount || isNaN(Number(amount)) || Number(amount) <= 0}
        >
          Agregar Venta Libre
        </Button>
      </div>
    </div>
  )
} 
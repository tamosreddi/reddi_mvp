// Para seleccionar la categoria de un producto

"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import Button from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface CategoryCreateProductModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (category: string) => void
  categories?: string[]
}

const defaultCategories = [
  "Alcohol",
  "Granos",
  "Lacteos"
]

export default function CategoryCreateProductModal({
  isOpen,
  onClose,
  onConfirm,
  categories = defaultCategories
}: CategoryCreateProductModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [selected, setSelected] = useState<string>("")
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    if (isOpen) setIsVisible(true)
    else {
      const timer = setTimeout(() => setIsVisible(false), 300)
      setSelected("")
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleSelect = (cat: string) => {
    onConfirm(cat)
    onClose()
  }

  const handleCancel = () => {
    onClose()
  }

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleCancel}
    >
      <div
        className={`w-full max-w-md rounded-t-2xl bg-white p-6 shadow-lg transition-transform duration-300 relative z-51 ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={handleCancel}
          className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition absolute top-4 right-4 z-10"
          aria-label="Cerrar"
        >
          <X className="h-6 w-6 text-gray-500" />
        </button>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Crear nueva categoría</h2>
        <div className="mb-4">
          <label htmlFor="new-category" className="block text-sm font-medium text-gray-700 mb-2">Nombre de la Nueva Categoría</label>
          <input
            id="new-category"
            type="text"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900"
            placeholder="Ej: Carnes, Verduras, etc."
            autoFocus
          />
        </div>
        <Button
          onClick={() => {
            if (newCategory.trim()) {
              onConfirm(newCategory.trim());
              setNewCategory("");
            }
          }}
          variant="primary"
          size="lg"
          fullWidth
          type="button"
          disabled={!newCategory.trim()}
        >
          Crear nueva categoría
        </Button>
        <Button
          onClick={handleCancel}
          variant="ghost"
          size="sm"
          fullWidth
          className="mt-2 mb-0"
          type="button"
        >
          Cancelar
        </Button>
      </div>
    </div>
  )
}
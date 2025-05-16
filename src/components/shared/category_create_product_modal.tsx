"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import Button from "@/components/ui/Button"
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
    setSelected(cat)
  }

  // Manejar cierre del modal y confirmar selección si existe
  const handleClose = () => {
    if (selected) {
      onConfirm(selected)
    }
    onClose()
  }

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-md rounded-t-2xl bg-white p-6 shadow-lg transition-transform duration-300 relative z-51 ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition absolute top-4 right-4 z-10"
          aria-label="Cerrar"
        >
          <X className="h-6 w-6 text-gray-500" />
        </button>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Selecciona una categoría</h2>
        <div className="max-h-60 overflow-y-auto flex flex-col gap-1 mb-4 pr-1">
          {categories.map((cat) => (
            <label
              key={cat}
              className="flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer hover:bg-gray-50 transition"
            >
              <input
                type="radio"
                name="category"
                value={cat}
                checked={selected === cat}
                onChange={() => handleSelect(cat)}
                className="form-radio h-4 w-4 text-gray-900 border-gray-300 focus:ring-2 focus:ring-gray-900"
              />
              <span className="text-sm text-gray-900 font-medium">{cat}</span>
            </label>
          ))}
        </div>
        <Button
          onClick={() => {
            router.push("/dashboard/categorias/crear-categoria")
            onClose()
          }}
          variant="primary"
          size="lg"
          fullWidth
        >
          Crear nueva categoría
        </Button>
        <Button
          onClick={() => {
            setSelected("");
            onConfirm("");
            onClose();
          }}
          variant="ghost"
          size="sm"
          fullWidth
          className="mt-2 mb-0"
        >
          Cancelar
        </Button>
      </div>
    </div>
  )
}
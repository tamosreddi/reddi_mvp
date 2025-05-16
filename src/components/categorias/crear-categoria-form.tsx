//Forma para crear una nueva categoría de productos

"use client"

import type React from "react"

import { useState } from "react"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import { useRouter, useSearchParams } from "next/navigation"
import TopProfileMenu from "@/components/shared/top-profile-menu"
import { supabase } from "@/lib/supabase/supabaseClient"
import { useStore } from "@/lib/contexts/StoreContext"

export default function CreateCategoryForm() {
  const [name, setName] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { selectedStore } = useStore()

  // Get the return path from query parameters
  const returnTo = searchParams.get("returnTo") || "/inventario"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    if (!selectedStore) {
      setError("No hay tienda activa seleccionada.")
      setLoading(false)
      return
    }
    try {
      const { data, error } = await supabase
        .from("store_product_categories")
        .insert({
          name,
          notes,
          store_id: selectedStore.store_id,
        })
        .select()
      if (error) throw error
      // Navegar de vuelta a la pantalla anterior solo si fue exitoso
      router.push(returnTo)
    } catch (err: any) {
      setError(err.message || "No se pudo registrar la categoría")
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    // Regresa a la página anterior inmediatamente
    router.back()
  }

  return (
    <div className="pb-6 min-h-screen overflow-y-auto">
      <TopProfileMenu 
        simpleMode={true}
        title="Crear categoría"
        onBackClick={handleBack}
      />

      {/* Form content - with padding to account for fixed header */}
      <form onSubmit={handleSubmit} className="mt-20 space-y-4 p-4 pb-32">
        {/* Customer Name */}
        <div>
          <Label htmlFor="name" className="text-lg font-medium">
            Nombre de la categoría <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            className="mt-1 rounded-xl border-gray-200"
            placeholder="Ej: Bebidas, Lacteos, etc."
            required
          />
        </div>


        {/* Error message */}
        {error && <p className="text-center text-red-500">{error}</p>}

        {/* Submit Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={loading}
            isLoading={loading}
          >
            Crear categoría
          </Button>
        </div>
      </form>
    </div>
  )
}

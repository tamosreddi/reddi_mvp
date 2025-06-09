"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Button from "@/components/ui/button"
import Input from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter, useSearchParams } from "next/navigation"
import TopProfileMenu from "@/components/shared/top-profile-menu"
import { useStore } from "@/lib/contexts/StoreContext"

export default function CreateSupplierForm() {
  const [name, setName] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEdit, setIsEdit] = useState(false)
  const [supplierId, setSupplierId] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { selectedStore } = useStore()

  // Get the return path from query parameters
  const returnTo = searchParams.get("returnTo") || "/proveedores"
  const selectMode = searchParams.get("select") === "true"

  // Detect edit mode and fetch supplier data if editing
  useEffect(() => {
    const id = searchParams.get("supplierId")
    if (id) {
      setIsEdit(true)
      setSupplierId(id)
      setLoading(true)
      fetch(`/api/proveedores?storeId=${selectedStore?.store_id || ""}`)
        .then(res => res.json())
        .then(data => {
          const supplier = data.find((s: any) => s.supplier_id === id)
          if (supplier) {
            setName(supplier.name || "")
            setNotes(supplier.notes || "")
          } else {
            setError("Proveedor no encontrado")
          }
        })
        .catch(() => setError("Error al cargar proveedor"))
        .finally(() => setLoading(false))
    }
  }, [searchParams, selectedStore])

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
      let result
      if (isEdit && supplierId) {
        // PATCH para editar proveedor
        const res = await fetch("/api/proveedores", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            supplierId,
            name,
            notes,
          })
        })
        result = await res.json()
        if (!res.ok) throw new Error(result.error || "No se pudo actualizar el proveedor")
        // Si viene de selección, guardar en localStorage
        if (selectMode) {
          localStorage.setItem("selectedSupplier", JSON.stringify({
            supplier_id: result.supplier_id || supplierId,
            name: result.name || name,
            notes: result.notes || notes || ""
          }))
        }
        // Redirigir siempre a la lista de proveedores después de editar
        router.push("/dashboard/proveedores")
        return
      } else {
        // POST para crear proveedor
        const res = await fetch("/api/gastos/crear-proveedor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            notes,
            store_id: selectedStore.store_id,
          })
        })
        result = await res.json()
        if (!result.success) throw new Error(result.error || "No se pudo registrar el proveedor")
        if (result.success && result.data && selectMode) {
          localStorage.setItem("selectedSupplier", JSON.stringify({
            supplier_id: result.data.supplier_id,
            name: result.data.name,
            notes: result.data.notes || ""
          }));
        }
      }
      router.push(returnTo)
    } catch (err: any) {
      setError(err.message || "No se pudo registrar el proveedor")
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="pb-6">
      <TopProfileMenu 
        simpleMode={true}
        title={isEdit ? "Editar proveedor" : "Crear proveedor"}
        onBackClick={handleBack}
      />

      {/* Form content - with padding to account for fixed header */}
      <form onSubmit={handleSubmit} className="mt-16 space-y-4 p-4">
        {/* Customer Name */}
        <div>
          <Label htmlFor="name" className="text-lg font-normal">
            Nombre del proveedor <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            className="mt-1 rounded-xl border-gray-200"
            placeholder="Ej: El Duero"
            required
          />
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes" className="text-lg font-normal">
            Notas
          </Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
            className="mt-1 min-h-[100px] rounded-xl border-gray-200"
            placeholder="Añade información adicional sobre el proveedor"
          />
        </div>

        {/* Required Fields Note */}
        <p className="text-center text-gray-500">Los campos marcados con (*) son obligatorios</p>

        {/* Error message */}
        {error && <p className="text-center text-red-500">{error}</p>}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full rounded-xl bg-gray-800 p-6 text-lg font-medium text-white hover:bg-gray-700"
          disabled={loading}
          isLoading={loading}
        >
          {isEdit ? "Guardar cambios" : "Crear proveedor"}
        </Button>
      </form>
    </div>
  )
}

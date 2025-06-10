"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import Button from "@/components/ui/button"
import Input from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter, useSearchParams } from "next/navigation"
import TopProfileMenu from "@/components/shared/top-profile-menu"
import { supabase } from "@/lib/supabase/supabaseClient"
import { useStore } from "@/lib/contexts/StoreContext"

export default function CreateCustomerForm() {
  const [name, setName] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEdit, setIsEdit] = useState(false)
  const [clientId, setClientId] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { selectedStore } = useStore()

  const select = searchParams.get("select") === "true"
  const returnTo = searchParams.get("returnTo") || "/dashboard/clientes"

  // Detectar modo edición y precargar datos
  useEffect(() => {
    const id = searchParams.get("clientId")
    if (id) {
      setIsEdit(true)
      setClientId(id)
      setLoading(true)
      const fetchClient = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          const accessToken = session?.access_token
          const res = await fetch(`/api/clientes?storeId=${selectedStore?.store_id || ""}`, {
            headers: {
              ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
            }
          })
          const data = await res.json()
          const client = data.find((c: any) => c.client_id === id)
          if (client) {
            setName(client.name || "")
            setNotes(client.notes || "")
          } else {
            setError("Cliente no encontrado")
          }
        } catch {
          setError("Error al cargar cliente")
        } finally {
          setLoading(false)
        }
      }
      fetchClient()
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
      if (isEdit && clientId) {
        // PATCH para editar cliente
        const { data: { session } } = await supabase.auth.getSession()
        const accessToken = session?.access_token
        const res = await fetch("/api/clientes", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
          },
          body: JSON.stringify({
            clientId,
            name,
            notes,
          })
        })
        result = await res.json()
        if (!res.ok) throw new Error(result.error || "No se pudo actualizar el cliente")
        // Si viene de selección, guardar en localStorage
        if (select) {
          localStorage.setItem("selectedCustomer", JSON.stringify({
            client_id: result.client_id || clientId,
            name: result.name || name,
            notes: result.notes || notes || ""
          }))
        }
        // Redirigir siempre a la lista de clientes después de editar
        router.push("/dashboard/clientes")
        return
      } else {
        // POST para crear cliente
        const { data: { session } } = await supabase.auth.getSession()
        const accessToken = session?.access_token
        const res = await fetch("/api/clientes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
          },
          body: JSON.stringify({
            name,
            notes,
            store_id: selectedStore.store_id,
          })
        })
        result = await res.json()
        if (!res.ok) throw new Error(result.error || "No se pudo registrar el cliente")
        if (select && result && result.client_id) {
          localStorage.setItem("selectedCustomer", JSON.stringify({
            client_id: result.client_id,
            name: result.name,
            notes: result.notes || ""
          }))
        }
        router.push(returnTo)
        return
      }
    } catch (err: any) {
      setError(err.message || "No se pudo registrar el cliente")
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.push(`/dashboard/clientes?select=true&returnTo=${encodeURIComponent(returnTo)}`)
  }

  return (
    <div className="pb-6">
      <TopProfileMenu 
        simpleMode={true}
        title={isEdit ? "Editar cliente" : "Crear cliente"}
        onBackClick={handleBack}
      />

      {/* Form content - with padding to account for fixed header */}
      <form onSubmit={handleSubmit} className="mt-14 space-y-4 p-4">
        {/* Customer Name */}
        <div>
          <Label htmlFor="name" className="text-base font-medium">
            Nombre del cliente <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            className="mt-1 rounded-xl border-gray-200"
            placeholder="Ej: Juan Pérez"
            required
          />
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes" className="text-base font-medium">
            Notas
          </Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
            className="mt-1 min-h-[100px] rounded-xl border-gray-200"
            placeholder="Añade información adicional sobre el cliente"
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
          {isEdit ? "Guardar cambios" : "Crear cliente"}
        </Button>
      </form>
    </div>
  )
}

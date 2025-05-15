"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter, useSearchParams } from "next/navigation"
import TopProfileMenu from "@/components/shared/top-profile-menu"

export default function CreateCustomerForm() {
  const [name, setName] = useState("")
  const [notes, setNotes] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get the return path from query parameters
  const returnTo = searchParams.get("returnTo") || "/clientes"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Here you would typically save the customer to your database
    alert(`Cliente "${name}" registrado con éxito!`)

    // Navigate back to the previous screen
    router.push(returnTo)
  }

  const handleBack = () => {
    // Regresa a la página anterior inmediatamente
    router.back()
  }

  return (
    <div className="pb-6">
      <TopProfileMenu 
        simpleMode={true}
        title="Crear cliente"
        onBackClick={handleBack}
      />

      {/* Form content - with padding to account for fixed header */}
      <form onSubmit={handleSubmit} className="mt-20 space-y-4 p-4">
        {/* Customer Name */}
        <div>
          <Label htmlFor="name" className="text-lg font-medium">
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
          <Label htmlFor="notes" className="text-lg font-medium">
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

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full rounded-xl bg-gray-800 p-6 text-lg font-medium text-white hover:bg-gray-700"
        >
          Crear cliente
        </Button>
      </form>
    </div>
  )
}

"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"
import { useAuth } from "@/lib/contexts/AuthContext"
import { supabase } from "@/lib/supabase/supabaseClient"
import { useStore } from "@/lib/contexts/StoreContext"

export default function EditProfileForm() {
  const router = useRouter()
  const { user } = useAuth()
  const { selectedStore } = useStore()
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    phone: "",
    email: "",
    storeName: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Cargar datos actuales del usuario
  useEffect(() => {
    async function fetchProfile() {
      if (!user) return
      setLoading(true)
      // 1. Consulta datos del usuario
      const { data: userData, error: userError } = await supabase
        .from("user")
        .select("name, last_name, phone, email")
        .eq("user_id", user.id)
        .single()
      // 2. Consulta datos de la tienda (primera tienda del usuario)
      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .select("store_name")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .single()
      if (!userError && userData) {
        setFormData({
          name: userData.name || "",
          lastName: userData.last_name || "",
          phone: userData.phone || "",
          email: userData.email || "",
          storeName: storeData?.store_name || "",
        })
      }
      setLoading(false)
    }
    fetchProfile()
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)
    try {
      // 1. Actualiza los datos del usuario
      const { error: updateError } = await supabase
        .from("user")
        .update({
          name: formData.name,
          last_name: formData.lastName,
          phone: formData.phone || null,
        })
        .eq("user_id", user?.id)
      if (updateError) throw updateError

      // 2. Actualiza el nombre de la tienda ACTIVA (selectedStore)
      if (selectedStore && formData.storeName) {
        const { error: storeUpdateError } = await supabase
          .from("stores")
          .update({ store_name: formData.storeName })
          .eq("store_id", selectedStore.store_id)
        if (storeUpdateError) throw storeUpdateError
      }

      setSuccess(true)
      setTimeout(() => router.push("/perfil"), 1000)
    } catch (err: any) {
      setError(err?.message || "Error al guardar cambios")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-yellow-400 p-4 flex items-center h-16 relative">
        <button onClick={() => router.back()} className="mr-4 absolute left-4" aria-label="Volver">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-semibold w-full text-center">Editar perfil</h1>
      </div>

      {/* Form Content */}
      <div className="flex-1 p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field - Required */}
          <div>
            <label htmlFor="name" className="block text-lg font-medium text-gray-800 mb-2">
              Nombre <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              required
            />
          </div>

          {/* Last Name Field */}
          <div>
            <label htmlFor="lastName" className="block text-lg font-medium text-gray-800 mb-2">
              Apellido
            </label>
            <Input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full p-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
          </div>

          {/* Phone Number Field - Not Required */}
          <div>
            <label htmlFor="phone" className="block text-lg font-medium text-gray-800 mb-2">
              Número de celular <span className="text-red-500">*</span>
            </label>
            <div className="flex rounded-xl border border-gray-300 overflow-hidden">
              <div className="flex items-center justify-center px-3 bg-white border-r border-gray-300">
                <div className="w-8 h-6 overflow-hidden">
                  <img src="/us-flag-waving.png" alt="US flag" className="w-full h-full object-cover" />
                </div>
              </div>
              <Input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="flex-1 border-0 p-4 text-lg focus:ring-0"
                required
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-lg font-medium text-gray-800 mb-2">
              Correo
            </label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              disabled
            />
          </div>
          
          {/* Store Name Field */}
          <div>
            <label htmlFor="storeName" className="block text-lg font-medium text-gray-800 mb-2">
              Nombre de la tienda
            </label>
            <Input
              type="text"
              id="storeName"
              name="storeName"
              value={formData.storeName}
              onChange={handleChange}
              className="w-full p-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
          </div>

          {/* Feedback */}
          {error && <p className="text-red-500 text-center">{error}</p>}
          {success && <p className="text-green-600 text-center">¡Perfil actualizado!</p>}

          {/* Submit Button */}
          <div className="pt-6">
            <Button
              type="submit"
              className="w-full bg-blue-100 text-blue-800 font-semibold py-4 rounded-xl hover:bg-blue-200 transition-colors text-lg"
              isLoading={loading}
              disabled={loading}
            >
              Guardar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}


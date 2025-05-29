//sección de perfil del usuario

"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Plus, Facebook, MessageCircle, Share2, Shield, Lock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/AuthContext"
import { supabase } from "@/lib/supabase/supabaseClient"
import { useStore } from "@/lib/contexts/StoreContext"
import TopProfileMenu from "@/components/shared/top-profile-menu"

export default function ProfileView() {
  const router = useRouter()
  const { user } = useAuth()
  const { selectedStore } = useStore()
  const [profile, setProfile] = useState<{ name: string; phone?: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return
      setLoading(true)
      const { data, error } = await supabase
        .from("user")
        .select("name, phone")
        .eq("user_id", user.id)
        .single()
      if (!error && data) {
        setProfile(data)
      }
      setLoading(false)
    }
    fetchProfile()
  }, [user])

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <TopProfileMenu
        simpleMode
        title={selectedStore ? selectedStore.store_name : "Cargando..."}
        onBackClick={() => router.push('/dashboard')}
      />

      {/* Profile Content */}
      <div className="p-4 pt-24">
        {/* User Profile */}
        <div
          className="rounded-xl border border-gray-200 bg-white p-4 cursor-pointer"
          onClick={() => router.push('/perfil/editar')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-16 w-16 rounded-xl bg-purple-100 mr-4 flex items-center justify-center">
                <span className="text-purple-500 text-2xl font-bold">
                  {profile?.name ? profile.name.charAt(0) : "?"}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-semibold">
                  {loading ? "Cargando..." : profile?.name || "Sin nombre"}
                </h2>
                <p className="text-gray-600">{profile?.phone || ""}</p>
              </div>
            </div>
            <button className="text-gray-600" aria-label="Editar perfil">
              <ArrowLeft className="h-6 w-6 rotate-180" />
            </button>
          </div>
        </div>

        {/* Plan Information */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Plan Gratis</h2>
              <div className="flex items-center mt-2 space-x-2">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">0 US$ / Mes</span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">App</span>
              </div>
            </div>
            <button className="text-gray-600" aria-label="Ver planes">
              <ArrowLeft className="h-6 w-6 rotate-180" />
            </button>
          </div>
        </div>

        {/* Add Business y Community Links y Terms and Privacy */}
        <div className="space-y-4">
          <button className="rounded-xl border border-gray-200 bg-white p-4 w-full flex items-center text-left">
            <div className="h-10 w-10 rounded-full border-2 border-gray-800 flex items-center justify-center mr-4">
              <Plus className="h-5 w-5" />
            </div>
            <span className="text-base w-full text-left">Agregar otro negocio</span>
          </button>

          <button className="rounded-xl border border-gray-200 bg-white p-4 w-full flex items-center text-left">
            <div className="h-10 w-10 rounded-full flex items-center justify-center mr-4">
              <Facebook className="h-6 w-6" />
            </div>
            <span className="text-base w-full text-left">Únete a la comunidad de Facebook</span>
          </button>

          <button className="rounded-xl border border-gray-200 bg-white p-4 w-full flex items-center text-left">
            <div className="h-10 w-10 rounded-full flex items-center justify-center mr-4">
              <MessageCircle className="h-6 w-6" />
            </div>
            <span className="text-base w-full text-left">Únete a la comunidad de Whatsapp</span>
          </button>

          <Link href="/terminos" className="rounded-xl border border-gray-200 bg-white p-4 w-full flex items-center text-left">
            <div className="h-10 w-10 rounded-full flex items-center justify-center mr-4">
              <Shield className="h-6 w-6" />
            </div>
            <span className="text-base w-full text-left">Términos y condiciones y política de privacidad</span>
          </Link>

          <Link href="/privacidad" className="rounded-xl border border-gray-200 bg-white p-4 w-full flex items-center text-left">
            <div className="h-10 w-10 rounded-full flex items-center justify-center mr-4">
              <Lock className="h-6 w-6" />
            </div>
            <span className="text-base w-full text-left">Privacidad y tratamiento de datos</span>
          </Link>

          <button className="rounded-xl border border-gray-200 bg-white p-4 w-full flex items-center text-left">
            <div className="h-10 w-10 rounded-full flex items-center justify-center mr-4">
              <Shield className="h-6 w-6 text-red-500" />
            </div>
            <span className="text-base w-full text-left">¿Quieres eliminar tu cuenta?</span>
          </button>
        </div>

        {/* Social Media */}
        <div className="py-6">
          <h2 className="text-lg font-bold text-center mb-6">Síguenos en nuestras redes sociales!</h2>
          <div className="flex justify-center space-x-8">
            <Link href="https://facebook.com" aria-label="Facebook">
              <div className="h-14 w-14 rounded-full bg-blue-600 flex items-center justify-center">
                <Facebook className="h-8 w-8 text-white" />
              </div>
            </Link>
            <Link href="https://instagram.com" aria-label="Instagram">
              <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-500 flex items-center justify-center">
                <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 2H8C4.68629 2 2 4.68629 2 8V16C2 19.3137 4.68629 22 8 22H16C19.3137 22 22 19.3137 22 16V8C22 4.68629 19.3137 2 16 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M17.5 6.5H17.51"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </Link>
            <Link href="https://youtube.com" aria-label="YouTube">
              <div className="h-14 w-14 rounded-full bg-red-600 flex items-center justify-center">
                <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M22.5401 6.42C22.4213 5.94541 22.1794 5.51057 21.8387 5.15941C21.4981 4.80824 21.0708 4.55318 20.6001 4.42C18.8801 4 12.0001 4 12.0001 4C12.0001 4 5.12008 4 3.40008 4.46C2.92933 4.59318 2.50206 4.84824 2.16143 5.19941C1.8208 5.55057 1.57887 5.98541 1.46008 6.46C1.14577 8.20556 0.991319 9.97631 1.00008 11.75C0.988863 13.537 1.14334 15.3213 1.46008 17.08C1.59104 17.5398 1.83839 17.9581 2.17823 18.2945C2.51806 18.6308 2.9389 18.8738 3.40008 19C5.12008 19.46 12.0001 19.46 12.0001 19.46C12.0001 19.46 18.8801 19.46 20.6001 19C21.0708 18.8668 21.4981 18.6118 21.8387 18.2606C22.1794 17.9094 22.4213 17.4746 22.5401 17C22.8524 15.2676 23.0069 13.5103 23.0001 11.75C23.0113 9.96295 22.8568 8.1787 22.5401 6.42Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9.75 15.02L15.5 11.75L9.75 8.48001V15.02Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </Link>
          </div>
        </div>

        {/* Logout Button */}
        <button className="w-full py-3 text-red-600 font-bold text-base">CERRAR SESIÓN</button>

        {/* Copyright */}
        <div className="flex items-center justify-center pt-4 pb-20">
          <div className="h-8 w-10 mr-2">
            <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="512" height="512" rx="256" fill="#F5F5F5" />
            </svg>
          </div>
          <div className="text-sm text-gray-600">
            © Reddi, Inc. <span className="text-gray-400">V1</span>
          </div>
        </div>
      </div>
    </div>
  )
}

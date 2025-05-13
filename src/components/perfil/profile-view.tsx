"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Plus, Facebook, MessageCircle, Share2, Shield, Lock } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/contexts/AuthContext"
import { supabase } from "@/lib/supabase/supabaseClient"
import { useStore } from "@/lib/contexts/StoreContext"

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
      {/* Header (idéntico a TopProfileMenu) */}
      <header className="bg-yellow-400 p-4 flex items-center h-16 relative">
        <button onClick={() => router.back()} className="mr-4 absolute left-4" aria-label="Volver">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-semibold w-full text-center text-gray-900">
          {selectedStore ? selectedStore.store_name : "Cargando..."}
        </h1>
      </header>

      {/* Profile Content */}
      <div className="flex-1 p-4 space-y-4">
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
                <h2 className="text-xl font-semibold">
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
              <h2 className="text-xl font-semibold">Plan Gratis</h2>
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

        {/* Add Business */}
        <button className="rounded-xl border border-gray-200 bg-white p-4 w-full flex items-center">
          <div className="h-10 w-10 rounded-full border-2 border-gray-800 flex items-center justify-center mr-4">
            <Plus className="h-5 w-5" />
          </div>
          <span className="text-lg">Agregar otro negocio</span>
        </button>

        {/* Community Links */}
        <button className="rounded-xl border border-gray-200 bg-white p-4 w-full flex items-center">
          <div className="h-10 w-10 rounded-full flex items-center justify-center mr-4">
            <Facebook className="h-6 w-6" />
          </div>
          <span className="text-lg">Únete a la comunidad de Facebook</span>
        </button>

        <button className="rounded-xl border border-gray-200 bg-white p-4 w-full flex items-center">
          <div className="h-10 w-10 rounded-full flex items-center justify-center mr-4">
            <MessageCircle className="h-6 w-6" />
          </div>
          <span className="text-lg">Únete a la comunidad de Whatsapp</span>
        </button>

        {/* Terms and Privacy */}
        <Link href="/terminos" className="rounded-xl border border-gray-200 bg-white p-4 w-full flex items-center">
          <div className="h-10 w-10 rounded-full flex items-center justify-center mr-4">
            <Shield className="h-6 w-6" />
          </div>
          <span className="text-lg">Términos y condiciones y política de privacidad</span>
        </Link>

        <Link href="/privacidad" className="rounded-xl border border-gray-200 bg-white p-4 w-full flex items-center">
          <div className="h-10 w-10 rounded-full flex items-center justify-center mr-4">
            <Lock className="h-6 w-6" />
          </div>
          <span className="text-lg">Privacidad y tratamiento de datos</span>
        </Link>

        <button className="rounded-xl border border-gray-200 bg-white p-4 w-full flex items-center">
          <div className="h-10 w-10 rounded-full flex items-center justify-center mr-4">
            <Shield className="h-6 w-6 text-red-500" />
          </div>
          <span className="text-lg">¿Quieres eliminar tu cuenta?</span>
        </button>

        {/* Social Media */}
        <div className="py-6">
          <h2 className="text-xl font-bold text-center mb-6">Síguenos en nuestras redes sociales!</h2>
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
        <button className="w-full py-3 text-red-600 font-bold text-xl">CERRAR SESIÓN</button>

        {/* Copyright */}
        <div className="flex items-center justify-center pt-4 pb-20">
          <div className="h-8 w-10 mr-2">
            <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="512" height="512" rx="256" fill="#F5F5F5" />
              <path
                d="M256 0C114.616 0 0 114.616 0 256C0 397.384 114.616 512 256 512C397.384 512 512 397.384 512 256C512 114.616 397.384 0 256 0Z"
                fill="#F5F5F5"
              />
              <path
                d="M256 0C114.616 0 0 114.616 0 256C0 397.384 114.616 512 256 512C397.384 512 512 397.384 512 256C512 114.616 397.384 0 256 0Z"
                fill="#F5F5F5"
              />
              <path d="M52.776 178.087H459.224V333.913H52.776V178.087Z" fill="#FF4B55" />
              <path d="M459.224 57.304H52.776V178.087H459.224V57.304Z" fill="#F5F5F5" />
              <path d="M459.224 333.913H52.776V454.696H459.224V333.913Z" fill="#F5F5F5" />
              <path d="M52.776 57.304H256V178.087H52.776V57.304Z" fill="#41479B" />
              <path
                d="M77.605 68.414L80.224 76.493H88.764L81.875 81.536L84.494 89.615L77.605 84.572L70.716 89.615L73.335 81.536L66.446 76.493H74.986L77.605 68.414Z"
                fill="#F5F5F5"
              />
              <path
                d="M77.605 98.632L80.224 106.711H88.764L81.875 111.754L84.494 119.833L77.605 114.79L70.716 119.833L73.335 111.754L66.446 106.711H74.986L77.605 98.632Z"
                fill="#F5F5F5"
              />
              <path
                d="M77.605 128.85L80.224 136.929H88.764L81.875 141.972L84.494 150.051L77.605 145.008L70.716 150.051L73.335 141.972L66.446 136.929H74.986L77.605 128.85Z"
                fill="#F5F5F5"
              />
              <path
                d="M77.605 159.068L80.224 167.147H88.764L81.875 172.19L84.494 180.269L77.605 175.226L70.716 180.269L73.335 172.19L66.446 167.147H74.986L77.605 159.068Z"
                fill="#F5F5F5"
              />
              <path
                d="M107.823 68.414L110.442 76.493H118.982L112.093 81.536L114.712 89.615L107.823 84.572L100.934 89.615L103.553 81.536L96.664 76.493H105.204L107.823 68.414Z"
                fill="#F5F5F5"
              />
              <path
                d="M107.823 98.632L110.442 106.711H118.982L112.093 111.754L114.712 119.833L107.823 114.79L100.934 119.833L103.553 111.754L96.664 106.711H105.204L107.823 98.632Z"
                fill="#F5F5F5"
              />
              <path
                d="M107.823 128.85L110.442 136.929H118.982L112.093 141.972L114.712 150.051L107.823 145.008L100.934 150.051L103.553 141.972L96.664 136.929H105.204L107.823 128.85Z"
                fill="#F5F5F5"
              />
              <path
                d="M107.823 159.068L110.442 167.147H118.982L112.093 172.19L114.712 180.269L107.823 175.226L100.934 180.269L103.553 172.19L96.664 167.147H105.204L107.823 159.068Z"
                fill="#F5F5F5"
              />
              <path
                d="M138.041 68.414L140.66 76.493H149.2L142.311 81.536L144.93 89.615L138.041 84.572L131.152 89.615L133.771 81.536L126.882 76.493H135.422L138.041 68.414Z"
                fill="#F5F5F5"
              />
              <path
                d="M138.041 98.632L140.66 106.711H149.2L142.311 111.754L144.93 119.833L138.041 114.79L131.152 119.833L133.771 111.754L126.882 106.711H135.422L138.041 98.632Z"
                fill="#F5F5F5"
              />
              <path
                d="M138.041 128.85L140.66 136.929H149.2L142.311 141.972L144.93 150.051L138.041 145.008L131.152 150.051L133.771 141.972L126.882 136.929H135.422L138.041 128.85Z"
                fill="#F5F5F5"
              />
              <path
                d="M138.041 159.068L140.66 167.147H149.2L142.311 172.19L144.93 180.269L138.041 175.226L131.152 180.269L133.771 172.19L126.882 167.147H135.422L138.041 159.068Z"
                fill="#F5F5F5"
              />
              <path
                d="M168.259 68.414L170.878 76.493H179.418L172.529 81.536L175.148 89.615L168.259 84.572L161.37 89.615L163.989 81.536L157.1 76.493H165.64L168.259 68.414Z"
                fill="#F5F5F5"
              />
              <path
                d="M168.259 98.632L170.878 106.711H179.418L172.529 111.754L175.148 119.833L168.259 114.79L161.37 119.833L163.989 111.754L157.1 106.711H165.64L168.259 98.632Z"
                fill="#F5F5F5"
              />
              <path
                d="M168.259 128.85L170.878 136.929H179.418L172.529 141.972L175.148 150.051L168.259 145.008L161.37 150.051L163.989 141.972L157.1 136.929H165.64L168.259 128.85Z"
                fill="#F5F5F5"
              />
              <path
                d="M168.259 159.068L170.878 167.147H179.418L172.529 172.19L175.148 180.269L168.259 175.226L161.37 180.269L163.989 172.19L157.1 167.147H165.64L168.259 159.068Z"
                fill="#F5F5F5"
              />
              <path
                d="M198.477 68.414L201.096 76.493H209.636L202.747 81.536L205.366 89.615L198.477 84.572L191.588 89.615L194.207 81.536L187.318 76.493H195.858L198.477 68.414Z"
                fill="#F5F5F5"
              />
              <path
                d="M198.477 98.632L201.096 106.711H209.636L202.747 111.754L205.366 119.833L198.477 114.79L191.588 119.833L194.207 111.754L187.318 106.711H195.858L198.477 98.632Z"
                fill="#F5F5F5"
              />
              <path
                d="M198.477 128.85L201.096 136.929H209.636L202.747 141.972L205.366 150.051L198.477 145.008L191.588 150.051L194.207 141.972L187.318 136.929H195.858L198.477 128.85Z"
                fill="#F5F5F5"
              />
              <path
                d="M198.477 159.068L201.096 167.147H209.636L202.747 172.19L205.366 180.269L198.477 175.226L191.588 180.269L194.207 172.19L187.318 167.147H195.858L198.477 159.068Z"
                fill="#F5F5F5"
              />
              <path
                d="M228.695 68.414L231.314 76.493H239.854L232.965 81.536L235.584 89.615L228.695 84.572L221.806 89.615L224.425 81.536L217.536 76.493H226.076L228.695 68.414Z"
                fill="#F5F5F5"
              />
              <path
                d="M228.695 98.632L231.314 106.711H239.854L232.965 111.754L235.584 119.833L228.695 114.79L221.806 119.833L224.425 111.754L217.536 106.711H226.076L228.695 98.632Z"
                fill="#F5F5F5"
              />
              <path
                d="M228.695 128.85L231.314 136.929H239.854L232.965 141.972L235.584 150.051L228.695 145.008L221.806 150.051L224.425 141.972L217.536 136.929H226.076L228.695 128.85Z"
                fill="#F5F5F5"
              />
              <path
                d="M228.695 159.068L231.314 167.147H239.854L232.965 172.19L235.584 180.269L228.695 175.226L221.806 180.269L224.425 172.19L217.536 167.147H226.076L228.695 159.068Z"
                fill="#F5F5F5"
              />
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

"use client"

import { useRouter } from "next/navigation"
import TopProfileMenu from "@/components/shared/top-profile-menu"
import Image from 'next/image'

export default function ExploreSection() {
  const router = useRouter()

  // Opciones de navegación inspiradas en la imagen, puedes cambiar los textos y rutas después
  const navigationOptions = [
    { id: "estadisticas", name: "Estadísticas", path: "/estadisticas" },
    { id: "clientes", name: "Clientes", path: "/clientes" },
    { id: "empleados", name: "Empleados", path: "/empleados" },
    { id: "proveedores", name: "Proveedores", path: "/proveedores" },
    { id: "catalogo", name: "Catálogo virtual", path: "/catalogo" },
    { id: "pedidos", name: "Pedidos", path: "/pedidos" },
  ]

  const handleOptionClick = (path: string) => {
    router.push(path)
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <TopProfileMenu />

      {/* Main Content */}
      <div className="flex-1 p-4">
        <h1 className="text-base font-medium text-gray-800 mb-6">Tu negocio</h1>
        <div className="grid grid-cols-4 sm:grid-cols-4 gap-6 max-w-xl mx-auto">
          {navigationOptions.map(option => (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option.path)}
              className="flex flex-col items-center bg-white rounded-xl shadow p-4 hover:bg-gray-100 transition"
            >
              {/* Placeholder para el icono */}
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl text-gray-400">🎯</span>
              </div>
              <span className="text-base text-gray-700 font-medium text-center mt-1">{option.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
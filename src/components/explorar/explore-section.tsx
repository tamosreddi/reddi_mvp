"use client"

import { useRouter } from "next/navigation"
import TopProfileMenu from "@/components/shared/top-profile-menu"

export default function ExploreSection() {
  const router = useRouter()

  // Opciones de navegación reducidas a solo Clientes y Proveedores
  const navigationOptions = [
    {
      id: "clientes",
      name: "Clientes",
      icon: "/icons/customers-icon.png",
      path: "/clientes",
    },
    {
      id: "proveedores",
      name: "Proveedores",
      icon: "/icons/suppliers-icon.png",
      path: "/proveedores",
    },
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
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Tu negocio</h1>

        {/* Navigation Grid - Centered 2 icons with larger size */}
        <div className="flex justify-center gap-8">
          {navigationOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option.path)}
              className="flex flex-col items-center"
            >
              <div className="h-24 w-24 mb-3 bg-white rounded-2xl p-3 shadow-md flex items-center justify-center">
                <img
                  src={option.icon || "/placeholder.svg"}
                  alt={option.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-center text-lg font-medium text-gray-800">{option.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
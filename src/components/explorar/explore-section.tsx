"use client"

import { useRouter } from "next/navigation"
import TopProfileMenu from "@/components/shared/top-profile-menu"
import Image from 'next/image'
import ExploreButton from "./explore-button"

export default function ExploreSection() {
  const router = useRouter()

  // Opciones de navegación inspiradas en la imagen, puedes cambiar los textos y rutas después
  const navigationOptions = [
    { id: "clientes", name: "Clientes", path: "/dashboard/clientes?returnTo=/explorar", imgSrc: "/icons/clientes.png", imgAlt: "Clientes" },
    { id: "proveedores", name: "Proveedores", path: "/dashboard/proveedores?returnTo=/explorar", imgSrc: "/icons/proveedores.png", imgAlt: "Proveedores" },
    { id: "venta-perdida", name: "Ventas Perdidas", path: "/explorar/ventas-perdidas", imgSrc: "/icons/ventas-perdidas.png", imgAlt: "Venta Perdida" },
    { id: "pedidos", name: "Pedidos", path: "/pedidos", imgSrc: "/icons/pedidos.png", imgAlt: "Pedidos" },
    { id: "catalogo", name: "Catálogo virtual", path: "/catalogo", imgSrc: "/icons/catalogo.png", imgAlt: "Catálogo virtual" },
    { id: "empleados", name: "Empleados", path: "/empleados", imgSrc: "/icons/empleados.png", imgAlt: "Empleados" },
  ]

  const handleOptionClick = (path: string) => {
    router.push(path)
  }

  return (
    <div className="flex min-h-screen flex-col bg-reddi-background">
      {/* Header */}
      <TopProfileMenu />

      {/* Main Content */}
      <div className="flex-1 p-4">
        <h1 className="text-lg font-extra-light text-gray-800 mb-6"></h1>
        <div className="grid grid-cols-3 gap-7 max-w-2xl mx-auto">
          {navigationOptions.map(option => (
            <ExploreButton
              key={option.id}
              imgSrc={option.imgSrc}
              imgAlt={option.imgAlt}
              label={option.name}
              onClick={() => handleOptionClick(option.path)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
"use client"

import { useRouter } from "next/navigation"
import TopProfileMenu from "@/components/shared/top-profile-menu"
import Image from 'next/image'

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
        <h1 className="text-lg font-medium text-gray-800 mb-6"></h1>
      </div>
    </div>
  )
}
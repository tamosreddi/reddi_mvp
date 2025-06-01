"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import TopProfileMenu from "@/components/shared/top-profile-menu"
import SaleTypeModal from "@/components/shared/sale-type-modal"
import { VoiceAssistant } from "@/components/voiceassistant"
import Image from "next/image"

export default function Dashboard() {
  const [isSaleTypeModalOpen, setIsSaleTypeModalOpen] = useState(false)
  const router = useRouter()

  const handleSaleButtonClick = () => {
    setIsSaleTypeModalOpen(true)
  }

  return (
    <div className="flex flex-col min-h-screen bg-reddi-background pb-20">
      {/* Top Profile Menu */}
      <TopProfileMenu />

      {/* Quick Access Section */}
      <section className="px-4 py-4">
        {/*<h2 className="text-base font-extra-light text-gray-700 mb-4">Accesos rápidos</h2>*/}

        {/* Registrar Venta Button */}
        <div className="mb-4">
          <button
            onClick={handleSaleButtonClick}
            className="w-full flex items-center p-4 rounded-lg border border-gray-200 bg-white shadow-lg shadow-gray-200"
          >
            <div className="w-12 h-12 flex items-center justify-center bg-blue-50 rounded-full mr-4 shadow-md">
              <Image src="/yellow-cohete.png" alt="Cohete" width={48} height={48} className="object-contain" />
            </div>
            <span className="text-gray-800 font-extra-light">Registrar Venta</span>
          </button>
        </div>

        {/* Registrar Gasto Button */}
        <div className="mb-4">
          <button
            onClick={() => router.push("/dashboard/gastos")}
            className="w-full flex items-center p-4 rounded-lg border border-gray-200 bg-white shadow-lg shadow-gray-200"
          >
            <div className="w-12 h-12 flex items-center justify-center bg-red-50 rounded-full mr-4">
              <Image src="/fuel-expense.png" alt="Gasto" width={48} height={48} className="object-contain" />
            </div>
            <span className="text-gray-800 font-extra-light">Registrar Gasto</span>
          </button>
        </div>

        {/* Ver Inventario Button */}
        <div className="mb-4">
          <button
            onClick={() => router.push("/inventario")}
            className="w-full flex items-center p-4 rounded-lg border border-gray-200 bg-white shadow-lg shadow-gray-200"
          >
            <div className="w-12 h-12 flex items-center justify-center bg-green-50 rounded-full mr-4">
              <Image src="/inventario-icon.png" alt="Inventario" width={48} height={48} className="object-contain" />
            </div>
            <span className="text-gray-800 font-extra-light">Ver Inventario</span>
          </button>
        </div>
      </section>

      {/* Promotional Banner */}
      {/*
      <section className="px-4 py-4 mt-2">
        <div className="bg-blue-700 text-white p-6 rounded-lg relative overflow-hidden">
          <h3 className="text-xl font-bold mb-2">¡No pierdas más dinero!</h3>
          <p className="text-sm mb-4">Con nuestro plan pago organiza tus cuentas por cobrar</p>
          <button
            className="bg-white text-blue-700 px-4 py-2 rounded-md font-medium text-sm"
            onClick={() => router.push("/planes")}
          >
            Explorar planes
          </button>
          <span className="absolute right-4 bottom-4 text-3xl">💰</span>
        </div>
      </section>
      */}

      {/* Sale Type Modal */}
      <SaleTypeModal isOpen={isSaleTypeModalOpen} onClose={() => setIsSaleTypeModalOpen(false)} />

    </div>
  )
}

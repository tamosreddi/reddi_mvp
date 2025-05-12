"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import TopProfileMenu from "@/components/shared/top-profile-menu"
import SaleTypeModal from "@/components/shared/sale-type-modal"

export default function Dashboard() {
  const [isSaleTypeModalOpen, setIsSaleTypeModalOpen] = useState(false)
  const router = useRouter()

  const handleSaleButtonClick = () => {
    setIsSaleTypeModalOpen(true)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      {/* Top Profile Menu */}
      <TopProfileMenu />

      {/* Quick Access Section */}
      <section className="px-4 py-4">
        <h2 className="text-base font-medium text-gray-700 mb-4">Accesos rápidos</h2>

        {/* Registrar Venta Button */}
        <div className="mb-4">
          <button
            onClick={handleSaleButtonClick}
            className="w-full flex items-center p-4 rounded-lg border border-gray-200 bg-white"
          >
            <div className="w-12 h-12 flex items-center justify-center bg-blue-50 rounded-full mr-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="12" width="4" height="7" rx="1" fill="#2563EB" />
                <rect x="10" y="7" width="4" height="12" rx="1" fill="#2563EB" />
                <rect x="17" y="3" width="4" height="16" rx="1" fill="#2563EB" />
              </svg>
            </div>
            <span className="text-gray-800 font-medium">Registrar Venta</span>
          </button>
        </div>

        {/* Registrar Gasto Button */}
        <div className="mb-4">
          <button
            onClick={() => router.push("/dashboard/gastos")}
            className="w-full flex items-center p-4 rounded-lg border border-gray-200 bg-white"
          >
            <div className="w-12 h-12 flex items-center justify-center bg-red-50 rounded-full mr-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 6V18M18 12H6"
                  stroke="#EF4444"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-gray-800 font-medium">Registrar Gasto</span>
          </button>
        </div>

        {/* Ver Inventario Button */}
        <div className="mb-4">
          <button
            onClick={() => router.push("/inventario")}
            className="w-full flex items-center p-4 rounded-lg border border-gray-200 bg-white"
          >
            <div className="w-12 h-12 flex items-center justify-center bg-green-50 rounded-full mr-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M21 16V7.97998C20.9996 7.71499 20.9071 7.45776 20.7365 7.25339C20.566 7.04902 20.3284 6.90866 20.07 6.85998L13.07 5.10998C12.7224 5.03734 12.3625 5.00085 12 4.99998C11.6375 5.00085 11.2776 5.03734 10.93 5.10998L3.93 6.85998C3.67163 6.90866 3.43399 7.04902 3.26345 7.25339C3.0929 7.45776 3.00035 7.71499 3 7.97998V16C3 16.2652 3.10536 16.5196 3.29289 16.7071C3.48043 16.8946 3.73478 17 4 17H20C20.2652 17 20.5196 16.8946 20.7071 16.7071C20.8946 16.5196 21 16.2652 21 16Z"
                  stroke="#10B981"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 9L3.5 7M12 9L20.5 7M12 9V20"
                  stroke="#10B981"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-gray-800 font-medium">Ver Inventario</span>
          </button>
        </div>
      </section>

      {/* Promotional Banner */}
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

      {/* Sale Type Modal */}
      <SaleTypeModal isOpen={isSaleTypeModalOpen} onClose={() => setIsSaleTypeModalOpen(false)} />
    </div>
  )
}

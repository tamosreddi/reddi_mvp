"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Button from "@/components/ui/button"
import { Plus, Minus } from "lucide-react"
import TopProfileMenu from "@/components/shared/top-profile-menu"
import SaleTypeModal from "@/components/shared/sale-type-modal"

export default function DeudasView() {
  const [activeTab, setActiveTab] = useState("por-cobrar")
  const [isSaleTypeModalOpen, setIsSaleTypeModalOpen] = useState(false)
  const router = useRouter()

  // Handle new sale - show modal instead of redirecting
  const handleNewSale = () => {
    setIsSaleTypeModalOpen(true)
  }

  // Handle new expense
  const handleNewExpense = () => {
    router.push("/gasto")
  }

  return (
    <div className="flex min-h-screen flex-col bg-reddi-background">
      {/* Header */}
      <TopProfileMenu />

      {/* Tabs */}
      <Tabs defaultValue="por-cobrar" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-2 h-auto p-0 bg-transparent">
          <TabsTrigger
            value="por-cobrar"
            className={`py-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:shadow-none ${
              activeTab === "por-cobrar" ? "font-bold" : "text-gray-500"
            }`}
          >
            Por cobrar
          </TabsTrigger>
          <TabsTrigger
            value="por-pagar"
            className={`py-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:shadow-none ${
              activeTab === "por-pagar" ? "font-bold" : "text-gray-500"
            }`}
          >
            Por pagar
          </TabsTrigger>
        </TabsList>

        {/* Por Cobrar Tab Content */}
        <TabsContent value="por-cobrar" className="mt-0 flex-1 flex flex-col items-center justify-center p-4">
          <div className="flex flex-col items-center justify-center max-w-md mx-auto text-center mt-8">
            <div className="flex items-center justify-center w-24 h-24 mb-6 bg-green-50 rounded-full">
              <span className="text-6xl" role="img" aria-label="Money">
                💵
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No tienes deudas por cobrar</h2>
            <p className="text-gray-600 mb-8">Créalas en &quot;Nueva venta&quot;</p>
          </div>
        </TabsContent>

        {/* Por Pagar Tab Content */}
        <TabsContent value="por-pagar" className="mt-0 flex-1 flex flex-col items-center justify-center p-4">
          <div className="flex flex-col items-center justify-center max-w-md mx-auto text-center mt-8">
            <div className="flex items-center justify-center w-24 h-24 mb-6 bg-red-50 rounded-full">
              <span className="text-6xl" role="img" aria-label="Money with wings">
                💸
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No tienes deudas por pagar</h2>
            <p className="text-gray-600 mb-8">Créalas en &quot;Nuevo gasto&quot;</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="fixed bottom-16 left-0 right-0 px-4 pb-2 flex gap-2">
        <Button
          onClick={handleNewSale}
          className="flex-1 bg-green-600/80 hover:bg-green-600 text-white rounded-full py-2.5 text-sm shadow-sm"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Nueva venta
        </Button>
        <Button
          onClick={handleNewExpense}
          className="flex-1 bg-red-800/80 hover:bg-red-800 text-white rounded-full py-2.5 text-sm shadow-sm"
        >
          <Minus className="mr-1.5 h-4 w-4" />
          Nuevo gasto
        </Button>
      </div>

      {/* Extra padding at the bottom to prevent content from being hidden behind buttons */}
      <div className="h-20"></div>

      {/* Sale Type Modal */}
      <SaleTypeModal isOpen={isSaleTypeModalOpen} onClose={() => setIsSaleTypeModalOpen(false)} />
    </div>
  )
}

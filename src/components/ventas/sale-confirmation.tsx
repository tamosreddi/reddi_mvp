"use client"

import { useState } from "react"
import { Check, X, Plus, Receipt, Pencil } from "lucide-react"
import { useRouter } from "next/navigation"
import Input from "@/components/ui/Input"

interface SaleConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentMethod: string) => void;
  total: number;
  paymentMethod: string;
}

export default function SaleConfirmation({
  isOpen,
  onClose,
  onConfirm,
  total,
  paymentMethod,
}: SaleConfirmationProps) {
  const router = useRouter()
  const [saleName, setSaleName] = useState("")

  if (!isOpen) return null;

  const handleFinish = () => {
    onClose();
    router.push("/balance")
  }

  const handleNewSale = () => {
    onClose();
    router.push("/balance?showSaleModal=true")
  }

  const handleComprobante = () => {
    alert("La funcionalidad de comprobante será implementada próximamente")
  }

  return (
    <div className="flex flex-col min-h-screen bg-green-600 text-white">
      {/* Main content - Adjusted spacing and typography */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        {/* Check icon - Simplified and centered */}
        <div className="rounded-full bg-green-600 border-4 border-white p-3 mb-8">
          <Check className="h-8 w-8 text-white" />
        </div>

        {/* Title - Reduced font size */}
        <h1 className="text-2xl font-bold mb-4">¡Creaste una venta!</h1>

        {/* Subtitle - Improved spacing and reduced font size */}
        <p className="text-lg mb-10">Se registró en tu balance por un valor de {total} US$.</p>

        {/* Sale name input - Improved styling */}
        <div className="w-full max-w-md mb-16">
          <p className="text-left text-lg mb-3">¿Quieres darle un nombre a esta venta?</p>
          <div className="relative border-b border-white">
            <Pencil className="absolute left-0 top-1/2 transform -translate-y-1/2 text-white h-5 w-5" />
            <Input
              value={saleName}
              onChange={(e) => setSaleName(e.target.value)}
              placeholder="Escríbelo aquí (opcional)"
              className="pl-8 py-2 bg-transparent border-none focus:border-none rounded-none text-white placeholder-white focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>
      </div>

      {/* Bottom actions - Repositioned and improved hierarchy */}
      <div className="fixed bottom-0 left-0 right-0 p-4 flex justify-around items-center">
        {/* Comprobante button - Secondary styling */}
        <button onClick={handleComprobante} className="flex flex-col items-center text-white opacity-80">
          <div className="bg-transparent rounded-full p-2 mb-1">
            <Receipt className="h-5 w-5" />
          </div>
          <span className="text-sm">Comprobante</span>
        </button>

        {/* Finalizar button - Primary styling */}
        <button onClick={handleFinish} className="flex flex-col items-center text-white">
          <div className="bg-white rounded-full p-4 mb-1 shadow-lg">
            <X className="h-6 w-6 text-green-600" />
          </div>
          <span className="text-base font-medium">Finalizar</span>
        </button>

        {/* Nueva venta button - Secondary styling */}
        <button onClick={handleNewSale} className="flex flex-col items-center text-white">
          <div className="bg-white rounded-full p-2 mb-1">
            <Plus className="h-5 w-5 text-green-600" />
          </div>
          <span className="text-sm">Nueva venta</span>
        </button>
      </div>
    </div>
  )
}

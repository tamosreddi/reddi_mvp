// Página de CONFIRMACIÖN al terminar el proceso de venta.

"use client"

import { useState, useEffect } from "react"
import { X, Plus, Receipt, Pencil } from "lucide-react"
import { useRouter } from "next/navigation"
import Input from "@/components/ui/Input"
import { toast } from "sonner"
import { useAuth } from "@/lib/contexts/AuthContext"
import Image from "next/image"

interface SaleConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentMethod: string) => void;
  total: number;
  paymentMethod: string;
  transactionId: string;
}

export default function SaleConfirmation({
  isOpen,
  onClose,
  onConfirm,
  total,
  paymentMethod,
  transactionId,
}: SaleConfirmationProps) {
  const router = useRouter()
  const [saleName, setSaleName] = useState("")
  const { session } = useAuth()
  const [showRocket, setShowRocket] = useState(true)
  const [motivationalMessage, setMotivationalMessage] = useState("")

  const motivationalPhrases = [
    "¡Bien! ¡Creaste una venta!",
    "¡Sigue así!",
    "¡Vas muy bien!",
    "¡Estás que vuelas!",
    "¡Excelente trabajo!",
    "¡Un paso más cerca de tu meta!",
    "¡Imparable!",
    "¡Tu negocio está creciendo!",
  ]

  // Efecto para controlar la animación del cohete y el mensaje de motivación
  useEffect(() => {
    if (isOpen) {
      // Mensaje aleatorio
      const randomIndex = Math.floor(Math.random() * motivationalPhrases.length)
      setMotivationalMessage(motivationalPhrases[randomIndex])

      // Animación del cohete
      setShowRocket(true)
      // Ocultar el cohete después de la animación
      const timer = setTimeout(() => {
        setShowRocket(false)
      }, 2000) // 2 segundos, que es la duración de la animación
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isOpen) return null;

  const handleFinish = async () => {
    if (saleName && transactionId) {
      try {
        console.log("Enviando a /api/ventas/actualizar-descripcion/", { transactionId, saleName, token: session?.access_token });
        const res = await fetch("/api/ventas/actualizar-descripcion/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
          },
          body: JSON.stringify({ transactionId, description: saleName })
        })
        const data = await res.json()
        if (!data.success) throw new Error(data.message)
      } catch (err: any) {
        toast.error(err.message || "No se pudo guardar la descripción de la venta")
      }
    }
    onClose();
    localStorage.removeItem("productCart");
    localStorage.removeItem("selectedCustomer");
    router.push("/balance")
  }

  const handleNewSale = async () => {
    if (saleName && transactionId) {
      try {
        console.log("Enviando a /api/ventas/actualizar-descripcion/", { transactionId, saleName, token: session?.access_token });
        const res = await fetch("/api/ventas/actualizar-descripcion/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
          },
          body: JSON.stringify({ transactionId, description: saleName })
        })
        const data = await res.json()
        if (!data.success) throw new Error(data.message)
      } catch (err: any) {
        toast.error(err.message || "No se pudo guardar la descripción de la venta")
      }
    }
    onClose();
    localStorage.removeItem("productCart");
    localStorage.removeItem("selectedCustomer");
    router.push("/balance?showSaleModal=true")
  }

  // const handleComprobante = () => {
  //   alert("La funcionalidad de comprobante será implementada próximamente")
  // }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-green-600 text-white">
      {/* Rocket animation container */}
      {showRocket && (
        <div className="rocket-animation-container fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
            <Image
              src="/yellow-cohete.png"
              alt="Celebration rocket"
              width={80}
              height={80}
              className="animate-rocket"
              priority
            />
          </div>
        </div>
      )}

      {/* Main content - Adjusted spacing and typography */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        {/* Check icon - Simplified and centered */}
        <div className="mb-8">
          <Image
            src="/icons/manita.png"
            alt="Venta creada"
            width={80}
            height={80}
          />
        </div>

        {/* Title - Reduced font size */}
        <h1 className="text-2xl font-bold mb-4">{motivationalMessage}</h1>

        {/* Subtitle - Improved spacing and reduced font size */}
        {/* <p className="text-lg mb-10">Se registró en tu balance por un valor de {total} US$.</p> */}

        {/* Sale name input - Improved styling */}
        <div className="w-full max-w-md mb-16">
          <p className="text-center text-lg font-light mb-3">¿Quieres darle un nombre a esta venta?</p>
          <div className="relative border-b border-white">
            <Pencil className="absolute left-0 top-1/2 transform -translate-y-1/2 text-white h-5 w-5" />
            <Input
              value={saleName}
              onChange={(e) => setSaleName(e.target.value)}
              placeholder="Escríbelo aquí (opcional)"
              className="pl-8 py-2 bg-transparent border-none focus:border-none rounded-none font-light text-white placeholder:text-white/80 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>
      </div>

      {/* Bottom actions - Repositioned and improved hierarchy */}
      <div className="fixed bottom-0 left-0 right-0 p-4 flex justify-around items-center">
        {/* Comprobante button - Secondary styling */}
        {/* <button onClick={handleComprobante} className="flex flex-col items-center text-white opacity-80">
          <div className="bg-transparent rounded-full p-2 mb-1">
            <Receipt className="h-5 w-5" />
          </div>
          <span className="text-sm">Comprobante</span>
        </button> */}

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

      <style jsx global>{`
        @keyframes rocketFly {
          0% {
            transform: translate(-50%, 100%) rotate(-15deg);
            opacity: 0;
          }
          20% {
            opacity: 1;
            transform: translate(-50%, 60%) rotate(-5deg);
          }
          80% {
            opacity: 1;
            transform: translate(-50%, -60%) rotate(5deg);
          }
          100% {
            transform: translate(-50%, -100%) rotate(15deg);
            opacity: 0;
          }
        }

        .animate-rocket {
          animation: rocketFly 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .rocket-animation-container {
          z-index: 50;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-rocket {
            animation: none;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

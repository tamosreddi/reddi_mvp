"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, Tag, User, ChevronRight, Trash2, DollarSign } from "lucide-react"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, isToday, isTomorrow } from "date-fns"
import { es } from "date-fns/locale"
import { useRouter } from "next/navigation"

interface Customer {
  id: number
  name: string
  notes?: string
}

export default function RegisterSale() {
  const [date, setDate] = useState<Date>(new Date())
  const [isPaid, setIsPaid] = useState(true)
  const [value, setValue] = useState("")
  const [concept, setConcept] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [paymentMethod, setPaymentMethod] = useState("efectivo")
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  // Load selected customer from localStorage
  useEffect(() => {
    const savedCustomer = localStorage.getItem("selectedCustomer")
    if (savedCustomer) {
      try {
        const parsedCustomer = JSON.parse(savedCustomer)
        setSelectedCustomer(parsedCustomer)
      } catch (e) {
        console.error("Error parsing customer from localStorage:", e)
      }
    }
  }, [])

  // Función para formatear la fecha de manera compacta
  const formatCompactDate = (date: Date) => {
    if (isToday(date)) {
      return `Hoy, ${format(date, "dd 'de' MMM", { locale: es })}`
    } else if (isTomorrow(date)) {
      return `Mañana, ${format(date, "dd 'de' MMM", { locale: es })}`
    } else {
      return format(date, "dd 'de' MMMM", { locale: es })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Here you would typically save the sale to your database
    const customerInfo = selectedCustomer ? `para ${selectedCustomer.name}` : ""
    alert(`Venta ${customerInfo} registrada con éxito!`)

    // Clear selected customer
    localStorage.removeItem("selectedCustomer")

    router.push("/")
  }

  // Navigate to customer selection
  const navigateToCustomerSelection = () => {
    // Save current path to return to after selection
    const currentPath = "/venta/libre"
    router.push(`/clientes?select=true&returnTo=${encodeURIComponent(currentPath)}`)
  }

  // Remove selected customer
  const removeSelectedCustomer = () => {
    setSelectedCustomer(null)
    localStorage.removeItem("selectedCustomer")
  }

  // Focus the input when the container is clicked
  const handleContainerClick = () => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  // Format the value with commas for thousands
  const formattedValue = value ? Number.parseFloat(value).toLocaleString("es-MX") : "0"

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="fixed left-0 right-0 top-0 z-10 bg-yellow-400 p-4">
        <div className="flex items-center justify-between h-10">
          <button
            onClick={() => router.push("/")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Nueva venta</h1>
          <div className="w-12"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Form content - with padding to account for fixed header */}
      <form onSubmit={handleSubmit} className="mt-20 space-y-4 p-4">
        {/* Date and Payment Status */}
        <div className="grid grid-cols-2 gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-2 text-left w-full text-xs"
              >
                <CalendarIcon className="h-3.5 w-3.5 text-gray-500" />
                <span className="truncate">{formatCompactDate(date)}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                locale={es}
                className="border rounded-md"
              />
            </PopoverContent>
          </Popover>

          <div className="flex rounded-xl border border-gray-200 bg-white">
            <button
              type="button"
              className={cn(
                "flex-1 rounded-l-xl p-2 text-center font-medium transition-colors text-xs",
                isPaid ? "bg-green-500 text-white" : "bg-white text-gray-700",
              )}
              onClick={() => setIsPaid(true)}
            >
              Pagada
            </button>
            <button
              type="button"
              className={cn(
                "flex-1 rounded-r-xl p-2 text-center font-medium transition-colors text-xs",
                !isPaid ? "bg-green-500 text-white" : "bg-white text-gray-700",
              )}
              onClick={() => setIsPaid(false)}
            >
              A Crédito
            </button>
          </div>
        </div>

        {/* Value Input - Redesigned */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-blue-200 hover:shadow-sm">
          <div className="text-center mb-2">
            <Label htmlFor="value" className="text-lg font-medium text-gray-700">
              Valor <span className="text-red-500">*</span>
            </Label>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative flex items-center w-full max-w-xs">
              <DollarSign className="absolute left-3 h-6 w-6 text-gray-400 pointer-events-none" />
              <Input
                id="value"
                ref={inputRef}
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="pl-12 pr-4 py-6 text-3xl font-bold text-center text-gray-800 border-none rounded-lg focus:ring-blue-200"
                placeholder="0"
                required
                aria-label="Valor de la venta"
              />
            </div>
          </div>
        </div>

        {/* Total Value Display */}
        <div className="flex items-center justify-between rounded-xl bg-gray-100 p-4">
          <span className="text-lg font-medium text-gray-700">Valor Total</span>
          <span className="text-lg font-medium text-green-600">$ {formattedValue}</span>
        </div>

        {/* Concept Input */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <Label htmlFor="concept" className="mb-1 block text-lg font-medium">
            Concepto
          </Label>
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-gray-400" />
            <Input
              id="concept"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              className="border-none shadow-none focus-visible:ring-0"
              placeholder="Dale un nombre a tu venta"
            />
          </div>
        </div>

        {/* Customer Selection */}
        {selectedCustomer ? (
          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-blue-50 p-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-lg font-medium">{selectedCustomer.name}</span>
                {selectedCustomer.notes && <span className="text-sm text-gray-600">{selectedCustomer.notes}</span>}
              </div>
            </div>
            <button type="button" onClick={removeSelectedCustomer} className="text-red-500" aria-label="Quitar cliente">
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={navigateToCustomerSelection}
            className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white p-4"
          >
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-gray-400" />
              <div className="flex flex-col items-start">
                <span className="text-lg font-medium">Cliente</span>
                <span className="text-gray-500">Escoge tu cliente</span>
              </div>
            </div>
            <ChevronRight className="text-gray-400" />
          </button>
        )}

        {/* Payment Method Selection */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Selecciona el método de pago</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod("efectivo")}
              className={cn(
                "flex flex-col items-center justify-center rounded-xl border p-4",
                paymentMethod === "efectivo" ? "border-green-500" : "border-gray-200",
              )}
            >
              <div className="mb-2 text-2xl">💵</div>
              <span>Efectivo</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("tarjeta")}
              className={cn(
                "flex flex-col items-center justify-center rounded-xl border p-4",
                paymentMethod === "tarjeta" ? "border-green-500" : "border-gray-200",
              )}
            >
              <div className="mb-2 text-2xl">💳</div>
              <span>Tarjeta</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("transferencia")}
              className={cn(
                "flex flex-col items-center justify-center rounded-xl border p-4",
                paymentMethod === "transferencia" ? "border-green-500" : "border-gray-200",
              )}
            >
              <div className="mb-2 text-2xl">🏦</div>
              <span>Transferencia bancaria</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("otro")}
              className={cn(
                "flex flex-col items-center justify-center rounded-xl border p-4",
                paymentMethod === "otro" ? "border-green-500" : "border-gray-200",
              )}
            >
              <div className="mb-2 text-2xl">⚙️</div>
              <span>Otro</span>
            </button>
          </div>
        </div>

        {/* Required Fields Note */}
        <p className="text-center text-gray-500">Los campos marcados con (*) son obligatorios</p>

        {/* Submit Button */}
        <Button type="submit" className="w-full rounded-xl bg-blue-500 p-6 text-lg font-medium uppercase tracking-wide">
          Crear Venta
        </Button>
      </form>
    </div>
  )
}

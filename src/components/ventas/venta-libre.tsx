// VENTA LIBRE: Al dar click en Modal tipo de venta

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
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/contexts/AuthContext"
import { useStore } from "@/lib/contexts/StoreContext"
import { supabase } from "@/lib/supabase/supabaseClient"
import TopProfileMenu from "@/components/shared/top-profile-menu"
import IsPaidToggle from "@/components/ui/is-paid-toggle"
import CalendarSelect from "@/components/ui/calendar-select"

interface Customer {
  id: number
  name: string
  notes?: string
  client_id: number
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
  const { toast } = useToast()
  const { user } = useAuth()
  const { selectedStore } = useStore()
  const [isLoading, setIsLoading] = useState(false)

  // Restaurar estado del formulario si existe en localStorage
  useEffect(() => {
    const savedForm = localStorage.getItem("registerSaleForm")
    if (savedForm) {
      try {
        const parsed = JSON.parse(savedForm)
        if (parsed.date) setDate(new Date(parsed.date))
        if (typeof parsed.isPaid === 'boolean') setIsPaid(parsed.isPaid)
        if (parsed.value) setValue(parsed.value)
        if (parsed.concept) setConcept(parsed.concept)
        if (parsed.paymentMethod) setPaymentMethod(parsed.paymentMethod)
      } catch (e) {
        console.error("Error parsing registerSaleForm from localStorage:", e)
      }
      localStorage.removeItem("registerSaleForm")
    }
    // Restaurar cliente seleccionado
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

  const isFormValid = date !== null && value !== "" && Number.parseFloat(value) > 0 && paymentMethod !== ""

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log('Iniciando registro de venta...')
      console.log('User:', user)
      console.log('Selected Store:', selectedStore)
      console.log('Form Data:', { value, concept, paymentMethod, date, selectedCustomer })

      // Validar usuario y tienda
      if (!user) throw new Error("Debes iniciar sesión para registrar una venta")
      if (!selectedStore) throw new Error("Debes seleccionar una tienda")

      const paymentMethodMap = {
        efectivo: "cash",
        tarjeta: "card",
        transferencia: "transfer",
        otro: "other"
      }

      const transactionData = {
        user_id: user.id,
        store_id: selectedStore.store_id,
        transaction_type: 'income',
        value: Number(value),
        quantity: 1,
        transaction_description: concept,
        payment_method: paymentMethodMap[paymentMethod as keyof typeof paymentMethodMap],
        transaction_date: date.toISOString(),
        stakeholder_id: selectedCustomer?.client_id || null,
        stakeholder_type: selectedCustomer ? 'client' : null,
        created_by: user.id,
        is_paid: isPaid,
      }

      console.log('Enviando a Supabase:', transactionData)

      const { data, error } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select()

      console.log('Respuesta de Supabase:', { data, error })

      if (error) throw error

      // Limpiar cliente y formulario temporal después de registrar la venta
      setSelectedCustomer(null)
      localStorage.removeItem("selectedCustomer")
      localStorage.removeItem("registerSaleForm")

      toast({
        title: "Venta registrada con éxito",
        description: `Ingreso: $${value}`,
        variant: "success",
      })

      setValue("")
      setConcept("")
      setPaymentMethod("efectivo")
      setDate(new Date())

      router.push("/balance?tab=ingresos")
    } catch (err: any) {
      console.error('Error en handleSubmit:', err)
      toast({
        title: "Error",
        description: err.message || "No se pudo registrar la venta",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Navigate to customer selection
  const navigateToCustomerSelection = () => {
    // Guardar el estado actual del formulario antes de navegar
    localStorage.setItem(
      "registerSaleForm",
      JSON.stringify({
        date,
        isPaid,
        value,
        concept,
        paymentMethod,
      })
    )
    router.push(`/dashboard/clientes/ver-cliente?select=true&returnTo=${encodeURIComponent("/dashboard/ventas/libre")}`)
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
    <div className="pb-32">
      <TopProfileMenu 
        simpleMode={true}
        title="Nueva venta libre"
        onBackClick={() => {
          setSelectedCustomer(null);
          localStorage.removeItem("selectedCustomer");
          localStorage.removeItem("registerSaleForm");
          router.push('/dashboard');
        }}
      />
      {/* Form content - with padding to account for fixed header */}
      <form onSubmit={handleSubmit} className="mt-20 space-y-4 p-4">
        {/* Date and Payment Status */}
        <div className="grid grid-cols-2 gap-3">
          <CalendarSelect value={date} onChange={setDate} />
          <IsPaidToggle value={isPaid} onChange={setIsPaid} labels={{ paid: "Pagada", credit: "Deuda" }} className="h-12" />
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
              placeholder="Agrega una descripción"
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

        {/* Botón fijo */}
        <div className="fixed bottom-0 left-0 right-0 z-20 bg-white p-4 border-t border-gray-200">
          <Button
            type="submit"
            className={cn(
              "w-full rounded-xl p-6 text-lg font-medium transition-colors bg-gray-800 text-white hover:bg-gray-700"
            )}
            disabled={!isFormValid || isLoading}
            isLoading={isLoading}
          >
            Crear Venta
          </Button>
        </div>
      </form>
    </div>
  )
}

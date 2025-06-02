// VENTA LIBRE: Al dar click en Modal tipo de venta

"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, Tag, User, ChevronRight, Trash2, DollarSign } from "lucide-react"
import Button from "@/components/ui/button"
import Input from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, isToday, isTomorrow } from "date-fns"
import { es } from "date-fns/locale"
import { useRouter } from "next/navigation"
import { useToast } from "@/lib/hooks/use-toast"
import { useAuth } from "@/lib/contexts/AuthContext"
import { useStore } from "@/lib/contexts/StoreContext"
import { supabase } from "@/lib/supabase/supabaseClient"
import TopProfileMenu from "@/components/shared/top-profile-menu"
import IsPaidToggle from "@/components/ui/is-paid-toggle"
import CalendarSelect from "@/components/ui/calendar-select"
import ConceptInput from "../ui/concept-input"
import CustomerSelection from "../ui/customer-selection"
import PaymentMethod from '../ui/payment-method'
import ValueInput from "../ui/value-input"

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
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()
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

      const transactionData = {
        user_id: user.id,
        store_id: selectedStore.store_id,
        transaction_type: 'income',
        transaction_subtype: 'free_sale',
        transaction_description: concept,
        payment_method: paymentMethod,
        transaction_date: date.toISOString(),
        stakeholder_id: selectedCustomer?.client_id || null,
        stakeholder_type: selectedCustomer ? 'client' : null,
        is_paid: isPaid,
        total_amount: Number(value),
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

      toast.success(`Ingreso: $${value}`)

      setValue("")
      setConcept("")
      setPaymentMethod("cash")
      setDate(new Date())

      router.push("/balance?tab=ingresos")
    } catch (err: any) {
      console.error('Error en handleSubmit:', err)
      toast.error(err.message || "No se pudo registrar la venta")
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
      <form onSubmit={handleSubmit} className="mt-14 space-y-4 p-4">
        {/* Date and Payment Status */}
        <div className="grid grid-cols-2 gap-3">
          <CalendarSelect value={date} onChange={setDate} />
          <IsPaidToggle value={isPaid} onChange={setIsPaid} labels={{ paid: "Pagada", credit: "Deuda" }} className="h-12" />
        </div>

        {/* Value Input - Redesigned */}
        <ValueInput value={value} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)} inputRef={inputRef} required />

        {/* Concept Input */}
        <ConceptInput value={concept} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConcept(e.target.value)} />

        {/* Customer Selection */}
        <CustomerSelection
          selectedCustomer={selectedCustomer}
          onRemoveCustomer={removeSelectedCustomer}
          onSelectCustomer={navigateToCustomerSelection}
        />

        {/* Payment Method Selection */}
        <PaymentMethod value={paymentMethod} onChange={setPaymentMethod} />

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

"use client"

import type React from "react"

import { useState, useMemo, useEffect } from "react"
import { Tag, User, Trash2 } from "lucide-react"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useToast } from "@/lib/hooks/use-toast"
import { useAuth } from "@/lib/contexts/AuthContext"
import { useStore } from "@/lib/contexts/StoreContext"
import { supabase } from "@/lib/supabase/supabaseClient"
import IsPaidToggle from "@/components/ui/is-paid-toggle"
import TopProfileMenu from "@/components/shared/top-profile-menu"
import CalendarSelect from '@/components/ui/calendar-select'

interface Supplier {
  id: number
  name: string
  notes?: string
}

export default function RegisterExpense() {
  const [date, setDate] = useState<Date>(new Date())
  const [isPaid, setIsPaid] = useState(true)
  const [expenseCategory, setExpenseCategory] = useState("")
  const [amount, setAmount] = useState("")
  const [supplier, setSupplier] = useState("")
  const [description, setDescription] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("efectivo")
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const toast = useToast()
  const { user } = useAuth()
  const { selectedStore } = useStore()

  // Cargar proveedor seleccionado desde localStorage
  useEffect(() => {
    const savedSupplier = localStorage.getItem("selectedSupplier")
    if (savedSupplier) {
      try {
        const parsedSupplier = JSON.parse(savedSupplier)
        setSelectedSupplier(parsedSupplier)
        setSupplier(parsedSupplier.name) // Actualizar el campo de texto del proveedor
      } catch (e) {
        console.error("Error parsing supplier from localStorage:", e)
      }
    }
  }, [])

  // Check if all mandatory fields are filled
  const isFormValid = useMemo(() => {
    return (
      date !== null && expenseCategory !== "" && amount !== "" && Number.parseFloat(amount) > 0 && paymentMethod !== ""
    )
  }, [date, expenseCategory, amount, paymentMethod])

  const expenseCategories = [
    "Renta",
    "Servicios (Luz, Agua, etc.)",
    "Mercancía",
    "Salarios",
    "Transporte",
    "Mantenimiento",
    "Otro",
  ]

  // Navegar a la selección de proveedores
  const navigateToSupplierSelection = () => {
    // Guardar la ruta actual para volver después de la selección
    const currentPath = "/gasto"
    router.push(`/proveedores?select=true&returnTo=${encodeURIComponent(currentPath)}`)
  }

  // Eliminar proveedor seleccionado
  const removeSelectedSupplier = () => {
    setSelectedSupplier(null)
    setSupplier("")
    localStorage.removeItem("selectedSupplier")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Debug logs
      console.log('Starting expense submission...')
      console.log('User:', user)
      console.log('Selected Store:', selectedStore)

      // Validar que tenemos un usuario y una tienda seleccionada
      if (!user) {
        throw new Error("Debes iniciar sesión para registrar un gasto")
      }

      if (!selectedStore) {
        throw new Error("Debes seleccionar una tienda")
      }

      const paymentMethodMap = {
        efectivo: "cash",
        tarjeta: "card",
        transferencia: "transfer"
      };

      // Solo insertamos los campos básicos
      // Para el registro de gastos, unit_amount es el monto del gasto y quantity es 1
      const transactionData = {
        user_id: user.id,
        store_id: selectedStore.store_id,
        transaction_type: 'expense',
        transaction_description: description,
        payment_method: paymentMethodMap[paymentMethod as keyof typeof paymentMethodMap],
        is_paid: isPaid,
        transaction_subtype: expenseCategory,
        transaction_date: date?.toISOString() || "",
        stakeholder_id: selectedSupplier?.id || null,
        stakeholder_type: 'supplier',
        total_amount: Number.parseFloat(amount) || 0,
      }

      console.log('Sending transaction data:', transactionData)

      const { data, error } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select()

      console.log('Supabase response:', { data, error })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      // Mostrar mensaje de éxito
      toast.success("Gasto creado con éxito")

      // Navegar a la página de balance
      router.push("/balance?tab=egresos")
    } catch (err: any) {
      console.error('Error in handleSubmit:', err)
      toast.error(err.message || "No se pudo crear el gasto")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="pb-32">
      <TopProfileMenu simpleMode={true} title="Nuevo gasto" onBackClick={() => router.back()} />

      {/* Form content - with padding to account for fixed header */}
      <form onSubmit={handleSubmit} className="mt-20 space-y-4 p-4">
        {/* Date and Payment Status on the same line */}
        <div className="grid grid-cols-2 gap-3">
          <CalendarSelect value={date} onChange={setDate} />
          <IsPaidToggle value={isPaid} onChange={setIsPaid} labels={{ paid: "Pagado", credit: "Deuda" }} className="h-12" />
        </div>

        {/* Expense Category */}
        <div>
          <Label htmlFor="expense-category" className="text-base font-bold">
            Categoría del gasto <span className="text-red-500">*</span>
          </Label>
          <Select value={expenseCategory} onValueChange={setExpenseCategory} required>
            <SelectTrigger id="expense-category" className="mt-1 rounded-xl border-gray-200 bg-white p-4">
              <SelectValue placeholder="Selecciona una opción" />
            </SelectTrigger>
            <SelectContent>
              {expenseCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Amount Input */}
        <div>
          <Label htmlFor="amount" className="text-base font-bold">
            Valor <span className="text-red-500">*</span>
          </Label>
          <div className="mt-1 rounded-xl border border-gray-200 bg-white p-4">
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border-none text-right text-lg shadow-none focus-visible:ring-0"
              placeholder="0"
              required
            />
          </div>

          {/* Total Value Display */}
          <div className="flex items-center justify-between rounded-xl bg-gray-100 p-4 mt-2">
            <span className="text-lg font-medium text-gray-700">Valor Total</span>
            <span className="text-lg font-medium text-green-600">$ {amount || "0"}</span>
          </div>
        </div>

        {/* Supplier */}
        <div>
          <Label htmlFor="supplier" className="text-base font-bold">
            Proveedor
          </Label>
          {selectedSupplier ? (
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-blue-50 p-4 mt-1">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-lg font-medium">{selectedSupplier.name}</span>
                  {selectedSupplier.notes && <span className="text-sm text-gray-600">{selectedSupplier.notes}</span>}
                </div>
              </div>
              <button
                type="button"
                onClick={removeSelectedSupplier}
                className="text-red-500"
                aria-label="Quitar proveedor"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={navigateToSupplierSelection}
              className="mt-1 flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-gray-500">Escoge tu proveedor</span>
              </div>
              <span className="text-gray-400">›</span>
            </button>
          )}
        </div>

        {/* Payment Method Selection */}
        <div>
          <Label className="text-base font-bold">
            Método de pago <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-3 gap-3 mt-1">
            <button
              type="button"
              onClick={() => setPaymentMethod("efectivo")}
              className={cn(
                "flex flex-col items-center justify-center rounded-xl border p-4",
                paymentMethod === "efectivo" ? "border-green-500 bg-green-50" : "border-gray-200",
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
                paymentMethod === "tarjeta" ? "border-green-500 bg-green-50" : "border-gray-200",
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
                paymentMethod === "transferencia" ? "border-green-500 bg-green-50" : "border-gray-200",
              )}
            >
              <div className="mb-2 text-2xl">🏦</div>
              <span>Transferencia</span>
            </button>
          </div>
        </div>

        {/* Description Input */}
        <div>
          <Label htmlFor="description" className="text-base font-bold">
            Concepto
          </Label>
          <div className="mt-1 rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-gray-400" />
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border-none shadow-none focus-visible:ring-0"
                placeholder="Añadir una descripción"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="fixed bottom-0 left-0 right-0 z-20 bg-white p-4 border-t border-gray-200">
          <Button
            type="submit"
            size="lg"
            fullWidth
            variant="primary"
            disabled={!isFormValid || isLoading}
            isLoading={isLoading}
          >
            Crear gasto
          </Button>
        </div>
      </form>
    </div>
  )
}

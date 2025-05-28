"use client"

import type React from "react"

import { useState, useMemo, useEffect } from "react"
import { Tag, User, Trash2 } from "lucide-react"
import Button from "@/components/ui/button"
import Input from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useRouter, usePathname } from "next/navigation"
import { useToast } from "@/lib/hooks/use-toast"
import { useAuth } from "@/lib/contexts/AuthContext"
import { useStore } from "@/lib/contexts/StoreContext"
import { supabase } from "@/lib/supabase/supabaseClient"
import IsPaidToggle from "@/components/ui/is-paid-toggle"
import TopProfileMenu from "@/components/shared/top-profile-menu"
import CalendarSelect from '@/components/ui/calendar-select'
import ValueInput from '../ui/value-input'
import ConceptInput from '../ui/concept-input'
import PaymentMethod from '../ui/payment-method'
import SupplierSelection from '../ui/supplier-selection'

interface Supplier {
  supplier_id: number
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
  const pathname = usePathname();

  // Cargar proveedor seleccionado desde localStorage
  useEffect(() => {
    const savedSupplier = localStorage.getItem("selectedSupplier")
    if (savedSupplier) {
      try {
        const parsed = JSON.parse(savedSupplier)
        if (parsed && parsed.supplier_id) {
          parsed.supplier_id = Number(parsed.supplier_id)
        }
        setSelectedSupplier(parsed)
        setSupplier(parsed.name) // Actualizar el campo de texto del proveedor
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
    // Usa la ruta actual para volver después de la selección
    router.push(`/dashboard/proveedores/ver-proveedor?select=true&returnTo=${encodeURIComponent(pathname)}`)
  }

  // Eliminar proveedor seleccionado
  const removeSelectedSupplier = () => {
    setSelectedSupplier(null)
    setSupplier("")
    localStorage.removeItem("selectedSupplier")
  }

  const handleSelectSupplier = () => {
    localStorage.setItem("registerExpenseForm", JSON.stringify({
      date,
      isPaid,
      expenseCategory,
      amount,
      supplier,
      description,
      paymentMethod,
      selectedSupplier,
    }));
    navigateToSupplierSelection();
  }

  useEffect(() => {
    const saved = localStorage.getItem("registerExpenseForm");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.date) setDate(new Date(parsed.date));
        if (parsed.isPaid !== undefined) setIsPaid(parsed.isPaid);
        if (parsed.expenseCategory) setExpenseCategory(parsed.expenseCategory);
        if (parsed.amount) setAmount(parsed.amount);
        if (parsed.supplier) setSupplier(parsed.supplier);
        if (parsed.description) setDescription(parsed.description);
        if (parsed.paymentMethod) setPaymentMethod(parsed.paymentMethod);
        if (parsed.selectedSupplier) setSelectedSupplier(parsed.selectedSupplier);
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("registerExpenseForm", JSON.stringify({
      date,
      isPaid,
      expenseCategory,
      amount,
      supplier,
      description,
      paymentMethod,
      selectedSupplier,
    }));
  }, [date, isPaid, expenseCategory, amount, supplier, description, paymentMethod, selectedSupplier]);

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
        stakeholder_id: selectedSupplier?.supplier_id || null,
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

      // Después de crear el gasto exitosamente o al salir al dashboard:
      localStorage.removeItem("registerExpenseForm");
      localStorage.removeItem("selectedSupplier");
    } catch (err: any) {
      console.error('Error in handleSubmit:', err)
      toast.error(err.message || "No se pudo crear el gasto")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="pb-32">
      <TopProfileMenu
        simpleMode={true}
        title="Nuevo gasto"
        onBackClick={() => {
          localStorage.removeItem("registerExpenseForm");
          localStorage.removeItem("selectedSupplier");
          router.push("/dashboard");
        }}
      />

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
        <ValueInput value={amount} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)} required />
        {/* Total Value Display */}
        <div className="flex items-center justify-between rounded-xl bg-gray-100 p-4 mt-2">
          <span className="text-lg font-medium text-gray-700">Valor Total</span>
          <span className="text-lg font-medium text-green-600">$ {amount || "0"}</span>
        </div>

        {/* Supplier */}
        <div>
          <SupplierSelection
            selectedSupplier={selectedSupplier}
            onRemoveSupplier={removeSelectedSupplier}
            onSelectSupplier={handleSelectSupplier}
          />
        </div>

        {/* Payment Method Selection */}
        <PaymentMethod value={paymentMethod} onChange={setPaymentMethod} />

        {/* Description Input */}
        <ConceptInput value={description} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)} placeholder="Añadir una descripción" />

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

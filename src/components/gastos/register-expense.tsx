"use client"

import type React from "react"

import { useState, useMemo, useEffect } from "react"
import { ArrowLeft, CalendarIcon, Tag, User, Trash2 } from "lucide-react"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"

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
  const router = useRouter()
  const { toast } = useToast()

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Here you would typically save the expense to your database
    // Instead of showing an alert, we'll navigate to Balance and show a toast

    // Show success toast
    toast({
      title: "Gasto creado con éxito",
      description: `${expenseCategory}: $${amount}`,
      variant: "success",
    })

    // Navigate to Balance section
    router.push("/balance")
  }

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="fixed left-0 right-0 top-0 z-10 bg-yellow-400 p-4">
        <div className="flex items-center justify-between h-10">
          <button
            onClick={() => router.back()}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Nuevo gasto</h1>
          <div className="w-12"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Form content - with padding to account for fixed header */}
      <form onSubmit={handleSubmit} className="mt-20 space-y-4 p-4">
        {/* Date and Payment Status on the same line */}
        <div className="grid grid-cols-2 gap-3">
          {/* Date selector */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                id="date"
                type="button"
                className="flex h-12 w-full items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm"
              >
                <CalendarIcon className="h-4 w-4 text-gray-500" />
                <span className="truncate">{format(date, "'Hoy,' dd 'de' MMM", { locale: es })}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                locale={es}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Paid or Debt Toggle */}
          <div className="flex h-12 overflow-hidden rounded-full border border-gray-200">
            <button
              type="button"
              className={cn(
                "flex-1 text-center text-sm font-medium transition-colors",
                isPaid ? "bg-green-500 text-white" : "bg-white text-gray-700",
              )}
              onClick={() => setIsPaid(true)}
            >
              Pagado
            </button>
            <button
              type="button"
              className={cn(
                "flex-1 text-center text-sm font-medium transition-colors",
                !isPaid ? "bg-green-500 text-white" : "bg-white text-gray-700",
              )}
              onClick={() => setIsPaid(false)}
            >
              Deuda
            </button>
          </div>
        </div>

        {/* Expense Category */}
        <div>
          <Label htmlFor="expense-category" className="text-lg font-medium">
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
          <Label htmlFor="amount" className="text-lg font-medium">
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
          <Label htmlFor="supplier" className="text-lg font-medium">
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
          <Label className="text-lg font-medium">
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
          <Label htmlFor="description" className="text-lg font-medium">
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
        <Button
          type="submit"
          className={cn(
            "w-full rounded-xl p-6 text-lg font-medium transition-colors",
            isFormValid ? "bg-gray-800 text-white hover:bg-gray-700" : "bg-gray-300 text-gray-600 hover:bg-gray-400",
          )}
        >
          Crear gasto
        </Button>
      </form>
    </div>
  )
}

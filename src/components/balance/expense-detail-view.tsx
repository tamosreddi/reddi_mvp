"use client"
import { ArrowLeft, Calendar, CreditCard, Grid, FileText, Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface ExpenseDetailProps {
  expense: {
    id: number
    name: string
    amount: number
    paymentMethod: string
    date: Date
    status: string
    category: string
  }
  onClose: () => void
}

export default function ExpenseDetailView({ expense, onClose }: ExpenseDetailProps) {
  return (
    <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-yellow-400 p-4">
        <div className="flex items-center justify-between h-10">
          <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Detalle del gasto</h1>
          <div className="w-10"></div> {/* Spacer for balanced spacing */}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Expense Summary */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-2">Resumen del gasto</h2>

          <div className="text-blue-600 text-sm mb-3">Transacción #{expense.id}</div>

          <div className="border-t border-gray-200 py-3">
            <div className="text-gray-600 text-xs mb-1.5">Concepto</div>
            <div className="text-lg font-bold mt-1">{expense.name}</div>
          </div>

          <div className="border-t border-gray-200 py-3">
            <div className="text-gray-600 text-xs mb-1.5">Valor total</div>
            <div className="text-2xl font-bold mt-1">{expense.amount} US$</div>
          </div>

          <div className="border-t border-gray-200 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <div className="text-gray-600 text-sm">Fecha y hora</div>
              </div>
              <div className="text-gray-800 text-sm">
                {format(expense.date, "h:mm a", { locale: es })} | {format(expense.date, "dd MMM yyyy", { locale: es })}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                <div className="text-gray-600 text-sm">Método de pago</div>
              </div>
              <div className="text-gray-800 text-sm">{expense.paymentMethod}</div>
            </div>
          </div>

          <div className="border-t border-gray-200 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Grid className="h-5 w-5 text-gray-400 mr-2" />
                <div className="text-gray-600 text-sm">Categoría</div>
              </div>
              <div className="text-gray-800 text-sm">{expense.category}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 border-t border-gray-200 bg-white">
        <button className="flex flex-col items-center justify-center py-4 text-gray-600">
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-1">
            <FileText className="h-5 w-5" />
          </div>
          <span className="text-sm">Comprobante</span>
        </button>
        <button className="flex flex-col items-center justify-center py-4 text-gray-800">
          <div className="h-12 w-12 rounded-full bg-gray-800 flex items-center justify-center mb-1">
            <Edit className="h-5 w-5 text-white" />
          </div>
          <span className="text-sm">Editar</span>
        </button>
        <button className="flex flex-col items-center justify-center py-4 text-red-600">
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-1">
            <Trash2 className="h-5 w-5" />
          </div>
          <span className="text-sm">Eliminar</span>
        </button>
      </div>
    </div>
  )
}

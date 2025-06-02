// Detalle de balance. Al dar click en el "Ver Balance" en el balance-view.tsx

"use client"

import { ArrowLeft, FileText, Info, Package, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import TopProfileMenu from "@/components/shared/top-profile-menu"

interface BalanceDetailViewProps {
  date: Date
  incomesTotal: number
  expensesTotal: number
  balanceTotal: number
  incomesByPaymentMethod: {
    cash: number
    other: number
  }
  expensesByPaymentMethod: {
    cash: number
    other: number
  }
  productSales: {
    total: number
    cost: number
    profit: number
    count: number
  }
  onClose: () => void
}

export default function BalanceDetailView({
  date,
  incomesTotal,
  expensesTotal,
  balanceTotal,
  incomesByPaymentMethod,
  expensesByPaymentMethod,
  productSales,
  onClose,
}: BalanceDetailViewProps) {
  // Format number with thousand separators
  const formatNumber = (num: number) => {
    return num.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  }

  return (
    <div className="fixed inset-0 bg-reddi-background z-50 flex flex-col">
      {/* Header */}
      <TopProfileMenu
        simpleMode
        title="Detalle del balance"
        onBackClick={onClose}
      />

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {/* Date */}
        <div className="flex justify-center my-4">
          <div className="bg-yellow-100 rounded-full px-6 py-2 text-center">
            <span className="font-medium">{format(date, "EEEE dd MMM yyyy", { locale: es })}</span>
          </div>
        </div>

        {/* General Summary */}
        <div className="mx-4 mb-4 bg-reddi-background rounded-lg p-4 shadow-sm">
          <div className="flex items-center mb-4">
            <FileText className="h-5 w-5 text-gray-700 mr-2" />
            <h2 className="text-xl font-bold text-gray-800">Resumen General</h2>
          </div>

          <div className="bg-reddi-background rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-lg font-medium">Ingresos</span>
              <span className="text-lg font-bold text-green-600">$ {formatNumber(incomesTotal)}</span>
            </div>

            <div className="flex justify-between items-center mb-3">
              <span className="text-lg font-medium">Egresos</span>
              <span className="text-lg font-bold text-red-600">-$ {formatNumber(expensesTotal)}</span>
            </div>

            <div className="border-t border-gray-200 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="text-lg font-bold">Balance</span>
                  <Info className="h-4 w-4 text-gray-400 ml-2" />
                </div>
                <span className={cn("text-lg font-bold", balanceTotal >= 0 ? "text-green-600" : "text-red-600")}>
                  {balanceTotal >= 0 ? "$" : "-$"} {formatNumber(Math.abs(balanceTotal))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Income Summary */}
        <div className="mx-4 mb-4 bg-reddi-background rounded-lg p-4 shadow-sm">
          <div className="flex items-center mb-4">
            <ArrowUpRight className="h-5 w-5 text-green-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-800">Resumen de ingresos</h2>
          </div>

          <div className="mb-3">
            <div className="text-lg font-medium mb-2">{incomesTotal > 0 ? "1 ventas" : "0 ventas"}</div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-700">Efectivo</span>
              <span className="font-bold">$ {formatNumber(incomesByPaymentMethod.cash)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-700">Otros Medios de pago</span>
              <span className="font-bold">$ {formatNumber(incomesByPaymentMethod.other)}</span>
            </div>
          </div>

          <div className="mb-3">
            <div className="text-lg font-medium mb-2">0 abonos</div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-700">Efectivo</span>
              <span className="font-bold">$ 0</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-700">Otros Medios de pago</span>
              <span className="font-bold">$ 0</span>
            </div>
          </div>
        </div>

        {/* Expense Summary */}
        <div className="mx-4 mb-4 bg-reddi-background rounded-lg p-4 shadow-sm">
          <div className="flex items-center mb-4">
            <ArrowDownRight className="h-5 w-5 text-red-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-800">Resumen de egresos</h2>
          </div>

          <div className="mb-3">
            <div className="text-lg font-medium mb-2">{expensesTotal > 0 ? "1 gastos" : "0 gastos"}</div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-700">Efectivo</span>
              <span className="font-bold">$ {formatNumber(expensesByPaymentMethod.cash)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-700">Otros Medios de pago</span>
              <span className="font-bold">$ {formatNumber(expensesByPaymentMethod.other)}</span>
            </div>
          </div>

          <div className="mb-3">
            <div className="text-lg font-medium mb-2">0 abonos</div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-700">Efectivo</span>
              <span className="font-bold">$ 0</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-700">Otros Medios de pago</span>
              <span className="font-bold">$ 0</span>
            </div>
          </div>
        </div>

        {/* Product Profit */}
        <div className="mx-4 mb-4 bg-reddi-background rounded-lg p-4 shadow-sm">
          <div className="flex items-center mb-2">
            <Package className="h-5 w-5 text-gray-700 mr-2" />
            <h2 className="text-xl font-bold text-gray-800">Ganancia de productos</h2>
          </div>

          <p className="text-gray-600 mb-4">Calculada con las ventas con productos que has registrado.</p>

          <div className="mb-4">
            <div className="text-lg font-medium mb-2">Has realizado {productSales.count} ventas con productos</div>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="text-gray-700">Ventas con productos</span>
            <span className="font-bold">$ {formatNumber(productSales.total)}</span>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="text-gray-700">Costo de productos</span>
            <span className="font-bold text-red-600">-$ {formatNumber(productSales.cost)}</span>
          </div>

          <div className="border-t border-gray-300 mt-3 pt-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="font-bold">Ganancia estimada</span>
                <Info className="h-4 w-4 text-gray-400 ml-2" />
              </div>
              <span className="font-bold">$ {formatNumber(productSales.profit)}</span>
            </div>
          </div>
        </div>

        {/* Extra padding at the bottom */}
        <div className="h-20"></div>
      </div>
    </div>
  )
}
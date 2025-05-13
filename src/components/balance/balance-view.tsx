// Vista principal de balance

"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format, subDays, isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, ChevronRight, Download, ArrowUpRight, ArrowDownRight, Plus, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import Button from "@/components/ui/Button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BalanceHeader from "@/components/balance/balance-header"
import IncomeDetailView from "@/components/balance/income-detail-view"
import ExpenseDetailView from "@/components/balance/expense-detail-view"
import BalanceDetailView from "@/components/balance/balance-detail-view"
import SaleTypeModal from "@/components/shared/sale-type-modal"

// Sample transaction data
const sampleTransactions = [
  {
    id: 13,
    type: "income",
    name: "1 Dispo",
    amount: 550,
    paymentMethod: "Efectivo",
    date: new Date(2025, 4, 13, 12, 16), // May 8, 2025, 12:16
    status: "Pagado",
    category: "",
    profit: 545,
    products: [
      {
        name: "Dispo",
        quantity: 1,
        unitPrice: 550,
        image: "/generic-disposable-device.png",
      },
    ],
  },
  {
    id: 2,
    type: "expense",
    name: "Renta local",
    amount: 800,
    paymentMethod: "Transferencia",
    date: new Date(2025, 4, 13, 10, 30), // May 8, 2025, 10:30
    status: "Pagado",
    category: "Arriendo",
  },
  {
    id: 14,
    type: "expense",
    name: "Gasto 8525171655",
    amount: 888,
    paymentMethod: "Efectivo",
    date: new Date(2025, 4, 8, 12, 16), // May 8, 2025, 12:16
    status: "Pagado",
    category: "Arriendo",
  },
  {
    id: 3,
    type: "expense",
    name: "Servicios",
    amount: 88,
    paymentMethod: "Efectivo",
    date: new Date(2025, 4, 7, 15, 45), // May 7, 2025, 15:45
    status: "Pagado",
    category: "Servicios (Luz, Agua, etc.)",
  },
  {
    id: 4,
    type: "income",
    name: "2 Productos",
    amount: 320,
    paymentMethod: "Tarjeta",
    date: new Date(2025, 4, 6, 9, 20), // May 6, 2025, 9:20
    status: "Pagado",
    category: "",
    products: [
      {
        name: "Refresco Cola",
        quantity: 1,
        unitPrice: 120,
        image: "/refreshing-drink.png",
      },
      {
        name: "Pan Blanco",
        quantity: 1,
        unitPrice: 200,
        image: "/cooking-pan.png",
      },
    ],
  },
  {
    id: 5,
    type: "income",
    name: "Venta mayoreo",
    amount: 1200,
    paymentMethod: "Efectivo",
    date: new Date(2025, 4, 5, 14, 10), // May 5, 2025, 14:10
    status: "Pagado",
    category: "",
  },
  {
    id: 6,
    type: "expense",
    name: "Otro gasto",
    amount: 100,
    paymentMethod: "Efectivo",
    date: new Date(2025, 4, 5, 14, 10),
    status: "Pagado",
    category: "",
  },
]

interface BalanceViewProps {
  onNewSale: () => void
}

export default function BalanceView({ onNewSale }: BalanceViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "egresos" ? "egresos" : "ingresos";
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [activeTab, setActiveTab] = useState(initialTab)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<(typeof sampleTransactions)[0] | null>(null)
  const [showBalanceDetail, setShowBalanceDetail] = useState(false)
  const [isSaleTypeModalOpen, setIsSaleTypeModalOpen] = useState(false)

  // Filter transactions based on selected date and active tab
  const filteredTransactions = sampleTransactions.filter(
    (transaction) =>
      isSameDay(transaction.date, selectedDate) &&
      ((activeTab === "ingresos" && transaction.type === "income") ||
        (activeTab === "egresos" && transaction.type === "expense")),
  )

  // Calculate totals for the selected date
  const incomesTotal = sampleTransactions
    .filter((t) => t.type === "income" && isSameDay(t.date, selectedDate))
    .reduce((sum, t) => sum + t.amount, 0)

  const expensesTotal = sampleTransactions
    .filter((t) => t.type === "expense" && isSameDay(t.date, selectedDate))
    .reduce((sum, t) => sum + t.amount, 0)

  const balanceTotal = incomesTotal - expensesTotal

  // Calculate income by payment method
  const incomesByPaymentMethod = {
    cash: sampleTransactions
      .filter((t) => t.type === "income" && isSameDay(t.date, selectedDate) && t.paymentMethod === "Efectivo")
      .reduce((sum, t) => sum + t.amount, 0),
    other: sampleTransactions
      .filter((t) => t.type === "income" && isSameDay(t.date, selectedDate) && t.paymentMethod !== "Efectivo")
      .reduce((sum, t) => sum + t.amount, 0),
  }

  // Calculate expenses by payment method
  const expensesByPaymentMethod = {
    cash: sampleTransactions
      .filter((t) => t.type === "expense" && isSameDay(t.date, selectedDate) && t.paymentMethod === "Efectivo")
      .reduce((sum, t) => sum + t.amount, 0),
    other: sampleTransactions
      .filter((t) => t.type === "expense" && isSameDay(t.date, selectedDate) && t.paymentMethod !== "Efectivo")
      .reduce((sum, t) => sum + t.amount, 0),
  }

  // Calculate product sales data
  const productSales = {
    count: sampleTransactions.filter(
      (t) => t.type === "income" && isSameDay(t.date, selectedDate) && t.products && t.products.length > 0,
    ).length,
    total: sampleTransactions
      .filter((t) => t.type === "income" && isSameDay(t.date, selectedDate) && t.products && t.products.length > 0)
      .reduce((sum, t) => sum + t.amount, 0),
    cost: 5, // This would normally be calculated from the products
    profit: sampleTransactions
      .filter((t) => t.type === "income" && isSameDay(t.date, selectedDate) && t.profit)
      .reduce((sum, t) => sum + (t.profit || 0), 0),
  }

  // Format number with thousand separators
  const formatNumber = (num: number) => {
    return num.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  }

  // Date navigation
  const handleDateChange = (date: Date) => {
    setSelectedDate(date)
  }

  const handlePreviousDay = () => {
    setSelectedDate((current) => subDays(current, 1))
  }

  const handleNextDay = () => {
    setSelectedDate((current) => {
      const nextDay = new Date(current)
      nextDay.setDate(current.getDate() + 1)
      return nextDay
    })
  }

  // Action handlers
  const handleNewSale = () => {
    setIsSaleTypeModalOpen(true)
  }
  const handleNewExpense = () => {
    router.push("/dashboard/gastos")
  }

  // Get dates for the date selector
  const getDates = () => {
    const today = new Date()
    const dates = []

    for (let i = 3; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      dates.push(date)
    }

    return dates
  }

  // Handle transaction selection
  const handleTransactionClick = (transaction: (typeof sampleTransactions)[0]) => {
    setSelectedTransaction(transaction)
  }

  // Close transaction detail view
  const closeTransactionDetail = () => {
    setSelectedTransaction(null)
  }

  // Show balance detail view
  const handleShowBalanceDetail = () => {
    setShowBalanceDetail(true)
  }

  // Close balance detail view
  const closeBalanceDetail = () => {
    setShowBalanceDetail(false)
  }

  // If a transaction is selected, show the appropriate detail view
  if (selectedTransaction) {
    if (selectedTransaction.type === "income") {
      return <IncomeDetailView transaction={selectedTransaction} onClose={closeTransactionDetail} />
    } else {
      return <ExpenseDetailView expense={selectedTransaction} onClose={closeTransactionDetail} />
    }
  }

  // If balance detail is shown, render the balance detail view
  if (showBalanceDetail) {
    return (
      <BalanceDetailView
        date={selectedDate}
        incomesTotal={incomesTotal}
        expensesTotal={expensesTotal}
        balanceTotal={balanceTotal}
        incomesByPaymentMethod={incomesByPaymentMethod}
        expensesByPaymentMethod={expensesByPaymentMethod}
        productSales={productSales}
        onClose={closeBalanceDetail}
      />
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <BalanceHeader />

      {/* Date Selector */}
      <div className="bg-yellow-400 px-4 py-2 flex items-center justify-between border-t border-yellow-500/30">
        {getDates().map((date, index) => (
          <button
            key={index}
            className={cn(
              "px-2 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap",
              isSameDay(date, selectedDate) ? "bg-white" : "bg-transparent",
            )}
            onClick={() => handleDateChange(date)}
          >
            {format(date, "dd MMM", { locale: es })}
          </button>
        ))}
        <button className="p-2 rounded-lg bg-white" onClick={() => setShowDatePicker(true)}>
          <Calendar className="h-5 w-5" />
        </button>
      </div>

      {/* Balance Summary */}
      <div className="p-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          {/* Balance Header */}
          <div className="flex justify-between items-center pb-3 border-b">
            <h2 className="text-base text-gray-700">Balance</h2>
            <span className={cn("text-base font-bold", balanceTotal >= 0 ? "text-green-600" : "text-red-600")}>
              {balanceTotal >= 0 ? "$" : "-$"} {formatNumber(Math.abs(balanceTotal))}
            </span>
          </div>

          {/* Ingresos and Egresos - Side by Side */}
          <div className="flex border-b py-3">
            <div className="flex-1 border-r pr-4">
              <div className="flex items-center mb-1">
                <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-sm text-gray-700">Ingresos</span>
              </div>
              <span className="text-green-600 font-bold text-lg">$ {formatNumber(incomesTotal)}</span>
            </div>
            <div className="flex-1 pl-4">
              <div className="flex items-center mb-1">
                <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                <span className="text-sm text-gray-700">Egresos</span>
              </div>
              <span className="text-red-600 font-bold text-lg">-$ {formatNumber(expensesTotal)}</span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-between items-center pt-3">
            <button className="text-gray-700 text-sm flex items-center">
              <Download className="h-4 w-4 mr-1" />
              Descargar Reportes
            </button>
            <button onClick={handleShowBalanceDetail} className="text-blue-600 text-sm flex items-center">
              Ver Balance
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-2 h-auto p-0 bg-transparent">
          <TabsTrigger
            value="ingresos"
            className={cn(
              "py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:shadow-none",
              activeTab === "ingresos" ? "font-bold" : "text-gray-500",
            )}
          >
            Ingresos
          </TabsTrigger>
          <TabsTrigger
            value="egresos"
            className={cn(
              "py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:shadow-none",
              activeTab === "egresos" ? "font-bold" : "text-gray-500",
            )}
          >
            Egresos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ingresos" className="mt-0">
          {filteredTransactions.length > 0 ? (
            <div className="space-y-4 p-4">
              {filteredTransactions.map((transaction) => (
                <button
                  key={transaction.id}
                  className="flex items-center bg-white rounded-xl p-4 shadow-sm w-full text-left"
                  onClick={() => handleTransactionClick(transaction)}
                >
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                    <span className="text-green-600 text-xl">💵</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{transaction.name}</h3>
                    <p className="text-sm text-gray-600">
                      {transaction.paymentMethod} · {format(transaction.date, "dd 'de' MMM - HH:mm", { locale: es })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">$ {formatNumber(transaction.amount)}</p>
                    <p className="text-sm text-green-600">{transaction.status}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">No hay ingresos registrados para esta fecha.</div>
          )}
        </TabsContent>

        <TabsContent value="egresos" className="mt-0">
          {filteredTransactions.length > 0 ? (
            <div className="space-y-4 p-4">
              {filteredTransactions.map((transaction) => (
                <button
                  key={transaction.id}
                  className="flex items-center bg-white rounded-xl p-4 shadow-sm w-full text-left"
                  onClick={() => handleTransactionClick(transaction)}
                >
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
                    <span className="text-red-600 text-xl">💸</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{transaction.name}</h3>
                    <p className="text-sm text-gray-600">
                      {transaction.paymentMethod} · {format(transaction.date, "dd 'de' MMM - HH:mm", { locale: es })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">$ {formatNumber(transaction.amount)}</p>
                    <p className="text-sm text-red-600">{transaction.status}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">No hay gastos registrados para esta fecha.</div>
          )}
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="fixed bottom-16 left-0 right-0 px-4 pb-2 flex gap-2">
        <Button
          onClick={handleNewSale}
          className="flex-1 bg-green-600/80 hover:bg-green-600 text-white rounded-full py-2.5 text-sm shadow-sm"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Nueva venta
        </Button>
        <Button
          onClick={handleNewExpense}
          className="flex-1 bg-red-800/80 hover:bg-red-800 text-white rounded-full py-2.5 text-sm shadow-sm"
        >
          <Minus className="mr-1.5 h-4 w-4" />
          Nuevo gasto
        </Button>
      </div>

      {/* Sale Type Modal */}
      <SaleTypeModal isOpen={isSaleTypeModalOpen} onClose={() => setIsSaleTypeModalOpen(false)} />

      {/* Extra padding at the bottom to prevent content from being hidden behind buttons */}
      <div className="h-20"></div>
    </div>
  )
}
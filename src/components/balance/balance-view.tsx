// Vista principal de balance

"use client"

import { useState, useEffect } from "react"
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
import { supabase } from "@/lib/supabase/supabaseClient"
import { useStore } from "@/lib/contexts/StoreContext"
import { useAuth } from "@/lib/contexts/AuthContext"

type Transaction = {
  transaction_id: string
  transaction_description: string
  payment_method: string
  transaction_date: string
  unit_amount: number
  total_amount: number
  // ...otros campos relevantes
}

function IncomeList({
  transactions,
  onTransactionClick,
  formatNumber,
}: {
  transactions: Transaction[]
  onTransactionClick: (t: Transaction) => void
  formatNumber: (n: number) => string
}) {
  if (!transactions.length) {
    return <div className="p-8 text-center text-gray-500">No hay ingresos registrados para esta fecha.</div>
  }
  return (
    <div className="space-y-4 p-4">
      {transactions.map((transaction: Transaction) => (
        <button
          key={transaction.transaction_id}
          className="flex items-center bg-white rounded-xl p-4 shadow-sm w-full text-left"
          onClick={() => onTransactionClick(transaction)}
        >
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
            <span className="text-green-600 text-xl">💵</span>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{transaction.transaction_description || 'Ingreso'}</h3>
            <p className="text-sm text-gray-600">
              {transaction.payment_method === 'cash'
                ? 'Efectivo'
                : transaction.payment_method === 'card'
                ? 'Tarjeta'
                : transaction.payment_method === 'transfer'
                ? 'Transferencia'
                : 'Otro'}
              {" · "}
              {transaction.transaction_date ? format(new Date(transaction.transaction_date), "dd 'de' MMM - HH:mm", { locale: es }) : "Sin fecha"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold">$ {formatNumber(transaction.total_amount)}</p>
            <p className="text-sm text-green-600">Pagado</p>
          </div>
        </button>
      ))}
    </div>
  )
}

function ExpenseList({
  transactions,
  onTransactionClick,
  formatNumber,
}: {
  transactions: Transaction[]
  onTransactionClick: (t: Transaction) => void
  formatNumber: (n: number) => string
}) {
  if (!transactions.length) {
    return <div className="p-8 text-center text-gray-500">No hay gastos registrados para esta fecha.</div>
  }
  return (
    <div className="space-y-4 p-4">
      {transactions.map((transaction: Transaction) => (
        <button
          key={transaction.transaction_id}
          className="flex items-center bg-white rounded-xl p-4 shadow-sm w-full text-left"
          onClick={() => onTransactionClick(transaction)}
        >
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
            <span className="text-red-600 text-xl">💸</span>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{transaction.transaction_description || 'Gasto'}</h3>
            <p className="text-sm text-gray-600">
              {transaction.payment_method === 'cash'
                ? 'Efectivo'
                : transaction.payment_method === 'card'
                ? 'Tarjeta'
                : transaction.payment_method === 'transfer'
                ? 'Transferencia'
                : 'Otro'}
              {" · "}
              {transaction.transaction_date ? format(new Date(transaction.transaction_date), "dd 'de' MMM - HH:mm", { locale: es }) : "Sin fecha"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold">$ {formatNumber(transaction.total_amount)}</p>
            <p className="text-sm text-red-600">Pagado</p>
          </div>
        </button>
      ))}
    </div>
  )
}

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
  const [showBalanceDetail, setShowBalanceDetail] = useState(false)
  const [isSaleTypeModalOpen, setIsSaleTypeModalOpen] = useState(false)
  const { selectedStore } = useStore()
  const { user } = useAuth()
  const [incomeTransactions, setIncomeTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedStore || !user) return
    setLoading(true)
    const fetchIncomes = async () => {
      const start = new Date(selectedDate)
      start.setHours(0, 0, 0, 0)
      const end = new Date(selectedDate)
      end.setHours(23, 59, 59, 999)
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("store_id", selectedStore.store_id)
        .eq("user_id", user.id)
        .gte("transaction_date", start.toISOString())
        .lte("transaction_date", end.toISOString())
        .order("transaction_date", { ascending: false })
      if (!error) setIncomeTransactions(data || [])
      setLoading(false)
    }
    fetchIncomes()
  }, [selectedStore, user, selectedDate])

  // Filter transactions based on selected date and active tab
  const filteredTransactions = incomeTransactions.filter(
    (transaction) =>
      isSameDay(new Date(transaction.transaction_date), selectedDate) &&
      activeTab === "ingresos"
  )

  // Calculate totals for the selected date
  const incomesTotal = incomeTransactions
    .filter((t) => t.transaction_type === "income" && isSameDay(new Date(t.transaction_date), selectedDate))
    .reduce((sum, t) => sum + (Number(t.total_amount) || 0), 0)

  const expensesTotal = incomeTransactions
    .filter((t) => t.transaction_type === "expense" && isSameDay(new Date(t.transaction_date), selectedDate))
    .reduce((sum, t) => sum + (Number(t.total_amount) || 0), 0)

  const balanceTotal = incomesTotal - expensesTotal

  // Calculate income by payment method
  const incomesByPaymentMethod = {
    cash: incomeTransactions
      .filter((t) => t.transaction_type === "income" && isSameDay(new Date(t.transaction_date), selectedDate) && t.payment_method === "cash")
      .reduce((sum, t) => sum + t.unit_amount, 0),
    other: incomeTransactions
      .filter((t) => t.transaction_type === "income" && isSameDay(new Date(t.transaction_date), selectedDate) && t.payment_method !== "cash")
      .reduce((sum, t) => sum + t.unit_amount, 0),
  }

  // Calculate expenses by payment method
  const expensesByPaymentMethod = {
    cash: incomeTransactions
      .filter((t) => t.transaction_type === "expense" && isSameDay(new Date(t.transaction_date), selectedDate) && t.payment_method === "cash")
      .reduce((sum, t) => sum + t.unit_amount, 0),
    other: incomeTransactions
      .filter((t) => t.transaction_type === "expense" && isSameDay(new Date(t.transaction_date), selectedDate) && t.payment_method !== "cash")
      .reduce((sum, t) => sum + t.unit_amount, 0),
  }

  // Calculate product sales data
  const productSales = {
    count: incomeTransactions.filter(
      (t) => t.transaction_type === "income" && isSameDay(new Date(t.transaction_date), selectedDate) && t.products && t.products.length > 0,
    ).length,
    total: incomeTransactions
      .filter((t) => t.transaction_type === "income" && isSameDay(new Date(t.transaction_date), selectedDate) && t.products && t.products.length > 0)
      .reduce((sum, t) => sum + t.unit_amount, 0),
    cost: 5, // This would normally be calculated from the products
    profit: incomeTransactions
      .filter((t) => t.transaction_type === "income" && isSameDay(new Date(t.transaction_date), selectedDate) && t.profit)
      .reduce((sum, t) => sum + (t.profit || 0), 0),
  }

  // Format number with thousand separators
  const formatNumber = (num: number) => {
    return num?.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
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

  // Show balance detail view
  const handleShowBalanceDetail = () => {
    setShowBalanceDetail(true)
  }

  // Close balance detail view
  const closeBalanceDetail = () => {
    setShowBalanceDetail(false)
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
          {loading ? (
            <div className="p-8 text-center text-gray-500">Cargando ingresos...</div>
          ) : (
            <IncomeList
              transactions={incomeTransactions.filter(
                (t) => t.transaction_type === "income" && isSameDay(new Date(t.transaction_date), selectedDate)
              )}
              onTransactionClick={(transaction) => router.push(`/balance/income/${transaction.transaction_id}`)}
              formatNumber={formatNumber}
            />
          )}
        </TabsContent>

        <TabsContent value="egresos" className="mt-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Cargando egresos...</div>
          ) : (
            <ExpenseList
              transactions={incomeTransactions.filter(
                (t) => t.transaction_type === "expense" && isSameDay(new Date(t.transaction_date), selectedDate)
              )}
              onTransactionClick={(transaction) => router.push(`/balance/expense/${transaction.transaction_id}`)}
              formatNumber={formatNumber}
            />
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
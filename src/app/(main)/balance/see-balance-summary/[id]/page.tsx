"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/supabaseClient"
import BalanceDetailView from "@/components/balance/balance-detail-view"

export default function SeeBalanceSummaryPage() {
  const { id } = useParams()
  const router = useRouter()
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Desestructura la fecha fuera del useEffect para que esté disponible en todo el componente
  const [year, month, day] = (id as string).split('-').map(Number)

  useEffect(() => {
    if (!id) return
    const start = new Date(year, month - 1, day, 0, 0, 0, 0)
    const end = new Date(year, month - 1, day, 23, 59, 59, 999)
    const fetchTransactions = async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .gte("transaction_date", start.toISOString())
        .lte("transaction_date", end.toISOString())
        .order("transaction_date", { ascending: false })
      setTransactions(data || [])
      setLoading(false)
    }
    fetchTransactions()
  }, [id, year, month, day])

  if (loading) return <div className="p-8 text-center">Cargando...</div>

  // Calcula los totales y agrupaciones igual que en balance-view
  const incomeTransactions = transactions.filter(
    t => t.transaction_type === "income" || (t.transaction_type === "sale" && t.transaction_subtype === "products-sale")
  )
  const expenseTransactions = transactions.filter(t => t.transaction_type === "expense")

  const incomesTotal = incomeTransactions.reduce((sum, t) => sum + (Number(t.total_amount) || 0), 0)
  const expensesTotal = expenseTransactions.reduce((sum, t) => sum + (Number(t.total_amount) || 0), 0)
  const balanceTotal = incomesTotal - expensesTotal

  const incomesByPaymentMethod = {
    cash: incomeTransactions
      .filter(t => t.payment_method === "cash")
      .reduce((sum, t) => sum + (Number(t.total_amount) || 0), 0),
    other: incomeTransactions
      .filter(t => t.payment_method !== "cash")
      .reduce((sum, t) => sum + (Number(t.total_amount) || 0), 0),
  }
  const expensesByPaymentMethod = {
    cash: expenseTransactions
      .filter(t => t.payment_method === "cash")
      .reduce((sum, t) => sum + (Number(t.total_amount) || 0), 0),
    other: expenseTransactions
      .filter(t => t.payment_method !== "cash")
      .reduce((sum, t) => sum + (Number(t.total_amount) || 0), 0),
  }
  
  const productSaleTransactions = incomeTransactions.filter(t => t.products && t.products.length > 0)
  
  const productSales = {
    count: productSaleTransactions.length,
    total: productSaleTransactions.reduce((sum, t) => sum + (Number(t.total_amount) || 0), 0),
    cost: 5, // Placeholder
    profit: incomeTransactions.filter(t => t.profit).reduce((sum, t) => sum + (t.profit || 0), 0),
  }

  // Usa la fecha local para el componente
  const localDate = new Date(year, month - 1, day)

  return (
    <BalanceDetailView
      date={localDate}
      incomesTotal={incomesTotal}
      expensesTotal={expensesTotal}
      balanceTotal={balanceTotal}
      incomesByPaymentMethod={incomesByPaymentMethod}
      expensesByPaymentMethod={expensesByPaymentMethod}
      productSales={productSales}
      onClose={() => router.push("/balance")}
    />
  )
}

// Al dar click en el bloque de gasto, muestra el detalle de la transacción
// src/app/(main)/balance/expense/[id]/page.tsx
"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/supabaseClient"
import ExpenseDetailView from "@/components/balance/expense-detail-view"

export default function ExpenseDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [transaction, setTransaction] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    const fetchTransaction = async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("transaction_id", id)
        .single()
      setTransaction(data)
      setLoading(false)
    }
    fetchTransaction()
  }, [id])

  if (loading) return <div className="p-8 text-center">Cargando...</div>
  if (!transaction) return <div className="p-8 text-center">No se encontró el gasto.</div>

  return (
    <ExpenseDetailView
      expense={transaction}
      onClose={() => router.push("/balance?tab=egresos")}
    />
  )
}
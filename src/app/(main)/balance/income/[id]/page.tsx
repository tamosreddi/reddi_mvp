// src/app/(main)/balance/income/[id]/page.tsx
// Al dar click en el bloque de ingreso, muestra el detalle de la transacción

"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/supabaseClient"
import IncomeDetailView from "@/components/balance/income-detail-view"

export default function IncomeDetailPage() {
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
  if (!transaction) return <div className="p-8 text-center">No se encontró el ingreso.</div>

  return (
    <IncomeDetailView
      transaction={transaction}
      onClose={() => router.push("/balance")}
    />
  )
}
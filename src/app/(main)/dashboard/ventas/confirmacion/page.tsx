"use client"

import { useSearchParams } from "next/navigation"
import SaleConfirmation from "@/components/ventas/sale-confirmation"

export default function SaleConfirmationPage() {
  const searchParams = useSearchParams()
  const total = Number(searchParams.get("total") || "0")
  const paymentMethod = searchParams.get("paymentMethod") || "efectivo"
  const transactionId = searchParams.get("transactionId") || ""

  return <SaleConfirmation isOpen={true} onClose={() => {}} onConfirm={() => {}} total={total} paymentMethod={paymentMethod} transactionId={transactionId} />
}

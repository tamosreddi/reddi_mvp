"use client"

import { useSearchParams } from "next/navigation"
import SaleConfirmation from "@/components/ventas/sale-confirmation"

export default function SaleConfirmationPage() {
  const searchParams = useSearchParams()
  const total = Number(searchParams.get("total") || "0")
  const paymentMethod = searchParams.get("paymentMethod") || "efectivo"

  return <SaleConfirmation total={total} paymentMethod={paymentMethod} />
}

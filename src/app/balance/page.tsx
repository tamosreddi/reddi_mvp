// Página principal de balance

"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import BalanceView from "@/components/balance/balance-view"
import SaleTypeModal from "@/components/shared/sale-type-modal"

export default function BalancePage() {
  const [isSaleTypeModalOpen, setIsSaleTypeModalOpen] = useState(false)
  const searchParams = useSearchParams()

  // Check if we should show the sale type modal based on the query parameter
  useEffect(() => {
    if (searchParams.get("showSaleModal") === "true") {
      setIsSaleTypeModalOpen(true)
    }
  }, [searchParams])

  return (
    <>
      <BalanceView onNewSale={() => setIsSaleTypeModalOpen(true)} />

      {/* Sale Type Modal */}
      <SaleTypeModal isOpen={isSaleTypeModalOpen} onClose={() => setIsSaleTypeModalOpen(false)} />
    </>
  )
}
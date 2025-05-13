"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import CreateProductForm from "@/components/inventario/create-product-form"

export default function CreateProductPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const referrer = searchParams.get("referrer") || "/inventario"

  // Debug logging
  useEffect(() => {
    console.log("CreateProductPage mounted, referrer:", referrer)
  }, [referrer])

  return (
    <>
      {/* Debug element to verify the page is rendering */}
      <div id="debug-create-product-page" style={{ display: "none" }}>
        Create Product Page Loaded
      </div>
      <CreateProductForm initialReferrer={referrer} />
    </>
  )
}
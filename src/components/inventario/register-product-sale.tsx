"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function RegisterProductSale() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir a la nueva implementación
    router.replace("/venta/productos")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirigiendo...</p>
    </div>
  )
}

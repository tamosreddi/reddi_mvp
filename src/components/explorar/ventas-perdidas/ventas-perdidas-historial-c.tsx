// Cuando elusuario le da click a "Ver historial"

"use client"

import TopProfileMenu from '@/components/shared/top-profile-menu';
import { es } from "date-fns/locale";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/supabaseClient";
import { useStore } from "@/lib/contexts/StoreContext"
import { useRouter } from "next/navigation"

export default function VentasPerdidasHistorial() {
  const { selectedStore } = useStore()
  const router = useRouter()
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  return (
    <div className="min-h-screen flex flex-col bg-reddi-background">
      {/* Header solo con back y título */}
      <TopProfileMenu simpleMode={true} title="Historial" onBackClick={() => router.push('/explorar/ventas-perdidas')} />
      <main className="flex-1 bg-reddi-background rounded-t-2xl p-4">
        {/* Aquí irá el contenido de ventas perdidas */}
      </main>
    </div>
  )
}
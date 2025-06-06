//Explorar/Ventas Perdidas

"use client"

import TopProfileMenu from '@/components/shared/top-profile-menu';
import { es } from "date-fns/locale";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/supabaseClient";
import { useStore } from "@/lib/contexts/StoreContext"
import { useRouter } from "next/navigation"
import CalendarSelect from '@/components/ui/calendar-select';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/button';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { useAuth } from "@/lib/hooks/useAuth"
import type { AuthContextType } from "@/lib/contexts/AuthContext"
import { toast } from "sonner"

export default function VentasPerdidas() {
  const { selectedStore } = useStore()
  const auth = useAuth() as AuthContextType
  const user = auth.user
  const router = useRouter()
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState<Date>(new Date())
  const [product, setProduct] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddLostSale = async () => {
    if (!user || !selectedStore) return

    try {
      setIsSubmitting(true)
      const response = await fetch('/api/explorar/registrar-venta-perdida', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: product,
          store_id: selectedStore.store_id,
          user_id: user.id,
          lost_sale_date: date.toISOString(),
        }),
      })

      const data = await response.json()

      if (!data.success) {
        toast.error(data.error || 'Error al registrar la venta perdida')
        throw new Error(data.error || 'Error al registrar la venta perdida')
      }

      setProduct("")
      setDate(new Date())
      toast.success('Tu registro fue creado con éxito')
      setTimeout(() => {
        router.push('/explorar')
      }, 1200)
    } catch (error: any) {
      console.error('Error:', error)
      toast.error('Error al registrar la venta perdida')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-reddi-background">
      {/* Header solo con back y título */}
      <TopProfileMenu simpleMode={true} title="Ventas Perdidas" onBackClick={() => router.push('/explorar')} />
      <main className="flex-1 bg-reddi-background rounded-t-2xl p-4">
        <div className="max-w-md mx-auto flex flex-col gap-6 mt-2 pt-14">
          {/* Selector de fecha */}
          <CalendarSelect value={date} onChange={setDate} />

          {/* Input de producto perdido con label arriba, igual que crear-categoria-form */}
          <div>
            <Label htmlFor="lost-product" className="text-lg font-medium text-gray-800">
              ¿Qué producto te pidieron y no tuviste en tu inventario?
            </Label>
            <textarea
              id="lost-product"
              value={product}
              onChange={e => setProduct(e.target.value)}
              className="mt-1 min-h-[100px] rounded-xl border border-gray-200 text-base font-extralight w-full resize-none p-4"
              placeholder="Ej. un gansito frío"
              required
            />
          </div>

          {/* Botón para agregar venta perdida */}
          <Button
            variant="primary"
            size="md"
            className="w-full mt-2"
            disabled={!product.trim() || isSubmitting}
            onClick={handleAddLostSale}
          >
            {isSubmitting ? 'Registrando...' : '+ Agregar Venta Perdida'}
          </Button>

          {/* Link para ver historial */}
          <div className="text-center mt-0">
            <Link
              href="/explorar/ventas-perdidas-historial"
              className="text-sm font-medium tracking-tight no-underline hover:text-gray-800 transition-colors"
            >
              Ver historial
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

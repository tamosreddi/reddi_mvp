//Al dar click en bloque de ingreso, muestra el detalle de la transacción
//Viene de balance-view.tsx

"use client"
import { ArrowLeft, FileText, Edit, Trash2, Package, Calendar, CreditCard, TrendingUp } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/supabaseClient"

interface IncomeDetailProps {
  transaction: {
    transaction_id: string
    transaction_description: string
    total_amount: number
    payment_method: string
    transaction_date: string
    stakeholder_type?: string
    stakeholder_id?: string
    // ...otros campos relevantes
  }
  onClose: () => void
}

export default function IncomeDetailView({ transaction, onClose }: IncomeDetailProps) {
  const [clientName, setClientName] = useState<string | null>(null)
  useEffect(() => {
    const fetchClient = async () => {
      if (transaction.stakeholder_type === 'client' && transaction.stakeholder_id) {
        const { data, error } = await supabase
          .from('clients')
          .select('name')
          .eq('client_id', transaction.stakeholder_id)
          .single()
        if (data && data.name) setClientName(data.name)
        else setClientName('Sin cliente seleccionado')
      } else {
        setClientName('Sin cliente seleccionado')
      }
    }
    fetchClient()
  }, [transaction.stakeholder_type, transaction.stakeholder_id])
  return (
    <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-yellow-400 p-4">
        <div className="flex items-center justify-between h-10">
          <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Detalle del ingreso</h1>
          <div className="w-10"></div> {/* Spacer for balanced spacing */}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-2">Resumen del ingreso</h2>

          <div className="text-blue-600 text-sm mb-3">Transacción #{transaction.transaction_id}</div>

          <div className="border-t border-gray-200 py-3">
            <div className="text-gray-600 text-xs mb-1.5">Cliente</div>
            <div className="text-base font-medium mt-1">{clientName ?? 'Sin cliente seleccionado'}</div>
          </div>

          <div className="border-t border-gray-200 py-3">
            <div className="text-gray-600 text-xs mb-1.5">Concepto</div>
            <div className="text-lg font-bold mt-1">{transaction.transaction_description || 'Ingreso'}</div>
          </div>

          <div className="border-t border-gray-200 py-3">
            <div className="text-gray-600 text-xs mb-1.5">Valor total</div>
            <div className="text-2xl font-bold mt-1">$ {transaction.total_amount?.toLocaleString('es-MX')}</div>
          </div>

          <div className="border-t border-gray-200 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <div className="text-gray-600 text-sm">Fecha y hora</div>
              </div>
              <div className="text-gray-800 text-sm">
                {transaction.transaction_date ? format(new Date(transaction.transaction_date), "h:mm a | dd MMM yyyy", { locale: es }) : "Sin fecha"}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                <div className="text-gray-600 text-sm">Método de pago</div>
              </div>
              <div className="text-gray-800 text-sm">
                {transaction.payment_method === 'cash'
                  ? 'Efectivo'
                  : transaction.payment_method === 'card'
                  ? 'Tarjeta'
                  : transaction.payment_method === 'transfer'
                  ? 'Transferencia'
                  : 'Otro'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 border-t border-gray-200 bg-white">
        <button className="flex flex-col items-center justify-center py-4 text-gray-600">
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-1">
            <FileText className="h-5 w-5" />
          </div>
          <span className="text-sm">Comprobante</span>
        </button>
        <button className="flex flex-col items-center justify-center py-4 text-gray-800">
          <div className="h-12 w-12 rounded-full bg-gray-800 flex items-center justify-center mb-1">
            <Edit className="h-5 w-5 text-white" />
          </div>
          <span className="text-sm">Editar</span>
        </button>
        <button className="flex flex-col items-center justify-center py-4 text-red-600">
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-1">
            <Trash2 className="h-5 w-5" />
          </div>
          <span className="text-sm">Eliminar</span>
        </button>
      </div>
    </div>
  )
}
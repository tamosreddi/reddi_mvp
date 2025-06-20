//Al dar click en bloque de ingreso, muestra el detalle de la transacción
//Viene de balance-view.tsx

"use client"
import { ArrowLeft, FileText, Edit, Trash2, Package, Calendar, CreditCard, TrendingUp } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/supabaseClient"
import TopProfileMenu from "@/components/shared/top-profile-menu"
import DeleteSaleModal from "@/components/shared/delete-sale-modal"
import { useStore } from "@/lib/contexts/StoreContext"
import { useRouter } from "next/navigation"

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
  const [products, setProducts] = useState<any[]>([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const { selectedStore } = useStore();
  const router = useRouter();

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

  useEffect(() => {
    // Traer productos vendidos para esta transacción
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('transaction_items')
        .select('product_name, quantity, unit_price')
        .eq('transaction_id', transaction.transaction_id)
      if (!error && data && data.length > 0) {
        setProducts(data)
      } else {
        setProducts([])
      }
    }
    fetchProducts()
  }, [transaction.transaction_id])

  console.log('IncomeDetailView render', transaction.transaction_id)

  return (
    <div className="fixed inset-0 bg-reddi-background z-50 flex flex-col">
      {/* Header */}
      <TopProfileMenu
        simpleMode
        title="Detalle del ingreso"
        onBackClick={onClose}
      />

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4 mt-16">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-2">Resumen del ingreso</h2>

          {/* <div className="text-blue-600 text-xs mb-3">Transacción #{transaction.transaction_id}</div> */}

          <div className="border-t border-gray-200 py-3">
            <div className="text-gray-600 text-xs mb-1.5">Cliente</div>
            <div className="text-base font-normal mt-1">{clientName ?? 'Sin cliente seleccionado'}</div>
          </div>

          <div className="border-t border-gray-200 py-3">
            <div className="text-gray-600 text-xs mb-1.5">Concepto</div>
            <div className="text-base font-normal mt-1">{transaction.transaction_description || 'Ingreso'}</div>
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

        {/* Front-end Listado de productos vendidos */}
        {products.length > 0 && (
          <div className="bg-white rounded-lg p-4 shadow-sm mt-4">
            <div className="flex items-center mb-3">
              <span className="bg-yellow-100 rounded-full p-2 mr-2">
                <FileText className="h-5 w-5 text-yellow-600" />
              </span>
              <h3 className="font-bold text-gray-800 text-base">Listado de productos</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {products.map((prod, idx) => (
                <div key={idx} className="flex justify-between items-center py-2">
                  <div>
                    <div className="font-medium text-gray-900">{prod.product_name || 'Producto'}</div>
                    <div className="text-xs text-gray-500">{prod.quantity} und · Precio U. {Number(prod.unit_price).toLocaleString('es-MX', { style: 'currency', currency: 'USD' })}</div>
                  </div>
                  <div className="text-right font-bold text-gray-800">
                    {Number(prod.unit_price * prod.quantity).toLocaleString('es-MX', { style: 'currency', currency: 'USD' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 border-t border-gray-200 bg-white">
        {/* <button className="flex flex-col items-center justify-center py-4 text-gray-600">
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-1">
            <FileText className="h-5 w-5" />
          </div>
          <span className="text-sm">Comprobante</span>
        </button> */}
        <button className="flex flex-col items-center justify-center py-4 text-gray-800"
          onClick={() => {
            router.push(`/balance/edit-income/${transaction.transaction_id}`);
          }}
        >
          <div className="h-12 w-12 rounded-full bg-gray-800 flex items-center justify-center mb-1">
            <Edit className="h-5 w-5 text-white" />
          </div>
          <span className="text-sm">Editar</span>
        </button>
        <button
          className="flex flex-col items-center justify-center py-4 text-red-600"
          onClick={() => setShowDeleteModal(true)}
        >
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-1">
            <Trash2 className="h-5 w-5" />
          </div>
          <span className="text-sm">Eliminar</span>
        </button>
      </div>

      <DeleteSaleModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          if (!selectedStore?.store_id) {
            alert("No se pudo obtener la tienda actual.");
            return;
          }
          try {
            const res = await fetch("/api/ventas/revertir-venta", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ transaction_id: transaction.transaction_id, store_id: selectedStore.store_id })
            });
            const data = await res.json();
            if (data.success) {
              setShowDeleteModal(false);
              onClose();
            } else {
              alert(data.error || "No se pudo eliminar la transacción.");
            }
          } catch (err) {
            alert("Error de red al eliminar la transacción.");
          }
        }}
      />
    </div>
  )
}
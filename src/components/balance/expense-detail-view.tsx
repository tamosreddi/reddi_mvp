// Al dar click en el bloque de gasto, muestra el detalle de la transacción
// Viene de balance-view.tsx

"use client"
import { ArrowLeft, Calendar, CreditCard, Grid, FileText, Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import TopProfileMenu from "@/components/shared/top-profile-menu"
import DeleteSaleModal from "@/components/shared/delete-sale-modal"
import { useStore } from "@/lib/contexts/StoreContext"
import { useState } from "react"

interface ExpenseDetailProps {
  expense: {
    transaction_id: string
    transaction_description: string
    total_amount: number
    payment_method: string
    transaction_date: string
    transaction_subtype?: string
    // ...otros campos relevantes
  }
  onClose: () => void
}

export default function ExpenseDetailView({ expense, onClose }: ExpenseDetailProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const { selectedStore } = useStore();

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col">
      {/* Header */}
      <TopProfileMenu
        simpleMode
        title="Detalle del gasto"
        onBackClick={onClose}
      />

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4 mt-16">
        {/* Expense Summary */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-2">Resumen del gasto</h2>

          <div className="text-blue-600 text-sm mb-3">Transacción #{expense.transaction_id}</div>

          <div className="border-t border-gray-200 py-3">
            <div className="text-gray-600 text-xs mb-1.5">Concepto</div>
            <div className="text-lg font-bold mt-1">{expense.transaction_description || 'Gasto'}</div>
          </div>

          <div className="border-t border-gray-200 py-3">
            <div className="text-gray-600 text-xs mb-1.5">Valor total</div>
            <div className="text-2xl font-bold mt-1">$ {expense.total_amount?.toLocaleString('es-MX')}</div>
          </div>

          <div className="border-t border-gray-200 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <div className="text-gray-600 text-sm">Fecha y hora</div>
              </div>
              <div className="text-gray-800 text-sm">
                {expense.transaction_date ? format(new Date(expense.transaction_date), "h:mm a | dd MMM yyyy", { locale: es }) : "Sin fecha"}
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
                {expense.payment_method === 'cash'
                  ? 'Efectivo'
                  : expense.payment_method === 'card'
                  ? 'Tarjeta'
                  : expense.payment_method === 'transfer'
                  ? 'Transferencia'
                  : 'Otro'}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Grid className="h-5 w-5 text-gray-400 mr-2" />
                <div className="text-gray-600 text-sm">Categoría</div>
              </div>
              <div className="text-gray-800 text-sm">{expense.transaction_subtype || 'Sin categoría'}</div>
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
            const res = await fetch("/api/ventas/revertir-gasto", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ transaction_id: expense.transaction_id, store_id: selectedStore.store_id })
            });
            const data = await res.json();
            if (data.success) {
              setShowDeleteModal(false);
              onClose();
            } else {
              alert(data.error || "No se pudo eliminar el gasto.");
            }
          } catch (err) {
            alert("Error de red al eliminar el gasto.");
          }
        }}
      />
    </div>
  )
}

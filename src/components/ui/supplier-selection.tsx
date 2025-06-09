import { User, Trash2, ChevronRight } from 'lucide-react'
import React from 'react'

interface Supplier {
  name: string
  notes?: string
  supplier_id: number
}

interface SupplierSelectionProps {
  selectedSupplier: Supplier | null
  onRemoveSupplier: () => void
  onSelectSupplier: () => void
}

export default function SupplierSelection({
  selectedSupplier,
  onRemoveSupplier,
  onSelectSupplier
}: SupplierSelectionProps) {
  console.log('[SupplierSelection] selectedSupplier:', selectedSupplier ? { name: selectedSupplier.name, supplier_id: selectedSupplier.supplier_id } : null);
  return (
    <>
      {selectedSupplier ? (
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-blue-50 p-4">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-lg font-normal">{selectedSupplier.name}</span>
              {selectedSupplier.notes && <span className="text-sm text-gray-600">{selectedSupplier.notes}</span>}
            </div>
          </div>
          <button 
            type="button" 
            onClick={onRemoveSupplier} 
            className="text-red-500" 
            aria-label="Quitar proveedor"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onSelectSupplier}
          className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white p-4"
        >
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-gray-400" />
            <div className="flex flex-col items-start">
              <span className="text-lg font-medium">Proveedor</span>
              <span className="text-sm text-gray-400">Escoge tu proveedor</span>
            </div>
          </div>
          <ChevronRight className="text-gray-400" />
        </button>
      )}
    </>
  )
} 
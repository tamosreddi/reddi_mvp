import { User, Trash2, ChevronRight } from 'lucide-react'
import React from 'react'

interface Customer {
  name: string
  notes?: string
}

interface CustomerSelectionProps {
  selectedCustomer: Customer | null
  onRemoveCustomer: () => void
  onSelectCustomer: () => void
}

export default function CustomerSelection({
  selectedCustomer,
  onRemoveCustomer,
  onSelectCustomer
}: CustomerSelectionProps) {
  console.log('[CustomerSelection] selectedCustomer:', selectedCustomer);
  return (
    <>
      {selectedCustomer ? (
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-blue-50 p-4">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-lg font-medium">{selectedCustomer.name}</span>
              {selectedCustomer.notes && <span className="text-sm text-gray-600">{selectedCustomer.notes}</span>}
            </div>
          </div>
          <button 
            type="button" 
            onClick={onRemoveCustomer} 
            className="text-red-500" 
            aria-label="Quitar cliente"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onSelectCustomer}
          className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white p-4"
        >
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-gray-400" />
            <div className="flex flex-col items-start">
              <span className="text-lg font-medium">Cliente</span>
              <span className="text-sm text-gray-400">Escoge tu cliente</span>
            </div>
          </div>
          <ChevronRight className="text-gray-400" />
        </button>
      )}
    </>
  )
} 
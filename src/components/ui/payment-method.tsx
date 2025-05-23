import React from 'react'
import { cn } from '@/lib/utils'

interface PaymentMethodProps {
  value: string
  onChange: (value: string) => void
}

const paymentOptions = [
  { key: 'cash', label: 'Efectivo', icon: '💵' },
  { key: 'card', label: 'Tarjeta', icon: '💳' },
  { key: 'transfer', label: 'Transferencia bancaria', icon: '🏦' },
  { key: 'other', label: 'Otro', icon: '⚙️' },
]

export default function PaymentMethod({ value, onChange }: PaymentMethodProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-medium">Selecciona el método de pago</h3>
      <div className="grid grid-cols-2 gap-3">
        {paymentOptions.map(option => (
          <button
            key={option.key}
            type="button"
            onClick={() => onChange(option.key)}
            className={cn(
              "flex flex-col items-center justify-center rounded-xl border p-4",
              value === option.key ? "border-green-500" : "border-gray-200"
            )}
          >
            <div className="mb-2 text-2xl">{option.icon}</div>
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
} 
import React from "react"
import { cn } from "@/lib/utils"

interface IsPaidToggleProps {
  value: boolean
  onChange: (value: boolean) => void
  labels?: {
    paid?: string
    credit?: string
  }
  className?: string
}

export default function IsPaidToggle({
  value,
  onChange,
  labels = { paid: "Pagado", credit: "A Crédito" },
  className = ""
}: IsPaidToggleProps) {
  return (
    <div className={cn("flex h-12 overflow-hidden rounded-full border border-gray-200", className)}>
      <button
        type="button"
        className={cn(
          "flex-1 text-center text-sm font-medium transition-colors",
          value ? "bg-green-500 text-white" : "bg-white text-gray-700"
        )}
        onClick={() => onChange(true)}
      >
        {labels.paid}
      </button>
      <button
        type="button"
        className={cn(
          "flex-1 text-center text-sm font-medium transition-colors",
          !value ? "bg-green-500 text-white" : "bg-white text-gray-700"
        )}
        onClick={() => onChange(false)}
      >
        {labels.credit}
      </button>
    </div>
  )
} 
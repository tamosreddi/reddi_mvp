// El search bar que está en VEnta-Productos

import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  clearButtonText?: string
  onClear?: () => void
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Buscar...",
  className,
  clearButtonText = "borrar",
  onClear
}: SearchBarProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-16 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-sm"
      />
      {value && (
        <button
          type="button"
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 hover:text-red-500 focus:outline-none"
          onClick={() => {
            onChange("")
            onClear?.()
          }}
          tabIndex={-1}
        >
          {clearButtonText}
        </button>
      )}
    </div>
  )
} 
import * as React from "react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface NewSelectorProps {
  options: string[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function NewSelector({ options, value, onChange, placeholder = "Selecciona una opción", className }: NewSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={"w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 " + (className || "") }>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem key={option} value={option} className="text-base">
              {option}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
} 
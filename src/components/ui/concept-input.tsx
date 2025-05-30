import { Label } from "@/components/ui/label"
import Input from "@/components/ui/Input"
import { Tag } from "lucide-react"
import React from "react"

interface ConceptInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  id?: string
  placeholder?: string
}

export default function ConceptInput({
  value,
  onChange,
  id = "concept",
  placeholder = "Agrega una descripción",
}: ConceptInputProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <Label htmlFor={id} className="mb-1 block text-lg font-medium">
        Concepto
      </Label>
      <div className="flex items-center gap-2">
        <Tag className="h-5 w-5 text-gray-400" />
        <Input
          id={id}
          value={value}
          onChange={onChange}
          className="border-none shadow-none focus-visible:ring-0"
          placeholder={placeholder}
        />
      </div>
    </div>
  )
}

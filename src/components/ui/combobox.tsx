"use client"

import * as React from "react"
import { Check, ChevronsUpDown, User, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import Button from "@/components/ui/Button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface Option {
  id: string
  name: string
  [key: string]: any
}

interface ComboboxProps {
  options: Option[]
  value: string | null
  onChange: (optionId: string | null) => void
}

export function Combobox({ options, value, onChange }: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const selectedOption = options.find((c) => c.id === value) || null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-gray-400" />
            {selectedOption ? (
              <span>{selectedOption.name}</span>
            ) : (
              <span className="text-gray-400">Sin seleccionar</span>
            )}
          </div>
          <ChevronsUpDown className="opacity-50 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full min-w-[220px] p-0">
        <Command>
          <CommandInput placeholder="Buscar..." className="h-9" />
          <CommandList>
            <CommandEmpty>No se encontraron opciones.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                key="none"
                value=""
                onSelect={() => {
                  onChange(null)
                  setOpen(false)
                }}
              >
                <span className="text-gray-400">Sin seleccionar</span>
                {!value && <Check className="ml-auto opacity-100" />}
              </CommandItem>
              {options.map((option) => (
                <CommandItem
                  key={option.id}
                  onSelect={() => {
                    onChange(option.id)
                    setOpen(false)
                  }}
                >
                  {option.name}
                  {value === option.id && <Check className="ml-auto opacity-100" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 
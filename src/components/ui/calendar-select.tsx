//Es el bloque completo que ves en el formulario: el rectángulo con el ícono de calendario y la fecha.
//El calendatio popup es otro componente llamado calendar.tsx.

"use client"

import { CalendarIcon } from "lucide-react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, isToday, isTomorrow } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import React from "react"

interface CalendarSelectProps {
  value: Date
  onChange: (date: Date) => void
  className?: string
  formatLabel?: (date: Date) => string
}

export default function CalendarSelect({
  value,
  onChange,
  className = "",
  formatLabel,
}: CalendarSelectProps) {
  // Formato por defecto: Hoy, Mañana, o fecha larga
  const defaultFormat = (date: Date) => {
    if (isToday(date)) {
      return `Hoy, ${format(date, "dd 'de' MMM", { locale: es })}`
    } else if (isTomorrow(date)) {
      return `Mañana, ${format(date, "dd 'de' MMM", { locale: es })}`
    } else {
      return format(date, "dd 'de' MMMM", { locale: es })
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-2 text-left w-full text-xs",
            className
          )}
        >
          <CalendarIcon className="h-3.5 w-3.5 text-gray-500" />
          <span className="truncate">{(formatLabel || defaultFormat)(value)}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="center" side="bottom" sideOffset={8} className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(d: Date | undefined) => d && onChange(d)}
          locale={es}
          className="rounded-md border"
        />
      </PopoverContent>
    </Popover>
  )
} 
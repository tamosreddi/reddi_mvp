"use client"
import React from "react"
import ReactDatePicker from "react-datepicker"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import "react-datepicker/dist/react-datepicker.css"

type CalendarProps = {
  selected: Date | null
  onChange: (date: Date | null) => void
  className?: string
  [key: string]: any // for other react-datepicker props if needed
}

export const Calendar = React.forwardRef<HTMLInputElement, CalendarProps>(
  ({ className, selected, onChange, ...props }, ref) => (
    <ReactDatePicker
      ref={ref as React.Ref<ReactDatePicker>}
      locale={es}
      selected={selected}
      onChange={onChange}
      calendarClassName={cn(
        "rounded-xl border border-gray-200 shadow-lg p-2 bg-white",
        "w-full max-w-xs",
        "text-gray-900",
        "mobile:!w-screen mobile:!max-w-full",
        className
      )}
      dayClassName={date =>
        "rounded-full w-9 h-9 flex items-center justify-center transition-colors " +
        "hover:bg-yellow-100 focus:bg-yellow-200 " +
        (selected && date?.toDateString() === selected.toDateString()
          ? "bg-gray-900 text-white font-bold border-4 border-gray-900 shadow"
          : "bg-white text-gray-900")
      }
      weekDayClassName={name =>
        "text-xs font-normal text-gray-400 lowercase"
      }
      popperClassName="z-50"
      {...props}
    />
  )
)

Calendar.displayName = "Calendar"

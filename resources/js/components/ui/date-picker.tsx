import { format as formatDate } from "date-fns"
import { CalendarIcon } from "lucide-react"
import * as React from "react"
import type { Matcher } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

function DatePicker({
  className,
  id,
  name,
  value,
  onChange,
  format = "dd/MM/yyyy",
  placeholder = "Pick a date",
  disabled,
  disabledDays,
  ...props
}: Omit<
  React.ComponentProps<typeof Button>,
  "id" | "name" | "onChange" | "type" | "value"
> & {
  id: string
  name?: string
  value?: Date
  onChange: (date: Date | undefined) => void
  format?: string
  placeholder?: string
  disabledDays?: Matcher | Matcher[]
}) {
  return (
    <>
      {name && (
        <input
          type="hidden"
          name={name}
          value={value ? formatDate(value, "yyyy-MM-dd") : ""}
        />
      )}

      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn("w-full justify-start text-left font-normal", className)}
            {...props}
          >
            <CalendarIcon className="mr-2 size-4" />
            {value ? (
              formatDate(value, format)
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            defaultMonth={value}
            disabled={disabledDays}
          />
        </PopoverContent>
      </Popover>
    </>
  )
}

export { DatePicker }

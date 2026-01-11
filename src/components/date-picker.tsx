"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format, isValid } from "date-fns"
import { type DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// 1. Define Props for different modes to ensure type safety
type DatePicker<T> = {
  mode?: "single" | "range";
  date: T | undefined;
  setDate: (date: T | undefined) => void;
  min?: number,
  max?: number
}

export function DatePicker(props: DatePicker<Date | DateRange>) {
  const now = new Date();
  const { mode = "single", date, setDate, min, max } = props;

  const [open, setOpen] = React.useState(false)
  // Determine which month to display initially
  const initialMonth = mode === "range" ? (date as DateRange)?.from : date as Date | undefined;
  const [month, setMonth] = React.useState<Date | undefined>(initialMonth)

  // 2. Helper to format the display value based on mode
  const getDisplayValue = () => {
    if (!date) return ""

    if (mode === "range") {
      const range = date as DateRange
      if (range.from && range.to) {
        return `${format(range.from, "LLL dd, y")} - ${format(range.to, "LLL dd, y")}`
      }
      return range.from ? format(range.from, "LLL dd, y") : ""
    }

    return format(date as Date, "PPP")
  }

  // Handle manual input (best supported in "single" mode)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (mode === "range") return; // Manual typing for range is complex; usually disabled.

    const val = e.target.value
    const parsedDate = new Date(val)
    if (isValid(parsedDate)) {
      (setDate as (d: Date) => void)(parsedDate)
      setMonth(parsedDate)
    }
  }

  return (
    <div className="relative flex w-full max-w-sm items-center gap-2">
      <Input
        id="date"
        value={getDisplayValue()}
        readOnly={mode === "range"} // Range selection is easier via UI than typing
        placeholder={mode === "range" ? "Select date range" : "Select date"}
        className="bg-background pr-10"
        onChange={handleInputChange}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault()
            setOpen(true)
          }
        }}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 h-full px-3 py-2 hover:bg-transparent"
          >
            <CalendarIcon className="size-4 text-muted-foreground" />
            <span className="sr-only">Toggle calendar</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode={mode as any} // Cast to any to satisfy overlapping react-day-picker types
            selected={date}
            onSelect={(selected: DateRange | Date) => {
              setDate(selected)
              // Only close popover automatically in single mode or when range is complete
              if (mode === "single") {
                setOpen(false)
              } else if (mode === "range") {
                const isCompletedRange = (selected as DateRange).from && (selected as DateRange).to && (selected as DateRange).from?.getTime() != (selected as DateRange).to?.getTime();
                if (isCompletedRange)
                  setOpen(false)
              }
            }}
            month={month}
            onMonthChange={setMonth}
            captionLayout="dropdown"
            fromYear={2000}
            toYear={2030}
            min={min}
            max={max}
            disabled={[
              { after: new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()) }
            ]}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
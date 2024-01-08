"use client"

import { useEffect, useState } from "react"
import { addDays, format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
    onChange: (...event: any[]) => void;
    onBlur: () => void;
    value: Date;
    disabled?: boolean;
    name: string;
    ref: React.Ref<any>;
}

export const DatePicker: React.FC<DatePickerProps> = ({ onChange, onBlur, value, disabled, name, ref }) => {
  const [date, setDate] = useState<Date | null>();

  useEffect(() => {
    setDate(value);
  }, [value]);

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate) {
      onChange(newDate);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
          disabled={disabled}
          onBlur={onBlur}
          ref={ref}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={date || undefined} onSelect={handleDateChange} />
      </PopoverContent>
    </Popover>
  )
};

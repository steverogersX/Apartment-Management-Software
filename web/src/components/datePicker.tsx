"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function DatePicker({
  id,
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  disabled,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const date = value ? new Date(`${value.slice(0, 10)}T00:00:00`) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            id={id}
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start gap-2 font-normal",
              !date && "text-muted-foreground",
              className,
            )}
          />
        }
      >
        <CalendarIcon className="size-3.5 shrink-0" />
        <span className="flex-1 truncate text-left">
          {date ? format(date, "d MMM yyyy") : placeholder}
        </span>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          defaultMonth={date}
          onSelect={(next) => {
            if (!next) return;
            onChange(format(next, "yyyy-MM-dd"));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

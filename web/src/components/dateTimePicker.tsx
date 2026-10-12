"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function parseValue(value: string): { date: Date | undefined; time: string } {
  if (!value) return { date: undefined, time: "18:00" };
  const [datePart, timePart] = value.split("T");
  const date = datePart ? new Date(`${datePart}T00:00:00`) : undefined;
  return { date, time: timePart?.slice(0, 5) || "18:00" };
}

function combine(date: Date | undefined, time: string): string {
  if (!date) return "";
  return `${format(date, "yyyy-MM-dd")}T${time || "00:00"}`;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Pick a date and time",
  clearable = false,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  clearable?: boolean;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const { date, time } = parseValue(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-start gap-2 font-normal sm:w-64",
              !date && "text-muted-foreground",
              className,
            )}
          />
        }
      >
        <CalendarIcon className="size-3.5 shrink-0" />
        <span className="flex-1 truncate text-left">
          {date ? format(date, "d MMM yyyy, h:mm a") : placeholder}
        </span>
        {clearable && date && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                onChange("");
              }
            }}
            aria-label="Clear date"
            className="shrink-0 rounded-full p-0.5 text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-3.5" />
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          defaultMonth={date}
          onSelect={(next) => {
            if (!next) return;
            onChange(combine(next, time));
          }}
        />
        <div className="flex items-center gap-2 border-t border-border p-2.5">
          <Clock className="size-3.5 shrink-0 text-muted-foreground" />
          <input
            type="time"
            value={time}
            onChange={(e) => onChange(combine(date ?? new Date(), e.target.value))}
            className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

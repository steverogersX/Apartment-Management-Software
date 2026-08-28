"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { DateRange } from "react-day-picker";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { CalendarDays, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { billHistory, type BillMonth } from "@/lib/mockData";

const chartConfig: ChartConfig = {
  paid: { label: "Paid", color: "#10b981" },
  due: { label: "Due", color: "#ef4444" },
};

const PRESETS = [
  { label: "Last month", months: 1 },
  { label: "Last 2 months", months: 2 },
  { label: "Last 3 months", months: 3 },
  { label: "Last 6 months", months: 6 },
] as const;

const today = new Date();

type Selection = { mode: "preset"; months: number } | { mode: "custom"; range: DateRange };

function rupees(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function filterByRange(range: DateRange): BillMonth[] {
  if (!range.from) return [];
  const from = startOfMonth(range.from);
  const to = endOfMonth(range.to ?? range.from);
  return billHistory.filter((m) => {
    const d = new Date(m.date);
    return d >= from && d <= to;
  });
}

export function BillsChart() {
  const [selection, setSelection] = React.useState<Selection>({ mode: "preset", months: 6 });
  const [open, setOpen] = React.useState(false);

  const data =
    selection.mode === "preset"
      ? billHistory.slice(-selection.months)
      : filterByRange(selection.range);

  const label =
    selection.mode === "preset"
      ? (PRESETS.find((p) => p.months === selection.months)?.label ?? "Custom range")
      : selection.range.from
        ? `${format(selection.range.from, "d MMM")} – ${format(
            selection.range.to ?? selection.range.from,
            "d MMM yyyy",
          )}`
        : "Custom range";

  const totalPaid = data.reduce((sum, m) => sum + m.paid, 0);
  const totalDue = data.reduce((sum, m) => sum + m.due, 0);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-md border border-border bg-card">
      <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-foreground">Maintenance bills</h3>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Paid <span className="font-medium text-foreground">{rupees(totalPaid)}</span>
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="size-1.5 rounded-full bg-red-500" />
              Due
              <span
                className={cn(
                  "font-medium",
                  totalDue > 0 ? "text-red-600 dark:text-red-400" : "text-foreground",
                )}
              >
                {rupees(totalDue)}
              </span>
            </span>
          </div>
        </div>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger render={<Button variant="outline" size="sm" className="gap-1.5" />}>
            <CalendarDays className="size-3.5" />
            {label}
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </PopoverTrigger>
          <PopoverContent align="end" className="w-auto flex-row gap-0 p-0">
            <div className="flex w-36 shrink-0 flex-col gap-0.5 border-r border-border p-2">
              {PRESETS.map((preset) => {
                const active = selection.mode === "preset" && selection.months === preset.months;
                return (
                  <button
                    key={preset.months}
                    onClick={() => {
                      setSelection({ mode: "preset", months: preset.months });
                      setOpen(false);
                    }}
                    className={cn(
                      "rounded-md px-2.5 py-1.5 text-left text-sm transition-colors",
                      active
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    {preset.label}
                  </button>
                );
              })}
              <div className="my-1 border-t border-border" />
              <span className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                Custom range
              </span>
            </div>
            <Calendar
              mode="range"
              numberOfMonths={1}
              defaultMonth={today}
              disabled={{ after: today }}
              selected={selection.mode === "custom" ? selection.range : undefined}
              onSelect={(range) => {
                if (!range) return;
                setSelection({ mode: "custom", range });
                if (range.from && range.to) setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-1 flex-col px-4 py-4">
        {data.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-full min-h-56 w-full flex-1"
          >
            <BarChart data={data} barGap={4} barCategoryGap={data.length <= 2 ? "40%" : 20}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
                tickFormatter={(v) => `₹${v / 1000}k`}
                width={42}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => [
                      rupees(Number(value)),
                      name === "paid" ? "Paid" : "Due",
                    ]}
                  />
                }
              />
              <Bar dataKey="paid" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={36} />
              <Bar dataKey="due" fill="#ef4444" radius={[3, 3, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex min-h-56 flex-1 flex-col items-center justify-center gap-1 text-center">
            <p className="text-sm font-medium text-foreground">No bills in this range</p>
            <p className="text-xs text-muted-foreground">
              Pick a different period to see activity.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

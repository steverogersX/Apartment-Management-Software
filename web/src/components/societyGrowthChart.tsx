"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { CalendarDays, ChevronDown, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { societyGrowth } from "@/lib/platformMockData";

const chartConfig: ChartConfig = {
  societies: { label: "Societies", color: "#6366f1" },
};

const PRESETS = [
  { label: "Last 3 months", months: 3 },
  { label: "Last 6 months", months: 6 },
  { label: "Last 12 months", months: 12 },
] as const;

export function SocietyGrowthChart() {
  const [months, setMonths] = React.useState(6);
  const [open, setOpen] = React.useState(false);

  const data = societyGrowth.slice(-months);
  const latest = data[data.length - 1]?.societies ?? 0;
  const first = data[0]?.societies ?? 0;
  const growth = latest - first;
  const label = PRESETS.find((p) => p.months === months)?.label ?? `Last ${months} months`;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-md border border-border bg-card">
      <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-foreground">Society growth</h3>
          <p className="text-xs text-muted-foreground">
            Onboarded societies, {label.toLowerCase()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="size-3" />+{growth} this period
          </div>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger render={<Button variant="outline" size="sm" className="gap-1.5" />}>
              <CalendarDays className="size-3.5" />
              {label}
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </PopoverTrigger>
            <PopoverContent align="end" className="w-44 p-1">
              {PRESETS.map((preset) => (
                <button
                  key={preset.months}
                  onClick={() => {
                    setMonths(preset.months);
                    setOpen(false);
                  }}
                  className={
                    preset.months === months
                      ? "w-full rounded-md bg-muted px-2.5 py-1.5 text-left text-sm font-medium text-foreground"
                      : "w-full rounded-md px-2.5 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                  }
                >
                  {preset.label}
                </button>
              ))}
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-4 py-4">
        <ChartContainer config={chartConfig} className="aspect-auto h-full min-h-56 w-full flex-1">
          <BarChart data={data} barCategoryGap={data.length > 8 ? 8 : 20}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} width={28} />
            <ChartTooltip
              content={<ChartTooltipContent formatter={(value) => [String(value), "Societies"]} />}
            />
            <Bar dataKey="societies" fill="#6366f1" radius={[3, 3, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}

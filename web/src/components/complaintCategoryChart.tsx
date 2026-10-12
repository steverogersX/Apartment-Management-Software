"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { complaints } from "@/lib/mockData";

type CategoryDatum = { category: string; count: number };

const CATEGORY_COLORS: Record<string, string> = {
  Plumbing: "#3b82f6",
  "Common Area": "#8b5cf6",
  Electrical: "#f59e0b",
  Maintenance: "#06b6d4",
  Housekeeping: "#10b981",
  Security: "#ef4444",
  Parking: "#6366f1",
  Noise: "#ec4899",
};

const FALLBACK_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#6366f1",
];

export function ComplaintCategoryChart({
  data,
  subtitle = "Tickets by category",
}: {
  data?: CategoryDatum[];
  subtitle?: string;
}) {
  const chartData = React.useMemo(() => {
    const source =
      data ??
      (() => {
        const map = new Map<string, number>();
        complaints.forEach((c) => map.set(c.category, (map.get(c.category) ?? 0) + 1));
        return Array.from(map.entries())
          .map(([category, count]) => ({ category, count }))
          .sort((a, b) => b.count - a.count);
      })();
    return source;
  }, [data]);

  const config: ChartConfig = React.useMemo(
    () =>
      Object.fromEntries(
        chartData.map((d, i) => [
          d.category,
          {
            label: d.category,
            color: CATEGORY_COLORS[d.category] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
          },
        ]),
      ),
    [chartData],
  );

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-md border border-border bg-card">
      <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-foreground">Complaints by category</h3>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-2 py-4">
        <ChartContainer config={config} className="h-64 w-full">
          <BarChart data={chartData} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={11}
              interval={0}
              angle={-14}
              dy={10}
              height={48}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={11}
              allowDecimals={false}
              width={28}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {chartData.map((d, i) => (
                <Cell
                  key={d.category}
                  fill={CATEGORY_COLORS[d.category] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>

        <div className="mt-2 flex flex-wrap gap-1.5 px-2">
          {chartData.map((d, i) => (
            <span
              key={d.category}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <span
                className="size-2 rounded-full"
                style={{
                  backgroundColor:
                    CATEGORY_COLORS[d.category] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
                }}
              />
              {d.category} ({d.count})
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

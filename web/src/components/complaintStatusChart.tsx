"use client";

import * as React from "react";
import { Cell, Label, Pie, PieChart } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { complaintStatusBreakdown, type ComplaintStatus } from "@/lib/mockData";

const STATUS_COLOR: Record<ComplaintStatus, string> = {
  open: "#3b82f6",
  in_progress: "#f59e0b",
  resolved: "#10b981",
  escalated: "#ef4444",
};

const STATUS_LABEL: Record<ComplaintStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
  escalated: "Escalated",
};

export function ComplaintStatusChart({
  data = complaintStatusBreakdown,
  subtitle = "All tickets for Flat 304",
}: {
  data?: { status: ComplaintStatus; count: number }[];
  subtitle?: string;
}) {
  const total = React.useMemo(() => data.reduce((sum, d) => sum + d.count, 0), [data]);
  const resolved = data.find((d) => d.status === "resolved")?.count ?? 0;
  const resolvedPct = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const config: ChartConfig = React.useMemo(
    () =>
      Object.fromEntries(
        data.map((d) => [
          d.status,
          { label: STATUS_LABEL[d.status], color: STATUS_COLOR[d.status] },
        ]),
      ),
    [data],
  );

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-md border border-border bg-card">
      <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-foreground">Complaint status</h3>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          {resolvedPct}% resolved
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-4 py-4">
        <div className="flex flex-1 items-center justify-center">
          <ChartContainer config={config} className="aspect-square h-44 w-44 shrink-0">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="status" />} />
              <Pie
                data={data}
                dataKey="count"
                nameKey="status"
                innerRadius={52}
                outerRadius={72}
                paddingAngle={2}
                strokeWidth={0}
              >
                {data.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_COLOR[entry.status]} />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (!viewBox || !("cx" in viewBox)) return null;
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-2xl font-semibold"
                        >
                          {total}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) + 18}
                          className="fill-muted-foreground text-[11px]"
                        >
                          Tickets
                        </tspan>
                      </text>
                    );
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>

        <div className="grid w-full grid-cols-2 gap-2">
          {data.map((d) => {
            const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
            return (
              <div
                key={d.status}
                className="flex items-center gap-2.5 rounded-md border border-border px-2.5 py-2"
              >
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: STATUS_COLOR[d.status] }}
                />
                <div className="flex min-w-0 flex-col leading-tight">
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    {d.count}
                  </span>
                  <span className="truncate text-[11px] text-muted-foreground">
                    {STATUS_LABEL[d.status]}
                  </span>
                </div>
                <span className="ml-auto text-xs tabular-nums text-muted-foreground">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

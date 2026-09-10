"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BudgetKpiRow } from "@/components/budget/budgetKpi";
import { computeActualAmount, type BudgetHead } from "@/lib/budgetMockData";
import { vouchers } from "@/lib/vouchersMockData";

export function BudgetSummaryChart({ heads }: { heads: BudgetHead[] }) {
  const expenseHeads = React.useMemo(() => heads.filter((h) => h.type === "Expense"), [heads]);
  const incomeHeads = React.useMemo(() => heads.filter((h) => h.type === "Income"), [heads]);

  const expensePlanned = React.useMemo(
    () => expenseHeads.reduce((s, h) => s + h.plannedAmount, 0),
    [expenseHeads],
  );
  const expenseActual = React.useMemo(
    () => expenseHeads.reduce((s, h) => s + computeActualAmount(h, vouchers), 0),
    [expenseHeads],
  );
  const incomePlanned = React.useMemo(
    () => incomeHeads.reduce((s, h) => s + h.plannedAmount, 0),
    [incomeHeads],
  );
  const incomeActual = React.useMemo(
    () => incomeHeads.reduce((s, h) => s + computeActualAmount(h, vouchers), 0),
    [incomeHeads],
  );

  const chartData = React.useMemo(
    () =>
      expenseHeads.map((h) => ({
        name: h.name,
        planned: h.plannedAmount,
        actual: computeActualAmount(h, vouchers),
      })),
    [expenseHeads],
  );

  const config: ChartConfig = {
    planned: { label: "Planned", color: "#94a3b8" },
    actual: { label: "Actual", color: "#3b82f6" },
  };

  return (
    <div className="flex flex-col gap-5">
      <BudgetKpiRow
        label="Expense Budget"
        planned={expensePlanned}
        actual={expenseActual}
        kind="Expense"
      />
      <BudgetKpiRow
        label="Income Budget"
        planned={incomePlanned}
        actual={incomeActual}
        kind="Income"
      />

      <div className="flex h-full flex-col overflow-hidden rounded-md border border-border bg-card">
        <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-semibold text-foreground">Budget vs Actual</h3>
            <p className="text-xs text-muted-foreground">Planned vs actual per expense head</p>
          </div>
        </div>

        <div className="flex flex-1 flex-col px-2 py-4">
          <ChartContainer config={config} className="h-64 w-full">
            <BarChart data={chartData} barGap={4} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={11}
                interval={0}
                angle={-14}
                dy={10}
                height={64}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={11}
                width={48}
                tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="planned"
                fill="var(--color-planned)"
                radius={[3, 3, 0, 0]}
                maxBarSize={24}
              />
              <Bar
                dataKey="actual"
                fill="var(--color-actual)"
                radius={[3, 3, 0, 0]}
                maxBarSize={24}
              />
            </BarChart>
          </ChartContainer>

          <div className="mt-2 flex flex-wrap gap-4 px-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-2 rounded-full" style={{ backgroundColor: "#94a3b8" }} />
              Planned
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-2 rounded-full" style={{ backgroundColor: "#3b82f6" }} />
              Actual
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

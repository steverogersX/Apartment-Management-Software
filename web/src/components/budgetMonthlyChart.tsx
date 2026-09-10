"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import { CalendarClock, ChartColumnBig, TableIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  currentFinancialYear,
  currentMonthIndexInFY,
  MONTHS_FY,
  type BudgetHead,
} from "@/lib/budgetMockData";

type ViewMode = "monthly" | "cumulative";

function formatCurrency(amount: number) {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

function formatCompact(amount: number) {
  return `₹${(amount / 1000).toFixed(0)}k`;
}

const config: ChartConfig = {
  planned: { label: "Planned", color: "#94a3b8" },
  actual: { label: "Actual", color: "#3b82f6" },
};

export function BudgetMonthlyChart({
  heads,
  financialYear,
}: {
  heads: BudgetHead[];
  financialYear: string;
}) {
  const [scopeId, setScopeId] = React.useState<string>("all");
  const [viewMode, setViewMode] = React.useState<ViewMode>("monthly");

  const expenseHeads = React.useMemo(() => heads.filter((h) => h.type === "Expense"), [heads]);

  const effectiveScopeId = expenseHeads.some((h) => h.id === scopeId) ? scopeId : "all";
  const scopeHeads =
    effectiveScopeId === "all"
      ? expenseHeads
      : expenseHeads.filter((h) => h.id === effectiveScopeId);

  const isCurrentFY = financialYear === currentFinancialYear();
  const currentMonthIdx = isCurrentFY ? currentMonthIndexInFY() : null;

  const monthlyTotals = React.useMemo(
    () =>
      MONTHS_FY.map((month, i) => ({
        month,
        planned: scopeHeads.reduce((sum, h) => sum + h.monthly[i].planned, 0),
        actual: scopeHeads.reduce((sum, h) => sum + h.monthly[i].actual, 0),
        isFuture: currentMonthIdx !== null && i > currentMonthIdx,
      })),
    [scopeHeads, currentMonthIdx],
  );

  const cumulativeTotals = React.useMemo(() => {
    let plannedRunning = 0;
    let actualRunning = 0;
    return monthlyTotals.map((m, i) => {
      plannedRunning += m.planned;
      actualRunning += m.actual;
      return {
        month: m.month,
        planned: plannedRunning,
        actual: currentMonthIdx !== null && i > currentMonthIdx ? null : actualRunning,
      };
    });
  }, [monthlyTotals, currentMonthIdx]);

  if (expenseHeads.length === 0) {
    return (
      <Card>
        <CardContent className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          No expense heads for this financial year.
        </CardContent>
      </Card>
    );
  }

  const chartData = viewMode === "monthly" ? monthlyTotals : cumulativeTotals;
  const todayMonthLabel = currentMonthIdx !== null ? MONTHS_FY[currentMonthIdx] : null;

  return (
    <Card className="gap-4">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-sm">
            <CalendarClock className="size-4 text-muted-foreground" />
            Monthly Spending
          </CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Expense heads only, planned vs actual by month ({financialYear}).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={effectiveScopeId} onValueChange={(v) => setScopeId(v ?? "all")}>
            <SelectTrigger className="w-48">
              <SelectValue>
                {(value: string) =>
                  value === "all"
                    ? "All expense heads"
                    : (expenseHeads.find((h) => h.id === value)?.name ?? "All expense heads")
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All expense heads</SelectItem>
              {expenseHeads.map((h) => (
                <SelectItem key={h.id} value={h.id}>
                  {h.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
            <Button
              variant={viewMode === "monthly" ? "secondary" : "ghost"}
              size="sm"
              className="gap-1.5"
              onClick={() => setViewMode("monthly")}
            >
              <ChartColumnBig className="size-3.5" />
              Monthly
            </Button>
            <Button
              variant={viewMode === "cumulative" ? "secondary" : "ghost"}
              size="sm"
              className="gap-1.5"
              onClick={() => setViewMode("cumulative")}
            >
              <TableIcon className="size-3.5" />
              Cumulative
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <ChartContainer config={config} className="h-64 w-full">
          {viewMode === "monthly" ? (
            <BarChart
              data={monthlyTotals}
              barGap={4}
              margin={{ left: 8, right: 8, top: 8, bottom: 0 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={11}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={11}
                width={48}
                tickFormatter={(v: number) => formatCompact(v)}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              {todayMonthLabel && (
                <ReferenceLine
                  x={todayMonthLabel}
                  stroke="var(--muted-foreground)"
                  strokeDasharray="3 3"
                  label={{
                    value: "Today",
                    position: "insideTopRight",
                    fontSize: 10,
                    fill: "var(--muted-foreground)",
                  }}
                />
              )}
              <Bar
                dataKey="planned"
                fill="var(--color-planned)"
                radius={[3, 3, 0, 0]}
                maxBarSize={20}
              />
              <Bar dataKey="actual" radius={[3, 3, 0, 0]} maxBarSize={20}>
                {monthlyTotals.map((m) => (
                  <Cell
                    key={m.month}
                    fill="var(--color-actual)"
                    fillOpacity={m.isFuture ? 0.25 : 1}
                  />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <LineChart data={cumulativeTotals} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={11}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={11}
                width={48}
                tickFormatter={(v: number) => formatCompact(v)}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              {todayMonthLabel && (
                <ReferenceLine
                  x={todayMonthLabel}
                  stroke="var(--muted-foreground)"
                  strokeDasharray="3 3"
                  label={{
                    value: "Today",
                    position: "insideTopRight",
                    fontSize: 10,
                    fill: "var(--muted-foreground)",
                  }}
                />
              )}
              <Line
                type="monotone"
                dataKey="planned"
                stroke="var(--color-planned)"
                strokeWidth={2}
                strokeDasharray="4 3"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="var(--color-actual)"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />
            </LineChart>
          )}
        </ChartContainer>

        <div className="flex flex-wrap items-center gap-4 px-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ backgroundColor: "#94a3b8" }} />
            Planned
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ backgroundColor: "#3b82f6" }} />
            Actual
          </span>
          {currentMonthIdx !== null && currentMonthIdx < 11 && (
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-blue-500/25" />
              Upcoming month — not yet incurred
            </span>
          )}
        </div>

        <div className="overflow-hidden rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">Planned</TableHead>
                <TableHead className="text-right">Actual</TableHead>
                <TableHead className="text-right">Variance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyTotals.map((m) => {
                const diff = m.actual - m.planned;
                const isOver = diff > 0 && !m.isFuture;
                const isUnder = diff < 0 && !m.isFuture;
                return (
                  <TableRow
                    key={m.month}
                    className={m.isFuture ? "text-muted-foreground/70" : undefined}
                  >
                    <TableCell className="font-medium text-foreground">
                      {m.month}
                      {m.month === todayMonthLabel && (
                        <span className="ml-1.5 text-[10px] text-muted-foreground">(current)</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(m.planned)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {m.isFuture ? "—" : formatCurrency(m.actual)}
                    </TableCell>
                    <TableCell
                      className={`text-right tabular-nums ${
                        isOver
                          ? "text-red-600 dark:text-red-400"
                          : isUnder
                            ? "text-emerald-600 dark:text-emerald-400"
                            : ""
                      }`}
                    >
                      {m.isFuture ? "—" : `${diff > 0 ? "+" : ""}${formatCurrency(diff)}`}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell className="font-semibold text-foreground">Total</TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {formatCurrency(monthlyTotals.reduce((s, m) => s + m.planned, 0))}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {formatCurrency(
                    monthlyTotals.reduce((s, m) => s + (m.isFuture ? 0 : m.actual), 0),
                  )}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {formatCurrency(
                    monthlyTotals.reduce((s, m) => s + (m.isFuture ? 0 : m.actual - m.planned), 0),
                  )}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

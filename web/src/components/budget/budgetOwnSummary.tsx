"use client";

import * as React from "react";
import { Landmark } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { BudgetKpiRow } from "@/components/budget/budgetKpi";
import { computeActualAmount, type BudgetHead } from "@/lib/budgetMockData";
import { vouchers } from "@/lib/vouchersMockData";

// Headline-only budget view for residents holding BudgetViewOwn but not
// BudgetViewAll — planned vs actual totals with no per-head or ledger-level
// breakdown, which is operational detail reserved for BudgetViewAll holders.
export function BudgetOwnSummary({ heads }: { heads: BudgetHead[] }) {
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

  if (heads.length === 0) {
    return (
      <Card>
        <CardContent className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          No budget published for this financial year yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-2 rounded-md border border-border bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
        <Landmark className="mt-0.5 size-3.5 shrink-0" />
        <p>
          Society-wide budget totals for the selected financial year. Head-by-head and monthly
          breakdowns are visible to committee members with full budget access.
        </p>
      </div>
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
    </div>
  );
}

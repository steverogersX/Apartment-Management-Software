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
  const planned = React.useMemo(() => heads.reduce((s, h) => s + h.plannedAmount, 0), [heads]);
  const actual = React.useMemo(
    () => heads.reduce((s, h) => s + computeActualAmount(h, vouchers), 0),
    [heads],
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
      <BudgetKpiRow label="Budget" planned={planned} actual={actual} />
    </div>
  );
}

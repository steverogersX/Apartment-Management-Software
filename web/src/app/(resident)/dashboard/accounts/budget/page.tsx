"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarClock, LayoutGrid, ListTree } from "lucide-react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BudgetHeadsTable } from "@/components/budgetHeadsTable";
import { BudgetMonthlyChart } from "@/components/budgetMonthlyChart";
import { BudgetSummaryChart } from "@/components/budgetSummaryChart";
import { useAuth } from "@/hooks/useAuth";
import { budgetHeads, currentFinancialYear, FINANCIAL_YEARS } from "@/lib/budgetMockData";

export default function BudgetPage() {
  const { has } = useAuth();
  const canViewAll = has("BudgetViewAll");
  const [financialYear, setFinancialYear] = React.useState<string>(() => {
    const current = currentFinancialYear();
    return budgetHeads.some((h) => h.financialYear === current) ? current : FINANCIAL_YEARS[0];
  });
  const [version, setVersion] = React.useState(0);

  // `version` is unused in the body but bumping it forces this to recompute after
  // budgetHeads is mutated in place (push/clone), which doesn't change identity.
  const heads = React.useMemo(
    () => budgetHeads.filter((h) => h.financialYear === financialYear),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [financialYear, version],
  );

  if (!canViewAll) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          You do not have permission to view the budget.
        </p>
        <Link href="/dashboard" className="text-sm font-medium text-foreground underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Budget</h1>
          <p className="text-sm text-muted-foreground">
            Annual budget heads, planned vs actuals and variance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="fy-select" className="text-sm text-muted-foreground">
            Financial Year
          </Label>
          <Select
            value={financialYear}
            onValueChange={(v) => setFinancialYear(v ?? FINANCIAL_YEARS[0])}
          >
            <SelectTrigger id="fy-select" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FINANCIAL_YEARS.map((fy) => (
                <SelectItem key={fy} value={fy}>
                  {fy}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview" className="gap-1.5">
            <LayoutGrid className="size-3.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="monthly" className="gap-1.5">
            <CalendarClock className="size-3.5" />
            Monthly Spending
          </TabsTrigger>
          <TabsTrigger value="heads" className="gap-1.5">
            <ListTree className="size-3.5" />
            Budget Heads
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="animate-rise mt-4">
          <BudgetSummaryChart heads={heads} />
        </TabsContent>

        <TabsContent value="monthly" className="animate-rise mt-4">
          <BudgetMonthlyChart heads={heads} financialYear={financialYear} />
        </TabsContent>

        <TabsContent value="heads" className="animate-rise mt-4">
          <BudgetHeadsTable
            financialYear={financialYear}
            key={`${financialYear}-${version}`}
            onMutate={() => setVersion((v) => v + 1)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

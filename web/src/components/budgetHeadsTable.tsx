"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Copy, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableFilterConfig } from "@/components/dataTable";
import { DataTableColumnHeader } from "@/components/dataTableColumnHeader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  budgetHeads,
  generateMonthlyBreakdown,
  type BudgetHead,
  type BudgetHeadType,
  type EditBudgetHeadInput,
} from "@/lib/budgetMockData";
import { AddBudgetHeadForm } from "./budget/addBudgetHeadForm";
import { useAuth } from "@/hooks/useAuth";

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function varianceLabel(planned: number, actual: number) {
  const diff = actual - planned;
  const pct = planned ? (diff / planned) * 100 : 0;
  const sign = diff > 0 ? "+" : "";
  return `${sign}${formatCurrency(diff)} (${sign}${pct.toFixed(1)}%)`;
}

export function BudgetHeadsTable({
  financialYear,
  onMutate,
}: {
  financialYear: string;
  onMutate?: () => void;
}) {
  const { has } = useAuth();
  const canManage = has("BudgetManage");
  const [version, setVersion] = React.useState(0);
  const [addOpen, setAddOpen] = React.useState(false);

  const rows = React.useMemo(
    () => budgetHeads.filter((h) => h.financialYear === financialYear),
    [financialYear, version],
  );

  const priorYear = React.useMemo(() => {
    const [y] = financialYear.split("-");
    const prev = Number(y) - 1;
    return `${prev}-${String(prev + 1).slice(-2)}`;
  }, [financialYear]);

  const priorHeads = React.useMemo(
    () => budgetHeads.filter((h) => h.financialYear === priorYear),
    [priorYear],
  );
  const canClone = rows.length === 0 && priorHeads.length > 0;

  function handleAddSave(values: EditBudgetHeadInput) {
    const newHead: BudgetHead = {
      id: crypto.randomUUID(),
      name: values.name,
      type: values.type,
      plannedAmount: values.plannedAmount,
      actualAmount: values.actualAmount,
      financialYear: values.financialYear,
      monthly: generateMonthlyBreakdown(values.name, values.plannedAmount, values.actualAmount),
    };
    budgetHeads.push(newHead);
    setVersion((v) => v + 1);
    onMutate?.();
    setAddOpen(false);
  }

  function handleClone() {
    if (!canClone) return;
    priorHeads.forEach((h) => {
      budgetHeads.push({
        id: crypto.randomUUID(),
        name: h.name,
        type: h.type,
        plannedAmount: h.plannedAmount,
        actualAmount: 0,
        financialYear,
        monthly: generateMonthlyBreakdown(h.name, h.plannedAmount, 0),
      });
    });
    setVersion((v) => v + 1);
    onMutate?.();
  }

  const columns = React.useMemo<ColumnDef<BudgetHead>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Head"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="text-sm font-medium text-foreground">{row.original.name}</span>
        ),
      },
      {
        id: "type",
        accessorKey: "type",
        meta: { label: "Type" },
        header: () => <DataTableColumnHeader label="Type" />,
        cell: ({ row }) => (
          <Badge variant={row.original.type === "Income" ? "secondary" : "outline"}>
            {row.original.type}
          </Badge>
        ),
      },
      {
        id: "plannedAmount",
        accessorKey: "plannedAmount",
        meta: { label: "Planned" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Planned Amount"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {formatCurrency(row.original.plannedAmount)}
          </span>
        ),
      },
      {
        id: "actualAmount",
        accessorKey: "actualAmount",
        meta: { label: "Actual" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Actual Amount"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm font-medium text-foreground">
            {formatCurrency(row.original.actualAmount)}
          </span>
        ),
      },
      {
        id: "variance",
        accessorFn: (row) => row.actualAmount - row.plannedAmount,
        meta: { label: "Variance" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Variance"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => {
          const diff = row.original.actualAmount - row.original.plannedAmount;
          const pct = row.original.plannedAmount ? (diff / row.original.plannedAmount) * 100 : 0;
          const isOver = diff > 0;
          const isUnder = diff < 0;
          return (
            <span
              className={`whitespace-nowrap text-sm font-medium tabular-nums ${isOver ? "text-red-600 dark:text-red-400" : isUnder ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}
            >
              {varianceLabel(row.original.plannedAmount, row.original.actualAmount)}
            </span>
          );
        },
      },
    ],
    [],
  );

  const filters = React.useMemo<DataTableFilterConfig<BudgetHead>[]>(
    () => [
      {
        id: "search",
        label: "Search",
        type: "search",
        placeholder: "Search head",
        predicate: (row, query) => row.name.toLowerCase().includes(query.toLowerCase()),
      },
      {
        id: "type",
        label: "Type",
        type: "select",
        options: (["Income", "Expense"] as BudgetHeadType[]).map((t) => ({ label: t, value: t })),
        predicate: (row, value) => row.type === value,
      },
    ],
    [],
  );

  return (
    <>
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(r) => r.id}
        title="Budget Heads"
        filters={filters}
        enableColumnVisibility
        enableColumnReorder
        enableFilterCustomization
        showPageSize
        pageSize={10}
        itemLabel="head"
        emptyMessage="No budget heads for this financial year."
        toolbarActions={
          canManage ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={handleClone}
                disabled={!canClone}
                title={
                  !canClone
                    ? rows.length > 0
                      ? "Current FY already has heads"
                      : `No heads in ${priorYear}`
                    : undefined
                }
              >
                <Copy className="size-3.5" />
                Clone Previous Year
              </Button>
              <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
                <Plus className="size-3.5" />
                Add Budget Head
              </Button>
            </div>
          ) : undefined
        }
      />

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add budget head</DialogTitle>
            <DialogDescription>Add a new head to the {financialYear} budget.</DialogDescription>
          </DialogHeader>
          <AddBudgetHeadForm
            key={`${financialYear}-${String(addOpen)}`}
            financialYear={financialYear}
            onSave={handleAddSave}
            onCancel={() => setAddOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

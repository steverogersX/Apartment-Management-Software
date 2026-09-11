"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Copy, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable, type DataTableFilterConfig } from "@/components/dataTable";
import { DataTableColumnHeader } from "@/components/dataTableColumnHeader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { accountName } from "@/lib/chartOfAccountsMockData";
import {
  budgetHeads,
  computeActualAmount,
  type BudgetHead,
  type EditBudgetHeadInput,
} from "@/lib/budgetMockData";
import { vouchers } from "@/lib/vouchersMockData";
import { AddBudgetHeadForm } from "./budget/addBudgetHeadForm";
import { EditBudgetHeadForm } from "./budget/editBudgetHeadForm";
import { useAuth } from "@/hooks/useAuth";

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function varianceLabel(planned: number, actual: number) {
  const diff = actual - planned;
  if (diff === 0) return "On budget";
  const pct = planned ? (Math.abs(diff) / planned) * 100 : 0;
  const direction = diff > 0 ? "Overspent" : "Saved";
  return `${direction} ${formatCurrency(Math.abs(diff))} (${pct.toFixed(1)}%)`;
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
  const [editing, setEditing] = React.useState<BudgetHead | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<BudgetHead | null>(null);

  const rows = React.useMemo(
    () => budgetHeads.filter((h) => h.financialYear === financialYear),
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      planningMode: values.planningMode,
      plannedAmount: values.plannedAmount,
      monthlyPlanned: values.planningMode === "monthly" ? values.monthlyPlanned : null,
      financialYear: values.financialYear,
      ledgerAccountId: values.ledgerAccountId,
    };
    budgetHeads.push(newHead);
    setVersion((v) => v + 1);
    onMutate?.();
    setAddOpen(false);
  }

  function handleEditSave(values: EditBudgetHeadInput) {
    if (!editing) return;
    const idx = budgetHeads.findIndex((h) => h.id === editing.id);
    if (idx !== -1) {
      budgetHeads[idx] = {
        ...budgetHeads[idx],
        name: values.name,
        planningMode: values.planningMode,
        plannedAmount: values.plannedAmount,
        monthlyPlanned: values.planningMode === "monthly" ? values.monthlyPlanned : null,
        financialYear: values.financialYear,
        ledgerAccountId: values.ledgerAccountId,
      };
    }
    setVersion((v) => v + 1);
    onMutate?.();
    setEditing(null);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    const idx = budgetHeads.findIndex((h) => h.id === deleteTarget.id);
    if (idx !== -1) budgetHeads.splice(idx, 1);
    setVersion((v) => v + 1);
    onMutate?.();
    setDeleteTarget(null);
  }

  function handleClone() {
    if (!canClone) return;
    priorHeads.forEach((h) => {
      budgetHeads.push({
        id: crypto.randomUUID(),
        name: h.name,
        planningMode: h.planningMode,
        plannedAmount: h.plannedAmount,
        monthlyPlanned: h.monthlyPlanned ? [...h.monthlyPlanned] : null,
        financialYear,
        ledgerAccountId: h.ledgerAccountId,
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
        id: "ledgerAccountId",
        accessorFn: (row) => accountName(row.ledgerAccountId),
        meta: { label: "Ledger" },
        header: () => <DataTableColumnHeader label="Ledger" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {accountName(row.original.ledgerAccountId)}
          </span>
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
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-sm text-muted-foreground">
              {formatCurrency(row.original.plannedAmount)}
            </span>
            {row.original.planningMode === "monthly" && (
              <Badge variant="outline" className="text-[10px]">
                Monthly
              </Badge>
            )}
          </div>
        ),
      },
      {
        id: "actualAmount",
        accessorFn: (row) => computeActualAmount(row, vouchers),
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
            {formatCurrency(computeActualAmount(row.original, vouchers))}
          </span>
        ),
      },
      {
        id: "variance",
        accessorFn: (row) => computeActualAmount(row, vouchers) - row.plannedAmount,
        meta: { label: "Variance" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Variance"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => {
          const actual = computeActualAmount(row.original, vouchers);
          const diff = actual - row.original.plannedAmount;
          const isBad = diff > 0;
          const isGood = diff < 0;
          return (
            <span
              className={`whitespace-nowrap text-sm font-medium tabular-nums ${isBad ? "text-red-600 dark:text-red-400" : isGood ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}
            >
              {varianceLabel(row.original.plannedAmount, actual)}
            </span>
          );
        },
      },
      ...(canManage
        ? [
            {
              id: "actions",
              enableHiding: false,
              header: () => <span className="sr-only">Actions</span>,
              cell: ({ row }: { row: { original: BudgetHead } }) => (
                <div onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem className="gap-2" onClick={() => setEditing(row.original)}>
                        <Pencil className="size-4 text-muted-foreground" />
                        Edit head
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        className="gap-2"
                        onClick={() => setDeleteTarget(row.original)}
                      >
                        <Trash2 className="size-4" />
                        Delete head
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ),
            } satisfies ColumnDef<BudgetHead>,
          ]
        : []),
    ],
    [canManage],
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

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit budget head</DialogTitle>
            <DialogDescription>Update this head&apos;s planned amount or ledger.</DialogDescription>
          </DialogHeader>
          {editing && (
            <EditBudgetHeadForm
              key={editing.id}
              head={editing}
              onSave={handleEditSave}
              onCancel={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete budget head</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">{deleteTarget?.name}</span> from the{" "}
              {financialYear} budget? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

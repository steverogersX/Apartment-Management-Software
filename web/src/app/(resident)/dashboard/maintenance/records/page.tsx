"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Eye,
  MoreHorizontal,
  Plus,
  Receipt,
  Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { DataTable, type DataTableFilterConfig } from "@/components/dataTable";
import { DataTableColumnHeader } from "@/components/dataTableColumnHeader";
import {
  chargesToCsv,
  downloadCsv,
  flatChargeBadgeClass,
  flatChargeLabel,
  formatCurrency,
  formatDate,
} from "@/components/maintenance/cycleBreakdownDialog";
import { FlatLedgerDialog } from "@/components/maintenance/flatLedgerDialog";
import {
  getChargesByCycle,
  getLedgerByFlat,
  maintenanceHistory,
  type FlatCharge,
  type FlatChargeStatus,
} from "@/lib/maintenanceMockData";
import { GenerateMaintenanceDialog } from "@/components/maintenance/generateMaintenanceDialog";

const monthOpts = [...maintenanceHistory]
  .sort((a, b) => b.monthKey.localeCompare(a.monthKey))
  .map((cycle) => ({ value: cycle.monthKey, label: cycle.monthLabel }));

const latestMonthKey = monthOpts[0]?.value ?? "";

export default function MaintenanceRecordsPage() {
  const [generateOpen, setGenerateOpen] = React.useState(false);
  const [selectedMonthKey, setSelectedMonthKey] = React.useState(latestMonthKey);
  const [selectedFlat, setSelectedFlat] = React.useState<string | null>(null);
  const [ledgerOpen, setLedgerOpen] = React.useState(false);

  const selectedCycle = React.useMemo(
    () =>
      maintenanceHistory.find((cycle) => cycle.monthKey === selectedMonthKey) ??
      maintenanceHistory[0],
    [selectedMonthKey],
  );

  const charges = React.useMemo(
    () => (selectedCycle ? getChargesByCycle(selectedCycle.id) : []),
    [selectedCycle],
  );

  const openLedger = React.useCallback((flat: string) => {
    setSelectedFlat(flat);
    setLedgerOpen(true);
  }, []);

  const downloadStatement = React.useCallback((flat: string) => {
    downloadCsv(
      `maintenance-ledger-${flat.toLowerCase()}.csv`,
      chargesToCsv(getLedgerByFlat(flat)),
    );
  }, []);

  const kpis = React.useMemo(() => {
    const totalCollection = charges.reduce((s, r) => s + r.amountPaid, 0);
    const pendingAmount = charges.reduce((s, r) => s + r.balance, 0);
    const paidFlats = charges.filter((r) => r.status === "paid").length;
    const pendingFlats = charges.length - paidFlats;
    return { totalCollection, pendingAmount, paidFlats, pendingFlats };
  }, [charges]);

  const summary = React.useMemo(() => {
    const totalFlats = charges.length;
    const paid = charges.filter((r) => r.status === "paid").length;
    const pending = totalFlats - paid;
    const percent = totalFlats ? Math.round((paid / totalFlats) * 100) : 0;
    const collected = charges.reduce((s, r) => s + r.amountPaid, 0);
    return {
      currentMonth: selectedCycle?.monthLabel ?? "",
      totalFlats,
      paid,
      pending,
      percent,
      collected,
    };
  }, [charges, selectedCycle]);

  const columns = React.useMemo<ColumnDef<FlatCharge>[]>(
    () => [
      {
        id: "flat",
        accessorKey: "flat",
        size: 110,
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Flat"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => openLedger(row.original.flat)}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            {row.original.flat}
          </button>
        ),
      },
      {
        id: "owner",
        accessorKey: "owner",
        size: 180,
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Owner"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="truncate text-sm text-foreground">{row.original.owner}</span>
        ),
      },
      {
        id: "tower",
        accessorKey: "tower",
        meta: { label: "Tower" },
        size: 90,
        header: () => <DataTableColumnHeader label="Tower" />,
        cell: ({ row }) => (
          <span className="inline-flex size-7 items-center justify-center rounded-full border bg-muted text-xs font-medium text-foreground">
            {row.original.tower}
          </span>
        ),
      },
      {
        id: "due",
        accessorKey: "amountDue",
        meta: { label: "Due" },
        size: 120,
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Due"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm font-medium text-foreground">
            {formatCurrency(row.original.amountDue)}
          </span>
        ),
      },
      {
        id: "paid",
        accessorKey: "amountPaid",
        meta: { label: "Paid" },
        size: 120,
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Paid"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {formatCurrency(row.original.amountPaid)}
          </span>
        ),
      },
      {
        id: "balance",
        accessorKey: "balance",
        meta: { label: "Balance" },
        size: 120,
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Balance"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm font-medium text-foreground">
            {formatCurrency(row.original.balance)}
          </span>
        ),
      },
      {
        id: "dueDate",
        accessorKey: "dueDate",
        meta: { label: "Due Date" },
        size: 130,
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Due Date"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {formatDate(row.original.dueDate)}
          </span>
        ),
      },
      {
        id: "status",
        accessorKey: "status",
        meta: { label: "Status" },
        size: 120,
        header: () => <DataTableColumnHeader label="Status" />,
        cell: ({ row }) => (
          <Badge variant="outline" className={flatChargeBadgeClass[row.original.status]}>
            {flatChargeLabel[row.original.status]}
          </Badge>
        ),
      },
      {
        id: "paidOn",
        accessorKey: "paidOn",
        meta: { label: "Paid On" },
        size: 130,
        header: () => <DataTableColumnHeader label="Paid On" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {row.original.paidOn ? formatDate(row.original.paidOn) : "—"}
          </span>
        ),
      },
      {
        id: "paidVia",
        accessorKey: "paidVia",
        meta: { label: "Paid Via" },
        size: 130,
        header: () => <DataTableColumnHeader label="Paid Via" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {row.original.paidVia ?? "—"}
          </span>
        ),
      },
      {
        id: "actions",
        enableHiding: false,
        size: 110,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="View ledger"
              onClick={() => openLedger(row.original.flat)}
            >
              <Eye className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="Download statement"
              onClick={() => downloadStatement(row.original.flat)}
            >
              <Receipt className="size-3.5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="ghost" size="icon-xs" aria-label="More" />}
              >
                <MoreHorizontal className="size-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => openLedger(row.original.flat)}>
                  View ledger
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => downloadStatement(row.original.flat)}>
                  Download statement
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [downloadStatement, openLedger],
  );

  const filters = React.useMemo<DataTableFilterConfig<FlatCharge>[]>(
    () => [
      {
        id: "search",
        label: "Search",
        type: "search",
        placeholder: "Search flat, owner…",
        predicate: (row, query) => {
          const q = query.toLowerCase();
          return (
            row.flat.toLowerCase().includes(q) ||
            row.owner.toLowerCase().includes(q) ||
            row.tower.toLowerCase().includes(q)
          );
        },
      },
      {
        id: "flat",
        label: "Flat",
        type: "select",
        options: Array.from(new Set(charges.map((r) => r.flat)))
          .sort()
          .map((f) => ({ label: f, value: f })),
        predicate: (row, value) => row.flat === value,
      },
      {
        id: "tower",
        label: "Tower",
        type: "select",
        options: Array.from(new Set(charges.map((r) => r.tower)))
          .sort()
          .map((t) => ({ label: `Tower ${t}`, value: t })),
        predicate: (row, value) => row.tower === value,
      },
      {
        id: "resident",
        label: "Resident",
        type: "select",
        options: Array.from(new Set(charges.map((r) => r.owner)))
          .sort()
          .map((o) => ({ label: o, value: o })),
        predicate: (row, value) => row.owner === value,
      },
      {
        id: "status",
        label: "Status",
        type: "select",
        options: (Object.keys(flatChargeLabel) as FlatChargeStatus[]).map((status) => ({
          label: flatChargeLabel[status],
          value: status,
        })),
        predicate: (row, value) => row.status === value,
      },
      {
        id: "paidVia",
        label: "Paid via",
        type: "select",
        options: Array.from(
          new Set(charges.map((r) => r.paidVia).filter((m): m is NonNullable<typeof m> => !!m)),
        )
          .sort()
          .map((mode) => ({ label: mode, value: mode })),
        predicate: (row, value) => row.paidVia === value,
      },
      {
        id: "groupBy",
        label: "Group by",
        type: "groupBy",
        options: [
          { label: "None", value: "none" },
          { label: "Tower", value: "tower" },
          { label: "Status", value: "status" },
          { label: "Flat", value: "flat" },
          { label: "Resident", value: "resident" },
        ],
        groupBy: (row, value) => {
          if (value === "tower") return `Tower ${row.tower}`;
          if (value === "status") return flatChargeLabel[row.status];
          if (value === "flat") return row.flat;
          if (value === "resident") return row.owner;
          return "Other";
        },
      },
    ],
    [charges],
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            Maintenance Records
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage flat &amp; tower maintenance payments
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={selectedMonthKey}
            onValueChange={(v) => {
              if (v) setSelectedMonthKey(v);
            }}
          >
            <SelectTrigger size="sm" className="w-40">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {monthOpts.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" className="gap-1.5" onClick={() => setGenerateOpen(true)}>
            <Plus className="size-3.5" />
            Generate Maintenance
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="gap-3 rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Collection
            </CardTitle>
            <span className="flex size-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
              <Wallet className="size-4" />
            </span>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <span className="text-xl font-semibold tracking-tight text-foreground">
              {formatCurrency(kpis.totalCollection)}
            </span>
            <span className="text-xs text-muted-foreground">Paid in {summary.currentMonth}</span>
          </CardContent>
        </Card>
        <Card className="gap-3 rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Amount
            </CardTitle>
            <span className="flex size-8 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300">
              <CircleDollarSign className="size-4" />
            </span>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <span className="text-xl font-semibold tracking-tight text-foreground">
              {formatCurrency(kpis.pendingAmount)}
            </span>
            <span className="text-xs text-muted-foreground">Across {kpis.pendingFlats} flats</span>
          </CardContent>
        </Card>
        <Card className="gap-3 rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Paid Flats</CardTitle>
            <span className="flex size-8 items-center justify-center rounded-full bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300">
              <CheckCircle2 className="size-4" />
            </span>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <span className="text-xl font-semibold tracking-tight text-foreground">
              {kpis.paidFlats}
            </span>
            <span className="text-xs text-muted-foreground">Out of {charges.length} flats</span>
          </CardContent>
        </Card>
        <Card className="gap-3 rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Flats
            </CardTitle>
            <span className="flex size-8 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300">
              <Clock3 className="size-4" />
            </span>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <span className="text-xl font-semibold tracking-tight text-foreground">
              {kpis.pendingFlats}
            </span>
            <span className="text-xs text-muted-foreground">Require follow-up</span>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
        <div className="min-w-0 flex-1">
          <DataTable
            key={selectedMonthKey}
            data={charges}
            columns={columns}
            getRowId={(r) => r.chargeId}
            filters={filters}
            title={`Records · ${summary.currentMonth}`}
            enableColumnReorder
            enableColumnVisibility
            enableFilterCustomization
            showPageSize
            pageSize={10}
            itemLabel="record"
            emptyMessage="No maintenance records match these filters."
          />
        </div>

        <Card className="w-full shrink-0 rounded-xl xl:sticky xl:top-4 xl:w-[300px]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Summary</CardTitle>
            <p className="text-xs text-muted-foreground">{summary.currentMonth} overview</p>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2.5">
              <span className="text-xs font-medium text-muted-foreground">Current month</span>
              <span className="text-sm font-semibold text-foreground">{summary.currentMonth}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="flex flex-col gap-1 rounded-lg border bg-card px-2 py-3">
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Total flats
                </span>
                <span className="text-lg font-semibold text-foreground">{summary.totalFlats}</span>
              </div>
              <div className="flex flex-col gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-3 dark:border-emerald-900 dark:bg-emerald-950/30">
                <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  Paid
                </span>
                <span className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">
                  {summary.paid}
                </span>
              </div>
              <div className="flex flex-col gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2 py-3 dark:border-amber-900 dark:bg-amber-950/30">
                <span className="text-[11px] font-medium uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  Pending
                </span>
                <span className="text-lg font-semibold text-amber-700 dark:text-amber-300">
                  {summary.pending}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-muted-foreground">Collection progress</span>
                <span className="font-semibold text-foreground">{summary.percent}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${summary.percent}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {summary.paid} of {summary.totalFlats} flats paid ·{" "}
                {formatCurrency(summary.collected)} collected
              </span>
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Collection %</span>
                <span className="font-semibold text-foreground">{summary.percent}%</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="size-2 rounded-full bg-emerald-500" />
                Paid · {summary.paid} flats
                <span className="mx-1 text-muted-foreground/40">·</span>
                <span className="size-2 rounded-full bg-amber-500" />
                Pending · {summary.pending} flats
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <GenerateMaintenanceDialog open={generateOpen} onOpenChange={setGenerateOpen} />
      <FlatLedgerDialog flat={selectedFlat} open={ledgerOpen} onOpenChange={setLedgerOpen} />
    </div>
  );
}

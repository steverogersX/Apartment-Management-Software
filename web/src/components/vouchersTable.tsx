"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createVoucher,
  vouchers,
  type AddVoucherInput,
  type Voucher,
  type VoucherStatus,
  type VoucherType,
} from "@/lib/vouchersMockData";
import { accountName } from "@/lib/chartOfAccountsMockData";
import { AddVoucherForm } from "./vouchers/addVoucherForm";
import { useAuth } from "@/hooks/useAuth";
import { recordAudit } from "@/lib/auditLog";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function statusVariant(status: VoucherStatus) {
  if (status === "Posted") return "secondary";
  if (status === "Cancelled") return "destructive";
  return "outline";
}

export function VouchersTable() {
  const { user, has } = useAuth();
  const actor = user?.displayName ?? "Unknown";
  const canManage = has("VouchersManage");
  const [rows, setRows] = React.useState<Voucher[]>(() => [...vouchers]);
  const [addOpen, setAddOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Voucher | null>(null);
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState("");

  function refresh(id: string, patch: Partial<Voucher>) {
    const idx = vouchers.findIndex((v) => v.id === id);
    if (idx !== -1) Object.assign(vouchers[idx], patch);
    setRows((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
    setSelected((prev) => (prev && prev.id === id ? { ...prev, ...patch } : prev));
  }

  function handleAddSave(values: AddVoucherInput) {
    const voucher = createVoucher({
      type: values.type,
      date: values.date,
      narration: values.narration,
      debitAccountId: values.debitAccountId,
      creditAccountId: values.creditAccountId,
      amount: values.amount,
      status: "Draft",
      createdBy: actor,
    });
    setRows((prev) => [...prev, voucher]);
    recordAudit({
      module: "Vouchers",
      entityType: "Voucher",
      entityId: voucher.id,
      entityLabel: voucher.voucherNumber,
      action: "Create",
      performedBy: actor,
      details: values.narration,
    });
    setAddOpen(false);
  }

  function handlePost(voucher: Voucher) {
    if (voucher.status !== "Draft") return;
    const now = new Date().toISOString();
    refresh(voucher.id, { status: "Posted", postedBy: actor, postedAt: now });
    recordAudit({
      module: "Vouchers",
      entityType: "Voucher",
      entityId: voucher.id,
      entityLabel: voucher.voucherNumber,
      action: "Status Change",
      performedBy: actor,
      details: "Draft → Posted",
    });
  }

  function handleCancel(voucher: Voucher) {
    if (voucher.status === "Cancelled" || !cancelReason.trim()) return;
    refresh(voucher.id, {
      status: "Cancelled",
      cancelledBy: actor,
      cancelledReason: cancelReason.trim(),
    });
    recordAudit({
      module: "Vouchers",
      entityType: "Voucher",
      entityId: voucher.id,
      entityLabel: voucher.voucherNumber,
      action: "Cancel",
      performedBy: actor,
      details: cancelReason.trim(),
    });
    setCancelOpen(false);
    setCancelReason("");
  }

  const columns = React.useMemo<ColumnDef<Voucher>[]>(
    () => [
      {
        id: "voucherNumber",
        accessorKey: "voucherNumber",
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Voucher #"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm font-medium text-foreground">
            {row.original.voucherNumber}
          </span>
        ),
      },
      {
        id: "type",
        accessorKey: "type",
        meta: { label: "Type" },
        header: () => <DataTableColumnHeader label="Type" />,
        cell: ({ row }) => <Badge variant="outline">{row.original.type}</Badge>,
      },
      {
        id: "date",
        accessorKey: "date",
        meta: { label: "Date" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Date"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {formatDate(row.original.date)}
          </span>
        ),
      },
      {
        id: "narration",
        accessorKey: "narration",
        meta: { label: "Narration" },
        header: () => <DataTableColumnHeader label="Narration" />,
        cell: ({ row }) => (
          <span
            className="block max-w-[220px] truncate text-sm text-muted-foreground"
            title={row.original.narration}
          >
            {row.original.narration}
          </span>
        ),
      },
      {
        id: "debitAccountId",
        accessorFn: (row) => accountName(row.debitAccountId),
        meta: { label: "Debit" },
        header: () => <DataTableColumnHeader label="Debit Account" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {accountName(row.original.debitAccountId)}
          </span>
        ),
      },
      {
        id: "creditAccountId",
        accessorFn: (row) => accountName(row.creditAccountId),
        meta: { label: "Credit" },
        header: () => <DataTableColumnHeader label="Credit Account" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {accountName(row.original.creditAccountId)}
          </span>
        ),
      },
      {
        id: "amount",
        accessorKey: "amount",
        meta: { label: "Amount" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Amount"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm font-medium text-foreground">
            {formatCurrency(row.original.amount)}
          </span>
        ),
      },
      {
        id: "status",
        accessorKey: "status",
        meta: { label: "Status" },
        header: () => <DataTableColumnHeader label="Status" />,
        cell: ({ row }) => (
          <Badge variant={statusVariant(row.original.status)}>{row.original.status}</Badge>
        ),
      },
      {
        id: "source",
        accessorFn: (row) => row.sourceModule ?? "Manual",
        meta: { label: "Source" },
        header: () => <DataTableColumnHeader label="Source" />,
        cell: ({ row }) => (
          <Badge variant={row.original.sourceModule ? "secondary" : "outline"}>
            {row.original.sourceModule ?? "Manual"}
          </Badge>
        ),
      },
    ],
    [],
  );

  const filters = React.useMemo<DataTableFilterConfig<Voucher>[]>(
    () => [
      {
        id: "search",
        label: "Search",
        type: "search",
        placeholder: "Search number or narration",
        predicate: (row, query) => {
          const q = query.toLowerCase();
          return (
            row.voucherNumber.toLowerCase().includes(q) || row.narration.toLowerCase().includes(q)
          );
        },
      },
      {
        id: "type",
        label: "Type",
        type: "select",
        options: (["Payment", "Receipt", "Journal", "Contra"] as VoucherType[]).map((t) => ({
          label: t,
          value: t,
        })),
        predicate: (row, value) => row.type === value,
      },
      {
        id: "status",
        label: "Status",
        type: "select",
        options: (["Draft", "Posted", "Cancelled"] as VoucherStatus[]).map((s) => ({
          label: s,
          value: s,
        })),
        predicate: (row, value) => row.status === value,
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
        title="Vouchers"
        filters={filters}
        enableColumnVisibility
        enableColumnReorder
        enableFilterCustomization
        showPageSize
        pageSize={10}
        itemLabel="voucher"
        emptyMessage="No vouchers found."
        onRowClick={(row) => setSelected(row)}
        toolbarActions={
          canManage ? (
            <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
              <Plus className="size-3.5" />
              New Voucher
            </Button>
          ) : undefined
        }
      />

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New voucher</DialogTitle>
            <DialogDescription>Create a manual voucher — it starts as Draft.</DialogDescription>
          </DialogHeader>
          <AddVoucherForm
            key={String(addOpen)}
            onSave={handleAddSave}
            onCancel={() => setAddOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.voucherNumber}</DialogTitle>
            <DialogDescription>
              {selected?.type} voucher · {selected ? formatDate(selected.date) : ""}
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={statusVariant(selected.status)}>{selected.status}</Badge>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Narration</span>
                <span className="max-w-[280px] text-right font-medium text-foreground">
                  {selected.narration}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Debit</span>
                <span className="font-medium text-foreground">
                  {accountName(selected.debitAccountId)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Credit</span>
                <span className="font-medium text-foreground">
                  {accountName(selected.creditAccountId)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(selected.amount)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Source</span>
                <span className="font-medium text-foreground">
                  {selected.sourceModule ?? "Manual"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Created by</span>
                <span className="font-medium text-foreground">{selected.createdBy}</span>
              </div>
              {selected.postedBy && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Posted by</span>
                  <span className="font-medium text-foreground">
                    {selected.postedBy}
                    {selected.postedAt ? ` on ${formatDate(selected.postedAt)}` : ""}
                  </span>
                </div>
              )}
              {selected.cancelledReason && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Cancel reason</span>
                  <span className="max-w-[280px] text-right font-medium text-foreground">
                    {selected.cancelledReason}
                    {selected.cancelledBy ? ` · ${selected.cancelledBy}` : ""}
                  </span>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                {canManage && selected.status === "Draft" && selected.sourceModule === null && (
                  <Button size="sm" onClick={() => handlePost(selected)}>
                    Post
                  </Button>
                )}
                {canManage && selected.status !== "Cancelled" && (
                  <Button variant="destructive" size="sm" onClick={() => setCancelOpen(true)}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel voucher</DialogTitle>
            <DialogDescription>
              Provide a reason for cancelling {selected?.voucherNumber}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="vch-cancel-reason">Reason</Label>
            <Textarea
              id="vch-cancel-reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              Keep voucher
            </Button>
            <Button
              variant="destructive"
              disabled={!cancelReason.trim()}
              onClick={() => selected && handleCancel(selected)}
            >
              Confirm cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

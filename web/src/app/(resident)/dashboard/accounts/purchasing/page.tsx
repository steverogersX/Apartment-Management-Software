"use client";

import * as React from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { Check, Plus, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  purchaseOrders as initialPOs,
  purchaseRequests as initialPRs,
  vendors as initialVendors,
  type PurchaseOrder,
  type PurchaseRequest,
  type Vendor,
} from "@/lib/purchasingMockData";
import { inventoryItems, stockTransactions } from "@/lib/inventoryMockData";
import { AddPurchaseRequestForm } from "@/components/purchasing/addPurchaseRequestForm";
import { AddVendorForm, type AddVendorInput } from "@/components/purchasing/addVendorForm";
import { CreatePurchaseOrderForm } from "@/components/purchasing/createPurchaseOrderForm";
import { ReceiveGoodsForm } from "@/components/purchasing/receiveGoodsForm";
import { useAuth } from "@/hooks/useAuth";
import { recordAudit } from "@/lib/auditLog";
import { createVoucher } from "@/lib/vouchersMockData";

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

function prTotal(pr: PurchaseRequest) {
  return pr.items.reduce((s, it) => s + it.quantity * it.estimatedUnitPrice, 0);
}

export default function PurchasingPage() {
  const { user, has } = useAuth();
  const actor = user?.displayName ?? "Unknown";
  const canApprove = has("PurchasingApprove");
  const canManage = has("PurchasingManage");

  if (!has("PurchasingView")) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          You do not have permission to view purchasing.
        </p>
        <Link href="/dashboard" className="text-sm font-medium text-foreground underline">
          Back to dashboard
        </Link>
      </div>
    );
  }
  const [prs, setPrs] = React.useState<PurchaseRequest[]>(() => [...initialPRs]);
  const [pos, setPos] = React.useState<PurchaseOrder[]>(() => [...initialPOs]);
  const [vendors, setVendors] = React.useState<Vendor[]>(() => [...initialVendors]);

  const [prDialogOpen, setPrDialogOpen] = React.useState(false);
  const [poDialogOpen, setPoDialogOpen] = React.useState(false);
  const [vendorDialogOpen, setVendorDialogOpen] = React.useState(false);
  const [selectedPr, setSelectedPr] = React.useState<PurchaseRequest | null>(null);
  const [selectedPo, setSelectedPo] = React.useState<PurchaseOrder | null>(null);
  const [rejectReason, setRejectReason] = React.useState("");
  const [rejectOpen, setRejectOpen] = React.useState(false);

  function handleAddPR(values: { requestedBy: string; items: PurchaseRequest["items"] }) {
    const pr: PurchaseRequest = {
      id: crypto.randomUUID(),
      requestNumber: `PR-2025-${String(initialPRs.length + prs.length + 1).padStart(3, "0")}`,
      requestedBy: values.requestedBy,
      requestDate: new Date().toISOString(),
      items: values.items,
      status: "Pending Approval",
      rejectionReason: null,
      approvedBy: null,
      approvedAt: null,
      rejectedBy: null,
      rejectedAt: null,
    };
    initialPRs.push(pr);
    setPrs((prev) => [...prev, pr]);
    recordAudit({
      module: "Purchasing",
      entityType: "Purchase Request",
      entityId: pr.id,
      entityLabel: pr.requestNumber,
      action: "Create",
      performedBy: actor,
      details: `${pr.items.length} items · ${formatCurrency(prTotal(pr))}`,
    });
    setPrDialogOpen(false);
  }

  function handleApprove(pr: PurchaseRequest) {
    const now = new Date().toISOString();
    const idx = initialPRs.findIndex((p) => p.id === pr.id);
    if (idx !== -1) {
      initialPRs[idx].status = "Approved";
      initialPRs[idx].approvedBy = actor;
      initialPRs[idx].approvedAt = now;
    }
    setPrs((prev) =>
      prev.map((p) =>
        p.id === pr.id
          ? { ...p, status: "Approved" as const, approvedBy: actor, approvedAt: now }
          : p,
      ),
    );
    setSelectedPr((prev) =>
      prev && prev.id === pr.id
        ? { ...prev, status: "Approved" as const, approvedBy: actor, approvedAt: now }
        : prev,
    );
    recordAudit({
      module: "Purchasing",
      entityType: "Purchase Request",
      entityId: pr.id,
      entityLabel: pr.requestNumber,
      action: "Approve",
      performedBy: actor,
    });
  }

  function handleReject(pr: PurchaseRequest) {
    if (!rejectReason.trim()) return;
    const now = new Date().toISOString();
    const idx = initialPRs.findIndex((p) => p.id === pr.id);
    if (idx !== -1) {
      initialPRs[idx].status = "Rejected";
      initialPRs[idx].rejectionReason = rejectReason.trim();
      initialPRs[idx].rejectedBy = actor;
      initialPRs[idx].rejectedAt = now;
    }
    setPrs((prev) =>
      prev.map((p) =>
        p.id === pr.id
          ? {
              ...p,
              status: "Rejected" as const,
              rejectionReason: rejectReason.trim(),
              rejectedBy: actor,
              rejectedAt: now,
            }
          : p,
      ),
    );
    setSelectedPr((prev) =>
      prev && prev.id === pr.id
        ? {
            ...prev,
            status: "Rejected" as const,
            rejectionReason: rejectReason.trim(),
            rejectedBy: actor,
            rejectedAt: now,
          }
        : prev,
    );
    recordAudit({
      module: "Purchasing",
      entityType: "Purchase Request",
      entityId: pr.id,
      entityLabel: pr.requestNumber,
      action: "Reject",
      performedBy: actor,
      details: rejectReason.trim(),
    });
    setRejectOpen(false);
    setRejectReason("");
  }

  function handleCreatePO(values: {
    prId: string;
    vendorId: string;
    expectedDeliveryDate: string;
  }) {
    const pr = prs.find((p) => p.id === values.prId);
    if (!pr || pr.status !== "Approved") return;
    if (pos.some((po) => po.prId === pr.id && po.status !== "Cancelled")) return;
    const total = pr.items.reduce((s, it) => s + it.quantity * it.estimatedUnitPrice, 0);
    const po: PurchaseOrder = {
      id: crypto.randomUUID(),
      poNumber: `PO-2025-${String(initialPOs.length + pos.length + 1).padStart(3, "0")}`,
      prId: pr.id,
      vendorId: values.vendorId,
      items: pr.items.map((it) => ({ ...it })),
      totalAmount: total,
      status: "Sent",
      orderDate: new Date().toISOString(),
      expectedDeliveryDate: values.expectedDeliveryDate,
      receivedDate: null,
      createdBy: actor,
      receivedBy: null,
      paidBy: null,
      paidAt: null,
    };
    initialPOs.push(po);
    setPos((prev) => [...prev, po]);
    recordAudit({
      module: "Purchasing",
      entityType: "Purchase Order",
      entityId: po.id,
      entityLabel: po.poNumber,
      action: "Create",
      performedBy: actor,
      details: `From ${pr.requestNumber} · ${formatCurrency(total)}`,
    });
    setPoDialogOpen(false);
  }

  function handleReceive(
    order: PurchaseOrder,
    received: {
      description: string;
      orderedQuantity: number;
      receivedQuantity: number;
      unit: string;
    }[],
  ) {
    const now = new Date().toISOString();
    const idx = initialPOs.findIndex((p) => p.id === order.id);
    if (idx !== -1) {
      initialPOs[idx].status = "Received";
      initialPOs[idx].receivedDate = now;
      initialPOs[idx].receivedBy = actor;
    }
    setPos((prev) =>
      prev.map((p) =>
        p.id === order.id
          ? { ...p, status: "Received" as const, receivedDate: now, receivedBy: actor }
          : p,
      ),
    );
    setSelectedPo((prev) =>
      prev && prev.id === order.id
        ? { ...prev, status: "Received" as const, receivedDate: now, receivedBy: actor }
        : prev,
    );
    recordAudit({
      module: "Purchasing",
      entityType: "Purchase Order",
      entityId: order.id,
      entityLabel: order.poNumber,
      action: "Goods Received",
      performedBy: actor,
      details: received
        .filter((it) => it.receivedQuantity > 0)
        .map((it) => `${it.receivedQuantity} × ${it.description}`)
        .join(", "),
    });
    received.forEach((it) => {
      if (it.receivedQuantity <= 0) return;
      const inv = inventoryItems.find(
        (invIt) => invIt.name.toLowerCase() === it.description.toLowerCase(),
      );
      if (!inv) return;
      const newBalance = inv.currentStock + it.receivedQuantity;
      inv.currentStock = newBalance;
      const txn = {
        id: crypto.randomUUID(),
        itemId: inv.id,
        date: now,
        type: "Stock In" as const,
        quantity: it.receivedQuantity,
        balanceAfter: newBalance,
        reason: `Goods receipt for ${order.poNumber}`,
        recordedBy: actor,
      };
      stockTransactions.push(txn);
      recordAudit({
        module: "Inventory",
        entityType: "Stock Transaction",
        entityId: txn.id,
        entityLabel: `Stock In — ${inv.name}`,
        action: "Create",
        performedBy: actor,
        details: `${it.receivedQuantity} ${it.unit} via ${order.poNumber}`,
      });
    });
  }

  function handleVendorPayment(order: PurchaseOrder) {
    if (order.status !== "Received" || order.paidAt) return;
    const now = new Date().toISOString();
    const idx = initialPOs.findIndex((p) => p.id === order.id);
    if (idx !== -1) {
      initialPOs[idx].paidBy = actor;
      initialPOs[idx].paidAt = now;
    }
    setPos((prev) =>
      prev.map((p) => (p.id === order.id ? { ...p, paidBy: actor, paidAt: now } : p)),
    );
    setSelectedPo((prev) =>
      prev && prev.id === order.id ? { ...prev, paidBy: actor, paidAt: now } : prev,
    );
    const vendor = vendors.find((v) => v.id === order.vendorId);
    const expenseByCategory: Record<string, string> = {
      Electrical: "la-electricity",
      Cleaning: "la-housekeeping",
      Stationery: "la-office",
      Maintenance: "la-repairs",
    };
    const voucher = createVoucher({
      type: "Payment",
      date: now,
      narration: `Vendor payment for ${order.poNumber} — ${vendor?.name ?? "vendor"}`,
      debitAccountId: (vendor && expenseByCategory[vendor.category]) || "la-repairs",
      creditAccountId: "la-bank",
      amount: order.totalAmount,
      status: "Posted",
      sourceModule: "Purchasing",
      sourceRefId: order.id,
      createdBy: actor,
      postedBy: actor,
      postedAt: now,
    });
    recordAudit({
      module: "Vouchers",
      entityType: "Voucher",
      entityId: voucher.id,
      entityLabel: voucher.voucherNumber,
      action: "Create",
      performedBy: actor,
      details: `Auto-generated from ${order.poNumber}`,
    });
  }

  function handleAddVendor(values: AddVendorInput) {
    const v: Vendor = {
      id: crypto.randomUUID(),
      name: values.name,
      category: values.category,
      contactPerson: values.contactPerson,
      phone: values.phone,
      email: values.email,
    };
    initialVendors.push(v);
    setVendors((prev) => [...prev, v]);
    recordAudit({
      module: "Purchasing",
      entityType: "Vendor",
      entityId: v.id,
      entityLabel: v.name,
      action: "Create",
      performedBy: actor,
    });
    setVendorDialogOpen(false);
  }

  const prColumns = React.useMemo<ColumnDef<PurchaseRequest>[]>(
    () => [
      {
        id: "requestNumber",
        accessorKey: "requestNumber",
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Request #"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="text-sm font-medium text-foreground">{row.original.requestNumber}</span>
        ),
      },
      {
        id: "requestedBy",
        accessorKey: "requestedBy",
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Requested By"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{row.original.requestedBy}</span>
        ),
      },
      {
        id: "requestDate",
        accessorKey: "requestDate",
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Date"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.requestDate)}
          </span>
        ),
      },
      {
        id: "itemCount",
        accessorFn: (row) => row.items.length,
        header: () => <DataTableColumnHeader label="Items" />,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{row.original.items.length}</span>
        ),
      },
      {
        id: "total",
        accessorFn: (row) => prTotal(row),
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Total"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="text-sm font-medium text-foreground">
            {formatCurrency(prTotal(row.original))}
          </span>
        ),
      },
      {
        id: "status",
        accessorKey: "status",
        header: () => <DataTableColumnHeader label="Status" />,
        cell: ({ row }) => {
          const s = row.original.status;
          return (
            <Badge
              variant={
                s === "Approved"
                  ? "secondary"
                  : s === "Rejected"
                    ? "destructive"
                    : s === "Pending Approval"
                      ? "outline"
                      : "outline"
              }
            >
              {s}
            </Badge>
          );
        },
      },
    ],
    [],
  );

  const prFilters = React.useMemo<DataTableFilterConfig<PurchaseRequest>[]>(
    () => [
      {
        id: "search",
        label: "Search",
        type: "search",
        placeholder: "Search request # or by",
        predicate: (row, q) =>
          row.requestNumber.toLowerCase().includes(q.toLowerCase()) ||
          row.requestedBy.toLowerCase().includes(q.toLowerCase()),
      },
      {
        id: "status",
        label: "Status",
        type: "select",
        options: ["Draft", "Pending Approval", "Approved", "Rejected"].map((s) => ({
          label: s,
          value: s,
        })),
        predicate: (row, v) => row.status === v,
      },
    ],
    [],
  );

  const poColumns = React.useMemo<ColumnDef<PurchaseOrder>[]>(
    () => [
      {
        id: "poNumber",
        accessorKey: "poNumber",
        header: ({ column }) => (
          <DataTableColumnHeader
            label="PO #"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="text-sm font-medium text-foreground">{row.original.poNumber}</span>
        ),
      },
      {
        id: "vendorId",
        accessorFn: (row) => vendors.find((v) => v.id === row.vendorId)?.name ?? row.vendorId,
        header: () => <DataTableColumnHeader label="Vendor" />,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {vendors.find((v) => v.id === row.original.vendorId)?.name ?? row.original.vendorId}
          </span>
        ),
      },
      {
        id: "orderDate",
        accessorKey: "orderDate",
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Order Date"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.original.orderDate)}
          </span>
        ),
      },
      {
        id: "totalAmount",
        accessorKey: "totalAmount",
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Total"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="text-sm font-medium text-foreground">
            {formatCurrency(row.original.totalAmount)}
          </span>
        ),
      },
      {
        id: "status",
        accessorKey: "status",
        header: () => <DataTableColumnHeader label="Status" />,
        cell: ({ row }) => {
          const s = row.original.status;
          return (
            <Badge
              variant={
                s === "Received"
                  ? "secondary"
                  : s === "Sent"
                    ? "outline"
                    : s === "Cancelled"
                      ? "destructive"
                      : "outline"
              }
            >
              {s}
            </Badge>
          );
        },
      },
    ],
    [vendors],
  );

  const vendorColumns = React.useMemo<ColumnDef<Vendor>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Name"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="text-sm font-medium text-foreground">{row.original.name}</span>
        ),
      },
      {
        id: "category",
        accessorKey: "category",
        header: () => <DataTableColumnHeader label="Category" />,
        cell: ({ row }) => <Badge variant="outline">{row.original.category}</Badge>,
      },
      {
        id: "contactPerson",
        accessorKey: "contactPerson",
        header: () => <DataTableColumnHeader label="Contact" />,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{row.original.contactPerson}</span>
        ),
      },
      {
        id: "phone",
        accessorKey: "phone",
        header: () => <DataTableColumnHeader label="Phone" />,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{row.original.phone}</span>
        ),
      },
      {
        id: "email",
        accessorKey: "email",
        header: () => <DataTableColumnHeader label="Email" />,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{row.original.email}</span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Purchasing</h1>
        <p className="text-sm text-muted-foreground">
          Purchase requests, orders and vendor management.
        </p>
      </div>

      <Tabs defaultValue="requests">
        <TabsList>
          <TabsTrigger value="requests">Purchase Requests</TabsTrigger>
          <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="mt-4">
          <DataTable
            data={prs}
            columns={prColumns}
            getRowId={(r) => r.id}
            title="Requests"
            filters={prFilters}
            enableColumnVisibility
            enableFilterCustomization
            showPageSize
            pageSize={8}
            itemLabel="request"
            emptyMessage="No purchase requests."
            onRowClick={(row) => setSelectedPr(row)}
            toolbarActions={
              canManage ? (
                <Button size="sm" className="gap-1.5" onClick={() => setPrDialogOpen(true)}>
                  <Plus className="size-3.5" />
                  New Request
                </Button>
              ) : undefined
            }
          />
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          <DataTable
            data={pos}
            columns={poColumns}
            getRowId={(r) => r.id}
            title="Orders"
            showPageSize
            pageSize={8}
            itemLabel="order"
            emptyMessage="No purchase orders."
            onRowClick={(row) => setSelectedPo(row)}
            toolbarActions={
              canManage ? (
                <Button size="sm" className="gap-1.5" onClick={() => setPoDialogOpen(true)}>
                  <Plus className="size-3.5" />
                  Create PO
                </Button>
              ) : undefined
            }
          />
        </TabsContent>

        <TabsContent value="vendors" className="mt-4">
          <DataTable
            data={vendors}
            columns={vendorColumns}
            getRowId={(r) => r.id}
            title="Vendors"
            showPageSize
            pageSize={8}
            itemLabel="vendor"
            emptyMessage="No vendors."
            toolbarActions={
              canManage ? (
                <Button size="sm" className="gap-1.5" onClick={() => setVendorDialogOpen(true)}>
                  <Plus className="size-3.5" />
                  Add Vendor
                </Button>
              ) : undefined
            }
          />
        </TabsContent>
      </Tabs>

      <Dialog open={prDialogOpen} onOpenChange={setPrDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New purchase request</DialogTitle>
            <DialogDescription>Create a new purchase request.</DialogDescription>
          </DialogHeader>
          <AddPurchaseRequestForm
            key={String(prDialogOpen)}
            onSave={handleAddPR}
            onCancel={() => setPrDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedPr} onOpenChange={(o) => !o && setSelectedPr(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedPr?.requestNumber}</DialogTitle>
            <DialogDescription>
              Requested by {selectedPr?.requestedBy} ·{" "}
              {selectedPr ? formatDate(selectedPr.requestDate) : ""}
            </DialogDescription>
          </DialogHeader>
          {selectedPr && (
            <div className="flex flex-col gap-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedPr.items.map((it, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-sm text-foreground">{it.description}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{it.quantity}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{it.unit}</TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        ₹{it.estimatedUnitPrice.toLocaleString("en-IN")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-between border-t pt-2 text-sm font-medium">
                <span>Total</span>
                <span>{formatCurrency(prTotal(selectedPr))}</span>
              </div>
              <Badge
                variant={
                  selectedPr.status === "Approved"
                    ? "secondary"
                    : selectedPr.status === "Rejected"
                      ? "destructive"
                      : "outline"
                }
                className="w-fit"
              >
                {selectedPr.status}
              </Badge>
              {selectedPr.status === "Approved" && selectedPr.approvedBy && (
                <p className="text-xs text-muted-foreground">
                  Approved by {selectedPr.approvedBy}
                  {selectedPr.approvedAt ? ` on ${formatDate(selectedPr.approvedAt)}` : ""}
                </p>
              )}
              {selectedPr.rejectionReason && (
                <p className="text-xs text-destructive">Reason: {selectedPr.rejectionReason}</p>
              )}
              {selectedPr.status === "Rejected" && selectedPr.rejectedBy && (
                <p className="text-xs text-muted-foreground">
                  Rejected by {selectedPr.rejectedBy}
                  {selectedPr.rejectedAt ? ` on ${formatDate(selectedPr.rejectedAt)}` : ""}
                </p>
              )}
              {canApprove && selectedPr.status === "Pending Approval" && (
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setRejectOpen(true)}>
                    Reject
                  </Button>
                  <Button size="sm" className="gap-1.5" onClick={() => handleApprove(selectedPr)}>
                    <Check className="size-3.5" />
                    Approve
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject request</DialogTitle>
            <DialogDescription>Provide a reason for rejection.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reject-reason">Reason</Label>
            <Textarea
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!rejectReason.trim()}
              onClick={() => selectedPr && handleReject(selectedPr)}
            >
              Confirm reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={poDialogOpen} onOpenChange={setPoDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create purchase order</DialogTitle>
            <DialogDescription>Generate a PO from an approved request.</DialogDescription>
          </DialogHeader>
          <CreatePurchaseOrderForm
            key={String(poDialogOpen)}
            onSave={handleCreatePO}
            onCancel={() => setPoDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedPo} onOpenChange={(o) => !o && setSelectedPo(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedPo?.poNumber}</DialogTitle>
            <DialogDescription>
              Vendor: {selectedPo ? vendors.find((v) => v.id === selectedPo.vendorId)?.name : ""} ·
              Created by {selectedPo?.createdBy ?? "—"}
            </DialogDescription>
          </DialogHeader>
          {selectedPo && (
            <div className="flex flex-col gap-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedPo.items.map((it, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-sm text-foreground">{it.description}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{it.quantity}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{it.unit}</TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        ₹{it.estimatedUnitPrice.toLocaleString("en-IN")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-between text-sm">
                <span>Total</span>
                <span className="font-medium">{formatCurrency(selectedPo.totalAmount)}</span>
              </div>
              <Badge
                variant={
                  selectedPo.status === "Received"
                    ? "secondary"
                    : selectedPo.status === "Sent"
                      ? "outline"
                      : "outline"
                }
                className="w-fit"
              >
                {selectedPo.status}
              </Badge>
              {selectedPo.paidAt && (
                <p className="text-xs text-muted-foreground">
                  Paid by {selectedPo.paidBy ?? "—"} on {formatDate(selectedPo.paidAt)}
                </p>
              )}
              {canManage && selectedPo.status === "Received" && !selectedPo.paidAt && (
                <div className="flex justify-end">
                  <Button size="sm" onClick={() => handleVendorPayment(selectedPo)}>
                    Record Vendor Payment
                  </Button>
                </div>
              )}
              {selectedPo.status === "Received" && selectedPo.receivedBy && (
                <p className="text-xs text-muted-foreground">
                  Received by {selectedPo.receivedBy}
                  {selectedPo.receivedDate ? ` on ${formatDate(selectedPo.receivedDate)}` : ""}
                </p>
              )}
              {canManage && selectedPo.status === "Sent" && (
                <ReceiveGoodsForm
                  order={selectedPo}
                  onSave={(items) => handleReceive(selectedPo, items)}
                  onCancel={() => setSelectedPo(null)}
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={vendorDialogOpen} onOpenChange={setVendorDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add vendor</DialogTitle>
            <DialogDescription>Add a new procurement vendor.</DialogDescription>
          </DialogHeader>
          <AddVendorForm
            key={String(vendorDialogOpen)}
            onSave={handleAddVendor}
            onCancel={() => setVendorDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

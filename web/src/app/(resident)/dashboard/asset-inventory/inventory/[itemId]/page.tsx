"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Pencil, Plus } from "lucide-react";

import { useBreadcrumbTitle } from "@/components/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  inventoryItems,
  stockTransactions,
  type AddStockTransactionInput,
  type EditInventoryItemInput,
  type InventoryItem,
  type StockTransaction,
} from "@/lib/inventoryMockData";
import { EditInventoryItemForm } from "@/components/inventory/editInventoryItemForm";
import { AddStockTransactionForm } from "@/components/inventory/addStockTransactionForm";
import { InventoryLedgerTimeline } from "@/components/inventoryLedgerTimeline";
import { useAuth } from "@/hooks/useAuth";
import { recordAudit } from "@/lib/auditLog";

export default function InventoryItemDetailPage() {
  const params = useParams<{ itemId: string }>();
  const { user, has } = useAuth();
  const actor = user?.displayName ?? "Unknown";
  const canManage = has("InventoryManage");
  const initialItem = React.useMemo(
    () => inventoryItems.find((i) => i.id === params.itemId) ?? null,
    [params.itemId],
  );
  const [item, setItem] = React.useState<InventoryItem | null>(initialItem);
  const [editOpen, setEditOpen] = React.useState(false);
  const [txnOpen, setTxnOpen] = React.useState(false);
  const [logs, setLogs] = React.useState<StockTransaction[]>(() =>
    stockTransactions.filter((t) => t.itemId === params.itemId),
  );

  React.useEffect(() => {
    setItem(initialItem);
  }, [initialItem]);

  React.useEffect(() => {
    setLogs(stockTransactions.filter((t) => t.itemId === params.itemId));
  }, [params.itemId]);

  useBreadcrumbTitle(item?.name ?? null);

  if (!has("InventoryView")) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          You do not have permission to view inventory.
        </p>
        <Link href="/dashboard" className="text-sm font-medium text-foreground underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-sm text-muted-foreground">Item not found.</p>
        <Link
          href="/dashboard/asset-inventory/inventory"
          className="text-sm font-medium text-foreground underline"
        >
          Back to Inventory
        </Link>
      </div>
    );
  }

  const lowStock = item.currentStock <= item.reorderLevel;

  function handleEditSave(values: EditInventoryItemInput) {
    if (!item) return;
    const idx = inventoryItems.findIndex((i) => i.id === item.id);
    if (idx !== -1) {
      Object.assign(inventoryItems[idx], values);
    }
    setItem((prev) => (prev ? { ...prev, ...values } : prev));
    recordAudit({
      module: "Inventory",
      entityType: "Inventory Item",
      entityId: item.id,
      entityLabel: item.name,
      action: "Update",
      performedBy: actor,
    });
    setEditOpen(false);
  }

  function handleTransaction(values: AddStockTransactionInput) {
    if (!item) return;
    const current = item.currentStock;
    const nextBalance =
      values.type === "Stock In"
        ? current + values.quantity
        : Math.max(0, current - values.quantity);
    const newTxn: StockTransaction = {
      id: crypto.randomUUID(),
      itemId: item.id,
      date: new Date().toISOString(),
      type: values.type,
      quantity: values.quantity,
      balanceAfter: nextBalance,
      reason: values.reason,
      allottedTo: values.type === "Staff Allotment" ? values.allottedTo || undefined : undefined,
      recordedBy: actor,
    };
    stockTransactions.push(newTxn);
    setLogs((prev) => [newTxn, ...prev]);
    recordAudit({
      module: "Inventory",
      entityType: "Stock Transaction",
      entityId: newTxn.id,
      entityLabel: `${values.type} — ${item.name}`,
      action: "Create",
      performedBy: actor,
      details: `${values.quantity} ${item.unit} — ${values.reason}`,
    });
    const idx = inventoryItems.findIndex((i) => i.id === item.id);
    if (idx !== -1) {
      inventoryItems[idx].currentStock = nextBalance;
    }
    setItem((prev) => (prev ? { ...prev, currentStock: nextBalance } : prev));
    setTxnOpen(false);
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <Link
        href="/dashboard/asset-inventory/inventory"
        className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to Inventory
      </Link>

      <Card>
        <CardContent className="flex gap-5 p-6">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">{item.name}</h1>
              <Badge variant="outline">{item.category}</Badge>
              <Badge variant="outline">{item.store}</Badge>
              <Badge variant={lowStock ? "destructive" : "secondary"}>
                {lowStock ? "Low Stock" : "In Stock"}
              </Badge>
              {canManage && (
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto gap-1.5"
                  onClick={() => setEditOpen(true)}
                >
                  <Pencil className="size-3.5" />
                  Edit Item
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {item.currentStock} {item.unit} in stock · Reorder at {item.reorderLevel} {item.unit}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Stock Details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Current stock</span>
              <span className="font-medium text-foreground">
                {item.currentStock} {item.unit}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Reorder level</span>
              <span className="font-medium text-foreground">
                {item.reorderLevel} {item.unit}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Store</span>
              <span className="font-medium text-foreground">{item.store}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Category</span>
              <span className="font-medium text-foreground">{item.category}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Unit</span>
              <span className="font-medium text-foreground">{item.unit}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reorder Status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={lowStock ? "destructive" : "secondary"}>
                {lowStock ? "Low Stock" : "In Stock"}
              </Badge>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all ${lowStock ? "bg-amber-500" : "bg-emerald-500"}`}
                style={{
                  width: `${Math.min(100, (item.currentStock / Math.max(1, item.reorderLevel * 2)) * 100)}%`,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {lowStock
                ? `Below reorder level — consider restocking ${item.name}.`
                : `${item.name} is sufficiently stocked.`}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
          <CardTitle>Stock Ledger</CardTitle>
          {canManage && (
            <Button size="sm" className="gap-1.5" onClick={() => setTxnOpen(true)}>
              <Plus className="size-3.5" />
              Record Transaction
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <InventoryLedgerTimeline logs={logs} />
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit item</DialogTitle>
            <DialogDescription>Update the inventory item details.</DialogDescription>
          </DialogHeader>
          {item && (
            <EditInventoryItemForm
              key={item.id + JSON.stringify(item)}
              item={item}
              onSave={handleEditSave}
              onCancel={() => setEditOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={txnOpen} onOpenChange={setTxnOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Record transaction</DialogTitle>
            <DialogDescription>Log a stock in, stock out or staff allotment.</DialogDescription>
          </DialogHeader>
          <AddStockTransactionForm
            key={String(txnOpen)}
            onSave={handleTransaction}
            onCancel={() => setTxnOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

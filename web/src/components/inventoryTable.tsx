"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { useRouter } from "next/navigation";

import { Plus } from "lucide-react";

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
  inventoryItems,
  type InventoryItem,
  type EditInventoryItemInput,
} from "@/lib/inventoryMockData";
import { AddInventoryItemForm } from "./inventory/addInventoryItemForm";
import { useAuth } from "@/hooks/useAuth";
import { recordAudit } from "@/lib/auditLog";

export function InventoryTable() {
  const router = useRouter();
  const { user, has } = useAuth();
  const actor = user?.displayName ?? "Unknown";
  const canManage = has("InventoryManage");
  const [rows, setRows] = React.useState<InventoryItem[]>(() => [...inventoryItems]);
  const [addOpen, setAddOpen] = React.useState(false);

  function handleAddSave(values: EditInventoryItemInput) {
    const newItem: InventoryItem = {
      id: crypto.randomUUID(),
      name: values.name,
      category: values.category,
      unit: values.unit,
      currentStock: values.currentStock,
      reorderLevel: values.reorderLevel,
      store: values.store,
    };
    inventoryItems.push(newItem);
    setRows((prev) => [...prev, newItem]);
    recordAudit({
      module: "Inventory",
      entityType: "Inventory Item",
      entityId: newItem.id,
      entityLabel: newItem.name,
      action: "Create",
      performedBy: actor,
    });
    setAddOpen(false);
  }

  const columns = React.useMemo<ColumnDef<InventoryItem>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Item"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="truncate text-sm font-medium text-foreground">{row.original.name}</span>
        ),
      },
      {
        id: "category",
        accessorKey: "category",
        meta: { label: "Category" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Category"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => <Badge variant="outline">{row.original.category}</Badge>,
      },
      {
        id: "store",
        accessorKey: "store",
        meta: { label: "Store" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Store"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {row.original.store}
          </span>
        ),
      },
      {
        id: "currentStock",
        accessorKey: "currentStock",
        meta: { label: "Stock" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Current Stock"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm font-medium text-foreground">
            {row.original.currentStock} {row.original.unit}
          </span>
        ),
      },
      {
        id: "reorderLevel",
        accessorKey: "reorderLevel",
        meta: { label: "Reorder" },
        header: () => <DataTableColumnHeader label="Reorder Level" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {row.original.reorderLevel} {row.original.unit}
          </span>
        ),
      },
      {
        id: "status",
        accessorFn: (row) => (row.currentStock <= row.reorderLevel ? "low" : "ok"),
        meta: { label: "Status" },
        header: () => <DataTableColumnHeader label="Status" />,
        cell: ({ row }) => {
          const low = row.original.currentStock <= row.original.reorderLevel;
          return (
            <Badge variant={low ? "destructive" : "secondary"}>
              {low ? "Low Stock" : "In Stock"}
            </Badge>
          );
        },
      },
    ],
    [],
  );

  const filters = React.useMemo<DataTableFilterConfig<InventoryItem>[]>(
    () => [
      {
        id: "search",
        label: "Search",
        type: "search",
        placeholder: "Search item",
        predicate: (row, query) => row.name.toLowerCase().includes(query.toLowerCase()),
      },
      {
        id: "category",
        label: "Category",
        type: "select",
        options: Array.from(new Set(inventoryItems.map((i) => i.category))).map((c) => ({
          label: c,
          value: c,
        })),
        predicate: (row, value) => row.category === value,
      },
      {
        id: "groupBy",
        label: "Group by",
        type: "groupBy",
        options: [
          { label: "None", value: "none" },
          { label: "Category", value: "category" },
          { label: "Store", value: "store" },
        ],
        groupBy: (row, value) => {
          if (value === "store") return row.store;
          return row.category;
        },
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
        title="Inventory"
        filters={filters}
        enableColumnVisibility
        enableColumnReorder
        enableFilterCustomization
        showPageSize
        pageSize={8}
        itemLabel="item"
        emptyMessage="No inventory items found."
        onRowClick={(row) => router.push(`/dashboard/asset-inventory/inventory/${row.id}`)}
        toolbarActions={
          canManage ? (
            <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
              <Plus className="size-3.5" />
              Add Item
            </Button>
          ) : undefined
        }
      />

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add item</DialogTitle>
            <DialogDescription>Add a new item to the inventory.</DialogDescription>
          </DialogHeader>
          <AddInventoryItemForm
            key={String(addOpen)}
            onSave={handleAddSave}
            onCancel={() => setAddOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

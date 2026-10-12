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
  ASSET_CATEGORIES,
  assets,
  type Asset,
  type AssetCategory,
  type AssetStatus,
  type EditAssetInput,
} from "@/lib/assetsMockData";
import { AddAssetForm } from "./assets/addAssetForm";
import { useAuth } from "@/hooks/useAuth";
import { recordAudit } from "@/lib/auditLog";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { StatusIcon } from "@/components/statusIcon";

const STATUS_LABEL: Record<AssetStatus, string> = {
  Active: "Active",
  "Under Repair": "Under Repair",
  Retired: "Retired",
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AssetsTable() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, has } = useAuth();
  const actor = user?.displayName ?? "Unknown";
  const canManage = has("AssetsManage");
  const [rows, setRows] = React.useState<Asset[]>(() => [...assets]);
  const [addOpen, setAddOpen] = React.useState(false);

  function handleAddSave(values: EditAssetInput) {
    const newAsset: Asset = {
      id: crypto.randomUUID(),
      name: values.name,
      assetTag: values.assetTag,
      category: values.category,
      location: values.location,
      purchaseDate: values.purchaseDate,
      purchaseCost: values.purchaseCost,
      vendor: values.vendor,
      warrantyExpiry: values.warrantyExpiry ?? null,
      amcExpiry: values.amcExpiry ?? null,
      status: values.status,
      lastUpdatedBy: actor,
      lastUpdatedAt: new Date().toISOString(),
    };
    assets.push(newAsset);
    setRows((prev) => [...prev, newAsset]);
    recordAudit({
      module: "Assets",
      entityType: "Asset",
      entityId: newAsset.id,
      entityLabel: newAsset.name,
      action: "Create",
      performedBy: actor,
    });
    setAddOpen(false);
    toast({ title: "Asset added" });
  }

  const columns = React.useMemo<ColumnDef<Asset>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Asset"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium text-foreground">
              {row.original.name}
            </span>
            <span className="truncate text-xs text-muted-foreground">{row.original.assetTag}</span>
          </div>
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
        id: "location",
        accessorKey: "location",
        meta: { label: "Location" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Location"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {row.original.location}
          </span>
        ),
      },
      {
        id: "purchaseDate",
        accessorKey: "purchaseDate",
        meta: { label: "Purchase Date" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Purchase Date"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {formatDate(row.original.purchaseDate)}
          </span>
        ),
      },
      {
        id: "purchaseCost",
        accessorKey: "purchaseCost",
        meta: { label: "Cost" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Cost"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm font-medium text-foreground">
            {formatCurrency(row.original.purchaseCost)}
          </span>
        ),
      },
      {
        id: "vendor",
        accessorKey: "vendor",
        meta: { label: "Vendor" },
        header: () => <DataTableColumnHeader label="Vendor" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {row.original.vendor}
          </span>
        ),
      },
      {
        id: "warrantyExpiry",
        accessorKey: "warrantyExpiry",
        meta: { label: "Warranty" },
        header: () => <DataTableColumnHeader label="Warranty" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {formatDate(row.original.warrantyExpiry)}
          </span>
        ),
      },
      {
        id: "status",
        accessorKey: "status",
        meta: { label: "Status" },
        header: () => <DataTableColumnHeader label="Status" />,
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <span className="inline-flex items-center gap-1.5">
              <StatusIcon status={status} />
              <Badge
                variant={
                  status === "Active"
                    ? "secondary"
                    : status === "Under Repair"
                      ? "outline"
                      : "destructive"
                }
              >
                {STATUS_LABEL[status]}
              </Badge>
            </span>
          );
        },
      },
    ],
    [],
  );

  const filters = React.useMemo<DataTableFilterConfig<Asset>[]>(
    () => [
      {
        id: "search",
        label: "Search",
        type: "search",
        placeholder: "Search name or asset tag",
        predicate: (row, query) => {
          const q = query.toLowerCase();
          return row.name.toLowerCase().includes(q) || row.assetTag.toLowerCase().includes(q);
        },
      },
      {
        id: "category",
        label: "Category",
        type: "select",
        options: ASSET_CATEGORIES.map((c) => ({ label: c, value: c })),
        predicate: (row, value) => row.category === value,
      },
      {
        id: "status",
        label: "Status",
        type: "select",
        options: (["Active", "Under Repair", "Retired"] as AssetStatus[]).map((s) => ({
          label: STATUS_LABEL[s],
          value: s,
        })),
        predicate: (row, value) => row.status === value,
      },
      {
        id: "groupBy",
        label: "Group by",
        type: "groupBy",
        options: [
          { label: "None", value: "none" },
          { label: "Category", value: "category" },
          { label: "Status", value: "status" },
          { label: "Location", value: "location" },
        ],
        groupBy: (row, value) => {
          if (value === "status") return STATUS_LABEL[row.status];
          if (value === "location") return row.location;
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
        title="Assets"
        filters={filters}
        enableColumnVisibility
        enableColumnReorder
        enableFilterCustomization
        showPageSize
        pageSize={8}
        itemLabel="asset"
        emptyMessage="No assets found."
        onRowClick={(row) => router.push(`/dashboard/asset-inventory/assets/${row.id}`)}
        toolbarActions={
          canManage ? (
            <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
              <Plus className="size-3.5" />
              Add Asset
            </Button>
          ) : undefined
        }
      />

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add asset</DialogTitle>
            <DialogDescription>Add a new asset to the registry.</DialogDescription>
          </DialogHeader>
          <AddAssetForm
            key={String(addOpen)}
            onSave={handleAddSave}
            onCancel={() => setAddOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

import { Plus } from "lucide-react";

import { cn, getInitials, gradientForName } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  PROVIDER_CATEGORIES,
  providerActivityLogs,
  providerEntryLogs,
  providerFlatLinks,
  serviceProviders,
  type EditProviderInput,
  type ServiceProvider,
  type ServiceProviderCategory,
  type ServiceProviderStatus,
} from "@/lib/providersMockData";
import { AddProviderForm } from "./providers/addProviderForm";
import { useAuth } from "@/hooks/useAuth";

const STATUS_DOT: Record<ServiceProviderStatus, string> = {
  active: "bg-emerald-500",
  blocked: "bg-red-500",
};

const STATUS_LABEL: Record<ServiceProviderStatus, string> = {
  active: "Active",
  blocked: "Blocked",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function flatsForProvider(providerId: string) {
  return providerFlatLinks
    .filter((l) => l.providerId === providerId && l.status === "active")
    .map((l) => l.flatNumber);
}

function lastVerifiedBy(providerId: string) {
  const logs = providerEntryLogs
    .filter((l) => l.providerId === providerId)
    .sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime());
  return logs[0]?.verifiedBy ?? "—";
}

export function ServiceProvidersTable() {
  const router = useRouter();
  const { user } = useAuth();
  const actorName = user?.displayName ?? user?.email ?? "Admin";
  const [providers, setProviders] = React.useState<ServiceProvider[]>(() => [...serviceProviders]);
  const [addOpen, setAddOpen] = React.useState(false);

  function handleAddSave(values: EditProviderInput, flats: string[] = []) {
    const newProvider: ServiceProvider = {
      id: crypto.randomUUID(),
      name: values.name,
      category: values.category,
      phone: values.phone,
      photoUrl: `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(values.name)}`,
      idProofType: values.idProofType,
      idProofNumber: values.idProofNumber,
      status: values.status,
      addedOn: new Date().toISOString(),
    };
    serviceProviders.push(newProvider);
    setProviders((prev) => [...prev, newProvider]);
    const now = new Date().toISOString();
    flats.forEach((flatNumber) => {
      providerFlatLinks.push({
        id: crypto.randomUUID(),
        providerId: newProvider.id,
        flatNumber,
        approvedBy: actorName,
        linkedOn: now,
        status: "active",
      });
      providerActivityLogs.push({
        id: crypto.randomUUID(),
        providerId: newProvider.id,
        action: "flat_assigned",
        flatNumber,
        actor: actorName,
        timestamp: now,
      });
    });
    setAddOpen(false);
  }

  const columns = React.useMemo<ColumnDef<ServiceProvider>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Provider"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => {
          const [from, to] = gradientForName(row.original.name);
          return (
            <div className="flex items-center gap-2.5">
              <Avatar size="sm">
                <AvatarImage
                  src={
                    row.original.photoUrl ||
                    `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(row.original.id)}`
                  }
                  alt={row.original.name}
                />
                <AvatarFallback
                  className="text-[10px] font-semibold text-white"
                  style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
                >
                  {getInitials(row.original.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium text-foreground">
                  {row.original.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {row.original.category}
                </span>
              </div>
            </div>
          );
        },
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
        id: "phone",
        accessorKey: "phone",
        meta: { label: "Phone" },
        header: () => <DataTableColumnHeader label="Phone" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {row.original.phone}
          </span>
        ),
      },
      {
        id: "verifiedBy",
        accessorFn: (row) => lastVerifiedBy(row.id),
        meta: { label: "Contact" },
        header: () => <DataTableColumnHeader label="Contact" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {lastVerifiedBy(row.original.id)}
          </span>
        ),
      },
      {
        id: "flatsServed",
        accessorFn: (row) => flatsForProvider(row.id).join(", "),
        meta: { label: "Flats Served" },
        header: () => <DataTableColumnHeader label="Flats Served" />,
        cell: ({ row }) => {
          const flats = flatsForProvider(row.original.id);
          if (flats.length === 0) return <span className="text-sm text-muted-foreground">—</span>;
          const visible = flats.slice(0, 2).join(", ");
          const remaining = flats.length - 2;
          return (
            <span
              title={flats.join(", ")}
              className="inline-flex max-w-[180px] items-center gap-1 truncate text-sm text-muted-foreground"
            >
              <span className="truncate">{visible}</span>
              {remaining > 0 && (
                <span className="shrink-0 text-muted-foreground">+{remaining} more</span>
              )}
            </span>
          );
        },
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
              <span className={cn("size-1.5 shrink-0 rounded-full", STATUS_DOT[status])} />
              <Badge variant={status === "active" ? "secondary" : "destructive"}>
                {STATUS_LABEL[status]}
              </Badge>
            </span>
          );
        },
      },
      {
        id: "addedOn",
        accessorKey: "addedOn",
        meta: { label: "Added On" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Added On"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {formatDate(row.original.addedOn)}
          </span>
        ),
      },
    ],
    [],
  );

  const filters = React.useMemo<DataTableFilterConfig<ServiceProvider>[]>(
    () => [
      {
        id: "search",
        label: "Search",
        type: "search",
        placeholder: "Search name, phone or contact",
        predicate: (row, query) => {
          const q = query.toLowerCase();
          return (
            row.name.toLowerCase().includes(q) ||
            row.phone.toLowerCase().includes(q) ||
            lastVerifiedBy(row.id).toLowerCase().includes(q) ||
            flatsForProvider(row.id).join(", ").toLowerCase().includes(q)
          );
        },
      },
      {
        id: "category",
        label: "Category",
        type: "select",
        options: PROVIDER_CATEGORIES.map((c) => ({ label: c, value: c })),
        predicate: (row, value) => row.category === value,
      },
      {
        id: "status",
        label: "Status",
        type: "select",
        options: (["active", "blocked"] as ServiceProviderStatus[]).map((s) => ({
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
        ],
        groupBy: (row, value) => (value === "status" ? STATUS_LABEL[row.status] : row.category),
      },
    ],
    [],
  );

  return (
    <>
      <DataTable
        data={providers}
        columns={columns}
        getRowId={(p) => p.id}
        title="All providers"
        filters={filters}
        enableColumnVisibility
        enableColumnReorder
        enableFilterCustomization
        showPageSize
        pageSize={8}
        itemLabel="provider"
        emptyMessage="No service providers found."
        onRowClick={(provider) =>
          router.push(`/dashboard/people-hub/service-providers/${provider.id}`)
        }
        toolbarActions={
          <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
            <Plus className="size-3.5" />
            Add Service Provider
          </Button>
        }
      />

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add service provider</DialogTitle>
            <DialogDescription>Add a new provider to the roster.</DialogDescription>
          </DialogHeader>
          <AddProviderForm
            key={String(addOpen)}
            onSave={handleAddSave}
            onCancel={() => setAddOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

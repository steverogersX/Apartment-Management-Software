"use client";

import * as React from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable, type DataTableFilterConfig } from "@/components/dataTable";
import { DataTableColumnHeader } from "@/components/dataTableColumnHeader";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/hooks/useAuth";
import { roles, type RoleRecord } from "@/lib/rolesMockData";
import { formatDate } from "@/lib/utils";
import { recordAudit } from "@/lib/auditLog";

export function RolesTable() {
  const { user: auditUser } = useAuth();
  const { has } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [version, setVersion] = React.useState(0);
  const [deleteTarget, setDeleteTarget] = React.useState<RoleRecord | null>(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- `version` forces a re-read after roles is mutated in place
  const data = React.useMemo(() => [...roles], [version]);

  function handleDelete() {
    if (!deleteTarget) return;
    const idx = roles.findIndex((r) => r.id === deleteTarget.id);
    if (idx !== -1) roles.splice(idx, 1);
    setVersion((v) => v + 1);
    recordAudit({
      module: "Roles",
      entityType: "Role",
      entityId: deleteTarget.id,
      entityLabel: deleteTarget.name,
      action: "Delete",
      performedBy: auditUser?.displayName ?? "Unknown",
    });
    toast({ title: `"${deleteTarget.name}" deleted`, variant: "success" });
    setDeleteTarget(null);
  }

  const columns = React.useMemo<ColumnDef<RoleRecord>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Role"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <ShieldCheck className="size-4" />
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-medium text-foreground">{row.original.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {row.original.description}
              </span>
            </div>
          </div>
        ),
      },
      {
        id: "type",
        accessorKey: "isSystem",
        meta: { label: "Type" },
        header: () => <DataTableColumnHeader label="Type" />,
        cell: ({ row }) => (
          <Badge variant={row.original.isSystem ? "secondary" : "outline"}>
            {row.original.isSystem ? "System" : "Custom"}
          </Badge>
        ),
      },
      {
        id: "permissions",
        accessorFn: (row) => row.permissions.length,
        meta: { label: "Permissions" },
        header: () => <DataTableColumnHeader label="Permissions" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-foreground">
            {row.original.permissions.length} permission
            {row.original.permissions.length === 1 ? "" : "s"}
          </span>
        ),
      },
      {
        id: "memberCount",
        accessorKey: "memberCount",
        meta: { label: "Members" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Members"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-muted-foreground">
            {row.original.memberCount}
          </span>
        ),
      },
      {
        id: "updatedAt",
        accessorKey: "updatedAt",
        meta: { label: "Last updated" },
        header: () => <DataTableColumnHeader label="Last updated" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-muted-foreground">
            {formatDate(row.original.updatedAt)}
          </span>
        ),
      },
      {
        id: "actions",
        enableHiding: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const role = row.original;
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                  <MoreHorizontal className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  {has("RolesDelete") && !role.isSystem && (
                    <DropdownMenuItem
                      variant="destructive"
                      className="gap-2"
                      onClick={() => setDeleteTarget(role)}
                    >
                      <Trash2 className="size-4" />
                      Delete role
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [has],
  );

  const filters = React.useMemo<DataTableFilterConfig<RoleRecord>[]>(
    () => [
      {
        id: "search",
        label: "Search",
        type: "search",
        placeholder: "Search by role name",
        predicate: (row, query) => row.name.toLowerCase().includes(query.toLowerCase()),
      },
      {
        id: "type",
        label: "Type",
        type: "select",
        options: [
          { label: "System", value: "system" },
          { label: "Custom", value: "custom" },
        ],
        predicate: (row, value) => (value === "system" ? row.isSystem : !row.isSystem),
      },
      {
        id: "groupBy",
        label: "Group by",
        type: "groupBy",
        options: [
          { label: "None", value: "none" },
          { label: "Type", value: "type" },
        ],
        groupBy: (row) => (row.isSystem ? "System" : "Custom"),
      },
    ],
    [],
  );

  return (
    <>
      <DataTable
        data={data}
        columns={columns}
        title="All roles"
        filters={filters}
        enableColumnReorder
        enableColumnVisibility
        enableFilterCustomization
        showPageSize
        pageSize={8}
        itemLabel="role"
        emptyMessage="No roles match these filters."
        onRowClick={(role) => router.push(`/dashboard/roles/${role.id}`)}
        toolbarActions={
          <Button size="sm" className="gap-1.5" render={<Link href="/dashboard/roles/new" />}>
            <Plus className="size-3.5" />
            Create role
          </Button>
        }
      />

      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">{deleteTarget?.name}</span>?{" "}
              {deleteTarget && deleteTarget.memberCount > 0
                ? `${deleteTarget.memberCount} member${deleteTarget.memberCount === 1 ? "" : "s"} will lose this role immediately. `
                : ""}
              This action cannot be undone.
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

"use client";

import * as React from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Plus, ShieldOff, UserCog, UserPlus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable, type DataTableFilterConfig } from "@/components/dataTable";
import { DataTableColumnHeader } from "@/components/dataTableColumnHeader";
import { getInitials, gradientForName } from "@/lib/utils";
import {
  roleOptions,
  users as initialUsers,
  type UserAccountStatus,
  type UserRecord,
} from "@/lib/usersMockData";

const STATUS_DOT: Record<UserAccountStatus, string> = {
  active: "bg-emerald-500",
  invited: "bg-amber-500",
  suspended: "bg-red-500",
};

const STATUS_LABEL: Record<UserAccountStatus, string> = {
  active: "Active",
  invited: "Invited",
  suspended: "Suspended",
};

function formatRelative(iso: string | null) {
  if (!iso) return "Never";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function UsersTable() {
  const [data, setData] = React.useState<UserRecord[]>(initialUsers);

  function updateStatus(id: string, status: UserAccountStatus) {
    setData((rows) => rows.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  function updateRole(id: string, role: string) {
    setData((rows) => rows.map((r) => (r.id === id ? { ...r, role } : r)));
  }

  const columns = React.useMemo<ColumnDef<UserRecord>[]>(
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
        cell: ({ row }) => {
          const [from, to] = gradientForName(row.original.name);
          return (
            <div className="flex items-center gap-2.5">
              <Avatar size="sm">
                <AvatarImage
                  src={`https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(row.original.id)}`}
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
                <span className="truncate font-medium text-foreground">{row.original.name}</span>
                <span className="truncate text-xs text-muted-foreground">{row.original.email}</span>
              </div>
            </div>
          );
        },
      },
      {
        id: "role",
        accessorKey: "role",
        meta: { label: "Role" },
        header: () => <DataTableColumnHeader label="Role" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-foreground">{row.original.role}</span>
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
            <div className="flex items-center gap-2">
              <span className={cn("size-1.5 shrink-0 rounded-full", STATUS_DOT[status])} />
              <span className="whitespace-nowrap text-foreground">{STATUS_LABEL[status]}</span>
            </div>
          );
        },
      },
      {
        id: "flatNumber",
        accessorKey: "flatNumber",
        meta: { label: "Flat" },
        header: () => <DataTableColumnHeader label="Flat" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-muted-foreground">
            {row.original.flatNumber ?? "—"}
          </span>
        ),
      },
      {
        id: "lastActiveAt",
        accessorKey: "lastActiveAt",
        meta: { label: "Last active" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Last active"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-muted-foreground">
            {formatRelative(row.original.lastActiveAt)}
          </span>
        ),
      },
      {
        id: "actions",
        enableHiding: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const user = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                <MoreHorizontal className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="gap-2">
                  <UserCog className="size-4 text-muted-foreground" />
                  Edit details
                </DropdownMenuItem>
                {roleOptions
                  .filter((r) => r !== user.role)
                  .slice(0, 1)
                  .map((r) => (
                    <DropdownMenuItem
                      key={r}
                      className="gap-2"
                      onClick={() => updateRole(user.id, r)}
                    >
                      <UserCog className="size-4 text-muted-foreground" />
                      Change role to {r}
                    </DropdownMenuItem>
                  ))}
                {user.status === "suspended" ? (
                  <DropdownMenuItem
                    className="gap-2"
                    onClick={() => updateStatus(user.id, "active")}
                  >
                    <UserPlus className="size-4 text-muted-foreground" />
                    Reinstate access
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    variant="destructive"
                    className="gap-2"
                    onClick={() => updateStatus(user.id, "suspended")}
                  >
                    <ShieldOff className="size-4" />
                    Revoke access
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [],
  );

  const filters = React.useMemo<DataTableFilterConfig<UserRecord>[]>(
    () => [
      {
        id: "search",
        label: "Search",
        type: "search",
        placeholder: "Search by name or email",
        predicate: (row, query) =>
          row.name.toLowerCase().includes(query.toLowerCase()) ||
          row.email.toLowerCase().includes(query.toLowerCase()),
      },
      {
        id: "role",
        label: "Role",
        type: "select",
        options: roleOptions.map((r) => ({ label: r, value: r })),
        predicate: (row, value) => row.role === value,
      },
      {
        id: "statusFilter",
        label: "Status",
        type: "select",
        options: (["active", "invited", "suspended"] as UserAccountStatus[]).map((s) => ({
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
          { label: "Role", value: "role" },
          { label: "Status", value: "status" },
        ],
        groupBy: (row, value) => (value === "status" ? STATUS_LABEL[row.status] : row.role),
      },
    ],
    [],
  );

  return (
    <DataTable
      data={data}
      columns={columns}
      title="All users"
      filters={filters}
      enableColumnReorder
      enableColumnVisibility
      enableFilterCustomization
      showPageSize
      pageSize={8}
      itemLabel="user"
      emptyMessage="No users match these filters."
      toolbarActions={
        <Button size="sm" className="gap-1.5" render={<Link href="/dashboard/users/new" />}>
          <Plus className="size-3.5" />
          Add user
        </Button>
      }
    />
  );
}

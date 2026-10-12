"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { BadgeCheck, BadgeX } from "lucide-react";

import { avatarUrlForName, formatCurrency, getInitials, gradientForName } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableFilterConfig } from "@/components/dataTable";
import { DataTableColumnHeader } from "@/components/dataTableColumnHeader";
import {
  STAFF_ROLES,
  type StaffMember,
  type StaffRole,
  type StaffStatus,
} from "@/lib/staffMockData";
import { StatusIcon } from "@/components/statusIcon";

const STATUS_LABEL: Record<StaffStatus, string> = {
  active: "Active",
  on_leave: "On leave",
  inactive: "Inactive",
};

export function StaffTable({
  data,
  toolbarActions,
  onRowClick,
}: {
  data: StaffMember[];
  toolbarActions?: React.ReactNode;
  onRowClick?: (row: StaffMember) => void;
}) {
  const columns = React.useMemo<ColumnDef<StaffMember>[]>(
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
                <AvatarImage src={avatarUrlForName(row.original.name)} alt={row.original.name} />
                <AvatarFallback
                  className="text-[11px] font-medium text-white"
                  style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
                >
                  {getInitials(row.original.name)}
                </AvatarFallback>
              </Avatar>
              <span className="whitespace-nowrap font-medium text-foreground">
                {row.original.name}
              </span>
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
        id: "shift",
        accessorKey: "shift",
        meta: { label: "Shift" },
        header: () => <DataTableColumnHeader label="Shift" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-muted-foreground">{row.original.shift}</span>
        ),
      },
      {
        id: "phone",
        accessorKey: "phone",
        header: () => <DataTableColumnHeader label="Phone" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-muted-foreground">{row.original.phone}</span>
        ),
      },
      {
        id: "monthlyWage",
        accessorKey: "monthlyWage",
        meta: { label: "Monthly wage" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Monthly wage"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap tabular-nums text-foreground">
            {formatCurrency(row.original.monthlyWage)}
          </span>
        ),
      },
      {
        id: "idProofVerified",
        accessorKey: "idProofVerified",
        meta: { label: "ID proof" },
        header: () => <DataTableColumnHeader label="ID proof" />,
        cell: ({ row }) =>
          row.original.idProofVerified ? (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <BadgeCheck className="size-3.5" />
              Verified
            </span>
          ) : (
            <span className="flex items-center gap-1 text-muted-foreground">
              <BadgeX className="size-3.5" />
              Pending
            </span>
          ),
      },
      {
        id: "status",
        accessorKey: "status",
        meta: { label: "Status" },
        header: () => <DataTableColumnHeader label="Status" />,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <StatusIcon status={row.original.status} />
            <span className="whitespace-nowrap text-foreground">
              {STATUS_LABEL[row.original.status]}
            </span>
          </div>
        ),
      },
    ],
    [],
  );

  const filters = React.useMemo<DataTableFilterConfig<StaffMember>[]>(
    () => [
      {
        id: "search",
        label: "Search",
        type: "search",
        placeholder: "Search name or phone",
        predicate: (row, query) => {
          const q = query.toLowerCase();
          return row.name.toLowerCase().includes(q) || row.phone.toLowerCase().includes(q);
        },
      },
      {
        id: "role",
        label: "Role",
        type: "select",
        options: STAFF_ROLES.map((r: StaffRole) => ({ label: r, value: r })),
        predicate: (row, value) => row.role === value,
      },
      {
        id: "status",
        label: "Status",
        type: "select",
        options: (["active", "on_leave", "inactive"] as StaffStatus[]).map((s) => ({
          label: STATUS_LABEL[s],
          value: s,
        })),
        predicate: (row, value) => row.status === value,
      },
    ],
    [],
  );

  return (
    <DataTable
      data={data}
      columns={columns}
      getRowId={(row) => row.id}
      title="Staff"
      filters={filters}
      toolbarActions={toolbarActions}
      showPageSize
      pageSize={10}
      itemLabel="staff member"
      emptyMessage="No staff members found."
      initialSorting={[{ id: "name", desc: false }]}
      onRowClick={onRowClick}
    />
  );
}

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableFilterConfig } from "@/components/dataTable";
import { DataTableColumnHeader } from "@/components/dataTableColumnHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { residents, type ResidentRecord } from "@/lib/residentsMockData";
import { committeeMembers, type CommitteeMember } from "@/lib/committeeMockData";
import { getMeetingStatus, meetings, type Meeting } from "@/lib/meetingsMockData";
import { ShareCertificatesTable } from "@/components/statutory/shareCertificatesTable";
import { NominationsTable } from "@/components/statutory/nominationsTable";
import { InvestmentsTable } from "@/components/statutory/investmentsTable";
import { formatDate } from "@/lib/utils";
import { PermissionDenied } from "@/components/permissionDenied";
import { PageIcon } from "@/components/pageIcon";

function meetingTypeLabel(meeting: Meeting) {
  if (meeting.audience.scope === "All") return "General Body";
  if (meeting.audience.scope === "Blocks") return "Block";
  return "Special";
}

const memberColumns: ColumnDef<ResidentRecord>[] = [
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
      <span className="whitespace-nowrap text-sm font-medium text-foreground">
        {row.original.name}
      </span>
    ),
  },
  {
    id: "flat",
    accessorFn: (row) => `${row.tower}-${row.flatNumber}`,
    header: ({ column }) => (
      <DataTableColumnHeader
        label="Flat"
        sorted={column.getIsSorted()}
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-muted-foreground">
        {row.original.tower}-{row.original.flatNumber}
      </span>
    ),
  },
  {
    id: "occupancyType",
    accessorKey: "occupancyType",
    meta: { label: "Owner/Tenant" },
    header: () => <DataTableColumnHeader label="Owner/Tenant" />,
    cell: ({ row }) => (
      <Badge
        variant={row.original.occupancyType === "owner" ? "secondary" : "outline"}
        className="capitalize"
      >
        {row.original.occupancyType}
      </Badge>
    ),
  },
  {
    id: "moveInDate",
    accessorKey: "moveInDate",
    meta: { label: "Admitted" },
    header: ({ column }) => (
      <DataTableColumnHeader
        label="Date of Admission"
        sorted={column.getIsSorted()}
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-muted-foreground">
        {formatDate(row.original.moveInDate)}
      </span>
    ),
  },
];

const memberFilters: DataTableFilterConfig<ResidentRecord>[] = [
  {
    id: "search",
    label: "Search",
    type: "search",
    placeholder: "Search name or flat",
    predicate: (row, query) => {
      const q = query.toLowerCase();
      return (
        row.name.toLowerCase().includes(q) ||
        `${row.tower}-${row.flatNumber}`.toLowerCase().includes(q)
      );
    },
  },
  {
    id: "occupancyType",
    label: "Owner/Tenant",
    type: "select",
    options: [
      { label: "Owner", value: "owner" },
      { label: "Tenant", value: "tenant" },
    ],
    predicate: (row, value) => row.occupancyType === value,
  },
];

const committeeColumns: ColumnDef<CommitteeMember>[] = [
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
      <span className="whitespace-nowrap text-sm font-medium text-foreground">
        {row.original.name}
      </span>
    ),
  },
  {
    id: "position",
    accessorKey: "position",
    meta: { label: "Designation" },
    header: () => <DataTableColumnHeader label="Designation" />,
    cell: ({ row }) => <Badge variant="secondary">{row.original.position}</Badge>,
  },
  {
    id: "termStart",
    accessorKey: "termStart",
    meta: { label: "Term Start" },
    header: ({ column }) => (
      <DataTableColumnHeader
        label="Term Start"
        sorted={column.getIsSorted()}
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-muted-foreground">
        {formatDate(row.original.termStart)}
      </span>
    ),
  },
  {
    id: "termEnd",
    accessorKey: "termEnd",
    meta: { label: "Term End" },
    header: ({ column }) => (
      <DataTableColumnHeader
        label="Term End"
        sorted={column.getIsSorted()}
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-muted-foreground">
        {formatDate(row.original.termEnd)}
      </span>
    ),
  },
];

export default function StatutoryRegistersPage() {
  const { has } = useAuth();
  const router = useRouter();

  if (!has("StatutoryRegistersView")) {
    return <PermissionDenied message="You do not have permission to view statutory registers." />;
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <h1 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
          <PageIcon />
          Statutory Registers
        </h1>
        <p className="text-sm text-muted-foreground">
          Compliance registers maintained under Bye-law 142.
        </p>
      </div>

      <Tabs defaultValue="members">
        <TabsList className="flex-wrap">
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="committee">Committee</TabsTrigger>
          <TabsTrigger value="minutes">Minutes</TabsTrigger>
          <TabsTrigger value="shares">Shares</TabsTrigger>
          <TabsTrigger value="nominations">Nominations</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-4">
          <DataTable
            data={residents}
            columns={memberColumns}
            getRowId={(r) => r.id}
            title="Members Register"
            filters={memberFilters}
            enableColumnVisibility
            enableFilterCustomization
            showPageSize
            pageSize={8}
            itemLabel="member"
            emptyMessage="No members found."
          />
        </TabsContent>

        <TabsContent value="committee" className="mt-4">
          <DataTable
            data={committeeMembers}
            columns={committeeColumns}
            getRowId={(r) => r.id}
            title="Committee Member Register"
            enableColumnVisibility
            showPageSize
            pageSize={8}
            itemLabel="member"
            emptyMessage="No committee members found."
          />
        </TabsContent>

        <TabsContent value="minutes" className="mt-4">
          <DataTable
            data={meetings}
            columns={minutesColumns}
            getRowId={(r) => r.id}
            title="Minutes Register"
            filters={minutesFilters}
            enableColumnVisibility
            showPageSize
            pageSize={8}
            itemLabel="meeting"
            emptyMessage="No meetings found."
            onRowClick={(row) => router.push(`/dashboard/meetings/${row.id}`)}
          />
        </TabsContent>

        <TabsContent value="shares" className="mt-4">
          <ShareCertificatesTable />
        </TabsContent>

        <TabsContent value="nominations" className="mt-4">
          <NominationsTable />
        </TabsContent>

        <TabsContent value="investments" className="mt-4">
          <InvestmentsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}

const minutesColumns: ColumnDef<Meeting>[] = [
  {
    id: "scheduledAt",
    accessorKey: "scheduledAt",
    header: ({ column }) => (
      <DataTableColumnHeader
        label="Date"
        sorted={column.getIsSorted()}
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-muted-foreground">
        {formatDate(row.original.scheduledAt)}
      </span>
    ),
  },
  {
    id: "title",
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader
        label="Meeting"
        sorted={column.getIsSorted()}
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      />
    ),
    cell: ({ row }) => (
      <span
        className="block max-w-[320px] truncate text-sm font-medium text-foreground"
        title={row.original.title}
      >
        {row.original.title}
      </span>
    ),
  },
  {
    id: "type",
    accessorFn: (row) => meetingTypeLabel(row),
    meta: { label: "Type" },
    header: () => <DataTableColumnHeader label="Type" />,
    cell: ({ row }) => <Badge variant="outline">{meetingTypeLabel(row.original)}</Badge>,
  },
  {
    id: "minutes",
    accessorFn: (row) => (row.minutes?.length ? "Filed" : "Pending"),
    meta: { label: "Minutes" },
    header: () => <DataTableColumnHeader label="Minutes" />,
    cell: ({ row }) => {
      const status = getMeetingStatus(row.original);
      const filed = (row.original.minutes?.length ?? 0) > 0;
      return (
        <span className="inline-flex items-center gap-1.5">
          <FileText className="size-3.5 text-muted-foreground" />
          <Badge variant={status === "cancelled" ? "destructive" : filed ? "secondary" : "outline"}>
            {status === "cancelled" ? "Cancelled" : filed ? "Filed" : "Pending"}
          </Badge>
        </span>
      );
    },
  },
];

function minutesState(meeting: Meeting) {
  if (getMeetingStatus(meeting) === "cancelled") return "cancelled";
  return (meeting.minutes?.length ?? 0) > 0 ? "filed" : "pending";
}

const minutesFilters: DataTableFilterConfig<Meeting>[] = [
  {
    id: "search",
    label: "Search",
    type: "search",
    placeholder: "Search meeting",
    predicate: (row, query) => row.title.toLowerCase().includes(query.toLowerCase()),
  },
  {
    id: "type",
    label: "Type",
    type: "select",
    options: [...new Set(meetings.map(meetingTypeLabel))]
      .sort()
      .map((t) => ({ label: t, value: t })),
    predicate: (row, value) => meetingTypeLabel(row) === value,
  },
  {
    id: "minutes",
    label: "Minutes",
    type: "select",
    options: [
      { label: "Filed", value: "filed" },
      { label: "Pending", value: "pending" },
      { label: "Cancelled", value: "cancelled" },
    ],
    predicate: (row, value) => minutesState(row) === value,
  },
];

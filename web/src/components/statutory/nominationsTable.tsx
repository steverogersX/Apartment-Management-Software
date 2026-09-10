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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { flats } from "@/lib/flatsMockData";
import {
  nominations,
  type AddNominationInput,
  type Nomination,
} from "@/lib/nominationRegisterMockData";
import { NominationForm } from "./nominationForm";
import { useAuth } from "@/hooks/useAuth";
import { recordAudit } from "@/lib/auditLog";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function flatLabel(flatId: string) {
  const f = flats.find((x) => x.id === flatId);
  return f ? `${f.tower}-${f.flatNumber}` : flatId;
}

export function NominationsTable() {
  const { user, has } = useAuth();
  const canManage = has("StatutoryRegistersManage");
  const actor = user?.displayName ?? "Unknown";
  const [rows, setRows] = React.useState<Nomination[]>(() => [...nominations]);
  const [addOpen, setAddOpen] = React.useState(false);

  const missingFlats = React.useMemo(
    () => flats.filter((f) => !rows.some((n) => n.flatId === f.id)),
    [rows],
  );

  function handleAddSave(values: AddNominationInput) {
    const nomination: Nomination = {
      id: crypto.randomUUID(),
      flatId: values.flatId,
      memberName: values.memberName,
      nomineeName: values.nomineeName,
      nomineeRelation: values.nomineeRelation,
      nomineeAddress: values.nomineeAddress,
      dateOfNomination: values.dateOfNomination,
      witnessName: values.witnessName || null,
    };
    nominations.push(nomination);
    setRows((prev) => [...prev, nomination]);
    recordAudit({
      module: "Accounts",
      entityType: "Nomination",
      entityId: nomination.id,
      entityLabel: `${nomination.memberName} → ${nomination.nomineeName} · ${flatLabel(nomination.flatId)}`,
      action: "Create",
      performedBy: actor,
    });
    setAddOpen(false);
  }

  const columns = React.useMemo<ColumnDef<Nomination>[]>(
    () => [
      {
        id: "flat",
        accessorFn: (row) => flatLabel(row.flatId),
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Flat"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm font-medium text-foreground">
            {flatLabel(row.original.flatId)}
          </span>
        ),
      },
      {
        id: "memberName",
        accessorKey: "memberName",
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Member"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-foreground">
            {row.original.memberName}
          </span>
        ),
      },
      {
        id: "nomineeName",
        accessorKey: "nomineeName",
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Nominee"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm text-foreground">{row.original.nomineeName}</span>
            <span className="truncate text-xs text-muted-foreground">
              {row.original.nomineeRelation}
            </span>
          </div>
        ),
      },
      {
        id: "dateOfNomination",
        accessorKey: "dateOfNomination",
        meta: { label: "Nominated" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Date of Nomination"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {formatDate(row.original.dateOfNomination)}
          </span>
        ),
      },
      {
        id: "witnessName",
        accessorKey: "witnessName",
        meta: { label: "Witness" },
        header: () => <DataTableColumnHeader label="Witness" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {row.original.witnessName ?? "—"}
          </span>
        ),
      },
    ],
    [],
  );

  const filters = React.useMemo<DataTableFilterConfig<Nomination>[]>(
    () => [
      {
        id: "search",
        label: "Search",
        type: "search",
        placeholder: "Search member or nominee",
        predicate: (row, query) => {
          const q = query.toLowerCase();
          return (
            row.memberName.toLowerCase().includes(q) || row.nomineeName.toLowerCase().includes(q)
          );
        },
      },
    ],
    [],
  );

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-3 text-sm">
        <span className="text-muted-foreground">
          {rows.length} of {flats.length} flats have a nomination on file.
        </span>
        {missingFlats.map((f) => (
          <Badge key={f.id} variant="outline" className="gap-1">
            {f.tower}-{f.flatNumber}: no nomination
          </Badge>
        ))}
      </div>

      <DataTable
        data={rows}
        columns={columns}
        getRowId={(r) => r.id}
        title="Nominations"
        filters={filters}
        enableColumnVisibility
        enableColumnReorder
        enableFilterCustomization
        showPageSize
        pageSize={8}
        itemLabel="nomination"
        emptyMessage="No nominations found."
        toolbarActions={
          canManage ? (
            <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
              <Plus className="size-3.5" />
              Add Nomination
            </Button>
          ) : undefined
        }
      />

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add nomination</DialogTitle>
            <DialogDescription>Record a member&apos;s nominee for their flat.</DialogDescription>
          </DialogHeader>
          <NominationForm
            key={String(addOpen)}
            onSave={handleAddSave}
            onCancel={() => setAddOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

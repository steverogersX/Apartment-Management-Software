"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";

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
  shareCertificates,
  type AddShareCertificateInput,
  type ShareCertificate,
} from "@/lib/shareRegisterMockData";
import { ShareCertificateForm } from "./shareCertificateForm";
import { useAuth } from "@/hooks/useAuth";
import { recordAudit } from "@/lib/auditLog";
import { formatDate } from "@/lib/utils";

function flatLabel(flatId: string) {
  const f = flats.find((x) => x.id === flatId);
  return f ? `${f.tower}-${f.flatNumber}` : flatId;
}

export function ShareCertificatesTable() {
  const { user, has } = useAuth();
  const canManage = has("StatutoryRegistersManage");
  const actor = user?.displayName ?? "Unknown";
  const [rows, setRows] = React.useState<ShareCertificate[]>(() => [...shareCertificates]);
  const [addOpen, setAddOpen] = React.useState(false);

  function handleAddSave(values: AddShareCertificateInput) {
    const cert: ShareCertificate = {
      id: crypto.randomUUID(),
      flatId: values.flatId,
      certificateNumber: values.certificateNumber,
      shareNumbers: values.shareNumbers,
      numberOfShares: values.numberOfShares,
      faceValue: values.faceValue,
      issueDate: values.issueDate,
      holderName: values.holderName,
    };
    shareCertificates.push(cert);
    setRows((prev) => [...prev, cert]);
    recordAudit({
      module: "Accounts",
      entityType: "Share Certificate",
      entityId: cert.id,
      entityLabel: `${cert.certificateNumber} · ${flatLabel(cert.flatId)}`,
      action: "Create",
      performedBy: actor,
    });
    setAddOpen(false);
  }

  const columns = React.useMemo<ColumnDef<ShareCertificate>[]>(
    () => [
      {
        id: "certificateNumber",
        accessorKey: "certificateNumber",
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Certificate"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm font-medium text-foreground">
            {row.original.certificateNumber}
          </span>
        ),
      },
      {
        id: "flat",
        accessorFn: (row) => flatLabel(row.flatId),
        meta: { label: "Flat" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Flat"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {flatLabel(row.original.flatId)}
          </span>
        ),
      },
      {
        id: "holderName",
        accessorKey: "holderName",
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Holder"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-foreground">
            {row.original.holderName}
          </span>
        ),
      },
      {
        id: "shareNumbers",
        accessorKey: "shareNumbers",
        meta: { label: "Shares" },
        header: () => <DataTableColumnHeader label="Share Nos." />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {row.original.shareNumbers} ({row.original.numberOfShares} × ₹{row.original.faceValue})
          </span>
        ),
      },
      {
        id: "issueDate",
        accessorKey: "issueDate",
        meta: { label: "Issued" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Issue Date"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {formatDate(row.original.issueDate)}
          </span>
        ),
      },
    ],
    [],
  );

  const filters = React.useMemo<DataTableFilterConfig<ShareCertificate>[]>(
    () => [
      {
        id: "search",
        label: "Search",
        type: "search",
        placeholder: "Search certificate or holder",
        predicate: (row, query) => {
          const q = query.toLowerCase();
          return (
            row.certificateNumber.toLowerCase().includes(q) ||
            row.holderName.toLowerCase().includes(q)
          );
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
        title="Share Certificates"
        filters={filters}
        enableColumnVisibility
        enableColumnReorder
        enableFilterCustomization
        showPageSize
        pageSize={8}
        itemLabel="certificate"
        emptyMessage="No share certificates found."
        toolbarActions={
          canManage ? (
            <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
              <Plus className="size-3.5" />
              Issue Certificate
            </Button>
          ) : undefined
        }
      />

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Issue share certificate</DialogTitle>
            <DialogDescription>Record a new share certificate for a flat.</DialogDescription>
          </DialogHeader>
          <ShareCertificateForm
            key={String(addOpen)}
            onSave={handleAddSave}
            onCancel={() => setAddOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

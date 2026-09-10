"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Ban, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DataTable, type DataTableFilterConfig } from "@/components/dataTable";
import { DataTableColumnHeader } from "@/components/dataTableColumnHeader";
import {
  blockedVisitors as initialBlockedVisitors,
  type BlockedVisitor,
} from "@/lib/visitorsMockData";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function BlocklistTable() {
  const [data, setData] = React.useState<BlockedVisitor[]>(initialBlockedVisitors);
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [reason, setReason] = React.useState("");

  function handleBlock(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !reason.trim()) return;
    const entry: BlockedVisitor = {
      id: crypto.randomUUID(),
      name: name.trim(),
      phone: phone.trim(),
      reason: reason.trim(),
      blockedBy: "Admin",
      blockedOn: new Date().toISOString().slice(0, 10),
    };
    setData((prev) => [entry, ...prev]);
    setName("");
    setPhone("");
    setReason("");
    setOpen(false);
  }

  function handleUnblock(id: string) {
    setData((prev) => prev.filter((r) => r.id !== id));
  }

  const columns = React.useMemo<ColumnDef<BlockedVisitor>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Visitor"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="text-sm font-medium text-foreground">{row.original.name}</span>
        ),
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
        id: "reason",
        accessorKey: "reason",
        meta: { label: "Reason" },
        header: () => <DataTableColumnHeader label="Reason" />,
        cell: ({ row }) => (
          <span className="max-w-[260px] truncate text-sm text-muted-foreground">
            {row.original.reason}
          </span>
        ),
      },
      {
        id: "blockedBy",
        accessorKey: "blockedBy",
        meta: { label: "Blocked By" },
        header: () => <DataTableColumnHeader label="Blocked By" />,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{row.original.blockedBy}</span>
        ),
      },
      {
        id: "blockedOn",
        accessorKey: "blockedOn",
        meta: { label: "Blocked On" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Blocked On"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {formatDate(row.original.blockedOn)}
          </span>
        ),
      },
      {
        id: "actions",
        enableHiding: false,
        header: () => null,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-destructive hover:text-destructive"
            onClick={() => handleUnblock(row.original.id)}
          >
            <Trash2 className="size-3.5" />
            Unblock
          </Button>
        ),
      },
    ],
    [],
  );

  const filters = React.useMemo<DataTableFilterConfig<BlockedVisitor>[]>(
    () => [
      {
        id: "search",
        label: "Search",
        type: "search",
        placeholder: "Search name or phone…",
        predicate: (row, q) =>
          row.name.toLowerCase().includes(q.toLowerCase()) ||
          row.phone.toLowerCase().includes(q.toLowerCase()),
      },
      {
        id: "groupBy",
        label: "Group by",
        type: "groupBy",
        options: [
          { label: "None", value: "none" },
          { label: "Blocked By", value: "blockedBy" },
        ],
        groupBy: (row, value) => (value === "blockedBy" ? row.blockedBy : ""),
      },
    ],
    [],
  );

  return (
    <>
      <DataTable
        data={data}
        columns={columns}
        title="Blocklist"
        filters={filters}
        enableColumnVisibility
        enableColumnReorder
        enableFilterCustomization
        showPageSize
        pageSize={8}
        itemLabel="blocked visitor"
        emptyMessage="No blocked visitors."
        toolbarActions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button size="sm" className="gap-1.5" />}>
              <Ban className="size-3.5" />
              Block visitor
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Block visitor</DialogTitle>
                <DialogDescription>Add a visitor to the society blocklist.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleBlock} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="block-name">Name</Label>
                  <Input
                    id="block-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="block-phone">Phone</Label>
                  <Input
                    id="block-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="block-reason">Reason</Label>
                  <Textarea
                    id="block-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Why is this visitor blocked?"
                    rows={3}
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!name.trim() || !phone.trim() || !reason.trim()}
                    className="gap-1.5"
                  >
                    <Plus className="size-3.5" />
                    Block visitor
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
    </>
  );
}

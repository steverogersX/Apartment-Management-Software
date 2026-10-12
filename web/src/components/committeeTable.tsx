"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";

import { cn, getInitials, gradientForName } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable, type DataTableFilterConfig } from "@/components/dataTable";
import { DataTableColumnHeader } from "@/components/dataTableColumnHeader";
import {
  committeeMembers,
  POSITIONS,
  type CommitteeMember,
  type CommitteePosition,
} from "@/lib/committeeMockData";

type DraftState = {
  name: string;
  position: CommitteePosition;
  phone: string;
  email: string;
};

const EMPTY_DRAFT: DraftState = {
  name: "",
  position: "Committee Member",
  phone: "",
  email: "",
};

function positionBadgeVariant(pos: CommitteePosition) {
  if (pos === "President") return "default";
  if (pos === "Secretary" || pos === "Treasurer") return "secondary";
  return "outline";
}

function MemberFormDialog({
  open,
  onOpenChange,
  editing,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: CommitteeMember | null;
  onSave: (draft: DraftState) => void;
}) {
  const [draft, setDraft] = React.useState<DraftState>(editing ?? EMPTY_DRAFT);
  const [error, setError] = React.useState<string | undefined>();

  React.useEffect(() => {
    if (open) {
      setDraft(editing ?? EMPTY_DRAFT);
      setError(undefined);
    }
  }, [open, editing]);

  const [from, to] = gradientForName(draft.name || "new-member");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.name.trim() || !draft.phone.trim() || !draft.email.trim()) {
      setError("All fields are required");
      return;
    }
    onSave(draft);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit member" : "Add committee member"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Update the member's details below."
              : "Add a new member to the Management Committee."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage
                src={`https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(draft.name || "new-member")}`}
                alt={draft.name || "New member"}
              />
              <AvatarFallback
                className="text-[10px] font-semibold text-white"
                style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
              >
                {draft.name ? getInitials(draft.name) : "?"}
              </AvatarFallback>
            </Avatar>
            <p className="text-xs text-muted-foreground">
              Avatar is generated automatically from the name.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="member-name" className="text-sm font-medium text-foreground">
              Full name
            </label>
            <input
              id="member-name"
              placeholder="Vikram Singh Rathore"
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="member-position" className="text-sm font-medium text-foreground">
              Position
            </label>
            <select
              id="member-position"
              value={draft.position}
              onChange={(e) =>
                setDraft((d) => ({ ...d, position: e.target.value as CommitteePosition }))
              }
              className="flex h-8 w-full cursor-pointer rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {POSITIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="member-phone" className="text-sm font-medium text-foreground">
                Phone
              </label>
              <input
                id="member-phone"
                placeholder="+91 98765 43210"
                value={draft.phone}
                onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="member-email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <input
                id="member-email"
                type="email"
                placeholder="vikram@example.com"
                value={draft.email}
                onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{editing ? "Save changes" : "Add member"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteConfirmDialog({
  open,
  onOpenChange,
  memberName,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberName: string;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove committee member</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove{" "}
            <span className="font-medium text-foreground">{memberName}</span> from the Management
            Committee? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CommitteeTable() {
  const [members, setMembers] = React.useState<CommitteeMember[]>([...committeeMembers]);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<CommitteeMember | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<CommitteeMember | null>(null);

  const nameMap = React.useMemo(
    () => new Map(members.map((m) => [m.id, m.name.toLowerCase()])),
    [members],
  );

  function handleSave(draft: DraftState) {
    if (editing) {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === editing.id
            ? {
                ...m,
                name: draft.name.trim(),
                position: draft.position,
                phone: draft.phone.trim(),
                email: draft.email.trim(),
              }
            : m,
        ),
      );
    } else {
      setMembers((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          name: draft.name.trim(),
          position: draft.position,
          phone: draft.phone.trim(),
          email: draft.email.trim(),
          residentId: null,
          termStart: "2024-04-01T00:00:00+05:30",
          termEnd: "2027-03-31T00:00:00+05:30",
        },
      ]);
    }
    setFormOpen(false);
    setEditing(null);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setMembers((prev) => prev.filter((m) => m.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  const columns = React.useMemo<ColumnDef<CommitteeMember>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Member"
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
              <span className="truncate text-sm font-medium text-foreground">
                {row.original.name}
              </span>
            </div>
          );
        },
      },
      {
        id: "position",
        accessorKey: "position",
        meta: { label: "Position" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Position"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <Badge variant={positionBadgeVariant(row.original.position)}>
            {row.original.position}
          </Badge>
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
        id: "email",
        accessorKey: "email",
        meta: { label: "Email" },
        header: () => <DataTableColumnHeader label="Email" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {row.original.email}
          </span>
        ),
      },
      {
        id: "actions",
        enableHiding: false,
        enableSorting: false,
        header: () => null,
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-sm" className="ml-auto text-muted-foreground" />
              }
            >
              <MoreHorizontal className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem
                onClick={() => {
                  setEditing(row.original);
                  setFormOpen(true);
                }}
              >
                <Pencil className="size-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(row.original)}>
                <Trash2 className="size-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [],
  );

  const filters = React.useMemo<DataTableFilterConfig<CommitteeMember>[]>(
    () => [
      {
        id: "search",
        label: "Search",
        type: "search",
        placeholder: "Search name, phone or email",
        predicate: (row, query) => {
          const q = query.toLowerCase();
          return (
            row.name.toLowerCase().includes(q) ||
            row.phone.toLowerCase().includes(q) ||
            row.email.toLowerCase().includes(q)
          );
        },
      },
      {
        id: "position",
        label: "Position",
        type: "select",
        options: POSITIONS.map((p) => ({ label: p, value: p })),
        predicate: (row, value) => row.position === value,
      },
    ],
    [],
  );

  return (
    <>
      <DataTable
        data={members}
        columns={columns}
        getRowId={(m) => m.id}
        title="All members"
        filters={filters}
        enableRowSelection
        enableColumnVisibility
        enableFilterCustomization
        showPageSize
        pageSize={8}
        itemLabel="member"
        emptyMessage="No committee members found."
        toolbarActions={
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="size-3.5" />
            Add member
          </Button>
        }
      />

      <MemberFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        editing={editing}
        onSave={handleSave}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        memberName={deleteTarget?.name ?? ""}
        onConfirm={handleDelete}
      />
    </>
  );
}

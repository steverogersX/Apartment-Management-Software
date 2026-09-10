"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, FileText, Image as ImageIcon, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableFilterConfig } from "@/components/dataTable";
import { DataTableColumnHeader } from "@/components/dataTableColumnHeader";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { boardNotices, NOTICE_CATEGORIES, type BoardNotice } from "@/lib/noticesMockData";
import { useAuth } from "@/hooks/useAuth";
import type { ColumnDef } from "@tanstack/react-table";

import { cn } from "@/lib/utils";

const CATEGORY_VARIANT: Record<string, "secondary" | "outline" | "default"> = {
  Maintenance: "secondary",
  Shutdown: "outline",
  Event: "default",
  "Security Alert": "default",
  General: "outline",
  AGM: "secondary",
  Billing: "outline",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function NoticeBoardTable() {
  const router = useRouter();
  const { has } = useAuth();
  const [notices, setNotices] = React.useState<BoardNotice[]>(() =>
    [...boardNotices].sort(
      (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(),
    ),
  );

  const currentUser = "Arvind Deshmukh";
  const canCreate = has("NoticesPost");

  function handleAcknowledge(id: string) {
    setNotices((prev) =>
      prev.map((n) =>
        n.id === id && !n.acknowledgedBy.includes(currentUser)
          ? {
              ...n,
              acknowledgedBy: [...n.acknowledgedBy, currentUser],
              readBy: n.readBy.some((r) => r.name === currentUser)
                ? n.readBy
                : [...n.readBy, { name: currentUser, viewedAt: new Date().toISOString() }],
            }
          : n,
      ),
    );
  }

  function handleRowClick(row: BoardNotice) {
    setNotices((prev) =>
      prev.map((n) =>
        n.id === row.id && !n.readBy.some((r) => r.name === currentUser)
          ? {
              ...n,
              readBy: [...n.readBy, { name: currentUser, viewedAt: new Date().toISOString() }],
            }
          : n,
      ),
    );
    router.push(`/dashboard/notices/${row.id}`);
  }

  const columns = React.useMemo<ColumnDef<BoardNotice>[]>(
    () => [
      {
        id: "title",
        accessorKey: "title",
        size: 300,
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Notice"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => {
          const n = row.original;
          const isUnread = !n.readBy.some((r) => r.name === currentUser);
          const isFlash = n.priority === "flash";
          return (
            <div
              className={cn(
                "flex min-w-0 flex-col gap-1 border-l-2 pl-3",
                isFlash ? "border-red-500" : "border-transparent",
                isUnread && "font-medium",
              )}
            >
              <div className="flex items-center gap-1.5">
                {isUnread && <span className="size-1.5 shrink-0 rounded-full bg-blue-500" />}
                {n.coverImage && (
                  <HoverCard>
                    <HoverCardTrigger
                      delay={150}
                      closeDelay={100}
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0"
                    >
                      <img src={n.coverImage} alt="" className="size-8 rounded object-cover" />
                    </HoverCardTrigger>
                    <HoverCardContent
                      className="w-64 p-0 overflow-hidden"
                      side="right"
                      align="start"
                    >
                      <img src={n.coverImage} alt="" className="h-auto w-full" />
                    </HoverCardContent>
                  </HoverCard>
                )}
                <span
                  className={cn(
                    "truncate text-sm",
                    isUnread ? "font-semibold text-foreground" : "font-medium text-foreground",
                  )}
                >
                  {n.title}
                </span>
                {isFlash && (
                  <Badge variant="destructive" className="px-1 py-0 text-[10px]">
                    Flash
                  </Badge>
                )}
              </div>
              <span className="line-clamp-1 text-xs text-muted-foreground">{n.excerpt}</span>
            </div>
          );
        },
      },
      {
        id: "category",
        accessorKey: "category",
        meta: { label: "Category" },
        size: 130,
        header: () => <DataTableColumnHeader label="Category" />,
        cell: ({ row }) => (
          <Badge variant={CATEGORY_VARIANT[row.original.category] ?? "outline"}>
            {row.original.category}
          </Badge>
        ),
      },
      {
        id: "postedBy",
        accessorKey: "postedBy",
        meta: { label: "Posted By" },
        size: 180,
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Posted By"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {row.original.postedBy}
          </span>
        ),
      },
      {
        id: "postedAt",
        accessorKey: "postedAt",
        meta: { label: "Date" },
        size: 130,
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Date"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {formatDate(row.original.postedAt)}
          </span>
        ),
      },
      {
        id: "priority",
        accessorKey: "priority",
        meta: { label: "Priority" },
        size: 110,
        header: () => <DataTableColumnHeader label="Priority" />,
        cell: ({ row }) => {
          const p = row.original.priority;
          return (
            <Badge variant={p === "flash" ? "destructive" : "outline"} className="capitalize">
              {p === "flash" ? "Flash alert" : "Normal"}
            </Badge>
          );
        },
      },
      {
        id: "tags",
        accessorFn: (row) => row.tags?.join(", ") ?? "",
        meta: { label: "Tags" },
        size: 170,
        header: () => <DataTableColumnHeader label="Tags" />,
        cell: ({ row }) => {
          const tags = row.original.tags ?? [];
          if (tags.length === 0) return null;
          const visible = tags.slice(0, 2);
          const extra = tags.length - visible.length;
          return (
            <div className="flex items-center gap-1">
              {visible.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
              {extra > 0 && <span className="text-xs text-muted-foreground">+{extra}</span>}
            </div>
          );
        },
      },
      {
        id: "attachments",
        accessorFn: (row) => row.attachments?.length ?? 0,
        meta: { label: "Attachments" },
        size: 110,
        header: () => <DataTableColumnHeader label="Attachments" />,
        cell: ({ row }) => {
          const atts = row.original.attachments;
          if (!atts || atts.length === 0) return null;
          const hasImage = atts.some((a) => a.type === "image");
          const hasPdf = atts.some((a) => a.type === "pdf");
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <HoverCard>
                <HoverCardTrigger
                  delay={150}
                  closeDelay={100}
                  className="inline-flex items-center gap-1 rounded-md px-1 py-0.5 hover:bg-muted"
                >
                  <span className="flex items-center gap-1">
                    {hasPdf && <FileText className="size-3.5 text-muted-foreground" />}
                    {hasImage && <ImageIcon className="size-3.5 text-muted-foreground" />}
                  </span>
                  {atts.length > 1 ? (
                    <Badge variant="secondary" className="px-1 py-0 text-[10px]">
                      {atts.length}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">{atts.length}</span>
                  )}
                </HoverCardTrigger>
                <HoverCardContent className="w-72 p-2" side="left" align="start">
                  <div className="flex flex-col gap-2">
                    {atts.map((att) =>
                      att.type === "image" ? (
                        <div key={att.name} className="flex flex-col gap-1">
                          <div className="overflow-hidden rounded border border-border">
                            <img
                              src={att.url}
                              alt={att.name}
                              className="h-16 w-full object-cover"
                            />
                          </div>
                          <span className="truncate text-xs font-medium text-foreground">
                            {att.name}
                          </span>
                        </div>
                      ) : (
                        <div
                          key={att.name}
                          className="flex items-center gap-2 rounded-md border border-border p-2"
                        >
                          <span className="flex size-7 shrink-0 items-center justify-center rounded bg-muted">
                            <FileText className="size-3.5 text-muted-foreground" />
                          </span>
                          <div className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate text-xs font-medium text-foreground">
                              {att.name}
                            </span>
                            <span className="text-[11px] text-muted-foreground">{att.size}</span>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
          );
        },
      },
      {
        id: "audience",
        accessorFn: (row) =>
          row.audience.scope === "All"
            ? "All"
            : row.audience.scope === "Blocks"
              ? row.audience.blocks.join(", ")
              : row.audience.flats.join(", "),
        meta: { label: "Audience" },
        size: 150,
        header: () => <DataTableColumnHeader label="Audience" />,
        cell: ({ row }) => {
          const a = row.original.audience;
          const label =
            a.scope === "All"
              ? "All"
              : a.scope === "Blocks"
                ? a.blocks.join(", ")
                : a.flats.join(", ");
          return <span className="block truncate text-sm text-muted-foreground">{label}</span>;
        },
      },
      {
        id: "actions",
        enableHiding: false,
        size: 150,
        header: () => null,
        cell: ({ row }) => {
          const n = row.original;
          const isAcknowledged = n.acknowledgedBy.includes(currentUser);
          if (!n.requiresAcknowledge || isAcknowledged) return null;
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1 px-2 text-xs"
                onClick={() => handleAcknowledge(n.id)}
              >
                <Check className="size-3.5" />
                Acknowledge
              </Button>
            </div>
          );
        },
      },
    ],
    [],
  );

  const filters = React.useMemo<DataTableFilterConfig<BoardNotice>[]>(
    () => [
      {
        id: "search",
        label: "Search",
        type: "search",
        placeholder: "Search title or description…",
        predicate: (row, q) => {
          const query = q.toLowerCase();
          return (
            row.title.toLowerCase().includes(query) ||
            row.excerpt.toLowerCase().includes(query) ||
            row.description.toLowerCase().includes(query)
          );
        },
      },
      {
        id: "category",
        label: "Category",
        type: "select",
        options: NOTICE_CATEGORIES.map((c) => ({ label: c, value: c })),
        predicate: (row, v) => row.category === v,
      },
      {
        id: "priority",
        label: "Priority",
        type: "select",
        options: [
          { label: "Normal", value: "normal" },
          { label: "Flash", value: "flash" },
        ],
        predicate: (row, v) => row.priority === v,
      },
      {
        id: "audience",
        label: "Audience",
        type: "select",
        options: [
          { label: "All", value: "All" },
          { label: "Blocks", value: "Blocks" },
          { label: "Flats", value: "Flats" },
        ],
        predicate: (row, v) => row.audience.scope === v,
      },
    ],
    [],
  );

  return (
    <DataTable
      data={notices}
      columns={columns}
      getRowId={(r) => r.id}
      title="Notices"
      filters={filters}
      enableColumnVisibility
      enableColumnReorder
      enableFilterCustomization
      showPageSize
      pageSize={8}
      itemLabel="notice"
      emptyMessage="No notices found."
      onRowClick={handleRowClick}
      toolbarActions={
        canCreate ? (
          <Button size="sm" className="gap-1.5" render={<Link href="/dashboard/notices/new" />}>
            <Plus className="size-3.5" />
            New notice
          </Button>
        ) : null
      }
    />
  );
}

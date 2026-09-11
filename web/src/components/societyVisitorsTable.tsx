"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { CalendarDays, Check, ShieldOff, ShieldX, UserRound, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableFilterConfig } from "@/components/dataTable";
import { DataTableColumnHeader } from "@/components/dataTableColumnHeader";
import {
  getVisitsByPhone,
  societyVisitors as initialVisitors,
  type SocietyVisitor,
  type SocietyVisitorCategory,
  type VisitorProfile,
} from "@/lib/visitorsMockData";
import { cn } from "@/lib/utils";

function todayStr(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function isToday(dateStr: string) {
  return dateStr === todayStr(0);
}
function isTomorrow(dateStr: string) {
  return dateStr === todayStr(1);
}
function isThisWeek(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  return Math.abs(diff) <= 7 * 24 * 60 * 60 * 1000 && d <= now
    ? true
    : d >= now && d.getTime() - now.getTime() <= 7 * 24 * 60 * 60 * 1000;
}
function isWithinDays(dateStr: string, days: number) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const CATEGORY_LABEL: Record<SocietyVisitorCategory, string> = {
  guest: "Guest",
  delivery: "Delivery",
  cab: "Cab",
  service: "Service",
  other: "Other",
};

const STATUS_DOT: Record<VisitorProfile["status"], string> = {
  active: "bg-emerald-500",
  blocked: "bg-red-500",
};

const STATUS_LABEL: Record<VisitorProfile["status"], string> = {
  active: "Active",
  blocked: "Blocked",
};

function mostCommonCategory(visits: SocietyVisitor[]): SocietyVisitorCategory {
  const counts: Record<string, number> = {};
  for (const v of visits) counts[v.category] = (counts[v.category] ?? 0) + 1;
  return (
    (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] as SocietyVisitorCategory) ??
    visits[0].category
  );
}

type BlockRecord = { reason: string; blockedBy: string; blockedOn: string };

const DEFAULT_BLOCKED: Record<string, BlockRecord> = {
  "+91 98765 55505": {
    reason: "Repeated unsolicited entry attempts",
    blockedBy: "Arvind Deshmukh",
    blockedOn: todayStr(-5),
  },
  "+91 98765 99902": {
    reason: "Denied entry multiple times, abusive behavior",
    blockedBy: "Sunita Patil",
    blockedOn: todayStr(-2),
  },
};

function deriveProfiles(
  visitors: SocietyVisitor[],
  blockedMap: Record<string, BlockRecord>,
): VisitorProfile[] {
  const grouped = new Map<string, SocietyVisitor[]>();
  for (const v of visitors) {
    const arr = grouped.get(v.phone) ?? [];
    arr.push(v);
    grouped.set(v.phone, arr);
  }
  const profiles: VisitorProfile[] = [];
  for (const [phone, visits] of grouped) {
    visits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const mostRecent = visits[0];
    const oldest = visits[visits.length - 1];
    const visitCount = visits.length;
    const isFrequent = visitCount >= 3;
    const blocked = blockedMap[phone];
    profiles.push({
      phone,
      name: mostRecent.name,
      category: mostCommonCategory(visits),
      flatNumber: mostRecent.flatNumber,
      lastVisit: mostRecent.date,
      firstSeen: oldest.date,
      visitCount,
      isFrequent,
      status: blocked ? "blocked" : "active",
      blockedReason: blocked?.reason,
      blockedBy: blocked?.blockedBy,
      blockedOn: blocked?.blockedOn,
      photoUrl: mostRecent.photoUrl,
    });
  }
  return profiles.sort((a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime());
}

export function SocietyVisitorsTable() {
  const router = useRouter();
  const [visitors, setVisitors] = React.useState<SocietyVisitor[]>(() => [...initialVisitors]);
  const [blockedByPhone, setBlockedByPhone] = React.useState<Record<string, BlockRecord>>(() => ({
    ...DEFAULT_BLOCKED,
  }));
  const [statFilter, setStatFilter] = React.useState<string | null>(null);
  const [denyTarget, setDenyTarget] = React.useState<VisitorProfile | null>(null);
  const [denyReason, setDenyReason] = React.useState("");
  const [blockTarget, setBlockTarget] = React.useState<VisitorProfile | null>(null);
  const [blockReason, setBlockReason] = React.useState("");

  const profiles = React.useMemo(
    () => deriveProfiles(visitors, blockedByPhone),
    [visitors, blockedByPhone],
  );

  const flatOptions = React.useMemo(() => {
    const flats = Array.from(new Set(visitors.map((v) => v.flatNumber))).sort();
    return flats;
  }, [visitors]);

  const statCounts = React.useMemo(() => {
    const today = todayStr(0);
    return {
      inside: visitors.filter((v) => v.status === "entered").length,
      awaiting: visitors.filter((v) => v.status === "pending_approval").length,
      expectedToday: visitors.filter((v) => v.status === "expected" && v.date === today).length,
      deniedToday: visitors.filter((v) => v.status === "denied" && v.date === today).length,
    };
  }, [visitors]);

  const filteredByStat = React.useMemo(() => {
    if (!statFilter) return profiles;
    if (statFilter === "inside") {
      const phones = new Set(visitors.filter((v) => v.status === "entered").map((v) => v.phone));
      return profiles.filter((p) => phones.has(p.phone));
    }
    if (statFilter === "awaiting") {
      const phones = new Set(
        visitors.filter((v) => v.status === "pending_approval").map((v) => v.phone),
      );
      return profiles.filter((p) => phones.has(p.phone));
    }
    if (statFilter === "expectedToday") {
      const today = todayStr(0);
      const phones = new Set(
        visitors.filter((v) => v.status === "expected" && v.date === today).map((v) => v.phone),
      );
      return profiles.filter((p) => phones.has(p.phone));
    }
    if (statFilter === "deniedToday") {
      const today = todayStr(0);
      const phones = new Set(
        visitors.filter((v) => v.status === "denied" && v.date === today).map((v) => v.phone),
      );
      return profiles.filter((p) => phones.has(p.phone));
    }
    return profiles;
  }, [profiles, visitors, statFilter]);

  function handleApprove(profile: VisitorProfile) {
    const pending = visitors.find(
      (v) => v.phone === profile.phone && v.status === "pending_approval",
    );
    if (!pending) return;
    const now = new Date().toISOString();
    setVisitors((prev) =>
      prev.map((v) =>
        v.id === pending.id
          ? {
              ...v,
              status: "entered" as const,
              checkIn: now,
              verifiedBy: "Admin",
              arrivedAt: v.arrivedAt,
            }
          : v,
      ),
    );
    const idx = initialVisitors.findIndex((v) => v.id === pending.id);
    if (idx !== -1)
      initialVisitors[idx] = {
        ...initialVisitors[idx],
        status: "entered",
        checkIn: now,
        verifiedBy: "Admin",
      };
  }

  function handleDeny(profile: VisitorProfile) {
    if (!denyTarget || !denyReason.trim()) return;
    const now = new Date().toISOString();
    const reason = denyReason.trim();
    const today = todayStr(0);
    const target = visitors.find(
      (v) =>
        v.phone === profile.phone &&
        (v.status === "pending_approval" || (v.status === "expected" && v.date === today)),
    );

    if (target) {
      setVisitors((prev) =>
        prev.map((v) =>
          v.id === target.id
            ? {
                ...v,
                status: "denied" as const,
                deniedBy: "Admin",
                deniedAt: now,
                deniedReason: reason,
              }
            : v,
        ),
      );
      const idx = initialVisitors.findIndex((v) => v.id === target.id);
      if (idx !== -1)
        initialVisitors[idx] = {
          ...initialVisitors[idx],
          status: "denied",
          deniedBy: "Admin",
          deniedAt: now,
          deniedReason: reason,
        };
    } else {
      const mostRecent = visitors
        .filter((v) => v.phone === profile.phone)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      if (!mostRecent) return;
      const newVisit: SocietyVisitor = {
        ...mostRecent,
        id: `sv-deny-${profile.phone}-${Date.now()}`,
        date: today,
        arrivedAt: null,
        checkIn: null,
        checkOut: null,
        status: "denied",
        verifiedBy: null,
        deniedBy: "Admin",
        deniedAt: now,
        deniedReason: reason,
      };
      setVisitors((prev) => [...prev, newVisit]);
      initialVisitors.push(newVisit);
    }
    setDenyTarget(null);
    setDenyReason("");
  }

  function handleBlock(profile: VisitorProfile) {
    if (!blockTarget || !blockReason.trim()) return;
    setBlockedByPhone((prev) => ({
      ...prev,
      [profile.phone]: { reason: blockReason.trim(), blockedBy: "Admin", blockedOn: todayStr(0) },
    }));
    setBlockTarget(null);
    setBlockReason("");
  }

  function handleUnblock(profile: VisitorProfile) {
    setBlockedByPhone((prev) => {
      const next = { ...prev };
      delete next[profile.phone];
      return next;
    });
  }

  const columns = React.useMemo<ColumnDef<VisitorProfile>[]>(
    () => [
      {
        id: "visitor",
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader
            icon={UserRound}
            label="Visitor"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="truncate text-sm font-medium text-foreground">
              {row.original.name}
            </span>
            <span className="truncate text-xs text-muted-foreground">{row.original.phone}</span>
          </div>
        ),
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
        cell: ({ row }) => <Badge variant="outline">{CATEGORY_LABEL[row.original.category]}</Badge>,
      },
      {
        id: "flatNumber",
        accessorKey: "flatNumber",
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
            {row.original.flatNumber}
          </span>
        ),
      },
      {
        id: "lastVisit",
        accessorKey: "lastVisit",
        meta: { label: "Last Visit" },
        header: ({ column }) => (
          <DataTableColumnHeader
            icon={CalendarDays}
            label="Last Visit"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {formatDate(row.original.lastVisit)}
          </span>
        ),
      },
      {
        id: "visits",
        accessorKey: "visitCount",
        meta: { label: "Visits" },
        header: ({ column }) => (
          <DataTableColumnHeader
            label="Visits"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1.5">
            <span className="text-sm font-medium text-foreground">{row.original.visitCount}</span>
            {row.original.isFrequent && (
              <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                Frequent
              </Badge>
            )}
          </span>
        ),
      },
      {
        id: "status",
        accessorKey: "status",
        meta: { label: "Status" },
        header: () => <DataTableColumnHeader label="Status" />,
        cell: ({ row }) => {
          const s = row.original.status;
          return (
            <span className="inline-flex items-center gap-1.5">
              <span className={cn("size-1.5 shrink-0 rounded-full", STATUS_DOT[s])} />
              <Badge variant={s === "active" ? "secondary" : "destructive"}>
                {STATUS_LABEL[s]}
              </Badge>
            </span>
          );
        },
      },
      {
        id: "actions",
        enableHiding: false,
        header: () => null,
        cell: ({ row }) => {
          const hasPending = visitors.some(
            (v) => v.phone === row.original.phone && v.status === "pending_approval",
          );
          const isBlocked = row.original.status === "blocked";
          return (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              {hasPending && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs"
                    onClick={() => handleApprove(row.original)}
                  >
                    <Check className="size-3.5" />
                    Approve
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs text-destructive hover:text-destructive"
                    onClick={() => setDenyTarget(row.original)}
                  >
                    <X className="size-3.5" />
                    Deny
                  </Button>
                </>
              )}
              {isBlocked ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 px-2 text-xs"
                  onClick={() => handleUnblock(row.original)}
                >
                  <ShieldOff className="size-3.5" />
                  Unblock
                </Button>
              ) : (
                <>
                  {!hasPending && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 px-2 text-xs text-destructive hover:text-destructive"
                      onClick={() => setDenyTarget(row.original)}
                    >
                      <X className="size-3.5" />
                      Deny
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs text-destructive hover:text-destructive"
                    onClick={() => setBlockTarget(row.original)}
                  >
                    <ShieldX className="size-3.5" />
                    Block
                  </Button>
                </>
              )}
            </div>
          );
        },
      },
    ],
    [visitors],
  );

  const filters = React.useMemo<DataTableFilterConfig<VisitorProfile>[]>(
    () => [
      {
        id: "search",
        label: "Search",
        type: "search",
        placeholder: "Search name, phone or flat…",
        predicate: (row, q) => {
          const query = q.toLowerCase();
          return (
            row.name.toLowerCase().includes(query) ||
            row.phone.toLowerCase().includes(query) ||
            row.flatNumber.toLowerCase().includes(query)
          );
        },
      },
      {
        id: "category",
        label: "Category",
        type: "select",
        options: (["guest", "delivery", "cab", "service", "other"] as SocietyVisitorCategory[]).map(
          (c) => ({
            label: CATEGORY_LABEL[c],
            value: c,
          }),
        ),
        predicate: (row, v) => row.category === v,
      },
      {
        id: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Active", value: "active" },
          { label: "Blocked", value: "blocked" },
          { label: "Frequent", value: "frequent" },
        ],
        predicate: (row, v) => {
          if (v === "frequent") return row.isFrequent;
          return row.status === v;
        },
      },
      {
        id: "flat",
        label: "Flat",
        type: "select",
        options: flatOptions.map((f) => ({ label: f, value: f })),
        predicate: (row, v) =>
          visitors.some((visit) => visit.phone === row.phone && visit.flatNumber === v),
      },
      {
        id: "lastVisit",
        label: "Last visit",
        type: "select",
        options: [
          { label: "Today", value: "today" },
          { label: "Tomorrow", value: "tomorrow" },
          { label: "This week", value: "thisWeek" },
          { label: "All", value: "all" },
        ],
        predicate: (row, v) => {
          if (v === "all") return true;
          const visitsForPerson = visitors.filter((visit) => visit.phone === row.phone);
          if (v === "today") return visitsForPerson.some((visit) => isToday(visit.date));
          if (v === "tomorrow") return visitsForPerson.some((visit) => isTomorrow(visit.date));
          if (v === "thisWeek")
            return visitsForPerson.some(
              (visit) => isWithinDays(visit.date, 7) || isTomorrow(visit.date),
            );
          return true;
        },
      },
      {
        id: "groupBy",
        label: "Group by",
        type: "groupBy",
        options: [
          { label: "None", value: "none" },
          { label: "Category", value: "category" },
          { label: "Flat", value: "flat" },
        ],
        groupBy: (row, value) => {
          if (value === "category") return CATEGORY_LABEL[row.category];
          if (value === "flat") return row.flatNumber;
          return "";
        },
      },
    ],
    [flatOptions, visitors],
  );

  const tableFilterValues = React.useMemo(() => {
    if (statFilter === "inside" || statFilter === "awaiting") return { lastVisit: "all" };
    return { lastVisit: "today" };
  }, [statFilter]);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStatFilter((prev) => (prev === "inside" ? null : "inside"))}
          className={cn(
            "inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            statFilter === "inside"
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-card hover:bg-muted",
          )}
        >
          Inside now
          <Badge
            variant={statFilter === "inside" ? "secondary" : "outline"}
            className="px-1.5 py-0 text-[11px]"
          >
            {statCounts.inside}
          </Badge>
        </button>
        <button
          type="button"
          onClick={() => setStatFilter((prev) => (prev === "awaiting" ? null : "awaiting"))}
          className={cn(
            "inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            statFilter === "awaiting"
              ? "border-amber-600 bg-amber-600 text-white"
              : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300",
          )}
        >
          Awaiting approval
          <Badge
            variant="outline"
            className="border-amber-200 bg-white px-1.5 py-0 text-[11px] text-amber-800"
          >
            {statCounts.awaiting}
          </Badge>
        </button>
        <button
          type="button"
          onClick={() =>
            setStatFilter((prev) => (prev === "expectedToday" ? null : "expectedToday"))
          }
          className={cn(
            "inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            statFilter === "expectedToday"
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-card hover:bg-muted",
          )}
        >
          Expected today
          <Badge
            variant={statFilter === "expectedToday" ? "secondary" : "outline"}
            className="px-1.5 py-0 text-[11px]"
          >
            {statCounts.expectedToday}
          </Badge>
        </button>
        <button
          type="button"
          onClick={() => setStatFilter((prev) => (prev === "deniedToday" ? null : "deniedToday"))}
          className={cn(
            "inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            statFilter === "deniedToday"
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-card hover:bg-muted",
          )}
        >
          Denied today
          <Badge
            variant={statFilter === "deniedToday" ? "secondary" : "outline"}
            className="px-1.5 py-0 text-[11px]"
          >
            {statCounts.deniedToday}
          </Badge>
        </button>
      </div>

      <DataTable
        key={statFilter ?? "today"}
        data={filteredByStat}
        columns={columns}
        getRowId={(r) => r.phone}
        title="Visitors"
        filters={filters}
        enableColumnVisibility
        enableColumnReorder
        enableFilterCustomization
        showPageSize
        pageSize={8}
        itemLabel="visitor"
        emptyMessage="No visitors match these filters."
        initialSorting={[{ id: "lastVisit", desc: false }]}
        defaultFilterValues={tableFilterValues}
        onRowClick={(row) =>
          router.push(`/dashboard/people-hub/visitors/${encodeURIComponent(row.phone)}`)
        }
      />

      {denyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-lg bg-card p-4 shadow-lg">
            <h3 className="text-sm font-semibold text-foreground">Deny entry</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Provide a reason for denying {denyTarget.name}.
            </p>
            <textarea
              value={denyReason}
              onChange={(e) => setDenyReason(e.target.value)}
              placeholder="Reason for denying entry"
              rows={3}
              className="mt-3 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDenyTarget(null);
                  setDenyReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={!denyReason.trim()}
                onClick={() => handleDeny(denyTarget)}
              >
                Deny
              </Button>
            </div>
          </div>
        </div>
      )}

      {blockTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-lg bg-card p-4 shadow-lg">
            <h3 className="text-sm font-semibold text-foreground">Block visitor</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {blockTarget.name} ({blockTarget.phone}) won&apos;t be allowed entry to any flat until
              unblocked. Provide a reason.
            </p>
            <textarea
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="Reason for blocking"
              rows={3}
              className="mt-3 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setBlockTarget(null);
                  setBlockReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={!blockReason.trim()}
                onClick={() => handleBlock(blockTarget)}
              >
                Block
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  History,
  IndianRupee,
  MapPin,
  Phone,
  TriangleAlert,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { flats } from "@/lib/flatsMockData";
import type { MaintenanceLogEntry } from "@/lib/maintenanceMockData";
import { residents } from "@/lib/residentsMockData";
import { staffMembers } from "@/lib/staffMockData";
import {
  avatarUrlForName,
  formatCurrency,
  formatDate,
  formatDateTime,
  getInitials,
} from "@/lib/utils";

const REPEAT_WINDOW_DAYS = 90;
const DAY_MS = 24 * 60 * 60 * 1000;

const staffById = new Map(staffMembers.map((s) => [s.id, s]));

function placeKey(entry: MaintenanceLogEntry) {
  return entry.scope === "flat"
    ? `flat:${entry.tower}-${entry.flatNumber}`
    : `society:${entry.location ?? ""}`;
}

function placeLabel(entry: MaintenanceLogEntry) {
  if (entry.scope === "flat") return `${entry.tower}-${entry.flatNumber}`;
  return entry.location ?? "Society";
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        {Icon && <Icon className="size-3.5" />}
        {label}
      </span>
      <span className="font-medium text-foreground">{children}</span>
    </div>
  );
}

export function MaintenanceEntrySheet({
  entry,
  entries,
  onOpenChange,
  onSelect,
}: {
  entry: MaintenanceLogEntry | null;
  entries: MaintenanceLogEntry[];
  onOpenChange: (open: boolean) => void;
  onSelect: (entry: MaintenanceLogEntry) => void;
}) {
  const details = React.useMemo(() => {
    if (!entry) return null;
    const key = placeKey(entry);
    const atPlace = entries
      .filter((e) => placeKey(e) === key)
      .sort((a, b) => new Date(b.performedOn).getTime() - new Date(a.performedOn).getTime());
    const performedAt = new Date(entry.performedOn).getTime();
    const repeats = atPlace.filter(
      (e) =>
        e.id !== entry.id &&
        e.category === entry.category &&
        Math.abs(new Date(e.performedOn).getTime() - performedAt) <= REPEAT_WINDOW_DAYS * DAY_MS,
    );
    const flat =
      entry.scope === "flat"
        ? flats.find((f) => f.tower === entry.tower && f.flatNumber === entry.flatNumber)
        : undefined;
    return {
      staff: entry.staffId ? staffById.get(entry.staffId) : undefined,
      flat,
      flatResidents: flat ? residents.filter((r) => flat.currentResidentIds.includes(r.id)) : [],
      history: atPlace.filter((e) => e.id !== entry.id),
      repeats,
      totalAtPlace: atPlace.reduce((sum, e) => sum + (e.cost ?? 0), 0),
    };
  }, [entry, entries]);

  return (
    <Sheet open={!!entry} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        {entry && details && (
          <>
            <SheetHeader className="border-b border-border p-4 text-left">
              <div className="flex items-center gap-2">
                <Badge variant={entry.scope === "society" ? "secondary" : "outline"}>
                  {entry.scope === "society" ? "Society" : "Flat"}
                </Badge>
                <Badge variant="outline">{entry.category}</Badge>
              </div>
              <SheetTitle className="text-base">{placeLabel(entry)}</SheetTitle>
              <SheetDescription>{entry.description}</SheetDescription>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-4">
              {details.repeats.length > 0 && (
                <div className="flex gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                  <p>
                    Recurring issue — {details.repeats.length} other {entry.category.toLowerCase()}{" "}
                    {details.repeats.length === 1 ? "job" : "jobs"} at this{" "}
                    {entry.scope === "flat" ? "flat" : "location"} within {REPEAT_WINDOW_DAYS} days.
                    Consider a root-cause fix or a vendor review.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm">
                <Field icon={CalendarDays} label="Work done on">
                  {formatDate(entry.performedOn)}
                </Field>
                <Field icon={IndianRupee} label="Cost">
                  {entry.cost != null ? formatCurrency(entry.cost) : "—"}
                </Field>
                <Field label="Logged by">{entry.loggedBy}</Field>
                <Field label="Logged at">{formatDateTime(entry.loggedAt)}</Field>
              </div>

              <Separator />

              <div className="flex flex-col gap-3">
                <h4 className="text-sm font-semibold text-foreground">Done by</h4>
                {details.staff ? (
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={avatarUrlForName(details.staff.name)}
                          alt={details.staff.name}
                        />
                        <AvatarFallback className="text-xs">
                          {getInitials(details.staff.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-col text-sm">
                        <span className="truncate font-medium text-foreground">
                          {details.staff.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {details.staff.role} · {details.staff.shift} shift
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 gap-1.5"
                      render={<a href={`tel:${details.staff.phone}`} />}
                    >
                      <Phone className="size-3.5" />
                      Call
                    </Button>
                  </div>
                ) : (
                  <p className="rounded-lg border border-dashed border-border p-3 text-center text-sm text-muted-foreground">
                    No staff member recorded for this job.
                  </p>
                )}
              </div>

              {details.flat && (
                <>
                  <Separator />
                  <div className="flex flex-col gap-3">
                    <h4 className="text-sm font-semibold text-foreground">Flat</h4>
                    <div className="flex flex-col gap-3 rounded-lg border border-border p-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-1.5 text-foreground">
                          <MapPin className="size-3.5 text-muted-foreground" />
                          Tower {details.flat.tower} · Floor {details.flat.floor} ·{" "}
                          {details.flat.type}
                        </span>
                        <Link
                          href={`/dashboard/people-hub/flats/${details.flat.id}`}
                          className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          View flat
                          <ArrowRight className="size-3" />
                        </Link>
                      </div>
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Users className="size-3.5" />
                        {details.flatResidents.length > 0
                          ? details.flatResidents
                              .map(
                                (r) =>
                                  `${r.name} (${r.occupancyType === "owner" ? "Owner" : "Tenant"})`,
                              )
                              .join(", ")
                          : "No current residents"}
                      </span>
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <History className="size-3.5 text-muted-foreground" />
                    Other work here · {details.history.length}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    Total spent {formatCurrency(details.totalAtPlace)}
                  </span>
                </div>
                {details.history.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                    This is the only job logged at this{" "}
                    {entry.scope === "flat" ? "flat" : "location"}.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {details.history.slice(0, 6).map((e) => (
                      <button
                        key={e.id}
                        type="button"
                        onClick={() => onSelect(e)}
                        className="flex flex-col gap-1 rounded-lg border border-border px-3 py-2 text-left text-sm transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-foreground">{e.category}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(e.performedOn)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-muted-foreground">{e.description}</span>
                          <span className="shrink-0 tabular-nums text-foreground">
                            {e.cost != null ? formatCurrency(e.cost) : "—"}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

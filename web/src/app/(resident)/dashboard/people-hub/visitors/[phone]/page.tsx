"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Ban, CalendarDays, Check, Home, Phone, ShieldCheck, X } from "lucide-react";

import { useBreadcrumbTitle } from "@/components/breadcrumbs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VisitorPass } from "@/components/visitorPass";
import {
  getVisitsByPhone,
  getVisitorProfiles,
  societyVisitors,
  type SocietyVisitor,
  type VisitorProfile,
} from "@/lib/visitorsMockData";
import { cn, formatDate, getInitials, gradientForName, avatarUrlForName } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

function elapsedSince(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  if (h <= 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function isExpired(visit: SocietyVisitor) {
  if (visit.status !== "expected") return false;
  const today = new Date().toISOString().slice(0, 10);
  return visit.date < today;
}

function displayStatus(visit: SocietyVisitor) {
  if (isExpired(visit)) return "expired" as const;
  return visit.status;
}

export default function VisitorDetailPage() {
  const { toast } = useToast();
  const params = useParams<{ phone: string }>();
  const phone = decodeURIComponent(params.phone);
  const initialProfile = React.useMemo(
    () => getVisitorProfiles().find((p) => p.phone === phone) ?? null,
    [phone],
  );

  const [profile, setProfile] = React.useState<VisitorProfile | null>(initialProfile);
  const [visits, setVisits] = React.useState<SocietyVisitor[]>(() => getVisitsByPhone(phone));
  const [blockReason, setBlockReason] = React.useState("");
  const [blockOpen, setBlockOpen] = React.useState(false);
  const [denyTargetId, setDenyTargetId] = React.useState<string | null>(null);
  const [denyReason, setDenyReason] = React.useState("");
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  React.useEffect(() => {
    setVisits(getVisitsByPhone(phone));
  }, [phone]);

  useBreadcrumbTitle(profile?.name ?? null);

  if (!profile) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-sm text-muted-foreground">Visitor not found.</p>
        <Link
          href="/dashboard/people-hub/visitors"
          className="text-sm font-medium text-foreground underline"
        >
          Back to visitors
        </Link>
      </div>
    );
  }

  const [from, to] = gradientForName(profile.name);
  const isBlocked = profile.status === "blocked";

  function handleBlock() {
    if (!blockReason.trim()) return;
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            status: "blocked",
            blockedReason: blockReason.trim(),
            blockedBy: "Admin",
            blockedOn: new Date().toISOString().slice(0, 10),
          }
        : prev,
    );
    setBlockReason("");
    setBlockOpen(false);
    toast({ title: "Visitor blocked", variant: "info" });
  }

  function handleUnblock() {
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            status: "active",
            blockedReason: undefined,
            blockedBy: undefined,
            blockedOn: undefined,
          }
        : prev,
    );
    toast({ title: "Visitor unblocked" });
  }

  function handleApprove(visitId: string) {
    const now = new Date().toISOString();
    setVisits((prev) =>
      prev.map((v) =>
        v.id === visitId
          ? { ...v, status: "entered" as const, checkIn: now, verifiedBy: "Admin" }
          : v,
      ),
    );
    const idx = societyVisitors.findIndex((v) => v.id === visitId);
    if (idx !== -1)
      societyVisitors[idx] = {
        ...societyVisitors[idx],
        status: "entered",
        checkIn: now,
        verifiedBy: "Admin",
      };
    toast({ title: "Visitor approved" });
  }

  function handleDeny(visitId: string) {
    if (!denyReason.trim()) return;
    const now = new Date().toISOString();
    const reason = denyReason.trim();

    if (visitId === "new") {
      const mostRecent = [...visits].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      )[0];
      if (!mostRecent) return;
      const newVisit: SocietyVisitor = {
        ...mostRecent,
        id: `sv-deny-${profile?.phone}-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        arrivedAt: null,
        checkIn: null,
        checkOut: null,
        status: "denied",
        verifiedBy: null,
        deniedBy: "Admin",
        deniedAt: now,
        deniedReason: reason,
      };
      setVisits((prev) => [...prev, newVisit]);
      societyVisitors.push(newVisit);
      setDenyTargetId(null);
      setDenyReason("");
      return;
    }

    setVisits((prev) =>
      prev.map((v) =>
        v.id === visitId
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
    const idx = societyVisitors.findIndex((v) => v.id === visitId);
    if (idx !== -1)
      societyVisitors[idx] = {
        ...societyVisitors[idx],
        status: "denied",
        deniedBy: "Admin",
        deniedAt: now,
        deniedReason: reason,
      };
    setDenyTargetId(null);
    setDenyReason("");
    toast({ title: "Visitor denied", variant: "info" });
  }

  function openDenyForProfile() {
    const today = new Date().toISOString().slice(0, 10);
    const target = visits.find(
      (v) => v.status === "pending_approval" || (v.status === "expected" && v.date === today),
    );
    setDenyTargetId(target ? target.id : "new");
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <Link
        href="/dashboard/people-hub/visitors"
        className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to visitors
      </Link>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[360px_1fr]">
        <div className="flex flex-col gap-5">
          <Card>
            <CardContent className="flex flex-col gap-4 p-6">
              <div className="flex gap-4">
                <Avatar className="size-16 shrink-0">
                  <AvatarImage src={avatarUrlForName(profile.phone)} alt={profile.name} />
                  <AvatarFallback
                    className="text-sm font-semibold text-white"
                    style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
                  >
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <h1 className="truncate text-lg font-semibold tracking-tight text-foreground">
                    {profile.name}
                  </h1>
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Phone className="size-3.5 shrink-0" />
                    {profile.phone}
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline">{profile.category}</Badge>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-xs font-medium">
                      <span
                        className={cn(
                          "size-1.5 shrink-0 rounded-full",
                          isBlocked ? "bg-red-500" : "bg-emerald-500",
                        )}
                      />
                      {isBlocked ? "Blocked" : "Active"}
                    </span>
                    {profile.isFrequent && <Badge variant="secondary">Frequent visitor</Badge>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Total visits</span>
                  <span className="font-medium text-foreground">{profile.visitCount}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Last visit</span>
                  <span className="font-medium text-foreground">
                    {formatDate(profile.lastVisit)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">First seen</span>
                  <span className="font-medium text-foreground">
                    {formatDate(profile.firstSeen)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Flat</span>
                  <span className="font-medium text-foreground">{profile.flatNumber}</span>
                </div>
              </div>

              {isBlocked && profile.blockedReason && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 dark:border-red-900/50 dark:bg-red-950/30">
                  <p className="text-xs font-medium text-red-800 dark:text-red-300">Blocked</p>
                  <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                    {profile.blockedReason}
                  </p>
                  <p className="mt-1 text-xs text-red-600/80 dark:text-red-400/80">
                    by {profile.blockedBy} on{" "}
                    {profile.blockedOn ? formatDate(profile.blockedOn) : "—"}
                  </p>
                </div>
              )}

              {isBlocked ? (
                <Button variant="outline" className="gap-1.5" onClick={handleUnblock}>
                  <ShieldCheck className="size-3.5" />
                  Unblock visitor
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 gap-1.5 text-destructive hover:text-destructive"
                    onClick={openDenyForProfile}
                  >
                    <X className="size-3.5" />
                    Deny entry
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 gap-1.5"
                    onClick={() => setBlockOpen(true)}
                  >
                    <Ban className="size-3.5" />
                    Block visitor
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Visit history</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              {visits.map((visit, idx) => {
                const isLast = idx === visits.length - 1;
                const isExpanded = expandedId === visit.id;
                const dStatus = displayStatus(visit);
                const isInside = dStatus === "entered" && visit.checkIn && !visit.checkOut;
                const isPending = dStatus === "pending_approval";
                return (
                  <div key={visit.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-full border bg-muted text-muted-foreground">
                        <CalendarDays className="size-3.5" />
                      </span>
                      {!isLast && <span className="mt-1 w-px flex-1 bg-border min-h-3" />}
                    </div>
                    <div className={`flex min-w-0 flex-1 flex-col ${isLast ? "" : "pb-5"}`}>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {formatDate(visit.date)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Home className="size-3.5" />
                          {visit.flatNumber}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          invited by {visit.invitedBy}
                        </span>
                        <Badge
                          variant={
                            dStatus === "entered"
                              ? "secondary"
                              : dStatus === "pending_approval"
                                ? "outline"
                                : "outline"
                          }
                          className="capitalize"
                        >
                          {dStatus === "pending_approval" ? "Pending approval" : dStatus}
                        </Badge>
                        {visit.visitorType === "walk_in" && (
                          <Badge variant="outline" className="text-[10px]">
                            Walk-in
                          </Badge>
                        )}
                        {visit.visitorType === "pre_approved" && (
                          <Badge variant="outline" className="text-[10px]">
                            Pre-approved
                          </Badge>
                        )}
                      </div>

                      <div className="mt-2 flex flex-col gap-1.5 rounded-md border border-border p-2.5">
                        {visit.visitorType === "walk_in" && visit.arrivedAt && (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="size-1.5 shrink-0 rounded-full bg-amber-500" />
                            <span className="text-muted-foreground">
                              Walk-in requested for {visit.flatNumber}
                            </span>
                            <span className="text-muted-foreground">·</span>
                            <span className="text-muted-foreground">
                              {new Date(visit.arrivedAt).toLocaleTimeString("en-IN", {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        )}
                        {dStatus === "expected" && (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="size-1.5 shrink-0 rounded-full bg-blue-500" />
                            <span className="text-muted-foreground">
                              Pre-approved for {visit.expectedTime}
                            </span>
                          </div>
                        )}
                        {dStatus === "pending_approval" && (
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="size-1.5 shrink-0 rounded-full bg-amber-500" />
                              <span className="text-muted-foreground">Awaiting approval</span>
                              {visit.arrivedAt && (
                                <span className="text-muted-foreground">
                                  · arrived{" "}
                                  {new Date(visit.arrivedAt).toLocaleTimeString("en-IN", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                  })}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="h-7 gap-1 px-2 text-xs"
                                onClick={() => handleApprove(visit.id)}
                              >
                                <Check className="size-3.5" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 gap-1 px-2 text-xs"
                                onClick={() => setDenyTargetId(visit.id)}
                              >
                                <X className="size-3.5" />
                                Deny
                              </Button>
                            </div>
                          </div>
                        )}
                        {(dStatus === "entered" || dStatus === "completed") && visit.checkIn && (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" />
                            <span className="text-muted-foreground">
                              Entered at{" "}
                              {new Date(visit.checkIn).toLocaleTimeString("en-IN", {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </span>
                            {visit.verifiedBy && (
                              <span className="text-muted-foreground">
                                · verified by {visit.verifiedBy}
                              </span>
                            )}
                          </div>
                        )}
                        {dStatus === "completed" && visit.checkOut && (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="size-1.5 shrink-0 rounded-full bg-zinc-400" />
                            <span className="text-muted-foreground">
                              Completed at{" "}
                              {new Date(visit.checkOut).toLocaleTimeString("en-IN", {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        )}
                        {dStatus === "denied" && (
                          <div className="flex flex-col gap-1 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="size-1.5 shrink-0 rounded-full bg-red-500" />
                              <span className="text-muted-foreground">
                                Denied{visit.deniedBy ? ` by ${visit.deniedBy}` : ""} at{" "}
                                {visit.deniedAt
                                  ? new Date(visit.deniedAt).toLocaleTimeString("en-IN", {
                                      hour: "numeric",
                                      minute: "2-digit",
                                    })
                                  : "—"}
                              </span>
                            </div>
                            {visit.deniedReason && (
                              <span className="pl-3 text-muted-foreground">
                                Reason: {visit.deniedReason}
                              </span>
                            )}
                          </div>
                        )}
                        {dStatus === "expired" && (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="size-1.5 shrink-0 rounded-full bg-zinc-400" />
                            <span className="text-muted-foreground">Expired — no arrival</span>
                          </div>
                        )}
                        {isInside && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <Badge variant="secondary">Inside</Badge>
                            <span className="text-muted-foreground">
                              {elapsedSince(visit.checkIn!)}
                            </span>
                          </div>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 w-fit gap-1.5 px-2 text-xs"
                        onClick={() => setExpandedId(isExpanded ? null : visit.id)}
                      >
                        {isExpanded ? "Hide pass" : "View pass"}
                      </Button>
                      {isExpanded && (
                        <div className="mt-3">
                          <VisitorPass
                            name={visit.name}
                            date={visit.date}
                            time={visit.expectedTime}
                            code={visit.passCode}
                            status={
                              dStatus === "pending_approval"
                                ? "expected"
                                : dStatus === "expired"
                                  ? "expired"
                                  : visit.status
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!denyTargetId} onOpenChange={(o) => !o && setDenyTargetId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Deny entry</DialogTitle>
            <DialogDescription>Provide a reason for denial.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="deny-reason">Reason</Label>
            <Textarea
              id="deny-reason"
              value={denyReason}
              onChange={(e) => setDenyReason(e.target.value)}
              placeholder="Reason for denying entry"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDenyTargetId(null);
                setDenyReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!denyReason.trim()}
              onClick={() => {
                if (denyTargetId) handleDeny(denyTargetId);
              }}
            >
              Deny
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={blockOpen} onOpenChange={setBlockOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Block visitor</DialogTitle>
            <DialogDescription>
              Prevent this visitor from entering without manual override.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="block-reason">Reason</Label>
              <Textarea
                id="block-reason"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Why is this visitor blocked?"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={!blockReason.trim()} onClick={handleBlock}>
              Block visitor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import * as React from "react";
import { BadgeCheck, BadgeX, CalendarDays, IndianRupee, Phone, Plus, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

import { StaffTable } from "@/components/staffTable";
import { AddStaffForm } from "@/components/staff/addStaffForm";
import {
  getStaffAttendance,
  staffMembers as staffMembersSource,
  totalMonthlyStaffCost,
  type EditStaffInput,
  type StaffMember,
  type StaffStatus,
} from "@/lib/staffMockData";
import { useAuth } from "@/hooks/useAuth";
import {
  avatarUrlForName,
  formatCurrency,
  formatDateTime,
  getInitials,
  gradientForName,
} from "@/lib/utils";
import { PermissionDenied } from "@/components/permissionDenied";
import { useToast } from "@/components/ui/toast";
import { PageIcon } from "@/components/pageIcon";
import { CountUp } from "@/components/countUp";

const STATUS_LABEL: Record<StaffStatus, string> = {
  active: "Active",
  on_leave: "On leave",
  inactive: "Inactive",
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

const STATUS_VARIANT: Record<StaffStatus, "default" | "secondary" | "outline"> = {
  active: "default",
  on_leave: "secondary",
  inactive: "outline",
};

export default function StaffPage() {
  const { toast } = useToast();
  const { has } = useAuth();
  const [staff, setStaff] = React.useState<StaffMember[]>(() => [...staffMembersSource]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [addOpen, setAddOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);

  const selected = React.useMemo(
    () => staff.find((s) => s.id === selectedId) ?? null,
    [staff, selectedId],
  );
  const attendance = React.useMemo(
    () => (selected ? getStaffAttendance(selected.id) : []),
    [selected],
  );

  const canManage = has("StaffManage");

  const headcount = staff.filter((s) => s.status !== "inactive").length;
  const onLeaveCount = staff.filter((s) => s.status === "on_leave").length;
  const monthlyCost = totalMonthlyStaffCost(staff);

  function handleAdd(values: EditStaffInput) {
    const member: StaffMember = { id: `stf-${Date.now()}`, ...values };
    staffMembersSource.push(member);
    setStaff((prev) => [...prev, member]);
    setAddOpen(false);
    toast({ title: "Staff member added" });
  }

  function handleEdit(values: EditStaffInput) {
    if (!selected) return;
    const idx = staffMembersSource.findIndex((s) => s.id === selected.id);
    if (idx !== -1) {
      staffMembersSource[idx] = { ...staffMembersSource[idx], ...values };
    }
    setStaff((prev) => prev.map((s) => (s.id === selected.id ? { ...s, ...values } : s)));
    setEditOpen(false);
    toast({ title: "Staff member updated" });
  }

  if (!has("StaffManage") && !has("StaffViewAttendance")) {
    return <PermissionDenied message="You do not have permission to view staff." />;
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <h1 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
          <PageIcon />
          Staff
        </h1>
        <p className="text-sm text-muted-foreground">
          Society-employed security, housekeeping, and maintenance workforce.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-xs text-muted-foreground">Headcount</p>
            <Users className="size-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-2xl font-semibold tabular-nums text-foreground">
              <CountUp value={headcount} />
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-xs text-muted-foreground">Monthly staff cost</p>
            <IndianRupee className="size-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-2xl font-semibold tabular-nums text-foreground">
              <CountUp value={monthlyCost} format={formatCurrency} />
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-xs text-muted-foreground">On leave</p>
            <CalendarDays className="size-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-2xl font-semibold tabular-nums text-foreground">
              <CountUp value={onLeaveCount} />
            </p>
          </CardContent>
        </Card>
      </div>

      <StaffTable
        data={staff}
        onRowClick={(row) => {
          setSelectedId(row.id);
          setDetailOpen(true);
        }}
        toolbarActions={
          canManage ? (
            <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
              <Plus className="size-3.5" />
              Add Staff
            </Button>
          ) : undefined
        }
      />

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add staff</DialogTitle>
            <DialogDescription>Add a new staff member to the roster.</DialogDescription>
          </DialogHeader>
          <AddStaffForm
            key={String(addOpen)}
            onSave={handleAdd}
            onCancel={() => setAddOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit staff</DialogTitle>
            <DialogDescription>Update this staff member's record.</DialogDescription>
          </DialogHeader>
          {selected && (
            <AddStaffForm
              key={String(editOpen)}
              staff={selected}
              onSave={handleEdit}
              onCancel={() => setEditOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
          {selected && (
            <>
              <SheetHeader className="border-b border-border p-4 text-left">
                <div className="flex items-center gap-3">
                  {(() => {
                    const [from, to] = gradientForName(selected.name);
                    return (
                      <Avatar size="lg">
                        <AvatarImage src={avatarUrlForName(selected.name)} alt={selected.name} />
                        <AvatarFallback
                          className="font-medium text-white"
                          style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
                        >
                          {getInitials(selected.name)}
                        </AvatarFallback>
                      </Avatar>
                    );
                  })()}
                  <div>
                    <SheetTitle className="text-base">{selected.name}</SheetTitle>
                    <SheetDescription>{selected.role}</SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="size-3.5" />
                      Phone
                    </span>
                    <span className="font-medium text-foreground">{selected.phone}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Shift</span>
                    <span className="font-medium text-foreground">{selected.shift}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <IndianRupee className="size-3.5" />
                      Monthly wage
                    </span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(selected.monthlyWage)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Status</span>
                    <Badge variant={STATUS_VARIANT[selected.status]} className="w-fit capitalize">
                      {STATUS_LABEL[selected.status]}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Joined</span>
                    <span className="font-medium text-foreground">
                      {formatDateTime(selected.joinedOn)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">ID proof</span>
                    {selected.idProofVerified ? (
                      <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                        <BadgeCheck className="size-3.5" />
                        Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 font-medium text-muted-foreground">
                        <BadgeX className="size-3.5" />
                        Pending
                      </span>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col gap-3">
                  <h4 className="text-sm font-semibold text-foreground">
                    Recent attendance · {attendance.length}
                  </h4>
                  {attendance.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                      No attendance recorded yet.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {attendance.slice(0, 7).map((a) => (
                        <div
                          key={a.id}
                          className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                        >
                          <span className="text-foreground">{a.date}</span>
                          <span className="text-muted-foreground">
                            {a.checkInAt ? formatTime(a.checkInAt) : "—"} →{" "}
                            {a.checkOutAt ? formatTime(a.checkOutAt) : "On duty"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {canManage && (
                  <div className="flex flex-col gap-2 border-t border-border pt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => setEditOpen(true)}
                    >
                      Edit staff record
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

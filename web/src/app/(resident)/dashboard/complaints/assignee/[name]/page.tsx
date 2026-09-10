"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Mail, Phone } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ComplaintsTable, type ComplaintRow } from "@/components/complaintsTable";
import { complaints } from "@/lib/mockData";
import { users } from "@/lib/usersMockData";
import { useAuth } from "@/hooks/useAuth";
import { avatarUrlForName, getInitials } from "@/lib/utils";

function formatHours(hours: number): string {
  if (hours < 24) return `${Math.round(hours)}h`;
  return `${(hours / 24).toFixed(1)}d`;
}

export default function AssigneeDetailPage() {
  const { name: encodedName } = useParams<{ name: string }>();
  const name = decodeURIComponent(encodedName);
  const { has } = useAuth();

  if (!has("ComplaintsViewAll")) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          You do not have permission to view assignee history.
        </p>
        <Link
          href="/dashboard/helpdesk-reports"
          className="text-sm font-medium text-foreground underline"
        >
          Back to reports
        </Link>
      </div>
    );
  }

  const user = users.find((u) => u.name === name);
  const assigned = complaints.filter((c) => c.assignedTo?.name === name);
  const resolved = assigned.filter((c) => c.status === "resolved");
  const active = assigned.filter(
    (c) => c.status === "open" || c.status === "in_progress" || c.status === "escalated",
  );

  const avgResolutionHours = React.useMemo(() => {
    if (resolved.length === 0) return 0;
    const total = resolved.reduce((sum, c) => {
      if (!c.resolvedAt) return sum;
      return (
        sum +
        (new Date(c.resolvedAt).getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60)
      );
    }, 0);
    return total / resolved.length;
  }, [resolved]);

  const resolvedHistoryData: ComplaintRow[] = [...resolved].sort(
    (a, b) =>
      new Date(b.resolvedAt ?? b.createdAt).getTime() -
      new Date(a.resolvedAt ?? a.createdAt).getTime(),
  );
  const activeAssignmentsData: ComplaintRow[] = active;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <Link
        href="/dashboard/helpdesk-reports"
        className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to reports
      </Link>

      <div className="flex items-center gap-4 rounded-md border border-border bg-card p-5">
        <Avatar className="size-14">
          <AvatarImage src={avatarUrlForName(name)} alt={name} />
          <AvatarFallback className="text-lg">{getInitials(name)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-semibold text-foreground">{name}</h1>
            {user?.role && <Badge variant="outline">{user.role}</Badge>}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {user?.email && (
              <span className="inline-flex items-center gap-1">
                <Mail className="size-3" />
                {user.email}
              </span>
            )}
            {user?.phone && (
              <span className="inline-flex items-center gap-1">
                <Phone className="size-3" />
                {user.phone}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <p className="text-xs text-muted-foreground">Total assigned</p>
            <CardTitle className="text-2xl tabular-nums">{assigned.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-xs text-muted-foreground">Resolved</p>
            <CardTitle className="text-2xl tabular-nums">{resolved.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-xs text-muted-foreground">Active</p>
            <CardTitle className="text-2xl tabular-nums">{active.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-xs text-muted-foreground">Avg. resolution</p>
            <CardTitle className="text-2xl tabular-nums">
              {resolved.length > 0 ? formatHours(avgResolutionHours) : "—"}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {active.length > 0 && (
        <ComplaintsTable
          data={activeAssignmentsData}
          title="Currently assigned"
          showAssignee={false}
        />
      )}

      <ComplaintsTable data={resolvedHistoryData} title="Resolved history" showAssignee={false} />
    </div>
  );
}

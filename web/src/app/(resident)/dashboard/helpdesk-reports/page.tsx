"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ComplaintStatusChart } from "@/components/complaintStatusChart";
import { ComplaintCategoryChart } from "@/components/complaintCategoryChart";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { complaints, type ComplaintStatus } from "@/lib/mockData";
import { slaRules } from "@/lib/helpdeskSettingsMockData";
import { useAuth } from "@/hooks/useAuth";
import { avatarUrlForName, getInitials } from "@/lib/utils";
import { PermissionDenied } from "@/components/permissionDenied";
import { PageIcon } from "@/components/pageIcon";

function formatHours(hours: number): string {
  if (hours < 24) return `${Math.round(hours)}h`;
  const days = hours / 24;
  return `${days.toFixed(1)}d`;
}

export default function HelpdeskReportsPage() {
  const { has } = useAuth();
  const router = useRouter();

  const total = complaints.length;
  const openCount = complaints.filter((c) => c.status === "open").length;
  const resolved = complaints.filter((c) => c.status === "resolved");
  const resolvedCount = resolved.length;
  const percentResolved = total > 0 ? Math.round((resolvedCount / total) * 100) : 0;

  const avgResolutionHours = React.useMemo(() => {
    if (resolved.length === 0) return 0;
    const totalHours = resolved.reduce((sum, c) => {
      if (!c.resolvedAt) return sum;
      const created = new Date(c.createdAt).getTime();
      const resolvedAt = new Date(c.resolvedAt).getTime();
      return sum + (resolvedAt - created) / (1000 * 60 * 60);
    }, 0);
    return totalHours / resolved.length;
  }, [resolved]);

  const slaCompliance = React.useMemo(() => {
    if (resolved.length === 0) return null;
    const compliant = resolved.filter((c) => {
      const rule = slaRules.find((r) => r.priority === c.priority);
      if (!rule || !c.resolvedAt) return false;
      const hours =
        (new Date(c.resolvedAt).getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60);
      return hours <= rule.resolveWithinHours;
    }).length;
    return Math.round((compliant / resolved.length) * 100);
  }, [resolved]);

  const statusBreakdown = React.useMemo(() => {
    const map = new Map<ComplaintStatus, number>();
    complaints.forEach((c) => map.set(c.status, (map.get(c.status) ?? 0) + 1));
    return Array.from(map.entries()).map(([status, count]) => ({ status, count }));
  }, []);

  const monthlyData = React.useMemo(() => {
    const months: { label: string; raised: number; resolved: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString("en-IN", { month: "short" });
      const year = d.getFullYear();
      const month = d.getMonth();
      const raised = complaints.filter((c) => {
        const cd = new Date(c.createdAt);
        return cd.getFullYear() === year && cd.getMonth() === month;
      }).length;
      const resolvedInMonth = complaints.filter((c) => {
        if (!c.resolvedAt) return false;
        const rd = new Date(c.resolvedAt);
        return rd.getFullYear() === year && rd.getMonth() === month;
      }).length;
      months.push({ label, raised, resolved: resolvedInMonth });
    }
    return months;
  }, []);

  const monthlyConfig: ChartConfig = {
    raised: { label: "Raised", color: "#3b82f6" },
    resolved: { label: "Resolved", color: "#10b981" },
  };

  const topAssignees = React.useMemo(() => {
    const map = new Map<string, { name: string; initials: string; count: number }>();
    complaints.forEach((c) => {
      if (c.status === "resolved" && c.assignedTo) {
        const key = c.assignedTo.name;
        const existing = map.get(key);
        if (existing) existing.count += 1;
        else map.set(key, { name: c.assignedTo.name, initials: c.assignedTo.initials, count: 1 });
      }
    });
    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, []);

  if (!has("ComplaintsViewAll")) {
    return <PermissionDenied message="You do not have permission to view helpdesk reports." />;
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <h1 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
          <PageIcon />
          Helpdesk Reports
        </h1>
        <p className="text-sm text-muted-foreground">Society-wide complaint analytics.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <p className="text-xs text-muted-foreground">Total complaints</p>
            <CardTitle className="text-2xl tabular-nums">{total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-xs text-muted-foreground">Open</p>
            <CardTitle className="text-2xl tabular-nums">{openCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-xs text-muted-foreground">Avg. resolution</p>
            <CardTitle className="text-2xl tabular-nums">
              {resolvedCount > 0 ? formatHours(avgResolutionHours) : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">{resolvedCount} resolved</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-xs text-muted-foreground">% resolved</p>
            <CardTitle className="text-2xl tabular-nums">{percentResolved}%</CardTitle>
          </CardHeader>
        </Card>
        {slaCompliance !== null && (
          <Card>
            <CardHeader className="pb-2">
              <p className="text-xs text-muted-foreground">SLA compliance</p>
              <CardTitle className="text-2xl tabular-nums">{slaCompliance}%</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">Within target</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ComplaintStatusChart data={statusBreakdown} subtitle="All complaints" />
        <ComplaintCategoryChart subtitle="All complaints" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col overflow-hidden rounded-md border border-border bg-card">
          <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-semibold text-foreground">Monthly trend</h3>
              <p className="text-xs text-muted-foreground">Raised vs. resolved — last 6 months</p>
            </div>
          </div>
          <div className="flex flex-1 flex-col px-2 py-4">
            <ChartContainer config={monthlyConfig} className="h-64 w-full">
              <BarChart
                data={monthlyData}
                barGap={4}
                margin={{ left: 8, right: 8, top: 8, bottom: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={11}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={11}
                  allowDecimals={false}
                  width={28}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="raised"
                  fill="var(--color-raised)"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={24}
                />
                <Bar
                  dataKey="resolved"
                  fill="var(--color-resolved)"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={24}
                />
              </BarChart>
            </ChartContainer>
          </div>
        </div>

        <div className="flex flex-col overflow-hidden rounded-md border border-border bg-card">
          <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-semibold text-foreground">Top assignees</h3>
              <p className="text-xs text-muted-foreground">By resolved tickets</p>
            </div>
            <Badge variant="secondary" className="text-[11px]">
              {topAssignees.length} assignees
            </Badge>
          </div>
          <div className="flex flex-1 flex-col">
            {topAssignees.length === 0 ? (
              <div className="flex flex-1 items-center justify-center p-6 text-sm text-muted-foreground">
                No resolved tickets yet.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="h-8 px-4 text-xs">Assignee</TableHead>
                    <TableHead className="h-8 px-4 text-right text-xs">Resolved</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topAssignees.map((a) => (
                    <TableRow
                      key={a.name}
                      className="cursor-pointer hover:bg-muted/40"
                      onClick={() =>
                        router.push(`/dashboard/complaints/assignee/${encodeURIComponent(a.name)}`)
                      }
                    >
                      <TableCell className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <Avatar size="sm">
                            <AvatarImage src={avatarUrlForName(a.name)} alt={a.name} />
                            <AvatarFallback className="text-[10px]">{a.initials}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-foreground">{a.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-2 text-right text-sm tabular-nums text-foreground">
                        {a.count}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import type { SocietyResponse } from "@shared/index";
import { AlertCircle, Building2, IndianRupee } from "lucide-react";

import { ComplaintsTable } from "@/components/complaintsTable";
import { ComplaintStatusChart } from "@/components/complaintStatusChart";
import { SocietyGrowthChart } from "@/components/societyGrowthChart";
import { getSocietiesRequest } from "@/lib/societyApi";
import {
  platformComplaintStatusBreakdown,
  platformComplaints,
  platformStats,
} from "@/lib/platformMockData";
import { useAuth } from "@/hooks/useAuth";

function rupees(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "default" | "destructive";
}) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon className="size-3.5" />
        </span>
      </div>
      <span
        className={
          tone === "destructive"
            ? "text-xl font-semibold tabular-nums text-red-600 dark:text-red-400"
            : "text-xl font-semibold tabular-nums text-foreground"
        }
      >
        {value}
      </span>
    </div>
  );
}

export default function PlatformOverviewPage() {
  const { token } = useAuth();
  const [societies, setSocieties] = React.useState<SocietyResponse[] | null>(null);

  React.useEffect(() => {
    if (!token) return;
    getSocietiesRequest(token)
      .then(setSocieties)
      .catch(() => setSocieties([]));
  }, [token]);

  const activeSocieties =
    societies?.filter((s) => s.isActive).length ?? platformStats.activeSocieties;
  const totalSocieties = societies?.length ?? platformStats.totalSocieties;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Overview</h1>
        <p className="text-sm text-muted-foreground">
          Platform-wide activity across every society.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total societies" value={String(totalSocieties)} icon={Building2} />
        <StatCard label="Active societies" value={String(activeSocieties)} icon={Building2} />
        <StatCard
          label="Open complaints"
          value={String(platformStats.openComplaints)}
          icon={AlertCircle}
          tone="destructive"
        />
        <StatCard
          label="Monthly revenue"
          value={rupees(platformStats.monthlyRevenue)}
          icon={IndianRupee}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <SocietyGrowthChart />
        <ComplaintStatusChart
          data={platformComplaintStatusBreakdown}
          subtitle="Across all societies"
        />
      </div>

      <ComplaintsTable
        data={platformComplaints}
        title="Recent escalations"
        showSociety
        showAssignee={false}
        compact
      />
    </div>
  );
}

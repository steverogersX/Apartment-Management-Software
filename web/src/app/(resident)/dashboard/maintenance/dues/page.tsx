"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, IndianRupee, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { MaintenanceDuesTable, type DuesRow } from "@/components/maintenanceDuesTable";
import {
  getFlatMaintenanceDues,
  societyCollectionSummary,
  type FlatMaintenanceDue,
} from "@/lib/maintenanceMockData";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from "@/lib/utils";
import { PermissionDenied } from "@/components/permissionDenied";
import { PageIcon } from "@/components/pageIcon";
import { CountUp } from "@/components/countUp";

export default function MaintenanceDuesPage() {
  const router = useRouter();
  const { has } = useAuth();
  const [dues] = React.useState<FlatMaintenanceDue[]>(getFlatMaintenanceDues);

  const summary = React.useMemo(() => societyCollectionSummary(dues), [dues]);

  function handleRowClick(row: DuesRow) {
    router.push(`/dashboard/maintenance/dues/${row.tower}-${row.flatNumber}`);
  }

  if (!has("MaintenanceViewAll")) {
    return <PermissionDenied message="You do not have permission to view maintenance dues." />;
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <h1 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
          <PageIcon />
          Maintenance Dues
        </h1>
        <p className="text-sm text-muted-foreground">
          Every flat's maintenance charge — due date, payment status, and when/how it was paid.
          Click a flat for its full ledger.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-xs text-muted-foreground">Total billed</p>
            <IndianRupee className="size-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-2xl font-semibold tabular-nums text-foreground">
              <CountUp value={summary.totalBilled} format={formatCurrency} />
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-xs text-muted-foreground">Collected</p>
            <TrendingUp className="size-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-2xl font-semibold tabular-nums text-foreground">
              <CountUp value={summary.totalCollected} format={formatCurrency} />
            </p>
            <p className="text-xs text-muted-foreground">
              {summary.collectionRate}% collection rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-xs text-muted-foreground">Outstanding</p>
            <IndianRupee className="size-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-2xl font-semibold tabular-nums text-foreground">
              <CountUp value={summary.totalOutstanding} format={formatCurrency} />
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-xs text-muted-foreground">Defaulter flats</p>
            <AlertTriangle className="size-3.5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-2xl font-semibold tabular-nums text-foreground">
              <CountUp value={summary.defaulterFlats} />
            </p>
          </CardContent>
        </Card>
      </div>

      <MaintenanceDuesTable data={dues} title="All flats" onRowClick={handleRowClick} />
    </div>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, IndianRupee } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { MaintenanceDuesTable } from "@/components/maintenanceDuesTable";
import { MaintenanceTable, type MaintenanceRow } from "@/components/maintenanceTable";
import { RecordPaymentForm } from "@/components/dues/recordPaymentForm";
import {
  duesForFlat,
  maintenanceLogForFlat,
  type FlatMaintenanceDue,
  type MaintenancePaymentStatus,
} from "@/lib/maintenanceMockData";
import { recordInvoicePayment } from "@/lib/billing";
import type { RecordPaymentInput } from "@/lib/duesMockData";
import { invoices } from "@/lib/invoicingMockData";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PermissionDenied } from "@/components/permissionDenied";
import { useToast } from "@/components/ui/toast";

const STATUS_LABEL: Record<MaintenancePaymentStatus, string> = {
  paid: "Paid",
  pending: "Pending",
  overdue: "Overdue",
};

const STATUS_VARIANT: Record<MaintenancePaymentStatus, "default" | "secondary" | "destructive"> = {
  paid: "default",
  pending: "secondary",
  overdue: "destructive",
};

export default function FlatMaintenanceDuesPage() {
  const { toast } = useToast();
  const { has, user } = useAuth();
  const params = useParams<{ flatId: string }>();
  const [tower, flatNumber] = decodeURIComponent(params.flatId).split("-");

  const [dues, setDues] = React.useState<FlatMaintenanceDue[]>(() =>
    duesForFlat(tower, flatNumber),
  );
  const [payTarget, setPayTarget] = React.useState<FlatMaintenanceDue | null>(null);

  const activity = React.useMemo(
    () => maintenanceLogForFlat(tower, flatNumber),
    [tower, flatNumber],
  );

  const canManage = has("MaintenanceManage");
  const outstanding = dues.filter((d) => d.status !== "paid");
  const latest = dues[0] ?? null;

  const payInvoice = payTarget ? invoices.find((i) => i.id === payTarget.invoiceId) : undefined;

  function handleRecordPayment(values: RecordPaymentInput) {
    if (!payInvoice) return;
    recordInvoicePayment(payInvoice, values, user?.displayName ?? "Unknown");
    setDues(duesForFlat(tower, flatNumber));
    setPayTarget(null);
    toast({ title: "Payment recorded" });
  }

  if (!has("MaintenanceViewAll")) {
    return <PermissionDenied message="You do not have permission to view maintenance dues." />;
  }

  if (!tower || !flatNumber || dues.length === 0) {
    return (
      <PermissionDenied
        message="No maintenance records found for this flat."
        backHref="/dashboard/maintenance/dues"
        backLabel="Back to Maintenance Dues"
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <Link
        href="/dashboard/maintenance/dues"
        className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to Maintenance Dues
      </Link>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                {tower}-{flatNumber}
              </h1>
              {latest && (
                <Badge variant={STATUS_VARIANT[latest.status]} className="capitalize">
                  {STATUS_LABEL[latest.status]}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{latest?.ownerName}</p>
          </div>
          {latest && (
            <div className="flex items-center gap-1.5">
              <IndianRupee className="size-4 text-muted-foreground" />
              <span className="text-xl font-semibold tabular-nums text-foreground">
                {formatCurrency(latest.amount)}
              </span>
              <span className="text-xs text-muted-foreground">/ {latest.period}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {canManage && outstanding.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-foreground">Outstanding periods</h3>
          <div className="flex flex-col gap-2">
            {outstanding.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">{d.period}</span>
                  <span className="text-xs text-muted-foreground">Due {formatDate(d.dueDate)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="tabular-nums text-foreground">{formatCurrency(d.amount)}</span>
                  <Badge variant={STATUS_VARIANT[d.status]} className="capitalize">
                    {STATUS_LABEL[d.status]}
                  </Badge>
                  <Button size="sm" onClick={() => setPayTarget(d)}>
                    Record payment
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <MaintenanceDuesTable data={dues} title="Full payment history" showFlat={false} />

      <MaintenanceTable
        data={activity as MaintenanceRow[]}
        title="Maintenance activity for this flat"
        showPageSize
      />

      <Dialog open={!!payTarget} onOpenChange={(o) => !o && setPayTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record payment</DialogTitle>
            <DialogDescription>
              {payTarget && `${tower}-${flatNumber} · ${payTarget.period}`}
            </DialogDescription>
          </DialogHeader>
          {payTarget && payInvoice && (
            <RecordPaymentForm
              key={payTarget.id}
              invoice={payInvoice}
              onSave={handleRecordPayment}
              onCancel={() => setPayTarget(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

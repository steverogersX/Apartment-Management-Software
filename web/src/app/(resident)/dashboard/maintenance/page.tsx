"use client";

import * as React from "react";
import { CalendarDays, IndianRupee } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { MaintenanceDuesTable } from "@/components/maintenanceDuesTable";
import { MaintenanceTable } from "@/components/maintenanceTable";
import {
  duesForFlat,
  maintenanceLogForFlat,
  type MaintenancePaymentStatus,
} from "@/lib/maintenanceMockData";
import { formatCurrency, formatDate } from "@/lib/utils";

const CURRENT_RESIDENT = { name: "Padma Konkonapala", tower: "B", flatNumber: "304" };

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

export default function MaintenancePage() {
  const dues = React.useMemo(
    () => duesForFlat(CURRENT_RESIDENT.tower, CURRENT_RESIDENT.flatNumber),
    [],
  );
  const activity = React.useMemo(
    () => maintenanceLogForFlat(CURRENT_RESIDENT.tower, CURRENT_RESIDENT.flatNumber),
    [],
  );

  const current = dues[0] ?? null;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">My Maintenance</h1>
        <p className="text-sm text-muted-foreground">
          Maintenance dues and work history for Flat {CURRENT_RESIDENT.flatNumber}.
        </p>
      </div>

      {current && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-xs text-muted-foreground">Current period — {current.period}</p>
            <Badge variant={STATUS_VARIANT[current.status]} className="capitalize">
              {STATUS_LABEL[current.status]}
            </Badge>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-6 pt-0">
            <div className="flex items-center gap-1.5">
              <IndianRupee className="size-3.5 text-muted-foreground" />
              <span className="text-xl font-semibold tabular-nums text-foreground">
                {formatCurrency(current.amount)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarDays className="size-3.5" />
              Due {formatDate(current.dueDate)}
            </div>
            {current.paidDate && (
              <span className="text-sm text-muted-foreground">
                Paid {formatDate(current.paidDate)} · {current.paidMode} · {current.receiptNumber}
              </span>
            )}
          </CardContent>
        </Card>
      )}

      <MaintenanceDuesTable data={dues} title="Payment history" showFlat={false} />

      <MaintenanceTable data={activity} title="Maintenance activity for this flat" />
    </div>
  );
}

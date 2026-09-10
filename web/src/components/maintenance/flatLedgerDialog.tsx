"use client";

import * as React from "react";
import { Download } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  chargesToCsv,
  downloadCsv,
  flatChargeBadgeClass,
  flatChargeLabel,
  formatCurrency,
  formatDate,
} from "@/components/maintenance/cycleBreakdownDialog";
import { getLedgerByFlat, maintenanceHistory, type FlatCharge } from "@/lib/maintenanceMockData";

type TimelineRow = {
  monthKey: string;
  monthLabel: string;
  charge: FlatCharge | null;
};

const timelineMonths = [...maintenanceHistory]
  .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
  .map((cycle) => ({ monthKey: cycle.monthKey, monthLabel: cycle.monthLabel }));

export function FlatLedgerDialog({
  flat,
  open,
  onOpenChange,
}: {
  flat: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const ledger = React.useMemo(() => (flat ? getLedgerByFlat(flat) : []), [flat]);

  const rows = React.useMemo<TimelineRow[]>(
    () =>
      timelineMonths.map((month) => ({
        ...month,
        charge: ledger.find((entry) => entry.monthKey === month.monthKey) ?? null,
      })),
    [ledger],
  );

  const totals = React.useMemo(() => {
    const due = ledger.reduce((sum, entry) => sum + entry.amountDue, 0);
    const paid = ledger.reduce((sum, entry) => sum + entry.amountPaid, 0);
    return { due, paid, balance: due - paid };
  }, [ledger]);

  const identity = ledger[0];

  function handleDownload() {
    if (!flat) return;
    downloadCsv(`maintenance-ledger-${flat.toLowerCase()}.csv`, chargesToCsv(ledger));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{flat ? `Flat ${flat} ledger` : "Flat ledger"}</DialogTitle>
          <DialogDescription>
            {identity
              ? `${identity.owner} · Tower ${identity.tower} · Month-by-month dues since Oct 2025`
              : "Month-by-month dues for this flat."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col gap-0.5 rounded-lg border bg-card px-3 py-2.5">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Total due
              </span>
              <span className="text-sm font-semibold text-foreground">
                {formatCurrency(totals.due)}
              </span>
            </div>
            <div className="flex flex-col gap-0.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 dark:border-emerald-900 dark:bg-emerald-950/30">
              <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                Total paid
              </span>
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                {formatCurrency(totals.paid)}
              </span>
            </div>
            <div className="flex flex-col gap-0.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-900 dark:bg-amber-950/30">
              <span className="text-[11px] font-medium uppercase tracking-wider text-amber-700 dark:text-amber-300">
                Balance
              </span>
              <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                {formatCurrency(totals.balance)}
              </span>
            </div>
          </div>
          <div className="overflow-hidden rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Month</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Paid On</TableHead>
                  <TableHead>Paid Via</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.monthKey}>
                    <TableCell className="font-medium text-foreground">{row.monthLabel}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-foreground">
                      {row.charge ? formatCurrency(row.charge.amountDue) : "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {row.charge ? formatCurrency(row.charge.amountPaid) : "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm font-medium text-foreground">
                      {row.charge ? formatCurrency(row.charge.balance) : "—"}
                    </TableCell>
                    <TableCell>
                      {row.charge ? (
                        <Badge
                          variant="outline"
                          className={flatChargeBadgeClass[row.charge.status]}
                        >
                          {flatChargeLabel[row.charge.status]}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Not billed</Badge>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {row.charge?.paidOn ? formatDate(row.charge.paidOn) : "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {row.charge?.paidVia ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleDownload}>
              <Download className="size-3.5" />
              Download statement
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

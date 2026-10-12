"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";

import { useBreadcrumbTitle } from "@/components/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { paymentDetails } from "@/lib/billingSettingsMockData";
import { flats } from "@/lib/flatsMockData";
import { residents } from "@/lib/residentsMockData";
import { society } from "@/lib/mockData";
import {
  computeInvoiceTotals,
  computeOutstandingBalance,
  getDisplayStatus,
  invoices,
  isOverdue,
  type Invoice,
} from "@/lib/invoicingMockData";
import { receipts, type RecordPaymentInput } from "@/lib/duesMockData";
import { createVoucher } from "@/lib/vouchersMockData";
import { RecordPaymentForm } from "@/components/dues/recordPaymentForm";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { recordAudit } from "@/lib/auditLog";
import { PermissionDenied } from "@/components/permissionDenied";
import { useToast } from "@/components/ui/toast";

export default function InvoiceDetailPage() {
  const { toast } = useToast();
  const params = useParams<{ invoiceId: string }>();
  const { user, has } = useAuth();
  const actor = user?.displayName ?? "Unknown";
  const canManageInvoices = has("InvoicingManage");
  const canRecordPayment = has("DuesReceiptsManage");
  const initial = React.useMemo(
    () => invoices.find((inv) => inv.id === params.invoiceId) ?? null,
    [params.invoiceId],
  );
  const [invoice, setInvoice] = React.useState<Invoice | null>(initial);
  const [lateOpen, setLateOpen] = React.useState(false);
  const [lateAmount, setLateAmount] = React.useState(500);
  const [lateDesc, setLateDesc] = React.useState("Late fee");
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState("");
  const [paymentOpen, setPaymentOpen] = React.useState(false);
  const [invoiceReceipts, setInvoiceReceipts] = React.useState(() =>
    receipts.filter((r) => r.invoiceId === params.invoiceId),
  );

  React.useEffect(() => {
    setInvoice(initial);
  }, [initial]);

  React.useEffect(() => {
    setInvoiceReceipts(receipts.filter((r) => r.invoiceId === params.invoiceId));
  }, [params.invoiceId]);

  useBreadcrumbTitle(invoice?.invoiceNumber ?? null);

  if (!has("InvoicingViewAll")) {
    return <PermissionDenied message="You do not have permission to view invoices." />;
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-sm text-muted-foreground">Invoice not found.</p>
        <Link
          href="/dashboard/accounts/invoicing"
          className="text-sm font-medium text-foreground underline"
        >
          Back to Invoicing
        </Link>
      </div>
    );
  }

  const totals = computeInvoiceTotals(invoice);
  const displayStatus = getDisplayStatus(invoice);
  const overdue = isOverdue(invoice);
  const flat = flats.find((f) => f.id === invoice.flatId);
  const flatLabel = flat ? `${flat.tower}-${flat.flatNumber}` : invoice.flatId;
  const residentNames = flat
    ? flat.currentResidentIds
        .map((id) => residents.find((r) => r.id === id)?.name)
        .filter(Boolean)
        .join(", ") || "—"
    : "—";

  function syncState(next: Invoice) {
    const idx = invoices.findIndex((inv) => inv.id === next.id);
    if (idx !== -1) invoices[idx] = { ...next };
    setInvoice({ ...next });
  }

  function handleRecordPayment(values: RecordPaymentInput) {
    if (!invoice) return;
    const total = computeInvoiceTotals(invoice).total;
    const newAmountPaid = Math.min(total, invoice.amountPaid + values.amount);
    const isFullyPaid = newAmountPaid >= total;
    const next: Invoice = {
      ...invoice,
      amountPaid: newAmountPaid,
      status: isFullyPaid ? ("Paid" as const) : ("Partially Paid" as const),
      paidOn: isFullyPaid ? values.paymentDate : null,
    };
    const receipt = {
      id: crypto.randomUUID(),
      receiptNumber: `RCP-${new Date(values.paymentDate).getFullYear()}-${String(receipts.length + 1).padStart(4, "0")}`,
      invoiceId: invoice.id,
      flatId: invoice.flatId,
      amount: values.amount,
      paymentMode: values.paymentMode,
      paymentDate: values.paymentDate,
      remarks: values.remarks || null,
      recordedBy: actor,
    };
    receipts.push(receipt as any);
    setInvoiceReceipts((prev) => [...prev, receipt as any]);
    syncState(next);
    recordAudit({
      module: "Invoicing",
      entityType: "Invoice",
      entityId: invoice.id,
      entityLabel: invoice.invoiceNumber,
      action: "Payment Recorded",
      performedBy: actor,
      details: `${formatCurrency(values.amount)} via ${values.paymentMode} → ${next.status}`,
    });
    const voucher = createVoucher({
      type: "Receipt",
      date: values.paymentDate,
      narration: `Payment received for ${invoice.invoiceNumber}`,
      debitAccountId: values.paymentMode === "Cash" ? "la-cash" : "la-bank",
      creditAccountId: "la-maint-inc",
      amount: values.amount,
      status: "Posted",
      sourceModule: "Dues and Receipts",
      sourceRefId: receipt.id,
      createdBy: actor,
      postedBy: actor,
      postedAt: values.paymentDate,
    });
    recordAudit({
      module: "Vouchers",
      entityType: "Voucher",
      entityId: voucher.id,
      entityLabel: voucher.voucherNumber,
      action: "Create",
      performedBy: actor,
      details: `Auto-generated from receipt ${receipt.receiptNumber}`,
    });
    if (isFullyPaid && flat) {
      const fIdx = flats.findIndex((f) => f.id === flat.id);
      if (fIdx !== -1) flats[fIdx].maintenanceStatus = "paid";
    }
    setPaymentOpen(false);
    toast({ title: "Payment recorded" });
  }

  function handleAddLateFee() {
    if (!invoice || !overdue) return;
    const next: Invoice = {
      ...invoice,
      lineItems: [
        ...invoice.lineItems,
        {
          type: "Late Fee",
          description: lateDesc || "Late fee",
          amount: lateAmount,
          taxable: false,
        },
      ],
    };
    syncState(next);
    recordAudit({
      module: "Invoicing",
      entityType: "Invoice",
      entityId: invoice.id,
      entityLabel: invoice.invoiceNumber,
      action: "Update",
      performedBy: actor,
      details: `Late fee ${formatCurrency(lateAmount)} added`,
    });
    setLateOpen(false);
    setLateAmount(500);
    setLateDesc("Late fee");
    toast({ title: "Late fee added" });
  }

  function handleReminder() {
    if (!invoice || invoice.status === "Paid" || invoice.status === "Cancelled") return;
    const next: Invoice = {
      ...invoice,
      remindersSent: invoice.remindersSent + 1,
      lastReminderAt: new Date().toISOString(),
    };
    syncState(next);
    recordAudit({
      module: "Invoicing",
      entityType: "Invoice",
      entityId: invoice.id,
      entityLabel: invoice.invoiceNumber,
      action: "Update",
      performedBy: actor,
      details: `Reminder #${next.remindersSent} sent`,
    });
    toast({ title: "Reminder sent" });
  }

  function handleCancel() {
    if (!invoice || invoice.status === "Paid" || invoice.status === "Cancelled") return;
    if (!cancelReason.trim()) return;
    const next: Invoice = {
      ...invoice,
      status: "Cancelled" as const,
      cancelledReason: cancelReason.trim(),
      cancelledBy: actor,
    };
    syncState(next);
    recordAudit({
      module: "Invoicing",
      entityType: "Invoice",
      entityId: invoice.id,
      entityLabel: invoice.invoiceNumber,
      action: "Cancel",
      performedBy: actor,
      details: cancelReason.trim(),
    });
    setCancelOpen(false);
    setCancelReason("");
    toast({ title: "Invoice cancelled", variant: "info" });
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5">
      <Link
        href="/dashboard/accounts/invoicing"
        className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground print:hidden"
      >
        <ArrowLeft className="size-3.5" />
        Back to Invoicing
      </Link>

      <div className="flex flex-wrap gap-2 print:hidden">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.print()}>
          <Printer className="size-3.5" />
          Print
        </Button>
        {canRecordPayment && invoice.status !== "Paid" && invoice.status !== "Cancelled" && (
          <Button size="sm" onClick={() => setPaymentOpen(true)}>
            Record Payment
          </Button>
        )}
        {canManageInvoices &&
          new Date(invoice.dueDate).getTime() < Date.now() &&
          invoice.status !== "Paid" &&
          invoice.status !== "Cancelled" &&
          invoice.status !== "Draft" && (
            <Button variant="outline" size="sm" onClick={() => setLateOpen(true)}>
              Add Late Fee
            </Button>
          )}
        {canManageInvoices && invoice.status !== "Paid" && invoice.status !== "Cancelled" && (
          <Button variant="outline" size="sm" onClick={handleReminder}>
            Send Reminder {invoice.remindersSent > 0 ? `(${invoice.remindersSent})` : ""}
          </Button>
        )}
        {canManageInvoices && invoice.status !== "Paid" && invoice.status !== "Cancelled" && (
          <Button variant="destructive" size="sm" onClick={() => setCancelOpen(true)}>
            Cancel Invoice
          </Button>
        )}
      </div>

      <Card className="print:shadow-none">
        <CardHeader className="border-b">
          <div className="flex flex-col gap-1">
            <h1 className="text-lg font-semibold tracking-tight text-foreground">{society.name}</h1>
            <p className="text-xs text-muted-foreground">{society.location}</p>
          </div>
          <div className="mt-4 flex flex-wrap justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Invoice</span>
              <span className="text-sm font-semibold text-foreground">{invoice.invoiceNumber}</span>
              <span className="text-xs text-muted-foreground">
                {invoice.billingPeriod} · Issued {formatDate(invoice.issueDate)} · Due{" "}
                {formatDate(invoice.dueDate)}
              </span>
              <span className="text-xs text-muted-foreground">Issued by {invoice.issuedBy}</span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge
                variant={
                  displayStatus === "Overdue"
                    ? "destructive"
                    : displayStatus === "Paid"
                      ? "secondary"
                      : displayStatus === "Cancelled"
                        ? "outline"
                        : "outline"
                }
              >
                {displayStatus}
              </Badge>
              {invoice.paidOn && (
                <span className="text-xs text-muted-foreground">
                  Paid on {formatDate(invoice.paidOn)}
                </span>
              )}
              {invoice.cancelledReason && (
                <span className="max-w-[240px] text-right text-xs text-muted-foreground">
                  Reason: {invoice.cancelledReason}
                  {invoice.cancelledBy ? ` · Cancelled by ${invoice.cancelledBy}` : ""}
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                Reminders: {invoice.remindersSent}
                {invoice.lastReminderAt ? ` · Last ${formatDate(invoice.lastReminderAt)}` : ""}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Bill to
              </span>
              <span className="text-sm font-medium text-foreground">{flatLabel}</span>
              <span className="text-xs text-muted-foreground">{residentNames}</span>
              <span className="text-xs text-muted-foreground">
                {flat?.type} · {flat?.areaSqft} sqft · {flat?.tower} Tower
              </span>
            </div>
            <div className="flex flex-col gap-1 sm:items-end">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Society
              </span>
              <span className="text-sm font-medium text-foreground">{society.name}</span>
              <span className="text-xs text-muted-foreground">{society.location}</span>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Taxable</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.lineItems.map((li, idx) => (
                <TableRow key={idx}>
                  <TableCell className="text-sm text-foreground">{li.description}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{li.type}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {li.taxable ? "Yes" : "No"}
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium text-foreground">
                    {formatCurrency(li.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="ml-auto flex w-full max-w-xs flex-col gap-2 border-t pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium text-foreground">{formatCurrency(totals.subtotal)}</span>
            </div>
            {invoice.gstRate > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  GST ({Math.round(invoice.gstRate * 100)}% on taxable)
                </span>
                <span className="font-medium text-foreground">{formatCurrency(totals.gst)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2 text-base font-semibold">
              <span className="text-foreground">Total</span>
              <span className="text-foreground">{formatCurrency(totals.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paid</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                {formatCurrency(invoice.amountPaid)}
              </span>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-foreground">Outstanding</span>
              <span
                className={cn(
                  computeOutstandingBalance(invoice) > 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-foreground",
                )}
              >
                {formatCurrency(computeOutstandingBalance(invoice))}
              </span>
            </div>
            {totals.taxable > 0 && invoice.gstRate > 0 && (
              <p className="text-xs text-muted-foreground">
                Taxable amount: {formatCurrency(totals.taxable)}
              </p>
            )}
          </div>

          <div className="border-t pt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Payment details
            </p>
            <div className="grid gap-2 text-xs sm:grid-cols-2">
              <span className="text-muted-foreground">
                Bank: <span className="font-medium text-foreground">{paymentDetails.bankName}</span>
              </span>
              <span className="text-muted-foreground">
                A/c:{" "}
                <span className="font-medium text-foreground">{paymentDetails.accountNumber}</span>
              </span>
              <span className="text-muted-foreground">
                IFSC: <span className="font-medium text-foreground">{paymentDetails.ifsc}</span>
              </span>
              <span className="text-muted-foreground">
                UPI: <span className="font-medium text-foreground">{paymentDetails.upiId}</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            Outstanding {formatCurrency(computeOutstandingBalance(invoice))} ·{" "}
            {invoiceReceipts.length} receipt{invoiceReceipts.length === 1 ? "" : "s"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoiceReceipts.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No payments recorded yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Recorded By</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoiceReceipts.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-sm font-medium text-foreground">
                      {r.receiptNumber}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(r.paymentDate)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{r.paymentMode}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.recordedBy}</TableCell>
                    <TableCell className="text-right text-sm font-medium text-foreground">
                      {formatCurrency(r.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Record payment</DialogTitle>
            <DialogDescription>
              Record a payment against this invoice. Partial payments are supported.
            </DialogDescription>
          </DialogHeader>
          {invoice && (
            <RecordPaymentForm
              invoice={invoice}
              onSave={handleRecordPayment}
              onCancel={() => setPaymentOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={lateOpen} onOpenChange={setLateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add late fee</DialogTitle>
            <DialogDescription>
              Append a late-fee line item to this overdue invoice.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="late-desc">Description</Label>
              <Input
                id="late-desc"
                value={lateDesc}
                onChange={(e) => setLateDesc(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="late-amount">Amount</Label>
              <Input
                id="late-amount"
                type="number"
                value={lateAmount}
                onChange={(e) => setLateAmount(e.target.value === "" ? 0 : Number(e.target.value))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddLateFee}>Add fee</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel invoice</DialogTitle>
            <DialogDescription>Provide a reason for cancelling this invoice.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cancel-reason">Reason</Label>
            <Textarea
              id="cancel-reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              Keep invoice
            </Button>
            <Button variant="destructive" disabled={!cancelReason.trim()} onClick={handleCancel}>
              Confirm cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

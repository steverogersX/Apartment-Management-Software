import { recordAudit } from "./auditLog";
import { receipts, type Receipt, type RecordPaymentInput } from "./duesMockData";
import { computeInvoiceTotals, invoices, type Invoice } from "./invoicingMockData";
import { formatCurrency } from "./utils";
import { createVoucher } from "./vouchersMockData";

/**
 * The single place a maintenance payment is recorded, whichever screen it is taken on
 * (Accounts → Invoicing or Maintenance → Dues & Payments): updates the invoice, issues the
 * receipt, posts the receipt voucher and writes the audit trail.
 */
export function recordInvoicePayment(
  invoice: Invoice,
  values: RecordPaymentInput,
  actor: string,
): { invoice: Invoice; receipt: Receipt } {
  const total = computeInvoiceTotals(invoice).total;
  const amountPaid = Math.min(total, invoice.amountPaid + values.amount);
  const isFullyPaid = amountPaid >= total;
  const next: Invoice = {
    ...invoice,
    amountPaid,
    status: isFullyPaid ? "Paid" : "Partially Paid",
    paidOn: isFullyPaid ? values.paymentDate : null,
  };
  const receipt: Receipt = {
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
  receipts.push(receipt);
  const index = invoices.findIndex((inv) => inv.id === invoice.id);
  if (index !== -1) invoices[index] = next;

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
  return { invoice: next, receipt };
}

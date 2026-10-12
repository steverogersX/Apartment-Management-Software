import { z } from "zod";

import { computeInvoiceTotals, invoices } from "./invoicingMockData";

export type PaymentMode = "Cash" | "Cheque" | "NEFT/RTGS" | "UPI" | "Card" | "Online Gateway";

export type Receipt = {
  id: string;
  receiptNumber: string;
  invoiceId: string;
  flatId: string;
  amount: number;
  paymentMode: PaymentMode;
  paymentDate: string;
  remarks: string | null;
  recordedBy: string;
};

export const recordPaymentSchema = z.object({
  amount: z.coerce.number().min(1, "Amount must be at least 1"),
  paymentMode: z.enum(["Cash", "Cheque", "NEFT/RTGS", "UPI", "Card", "Online Gateway"]),
  paymentDate: z.string().min(1, "Payment date is required"),
  remarks: z.string().optional(),
});

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;

export type AgeingBucket = "Current" | "1-30 days" | "31-60 days" | "61-90 days" | "90+ days";

export function getAgeingBucket(dueDate: string): AgeingBucket {
  const days = Math.floor((Date.now() - new Date(dueDate).getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Current";
  if (days <= 30) return "1-30 days";
  if (days <= 60) return "31-60 days";
  if (days <= 90) return "61-90 days";
  return "90+ days";
}

function receiptFor(invoiceId: string, amount: number, mode: PaymentMode, date: string): Receipt {
  const inv = invoices.find((i) => i.id === invoiceId)!;
  const recorders: Record<string, string> = {
    "inv-001": "Arvind Deshmukh",
    "inv-002": "Sunita Patil",
    "inv-003": "Rohan Mehta",
    "inv-007": "Arvind Deshmukh",
    "inv-010": "Vikram Singh Rathore",
    "inv-011": "Ananya Gupta",
    "inv-016": "Divya Reddy",
  };
  return {
    id: `rcp-${invoiceId}`,
    receiptNumber: `RCP-${date.slice(0, 7).replace("-", "")}-${invoiceId.slice(-3).toUpperCase()}`,
    invoiceId,
    flatId: inv.flatId,
    amount,
    paymentMode: mode,
    paymentDate: date,
    remarks: null,
    recordedBy: recorders[invoiceId] ?? "Suresh Iyer",
  };
}

export const receipts: Receipt[] = [
  receiptFor(
    "inv-001",
    computeInvoiceTotals(invoices.find((i) => i.id === "inv-001")!).total,
    "NEFT/RTGS",
    "2026-04-08T10:00:00+05:30",
  ),
  receiptFor(
    "inv-002",
    computeInvoiceTotals(invoices.find((i) => i.id === "inv-002")!).total,
    "UPI",
    "2026-04-09T15:30:00+05:30",
  ),
  receiptFor(
    "inv-003",
    computeInvoiceTotals(invoices.find((i) => i.id === "inv-003")!).total,
    "Cheque",
    "2026-04-10T11:00:00+05:30",
  ),
  receiptFor(
    "inv-007",
    computeInvoiceTotals(invoices.find((i) => i.id === "inv-007")!).total,
    "Online Gateway",
    "2026-05-07T12:00:00+05:30",
  ),
  receiptFor(
    "inv-010",
    computeInvoiceTotals(invoices.find((i) => i.id === "inv-010")!).total,
    "UPI",
    "2026-05-09T10:00:00+05:30",
  ),
  receiptFor(
    "inv-011",
    computeInvoiceTotals(invoices.find((i) => i.id === "inv-011")!).total,
    "Cash",
    "2026-05-11T09:00:00+05:30",
  ),
  receiptFor(
    "inv-016",
    computeInvoiceTotals(invoices.find((i) => i.id === "inv-016")!).total,
    "NEFT/RTGS",
    "2026-04-07T11:30:00+05:30",
  ),
  {
    id: "rcp-inv-006-partial",
    receiptNumber: "RCP-202604-006P",
    invoiceId: "inv-006",
    flatId: invoices.find((i) => i.id === "inv-006")!.flatId,
    amount: 3000,
    paymentMode: "UPI",
    paymentDate: "2026-04-15T10:00:00+05:30",
    remarks: "Partial payment",
    recordedBy: "Mohammed Farhan",
  },
  {
    id: "rcp-inv-009-partial",
    receiptNumber: "RCP-202605-009P",
    invoiceId: "inv-009",
    flatId: invoices.find((i) => i.id === "inv-009")!.flatId,
    amount: 2000,
    paymentMode: "Cash",
    paymentDate: "2026-05-12T11:00:00+05:30",
    remarks: "Partial payment - balance pending",
    recordedBy: "Suresh Iyer",
  },
];

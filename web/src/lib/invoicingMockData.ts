import { z } from "zod";

import { flats } from "./flatsMockData";

export type InvoiceLineItemType = "Maintenance" | "Sinking Fund" | "Parking" | "Late Fee";

export type InvoiceLineItem = {
  type: InvoiceLineItemType;
  description: string;
  amount: number;
  taxable: boolean;
};

export type InvoiceStatus = "Draft" | "Issued" | "Paid" | "Partially Paid" | "Cancelled";

export type Invoice = {
  id: string;
  invoiceNumber: string;
  flatId: string;
  billingPeriod: string;
  issueDate: string;
  dueDate: string;
  lineItems: InvoiceLineItem[];
  gstRate: number;
  status: InvoiceStatus;
  amountPaid: number;
  paidOn: string | null;
  remindersSent: number;
  lastReminderAt: string | null;
  cancelledReason: string | null;
  issuedBy: string;
  cancelledBy: string | null;
};

export function computeInvoiceTotals(invoice: Invoice) {
  const subtotal = invoice.lineItems.reduce((s, li) => s + li.amount, 0);
  const taxable = invoice.lineItems.filter((li) => li.taxable).reduce((s, li) => s + li.amount, 0);
  const gst = Math.round(taxable * invoice.gstRate);
  const total = subtotal + gst;
  return { subtotal, taxable, gst, total };
}

export function computeOutstandingBalance(invoice: Invoice) {
  return Math.max(0, computeInvoiceTotals(invoice).total - invoice.amountPaid);
}

export function isOverdue(invoice: Invoice) {
  if (invoice.status !== "Issued") return false;
  return new Date(invoice.dueDate).getTime() < Date.now();
}

export function getDisplayStatus(invoice: Invoice) {
  if (invoice.status === "Cancelled") return "Cancelled";
  if (invoice.status === "Paid") return "Paid";
  if (invoice.status === "Partially Paid") return "Partially Paid";
  if (invoice.status === "Draft") return "Draft";
  if (isOverdue(invoice)) return "Overdue";
  return "Issued";
}

export const addLineItemSchema = z.object({
  type: z.enum(["Maintenance", "Sinking Fund", "Parking", "Late Fee"]),
  description: z.string().min(2, "Description is required"),
  amount: z.coerce.number().min(1, "Amount must be at least 1"),
  taxable: z.boolean(),
});

export type AddLineItemInput = z.infer<typeof addLineItemSchema>;

export const generateInvoicesSchema = z.object({
  billingPeriod: z.string().min(2, "Billing period is required"),
  dueDate: z.string().min(1, "Due date is required"),
  maintenanceAmount: z.coerce.number().min(0, "Maintenance amount must be >= 0"),
  sinkingFundAmount: z.coerce.number().min(0).optional(),
  parkingAmount: z.coerce.number().min(0).optional(),
  gstRate: z.coerce.number().min(0).max(1).optional(),
  selectedFlatIds: z.array(z.string()).min(1, "Select at least one flat"),
});

export type GenerateInvoicesInput = z.infer<typeof generateInvoicesSchema>;

function flatId(n: number) {
  return flats[n % flats.length].id;
}

export const invoices: Invoice[] = [
  {
    id: "inv-001",
    invoiceNumber: "INV-2026-04-001",
    flatId: flatId(0),
    billingPeriod: "April 2026",
    issueDate: "2026-04-01T00:00:00+05:30",
    dueDate: "2026-04-10T00:00:00+05:30",
    lineItems: [
      {
        type: "Maintenance",
        description: "Monthly maintenance - April 2026",
        amount: 3500,
        taxable: true,
      },
      {
        type: "Sinking Fund",
        description: "Sinking fund contribution",
        amount: 500,
        taxable: false,
      },
    ],
    gstRate: 0.18,
    status: "Paid",
    amountPaid: 4630,
    paidOn: "2026-04-08T10:00:00+05:30",
    remindersSent: 0,
    lastReminderAt: null,
    cancelledReason: null,
    issuedBy: "Arvind Deshmukh",
    cancelledBy: null,
  },
  {
    id: "inv-002",
    invoiceNumber: "INV-2026-04-002",
    flatId: flatId(1),
    billingPeriod: "April 2026",
    issueDate: "2026-04-01T00:00:00+05:30",
    dueDate: "2026-04-10T00:00:00+05:30",
    lineItems: [
      {
        type: "Maintenance",
        description: "Monthly maintenance - April 2026",
        amount: 3500,
        taxable: true,
      },
    ],
    gstRate: 0.18,
    status: "Paid",
    amountPaid: 4130,
    paidOn: "2026-04-09T15:30:00+05:30",
    remindersSent: 1,
    lastReminderAt: "2026-04-05T09:00:00+05:30",
    cancelledReason: null,
    issuedBy: "Suresh Iyer",
    cancelledBy: null,
  },
  {
    id: "inv-003",
    invoiceNumber: "INV-2026-04-003",
    flatId: flatId(2),
    billingPeriod: "April 2026",
    issueDate: "2026-04-01T00:00:00+05:30",
    dueDate: "2026-04-10T00:00:00+05:30",
    lineItems: [
      {
        type: "Maintenance",
        description: "Monthly maintenance - April 2026",
        amount: 3500,
        taxable: true,
      },
      { type: "Parking", description: "Covered parking - A-12", amount: 800, taxable: true },
    ],
    gstRate: 0.18,
    status: "Paid",
    amountPaid: 5074,
    paidOn: "2026-04-10T11:00:00+05:30",
    remindersSent: 0,
    lastReminderAt: null,
    cancelledReason: null,
    issuedBy: "Anjali Desai",
    cancelledBy: null,
  },
  {
    id: "inv-004",
    invoiceNumber: "INV-2026-04-004",
    flatId: flatId(3),
    billingPeriod: "April 2026",
    issueDate: "2026-04-01T00:00:00+05:30",
    dueDate: "2026-04-10T00:00:00+05:30",
    lineItems: [
      {
        type: "Maintenance",
        description: "Monthly maintenance - April 2026",
        amount: 3500,
        taxable: true,
      },
    ],
    gstRate: 0.18,
    status: "Cancelled",
    amountPaid: 0,
    paidOn: null,
    remindersSent: 0,
    lastReminderAt: null,
    cancelledReason: "Flat vacated - billing to be adjusted",
    issuedBy: "Kavya Nair",
    cancelledBy: "Suresh Iyer",
  },
  {
    id: "inv-005",
    invoiceNumber: "INV-2026-04-005",
    flatId: flatId(4),
    billingPeriod: "April 2026",
    issueDate: "2026-04-01T00:00:00+05:30",
    dueDate: "2026-04-10T00:00:00+05:30",
    lineItems: [
      {
        type: "Maintenance",
        description: "Monthly maintenance - April 2026",
        amount: 3500,
        taxable: true,
      },
    ],
    gstRate: 0.18,
    status: "Issued",
    amountPaid: 0,
    paidOn: null,
    remindersSent: 2,
    lastReminderAt: "2026-06-15T10:00:00+05:30",
    cancelledReason: null,
    issuedBy: "Rohan Mehta",
    cancelledBy: null,
  },
  {
    id: "inv-006",
    invoiceNumber: "INV-2026-04-006",
    flatId: flatId(5),
    billingPeriod: "April 2026",
    issueDate: "2026-04-01T00:00:00+05:30",
    dueDate: "2026-04-10T00:00:00+05:30",
    lineItems: [
      {
        type: "Maintenance",
        description: "Monthly maintenance - April 2026",
        amount: 3500,
        taxable: true,
      },
      { type: "Sinking Fund", description: "Sinking fund", amount: 500, taxable: false },
      { type: "Parking", description: "Parking - B-05", amount: 800, taxable: true },
    ],
    gstRate: 0.18,
    status: "Partially Paid",
    amountPaid: 3000,
    paidOn: null,
    remindersSent: 1,
    lastReminderAt: "2026-08-01T09:30:00+05:30",
    cancelledReason: null,
    issuedBy: "Arvind Deshmukh",
    cancelledBy: null,
  },
  {
    id: "inv-007",
    invoiceNumber: "INV-2026-05-001",
    flatId: flatId(0),
    billingPeriod: "May 2026",
    issueDate: "2026-05-01T00:00:00+05:30",
    dueDate: "2026-05-10T00:00:00+05:30",
    lineItems: [
      {
        type: "Maintenance",
        description: "Monthly maintenance - May 2026",
        amount: 3600,
        taxable: true,
      },
      { type: "Sinking Fund", description: "Sinking fund", amount: 500, taxable: false },
    ],
    gstRate: 0.18,
    status: "Paid",
    amountPaid: 4830,
    paidOn: "2026-05-07T12:00:00+05:30",
    remindersSent: 0,
    lastReminderAt: null,
    cancelledReason: null,
    issuedBy: "Suresh Iyer",
    cancelledBy: null,
  },
  {
    id: "inv-008",
    invoiceNumber: "INV-2026-05-002",
    flatId: flatId(1),
    billingPeriod: "May 2026",
    issueDate: "2026-05-01T00:00:00+05:30",
    dueDate: "2026-05-10T00:00:00+05:30",
    lineItems: [
      {
        type: "Maintenance",
        description: "Monthly maintenance - May 2026",
        amount: 3600,
        taxable: true,
      },
    ],
    gstRate: 0.18,
    status: "Issued",
    amountPaid: 0,
    paidOn: null,
    remindersSent: 0,
    lastReminderAt: null,
    cancelledReason: null,
    issuedBy: "Anjali Desai",
    cancelledBy: null,
  },
  {
    id: "inv-009",
    invoiceNumber: "INV-2026-05-003",
    flatId: flatId(2),
    billingPeriod: "May 2026",
    issueDate: "2026-05-01T00:00:00+05:30",
    dueDate: "2026-05-10T00:00:00+05:30",
    lineItems: [
      {
        type: "Maintenance",
        description: "Monthly maintenance - May 2026",
        amount: 3600,
        taxable: true,
      },
    ],
    gstRate: 0.18,
    status: "Partially Paid",
    amountPaid: 2000,
    paidOn: null,
    remindersSent: 3,
    lastReminderAt: "2026-08-20T14:00:00+05:30",
    cancelledReason: null,
    issuedBy: "Kavya Nair",
    cancelledBy: null,
  },
  {
    id: "inv-010",
    invoiceNumber: "INV-2026-05-004",
    flatId: flatId(6),
    billingPeriod: "May 2026",
    issueDate: "2026-05-01T00:00:00+05:30",
    dueDate: "2026-05-10T00:00:00+05:30",
    lineItems: [
      {
        type: "Maintenance",
        description: "Monthly maintenance - May 2026",
        amount: 3600,
        taxable: true,
      },
      { type: "Parking", description: "Parking - A-28", amount: 800, taxable: true },
    ],
    gstRate: 0.18,
    status: "Paid",
    amountPaid: 5192,
    paidOn: "2026-05-09T10:00:00+05:30",
    remindersSent: 0,
    lastReminderAt: null,
    cancelledReason: null,
    issuedBy: "Rohan Mehta",
    cancelledBy: null,
  },
  {
    id: "inv-011",
    invoiceNumber: "INV-2026-05-005",
    flatId: flatId(7),
    billingPeriod: "May 2026",
    issueDate: "2026-05-01T00:00:00+05:30",
    dueDate: "2026-05-10T00:00:00+05:30",
    lineItems: [
      {
        type: "Maintenance",
        description: "Monthly maintenance - May 2026",
        amount: 3600,
        taxable: true,
      },
    ],
    gstRate: 0.18,
    status: "Paid",
    amountPaid: 4248,
    paidOn: "2026-05-11T09:00:00+05:30",
    remindersSent: 0,
    lastReminderAt: null,
    cancelledReason: null,
    issuedBy: "Arvind Deshmukh",
    cancelledBy: null,
  },
  {
    id: "inv-012",
    invoiceNumber: "INV-2026-05-006",
    flatId: flatId(8),
    billingPeriod: "May 2026",
    issueDate: "2026-05-01T00:00:00+05:30",
    dueDate: "2026-05-10T00:00:00+05:30",
    lineItems: [
      {
        type: "Maintenance",
        description: "Monthly maintenance - May 2026",
        amount: 3600,
        taxable: true,
      },
    ],
    gstRate: 0.18,
    status: "Issued",
    amountPaid: 0,
    paidOn: null,
    remindersSent: 0,
    lastReminderAt: null,
    cancelledReason: null,
    issuedBy: "Suresh Iyer",
    cancelledBy: null,
  },
  {
    id: "inv-013",
    invoiceNumber: "INV-2026-05-007",
    flatId: flatId(9),
    billingPeriod: "May 2026",
    issueDate: "2026-05-01T00:00:00+05:30",
    dueDate: "2026-09-25T00:00:00+05:30",
    lineItems: [
      {
        type: "Maintenance",
        description: "Monthly maintenance - May 2026",
        amount: 3600,
        taxable: true,
      },
    ],
    gstRate: 0.18,
    status: "Issued",
    amountPaid: 0,
    paidOn: null,
    remindersSent: 0,
    lastReminderAt: null,
    cancelledReason: null,
    issuedBy: "Anjali Desai",
    cancelledBy: null,
  },
  {
    id: "inv-014",
    invoiceNumber: "INV-2026-04-007",
    flatId: flatId(10),
    billingPeriod: "April 2026",
    issueDate: "2026-04-01T00:00:00+05:30",
    dueDate: "2026-04-10T00:00:00+05:30",
    lineItems: [
      {
        type: "Maintenance",
        description: "Monthly maintenance - April 2026",
        amount: 3500,
        taxable: true,
      },
    ],
    gstRate: 0.18,
    status: "Issued",
    amountPaid: 0,
    paidOn: null,
    remindersSent: 0,
    lastReminderAt: null,
    cancelledReason: null,
    issuedBy: "Kavya Nair",
    cancelledBy: null,
  },
  {
    id: "inv-015",
    invoiceNumber: "INV-2026-05-008",
    flatId: flatId(11),
    billingPeriod: "May 2026",
    issueDate: "2026-05-01T00:00:00+05:30",
    dueDate: "2026-05-10T00:00:00+05:30",
    lineItems: [
      {
        type: "Maintenance",
        description: "Monthly maintenance - May 2026",
        amount: 3600,
        taxable: true,
      },
      { type: "Sinking Fund", description: "Sinking fund", amount: 500, taxable: false },
    ],
    gstRate: 0.18,
    status: "Issued",
    amountPaid: 0,
    paidOn: null,
    remindersSent: 1,
    lastReminderAt: "2026-05-20T10:00:00+05:30",
    cancelledReason: null,
    issuedBy: "Rohan Mehta",
    cancelledBy: null,
  },
  {
    id: "inv-016",
    invoiceNumber: "INV-2026-04-008",
    flatId: flatId(12),
    billingPeriod: "April 2026",
    issueDate: "2026-04-01T00:00:00+05:30",
    dueDate: "2026-04-10T00:00:00+05:30",
    lineItems: [
      {
        type: "Maintenance",
        description: "Monthly maintenance - April 2026",
        amount: 3500,
        taxable: true,
      },
    ],
    gstRate: 0.18,
    status: "Paid",
    amountPaid: 4130,
    paidOn: "2026-04-07T11:30:00+05:30",
    remindersSent: 0,
    lastReminderAt: null,
    cancelledReason: null,
    issuedBy: "Arvind Deshmukh",
    cancelledBy: null,
  },
  {
    id: "inv-017",
    invoiceNumber: "INV-2026-05-009",
    flatId: flatId(12),
    billingPeriod: "May 2026",
    issueDate: "2026-05-01T00:00:00+05:30",
    dueDate: "2026-05-10T00:00:00+05:30",
    lineItems: [
      {
        type: "Maintenance",
        description: "Monthly maintenance - May 2026",
        amount: 3600,
        taxable: true,
      },
    ],
    gstRate: 0.18,
    status: "Issued",
    amountPaid: 0,
    paidOn: null,
    remindersSent: 0,
    lastReminderAt: null,
    cancelledReason: null,
    issuedBy: "Suresh Iyer",
    cancelledBy: null,
  },
  {
    id: "inv-018",
    invoiceNumber: "INV-2026-05-010",
    flatId: flatId(13),
    billingPeriod: "May 2026",
    issueDate: "2026-05-01T00:00:00+05:30",
    dueDate: "2026-09-28T00:00:00+05:30",
    lineItems: [
      {
        type: "Maintenance",
        description: "Monthly maintenance - May 2026",
        amount: 3600,
        taxable: true,
      },
    ],
    gstRate: 0.18,
    status: "Issued",
    amountPaid: 0,
    paidOn: null,
    remindersSent: 0,
    lastReminderAt: null,
    cancelledReason: null,
    issuedBy: "Anjali Desai",
    cancelledBy: null,
  },
];

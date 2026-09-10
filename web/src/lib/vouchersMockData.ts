import { z } from "zod";

export type { LedgerAccount, LedgerAccountType } from "./chartOfAccountsMockData";

export type VoucherType = "Payment" | "Receipt" | "Journal" | "Contra";

export type VoucherStatus = "Draft" | "Posted" | "Cancelled";

export type Voucher = {
  id: string;
  voucherNumber: string;
  type: VoucherType;
  date: string;
  narration: string;
  debitAccountId: string;
  creditAccountId: string;
  amount: number;
  status: VoucherStatus;
  sourceModule: string | null;
  sourceRefId: string | null;
  createdBy: string;
  postedBy: string | null;
  postedAt: string | null;
  cancelledBy: string | null;
  cancelledReason: string | null;
  reconciled: boolean;
};

export const addVoucherSchema = z.object({
  type: z.enum(["Payment", "Receipt", "Journal", "Contra"]),
  date: z.string().min(1, "Date is required"),
  narration: z.string().min(2, "Narration is required"),
  debitAccountId: z.string().min(1, "Debit account is required"),
  creditAccountId: z.string().min(1, "Credit account is required"),
  amount: z.coerce.number().min(1, "Amount must be at least 1"),
});

export type AddVoucherInput = z.infer<typeof addVoucherSchema>;

const VOUCHER_PREFIX: Record<VoucherType, string> = {
  Payment: "PV",
  Receipt: "RV",
  Journal: "JV",
  Contra: "CV",
};

export function createVoucher(input: {
  type: VoucherType;
  date: string;
  narration: string;
  debitAccountId: string;
  creditAccountId: string;
  amount: number;
  status?: VoucherStatus;
  sourceModule?: string | null;
  sourceRefId?: string | null;
  createdBy: string;
  postedBy?: string | null;
  postedAt?: string | null;
}): Voucher {
  const year = new Date(input.date).getFullYear();
  const seq = vouchers.filter((v) => v.type === input.type).length + 1;
  const voucher: Voucher = {
    id: crypto.randomUUID(),
    voucherNumber: `${VOUCHER_PREFIX[input.type]}-${year}-${String(seq).padStart(4, "0")}`,
    type: input.type,
    date: input.date,
    narration: input.narration,
    debitAccountId: input.debitAccountId,
    creditAccountId: input.creditAccountId,
    amount: input.amount,
    status: input.status ?? "Draft",
    sourceModule: input.sourceModule ?? null,
    sourceRefId: input.sourceRefId ?? null,
    createdBy: input.createdBy,
    postedBy: input.postedBy ?? null,
    postedAt: input.postedAt ?? null,
    cancelledBy: null,
    cancelledReason: null,
    reconciled: false,
  };
  vouchers.push(voucher);
  return voucher;
}

export const vouchers: Voucher[] = [
  {
    id: "vch-1",
    voucherNumber: "RV-2026-0001",
    type: "Receipt",
    date: "2026-04-08T10:00:00+05:30",
    narration: "Payment received for INV-2026-04-001",
    debitAccountId: "la-bank",
    creditAccountId: "la-maint-inc",
    amount: 4630,
    status: "Posted",
    sourceModule: "Dues and Receipts",
    sourceRefId: "rcp-inv-001",
    createdBy: "Arvind Deshmukh",
    postedBy: "Arvind Deshmukh",
    postedAt: "2026-04-08T10:00:00+05:30",
    cancelledBy: null,
    cancelledReason: null,
    reconciled: true,
  },
  {
    id: "vch-2",
    voucherNumber: "RV-2026-0002",
    type: "Receipt",
    date: "2026-05-09T10:00:00+05:30",
    narration: "Payment received for INV-2026-05-004",
    debitAccountId: "la-bank",
    creditAccountId: "la-maint-inc",
    amount: 5192,
    status: "Posted",
    sourceModule: "Dues and Receipts",
    sourceRefId: "rcp-inv-010",
    createdBy: "Vikram Singh Rathore",
    postedBy: "Vikram Singh Rathore",
    postedAt: "2026-05-09T10:00:00+05:30",
    cancelledBy: null,
    cancelledReason: null,
    reconciled: false,
  },
  {
    id: "vch-3",
    voucherNumber: "PV-2026-0001",
    type: "Payment",
    date: "2025-07-29T11:00:00+05:30",
    narration: "Vendor payment for PO-2025-002 — Garden Greens",
    debitAccountId: "la-repairs",
    creditAccountId: "la-bank",
    amount: 7500,
    status: "Posted",
    sourceModule: "Purchasing",
    sourceRefId: "po-2",
    createdBy: "Neha Kulkarni",
    postedBy: "Neha Kulkarni",
    postedAt: "2025-07-29T11:00:00+05:30",
    cancelledBy: null,
    cancelledReason: null,
    reconciled: true,
  },
  {
    id: "vch-4",
    voucherNumber: "PV-2026-0002",
    type: "Payment",
    date: "2026-05-12T09:00:00+05:30",
    narration: "Electricity bill — common area meter",
    debitAccountId: "la-electricity",
    creditAccountId: "la-bank",
    amount: 18500,
    status: "Draft",
    sourceModule: null,
    sourceRefId: null,
    createdBy: "Suresh Iyer",
    postedBy: null,
    postedAt: null,
    cancelledBy: null,
    cancelledReason: null,
    reconciled: false,
  },
  {
    id: "vch-5",
    voucherNumber: "JV-2026-0001",
    type: "Journal",
    date: "2026-04-01T09:00:00+05:30",
    narration: "Insurance premium provision for FY 2026-27",
    debitAccountId: "la-insurance",
    creditAccountId: "la-payables",
    amount: 150000,
    status: "Posted",
    sourceModule: null,
    sourceRefId: null,
    createdBy: "Suresh Iyer",
    postedBy: "Suresh Iyer",
    postedAt: "2026-04-01T09:00:00+05:30",
    cancelledBy: null,
    cancelledReason: null,
    reconciled: false,
  },
  {
    id: "vch-6",
    voucherNumber: "JV-2026-0002",
    type: "Journal",
    date: "2026-05-20T14:00:00+05:30",
    narration: "Sinking fund transfer for May collections",
    debitAccountId: "la-bank",
    creditAccountId: "la-sinking",
    amount: 12000,
    status: "Draft",
    sourceModule: null,
    sourceRefId: null,
    createdBy: "Anjali Desai",
    postedBy: null,
    postedAt: null,
    cancelledBy: null,
    cancelledReason: null,
    reconciled: false,
  },
  {
    id: "vch-7",
    voucherNumber: "CV-2026-0001",
    type: "Contra",
    date: "2026-04-15T11:00:00+05:30",
    narration: "Cash deposited to HDFC account",
    debitAccountId: "la-bank",
    creditAccountId: "la-cash",
    amount: 25000,
    status: "Posted",
    sourceModule: null,
    sourceRefId: null,
    createdBy: "Suresh Iyer",
    postedBy: "Suresh Iyer",
    postedAt: "2026-04-15T11:00:00+05:30",
    cancelledBy: null,
    cancelledReason: null,
    reconciled: false,
  },
  {
    id: "vch-8",
    voucherNumber: "CV-2026-0002",
    type: "Contra",
    date: "2026-05-02T10:00:00+05:30",
    narration: "Petty cash withdrawal",
    debitAccountId: "la-cash",
    creditAccountId: "la-bank",
    amount: 10000,
    status: "Cancelled",
    sourceModule: null,
    sourceRefId: null,
    createdBy: "Anjali Desai",
    postedBy: null,
    postedAt: null,
    cancelledBy: "Suresh Iyer",
    cancelledReason: "Duplicate entry — withdrawn twice by mistake",
    reconciled: false,
  },
  {
    id: "vch-9",
    voucherNumber: "RV-2026-0003",
    type: "Receipt",
    date: "2026-05-11T09:00:00+05:30",
    narration: "Payment received for INV-2026-05-005",
    debitAccountId: "la-cash",
    creditAccountId: "la-maint-inc",
    amount: 4248,
    status: "Cancelled",
    sourceModule: null,
    sourceRefId: null,
    createdBy: "Ananya Gupta",
    postedBy: null,
    postedAt: null,
    cancelledBy: "Suresh Iyer",
    cancelledReason: "Wrong flat tagged — re-entered correctly",
    reconciled: false,
  },
  {
    id: "vch-10",
    voucherNumber: "PV-2026-0003",
    type: "Payment",
    date: "2026-05-18T16:00:00+05:30",
    narration: "Housekeeping contract — May payout",
    debitAccountId: "la-housekeeping",
    creditAccountId: "la-bank",
    amount: 45000,
    status: "Posted",
    sourceModule: null,
    sourceRefId: null,
    createdBy: "Suresh Iyer",
    postedBy: "Suresh Iyer",
    postedAt: "2026-05-18T16:00:00+05:30",
    cancelledBy: null,
    cancelledReason: null,
    reconciled: false,
  },
];

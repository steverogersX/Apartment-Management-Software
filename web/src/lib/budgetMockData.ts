import { z } from "zod";

import type { Voucher } from "./vouchersMockData";

export type BudgetHeadType = "Income" | "Expense";

export const MONTHS_FY = [
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
] as const;

export type BudgetMonth = (typeof MONTHS_FY)[number];

export type BudgetHead = {
  id: string;
  name: string;
  type: BudgetHeadType;
  plannedAmount: number;
  financialYear: string;
  ledgerAccountId: string;
};

export const editBudgetHeadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: z.enum(["Income", "Expense"]),
  plannedAmount: z.coerce.number().min(0, "Planned amount must be >= 0"),
  financialYear: z.string().min(1, "Financial year is required"),
  ledgerAccountId: z.string().min(1, "Ledger account is required"),
});

export type EditBudgetHeadInput = z.infer<typeof editBudgetHeadSchema>;

export const FINANCIAL_YEARS: string[] = ["2025-26", "2024-25", "2026-27"];

// Fixed monthly-share profiles (Apr -> Mar) used to spread a head's planned annual
// figure across months for the monthly spending view. Chosen by keyword so seeded
// heads read as plausible seasonal spend instead of a flat line every month.
const FLAT_PROFILE = Array(12).fill(1);
const SUMMER_PEAK_PROFILE = [1.5, 1.6, 1.3, 0.8, 0.7, 0.8, 0.9, 1.0, 1.0, 1.1, 1.0, 1.3];
const MONSOON_PEAK_PROFILE = [0.8, 0.8, 1.3, 1.6, 1.5, 1.4, 0.9, 0.8, 0.8, 0.9, 1.0, 1.2];
const APRIL_RENEWAL_PROFILE = [6, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3];
const YEAR_END_RAMP_PROFILE = [0.8, 0.8, 0.8, 0.9, 0.9, 1.0, 1.0, 1.1, 1.1, 1.2, 1.4, 2.0];

function profileForHeadName(name: string): number[] {
  const n = name.toLowerCase();
  if (n.includes("electricity") || n.includes("diesel") || n.includes("generator")) {
    return SUMMER_PEAK_PROFILE;
  }
  if (n.includes("landscaping") || n.includes("repairs")) return MONSOON_PEAK_PROFILE;
  if (n.includes("insurance")) return APRIL_RENEWAL_PROFILE;
  if (n.includes("admin")) return YEAR_END_RAMP_PROFILE;
  return FLAT_PROFILE;
}

// Splits `total` across 12 months by relative `weights`, rounding to whole rupees
// while keeping the months summed exactly equal to `total` (remainder absorbed by
// the last month) so per-head monthly figures always reconcile to the annual one.
function distributeAcrossMonths(total: number, weights: number[]): number[] {
  const weightSum = weights.reduce((sum, w) => sum + w, 0);
  const rounded = weights.map((w) => Math.round((w / weightSum) * total));
  const roundedSum = rounded.reduce((sum, v) => sum + v, 0);
  rounded[rounded.length - 1] += total - roundedSum;
  return rounded;
}

// The planned annual figure spread across months by the head's seasonal profile —
// this is a budgeted estimate, not a record of transactions, so it stays synthetic.
export function plannedMonthlyBreakdown(name: string, plannedAmount: number): number[] {
  return distributeAcrossMonths(plannedAmount, profileForHeadName(name));
}

// The India-style financial year (Apr -> Mar) that `fy` ("YYYY-YY") spans, as a
// half-open [start, end) date range.
export function financialYearRange(fy: string): { start: Date; end: Date } {
  const startYear = Number(fy.split("-")[0]);
  return { start: new Date(startYear, 3, 1), end: new Date(startYear + 1, 3, 1) };
}

function actualLedgerSide(head: Pick<BudgetHead, "type">): "debitAccountId" | "creditAccountId" {
  return head.type === "Income" ? "creditAccountId" : "debitAccountId";
}

// A budget head's "actual" is never stored — it's the sum of posted vouchers
// against its linked ledger for the head's financial year, so it can never drift
// out of sync with what Vouchers/Chart of Accounts records as having happened.
export function computeActualAmount(
  head: Pick<BudgetHead, "type" | "ledgerAccountId" | "financialYear">,
  vouchers: Voucher[],
): number {
  const { start, end } = financialYearRange(head.financialYear);
  const side = actualLedgerSide(head);
  return vouchers
    .filter((v) => v.status === "Posted" && v[side] === head.ledgerAccountId)
    .filter((v) => {
      const d = new Date(v.date);
      return d >= start && d < end;
    })
    .reduce((sum, v) => sum + v.amount, 0);
}

// Same as computeActualAmount but bucketed by month (Apr = 0 ... Mar = 11) using
// each voucher's real posting date, for the Monthly Spending view.
export function computeActualMonthlyBreakdown(
  head: Pick<BudgetHead, "type" | "ledgerAccountId" | "financialYear">,
  vouchers: Voucher[],
): number[] {
  const { start, end } = financialYearRange(head.financialYear);
  const side = actualLedgerSide(head);
  const buckets = Array(12).fill(0) as number[];
  vouchers
    .filter((v) => v.status === "Posted" && v[side] === head.ledgerAccountId)
    .forEach((v) => {
      const d = new Date(v.date);
      if (d < start || d >= end) return;
      buckets[(d.getMonth() + 9) % 12] += v.amount;
    });
  return buckets;
}

export const budgetHeads: BudgetHead[] = [
  {
    id: "bh-1",
    name: "Housekeeping",
    type: "Expense",
    plannedAmount: 480000,
    financialYear: "2025-26",
    ledgerAccountId: "la-housekeeping",
  },
  {
    id: "bh-2",
    name: "Security Services",
    type: "Expense",
    plannedAmount: 600000,
    financialYear: "2025-26",
    ledgerAccountId: "la-security",
  },
  {
    id: "bh-3",
    name: "Electricity - Common Area",
    type: "Expense",
    plannedAmount: 360000,
    financialYear: "2025-26",
    ledgerAccountId: "la-electricity",
  },
  {
    id: "bh-4",
    name: "Water Charges",
    type: "Expense",
    plannedAmount: 240000,
    financialYear: "2025-26",
    ledgerAccountId: "la-water",
  },
  {
    id: "bh-5",
    name: "Lift AMC",
    type: "Expense",
    plannedAmount: 180000,
    financialYear: "2025-26",
    ledgerAccountId: "la-lift-amc",
  },
  {
    id: "bh-6",
    name: "Landscaping",
    type: "Expense",
    plannedAmount: 120000,
    financialYear: "2025-26",
    ledgerAccountId: "la-landscaping",
  },
  {
    id: "bh-7",
    name: "Insurance",
    type: "Expense",
    plannedAmount: 150000,
    financialYear: "2025-26",
    ledgerAccountId: "la-insurance",
  },
  {
    id: "bh-8",
    name: "Repairs & Maintenance",
    type: "Expense",
    plannedAmount: 300000,
    financialYear: "2025-26",
    ledgerAccountId: "la-repairs",
  },
  {
    id: "bh-9",
    name: "Diesel Generator Fuel",
    type: "Expense",
    plannedAmount: 90000,
    financialYear: "2025-26",
    ledgerAccountId: "la-diesel",
  },
  {
    id: "bh-10",
    name: "Office Admin",
    type: "Expense",
    plannedAmount: 100000,
    financialYear: "2025-26",
    ledgerAccountId: "la-office",
  },
  {
    id: "bh-11",
    name: "Sinking Fund Contribution",
    type: "Income",
    plannedAmount: 200000,
    financialYear: "2025-26",
    ledgerAccountId: "la-sinking",
  },
  {
    id: "bh-12",
    name: "Interest/Other Income",
    type: "Income",
    plannedAmount: 50000,
    financialYear: "2025-26",
    ledgerAccountId: "la-other-income",
  },
  {
    id: "bh-13",
    name: "Housekeeping",
    type: "Expense",
    plannedAmount: 450000,
    financialYear: "2024-25",
    ledgerAccountId: "la-housekeeping",
  },
  {
    id: "bh-14",
    name: "Security Services",
    type: "Expense",
    plannedAmount: 580000,
    financialYear: "2024-25",
    ledgerAccountId: "la-security",
  },
  {
    id: "bh-15",
    name: "Electricity - Common Area",
    type: "Expense",
    plannedAmount: 340000,
    financialYear: "2024-25",
    ledgerAccountId: "la-electricity",
  },
  {
    id: "bh-16",
    name: "Water Charges",
    type: "Expense",
    plannedAmount: 220000,
    financialYear: "2024-25",
    ledgerAccountId: "la-water",
  },
  {
    id: "bh-17",
    name: "Lift AMC",
    type: "Expense",
    plannedAmount: 170000,
    financialYear: "2024-25",
    ledgerAccountId: "la-lift-amc",
  },
  {
    id: "bh-18",
    name: "Landscaping",
    type: "Expense",
    plannedAmount: 110000,
    financialYear: "2024-25",
    ledgerAccountId: "la-landscaping",
  },
  {
    id: "bh-19",
    name: "Insurance",
    type: "Expense",
    plannedAmount: 140000,
    financialYear: "2024-25",
    ledgerAccountId: "la-insurance",
  },
  {
    id: "bh-20",
    name: "Repairs & Maintenance",
    type: "Expense",
    plannedAmount: 280000,
    financialYear: "2024-25",
    ledgerAccountId: "la-repairs",
  },
  {
    id: "bh-21",
    name: "Diesel Generator Fuel",
    type: "Expense",
    plannedAmount: 85000,
    financialYear: "2024-25",
    ledgerAccountId: "la-diesel",
  },
  {
    id: "bh-22",
    name: "Office Admin",
    type: "Expense",
    plannedAmount: 95000,
    financialYear: "2024-25",
    ledgerAccountId: "la-office",
  },
  {
    id: "bh-23",
    name: "Sinking Fund Contribution",
    type: "Income",
    plannedAmount: 180000,
    financialYear: "2024-25",
    ledgerAccountId: "la-sinking",
  },
  {
    id: "bh-24",
    name: "Interest/Other Income",
    type: "Income",
    plannedAmount: 40000,
    financialYear: "2024-25",
    ledgerAccountId: "la-other-income",
  },
];

// The India-style financial year (Apr -> Mar) containing today, as "YYYY-YY".
export function currentFinancialYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const startYear = now.getMonth() >= 3 ? year : year - 1;
  return `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
}

// Index into MONTHS_FY for the current calendar month (Apr = 0 ... Mar = 11).
export function currentMonthIndexInFY(): number {
  return (new Date().getMonth() + 9) % 12;
}

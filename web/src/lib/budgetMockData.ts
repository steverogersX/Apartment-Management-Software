import { z } from "zod";

import type { Voucher } from "./vouchersMockData";

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

// "annual" — admin enters one figure for the year, spread across months by a
// seasonal profile for display. "monthly" — admin enters each month directly, so
// the head's monthly shape is exactly what was planned, not an estimate.
export type BudgetPlanningMode = "annual" | "monthly";

export type BudgetHead = {
  id: string;
  name: string;
  planningMode: BudgetPlanningMode;
  plannedAmount: number;
  monthlyPlanned: number[] | null;
  financialYear: string;
  ledgerAccountId: string;
};

export const editBudgetHeadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  planningMode: z.enum(["annual", "monthly"]),
  plannedAmount: z.coerce.number().min(0, "Planned amount must be >= 0"),
  monthlyPlanned: z.array(z.coerce.number().min(0, "Must be >= 0")).length(12),
  financialYear: z.string().min(1, "Financial year is required"),
  ledgerAccountId: z.string().min(1, "Ledger account is required"),
});

export type EditBudgetHeadInput = z.infer<typeof editBudgetHeadSchema>;

export const FINANCIAL_YEARS: string[] = ["2026-27", "2025-26", "2024-25"];

// Fixed monthly-share profiles (Apr -> Mar) used to spread an "annual" head's
// planned figure across months for the monthly spending view. Chosen by keyword
// so seeded heads read as plausible seasonal spend instead of a flat line every
// month. Never used for "monthly" heads — those carry their own real shape.
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

// A head's real planned monthly shape: whatever the admin typed in for a
// "monthly" head, or the seasonal-profile estimate for an "annual" one.
export function getPlannedMonthlyBreakdown(
  head: Pick<BudgetHead, "name" | "plannedAmount" | "planningMode" | "monthlyPlanned">,
): number[] {
  if (head.planningMode === "monthly" && head.monthlyPlanned) return head.monthlyPlanned;
  return plannedMonthlyBreakdown(head.name, head.plannedAmount);
}

// The India-style financial year (Apr -> Mar) that `fy` ("YYYY-YY") spans, as a
// half-open [start, end) date range.
export function financialYearRange(fy: string): { start: Date; end: Date } {
  const startYear = Number(fy.split("-")[0]);
  return { start: new Date(startYear, 3, 1), end: new Date(startYear + 1, 3, 1) };
}

// A budget head's "actual" is never stored — it's the sum of posted vouchers
// against its linked ledger for the head's financial year, so it can never drift
// out of sync with what Vouchers/Chart of Accounts records as having happened.
export function computeActualAmount(
  head: Pick<BudgetHead, "ledgerAccountId" | "financialYear">,
  vouchers: Voucher[],
): number {
  const { start, end } = financialYearRange(head.financialYear);
  return vouchers
    .filter((v) => v.status === "Posted" && v.debitAccountId === head.ledgerAccountId)
    .filter((v) => {
      const d = new Date(v.date);
      return d >= start && d < end;
    })
    .reduce((sum, v) => sum + v.amount, 0);
}

// Same as computeActualAmount but bucketed by month (Apr = 0 ... Mar = 11) using
// each voucher's real posting date, for the Monthly Spending view.
export function computeActualMonthlyBreakdown(
  head: Pick<BudgetHead, "ledgerAccountId" | "financialYear">,
  vouchers: Voucher[],
): number[] {
  const { start, end } = financialYearRange(head.financialYear);
  const buckets = Array(12).fill(0) as number[];
  vouchers
    .filter((v) => v.status === "Posted" && v.debitAccountId === head.ledgerAccountId)
    .forEach((v) => {
      const d = new Date(v.date);
      if (d < start || d >= end) return;
      buckets[(d.getMonth() + 9) % 12] += v.amount;
    });
  return buckets;
}

type AnnualHeadSeed = {
  id: string;
  name: string;
  plannedAmount: number;
  financialYear: string;
  ledgerAccountId: string;
};

function annualHead(seed: AnnualHeadSeed): BudgetHead {
  return { ...seed, planningMode: "annual", monthlyPlanned: null };
}

function monthlyHead(
  seed: Omit<AnnualHeadSeed, "plannedAmount">,
  monthlyPlanned: number[],
): BudgetHead {
  return {
    ...seed,
    planningMode: "monthly",
    monthlyPlanned,
    plannedAmount: monthlyPlanned.reduce((sum, v) => sum + v, 0),
  };
}

export const budgetHeads: BudgetHead[] = [
  annualHead({
    id: "bh-1",
    name: "Housekeeping",
    plannedAmount: 480000,
    financialYear: "2025-26",
    ledgerAccountId: "la-housekeeping",
  }),
  annualHead({
    id: "bh-2",
    name: "Security Services",
    plannedAmount: 600000,
    financialYear: "2025-26",
    ledgerAccountId: "la-security",
  }),
  annualHead({
    id: "bh-3",
    name: "Electricity - Common Area",
    plannedAmount: 360000,
    financialYear: "2025-26",
    ledgerAccountId: "la-electricity",
  }),
  annualHead({
    id: "bh-4",
    name: "Water Charges",
    plannedAmount: 240000,
    financialYear: "2025-26",
    ledgerAccountId: "la-water",
  }),
  annualHead({
    id: "bh-5",
    name: "Lift AMC",
    plannedAmount: 180000,
    financialYear: "2025-26",
    ledgerAccountId: "la-lift-amc",
  }),
  annualHead({
    id: "bh-6",
    name: "Landscaping",
    plannedAmount: 120000,
    financialYear: "2025-26",
    ledgerAccountId: "la-landscaping",
  }),
  annualHead({
    id: "bh-7",
    name: "Insurance",
    plannedAmount: 150000,
    financialYear: "2025-26",
    ledgerAccountId: "la-insurance",
  }),
  annualHead({
    id: "bh-8",
    name: "Repairs & Maintenance",
    plannedAmount: 300000,
    financialYear: "2025-26",
    ledgerAccountId: "la-repairs",
  }),
  annualHead({
    id: "bh-9",
    name: "Diesel Generator Fuel",
    plannedAmount: 90000,
    financialYear: "2025-26",
    ledgerAccountId: "la-diesel",
  }),
  annualHead({
    id: "bh-10",
    name: "Office Admin",
    plannedAmount: 100000,
    financialYear: "2025-26",
    ledgerAccountId: "la-office",
  }),
  annualHead({
    id: "bh-13",
    name: "Housekeeping",
    plannedAmount: 450000,
    financialYear: "2024-25",
    ledgerAccountId: "la-housekeeping",
  }),
  annualHead({
    id: "bh-14",
    name: "Security Services",
    plannedAmount: 580000,
    financialYear: "2024-25",
    ledgerAccountId: "la-security",
  }),
  annualHead({
    id: "bh-15",
    name: "Electricity - Common Area",
    plannedAmount: 340000,
    financialYear: "2024-25",
    ledgerAccountId: "la-electricity",
  }),
  annualHead({
    id: "bh-16",
    name: "Water Charges",
    plannedAmount: 220000,
    financialYear: "2024-25",
    ledgerAccountId: "la-water",
  }),
  annualHead({
    id: "bh-17",
    name: "Lift AMC",
    plannedAmount: 170000,
    financialYear: "2024-25",
    ledgerAccountId: "la-lift-amc",
  }),
  annualHead({
    id: "bh-18",
    name: "Landscaping",
    plannedAmount: 110000,
    financialYear: "2024-25",
    ledgerAccountId: "la-landscaping",
  }),
  annualHead({
    id: "bh-19",
    name: "Insurance",
    plannedAmount: 140000,
    financialYear: "2024-25",
    ledgerAccountId: "la-insurance",
  }),
  annualHead({
    id: "bh-20",
    name: "Repairs & Maintenance",
    plannedAmount: 280000,
    financialYear: "2024-25",
    ledgerAccountId: "la-repairs",
  }),
  annualHead({
    id: "bh-21",
    name: "Diesel Generator Fuel",
    plannedAmount: 85000,
    financialYear: "2024-25",
    ledgerAccountId: "la-diesel",
  }),
  annualHead({
    id: "bh-22",
    name: "Office Admin",
    plannedAmount: 95000,
    financialYear: "2024-25",
    ledgerAccountId: "la-office",
  }),
  annualHead({
    id: "bh-27",
    name: "Housekeeping",
    plannedAmount: 520000,
    financialYear: "2026-27",
    ledgerAccountId: "la-housekeeping",
  }),
  annualHead({
    id: "bh-28",
    name: "Security Services",
    plannedAmount: 620000,
    financialYear: "2026-27",
    ledgerAccountId: "la-security",
  }),
  // Set month-by-month instead of an auto seasonal spread — the committee expects
  // an early hot summer this year, so April/May/June are budgeted above the flat
  // profile a plain annual figure would produce.
  monthlyHead(
    {
      id: "bh-29",
      name: "Electricity - Common Area",
      financialYear: "2026-27",
      ledgerAccountId: "la-electricity",
    },
    [45000, 50000, 42000, 28000, 26000, 28000, 30000, 30000, 32000, 33000, 33000, 43000],
  ),
  annualHead({
    id: "bh-30",
    name: "Water Charges",
    plannedAmount: 250000,
    financialYear: "2026-27",
    ledgerAccountId: "la-water",
  }),
  annualHead({
    id: "bh-31",
    name: "Lift AMC",
    plannedAmount: 185000,
    financialYear: "2026-27",
    ledgerAccountId: "la-lift-amc",
  }),
  annualHead({
    id: "bh-32",
    name: "Landscaping",
    plannedAmount: 125000,
    financialYear: "2026-27",
    ledgerAccountId: "la-landscaping",
  }),
  annualHead({
    id: "bh-33",
    name: "Insurance",
    plannedAmount: 155000,
    financialYear: "2026-27",
    ledgerAccountId: "la-insurance",
  }),
  annualHead({
    id: "bh-34",
    name: "Repairs & Maintenance",
    plannedAmount: 310000,
    financialYear: "2026-27",
    ledgerAccountId: "la-repairs",
  }),
  annualHead({
    id: "bh-35",
    name: "Diesel Generator Fuel",
    plannedAmount: 95000,
    financialYear: "2026-27",
    ledgerAccountId: "la-diesel",
  }),
  annualHead({
    id: "bh-36",
    name: "Office Admin",
    plannedAmount: 105000,
    financialYear: "2026-27",
    ledgerAccountId: "la-office",
  }),
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

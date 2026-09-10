import { z } from "zod";

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

export type MonthlyAmount = {
  month: BudgetMonth;
  planned: number;
  actual: number;
};

export type BudgetHead = {
  id: string;
  name: string;
  type: BudgetHeadType;
  plannedAmount: number;
  actualAmount: number;
  financialYear: string;
  monthly: MonthlyAmount[];
};

export const editBudgetHeadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: z.enum(["Income", "Expense"]),
  plannedAmount: z.coerce.number().min(0, "Planned amount must be >= 0"),
  actualAmount: z.coerce.number().min(0, "Actual amount must be >= 0"),
  financialYear: z.string().min(1, "Financial year is required"),
});

export type EditBudgetHeadInput = z.infer<typeof editBudgetHeadSchema>;

export const FINANCIAL_YEARS: string[] = ["2025-26", "2024-25", "2026-27"];

// Fixed monthly-share profiles (Apr -> Mar) used to spread a head's single annual
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

export function generateMonthlyBreakdown(
  name: string,
  plannedAmount: number,
  actualAmount: number,
): MonthlyAmount[] {
  const weights = profileForHeadName(name);
  const plannedByMonth = distributeAcrossMonths(plannedAmount, weights);
  const actualByMonth = distributeAcrossMonths(actualAmount, weights);
  return MONTHS_FY.map((month, i) => ({
    month,
    planned: plannedByMonth[i],
    actual: actualByMonth[i],
  }));
}

function withMonthly(head: Omit<BudgetHead, "monthly">): BudgetHead {
  return {
    ...head,
    monthly: generateMonthlyBreakdown(head.name, head.plannedAmount, head.actualAmount),
  };
}

export const budgetHeads: BudgetHead[] = [
  withMonthly({
    id: "bh-1",
    name: "Housekeeping",
    type: "Expense",
    plannedAmount: 480000,
    actualAmount: 520000,
    financialYear: "2025-26",
  }),
  withMonthly({
    id: "bh-2",
    name: "Security Services",
    type: "Expense",
    plannedAmount: 600000,
    actualAmount: 580000,
    financialYear: "2025-26",
  }),
  withMonthly({
    id: "bh-3",
    name: "Electricity - Common Area",
    type: "Expense",
    plannedAmount: 360000,
    actualAmount: 390000,
    financialYear: "2025-26",
  }),
  withMonthly({
    id: "bh-4",
    name: "Water Charges",
    type: "Expense",
    plannedAmount: 240000,
    actualAmount: 235000,
    financialYear: "2025-26",
  }),
  withMonthly({
    id: "bh-5",
    name: "Lift AMC",
    type: "Expense",
    plannedAmount: 180000,
    actualAmount: 180000,
    financialYear: "2025-26",
  }),
  withMonthly({
    id: "bh-6",
    name: "Landscaping",
    type: "Expense",
    plannedAmount: 120000,
    actualAmount: 80000,
    financialYear: "2025-26",
  }),
  withMonthly({
    id: "bh-7",
    name: "Insurance",
    type: "Expense",
    plannedAmount: 150000,
    actualAmount: 150000,
    financialYear: "2025-26",
  }),
  withMonthly({
    id: "bh-8",
    name: "Repairs & Maintenance",
    type: "Expense",
    plannedAmount: 300000,
    actualAmount: 340000,
    financialYear: "2025-26",
  }),
  withMonthly({
    id: "bh-9",
    name: "Diesel Generator Fuel",
    type: "Expense",
    plannedAmount: 90000,
    actualAmount: 105000,
    financialYear: "2025-26",
  }),
  withMonthly({
    id: "bh-10",
    name: "Office Admin",
    type: "Expense",
    plannedAmount: 100000,
    actualAmount: 95000,
    financialYear: "2025-26",
  }),
  withMonthly({
    id: "bh-11",
    name: "Sinking Fund Contribution",
    type: "Income",
    plannedAmount: 200000,
    actualAmount: 180000,
    financialYear: "2025-26",
  }),
  withMonthly({
    id: "bh-12",
    name: "Interest/Other Income",
    type: "Income",
    plannedAmount: 50000,
    actualAmount: 65000,
    financialYear: "2025-26",
  }),
  withMonthly({
    id: "bh-13",
    name: "Housekeeping",
    type: "Expense",
    plannedAmount: 450000,
    actualAmount: 445000,
    financialYear: "2024-25",
  }),
  withMonthly({
    id: "bh-14",
    name: "Security Services",
    type: "Expense",
    plannedAmount: 580000,
    actualAmount: 590000,
    financialYear: "2024-25",
  }),
  withMonthly({
    id: "bh-15",
    name: "Electricity - Common Area",
    type: "Expense",
    plannedAmount: 340000,
    actualAmount: 355000,
    financialYear: "2024-25",
  }),
  withMonthly({
    id: "bh-16",
    name: "Water Charges",
    type: "Expense",
    plannedAmount: 220000,
    actualAmount: 215000,
    financialYear: "2024-25",
  }),
  withMonthly({
    id: "bh-17",
    name: "Lift AMC",
    type: "Expense",
    plannedAmount: 170000,
    actualAmount: 170000,
    financialYear: "2024-25",
  }),
  withMonthly({
    id: "bh-18",
    name: "Landscaping",
    type: "Expense",
    plannedAmount: 110000,
    actualAmount: 105000,
    financialYear: "2024-25",
  }),
  withMonthly({
    id: "bh-19",
    name: "Insurance",
    type: "Expense",
    plannedAmount: 140000,
    actualAmount: 140000,
    financialYear: "2024-25",
  }),
  withMonthly({
    id: "bh-20",
    name: "Repairs & Maintenance",
    type: "Expense",
    plannedAmount: 280000,
    actualAmount: 295000,
    financialYear: "2024-25",
  }),
  withMonthly({
    id: "bh-21",
    name: "Diesel Generator Fuel",
    type: "Expense",
    plannedAmount: 85000,
    actualAmount: 82000,
    financialYear: "2024-25",
  }),
  withMonthly({
    id: "bh-22",
    name: "Office Admin",
    type: "Expense",
    plannedAmount: 95000,
    actualAmount: 90000,
    financialYear: "2024-25",
  }),
  withMonthly({
    id: "bh-23",
    name: "Sinking Fund Contribution",
    type: "Income",
    plannedAmount: 180000,
    actualAmount: 175000,
    financialYear: "2024-25",
  }),
  withMonthly({
    id: "bh-24",
    name: "Interest/Other Income",
    type: "Income",
    plannedAmount: 40000,
    actualAmount: 48000,
    financialYear: "2024-25",
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

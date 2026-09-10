import type { PaymentMode } from "@/lib/duesMockData";

export type MaintenanceStatus = "paid" | "pending" | "partial";

export type MaintenanceRecord = {
  id: string;
  flat: string;
  owner: string;
  tower: string;
  amount: number;
  dueDate: string;
  status: MaintenanceStatus;
  paidOn: string | null;
  month: string;
};

export const maintenanceRecords: MaintenanceRecord[] = [
  {
    id: "m-01",
    flat: "A-301",
    owner: "Arvind Deshmukh",
    tower: "A",
    amount: 4500,
    dueDate: "2026-05-05",
    status: "paid",
    paidOn: "2026-05-03",
    month: "May 2026",
  },
  {
    id: "m-02",
    flat: "B-204",
    owner: "Sunita Patil",
    tower: "B",
    amount: 4200,
    dueDate: "2026-05-05",
    status: "pending",
    paidOn: null,
    month: "May 2026",
  },
  {
    id: "m-03",
    flat: "A-502",
    owner: "Rohan Mehta",
    tower: "A",
    amount: 3800,
    dueDate: "2026-05-05",
    status: "partial",
    paidOn: "2026-05-10",
    month: "May 2026",
  },
  {
    id: "m-04",
    flat: "C-103",
    owner: "Kavya Nair",
    tower: "C",
    amount: 3200,
    dueDate: "2026-05-05",
    status: "paid",
    paidOn: "2026-05-04",
    month: "May 2026",
  },
  {
    id: "m-05",
    flat: "B-405",
    owner: "Mohammed Farhan",
    tower: "B",
    amount: 4600,
    dueDate: "2026-06-05",
    status: "pending",
    paidOn: null,
    month: "Jun 2026",
  },
  {
    id: "m-06",
    flat: "C-208",
    owner: "Neha Kulkarni",
    tower: "C",
    amount: 3200,
    dueDate: "2026-06-05",
    status: "paid",
    paidOn: "2026-06-02",
    month: "Jun 2026",
  },
  {
    id: "m-07",
    flat: "A-601",
    owner: "Vikram Singh Rathore",
    tower: "A",
    amount: 5200,
    dueDate: "2026-06-05",
    status: "pending",
    paidOn: null,
    month: "Jun 2026",
  },
  {
    id: "m-08",
    flat: "B-110",
    owner: "Ananya Gupta",
    tower: "B",
    amount: 4000,
    dueDate: "2026-06-05",
    status: "partial",
    paidOn: "2026-06-08",
    month: "Jun 2026",
  },
  {
    id: "m-09",
    flat: "C-307",
    owner: "Suresh Iyer",
    tower: "C",
    amount: 3800,
    dueDate: "2026-05-05",
    status: "paid",
    paidOn: "2026-05-01",
    month: "May 2026",
  },
  {
    id: "m-10",
    flat: "A-402",
    owner: "Pooja Banerjee",
    tower: "A",
    amount: 3400,
    dueDate: "2026-06-05",
    status: "pending",
    paidOn: null,
    month: "Jun 2026",
  },
  {
    id: "m-11",
    flat: "C-506",
    owner: "Harish Krishnan",
    tower: "C",
    amount: 3600,
    dueDate: "2026-06-05",
    status: "paid",
    paidOn: "2026-06-04",
    month: "Jun 2026",
  },
  {
    id: "m-12",
    flat: "B-201",
    owner: "Divya Reddy",
    tower: "B",
    amount: 4200,
    dueDate: "2026-05-05",
    status: "paid",
    paidOn: "2026-05-06",
    month: "May 2026",
  },
];

export const towerOptions = ["A", "B", "C"] as const;
export const maintenanceStatusOptions: MaintenanceStatus[] = ["paid", "pending", "partial"];

export type MaintenanceHistoryStatus = "collected" | "partial" | "overdue" | "draft";

export type MaintenanceHistoryEntry = {
  id: string;
  monthLabel: string;
  monthKey: string;
  dueDate: string;
  generatedAt: string;
  generatedBy: string;
  towers: string[];
  type: "Monthly" | "Quarterly" | "Special";
  flatsCovered: number;
  amountPerFlat: number;
  totalExpected: number;
  totalCollected: number;
  status: MaintenanceHistoryStatus;
};

export const maintenanceHistory: MaintenanceHistoryEntry[] = [
  {
    id: "h-01",
    monthLabel: "May 2026",
    monthKey: "2026-05",
    dueDate: "2026-05-10",
    generatedAt: "2026-04-28T10:30:00+05:30",
    generatedBy: "Suresh Iyer",
    towers: ["A", "B"],
    type: "Monthly",
    flatsCovered: 96,
    amountPerFlat: 3000,
    totalExpected: 288000,
    totalCollected: 216000,
    status: "partial",
  },
  {
    id: "h-02",
    monthLabel: "Apr 2026",
    monthKey: "2026-04",
    dueDate: "2026-04-10",
    generatedAt: "2026-03-29T09:15:00+05:30",
    generatedBy: "Anjali Desai",
    towers: ["A", "B", "C", "D"],
    type: "Monthly",
    flatsCovered: 192,
    amountPerFlat: 3000,
    totalExpected: 576000,
    totalCollected: 576000,
    status: "collected",
  },
  {
    id: "h-03",
    monthLabel: "Mar 2026",
    monthKey: "2026-03",
    dueDate: "2026-03-10",
    generatedAt: "2026-02-27T11:00:00+05:30",
    generatedBy: "Suresh Iyer",
    towers: ["A", "B", "C"],
    type: "Monthly",
    flatsCovered: 144,
    amountPerFlat: 3000,
    totalExpected: 432000,
    totalCollected: 398000,
    status: "partial",
  },
  {
    id: "h-04",
    monthLabel: "Feb 2026",
    monthKey: "2026-02",
    dueDate: "2026-02-10",
    generatedAt: "2026-01-30T14:20:00+05:30",
    generatedBy: "Kavya Nair",
    towers: ["C", "D"],
    type: "Special",
    flatsCovered: 96,
    amountPerFlat: 4500,
    totalExpected: 432000,
    totalCollected: 312000,
    status: "overdue",
  },
  {
    id: "h-05",
    monthLabel: "Jan 2026",
    monthKey: "2026-01",
    dueDate: "2026-01-10",
    generatedAt: "2025-12-28T10:00:00+05:30",
    generatedBy: "Suresh Iyer",
    towers: ["A", "B", "C", "D"],
    type: "Quarterly",
    flatsCovered: 192,
    amountPerFlat: 8500,
    totalExpected: 1632000,
    totalCollected: 1632000,
    status: "collected",
  },
  {
    id: "h-06",
    monthLabel: "Dec 2025",
    monthKey: "2025-12",
    dueDate: "2025-12-10",
    generatedAt: "2025-11-29T09:45:00+05:30",
    generatedBy: "Anjali Desai",
    towers: ["A", "B"],
    type: "Monthly",
    flatsCovered: 96,
    amountPerFlat: 3000,
    totalExpected: 288000,
    totalCollected: 288000,
    status: "collected",
  },
  {
    id: "h-07",
    monthLabel: "Nov 2025",
    monthKey: "2025-11",
    dueDate: "2025-11-10",
    generatedAt: "2025-10-30T15:10:00+05:30",
    generatedBy: "Suresh Iyer",
    towers: ["A", "B", "C", "D"],
    type: "Monthly",
    flatsCovered: 192,
    amountPerFlat: 3000,
    totalExpected: 576000,
    totalCollected: 521000,
    status: "partial",
  },
  {
    id: "h-08",
    monthLabel: "Oct 2025",
    monthKey: "2025-10",
    dueDate: "2025-10-10",
    generatedAt: "2025-09-28T11:30:00+05:30",
    generatedBy: "Suresh Iyer",
    towers: ["A", "B", "C", "D"],
    type: "Monthly",
    flatsCovered: 192,
    amountPerFlat: 3000,
    totalExpected: 576000,
    totalCollected: 576000,
    status: "collected",
  },
];

export type FlatChargeStatus = "paid" | "partial" | "pending" | "overdue";

export type FlatCharge = {
  chargeId: string;
  cycleId: string;
  monthKey: string;
  monthLabel: string;
  flat: string;
  flatId: string;
  owner: string;
  tower: string;
  amountDue: number;
  amountPaid: number;
  balance: number;
  status: FlatChargeStatus;
  dueDate: string;
  paidOn: string | null;
  paidVia: PaymentMode | null;
};

type FlatIdentity = {
  flat: string;
  owner: string;
  tower: string;
};

const flatIdentities: FlatIdentity[] = [
  { flat: "A-301", owner: "Arvind Deshmukh", tower: "A" },
  { flat: "B-204", owner: "Sunita Patil", tower: "B" },
  { flat: "A-502", owner: "Rohan Mehta", tower: "A" },
  { flat: "C-103", owner: "Kavya Nair", tower: "C" },
  { flat: "B-405", owner: "Mohammed Farhan", tower: "B" },
  { flat: "C-208", owner: "Neha Kulkarni", tower: "C" },
  { flat: "A-601", owner: "Vikram Singh Rathore", tower: "A" },
  { flat: "B-110", owner: "Ananya Gupta", tower: "B" },
  { flat: "C-307", owner: "Suresh Iyer", tower: "C" },
  { flat: "A-402", owner: "Pooja Banerjee", tower: "A" },
  { flat: "C-506", owner: "Harish Krishnan", tower: "C" },
  { flat: "B-201", owner: "Divya Reddy", tower: "B" },
];

const overflowFlatIdentities: FlatIdentity[] = [
  { flat: "D-101", owner: "Aarav Shah", tower: "D" },
  { flat: "D-102", owner: "Ishita Rao", tower: "D" },
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function toFlatId(flat: string): string {
  return flat.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

const PAYMENT_MODES: PaymentMode[] = [
  "Cash",
  "Cheque",
  "NEFT/RTGS",
  "UPI",
  "Card",
  "Online Gateway",
];

function paymentModeFor(seed: string): PaymentMode {
  const mode = PAYMENT_MODES[hashString(seed) % PAYMENT_MODES.length];
  return mode ?? "UPI";
}

function buildMaintenanceCharges(): FlatCharge[] {
  const charges: FlatCharge[] = [];
  maintenanceHistory.forEach((cycle, cycleIndex) => {
    const count = 10 + (cycleIndex % 5);
    const start = (cycleIndex * 5) % flatIdentities.length;
    const picked: FlatIdentity[] = [];
    for (let i = 0; i < count; i += 1) {
      if (i < flatIdentities.length) {
        const identity = flatIdentities[(start + i) % flatIdentities.length];
        if (identity) picked.push(identity);
      } else {
        const overflow =
          overflowFlatIdentities[(i - flatIdentities.length) % overflowFlatIdentities.length];
        if (overflow) picked.push(overflow);
      }
    }
    const varianceRange = Math.max(100, Math.round(cycle.amountPerFlat * 0.06));
    const dues = picked.map((identity) => {
      const spread = hashString(`${cycle.id}:${identity.flat}`) % (varianceRange * 2 + 1);
      return Math.max(100, cycle.amountPerFlat + spread - varianceRange);
    });
    const ratio = cycle.totalExpected > 0 ? cycle.totalCollected / cycle.totalExpected : 0;
    const fullPaidCount = Math.min(picked.length, Math.floor(ratio * picked.length + 1e-6));
    const payOrder = picked
      .map((identity, index) => index)
      .sort(
        (a, b) =>
          hashString(`${cycle.id}:${picked[a]?.flat ?? a}`) -
          hashString(`${cycle.id}:${picked[b]?.flat ?? b}`),
      );
    const paidIndexes = new Set(payOrder.slice(0, fullPaidCount));
    const partialIndex =
      fullPaidCount < picked.length && ratio > 0 ? payOrder[fullPaidCount] : undefined;
    picked.forEach((identity, index) => {
      const amountDue = dues[index] ?? cycle.amountPerFlat;
      let amountPaid: number;
      let status: FlatChargeStatus;
      if (paidIndexes.has(index)) {
        amountPaid = amountDue;
        status = "paid";
      } else if (index === partialIndex) {
        amountPaid = Math.round(amountDue / 2);
        status = "partial";
      } else {
        amountPaid = 0;
        status = cycle.status === "overdue" ? "overdue" : "pending";
      }
      const settled = status === "paid" || status === "partial";
      const offset = (hashString(`${identity.flat}:${cycle.id}`) % 7) - 4;
      charges.push({
        chargeId: `${cycle.id}-c${String(index + 1).padStart(2, "0")}`,
        cycleId: cycle.id,
        monthKey: cycle.monthKey,
        monthLabel: cycle.monthLabel,
        flat: identity.flat,
        flatId: toFlatId(identity.flat),
        owner: identity.owner,
        tower: identity.tower,
        amountDue,
        amountPaid,
        balance: amountDue - amountPaid,
        status,
        dueDate: cycle.dueDate,
        paidOn: settled ? addDays(cycle.dueDate, offset) : null,
        paidVia: settled ? paymentModeFor(`${identity.flat}:${cycle.id}:mode`) : null,
      });
    });
  });
  return charges;
}

export const maintenanceCharges: FlatCharge[] = buildMaintenanceCharges();

export function getChargesByCycle(cycleId: string): FlatCharge[] {
  return maintenanceCharges.filter((charge) => charge.cycleId === cycleId);
}

export function getLedgerByFlat(flat: string): FlatCharge[] {
  return maintenanceCharges
    .filter((charge) => charge.flat === flat)
    .sort((a, b) => a.monthKey.localeCompare(b.monthKey));
}

export function getCycleById(cycleId: string): MaintenanceHistoryEntry | undefined {
  return maintenanceHistory.find((cycle) => cycle.id === cycleId);
}

export const monthOptions: string[] = maintenanceHistory.map((cycle) => cycle.monthLabel);

export const flatChargeStatusOptions: FlatChargeStatus[] = [
  "paid",
  "partial",
  "pending",
  "overdue",
];

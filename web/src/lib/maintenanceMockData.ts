import { z } from "zod";

import { assets, assetServiceLogs, type AssetCategory } from "./assetsMockData";
import { receipts, type PaymentMode } from "./duesMockData";
import { flats, type FlatRecord } from "./flatsMockData";
import { computeInvoiceTotals, invoices } from "./invoicingMockData";
import { residents } from "./residentsMockData";

/**
 * UI-only mock data for the Maintenance log — a record of who did maintenance work, where (a
 * specific flat or a society common area), and when. This is a log/register, not a ticketing
 * workflow: there's no raise/assign/resolve cycle like Help Desk complaints — an admin simply
 * records work as it happens or is scheduled. Residents can only view their own flat's history;
 * Society Admin and committee roles see every flat plus the society-wide log. Assignees come
 * from the Staff directory (`staffMockData.ts`). No backing table or API yet.
 */

export type MaintenanceScope = "flat" | "society";

export type MaintenanceCategory =
  | "Plumbing"
  | "Electrical"
  | "Carpentry"
  | "Appliance Repair"
  | "Painting"
  | "Civil & Masonry"
  | "Pest Control"
  | "Housekeeping"
  | "Landscaping"
  | "Lift & Elevator"
  | "Fire Safety"
  | "Other";

export const MAINTENANCE_CATEGORIES: MaintenanceCategory[] = [
  "Plumbing",
  "Electrical",
  "Carpentry",
  "Appliance Repair",
  "Painting",
  "Civil & Masonry",
  "Pest Control",
  "Housekeeping",
  "Landscaping",
  "Lift & Elevator",
  "Fire Safety",
  "Other",
];

export type MaintenanceLogEntry = {
  id: string;
  scope: MaintenanceScope;
  tower: string | null;
  flatNumber: string | null;
  location: string | null;
  category: MaintenanceCategory;
  description: string;
  staffId: string | null;
  performedOn: string;
  cost: number | null;
  loggedBy: string;
  loggedAt: string;
};

export const addMaintenanceLogSchema = z
  .object({
    scope: z.enum(["flat", "society"]),
    tower: z.string().optional(),
    flatNumber: z.string().optional(),
    location: z.string().optional(),
    category: z.enum([
      "Plumbing",
      "Electrical",
      "Carpentry",
      "Appliance Repair",
      "Painting",
      "Civil & Masonry",
      "Pest Control",
      "Housekeeping",
      "Landscaping",
      "Lift & Elevator",
      "Fire Safety",
      "Other",
    ]),
    description: z.string().min(5, "Add a short description"),
    staffId: z.string().optional(),
    performedOn: z.string().min(1, "Date is required"),
    cost: z.coerce.number().min(0).optional(),
  })
  .refine((v) => (v.scope === "flat" ? !!v.tower && !!v.flatNumber : !!v.location), {
    message: "Provide a flat (tower + number) or a society location, depending on scope",
    path: ["location"],
  });

export type AddMaintenanceLogInput = z.infer<typeof addMaintenanceLogSchema>;

export const maintenanceLog: MaintenanceLogEntry[] = [
  {
    id: "mnt-1",
    scope: "flat",
    tower: "B",
    flatNumber: "304",
    location: null,
    category: "Plumbing",
    description: "Kitchen sink tap was dripping continuously — replaced the tap washer.",
    staffId: "stf-6",
    performedOn: "2026-06-17",
    cost: 450,
    loggedBy: "Pradeep Singh",
    loggedAt: "2026-06-17T11:30:00+05:30",
  },
  {
    id: "mnt-2",
    scope: "flat",
    tower: "B",
    flatNumber: "304",
    location: null,
    category: "Electrical",
    description: "Bedroom switchboard was sparking near the fan switch — rewired and resealed.",
    staffId: "stf-7",
    performedOn: "2026-06-16",
    cost: 600,
    loggedBy: "Pradeep Singh",
    loggedAt: "2026-06-16T15:45:00+05:30",
  },
  {
    id: "mnt-3",
    scope: "flat",
    tower: "B",
    flatNumber: "304",
    location: null,
    category: "Carpentry",
    description: "Main door lock was jamming after the monsoon — realigned and lubricated.",
    staffId: "stf-9",
    performedOn: "2026-05-23",
    cost: 300,
    loggedBy: "Pradeep Singh",
    loggedAt: "2026-05-23T11:30:00+05:30",
  },
  {
    id: "mnt-4",
    scope: "flat",
    tower: "A",
    flatNumber: "301",
    location: null,
    category: "Appliance Repair",
    description: "Washing machine wasn't draining after the cycle — cleared a blocked drain hose.",
    staffId: "stf-6",
    performedOn: "2026-06-18",
    cost: 350,
    loggedBy: "Pradeep Singh",
    loggedAt: "2026-06-18T14:00:00+05:30",
  },
  {
    id: "mnt-5",
    scope: "flat",
    tower: "B",
    flatNumber: "204",
    location: null,
    category: "Civil & Masonry",
    description:
      "Ceiling seepage traced to a leaking pipe in the flat above — sealed and waterproofed.",
    staffId: "stf-6",
    performedOn: "2026-06-15",
    cost: 2200,
    loggedBy: "Pradeep Singh",
    loggedAt: "2026-06-15T10:30:00+05:30",
  },
  {
    id: "mnt-6",
    scope: "flat",
    tower: "A",
    flatNumber: "502",
    location: null,
    category: "Pest Control",
    description:
      "Recurring cockroach sightings in the kitchen — full treatment and follow-up booked.",
    staffId: "stf-4",
    performedOn: "2026-06-01",
    cost: 800,
    loggedBy: "Pradeep Singh",
    loggedAt: "2026-06-01T10:15:00+05:30",
  },
  {
    id: "mnt-7",
    scope: "flat",
    tower: "B",
    flatNumber: "405",
    location: null,
    category: "Carpentry",
    description: "Wardrobe door had come off its hinge — refitted and reinforced.",
    staffId: "stf-9",
    performedOn: "2026-06-21",
    cost: 250,
    loggedBy: "Pradeep Singh",
    loggedAt: "2026-06-21T14:30:00+05:30",
  },
  {
    id: "mnt-8",
    scope: "flat",
    tower: "C",
    flatNumber: "208",
    location: null,
    category: "Appliance Repair",
    description: "Geyser was running lukewarm at best — replaced the heating element.",
    staffId: "stf-7",
    performedOn: "2026-05-10",
    cost: 1500,
    loggedBy: "Pradeep Singh",
    loggedAt: "2026-05-10T12:40:00+05:30",
  },
  {
    id: "mnt-9",
    scope: "society",
    tower: null,
    flatNumber: null,
    location: "Clubhouse Lift Lobby",
    category: "Lift & Elevator",
    description: "Clubhouse lift was grinding past the 3rd floor — gearbox inspected and serviced.",
    staffId: "stf-9",
    performedOn: "2026-06-16",
    cost: 9500,
    loggedBy: "Pradeep Singh",
    loggedAt: "2026-06-16T13:00:00+05:30",
  },
  {
    id: "mnt-10",
    scope: "society",
    tower: null,
    flatNumber: null,
    location: "Block B Garden",
    category: "Landscaping",
    description: "Quarterly hedge trimming and lawn mowing along the Block B walkway.",
    staffId: "stf-8",
    performedOn: "2026-05-27",
    cost: 1200,
    loggedBy: "Pradeep Singh",
    loggedAt: "2026-05-27T11:00:00+05:30",
  },
  {
    id: "mnt-11",
    scope: "society",
    tower: null,
    flatNumber: null,
    location: "Tower C - All Floors",
    category: "Fire Safety",
    description: "Annual pressure and seal check for every fire extinguisher on Tower C.",
    staffId: null,
    performedOn: "2026-06-25",
    cost: null,
    loggedBy: "Pradeep Singh",
    loggedAt: "2026-06-19T09:30:00+05:30",
  },
  {
    id: "mnt-12",
    scope: "society",
    tower: null,
    flatNumber: null,
    location: "Clubhouse",
    category: "Housekeeping",
    description: "Monthly deep cleaning of the clubhouse washrooms and changing area.",
    staffId: "stf-4",
    performedOn: "2026-06-22",
    cost: null,
    loggedBy: "Pradeep Singh",
    loggedAt: "2026-06-20T08:00:00+05:30",
  },
  {
    id: "mnt-13",
    scope: "society",
    tower: null,
    flatNumber: null,
    location: "Main Gate",
    category: "Electrical",
    description: "Routine servicing of the main gate's electrical distribution panel.",
    staffId: "stf-7",
    performedOn: "2026-05-07",
    cost: 1800,
    loggedBy: "Pradeep Singh",
    loggedAt: "2026-05-07T13:00:00+05:30",
  },
];

const ASSET_CATEGORY_TO_WORK: Partial<Record<AssetCategory, MaintenanceCategory>> = {
  Electrical: "Electrical",
  Plumbing: "Plumbing",
  Furniture: "Carpentry",
  "Safety Equipment": "Fire Safety",
};

/**
 * Service/repair entries recorded against an asset (Asset & Inventory), presented in the shape of
 * the society maintenance log so common-area work is visible in one place. Read-only here — they
 * are still created and edited on the asset.
 */
export function assetServiceAsMaintenanceLog(): MaintenanceLogEntry[] {
  return assetServiceLogs.map((log) => {
    const asset = assets.find((a) => a.id === log.assetId);
    return {
      id: `asset-${log.id}`,
      scope: "society",
      tower: null,
      flatNumber: null,
      location: asset ? `${asset.name} · ${asset.location}` : "Asset",
      category: (asset && ASSET_CATEGORY_TO_WORK[asset.category]) ?? "Other",
      description: `${log.type}: ${log.description}`,
      staffId: null,
      performedOn: log.date.slice(0, 10),
      cost: log.cost ?? null,
      loggedBy: log.loggedBy,
      loggedAt: log.date,
    };
  });
}

export function maintenanceLogForFlat(tower: string, flatNumber: string): MaintenanceLogEntry[] {
  return maintenanceLog
    .filter((e) => e.scope === "flat" && e.tower === tower && e.flatNumber === flatNumber)
    .sort((a, b) => new Date(b.performedOn).getTime() - new Date(a.performedOn).getTime());
}

/**
 * The maintenance *charge* ledger — what each flat owes per period, and when/whether/how it was
 * paid. This is a read-only view over Accounts: every row is an invoice (`invoicingMockData`)
 * joined with its latest receipt (`duesMockData`). Payments are recorded through
 * `recordInvoicePayment` in `billing.ts`, never written here.
 */
export type MaintenancePaymentStatus = "paid" | "pending" | "overdue";

export type FlatMaintenanceDue = {
  id: string;
  invoiceId: string;
  tower: string;
  flatNumber: string;
  ownerName: string;
  period: string;
  amount: number;
  amountPaid: number;
  dueDate: string;
  status: MaintenancePaymentStatus;
  paidDate: string | null;
  paidMode: PaymentMode | null;
  receiptNumber: string | null;
};

function ownerNameForFlat(flat: FlatRecord): string {
  if (flat.owner) return flat.owner.name;
  const occupants = flat.currentResidentIds
    .map((id) => residents.find((r) => r.id === id))
    .filter((r): r is NonNullable<typeof r> => !!r);
  return (occupants.find((r) => r.occupancyType === "owner") ?? occupants[0])?.name ?? "—";
}

export function getFlatMaintenanceDues(): FlatMaintenanceDue[] {
  const now = Date.now();
  return invoices
    .filter((invoice) => invoice.status !== "Cancelled" && invoice.status !== "Draft")
    .flatMap((invoice) => {
      const flat = flats.find((f) => f.id === invoice.flatId);
      if (!flat) return [];
      const receipt = receipts
        .filter((r) => r.invoiceId === invoice.id)
        .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())[0];
      const status: MaintenancePaymentStatus =
        invoice.status === "Paid"
          ? "paid"
          : new Date(invoice.dueDate).getTime() < now
            ? "overdue"
            : "pending";
      return [
        {
          id: invoice.id,
          invoiceId: invoice.id,
          tower: flat.tower,
          flatNumber: flat.flatNumber,
          ownerName: ownerNameForFlat(flat),
          period: invoice.billingPeriod,
          amount: computeInvoiceTotals(invoice).total,
          amountPaid: invoice.amountPaid,
          dueDate: invoice.dueDate,
          status,
          paidDate: invoice.paidOn,
          paidMode: receipt?.paymentMode ?? null,
          receiptNumber: receipt?.receiptNumber ?? null,
        },
      ];
    });
}

export function duesForFlat(tower: string, flatNumber: string): FlatMaintenanceDue[] {
  return getFlatMaintenanceDues()
    .filter((d) => d.tower === tower && d.flatNumber === flatNumber)
    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
}

export function maintenanceStatusForFlat(tower: string, flatNumber: string): "paid" | "due" {
  return duesForFlat(tower, flatNumber).some((d) => d.status !== "paid") ? "due" : "paid";
}

export function societyCollectionSummary(dues: FlatMaintenanceDue[] = getFlatMaintenanceDues()) {
  const totalBilled = dues.reduce((sum, d) => sum + d.amount, 0);
  const totalCollected = dues.reduce((sum, d) => sum + d.amountPaid, 0);
  const totalOutstanding = totalBilled - totalCollected;
  const defaulterFlats = new Set(
    dues.filter((d) => d.status === "overdue").map((d) => `${d.tower}-${d.flatNumber}`),
  ).size;
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;
  return { totalBilled, totalCollected, totalOutstanding, defaulterFlats, collectionRate };
}

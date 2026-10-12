import { z } from "zod";

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

export function maintenanceLogForFlat(tower: string, flatNumber: string): MaintenanceLogEntry[] {
  return maintenanceLog
    .filter((e) => e.scope === "flat" && e.tower === tower && e.flatNumber === flatNumber)
    .sort((a, b) => new Date(b.performedOn).getTime() - new Date(a.performedOn).getTime());
}

/**
 * The maintenance *charge* ledger — what each flat owes per period, and when/whether/how the
 * owner paid it. Separate from the work log above: this is money (due date, paid date, mode,
 * receipt), not work (who did what). Intentionally standalone from `Accounts` — this is the
 * dedicated per-flat maintenance-payment view requested for this section specifically.
 */
export type MaintenancePaymentStatus = "paid" | "pending" | "overdue";

export type MaintenancePaymentMode = "UPI" | "Cash" | "Bank Transfer" | "Cheque";

export type FlatMaintenanceDue = {
  id: string;
  tower: string;
  flatNumber: string;
  ownerName: string;
  period: string;
  amount: number;
  dueDate: string;
  status: MaintenancePaymentStatus;
  paidDate: string | null;
  paidMode: MaintenancePaymentMode | null;
  receiptNumber: string | null;
};

export const recordMaintenancePaymentSchema = z.object({
  paidDate: z.string().min(1, "Paid date is required"),
  paidMode: z.enum(["UPI", "Cash", "Bank Transfer", "Cheque"]),
  receiptNumber: z.string().min(1, "Receipt number is required"),
});

export type RecordMaintenancePaymentInput = z.infer<typeof recordMaintenancePaymentSchema>;

export const flatMaintenanceDues: FlatMaintenanceDue[] = [
  {
    id: "due-304-apr",
    tower: "B",
    flatNumber: "304",
    ownerName: "Padma Konkonapala",
    period: "April 2026",
    amount: 4500,
    dueDate: "2026-04-05",
    status: "paid",
    paidDate: "2026-04-03",
    paidMode: "UPI",
    receiptNumber: "RCPT-2026-0412",
  },
  {
    id: "due-304-may",
    tower: "B",
    flatNumber: "304",
    ownerName: "Padma Konkonapala",
    period: "May 2026",
    amount: 4500,
    dueDate: "2026-05-05",
    status: "paid",
    paidDate: "2026-05-06",
    paidMode: "UPI",
    receiptNumber: "RCPT-2026-0498",
  },
  {
    id: "due-304-jun",
    tower: "B",
    flatNumber: "304",
    ownerName: "Padma Konkonapala",
    period: "June 2026",
    amount: 4500,
    dueDate: "2026-06-05",
    status: "pending",
    paidDate: null,
    paidMode: null,
    receiptNumber: null,
  },
  {
    id: "due-301-apr",
    tower: "A",
    flatNumber: "301",
    ownerName: "Arvind Deshmukh",
    period: "April 2026",
    amount: 5200,
    dueDate: "2026-04-05",
    status: "paid",
    paidDate: "2026-04-02",
    paidMode: "Bank Transfer",
    receiptNumber: "RCPT-2026-0405",
  },
  {
    id: "due-301-may",
    tower: "A",
    flatNumber: "301",
    ownerName: "Arvind Deshmukh",
    period: "May 2026",
    amount: 5200,
    dueDate: "2026-05-05",
    status: "overdue",
    paidDate: null,
    paidMode: null,
    receiptNumber: null,
  },
  {
    id: "due-301-jun",
    tower: "A",
    flatNumber: "301",
    ownerName: "Arvind Deshmukh",
    period: "June 2026",
    amount: 5200,
    dueDate: "2026-06-05",
    status: "overdue",
    paidDate: null,
    paidMode: null,
    receiptNumber: null,
  },
  {
    id: "due-204-apr",
    tower: "B",
    flatNumber: "204",
    ownerName: "Sunita Patil",
    period: "April 2026",
    amount: 4200,
    dueDate: "2026-04-05",
    status: "paid",
    paidDate: "2026-04-05",
    paidMode: "Cash",
    receiptNumber: "RCPT-2026-0409",
  },
  {
    id: "due-204-may",
    tower: "B",
    flatNumber: "204",
    ownerName: "Sunita Patil",
    period: "May 2026",
    amount: 4200,
    dueDate: "2026-05-05",
    status: "paid",
    paidDate: "2026-05-04",
    paidMode: "Cash",
    receiptNumber: "RCPT-2026-0490",
  },
  {
    id: "due-204-jun",
    tower: "B",
    flatNumber: "204",
    ownerName: "Sunita Patil",
    period: "June 2026",
    amount: 4200,
    dueDate: "2026-06-05",
    status: "pending",
    paidDate: null,
    paidMode: null,
    receiptNumber: null,
  },
  {
    id: "due-502-apr",
    tower: "A",
    flatNumber: "502",
    ownerName: "Rohan Mehta",
    period: "April 2026",
    amount: 6000,
    dueDate: "2026-04-05",
    status: "paid",
    paidDate: "2026-04-01",
    paidMode: "UPI",
    receiptNumber: "RCPT-2026-0401",
  },
  {
    id: "due-502-may",
    tower: "A",
    flatNumber: "502",
    ownerName: "Rohan Mehta",
    period: "May 2026",
    amount: 6000,
    dueDate: "2026-05-05",
    status: "paid",
    paidDate: "2026-05-05",
    paidMode: "UPI",
    receiptNumber: "RCPT-2026-0495",
  },
  {
    id: "due-502-jun",
    tower: "A",
    flatNumber: "502",
    ownerName: "Rohan Mehta",
    period: "June 2026",
    amount: 6000,
    dueDate: "2026-06-05",
    status: "pending",
    paidDate: null,
    paidMode: null,
    receiptNumber: null,
  },
  {
    id: "due-103-apr",
    tower: "C",
    flatNumber: "103",
    ownerName: "Kavya Nair",
    period: "April 2026",
    amount: 4000,
    dueDate: "2026-04-05",
    status: "overdue",
    paidDate: null,
    paidMode: null,
    receiptNumber: null,
  },
  {
    id: "due-103-may",
    tower: "C",
    flatNumber: "103",
    ownerName: "Kavya Nair",
    period: "May 2026",
    amount: 4000,
    dueDate: "2026-05-05",
    status: "overdue",
    paidDate: null,
    paidMode: null,
    receiptNumber: null,
  },
  {
    id: "due-103-jun",
    tower: "C",
    flatNumber: "103",
    ownerName: "Kavya Nair",
    period: "June 2026",
    amount: 4000,
    dueDate: "2026-06-05",
    status: "overdue",
    paidDate: null,
    paidMode: null,
    receiptNumber: null,
  },
  {
    id: "due-405-jun",
    tower: "B",
    flatNumber: "405",
    ownerName: "Mohammed Farhan",
    period: "June 2026",
    amount: 4800,
    dueDate: "2026-06-05",
    status: "paid",
    paidDate: "2026-06-04",
    paidMode: "Bank Transfer",
    receiptNumber: "RCPT-2026-0560",
  },
  {
    id: "due-208-jun",
    tower: "C",
    flatNumber: "208",
    ownerName: "Neha Kulkarni",
    period: "June 2026",
    amount: 4300,
    dueDate: "2026-06-05",
    status: "pending",
    paidDate: null,
    paidMode: null,
    receiptNumber: null,
  },
  {
    id: "due-601-jun",
    tower: "A",
    flatNumber: "601",
    ownerName: "Vikram Singh Rathore",
    period: "June 2026",
    amount: 5200,
    dueDate: "2026-06-05",
    status: "paid",
    paidDate: "2026-06-02",
    paidMode: "UPI",
    receiptNumber: "RCPT-2026-0548",
  },
  {
    id: "due-110-jun",
    tower: "B",
    flatNumber: "110",
    ownerName: "Deepak Shah",
    period: "June 2026",
    amount: 3800,
    dueDate: "2026-06-05",
    status: "pending",
    paidDate: null,
    paidMode: null,
    receiptNumber: null,
  },
  {
    id: "due-307-jun",
    tower: "C",
    flatNumber: "307",
    ownerName: "Suresh Iyer",
    period: "June 2026",
    amount: 4600,
    dueDate: "2026-06-05",
    status: "paid",
    paidDate: "2026-06-03",
    paidMode: "Bank Transfer",
    receiptNumber: "RCPT-2026-0553",
  },
  {
    id: "due-402-jun",
    tower: "A",
    flatNumber: "402",
    ownerName: "Vikas Choudhary",
    period: "June 2026",
    amount: 4500,
    dueDate: "2026-06-05",
    status: "paid",
    paidDate: "2026-06-05",
    paidMode: "UPI",
    receiptNumber: "RCPT-2026-0564",
  },
  {
    id: "due-506-jun",
    tower: "C",
    flatNumber: "506",
    ownerName: "Harish Krishnan",
    period: "June 2026",
    amount: 4300,
    dueDate: "2026-06-05",
    status: "overdue",
    paidDate: null,
    paidMode: null,
    receiptNumber: null,
  },
  {
    id: "due-201-jun",
    tower: "B",
    flatNumber: "201",
    ownerName: "Divya Reddy",
    period: "June 2026",
    amount: 4200,
    dueDate: "2026-06-05",
    status: "paid",
    paidDate: "2026-06-01",
    paidMode: "Cheque",
    receiptNumber: "RCPT-2026-0541",
  },
  {
    id: "due-202-jun",
    tower: "A",
    flatNumber: "202",
    ownerName: "Rajesh Kumar",
    period: "June 2026",
    amount: 4000,
    dueDate: "2026-06-05",
    status: "pending",
    paidDate: null,
    paidMode: null,
    receiptNumber: null,
  },
  {
    id: "due-305-jun",
    tower: "B",
    flatNumber: "305",
    ownerName: "Sneha Joshi",
    period: "June 2026",
    amount: 4500,
    dueDate: "2026-06-05",
    status: "overdue",
    paidDate: null,
    paidMode: null,
    receiptNumber: null,
  },
  {
    id: "due-410-jun",
    tower: "C",
    flatNumber: "410",
    ownerName: "Manoj Verma",
    period: "June 2026",
    amount: 4300,
    dueDate: "2026-06-05",
    status: "paid",
    paidDate: "2026-06-04",
    paidMode: "UPI",
    receiptNumber: "RCPT-2026-0558",
  },
];

export function duesForFlat(tower: string, flatNumber: string): FlatMaintenanceDue[] {
  return flatMaintenanceDues
    .filter((d) => d.tower === tower && d.flatNumber === flatNumber)
    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
}

export function maintenanceStatusForFlat(tower: string, flatNumber: string): "paid" | "due" {
  const dues = duesForFlat(tower, flatNumber);
  return dues.length > 0 && dues.every((d) => d.status === "paid") ? "paid" : "due";
}

export function societyCollectionSummary(dues: FlatMaintenanceDue[] = flatMaintenanceDues) {
  const totalBilled = dues.reduce((sum, d) => sum + d.amount, 0);
  const totalCollected = dues
    .filter((d) => d.status === "paid")
    .reduce((sum, d) => sum + d.amount, 0);
  const totalOutstanding = totalBilled - totalCollected;
  const defaulterFlats = new Set(
    dues.filter((d) => d.status === "overdue").map((d) => `${d.tower}-${d.flatNumber}`),
  ).size;
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;
  return { totalBilled, totalCollected, totalOutstanding, defaulterFlats, collectionRate };
}

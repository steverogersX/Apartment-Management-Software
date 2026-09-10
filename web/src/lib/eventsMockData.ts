import { z } from "zod";

/**
 * UI-only mock data for community Events — voluntary, crowd-funded society
 * events (festivals, celebrations) shared with every flat. Distinct from the
 * Budget module (the society's own annual operating spend) and from Invoicing/
 * Dues (mandatory per-flat billing): here flats contribute a variable amount,
 * or none at all, and any shortfall against the target can be topped up from
 * society funds.
 */

export type EventStatus = "Open" | "Closed";

export type CommunityEvent = {
  id: string;
  name: string;
  description: string;
  targetAmount: number;
  eventDate: string;
  status: EventStatus;
  createdBy: string;
  createdAt: string;
  closedAt: string | null;
};

export type ContributionMode = "Cash" | "Cheque" | "NEFT/RTGS" | "UPI" | "Card" | "Online Gateway";

export type EventContribution = {
  id: string;
  eventId: string;
  flatId: string;
  flatLabel: string;
  residentName: string;
  amount: number;
  mode: ContributionMode;
  date: string;
  note: string | null;
  recordedBy: string;
};

export type EventTopUp = {
  id: string;
  eventId: string;
  amount: number;
  note: string;
  date: string;
  recordedBy: string;
};

export const addEventSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  targetAmount: z.coerce.number().min(1, "Target amount must be at least 1"),
  eventDate: z.string().min(1, "Event date is required"),
});

export type AddEventInput = z.infer<typeof addEventSchema>;

export const recordContributionSchema = z.object({
  flatId: z.string().min(1, "Flat is required"),
  residentId: z.string().min(1, "Resident is required"),
  amount: z.coerce.number().min(1, "Amount must be at least 1"),
  mode: z.enum(["Cash", "Cheque", "NEFT/RTGS", "UPI", "Card", "Online Gateway"]),
  date: z.string().min(1, "Date is required"),
  note: z.string().optional(),
});

export type RecordContributionInput = z.infer<typeof recordContributionSchema>;

export const recordTopUpSchema = z.object({
  amount: z.coerce.number().min(1, "Amount must be at least 1"),
  note: z.string().min(2, "Note is required — where the top-up is drawn from"),
  date: z.string().min(1, "Date is required"),
});

export type RecordTopUpInput = z.infer<typeof recordTopUpSchema>;

export const communityEvents: CommunityEvent[] = [
  {
    id: "evt-vinayaka-2026",
    name: "Vinayaka Chavithi 2026",
    description:
      "Ganesh idol, pandal, decorations, prasad and immersion arrangements for the society.",
    targetAmount: 30000,
    eventDate: "2026-09-14T09:00:00+05:30",
    status: "Open",
    createdBy: "Suresh Iyer",
    createdAt: "2026-08-20T10:00:00+05:30",
    closedAt: null,
  },
  {
    id: "evt-diwali-2025",
    name: "Diwali Celebration 2025",
    description: "Society-wide Diwali lighting, rangoli contest and sweets distribution.",
    targetAmount: 25000,
    eventDate: "2025-10-20T18:00:00+05:30",
    status: "Closed",
    createdBy: "Suresh Iyer",
    createdAt: "2025-09-25T10:00:00+05:30",
    closedAt: "2025-10-22T12:00:00+05:30",
  },
];

export const eventContributions: EventContribution[] = [
  {
    id: "ec-1",
    eventId: "evt-vinayaka-2026",
    flatId: "flat-a301",
    flatLabel: "A-301",
    residentName: "Arvind Deshmukh",
    amount: 3000,
    mode: "UPI",
    date: "2026-08-21T11:00:00+05:30",
    note: null,
    recordedBy: "Suresh Iyer",
  },
  {
    id: "ec-2",
    eventId: "evt-vinayaka-2026",
    flatId: "flat-b204",
    flatLabel: "B-204",
    residentName: "Sunita Patil",
    amount: 2000,
    mode: "Cash",
    date: "2026-08-22T09:30:00+05:30",
    note: null,
    recordedBy: "Suresh Iyer",
  },
  {
    id: "ec-3",
    eventId: "evt-vinayaka-2026",
    flatId: "flat-a502",
    flatLabel: "A-502",
    residentName: "Rohan Mehta",
    amount: 2500,
    mode: "UPI",
    date: "2026-08-23T18:15:00+05:30",
    note: null,
    recordedBy: "Suresh Iyer",
  },
  {
    id: "ec-4",
    eventId: "evt-vinayaka-2026",
    flatId: "flat-c103",
    flatLabel: "C-103",
    residentName: "Kavya Nair",
    amount: 1500,
    mode: "Online Gateway",
    date: "2026-08-25T20:00:00+05:30",
    note: null,
    recordedBy: "Suresh Iyer",
  },
  {
    id: "ec-5",
    eventId: "evt-vinayaka-2026",
    flatId: "flat-a601",
    flatLabel: "A-601",
    residentName: "Vikram Singh Rathore",
    amount: 5000,
    mode: "NEFT/RTGS",
    date: "2026-08-28T10:45:00+05:30",
    note: "Happy to sponsor decorations",
    recordedBy: "Suresh Iyer",
  },
  {
    id: "ec-6",
    eventId: "evt-vinayaka-2026",
    flatId: "flat-c307",
    flatLabel: "C-307",
    residentName: "Suresh Iyer",
    amount: 2000,
    mode: "Cash",
    date: "2026-08-30T08:00:00+05:30",
    note: null,
    recordedBy: "Suresh Iyer",
  },
  {
    id: "ec-7",
    eventId: "evt-vinayaka-2026",
    flatId: "flat-b201",
    flatLabel: "B-201",
    residentName: "Divya Reddy",
    amount: 2000,
    mode: "UPI",
    date: "2026-09-02T19:20:00+05:30",
    note: null,
    recordedBy: "Suresh Iyer",
  },

  {
    id: "ec-8",
    eventId: "evt-diwali-2025",
    flatId: "flat-a301",
    flatLabel: "A-301",
    residentName: "Arvind Deshmukh",
    amount: 2500,
    mode: "UPI",
    date: "2025-09-28T11:00:00+05:30",
    note: null,
    recordedBy: "Suresh Iyer",
  },
  {
    id: "ec-9",
    eventId: "evt-diwali-2025",
    flatId: "flat-b204",
    flatLabel: "B-204",
    residentName: "Sunita Patil",
    amount: 2000,
    mode: "Cash",
    date: "2025-09-29T09:30:00+05:30",
    note: null,
    recordedBy: "Suresh Iyer",
  },
  {
    id: "ec-10",
    eventId: "evt-diwali-2025",
    flatId: "flat-a502",
    flatLabel: "A-502",
    residentName: "Rohan Mehta",
    amount: 3000,
    mode: "UPI",
    date: "2025-10-01T18:15:00+05:30",
    note: null,
    recordedBy: "Suresh Iyer",
  },
  {
    id: "ec-11",
    eventId: "evt-diwali-2025",
    flatId: "flat-c208",
    flatLabel: "C-208",
    residentName: "Neha Kulkarni",
    amount: 2500,
    mode: "Cheque",
    date: "2025-10-03T14:00:00+05:30",
    note: null,
    recordedBy: "Suresh Iyer",
  },
  {
    id: "ec-12",
    eventId: "evt-diwali-2025",
    flatId: "flat-a601",
    flatLabel: "A-601",
    residentName: "Vikram Singh Rathore",
    amount: 4000,
    mode: "NEFT/RTGS",
    date: "2025-10-05T10:45:00+05:30",
    note: null,
    recordedBy: "Suresh Iyer",
  },
  {
    id: "ec-13",
    eventId: "evt-diwali-2025",
    flatId: "flat-b110",
    flatLabel: "B-110",
    residentName: "Ananya Gupta",
    amount: 1500,
    mode: "UPI",
    date: "2025-10-08T20:00:00+05:30",
    note: null,
    recordedBy: "Suresh Iyer",
  },
  {
    id: "ec-14",
    eventId: "evt-diwali-2025",
    flatId: "flat-c307",
    flatLabel: "C-307",
    residentName: "Suresh Iyer",
    amount: 2000,
    mode: "Cash",
    date: "2025-10-10T08:00:00+05:30",
    note: null,
    recordedBy: "Suresh Iyer",
  },
  {
    id: "ec-15",
    eventId: "evt-diwali-2025",
    flatId: "flat-a402",
    flatLabel: "A-402",
    residentName: "Pooja Banerjee",
    amount: 2500,
    mode: "UPI",
    date: "2025-10-12T19:20:00+05:30",
    note: null,
    recordedBy: "Suresh Iyer",
  },
];

export const eventTopUps: EventTopUp[] = [
  {
    id: "et-1",
    eventId: "evt-diwali-2025",
    amount: 5000,
    note: "Shortfall covered from society general fund to settle vendor payments before Diwali",
    date: "2025-10-18T12:00:00+05:30",
    recordedBy: "Suresh Iyer",
  },
];

export function contributionsFor(eventId: string): EventContribution[] {
  return eventContributions.filter((c) => c.eventId === eventId);
}

export function topUpsFor(eventId: string): EventTopUp[] {
  return eventTopUps.filter((t) => t.eventId === eventId);
}

export function fundingSummary(event: CommunityEvent) {
  const contributed = contributionsFor(event.id).reduce((sum, c) => sum + c.amount, 0);
  const toppedUp = topUpsFor(event.id).reduce((sum, t) => sum + t.amount, 0);
  const funded = contributed + toppedUp;
  const pending = Math.max(0, event.targetAmount - funded);
  const fundedPct = event.targetAmount > 0 ? Math.min(100, (funded / event.targetAmount) * 100) : 0;
  return { contributed, toppedUp, funded, pending, fundedPct };
}

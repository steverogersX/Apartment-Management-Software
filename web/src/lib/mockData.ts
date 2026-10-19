import { flats } from "./flatsMockData";
import { computeOutstandingBalance, invoices } from "./invoicingMockData";
import { societyVisitors } from "./visitorsMockData";

export type ComplaintStatus = "open" | "in_progress" | "resolved" | "escalated";
export type ComplaintPriority = "low" | "medium" | "high";

export type Complaint = {
  id: string;
  ticketNumber: string;
  title: string;
  category: string;
  type: "individual" | "community";
  status: ComplaintStatus;
  priority: ComplaintPriority;
  createdAt: string;
  resolvedAt: string | null;
  raisedBy: string;
  tower: string;
  flatNumber: string;
  assignedTo: { name: string; initials: string } | null;
};

export type Vehicle = {
  id: string;
  registrationNumber: string;
  type: "car" | "two_wheeler";
  make: string;
  model: string;
  color: string;
  parkingSlot: string | null;
};

export type Flat = {
  flatNumber: string;
  apartmentName: string;
  floor: number;
  type: string;
  areaSqft: number;
  ownerName: string;
  tenantName: string | null;
};

export type VisitorStatus =
  "expected" | "pending_approval" | "entered" | "completed" | "denied" | "expired";

export type Visitor = {
  id: string;
  name: string;
  date: string;
  time: string;
  status: VisitorStatus;
  passCode: string;
};

const RESIDENT_FLAT_LABEL = "B-304";

function getResidentVisitorLog(): Visitor[] {
  return societyVisitors
    .filter((v) => v.flatNumber === RESIDENT_FLAT_LABEL)
    .map((v) => ({
      id: v.id,
      name: v.name,
      date: v.date,
      time: v.expectedTime,
      status: v.status,
      passCode: v.passCode,
    }));
}

export const visitors_log: Visitor[] = getResidentVisitorLog();

export type NoticeKind = "maintenance" | "event" | "feature" | "general";

export type Notice = {
  id: string;
  title: string;
  excerpt: string;
  postedAt: string;
  kind: NoticeKind;
  unread: boolean;
};

export type BillMonth = {
  date: string;
  month: string;
  paid: number;
  due: number;
};

export const society = {
  name: "Green Valley Residency",
  initials: "GV",
  location: "MVP Colony, Vizag",
};

export const memberSocieties: { name: string; initials: string; role: string }[] = [
  { name: "Green Valley Residency", initials: "GV", role: "Owner · Flat 304" },
  { name: "Sai Enclave", initials: "SE", role: "Tenant · Flat 104" },
];

export const currentFlat: Flat = {
  flatNumber: "304",
  apartmentName: "Tower B",
  floor: 3,
  type: "3BHK",
  areaSqft: 1450,
  ownerName: "Padma Konkonapala",
  tenantName: null,
};

export const stats = {
  outstandingDues: 8400,
  openComplaints: 3,
  activeVehicles: 2,
  upcomingBookings: 1,
};

/** Months before invoicing went live in the app; later months come from the flat's invoices. */
const LEGACY_BILL_HISTORY: BillMonth[] = [
  { date: "2025-07-01", month: "Jul", paid: 4100, due: 0 },
  { date: "2025-08-01", month: "Aug", paid: 4100, due: 0 },
  { date: "2025-09-01", month: "Sep", paid: 4250, due: 0 },
  { date: "2025-10-01", month: "Oct", paid: 4250, due: 0 },
  { date: "2025-11-01", month: "Nov", paid: 4250, due: 0 },
  { date: "2025-12-01", month: "Dec", paid: 4400, due: 0 },
  { date: "2026-01-01", month: "Jan", paid: 4200, due: 0 },
  { date: "2026-02-01", month: "Feb", paid: 4200, due: 0 },
  { date: "2026-03-01", month: "Mar", paid: 4350, due: 0 },
];

export function getBillHistory(): BillMonth[] {
  const flat = flats.find(
    (f) =>
      f.flatNumber === currentFlat.flatNumber && `Tower ${f.tower}` === currentFlat.apartmentName,
  );
  const byMonth = new Map<string, BillMonth>();
  for (const invoice of invoices) {
    if (!flat || invoice.flatId !== flat.id) continue;
    if (invoice.status === "Cancelled" || invoice.status === "Draft") continue;
    const date = `${invoice.issueDate.slice(0, 7)}-01`;
    const entry = byMonth.get(date) ?? {
      date,
      month: new Date(date).toLocaleDateString("en-IN", { month: "short" }),
      paid: 0,
      due: 0,
    };
    entry.paid += invoice.amountPaid;
    entry.due += computeOutstandingBalance(invoice);
    byMonth.set(date, entry);
  }
  return [
    ...LEGACY_BILL_HISTORY,
    ...[...byMonth.values()].sort((a, b) => a.date.localeCompare(b.date)),
  ];
}

export const complaintStatusBreakdown: { status: ComplaintStatus; count: number }[] = [
  { status: "open", count: 3 },
  { status: "in_progress", count: 2 },
  { status: "resolved", count: 11 },
  { status: "escalated", count: 1 },
];

export const complaints: Complaint[] = [
  {
    id: "1",
    ticketNumber: "TCK-2026-0142",
    title: "Bathroom tap dripping continuously",
    category: "Plumbing",
    type: "individual",
    status: "in_progress",
    priority: "medium",
    createdAt: "2026-06-15T09:30:00+05:30",
    resolvedAt: null,
    raisedBy: "Padma Konkonapala",
    tower: "B",
    flatNumber: "304",
    assignedTo: { name: "Ravi Kumar", initials: "RK" },
  },
  {
    id: "2",
    ticketNumber: "TCK-2026-0139",
    title: "Lift in Tower B making grinding noise",
    category: "Common Area",
    type: "community",
    status: "escalated",
    priority: "high",
    createdAt: "2026-06-12T14:05:00+05:30",
    resolvedAt: null,
    raisedBy: "Padma Konkonapala",
    tower: "B",
    flatNumber: "304",
    assignedTo: null,
  },
  {
    id: "3",
    ticketNumber: "TCK-2026-0137",
    title: "Streetlight near Gate 2 not working",
    category: "Electrical",
    type: "community",
    status: "open",
    priority: "low",
    createdAt: "2026-06-10T18:20:00+05:30",
    resolvedAt: null,
    raisedBy: "Padma Konkonapala",
    tower: "B",
    flatNumber: "304",
    assignedTo: null,
  },
  {
    id: "4",
    ticketNumber: "TCK-2026-0128",
    title: "AC servicing request — living room unit",
    category: "Maintenance",
    type: "individual",
    status: "resolved",
    priority: "low",
    createdAt: "2026-05-28T11:00:00+05:30",
    resolvedAt: "2026-05-30T16:40:00+05:30",
    raisedBy: "Padma Konkonapala",
    tower: "B",
    flatNumber: "304",
    assignedTo: { name: "Suresh Babu", initials: "SB" },
  },
  {
    id: "5",
    ticketNumber: "TCK-2026-0119",
    title: "Water seepage near kitchen ceiling",
    category: "Plumbing",
    type: "individual",
    status: "resolved",
    priority: "high",
    createdAt: "2026-05-18T08:15:00+05:30",
    resolvedAt: "2026-05-22T10:00:00+05:30",
    raisedBy: "Padma Konkonapala",
    tower: "B",
    flatNumber: "304",
    assignedTo: { name: "Ravi Kumar", initials: "RK" },
  },
  {
    id: "6",
    ticketNumber: "TCK-2026-0103",
    title: "Garbage not collected from chute room",
    category: "Housekeeping",
    type: "community",
    status: "open",
    priority: "medium",
    createdAt: "2026-06-16T07:45:00+05:30",
    resolvedAt: null,
    raisedBy: "Padma Konkonapala",
    tower: "B",
    flatNumber: "304",
    assignedTo: null,
  },
];

export type ComplaintStatusEvent = {
  id: string;
  complaintId: string;
  status: ComplaintStatus;
  note: string;
  at: string;
  by: string;
};

export const complaintStatusEvents: ComplaintStatusEvent[] = [
  {
    id: "cse-1-1",
    complaintId: "1",
    status: "open",
    note: "Ticket raised",
    at: "2026-06-15T09:30:00+05:30",
    by: "Padma Konkonapala",
  },
  {
    id: "cse-1-2",
    complaintId: "1",
    status: "in_progress",
    note: "Assigned to plumber",
    at: "2026-06-15T13:10:00+05:30",
    by: "Ravi Kumar",
  },

  {
    id: "cse-2-1",
    complaintId: "2",
    status: "open",
    note: "Ticket raised",
    at: "2026-06-12T14:05:00+05:30",
    by: "Padma Konkonapala",
  },
  {
    id: "cse-2-2",
    complaintId: "2",
    status: "escalated",
    note: "No response after 3 days — escalated to facilities vendor",
    at: "2026-06-15T10:00:00+05:30",
    by: "Society Admin",
  },

  {
    id: "cse-3-1",
    complaintId: "3",
    status: "open",
    note: "Ticket raised",
    at: "2026-06-10T18:20:00+05:30",
    by: "Padma Konkonapala",
  },

  {
    id: "cse-4-1",
    complaintId: "4",
    status: "open",
    note: "Ticket raised",
    at: "2026-05-28T11:00:00+05:30",
    by: "Padma Konkonapala",
  },
  {
    id: "cse-4-2",
    complaintId: "4",
    status: "in_progress",
    note: "Technician visit scheduled",
    at: "2026-05-29T09:15:00+05:30",
    by: "Suresh Babu",
  },
  {
    id: "cse-4-3",
    complaintId: "4",
    status: "resolved",
    note: "AC serviced and tested",
    at: "2026-05-30T16:40:00+05:30",
    by: "Suresh Babu",
  },

  {
    id: "cse-5-1",
    complaintId: "5",
    status: "open",
    note: "Ticket raised",
    at: "2026-05-18T08:15:00+05:30",
    by: "Padma Konkonapala",
  },
  {
    id: "cse-5-2",
    complaintId: "5",
    status: "in_progress",
    note: "Plumber inspected the ceiling",
    at: "2026-05-19T11:00:00+05:30",
    by: "Ravi Kumar",
  },
  {
    id: "cse-5-3",
    complaintId: "5",
    status: "resolved",
    note: "Leak sealed and area cleaned",
    at: "2026-05-22T10:00:00+05:30",
    by: "Ravi Kumar",
  },

  {
    id: "cse-6-1",
    complaintId: "6",
    status: "open",
    note: "Ticket raised",
    at: "2026-06-16T07:45:00+05:30",
    by: "Padma Konkonapala",
  },
];

export function getComplaintTimeline(complaintId: string): ComplaintStatusEvent[] {
  return complaintStatusEvents
    .filter((e) => e.complaintId === complaintId)
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
}

export const notices: Notice[] = [
  {
    id: "1",
    title: "Water supply shutdown — tank cleaning",
    excerpt: "Water will be suspended 10 AM–1 PM on Jun 20 for annual tank cleaning.",
    postedAt: "2026-06-16T10:00:00+05:30",
    kind: "maintenance",
    unread: true,
  },
  {
    id: "2",
    title: "AGM scheduled for July 5th",
    excerpt: "Annual General Meeting at the clubhouse, 6:30 PM. Attendance encouraged.",
    postedAt: "2026-06-14T17:30:00+05:30",
    kind: "event",
    unread: true,
  },
  {
    id: "3",
    title: "New visitor pre-approval flow live",
    excerpt: "Pre-approve guests with a digital pass directly from the Visitors tab.",
    postedAt: "2026-06-10T09:00:00+05:30",
    kind: "feature",
    unread: false,
  },
  {
    id: "4",
    title: "Diwali decoration volunteers needed",
    excerpt: "Sign up at the helpdesk to help plan this year's common-area decorations.",
    postedAt: "2026-06-05T12:00:00+05:30",
    kind: "general",
    unread: false,
  },
];

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

export type VisitorStatus = "expected" | "entered" | "completed" | "denied" | "expired";

export type Visitor = {
  id: string;
  name: string;
  date: string;
  time: string;
  status: VisitorStatus;
  passCode: string;
};

export const visitors_log: Visitor[] = [
  {
    id: "1",
    name: "Ramesh Delivery (Amazon)",
    date: "2026-06-18",
    time: "11:30",
    status: "expected",
    passCode: "GVR-7K2P9X",
  },
  {
    id: "2",
    name: "Lakshmi Aunty",
    date: "2026-06-17",
    time: "18:00",
    status: "entered",
    passCode: "GVR-3M8Q1Z",
  },
  {
    id: "3",
    name: "Swiggy — Order #44213",
    date: "2026-06-17",
    time: "13:15",
    status: "completed",
    passCode: "GVR-9F4T2A",
  },
  {
    id: "4",
    name: "AC Service Technician",
    date: "2026-06-16",
    time: "10:00",
    status: "completed",
    passCode: "GVR-5J7N6B",
  },
  {
    id: "5",
    name: "Unknown Salesperson",
    date: "2026-06-15",
    time: "16:45",
    status: "denied",
    passCode: "GVR-2C1V8D",
  },
  {
    id: "6",
    name: "Cousin — Arjun",
    date: "2026-06-14",
    time: "19:30",
    status: "completed",
    passCode: "GVR-8H5R3E",
  },
  {
    id: "7",
    name: "Flipkart Delivery",
    date: "2026-06-13",
    time: "12:00",
    status: "expired",
    passCode: "GVR-6B9L4F",
  },
];

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

export const billHistory: BillMonth[] = [
  { date: "2025-07-01", month: "Jul", paid: 4100, due: 0 },
  { date: "2025-08-01", month: "Aug", paid: 4100, due: 0 },
  { date: "2025-09-01", month: "Sep", paid: 4250, due: 0 },
  { date: "2025-10-01", month: "Oct", paid: 4250, due: 0 },
  { date: "2025-11-01", month: "Nov", paid: 4250, due: 0 },
  { date: "2025-12-01", month: "Dec", paid: 4400, due: 0 },
  { date: "2026-01-01", month: "Jan", paid: 4200, due: 0 },
  { date: "2026-02-01", month: "Feb", paid: 4200, due: 0 },
  { date: "2026-03-01", month: "Mar", paid: 4350, due: 0 },
  { date: "2026-04-01", month: "Apr", paid: 0, due: 4350 },
  { date: "2026-05-01", month: "May", paid: 4350, due: 0 },
  { date: "2026-06-01", month: "Jun", paid: 0, due: 8400 },
];

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
    assignedTo: null,
  },
];

export const vehicles: Vehicle[] = [
  {
    id: "1",
    registrationNumber: "AP 31 BT 4521",
    type: "car",
    make: "Hyundai",
    model: "Creta",
    color: "White",
    parkingSlot: "B-12",
  },
  {
    id: "2",
    registrationNumber: "AP 31 CX 0098",
    type: "two_wheeler",
    make: "Honda",
    model: "Activa",
    color: "Grey",
    parkingSlot: "B-13",
  },
];

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

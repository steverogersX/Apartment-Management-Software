import type { VisitorStatus } from "./mockData";

export type SocietyVisitorCategory = "guest" | "delivery" | "cab" | "service" | "other";

export type VisitorType = "pre_approved" | "walk_in";

export type SocietyVisitor = {
  id: string;
  name: string;
  phone: string;
  category: SocietyVisitorCategory;
  flatNumber: string;
  invitedBy: string;
  date: string;
  expectedTime: string;
  visitorType: VisitorType;
  arrivedAt: string | null;
  checkIn: string | null;
  checkOut: string | null;
  status: VisitorStatus;
  passCode: string;
  verifiedBy: string | null;
  deniedBy?: string | null;
  deniedAt?: string | null;
  deniedReason?: string | null;
  photoUrl?: string;
};

export type VisitorProfileStatus = "active" | "blocked";

export type VisitorProfile = {
  phone: string;
  name: string;
  category: SocietyVisitorCategory;
  flatNumber: string;
  lastVisit: string;
  firstSeen: string;
  visitCount: number;
  isFrequent: boolean;
  status: VisitorProfileStatus;
  blockedReason?: string;
  blockedBy?: string;
  blockedOn?: string;
  photoUrl?: string;
};

export type FrequentVisitor = {
  id: string;
  name: string;
  phone: string;
  category: SocietyVisitorCategory;
  flatsVisited: string[];
  visitCount: number;
  lastVisit: string;
};

export type BlockedVisitor = {
  id: string;
  name: string;
  phone: string;
  reason: string;
  blockedBy: string;
  blockedOn: string;
};

function todayStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function isoAt(dateStr: string, time: string) {
  return `${dateStr}T${time}:00+05:30`;
}

const today = todayStr(0);
const tomorrow = todayStr(1);
const yesterday = todayStr(-1);
const twoDaysAgo = todayStr(-2);
const fiveDaysAgo = todayStr(-5);
const tenDaysAgo = todayStr(-10);

export const societyVisitors: SocietyVisitor[] = [
  {
    id: "sv-1",
    name: "Ramesh Delivery (Amazon)",
    phone: "+91 98765 11101",
    category: "delivery",
    flatNumber: "A-301",
    invitedBy: "Arvind Deshmukh",
    date: today,
    expectedTime: "11:30",
    visitorType: "pre_approved",
    arrivedAt: null,
    checkIn: isoAt(today, "11:35"),
    checkOut: null,
    status: "entered",
    passCode: "GVR-7K2P9X",
    verifiedBy: "Suresh Babu",
    photoUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=sv-1",
  },
  {
    id: "sv-2",
    name: "Lakshmi Aunty",
    phone: "+91 98765 22202",
    category: "guest",
    flatNumber: "B-204",
    invitedBy: "Sunita Patil",
    date: today,
    expectedTime: "18:00",
    visitorType: "pre_approved",
    arrivedAt: null,
    checkIn: isoAt(today, "18:05"),
    checkOut: null,
    status: "entered",
    passCode: "GVR-3M8Q1Z",
    verifiedBy: "Naveen Babu",
  },
  {
    id: "sv-3",
    name: "Swiggy — Order #44213",
    phone: "+91 98765 33303",
    category: "delivery",
    flatNumber: "A-502",
    invitedBy: "Rohan Mehta",
    date: today,
    expectedTime: "13:15",
    visitorType: "pre_approved",
    arrivedAt: null,
    checkIn: isoAt(today, "13:10"),
    checkOut: isoAt(today, "13:40"),
    status: "completed",
    passCode: "GVR-9F4T2A",
    verifiedBy: "Suresh Babu",
  },
  {
    id: "sv-4",
    name: "AC Service Technician",
    phone: "+91 98765 44404",
    category: "service",
    flatNumber: "C-103",
    invitedBy: "Kavya Nair",
    date: today,
    expectedTime: "10:00",
    visitorType: "pre_approved",
    arrivedAt: null,
    checkIn: isoAt(today, "10:05"),
    checkOut: isoAt(today, "12:30"),
    status: "completed",
    passCode: "GVR-5J7N6B",
    verifiedBy: "Naveen Babu",
  },
  {
    id: "sv-5",
    name: "Unknown Salesperson",
    phone: "+91 98765 55505",
    category: "other",
    flatNumber: "B-405",
    invitedBy: "Mohammed Farhan",
    date: today,
    expectedTime: "16:45",
    visitorType: "walk_in",
    arrivedAt: isoAt(today, "16:40"),
    checkIn: null,
    checkOut: null,
    status: "denied",
    passCode: "GVR-2C1V8D",
    verifiedBy: null,
    deniedBy: "Suresh Babu",
    deniedAt: isoAt(today, "16:42"),
    deniedReason: "No resident approval",
  },
  {
    id: "sv-6",
    name: "Cousin — Arjun",
    phone: "+91 98765 66606",
    category: "guest",
    flatNumber: "A-601",
    invitedBy: "Vikram Singh Rathore",
    date: yesterday,
    expectedTime: "19:30",
    visitorType: "pre_approved",
    arrivedAt: null,
    checkIn: isoAt(yesterday, "19:35"),
    checkOut: isoAt(yesterday, "21:00"),
    status: "completed",
    passCode: "GVR-8H5R3E",
    verifiedBy: "Suresh Babu",
  },
  {
    id: "sv-7",
    name: "Flipkart Delivery",
    phone: "+91 98765 77707",
    category: "delivery",
    flatNumber: "B-110",
    invitedBy: "Ananya Gupta",
    date: yesterday,
    expectedTime: "12:00",
    visitorType: "pre_approved",
    arrivedAt: null,
    checkIn: null,
    checkOut: null,
    status: "expected",
    passCode: "GVR-6B9L4F",
    verifiedBy: null,
  },
  {
    id: "sv-8",
    name: "Ola Cab — KA01 2345",
    phone: "+91 98765 88808",
    category: "cab",
    flatNumber: "C-307",
    invitedBy: "Suresh Iyer",
    date: yesterday,
    expectedTime: "08:30",
    visitorType: "pre_approved",
    arrivedAt: null,
    checkIn: isoAt(yesterday, "08:35"),
    checkOut: isoAt(yesterday, "09:00"),
    status: "completed",
    passCode: "GVR-1A2B3C",
    verifiedBy: "Naveen Babu",
  },
  {
    id: "sv-9",
    name: "Lakshmi Cook",
    phone: "+91 98765 11111",
    category: "service",
    flatNumber: "A-301",
    invitedBy: "Arvind Deshmukh",
    date: today,
    expectedTime: "08:00",
    visitorType: "pre_approved",
    arrivedAt: null,
    checkIn: isoAt(today, "08:05"),
    checkOut: isoAt(today, "09:00"),
    status: "completed",
    passCode: "GVR-4D5E6F",
    verifiedBy: "Suresh Babu",
  },
  {
    id: "sv-10",
    name: "Lakshmi Cook",
    phone: "+91 98765 11111",
    category: "service",
    flatNumber: "B-204",
    invitedBy: "Sunita Patil",
    date: yesterday,
    expectedTime: "08:10",
    visitorType: "pre_approved",
    arrivedAt: null,
    checkIn: isoAt(yesterday, "08:12"),
    checkOut: isoAt(yesterday, "09:10"),
    status: "completed",
    passCode: "GVR-7G8H9I",
    verifiedBy: "Naveen Babu",
  },
  {
    id: "sv-11",
    name: "Lakshmi Cook",
    phone: "+91 98765 11111",
    category: "service",
    flatNumber: "A-502",
    invitedBy: "Rohan Mehta",
    date: twoDaysAgo,
    expectedTime: "08:00",
    visitorType: "pre_approved",
    arrivedAt: null,
    checkIn: isoAt(twoDaysAgo, "08:03"),
    checkOut: isoAt(twoDaysAgo, "09:05"),
    status: "completed",
    passCode: "GVR-0J1K2L",
    verifiedBy: "Suresh Babu",
  },
  {
    id: "sv-12",
    name: "Raju Cab Driver",
    phone: "+91 98765 22222",
    category: "cab",
    flatNumber: "A-601",
    invitedBy: "Vikram Singh Rathore",
    date: today,
    expectedTime: "07:30",
    visitorType: "pre_approved",
    arrivedAt: null,
    checkIn: isoAt(today, "07:35"),
    checkOut: isoAt(today, "07:50"),
    status: "completed",
    passCode: "GVR-3M4N5O",
    verifiedBy: "Naveen Babu",
  },
  {
    id: "sv-13",
    name: "Raju Cab Driver",
    phone: "+91 98765 22222",
    category: "cab",
    flatNumber: "C-307",
    invitedBy: "Suresh Iyer",
    date: yesterday,
    expectedTime: "07:45",
    visitorType: "pre_approved",
    arrivedAt: null,
    checkIn: isoAt(yesterday, "07:48"),
    checkOut: isoAt(yesterday, "08:10"),
    status: "completed",
    passCode: "GVR-6P7Q8R",
    verifiedBy: "Suresh Babu",
  },
  {
    id: "sv-14",
    name: "Raju Cab Driver",
    phone: "+91 98765 22222",
    category: "cab",
    flatNumber: "B-110",
    invitedBy: "Ananya Gupta",
    date: twoDaysAgo,
    expectedTime: "07:30",
    visitorType: "pre_approved",
    arrivedAt: null,
    checkIn: isoAt(twoDaysAgo, "07:33"),
    checkOut: isoAt(twoDaysAgo, "07:55"),
    status: "completed",
    passCode: "GVR-9S0T1U",
    verifiedBy: "Naveen Babu",
  },
  {
    id: "sv-15",
    name: "Raju Cab Driver",
    phone: "+91 98765 22222",
    category: "cab",
    flatNumber: "B-201",
    invitedBy: "Divya Reddy",
    date: fiveDaysAgo,
    expectedTime: "07:30",
    visitorType: "pre_approved",
    arrivedAt: null,
    checkIn: isoAt(fiveDaysAgo, "07:32"),
    checkOut: isoAt(fiveDaysAgo, "07:48"),
    status: "completed",
    passCode: "GVR-2V3W4X",
    verifiedBy: "Suresh Babu",
  },
  {
    id: "sv-16",
    name: "Sunita Housekeeping",
    phone: "+91 98765 33333",
    category: "service",
    flatNumber: "B-405",
    invitedBy: "Mohammed Farhan",
    date: today,
    expectedTime: "07:30",
    visitorType: "pre_approved",
    arrivedAt: null,
    checkIn: isoAt(today, "07:32"),
    checkOut: isoAt(today, "08:30"),
    status: "completed",
    passCode: "GVR-5Y6Z7A",
    verifiedBy: "Suresh Babu",
  },
  {
    id: "sv-17",
    name: "Sunita Housekeeping",
    phone: "+91 98765 33333",
    category: "service",
    flatNumber: "C-208",
    invitedBy: "Neha Kulkarni",
    date: yesterday,
    expectedTime: "07:35",
    visitorType: "pre_approved",
    arrivedAt: null,
    checkIn: isoAt(yesterday, "07:36"),
    checkOut: isoAt(yesterday, "08:40"),
    status: "completed",
    passCode: "GVR-8B9C0D",
    verifiedBy: "Naveen Babu",
  },
  {
    id: "sv-18",
    name: "Sunita Housekeeping",
    phone: "+91 98765 33333",
    category: "service",
    flatNumber: "A-301",
    invitedBy: "Arvind Deshmukh",
    date: twoDaysAgo,
    expectedTime: "07:40",
    visitorType: "pre_approved",
    arrivedAt: null,
    checkIn: isoAt(twoDaysAgo, "07:42"),
    checkOut: isoAt(twoDaysAgo, "08:45"),
    status: "completed",
    passCode: "GVR-1E2F3G",
    verifiedBy: "Suresh Babu",
  },
  {
    id: "sv-19",
    name: "Courier — DTDC",
    phone: "+91 98765 40404",
    category: "delivery",
    flatNumber: "C-506",
    invitedBy: "Harish Krishnan",
    date: fiveDaysAgo,
    expectedTime: "15:00",
    visitorType: "pre_approved",
    arrivedAt: null,
    checkIn: isoAt(fiveDaysAgo, "15:05"),
    checkOut: isoAt(fiveDaysAgo, "15:20"),
    status: "completed",
    passCode: "GVR-3A4B5C",
    verifiedBy: "Naveen Babu",
  },
  {
    id: "sv-20",
    name: "Zomato Delivery",
    phone: "+91 98765 70707",
    category: "delivery",
    flatNumber: "B-405",
    invitedBy: "Mohammed Farhan",
    date: tenDaysAgo,
    expectedTime: "20:30",
    visitorType: "pre_approved",
    arrivedAt: null,
    checkIn: isoAt(tenDaysAgo, "20:35"),
    checkOut: isoAt(tenDaysAgo, "20:50"),
    status: "completed",
    passCode: "GVR-4C5D6E",
    verifiedBy: "Naveen Babu",
  },
  {
    id: "sv-21",
    name: "Walk-in Guest — Priya Shah",
    phone: "+91 98765 12121",
    category: "guest",
    flatNumber: "A-301",
    invitedBy: "Arvind Deshmukh",
    date: today,
    expectedTime: "09:42",
    visitorType: "walk_in",
    arrivedAt: isoAt(today, "09:42"),
    checkIn: null,
    checkOut: null,
    status: "pending_approval",
    passCode: "GVR-1P2Q3R",
    verifiedBy: null,
  },
  {
    id: "sv-22",
    name: "Courier — Bluedart",
    phone: "+91 98765 13131",
    category: "delivery",
    flatNumber: "B-204",
    invitedBy: "Sunita Patil",
    date: today,
    expectedTime: "10:15",
    visitorType: "walk_in",
    arrivedAt: isoAt(today, "10:15"),
    checkIn: null,
    checkOut: null,
    status: "pending_approval",
    passCode: "GVR-4S5T6U",
    verifiedBy: null,
  },
  {
    id: "sv-26",
    name: "Guest — Expected Today",
    phone: "+91 98765 17171",
    category: "guest",
    flatNumber: "B-110",
    invitedBy: "Ananya Gupta",
    date: today,
    expectedTime: "15:30",
    visitorType: "pre_approved",
    arrivedAt: null,
    checkIn: null,
    checkOut: null,
    status: "expected",
    passCode: "GVR-8C9D0E",
    verifiedBy: null,
    photoUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=sv-26",
  },
  {
    id: "sv-23",
    name: "Guest — Tomorrow Party",
    phone: "+91 98765 14141",
    category: "guest",
    flatNumber: "A-601",
    invitedBy: "Vikram Singh Rathore",
    date: tomorrow,
    expectedTime: "19:00",
    visitorType: "pre_approved",
    arrivedAt: null,
    checkIn: null,
    checkOut: null,
    status: "expected",
    passCode: "GVR-7V8W9X",
    verifiedBy: null,
  },
  {
    id: "sv-24",
    name: "Service — Electrician Tomorrow",
    phone: "+91 98765 15151",
    category: "service",
    flatNumber: "C-103",
    invitedBy: "Kavya Nair",
    date: tomorrow,
    expectedTime: "11:00",
    visitorType: "pre_approved",
    arrivedAt: null,
    checkIn: null,
    checkOut: null,
    status: "expected",
    passCode: "GVR-0Y1Z2A",
    verifiedBy: null,
  },
  {
    id: "sv-25",
    name: "Delivery — Expired Test",
    phone: "+91 98765 16161",
    category: "delivery",
    flatNumber: "A-301",
    invitedBy: "Arvind Deshmukh",
    date: tenDaysAgo,
    expectedTime: "10:00",
    visitorType: "pre_approved",
    arrivedAt: null,
    checkIn: null,
    checkOut: null,
    status: "expected",
    passCode: "GVR-3B4C5D",
    verifiedBy: null,
  },
  {
    id: "sv-b304-1",
    name: "Ramesh Delivery (Amazon)",
    phone: "+91 98765 30401",
    category: "delivery",
    flatNumber: "B-304",
    invitedBy: "Padma Konkonapala",
    date: "2026-06-18",
    expectedTime: "11:30",
    visitorType: "pre_approved",
    arrivedAt: null,
    checkIn: null,
    checkOut: null,
    status: "expected",
    passCode: "GVR-7K2P9X",
    verifiedBy: null,
  },
  {
    id: "sv-b304-2",
    name: "Lakshmi Aunty",
    phone: "+91 98765 30402",
    category: "guest",
    flatNumber: "B-304",
    invitedBy: "Padma Konkonapala",
    date: "2026-06-17",
    expectedTime: "18:00",
    visitorType: "pre_approved",
    arrivedAt: null,
    checkIn: isoAt("2026-06-17", "18:00"),
    checkOut: null,
    status: "entered",
    passCode: "GVR-3M8Q1Z",
    verifiedBy: "Suresh Babu",
  },
  {
    id: "sv-b304-3",
    name: "Swiggy — Order #44213",
    phone: "+91 98765 30403",
    category: "delivery",
    flatNumber: "B-304",
    invitedBy: "Padma Konkonapala",
    date: "2026-06-17",
    expectedTime: "13:15",
    visitorType: "pre_approved",
    arrivedAt: null,
    checkIn: isoAt("2026-06-17", "13:15"),
    checkOut: isoAt("2026-06-17", "23:00"),
    status: "completed",
    passCode: "GVR-9F4T2A",
    verifiedBy: "Suresh Babu",
  },
  {
    id: "sv-b304-4",
    name: "AC Service Technician",
    phone: "+91 98765 30404",
    category: "service",
    flatNumber: "B-304",
    invitedBy: "Padma Konkonapala",
    date: "2026-06-16",
    expectedTime: "10:00",
    visitorType: "pre_approved",
    arrivedAt: null,
    checkIn: isoAt("2026-06-16", "10:00"),
    checkOut: isoAt("2026-06-16", "23:00"),
    status: "completed",
    passCode: "GVR-5J7N6B",
    verifiedBy: "Suresh Babu",
  },
  {
    id: "sv-b304-5",
    name: "Unknown Salesperson",
    phone: "+91 98765 30405",
    category: "other",
    flatNumber: "B-304",
    invitedBy: "Padma Konkonapala",
    date: "2026-06-15",
    expectedTime: "16:45",
    visitorType: "walk_in",
    arrivedAt: null,
    checkIn: null,
    checkOut: null,
    status: "denied",
    passCode: "GVR-2C1V8D",
    verifiedBy: null,
  },
  {
    id: "sv-b304-6",
    name: "Cousin — Arjun",
    phone: "+91 98765 30406",
    category: "guest",
    flatNumber: "B-304",
    invitedBy: "Padma Konkonapala",
    date: "2026-06-14",
    expectedTime: "19:30",
    visitorType: "pre_approved",
    arrivedAt: null,
    checkIn: isoAt("2026-06-14", "19:30"),
    checkOut: isoAt("2026-06-14", "23:00"),
    status: "completed",
    passCode: "GVR-8H5R3E",
    verifiedBy: "Suresh Babu",
  },
  {
    id: "sv-b304-7",
    name: "Flipkart Delivery",
    phone: "+91 98765 30407",
    category: "delivery",
    flatNumber: "B-304",
    invitedBy: "Padma Konkonapala",
    date: "2026-06-13",
    expectedTime: "12:00",
    visitorType: "pre_approved",
    arrivedAt: null,
    checkIn: null,
    checkOut: null,
    status: "expired",
    passCode: "GVR-6B9L4F",
    verifiedBy: null,
  },
];

const blockedMap: Record<string, { reason: string; blockedBy: string; blockedOn: string }> = {
  "+91 98765 55505": {
    reason: "Repeated unsolicited entry attempts",
    blockedBy: "Arvind Deshmukh",
    blockedOn: fiveDaysAgo,
  },
  "+91 98765 99902": {
    reason: "Denied entry multiple times, abusive behavior",
    blockedBy: "Sunita Patil",
    blockedOn: twoDaysAgo,
  },
};

function mostCommonCategory(visits: SocietyVisitor[]): SocietyVisitorCategory {
  const counts: Record<string, number> = {};
  for (const v of visits) counts[v.category] = (counts[v.category] ?? 0) + 1;
  return (
    (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] as SocietyVisitorCategory) ??
    visits[0].category
  );
}

export function getVisitorProfiles(): VisitorProfile[] {
  const grouped = new Map<string, SocietyVisitor[]>();
  for (const v of societyVisitors) {
    const arr = grouped.get(v.phone) ?? [];
    arr.push(v);
    grouped.set(v.phone, arr);
  }
  const profiles: VisitorProfile[] = [];
  for (const [phone, visits] of grouped) {
    visits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const mostRecent = visits[0];
    const oldest = visits[visits.length - 1];
    const visitCount = visits.length;
    const isFrequent = visitCount >= 3;
    const blocked = blockedMap[phone];
    profiles.push({
      phone,
      name: mostRecent.name,
      category: mostCommonCategory(visits),
      flatNumber: mostRecent.flatNumber,
      lastVisit: mostRecent.date,
      firstSeen: oldest.date,
      visitCount,
      isFrequent,
      status: blocked ? "blocked" : "active",
      blockedReason: blocked?.reason,
      blockedBy: blocked?.blockedBy,
      blockedOn: blocked?.blockedOn,
      photoUrl: mostRecent.photoUrl,
    });
  }
  return profiles.sort((a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime());
}

export const visitorProfiles: VisitorProfile[] = getVisitorProfiles();

export function getVisitsByPhone(phone: string): SocietyVisitor[] {
  return societyVisitors
    .filter((v) => v.phone === phone)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export const frequentVisitors: FrequentVisitor[] = [
  {
    id: "fv-1",
    name: "Lakshmi Cook",
    phone: "+91 98765 11111",
    category: "service",
    flatsVisited: ["A-301", "B-204", "A-502"],
    visitCount: 42,
    lastVisit: today,
  },
  {
    id: "fv-2",
    name: "Raju Cab Driver",
    phone: "+91 98765 22222",
    category: "cab",
    flatsVisited: ["A-601", "C-307", "B-110"],
    visitCount: 37,
    lastVisit: yesterday,
  },
  {
    id: "fv-3",
    name: "Sunita Housekeeping",
    phone: "+91 98765 33333",
    category: "service",
    flatsVisited: ["B-405", "C-208"],
    visitCount: 28,
    lastVisit: twoDaysAgo,
  },
];

export const blockedVisitors: BlockedVisitor[] = [
  {
    id: "bv-1",
    name: "Unknown Hawker",
    phone: "+91 98765 99901",
    reason: "Repeated unsolicited entry attempts",
    blockedBy: "Arvind Deshmukh",
    blockedOn: fiveDaysAgo,
  },
  {
    id: "bv-2",
    name: "Rahul Sales",
    phone: "+91 98765 99902",
    reason: "Denied entry multiple times, abusive behavior",
    blockedBy: "Sunita Patil",
    blockedOn: twoDaysAgo,
  },
];

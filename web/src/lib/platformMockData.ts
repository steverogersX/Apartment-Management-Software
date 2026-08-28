import { hashString } from "@/lib/utils";
import type { ComplaintPriority, ComplaintStatus } from "@/lib/mockData";

export type SocietyExtraDetails = {
  address: string;
  city: string;
  areaSqft: number;
  unitsCount: number;
  logoUrl: string | null;
  admin: {
    name: string;
    email: string;
    phone: string;
  };
};

const ADDRESSES = [
  { address: "Plot 14, MVP Colony Main Road", city: "Visakhapatnam" },
  { address: "Survey No. 212, Gachibowli", city: "Hyderabad" },
  { address: "4th Cross, Indiranagar", city: "Bengaluru" },
  { address: "Tilak Nagar Extension", city: "Pune" },
  { address: "Sector 62, Noida", city: "Delhi NCR" },
];

const ADMIN_NAMES = [
  "Padma Konkonapala",
  "Arjun Rao",
  "Sneha Iyer",
  "Vikram Shetty",
  "Divya Menon",
];

export function getSocietyDetails(id: string, name: string): SocietyExtraDetails {
  const hash = hashString(id);
  const place = ADDRESSES[hash % ADDRESSES.length];
  const adminName = ADMIN_NAMES[hash % ADMIN_NAMES.length];
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.|\.$/g, "");

  return {
    address: place.address,
    city: place.city,
    areaSqft: 40000 + (hash % 12) * 5000,
    unitsCount: 60 + (hash % 8) * 20,
    logoUrl: null,
    admin: {
      name: adminName,
      email: `${adminName.split(" ")[0].toLowerCase()}@${slug || "society"}.com`,
      phone: `+91 9${(hash % 900000000).toString().padStart(9, "0")}`,
    },
  };
}

export type PlatformComplaint = {
  id: string;
  ticketNumber: string;
  title: string;
  category: string;
  societyName: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  createdAt: string;
};

export const platformStats = {
  totalSocieties: 18,
  activeSocieties: 16,
  openComplaints: 9,
  monthlyRevenue: 312000,
};

export const societyGrowth: { month: string; societies: number }[] = [
  { month: "Jul", societies: 2 },
  { month: "Aug", societies: 3 },
  { month: "Sep", societies: 4 },
  { month: "Oct", societies: 4 },
  { month: "Nov", societies: 5 },
  { month: "Dec", societies: 6 },
  { month: "Jan", societies: 6 },
  { month: "Feb", societies: 8 },
  { month: "Mar", societies: 9 },
  { month: "Apr", societies: 11 },
  { month: "May", societies: 14 },
  { month: "Jun", societies: 18 },
];

export const platformComplaints: PlatformComplaint[] = [
  {
    id: "1",
    ticketNumber: "PLT-2026-0091",
    title: "Lift not working in Tower C",
    category: "Common Area",
    societyName: "Green Valley Residency",
    status: "escalated",
    priority: "high",
    createdAt: "2026-06-17T10:00:00+05:30",
  },
  {
    id: "2",
    ticketNumber: "PLT-2026-0088",
    title: "Delayed maintenance bill generation",
    category: "Billing",
    societyName: "Sai Enclave",
    status: "open",
    priority: "medium",
    createdAt: "2026-06-16T09:15:00+05:30",
  },
  {
    id: "3",
    ticketNumber: "PLT-2026-0084",
    title: "Security guard shift gap at Gate 2",
    category: "Security",
    societyName: "Lakeview Towers",
    status: "in_progress",
    priority: "high",
    createdAt: "2026-06-15T20:30:00+05:30",
  },
  {
    id: "4",
    ticketNumber: "PLT-2026-0079",
    title: "Visitor pass QR scanner offline",
    category: "Technical",
    societyName: "Palm Meadows",
    status: "open",
    priority: "low",
    createdAt: "2026-06-14T08:45:00+05:30",
  },
  {
    id: "5",
    ticketNumber: "PLT-2026-0071",
    title: "Clubhouse booking double allotment",
    category: "Amenities",
    societyName: "Green Valley Residency",
    status: "resolved",
    priority: "medium",
    createdAt: "2026-06-10T14:00:00+05:30",
  },
  {
    id: "6",
    ticketNumber: "PLT-2026-0065",
    title: "Society admin locked out of dashboard",
    category: "Technical",
    societyName: "Sunrise Heights",
    status: "resolved",
    priority: "high",
    createdAt: "2026-06-08T11:20:00+05:30",
  },
  {
    id: "7",
    ticketNumber: "PLT-2026-0058",
    title: "Parking slot allocation conflict",
    category: "Vehicles",
    societyName: "Lakeview Towers",
    status: "in_progress",
    priority: "low",
    createdAt: "2026-06-05T17:10:00+05:30",
  },
  {
    id: "8",
    ticketNumber: "PLT-2026-0050",
    title: "Notice board not syncing across towers",
    category: "Technical",
    societyName: "Palm Meadows",
    status: "resolved",
    priority: "low",
    createdAt: "2026-06-01T09:00:00+05:30",
  },
];

export const platformComplaintStatusBreakdown: { status: ComplaintStatus; count: number }[] = (
  ["open", "in_progress", "resolved", "escalated"] as ComplaintStatus[]
).map((status) => ({
  status,
  count: platformComplaints.filter((c) => c.status === status).length,
}));

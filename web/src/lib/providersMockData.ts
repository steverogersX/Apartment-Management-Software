import { z } from "zod";

export type ServiceProviderCategory =
  | "Plumber"
  | "Electrician"
  | "Housekeeping"
  | "Cook"
  | "Courier"
  | "Carpenter"
  | "Pest Control"
  | "Other";

export type ServiceProviderStatus = "active" | "blocked";

export type ServiceProvider = {
  id: string;
  name: string;
  category: ServiceProviderCategory;
  phone: string;
  photoUrl: string;
  idProofType: string;
  idProofNumber: string;
  status: ServiceProviderStatus;
  addedOn: string;
};

export type ProviderFlatLinkStatus = "active" | "removed";

export type ProviderFlatLink = {
  id: string;
  providerId: string;
  flatNumber: string;
  approvedBy: string;
  linkedOn: string;
  status: ProviderFlatLinkStatus;
};

export type ProviderEntryLog = {
  id: string;
  providerId: string;
  flatNumber: string | null;
  checkIn: string;
  checkOut: string | null;
  verifiedBy: string;
};

export const PROVIDER_CATEGORIES: ServiceProviderCategory[] = [
  "Plumber",
  "Electrician",
  "Housekeeping",
  "Cook",
  "Courier",
  "Carpenter",
  "Pest Control",
  "Other",
];

export const editProviderSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  category: z.enum([
    "Plumber",
    "Electrician",
    "Housekeeping",
    "Cook",
    "Courier",
    "Carpenter",
    "Pest Control",
    "Other",
  ]),
  phone: z.string().min(10, "Phone is required"),
  idProofType: z.string().min(1, "ID proof type is required"),
  idProofNumber: z.string().min(1, "ID proof number is required"),
  status: z.enum(["active", "blocked"]),
});

export type EditProviderInput = z.infer<typeof editProviderSchema>;

export const serviceProviders: ServiceProvider[] = [
  {
    id: "sp-1",
    name: "Ramesh Kumar Services",
    category: "Plumber",
    phone: "+91 98765 10101",
    photoUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=sp-1",
    idProofType: "Aadhaar",
    idProofNumber: "XXXX-XXXX-1234",
    status: "active",
    addedOn: "2024-02-10T00:00:00+05:30",
  },
  {
    id: "sp-2",
    name: "Bright Spark Electricals",
    category: "Electrician",
    phone: "+91 98765 20202",
    photoUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=sp-2",
    idProofType: "Aadhaar",
    idProofNumber: "XXXX-XXXX-5678",
    status: "active",
    addedOn: "2024-03-05T00:00:00+05:30",
  },
  {
    id: "sp-3",
    name: "Neat & Clean Housekeeping",
    category: "Housekeeping",
    phone: "+91 98765 30303",
    photoUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=sp-3",
    idProofType: "PAN",
    idProofNumber: "ABCDE1234F",
    status: "active",
    addedOn: "2023-11-18T00:00:00+05:30",
  },
  {
    id: "sp-4",
    name: "Annapurna Tiffin Service",
    category: "Cook",
    phone: "+91 98765 40404",
    photoUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=sp-4",
    idProofType: "Aadhaar",
    idProofNumber: "XXXX-XXXX-9012",
    status: "active",
    addedOn: "2024-01-22T00:00:00+05:30",
  },
  {
    id: "sp-5",
    name: "Swift Courier Hub",
    category: "Courier",
    phone: "+91 98765 50505",
    photoUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=sp-5",
    idProofType: "Driving Licence",
    idProofNumber: "DL-0420240012345",
    status: "active",
    addedOn: "2023-12-03T00:00:00+05:30",
  },
  {
    id: "sp-6",
    name: "WoodCraft Interiors",
    category: "Carpenter",
    phone: "+91 98765 60606",
    photoUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=sp-6",
    idProofType: "Aadhaar",
    idProofNumber: "XXXX-XXXX-3456",
    status: "blocked",
    addedOn: "2023-09-14T00:00:00+05:30",
  },
  {
    id: "sp-7",
    name: "Shield Pest Control",
    category: "Pest Control",
    phone: "+91 98765 70707",
    photoUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=sp-7",
    idProofType: "PAN",
    idProofNumber: "FGHIJ5678K",
    status: "active",
    addedOn: "2024-04-08T00:00:00+05:30",
  },
  {
    id: "sp-8",
    name: "City Laundry Express",
    category: "Other",
    phone: "+91 98765 80808",
    photoUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=sp-8",
    idProofType: "Aadhaar",
    idProofNumber: "XXXX-XXXX-7890",
    status: "active",
    addedOn: "2024-05-19T00:00:00+05:30",
  },
  {
    id: "sp-9",
    name: "Green Thumb Gardening",
    category: "Other",
    phone: "+91 98765 90909",
    photoUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=sp-9",
    idProofType: "Aadhaar",
    idProofNumber: "XXXX-XXXX-2345",
    status: "active",
    addedOn: "2023-10-27T00:00:00+05:30",
  },
];

export const providerFlatLinks: ProviderFlatLink[] = [
  {
    id: "pfl-1",
    providerId: "sp-1",
    flatNumber: "A-301",
    approvedBy: "Arvind Deshmukh",
    linkedOn: "2024-02-12T00:00:00+05:30",
    status: "active",
  },
  {
    id: "pfl-2",
    providerId: "sp-1",
    flatNumber: "B-204",
    approvedBy: "Sunita Patil",
    linkedOn: "2024-02-15T00:00:00+05:30",
    status: "active",
  },
  {
    id: "pfl-3",
    providerId: "sp-1",
    flatNumber: "A-502",
    approvedBy: "Rohan Mehta",
    linkedOn: "2024-03-01T00:00:00+05:30",
    status: "active",
  },
  {
    id: "pfl-4",
    providerId: "sp-1",
    flatNumber: "C-103",
    approvedBy: "Kavya Nair",
    linkedOn: "2023-12-10T00:00:00+05:30",
    status: "removed",
  },
  {
    id: "pfl-5",
    providerId: "sp-2",
    flatNumber: "A-301",
    approvedBy: "Arvind Deshmukh",
    linkedOn: "2024-03-06T00:00:00+05:30",
    status: "active",
  },
  {
    id: "pfl-6",
    providerId: "sp-2",
    flatNumber: "C-103",
    approvedBy: "Kavya Nair",
    linkedOn: "2024-03-10T00:00:00+05:30",
    status: "active",
  },
  {
    id: "pfl-7",
    providerId: "sp-3",
    flatNumber: "A-502",
    approvedBy: "Rohan Mehta",
    linkedOn: "2023-11-20T00:00:00+05:30",
    status: "active",
  },
  {
    id: "pfl-8",
    providerId: "sp-3",
    flatNumber: "B-405",
    approvedBy: "Mohammed Farhan",
    linkedOn: "2023-11-22T00:00:00+05:30",
    status: "active",
  },
  {
    id: "pfl-9",
    providerId: "sp-3",
    flatNumber: "C-208",
    approvedBy: "Neha Kulkarni",
    linkedOn: "2023-11-25T00:00:00+05:30",
    status: "active",
  },
  {
    id: "pfl-10",
    providerId: "sp-3",
    flatNumber: "A-601",
    approvedBy: "Vikram Singh Rathore",
    linkedOn: "2024-01-05T00:00:00+05:30",
    status: "active",
  },
  {
    id: "pfl-11",
    providerId: "sp-4",
    flatNumber: "B-204",
    approvedBy: "Sunita Patil",
    linkedOn: "2024-01-23T00:00:00+05:30",
    status: "active",
  },
  {
    id: "pfl-12",
    providerId: "sp-4",
    flatNumber: "B-110",
    approvedBy: "Ananya Gupta",
    linkedOn: "2024-02-02T00:00:00+05:30",
    status: "active",
  },
  {
    id: "pfl-13",
    providerId: "sp-6",
    flatNumber: "A-601",
    approvedBy: "Vikram Singh Rathore",
    linkedOn: "2023-09-15T00:00:00+05:30",
    status: "active",
  },
  {
    id: "pfl-14",
    providerId: "sp-6",
    flatNumber: "C-307",
    approvedBy: "Suresh Iyer",
    linkedOn: "2023-09-18T00:00:00+05:30",
    status: "active",
  },
  {
    id: "pfl-15",
    providerId: "sp-7",
    flatNumber: "A-301",
    approvedBy: "Arvind Deshmukh",
    linkedOn: "2024-04-09T00:00:00+05:30",
    status: "active",
  },
  {
    id: "pfl-16",
    providerId: "sp-7",
    flatNumber: "B-405",
    approvedBy: "Mohammed Farhan",
    linkedOn: "2024-04-10T00:00:00+05:30",
    status: "active",
  },
  {
    id: "pfl-17",
    providerId: "sp-7",
    flatNumber: "C-307",
    approvedBy: "Suresh Iyer",
    linkedOn: "2024-04-11T00:00:00+05:30",
    status: "removed",
  },
  {
    id: "pfl-18",
    providerId: "sp-7",
    flatNumber: "A-402",
    approvedBy: "Pooja Banerjee",
    linkedOn: "2024-04-12T00:00:00+05:30",
    status: "active",
  },
  {
    id: "pfl-19",
    providerId: "sp-8",
    flatNumber: "C-103",
    approvedBy: "Kavya Nair",
    linkedOn: "2024-05-20T00:00:00+05:30",
    status: "active",
  },
  {
    id: "pfl-20",
    providerId: "sp-8",
    flatNumber: "C-506",
    approvedBy: "Harish Krishnan",
    linkedOn: "2024-05-22T00:00:00+05:30",
    status: "active",
  },
  {
    id: "pfl-21",
    providerId: "sp-9",
    flatNumber: "B-201",
    approvedBy: "Divya Reddy",
    linkedOn: "2023-10-28T00:00:00+05:30",
    status: "active",
  },
  {
    id: "pfl-22",
    providerId: "sp-9",
    flatNumber: "A-202",
    approvedBy: "Arvind Deshmukh",
    linkedOn: "2023-11-01T00:00:00+05:30",
    status: "active",
  },
];

export type ProviderActivityAction =
  "flat_assigned" | "flat_removed" | "provider_blocked" | "provider_unblocked";

export type ProviderActivityLog = {
  id: string;
  providerId: string;
  action: ProviderActivityAction;
  flatNumber: string | null;
  actor: string;
  timestamp: string;
};

export const providerActivityLogs: ProviderActivityLog[] = [
  {
    id: "pal-1",
    providerId: "sp-1",
    action: "flat_assigned",
    flatNumber: "A-301",
    actor: "Arvind Deshmukh",
    timestamp: "2024-02-12T10:00:00+05:30",
  },
  {
    id: "pal-2",
    providerId: "sp-1",
    action: "flat_assigned",
    flatNumber: "B-204",
    actor: "Sunita Patil",
    timestamp: "2024-02-15T10:30:00+05:30",
  },
  {
    id: "pal-3",
    providerId: "sp-1",
    action: "flat_assigned",
    flatNumber: "A-502",
    actor: "Rohan Mehta",
    timestamp: "2024-03-01T09:00:00+05:30",
  },
  {
    id: "pal-4",
    providerId: "sp-2",
    action: "flat_assigned",
    flatNumber: "A-301",
    actor: "Arvind Deshmukh",
    timestamp: "2024-03-06T11:00:00+05:30",
  },
  {
    id: "pal-5",
    providerId: "sp-2",
    action: "flat_assigned",
    flatNumber: "C-103",
    actor: "Kavya Nair",
    timestamp: "2024-03-10T14:00:00+05:30",
  },
  {
    id: "pal-6",
    providerId: "sp-3",
    action: "flat_assigned",
    flatNumber: "A-502",
    actor: "Rohan Mehta",
    timestamp: "2023-11-20T08:00:00+05:30",
  },
  {
    id: "pal-7",
    providerId: "sp-3",
    action: "flat_assigned",
    flatNumber: "B-405",
    actor: "Mohammed Farhan",
    timestamp: "2023-11-22T09:00:00+05:30",
  },
  {
    id: "pal-8",
    providerId: "sp-3",
    action: "flat_removed",
    flatNumber: "C-208",
    actor: "Vikram Singh Rathore",
    timestamp: "2024-02-01T10:00:00+05:30",
  },
  {
    id: "pal-9",
    providerId: "sp-4",
    action: "flat_assigned",
    flatNumber: "B-204",
    actor: "Sunita Patil",
    timestamp: "2024-01-23T09:00:00+05:30",
  },
  {
    id: "pal-10",
    providerId: "sp-4",
    action: "flat_assigned",
    flatNumber: "B-110",
    actor: "Ananya Gupta",
    timestamp: "2024-02-02T10:00:00+05:30",
  },
  {
    id: "pal-11",
    providerId: "sp-6",
    action: "flat_assigned",
    flatNumber: "A-601",
    actor: "Vikram Singh Rathore",
    timestamp: "2023-09-15T09:00:00+05:30",
  },
  {
    id: "pal-12",
    providerId: "sp-6",
    action: "provider_blocked",
    flatNumber: null,
    actor: "Arvind Deshmukh",
    timestamp: "2024-06-10T11:00:00+05:30",
  },
  {
    id: "pal-13",
    providerId: "sp-7",
    action: "flat_assigned",
    flatNumber: "A-301",
    actor: "Arvind Deshmukh",
    timestamp: "2024-04-09T08:00:00+05:30",
  },
  {
    id: "pal-14",
    providerId: "sp-7",
    action: "flat_removed",
    flatNumber: "C-307",
    actor: "Suresh Iyer",
    timestamp: "2024-05-01T16:00:00+05:30",
  },
  {
    id: "pal-15",
    providerId: "sp-8",
    action: "flat_assigned",
    flatNumber: "C-103",
    actor: "Kavya Nair",
    timestamp: "2024-05-20T09:00:00+05:30",
  },
  {
    id: "pal-16",
    providerId: "sp-8",
    action: "flat_assigned",
    flatNumber: "C-506",
    actor: "Harish Krishnan",
    timestamp: "2024-05-22T10:00:00+05:30",
  },
  {
    id: "pal-17",
    providerId: "sp-9",
    action: "flat_assigned",
    flatNumber: "B-201",
    actor: "Divya Reddy",
    timestamp: "2023-10-28T11:00:00+05:30",
  },
  {
    id: "pal-18",
    providerId: "sp-9",
    action: "provider_unblocked",
    flatNumber: null,
    actor: "Arvind Deshmukh",
    timestamp: "2024-07-01T09:00:00+05:30",
  },
];

export const providerEntryLogs: ProviderEntryLog[] = [
  {
    id: "pel-1",
    providerId: "sp-1",
    flatNumber: "A-301",
    checkIn: "2026-08-10T09:15:00+05:30",
    checkOut: "2026-08-10T11:30:00+05:30",
    verifiedBy: "Suresh Babu",
  },
  {
    id: "pel-2",
    providerId: "sp-1",
    flatNumber: "B-204",
    checkIn: "2026-08-11T10:00:00+05:30",
    checkOut: null,
    verifiedBy: "Naveen Babu",
  },
  {
    id: "pel-3",
    providerId: "sp-1",
    flatNumber: "A-502",
    checkIn: "2026-08-08T14:00:00+05:30",
    checkOut: "2026-08-08T15:30:00+05:30",
    verifiedBy: "Suresh Babu",
  },
  {
    id: "pel-4",
    providerId: "sp-2",
    flatNumber: "A-301",
    checkIn: "2026-08-09T08:30:00+05:30",
    checkOut: "2026-08-09T10:00:00+05:30",
    verifiedBy: "Naveen Babu",
  },
  {
    id: "pel-5",
    providerId: "sp-2",
    flatNumber: "C-103",
    checkIn: "2026-08-10T11:00:00+05:30",
    checkOut: "2026-08-10T12:15:00+05:30",
    verifiedBy: "Suresh Babu",
  },
  {
    id: "pel-6",
    providerId: "sp-2",
    flatNumber: null,
    checkIn: "2026-08-12T09:00:00+05:30",
    checkOut: "2026-08-12T09:45:00+05:30",
    verifiedBy: "Suresh Babu",
  },
  {
    id: "pel-7",
    providerId: "sp-3",
    flatNumber: "A-502",
    checkIn: "2026-08-10T07:30:00+05:30",
    checkOut: "2026-08-10T09:00:00+05:30",
    verifiedBy: "Naveen Babu",
  },
  {
    id: "pel-8",
    providerId: "sp-3",
    flatNumber: "B-405",
    checkIn: "2026-08-11T08:00:00+05:30",
    checkOut: "2026-08-11T10:30:00+05:30",
    verifiedBy: "Suresh Babu",
  },
  {
    id: "pel-9",
    providerId: "sp-3",
    flatNumber: "A-601",
    checkIn: "2026-08-12T07:45:00+05:30",
    checkOut: null,
    verifiedBy: "Naveen Babu",
  },
  {
    id: "pel-10",
    providerId: "sp-4",
    flatNumber: "B-204",
    checkIn: "2026-08-09T12:00:00+05:30",
    checkOut: "2026-08-09T13:00:00+05:30",
    verifiedBy: "Suresh Babu",
  },
  {
    id: "pel-11",
    providerId: "sp-4",
    flatNumber: "B-110",
    checkIn: "2026-08-10T12:30:00+05:30",
    checkOut: null,
    verifiedBy: "Suresh Babu",
  },
  {
    id: "pel-12",
    providerId: "sp-5",
    flatNumber: null,
    checkIn: "2026-08-10T10:30:00+05:30",
    checkOut: "2026-08-10T11:00:00+05:30",
    verifiedBy: "Naveen Babu",
  },
  {
    id: "pel-13",
    providerId: "sp-5",
    flatNumber: null,
    checkIn: "2026-08-11T15:00:00+05:30",
    checkOut: "2026-08-11T15:20:00+05:30",
    verifiedBy: "Suresh Babu",
  },
  {
    id: "pel-14",
    providerId: "sp-5",
    flatNumber: "A-301",
    checkIn: "2026-08-12T16:00:00+05:30",
    checkOut: null,
    verifiedBy: "Naveen Babu",
  },
  {
    id: "pel-15",
    providerId: "sp-6",
    flatNumber: "A-601",
    checkIn: "2026-08-08T09:30:00+05:30",
    checkOut: "2026-08-08T12:00:00+05:30",
    verifiedBy: "Suresh Babu",
  },
  {
    id: "pel-16",
    providerId: "sp-6",
    flatNumber: "C-307",
    checkIn: "2026-08-09T14:30:00+05:30",
    checkOut: "2026-08-09T16:00:00+05:30",
    verifiedBy: "Naveen Babu",
  },
  {
    id: "pel-17",
    providerId: "sp-7",
    flatNumber: "A-301",
    checkIn: "2026-08-10T08:00:00+05:30",
    checkOut: "2026-08-10T10:00:00+05:30",
    verifiedBy: "Suresh Babu",
  },
  {
    id: "pel-18",
    providerId: "sp-7",
    flatNumber: "B-405",
    checkIn: "2026-08-11T09:30:00+05:30",
    checkOut: "2026-08-11T11:00:00+05:30",
    verifiedBy: "Naveen Babu",
  },
  {
    id: "pel-19",
    providerId: "sp-7",
    flatNumber: null,
    checkIn: "2026-08-12T10:00:00+05:30",
    checkOut: null,
    verifiedBy: "Suresh Babu",
  },
  {
    id: "pel-20",
    providerId: "sp-8",
    flatNumber: "C-103",
    checkIn: "2026-08-09T10:00:00+05:30",
    checkOut: "2026-08-09T11:30:00+05:30",
    verifiedBy: "Naveen Babu",
  },
  {
    id: "pel-21",
    providerId: "sp-8",
    flatNumber: "C-506",
    checkIn: "2026-08-10T14:00:00+05:30",
    checkOut: "2026-08-10T15:00:00+05:30",
    verifiedBy: "Suresh Babu",
  },
  {
    id: "pel-22",
    providerId: "sp-9",
    flatNumber: "B-201",
    checkIn: "2026-08-10T09:00:00+05:30",
    checkOut: "2026-08-10T11:00:00+05:30",
    verifiedBy: "Suresh Babu",
  },
  {
    id: "pel-23",
    providerId: "sp-9",
    flatNumber: "A-202",
    checkIn: "2026-08-11T13:30:00+05:30",
    checkOut: "2026-08-11T15:00:00+05:30",
    verifiedBy: "Naveen Babu",
  },
  {
    id: "pel-24",
    providerId: "sp-9",
    flatNumber: null,
    checkIn: "2026-08-12T08:30:00+05:30",
    checkOut: null,
    verifiedBy: "Naveen Babu",
  },
];

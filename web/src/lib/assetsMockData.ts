import { z } from "zod";

export type AssetCategory =
  | "Electrical"
  | "Furniture"
  | "Safety Equipment"
  | "Plumbing"
  | "Common Area Equipment"
  | "HVAC"
  | "IT Equipment"
  | "Other";

export type AssetStatus = "Active" | "Under Repair" | "Retired";

export type Asset = {
  id: string;
  name: string;
  assetTag: string;
  category: AssetCategory;
  location: string;
  purchaseDate: string;
  purchaseCost: number;
  vendor: string;
  warrantyExpiry: string | null;
  amcExpiry: string | null;
  status: AssetStatus;
  lastUpdatedBy: string | null;
  lastUpdatedAt: string | null;
};

export const ASSET_CATEGORIES: AssetCategory[] = [
  "Electrical",
  "Furniture",
  "Safety Equipment",
  "Plumbing",
  "Common Area Equipment",
  "HVAC",
  "IT Equipment",
  "Other",
];

export const editAssetSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  assetTag: z.string().min(1, "Asset tag is required"),
  category: z.enum([
    "Electrical",
    "Furniture",
    "Safety Equipment",
    "Plumbing",
    "Common Area Equipment",
    "HVAC",
    "IT Equipment",
    "Other",
  ]),
  location: z.string().min(2, "Location is required"),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  purchaseCost: z.coerce.number().min(0, "Purchase cost must be >= 0"),
  vendor: z.string().min(1, "Vendor is required"),
  warrantyExpiry: z.string().nullable().optional(),
  amcExpiry: z.string().nullable().optional(),
  status: z.enum(["Active", "Under Repair", "Retired"]),
});

export type EditAssetInput = z.infer<typeof editAssetSchema>;

export const addServiceLogSchema = z.object({
  type: z.enum(["Service", "Repair", "Inspection", "AMC Renewal"]),
  date: z.string().min(1, "Date is required"),
  description: z.string().min(2, "Description is required"),
  vendor: z.string().optional(),
  cost: z.coerce.number().min(0).optional(),
  newAmcExpiry: z.string().optional(),
});

export type AddServiceLogInput = z.infer<typeof addServiceLogSchema>;

export type AssetServiceLogType = "Service" | "Repair" | "Inspection" | "AMC Renewal";

export type AssetServiceLog = {
  id: string;
  assetId: string;
  date: string;
  type: AssetServiceLogType;
  description: string;
  vendor?: string;
  cost?: number;
  loggedBy: string;
};

export const assetServiceLogs: AssetServiceLog[] = [
  {
    id: "asl-1",
    assetId: "ast-1",
    date: "2024-12-10T10:00:00+05:30",
    type: "Service",
    description: "Quarterly preventive maintenance and load test",
    vendor: "PowerGen Solutions",
    cost: 8500,
    loggedBy: "Suresh Iyer",
  },
  {
    id: "asl-2",
    assetId: "ast-1",
    date: "2025-06-12T11:30:00+05:30",
    type: "AMC Renewal",
    description: "Annual AMC renewed for next year",
    vendor: "PowerGen Solutions",
    cost: 42000,
    loggedBy: "Anjali Desai",
  },
  {
    id: "asl-3",
    assetId: "ast-2",
    date: "2024-09-05T09:00:00+05:30",
    type: "Inspection",
    description: "Annual safety inspection by lift inspector",
    vendor: "Otis Elevators India",
    loggedBy: "Kavya Nair",
  },
  {
    id: "asl-4",
    assetId: "ast-2",
    date: "2025-02-18T14:00:00+05:30",
    type: "Repair",
    description: "Door sensor replacement in Tower B lift",
    vendor: "Otis Elevators India",
    cost: 12500,
    loggedBy: "Arvind Deshmukh",
  },
  {
    id: "asl-5",
    assetId: "ast-2",
    date: "2025-08-01T10:30:00+05:30",
    type: "Service",
    description: "Half-yearly lubrication and brake test",
    vendor: "Otis Elevators India",
    cost: 18000,
    loggedBy: "Suresh Iyer",
  },
  {
    id: "asl-6",
    assetId: "ast-3",
    date: "2024-08-20T08:30:00+05:30",
    type: "Service",
    description: "Pump seal replacement and pressure calibration",
    vendor: "AquaFlow Pumps",
    cost: 6200,
    loggedBy: "Anjali Desai",
  },
  {
    id: "asl-7",
    assetId: "ast-4",
    date: "2024-12-01T15:00:00+05:30",
    type: "Inspection",
    description: "Quarterly CCTV health check and NVR backup audit",
    vendor: "SecureVision Systems",
    loggedBy: "Kavya Nair",
  },
  {
    id: "asl-8",
    assetId: "ast-4",
    date: "2025-05-15T16:30:00+05:30",
    type: "Repair",
    description: "Replaced faulty camera at main gate",
    vendor: "SecureVision Systems",
    cost: 7400,
    loggedBy: "Arvind Deshmukh",
  },
  {
    id: "asl-9",
    assetId: "ast-5",
    date: "2025-01-10T09:30:00+05:30",
    type: "Repair",
    description: "Motor belt replacement and console repair",
    vendor: "FitWell Equipments",
    cost: 11200,
    loggedBy: "Suresh Iyer",
  },
  {
    id: "asl-10",
    assetId: "ast-5",
    date: "2025-07-22T11:00:00+05:30",
    type: "Inspection",
    description: "Post-repair inspection and safety certification",
    vendor: "FitWell Equipments",
    loggedBy: "Anjali Desai",
  },
  {
    id: "asl-11",
    assetId: "ast-7",
    date: "2024-11-18T10:00:00+05:30",
    type: "Inspection",
    description: "Annual hydrant and extinguisher pressure test",
    vendor: "SafeGuard Fire Systems",
    loggedBy: "Kavya Nair",
  },
  {
    id: "asl-12",
    assetId: "ast-7",
    date: "2025-02-20T09:45:00+05:30",
    type: "AMC Renewal",
    description: "Fire safety AMC renewed",
    vendor: "SafeGuard Fire Systems",
    cost: 18000,
    loggedBy: "Arvind Deshmukh",
  },
  {
    id: "asl-13",
    assetId: "ast-8",
    date: "2025-03-12T08:00:00+05:30",
    type: "Service",
    description: "Filter replacement and chemical dosing check",
    vendor: "AquaPure Solutions",
    cost: 9500,
    loggedBy: "Suresh Iyer",
  },
  {
    id: "asl-14",
    assetId: "ast-9",
    date: "2024-10-05T11:00:00+05:30",
    type: "Repair",
    description: "Compressor gas refill and coil cleaning",
    vendor: "Daikin Air Solutions",
    cost: 22000,
    loggedBy: "Anjali Desai",
  },
  {
    id: "asl-15",
    assetId: "ast-9",
    date: "2025-06-20T09:30:00+05:30",
    type: "Service",
    description: "Pre-monsoon HVAC servicing",
    vendor: "Daikin Air Solutions",
    cost: 14500,
    loggedBy: "Kavya Nair",
  },
  {
    id: "asl-16",
    assetId: "ast-10",
    date: "2024-09-01T10:30:00+05:30",
    type: "Inspection",
    description: "Play equipment safety audit",
    loggedBy: "Arvind Deshmukh",
  },
  {
    id: "asl-17",
    assetId: "ast-11",
    date: "2025-04-08T14:00:00+05:30",
    type: "Service",
    description: "Intercom wiring check and handset replacement - A-301",
    vendor: "ComConnect Technologies",
    cost: 3200,
    loggedBy: "Suresh Iyer",
  },
  {
    id: "asl-18",
    assetId: "ast-13",
    date: "2024-09-15T10:00:00+05:30",
    type: "Inspection",
    description: "Ergonomic inspection of office furniture",
    loggedBy: "Anjali Desai",
  },
  {
    id: "asl-19",
    assetId: "ast-6",
    date: "2024-07-12T11:00:00+05:30",
    type: "Inspection",
    description: "Upholstery condition check",
    loggedBy: "Kavya Nair",
  },
  {
    id: "asl-20",
    assetId: "ast-12",
    date: "2023-06-20T09:00:00+05:30",
    type: "Repair",
    description: "Solar panel cleaning and inverter repair",
    vendor: "SunEnergy Systems",
    cost: 8900,
    loggedBy: "Arvind Deshmukh",
  },
];

export const assets: Asset[] = [
  {
    id: "ast-1",
    name: "Diesel Generator - Tower A",
    assetTag: "AST-2022-001",
    category: "Electrical",
    location: "Tower A - Basement",
    purchaseDate: "2022-03-15T00:00:00+05:30",
    purchaseCost: 750000,
    vendor: "PowerGen Solutions",
    warrantyExpiry: "2025-03-15T00:00:00+05:30",
    amcExpiry: "2026-03-15T00:00:00+05:30",
    status: "Active",
    lastUpdatedBy: "Suresh Iyer",
    lastUpdatedAt: "2025-08-10T10:00:00+05:30",
  },
  {
    id: "ast-2",
    name: "Passenger Lift - Tower B",
    assetTag: "AST-2021-014",
    category: "Common Area Equipment",
    location: "Tower B - Lift Lobby",
    purchaseDate: "2021-08-10T00:00:00+05:30",
    purchaseCost: 1200000,
    vendor: "Otis Elevators India",
    warrantyExpiry: "2024-08-10T00:00:00+05:30",
    amcExpiry: "2026-08-10T00:00:00+05:30",
    status: "Active",
    lastUpdatedBy: "Anjali Desai",
    lastUpdatedAt: "2025-08-10T10:00:00+05:30",
  },
  {
    id: "ast-3",
    name: "Water Pump Set - Terrace",
    assetTag: "AST-2023-008",
    category: "Plumbing",
    location: "Terrace - Pump Room",
    purchaseDate: "2023-05-20T00:00:00+05:30",
    purchaseCost: 85000,
    vendor: "AquaFlow Pumps",
    warrantyExpiry: "2025-05-20T00:00:00+05:30",
    amcExpiry: "2026-05-20T00:00:00+05:30",
    status: "Active",
    lastUpdatedBy: "Kavya Nair",
    lastUpdatedAt: "2025-08-10T10:00:00+05:30",
  },
  {
    id: "ast-4",
    name: "CCTV Camera System",
    assetTag: "AST-2023-021",
    category: "IT Equipment",
    location: "Security Cabin",
    purchaseDate: "2023-11-02T00:00:00+05:30",
    purchaseCost: 180000,
    vendor: "SecureVision Systems",
    warrantyExpiry: "2025-11-02T00:00:00+05:30",
    amcExpiry: "2026-11-02T00:00:00+05:30",
    status: "Active",
    lastUpdatedBy: "Arvind Deshmukh",
    lastUpdatedAt: "2025-08-10T10:00:00+05:30",
  },
  {
    id: "ast-5",
    name: "Treadmill - Gym",
    assetTag: "AST-2022-045",
    category: "Common Area Equipment",
    location: "Clubhouse - Gym",
    purchaseDate: "2022-09-12T00:00:00+05:30",
    purchaseCost: 95000,
    vendor: "FitWell Equipments",
    warrantyExpiry: "2024-09-12T00:00:00+05:30",
    amcExpiry: null,
    status: "Under Repair",
    lastUpdatedBy: "Suresh Iyer",
    lastUpdatedAt: "2025-08-10T10:00:00+05:30",
  },
  {
    id: "ast-6",
    name: "Clubhouse Sofa Set",
    assetTag: "AST-2021-032",
    category: "Furniture",
    location: "Clubhouse - Lounge",
    purchaseDate: "2021-12-05T00:00:00+05:30",
    purchaseCost: 120000,
    vendor: "HomeCraft Furnishings",
    warrantyExpiry: null,
    amcExpiry: null,
    status: "Active",
    lastUpdatedBy: "Anjali Desai",
    lastUpdatedAt: "2025-08-10T10:00:00+05:30",
  },
  {
    id: "ast-7",
    name: "Fire Extinguisher Bank",
    assetTag: "AST-2023-011",
    category: "Safety Equipment",
    location: "Tower C - Ground Floor",
    purchaseDate: "2023-02-18T00:00:00+05:30",
    purchaseCost: 45000,
    vendor: "SafeGuard Fire Systems",
    warrantyExpiry: "2026-02-18T00:00:00+05:30",
    amcExpiry: "2026-02-18T00:00:00+05:30",
    status: "Active",
    lastUpdatedBy: "Kavya Nair",
    lastUpdatedAt: "2025-08-10T10:00:00+05:30",
  },
  {
    id: "ast-8",
    name: "Swimming Pool Filter Unit",
    assetTag: "AST-2022-018",
    category: "Plumbing",
    location: "Swimming Pool Area",
    purchaseDate: "2022-06-25T00:00:00+05:30",
    purchaseCost: 210000,
    vendor: "AquaPure Solutions",
    warrantyExpiry: "2024-06-25T00:00:00+05:30",
    amcExpiry: "2026-06-25T00:00:00+05:30",
    status: "Active",
    lastUpdatedBy: "Arvind Deshmukh",
    lastUpdatedAt: "2025-08-10T10:00:00+05:30",
  },
  {
    id: "ast-9",
    name: "Central Air Conditioner - Clubhouse",
    assetTag: "AST-2021-009",
    category: "HVAC",
    location: "Clubhouse - Main Hall",
    purchaseDate: "2021-04-20T00:00:00+05:30",
    purchaseCost: 320000,
    vendor: "Daikin Air Solutions",
    warrantyExpiry: "2024-04-20T00:00:00+05:30",
    amcExpiry: "2026-04-20T00:00:00+05:30",
    status: "Under Repair",
    lastUpdatedBy: "Suresh Iyer",
    lastUpdatedAt: "2025-08-10T10:00:00+05:30",
  },
  {
    id: "ast-10",
    name: "Play Area Slide & Swing Set",
    assetTag: "AST-2022-027",
    category: "Common Area Equipment",
    location: "Children's Play Area",
    purchaseDate: "2022-11-10T00:00:00+05:30",
    purchaseCost: 75000,
    vendor: "PlayZone Equipments",
    warrantyExpiry: null,
    amcExpiry: null,
    status: "Active",
    lastUpdatedBy: "Anjali Desai",
    lastUpdatedAt: "2025-08-10T10:00:00+05:30",
  },
  {
    id: "ast-11",
    name: "Intercom System - Tower A",
    assetTag: "AST-2023-003",
    category: "IT Equipment",
    location: "Tower A - Entrance Lobby",
    purchaseDate: "2023-01-14T00:00:00+05:30",
    purchaseCost: 60000,
    vendor: "ComConnect Technologies",
    warrantyExpiry: "2025-01-14T00:00:00+05:30",
    amcExpiry: "2026-01-14T00:00:00+05:30",
    status: "Active",
    lastUpdatedBy: "Kavya Nair",
    lastUpdatedAt: "2025-08-10T10:00:00+05:30",
  },
  {
    id: "ast-12",
    name: "Solar Water Heater - Terrace",
    assetTag: "AST-2020-006",
    category: "Electrical",
    location: "Terrace - Block B",
    purchaseDate: "2020-07-08T00:00:00+05:30",
    purchaseCost: 150000,
    vendor: "SunEnergy Systems",
    warrantyExpiry: "2023-07-08T00:00:00+05:30",
    amcExpiry: null,
    status: "Retired",
    lastUpdatedBy: "Arvind Deshmukh",
    lastUpdatedAt: "2025-08-10T10:00:00+05:30",
  },
  {
    id: "ast-13",
    name: "Office Chairs - Society Office",
    assetTag: "AST-2023-036",
    category: "Furniture",
    location: "Society Office",
    purchaseDate: "2023-08-30T00:00:00+05:30",
    purchaseCost: 38000,
    vendor: "Office Mart",
    warrantyExpiry: "2025-08-30T00:00:00+05:30",
    amcExpiry: null,
    status: "Active",
    lastUpdatedBy: "Suresh Iyer",
    lastUpdatedAt: "2025-08-10T10:00:00+05:30",
  },
];

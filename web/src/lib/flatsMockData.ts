import { z } from "zod";

export type FlatType = "1BHK" | "2BHK" | "3BHK" | "4BHK";
export type FlatOccupancyStatus = "occupied" | "vacant";
export type FlatMaintenanceStatus = "paid" | "due";

// The registered legal owner of a flat, for when the current resident is a tenant
// and the owner doesn't live there — not a ResidentRecord, since an absentee owner
// isn't a current occupant and has no entry in `residents`.
export type FlatOwnerContact = {
  name: string;
  phone: string;
  email: string;
};

/**
 * UI-only mock data for the Flats feature — no backing table or API yet.
 * Mirrors the convention in residentsMockData.ts: typed records consumed directly
 * by a client component via the shared DataTable.
 */
export type FlatRecord = {
  id: string;
  flatNumber: string;
  tower: string;
  floor: number;
  type: FlatType;
  areaSqft: number;
  occupancyStatus: FlatOccupancyStatus;
  maintenanceStatus: FlatMaintenanceStatus;
  currentResidentIds: string[];
  // Set only when the flat is tenant-occupied and the owner is not a current resident.
  owner: FlatOwnerContact | null;
};

export type FlatOccupancyHistoryEntry = {
  flatId: string;
  residentName: string;
  occupancyType: "owner" | "tenant";
  moveInDate: string;
  moveOutDate: string | null;
};

export type FlatVehicleEntry = {
  flatId: string;
  residentId: string;
  registrationNumber: string;
  type: "car" | "two_wheeler";
  make: string;
  model: string;
  color: string;
  ownerName: string;
  parkingSlot: string | null;
  isCurrent: boolean;
};

export const addVehicleSchema = z.object({
  flatId: z.string().min(1, "Flat is required"),
  residentId: z.string().min(1, "Owner is required"),
  registrationNumber: z.string().min(1, "Registration number is required"),
  type: z.enum(["car", "two_wheeler"]),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  color: z.string().min(1, "Color is required"),
});

export type AddVehicleInput = z.infer<typeof addVehicleSchema>;

export const flats: FlatRecord[] = [
  {
    id: "flat-a301",
    flatNumber: "301",
    tower: "A",
    floor: 3,
    type: "3BHK",
    areaSqft: 1450,
    occupancyStatus: "occupied",
    maintenanceStatus: "paid",
    currentResidentIds: ["1", "3"],
    owner: null,
  },
  {
    id: "flat-b204",
    flatNumber: "204",
    tower: "B",
    floor: 2,
    type: "2BHK",
    areaSqft: 1100,
    occupancyStatus: "occupied",
    maintenanceStatus: "due",
    currentResidentIds: ["2"],
    owner: null,
  },
  {
    id: "flat-a502",
    flatNumber: "502",
    tower: "A",
    floor: 5,
    type: "3BHK",
    areaSqft: 1500,
    occupancyStatus: "occupied",
    maintenanceStatus: "paid",
    currentResidentIds: ["3"],
    owner: { name: "Sanjay Mehta", phone: "+91 98220 11223", email: "sanjay.mehta@gmail.com" },
  },
  {
    id: "flat-c103",
    flatNumber: "103",
    tower: "C",
    floor: 1,
    type: "1BHK",
    areaSqft: 750,
    occupancyStatus: "occupied",
    maintenanceStatus: "paid",
    currentResidentIds: ["4"],
    owner: { name: "Ramesh Iyer", phone: "+91 98450 22110", email: "ramesh.iyer@gmail.com" },
  },
  {
    id: "flat-b405",
    flatNumber: "405",
    tower: "B",
    floor: 4,
    type: "3BHK",
    areaSqft: 1650,
    occupancyStatus: "occupied",
    maintenanceStatus: "due",
    currentResidentIds: ["5"],
    owner: null,
  },
  {
    id: "flat-c208",
    flatNumber: "208",
    tower: "C",
    floor: 2,
    type: "2BHK",
    areaSqft: 1050,
    occupancyStatus: "vacant",
    maintenanceStatus: "due",
    currentResidentIds: [],
    // Neha Kulkarni moved out 2025-11-20 (see flatOccupancyHistory) but still owns this flat.
    owner: { name: "Neha Kulkarni", phone: "+91 93456 78901", email: "neha.kulkarni@gmail.com" },
  },
  {
    id: "flat-a601",
    flatNumber: "601",
    tower: "A",
    floor: 6,
    type: "4BHK",
    areaSqft: 1900,
    occupancyStatus: "occupied",
    maintenanceStatus: "paid",
    currentResidentIds: ["7"],
    owner: null,
  },
  {
    id: "flat-b110",
    flatNumber: "110",
    tower: "B",
    floor: 1,
    type: "2BHK",
    areaSqft: 1150,
    occupancyStatus: "occupied",
    maintenanceStatus: "due",
    currentResidentIds: ["8"],
    owner: { name: "Deepak Shah", phone: "+91 98670 33445", email: "deepak.shah@gmail.com" },
  },
  {
    id: "flat-c307",
    flatNumber: "307",
    tower: "C",
    floor: 3,
    type: "3BHK",
    areaSqft: 1350,
    occupancyStatus: "occupied",
    maintenanceStatus: "paid",
    currentResidentIds: ["9"],
    owner: null,
  },
  {
    id: "flat-a402",
    flatNumber: "402",
    tower: "A",
    floor: 4,
    type: "2BHK",
    areaSqft: 1200,
    occupancyStatus: "occupied",
    maintenanceStatus: "paid",
    currentResidentIds: ["10"],
    owner: {
      name: "Vikas Choudhary",
      phone: "+91 98120 55667",
      email: "vikas.choudhary@gmail.com",
    },
  },
  {
    id: "flat-c506",
    flatNumber: "506",
    tower: "C",
    floor: 5,
    type: "2BHK",
    areaSqft: 1080,
    occupancyStatus: "vacant",
    maintenanceStatus: "due",
    currentResidentIds: [],
    // Harish Krishnan moved out (see flatOccupancyHistory / residentsMockData) but still owns
    // this flat — vacant just means nobody lives here right now, not that it's unowned.
    owner: {
      name: "Harish Krishnan",
      phone: "+91 91919 20202",
      email: "harish.krishnan@gmail.com",
    },
  },
  {
    id: "flat-b201",
    flatNumber: "201",
    tower: "B",
    floor: 2,
    type: "2BHK",
    areaSqft: 1120,
    occupancyStatus: "occupied",
    maintenanceStatus: "paid",
    currentResidentIds: ["12"],
    owner: null,
  },
  {
    id: "flat-a202",
    flatNumber: "202",
    tower: "A",
    floor: 2,
    type: "2BHK",
    areaSqft: 1180,
    occupancyStatus: "vacant",
    maintenanceStatus: "due",
    currentResidentIds: [],
    owner: { name: "Rajesh Kumar", phone: "+91 99001 22334", email: "rajesh.kumar@gmail.com" },
  },
  {
    id: "flat-b305",
    flatNumber: "305",
    tower: "B",
    floor: 3,
    type: "1BHK",
    areaSqft: 780,
    occupancyStatus: "vacant",
    maintenanceStatus: "due",
    currentResidentIds: [],
    owner: { name: "Sneha Joshi", phone: "+91 99112 33445", email: "sneha.joshi@gmail.com" },
  },
  {
    id: "flat-c410",
    flatNumber: "410",
    tower: "C",
    floor: 4,
    type: "3BHK",
    areaSqft: 1400,
    occupancyStatus: "vacant",
    maintenanceStatus: "paid",
    currentResidentIds: [],
    owner: { name: "Manoj Verma", phone: "+91 99223 44556", email: "manoj.verma@gmail.com" },
  },
];

export const flatOccupancyHistory: FlatOccupancyHistoryEntry[] = [
  // flat-a301 — current owner + 2 past
  {
    flatId: "flat-a301",
    residentName: "Arvind Deshmukh",
    occupancyType: "owner",
    moveInDate: "2022-03-15T00:00:00+05:30",
    moveOutDate: null,
  },
  {
    flatId: "flat-a301",
    residentName: "Meena Deshmukh",
    occupancyType: "owner",
    moveInDate: "2016-08-10T00:00:00+05:30",
    moveOutDate: "2022-02-28T00:00:00+05:30",
  },
  {
    flatId: "flat-a301",
    residentName: "Rahul Verma",
    occupancyType: "tenant",
    moveInDate: "2019-05-01T00:00:00+05:30",
    moveOutDate: "2021-11-30T00:00:00+05:30",
  },
  // flat-b204 — current + 2 past
  {
    flatId: "flat-b204",
    residentName: "Sunita Patil",
    occupancyType: "owner",
    moveInDate: "2021-07-10T00:00:00+05:30",
    moveOutDate: null,
  },
  {
    flatId: "flat-b204",
    residentName: "Prakash Kulkarni",
    occupancyType: "tenant",
    moveInDate: "2018-03-12T00:00:00+05:30",
    moveOutDate: "2021-06-15T00:00:00+05:30",
  },
  {
    flatId: "flat-b204",
    residentName: "Sangeeta Kulkarni",
    occupancyType: "owner",
    moveInDate: "2014-01-20T00:00:00+05:30",
    moveOutDate: "2018-02-28T00:00:00+05:30",
  },
  // flat-c208 — vacant now, 2 past including the moved_out resident
  {
    flatId: "flat-c208",
    residentName: "Neha Kulkarni",
    occupancyType: "owner",
    moveInDate: "2019-06-18T00:00:00+05:30",
    moveOutDate: "2025-11-20T00:00:00+05:30",
  },
  {
    flatId: "flat-c208",
    residentName: "Deepak Joshi",
    occupancyType: "tenant",
    moveInDate: "2017-04-05T00:00:00+05:30",
    moveOutDate: "2019-05-30T00:00:00+05:30",
  },
  {
    flatId: "flat-c208",
    residentName: "Anjali Joshi",
    occupancyType: "owner",
    moveInDate: "2013-09-10T00:00:00+05:30",
    moveOutDate: "2017-03-31T00:00:00+05:30",
  },
  // flat-c506 — vacant now, 1 past
  {
    flatId: "flat-c506",
    residentName: "Harish Krishnan",
    occupancyType: "owner",
    moveInDate: "2018-09-22T00:00:00+05:30",
    moveOutDate: "2025-08-15T00:00:00+05:30",
  },
  {
    flatId: "flat-c506",
    residentName: "Lakshmi Krishnan",
    occupancyType: "owner",
    moveInDate: "2015-05-18T00:00:00+05:30",
    moveOutDate: "2018-08-30T00:00:00+05:30",
  },
  // flat-a502 — current tenant, one prior owner
  {
    flatId: "flat-a502",
    residentName: "Rohan Mehta",
    occupancyType: "tenant",
    moveInDate: "2024-01-20T00:00:00+05:30",
    moveOutDate: null,
  },
  {
    flatId: "flat-a502",
    residentName: "Sanjay Mehta",
    occupancyType: "owner",
    moveInDate: "2015-11-01T00:00:00+05:30",
    moveOutDate: "2023-12-31T00:00:00+05:30",
  },
];

export const flatVehicleHistory: FlatVehicleEntry[] = [
  // flat-a301
  {
    flatId: "flat-a301",
    residentId: "1",
    registrationNumber: "MH12 AB 1234",
    type: "car",
    make: "Hyundai",
    model: "Creta",
    color: "White",
    ownerName: "Arvind Deshmukh",
    parkingSlot: "A-12",
    isCurrent: true,
  },
  {
    flatId: "flat-a301",
    residentId: "1",
    registrationNumber: "MH12 XY 9988",
    type: "two_wheeler",
    make: "Honda",
    model: "Activa",
    color: "Grey",
    ownerName: "Meena Deshmukh",
    parkingSlot: null,
    isCurrent: false,
  },
  // flat-b204
  {
    flatId: "flat-b204",
    residentId: "2",
    registrationNumber: "MH14 CD 5678",
    type: "car",
    make: "Maruti Suzuki",
    model: "Swift",
    color: "Silver",
    ownerName: "Sunita Patil",
    parkingSlot: "B-04",
    isCurrent: true,
  },
  {
    flatId: "flat-b204",
    residentId: "2",
    registrationNumber: "MH14 CD 5679",
    type: "car",
    make: "Honda",
    model: "City",
    color: "White",
    ownerName: "Sunita Patil",
    parkingSlot: "B-05",
    isCurrent: true,
  },
  {
    flatId: "flat-b204",
    residentId: "2",
    registrationNumber: "MH14 EF 1122",
    type: "two_wheeler",
    make: "TVS",
    model: "Jupiter",
    color: "Blue",
    ownerName: "Prakash Kulkarni",
    parkingSlot: "B-04",
    isCurrent: false,
  },
  // flat-c208 — only past (vacant)
  {
    flatId: "flat-c208",
    residentId: "6",
    registrationNumber: "MH13 GH 3344",
    type: "car",
    make: "Toyota",
    model: "Innova",
    color: "Grey",
    ownerName: "Neha Kulkarni",
    parkingSlot: null,
    isCurrent: false,
  },
  // flat-a601
  {
    flatId: "flat-a601",
    residentId: "7",
    registrationNumber: "MH48 KL 9012",
    type: "car",
    make: "Mahindra",
    model: "XUV700",
    color: "Black",
    ownerName: "Vikram Singh Rathore",
    parkingSlot: "A-28",
    isCurrent: true,
  },
  {
    flatId: "flat-a601",
    residentId: "7",
    registrationNumber: "MH48 KL 9013",
    type: "two_wheeler",
    make: "Bajaj",
    model: "Pulsar",
    color: "Red",
    ownerName: "Vikram Singh Rathore",
    parkingSlot: null,
    isCurrent: false,
  },
  // flat-c307
  {
    flatId: "flat-c307",
    residentId: "9",
    registrationNumber: "MH03 MN 4455",
    type: "car",
    make: "Kia",
    model: "Seltos",
    color: "Red",
    ownerName: "Suresh Iyer",
    parkingSlot: "C-09",
    isCurrent: true,
  },
  {
    flatId: "flat-c307",
    residentId: "9",
    registrationNumber: "MH03 MN 4456",
    type: "car",
    make: "Hyundai",
    model: "i20",
    color: "Blue",
    ownerName: "Suresh Iyer",
    parkingSlot: "C-10",
    isCurrent: true,
  },
  {
    flatId: "flat-c307",
    residentId: "9",
    registrationNumber: "MH03 OP 7788",
    type: "two_wheeler",
    make: "Royal Enfield",
    model: "Classic 350",
    color: "Black",
    ownerName: "Suresh Iyer",
    parkingSlot: null,
    isCurrent: false,
  },
];

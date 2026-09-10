import { residents } from "./residentsMockData";

export type UserAccountStatus = "active" | "invited" | "suspended";

export type FlatOccupancyType = "owner" | "tenant";

export type VehicleDetail = {
  registrationNumber: string;
  type: "car" | "two_wheeler";
  make: string;
  model: string;
  color: string;
};

export type UserRecord = {
  id: string;
  residentId: string | null;
  name: string;
  email: string;
  phone: string;
  role: (typeof roleOptions)[number];
  status: UserAccountStatus;
  flatNumber: string | null;
  occupancyType: FlatOccupancyType | null;
  occupation: string | null;
  vehicles: VehicleDetail[];
  parkingSlot: string | null;
  lastActiveAt: string | null;
  invitedAt: string;
};

export const occupancyTypeOptions: { label: string; value: FlatOccupancyType }[] = [
  { label: "Owner", value: "owner" },
  { label: "Tenant", value: "tenant" },
];

export const roleOptions = [
  "Society Admin",
  "Secretary",
  "Treasurer",
  "Security Guard",
  "Resident Owner",
  "Committee Member",
] as const;

function residentById(id: string) {
  const r = residents.find((x) => x.id === id);
  if (!r) throw new Error(`Resident ${id} not found`);
  return r;
}

export const users: UserRecord[] = [
  {
    id: "user-1",
    residentId: "7",
    name: residentById("7").name,
    email: residentById("7").email,
    phone: residentById("7").phone,
    role: "Society Admin",
    status: "active",
    flatNumber: residentById("7").flatNumber,
    occupancyType: residentById("7").occupancyType,
    occupation: "Retired Bank Manager",
    vehicles: [
      {
        registrationNumber: "TS09 CD 5678",
        type: "car",
        make: "Honda",
        model: "City",
        color: "Silver",
      },
      {
        registrationNumber: "TS09 ZZ 4421",
        type: "two_wheeler",
        make: "Honda",
        model: "Activa",
        color: "Black",
      },
    ],
    parkingSlot: "A-28",
    lastActiveAt: "2026-06-18T07:40:00+05:30",
    invitedAt: "2024-11-02T10:00:00+05:30",
  },
  {
    id: "user-2",
    residentId: "2",
    name: residentById("2").name,
    email: residentById("2").email,
    phone: residentById("2").phone,
    role: "Secretary",
    status: "active",
    flatNumber: residentById("2").flatNumber,
    occupancyType: residentById("2").occupancyType,
    occupation: "School Teacher",
    vehicles: [
      {
        registrationNumber: "TS10 EF 9012",
        type: "two_wheeler",
        make: "TVS",
        model: "Jupiter",
        color: "Red",
      },
    ],
    parkingSlot: "B-04",
    lastActiveAt: "2026-06-17T19:20:00+05:30",
    invitedAt: "2025-02-20T10:00:00+05:30",
  },
  {
    id: "user-3",
    residentId: "9",
    name: residentById("9").name,
    email: residentById("9").email,
    phone: residentById("9").phone,
    role: "Treasurer",
    status: "active",
    flatNumber: residentById("9").flatNumber,
    occupancyType: residentById("9").occupancyType,
    occupation: "Chartered Accountant",
    vehicles: [],
    parkingSlot: "C-09",
    lastActiveAt: "2026-06-17T19:20:00+05:30",
    invitedAt: "2025-02-20T10:00:00+05:30",
  },
  {
    id: "user-4",
    residentId: null,
    name: "Suresh Babu",
    email: "guard@greenvalley.com",
    phone: "+91 90000 12345",
    role: "Security Guard",
    status: "active",
    flatNumber: null,
    occupancyType: null,
    occupation: "Security Guard",
    vehicles: [],
    parkingSlot: null,
    lastActiveAt: "2026-06-18T06:00:00+05:30",
    invitedAt: "2025-03-05T10:00:00+05:30",
  },
  {
    id: "user-5",
    residentId: "1",
    name: residentById("1").name,
    email: residentById("1").email,
    phone: residentById("1").phone,
    role: "Committee Member",
    status: "active",
    flatNumber: residentById("1").flatNumber,
    occupancyType: residentById("1").occupancyType,
    occupation: "Software Engineer",
    vehicles: [
      {
        registrationNumber: "TS09 AB 1234",
        type: "car",
        make: "Hyundai",
        model: "Creta",
        color: "White",
      },
    ],
    parkingSlot: "B-12",
    lastActiveAt: "2026-06-18T08:10:00+05:30",
    invitedAt: "2025-01-12T10:00:00+05:30",
  },
  {
    id: "user-6",
    residentId: "3",
    name: residentById("3").name,
    email: residentById("3").email,
    phone: residentById("3").phone,
    role: "Resident Owner",
    status: "active",
    flatNumber: residentById("3").flatNumber,
    occupancyType: residentById("3").occupancyType,
    occupation: "Marketing Manager",
    vehicles: [],
    parkingSlot: null,
    lastActiveAt: "2026-06-16T12:15:00+05:30",
    invitedAt: "2025-04-18T10:00:00+05:30",
  },
  {
    id: "user-7",
    residentId: "5",
    name: residentById("5").name,
    email: residentById("5").email,
    phone: residentById("5").phone,
    role: "Resident Owner",
    status: "active",
    flatNumber: residentById("5").flatNumber,
    occupancyType: residentById("5").occupancyType,
    occupation: "Business Owner",
    vehicles: [
      {
        registrationNumber: "TS08 IJ 7890",
        type: "car",
        make: "Maruti Suzuki",
        model: "Baleno",
        color: "Blue",
      },
    ],
    parkingSlot: "B-15",
    lastActiveAt: "2026-04-02T10:30:00+05:30",
    invitedAt: "2024-09-22T10:00:00+05:30",
  },
  {
    id: "user-8",
    residentId: "8",
    name: residentById("8").name,
    email: residentById("8").email,
    phone: residentById("8").phone,
    role: "Committee Member",
    status: "active",
    flatNumber: residentById("8").flatNumber,
    occupancyType: residentById("8").occupancyType,
    occupation: "Architect",
    vehicles: [],
    parkingSlot: null,
    lastActiveAt: "2026-06-17T10:00:00+05:30",
    invitedAt: "2026-06-17T10:00:00+05:30",
  },
  {
    id: "user-9",
    residentId: "12",
    name: residentById("12").name,
    email: residentById("12").email,
    phone: residentById("12").phone,
    role: "Committee Member",
    status: "active",
    flatNumber: residentById("12").flatNumber,
    occupancyType: residentById("12").occupancyType,
    occupation: "Data Analyst",
    vehicles: [
      {
        registrationNumber: "TS09 KL 2345",
        type: "two_wheeler",
        make: "Bajaj",
        model: "Pulsar",
        color: "Black",
      },
    ],
    parkingSlot: "A-07",
    lastActiveAt: "2026-06-18T09:00:00+05:30",
    invitedAt: "2025-08-30T10:00:00+05:30",
  },
  {
    id: "user-10",
    residentId: "4",
    name: residentById("4").name,
    email: residentById("4").email,
    phone: residentById("4").phone,
    role: "Resident Owner",
    status: "invited",
    flatNumber: residentById("4").flatNumber,
    occupancyType: residentById("4").occupancyType,
    occupation: "Doctor",
    vehicles: [
      {
        registrationNumber: "TS07 GH 3456",
        type: "car",
        make: "Toyota",
        model: "Innova",
        color: "Grey",
      },
    ],
    parkingSlot: "C-09",
    lastActiveAt: null,
    invitedAt: "2026-06-14T10:00:00+05:30",
  },
  {
    id: "user-11",
    residentId: "10",
    name: residentById("10").name,
    email: residentById("10").email,
    phone: residentById("10").phone,
    role: "Resident Owner",
    status: "invited",
    flatNumber: residentById("10").flatNumber,
    occupancyType: residentById("10").occupancyType,
    occupation: "Homemaker",
    vehicles: [],
    parkingSlot: null,
    lastActiveAt: null,
    invitedAt: "2024-12-15T10:00:00+05:30",
  },
  {
    id: "user-12",
    residentId: null,
    name: "Naveen Babu",
    email: "naveen.babu@gmail.com",
    phone: "+91 90123 45678",
    role: "Security Guard",
    status: "suspended",
    flatNumber: null,
    occupancyType: null,
    occupation: "Security Guard",
    vehicles: [],
    parkingSlot: null,
    lastActiveAt: "2026-03-11T08:00:00+05:30",
    invitedAt: "2025-01-25T10:00:00+05:30",
  },
  {
    id: "user-13",
    residentId: "6",
    name: residentById("6").name,
    email: residentById("6").email,
    phone: residentById("6").phone,
    role: "Resident Owner",
    status: "active",
    flatNumber: residentById("6").flatNumber,
    occupancyType: residentById("6").occupancyType,
    occupation: "Non-resident Owner",
    vehicles: [],
    parkingSlot: null,
    lastActiveAt: "2026-06-15T11:00:00+05:30",
    invitedAt: "2025-09-10T10:00:00+05:30",
  },
  {
    id: "user-14",
    residentId: "11",
    name: residentById("11").name,
    email: residentById("11").email,
    phone: residentById("11").phone,
    role: "Resident Owner",
    status: "active",
    flatNumber: residentById("11").flatNumber,
    occupancyType: residentById("11").occupancyType,
    occupation: "Non-resident Owner",
    vehicles: [],
    parkingSlot: null,
    lastActiveAt: "2026-06-14T10:00:00+05:30",
    invitedAt: "2025-09-12T10:00:00+05:30",
  },
];

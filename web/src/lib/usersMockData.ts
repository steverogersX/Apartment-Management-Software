import { flatVehicleHistory } from "./flatsMockData";
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

/** A user's vehicles are the society's vehicle records for their flat — never a separate list. */
function currentVehiclesForResident(id: string) {
  const flatId = residentById(id).flatId;
  return flatVehicleHistory.filter((v) => v.isCurrent && !!flatId && v.flatId === flatId);
}

function vehiclesForResident(id: string): VehicleDetail[] {
  return currentVehiclesForResident(id).map((v) => ({
    registrationNumber: v.registrationNumber,
    type: v.type,
    make: v.make,
    model: v.model,
    color: v.color,
  }));
}

function parkingSlotForResident(id: string): string | null {
  return currentVehiclesForResident(id).find((v) => v.parkingSlot)?.parkingSlot ?? null;
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
    vehicles: vehiclesForResident("7"),
    parkingSlot: parkingSlotForResident("7"),
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
    vehicles: vehiclesForResident("2"),
    parkingSlot: parkingSlotForResident("2"),
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
    vehicles: vehiclesForResident("9"),
    parkingSlot: parkingSlotForResident("9"),
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
    vehicles: vehiclesForResident("1"),
    parkingSlot: parkingSlotForResident("1"),
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
    vehicles: vehiclesForResident("3"),
    parkingSlot: parkingSlotForResident("3"),
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
    vehicles: vehiclesForResident("5"),
    parkingSlot: parkingSlotForResident("5"),
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
    vehicles: vehiclesForResident("8"),
    parkingSlot: parkingSlotForResident("8"),
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
    vehicles: vehiclesForResident("12"),
    parkingSlot: parkingSlotForResident("12"),
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
    vehicles: vehiclesForResident("4"),
    parkingSlot: parkingSlotForResident("4"),
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
    vehicles: vehiclesForResident("10"),
    parkingSlot: parkingSlotForResident("10"),
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
    vehicles: vehiclesForResident("6"),
    parkingSlot: parkingSlotForResident("6"),
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
    vehicles: vehiclesForResident("11"),
    parkingSlot: parkingSlotForResident("11"),
    lastActiveAt: "2026-06-14T10:00:00+05:30",
    invitedAt: "2025-09-12T10:00:00+05:30",
  },
  {
    id: "user-b304",
    residentId: "14",
    name: residentById("14").name,
    email: residentById("14").email,
    phone: residentById("14").phone,
    role: "Resident Owner",
    status: "active",
    flatNumber: residentById("14").flatNumber,
    occupancyType: residentById("14").occupancyType,
    occupation: null,
    vehicles: vehiclesForResident("14"),
    parkingSlot: parkingSlotForResident("14"),
    lastActiveAt: "2026-06-18T09:00:00+05:30",
    invitedAt: "2025-07-01T10:00:00+05:30",
  },
];

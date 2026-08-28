export type UserAccountStatus = "active" | "invited" | "suspended";

export type FlatOccupancyType = "owner" | "tenant";

export type VehicleDetail = {
  registrationNumber: string;
  type: "car" | "two_wheeler";
  make: string;
  model: string;
  color: string;
};

/**
 * Occupation, vehicles, and parking slot are not backed by any DB table yet (no `vehicles` or
 * `parking_slots` schema, no `occupation` column on `users`) — UI-only mock data until those are built.
 */
export type UserRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
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
  "Resident",
  "Tenant",
  "Society Admin",
  "Treasurer",
  "Committee Member",
  "Security Guard",
] as const;

export const users: UserRecord[] = [
  {
    id: "1",
    name: "Priya Sharma",
    email: "resident@greenvalley.com",
    phone: "+91 98765 43210",
    role: "Resident",
    status: "active",
    flatNumber: "304",
    occupancyType: "tenant",
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
    id: "2",
    name: "Anil Reddy",
    email: "admin@greenvalley.com",
    phone: "+91 98765 11122",
    role: "Society Admin",
    status: "active",
    flatNumber: "101",
    occupancyType: "owner",
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
    parkingSlot: "A-01",
    lastActiveAt: "2026-06-18T07:40:00+05:30",
    invitedAt: "2024-11-02T10:00:00+05:30",
  },
  {
    id: "3",
    name: "Kavitha Rao",
    email: "kavitha.rao@gmail.com",
    phone: "+91 99887 76655",
    role: "Treasurer",
    status: "active",
    flatNumber: "204",
    occupancyType: "owner",
    occupation: "Chartered Accountant",
    vehicles: [],
    parkingSlot: null,
    lastActiveAt: "2026-06-17T19:20:00+05:30",
    invitedAt: "2025-02-20T10:00:00+05:30",
  },
  {
    id: "4",
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
    id: "5",
    name: "Lakshmi Narayanan",
    email: "lakshmi.n@gmail.com",
    phone: "+91 91234 56789",
    role: "Committee Member",
    status: "active",
    flatNumber: "402",
    occupancyType: "owner",
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
    lastActiveAt: "2026-06-16T12:15:00+05:30",
    invitedAt: "2025-04-18T10:00:00+05:30",
  },
  {
    id: "6",
    name: "Ramesh Iyer",
    email: "ramesh.iyer@outlook.com",
    phone: "+91 90909 80808",
    role: "Tenant",
    status: "invited",
    flatNumber: "104",
    occupancyType: "tenant",
    occupation: "Marketing Manager",
    vehicles: [],
    parkingSlot: null,
    lastActiveAt: null,
    invitedAt: "2026-06-14T10:00:00+05:30",
  },
  {
    id: "7",
    name: "Deepa Krishnan",
    email: "deepa.k@gmail.com",
    phone: "+91 93456 78901",
    role: "Resident",
    status: "active",
    flatNumber: "210",
    occupancyType: "owner",
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
    lastActiveAt: "2026-06-15T21:00:00+05:30",
    invitedAt: "2025-05-09T10:00:00+05:30",
  },
  {
    id: "8",
    name: "Vijay Kumar",
    email: "vijay.kumar@gmail.com",
    phone: "+91 98989 67676",
    role: "Resident",
    status: "suspended",
    flatNumber: "308",
    occupancyType: "owner",
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
    id: "9",
    name: "Meena Pillai",
    email: "meena.pillai@gmail.com",
    phone: "+91 97777 65432",
    role: "Committee Member",
    status: "invited",
    flatNumber: "503",
    occupancyType: "tenant",
    occupation: "Architect",
    vehicles: [],
    parkingSlot: null,
    lastActiveAt: null,
    invitedAt: "2026-06-17T10:00:00+05:30",
  },
  {
    id: "10",
    name: "Arjun Menon",
    email: "arjun.menon@gmail.com",
    phone: "+91 95555 43210",
    role: "Tenant",
    status: "active",
    flatNumber: "112",
    occupancyType: "tenant",
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
    id: "11",
    name: "Geetha Subramanian",
    email: "geetha.s@gmail.com",
    phone: "+91 96666 54321",
    role: "Resident",
    status: "active",
    flatNumber: "401",
    occupancyType: "owner",
    occupation: "Homemaker",
    vehicles: [],
    parkingSlot: null,
    lastActiveAt: "2026-06-13T17:45:00+05:30",
    invitedAt: "2024-12-15T10:00:00+05:30",
  },
  {
    id: "12",
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
];

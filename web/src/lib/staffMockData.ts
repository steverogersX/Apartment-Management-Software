import { z } from "zod";

/**
 * UI-only mock data for the Staff module — society-employed workforce (security, housekeeping,
 * maintenance trades), their wages, and gate attendance. Distinct from the per-flat "Domestic
 * Staff" stub in the sidebar, which covers residents' privately-hired help, not society payroll.
 * No backing table or API yet.
 */

export type StaffRole =
  | "Security Guard"
  | "Housekeeping"
  | "Plumber"
  | "Electrician"
  | "Gardener"
  | "Watchman"
  | "Supervisor";

export const STAFF_ROLES: StaffRole[] = [
  "Security Guard",
  "Housekeeping",
  "Plumber",
  "Electrician",
  "Gardener",
  "Watchman",
  "Supervisor",
];

export type StaffShift = "Day" | "Night" | "Rotational";

export const STAFF_SHIFTS: StaffShift[] = ["Day", "Night", "Rotational"];

export type StaffStatus = "active" | "on_leave" | "inactive";

export type StaffMember = {
  id: string;
  name: string;
  role: StaffRole;
  phone: string;
  shift: StaffShift;
  monthlyWage: number;
  joinedOn: string;
  idProofVerified: boolean;
  status: StaffStatus;
};

export const editStaffSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum([
    "Security Guard",
    "Housekeeping",
    "Plumber",
    "Electrician",
    "Gardener",
    "Watchman",
    "Supervisor",
  ]),
  phone: z.string().min(10, "Enter a valid phone number"),
  shift: z.enum(["Day", "Night", "Rotational"]),
  monthlyWage: z.coerce.number().min(0, "Monthly wage must be >= 0"),
  joinedOn: z.string().min(1, "Joining date is required"),
  idProofVerified: z.boolean(),
  status: z.enum(["active", "on_leave", "inactive"]),
});

export type EditStaffInput = z.infer<typeof editStaffSchema>;

export const staffMembers: StaffMember[] = [
  {
    id: "stf-1",
    name: "Ramesh Yadav",
    role: "Security Guard",
    phone: "+91 98201 11122",
    shift: "Day",
    monthlyWage: 18000,
    joinedOn: "2022-01-10T00:00:00+05:30",
    idProofVerified: true,
    status: "active",
  },
  {
    id: "stf-2",
    name: "Vijay Pawar",
    role: "Security Guard",
    phone: "+91 98201 22233",
    shift: "Night",
    monthlyWage: 19000,
    joinedOn: "2021-07-15T00:00:00+05:30",
    idProofVerified: true,
    status: "active",
  },
  {
    id: "stf-3",
    name: "Dinesh Kumar",
    role: "Watchman",
    phone: "+91 98201 33344",
    shift: "Rotational",
    monthlyWage: 16000,
    joinedOn: "2023-03-01T00:00:00+05:30",
    idProofVerified: true,
    status: "on_leave",
  },
  {
    id: "stf-4",
    name: "Lakshmi Bai",
    role: "Housekeeping",
    phone: "+91 98201 44455",
    shift: "Day",
    monthlyWage: 14000,
    joinedOn: "2020-11-20T00:00:00+05:30",
    idProofVerified: true,
    status: "active",
  },
  {
    id: "stf-5",
    name: "Saroja Devi",
    role: "Housekeeping",
    phone: "+91 98201 55566",
    shift: "Day",
    monthlyWage: 14000,
    joinedOn: "2024-06-01T00:00:00+05:30",
    idProofVerified: false,
    status: "active",
  },
  {
    id: "stf-6",
    name: "Manoj Verma",
    role: "Plumber",
    phone: "+91 98201 66677",
    shift: "Day",
    monthlyWage: 22000,
    joinedOn: "2019-05-12T00:00:00+05:30",
    idProofVerified: true,
    status: "active",
  },
  {
    id: "stf-7",
    name: "Irfan Sheikh",
    role: "Electrician",
    phone: "+91 98201 77788",
    shift: "Day",
    monthlyWage: 23000,
    joinedOn: "2022-09-09T00:00:00+05:30",
    idProofVerified: true,
    status: "active",
  },
  {
    id: "stf-8",
    name: "Ganesh Mali",
    role: "Gardener",
    phone: "+91 98201 88899",
    shift: "Day",
    monthlyWage: 13000,
    joinedOn: "2021-02-18T00:00:00+05:30",
    idProofVerified: true,
    status: "active",
  },
  {
    id: "stf-9",
    name: "Pradeep Singh",
    role: "Supervisor",
    phone: "+91 98201 99900",
    shift: "Day",
    monthlyWage: 28000,
    joinedOn: "2018-08-01T00:00:00+05:30",
    idProofVerified: true,
    status: "active",
  },
  {
    id: "stf-10",
    name: "Arun Nair",
    role: "Security Guard",
    phone: "+91 98201 10011",
    shift: "Night",
    monthlyWage: 18500,
    joinedOn: "2023-01-05T00:00:00+05:30",
    idProofVerified: false,
    status: "inactive",
  },
];

export type StaffAttendanceEvent = {
  id: string;
  staffId: string;
  date: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  loggedBy: string;
};

export const staffAttendanceEvents: StaffAttendanceEvent[] = [
  {
    id: "satt-1-09-30",
    staffId: "stf-1",
    date: "2026-09-30",
    checkInAt: "2026-09-30T08:02:00+05:30",
    checkOutAt: "2026-09-30T20:05:00+05:30",
    loggedBy: "Pradeep Singh",
  },
  {
    id: "satt-1-10-01",
    staffId: "stf-1",
    date: "2026-10-01",
    checkInAt: "2026-10-01T07:58:00+05:30",
    checkOutAt: "2026-10-01T20:01:00+05:30",
    loggedBy: "Pradeep Singh",
  },
  {
    id: "satt-1-10-02",
    staffId: "stf-1",
    date: "2026-10-02",
    checkInAt: "2026-10-02T08:00:00+05:30",
    checkOutAt: null,
    loggedBy: "Pradeep Singh",
  },
  {
    id: "satt-2-09-30",
    staffId: "stf-2",
    date: "2026-09-30",
    checkInAt: "2026-09-30T20:03:00+05:30",
    checkOutAt: "2026-10-01T08:04:00+05:30",
    loggedBy: "Ramesh Yadav",
  },
  {
    id: "satt-2-10-01",
    staffId: "stf-2",
    date: "2026-10-01",
    checkInAt: "2026-10-01T20:00:00+05:30",
    checkOutAt: "2026-10-02T08:02:00+05:30",
    loggedBy: "Ramesh Yadav",
  },
  {
    id: "satt-4-10-01",
    staffId: "stf-4",
    date: "2026-10-01",
    checkInAt: "2026-10-01T07:30:00+05:30",
    checkOutAt: "2026-10-01T11:35:00+05:30",
    loggedBy: "Ramesh Yadav",
  },
  {
    id: "satt-4-10-02",
    staffId: "stf-4",
    date: "2026-10-02",
    checkInAt: "2026-10-02T07:28:00+05:30",
    checkOutAt: "2026-10-02T11:30:00+05:30",
    loggedBy: "Ramesh Yadav",
  },
  {
    id: "satt-5-10-02",
    staffId: "stf-5",
    date: "2026-10-02",
    checkInAt: "2026-10-02T07:35:00+05:30",
    checkOutAt: null,
    loggedBy: "Ramesh Yadav",
  },
  {
    id: "satt-6-10-01",
    staffId: "stf-6",
    date: "2026-10-01",
    checkInAt: "2026-10-01T09:10:00+05:30",
    checkOutAt: "2026-10-01T17:20:00+05:30",
    loggedBy: "Ramesh Yadav",
  },
  {
    id: "satt-7-10-01",
    staffId: "stf-7",
    date: "2026-10-01",
    checkInAt: "2026-10-01T09:05:00+05:30",
    checkOutAt: "2026-10-01T17:15:00+05:30",
    loggedBy: "Ramesh Yadav",
  },
  {
    id: "satt-8-10-02",
    staffId: "stf-8",
    date: "2026-10-02",
    checkInAt: "2026-10-02T06:45:00+05:30",
    checkOutAt: "2026-10-02T10:30:00+05:30",
    loggedBy: "Ramesh Yadav",
  },
  {
    id: "satt-9-10-02",
    staffId: "stf-9",
    date: "2026-10-02",
    checkInAt: "2026-10-02T09:00:00+05:30",
    checkOutAt: null,
    loggedBy: "Ramesh Yadav",
  },
];

export function getStaffAttendance(staffId: string): StaffAttendanceEvent[] {
  return staffAttendanceEvents
    .filter((e) => e.staffId === staffId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function totalMonthlyStaffCost(members: StaffMember[] = staffMembers): number {
  return members.filter((m) => m.status !== "inactive").reduce((sum, m) => sum + m.monthlyWage, 0);
}

/**
 * Mock for the multi-role AccountMenu.
 * Mirrors the screenshot persona: Arjun Mehta @ Sunrise Heights,
 * now with several roles in the same society to demo context switching.
 */
export const mockAccountUser = {
  displayName: "Arjun Mehta",
  email: "admin@sunriseheights.com",
  initials: "AM",
};

export const mockActiveSocietyName = "Sunrise Heights";

export const mockRoles: string[] = [
  "Society Admin",
  "Treasurer",
  "Secretary",
  "Committee Member",
  "Resident Owner",
  "Security Guard",
  "Auditor",
  "Facility Manager",
  "Parking Coordinator",
  "Event Coordinator",
];

export const mockPermissions: string[] = [
  "billing.view",
  "billing.generate",
  "billing.approve",
  "billing.waive",
  "billing.export",
  "notices.post",
  "notices.delete",
  "complaints.assign",
  "complaints.resolve",
  "complaints.view_all",
  "roles.view",
  "roles.create",
  "roles.assign",
  "society.settings.view",
  "society.settings.update",
];

export const roleMeta: Record<string, { label: string; description: string }> = {
  "Society Admin": {
    label: "Society Admin",
    description: "Full access — manage society",
  },
  Treasurer: {
    label: "Treasurer",
    description: "Billing, dues & payouts",
  },
  Secretary: {
    label: "Secretary",
    description: "Notices, complaints, residents",
  },
  "Committee Member": {
    label: "Committee Member",
    description: "Complaints & notices oversight",
  },
  "Resident Owner": {
    label: "Resident Owner",
    description: "Resident — Flat A, Tower B",
  },
  Resident: {
    label: "Resident",
    description: "Resident access — flats & bookings",
  },
  "Security Guard": {
    label: "Security Guard",
    description: "Gate & visitor approvals",
  },
  Auditor: {
    label: "Auditor",
    description: "Financial audits & compliance",
  },
  "Facility Manager": {
    label: "Facility Manager",
    description: "Maintenance & amenities ops",
  },
  "Parking Coordinator": {
    label: "Parking Coordinator",
    description: "Slots, vehicles & allotments",
  },
  "Event Coordinator": {
    label: "Event Coordinator",
    description: "Community events & bookings",
  },
};

export type MockFlat = {
  id: string;
  label: string;
  flatNumber: string;
  tower: string;
  floor: number;
  type: string;
  areaSqft: number;
  ownership: "Owner" | "Tenant";
  societyName: string;
};

export const mockFlats: MockFlat[] = [
  {
    id: "flat-a",
    label: "Flat A",
    flatNumber: "304",
    tower: "Tower B",
    floor: 3,
    type: "3BHK",
    areaSqft: 1450,
    ownership: "Owner",
    societyName: "Sunrise Heights",
  },
  {
    id: "flat-b",
    label: "Flat B",
    flatNumber: "104",
    tower: "Tower A",
    floor: 1,
    type: "2BHK",
    areaSqft: 980,
    ownership: "Tenant",
    societyName: "Green Valley Residency",
  },
];

export const mockActiveFlatId = "flat-a";

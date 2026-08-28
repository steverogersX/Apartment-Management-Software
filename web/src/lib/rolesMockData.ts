import { ALL_PERMISSIONS, Permission, type PermissionKey } from "@shared/index";

export type RoleRecord = {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  memberCount: number;
  permissions: PermissionKey[];
  updatedAt: string;
};

export const permissionDomains: string[] = Array.from(
  new Set(ALL_PERMISSIONS.map((p) => p.domain)),
);

export const roles: RoleRecord[] = [
  {
    id: "role-society-admin",
    name: "Society Admin",
    description: "Full administrative control over this society.",
    isSystem: true,
    memberCount: 2,
    permissions: Object.keys(Permission) as PermissionKey[],
    updatedAt: "2025-01-12T10:00:00+05:30",
  },
  {
    id: "role-treasurer",
    name: "Treasurer",
    description: "Manages billing, dues, and financial approvals.",
    isSystem: true,
    memberCount: 1,
    permissions: [
      "BillingView",
      "BillingGenerate",
      "BillingApprove",
      "BillingWaive",
      "BillingExport",
    ],
    updatedAt: "2025-02-20T10:00:00+05:30",
  },
  {
    id: "role-secretary",
    name: "Secretary",
    description: "Handles notices, complaints, and resident records.",
    isSystem: true,
    memberCount: 1,
    permissions: [
      "NoticesPost",
      "NoticesDelete",
      "ComplaintsAssign",
      "ComplaintsResolve",
      "ComplaintsEscalate",
      "ComplaintsViewAll",
      "ResidentsView",
      "ResidentsUpdate",
    ],
    updatedAt: "2025-03-02T10:00:00+05:30",
  },
  {
    id: "role-guard",
    name: "Security Guard",
    description: "Gate operations — visitor approvals and entry logs.",
    isSystem: true,
    memberCount: 2,
    permissions: ["VisitorApprove", "VisitorDeny", "VisitorLogEntry", "VisitorOverstayAlert"],
    updatedAt: "2025-03-05T10:00:00+05:30",
  },
  {
    id: "role-resident-owner",
    name: "Resident Owner",
    description: "Default role for flat owners.",
    isSystem: true,
    memberCount: 24,
    permissions: ["AmenitiesView", "AmenitiesBook", "ComplaintsRaise", "BillingView"],
    updatedAt: "2024-11-02T10:00:00+05:30",
  },
  {
    id: "role-committee-member",
    name: "Committee Member",
    description: "Custom role with elevated visibility across complaints and notices.",
    isSystem: false,
    memberCount: 4,
    permissions: [
      "ComplaintsViewAll",
      "ComplaintsAssign",
      "NoticesPost",
      "AmenitiesManage",
      "ResidentsView",
    ],
    updatedAt: "2025-04-18T10:00:00+05:30",
  },
];

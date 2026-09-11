import { ALL_PERMISSIONS, Permission, type PermissionKey } from "@shared/index";
import { users } from "./usersMockData";

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

function countForRole(name: string) {
  return users.filter((u) => u.role === name).length;
}

/**
 * Own-flat resident permissions — Society Admin is an administrative role, not itself a resident,
 * so it must not implicitly pick these up just by holding "every" permission. Keeps the personal
 * "My Flat"/"Vehicles & Parking" nav from leaking into the admin console for this role.
 */
const RESIDENT_ONLY_PERMISSIONS: PermissionKey[] = [
  "InvoicingViewOwn",
  "DuesReceiptsViewOwn",
  "BudgetViewOwn",
  "EventsViewOwn",
  "AmenitiesBook",
  "ComplaintsRaise",
];

export const roles: RoleRecord[] = [
  {
    id: "role-society-admin",
    name: "Society Admin",
    description: "Full administrative control over this society.",
    isSystem: true,
    memberCount: countForRole("Society Admin"),
    permissions: (Object.keys(Permission) as PermissionKey[]).filter(
      (key) => !RESIDENT_ONLY_PERMISSIONS.includes(key),
    ),
    updatedAt: "2025-01-12T10:00:00+05:30",
  },
  {
    id: "role-treasurer",
    name: "Treasurer",
    description: "Manages billing, dues, and financial approvals.",
    isSystem: true,
    memberCount: countForRole("Treasurer"),
    permissions: [
      "BillingView",
      "BillingGenerate",
      "BillingApprove",
      "BillingWaive",
      "BillingExport",
      "AssetsView",
      "AssetsManage",
      "InventoryView",
      "InventoryManage",
      "InvoicingViewAll",
      "InvoicingManage",
      "BillingSettingsView",
      "BillingSettingsManage",
      "DuesReceiptsViewAll",
      "DuesReceiptsManage",
      "PurchasingView",
      "PurchasingManage",
      "VouchersView",
      "VouchersManage",
      "BankAccountsView",
      "BankAccountsManage",
      "ChartOfAccountsView",
      "ChartOfAccountsManage",
      "BudgetViewAll",
      "BudgetManage",
      "EventsViewAll",
      "EventsManage",
    ],
    updatedAt: "2025-02-20T10:00:00+05:30",
  },
  {
    id: "role-secretary",
    name: "Secretary",
    description: "Handles notices, complaints, and resident records.",
    isSystem: true,
    memberCount: countForRole("Secretary"),
    permissions: [
      "NoticesPost",
      "ForumPost",
      "PollsCreate",
      "MeetingsSchedule",
      "DocumentsUpload",
      "ElectionsManage",
      "NoticesDelete",
      "ComplaintsAssign",
      "ComplaintsResolve",
      "ComplaintsEscalate",
      "ComplaintsViewAll",
      "ResidentsView",
      "ResidentsUpdate",
      // Purchasing approval intentionally lives with Committee, not here — see its comment there.
      "PurchasingView",
      "StatutoryRegistersView",
      "StatutoryRegistersManage",
      "ActivityLogView",
      "BudgetViewAll",
      "EventsViewAll",
    ],
    updatedAt: "2025-03-02T10:00:00+05:30",
  },
  {
    id: "role-guard",
    name: "Security Guard",
    description: "Gate operations — visitor approvals and entry logs.",
    isSystem: true,
    memberCount: countForRole("Security Guard"),
    permissions: [
      "VisitorApprove",
      "VisitorDeny",
      "VisitorLogEntry",
      "VisitorOverstayAlert",
      "AssetsView",
    ],
    updatedAt: "2025-03-05T10:00:00+05:30",
  },
  {
    id: "role-resident-owner",
    name: "Resident Owner",
    description: "Default role for flat owners.",
    isSystem: true,
    memberCount: countForRole("Resident Owner"),
    permissions: ["AmenitiesView", "AmenitiesBook", "ComplaintsRaise", "BillingView", "ForumPost"],
    updatedAt: "2024-11-02T10:00:00+05:30",
  },
  {
    id: "role-committee-member",
    name: "Committee Member",
    description: "Custom role with elevated visibility across complaints and notices.",
    isSystem: false,
    memberCount: countForRole("Committee Member"),
    permissions: [
      "ComplaintsViewAll",
      "ComplaintsAssign",
      "NoticesPost",
      "ForumPost",
      "PollsCreate",
      "MeetingsSchedule",
      "DocumentsUpload",
      // Elections stay with Secretary alone, not Committee: committee members are typically
      // themselves candidates, so letting them administer their own election is a conflict
      // of interest.
      "AmenitiesManage",
      "ResidentsView",
      "AssetsView",
      "InventoryView",
      "InvoicingViewAll",
      "DuesReceiptsViewAll",
      "PurchasingView",
      // Approval sits here (an independent body) rather than Treasurer, who already holds
      // PurchasingManage — preparer and approver must be different roles.
      "PurchasingApprove",
      "VouchersView",
      "BankAccountsView",
      "ChartOfAccountsView",
      "BudgetViewAll",
      "EventsViewAll",
      "StatutoryRegistersView",
      "ActivityLogView",
    ],
    updatedAt: "2025-04-18T10:00:00+05:30",
  },
];

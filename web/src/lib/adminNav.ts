import type { ComponentType } from "react";
import { Boxes, Landmark, Megaphone, Sofa, Ticket, Users, Wrench } from "lucide-react";

import { Permission, type PermissionDefinition } from "@shared/index";

export type AdminNavGroupItem = {
  label: string;
  href?: string;
  /** Omit for items every admin viewing this group should see; set to gate via the typed `Permission.*` accessor. */
  permission?: PermissionDefinition;
  /** Any-of gate: visible when the user holds at least one of these. Takes precedence when set. */
  permissions?: PermissionDefinition[];
};

export type AdminNavGroup = {
  label: string;
  icon: ComponentType<{ className?: string }>;
  items: AdminNavGroupItem[];
};

/**
 * The Society Admin console's structure — grouped for the left sidebar. Every
 * group is a static placeholder for now: sub-items are display-only, not yet
 * wired to real pages.
 */
export const adminNavGroups: AdminNavGroup[] = [
  {
    label: "People Hub",
    icon: Users,
    items: [
      { label: "Flats", href: "/dashboard/people-hub/flats", permission: Permission.ResidentsView },
      {
        label: "History",
        href: "/dashboard/people-hub/history",
        permission: Permission.ResidentsView,
      },
      {
        label: "Management Committee",
        href: "/dashboard/people-hub/committee",
        permission: Permission.ResidentsView,
      },
      {
        label: "Service Providers",
        href: "/dashboard/people-hub/service-providers",
        permission: Permission.ResidentsView,
      },
      {
        label: "Vehicles",
        href: "/dashboard/people-hub/vehicles",
        permission: Permission.ResidentsView,
      },
      {
        label: "Parking",
        href: "/dashboard/people-hub/parking",
        permission: Permission.ResidentsView,
      },
      {
        label: "Visitors",
        href: "/dashboard/people-hub/visitors",
        permissions: [
          Permission.VisitorApprove,
          Permission.VisitorDeny,
          Permission.VisitorLogEntry,
          Permission.VisitorViewHistory,
          Permission.VisitorOverstayAlert,
        ],
      },
      { label: "Users", href: "/dashboard/users", permission: Permission.RolesView },
      { label: "Roles", href: "/dashboard/roles", permission: Permission.RolesView },
    ],
  },
  {
    label: "Communication",
    icon: Megaphone,
    items: [
      // Notice Board is read access for the whole society — intentionally ungated.
      { label: "Notice Board", href: "/dashboard/notices" },
      {
        label: "Events",
        href: "/dashboard/accounts/events",
        // EventsViewOwn only — this is resident-only in mockBackend.ts (RESIDENT_ONLY_PERMISSIONS),
        // so Society Admin/Treasurer/Secretary/Committee (who hold EventsViewAll) don't get a second
        // entry point here; they already have Accounts > Events.
        permission: Permission.EventsViewOwn,
      },
      {
        label: "Discussion Forum",
        href: "/dashboard/discussion-forum",
        permission: Permission.ForumPost,
      },
      {
        label: "Opinion Polls",
        href: "/dashboard/opinion-polls",
        permission: Permission.PollsCreate,
      },
      { label: "Meetings", href: "/dashboard/meetings", permission: Permission.MeetingsSchedule },
      { label: "Documents", href: "/dashboard/documents", permission: Permission.DocumentsUpload },
      {
        label: "Election Polls",
        href: "/dashboard/election-polls",
        permission: Permission.ElectionsManage,
      },
    ],
  },
  {
    label: "Help Desk",
    icon: Ticket,
    items: [
      {
        label: "Complaints",
        href: "/dashboard/complaints/manage",
        permissions: [
          Permission.ComplaintsViewAll,
          Permission.ComplaintsAssign,
          Permission.ComplaintsResolve,
          Permission.ComplaintsEscalate,
        ],
      },
      {
        label: "Helpdesk Settings",
        href: "/dashboard/helpdesk-settings",
        permission: Permission.SocietySettingsUpdate,
      },
      {
        label: "Reports",
        href: "/dashboard/helpdesk-reports",
        permission: Permission.ComplaintsViewAll,
      },
    ],
  },
  {
    label: "Amenities",
    icon: Sofa,
    items: [{ label: "Bookings & History", permission: Permission.AmenitiesManage }],
  },
  {
    label: "Maintenance",
    icon: Wrench,
    items: [
      {
        label: "Records",
        href: "/dashboard/maintenance/records",
        permission: Permission.AssetsView,
      },
      {
        label: "History",
        href: "/dashboard/maintenance/history",
        permission: Permission.AssetsView,
      },
    ],
  },
  {
    label: "Asset & Inventory",
    icon: Boxes,
    items: [
      {
        label: "Assets",
        href: "/dashboard/asset-inventory/assets",
        permissions: [Permission.AssetsView],
      },
      {
        label: "Inventory",
        href: "/dashboard/asset-inventory/inventory",
        permissions: [Permission.InventoryView],
      },
    ],
  },
  {
    label: "Accounts",
    icon: Landmark,
    items: [
      {
        label: "Budget",
        href: "/dashboard/accounts/budget",
        permissions: [Permission.BudgetViewAll, Permission.BudgetViewOwn],
      },
      {
        label: "Events",
        href: "/dashboard/accounts/events",
        permissions: [Permission.EventsViewAll, Permission.EventsViewOwn],
      },
      {
        label: "Invoicing",
        href: "/dashboard/accounts/invoicing",
        permissions: [Permission.InvoicingViewAll, Permission.InvoicingViewOwn],
      },
      {
        label: "Billing Details",
        href: "/dashboard/accounts/billing-details",
        permissions: [Permission.BillingSettingsView],
      },
      {
        label: "Dues and Receipts",
        href: "/dashboard/accounts/dues-and-receipts",
        permissions: [Permission.DuesReceiptsViewAll, Permission.DuesReceiptsViewOwn],
      },
      {
        label: "Purchasing",
        href: "/dashboard/accounts/purchasing",
        permissions: [Permission.PurchasingView],
      },
      {
        label: "Vouchers",
        href: "/dashboard/accounts/vouchers",
        permissions: [Permission.VouchersView],
      },
      {
        label: "Bank Accounts",
        href: "/dashboard/accounts/bank-accounts",
        permissions: [Permission.BankAccountsView],
      },
      {
        label: "Statutory Registers",
        href: "/dashboard/accounts/statutory-registers",
        permissions: [Permission.StatutoryRegistersView],
      },
      {
        label: "Activity Log",
        href: "/dashboard/accounts/activity-log",
        permissions: [Permission.ActivityLogView],
      },
    ],
  },
];

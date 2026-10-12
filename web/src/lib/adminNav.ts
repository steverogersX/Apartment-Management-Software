import type { ComponentType } from "react";
import {
  Boxes,
  HardHat,
  Landmark,
  Megaphone,
  Ticket,
  Users,
  Wrench,
  Home,
  History,
  UsersRound,
  Handshake,
  Car,
  SquareParking,
  DoorOpen,
  UserCog,
  ShieldCheck,
  Pin,
  MessagesSquare,
  ChartColumn,
  CalendarDays,
  FolderOpen,
  Vote,
  ClipboardList,
  Settings,
  ChartPie,
  IndianRupee,
  Hammer,
  Contact,
  CalendarCheck,
  Package,
  Warehouse,
  PiggyBank,
  ReceiptText,
  Network,
  SlidersHorizontal,
  Receipt,
  ShoppingCart,
  FileSpreadsheet,
  Banknote,
  BookOpenText,
  ScrollText,
} from "lucide-react";

import { Permission, type PermissionDefinition } from "@shared/index";

export type AdminNavGroupItem = {
  label: string;
  icon?: ComponentType<{ className?: string }>;
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
      {
        label: "Flats",
        icon: Home,
        href: "/dashboard/people-hub/flats",
        permission: Permission.ResidentsView,
      },
      {
        label: "History",
        icon: History,
        href: "/dashboard/people-hub/history",
        permission: Permission.ResidentsView,
      },
      {
        label: "Management Committee",
        icon: UsersRound,
        href: "/dashboard/people-hub/committee",
        permission: Permission.ResidentsView,
      },
      {
        label: "Service Providers",
        icon: Handshake,
        href: "/dashboard/people-hub/service-providers",
        permission: Permission.ResidentsView,
      },
      {
        label: "Vehicles",
        icon: Car,
        href: "/dashboard/people-hub/vehicles",
        permission: Permission.ResidentsView,
      },
      {
        label: "Parking",
        icon: SquareParking,
        href: "/dashboard/people-hub/parking",
        permission: Permission.ResidentsView,
      },
      {
        label: "Visitor Log",
        icon: DoorOpen,
        href: "/dashboard/people-hub/visitors",
        permissions: [
          Permission.VisitorApprove,
          Permission.VisitorDeny,
          Permission.VisitorLogEntry,
          Permission.VisitorViewHistory,
          Permission.VisitorOverstayAlert,
        ],
      },
      { label: "Users", icon: UserCog, href: "/dashboard/users", permission: Permission.RolesView },
      {
        label: "Roles",
        icon: ShieldCheck,
        href: "/dashboard/roles",
        permission: Permission.RolesView,
      },
    ],
  },
  {
    label: "Communication",
    icon: Megaphone,
    items: [
      // Notice Board is read access for the whole society — intentionally ungated.
      { label: "Notice Board", icon: Pin, href: "/dashboard/notices" },
      {
        label: "Discussion Forum",
        icon: MessagesSquare,
        href: "/dashboard/discussion-forum",
        permission: Permission.ForumPost,
      },
      // Any resident can view and vote in opinion polls — the page itself only gates the
      // "New Poll" button on PollsCreate, so the nav entry stays ungated like Notice Board.
      { label: "Opinion Polls", icon: ChartColumn, href: "/dashboard/opinion-polls" },
      // Meetings/Documents are readable by every resident — each page only gates its own
      // "Schedule"/"Upload" button on MeetingsSchedule/DocumentsUpload, so the nav stays ungated.
      { label: "Meetings", icon: CalendarDays, href: "/dashboard/meetings" },
      { label: "Documents", icon: FolderOpen, href: "/dashboard/documents" },
      // Any resident can view elections and vote — the page itself only gates the
      // "New Election" button on ElectionsManage, so the nav entry stays ungated.
      { label: "Election Polls", icon: Vote, href: "/dashboard/election-polls" },
    ],
  },
  {
    label: "Help Desk",
    icon: Ticket,
    items: [
      {
        label: "Manage Complaints",
        icon: ClipboardList,
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
        icon: Settings,
        href: "/dashboard/helpdesk-settings",
        permission: Permission.SocietySettingsUpdate,
      },
      {
        label: "Reports",
        icon: ChartPie,
        href: "/dashboard/helpdesk-reports",
        permission: Permission.ComplaintsViewAll,
      },
    ],
  },
  {
    label: "Maintenance",
    icon: Wrench,
    items: [
      {
        label: "Dues & Payments",
        icon: IndianRupee,
        href: "/dashboard/maintenance/dues",
        permission: Permission.MaintenanceViewAll,
      },
      {
        label: "Society Maintenance",
        icon: Hammer,
        href: "/dashboard/maintenance/society",
        permission: Permission.MaintenanceViewAll,
      },
    ],
  },
  {
    label: "Staff",
    icon: HardHat,
    items: [
      {
        label: "Directory",
        icon: Contact,
        href: "/dashboard/staff",
        permissions: [Permission.StaffManage, Permission.StaffViewAttendance],
      },
      {
        label: "Attendance",
        icon: CalendarCheck,
        href: "/dashboard/staff/attendance",
        permissions: [
          Permission.StaffCheckin,
          Permission.StaffCheckout,
          Permission.StaffViewAttendance,
        ],
      },
    ],
  },
  {
    label: "Asset & Inventory",
    icon: Boxes,
    items: [
      {
        label: "Assets",
        icon: Package,
        href: "/dashboard/asset-inventory/assets",
        permissions: [Permission.AssetsView],
      },
      {
        label: "Inventory",
        icon: Warehouse,
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
        icon: PiggyBank,
        href: "/dashboard/accounts/budget",
        permissions: [Permission.BudgetViewAll],
      },
      {
        label: "Invoicing",
        icon: ReceiptText,
        href: "/dashboard/accounts/invoicing",
        permissions: [Permission.InvoicingViewAll],
      },
      {
        label: "Chart of Accounts",
        icon: Network,
        href: "/dashboard/accounts/chart-of-accounts",
        permissions: [Permission.ChartOfAccountsView],
      },
      {
        label: "Billing Details",
        icon: SlidersHorizontal,
        href: "/dashboard/accounts/billing-details",
        permissions: [Permission.BillingSettingsView],
      },
      {
        label: "Dues and Receipts",
        icon: Receipt,
        href: "/dashboard/accounts/dues-and-receipts",
        permissions: [Permission.DuesReceiptsViewAll],
      },
      {
        label: "Purchasing",
        icon: ShoppingCart,
        href: "/dashboard/accounts/purchasing",
        permissions: [Permission.PurchasingView],
      },
      {
        label: "Vouchers",
        icon: FileSpreadsheet,
        href: "/dashboard/accounts/vouchers",
        permissions: [Permission.VouchersView],
      },
      {
        label: "Bank Accounts",
        icon: Banknote,
        href: "/dashboard/accounts/bank-accounts",
        permissions: [Permission.BankAccountsView],
      },
      {
        label: "Statutory Registers",
        icon: BookOpenText,
        href: "/dashboard/accounts/statutory-registers",
        permissions: [Permission.StatutoryRegistersView],
      },
      {
        label: "Activity Log",
        icon: ScrollText,
        href: "/dashboard/accounts/activity-log",
        permissions: [Permission.ActivityLogView],
      },
    ],
  },
];

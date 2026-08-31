import type { ComponentType } from "react";
import { Boxes, Landmark, Megaphone, Sofa, Ticket, Users, Wrench } from "lucide-react";

export type AdminNavGroupItem = {
  label: string;
  href?: string;
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
      { label: "Flats", href: "/dashboard/people-hub/flats" },
      { label: "History", href: "/dashboard/people-hub/history" },
      { label: "Management Committee" },
      { label: "Service Providers" },
      { label: "Visitors" },
      { label: "Non-Members" },
      { label: "Vendors" },
      { label: "Emergency Contacts" },
      { label: "Key Personnel" },
    ],
  },
  {
    label: "Communication",
    icon: Megaphone,
    items: [
      { label: "Notice Board" },
      { label: "Discussion Forum" },
      { label: "Opinion Polls" },
      { label: "Meetings" },
      { label: "Documents" },
      { label: "Groups" },
      { label: "Group Email/SMS" },
      { label: "Delivery Reports" },
      { label: "Election Polls" },
    ],
  },
  {
    label: "Help Desk",
    icon: Ticket,
    items: [{ label: "Complaints" }, { label: "Helpdesk Settings" }, { label: "Reports" }],
  },
  {
    label: "Amenities",
    icon: Sofa,
    items: [{ label: "Bookings & History" }],
  },
  {
    label: "Maintenance",
    icon: Wrench,
    items: [{ label: "History", href: "/dashboard/maintenance/history" }],
  },
  {
    label: "Asset & Inventory",
    icon: Boxes,
    items: [{ label: "Assets" }, { label: "Asset Category" }, { label: "Inventory" }],
  },
  {
    label: "Accounts",
    icon: Landmark,
    items: [
      { label: "Budget" },
      { label: "Invoicing" },
      { label: "Billing Details" },
      { label: "Dues and Receipts" },
      { label: "Purchasing" },
      { label: "Vouchers" },
      { label: "Bank Accounts" },
      { label: "Chart of Accounts" },
      { label: "Statutory Registers" },
    ],
  },
];

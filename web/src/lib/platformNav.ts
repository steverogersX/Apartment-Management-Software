import { Building2, LayoutDashboard, Settings, Ticket, Wallet } from "lucide-react";

import type { NavItem } from "@/components/sidebar";

export const platformNavItems: NavItem[] = [
  { label: "Overview", href: "/platform", icon: LayoutDashboard },
  { label: "Societies", href: "/platform/societies", icon: Building2 },
  { label: "Complaints", href: "/platform/complaints", icon: Ticket },
];

export const platformSoonItems: NavItem[] = [
  { label: "Billing", icon: Wallet, soon: true },
  { label: "Settings", icon: Settings, soon: true },
];

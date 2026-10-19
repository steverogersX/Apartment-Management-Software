"use client";

import type { ComponentType } from "react";
import { usePathname } from "next/navigation";
import {
  Car,
  Home,
  LayoutDashboard,
  PartyPopper,
  Sofa,
  Ticket,
  UserCheck,
  UserRound,
  Vote,
  Wrench,
} from "lucide-react";

import { adminNavGroups } from "@/lib/adminNav";

const RESIDENT_PAGE_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  "/dashboard": LayoutDashboard,
  "/dashboard/flat": Home,
  "/dashboard/complaints": Ticket,
  "/dashboard/maintenance": Wrench,
  "/dashboard/vehicles": Car,
  "/dashboard/visitors": UserCheck,
  "/dashboard/accounts/events": PartyPopper,
  "/dashboard/amenities": Sofa,
  "/dashboard/profile": UserRound,
  "/dashboard/election-polls": Vote,
};

const PAGE_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  ...RESIDENT_PAGE_ICONS,
};
for (const group of adminNavGroups) {
  for (const item of group.items) {
    if (item.href && item.icon) PAGE_ICONS[item.href] = item.icon;
  }
}

export function PageIcon() {
  const pathname = usePathname();
  const Icon = PAGE_ICONS[pathname];
  if (!Icon) return null;
  return (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
      <Icon className="size-4" />
    </span>
  );
}

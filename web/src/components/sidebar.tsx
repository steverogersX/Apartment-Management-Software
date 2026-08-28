"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  House,
  Receipt,
  Ticket,
  Car,
  UserCheck,
  Users,
  ShieldCheck,
  Sofa,
  Megaphone,
  HandHelping,
  MessagesSquare,
  MessageCircle,
  Siren,
  PanelLeftClose,
  PanelLeftOpen,
  Bird,
} from "lucide-react";

import { Permission, permissionKeyFromName, type PermissionDefinition } from "@shared/index";

import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

type NavItem = {
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  soon?: boolean;
  /** Omit for items everyone with access to this dashboard should see; set to gate via the typed `Permission.*` accessor. */
  permission?: PermissionDefinition;
};

export type { NavItem };

const defaultNavItems: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Flat", href: "/dashboard/flat", icon: House },
  { label: "Bills & Payments", href: "/dashboard/billing", icon: Receipt },
  { label: "Complaints", href: "/dashboard/complaints", icon: Ticket },
  { label: "Vehicles & Parking", href: "/dashboard/vehicles", icon: Car },
  { label: "Visitors", href: "/dashboard/visitors", icon: UserCheck },
  { label: "Amenities", href: "/dashboard/amenities", icon: Sofa },
  { label: "Notices", href: "/dashboard/notices", icon: Megaphone },
  { label: "Users", href: "/dashboard/users", icon: Users, permission: Permission.RolesView },
  { label: "Roles", href: "/dashboard/roles", icon: ShieldCheck },
];

const defaultSoonItems: NavItem[] = [
  { label: "Domestic Staff", icon: HandHelping, soon: true },
  { label: "Forum", icon: MessagesSquare, soon: true },
  { label: "Chat", icon: MessageCircle, soon: true },
  { label: "Safety / SOS", icon: Siren, soon: true },
];

function NavLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const pathname = usePathname();
  const Icon = item.icon;
  const active = !!item.href && pathname === item.href;

  const content = (
    <span
      className={cn(
        "group relative flex h-9 items-center rounded-md text-sm transition-colors",
        collapsed ? "w-9 justify-center" : "w-full gap-3 px-3",
        item.soon
          ? "cursor-default text-muted-foreground/60"
          : active
            ? "bg-muted font-medium text-foreground"
            : "font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground",
      )}
    >
      <Icon className={cn("size-[18px] shrink-0", !item.soon && active ? "text-foreground" : "")} />
      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
      {!collapsed && item.soon && (
        <span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-muted-foreground/70">
          Soon
        </span>
      )}
    </span>
  );

  if (!item.href) {
    return <div title={collapsed ? item.label : undefined}>{content}</div>;
  }

  return (
    <Link href={item.href} title={collapsed ? item.label : undefined}>
      {content}
    </Link>
  );
}

function SectionLabel({ children, collapsed }: { children: React.ReactNode; collapsed: boolean }) {
  if (collapsed) {
    return <div className="mx-auto my-2 h-px w-5 bg-border" />;
  }
  return (
    <div className="px-3 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
      {children}
    </div>
  );
}

export function SidebarContent({
  collapsed = false,
  onToggle,
  navItems = defaultNavItems,
  soonItems = defaultSoonItems,
  menuLabel = "Menu",
  moreLabel = "More",
  brand = "Rooster",
}: {
  collapsed?: boolean;
  onToggle?: () => void;
  navItems?: NavItem[];
  soonItems?: NavItem[];
  menuLabel?: string;
  moreLabel?: string;
  brand?: React.ReactNode;
}) {
  const { has } = useAuth();
  const isVisible = (item: NavItem) => {
    if (!item.permission) return true;
    const key = permissionKeyFromName(item.permission.name);
    return key ? has(key) : false;
  };
  const visibleNavItems = navItems.filter(isVisible);
  const visibleSoonItems = soonItems.filter(isVisible);

  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-border",
          collapsed ? "justify-center px-0" : "gap-2.5 px-4",
        )}
      >
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
          <Bird className="size-4" />
        </div>
        {!collapsed && (
          <span className="text-[15px] font-semibold tracking-tight text-foreground">{brand}</span>
        )}
      </div>

      <nav
        className={cn(
          "flex flex-1 flex-col gap-0.5 overflow-y-auto py-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full",
          collapsed ? "items-center px-2" : "px-3",
        )}
        style={{ scrollbarWidth: "thin" }}
      >
        <SectionLabel collapsed={collapsed}>{menuLabel}</SectionLabel>
        {visibleNavItems.map((item) => (
          <NavLink key={item.label} item={item} collapsed={collapsed} />
        ))}

        {visibleSoonItems.length > 0 && (
          <>
            <div className="pt-3">
              <SectionLabel collapsed={collapsed}>{moreLabel}</SectionLabel>
            </div>
            {visibleSoonItems.map((item) => (
              <NavLink key={item.label} item={item} collapsed={collapsed} />
            ))}
          </>
        )}
      </nav>

      {onToggle && (
        <button
          onClick={onToggle}
          className={cn(
            "flex h-11 shrink-0 items-center border-t border-border text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground",
            collapsed ? "justify-center px-0" : "gap-3 px-4",
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-[18px]" />
          ) : (
            <PanelLeftClose className="size-[18px]" />
          )}
          {!collapsed && "Collapse"}
        </button>
      )}
    </div>
  );
}

export function Sidebar({
  navItems,
  soonItems,
  menuLabel,
  moreLabel,
  brand,
}: {
  navItems?: NavItem[];
  soonItems?: NavItem[];
  menuLabel?: string;
  moreLabel?: string;
  brand?: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <aside
      className={cn(
        "hidden shrink-0 overflow-hidden rounded-xl border border-border bg-sidebar shadow-sm transition-[width] duration-200 ease-in-out md:flex md:flex-col",
        collapsed ? "w-[68px]" : "w-60",
      )}
    >
      <SidebarContent
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        navItems={navItems}
        soonItems={soonItems}
        menuLabel={menuLabel}
        moreLabel={moreLabel}
        brand={brand}
      />
    </aside>
  );
}

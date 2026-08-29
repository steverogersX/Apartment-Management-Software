"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Check,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
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
  Feather,
} from "lucide-react";

import { Permission, permissionKeyFromName, type PermissionDefinition } from "@shared/index";

import { cn, getInitials } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { SocietyLogo } from "@/components/societyLogo";
import { DoodleHouse } from "@/components/icons/doodleHouse";
import { type AdminNavGroup } from "@/lib/adminNav";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

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
  { label: "My Flat", href: "/dashboard/flat", icon: DoodleHouse },
  { label: "Bills & Payments", href: "/dashboard/billing", icon: Receipt },
  { label: "Complaints", href: "/dashboard/complaints", icon: Ticket },
  { label: "Vehicles & Parking", href: "/dashboard/vehicles", icon: Car },
  { label: "Visitors", href: "/dashboard/visitors", icon: UserCheck },
  { label: "Amenities", href: "/dashboard/amenities", icon: Sofa },
  { label: "Notices", href: "/dashboard/notices", icon: Megaphone },
  { label: "Users", href: "/dashboard/users", icon: Users, permission: Permission.RolesView },
  { label: "Roles", href: "/dashboard/roles", icon: ShieldCheck },
];

export const adminNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
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
        "group relative flex h-9 cursor-pointer items-center rounded-md text-sm transition-colors",
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

function NavGroupItem({ group, collapsed }: { group: AdminNavGroup; collapsed: boolean }) {
  const pathname = usePathname();
  const Icon = group.icon;
  const hasActiveChild = group.items.some((item) => !!item.href && pathname === item.href);
  const [open, setOpen] = React.useState(hasActiveChild);

  if (collapsed) {
    return (
      <div
        title={group.label}
        className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground"
      >
        <Icon className="size-[18px]" />
      </div>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger
        className={cn(
          "flex h-9 w-full cursor-pointer items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
          "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
        )}
      >
        <Icon className="size-[18px] shrink-0" />
        <span className="flex-1 truncate text-left">{group.label}</span>
        <ChevronRight
          className={cn(
            "size-3.5 shrink-0 transition-transform duration-200 ease-out",
            open && "rotate-90",
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-col overflow-hidden bg-sidebar py-0.5 pl-[42px] pr-1 transition-[height] duration-200 ease-out h-[var(--collapsible-panel-height)]">
        <div className="relative flex flex-col">
          {group.items.map((item, index) => {
            const isLast = index === group.items.length - 1;
            const active = !!item.href && pathname === item.href;
            return (
              <div key={item.label} className="relative h-8">
                {isLast ? (
                  <div
                    className="absolute -left-3 top-0 h-4 w-3 rounded-bl-md border-b border-l border-border"
                    aria-hidden="true"
                  />
                ) : (
                  <>
                    <div
                      className="absolute -left-3 top-0 h-full w-px bg-border"
                      aria-hidden="true"
                    />
                    <div className="absolute -left-3 top-4 h-px w-3 bg-border" aria-hidden="true" />
                  </>
                )}
                {item.href ? (
                  <Link
                    href={item.href}
                    className={cn(
                      "relative flex h-8 cursor-pointer items-center truncate rounded-md px-2 text-[13px] transition-colors",
                      active
                        ? "font-semibold text-foreground before:absolute before:-left-1 before:top-1/2 before:h-4 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-primary before:content-['']"
                        : "text-muted-foreground/70 hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="flex h-8 cursor-default items-center truncate rounded-md px-2 text-[13px] text-muted-foreground/70">
                    {item.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
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
  groups,
  menuLabel = "Menu",
  moreLabel = "More",
  brand = "Rooster",
}: {
  collapsed?: boolean;
  onToggle?: () => void;
  navItems?: NavItem[];
  soonItems?: NavItem[];
  groups?: AdminNavGroup[];
  menuLabel?: string;
  moreLabel?: string;
  brand?: React.ReactNode;
}) {
  const { has, societies, activeSociety, switchSociety } = useAuth();
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
          "flex h-14 shrink-0 items-center",
          collapsed ? "justify-center px-2" : "px-2",
        )}
      >
        {activeSociety ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  className={cn(
                    "h-9 gap-2 font-semibold",
                    collapsed ? "w-9 justify-center px-0" : "w-full justify-start px-2",
                  )}
                />
              }
            >
              <SocietyLogo
                name={activeSociety.societyName}
                initials={getInitials(activeSociety.societyName)}
                className="size-7 shrink-0 text-xs"
              />
              {!collapsed && (
                <>
                  <span className="min-w-0 flex-1 truncate text-left text-[13px]">
                    {activeSociety.societyName}
                  </span>
                  <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
                </>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align={collapsed ? "center" : "start"} className="w-60">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Your societies</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {societies.map((s) => {
                  const active = s.societyId === activeSociety.societyId;
                  return (
                    <DropdownMenuItem
                      key={s.societyId}
                      className="gap-2.5 py-1.5"
                      onClick={() => switchSociety(s.societyId)}
                    >
                      <SocietyLogo
                        name={s.societyName}
                        initials={getInitials(s.societyName)}
                        className="size-7 text-xs"
                      />
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-medium text-foreground">
                          {s.societyName}
                        </span>
                        <span className="truncate text-[11px] text-muted-foreground">
                          {s.roles.join(", ")}
                        </span>
                      </span>
                      {active && <Check className="ml-auto size-4 shrink-0 text-foreground" />}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <div className="flex size-7 shrink-0 items-center justify-center text-foreground">
              <Feather className="size-5" />
            </div>
            {!collapsed && (
              <span className="text-[15px] font-semibold tracking-tight text-foreground">
                {brand}
              </span>
            )}
          </>
        )}
      </div>

      <nav
        className={cn(
          "flex flex-1 flex-col gap-0.5 overflow-y-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          collapsed ? "items-center px-2" : "px-3",
        )}
      >
        <SectionLabel collapsed={collapsed}>{menuLabel}</SectionLabel>
        {visibleNavItems.map((item) => (
          <NavLink key={item.label} item={item} collapsed={collapsed} />
        ))}
        {groups?.map((group) => (
          <NavGroupItem key={group.label} group={group} collapsed={collapsed} />
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

      <div className="mt-auto p-2">
        {collapsed ? (
          <div className="flex justify-center">
            <button
              onClick={onToggle}
              aria-label="Expand sidebar"
              title="Expand"
              className="group/collapse relative flex size-9 items-center justify-center overflow-hidden rounded-full border bg-card shadow-sm transition-all hover:border-foreground/20 hover:bg-muted"
            >
              <Feather className="absolute size-4 transition-all duration-200 group-hover/collapse:scale-75 group-hover/collapse:opacity-0" />
              <PanelLeftOpen className="absolute size-4 scale-75 opacity-0 transition-all duration-200 group-hover/collapse:scale-100 group-hover/collapse:opacity-100" />
            </button>
          </div>
        ) : (
          <div className="group flex h-10 items-center gap-2 rounded-lg px-1">
            <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-2 py-1.5">
              <div className="flex size-7 shrink-0 items-center justify-center text-foreground">
                <Feather className="size-5" />
              </div>
              <span className="truncate text-[14px] font-semibold tracking-tight text-foreground">
                {brand}
              </span>
            </div>
            {onToggle && (
              <button
                onClick={onToggle}
                aria-label="Collapse sidebar"
                title="Collapse"
                className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-muted hover:text-foreground group-hover:opacity-100 focus-visible:opacity-100"
              >
                <PanelLeftClose className="size-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function Sidebar({
  navItems,
  soonItems,
  groups,
  menuLabel,
  moreLabel,
  brand,
}: {
  navItems?: NavItem[];
  soonItems?: NavItem[];
  groups?: AdminNavGroup[];
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
        groups={groups}
        menuLabel={menuLabel}
        moreLabel={moreLabel}
        brand={brand}
      />
    </aside>
  );
}

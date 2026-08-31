"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const SECTION_ROOTS: Record<string, { href: string; label: string }> = {
  dashboard: { href: "/dashboard", label: "Overview" },
  platform: { href: "/platform", label: "Overview" },
};

const ROUTE_LABELS: Record<string, string> = {
  "/dashboard/amenities": "Amenities",
  "/dashboard/billing": "Bills & Payments",
  "/dashboard/complaints": "Complaints",
  "/dashboard/flat": "My Flat",
  "/dashboard/notices": "Notices",
  "/dashboard/profile": "Profile",
  "/dashboard/roles": "Roles",
  "/dashboard/roles/new": "New role",
  "/dashboard/users": "Users",
  "/dashboard/users/new": "Add user",
  "/dashboard/vehicles": "Vehicles & Parking",
  "/dashboard/visitors": "Visitors",
  "/platform/complaints": "Complaints",
  "/platform/societies": "Societies",
  "/platform/societies/new": "New society",
};

const DYNAMIC_SEGMENT_FALLBACKS: Record<string, string> = {
  roles: "Role",
  societies: "Society",
};

/** Group segments that have no page of their own (only child routes) — render as plain text, not a link. */
const NON_NAVIGABLE_PATHS = new Set<string>(["/dashboard/people-hub"]);

function humanize(segment: string) {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function resolveLabel(
  path: string,
  segment: string,
  parentSegment: string,
  override: string | null,
) {
  if (override) return override;
  if (ROUTE_LABELS[path]) return ROUTE_LABELS[path];
  if (DYNAMIC_SEGMENT_FALLBACKS[parentSegment]) return DYNAMIC_SEGMENT_FALLBACKS[parentSegment];
  return humanize(segment);
}

type BreadcrumbOverride = { path: string; title: string } | null;

type BreadcrumbTitleContextValue = {
  override: BreadcrumbOverride;
  setOverride: (override: BreadcrumbOverride) => void;
};

const BreadcrumbTitleContext = React.createContext<BreadcrumbTitleContextValue | null>(null);

export function BreadcrumbTitleProvider({ children }: { children: React.ReactNode }) {
  const [override, setOverride] = React.useState<BreadcrumbOverride>(null);
  const value = React.useMemo(() => ({ override, setOverride }), [override]);
  return (
    <BreadcrumbTitleContext.Provider value={value}>{children}</BreadcrumbTitleContext.Provider>
  );
}

/** Lets a leaf page (e.g. a `[id]` route) override the last breadcrumb segment's label once real data loads. */
export function useBreadcrumbTitle(title: string | null | undefined) {
  const setOverride = React.useContext(BreadcrumbTitleContext)?.setOverride;
  const pathname = usePathname();

  React.useEffect(() => {
    if (!setOverride) return;
    if (!title) return;
    setOverride({ path: pathname, title });
    return () => setOverride(null);
  }, [setOverride, pathname, title]);
}

/** Client-component shim so server-component pages can set a dynamic breadcrumb title. */
export function SetBreadcrumbTitle({ title }: { title: string | null | undefined }) {
  useBreadcrumbTitle(title);
  return null;
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const ctx = React.useContext(BreadcrumbTitleContext);
  const overrideTitle = ctx?.override?.path === pathname ? ctx.override.title : null;

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  const sectionKey = segments[0];
  const section = SECTION_ROOTS[sectionKey] ?? {
    href: `/${sectionKey}`,
    label: humanize(sectionKey),
  };
  const rest = segments.slice(1);

  const crumbs: { href: string; label: string }[] = [];
  let cumulative = section.href;
  rest.forEach((segment, index) => {
    const parentSegment = index === 0 ? sectionKey : rest[index - 1];
    cumulative += `/${segment}`;
    const isLast = index === rest.length - 1;
    crumbs.push({
      href: cumulative,
      label: resolveLabel(cumulative, segment, parentSegment, isLast ? overrideTitle : null),
    });
  });

  return (
    <Breadcrumb>
      <BreadcrumbList className="items-center gap-1">
        <BreadcrumbItem>
          {crumbs.length === 0 ? (
            <BreadcrumbPage className="inline-flex h-7 items-center gap-1.5 rounded-md py-1.5 pl-0 pr-1.5 text-[15px] font-semibold text-foreground">
              <Home className="size-4 shrink-0 text-muted-foreground" />
              <span>{section.label}</span>
            </BreadcrumbPage>
          ) : (
            <BreadcrumbLink
              render={<Link href={section.href} />}
              className="inline-flex h-7 items-center gap-1.5 rounded-md py-1.5 pl-0 pr-1.5 text-[15px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Home className="size-4 shrink-0" />
              <span>{section.label}</span>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          const navigable = !NON_NAVIGABLE_PATHS.has(crumb.href);
          return (
            <React.Fragment key={crumb.href}>
              <BreadcrumbSeparator className="flex h-7 items-center [&>svg]:size-3.5 [&>svg]:text-muted-foreground/40" />
              <BreadcrumbItem>
                {isLast || !navigable ? (
                  <BreadcrumbPage
                    className={cn(
                      "inline-flex h-7 items-center rounded-md px-1.5 text-[15px]",
                      isLast
                        ? "font-semibold text-foreground"
                        : "cursor-default text-muted-foreground",
                    )}
                  >
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    render={<Link href={crumb.href} />}
                    className="inline-flex h-7 items-center rounded-md px-1.5 text-[15px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {crumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

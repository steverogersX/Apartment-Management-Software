"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Sidebar, adminNavItems } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { Breadcrumbs, BreadcrumbTitleProvider } from "@/components/breadcrumbs";
import { useAuth } from "@/hooks/useAuth";
import { adminNavGroups } from "@/lib/adminNav";

export default function ResidentLayout({ children }: { children: React.ReactNode }) {
  const { status, user, has } = useAuth();
  const router = useRouter();
  const isSocietyAdmin = has("SocietySettingsUpdate");

  React.useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    else if (status === "authenticated" && user?.isSuperAdmin) router.replace("/platform");
  }, [status, user, router]);

  if (status !== "authenticated" || user?.isSuperAdmin) return null;

  return (
    <div className="flex h-screen w-full gap-2 overflow-hidden bg-muted/40 p-2">
      <Sidebar
        navItems={isSocietyAdmin ? adminNavItems : undefined}
        groups={isSocietyAdmin ? adminNavGroups : undefined}
        soonItems={isSocietyAdmin ? [] : undefined}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm">
        <BreadcrumbTitleProvider>
          <Topbar />
          <div className="flex h-8 shrink-0 items-center px-4 md:px-6">
            <div className="mx-auto w-full max-w-6xl">
              <Breadcrumbs />
            </div>
          </div>
          <main className="flex-1 overflow-y-auto p-4 pt-3 md:p-6 md:pt-4">{children}</main>
        </BreadcrumbTitleProvider>
      </div>
    </div>
  );
}

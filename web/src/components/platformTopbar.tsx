"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { SidebarContent } from "@/components/sidebar";
import { ModeToggle } from "@/components/modeToggle";
import { AccountMenu } from "@/components/accountMenu";
import { platformNavItems, platformSoonItems } from "@/lib/platformNav";
import { useAuth } from "@/hooks/useAuth";

export function PlatformTopbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();
  const displayName = user?.displayName ?? user?.email ?? "Platform admin";

  const handleSignOut = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-2.5">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-4" />
          </Button>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SidebarContent navItems={platformNavItems} soonItems={platformSoonItems} />
          </SheetContent>
        </Sheet>

        <span className="rounded border border-border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Platform
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <ModeToggle />

        <AccountMenu
          name={displayName}
          email={user?.email}
          badges={["Super admin"]}
          onSignOut={handleSignOut}
        />
      </div>
    </header>
  );
}

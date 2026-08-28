"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, ChevronDown, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { SidebarContent } from "@/components/sidebar";
import { SocietyLogo } from "@/components/societyLogo";
import { ModeToggle } from "@/components/modeToggle";
import { AccountMenu } from "@/components/accountMenu";
import { getInitials } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export function Topbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const router = useRouter();
  const { user, societies, activeSociety, roles, switchSociety, logout } = useAuth();

  const displayName = user?.displayName ?? user?.email ?? "Account";

  const handleSignOut = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-2">
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
            <SidebarContent />
          </SheetContent>
        </Sheet>

        {activeSociety && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="sm" className="h-9 gap-2 pl-1.5 font-semibold" />
              }
            >
              <SocietyLogo
                name={activeSociety.societyName}
                initials={getInitials(activeSociety.societyName)}
                className="size-6 text-[11px]"
              />
              {activeSociety.societyName}
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-60">
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
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <ModeToggle />

        <Button variant="ghost" size="icon-sm" className="relative">
          <Bell className="size-4" />
          <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-red-500" />
        </Button>

        <AccountMenu
          name={displayName}
          email={user?.email}
          badges={roles.length ? roles : ["No role in this society"]}
          profileHref="/dashboard/profile"
          onSignOut={handleSignOut}
        />
      </div>
    </header>
  );
}

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Menu, ShieldCheck } from "lucide-react";

import { DoodleHouse } from "@/components/icons/doodleHouse";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { SidebarContent, adminNavItems } from "@/components/sidebar";
import { ModeToggle } from "@/components/modeToggle";
import { AccountMenu } from "@/components/accountMenu";
import { NotificationsMenu } from "@/components/notificationsMenu";
import { mockActiveSocietyName, mockFlats, mockRoles } from "@/lib/accountMockData";
import { adminNavGroups } from "@/lib/adminNav";
import { useAuth } from "@/hooks/useAuth";
import { useFlats } from "@/hooks/useFlats";

export function Topbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const router = useRouter();
  const { user, activeSociety, roles, logout, has } = useAuth();
  const isSocietyAdmin = has("SocietySettingsUpdate");

  const displayName = user?.displayName ?? user?.email ?? "Account";

  const handleSignOut = async () => {
    await logout();
    router.replace("/login");
  };

  const isMockRolePreview = user?.email === "admin@sunriseheights.com" && roles.length <= 1;
  const displayRoles = isMockRolePreview ? mockRoles : roles;
  const displaySocietyName =
    activeSociety?.societyName ?? (isMockRolePreview ? mockActiveSocietyName : null);
  const [activeRole, setActiveRole] = React.useState<string | null>(displayRoles[0] ?? null);
  React.useEffect(() => {
    if (displayRoles.length && !displayRoles.includes(activeRole ?? "")) {
      setActiveRole(displayRoles[0] ?? null);
    }
  }, [displayRoles, activeRole]);

  const { flats, activeId: activeFlatId, activeFlat, switchFlat } = useFlats();
  const displayFlats = isMockRolePreview ? mockFlats : flats;
  const displayActiveFlat = isMockRolePreview
    ? (mockFlats.find((f) => f.id === activeFlatId) ?? mockFlats[0] ?? null)
    : activeFlat;

  // Role and flat are mutually exclusive contexts — switching one clears the other,
  // so the topbar pill shows either the society role or the flat's occupancy, never both.
  const [activeContext, setActiveContext] = React.useState<"role" | "flat">("role");
  const handleSwitchRole = (role: string) => {
    setActiveRole(role);
    setActiveContext("role");
  };
  const handleSwitchFlat = (id: string) => {
    switchFlat(id);
    setActiveContext("flat");
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between bg-background px-4">
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
            <SidebarContent
              navItems={isSocietyAdmin ? adminNavItems : undefined}
              groups={isSocietyAdmin ? adminNavGroups : undefined}
              soonItems={isSocietyAdmin ? [] : undefined}
            />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex items-center gap-1.5">
        {activeContext === "flat" && displayActiveFlat ? (
          <div className="hidden sm:flex items-center overflow-hidden rounded-full border bg-card text-xs shadow-sm">
            <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 font-medium">
              <span className="flex size-5 items-center justify-center rounded-full bg-foreground text-background">
                <ShieldCheck className="size-3" />
              </span>
              <span className="max-w-28 truncate">{displayActiveFlat.ownership}</span>
            </span>
            <span className="h-4 w-px shrink-0 bg-border" aria-hidden />
            <span className="flex items-center gap-1.5 px-3 py-1.5 font-medium text-muted-foreground">
              <DoodleHouse className="size-3.5 shrink-0" />
              <span className="truncate">
                {displayActiveFlat.label}
                <span className="mx-1 text-muted-foreground/50">·</span>
                {displayActiveFlat.flatNumber}
              </span>
              <span className="hidden truncate text-muted-foreground/70 lg:inline">
                · {displayActiveFlat.tower}
              </span>
            </span>
            <span
              className="mr-2 hidden size-1.5 shrink-0 rounded-full bg-emerald-500 lg:block"
              aria-hidden
            />
          </div>
        ) : (
          activeRole && (
            <div className="hidden sm:flex items-center overflow-hidden rounded-full border bg-card text-xs shadow-sm">
              <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 font-medium">
                <span className="flex size-5 items-center justify-center rounded-full bg-foreground text-background">
                  <ShieldCheck className="size-3" />
                </span>
                <span className="max-w-28 truncate">{activeRole}</span>
              </span>
            </div>
          )
        )}

        <ModeToggle />

        <NotificationsMenu />

        <AccountMenu
          name={displayName}
          email={user?.email}
          roles={displayRoles}
          societyName={displaySocietyName}
          activeRole={activeRole}
          onSwitchRole={handleSwitchRole}
          flats={displayFlats}
          activeFlatId={activeFlatId}
          onSwitchFlat={handleSwitchFlat}
          activeContext={activeContext}
          badges={displayRoles.length ? displayRoles : ["No role in this society"]}
          profileHref="/dashboard/profile"
          onSignOut={handleSignOut}
        />
      </div>
    </header>
  );
}

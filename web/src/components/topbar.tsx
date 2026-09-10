"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Menu, ShieldCheck } from "lucide-react";

import { DoodleHouse } from "@/components/icons/doodleHouse";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { SidebarContent } from "@/components/sidebar";
import { ModeToggle } from "@/components/modeToggle";
import { AccountMenu } from "@/components/accountMenu";
import { NotificationsMenu } from "@/components/notificationsMenu";
import { TopLoadingBar } from "@/components/topLoadingBar";
import { mockActiveSocietyName, mockFlats, mockRoles } from "@/lib/accountMockData";
import { adminNavGroups } from "@/lib/adminNav";
import { roles as previewableRoles } from "@/lib/rolesMockData";
import { useAuth } from "@/hooks/useAuth";
import { useFlats } from "@/hooks/useFlats";

const PREVIEWABLE_ROLE_NAMES = previewableRoles.map((r) => r.name);

export function Topbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const router = useRouter();
  const {
    user,
    activeSociety,
    roles,
    logout,
    previewRole,
    setPreviewRole,
    isSwitchingPreview,
    isSwitchingSociety,
  } = useAuth();
  const displayName = user?.displayName ?? user?.email ?? "Account";

  const handleSignOut = async () => {
    await logout();
    router.replace("/login");
  };

  const isMockRolePreview = user?.email === "admin@sunriseheights.com" && roles.length <= 1;
  const displayRoles = isMockRolePreview ? mockRoles : roles;
  const realRole = roles[0] ?? null;
  // What the UI is actually gated on right now: the preview override when one is active, else the real role.
  const activeRole = previewRole ?? realRole;
  const displaySocietyName =
    activeSociety?.societyName ?? (isMockRolePreview ? mockActiveSocietyName : null);

  const { flats, activeId: activeFlatId, activeFlat, switchFlat, isSwitchingFlat } = useFlats();
  const displayFlats = isMockRolePreview ? mockFlats : flats;
  const displayActiveFlat = isMockRolePreview
    ? (mockFlats.find((f) => f.id === activeFlatId) ?? mockFlats[0] ?? null)
    : activeFlat;

  const handleSwitchRole = (role: string) => {
    if (role === activeRole) return;
    // Selecting your own real role exits preview mode; anything else previews that role's permissions.
    setPreviewRole(role === realRole ? null : role);
  };
  const handleSwitchFlat = (id: string) => {
    switchFlat(id);
  };
  const isSwitching = isSwitchingPreview || isSwitchingFlat || isSwitchingSociety;

  return (
    <header className="relative flex h-14 shrink-0 items-center justify-between bg-background px-4">
      <TopLoadingBar active={isSwitching} />
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
            <SidebarContent groups={adminNavGroups} />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex items-center gap-1.5">
        {isSwitching ? (
          <div className="hidden sm:flex items-center gap-1.5 overflow-hidden rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
            <Loader2 className="size-3.5 animate-spin" />
            Switching…
          </div>
        ) : (
          activeRole && (
            <div className="hidden items-center overflow-hidden rounded-full border bg-card text-xs shadow-sm sm:flex">
              <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 font-medium">
                <span className="flex size-5 items-center justify-center rounded-full bg-foreground text-background">
                  <ShieldCheck className="size-3" />
                </span>
                <span className="max-w-28 truncate">{activeRole}</span>
              </span>
              {displayActiveFlat && (
                <>
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
                </>
              )}
            </div>
          )
        )}

        <ModeToggle />

        <NotificationsMenu />

        <AccountMenu
          name={displayName}
          email={user?.email}
          roles={PREVIEWABLE_ROLE_NAMES}
          yourRoles={displayRoles}
          societyName={displaySocietyName}
          activeRole={activeRole}
          onSwitchRole={handleSwitchRole}
          flats={displayFlats}
          activeFlatId={activeFlatId}
          onSwitchFlat={handleSwitchFlat}
          isSwitching={isSwitching}
          badges={displayRoles.length ? displayRoles : ["No role in this society"]}
          profileHref="/dashboard/profile"
          onSignOut={handleSignOut}
        />
      </div>
    </header>
  );
}

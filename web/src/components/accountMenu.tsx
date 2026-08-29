"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronsUpDown, LogOut, ShieldCheck, UserCog } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DoodleHouse } from "@/components/icons/doodleHouse";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  mockAccountUser,
  mockActiveSocietyName,
  mockFlats,
  mockPermissions,
  mockRoles,
  roleMeta,
  type MockFlat,
} from "@/lib/accountMockData";
import { cn, getInitials, gradientForName } from "@/lib/utils";

type AccountMenuProps = {
  name: string;
  email?: string | null;
  badges?: string[];
  /** Roles in the current society — when provided this drives the multi-role UI. */
  roles?: string[];
  /** Society name for the header label, e.g. "Sunrise Heights". */
  societyName?: string | null;
  /** Optional controlled active role + switch handler for context switching. */
  activeRole?: string | null;
  onSwitchRole?: (role: string) => void;
  flats?: MockFlat[];
  activeFlatId?: string | null;
  onSwitchFlat?: (flatId: string) => void;
  /** Role and flat are mutually exclusive contexts — only the one matching this shows as active. */
  activeContext?: "role" | "flat";
  profileHref?: string;
  onSignOut: () => void;
};

export function AccountMenu({
  name,
  email,
  badges = [],
  roles,
  societyName,
  activeRole: controlledActiveRole,
  onSwitchRole,
  flats,
  activeFlatId,
  onSwitchFlat,
  activeContext = "role",
  profileHref,
  onSignOut,
}: AccountMenuProps) {
  const [from, to] = gradientForName(name);
  const effectiveRoles = roles ?? badges;
  const hasRoles = effectiveRoles.length > 0;
  const hasMultipleRoles = effectiveRoles.length > 1;

  const [uncontrolledActive, setUncontrolledActive] = React.useState(
    () => effectiveRoles[0] ?? null,
  );
  React.useEffect(() => {
    if (
      !controlledActiveRole &&
      effectiveRoles.length &&
      !effectiveRoles.includes(uncontrolledActive ?? "")
    ) {
      setUncontrolledActive(effectiveRoles[0] ?? null);
    }
  }, [effectiveRoles, uncontrolledActive, controlledActiveRole]);

  const activeRole = controlledActiveRole ?? uncontrolledActive;

  const handleSwitch = (role: string) => {
    if (onSwitchRole) onSwitchRole(role);
    else setUncontrolledActive(role);
  };

  const hasFlats = (flats?.length ?? 0) > 0;
  const activeFlat = flats?.find((f) => f.id === activeFlatId) ?? flats?.[0] ?? null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<button className="flex items-center gap-1.5 rounded-full pr-1 pl-0.5" />}
      >
        <Avatar className="size-7">
          <AvatarImage
            src={`https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(email ?? name)}`}
            alt={name}
          />
          <AvatarFallback
            className="font-semibold text-white"
            style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
          >
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        <ChevronsUpDown className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center gap-3 p-3">
          <Avatar size="lg">
            <AvatarImage
              src={`https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(email ?? name)}`}
              alt={name}
            />
            <AvatarFallback
              className="text-base font-semibold text-white"
              style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
            >
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-sm font-semibold text-foreground">{name}</span>
            {email && <span className="truncate text-xs text-muted-foreground">{email}</span>}
            {societyName && hasRoles ? (
              <span className="truncate pt-1 text-[11px] text-muted-foreground">
                {societyName} · {effectiveRoles.length}{" "}
                {effectiveRoles.length === 1 ? "role" : "roles"}
              </span>
            ) : hasRoles ? (
              <div className="flex flex-wrap gap-1 pt-1">
                {effectiveRoles.slice(0, 3).map((b) => (
                  <Badge key={b} variant="secondary" className="text-[10px]">
                    {b}
                  </Badge>
                ))}
                {effectiveRoles.length > 3 && (
                  <Badge variant="secondary" className="text-[10px]">
                    +{effectiveRoles.length - 3}
                  </Badge>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {hasRoles && (
          <>
            <DropdownMenuSeparator className="mx-0" />
            <DropdownMenuGroup className="p-1.5">
              <DropdownMenuLabel className="flex items-center gap-1.5 px-1.5 py-1">
                <ShieldCheck className="size-3.5 text-muted-foreground" />
                {hasMultipleRoles ? "Switch role" : "Your role"}
                <Badge variant="outline" className="ml-auto text-[10px] font-normal">
                  {effectiveRoles.length}
                </Badge>
              </DropdownMenuLabel>
              {hasMultipleRoles ? (
                <p className="px-1.5 pb-1 text-[11px] leading-snug text-muted-foreground">
                  Switch context. Permissions are the union of all your roles.
                </p>
              ) : (
                <p className="px-1.5 pb-1 text-[11px] leading-snug text-muted-foreground">
                  Permissions come from this role. Contact an admin to add more.
                </p>
              )}
              <div className="flex max-h-56 flex-col gap-0.5 overflow-y-auto pr-0.5">
                {effectiveRoles.map((role) => {
                  const meta = roleMeta[role];
                  const isActive = activeContext === "role" && role === activeRole;
                  return (
                    <DropdownMenuItem
                      key={role}
                      className={cn("gap-2.5 py-1.5", isActive && "bg-muted/70")}
                      onClick={() => handleSwitch(role)}
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <ShieldCheck className="size-3.5" />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col text-left">
                        <span className="truncate text-sm font-medium text-foreground">
                          {meta?.label ?? role}
                        </span>
                        <span className="truncate text-[11px] text-muted-foreground">
                          {meta?.description ?? "Custom role"}
                        </span>
                      </span>
                      {!isActive &&
                        (hasMultipleRoles ? (
                          <span className="ml-auto shrink-0 rounded border border-border px-1 py-0.5 text-[10px] text-muted-foreground">
                            Switch
                          </span>
                        ) : (
                          <span
                            className="size-2 shrink-0 rounded-full bg-emerald-500"
                            aria-hidden
                          />
                        ))}
                    </DropdownMenuItem>
                  );
                })}
              </div>
            </DropdownMenuGroup>
          </>
        )}

        {hasFlats && (
          <>
            <DropdownMenuSeparator className="mx-0" />
            <DropdownMenuGroup className="p-1.5">
              <DropdownMenuLabel className="flex items-center gap-1.5 px-1.5 py-1">
                <DoodleHouse className="size-3.5 text-muted-foreground" />
                Switch flat
                <Badge variant="outline" className="ml-auto text-[10px] font-normal">
                  {flats!.length}
                </Badge>
              </DropdownMenuLabel>
              <p className="px-1.5 pb-1 text-[11px] leading-snug text-muted-foreground">
                Billing, visitors and complaints scope to the selected flat.
              </p>
              <div className="flex flex-col gap-0.5">
                {flats!.map((flat) => {
                  const isActive = activeContext === "flat" && flat.id === activeFlat?.id;
                  return (
                    <DropdownMenuItem
                      key={flat.id}
                      className={cn("gap-2.5 py-1.5", isActive && "bg-muted/70")}
                      onClick={() => onSwitchFlat?.(flat.id)}
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted font-medium text-[11px] text-muted-foreground">
                        {flat.label.slice(-1)}
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col text-left">
                        <span className="truncate text-sm font-medium text-foreground">
                          {flat.label} · {flat.flatNumber}
                        </span>
                        <span className="truncate text-[11px] text-muted-foreground">
                          {flat.tower} · {flat.type} · {flat.ownership} · {flat.societyName}
                        </span>
                      </span>
                      {!isActive && (
                        <span className="ml-auto shrink-0 rounded border border-border px-1 py-0.5 text-[10px] text-muted-foreground">
                          Switch
                        </span>
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </div>
            </DropdownMenuGroup>
          </>
        )}

        <DropdownMenuSeparator className="mx-0" />

        <DropdownMenuGroup className="p-1.5">
          <DropdownMenuItem
            className="gap-2 py-1.5"
            render={profileHref ? <Link href={profileHref} /> : undefined}
          >
            <UserCog className="size-4 text-muted-foreground" />
            Profile settings
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="mx-0" />

        <DropdownMenuGroup className="p-1.5">
          <DropdownMenuItem
            variant="destructive"
            className={cn("gap-2 py-1.5")}
            onClick={onSignOut}
          >
            <LogOut className="size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Standalone mock preview — no auth needed, demonstrates role + flat switching. */
export function AccountMenuMockPreview({
  onSignOut,
  onSwitchRole,
  onSwitchFlat,
}: {
  onSignOut?: () => void;
  onSwitchRole?: (role: string) => void;
  onSwitchFlat?: (flatId: string) => void;
}) {
  const [activeRole, setActiveRole] = React.useState(mockRoles[0] ?? null);
  const [activeFlatId, setActiveFlatId] = React.useState(mockFlats[0]?.id ?? null);
  const handleSwitch = (role: string) => {
    setActiveRole(role);
    onSwitchRole?.(role);
  };
  const handleFlatSwitch = (id: string) => {
    setActiveFlatId(id);
    onSwitchFlat?.(id);
  };
  void mockPermissions;
  return (
    <AccountMenu
      name={mockAccountUser.displayName}
      email={mockAccountUser.email}
      roles={mockRoles}
      societyName={mockActiveSocietyName}
      activeRole={activeRole}
      onSwitchRole={handleSwitch}
      flats={mockFlats}
      activeFlatId={activeFlatId}
      onSwitchFlat={handleFlatSwitch}
      onSignOut={onSignOut ?? (() => {})}
      profileHref="/dashboard/profile"
    />
  );
}

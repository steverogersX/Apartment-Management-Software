"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronsUpDown, LogOut, UserCog } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, getInitials, gradientForName } from "@/lib/utils";

export function AccountMenu({
  name,
  email,
  badges = [],
  profileHref,
  onSignOut,
}: {
  name: string;
  email?: string | null;
  badges?: string[];
  profileHref?: string;
  onSignOut: () => void;
}) {
  const [from, to] = gradientForName(name);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<button className="flex items-center gap-1.5 rounded-full pr-1 pl-0.5" />}
      >
        <Avatar className="size-7">
          <AvatarFallback
            className="font-semibold text-white"
            style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
          >
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        <ChevronsUpDown className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 p-0">
        <div className="flex items-center gap-3 p-3">
          <Avatar size="lg">
            <AvatarFallback
              className="text-base font-semibold text-white"
              style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
            >
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col gap-1">
            <span className="truncate text-sm font-semibold text-foreground">{name}</span>
            {email && <span className="truncate text-xs text-muted-foreground">{email}</span>}
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-0.5">
                {badges.map((b) => (
                  <Badge key={b} variant="secondary" className="text-[10px]">
                    {b}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

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

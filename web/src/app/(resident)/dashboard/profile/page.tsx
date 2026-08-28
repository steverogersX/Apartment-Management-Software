"use client";

import * as React from "react";
import {
  Building2,
  Check,
  Home,
  KeyRound,
  Laptop,
  Layers,
  Ruler,
  ShieldCheck,
  Smartphone,
  User,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SocietyLogo } from "@/components/societyLogo";
import { useAuth } from "@/hooks/useAuth";
import { useNow } from "@/hooks/useNow";
import { getInitials, gradientForName } from "@/lib/utils";
import { currentFlat } from "@/lib/mockData";
import { sessions as initialSessions } from "@/lib/sessionsMockData";

const flatFields: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { label: "Flat number", value: currentFlat.flatNumber, icon: Home },
  { label: "Tower", value: currentFlat.apartmentName, icon: Building2 },
  { label: "Floor", value: String(currentFlat.floor), icon: Layers },
  { label: "Type", value: currentFlat.type, icon: Ruler },
  { label: "Area", value: `${currentFlat.areaSqft} sq ft`, icon: Ruler },
  { label: "Owner", value: currentFlat.ownerName, icon: User },
  { label: "Tenant", value: currentFlat.tenantName ?? "—", icon: Users },
];

function relativeTime(iso: string, now: number) {
  const diffMs = now - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function ProfilePage() {
  const { user, societies, activeSocietyId, switchSociety } = useAuth();
  const now = useNow();

  const name = user?.displayName ?? user?.email ?? "Account";
  const [from, to] = gradientForName(name);

  const [displayName, setDisplayName] = React.useState(user?.displayName ?? "");
  const [email, setEmail] = React.useState(user?.email ?? "");
  const [phone, setPhone] = React.useState("");
  const [savingDetails, setSavingDetails] = React.useState(false);

  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [passwordError, setPasswordError] = React.useState<string | undefined>();
  const [savingPassword, setSavingPassword] = React.useState(false);

  const [sessionList, setSessionList] = React.useState(initialSessions);

  async function handleSaveDetails(e: React.FormEvent) {
    e.preventDefault();
    setSavingDetails(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setSavingDetails(false);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    setPasswordError(undefined);
    setSavingPassword(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setSavingPassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  function revokeSession(id: string) {
    setSessionList((rows) => rows.filter((s) => s.id !== id));
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Your account, security, and the roles you hold.
        </p>
      </div>

      <Card>
        <CardContent className="flex items-center gap-4 pt-6">
          <Avatar size="lg">
            <AvatarFallback
              className="text-base font-semibold text-white"
              style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
            >
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col gap-1">
            <span className="truncate text-base font-semibold text-foreground">{name}</span>
            {user?.email && (
              <span className="truncate text-sm text-muted-foreground">{user.email}</span>
            )}
            {user?.isSuperAdmin && (
              <Badge variant="secondary" className="mt-0.5 w-fit text-[10px]">
                Super admin
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal details</CardTitle>
          <CardDescription>Update your name, email address, and mobile number.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveDetails} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="profile-name">Full name</Label>
                <Input
                  id="profile-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="profile-email">Email address</Label>
                <Input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="profile-phone">Mobile number</Label>
                <Input
                  id="profile-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
            <div className="flex justify-end border-t border-border pt-4">
              <Button type="submit" size="sm" disabled={savingDetails} className="gap-1.5">
                {savingDetails ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>Flat details</CardTitle>
              <CardDescription>Ownership and unit records on file.</CardDescription>
            </div>
            <Badge variant="outline" className="shrink-0 gap-1 text-[10px] text-muted-foreground">
              <KeyRound className="size-3" />
              Read-only
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {flatFields.map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-3 rounded-lg border border-border p-3"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <f.icon className="size-4" />
                </span>
                <div className="flex min-w-0 flex-col">
                  <span className="text-xs text-muted-foreground">{f.label}</span>
                  <span className="truncate text-sm font-medium text-foreground">{f.value}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Managed by your society admin — contact them to request a change.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>Use a strong password you don&apos;t use elsewhere.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="current-password">Current password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordError(undefined);
                  }}
                  aria-invalid={!!passwordError}
                  autoComplete="new-password"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirm-password">Confirm new password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordError(undefined);
                  }}
                  aria-invalid={!!passwordError}
                  autoComplete="new-password"
                />
              </div>
            </div>
            {passwordError && <p className="text-xs text-destructive">{passwordError}</p>}
            <div className="flex justify-end border-t border-border pt-4">
              <Button
                type="submit"
                size="sm"
                variant="outline"
                disabled={savingPassword}
                className="gap-1.5"
              >
                <KeyRound className="size-3.5" />
                {savingPassword ? "Updating…" : "Update password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active sessions</CardTitle>
          <CardDescription>Devices currently signed in to your account.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {sessionList.map((session) => {
            const Icon = session.device.toLowerCase().includes("iphone") ? Smartphone : Laptop;
            return (
              <div
                key={session.id}
                className="flex items-center gap-3 rounded-lg border border-border p-3"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Icon className="size-4" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                      {session.device}
                    </span>
                    {session.current && (
                      <Badge variant="secondary" className="text-[10px]">
                        This device
                      </Badge>
                    )}
                  </div>
                  <span className="truncate text-xs text-muted-foreground">
                    {session.location} · {session.ipAddress} ·{" "}
                    {now ? relativeTime(session.lastActiveAt, now) : "—"}
                  </span>
                </div>
                {!session.current && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => revokeSession(session.id)}
                  >
                    Revoke
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your societies & roles</CardTitle>
          <CardDescription>
            You can hold different roles in each society. Switch to manage another society.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {societies.length === 0 && (
            <p className="text-sm text-muted-foreground">You are not part of any society yet.</p>
          )}
          {societies.map((s) => {
            const active = s.societyId === activeSocietyId;
            return (
              <div
                key={s.societyId}
                className="flex items-center gap-3 rounded-lg border border-border p-3"
              >
                <SocietyLogo
                  name={s.societyName}
                  initials={getInitials(s.societyName)}
                  className="size-9 shrink-0 text-sm"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                      {s.societyName}
                    </span>
                    {active && (
                      <Badge variant="secondary" className="gap-1 text-[10px]">
                        <Check className="size-3" />
                        Active
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {s.roles.length > 0 ? (
                      s.roles.map((role) => (
                        <Badge key={role} variant="outline" className="gap-1 text-[10px]">
                          <ShieldCheck className="size-3 text-muted-foreground" />
                          {role}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">No role in this society</span>
                    )}
                  </div>
                </div>
                {!active && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => switchSociety(s.societyId)}
                  >
                    Switch
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

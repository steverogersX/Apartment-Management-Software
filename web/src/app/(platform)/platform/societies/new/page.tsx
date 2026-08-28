"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, ImagePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SocietyLogo } from "@/components/societyLogo";
import { getInitials } from "@/lib/utils";

export default function CreateSocietyPage() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [areaSqft, setAreaSqft] = React.useState("");
  const [adminName, setAdminName] = React.useState("");
  const [adminEmail, setAdminEmail] = React.useState("");
  const [adminPhone, setAdminPhone] = React.useState("");
  const [adminPassword, setAdminPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 w-fit gap-1.5 text-muted-foreground"
        onClick={() => router.push("/platform/societies")}
      >
        <ArrowLeft className="size-3.5" />
        Societies
      </Button>

      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Create a society</h1>
        <p className="text-sm text-muted-foreground">
          Set up the society profile and assign its admin.
        </p>
      </div>

      <div className="rounded-md border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground">Society details</h2>
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <SocietyLogo
              name={name || "New Society"}
              initials={getInitials(name || "New Society")}
              className="size-14 text-lg"
            />
            <Button variant="outline" size="sm" type="button" className="gap-1.5">
              <ImagePlus className="size-3.5" />
              Upload logo
            </Button>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="society-name">Society name</Label>
            <Input
              id="society-name"
              placeholder="e.g. Green Valley Apartments"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="society-address">Address</Label>
            <Input
              id="society-address"
              placeholder="Plot / street, area, city"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="society-area">Built-up area (sqft)</Label>
            <Input
              id="society-area"
              type="number"
              placeholder="e.g. 65000"
              value={areaSqft}
              onChange={(e) => setAreaSqft(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="rounded-md border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground">Society admin</h2>
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="admin-name">Full name</Label>
            <Input
              id="admin-name"
              placeholder="e.g. Padma Konkonapala"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="admin-email">Email</Label>
            <Input
              id="admin-email"
              type="email"
              placeholder="admin@society.com"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="admin-phone">Phone number</Label>
            <Input
              id="admin-phone"
              type="tel"
              placeholder="+91 90000 00000"
              value={adminPhone}
              onChange={(e) => setAdminPhone(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="admin-password">Password</Label>
            <div className="relative">
              <Input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                placeholder="Set a temporary password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="pr-9"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={() => router.push("/platform/societies")}>
          Cancel
        </Button>
        <Button onClick={() => router.push("/platform/societies")}>Create society</Button>
      </div>
    </div>
  );
}

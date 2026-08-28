"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import type { SocietyResponse } from "@shared/index";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Eye,
  EyeOff,
  Mail,
  MapPin,
  Phone,
  Ruler,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SocietyLogo } from "@/components/societyLogo";
import { useBreadcrumbTitle } from "@/components/breadcrumbs";
import { getSocietiesRequest } from "@/lib/societyApi";
import { getSocietyDetails } from "@/lib/platformMockData";
import { getInitials } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-3.5" />
      </span>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-sm font-medium text-foreground">{value}</span>
      </div>
    </div>
  );
}

export default function SocietyDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();
  const [societies, setSocieties] = React.useState<SocietyResponse[] | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);

  React.useEffect(() => {
    if (!token) return;
    getSocietiesRequest(token)
      .then(setSocieties)
      .catch(() => setSocieties([]));
  }, [token]);

  useBreadcrumbTitle(societies?.find((s) => s.id === params.id)?.name);

  if (societies === null) return null;

  const society = societies.find((s) => s.id === params.id);
  if (!society) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <p className="text-sm text-muted-foreground">Society not found.</p>
        <Button variant="outline" size="sm" onClick={() => router.push("/platform/societies")}>
          Back to societies
        </Button>
      </div>
    );
  }

  const details = getSocietyDetails(society.id, society.name);

  return (
    <div className="flex flex-col gap-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 w-fit gap-1.5 text-muted-foreground"
        onClick={() => router.push("/platform/societies")}
      >
        <ArrowLeft className="size-3.5" />
        Societies
      </Button>

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <SocietyLogo
            name={society.name}
            initials={getInitials(society.name)}
            src={details.logoUrl}
            className="size-14 text-lg"
          />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold tracking-tight text-foreground">
                {society.name}
              </h1>
              <Badge variant={society.isActive ? "secondary" : "outline"} className="capitalize">
                {society.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-3.5" />
              {details.address}, {details.city}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-md border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground">Society details</h2>
          <div className="divide-y divide-border">
            <DetailRow icon={Building2} label="Society name" value={society.name} />
            <DetailRow
              icon={MapPin}
              label="Address"
              value={`${details.address}, ${details.city}`}
            />
            <DetailRow
              icon={Ruler}
              label="Built-up area"
              value={`${details.areaSqft.toLocaleString("en-IN")} sqft`}
            />
            <DetailRow icon={Calendar} label="Created on" value={formatDate(society.createdAt)} />
          </div>
        </div>

        <div className="rounded-md border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground">Society admin</h2>
          <div className="mt-4 flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarFallback>{getInitials(details.admin.name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">{details.admin.name}</span>
              <span className="text-xs text-muted-foreground">Society admin</span>
            </div>
          </div>
          <div className="divide-y divide-border">
            <DetailRow icon={Mail} label="Email" value={details.admin.email} />
            <DetailRow icon={Phone} label="Phone" value={details.admin.phone} />
            <div className="flex items-center justify-between py-3">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">Password</span>
                  <span className="text-sm font-medium text-foreground">
                    {showPassword ? "Rooster@1234" : "••••••••••••"}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? "Hide" : "Show"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

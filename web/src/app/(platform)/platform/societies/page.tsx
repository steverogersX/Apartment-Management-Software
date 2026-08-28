"use client";

import * as React from "react";
import Link from "next/link";
import type { SocietyResponse } from "@shared/index";

import { Button } from "@/components/ui/button";
import { SocietiesTable } from "@/components/societiesTable";
import { getSocietiesRequest } from "@/lib/societyApi";
import { ApiClientError } from "@/lib/apiClient";
import { useAuth } from "@/hooks/useAuth";

export default function PlatformSocietiesPage() {
  const { token } = useAuth();
  const [societies, setSocieties] = React.useState<SocietyResponse[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!token) return;
    getSocietiesRequest(token)
      .then(setSocieties)
      .catch((err) => {
        setError(err instanceof ApiClientError ? err.message : "Couldn't reach the server");
      });
  }, [token]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Societies</h1>
          <p className="text-sm text-muted-foreground">
            Every society on the platform. Create one to onboard a new customer.
          </p>
        </div>
        <Button size="sm" render={<Link href="/platform/societies/new" />}>
          Create society
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {societies && <SocietiesTable societies={societies} />}
    </div>
  );
}

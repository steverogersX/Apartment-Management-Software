"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" />
      </span>
      <div className="flex flex-col gap-1.5">
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          Something went wrong
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          This screen hit an unexpected error. You can try again, or head back to the dashboard.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => reset()}>
          <RotateCw className="size-3.5" />
          Try again
        </Button>
        <Button size="sm" render={<Link href="/dashboard" />}>
          Back to dashboard
        </Button>
      </div>
    </div>
  );
}

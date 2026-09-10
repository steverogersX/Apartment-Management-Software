"use client";

import Link from "next/link";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvoicingTable } from "@/components/invoicingTable";
import { CollectionCyclesTable } from "@/components/invoicing/collectionCyclesTable";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentFlat } from "@/hooks/useCurrentFlat";
import { invoices } from "@/lib/invoicingMockData";

export default function InvoicingPage() {
  const { has } = useAuth();
  const { flatId } = useCurrentFlat();
  const canViewAll = has("InvoicingViewAll");
  const canViewOwn = has("InvoicingViewOwn");

  if (!canViewAll && !canViewOwn) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          You do not have permission to view invoices.
        </p>
        <Link href="/dashboard" className="text-sm font-medium text-foreground underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const scopedInvoices = canViewAll ? invoices : invoices.filter((inv) => inv.flatId === flatId);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Invoicing</h1>
        <p className="text-sm text-muted-foreground">
          {canViewAll
            ? "Generate and track maintenance invoices for flats."
            : "Your flat's maintenance invoices."}
        </p>
      </div>

      {canViewAll ? (
        <Tabs defaultValue="invoices">
          <TabsList>
            <TabsTrigger value="invoices">All Invoices</TabsTrigger>
            <TabsTrigger value="cycles">Collection Cycles</TabsTrigger>
          </TabsList>
          <TabsContent value="invoices" className="animate-rise mt-4">
            <InvoicingTable flatId={null} />
          </TabsContent>
          <TabsContent value="cycles" className="animate-rise mt-4">
            <CollectionCyclesTable invoices={scopedInvoices} />
          </TabsContent>
        </Tabs>
      ) : (
        <InvoicingTable flatId={flatId} readOnly />
      )}
    </div>
  );
}

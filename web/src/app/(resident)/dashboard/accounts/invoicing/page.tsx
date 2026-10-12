"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvoicingTable } from "@/components/invoicingTable";
import { CollectionCyclesTable } from "@/components/invoicing/collectionCyclesTable";
import { useAuth } from "@/hooks/useAuth";
import { invoices } from "@/lib/invoicingMockData";
import { PermissionDenied } from "@/components/permissionDenied";
import { PageIcon } from "@/components/pageIcon";

export default function InvoicingPage() {
  const { has } = useAuth();
  const canViewAll = has("InvoicingViewAll");

  if (!canViewAll) {
    return <PermissionDenied message="You do not have permission to view invoices." />;
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <h1 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
          <PageIcon />
          Invoicing
        </h1>
        <p className="text-sm text-muted-foreground">
          Generate and track maintenance invoices for flats.
        </p>
      </div>

      <Tabs defaultValue="invoices">
        <TabsList>
          <TabsTrigger value="invoices">All Invoices</TabsTrigger>
          <TabsTrigger value="cycles">Collection Cycles</TabsTrigger>
        </TabsList>
        <TabsContent value="invoices" className="animate-rise mt-4">
          <InvoicingTable flatId={null} />
        </TabsContent>
        <TabsContent value="cycles" className="animate-rise mt-4">
          <CollectionCyclesTable invoices={invoices} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

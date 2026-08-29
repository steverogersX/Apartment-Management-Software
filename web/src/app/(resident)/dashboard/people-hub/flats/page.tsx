"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlatsTable } from "@/components/flatsTable";
import { AllResidentsTable } from "@/components/allResidentsTable";

export default function FlatsPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Flats & Residents</h1>
        <p className="text-sm text-muted-foreground">
          Browse by flat or by resident — same data, two views.
        </p>
      </div>
      <Tabs defaultValue="flats">
        <TabsList>
          <TabsTrigger value="flats">Flats</TabsTrigger>
          <TabsTrigger value="residents">Residents</TabsTrigger>
        </TabsList>
        <TabsContent value="flats" className="animate-rise mt-4">
          <FlatsTable />
        </TabsContent>
        <TabsContent value="residents" className="animate-rise mt-4">
          <AllResidentsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}

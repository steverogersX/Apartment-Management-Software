"use client";

import { House, UploadCloud } from "lucide-react";

import { CreateFlatForm } from "@/components/flats/createFlatForm";
import { BulkAddFlatsForm } from "@/components/flats/bulkAddFlatsForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function NewFlatPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Add flat</h1>
          <p className="text-sm text-muted-foreground">Register a new flat in this society.</p>
        </div>
      </div>

      <Tabs defaultValue="single">
        <TabsList>
          <TabsTrigger value="single" className="gap-1.5">
            <House className="size-3.5" />
            Single flat
          </TabsTrigger>
          <TabsTrigger value="bulk" className="gap-1.5">
            <UploadCloud className="size-3.5" />
            Bulk upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="animate-rise mt-4">
          <CreateFlatForm />
        </TabsContent>
        <TabsContent value="bulk" className="animate-rise mt-4">
          <BulkAddFlatsForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateUserForm } from "@/components/users/createUserForm";
import { BulkUserUpload } from "@/components/users/bulkUserUpload";

export default function NewUserPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Link
          href="/dashboard/users"
          className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to users
        </Link>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Add user</h1>
          <p className="text-sm text-muted-foreground">
            Invite someone individually, or bulk-import a list from Excel/CSV.
          </p>
        </div>
      </div>

      <Card>
        <CardContent>
          <Tabs defaultValue="single">
            <TabsList>
              <TabsTrigger value="single">Single user</TabsTrigger>
              <TabsTrigger value="bulk">Bulk upload</TabsTrigger>
            </TabsList>
            <TabsContent value="single" className="pt-4">
              <CreateUserForm />
            </TabsContent>
            <TabsContent value="bulk" className="pt-4">
              <BulkUserUpload />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

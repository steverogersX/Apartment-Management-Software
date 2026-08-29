import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CreateFlatForm } from "@/components/flats/createFlatForm";

export default function NewFlatPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Link
          href="/dashboard/people-hub/flats"
          className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to flats
        </Link>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Add flat</h1>
          <p className="text-sm text-muted-foreground">Register a new flat in this society.</p>
        </div>
      </div>

      <CreateFlatForm />
    </div>
  );
}

"use client";

import { CommitteeTable } from "@/components/committeeTable";
import { PageIcon } from "@/components/pageIcon";

export default function CommitteePage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <h1 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
          <PageIcon />
          Management Committee
        </h1>
        <p className="text-sm text-muted-foreground">
          Office bearers and committee members of the society.
        </p>
      </div>
      <CommitteeTable />
    </div>
  );
}

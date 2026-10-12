"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ElectionForm } from "@/components/elections/electionForm";
import { elections } from "@/lib/electionsMockData";
import { useAuth } from "@/hooks/useAuth";
import type { ElectionFormInput } from "@/lib/electionsMockData";
import { PermissionDenied } from "@/components/permissionDenied";
import { useToast } from "@/components/ui/toast";

export default function NewElectionPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { has } = useAuth();
  const canCreate = has("ElectionsManage");

  if (!canCreate) {
    return (
      <PermissionDenied
        message="You do not have permission to create elections."
        backHref="/dashboard/election-polls"
        backLabel="Back to elections"
      />
    );
  }

  function handleSave(values: ElectionFormInput) {
    const audience =
      values.audienceScope === "All"
        ? { scope: "All" as const }
        : values.audienceScope === "Blocks"
          ? { scope: "Blocks" as const, blocks: values.audienceValue ?? [] }
          : { scope: "Flats" as const, flats: values.audienceValue ?? [] };

    const newElection = {
      id: `election-${Date.now()}`,
      title: values.title,
      description: values.description,
      seats: values.seats,
      candidates: values.candidates.map((c, idx) => ({
        id: `cand-${Date.now()}-${idx}`,
        name: c.name,
        flat: c.flat,
        statement: c.statement,
        photo: c.photo,
      })),
      audience,
      votedFlats: [] as string[],
      ballots: {} as Record<string, number>,
      opensAt: new Date(values.opensAt).toISOString(),
      closesAt: new Date(values.closesAt).toISOString(),
      resultsPublished: false,
    };

    // Initialize ballots with zero counts for each candidate
    for (const cand of newElection.candidates) {
      newElection.ballots[cand.id] = 0;
    }

    elections.unshift(newElection);
    router.push("/dashboard/election-polls");
    toast({ title: "Election created" });
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <Link
        href="/dashboard/election-polls"
        className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to elections
      </Link>
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-foreground">New election</h1>
        <p className="text-sm text-muted-foreground">
          Create a new election with candidates and schedule.
        </p>
      </div>
      <ElectionForm onSave={handleSave} onCancel={() => router.push("/dashboard/election-polls")} />
    </div>
  );
}

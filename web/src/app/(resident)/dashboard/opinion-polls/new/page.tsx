"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PollForm } from "@/components/polls/pollForm";
import { opinionPolls, type OpinionPoll } from "@/lib/pollsMockData";
import { residents } from "@/lib/residentsMockData";
import { useAuth } from "@/hooks/useAuth";
import type { PollFormInput } from "@/lib/pollsMockData";
import { PermissionDenied } from "@/components/permissionDenied";

export default function NewPollPage() {
  const router = useRouter();
  const { has } = useAuth();
  const canCreate = has("PollsCreate");

  if (!canCreate) {
    return (
      <PermissionDenied
        message="You do not have permission to create polls."
        backHref="/dashboard/opinion-polls"
        backLabel="Back to polls"
      />
    );
  }

  function handleSave(values: PollFormInput) {
    const currentUser = "Arvind Deshmukh";
    const resident = residents.find((r) => r.name === currentUser);
    const authorFlat = resident ? `${resident.tower}-${resident.flatNumber}` : "A-301";
    const audience =
      values.audienceScope === "All"
        ? { scope: "All" as const }
        : values.audienceScope === "Blocks"
          ? { scope: "Blocks" as const, blocks: values.audienceValue ?? [] }
          : { scope: "Flats" as const, flats: values.audienceValue ?? [] };

    const newPoll: OpinionPoll = {
      id: `poll-${Date.now()}`,
      question: values.question,
      description: values.description,
      options: values.options
        .filter((o) => o.trim().length > 0)
        .map((label, idx) => ({
          id: `poll-${Date.now()}-opt-${idx}`,
          label: label.trim(),
          votes: [],
        })),
      pollType: values.pollType,
      audience,
      postedBy: "Admin",
      postedAt: new Date().toISOString(),
      closesAt: new Date(values.closesAt).toISOString(),
      authorName: currentUser,
      authorFlat,
    };

    opinionPolls.unshift(newPoll);
    router.push("/dashboard/opinion-polls");
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <Link
        href="/dashboard/opinion-polls"
        className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to polls
      </Link>
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-foreground">New poll</h1>
        <p className="text-sm text-muted-foreground">Ask a question and collect votes.</p>
      </div>
      <PollForm onSave={handleSave} onCancel={() => router.push("/dashboard/opinion-polls")} />
    </div>
  );
}

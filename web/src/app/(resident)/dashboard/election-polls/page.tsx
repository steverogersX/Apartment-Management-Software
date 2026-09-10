"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Plus, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { elections, getElectionStatus } from "@/lib/electionsMockData";
import { useAuth } from "@/hooks/useAuth";

export default function ElectionPollsPage() {
  const { has } = useAuth();
  const canCreate = has("ElectionsManage");

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Election Polls</h1>
          <p className="text-sm text-muted-foreground">
            Formal elections for society positions — anonymous ballots, results hidden until
            published.
          </p>
        </div>
        {canCreate && (
          <Button
            size="sm"
            className="gap-1.5 shrink-0"
            render={<Link href="/dashboard/election-polls/new" />}
          >
            <Plus className="size-3.5" />
            New election
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {elections.map((election) => {
          const status = getElectionStatus(election);
          const turnout = election.votedFlats.length;
          const totalFlats = 60;
          return (
            <ElectionCard
              key={election.id}
              election={election}
              status={status}
              turnout={turnout}
              totalFlats={totalFlats}
            />
          );
        })}
      </div>
    </div>
  );
}

function ElectionCard({
  election,
  status,
  turnout,
  totalFlats,
}: {
  election: (typeof elections)[number];
  status: "open" | "closed";
  turnout: number;
  totalFlats: number;
}) {
  const router = useRouter();
  const isOpen = status === "open" && !election.resultsPublished;
  const showResultsPublished = election.resultsPublished;

  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-muted/30"
      onClick={() => router.push(`/dashboard/election-polls/${election.id}`)}
    >
      <CardHeader className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={isOpen ? "default" : "secondary"}>{isOpen ? "Open" : "Closed"}</Badge>
          <Badge variant="outline">
            {election.seats} seat{election.seats === 1 ? "" : "s"}
          </Badge>
          <Badge variant="outline">{election.candidates.length} candidates</Badge>
          {showResultsPublished && (
            <Badge variant="default" className="bg-emerald-600">
              Results published
            </Badge>
          )}
        </div>
        <CardTitle className="text-base leading-tight">{election.title}</CardTitle>
        <p className="line-clamp-2 text-sm text-muted-foreground">{election.description}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Users className="size-3.5" />
              Turnout
            </span>
            <span>
              {turnout} of {totalFlats} flats
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-foreground transition-all"
              style={{
                width: `${totalFlats === 0 ? 0 : Math.round((turnout / totalFlats) * 100)}%`,
              }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-2.5">
          {showResultsPublished ? (
            <p className="text-xs font-medium text-emerald-600">Results published — view winners</p>
          ) : isOpen ? (
            <p className="text-xs font-medium text-foreground">
              View candidates and cast your ballot
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Closed — results not yet published</p>
          )}
          <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}

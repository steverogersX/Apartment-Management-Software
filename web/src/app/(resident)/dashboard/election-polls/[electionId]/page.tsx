"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Award, Check, Users, Vote } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SetBreadcrumbTitle } from "@/components/breadcrumbs";
import { elections, getElectionById, isElectionClosed } from "@/lib/electionsMockData";
import { residents } from "@/lib/residentsMockData";
import { avatarUrlForName, getInitials, gradientForName } from "@/lib/utils";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ElectionDetailPage() {
  const params = useParams<{ electionId: string }>();
  const router = useRouter();
  const initial = getElectionById(params.electionId);
  const [election, setElection] = React.useState(initial);
  const [selected, setSelected] = React.useState<string[]>([]);
  const currentFlat = "A-301";
  const currentUser = "Arvind Deshmukh";

  React.useEffect(() => {
    setElection(getElectionById(params.electionId) ?? null);
    setSelected([]);
  }, [params.electionId]);

  if (!election) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-muted-foreground">Election not found.</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/dashboard/election-polls")}
        >
          Back to elections
        </Button>
      </div>
    );
  }

  const closed = isElectionClosed(election);
  const hasVoted = election.votedFlats.includes(currentFlat);
  const showBallot = !closed && !election.resultsPublished && !hasVoted;
  const showPending = (closed && !election.resultsPublished) || (!closed && hasVoted);
  const showResults = closed && election.resultsPublished;
  const totalVotes = Object.values(election.ballots).reduce((sum, v) => sum + v, 0);
  const totalFlats = 60;

  const sortedCandidates = React.useMemo(() => {
    if (!showResults) return election.candidates;
    return [...election.candidates].sort(
      (a, b) => (election.ballots[b.id] ?? 0) - (election.ballots[a.id] ?? 0),
    );
  }, [election.candidates, election.ballots, showResults]);

  const winners = React.useMemo(() => {
    if (!showResults) return new Set<string>();
    return new Set(sortedCandidates.slice(0, election.seats).map((c) => c.id));
  }, [sortedCandidates, election.seats, showResults]);

  function toggleCandidate(candidateId: string) {
    if (!election) return;
    const seats = election.seats;
    setSelected((prev) => {
      if (prev.includes(candidateId)) return prev.filter((id) => id !== candidateId);
      if (prev.length >= seats) return prev;
      return [...prev, candidateId];
    });
  }

  function handleCastBallot() {
    if (!election) return;
    if (selected.length === 0 || selected.length > election.seats) return;
    // Anonymous: only record that this flat has voted, and increment aggregate tallies. Never store which flat voted for which candidate.
    const currentElection = election;
    const updatedBallots = { ...currentElection.ballots };
    for (const cid of selected) {
      updatedBallots[cid] = (updatedBallots[cid] ?? 0) + 1;
    }
    const updatedVotedFlats = [...currentElection.votedFlats, currentFlat];
    const updated: typeof currentElection = {
      ...currentElection,
      votedFlats: updatedVotedFlats,
      ballots: updatedBallots,
    };
    setElection(updated);
    const idx = elections.findIndex((e) => e.id === currentElection.id);
    if (idx !== -1) elections[idx] = updated;
    setSelected([]);
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <SetBreadcrumbTitle title={election.title} />
      <Link
        href="/dashboard/election-polls"
        className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to elections
      </Link>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={closed ? "secondary" : "default"}>{closed ? "Closed" : "Open"}</Badge>
            {election.resultsPublished && (
              <Badge variant="default" className="bg-emerald-600">
                Results published
              </Badge>
            )}
            <Badge variant="outline">
              {election.seats} seat{election.seats === 1 ? "" : "s"}
            </Badge>
            <Badge variant="outline">{election.candidates.length} candidates</Badge>
          </div>
          <CardTitle className="text-xl leading-tight">{election.title}</CardTitle>
          <p className="text-sm leading-relaxed text-muted-foreground">{election.description}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Users className="size-3.5" />
              {election.votedFlats.length} of {totalFlats} flats have voted
            </span>
            <span>· {election.candidates.length} candidates</span>
            <span>
              · {formatDateTime(election.opensAt)} → {formatDateTime(election.closesAt)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {showBallot && (
            <>
              <p className="text-sm text-muted-foreground">
                Select up to {election.seats} candidate{election.seats === 1 ? "" : "s"} and cast
                your anonymous ballot. Your choices will not be stored.
              </p>
              <div className="flex flex-col gap-3">
                {election.candidates.map((candidate) => {
                  const isSelected = selected.includes(candidate.id);
                  const isDisabled = !isSelected && selected.length >= election.seats;
                  const [from, to] = gradientForName(candidate.name);
                  return (
                    <label
                      key={candidate.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${isSelected ? "border-foreground bg-muted/40" : "border-border hover:bg-muted/20"} ${isDisabled ? "opacity-50" : ""}`}
                    >
                      <Checkbox
                        checked={isSelected}
                        disabled={isDisabled}
                        onCheckedChange={() => toggleCandidate(candidate.id)}
                        className="mt-1"
                      />
                      <Avatar size="sm" className="shrink-0">
                        <AvatarImage
                          src={candidate.photo ?? avatarUrlForName(candidate.name)}
                          alt={candidate.name}
                        />
                        <AvatarFallback
                          className="text-[11px] font-medium text-white"
                          style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
                        >
                          {getInitials(candidate.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="text-sm font-medium text-foreground">
                          {candidate.name}{" "}
                          <span className="font-normal text-muted-foreground">
                            · {candidate.flat}
                          </span>
                        </span>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {candidate.statement}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {selected.length} of {election.seats} selected
                </p>
                <Button
                  size="sm"
                  disabled={selected.length === 0 || selected.length > election.seats}
                  onClick={handleCastBallot}
                  className="gap-1.5"
                >
                  <Vote className="size-3.5" />
                  Cast ballot
                </Button>
              </div>
            </>
          )}

          {showPending && (
            <div className="rounded-md border border-dashed bg-muted/30 px-4 py-6 text-center">
              {hasVoted && !closed ? (
                <>
                  <p className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-foreground">
                    <Check className="size-4 text-emerald-600" />
                    Your ballot has been cast
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {election.votedFlats.length} of {totalFlats} flats have voted so far. Results
                    will be published after the election closes.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-foreground">Results not yet published</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {election.votedFlats.length} of {totalFlats} flats have voted. Candidate tallies
                    will be revealed once results are published.
                  </p>
                </>
              )}
            </div>
          )}

          {showResults && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground">Final results</h4>
                <span className="text-xs text-muted-foreground">{totalVotes} total votes</span>
              </div>
              {sortedCandidates.map((candidate) => {
                const votes = election.ballots[candidate.id] ?? 0;
                const percent = totalVotes === 0 ? 0 : Math.round((votes / totalVotes) * 100);
                const isWinner = winners.has(candidate.id);
                const [from, to] = gradientForName(candidate.name);
                return (
                  <div
                    key={candidate.id}
                    className={`flex flex-col gap-2 rounded-lg border p-3 ${isWinner ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20" : "border-border"}`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar size="sm" className="shrink-0">
                        <AvatarImage
                          src={candidate.photo ?? avatarUrlForName(candidate.name)}
                          alt={candidate.name}
                        />
                        <AvatarFallback
                          className="text-[11px] font-medium text-white"
                          style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
                        >
                          {getInitials(candidate.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-sm font-medium text-foreground">
                            {candidate.name} · {candidate.flat}
                          </span>
                          {isWinner && (
                            <Badge
                              variant="default"
                              className="gap-1 bg-emerald-600 px-1.5 py-0 text-[10px]"
                            >
                              <Award className="size-3" />
                              Winner
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{candidate.statement}</p>
                        <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                          <span className="text-muted-foreground">
                            {votes} votes · {percent}%
                          </span>
                          {isWinner && (
                            <span className="font-medium text-emerald-600">Elected</span>
                          )}
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full transition-all ${isWinner ? "bg-emerald-600" : "bg-foreground"}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

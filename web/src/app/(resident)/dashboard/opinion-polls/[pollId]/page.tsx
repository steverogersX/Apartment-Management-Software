"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CalendarClock, Check, ListChecks, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SetBreadcrumbTitle } from "@/components/breadcrumbs";
import { getPollById, isPollClosed, opinionPolls } from "@/lib/pollsMockData";
import { residents } from "@/lib/residentsMockData";
import { avatarUrlForName, cn, getInitials, gradientForName } from "@/lib/utils";

function PropertyRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 items-start gap-1 py-2.5 sm:grid-cols-[140px_1fr] sm:items-center sm:gap-4">
      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </span>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatRelativeTime(iso: string) {
  const diffMs = new Date(iso).getTime() - Date.now();
  const absMs = Math.abs(diffMs);
  const minutes = Math.round(absMs / 60000);
  const isFuture = diffMs > 0;
  if (minutes < 1) return isFuture ? "closes now" : "closed just now";
  if (minutes < 60) return isFuture ? `closes in ${minutes}m` : `closed ${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return isFuture ? `closes in ${hours}h` : `closed ${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return isFuture ? `closes in ${days}d` : `closed ${days}d ago`;
  return isFuture
    ? `closes ${new Date(iso).toLocaleDateString("en-IN")}`
    : `closed ${new Date(iso).toLocaleDateString("en-IN")}`;
}

export default function PollDetailPage() {
  const params = useParams<{ pollId: string }>();
  const router = useRouter();
  const poll = getPollById(params.pollId);
  const [localPoll, setLocalPoll] = React.useState(poll);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [selectedOptionId, setSelectedOptionId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLocalPoll(getPollById(params.pollId) ?? null);
    setSelectedOptionId(null);
  }, [params.pollId]);

  if (!localPoll) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-muted-foreground">Poll not found.</p>
        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/opinion-polls")}>
          Back to polls
        </Button>
      </div>
    );
  }

  const p = localPoll;
  const currentUser = "Arvind Deshmukh";
  const closed = isPollClosed(p);
  const hasVoted = p.options.some((o) => o.votes.includes(currentUser));
  const totalVotes = p.options.reduce((sum, o) => sum + o.votes.length, 0);
  const showResults = closed || hasVoted;

  const audienceLabel =
    p.audience.scope === "All"
      ? "All residents"
      : p.audience.scope === "Blocks"
        ? `Blocks: ${p.audience.blocks.join(", ")}`
        : `Flats: ${p.audience.flats.join(", ")}`;

  function toggleOption(optionId: string) {
    if (p.pollType === "single") {
      setSelected([optionId]);
    } else {
      setSelected((prev) =>
        prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId],
      );
    }
  }

  function handleVote() {
    if (selected.length === 0) return;
    const updatedOptions = p.options.map((opt) =>
      selected.includes(opt.id) && !opt.votes.includes(currentUser)
        ? { ...opt, votes: [...opt.votes, currentUser] }
        : opt,
    );
    const updatedPoll = { ...p, options: updatedOptions };
    setLocalPoll(updatedPoll);
    const idx = opinionPolls.findIndex((x) => x.id === p.id);
    if (idx !== -1) opinionPolls[idx] = updatedPoll;
    setSelected([]);
  }

  const sortedOptions = React.useMemo(() => {
    if (!showResults) return p.options;
    return [...p.options].sort((a, b) => b.votes.length - a.votes.length);
  }, [p.options, showResults]);

  const selectedOption = selectedOptionId
    ? (p.options.find((o) => o.id === selectedOptionId) ?? null)
    : null;
  const selectedVoters = (selectedOption?.votes ?? []).map((name) => {
    const resident = residents.find((r) => r.name === name);
    return { name, flat: resident ? `${resident.tower}-${resident.flatNumber}` : "—" };
  });

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <SetBreadcrumbTitle title={p.question} />
      <Link
        href="/dashboard/opinion-polls"
        className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to polls
      </Link>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={closed ? "secondary" : "default"}>{closed ? "Closed" : "Open"}</Badge>
            <Badge variant="outline" className="capitalize">
              {p.pollType === "single" ? "Single choice" : "Multiple choice"}
            </Badge>
          </div>
          <CardTitle className="text-xl leading-tight">{p.question}</CardTitle>
          {p.description && (
            <p className="text-sm leading-relaxed text-muted-foreground">{p.description}</p>
          )}
          <div className="flex items-center gap-3">
            {(() => {
              const [from, to] = gradientForName(p.authorName);
              return (
                <Avatar size="sm">
                  <AvatarImage src={avatarUrlForName(p.authorName)} alt={p.authorName} />
                  <AvatarFallback
                    className="text-[11px] font-medium text-white"
                    style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
                  >
                    {getInitials(p.authorName)}
                  </AvatarFallback>
                </Avatar>
              );
            })()}
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">{p.authorName}</span>
              <span className="text-xs text-muted-foreground">
                {p.authorFlat} · posted {formatDateTime(p.postedAt)}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col divide-y divide-border rounded-lg border border-border px-3 sm:px-4">
            <PropertyRow icon={Users} label="Audience">
              {audienceLabel}
            </PropertyRow>
            <PropertyRow icon={ListChecks} label="Total votes">
              {totalVotes} vote{totalVotes === 1 ? "" : "s"} so far
            </PropertyRow>
            <PropertyRow icon={CalendarClock} label="Closes">
              {formatRelativeTime(p.closesAt)}{" "}
              <span className="text-muted-foreground">· {formatDateTime(p.closesAt)}</span>
            </PropertyRow>
          </div>

          {!showResults ? (
            <>
              <div className="flex flex-col gap-2">
                {p.options.map((opt) => {
                  const isSelected = selected.includes(opt.id);
                  return (
                    <label
                      key={opt.id}
                      className="flex cursor-pointer items-center gap-3 rounded-md border border-border px-3 py-2.5 transition-colors hover:bg-muted/50 has-[input:checked]:border-foreground has-[input:checked]:bg-muted"
                    >
                      {p.pollType === "single" ? (
                        <input
                          type="radio"
                          name="poll-option"
                          checked={isSelected}
                          onChange={() => toggleOption(opt.id)}
                          className="size-4 accent-foreground"
                        />
                      ) : (
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleOption(opt.id)}
                        />
                      )}
                      <span className="text-sm text-foreground">{opt.label}</span>
                    </label>
                  );
                })}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {totalVotes} vote{totalVotes === 1 ? "" : "s"} so far ·{" "}
                  {p.pollType === "multiple" ? "You can select multiple" : "Select one"}
                </p>
                <Button size="sm" disabled={selected.length === 0} onClick={handleVote}>
                  Submit vote
                </Button>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_260px]">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {totalVotes} total vote{totalVotes === 1 ? "" : "s"} · click an option to see
                    who voted
                  </span>
                  {hasVoted && (
                    <span className="inline-flex items-center gap-1 text-foreground">
                      <Check className="size-3" /> You voted
                    </span>
                  )}
                  {closed && <span>Closed</span>}
                </div>
                {sortedOptions.map((opt) => {
                  const count = opt.votes.length;
                  const percent = totalVotes === 0 ? 0 : Math.round((count / totalVotes) * 100);
                  const isPicked = opt.votes.includes(currentUser);
                  const isActive = selectedOptionId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedOptionId(isActive ? null : opt.id)}
                      className={cn(
                        "flex flex-col gap-1 rounded-md border px-3 py-2 text-left transition-colors",
                        isActive
                          ? "border-foreground bg-muted/50"
                          : "border-transparent hover:bg-muted/40",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="flex items-center gap-1.5 font-medium text-foreground">
                          {opt.label}
                          {isPicked && (
                            <Badge variant="secondary" className="px-1 py-0 text-[10px]">
                              Your pick
                            </Badge>
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {count} vote{count === 1 ? "" : "s"} · {percent}%
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-foreground transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              <aside className="h-fit rounded-lg border border-border lg:sticky lg:top-6">
                <div className="border-b border-border px-3 py-2.5">
                  <p className="text-xs font-medium text-foreground">
                    {selectedOption ? selectedOption.label : "Voters"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {selectedOption
                      ? `${selectedVoters.length} vote${selectedVoters.length === 1 ? "" : "s"}`
                      : "Click an option to see who voted"}
                  </p>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {!selectedOption ? (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      No option selected.
                    </div>
                  ) : selectedVoters.length === 0 ? (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      No votes for this option yet.
                    </div>
                  ) : (
                    <div className="flex flex-col divide-y divide-border">
                      {selectedVoters.map((voter) => {
                        const [from, to] = gradientForName(voter.name);
                        return (
                          <div key={voter.name} className="flex items-center gap-2.5 px-3 py-2">
                            <Avatar size="sm" className="shrink-0">
                              <AvatarImage src={avatarUrlForName(voter.name)} alt={voter.name} />
                              <AvatarFallback
                                className="text-[10px] font-medium text-white"
                                style={{
                                  backgroundImage: `linear-gradient(135deg, ${from}, ${to})`,
                                }}
                              >
                                {getInitials(voter.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex min-w-0 flex-col">
                              <span className="truncate text-xs font-medium text-foreground">
                                {voter.name}
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                {voter.flat}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </aside>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

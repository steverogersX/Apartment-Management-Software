"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, Check, Clock, MapPin, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SetBreadcrumbTitle } from "@/components/breadcrumbs";
import { AttachmentList } from "@/components/forum/replyThread";
import { AttachmentDropzone } from "@/components/fileDropzone";
import { getMeetingById, getMeetingStatus, meetings } from "@/lib/meetingsMockData";
import { residents } from "@/lib/residentsMockData";
import { useAuth } from "@/hooks/useAuth";
import { avatarUrlForName, cn, getInitials, gradientForName } from "@/lib/utils";
import type { Attachment } from "@/lib/attachmentTypes";
import { useToast } from "@/components/ui/toast";

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

export default function MeetingDetailPage() {
  const params = useParams<{ meetingId: string }>();
  const router = useRouter();
  const initial = getMeetingById(params.meetingId);

  if (!initial) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-muted-foreground">Meeting not found.</p>
        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/meetings")}>
          Back to meetings
        </Button>
      </div>
    );
  }

  return <MeetingDetail key={params.meetingId} initial={initial} />;
}

function MeetingDetail({ initial }: { initial: NonNullable<ReturnType<typeof getMeetingById>> }) {
  const { toast } = useToast();
  const { has } = useAuth();
  const canManage = has("MeetingsSchedule");

  const [meeting, setMeeting] = React.useState(initial);
  const [selectedBucket, setSelectedBucket] = React.useState<"yes" | "no" | "maybe" | null>(null);
  const currentUser = "Arvind Deshmukh";

  const status = getMeetingStatus(meeting);
  const isCancelled = status === "cancelled";
  const isPast = status === "past";
  const isUpcoming = status === "upcoming";

  const counts = {
    yes: meeting.rsvps.filter((r) => r.response === "yes").length,
    no: meeting.rsvps.filter((r) => r.response === "no").length,
    maybe: meeting.rsvps.filter((r) => r.response === "maybe").length,
  };
  const myResponse = meeting.rsvps.find((r) => r.name === currentUser)?.response ?? null;

  const audienceLabel =
    meeting.audience.scope === "All"
      ? "All residents"
      : meeting.audience.scope === "Blocks"
        ? `Blocks: ${meeting.audience.blocks.join(", ")}`
        : `Flats: ${meeting.audience.flats.join(", ")}`;

  const [from, to] = gradientForName(meeting.organizerName);

  function handleRsvp(response: "yes" | "no" | "maybe") {
    if (!meeting || isCancelled || isPast) return;
    const current = meeting;
    const exists = current.rsvps.find((r) => r.name === currentUser);
    let newRsvps;
    if (exists) {
      if (exists.response === response) {
        return;
      }
      newRsvps = current.rsvps.map((r) => (r.name === currentUser ? { ...r, response } : r));
    } else {
      newRsvps = [...current.rsvps, { name: currentUser, response }];
    }
    const updated: typeof current = { ...current, rsvps: newRsvps };
    setMeeting(updated);
    const idx = meetings.findIndex((m) => m.id === current.id);
    if (idx !== -1) meetings[idx] = updated;
    toast({ title: "RSVP updated" });
  }

  const selectedVoters = selectedBucket
    ? meeting.rsvps.filter((r) => r.response === selectedBucket)
    : [];
  const selectedVoterDetails = selectedVoters.map((v) => {
    const resident = residents.find((r) => r.name === v.name);
    return { name: v.name, flat: resident ? `${resident.tower}-${resident.flatNumber}` : "—" };
  });

  function handleMinutesChange(attachments: Attachment[]) {
    if (!meeting) return;
    const current = meeting;
    const updated: typeof current = { ...current, minutes: attachments };
    setMeeting(updated);
    const idx = meetings.findIndex((m) => m.id === current.id);
    if (idx !== -1) meetings[idx] = updated;
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <SetBreadcrumbTitle title={meeting.title} />
      <Link
        href="/dashboard/meetings"
        className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to meetings
      </Link>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={isCancelled ? "outline" : isPast ? "secondary" : "default"}
              className="capitalize"
            >
              {status}
            </Badge>
            {meeting.cancelled && <Badge variant="destructive">Cancelled</Badge>}
          </div>
          <CardTitle className="text-xl leading-tight">{meeting.title}</CardTitle>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {meeting.agenda}
          </p>
          <div className="flex flex-col divide-y divide-border rounded-lg border border-border px-3 sm:px-4">
            <div className="flex items-center gap-3 py-2.5">
              <Avatar size="sm">
                <AvatarImage
                  src={avatarUrlForName(meeting.organizerName)}
                  alt={meeting.organizerName}
                />
                <AvatarFallback
                  className="text-[11px] font-medium text-white"
                  style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
                >
                  {getInitials(meeting.organizerName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">
                  {meeting.organizerName}{" "}
                  <span className="font-normal text-muted-foreground">
                    · {meeting.organizerFlat}
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">Organizer</span>
              </div>
            </div>
            <PropertyRow icon={MapPin} label="Location">
              {meeting.location || "—"}
            </PropertyRow>
            <PropertyRow icon={Users} label="Audience">
              {audienceLabel}
            </PropertyRow>
            <PropertyRow icon={CalendarDays} label="Scheduled">
              {formatDateTime(meeting.scheduledAt)}
            </PropertyRow>
            <PropertyRow icon={Clock} label="Posted">
              {formatDateTime(meeting.postedAt)}
            </PropertyRow>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {isCancelled ? (
            <div className="rounded-md border border-dashed bg-muted/30 px-4 py-3 text-center text-sm text-muted-foreground">
              This meeting has been cancelled.
            </div>
          ) : isUpcoming ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {(["yes", "no", "maybe"] as const).map((resp) => {
                  const label = resp === "yes" ? "Yes" : resp === "no" ? "No" : "Maybe";
                  const isMine = myResponse === resp;
                  return (
                    <Button
                      key={resp}
                      size="sm"
                      variant={isMine ? "secondary" : "outline"}
                      className="gap-1.5"
                      onClick={() => handleRsvp(resp)}
                    >
                      {isMine && <Check className="size-3.5" />}
                      {label}
                    </Button>
                  );
                })}
                {myResponse && (
                  <span className="text-xs text-muted-foreground">
                    You RSVP&apos;d {myResponse}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_260px]">
                <div className="flex gap-2">
                  {(["yes", "no", "maybe"] as const).map((bucket) => {
                    const count = counts[bucket];
                    const isActive = selectedBucket === bucket;
                    return (
                      <button
                        key={bucket}
                        type="button"
                        onClick={() => setSelectedBucket(isActive ? null : bucket)}
                        className={cn(
                          "flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-md border px-3 py-2 text-sm transition-colors",
                          isActive
                            ? "border-foreground bg-muted/50"
                            : "border-border hover:bg-muted/40",
                        )}
                      >
                        <span className="font-semibold capitalize text-foreground">{bucket}</span>
                        <span className="text-xs text-muted-foreground">{count}</span>
                      </button>
                    );
                  })}
                </div>

                <aside className="h-fit rounded-lg border border-border lg:sticky lg:top-6">
                  <div className="border-b border-border px-3 py-2.5">
                    <p className="text-xs font-medium text-foreground capitalize">
                      {selectedBucket ? selectedBucket : "Attendees"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {selectedBucket
                        ? `${selectedVoters.length} response${selectedVoters.length === 1 ? "" : "s"}`
                        : "Click a bucket to see who responded"}
                    </p>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {!selectedBucket ? (
                      <div className="p-4 text-center text-xs text-muted-foreground">
                        No bucket selected.
                      </div>
                    ) : selectedVoterDetails.length === 0 ? (
                      <div className="p-4 text-center text-xs text-muted-foreground">
                        No one responded {selectedBucket} yet.
                      </div>
                    ) : (
                      <div className="flex flex-col divide-y divide-border">
                        {selectedVoterDetails.map((voter) => {
                          const [vf, vt] = gradientForName(voter.name);
                          return (
                            <div key={voter.name} className="flex items-center gap-2.5 px-3 py-2">
                              <Avatar size="sm" className="shrink-0">
                                <AvatarImage src={avatarUrlForName(voter.name)} alt={voter.name} />
                                <AvatarFallback
                                  className="text-[10px] font-medium text-white"
                                  style={{
                                    backgroundImage: `linear-gradient(135deg, ${vf}, ${vt})`,
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
            </div>
          ) : (
            // isPast
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-semibold text-foreground">Minutes</h4>
              {meeting.minutes && meeting.minutes.length > 0 ? (
                <AttachmentList attachments={meeting.minutes} />
              ) : (
                <p className="text-sm text-muted-foreground">No minutes uploaded yet.</p>
              )}
              {canManage ? (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-medium text-foreground">Upload minutes</p>
                  <AttachmentDropzone
                    value={meeting.minutes ?? []}
                    onChange={handleMinutesChange}
                  />
                </div>
              ) : (
                meeting.minutes &&
                meeting.minutes.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Only organizers can upload minutes.
                  </p>
                )
              )}

              <div className="rounded-md border border-border bg-muted/20 p-3">
                <p className="mb-2 text-xs font-medium text-foreground">Final attendance</p>
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span>Yes: {counts.yes}</span>
                  <span>No: {counts.no}</span>
                  <span>Maybe: {counts.maybe}</span>
                  <span>Total: {meeting.rsvps.length}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

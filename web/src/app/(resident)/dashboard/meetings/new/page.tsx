"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { MeetingForm } from "@/components/meetings/meetingForm";
import { meetings, type Meeting } from "@/lib/meetingsMockData";
import { residents } from "@/lib/residentsMockData";
import { useAuth } from "@/hooks/useAuth";
import type { MeetingFormInput } from "@/lib/meetingsMockData";
import { PermissionDenied } from "@/components/permissionDenied";
import { useToast } from "@/components/ui/toast";
import { recordAudit } from "@/lib/auditLog";

export default function NewMeetingPage() {
  const { user: auditUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const { has } = useAuth();
  const canCreate = has("MeetingsSchedule");

  if (!canCreate) {
    return (
      <PermissionDenied
        message="You do not have permission to schedule meetings."
        backHref="/dashboard/meetings"
        backLabel="Back to meetings"
      />
    );
  }

  function handleSave(values: MeetingFormInput) {
    const currentUser = "Arvind Deshmukh";
    const resident = residents.find((r) => r.name === currentUser);
    const authorFlat = resident ? `${resident.tower}-${resident.flatNumber}` : "A-301";
    const audience =
      values.audienceScope === "All"
        ? { scope: "All" as const }
        : values.audienceScope === "Blocks"
          ? { scope: "Blocks" as const, blocks: values.audienceValue ?? [] }
          : { scope: "Flats" as const, flats: values.audienceValue ?? [] };

    const newMeeting: Meeting = {
      id: `meeting-${Date.now()}`,
      title: values.title,
      agenda: values.agenda,
      location: values.location,
      organizerName: currentUser,
      organizerFlat: authorFlat,
      audience,
      scheduledAt: new Date(values.scheduledAt).toISOString(),
      postedAt: new Date().toISOString(),
      rsvps: [],
      cancelled: false,
    };

    meetings.unshift(newMeeting);
    router.push("/dashboard/meetings");
    recordAudit({
      module: "Communication",
      entityType: "Meeting",
      entityId: newMeeting.id,
      entityLabel: newMeeting.title,
      action: "Create",
      performedBy: auditUser?.displayName ?? "Unknown",
    });
    toast({ title: "Meeting scheduled" });
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <Link
        href="/dashboard/meetings"
        className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to meetings
      </Link>
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-foreground">New meeting</h1>
        <p className="text-sm text-muted-foreground">Schedule a gathering and collect RSVPs.</p>
      </div>
      <MeetingForm onSave={handleSave} onCancel={() => router.push("/dashboard/meetings")} />
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { NoticeForm } from "@/components/notices/noticeForm";
import { boardNotices, type BoardNotice } from "@/lib/noticesMockData";
import { useAuth } from "@/hooks/useAuth";
import type { NoticeFormInput } from "@/lib/noticesMockData";

export default function NewNoticePage() {
  const router = useRouter();
  const { has } = useAuth();
  const canCreate = has("NoticesPost");

  if (!canCreate) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          You do not have permission to create notices.
        </p>
        <Link href="/dashboard/notices" className="text-sm font-medium text-foreground underline">
          Back to notices
        </Link>
      </div>
    );
  }

  function handleSave(values: NoticeFormInput) {
    const audience =
      values.audienceScope === "All"
        ? { scope: "All" as const }
        : values.audienceScope === "Blocks"
          ? { scope: "Blocks" as const, blocks: values.audienceValue ?? [] }
          : { scope: "Flats" as const, flats: values.audienceValue ?? [] };

    const newNotice: BoardNotice = {
      id: `notice-${Date.now()}`,
      title: values.title,
      category: values.category,
      description: values.description,
      excerpt: values.description.slice(0, 90) + (values.description.length > 90 ? "…" : ""),
      priority: values.priority,
      postedBy: "Admin",
      postedAt: values.scheduleAt
        ? new Date(values.scheduleAt).toISOString()
        : new Date().toISOString(),
      scheduleAt: values.scheduleAt ? new Date(values.scheduleAt).toISOString() : null,
      expiryAt: values.expiryAt ? new Date(values.expiryAt).toISOString() : null,
      audience,
      coverImage: values.coverImage,
      tags: values.tags,
      attachments: values.attachments,
      requiresAcknowledge: values.requiresAcknowledge,
      readBy: [],
      acknowledgedBy: [],
      totalResidents: 60,
    };
    boardNotices.unshift(newNotice);
    router.push("/dashboard/notices");
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <Link
        href="/dashboard/notices"
        className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to notices
      </Link>
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-foreground">New notice</h1>
        <p className="text-sm text-muted-foreground">Create an announcement for residents.</p>
      </div>
      <NoticeForm onSave={handleSave} onCancel={() => router.push("/dashboard/notices")} />
    </div>
  );
}

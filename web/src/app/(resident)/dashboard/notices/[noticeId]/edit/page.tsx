"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { NoticeForm } from "@/components/notices/noticeForm";
import { boardNotices, getNoticeById } from "@/lib/noticesMockData";
import { useAuth } from "@/hooks/useAuth";
import type { NoticeFormInput } from "@/lib/noticesMockData";

export default function EditNoticePage() {
  const params = useParams<{ noticeId: string }>();
  const router = useRouter();
  const { has } = useAuth();
  const notice = getNoticeById(params.noticeId);
  const canEdit = has("NoticesPost");

  if (!canEdit) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-muted-foreground">You do not have permission to edit notices.</p>
        <Link href="/dashboard/notices" className="text-sm font-medium text-foreground underline">
          Back to notices
        </Link>
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-muted-foreground">Notice not found.</p>
        <Link href="/dashboard/notices" className="text-sm font-medium text-foreground underline">
          Back to notices
        </Link>
      </div>
    );
  }

  function handleSave(values: NoticeFormInput) {
    if (!notice) return;
    const idx = boardNotices.findIndex((n) => n.id === notice.id);
    if (idx === -1) return;
    const audience =
      values.audienceScope === "All"
        ? { scope: "All" as const }
        : values.audienceScope === "Blocks"
          ? { scope: "Blocks" as const, blocks: values.audienceValue ?? [] }
          : { scope: "Flats" as const, flats: values.audienceValue ?? [] };

    boardNotices[idx] = {
      ...boardNotices[idx],
      title: values.title,
      category: values.category,
      description: values.description,
      excerpt: values.description.slice(0, 90) + (values.description.length > 90 ? "…" : ""),
      priority: values.priority,
      scheduleAt: values.scheduleAt ? new Date(values.scheduleAt).toISOString() : null,
      expiryAt: values.expiryAt ? new Date(values.expiryAt).toISOString() : null,
      audience,
      coverImage: values.coverImage,
      tags: values.tags,
      attachments: values.attachments,
      requiresAcknowledge: values.requiresAcknowledge,
    };
    router.push(`/dashboard/notices/${notice!.id}`);
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <Link
        href={`/dashboard/notices/${notice!.id}`}
        className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to notice
      </Link>
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-foreground">Edit notice</h1>
        <p className="text-sm text-muted-foreground">Update the announcement details.</p>
      </div>
      <NoticeForm
        notice={notice!}
        onSave={handleSave}
        onCancel={() => router.push(`/dashboard/notices/${notice!.id}`)}
      />
    </div>
  );
}

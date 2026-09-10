"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ThreadForm } from "@/components/forum/threadForm";
import { forumThreads, type ForumThread } from "@/lib/forumMockData";
import { residents } from "@/lib/residentsMockData";
import { useAuth } from "@/hooks/useAuth";
import type { ForumThreadFormInput } from "@/lib/forumMockData";

export default function NewThreadPage() {
  const router = useRouter();
  const { has } = useAuth();
  const canCreate = has("ForumPost");

  if (!canCreate) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          You do not have permission to create threads.
        </p>
        <Link
          href="/dashboard/discussion-forum"
          className="text-sm font-medium text-foreground underline"
        >
          Back to forum
        </Link>
      </div>
    );
  }

  function handleSave(values: ForumThreadFormInput) {
    const currentUser = "Arvind Deshmukh";
    const resident = residents.find((r) => r.name === currentUser);
    const authorFlat = resident ? `${resident.tower}-${resident.flatNumber}` : "A-301";
    const now = new Date().toISOString();
    const newThread: ForumThread = {
      id: `thread-${Date.now()}`,
      title: values.title,
      body: values.body,
      category: values.category,
      tags: values.tags,
      attachments: values.attachments,
      authorName: currentUser,
      authorFlat,
      postedAt: now,
      lastActivityAt: now,
      replyCount: 0,
      upvotedBy: [],
      pinned: false,
      locked: false,
    };
    forumThreads.unshift(newThread);
    router.push("/dashboard/discussion-forum");
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <Link
        href="/dashboard/discussion-forum"
        className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to forum
      </Link>
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-foreground">New thread</h1>
        <p className="text-sm text-muted-foreground">Start a discussion with your neighbours.</p>
      </div>
      <ThreadForm onSave={handleSave} onCancel={() => router.push("/dashboard/discussion-forum")} />
    </div>
  );
}

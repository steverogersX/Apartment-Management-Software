"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowUp, Lock, MessageCircle, Pin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  InlineAttachments,
  filesToAttachments,
  imageFilesFromClipboard,
} from "@/components/fileDropzone";
import { AttachmentList, ReplyThread, buildReplyTree } from "@/components/forum/replyThread";
import { SetBreadcrumbTitle } from "@/components/breadcrumbs";
import {
  forumReplies,
  forumThreads,
  getForumThreadById,
  getRepliesForThread,
  type ForumReply,
} from "@/lib/forumMockData";
import { residents } from "@/lib/residentsMockData";
import type { Attachment } from "@/lib/attachmentTypes";
import { useAuth } from "@/hooks/useAuth";
import { avatarUrlForName, getInitials, gradientForName } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ForumThreadPage() {
  const params = useParams<{ threadId: string }>();
  const router = useRouter();
  const initialThread = getForumThreadById(params.threadId);

  if (!initialThread) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-muted-foreground">Thread not found.</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/dashboard/discussion-forum")}
        >
          Back to forum
        </Button>
      </div>
    );
  }

  return <ForumThread key={params.threadId} initial={initialThread} />;
}

function ForumThread({ initial }: { initial: NonNullable<ReturnType<typeof getForumThreadById>> }) {
  const { toast } = useToast();
  const { has } = useAuth();
  const canPost = has("ForumPost");

  const [thread, setThread] = React.useState(initial);
  const [replies, setReplies] = React.useState<ForumReply[]>(() =>
    initial ? getRepliesForThread(initial.id) : [],
  );
  const [composerBody, setComposerBody] = React.useState("");
  const [composerAttachments, setComposerAttachments] = React.useState<Attachment[]>([]);
  const currentUser = "Arvind Deshmukh";

  const isThreadUpvoted = thread.upvotedBy.includes(currentUser);

  function toggleThreadUpvote() {
    if (!thread) return;
    const newUpvoted = isThreadUpvoted
      ? thread.upvotedBy.filter((n) => n !== currentUser)
      : [...thread.upvotedBy, currentUser];
    const updated: typeof thread = { ...thread, upvotedBy: newUpvoted };
    setThread(updated);
    const idx = forumThreads.findIndex((t) => t.id === thread.id);
    if (idx !== -1) forumThreads[idx] = updated;
  }

  function toggleReplyUpvote(replyId: string) {
    setReplies((prev) =>
      prev.map((r) => {
        if (r.id !== replyId) return r;
        const isUpvoted = r.upvotedBy.includes(currentUser);
        const newUpvotedBy = isUpvoted
          ? r.upvotedBy.filter((n) => n !== currentUser)
          : [...r.upvotedBy, currentUser];
        const updated = { ...r, upvotedBy: newUpvotedBy };
        const globalIdx = forumReplies.findIndex((gr) => gr.id === replyId);
        if (globalIdx !== -1) forumReplies[globalIdx] = updated;
        return updated;
      }),
    );
  }

  function addReply(parentReplyId: string | null, body: string, attachments: Attachment[]) {
    if (!thread) return;
    const resident = residents.find((r) => r.name === currentUser);
    const authorFlat = resident ? `${resident.tower}-${resident.flatNumber}` : "A-301";
    const newReply: ForumReply = {
      id: `reply-${Date.now()}`,
      threadId: thread.id,
      parentReplyId,
      authorName: currentUser,
      authorFlat,
      postedAt: new Date().toISOString(),
      body,
      attachments,
      upvotedBy: [],
    };
    forumReplies.push(newReply);
    const newReplies = [...replies, newReply];
    setReplies(newReplies);

    const updatedThread: typeof thread = {
      ...thread,
      replyCount: newReplies.length,
      lastActivityAt: newReply.postedAt,
    };
    setThread(updatedThread);
    const idx = forumThreads.findIndex((t) => t.id === thread.id);
    if (idx !== -1) forumThreads[idx] = updatedThread;
  }

  function handlePostReply() {
    const body = composerBody.trim();
    if (!body) return;
    addReply(null, body, composerAttachments);
    setComposerBody("");
    setComposerAttachments([]);
    toast({ title: "Reply posted" });
  }

  async function handleReplyPaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const files = imageFilesFromClipboard(e);
    if (files.length === 0) return;
    e.preventDefault();
    const added = await filesToAttachments(files);
    setComposerAttachments((prev) => [...prev, ...added]);
  }

  const [from, to] = gradientForName(thread.authorName);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <SetBreadcrumbTitle title={thread.title} />
      <Link
        href="/dashboard/discussion-forum"
        className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to forum
      </Link>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {thread.pinned && (
              <Badge variant="secondary" className="gap-1">
                <Pin className="size-3" /> Pinned
              </Badge>
            )}
            {thread.locked && (
              <Badge variant="outline" className="gap-1">
                <Lock className="size-3" /> Locked
              </Badge>
            )}
            <Badge variant="outline">{thread.category}</Badge>
            {thread.tags?.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px]">
                {tag}
              </Badge>
            ))}
          </div>
          <CardTitle className="text-xl leading-tight">{thread.title}</CardTitle>
          <div className="flex items-center gap-3">
            <Avatar size="sm">
              <AvatarImage src={avatarUrlForName(thread.authorName)} alt={thread.authorName} />
              <AvatarFallback
                className="text-[11px] font-medium text-white"
                style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
              >
                {getInitials(thread.authorName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">
                {thread.authorName}{" "}
                <span className="font-normal text-muted-foreground">· {thread.authorFlat}</span>
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDateTime(thread.postedAt)}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {thread.body}
          </p>
          {thread.attachments && thread.attachments.length > 0 && (
            <AttachmentList attachments={thread.attachments} />
          )}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={isThreadUpvoted ? "secondary" : "outline"}
              className="gap-1.5"
              onClick={toggleThreadUpvote}
            >
              <ArrowUp className="size-3.5" />
              {thread.upvotedBy.length} Upvote{thread.upvotedBy.length === 1 ? "" : "s"}
            </Button>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <MessageCircle className="size-3.5" />
              {thread.replyCount} repl{thread.replyCount === 1 ? "y" : "ies"}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-foreground">Replies · {replies.length}</h3>
        {replies.length === 0 ? (
          <Card className="p-6 text-center text-sm text-muted-foreground">
            No replies yet. Be the first to reply.
          </Card>
        ) : (
          <Card className="p-4">
            <ReplyThread
              nodes={buildReplyTree(replies)}
              currentUser={currentUser}
              canReply={canPost && !thread.locked}
              onUpvote={toggleReplyUpvote}
              onReply={addReply}
            />
          </Card>
        )}
      </div>

      {thread.locked ? (
        <Card className="border-dashed bg-muted/30 p-4 text-center">
          <p className="inline-flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
            <Lock className="size-4" />
            This thread is locked — no new replies allowed.
          </p>
        </Card>
      ) : canPost ? (
        <Card className="p-4">
          <div className="flex flex-col gap-3">
            <Textarea
              placeholder="Write a reply… (you can paste an image directly)"
              value={composerBody}
              onChange={(e) => setComposerBody(e.target.value)}
              onPaste={handleReplyPaste}
              rows={3}
              className="resize-none"
            />
            <InlineAttachments value={composerAttachments} onChange={setComposerAttachments} />
            <div className="flex justify-end">
              <Button size="sm" onClick={handlePostReply} disabled={!composerBody.trim()}>
                Post reply
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="border-dashed bg-muted/30 p-4 text-center">
          <p className="text-sm text-muted-foreground">You do not have permission to reply.</p>
        </Card>
      )}
    </div>
  );
}

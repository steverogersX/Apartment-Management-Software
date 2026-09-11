"use client";

import * as React from "react";
import {
  ArrowUp,
  Download,
  File,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  Minus,
  Plus,
  Table,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  InlineAttachments,
  filesToAttachments,
  imageFilesFromClipboard,
} from "@/components/fileDropzone";
import { avatarUrlForName, getInitials, gradientForName } from "@/lib/utils";
import type { Attachment } from "@/lib/attachmentTypes";
import type { ForumReply } from "@/lib/forumMockData";

export type ReplyNode = ForumReply & { children: ReplyNode[] };

export function buildReplyTree(replies: ForumReply[]): ReplyNode[] {
  const nodes = new Map<string, ReplyNode>();
  replies.forEach((r) => nodes.set(r.id, { ...r, children: [] }));

  const roots: ReplyNode[] = [];
  nodes.forEach((node) => {
    const parent = node.parentReplyId ? nodes.get(node.parentReplyId) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  });

  const byPostedAt = (a: ReplyNode, b: ReplyNode) =>
    new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime();
  const sortRec = (list: ReplyNode[]) => {
    list.sort(byPostedAt);
    list.forEach((n) => sortRec(n.children));
  };
  sortRec(roots);
  return roots;
}

function countDescendants(node: ReplyNode): number {
  return node.children.reduce((sum, c) => sum + 1 + countDescendants(c), 0);
}

function formatRelativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function iconForAttachment(type: Attachment["type"]) {
  switch (type) {
    case "image":
      return ImageIcon;
    case "pdf":
      return FileText;
    case "doc":
      return FileText;
    case "sheet":
      return Table;
    case "other":
    default:
      return File;
  }
}

export function AttachmentList({ attachments }: { attachments: Attachment[] }) {
  return (
    <div className="flex flex-col gap-2">
      {attachments.map((attachment) => {
        const Icon = iconForAttachment(attachment.type);
        return (
          <div
            key={attachment.name}
            className="flex items-center justify-between rounded-md border border-border p-2.5"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                <Icon className="size-4" />
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">{attachment.name}</span>
                <span className="text-xs text-muted-foreground">
                  {attachment.size} · {attachment.type.toUpperCase()}
                </span>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1.5 px-2 text-xs"
              render={<a href={attachment.url} download={attachment.name} />}
            >
              <Download className="size-3.5" />
              Download
            </Button>
          </div>
        );
      })}
      {attachments
        .filter((a) => a.type === "image")
        .map((attachment) => (
          <div
            key={`preview-${attachment.name}`}
            className="overflow-hidden rounded-md border border-border"
          >
            <img src={attachment.url} alt={attachment.name} className="h-auto w-full" />
          </div>
        ))}
    </div>
  );
}

export function ReplyThread({
  nodes,
  currentUser,
  canReply,
  onUpvote,
  onReply,
}: {
  nodes: ReplyNode[];
  currentUser: string;
  canReply: boolean;
  onUpvote: (replyId: string) => void;
  onReply: (parentReplyId: string, body: string, attachments: Attachment[]) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {nodes.map((node) => (
        <ReplyNodeItem
          key={node.id}
          node={node}
          currentUser={currentUser}
          canReply={canReply}
          onUpvote={onUpvote}
          onReply={onReply}
        />
      ))}
    </div>
  );
}

function ReplyNodeItem({
  node,
  currentUser,
  canReply,
  onUpvote,
  onReply,
}: {
  node: ReplyNode;
  currentUser: string;
  canReply: boolean;
  onUpvote: (replyId: string) => void;
  onReply: (parentReplyId: string, body: string, attachments: Attachment[]) => void;
}) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [isReplying, setIsReplying] = React.useState(false);
  const [body, setBody] = React.useState("");
  const [attachments, setAttachments] = React.useState<Attachment[]>([]);

  const isUpvoted = node.upvotedBy.includes(currentUser);
  const [from, to] = gradientForName(node.authorName);
  const hasChildren = node.children.length > 0;

  async function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const files = imageFilesFromClipboard(e);
    if (files.length === 0) return;
    e.preventDefault();
    const added = await filesToAttachments(files);
    setAttachments((prev) => [...prev, ...added]);
  }

  function submitReply() {
    const trimmed = body.trim();
    if (!trimmed) return;
    onReply(node.id, trimmed, attachments);
    setBody("");
    setAttachments([]);
    setIsReplying(false);
  }

  return (
    <div className="relative flex gap-3">
      {/* Thread rail: the line is absolutely positioned against this wrapper (position:relative),
          anchored top-6 (avatar height) to bottom-0. CSS guarantees an absolutely positioned box
          with both top and bottom set spans exactly that distance — no dependency on flex `stretch`
          propagating correctly through recursively nested containers, which is what silently broke
          before. It always reaches exactly to the bottom of this node's rendered subtree, however
          deep, because "bottom" is the wrapper's actual bottom, children included. */}
      {hasChildren && !collapsed && (
        <div
          className="absolute top-6 bottom-0 left-3 w-px -translate-x-1/2 bg-border"
          aria-hidden="true"
        />
      )}

      <div className="relative z-10 shrink-0">
        <Avatar size="sm">
          <AvatarImage src={avatarUrlForName(node.authorName)} alt={node.authorName} />
          <AvatarFallback
            className="text-[11px] font-medium text-white"
            style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
          >
            {getInitials(node.authorName)}
          </AvatarFallback>
        </Avatar>
        {hasChildren && (
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand replies" : "Collapse replies"}
            className="absolute top-6 left-3 z-10 flex size-3.5 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
          >
            {collapsed ? <Plus className="size-2.5" /> : <Minus className="size-2.5" />}
          </button>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-foreground">{node.authorName}</span>
          <span className="text-xs text-muted-foreground">· {node.authorFlat}</span>
          <span className="text-xs text-muted-foreground">
            · {formatRelativeTime(node.postedAt)}
          </span>
          {hasChildren && collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="cursor-pointer text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {countDescendants(node) + 1} repl{countDescendants(node) + 1 === 1 ? "y" : "ies"}{" "}
              hidden
            </button>
          )}
        </div>

        {!collapsed && (
          <>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {node.body}
            </p>
            {node.attachments && node.attachments.length > 0 && (
              <AttachmentList attachments={node.attachments} />
            )}
            <div className="flex items-center gap-1 pt-0.5">
              <Button
                size="sm"
                variant={isUpvoted ? "secondary" : "ghost"}
                className="h-7 gap-1 px-2 text-xs"
                onClick={() => onUpvote(node.id)}
              >
                <ArrowUp className="size-3" />
                {node.upvotedBy.length > 0 ? node.upvotedBy.length : "Upvote"}
              </Button>
              {canReply && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 gap-1 px-2 text-xs text-muted-foreground"
                  onClick={() => setIsReplying((r) => !r)}
                >
                  <MessageSquare className="size-3" />
                  Reply
                </Button>
              )}
            </div>

            {isReplying && (
              <div className="mt-1 flex flex-col gap-2 rounded-md border border-border p-3">
                <Textarea
                  autoFocus
                  placeholder={`Reply to ${node.authorName}… (you can paste an image directly)`}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  onPaste={handlePaste}
                  rows={2}
                  className="resize-none"
                />
                <InlineAttachments value={attachments} onChange={setAttachments} />
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsReplying(false);
                      setBody("");
                      setAttachments([]);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={submitReply} disabled={!body.trim()}>
                    Reply
                  </Button>
                </div>
              </div>
            )}

            {hasChildren && (
              <div className="mt-2 flex flex-col gap-3">
                {node.children.map((child) => (
                  <ReplyNodeItem
                    key={child.id}
                    node={child}
                    currentUser={currentUser}
                    canReply={canReply}
                    onUpvote={onUpvote}
                    onReply={onReply}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

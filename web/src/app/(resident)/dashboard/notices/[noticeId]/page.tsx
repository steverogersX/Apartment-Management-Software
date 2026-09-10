"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  Pencil,
  Search,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { boardNotices, getNoticeById } from "@/lib/noticesMockData";
import { residents } from "@/lib/residentsMockData";
import { useAuth } from "@/hooks/useAuth";
import { avatarUrlForName, getInitials, gradientForName } from "@/lib/utils";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
}

export default function NoticeDetailPage() {
  const params = useParams<{ noticeId: string }>();
  const router = useRouter();
  const { has } = useAuth();
  const notice = getNoticeById(params.noticeId);
  const [localNotice, setLocalNotice] = React.useState(notice);
  const [query, setQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("viewed");

  React.useEffect(() => {
    setLocalNotice(getNoticeById(params.noticeId) ?? null);
  }, [params.noticeId]);

  if (!localNotice) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 py-16 text-center">
        <p className="text-sm text-muted-foreground">Notice not found.</p>
        <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/notices")}>
          Back to notices
        </Button>
      </div>
    );
  }

  const n = localNotice;
  const canEdit = has("NoticesPost");
  const currentUser = "Arvind Deshmukh";
  const isAcknowledged = n.acknowledgedBy.includes(currentUser);

  const recipients = React.useMemo(() => {
    const audience = n.audience;
    if (audience.scope === "All") return residents;
    if (audience.scope === "Blocks")
      return residents.filter((r) => audience.blocks.includes(r.tower));
    return residents.filter((r) => audience.flats.includes(`${r.tower}-${r.flatNumber}`));
  }, [n.audience]);

  const viewed = React.useMemo(() => {
    return recipients
      .map((r) => {
        const receipt = n.readBy.find((x) => x.name === r.name);
        return receipt ? { resident: r, viewedAt: receipt.viewedAt } : null;
      })
      .filter((x): x is { resident: (typeof recipients)[number]; viewedAt: string } => x !== null)
      .sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime());
  }, [recipients, n.readBy]);
  const notViewed = React.useMemo(
    () => recipients.filter((r) => !n.readBy.some((x) => x.name === r.name)),
    [recipients, n.readBy],
  );

  const filteredViewed = React.useMemo(() => {
    if (!query) return viewed;
    const q = query.toLowerCase();
    return viewed.filter((v) => v.resident.name.toLowerCase().includes(q));
  }, [viewed, query]);

  const filteredNotViewed = React.useMemo(() => {
    if (!query) return notViewed;
    const q = query.toLowerCase();
    return notViewed.filter((r) => r.name.toLowerCase().includes(q));
  }, [notViewed, query]);

  const total = recipients.length;
  const viewedCount = viewed.length;

  function handleAcknowledge() {
    if (isAcknowledged) return;
    const alreadyRead = n.readBy.some((r) => r.name === currentUser);
    const receipt = { name: currentUser, viewedAt: new Date().toISOString() };
    setLocalNotice((prev) =>
      prev
        ? {
            ...prev,
            acknowledgedBy: [...prev.acknowledgedBy, currentUser],
            readBy: alreadyRead ? prev.readBy : [...prev.readBy, receipt],
          }
        : prev,
    );
    const idx = boardNotices.findIndex((x) => x.id === n.id);
    if (idx !== -1) {
      if (!boardNotices[idx].acknowledgedBy.includes(currentUser))
        boardNotices[idx].acknowledgedBy.push(currentUser);
      if (!boardNotices[idx].readBy.some((r) => r.name === currentUser))
        boardNotices[idx].readBy.push(receipt);
    }
  }

  const audienceLabel =
    n.audience.scope === "All"
      ? "All residents"
      : n.audience.scope === "Blocks"
        ? `Blocks: ${n.audience.blocks.join(", ")}`
        : `Flats: ${n.audience.flats.join(", ")}`;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <Link
        href="/dashboard/notices"
        className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to notices
      </Link>

      <Card className="overflow-hidden">
        {n.coverImage && (
          <div className="h-48 w-full overflow-hidden sm:h-64">
            <img src={n.coverImage} alt="" className="h-full w-full object-cover" />
          </div>
        )}
        <CardHeader className="flex flex-col gap-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={
                  n.category === "Security Alert" || n.category === "AGM"
                    ? "default"
                    : n.category === "Maintenance" || n.category === "Shutdown"
                      ? "secondary"
                      : "outline"
                }
              >
                {n.category}
              </Badge>
              <Badge
                variant={n.priority === "flash" ? "destructive" : "outline"}
                className="capitalize"
              >
                {n.priority === "flash" ? "Flash alert" : "Normal"}
              </Badge>
              {n.requiresAcknowledge && (
                <Badge variant="outline" className="gap-1">
                  <Eye className="size-3" /> Requires acknowledgement
                </Badge>
              )}
            </div>
            {canEdit && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                render={<Link href={`/dashboard/notices/${n.id}/edit`} />}
              >
                <Pencil className="size-3.5" />
                Edit
              </Button>
            )}
          </div>
          <CardTitle className="text-xl leading-tight">{n.title}</CardTitle>
          {n.tags && n.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {n.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>{n.postedBy}</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3.5" />
              {formatDateTime(n.postedAt)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="size-3.5" />
              {audienceLabel}
            </span>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {n.description}
          </p>

          {(n.scheduleAt || n.expiryAt) && (
            <div className="flex flex-wrap gap-4 rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              {n.scheduleAt && <span>Scheduled: {formatDateTime(n.scheduleAt)}</span>}
              {n.expiryAt && <span>Expires: {formatDateTime(n.expiryAt)}</span>}
            </div>
          )}

          {n.attachments && n.attachments.length > 0 && (
            <div className="flex flex-col gap-2.5">
              {n.attachments.map((attachment) => (
                <div
                  key={attachment.name}
                  className="flex items-center justify-between rounded-md border border-border p-3"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-md bg-muted">
                      {attachment.type === "pdf" ? (
                        <FileText className="size-4" />
                      ) : (
                        <ImageIcon className="size-4" />
                      )}
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
                    className="gap-1.5"
                    render={<a href={attachment.url} download={attachment.name} />}
                  >
                    <Download className="size-3.5" />
                    Download
                  </Button>
                </div>
              ))}
              {n.attachments
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
          )}

          {n.requiresAcknowledge && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="gap-1.5"
                disabled={isAcknowledged}
                onClick={handleAcknowledge}
              >
                {isAcknowledged ? "Acknowledged" : "Acknowledge"}
              </Button>
              {isAcknowledged && (
                <span className="text-xs text-muted-foreground">
                  You have acknowledged this notice.
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-base">Read receipts</CardTitle>
          <span className="text-xs text-muted-foreground">
            {total === 0 ? "No recipients" : `${Math.round((viewedCount / total) * 100)}% viewed`}
          </span>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-foreground transition-all"
              style={{ width: `${total === 0 ? 0 : Math.round((viewedCount / total) * 100)}%` }}
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <TabsList variant="line">
                <TabsTrigger value="viewed" className="gap-1.5">
                  Viewed
                  <Badge variant="secondary" className="px-1.5 text-[10px]">
                    {viewed.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="not-viewed" className="gap-1.5">
                  Not viewed
                  <Badge variant="secondary" className="px-1.5 text-[10px]">
                    {notViewed.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-8 w-48 pl-8"
                />
              </div>
            </div>
            <TabsContent value="viewed" className="mt-3">
              <div className="max-h-72 overflow-y-auto rounded-md border border-border">
                {filteredViewed.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground">No matches.</div>
                ) : (
                  <div className="divide-y divide-border">
                    {filteredViewed.map(({ resident: r, viewedAt }) => {
                      const [from, to] = gradientForName(r.name);
                      return (
                        <div key={r.id} className="flex items-center gap-3 px-3 py-2.5">
                          <Avatar size="sm">
                            <AvatarImage src={avatarUrlForName(r.id)} alt={r.name} />
                            <AvatarFallback
                              className="text-[11px] font-medium text-white"
                              style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
                            >
                              {getInitials(r.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate text-sm font-medium text-foreground">
                              {r.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {r.tower}-{r.flatNumber}
                            </span>
                          </div>
                          <span
                            className="shrink-0 text-xs text-muted-foreground"
                            title={formatDateTime(viewedAt)}
                          >
                            {formatRelativeTime(viewedAt)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="not-viewed" className="mt-3">
              <div className="max-h-72 overflow-y-auto rounded-md border border-border">
                {filteredNotViewed.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground">No matches.</div>
                ) : (
                  <div className="divide-y divide-border">
                    {filteredNotViewed.map((r) => {
                      const [from, to] = gradientForName(r.name);
                      return (
                        <div key={r.id} className="flex items-center gap-3 px-3 py-2.5">
                          <Avatar size="sm">
                            <AvatarImage src={avatarUrlForName(r.id)} alt={r.name} />
                            <AvatarFallback
                              className="text-[11px] font-medium text-white"
                              style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
                            >
                              {getInitials(r.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate text-sm font-medium text-foreground">
                              {r.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {r.tower}-{r.flatNumber}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

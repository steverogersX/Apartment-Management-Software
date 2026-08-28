import { NoticesFeed } from "@/components/noticesFeed";

export default function NoticesPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Notices</h1>
        <p className="text-sm text-muted-foreground">Official announcements from the committee.</p>
      </div>
      <NoticesFeed />
    </div>
  );
}

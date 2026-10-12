import { NoticeBoardTable } from "@/components/noticeBoardTable";

export default function NoticesPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Notice Board</h1>
        <p className="text-sm text-muted-foreground">
          Official announcements from the committee — newest first.
        </p>
      </div>
      <NoticeBoardTable />
    </div>
  );
}

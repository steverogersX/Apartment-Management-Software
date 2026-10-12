import Link from "next/link";

export function PermissionDenied({
  message,
  backHref = "/dashboard",
  backLabel = "Back to dashboard",
}: {
  message: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 py-16 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      <Link href={backHref} className="text-sm font-medium text-foreground underline">
        {backLabel}
      </Link>
    </div>
  );
}

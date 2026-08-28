import { cn, gradientForName } from "@/lib/utils";

export function SocietyLogo({
  name,
  initials,
  src,
  className,
}: {
  name: string;
  initials: string;
  src?: string | null;
  className?: string;
}) {
  if (src) {
    return (
      <span className={cn("flex shrink-0 overflow-hidden rounded-full", className)}>
        <img src={src} alt={`${name} logo`} className="size-full object-cover" />
      </span>
    );
  }

  const [from, to] = gradientForName(name);
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        className,
      )}
      style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {initials}
    </span>
  );
}

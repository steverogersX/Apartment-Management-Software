import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

export type IconType = React.ComponentType<{ className?: string }>;

/**
 * Shared header cell for tanstack-table columns. Pass `onClick` + `sorted` to make it
 * clickable and show the sort-direction indicator; omit both for a plain label.
 */
export function DataTableColumnHeader({
  icon: Icon,
  label,
  sorted,
  onClick,
}: {
  icon?: IconType;
  label: string;
  sorted?: false | "asc" | "desc";
  onClick?: () => void;
}) {
  const content = (
    <>
      {Icon && <Icon className="size-3.5 text-muted-foreground/70" />}
      {label}
      {onClick &&
        (sorted === "asc" ? (
          <ArrowUp className="size-3" />
        ) : sorted === "desc" ? (
          <ArrowDown className="size-3" />
        ) : (
          <ChevronsUpDown className="size-3 opacity-50" />
        ))}
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="-ml-1 flex items-center gap-1.5 rounded px-1 py-0.5 font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        {content}
      </button>
    );
  }

  return (
    <span className="flex items-center gap-1.5 font-medium text-muted-foreground">{content}</span>
  );
}

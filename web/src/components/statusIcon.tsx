import {
  Ban,
  Circle,
  CircleAlert,
  CircleCheck,
  CircleDashed,
  CircleDot,
  Clock,
  LogIn,
  LogOut,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

const POSITIVE = "text-emerald-500";
const WAITING = "text-amber-500";
const NEGATIVE = "text-red-500";
const NEUTRAL = "text-zinc-400";
const INFO = "text-blue-500";

const STATUS_ICONS: Record<string, { icon: LucideIcon; tone: string }> = {
  active: { icon: CircleCheck, tone: POSITIVE },
  occupied: { icon: CircleCheck, tone: POSITIVE },
  paid: { icon: CircleCheck, tone: POSITIVE },
  resolved: { icon: CircleCheck, tone: POSITIVE },
  completed: { icon: CircleCheck, tone: POSITIVE },
  pending: { icon: Clock, tone: WAITING },
  invited: { icon: Clock, tone: WAITING },
  pending_approval: { icon: Clock, tone: WAITING },
  in_progress: { icon: Clock, tone: WAITING },
  on_leave: { icon: Clock, tone: WAITING },
  under_repair: { icon: Wrench, tone: WAITING },
  entered: { icon: LogIn, tone: WAITING },
  overdue: { icon: CircleAlert, tone: NEGATIVE },
  due: { icon: CircleAlert, tone: NEGATIVE },
  escalated: { icon: CircleAlert, tone: NEGATIVE },
  blocked: { icon: Ban, tone: NEGATIVE },
  suspended: { icon: Ban, tone: NEGATIVE },
  denied: { icon: Ban, tone: NEGATIVE },
  vacant: { icon: CircleDashed, tone: NEUTRAL },
  retired: { icon: CircleDashed, tone: NEUTRAL },
  expired: { icon: CircleDashed, tone: NEUTRAL },
  moved_out: { icon: LogOut, tone: NEUTRAL },
  open: { icon: CircleDot, tone: INFO },
  expected: { icon: CircleDot, tone: INFO },
};

export function StatusIcon({ status, className }: { status: string; className?: string }) {
  const meta = STATUS_ICONS[status.toLowerCase().replace(/[\s-]+/g, "_")] ?? {
    icon: Circle,
    tone: NEUTRAL,
  };
  const Icon = meta.icon;
  return <Icon aria-hidden="true" className={cn("size-3.5 shrink-0", meta.tone, className)} />;
}

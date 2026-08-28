"use client";

import * as React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy, CalendarDays, Clock, Home, Ticket, UserCheck, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";
import { SocietyLogo } from "@/components/societyLogo";
import { currentFlat, society, type VisitorStatus } from "@/lib/mockData";

const STATUS_DOT: Record<VisitorStatus, string> = {
  expected: "bg-blue-400",
  entered: "bg-amber-400",
  completed: "bg-emerald-400",
  denied: "bg-red-400",
  expired: "bg-zinc-400",
};

const STATUS_LABEL: Record<VisitorStatus, string> = {
  expected: "Expected",
  entered: "Inside",
  completed: "Completed",
  denied: "Denied",
  expired: "Expired",
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

function Detail({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
      <div className="flex min-w-0 flex-col">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground/80">
          {label}
        </span>
        <span
          className={cn("truncate text-[13px] font-medium text-foreground", mono && "font-mono")}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

export type VisitorPassData = {
  name: string;
  date: string;
  time: string;
  code: string;
  status: VisitorStatus;
};

export function VisitorPass({
  name,
  date,
  time,
  code,
  status,
  copyable = false,
}: VisitorPassData & { copyable?: boolean }) {
  const qrValue = `ROOSTER-PASS|${code}|${name}|${date} ${time}|${society.name}`;
  const host = currentFlat.ownerName.split(" ")[0];
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Main stub */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2.5 border-b border-border px-5 py-3.5">
          <SocietyLogo name={society.name} initials={society.initials} className="size-7 text-xs" />
          <div className="min-w-0">
            <div className="truncate text-[13px] font-semibold leading-tight text-foreground">
              {society.name}
            </div>
            <div className="truncate text-[11px] leading-tight text-muted-foreground">
              {society.location}
            </div>
          </div>
          <span className="ml-auto flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[11px] font-medium text-foreground">
            <span className={cn("size-1.5 rounded-full", STATUS_DOT[status])} />
            {STATUS_LABEL[status]}
          </span>
        </div>

        <div className="flex flex-1 flex-col justify-center gap-4 px-5 py-4">
          <div className="flex items-baseline gap-2">
            <UserRound className="size-4 text-muted-foreground" />
            <span className="truncate text-base font-semibold text-foreground">{name}</span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <Detail
              icon={Home}
              label="Visiting"
              value={`Flat ${currentFlat.flatNumber} · ${currentFlat.apartmentName}`}
            />
            <Detail icon={UserCheck} label="Host" value={host} />
            <Detail icon={CalendarDays} label="Date" value={formatDate(date)} />
            <Detail icon={Clock} label="Time" value={formatTime(time)} />
          </div>
        </div>
      </div>

      {/* Perforation */}
      <div className="relative w-0">
        <div className="absolute inset-y-3 left-0 border-l border-dashed border-border" />
        <span className="absolute left-0 top-0 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background" />
        <span className="absolute bottom-0 left-0 size-3.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-background" />
      </div>

      {/* Tear-off stub */}
      <div className="flex w-[148px] shrink-0 flex-col items-center justify-center gap-2.5 bg-foreground px-4 py-5 text-background">
        <div className="rounded-lg bg-white p-2">
          <QRCodeSVG value={qrValue} size={92} level="M" />
        </div>
        {copyable ? (
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-full bg-background/15 px-2 py-1 font-mono text-[11px] font-medium tracking-tight transition-colors hover:bg-background/25"
          >
            {code}
            {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          </button>
        ) : (
          <div className="flex items-center gap-1.5 rounded-full bg-background/15 px-2 py-1 font-mono text-[11px] font-medium tracking-tight">
            <Ticket className="size-3" />
            {code}
          </div>
        )}
        <span className="text-center text-[9px] uppercase tracking-wider text-background/60">
          Scan at gate
        </span>
      </div>
    </div>
  );
}

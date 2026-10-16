"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartColumn, Vote } from "lucide-react";

import { Button } from "@/components/ui/button";

const TABS = [
  { href: "/dashboard/opinion-polls", label: "Opinion polls", icon: ChartColumn },
  { href: "/dashboard/election-polls", label: "Elections", icon: Vote },
];

export function PollsSwitcher() {
  const pathname = usePathname();
  return (
    <div className="flex items-center gap-1 self-start rounded-lg border border-border bg-card p-1">
      {TABS.map((tab) => (
        <Button
          key={tab.href}
          variant={pathname.startsWith(tab.href) ? "secondary" : "ghost"}
          size="sm"
          className="gap-1.5"
          render={<Link href={tab.href} />}
        >
          <tab.icon className="size-3.5" />
          {tab.label}
        </Button>
      ))}
    </div>
  );
}

"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Vercel/Notion-style indeterminate progress bar pinned to the top of the viewport.
 * Fixed positioning means it renders correctly regardless of where it's mounted in the tree.
 */
export function TopLoadingBar({ active }: { active: boolean }) {
  const [width, setWidth] = React.useState(0);
  const [visible, setVisible] = React.useState(false);
  const hideTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (active) {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setVisible(true);
      setWidth(0);
      // Kick off on the next frame so the 0 -> N width change is itself transitioned, not instant.
      requestAnimationFrame(() => requestAnimationFrame(() => setWidth(78)));
    } else {
      setWidth((w) => (w > 0 ? 100 : 0));
      hideTimer.current = setTimeout(() => {
        setVisible(false);
        setWidth(0);
      }, 260);
    }
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [active]);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-[3px] overflow-hidden"
      aria-hidden
    >
      <div
        className={cn(
          "h-full bg-gradient-to-r from-primary/70 via-primary to-primary/70",
          width >= 100
            ? "transition-[width,opacity] duration-200 ease-out opacity-0"
            : "transition-[width] duration-[900ms] ease-out",
        )}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

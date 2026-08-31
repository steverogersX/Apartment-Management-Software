import * as React from "react";

export function staggeredRise(index: number, stepMs = 80) {
  return {
    className: "animate-rise",
    style: { animationDelay: `${index * stepMs}ms` } as React.CSSProperties,
  };
}

export function staggeredChorusEnter(index: number, stepMs = 80) {
  return staggeredRise(index, stepMs);
}

/**
 * Progressively reveals `total` items one at a time (rather than mounting
 * them all up front invisible-until-delay), so nothing reserves layout
 * space before its turn — avoids a "skeleton" flash of empty rows.
 * `key` should change whenever the underlying list changes so the reveal restarts.
 */
export function useStaggeredReveal(key: string, total: number, stepMs = 140) {
  const [revealCount, setRevealCount] = React.useState(0);

  React.useEffect(() => {
    setRevealCount(0);
    if (total === 0) return;
    let cancelled = false;
    let i = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const revealNext = () => {
      if (cancelled) return;
      i += 1;
      setRevealCount(i);
      if (i < total) timers.push(setTimeout(revealNext, stepMs));
    };
    timers.push(setTimeout(revealNext, 0));
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, total]);

  return revealCount;
}

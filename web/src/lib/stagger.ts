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
 * Progressively reveals `total` items one at a time when a list first appears (rather than
 * mounting them all up front invisible-until-delay), so nothing reserves layout space before its
 * turn. It plays once per mount: later changes (filtering, sorting, paging) show rows instantly,
 * so typing in a search box never hides rows that are already on screen.
 */
export function useStaggeredReveal(total: number, stepMs = 40) {
  const [revealCount, setRevealCount] = React.useState(0);
  const [settled, setSettled] = React.useState(false);

  React.useEffect(() => {
    if (settled || total === 0) return;
    let i = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const revealNext = () => {
      i += 1;
      setRevealCount(i);
      if (i < total) timers.push(setTimeout(revealNext, stepMs));
      else setSettled(true);
    };
    timers.push(setTimeout(revealNext, 0));
    return () => timers.forEach(clearTimeout);
  }, [settled, total, stepMs]);

  return settled ? Number.POSITIVE_INFINITY : revealCount;
}

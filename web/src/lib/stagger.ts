import type * as React from "react";

export function staggeredRise(index: number, stepMs = 80) {
  return {
    className: "animate-rise",
    style: { animationDelay: `${index * stepMs}ms` } as React.CSSProperties,
  };
}

export function staggeredChorusEnter(index: number, stepMs = 80) {
  return staggeredRise(index, stepMs);
}

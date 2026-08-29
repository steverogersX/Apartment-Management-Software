// Hand-drawn doodle house — CC0, inspired by Khushmeen's 400+ Doodle Icons
// https://khushmeen.com/icons.html — free for commercial and personal use, no attribution required (CC0).
// Original set licensed CC0; this simplified inline SVG is a matching doodle-style house for flat/home contexts.

import * as React from "react";

export function DoodleHouse({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M4.2 10.6 L12 4.2 L19.8 10.6 V19.2 H14.8 V13.6 C14.8 12.7 14.1 12 13.2 12 H10.8 C9.9 12 9.2 12.7 9.2 13.6 V19.2 H4.2 Z" />
      <path d="M9.2 13.6 H14.8" />
      <path d="M11 9.2 h2" />
      <path d="M12 7.2 v1.4" />
    </svg>
  );
}

"use client";

import * as React from "react";

let snapshot: number | null = null;

function subscribe(callback: () => void) {
  const id = setTimeout(() => {
    snapshot = Date.now();
    callback();
  }, 0);
  return () => clearTimeout(id);
}

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot(): number | null {
  return null;
}

/**
 * Current time, resolved only after mount so server and client never disagree.
 * Subscribes once via useSyncExternalStore (per the recommended fix for
 * react-hooks/set-state-in-effect) rather than calling setState in an effect.
 * The snapshot is cached and only mutated inside subscribe's callback —
 * useSyncExternalStore requires getSnapshot to return a stable value between
 * notifications, so it can't call Date.now() directly.
 */
export function useNow(): number | null {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

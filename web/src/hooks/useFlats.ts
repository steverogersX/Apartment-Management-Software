"use client";

import * as React from "react";
import { mockActiveFlatId, mockFlats, type MockFlat } from "@/lib/accountMockData";

const STORAGE_KEY = "ams.activeFlatId";

export function useFlats() {
  const [activeId, setActiveId] = React.useState<string>(mockActiveFlatId);

  React.useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (stored && mockFlats.some((f) => f.id === stored)) setActiveId(stored);
  }, []);

  React.useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue && mockFlats.some((f) => f.id === e.newValue)) {
        setActiveId(e.newValue);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const switchFlat = React.useCallback((id: string) => {
    if (!mockFlats.some((f) => f.id === id)) return;
    setActiveId(id);
    window.localStorage.setItem(STORAGE_KEY, id);
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY, newValue: id }));
  }, []);

  const activeFlat: MockFlat | null =
    mockFlats.find((f) => f.id === activeId) ?? mockFlats[0] ?? null;

  return { flats: mockFlats, activeFlat, activeId, switchFlat };
}

"use client";

import * as React from "react";

import { useAuth } from "@/hooks/useAuth";
import { getFlatIdForUser, getUserRecordForAuthUser } from "@/lib/currentUserContext";
import { residents } from "@/lib/residentsMockData";

/** Resolves the logged-in user's own flat (nulls when unresolvable, e.g. staff with no resident link). */
export function useCurrentFlat(): { flatId: string | null; flatNumber: string | null } {
  const { user } = useAuth();
  return React.useMemo(() => {
    if (!user) return { flatId: null, flatNumber: null };
    const record = getUserRecordForAuthUser(user.id);
    if (!record?.residentId) return { flatId: null, flatNumber: null };
    const resident = residents.find((r) => r.id === record.residentId);
    if (!resident) return { flatId: null, flatNumber: null };
    return {
      flatId: getFlatIdForUser(record),
      flatNumber: `${resident.tower}-${resident.flatNumber}`,
    };
  }, [user]);
}

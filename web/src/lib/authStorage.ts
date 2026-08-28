import type { SocietyMembership } from "@shared/index";

const TOKEN_KEY = "rooster.token";
const SOCIETIES_KEY = "rooster.societies";
const ACTIVE_SOCIETY_KEY = "rooster.activeSocietyId";

export interface PersistedAuth {
  token: string | null;
  societies: SocietyMembership[];
  activeSocietyId: string | null;
}

export function loadPersistedAuth(): PersistedAuth {
  if (typeof window === "undefined") {
    return { token: null, societies: [], activeSocietyId: null };
  }
  const token = window.localStorage.getItem(TOKEN_KEY);
  const societiesRaw = window.localStorage.getItem(SOCIETIES_KEY);
  const activeSocietyId = window.localStorage.getItem(ACTIVE_SOCIETY_KEY);
  let societies: SocietyMembership[] = [];
  try {
    societies = societiesRaw ? JSON.parse(societiesRaw) : [];
  } catch {
    societies = [];
  }
  return { token, societies, activeSocietyId };
}

export function persistAuth(
  token: string,
  societies: SocietyMembership[],
  activeSocietyId: string | null,
) {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(SOCIETIES_KEY, JSON.stringify(societies));
  if (activeSocietyId) window.localStorage.setItem(ACTIVE_SOCIETY_KEY, activeSocietyId);
}

export function persistActiveSocietyId(societyId: string) {
  window.localStorage.setItem(ACTIVE_SOCIETY_KEY, societyId);
}

export function clearPersistedAuth() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(SOCIETIES_KEY);
  window.localStorage.removeItem(ACTIVE_SOCIETY_KEY);
}

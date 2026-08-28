import type { LoginResponse, MeResponse } from "@shared/index";
import { apiFetch } from "@/lib/apiClient";

export function loginRequest(email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login", { method: "POST", body: { email, password } });
}

export function logoutRequest(token: string): Promise<null> {
  return apiFetch<null>("/auth/logout", { method: "POST", token });
}

function meRequest(token: string, societyToken: string | null): Promise<MeResponse> {
  return apiFetch<MeResponse>("/auth/me", { method: "GET", token, societyToken });
}

// In-flight de-dupe: React's `cache()` only memoizes within a single Server Component render
// pass, which doesn't apply here — every component in this app is a Client Component. If several
// consumers ask for the current user before the first request resolves (e.g. the auth bootstrap
// effect plus a stale-permission refetch firing close together), they all await the same promise
// instead of firing duplicate network calls.
let inFlightMe: { key: string; promise: Promise<MeResponse> } | null = null;

export function getMe(token: string, societyToken: string | null): Promise<MeResponse> {
  const key = `${token}:${societyToken ?? ""}`;
  if (inFlightMe?.key === key) return inFlightMe.promise;

  const promise = meRequest(token, societyToken).finally(() => {
    if (inFlightMe?.key === key) inFlightMe = null;
  });
  inFlightMe = { key, promise };
  return promise;
}

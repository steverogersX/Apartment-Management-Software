import type { LoginResponse, MeResponse } from "@shared/index";
import { mockGetMe, mockLogin, mockLogout } from "@/lib/mockBackend";

export function loginRequest(email: string, password: string): Promise<LoginResponse> {
  return mockLogin(email, password);
}

export function logoutRequest(_token: string): Promise<null> {
  return mockLogout();
}

function meRequest(token: string, societyToken: string | null): Promise<MeResponse> {
  return mockGetMe(token, societyToken);
}

// In-flight de-dupe: React's `cache()` only memoizes within a single Server Component render
// pass, which doesn't apply here — every component in this app is a Client Component. If several
// consumers ask for the current user before the first request resolves (e.g. the auth bootstrap
// effect plus a stale-permission refetch firing close together), they all await the same promise
// instead of firing duplicate lookups.
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

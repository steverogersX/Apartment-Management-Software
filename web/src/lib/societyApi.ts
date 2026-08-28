import type { SocietyResponse } from "@shared/index";
import { apiFetch } from "@/lib/apiClient";

export function getSocietiesRequest(token: string): Promise<SocietyResponse[]> {
  return apiFetch<SocietyResponse[]>("/societies/getSocieties", { method: "GET", token });
}

export function createSocietyRequest(
  token: string,
  name: string,
  adminUserId: string,
): Promise<SocietyResponse> {
  return apiFetch<SocietyResponse>("/societies/createSociety", {
    method: "POST",
    token,
    body: { name, adminUserId },
  });
}

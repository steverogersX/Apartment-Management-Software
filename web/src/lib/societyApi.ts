import type { SocietyResponse } from "@shared/index";
import { mockCreateSociety, mockListSocieties } from "@/lib/mockBackend";

export function getSocietiesRequest(_token: string): Promise<SocietyResponse[]> {
  return mockListSocieties();
}

export function createSocietyRequest(
  _token: string,
  name: string,
  _adminUserId: string,
): Promise<SocietyResponse> {
  return mockCreateSociety(name);
}

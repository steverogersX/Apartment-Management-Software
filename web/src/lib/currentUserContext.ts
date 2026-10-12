import { residents } from "./residentsMockData";
import { users, type UserRecord } from "./usersMockData";

/** Resolves a logged-in AuthUser id to its roster UserRecord (ids/emails are aligned in mockBackend). */
export function getUserRecordForAuthUser(authUserId: string): UserRecord | null {
  return users.find((u) => u.id === authUserId) ?? null;
}

/** Resolves the flat a roster user belongs to via their linked resident record. */
export function getFlatIdForUser(userRecord: UserRecord): string | null {
  if (!userRecord.residentId) return null;
  return residents.find((r) => r.id === userRecord.residentId)?.flatId ?? null;
}

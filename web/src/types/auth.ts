import type { PermissionKey, SocietyMembership } from "@shared/index";

export type AuthUser = {
  id: string;
  email: string | null;
  displayName: string | null;
  isSuperAdmin: boolean;
};

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthState {
  status: AuthStatus;
  token: string | null;
  user: AuthUser | null;
  societies: SocietyMembership[];
  activeSocietyId: string | null;
}

export interface AuthContextValue extends AuthState {
  activeSociety: SocietyMembership | null;
  roles: string[];
  permissions: ReadonlySet<PermissionKey>;
  has: (permission: PermissionKey) => boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  switchSociety: (societyId: string) => void;
  refreshMe: () => Promise<void>;
}

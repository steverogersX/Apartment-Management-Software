import {
  permissionKeysFromNames,
  type LoginResponse,
  type MeResponse,
  type PermissionKey,
  type RoleResponse,
  type SocietyMembership,
  type SocietyResponse,
  type UserResponse,
} from "@shared/index";
import { ApiClientError } from "@/lib/apiClient";

/**
 * Stands in for the real backend everywhere the UI used to call it. Mirrors
 * server/src/db/seed.ts so the demo credentials already handed out keep working.
 * State lives only in memory - a page reload resets it, same as the seed script
 * resetting the database.
 */

export function mockDelay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export class MockApiError extends ApiClientError {}

const ALL_PERMISSION_KEYS = [
  "VisitorApprove",
  "VisitorDeny",
  "VisitorLogEntry",
  "VisitorViewHistory",
  "VisitorOverstayAlert",
  "BillingView",
  "BillingGenerate",
  "BillingApprove",
  "BillingWaive",
  "BillingExport",
  "ComplaintsRaise",
  "ComplaintsAssign",
  "ComplaintsResolve",
  "ComplaintsEscalate",
  "ComplaintsViewAll",
  "ResidentsView",
  "ResidentsAdd",
  "ResidentsRemove",
  "ResidentsUpdate",
  "NoticesPost",
  "NoticesDelete",
  "AmenitiesView",
  "AmenitiesBook",
  "AmenitiesManage",
  "StaffCheckin",
  "StaffCheckout",
  "StaffViewAttendance",
  "StaffManage",
  "RolesView",
  "RolesCreate",
  "RolesUpdate",
  "RolesAssign",
  "RolesRevoke",
  "RolesDelete",
  "SocietySettingsView",
  "SocietySettingsUpdate",
] as const satisfies readonly PermissionKey[];

const SECURITY_GUARD_PERMISSIONS: PermissionKey[] = [
  "VisitorApprove",
  "VisitorDeny",
  "VisitorLogEntry",
  "VisitorViewHistory",
  "VisitorOverstayAlert",
  "StaffCheckin",
  "StaffCheckout",
  "StaffViewAttendance",
];

const RESIDENT_PERMISSIONS: PermissionKey[] = [
  "BillingView",
  "ComplaintsRaise",
  "AmenitiesView",
  "AmenitiesBook",
];

type MockUser = {
  id: string;
  email: string;
  password: string;
  displayName: string;
  isSuperAdmin: boolean;
};

type MockRole = {
  id: string;
  societyId: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: PermissionKey[];
  createdAt: Date;
  updatedAt: Date;
};

type MockSociety = {
  id: string;
  name: string;
  token: string;
  isActive: boolean;
  createdAt: Date;
};

type MockUserRole = { userId: string; roleId: string; societyId: string };

// createUserBodySchema validates roleIds as UUIDs, so every id handed to a component must be a
// real UUID - random ids for entities created at runtime, fixed ones for the seeded demo data.
function uid(): string {
  return crypto.randomUUID();
}

const SOCIETY_GREEN_VALLEY = uid();
const SOCIETY_SUNRISE_HEIGHTS = uid();

const societies: MockSociety[] = [
  {
    id: SOCIETY_GREEN_VALLEY,
    name: "Green Valley Apartments",
    token: "gv-society-token",
    isActive: true,
    createdAt: new Date("2025-01-01T10:00:00+05:30"),
  },
  {
    id: SOCIETY_SUNRISE_HEIGHTS,
    name: "Sunrise Heights",
    token: "sh-society-token",
    isActive: true,
    createdAt: new Date("2025-02-01T10:00:00+05:30"),
  },
];

const roleIds = {
  gvAdmin: uid(),
  gvGuard: uid(),
  gvResident: uid(),
  shAdmin: uid(),
  shGuard: uid(),
  shResident: uid(),
};

const roles: MockRole[] = [
  {
    id: roleIds.gvAdmin,
    societyId: SOCIETY_GREEN_VALLEY,
    name: "Society Admin",
    description: null,
    isSystem: true,
    permissions: [...ALL_PERMISSION_KEYS],
    createdAt: new Date("2025-01-01T10:00:00+05:30"),
    updatedAt: new Date("2025-01-01T10:00:00+05:30"),
  },
  {
    id: roleIds.gvGuard,
    societyId: SOCIETY_GREEN_VALLEY,
    name: "Security Guard",
    description: null,
    isSystem: true,
    permissions: SECURITY_GUARD_PERMISSIONS,
    createdAt: new Date("2025-01-01T10:00:00+05:30"),
    updatedAt: new Date("2025-01-01T10:00:00+05:30"),
  },
  {
    id: roleIds.gvResident,
    societyId: SOCIETY_GREEN_VALLEY,
    name: "Resident",
    description: null,
    isSystem: true,
    permissions: RESIDENT_PERMISSIONS,
    createdAt: new Date("2025-01-01T10:00:00+05:30"),
    updatedAt: new Date("2025-01-01T10:00:00+05:30"),
  },
  {
    id: roleIds.shAdmin,
    societyId: SOCIETY_SUNRISE_HEIGHTS,
    name: "Society Admin",
    description: null,
    isSystem: true,
    permissions: [...ALL_PERMISSION_KEYS],
    createdAt: new Date("2025-02-01T10:00:00+05:30"),
    updatedAt: new Date("2025-02-01T10:00:00+05:30"),
  },
  {
    id: roleIds.shGuard,
    societyId: SOCIETY_SUNRISE_HEIGHTS,
    name: "Security Guard",
    description: null,
    isSystem: true,
    permissions: SECURITY_GUARD_PERMISSIONS,
    createdAt: new Date("2025-02-01T10:00:00+05:30"),
    updatedAt: new Date("2025-02-01T10:00:00+05:30"),
  },
  {
    id: roleIds.shResident,
    societyId: SOCIETY_SUNRISE_HEIGHTS,
    name: "Resident",
    description: null,
    isSystem: true,
    permissions: RESIDENT_PERMISSIONS,
    createdAt: new Date("2025-02-01T10:00:00+05:30"),
    updatedAt: new Date("2025-02-01T10:00:00+05:30"),
  },
];

const users: MockUser[] = [
  {
    id: "user-super-admin",
    email: "admin@ams.local",
    password: "Admin@123",
    displayName: "Super Admin",
    isSuperAdmin: true,
  },
  {
    id: "user-gv-admin",
    email: "admin@greenvalley.com",
    password: "Admin@123",
    displayName: "Ravi Kumar",
    isSuperAdmin: false,
  },
  {
    id: "user-gv-guard",
    email: "guard@greenvalley.com",
    password: "Guard@123",
    displayName: "Suresh Singh",
    isSuperAdmin: false,
  },
  {
    id: "user-gv-resident",
    email: "resident@greenvalley.com",
    password: "Resident@123",
    displayName: "Priya Sharma",
    isSuperAdmin: false,
  },
  {
    id: "user-sh-admin",
    email: "admin@sunriseheights.com",
    password: "Admin@123",
    displayName: "Arjun Mehta",
    isSuperAdmin: false,
  },
  {
    id: "user-sh-guard",
    email: "guard@sunriseheights.com",
    password: "Guard@123",
    displayName: "Vikram Patil",
    isSuperAdmin: false,
  },
  {
    id: "user-sh-resident",
    email: "resident@sunriseheights.com",
    password: "Resident@123",
    displayName: "Anjali Nair",
    isSuperAdmin: false,
  },
];

const userRoles: MockUserRole[] = [
  { userId: "user-gv-admin", roleId: roleIds.gvAdmin, societyId: SOCIETY_GREEN_VALLEY },
  { userId: "user-gv-guard", roleId: roleIds.gvGuard, societyId: SOCIETY_GREEN_VALLEY },
  { userId: "user-gv-resident", roleId: roleIds.gvResident, societyId: SOCIETY_GREEN_VALLEY },
  { userId: "user-sh-admin", roleId: roleIds.shAdmin, societyId: SOCIETY_SUNRISE_HEIGHTS },
  { userId: "user-sh-guard", roleId: roleIds.shGuard, societyId: SOCIETY_SUNRISE_HEIGHTS },
  { userId: "user-sh-resident", roleId: roleIds.shResident, societyId: SOCIETY_SUNRISE_HEIGHTS },
];

const TOKEN_PREFIX = "mock-token";

function tokenFor(userId: string): string {
  return `${TOKEN_PREFIX}.${userId}`;
}

function userIdFromToken(token: string): string | null {
  if (!token.startsWith(`${TOKEN_PREFIX}.`)) return null;
  return token.slice(TOKEN_PREFIX.length + 1);
}

function findUser(id: string): MockUser | undefined {
  return users.find((u) => u.id === id);
}

function membershipFor(userId: string): SocietyMembership[] {
  const bySociety = new Map<string, MockUserRole[]>();
  for (const ur of userRoles.filter((r) => r.userId === userId)) {
    (bySociety.get(ur.societyId) ?? bySociety.set(ur.societyId, []).get(ur.societyId)!).push(ur);
  }

  return Array.from(bySociety.entries()).map(([societyId, assignments]) => {
    const society = societies.find((s) => s.id === societyId)!;
    const assignedRoles = assignments.map((a) => roles.find((r) => r.id === a.roleId)!);
    const permissions = Array.from(new Set(assignedRoles.flatMap((r) => r.permissions)));
    return {
      societyId: society.id,
      societyName: society.name,
      societyToken: society.token,
      roles: assignedRoles.map((r) => r.name),
      permissions,
    };
  });
}

function toUserResponse(user: MockUser, roleIds: string[]): UserResponse {
  return {
    id: user.id,
    email: user.email,
    phone: null,
    displayName: user.displayName,
    isActive: true,
    roleIds,
    createdAt: new Date(),
  };
}

// -- Auth --------------------------------------------------------------------

export function mockLogin(email: string, password: string): Promise<LoginResponse> {
  const user = users.find((u) => u.email === email);
  if (!user || user.password !== password) {
    return Promise.reject(new MockApiError("Invalid email or password", 401));
  }
  return mockDelay({
    token: tokenFor(user.id),
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      isSuperAdmin: user.isSuperAdmin,
    },
    societies: membershipFor(user.id),
  });
}

export function mockLogout(): Promise<null> {
  return mockDelay(null, 100);
}

export function mockGetMe(token: string, societyToken: string | null): Promise<MeResponse> {
  const userId = userIdFromToken(token);
  const user = userId ? findUser(userId) : undefined;
  if (!user) return Promise.reject(new MockApiError("Session expired", 401));

  const memberships = membershipFor(user.id);
  const active = memberships.find((m) => m.societyToken === societyToken) ?? memberships[0] ?? null;

  return mockDelay({
    id: user.id,
    email: user.email,
    phone: null,
    displayName: user.displayName,
    isSuperAdmin: user.isSuperAdmin,
    isActive: true,
    createdAt: new Date("2025-01-01T10:00:00+05:30"),
    updatedAt: new Date(),
    societyId: active?.societyId ?? null,
    roles: active?.roles ?? [],
    permissions: active?.permissions ?? [],
  });
}

// -- Roles -------------------------------------------------------------------

export interface MockRoleInput {
  name: string;
  description?: string;
  permissions: string[];
}

function memberCount(roleId: string): number {
  return userRoles.filter((ur) => ur.roleId === roleId).length;
}

function toRoleResponse(role: MockRole): RoleResponse {
  return {
    id: role.id,
    societyId: role.societyId,
    name: role.name,
    description: role.description,
    isSystem: role.isSystem,
    permissions: role.permissions,
    memberCount: memberCount(role.id),
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  };
}

export function mockListRoles(societyId: string): Promise<RoleResponse[]> {
  return mockDelay(roles.filter((r) => r.societyId === societyId).map(toRoleResponse));
}

export function mockGetRole(societyId: string, roleId: string): Promise<RoleResponse> {
  const role = roles.find((r) => r.id === roleId && r.societyId === societyId);
  if (!role) return Promise.reject(new MockApiError("Role not found", 404));
  return mockDelay(toRoleResponse(role));
}

export function mockCreateRole(societyId: string, data: MockRoleInput): Promise<RoleResponse> {
  const role: MockRole = {
    id: uid(),
    societyId,
    name: data.name,
    description: data.description ?? null,
    isSystem: false,
    permissions: permissionKeysFromNames(data.permissions),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  roles.push(role);
  return mockDelay(toRoleResponse(role));
}

export function mockUpdateRole(
  societyId: string,
  roleId: string,
  data: MockRoleInput,
): Promise<RoleResponse> {
  const role = roles.find((r) => r.id === roleId && r.societyId === societyId);
  if (!role) return Promise.reject(new MockApiError("Role not found", 404));
  role.name = data.name;
  role.description = data.description ?? null;
  role.permissions = permissionKeysFromNames(data.permissions);
  role.updatedAt = new Date();
  return mockDelay(toRoleResponse(role));
}

export function mockDeleteRole(societyId: string, roleId: string): Promise<null> {
  const index = roles.findIndex((r) => r.id === roleId && r.societyId === societyId);
  if (index === -1) return Promise.reject(new MockApiError("Role not found", 404));
  roles.splice(index, 1);
  return mockDelay(null);
}

// -- Users -------------------------------------------------------------------

export interface MockCreateUserInput {
  name: string;
  email: string;
  roleIds: string[];
}

export function mockCreateUser(
  societyId: string,
  data: MockCreateUserInput,
): Promise<UserResponse> {
  const user: MockUser = {
    id: uid(),
    email: data.email,
    password: "",
    displayName: data.name,
    isSuperAdmin: false,
  };
  users.push(user);
  for (const roleId of data.roleIds) {
    userRoles.push({ userId: user.id, roleId, societyId });
  }
  return mockDelay(toUserResponse(user, data.roleIds));
}

export function mockEditUser(
  userId: string,
  data: Partial<MockCreateUserInput>,
): Promise<UserResponse> {
  const user = findUser(userId);
  if (!user) return Promise.reject(new MockApiError("User not found", 404));
  if (data.name) user.displayName = data.name;
  if (data.email) user.email = data.email;
  const roleIds = userRoles.filter((ur) => ur.userId === userId).map((ur) => ur.roleId);
  return mockDelay(toUserResponse(user, data.roleIds ?? roleIds));
}

// -- Societies (platform) ------------------------------------------------

function toSocietyResponse(society: MockSociety): SocietyResponse {
  return {
    id: society.id,
    name: society.name,
    token: society.token,
    isActive: society.isActive,
    createdAt: society.createdAt,
  };
}

export function mockListSocieties(): Promise<SocietyResponse[]> {
  return mockDelay(societies.map(toSocietyResponse));
}

export function mockCreateSociety(name: string): Promise<SocietyResponse> {
  const society: MockSociety = {
    id: uid(),
    name,
    token: uid(),
    isActive: true,
    createdAt: new Date(),
  };
  societies.push(society);
  return mockDelay(toSocietyResponse(society));
}

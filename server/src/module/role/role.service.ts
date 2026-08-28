import { eq, and, inArray } from 'drizzle-orm';
import { db } from '@/db/client';
import { roles, rolePermissions, userRoles } from '@/db/schema';
import { ApiError } from '@/utils/ApiError';
import { isValidPermission, permissionKeysFromNames } from '@shared/index';
import type { RoleResponse } from '@shared/index';

interface RoleInput {
  name: string;
  description?: string;
  permissions: string[];
}

class RoleService {
  async listRoles(societyId: string): Promise<RoleResponse[]> {
    const roleRows = await db.select().from(roles).where(eq(roles.societyId, societyId));
    if (roleRows.length === 0) return [];

    const roleIds = roleRows.map((r) => r.id);

    const [permRows, memberRows] = await Promise.all([
      db
        .select({ roleId: rolePermissions.roleId, permission: rolePermissions.permission })
        .from(rolePermissions)
        .where(inArray(rolePermissions.roleId, roleIds)),
      db
        .select({ roleId: userRoles.roleId })
        .from(userRoles)
        .where(inArray(userRoles.roleId, roleIds)),
    ]);

    const permsByRole = new Map<string, string[]>();
    for (const row of permRows) {
      const list = permsByRole.get(row.roleId);
      if (list) list.push(row.permission);
      else permsByRole.set(row.roleId, [row.permission]);
    }

    const memberCountByRole = new Map<string, number>();
    for (const row of memberRows) {
      memberCountByRole.set(row.roleId, (memberCountByRole.get(row.roleId) ?? 0) + 1);
    }

    return roleRows.map((role) => ({
      ...role,
      permissions: permissionKeysFromNames(permsByRole.get(role.id) ?? []),
      memberCount: memberCountByRole.get(role.id) ?? 0,
    }));
  }

  async getRole(societyId: string, roleId: string): Promise<RoleResponse> {
    const role = await this.requireRole(societyId, roleId);

    const [permRows, memberCount] = await Promise.all([
      db
        .select({ permission: rolePermissions.permission })
        .from(rolePermissions)
        .where(eq(rolePermissions.roleId, roleId)),
      this.countMembers(roleId),
    ]);

    return {
      ...role,
      permissions: permissionKeysFromNames(permRows.map((p) => p.permission)),
      memberCount,
    };
  }

  async createRole(
    societyId: string,
    requesterPermissions: ReadonlySet<string>,
    data: RoleInput,
  ): Promise<RoleResponse> {
    this.assertGrantable(data.permissions, requesterPermissions);
    await this.assertNameAvailable(societyId, data.name);

    const role = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(roles)
        .values({ societyId, name: data.name, description: data.description ?? null })
        .returning();

      await tx
        .insert(rolePermissions)
        .values(data.permissions.map((permission) => ({ roleId: created.id, permission })));

      return created;
    });

    return { ...role, permissions: permissionKeysFromNames(data.permissions), memberCount: 0 };
  }

  async updateRole(
    societyId: string,
    roleId: string,
    requesterPermissions: ReadonlySet<string>,
    data: RoleInput,
  ): Promise<RoleResponse> {
    const role = await this.requireRole(societyId, roleId);
    if (role.isSystem) throw ApiError.forbidden('System roles cannot be edited');

    this.assertGrantable(data.permissions, requesterPermissions);
    if (data.name !== role.name) await this.assertNameAvailable(societyId, data.name);

    const updated = await db.transaction(async (tx) => {
      const [updatedRole] = await tx
        .update(roles)
        .set({ name: data.name, description: data.description ?? null, updatedAt: new Date() })
        .where(eq(roles.id, roleId))
        .returning();

      await tx.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));
      await tx
        .insert(rolePermissions)
        .values(data.permissions.map((permission) => ({ roleId, permission })));

      return updatedRole;
    });

    return {
      ...updated,
      permissions: permissionKeysFromNames(data.permissions),
      memberCount: await this.countMembers(roleId),
    };
  }

  async deleteRole(societyId: string, roleId: string): Promise<void> {
    const role = await this.requireRole(societyId, roleId);
    if (role.isSystem) throw ApiError.forbidden('System roles cannot be deleted');

    await db.delete(roles).where(eq(roles.id, roleId));
  }

  private async countMembers(roleId: string): Promise<number> {
    const rows = await db
      .select({ userId: userRoles.userId })
      .from(userRoles)
      .where(eq(userRoles.roleId, roleId));
    return rows.length;
  }

  private async requireRole(societyId: string, roleId: string) {
    const [role] = await db
      .select()
      .from(roles)
      .where(and(eq(roles.id, roleId), eq(roles.societyId, societyId)))
      .limit(1);

    if (!role) throw ApiError.notFound('Role not found');
    return role;
  }

  private async assertNameAvailable(societyId: string, name: string) {
    const [existing] = await db
      .select({ id: roles.id })
      .from(roles)
      .where(and(eq(roles.societyId, societyId), eq(roles.name, name)))
      .limit(1);

    if (existing) throw ApiError.conflict('A role with this name already exists');
  }

  private assertGrantable(permissions: string[], requesterPermissions: ReadonlySet<string>) {
    for (const permission of permissions) {
      if (!isValidPermission(permission)) {
        throw ApiError.badRequest(`Invalid permission: ${permission}`);
      }
      if (!requesterPermissions.has(permission)) {
        throw ApiError.forbidden(`Cannot grant a permission you do not hold: ${permission}`);
      }
    }
  }
}

export const roleService = new RoleService();

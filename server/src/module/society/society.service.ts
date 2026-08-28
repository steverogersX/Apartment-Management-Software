import { randomBytes } from 'crypto';
import { eq, and, inArray } from 'drizzle-orm';
import { db } from '@/db/client';
import { societies, roles, rolePermissions, users, userRoles } from '@/db/schema';
import { ApiError } from '@/utils/ApiError';
import { DEFAULT_ROLE_TEMPLATES } from '@/module/rbac/role-template';
import type { SocietyResponse, MemberResponse } from '@shared/index';

class SocietyService {
  async createSociety(name: string, adminUserId: string): Promise<SocietyResponse> {
    const adminUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, adminUserId))
      .limit(1);

    if (!adminUser[0]) throw ApiError.badRequest('Admin user not found');

    return db.transaction(async (tx) => {
      const token = randomBytes(16).toString('hex');

      const [society] = await tx.insert(societies).values({ name, token }).returning();

      for (const template of DEFAULT_ROLE_TEMPLATES) {
        const [role] = await tx
          .insert(roles)
          .values({ societyId: society.id, name: template.name, isSystem: true })
          .returning({ id: roles.id, name: roles.name });

        if (template.permissions.length > 0) {
          await tx
            .insert(rolePermissions)
            .values(template.permissions.map((p) => ({ roleId: role.id, permission: p.name })));
        }

        if (role.name === 'society_admin') {
          await tx.insert(userRoles).values({ userId: adminUserId, roleId: role.id });
        }
      }

      return society;
    });
  }

  async getSocieties(): Promise<SocietyResponse[]> {
    return db
      .select({
        id: societies.id,
        name: societies.name,
        token: societies.token,
        isActive: societies.isActive,
        createdAt: societies.createdAt,
      })
      .from(societies);
  }

  async getSociety(societyId: string): Promise<SocietyResponse> {
    const [society] = await db
      .select({
        id: societies.id,
        name: societies.name,
        token: societies.token,
        isActive: societies.isActive,
        createdAt: societies.createdAt,
        updatedAt: societies.updatedAt,
      })
      .from(societies)
      .where(eq(societies.id, societyId))
      .limit(1);

    if (!society) throw ApiError.notFound('Society not found');
    return society;
  }

  async getMembers(societyId: string): Promise<MemberResponse[]> {
    await this.getSociety(societyId);

    return db
      .select({
        userId: users.id,
        email: users.email,
        displayName: users.displayName,
        roleId: roles.id,
        roleName: roles.name,
        assignedAt: userRoles.assignedAt,
      })
      .from(userRoles)
      .innerJoin(roles, eq(roles.id, userRoles.roleId))
      .innerJoin(users, eq(users.id, userRoles.userId))
      .where(eq(roles.societyId, societyId));
  }

  async assignMember(societyId: string, userId: string, roleId: string) {
    const [role] = await db
      .select({ id: roles.id })
      .from(roles)
      .where(and(eq(roles.id, roleId), eq(roles.societyId, societyId)))
      .limit(1);

    if (!role) throw ApiError.notFound('Role not found in this society');

    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) throw ApiError.notFound('User not found');

    await db.insert(userRoles).values({ userId, roleId }).onConflictDoNothing();
  }

  async removeMember(societyId: string, userId: string) {
    const societyRoleIds = db
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.societyId, societyId));

    await db
      .delete(userRoles)
      .where(and(eq(userRoles.userId, userId), inArray(userRoles.roleId, societyRoleIds)));
  }
}

export const societyService = new SocietyService();

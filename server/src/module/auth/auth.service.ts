import { createHash, randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { eq, and, gt, isNull } from 'drizzle-orm';
import { db } from '@/db/client';
import { users, sessions, societies, roles, rolePermissions, userRoles } from '@/db/schema';
import { config } from '@/config';
import { ApiError } from '@/utils/ApiError';
import { permissionKeysFromNames } from '@shared/index';
import type { LoginResponse, MeResponse, RegisterResponse, SocietyMembership } from '@shared/index';
import type { RequestContext } from './auth.types';

const scryptAsync = promisify(scrypt);

const SCRYPT_KEY_LEN = 64;

async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = (await scryptAsync(plain, salt, SCRYPT_KEY_LEN)) as Buffer;
  return `${salt}:${hash.toString('hex')}`;
}

async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  const [salt, storedHash] = stored.split(':');
  const storedBuf = Buffer.from(storedHash, 'hex');
  const derivedBuf = (await scryptAsync(plain, salt, SCRYPT_KEY_LEN)) as Buffer;
  return timingSafeEqual(storedBuf, derivedBuf);
}

function generateToken(): string {
  return randomBytes(32).toString('hex');
}

function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

class AuthService {
  async register(email: string, password: string, displayName: string): Promise<RegisterResponse> {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing) throw ApiError.conflict('Email already registered');

    const passwordHash = await hashPassword(password);

    const [user] = await db.insert(users).values({ email, passwordHash, displayName }).returning({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      createdAt: users.createdAt,
    });

    return user;
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        isSuperAdmin: users.isSuperAdmin,
        passwordHash: users.passwordHash,
        isActive: users.isActive,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user || !user.passwordHash) throw ApiError.unauthorized('Invalid credentials');
    if (!user.isActive) throw ApiError.unauthorized('Account is inactive');

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) throw ApiError.unauthorized('Invalid credentials');

    const rawToken = generateToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + config.auth.sessionExpiresInDays * 24 * 60 * 60 * 1000);

    const [membershipsRaw, _session] = await Promise.all([
      db
        .select({
          societyId: societies.id,
          societyName: societies.name,
          societyToken: societies.token,
          roleName: roles.name,
        })
        .from(userRoles)
        .innerJoin(roles, eq(roles.id, userRoles.roleId))
        .innerJoin(societies, eq(societies.id, roles.societyId))
        .where(and(eq(userRoles.userId, user.id), eq(societies.isActive, true))),
      db.insert(sessions).values({ tokenHash, userId: user.id, expiresAt }),
    ]);

    const societyMap = new Map<string, SocietyMembership>();
    for (const row of membershipsRaw) {
      const entry = societyMap.get(row.societyId);
      if (entry) {
        entry.roles.push(row.roleName);
      } else {
        societyMap.set(row.societyId, {
          societyId: row.societyId,
          societyName: row.societyName,
          societyToken: row.societyToken,
          roles: [row.roleName],
          permissions: [],
        });
      }
    }

    const societyMemberships = await Promise.all(
      [...societyMap.values()].map(async (membership) => {
        const effective = await this.getEffectivePermissions(user.id, membership.societyId);
        membership.permissions = permissionKeysFromNames(effective);
        return membership;
      }),
    );

    return {
      token: rawToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        isSuperAdmin: user.isSuperAdmin,
      },
      societies: societyMemberships,
    };
  }

  async logout(rawToken: string): Promise<void> {
    const tokenHash = hashToken(rawToken);
    await db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(eq(sessions.tokenHash, tokenHash));
  }

  async resolveSession(rawToken: string): Promise<{ userId: string; isSuperAdmin: boolean }> {
    const tokenHash = hashToken(rawToken);
    const now = new Date();

    const [session] = await db
      .select({ userId: sessions.userId })
      .from(sessions)
      .where(
        and(
          eq(sessions.tokenHash, tokenHash),
          gt(sessions.expiresAt, now),
          isNull(sessions.revokedAt),
        ),
      )
      .limit(1);

    if (!session) throw ApiError.unauthorized('Invalid or expired session');

    const [user] = await db
      .select({ id: users.id, isSuperAdmin: users.isSuperAdmin, isActive: users.isActive })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!user || !user.isActive) throw ApiError.unauthorized('Account is inactive');

    void db.update(sessions).set({ lastUsedAt: now }).where(eq(sessions.tokenHash, tokenHash));

    return { userId: user.id, isSuperAdmin: user.isSuperAdmin };
  }

  async resolveSociety(societyToken: string): Promise<string | null> {
    const [society] = await db
      .select({ id: societies.id })
      .from(societies)
      .where(and(eq(societies.token, societyToken), eq(societies.isActive, true)))
      .limit(1);

    return society?.id ?? null;
  }

  async getEffectivePermissions(userId: string, societyId: string): Promise<ReadonlySet<string>> {
    const rows = await db
      .selectDistinct({ permission: rolePermissions.permission })
      .from(userRoles)
      .innerJoin(roles, eq(roles.id, userRoles.roleId))
      .innerJoin(rolePermissions, eq(rolePermissions.roleId, roles.id))
      .where(and(eq(userRoles.userId, userId), eq(roles.societyId, societyId)));

    return new Set(rows.map((r) => r.permission));
  }

  async getMe(ctx: RequestContext): Promise<MeResponse> {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        phone: users.phone,
        displayName: users.displayName,
        isSuperAdmin: users.isSuperAdmin,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, ctx.userId))
      .limit(1);

    if (!user) throw ApiError.notFound('User not found');

    const roleNames = ctx.societyId ? await this.getRoleNames(ctx.userId, ctx.societyId) : [];

    return {
      ...user,
      societyId: ctx.societyId,
      roles: roleNames,
      permissions: permissionKeysFromNames(ctx.permissions),
    };
  }

  private async getRoleNames(userId: string, societyId: string): Promise<string[]> {
    const rows = await db
      .select({ roleName: roles.name })
      .from(userRoles)
      .innerJoin(roles, eq(roles.id, userRoles.roleId))
      .where(and(eq(userRoles.userId, userId), eq(roles.societyId, societyId)));

    return rows.map((r) => r.roleName);
  }
}

export const authService = new AuthService();

import { pgTable, uuid, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';

/**
 * A global user identity, shared across societies. A user's access to any given society is defined
 * entirely by their `user_roles` assignments — there is no membership concept beyond roles.
 *
 * `is_super_admin` marks the platform vendor: the permission resolver short-circuits to allow-all and
 * bypasses society scoping, so it is never represented as a society role.
 *
 * `password_hash` is nullable because real authentication is a later phase; the column exists so the
 * sessions/identity model has somewhere to grow into.
 */
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique(),
  phone: varchar('phone', { length: 20 }).unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  displayName: varchar('display_name', { length: 120 }),
  isSuperAdmin: boolean('is_super_admin').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

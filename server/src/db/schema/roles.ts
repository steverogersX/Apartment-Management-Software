import { pgTable, uuid, varchar, boolean, timestamp, unique, index } from 'drizzle-orm/pg-core';
import { societies } from './societies';

/**
 * A society-scoped role — a named bundle of permissions (RBAC Layer 2).
 *
 * Roles always belong to exactly one society; the same role name in two societies is two distinct
 * rows. `is_system` marks roles seeded from the code-defined default templates. The permissions a role
 * grants live in {@link './role-permissions'.rolePermissions}, not here.
 */
export const roles = pgTable(
  'roles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    societyId: uuid('society_id')
      .notNull()
      .references(() => societies.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 80 }).notNull(),
    description: varchar('description', { length: 255 }),
    isSystem: boolean('is_system').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uqSocietyName: unique('roles_society_id_name_uq').on(t.societyId, t.name),
    ixSociety: index('roles_society_id_ix').on(t.societyId),
  }),
);

import { pgTable, uuid, varchar, primaryKey, index } from 'drizzle-orm/pg-core';
import { roles } from './roles';

/**
 * Which code-defined permissions a role holds.
 *
 * `permission` stores the canonical permission string (e.g. `billing.generate`) from the application's
 * permission registry. Permissions live in code, not the database, so there is deliberately **no**
 * foreign key here — instead the service layer validates each string against `isValidPermission()`
 * before inserting. The `permission` index supports reverse "which roles can do X?" queries.
 */
export const rolePermissions = pgTable(
  'role_permissions',
  {
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    permission: varchar('permission', { length: 80 }).notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.roleId, t.permission] }),
    ixPermission: index('role_permissions_permission_ix').on(t.permission),
  }),
);

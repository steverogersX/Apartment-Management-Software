import { pgTable, uuid, timestamp, primaryKey, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { roles } from './roles';

/**
 * Assignments of roles to users (RBAC Layer 3).
 *
 * A user can hold multiple roles; their effective permissions in a society are the union of all
 * assigned roles in that society. The society is derived through the role (`roles.society_id`) and is
 * intentionally NOT denormalized here, so it can never drift out of sync. `assigned_by` is a nullable
 * audit pointer to whoever granted the role.
 */
export const userRoles = pgTable(
  'user_roles',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    assignedBy: uuid('assigned_by').references(() => users.id, { onDelete: 'set null' }),
    assignedAt: timestamp('assigned_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.roleId] }),
    ixRole: index('user_roles_role_id_ix').on(t.roleId),
  }),
);

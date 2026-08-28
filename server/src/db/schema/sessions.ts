import { pgTable, uuid, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from './users';

/**
 * An authenticated session — proof of identity, resolved server-side on each request.
 *
 * Only the SHA-256 `token_hash` of the session token is stored; the raw token is never persisted, so a
 * database leak cannot be replayed. A session carries identity only: the active society is chosen
 * per-request via the `X-Society-Token` header, never pinned here. `revoked_at` supports logout /
 * invalidation; `last_used_at` supports sliding expiry.
 */
export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tokenHash: varchar('token_hash', { length: 64 }).notNull().unique(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    ixUser: index('sessions_user_id_ix').on(t.userId),
    ixExpiresAt: index('sessions_expires_at_ix').on(t.expiresAt),
  }),
);

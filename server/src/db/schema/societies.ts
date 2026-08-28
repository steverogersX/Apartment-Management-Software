import { pgTable, uuid, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

/**
 * A society (tenant). Every society is fully isolated from the others.
 *
 * `id` is the internal primary key and is never exposed to clients. Following Vendure's channel-token
 * pattern, `token` is the public per-request selector sent in the `X-Society-Token` header — generated
 * once at onboarding and fixed thereafter. It selects context only; it grants nothing on its own.
 */
export const societies = pgTable('societies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 160 }).notNull(),
  token: varchar('token', { length: 64 }).notNull().unique(),
  isActive: boolean('is_active').notNull().default(true),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

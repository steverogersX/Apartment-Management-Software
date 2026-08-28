import { pgTable, uuid, varchar, timestamp, unique, index } from 'drizzle-orm/pg-core';
import { societies } from './societies';

export const apartments = pgTable(
  'apartments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    societyId: uuid('society_id')
      .notNull()
      .references(() => societies.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 80 }).notNull(),
    description: varchar('description', { length: 255 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uqSocietyName: unique('apartments_society_id_name_uq').on(t.societyId, t.name),
    ixSociety: index('apartments_society_id_ix').on(t.societyId),
  }),
);

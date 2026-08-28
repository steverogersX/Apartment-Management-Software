import { pgTable, uuid, varchar, text, timestamp, unique, index } from 'drizzle-orm/pg-core';
import { societies } from './societies';
import { users } from './users';
import { flats } from './flats';

export const complaints = pgTable(
  'complaints',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    societyId: uuid('society_id')
      .notNull()
      .references(() => societies.id, { onDelete: 'cascade' }),
    ticketNumber: varchar('ticket_number', { length: 20 }).notNull(),
    raisedBy: uuid('raised_by').references(() => users.id, { onDelete: 'set null' }),
    assignedTo: uuid('assigned_to').references(() => users.id, { onDelete: 'set null' }),
    title: varchar('title', { length: 160 }).notNull(),
    description: text('description').notNull(),
    category: varchar('category', { length: 50 }).notNull(),
    type: varchar('type', { length: 20 }).notNull(),
    status: varchar('status', { length: 20 }).notNull().default('open'),
    priority: varchar('priority', { length: 20 }),
    flatId: uuid('flat_id').references(() => flats.id, { onDelete: 'set null' }),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uqSocietyTicket: unique('complaints_society_id_ticket_number_uq').on(
      t.societyId,
      t.ticketNumber,
    ),
    ixSociety: index('complaints_society_id_ix').on(t.societyId),
    ixRaisedBy: index('complaints_raised_by_ix').on(t.raisedBy),
    ixAssignedTo: index('complaints_assigned_to_ix').on(t.assignedTo),
    ixStatus: index('complaints_status_ix').on(t.status),
  }),
);

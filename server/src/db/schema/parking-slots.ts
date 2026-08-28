import { pgTable, uuid, varchar, timestamp, unique, index } from 'drizzle-orm/pg-core';
import { societies } from './societies';

/**
 * A physical parking slot belonging to a society. Slots are society-scoped assets, independent
 * of any vehicle — a slot can sit unassigned (no vehicle references it yet).
 */
export const parkingSlots = pgTable(
  'parking_slots',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    societyId: uuid('society_id')
      .notNull()
      .references(() => societies.id, { onDelete: 'cascade' }),
    slotNumber: varchar('slot_number', { length: 20 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uqSocietySlot: unique('parking_slots_society_id_slot_number_uq').on(t.societyId, t.slotNumber),
    ixSociety: index('parking_slots_society_id_ix').on(t.societyId),
  }),
);

import { pgTable, uuid, varchar, timestamp, unique, index } from 'drizzle-orm/pg-core';
import { users } from './users';
import { parkingSlots } from './parking-slots';

/**
 * A vehicle owned by a user. A user can own many vehicles; each vehicle may hold at most one
 * parking slot (`parking_slot_id` is unique so a slot is never double-assigned).
 */
export const vehicles = pgTable(
  'vehicles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    registrationNumber: varchar('registration_number', { length: 20 }).notNull(),
    type: varchar('type', { length: 20 }).notNull(),
    make: varchar('make', { length: 40 }),
    model: varchar('model', { length: 40 }),
    color: varchar('color', { length: 30 }),
    parkingSlotId: uuid('parking_slot_id').references(() => parkingSlots.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uqRegistrationNumber: unique('vehicles_registration_number_uq').on(t.registrationNumber),
    uqParkingSlot: unique('vehicles_parking_slot_id_uq').on(t.parkingSlotId),
    ixUser: index('vehicles_user_id_ix').on(t.userId),
  }),
);

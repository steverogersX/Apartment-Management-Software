import { pgTable, uuid, varchar, integer, timestamp, unique, index } from 'drizzle-orm/pg-core';
import { apartments } from './apartments';
import { users } from './users';

export const flats = pgTable(
  'flats',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    apartmentId: uuid('apartment_id')
      .notNull()
      .references(() => apartments.id, { onDelete: 'cascade' }),
    flatNumber: varchar('flat_number', { length: 20 }).notNull(),
    floor: integer('floor'),
    type: varchar('type', { length: 20 }),
    areaSqft: integer('area_sqft'),
    ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'set null' }),
    tenantId: uuid('tenant_id').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uqApartmentFlat: unique('flats_apartment_id_flat_number_uq').on(t.apartmentId, t.flatNumber),
    ixApartment: index('flats_apartment_id_ix').on(t.apartmentId),
    ixOwner: index('flats_owner_id_ix').on(t.ownerId),
    ixTenant: index('flats_tenant_id_ix').on(t.tenantId),
  }),
);

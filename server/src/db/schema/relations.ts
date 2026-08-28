import { relations } from 'drizzle-orm';
import { societies } from './societies';
import { users } from './users';
import { roles } from './roles';
import { rolePermissions } from './role-permissions';
import { userRoles } from './user-roles';
import { sessions } from './sessions';
import { apartments } from './apartments';
import { flats } from './flats';
import { complaints } from './complaints';
import { parkingSlots } from './parking-slots';
import { vehicles } from './vehicles';

/**
 * Drizzle relation metadata for typed, ergonomic joins (e.g. `db.query.roles.findMany({ with: ... })`).
 * These describe relationships for the query layer only — the actual foreign keys are declared on the
 * table definitions.
 */

export const societiesRelations = relations(societies, ({ one, many }) => ({
  createdBy: one(users, { fields: [societies.createdBy], references: [users.id] }),
  roles: many(roles),
  apartments: many(apartments),
  complaints: many(complaints),
}));

export const usersRelations = relations(users, ({ many }) => ({
  // `user_roles` references `users` twice (the holder and the granter), so each side must be
  // disambiguated with a matching `relationName`.
  userRoles: many(userRoles, { relationName: 'roleHolder' }),
  assignedUserRoles: many(userRoles, { relationName: 'roleGranter' }),
  sessions: many(sessions),
  ownedFlats: many(flats, { relationName: 'ownedFlats' }),
  rentedFlats: many(flats, { relationName: 'rentedFlats' }),
  raisedComplaints: many(complaints, { relationName: 'complaintRaiser' }),
  assignedComplaints: many(complaints, { relationName: 'complaintAssignee' }),
  vehicles: many(vehicles),
}));

export const rolesRelations = relations(roles, ({ one, many }) => ({
  society: one(societies, { fields: [roles.societyId], references: [societies.id] }),
  permissions: many(rolePermissions),
  userRoles: many(userRoles),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, { fields: [rolePermissions.roleId], references: [roles.id] }),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
    relationName: 'roleHolder',
  }),
  role: one(roles, { fields: [userRoles.roleId], references: [roles.id] }),
  assignedByUser: one(users, {
    fields: [userRoles.assignedBy],
    references: [users.id],
    relationName: 'roleGranter',
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const apartmentsRelations = relations(apartments, ({ one, many }) => ({
  society: one(societies, { fields: [apartments.societyId], references: [societies.id] }),
  flats: many(flats),
}));

export const flatsRelations = relations(flats, ({ one, many }) => ({
  apartment: one(apartments, { fields: [flats.apartmentId], references: [apartments.id] }),
  owner: one(users, {
    fields: [flats.ownerId],
    references: [users.id],
    relationName: 'ownedFlats',
  }),
  tenant: one(users, {
    fields: [flats.tenantId],
    references: [users.id],
    relationName: 'rentedFlats',
  }),
  complaints: many(complaints),
}));

export const complaintsRelations = relations(complaints, ({ one }) => ({
  society: one(societies, { fields: [complaints.societyId], references: [societies.id] }),
  raisedBy: one(users, {
    fields: [complaints.raisedBy],
    references: [users.id],
    relationName: 'complaintRaiser',
  }),
  assignedTo: one(users, {
    fields: [complaints.assignedTo],
    references: [users.id],
    relationName: 'complaintAssignee',
  }),
  flat: one(flats, { fields: [complaints.flatId], references: [flats.id] }),
}));

export const parkingSlotsRelations = relations(parkingSlots, ({ one, many }) => ({
  society: one(societies, { fields: [parkingSlots.societyId], references: [societies.id] }),
  vehicle: many(vehicles),
}));

export const vehiclesRelations = relations(vehicles, ({ one }) => ({
  owner: one(users, { fields: [vehicles.userId], references: [users.id] }),
  parkingSlot: one(parkingSlots, {
    fields: [vehicles.parkingSlotId],
    references: [parkingSlots.id],
  }),
}));

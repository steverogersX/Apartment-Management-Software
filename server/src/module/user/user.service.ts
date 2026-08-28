import { eq, and, inArray, notInArray } from 'drizzle-orm';
import { db } from '@/db/client';
import { users, roles, rolePermissions, userRoles, vehicles, parkingSlots } from '@/db/schema';
import { ApiError } from '@/utils/ApiError';
import type { CreateUserBody, EditUserBody, UserResponse, VehicleInput } from '@shared/index';

type Tx = Parameters<Parameters<(typeof db)['transaction']>[0]>[0];

class UserService {
  async createUser(
    societyId: string,
    requesterPermissions: ReadonlySet<string>,
    data: CreateUserBody,
  ): Promise<UserResponse> {
    await this.assertRolesBelongToSociety(societyId, data.roleIds);
    await this.assertRolesGrantable(data.roleIds, requesterPermissions);

    const user = await db.transaction(async (tx) => {
      let [existing] = await tx.select().from(users).where(eq(users.email, data.email)).limit(1);

      if (!existing) {
        [existing] = await tx
          .insert(users)
          .values({
            email: data.email,
            phone: data.phone ?? null,
            displayName: data.name,
          })
          .returning();
      }

      const existingRoleRows = await tx
        .select({ roleId: userRoles.roleId })
        .from(userRoles)
        .where(and(eq(userRoles.userId, existing.id), inArray(userRoles.roleId, data.roleIds)));
      const alreadyAssigned = new Set(existingRoleRows.map((r) => r.roleId));
      const newRoleIds = data.roleIds.filter((id) => !alreadyAssigned.has(id));

      if (newRoleIds.length > 0) {
        await tx
          .insert(userRoles)
          .values(newRoleIds.map((roleId) => ({ userId: existing.id, roleId })));
      }

      await this.syncVehicles(tx, societyId, existing.id, data.vehicles);

      return existing;
    });

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      displayName: user.displayName,
      isActive: user.isActive,
      roleIds: data.roleIds,
      createdAt: user.createdAt,
    };
  }

  async editUser(
    societyId: string,
    userId: string,
    requesterPermissions: ReadonlySet<string>,
    data: EditUserBody,
  ): Promise<UserResponse> {
    await this.assertRolesBelongToSociety(societyId, data.roleIds);
    await this.assertRolesGrantable(data.roleIds, requesterPermissions);

    const societyRoleRows = await db
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.societyId, societyId));
    const societyRoleIds = societyRoleRows.map((r) => r.id);

    const updated = await db.transaction(async (tx) => {
      const [user] = await tx
        .update(users)
        .set({ displayName: data.name, phone: data.phone ?? null, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning();

      if (!user) throw ApiError.notFound('User not found');

      if (societyRoleIds.length > 0) {
        await tx
          .delete(userRoles)
          .where(and(eq(userRoles.userId, userId), inArray(userRoles.roleId, societyRoleIds)));
      }

      if (data.roleIds.length > 0) {
        await tx.insert(userRoles).values(data.roleIds.map((roleId) => ({ userId, roleId })));
      }

      await this.syncVehicles(tx, societyId, userId, data.vehicles);

      return user;
    });

    return {
      id: updated.id,
      email: updated.email,
      phone: updated.phone,
      displayName: updated.displayName,
      isActive: updated.isActive,
      roleIds: data.roleIds,
      createdAt: updated.createdAt,
    };
  }

  private async assertRolesBelongToSociety(societyId: string, roleIds: string[]) {
    const roleRows = await db
      .select({ id: roles.id })
      .from(roles)
      .where(and(eq(roles.societyId, societyId), inArray(roles.id, roleIds)));

    if (roleRows.length !== roleIds.length) {
      throw ApiError.badRequest('One or more roles do not belong to this society');
    }
  }

  private async syncVehicles(
    tx: Tx,
    societyId: string,
    userId: string,
    vehicleInputs: VehicleInput[],
  ) {
    const keepRegistrations = vehicleInputs.map((v) => v.registrationNumber);

    if (keepRegistrations.length > 0) {
      await tx
        .delete(vehicles)
        .where(
          and(
            eq(vehicles.userId, userId),
            notInArray(vehicles.registrationNumber, keepRegistrations),
          ),
        );
    } else {
      await tx.delete(vehicles).where(eq(vehicles.userId, userId));
    }

    for (const vehicleInput of vehicleInputs) {
      const [conflicting] = await tx
        .select({ id: vehicles.id, userId: vehicles.userId })
        .from(vehicles)
        .where(eq(vehicles.registrationNumber, vehicleInput.registrationNumber))
        .limit(1);

      if (conflicting && conflicting.userId !== userId) {
        throw ApiError.conflict(
          `Vehicle ${vehicleInput.registrationNumber} is already registered to another user`,
        );
      }

      const parkingSlotId = await this.resolveParkingSlot(
        tx,
        societyId,
        vehicleInput.parkingSlot,
        conflicting?.id,
      );

      if (conflicting) {
        await tx
          .update(vehicles)
          .set({
            type: vehicleInput.type,
            make: vehicleInput.make ?? null,
            model: vehicleInput.model ?? null,
            color: vehicleInput.color ?? null,
            parkingSlotId,
            updatedAt: new Date(),
          })
          .where(eq(vehicles.id, conflicting.id));
      } else {
        await tx.insert(vehicles).values({
          userId,
          registrationNumber: vehicleInput.registrationNumber,
          type: vehicleInput.type,
          make: vehicleInput.make ?? null,
          model: vehicleInput.model ?? null,
          color: vehicleInput.color ?? null,
          parkingSlotId,
        });
      }
    }
  }

  private async resolveParkingSlot(
    tx: Tx,
    societyId: string,
    slotNumber: string | undefined,
    currentVehicleId: string | undefined,
  ): Promise<string | null> {
    if (!slotNumber) return null;

    let [slot] = await tx
      .select()
      .from(parkingSlots)
      .where(and(eq(parkingSlots.societyId, societyId), eq(parkingSlots.slotNumber, slotNumber)))
      .limit(1);

    if (!slot) {
      [slot] = await tx.insert(parkingSlots).values({ societyId, slotNumber }).returning();
    }

    const [occupant] = await tx
      .select({ id: vehicles.id })
      .from(vehicles)
      .where(eq(vehicles.parkingSlotId, slot.id))
      .limit(1);

    if (occupant && occupant.id !== currentVehicleId) {
      throw ApiError.conflict(`Parking slot ${slotNumber} is already assigned to another vehicle`);
    }

    return slot.id;
  }

  private async assertRolesGrantable(roleIds: string[], requesterPermissions: ReadonlySet<string>) {
    if (roleIds.length === 0) return;

    const permRows = await db
      .select({ permission: rolePermissions.permission })
      .from(rolePermissions)
      .where(inArray(rolePermissions.roleId, roleIds));

    for (const row of permRows) {
      if (!requesterPermissions.has(row.permission)) {
        throw ApiError.forbidden(
          `Cannot assign a role granting a permission you do not hold: ${row.permission}`,
        );
      }
    }
  }
}

export const userService = new UserService();

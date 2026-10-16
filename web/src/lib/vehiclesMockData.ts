import { flats, flatVehicleHistory } from "./flatsMockData";
import { currentFlat } from "./mockData";
import { parkingSlots } from "./parkingMockData";

export type MyVehicleType = "car" | "two_wheeler";
export type StickerStatus = "active" | "pending" | "expired";

export type MyVehicle = {
  id: string;
  registrationNumber: string;
  type: MyVehicleType;
  make: string;
  model: string;
  color: string;
  parkingSlot: string | null;
  stickerStatus: StickerStatus;
  isPrimary: boolean;
};

export type ParkingSlotStatus = "allotted" | "waitlisted";

export type MyParkingSlot = {
  id: string;
  slotNumber: string;
  zone: string;
  slotType: "covered" | "open";
  vehicleType: MyVehicleType;
  status: ParkingSlotStatus;
  vehicleReg: string | null;
  allottedOn: string | null;
};

export type ParkingRequestStatus = "pending" | "approved";

export type ParkingRequest = {
  id: string;
  vehicleReg: string;
  preference: string;
  status: ParkingRequestStatus;
  requestedOn: string;
};

/** The signed-in resident's flat, resolved against the society's flat records. */
export function currentFlatRecord() {
  return (
    flats.find(
      (f) =>
        f.flatNumber === currentFlat.flatNumber && `Tower ${f.tower}` === currentFlat.apartmentName,
    ) ?? null
  );
}

/** The resident's vehicles — the society's vehicle records filtered to their flat. */
export function getMyVehicles(): MyVehicle[] {
  const flat = currentFlatRecord();
  if (!flat) return [];
  return flatVehicleHistory
    .filter((v) => v.flatId === flat.id && v.isCurrent)
    .map((v, index) => ({
      id: `${v.flatId}-${v.registrationNumber}`,
      registrationNumber: v.registrationNumber,
      type: v.type,
      make: v.make,
      model: v.model,
      color: v.color,
      parkingSlot: v.parkingSlot,
      stickerStatus: v.parkingSlot ? "active" : "pending",
      isPrimary: index === 0,
    }));
}

/** Registers a vehicle against the resident's flat in the society's vehicle records. */
export function addMyVehicle(vehicle: MyVehicle) {
  const flat = currentFlatRecord();
  if (!flat) return;
  flatVehicleHistory.push({
    flatId: flat.id,
    residentId: flat.currentResidentIds[0] ?? "",
    registrationNumber: vehicle.registrationNumber,
    type: vehicle.type,
    make: vehicle.make,
    model: vehicle.model,
    color: vehicle.color,
    ownerName: currentFlat.ownerName,
    parkingSlot: vehicle.parkingSlot,
    isCurrent: true,
  });
}

/** The resident's parking slots — the society's slot assignments filtered to their flat. */
export function getMyParkingSlots(): MyParkingSlot[] {
  const flat = currentFlatRecord();
  if (!flat) return [];
  return parkingSlots
    .filter((slot) => slot.allotment?.flatId === flat.id)
    .map((slot) => ({
      id: slot.id,
      slotNumber: slot.slotNumber,
      zone: slot.zone,
      slotType: /basement/i.test(slot.zone) ? ("covered" as const) : ("open" as const),
      vehicleType: slot.bay === "two_wheeler" ? ("two_wheeler" as const) : ("car" as const),
      status: "allotted" as const,
      vehicleReg: slot.vehicles.map((v) => v.reg ?? "Cycle").join(", ") || null,
      allottedOn: slot.allotment?.allottedOn ?? null,
    }));
}

export const parkingRequests: ParkingRequest[] = [
  {
    id: "r-1",
    vehicleReg: "AP 39 MK 7712",
    preference: "Covered · Basement B",
    status: "pending",
    requestedOn: "2026-06-10",
  },
];

export const parkingRules: string[] = [
  "One covered car slot per flat. Second vehicle is waitlisted.",
  "Use only your allotted slot. Vehicles in unassigned slots will be clamped.",
  "Display the gate sticker on the windshield at all times.",
  "Visitor parking is at Gate 2, max 4 hours. Register at the gate.",
];

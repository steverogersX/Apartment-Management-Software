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

export const myVehicles: MyVehicle[] = [
  {
    id: "v-1",
    registrationNumber: "AP 31 BT 4521",
    type: "car",
    make: "Hyundai",
    model: "Creta",
    color: "White",
    parkingSlot: "B-12",
    stickerStatus: "active",
    isPrimary: true,
  },
  {
    id: "v-2",
    registrationNumber: "AP 31 CX 0098",
    type: "two_wheeler",
    make: "Honda",
    model: "Activa",
    color: "Grey",
    parkingSlot: "B-13",
    stickerStatus: "active",
    isPrimary: false,
  },
  {
    id: "v-3",
    registrationNumber: "AP 39 MK 7712",
    type: "car",
    make: "Maruti",
    model: "Baleno",
    color: "Blue",
    parkingSlot: null,
    stickerStatus: "pending",
    isPrimary: false,
  },
];

export const myParkingSlots: MyParkingSlot[] = [
  {
    id: "s-1",
    slotNumber: "B-12",
    zone: "Basement B · Tower B",
    slotType: "covered",
    vehicleType: "car",
    status: "allotted",
    vehicleReg: "AP 31 BT 4521",
    allottedOn: "2025-07-01",
  },
  {
    id: "s-2",
    slotNumber: "B-13",
    zone: "Basement B · Tower B",
    slotType: "open",
    vehicleType: "two_wheeler",
    status: "allotted",
    vehicleReg: "AP 31 CX 0098",
    allottedOn: "2025-07-01",
  },
];

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

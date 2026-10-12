import { z } from "zod";

export type Vendor = {
  id: string;
  name: string;
  category: string;
  contactPerson: string;
  phone: string;
  email: string;
};

export const vendors: Vendor[] = [
  {
    id: "v-1",
    name: "Office Mart",
    category: "Stationery",
    contactPerson: "Rahul Verma",
    phone: "+91 98765 11111",
    email: "rahul@officemart.com",
  },
  {
    id: "v-2",
    name: "CleanPro Supplies",
    category: "Cleaning",
    contactPerson: "Sunita Shah",
    phone: "+91 98765 22222",
    email: "sunita@cleanpro.com",
  },
  {
    id: "v-3",
    name: "BuildWell Materials",
    category: "Maintenance",
    contactPerson: "Amit Patel",
    phone: "+91 98765 33333",
    email: "amit@buildwell.com",
  },
  {
    id: "v-4",
    name: "Garden Greens",
    category: "Gardening",
    contactPerson: "Neha Kulkarni",
    phone: "+91 98765 44444",
    email: "neha@gardengreens.com",
  },
  {
    id: "v-5",
    name: "ElectroHub",
    category: "Electrical",
    contactPerson: "Vikram Singh",
    phone: "+91 98765 55555",
    email: "vikram@electrohub.com",
  },
  {
    id: "v-6",
    name: "Furniture World",
    category: "Furniture",
    contactPerson: "Kavya Nair",
    phone: "+91 98765 66666",
    email: "kavya@furnitureworld.com",
  },
  {
    id: "v-7",
    name: "Kitchen Kraft",
    category: "Kitchen",
    contactPerson: "Mohammed Farhan",
    phone: "+91 98765 77777",
    email: "farhan@kitchenkraft.com",
  },
];

export type PurchaseRequestStatus = "Draft" | "Pending Approval" | "Approved" | "Rejected";

export type PurchaseLineItem = {
  description: string;
  quantity: number;
  unit: string;
  estimatedUnitPrice: number;
};

export type PurchaseRequest = {
  id: string;
  requestNumber: string;
  requestedBy: string;
  requestDate: string;
  items: PurchaseLineItem[];
  status: PurchaseRequestStatus;
  rejectionReason: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectedBy: string | null;
  rejectedAt: string | null;
};

export type PurchaseOrderStatus = "Draft" | "Sent" | "Received" | "Cancelled";

export type PurchaseOrder = {
  id: string;
  poNumber: string;
  prId: string;
  vendorId: string;
  items: PurchaseLineItem[];
  totalAmount: number;
  status: PurchaseOrderStatus;
  orderDate: string;
  expectedDeliveryDate: string;
  receivedDate: string | null;
  createdBy: string;
  receivedBy: string | null;
  paidBy: string | null;
  paidAt: string | null;
};

export const addPurchaseRequestSchema = z.object({
  requestedBy: z.string().min(2, "Requested by is required"),
  items: z
    .array(
      z.object({
        description: z.string().min(2, "Description is required"),
        quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
        unit: z.string().min(1, "Unit is required"),
        estimatedUnitPrice: z.coerce.number().min(0, "Price must be >= 0"),
      }),
    )
    .min(1, "Add at least one item"),
});

export type AddPurchaseRequestInput = z.infer<typeof addPurchaseRequestSchema>;

export const createPurchaseOrderSchema = z.object({
  prId: z.string().min(1, "Purchase request is required"),
  vendorId: z.string().min(1, "Vendor is required"),
  expectedDeliveryDate: z.string().min(1, "Expected delivery date is required"),
});

export type CreatePurchaseOrderInput = z.infer<typeof createPurchaseOrderSchema>;

export const receiveGoodsSchema = z.object({
  items: z.array(
    z.object({
      description: z.string(),
      orderedQuantity: z.number(),
      receivedQuantity: z.coerce.number().min(0, "Received quantity must be >= 0"),
      unit: z.string(),
    }),
  ),
});

export type ReceiveGoodsInput = z.infer<typeof receiveGoodsSchema>;

function totalFor(items: PurchaseLineItem[]) {
  return items.reduce((s, it) => s + it.quantity * it.estimatedUnitPrice, 0);
}

export const purchaseRequests: PurchaseRequest[] = [
  {
    id: "pr-1",
    requestNumber: "PR-2025-001",
    requestedBy: "Anjali Desai",
    requestDate: "2025-08-01T10:00:00+05:30",
    items: [{ description: "Plastic Chairs", quantity: 20, unit: "Pcs", estimatedUnitPrice: 850 }],
    status: "Draft",
    rejectionReason: null,
    approvedBy: null,
    approvedAt: null,
    rejectedBy: null,
    rejectedAt: null,
  },
  {
    id: "pr-2",
    requestNumber: "PR-2025-002",
    requestedBy: "Suresh Iyer",
    requestDate: "2025-08-05T09:30:00+05:30",
    items: [
      {
        description: "Floor Cleaning Liquid",
        quantity: 10,
        unit: "Litre",
        estimatedUnitPrice: 250,
      },
    ],
    status: "Pending Approval",
    rejectionReason: null,
    approvedBy: null,
    approvedAt: null,
    rejectedBy: null,
    rejectedAt: null,
  },
  {
    id: "pr-3",
    requestNumber: "PR-2025-003",
    requestedBy: "Kavya Nair",
    requestDate: "2025-08-06T11:00:00+05:30",
    items: [{ description: "Cement Bags", quantity: 20, unit: "Kg", estimatedUnitPrice: 450 }],
    status: "Approved",
    rejectionReason: null,
    approvedBy: "Suresh Iyer",
    approvedAt: "2025-08-09T10:00:00+05:30",
    rejectedBy: null,
    rejectedAt: null,
  },
  {
    id: "pr-4",
    requestNumber: "PR-2025-004",
    requestedBy: "Arvind Deshmukh",
    requestDate: "2025-08-08T10:00:00+05:30",
    items: [
      { description: "A4 Paper Box", quantity: 5, unit: "Box", estimatedUnitPrice: 1200 },
      { description: "Whiteboard Markers", quantity: 10, unit: "Box", estimatedUnitPrice: 300 },
    ],
    status: "Approved",
    rejectionReason: null,
    approvedBy: "Suresh Iyer",
    approvedAt: "2025-08-09T10:00:00+05:30",
    rejectedBy: null,
    rejectedAt: null,
  },
  {
    id: "pr-5",
    requestNumber: "PR-2025-005",
    requestedBy: "Rohan Mehta",
    requestDate: "2025-08-02T14:00:00+05:30",
    items: [{ description: "LED Bulbs", quantity: 30, unit: "Pcs", estimatedUnitPrice: 120 }],
    status: "Rejected",
    rejectionReason: "Budget exceeded for this quarter",
    approvedBy: null,
    approvedAt: null,
    rejectedBy: "Suresh Iyer",
    rejectedAt: "2025-08-03T11:00:00+05:30",
  },
  {
    id: "pr-6",
    requestNumber: "PR-2025-006",
    requestedBy: "Neha Kulkarni",
    requestDate: "2025-07-20T09:00:00+05:30",
    items: [
      { description: "Gardening Tools Set", quantity: 5, unit: "Set", estimatedUnitPrice: 1500 },
    ],
    status: "Approved",
    rejectionReason: null,
    approvedBy: "Suresh Iyer",
    approvedAt: "2025-08-09T10:00:00+05:30",
    rejectedBy: null,
    rejectedAt: null,
  },
];

export const purchaseOrders: PurchaseOrder[] = [
  {
    id: "po-1",
    poNumber: "PO-2025-001",
    prId: "pr-4",
    vendorId: "v-1",
    items: [
      { description: "A4 Paper Box", quantity: 5, unit: "Box", estimatedUnitPrice: 1200 },
      { description: "Whiteboard Markers", quantity: 10, unit: "Box", estimatedUnitPrice: 300 },
    ],
    totalAmount: totalFor([
      { description: "A4 Paper Box", quantity: 5, unit: "Box", estimatedUnitPrice: 1200 },
      { description: "Whiteboard Markers", quantity: 10, unit: "Box", estimatedUnitPrice: 300 },
    ]),
    status: "Sent",
    orderDate: "2025-08-10T10:00:00+05:30",
    expectedDeliveryDate: "2025-08-20T00:00:00+05:30",
    receivedDate: null,
    createdBy: "Anjali Desai",
    receivedBy: null,
    paidBy: null,
    paidAt: null,
  },
  {
    id: "po-2",
    poNumber: "PO-2025-002",
    prId: "pr-6",
    vendorId: "v-4",
    items: [
      { description: "Gardening Tools Set", quantity: 5, unit: "Set", estimatedUnitPrice: 1500 },
    ],
    totalAmount: totalFor([
      { description: "Gardening Tools Set", quantity: 5, unit: "Set", estimatedUnitPrice: 1500 },
    ]),
    status: "Received",
    orderDate: "2025-07-22T10:00:00+05:30",
    expectedDeliveryDate: "2025-07-30T00:00:00+05:30",
    receivedDate: "2025-07-29T11:00:00+05:30",
    createdBy: "Anjali Desai",
    receivedBy: "Neha Kulkarni",
    paidBy: "Neha Kulkarni",
    paidAt: "2025-07-29T11:00:00+05:30",
  },
  {
    id: "po-3",
    poNumber: "PO-2025-003",
    prId: "pr-2",
    vendorId: "v-2",
    items: [
      {
        description: "Floor Cleaning Liquid",
        quantity: 10,
        unit: "Litre",
        estimatedUnitPrice: 250,
      },
    ],
    totalAmount: totalFor([
      {
        description: "Floor Cleaning Liquid",
        quantity: 10,
        unit: "Litre",
        estimatedUnitPrice: 250,
      },
    ]),
    status: "Cancelled",
    orderDate: "2025-08-06T12:00:00+05:30",
    expectedDeliveryDate: "2025-08-15T00:00:00+05:30",
    receivedDate: null,
    createdBy: "Anjali Desai",
    receivedBy: null,
    paidBy: null,
    paidAt: null,
  },
];

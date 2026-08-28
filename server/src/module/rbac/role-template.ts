import { PermissionDefinition, ALL_PERMISSIONS, Permission } from '@shared/index';

/**
 * Default roles seeded per society as starting points; an admin can later modify or add roles.
 * `super_admin` is intentionally absent — it is a platform-level sentinel that implicitly holds
 * every permission and is not society-scoped, so it is never seeded as a society role.
 */
export interface RoleTemplate {
  name: string;
  permissions: PermissionDefinition[];
}

export const SUPER_ADMIN_ROLE = 'super_admin';

export const DEFAULT_ROLE_TEMPLATES: readonly RoleTemplate[] = [
  // The highest in-society role; one per society, granted every permission.
  { name: 'society_admin', permissions: [...ALL_PERMISSIONS] },
  // Flat owners who live in the society.
  {
    name: 'resident_owner',
    permissions: [
      Permission.VisitorApprove,
      Permission.VisitorDeny,
      Permission.BillingView,
      Permission.ComplaintsRaise,
      Permission.AmenitiesView,
      Permission.AmenitiesBook,
      Permission.ResidentsView,
    ],
  },
  // Tenants renting a flat. No billing.view (owner's financial history) or amenities.book (opt-in).
  {
    name: 'resident_tenant',
    permissions: [
      Permission.VisitorApprove,
      Permission.VisitorDeny,
      Permission.ComplaintsRaise,
      Permission.AmenitiesView,
      Permission.ResidentsView,
    ],
  },
  // Elected Treasurer / hired Accountant. Financial domain only.
  {
    name: 'treasurer',
    permissions: [
      Permission.BillingView,
      Permission.BillingGenerate,
      Permission.BillingApprove,
      Permission.BillingWaive,
      Permission.BillingExport,
      Permission.ResidentsView, // to look up which flat a bill belongs to
    ],
  },
  // Elected Secretary. Communication, complaints, resident management. No billing.
  {
    name: 'secretary',
    permissions: [
      Permission.NoticesPost,
      Permission.NoticesDelete,
      Permission.ComplaintsAssign,
      Permission.ComplaintsResolve,
      Permission.ComplaintsEscalate,
      Permission.ComplaintsViewAll,
      Permission.ResidentsView,
      Permission.ResidentsAdd,
      Permission.ResidentsUpdate,
      Permission.RolesView,
    ],
  },
  // Gate entry only, via a separate Guard App. Most restricted role.
  {
    name: 'guard',
    permissions: [
      Permission.VisitorLogEntry,
      Permission.VisitorApprove,
      Permission.VisitorDeny,
      Permission.VisitorOverstayAlert,
      Permission.StaffCheckin,
      Permission.StaffCheckout,
    ],
  },
  // One level above guard. Logs across all gates. No financials.
  {
    name: 'security_supervisor',
    permissions: [
      Permission.VisitorLogEntry,
      Permission.VisitorApprove,
      Permission.VisitorDeny,
      Permission.VisitorViewHistory,
      Permission.VisitorOverstayAlert,
      Permission.StaffCheckin,
      Permission.StaffCheckout,
      Permission.StaffViewAttendance,
    ],
  },
  // Hired staff. Complaints domain only.
  {
    name: 'helpdesk_manager',
    permissions: [
      Permission.ComplaintsAssign,
      Permission.ComplaintsResolve,
      Permission.ComplaintsEscalate,
      Permission.ComplaintsViewAll,
      Permission.ResidentsView, // to contact the right resident
    ],
  },
];

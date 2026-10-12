import { PermissionDefinition } from './permission.definition';

/**
 * The single source of truth for every valid permission. Permissions are deny-by-default and
 * live only in code (never the database) — adding or changing one requires editing this file.
 *
 * Shared between backend and frontend: the backend enforces these via `requirePermission()`,
 * the frontend gates UI (nav items, buttons) against the same identifiers — one registry, no drift.
 */

const def = (name: string, domain: string, description: string): PermissionDefinition =>
  new PermissionDefinition(name, domain, description);

// Frozen so entries can only change through a code edit, never at runtime.
export const Permission = Object.freeze({
  VisitorApprove: def('visitor.approve', 'visitor', 'Approve a visitor'),
  VisitorDeny: def('visitor.deny', 'visitor', 'Deny a visitor'),
  VisitorLogEntry: def('visitor.log_entry', 'visitor', 'Log a gate entry'),
  VisitorViewHistory: def('visitor.view_history', 'visitor', 'View visitor history'),
  VisitorOverstayAlert: def('visitor.overstay_alert', 'visitor', 'Raise overstay alert'),
  BillingView: def('billing.view', 'billing', 'View bills'),
  BillingGenerate: def('billing.generate', 'billing', 'Generate a bill'),
  BillingApprove: def('billing.approve', 'billing', 'Approve a bill'),
  BillingWaive: def('billing.waive', 'billing', 'Waive a bill'),
  BillingExport: def('billing.export', 'billing', 'Export billing data'),
  ComplaintsRaise: def('complaints.raise', 'complaints', 'Raise a complaint'),
  ComplaintsAssign: def('complaints.assign', 'complaints', 'Assign a complaint'),
  ComplaintsResolve: def('complaints.resolve', 'complaints', 'Resolve a complaint'),
  ComplaintsEscalate: def('complaints.escalate', 'complaints', 'Escalate a complaint'),
  ComplaintsViewAll: def('complaints.view_all', 'complaints', 'View all complaints'),
  ResidentsView: def('residents.view', 'residents', 'View residents'),
  ResidentsAdd: def('residents.add', 'residents', 'Add a resident'),
  ResidentsRemove: def('residents.remove', 'residents', 'Remove a resident'),
  ResidentsUpdate: def('residents.update', 'residents', 'Update a resident'),
  NoticesPost: def('notices.post', 'notices', 'Post a notice'),
  NoticesDelete: def('notices.delete', 'notices', 'Delete a notice'),
  ForumPost: def('forum.post', 'forum', 'Post in discussion forum'),
  PollsCreate: def('polls.create', 'polls', 'Create opinion polls'),
  MeetingsSchedule: def('meetings.schedule', 'meetings', 'Schedule meetings'),
  DocumentsUpload: def('documents.upload', 'documents', 'Upload documents'),
  ElectionsManage: def('elections.manage', 'elections', 'Manage elections'),
  AmenitiesView: def('amenities.view', 'amenities', 'View amenities'),
  AmenitiesBook: def('amenities.book', 'amenities', 'Book an amenity'),
  AmenitiesManage: def('amenities.manage', 'amenities', 'Manage amenities'),
  StaffCheckin: def('staff.checkin', 'staff', 'Check in staff'),
  StaffCheckout: def('staff.checkout', 'staff', 'Check out staff'),
  StaffViewAttendance: def('staff.view_attendance', 'staff', 'View staff attendance'),
  StaffManage: def('staff.manage', 'staff', 'Manage staff'),
  RolesView: def('roles.view', 'roles', 'View roles'),
  RolesCreate: def('roles.create', 'roles', 'Create a role'),
  RolesUpdate: def('roles.update', 'roles', 'Update a role'),
  RolesAssign: def('roles.assign', 'roles', 'Assign a role'),
  RolesRevoke: def('roles.revoke', 'roles', 'Revoke a role'),
  RolesDelete: def('roles.delete', 'roles', 'Delete a role'),
  SocietySettingsView: def('society.settings.view', 'society', 'View society settings'),
  SocietySettingsUpdate: def('society.settings.update', 'society', 'Update society settings'),
  AssetsView: def('assets.view', 'assets', 'View assets'),
  AssetsManage: def('assets.manage', 'assets', 'Manage assets'),
  InventoryView: def('inventory.view', 'inventory', 'View inventory'),
  InventoryManage: def('inventory.manage', 'inventory', 'Manage inventory'),
  InvoicingViewAll: def('invoicing.view_all', 'invoicing', 'View all invoices'),
  InvoicingViewOwn: def('invoicing.view_own', 'invoicing', 'View own flat invoices'),
  InvoicingManage: def('invoicing.manage', 'invoicing', 'Generate and manage invoices'),
  BillingSettingsView: def('billing_settings.view', 'billing_settings', 'View billing settings'),
  BillingSettingsManage: def(
    'billing_settings.manage',
    'billing_settings',
    'Manage billing settings',
  ),
  DuesReceiptsViewAll: def('dues_receipts.view_all', 'dues_receipts', 'View all dues and receipts'),
  DuesReceiptsViewOwn: def(
    'dues_receipts.view_own',
    'dues_receipts',
    'View own flat dues and receipts',
  ),
  DuesReceiptsManage: def('dues_receipts.manage', 'dues_receipts', 'Record payments'),
  PurchasingView: def('purchasing.view', 'purchasing', 'View purchase requests and orders'),
  PurchasingApprove: def('purchasing.approve', 'purchasing', 'Approve purchase requests'),
  PurchasingManage: def('purchasing.manage', 'purchasing', 'Manage purchasing'),
  VouchersView: def('vouchers.view', 'vouchers', 'View vouchers'),
  VouchersManage: def('vouchers.manage', 'vouchers', 'Manage vouchers'),
  BankAccountsView: def('bank_accounts.view', 'bank_accounts', 'View bank accounts'),
  BankAccountsManage: def('bank_accounts.manage', 'bank_accounts', 'Reconcile bank accounts'),
  ChartOfAccountsView: def('chart_of_accounts.view', 'chart_of_accounts', 'View chart of accounts'),
  ChartOfAccountsManage: def(
    'chart_of_accounts.manage',
    'chart_of_accounts',
    'Manage chart of accounts',
  ),
  BudgetViewAll: def('budget.view_all', 'budget', 'View full budget'),
  BudgetViewOwn: def('budget.view_own', 'budget', 'View budget summary'),
  BudgetManage: def('budget.manage', 'budget', 'Manage budget'),
  StatutoryRegistersView: def(
    'statutory_registers.view',
    'statutory_registers',
    'View statutory registers',
  ),
  StatutoryRegistersManage: def(
    'statutory_registers.manage',
    'statutory_registers',
    'Manage statutory registers',
  ),
  ActivityLogView: def('activity_log.view', 'activity_log', 'View activity log'),
  EventsViewAll: def('events.view_all', 'events', 'View all community events'),
  EventsViewOwn: def('events.view_own', 'events', 'View community events'),
  EventsManage: def('events.manage', 'events', 'Create and manage community events'),
  MaintenanceViewAll: def(
    'maintenance.view_all',
    'maintenance',
    'View the maintenance log across every flat and the society',
  ),
  MaintenanceManage: def(
    'maintenance.manage',
    'maintenance',
    'Record a maintenance log entry for a flat or the society',
  ),
});

export type PermissionKey = keyof typeof Permission;

export const ALL_PERMISSIONS: readonly PermissionDefinition[] = Object.values(Permission);

const PERMISSION_NAMES = new Set(ALL_PERMISSIONS.map((p) => p.name));

export function isValidPermission(name: string): boolean {
  return PERMISSION_NAMES.has(name);
}

const PERMISSION_KEY_BY_NAME: ReadonlyMap<string, PermissionKey> = new Map(
  (Object.entries(Permission) as [PermissionKey, PermissionDefinition][]).map(([key, p]) => [
    p.name,
    key,
  ]),
);

/** Maps a persisted dot-notation permission name (e.g. 'billing.generate') back to its typed key. */
export function permissionKeyFromName(name: string): PermissionKey | undefined {
  return PERMISSION_KEY_BY_NAME.get(name);
}

/** Maps persisted dot-notation permission names back to typed keys, dropping any that no longer exist. */
export function permissionKeysFromNames(names: Iterable<string>): PermissionKey[] {
  const keys: PermissionKey[] = [];
  for (const name of names) {
    const key = permissionKeyFromName(name);
    if (key) keys.push(key);
  }
  return keys;
}

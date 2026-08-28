import 'dotenv/config';
import { randomBytes, scryptSync } from 'crypto';
import { Client } from 'pg';

const DB_URL = process.env.DATABASE_URL!;

const SUPER_ADMIN_ID = '37ad3723-08a6-46a4-8411-55f2ec5b1a57';

const ALL_PERMISSIONS = [
  'visitor.approve',
  'visitor.deny',
  'visitor.log_entry',
  'visitor.view_history',
  'visitor.overstay_alert',
  'billing.view',
  'billing.generate',
  'billing.approve',
  'billing.waive',
  'billing.export',
  'complaints.raise',
  'complaints.assign',
  'complaints.resolve',
  'complaints.escalate',
  'complaints.view_all',
  'residents.view',
  'residents.add',
  'residents.remove',
  'residents.update',
  'notices.post',
  'notices.delete',
  'amenities.view',
  'amenities.book',
  'amenities.manage',
  'staff.checkin',
  'staff.checkout',
  'staff.view_attendance',
  'staff.manage',
  'roles.view',
  'roles.create',
  'roles.assign',
  'roles.revoke',
  'roles.delete',
  'society.settings.view',
  'society.settings.update',
];

const SECURITY_GUARD_PERMISSIONS = [
  'visitor.approve',
  'visitor.deny',
  'visitor.log_entry',
  'visitor.view_history',
  'visitor.overstay_alert',
  'staff.checkin',
  'staff.checkout',
  'staff.view_attendance',
];

const RESIDENT_PERMISSIONS = [
  'billing.view',
  'complaints.raise',
  'amenities.view',
  'amenities.book',
];

function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(plain, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function uid(): string {
  return randomBytes(16)
    .toString('hex')
    .padEnd(32, '0')
    .replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
}

function token64(): string {
  return randomBytes(32).toString('hex');
}

async function seed() {
  const client = new Client({ connectionString: DB_URL });
  await client.connect();

  try {
    await client.query('BEGIN');

    // Clear everything except super admin
    await client.query('DELETE FROM sessions WHERE user_id != $1', [SUPER_ADMIN_ID]);
    await client.query('DELETE FROM user_roles');
    await client.query('DELETE FROM role_permissions');
    await client.query('DELETE FROM roles');
    await client.query('DELETE FROM societies');
    await client.query('DELETE FROM users WHERE id != $1', [SUPER_ADMIN_ID]);

    await client.query(
      `INSERT INTO users (id, email, display_name, password_hash, is_super_admin)
       VALUES ($1,$2,$3,$4,true)
       ON CONFLICT (id) DO NOTHING`,
      [SUPER_ADMIN_ID, 'admin@ams.local', 'Super Admin', hashPassword('Admin@123')],
    );

    console.log('✓ super admin');

    // ── Societies ──────────────────────────────────────────────────────────────

    const society1Id = uid();
    const society2Id = uid();

    await client.query(
      `INSERT INTO societies (id, name, token, is_active, created_by) VALUES ($1,$2,$3,true,$4)`,
      [society1Id, 'Green Valley Apartments', token64(), SUPER_ADMIN_ID],
    );
    await client.query(
      `INSERT INTO societies (id, name, token, is_active, created_by) VALUES ($1,$2,$3,true,$4)`,
      [society2Id, 'Sunrise Heights', token64(), SUPER_ADMIN_ID],
    );

    console.log('✓ societies');

    // ── Roles ──────────────────────────────────────────────────────────────────

    const roles: Record<string, { id: string; societyId: string; permissions: string[] }> = {};

    for (const [societyId, prefix] of [
      [society1Id, 'gv'],
      [society2Id, 'sh'],
    ] as const) {
      for (const [name, perms] of [
        ['Society Admin', ALL_PERMISSIONS],
        ['Security Guard', SECURITY_GUARD_PERMISSIONS],
        ['Resident', RESIDENT_PERMISSIONS],
      ] as const) {
        const roleId = uid();
        await client.query(
          `INSERT INTO roles (id, society_id, name, is_system) VALUES ($1,$2,$3,true)`,
          [roleId, societyId, name],
        );
        roles[`${prefix}_${name}`] = { id: roleId, societyId, permissions: perms as string[] };
      }
    }

    console.log('✓ roles');

    // ── Role permissions ───────────────────────────────────────────────────────

    for (const role of Object.values(roles)) {
      for (const perm of role.permissions) {
        await client.query(`INSERT INTO role_permissions (role_id, permission) VALUES ($1,$2)`, [
          role.id,
          perm,
        ]);
      }
    }

    console.log('✓ role_permissions');

    // ── Users ──────────────────────────────────────────────────────────────────

    const rawUsers = [
      // Green Valley
      {
        email: 'admin@greenvalley.com',
        displayName: 'Ravi Kumar',
        roleKey: 'gv_Society Admin',
        password: 'Admin@123',
      },
      {
        email: 'guard@greenvalley.com',
        displayName: 'Suresh Singh',
        roleKey: 'gv_Security Guard',
        password: 'Guard@123',
      },
      {
        email: 'resident@greenvalley.com',
        displayName: 'Priya Sharma',
        roleKey: 'gv_Resident',
        password: 'Resident@123',
      },
      // Sunrise Heights
      {
        email: 'admin@sunriseheights.com',
        displayName: 'Arjun Mehta',
        roleKey: 'sh_Society Admin',
        password: 'Admin@123',
      },
      {
        email: 'guard@sunriseheights.com',
        displayName: 'Vikram Patil',
        roleKey: 'sh_Security Guard',
        password: 'Guard@123',
      },
      {
        email: 'resident@sunriseheights.com',
        displayName: 'Anjali Nair',
        roleKey: 'sh_Resident',
        password: 'Resident@123',
      },
    ];

    const users = rawUsers.map(({ email, displayName, roleKey, password }) => ({
      id: uid(),
      email,
      displayName,
      roleKey,
      passwordHash: hashPassword(password),
    }));

    for (const u of users) {
      await client.query(
        `INSERT INTO users (id, email, display_name, password_hash, is_super_admin) VALUES ($1,$2,$3,$4,false)`,
        [u.id, u.email, u.displayName, u.passwordHash],
      );
    }

    console.log('✓ users');

    // ── User roles ─────────────────────────────────────────────────────────────

    for (const u of users) {
      const role = roles[u.roleKey];
      await client.query(
        `INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES ($1,$2,$3)`,
        [u.id, role.id, SUPER_ADMIN_ID],
      );
    }

    console.log('✓ user_roles');

    await client.query('COMMIT');
    console.log('\nSeed complete.\n');
    console.log('Super admin:          admin@ams.local          / Admin@123');
    console.log('GV Society Admin:     admin@greenvalley.com    / Admin@123');
    console.log('GV Security Guard:    guard@greenvalley.com    / Guard@123');
    console.log('GV Resident:          resident@greenvalley.com / Resident@123');
    console.log('SH Society Admin:     admin@sunriseheights.com    / Admin@123');
    console.log('SH Security Guard:    guard@sunriseheights.com    / Guard@123');
    console.log('SH Resident:          resident@sunriseheights.com / Resident@123');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    await client.end();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

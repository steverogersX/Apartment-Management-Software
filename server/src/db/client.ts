import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { config } from '@/config';
import * as schema from './schema';

/**
 * The shared database connection. A single pooled `pg` connection wrapped by Drizzle and bound to the
 * full schema so relational queries (`db.query.*`) are typed. Import `db` wherever persistence is needed.
 */
const pool = new Pool({ connectionString: config.database.url });

export const db = drizzle(pool, { schema });

export type Database = typeof db;

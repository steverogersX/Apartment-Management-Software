import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

/**
 * drizzle-kit CLI configuration (migrations, push, studio).
 *
 * This runs outside the application runtime, so it reads `process.env.DATABASE_URL` directly via
 * dotenv — the one sanctioned exception to the "env only through @/config" rule.
 */
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to run drizzle-kit');
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema',
  out: './drizzle',
  dbCredentials: { url: databaseUrl },
  casing: 'snake_case',
});

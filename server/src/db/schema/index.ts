/**
 * Barrel for the full database schema. Import tables and inferred types from here, and pass this
 * module to `drizzle(pool, { schema })` so relational queries are available.
 */
export * from './societies';
export * from './users';
export * from './roles';
export * from './role-permissions';
export * from './user-roles';
export * from './sessions';
export * from './apartments';
export * from './flats';
export * from './complaints';
export * from './parking-slots';
export * from './vehicles';
export * from './relations';

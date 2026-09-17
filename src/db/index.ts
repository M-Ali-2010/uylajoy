import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./drizzle-schema";

// Database connection string from environment. Fail loudly: an empty string
// would make the driver silently try localhost and every request would 500.
const connectionString = process.env["DATABASE_URL"] || process.env["SUPABASE_DB_URL"];
if (!connectionString) {
  throw new Error("DATABASE_URL is not set — refusing to start");
}

// Supabase's transaction pooler (port 6543, and any *.pooler.supabase.com host)
// multiplexes one server connection across clients, so a prepared statement
// created by one request is not there for the next — postgres-js prepares by
// default and every query fails. It also hands out few connections, so a large
// per-instance pool starves other serverless instances.
const pooled = /pooler\.supabase\.com|:6543/.test(connectionString);

// Create postgres client
const client = postgres(connectionString, {
  max: pooled ? 3 : 10,
  idle_timeout: 20,
  connect_timeout: 10,
  ...(pooled ? { prepare: false } : {}),
});

// Create drizzle instance with schema
export const db = drizzle(client, { schema });

// Export schema for convenience
export * from "./drizzle-schema";

// Type exports
export type Database = typeof db;

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./drizzle-schema";

// Database connection string from environment
const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || "";

// Create postgres client
const client = postgres(connectionString, {
  max: 10, // Maximum number of connections
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create drizzle instance with schema
export const db = drizzle(client, { schema });

// Export schema for convenience
export * from "./drizzle-schema";

// Type exports
export type Database = typeof db;

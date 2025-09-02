import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

// For PostgreSQL connections on Replit
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const client = postgres(process.env.DATABASE_URL);
export const db = drizzle(client, { schema });

// Test database connection
async function testConnection() {
  try {
    await db.select().from(schema.users).limit(1);
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }
}

// Test connection on startup
testConnection();
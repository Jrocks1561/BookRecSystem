import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const pool = new Pool({
  host: process.env.PG_APP_HOST || "127.0.0.1",
  port: Number(process.env.PG_APP_PORT || 5432),
  user: process.env.PG_APP_USER || "postgres",
  password: process.env.PG_APP_PASS || "",
  database: process.env.PG_APP_DB || "bookrec",
  ssl: process.env.PG_APP_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  max: 10,
  idleTimeoutMillis: 0,
});

pool.on("connect", () => {
  console.log("✅ Connected to PostgreSQL");
});

pool.on("error", (err) => {
  console.error("❌ Unexpected error on PostgreSQL pool", err);
});

export default pool;

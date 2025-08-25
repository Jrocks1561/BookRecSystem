import { Client } from "pg";
import dotenv from "dotenv";
dotenv.config();

const bootConfig = {
  host: process.env.PG_BOOT_HOST,
  port: Number(process.env.PG_BOOT_PORT || 5432),
  user: process.env.PG_BOOT_USER,
  password: process.env.PG_BOOT_PASS,
  database: process.env.PG_BOOT_DB || "postgres",
  ssl: process.env.PG_BOOT_SSL === "true" ? { rejectUnauthorized: true } : undefined,
};

const APP_DB = process.env.PG_APP_DB;
const APP_USER = process.env.PG_APP_USER;
const APP_PASS = process.env.PG_APP_PASS;

(async () => {
  const c = new Client(bootConfig);
  await c.connect();
  await c.end();
  process.exit(0);
})().catch(async (e) => {
  console.error(e);
  process.exit(1);
});

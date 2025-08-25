import fs from "fs";
import path from "path";
import { Client } from "pg";
import dotenv from "dotenv";
dotenv.config();

const appConfig = {
  host: process.env.PG_APP_HOST,
  port: Number(process.env.PG_APP_PORT || 5432),
  user: process.env.PG_APP_USER,
  password: process.env.PG_APP_PASS,
  database: process.env.PG_APP_DB,
  ssl: process.env.PG_APP_SSL === "true" ? { rejectUnauthorized: true } : undefined,
};

const MIG_DIR = path.join(__dirname, "..", "migrations");

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT UNIQUE NOT NULL,
      applied_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
}

async function run() {
  const client = new Client(appConfig);
  await client.connect();
  await ensureMigrationsTable(client);

  const files = fs
    .readdirSync(MIG_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const applied = await client.query(`SELECT filename FROM _migrations`);
  const appliedSet = new Set(applied.rows.map((r) => r.filename));

  for (const file of files) {
    if (appliedSet.has(file)) continue;

    const sql = fs.readFileSync(path.join(MIG_DIR, file), "utf8");
    console.log(`Applying ${file}...`);
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query(`INSERT INTO _migrations (filename) VALUES ($1)`, [file]);
      await client.query("COMMIT");
      console.log(`✓ ${file}`);
    } catch (e) {
      await client.query("ROLLBACK");
      console.error(`✗ ${file}:`, e.message);
      throw e;
    }
  }

  await client.end();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

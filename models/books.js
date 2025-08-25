import pool from "../db.js";
import { randomBytes } from "node:crypto";

const makeId = () => randomBytes(12).toString("hex"); // 24-char hex id

export async function getAll() {
  const { rows } = await pool.query(
    "SELECT * FROM books ORDER BY created_at DESC"
  );
  return rows;
}

export async function create({ title, genre, author, year, rating }) {
  const id = makeId();
  const { rows } = await pool.query(
    `INSERT INTO books (id, title, genre, author, year, rating)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [id, title.trim(), genre.trim(), author ?? null, year ?? null, rating ?? null]
  );
  return rows[0];
}

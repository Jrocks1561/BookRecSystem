import { randomBytes } from "crypto";
import pool from "../../db.js";

const makeId = () => randomBytes(12).toString("hex"); // 24-char hex, matches CHAR(24)

// Count all books
export const count = async () => {
  const { rows } = await pool.query(`SELECT COUNT(*)::int AS count FROM books`);
  return rows[0].count;
};

// List all books (newest first)
export const getAll = async () => {
  const { rows } = await pool.query(`SELECT * FROM books ORDER BY created_at DESC`);
  return rows;
};

// Recommend by exact title (case-insensitive) using same-genre titles
export const recommendByTitle = async (title) => {
  const trimmed = String(title || "").trim();
  if (!trimmed) return null;

  const { rows: found } = await pool.query(
    `SELECT id, title, genre FROM books WHERE lower(title) = lower($1) LIMIT 1`,
    [trimmed]
  );
  if (found.length === 0) return null;

  const book = found[0];

  const { rows: recs } = await pool.query(
    `SELECT title
       FROM books
      WHERE genre = $1 AND id <> $2
      ORDER BY rating DESC NULLS LAST, created_at DESC
      LIMIT 10`,
    [book.genre, book.id]
  );

  return {
    message: `Since you liked "${book.title}", you might also enjoy:`,
    recommendations: recs.length ? recs.map(r => r.title) : ["No similar books found"],
  };
};

// Create a new book
export const create = async ({ title, genre, author, year, rating }) => {
  if (!title || typeof title !== "string") {
    const err = new Error("title (string) is required");
    err.statusCode = 400; throw err;
  }
  if (!genre || typeof genre !== "string") {
    const err = new Error("genre (string) is required");
    err.statusCode = 400; throw err;
  }

  const id = makeId();
  const params = [
    id,
    title.trim(),
    genre.trim(),
    typeof author === "string" ? author.trim() : author ?? null,
    typeof year === "number" ? year : null,
    typeof rating === "number" ? rating : null,
  ];

  const { rows } = await pool.query(
    `INSERT INTO books (id, title, genre, author, year, rating)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING *`,
    params
  );
  return rows[0];
};

// Set status to 'active' or 'banned'
export const setStatus = async (id, status) => {
  if (!["active", "banned"].includes(status)) {
    const err = new Error("status must be 'active' or 'banned'");
    err.statusCode = 400; throw err;
  }
  const { rows } = await pool.query(
    `UPDATE books SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [status, id]
  );
  if (rows.length === 0) {
    const err = new Error("Book not found");
    err.statusCode = 404; throw err;
  }
  return rows[0];
};

// Replace a banned book with a new one (must be same genre)
export const replaceBanned = async (bannedId, { title, author, year, rating, genre }) => {
  const { rows: found } = await pool.query(
    `SELECT id, title, genre, status FROM books WHERE id = $1`,
    [bannedId]
  );
  if (found.length === 0) {
    const err = new Error("Banned book not found");
    err.statusCode = 404; throw err;
  }
  const banned = found[0];
  if (banned.status !== "banned") {
    const err = new Error("Target book must be 'banned' before adding a replacement");
    err.statusCode = 400; throw err;
  }

  const chosenGenre = (typeof genre === "string" && genre.trim()) ? genre.trim() : banned.genre;
  if (chosenGenre !== banned.genre) {
    const err = new Error("Replacement must be in the same genre as the banned book");
    err.statusCode = 400; throw err;
  }
  if (!title || typeof title !== "string") {
    const err = new Error("title (string) is required");
    err.statusCode = 400; throw err;
  }

  const replacementId = makeId();
  const params = [
    replacementId,
    title.trim(),
    chosenGenre,
    typeof author === "string" ? author.trim() : author ?? null,
    typeof year === "number" ? year : null,
    typeof rating === "number" ? rating : null,
  ];

  const { rows: inserted } = await pool.query(
    `INSERT INTO books (id, title, genre, author, year, rating, status)
     VALUES ($1,$2,$3,$4,$5,$6,'active')
     RETURNING *`,
    params
  );

  return {
    message: "Replacement book added (banned book remains).",
    banned: { id: banned.id, title: banned.title, genre: banned.genre, status: banned.status },
    replacement: inserted[0],
  };
};

export const updateRating = async (id, rating) => {
  if (typeof rating !== "number" || rating < 0 || rating > 5) {
    const err = new Error("rating must be between 0 and 5");
    err.statusCode = 400; throw err;
  }
  const { rows } = await pool.query(
    `UPDATE books SET rating = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [rating, id]
  );
  if (rows.length === 0) {
    const err = new Error("Book not found");
    err.statusCode = 404; throw err;
  }
  return rows[0];
};

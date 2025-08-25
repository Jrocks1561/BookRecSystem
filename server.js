// server.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import pool from "./db.js";
import booksRouter from "./src/routes/books.routes.js";

const app = express();
app.use(express.json());

// simple request logger
app.use((req, _res, next) => {
  console.log(req.method, req.originalUrl);
  next();
});

// Ensure schema exists (includes updated_at + trigger)
async function ensureBooksTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS books (
      id CHAR(24) PRIMARY KEY,
      title TEXT NOT NULL,
      genre TEXT NOT NULL,
      author TEXT,
      year INT,
      rating NUMERIC(3,1),
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','banned')),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at := NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trg_books_updated_at ON books;
    CREATE TRIGGER trg_books_updated_at
    BEFORE UPDATE ON books
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

    CREATE INDEX IF NOT EXISTS idx_books_title ON books (title);
    CREATE INDEX IF NOT EXISTS idx_books_genre ON books (genre);
  `);
  console.log("Books table ready");
}

// mount router at /books (routes use "/", "/recommend", etc.)
app.use("/books", booksRouter);

const PORT = process.env.PORT || 3000;

ensureBooksTable()
  .then(() =>
    app.listen(PORT, () =>
      console.log(`The Server do be running at http://localhost:${PORT}`)
    )
  )
  .catch((e) => {
    console.error("Startup failed:", e);
    process.exit(1);
  });

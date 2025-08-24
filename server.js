import dotenv from "dotenv";
import express from "express";
import pool from "./db.js";  

dotenv.config();

const app = express();
app.use(express.json());


const ensureBooksTable = async()=>{
  await pool.query(`
    CREATE TABLE IF NOT EXISTS books (
      id CHAR(24) PRIMARY KEY,
      title TEXT NOT NULL,
      genre TEXT NOT NULL,
      author TEXT,
      year INT,
      rating NUMERIC(3,1),
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','banned')),
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_books_title ON books (title);
    CREATE INDEX IF NOT EXISTS idx_books_genre ON books (genre);
  `);
  console.log("✅ books table ready");
};

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/books", async (req, res) => {
  try {
    const { title, genre, author, year, rating } = req.body || {};
    if (!title || typeof title !== "string")
      return res.status(400).json({ message: "title (string) is required" });
    if (!genre || typeof genre !== "string")
      return res.status(400).json({ message: "genre (string) is required" });

    const id = Buffer.from(crypto.randomBytes(12)).toString("hex"); // 24-char
    await pool.query(
      `INSERT INTO books (id, title, genre, author, year, rating)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, title.trim(), genre.trim(), author ?? null, year ?? null, rating ?? null]
    );
    res.status(201).json({ id, title, genre, author, year, rating, status: "active" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "server error" });
  }
});


app.get("/books", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM books ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "server error" });
  }
});

const PORT = process.env.PORT || 3000;

(async () => {
  await ensureBooksTable();
  app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
})();

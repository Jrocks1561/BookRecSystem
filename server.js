require("dotenv").config();
const express = require("express");
const pool = require("./db");                        
const booksRouter = require("./src/routes/books.routes"); 

const app = express();
app.use(express.json());
app.use((req, _res, next) => { console.log(req.method, req.originalUrl); next(); });

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
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_books_title ON books (title);
    CREATE INDEX IF NOT EXISTS idx_books_genre ON books (genre);
  `);
  console.log("Books table ready");
}

app.use(booksRouter); 

const PORT = process.env.PORT || 3000;
ensureBooksTable()
  .then(() => app.listen(PORT, () => console.log(`The Server do be running at http://localhost:${PORT}`)))
  .catch((e) => { console.error("Startup failed:", e); process.exit(1); });

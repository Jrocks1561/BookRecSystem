const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json()); // parse JSON bodies

const makeId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const PORT = process.env.PORT || 3000;
const dataPath = path.join(__dirname, "books.json");

let books = [];
const nowIso = () => new Date().toISOString();

// ---- helpers
function normalizeBook(b) {
  return {
    id: b.id || makeId(),
    title: b.title,
    genre: b.genre,
    author: b.author ?? null,
    year: typeof b.year === "number" ? b.year : null,
    rating: typeof b.rating === "number" ? b.rating : null,
    status: b.status === "banned" ? "banned" : "available", // default to "available"
    createdAt: b.createdAt ?? nowIso(),
    updatedAt: b.updatedAt ?? nowIso(),
  };
}

function saveBooksOr500(res, onSuccess) {
  fs.writeFile(dataPath, JSON.stringify(books, null, 2), "utf8", (err) => {
    if (err) {
      console.error("Error writing books.json:", err);
      return res.status(500).json({ message: "Failed to persist data" });
    }
    onSuccess();
  });
}

// ---- health
app.get("/health", (_req, res) => {
  res.json({ ok: true, booksLoaded: books.length, pid: process.pid });
});

// ---- recommend (unchanged)
app.get("/recommend", (req, res) => {
  const userBookTitle = req.query.title;
  if (!userBookTitle) return res.status(400).json({ message: "Missing required query parameter: title" });

  const trimmedTitle = userBookTitle.trim().toLowerCase();
  const book = books.find(b => (b.title || "").toLowerCase() === trimmedTitle);
  if (!book) return res.status(404).json({ message: `Book "${userBookTitle}" not found` });

  const recs = books
    .filter(b => b.genre === book.genre && (b.title || "").toLowerCase() !== trimmedTitle)
    .map(b => b.title);

  res.json({
    message: `Since you liked "${book.title}", you might also enjoy:`,
    recommendations: recs.length ? recs : ["No similar books found"]
  });
});

// ---- optional: list all (handy for testing ids)
app.get("/books", (_req, res) => res.json(books));

// ---- create
app.post("/books", (req, res) => {
  const { title, genre, author, year, rating } = req.body || {};
  if (!title || typeof title !== "string") return res.status(400).json({ message: "title (string) is required" });
  if (!genre || typeof genre !== "string") return res.status(400).json({ message: "genre (string) is required" });
  if (author && typeof author !== "string") return res.status(400).json({ message: "author must be a string" });
  if (year !== undefined && typeof year !== "number") return res.status(400).json({ message: "year must be a number" });
  if (rating !== undefined && typeof rating !== "number") return res.status(400).json({ message: "rating must be a number" });

  const newBook = normalizeBook({
    id: makeId(),
    title: title.trim(),
    genre: genre.trim(),
    author: author?.trim(),
    year,
    rating
  });

  books.push(newBook);
  saveBooksOr500(res, () => res.status(201).json(newBook));
});

// PATCH: set status (ban/unban a book)
// Body: { "status": "banned" }  or  { "status": "avaliable" }
app.patch("/books/:id/status", (req, res) => {
  const idx = books.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Book not found" });

  const { status } = req.body || {};
  if (status !== "banned" && status !== "available") {
    return res.status(400).json({ message: 'status must be "available" or "banned"' });
    }

  books[idx].status = status;
  books[idx].updatedAt = nowIso();

  fs.writeFile(dataPath, JSON.stringify(books, null, 2), "utf8", (err) => {
    if (err) return res.status(500).json({ message: "Failed to persist data" });
    res.json(books[idx]);
  });
});

// PUT: add a *new* replacement book for a *banned* book (same genre)
// URL: /books/:id/replace
// Body: { "title": "New Title", "author"?: "Name", "year"?: 2000, "rating"?: 4.5, "genre"?: "Fantasy" }
// - If body.genre is omitted, we'll use the banned book's genre
// - If body.genre is present, it MUST match the banned book's genre
app.put("/books/:id/replace", (req, res) => {
  const bannedId = req.params.id;
  const bannedIdx = books.findIndex(b => b.id === bannedId);
  if (bannedIdx === -1) return res.status(404).json({ message: "Banned book not found" });

  const banned = books[bannedIdx];
  if (banned.status !== "banned") {
    return res.status(400).json({ message: "Target book must be 'banned' before adding a replacement" });
  }

  const { title, author, year, rating, genre } = req.body || {};

  // validate minimum fields
  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ message: "title (non-empty string) is required" });
  }
  if (author != null && typeof author !== "string") {
    return res.status(400).json({ message: "author must be a string if provided" });
  }
  if (year != null && typeof year !== "number") {
    return res.status(400).json({ message: "year must be a number if provided" });
  }
  if (rating != null && typeof rating !== "number") {
    return res.status(400).json({ message: "rating must be a number if provided" });
  }

  // enforce same-genre rule
  const chosenGenre = (genre && typeof genre === "string") ? genre.trim() : banned.genre;
  if (chosenGenre !== banned.genre) {
    return res.status(400).json({ message: "Replacement must be in the same genre as the banned book" });
  }

  // create the brand-new book (new id)
  const replacement = normalizeBook({
    id: makeId(),
    title: title.trim(),
    genre: chosenGenre,
    author: author ? author.trim() : null,
    year: typeof year === "number" ? year : null,
    rating: typeof rating === "number" ? rating : null,
    status: "avaliable", // new book is available
  });

  books.push(replacement);

  // persist
  fs.writeFile(dataPath, JSON.stringify(books, null, 2), "utf8", (err) => {
    if (err) return res.status(500).json({ message: "Failed to persist data" });
    res.status(201).json({
      message: "Replacement book added (banned book remains).",
      banned: { id: banned.id, title: banned.title, genre: banned.genre, status: banned.status },
      replacement
    });
  });
});

// ---- PATCH: update rating ONLY
app.patch("/books/:id/rating", (req, res) => {
  const idx = books.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Book not found" });

  const { rating } = req.body || {};
  if (typeof rating !== "number") {
    return res.status(400).json({ message: "rating (number) is required" });
  }
  // optional: clamp or validate range
  if (rating < 0 || rating > 5) return res.status(400).json({ message: "rating must be between 0 and 5" });

  books[idx].rating = rating;
  books[idx].updatedAt = nowIso();

  saveBooksOr500(res, () => res.json(books[idx]));
});

// ---- load & start
fs.readFile(dataPath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading books.json:", err.message);
    console.warn("Starting server with empty book list.");
    books = [];
  } else {
    try {
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) throw new Error("books.json is not an array");
      books = parsed.map(normalizeBook);
      console.log("Books loaded:", books.length);
    } catch (e) {
      console.error("Error parsing books.json:", e.message);
      console.warn("Starting server with empty book list.");
      books = [];
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on http://localhost:${PORT} (pid=${process.pid})`);
    console.log("Books:", books.map(b => `${b.id}:${b.title}`).join(" | "));
  });
});

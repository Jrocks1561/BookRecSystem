const path = require("path");
const fsp = require("fs/promises");
const { normalizeBook, nowIso, makeId } = require("../utils/normalizeBook");

const dataPath = path.join(__dirname, "../../data/books.json");


let books = [];


(async () => {
  try {
    const raw = await fsp.readFile(dataPath, "utf8").catch(() => "[]");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("books.json is not an array");
    books = parsed.map(normalizeBook);
    console.log("Books loaded:", books.length);
  } catch (e) {
    console.error("Error loading books.json:", e.message);
    books = [];
  }
})();

const save = async () => {
  await fsp.writeFile(dataPath, JSON.stringify(books, null, 2), "utf8");
};

exports.count = () => books.length;
exports.getAll = () => books;


exports.recommendByTitle = (title) => {
  const trimmed = String(title).trim().toLowerCase();
  const book = books.find(b => (b.title || "").toLowerCase() === trimmed);
  if (!book) return null;

  const recs = books
    .filter(b => b.genre === book.genre && (b.title || "").toLowerCase() !== trimmed)
    .map(b => b.title);

  return {
    message: `Since you liked "${book.title}", you might also enjoy:`,
    recommendations: recs.length ? recs : ["No similar books found"],
  };
};


exports.create = async ({ title, genre, author, year, rating }) => {
  const newBook = normalizeBook({
    id: makeId(),
    title,
    genre,
    author: author ?? null,
    year,
    rating,
  });
  books.push(newBook);
  await save();
  return newBook;
};

exports.setStatus = async (id, status) => {
  const idx = books.findIndex(b => b.id === id);
  if (idx === -1) {
    const err = new Error("Book not found");
    err.statusCode = 404; throw err;
  }
  if (status !== "banned" && status !== "available") {
    const err = new Error('status must be "available" or "banned"');
    err.statusCode = 400; throw err;
  }
  books[idx].status = status;
  books[idx].updatedAt = nowIso();
  await save();
  return books[idx];
};

exports.replaceBanned = async (bannedId, { title, author, year, rating, genre }) => {
  const bannedIdx = books.findIndex(b => b.id === bannedId);
  if (bannedIdx === -1) {
    const err = new Error("Banned book not found");
    err.statusCode = 404; throw err;
  }
  const banned = books[bannedIdx];
  if (banned.status !== "banned") {
    const err = new Error("Target book must be 'banned' before adding a replacement");
    err.statusCode = 400; throw err;
  }

  // same genre rule
  const chosenGenre = (typeof genre === "string" && genre.trim()) ? genre.trim() : banned.genre;
  if (chosenGenre !== banned.genre) {
    const err = new Error("Replacement must be in the same genre as the banned book");
    err.statusCode = 400; throw err;
  }

  const replacement = normalizeBook({
    id: makeId(),
    title: title.trim(),
    genre: chosenGenre,
    author: typeof author === "string" ? author.trim() : author ?? null,
    year: typeof year === "number" ? year : null,
    rating: typeof rating === "number" ? rating : null,
    status: "available",
  });

  books.push(replacement);
  await save();

  return {
    message: "Replacement book added (banned book remains).",
    banned: { id: banned.id, title: banned.title, genre: banned.genre, status: banned.status },
    replacement,
  };
};

exports.updateRating = async (id, rating) => {
  const idx = books.findIndex(b => b.id === id);
  if (idx === -1) {
    const err = new Error("Book not found");
    err.statusCode = 404; throw err;
  }
  if (typeof rating !== "number" || rating < 0 || rating > 5) {
    const err = new Error("rating must be between 0 and 5");
    err.statusCode = 400; throw err;
  }
  books[idx].rating = rating;
  books[idx].updatedAt = nowIso();
  await save();
  return books[idx];
};

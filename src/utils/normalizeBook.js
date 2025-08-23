const makeId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const nowIso = () => new Date().toISOString();

const normalizeBook = (b = {}) => ({
  id: b.id ?? makeId(),
  title: b.title,
  genre: b.genre,
  author: b.author ?? null,
  year: typeof b.year === "number" ? b.year : null,
  rating: typeof b.rating === "number" ? b.rating : null,
  status: b.status === "banned" ? "banned" : "available",
  createdAt: b.createdAt ?? nowIso(),
  updatedAt: b.updatedAt ?? nowIso(),
});

module.exports = { normalizeBook, makeId, nowIso };

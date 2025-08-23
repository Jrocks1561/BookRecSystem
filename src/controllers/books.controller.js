const svc = require("../services/books.service");



exports.health = async (_req, res) => {
  res.json({ ok: true, booksLoaded: svc.count(), pid: process.pid });
};

exports.list = async (_req, res) => {
  res.json(svc.getAll());
};

exports.recommend = async (req, res) => {
  const title = req.query.title;
  if (!title) {
    const err = new Error("Missing required query parameter: title");
    err.statusCode = 400;
    throw err;
  }
  const result = svc.recommendByTitle(title);
  if (!result) {
    const err = new Error(`Book "${title}" not found`);
    err.statusCode = 404;
    throw err;
  }
  res.json(result);
};

exports.create = async (req, res) => {
  const book = await svc.create(req.body);
  res.status(201).json(book);
};

exports.setStatus = async (req, res) => {
  const updated = await svc.setStatus(req.params.id, req.body.status);
  res.json(updated);
};

exports.replaceBanned = async (req, res) => {
  const payload = req.body;
  const out = await svc.replaceBanned(req.params.id, payload);
  res.status(201).json(out);
};

exports.updateRating = async (req, res) => {
  const updated = await svc.updateRating(req.params.id, req.body.rating);
  res.json(updated);
};

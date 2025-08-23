const express = require("express");
const router = express.Router();

const { asyncRoute } = require("../middleware/asyncRoute");
const { validate } = require("../middleware/validate");
const {
  createBookSchema, statusSchema, replaceSchema, ratingSchema,
} = require("../schemas/books.schema");

const ctrl = require("../controllers/books.controller");

// health
router.get("/health", asyncRoute(ctrl.health));

// list
router.get("/books", asyncRoute(ctrl.list));

// recommend
router.get("/recommend", asyncRoute(ctrl.recommend));

// create (validated)
router.post("/books", validate(createBookSchema), asyncRoute(ctrl.create));

// set status (validated)
router.patch("/books/:id/status", validate(statusSchema), asyncRoute(ctrl.setStatus));

// replace banned (validated body; same-genre rule in controller)
router.put("/books/:id/replace", validate(replaceSchema), asyncRoute(ctrl.replaceBanned));

// update rating only (validated)
router.patch("/books/:id/rating", validate(ratingSchema), asyncRoute(ctrl.updateRating));

module.exports = router;

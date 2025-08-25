import { Router } from "express";
import { asyncRoute } from "../middleware/asyncRoute.js";
import { validate } from "../middleware/validate.js";
import {
  createBookSchema,
  statusSchema,
  replaceSchema,
  ratingSchema,
} from "../schemas/books.schema.js";
import * as ctrl from "../controllers/books.controller.js";

const router = Router();

router.get("/health", asyncRoute(ctrl.health));
router.get("/", asyncRoute(ctrl.list));
router.get("/recommend", asyncRoute(ctrl.recommend));
router.post("/", validate(createBookSchema), asyncRoute(ctrl.create));
router.patch("/:id/status", validate(statusSchema), asyncRoute(ctrl.setStatus));
router.put("/:id/replace", validate(replaceSchema), asyncRoute(ctrl.replaceBanned));
router.patch("/:id/rating", validate(ratingSchema), asyncRoute(ctrl.updateRating));

export default router;

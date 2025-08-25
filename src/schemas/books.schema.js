import { z } from "zod";

const nonEmptyTrimmed = (label) =>
  z
    .string({
      required_error: `need a ${label}`,
      invalid_type_error: `${label} must be a string`,
    })
    .trim()
    .min(1, { message: `${label} cannot be empty` });

// 4-dgi year
const yearNumber = z
  .coerce
  .number({
    invalid_type_error: "year must be a number",
  })
  .int({ message: "year must be an integer" })
  .min(1000, { message: "year must be a 4-digit number" })
  .max(9999, { message: "year must be a 4-digit number" });

// rating 0–5 ("4.5" -> 4.5)
const ratingNumber = z
  .coerce
  .number({
    required_error: "need a rating",
    invalid_type_error: "rating must be a number",
  })
  .min(0, { message: "rating must be between 0 and 5" })
  .max(5, { message: "rating must be between 0 and 5" });

// Create: title & genre required; author/year/rating optional 
export const createBookSchema = z.object({
  title: nonEmptyTrimmed("book title"),
  genre: nonEmptyTrimmed("genre"),
  author: nonEmptyTrimmed("author").optional(),
  year: yearNumber.optional(),
  rating: ratingNumber.optional(),
});

// Must match DB CHECK constraint: 'active' | 'banned'
export const statusSchema = z.object({
  status: z.enum(["active", "banned"], {
    required_error: "need a status",
    invalid_type_error: "status must be either active or banned",
  }),
});

export const replaceSchema = z.object({
  title: nonEmptyTrimmed("book title"),
  author: nonEmptyTrimmed("author").optional(),
  year: yearNumber.optional(),
  rating: ratingNumber.optional(),
  // genre is optional; your service enforces "same genre" if provided
  genre: z.string().trim().optional(),
});

export const ratingSchema = z.object({
  rating: ratingNumber,
});

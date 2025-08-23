const { z } = require("zod");

// friendly non-empty trimmed string schema
const nonEmptyTrimmed = (label) =>
  z
    .string({
      required_error: `need a ${label}`,
      invalid_type_error: `${label} must be a string`,
    })
    .trim()
    .min(1, { message: `${label} cannot be empty` });

// handles 4-digit year validation (1000–9999) & year nees to be a number
const yearNumber = z
  .number({
    invalid_type_error: "year must be a number",
  })
  .int({ message: "year must be an integer" })
  .min(1000, { message: "year must be a 4-digit number" })
  .max(9999, { message: "year must be a 4-digit number" });

// handles rating validation (0–5) & rating needs to be a number
const ratingNumber = z
  .number({
    required_error: "need a rating",
    invalid_type_error: "rating must be a number",
  })
  .min(0, { message: "rating must be between 0 and 5" })
  .max(5, { message: "rating must be between 0 and 5" });

const createBookSchema = z.object({
  title: nonEmptyTrimmed("book title"),
  genre: nonEmptyTrimmed("genre"),
  author: nonEmptyTrimmed("author"),
  year: yearNumber.optional(),      
  rating: ratingNumber.optional(),
});

const statusSchema = z.object({
  status: z.enum(["available", "banned"], {
    required_error: "need a status",
    invalid_type_error: "status must be either available or banned",
  }),
});

const replaceSchema = z.object({
  title: nonEmptyTrimmed("book title"),
  author: nonEmptyTrimmed("author").optional(), 
  year: yearNumber.optional(),                  
  rating: ratingNumber.optional(),
  genre: z.string().trim().optional(), 
});

const ratingSchema = z.object({
  rating: ratingNumber,
});

module.exports = { createBookSchema, statusSchema, replaceSchema, ratingSchema };

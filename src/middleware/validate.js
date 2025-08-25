import { ZodError } from "zod";

const LABELS = {
  title: "book title",
  genre: "genre",
  author: "author",
  rating: "rating",
  year: "year",
};

// Only fields that are truly required by your create schema
const REQUIRED_FIELDS = ["title", "genre"];

const formatIssues = (issues) => {
  const msgs = [];
  for (const i of issues) {
    const key = String(i.path?.[0] ?? "");
    const label = LABELS[key] || key || "value";

    if (i.code === "invalid_type" && (i.received === "undefined" || i.received === "null" || i.message === "Required")) {
      msgs.push(`need a ${label}`);
      continue;
    }
    if (i.code === "too_small" && i.type === "string" && i.minimum === 1) {
      msgs.push(`${label} cannot be empty`);
      continue;
    }
    if (i.code === "invalid_type" && i.expected === "number") {
      msgs.push(`${label} must be a number`);
      continue;
    }

    msgs.push(`${key || label}: ${i.message}`);
  }
  return msgs;
};

export const validate = (schema, where = "body") => (req, res, next) => {
  const data = where === "query" ? req.query : req.body;
  const parsed = schema.safeParse(data);

  if (parsed.success) {
    if (where === "query") req.query = parsed.data;
    else req.body = parsed.data; // includes coerced numbers if schema uses z.coerce.number()
    return next();
  }

  const msgs = formatIssues(parsed.error.issues);

  // Add friendly “need a …” for truly missing required fields
  for (const f of REQUIRED_FIELDS) {
    const v = data?.[f];
    const isMissing = v === undefined || v === null || (typeof v === "string" && v.trim() === "");
    if (isMissing) {
      const friendly = `need a ${LABELS[f] || f}`;
      if (!msgs.some((m) => m.toLowerCase() === friendly.toLowerCase())) msgs.push(friendly);
    }
  }

  return res.status(400).json({
    message: "Validation failed",
    details: msgs,
  });
};
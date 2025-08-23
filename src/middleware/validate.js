const { ZodError } = require("zod");

const LABELS = { title: "book title", genre: "genre", author: "author", rating: "rating", year: "year" };
const REQUIRED_FIELDS = ["title", "genre", "author"]; // for POST/create – adjust if you use this middleware elsewhere

const formatIssues = (issues) => {
  const msgs = [];
  for (const i of issues) {
    const key = String(i.path?.[0] ?? "");
    const label = LABELS[key] || key || "value";

    // Missing field 
    if (i.code === "invalid_type" && (i.received === "undefined" || i.received === "null" || i.message === "Required")) {
      msgs.push(`need a ${label}`);
      continue;
    }

    // Empty string
    if (i.code === "too_small" && i.type === "string" && i.minimum === 1) {
      msgs.push(`${label} cannot be empty`);
      continue;
    }

    // Wrong type for numbers -> force friendly message
    if (i.code === "invalid_type" && i.expected === "number") {
      msgs.push(`${label} must be a number`);
      continue;
    }

    // Fallback to Zod's message
    msgs.push(`${key || label}: ${i.message}`);
  }
  return msgs;
};

const validate = (schema, where = "body") => (req, _res, next) => {
  try {
    const data = where === "query" ? req.query : req.body;
    const parsed = schema.parse(data);
    if (where === "query") req.query = parsed; else req.body = parsed;
    next();
  } catch (e) {
    if (e instanceof ZodError) {
      const msgs = formatIssues(e.issues);

      
      const data = where === "query" ? req.query : req.body;
      for (const f of REQUIRED_FIELDS) {
        if (!(f in (data || {})) || data[f] === undefined) {
          const friendly = `need a ${LABELS[f] || f}`;
          if (!msgs.some(m => m.toLowerCase() === friendly.toLowerCase())) msgs.push(friendly);
        }
      }

      e.statusCode = 400;
      e.code = "VALIDATION_ERROR";
      e.message = msgs.join("; ");
    }
    next(e);
  }
};

module.exports = { validate };
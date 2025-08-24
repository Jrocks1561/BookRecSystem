
const pool = require("../db"); 

exports.getAll = async () => {
  const { rows } = await pool.query("SELECT * FROM books ORDER BY created_at DESC");
  return rows;
};

exports.create = async ({ title, genre }) => {
  const { rows } = await pool.query(
    "INSERT INTO books (id, title, genre) VALUES (gen_random_uuid(), $1, $2) RETURNING *",
    [title, genre]
  );
  return rows[0];
};

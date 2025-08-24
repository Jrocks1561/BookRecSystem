CREATE TABLE IF NOT EXISTS books (
  id CHAR(24) PRIMARY KEY,
  title TEXT NOT NULL,
  genre TEXT NOT NULL,
  author TEXT,
  year INT,
  rating NUMERIC(3,1),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','banned')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_books_title ON books (title);
CREATE INDEX IF NOT EXISTS idx_books_genre ON books (genre);

📚 Book Recommendation System API

A backend API built with Node.js + Express, designed as a portfolio project to showcase backend engineering skills: RESTful routing, validation, error handling, and structured project organization.

🚀 Features

CRUD-like book management

➕ Create books

🚫 Ban / ✅ Unban books

🔄 Replace banned books with new ones (same genre)

⭐ Update ratings

🔎 Get recommendations by genre

Validation with Zod

Strict schemas for create, replace, status, and rating

Custom error messages (e.g. year must be a 4-digit number, title required)

Developer-friendly patterns

Centralized error handling middleware

Async/await wrapper (asyncRoute) → no try/catch clutter

Normalized entities (normalizeBook) → consistent shape for all books

Persistence

Books stored in data/books.json (file-based storage, simulating a DB)

🗂 Project Structure
BookRecSystem/
├─ server.js                 # Entry point (starts server)
├─ app.js                    # Express app setup
├─ data/
│  └─ books.json             # Book data storage
├─ src/
│  ├─ routes/
│  │  └─ books.routes.js     # Route definitions
│  ├─ controllers/
│  │  └─ books.controller.js # Controllers call services
│  ├─ services/
│  │  └─ books.service.js    # Business logic + persistence
│  ├─ schemas/
│  │  └─ books.schema.js     # Zod validation schemas
│  ├─ middleware/
│  │  ├─ asyncRoute.js       # Async error wrapper
│  │  ├─ errorHandler.js     # Centralized error handling
│  │  └─ validate.js         # Validation middleware
│  └─ utils/
│     └─ normalizeBook.js    # Helpers for book structure

⚡ Installation & Setup
# Clone the repo
git clone https://github.com/Jrocks1561/BookRecSystem.git
cd BookRecSystem

# Install dependencies
npm install

# Start the server
npm start

# OR with auto-reload on file save
npx nodemon server.js


Server runs by default at:
👉 http://localhost:3000

🧪 Testing the API

You can test with:

Thunder Client
 (VS Code extension)

Postman

Curl (CLI)

🔑 API Endpoints
📗 Create a Book

POST /books

{
  "title": "Dune",
  "genre": "Sci-Fi",
  "author": "Frank Herbert",
  "year": 1965,
  "rating": 5
}

📚 Get All Books

GET /books
Returns all books.

🔎 Recommend by Title

GET /recommend?title=The%20Hobbit
Finds similar books in the same genre.

🚫 Ban / ✅ Unban a Book

PATCH /books/:id/status
Example:

PATCH /books/bk1/status


Body:

{ "status": "banned" }

🔄 Replace a Banned Book

PUT /books/:id/replace
Adds a new replacement book (same genre).

Body:

{
  "title": "The Hobbit: Replacement Edition",
  "author": "Some Author",
  "year": 2025,
  "rating": 4.7
}

⭐ Update Rating

PATCH /books/:id/rating
Update only the rating (0–5).

Body:

{ "rating": 4 }

🛡 Error Handling

All errors return consistent JSON:

{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "year: must be a 4-digit number"
  }
}

🧠 Request Flow Diagram
Request → Route → validate(schema) → Controller → Service → Utils (normalizeBook) → Save JSON
            ↓
         errorHandler (if anything fails)

🧑‍💻 Developer Experience

🔄 Nodemon → auto-restarts server on file save

⚡ Thunder Client → lightweight Postman alternative inside VS Code

✅ Zod validation → strict, descriptive error messages

🎯 Centralized error handling → consistent responses

📖 Future Improvements

Swap JSON storage for a real DB (Postgres, Mongo, or SQLite)

Add audit trail (track bans, replacements, rating changes)

Add authentication & user accounts

Unit & integration tests (Jest + Supertest)

✨ Author

Joshalynn Worth (@Jrocks1561
)
📚 Book Recommendation System — built to demonstrate backend engineering skills for real-world applications.

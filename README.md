📚 Book Recommendation System API

A backend API built with Node.js + Express that manages a collection of books, demonstrates real-world backend patterns, and enforces robust validation with Zod.
This project was designed as a portfolio piece to showcase backend development skills: routing, controllers, services, error handling, validation, and structured project organization.

🚀 Features

CRUD-like book management:

Create books

Ban/unban books

Replace banned books

Update ratings

Get recommendations by genre

Validation with Zod:

Custom error messages (need a book title, year must be a 4-digit number, rating must be a number)

Consistent schemas for create, replace, status, and rating

Centralized error handling with middleware

Async/await wrapper (asyncRoute) to remove try/catch clutter

Normalized entities (normalizeBook) to ensure consistency

JSON persistence (books stored in data/books.json)

🗂 Project Structure
BookRecSystem/
├─ server.js                # Entry point (starts server)
├─ app.js                   # Express app setup
├─ data/
│  └─ books.json            # Book data storage
├─ src/
│  ├─ routes/
│  │  └─ books.routes.js    # Route definitions
│  ├─ controllers/
│  │  └─ books.controller.js # Thin controllers (call services)
│  ├─ services/
│  │  └─ books.service.js   # Business logic + persistence
│  ├─ schemas/
│  │  └─ books.schema.js    # Zod validation schemas
│  ├─ middleware/
│  │  ├─ asyncRoute.js      # Async error wrapper
│  │  ├─ errorHandler.js    # Centralized error handling
│  │  └─ validate.js        # Validation middleware
│  └─ utils/
│     └─ normalizeBook.js   # Helpers for book structure

⚡️ Installation & Setup
# Clone the repo
git clone https://github.com/Jrocks1561/BookRecSystem.git
cd BookRecSystem

# Install dependencies
npm install

Run the server
# Start normally
npm start

# OR start with nodemon (auto-restarts on file save)
npx nodemon server.js


With nodemon, the server will automatically reload whenever you save changes to your code — great for development productivity.

🧪 Testing the API

You can test the API using tools like:

Thunder Client
 (VS Code extension, used during development)

Postman

or plain curl from the command line.

The server runs by default on:

http://localhost:3000


Example in Thunder Client:

Method → POST

URL → http://localhost:3000/books

Body → JSON

{
  "title": "Dune",
  "genre": "Sci-Fi",
  "author": "Frank Herbert",
  "year": 1965,
  "rating": 5
}

🔑 API Endpoints
📗 Create a Book

POST /books
Creates a new book in the collection.

📚 Get All Books

GET /books
Returns all books currently stored.

🔎 Recommend by Title

GET /recommend?title={bookTitle}
Finds similar books in the same genre.

🚫 Ban / ✅ Unban a Book

PATCH /books/:id/status
Update the status of a book to "banned" or "available".

🔄 Replace a Banned Book

PUT /books/:id/replace
Add a new replacement book for a banned book.
⚠️ Must match the banned book’s genre.

⭐ Update Rating

PATCH /books/:id/rating
Update only the rating (0–5).

🛡 Error Handling

All errors are centralized and return consistent JSON:

{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "year: year must be a 4-digit number"
  }
}

🧠 Request Flow Diagram
Request → Route → validate(schema) → Controller → Service → Utils (normalizeBook) → Save JSON
            ↓
         errorHandler (if anything fails)

🧑‍💻 Developer Experience

Nodemon: server auto-restarts on file save for fast iteration.

Thunder Client: used for API testing (Postman alternative built into VS Code).

Zod: strict validation with friendly, custom error messages.

Centralized error handling: consistent responses for every error type.

📖 Future Improvements

 Replace JSON storage with a real database (Postgres, Mongo, or SQLite)

 Add audit trail (track bans, replacements, rating changes)

 Add authentication & user accounts

 Write unit & integration tests with Jest/Supertest

✨ Author

Joshalynn Worth (Jrocks1561)
Book Recommendation System — built to demonstrate backend engineering skills for real-world applications.

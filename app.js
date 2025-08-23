const express = require("express");
const { errorHandler } = require("./src/middleware/errorHandler");
const booksRouter = require("./src/routes/books.routes");

const app = express();
app.use(express.json());


app.use("/", booksRouter);


app.use(errorHandler);

module.exports = app;

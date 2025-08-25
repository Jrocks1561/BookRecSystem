import express from "express";
import errorHandler from "./src/middleware/errorHandler.js";
import booksRouter from "./src/routes/books.routes.js";

const app = express();
app.use(express.json());


app.use("/", booksRouter);


app.use(errorHandler);

module.exports = app;

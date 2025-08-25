import { StatusCodes } from "http-status-codes";
 
const errorHandler = (err, req, res, _next) => {
  const status = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const code = err.code || (status === 500 ? "INTERNAL_ERROR" : "APP_ERROR");
  const clientMessage = status === 500 ? "Something went wrong" : err.message;

  
  console.error({
    msg: "ERROR",
    method: req.method,
    url: req.originalUrl || req.url,
    status,
    code,
    message: err.message,
    stack: err.stack,
  });

  res.status(status).json({ error: { code, message: clientMessage } });
};

module.exports = { errorHandler };
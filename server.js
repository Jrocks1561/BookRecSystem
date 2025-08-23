const http = require("http");
const app = require("./app");

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on http://localhost:${PORT} (pid=${process.pid})`);
});

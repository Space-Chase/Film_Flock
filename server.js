const http = require("http");
const url = require("url");
const fs = require("fs");

http
  .createServer((request, response) => {
    let addr = request.url,
      q = url.parse(addr, true),
      filePath = "";
    if (q.pathname.includes("documentation")) {
      filePath = __dirname + "/documentation.html";
    } else {
      filePath = "index.html";
    }

    const timestamp = new Date().toISOString();
    const pageRequested = q.pathname;

    fs.readFile(filePath, (err, data) => {
      if (err) {
        throw err;
      }

      response.writeHead(200, { "Content-Type": "text/html" });

      const logMessage = `Time: ${timestamp}, Page Requested: ${pageRequested}\n`;
      response.write(logMessage);

      response.end();
    });
  })
  .listen(8080);

console.log("My test server is running on Port 8080.");

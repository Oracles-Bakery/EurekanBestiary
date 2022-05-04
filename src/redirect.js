const http = require("http");

const server = http.createServer((req, res) => {
  res.writeHead(301, {
    Location: `https://eureka.fernehalwes.org/ovnitimer${
      req.url === "/" ? "" : req.url
    }`,
  });
  res.end();
});

server.listen(8345);

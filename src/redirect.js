const http = require("http");

const server = http.createServer((req, res) => {
  if (req.url.split("/")[0] === "f") {
    const last = req.url.split("/").slice(1);
    res.writeHead(301, {
      Location: `https://eureka.fernehalwes.org/fairies${last.join("/")}`,
    });
  } else {
    res.writeHead(301, {
      Location: `https://eureka.fernehalwes.org/ovnitimer${
        req.url === "/" ? "" : req.url
      }`,
    });
  }

  res.end();
});

server.listen(8345);

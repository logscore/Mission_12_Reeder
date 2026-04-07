const path = require("path");
const dir = path.join(__dirname, "dist");

Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    const filePath = path.join(dir, url.pathname);
    const file = Bun.file(filePath);
    if (await file.exists()) return new Response(file);
    return new Response(Bun.file(path.join(dir, "index.html")));
  },
});

console.log("Listening on port 3000");

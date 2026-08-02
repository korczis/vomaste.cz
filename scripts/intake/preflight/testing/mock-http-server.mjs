// Local loopback mock HTTP server for preflight tests (PHASE_004.md
// §19.1). Never used by production code — imported only from
// `*.test.mjs` files. Binds to 127.0.0.1 on an OS-assigned ephemeral
// port; routes below are the exact scenarios §19.1/§21 ask for.
import http from "node:http";

const HTML_OK = `<!doctype html><html><head><title>Mock Page</title><link rel="canonical" href="https://example.cz/canonical"><meta property="og:site_name" content="Mock Site"><meta name="description" content="A mock page for tests."></head><body>ok</body></html>`;

export function startMockServer() {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    const path = url.pathname;

    if (path === "/ok") {
      res.writeHead(200, { "content-type": "text/html" });
      res.end(HTML_OK);
      return;
    }
    if (path.startsWith("/redirect-to/")) {
      const target = decodeURIComponent(path.slice("/redirect-to/".length));
      const status = Number(url.searchParams.get("status") ?? "302");
      res.writeHead(status, { location: target });
      res.end();
      return;
    }
    if (path === "/redirect-loop-a") {
      res.writeHead(302, { location: "/redirect-loop-b" });
      res.end();
      return;
    }
    if (path === "/redirect-loop-b") {
      res.writeHead(302, { location: "/redirect-loop-a" });
      res.end();
      return;
    }
    if (path === "/redirect-chain-long") {
      const n = Number(url.searchParams.get("n") ?? "0");
      res.writeHead(302, { location: `/redirect-chain-long?n=${n + 1}` });
      res.end();
      return;
    }
    if (path === "/redirect-malformed") {
      res.writeHead(302, { location: "http://[invalid" });
      res.end();
      return;
    }
    if (path === "/slow-headers") {
      // never writes headers — caller's connect/headers timeout must fire
      return;
    }
    if (path === "/slow-body") {
      res.writeHead(200, { "content-type": "text/plain" });
      res.write("partial");
      // never calls res.end() — caller's body timeout must fire
      return;
    }
    if (path === "/oversized") {
      res.writeHead(200, { "content-type": "text/plain" });
      res.end("x".repeat(1024 * 1024)); // 1 MiB, well over the 256 KiB cap
      return;
    }
    if (path === "/chunked-endless") {
      res.writeHead(200, { "content-type": "text/plain", "Transfer-Encoding": "chunked" });
      const interval = setInterval(() => res.write("x".repeat(4096)), 5);
      res.on("close", () => clearInterval(interval));
      return;
    }
    if (path === "/wrong-content-length") {
      res.writeHead(200, { "content-type": "text/plain", "content-length": "5" });
      res.end("this body is actually much longer than five bytes");
      return;
    }
    if (path === "/pdf") {
      res.writeHead(200, { "content-type": "application/pdf" });
      res.end("%PDF-1.4 fake");
      return;
    }
    if (path === "/binary") {
      res.writeHead(200, { "content-type": "application/octet-stream" });
      res.end(Buffer.from([0x00, 0x01, 0x02, 0x03]));
      return;
    }
    if (path === "/invalid-html") {
      res.writeHead(200, { "content-type": "text/html" });
      res.end("<html><head><title>Unterminated");
      return;
    }
    if (path === "/no-title") {
      res.writeHead(200, { "content-type": "text/html" });
      res.end("<html><head></head><body>no title here</body></html>");
      return;
    }
    if (path === "/title-too-long") {
      res.writeHead(200, { "content-type": "text/html" });
      res.end(`<html><head><title>${"T".repeat(1000)}</title></head><body></body></html>`);
      return;
    }
    if (path === "/duplicate-canonical") {
      res.writeHead(200, { "content-type": "text/html" });
      res.end(`<html><head><link rel="canonical" href="https://first.example/"><link rel="canonical" href="https://second.example/"></head></html>`);
      return;
    }
    if (path === "/hostile-metadata") {
      res.writeHead(200, { "content-type": "text/html" });
      res.end(`<html><head><title>Hostile &lt;script&gt;alert(1)&lt;/script&gt;</title><script>document.title="pwned"</script><meta name="description" content="ok &amp; safe"></head></html>`);
      return;
    }
    if (path === "/base-tag") {
      res.writeHead(200, { "content-type": "text/html" });
      res.end(`<html><head><base href="https://elsewhere.example/"><link rel="canonical" href="/relative-canonical"></head></html>`);
      return;
    }
    res.writeHead(404);
    res.end();
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({
        server,
        port,
        baseUrl: `http://127.0.0.1:${port}`,
        close: () => new Promise((r) => server.close(r)),
      });
    });
  });
}

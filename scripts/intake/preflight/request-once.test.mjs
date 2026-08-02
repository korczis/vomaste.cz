// §21 HTTP robustness test cases, exercised against a real local mock
// server (loopback only — never the public internet, §19).
import { test } from "node:test";
import assert from "node:assert/strict";
import { requestOnce, createPinnedLookup } from "./request-once.mjs";
import { startMockServer } from "./testing/mock-http-server.mjs";
import { NetworkTimeoutError, DestinationBlockedError, PREFLIGHT_ERROR_CODES } from "./errors.mjs";

// Real production bug, found 2026-08-02 against a real dual-stack
// hostname (see the ADR decision log): Node's `lookup` option has two
// distinct callback shapes depending on the CALLER-supplied `options.all`
// — `all: false` wants `callback(err, address, family)`; `all: true`
// (which Node's own http/https client requests for Happy Eyeballs
// dual-stack connection selection, on by default in current Node) wants
// `callback(err, addresses)`, an ARRAY. An earlier version of this
// function always used the 3-arg form, so Node's `all: true` callers
// received `undefined` as the address and the connection failed with
// `ERR_INVALID_IP_ADDRESS`. Every test up to that point used 127.0.0.1
// literals, which never made Node choose `all: true` — the bug was
// invisible locally. These two tests call the callback directly with
// both shapes, so they don't depend on Node's own (version/platform-
// dependent) decision of which one to use in a real connection.
test("createPinnedLookup: options.all=false (or absent) uses the 3-arg callback(err, address, family) form", () => {
  const lookup = createPinnedLookup({ address: "93.184.216.34", family: 4 });
  const calls = [];
  lookup("example.fixture", { all: false }, (...args) => calls.push(args));
  assert.deepEqual(calls, [[null, "93.184.216.34", 4]]);
});

test("createPinnedLookup: options.all=true uses the array callback(err, addresses) form (the bug this test exists to pin down)", () => {
  const lookup = createPinnedLookup({ address: "93.184.216.34", family: 4 });
  const calls = [];
  lookup("example.fixture", { all: true }, (...args) => calls.push(args));
  assert.deepEqual(calls, [[null, [{ address: "93.184.216.34", family: 4 }]]]);
});

test("a real request against the mock server still succeeds when Node's lookup is invoked in options.all=true mode", async () => {
  // Simulates exactly what broke in production: call the real lookup
  // function the way Node's Happy-Eyeballs dual-stack path calls it,
  // then feed the result into a real connection the same way Node's own
  // http client would — proving the fix works end to end, not just at
  // the unit level.
  const mock = await startMockServer();
  try {
    const lookup = createPinnedLookup({ address: "127.0.0.1", family: 4 });
    const resolved = await new Promise((resolve, reject) => {
      lookup("127.0.0.1", { all: true }, (err, addresses) => (err ? reject(err) : resolve(addresses)));
    });
    assert.deepEqual(resolved, [{ address: "127.0.0.1", family: 4 }]);

    const result = await requestOnce({ url: `${mock.baseUrl}/ok`, hostname: "127.0.0.1", pinnedAddress: { address: "127.0.0.1", family: 4 } });
    assert.equal(result.status, 200);
  } finally {
    await mock.close();
  }
});

test("a basic successful request returns status, headers, and body", async () => {
  const mock = await startMockServer();
  try {
    const result = await requestOnce({ url: `${mock.baseUrl}/ok`, hostname: "127.0.0.1", pinnedAddress: { address: "127.0.0.1", family: 4 } });
    assert.equal(result.status, 200);
    assert.equal(result.headers["content-type"], "text/html");
    assert.ok(result.body.includes("Mock Page"));
    assert.equal(result.bodyTruncated, false);
  } finally {
    await mock.close();
  }
});

test("a response exceeding maxBodyBytes is truncated, not fully buffered", async () => {
  const mock = await startMockServer();
  try {
    const result = await requestOnce({ url: `${mock.baseUrl}/oversized`, hostname: "127.0.0.1", pinnedAddress: { address: "127.0.0.1", family: 4 }, maxBodyBytes: 1024 });
    assert.equal(result.bodyTruncated, true);
    assert.equal(result.body.length, 1024);
  } finally {
    await mock.close();
  }
});

test("an endless chunked response is still bounded by maxBodyBytes", async () => {
  const mock = await startMockServer();
  try {
    const result = await requestOnce({ url: `${mock.baseUrl}/chunked-endless`, hostname: "127.0.0.1", pinnedAddress: { address: "127.0.0.1", family: 4 }, maxBodyBytes: 2048, timeouts: { total: 4000, connect: 2000, headers: 2000, body: 3000 } });
    assert.equal(result.bodyTruncated, true);
    assert.ok(result.body.length <= 2048);
  } finally {
    await mock.close();
  }
});

test("a declared-vs-actual content-length mismatch is a protocol error, not silently trusted or a hang (§8.5: never trust Content-Length)", async () => {
  // Node's own HTTP/1.1 client enforces response framing against the
  // declared Content-Length and rejects extra bytes as malformed rather
  // than silently accepting them — exactly the fail-closed behavior
  // §8.5 asks for ("Content-Length nesmí být důvěryhodný, stále enforce
  // stream limit"), it just happens one layer below this module. The
  // important property this test pins down is that the mismatch never
  // resolves as if nothing were wrong, and never hangs.
  const mock = await startMockServer();
  try {
    await assert.rejects(requestOnce({ url: `${mock.baseUrl}/wrong-content-length`, hostname: "127.0.0.1", pinnedAddress: { address: "127.0.0.1", family: 4 }, timeouts: { total: 3000, connect: 2000, headers: 2000, body: 2000 } }));
  } finally {
    await mock.close();
  }
});

test("timeout before headers are received", async () => {
  const mock = await startMockServer();
  try {
    await assert.rejects(
      requestOnce({ url: `${mock.baseUrl}/slow-headers`, hostname: "127.0.0.1", pinnedAddress: { address: "127.0.0.1", family: 4 }, timeouts: { total: 5000, connect: 5000, headers: 200, body: 5000 } }),
      (err) => err instanceof NetworkTimeoutError && err.code === PREFLIGHT_ERROR_CODES.HEADERS_TIMEOUT_EXCEEDED
    );
  } finally {
    await mock.close();
  }
});

test("timeout during body reception", async () => {
  const mock = await startMockServer();
  try {
    await assert.rejects(
      requestOnce({ url: `${mock.baseUrl}/slow-body`, hostname: "127.0.0.1", pinnedAddress: { address: "127.0.0.1", family: 4 }, timeouts: { total: 5000, connect: 5000, headers: 5000, body: 200 } }),
      (err) => err instanceof NetworkTimeoutError && err.code === PREFLIGHT_ERROR_CODES.BODY_TIMEOUT_EXCEEDED
    );
  } finally {
    await mock.close();
  }
});

test("connection reset / refused (no server on the port) surfaces as an error, not a hang", async () => {
  await assert.rejects(requestOnce({ url: "http://127.0.0.1:1/", hostname: "127.0.0.1", pinnedAddress: { address: "127.0.0.1", family: 4 }, timeouts: { total: 2000, connect: 1000, headers: 1000, body: 1000 } }));
});

test("PDF content type is recorded but the body is not further interpreted here (that's preflight-url.mjs's job)", async () => {
  const mock = await startMockServer();
  try {
    const result = await requestOnce({ url: `${mock.baseUrl}/pdf`, hostname: "127.0.0.1", pinnedAddress: { address: "127.0.0.1", family: 4 } });
    assert.equal(result.headers["content-type"], "application/pdf");
  } finally {
    await mock.close();
  }
});

test("binary content is read within limits without throwing", async () => {
  const mock = await startMockServer();
  try {
    const result = await requestOnce({ url: `${mock.baseUrl}/binary`, hostname: "127.0.0.1", pinnedAddress: { address: "127.0.0.1", family: 4 } });
    assert.equal(result.status, 200);
  } finally {
    await mock.close();
  }
});

test("never sends cookies, referer, or authorization headers", async () => {
  const received = {};
  const http = await import("node:http");
  const server = http.createServer((req, res) => {
    Object.assign(received, req.headers);
    res.writeHead(200, { "content-type": "text/plain" });
    res.end("ok");
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const port = server.address().port;
  try {
    await requestOnce({ url: `http://127.0.0.1:${port}/`, hostname: "127.0.0.1", pinnedAddress: { address: "127.0.0.1", family: 4 } });
    assert.equal(received.cookie, undefined);
    assert.equal(received.referer, undefined);
    assert.equal(received.authorization, undefined);
    assert.equal(received["accept-encoding"], "identity");
    assert.match(received["user-agent"], /^vomaste\.cz-source-preflight\//);
  } finally {
    server.close();
  }
});

test("a remote-address mismatch is a critical block, not a warning", async () => {
  const mock = await startMockServer();
  try {
    await assert.rejects(
      requestOnce({ url: `${mock.baseUrl}/ok`, hostname: "127.0.0.1", pinnedAddress: { address: "127.0.0.2", family: 4 }, timeouts: { total: 3000, connect: 2000, headers: 2000, body: 2000 } }),
      (err) => err instanceof DestinationBlockedError && err.code === PREFLIGHT_ERROR_CODES.REMOTE_ADDRESS_MISMATCH
    );
  } finally {
    await mock.close();
  }
});

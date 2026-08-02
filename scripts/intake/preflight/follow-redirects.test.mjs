import { test } from "node:test";
import assert from "node:assert/strict";
import { followRedirects } from "./follow-redirects.mjs";
import { RedirectPolicyError, PREFLIGHT_ERROR_CODES } from "./errors.mjs";

function response(status, headers = {}) {
  return { status, headers };
}

test("no redirect: returns the first hop's response", async () => {
  const validateOneHop = async (url) => ({ response: response(200), resolvedAddresses: [], pinnedAddress: null });
  const result = await followRedirects("https://a.example/", validateOneHop);
  assert.equal(result.finalUrl, "https://a.example/");
  assert.deepEqual(result.chain, []);
});

test("follows a single redirect and revalidates the target", async () => {
  const seen = [];
  const validateOneHop = async (url) => {
    seen.push(url);
    if (url === "https://a.example/") return { response: response(302, { location: "https://b.example/" }) };
    return { response: response(200) };
  };
  const result = await followRedirects("https://a.example/", validateOneHop);
  assert.deepEqual(seen, ["https://a.example/", "https://b.example/"]);
  assert.equal(result.chain.length, 1);
  assert.equal(result.chain[0].to, "https://b.example/");
});

test("resolves a relative Location header against the current URL", async () => {
  const validateOneHop = async (url) => {
    if (url === "https://a.example/dir/page") return { response: response(302, { location: "../other" }) };
    return { response: response(200) };
  };
  const result = await followRedirects("https://a.example/dir/page", validateOneHop);
  assert.equal(result.finalUrl, "https://a.example/other");
});

test("stops after the maximum number of redirects", async () => {
  let hop = 0;
  const validateOneHop = async () => {
    hop += 1;
    return { response: response(302, { location: `https://a.example/${hop}` }) };
  };
  await assert.rejects(followRedirects("https://a.example/0", validateOneHop), (err) => err instanceof RedirectPolicyError && err.code === PREFLIGHT_ERROR_CODES.REDIRECT_LIMIT_EXCEEDED);
});

test("detects a redirect loop", async () => {
  const validateOneHop = async (url) => {
    const next = url.endsWith("/a") ? "https://x.example/b" : "https://x.example/a";
    return { response: response(302, { location: next }) };
  };
  await assert.rejects(followRedirects("https://x.example/a", validateOneHop), (err) => err instanceof RedirectPolicyError && err.code === PREFLIGHT_ERROR_CODES.REDIRECT_LOOP);
});

test("blocks an https-to-http scheme downgrade", async () => {
  const validateOneHop = async (url) => {
    if (url === "https://a.example/") return { response: response(302, { location: "http://a.example/" }) };
    return { response: response(200) };
  };
  await assert.rejects(followRedirects("https://a.example/", validateOneHop), (err) => err instanceof RedirectPolicyError && err.code === PREFLIGHT_ERROR_CODES.REDIRECT_TRANSPORT_DOWNGRADE);
});

test("allows an http-to-https scheme upgrade (not a downgrade)", async () => {
  const validateOneHop = async (url) => {
    if (url === "http://a.example/") return { response: response(302, { location: "https://a.example/" }) };
    return { response: response(200) };
  };
  const result = await followRedirects("http://a.example/", validateOneHop);
  assert.equal(result.finalUrl, "https://a.example/");
});

test("rejects a malformed Location header", async () => {
  const validateOneHop = async () => ({ response: response(302, { location: "http://[invalid" }) });
  await assert.rejects(followRedirects("https://a.example/", validateOneHop), (err) => err instanceof RedirectPolicyError && err.code === PREFLIGHT_ERROR_CODES.REDIRECT_MALFORMED_LOCATION);
});

test("a cross-host redirect is followed as long as the target passes its own validation", async () => {
  const validateOneHop = async (url) => {
    if (url === "https://a.example/") return { response: response(302, { location: "https://totally-different-host.example/" }) };
    return { response: response(200) };
  };
  const result = await followRedirects("https://a.example/", validateOneHop);
  assert.equal(result.finalUrl, "https://totally-different-host.example/");
});

test("a hop failure preserves the redirect chain accumulated so far", async () => {
  const validateOneHop = async (url) => {
    if (url === "https://a.example/") return { response: response(302, { location: "https://b.example/" }) };
    const err = new Error("destination blocked");
    err.code = "url_private_destination";
    err.details = {};
    throw err;
  };
  try {
    await followRedirects("https://a.example/", validateOneHop);
    assert.fail("expected to throw");
  } catch (err) {
    assert.equal(err.details.chain.length, 1);
    assert.equal(err.details.chain[0].to, "https://b.example/");
  }
});

test("never inherits trust from the original host — every hop, including the first, goes through validateOneHop", async () => {
  let callCount = 0;
  const validateOneHop = async () => {
    callCount += 1;
    return { response: response(200) };
  };
  await followRedirects("https://a.example/", validateOneHop);
  assert.equal(callCount, 1);
});

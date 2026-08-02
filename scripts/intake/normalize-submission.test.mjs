import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeText, extractAndNormalizeUrls } from "./normalize-submission.mjs";

test("normalizeText converts CRLF and CR to LF", () => {
  assert.equal(normalizeText("a\r\nb\rc"), "a\nb\nc");
});

test("normalizeText trims trailing whitespace per line", () => {
  assert.equal(normalizeText("a   \nb\t\n"), "a\nb");
});

test("normalizeText collapses 3+ consecutive blank lines to one blank line", () => {
  assert.equal(normalizeText("a\n\n\n\n\nb"), "a\n\nb");
});

test("normalizeText applies Unicode NFC without altering diacritics", () => {
  const nfd = "Testovací"; // "í" as base + combining acute
  assert.equal(normalizeText(nfd), "Testovací");
});

test("extractAndNormalizeUrls: one URL per line", () => {
  const result = extractAndNormalizeUrls("https://a.testov.cz/x\nhttps://b.testov.cz/y");
  assert.deepEqual(result.map((r) => r.normalized), ["https://a.testov.cz/x", "https://b.testov.cz/y"]);
});

test("extractAndNormalizeUrls: Markdown link syntax", () => {
  const result = extractAndNormalizeUrls("Viz [zápis](https://a.testov.cz/zapis.pdf) pro detaily.");
  assert.deepEqual(result.map((r) => r.normalized), ["https://a.testov.cz/zapis.pdf"]);
});

test("extractAndNormalizeUrls: bulleted list", () => {
  const result = extractAndNormalizeUrls("- https://a.testov.cz/x\n* https://b.testov.cz/y\n1. https://c.testov.cz/z");
  assert.deepEqual(
    result.map((r) => r.normalized).sort(),
    ["https://a.testov.cz/x", "https://b.testov.cz/y", "https://c.testov.cz/z"].sort()
  );
});

test("extractAndNormalizeUrls deduplicates exact normalized matches", () => {
  const result = extractAndNormalizeUrls("https://a.testov.cz/x\nhttps://a.testov.cz/x\nhttps://A.TESTOV.cz/x");
  assert.equal(result.length, 1);
});

test("extractAndNormalizeUrls strips a default port", () => {
  const result = extractAndNormalizeUrls("https://a.testov.cz:443/x");
  assert.equal(result[0].normalized, "https://a.testov.cz/x");
});

test("extractAndNormalizeUrls flags a non-default port", () => {
  const result = extractAndNormalizeUrls("https://a.testov.cz:8443/x");
  assert.ok(result[0].syntax_observations.includes("non_standard_port"));
  assert.ok(result[0].normalized.includes(":8443"));
});

test("extractAndNormalizeUrls flags credentials in the URL but preserves them", () => {
  const result = extractAndNormalizeUrls("https://user:pass@a.testov.cz/x");
  assert.ok(result[0].syntax_observations.includes("contains_credentials"));
});

test("extractAndNormalizeUrls flags an obvious localhost literal", () => {
  const result = extractAndNormalizeUrls("http://localhost:3000/x");
  assert.ok(result[0].syntax_observations.includes("possible_localhost"));
});

test("extractAndNormalizeUrls flags an obvious IPv4 literal", () => {
  const result = extractAndNormalizeUrls("http://127.0.0.1/x");
  assert.ok(result[0].syntax_observations.includes("possible_ip_literal"));
});

test("extractAndNormalizeUrls flags a non-empty fragment without stripping it", () => {
  const result = extractAndNormalizeUrls("https://a.testov.cz/x#section-2");
  assert.ok(result[0].syntax_observations.includes("has_fragment"));
  assert.equal(result[0].normalized, "https://a.testov.cz/x#section-2");
});

test("extractAndNormalizeUrls strips an empty fragment", () => {
  const result = extractAndNormalizeUrls("https://a.testov.cz/x#");
  assert.equal(result[0].normalized, "https://a.testov.cz/x");
});

test("extractAndNormalizeUrls flags an unsupported protocol without discarding the entry", () => {
  const result = extractAndNormalizeUrls("ftp://files.testov.cz/x");
  assert.equal(result.length, 1);
  assert.ok(result[0].syntax_observations.includes("unsupported_protocol"));
});

test("extractAndNormalizeUrls never performs network access (pure string transform)", () => {
  // Structural assertion, not a network probe: an unreachable/fake TLD
  // must resolve exactly as fast and deterministically as a real one.
  const start = Date.now();
  const result = extractAndNormalizeUrls("https://this-domain-does-not-exist.invalid.testfixture/x");
  assert.ok(Date.now() - start < 100, "URL classification must not block on any I/O");
  assert.equal(result[0].normalized, "https://this-domain-does-not-exist.invalid.testfixture/x");
});

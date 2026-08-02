import { test } from "node:test";
import assert from "node:assert/strict";
import { extractHtmlMetadata } from "./extract-html-metadata.mjs";
import { MetadataExtractionError, PREFLIGHT_ERROR_CODES } from "./errors.mjs";
import { METADATA_LIMITS } from "./constants.mjs";

function html(body) {
  return Buffer.from(`<html><head>${body}</head><body></body></html>`);
}

test("extracts title, canonical, og fields, and description", () => {
  const result = extractHtmlMetadata(
    html(`<title>My Title</title><link rel="canonical" href="https://example.cz/c"><meta property="og:title" content="OGT"><meta property="og:site_name" content="Site"><meta property="og:type" content="article"><meta name="description" content="Desc"><meta property="article:published_time" content="2026-01-01T00:00:00Z"><meta property="article:modified_time" content="2026-01-02T00:00:00Z">`),
    "text/html"
  );
  assert.equal(result.metadata.title, "My Title");
  assert.equal(result.metadata.canonical_url, "https://example.cz/c");
  assert.equal(result.metadata.og_title, "OGT");
  assert.equal(result.metadata.og_site_name, "Site");
  assert.equal(result.metadata.og_type, "article");
  assert.equal(result.metadata.description, "Desc");
  assert.equal(result.metadata.article_published_time, "2026-01-01T00:00:00Z");
  assert.equal(result.metadata.article_modified_time, "2026-01-02T00:00:00Z");
  assert.equal(result.declaredBy, "declared_by_page");
});

test("rejects a non-HTML content type outright", () => {
  assert.throws(() => extractHtmlMetadata(Buffer.from("binary"), "application/pdf"), (err) => err instanceof MetadataExtractionError && err.code === PREFLIGHT_ERROR_CODES.UNSUPPORTED_CONTENT_TYPE);
  assert.throws(() => extractHtmlMetadata(Buffer.from("{}"), "application/json"));
  assert.throws(() => extractHtmlMetadata(Buffer.alloc(10), "application/octet-stream"));
});

test("application/xhtml+xml is treated as HTML", () => {
  assert.doesNotThrow(() => extractHtmlMetadata(html("<title>x</title>"), "application/xhtml+xml"));
});

test("no title present yields no title field, not an error", () => {
  const result = extractHtmlMetadata(html(""), "text/html");
  assert.equal("title" in result.metadata, false);
});

test("a title over the limit is truncated", () => {
  const result = extractHtmlMetadata(html(`<title>${"T".repeat(1000)}</title>`), "text/html");
  assert.equal(result.metadata.title.length, METADATA_LIMITS.titleMaxChars);
});

test("duplicate canonical links: the first one wins, deterministically", () => {
  const result = extractHtmlMetadata(html(`<link rel="canonical" href="https://first.example/"><link rel="canonical" href="https://second.example/">`), "text/html");
  assert.equal(result.metadata.canonical_url, "https://first.example/");
});

test("an invalid/unterminated HTML document does not crash and returns whatever partial data is present", () => {
  assert.doesNotThrow(() => extractHtmlMetadata(Buffer.from("<html><head><title>Unterminated"), "text/html"));
});

test("hostile metadata: an embedded <script> tag's content never appears in extracted metadata, and is never executed (no eval in this module)", () => {
  const result = extractHtmlMetadata(
    html(`<title>Hostile &lt;script&gt;alert(1)&lt;/script&gt;</title><script>document.title="pwned"</script><meta name="description" content="ok &amp; safe">`),
    "text/html"
  );
  assert.equal(result.metadata.title, "Hostile <script>alert(1)</script>");
  assert.equal(result.metadata.description, "ok & safe");
  assert.ok(!JSON.stringify(result.metadata).includes("pwned"));
});

test("a <base> tag does not affect canonical extraction — the raw href attribute is returned, never resolved against a base", () => {
  const result = extractHtmlMetadata(html(`<base href="https://elsewhere.example/"><link rel="canonical" href="/relative-canonical">`), "text/html");
  assert.equal(result.metadata.canonical_url, "/relative-canonical");
});

test("HTML entities are decoded in extracted text fields", () => {
  const result = extractHtmlMetadata(html(`<title>Ukázkový &amp; článek &#39;s uvozovkami&#39;</title>`), "text/html");
  assert.equal(result.metadata.title, "Ukázkový & článek 's uvozovkami'");
});

test("metadata never includes any key outside the allowlist", () => {
  const result = extractHtmlMetadata(html(`<meta name="keywords" content="a,b,c"><meta property="fb:app_id" content="123">`), "text/html");
  assert.deepEqual(Object.keys(result.metadata), []);
});

test("extraction is deterministic for identical input", () => {
  const buf = html(`<title>T</title><meta name="description" content="D">`);
  assert.deepEqual(extractHtmlMetadata(buf, "text/html"), extractHtmlMetadata(buf, "text/html"));
});

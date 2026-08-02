// Bounded HTML metadata extraction (PHASE_004.md §12). Operates only on
// the already-size-limited response prefix (≤256 KiB, enforced upstream
// by request-once.mjs) — never fetches anything itself, never executes
// scripts/styles, never resolves external resources (it never even
// looks at src="…"/link rel="stylesheet" etc. — those simply aren't in
// the allowlist). Every regex is bounded per-match (`{0,N}` instead of
// an unbounded `*`) so pathological input can't cause catastrophic
// backtracking within the already-capped input size (§15/§21).
import { METADATA_ALLOWLIST, METADATA_LIMITS, HTML_CONTENT_TYPES } from "./constants.mjs";
import { MetadataExtractionError, PREFLIGHT_ERROR_CODES } from "./errors.mjs";

const TAG_MAX_LENGTH = 4096;
const TITLE_TAG = /<title\b[^>]{0,200}>([\s\S]{0,2000}?)<\/title\s*>/i;
const LINK_TAG = new RegExp(`<link\\b[^>]{0,${TAG_MAX_LENGTH}}>`, "gi");
const META_TAG = new RegExp(`<meta\\b[^>]{0,${TAG_MAX_LENGTH}}>`, "gi");

function extractAttr(tag, attrName) {
  const pattern = new RegExp(`\\b${attrName}\\s*=\\s*["']([^"']{0,2048})["']`, "i");
  const match = pattern.exec(tag);
  return match ? decodeEntities(match[1]) : null;
}

// Only the handful of named-entity/numeric forms actually needed for
// typical metadata values — not a full HTML entity table.
function decodeEntities(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]{1,6});/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d{1,7});/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)));
}

function truncate(text, maxChars) {
  return text.length > maxChars ? text.slice(0, maxChars) : text;
}

// Returns `{ metadata, declaredBy: "declared_by_page" }` or throws
// MetadataExtractionError. `metadata` only ever has keys from
// METADATA_ALLOWLIST — nothing else in the document is ever surfaced.
export function extractHtmlMetadata(bodyBuffer, contentType) {
  const baseContentType = (contentType ?? "").split(";")[0].trim().toLowerCase();
  if (!HTML_CONTENT_TYPES.includes(baseContentType)) {
    throw new MetadataExtractionError(PREFLIGHT_ERROR_CODES.UNSUPPORTED_CONTENT_TYPE, `metadata extraction not supported for content type: ${baseContentType}`);
  }

  // §12.5: safe UTF-8 decode only — Buffer#toString("utf8") replaces
  // invalid byte sequences with U+FFFD rather than throwing, which is
  // exactly the "known charset only, no wide encoding zoo" policy.
  const html = bodyBuffer.toString("utf8");

  const metadata = {};

  const titleMatch = TITLE_TAG.exec(html);
  if (titleMatch) metadata.title = truncate(decodeEntities(titleMatch[1]).trim(), METADATA_LIMITS.titleMaxChars);

  const canonicalCandidates = [];
  for (const linkTagMatch of html.matchAll(LINK_TAG)) {
    const tag = linkTagMatch[0];
    if (/\brel\s*=\s*["']canonical["']/i.test(tag)) {
      const href = extractAttr(tag, "href");
      if (href) canonicalCandidates.push(href);
    }
  }
  // §10.1's determinism concern extends here too: the FIRST canonical
  // link wins, always — never "the last one," so re-parsing the same
  // byte-identical body is reproducible.
  if (canonicalCandidates.length > 0) metadata.canonical_url = truncate(canonicalCandidates[0], METADATA_LIMITS.canonicalUrlMaxChars);

  const metaFieldByProperty = Object.freeze({
    "og:title": "og_title",
    "og:site_name": "og_site_name",
    "og:type": "og_type",
    "article:published_time": "article_published_time",
    "article:modified_time": "article_modified_time",
  });

  for (const metaTagMatch of html.matchAll(META_TAG)) {
    const tag = metaTagMatch[0];
    const property = extractAttr(tag, "property");
    const name = extractAttr(tag, "name");
    const content = extractAttr(tag, "content");
    if (content === null) continue;

    if (property && metaFieldByProperty[property] && !(metaFieldByProperty[property] in metadata)) {
      metadata[metaFieldByProperty[property]] = truncate(content.trim(), METADATA_LIMITS.descriptionMaxChars);
    }
    if (name === "description" && !("description" in metadata)) {
      metadata.description = truncate(content.trim(), METADATA_LIMITS.descriptionMaxChars);
    }
  }

  for (const key of Object.keys(metadata)) {
    if (!METADATA_ALLOWLIST.includes(key)) delete metadata[key]; // defensive — should be unreachable
  }

  return { metadata, declaredBy: "declared_by_page" };
}

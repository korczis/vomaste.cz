// Conservative normalization (PHASE_002.md §13.1, §14). Runs only after
// validate-submission.mjs has already accepted the raw submission. Never
// mutates raw text in place — every normalized value is a new field
// alongside the untouched raw one (§13.2 raw preservation).
import { LIMITS, ALLOWED_URL_PROTOCOLS } from "./constants.mjs";

// §13.1 allowed text normalization: line endings -> \n, trim trailing
// whitespace per line, collapse 3+ blank lines to 1, Unicode NFC. Never
// touches diacritics, punctuation, names, or wording.
export function normalizeText(rawText) {
  const unified = String(rawText).normalize("NFC").replace(/\r\n|\r/g, "\n");
  const trimmedLines = unified
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/, ""))
    .join("\n");
  return trimmedLines.replace(/\n{3,}/g, "\n\n").trim();
}

const MARKDOWN_LINK = /\[[^\]]*\]\((\S+?)\)/g;
const BARE_URL_TOKEN = /\S*:\/\/\S+/g;
const IPV4 = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;

function stripBulletPrefix(line) {
  return line.replace(/^\s*(?:[-*+]|\d+[.)])\s+/, "");
}

function classifyUrl(raw) {
  const observations = [];
  if (raw.length > LIMITS.sourceUrlLineMaxChars) observations.push("url_too_long");

  const protocolMatch = /^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(raw);
  const protocol = protocolMatch ? `${protocolMatch[1].toLowerCase()}:` : null;
  if (protocol && !ALLOWED_URL_PROTOCOLS.includes(protocol)) observations.push("unsupported_protocol");

  let parsed = null;
  if (protocol && ALLOWED_URL_PROTOCOLS.includes(protocol)) {
    try {
      parsed = new URL(raw);
    } catch {
      parsed = null;
    }
  }

  if (!parsed) {
    return { normalized: raw, observations: [...new Set(observations)] };
  }

  if (parsed.username || parsed.password) observations.push("contains_credentials");
  // WHATWG URL's `.hash` getter returns "" both when there is no fragment
  // and when the fragment is present-but-empty ("https://x/#") — only
  // `.href` distinguishes them (trailing "#" with nothing after it).
  const hasEmptyFragment = parsed.hash === "" && parsed.href.endsWith("#");
  const hasNonEmptyFragment = parsed.hash.length > 1;
  if (hasNonEmptyFragment) observations.push("has_fragment");
  const hostname = parsed.hostname.toLowerCase();
  if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname === "127.0.0.1" || hostname === "::1" || hostname === "[::1]") {
    observations.push("possible_localhost");
  }
  if (IPV4.test(hostname) || (hostname.startsWith("[") && hostname.endsWith("]"))) {
    observations.push("possible_ip_literal");
  }
  const isDefaultPort = (parsed.protocol === "http:" && parsed.port === "80") || (parsed.protocol === "https:" && parsed.port === "443");
  if (parsed.port && !isDefaultPort) observations.push("non_standard_port");

  // §14.3 safe normalizations only: lowercase scheme+host (URL already
  // does this), strip default port, strip an EMPTY fragment. A non-empty
  // fragment, credentials, and query string are left exactly as given —
  // never assume two URLs differing only there are the same document.
  if (isDefaultPort) parsed.port = "";
  let normalized = parsed.toString();
  if (hasEmptyFragment) normalized = normalized.replace(/#$/, "");

  return { normalized, observations: [...new Set(observations)] };
}

// §14.1/§14.3: extracts URLs from raw text (one-per-line, Markdown links,
// bulleted lines), classifies each syntactically (no network access), and
// deduplicates conservatively by exact normalized-string match. Returns
// an array of { raw, normalized, syntax_observations } capped at
// LIMITS.maxSourceUrls entries (validate-submission.mjs already rejects
// input exceeding this before normalization runs, so the cap here is a
// defensive backstop, not the primary enforcement point).
export function extractAndNormalizeUrls(rawUrlsText) {
  const text = String(rawUrlsText ?? "");
  const results = [];
  const seenNormalized = new Set();

  const consumeToken = (rawToken) => {
    const trimmed = rawToken.trim();
    if (trimmed.length === 0) return;
    const { normalized, observations } = classifyUrl(trimmed);
    if (seenNormalized.has(normalized)) return;
    seenNormalized.add(normalized);
    results.push({ raw: trimmed, normalized, syntax_observations: observations });
  };

  const consumedSpans = [];
  for (const match of text.matchAll(MARKDOWN_LINK)) {
    consumeToken(match[1]);
    consumedSpans.push([match.index, match.index + match[0].length]);
  }

  let remaining = text;
  for (const [start, end] of consumedSpans.sort((a, b) => b[0] - a[0])) {
    remaining = remaining.slice(0, start) + " ".repeat(end - start) + remaining.slice(end);
  }

  for (const line of remaining.split(/\n/)) {
    const withoutBullet = stripBulletPrefix(line);
    for (const match of withoutBullet.matchAll(BARE_URL_TOKEN)) consumeToken(match[0]);
  }

  return results.slice(0, LIMITS.maxSourceUrls);
}

// Redaction helpers (PHASE_003.md §16). Risk evidence must never
// re-publish a personal datum in full — every detector routes its
// matched excerpt through one of these before putting it in a flag's
// `evidence.redacted_excerpt`.
export function redactEmail(email) {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const visible = local.slice(0, Math.min(3, local.length));
  return `${visible}${"*".repeat(Math.max(1, local.length - visible.length))}@${domain}`;
}

export function redactPhone(phone) {
  const digits = phone.replace(/\D/g, "");
  const last3 = digits.slice(-3);
  return digits.length > 3 ? `+*** *** ${last3}` : "***";
}

export function redactUrlCredentials(url) {
  return url.replace(/\/\/[^/@\s]+:[^/@\s]+@/, "//***:***@");
}

export function redactLongNumericIdentifier(value) {
  const digits = String(value);
  if (digits.length <= 4) return "*".repeat(digits.length);
  return `${"*".repeat(digits.length - 4)}${digits.slice(-4)}`;
}

// Generic bounded excerpt for non-identifier evidence (e.g. a matched
// phrase) — short, and never the full source field.
const MAX_EXCERPT_LENGTH = 80;
export function boundedExcerpt(text, matchIndex, matchLength) {
  const start = Math.max(0, matchIndex - 10);
  const end = Math.min(text.length, matchIndex + matchLength + 10);
  const excerpt = text.slice(start, end).trim();
  return excerpt.length > MAX_EXCERPT_LENGTH ? `${excerpt.slice(0, MAX_EXCERPT_LENGTH)}…` : excerpt;
}

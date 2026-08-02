// Identifier normalization (PHASE_003.md §5.6, §5.7). Only identifiers
// actually present in this repo's entity dataset get support — IČO is
// the one the entity schema documents (`externalIds`, keyed by registry
// name); nothing else is invented (§5.7: "nevymýšlej podporu
// identifikátoru, který nikdo nepoužívá").
export function normalizeIco(raw) {
  const digitsOnly = String(raw ?? "").replace(/\s+/g, "");
  if (!/^\d{8}$/.test(digitsOnly)) {
    return { normalized: digitsOnly, valid: false, reason: "not_eight_digits" };
  }
  // Czech IČO checksum (mod 11 over weights 8..2, standard algorithm):
  // remainder 0 -> check digit 1; remainder 1 -> check digit 0;
  // otherwise check digit = 11 - remainder.
  const digits = digitsOnly.split("").map(Number);
  let sum = 0;
  for (let i = 0; i < 7; i += 1) sum += digits[i] * (8 - i);
  const remainder = sum % 11;
  const expectedCheckDigit = remainder === 0 ? 1 : remainder === 1 ? 0 : 11 - remainder;
  const valid = expectedCheckDigit === digits[7];
  return { normalized: digitsOnly, valid, reason: valid ? "valid_checksum" : "invalid_checksum" };
}

// Generic identifier compare: exact match on the normalized form only —
// no fuzzy identifier matching, ever (an identifier is exact or it's not
// evidence at all).
export function normalizeGenericIdentifier(raw) {
  const trimmed = String(raw ?? "").trim();
  return { normalized: trimmed, valid: trimmed.length > 0, reason: trimmed.length > 0 ? "non_empty" : "empty" };
}

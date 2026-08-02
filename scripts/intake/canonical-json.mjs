// Deterministic canonical JSON serialization (PHASE_002.md §7.1): stable
// across object key insertion order, so the same logical input always
// hashes and stringifies to the same bytes. No repo-wide canonical-JSON
// helper existed to reuse (checked scripts/build/hash-tree.mjs and
// scripts/dossier/lib/jsonld-shared.mjs — both hash file bytes, not JS
// values), so this is Phase 2's own small, documented implementation
// rather than inventing a competing convention.

function sortValue(value) {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value !== null && typeof value === "object") {
    const sorted = {};
    for (const key of Object.keys(value).sort()) sorted[key] = sortValue(value[key]);
    return sorted;
  }
  return value;
}

// Recursively sorts object keys (arrays keep their order — order is
// semantic there) and stringifies with no whitespace. Always ends with a
// trailing "\n" so canonical bytes are stable regardless of how a caller
// later writes them to a file.
export function canonicalJsonStringify(value) {
  return `${JSON.stringify(sortValue(value))}\n`;
}

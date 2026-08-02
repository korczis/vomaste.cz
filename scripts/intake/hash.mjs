// SHA-256 helpers (PHASE_002.md §7.1, §7.2). Thin wrapper so every caller
// hashes the same way — no ad hoc createHash() scattered across modules.
import { createHash } from "node:crypto";
import { canonicalJsonStringify } from "./canonical-json.mjs";

export function sha256Hex(input) {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

// §7.1 input hash: canonical representation of the raw event JSON, so two
// byte-different-but-equivalent JSON files (different key order/whitespace)
// hash identically.
export function hashEventInput(eventJson) {
  return sha256Hex(canonicalJsonStringify(eventJson));
}

// §7.2 manifest hash: hash the manifest WITHOUT its own provenance.manifest_sha256
// field (documented strategy — avoids the "hash of a hash of itself"
// recursion). Caller passes the full manifest; this strips the field before
// hashing so build-intake-manifest.mjs never has to remember the exclusion.
export function hashManifest(manifest) {
  const { provenance, ...rest } = manifest;
  const { manifest_sha256, ...provenanceWithoutSelfHash } = provenance;
  return sha256Hex(canonicalJsonStringify({ ...rest, provenance: provenanceWithoutSelfHash }));
}

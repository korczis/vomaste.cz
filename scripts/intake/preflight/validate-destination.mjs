// Destination validation (PHASE_004.md §7.1, §6.3). Pure — takes an
// already-resolved address list (from DNS or a literal IP hostname) and
// decides allow/block. This is where "mixed public/private DNS answer"
// and "all-private DNS answer" become BLOCK, and where the single
// address a connection is later pinned to is chosen.
import { classifyIpAddress } from "./classify-ip.mjs";

// `testAllowedPrivateAddresses` (default []) is the ONLY way a private/
// loopback destination is ever allowed through — and it is a parameter
// only a test file calling this function directly can set, naming the
// EXACT address(es) the local mock server is bound to. It never
// blanket-allows "any private range" — a redirect to a private address
// NOT in this list (e.g. a real SSRF test target like 10.0.0.1) is still
// blocked even when the initial hop's loopback address is allow-listed,
// which is exactly what makes the "redirect public → private" test
// meaningful instead of vacuous. Never wired to a CLI flag or
// environment variable anywhere in this processor (§19.3: "Nikdy
// nepřidávej ALLOW_PRIVATE_NETWORK=true do production CLI... žádný env
// bypass použitelný v GitHub workflow") —
// scripts/intake/preflight-security-gates.test.mjs statically confirms
// no production module ever passes it.
//
// Returns:
//   { allowed: true, pinnedAddress: {address, family}, classifiedAddresses: [...] }
//   { allowed: false, reason: string, classifiedAddresses: [...] }
export function validateDestination(addresses, { testAllowedPrivateAddresses = [] } = {}) {
  if (!Array.isArray(addresses) || addresses.length === 0) {
    return { allowed: false, reason: "no_addresses_resolved", classifiedAddresses: [] };
  }

  const classifiedAddresses = addresses.map(({ address, family }) => {
    const result = classifyIpAddress(address, family);
    // §1.2: an address classify-ip.mjs cannot parse (`result === null`)
    // is BLOCK, never "assume public". IMPORTANT: `result.category` is
    // legitimately `null` for a PUBLIC address (no specific category) —
    // checking `result === null` (not `result?.category ?? …`, which
    // would treat that legitimate null the same as "unparseable" and
    // block every public address) is what keeps those two cases distinct.
    if (result === null) return { address, family, classification: "non_public", category: "unclassifiable" };
    return { address, family, classification: result.classification, category: result.category };
  });

  if (classifiedAddresses.some((a) => a.category === "metadata")) {
    return { allowed: false, reason: "metadata_endpoint", classifiedAddresses };
  }
  if (classifiedAddresses.some((a) => a.category === "unclassifiable")) {
    return { allowed: false, reason: "unclassifiable_address", classifiedAddresses };
  }

  // Test-only: an address explicitly named in `testAllowedPrivateAddresses`
  // (the mock server's own loopback address) is treated as public-equivalent
  // for this decision — but ONLY that exact address. A redirect to any
  // other private/loopback address is still blocked below, so the SSRF
  // "redirect to a private destination" test stays meaningful.
  const isEffectivelyPublic = (a) => a.classification === "public" || testAllowedPrivateAddresses.includes(a.address);

  const publicAddresses = classifiedAddresses.filter(isEffectivelyPublic);
  const nonPublicAddresses = classifiedAddresses.filter((a) => !isEffectivelyPublic(a));

  if (publicAddresses.length > 0 && nonPublicAddresses.length > 0) {
    return { allowed: false, reason: "mixed_public_private_dns", classifiedAddresses };
  }
  if (publicAddresses.length === 0) {
    return { allowed: false, reason: "private_destination", classifiedAddresses };
  }

  return { allowed: true, pinnedAddress: { address: publicAddresses[0].address, family: publicAddresses[0].family }, classifiedAddresses };
}

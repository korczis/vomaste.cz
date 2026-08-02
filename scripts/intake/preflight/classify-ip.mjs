// Pure IP address classification (PHASE_004.md §6). No network access.
// This is the single, load-bearing SSRF gate: every address this
// processor ever connects to — from DNS resolution or a redirect target
// — passes through here before a connection is attempted. When this
// module cannot confidently parse an address, it returns `null`
// (unclassifiable) and callers MUST treat that as BLOCK (§1.2: "Pokud
// parser IP nebo hostname nerozumí: BLOCK") — never as "assume public".

// ---- IPv4: loose (inet_aton-style) parsing, so alternative forms like
// "127.1", "2130706433", "0177.0.0.1", "0x7f000001" are classified
// correctly instead of slipping past as "not a recognized IP" and being
// treated as a public hostname (§6.4). ----

function parseIPv4Part(part) {
  if (part.length === 0) return null;
  let base = 10;
  let digits = part;
  if (/^0x/i.test(part)) {
    base = 16;
    digits = part.slice(2);
  } else if (part.length > 1 && part[0] === "0") {
    base = 8;
    digits = part.slice(1);
  }
  const validDigits = base === 16 ? /^[0-9a-fA-F]+$/ : base === 8 ? /^[0-7]+$/ : /^[0-9]+$/;
  if (digits.length === 0 || !validDigits.test(digits)) return null;
  const value = parseInt(digits, base);
  return Number.isFinite(value) ? value : null;
}

// Returns a 0..0xFFFFFFFF integer, or null if `input` is not a
// syntactically valid IPv4 literal in ANY of the historically-accepted
// forms.
export function parseIPv4Loose(input) {
  if (typeof input !== "string" || input.length === 0 || input.length > 21) return null;
  const parts = input.split(".");
  if (parts.length < 1 || parts.length > 4) return null;
  const values = parts.map(parseIPv4Part);
  if (values.some((v) => v === null || v < 0)) return null;

  if (parts.length === 4) {
    if (values.some((v) => v > 255)) return null;
    return ((values[0] << 24) | (values[1] << 16) | (values[2] << 8) | values[3]) >>> 0;
  }
  if (parts.length === 3) {
    if (values[0] > 255 || values[1] > 255 || values[2] > 0xffff) return null;
    return ((values[0] << 24) | (values[1] << 16) | values[2]) >>> 0;
  }
  if (parts.length === 2) {
    if (values[0] > 255 || values[1] > 0xffffff) return null;
    return ((values[0] << 24) | values[1]) >>> 0;
  }
  if (values[0] > 0xffffffff) return null;
  return values[0] >>> 0;
}

export function formatIPv4(uint32) {
  return [24, 16, 8, 0].map((shift) => (uint32 >>> shift) & 0xff).join(".");
}

function ipv4Cidr(cidr) {
  const [base, prefixStr] = cidr.split("/");
  const prefix = Number(prefixStr);
  const baseInt = parseIPv4Loose(base);
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  return { network: baseInt & mask, mask };
}

function ipv4InCidr(ipInt, cidr) {
  const { network, mask } = ipv4Cidr(cidr);
  return (ipInt & mask) >>> 0 === network >>> 0;
}

// PHASE_004.md §6.1 — category label kept alongside the const
// block so a future range addition can't accidentally drop its reason.
const IPV4_BLOCKED_RANGES = Object.freeze([
  { cidr: "0.0.0.0/8", category: "unspecified" },
  { cidr: "10.0.0.0/8", category: "private" },
  { cidr: "100.64.0.0/10", category: "shared_address_space" },
  { cidr: "127.0.0.0/8", category: "loopback" },
  { cidr: "169.254.0.0/16", category: "link_local" },
  { cidr: "172.16.0.0/12", category: "private" },
  { cidr: "192.0.0.0/24", category: "reserved" },
  { cidr: "192.0.2.0/24", category: "documentation" },
  { cidr: "192.88.99.0/24", category: "6to4_relay" },
  { cidr: "192.168.0.0/16", category: "private" },
  { cidr: "198.18.0.0/15", category: "benchmarking" },
  { cidr: "198.51.100.0/24", category: "documentation" },
  { cidr: "203.0.113.0/24", category: "documentation" },
  { cidr: "224.0.0.0/4", category: "multicast" },
  { cidr: "240.0.0.0/4", category: "reserved" },
  { cidr: "255.255.255.255/32", category: "broadcast" },
]);

// Checked most-specific-prefix-first — e.g. 255.255.255.255/32
// (broadcast) must win over the broader 240.0.0.0/4 (reserved) it also
// falls inside; array declaration order alone would give the wrong
// category for any address covered by more than one range.
const IPV4_RANGES_BY_SPECIFICITY = [...IPV4_BLOCKED_RANGES].sort((a, b) => Number(b.cidr.split("/")[1]) - Number(a.cidr.split("/")[1]));

function classifyIPv4(ipInt) {
  if (formatIPv4(ipInt) === "169.254.169.254") return { classification: "non_public", category: "metadata" };
  for (const { cidr, category } of IPV4_RANGES_BY_SPECIFICITY) {
    if (ipv4InCidr(ipInt, cidr)) return { classification: "non_public", category };
  }
  return { classification: "public", category: null };
}

// ---- IPv6: expand to a 128-bit BigInt, handling "::" compression and an
// embedded-IPv4 tail (::ffff:a.b.c.d, 64:ff9b::a.b.c.d). ----

function expandIPv6Groups(address) {
  if (address.includes("%")) return null; // zone ID — unsupported, fail-closed
  const doubleColonCount = (address.match(/::/g) ?? []).length;
  if (doubleColonCount > 1) return null;

  let head = address;
  let tail = "";
  if (address.includes("::")) {
    [head, tail] = address.split("::");
  }
  const headGroups = head.length > 0 ? head.split(":") : [];
  const tailGroups = tail.length > 0 ? tail.split(":") : [];

  // An embedded IPv4 tail occupies the LAST group slot as two 16-bit groups.
  function expandEmbeddedIPv4(groups) {
    const last = groups[groups.length - 1];
    if (last && last.includes(".")) {
      const ipv4Int = parseIPv4Loose(last);
      if (ipv4Int === null) return null;
      const hi = (ipv4Int >>> 16) & 0xffff;
      const lo = ipv4Int & 0xffff;
      return [...groups.slice(0, -1), hi.toString(16), lo.toString(16)];
    }
    return groups;
  }

  const expandedHead = expandEmbeddedIPv4(headGroups);
  const expandedTail = expandEmbeddedIPv4(tailGroups);
  if (expandedHead === null || expandedTail === null) return null;

  const totalGroups = expandedHead.length + expandedTail.length;
  if (!address.includes("::") && totalGroups !== 8) return null;
  if (address.includes("::") && totalGroups >= 8) return null;
  const zerosNeeded = 8 - totalGroups;
  const allGroups = address.includes("::") ? [...expandedHead, ...Array(zerosNeeded).fill("0"), ...expandedTail] : expandedHead;
  if (allGroups.length !== 8) return null;

  const values = allGroups.map((g) => {
    if (!/^[0-9a-fA-F]{1,4}$/.test(g)) return null;
    return parseInt(g, 16);
  });
  if (values.some((v) => v === null || v > 0xffff)) return null;
  return values;
}

// Returns a BigInt (0..2^128-1) or null if unparseable.
export function parseIPv6(address) {
  const groups = expandIPv6Groups(address);
  if (!groups) return null;
  return groups.reduce((acc, g) => (acc << 16n) | BigInt(g), 0n);
}

function ipv6Cidr(cidr) {
  const [base, prefixStr] = cidr.split("/");
  const prefix = Number(prefixStr);
  const baseValue = parseIPv6(base);
  const mask = prefix === 0 ? 0n : (((1n << 128n) - 1n) << BigInt(128 - prefix)) & ((1n << 128n) - 1n);
  return { network: baseValue & mask, mask };
}

function ipv6InCidr(value, cidr) {
  const { network, mask } = ipv6Cidr(cidr);
  return (value & mask) === network;
}

const IPV6_BLOCKED_RANGES = Object.freeze([
  { cidr: "::/128", category: "unspecified" },
  { cidr: "::1/128", category: "loopback" },
  { cidr: "64:ff9b::/96", category: "nat64" },
  { cidr: "100::/64", category: "discard_only" },
  { cidr: "2001:db8::/32", category: "documentation" },
  { cidr: "2001:10::/28", category: "orchid" },
  { cidr: "fc00::/7", category: "private" },
  { cidr: "fe80::/10", category: "link_local" },
  { cidr: "ff00::/8", category: "multicast" },
]);

const IPV4_MAPPED_PREFIX = "::ffff:0:0/96";

function classifyIPv6(value) {
  if (ipv6InCidr(value, IPV4_MAPPED_PREFIX)) {
    // §6.2: classify an IPv4-mapped IPv6 address by its embedded IPv4.
    const embeddedIPv4 = Number(value & 0xffffffffn);
    return classifyIPv4(embeddedIPv4);
  }
  if (value === parseIPv6("fd00:ec2::254")) return { classification: "non_public", category: "metadata" };
  for (const { cidr, category } of IPV6_BLOCKED_RANGES) {
    if (ipv6InCidr(value, cidr)) return { classification: "non_public", category };
  }
  return { classification: "public", category: null };
}

// Entry point. `address` is a literal IP string (from DNS resolution or
// an IP-literal hostname), `family` is 4 or 6. Returns
// `{ classification: "public"|"non_public", category: string|null }`,
// or `null` if the address cannot be confidently parsed — callers MUST
// treat `null` as BLOCK, never as "assume public" (§1.2).
export function classifyIpAddress(address, family) {
  if (family === 4) {
    const parsed = parseIPv4Loose(address);
    return parsed === null ? null : classifyIPv4(parsed);
  }
  if (family === 6) {
    const parsed = parseIPv6(address);
    return parsed === null ? null : classifyIPv6(parsed);
  }
  return null;
}

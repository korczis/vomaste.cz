#!/usr/bin/env node
/*
 * Thin, standalone ARES lookup — the ONE Czech primary registry that
 * actually works reliably, verified by a read-only capability inventory of
 * ~/dev/prismatic-platform on 2026-07-30. Everything else there is either
 * mock (ČÚZK, registr smluv, ÚOHS), 0%-parsing-success (Justice.cz /
 * obchodní rejstřík), returns nulls (registr skutečných majitelů), or does
 * not exist (NKÚ, UDHPSH). See the correction note in TODO.md — that
 * repo's own reports claiming "99%+ coverage, production ready" are
 * contradicted by its code, so nothing here relies on them.
 *
 * Why reimplemented instead of reused: prismatic-platform's ARES client is
 * Elixir inside a large umbrella app and is only callable via `mix` with
 * the app booted. This is one REST call; a dependency on that platform
 * would break this project's forkability invariant
 * (docs/constitution/OPEN_INTELLIGENCE_COMMONS.md, invariant 4: no private
 * infrastructure, no undocumented build know-how). What was reused is the
 * knowledge of WHICH endpoint and request shape works.
 *
 * WHAT ARES CAN AND CANNOT EVIDENCE — read before citing it:
 *   CAN: IČO, registered name, legal form, registered address, statutory
 *        bodies (directors), registrations, active/dissolved status.
 *   CANNOT: shareholders, beneficial owners, ownership percentages, or
 *        "who controlled this company since when". A claim of the form
 *        "X owns/controls Y since DATE" is NOT supportable by ARES alone.
 *        Do not write one and cite this.
 *
 * Deliberately NOT part of `npm run build`: it makes a live network call,
 * and the production build must stay offline and deterministic. This is a
 * research aid whose output an editor reads and then cites by hand as a
 * normal SRC-## page (with `retrieved`), exactly like any other source.
 *
 * Usage:
 *   node scripts/osint/ares-lookup.mjs --ico=26185610
 *   node scripts/osint/ares-lookup.mjs --name="AGROFERT, a.s." [--limit=5]
 *   ... [--json]   raw JSON instead of the readable summary
 */
const ENDPOINT =
  "https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/vyhledat";

function parseArgs(argv) {
  const out = {};
  for (const a of argv) {
    const m = a.match(/^--([a-z-]+)(?:=(.*))?$/s);
    if (m) out[m[1]] = m[2] ?? true;
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
if (!args.ico && !args.name) {
  console.error(
    'ares-lookup: usage: --ico=<IČO> | --name="<obchodní jméno>" [--limit=N] [--json]',
  );
  process.exit(1);
}
if (args.ico && !/^\d{8}$/.test(String(args.ico))) {
  console.error(`ares-lookup: --ico must be 8 digits (got "${args.ico}").`);
  process.exit(1);
}

const body = args.ico
  ? { ico: [String(args.ico)] }
  : { obchodniJmeno: String(args.name) };
body.pocet = Number(args.limit ?? 10);
body.start = 0;

let res;
try {
  res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
} catch (err) {
  console.error(`ares-lookup: network error contacting ARES — ${err.message}`);
  console.error("Nothing was retrieved; do not cite a result that was never fetched.");
  process.exit(2);
}

if (!res.ok) {
  console.error(`ares-lookup: ARES returned HTTP ${res.status} ${res.statusText}.`);
  console.error("Nothing was retrieved; do not cite a result that was never fetched.");
  process.exit(2);
}

const data = await res.json();
const retrievedAt = new Date().toISOString().slice(0, 10);

if (args.json) {
  console.log(JSON.stringify({ retrieved: retrievedAt, request: body, response: data }, null, 2));
  process.exit(0);
}

const subjects = data.ekonomickeSubjekty ?? [];
console.log(`ARES — ${subjects.length} of ${data.pocetCelkem ?? subjects.length} match(es), retrieved ${retrievedAt}`);
console.log(`endpoint: ${ENDPOINT}`);
if (subjects.length === 0) {
  console.log("\nNo match. That is not evidence the entity does not exist — only that this query found nothing.");
  process.exit(0);
}

for (const s of subjects) {
  const a = s.sidlo ?? {};
  const addr = a.textovaAdresa ?? [a.nazevUlice, a.cisloDomovni, a.nazevObce].filter(Boolean).join(" ");
  console.log(`\n— ${s.obchodniJmeno ?? "(bez jména)"}`);
  console.log(`  IČO:          ${s.ico ?? "—"}`);
  console.log(`  právní forma: ${s.pravniForma ?? "—"}`);
  console.log(`  sídlo:        ${addr || "—"}`);
  if (s.datumVzniku) console.log(`  vznik:        ${s.datumVzniku}`);
  if (s.datumZaniku) console.log(`  zánik:        ${s.datumZaniku}`);
  const regs = Object.entries(s.seznamRegistraci ?? {})
    .filter(([, v]) => v && v !== "NEEXISTUJICI")
    .map(([k, v]) => `${k}=${v}`);
  if (regs.length) console.log(`  registrace:   ${regs.join(", ")}`);
}

console.log(`
Citation note: ARES evidences registry FACTS (identity, address, legal
form, statutory bodies, status). It does NOT evidence shareholders,
beneficial owners, ownership percentages, or since-when control — do not
write such a claim citing this output. When citing, record this endpoint
as the URL and ${retrievedAt} as \`retrieved\`, and label the source type
as a primary official record, which is not an independent editorial
confirmation of anything a news outlet reported.`);

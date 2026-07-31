#!/usr/bin/env node
/*
 * Expand a company's registry neighbourhood into CONTEXT entity pages.
 *
 * Given an IČO, this reads the ARES public-register (VR) branch and writes
 * one context entity page per legal person and per registered natural person
 * it finds: the company itself, its current statutory bodies, its current
 * shareholders. It is the automated version of what an editor otherwise does
 * by hand after an ARES lookup.
 *
 * WHY THIS NEEDS NO AUTHORIZATION, AND WHERE THE LINE STILL IS
 * ------------------------------------------------------------
 * Everything written here is publication_role = "context",
 * dossier_enabled = false, dossier_status = "not_authorized", dossiers = []
 * — a record that a registry relation exists, carrying no claim, no source
 * citation and no dossier membership. That is the shape
 * build-government-roster.mjs already produces, and validate-authorization
 * permits it explicitly: what it forbids is a context entity acquiring
 * dossier_enabled or dossier_status = "authorized".
 *
 * A DOSSIER about any of these people or companies — an investigation with
 * claims about them — still requires an explicit, dated authorization in
 * AGENTS.md written by a human through authorize-entity.mjs. This script
 * cannot and must not create one. Discovery is unblocked; publication of
 * findings is not.
 *
 * WHAT IS DELIBERATELY NOT COPIED FROM THE REGISTRY
 * -------------------------------------------------
 * The VR records contain dates of birth and residential addresses of named
 * private individuals. Those are dropped in stripPersonalData() — in code,
 * not by convention, so no later edit can reintroduce them by accident. A
 * registry being public does not make republishing someone's home address
 * proportionate; the constitution's public-interest test (§7) is per-record,
 * not per-source.
 *
 * WHAT ARES CAN AND CANNOT EVIDENCE HERE
 * --------------------------------------
 *   CAN: identity (IČO), registered name and its history, legal form, seat,
 *        registered statutory bodies with their terms, and — via the VR
 *        branch used here — registered shareholders of an s.r.o. with the
 *        recorded size of their share.
 *   CANNOT: beneficial owners (separate register), and shareholders of an
 *        a.s., which are generally not registered at all. An empty
 *        shareholder list means "not registered here", never "this company
 *        has no owners".
 *
 * NOTE: scripts/osint/ares-lookup.mjs states ARES cannot evidence
 * shareholders. That holds for the basic endpoint it uses, but not for the
 * VR branch used here — verified 2026-07-30 against IČO 28274318, which
 * returns `spolecnici` with `velikostPodilu`. That caveat needs correcting.
 *
 * Live network call, never part of `npm run build`.
 *
 * Usage:
 *   node scripts/osint/expand-entity.mjs --ico=28274318            # dry run
 *   node scripts/osint/expand-entity.mjs --ico=28274318 --write
 *   ... [--json]
 */
import { writeFileSync, readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { slugify, findPossibleDuplicate } from "./lib/entity-dedupe.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const ENTITIES_DIR = join(ROOT, "content", "entities");
const VR_ENDPOINT =
  "https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty-vr";

function parseArgs(argv) {
  const out = {};
  for (const a of argv) {
    const m = a.match(/^--([a-z-]+)(?:=(.*))?$/s);
    if (m) out[m[1]] = m[2] ?? true;
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
if (!args.ico) {
  console.error("expand-entity: usage: --ico=<8 digits> [--write] [--json]");
  process.exit(1);
}
if (!/^\d{8}$/.test(String(args.ico))) {
  console.error(`expand-entity: --ico must be 8 digits (got "${args.ico}").`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);

// --- fetch ----------------------------------------------------------------

async function fetchVr(ico) {
  const res = await fetch(`${VR_ENDPOINT}/${ico}`, {
    headers: { accept: "application/json" },
  });
  if (res.status === 404) {
    console.error(`expand-entity: IČO ${ico} not found in the public register.`);
    process.exit(1);
  }
  if (!res.ok) {
    console.error(`expand-entity: ARES returned ${res.status}.`);
    process.exit(1);
  }
  return res.json();
}

// --- extraction -----------------------------------------------------------

const current = (x) => !x?.datumVymazu;

/* Most VR scalars arrive as [{datumZapisu, hodnota}], including `ico`.
   Reading them raw yields "[object Object]" in output — caught by the first
   dry run against IČO 28274318. */
const value = (v) => {
  if (Array.isArray(v)) return value(v.find(current) ?? v[0]);
  if (v && typeof v === "object" && "hodnota" in v) return String(v.hodnota);
  return v == null ? null : String(v);
};

/* The single place personal data is dropped. Everything downstream sees only
   what this returns, so no later change can reintroduce a birth date or a
   home address into a generated page. */
function titleCase(name) {
  // The register stores personal names in caps ("PETR VENCÁLEK"); rendering
  // that as a page heading would be wrong. Hyphenated surnames keep both
  // parts capitalised.
  return name
    .toLocaleLowerCase("cs")
    .replace(/(^|[\s-])(\p{L})/gu, (_, sep, ch) => sep + ch.toLocaleUpperCase("cs"));
}

function stripPersonalData(fo) {
  const bare = [fo.jmeno, fo.prijmeni].filter(Boolean).join(" ");
  return {
    // Academic titles are kept for display but excluded from the slug: the
    // register gained "Bc." for this very person in 2022, and an id that
    // moves when someone finishes a degree is not an id.
    name: [fo.titulPredJmenem, titleCase(bare)].filter(Boolean).join(" "),
    slugSource: bare,
    // datumNarozeni and adresa are intentionally NOT read.
  };
}

function personOrCompany(osoba) {
  if (osoba?.fyzickaOsoba) {
    return { kind: "person", ...stripPersonalData(osoba.fyzickaOsoba) };
  }
  const po = osoba?.pravnickaOsoba;
  if (po) return { kind: "company", name: value(po.obchodniJmeno), ico: value(po.ico) };
  return null;
}

function dedupe(list) {
  const seen = new Set();
  return list.filter((x) => {
    const key = `${x.kind}:${x.ico ?? x.name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function extract(record) {
  const names = record.obchodniJmeno ?? [];
  const seat = (record.adresy ?? []).find(current)?.adresa?.textovaAdresa ?? null;

  const officers = [];
  for (const organ of record.statutarniOrgany ?? []) {
    for (const m of organ.clenoveOrganu ?? []) {
      if (!current(m)) continue;
      const who = personOrCompany(m);
      if (!who) continue;
      officers.push({ ...who, role: m.clenstvi?.funkce?.nazev ?? "člen orgánu" });
    }
  }

  const shareholders = [];
  for (const blok of record.spolecnici ?? []) {
    for (const s of blok.spolecnik ?? []) {
      if (!current(s)) continue;
      const who = personOrCompany(s.osoba);
      if (!who) continue;
      const podil = (s.podil ?? []).find(current)?.velikostPodilu;
      shareholders.push({ ...who, share: podil ? String(podil.hodnota) : null });
    }
  }

  return {
    ico: value(record.ico),
    name: value(names) ?? null,
    formerNames: names.filter((n) => !current(n)).map((n) => String(n.hodnota)),
    seat,
    officers: dedupe(officers),
    shareholders: dedupe(shareholders),
  };
}

// --- ids and weights ------------------------------------------------------

// --- registry state -------------------------------------------------------

const entityFiles = readdirSync(ENTITIES_DIR).filter(
  (f) => f.endsWith(".md") && f !== "_index.md",
);
const existingIds = new Set(entityFiles.map((f) => f.replace(/\.md$/, "")));
const entityTexts = new Map(
  entityFiles.map((f) => [f.replace(/\.md$/, ""), readFileSync(join(ENTITIES_DIR, f), "utf8")]),
);

/* content/entities/_index.md is sort_by = "weight", so a page without one
   sorts unpredictably. Continue past the current maximum rather than
   renumbering anything that already exists. */
let nextWeight =
  Math.max(
    0,
    ...entityFiles.map((f) => {
      const m = readFileSync(join(ENTITIES_DIR, f), "utf8").match(/^weight = (\d+)$/m);
      return m ? Number(m[1]) : 0;
    }),
  ) + 1;

// --- page rendering -------------------------------------------------------

const esc = (s) => String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"');

const DISCLAIMER_COMPANY = `**Kontextová entita, ne předmět šetření.** Tahle stránka eviduje pouze to,
že subjekt existuje ve veřejném rejstříku a objevil se při rozšiřování
rejstříkového okolí. Nenese žádné tvrzení, nic nedokládá a neznamená
podezření ani hodnocení. Dossier o tomto subjektu by vyžadoval samostatné,
datované rozhodnutí zapsané v autorizačním logu.`;

const DISCLAIMER_PERSON = `**Kontextová entita, ne předmět šetření.** Tahle stránka eviduje jednu
zveřejněnou rejstříkovou vazbu a nic víc — žádný profil, žádné tvrzení,
žádné naznačené pochybení. Být zapsán ve statutárním orgánu nebo držet
podíl je běžný, veřejně evidovaný fakt. Dossier o této osobě by vyžadoval
samostatné, datované rozhodnutí zapsané v autorizačním logu.

Datum narození ani adresu bydliště tento web z rejstříku nepřebírá,
přestože je záznam obsahuje — pro evidenci vazby nejsou potřebné.`;

let PROVENANCE = "";

function frontMatter({ id, title, description, type, weight }) {
  return `+++
title = "${esc(title)}"
description = "${esc(description)}"
template = "entity.html"
weight = ${weight}

[extra]
record_type = "entity"
entity_id = "${id}"
entity_type = "${type}"
depth = 3
subject = false
publication_role = "context"
dossier_enabled = false
dossier_status = "not_authorized"
coverage_state = "referenced"
discovered_at = "${today}"
discovered_via = ["${PROVENANCE}"]
dossiers = []
+++`;
}

function renderCompany(c, weight) {
  const former = c.formerNames?.length
    ? ` Dřívější zapsané názvy: ${c.formerNames.join(", ")}.`
    : "";
  return `${frontMatter({
    id: c.id,
    title: c.name,
    description: `${c.name} (IČO ${c.ico}) — kontextový záznam rejstříkové vazby z ARES, ne dossier.`,
    type: "company",
    weight,
  })}

Záznam z veřejného rejstříku (ARES), pořízený programově ${today}. IČO ${c.ico}.${
    c.seat ? ` Sídlo podle rejstříku: ${c.seat}.` : ""
  }${former}

${DISCLAIMER_COMPANY}
`;
}

function renderPerson(p, weight, contextLine) {
  return `${frontMatter({
    id: p.id,
    title: p.name,
    description: `${p.name} — kontextový záznam rejstříkové vazby z ARES, ne dossier.`,
    type: "person",
    weight,
  })}

Záznam z veřejného rejstříku (ARES), pořízený programově ${today}:
${contextLine}

${DISCLAIMER_PERSON}
`;
}

// --- main -----------------------------------------------------------------

const payload = await fetchVr(String(args.ico));
const record = payload?.zaznamy?.[0];
if (!record) {
  console.error(`expand-entity: no VR record in the response for ${args.ico}.`);
  process.exit(1);
}

const data = extract(record);
PROVENANCE = `ares-expansion-${data.ico}-${today}`;

const planned = new Map();
const plan = (id, kind, label, render, ident = {}) => {
  if (planned.has(id)) {
    planned.get(id).label += `; ${label.split(" — ").pop()}`;
    return;
  }
  // ident carries what findPossibleDuplicate needs (ico for companies,
  // slugSource for people). Without it the check silently never fires —
  // which is exactly what the first run did.
  planned.set(id, { id, kind, label, render, ...ident });
};

plan(
  existingIds.has(slugify(data.name)) ? `ico-${data.ico}` : slugify(data.name),
  "company",
  `${data.name} (IČO ${data.ico})`,
  (self, w) => renderCompany({ ...data, id: self.id }, w),
  { ico: data.ico, name: data.name },
);

for (const o of data.officers) {
  const id = o.ico ? `ico-${o.ico}` : slugify(o.slugSource ?? o.name);
  const label = o.kind === "person" ? o.name : `${o.name} (IČO ${o.ico})`;
  plan(id, o.kind, `${label} — ${o.role}`, (self, w) =>
    o.kind === "person"
      ? renderPerson(
          { ...o, id: self.id },
          w,
          `zapsán jako **${o.role}** společnosti ${data.name} (IČO ${data.ico}).`,
        )
      : renderCompany({ ...o, id: self.id, formerNames: [], seat: null }, w),
    { ico: o.ico, slugSource: o.slugSource, name: o.name },
  );
}

for (const s of data.shareholders) {
  const id = s.ico ? `ico-${s.ico}` : slugify(s.slugSource ?? s.name);
  const share = s.share ? ` (podíl ${s.share})` : "";
  const label = s.kind === "person" ? s.name : `${s.name} (IČO ${s.ico})`;
  plan(id, s.kind, `${label} — společník${share}`, (self, w) =>
    s.kind === "person"
      ? renderPerson(
          { ...s, id: self.id },
          w,
          `zapsán jako **společník**${share} společnosti ${data.name} (IČO ${data.ico}).`,
        )
      : renderCompany({ ...s, id: self.id, formerNames: [], seat: null }, w),
    { ico: s.ico, slugSource: s.slugSource, name: s.name },
  );
}

const created = [];
const skipped = [];
const suspected = [];
for (const p of planned.values()) {
  const dup = findPossibleDuplicate(p, entityTexts);
  if (dup) {
    suspected.push({ ...p, duplicateOf: dup.id, why: dup.why });
    continue;
  }
  if (existingIds.has(p.id)) {
    /* Never overwrite: an existing page may carry hand-written editorial
       context, dossier membership and claim links this script knows nothing
       about. Overwriting it would be data loss. A slug collision with a
       namesake also lands here — that is a signal for manual review, not a
       reason to add --force. */
    skipped.push(p);
    continue;
  }
  const weight = nextWeight++;
  if (args.write) {
    writeFileSync(join(ENTITIES_DIR, `${p.id}.md`), p.render(p, weight), "utf8");
  }
  created.push(p);
}

const plain = (list) => list.map(({ id, kind, label }) => ({ id, kind, label }));

if (args.json) {
  console.log(
    JSON.stringify(
      {
        ico: data.ico,
        provenance: PROVENANCE,
        wrote: Boolean(args.write),
        created: plain(created),
        skipped: plain(skipped),
        suspectedDuplicates: suspected.map(({ id, label, duplicateOf, why }) => ({ id, label, duplicateOf, why })),
      },
      null,
      2,
    ),
  );
} else {
  console.log(`ARES expansion — ${data.name} (IČO ${data.ico}), ${today}`);
  console.log(args.write ? "mode: WRITE\n" : "mode: dry run (přidej --write)\n");
  console.log(
    `${created.length} kontextových entit${args.write ? " zapsáno" : " by vzniklo"}:`,
  );
  for (const p of created) console.log(`  + ${p.id.padEnd(28)} ${p.label}`);
  if (skipped.length) {
    console.log(`\n${skipped.length} přeskočeno (stránka existuje, nikdy nepřepisuji):`);
    for (const p of skipped) console.log(`  = ${p.id.padEnd(28)} ${p.label}`);
  }
  if (suspected.length) {
    console.log(
      `\n${suspected.length} NEZALOŽENO — nejspíš už pro ně stránka existuje pod jiným slugem:`,
    );
    for (const p of suspected) {
      console.log(`  ? ${p.id.padEnd(28)} ${p.label}`);
      console.log(`    -> ${p.duplicateOf} (${p.why}) — ověř ručně, skript nespojuje`);
    }
  }
  console.log(
    '\nVše vytvořené je publication_role = "context", dossiers = [], bez tvrzení.\n' +
      "Dossier o kterémkoli z nich vyžaduje samostatnou autorizaci\n" +
      "(scripts/dossier/authorize-entity.mjs). Datum narození ani adresu\n" +
      "bydliště skript z rejstříku nepřebírá.",
  );
}

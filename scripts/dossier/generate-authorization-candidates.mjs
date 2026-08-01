#!/usr/bin/env node
/*
 * Generates a human-review report of every context entity currently in the
 * system — i.e. every entity discovered because a source/claim named it,
 * but which has no authorized dossier of its own. This is NOT an
 * authorization: it never writes to AGENTS.md, never sets dossier_status
 * to "authorized", and is not published as a public route (publishing
 * "people we might investigate next" would itself be an editorial
 * overreach this site's own rules exist to prevent).
 *
 * Output:
 *   data/generated/authorization-candidates.json — machine-readable
 *   reports/authorization-candidates.md          — human-readable, for the
 *                                                   site owner to review
 *
 * Only reports facts already documented within the CURRENT authorized
 * dossier (its own claims/sources/relations) — it does not speculate about
 * what a hypothetical future dossier might cover. That call is the site
 * owner's alone.
 *
 * T-028 fáze H: čte VÝHRADNĚ compiled kanonický model. Provenienční stopa
 * objevení (claims/sources — ručně kurátorovaná, NENÍ to unie vazeb
 * z relations) žije od fáze H v entity.provenance.claimRefs/sourceRefs
 * (lokální id s dossier kontextem entity.dossiers — viz
 * schemas/canonical/entity.schema.json). Rodiny zdrojů a vztahy jdou
 * z kanonických source/relation záznamů. Výstupy nejsou build exporty
 * (data/generated/ + reports/ jsou gitignored).
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getCompiledModel, localPart, recordsOf } from "./lib/compiled-model.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const JSON_OUT = join(ROOT, "data/generated/authorization-candidates.json");
const MD_OUT = join(ROOT, "reports/authorization-candidates.md");

const compiled = getCompiledModel(ROOT);
const dossierSlugs = compiled.records.filter((w) => w.registry === "dossier").map((w) => w.dossier);

// --- per-dossier source-family lookup, so we can report independent-
//     confirmation counts, not just raw source counts (kanonické
//     sourceFamily; zdroj bez rodiny je vlastní singleton — stejná
//     sémantika jako validate-semantics S2) ---
function loadSourceFamilies(slug) {
  const familyOf = new Map();
  for (const w of recordsOf(compiled, slug, "sources")) {
    const r = w.record;
    familyOf.set(r.identifier, r.sourceFamily || `singleton:${r.identifier}`);
  }
  return familyOf;
}

function loadRelationsFor(slug) {
  return recordsOf(compiled, slug, "relations").map((w) => ({
    rel_id: w.record.identifier,
    source: localPart(w.record.sourceEntity?.["@id"]),
    target: localPart(w.record.targetEntity?.["@id"]),
    label: w.record.label,
  }));
}

const relationsByDossier = new Map(dossierSlugs.map((s) => [s, loadRelationsFor(s)]));
const familiesByDossier = new Map(dossierSlugs.map((s) => [s, loadSourceFamilies(s)]));

const candidates = [];

for (const w of compiled.entities) {
  const r = w.record;
  if (r.publicationRole !== "context") continue; // only context entities are candidates

  const entityId = r.entityId;
  const dossiers = r.dossiers ?? [];
  const claims = r.provenance?.claimRefs ?? [];
  const sources = r.provenance?.sourceRefs ?? [];

  const independentFamilies = new Set();
  for (const d of dossiers) {
    const familyOf = familiesByDossier.get(d);
    if (!familyOf) continue;
    for (const s of sources) if (familyOf.has(s)) independentFamilies.add(familyOf.get(s));
  }

  const relations = [];
  for (const d of dossiers) {
    for (const rel of relationsByDossier.get(d) || []) {
      if (rel.source === entityId || rel.target === entityId) relations.push({ dossier: d, ...rel });
    }
  }

  candidates.push({
    entity_id: entityId,
    name: r.title,
    entity_type: r.entityType,
    dossier_status: r.dossierStatus,
    appears_in_dossiers: dossiers,
    claims,
    sources,
    independent_source_families: independentFamilies.size,
    relations: relations.map((rel) => `${rel.rel_id} (${rel.source} -> ${rel.target}, "${rel.label}", dossier: ${rel.dossier})`),
    missing: ["explicit owner authorization to promote this to its own dossier"],
  });
}

candidates.sort((a, b) => a.entity_id.localeCompare(b.entity_id));

mkdirSync(dirname(JSON_OUT), { recursive: true });
writeFileSync(JSON_OUT, JSON.stringify(candidates, null, 2) + "\n", "utf8");

const md = [
  "# Authorization candidates report",
  "",
  "**This is not an authorization.** Every entity below is a context entity —",
  "discovered because it is named in an already-authorized dossier's sources",
  "or claims. None of them has, or is proposed to automatically receive, its",
  "own dossier. Promoting any of these to a subject with its own dossier",
  "requires the site owner's explicit, dated, on-record decision in",
  "`AGENTS.md` — this report exists only to make that decision informed,",
  "never to make it for them.",
  "",
  `Generated from ${candidates.length} context entit${candidates.length === 1 ? "y" : "ies"} across ${dossierSlugs.length} dossier(s). Regenerate with \`npm run generate:candidates\`.`,
  "",
  ...candidates.flatMap((c) => [
    `## ${c.name} (\`${c.entity_id}\`)`,
    "",
    `- Type: ${c.entity_type}`,
    `- Status: ${c.dossier_status}`,
    `- Appears in: ${c.appears_in_dossiers.join(", ") || "—"}`,
    `- Claims: ${c.claims.join(", ") || "none"}`,
    `- Sources: ${c.sources.join(", ") || "none"} (${c.independent_source_families} independent source famil${c.independent_source_families === 1 ? "y" : "ies"})`,
    `- Relations: ${c.relations.length === 0 ? "none" : ""}`,
    ...c.relations.map((r) => `  - ${r}`),
    `- Missing: ${c.missing.join("; ")}`,
    "",
  ]),
].join("\n");

mkdirSync(dirname(MD_OUT), { recursive: true });
writeFileSync(MD_OUT, md, "utf8");
console.log(`Wrote ${JSON_OUT} and ${MD_OUT}: ${candidates.length} candidate(s) (not authorized, not published).`);

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
 * T-028 fáze G — ZÁMĚRNÁ VÝJIMKA (blokováno inventářem migrace): tenhle
 * report čte provenienční pole entit `claims`/`sources` (a rodiny
 * zdrojů per dossier), která kanonický model v1 vědomě NEPŘENÁŠÍ — viz
 * „Inventář polí, která kanonické schéma nepřenáší" v
 * docs/migrations/json-first-migration-report.md (entity claims 73×,
 * sources 73×). Nejde je odvodit z compiled modelu: NEJSOU to unie vazeb
 * z relations (ověřeno — 30/63 kontextových entit se liší), je to ručně
 * kurátorovaná stopa „přes co byla entita objevena". Přepnout na
 * compiled model by tedy znamenalo buď data vymyslet, nebo změnit
 * význam reportu. Zůstává na front matter do fáze H, kde se o těchto
 * polích rozhodne (schéma v2 / prezentační vrstva / zánik) — pak se
 * tento skript přepne nebo zruší. Výstupy nejsou build exporty
 * (data/generated/ + reports/ jsou gitignored).
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DOSSIERS_ROOT = join(ROOT, "content/dossiers");
const ENTITIES_ROOT = join(ROOT, "content/entities");
const JSON_OUT = join(ROOT, "data/generated/authorization-candidates.json");
const MD_OUT = join(ROOT, "reports/authorization-candidates.md");

function extractField(text, key) {
  const re = new RegExp(`^${key}\\s*=\\s*"((?:[^"\\\\]|\\\\.)*)"`, "m");
  const found = text.match(re);
  return found ? found[1].replace(/\\(.)/g, "$1") : null;
}
function extractArrayField(text, key) {
  const re = new RegExp(`^${key}\\s*=\\s*\\[([^\\]]*)\\]`, "m");
  const found = text.match(re);
  if (!found) return [];
  return [...found[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => x[1].replace(/\\"/g, '"'));
}
function frontMatterOf(text) {
  const fmEnd = text.indexOf("\n+++", 3);
  return text.slice(0, fmEnd);
}

// --- per-dossier source-family lookup, so we can report independent-
//     confirmation counts, not just raw source counts ---
function loadSourceFamilies(slug) {
  const srcDir = join(DOSSIERS_ROOT, slug, "sources");
  const familyOf = new Map();
  for (const file of readdirSync(srcDir).filter((f) => /^src-\d+\.md$/.test(f))) {
    const text = readFileSync(join(srcDir, file), "utf8");
    const fm = frontMatterOf(text);
    const srcId = extractField(fm, "src_id");
    const family = extractField(fm, "family");
    if (srcId) familyOf.set(srcId, family || `singleton:${srcId}`);
  }
  return familyOf;
}

function loadRelationsFor(slug) {
  const relDir = join(DOSSIERS_ROOT, slug, "relations");
  return readdirSync(relDir)
    .filter((f) => f !== "_index.md" && f.endsWith(".md"))
    .map((f) => {
      const text = readFileSync(join(relDir, f), "utf8");
      const fm = frontMatterOf(text);
      return {
        rel_id: extractField(fm, "rel_id"),
        source: extractField(fm, "source"),
        target: extractField(fm, "target"),
        label: extractField(fm, "label"),
      };
    });
}

const dossierSlugs = readdirSync(DOSSIERS_ROOT).filter((f) =>
  statSync(join(DOSSIERS_ROOT, f)).isDirectory(),
);
const relationsByDossier = new Map(dossierSlugs.map((s) => [s, loadRelationsFor(s)]));
const familiesByDossier = new Map(dossierSlugs.map((s) => [s, loadSourceFamilies(s)]));

const entityFiles = readdirSync(ENTITIES_ROOT).filter((f) => f !== "_index.md" && f.endsWith(".md"));
const candidates = [];

for (const file of entityFiles) {
  const text = readFileSync(join(ENTITIES_ROOT, file), "utf8");
  const fm = frontMatterOf(text);
  const publicationRole = extractField(fm, "publication_role");
  if (publicationRole !== "context") continue; // only context entities are candidates

  const entityId = extractField(fm, "entity_id");
  const dossiers = extractArrayField(fm, "dossiers");
  const claims = extractArrayField(fm, "claims");
  const sources = extractArrayField(fm, "sources");
  const titleMatch = text.match(/^title = "(.*)"$/m);

  const independentFamilies = new Set();
  for (const d of dossiers) {
    const familyOf = familiesByDossier.get(d);
    if (!familyOf) continue;
    for (const s of sources) if (familyOf.has(s)) independentFamilies.add(familyOf.get(s));
  }

  const relations = [];
  for (const d of dossiers) {
    for (const r of relationsByDossier.get(d) || []) {
      if (r.source === entityId || r.target === entityId) relations.push({ dossier: d, ...r });
    }
  }

  candidates.push({
    entity_id: entityId,
    name: titleMatch ? titleMatch[1] : entityId,
    entity_type: extractField(fm, "entity_type"),
    dossier_status: extractField(fm, "dossier_status"),
    appears_in_dossiers: dossiers,
    claims,
    sources,
    independent_source_families: independentFamilies.size,
    relations: relations.map((r) => `${r.rel_id} (${r.source} -> ${r.target}, "${r.label}", dossier: ${r.dossier})`),
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

#!/usr/bin/env node
/*
 * Placeholder/scaffold generator for a new entity dossier, for external
 * tooling (or a human) to invoke once — and only once — a subject is
 * actually authorized. Generic: knows nothing about any specific real
 * person; takes one as an argument and refuses to run without proof that
 * person is on the record.
 *
 * SAFETY GATE (the actual point of this script, not an afterthought):
 * refuses to write anything unless AGENTS.md's append-only "Content about
 * real parties" log already contains a
 * "### Authorized subject: <title> ..." heading matching --title. This
 * mirrors the dossier-entry skill's step 0 in code, so a scaffold can
 * never be used to pre-stage content about someone who isn't authorized
 * -- "it's just a placeholder, not published content" is exactly the
 * rationalization AGENTS.md's authorization process exists to foreclose.
 *
 * Targets the model AGENTS.md already documents as the general framework
 * (each entity dossier owns its own registries directly, no aggregate
 * needed for a single new subject) -- NOT the current macinka-turek
 * transitional aggregate-owns-everything shape, which the in-progress
 * T-001 migration is replacing. Generated file *shapes* (front matter
 * fields, registry directories) are modeled on the already-documented
 * invariants; actual template rendering compatibility should be verified
 * with `npm run build` after T-001 merges and after this is run for a
 * real authorized subject -- this script does not claim that part works,
 * only that the data shape matches the documented contract.
 *
 * Deliberately does NOT touch data/dossiers.toml. Registering the dossier
 * (making it real/routable/buildable) is a separate, deliberate step --
 * scaffolding files on disk and registering them in the build are kept
 * apart on purpose, so running this script is never by itself "the
 * dossier now exists publicly."
 *
 * Usage:
 *   node scripts/dossier/scaffold-entity-dossier.mjs \
 *     --slug=jane-doe --title="Jane Doe" \
 *     [--description="..."]
 */
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");

function parseArgs(argv) {
  const out = {};
  for (const arg of argv) {
    const m = arg.match(/^--([a-z-]+)=(.*)$/s);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
const { slug, title } = args;
const description =
  args.description ||
  `Neutrální, zdroji doložený přehled o osobě ${title || "(TODO: title)"}.`;

if (!slug || !title) {
  console.error(
    "scaffold-entity-dossier: usage: --slug=<slug> --title=\"<Full Name>\" [--description=\"...\"]",
  );
  process.exit(1);
}
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
  console.error(`scaffold-entity-dossier: --slug "${slug}" must be lowercase-kebab-case.`);
  process.exit(1);
}

// --- Safety gate: refuse without a matching AGENTS.md authorization ---
const agentsPath = path.join(ROOT, "AGENTS.md");
const agentsText = readFileSync(agentsPath, "utf8");
const headingRe = /^### Authorized subject: (.+?)(?: \(on the record\))?\s*$/gm;
const authorizedTitles = [...agentsText.matchAll(headingRe)].map((m) => m[1].trim());
let isAuthorized = authorizedTitles.some(
  (t) => t.toLowerCase() === title.trim().toLowerCase(),
);

// Second accepted proof, equally on-record: a structured record in
// data/authorizations.toml naming this subject id. The heading regex above
// only understands the single-subject form ("### Authorized subject: X");
// an entry authorizing several people at once is headed differently
// ("### Authorized subjects, <date>: …") and lists them in prose, so
// regexing headings alone would refuse subjects that ARE authorized.
// authorizations.toml is the machine-readable transcription of the same
// log (see its header) and validate-authorization.mjs checks the two
// against each other, so trusting it here does not widen what counts as
// authorization — it just stops the gate from missing half of it.
// Pass --subject=<entity_id> to use this path.
if (!isAuthorized && args.subject) {
  const authPath = path.join(ROOT, "data", "authorizations.toml");
  if (existsSync(authPath)) {
    const authText = readFileSync(authPath, "utf8");
    for (const block of authText.split(/\n\[\[authorizations\]\]/).slice(1)) {
      const m = block.match(/^subjects\s*=\s*\[([^\]]*)\]/m);
      if (!m) continue;
      const ids = [...m[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => x[1]);
      if (ids.includes(args.subject)) { isAuthorized = true; break; }
    }
  }
}

if (!isAuthorized) {
  console.error(
    `scaffold-entity-dossier: BLOCKED -- no "### Authorized subject: ${title}" entry found in AGENTS.md's append-only authorization log.`,
  );
  console.error(
    "This script never scaffolds a dossier for anyone not already on the record. Get the site owner's explicit, dated authorization first (see the dossier-entry skill), append it to AGENTS.md, then re-run this.",
  );
  if (authorizedTitles.length > 0) {
    console.error(`Currently authorized subjects: ${authorizedTitles.join(", ")}`);
  }
  process.exit(1);
}

const dossierRoot = path.join(ROOT, "content", "dossiers", slug);
const dataRoot = path.join(ROOT, "data", "dossiers", slug);

if (existsSync(dossierRoot) || existsSync(dataRoot)) {
  console.error(
    `scaffold-entity-dossier: ${dossierRoot} or ${dataRoot} already exists -- refusing to overwrite. Remove it first if this is intentional.`,
  );
  process.exit(1);
}

function write(relPath, content) {
  const full = path.join(ROOT, relPath);
  mkdirSync(path.dirname(full), { recursive: true });
  writeFileSync(full, content);
  console.log(`  created ${relPath}`);
}

const registryIndex = (registryLabel, registryPath, extraNote = "") => `+++
title = "${registryLabel}"
description = "TODO: ${registryLabel.toLowerCase()} pro ${title} -- doplnit po přidání prvního záznamu."
template = "dossier-${registryPath}-index.html"
sort_by = "weight"

[extra]
dossier = "${slug}"
lang = "cs"
seo_type = "CollectionPage"
+++

TODO: zatím žádné záznamy. ${extraNote}
`;

console.log(`scaffold-entity-dossier: generating placeholder skeleton for "${title}" (${slug})`);

write(
  `content/dossiers/${slug}/_index.md`,
  `+++
title = "${title}"
description = "${description}"
template = "entity-dossier.html"

[extra]
dossier = "${slug}"
dossier_title = "${title}"
dossier_type = "entity"
canonical_dossier = "${slug}"
lang = "cs"
seo_type = "ProfilePage"

[extra.authorization]
authorized = true
record_ids = ["TODO: AUTH-YYYY-MM-DD-X"]
+++

TODO: krátký neutrální úvodní odstavec o ${title} -- veřejná funkce/role,
proč je předmětem veřejného zájmu, jaký je rozsah tohoto dossieru (viz
autorizační záznam v AGENTS.md). Žádné tvrzení zde ani jinde v tomto
dossieru bez jmenovaného, dohledatelného, nezávislého zdroje -- viz
skill dossier-entry.
`,
);

write(
  `content/dossiers/${slug}/sources/_index.md`,
  registryIndex("Registr zdrojů", "sources", "Zdroj cituj, jen pokud jsi ho skutečně otevřel/a."),
);
write(
  `content/dossiers/${slug}/claims/_index.md`,
  registryIndex("Registr tvrzení", "claims", "Jedno tvrzení = jeden ověřitelný výrok se stavem dle skutečné síly důkazu."),
);
write(
  `content/dossiers/${slug}/cases/_index.md`,
  registryIndex("Registr kauz", "cases"),
);
write(
  `content/dossiers/${slug}/gaps/_index.md`,
  registryIndex("Registr mezer", "gaps", "Otevřenost není zjištění žádným směrem."),
);
write(
  `content/dossiers/${slug}/relations/_index.md`,
  registryIndex("Registr vztahů", "relations", "Každá hrana musí být krytá tvrzeními a zdroji."),
);
write(
  `content/dossiers/${slug}/evidence/_index.md`,
  registryIndex("Registr evidence", "evidence"),
);

write(
  `data/dossiers/${slug}/graph.toml`,
  `# Relationship graph data model for "${title}" (content/dossiers/${slug}/).
# See data/dossiers/macinka-turek/graph.toml for the documented shape and
# scripts/dossier/validate-graph.mjs for what's enforced. Empty until the
# first authorized relation is added.

nodes = []
edges = []
`,
);
write(
  `data/dossiers/${slug}/updates.toml`,
  `# Auditable update history for "${title}" (content/dossiers/${slug}/).
# Append-only: each entry records what was *actually* checked and changed
# on that date -- never claim a change that didn't happen.
`,
);

console.log(`
Done. NOT registered in data/dossiers.toml -- the dossier does not exist
in any build yet. Next steps (manual, deliberate, one at a time):
  1. Fill in the TODO placeholders above with real, sourced content
     (see the dossier-entry skill).
  2. Add the [[dossiers]] entry to data/dossiers.toml.
  3. npm run build -- must be green before this is considered done.
`);

#!/usr/bin/env node
/*
 * Scaffold nového KANONICKÉHO dossier balíčku (T-028 fáze I).
 *
 * Nástupce archivovaného scripts/migrations/archive/scaffold-entity-dossier.mjs
 * (ten psal content/** front matter + graph.toml/updates.toml — vstupy,
 * které od fáze H neexistují). Tenhle scaffold vytváří rovnou kanonický
 * balíček:
 *
 *   data/dossiers/<slug>/dossier.json      minimální VALIDNÍ entity dossier
 *   data/dossiers/<slug>/{claims,sources,cases,gaps,relations,updates}/
 *                                          prázdné registry adresáře
 *
 * SAFETY GATE (smysl skriptu, ne detail): odmítne běžet, pokud
 * data/authorizations.toml neobsahuje záznam s id == --authorization-record-id,
 * jehož subjects zahrnují --subject. authorizations.toml je auditně navázaná
 * transkripce append-only logu v AGENTS.md (viz jeho hlavičku) — autorizace
 * vzniká VÝHRADNĚ zápisem do toho logu (scripts/dossier/authorize-entity.mjs,
 * interaktivně, člověkem). Placeholder pro neautorizovaný subjekt je stejně
 * out of scope jako jeho claims — přesně tuhle racionalizaci („je to jen
 * placeholder") brána forecloses, stejně jako její archivovaný předchůdce.
 *
 * Záměrně NEzapisuje žádný claim/source/case/gap/relation a nedotýká se
 * _shared/entities — obsah je samostatný, plně lidský a plně zdrojovaný
 * redakční akt (skill dossier-entry). Vytvořený balíček projde
 * `npm run data:validate` (dossier bez vlastních tvrzení tabulku nemá,
 * S7/S8 běží až nad `graph`, který scaffold nevytváří).
 *
 * Usage:
 *   npm run dossier:scaffold -- --slug=jana-novakova --title="Jana Nováková" \
 *     --subject=novakova --authorization-record-id=AUTH-2026-08-01-X \
 *     [--description="..."]
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const AUTHORIZATIONS_TOML = join(ROOT, "data/authorizations.toml");
// Sdílený standing-scope záznam (governance záznam 2026-08-10 v AGENTS.md,
// subjects = ["*"]). Rekurzivní rozšiřování dossierů do šířky se scaffolduje
// pod ním bez per-subjektového autorizačního kola; explicitní
// --authorization-record-id dál funguje beze změny.
export const STANDING_SCOPE_RECORD_ID = "AUTH-2026-08-10-RECURSIVE-SCOPE";
export const RECORDS_ROOT = join(ROOT, "data/dossiers");
export const REGISTRY_DIRS = Object.freeze([
  "claims",
  "sources",
  "cases",
  "gaps",
  "relations",
  "updates",
]);

// Parser [[authorizations]] bloků — čte identická data jako
// scripts/data/validate-semantics.mjs (loadAuthorizationIds) a archivovaný
// scaffold; navíc k id čte subjects, aby brána ověřila i vazbu
// záznam ↔ subjekt, ne jen existenci id.
export function loadAuthorizationRecords(tomlPath = AUTHORIZATIONS_TOML) {
  const text = readFileSync(tomlPath, "utf8");
  const records = new Map();
  const re = /\[\[authorizations\]\]\n([\s\S]*?)(?=\n\[\[|\n*$)/g;
  let m;
  while ((m = re.exec(text))) {
    const id = m[1].match(/^id\s*=\s*"((?:[^"\\]|\\.)*)"/m)?.[1];
    if (!id) continue;
    const subjectsRaw = m[1].match(/^subjects\s*=\s*\[([^\]]*)\]/m)?.[1] ?? "";
    const subjects = [...subjectsRaw.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => x[1]);
    records.set(id, { id, subjects });
  }
  return records;
}

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/*
 * Vytvoří balíček. Hází Error s prefixem "BLOCKED" při neprůchodu
 * autorizační bránou; vrací { dir, dossierFile, registryDirs }.
 * root/authorizationsPath jsou injektovatelné kvůli testům — testy
 * pracují výhradně nad temp adresářem a syntetickou autorizací, nikdy
 * nad reálným data/dossiers/**.
 */
export function scaffoldDossier({
  slug,
  title,
  subject,
  authorizationRecordId,
  description,
  root = RECORDS_ROOT,
  authorizationsPath = AUTHORIZATIONS_TOML,
  today = new Date().toISOString().slice(0, 10),
}) {
  if (!slug || !SLUG_RE.test(slug)) {
    throw new Error(`scaffold-dossier: --slug "${slug ?? ""}" musí být lowercase-kebab-case.`);
  }
  if (!title || !title.trim()) {
    throw new Error("scaffold-dossier: --title je povinný (celé jméno subjektu).");
  }
  if (!subject || !SLUG_RE.test(subject)) {
    throw new Error(
      `scaffold-dossier: --subject "${subject ?? ""}" musí být subject slug (např. "babis").`,
    );
  }
  // Standing scope (governance záznam 2026-08-10): bez explicitního záznamu
  // se nový subjekt scaffolduje pod sdíleným wildcard záznamem
  // STANDING_SCOPE_RECORD_ID. Rekurzivní rozšiřování do šířky tak nevyžaduje
  // per-subjektové autorizační kolo — autorizace nadále pochází z ukotveného
  // governance záznamu v append-only logu, jen už není per-subjektová.
  if (!authorizationRecordId) {
    authorizationRecordId = STANDING_SCOPE_RECORD_ID;
  }

  // --- autorizační brána (bez ní se nezapisuje ani bajt) -----------------
  const records = loadAuthorizationRecords(authorizationsPath);
  const auth = records.get(authorizationRecordId);
  if (!auth) {
    throw new Error(
      `scaffold-dossier: BLOCKED — autorizační záznam "${authorizationRecordId}" v ${authorizationsPath} neexistuje.\n` +
        "Autorizace vzniká jen zápisem do append-only logu v AGENTS.md (scripts/dossier/authorize-entity.mjs, " +
        "interaktivně, člověkem) a jeho transkripce do data/authorizations.toml. " +
        "Placeholder pro neautorizovaný subjekt je stejně out of scope jako jeho claims.",
    );
  }
  // Wildcard "*" = sdílený standing-scope záznam: autorizuje jakýkoli
  // standing-scope subjekt bez per-subjektového záznamu. Explicitní
  // per-subjektový záznam (subjects bez "*") dál musí subjekt jmenovitě
  // obsahovat.
  if (!auth.subjects.includes("*") && !auth.subjects.includes(subject)) {
    throw new Error(
      `scaffold-dossier: BLOCKED — záznam "${authorizationRecordId}" neautorizuje subjekt "${subject}" ` +
        `(subjects: ${auth.subjects.map((s) => `"${s}"`).join(", ") || "žádné"}). ` +
        "Nový subjekt vyžaduje vlastní datovaný záznam v append-only logu v AGENTS.md.",
    );
  }

  const dir = join(root, slug);
  if (existsSync(dir)) {
    throw new Error(
      `scaffold-dossier: ${dir} už existuje — nikdy nepřepisuji. Pokud je to záměr, smaž adresář ručně.`,
    );
  }

  const record = {
    $schema: "https://vomaste.cz/schemas/canonical/dossier.schema.json",
    schemaVersion: 1,
    "@context": "https://vomaste.cz/context/v1.jsonld",
    "@id": `https://vomaste.cz/id/dossiers/${slug}`,
    "@type": "vomaste:Dossier",
    recordType: "dossier",
    identifier: slug,
    slug,
    title,
    description:
      description ?? `Neutrální, zdroji doložený přehled o osobě ${title}.`,
    dossierType: "entity",
    canonicalDossier: slug,
    subject,
    language: "cs",
    navigationVisible: true,
    updated: today,
    authorization: {
      records: [authorizationRecordId],
    },
    contentBlocks: [
      {
        type: "markdown",
        value:
          `## Kdo je ${title} {#kdo}\n\n` +
          `TODO: krátký neutrální úvodní odstavec — veřejná funkce/role, proč je\n` +
          `předmětem veřejného zájmu, jaký je rozsah tohoto dossieru (viz záznam\n` +
          `\`${authorizationRecordId}\` v AGENTS.md). Žádné tvrzení zde ani jinde\n` +
          `v tomto dossieru bez jmenovaného, dohledatelného, nezávislého zdroje —\n` +
          `viz skill dossier-entry.`,
      },
    ],
  };

  mkdirSync(dir, { recursive: true });
  const registryDirs = [];
  for (const name of REGISTRY_DIRS) {
    const rdir = join(dir, name);
    mkdirSync(rdir, { recursive: true });
    registryDirs.push(rdir);
  }
  const dossierFile = join(dir, "dossier.json");
  writeFileSync(dossierFile, `${JSON.stringify(record, null, 2)}\n`, "utf8");

  return { dir, dossierFile, registryDirs, record };
}

// --- CLI -------------------------------------------------------------------

function parseArgs(argv) {
  const out = {};
  for (const arg of argv) {
    const m = arg.match(/^--([a-z-]+)=(.*)$/s);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const args = parseArgs(process.argv.slice(2));
  try {
    const { dir, dossierFile } = scaffoldDossier({
      slug: args.slug,
      title: args.title,
      subject: args.subject,
      authorizationRecordId: args["authorization-record-id"],
      description: args.description,
    });
    console.log(`scaffold-dossier: vytvořen kanonický balíček ${dir}`);
    console.log(`  dossier.json:  ${dossierFile}`);
    console.log(`  registry:      ${REGISTRY_DIRS.join(", ")} (prázdné)`);
    console.log(`
Další kroky (ruční, záměrné, po jednom):
  1. Doplň TODO úvodní blok v dossier.json a první záznamy (skill
     dossier-entry): claims/, sources/, … jako kanonické JSON soubory.
  2. npm run data:validate   — tvar + reference + sémantika + JSON-LD.
  3. npm run data:build      — kompilace, view modely, content adaptéry.
  4. npm run build           — plná brána; bez zelené není hotovo.`);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}

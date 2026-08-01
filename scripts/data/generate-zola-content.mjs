#!/usr/bin/env node
/*
 * Generátor Zola content adaptérů (T-028 fáze E — STAGING režim).
 *
 * Z compiled modelu (compileDataset) generuje minimální content stuby do
 * data/generated/content-staging/ — STEJNÁ struktura jako content/
 * (dossiers/_index.md, dossiers/<slug>/_index.md,
 * dossiers/<slug>/<registry>/{_index.md,<record>.md},
 * entities/{_index.md,<entity>.md}). Produkce se NEpřepíná: dnešní
 * content/** zůstává autoritou, přepnutí šablon na stuby je fáze F.
 *
 * Stub nese jen routing/adapter vrstvu: title, template (zachované
 * dnešní názvy šablon — čtou se z odpovídajících content/ souborů,
 * fallback deterministická mapa), weight, aliases (PŘENESENÉ z dnešních
 * content souborů — kritické pro staré URL) a [extra] ukazatel na view
 * model. Žádná faktická pole navíc — fakta žijí ve view modelech.
 *
 * Determinismus: stabilní pořadí klíčů, LF, trailing newline, žádné
 * timestampy; výstupní adresář se před zápisem čistí.
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadCanonicalDataset, compileDataset } from "./lib/dataset.mjs";
import { REGISTRY_LABELS, VIEW_REGISTRIES } from "./build-view-models.mjs";
import { frontMatter, str, arr, sections, sectionBody } from "../migrations/lib/read-content.mjs";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const STAGING_REL = "data/generated/content-staging";

// Fallback šablony pro cesty bez dnešního content protějšku (syntetické
// fixture stromy v testech; reálné repo má protějšek pro každý stub).
const DEFAULT_TEMPLATES = Object.freeze({
  "dossiers-index": "dossiers-index.html",
  "entities-index": "entities-index.html",
  dossier: "entity-dossier.html",
  "dossier-aggregate": "dossier.html",
  claim: "dossier-claim.html",
  source: "dossier-source.html",
  case: "dossier-case.html",
  gap: "dossier-gap.html",
  relation: "dossier-relation.html",
  entity: "entity.html",
  "claims-index": "dossier-claims-index.html",
  "sources-index": "dossier-sources-index.html",
  "cases-index": "dossier-cases-index.html",
  "gaps-index": "dossier-gaps-index.html",
  "relations-index": "dossier-relations-index.html",
});

const tomlString = (v) => `"${String(v).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
const tomlArray = (values) => `[${values.map(tomlString).join(", ")}]`;

// Dnešní template + top-level aliases odpovídajícího content souboru
// (jen čtení; top sekce front matter — aliases/template nikdy nežijí
// v [extra]).
function readContentAdapterFields(contentRoot, relPath) {
  const file = join(contentRoot, "content", ...relPath.split("/"));
  if (!existsSync(file)) return { template: null, aliases: null };
  const top = sectionBody(sections(frontMatter(readFileSync(file, "utf8"))), null);
  return { template: str(top, "template"), aliases: arr(top, "aliases") };
}

function renderStub({ title, template, weight, aliases, extra }) {
  const lines = ["+++", `title = ${tomlString(title)}`, `template = ${tomlString(template)}`];
  if (weight !== null && weight !== undefined) lines.push(`weight = ${weight}`);
  if (aliases && aliases.length) lines.push(`aliases = ${tomlArray(aliases)}`);
  lines.push("", "[extra]", "generated = true");
  for (const [key, value] of Object.entries(extra)) {
    lines.push(`${key} = ${typeof value === "boolean" ? value : tomlString(value)}`);
  }
  lines.push("+++", "GENERATED FILE. DO NOT EDIT.", "");
  return lines.join("\n");
}

/*
 * buildStubs(compiled, { contentRoot }) → Map<posixRelPath, string>
 * relPath je relativní k data/generated/content-staging/ a 1:1 zrcadlí
 * content/ strukturu. contentRoot = kořen repa s dnešním content/
 * (zdroj template názvů a aliasů).
 */
export function buildStubs(compiled, { contentRoot = REPO_ROOT } = {}) {
  const stubs = new Map();
  const viewPath = (rel) => `generated/views/${rel}`;

  const put = (relPath, { title, defaultTemplate, weight = null, extraAliases = null, extra }) => {
    const { template, aliases } = readContentAdapterFields(contentRoot, relPath);
    const merged = [...new Set([...(aliases ?? []), ...(extraAliases ?? [])])];
    stubs.set(
      relPath,
      renderStub({
        title,
        template: template ?? defaultTemplate,
        weight,
        aliases: merged,
        extra,
      }),
    );
  };

  // --- kořenové indexy --------------------------------------------------
  put("dossiers/_index.md", {
    title: "Dossiery",
    defaultTemplate: DEFAULT_TEMPLATES["dossiers-index"],
    extra: { view_model: viewPath("dossiers-index.json"), lang: "cs" },
  });
  put("entities/_index.md", {
    title: "Registr entit",
    defaultTemplate: DEFAULT_TEMPLATES["entities-index"],
    extra: { view_model: viewPath("entities-index.json"), lang: "cs" },
  });

  // --- dossiery ---------------------------------------------------------
  const dossierWrappers = compiled.records.filter((w) => w.registry === "dossier");
  for (const w of dossierWrappers) {
    const slug = w.dossier;
    const record = w.record;
    put(`dossiers/${slug}/_index.md`, {
      title: record.title,
      defaultTemplate:
        record.dossierType === "aggregate" ? DEFAULT_TEMPLATES["dossier-aggregate"] : DEFAULT_TEMPLATES.dossier,
      extraAliases: record.aliases ?? null,
      extra: {
        record_type: "dossier",
        record_id: record["@id"],
        view_model: viewPath(`dossiers/${slug}/overview.json`),
        dossier: slug,
        lang: record.language ?? "cs",
      },
    });
    for (const registry of VIEW_REGISTRIES) {
      put(`dossiers/${slug}/${registry}/_index.md`, {
        title: REGISTRY_LABELS[registry],
        defaultTemplate: DEFAULT_TEMPLATES[`${registry}-index`],
        extra: {
          view_model: viewPath(`dossiers/${slug}/${registry}-index.json`),
          dossier: slug,
          lang: "cs",
        },
      });
    }
  }

  // --- záznamy ----------------------------------------------------------
  const entityTitle = (iri) => compiled.indexes.byId[iri]?.record.title ?? iri.split("/").pop();
  const perRegistryPosition = new Map(); // `${slug}/${registry}` -> counter
  for (const w of compiled.records) {
    if (w.registry === "dossier" || w.registry === "updates") continue;
    const r = w.record;
    const slug = w.dossier;
    const posKey = `${slug}/${w.registry}`;
    const position = (perRegistryPosition.get(posKey) ?? 0) + 1;
    perRegistryPosition.set(posKey, position);
    const recordType = r.recordType;
    const title =
      recordType === "claim"
        ? r.identifier
        : recordType === "relation"
          ? `${entityTitle(r.sourceEntity["@id"])} — ${r.label} — ${entityTitle(r.targetEntity["@id"])}`
          : r.title;
    put(`dossiers/${slug}/${w.registry}/${String(r.identifier).toLowerCase()}.md`, {
      title,
      defaultTemplate: DEFAULT_TEMPLATES[recordType],
      weight: r.order ?? position,
      extra: {
        record_type: recordType,
        record_id: r["@id"],
        view_model: viewPath(`dossiers/${slug}/${w.registry}/${String(r.identifier).toLowerCase()}.json`),
        dossier: slug,
        lang: "cs",
      },
    });
  }

  // --- entity -----------------------------------------------------------
  for (const [i, w] of compiled.entities.entries()) {
    const r = w.record;
    put(`entities/${r.entityId}.md`, {
      title: r.title,
      defaultTemplate: DEFAULT_TEMPLATES.entity,
      weight: i + 1,
      extraAliases: r.routeAliases ?? null,
      extra: {
        record_type: "entity",
        record_id: r["@id"],
        view_model: viewPath(`entities/${r.entityId}.json`),
        lang: "cs",
      },
    });
  }

  return stubs;
}

// Deterministický zápis: čištění cíle + seřazené pořadí souborů.
export function writeStubs(stubs, outDir) {
  rmSync(outDir, { recursive: true, force: true });
  for (const [relPath, text] of [...stubs.entries()].sort(([a], [b]) => (a < b ? -1 : 1))) {
    const file = join(outDir, ...relPath.split("/"));
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, text);
  }
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const model = await loadCanonicalDataset();
  const compiled = compileDataset(model);
  const stubs = buildStubs(compiled, { contentRoot: REPO_ROOT });
  writeStubs(stubs, join(REPO_ROOT, STAGING_REL));
  console.log(`Content adaptéry (staging): ${stubs.size} stubů → ${STAGING_REL}/`);
  console.log("OK");
}

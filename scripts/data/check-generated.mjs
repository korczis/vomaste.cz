#!/usr/bin/env node
/*
 * Gate nad generovanými artefakty fáze E (T-028): ověřuje 1:1 pokrytí
 * kanonického datasetu view modely (data/generated/views/) a staging
 * content stuby (data/generated/content-staging/).
 *
 * Kontroly:
 *   C1  každý kanonický záznam s routou (dossier, claims/sources/cases/
 *       gaps/relations, entity) má právě jeden staging stub a právě
 *       jeden view model; strukturální _index stuby a souhrnné view
 *       modely (overview, *-index, landing, mapa) existují;
 *   C2  žádný sirotčí soubor: každý stub i view model odpovídá záznamu
 *       nebo očekávanému strukturálnímu souboru;
 *   C3  stub sanity: extra.generated = true, record_id == @id záznamu,
 *       view_model ukazuje na existující soubor;
 *   C4  route parity: routy staging stubů == routy dnešního
 *       data/generated/routes.json (dossierové registry a entity;
 *       landing/koncepty/dokumentace/mapa se netýkají) — rozdíly se
 *       vypisují oběma směry;
 *   C5  alias parity: každý top-level alias dnešních content souborů
 *       (dossiery, registry, záznamy, entity) je přítomen v odpovídajícím
 *       stubu.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadCanonicalDataset, compileDataset } from "./lib/dataset.mjs";
import { VIEW_REGISTRIES } from "./build-view-models.mjs";
import { STAGING_REL } from "./generate-zola-content.mjs";
import { frontMatter, str, arr, bool, sections, sectionBody } from "../migrations/lib/read-content.mjs";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const VIEWS_REL = "data/generated/views";
const ROUTES_REL = "data/generated/routes.json";

const walk = (dir, prefix = "") => {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir).sort()) {
    const full = join(dir, entry);
    const rel = prefix ? `${prefix}/${entry}` : entry;
    if (statSync(full).isDirectory()) out.push(...walk(full, rel));
    else out.push(rel);
  }
  return out;
};

// Route staging stubu z jeho cesty (zrcadlí Zola routing: _index.md =
// routa sekce, <name>.md = /<dir>/<name>/).
export function routeOfStubPath(relPath) {
  const parts = relPath.split("/");
  const file = parts.pop();
  const base = parts.length ? `/${parts.join("/")}/` : "/";
  return file === "_index.md" ? base : `${base}${file.replace(/\.md$/, "")}/`;
}

export function checkGenerated({ root = REPO_ROOT } = {}) {
  const errors = [];
  const warnings = [];

  return loadCanonicalDataset(join(root, "data/dossiers")).then((model) => {
    const compiled = compileDataset(model);
    const stagingDir = join(root, STAGING_REL);
    const viewsDir = join(root, VIEWS_REL);

    // --- očekávané množiny ---------------------------------------------
    const expectedStubs = new Map(); // relPath -> record @id | null (strukturální)
    const expectedViews = new Set();
    expectedStubs.set("dossiers/_index.md", null);
    expectedStubs.set("entities/_index.md", null);
    expectedViews.add("dossiers-index.json");
    expectedViews.add("entities-index.json");
    expectedViews.add("landing.json");
    expectedViews.add("map.json");

    for (const w of compiled.records) {
      if (w.registry === "updates") continue;
      if (w.registry === "dossier") {
        expectedStubs.set(`dossiers/${w.dossier}/_index.md`, w.record["@id"]);
        expectedViews.add(`dossiers/${w.dossier}/overview.json`);
        for (const registry of VIEW_REGISTRIES) {
          expectedStubs.set(`dossiers/${w.dossier}/${registry}/_index.md`, null);
          expectedViews.add(`dossiers/${w.dossier}/${registry}-index.json`);
        }
        continue;
      }
      const lower = String(w.record.identifier).toLowerCase();
      expectedStubs.set(`dossiers/${w.dossier}/${w.registry}/${lower}.md`, w.record["@id"]);
      expectedViews.add(`dossiers/${w.dossier}/${w.registry}/${lower}.json`);
    }
    for (const w of compiled.entities) {
      expectedStubs.set(`entities/${w.record.entityId}.md`, w.record["@id"]);
      expectedViews.add(`entities/${w.record.entityId}.json`);
    }

    // --- C1 + C2: pokrytí a sirotci ------------------------------------
    const actualStubs = walk(stagingDir);
    const actualViews = walk(viewsDir);
    for (const rel of expectedStubs.keys()) {
      if (!actualStubs.includes(rel)) errors.push(`stub chybí: ${STAGING_REL}/${rel}`);
    }
    for (const rel of actualStubs) {
      if (!expectedStubs.has(rel)) errors.push(`sirotčí stub bez kanonického záznamu: ${STAGING_REL}/${rel}`);
    }
    for (const rel of expectedViews) {
      if (!actualViews.includes(rel)) errors.push(`view model chybí: ${VIEWS_REL}/${rel}`);
    }
    for (const rel of actualViews) {
      if (!expectedViews.has(rel)) errors.push(`sirotčí view model: ${VIEWS_REL}/${rel}`);
    }

    // --- C3: sanity stubů ----------------------------------------------
    for (const rel of actualStubs) {
      if (!expectedStubs.has(rel)) continue;
      const fm = frontMatter(readFileSync(join(stagingDir, ...rel.split("/")), "utf8"));
      const secs = sections(fm);
      const extra = sectionBody(secs, "extra");
      if (bool(extra, "generated") !== true) errors.push(`${STAGING_REL}/${rel}: chybí extra.generated = true`);
      const expectedId = expectedStubs.get(rel);
      if (expectedId !== null && str(extra, "record_id") !== expectedId) {
        errors.push(`${STAGING_REL}/${rel}: record_id "${str(extra, "record_id")}" ≠ @id záznamu "${expectedId}"`);
      }
      const viewModel = str(extra, "view_model");
      if (!viewModel) {
        errors.push(`${STAGING_REL}/${rel}: chybí extra.view_model`);
      } else if (!existsSync(join(root, "data", ...viewModel.split("/")))) {
        errors.push(`${STAGING_REL}/${rel}: view_model "${viewModel}" neexistuje v data/`);
      }
    }

    // --- C4: route parity vs. dnešní routes.json -----------------------
    const routesFile = join(root, ROUTES_REL);
    let routeParity = { compared: false, missing: [], extra: [] };
    if (existsSync(routesFile)) {
      const manifest = JSON.parse(readFileSync(routesFile, "utf8"));
      const manifestRoutes = new Set(Object.values(manifest).map((r) => r.route));
      const stubRoutes = new Set(actualStubs.map(routeOfStubPath));
      const missing = [...manifestRoutes].filter((r) => !stubRoutes.has(r)).sort();
      const extra = [...stubRoutes].filter((r) => !manifestRoutes.has(r)).sort();
      routeParity = { compared: true, missing, extra };
      for (const r of missing) errors.push(`route parity: routa "${r}" z ${ROUTES_REL} nemá staging stub`);
      for (const r of extra) errors.push(`route parity: staging stub routy "${r}" nemá protějšek v ${ROUTES_REL}`);
    } else {
      warnings.push(`${ROUTES_REL} neexistuje — route parity přeskočena (spusť npm run build:routes)`);
    }

    // --- C5: alias parity vs. dnešní content/ --------------------------
    const contentAliases = []; // { rel (content-relative bez "content/"), aliases }
    const collect = (contentRel) => {
      const file = join(root, "content", ...contentRel.split("/"));
      if (!existsSync(file)) return;
      const top = sectionBody(sections(frontMatter(readFileSync(file, "utf8"))), null);
      const aliases = arr(top, "aliases");
      if (aliases && aliases.length) contentAliases.push({ rel: contentRel, aliases });
    };
    collect("dossiers/_index.md");
    collect("entities/_index.md");
    for (const rel of expectedStubs.keys()) collect(rel);

    let aliasChecked = 0;
    for (const { rel, aliases } of contentAliases) {
      const stubFile = join(stagingDir, ...rel.split("/"));
      if (!existsSync(stubFile)) continue; // chybějící stub už hlásí C1
      const top = sectionBody(sections(frontMatter(readFileSync(stubFile, "utf8"))), null);
      const stubAliases = arr(top, "aliases") ?? [];
      for (const alias of aliases) {
        aliasChecked++;
        if (!stubAliases.includes(alias)) {
          errors.push(`alias parity: content/${rel} nese alias "${alias}", stub ${STAGING_REL}/${rel} ho nemá`);
        }
      }
    }

    return {
      errors,
      warnings,
      summary: {
        records: expectedStubs.size,
        stubs: actualStubs.length,
        views: actualViews.length,
        routeParity,
        aliasSources: contentAliases.length,
        aliasChecked,
      },
    };
  });
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const { errors, warnings, summary } = await checkGenerated();
  console.log(
    `Kontrola generovaných artefaktů: ${summary.stubs} stubů, ${summary.views} view modelů, ` +
      `${summary.records} očekávaných stub cest.`,
  );
  if (summary.routeParity.compared) {
    console.log(
      `Route parity vs. ${ROUTES_REL}: chybějících ${summary.routeParity.missing.length}, ` +
        `navíc ${summary.routeParity.extra.length}.`,
    );
  }
  console.log(`Alias parity: ${summary.aliasChecked} aliasů z ${summary.aliasSources} content souborů.`);
  for (const w of warnings) console.log(`  WARNING ${w}`);
  if (errors.length) {
    console.log(`\n${errors.length} chyb(a):`);
    for (const e of errors) console.log(`  ERROR ${e}`);
    console.log("\nFAILED");
    process.exit(1);
  }
  console.log("OK — 1:1 pokrytí, route i alias parity drží.");
}

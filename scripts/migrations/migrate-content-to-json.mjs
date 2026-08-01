#!/usr/bin/env node
/*
 * Lossless, idempotentní migrátor Markdown/TOML → kanonické JSON balíčky
 * (T-028 fáze D).
 *
 * ČTE (a nikdy nemění): content/dossiers/**, content/entities/*.md,
 *   data/dossiers.toml, data/authorizations.toml,
 *   data/dossiers/<slug>/{graph,updates}.toml
 * ZAPISUJE (jen nové/vlastní soubory):
 *   data/dossiers/<slug>/dossier.json
 *   data/dossiers/<slug>/{claims,sources,cases,gaps,relations,updates}/*.json
 *   data/dossiers/_shared/entities/<entity-id>.json
 *   data/dossiers/_shared/semantics-baseline.json   (grandfathered debt)
 *   data/generated/migration-report.json            (gitignored)
 *   docs/migrations/json-first-migration-report.md
 *
 * Zásady (mise fáze D):
 *   - texty byte-verně (claim text = summary, tělo stránky = jeden
 *     markdown content blok), žádné nové faktické pole, žádné skóre;
 *   - vlastnictví záznamů podle fyzického umístění — VČETNĚ agregátu
 *     macinka-turek (subjects se přenáší beze změny, „decoupling" na
 *     petr-macinka/filip-turek je samostatné redakční rozhodnutí mimo
 *     fázi D);
 *   - kolize/nejednoznačnost = tvrdá chyba, nic se nedomýšlí;
 *   - druhý běh nad stejným vstupem nesmí změnit jediný bajt výstupu
 *     (deterministická serializace, žádné build timestampy);
 *   - parity kontroly po zápisu: počty, texty, vazby, statusy, datumy —
 *     nesoulad = nenulový exit;
 *   - sémantická porušení zděděná z dnešního obsahu se NEopravují ani
 *     neignorují: zapíšou se do explicitního allowlistu
 *     data/dossiers/_shared/semantics-baseline.json (grandfathered debt,
 *     nové porušení mimo allowlist zůstává chybou brány).
 *
 * Čtecí vrstva: scripts/dossier/lib/{record-tables,jsonld-shared}.mjs kde
 * to jde (readGraphTomlBlocks, buildRecordTables jako závazný křížový
 * oracle nad reálným repozitářem); parametrizované kopie regexů v
 * lib/read-content.mjs tam, kde jsou dnešní moduly uzamčené na kořen
 * repozitáře (zdůvodnění v hlavičce lib/read-content.mjs).
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readGraphTomlBlocks } from "../dossier/lib/jsonld-shared.mjs";
import { validateShapeTree } from "../data/validate-shape.mjs";
import { loadCanonicalTree } from "../data/load.mjs";
import { validateReferences, ID_BASE } from "../data/validate-references.mjs";
import {
  collectSemanticsFindings,
  validateSemantics,
  BASELINEABLE_RULES,
} from "../data/validate-semantics.mjs";
import {
  arr,
  bool,
  num,
  readAuthorizations,
  readDossierRegistry,
  readIndexPage,
  readRecordPages,
  readUpdatesToml,
  sectionBodies,
  sectionBody,
  str,
} from "./lib/read-content.mjs";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SCHEMA_BASE = "https://vomaste.cz/schemas/canonical";
const CONTEXT = "https://vomaste.cz/context/v1.jsonld";

const envelope = (type, ldType, id) => ({
  $schema: `${SCHEMA_BASE}/${type}.schema.json`,
  schemaVersion: 1,
  "@context": CONTEXT,
  "@id": id,
  "@type": `vomaste:${ldType}`,
  recordType: type,
});

const dossierId = (slug) => `${ID_BASE}/dossiers/${slug}`;
const recordId = (slug, registry, identifier) => `${ID_BASE}/dossiers/${slug}/${registry}/${identifier}`;
const entityId = (id) => `${ID_BASE}/entities/${id}`;
const dossierRef = (slug) => ({ "@id": dossierId(slug) });
const refs = (slug, registry, ids) => ids.map((id) => ({ "@id": recordId(slug, registry, id) }));
const entityRef = (id) => ({ "@id": entityId(id) });
const mdBlocks = (body) => (body ? [{ type: "markdown", value: body }] : []);

// Klíče, které smí nést jeden [[extra.timeline]] blok — cokoli navíc je
// tvrdá chyba (lossless: neznámý klíč se nesmí tiše zahodit).
const TIMELINE_KEYS = Object.freeze(["date", "title", "anchor", "dot", "subjects"]);

/*
 * [[extra.timeline]] bloky _index.md → kanonické timeline entries
 * (fáze E prerekvizita). Pořadí vstupu se zachovává, žádná deduplikace;
 * date zůstává byte-verně (včetně českého volného formátu — viz $comment
 * timelineEntry v schemas/canonical/_defs.schema.json).
 */
function readTimelineEntries(idx, err) {
  const entries = [];
  for (const [i, body] of sectionBodies(idx.secs, "extra.timeline").entries()) {
    for (const key of blockKeys(body)) {
      if (!TIMELINE_KEYS.includes(key)) {
        err(`${idx.relPath}: [[extra.timeline]] blok #${i + 1} nese neznámý klíč "${key}" — lossless migrace ho nesmí tiše zahodit`);
      }
    }
    const date = str(body, "date");
    const title = str(body, "title");
    if (!date || !title) {
      err(`${idx.relPath}: [[extra.timeline]] blok #${i + 1} nemá date/title — záznam timeline nelze migrovat`);
      continue;
    }
    const entry = { date, title };
    const anchor = str(body, "anchor");
    if (anchor !== null) entry.anchor = anchor;
    const dot = str(body, "dot");
    if (dot !== null) entry.dot = dot;
    const subjects = arr(body, "subjects");
    if (subjects !== null) entry.subjects = subjects;
    entries.push(entry);
  }
  return entries;
}

// Přítomné front matter klíče bloku — pro deterministický inventář polí,
// která kanonické schéma nemá (transparentní „co se nepřenáší" v reportu).
const blockKeys = (block) => [...block.matchAll(/^([a-z_]+)\s*=/gm)].map((m) => m[1]);

// Klíče, které migrace vědomě PŘENÁŠÍ (vše ostatní jde do inventáře
// nepřenesených polí v reportu — nikdy se nezahazuje tiše).
const CARRIED_KEYS = {
  claim: new Set(["clm_id", "status", "status_label", "summary", "sources", "subjects", "weight", "dossier", "record_type", "lang", "title", "description", "template"]),
  source: new Set(["src_id", "title", "description", "outlet", "family", "src_type", "url", "published", "retrieved", "claims", "subjects", "weight", "dossier", "record_type", "lang", "template"]),
  case: new Set(["case_id", "title", "summary", "period", "status", "label", "anchor", "claims", "sources", "subjects", "weight", "dossier", "record_type", "lang", "description", "template"]),
  gap: new Set(["gap_id", "title", "description", "priority", "checked", "claims", "subjects", "weight", "dossier", "record_type", "lang", "template"]),
  relation: new Set(["rel_id", "source", "target", "relation_type", "label", "status", "claims", "sources", "subjects", "weight", "dossier", "record_type", "lang", "title", "template"]),
  entity: new Set(["entity_id", "title", "entity_type", "publication_role", "dossier_enabled", "dossier_status", "coverage_state", "dossiers", "aliases", "government_snapshot", "record_type", "template", "weight"]),
};
// Strukturální klíče, jejichž hodnotu plně nahrazuje kanonická obálka /
// umístění souboru (nejsou faktickou ztrátou).
const STRUCTURAL_KEYS = new Set(["dossier", "record_type", "lang", "template", "weight", "title", "description"]);

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

/*
 * Hlavní vstup. options:
 *   root        — kořen repozitáře/fixture (default: reálné repo)
 *   crossCheck  — křížové ověření proti buildRecordTables()
 *                 (default: jen nad reálným repem — record-tables je
 *                 uzamčený na reálný registr, fixture stromy ho vypínají)
 *   write       — zapsat výstupy (false = dry run modelu)
 *
 * Vrací { records, counts, mapping, anomalies, droppedFields,
 *         baselineEntries, errors } — errors ⇒ nic nebylo zapsáno.
 */
export async function migrate(options = {}) {
  const root = options.root ?? REPO_ROOT;
  const crossCheck = options.crossCheck ?? root === REPO_ROOT;
  const write = options.write ?? true;
  const outRoot = join(root, "data/dossiers");

  const errors = [];
  const anomalies = [];
  const err = (msg) => errors.push(msg);
  const droppedFields = {}; // recordType -> key -> count
  const trackDropped = (type, block) => {
    for (const key of blockKeys(block)) {
      if (CARRIED_KEYS[type].has(key)) continue;
      const bucket = (droppedFields[type] ??= {});
      bucket[key] = (bucket[key] ?? 0) + 1;
    }
  };

  const registry = readDossierRegistry(root);
  const seenSlugs = new Set();
  for (const d of registry) {
    if (!d.slug) err("data/dossiers.toml: záznam bez slug");
    else if (seenSlugs.has(d.slug)) err(`data/dossiers.toml: duplikátní slug "${d.slug}"`);
    else seenSlugs.add(d.slug);
  }
  const authorizations = readAuthorizations(root);

  // outputs: outPath (relativně k outRoot) -> { record, sources: [vstupy] }
  const outputs = new Map();
  const emit = (outPath, record, sourceFiles) => {
    if (outputs.has(outPath)) {
      err(`kolize výstupu: ${outPath} by vznikl dvakrát (${sourceFiles.join(", ")} vs. ${outputs.get(outPath).sources.join(", ")})`);
      return;
    }
    outputs.set(outPath, { record, sources: sourceFiles });
  };

  // --- globální entity (content/entities/*.md) --------------------------
  const entityPages = readRecordPages(root, "content/entities");
  const entityIds = new Set();
  for (const page of entityPages) {
    const id = str(page.block, "entity_id") ?? page.fileSlug;
    if (id !== page.fileSlug) {
      err(`${page.relPath}: entity_id "${id}" neodpovídá názvu souboru — nejednoznačná identita, migrace odmítá hádat`);
      continue;
    }
    if (entityIds.has(id)) {
      err(`content/entities: duplikátní entity_id "${id}"`);
      continue;
    }
    entityIds.add(id);
    trackDropped("entity", page.block);

    const record = {
      ...envelope("entity", "Entity", entityId(id)),
      identifier: id,
      entityId: id,
      title: str(page.block, "title"),
      entityType: str(page.block, "entity_type"),
      publicationRole: str(page.block, "publication_role"),
      dossierEnabled: bool(page.block, "dossier_enabled"),
      dossierStatus: str(page.block, "dossier_status"),
      coverageState: str(page.block, "coverage_state"),
      dossiers: arr(page.block, "dossiers") ?? [],
    };
    const aliases = arr(page.block, "aliases");
    if (aliases) record.routeAliases = aliases;
    const snapshot = str(page.block, "government_snapshot");
    if (snapshot) record.snapshotDate = snapshot;
    if (page.body) record.content = mdBlocks(page.body);
    emit(`_shared/entities/${id}.json`, record, [page.relPath]);
  }

  // --- dossiery + jejich registry záznamů -------------------------------
  const perDossierCounts = {};
  const updatedBySlug = new Map();
  const indexBySlug = new Map();
  for (const d of registry) {
    const idx = readIndexPage(root, d.slug);
    if (!idx) {
      err(`content/dossiers/${d.slug}/_index.md: chybí — dossier z registru nemá stránku`);
      continue;
    }
    indexBySlug.set(d.slug, idx);
    updatedBySlug.set(d.slug, str(sectionBody(idx.secs, "extra"), "updated"));
  }

  for (const d of registry) {
    const slug = d.slug;
    const idx = indexBySlug.get(slug);
    if (!idx) continue;
    const counts = (perDossierCounts[slug] = { dossier: 1, claim: 0, source: 0, case: 0, gap: 0, relation: 0, update: 0 });
    const topB = sectionBody(idx.secs, null);
    const extraB = sectionBody(idx.secs, "extra");

    // dossier.json ------------------------------------------------------
    let updated = str(extraB, "updated");
    if (!updated && d.canonicalDossier && d.canonicalDossier !== slug) {
      // Entity view bez vlastního `updated` (petr-macinka, filip-turek):
      // jeho registry jsou generované filtry nad kanonickým dossierem,
      // deterministicky přebírá jeho datum poslední aktualizace.
      updated = updatedBySlug.get(d.canonicalDossier) ?? null;
      if (updated) anomalies.push(`dossier ${slug}: _index.md nemá "updated" — převzato z kanonického dossieru ${d.canonicalDossier} (${updated})`);
    }
    if (!updated) err(`content/dossiers/${slug}/_index.md: chybí updated (a není odkud ho deterministicky převzít)`);

    let authRecords = arr(sectionBody(idx.secs, "extra.authorization"), "record_ids");
    if (!authRecords || authRecords.length === 0) {
      const subjectSet = d.dossierType === "aggregate" ? new Set(d.sourceDossiers.map((s) => registry.find((r) => r.slug === s)?.subject).filter(Boolean)) : new Set([d.subject]);
      authRecords = authorizations.filter((a) => a.subjects.some((s) => subjectSet.has(s))).map((a) => a.id);
      if (authRecords.length) anomalies.push(`dossier ${slug}: _index.md nemá [extra.authorization] — records odvozeny mapováním subjektů z data/authorizations.toml (${authRecords.join(", ")})`);
    }
    if (d.dossierType === "entity" && authRecords.length === 0) {
      err(`dossier ${slug}: entity dossier bez jediného autorizačního záznamu — migrace nesmí vyrobit neautorizovaný dossier`);
    }

    const pageTitle = str(topB, "title");
    if (pageTitle !== null && pageTitle !== d.title) {
      anomalies.push(`dossier ${slug}: title v registru ("${d.title}") ≠ title stránky ("${pageTitle}") — kanonický title je z data/dossiers.toml, stránkový zůstává v content/ do fáze H`);
    }

    const record = {
      ...envelope("dossier", "Dossier", dossierId(slug)),
      identifier: slug,
      slug,
      title: d.title,
      description: str(topB, "description"),
      dossierType: d.dossierType,
    };
    if (d.canonicalDossier) record.canonicalDossier = d.canonicalDossier;
    if (d.subject) record.subject = d.subject;
    record.language = str(extraB, "lang") ?? "cs";
    const dossierAliases = arr(topB, "aliases");
    if (dossierAliases) record.aliases = dossierAliases;
    record.navigationVisible = d.showInPrimaryNavigation === true;
    record.updated = updated;
    // Datum poslední redakční kontroly — fáze G je přenáší kanonicky
    // (vomaste:reviewedAt), aby adresářový export nemusel číst front
    // matter. Entity view bez vlastního reviewed_at pole nedostane (na
    // rozdíl od updated se NEdědí z kanonického dossieru — nedoložená
    // kontrola se nevymýšlí).
    const reviewedAt = str(extraB, "reviewed_at");
    if (reviewedAt !== null) record.reviewedAt = reviewedAt;
    if (authRecords.length) record.authorization = { records: authRecords };
    const seoType = str(extraB, "seo_type");
    if (seoType) record.seo = { seoType };
    const timelineEntries = readTimelineEntries(idx, err);
    const dossierBlocks = [
      ...mdBlocks(idx.body),
      ...(timelineEntries.length ? [{ type: "timeline", entries: timelineEntries }] : []),
    ];
    if (dossierBlocks.length) record.contentBlocks = dossierBlocks;
    if (d.dossierType === "aggregate") record.aggregates = d.sourceDossiers;
    emit(`${slug}/dossier.json`, record, [`data/dossiers.toml#${slug}`, idx.relPath]);

    // [[extra.cases]] zrcadlo — kanonická data case záznamů žijí v case
    // stránkách; _index bloky jsou jejich redakční mirror a MUSÍ souhlasit.
    const indexCases = new Map();
    for (const body of sectionBodies(idx.secs, "extra.cases")) {
      const anchor = str(body, "anchor");
      if (!anchor) err(`${idx.relPath}: [[extra.cases]] blok bez anchor`);
      else if (indexCases.has(anchor)) err(`${idx.relPath}: duplikátní [[extra.cases]] anchor "${anchor}"`);
      else indexCases.set(anchor, body);
    }

    // claims ------------------------------------------------------------
    for (const page of readRecordPages(root, "content/dossiers", slug, "claims")) {
      const id = str(page.block, "clm_id");
      if (!id || page.fileSlug !== id.toLowerCase()) {
        err(`${page.relPath}: clm_id "${id}" neodpovídá názvu souboru — nejednoznačná identita`);
        continue;
      }
      counts.claim++;
      trackDropped("claim", page.block);
      const record = {
        ...envelope("claim", "Claim", recordId(slug, "claims", id)),
        identifier: id,
        dossier: dossierRef(slug),
        text: str(page.block, "summary"),
        status: str(page.block, "status"),
        statusLabel: str(page.block, "status_label"),
        sources: refs(slug, "sources", arr(page.block, "sources") ?? []),
        subjects: arr(page.block, "subjects") ?? [],
        order: num(page.block, "weight") ?? 0,
        content: mdBlocks(page.body),
      };
      if (record.text === null) err(`${page.relPath}: chybí summary — claim bez textu nelze migrovat`);
      emit(`${slug}/claims/${id.toLowerCase()}.json`, record, [`content/${page.relPath}`]);
    }

    // sources -----------------------------------------------------------
    for (const page of readRecordPages(root, "content/dossiers", slug, "sources")) {
      const id = str(page.block, "src_id");
      if (!id || page.fileSlug !== id.toLowerCase()) {
        err(`${page.relPath}: src_id "${id}" neodpovídá názvu souboru — nejednoznačná identita`);
        continue;
      }
      counts.source++;
      trackDropped("source", page.block);
      const record = {
        ...envelope("source", "Source", recordId(slug, "sources", id)),
        identifier: id,
        dossier: dossierRef(slug),
        title: str(page.block, "title"),
      };
      // Redakční anotace zdroje — fáze G ji přenáší do kanonického záznamu
      // (schema:description v contextu v1), aby search index a exporty
      // nemusely číst front matter. U source NENÍ strukturální duplikát
      // (na rozdíl od claim/case, kde jen kopíruje summary).
      const srcDescription = str(page.block, "description");
      if (srcDescription !== null) record.description = srcDescription;
      record.outlet = str(page.block, "outlet");
      const family = str(page.block, "family");
      if (family !== null) record.sourceFamily = family;
      record.sourceType = str(page.block, "src_type");
      record.url = str(page.block, "url");
      const published = str(page.block, "published");
      if (published !== null) record.published = published;
      record.retrieved = str(page.block, "retrieved");
      record.claims = refs(slug, "claims", arr(page.block, "claims") ?? []);
      record.subjects = arr(page.block, "subjects") ?? [];
      record.content = mdBlocks(page.body);
      record.order = num(page.block, "weight") ?? 0;
      emit(`${slug}/sources/${id.toLowerCase()}.json`, record, [`content/${page.relPath}`]);
    }

    // cases -------------------------------------------------------------
    const casePagesByAnchor = new Set();
    for (const page of readRecordPages(root, "content/dossiers", slug, "cases")) {
      const id = str(page.block, "case_id");
      if (!id || page.fileSlug !== id.toLowerCase()) {
        err(`${page.relPath}: case_id "${id}" neodpovídá názvu souboru — nejednoznačná identita`);
        continue;
      }
      counts.case++;
      trackDropped("case", page.block);
      const anchor = str(page.block, "anchor");
      casePagesByAnchor.add(anchor);
      const mirror = indexCases.get(anchor);
      if (!mirror) {
        err(`${page.relPath}: case stránka (anchor "${anchor}") nemá [[extra.cases]] blok v _index.md — zrcadla se rozešla`);
      } else {
        for (const key of ["title", "period", "status", "label", "summary"]) {
          if (str(mirror, key) !== str(page.block, key)) err(`${page.relPath}: pole "${key}" nesouhlasí s [[extra.cases]] blokem v _index.md — zrcadla se rozešla`);
        }
        if (!deepEqual(arr(mirror, "claims") ?? [], arr(page.block, "claims") ?? [])) {
          err(`${page.relPath}: claims nesouhlasí s [[extra.cases]] blokem v _index.md — zrcadla se rozešla`);
        }
      }
      const record = {
        ...envelope("case", "Case", recordId(slug, "cases", id)),
        identifier: id,
        dossier: dossierRef(slug),
        title: str(page.block, "title"),
        summary: str(page.block, "summary"),
        period: str(page.block, "period"),
        status: str(page.block, "status"),
        statusLabel: str(page.block, "label"),
        anchor,
        claims: refs(slug, "claims", arr(page.block, "claims") ?? []),
        sources: refs(slug, "sources", arr(page.block, "sources") ?? []),
        subjects: arr(page.block, "subjects") ?? [],
        content: mdBlocks(page.body),
        order: num(page.block, "weight") ?? 0,
      };
      emit(`${slug}/cases/${id.toLowerCase()}.json`, record, [`content/${page.relPath}`, `${idx.relPath}#${anchor}`]);
    }
    for (const anchor of indexCases.keys()) {
      if (!casePagesByAnchor.has(anchor)) err(`${idx.relPath}: [[extra.cases]] blok "${anchor}" nemá case stránku — zrcadla se rozešla`);
    }

    // gaps --------------------------------------------------------------
    for (const page of readRecordPages(root, "content/dossiers", slug, "gaps")) {
      const id = str(page.block, "gap_id");
      if (!id || page.fileSlug !== id.toLowerCase()) {
        err(`${page.relPath}: gap_id "${id}" neodpovídá názvu souboru — nejednoznačná identita`);
        continue;
      }
      counts.gap++;
      trackDropped("gap", page.block);
      const record = {
        ...envelope("gap", "Gap", recordId(slug, "gaps", id)),
        identifier: id,
        dossier: dossierRef(slug),
        title: str(page.block, "title"),
        description: str(page.block, "description"),
        priority: str(page.block, "priority"),
        checked: str(page.block, "checked"),
        claims: refs(slug, "claims", arr(page.block, "claims") ?? []),
        subjects: arr(page.block, "subjects") ?? [],
        content: mdBlocks(page.body),
        order: num(page.block, "weight") ?? 0,
      };
      emit(`${slug}/gaps/${id.toLowerCase()}.json`, record, [`content/${page.relPath}`]);
    }

    // relations — kanonický zdroj hran je data/dossiers/<slug>/graph.toml;
    // detailní stránka relations/<edge-id>.md dodává tělo + subjects a
    // MUSÍ s hranou souhlasit (mirror, stejně jako case bloky).
    const { nodes, edges } = readGraphTomlBlocks(root, slug);
    const relationPages = new Map(readRecordPages(root, "content/dossiers", slug, "relations").map((p) => [p.fileSlug, p]));
    const edgeIds = new Set();
    for (const edge of edges) {
      if (!edge.id || edgeIds.has(edge.id)) {
        err(`data/dossiers/${slug}/graph.toml: hrana bez id nebo s duplikátním id ("${edge.id}")`);
        continue;
      }
      edgeIds.add(edge.id);
      counts.relation++;
      const page = relationPages.get(edge.id);
      if (!page) {
        err(`data/dossiers/${slug}/graph.toml#${edge.id}: hrana nemá detailní stránku content/dossiers/${slug}/relations/${edge.id}.md`);
        continue;
      }
      trackDropped("relation", page.block);
      // Mirror kontrola hrana ↔ stránka (graph.toml je kanonický).
      const pageChecks = [
        ["source", str(page.block, "source"), edge.source],
        ["target", str(page.block, "target"), edge.target],
        ["relation_type", str(page.block, "relation_type"), edge.relation],
        ["label", str(page.block, "label"), edge.label],
        ["status", str(page.block, "status"), edge.status],
      ];
      for (const [key, pageValue, edgeValue] of pageChecks) {
        if (pageValue !== edgeValue) err(`content/${page.relPath}: pole "${key}" ("${pageValue}") nesouhlasí s graph.toml hranou ("${edgeValue}") — zrcadla se rozešla`);
      }
      if (!deepEqual(arr(page.block, "claims") ?? [], edge.claims ?? [])) err(`content/${page.relPath}: claims nesouhlasí s graph.toml hranou — zrcadla se rozešla`);
      if (!deepEqual(arr(page.block, "sources") ?? [], edge.sources ?? [])) err(`content/${page.relPath}: sources nesouhlasí s graph.toml hranou — zrcadla se rozešla`);
      if (edge.note !== undefined) anomalies.push(`relation ${slug}/${edge.id}: pole "note" ("${edge.note}") nemá v kanonickém schématu ekvivalent — zůstává v graph.toml/content do fáze H`);

      const record = {
        ...envelope("relation", "Relation", recordId(slug, "relations", edge.id)),
        identifier: edge.id,
        relationId: edge.id,
        dossier: dossierRef(slug),
        sourceEntity: entityRef(edge.source),
        targetEntity: entityRef(edge.target),
        relationType: edge.relation,
        label: edge.label,
        status: edge.status,
        claims: refs(slug, "claims", edge.claims ?? []),
        sources: refs(slug, "sources", edge.sources ?? []),
        subjects: arr(page.block, "subjects") ?? [],
        directed: true,
      };
      if (page.body) record.content = mdBlocks(page.body);
      emit(`${slug}/relations/${edge.id}.json`, record, [`data/dossiers/${slug}/graph.toml#${edge.id}`, `content/${page.relPath}`]);
    }
    for (const fileSlug of relationPages.keys()) {
      if (!edgeIds.has(fileSlug)) err(`content/dossiers/${slug}/relations/${fileSlug}.md: stránka bez hrany v graph.toml — kanonický zdroj hran je graph.toml`);
    }

    // Uzly grafu bez globální entity: NEJDŘÍV match na content/entities/,
    // teprve pak založení z node dat; nekonzistentní duplicitní definice
    // = odmítnutí (kolize jmenovce se neřeší hádáním).
    for (const node of nodes) {
      if (!node.id) {
        err(`data/dossiers/${slug}/graph.toml: uzel bez id`);
        continue;
      }
      if (entityIds.has(node.id)) continue;
      const outPath = `_shared/entities/${node.id}.json`;
      const existing = outputs.get(outPath);
      if (existing) {
        if (existing.record.title !== node.label || existing.record.entityType !== node.type) {
          err(`graph node "${node.id}" (${slug}): koliduje s definicí z ${existing.sources.join(", ")} (label/type se liší) — nejednoznačný jmenovec, migrace odmítá`);
        } else if (!existing.record.dossiers.includes(slug)) {
          existing.record.dossiers = [...existing.record.dossiers, slug].sort();
          existing.sources.push(`data/dossiers/${slug}/graph.toml#node:${node.id}`);
        }
        continue;
      }
      anomalies.push(`entity ${node.id}: existuje jen jako uzel graph.toml (${slug}) — založena kontextová _shared entita z node dat`);
      emit(
        outPath,
        {
          ...envelope("entity", "Entity", entityId(node.id)),
          identifier: node.id,
          entityId: node.id,
          title: node.label,
          entityType: node.type,
          publicationRole: "context",
          dossierEnabled: false,
          dossierStatus: "not_authorized",
          coverageState: "contextual",
          dossiers: [slug],
        },
        [`data/dossiers/${slug}/graph.toml#node:${node.id}`],
      );
    }

    // updates -----------------------------------------------------------
    // identifier = datum; druhý a další zápis téhož dne nese deterministický
    // pořadový sufix (viz readUpdatesToml + schemas/canonical/_defs).
    let sameDaySuffixes = 0;
    for (const entry of readUpdatesToml(root, slug)) {
      if (!entry.date || !/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) {
        err(`data/dossiers/${slug}/updates.toml: [[updates]] bez platného date ("${entry.date}")`);
        continue;
      }
      if (entry.identifier !== entry.date) sameDaySuffixes++;
      counts.update++;
      const record = {
        ...envelope("update", "Update", recordId(slug, "updates", entry.identifier)),
        identifier: entry.identifier,
        dossier: dossierRef(slug),
        date: entry.date,
        summary: entry.summary,
      };
      if (entry.addedClaims) record.addedClaims = refs(slug, "claims", entry.addedClaims);
      if (entry.updatedClaims) record.updatedClaims = refs(slug, "claims", entry.updatedClaims);
      if (entry.addedGaps) record.addedGaps = refs(slug, "gaps", entry.addedGaps);
      if (entry.closedGaps) record.closedGaps = refs(slug, "gaps", entry.closedGaps);
      if (entry.reviewedSources) record.reviewedSources = refs(slug, "sources", entry.reviewedSources);
      emit(`${slug}/updates/${entry.identifier}.json`, record, [`data/dossiers/${slug}/updates.toml#${entry.identifier}`]);
    }
    if (sameDaySuffixes) {
      anomalies.push(`updates ${slug}: ${sameDaySuffixes} zápis(y) se sdíleným datem dostaly pořadový sufix identifieru (append-only pořadí z updates.toml)`);
    }
  }

  // --- křížové ověření proti dnešnímu parseru (record-tables.mjs) -------
  if (crossCheck) {
    errors.push(...(await crossCheckAgainstRecordTables(root, outputs)));
  }

  const counts = summarizeCounts(outputs, perDossierCounts);

  if (errors.length) {
    return { outputs, counts, mapping: [], anomalies, droppedFields, baselineEntries: [], errors };
  }

  // --- zápis ------------------------------------------------------------
  if (write) {
    for (const [outPath, { record }] of [...outputs.entries()].sort(([a], [b]) => (a < b ? -1 : 1))) {
      const file = join(outRoot, outPath);
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, `${JSON.stringify(record, null, 2)}\n`);
    }
  }

  // --- sémantický baseline (grandfathered debt) -------------------------
  // Porušení redakčních pravidel zděděná z dnešního obsahu se nesmí ani
  // opravovat (změna dat mimo mandát migrace), ani umlčet globálně:
  // zapíšou se jako explicitní allowlist konkrétních @id + pravidel.
  let baselineEntries = [];
  if (write) {
    const model = loadCanonicalTree(outRoot);
    const authorizationsPath = join(root, "data/authorizations.toml");
    const { findings } = collectSemanticsFindings(model, { authorizationsPath });
    for (const f of findings) {
      if (!BASELINEABLE_RULES.has(f.rule)) {
        err(`sémantika ${f.rule} (${f.id ?? f.relPath}): ${f.message} — pravidlo ${f.rule} nelze grandfatherovat, migrace selhává`);
      }
    }
    baselineEntries = findings
      .filter((f) => BASELINEABLE_RULES.has(f.rule))
      .map((f) => ({ "@id": f.id, rule: f.rule, reason: f.message }))
      .sort((a, b) => (a["@id"] < b["@id"] ? -1 : a["@id"] > b["@id"] ? 1 : a.rule < b.rule ? -1 : 1));
    const baselineDoc = {
      $comment:
        "Grandfathered debt (T-028 fáze D): sémantická porušení zděděná 1:1 z dnešního content/** — migrace data nemění, proto je nemůže opravit. Každý záznam je konkrétní @id + pravidlo; nové porušení mimo tento allowlist je chyba brány (scripts/data/validate-semantics.mjs). Odmazávat průběžně s redakčními opravami.",
      entries: baselineEntries,
    };
    writeFileSync(join(outRoot, "_shared/semantics-baseline.json"), `${JSON.stringify(baselineDoc, null, 2)}\n`);

    if (errors.length === 0) {
      // Finální brána migrátoru: tvar + reference + sémantika (s baseline)
      // nad skutečně zapsanými soubory. JSON-LD expanzi vlastní
      // npm run data:validate (stejná brána, viz check.mjs).
      const shape = validateShapeTree(outRoot);
      errors.push(...shape.errors);
      const written = loadCanonicalTree(outRoot);
      errors.push(...validateReferences(written));
      const semantics = validateSemantics(written, { authorizationsPath });
      errors.push(...semantics.errors);
      // Parity: zapsané soubory vs. zdrojová pravda, čtené ZNOVU z disku.
      errors.push(...runParityChecks(root));
    }
  }

  const mapping = [...outputs.entries()]
    .map(([outPath, { record, sources }]) => ({ output: `data/dossiers/${outPath}`, "@id": record["@id"], sources }))
    .sort((a, b) => (a.output < b.output ? -1 : 1));

  return { outputs, counts, mapping, anomalies: [...anomalies].sort(), droppedFields, baselineEntries, errors };
}

function summarizeCounts(outputs, perDossierCounts) {
  const perType = {};
  for (const { record } of outputs.values()) perType[record.recordType] = (perType[record.recordType] ?? 0) + 1;
  return {
    perType: Object.fromEntries(Object.entries(perType).sort()),
    perDossier: Object.fromEntries(Object.entries(perDossierCounts).sort()),
    total: outputs.size,
  };
}

// --- křížové ověření proti buildRecordTables (závazný oracle) -----------
async function crossCheckAgainstRecordTables(root, outputs) {
  const { buildRecordTables } = await import("../dossier/lib/record-tables.mjs");
  const rows = buildRecordTables(root);
  const errors = [];
  const get = (path) => outputs.get(path)?.record;
  const localIds = (arrOfRefs) => (arrOfRefs ?? []).map((r) => r["@id"].split("/").pop());
  const check = (where, field, mine, theirs) => {
    if (!deepEqual(mine ?? null, theirs ?? null)) {
      errors.push(`cross-check ${where}: pole ${field} se liší od record-tables.mjs (migrátor ${JSON.stringify(mine)} vs. oracle ${JSON.stringify(theirs)})`);
    }
  };

  for (const row of rows.claims) {
    const rec = get(`${row.dossier}/claims/${row.clm_id.toLowerCase()}.json`);
    if (!rec) { errors.push(`cross-check: claim ${row.dossier}/${row.clm_id} z record-tables nemá kanonický záznam`); continue; }
    check(`${row.dossier}/${row.clm_id}`, "summary/text", rec.text, row.summary);
    check(`${row.dossier}/${row.clm_id}`, "status", rec.status, row.status);
    check(`${row.dossier}/${row.clm_id}`, "status_label", rec.statusLabel, row.status_label);
    check(`${row.dossier}/${row.clm_id}`, "sources", localIds(rec.sources), row.sources);
    check(`${row.dossier}/${row.clm_id}`, "subjects", rec.subjects, row.subjects);
  }
  for (const row of rows.sources) {
    const rec = get(`${row.dossier}/sources/${row.src_id.toLowerCase()}.json`);
    if (!rec) { errors.push(`cross-check: source ${row.dossier}/${row.src_id} z record-tables nemá kanonický záznam`); continue; }
    check(`${row.dossier}/${row.src_id}`, "title", rec.title, row.title);
    check(`${row.dossier}/${row.src_id}`, "outlet", rec.outlet, row.outlet);
    check(`${row.dossier}/${row.src_id}`, "src_type", rec.sourceType, row.src_type);
    check(`${row.dossier}/${row.src_id}`, "published", rec.published ?? null, row.published);
    check(`${row.dossier}/${row.src_id}`, "retrieved", rec.retrieved, row.retrieved);
    check(`${row.dossier}/${row.src_id}`, "url", rec.url, row.source_url);
    check(`${row.dossier}/${row.src_id}`, "family", rec.sourceFamily ?? "", row.family);
    check(`${row.dossier}/${row.src_id}`, "claims", localIds(rec.claims), row.claims);
    check(`${row.dossier}/${row.src_id}`, "subjects", rec.subjects, row.subjects);
  }
  for (const row of rows.cases) {
    const rec = get(`${row.dossier}/cases/${row.case_id.toLowerCase()}.json`);
    if (!rec) { errors.push(`cross-check: case ${row.dossier}/${row.case_id} z record-tables nemá kanonický záznam`); continue; }
    check(`${row.dossier}/${row.case_id}`, "title", rec.title, row.title);
    check(`${row.dossier}/${row.case_id}`, "period", rec.period, row.period);
    check(`${row.dossier}/${row.case_id}`, "status", rec.status, row.status);
    check(`${row.dossier}/${row.case_id}`, "label", rec.statusLabel, row.label);
    check(`${row.dossier}/${row.case_id}`, "subjects", rec.subjects, row.subjects);
  }
  for (const row of rows.gaps) {
    const rec = get(`${row.dossier}/gaps/${row.gap_id.toLowerCase()}.json`);
    if (!rec) { errors.push(`cross-check: gap ${row.dossier}/${row.gap_id} z record-tables nemá kanonický záznam`); continue; }
    check(`${row.dossier}/${row.gap_id}`, "title", rec.title, row.title);
    check(`${row.dossier}/${row.gap_id}`, "priority", rec.priority, row.priority);
    check(`${row.dossier}/${row.gap_id}`, "checked", rec.checked, row.checked);
    check(`${row.dossier}/${row.gap_id}`, "claims", localIds(rec.claims), row.claims);
    check(`${row.dossier}/${row.gap_id}`, "subjects", rec.subjects, row.subjects);
  }
  for (const row of rows.relations) {
    const rec = get(`${row.dossier}/relations/${row.relation_id}.json`);
    if (!rec) { errors.push(`cross-check: relation ${row.dossier}/${row.relation_id} z record-tables nemá kanonický záznam`); continue; }
    check(`${row.dossier}/${row.relation_id}`, "relation_type", rec.relationType, row.relation_type);
    check(`${row.dossier}/${row.relation_id}`, "source", rec.sourceEntity["@id"].split("/").pop(), row.source);
    check(`${row.dossier}/${row.relation_id}`, "target", rec.targetEntity["@id"].split("/").pop(), row.target);
    check(`${row.dossier}/${row.relation_id}`, "label", rec.label, row.label);
    check(`${row.dossier}/${row.relation_id}`, "status", rec.status, row.status);
    check(`${row.dossier}/${row.relation_id}`, "claims", localIds(rec.claims), row.claims);
    check(`${row.dossier}/${row.relation_id}`, "sources", localIds(rec.sources), row.sources);
    check(`${row.dossier}/${row.relation_id}`, "subjects", rec.subjects, row.subjects);
  }
  for (const row of rows.entities) {
    const rec = get(`_shared/entities/${row.entity_id}.json`);
    if (!rec) { errors.push(`cross-check: entita ${row.entity_id} z record-tables nemá kanonický záznam`); continue; }
    check(`entity ${row.entity_id}`, "title", rec.title, row.title);
    check(`entity ${row.entity_id}`, "entity_type", rec.entityType, row.entity_type);
    check(`entity ${row.entity_id}`, "publication_role", rec.publicationRole, row.publication_role);
    check(`entity ${row.entity_id}`, "dossier_status", rec.dossierStatus, row.dossier_status);
    check(`entity ${row.entity_id}`, "coverage_state", rec.coverageState, row.coverage_state);
    check(`entity ${row.entity_id}`, "dossiers", rec.dossiers, row.dossiers);
    check(`entity ${row.entity_id}`, "government_snapshot", rec.snapshotDate ?? null, row.government_snapshot);
  }
  // Počty oběma směry (žádný záznam nevznikl ani nezanikl).
  const mineCount = (registry) => [...outputs.keys()].filter((p) => p.includes(`/${registry}/`)).length;
  const pairs = [["claims", rows.claims.length], ["sources", rows.sources.length], ["cases", rows.cases.length], ["gaps", rows.gaps.length], ["relations", rows.relations.length]];
  for (const [registry, oracle] of pairs) {
    if (mineCount(registry) !== oracle) errors.push(`cross-check: počet ${registry} (migrátor ${mineCount(registry)}) ≠ record-tables (${oracle})`);
  }
  const mineEntities = [...outputs.keys()].filter((p) => p.startsWith("_shared/entities/")).length;
  if (mineEntities < rows.entities.length) errors.push(`cross-check: počet entit (migrátor ${mineEntities}) < record-tables (${rows.entities.length})`);
  return errors;
}

/*
 * Parity kontroly (mise fáze D): čtou ZNOVU z disku obě strany — zdrojový
 * Markdown/TOML i zapsané JSON — a ověřují, že migrace nic nepřidala,
 * neubrala a nezměnila: počty, texty byte-verně, CLM→SRC vazby, statusy,
 * published/retrieved. Vrací pole chyb (prázdné = OK).
 */
export function runParityChecks(root = REPO_ROOT) {
  const errors = [];
  const outRoot = join(root, "data/dossiers");
  const readJson = (p) => JSON.parse(readFileSync(join(outRoot, p), "utf8"));
  const localIds = (arrOfRefs) => (arrOfRefs ?? []).map((r) => r["@id"].split("/").pop());
  const registry = readDossierRegistry(root);

  const expect = (cond, msg) => { if (!cond) errors.push(`parita: ${msg}`); };
  const sameList = (a, b, msg) => expect(deepEqual(a, b), `${msg} (zdroj ${JSON.stringify(b)}, JSON ${JSON.stringify(a)})`);

  const expectedFiles = new Set(["_shared/semantics-baseline.json"]);

  let totals = { claim: 0, source: 0, case: 0, gap: 0, relation: 0, update: 0, dossier: 0, entity: 0 };
  for (const d of registry) {
    const slug = d.slug;
    totals.dossier++;
    expectedFiles.add(`${slug}/dossier.json`);
    expect(existsSync(join(outRoot, slug, "dossier.json")), `${slug}/dossier.json chybí`);

    // Timeline parita: počet entries v timeline contentBlocku == počet
    // [[extra.timeline]] bloků v _index.md, date+title byte-verně.
    const idx = readIndexPage(root, slug);
    if (idx && existsSync(join(outRoot, slug, "dossier.json"))) {
      const srcBlocks = sectionBodies(idx.secs, "extra.timeline");
      const rec = readJson(`${slug}/dossier.json`);
      const timelineBlock = (rec.contentBlocks ?? []).find((b) => b.type === "timeline");
      const written = timelineBlock ? timelineBlock.entries : [];
      expect(
        written.length === srcBlocks.length,
        `${slug}/dossier.json: timeline má ${written.length} entries, zdroj ${srcBlocks.length} [[extra.timeline]] bloků`,
      );
      if (written.length === srcBlocks.length) {
        sameList(
          written.map((e) => [e.date, e.title]),
          srcBlocks.map((b) => [str(b, "date"), str(b, "title")]),
          `${slug}/dossier.json: timeline date/title se liší od [[extra.timeline]] bloků`,
        );
      }
    }

    for (const page of readRecordPages(root, "content/dossiers", slug, "claims")) {
      totals.claim++;
      const id = str(page.block, "clm_id");
      const p = `${slug}/claims/${id.toLowerCase()}.json`;
      expectedFiles.add(p);
      if (!existsSync(join(outRoot, p))) { errors.push(`parita: ${p} chybí`); continue; }
      const rec = readJson(p);
      expect(rec.text === str(page.block, "summary"), `${p}: text ≠ summary (byte-verná shoda porušena)`);
      expect(rec.status === str(page.block, "status"), `${p}: status se změnil`);
      expect(rec.statusLabel === str(page.block, "status_label"), `${p}: statusLabel se změnil`);
      sameList(localIds(rec.sources), arr(page.block, "sources") ?? [], `${p}: CLM→SRC vazby se změnily`);
      sameList(rec.subjects, arr(page.block, "subjects") ?? [], `${p}: subjects se změnily`);
    }
    for (const page of readRecordPages(root, "content/dossiers", slug, "sources")) {
      totals.source++;
      const id = str(page.block, "src_id");
      const p = `${slug}/sources/${id.toLowerCase()}.json`;
      expectedFiles.add(p);
      if (!existsSync(join(outRoot, p))) { errors.push(`parita: ${p} chybí`); continue; }
      const rec = readJson(p);
      expect(rec.title === str(page.block, "title"), `${p}: title se změnil`);
      expect((rec.description ?? null) === str(page.block, "description"), `${p}: description se změnil`);
      expect(rec.url === str(page.block, "url"), `${p}: url se změnila`);
      expect((rec.published ?? null) === str(page.block, "published"), `${p}: published se změnilo`);
      expect(rec.retrieved === str(page.block, "retrieved"), `${p}: retrieved se změnilo`);
      expect(rec.outlet === str(page.block, "outlet"), `${p}: outlet se změnil`);
      expect((rec.sourceFamily ?? null) === str(page.block, "family"), `${p}: family se změnila`);
      sameList(localIds(rec.claims), arr(page.block, "claims") ?? [], `${p}: SRC→CLM vazby se změnily`);
    }
    for (const page of readRecordPages(root, "content/dossiers", slug, "cases")) {
      totals.case++;
      const id = str(page.block, "case_id");
      const p = `${slug}/cases/${id.toLowerCase()}.json`;
      expectedFiles.add(p);
      if (!existsSync(join(outRoot, p))) { errors.push(`parita: ${p} chybí`); continue; }
      const rec = readJson(p);
      expect(rec.summary === str(page.block, "summary"), `${p}: summary se změnilo`);
      expect(rec.status === str(page.block, "status"), `${p}: status se změnil`);
      expect(rec.statusLabel === str(page.block, "label"), `${p}: label se změnil`);
      expect(rec.period === str(page.block, "period"), `${p}: period se změnila`);
      sameList(localIds(rec.claims), arr(page.block, "claims") ?? [], `${p}: CASE→CLM vazby se změnily`);
      sameList(localIds(rec.sources), arr(page.block, "sources") ?? [], `${p}: CASE→SRC vazby se změnily`);
    }
    for (const page of readRecordPages(root, "content/dossiers", slug, "gaps")) {
      totals.gap++;
      const id = str(page.block, "gap_id");
      const p = `${slug}/gaps/${id.toLowerCase()}.json`;
      expectedFiles.add(p);
      if (!existsSync(join(outRoot, p))) { errors.push(`parita: ${p} chybí`); continue; }
      const rec = readJson(p);
      expect(rec.description === str(page.block, "description"), `${p}: description se změnil`);
      expect(rec.priority === str(page.block, "priority"), `${p}: priorita se změnila`);
      expect(rec.checked === str(page.block, "checked"), `${p}: checked se změnilo`);
      sameList(localIds(rec.claims), arr(page.block, "claims") ?? [], `${p}: GAP→CLM vazby se změnily`);
    }
    const { edges } = readGraphTomlBlocks(root, slug);
    for (const edge of edges) {
      totals.relation++;
      const p = `${slug}/relations/${edge.id}.json`;
      expectedFiles.add(p);
      if (!existsSync(join(outRoot, p))) { errors.push(`parita: ${p} chybí`); continue; }
      const rec = readJson(p);
      expect(rec.label === edge.label, `${p}: label se změnil`);
      expect(rec.status === edge.status, `${p}: status se změnil`);
      expect(rec.relationType === edge.relation, `${p}: relationType se změnil`);
      sameList(localIds(rec.claims), edge.claims ?? [], `${p}: REL→CLM vazby se změnily`);
      sameList(localIds(rec.sources), edge.sources ?? [], `${p}: REL→SRC vazby se změnily`);
    }
    for (const entry of readUpdatesToml(root, slug)) {
      totals.update++;
      const p = `${slug}/updates/${entry.identifier}.json`;
      expectedFiles.add(p);
      if (!existsSync(join(outRoot, p))) { errors.push(`parita: ${p} chybí`); continue; }
      const rec = readJson(p);
      expect(rec.summary === entry.summary, `${p}: summary se změnilo`);
      for (const [key, registryName] of [["addedClaims", "claims"], ["updatedClaims", "claims"], ["addedGaps", "gaps"], ["closedGaps", "gaps"], ["reviewedSources", "sources"]]) {
        void registryName;
        if (entry[key]) sameList(localIds(rec[key]), entry[key], `${p}: ${key} se změnilo`);
      }
    }
  }
  for (const page of readRecordPages(root, "content/entities")) {
    totals.entity++;
    const id = str(page.block, "entity_id") ?? page.fileSlug;
    const p = `_shared/entities/${id}.json`;
    expectedFiles.add(p);
    if (!existsSync(join(outRoot, p))) { errors.push(`parita: ${p} chybí`); continue; }
    const rec = readJson(p);
    expect(rec.title === str(page.block, "title"), `${p}: title se změnil`);
    expect(rec.entityType === str(page.block, "entity_type"), `${p}: entityType se změnil`);
    expect(rec.publicationRole === str(page.block, "publication_role"), `${p}: publicationRole se změnila`);
    expect(rec.dossierStatus === str(page.block, "dossier_status"), `${p}: dossierStatus se změnil`);
    expect(rec.coverageState === str(page.block, "coverage_state"), `${p}: coverageState se změnil`);
    sameList(rec.dossiers, arr(page.block, "dossiers") ?? [], `${p}: dossiers se změnily`);
  }

  // Žádný záznam nevznikl: každý zapsaný JSON musí odpovídat zdrojovému
  // záznamu (entity založené z graph uzlů se počítají přes expectedFiles
  // až v migrate(); tady jsou legitimní jen když je zdrojový uzel má).
  const walk = (dir, prefix = "") => {
    if (!existsSync(dir)) return [];
    const out = [];
    for (const name of readdirSync(dir, { withFileTypes: true })) {
      const rel = prefix ? `${prefix}/${name.name}` : name.name;
      if (name.isDirectory()) {
        if (rel === "_shared/vocabularies" || rel === "_shared/context") continue;
        out.push(...walk(join(dir, name.name), rel));
      } else if (name.name.endsWith(".json")) out.push(rel);
    }
    return out;
  };
  const graphOnlyEntities = collectGraphOnlyEntities(root);
  for (const rel of walk(outRoot)) {
    if (expectedFiles.has(rel)) continue;
    const graphOnly = rel.startsWith("_shared/entities/") && graphOnlyEntities.has(rel.slice("_shared/entities/".length, -".json".length));
    if (graphOnly) continue;
    errors.push(`parita: ${rel} nemá protějšek ve zdrojových datech — záznam nesmí vzniknout migrací`);
  }

  return errors;
}

function collectGraphOnlyEntities(root) {
  const global = new Set(readRecordPages(root, "content/entities").map((p) => str(p.block, "entity_id") ?? p.fileSlug));
  const out = new Set();
  for (const d of readDossierRegistry(root)) {
    for (const node of readGraphTomlBlocks(root, d.slug).nodes) {
      if (node.id && !global.has(node.id)) out.add(node.id);
    }
  }
  return out;
}

// --- report -------------------------------------------------------------
function writeReports(root, result) {
  const { counts, mapping, anomalies, droppedFields, baselineEntries } = result;
  mkdirSync(join(root, "data/generated"), { recursive: true });
  const jsonReport = {
    mission: "T-028 fáze D — lossless migrace content/** + TOML → data/dossiers/**/*.json",
    counts,
    baseline: baselineEntries,
    anomalies,
    droppedFields,
    mapping,
  };
  writeFileSync(join(root, "data/generated/migration-report.json"), `${JSON.stringify(jsonReport, null, 2)}\n`);

  const perTypeRows = Object.entries(counts.perType)
    .map(([t, n]) => `| ${t} | ${n} |`)
    .join("\n");
  const perDossierRows = Object.entries(counts.perDossier)
    .map(([slug, c]) => `| ${slug} | ${c.claim} | ${c.source} | ${c.case} | ${c.gap} | ${c.relation} | ${c.update} |`)
    .join("\n");
  const baselineRows = baselineEntries.length
    ? baselineEntries.map((e) => `- \`${e["@id"]}\` — pravidlo ${e.rule}: ${e.reason}`).join("\n")
    : "- žádné — dataset prochází sémantickou bránou bez výjimek";
  const anomalyRows = anomalies.length ? anomalies.map((a) => `- ${a}`).join("\n") : "- žádné";
  const droppedRows = Object.entries(droppedFields)
    .map(([type, keys]) =>
      Object.entries(keys)
        .sort()
        .map(([k, n]) => `| ${type} | \`${k}\` | ${n} |`)
        .join("\n"),
    )
    .filter(Boolean)
    .join("\n");

  const md = `# JSON-first migrace — report fáze D (T-028)

**Generuje**: \`npm run data:migrate\` (scripts/migrations/migrate-content-to-json.mjs) —
tento soubor se při každém běhu deterministicky přegenerovává, ručně needitovat.
Strojová verze včetně úplné mapy „starý soubor → nové @id":
\`data/generated/migration-report.json\` (gitignored, regenerovatelná).

Migrace POUZE ČTE dnešní zdroje pravdy (content/**, data/dossiers.toml,
data/authorizations.toml, data/dossiers/*/{graph,updates}.toml) a zapisuje
kanonické JSON balíčky do \`data/dossiers/**\`. Zdrojové soubory zůstávají
autoritou až do fáze H.

## Počty migrovaných záznamů

| typ | počet |
|---|---|
${perTypeRows}

| dossier | claims | sources | cases | gaps | relations | updates |
|---|---|---|---|---|---|---|
${perDossierRows}

## Klíčová rozhodnutí

1. **Vlastnictví záznamů macinka-turek**: záznamy fyzicky pod
   \`content/dossiers/macinka-turek/\` migrují s \`dossier\` =
   \`macinka-turek\` — agregát je i v kanonickém JSON fyzický domov
   kanonických záznamů. Pole \`subjects\` (tagging z
   \`scripts/dossier/tag-subjects.mjs\`) se přenáší beze změny; případný
   „decoupling" vlastnictví na \`petr-macinka\`/\`filip-turek\` je
   samostatné redakční rozhodnutí MIMO fázi D (viz ADR, náhrada za
   zrušený T-001).
2. **Kanonický zdroj hran je \`graph.toml\`**; detailní stránka
   \`relations/<edge-id>.md\` dodává tělo a \`subjects\` a musí s hranou
   souhlasit (mirror kontrola, nesoulad = chyba). Stejná mirror kontrola
   platí pro \`[[extra.cases]]\` bloky ↔ case stránky.
3. **Texty byte-verně**: claim \`text\` = front matter \`summary\`; celé
   Markdown tělo každé detailní stránky (po odstranění front matter,
   trim) je jediný \`{"type":"markdown"}\` content blok — žádná
   segmentace, žádné přepisy, žádná nová faktická pole, žádné
   confidence/truth skóre.
4. **\`updated\` u entity views**: \`petr-macinka\` a \`filip-turek\`
   nemají vlastní \`updated\` (ani updates.toml) — deterministicky
   přebírají \`updated\` kanonického dossieru \`macinka-turek\`.
5. **Dossier \`title\` je z registru** \`data/dossiers.toml\`;
   stránkový title (\`_index.md\`) se liší jen u \`macinka-turek\`
   („Dossier — …") a zůstává v content/ jako prezentační text.
6. **\`discovered_at\` entit se nemapuje na \`snapshotDate\`** —
   \`snapshotDate\` je dle schématu government-roster snímek
   (\`government_snapshot\`); směšovat s datem objevení by měnilo význam.
   \`discovered_at\`/\`discovered_via\` zůstávají v content/entities do
   rozhodnutí fází E–H (viz inventář nepřenesených polí níže).
7. **Vícero \`[[updates]]\` zápisů téhož dne**: předpoklad fáze B „jeden
   vstup na datum" reálná data nesplňují (11 z 20 updates.toml má víc
   append-only zápisů se stejným datem — postupné pracovní seance).
   Slévání zápisů by nebylo lossless (zánik záznamů, konkatenace textů),
   odmítnutí by znemožnilo migraci; zvoleno minimální rozšíření
   identifikátoru o deterministický pořadový sufix
   (\`2026-07-30\`, \`2026-07-30-2\`, …) podle stabilního append-only
   pořadí v TOML + odpovídající úprava vzorů
   \`updateGlobalId\`/\`updateIdentifier\` v schemas/canonical/
   (zdokumentováno přímo v \`$comment\` schémat). Pole \`date\` zůstává
   čisté datum.
8. **\`[[extra.timeline]]\` bloky \`_index.md\` se migrují lossless**
   (fáze E prerekvizita): každý blok = jeden entry
   \`{ date, title, anchor?, dot?, subjects? }\` v druhém contentBlocku
   \`{ "type": "timeline", "entries": [...] }\` dossier.json — pořadí
   vstupu zachováno, žádná deduplikace, \`date\` byte-verně (včetně
   českého volného formátu, viz \`$comment\` timelineEntry
   v schemas/canonical/_defs.schema.json). Parita počtu entries i
   date/title je součást runParityChecks.

## Known-baseline-violations (grandfathered debt)

Sémantická porušení zděděná 1:1 z dnešního obsahu. Migrace data nemění,
proto je nemůže „opravit"; místo toho je zapisuje do explicitního
allowlistu \`data/dossiers/_shared/semantics-baseline.json\`, který
sémantická brána (\`scripts/data/validate-semantics.mjs\`) čte: záznam
v allowlistu = warning, jakékoli NOVÉ porušení mimo allowlist = chyba.
Pravidla S5/S6 (autorizace) grandfatherovat nelze.

${baselineRows}

## Anomálie a jednotlivá rozhodnutí běhu

${anomalyRows}

## Inventář polí, která kanonické schéma nepřenáší

Následující front matter klíče kanonická schémata (schemas/canonical/)
záměrně nemají; hodnoty NEZANIKAJÍ — zdrojové soubory zůstávají v repu
beze změny až do fáze H, kde se o každém poli rozhodne (přenést do
schémat v2 / přesunout do prezentační vrstvy / zahodit). Strukturální
klíče (\`dossier\`, \`record_type\`, \`lang\`, \`template\`, \`weight\`,
\`title\`/\`description\` tam, kde jen duplikují jiná pole) plně nahrazuje
kanonická obálka a umístění souboru.

| typ záznamu | klíč | výskytů |
|---|---|---|
${droppedRows}

Pozn.: \`aliases\` u claim/source/gap stránek (staré routy) nemá v
schématech claim/source/gap ekvivalent — routing aliasy převezme
generátor content adaptérů (fáze E) přímo z view modelu; u entit se
\`aliases\` přenáší jako \`routeAliases\`, u dossierů jako \`aliases\`.

## Co zůstává fázím E–G

- **E**: generátor content/** adaptérů (stubů) z kanonických dat.
- **F**: view modely pro šablony.
- **G**: přepojení dnešních generátorů/exportů na compiled model
  (case→sources unie do exportního tvaru, aliasy rout, timeline).
- **H**: odstranění starých zdrojů pravdy — teprve pak přestává platit
  „content/ je autorita" a inventář výše se musí vyřešit beze zbytku.
`;
  mkdirSync(join(root, "docs/migrations"), { recursive: true });
  writeFileSync(join(root, "docs/migrations/json-first-migration-report.md"), md);
}

// --- CLI ----------------------------------------------------------------
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const result = await migrate();
  const { counts, errors, baselineEntries } = result;
  console.log(`Migrace: ${counts.total} kanonických souborů (${Object.entries(counts.perType).map(([t, n]) => `${t}: ${n}`).join(", ")}).`);
  if (baselineEntries.length) {
    console.log(`Grandfathered sémantická porušení (allowlist): ${baselineEntries.length}`);
    for (const e of baselineEntries) console.log(`  BASELINE ${e.rule} ${e["@id"]}`);
  }
  for (const a of result.anomalies) console.log(`  NOTE ${a}`);
  if (errors.length) {
    console.log(`\n${errors.length} chyb(a):`);
    for (const e of errors) console.log(`  ERROR ${e}`);
    console.log("\nFAILED — parity/kolize/validace nesouhlasí, výstup nepovažovat za platný.");
    process.exit(1);
  }
  writeReports(REPO_ROOT, result);
  console.log("Parity OK — počty, texty, vazby, statusy i datumy sedí 1:1 se zdrojem.");
  console.log("Report: docs/migrations/json-first-migration-report.md + data/generated/migration-report.json");
  console.log("OK");
}

#!/usr/bin/env node
/*
 * Generátor Zola content adaptérů (T-028 fáze E staging → fáze F full-fidelity).
 *
 * Z compiled modelu (compileDataset) generuje content adaptéry do
 * data/generated/content-staging/ — STEJNÁ struktura jako content/
 * (dossiers/_index.md, dossiers/<slug>/_index.md,
 * dossiers/<slug>/<registry>/{_index.md,<record>.md},
 * entities/{_index.md,<entity>.md}). Fáze F je přes `data:sync-content`
 * kopíruje do content/ (viz scripts/data/sync-content.mjs) — content/**
 * pro dossierové záznamy a entity je od fáze F GENEROVANÝ artefakt.
 *
 * Tvar adaptéru (fáze F): NE minimální stub, ale plnohodnotná regenerace
 * dnešního content souboru z kanonického modelu:
 *
 *   - VŠECHNA doménová front matter pole se DERIVUJÍ z kanonického
 *     záznamu (inverze mapování migrátoru fáze D) — do fáze H je čtou
 *     validátory obsahové vrstvy (validate-dossier, verify-anchors),
 *     base.html/jsonld partial a aux šablony; každé derivované pole je
 *     dočasný adaptér, o kterém rozhodne fáze H;
 *   - pole/tělo MIMO kanonický model v1 (aliasy starých rout, provenience
 *     entit discovered_at/discovered_via, redakční těla registry indexů,
 *     prezentační title macinka-turek, …) se PŘENÁŠEJÍ beze změny
 *     z existujícího content souboru (passthrough RAW řádků). Po swapu
 *     je content == staging, takže passthrough je stabilní pevný bod
 *     (generátor čte tytéž hodnoty, které sám zapsal);
 *   - tělo detailních záznamů a dossier _index = markdown content bloky
 *     kanonického záznamu (byte-verně, viz migrátor) — Zola je renderuje
 *     jako dřív, takže {#kotvy}, @/ interní odkazy i footnotes fungují
 *     beze změny (runtime `markdown()` filtr @/ odkazy neresolvuje,
 *     proto tělo nese adaptér, ne šablona);
 *   - [extra] navíc nese generated = true, record_id (@id) a view_model
 *     (datový vstup šablon fáze F).
 *
 * Determinismus: stabilní pořadí klíčů, LF, trailing newline, žádné
 * timestampy; výstupní adresář se před zápisem čistí.
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadCanonicalDataset, compileDataset } from "./lib/dataset.mjs";
import { REGISTRY_LABELS, VIEW_REGISTRIES } from "./build-view-models.mjs";
import { frontMatter, pageBody, sections } from "../migrations/lib/read-content.mjs";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const STAGING_REL = "data/generated/content-staging";

// Kořenové indexy jsou ručně psané stránky (mají redakční tělo mimo
// kanonický model v1) — staging je nese kvůli 1:1 route pokrytí
// (check-generated C1/C4), ale sync-content je do content/ NEkopíruje.
export const SYNC_EXCLUDED = Object.freeze(["dossiers/_index.md", "entities/_index.md"]);

// Marker generovaného souboru — TOML komentář ve front matter, aby tělo
// stránky zůstalo byte-verně kanonickým markdownem (žádný marker v HTML).
const GENERATED_MARKER = "# GENERATED FILE. DO NOT EDIT. Zdroj: data/dossiers/** — regeneruje `npm run data:build`.";

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

// Výchozí popisky registry indexů (1:1 s dnešními content soubory 20
// standardních dossierů; entity views mají vlastní description, který se
// přenáší passthrough).
const REGISTRY_DESCRIPTIONS = Object.freeze({
  claims: "Registr tvrzení dossieru — každý záznam odkazuje na svou zdrojovou stránku.",
  sources: "Registr zdrojů dossieru — každý záznam odkazuje na svou zdrojovou stránku.",
  cases: "Registr kauz dossieru — každý záznam odkazuje na svou zdrojovou stránku.",
  gaps: "Registr mezer dossieru — každý záznam odkazuje na svou zdrojovou stránku.",
  relations: "Registr vztahů dossieru — každý záznam odkazuje na svou zdrojovou stránku.",
});

const tomlString = (v) => `"${String(v).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
const tomlArray = (values) => `[${values.map(tomlString).join(", ")}]`;
const localPart = (iri) => (typeof iri === "string" ? iri.split("/").pop() : null);
const localIds = (refs) => (refs ?? []).map((r) => localPart(r["@id"]));
const mdBody = (blocks) =>
  (blocks ?? [])
    .filter((b) => b.type === "markdown")
    .map((b) => b.value)
    .join("\n\n");

/*
 * Passthrough čtení existujícího content souboru: RAW řádky klíčů po
 * sekcích (top / extra / ostatní sekce verbatim) + tělo. RAW řádky (ne
 * parse→re-render) zachovávají původní escaping beze změny.
 */
function readExisting(contentRoot, relPath) {
  const file = join(contentRoot, "content", ...relPath.split("/"));
  if (!existsSync(file)) return null;
  const text = readFileSync(file, "utf8");
  const fm = frontMatter(text);
  const secs = sections(fm);
  const rawEntries = (body) => {
    const entries = [];
    for (const line of body.split("\n")) {
      const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=/);
      if (m) entries.push({ key: m[1], line });
    }
    return entries;
  };
  const top = rawEntries(secs.find((s) => s.header === null)?.body ?? "");
  const extra = rawEntries(secs.find((s) => s.header === "extra")?.body ?? "");
  // Ostatní sekce (mimo top a [extra]) verbatim — hlavička + tělo.
  const other = secs
    .filter((s) => s.header !== null && s.header !== "extra")
    .map((s) => ({ header: s.header, body: s.body }));
  return { top, extra, other, body: pageBody(text) };
}

const rawValue = (entries, key) => entries?.find((e) => e.key === key)?.line ?? null;

/*
 * Skládání front matter: derivované klíče (key→hodnota už zrenderovaná
 * jako TOML pravá strana) v pevném pořadí, potom passthrough RAW řádky
 * všech klíčů, které derivace nepokrývá (v původním pořadí souboru).
 */
function renderEntries(derived, passthroughEntries, derivedKeys) {
  const lines = [];
  for (const [key, rhs] of derived) {
    if (rhs === undefined || rhs === null) continue;
    lines.push(`${key} = ${rhs}`);
  }
  for (const e of passthroughEntries ?? []) {
    if (derivedKeys.has(e.key)) continue;
    lines.push(e.line);
  }
  return lines;
}

function renderStub({ top, extra, sectionsText = [], body = "" }) {
  const lines = ["+++", GENERATED_MARKER, ...top, "", "[extra]", ...extra];
  for (const block of sectionsText) {
    lines.push("", ...block);
  }
  lines.push("+++");
  const text = `${lines.join("\n")}\n`;
  return body ? `${text}${body}\n` : text;
}

/*
 * buildStubs(compiled, { contentRoot }) → Map<posixRelPath, string>
 * relPath je relativní k data/generated/content-staging/ a 1:1 zrcadlí
 * content/ strukturu. contentRoot = kořen repa s dnešním content/
 * (zdroj passthrough polí — po swapu jsou to adaptéry samotné).
 */
export function buildStubs(compiled, { contentRoot = REPO_ROOT } = {}) {
  const stubs = new Map();
  const viewPath = (rel) => `generated/views/${rel}`;
  const byId = compiled.indexes.byId;

  const dossierWrappers = compiled.records.filter((w) => w.registry === "dossier");

  // Sdílený skládač jednoho adaptéru.
  //   relPath        cesta stubu (== content cesta)
  //   topDerived     [[key, rhs|null]] — derivovaná top-level pole
  //   extraDerived   [[key, rhs|null]] — derivovaná [extra] pole
  //   ownSections    [["[extra.authorization]", "authorized = true", …], …]
  //                  (jediné pod-sekce v covered content jsou dossierové
  //                  [extra.authorization]/[[extra.timeline]]/[[extra.cases]]
  //                  a ty se VŽDY derivují z kanonického modelu — žádný
  //                  passthrough cizích sekcí neexistuje, viz inventář
  //                  front matter klíčů v reportu fáze F)
  //   body           derivované tělo; null = passthrough těla
  const put = (relPath, { topDerived, extraDerived, ownSections = [], body = null }) => {
    const existing = readExisting(contentRoot, relPath);
    const topKeys = new Set(topDerived.map(([k]) => k));
    const extraKeys = new Set(extraDerived.map(([k]) => k));
    const top = renderEntries(topDerived, existing?.top, topKeys);
    const extra = renderEntries(extraDerived, existing?.extra, extraKeys);
    const finalBody = body !== null ? body : (existing?.body ?? "");
    stubs.set(relPath, renderStub({ top, extra, sectionsText: ownSections, body: finalBody }));
  };

  // template + aliasy z existujícího souboru (passthrough) — template
  // nikdy nederivujeme naslepo, dnešní názvy šablon jsou autorita.
  const existingTop = (relPath) => readExisting(contentRoot, relPath)?.top ?? null;
  const templateOf = (relPath, fallback) => {
    const line = rawValue(existingTop(relPath), "template");
    const m = line?.match(/=\s*"((?:[^"\\]|\\.)*)"\s*$/);
    return m ? m[1] : fallback;
  };
  const aliasesOf = (relPath) => {
    const line = rawValue(existingTop(relPath), "aliases");
    if (!line) return [];
    const m = line.match(/\[([^\]]*)\]/);
    return m ? [...m[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => x[1]) : [];
  };
  const mergedAliases = (relPath, derived) => {
    const merged = [...new Set([...aliasesOf(relPath), ...(derived ?? [])])];
    return merged.length ? tomlArray(merged) : null;
  };

  // --- kořenové indexy (sync je NEkopíruje — SYNC_EXCLUDED) --------------
  const putRootIndex = (relPath, { title, defaultTemplate, viewModel }) => {
    put(relPath, {
      topDerived: [
        ["title", tomlString(rawTitle(contentRoot, relPath) ?? title)],
        ["template", tomlString(templateOf(relPath, defaultTemplate))],
      ],
      extraDerived: [
        ["generated", "true"],
        ["view_model", tomlString(viewModel)],
        ["lang", tomlString("cs")],
      ],
    });
  };
  putRootIndex("dossiers/_index.md", {
    title: "Dossiery",
    defaultTemplate: DEFAULT_TEMPLATES["dossiers-index"],
    viewModel: viewPath("dossiers-index.json"),
  });
  putRootIndex("entities/_index.md", {
    title: "Registr entit",
    defaultTemplate: DEFAULT_TEMPLATES["entities-index"],
    viewModel: viewPath("entities-index.json"),
  });

  // --- dossiery ----------------------------------------------------------
  const recordsOf = new Map(); // slug -> registry -> [wrapper]
  for (const w of compiled.records) {
    if (w.registry === "dossier") continue;
    const perRegistry = recordsOf.get(w.dossier) ?? new Map();
    recordsOf.set(w.dossier, perRegistry);
    perRegistry.set(w.registry, [...(perRegistry.get(w.registry) ?? []), w]);
  }

  for (const w of dossierWrappers) {
    const slug = w.dossier;
    const record = w.record;
    const relPath = `dossiers/${slug}/_index.md`;
    const isView = Boolean(record.canonicalDossier && record.canonicalDossier !== slug);
    const isAggregate = record.dossierType === "aggregate";

    // [extra.authorization] + [[extra.timeline]] + [[extra.cases]] se
    // derivují z kanonického modelu (mirror bloky case záznamů, timeline
    // content blok) — verify-anchors je dál čte ze zdroje content/.
    const ownSections = [];
    if (record.authorization?.records?.length) {
      ownSections.push([
        "[extra.authorization]",
        "authorized = true",
        `record_ids = ${tomlArray(record.authorization.records)}`,
      ]);
    }
    const timelineBlock = (record.contentBlocks ?? []).find((b) => b.type === "timeline");
    for (const entry of timelineBlock?.entries ?? []) {
      const block = ["[[extra.timeline]]", `date = ${tomlString(entry.date)}`, `title = ${tomlString(entry.title)}`];
      if (entry.anchor !== undefined) block.push(`anchor = ${tomlString(entry.anchor)}`);
      if (entry.dot !== undefined) block.push(`dot = ${tomlString(entry.dot)}`);
      if (entry.subjects !== undefined) block.push(`subjects = ${tomlArray(entry.subjects)}`);
      ownSections.push(block);
    }
    for (const cw of recordsOf.get(slug)?.get("cases") ?? []) {
      const c = cw.record;
      const subjects = c.subjects?.length ? c.subjects : record.subject ? [record.subject] : [];
      const block = [
        "[[extra.cases]]",
        `anchor = ${tomlString(c.anchor)}`,
        `period = ${tomlString(c.period)}`,
        `title = ${tomlString(c.title)}`,
        `status = ${tomlString(c.status)}`,
        `label = ${tomlString(c.statusLabel)}`,
        `summary = ${tomlString(c.summary)}`,
        `claims = ${tomlArray(localIds(c.claims))}`,
      ];
      if (subjects.length) block.push(`subjects = ${tomlArray(subjects)}`);
      ownSections.push(block);
    }

    put(relPath, {
      topDerived: [
        // Prezentační title stránky se přenáší (macinka-turek: „Dossier — …");
        // kanonický title žije v record.title/dossier_title.
        ["title", tomlString(rawTitle(contentRoot, relPath) ?? record.title)],
        ["description", tomlString(record.description)],
        ["template", tomlString(templateOf(relPath, isAggregate ? DEFAULT_TEMPLATES["dossier-aggregate"] : DEFAULT_TEMPLATES.dossier))],
        ["aliases", mergedAliases(relPath, record.aliases)],
      ],
      extraDerived: [
        ["generated", "true"],
        ["record_id", tomlString(record["@id"])],
        ["view_model", tomlString(viewPath(`dossiers/${slug}/overview.json`))],
        ["dossier", tomlString(slug)],
        ["dossier_title", isAggregate ? null : tomlString(record.title)],
        ["record_type", tomlString("dossier")],
        ["dossier_type", tomlString(record.dossierType)],
        ["canonical_dossier", record.canonicalDossier ? tomlString(record.canonicalDossier) : null],
        ["subject", record.subject ? tomlString(record.subject) : null],
        ["lang", tomlString(record.language ?? "cs")],
        ["seo_type", record.seo?.seoType ? tomlString(record.seo.seoType) : null],
        // Entity view (petr-macinka, filip-turek) updated/reviewed_at nenese —
        // dědí je z kanonického dossieru až kompilátor (viz migrátor fáze D).
        ["updated", isView ? null : tomlString(record.updated)],
        ["reviewed_at", record.reviewedAt !== undefined && !isView ? tomlString(record.reviewedAt) : null],
      ],
      ownSections,
      body: mdBody(record.contentBlocks),
    });

    // registry indexy -----------------------------------------------------
    for (const registry of VIEW_REGISTRIES) {
      const idxPath = `dossiers/${slug}/${registry}/_index.md`;
      const existing = readExisting(contentRoot, idxPath);
      put(idxPath, {
        topDerived: [
          ["title", tomlString(rawTitle(contentRoot, idxPath) ?? REGISTRY_LABELS[registry])],
          [
            "description",
            rawValue(existing?.top, "description")
              ? passthroughRhs(rawValue(existing.top, "description"))
              : tomlString(REGISTRY_DESCRIPTIONS[registry]),
          ],
          ["template", tomlString(templateOf(idxPath, DEFAULT_TEMPLATES[`${registry}-index`]))],
          // sort_by: entity-view registry indexy ho dnes nemají (karty se
          // skládají z kanonické sekce) — presence se přenáší 1:1.
          ["sort_by", existing ? passthroughRhs(rawValue(existing.top, "sort_by")) : tomlString("weight")],
          ["aliases", mergedAliases(idxPath, null)],
        ],
        extraDerived: [
          ["generated", "true"],
          ["view_model", tomlString(viewPath(`dossiers/${slug}/${registry}-index.json`))],
          ["dossier", tomlString(slug)],
          ["lang", tomlString("cs")],
          [
            "seo_type",
            existing && !rawValue(existing.extra, "seo_type") ? null : tomlString("CollectionPage"),
          ],
        ],
      });
    }
  }

  // --- záznamy -----------------------------------------------------------
  const entityTitle = (iri) => byId[iri]?.record.title ?? localPart(iri);
  const perRegistryPosition = new Map(); // `${slug}/${registry}` -> counter
  for (const w of compiled.records) {
    if (w.registry === "dossier" || w.registry === "updates") continue;
    const r = w.record;
    const slug = w.dossier;
    const posKey = `${slug}/${w.registry}`;
    const position = (perRegistryPosition.get(posKey) ?? 0) + 1;
    perRegistryPosition.set(posKey, position);
    const relPath = `dossiers/${slug}/${w.registry}/${String(r.identifier).toLowerCase()}.md`;
    const weight = r.order ?? position;
    const subjectsRhs = r.subjects?.length ? tomlArray(r.subjects) : null;
    const common = {
      generated: ["generated", "true"],
      recordId: ["record_id", tomlString(r["@id"])],
      viewModel: ["view_model", tomlString(viewPath(`dossiers/${slug}/${w.registry}/${String(r.identifier).toLowerCase()}.json`))],
      dossier: ["dossier", tomlString(slug)],
      recordType: ["record_type", tomlString(r.recordType)],
      lang: ["lang", tomlString("cs")],
    };

    // Meta `description` u claim/case je legacy scaffold artefakt (někde
    // plné znění, jinde historická truncace na 140/200 znaků — per soubor,
    // bez jednotného pravidla). Není to kanonické pole: přenáší se
    // passthrough beze změny; teprve u záznamu bez content protějšku se
    // derivuje plný text/summary. Rozhodnutí o sjednocení patří fázi H.
    const existingDescription = passthroughRhs(rawValue(readExisting(contentRoot, relPath)?.top, "description"));

    if (r.recordType === "claim") {
      put(relPath, {
        topDerived: [
          ["title", tomlString(r.identifier)],
          ["description", existingDescription ?? tomlString(r.text)],
          ["template", tomlString(templateOf(relPath, DEFAULT_TEMPLATES.claim))],
          ["weight", String(weight)],
          ["aliases", mergedAliases(relPath, null)],
        ],
        extraDerived: [
          common.generated,
          common.recordId,
          common.viewModel,
          common.dossier,
          common.recordType,
          common.lang,
          ["clm_id", tomlString(r.identifier)],
          ["status", tomlString(r.status)],
          ["status_label", tomlString(r.statusLabel)],
          ["summary", tomlString(r.text)],
          ["sources", tomlArray(localIds(r.sources))],
          ["subjects", subjectsRhs],
        ],
        body: mdBody(r.content),
      });
    } else if (r.recordType === "source") {
      put(relPath, {
        topDerived: [
          ["title", tomlString(r.title)],
          ["description", r.description !== undefined ? tomlString(r.description) : null],
          ["template", tomlString(templateOf(relPath, DEFAULT_TEMPLATES.source))],
          ["weight", String(weight)],
          ["aliases", mergedAliases(relPath, null)],
        ],
        extraDerived: [
          common.generated,
          common.recordId,
          common.viewModel,
          ["subjects", subjectsRhs],
          common.dossier,
          common.recordType,
          common.lang,
          ["src_id", tomlString(r.identifier)],
          ["outlet", tomlString(r.outlet)],
          ["family", r.sourceFamily !== undefined ? tomlString(r.sourceFamily) : null],
          ["src_type", tomlString(r.sourceType)],
          ["url", tomlString(r.url)],
          ["published", r.published !== undefined ? tomlString(r.published) : null],
          ["retrieved", tomlString(r.retrieved)],
          ["claims", tomlArray(localIds(r.claims))],
        ],
        body: mdBody(r.content),
      });
    } else if (r.recordType === "case") {
      put(relPath, {
        topDerived: [
          ["title", tomlString(r.title)],
          ["description", existingDescription ?? tomlString(r.summary)],
          ["template", tomlString(templateOf(relPath, DEFAULT_TEMPLATES.case))],
          ["weight", String(weight)],
          ["aliases", mergedAliases(relPath, null)],
        ],
        extraDerived: [
          common.generated,
          common.recordId,
          common.viewModel,
          common.dossier,
          common.recordType,
          common.lang,
          ["case_id", tomlString(r.identifier)],
          ["anchor", tomlString(r.anchor)],
          ["period", tomlString(r.period)],
          ["status", tomlString(r.status)],
          ["label", tomlString(r.statusLabel)],
          ["summary", tomlString(r.summary)],
          ["claims", tomlArray(localIds(r.claims))],
          ["sources", tomlArray(localIds(r.sources))],
          ["subjects", subjectsRhs],
        ],
        body: mdBody(r.content),
      });
    } else if (r.recordType === "gap") {
      put(relPath, {
        topDerived: [
          ["title", tomlString(r.title)],
          ["description", tomlString(r.description)],
          ["template", tomlString(templateOf(relPath, DEFAULT_TEMPLATES.gap))],
          ["weight", String(weight)],
          ["aliases", mergedAliases(relPath, null)],
        ],
        extraDerived: [
          common.generated,
          common.recordId,
          common.viewModel,
          ["subjects", subjectsRhs],
          common.dossier,
          common.recordType,
          common.lang,
          ["gap_id", tomlString(r.identifier)],
          ["priority", tomlString(r.priority)],
          ["checked", r.checked !== undefined && r.checked !== null ? tomlString(r.checked) : null],
          ["claims", tomlArray(localIds(r.claims))],
        ],
        body: mdBody(r.content),
      });
    } else if (r.recordType === "relation") {
      // Titulek vztahu dnes nese per-dossier labely uzlů z graph.toml
      // („Andrej Babiš (premiér)"), které kanonický model v1 nemá (globální
      // entita má jeden title) — passthrough; derivace jen pro novou hranu.
      put(relPath, {
        topDerived: [
          [
            "title",
            rawValue(readExisting(contentRoot, relPath)?.top, "title")
              ? tomlString(rawTitle(contentRoot, relPath))
              : tomlString(`${entityTitle(r.sourceEntity["@id"])} — ${r.label} — ${entityTitle(r.targetEntity["@id"])}`),
          ],
          ["template", tomlString(templateOf(relPath, DEFAULT_TEMPLATES.relation))],
          ["weight", String(weight)],
          ["aliases", mergedAliases(relPath, null)],
        ],
        extraDerived: [
          common.generated,
          common.recordId,
          common.viewModel,
          common.dossier,
          common.recordType,
          ["rel_id", tomlString(r.identifier)],
          ["source", tomlString(localPart(r.sourceEntity["@id"]))],
          ["target", tomlString(localPart(r.targetEntity["@id"]))],
          ["relation_type", tomlString(r.relationType)],
          ["label", tomlString(r.label)],
          ["status", tomlString(r.status)],
          ["claims", tomlArray(localIds(r.claims))],
          ["sources", tomlArray(localIds(r.sources))],
          ["subjects", subjectsRhs],
        ],
        body: mdBody(r.content),
      });
    }
  }

  // --- entity ------------------------------------------------------------
  for (const [i, w] of compiled.entities.entries()) {
    const r = w.record;
    const relPath = `entities/${r.entityId}.md`;
    // Entity weight = kanonické `order` (redakční pořadí registru,
    // aditivní pole schématu — fáze F); nová entita bez order dostane
    // pozici v abecedním pořadí.
    put(relPath, {
      topDerived: [
        ["title", tomlString(rawTitle(contentRoot, relPath) ?? r.title)],
        ["template", tomlString(templateOf(relPath, DEFAULT_TEMPLATES.entity))],
        ["weight", String(r.order ?? i + 1)],
        ["aliases", mergedAliases(relPath, r.routeAliases)],
      ],
      extraDerived: [
        ["generated", "true"],
        ["record_id", tomlString(r["@id"])],
        ["view_model", tomlString(viewPath(`entities/${r.entityId}.json`))],
        ["record_type", tomlString("entity")],
        ["entity_id", tomlString(r.entityId)],
        ["entity_type", tomlString(r.entityType)],
        ["publication_role", tomlString(r.publicationRole)],
        ["dossier_enabled", String(r.dossierEnabled === true)],
        ["dossier_status", tomlString(r.dossierStatus)],
        ["coverage_state", tomlString(r.coverageState)],
        ["dossiers", tomlArray(r.dossiers ?? [])],
        ["government_snapshot", r.snapshotDate !== undefined ? tomlString(r.snapshotDate) : null],
      ],
      body: mdBody(r.content),
    });
  }

  return stubs;
}

// Prezentační title z existujícího souboru — RAW hodnota (unescaped).
function rawTitle(contentRoot, relPath) {
  const existing = readExisting(contentRoot, relPath);
  const line = rawValue(existing?.top, "title");
  const m = line?.match(/=\s*"((?:[^"\\]|\\.)*)"\s*$/);
  return m ? m[1].replace(/\\(.)/g, "$1") : null;
}

// Passthrough pravé strany RAW řádku (`key = <rhs>` → `<rhs>`), null-safe.
function passthroughRhs(line) {
  if (!line) return null;
  const idx = line.indexOf("=");
  return idx === -1 ? null : line.slice(idx + 1).trim();
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
  console.log(`Content adaptéry (staging): ${stubs.size} souborů → ${STAGING_REL}/`);
  console.log("OK");
}

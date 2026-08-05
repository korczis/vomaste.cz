#!/usr/bin/env node
/*
 * Generátor Zola content adaptérů (T-028: fáze E staging → fáze F
 * full-fidelity → fáze H MINIMÁLNÍ OBÁLKA).
 *
 * Z compiled modelu (compileDataset) generuje content adaptéry do
 * data/generated/content-staging/ — STEJNÁ struktura jako content/;
 * `data:sync-content` je kopíruje do content/ — content/** pro
 * dossierové záznamy a entity je GENEROVANÝ artefakt.
 *
 * Tvar adaptéru (fáze H): MINIMÁLNÍ stub — jen routing obálka:
 *
 *   top:    title, template, weight, description, sort_by, aliases
 *   extra:  generated, record_id, view_model, dossier, record_type,
 *           lang (+ id pole záznamu: clm_id/src_id/case_id/gap_id/
 *           rel_id/entity_id — čte je base.html is_record a entity.html
 *           lookupy; u dossieru dossier_type/seo_type/updated/reviewed_at
 *           — čtou je base.html a partials/jsonld.html)
 *
 *   Všechna OSTATNÍ doménová pole zanikla — šablony čtou view modely
 *   (load_data("data/" ~ extra.view_model)), verify skripty kanonický
 *   model. Vynucuje lint-generated-content.mjs (fáze H krok 5).
 *
 *   Passthrough zůstává JEN pro prezentační pole, o kterých adaptér
 *   rozhoduje sám (dokumentováno v reportu fáze H):
 *     - title (prezentační titulky: „Dossier — …" u agregátu, 1 relation
 *       s odchylkou od derivace z graph labelů),
 *     - description u claim/case (legacy scaffold truncace — sjednocení
 *       je redakční změna mimo fázi H),
 *     - sort_by/template/description u registry indexů.
 *   Po swapu je content == staging, takže passthrough je stabilní pevný
 *   bod (generátor čte tytéž hodnoty, které sám zapsal).
 *
 *   Tělo detailních záznamů a dossier _index = markdown content bloky
 *   kanonického záznamu (byte-verně) — Zola je renderuje jako dřív,
 *   takže {#kotvy}, @/ interní odkazy i footnotes fungují beze změny.
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

// Meta description z redakčního těla záznamu. Bez ní spadne stránka
// v base.html na popis celého webu — a ten byl doslova týž na 820
// stránkách (326 vztahů + ~494 entit), takže je vyhledávač ani náhled
// odkazu nerozlišily. Nic se tu nevymýšlí: bere se začátek už napsaného
// kanonického textu, jen zkrácený a zbavený markdown syntaxe, aby se
// v atributu <meta> neobjevily odkazy a hvězdičky.
const summarize = (text, limit = 185) => {
  const flat = String(text ?? "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`#>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!flat) return null;
  if (flat.length <= limit) return flat;
  const cut = flat.slice(0, limit);
  const at = cut.lastIndexOf(" ");
  return `${(at > limit * 0.6 ? cut.slice(0, at) : cut).replace(/[,;:.\s]+$/, "")}…`;
};

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
 * jako TOML pravá strana) v pevném pořadí. Fáze H: žádný passthrough
 * cizích klíčů — minimální obálka.
 */
function renderEntries(derived) {
  const lines = [];
  for (const [key, rhs] of derived) {
    if (rhs === undefined || rhs === null) continue;
    lines.push(`${key} = ${rhs}`);
  }
  return lines;
}

function renderStub({ top, extra, body = "" }) {
  const lines = ["+++", GENERATED_MARKER, ...top, "", "[extra]", ...extra, "+++"];
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
  const put = (relPath, { topDerived, extraDerived, body = "" }) => {
    // Fáze H: ŽÁDNÝ generický passthrough — stub nese jen explicitně
    // derivovaná pole (minimální obálka). Prezentační výjimky (title,
    // description, sort_by, template) se čtou adresně přes rawTitle/
    // templateOf/passthroughRhs.
    const top = renderEntries(topDerived);
    const extra = renderEntries(extraDerived);
    stubs.set(relPath, renderStub({ top, extra, body }));
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

    put(relPath, {
      topDerived: [
        // Prezentační title stránky se přenáší (macinka-turek: „Dossier — …");
        // kanonický title žije v record.title.
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
        ["record_type", tomlString("dossier")],
        // dossier_type/seo_type/lang/updated/reviewed_at čtou base.html a
        // partials/jsonld.html napříč typy stránek — zůstávají v obálce.
        ["dossier_type", tomlString(record.dossierType)],
        ["lang", tomlString(record.language ?? "cs")],
        ["seo_type", record.seo?.seoType ? tomlString(record.seo.seoType) : null],
        // Entity view (petr-macinka, filip-turek) updated/reviewed_at nenese —
        // dědí je z kanonického dossieru až view model (viz fáze D/F).
        ["updated", isView ? null : tomlString(record.updated)],
        ["reviewed_at", record.reviewedAt !== undefined && !isView ? tomlString(record.reviewedAt) : null],
      ],
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
          // skládají z view modelu) — presence se přenáší 1:1.
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
        // Redakční tělo registry indexu — prezentační text mimo kanonický
        // model v1, adresný passthrough (rozhodnutí fáze H, viz report).
        body: existing?.body ?? "",
      });
    }
  }

  // --- záznamy -----------------------------------------------------------
  const entityTitle = (iri) => byId[iri]?.record.title ?? localPart(iri);
  const dossierTitles = new Map(dossierWrappers.map((w) => [w.dossier, w.record.title]));
  const graphLabelMaps = new Map(
    dossierWrappers
      .filter((w) => w.record.graph)
      .map((w) => [w.dossier, new Map(w.record.graph.nodes.map((n) => [n.entity, n.label]))]),
  );
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
    const idField = { claims: "clm_id", sources: "src_id", cases: "case_id", gaps: "gap_id", relations: "rel_id" }[w.registry];

    // Meta `description` u claim/case je legacy scaffold artefakt (někde
    // plné znění, jinde historická truncace na 140/200 znaků — per soubor,
    // bez jednotného pravidla). Přenáší se adresným passthrough beze změny;
    // u záznamu bez content protějšku se derivuje plný text/summary.
    // Sjednocení je redakční změna mimo fázi H (viz report).
    const existingDescription = passthroughRhs(rawValue(readExisting(contentRoot, relPath)?.top, "description"));

    let title;
    let description = null;
    if (r.recordType === "claim") {
      title = tomlString(r.identifier);
      description = existingDescription ?? tomlString(r.text);
    } else if (r.recordType === "source") {
      title = tomlString(r.title);
      description = r.description !== undefined ? tomlString(r.description) : null;
    } else if (r.recordType === "case") {
      title = tomlString(r.title);
      description = existingDescription ?? tomlString(r.summary);
    } else if (r.recordType === "gap") {
      title = tomlString(r.title);
      description = tomlString(r.description);
    } else {
      // relation: titulek nese per-dossier labely uzlů z kanonické grafové
      // vrstvy (dossier.graph); prezentační odchylka (1 stránka) se
      // přenáší passthrough — title je prezentační pole adaptéru.
      const labels = graphLabelMaps.get(slug) ?? new Map();
      const src = localPart(r.sourceEntity["@id"]);
      const tgt = localPart(r.targetEntity["@id"]);
      const derived = `${labels.get(src) ?? entityTitle(r.sourceEntity["@id"])} — ${r.label} — ${labels.get(tgt) ?? entityTitle(r.targetEntity["@id"])}`;
      title = tomlString(rawTitle(contentRoot, relPath) ?? derived);
      // Tělo stránky vztahu je generický rozcestník („Viz plné znění…"),
      // takže popis se skládá z toho, co záznam skutečně nese: koho s kým
      // spojuje, v čím grafu a o která tvrzení se opírá. Poslední věta není
      // ozdoba — hrana v grafu je záznam vazby, ne obvinění, a v náhledu
      // odkazu je to jediné místo, kde to je vidět (viz AGENTS.md).
      // Délkový rozpočet se rozdává předem, ne oříznutím celku: popisky hran
      // bývají celé věty (nejdelší přes 130 znaků) a při zkrácení až nakonec
      // zmizí právě ta doložka na konci, kvůli které tam je. Rozpočet musí
      // sedět pod 200 znaků, kde description ořezává base.html — jinak by
      // doložku uřízla ta. Seznam CLM se do popisu nedává schválně: v náhledu
      // odkazu ani ve výsledku vyhledávání identifikátor nikomu nic neřekne
      // a na stránce samotné je stejně vidět.
      const inDossier = dossierTitles.get(slug) ?? slug;
      description = tomlString(
        `${summarize(derived, 90)}. Vztah v grafu dossieru ${summarize(inDossier, 35)}.` +
          " Záznam vazby, nikoli tvrzení o pochybení.",
      );
    }

    put(relPath, {
      topDerived: [
        ["title", title],
        ["description", description],
        ["template", tomlString(templateOf(relPath, DEFAULT_TEMPLATES[r.recordType]))],
        ["weight", String(weight)],
        ["aliases", mergedAliases(relPath, null)],
      ],
      extraDerived: [
        ["generated", "true"],
        ["record_id", tomlString(r["@id"])],
        ["view_model", tomlString(viewPath(`dossiers/${slug}/${w.registry}/${String(r.identifier).toLowerCase()}.json`))],
        ["dossier", tomlString(slug)],
        ["record_type", tomlString(r.recordType)],
        ["lang", tomlString("cs")],
        // Jediné doménové id pole — čte ho base.html (is_record) a
        // entity.html lookupy; všechno ostatní jde z view modelu.
        [idField, tomlString(r.identifier)],
      ],
      body: mdBody(r.content),
    });
  }

  // --- entity ------------------------------------------------------------
  for (const [i, w] of compiled.entities.entries()) {
    const r = w.record;
    const relPath = `entities/${r.entityId}.md`;
    // Entity weight = kanonické `order` (redakční pořadí registru);
    // nová entita bez order dostane pozici v abecedním pořadí.
    put(relPath, {
      topDerived: [
        ["title", tomlString(r.title)],
        ["template", tomlString(templateOf(relPath, DEFAULT_TEMPLATES.entity))],
        ["weight", String(r.order ?? i + 1)],
        ["aliases", mergedAliases(relPath, r.routeAliases)],
        // Kanonický `description` vyhrává; entita bez něj má ale pořád svůj
        // ručně psaný kontextový odstavec („Kontextová entita — … nezakládá
        // žádné tvrzení o pochybení."), a ten je pro popis stránky přesnější
        // než cokoli odvozeného z typu a rolí.
        [
          "description",
          r.description !== undefined
            ? tomlString(r.description)
            : (summarize(mdBody(r.content)) ? tomlString(summarize(mdBody(r.content))) : null),
        ],
      ],
      extraDerived: [
        ["generated", "true"],
        ["record_id", tomlString(r["@id"])],
        ["view_model", tomlString(viewPath(`entities/${r.entityId}.json`))],
        ["record_type", tomlString("entity")],
        ["entity_id", tomlString(r.entityId)],
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

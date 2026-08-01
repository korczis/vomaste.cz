// Shared row-table projection over the COMPILED canonical dataset
// (T-028 fáze G). Historicky tenhle modul byl jediný sdílený front-matter
// parser (extrahovaný z build-data-exports.mjs); od fáze G je to tenká
// KOMPATIBILNÍ projekce nad compiled modelem (scripts/data/compile.mjs)
// — veřejné API i tvar řádků zůstávají beze změny, takže všichni dnešní
// konzumenti (build-data-exports, build-jsonld-exports, validate-schemas,
// verify-jsonld, lint-source-outlets, migrační cross-check) fungují dál,
// ale žádný z nich už neparsuje content/** front matter.
//
// Same contract as before: derived, never authored — every row comes from
// the canonical records the pages render from; no status is computed
// here, no score, no ranking.
//
// Vstupy mimo compiled model (záměrné, ne front matter):
//   data/dossiers.toml       — registr dossierů (lib/dossier-registry.mjs)
//   data/government.toml     — vládní roster: government_* pole entit
//                              (kanonický zdroj, ze kterého
//                              build-government-roster.mjs tato pole do
//                              content/entities генeruje; entita mimo
//                              roster má všechna tři pole null)
//   data/dossiers/*/stats.toml, data/generated/navigation.json —
//                              generovaná data pro enrichDossiersForDirectory
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { loadDossierRegistry } from "./dossier-registry.mjs";
import { getCompiledModel, localIds, localPart, recordsOf } from "./compiled-model.mjs";

// Adresář dossierů potřebuje vedle identity i počty, popis, data poslední
// kontroly a routy jednotlivých registrů. Všechno to už v repozitáři je —
// jen roztroušeně, takže si to dosud každá šablona skládala sama:
//
//   počty  — data/dossiers/<slug>/stats.toml (generuje generate-stats.mjs)
//   popis  — kanonický dossier.json (description/updated/reviewedAt)
//   routy  — data/generated/navigation.json (generuje build-navigation.mjs)
//
// Sesbírá se to sem, aby existoval JEDEN prezentační index a tři projekce
// adresáře (tabulka/seznam/dlaždice) byly opravdu projekcemi týchž dat.
// Routy se ČTOU z navigačního manifestu, neskládají se z řetězců: manifest
// je kanonický a při přejmenování registru se změní na jednom místě.
const num = (b, k) => {
  const m = b.match(new RegExp(`^${k}\\s*=\\s*(\\d+)`, "m"));
  return m ? Number(m[1]) : 0;
};
const str = (b, k) => (b.match(new RegExp(`^${k}\\s*=\\s*"((?:[^"\\\\]|\\\\.)*)"`, "m")) ?? [])[1]?.replace(/\\(.)/g, "$1") ?? null;

export function readDossierStats(root, slug) {
  const file = join(root, "data/dossiers", slug, "stats.toml");
  if (!existsSync(file)) return null;
  const b = readFileSync(file, "utf8");
  return {
    claims: num(b, "claims_total"),
    sources: num(b, "sources_total"),
    cases: num(b, "cases_total"),
    gaps: num(b, "gaps_total"),
    entities: num(b, "entities_total"),
    relations: num(b, "relations_total"),
  };
}

export function readNavigationRoutes(root) {
  const file = join(root, "data/generated/navigation.json");
  if (!existsSync(file)) return new Map();
  const nav = JSON.parse(readFileSync(file, "utf8"));
  const dossiers = (nav.items ?? []).find((i) => i.matchPrefix === "/dossiers/");
  const out = new Map();
  for (const item of dossiers?.children ?? []) {
    const slug = (item.matchPrefix ?? "").split("/").filter(Boolean)[1];
    if (!slug) continue;
    const routes = { dossier: item.matchPrefix };
    for (const child of item.children ?? []) {
      const key = (child.matchPrefix ?? "").split("/").filter(Boolean)[2];
      if (key) routes[key] = child.matchPrefix;
    }
    out.set(slug, { routes, labels: Object.fromEntries((item.children ?? []).map((c) => [(c.matchPrefix ?? "").split("/").filter(Boolean)[2], c.label])) });
  }
  return out;
}

// Vládní roster z data/government.toml — kanonický zdroj government_*
// polí (build-government-roster.mjs z něj generuje content stránky;
// kanonické entity nesou jen snapshotDate). entity_id -> { office,
// party, snapshot }.
function readGovernmentRoster(root) {
  const file = join(root, "data/government.toml");
  if (!existsSync(file)) return new Map();
  const text = readFileSync(file, "utf8");
  const snapshot = str(text.split(/\n\[\[members\]\]/)[0], "snapshot");
  const out = new Map();
  for (const block of text.split(/\n\[\[members\]\]/).slice(1)) {
    const id = str(block, "entity_id");
    if (!id) continue;
    out.set(id, { office: str(block, "office"), party: str(block, "party") ?? "", snapshot });
  }
  return out;
}

export function buildRecordTables(root) {
  const registry = loadDossierRegistry();
  const compiled = getCompiledModel(root);
  const rows = { claims: [], sources: [], cases: [], gaps: [], relations: [], entities: [], dossiers: [] };

  for (const d of registry) {
    rows.dossiers.push({
      slug: d.slug,
      title: d.title,
      dossier_type: d.dossierType,
      subject: d.subject,
      canonical_dossier: d.canonicalDossier,
      url: `/dossiers/${d.slug}/`,
    });
  }

  // Per-record rows of every dossier that canonically owns records —
  // iterated in REGISTRY order (data/dossiers.toml), records in the
  // compiled deterministic order (identifier), which equals the former
  // filename order.
  for (const d of registry) {
    for (const w of recordsOf(compiled, d.slug, "claims")) {
      const r = w.record;
      rows.claims.push({
        clm_id: r.identifier,
        dossier: d.slug,
        status: r.status,
        status_label: r.statusLabel,
        summary: r.text,
        sources: localIds(r.sources),
        source_count: (r.sources ?? []).length,
        subjects: r.subjects ?? [],
        url: w.route,
      });
    }

    for (const w of recordsOf(compiled, d.slug, "sources")) {
      const r = w.record;
      rows.sources.push({
        src_id: r.identifier,
        dossier: d.slug,
        title: r.title,
        outlet: r.outlet,
        src_type: r.sourceType,
        published: r.published ?? null,
        retrieved: r.retrieved,
        claims: localIds(r.claims),
        claim_count: (r.claims ?? []).length,
        subjects: r.subjects ?? [],
        source_url: r.url,
        // Zdrojová rodina: zdroje sdílející jednu pojmenovanou rodinu se
        // počítají jako JEDEN nezávislý zdroj. Prázdná hodnota znamená
        // samostatný zdroj, tedy vlastní rodinu — stejná sémantika jako
        // ve validate-dossier.mjs (familyCount = singletons + namedFamilies).
        // Pochází z kanonického záznamu (sourceFamily), takže smí být
        // v kanonických řádcích.
        family: r.sourceFamily ?? "",
        url: w.route,
      });
    }

    for (const w of recordsOf(compiled, d.slug, "cases")) {
      const r = w.record;
      rows.cases.push({
        case_id: r.identifier,
        dossier: d.slug,
        title: r.title,
        period: r.period,
        status: r.status,
        label: r.statusLabel,
        subjects: r.subjects ?? [],
        url: w.route,
      });
    }

    for (const w of recordsOf(compiled, d.slug, "gaps")) {
      const r = w.record;
      rows.gaps.push({
        gap_id: r.identifier,
        dossier: d.slug,
        title: r.title,
        priority: r.priority,
        checked: r.checked,
        claims: localIds(r.claims),
        subjects: r.subjects ?? [],
        url: w.route,
      });
    }

    for (const w of recordsOf(compiled, d.slug, "relations")) {
      const r = w.record;
      rows.relations.push({
        relation_id: r.identifier,
        dossier: d.slug,
        relation_type: r.relationType,
        source: localPart(r.sourceEntity?.["@id"]),
        target: localPart(r.targetEntity?.["@id"]),
        label: r.label,
        status: r.status,
        claims: localIds(r.claims),
        sources: localIds(r.sources),
        subjects: r.subjects ?? [],
        url: w.route,
      });
    }
  }

  // Global entity registry — compiled.entities jsou seřazené podle
  // entityId, což je i dřívější pořadí souborů.
  const roster = readGovernmentRoster(root);
  for (const w of compiled.entities) {
    const r = w.record;
    const gov = roster.get(r.entityId) ?? null;
    rows.entities.push({
      entity_id: r.entityId,
      title: r.title,
      entity_type: r.entityType,
      role: r.role ?? null,
      dossiers: r.dossiers ?? [],
      // Publication-state fields: what the entity actually IS in this
      // system, so a reader querying the export can tell a context entity
      // apart from an authorized dossier subject without reading prose.
      publication_role: r.publicationRole ?? null,
      dossier_status: r.dossierStatus ?? null,
      coverage_state: r.coverageState ?? null,
      // Government-roster fields (data/government.toml). Null for every
      // entity that isn't a roster member — a public office held on the
      // snapshot date, nothing more. Deliberately NOT emitted as
      // schema.org Person/Role in JSON-LD: Person markup is restricted to
      // authorized entity-dossier main pages (verify-jsonld.mjs), and
      // holding an office is not dossier coverage.
      government_office: gov?.office ?? null,
      government_party: gov?.party ?? null,
      government_snapshot: gov?.snapshot ?? null,
      url: w.route,
    });
  }

  return rows;
}

// Obohacení pro ADRESÁŘ, volané až při zápisu exportu — ne při stavbě
// kanonických řádků.
//
// Důvod je konkrétní: `data/dossiers/*/stats.toml` i `data/generated/` jsou
// gitignorované, takže v čerstvém checkoutu neexistují. Kdyby obohacení
// viselo v kanonických řádcích, `validate:schemas` (běží v `npm test`, tedy
// PŘED generátory) by dostal counts: null a spadl — přesně to shodilo CI.
//
// Rozdělení podle toho, co která vrstva zaručuje: kanonické řádky nesou
// identitu, která existuje vždy; prezentační index nese odvozené hodnoty,
// které existují až po generátorech. Kontroluje ho validate-directory-index.mjs.
export function enrichDossiersForDirectory(root, dossierRows) {
  const compiled = getCompiledModel(root);
  const dossierBySlug = new Map(
    compiled.records.filter((w) => w.registry === "dossier").map((w) => [w.dossier, w.record]),
  );
  const navRoutes = readNavigationRoutes(root);
  // Abecedně podle zobrazovaného názvu, s českým řazením — tedy Č za C,
  // Ř za R a tak dál. Řadí se TADY, ne až v prohlížeči: vykreslené HTML
  // pak má správné pořadí i bez JavaScriptu a čtenář nezačíná u toho,
  // kdo je náhodou první v registru.
  const collator = new Intl.Collator("cs", { sensitivity: "base" });
  const sorted = [...dossierRows].sort((a, b) => collator.compare(a.title, b.title));
  return sorted.map((d) => {
    const record = dossierBySlug.get(d.slug) ?? null;
    const nav = navRoutes.get(d.slug) ?? { routes: {}, labels: {} };
    return {
      ...d,
      description: record?.description ?? "",
      // `updated` entity view (petr-macinka, filip-turek) dědí z
      // kanonického dossieru (migrace, rozhodnutí #4) — dřívější front
      // matter hodnotu nemělo, takže tyhle dva řádky nesly "".
      updated: record?.updated ?? "",
      // `reviewedAt` se naopak NEdědí — entity view bez vlastní kontroly
      // nese "" stejně jako dřív.
      reviewed_at: record?.reviewedAt ?? "",
      counts: readDossierStats(root, d.slug) ?? {
        claims: 0, sources: 0, cases: 0, gaps: 0, entities: 0, relations: 0,
      },
      routes: Object.keys(nav.routes).length ? nav.routes : { dossier: d.url },
      route_labels: nav.labels,
    };
  });
}

// Shared front-matter → row-table projection, extracted from
// build-data-exports.mjs so that the flat /data/*.json exports and the
// JSON-LD exports (build-jsonld-exports.mjs) are built from ONE parser
// instead of two drifting copies. Same contract as before: derived,
// never authored — every row comes from the same front matter the pages
// render from; no status is computed here, no score, no ranking.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { loadDossierRegistry } from "./dossier-registry.mjs";

const fm = (text) => (text.match(/^\+\+\+\r?\n([\s\S]*?)\r?\n\+\+\+/) ?? [])[1] ?? "";
const str = (b, k) => (b.match(new RegExp(`^${k}\\s*=\\s*"((?:[^"\\\\]|\\\\.)*)"`, "m")) ?? [])[1]?.replace(/\\(.)/g, "$1") ?? null;
const arr = (b, k) => {
  const m = b.match(new RegExp(`^${k}\\s*=\\s*\\[([^\\]]*)\\]`, "m"));
  return m ? [...m[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => x[1]) : [];
};

// Adresář dossierů potřebuje vedle identity i počty, popis, data poslední
// kontroly a routy jednotlivých registrů. Všechno to už v repozitáři je —
// jen roztroušeně, takže si to dosud každá šablona skládala sama:
//
//   počty  — data/dossiers/<slug>/stats.toml (generuje generate-stats.mjs)
//   popis  — front matter content/dossiers/<slug>/_index.md
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

export function buildRecordTables(root) {
  const registry = loadDossierRegistry();
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

  // Per-record pages of every dossier that physically owns records.
  for (const d of registry) {
    const base = join(root, "content/dossiers", d.slug);
    const read = (sub) => {
      const dir = join(base, sub);
      if (!existsSync(dir)) return [];
      return readdirSync(dir)
        .filter((f) => f.endsWith(".md") && f !== "_index.md")
        .map((f) => ({ slug: f.replace(/\.md$/, ""), block: fm(readFileSync(join(dir, f), "utf8")) }));
    };

    for (const { slug, block } of read("claims")) {
      const id = str(block, "clm_id");
      if (!id) continue;
      rows.claims.push({
        clm_id: id,
        dossier: d.slug,
        status: str(block, "status"),
        status_label: str(block, "status_label"),
        summary: str(block, "summary"),
        sources: arr(block, "sources"),
        source_count: arr(block, "sources").length,
        subjects: arr(block, "subjects"),
        url: `/dossiers/${d.slug}/claims/${slug}/`,
      });
    }

    for (const { slug, block } of read("sources")) {
      const id = str(block, "src_id");
      if (!id) continue;
      rows.sources.push({
        src_id: id,
        dossier: d.slug,
        title: str(block, "title"),
        outlet: str(block, "outlet"),
        src_type: str(block, "src_type"),
        published: str(block, "published"),
        retrieved: str(block, "retrieved"),
        claims: arr(block, "claims"),
        claim_count: arr(block, "claims").length,
        subjects: arr(block, "subjects"),
        source_url: str(block, "url"),
        // Zdrojová rodina: zdroje sdílející jednu pojmenovanou rodinu se
        // počítají jako JEDEN nezávislý zdroj. Prázdná hodnota znamená
        // samostatný zdroj, tedy vlastní rodinu — stejná sémantika jako
        // ve validate-dossier.mjs (familyCount = singletons + namedFamilies).
        // Pochází z front matter, které je verzované, takže smí být
        // v kanonických řádcích.
        family: str(block, "family") ?? "",
        url: `/dossiers/${d.slug}/sources/${slug}/`,
      });
    }

    for (const { slug, block } of read("cases")) {
      const id = str(block, "case_id");
      if (!id) continue;
      rows.cases.push({
        case_id: id,
        dossier: d.slug,
        title: str(block, "title"),
        period: str(block, "period"),
        status: str(block, "status"),
        label: str(block, "label"),
        subjects: arr(block, "subjects"),
        url: `/dossiers/${d.slug}/cases/${slug}/`,
      });
    }

    for (const { slug, block } of read("gaps")) {
      const id = str(block, "gap_id");
      if (!id) continue;
      rows.gaps.push({
        gap_id: id,
        dossier: d.slug,
        title: str(block, "title"),
        priority: str(block, "priority"),
        checked: str(block, "checked"),
        claims: arr(block, "claims"),
        subjects: arr(block, "subjects"),
        url: `/dossiers/${d.slug}/gaps/${slug}/`,
      });
    }

    for (const { slug, block } of read("relations")) {
      rows.relations.push({
        relation_id: slug,
        dossier: d.slug,
        relation_type: str(block, "relation_type"),
        source: str(block, "source"),
        target: str(block, "target"),
        label: str(block, "label"),
        status: str(block, "status"),
        claims: arr(block, "claims"),
        sources: arr(block, "sources"),
        subjects: arr(block, "subjects"),
        url: `/dossiers/${d.slug}/relations/${slug}/`,
      });
    }
  }

  // Global entity registry.
  const entDir = join(root, "content/entities");
  if (existsSync(entDir)) {
    for (const f of readdirSync(entDir).filter((f) => f.endsWith(".md") && f !== "_index.md")) {
      const block = fm(readFileSync(join(entDir, f), "utf8"));
      rows.entities.push({
        entity_id: str(block, "entity_id") ?? f.replace(/\.md$/, ""),
        title: str(block, "title"),
        entity_type: str(block, "entity_type"),
        role: str(block, "role"),
        dossiers: arr(block, "dossiers"),
        // Publication-state fields: what the entity actually IS in this
        // system, so a reader querying the export can tell a context entity
        // apart from an authorized dossier subject without reading prose.
        publication_role: str(block, "publication_role"),
        dossier_status: str(block, "dossier_status"),
        coverage_state: str(block, "coverage_state"),
        // Government-roster fields (data/government.toml via
        // build-government-roster.mjs). Null for every entity that isn't a
        // roster member — a public office held on the snapshot date, nothing
        // more. Deliberately NOT emitted as schema.org Person/Role in
        // JSON-LD: Person markup is restricted to authorized entity-dossier
        // main pages (verify-jsonld.mjs), and holding an office is not
        // dossier coverage.
        government_office: str(block, "government_office"),
        government_party: str(block, "government_party"),
        government_snapshot: str(block, "government_snapshot"),
        url: `/entities/${f.replace(/\.md$/, "")}/`,
      });
    }
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
  const navRoutes = readNavigationRoutes(root);
  // Abecedně podle zobrazovaného názvu, s českým řazením — tedy Č za C,
  // Ř za R a tak dál. Řadí se TADY, ne až v prohlížeči: vykreslené HTML
  // pak má správné pořadí i bez JavaScriptu a čtenář nezačíná u toho,
  // kdo je náhodou první v registru.
  const collator = new Intl.Collator("cs", { sensitivity: "base" });
  const sorted = [...dossierRows].sort((a, b) => collator.compare(a.title, b.title));
  return sorted.map((d) => {
    const indexFile = join(root, "content/dossiers", d.slug, "_index.md");
    const block = existsSync(indexFile) ? fm(readFileSync(indexFile, "utf8")) : "";
    const nav = navRoutes.get(d.slug) ?? { routes: {}, labels: {} };
    return {
      ...d,
      description: str(block, "description") ?? "",
      updated: str(block, "updated") ?? "",
      reviewed_at: str(block, "reviewed_at") ?? "",
      counts: readDossierStats(root, d.slug) ?? {
        claims: 0, sources: 0, cases: 0, gaps: 0, entities: 0, relations: 0,
      },
      routes: Object.keys(nav.routes).length ? nav.routes : { dossier: d.url },
      route_labels: nav.labels,
    };
  });
}

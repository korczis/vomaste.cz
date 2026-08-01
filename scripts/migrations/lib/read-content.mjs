// Čtecí vrstva migrátoru fáze D (T-028): parametrizované čtení dnešních
// zdrojů pravdy (content/**, data/dossiers.toml, data/authorizations.toml,
// data/dossiers/*/updates.toml) BEZ jakéhokoli zápisu.
//
// Proč tu jsou vlastní regexy, když existuje
// scripts/dossier/lib/record-tables.mjs: record-tables je (1) uzamčený na
// kořen repozitáře přes loadDossierRegistry() s modulovou cache, takže
// nejde nasměrovat na syntetický fixture strom v testech, a (2) jeho
// primitiva fm/str/arr jsou modulově privátní — a scripts/dossier/** je
// do fáze H zmrazený, nesmí se měnit. Regexy níže jsou proto PŘESNÉ kopie
// těch z record-tables.mjs (stejná sémantika escapování i vyhledávání
// v celém front matter bloku) a migrátor navíc při běhu nad reálným
// repozitářem výstup KŘÍŽOVĚ OVĚŘUJE proti buildRecordTables() — dnešní
// parser zůstává závaznou autoritou, tahle kopie se od něj nesmí odchýlit
// (rozdíl = tvrdá chyba migrace).
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

// --- primitiva (1:1 s record-tables.mjs / dossier-registry.mjs) ---------
export const frontMatter = (text) => (text.match(/^\+\+\+\r?\n([\s\S]*?)\r?\n\+\+\+/) ?? [])[1] ?? "";
export const str = (b, k) =>
  (b.match(new RegExp(`^${k}\\s*=\\s*"((?:[^"\\\\]|\\\\.)*)"`, "m")) ?? [])[1]?.replace(/\\(.)/g, "$1") ?? null;
export const arr = (b, k) => {
  const m = b.match(new RegExp(`^${k}\\s*=\\s*\\[([^\\]]*)\\]`, "m"));
  return m ? [...m[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => x[1].replace(/\\(.)/g, "$1")) : null;
};
export const num = (b, k) => {
  const m = b.match(new RegExp(`^${k}\\s*=\\s*(\\d+)`, "m"));
  return m ? Number(m[1]) : null;
};
export const bool = (b, k) => {
  const m = b.match(new RegExp(`^${k}\\s*=\\s*(true|false)`, "m"));
  return m ? m[1] === "true" : null;
};
export const hasKey = (b, k) => new RegExp(`^${k}\\s*=`, "m").test(b);

// Tělo stránky za front matter blokem, trimnuté (pravidlo mise: celé
// Markdown tělo beze změny významu, žádná segmentace).
export function pageBody(text) {
  const m = text.match(/^\+\+\+\r?\n[\s\S]*?\r?\n\+\+\+\r?\n?/);
  return (m ? text.slice(m[0].length) : text).trim();
}

// Rozdělení front matter na sekce podle TOML hlaviček — potřebné pro
// _index.md, kde stejné klíče žijí v [extra], [extra.authorization]
// i v opakovaných [[extra.cases]]/[[extra.timeline] ] blocích.
export function sections(block) {
  const out = [];
  const re = /^\[(\[?)([^\]]+)\]?\]\s*$/gm;
  let last = { header: null, start: 0 };
  const push = (end) => out.push({ header: last.header, body: block.slice(last.start, end) });
  let m;
  while ((m = re.exec(block))) {
    push(m.index);
    last = { header: m[2], start: m.index + m[0].length };
  }
  push(block.length);
  return out;
}

export const sectionBody = (secs, header) => secs.find((s) => s.header === header)?.body ?? "";
export const sectionBodies = (secs, header) => secs.filter((s) => s.header === header).map((s) => s.body);

// --- registry a autorizace ----------------------------------------------
// Stejný tvar záznamu jako scripts/dossier/lib/dossier-registry.mjs, ale
// parametrizovaný kořenem (viz hlavička souboru).
export function readDossierRegistry(root) {
  const text = readFileSync(join(root, "data/dossiers.toml"), "utf8");
  const records = [];
  for (const m of text.matchAll(/\[\[dossiers\]\]\n([\s\S]*?)(?=\n\[\[|\n*$)/g)) {
    const block = m[1];
    records.push({
      slug: str(block, "slug"),
      title: str(block, "title"),
      dossierType: str(block, "dossier_type"),
      subject: str(block, "subject"),
      canonicalDossier: str(block, "canonical_dossier"),
      sourceDossiers: arr(block, "source_dossiers") ?? [],
      showInPrimaryNavigation: bool(block, "show_in_primary_navigation"),
    });
  }
  return records;
}

// data/authorizations.toml → [{ id, subjects }] (fallback pro dossiery
// bez [extra.authorization] v _index.md — reálně dnes žádný, ale zadání
// fáze D fallback vyžaduje).
export function readAuthorizations(root) {
  const text = readFileSync(join(root, "data/authorizations.toml"), "utf8");
  const records = [];
  for (const m of text.matchAll(/\[\[authorizations\]\]\n([\s\S]*?)(?=\n\[\[|\n*$)/g)) {
    records.push({ id: str(m[1], "id"), subjects: arr(m[1], "subjects") ?? [] });
  }
  return records;
}

// data/dossiers/<slug>/updates.toml → [{ identifier, date, summary,
// addedClaims?, … }] (klíč přítomný v TOML ⇒ přítomný ve výstupu, včetně
// prázdného pole — migrace je 1:1, nic se nedomýšlí).
//
// identifier: datum; druhý a další zápis TÉHOŽ dne dostává deterministický
// pořadový sufix (2026-07-30, 2026-07-30-2, …) podle pořadí v append-only
// TOML — realita 11 z 20 updates.toml, viz $comment updateIdentifier
// v schemas/canonical/_defs.schema.json.
export function readUpdatesToml(root, slug) {
  const file = join(root, "data/dossiers", slug, "updates.toml");
  if (!existsSync(file)) return [];
  const text = readFileSync(file, "utf8");
  const out = [];
  const perDate = new Map();
  for (const m of text.matchAll(/\[\[updates\]\]\n([\s\S]*?)(?=\n\[\[|\n*$)/g)) {
    const b = m[1];
    const date = str(b, "date");
    const seq = (perDate.get(date) ?? 0) + 1;
    perDate.set(date, seq);
    const entry = { identifier: seq === 1 ? date : `${date}-${seq}`, date, summary: str(b, "summary") };
    for (const [toml, key] of [
      ["added_claims", "addedClaims"],
      ["updated_claims", "updatedClaims"],
      ["added_gaps", "addedGaps"],
      ["closed_gaps", "closedGaps"],
      ["reviewed_sources", "reviewedSources"],
    ]) {
      const v = arr(b, toml);
      if (v !== null) entry[key] = v;
    }
    out.push(entry);
  }
  return out;
}

// --- stránky záznamů ----------------------------------------------------
// Čte všechny ne-_index Markdown soubory adresáře; vrací { fileSlug,
// relPath, block, body } seřazené podle názvu souboru (determinismus).
export function readRecordPages(root, ...segments) {
  const dir = join(root, ...segments);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "_index.md")
    .sort()
    .map((f) => {
      const text = readFileSync(join(dir, f), "utf8");
      return {
        fileSlug: f.replace(/\.md$/, ""),
        relPath: [...segments, f].join("/"),
        block: frontMatter(text),
        body: pageBody(text),
      };
    });
}

export function readIndexPage(root, slug) {
  const file = join(root, "content/dossiers", slug, "_index.md");
  if (!existsSync(file)) return null;
  const text = readFileSync(file, "utf8");
  const block = frontMatter(text);
  return { relPath: `content/dossiers/${slug}/_index.md`, block, secs: sections(block), body: pageBody(text) };
}

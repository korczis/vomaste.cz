#!/usr/bin/env node
/*
 * Katalog zdrojů — kde pátrat a co který zdroj doopravdy dokládá.
 *
 * PROČ EXISTUJE
 * -------------
 * Rešerše se opakovaně zdržovala na tomtéž: který registr vůbec odpoví,
 * co z jeho odpovědi lze citovat, a kde jsou pasti, na které už někdo
 * jednou najel. Ta znalost žila v hlavách a v commit zprávách, takže se
 * platila znovu při každém dossieru. Katalog ji drží na jednom místě,
 * strojově čitelně, a web ji publikuje — pro člověka i pro agenta.
 *
 * DVA ZDROJE VSTUPU, ZÁMĚRNĚ ODDĚLENÉ
 * -----------------------------------
 *   data/source-catalog/*.json — ručně psané záznamy o registrech,
 *     nástrojích a agregátorech. Nesou `proves` / `doesNotProve` /
 *     `traps`, tedy to, co se nedá odvodit z dat a co musí někdo vědět.
 *   data/dossiers/(*)/sources/*.json — SKUTEČNĚ použité zdroje. Odtud se
 *     dopočítá, které outlety a rodiny už v datasetu figurují a kolikrát.
 *     Tenhle díl se nikdy nepíše ručně, aby seznam „co bylo kdy použito"
 *     nemohl zastarat proti datům.
 *
 * CO GENERUJE
 * -----------
 *   data/generated/source-catalog.json — view model pro UI i JSON-LD.
 *   content/zdroje/_index.md + content/zdroje/<slug>.md — stránka pro
 *     každý zdroj, ať je na co odkazovat a co indexovat.
 *   docs/osint/SOURCE_CATALOG.md — tatáž věc pro agenty a pro čtení
 *     v repozitáři, bez nutnosti stavět web.
 *
 * CACHOVÁNÍ
 * ---------
 * Zápis je idempotentní: soubor se přepíše jen tehdy, když se jeho obsah
 * liší. Zola i git tak vidí změnu jen u toho, co se opravdu změnilo, a
 * `npm run build` neinvaliduje celý strom kvůli přegenerování.
 *
 * Použití: node scripts/dossier/build-source-catalog.mjs [--check]
 *   --check  nic nezapíše, jen skončí nenulově, pokud by zápis něco změnil
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CATALOG_DIR = join(ROOT, "data/source-catalog");
const DOSSIERS_DIR = join(ROOT, "data/dossiers");
const OUT_VIEW = join(ROOT, "data/generated/source-catalog.json");
const OUT_CONTENT = join(ROOT, "content/zdroje");
const OUT_DOC = join(ROOT, "docs/osint/SOURCE_CATALOG.md");

const CHECK = process.argv.includes("--check");
const GENERATED_NOTE =
  "GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/source-catalog/** + data/dossiers/**/sources/** — regeneruje `npm run build:source-catalog`.";

const changed = [];

function writeIfChanged(path, text) {
  const next = Buffer.from(text, "utf8");
  if (existsSync(path) && readFileSync(path).equals(next)) return false;
  changed.push(path.slice(ROOT.length + 1));
  if (!CHECK) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, next);
  }
  return true;
}

const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));
const listJson = (dir) =>
  existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".json")).sort() : [];

/* ---- 1) ručně psané záznamy ------------------------------------------ */

const entries = listJson(CATALOG_DIR)
  .map((f) => readJson(join(CATALOG_DIR, f)))
  .sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.identifier.localeCompare(b.identifier));

if (entries.length === 0) throw new Error("data/source-catalog/ je prázdný — katalog by byl lež.");

/* ---- 2) skutečně použité zdroje z datasetu --------------------------- */

// Rodina říká, že dva zdroje nejsou dvě nezávislá doložení, ale jedno
// převzetí téže zprávy. Bez rodiny se zdroj počítá sám za sebe přes outlet
// — stejná sémantika, jakou používá validátor S1/S2/S4.
const usage = new Map();

for (const slug of existsSync(DOSSIERS_DIR) ? readdirSync(DOSSIERS_DIR).sort() : []) {
  const dir = join(DOSSIERS_DIR, slug, "sources");
  for (const file of listJson(dir)) {
    let src;
    try {
      src = readJson(join(dir, file));
    } catch {
      continue; // rozbitý záznam řeší data:validate, ne tenhle generátor
    }
    const family = src.sourceFamily || null;
    const outlet = src.outlet || null;
    if (!family && !outlet) continue;
    const key = family || `outlet:${outlet}`;
    const row = usage.get(key) || {
      key,
      family,
      outlet,
      count: 0,
      dossiers: new Set(),
      sourceTypes: new Set(),
    };
    row.count += 1;
    row.dossiers.add(slug);
    if (src.sourceType) row.sourceTypes.add(src.sourceType);
    if (!row.outlet && outlet) row.outlet = outlet;
    usage.set(key, row);
  }
}

const used = [...usage.values()]
  .map((r) => ({
    key: r.key,
    family: r.family,
    outlet: r.outlet,
    count: r.count,
    dossierCount: r.dossiers.size,
    sourceTypes: [...r.sourceTypes].sort(),
    // Propojení na ručně psaný záznam, existuje-li: katalog tak ukazuje,
    // které skutečně použité zdroje už mají popsané meze a které ne.
    catalogEntry: entries.find((e) => e.identifier === r.family)?.identifier ?? null,
  }))
  .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));

const undocumented = used.filter((u) => !u.catalogEntry && u.count >= 5);

/* ---- 3) view model ---------------------------------------------------- */

const view = {
  generated: true,
  note: GENERATED_NOTE,
  counts: {
    entries: entries.length,
    usedFamiliesOrOutlets: used.length,
    sourceRecords: used.reduce((n, u) => n + u.count, 0),
    undocumentedAboveThreshold: undocumented.length,
  },
  entries: entries.map((e) => ({
    identifier: e.identifier,
    "@id": e["@id"],
    title: e.title,
    operator: e.operator ?? null,
    kind: e.kind,
    jurisdiction: e.jurisdiction ?? null,
    access: e.access,
    authentication: e.authentication ?? null,
    url: e.url,
    apiUrl: e.apiUrl ?? null,
    proves: e.proves ?? [],
    doesNotProve: e.doesNotProve ?? [],
    traps: e.traps ?? [],
    subRegisters: e.subRegisters ?? [],
    howToSearch: e.howToSearch ?? null,
    route: `/zdroje/${e.identifier}/`,
    usage: used.find((u) => u.catalogEntry === e.identifier) ?? null,
  })),
  used,
};

writeIfChanged(OUT_VIEW, JSON.stringify(view, null, 2) + "\n");

/* ---- 4) stránky ------------------------------------------------------- */

const toml = (s) => `"${String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
const bullets = (xs) => xs.map((x) => `- ${x}`).join("\n");

const KIND_LABEL = {
  "primary-registry": "primární registr",
  "primary-document": "primární listina",
  aggregator: "agregátor",
  media: "média",
  tool: "nástroj",
};

const ACCESS_LABEL = {
  open: "veřejně dostupný",
  restricted: "omezený přístup",
  paid: "placený",
};

for (const e of entries) {
  const body = [
    `+++`,
    `# ${GENERATED_NOTE}`,
    `title = ${toml(e.title)}`,
    `template = "source-catalog-entry.html"`,
    `weight = ${e.order ?? 999}`,
    `description = ${toml(
      `${e.title} — co dokládá, co nedokládá a jak v něm hledat. ${
        KIND_LABEL[e.kind] ?? e.kind
      }, ${ACCESS_LABEL[e.access] ?? e.access}.`,
    )}`,
    ``,
    `[extra]`,
    `generated = true`,
    `lang = "cs"`,
    `seo_type = "WebPage"`,
    `record_type = "sourceCatalogEntry"`,
    `record_id = ${toml(e["@id"])}`,
    `catalog_entry = ${toml(e.identifier)}`,
    `view_model = "generated/source-catalog.json"`,
    `+++`,
    ``,
    ...(e.content ?? []).map((b) => b.value),
    ``,
    `## Co dokládá {#doklada}`,
    ``,
    bullets(e.proves ?? []),
    ``,
    `## Co nedokládá {#nedoklada}`,
    ``,
    bullets(e.doesNotProve ?? []),
    ``,
    ...(e.traps?.length
      ? [
          `## Pasti {#pasti}`,
          ``,
          ...e.traps.flatMap((t) => [`### ${t.title}`, ``, t.detail, ``]),
        ]
      : []),
    ...(e.howToSearch ? [`## Jak v něm hledat {#jak-hledat}`, ``, e.howToSearch, ``] : []),
  ].join("\n");

  writeIfChanged(join(OUT_CONTENT, `${e.identifier}.md`), body.replace(/\n{3,}/g, "\n\n") + "\n");
}

writeIfChanged(
  join(OUT_CONTENT, "_index.md"),
  [
    `+++`,
    `# ${GENERATED_NOTE}`,
    `title = "Zdroje"`,
    `template = "source-catalog-index.html"`,
    `sort_by = "weight"`,
    `weight = 60`,
    `description = "Katalog zdrojů: kde pátrat, co který registr dokládá, co nedokládá a na jaké pasti se v něm najíždí."`,
    ``,
    `[extra]`,
    `generated = true`,
    `lang = "cs"`,
    `seo_type = "CollectionPage"`,
    `record_type = "sourceCatalogIndex"`,
    `view_model = "generated/source-catalog.json"`,
    `+++`,
    ``,
    `Tenhle katalog odpovídá na otázku, kterou si rešerše klade jako první: **kam se vůbec podívat a čemu z toho se dá věřit**.`,
    ``,
    `Každý záznam odděluje, co zdroj dokládá, od toho, co nedokládá, a pojmenovává pasti, na které se v něm už najelo. Seznam skutečně použitých zdrojů se dopočítává z datasetu, takže nemůže zastarat proti tomu, co dossiery opravdu citují.`,
    ``,
  ].join("\n"),
);

/* ---- 5) markdown pro agenty ------------------------------------------ */

const doc = [
  `<!-- ${GENERATED_NOTE} -->`,
  ``,
  `# Katalog zdrojů — kde pátrat`,
  ``,
  `Odpovídá na otázku „kam se podívat a čemu z toho věřit". Publikovaná podoba: [/zdroje/](https://vomaste.cz/zdroje/).`,
  ``,
  `**Pravidlo, které z katalogu plyne**: doklad je vždy primární registr. Agregátor je rozcestník — ukáže, kde hledat, ale cituje se ten registr, na který ukazuje.`,
  ``,
  `## Registry a nástroje`,
  ``,
  `| Zdroj | Typ | Přístup | Kde |`,
  `|---|---|---|---|`,
  ...entries.map(
    (e) =>
      `| [${e.title}](/zdroje/${e.identifier}/) | ${KIND_LABEL[e.kind] ?? e.kind} | ${
        ACCESS_LABEL[e.access] ?? e.access
      } | ${e.url} |`,
  ),
  ``,
  `## Pasti, na které se už najelo`,
  ``,
  ...entries.flatMap((e) =>
    (e.traps ?? []).map((t) => `- **${e.title} — ${t.title}**: ${t.detail}`),
  ),
  ``,
  `## Skutečně použité zdroje v datasetu`,
  ``,
  `Dopočítáno z \`data/dossiers/**/sources/**\`, ${view.counts.sourceRecords} záznamů v ${view.counts.usedFamiliesOrOutlets} rodinách/outletech.`,
  ``,
  `| Rodina / outlet | Záznamů | Dossierů | Popsaný v katalogu |`,
  `|---|---:|---:|---|`,
  ...used.map(
    (u) =>
      `| ${u.family ?? u.outlet} | ${u.count} | ${u.dossierCount} | ${
        u.catalogEntry ? `[ano](/zdroje/${u.catalogEntry}/)` : "—"
      } |`,
  ),
  ``,
  ...(undocumented.length
    ? [
        `## Chybí popis`,
        ``,
        `Tyhle zdroje dataset používá aspoň pětkrát, ale katalog k nim nemá záznam s mezemi a pastmi:`,
        ``,
        ...undocumented.map((u) => `- ${u.family ?? u.outlet} (${u.count}×)`),
        ``,
      ]
    : []),
].join("\n");

writeIfChanged(OUT_DOC, doc + "\n");

/* ---- 6) hlášení ------------------------------------------------------- */

if (CHECK && changed.length) {
  console.error("Katalog zdrojů není aktuální. Rozdíly by vznikly v:");
  for (const p of changed) console.error(`  ${p}`);
  console.error("Spusť: npm run build:source-catalog");
  process.exit(1);
}

console.log(
  `Katalog zdrojů: ${entries.length} záznamů, ${view.counts.usedFamiliesOrOutlets} použitých rodin/outletů, ` +
    `${view.counts.sourceRecords} zdrojových záznamů v datasetu.`,
);
if (undocumented.length) {
  console.log(`  bez popsaných mezí (≥5 použití): ${undocumented.map((u) => u.family ?? u.outlet).join(", ")}`);
}
console.log(changed.length ? `  zapsáno: ${changed.length} souborů` : "  beze změny");

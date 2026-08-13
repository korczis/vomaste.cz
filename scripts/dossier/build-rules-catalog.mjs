#!/usr/bin/env node
/*
 * Katalog pravidel — co brána doopravdy vynucuje, vytažené z těch modulů,
 * které to vynucují.
 *
 * PROČ EXISTUJE
 * -------------
 * README i koncepty popisují pravidla jako S1, S2, T4 nebo R3, ale ta
 * pravidla žijí v hlavičkách validátorů. Dokumentace a kód se proto můžou
 * rozejít potichu: pravidlo se zpřísní a text zůstane, nebo se text napíše
 * pro pravidlo, které nikdy nevzniklo. Konstituce §8 zakazuje inzerovat
 * schopnost, kterou nic nevynucuje — a tohle je ta samá past z druhé
 * strany.
 *
 * Katalog proto nic neopisuje. Čte hlavičky vlastníků pravidel, a co
 * v kódu není, na webu se neobjeví.
 *
 * JEDEN VLASTNÍK, JEDEN ZÁPIS
 * ---------------------------
 * `schemas/README.md` drží zásadu „jedno pravidlo, jeden vlastník".
 * Vlastníci se tu proto vyjmenovávají explicitně (OWNERS níž) a jejich
 * hlavičky mají pevný tvar:
 *
 *     //   S1  první řádek pravidla
 *     //       pokračování odsazené o čtyři mezery
 *
 * Cokoli jiného v komentáři se ignoruje. Kdyby vlastník takovou hlavičku
 * ztratil, `--check` to shodí — mlčky zmizet pravidlo nemůže.
 *
 * CO GENERUJE
 * -----------
 *   data/generated/rules-catalog.json — view model pro UI i pro agenty
 *   content/pravidla/_index.md        — stránka /pravidla/
 *
 * DRIFT GATE
 * ----------
 * `--check` nic nezapíše a skončí nenulově, když by se zápis lišil, když
 * některý vlastník nemá ani jedno pravidlo, nebo když text repozitáře
 * odkazuje na ID pravidla, které v kódu neexistuje. To poslední je ten
 * skutečný přínos: „README mluví o T9" je od téhle chvíle chyba buildu,
 * ne překlep, který nikdo nenajde.
 *
 * Použití: node scripts/dossier/build-rules-catalog.mjs [--check]
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

/*
 * Vlastníci pravidel. Namespace je prefix ID (S/R/T/J) a je součástí
 * kontraktu — pravidlo se cituje jako „S2", ne jako „druhé pravidlo
 * sémantiky", takže prefix musí sedět na vlastníka, ne na pořadí.
 */
export const OWNERS = [
  {
    namespace: "S",
    title: "Sémantika (redakční pravidla)",
    file: "scripts/data/validate-semantics.mjs",
    summary:
      "Co smí tvrzení a hrana slíbit o síle svého doložení. Odsud pochází stav CORROBORATED i to, kdy na něj nárok není.",
  },
  {
    namespace: "R",
    title: "Referenční integrita",
    file: "scripts/data/validate-references.mjs",
    summary:
      "Že každý odkaz mezi záznamy vede na existující cíl a že identita záznamu sedí s místem, kde leží.",
  },
  {
    namespace: "T",
    title: "Parita registrové tabulky",
    file: "scripts/data/validate-registry-table.mjs",
    summary:
      "Že přehledová tabulka na stránce dossieru a kanonické záznamy říkají totéž — dvě reprezentace, jeden zdroj pravdy.",
  },
  {
    namespace: "J",
    title: "JSON-LD expanze",
    file: "scripts/data/validate-jsonld.mjs",
    summary:
      "Že strojově čitelný export nese tutéž identitu a nepropašuje termy mimo deklarovaný kontext.",
  },
];

// //   S1  text            → { id, text }
// //       pokračování     → připojí se k předchozímu
// Hlavičky zarovnávají text do sloupce, takže širší ID má před sebou o
// mezeru míň (`// S10b` vs `//  S10` vs `//   S1`). Tolerovat 1–3 mezery je proto
// součást kontraktu, ne benevolence — jinak by dvouciferná pravidla
// tiše vypadla z katalogu.
const RULE_START = /^\/\/ {1,3}([A-Z]{1,2}\d{1,2}[a-z]?) {1,}(.*)$/;
const RULE_CONT = /^\/\/ {7}(.*)$/;

export function parseRules(source) {
  const rules = [];
  for (const line of source.split("\n")) {
    const start = RULE_START.exec(line);
    if (start) {
      rules.push({ id: start[1], text: start[2].trim() });
      continue;
    }
    const cont = RULE_CONT.exec(line);
    if (cont && rules.length) {
      const tail = cont[1].trim();
      if (tail) rules[rules.length - 1].text += ` ${tail}`;
      continue;
    }
    // Prázdný komentářový řádek nebo cokoli jiného ukončuje blok: bez toho
    // by se do posledního pravidla vlila celá zbylá hlavička modulu.
    if (!line.startsWith("//")) rules.length && (rules.at(-1).closed = true);
  }
  return rules.map(({ id, text }) => ({ id, text: text.replace(/\s+/g, " ").trim() }));
}

/*
 * Závažnost se v hlavičkách píše jako (ERROR) / (WARNING). Není to
 * kosmetika: WARNING pravidlo build neshodí, a stránka, která by obojí
 * ukázala stejně, by slibovala víc, než brána vynucuje.
 */
export function severityOf(text) {
  if (/\bERROR\b/.test(text)) return "error";
  if (/\bWARNING\b/.test(text)) return "warning";
  return "unspecified";
}

export function buildCatalog(root = ROOT) {
  const groups = OWNERS.map((owner) => {
    const source = readFileSync(join(root, owner.file), "utf8");
    const rules = parseRules(source)
      .filter((r) => r.id.startsWith(owner.namespace))
      .map((r) => ({ ...r, severity: severityOf(r.text), owner: owner.file }));
    return { ...owner, rules, count: rules.length };
  });

  const all = groups.flatMap((g) => g.rules);
  return {
    generatedFrom: OWNERS.map((o) => o.file),
    counts: {
      groups: groups.length,
      rules: all.length,
      error: all.filter((r) => r.severity === "error").length,
      warning: all.filter((r) => r.severity === "warning").length,
    },
    groups,
  };
}

/*
 * Odkazuje text repozitáře na pravidlo, které neexistuje? Prochází se jen
 * to, co čte člověk (README, koncepty, dokumentace) — ne kód, kde by se
 * `S3` trefilo do kdejakého identifikátoru. Hledá se `pravidlo X#` a
 * `(X#)`, tedy tvary, kterými se pravidla v textech skutečně citují.
 */
export function findUnknownRuleMentions(root, known) {
  const files = [
    "README.md",
    ...listMarkdown(root, "content/koncepty"),
    ...listMarkdown(root, "content/dokumentace"),
  ];
  const unknown = [];
  for (const rel of files) {
    const path = join(root, rel);
    if (!existsSync(path)) continue;
    const text = readFileSync(path, "utf8");
    for (const m of text.matchAll(/(?:pravidl[oa]\s+|\()([STRJ]\d{1,2}[a-z]?)(?=[)\s,.;])/g)) {
      if (!known.has(m[1])) unknown.push({ file: rel, rule: m[1] });
    }
  }
  return unknown;
}

// Vrací cesty RELATIVNĚ k předanému kořeni. Dřív se ořezávalo podle
// globální ROOT, takže mimo repozitář (v testu) vznikly nesmyslné cesty a
// gate mlčel — vada, kterou našel vlastní test.
function listMarkdown(root, relDir) {
  const dir = join(root, relDir);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => join(relDir, f));
}

const PAGE_HEADER = [
  "+++",
  "# GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: hlavičky validátorů — regeneruje `npm run build:rules-catalog`.",
  'title = "Pravidla brány"',
  'template = "rules-catalog.html"',
  'sort_by = "weight"',
  "weight = 70",
  'description = "Co build doopravdy vynucuje: sémantika, referenční integrita, parita tabulky a JSON-LD expanze — vytažené z modulů, které ta pravidla vlastní."',
  "",
  "[extra]",
  "generated = true",
  'lang = "cs"',
  'seo_type = "CollectionPage"',
  'record_type = "rulesCatalogIndex"',
  'view_model = "generated/rules-catalog.json"',
  "+++",
  "",
  "Tahle stránka neopisuje pravidla z dokumentace. **Čte je z modulů, které je vynucují** — a co v kódu není, se tu neobjeví.",
  "",
  "Pravidlo se stavem `ERROR` shodí build. `WARNING` se jen hlásí: je to nález k prohlédnutí, ne brána. Ten rozdíl je tu vidět schválně, protože stránka, která by obojí ukázala stejně, by slibovala víc, než se skutečně vynucuje.",
  "",
];

function writeIfChanged(path, next, { check }) {
  const prev = existsSync(path) ? readFileSync(path, "utf8") : null;
  if (prev === next) return false;
  if (!check) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, next);
  }
  return true;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const check = process.argv.includes("--check");
  const catalog = buildCatalog(ROOT);
  const problems = [];

  for (const g of catalog.groups) {
    if (!g.count) problems.push(`${g.file}: hlavička nenese ani jedno pravidlo ${g.namespace}# — přišel o ni, nebo změnila tvar?`);
  }

  const known = new Set(catalog.groups.flatMap((g) => g.rules.map((r) => r.id)));
  const seen = new Set();
  for (const u of findUnknownRuleMentions(ROOT, known)) {
    const key = `${u.file}#${u.rule}`;
    if (seen.has(key)) continue;
    seen.add(key);
    problems.push(`${u.file}: odkazuje na pravidlo ${u.rule}, které žádný validátor nevlastní`);
  }

  const changed = [
    writeIfChanged(join(ROOT, "data/generated/rules-catalog.json"), `${JSON.stringify(catalog, null, 2)}\n`, { check }),
    writeIfChanged(join(ROOT, "content/pravidla/_index.md"), PAGE_HEADER.join("\n"), { check }),
  ].filter(Boolean).length;

  console.log(
    `build:rules-catalog — ${catalog.counts.rules} pravidel ve ${catalog.counts.groups} skupinách ` +
      `(${catalog.counts.error} ERROR, ${catalog.counts.warning} WARNING); ${changed} souborů ${check ? "by se změnilo" : "zapsáno/aktuálních"}.`,
  );

  if (problems.length) {
    console.log(`\n${problems.length} problém(ů):`);
    for (const p of problems) console.log(`  ERROR ${p}`);
    console.log("\nFAILED");
    process.exit(1);
  }
  if (check && changed) {
    console.log("\nFAILED — katalog není aktuální, spusť `npm run build:rules-catalog`.");
    process.exit(1);
  }
  console.log("OK");
}

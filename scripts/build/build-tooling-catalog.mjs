#!/usr/bin/env node
/*
 * Katalog toolingu — co který příkaz repozitáře dělá a co vynucuje.
 *
 * PROČ EXISTUJE
 * -------------
 * Repozitář má přes devadesát npm skriptů, desítky validátorů a
 * generátorů, vrstvu `just` receptů, Claude skills a build pipeline
 * o desítkách kroků. Nový přispěvatel ani agent neměl kde zjistit, co
 * který příkaz dělá, co vynucuje a kdy ho spustit — ta znalost žila
 * v hlavičkových komentářích, které nikdo nečte předem. Ručně psaný
 * seznam by zastaral do týdne, protože příkaz se přidává do
 * package.json, ne do dokumentace. Katalog ji proto GENERUJE a brána
 * hlídá, že nezastarala.
 *
 * DVA ZDROJE VSTUPU, ZÁMĚRNĚ ODDĚLENÉ
 * -----------------------------------
 *   data/tooling/*.json — ručně psané záznamy: co příkaz dělá, co
 *     vynucuje, kdy ho spustit, odkud čte a kam píše. To se ze zdrojů
 *     odvodit nedá a musí to někdo vědět.
 *   package.json + scripts/build/pipeline.mjs + .githooks/pre-commit +
 *   justfile + .claude/skills/*(/)SKILL.md — SKUTEČNOST. Odtud se
 *     dopočítá příkazová řádka, zařazení do build/dev/check pipeline,
 *     členství v pre-commit hooku, cíl just receptu a frontmatter
 *     skillu. Tenhle díl se nikdy nepíše ručně, aby katalog nemohl
 *     tvrdit něco jiného, než co repozitář skutečně spouští.
 *
 * CO GENERUJE
 * -----------
 *   data/generated/tooling-catalog.json — view model pro UI.
 *   content/dokumentace/prikazy/_index.md + <id>.md — stránka pro
 *     každý příkaz, ať je na co odkazovat a co indexovat.
 *   docs/TOOLING.md — tatáž věc pro agenty a pro čtení v repozitáři,
 *     bez nutnosti stavět web.
 *
 * OBOUSMĚRNÁ BRÁNA (--check)
 * --------------------------
 * Nový příkaz bez dokumentace shodí build, a stejně tak záznam
 * ukazující na příkaz, který zanikl. Kontroluje se:
 *   G1  každý npm skript v package.json (mimo npm lifecycle hooky) má
 *       záznam, a každý záznam kind=npm ukazuje na existující skript;
 *   G2  každý adresář .claude/skills/(*)/ se souborem SKILL.md má
 *       záznam, a každý záznam kind=skill ukazuje na existující skill;
 *   G3  každý recept v justfile má záznam, a každý záznam kind=just
 *       ukazuje na existující recept;
 *   G4  identifier odpovídá dvojici kind+name (slug nesmí ukazovat na
 *       jiný příkaz, než který popisuje);
 *   G5  deklarovaný sourceFile existuje, a u npm skriptu ho příkazová
 *       řádka v package.json skutečně volá;
 *   G6  npm skript, jehož řádka volá soubor repozitáře, sourceFile mít
 *       MUSÍ — jinak by se dal popsat, aniž by se kdokoli podíval do
 *       implementace;
 *   G7  generovaný výstup odpovídá datům (stejný princip jako
 *       verify:source-catalog).
 *
 * CACHOVÁNÍ
 * ---------
 * Zápis je idempotentní: soubor se přepíše jen tehdy, když se jeho
 * obsah liší.
 *
 * Použití: node scripts/build/build-tooling-catalog.mjs [--check]
 *   --check  nic nezapíše, jen skončí nenulově, pokud by zápis něco
 *            změnil nebo pokud selže kterákoli z kontrol G1–G6
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createValidators } from "../data/validate-shape.mjs";
import { MODES } from "./pipeline.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DATA_DIR = join(ROOT, "data/tooling");
const OUT_VIEW = join(ROOT, "data/generated/tooling-catalog.json");
const OUT_CONTENT = join(ROOT, "content/dokumentace/prikazy");
const OUT_DOC = join(ROOT, "docs/TOOLING.md");

const CHECK = process.argv.includes("--check");
const GENERATED_NOTE =
  "GENEROVANÝ SOUBOR. NEUPRAVUJ RUČNĚ. Zdroj: data/tooling/** + package.json + justfile + .claude/skills/** — regeneruje `npm run build:tooling-catalog`.";

const CATALOG_SCHEMA_ID = "https://vomaste.cz/schemas/canonical/tooling-command.schema.json";

/* ---- pomocné ---------------------------------------------------------- */

const changed = [];

// `tracked: false` je artefakt v data/generated/ — gitignorovaný, buildem
// vyráběný. V --check se na něj nesmí padat: v čerstvém klonu ještě
// neexistuje, takže by brána hlásila „katalog není aktuální" u souboru,
// který v repozitáři z principu nikdy neleží. Kontroluje se jen to, co je
// v gitu: stránky a docs/TOOLING.md.
function writeIfChanged(path, text, { tracked = true } = {}) {
  const next = Buffer.from(text, "utf8");
  if (existsSync(path) && readFileSync(path).equals(next)) return false;
  if (tracked) changed.push(path.slice(ROOT.length + 1));
  if (!CHECK) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, next);
  }
  return true;
}

const readText = (p) => readFileSync(p, "utf8");
const toml = (s) => `"${String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
const bullets = (xs) => xs.map((x) => `- ${x}`).join("\n");

export const KIND_LABEL = { npm: "npm skript", skill: "Claude skill", just: "just recept" };
export const CATEGORY_LABEL = {
  validace: "validace vstupů",
  generovani: "generování",
  kontrola: "kontrola výstupů",
  reserse: "rešerše",
  provoz: "provoz",
};
const CATEGORY_ORDER = ["validace", "generovani", "kontrola", "reserse", "provoz"];
const KIND_ORDER = ["npm", "skill", "just"];

// Slug musí být odvoditelný z dvojice kind+name, jinak by stránka mohla
// popisovat jiný příkaz, než na jaký ukazuje její adresa (kontrola G4).
export function slugFor(kind, name) {
  const base = String(name).replace(/[:._]/g, "-").toLowerCase();
  return kind === "npm" ? base : `${kind}-${base}`;
}

/* ---- 1) skutečnost: co repozitář opravdu obsahuje --------------------- */

// npm lifecycle hooky se nedokumentují jako příkazy: nespouští je člověk,
// spouští je npm sám. Množina je vyjmenovaná, ne odhadovaná prefixem —
// `preflight` je skutečný příkaz, který by prefixové pravidlo omylem
// vyřadilo.
export const NPM_LIFECYCLE = new Set([
  "preinstall", "install", "postinstall",
  "prepublish", "prepare", "preprepare", "postprepare",
  "prepack", "postpack", "prepublishOnly", "postpublish",
]);

export function readNpmScripts(root = ROOT) {
  const pkg = JSON.parse(readText(join(root, "package.json")));
  return pkg.scripts ?? {};
}

// Zařazení do build/dev/check režimu se čte z pipeline.mjs, ne z dat —
// kdyby se psalo ručně, katalog by po prvním přesunu kroku lhal.
function pipelineMembership() {
  const byScript = new Map();
  for (const [mode, steps] of Object.entries(MODES)) {
    for (const step of steps) {
      if (typeof step !== "string") continue;
      if (!byScript.has(step)) byScript.set(step, []);
      byScript.get(step).push(mode);
    }
  }
  return byScript;
}

// Totéž pro pre-commit: seznam žije v .githooks/pre-commit jako pole
// FAST_CHECKS a čte se odtud.
export function readPrecommitChecks(root = ROOT) {
  const path = join(root, ".githooks/pre-commit");
  if (!existsSync(path)) return [];
  const m = /FAST_CHECKS=\(([\s\S]*?)\n\)/.exec(readText(path));
  if (!m) return [];
  return m[1]
    .split("\n")
    .map((l) => l.replace(/#.*$/, "").trim())
    .filter(Boolean);
}

// Recepty justfile. Hlavička receptu začíná na prvním sloupci a končí
// dvojtečkou, která NENÍ `:=` (to je přiřazení proměnné).
const RECIPE_RE = /^([a-z][a-z0-9_-]*)((?:\s+\*?[a-z_][a-z0-9_]*)*)\s*:(?!=)\s*(.*)$/;

export function readJustRecipes(root = ROOT) {
  const path = join(root, "justfile");
  if (!existsSync(path)) return [];
  const lines = readText(path).split("\n");
  const out = [];
  let doc = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const docMatch = /^\[doc\("(.*)"\)\]\s*$/.exec(line);
    if (docMatch) {
      doc = docMatch[1];
      continue;
    }
    if (/^\s/.test(line) || line.startsWith("#") || line.trim() === "") continue;
    const m = RECIPE_RE.exec(line);
    if (!m) {
      doc = null;
      continue;
    }
    const body = [];
    for (let j = i + 1; j < lines.length; j++) {
      if (lines[j].trim() === "") break;
      if (!/^\s/.test(lines[j])) break;
      body.push(lines[j].trim());
    }
    out.push({
      name: m[1],
      params: m[2].trim().split(/\s+/).filter(Boolean),
      doc,
      body,
    });
    doc = null;
  }
  return out;
}

// Frontmatter skillu. `description` a `argument-hint` jsou strojově
// čitelná deklarace samotného skillu — přebírají se doslova, aby se
// katalog nemohl rozejít s tím, co skill o sobě říká Claude Code.
export function readSkills(root = ROOT) {
  const dir = join(root, ".claude/skills");
  if (!existsSync(dir)) return [];
  const out = [];
  for (const name of readdirSync(dir).sort()) {
    const file = join(dir, name, "SKILL.md");
    if (!statSync(join(dir, name)).isDirectory() || !existsSync(file)) continue;
    const text = readText(file);
    const fm = /^---\n([\s\S]*?)\n---/.exec(text);
    const meta = {};
    if (fm) {
      // Frontmatter skillu je plochý a jednořádkový; plný YAML parser by
      // sem přinesl závislost kvůli dvěma klíčům.
      let key = null;
      for (const raw of fm[1].split("\n")) {
        const kv = /^([a-z-]+):\s*(.*)$/.exec(raw);
        if (kv) {
          key = kv[1];
          meta[key] = kv[2].trim();
        } else if (key && raw.trim()) {
          meta[key] = `${meta[key]} ${raw.trim()}`.trim();
        }
      }
    }
    out.push({
      name,
      file: `.claude/skills/${name}/SKILL.md`,
      description: meta.description ?? null,
      argumentHint: meta["argument-hint"] ?? null,
      lines: text.split("\n").length,
    });
  }
  return out;
}

/* ---- 2) ručně psané záznamy ------------------------------------------ */

export function readRecords(dir = DATA_DIR) {
  const validateEntry = createValidators().ajv.getSchema(CATALOG_SCHEMA_ID);
  if (!validateEntry) throw new Error(`schemas/canonical: chybí ${CATALOG_SCHEMA_ID}`);

  const out = (existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".json")).sort() : []).map((f) => {
    const record = JSON.parse(readText(join(dir, f)));
    if (!validateEntry(record)) {
      const detail = validateEntry.errors.map((e) => `    ${e.instancePath || "/"} ${e.message}`).join("\n");
      throw new Error(`data/tooling/${f} neodpovídá schématu:\n${detail}`);
    }
    if (`${record.identifier}.json` !== f) {
      throw new Error(`data/tooling/${f}: identifier "${record.identifier}" neodpovídá názvu souboru.`);
    }
    return record;
  });

  if (out.length === 0) throw new Error("data/tooling/ je prázdný — katalog by byl lež.");
  return out;
}

/* ---- 3) obousměrná brána G1–G6 --------------------------------------- */

// Které soubory repozitáře příkaz SPOUŠTÍ jako svůj program. `node --test`
// se vynechává schválně — tam je „implementací" množina testů, ne jeden
// soubor; totéž platí pro vstupy bundleru, které se za `node` nepředávají.
export function executedPrograms(command) {
  const out = [];
  for (const part of String(command).split(/&&|\|\||;/)) {
    const trimmed = part.trim();
    const viaNode = /^node\s+(?!--test\b)(?:--[\w=-]+\s+)*([\w\-./]+\.(?:mjs|js|cjs))/.exec(trimmed);
    if (viaNode) out.push(viaNode[1]);
    const direct = /^\.?\/?((?:scripts|\.githooks)\/[\w\-./]+\.(?:sh|mjs))/.exec(trimmed);
    if (direct) out.push(direct[1]);
  }
  return [...new Set(out)];
}

export function auditCatalog({ records, scripts, recipes, skills, root = ROOT }) {
  const errors = [];
  const byKind = (k) => records.filter((r) => r.kind === k);

  // G1 — npm skripty oběma směry.
  const documented = new Set(byKind("npm").map((r) => r.name));
  for (const name of Object.keys(scripts)) {
    if (NPM_LIFECYCLE.has(name)) continue;
    if (!documented.has(name)) {
      errors.push(`G1: npm skript "${name}" nemá záznam v data/tooling/ — přidej ${slugFor("npm", name)}.json.`);
    }
  }
  for (const r of byKind("npm")) {
    if (!scripts[r.name]) errors.push(`G1: záznam ${r.identifier} ukazuje na npm skript "${r.name}", který v package.json není.`);
  }

  // G2 — skills oběma směry.
  const skillNames = new Set(skills.map((s) => s.name));
  const documentedSkills = new Set(byKind("skill").map((r) => r.name));
  for (const s of skills) {
    if (!documentedSkills.has(s.name)) {
      errors.push(`G2: skill "${s.name}" nemá záznam v data/tooling/ — přidej ${slugFor("skill", s.name)}.json.`);
    }
  }
  for (const r of byKind("skill")) {
    if (!skillNames.has(r.name)) {
      errors.push(`G2: záznam ${r.identifier} ukazuje na skill "${r.name}", ale .claude/skills/${r.name}/SKILL.md neexistuje.`);
    }
  }

  // G3 — just recepty oběma směry.
  const recipeNames = new Set(recipes.map((x) => x.name));
  const documentedRecipes = new Set(byKind("just").map((r) => r.name));
  for (const x of recipes) {
    if (!documentedRecipes.has(x.name)) {
      errors.push(`G3: just recept "${x.name}" nemá záznam v data/tooling/ — přidej ${slugFor("just", x.name)}.json.`);
    }
  }
  for (const r of byKind("just")) {
    if (!recipeNames.has(r.name)) errors.push(`G3: záznam ${r.identifier} ukazuje na just recept "${r.name}", který v justfile není.`);
  }

  for (const r of records) {
    // G4 — slug odpovídá tomu, co popisuje.
    const expected = slugFor(r.kind, r.name);
    if (r.identifier !== expected) {
      errors.push(`G4: záznam ${r.identifier} popisuje ${r.kind} "${r.name}", takže se musí jmenovat ${expected}.`);
    }

    // G5 — deklarovaný zdrojový soubor existuje a u npm skriptu ho příkaz volá.
    if (r.sourceFile) {
      if (!existsSync(join(root, r.sourceFile))) {
        errors.push(`G5: záznam ${r.identifier} odkazuje na ${r.sourceFile}, který neexistuje.`);
      } else if (r.kind === "npm" && !(scripts[r.name] ?? "").includes(r.sourceFile)) {
        errors.push(`G5: záznam ${r.identifier} deklaruje ${r.sourceFile}, ale příkaz "${scripts[r.name]}" ho nevolá.`);
      }
    }

    // G6 — npm skript, který SPOUŠTÍ soubor repozitáře jako svůj program,
    // musí říct který. Testové běhy (`node --test <glob>`) a vstupy
    // bundleru (esbuild, tailwindcss) sem nepatří: tam není jedna
    // implementace příkazu, ale množina souborů, a vybrat z ní jeden by
    // byla libovůle.
    if (r.kind === "npm" && !r.sourceFile) {
      const executed = executedPrograms(scripts[r.name] ?? "");
      if (executed.length) {
        errors.push(`G6: záznam ${r.identifier} nemá sourceFile, ale příkaz spouští ${executed.join(", ")}.`);
      }
    }
  }

  return errors;
}

/* ---- 4) view model ---------------------------------------------------- */

// Cíl just receptu se dopočítá z jeho těla; je-li to `npm run <skript>`,
// katalog na tu stránku rovnou odkáže místo druhého popisu téhož.
function delegationOf(recipe) {
  const first = (recipe?.body ?? []).find((l) => l && !l.startsWith("#!") && !l.startsWith("#"));
  if (!first) return { runs: null, npmScript: null };
  const m = /^npm run ([\w:-]+)/.exec(first);
  return { runs: first, npmScript: m ? m[1] : null };
}

export function buildViewModel({ records, scripts, recipes, skills, pipelines, precommit }) {
const recipeByName = new Map(recipes.map((r) => [r.name, r]));
const skillByName = new Map(skills.map((s) => [s.name, s]));
const recordIds = new Set(records.map((r) => r.identifier));

const entries = records
  .map((r) => {
    const recipe = r.kind === "just" ? recipeByName.get(r.name) : null;
    const skill = r.kind === "skill" ? skillByName.get(r.name) : null;
    const delegation = delegationOf(recipe);
    return {
      identifier: r.identifier,
      "@id": r["@id"],
      kind: r.kind,
      kindLabel: KIND_LABEL[r.kind],
      name: r.name,
      title: r.title,
      category: r.category,
      categoryLabel: CATEGORY_LABEL[r.category],
      summary: r.summary,
      enforces: r.enforces ?? [],
      whenToRun: r.whenToRun,
      inputs: r.inputs ?? [],
      outputs: r.outputs ?? [],
      rules: r.rules ?? [],
      notes: r.notes ?? [],
      describedFrom: r.describedFrom,
      route: `/dokumentace/prikazy/${r.identifier}/`,
      // --- dopočítáno ze skutečnosti, nikdy z dat ---
      invocation:
        r.kind === "npm" ? `npm run ${r.name}` : r.kind === "just" ? `just ${[r.name, ...(recipe?.params ?? [])].join(" ")}` : `skill ${r.name}`,
      command: r.kind === "npm" ? scripts[r.name] : null,
      pipelines: r.kind === "npm" ? (pipelines.get(r.name) ?? []) : [],
      precommit: r.kind === "npm" ? precommit.has(r.name) : false,
      sourceFile: r.sourceFile ?? (skill ? skill.file : r.kind === "just" ? "justfile" : null),
      justDoc: recipe?.doc ?? null,
      justRuns: delegation.runs,
      justNpmScript: delegation.npmScript,
      // Slug cíle se dopočítá tady, ne v šabloně: Tera neumí filtr uvnitř
      // řetězení `~` a stránka by se skládala z řetězců na dvou místech.
      // Odkaz vznikne jen tehdy, když cíl v katalogu opravdu je.
      justNpmIdentifier:
        delegation.npmScript && recordIds.has(slugFor("npm", delegation.npmScript))
          ? slugFor("npm", delegation.npmScript)
          : null,
      skillDescription: skill?.description ?? null,
      skillArgumentHint: skill?.argumentHint ?? null,
    };
  })
  .sort(
    (a, b) =>
      KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) ||
      CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) ||
      a.name.localeCompare(b.name, "cs"),
  );

const counts = {
  total: entries.length,
  byKind: Object.fromEntries(KIND_ORDER.map((k) => [k, entries.filter((e) => e.kind === k).length])),
  byCategory: Object.fromEntries(CATEGORY_ORDER.map((c) => [c, entries.filter((e) => e.category === c).length])),
  gates: entries.filter((e) => e.enforces.length > 0).length,
  inBuild: entries.filter((e) => e.pipelines.includes("build")).length,
  inPrecommit: entries.filter((e) => e.precommit).length,
};

return { generated: true, note: GENERATED_NOTE, counts, entries };
}

/* ---- 5) generování ---------------------------------------------------- */

function generate(view) {
const { counts, entries } = view;
writeIfChanged(OUT_VIEW, JSON.stringify(view, null, 2) + "\n", { tracked: false });

for (const [i, e] of entries.entries()) {
  const body = [
    `+++`,
    `# ${GENERATED_NOTE}`,
    `title = ${toml(`${e.invocation} — ${e.title}`)}`,
    `template = "tooling-command.html"`,
    `weight = ${i + 1}`,
    `description = ${toml(`${e.title}: ${e.summary.split(". ")[0]}. ${e.kindLabel}, ${e.categoryLabel}.`)}`,
    ``,
    `[extra]`,
    `generated = true`,
    `lang = "cs"`,
    `seo_type = "TechArticle"`,
    `record_type = "toolingCommand"`,
    `record_id = ${toml(e["@id"])}`,
    `tooling_command = ${toml(e.identifier)}`,
    `view_model = "generated/tooling-catalog.json"`,
    `+++`,
    ``,
    e.summary,
    ``,
    `## Kdy ho spustit {#kdy}`,
    ``,
    e.whenToRun,
    ``,
    ...(e.enforces.length
      ? [`## Co shodí běh {#vynucuje}`, ``, bullets(e.enforces), ``]
      : [
          `## Co vynucuje {#vynucuje}`,
          ``,
          `Nic — tenhle příkaz reportuje nebo generuje, ale sám o sobě nic neshazuje. Co selže při chybě, hlídají brány, které za ním v pipeline běží.`,
          ``,
        ]),
    ...(e.notes.length ? [`## Co je potřeba vědět {#pozor}`, ``, bullets(e.notes), ``] : []),
  ].join("\n");

  writeIfChanged(join(OUT_CONTENT, `${e.identifier}.md`), body.replace(/\n{3,}/g, "\n\n") + "\n");
}

writeIfChanged(
  join(OUT_CONTENT, "_index.md"),
  [
    `+++`,
    `# ${GENERATED_NOTE}`,
    `title = "Příkazy a tooling"`,
    `template = "tooling-index.html"`,
    `sort_by = "weight"`,
    `weight = 90`,
    `description = "Katalog všech příkazů repozitáře — npm skripty, Claude skills a just recepty: co dělají, co vynucují a kdy je spustit. Generovaný z package.json, justfile a .claude/skills, takže nemůže zastarat."`,
    ``,
    `[extra]`,
    `generated = true`,
    `lang = "cs"`,
    `seo_type = "CollectionPage"`,
    `record_type = "toolingCommandIndex"`,
    `view_model = "generated/tooling-catalog.json"`,
    `+++`,
    ``,
    `Tenhle katalog odpovídá na otázku, kterou si nový přispěvatel i agent kladou jako první: **co který příkaz dělá, co vynucuje a kdy ho spustit**.`,
    ``,
    `Ručně se u každého příkazu píše jen to, co se ze zdrojů odvodit nedá. Příkazová řádka, zařazení do build pipeline, členství v pre-commit hooku, cíl \`just\` receptu i frontmatter skillu se dopočítávají ze samotného repozitáře, takže katalog nemůže tvrdit něco jiného, než co se skutečně spouští. Příkaz bez záznamu shodí build — a stejně tak záznam ukazující na příkaz, který zanikl.`,
    ``,
  ].join("\n"),
);

/* ---- 6) markdown pro agenty ------------------------------------------ */

const row = (e) =>
  `| [\`${e.invocation}\`](/dokumentace/prikazy/${e.identifier}/) | ${e.categoryLabel} | ${
    e.enforces.length ? "ano" : "—"
  } | ${e.pipelines.length ? e.pipelines.join(", ") : "—"} | ${e.precommit ? "ano" : "—"} |`;

const section = (kind) => {
  const rows = entries.filter((e) => e.kind === kind);
  if (!rows.length) return [];
  return [
    `## ${KIND_LABEL[kind]} (${rows.length})`,
    ``,
    `| Příkaz | Kategorie | Vynucuje | Pipeline | Pre-commit |`,
    `|---|---|---|---|---|`,
    ...rows.map(row),
    ``,
  ];
};

const doc = [
  `<!-- ${GENERATED_NOTE} -->`,
  ``,
  `# Tooling — co který příkaz dělá`,
  ``,
  `Publikovaná podoba: [/dokumentace/prikazy/](https://vomaste.cz/dokumentace/prikazy/).`,
  ``,
  `${counts.total} příkazů celkem: ${counts.byKind.npm} npm skriptů, ${counts.byKind.skill} skills, ${counts.byKind.just} just receptů. ` +
    `${counts.gates} z nich může shodit běh, ${counts.inBuild} jsou krokem \`npm run build\` a ${counts.inPrecommit} běží v pre-commit hooku.`,
  ``,
  `**Pravidlo, které z katalogu plyne**: příkaz se přidává do \`package.json\` (nebo do \`justfile\` či \`.claude/skills/\`) a zároveň do \`data/tooling/\`. Bez záznamu build spadne — dokumentace tak nemůže zaostat za kódem.`,
  ``,
  ...KIND_ORDER.flatMap(section),
  `## Co která brána shodí`,
  ``,
  ...entries
    .filter((e) => e.enforces.length > 0)
    .flatMap((e) => [`### \`${e.invocation}\``, ``, bullets(e.enforces), ``]),
  `## Příkazy podle kategorie`,
  ``,
  ...CATEGORY_ORDER.flatMap((c) => {
    const rows = entries.filter((e) => e.category === c);
    if (!rows.length) return [];
    return [`- **${CATEGORY_LABEL[c]}** (${rows.length}): ${rows.map((e) => `\`${e.invocation}\``).join(", ")}`];
  }),
  ``,
].join("\n");

writeIfChanged(OUT_DOC, doc + "\n");
}

/* ---- 7) běh ----------------------------------------------------------- */

function main() {
  const records = readRecords();
  const scripts = readNpmScripts();
  const recipes = readJustRecipes();
  const skills = readSkills();

  const auditErrors = auditCatalog({ records, scripts, recipes, skills });
  if (auditErrors.length) {
    console.error("Katalog toolingu neodpovídá repozitáři:");
    for (const e of auditErrors) console.error(`  ${e}`);
    process.exit(1);
  }

  const view = buildViewModel({
    records,
    scripts,
    recipes,
    skills,
    pipelines: pipelineMembership(),
    precommit: new Set(readPrecommitChecks()),
  });
  generate(view);

  if (CHECK && changed.length) {
    console.error("Katalog toolingu není aktuální. Rozdíly by vznikly v:");
    for (const p of changed) console.error(`  ${p}`);
    console.error("Spusť: npm run build:tooling-catalog");
    process.exit(1);
  }

  const { counts } = view;
  console.log(
    `Katalog toolingu: ${counts.total} příkazů (${counts.byKind.npm} npm, ${counts.byKind.skill} skills, ` +
      `${counts.byKind.just} just), ${counts.gates} bran, ${counts.inBuild} kroků buildu, ${counts.inPrecommit} v pre-commitu.`,
  );
  console.log(changed.length ? `  zapsáno: ${changed.length} souborů` : "  beze změny");
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) main();

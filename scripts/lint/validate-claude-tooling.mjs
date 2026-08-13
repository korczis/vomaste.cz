#!/usr/bin/env node
/*
 * Brána Claude toolingu — odkazy, pravidla a struktura schopností.
 *
 * PROČ EXISTUJE
 * -------------
 * `CLAUDE.md` a `.claude/rules/**` jsou navigační vrstva: skoro každá
 * jejich věta ukazuje na soubor, příkaz nebo skill. Právě proto tichle
 * zastarávají nejrychleji ze všeho v repozitáři — přejmenuje se skript,
 * přesune validátor, zanikne skill, a text dál sebevědomě posílá
 * čtenáře na neexistující místo. Rozdíl proti obyčejné dokumentaci je
 * v tom, že tenhle text čte agent a JEDNÁ podle něj: odkaz na
 * neexistující příkaz není překlep, je to instrukce, kterou nelze
 * splnit.
 *
 * Katalog toolingu (`build-tooling-catalog.mjs`) hlídá, že každá
 * schopnost má záznam. Tenhle validátor hlídá to druhé: že všechno,
 * na co pravidla a schopnosti odkazují, opravdu existuje.
 *
 * CO KONTROLUJE
 * -------------
 *   CT1  frontmatter pravidla je parsovatelný a `paths` obsahuje jen
 *        neprázdné řetězce;
 *   CT2  cesta uvedená v backticích existuje (soubor i adresář);
 *   CT3  markdownový odkaz vede na existující soubor;
 *   CT4  `npm run <x>` odkazuje na skript, který v package.json je;
 *   CT5  odkaz na skill (`/jméno`) vede na existující skill;
 *   CT6  skill má povinné oddíly, aby nebyl jen název;
 *   CT7  název skillu, agenta a workflow je unikátní napříč vrstvami;
 *   CT8  workflow deklaruje jen skilly a agenty, které existují, a
 *        personu ze závazného slovníku. Cesta ukazující na schopnost,
 *        která zanikla, je návod, který nejde projít;
 *   CT9  skill, jehož účinek opouští repozitář nebo se těžko vrací,
 *        má `disable-model-invocation`. Claude ho pak nesmí spustit
 *        mimoděk jako vedlejší efekt jiné práce — vyvolá ho člověk.
 *
 * CO ZÁMĚRNĚ NEKONTROLUJE
 * -----------------------
 * Obsah vět. Jestli je pravidlo pravdivé, nejde odvodit ze stromu —
 * na to je review. Tenhle validátor kontroluje jen to, co je
 * mechanicky ověřitelné, aby nevznikl dojem záruky, kterou nemá.
 *
 * Usage: node scripts/lint/validate-claude-tooling.mjs
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");

/* ---- co se skenuje ---------------------------------------------------- */

const listMd = (dir, { recursive = false } = {}) => {
  const abs = join(ROOT, dir);
  if (!existsSync(abs)) return [];
  return readdirSync(abs, { withFileTypes: true }).flatMap((e) => {
    if (e.isDirectory()) return recursive ? listMd(`${dir}/${e.name}`, { recursive }) : [];
    return e.name.endsWith(".md") ? [`${dir}/${e.name}`] : [];
  });
};

export function scannedFiles(root = ROOT) {
  const rules = existsSync(join(root, ".claude/rules"))
    ? listMd(".claude/rules", { recursive: true })
    : [];
  const skills = existsSync(join(root, ".claude/skills"))
    ? readdirSync(join(root, ".claude/skills"))
        .filter((n) => existsSync(join(root, ".claude/skills", n, "SKILL.md")))
        .map((n) => `.claude/skills/${n}/SKILL.md`)
    : [];
  return ["CLAUDE.md", ...rules, ...skills, ...listMd(".claude/agents"), ...listMd(".claude/workflows")];
}

/* ---- pomocné: co je vůbec kandidát na cestu --------------------------- */

// Backticků je v těchhle textech spousta a většina z nich cestu neobsahuje
// (`CLM-##`, `status-single`, `npm run build`). Kandidátem je jen token,
// který vypadá jako cesta v repozitáři A NENÍ vzorem, URL, kotvou ani
// příkazem. Raději méně kontrolovaných tokenů než falešné poplachy —
// brána, která křičí na `status-single`, se vypne a pak nehlídá nic.
const PATHISH = /^[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)+\/?$/;
const HAS_EXTENSION = /\.(md|mjs|js|json|toml|yml|yaml|sh|html|css|jsonld)$/;
// Zástupné symboly v prozaickém odkazu (`data/dossiers/<slug>/`,
// `clm-NN.json`, `CLM-##`) nejsou cesty a hledat je by znamenalo hlásit
// chybu u textu, který je správně.
const PLACEHOLDER = /[<>]|NN|##/;
// Gitové reference vypadají jako cesta a nejsou jí.
const GIT_REF = /^(origin|upstream)\//;

export function pathCandidates(text) {
  const out = new Set();
  for (const [, token] of text.matchAll(/`([^`\n]+)`/g)) {
    const t = token.trim();
    if (!t || t.includes("*") || t.includes("#") || t.includes(" ")) continue;
    if (t.startsWith("http") || t.startsWith("@") || t.startsWith("~")) continue;
    if (t.startsWith("/")) continue; // URL webu nebo volání skillu, řeší CT5
    if (PLACEHOLDER.test(t) || GIT_REF.test(t)) continue;
    if (!PATHISH.test(t) && !HAS_EXTENSION.test(t)) continue;
    out.add(t.replace(/\/$/, ""));
  }
  return [...out];
}

// Rejstřík názvů souborů, aby se dal ověřit i zkrácený odkaz. Prózu
// nikdo nepíše plnými cestami — „`macros/ui.html`" a „`validate-shape.mjs`"
// jsou běžné a srozumitelné způsoby, jak na soubor ukázat. Brána, která
// by je odmítala, by donutila psát text hůř; brána, která je ignoruje,
// by nechytila přejmenování. Proto se hledá koncovka cesty.
function fileIndex(root) {
  const SKIP = new Set(["node_modules", ".git", "public", "target", ".tmp", "dist"]);
  const all = [];
  const walk = (rel) => {
    for (const e of readdirSync(join(root, rel) || root, { withFileTypes: true })) {
      if (SKIP.has(e.name)) continue;
      const next = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) walk(next);
      else all.push(next);
    }
  };
  walk("");
  return all;
}

// Odkaz sedí, když se cesta shoduje celá, nebo když je souvislým koncem
// nějaké skutečné cesty (`macros/ui.html` ↔ `templates/macros/ui.html`).
function referenceResolves(candidate, { root, fromDir, index }) {
  if (existsSync(join(root, candidate))) return true;
  if (existsSync(resolve(join(root, fromDir), candidate))) return true;
  const suffix = `/${candidate}`;
  return index.some((p) => p.endsWith(suffix));
}

// Odkaz na skill se v textu píše jako `/jméno`. URL webu se od něj pozná
// spolehlivě: končí lomítkem (`/dossiers/`, `/prirucka/ref-stavy-tvrzeni/`).
export function skillCandidates(text) {
  const out = new Set();
  for (const [, token] of text.matchAll(/`(\/[^`\n]+)`/g)) {
    const t = token.trim();
    if (t.endsWith("/") || t.includes(".") || t.slice(1).includes("/")) continue;
    if (!/^\/[a-z0-9][a-z0-9-]*$/.test(t)) continue;
    out.add(t.slice(1));
  }
  return [...out];
}

export function npmCandidates(text) {
  return [...new Set([...text.matchAll(/`?npm run ([\w:-]+)/g)].map((m) => m[1]))];
}

/* ---- kontroly --------------------------------------------------------- */

// Plochý frontmatter, stejná konvence jako u katalogu toolingu: klíč
// na začátku řádku, pokračovací řádky se slepují.
export function frontmatterOf(text) {
  const fm = /^---\n([\s\S]*?)\n---/.exec(text);
  if (!fm) return {};
  const meta = {};
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
  return meta;
}

// Jediný oddíl, který se vyžaduje mechanicky. Vybraný ne proto, že by
// byl nejdůležitější, ale proto, že je univerzální a nejčastěji chybí:
// skill bez hranice se použije tam, kam nepatří, a udělá tam něco
// polovičatě. Zbytek doporučené struktury (Purpose, Arguments, Steps,
// Failure modes, Examples…) je konvence v .claude/rules/claude-tooling.md
// — vynucovat konkrétní nadpisy by znamenalo diktovat sloh, ne kvalitu.
const REQUIRED_SKILL_SECTION = /##\s+.*(NEPOUŽ|Kdy ho nepoužít|When NOT to use|Nepoužívej)/i;

// Soubory, na které dokumentace odkazuje správně, ale v repozitáři
// nejsou a nikdy nebudou: lokální, gitignorovaná konfigurace. Seznam je
// vyjmenovaný, ne odvozený z .gitignore — jinak by stačilo cokoli
// ignorovat a brána by na to přestala vidět.
const INTENTIONALLY_ABSENT = new Set([
  ".prismatic-local.toml",
  "CLAUDE.local.md",
  ".claude/settings.local.json",
]);

// Generované stromy. Odkaz na `data/generated/tooling-catalog.json` je
// SPRÁVNÝ odkaz — ten soubor tam patří. Že zrovna neexistuje znamená, že
// v tomhle stromu ještě neběžely generátory (čerstvý klon nebo nový
// worktree), ne že dokumentace ukazuje do prázdna.
//
// Bez téhle výjimky brána v čerstvém worktree spadne na šesti odkazech,
// které jsou v pořádku, a poslala by člověka opravovat správný text.
// Přesně ta past, kterou /diagnose popisuje jako nejčastější v novém
// worktree — a kterou si tenhle validátor sám postavil pod nohy.
const GENERATED_ROOTS = ["data/generated/", "static/js/", "static/css/main.css", "public/", "reports/"];

export function validate(root = ROOT) {
  const errors = [];
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  const index = fileIndex(root);
  const scripts = new Set(Object.keys(pkg.scripts ?? {}));

  const skillNames = existsSync(join(root, ".claude/skills"))
    ? readdirSync(join(root, ".claude/skills")).filter((n) =>
        existsSync(join(root, ".claude/skills", n, "SKILL.md")),
      )
    : [];
  const agentNames = listMd(".claude/agents").map((f) => f.split("/").pop().replace(/\.md$/, ""));
  const workflowNames = listMd(".claude/workflows")
    .map((f) => f.split("/").pop().replace(/\.md$/, ""))
    .filter((n) => n !== "README");

  // Skills a příkazy Claude Code, na které se v textech odkazuje, ale
  // v tomhle repozitáři nežijí. Vyjmenované, ne odhadované prefixem.
  const EXTERNAL_COMMANDS = new Set(["help", "compact", "memory", "context", "init", "doctor", "agents", "model"]);

  for (const file of scannedFiles(root)) {
    const text = readFileSync(join(root, file), "utf8");

    // CT1 — frontmatter pravidla.
    if (file.startsWith(".claude/rules/")) {
      const fm = /^---\n([\s\S]*?)\n---/.exec(text);
      if (fm) {
        const pathsBlock = /^paths:\s*$([\s\S]*?)(?=^\S|\Z)/m.exec(fm[1]);
        if (pathsBlock) {
          const entries = pathsBlock[1]
            .split("\n")
            .map((l) => l.trim())
            .filter((l) => l.startsWith("- "))
            .map((l) => l.slice(2).trim().replace(/^["']|["']$/g, ""));
          if (!entries.length) errors.push(`CT1: ${file} má prázdný seznam paths.`);
          for (const e of entries) {
            if (!e) errors.push(`CT1: ${file} má prázdnou položku v paths.`);
          }
        }
      }
    }

    // CT2 — cesty v backticích.
    for (const candidate of pathCandidates(text)) {
      if (INTENTIONALLY_ABSENT.has(candidate)) continue;
      if (GENERATED_ROOTS.some((root) => candidate === root.replace(/\/$/, "") || candidate.startsWith(root))) continue;
      if (!referenceResolves(candidate, { root, fromDir: dirname(file), index })) {
        errors.push(`CT2: ${file} odkazuje na \`${candidate}\`, který v repozitáři není.`);
      }
    }

    // CT3 — markdownové odkazy na soubory.
    for (const [, target] of text.matchAll(/\]\(([^)\s]+)\)/g)) {
      if (/^(https?:|mailto:|#)/.test(target)) continue;
      const clean = target.split("#")[0];
      if (!clean) continue;
      const abs = clean.startsWith("/") ? join(root, clean.slice(1)) : resolve(join(root, dirname(file)), clean);
      if (!existsSync(abs)) errors.push(`CT3: ${file} odkazuje na ${target}, který neexistuje.`);
    }

    // CT4 — npm skripty.
    for (const name of npmCandidates(text)) {
      if (!scripts.has(name)) errors.push(`CT4: ${file} zmiňuje \`npm run ${name}\`, který v package.json není.`);
    }

    // CT5 — odkazy na skilly.
    for (const name of skillCandidates(text)) {
      if (EXTERNAL_COMMANDS.has(name)) continue;
      if (!skillNames.includes(name)) {
        errors.push(`CT5: ${file} odkazuje na skill \`/${name}\`, který v .claude/skills/ není.`);
      }
    }
  }

  // CT6 — skill musí říct, kdy se NEMÁ použít.
  for (const name of skillNames) {
    const text = readFileSync(join(root, `.claude/skills/${name}/SKILL.md`), "utf8");
    if (!REQUIRED_SKILL_SECTION.test(text)) {
      errors.push(`CT6: skill "${name}" neuvádí, kdy se NEMÁ použít — přidej oddíl "Kdy ho NEPOUŽÍT".`);
    }
  }

  // CT8 — workflow deklaruje jen to, co existuje.
  // Frontmatter cesty je slib: „projdeš to těmito schopnostmi". Když
  // některá zanikla, je to návod do zdi, a pozná se to až u toho, kdo
  // podle něj pracuje.
  const PERSONAS = new Set([
    "reader", "verifier", "source-contributor", "researcher", "editor",
    "developer", "reviewer", "maintainer", "orchestrator",
  ]);
  for (const file of listMd(".claude/workflows")) {
    const name = file.split("/").pop().replace(/\.md$/, "");
    if (name === "README") continue;
    const meta = frontmatterOf(readFileSync(join(root, file), "utf8"));
    const declared = (key) => (meta[key] ? meta[key].split(/[,\s]+/).filter(Boolean) : []);

    for (const s of declared("skills")) {
      if (!skillNames.includes(s)) errors.push(`CT8: ${file} deklaruje skill "${s}", který neexistuje.`);
    }
    for (const a of declared("agents")) {
      if (!agentNames.includes(a)) errors.push(`CT8: ${file} deklaruje agenta "${a}", který neexistuje.`);
    }
    if (!meta.persona) errors.push(`CT8: ${file} neuvádí personu.`);
    else if (!PERSONAS.has(meta.persona)) errors.push(`CT8: ${file} uvádí neznámou personu "${meta.persona}".`);
    if (!meta.goal) errors.push(`CT8: ${file} neuvádí goal — cesta bez cíle se nedá dokončit.`);
  }

  // CT9 — riziková schopnost se nesmí spustit mimoděk.
  // Kritérium není „zapisuje": zapisuje spousta věcí a většina je
  // triviálně vratná `git checkout`. Kritérium je, jestli účinek
  // OPOUŠTÍ repozitář (commit, push, PR), mění SDÍLENÝ stav (schéma,
  // pipeline), nebo se dotýká rozsahu pokrytí osob.
  const catalogDir = join(root, "data/tooling");
  if (existsSync(catalogDir)) {
    for (const file of readdirSync(catalogDir).filter((f) => f.startsWith("skill-") && f.endsWith(".json"))) {
      const rec = JSON.parse(readFileSync(join(catalogDir, file), "utf8"));
      // Podmínkou je ZÁPIS. Schopnost, která jen čte, nemůže udělat
      // nic nevratného — a kontrola rozsahu se má dít často a sama,
      // ne až když si na ni někdo vzpomene. Bez téhle podmínky by
      // brána vyžadovala zámek i na /authorization-check, což by ji
      // proměnilo v překážku správného chování.
      const risky =
        rec.writes === true &&
        (rec.riskLevel === "maintainer" ||
          rec.riskLevel === "owner-authorization" ||
          rec.requiresAuthorization === true);
      if (!risky) continue;
      const skillPath = join(root, ".claude/skills", rec.name, "SKILL.md");
      if (!existsSync(skillPath)) continue; // řeší G2 v katalogu
      if (!/^disable-model-invocation:\s*(true|yes|on|1)\s*$/mi.test(readFileSync(skillPath, "utf8"))) {
        errors.push(
          `CT9: skill "${rec.name}" (${rec.riskLevel}${rec.requiresAuthorization ? ", dotýká se rozsahu" : ""}) ` +
            "nemá disable-model-invocation — Claude by ho mohl spustit mimoděk.",
        );
      }
    }
  }

  // CT7 — jméno je adresa. Dvě vrstvy se stejným jménem znamenají, že
  // uživatel nemůže vědět, co spustil.
  const seen = new Map();
  for (const [layer, names] of [["skill", skillNames], ["agent", agentNames], ["workflow", workflowNames]]) {
    for (const n of names) {
      if (seen.has(n)) errors.push(`CT7: jméno "${n}" používá ${seen.get(n)} i ${layer}.`);
      else seen.set(n, layer);
    }
  }

  return errors;
}

/* ---- běh -------------------------------------------------------------- */

function main() {
  const errors = validate();
  if (errors.length) {
    console.error("Claude tooling neodpovídá repozitáři:");
    for (const e of errors) console.error(`  ${e}`);
    process.exit(1);
  }
  const files = scannedFiles();
  const skills = files.filter((f) => f.endsWith("/SKILL.md")).length;
  const rules = files.filter((f) => f.startsWith(".claude/rules/")).length;
  console.log(
    `Claude tooling OK: ${files.length} souborů zkontrolováno ` +
      `(${rules} pravidel, ${skills} skillů), všechny odkazy vedou někam.`,
  );
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) main();

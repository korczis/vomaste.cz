#!/usr/bin/env node
/*
 * Validuje vzdělávací vrstvu (Start, Bootcamp, Akademie, Příručka, Jak přispět)
 * proti data/learning.toml a data/learning-fixtures.toml.
 *
 * Proč to existuje: kurikulum je graf, a graf se rozbíjí tiše. Lekce, která
 * odkazuje `next` na identifikátor, jenž po přejmenování souboru neexistuje,
 * se v Zole projeví tak, že se prostě nevykreslí odkaz „Pokračovat“ — build
 * zůstane zelený a čtenář skončí ve slepé uličce uprostřed kurzu. Totéž
 * u prerekvizity na smazanou lekci, u cesty, která jmenuje neexistující kód,
 * a u lekce, na kterou nevede vůbec nic.
 *
 * Druhá polovina kontrol hlídá věc, která není kosmetická: cvičná data musí
 * zůstat prokazatelně vymyšlená. Kdyby se do fixtures dostal skutečný člověk
 * nebo reálná doména, měl by web najednou tvrzení o někom bez zdroje a mimo
 * rozsah — přesně to, co AGENTS.md zakazuje. Proto je označení `synthetic`
 * povinné, domény musí být z rezervovaného jmenného prostoru (RFC 2606)
 * a identifikátory z fixtures se nesmějí vyskytnout v kanonických datech.
 *
 * Používá stejný minimalistický čtečkový přístup jako validate-concepts.mjs:
 * čte jen klíče, které kontroluje. Plný TOML parser by sem tahal závislost
 * kvůli deseti regulárním výrazům.
 *
 * Použití: node scripts/dossier/validate-learning.mjs
 * Exit 0 = kurikulum drží; exit 1 = vypsané chyby.
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const LEARNING_TOML = join(ROOT, "data/learning.toml");
const FIXTURES_TOML = join(ROOT, "data/learning-fixtures.toml");
const CONTENT = join(ROOT, "content");

const errors = [];
const err = (msg) => errors.push(msg);

// --- minimální čtení TOML/front matter --------------------------------------
const str = (b, k) => (b.match(new RegExp(`^\\s*${k}\\s*=\\s*"((?:[^"\\\\]|\\\\.)*)"`, "m")) ?? [])[1] ?? null;
const num = (b, k) => {
  const m = b.match(new RegExp(`^\\s*${k}\\s*=\\s*(\\d+)`, "m"));
  return m ? Number(m[1]) : null;
};
const bool = (b, k) => new RegExp(`^\\s*${k}\\s*=\\s*true\\s*$`, "m").test(b);
const list = (b, k) => {
  const m = b.match(new RegExp(`^\\s*${k}\\s*=\\s*\\[([\\s\\S]*?)\\]`, "m"));
  return m ? [...m[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => x[1]) : [];
};
const blocks = (text, name) =>
  [...text.matchAll(new RegExp(`\\[\\[${name}\\]\\]\\n([\\s\\S]*?)(?=\\n\\[\\[|\\n#\\s*-{3,}|\\n*$)`, "g"))].map((m) => m[1]);
const frontMatter = (t) => (t.match(/^\+\+\+\r?\n([\s\S]*?)\r?\n\+\+\+/) ?? [])[1] ?? "";

// --- L1: sekce ---------------------------------------------------------------
const learningText = readFileSync(LEARNING_TOML, "utf8");
const sections = blocks(learningText, "sections").map((b) => ({
  id: str(b, "id"),
  label: str(b, "label"),
  route: str(b, "route"),
  order: num(b, "order"),
  lead: str(b, "lead"),
  icon: str(b, "icon"),
  navChildren: bool(b, "nav_children"),
}));
if (sections.length === 0) err("data/learning.toml: žádná [[sections]].");
const sectionIds = new Set();
for (const s of sections) {
  if (!s.id) { err("data/learning.toml: sekce bez id."); continue; }
  if (sectionIds.has(s.id)) err(`L1 sekce "${s.id}": duplicitní id.`);
  sectionIds.add(s.id);
  for (const k of ["label", "route", "lead", "icon"]) {
    if (!s[k]) err(`L1 sekce "${s.id}": chybí ${k}.`);
  }
  if (s.order === null) err(`L1 sekce "${s.id}": chybí order.`);
  // Route musí existovat na disku — jinak navigace odkáže do prázdna.
  if (s.route) {
    const rel = s.route.replace(/^@\//, "");
    if (!existsSync(join(CONTENT, rel))) err(`L1 sekce "${s.id}": route "${s.route}" neexistuje (content/${rel}).`);
  }
}

// --- L2: úrovně, L3: audience, L4: kategorie příručky ------------------------
const levels = blocks(learningText, "levels").map((b) => ({
  id: str(b, "id"), code: str(b, "code"), label: str(b, "label"), order: num(b, "order"), lead: str(b, "lead"),
}));
const levelIds = new Set();
const levelCodes = new Set();
for (const l of levels) {
  if (!l.id) { err("data/learning.toml: úroveň bez id."); continue; }
  if (levelIds.has(l.id)) err(`L2 úroveň "${l.id}": duplicitní id.`);
  levelIds.add(l.id);
  if (l.code && levelCodes.has(l.code)) err(`L2 úroveň "${l.id}": kód "${l.code}" už používá jiná úroveň.`);
  if (l.code) levelCodes.add(l.code);
  for (const k of ["code", "label", "lead"]) if (!l[k]) err(`L2 úroveň "${l.id}": chybí ${k}.`);
}

const audiences = blocks(learningText, "audiences").map((b) => ({ id: str(b, "id"), label: str(b, "label"), lead: str(b, "lead") }));
const audienceIds = new Set(audiences.map((a) => a.id).filter(Boolean));
for (const a of audiences) {
  if (!a.id) { err("data/learning.toml: audience bez id."); continue; }
  for (const k of ["label", "lead"]) if (!a[k]) err(`L3 audience "${a.id}": chybí ${k}.`);
}

const kbCats = blocks(learningText, "kb_categories").map((b) => ({
  id: str(b, "id"), label: str(b, "label"), lead: str(b, "lead"), icon: str(b, "icon"),
  canonicalElsewhere: str(b, "canonical_elsewhere"),
}));
const kbCatIds = new Set(kbCats.map((c) => c.id).filter(Boolean));
for (const c of kbCats) {
  if (!c.id) { err("data/learning.toml: kategorie příručky bez id."); continue; }
  for (const k of ["label", "lead", "icon"]) if (!c[k]) err(`L4 kategorie "${c.id}": chybí ${k}.`);
  if (c.canonicalElsewhere) {
    const rel = c.canonicalElsewhere.replace(/^@\//, "");
    if (!existsSync(join(CONTENT, rel))) err(`L4 kategorie "${c.id}": canonical_elsewhere "${c.canonicalElsewhere}" neexistuje.`);
  }
}

// --- L5: stránky lekcí -------------------------------------------------------
const lessons = [];
for (const s of sections) {
  const dir = join(CONTENT, s.id);
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".md") && x !== "_index.md")) {
    const fm = frontMatter(readFileSync(join(dir, f), "utf8"));
    lessons.push({
      file: `content/${s.id}/${f}`,
      section: s.id,
      declaredSection: str(fm, "section"),
      recordType: str(fm, "record_type"),
      title: str(fm, "title"),
      description: str(fm, "description"),
      template: str(fm, "template"),
      lessonId: str(fm, "lesson_id"),
      level: str(fm, "level"),
      category: str(fm, "category"),
      minutes: num(fm, "estimated_minutes"),
      audience: list(fm, "audience"),
      objectives: list(fm, "objectives"),
      prerequisites: list(fm, "prerequisites"),
      relatedKb: list(fm, "related_kb"),
      next: str(fm, "next"),
      nextRoute: str(fm, "next_route"),
    });
  }
}

const byId = new Map();
for (const l of lessons) {
  if (l.template !== "learning-lesson.html") {
    err(`L5 ${l.file}: template musí být "learning-lesson.html" (je "${l.template}").`);
  }
  if (l.recordType !== "lesson") err(`L5 ${l.file}: record_type musí být "lesson" (je "${l.recordType}").`);
  if (l.declaredSection !== l.section) {
    err(`L5 ${l.file}: extra.section = "${l.declaredSection}", ale soubor leží v content/${l.section}/.`);
  }
  if (!l.description) err(`L5 ${l.file}: chybí description (jde do náhledu i do karty lekce).`);
  // Cíle se vyžadují u výukových sekcí. Příručka je lookup, ne kurz —
  // „co budeš po téhle stránce umět“ u referenčního přehledu stavů nedává
  // smysl a vynucovat ho by vedlo k vyplňování naprázdno. Místo toho se
  // u ní vyžaduje kategorie, aby stránka měla kam patřit.
  if (l.section !== "prirucka" && l.objectives.length === 0) {
    err(`L5 ${l.file}: chybí objectives — lekce bez cíle je jen text.`);
  }
  if (!l.minutes) err(`L5 ${l.file}: chybí estimated_minutes.`);
  for (const a of l.audience) {
    if (!audienceIds.has(a)) err(`L5 ${l.file}: neznámá audience "${a}".`);
  }
  if (l.level && !levelIds.has(l.level)) err(`L5 ${l.file}: neznámá úroveň "${l.level}".`);
  if (l.category && !kbCatIds.has(l.category)) err(`L5 ${l.file}: neznámá kategorie příručky "${l.category}".`);
  if (l.lessonId) {
    if (byId.has(l.lessonId)) err(`L5 duplicitní lesson_id "${l.lessonId}": ${byId.get(l.lessonId).file} a ${l.file}.`);
    else byId.set(l.lessonId, l);
  }
  // Lekce v Akademii musí mít úroveň — jinak zmizí ze seskupeného indexu.
  if (l.section === "akademie" && !l.level) err(`L5 ${l.file}: lekce Akademie musí deklarovat level.`);
  if (l.section === "prirucka" && !l.category) err(`L5 ${l.file}: stránka Příručky musí deklarovat category.`);
  // Kód lekce musí sedět do úrovně, kterou deklaruje (A2xx patří do A2).
  if (l.lessonId && l.level) {
    const lvl = levels.find((x) => x.id === l.level);
    if (lvl?.code && !l.lessonId.startsWith(lvl.code)) {
      err(`L5 ${l.file}: lesson_id "${l.lessonId}" neodpovídá kódu úrovně "${lvl.code}".`);
    }
  }
}

// --- L6/L7: prerekvizity a řetěz `next` --------------------------------------
for (const l of lessons) {
  for (const p of l.prerequisites) {
    const target = byId.get(p);
    if (!target) err(`L6 ${l.file}: prerekvizita "${p}" neexistuje.`);
    else if (target.section !== l.section) {
      err(`L6 ${l.file}: prerekvizita "${p}" je v jiné sekci (${target.section}) — šablona ji nedohledá.`);
    }
  }
  if (l.next) {
    const target = byId.get(l.next);
    if (!target) err(`L7 ${l.file}: next = "${l.next}" neexistuje.`);
    else if (target.section !== l.section) err(`L7 ${l.file}: next "${l.next}" míří mimo sekci.`);
    else if (target.lessonId === l.lessonId) err(`L7 ${l.file}: next ukazuje sám na sebe.`);
  }
  if (l.nextRoute) {
    const rel = l.nextRoute.replace(/^@\//, "");
    if (!existsSync(join(CONTENT, rel))) err(`L7 ${l.file}: next_route "${l.nextRoute}" neexistuje.`);
  }
  for (const kb of l.relatedKb) {
    if (kb.startsWith("@/")) err(`L8 ${l.file}: related_kb "${kb}" má prefix "@/" — get_page() ho nepřijímá, uveď cestu bez něj.`);
    else if (!existsSync(join(CONTENT, kb))) err(`L8 ${l.file}: related_kb "${kb}" neexistuje.`);
  }
}

// --- L9: learning paths ------------------------------------------------------
const paths = blocks(learningText, "paths").map((b) => ({
  id: str(b, "id"), label: str(b, "label"), audience: str(b, "audience"), lead: str(b, "lead"), lessons: list(b, "lessons"),
}));
for (const p of paths) {
  if (!p.id) { err("data/learning.toml: cesta bez id."); continue; }
  for (const k of ["label", "lead"]) if (!p[k]) err(`L9 cesta "${p.id}": chybí ${k}.`);
  if (p.audience && !audienceIds.has(p.audience)) err(`L9 cesta "${p.id}": neznámá audience "${p.audience}".`);
  if (p.lessons.length === 0) err(`L9 cesta "${p.id}": prázdný seznam lekcí.`);
  for (const lid of p.lessons) {
    if (!byId.has(lid)) err(`L9 cesta "${p.id}": lekce "${lid}" neexistuje.`);
  }
  if (new Set(p.lessons).size !== p.lessons.length) err(`L9 cesta "${p.id}": lekce se v seznamu opakuje.`);
}

// --- L10: osiřelé lekce ------------------------------------------------------
// Lekce je dosažitelná, když na ni ukazuje `next` jiné lekce, je uvedená
// v nějaké cestě, nebo je první ve své sekci (nejnižší weight). Jinak na ni
// nevede z kurzu nic a najde ji jen ten, kdo zná URL.
const pointedTo = new Set(lessons.map((l) => l.next).filter(Boolean));
for (const p of paths) for (const lid of p.lessons) pointedTo.add(lid);
// `next_route` je plnohodnotný odkaz na další lekci — používá se tam, kde
// řetěz přechází přes hranici úrovně nebo sekce, kam `next` nedosáhne
// (šablona hledá cíl jen mezi sourozenci). Vstupní lekce úrovně by bez
// tohohle vypadala jako osiřelá, přestože na ni z předchozí úrovně vede
// odkaz — tedy falešný poplach na chybu, která tam není.
const byPath = new Map(lessons.filter((l) => l.lessonId).map((l) => [l.file, l.lessonId]));
for (const l of lessons) {
  if (!l.nextRoute) continue;
  const target = byPath.get(`content/${l.nextRoute.replace(/^@\//, "")}`);
  if (target) pointedTo.add(target);
}
for (const s of sections) {
  const inSection = lessons.filter((l) => l.section === s.id && l.lessonId);
  if (inSection.length === 0) continue;
  // První lekce sekce je legitimní vstupní bod.
  const entry = inSection.reduce((a, b) => (a.lessonId < b.lessonId ? a : b));
  for (const l of inSection) {
    if (l.lessonId === entry.lessonId) continue;
    if (!pointedTo.has(l.lessonId)) {
      err(`L10 ${l.file}: na lekci "${l.lessonId}" nevede žádný next ani cesta — je nedosažitelná z kurzu.`);
    }
  }
}

// --- L11/L12: cvičná data ----------------------------------------------------
const fixturesText = readFileSync(FIXTURES_TOML, "utf8");
const subjects = blocks(fixturesText, "subjects").map((b) => ({ id: str(b, "id"), label: str(b, "label"), synthetic: bool(b, "synthetic") }));
if (subjects.length === 0) err("data/learning-fixtures.toml: žádné [[subjects]].");
for (const s of subjects) {
  if (!s.synthetic) err(`L11 cvičný subjekt "${s.id}": chybí synthetic = true. Cvičná data musí být prokazatelně vymyšlená.`);
}
const fxSources = blocks(fixturesText, "sources").map((b) => ({ id: str(b, "id"), url: str(b, "url"), synthetic: bool(b, "synthetic") }));
// RFC 2606 / RFC 6761 rezervují .example a example.com přesně na tohle:
// cvičný odkaz nesmí trefit cizí web.
const RESERVED = /^https?:\/\/[^/]*(\.example|(^|\.)example\.(com|net|org))(\/|$)/;
for (const s of fxSources) {
  if (!s.synthetic) err(`L11 cvičný zdroj "${s.id}": chybí synthetic = true.`);
  if (s.url && !RESERVED.test(s.url)) {
    err(`L11 cvičný zdroj "${s.id}": URL "${s.url}" není v rezervovaném jmenném prostoru (.example / example.com).`);
  }
}

// Odpovědi klasifikačního cvičení musí odpovídat stavům, které web opravdu má.
// Nový stav tak nemůže vzniknout, aniž by se opravila cvičení.
const STATUS_PAGES = {
  overeno: "koncepty/stav-overeno-vice-zdroji.md",
  "jeden-zdroj": "koncepty/stav-jeden-zdroj.md",
  citace: "koncepty/stav-citace.md",
  sporne: "koncepty/stav-sporne.md",
  nazor: "koncepty/stav-nazor.md",
};
for (const b of blocks(fixturesText, "classification")) {
  const id = str(b, "id");
  const answer = str(b, "answer");
  if (!answer) { err(`L12 cvičení "${id}": chybí answer.`); continue; }
  const page = STATUS_PAGES[answer];
  if (!page) err(`L12 cvičení "${id}": odpověď "${answer}" neodpovídá žádnému stavu tvrzení.`);
  else if (!existsSync(join(CONTENT, page))) err(`L12 cvičení "${id}": stránka stavu "${page}" neexistuje.`);
  if (!str(b, "explanation")) err(`L12 cvičení "${id}": chybí explanation — cvičení bez vysvětlení netrénuje.`);
}
const GAP_ANSWERS = new Set(["tvrzeni", "mezera", "nepublikovat"]);
for (const b of blocks(fixturesText, "gapdrill")) {
  const a = str(b, "answer");
  if (!GAP_ANSWERS.has(a)) err(`L12 gapdrill "${str(b, "id")}": neznámá odpověď "${a}".`);
}
const SCOPE_ANSWERS = new Set(["bezpecne", "review", "autorizace"]);
for (const b of blocks(fixturesText, "scopedrill")) {
  const a = str(b, "answer");
  if (!SCOPE_ANSWERS.has(a)) err(`L12 scopedrill "${str(b, "id")}": neznámá odpověď "${a}".`);
}

// --- L13: cvičná data se nesmí objevit v kanonických datech ------------------
// Tohle je ta kontrola, kvůli které tenhle validátor stojí za to. Kdyby se
// cvičný subjekt dostal do data/dossiers/**, měl by web záznam o „osobě“,
// která neexistuje, mimo jakýkoli rozsah a bez zdroje.
const DOSSIERS = join(ROOT, "data/dossiers");
if (existsSync(DOSSIERS)) {
  const needles = subjects.map((s) => s.id).filter(Boolean);
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".json")) {
        const t = readFileSync(p, "utf8");
        for (const n of needles) {
          if (t.includes(n)) err(`L13 ${p.replace(ROOT + "/", "")}: obsahuje cvičný identifikátor "${n}". Cvičná data nepatří do kanonického datasetu.`);
        }
      }
    }
  };
  walk(DOSSIERS);
}

// --- výsledek ----------------------------------------------------------------
if (errors.length > 0) {
  console.log("Vzdělávací vrstva — nalezené chyby:\n");
  for (const e of errors) console.log(`  ✗ ${e}`);
  console.log(`\n${errors.length} chyb(a).`);
  process.exit(1);
}

const perSection = sections
  .map((s) => `${s.label}: ${lessons.filter((l) => l.section === s.id).length}`)
  .join(", ");
console.log(
  `OK — vzdělávací vrstva: ${sections.length} sekcí (${perSection}), ` +
    `${levels.length} úrovní, ${audiences.length} audience, ${paths.length} cest, ` +
    `${kbCats.length} kategorií příručky, ${subjects.length} cvičných subjektů. ` +
    `Prerekvizity, řetězy next, cesty i odkazy na kanonické pojmy vedou na existující stránky.`,
);

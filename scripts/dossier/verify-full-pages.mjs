#!/usr/bin/env node
// Full-page doktrína (závazná i pro adoptery/forky): každé tvrzení a
// každý zdroj je plnohodnotná stránka, ne stub — renderovaná ze
// strukturovaných dat (žádná druhá ručně psaná reprezentace).
//
// Běží po `zola build` nad public/ a shodí build, pokud:
//  - stránka tvrzení (claims/clm-*/index.html) nemá sekci citovaných
//    zdrojů (id="clm-sources-h") nebo Git provenance odkaz;
//  - stránka zdroje (sources/src-*/index.html) nemá metadata tabulku
//    (řádek „Odkaz“), sekci podporovaných tvrzení (id="src-claims-h")
//    — s výjimkou záměrně kontextových zdrojů bez tvrzení — nebo Git
//    provenance odkaz.
// Zdrojová strana téže doktríny (povinná pole + minimální editorial
// body zdroje) žije ve validate-dossier.mjs; JSON-LD strana (citační
// uzel na každé stránce zdroje, Claim uzel na každé stránce tvrzení)
// ve verify-jsonld.mjs.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const PUB = join(ROOT, "public");

let errors = 0;
const err = (m) => { errors++; console.error("  ERROR " + m); };

function* walk(d) {
  for (const n of readdirSync(d)) {
    const f = join(d, n);
    if (statSync(f).isDirectory()) yield* walk(f);
    else if (n === "index.html") yield f;
  }
}

let claims = 0, sources = 0;
for (const f of walk(PUB)) {
  const rel = f.slice(PUB.length + 1);
  const isClaim = /\/claims\/clm-\d+\/index\.html$/.test(rel);
  const isSource = /\/sources\/src-\d+\/index\.html$/.test(rel);
  if (!isClaim && !isSource) continue;
  const h = readFileSync(f, "utf8");
  const hasProvenance = h.includes("historie změn tohoto záznamu");
  if (isClaim) {
    claims++;
    if (!h.includes('id="clm-sources-h"') && !h.includes("id=clm-sources-h"))
      err(`${rel}: stránka tvrzení bez sekce citovaných zdrojů — není full page.`);
    if (!hasProvenance) err(`${rel}: stránka tvrzení bez Git provenance odkazu.`);
  } else {
    sources++;
    if (!h.includes("Odkaz")) err(`${rel}: stránka zdroje bez metadata tabulky (řádek Odkaz).`);
    const hasClaimsSection = h.includes('id="src-claims-h"') || h.includes("id=src-claims-h");
    // Kontextové zdroje (claims = []) sekci nemají — legitimní, pokud to
    // body stránky vysvětluje (vynuceno min. délkou ve validate-dossier).
    if (!hasClaimsSection && !/kontext|komentář|názor|nepodporuje|nepodkládá/i.test(h))
      err(`${rel}: stránka zdroje nemá sekci podporovaných tvrzení ani vysvětlenou kontextovou roli.`);
    if (!hasProvenance) err(`${rel}: stránka zdroje bez Git provenance odkazu.`);
  }
}

if (claims === 0 || sources === 0)
  err(`nenalezeny žádné claim/source stránky (claims=${claims}, sources=${sources}) — špatná cesta, nebo build neproběhl.`);

if (errors) {
  console.error(`\n✗ Full-page doktrína porušena (${errors} nálezů). Každé tvrzení a každý zdroj musí být plnohodnotná stránka — viz AGENTS.md.`);
  process.exit(1);
}
console.log(`OK — full-page doktrína: ${claims} stránek tvrzení a ${sources} stránek zdrojů má zdroje/tvrzení, metadata i Git provenance.`);

// ---- Přehledové řádky tvrzení se skutečně renderují jako tabulka.
// Parita řádek se záznamy je datové pravidlo (T1–T3 ve
// validate-registry-table.mjs), jenže to čte kanonický model, kde je
// tabulka jen řetězec markdownu — nevidí, KAM v něm řádka padla. Když
// se řádka ocitne mimo tělo tabulky (nad hlavičkou `| ID | Tvrzení | …`,
// nebo v sekci, která žádnou hlavičku nemá), markdown ji vysází jako
// odstavec s rourami: parita dál platí, čtenář místo tabulky vidí
// slepenec textu. Přesně to se stalo 14 z 22 dossierů a žádná brána to
// nezachytila, protože zdrojová data byla v pořádku. Tahle kontrola se
// proto dívá na HOTOVÉ HTML — na to, co čtenář opravdu dostane.
//
// Dossier smí mít tabulek víc (andrej-babis rozpadá registr na tabulku
// per kauzu), takže se nekontroluje jedna konkrétní sekce, ale celá
// stránka: každá kotva `clm-##` musí ležet uvnitř nějakého <table> a
// dohromady jich musí být tolik, kolik má dossier vygenerovaných
// stránek tvrzení.
const DOS = join(PUB, "dossiers");
let tableErrors = 0;
let checkedTables = 0;
for (const slug of readdirSync(DOS)) {
  if (!statSync(join(DOS, slug)).isDirectory()) continue;
  let h;
  try {
    h = readFileSync(join(DOS, slug, "index.html"), "utf8");
  } catch {
    continue;
  }

  let pageCount = 0;
  try {
    pageCount = readdirSync(join(DOS, slug, "claims")).filter((n) => /^clm-\d+$/.test(n)).length;
  } catch {
    pageCount = 0;
  }
  if (pageCount === 0) continue; // entitní projekce bez vlastních záznamů

  const anchor = /id=["']?(clm-\d+)["']?/g;
  const inTable = new Set();
  const outside = new Set();
  // Tabulkové oblasti hotového HTML; kotva mimo ně = řádka, kterou
  // markdown nevysázel do tabulky.
  const ranges = [...h.matchAll(/<table\b[\s\S]*?<\/table>/gi)].map((m) => [m.index, m.index + m[0].length]);
  for (const m of h.matchAll(anchor)) {
    const at = m.index;
    (ranges.some(([s, e]) => at >= s && at < e) ? inTable : outside).add(m[1]);
  }

  checkedTables++;
  if (outside.size) {
    tableErrors++;
    const list = [...outside].sort().slice(0, 8).join(", ");
    console.error(
      `  ERROR dossiers/${slug}/: ${outside.size} řádek tvrzení se nerenderuje uvnitř tabulky (${list}${outside.size > 8 ? ", …" : ""}) — řádka v dossier.json nejspíš stojí nad hlavičkou tabulky nebo v sekci bez hlavičky.`,
    );
  } else if (inTable.size !== pageCount) {
    tableErrors++;
    console.error(
      `  ERROR dossiers/${slug}/: přehledové tabulky mají ${inTable.size} řádek, ale dossier má ${pageCount} stránek tvrzení.`,
    );
  }
}
if (tableErrors) {
  console.error(`\n✗ Přehledové tabulky tvrzení (${tableErrors} nálezů) — viz AGENTS.md „Two representations, one source of truth".`);
  process.exit(1);
}
console.log(`OK — přehledové tabulky tvrzení: ${checkedTables} dossierů sází každou řádku uvnitř tabulky, v úplném počtu.`);

// ---- Flowbite doktrína (AGENTS.md): utility-first šablony bez inline
// stylů. Jediná povolená výjimka by musela mít odůvodnění v allowlistu
// níže (dnes prázdný). Kontroluje ZDROJOVÉ šablony, ne výstup.
const TPL_DIR = join(ROOT, "templates");
const STYLE_ALLOWLIST = new Set([]); // "soubor.html:radek" + důvod v komentáři
let styleHits = 0;
for (const f of readdirSync(TPL_DIR)) {
  if (!f.endsWith(".html")) continue;
  const lines = readFileSync(join(TPL_DIR, f), "utf8").split("\n");
  lines.forEach((l, i) => {
    if (l.includes(' style="') && !STYLE_ALLOWLIST.has(`${f}:${i + 1}`)) {
      styleHits++;
      console.error(`  ERROR templates/${f}:${i + 1}: inline style — Flowbite doktrína vyžaduje utility třídy/CSS vrstvu.`);
    }
  });
}
if (styleHits) process.exit(1);
console.log("OK — Flowbite doktrína: žádný inline style v šablonách.");

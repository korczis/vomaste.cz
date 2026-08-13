#!/usr/bin/env node
/*
 * Kontrakt komponenty — staticky, bez buildu.
 *
 * PROČ EXISTUJE
 * -------------
 * 2026-08-13 prošly na živý web dvě chyby, které měly společné jen to,
 * jak se projevily: komponenta se vyrenderovala, build byl zelený, HTML
 * validní — a obsah chyběl nebo byl nesmyslný.
 *
 *   98 stránek mělo prázdné tělo calloutu. Parametr se přejmenoval na
 *   `text`, tělo dál vypisovalo `body`, a `| safe` na tom řádku spolklo
 *   chybu, kterou by Tera jinak ohlásila.
 *
 *   2728 stránek tisklo doslovné `-1`. Default se změnil na
 *   `integer = -1`, guard dál porovnával s `""`, a číslo se nikdy
 *   nerovná prázdnému řetězci.
 *
 * Ani jeden ze 47 kroků `npm run build` je nezachytil. Obě se našly
 * auditem, ne branou.
 *
 * PROČ STATICKY A NE NAD `public/`
 * --------------------------------
 * Post-build kontrola najde následek. Tahle najde příčinu, o dvě minuty
 * dřív, a řekne rovnou který řádek které komponenty. Navíc funguje
 * v čerstvém worktree, kde `public/` ještě není.
 *
 * CO KONTROLUJE
 * -------------
 *   TC1  `| safe` na holém identifikátoru, který NENÍ deklarovaný
 *        parametr komponenty ani lokální proměnná. Tohle je přesná
 *        podoba chyby s calloutem: `| safe` vypíná Teřinu kontrolu
 *        nedefinované proměnné, takže `{{ body | safe }}` se postaví
 *        a nevypíše nic, zatímco `{{ body }}` by build shodilo.
 *
 *   TC2  parametr deklarovaný v hlavičce `{% component %}` a nikde
 *        v těle nepřečtený. Volající mu předává hodnotu, která se
 *        zahodí — a je to neviditelné, protože je to syntakticky
 *        v pořádku.
 *
 *   TC3  guard `{% if x.a %}`, jehož tělo čte JINÉ pole téhož objektu
 *        (`x.b`) a `x.a` ani jednou. Tohle je jiný tvar téže chyby:
 *        podmínka se ptá na jedno pole, obsah renderuje druhé, a když
 *        se rozejdou, zůstane popisek nad prázdnem.
 *
 *        Záměrně se NEhlásí `{% if searchable %}class="x"{% endif %}` —
 *        podmíněný atribut je legitimní vzor, kde tělo testovanou
 *        hodnotu číst nemá. První verze téhle kontroly ho hlásila
 *        a vyrobila 29 falešných poplachů na 31 nálezů; kontrola,
 *        která takhle křičí, se vypne a pak nehlídá nic.
 *
 * CO ZÁMĚRNĚ NEKONTROLUJE
 * -----------------------
 * `| safe` na výrazu (`{{ x | markdown | safe }}`, `{{ a ~ b | safe }}`)
 * — tam je autor vědomě v HTML kontextu a identifikátor už prošel
 * filtrem, takže by nedefinovanost spadla dřív. Kontroluje se jen holý
 * identifikátor, což je ta jediná podoba, která tiše mizí.
 *
 * Usage: node scripts/lint/lint-template-contracts.mjs
 * Exit 0 = žádný nález; 1 = nález.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const TEMPLATES = join(ROOT, "templates");

/* ---- čtení stromu ------------------------------------------------------ */

export function templateFiles(dir = TEMPLATES) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const abs = join(dir, name);
    if (statSync(abs).isDirectory()) return templateFiles(abs);
    return name.endsWith(".html") ? [abs] : [];
  });
}

/* ---- parsování komponent ---------------------------------------------- */

// `{% component jmeno(a, b="", c: integer = -1) -%}` … `{% endcomponent %}`
const COMPONENT_RE = /\{%-?\s*component\s+([a-z_][a-z0-9_]*)\s*\(([\s\S]*?)\)\s*-?%\}/g;
const END_RE = /\{%-?\s*endcomponent\s*-?%\}/g;

// Rozdělí seznam parametrů na jména. Default může obsahovat čárku
// (`x=["a","b"]`), takže se nedělí naivně — počítá se hloubka závorek.
export function paramNames(signature) {
  const names = [];
  let depth = 0;
  let current = "";
  for (const ch of signature) {
    if ("([{".includes(ch)) depth++;
    else if (")]}".includes(ch)) depth--;
    if (ch === "," && depth === 0) {
      names.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  names.push(current);
  return names
    .map((p) => p.trim().split(/[:=]/)[0].trim())
    .filter((p) => /^[a-z_][a-z0-9_]*$/.test(p));
}

export function parseComponents(text) {
  const out = [];
  COMPONENT_RE.lastIndex = 0;
  for (const m of text.matchAll(COMPONENT_RE)) {
    const bodyStart = m.index + m[0].length;
    END_RE.lastIndex = bodyStart;
    const end = END_RE.exec(text);
    out.push({
      name: m[1],
      params: paramNames(m[2]),
      body: text.slice(bodyStart, end ? end.index : text.length),
      line: text.slice(0, m.index).split("\n").length,
    });
  }
  return out;
}

/* ---- pomocné ----------------------------------------------------------- */

// Proměnné, které Tera/Zola dodává sama. `body` tu ZÁMĚRNĚ NENÍ:
// je legitimní jen v komponentě, kterou někdo volá párově. Když se
// komponenta volá výhradně self-closing, je její `body` vždycky prázdné
// a `{{ body | safe }}` v ní tiše nevypíše nic — přesně tak zmizel
// obsah calloutu z 98 stránek. O legitimitě proto rozhoduje volání,
// ne definice.
const AMBIENT = new Set([
  "loop", "self", "config", "page", "section", "term", "taxonomy",
  "lang", "current_path", "current_url", "__tera_context",
]);

// Které komponenty někdo volá PÁROVĚ: `{% <jmeno …> %}` … `{% </jmeno> %}`.
export function pairedCalls(texts) {
  const names = new Set();
  for (const t of texts) {
    for (const m of t.matchAll(/\{%-?\s*<\/([a-z_][a-z0-9_]*)\s*>?\s*-?%\}/g)) names.add(m[1]);
  }
  return names;
}

// `{% set x = … %}` a `{% for x in … %}` zavádějí lokální jména.
export function localNames(body) {
  const names = new Set();
  for (const m of body.matchAll(/\{%-?\s*set\s+([a-z_][a-z0-9_]*)\s*=/g)) names.add(m[1]);
  for (const m of body.matchAll(/\{%-?\s*for\s+([a-z_][a-z0-9_,\s]*?)\s+in\s/g)) {
    for (const n of m[1].split(",")) names.add(n.trim());
  }
  return names;
}

// `{{ jmeno | safe }}` — jen holý identifikátor, žádný výraz, žádná cesta.
export function bareSafeIdentifiers(body) {
  return [...body.matchAll(/\{\{-?\s*([a-z_][a-z0-9_]*)\s*\|\s*safe\s*-?\}\}/g)].map((m) => m[1]);
}

// Čte tělo identifikátor? Hledá `x`, `x.y`, `x[`, `x |`, ale ne `xy`.
export function readsIdentifier(body, name) {
  return new RegExp(`(^|[^A-Za-z0-9_.])${name}([^A-Za-z0-9_]|$)`).test(body);
}

/* ---- kontroly ---------------------------------------------------------- */

export function lint(root = ROOT) {
  const errors = [];
  const files = templateFiles(join(root, "templates"));
  const paired = pairedCalls(files.map((f) => readFileSync(f, "utf8")));

  for (const abs of files) {
    const rel = relative(root, abs);
    const text = readFileSync(abs, "utf8");

    for (const c of parseComponents(text)) {
      const known = new Set([...c.params, ...localNames(c.body), ...AMBIENT]);
      // `body` je známé jméno jen tam, kde komponentu někdo volá párově.
      if (paired.has(c.name)) known.add("body");

      // TC1 — `| safe` na jménu, které komponenta nezná.
      for (const id of bareSafeIdentifiers(c.body)) {
        if (known.has(id)) continue;
        errors.push(
          `TC1 ${rel}:${c.line} komponenta "${c.name}": \`{{ ${id} | safe }}\` — ` +
            (id === "body"
              ? `komponenta se nikde nevolá párově, takže její \`body\` je vždycky prázdné. `
              : `"${id}" není deklarovaný parametr ani lokální proměnná. `) +
            "`| safe` vypíná kontrolu nedefinované proměnné, takže se tohle postaví a nevypíše NIC.",
        );
      }

      // TC2 — deklarovaný a nepřečtený parametr.
      for (const p of c.params) {
        if (readsIdentifier(c.body, p)) continue;
        errors.push(
          `TC2 ${rel}:${c.line} komponenta "${c.name}": parametr "${p}" je deklarovaný, ` +
            "ale tělo ho nikdy nečte — hodnota od volajícího se zahodí.",
        );
      }
    }

    // TC3 — guard se ptá na jedno pole, tělo renderuje jiné.
    for (const g of guards(text)) {
      if (g.body.includes(g.condition)) continue; // tělo testovanou cestu čte — v pořádku
      const siblings = siblingBranches(g.body, g.condition);
      if (!siblings.length) continue; // tělo objekt nečte vůbec (podmíněný atribut) — není nález
      errors.push(
        `TC3 ${rel}:${g.line} \`{% if ${g.condition} %}\` — tělo tuhle cestu nikdy nečte, ` +
          `zato čte ${siblings.slice(0, 3).map((x) => `\`${x}\``).join(", ")}. ` +
          "Podmínka se ptá na jedno pole a obsah renderuje druhé; když se rozejdou, zůstane popisek nad prázdnem.",
      );
    }
  }

  return errors;
}

// Guard na TEČKOVANOU cestu (`x.a`). Prostý `{% if flag %}` se
// nesleduje — podmíněný atribut je legitimní vzor, kde tělo hodnotu
// číst nemá, a hlásit ho znamená utopit skutečné nálezy v šumu.
//
// Složené podmínky se přeskakují taky: u nich je „co má tělo číst"
// nejednoznačné a hádat by znamenalo falešné poplachy.
// Tělo guardu končí na JEHO `endif`, ne na prvním, který se namane.
// Vnořené `{% if %}` se počítají — bez toho se tělo uřízne u vnitřní
// podmínky a kontrola ohlásí, že vnější guard svou hodnotu nečte,
// přestože ji čte o pár řádků níž. Přesně to se stalo při prvním běhu
// na dvou evidence šablonách.
export function guardBody(text, from) {
  const token = /\{%-?\s*(if|endif|else|elif)\b/g;
  token.lastIndex = from;
  let depth = 0;
  for (const t of textTokens(text, token)) {
    const kind = t.kind;
    if (kind === "if") depth++;
    else if (kind === "endif") {
      if (depth === 0) return text.slice(from, t.index);
      depth--;
    } else if ((kind === "else" || kind === "elif") && depth === 0) {
      return text.slice(from, t.index);
    }
  }
  return null;
}

function* textTokens(text, re) {
  let m;
  while ((m = re.exec(text)) !== null) yield { kind: m[1], index: m.index };
}

export function guards(text) {
  const out = [];
  // Filtr v podmínce se připouští: `{% if x.a | default(value=[]) %}`
  // je běžný tvar a první verze ho minula — právě ten guard nechal
  // popisek nad prázdnem na 514 stránkách entit.
  const re = /\{%-?\s*if\s+([a-z_][a-z0-9_]*(?:\.[a-z_][a-z0-9_]*)+)\s*(?:\|[^%]*?)?-?%\}/gi;
  for (const m of text.matchAll(re)) {
    const body = guardBody(text, m.index + m[0].length);
    if (body === null) continue;
    out.push({
      condition: m[1],
      root: m[1].split(".")[0],
      body,
      line: text.slice(0, m.index).split("\n").length,
    });
  }
  return out;
}

// Čte tělo jinou větev téhož objektu než ta, na kterou se ptá guard?
// `{% if v.provenance.discoveredVia %}` + `v.provenanceResolved.…`
// v těle = přesně ten tvar, který nechal popisek nad prázdnem na 514
// stránkách entit.
// Hledá se jeden konkrétní tvar, ne každá odlišnost: tělo čte
// ROZVĚTVENOU verzi téhož pole. `view.provenance.x` v podmínce a
// `view.provenanceResolved.x` v těle — druhý segment jednoho je
// prefixem druhého. Přesně tak vznikl popisek nad prázdnem na 514
// stránkách entit: guard se ptal na surová id, tělo renderovalo
// resolvovaná, a když se resolve nepovedl, zůstal nadpis.
//
// Je to heuristika laděná na pozorovaný tvar chyby, ne důkaz. Bez ní
// kontrola hlásí i legitimní `{% if section.extra.show_paths %}`
// s obsahem ze `section.pages`, což je příznak řídící jiný obsah —
// běžný a správný vzor.
export function siblingBranches(body, condition) {
  const parts = condition.split(".");
  const root = parts[0];
  const guardSecond = parts[1] ?? "";
  const found = new Set();
  for (const m of body.matchAll(new RegExp(`\\b${root}(\\.[a-z_][a-z0-9_]*)+`, "gi"))) {
    if (m[0] === condition) continue;
    const second = m[0].split(".")[1] ?? "";
    if (second === guardSecond) continue;
    const branched =
      second.length !== guardSecond.length &&
      (second.startsWith(guardSecond) || guardSecond.startsWith(second));
    if (branched) found.add(m[0]);
  }
  return [...found];
}

/* ---- běh --------------------------------------------------------------- */

function main() {
  const errors = lint();
  if (errors.length) {
    console.error(`Kontrakt komponent porušen (${errors.length}):`);
    for (const e of errors) console.error(`  ${e}`);
    console.error(
      "\nVšechny tři kontroly hlídají jednu věc: obsah, který se ztratí, aniž by " +
        "cokoli spadlo. Build zůstane zelený a stránka vyjde validní a prázdná.",
    );
    process.exit(1);
  }
  const n = templateFiles().length;
  console.log(`Kontrakt komponent OK: ${n} šablon, žádný nepřečtený parametr ani osiřelý guard.`);
}

const isMain = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isMain) main();

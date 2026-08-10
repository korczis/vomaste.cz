#!/usr/bin/env node
/*
 * Čtečka `data/seo.toml` pro Node vrstvu (validátor `verify-og.mjs`).
 *
 * PROČ vlastní parser: repozitář nemá TOML závislost a nechce ji mít
 * (`npm test` běží na built-in test runneru, žádná nová dependency —
 * viz README, tabulka příkazů). Ostatní čtečky TOML v `scripts/**` jsou
 * jednoúčelové regexy nad známým tvarem souboru; tahle je stejného
 * druhu, jen pokrývá celou podmnožinu, kterou `data/seo.toml` používá,
 * a její chování je pokryté testy (`seo-config.test.mjs`).
 *
 * Podporovaná podmnožina TOML — záměrně přesně tolik, kolik soubor
 * potřebuje, aby parser nepředstíral obecnost, kterou nemá:
 *   [tabulka] · [tabulka.podtabulka] · [tabulka."klíč.s.tečkou"]
 *   klic = "řetězec"  ·  klic = 123  ·  klic = true/false
 *   klic = ["a", "b"] (i víceřádkově)
 *   komentáře # mimo řetězec, prázdné řádky
 * Cokoli jiného je tvrdá chyba, ne tiché přeskočení — jinak by se
 * konfigurace mohla rozejít s tím, co čte Zola (`load_data`).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

export function parseToml(text, label = "seo.toml") {
  const root = {};
  let current = root;
  let pendingKey = null;
  let pendingArray = null;
  const lines = text.split(/\r?\n/);

  for (const [i, rawLine] of lines.entries()) {
    const where = `${label}:${i + 1}`;
    const line = stripComment(rawLine, where).trim();
    if (line === "") continue;

    if (pendingArray) {
      const closed = consumeArrayChunk(pendingArray, line, where);
      if (closed) {
        current[pendingKey] = pendingArray.values;
        pendingKey = null;
        pendingArray = null;
      }
      continue;
    }

    if (line.startsWith("[")) {
      if (!line.endsWith("]")) throw new Error(`${where}: nedokončená hlavička tabulky "${line}".`);
      if (line.startsWith("[[")) throw new Error(`${where}: pole tabulek [[…]] není v seo.toml podporované.`);
      current = descend(root, splitTableKey(line.slice(1, -1), where), where);
      continue;
    }

    const eq = indexOfTopLevelEquals(line);
    if (eq === -1) throw new Error(`${where}: řádek není ani tabulka, ani přiřazení: "${line}".`);
    const key = unquoteKey(line.slice(0, eq).trim(), where);
    const rawValue = line.slice(eq + 1).trim();

    if (rawValue.startsWith("[")) {
      const acc = { values: [], done: false };
      const closed = consumeArrayChunk(acc, rawValue.slice(1), where);
      if (closed) {
        current[key] = acc.values;
      } else {
        pendingKey = key;
        pendingArray = acc;
      }
      continue;
    }
    current[key] = scalar(rawValue, where);
  }

  if (pendingArray) throw new Error(`${label}: neuzavřené pole u klíče "${pendingKey}".`);
  return root;
}

function stripComment(line, where) {
  let inString = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === "\\" && inString) { i++; continue; }
    if (ch === '"') inString = !inString;
    else if (ch === "#" && !inString) return line.slice(0, i);
  }
  if (inString) throw new Error(`${where}: neuzavřený řetězec.`);
  return line;
}

function indexOfTopLevelEquals(line) {
  let inString = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === "\\" && inString) { i++; continue; }
    if (ch === '"') inString = !inString;
    else if (ch === "=" && !inString) return i;
  }
  return -1;
}

// [a.b."c.d"] → ["a", "b", "c.d"]
function splitTableKey(raw, where) {
  const parts = [];
  let buf = "";
  let inString = false;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (ch === '"') { inString = !inString; buf += ch; continue; }
    if (ch === "." && !inString) { parts.push(buf); buf = ""; continue; }
    buf += ch;
  }
  parts.push(buf);
  if (inString) throw new Error(`${where}: neuzavřený řetězec v hlavičce tabulky.`);
  return parts.map((p) => unquoteKey(p.trim(), where));
}

function unquoteKey(key, where) {
  if (key === "") throw new Error(`${where}: prázdný klíč.`);
  if (key.startsWith('"')) {
    if (!key.endsWith('"') || key.length < 2) throw new Error(`${where}: neuzavřený klíč v uvozovkách.`);
    return key.slice(1, -1);
  }
  if (!/^[A-Za-z0-9_-]+$/.test(key)) throw new Error(`${where}: nepodporovaný klíč "${key}".`);
  return key;
}

function descend(root, parts, where) {
  let node = root;
  for (const part of parts) {
    if (node[part] === undefined) node[part] = {};
    if (typeof node[part] !== "object" || Array.isArray(node[part]))
      throw new Error(`${where}: klíč "${part}" už je hodnota, nemůže být tabulka.`);
    node = node[part];
  }
  return node;
}

// Vrací true, když se v tomhle kusu textu pole uzavřelo.
function consumeArrayChunk(acc, chunk, where) {
  let rest = chunk;
  const close = findArrayClose(rest, where);
  if (close !== -1) rest = rest.slice(0, close);
  for (const item of splitTopLevel(rest)) {
    const trimmed = item.trim();
    if (trimmed === "") continue;
    acc.values.push(scalar(trimmed, where));
  }
  return close !== -1;
}

function findArrayClose(chunk, where) {
  let inString = false;
  for (let i = 0; i < chunk.length; i++) {
    const ch = chunk[i];
    if (ch === "\\" && inString) { i++; continue; }
    if (ch === '"') inString = !inString;
    else if (ch === "]" && !inString) return i;
    else if (ch === "[" && !inString) throw new Error(`${where}: vnořená pole nejsou podporovaná.`);
  }
  return -1;
}

function splitTopLevel(chunk) {
  const out = [];
  let buf = "";
  let inString = false;
  for (let i = 0; i < chunk.length; i++) {
    const ch = chunk[i];
    if (ch === "\\" && inString) { buf += ch + (chunk[++i] ?? ""); continue; }
    if (ch === '"') { inString = !inString; buf += ch; continue; }
    if (ch === "," && !inString) { out.push(buf); buf = ""; continue; }
    buf += ch;
  }
  out.push(buf);
  return out;
}

function scalar(raw, where) {
  if (raw.startsWith('"')) {
    if (!raw.endsWith('"') || raw.length < 2) throw new Error(`${where}: neuzavřený řetězec ${raw}.`);
    return raw.slice(1, -1).replace(/\\(.)/g, "$1");
  }
  if (raw === "true") return true;
  if (raw === "false") return false;
  if (/^-?\d+$/.test(raw)) return Number(raw);
  throw new Error(`${where}: nepodporovaná hodnota "${raw}" (podporované: řetězec, celé číslo, true/false, pole).`);
}

/*
 * Tvarová brána nad rozparsovaným souborem. Chybějící klíč je tvrdá
 * chyba už tady, ne až `undefined` uprostřed validace — jinak by se
 * překlep v `data/seo.toml` projevil jako „všechno prošlo".
 */
export function assertSeoShape(seo) {
  const need = (path, type) => {
    const value = path.split(".").reduce((n, k) => (n === undefined ? undefined : n[k]), seo);
    if (value === undefined) throw new Error(`data/seo.toml: chybí "${path}".`);
    const actual = Array.isArray(value) ? "array" : typeof value;
    if (actual !== type) throw new Error(`data/seo.toml: "${path}" má být ${type}, je ${actual}.`);
    return value;
  };
  for (const key of ["locale", "twitter_card", "twitter_card_without_image", "og_image", "og_image_alt", "og_image_type"])
    need(`site.${key}`, "string");
  for (const key of ["og_image_width", "og_image_height"]) need(`site.${key}`, "number");
  need("site.alternate_locales", "array");
  need("title.separator", "string");
  need("title.tagline", "string");
  need("title.dossier_disambiguation", "boolean");
  need("description.dossier_suffix", "string");
  for (const key of ["title_max", "title_min", "description_max", "description_min"]) need(`limits.${key}`, "number");
  need("enforce.required_og", "array");
  need("enforce.required_twitter", "array");
  need("enforce.without_canonical", "array");
  need("dossier_image.path_template", "string");
  need("dossier_image.alt_template", "string");
  need("dossier_image.alt_fallback", "string");
  const types = need("page_types", "object");
  if (!types.default) throw new Error(`data/seo.toml: page_types musí obsahovat "default" (fallback pro neznámý record_type).`);
  for (const [id, entry] of Object.entries(types)) {
    if (typeof entry.og_type !== "string" || entry.og_type === "")
      throw new Error(`data/seo.toml: page_types."${id}" nemá og_type.`);
    if (typeof entry.seo_type !== "string" || entry.seo_type === "")
      throw new Error(`data/seo.toml: page_types."${id}" nemá seo_type.`);
  }
  if (seo.limits.title_min < 1 || seo.limits.description_min < 1)
    throw new Error(`data/seo.toml: minimální délky musí být aspoň 1 — prázdný titulek/popis je vždy chyba.`);
  if (seo.limits.title_max < seo.limits.title_min || seo.limits.description_max < seo.limits.description_min)
    throw new Error(`data/seo.toml: maximum nesmí být menší než minimum.`);
  return seo;
}

export function loadSeoConfig(root) {
  const file = join(root, "data/seo.toml");
  return assertSeoShape(parseToml(readFileSync(file, "utf8"), "data/seo.toml"));
}

// base_url z config.toml — jediný zdroj, ze kterého `get_url()` skládá
// absolutní URL; validátor ho potřebuje jen na kontrolu, že og:image
// není relativní.
export function readBaseUrl(root) {
  const text = readFileSync(join(root, "config.toml"), "utf8");
  const m = text.match(/^base_url\s*=\s*"([^"]+)"/m);
  if (!m) throw new Error("config.toml: chybí base_url.");
  return m[1].replace(/\/$/, "");
}

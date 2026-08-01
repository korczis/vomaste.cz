#!/usr/bin/env node
/*
 * Parity/determinismus helper (T-028 fáze G): SHA-256 manifest celého
 * adresářového stromu — jeden řádek "<sha256>  <posix relpath>" na
 * soubor, seřazeno podle cesty. Dva běhy buildu nad stejným vstupem
 * musí dát byte-shodný manifest; diff dvou manifestů je přesný seznam
 * změněných souborů.
 *
 *   node scripts/build/hash-tree.mjs <dir>            → manifest na stdout
 *   import { hashTree } from ".../hash-tree.mjs"      → Map<relPath, sha256>
 */
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const toPosix = (p) => p.split(sep).join("/");

export function hashTree(rootDir) {
  const out = new Map();
  const walk = (dir) => {
    for (const name of readdirSync(dir).sort()) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else out.set(toPosix(relative(rootDir, full)), createHash("sha256").update(readFileSync(full)).digest("hex"));
    }
  };
  walk(rootDir);
  return out;
}

export function formatManifest(tree) {
  return [...tree.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([p, h]) => `${h}  ${p}`)
    .join("\n") + "\n";
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const dir = process.argv[2];
  if (!dir) {
    console.error("hash-tree: chybí adresář — použij: node scripts/build/hash-tree.mjs <dir>");
    process.exit(2);
  }
  process.stdout.write(formatManifest(hashTree(dir)));
}

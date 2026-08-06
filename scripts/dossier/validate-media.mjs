#!/usr/bin/env node
/*
 * Media licence gate.
 *
 * Publishing someone else's photograph is not like publishing a link: it is a
 * use of a copyrighted work, and for the CC BY / BY-SA images this site relies
 * on, naming the author and the licence is a CONDITION of that use, not a
 * courtesy. The site already refuses to publish a claim without a source; an
 * image without a provable licence is exactly the same failure in a different
 * medium, so it fails the build the same way.
 *
 * Checks, per item of every entity record's `media` array:
 *   M1  the referenced file actually exists under static/ (a dead image path
 *       renders as a broken box in every social preview that crawls it)
 *   M2  licence, author, source URL and retrieval date are all present and the
 *       licence is on the allowlist of free licences (schema enforces shape,
 *       this enforces that the value means something we may actually publish)
 *   M3  the source URL points at a file/description page, not at raw bytes —
 *       a reader following the credit must land where the licence is stated
 *   M4  every image file committed under static/images/{people,logos,media} is
 *       claimed by some record, so an unattributed file cannot sit in the
 *       repository unnoticed
 *
 * Run: npm run validate:media   (part of npm run build)
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { isFreeLicence } from "../media/lib/licences.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const ENTITY_DIR = join(ROOT, "data/dossiers/_shared/entities");
const MEDIA_DIRS = ["static/images/people", "static/images/logos", "static/images/media"];


const problems = [];
const claimed = new Set();

for (const name of readdirSync(ENTITY_DIR).filter((f) => f.endsWith(".json")).sort()) {
  const file = join(ENTITY_DIR, name);
  let record;
  try {
    record = JSON.parse(readFileSync(file, "utf8"));
  } catch (err) {
    problems.push(`${name}: nevalidní JSON (${err.message})`);
    continue;
  }
  const media = record.media;
  if (!Array.isArray(media) || media.length === 0) continue;

  for (const [i, image] of media.entries()) {
    const where = `${name} media[${i}]`;
    const rel = `static/${image.file}`;
    const abs = join(ROOT, rel);

    // M1 — the file must be here, in this repository, not merely linked.
    if (!existsSync(abs)) {
      problems.push(`${where}: soubor neexistuje v repu (${rel})`);
    } else if (statSync(abs).size === 0) {
      problems.push(`${where}: soubor je prázdný (${rel})`);
    } else {
      claimed.add(rel);
    }

    // M2 — a licence we are actually allowed to redistribute.
    if (!isFreeLicence(image.license)) {
      problems.push(
        `${where}: licence ${JSON.stringify(image.license)} není na seznamu volných licencí — ` +
          `nesmí se publikovat (viz scripts/media/lib/licences.mjs)`,
      );
    }
    if (!String(image.author ?? "").trim()) {
      problems.push(`${where}: chybí autor — u CC BY/BY-SA je uvedení autora podmínkou licence`);
    }
    if (!String(image.retrieved ?? "").trim()) {
      problems.push(`${where}: chybí datum stažení (retrieved)`);
    }

    /*
     * M3 — the credit must lead to where the licence is stated.
     *
     * Not decided by the extension: a Commons description page is legitimately
     * called File:Something 2014.JPG, so "ends in .jpg" would reject exactly the
     * pages we want. What actually distinguishes bytes from a description page
     * is where they are served from — a media host or a raw-file redirect.
     */
    const url = String(image.sourceUrl ?? "");
    if (!/^https:\/\//.test(url)) {
      problems.push(`${where}: sourceUrl musí být https URL (je ${JSON.stringify(url)})`);
    } else {
      let host = "";
      let pathname = "";
      try {
        ({ host, pathname } = new URL(url));
      } catch {
        problems.push(`${where}: sourceUrl není platná URL (${url})`);
      }
      const rawHost = /^(upload\.|.*\.cdn\.|cdn\.|media\.)/i.test(host);
      const rawPath = /\/Special:FilePath\/|[?&]action=raw/i.test(pathname + url);
      if (rawHost || rawPath) {
        problems.push(
          `${where}: sourceUrl vede na samotné bajty (${url}) — musí vést na stránku souboru, ` +
            `kde je uvedená licence`,
        );
      }
    }
  }
}

// M4 — no orphan files: everything committed under the media dirs is claimed.
for (const dir of MEDIA_DIRS) {
  const abs = join(ROOT, dir);
  if (!existsSync(abs)) continue;
  for (const name of readdirSync(abs)) {
    if (name.startsWith(".")) continue;
    const rel = `${dir}/${name}`;
    if (!claimed.has(rel)) {
      problems.push(
        `${rel}: soubor v repu, ke kterému se nehlásí žádný záznam — ` +
          `nepřipsaný obrázek nesmí v repozitáři ležet`,
      );
    }
  }
}

if (problems.length) {
  console.error(`validate:media — ${problems.length} nálezů:`);
  for (const p of problems) console.error(`  ✗ ${p}`);
  process.exit(1);
}

const count = claimed.size;
console.log(
  count === 0
    ? "validate:media — žádné médium v datech (ok)"
    : `validate:media — ${count} médií, všechna s doloženou volnou licencí (ok)`,
);

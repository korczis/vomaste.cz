#!/usr/bin/env node
// Structural validator for .github/ISSUE_TEMPLATE/*.yml + config.yml
// (PHASE_005.md §15). Deliberately NOT a full reimplementation of
// GitHub's own Issue Forms schema validator (§15: "Neimplementuj celý
// GitHub schema validator, pokud lze použít existující nástroj") — this
// checks the small set of structural properties that would otherwise
// silently break a real submission: valid YAML, no tabs, unique field
// ids, every field has the attributes its type needs, and config.yml's
// own shape. The deeper form/parser CONTRACT check (does this form's
// output actually parse?) lives in
// scripts/intake/issue-form-compatibility.test.mjs, not here — this
// script only checks "is this YAML well-formed", not "does it match
// FORM_V1". Exported as a pure function (no process.exit) so
// validate-issue-forms.test.mjs can fold this into `npm test` — the same
// "no new build-pipeline step" approach Phase 2 used — while `node
// scripts/ci/validate-issue-forms.mjs` (npm run intake:validate-form)
// still works standalone via the CLI guard at the bottom.
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { load, YAMLException } from "js-yaml";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const DIR = join(ROOT, ".github/ISSUE_TEMPLATE");
const KNOWN_FIELD_TYPES = new Set(["markdown", "input", "textarea", "dropdown", "checkboxes"]);

function validateFormFile(dir, file, err) {
  const raw = readFileSync(join(dir, file), "utf8");
  if (/\t/.test(raw)) err(file, "contains a tab character — YAML requires spaces for indentation");

  let doc;
  try {
    doc = load(raw);
  } catch (e) {
    err(file, `invalid YAML: ${e instanceof YAMLException ? e.message : String(e)}`);
    return;
  }
  if (!doc || typeof doc !== "object") return err(file, "does not parse to an object");

  for (const required of ["name", "description", "body"]) {
    if (!(required in doc)) err(file, `missing top-level "${required}"`);
  }
  if (!Array.isArray(doc.body)) return err(file, 'top-level "body" must be an array');
  if (doc.body.length === 0) err(file, '"body" is empty');

  const seenIds = new Set();
  for (const [index, item] of doc.body.entries()) {
    const where = `body[${index}]`;
    if (!item || typeof item !== "object") {
      err(file, `${where}: not an object`);
      continue;
    }
    if (!KNOWN_FIELD_TYPES.has(item.type)) {
      err(file, `${where}: unsupported type "${item.type}"`);
      continue;
    }
    if (item.type === "markdown") {
      if (!item.attributes?.value || typeof item.attributes.value !== "string" || item.attributes.value.trim() === "") {
        err(file, `${where} (markdown): missing or empty attributes.value`);
      }
      if ("id" in item) err(file, `${where} (markdown): must not declare an id — markdown blocks are never submitted`);
      continue;
    }

    if (!item.id || typeof item.id !== "string") {
      err(file, `${where} (${item.type}): missing or non-string id`);
    } else {
      if (seenIds.has(item.id)) err(file, `duplicate field id "${item.id}"`);
      seenIds.add(item.id);
      if (!/^[a-z][a-z0-9_]*$/.test(item.id)) err(file, `field id "${item.id}" should be lowercase snake_case`);
    }

    const label = item.attributes?.label;
    if (!label || typeof label !== "string" || label.trim() === "") {
      err(file, `${where} (${item.id ?? "?"}): missing or empty attributes.label`);
    }

    if (item.type === "dropdown") {
      const options = item.attributes?.options;
      if (!Array.isArray(options) || options.length === 0) {
        err(file, `${where} (${item.id}): dropdown must have a non-empty attributes.options array`);
      } else {
        for (const opt of options) {
          if (typeof opt !== "string" || opt.trim() === "") err(file, `${where} (${item.id}): a dropdown option is not a non-empty string`);
        }
        if (new Set(options).size !== options.length) err(file, `${where} (${item.id}): dropdown has duplicate option text`);
      }
    }

    if (item.type === "checkboxes") {
      const options = item.attributes?.options;
      if (!Array.isArray(options) || options.length === 0) {
        err(file, `${where} (${item.id}): checkboxes must have a non-empty attributes.options array`);
      } else {
        const labels = [];
        for (const [i, opt] of options.entries()) {
          if (!opt || typeof opt !== "object" || !opt.label || typeof opt.label !== "string" || opt.label.trim() === "") {
            err(file, `${where} (${item.id}) option[${i}]: missing or empty label`);
          } else {
            labels.push(opt.label);
          }
          if ("required" in opt && typeof opt.required !== "boolean") {
            err(file, `${where} (${item.id}) option[${i}]: "required" must be a boolean, not ${JSON.stringify(opt.required)}`);
          }
        }
        if (new Set(labels).size !== labels.length) err(file, `${where} (${item.id}): duplicate checkbox option label`);
      }
    }

    if ((item.type === "input" || item.type === "textarea") && "required" in (item.validations ?? {}) && typeof item.validations.required !== "boolean") {
      err(file, `${where} (${item.id}): validations.required must be a boolean`);
    }
  }
}

function validateConfigFile(dir, err) {
  const file = "config.yml";
  const raw = readFileSync(join(dir, file), "utf8");
  if (/\t/.test(raw)) err(file, "contains a tab character");

  let doc;
  try {
    doc = load(raw);
  } catch (e) {
    return err(file, `invalid YAML: ${e instanceof YAMLException ? e.message : String(e)}`);
  }
  if (typeof doc?.blank_issues_enabled !== "boolean") err(file, "blank_issues_enabled must be a boolean");
  if (doc.contact_links !== undefined) {
    if (!Array.isArray(doc.contact_links)) {
      err(file, "contact_links must be an array");
    } else {
      for (const [i, link] of doc.contact_links.entries()) {
        for (const key of ["name", "url", "about"]) {
          if (!link?.[key] || typeof link[key] !== "string" || link[key].trim() === "") err(file, `contact_links[${i}]: missing or empty "${key}"`);
        }
      }
    }
  }
}

// Returns { errors: string[], fileCount: number, dir }. Never throws for
// an invalid form — only for the directory itself being unreadable.
export function collectIssueFormErrors(dir = DIR) {
  const errors = [];
  const err = (file, msg) => errors.push(`${file}: ${msg}`);

  const files = readdirSync(dir).filter((f) => f.endsWith(".yml"));
  if (files.length === 0) err(dir, "no .yml files found");
  for (const file of files) {
    if (file === "config.yml") validateConfigFile(dir, err);
    else validateFormFile(dir, file, err);
  }
  return { errors, fileCount: files.length, dir };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const { errors, fileCount, dir } = collectIssueFormErrors();
  if (errors.length) {
    console.log(`${errors.length} error(s):`);
    for (const e of errors) console.log(`  ERROR ${e}`);
    process.exit(1);
  }
  console.log(`OK — ${fileCount} issue-template file(s) in ${dir} are structurally valid.`);
}

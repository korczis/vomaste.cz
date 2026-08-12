#!/usr/bin/env node
// Regression test for lint-component-reuse.mjs, same pattern as
// scripts/dossier/verify-authorization-log-append-only.test.mjs: a
// throwaway fixture directory (mkdtemp, outside this repo) with its own
// templates/ subdir, so the script's ROOT-relative file scan resolves
// correctly. Node's built-in test runner, no new devDependency.
//
// Usage: node --test scripts/lint/lint-component-reuse.test.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, cpSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT_PATH = path.join(__dirname, "lint-component-reuse.mjs");

const CONFORMING = `{% extends "base.html" %}
{% block content %}
{{ <ui_page_header title={page.title} breadcrumb_items={[]} /> }}
{% endblock content %}
`;

const NO_IMPORT = `{% extends "base.html" %}
{% block content %}
<h1>{{ page.title }}</h1>
{% endblock content %}
`;

const IMPORT_BUT_UNUSED = `{% extends "base.html" %}
{% block content %}
<h1>{{ page.title }}</h1>
{% endblock content %}
`;

const RAW_TABLE_NO_IMPORT = `{% extends "base.html" %}
{% block content %}
{{ <ui_page_header title={page.title} breadcrumb_items={[]} /> }}
<table><tbody><tr><td>x</td></tr></tbody></table>
{% endblock content %}
`;

const RAW_TABLE_IMPORT_UNUSED = `{% extends "base.html" %}
{% block content %}
{{ <ui_page_header title={page.title} breadcrumb_items={[]} /> }}
<table><tbody><tr><td>x</td></tr></tbody></table>
{% endblock content %}
`;

const TABLE_VIA_MACRO = `{% extends "base.html" %}
{% block content %}
{{ <ui_page_header title={page.title} breadcrumb_items={[]} /> }}
{% <table_advanced_table id="t" caption="Test"> %}{% </table_advanced_table> %}
<tr><td>x</td></tr>
{% endblock content %}
`;

// A raw <table> inside a partial is the same defect as one in a
// top-level template -- the table rule scans recursively.
const PARTIAL_WITH_RAW_TABLE = `<table><tbody><tr><td>x</td></tr></tbody></table>
`;

function makeFixture(templateFiles) {
  const dir = mkdtempSync(path.join(tmpdir(), "vomaste-component-reuse-test-"));
  const templatesDir = path.join(dir, "templates");
  mkdirSync(path.join(dir, "scripts", "lint"), { recursive: true });
  mkdirSync(templatesDir, { recursive: true });
  cpSync(SCRIPT_PATH, path.join(dir, "scripts", "lint", path.basename(SCRIPT_PATH)));
  writeFileSync(path.join(templatesDir, "base.html"), "{% block content %}{% endblock content %}\n");
  writeFileSync(path.join(templatesDir, "404.html"), "<h1>404</h1>\n");
  for (const [name, content] of Object.entries(templateFiles)) {
    writeFileSync(path.join(templatesDir, name), content);
  }
  return dir;
}

function runLint(dir) {
  try {
    const out = execFileSync("node", ["scripts/lint/lint-component-reuse.mjs"], {
      cwd: dir,
      stdio: "pipe",
    });
    return { status: 0, out: out.toString() };
  } catch (err) {
    return { status: err.status, out: (err.stdout || "").toString() + (err.stderr || "").toString() };
  }
}

function withFixture(templateFiles, fn) {
  const dir = makeFixture(templateFiles);
  try {
    fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("passes when all non-exempt templates use a ui_* component", () => {
  withFixture({ "example.html": CONFORMING }, (dir) => {
    const { status } = runLint(dir);
    assert.equal(status, 0);
  });
});

test("exempt files (base.html, 404.html) pass without importing macros/ui.html", () => {
  withFixture({}, (dir) => {
    const { status } = runLint(dir);
    assert.equal(status, 0);
  });
});

test("fails when a non-exempt template never imports macros/ui.html", () => {
  withFixture({ "example.html": NO_IMPORT }, (dir) => {
    const { status, out } = runLint(dir);
    assert.equal(status, 1);
    assert.match(out, /never calls a ui_\* component/);
  });
});

test("fails when a non-exempt template never calls a ui_* component", () => {
  withFixture({ "example.html": IMPORT_BUT_UNUSED }, (dir) => {
    const { status, out } = runLint(dir);
    assert.equal(status, 1);
    assert.match(out, /never calls a ui_\* component/);
  });
});

test("fails when a template renders a raw <table> without importing macros/table.html", () => {
  withFixture({ "example.html": RAW_TABLE_NO_IMPORT }, (dir) => {
    const { status, out } = runLint(dir);
    assert.equal(status, 1);
    assert.match(out, /raw <table> but never calls the shared table component/);
  });
});

test("fails when a template renders a raw <table> but never calls the shared table component", () => {
  withFixture({ "example.html": RAW_TABLE_IMPORT_UNUSED }, (dir) => {
    const { status, out } = runLint(dir);
    assert.equal(status, 1);
    assert.match(out, /never calls the shared table component/);
  });
});

test("passes when tabular data goes through table_advanced_table (no raw <table> in the template)", () => {
  withFixture({ "example.html": TABLE_VIA_MACRO }, (dir) => {
    const { status } = runLint(dir);
    assert.equal(status, 0);
  });
});

test("macros/table.html itself is the only allowed home of the literal <table> markup", () => {
  withFixture({ "example.html": CONFORMING }, (dir) => {
    mkdirSync(path.join(dir, "templates", "macros"), { recursive: true });
    writeFileSync(
      path.join(dir, "templates", "macros", "table.html"),
      "{% macro advanced_table(id, caption) %}<table>{% endmacro advanced_table %}\n",
    );
    const { status } = runLint(dir);
    assert.equal(status, 0);
  });
});

test("fails on a raw <table> hidden in a partial (recursive scan)", () => {
  withFixture({ "example.html": CONFORMING }, (dir) => {
    mkdirSync(path.join(dir, "templates", "partials"), { recursive: true });
    writeFileSync(path.join(dir, "templates", "partials", "grid.html"), PARTIAL_WITH_RAW_TABLE);
    const { status, out } = runLint(dir);
    assert.equal(status, 1);
    assert.match(out, /partials\/grid\.html: renders a raw <table>/);
  });
});

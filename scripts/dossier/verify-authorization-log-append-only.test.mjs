#!/usr/bin/env node
// Regresní testy pro verify-authorization-log-append-only.mjs — skript
// chrání nejkritičtější pravidlo AGENTS.md (append-only autorizační log).
// Po auditu T-042 (nálezy B-1/B-2) testuje oba vynucovací mechanismy:
// git baseline přes merge-base s origin/master A hash-kotvu
// data/authorizations-log-anchor.json, plus fail-closed rozpoznávání
// všech reálných tvarů nadpisů záznamů (včetně těch, které původní
// regex míjel: „Rozšíření rozsahu", plurál „Authorized subjects,",
// „Not authorized:").
//
// Každý test staví jednorázové git fixture repo (mkdtemp mimo tento
// repo), kopíruje do něj validátor + lib + TTY nástroj kotvy, commitne
// známý AGENTS.md + kotvu, pak mutuje a kontroluje exit code.
//
// Usage: node --test scripts/dossier/verify-authorization-log-append-only.test.mjs
// (nebo npm test, který spouští všechny scripts/**/*.test.mjs)

import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  appendFileSync,
  rmSync,
  cpSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { extractLogEntries, hashEntryBlock } from "./lib/authorization-log.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = "verify-authorization-log-append-only.mjs";
const ANCHOR_TOOL = "anchor-authorization-log.mjs";
const LIB = path.join("lib", "authorization-log.mjs");

// Fixture pokrývá VŠECHNY reálné tvary nadpisů záznamů z produkčního logu
// (regrese na nález B-2) + dokumentační ### nadpis PŘED sekcí logu, který
// záznamem není a nesmí vadit.
const FIXTURE_AGENTS_MD = `# fixture

### Templates

Doc heading před logem — není záznam, parser ho musí ignorovat.

## Content about real parties

### Authorized subject: Alice (on the record)

Original text, must never change.

### Scope extension, 2026-01-01: more stuff

Also original text.

### Rozšíření rozsahu, 2026-01-02: česká vrstva

Český záznam, dřívějším regexem míjený.

## Unrelated later section

Novější záznamy jsou historicky appendované až za pozdější ## sekce.

### Authorized subjects, 2026-01-03: plural grant

Plurální záznam pěti subjektů.

### Structural change, 2026-01-04: something structural

Strukturální záznam.

### Not authorized: Mallory (on the record)

Explicitní zamítnutí — také append-only záznam.
`;

function sh(cmd, cwd) {
  execFileSync("/bin/sh", ["-c", cmd], { cwd, stdio: "pipe" });
}

function writeAnchor(dir) {
  const { entries, problems } = extractLogEntries(readFileSync(path.join(dir, "AGENTS.md"), "utf8"));
  assert.equal(problems.length, 0, `fixture AGENTS.md musí být parsovatelný: ${problems.join("; ")}`);
  mkdirSync(path.join(dir, "data"), { recursive: true });
  writeFileSync(
    path.join(dir, "data", "authorizations-log-anchor.json"),
    `${JSON.stringify(
      {
        generatedAt: "2026-01-05",
        algorithm: "sha256(normalized entry block: LF line endings, trailing whitespace trimmed)",
        entries: [...entries].map(([heading, block]) => ({ heading, sha256: hashEntryBlock(block) })),
      },
      null,
      2,
    )}\n`,
  );
  return entries.size;
}

function makeFixtureRepo() {
  const dir = mkdtempSync(path.join(tmpdir(), "vomaste-append-only-test-"));
  mkdirSync(path.join(dir, "scripts", "dossier", "lib"), { recursive: true });
  for (const f of [SCRIPT, ANCHOR_TOOL, LIB]) {
    cpSync(path.join(__dirname, f), path.join(dir, "scripts", "dossier", f));
  }
  writeFileSync(path.join(dir, "AGENTS.md"), FIXTURE_AGENTS_MD);
  writeAnchor(dir);
  // -b master explicitně: validátor hledá merge-base s origin/master.
  sh("git init -q -b master", dir);
  sh("git -c user.email=t@t -c user.name=t add -A", dir);
  sh("git -c user.email=t@t -c user.name=t commit -q -m init", dir);
  return dir;
}

function runValidator(dir) {
  try {
    const stdout = execFileSync("node", [`scripts/dossier/${SCRIPT}`], { cwd: dir, stdio: "pipe" });
    return { status: 0, output: String(stdout) };
  } catch (err) {
    return { status: err.status, output: `${err.stdout}${err.stderr}` };
  }
}

function withFixture(fn) {
  const dir = makeFixtureRepo();
  try {
    fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("passes when AGENTS.md is unchanged and fully anchored", () => {
  withFixture((dir) => {
    const res = runValidator(dir);
    assert.equal(res.status, 0, res.output);
    assert.match(res.output, /6 záznamů/);
  });
});

test("fails when an anchored entry's text is edited (working tree)", () => {
  withFixture((dir) => {
    const p = path.join(dir, "AGENTS.md");
    writeFileSync(
      p,
      readFileSync(p, "utf8").replace("Original text, must never change.", "Original text, SNEAKILY EDITED."),
    );
    const res = runValidator(dir);
    assert.equal(res.status, 1);
    assert.match(res.output, /Authorized subject: Alice/);
  });
});

test("fails when a Czech 'Rozšíření rozsahu' entry is edited (B-2 regression)", () => {
  withFixture((dir) => {
    const p = path.join(dir, "AGENTS.md");
    writeFileSync(p, readFileSync(p, "utf8").replace("Český záznam, dřívějším regexem míjený.", "Přepsáno."));
    const res = runValidator(dir);
    assert.equal(res.status, 1);
    assert.match(res.output, /Rozšíření rozsahu, 2026-01-02/);
  });
});

test("fails when the plural 'Authorized subjects,' entry is removed (B-2 regression)", () => {
  withFixture((dir) => {
    const p = path.join(dir, "AGENTS.md");
    writeFileSync(
      p,
      readFileSync(p, "utf8").replace(/### Authorized subjects, 2026-01-03: plural grant\n\nPlurální záznam pěti subjektů\.\n\n/, ""),
    );
    const res = runValidator(dir);
    assert.equal(res.status, 1);
    assert.match(res.output, /Authorized subjects, 2026-01-03/);
  });
});

test("fails when the 'Not authorized:' refusal entry is removed (B-2 regression)", () => {
  withFixture((dir) => {
    const p = path.join(dir, "AGENTS.md");
    writeFileSync(p, readFileSync(p, "utf8").replace(/\n### Not authorized: Mallory[\s\S]*$/, "\n"));
    const res = runValidator(dir);
    assert.equal(res.status, 1);
    assert.match(res.output, /Not authorized: Mallory/);
  });
});

test("fails on a new entry that is not anchored, with guidance to run authorization:anchor", () => {
  withFixture((dir) => {
    appendFileSync(
      path.join(dir, "AGENTS.md"),
      "\n### Authorized subject: Bob (on the record)\n\nBrand new entry, not yet anchored.\n",
    );
    const res = runValidator(dir);
    assert.equal(res.status, 1);
    assert.match(res.output, /neukotvený záznam/);
    assert.match(res.output, /authorization:anchor/);
  });
});

test("passes on a new entry once it is anchored", () => {
  withFixture((dir) => {
    appendFileSync(
      path.join(dir, "AGENTS.md"),
      "\n### Authorized subject: Bob (on the record)\n\nBrand new entry, now anchored.\n",
    );
    writeAnchor(dir); // simuluje interaktivní ukotvení člověkem
    const res = runValidator(dir);
    assert.equal(res.status, 0, res.output);
  });
});

test("fails closed on an unrecognized ### heading shape inside the log territory (B-2 fail-closed)", () => {
  withFixture((dir) => {
    appendFileSync(path.join(dir, "AGENTS.md"), "\n### Totally novel heading shape, 2026-01-06\n\nText.\n");
    const res = runValidator(dir);
    assert.equal(res.status, 1);
    assert.match(res.output, /neznámý tvar nadpisu/);
  });
});

test("fails when the anchor file is missing entirely", () => {
  withFixture((dir) => {
    rmSync(path.join(dir, "data", "authorizations-log-anchor.json"));
    const res = runValidator(dir);
    assert.equal(res.status, 1);
    assert.match(res.output, /authorization:anchor/);
  });
});

test("catches an edit committed to the branch via merge-base with origin/master (B-1 regression)", () => {
  withFixture((dir) => {
    // origin/master = původní stav; lokální větev pak commitne editaci
    // ukotveného záznamu VČETNĚ přegenerované kotvy. Kotva by prošla —
    // git baseline proti merge-base musí editaci stejně chytit.
    const origin = mkdtempSync(path.join(tmpdir(), "vomaste-append-only-origin-"));
    try {
      sh(`git clone -q --bare . ${JSON.stringify(origin)}`, dir);
      sh(`git remote add origin ${JSON.stringify(origin)}`, dir);
      sh("git fetch -q origin", dir);
      const p = path.join(dir, "AGENTS.md");
      writeFileSync(
        p,
        readFileSync(p, "utf8").replace("Original text, must never change.", "Edited AND committed AND re-anchored."),
      );
      writeAnchor(dir);
      sh("git -c user.email=t@t -c user.name=t add -A", dir);
      sh("git -c user.email=t@t -c user.name=t commit -q -m sneaky", dir);
      const res = runValidator(dir);
      assert.equal(res.status, 1);
      assert.match(res.output, /merge-base/);
      assert.match(res.output, /Authorized subject: Alice/);
    } finally {
      rmSync(origin, { recursive: true, force: true });
    }
  });
});

test("anchor tool refuses to run without a TTY", () => {
  withFixture((dir) => {
    let status = 0;
    let output = "";
    try {
      execFileSync("node", [`scripts/dossier/${ANCHOR_TOOL}`], { cwd: dir, stdio: "pipe" });
    } catch (err) {
      status = err.status;
      output = `${err.stdout}${err.stderr}`;
    }
    assert.equal(status, 1);
    assert.match(output, /interactive terminal/);
    // a hlavně: bez TTY se kotvy ani logu nesmí dotknout
    assert.equal(
      readFileSync(path.join(dir, "AGENTS.md"), "utf8"),
      FIXTURE_AGENTS_MD,
    );
  });
});

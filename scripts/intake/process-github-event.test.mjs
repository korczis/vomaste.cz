import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { processGithubEvent, parseCliArgs } from "./process-github-event.mjs";

async function withTmpDir(fn) {
  const dir = mkdtempSync(join(tmpdir(), "process-github-event-test-"));
  try {
    return await fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function rawPayload(overrides = {}) {
  return {
    action: "opened",
    issue: {
      number: 501,
      title: "[Podnět] Test",
      body: [
        "<!-- vomaste-intake-form:v1 -->",
        "",
        "### Typ podnětu",
        "",
        "Nový dossier (nová osoba/subjekt)",
        "",
        "### Navržený subjekt",
        "",
        "Jan Testovací",
        "",
        "### Popis a kontext",
        "",
        "Popis.",
        "",
        "### Veřejný zájem",
        "",
        "Veřejný zájem.",
        "",
        "### Zdrojové odkazy",
        "",
        "https://example.fixture/a",
        "",
        "### Potvrzení",
        "",
        "- [x] Rozumím, že jde o veřejný GitHub issue a podnět bude veřejně viditelný.",
        "- [x] Nenahraji sem důvěrný materiál, citlivé důkazy ani údaje identifikující zdroj.",
        "- [x] Rozumím, že se nejedná o automatickou autorizaci ani publikaci — podnět jen čeká na posouzení vlastníkem.",
        "",
      ].join("\n"),
      html_url: "https://github.com/korczis/vomaste.cz/issues/501",
      state: "open",
      user: { login: "example-user" },
      created_at: "2026-08-02T12:00:00Z",
      updated_at: "2026-08-02T12:00:00Z",
      labels: [{ name: "navrh-rozsahu" }],
    },
    repository: { owner: { login: "korczis" }, name: "vomaste.cz", full_name: "korczis/vomaste.cz" },
    ...overrides,
  };
}

test("parseCliArgs rejects an unknown flag", () => {
  assert.throws(() => parseCliArgs(["--bogus", "x"]));
});

test("parseCliArgs accepts the documented flags", () => {
  const args = parseCliArgs(["--event", "e.json", "--output-dir", "out", "--repository-commit", "abc", "--preflight"]);
  assert.equal(args.eventPath, "e.json");
  assert.equal(args.preflight, true);
});

test("a valid opened-issue event produces status=success with manifest/report/diagnostics files", async () => {
  await withTmpDir(async (dir) => {
    const eventPath = join(dir, "event.json");
    writeFileSync(eventPath, JSON.stringify(rawPayload()));
    const status = await processGithubEvent({
      eventPath,
      outputDir: join(dir, "out"),
      repositoryCommit: "0000000000000000000000000000000000000e",
      deliveryId: "run-1",
      expectedRepository: "korczis/vomaste.cz",
      generatedAt: "2026-08-02T12:00:00.000Z",
    });
    assert.equal(status.status, "success");
    assert.ok(status.intake_id);
    const diagnostics = JSON.parse(readFileSync(status.diagnostics_path, "utf8"));
    assert.equal(diagnostics.issue_number, 501);
    assert.equal(diagnostics.intake_id, status.intake_id);
    assert.ok(!JSON.stringify(diagnostics).includes("Popis."), "diagnostics must not carry raw submission text");
  });
});

test("an unsupported action (e.g. assigned) yields status=ignored_unsupported_action, not a crash", async () => {
  await withTmpDir(async (dir) => {
    const eventPath = join(dir, "event.json");
    writeFileSync(eventPath, JSON.stringify(rawPayload({ action: "assigned" })));
    const status = await processGithubEvent({ eventPath, outputDir: join(dir, "out"), repositoryCommit: "0000000000000000000000000000000000000e" });
    assert.equal(status.status, "ignored_unsupported_action");
    assert.equal(status.action, "assigned");
  });
});

test("a submission that fails validation (missing acknowledgement) yields status=submission_rejected with a real error code, not internal_error", async () => {
  await withTmpDir(async (dir) => {
    const payload = rawPayload();
    payload.issue.body = payload.issue.body.replace("- [x] Rozumím, že jde o veřejný GitHub issue", "- [ ] Rozumím, že jde o veřejný GitHub issue");
    const eventPath = join(dir, "event.json");
    writeFileSync(eventPath, JSON.stringify(payload));
    const status = await processGithubEvent({ eventPath, outputDir: join(dir, "out"), repositoryCommit: "0000000000000000000000000000000000000e" });
    assert.equal(status.status, "submission_rejected");
    assert.equal(status.failure_class, "invalid_form");
    assert.equal(status.code, "submission_validation_failed");
  });
});

test("a payload claiming a different repository than expected is rejected (§33)", async () => {
  await withTmpDir(async (dir) => {
    const eventPath = join(dir, "event.json");
    writeFileSync(eventPath, JSON.stringify(rawPayload()));
    const status = await processGithubEvent({ eventPath, outputDir: join(dir, "out"), repositoryCommit: "0000000000000000000000000000000000000e", expectedRepository: "someone-else/other-repo" });
    assert.equal(status.status, "internal_error");
  });
});

test("a missing event file yields status=internal_error, never throws uncaught", async () => {
  await withTmpDir(async (dir) => {
    const status = await processGithubEvent({ eventPath: join(dir, "does-not-exist.json"), outputDir: join(dir, "out"), repositoryCommit: "0000000000000000000000000000000000000e" });
    assert.equal(status.status, "internal_error");
    assert.equal(status.failure_class, "internal_workflow_error");
  });
});

test("re-running the same event twice (idempotence, §16.1) produces the same intake ID both times", async () => {
  await withTmpDir(async (dir) => {
    const eventPath = join(dir, "event.json");
    writeFileSync(eventPath, JSON.stringify(rawPayload()));
    const first = await processGithubEvent({ eventPath, outputDir: join(dir, "out"), repositoryCommit: "0000000000000000000000000000000000000e", generatedAt: "2026-08-02T12:00:00.000Z" });
    const second = await processGithubEvent({ eventPath, outputDir: join(dir, "out"), repositoryCommit: "0000000000000000000000000000000000000e", generatedAt: "2026-08-02T12:00:00.000Z" });
    assert.equal(first.intake_id, second.intake_id);
  });
});

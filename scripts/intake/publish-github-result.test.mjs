import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { publishGithubResult, parseCliArgs } from "./publish-github-result.mjs";
import { processGithubEvent } from "./process-github-event.mjs";
import { createMockGithubAdapter } from "./github/mock-github-adapter.mjs";

async function withTmpDir(fn) {
  const dir = mkdtempSync(join(tmpdir(), "publish-github-result-test-"));
  try {
    return await fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function rawPayload(overrides = {}) {
  const body = [
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
  ].join("\n");
  return {
    action: "opened",
    issue: { number: 501, title: "[Podnět] Test", body, html_url: "https://github.com/korczis/vomaste.cz/issues/501", state: "open", user: { login: "example-user" }, created_at: "2026-08-02T12:00:00Z", updated_at: "2026-08-02T12:00:00Z", labels: [{ name: "navrh-rozsahu" }] },
    repository: { owner: { login: "korczis" }, name: "vomaste.cz", full_name: "korczis/vomaste.cz" },
    ...overrides,
  };
}

test("parseCliArgs rejects an unknown flag", () => {
  assert.throws(() => parseCliArgs(["--bogus", "x"]));
});

test("end to end (process then publish, mock adapter): valid triage submission creates a pinged comment and correct labels", async () => {
  await withTmpDir(async (dir) => {
    const eventPath = join(dir, "event.json");
    writeFileSync(eventPath, JSON.stringify(rawPayload()));
    await processGithubEvent({ eventPath, outputDir: dir, repositoryCommit: "0000000000000000000000000000000000000e", generatedAt: "2026-08-02T12:00:00.000Z" });

    const mockAdapter = createMockGithubAdapter({ issue: { number: 501, updated_at: "2026-08-02T12:00:00Z" } });
    const outcome = await publishGithubResult({ statusDir: dir, issueNumber: 501, action: "opened", runUrl: "https://github.com/korczis/vomaste.cz/actions/runs/1", artifactName: "dossier-intake-issue-501-run-1", adapterOverride: mockAdapter, ownerLoginOverride: "korczis" });

    assert.equal(outcome.published, true);
    assert.equal(outcome.result.comment.action, "created");
    assert.equal(outcome.result.pinged, true);
    const comments = await mockAdapter.listComments();
    assert.match(comments[0].body, /@korczis/);
  });
});

test("end to end: an unsupported action never publishes anything", async () => {
  await withTmpDir(async (dir) => {
    const eventPath = join(dir, "event.json");
    writeFileSync(eventPath, JSON.stringify(rawPayload({ action: "milestoned" })));
    await processGithubEvent({ eventPath, outputDir: dir, repositoryCommit: "0000000000000000000000000000000000000e" });

    const mockAdapter = createMockGithubAdapter({});
    const outcome = await publishGithubResult({ statusDir: dir, issueNumber: 501, action: "milestoned", adapterOverride: mockAdapter });
    assert.equal(outcome.published, false);
    assert.equal((await mockAdapter.listComments()).length, 0);
  });
});

test("end to end: an invalid submission (missing acknowledgement) publishes a safe explanation, never a stack trace", async () => {
  await withTmpDir(async (dir) => {
    const payload = rawPayload();
    payload.issue.body = payload.issue.body.replace("- [x] Rozumím, že jde o veřejný GitHub issue", "- [ ] Rozumím, že jde o veřejný GitHub issue");
    const eventPath = join(dir, "event.json");
    writeFileSync(eventPath, JSON.stringify(payload));
    await processGithubEvent({ eventPath, outputDir: dir, repositoryCommit: "0000000000000000000000000000000000000e" });

    const mockAdapter = createMockGithubAdapter({ issue: { number: 501, updated_at: "2026-08-02T12:00:00Z" } });
    const outcome = await publishGithubResult({ statusDir: dir, issueNumber: 501, action: "opened", adapterOverride: mockAdapter, ownerLoginOverride: "korczis" });

    assert.equal(outcome.published, true);
    assert.deepEqual(await mockAdapter.listLabels(), ["intake:invalid"]);
    const comments = await mockAdapter.listComments();
    assert.doesNotMatch(comments[0].body, /at Object\.|node_modules|\.mjs:\d+/);
  });
});

test("end to end: a closed issue updates the comment and never creates a new one", async () => {
  await withTmpDir(async (dir) => {
    const eventPath = join(dir, "event.json");
    writeFileSync(eventPath, JSON.stringify(rawPayload({ action: "closed", issue: { ...rawPayload().issue, state: "closed" } })));
    await processGithubEvent({ eventPath, outputDir: dir, repositoryCommit: "0000000000000000000000000000000000000e" });

    const mockAdapter = createMockGithubAdapter({ issue: { number: 501, updated_at: "2026-08-02T12:00:00Z" }, labels: ["intake:triage", "authorization:pending-owner", "publication:blocked"] });
    await mockAdapter.createComment("<!-- vomaste-intake-report:v1 -->\n\nprior report");
    const outcome = await publishGithubResult({ statusDir: dir, issueNumber: 501, action: "closed", adapterOverride: mockAdapter, ownerLoginOverride: "korczis" });

    assert.equal(outcome.closed, true);
    assert.equal((await mockAdapter.listComments()).length, 1);
    assert.ok(!(await mockAdapter.listLabels()).includes("intake:triage"));
    assert.ok((await mockAdapter.listLabels()).includes("publication:blocked"));
  });
});

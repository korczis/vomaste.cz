import { test } from "node:test";
import assert from "node:assert/strict";
import { adaptGithubIssueEvent, assertExpectedRepository, isSupportedGithubIssueAction } from "./github-event.mjs";
import { IntakeError } from "../errors.mjs";

function rawPayload(overrides = {}) {
  return {
    action: "opened",
    issue: {
      number: 501,
      title: "[Podnět] Test",
      body: "<!-- vomaste-intake-form:v1 -->\n",
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

test("adapts a well-formed real GitHub payload to the internal event shape", () => {
  const adapted = adaptGithubIssueEvent(rawPayload(), { deliveryId: "run-1" });
  assert.equal(adapted.event_version, "1.0.0");
  assert.equal(adapted.repository.full_name, "korczis/vomaste.cz");
  assert.equal(adapted.issue.number, 501);
  assert.equal(adapted.issue.author_login, "example-user");
  assert.deepEqual(adapted.issue.labels, ["navrh-rozsahu"]);
  assert.equal(adapted.event.action, "opened");
  assert.equal(adapted.event.delivery_id, "run-1");
});

test("a null issue body (GitHub's shape for a genuinely empty issue) coerces to an empty string, not a crash", () => {
  const adapted = adaptGithubIssueEvent(rawPayload({ issue: { ...rawPayload().issue, body: null } }), { deliveryId: "run-1" });
  assert.equal(adapted.issue.body, "");
});

test("label objects and bare label strings are both accepted", () => {
  const withStringLabels = rawPayload({ issue: { ...rawPayload().issue, labels: ["navrh-rozsahu"] } });
  const adapted = adaptGithubIssueEvent(withStringLabels, { deliveryId: "run-1" });
  assert.deepEqual(adapted.issue.labels, ["navrh-rozsahu"]);
});

test("rejects a payload missing the issue object", () => {
  assert.throws(() => adaptGithubIssueEvent({ action: "opened", repository: rawPayload().repository }, { deliveryId: "run-1" }), IntakeError);
});

test("rejects a payload missing the repository object", () => {
  assert.throws(() => adaptGithubIssueEvent({ action: "opened", issue: rawPayload().issue }, { deliveryId: "run-1" }), IntakeError);
});

test("rejects a non-integer issue number", () => {
  const bad = rawPayload({ issue: { ...rawPayload().issue, number: "501" } });
  assert.throws(() => adaptGithubIssueEvent(bad, { deliveryId: "run-1" }), IntakeError);
});

test("isSupportedGithubIssueAction recognizes exactly the six documented actions", () => {
  for (const a of ["opened", "edited", "reopened", "labeled", "unlabeled", "closed"]) assert.equal(isSupportedGithubIssueAction(a), true);
  for (const a of ["assigned", "milestoned", "transferred", "pinned", ""]) assert.equal(isSupportedGithubIssueAction(a), false);
});

test("assertExpectedRepository passes when the repository matches", () => {
  const adapted = adaptGithubIssueEvent(rawPayload(), { deliveryId: "run-1" });
  assert.doesNotThrow(() => assertExpectedRepository(adapted, "korczis/vomaste.cz"));
});

test("assertExpectedRepository throws when the event claims a different repository (§33 defense in depth)", () => {
  const adapted = adaptGithubIssueEvent(rawPayload(), { deliveryId: "run-1" });
  assert.throws(() => assertExpectedRepository(adapted, "someone-else/other-repo"), IntakeError);
});

test("assertExpectedRepository is a no-op when no expectation is supplied", () => {
  const adapted = adaptGithubIssueEvent(rawPayload(), { deliveryId: "run-1" });
  assert.doesNotThrow(() => assertExpectedRepository(adapted, undefined));
});

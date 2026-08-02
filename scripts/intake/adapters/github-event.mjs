// Reduces a real GitHub `issues` webhook payload (as GitHub Actions
// writes it to $GITHUB_EVENT_PATH) to Phase 2's internal event shape
// (schemas/intake/intake-event.schema.json) — PHASE_006.md §6.2. This is
// the ONLY place raw GitHub payload fields are read; every downstream
// module (parse-issue-form.mjs, build-intake-manifest.mjs, ...) only
// ever sees the already-narrowed, already-typed internal shape.
//
// Deliberately an ALLOWLIST, not a passthrough: only the fields the
// internal schema actually declares are copied out, each coerced to its
// expected type or rejected — an unexpected shape (missing field, wrong
// type) fails closed here rather than producing a malformed internal
// event that some downstream validator has to reject less clearly.
// Never executes, evaluates, or shell-interpolates anything from the
// payload — this module does string/type coercion only.
import { IntakeError, ERROR_CODES } from "../errors.mjs";

const SUPPORTED_ACTIONS = new Set(["opened", "edited", "reopened", "labeled", "unlabeled", "closed"]);

function requireString(value, field, { maxLength = 100000 } = {}) {
  if (typeof value !== "string") throw new IntakeError(ERROR_CODES.EVENT_SCHEMA_INVALID, `github event: "${field}" must be a string`);
  if (value.length > maxLength) throw new IntakeError(ERROR_CODES.EVENT_SCHEMA_INVALID, `github event: "${field}" exceeds ${maxLength} chars`);
  return value;
}

function requireInteger(value, field) {
  if (!Number.isInteger(value) || value < 1) throw new IntakeError(ERROR_CODES.EVENT_SCHEMA_INVALID, `github event: "${field}" must be a positive integer`);
  return value;
}

// GitHub allows a genuinely empty issue body (`null`), which the parser
// then correctly rejects downstream as missing the required v1 marker —
// coerced to "" here rather than throwing, so "an empty issue" fails at
// the parser layer with a normal, documented error code instead of an
// adapter-layer special case.
function optionalBodyString(value) {
  if (value === null || value === undefined) return "";
  return requireString(value, "issue.body", { maxLength: 1048576 });
}

// `action` here is the CLI/workflow-supplied action name — PHASE_006.md
// §6.3: an unsupported action (something outside the six this processor
// understands) is reported as a distinct, non-crashing outcome by the
// caller (process-github-event.mjs), not thrown from here as a generic
// schema error.
export function isSupportedGithubIssueAction(action) {
  return SUPPORTED_ACTIONS.has(action);
}

// `deliveryId` is supplied by the caller (the workflow passes
// `$GITHUB_RUN_ID-$GITHUB_RUN_ATTEMPT`, itself GitHub-controlled runner
// metadata, never issue content) since GitHub Actions' `issues` event
// payload itself carries no delivery/webhook ID field.
export function adaptGithubIssueEvent(rawPayload, { deliveryId }) {
  if (!rawPayload || typeof rawPayload !== "object") {
    throw new IntakeError(ERROR_CODES.EVENT_SCHEMA_INVALID, "github event: payload is not an object");
  }
  const action = requireString(rawPayload.action, "action", { maxLength: 50 });
  const issue = rawPayload.issue;
  const repository = rawPayload.repository;
  if (!issue || typeof issue !== "object") throw new IntakeError(ERROR_CODES.EVENT_SCHEMA_INVALID, 'github event: missing "issue" object');
  if (!repository || typeof repository !== "object") throw new IntakeError(ERROR_CODES.EVENT_SCHEMA_INVALID, 'github event: missing "repository" object');

  const ownerLogin = repository.owner?.login;
  const labels = Array.isArray(issue.labels) ? issue.labels.map((l) => (typeof l === "string" ? l : l?.name)).filter((name) => typeof name === "string") : [];

  return {
    event_version: "1.0.0",
    repository: {
      owner: requireString(ownerLogin, "repository.owner.login", { maxLength: 100 }),
      name: requireString(repository.name, "repository.name", { maxLength: 100 }),
      full_name: requireString(repository.full_name, "repository.full_name", { maxLength: 201 }),
    },
    issue: {
      number: requireInteger(issue.number, "issue.number"),
      title: requireString(issue.title ?? "", "issue.title", { maxLength: 500 }),
      body: optionalBodyString(issue.body),
      html_url: requireString(issue.html_url, "issue.html_url", { maxLength: 2048 }),
      state: issue.state === "closed" ? "closed" : "open",
      author_login: requireString(issue.user?.login, "issue.user.login", { maxLength: 100 }),
      created_at: requireString(issue.created_at, "issue.created_at", { maxLength: 40 }),
      updated_at: requireString(issue.updated_at, "issue.updated_at", { maxLength: 40 }),
      labels: labels.slice(0, 50),
    },
    event: {
      action,
      delivery_id: requireString(deliveryId, "delivery_id", { maxLength: 200 }),
    },
  };
}

// §33 — defense in depth: the adapted event must actually describe THIS
// repository, not something a maliciously-configured fork or a
// misrouted event claims. `expectedFullName` is caller-supplied
// (workflow-time `github.repository`, GitHub-controlled context, never
// issue content) so this is a consistency check, not a trust boundary
// crossing.
export function assertExpectedRepository(adaptedEvent, expectedFullName) {
  if (expectedFullName && adaptedEvent.repository.full_name !== expectedFullName) {
    throw new IntakeError(ERROR_CODES.EVENT_SCHEMA_INVALID, `github event: repository "${adaptedEvent.repository.full_name}" does not match expected "${expectedFullName}"`);
  }
}

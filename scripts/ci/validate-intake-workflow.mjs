#!/usr/bin/env node
// Static security validator for .github/workflows/dossier-intake.yml
// (PHASE_006.md §24). Parses the real YAML (never a string-only grep —
// §45's own warning: "Nespoléhej pouze na grep. Použij YAML validator.")
// and checks every invariant §1/§24 require. Exported as a pure function
// (no process.exit) so validate-intake-workflow.test.mjs can fold this
// into `npm test`, same pattern as scripts/ci/validate-issue-forms.mjs.
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { load } from "js-yaml";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const WORKFLOW_PATH = join(ROOT, ".github/workflows/dossier-intake.yml");

const FORBIDDEN_PERMISSIONS = ["pull-requests", "deployments", "pages", "id-token", "packages", "actions", "contents-write-alias"];
const DEPLOY_ACTION_NAME_HINTS = ["deploy-pages", "actions/deploy", "peaceiris/actions-gh-pages", "aws-actions/", "azure/", "google-github-actions/"];

function collectSteps(doc) {
  const steps = [];
  for (const job of Object.values(doc.jobs ?? {})) {
    for (const step of job.steps ?? []) steps.push(step);
  }
  return steps;
}

export function validateIntakeWorkflow(workflowPath = WORKFLOW_PATH) {
  const errors = [];
  const err = (msg) => errors.push(msg);

  const raw = readFileSync(workflowPath, "utf8");
  let doc;
  try {
    doc = load(raw);
  } catch (e) {
    return { errors: [`invalid YAML: ${e.message}`] };
  }

  // §24: trigger is issues only.
  const onKeys = Object.keys(doc.on ?? {});
  if (onKeys.length !== 1 || onKeys[0] !== "issues") err(`trigger must be exactly "issues", found: ${onKeys.join(", ")}`);
  if (onKeys.includes("pull_request_target")) err("pull_request_target must never be a trigger for this workflow");
  if (onKeys.includes("issue_comment")) err("issue_comment trigger is not needed by this workflow and must not be present");
  if (onKeys.includes("repository_dispatch")) err("repository_dispatch must never be a trigger for this workflow");
  if (onKeys.includes("workflow_run")) err("workflow_run must never be a trigger for this workflow");

  // §1.1/§24: permissions.
  const permissions = doc.permissions ?? {};
  if (permissions.contents !== "read") err(`permissions.contents must be exactly "read", found: ${JSON.stringify(permissions.contents)}`);
  if (permissions.issues !== "write") err(`permissions.issues must be exactly "write", found: ${JSON.stringify(permissions.issues)}`);
  for (const key of Object.keys(permissions)) {
    if (key === "contents" || key === "issues") continue;
    if (permissions[key] === "write") err(`permissions.${key} must never be "write"`);
  }
  for (const forbidden of ["pull-requests", "deployments", "pages", "id-token", "packages", "actions"]) {
    if (permissions[forbidden] === "write") err(`permissions.${forbidden}: write is forbidden`);
  }

  // §4.5/§4.6: timeout and concurrency, at workflow or job level.
  const jobs = Object.values(doc.jobs ?? {});
  if (!doc["timeout-minutes"] && !jobs.some((j) => j["timeout-minutes"])) err("no timeout-minutes set at workflow or job level");
  if (!doc.concurrency && !jobs.some((j) => j.concurrency)) err("no concurrency group configured");

  const steps = collectSteps(doc);

  // §5.1: checkout must set persist-credentials: false.
  const checkoutSteps = steps.filter((s) => typeof s.uses === "string" && s.uses.startsWith("actions/checkout"));
  if (checkoutSteps.length === 0) err("no actions/checkout step found");
  for (const s of checkoutSteps) {
    if (s.with?.["persist-credentials"] !== false) err(`checkout step "${s.name ?? s.uses}" must set persist-credentials: false`);
  }

  // §1.3/§6.1: issue body/title must never be interpolated into `run:`.
  const DANGEROUS_EXPRESSIONS = [
    { name: "github.event.issue.body", pattern: /\$\{\{\s*github\.event\.issue\.body\s*\}\}/ },
    { name: "github.event.issue.title", pattern: /\$\{\{\s*github\.event\.issue\.title\s*\}\}/ },
    { name: "github.event.comment.body", pattern: /\$\{\{\s*github\.event\.comment\.body\s*\}\}/ },
  ];
  for (const s of steps) {
    if (typeof s.run !== "string") continue;
    for (const { name, pattern } of DANGEROUS_EXPRESSIONS) {
      if (pattern.test(s.run)) err(`step "${s.name ?? "?"}" interpolates raw, untrusted "${name}" directly into a shell command`);
    }
  }
  // Same check against the raw file text, in case a step body is
  // constructed in a way js-yaml's object walk wouldn't catch (e.g. a
  // multiline block the parser folds differently) — belt and suspenders.
  for (const { name, pattern } of DANGEROUS_EXPRESSIONS) {
    if (pattern.test(raw)) err(`raw workflow text contains a dangerous interpolation of "${name}"`);
  }

  // §1.4/§20: no secret besides GITHUB_TOKEN anywhere in the file.
  const secretRefs = [...raw.matchAll(/\$\{\{\s*secrets\.([A-Za-z0-9_]+)\s*\}\}/g)].map((m) => m[1]);
  for (const name of secretRefs) {
    if (name !== "GITHUB_TOKEN") err(`references a secret other than GITHUB_TOKEN: secrets.${name}`);
  }

  // §21: the processing step (the one invoking process-github-event.mjs)
  // must never have GITHUB_TOKEN in its own env block — only a later,
  // separate publishing step may.
  const processingSteps = steps.filter((s) => typeof s.run === "string" && s.run.includes("process-github-event.mjs"));
  for (const s of processingSteps) {
    if (s.env && "GITHUB_TOKEN" in s.env) err(`processing step "${s.name}" must not have GITHUB_TOKEN in its env — privilege separation (§20/§21)`);
  }
  const publishingSteps = steps.filter((s) => typeof s.run === "string" && s.run.includes("publish-github-result.mjs"));
  if (publishingSteps.length === 0) err("no publishing step found (expected a step invoking publish-github-result.mjs)");
  for (const s of publishingSteps) {
    if (!s.env || s.env.GITHUB_TOKEN === undefined) err(`publishing step "${s.name}" must have GITHUB_TOKEN in its env`);
  }

  // §1.2/§24: no deploy action, no git commit/push, no gh pr create.
  for (const s of steps) {
    if (typeof s.uses === "string" && DEPLOY_ACTION_NAME_HINTS.some((hint) => s.uses.includes(hint))) err(`step "${s.name ?? s.uses}" uses what looks like a deploy action: ${s.uses}`);
  }
  if (/\bgit\s+push\b/.test(raw)) err('workflow text contains "git push"');
  if (/\bgit\s+commit\b/.test(raw)) err('workflow text contains "git commit"');
  if (/\bgh\s+pr\s+create\b/.test(raw)) err('workflow text contains "gh pr create"');
  if (/\bworkflow_dispatch\b/.test(raw) && onKeys.includes("workflow_dispatch")) err("workflow_dispatch must not be a trigger for this workflow (issue events only)");

  // §32: artifact naming never derived from issue content (title/body).
  const uploadSteps = steps.filter((s) => typeof s.uses === "string" && s.uses.startsWith("actions/upload-artifact"));
  for (const s of uploadSteps) {
    const name = s.with?.name ?? "";
    if (/issue\.title|issue\.body/.test(name)) err(`artifact name for step "${s.name}" is derived from issue title/body`);
  }

  return { errors };
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const { errors } = validateIntakeWorkflow();
  if (errors.length) {
    console.log(`${errors.length} error(s):`);
    for (const e of errors) console.log(`  ERROR ${e}`);
    process.exit(1);
  }
  console.log(`OK — ${WORKFLOW_PATH} passes all static security checks.`);
}

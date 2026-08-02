// GitHub orchestration constants (PHASE_006.md §10, §12, §13). Kept
// separate from scripts/intake/constants.mjs (the form/manifest
// contract) — this file is about the GitHub-facing publishing layer
// Phase 6 adds, not the local processing pipeline Phase 2-5 already own.
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const MAINTAINERS_TOML = join(ROOT, "data/maintainers.toml");

// §10.1 — the report's own stable marker, already defined for the local
// report renderer (scripts/intake/constants.mjs REPORT_MARKER). Re-export
// under this module too so every github/* file has one obvious import.
export { REPORT_MARKER } from "../constants.mjs";

// §13 — the full label vocabulary. `intakeState` are mutually exclusive
// (§13.2); `alwaysOn` are applied to every valid, unauthorized intake
// (§13.3) and never removed by this workflow. None of these strings may
// ever be a value this repo's canonical authorization vocabulary uses
// (`authorized`, `publishable`, `published`, ...) — §13.4.
export const LABELS = Object.freeze({
  intakeState: Object.freeze({
    triage: "intake:triage",
    invalid: "intake:invalid",
    needs_information: "intake:needs-information",
    possible_duplicate: "intake:possible-duplicate",
    security_review_required: "intake:security-review",
  }),
  preflightComplete: "intake:preflight-complete",
  alwaysOn: Object.freeze(["authorization:pending-owner", "publication:blocked"]),
});

export const FORBIDDEN_LABEL_SUBSTRINGS = Object.freeze(["approved", "verified", "confirmed", "authorized", "publish", "corroborated", "guilty"]);

// §12.1 — no login string is ever hardcoded anywhere else under
// scripts/intake/github/. A missing/malformed config fails closed
// (returns null) rather than falling back to a guessed default.
export function readCanonicalOwnerLogin(tomlPath = MAINTAINERS_TOML) {
  let text;
  try {
    text = readFileSync(tomlPath, "utf8");
  } catch {
    return null;
  }
  const match = text.match(/^\s*review_owner_github\s*=\s*"([^"]+)"\s*$/m);
  return match ? match[1] : null;
}

// §7.1 — workflow-context URL cap, distinct from (and smaller than)
// Phase 4's own MAX_URLS_PREFLIGHTED default, since a live Actions run
// additionally has to fit inside the job's overall timeout-minutes.
export const WORKFLOW_MAX_URLS_PREFLIGHTED = 10;

// §10.5 — GitHub's own issue-comment body limit is 65536 bytes; this
// project uses a smaller, safer threshold so there's real headroom for
// the condensed-report fallback text itself.
export const MAX_COMMENT_BODY_BYTES = 50 * 1024;

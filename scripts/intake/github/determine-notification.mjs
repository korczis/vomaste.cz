// Owner notification policy (PHASE_006.md §12.2, §12.3, §12.4). Ping
// state is derived from the issue's CURRENT (pre-sync) labels rather
// than a separate stored history — the intake-state label a previous run
// already applied IS the prior state, so no new persistence layer is
// needed (a deliberate, documented simplification per §12.3's own escape
// clause: "pokud implementace neumí spolehlivě sledovat předchozí stav,
// zvol jednodušší bezpečnou politiku a dokumentuj omezení" — this one
// can and does track it, just via the labels already being synced).
import { LABELS } from "./constants.mjs";

// Reads whichever single intake:* state label (if any) is currently on
// the issue — the label sync module already guarantees these are
// mutually exclusive, so at most one should ever be present.
export function previousIntakeStatusFromLabels(currentLabels) {
  const byLabel = Object.fromEntries(Object.entries(LABELS.intakeState).map(([status, label]) => [label, status]));
  for (const label of currentLabels) if (byLabel[label]) return byLabel[label];
  return null;
}

// §12.2's base gate: only these two statuses are ever ping-worthy at
// all. §12.3 anti-spam layered on top: ping only on the FIRST time this
// run's new status becomes one of them (not on every rerun that stays in
// the same state) — this is a deliberate generalization of §12.3's two
// worked examples ("první validní processing", "needs-information →
// triage") into one consistent rule: any transition INTO triage or INTO
// security_review_required from a genuinely different prior state (or no
// prior state at all) pings; staying in the same state across a rerun or
// an ordinary edit never pings again.
export function shouldPingOwner({ previousIntakeStatus, newIntakeStatus }) {
  if (newIntakeStatus === "security_review_required") return previousIntakeStatus !== "security_review_required";
  if (newIntakeStatus === "triage") return previousIntakeStatus !== "triage";
  return false;
}

// §12.4 — the only mention this workflow ever writes as a LIVE
// (non-fenced) `@login` is the canonical owner, and only when a ping is
// actually warranted. Every other mention that could appear anywhere in
// a report comes from submitted text, which render-intake-report.mjs
// already keeps inside a fenced code block (Phase 2) — this function
// never touches or repeats submitted text.
export function buildOwnerPingLine(ownerLogin) {
  if (!ownerLogin) return null;
  return `@${ownerLogin} — tento podnět čeká na vaše posouzení.`;
}

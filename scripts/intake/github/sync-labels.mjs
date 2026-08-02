// Label state projection and synchronization (PHASE_006.md §13, §13.5,
// §14 Varianta A). Labels are a PROJECTION of the current manifest's
// workflow state, never the source of truth (§13.1) — this module only
// ever computes "what should the label set look like right now" and
// reconciles it against whatever labels already exist, touching nothing
// unrelated.
import { LABELS } from "./constants.mjs";

const ALL_WORKFLOW_OWNED_LABELS = Object.freeze([...Object.values(LABELS.intakeState), LABELS.preflightComplete, ...LABELS.alwaysOn]);

// §15.2 — an invalid submission never gets authorization:pending-owner
// or publication:blocked "on top of" invalid; it gets ONLY intake:invalid
// until it becomes valid on a later edit.
export function desiredLabelsForStatus(intakeStatus, { preflightComplete = false } = {}) {
  if (intakeStatus === "invalid") return [LABELS.intakeState.invalid];
  const stateLabel = LABELS.intakeState[intakeStatus];
  if (!stateLabel) throw new Error(`sync-labels: unrecognized intake status "${intakeStatus}"`);
  const desired = [stateLabel, ...LABELS.alwaysOn];
  if (preflightComplete) desired.push(LABELS.preflightComplete);
  return desired;
}

// Returns { toAdd, toRemove, preservedUnrelated }. Pure computation —
// callers pass the result to actually mutate labels via the adapter.
export function planLabelSync(currentLabels, desiredLabels) {
  const desiredSet = new Set(desiredLabels);
  const currentSet = new Set(currentLabels);
  const toAdd = desiredLabels.filter((l) => !currentSet.has(l));
  // Remove only workflow-owned labels that are current but no longer
  // desired — never an unrelated (non-workflow) label, even if it
  // happens to share a namespace-looking prefix.
  const toRemove = currentLabels.filter((l) => ALL_WORKFLOW_OWNED_LABELS.includes(l) && !desiredSet.has(l));
  const preservedUnrelated = currentLabels.filter((l) => !ALL_WORKFLOW_OWNED_LABELS.includes(l));
  return { toAdd, toRemove, preservedUnrelated };
}

// §14 Varianta A: a missing repository label degrades this ONE label
// application to `partial`, with a diagnostic — it never aborts the
// whole sync (an unrelated missing label must not block e.g. the
// removal of a stale state label) and never fabricates a repository
// label via automation (§14: label bootstrap stays a separate, human-run
// step — see docs/intake/github-labels.md).
export async function syncLabels(adapter, intakeStatus, { preflightComplete = false } = {}) {
  const current = await adapter.listLabels();
  const desired = desiredLabelsForStatus(intakeStatus, { preflightComplete });
  const { toAdd, toRemove, preservedUnrelated } = planLabelSync(current, desired);

  const missingRepoLabels = [];
  if (toAdd.length > 0) {
    try {
      await adapter.addLabels(toAdd);
    } catch (err) {
      if (err.code === "label_not_found" && Array.isArray(err.missingLabels)) {
        missingRepoLabels.push(...err.missingLabels);
      } else {
        throw err;
      }
    }
  }
  for (const label of toRemove) {
    await adapter.removeLabel(label);
  }

  return {
    status: missingRepoLabels.length > 0 ? "partial" : "success",
    added: toAdd.filter((l) => !missingRepoLabels.includes(l)),
    removed: toRemove,
    preservedUnrelated,
    missingRepoLabels,
  };
}

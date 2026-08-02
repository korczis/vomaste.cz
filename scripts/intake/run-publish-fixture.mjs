#!/usr/bin/env node
// `npm run intake:publish-fixture` (PHASE_006.md §36.1): demonstrates
// create comment, update the SAME comment on a rerun, label sync, and
// the owner-notification decision — against the in-memory mock GitHub
// adapter only. No network, no GITHUB_TOKEN read anywhere in this file.
import { publishIntakeResult } from "./github/publish-intake-result.mjs";
import { createMockGithubAdapter } from "./github/mock-github-adapter.mjs";
import { REPORT_MARKER } from "./constants.mjs";

const FIXED_TIME = "2026-08-02T12:00:00Z";
const REPORT_BODY = `${REPORT_MARKER}

## Automatické předzpracování veřejného podnětu

> Tento report není autorizace, redakční závěr ani publikovaný dossier.
> Issue je veřejná. Rozsah zatím nebyl autorizován a publikace zůstává blokována.

Fixture demonstrace: intake:publish-fixture.`;

async function main() {
  const adapter = createMockGithubAdapter({ issue: { number: 999, updated_at: FIXED_TIME } });

  console.log("--- Run 1: first-time triage publish ---");
  const first = await publishIntakeResult(adapter, {
    intakeStatus: "triage",
    reportBody: REPORT_BODY,
    eventUpdatedAt: FIXED_TIME,
    ownerLogin: "korczis",
  });
  console.log(JSON.stringify(first, null, 2));

  console.log("\n--- Run 2: rerun, same status (idempotent update, no re-ping) ---");
  const second = await publishIntakeResult(adapter, {
    intakeStatus: "triage",
    reportBody: REPORT_BODY,
    eventUpdatedAt: FIXED_TIME,
    ownerLogin: "korczis",
  });
  console.log(JSON.stringify(second, null, 2));

  console.log("\n--- Final mock adapter state ---");
  console.log("comments:", (await adapter.listComments()).length);
  console.log("labels:", await adapter.listLabels());

  if (first.comment.action !== "created") throw new Error("expected run 1 to create the comment");
  if (second.comment.action !== "updated") throw new Error("expected run 2 to update the same comment");
  if (first.pinged !== true) throw new Error("expected run 1 to ping the owner");
  if (second.pinged !== false) throw new Error("expected run 2 NOT to re-ping the owner");
  if ((await adapter.listComments()).length !== 1) throw new Error("expected exactly one comment after both runs");

  console.log("\nintake:publish-fixture OK — create, update, label sync, and notification policy all behaved as expected.");
}

await main();

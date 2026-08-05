# `data/staging/prismatic/<run-id>/`

Sanitized, schema-valid candidate records produced by `prismatic:run`
(not yet implemented — see
[`docs/adr/prismatic-platform-integration.md`](../../../docs/adr/prismatic-platform-integration.md)).
Each record here already passed `scripts/prismatic/lib/contract.mjs`
validation against
[`schemas/prismatic/export-contract.schema.json`](../../../schemas/prismatic/export-contract.schema.json).

**This is Git-tracked on purpose** — unlike `var/prismatic-runs/` (raw,
local, gitignored), staging candidates are reviewable and safe to commit:
no raw provider payload, no credentials, already contract-shaped.

**Not canonical.** Nothing here is rendered by the public site, cited as
a source, or treated as a finding. A candidate becomes canonical only
after `prismatic:promote` writes it into `data/dossiers/**` from an
explicit `data/review/prismatic/<run-id>.json` decision — see that
directory's own README for the review step.

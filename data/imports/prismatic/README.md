# `data/imports/prismatic/<run-id>.json`

Immutable import manifest / receipt, written once `prismatic:promote`
(not yet implemented) finishes writing accepted candidates into
`data/dossiers/**`. Never edited after the fact — a correction is a new
run's manifest, not a rewrite of an old one, matching this repo's other
append-only records (the `AGENTS.md` authorization log,
`data/dossiers/<slug>/updates/*.json`).

Expected fields once implemented: `run_id`, `vomaste_commit`,
`prismatic_commit`, `contract_version`, `reviewed_by`, `reviewed_at`,
per-record-type promoted/rejected/deferred counts, and the evidence hash
of every promoted record — see Fáze 2.8 of
[`docs/missions/2026-08-05-prismatic-platform-integration-master-prompt.md`](../../../docs/missions/2026-08-05-prismatic-platform-integration-master-prompt.md).

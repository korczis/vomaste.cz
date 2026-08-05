# `data/review/prismatic/<run-id>.json`

Explicit accept/reject/defer decisions over a run's staging candidates
(`data/staging/prismatic/<run-id>/`). Written by a human reviewer (or an
agent recording the reviewer's explicit decision), never generated
automatically from a discovery run — see "Review model" in `AGENTS.md`,
"Standing scope authorization and publication gates".

Each decision must record the reviewer, the reason, and enough evidence
reference to reproduce the call later. A candidate without a
corresponding accept decision here is never promoted — `prismatic:promote`
(not yet implemented) reads only from this file, never directly from
staging.

Batch-level approval of a coherent set of candidates is allowed; a
generated diff must still exist for the batch before it's approved
(publication gate 8 in `AGENTS.md`: "Reviewable change").
